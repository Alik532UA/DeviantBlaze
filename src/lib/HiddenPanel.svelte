<script>
	import { iconStyleStore } from './iconStyle.svelte.js';
	import { langStore } from './lang.svelte.js';
	import { ICONS } from './icons.js';

	let {
		isVisible = false,
		isVisualizerActive = false,
		onOpenVisualizer = () => {},
		onOpenPiano = () => {}
	} = $props();

	let style = $derived(iconStyleStore.current);
	let isFullscreen = $state(false);

	$effect(() => {
		if (typeof document === 'undefined') return;

		function onFsChange() {
			isFullscreen = !!document.fullscreenElement;
		}

		document.addEventListener('fullscreenchange', onFsChange);
		return () => {
			document.removeEventListener('fullscreenchange', onFsChange);
		};
	});

	function toggleFullscreen() {
		if (typeof document === 'undefined') return;

		if (!document.fullscreenElement) {
			document.documentElement.requestFullscreen().catch(() => {});
		} else {
			document.exitFullscreen().catch(() => {});
		}
	}

	function getIcon(name) {
		const set = ICONS[style] || ICONS.gothic;
		return set[name] || ICONS.gothic[name];
	}
</script>

<nav
	class="hidden-panel-wrapper"
	class:is-visible={isVisible}
	aria-label="Додаткові інструменти та дії"
	aria-hidden={!isVisible}
