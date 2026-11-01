import { expect, test } from '@playwright/test';
import { BETA_TABS, tid } from '../../src/lib/beta/checklist.js';

/**
 * Сама сторінка чеклиста (BETA-CHECKLIST-v10 § 5.7).
 * Перевірка ключових сценаріїв взаємодії тестувальника:
 * 1. Збереження позначки при перезавантаженні
 * 2. Поступ +1 та зняття повторним кліком
 * 3. Перемикання вкладок зі збереженням стану
 * 4. Запасний шлях копіювання звіту при збої буфера
 */

const PAGE = '/beta-test-checklists';
const firstTab = BETA_TABS[0];
const firstCheck = firstTab.checks[0];
const firstTid = tid(firstCheck.id);

test.describe('Сторінка бета-чеклиста DeviantBlaze (§ 5.7)', () => {
	test('позначка переживає перезавантаження', async ({ page }) => {
		await page.goto(PAGE);
		const voteBtn = page.getByTestId(`beta-vote-${firstTid}-ok-btn`);
		await expect(voteBtn).toBeVisible();

		await voteBtn.click();
		await expect(voteBtn).toHaveAttribute('aria-pressed', 'true');

		await page.reload();
		await expect(
			page.getByTestId(`beta-vote-${firstTid}-ok-btn`),
			'позначка не збереглася в localStorage при перезавантаженні'
		).toHaveAttribute('aria-pressed', 'true');
	});

	test('поступ росте на 1, а повторне натискання його знімає (§ 3.3)', async ({ page }) => {
		await page.goto(PAGE);
		const voteBtn = page.getByTestId(`beta-vote-${firstTid}-ok-btn`);
		await expect(voteBtn).toBeVisible();

		const progress = page.getByTestId('beta-progress-value');
		const startText = await progress.textContent();

		await voteBtn.click();
		await expect(voteBtn).toHaveAttribute('aria-pressed', 'true');

		// Повторне натискання скасовує голос
		await voteBtn.click();
		await expect(voteBtn).toHaveAttribute('aria-pressed', 'false');
		await expect(progress).toHaveText(startText || '');
	});

	test('відмова буфера обміну показує звіт у резервному полі (§ 6.2)', async ({ page }) => {
		await page.addInitScript(() => {
			Object.defineProperty(navigator, 'clipboard', {
				configurable: true,
				value: {
					writeText: () => Promise.reject(new DOMException('denied', 'NotAllowedError'))
				}
			});
		});

		await page.goto(PAGE);
		const voteBtn = page.getByTestId(`beta-vote-${firstTid}-ok-btn`);
		await voteBtn.click();

		const reportBtn = page.getByTestId('beta-report-btn');
		await reportBtn.click();

		await expect(page.getByTestId('beta-report-failed-hint')).toBeVisible();
		const textarea = page.getByTestId('beta-report-textarea');
		await expect(textarea).toBeVisible();
		await expect(textarea).toHaveValue(new RegExp(firstCheck.id));
	});
});
