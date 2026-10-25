import { Router } from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import MenuItem from '../models/MenuItem.js';
import { optionalAuth, requireAdmin, requireAuth } from '../middleware/auth.js';
import { generateToken } from '../utils/token.js';
import { sendApiError } from '../middleware/errors.js';

const router = Router();
const statuses = ['Pending', 'Preparing', 'Ready', 'Completed', 'Delivered', 'Cancelled'];
const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 100;
const orderResponseFields = 'token customer customerName studentId contactInfo orderType items totalAmount status createdAt updatedAt';

function parsePageOptions(req, res) {
  const requestedLimit = req.query.limit === undefined ? DEFAULT_PAGE_SIZE : Number(req.query.limit);
  if (!Number.isInteger(requestedLimit) || requestedLimit < 1) {
    sendApiError(res, 400, 'The limit must be a positive whole number');
    return null;
  }

  const limit = Math.min(requestedLimit, MAX_PAGE_SIZE);
  let cursorFilter = {};
  if (req.query.cursor !== undefined) {
    if (typeof req.query.cursor !== 'string') {
      sendApiError(res, 400, 'Invalid pagination cursor');
      return null;
    }
    const match = req.query.cursor.match(/^(\d+)\.([a-f\d]{24})$/i);
    const timestamp = match ? Number(match[1]) : NaN;
    if (!match || !Number.isSafeInteger(timestamp) || Number.isNaN(new Date(timestamp).getTime())) {
      sendApiError(res, 400, 'Invalid pagination cursor');
      return null;
    }
    const createdAt = new Date(timestamp);
    const id = new mongoose.Types.ObjectId(match[2]);
    cursorFilter = {
      $or: [
        { createdAt: { $lt: createdAt } },
        { createdAt, _id: { $lt: id } },
      ],
    };
  }
  return { limit, cursorFilter };
}

function parseDateFilter(req, res) {
  const from = req.query.from;
  const to = req.query.to;
  if (from !== undefined && (typeof from !== 'string' || Number.isNaN(Date.parse(`${from}T00:00:00.000Z`)))) {
    sendApiError(res, 400, 'Invalid start date');
    return null;
  }
  if (to !== undefined && (typeof to !== 'string' || Number.isNaN(Date.parse(`${to}T00:00:00.000Z`)))) {
    sendApiError(res, 400, 'Invalid end date');
    return null;
  }
  const dateFilter = {};
  if (from) dateFilter.$gte = new Date(`${from}T00:00:00.000Z`);
  if (to) {
    const end = new Date(`${to}T00:00:00.000Z`);
    end.setUTCDate(end.getUTCDate() + 1);
    dateFilter.$lt = end;
  }
  if (from && to && from > to) {
    sendApiError(res, 400, 'Start date must not be after end date');
    return null;
  }
  return dateFilter;
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function getOrderPage(filter, limit, cursorFilter) {
  const records = await Order.find(cursorFilter.$or ? { $and: [filter, cursorFilter] } : filter)
    .select(orderResponseFields)
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit + 1)
    .lean();
  const hasMore = records.length > limit;
  const orders = hasMore ? records.slice(0, limit) : records;
  const lastOrder = orders.at(-1);
  const nextCursor = hasMore && lastOrder
    ? `${new Date(lastOrder.createdAt).getTime()}.${lastOrder._id}`
    : null;
  return { orders, nextCursor, hasMore };
}

async function cancelPendingOrder(orderId) {
  const order = await Order.findOneAndUpdate(
    { _id: orderId, status: 'Pending' },
    { $set: { status: 'Cancelled' } },
    { new: true, runValidators: true }
  ).select('+stockDeducted').lean();
  if (order?.stockDeducted) {
    await MenuItem.bulkWrite(order.items.map((item) => ({
      updateOne: { filter: { itemId: item.itemId }, update: { $inc: { stock: item.quantity } } },
    })));
  }
  return order;
}

function emitStatusUpdate(req, order) {
  const io = req.app.get('io');
  if (!io) return;
  io.to(`order:${order._id}`).emit('order:status_updated', order);
  io.to('admin').emit('order:status_updated', order);
}

router.post('/quote', optionalAuth, async (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0 || items.length > 100) {
    return sendApiError(res, 400, 'Provide at least one menu item to quote');
  }
  const quantities = new Map();
  for (const item of items) {
    if (typeof item.id !== 'string' || !item.id.trim()) return sendApiError(res, 400, 'Each item needs a menu item ID');
    const quantity = Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 50) return sendApiError(res, 400, 'Item quantity must be between 1 and 50');
    quantities.set(item.id, (quantities.get(item.id) || 0) + quantity);
  }
  if ([...quantities.values()].some((quantity) => quantity > 50)) return sendApiError(res, 400, 'Combined item quantity cannot exceed 50');

  const quotedItems = [];
  const unavailable = [];
  for (const [itemId, quantity] of quantities) {
    const item = await MenuItem.findOne({ itemId }).select('itemId name price stock available').lean();
    if (!item || !item.available || item.stock < quantity) {
      unavailable.push({ itemId, name: item?.name || 'Menu item', requested: quantity, available: item?.stock || 0 });
      continue;
    }
    quotedItems.push({ itemId, name: item.name, price: item.price, quantity, stock: item.stock });
  }
  if (unavailable.length) return sendApiError(res, 409, 'Some items are unavailable or have insufficient stock', 'Conflict', unavailable);
  return res.json({ items: quotedItems, totalAmount: quotedItems.reduce((sum, item) => sum + item.price * item.quantity, 0) });
});

