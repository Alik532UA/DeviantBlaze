import { describe, expect, it } from 'vitest';
import { AudioAccessibilityManager } from './a11yAudio.js';

describe('Audio Accessibility Manager (a11y & Feedback)', () => {
	it('dispatches announcements in Ukrainian and English', () => {
		const a11y = new AudioAccessibilityManager();
		a11y.announceNote('C', 4);
		expect(a11y.getAnnouncement()).toContain('Зіграно ноту: C4');

		a11y.setLang('en');
		a11y.announceNote('F#', 5);
		expect(a11y.getAnnouncement()).toContain('Played note: F#5');
	});

	it('dispatches visualizer mode switch announcements', () => {
		const a11y = new AudioAccessibilityManager();
		a11y.announceVisualMode('Осцилограма');
		expect(a11y.getAnnouncement()).toContain('Режим візуалізатора змінено на: Осцилограма');

		a11y.setLang('en');
		a11y.announceVisualMode('Frequency Bars');
		expect(a11y.getAnnouncement()).toContain('Visualizer mode changed to: Frequency Bars');
	});
});

