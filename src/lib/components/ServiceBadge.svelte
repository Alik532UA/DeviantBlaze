<script>
	import { onDestroy } from 'svelte';
	import { debugMode } from '#lib/services/debugMode.svelte.js';
	import { createKeySequence } from '#lib/services/keySequence.js';
	import { logService } from '#lib/services/logService.svelte.js';
	import ErrorLogModal from './ErrorLogModal.svelte';

	const browser = typeof window !== 'undefined';
	let copied = $state(false);
	/** @type {string | null} */
	let fallbackReport = $state(null);
	/** @type {ReturnType<typeof setTimeout> | undefined} */
	let copyTimer;

	let menuOpen = $state(false);
	let modalOpen = $state(false);
	let userDismissed = $state(false);

	const versionSequence = createKeySequence({
		code: 'KeyV',
		threshold: () => debugMode.pressesToToggle,
		onComplete: () => {
			debugMode.toggle();
		}
	});

	function handleKeydown(/** @type {KeyboardEvent} */ event) {
		versionSequence.handle(event);
		if (event.key === 'Escape' && menuOpen) {
			menuOpen = false;
		}
	}

	function handleWindowClick(/** @type {MouseEvent} */ e) {
		if (!menuOpen) return;
		const target = /** @type {HTMLElement | null} */ (e.target);
		if (!target?.closest('.service-badge-wrapper')) {
			menuOpen = false;
		}
	}

	const appVersion = $derived(logService.appVersion);
	const errorCount = $derived(logService.errorCount);

	$effect(() => {
		if (debugMode.enabled) userDismissed = false;
	});

	const urlDebug = $derived(
		browser &&
			typeof window !== 'undefined' &&
			new URLSearchParams(window.location.search).get('debug') === '1'
	);
	const isVisible = $derived(!userDismissed && (urlDebug || debugMode.enabled));

	onDestroy(() => {
		if (copyTimer) clearTimeout(copyTimer);
	});

	async function copyReport() {
		const report = logService.getReport();
		try {
			await navigator.clipboard.writeText(report);
			fallbackReport = null;
			copied = true;
			if (copyTimer) clearTimeout(copyTimer);
			copyTimer = setTimeout(() => (copied = false), 1500);
		} catch (error) {
			logService.warn('ui', 'Failed to copy log report to clipboard', error);
			fallbackReport = report;
		}
	}

	async function handleAction(/** @type {'copy' | 'modal' | 'clear' | 'hide'} */ action) {
		menuOpen = false;
		if (action === 'copy') await copyReport();
		else if (action === 'modal') modalOpen = true;
		else if (action === 'clear') logService.clear();
		else if (action === 'hide') {
			userDismissed = true;
			if (debugMode.enabled) debugMode.toggle();
		}
	}
</script>

<svelte:window onclick={handleWindowClick} onkeydown={handleKeydown} />

