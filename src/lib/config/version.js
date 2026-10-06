/**
 * Application Version (VERSIONING-v10 § 2.1)
 * Injected at build time from package.json via Vite `define`.
 * Never hardcoded manually in components.
 */

// @ts-expect-error __APP_VERSION__ is injected by Vite define
export const APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.0.1';
