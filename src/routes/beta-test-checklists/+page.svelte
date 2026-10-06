<script>
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { replaceState } from '$app/navigation';
	import { siteUrl } from '#lib/config/site.js';
	import { APP_VERSION } from '#lib/config/version.js';
	import { getItem, setItem, removeItem } from '#lib/services/storage.js';
	import {
		BETA_TABS,
		VOTES,
		sortChecks,
		vote,
		readMarks,
		doneOnVersion,
		tid
	} from '#lib/beta/checklist.js';

	// 1. Language state: 'uk' or 'en'
	let lang = $state('uk');

	function toggleLang() {
		lang = lang === 'uk' ? 'en' : 'uk';
	}

	// 2. Active Tab from URL search param `?tab=...` or default to first tab
	let activeTabId = $state(BETA_TABS[0]?.id || 'common');

	function selectTab(id) {
		activeTabId = id;
		if (typeof window !== 'undefined') {
			const url = new URL(page.url.href);
			url.searchParams.set('tab', id);
			replaceState(url.href, page.state);
		}
	}

	const currentTab = $derived(BETA_TABS.find((t) => t.id === activeTabId) || BETA_TABS[0]);
	const allChecks = $derived(BETA_TABS.flatMap((t) => t.checks));
	const knownIds = $derived(new Set(allChecks.map((c) => c.id)));

	// 3. Persistent marks state
	let marks = $state(/** @type {any} */ ({}));

	onMount(() => {
		try {
			const param = page.url.searchParams.get('tab');
			if (param && BETA_TABS.some((t) => t.id === param)) {
				activeTabId = param;
			}
		} catch {
			// Ignore prerender or searchParams restrictions
		}

		const raw = getItem('beta_checks_v1', null);
		if (raw) {
			marks = readMarks(raw, knownIds);
		}
	});

	function handleVote(checkId, voteType) {
		const next = vote(marks, checkId, /** @type {any} */ (voteType), APP_VERSION);
		marks = next;
		setItem('beta_checks_v1', marks);
	}

	// 4. Progress calculations
	const doneCount = $derived(doneOnVersion(allChecks, marks, APP_VERSION));
	const totalCount = $derived(allChecks.length);

	const otherVersionCount = $derived(
		allChecks.filter((c) => marks[c.id] && marks[c.id].version !== APP_VERSION).length
	);

	function getTabProgress(tab) {
		const tabChecks = tab.checks;
		const done = doneOnVersion(tabChecks, marks, APP_VERSION);
		return `${done} / ${tabChecks.length}`;
	}

	// 5. Two-step clear button (§ 6.3, § 6.3.1)
	let clearArmed = $state(false);
	let clearTimer = null;

	function handleClear() {
		if (clearTimer) clearTimeout(clearTimer);
		if (!clearArmed) {
			clearArmed = true;
			clearTimer = setTimeout(() => {
				clearArmed = false;
			}, 5000);
			return;
		}
		clearArmed = false;
		marks = {};
		removeItem('beta_checks_v1');
	}

	$effect(() => () => {
		if (clearTimer) clearTimeout(clearTimer);
	});

	// 6. Report generation and clipboard copy (§ 6.1, § 6.2)
	let reportHintVisible = $state(false);
	let reportFailedVisible = $state(false);
	let reportText = $state('');
	let reportTimer = null;

	function generateReport() {
		const dateIso = new Date().toISOString();
		const ua = typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown';
		const lines = [
			`# Звіт бета-тестування Deviant Blaze`,
			`- Версія: ${APP_VERSION}`,
			`- Дата: ${dateIso}`,
			`- User Agent: ${ua}`,
			`- Мова чеклиста: ${lang}`,
			`- Поступ на поточній версії: ${doneCount} / ${totalCount}`,
			''
		];

		const voted = allChecks.filter((c) => marks[c.id]);
		const failed = voted.filter((c) => marks[c.id]?.vote === 'fail');
		const unclear = voted.filter((c) => marks[c.id]?.vote === 'unclear');
		const ok = voted.filter((c) => marks[c.id]?.vote === 'ok');
		const skipped = voted.filter((c) => marks[c.id]?.vote === 'skip');

		const formatItem = (c, mark) => {
			const status = mark.vote === 'ok' ? 'ПРАЦЮЄ' : mark.vote === 'fail' ? 'НЕ ПРАЦЮЄ' : mark.vote === 'unclear' ? 'НЕ ЗРОЗУМІЛО' : 'ПРОПУЩЕНО';
			const stale = mark.version !== APP_VERSION ? ` (позначено на v${mark.version})` : '';
			let res = `[${status}] ${c.id} (${c.category[lang]}): ${c.text[lang]}${stale}`;
			if (c.coverage === 'covered' && mark.vote === 'fail' && c.test) {
				res += `\n    !!! ПУНКТ ПОКРИТО АВТОТЕСТОМ ${c.test} — тест не побачив помилки`;
			}
			return res;
		};

		if (failed.length) {
			lines.push('## Не працює:');
			failed.forEach((c) => lines.push(formatItem(c, marks[c.id])));
			lines.push('');
		}

		if (unclear.length) {
			lines.push('## Не зрозуміло:');
			unclear.forEach((c) => lines.push(formatItem(c, marks[c.id])));
			lines.push('');
		}

		if (ok.length) {
			lines.push('## Працює:');
			ok.forEach((c) => lines.push(formatItem(c, marks[c.id])));
			lines.push('');
		}

		if (skipped.length) {
			lines.push('## Пропущено:');
			skipped.forEach((c) => lines.push(formatItem(c, marks[c.id])));
			lines.push('');
		}

		return lines.join('\n');
	}

	async function handleCopyReport() {
		const text = generateReport();
		reportText = text;

		if (reportTimer) clearTimeout(reportTimer);
		reportHintVisible = false;
		reportFailedVisible = false;

		try {
			if (!navigator?.clipboard?.writeText) {
				throw new Error('Clipboard API unavailable');
			}
			await navigator.clipboard.writeText(text);
			reportHintVisible = true;
			reportTimer = setTimeout(() => {
				reportHintVisible = false;
			}, 3500);
		} catch {
			reportFailedVisible = true;
		}
	}

	// 7. Group checks by coverage level for the active tab
	const levels = $derived.by(() => {
		const checks = currentTab?.checks || [];
		const sorted = sortChecks(checks);
		const manual = sorted.filter((c) => c.coverage === 'manual');
		const testable = sorted.filter((c) => c.coverage === 'testable');
		const covered = sorted.filter((c) => c.coverage === 'covered');
		return [
			{
				coverage: 'manual',
				title: lang === 'uk' ? 'Тільки людина' : 'Human Only',
				subtitle: lang === 'uk' ? 'Машина цього не побачить. Починайте звідси.' : 'Automation cannot detect this. Start here.',
				checks: manual
			},
			{
				coverage: 'testable',
				title: lang === 'uk' ? 'Можна автотестом' : 'Automated Backlog',
				subtitle: lang === 'uk' ? 'Кандидати на покриття автотестами.' : 'Candidates for test automation.',
				checks: testable
			},
			{
				coverage: 'covered',
				title: lang === 'uk' ? 'Контрольна група' : 'Control Group',
				subtitle: lang === 'uk' ? 'Покрито автотестами. Знайдена помилка вказує на дефект тесту.' : 'Covered by tests. Finding a bug here indicates test defect.',
				checks: covered
			}
		].filter((l) => l.checks.length > 0);
	});

	// Enable natural window scrolling on beta checklist page
	$effect(() => {
		if (typeof document === 'undefined') return;
		const prevHtmlOverflowY = document.documentElement.style.overflowY;
		const prevHtmlHeight = document.documentElement.style.height;
		const prevBodyOverflowY = document.body.style.overflowY;
		const prevBodyHeight = document.body.style.height;

		document.documentElement.style.overflowY = 'auto';
		document.documentElement.style.height = 'auto';
		document.body.style.overflowY = 'auto';
		document.body.style.height = 'auto';

		return () => {
			document.documentElement.style.overflowY = prevHtmlOverflowY;
			document.documentElement.style.height = prevHtmlHeight;
			document.body.style.overflowY = prevBodyOverflowY;
			document.body.style.height = prevBodyHeight;
		};
	});
