/**
 * Beta Testing Checklist Data and Logic (BETA-CHECKLIST-v10)
 * Single source of truth for beta checks, invariant verification, and marks.
 */

/**
 * @typedef {'uk' | 'en'} ChecklistLang
 * @typedef {'manual' | 'testable' | 'covered'} Coverage
 * @typedef {'ok' | 'fail' | 'unclear' | 'skip'} Vote
 * 
 * @typedef {Object} Localized
 * @property {string} uk
 * @property {string} en
 * 
 * @typedef {Object} BetaCheck
 * @property {string} id
 * @property {Localized} category
 * @property {Localized} text
 * @property {string} [testid]
 * @property {boolean} [negative]
 * @property {Coverage} coverage
 * @property {string} [test]
 * @property {string} [shortcut]
 * 
 * @typedef {Object} BetaTab
 * @property {string} id
 * @property {Localized} title
 * @property {readonly string[]} routes
 * @property {readonly BetaCheck[]} checks
 * 
 * @typedef {Object} Mark
 * @property {Vote} vote
 * @property {string} version
 * 
 * @typedef {Record<string, Mark>} Marks
 */

export const VOTES = /** @type {const} */ (['ok', 'fail', 'unclear', 'skip']);

/** @type {BetaTab[]} */
export const BETA_TABS = [
	{
		id: 'common',
		title: { uk: 'Головний екран', en: 'Main Screen' },
		routes: ['/'],
		checks: [
			{
				id: 'common_1',
				category: { uk: 'Тема', en: 'Theme' },
				text: {
					uk: 'Натисніть кнопку зміни теми в шапці. Тема сайту мусить перемкнутися між темною та світлою з відповідною зміною кольорів тла й логотипу',
					en: 'Click the theme toggle button in the header. The site theme must switch between dark and light with corresponding changes in background and logo colors'
				},
				testid: 'theme-toggle-btn',
				coverage: 'manual'
			},
			{
				id: 'common_2',
				category: { uk: 'Тема', en: 'Theme' },
				text: {
					uk: 'Оберіть світлу тему й перезавантажте сторінку. Темна тема не мусить блимнути при старті',
					en: 'Choose the light theme and reload the page. The dark theme must not flash on start'
				},
				testid: 'theme-toggle-btn',
				negative: true,
				coverage: 'manual'
			},
			{
				id: 'common_3',
				category: { uk: 'Галерея', en: 'Gallery' },
				text: {
					uk: 'Натисніть кнопку «Галерея» у верхній навігації. Мусить відкритися модальне вікно перегляду концертних фотографій',
					en: 'Click the "Gallery" button in the top navigation. The concert photo gallery modal must open'
				},
				testid: 'gallery-open-btn',
				coverage: 'manual'
			},
			{
				id: 'common_4',
				category: { uk: 'Фортепіано', en: 'Piano' },
				text: {
					uk: 'У нижній панелі дій оберіть «Фортепіано». Мусить відкритися інтерактивне 88-клавішне фортепіано зі звуком',
					en: 'In the bottom action panel, select "Piano". The interactive 88-key piano modal with sound must open'
				},
				testid: 'piano-open-btn',
				coverage: 'manual'
			},
			{
				id: 'common_5',
				category: { uk: 'Візуалізація', en: 'Visualizer' },
				text: {
					uk: 'У нижній панелі дій оберіть «Візуалізація». Мусить увімкнутися аудіовізуалізатор концертного рівня та з\'явитися плаваюча панель VJ',
					en: 'In the bottom action panel, select "Visualizer". The concert audio visualizer must start and the floating VJ bar must appear'
				},
				testid: 'vj-toggle-btn',
				coverage: 'manual'
			},
			{
				id: 'common_6',
				category: { uk: 'Візуалізація', en: 'Visualizer' },
				text: {
					uk: 'Натисніть кнопку згортання панелі VJ. Панель мусить згорнутися в круглу кнопку-глазик, прозорість якої залежить від наближення курсора',
					en: 'Click the VJ bar collapse button. The bar must collapse into a round eye button whose opacity depends on cursor proximity'
				},
				testid: 'vj-collapse-btn',
				coverage: 'manual'
			},
			{
				id: 'common_7',
				category: { uk: 'Скрол', en: 'Scroll' },
				text: {
					uk: 'Прокрутіть коліщатко миші або проведіть пальцем угору/вниз. Стан головного екрана мусить циклічно змінюватися між 4 станами без затримок і блокувань',
					en: 'Scroll the mouse wheel or swipe up/down. The main screen state must cycle through 4 states smoothly without lags or locks'
				},
				coverage: 'manual'
			},
			{
				id: 'common_8',
				category: { uk: 'Музика', en: 'Music' },
				text: {
					uk: 'Клацніть на іконку YouTube Music, Spotify або Apple Music. У новій вкладці мусить відкритися офіційна сторінка гурту на обраному стримінгу',
					en: 'Click on YouTube Music, Spotify, or Apple Music icon. The band\'s official page on the selected platform must open in a new tab'
				},
				coverage: 'manual'
			}
		]
	}
];

/** @type {Record<string, string>} */
export const BETA_UNCOVERED_ROUTES = {};
/** @type {Record<string, number>} */
export const COVERED_DEBT = {};

const ORDER = { manual: 0, testable: 1, covered: 2 };

/**
 * § 3: manual -> testable -> covered
 * @param {readonly BetaCheck[]} checks
 * @returns {BetaCheck[]}
 */
export const sortChecks = (checks) => [...checks].sort((a, b) => ORDER[a.coverage] - ORDER[b.coverage]);

/**
 * § 3.3: повторне натискання знімає позначку; на позначці з іншої версії — перепоставляє
 * @param {Marks} marks
 * @param {string} id
 * @param {Vote} next
 * @param {string} version
 * @returns {Marks}
 */
export function vote(marks, id, next, version) {
	const current = marks[id];
	const copy = { ...marks };
	if (current?.vote === next && current.version === version) {
		delete copy[id];
	} else {
		copy[id] = { vote: next, version };
	}
	return copy;
}

/**
 * § 8.6: прочитане зі сховища — недовірений ввід
 * @param {unknown} raw
 * @param {ReadonlySet<string>} known
 * @returns {Marks}
 */
export function readMarks(raw, known) {
	const out = /** @type {Marks} */ ({});
	if (!raw || typeof raw !== 'object') return out;
	for (const [id, value] of Object.entries(raw)) {
		const mark = /** @type {{ vote?: unknown; version?: unknown } | null} */ (value);
		if (known.has(id) && mark && VOTES.includes(/** @type {any} */ (String(mark.vote))) && typeof mark.version === 'string') {
			out[id] = { vote: /** @type {Vote} */ (mark.vote), version: mark.version };
		}
	}
	return out;
}

/**
 * § 3.1, § 8.1: «зроблено» — лише позначки цієї версії
 * @param {readonly BetaCheck[]} checks
 * @param {Marks} marks
 * @param {string} version
 * @returns {number}
 */
export const doneOnVersion = (checks, marks, version) =>
	checks.filter((check) => marks[check.id]?.version === version).length;

/**
 * § 5.6: локатор із id — `common_1` -> `common-1`
 * @param {string} id
 * @returns {string}
 */
export const tid = (id) => id.replaceAll('_', '-');
