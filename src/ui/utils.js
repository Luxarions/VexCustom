/**
 * Vexorion — UI Utility Functions
 * src/ui/utils.js
 */

/**
 * Escapes unsafe HTML characters to prevent XSS.
 * @param {any} str
 * @returns {string}
 */
export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Formats a millisecond duration for UI display.
 * @param {number} ms
 * @returns {string}
 */
export function formatDuration(ms) {
  if (typeof ms !== 'number' || isNaN(ms) || ms <= 0) return '—';
  return `${ms.toFixed(1)} ms`;
}
