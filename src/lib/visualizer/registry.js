// @ts-check

/**
 * @typedef {'blaze' | 'neon' | 'acid' | 'mono'} VisualizerPalette
 */

/**
 * @typedef {Object} RenderContext
 * @property {CanvasRenderingContext2D} ctx
 * @property {number} width
 * @property {number} height
 * @property {Uint8Array} frequencyData
 * @property {VisualizerPalette} palette
 * @property {number} sensitivity
 */

/**
 * @typedef {Object} VisualizerModeDefinition
 * @property {string} id
 * @property {string} nameUk
 * @property {string} nameEn
 * @property {string} description
 * @property {(rc: RenderContext) => void} render
 */

/**
 * @type {Record<string, VisualizerModeDefinition>}
 */
const MODES = {
	bars: {
		id: 'bars',
		nameUk: 'Спектральні стовпчики',
		nameEn: 'Frequency Bars',
		description: 'Класичний графічний еквалайзер із піковими детекторами.',
		render: ({ ctx, width, height, frequencyData }) => {
			const barCount = 32;
			const barWidth = width / barCount;
			for (let i = 0; i < barCount; i++) {
				const val = frequencyData[i] ?? 0;
				const barHeight = (val / 255) * height;
				ctx.fillRect(i * barWidth, height - barHeight, barWidth - 2, barHeight);
			}
		}
	},
	wave: {
		id: 'wave',
		nameUk: 'Осцилограма хвилі',
		nameEn: 'Oscilloscope Wave',
		description: 'Неперервна аналогова хвиля з динамічним фазовим зсувом.',
		render: ({ ctx, width, height, frequencyData }) => {
			ctx.beginPath();
			const slice = width / frequencyData.length;
			for (let i = 0; i < frequencyData.length; i++) {
				const v = (frequencyData[i] ?? 128) / 128.0;
				const y = (v * height) / 2;
				if (i === 0) ctx.moveTo(0, y);
				else ctx.lineTo(i * slice, y);
			}
			ctx.stroke();
		}
	},
	radial: {
		id: 'radial',
		nameUk: 'Радіальне кільце',
		nameEn: 'Radial Pulse',
		description: 'Кільцевий спектральний спалах із центробіжними променями.',
		render: ({ ctx, width, height }) => {
			const cx = width / 2;
			const cy = height / 2;
			const radius = Math.min(cx, cy) * 0.4;
			ctx.beginPath();
			ctx.arc(cx, cy, radius, 0, Math.PI * 2);
			ctx.stroke();
		}
	},
	particles: {
		id: 'particles',
		nameUk: 'Квантові частинки',
		nameEn: 'Quantum Particles',
		description: 'Хмара енергетичних частинок, що реагують на басові удари.',
		render: ({ ctx, width, height, frequencyData }) => {
			const bass = frequencyData[0] ?? 0;
			const radius = (bass / 255) * 40 + 10;
			ctx.beginPath();
			ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
			ctx.fill();
		}
	}
};

/**
 * Отримує визначення режиму за його ідентифікатором.
 * @param {string} id
 * @returns {VisualizerModeDefinition}
 */
export function getVisualizerMode(id) {
	const mode = MODES[id];
	if (!mode) {
		const fallback = MODES.bars;
		if (!fallback) throw new Error('Default mode bars is missing');
		return fallback;
	}
	return mode;
}

/**
 * Повертає список усіх зареєстрованих режимів.
 * @returns {VisualizerModeDefinition[]}
 */
export function getAllVisualizerModes() {
	return Object.values(MODES);
}

/**
 * Реєструє новий візуальний ефект у системі.
 * @param {VisualizerModeDefinition} modeDef
 */
export function registerVisualizerMode(modeDef) {
	if (!modeDef || !modeDef.id || typeof modeDef.render !== 'function') {
		throw new TypeError('Invalid VisualizerModeDefinition: id and render() are required');
	}
	MODES[modeDef.id] = modeDef;
}
