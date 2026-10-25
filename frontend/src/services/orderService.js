/**
 * Order Service — SRKR Cafeteria
 * 
 * Abstracts order data operations. Currently uses localStorage.
 * In production, these functions will call the backend API.
 */

import { getStoredOrders, setStoredOrders } from './storageService';
import { generateToken, generateOrderId } from '../utils/tokenGenerator';

/** Valid order statuses */
export const ORDER_STATUSES = {
  PENDING: 'Pending',
  PREPARING: 'Preparing',
  READY: 'Ready',
  COMPLETED: 'Completed',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

/** Status colors for consistent visual styling */
export const STATUS_COLORS = {
  [ORDER_STATUSES.PENDING]: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300', dot: 'bg-amber-500' },
  [ORDER_STATUSES.PREPARING]: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300', dot: 'bg-blue-500' },
  [ORDER_STATUSES.READY]: { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300', dot: 'bg-emerald-500' },
  [ORDER_STATUSES.COMPLETED]: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300', dot: 'bg-gray-500' },
  [ORDER_STATUSES.DELIVERED]: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300', dot: 'bg-purple-500' },
  [ORDER_STATUSES.CANCELLED]: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300', dot: 'bg-red-500' },
};

/** Status progression order */
export const STATUS_STEPS = [
  ORDER_STATUSES.PENDING,
  ORDER_STATUSES.PREPARING,
  ORDER_STATUSES.READY,
  ORDER_STATUSES.COMPLETED,
  ORDER_STATUSES.DELIVERED,
];

/**
 * Initialize orders from localStorage.
 * @returns {Array}
 */
export function initializeOrders() {
  return getStoredOrders();
}

/**
 * Get all orders.
 * @param {Array} orders
 * @returns {Array}
 */
export function getOrders(orders) {
  return orders || [];
}

/**
 * Get a single order by ID.
 * @param {Array} orders
 * @param {string} orderId
 * @returns {Object|undefined}
 */
export function getOrderById(orders, orderId) {
  return orders.find((o) => o.id === orderId);
}

/**
 * Get orders for today.
 * @param {Array} orders
 * @returns {Array}
 */
export function getTodayOrders(orders) {
  const today = new Date().toDateString();
  return orders.filter((o) => new Date(o.createdAt).toDateString() === today);
}

/**
 * Create a new order.
 * @param {Array} orders
 * @param {Object} orderData - { items, customerName, studentId, contactInfo }
 * @returns {{ updatedOrders: Array, newOrder: Object }}
 */
export function createOrder(orders, orderData) {
  const newOrder = {
    id: generateOrderId(),
    token: generateToken(),
    customerName: orderData.customerName,
    studentId: orderData.studentId || '',
    contactInfo: orderData.contactInfo || '',
    items: orderData.items.map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    })),
    totalAmount: orderData.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    ),
    status: ORDER_STATUSES.PENDING,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const updatedOrders = [newOrder, ...orders];
  setStoredOrders(updatedOrders);
  return { updatedOrders, newOrder };
}

/**
 * Update the status of an order.
 * @param {Array} orders
 * @param {string} orderId
 * @param {string} newStatus
 * @returns {Array} Updated orders
 */
export function updateOrderStatus(orders, orderId, newStatus) {
  const updated = orders.map((order) =>
    order.id === orderId
      ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
      : order
  );
  setStoredOrders(updated);
  return updated;
}

/**
 * Cancel an order (only if Pending).
 * @param {Array} orders
 * @param {string} orderId
 * @returns {Array}
 */
export function cancelOrder(orders, orderId) {
  return updateOrderStatus(orders, orderId, ORDER_STATUSES.CANCELLED);
}