router.post('/', optionalAuth, async (req, res) => {
  const { customerName, studentId, contactInfo, orderType = 'Dine-in', items } = req.body;
  if (!customerName?.trim() || !Array.isArray(items) || items.length === 0) {
    return sendApiError(res, 400, 'Customer name and at least one item are required');
  }
  if (!['Dine-in', 'Parcel'].includes(orderType)) return sendApiError(res, 400, 'Invalid order type');
  if (!contactInfo?.trim() || !/^(?:\+91[\s-]?)?[6-9]\d{9}$/.test(contactInfo.trim().replace(/[\s-]/g, ''))) {
    return sendApiError(res, 400, 'Enter a valid 10-digit Indian mobile number');
  }

  const requested = new Map();
  for (const item of items) {
    if (typeof item.id !== 'string' || !item.id.trim()) return sendApiError(res, 400, 'Each order item needs a menu item ID');
    const quantity = Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 50) {
      return sendApiError(res, 400, 'Item quantity must be between 1 and 50');
    }
    requested.set(item.id, (requested.get(item.id) || 0) + quantity);
  }
  if ([...requested.values()].some((quantity) => quantity > 50)) {
    return sendApiError(res, 400, 'Combined item quantity cannot exceed 50');
  }

  const normalizedItems = [];
  const reservations = [];
  const restoreReservedStock = async () => {
    if (reservations.length === 0) return;
    await MenuItem.bulkWrite(reservations.map(({ itemId, quantity }) => ({
      updateOne: { filter: { itemId }, update: { $inc: { stock: quantity } } },
    })));
    reservations.length = 0;
  };

  try {
    for (const [itemId, quantity] of requested) {
      const menuItem = await MenuItem.findOneAndUpdate(
        { itemId, available: true, stock: { $gte: quantity } },
        { $inc: { stock: -quantity } },
        { new: true, runValidators: true }
      ).select('itemId name price stock').lean();
      if (!menuItem) {
        await restoreReservedStock();
        return sendApiError(res, 409, `Not enough stock is available for item ${itemId}`);
      }
      reservations.push({ itemId, quantity });
      normalizedItems.push({ itemId, name: menuItem.name, price: menuItem.price, quantity });
    }
  } catch (error) {
    await restoreReservedStock();
    throw error;
  }

  const totalAmount = normalizedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const order = new Order({
    customer: req.user?.sub,
    customerName: customerName.trim(),
    studentId,
    contactInfo,
    items: normalizedItems,
    totalAmount,
    stockDeducted: true,
    token: generateToken(),
    orderType,
  });
  try {
    await order.save();
    reservations.length = 0;
  } catch (error) {
    await restoreReservedStock();
    throw error;
  }

  const io = req.app.get('io');
  if (io) {
    io.to('admin').emit('order:created', order);
  }

  return res.status(201).json({ order, persisted: true });
});

router.get('/mine', requireAuth, async (req, res) => {
  const pageOptions = parsePageOptions(req, res);
  if (!pageOptions) return;
  const dateFilter = parseDateFilter(req, res);
  if (!dateFilter) return;
  const filter = { customer: req.user.sub };
  if (Object.keys(dateFilter).length) filter.createdAt = dateFilter;
  const page = await getOrderPage(filter, pageOptions.limit, pageOptions.cursorFilter);
  return res.json({ ...page, totalCount: await Order.countDocuments(filter) });
});

router.get('/reports', requireAuth, requireAdmin, async (req, res) => {
  const dateFilter = parseDateFilter(req, res);
  if (!dateFilter) return;
  const match = Object.keys(dateFilter).length ? { createdAt: dateFilter } : {};
  const [statusGroups, summary, popularItems, dailySales] = await Promise.all([
    Order.aggregate([
      { $match: match },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Order.aggregate([
      { $match: { ...match, status: { $ne: 'Cancelled' } } },
      { $group: {
        _id: null,
        orderCount: { $sum: 1 },
        revenue: { $sum: '$totalAmount' },
        averageOrderValue: { $avg: '$totalAmount' },
      } },
    ]),
    Order.aggregate([
      { $match: { ...match, status: { $ne: 'Cancelled' } } },
      { $unwind: '$items' },
      { $group: {
        _id: '$items.name',
        quantity: { $sum: '$items.quantity' },
        revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
      } },
      { $sort: { quantity: -1, _id: 1 } },
      { $limit: 10 },
      { $project: { _id: 0, name: '$_id', quantity: 1, revenue: 1 } },
    ]),
    Order.aggregate([
      { $match: { ...match, status: { $ne: 'Cancelled' } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'UTC' } },
        orderCount: { $sum: 1 },
        revenue: { $sum: '$totalAmount' },
      } },
      { $sort: { _id: 1 } },
    ]),
  ]);
  const counts = Object.fromEntries(statusGroups.map(({ _id, count }) => [_id, count]));
  return res.json({
    from: req.query.from || null,
    to: req.query.to || null,
    statusCounts: counts,
    summary: summary[0] || { orderCount: 0, revenue: 0, averageOrderValue: 0 },
    popularItems,
    dailySales: dailySales.map(({ _id, ...entry }) => ({ date: _id, ...entry })),
  });
});

