/**
 * Date formatting utilities — SRKR Cafeteria
 * Uses Indian locale conventions (en-IN).
 */

/**
 * Format a date/timestamp to a readable date string.
 * @param {string|number|Date} date
 * @returns {string} Like "25 Oct 2026"
 */
export function formatDate(date) {
  try {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return 'Invalid date';
  }
}

/**
 * Format a date/timestamp to a readable time string.
 * @param {string|number|Date} date
 * @returns {string} Like "2:30 PM"
 */
export function formatTime(date) {
  try {
    return new Date(date).toLocaleTimeString('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return 'Invalid time';
  }
}

/**
 * Format a date/timestamp to a full datetime string.
 * @param {string|number|Date} date
 * @returns {string} Like "25 Oct 2026, 2:30 PM"
 */
export function formatDateTime(date) {
  try {
    return new Date(date).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return 'Invalid date';
  }
}

/**
 * Get a relative time string (e.g., "5 minutes ago").
 * @param {string|number|Date} date
 * @returns {string}
 */
export function timeAgo(date) {
  try {
    const now = Date.now();
    const past = new Date(date).getTime();
    const diffMs = now - past;
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    return `${diffDay}d ago`;
  } catch {
    return '';
  }
}
