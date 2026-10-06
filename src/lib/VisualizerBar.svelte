<script>
	import { langStore } from './lang.svelte.js';
	import { iconStyleStore } from './iconStyle.svelte.js';
	import { ICONS } from './icons.js';

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

	let style = $derived(iconStyleStore.current);

	function getIcon(name) {
		const set = ICONS[style] || ICONS.gothic;
		return set[name] || ICONS.gothic[name] || ICONS.classic[name];
	}

	const PALETTES_LIST = [
		{ id: 'blaze', nameKey: 'pal_blaze', color: '#ff5f1f' },
		{ id: 'cyber', nameKey: 'pal_cyber', color: '#00f0ff' },
		{ id: 'gothic', nameKey: 'pal_gothic', color: '#93c5fd' },
		{ id: 'toxic', nameKey: 'pal_toxic', color: '#10b981' },
		{ id: 'purple', nameKey: 'pal_purple', color: '#ec4899' }
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
		<!-- 1. Верхній рядок: Статус + Швидкі інструменти -->
		<div class="vj-row vj-header-row">
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

			<div class="vj-actions-group">
				<!-- Palette quick switch button -->
				<button
					type="button"
					class="vj-icon-btn vj-palette-btn"
					onclick={cyclePalette}
					title="{langStore.t('vj_color_theme')}: {langStore.t(PALETTES_LIST.find(p => p.id === palette)?.nameKey || 'pal_blaze')}"
					aria-label="Змінити палітру кольорів"
				>
					<span class="palette-swatch" style="background-color: {PALETTES_LIST.find(p => p.id === palette)?.color || '#ff5f1f'};"></span>
					{#if getIcon('palette')}
						{@const icon = getIcon('palette')}
						<svg viewBox={icon.viewBox} class="bar-svg-icon" aria-hidden="true">
							{@html icon.svg}
						</svg>
					{/if}
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
					{#if getIcon('settings')}
						{@const icon = getIcon('settings')}
						<svg viewBox={icon.viewBox} class="bar-svg-icon" aria-hidden="true">
							{@html icon.svg}
						</svg>
					{/if}
				</button>

				<!-- Exit Visualizer Button -->
				<button
					type="button"
					class="vj-exit-btn"
					onclick={() => onClose?.()}
					title={langStore.t('close_visualizer')}
					aria-label={langStore.t('close_visualizer')}
				>
					{#if getIcon('close')}
						{@const icon = getIcon('close')}
						<svg viewBox={icon.viewBox} class="bar-svg-icon" aria-hidden="true">
							{@html icon.svg}
						</svg>
					{/if}
				</button>
			</div>
		</div>

		<!-- 2. Рядок джерел звуку: Мікрофон vs З колонок -->
		<div class="vj-row">
			<div class="vj-toggle-group vj-sources">
				<button
					type="button"
					class="vj-toggle-btn vj-btn-with-icon"
					class:is-active={audioSource === 'mic'}
					onclick={() => onSelectSource?.('mic')}
					title={langStore.t('source_mic')}
				>
					{#if getIcon('mic')}
						{@const icon = getIcon('mic')}
						<svg viewBox={icon.viewBox} class="inline-icon" aria-hidden="true">
							{@html icon.svg}
						</svg>
					{/if}
					<span>{langStore.t('source_mic')}</span>
				</button>
				<button
					type="button"
					class="vj-toggle-btn vj-btn-with-icon"
					class:is-active={audioSource === 'speakers'}
					onclick={() => onSelectSource?.('speakers')}
					title={langStore.t('source_speakers')}
				>
					{#if getIcon('speakers')}
						{@const icon = getIcon('speakers')}
						<svg viewBox={icon.viewBox} class="inline-icon" aria-hidden="true">
							{@html icon.svg}
						</svg>
					{/if}
					<span>{langStore.t('source_speakers')}</span>
				</button>
			</div>
		</div>

		<!-- 3. Рядок режимів: Спектр | Хвиля | Радар -->
		<div class="vj-row">
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
		</div>

		<!-- Settings Dropdown Drawer (з'являється праворуч від меню на десктопі) -->
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
		left: 1.5rem;
		top: 50%;
		transform: translateY(-50%);
		z-index: 120;
		display: flex;
		flex-direction: column;
		gap: 0.55rem;
		padding: 0.75rem 0.85rem;
		min-width: 275px;
		background: rgba(14, 14, 18, 0.88);
		backdrop-filter: blur(20px) saturate(180%);
		-webkit-backdrop-filter: blur(20px) saturate(180%);
		border: 1px solid rgba(255, 255, 255, 0.14);
		border-radius: 20px;
		box-shadow: 0 16px 40px rgba(0, 0, 0, 0.55),
		            0 0 20px rgba(235, 30, 60, 0.15);
		animation: barSlideInLeft 0.35s cubic-bezier(0.16, 1, 0.3, 1);
		transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1),
		            transform 0.8s cubic-bezier(0.16, 1, 0.3, 1),
		            background-color var(--transition-speed) var(--transition-easing),
		            border-color var(--transition-speed) var(--transition-easing);
	}

	@keyframes barSlideInLeft {
		from {
			opacity: 0;
			transform: translateY(-50%) translateX(-15px) scale(0.96);
		}
		to {
			opacity: 1;
			transform: translateY(-50%) translateX(0) scale(1);
		}
	}

	:global([data-theme="light"]) .vj-control-bar {
		background: rgba(255, 255, 255, 0.95);
		border-color: rgba(0, 0, 0, 0.12);
		box-shadow: 0 16px 40px rgba(0, 0, 0, 0.12),
		            0 0 15px rgba(0, 0, 0, 0.05);
	}

	.vj-row {
		display: flex;
		width: 100%;
	}

	.vj-header-row {
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		padding-bottom: 0.35rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);
	}

	:global([data-theme="light"]) .vj-header-row {
		border-bottom-color: rgba(0, 0, 0, 0.08);
	}

	.vj-status-chip {
		display: flex;
		align-items: center;
		gap: 0.45rem;
	}

	.vj-actions-group {
		display: flex;
		align-items: center;
		gap: 0.35rem;
	}

	.vj-pulse-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: #6b7280;
		flex-shrink: 0;
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
		font-size: 0.76rem;
		font-weight: 600;
		color: var(--text-primary);
		letter-spacing: 0.02em;
		white-space: nowrap;
	}

	:global([data-theme="light"]) .vj-status-text {
		color: #0a0a0d;
	}

	.vj-toggle-group {
		display: flex;
		width: 100%;
		gap: 0.25rem;
		background: rgba(255, 255, 255, 0.07);
		padding: 0.2rem;
		border-radius: 9999px;
	}

	:global([data-theme="light"]) .vj-toggle-group {
		background: rgba(0, 0, 0, 0.06);
	}

	.vj-toggle-btn {
		flex: 1;
		background: transparent;
		border: none;
		color: var(--text-secondary);
		padding: 0.32rem 0.5rem;
		border-radius: 9999px;
		font-size: 0.74rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		white-space: nowrap;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		text-align: center;
	}

	.vj-btn-with-icon {
		gap: 0.35rem;
	}

	.inline-icon {
		width: 13px;
		height: 13px;
		display: inline-block;
		flex-shrink: 0;
	}

	.bar-svg-icon {
		width: 15px;
		height: 15px;
		display: block;
		flex-shrink: 0;
	}

	.vj-toggle-btn:hover {
		color: var(--text-primary);
	}

	:global([data-theme="light"]) .vj-toggle-btn {
		color: #4b5563;
	}

	:global([data-theme="light"]) .vj-toggle-btn:hover {
		color: #000000;
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
		color: #ffffff;
	}

	.vj-icon-btn {
		position: relative;
		background: rgba(255, 255, 255, 0.08);
		border: 1px solid rgba(255, 255, 255, 0.14);
		border-radius: 50%;
		width: 28px;
		height: 28px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--text-primary);
		cursor: pointer;
		transition: all 0.2s ease;
		padding: 0;
	}

	.vj-icon-btn:hover {
		transform: scale(1.1);
		background: rgba(255, 255, 255, 0.15);
	}

	:global([data-theme="light"]) .vj-icon-btn {
		background: rgba(0, 0, 0, 0.05);
		border-color: rgba(0, 0, 0, 0.12);
		color: #0a0a0d;
	}

	:global([data-theme="light"]) .vj-icon-btn:hover {
		background: rgba(0, 0, 0, 0.1);
		color: #000000;
	}

	.vj-icon-btn.is-active {
		background: rgba(255, 255, 255, 0.22);
		border-color: #ff5f1f;
	}

	:global([data-theme="light"]) .vj-icon-btn.is-active {
		background: rgba(0, 0, 0, 0.1);
		border-color: #ff5f1f;
	}

	.palette-swatch {
		position: absolute;
		bottom: 1px;
		right: 1px;
		width: 7px;
		height: 7px;
		border-radius: 50%;
		border: 1px solid #ffffff;
		box-shadow: 0 0 3px rgba(0, 0, 0, 0.5);
	}

	:global([data-theme="light"]) .palette-swatch {
		border-color: #ffffff;
	}

	.vj-exit-btn {
		background: transparent;
		border: none;
		color: var(--text-secondary);
		width: 28px;
		height: 28px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.2s ease;
		padding: 0;
	}

	.vj-exit-btn:hover {
		color: #ffffff;
		background: rgba(255, 255, 255, 0.1);
	}

	:global([data-theme="light"]) .vj-exit-btn {
		color: #656573;
	}

	:global([data-theme="light"]) .vj-exit-btn:hover {
		color: #0a0a0d;
		background: rgba(0, 0, 0, 0.08);
	}

	/* Settings Popover Drawer (відкривається праворуч на десктопі) */
	.vj-settings-dropdown {
		position: absolute;
		left: calc(100% + 12px);
		top: 50%;
		transform: translateY(-50%);
		width: 280px;
		padding: 1.1rem;
		background: rgba(18, 18, 24, 0.96);
		backdrop-filter: blur(24px) saturate(180%);
		-webkit-backdrop-filter: blur(24px) saturate(180%);
		border: 1px solid rgba(255, 255, 255, 0.15);
		border-radius: 20px;
		box-shadow: 0 16px 40px rgba(0, 0, 0, 0.7);
		display: flex;
		flex-direction: column;
		gap: 1.05rem;
		animation: dropFadeRight 0.25s cubic-bezier(0.16, 1, 0.3, 1);
	}

	@keyframes dropFadeRight {
		from {
			opacity: 0;
			transform: translateY(-50%) translateX(-8px);
		}
		to {
			opacity: 1;
			transform: translateY(-50%) translateX(0);
		}
	}

	:global([data-theme="light"]) .vj-settings-dropdown {
		background: rgba(255, 255, 255, 0.98);
		border-color: rgba(0, 0, 0, 0.14);
		box-shadow: 0 16px 40px rgba(0, 0, 0, 0.16),
		            0 0 1px rgba(0, 0, 0, 0.1);
	}

	.setting-item {
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
	}

	.setting-label-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: 0.8rem;
	}

	.setting-title {
		font-weight: 600;
		color: var(--text-primary);
	}

	:global([data-theme="light"]) .setting-title {
		color: #0a0a0d;
		font-weight: 700;
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
		background: rgba(255, 255, 255, 0.2);
		border-radius: 9999px;
		outline: none;
	}

	:global([data-theme="light"]) .vj-slider {
		background: rgba(0, 0, 0, 0.16);
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
		padding: 0.32rem 0.6rem;
		border-radius: 9999px;
		background: rgba(255, 255, 255, 0.06);
		border: 1px solid rgba(255, 255, 255, 0.12);
		color: var(--text-secondary);
		font-size: 0.74rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	:global([data-theme="light"]) .palette-chip {
		background: rgba(0, 0, 0, 0.04);
		border-color: rgba(0, 0, 0, 0.12);
		color: #4b5563;
	}

	.palette-chip:hover {
		color: #ffffff;
		border-color: var(--chip-color);
	}

	:global([data-theme="light"]) .palette-chip:hover {
		color: #0a0a0d;
	}

	.palette-chip.is-active {
		background: rgba(255, 255, 255, 0.16);
		border-color: var(--chip-color);
		color: #ffffff;
		box-shadow: 0 0 10px var(--chip-color);
	}

	:global([data-theme="light"]) .palette-chip.is-active {
		background: rgba(0, 0, 0, 0.08);
		border-color: var(--chip-color);
		color: #0a0a0d;
		font-weight: 700;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.12), 0 0 8px var(--chip-color);
	}

	.palette-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--chip-color);
		flex-shrink: 0;
	}

	@media (max-width: 768px) {
		.vj-control-bar {
			left: 50%;
			top: auto;
			bottom: 5.5rem;
			transform: translateX(-50%);
			width: calc(100vw - 2rem);
			max-width: 330px;
			min-width: unset;
		}

		@keyframes barSlideInLeft {
			from {
				opacity: 0;
				transform: translateX(-50%) translateY(10px) scale(0.96);
			}
			to {
				opacity: 1;
				transform: translateX(-50%) translateY(0) scale(1);
			}
		}

		.vj-settings-dropdown {
			left: 50%;
			top: auto;
			bottom: calc(100% + 12px);
			transform: translateX(-50%);
		}

		@keyframes dropFadeRight {
			from {
				opacity: 0;
				transform: translateX(-50%) translateY(8px);
			}
			to {
				opacity: 1;
				transform: translateX(-50%) translateY(0);
			}
		}
	}
</style>
