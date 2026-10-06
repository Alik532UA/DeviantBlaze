<script>
	import { langStore } from './lang.svelte.js';
	import { iconStyleStore } from './iconStyle.svelte.js';
	import { themeStore } from './theme.svelte.js';
	import { ICONS } from './icons.js';

	let {
		isActive = false,
		currentMode = 'bars',
		audioSource = 'mic', // 'mic' | 'speakers'
		micStatus = 'mic',
		palette = 'blaze',
		sensitivity = 1.0,
		spectrumHeight = 1.0,
		isCollapsed = false,
		onToggleCollapse = () => {},
		onSelectMode = () => {},
		onSelectSource = () => {},
		onSelectPalette = () => {},
		onUpdateSensitivity = () => {},
		onUpdateSpectrumHeight = () => {},
		onClose = () => {}
	} = $props();

	let style = $derived(iconStyleStore.current);
	let isDark = $derived(themeStore.current === 'dark');

	function getIcon(name) {
		const set = ICONS[style] || ICONS.gothic;
		return set[name] || ICONS.gothic[name] || ICONS.classic[name];
	}

	let palettesList = $derived([
		{ id: 'blaze', nameKey: 'pal_blaze', color: '#ff5f1f' },
		{ id: 'cyber', nameKey: 'pal_cyber', color: '#00f0ff' },
		{ id: 'gothic', nameKey: 'pal_gothic', color: '#93c5fd' },
		{ id: 'toxic', nameKey: 'pal_toxic', color: '#10b981' },
		{ id: 'purple', nameKey: 'pal_purple', color: '#ec4899' },
		{ id: 'mono', nameKey: 'pal_mono', color: isDark ? '#ffffff' : '#000000' }
	]);

	// Proximity (10-100%) and Idle/Exit (0%) logic for collapsed eye button
	let eyeBtnEl = $state(null);
	let eyeOpacity = $state(0);
	let isEyeHovered = $state(false);

	let effectiveEyeOpacity = $derived.by(() => {
		if (!isActive || !isCollapsed) return 0;
		if (isEyeHovered) return 1;
		return eyeOpacity;
	});

	$effect(() => {
		if (typeof window === 'undefined') return;
		if (!isActive || !isCollapsed) {
			eyeOpacity = 0;
			return;
		}

		let eyeIdleTimer = null;
		const PROXIMITY_RADIUS = 350;

		function updateProximity(clientX, clientY) {
			if (!eyeBtnEl) return;
			const r = eyeBtnEl.getBoundingClientRect();
			const cx = r.left + r.width / 2;
			const cy = r.top + r.height / 2;
			const dist = Math.hypot(clientX - cx, clientY - cy);

			if (dist >= PROXIMITY_RADIUS) {
				// Cursor active in window, but far away: exactly 10% (0.1)
				eyeOpacity = 0.1;
			} else {
				// Cursor approaches: smoothly scale from 10% (0.1) to 100% (1.0)
				const t = Math.max(0, Math.min(1, 1 - dist / PROXIMITY_RADIUS));
				const ease = t * t * (3 - 2 * t);
				eyeOpacity = Math.round((0.1 + 0.9 * ease) * 100) / 100;
			}
		}

		function onPointerActivity(e) {
			if (eyeIdleTimer) clearTimeout(eyeIdleTimer);

			if (isEyeHovered) {
				eyeOpacity = 1;
			} else if (e.clientX !== undefined && e.clientY !== undefined) {
				updateProximity(e.clientX, e.clientY);
			} else {
				eyeOpacity = 0.1;
			}

			// Inactivity timer: when cursor stops moving for 2.5s, fade completely to 0%
			eyeIdleTimer = setTimeout(() => {
				if (!isEyeHovered) {
					eyeOpacity = 0;
				}
			}, 2500);
		}

		function onPointerInactive() {
			if (eyeIdleTimer) clearTimeout(eyeIdleTimer);
			if (!isEyeHovered) {
				eyeOpacity = 0;
			}
		}

		window.addEventListener('pointermove', onPointerActivity, { passive: true });
		window.addEventListener('pointerdown', onPointerActivity, { passive: true });
		window.addEventListener('pointerleave', onPointerInactive);
		document.addEventListener('mouseleave', onPointerInactive);
		window.addEventListener('blur', onPointerInactive);

		return () => {
			if (eyeIdleTimer) clearTimeout(eyeIdleTimer);
			window.removeEventListener('pointermove', onPointerActivity);
			window.removeEventListener('pointerdown', onPointerActivity);
			window.removeEventListener('pointerleave', onPointerInactive);
			document.removeEventListener('mouseleave', onPointerInactive);
			window.removeEventListener('blur', onPointerInactive);
		};
	});
</script>

