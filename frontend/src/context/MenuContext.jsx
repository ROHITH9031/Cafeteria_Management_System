/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { initializeMenu } from '../services/menuService';
import * as menuService from '../services/menuService';
import { socket } from '../services/socketService';

const MenuContext = createContext(null);

export function MenuProvider({ children }) {
  const [menu, setMenu] = useState(() => initializeMenu());
  const [loading, setLoading] = useState(false);

  // Fetch from backend API on initial mount and listen for real-time menu updates
  useEffect(() => {
    let isMounted = true;
    menuService.fetchMenuItems()
      .then((items) => {
        if (isMounted && Array.isArray(items)) {
          setMenu(items);
        }
      })
      .catch((err) => {
        console.warn('[MenuContext] Could not fetch menu items:', err);
      });

    const handleMenuUpdated = () => {
      menuService.fetchMenuItems().then((items) => {
        if (isMounted && Array.isArray(items)) {
          setMenu(items);
        }
      });
    };

    socket.on('menu:updated', handleMenuUpdated);

    return () => {
      isMounted = false;
      socket.off('menu:updated', handleMenuUpdated);
    };
  }, []);

  const addMenuItem = useCallback(async (itemData) => {
    const updated = await menuService.createMenuItem(menu, itemData);
    setMenu(updated);
    return updated;
  }, [menu]);

  const editMenuItem = useCallback(async (itemId, itemData) => {
    const updated = await menuService.updateMenuItem(menu, itemId, itemData);
    setMenu(updated);
    return updated;
  }, [menu]);

  const removeMenuItem = useCallback(async (itemId) => {
    const updated = await menuService.deleteMenuItem(menu, itemId);
    setMenu(updated);
    return updated;
  }, [menu]);

  const toggleAvailability = useCallback(async (itemId) => {
    const item = menu.find((i) => i.id === itemId);
    if (!item) return;
    const updated = await menuService.updateMenuItem(menu, itemId, { available: !item.available });
    setMenu(updated);
  }, [menu]);

  const togglePopular = useCallback(async (itemId) => {
    const item = menu.find((i) => i.id === itemId);
    if (!item) return;
    const updated = await menuService.updateMenuItem(menu, itemId, { popular: !item.popular });
    setMenu(updated);
  }, [menu]);

  const toggleFeatured = useCallback(async (itemId) => {
    const item = menu.find((i) => i.id === itemId);
    if (!item) return;
    const updated = await menuService.updateMenuItem(menu, itemId, { featured: !item.featured });
    setMenu(updated);
  }, [menu]);

  const resetMenu = useCallback(async () => {
    const defaultMenu = await menuService.resetMenuToDefault();
    setMenu(defaultMenu);
  }, []);

  const getItemById = useCallback((id) => {
    return menu.find((item) => item.id === id);
  }, [menu]);

  const refreshMenu = useCallback(async () => {
    setLoading(true);
    try {
      const items = await menuService.fetchMenuItems();
      setMenu(items);
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    menu,
    loading,
    refreshMenu,
    addMenuItem,
    editMenuItem,
    removeMenuItem,
    toggleAvailability,
    togglePopular,
    toggleFeatured,
    resetMenu,
    getItemById,
  };

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}

export function useMenu() {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
}

export default MenuContext;
