/**
 * Menu Service — SRKR Cafeteria
 * 
 * Manages menu data operations with backend API integration and localStorage fallback.
 */

import mockMenu from '../data/mockMenu';
import { getStoredMenu, setStoredMenu } from './storageService';
import { apiRequest, authHeaders } from './apiClient';

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

export function normalizeMenuItem(item) {
  const id = item.itemId || item.id || item._id;
  const defaultItem = mockMenu.find((menuItem) => menuItem.id === id);
  const image = defaultItem && isLegacyImage(item.image)
    ? defaultItem.image
    : toLocalImagePath(item.image);

  return {
    id,
    itemId: id,
    name: item.name,
    description: item.description,
    price: item.price,
    category: item.category,
    image,
    available: item.available !== false,
    popular: Boolean(item.popular),
    featured: Boolean(item.featured),
    preparationTime: item.preparationTime || 10,
    stock: Number.isFinite(item.stock) ? item.stock : 25,
    dietaryTags: Array.isArray(item.dietaryTags) ? item.dietaryTags : [],
  };
}

/**
 * Initialize menu data from localStorage or mockMenu.
 * @returns {Array}
 */
export function initializeMenu() {
  const stored = getStoredMenu();
  if (stored && Array.isArray(stored) && stored.length > 0) {
    const migrated = stored.map(normalizeMenuItem);
    setStoredMenu(migrated);
    return migrated;
  }
  setStoredMenu(mockMenu);
  return [...mockMenu];
}

/**
 * Fetch menu items from API with fallback to stored/mock data.
 * @returns {Promise<Array>}
 */
export async function fetchMenuItems() {
  try {
    const data = await apiRequest('/menu');
    if (Array.isArray(data?.items)) {
      const normalized = data.items.map(normalizeMenuItem);
      setStoredMenu(normalized);
      return normalized;
    }
  } catch (error) {
    console.warn('[menuService] Failed to fetch menu from API, using cached data:', error);
  }
  return initializeMenu();
}

/**
 * Create a new menu item via backend API (or fallback).
 */
export async function createMenuItem(menu, itemData) {
  const data = await apiRequest('/menu', {
    method: 'POST', headers: authHeaders(), body: JSON.stringify(itemData),
  });
  if (!data?.item) throw new Error('The server did not return the created menu item.');
  const newItem = normalizeMenuItem(data.item);
  const updated = [...menu.filter((item) => item.id !== newItem.id), newItem];
  setStoredMenu(updated);
  return updated;
}

/**
 * Update a menu item via backend API (or fallback).
 */
export async function updateMenuItem(menu, itemId, itemData) {
  const data = await apiRequest(`/menu/${itemId}`, {
    method: 'PATCH', headers: authHeaders(), body: JSON.stringify(itemData),
  });
  if (!data?.item) throw new Error('The server did not return the updated menu item.');
  const updatedItem = normalizeMenuItem(data.item);
  const updated = menu.map((item) => (item.id === itemId ? updatedItem : item));
  setStoredMenu(updated);
  return updated;
}

/**
 * Delete a menu item via backend API (or fallback).
 */
export async function deleteMenuItem(menu, itemId) {
  await apiRequest(`/menu/${itemId}`, { method: 'DELETE', headers: authHeaders() });
  const updated = menu.filter((item) => item.id !== itemId);
  setStoredMenu(updated);
  return updated;
}

/**
 * Reset menu to default catalog via backend API (or fallback).
 */
export async function resetMenuToDefault() {
  const data = await apiRequest('/menu/reset', { method: 'POST', headers: authHeaders() });
  if (!Array.isArray(data?.items)) throw new Error('The server did not return the reset menu.');
  const normalized = data.items.map(normalizeMenuItem);
  setStoredMenu(normalized);
  return normalized;
}
