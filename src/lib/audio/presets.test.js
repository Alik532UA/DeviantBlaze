import { describe, expect, it } from 'vitest';
import { SYNTH_PRESETS, getSynthPreset } from './presets.js';

describe('Synthesizer Sound Presets (Audio Engine & Architecture)', () => {
	it('defines standard core sound presets with valid envelope curves', () => {
		const presetKeys = Object.keys(SYNTH_PRESETS);
		expect(presetKeys.length).toBeGreaterThanOrEqual(4);

		for (const preset of Object.values(SYNTH_PRESETS)) {
			expect(preset.nameUk.trim()).not.toBe('');
			expect(preset.nameEn.trim()).not.toBe('');
			expect(['sine', 'square', 'sawtooth', 'triangle']).toContain(preset.waveType);
			expect(preset.attack).toBeGreaterThan(0);
			expect(preset.decay).toBeGreaterThan(0);
			expect(preset.sustain).toBeGreaterThan(0);
			expect(preset.release).toBeGreaterThan(0);
			expect(preset.filterCutoff).toBeGreaterThan(100);
		}
	});

	it('falls back to grand_piano for unknown preset IDs', () => {
		const fallback = getSynthPreset('synth_alien_laser');
		expect(fallback.id).toBe('grand_piano');
	});
});

