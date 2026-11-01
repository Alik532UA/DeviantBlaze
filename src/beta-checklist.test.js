// @vitest-environment node
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
	BETA_TABS,
	BETA_UNCOVERED_ROUTES,
	COVERED_DEBT,
	sortChecks,
	vote,
	readMarks,
	doneOnVersion,
	tid
} from './lib/beta/checklist.js';

const checks = BETA_TABS.flatMap((tab) => tab.checks);

const walk = (dir) => {
	const results = [];
	for (const entry of readdirSync(dir)) {
		const full = join(dir, entry);
		if (statSync(full).isDirectory()) {
			if (entry !== 'node_modules' && entry !== '.svelte-kit' && entry !== 'build') {
				results.push(...walk(full));
			}
		} else if (entry.endsWith('.svelte')) {
			results.push(full.replace(/\\/g, '/'));
		}
	}
	return results;
};

const pages = walk('src/routes').filter((f) => f.endsWith('/+page.svelte'));
const ROUTES = pages.map(
	(f) => `/${f.slice('src/routes/'.length, -'/+page.svelte'.length)}`.replace(/\/$/, '') || '/'
);

describe('чеклист бета-тестування (BETA-CHECKLIST § 5)', () => {
	it('знаходить пункти й маршрути — перевірка жива', () => {
		expect(checks.length).toBeGreaterThan(0);
		expect(ROUTES.length).toBeGreaterThan(0);
	});

	it('сторінка чеклиста є за адресою beta-test-checklists (§ 4.1)', () => {
		const hasPage = pages.some((f) => f.includes('beta-test-checklists'));
		expect(hasPage, 'немає src/routes/beta-test-checklists/+page.svelte').toBe(true);
		const hiddenJson = JSON.parse(readFileSync('src/lib/i18n/hidden-routes.json', 'utf8'));
		expect(hiddenJson.betaChecklist).toBe('beta-test-checklists');
	});

	it('кожен маршрут заявлений рівно однією вкладкою (§ 5.1)', () => {
		const claims = (route) => BETA_TABS.filter((tab) => tab.routes.includes(route)).length;
		const own = (route) => route.includes('beta-test-checklists') || route in BETA_UNCOVERED_ROUTES;
		const missing = ROUTES.filter((r) => !own(r) && claims(r) !== 1);
		expect(missing, 'маршрут без вкладки чи з кількома').toEqual([]);
	});

	it('covered називає файл тесту, і він існує (§ 5.2)', () => {
		const invalid = checks.filter(
			(c) => c.coverage === 'covered' && (!c.test || !existsSync(c.test))
		);
		expect(invalid.map((c) => `${c.id} -> ${c.test}`)).toEqual([]);
	});

	it('id, тексти, рівні й межа кожної вкладки (§ 2)', () => {
		const ids = checks.map((c) => c.id);
		expect(
			ids.filter((id, i) => ids.indexOf(id) !== i),
			'дублікати id'
		).toEqual([]);

		const bad = [];
		for (const tab of BETA_TABS) {
			for (const c of tab.checks) {
				if (!new RegExp(`^${tab.id}_\\d+$`).test(c.id))
					bad.push(`${c.id}: форма {вкладка}_{номер}`);
				if (
					!c.text.uk?.trim() ||
					!c.text.en?.trim() ||
					!c.category.uk?.trim() ||
					!c.category.en?.trim()
				) {
					bad.push(`${c.id}: порожній текст`);
				}
				if (/^\s*\d/.test(c.text.uk)) bad.push(`${c.id}: номер у тексті`);
				if (/data-testid|\$state|\.svelte\b|localStorage/.test(c.text.uk))
					bad.push(`${c.id}: внутрішня назва`);
				if (tid(c.id).includes('_')) bad.push(`${c.id}: локатор із підкресленням`);
			}
			if (!tab.checks.some((c) => c.coverage === 'manual')) bad.push(`${tab.id}: немає manual`);
			if (!tab.checks.some((c) => c.negative)) bad.push(`${tab.id}: немає пункта-межі`);
		}
		expect(bad).toEqual([]);
	});

	it('covered не переважає manual понад записаний борг (§ 3.4)', () => {
		for (const tab of BETA_TABS) {
			const covered = tab.checks.filter((c) => c.coverage === 'covered').length;
			const manual = tab.checks.filter((c) => c.coverage === 'manual').length;
			const debt = COVERED_DEBT[tab.id];
			if (debt === undefined) {
				expect(covered <= manual, `${tab.id}: covered > manual без боргу`).toBe(true);
			} else {
				expect(covered <= debt, `${tab.id}: борг зріс`).toBe(true);
			}
		}
	});

	it('порядок, голос, версія і сховище (§ 3, § 3.1, § 3.3, § 8.6)', () => {
		const levels = sortChecks(checks).map((c) => c.coverage);
		expect(levels).toEqual(
			[...levels].sort(
				(a, b) =>
					['manual', 'testable', 'covered'].indexOf(a) -
					['manual', 'testable', 'covered'].indexOf(b)
			)
		);

		const id = checks[0]?.id ?? 'test_1';
		const once = vote({}, id, 'ok', '1.0.0');
		expect(vote(once, id, 'ok', '1.0.0')).toEqual({});
		expect(vote({ [id]: { vote: 'ok', version: '0.9.0' } }, id, 'ok', '1.0.0')).toEqual(once);
		expect(doneOnVersion(checks, { [id]: { vote: 'ok', version: '0.9.0' } }, '1.0.0')).toBe(0);

		const known = new Set(checks.map((c) => c.id));
		expect(
			readMarks(
				{
					[id]: { vote: 'ok', version: '1.0.0' },
					broken_1: { vote: 'ok', version: '1.0.0' }
				},
				known
			)
		).toEqual(once);
		expect(readMarks('not-json', known)).toEqual({});
	});
});
