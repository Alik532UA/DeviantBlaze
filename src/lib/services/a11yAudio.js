// @ts-check

/**
 * Менеджер доступності для клавіш фортепіано та візуальних ефектів.
 */
export class AudioAccessibilityManager {
	constructor() {
		/** @type {string} */
		this.lastAnnouncement = '';
		/** @type {'uk' | 'en'} */
		this.lang = 'uk';
	}

	/**
	 * @param {'uk' | 'en'} lang
	 */
	setLang(lang) {
		this.lang = lang;
	}

	/**
	 * @param {string} msg
	 */
	announce(msg) {
		this.lastAnnouncement = msg;
	}

	/**
	 * @returns {string}
	 */
	getAnnouncement() {
		return this.lastAnnouncement;
	}

	/**
	 * @param {string} noteName
	 * @param {number} octave
	 */
	announceNote(noteName, octave) {
		const prefix = this.lang === 'uk' ? 'Зіграно ноту' : 'Played note';
		this.announce(`${prefix}: ${noteName}${octave}`);
	}

	/**
	 * @param {string} modeName
	 */
	announceVisualMode(modeName) {
		const prefix = this.lang === 'uk' ? 'Режим візуалізатора змінено на' : 'Visualizer mode changed to';
		this.announce(`${prefix}: ${modeName}`);
	}
}

export const a11yAudio = new AudioAccessibilityManager();

