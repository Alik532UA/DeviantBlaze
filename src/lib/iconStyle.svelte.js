class IconStyleStore {
	current = $state('gothic'); // 'gothic' | 'classic'

	constructor() {
		if (typeof window !== 'undefined') {
			const saved = localStorage.getItem('deviantblaze-icon-style');
			if (saved === 'gothic' || saved === 'classic') {
				this.current = saved;
			}
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
		if (typeof window !== 'undefined') {
			try {
				localStorage.setItem('deviantblaze-icon-style', this.current);
			} catch (e) {}
		}
	}
}

export const iconStyleStore = new IconStyleStore();
