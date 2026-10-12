/**
 * Серія натискань однієї клавіші як службовий жест (DEBUGGING-v10 § 3).
 *
 * Чотири обмеження (DEBUGGING-v10 § 3.2):
 * 1. event.repeat ігнорується.
 * 2. Поля вводу ігноруються (closest('input, textarea, select, [contenteditable]'), перевірка ПЕРЕД лічильником).
 * 3. Вікно між натисканнями (~2000 мс) із таймером, який скидається в reset().
 * 4. Будь-яка інша клавіша скидає лічильник.
 */

const EDITABLE_SELECTOR = 'input, textarea, select, [contenteditable]:not([contenteditable="false"])';

export function isEditableTarget(target) {
	const element = target;
	return typeof element?.closest === 'function' && element.closest(EDITABLE_SELECTOR) !== null;
}

export function createKeySequence(options) {
	const windowMs = options.windowMs ?? 2000;
	let count = 0;
	let timer;

	function reset() {
		count = 0;
		if (timer) {
			clearTimeout(timer);
			timer = undefined;
		}
	}

	return {
		handle(event) {
			// 1. Автоповтор затиснутої клавіші ігнорується
			if (event.repeat) return false;

			// 2. Поля вводу ігноруються
			const target =
				'composedPath' in event && typeof event.composedPath === 'function'
					? event.composedPath()[0]
					: event.target;
			if (isEditableTarget(target)) return false;

			// Модифікатори
			if (event.ctrlKey || event.altKey || event.metaKey) {
				reset();
				return false;
			}

			// 4. Будь-яка інша клавіша скидає лічильник
			if (event.code !== options.code) {
				reset();
				return false;
			}

			count += 1;
			if (timer) clearTimeout(timer);

			const threshold = typeof options.threshold === 'function' ? options.threshold() : options.threshold;
			if (count >= threshold) {
				reset();
				options.onComplete();
				return true;
			}

			// 3. Вікно між натисканнями
			timer = setTimeout(reset, windowMs);
			return false;
		},
		get count() {
			return count;
		},
		reset
	};
}
