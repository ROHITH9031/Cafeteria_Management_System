/**
 * Menu Service — SRKR Cafeteria
 * 
 * Abstracts menu data operations. Currently uses mock data + localStorage.
 * In production, these functions will call the backend API.
 */

import mockMenu from '../data/mockMenu';
import { getStoredMenu, setStoredMenu } from './storageService';

const LOCAL_IMAGE_FALLBACKS = {
  '1606491956689-2ea866880049': '/food_images/remote-1631452180519-c014fe946bc7.jpg',
  '1642821373181-203a252e43cf': '/food_images/remote-1565557623262-b51c2513a641.jpg',
  '1668236543090-82eb5eadfeea': '/food_images/remote-1630383249896-424e482df921.jpg',
};

function toLocalImagePath(image) {
  if (typeof image !== 'string' || !image.startsWith('http')) return image;
  const match = image.match(/photo-([0-9]+-[a-z0-9]+)/);
  if (!match) return image;
  return LOCAL_IMAGE_FALLBACKS[match[1]] || `/food_images/remote-${match[1]}.jpg`;
}

function isLegacyImage(image) {
  return typeof image === 'string'
    && (image.startsWith('http') || image.includes('/food_images/remote-'));
}

/**
 * Initialize menu data. Uses stored data if available, otherwise loads mock data.
 * @returns {Array}
 */
export function initializeMenu() {
  const stored = getStoredMenu();
  if (stored && Array.isArray(stored) && stored.length > 0) {
    const migrated = stored.map((item) => {
      const defaultItem = mockMenu.find((menuItem) => menuItem.id === item.id);
      const image = defaultItem && isLegacyImage(item.image)
        ? defaultItem.image
        : toLocalImagePath(item.image);

      return { ...item, image };
    });
    if (migrated.some((item, index) => item.image !== stored[index].image)) {
      setStoredMenu(migrated);
    }
    return migrated;
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
