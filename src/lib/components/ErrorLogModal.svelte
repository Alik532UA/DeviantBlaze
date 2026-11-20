<script>
	import { focusTrap } from '#lib/utils/focusTrap.js';
	import { logService } from '#lib/services/logService.svelte.js';
	import { onDestroy } from 'svelte';

	/**
	 * @typedef {Object} Props
	 * @property {boolean} isOpen
	 * @property {() => void} onclose
	 */

	/** @type {Props} */
	let { isOpen, onclose } = $props();

	/** @type {'all' | 'error' | 'warn' | 'info'} */
	let activeFilter = $state('all');
	let copied = $state(false);
	/** @type {ReturnType<typeof setTimeout> | undefined} */
	let copyTimer;

	const logs = $derived(logService.logs);
	const errorCount = $derived(logs.filter((e) => e.level === 'error').length);
	const warnCount = $derived(logs.filter((e) => e.level === 'warn').length);
	const infoCount = $derived(logs.filter((e) => e.level === 'info').length);

	const filteredLogs = $derived(
		activeFilter === 'all'
			? [...logs].reverse()
			: logs.filter((e) => e.level === activeFilter).reverse()
	);

	function handleKeydown(/** @type {KeyboardEvent} */ event) {
		if (event.key === 'Escape') {
			onclose();
		}
	}

	async function copyReport() {
		const report = logService.getReport();
		try {
			await navigator.clipboard.writeText(report);
			copied = true;
			if (copyTimer) clearTimeout(copyTimer);
			copyTimer = setTimeout(() => (copied = false), 1500);
		} catch {
			/* clipboard write failed */
		}
	}

	onDestroy(() => {
		if (copyTimer) clearTimeout(copyTimer);
	});
</script>

<svelte:window onkeydown={isOpen ? handleKeydown : undefined} />

