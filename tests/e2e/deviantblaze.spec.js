import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Deviant Blaze — Smoke and Accessibility', () => {
	test('renders the portal and primary UI elements', async ({ page }) => {
		await page.goto('/');

		// Verify page title
		await expect(page).toHaveTitle(/Deviant Blaze/);

		// Verify central interactive logo stage
		const logoStage = page.locator('.logo-stage');
		await expect(logoStage).toBeVisible();

		// Verify music links container
		const musicLinks = page.locator('.music-container');
		await expect(musicLinks).toBeVisible();
	});

	test('renders top navigation and visualizer bar', async ({ page }) => {
		await page.goto('/');

		const topNav = page.locator('.top-nav');
		await expect(topNav).toBeVisible();

		const visualizerBar = page.locator('.visualizer-bar');
		await expect(visualizerBar).toBeVisible();
	});

	test('meets WCAG 2.1 AA accessibility standards on initial load', async ({ page }) => {
		await page.goto('/');

		const accessibilityScanResults = await new AxeBuilder({ page })
			.withTags(['wcag2a', 'wcag2aa'])
			.exclude('.visualizer-canvas')
			.analyze();

		const criticalViolations = accessibilityScanResults.violations.filter(
			(v) => v.impact === 'critical' || v.impact === 'serious'
		);

		expect(
			criticalViolations,
			`Accessibility violations found: ${JSON.stringify(criticalViolations, null, 2)}`
		).toEqual([]);
	});
});

