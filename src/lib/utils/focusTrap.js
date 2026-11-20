/**
 * Focus trap action for modal dialogs (A11Y-v10 § 3)
 * @param {HTMLElement} node
 * @param {boolean} [enabled=true]
 */
export function focusTrap(node, enabled = true) {
	if (!enabled) return;

	const selector =
		'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

	function handleKeydown(/** @type {KeyboardEvent} */ event) {
		if (event.key !== 'Tab') return;

		const focusable = Array.from(node.querySelectorAll(selector)).filter(
			(el) => el instanceof HTMLElement && el.offsetParent !== null
		);

		if (focusable.length === 0) {
			event.preventDefault();
			return;
		}

		const first = focusable[0];
		const last = focusable[focusable.length - 1];

		if (event.shiftKey) {
			if (document.activeElement === first || !node.contains(document.activeElement)) {
				event.preventDefault();
				/** @type {HTMLElement} */ (last).focus();
			}
		} else {
			if (document.activeElement === last || !node.contains(document.activeElement)) {
				event.preventDefault();
				/** @type {HTMLElement} */ (first).focus();
			}
		}
	}

	const previouslyFocused = document.activeElement;
	const focusable = Array.from(node.querySelectorAll(selector)).filter(
		(el) => el instanceof HTMLElement && el.offsetParent !== null
	);
	if (focusable.length > 0) {
		/** @type {HTMLElement} */ (focusable[0]).focus();
	}

	node.addEventListener('keydown', handleKeydown);

	return {
		update(/** @type {boolean} */ newEnabled) {
			enabled = newEnabled;
		},
		destroy() {
			node.removeEventListener('keydown', handleKeydown);
			if (previouslyFocused && previouslyFocused instanceof HTMLElement) {
				previouslyFocused.focus();
			}
		}
	};
}
