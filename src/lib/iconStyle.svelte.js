import { storage } from '#lib/services/storage.js';

class IconStyleStore {
	current = $state('gothic'); // 'gothic' | 'classic'

	#initialized = false;

	init() {
		if (this.#initialized || typeof window === 'undefined') return;
		this.#initialized = true;
		const saved = storage.get('icon_style');
		if (saved === 'gothic' || saved === 'classic') {
			this.current = saved;
		}
	}

	toggle() {
		this.current = this.current === 'gothic' ? 'classic' : 'gothic';
		this.save();
	}

	set(style) {
		if (style === 'gothic' || style === 'classic') {
			this.current = style;
			this.save();
		}
	}

	save() {
		storage.set('icon_style', this.current);
	}
}

export const iconStyleStore = new IconStyleStore();