{#if fallbackReport}
	<textarea
		class="log-fallback"
		readonly
		value={fallbackReport}
		aria-label="Debug report fallback"
		data-testid="service-badge-report-textarea"></textarea>
{/if}

{#if isVisible}
	<div class="service-badge-wrapper">
		{#if menuOpen}
			<div class="menu" role="menu" data-testid="service-badge-context-menu">
				<button
					type="button"
					class="menu-item"
					role="menuitem"
					onclick={() => handleAction('copy')}
					data-testid="service-badge-copy-report-btn"
				>
					<svg
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
						<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
					</svg>
					<span class="menu-item__text">Скопіювати повний звіт</span>
				</button>
				<button
					type="button"
					class="menu-item"
					role="menuitem"
					onclick={() => handleAction('modal')}
					data-testid="service-badge-view-errors-btn"
				>
					<svg
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="m8 2 1.88 1.88" />
						<path d="M14.12 3.88 16 2" />
						<path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1" />
						<path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6" />
						<path d="M12 20v-9" />
						<path d="M6.53 9C4.6 8.8 3 7.1 3 5" />
						<path d="M6 13H2" />
						<path d="M3 21c0-2.1 1.7-3.9 3.8-4" />
						<path d="M20.97 5c0 2.1-1.6 3.8-3.5 4" />
						<path d="M22 13h-4" />
						<path d="M17.2 17c2.1.1 3.8 1.9 3.8 4" />
					</svg>
					<span class="menu-item__text">Переглянути помилки</span>
					<span class="menu-item__count" class:menu-item__count--has-errors={errorCount > 0}>
						{errorCount > 99 ? '99+' : errorCount}
					</span>
				</button>
				<button
					type="button"
					class="menu-item"
					role="menuitem"
					onclick={() => handleAction('clear')}
					data-testid="service-badge-clear-btn"
				>
					<svg
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M3 6h18" />
						<path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
						<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
					</svg>
					<span class="menu-item__text">Скинути лічильник</span>
				</button>
				<div class="menu-separator" role="separator"></div>
				<button
					type="button"
					class="menu-item menu-item--hide"
					role="menuitem"
					onclick={() => handleAction('hide')}
					data-testid="service-badge-hide-btn"
				>
					<svg
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
						<path
							d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"
						/>
						<path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
						<line x1="2" x2="22" y1="2" y2="22" />
					</svg>
					<span class="menu-item__text">Приховати табло</span>
				</button>
			</div>
		{/if}

		<button
			type="button"
			class="service-badge"
			class:has-errors={errorCount > 0}
			class:copied
			onclick={() => (menuOpen = !menuOpen)}
			oncontextmenu={(e) => {
				e.preventDefault();
				menuOpen = true;
			}}
			aria-label="Copy debug report — {appVersion}"
			aria-haspopup="menu"
			aria-expanded={menuOpen}
			data-testid="app-version-value"
		>
			{#if copied}
				<svg
					width="14"
					height="14"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<polyline points="20 6 9 17 4 12" />
				</svg>
			{:else if errorCount > 0}
				<span class="count">{errorCount > 99 ? '99+' : errorCount}</span>
			{:else}
				<svg
					width="12"
					height="12"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
					<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
				</svg>
			{/if}
			<span class="version">{appVersion}</span>
		</button>
	</div>
{/if}

<ErrorLogModal isOpen={modalOpen} onclose={() => (modalOpen = false)} />

<style>
	.service-badge-wrapper {
		display: contents;
	}

	.menu {
		position: fixed;
		bottom: 56px;
		left: 16px;
		z-index: 10000;
		display: flex;
		flex-direction: column;
		min-width: 210px;
		padding: 6px;
		border-radius: 12px;
		background: #242424;
		border: 1px solid #444444;
		box-shadow:
			0 10px 25px -5px rgba(0, 0, 0, 0.5),
			0 8px 10px -6px rgba(0, 0, 0, 0.4);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
	}

	.menu-item {
		display: flex;
		align-items: center;
		gap: 8px;
		width: 100%;
		padding: 7px 10px;
		border: none;
		border-radius: 6px;
		background: transparent;
		color: #ffffff;
		cursor: pointer;
		font-size: 0.8125rem;
		text-align: left;
		transition: background 0.15s ease;
	}

	.menu-item:hover {
		background: rgba(255, 255, 255, 0.1);
	}

	.menu-item__text {
		flex: 1;
	}

	.menu-item__count {
		font-size: 0.6875rem;
		font-weight: 700;
		padding: 1px 5px;
		border-radius: 8px;
		background: rgba(255, 255, 255, 0.1);
		color: #ffffff;
	}

	.menu-item__count--has-errors {
		background: #7f1d1d;
		color: #ffffff;
	}

	.menu-separator {
		height: 1px;
		background: rgba(255, 255, 255, 0.1);
		margin: 4px 0;
	}

	.menu-item--hide {
		opacity: 0.8;
	}

	.menu-item--hide:hover {
		opacity: 1;
		color: #ef4444;
	}

	.service-badge {
		position: fixed;
		bottom: 16px;
		left: 16px;
		z-index: 9999;
		display: flex;
		align-items: center;
		gap: 6px;
		min-height: 32px;
		padding: 0 10px;
		border-radius: 16px;
		background: #242424;
		color: #ffffff;
		border: 1px solid #444444;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
		cursor: pointer;
		font-family: inherit;
		transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	.service-badge:hover {
		transform: scale(1.05);
	}

	.service-badge.has-errors {
		background: #c92a2a;
		border-color: #7f1d1d;
		color: #ffffff;
	}

	.service-badge.copied {
		background: #237a35;
		border-color: #1b5e20;
		color: #ffffff;
	}

	.count {
		padding: 2px 5px;
		border-radius: 8px;
		background: #7f1d1d;
		color: #ffffff;
		font-size: 10px;
		font-weight: 800;
		line-height: 1;
		font-family: monospace;
	}

	.version {
		font-size: 11px;
		font-family: monospace;
		line-height: 1;
		white-space: nowrap;
	}

	.log-fallback {
		position: fixed;
		bottom: 60px;
		left: 16px;
		right: 16px;
		height: 40dvh;
		z-index: 9999;
		padding: 8px;
		font-family: monospace;
		font-size: 0.75rem;
		background: #1e1e1e;
		color: #ffffff;
		border: 2px solid #ef4444;
		border-radius: 8px;
		resize: none;
	}

	@media (pointer: coarse) {
		.service-badge {
			min-height: 44px;
			padding: 0 14px;
			border-radius: 22px;
		}

		.version {
			font-size: 12px;
		}

		.menu {
			bottom: 68px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.service-badge,
		.menu-item {
			transition: none;
		}
	}
</style>
