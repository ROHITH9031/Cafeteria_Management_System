/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { initializeMenu } from '../services/menuService';
import * as menuService from '../services/menuService';

const MenuContext = createContext(null);

export function MenuProvider({ children }) {
  const [menu, setMenu] = useState(() => initializeMenu());

  // Sync to localStorage whenever menu changes
  useEffect(() => {
    if (menu && menu.length > 0) {
      // storageService is called inside menuService functions, so no double-write
    }
  }, [menu]);

  const addMenuItem = useCallback((itemData) => {
    setMenu((prev) => menuService.createMenuItem(prev, itemData));
  }, []);

  const editMenuItem = useCallback((itemId, itemData) => {
    setMenu((prev) => menuService.updateMenuItem(prev, itemId, itemData));
  }, []);

  const removeMenuItem = useCallback((itemId) => {
    setMenu((prev) => menuService.deleteMenuItem(prev, itemId));
  }, []);

  const toggleAvailability = useCallback((itemId) => {
    setMenu((prev) => {
      const item = prev.find((i) => i.id === itemId);
      if (!item) return prev;
      return menuService.updateMenuItem(prev, itemId, { available: !item.available });
    });
  }, []);

  const togglePopular = useCallback((itemId) => {
    setMenu((prev) => {
      const item = prev.find((i) => i.id === itemId);
      if (!item) return prev;
      return menuService.updateMenuItem(prev, itemId, { popular: !item.popular });
    });
  }, []);

  const toggleFeatured = useCallback((itemId) => {
    setMenu((prev) => {
      const item = prev.find((i) => i.id === itemId);
      if (!item) return prev;
      return menuService.updateMenuItem(prev, itemId, { featured: !item.featured });
    });
  }, []);

  const resetMenu = useCallback(() => {
    const defaultMenu = menuService.resetMenuToDefault();
    setMenu(defaultMenu);
  }, []);

  const getItemById = useCallback((id) => {
    return menu.find((item) => item.id === id);
  }, [menu]);

  const value = {
    menu,
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
