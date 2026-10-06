/**
 * Safe Storage Facade (STORAGE-NAMESPACE-v10 § 2 & § 5)
 * Never throws on SecurityError/QuotaExceededError. Namespaces keys with STORAGE_PREFIX.
 */
import { STORAGE_PREFIX } from '#lib/services/storagePrefix.js';

export { STORAGE_PREFIX };

const isBrowser = typeof window !== 'undefined';

/**
 * Creates a safe facade around a web storage area.
 * @param {'localStorage' | 'sessionStorage'} area
 */
function createStore(area) {
	let available = true;

	function open() {
		if (!isBrowser || !available) return null;
		try {
			return window[area];
		} catch (error) {
			available = false;
			console.warn(`[storage] ${area} is blocked or unavailable:`, error);
			return null;
		}
	}

	const store = {
		/**
		 * Read a prefixed value. Returns null if missing or error occurs.
		 * @param {string} key
		 * @returns {string | null}
		 */
		get(key) {
			const s = open();
			if (!s) return null;
			try {
				return s.getItem(STORAGE_PREFIX + key);
			} catch (error) {
				console.warn(`[storage] Read failed for key "${key}":`, error);
				return null;
			}
		},

		/**
		 * Save a prefixed value. Returns true on success, false on quota/security error.
		 * @param {string} key
		 * @param {string} value
		 * @returns {boolean}
		 */
		set(key, value) {
			const s = open();
			if (!s) return false;
			try {
				s.setItem(STORAGE_PREFIX + key, value);
				return true;
			} catch (error) {
				console.warn(`[storage] Write failed for key "${key}":`, error);
				return false;
			}
		},

		/**
		 * Remove a prefixed key.
		 * @param {string} key
		 */
		remove(key) {
			const s = open();
			if (!s) return;
			try {
				s.removeItem(STORAGE_PREFIX + key);
			} catch (error) {
				console.warn(`[storage] Remove failed for key "${key}":`, error);
			}
		},

		/**
		 * Clear ONLY keys belonging to this project's prefix (STORAGE-NAMESPACE-v10 § 3).
		 * NEVER calls window.localStorage.clear() on a shared domain.
		 * @returns {number} number of cleared keys
		 */
		clear() {
			const s = open();
			if (!s) return 0;
			try {
				const own = [];
				for (let i = 0; i < s.length; i++) {
					const k = s.key(i);
					if (k !== null && k.startsWith(STORAGE_PREFIX)) {
						own.push(k);
					}
				}
				for (const k of own) {
					s.removeItem(k);
				}
				return own.length;
			} catch (error) {
				console.warn('[storage] Clear failed:', error);
				return 0;
			}
		},

		/**
		 * Parse JSON with validator guard (STORAGE-NAMESPACE-v10 § 2).
		 * @template T
		 * @param {string} key
		 * @param {(val: unknown) => val is T} isValid
		 * @returns {T | null}
		 */
		getJSON(key, isValid) {
			const raw = store.get(key);
			if (raw === null) return null;
			try {
				const value = JSON.parse(raw);
				return isValid(value) ? value : null;
			} catch {
				return null;
			}
		},

		/**
		 * Serialize and store value.
		 * @param {string} key
		 * @param {unknown} value
		 * @returns {boolean}
		 */
		setJSON(key, value) {
			try {
				const raw = JSON.stringify(value);
				return typeof raw === 'string' && store.set(key, raw);
			} catch (error) {
				console.warn(`[storage] JSON serialize failed for "${key}":`, error);
				return false;
			}
		}
	};

	return store;
}

export const storage = createStore('localStorage');

/**
 * Migration of legacy keys (STORAGE-NAMESPACE-v10 § 5)
 * Migrates old non-prefixed or hyphenated keys ('deviantblaze-theme' -> 'deviantblaze_theme').
 * Safe and runs once (marked with `__migrated_v1`).
 */
export function migrateLegacyKeys() {
	if (!isBrowser) return;
	const s = window.localStorage;
	if (!s) return;

	try {
		const migrationMarker = STORAGE_PREFIX + '__migrated_v1';
		if (s.getItem(migrationMarker)) return;

		/** Map of old keys known to have been written by DeviantBlaze */
		const LEGACY_OWNED = {
			'deviantblaze-theme': 'theme',
			'deviantblaze-lang': 'lang',
			'deviantblaze-icon-style': 'icon_style'
		};

		for (const [oldKey, newSubkey] of Object.entries(LEGACY_OWNED)) {
			const val = s.getItem(oldKey);
			if (val !== null && s.getItem(STORAGE_PREFIX + newSubkey) === null) {
				s.setItem(STORAGE_PREFIX + newSubkey, val);
				s.removeItem(oldKey);
			}
		}

		s.setItem(migrationMarker, 'true');
	} catch (e) {
		console.warn('[storage] Legacy key migration skipped:', e);
	}
}
