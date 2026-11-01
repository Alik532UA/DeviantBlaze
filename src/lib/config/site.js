/**
 * Canonical Site Configuration (SEO-v10.md § 1.2)
 * All absolute URLs (canonical, Open Graph, Twitter, JSON-LD, sitemap) derive from these constants.
 */

export const SITE_ORIGIN = 'https://alik532ua.github.io';
export const SITE_BASE = '/DeviantBlaze';

/**
 * Builds an absolute canonical URL for any site path.
 * @param {string} [path='/']
 * @returns {string}
 */
export function siteUrl(path = '/') {
	const clean = path.startsWith('/') ? path : `/${path}`;
	return `${SITE_ORIGIN}${SITE_BASE}${clean === '/' ? '/' : clean}`;
}