</script>

<svelte:head>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<main class="beta-page">
	<div class="beta-container">
		<!-- Header / Nav -->
		<header class="beta-header">
			<div class="beta-top-bar">
				<a href={siteUrl('/')} class="beta-back-btn" data-testid="beta-home-link">
					<svg viewBox="0 0 24 24" class="back-icon" aria-hidden="true">
						<path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
					</svg>
					<span>{lang === 'uk' ? 'Головний екран' : 'Main Screen'}</span>
				</a>

				<button
					type="button"
					class="beta-lang-btn"
					data-testid="beta-lang-btn"
					onclick={toggleLang}
					aria-label={lang === 'uk' ? 'Switch checklist language to English' : 'Перемкнути чеклист на українську'}
				>
					{lang === 'uk' ? 'EN' : 'UA'}
				</button>
			</div>

			<div class="beta-title-row">
				<h1 class="beta-title">
					{lang === 'uk' ? 'Чеклист бета-тестування' : 'Beta Testing Checklist'}
				</h1>
				<span class="beta-version-badge" data-testid="beta-version-text">v{APP_VERSION}</span>
			</div>

			<p class="beta-intro">
				{lang === 'uk'
					? 'Список перевірок для тестування сайту людиною. Усі позначки зберігаються локально у вашому браузері.'
					: 'Manual test checklist for validating the site. All marks are saved locally in your browser.'}
			</p>

			<!-- Overall Progress & Actions -->
			<div class="beta-summary-card">
				<div class="progress-info">
					<span class="progress-label">{lang === 'uk' ? 'Загальний поступ:' : 'Overall progress:'}</span>
					<strong class="progress-value" data-testid="beta-progress-value">{doneCount} / {totalCount}</strong>
					{#if otherVersionCount > 0}
						<span class="stale-count">
							({lang === 'uk' ? 'з іншої збірки:' : 'from other builds:'} {otherVersionCount})
						</span>
					{/if}
				</div>

				<div class="summary-actions">
					<button
						type="button"
						class="btn-report"
						data-testid="beta-report-btn"
						onclick={handleCopyReport}
					>
						📋 {lang === 'uk' ? 'Копіювати звіт' : 'Copy Report'}
					</button>

					<button
						type="button"
						class="btn-clear"
						class:is-armed={clearArmed}
						data-testid="beta-clear-btn"
						aria-live="polite"
						onclick={handleClear}
					>
						{clearArmed
							? (lang === 'uk' ? '⚠️ Підтвердити очищення' : '⚠️ Confirm Reset')
							: (lang === 'uk' ? 'Скинути позначки' : 'Reset Marks')}
					</button>
				</div>

				{#if reportHintVisible}
					<p class="report-hint success" data-testid="beta-report-hint">
						✅ {lang === 'uk' ? 'Звіт успішно скопійовано в буфер обміну!' : 'Report copied to clipboard!'}
					</p>
				{/if}

				{#if reportFailedVisible}
					<div class="report-fallback" data-testid="beta-report-failed-hint">
						<p class="report-hint error">
							⚠️ {lang === 'uk' ? 'Буфер обміну недоступний. Скопіюйте текст із поля нижче:' : 'Clipboard unavailable. Copy text from the box below:'}
						</p>
						<textarea
							class="report-textarea"
							readonly
							data-testid="beta-report-textarea"
							rows="8"
						>{reportText}</textarea>
					</div>
				{/if}
			</div>
		</header>

		<!-- Tabs bar (§ 8.2) -->
		<nav class="beta-tabs-nav" aria-label={lang === 'uk' ? 'Розділи чеклиста' : 'Checklist sections'}>
			{#each BETA_TABS as tab (tab.id)}
				<button
					type="button"
					class="beta-tab-btn"
					class:active={activeTabId === tab.id}
					aria-pressed={activeTabId === tab.id}
					data-testid="beta-tab-{tab.id}-btn"
					onclick={() => selectTab(tab.id)}
				>
					<span class="tab-title">{tab.title[lang]}</span>
					<span class="tab-progress" data-testid="beta-tab-{tab.id}-progress-text">
						{getTabProgress(tab)}
					</span>
				</button>
			{/each}
		</nav>

		<!-- Screen Link Badges (§ 8.4) -->
		{#if currentTab?.routes?.length}
			<div class="screen-links-bar" data-sveltekit-preload-data="off">
				<span class="screen-links-label">{lang === 'uk' ? 'Маршрут:' : 'Route:'}</span>
				{#each currentTab.routes as route}
					<a href={siteUrl(route)} class="screen-link-badge">
						{route === '/' ? (lang === 'uk' ? 'Головна (/)' : 'Home (/)') : route}
					</a>
				{/each}
			</div>
		{/if}

		<!-- Content: Level Sections and Check Cards -->
		{#if levels.length === 0}
			<div class="empty-tab-notice">
				<p>{lang === 'uk' ? 'тут поки нічого' : 'nothing here yet'}</p>
			</div>
		{:else}
			{#each levels as level (level.coverage)}
				<section class="level-section" data-testid="beta-level-{level.coverage}-section">
					<div class="level-header">
						<h2 class="level-title">
							{level.title} · {level.checks.length}
						</h2>
						<p class="level-subtitle">{level.subtitle}</p>
					</div>

					<div class="checks-list">
						{#each level.checks as check, i (check.id)}
							{@const currentMark = marks[check.id]}
							{@const checkTid = tid(check.id)}
							<div
								class="check-card"
								class:vote-ok={currentMark?.vote === 'ok'}
								class:vote-fail={currentMark?.vote === 'fail'}
								class:vote-unclear={currentMark?.vote === 'unclear'}
								class:vote-skip={currentMark?.vote === 'skip'}
								data-testid="beta-check-{checkTid}-item"
							>
								<div class="check-top-meta">
									<span class="check-num">#{i + 1}</span>
									<span class="check-category" data-testid="beta-check-{checkTid}-category-text">
										{check.category[lang]}
									</span>
									{#if check.negative}
										<span class="check-badge-negative" title="Перевірка межі / ліміту">
											{lang === 'uk' ? 'Межа' : 'Negative'}
										</span>
									{/if}
									{#if currentMark && currentMark.version !== APP_VERSION}
										<span
											class="check-stale-badge"
											data-testid="beta-check-{checkTid}-stale-hint"
										>
											{lang === 'uk' ? `позначено на v${currentMark.version}` : `marked on v${currentMark.version}`}
										</span>
									{/if}
								</div>

								<p class="check-text" data-testid="beta-check-{checkTid}-text">
									{check.text[lang]}
								</p>

								{#if check.coverage === 'covered' && check.test}
									<div class="test-source-info">
										<small>Тест: <code>{check.test}</code></small>
									</div>
								{/if}

								<!-- 4 Fixed Vote Buttons (§ 3.2, § 3.3) -->
								<div class="vote-buttons-row">
									<button
										type="button"
										class="vote-btn vote-ok"
										class:picked={currentMark?.vote === 'ok'}
										aria-pressed={currentMark?.vote === 'ok'}
										data-testid="beta-vote-{checkTid}-ok-btn"
										onclick={() => handleVote(check.id, 'ok')}
									>
										✓ {lang === 'uk' ? 'Працює' : 'Works'}
									</button>

									<button
										type="button"
										class="vote-btn vote-fail"
										class:picked={currentMark?.vote === 'fail'}
										aria-pressed={currentMark?.vote === 'fail'}
										data-testid="beta-vote-{checkTid}-fail-btn"
										onclick={() => handleVote(check.id, 'fail')}
									>
										✗ {lang === 'uk' ? 'Не працює' : 'Fails'}
									</button>

									<button
										type="button"
										class="vote-btn vote-unclear"
										class:picked={currentMark?.vote === 'unclear'}
										aria-pressed={currentMark?.vote === 'unclear'}
										data-testid="beta-vote-{checkTid}-unclear-btn"
										onclick={() => handleVote(check.id, 'unclear')}
									>
										? {lang === 'uk' ? 'Не зрозуміло' : 'Unclear'}
									</button>

									<button
										type="button"
										class="vote-btn vote-skip"
										class:picked={currentMark?.vote === 'skip'}
										aria-pressed={currentMark?.vote === 'skip'}
										data-testid="beta-vote-{checkTid}-skip-btn"
										onclick={() => handleVote(check.id, 'skip')}
									>
										— {lang === 'uk' ? 'Пропустити' : 'Skip'}
									</button>
								</div>
							</div>
						{/each}
					</div>
				</section>
			{/each}
		{/if}
	</div>
</main>

<style>
	:global(html:has(.beta-page)),
	:global(body:has(.beta-page)) {
		overflow-y: auto !important;
		height: auto !important;
		min-height: 100% !important;
	}

	:global(html:has(.beta-page)) {
		scrollbar-width: thin;
		scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
	}

	:global([data-theme="light"] html:has(.beta-page)) {
		scrollbar-color: rgba(0, 0, 0, 0.25) transparent;
	}

	.beta-page {
		min-height: 100vh;
		width: 100%;
		background: #09090c;
		color: #f3f4f6;
		font-family: inherit;
		padding: 2.5rem 1rem 5rem;
		box-sizing: border-box;
		user-select: text;
		-webkit-user-select: text;
	}

	:global([data-theme="light"]) .beta-page {
		background: #f8f9fa;
		color: #111827;
	}

	.beta-container {
		max-width: 820px;
		margin: 0 auto;
	}

	.beta-top-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1.5rem;
	}

	.beta-back-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		min-height: 44px;
		padding: 0.5rem 0.85rem;
		background: rgba(255, 255, 255, 0.08);
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 9999px;
		color: inherit;
		text-decoration: none;
		font-size: 0.85rem;
		font-weight: 500;
		transition: all 0.2s ease;
	}

	:global([data-theme="light"]) .beta-back-btn {
		background: rgba(0, 0, 0, 0.05);
		border-color: rgba(0, 0, 0, 0.1);
	}

	.beta-back-btn:hover {
		background: rgba(255, 255, 255, 0.14);
		transform: translateX(-2px);
	}

	.back-icon {
		width: 18px;
		height: 18px;
	}

	.beta-lang-btn {
		min-width: 44px;
		min-height: 44px;
		padding: 0.4rem 0.8rem;
		background: rgba(255, 255, 255, 0.08);
		border: 1px solid rgba(255, 255, 255, 0.15);
		border-radius: 10px;
		color: inherit;
		font-weight: 600;
		font-size: 0.85rem;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	:global([data-theme="light"]) .beta-lang-btn {
		background: rgba(0, 0, 0, 0.05);
		border-color: rgba(0, 0, 0, 0.1);
	}

	.beta-lang-btn:hover {
		background: rgba(255, 255, 255, 0.16);
	}

	.beta-title-row {
		display: flex;
		align-items: center;
		gap: 0.85rem;
		margin-bottom: 0.5rem;
	}

	.beta-title {
		margin: 0;
		font-size: 1.85rem;
		font-weight: 700;
		letter-spacing: -0.02em;
	}

	.beta-version-badge {
		font-size: 0.75rem;
		font-family: monospace;
		padding: 0.2rem 0.55rem;
		border-radius: 6px;
		background: rgba(235, 30, 60, 0.18);
		border: 1px solid rgba(235, 30, 60, 0.4);
		color: #ff5f1f;
		font-weight: 600;
	}

	.beta-intro {
		color: #9ca3af;
		font-size: 0.95rem;
		line-height: 1.5;
		margin: 0 0 1.5rem;
	}

	:global([data-theme="light"]) .beta-intro {
		color: #4b5563;
	}

	.beta-summary-card {
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 16px;
		padding: 1.15rem 1.4rem;
		margin-bottom: 2rem;
		backdrop-filter: blur(10px);
	}

	:global([data-theme="light"]) .beta-summary-card {
		background: #ffffff;
		border-color: rgba(0, 0, 0, 0.1);
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
	}

	.progress-info {
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
		margin-bottom: 1rem;
		font-size: 0.95rem;
	}

	.progress-value {
		font-size: 1.25rem;
		color: #22c55e;
	}

	.stale-count {
		font-size: 0.8rem;
		color: #9ca3af;
	}

	.summary-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	.btn-report,
	.btn-clear {
		min-height: 44px;
		padding: 0.55rem 1.1rem;
		border-radius: 10px;
		font-size: 0.88rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		border: 1px solid transparent;
	}

	.btn-report {
		background: #eb1e3c;
		color: #ffffff;
	}

	.btn-report:hover {
		background: #ff5f1f;
		transform: translateY(-1px);
	}

	.btn-clear {
		background: rgba(255, 255, 255, 0.08);
		border-color: rgba(255, 255, 255, 0.15);
		color: inherit;
	}

	:global([data-theme="light"]) .btn-clear {
		background: rgba(0, 0, 0, 0.05);
		border-color: rgba(0, 0, 0, 0.12);
	}

	.btn-clear:hover {
		background: rgba(255, 255, 255, 0.14);
	}

	.btn-clear.is-armed {
		background: #dc2626;
		color: #ffffff;
		border-color: #ef4444;
		animation: pulseBtn 1s infinite alternate;
	}

	@keyframes pulseBtn {
		from { opacity: 0.85; }
		to { opacity: 1; }
	}

	.report-hint {
		margin-top: 0.85rem;
		margin-bottom: 0;
		font-size: 0.85rem;
		font-weight: 500;
	}

	.report-hint.success {
		color: #22c55e;
	}

	.report-hint.error {
		color: #ef4444;
	}

	.report-fallback {
		margin-top: 0.85rem;
	}

	.report-textarea {
		width: 100%;
		margin-top: 0.5rem;
		box-sizing: border-box;
		padding: 0.75rem;
		background: rgba(0, 0, 0, 0.4);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 8px;
		color: inherit;
		font-family: monospace;
		font-size: 0.78rem;
	}

	/* Tabs */
	.beta-tabs-nav {
		display: flex;
		gap: 0.6rem;
		margin-bottom: 1.25rem;
		overflow-x: auto;
		padding-bottom: 0.25rem;
	}

	.beta-tab-btn {
		min-height: 44px;
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1.1rem;
		border-radius: 9999px;
		background: rgba(255, 255, 255, 0.06);
		border: 1px solid rgba(255, 255, 255, 0.1);
		color: inherit;
		cursor: pointer;
		font-weight: 500;
		font-size: 0.88rem;
		white-space: nowrap;
		transition: all 0.2s ease;
	}

	:global([data-theme="light"]) .beta-tab-btn {
		background: rgba(0, 0, 0, 0.04);
		border-color: rgba(0, 0, 0, 0.1);
	}

	.beta-tab-btn:hover {
		background: rgba(255, 255, 255, 0.12);
	}

	.beta-tab-btn.active {
		background: #eb1e3c;
		border-color: #eb1e3c;
		color: #ffffff;
		font-weight: 600;
	}

	.tab-progress {
		font-size: 0.75rem;
		opacity: 0.85;
		font-family: monospace;
	}

	/* Screen links bar (§ 8.4) */
	.screen-links-bar {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		margin-bottom: 2rem;
		font-size: 0.82rem;
	}

	.screen-links-label {
		color: #9ca3af;
	}

	.screen-link-badge {
		min-width: 44px;
		min-height: 44px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.4rem 0.85rem;
		border-radius: 8px;
		background: rgba(255, 255, 255, 0.08);
		border: 1px solid rgba(255, 255, 255, 0.14);
		color: #ff5f1f;
		text-decoration: none;
		font-weight: 500;
		transition: background 0.2s;
	}

	:global([data-theme="light"]) .screen-link-badge {
		background: rgba(0, 0, 0, 0.05);
		border-color: rgba(0, 0, 0, 0.1);
	}

	.screen-link-badge:hover {
		background: rgba(255, 255, 255, 0.15);
	}

	/* Level sections */
	.level-section {
		margin-bottom: 2.5rem;
	}

	.level-header {
		margin-bottom: 1rem;
	}

	.level-title {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 600;
		letter-spacing: -0.01em;
	}

	.level-subtitle {
		margin: 0.25rem 0 0;
		color: #9ca3af;
		font-size: 0.82rem;
	}

	.checks-list {
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
	}

	/* Check card & border coloring */
	.check-card {
		background: rgba(255, 255, 255, 0.03);
		border: 2px solid rgba(255, 255, 255, 0.08);
		border-radius: 14px;
		padding: 1.1rem 1.25rem;
		transition: border-color 0.2s ease, background 0.2s ease;
	}

	:global([data-theme="light"]) .check-card {
		background: #ffffff;
		border-color: rgba(0, 0, 0, 0.08);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
	}

	.check-card.vote-ok {
		border-color: #22c55e;
	}

	.check-card.vote-fail {
		border-color: #ef4444;
	}

	.check-card.vote-unclear {
		border-color: #fbbf24;
	}

	.check-card.vote-skip {
		border-color: #38bdf8;
	}

	.check-top-meta {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.45rem;
		font-size: 0.76rem;
	}

	.check-num {
		color: #6b7280;
		font-family: monospace;
	}

	.check-category {
		padding: 0.15rem 0.5rem;
		border-radius: 9999px;
		background: rgba(255, 255, 255, 0.08);
		color: #d1d5db;
		font-weight: 500;
	}

	:global([data-theme="light"]) .check-category {
		background: rgba(0, 0, 0, 0.06);
		color: #4b5563;
	}

	.check-badge-negative {
		padding: 0.15rem 0.45rem;
		border-radius: 9999px;
		background: rgba(239, 68, 68, 0.18);
		color: #f87171;
		font-weight: 600;
	}

	.check-stale-badge {
		font-size: 0.72rem;
		color: #fbbf24;
		opacity: 0.85;
	}

	.check-text {
		margin: 0 0 1rem;
		font-size: 0.95rem;
		line-height: 1.5;
	}

	.test-source-info {
		margin-bottom: 0.85rem;
		color: #9ca3af;
		font-size: 0.75rem;
	}

	.test-source-info code {
		background: rgba(0, 0, 0, 0.3);
		padding: 0.15rem 0.35rem;
		border-radius: 4px;
	}

	/* Vote buttons row */
	.vote-buttons-row {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 0.5rem;
	}

	@media (max-width: 580px) {
		.vote-buttons-row {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	.vote-btn {
		min-height: 44px;
		padding: 0.5rem 0.6rem;
		border-radius: 10px;
		cursor: pointer;
		font-size: 0.84rem;
		font-weight: 500;
		transition: all 0.2s ease;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: rgba(255, 255, 255, 0.04);
		color: inherit;
		border: 1px solid rgba(255, 255, 255, 0.12);
	}

	:global([data-theme="light"]) .vote-btn {
		background: rgba(0, 0, 0, 0.03);
		border-color: rgba(0, 0, 0, 0.1);
	}

	/* Unpicked button subtle color hints via color-mix (§ 3.2) */
	.vote-btn.vote-ok:not(.picked) {
		background: color-mix(in srgb, transparent, #22c55e 6%);
		border-color: color-mix(in srgb, rgba(255, 255, 255, 0.15), #22c55e 35%);
	}

	.vote-btn.vote-fail:not(.picked) {
		background: color-mix(in srgb, transparent, #ef4444 6%);
		border-color: color-mix(in srgb, rgba(255, 255, 255, 0.15), #ef4444 35%);
	}

	.vote-btn.vote-unclear:not(.picked) {
		background: color-mix(in srgb, transparent, #fbbf24 6%);
		border-color: color-mix(in srgb, rgba(255, 255, 255, 0.15), #fbbf24 35%);
	}

	.vote-btn.vote-skip:not(.picked) {
		background: color-mix(in srgb, transparent, #38bdf8 6%);
		border-color: color-mix(in srgb, rgba(255, 255, 255, 0.15), #38bdf8 35%);
	}

	/* Picked states (§ 3.2): 4px border, color background, semi-bold text */
	.vote-btn.vote-ok.picked {
		border: 4px solid #22c55e;
		background: rgba(34, 197, 94, 0.25);
		color: #4ade80;
		font-weight: 700;
	}

	.vote-btn.vote-fail.picked {
		border: 4px solid #ef4444;
		background: rgba(239, 68, 68, 0.25);
		color: #f87171;
		font-weight: 700;
	}

	.vote-btn.vote-unclear.picked {
		border: 4px solid #fbbf24;
		background: rgba(251, 191, 36, 0.25);
		color: #fde047;
		font-weight: 700;
	}

	.vote-btn.vote-skip.picked {
		border: 4px solid #38bdf8;
		background: rgba(56, 189, 248, 0.25);
		color: #7dd3fc;
		font-weight: 700;
	}

	.empty-tab-notice {
		padding: 3rem 1rem;
		text-align: center;
		color: #9ca3af;
		font-size: 0.95rem;
	}
</style>
