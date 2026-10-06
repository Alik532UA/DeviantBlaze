<script>
	import { langStore } from './lang.svelte.js';

	let {
		isActive = false,
		currentMode = 'bars',
		audioSource = 'mic', // 'mic' | 'speakers'
		micStatus = 'mic',
		palette = 'blaze',
		sensitivity = 1.5,
		spectrumHeight = 1.0,
		onSelectMode = () => {},
		onSelectSource = () => {},
		onSelectPalette = () => {},
		onUpdateSensitivity = () => {},
		onUpdateSpectrumHeight = () => {},
		onClose = () => {}
	} = $props();

	let isSettingsOpen = $state(false);

	const PALETTES_LIST = [
		{ id: 'blaze', nameKey: 'pal_blaze', icon: '🔥', color: '#ff5f1f' },
		{ id: 'cyber', nameKey: 'pal_cyber', icon: '⚡', color: '#00f0ff' },
		{ id: 'gothic', nameKey: 'pal_gothic', icon: '💀', color: '#93c5fd' },
		{ id: 'toxic', nameKey: 'pal_toxic', icon: '🌿', color: '#10b981' },
		{ id: 'purple', nameKey: 'pal_purple', icon: '💜', color: '#ec4899' }
	];

	function cyclePalette() {
		const idx = PALETTES_LIST.findIndex(p => p.id === palette);
		const nextIdx = (idx + 1) % PALETTES_LIST.length;
		onSelectPalette?.(PALETTES_LIST[nextIdx].id);
	}
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

		<!-- Palette quick switch button -->
		<button
			type="button"
			class="vj-icon-btn vj-palette-btn"
			onclick={cyclePalette}
			title="{langStore.t('vj_color_theme')}: {langStore.t(PALETTES_LIST.find(p => p.id === palette)?.nameKey || 'pal_blaze')}"
			aria-label="Змінити палітру кольорів"
		>
			<span class="palette-swatch" style="background-color: {PALETTES_LIST.find(p => p.id === palette)?.color || '#ff5f1f'};"></span>
			<span>🎨</span>
		</button>

		<!-- Settings Popover Toggle Button -->
		<button
			type="button"
			class="vj-icon-btn vj-settings-btn"
			class:is-active={isSettingsOpen}
			onclick={() => (isSettingsOpen = !isSettingsOpen)}
			title={langStore.t('vj_settings')}
			aria-label="Налаштування візуалізатора"
		>
			⚙️
		</button>

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

		<!-- Settings Dropdown Drawer -->
		{#if isSettingsOpen}
			<div class="vj-settings-dropdown">
				<div class="setting-item">
					<div class="setting-label-row">
						<span class="setting-title">{langStore.t('vj_sensitivity')}</span>
						<span class="setting-val">{sensitivity.toFixed(1)}x</span>
					</div>
					<input
						type="range"
						min="0.5"
						max="3.5"
						step="0.1"
						value={sensitivity}
						oninput={(e) => onUpdateSensitivity?.(parseFloat(e.currentTarget.value))}
						class="vj-slider"
					/>
				</div>

				{#if currentMode === 'bars'}
					<div class="setting-item">
						<div class="setting-label-row">
							<span class="setting-title">{langStore.t('vj_spectrum_height')}</span>
							<span class="setting-val">{Math.round(spectrumHeight * 100)}%</span>
						</div>
						<input
							type="range"
							min="0.2"
							max="1.0"
							step="0.05"
							value={spectrumHeight}
							oninput={(e) => onUpdateSpectrumHeight?.(parseFloat(e.currentTarget.value))}
							class="vj-slider"
						/>
					</div>
				{/if}

				<div class="setting-item">
					<div class="setting-label-row">
						<span class="setting-title">{langStore.t('vj_color_theme')}</span>
					</div>
					<div class="palettes-picker">
						{#each PALETTES_LIST as p}
							<button
								type="button"
								class="palette-chip"
								class:is-active={palette === p.id}
								style="--chip-color: {p.color};"
								onclick={() => onSelectPalette?.(p.id)}
								title={langStore.t(p.nameKey)}
							>
								<span class="palette-dot"></span>
								<span class="palette-chip-name">{langStore.t(p.nameKey)}</span>
							</button>
						{/each}
					</div>
				</div>
			</div>
		{/if}
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
		gap: 0.55rem;
		padding: 0.45rem 0.8rem;
		background: rgba(14, 14, 18, 0.82);
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
		background: rgba(255, 255, 255, 0.9);
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
		padding: 0.3rem 0.65rem;
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

	.vj-icon-btn {
		position: relative;
		background: rgba(255, 255, 255, 0.08);
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 50%;
		width: 30px;
		height: 30px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.85rem;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.vj-icon-btn:hover {
		transform: scale(1.1);
		background: rgba(255, 255, 255, 0.15);
	}

	.vj-icon-btn.is-active {
		background: rgba(255, 255, 255, 0.22);
		border-color: #ff5f1f;
	}

	.palette-swatch {
		position: absolute;
		bottom: 2px;
		right: 2px;
		width: 8px;
		height: 8px;
		border-radius: 50%;
		border: 1px solid #ffffff;
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

	/* Settings Popover Drawer */
	.vj-settings-dropdown {
		position: absolute;
		top: calc(100% + 10px);
		right: 0;
		width: 280px;
		padding: 1.1rem;
		background: rgba(18, 18, 24, 0.94);
		backdrop-filter: blur(24px) saturate(180%);
		-webkit-backdrop-filter: blur(24px) saturate(180%);
		border: 1px solid rgba(255, 255, 255, 0.14);
		border-radius: 20px;
		box-shadow: 0 16px 40px rgba(0, 0, 0, 0.7);
		display: flex;
		flex-direction: column;
		gap: 1rem;
		animation: dropFade 0.25s cubic-bezier(0.16, 1, 0.3, 1);
	}

	@keyframes dropFade {
		from {
			opacity: 0;
			transform: translateY(-8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	:global([data-theme="light"]) .vj-settings-dropdown {
		background: rgba(255, 255, 255, 0.95);
		border-color: rgba(0, 0, 0, 0.12);
		box-shadow: 0 16px 40px rgba(0, 0, 0, 0.15);
	}

	.setting-item {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.setting-label-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: 0.78rem;
	}

	.setting-title {
		font-weight: 600;
		color: var(--text-primary, #ffffff);
	}

	.setting-val {
		color: #ff5f1f;
		font-weight: 700;
	}

	.vj-slider {
		-webkit-appearance: none;
		appearance: none;
		width: 100%;
		height: 6px;
		background: rgba(255, 255, 255, 0.15);
		border-radius: 9999px;
		outline: none;
	}

	.vj-slider::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: #ff5f1f;
		box-shadow: 0 0 8px rgba(255, 95, 31, 0.6);
		cursor: pointer;
	}

	.palettes-picker {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}

	.palette-chip {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.3rem 0.6rem;
		border-radius: 9999px;
		background: rgba(255, 255, 255, 0.06);
		border: 1px solid rgba(255, 255, 255, 0.12);
		color: var(--text-secondary, #9da3af);
		font-size: 0.72rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.palette-chip:hover {
		color: #ffffff;
		border-color: var(--chip-color);
	}

	.palette-chip.is-active {
		background: rgba(255, 255, 255, 0.15);
		border-color: var(--chip-color);
		color: #ffffff;
		box-shadow: 0 0 10px var(--chip-color);
	}

	.palette-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--chip-color);
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
		.vj-settings-dropdown {
			top: auto;
			bottom: calc(100% + 10px);
			right: 50%;
			transform: translateX(50%);
		}
	}
</style>
