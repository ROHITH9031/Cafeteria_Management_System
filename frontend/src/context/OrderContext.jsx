/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import * as orderService from '../services/orderService';
import { apiRequest, authHeaders } from '../services/apiClient';
import { useAuth } from './AuthContext';
import { socket, joinAdminRoom } from '../services/socketService';

const OrderContext = createContext(null);

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState(() => orderService.initializeOrders());
  const [orderError, setOrderError] = useState('');
  const [socketConnected, setSocketConnected] = useState(() => socket.connected);
  const [hasMoreOrders, setHasMoreOrders] = useState(false);
  const [loadingMoreOrders, setLoadingMoreOrders] = useState(false);
  const [activeOrderCount, setActiveOrderCount] = useState(0);
  const [totalOrderCount, setTotalOrderCount] = useState(0);
  const { isAuthenticated, isAdmin, isCustomer, logout } = useAuth();
  
  // Guard against double-creation in StrictMode
  const creatingRef = useRef(false);
  const pageRef = useRef({ cursor: null, hasMore: false, filters: {}, loading: false, pendingReset: false });
  const loadOrdersRef = useRef(null);

  const loadOrdersPage = useCallback(async ({ reset = false, filters } = {}) => {
    if (!isAdmin && !isCustomer) return;
    if (reset && filters) pageRef.current.filters = { ...filters };
    if (pageRef.current.loading) {
      if (reset) pageRef.current.pendingReset = true;
      return;
    }
    if (!reset && !pageRef.current.hasMore) return;

    pageRef.current.loading = true;
    if (!reset) setLoadingMoreOrders(true);
    const query = new URLSearchParams({ limit: '50' });
    const cursor = reset ? null : pageRef.current.cursor;
    if (cursor) query.set('cursor', cursor);
    const activeFilters = pageRef.current.filters;
    if (isAdmin && activeFilters.status && activeFilters.status !== 'All') query.set('status', activeFilters.status);
    if (isAdmin && activeFilters.q) query.set('q', activeFilters.q);
    if (activeFilters.from) query.set('from', activeFilters.from);
    if (activeFilters.to) query.set('to', activeFilters.to);
    const endpoint = isAdmin ? '/orders' : '/orders/mine';

    try {
      const response = await apiRequest(`${endpoint}?${query}`, { headers: authHeaders() });
      const normalized = (response.orders || []).map(orderService.normalizeOrder);
      pageRef.current.cursor = response.nextCursor;
      pageRef.current.hasMore = Boolean(response.hasMore);
      setHasMoreOrders(pageRef.current.hasMore);
      setTotalOrderCount(response.totalCount || 0);
      if (isAdmin) setActiveOrderCount(response.activeCount || 0);
      setOrders((previous) => {
        const combined = reset ? normalized : [...previous, ...normalized];
        const unique = [...new Map(combined.map((order) => [order.id, order])).values()];
        orderService.setStoredOrders(unique);
        return unique;
      });
    } finally {
      pageRef.current.loading = false;
      setLoadingMoreOrders(false);
      if (pageRef.current.pendingReset) {
        pageRef.current.pendingReset = false;
        queueMicrotask(() => loadOrdersRef.current?.({ reset: true }));
      }
    }
  }, [isAdmin, isCustomer]);
  useEffect(() => {
    loadOrdersRef.current = loadOrdersPage;
  }, [loadOrdersPage]);

  const loadMoreOrders = useCallback(() => loadOrdersPage(), [loadOrdersPage]);
  const reloadOrders = useCallback((filters) => loadOrdersPage({ reset: true, filters }), [loadOrdersPage]);

  // Monitor socket connection state
  useEffect(() => {
    const handleConnect = () => setSocketConnected(true);
    const handleDisconnect = () => setSocketConnected(false);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, []);

  // Listen for real-time WebSocket order events
  useEffect(() => {
    // Listen to order status updates globally (for active customer or admin sessions)
    const handleStatusUpdated = (serverOrder) => {
      if (!serverOrder) return;
      const normalized = orderService.normalizeOrder(serverOrder);
      setOrders((prev) => {
        if (!prev.some((item) => item.id === normalized.id)) return prev;
        const next = prev.map((item) => (item.id === normalized.id ? normalized : item));
        orderService.setStoredOrders(next);
        return next;
      });
      if (isAdmin) loadOrdersPage({ reset: true }).catch(() => {});
    };

    socket.on('order:status_updated', handleStatusUpdated);

    if (isAdmin) {
      joinAdminRoom();

      // Fetch initial orders for admin
      Promise.resolve().then(() => loadOrdersPage({ reset: true }))
        .catch((error) => {
          console.error('[OrderContext] Failed to load orders:', error);
          if (error.message === 'Authentication required' || error.message === 'Invalid or expired token') {
            logout();
          }
        });

      // Real-time listener for newly placed orders
      const handleOrderCreated = (newOrder) => {
        if (!newOrder) return;
        const normalized = orderService.normalizeOrder(newOrder);
        setOrders((prev) => {
          if (pageRef.current.filters.status && pageRef.current.filters.status !== 'All'
            && pageRef.current.filters.status !== normalized.status) return prev;
          if (prev.some((o) => o.id === normalized.id)) return prev;
          const next = [normalized, ...prev];
          orderService.setStoredOrders(next);
          return next;
        });
        loadOrdersPage({ reset: true }).catch(() => {});
      };

      socket.on('order:created', handleOrderCreated);

      // Infrequent backup poll (every 30s) in case socket connection drops temporarily
      const backupPoll = setInterval(() => {
        if (!socket.connected) {
          loadOrdersPage({ reset: true })
            .catch(() => {});
        }
      }, 30000);

      return () => {
        clearInterval(backupPoll);
        socket.off('order:created', handleOrderCreated);
        socket.off('order:status_updated', handleStatusUpdated);
      };
    }

    if (isCustomer) {
      Promise.resolve().then(() => loadOrdersPage({ reset: true }))
        .catch((error) => {
          console.error('[OrderContext] Failed to load customer orders:', error);
        });
    }

    return () => {
      socket.off('order:status_updated', handleStatusUpdated);
    };
  }, [isAdmin, isCustomer, isAuthenticated, logout, loadOrdersPage]);

  const createNewOrder = useCallback(async (orderData) => {
    if (creatingRef.current) return null;
    creatingRef.current = true;

    try {
      setOrderError('');
      const headers = authHeaders();
      const response = await apiRequest('/orders', {
        method: 'POST',
        headers,
        body: JSON.stringify(orderData),
      });

      if (!response.persisted || !response.order?._id) {
        throw new Error('The server did not confirm that the order was saved. Please try again.');
      }

      const newOrder = orderService.normalizeOrder(response.order);
      setOrders((prev) => {
        const updated = [newOrder, ...prev.filter((item) => item.id !== newOrder.id)];
        orderService.setStoredOrders(updated);
        return updated;
      });
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
      setOrders((prev) => {
        const next = prev.map((item) => (item.id === updated.id ? updated : item));
        orderService.setStoredOrders(next);
        return next;
      });
      if (isAdmin) await loadOrdersPage({ reset: true });
      return updated;
    } catch (error) {
      console.error('[OrderContext] Failed to update order status:', error);
      if (error.message === 'Authentication required' || error.message === 'Invalid or expired token') {
        logout();
      }
      throw error;
    }
  }, [isAdmin, loadOrdersPage, logout]);

  const bulkUpdateStatus = useCallback(async (orderIds, newStatus) => {
    const response = await apiRequest('/orders/bulk/status', {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ orderIds, status: newStatus }),
    });
    await loadOrdersPage({ reset: true });
    return response.updatedCount;
  }, [loadOrdersPage]);

  const cancelOrder = useCallback(async (orderId) => {
    try {
      const endpoint = isAdmin ? `/orders/${orderId}/status` : `/orders/${orderId}/cancel`;
      const options = isAdmin
        ? {
            method: 'PATCH',
            headers: authHeaders(),
            body: JSON.stringify({ status: orderService.ORDER_STATUSES.CANCELLED }),
          }
        : {
            method: 'PATCH',
            headers: authHeaders(),
          };

      const { order } = await apiRequest(endpoint, options);
      const updated = orderService.normalizeOrder(order);
      setOrders((prev) => {
        const next = prev.map((item) => (item.id === updated.id ? updated : item));
        orderService.setStoredOrders(next);
        return next;
      });
      return updated;
    } catch (error) {
      console.error('[OrderContext] Failed to cancel order:', error);
      throw error;
    }
  }, [isAdmin]);

  const fetchOrderById = useCallback(async (orderId) => {
    try {
      const { order } = await apiRequest(`/orders/${orderId}`);
      if (order) {
        const normalized = orderService.normalizeOrder(order);
        setOrders((prev) => {
          const next = [normalized, ...prev.filter((o) => o.id !== normalized.id)];
          orderService.setStoredOrders(next);
          return next;
        });
        return normalized;
      }
    } catch (error) {
      console.warn('[OrderContext] Could not fetch order by ID:', error);
    }
    return null;
  }, []);

  const getOrderById = useCallback((orderId) => {
    return orders.find((o) => o.id === orderId);
  }, [orders]);

  const getTodayOrders = useCallback(() => {
    return orderService.getTodayOrders(orders);
  }, [orders]);

  const value = {
    orders,
    activeOrderCount,
    totalOrderCount,
    hasMoreOrders,
    loadingMoreOrders,
    loadMoreOrders,
    reloadOrders,
    socketConnected,
    createNewOrder,
    updateStatus,
    bulkUpdateStatus,
    cancelOrder,
    fetchOrderById,
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
