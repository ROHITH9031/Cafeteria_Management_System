/**
 * Currency formatting utilities — SRKR Cafeteria
 * All prices are in Indian Rupees (INR / ₹).
 */

/**
 * Format a number as INR currency string.
 * @param {number} amount
 * @returns {string} Formatted like "₹150"
 */
export function formatCurrency(amount) {
  if (typeof amount !== 'number' || isNaN(amount)) return '₹0';
  return `₹${amount.toLocaleString('en-IN')}`;
}

/**
 * Format currency with decimal places.
 * @param {number} amount
 * @returns {string} Formatted like "₹150.00"
 */
export function formatCurrencyDecimal(amount) {
  if (typeof amount !== 'number' || isNaN(amount)) return '₹0.00';
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