{#if isActive}
	{#if isCollapsed}
		<!-- Згорнутий стан: кругла кнопка-глазик з динамічною прозорістю 0% / 10%-100% -->
		<button
			type="button"
			bind:this={eyeBtnEl}
			class="vj-collapsed-eye-btn"
			class:is-invisible={effectiveEyeOpacity <= 0.01}
			style="--eye-opacity: {effectiveEyeOpacity}; opacity: var(--eye-opacity);"
			onmouseenter={() => { isEyeHovered = true; }}
			onmouseleave={() => { isEyeHovered = false; }}
			onclick={() => onToggleCollapse?.()}
			title="{langStore.t('vj_expand')} (V)"
			aria-label={langStore.t('vj_expand')}
		>
			{#if getIcon('eye')}
				{@const icon = getIcon('eye')}
				<svg viewBox={icon.viewBox} class="vj-eye-svg" aria-hidden="true">
					{@html icon.svg}
				</svg>
			{/if}
		</button>
	{:else}
		<!-- Розгорнута панель керування візуалізацією -->
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
					<!-- Кнопка "Приховати" (глазик) -->
					<button
						type="button"
						class="vj-icon-btn vj-hide-btn"
						data-testid="vj-collapse-btn"
						onclick={() => onToggleCollapse?.()}
						title={langStore.t('vj_hide')}
						aria-label={langStore.t('vj_hide')}
					>
						{#if getIcon('eye')}
							{@const icon = getIcon('eye')}
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

			<!-- 4. Налаштування (завжди видимі внизу панелі) -->
			<div class="vj-settings-section">
				<!-- Чутливість -->
				<div class="setting-item">
					<div class="setting-label-row">
						<span class="setting-title">{langStore.t('vj_sensitivity')}</span>
						<span class="setting-val">{sensitivity.toFixed(1)}x</span>
					</div>
					<input
						type="range"
						min="0.1"
						max="1.5"
						step="0.1"
						value={sensitivity}
						oninput={(e) => onUpdateSensitivity?.(parseFloat(e.currentTarget.value))}
						class="vj-slider"
					/>
				</div>

				<!-- Висота спектру (якщо обрано режим "Спектр") -->
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

				<!-- Колір / Палітри -->
				<div class="setting-item">
					<div class="setting-label-row">
						<span class="setting-title">{langStore.t('vj_color_theme')}</span>
					</div>
					<div class="palettes-picker">
						{#each palettesList as p}
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
		</aside>
	{/if}
{/if}

<style>
	/* Згорнута кнопка-глазик для швидкого розгортання */
	.vj-collapsed-eye-btn {
		position: fixed;
		left: 1.5rem;
		top: 50%;
		transform: translateY(-50%);
		z-index: 120;
		width: 44px;
		height: 44px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(14, 14, 18, 0.78);
		backdrop-filter: blur(20px) saturate(180%);
		-webkit-backdrop-filter: blur(20px) saturate(180%);
		border: 1px solid rgba(255, 255, 255, 0.16);
		color: var(--text-primary);
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5),
		            0 0 16px rgba(235, 30, 60, 0.2);
		cursor: pointer;
		opacity: var(--eye-opacity, 0);
		transition: opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1),
		            transform 0.25s cubic-bezier(0.16, 1, 0.3, 1),
		            border-color 0.25s,
		            box-shadow 0.25s;
	}

	.vj-collapsed-eye-btn.is-invisible {
		pointer-events: none;
	}

	.vj-collapsed-eye-btn:hover {
		opacity: 1 !important;
		transform: translateY(-50%) scale(1.12);
		border-color: #ff5f1f;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6),
		            0 0 25px rgba(255, 95, 31, 0.45);
	}

	:global([data-theme="light"]) .vj-collapsed-eye-btn {
		background: rgba(255, 255, 255, 0.9);
		border-color: rgba(0, 0, 0, 0.14);
		color: #0a0a0d;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12),
		            0 0 15px rgba(0, 0, 0, 0.05);
	}

	:global([data-theme="light"]) .vj-collapsed-eye-btn:hover {
		border-color: #eb1e3c;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.18),
		            0 0 20px rgba(235, 30, 60, 0.25);
	}

	.vj-eye-svg {
		width: 22px;
		height: 22px;
		display: block;
	}

	/* Повна панель керування */
	.vj-control-bar {
		position: fixed;
		left: 1.5rem;
		top: 50%;
		transform: translateY(-50%);
		z-index: 120;
		display: flex;
		flex-direction: column;
		gap: 0.55rem;
		padding: 0.8rem 0.9rem;
		min-width: 280px;
		width: 295px;
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
		color: #ff5f1f;
		border-color: #ff5f1f;
	}

	:global([data-theme="light"]) .vj-icon-btn {
		background: rgba(0, 0, 0, 0.05);
		border-color: rgba(0, 0, 0, 0.12);
		color: #0a0a0d;
	}

	:global([data-theme="light"]) .vj-icon-btn:hover {
		background: rgba(0, 0, 0, 0.1);
		color: #eb1e3c;
		border-color: #eb1e3c;
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

	/* Налаштування завжди внизу меню */
	.vj-settings-section {
		display: flex;
		flex-direction: column;
		gap: 0.55rem;
		padding-top: 0.5rem;
		border-top: 1px solid rgba(255, 255, 255, 0.08);
	}

	:global([data-theme="light"]) .vj-settings-section {
		border-top-color: rgba(0, 0, 0, 0.08);
	}

	.setting-item {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.setting-label-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: 0.78rem;
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
		width: 15px;
		height: 15px;
		border-radius: 50%;
		background: #ff5f1f;
		box-shadow: 0 0 8px rgba(255, 95, 31, 0.6);
		cursor: pointer;
	}

	.palettes-picker {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
	}

	.palette-chip {
		display: inline-flex;
		align-items: center;
		gap: 0.32rem;
		padding: 0.28rem 0.55rem;
		border-radius: 9999px;
		background: rgba(255, 255, 255, 0.06);
		border: 1px solid rgba(255, 255, 255, 0.12);
		color: var(--text-secondary);
		font-size: 0.72rem;
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
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: var(--chip-color);
		box-shadow: 0 0 0 1px rgba(128, 128, 128, 0.4);
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

		.vj-collapsed-eye-btn {
			left: 50%;
			top: auto;
			bottom: 5.5rem;
			transform: translateX(-50%);
		}

		.vj-collapsed-eye-btn:hover {
			transform: translateX(-50%) scale(1.12);
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

	}
</style>
