<script>
	import { langStore } from './lang.svelte.js';

	let {
		isActive = false,
		currentMode = 'bars',
		audioSource = 'mic', // 'mic' | 'speakers'
		micStatus = 'mic',
		onSelectMode = () => {},
		onSelectSource = () => {},
		onClose = () => {}
	} = $props();
</script>

{#if isActive}
	<aside
		class="vj-control-bar"
		aria-label="Панель керування візуалізацією"
	>
		<!-- Status chip -->
		<div class="vj-status-chip">
			<span
				class="vj-pulse-dot"
				class:is-live={audioSource === 'mic' || audioSource === 'speakers'}
				class:is-speakers={audioSource === 'speakers'}
			></span>
			<span class="vj-status-text">
				{#if audioSource === 'speakers'}
					{langStore.t('vj_live_speakers')}
				{:else if audioSource === 'mic'}
					{langStore.t('vj_live_mic')}
				{:else}
					{langStore.t('vj_live_test')}
				{/if}
			</span>
		</div>

		<!-- Audio Source Selector: Мікрофон vs З колонок -->
		<div class="vj-toggle-group vj-sources">
			<button
				type="button"
				class="vj-toggle-btn"
				class:is-active={audioSource === 'mic'}
				onclick={() => onSelectSource?.('mic')}
				title={langStore.t('source_mic')}
			>
				{langStore.t('source_mic')}
			</button>
			<button
				type="button"
				class="vj-toggle-btn"
				class:is-active={audioSource === 'speakers'}
				onclick={() => onSelectSource?.('speakers')}
				title={langStore.t('source_speakers')}
			>
				{langStore.t('source_speakers')}
			</button>
		</div>

		<!-- Visualization Mode: Спектр | Хвиля | Радар -->
		<div class="vj-toggle-group vj-modes">
			<button
				type="button"
				class="vj-toggle-btn"
				class:is-active={currentMode === 'bars'}
				onclick={() => onSelectMode?.('bars')}
			>
				{langStore.t('mode_bars')}
			</button>
			<button
				type="button"
				class="vj-toggle-btn"
				class:is-active={currentMode === 'wave'}
				onclick={() => onSelectMode?.('wave')}
			>
				{langStore.t('mode_wave')}
			</button>
			<button
				type="button"
				class="vj-toggle-btn"
				class:is-active={currentMode === 'radar'}
				onclick={() => onSelectMode?.('radar')}
			>
				{langStore.t('mode_radar')}
			</button>
		</div>

		<!-- Exit Visualizer Button -->
		<button
			type="button"
			class="vj-exit-btn"
			onclick={() => onClose?.()}
			title={langStore.t('close_visualizer')}
			aria-label={langStore.t('close_visualizer')}
		>
			✕
		</button>
	</aside>
{/if}

<style>
	.vj-control-bar {
		position: fixed;
		top: 1.5rem;
		right: 1.5rem;
		z-index: 120;
		display: flex;
		align-items: center;
		gap: 0.65rem;
		padding: 0.45rem 0.8rem;
		background: rgba(14, 14, 18, 0.78);
		backdrop-filter: blur(20px) saturate(180%);
		-webkit-backdrop-filter: blur(20px) saturate(180%);
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 9999px;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5),
		            0 0 20px rgba(235, 30, 60, 0.2);
		animation: barSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
		transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1),
		            transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
	}

	@keyframes barSlideIn {
		from {
			opacity: 0;
			transform: translateY(-10px) scale(0.95);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	:global([data-theme="light"]) .vj-control-bar {
		background: rgba(255, 255, 255, 0.88);
		border-color: rgba(0, 0, 0, 0.1);
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1),
		            0 0 20px rgba(235, 30, 60, 0.1);
	}

	.vj-status-chip {
		display: flex;
		align-items: center;
		gap: 0.45rem;
		padding-right: 0.5rem;
		border-right: 1px solid rgba(255, 255, 255, 0.12);
	}

	:global([data-theme="light"]) .vj-status-chip {
		border-right-color: rgba(0, 0, 0, 0.1);
	}

	.vj-pulse-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: #6b7280;
	}

	.vj-pulse-dot.is-live {
		background: #10b981;
		box-shadow: 0 0 8px #10b981;
		animation: pulse 1.5s infinite;
	}

	.vj-pulse-dot.is-speakers {
		background: #3b82f6;
		box-shadow: 0 0 8px #3b82f6;
	}

	@keyframes pulse {
		0%, 100% {
			transform: scale(1);
			opacity: 1;
		}
		50% {
			transform: scale(0.8);
			opacity: 0.5;
		}
	}

	.vj-status-text {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--text-primary, #ffffff);
		letter-spacing: 0.02em;
		white-space: nowrap;
	}

	.vj-toggle-group {
		display: flex;
		gap: 0.25rem;
		background: rgba(255, 255, 255, 0.06);
		padding: 0.2rem;
		border-radius: 9999px;
	}

	:global([data-theme="light"]) .vj-toggle-group {
		background: rgba(0, 0, 0, 0.05);
	}

	.vj-toggle-btn {
		background: transparent;
		border: none;
		color: var(--text-secondary, #9da3af);
		padding: 0.3rem 0.7rem;
		border-radius: 9999px;
		font-size: 0.75rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		white-space: nowrap;
	}

	.vj-toggle-btn:hover {
		color: #ffffff;
	}

	:global([data-theme="light"]) .vj-toggle-btn:hover {
		color: #111827;
	}

	.vj-toggle-btn.is-active {
		background: linear-gradient(135deg, #eb1e3c 0%, #ff5f1f 100%);
		color: #ffffff;
		font-weight: 600;
		box-shadow: 0 2px 8px rgba(235, 30, 60, 0.35);
	}

	.vj-sources .vj-toggle-btn.is-active {
		background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
		box-shadow: 0 2px 8px rgba(37, 99, 235, 0.35);
	}

	.vj-exit-btn {
		background: transparent;
		border: none;
		color: var(--text-secondary, #9da3af);
		width: 26px;
		height: 26px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		font-size: 0.85rem;
		transition: all 0.2s ease;
	}

	.vj-exit-btn:hover {
		color: #ffffff;
		background: rgba(255, 255, 255, 0.1);
	}

	@media (max-width: 768px) {
		.vj-control-bar {
			top: auto;
			bottom: 5.5rem;
			right: 50%;
			transform: translateX(50%);
			max-width: 95vw;
			flex-wrap: wrap;
			justify-content: center;
			border-radius: 18px;
		}
	}
</style>
