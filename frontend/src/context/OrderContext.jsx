/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, useRef } from 'react';
import * as orderService from '../services/orderService';

const OrderContext = createContext(null);

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState(() => orderService.initializeOrders());
  
  // Guard against double-creation in StrictMode
  const creatingRef = useRef(false);

  const createNewOrder = useCallback((orderData) => {
    // Prevent duplicate order creation from StrictMode double-invoke
    if (creatingRef.current) return null;
    creatingRef.current = true;

    let result;
    setOrders((prev) => {
      const { updatedOrders, newOrder } = orderService.createOrder(prev, orderData);
      result = newOrder;
      return updatedOrders;
    });

    // Reset guard after a tick
    setTimeout(() => {
      creatingRef.current = false;
    }, 100);

    return result;
  }, []);

  const updateStatus = useCallback((orderId, newStatus) => {
    setOrders((prev) => orderService.updateOrderStatus(prev, orderId, newStatus));
  }, []);

  const cancelOrder = useCallback((orderId) => {
    setOrders((prev) => orderService.cancelOrder(prev, orderId));
  }, []);

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
