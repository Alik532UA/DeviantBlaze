// @ts-check

/**
 * @typedef {'sine' | 'square' | 'sawtooth' | 'triangle'} OscillatorType
 */

/**
 * @typedef {Object} SynthPreset
 * @property {string} id
 * @property {string} nameUk
 * @property {string} nameEn
 * @property {OscillatorType} waveType
 * @property {number} attack
 * @property {number} decay
 * @property {number} sustain
 * @property {number} release
 * @property {number} filterCutoff
 */

/**
 * @type {Record<string, SynthPreset>}
 */
export const SYNTH_PRESETS = {
	grand_piano: {
		id: 'grand_piano',
		nameUk: 'Концертне фортепіано',
		nameEn: 'Concert Grand',
		waveType: 'triangle',
		attack: 0.01,
		decay: 0.3,
		sustain: 0.4,
		release: 0.5,
		filterCutoff: 3500
	},
	analog_lead: {
		id: 'analog_lead',
		nameUk: 'Аналоговий сольний синт',
		nameEn: 'Analog Lead',
		waveType: 'sawtooth',
		attack: 0.05,
		decay: 0.2,
		sustain: 0.8,
		release: 0.4,
		filterCutoff: 4800
	},
	ambient_pad: {
		id: 'ambient_pad',
		nameUk: 'Атмосферний пед',
		nameEn: 'Atmospheric Pad',
		waveType: 'sine',
		attack: 0.4,
		decay: 0.5,
		sustain: 0.9,
		release: 0.8,
		filterCutoff: 2000
	},
	sub_bass: {
		id: 'sub_bass',
		nameUk: 'Глибокий суб-бас',
		nameEn: 'Deep Sub Bass',
		waveType: 'sine',
		attack: 0.02,
		decay: 0.4,
		sustain: 0.6,
		release: 0.3,
		filterCutoff: 600
	}
};

/**
 * @param {string} id
 * @returns {SynthPreset}
 */
export function getSynthPreset(id) {
	const preset = SYNTH_PRESETS[id];
	if (!preset) {
		const fallback = SYNTH_PRESETS.grand_piano;
		if (!fallback) throw new Error('Default preset grand_piano is missing');
		return fallback;
	}
	return preset;
}