router.get('/', requireAuth, requireAdmin, async (req, res) => {
  const { status } = req.query;
  if (status !== undefined && status !== 'All' && (typeof status !== 'string' || !statuses.includes(status))) {
    return sendApiError(res, 400, 'Invalid order status filter');
  }
  const pageOptions = parsePageOptions(req, res);
  if (!pageOptions) return;
  const dateFilter = parseDateFilter(req, res);
  if (!dateFilter) return;
  const filter = {};
  if (status && status !== 'All') filter.status = status;
  if (Object.keys(dateFilter).length) filter.createdAt = dateFilter;
  if (req.query.q !== undefined) {
    if (typeof req.query.q !== 'string' || req.query.q.length > 100) return sendApiError(res, 400, 'Search must be under 100 characters');
    const regex = new RegExp(escapeRegex(req.query.q.trim()), 'i');
    if (req.query.q.trim()) filter.$or = [
      { token: regex },
      { customerName: regex },
      { contactInfo: regex },
      { studentId: regex },
    ];
    if (mongoose.isValidObjectId(req.query.q.trim())) filter.$or.push({ _id: req.query.q.trim() });
  }
  const [page, totalCount, activeCount] = await Promise.all([
    getOrderPage(filter, pageOptions.limit, pageOptions.cursorFilter),
    Order.countDocuments(filter),
    Order.countDocuments({ $and: [filter, { status: { $in: ['Pending', 'Preparing', 'Ready'] } }] }),
  ]);
  return res.json({ ...page, totalCount, activeCount });
});

router.patch('/bulk/status', requireAuth, requireAdmin, async (req, res) => {
  const { orderIds, status } = req.body;
  if (!Array.isArray(orderIds) || orderIds.length < 1 || orderIds.length > 100
    || orderIds.some((id) => typeof id !== 'string' || !mongoose.isValidObjectId(id))) {
    return sendApiError(res, 400, 'Provide between 1 and 100 valid order IDs');
  }
  if (!statuses.includes(status)) return sendApiError(res, 400, 'Invalid order status');

  const ids = [...new Set(orderIds)];
  let updatedOrders = [];
  if (status === 'Cancelled') {
    for (const id of ids) {
      const order = await cancelPendingOrder(id);
      if (!order) continue;
      updatedOrders.push(order);
    }
  } else {
    const result = await Order.updateMany({ _id: { $in: ids } }, { $set: { status } }, { runValidators: true });
    updatedOrders = await Order.find({ _id: { $in: ids } }).select(orderResponseFields).lean();
    if (result.modifiedCount === 0) updatedOrders = [];
  }

  updatedOrders.forEach((order) => emitStatusUpdate(req, order));
  return res.json({ updatedCount: updatedOrders.length, orders: updatedOrders });
});

router.get('/:orderId', async (req, res) => {
  const order = await Order.findById(req.params.orderId).lean();
  if (!order) return sendApiError(res, 404, 'Order not found');
  return res.json({ order });
});

router.patch('/:orderId/cancel', optionalAuth, async (req, res) => {
  const current = await Order.findById(req.params.orderId).select('customer').lean();
  if (!current) return sendApiError(res, 404, 'Order not found');
  if (current.customer && req.user?.role !== 'admin' && req.user?.sub !== current.customer.toString()) {
    return sendApiError(res, req.user ? 403 : 401, req.user ? 'You cannot cancel another customer’s order' : 'Authentication required');
  }
  const order = await cancelPendingOrder(req.params.orderId);
  if (!order) {
    const exists = await Order.exists({ _id: req.params.orderId });
    if (!exists) return sendApiError(res, 404, 'Order not found');
    return sendApiError(res, 400, 'Only pending orders can be cancelled');
  }

  emitStatusUpdate(req, order);

  return res.json({ order });
});

router.patch('/:orderId/status', requireAuth, requireAdmin, async (req, res) => {
  if (!statuses.includes(req.body.status)) return sendApiError(res, 400, 'Invalid order status');
  const order = req.body.status === 'Cancelled'
    ? await cancelPendingOrder(req.params.orderId)
    : await Order.findByIdAndUpdate(req.params.orderId, { status: req.body.status }, { new: true, runValidators: true }).lean();
  if (!order) {
    const exists = await Order.exists({ _id: req.params.orderId });
    return exists
      ? sendApiError(res, 400, 'Only pending orders can be cancelled')
      : sendApiError(res, 404, 'Order not found');
  }
  emitStatusUpdate(req, order);

  return res.json({ order });
});

export default router;
