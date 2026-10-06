export const TRANSLATIONS = {
	uk: {
		// Navigation
		gallery: "Галерея",
		instagram: "Instagram",
		contact: "Написати",
		theme_dark: "Світла",
		theme_light: "Темна",
		theme_toggle_tip_dark: "Світла тема",
		theme_toggle_tip_light: "Темна тема",

		// Music links
		ytm: "YouTube Music",
		spotify: "Spotify",
		apple: "Apple Music",

		// Hidden Panel
		visualizer: "Візуалізація",
		piano: "Фортепіано",
		fullscreen: "На весь екран",
		fullscreen_exit: "Згорнути",
		order_site: "Замовити сайт",
		style_btn: "Стиль",
		style_gothic: "Готика",
		style_classic: "Класика",
		lang_btn: "Мова",

		// Visualizer Bar
		vj_live_mic: "VJ Live (Мікрофон)",
		vj_live_speakers: "VJ Live (З колонок)",
		vj_live_test: "VJ Live (Тест)",
		source_mic: "Мікрофон",
		source_speakers: "З колонок",
		mode_bars: "Спектр",
		mode_wave: "Хвиля",
		mode_radar: "Радар",
		close_visualizer: "Вимкнути візуалізацію",
		vj_hide: "Приховати інтерфейс",
		vj_expand: "Розгорнути меню",
		vj_sensitivity: "Чутливість",
		vj_spectrum_height: "Висота спектру",
		vj_color_theme: "Колір",
		vj_settings: "Налаштування",
		pal_blaze: "Вогонь",
		pal_cyber: "Кіберпанк",
		pal_gothic: "Лід",
		pal_toxic: "Неон",
		pal_purple: "Аметист",
		pal_mono: "Монохром",

		// Piano
		piano_title: "Акустичне Фортепіано",
		piano_studio: "Deviant Blaze Studio",
		piano_keyboard: "Клавіатура",
		piano_chords: "Акорди",
		piano_hint: "Торкніться клавіші або натисніть клавіатуру",
		piano_keys_hint: "Клавіші комп'ютера: A S D F G H J K L ; ' (білі) та W E R T Y U I O P [ (чорні)",
		chord_major: "мажор",
		chord_minor: "мінор",

		// Scroll Indicator
		scroll_top: "Верхнє меню",
		scroll_home: "Головна",
		scroll_music: "Музика",
		scroll_tools: "Інструменти",

		// Gallery
		gallery_title_1: "Deviant Blaze Band",
		gallery_title_2: "Vocals & Live Energy",
		gallery_title_3: "Deviant Blaze Live on Stage"
	},
	en: {
		// Navigation
		gallery: "Gallery",
		instagram: "Instagram",
		contact: "Contact",
		theme_dark: "Light",
		theme_light: "Dark",
		theme_toggle_tip_dark: "Light theme",
		theme_toggle_tip_light: "Dark theme",

		// Music links
		ytm: "YouTube Music",
		spotify: "Spotify",
		apple: "Apple Music",

		// Hidden Panel
		visualizer: "Visualizer",
		piano: "Piano",
		fullscreen: "Fullscreen",
		fullscreen_exit: "Exit Fullscreen",
		order_site: "Order Website",
		style_btn: "Style",
		style_gothic: "Gothic",
		style_classic: "Classic",
		lang_btn: "Language",

		// Visualizer Bar
		vj_live_mic: "VJ Live (Mic)",
		vj_live_speakers: "VJ Live (Speakers)",
		vj_live_test: "VJ Live (Test)",
		source_mic: "Mic",
		source_speakers: "Speakers",
		mode_bars: "Spectrum",
		mode_wave: "Wave",
		mode_radar: "Radar",
		close_visualizer: "Exit visualizer",
		vj_hide: "Hide interface",
		vj_expand: "Expand menu",
		vj_sensitivity: "Sensitivity",
		vj_spectrum_height: "Spectrum Height",
		vj_color_theme: "Color Theme",
		vj_settings: "Settings",
		pal_blaze: "Blaze",
		pal_cyber: "Cyber",
		pal_gothic: "Ice",
		pal_toxic: "Toxic",
		pal_purple: "Amethyst",
		pal_mono: "Monochrome",

		// Piano
		piano_title: "Acoustic Piano",
		piano_studio: "Deviant Blaze Studio",
		piano_keyboard: "Keyboard",
		piano_chords: "Chords",
		piano_hint: "Touch a key or use computer keyboard",
		piano_keys_hint: "Computer keys: A S D F G H J K L ; ' (white) and W E R T Y U I O P [ (black)",
		chord_major: "major",
		chord_minor: "minor",

		// Scroll Indicator
		scroll_top: "Top Menu",
		scroll_home: "Home",
		scroll_music: "Music",
		scroll_tools: "Tools",

		// Gallery
		gallery_title_1: "Deviant Blaze Band",
		gallery_title_2: "Vocals & Live Energy",
		gallery_title_3: "Deviant Blaze Live on Stage"
	}
};

import { storage } from '#lib/services/storage.js';

class LangStore {
	current = $state('uk'); // 'uk' | 'en'

	constructor() {
		if (typeof window !== 'undefined') {
			const saved = storage.get('lang');
			if (saved === 'uk' || saved === 'en') {
				this.current = saved;
			}
			this.apply();
		}
	}

	toggle() {
		this.current = this.current === 'uk' ? 'en' : 'uk';
		this.apply();
	}

	set(lang) {
		if (lang === 'uk' || lang === 'en') {
			this.current = lang;
			this.apply();
		}
	}

	/**
	 * @param {string} key
	 */
	t(key) {
		const dict = /** @type {Record<string, string>} */ (TRANSLATIONS[this.current] || TRANSLATIONS.uk);
		return dict[key] || /** @type {Record<string, string>} */ (TRANSLATIONS.uk)[key] || key;
	}

	apply() {
		if (typeof window === 'undefined') return;
		document.documentElement.setAttribute('lang', this.current);
		storage.set('lang', this.current);
	}
}

export const langStore = new LangStore();
