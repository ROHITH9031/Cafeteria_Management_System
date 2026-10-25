/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import * as orderService from '../services/orderService';
import { apiRequest, authHeaders } from '../services/apiClient';
import { useAuth } from './AuthContext';

const OrderContext = createContext(null);

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState(() => orderService.initializeOrders());
  const [orderError, setOrderError] = useState('');
  const { isAuthenticated, logout } = useAuth();
  
  // Guard against double-creation in StrictMode
  const creatingRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    apiRequest('/orders', { headers: authHeaders() })
      .then(({ orders: serverOrders }) => setOrders(serverOrders.map(orderService.normalizeOrder)))
      .catch((error) => {
        console.error('[OrderContext] Failed to load orders:', error);
        if (error.message === 'Authentication required' || error.message === 'Invalid or expired token') {
          logout();
        }
      });
  }, [isAuthenticated, logout]);

  const createNewOrder = useCallback(async (orderData) => {
    // Prevent duplicate order creation from StrictMode double-invoke
    if (creatingRef.current) return null;
    creatingRef.current = true;

    try {
      setOrderError('');
      const response = await apiRequest('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      });
      if (!response.persisted || !response.order?._id) {
        throw new Error('The server did not confirm that the order was saved. Please try again.');
      }
      const { order } = response;
      const newOrder = orderService.normalizeOrder(order);
      setOrders((prev) => [newOrder, ...prev.filter((item) => item.id !== newOrder.id)]);
      return newOrder;
    } catch (error) {
      console.error('[OrderContext] Failed to create order:', error);
      setOrderError(error.message);
      throw error;
    } finally {
      creatingRef.current = false;
    }
  }, []);

  const clearOrderError = useCallback(() => setOrderError(''), []);

  const updateStatus = useCallback(async (orderId, newStatus) => {
    try {
      const { order } = await apiRequest(`/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });
      const updated = orderService.normalizeOrder(order);
      setOrders((prev) => prev.map((item) => item.id === updated.id ? updated : item));
    } catch (error) {
      console.error('[OrderContext] Failed to update order status:', error);
      if (error.message === 'Authentication required' || error.message === 'Invalid or expired token') {
        logout();
      }
    }
  }, [logout]);

  const cancelOrder = useCallback(async (orderId) => {
    await updateStatus(orderId, orderService.ORDER_STATUSES.CANCELLED);
  }, [updateStatus]);

  const getOrderById = useCallback((orderId) => {
    return orders.find((o) => o.id === orderId);
  }, [orders]);

  const getTodayOrders = useCallback(() => {
    return orderService.getTodayOrders(orders);
  }, [orders]);

  const value = {
    orders,
    createNewOrder,
    updateStatus,
    cancelOrder,
    getOrderById,
    getTodayOrders,
    orderError,
    clearOrderError,
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
}

export default OrderContext;
