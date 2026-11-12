import { describe, it, expect } from 'vitest';
import { TRANSLATIONS } from './lang.svelte.js';

describe('i18n & Language Consistency (I18N-v10)', () => {
	it('contains both uk and en dictionaries', () => {
		expect(TRANSLATIONS.uk).toBeDefined();
		expect(TRANSLATIONS.en).toBeDefined();
	});

	it('guarantees complete parity of translation keys between uk and en', () => {
		const ukKeys = Object.keys(TRANSLATIONS.uk).sort();
		const enKeys = Object.keys(TRANSLATIONS.en).sort();
		expect(ukKeys).toEqual(enKeys);
	});

	it('provides non-empty strings for all critical interface elements', () => {
		for (const lang of ['uk', 'en']) {
			const dict = TRANSLATIONS[lang];
			expect(dict.gallery.length).toBeGreaterThan(0);
			expect(dict.visualizer.length).toBeGreaterThan(0);
			expect(dict.piano.length).toBeGreaterThan(0);
			expect(dict.style_gothic.length).toBeGreaterThan(0);
			expect(dict.style_classic.length).toBeGreaterThan(0);
		}
	});
});