>
	<div class="hidden-panel-content">
		<!-- 1. Замовити сайт -->
		<a
			href="https://alik532ua.github.io/DigitalWorkshop/"
			target="_blank"
			rel="external noopener noreferrer"
			class="action-item"
			aria-label={langStore.t('order_site')}
		>
			<span class="action-icon-box">
				{#key style}
					<svg
						class="action-icon"
						viewBox={getIcon('order_site').viewBox}
						fill="currentColor"
						aria-hidden="true"
					>
						{@html getIcon('order_site').svg}
					</svg>
				{/key}
			</span>
			<span class="action-title">{langStore.t('order_site')}</span>
		</a>

		<!-- 2. Фортепіано -->
		<button
			type="button"
			class="action-item"
			data-testid="piano-open-btn"
			onclick={() => onOpenPiano?.()}
			aria-label={langStore.t('piano')}
		>
			<span class="action-icon-box">
				{#key style}
					<svg
						class="action-icon"
						viewBox={getIcon('piano').viewBox}
						fill="currentColor"
						aria-hidden="true"
					>
						{@html getIcon('piano').svg}
					</svg>
				{/key}
			</span>
			<span class="action-title">{langStore.t('piano')}</span>
		</button>

		<!-- 3. Візуалізація -->
		<button
			type="button"
			class="action-item"
			data-testid="vj-toggle-btn"
			class:is-active={isVisualizerActive}
			onclick={() => onOpenVisualizer?.()}
			aria-label={langStore.t('visualizer')}
			aria-pressed={isVisualizerActive}
		>
			<span class="action-icon-box">
				{#key style}
					<svg
						class="action-icon"
						viewBox={getIcon('visualizer').viewBox}
						fill="currentColor"
						aria-hidden="true"
					>
						{@html getIcon('visualizer').svg}
					</svg>
				{/key}
			</span>
			<span class="action-title">{langStore.t('visualizer')}</span>
		</button>

		<!-- 4. Стиль -->
		<button
			type="button"
			class="action-item style-toggle-item"
			onclick={() => iconStyleStore.toggle()}
			aria-label="{langStore.t('style_btn')} ({style === 'gothic' ? langStore.t('style_gothic') : langStore.t('style_classic')})"
			title="{langStore.t('style_btn')} (G)"
		>
			<span class="action-icon-box">
				{#key style}
					<svg
						class="action-icon"
						viewBox={getIcon('style_toggle').viewBox}
						fill="currentColor"
						aria-hidden="true"
					>
						{@html getIcon('style_toggle').svg}
					</svg>
				{/key}
			</span>
			<span class="action-title">{langStore.t('style_btn')}</span>
		</button>

		<!-- 5. Мова -->
		<button
			type="button"
			class="action-item lang-toggle-item"
			onclick={() => langStore.toggle()}
			aria-label={langStore.current === 'uk' ? 'Switch to English' : 'Перемкнути на українську'}
			title="{langStore.t('lang_btn')} (L)"
		>
			<span class="action-icon-box">
				{#key style}
					<svg
						class="action-icon"
						viewBox={getIcon('lang').viewBox}
						fill="currentColor"
						aria-hidden="true"
					>
						{@html getIcon('lang').svg}
					</svg>
				{/key}
			</span>
			<span class="action-title">{langStore.t('lang_btn')}</span>
		</button>

		<!-- 6. На весь екран -->
		<button
			type="button"
			class="action-item"
			onclick={toggleFullscreen}
			aria-label={isFullscreen ? langStore.t('fullscreen_exit') : langStore.t('fullscreen')}
			title="{isFullscreen ? langStore.t('fullscreen_exit') : langStore.t('fullscreen')} (F)"
		>
			<span class="action-icon-box">
				{#key style}
					<svg
						class="action-icon"
						viewBox={isFullscreen ? getIcon('fullscreen_exit').viewBox : getIcon('fullscreen').viewBox}
						fill="currentColor"
						aria-hidden="true"
					>
						{@html isFullscreen ? getIcon('fullscreen_exit').svg : getIcon('fullscreen').svg}
					</svg>
				{/key}
			</span>
			<span class="action-title">{isFullscreen ? langStore.t('fullscreen_exit') : langStore.t('fullscreen')}</span>
		</button>
	</div>
</nav>

<style>
	.hidden-panel-wrapper {
		position: fixed;
		bottom: 1.5rem;
		left: 0;
		right: 0;
		z-index: 25;
		display: flex;
		justify-content: center;
		pointer-events: none;
		opacity: 0;
		transform: translateY(40px) scale(0.96);
		transition: transform 0.65s cubic-bezier(0.16, 1, 0.3, 1),
		            opacity 0.55s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.hidden-panel-wrapper.is-visible {
		pointer-events: auto;
		opacity: 1;
		transform: translateY(0) scale(1);
	}

	.hidden-panel-content {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1.1rem;
		padding: 0.65rem 1.4rem;
		background: rgba(14, 14, 18, 0.65);
		backdrop-filter: blur(20px) saturate(180%);
		-webkit-backdrop-filter: blur(20px) saturate(180%);
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 9999px;
		box-shadow: 0 16px 40px -10px rgba(0, 0, 0, 0.6),
		            0 0 25px rgba(255, 255, 255, 0.04);
	}

	:global([data-theme="light"]) .hidden-panel-content {
		background: rgba(255, 255, 255, 0.72);
		border: 1px solid rgba(0, 0, 0, 0.1);
		box-shadow: 0 16px 40px -10px rgba(0, 0, 0, 0.12),
		            0 0 25px rgba(0, 0, 0, 0.03);
	}

	.action-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.35rem;
		padding: 0.45rem 0.65rem;
		border-radius: 14px;
		background: transparent;
		border: 1px solid transparent;
		color: var(--text-secondary, #9da3af);
		text-decoration: none;
		cursor: pointer;
		font-family: inherit;
		transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
		user-select: none;
		-webkit-user-select: none;
	}

	.action-item:hover {
		color: var(--text-primary, #ffffff);
		background: rgba(255, 255, 255, 0.07);
		border-color: rgba(255, 255, 255, 0.15);
		transform: translateY(-2px);
	}

	.action-item.is-active {
		color: #ffffff;
		background: linear-gradient(135deg, rgba(235, 30, 60, 0.3) 0%, rgba(255, 95, 31, 0.3) 100%);
		border-color: rgba(255, 95, 31, 0.6);
		box-shadow: 0 0 15px rgba(255, 95, 31, 0.35);
	}

	:global([data-theme="light"]) .action-item {
		color: var(--text-secondary);
	}

	:global([data-theme="light"]) .action-item:hover {
		background: rgba(0, 0, 0, 0.05);
		border-color: rgba(0, 0, 0, 0.1);
		color: var(--text-primary);
	}

	.action-icon-box {
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.action-item:hover .action-icon-box {
		transform: scale(1.14);
	}

	.action-icon {
		width: 22px;
		height: 22px;
		color: currentColor;
		display: block;
	}

	.action-title {
		font-size: 0.72rem;
		font-weight: 500;
		letter-spacing: 0.04em;
		white-space: nowrap;
		line-height: 1;
		transition: color 0.25s ease;
	}

	@media (max-width: 640px) {
		.hidden-panel-wrapper {
			bottom: 0.85rem;
			padding: 0 0.5rem;
			box-sizing: border-box;
		}

		.hidden-panel-content {
			display: grid;
			grid-template-columns: repeat(3, minmax(0, 1fr));
			gap: 0.35rem 0.45rem;
			padding: 0.6rem 0.65rem;
			width: 100%;
			max-width: 360px;
			border-radius: 22px;
			overflow: visible;
		}

		.action-item {
			padding: 0.35rem 0.25rem;
			gap: 0.2rem;
			border-radius: 12px;
			width: 100%;
			min-width: 0;
			box-sizing: border-box;
		}

		.action-icon-box {
			width: 28px;
			height: 28px;
		}

		.action-icon {
			width: 20px;
			height: 20px;
		}

		.action-title {
			font-size: 0.66rem;
			text-align: center;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
			max-width: 100%;
		}
	}
</style>
