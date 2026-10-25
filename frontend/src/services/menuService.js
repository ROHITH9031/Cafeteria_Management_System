/**
 * Menu Service — SRKR Cafeteria
 * 
 * Abstracts menu data operations. Currently uses mock data + localStorage.
 * In production, these functions will call the backend API.
 */

import mockMenu from '../data/mockMenu';
import { getStoredMenu, setStoredMenu } from './storageService';

/**
 * Initialize menu data. Uses stored data if available, otherwise loads mock data.
 * @returns {Array}
 */
export function initializeMenu() {
  const stored = getStoredMenu();
  if (stored && Array.isArray(stored) && stored.length > 0) {
    return stored;
  }
  setStoredMenu(mockMenu);
  return [...mockMenu];
}

/**
 * Get all menu items.
 * @param {Array} menu - Current menu state
 * @returns {Array}
 */
export function getMenuItems(menu) {
  return menu || [];
}

/**
 * Get a single menu item by ID.
 * @param {Array} menu
 * @param {string} id
 * @returns {Object|undefined}
 */
export function getMenuItemById(menu, id) {
  return menu.find((item) => item.id === id);
}

/**
 * Create a new menu item.
 * @param {Array} menu
 * @param {Object} itemData
 * @returns {Array} Updated menu
 */
export function createMenuItem(menu, itemData) {
  const newItem = {
    ...itemData,
    id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
  };
  const updated = [...menu, newItem];
  setStoredMenu(updated);
  return updated;
}

/**
 * Update an existing menu item.
 * @param {Array} menu
 * @param {string} itemId
 * @param {Object} itemData
 * @returns {Array} Updated menu
 */
export function updateMenuItem(menu, itemId, itemData) {
  const updated = menu.map((item) =>
    item.id === itemId ? { ...item, ...itemData } : item
  );
  setStoredMenu(updated);
  return updated;
}

/**
 * Delete a menu item.
 * @param {Array} menu
 * @param {string} itemId
 * @returns {Array} Updated menu
 */
export function deleteMenuItem(menu, itemId) {
  const updated = menu.filter((item) => item.id !== itemId);
  setStoredMenu(updated);
  return updated;
}

/**
 * Reset menu to default mock data.
 * @returns {Array}
 */
export function resetMenuToDefault() {
  setStoredMenu(mockMenu);
  return [...mockMenu];
}
