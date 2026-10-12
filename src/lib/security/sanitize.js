/**
 * Санітизація SVG та HTML для DeviantBlaze (SECURITY-v10 § 5.2).
 */

/**
 * Екранування спецсимволів HTML.
 * @param {string} str
 * @returns {string}
 */
export function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Санітизація SVG-вмісту від шкідливих скриптів та обробників подій.
 * @param {string} svg
 * @returns {string}
 */
export function sanitizeSvg(svg) {
  if (!svg) return "";
  return svg
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/\bon\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript:/gi, "");
}

/**
 * Санітизація довільного HTML.
 * @param {string} dirty
 * @returns {string}
 */
export function sanitizeHtml(dirty) {
  if (!dirty) return "";
  return sanitizeSvg(dirty);
}
