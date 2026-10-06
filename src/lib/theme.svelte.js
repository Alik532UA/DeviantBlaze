import { storage } from '#lib/services/storage.js';

class ThemeStore {
	current = $state('dark');

	constructor() {
		if (typeof window !== 'undefined') {
			const saved = storage.get('theme');
			if (saved === 'dark' || saved === 'light') {
				this.current = saved;
			} else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
				this.current = 'light';
			}
			this.apply();
		}
	}

	toggle() {
		this.current = this.current === 'dark' ? 'light' : 'dark';
		this.apply();
	}

	set(theme) {
		if (theme === 'dark' || theme === 'light') {
			this.current = theme;
			this.apply();
		}
	}

	apply() {
		if (typeof window === 'undefined') return;
		document.documentElement.setAttribute('data-theme', this.current);
		storage.set('theme', this.current);
		try {
			const metaTheme = document.querySelector('meta[name="theme-color"]');
			if (metaTheme) {
				metaTheme.setAttribute('content', this.current === 'dark' ? '#08080a' : '#f8f8fa');
			}
		} catch (e) {}
	}
}

export const themeStore = new ThemeStore();
