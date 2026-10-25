/**
 * Storage Service — SRKR Cafeteria
 * 
 * Centralizes all localStorage read/write operations.
 * Handles corrupted data gracefully and provides safe defaults.
 * In production, these will be replaced by API calls.
 */

const STORAGE_KEYS = {
  MENU: 'srkr_menu_data',
  CART: 'srkr_cart_data',
  ORDERS: 'srkr_orders_data',
  AUTH: 'srkr_admin_auth',
  TOKEN_COUNTER: 'srkr_token_counter',
};

/**
 * Safely read and parse JSON from localStorage.
 * @param {string} key
 * @param {*} defaultValue
 * @returns {*}
 */
function safeGet(key, defaultValue = null) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null || raw === undefined) return defaultValue;
    return JSON.parse(raw);
  } catch {
    // Corrupted data — return default
    return defaultValue;
  }
}

/**
 * Safely write JSON to localStorage.
 * @param {string} key
 * @param {*} value
 */
function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    console.warn(`[StorageService] Failed to write key: ${key}`);
  }
}

/**
 * Remove a key from localStorage.
 * @param {string} key
 */
function safeRemove(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    // Silent fail
  }
}

// ─── Menu Storage ──────────────────────────────────────

export function getStoredMenu() {
  return safeGet(STORAGE_KEYS.MENU, null);
}

export function setStoredMenu(menu) {
  safeSet(STORAGE_KEYS.MENU, menu);
}

// ─── Cart Storage ──────────────────────────────────────

export function getStoredCart() {
  return safeGet(STORAGE_KEYS.CART, []);
}

export function setStoredCart(cart) {
  safeSet(STORAGE_KEYS.CART, cart);
}

// ─── Orders Storage ────────────────────────────────────

export function getStoredOrders() {
  return safeGet(STORAGE_KEYS.ORDERS, []);
}

export function setStoredOrders(orders) {
  safeSet(STORAGE_KEYS.ORDERS, orders);
}

// ─── Auth Storage ──────────────────────────────────────

export function getStoredAuth() {
  return safeGet(STORAGE_KEYS.AUTH, null);
}

export function setStoredAuth(auth) {
  safeSet(STORAGE_KEYS.AUTH, auth);
}

export function clearStoredAuth() {
  safeRemove(STORAGE_KEYS.AUTH);
}

// ─── Full Reset ────────────────────────────────────────

export function clearAllData() {
  Object.values(STORAGE_KEYS).forEach((key) => safeRemove(key));
}

export { STORAGE_KEYS };