{#if isOpen}
	<div
		class="modal-backdrop"
		role="presentation"
		onclick={onclose}
		data-testid="error-log-modal-overlay"
	>
		<div
			class="modal-window"
			role="dialog"
			aria-modal="true"
			aria-labelledby="error-log-modal-title"
			tabindex="-1"
			use:focusTrap
			onclick={(e) => e.stopPropagation()}
			data-testid="error-log-modal-container"
		>
			<div class="modal-header">
				<div class="modal-title-group">
					<svg
						width="18"
						height="18"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="title-icon"
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
					<h2 id="error-log-modal-title" class="modal-title" data-testid="error-log-modal-title">
						Журнал помилок та діагностики
					</h2>
				</div>
				<button
					type="button"
					class="btn-close"
					onclick={onclose}
					aria-label="Закрити"
					data-testid="error-log-modal-close-btn"
				>
					<svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M18 6 6 18" />
						<path d="m6 6 12 12" />
					</svg>
				</button>
			</div>

			<div class="modal-toolbar">
				<div class="tabs" role="tablist" data-testid="error-log-modal-tabs">
					<button
						type="button"
						role="tab"
						aria-selected={activeFilter === 'all'}
						class="tab"
						class:tab--active={activeFilter === 'all'}
						onclick={() => (activeFilter = 'all')}
						data-testid="error-log-modal-all-tab"
					>
						Всі <span class="tab-badge">{logs.length}</span>
					</button>
					<button
						type="button"
						role="tab"
						aria-selected={activeFilter === 'error'}
						class="tab"
						class:tab--active={activeFilter === 'error'}
						onclick={() => (activeFilter = 'error')}
						data-testid="error-log-modal-error-tab"
					>
						Помилки <span class="tab-badge tab-badge--error">{errorCount}</span>
					</button>
					<button
						type="button"
						role="tab"
						aria-selected={activeFilter === 'warn'}
						class="tab"
						class:tab--active={activeFilter === 'warn'}
						onclick={() => (activeFilter = 'warn')}
						data-testid="error-log-modal-warn-tab"
					>
						Попередження <span class="tab-badge tab-badge--warn">{warnCount}</span>
					</button>
					<button
						type="button"
						role="tab"
						aria-selected={activeFilter === 'info'}
						class="tab"
						class:tab--active={activeFilter === 'info'}
						onclick={() => (activeFilter = 'info')}
						data-testid="error-log-modal-info-tab"
					>
						Інфо <span class="tab-badge tab-badge--info">{infoCount}</span>
					</button>
				</div>

				<div class="actions">
					<button
						type="button"
						class="btn-action"
						class:btn-action--copied={copied}
						onclick={copyReport}
						data-testid="error-log-modal-copy-btn"
					>
						{#if copied}
							<svg
								width="13"
								height="13"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2.5"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<polyline points="20 6 9 17 4 12" />
							</svg>
							<span>Скопійовано!</span>
						{:else}
							<svg
								width="13"
								height="13"
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
							<span>Скопіювати звіт</span>
						{/if}
					</button>
					<button
						type="button"
						class="btn-action"
						disabled={logs.length === 0}
						onclick={() => logService.clear()}
						data-testid="error-log-modal-clear-btn"
					>
						<svg
							width="13"
							height="13"
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
						<span>Очистити</span>
					</button>
				</div>
			</div>

			<div class="modal-body" data-testid="error-log-modal-list">
				{#if filteredLogs.length === 0}
					<div class="empty-state" data-testid="error-log-modal-empty-message">
						<svg
							width="32"
							height="32"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="1.5"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="empty-icon"
						>
							<polyline points="20 6 9 17 4 12" />
						</svg>
						<p>Жодних записів не знайдено для цієї категорії</p>
					</div>
				{:else}
					<div class="event-list">
						{#each filteredLogs as item (item.timestamp + item.message)}
							<div class="event-card event-card--{item.level}">
								<div class="event-header">
									<div class="event-tags">
										<span class="level-pill level-pill--{item.level}">
											{#if item.level === 'error'}
												<svg
													width="11"
													height="11"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													stroke-width="2"
													stroke-linecap="round"
													stroke-linejoin="round"
												>
													<circle cx="12" cy="12" r="10" />
													<line x1="12" x2="12" y1="8" y2="12" />
													<line x1="12" x2="12.01" y1="16" y2="16" />
												</svg>
											{:else if item.level === 'warn'}
												<svg
													width="11"
													height="11"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													stroke-width="2"
													stroke-linecap="round"
													stroke-linejoin="round"
												>
													<path
														d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"
													/>
													<line x1="12" x2="12" y1="9" y2="13" />
													<line x1="12" x2="12.01" y1="17" y2="17" />
												</svg>
											{:else}
												<svg
													width="11"
													height="11"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													stroke-width="2"
													stroke-linecap="round"
													stroke-linejoin="round"
												>
													<circle cx="12" cy="12" r="10" />
													<path d="M12 16v-4" />
													<path d="M12 8h.01" />
												</svg>
											{/if}
											{item.level}
										</span>
										{#if item.category}
											<span class="meta-pill">{item.category}</span>
										{/if}
									</div>
									<span class="event-time">{new Date(item.timestamp).toLocaleTimeString()}</span>
								</div>
								<div class="event-message">{item.message}</div>
								{#if item.data}
									<details class="event-stack">
										<summary>Дані / контекст</summary>
										<pre>{typeof item.data === 'string'
												? item.data
												: JSON.stringify(item.data, null, 2)}</pre>
									</details>
								{/if}
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.7);
		backdrop-filter: blur(4px);
		-webkit-backdrop-filter: blur(4px);
		z-index: 10000;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 16px;
	}
	.modal-window {
		width: 100%;
		max-width: 760px;
		max-height: 85dvh;
		background: #18181b;
		border: 1px solid rgba(255, 255, 255, 0.15);
		border-radius: 12px;
		display: flex;
		flex-direction: column;
		color: #f4f4f5;
		box-shadow:
			0 20px 25px -5px rgba(0, 0, 0, 0.5),
			0 8px 10px -6px rgba(0, 0, 0, 0.5);
		outline: none;
		overflow: hidden;
	}
	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 14px 18px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}
	.modal-title-group {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.title-icon {
		color: #ef4444;
	}
	.modal-title {
		font-size: 1rem;
		font-weight: 600;
		margin: 0;
		color: #f4f4f5;
	}
	.btn-close {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		border-radius: 6px;
		border: none;
		background: transparent;
		color: #f4f4f5;
		opacity: 0.7;
		cursor: pointer;
		transition:
			opacity 0.15s ease,
			background 0.15s ease;
	}
	.btn-close:hover {
		opacity: 1;
		background: rgba(255, 255, 255, 0.1);
	}
	.modal-toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
		padding: 8px 18px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
		background: rgba(0, 0, 0, 0.15);
		flex-wrap: wrap;
	}
	.tabs {
		display: flex;
		align-items: center;
		gap: 4px;
	}
	.tab {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 4px 10px;
		border-radius: 6px;
		border: 1px solid transparent;
		background: transparent;
		color: #f4f4f5;
		opacity: 0.7;
		font-size: 0.8125rem;
		cursor: pointer;
		transition: all 0.15s ease;
	}
	.tab:hover {
		opacity: 1;
		background: rgba(255, 255, 255, 0.05);
	}
	.tab--active {
		opacity: 1;
		background: rgba(255, 255, 255, 0.1);
		border-color: rgba(255, 255, 255, 0.2);
		font-weight: 600;
	}
	.tab-badge {
		font-size: 0.6875rem;
		padding: 1px 5px;
		border-radius: 10px;
		background: rgba(255, 255, 255, 0.15);
	}
	.tab-badge--error {
		background: #ef4444;
		color: #ffffff;
	}
	.tab-badge--warn {
		background: #f59e0b;
		color: #000000;
	}
	.tab-badge--info {
		background: #3b82f6;
		color: #ffffff;
	}
	.actions {
		display: flex;
		align-items: center;
		gap: 6px;
	}
	.btn-action {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 4px 10px;
		border-radius: 6px;
		border: 1px solid rgba(255, 255, 255, 0.15);
		background: rgba(255, 255, 255, 0.05);
		color: #f4f4f5;
		font-size: 0.8125rem;
		cursor: pointer;
		transition: all 0.15s ease;
	}
	.btn-action:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.12);
	}
	.btn-action:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}
	.btn-action--copied {
		background: #15803d !important;
		color: #ffffff !important;
		border-color: #15803d !important;
	}
	.modal-body {
		flex: 1;
		overflow-y: auto;
		padding: 14px 18px;
		min-height: 250px;
	}
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 40px 20px;
		color: #a1a1aa;
		text-align: center;
	}
	.empty-icon {
		color: #22c55e;
		margin-bottom: 8px;
	}
	.event-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.event-card {
		padding: 8px 12px;
		border-radius: 6px;
		background: rgba(255, 255, 255, 0.03);
		border-left: 3px solid rgba(255, 255, 255, 0.2);
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.event-card--error {
		border-left-color: #ef4444;
		background: rgba(239, 68, 68, 0.08);
	}
	.event-card--warn {
		border-left-color: #f59e0b;
		background: rgba(245, 158, 11, 0.08);
	}
	.event-card--info {
		border-left-color: #3b82f6;
		background: rgba(59, 130, 246, 0.08);
	}
	.event-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: 0.75rem;
	}
	.event-tags {
		display: flex;
		align-items: center;
		gap: 6px;
		flex-wrap: wrap;
	}
	.level-pill {
		display: inline-flex;
		align-items: center;
		gap: 3px;
		font-weight: 700;
		font-size: 0.625rem;
		padding: 1px 5px;
		border-radius: 4px;
		text-transform: uppercase;
	}
	.level-pill--error {
		background: #ef4444;
		color: #ffffff;
	}
	.level-pill--warn {
		background: #f59e0b;
		color: #000000;
	}
	.level-pill--info {
		background: #3b82f6;
		color: #ffffff;
	}
	.meta-pill {
		font-size: 0.6875rem;
		opacity: 0.6;
		font-family: ui-monospace, monospace;
	}
	.event-time {
		opacity: 0.5;
		font-family: ui-monospace, monospace;
		font-size: 0.6875rem;
	}
	.event-message {
		font-size: 0.8125rem;
		word-break: break-word;
		line-height: 1.4;
	}
	.event-stack {
		margin-top: 4px;
		font-size: 0.75rem;
		opacity: 0.8;
	}
	.event-stack summary {
		cursor: pointer;
		user-select: none;
		font-size: 0.6875rem;
		opacity: 0.6;
	}
	.event-stack summary:hover {
		opacity: 1;
	}
	.event-stack pre {
		margin: 6px 0 0;
		padding: 8px;
		border-radius: 6px;
		background: rgba(0, 0, 0, 0.4);
		font-family: ui-monospace, monospace;
		font-size: 0.6875rem;
		overflow-x: auto;
		white-space: pre-wrap;
		word-break: break-all;
	}
	@media (prefers-reduced-motion: reduce) {
		.btn-close,
		.tab,
		.btn-action {
			transition: none;
		}
	}
</style>
