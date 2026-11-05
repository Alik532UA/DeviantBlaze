import { describe, expect, it } from 'vitest';
import { getAllVisualizerModes, getVisualizerMode, registerVisualizerMode } from './registry.js';

describe('Visualizer Modes Registry (Scalability & Dynamic Extension)', () => {
	it('contains at least 4 default core visualizer modes', () => {
		const modes = getAllVisualizerModes();
		expect(modes.length).toBeGreaterThanOrEqual(4);
		const ids = modes.map((m) => m.id);
		expect(ids).toContain('bars');
		expect(ids).toContain('wave');
		expect(ids).toContain('radial');
		expect(ids).toContain('particles');
	});

	it('returns the requested mode or safely falls back to bars for unknown mode', () => {
		const waveMode = getVisualizerMode('wave');
		expect(waveMode.id).toBe('wave');

		const fallback = getVisualizerMode('nonexistent_fx');
		expect(fallback.id).toBe('bars');
	});

	it('allows registering a new visualizer mode dynamically', () => {
		const mockRender = () => {};
		registerVisualizerMode({
			id: 'strobe_matrix',
			nameUk: 'Стробоскопічна матриця',
			nameEn: 'Strobe Matrix',
			description: 'Швидкі світлові імпульси у ритм перкусії.',
			render: mockRender
		});

		const registered = getVisualizerMode('strobe_matrix');
		expect(registered.nameUk).toBe('Стробоскопічна матриця');
		expect(registered.render).toBe(mockRender);
	});

	it('throws TypeError when attempting to register an invalid mode', () => {
		expect(() => registerVisualizerMode(/** @type {any} */ (null))).toThrow(TypeError);
		expect(() => registerVisualizerMode(/** @type {any} */ ({ id: 'missing_render' }))).toThrow(
			TypeError
		);
	});
});
