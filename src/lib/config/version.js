/**
 * Application Version (VERSIONING-v10 § 2.1)
 * Injected at build time from package.json via Vite `define`.
 * Never hardcoded manually in components.
 */

export const APP_VERSION =
	typeof globalThis.__APP_VERSION__ !== 'undefined' ? globalThis.__APP_VERSION__ : '0.0.1';
