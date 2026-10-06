const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

/**
 * Checks if the browser and document support the Fullscreen API for web pages.
 * Devices like iPhone Safari report false / undefined here.
 *
 * @returns {boolean}
 */
export function canFullscreen() {
	if (!isBrowser) return false;
	const doc = /** @type {any} */ (document);
	const root = /** @type {any} */ (document.documentElement);
	const hasApi = Boolean(
		root?.requestFullscreen ||
		root?.webkitRequestFullscreen ||
		root?.mozRequestFullScreen ||
		root?.msRequestFullscreen
	);
	const isEnabled = doc.fullscreenEnabled ?? doc.webkitFullscreenEnabled ?? doc.mozFullScreenEnabled ?? doc.msFullscreenEnabled;
	return Boolean(hasApi && isEnabled !== false);
}

/**
 * Checks if the document is currently in fullscreen mode.
 *
 * @returns {boolean}
 */
export function isFullscreenActive() {
	if (!isBrowser) return false;
	const doc = /** @type {any} */ (document);
	return Boolean(
		doc.fullscreenElement ||
		doc.webkitFullscreenElement ||
		doc.mozFullScreenElement ||
		doc.msFullscreenElement
	);
}

/**
 * Toggles fullscreen mode safely with vendor prefix support.
 */
export function toggleFullscreen() {
	if (!canFullscreen()) return;
	const doc = /** @type {any} */ (document);
	const root = /** @type {any} */ (document.documentElement);

	if (isFullscreenActive()) {
		const exit = doc.exitFullscreen || doc.webkitExitFullscreen || doc.mozCancelFullScreen || doc.msExitFullscreen;
		exit?.call(doc)?.catch?.(() => {});
	} else {
		const request = root.requestFullscreen || root.webkitRequestFullscreen || root.mozRequestFullScreen || root.msRequestFullscreen;
		request?.call(root)?.catch?.(() => {});
	}
}
