import { Router } from 'express';
import Order from '../models/Order.js';
import MenuItem from '../models/MenuItem.js';
import { optionalAuth, requireAdmin, requireAuth } from '../middleware/auth.js';
import { generateToken } from '../utils/token.js';

const router = Router();
const statuses = ['Pending', 'Preparing', 'Ready', 'Completed', 'Delivered', 'Cancelled'];

router.post('/', optionalAuth, async (req, res) => {
  const { customerName, studentId, contactInfo, orderType = 'Dine-in', items } = req.body;
  if (!customerName?.trim() || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Customer name and at least one item are required' });
  }
  if (!['Dine-in', 'Parcel'].includes(orderType)) return res.status(400).json({ message: 'Invalid order type' });

  const ids = items.map((item) => item.id);
  const menuItems = await MenuItem.find({ itemId: { $in: ids }, available: true });
  const menuById = new Map(menuItems.map((item) => [item.itemId, item]));
  const normalizedItems = items.map((item) => {
    const menuItem = menuById.get(item.id);
    if (!menuItem) throw Object.assign(new Error(`Menu item unavailable: ${item.id}`), { status: 400 });
    const quantity = Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 50) {
      throw Object.assign(new Error('Item quantity must be between 1 and 50'), { status: 400 });
    }
    return { itemId: menuItem.itemId, name: menuItem.name, price: menuItem.price, quantity };
  });
  const totalAmount = normalizedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const order = new Order({
    customer: req.user?.sub,
    customerName: customerName.trim(),
    studentId,
    contactInfo,
    items: normalizedItems,
    totalAmount,
    token: generateToken(),
    orderType,
  });
  await order.save();
  return res.status(201).json({ order, persisted: true });
});

router.get('/mine', requireAuth, async (req, res) => {
  res.json({ orders: await Order.find({ customer: req.user.sub }).sort({ createdAt: -1 }) });
});

router.get('/', requireAuth, requireAdmin, async (req, res) => {
  const filter = req.query.status && statuses.includes(req.query.status) ? { status: req.query.status } : {};
  res.json({ orders: await Order.find(filter).sort({ createdAt: -1 }) });
});

router.get('/:orderId', async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  return res.json({ order });
});

router.patch('/:orderId/status', requireAuth, requireAdmin, async (req, res) => {
  if (!statuses.includes(req.body.status)) return res.status(400).json({ message: 'Invalid order status' });
  const order = await Order.findByIdAndUpdate(req.params.orderId, { status: req.body.status }, { new: true, runValidators: true });
  if (!order) return res.status(404).json({ message: 'Order not found' });
  return res.json({ order });
});

export default router;
