<script>
	import { iconStyleStore } from './iconStyle.svelte.js';
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
		<!-- 1. Візуалізація -->
		<button
			type="button"
			class="action-item"
			class:is-active={isVisualizerActive}
			onclick={() => onOpenVisualizer?.()}
			aria-label={isVisualizerActive ? 'Вимкнути фонову аудіовізуалізацію' : 'Увімкнути фонову аудіовізуалізацію'}
			aria-pressed={isVisualizerActive}
		>
			<span class="action-icon-box">
				<svg
					class="action-icon"
					viewBox={getIcon('visualizer').viewBox}
					fill="currentColor"
					aria-hidden="true"
				>
					{@html getIcon('visualizer').svg}
				</svg>
			</span>
			<span class="action-title">Візуалізація</span>
		</button>

		<!-- 2. Фортепіано -->
		<button
			type="button"
			class="action-item"
			onclick={() => onOpenPiano?.()}
			aria-label="Відкрити фортепіано"
		>
			<span class="action-icon-box">
				<svg
					class="action-icon"
					viewBox={getIcon('piano').viewBox}
					fill="currentColor"
					aria-hidden="true"
				>
					{@html getIcon('piano').svg}
				</svg>
			</span>
			<span class="action-title">Фортепіано</span>
		</button>

		<!-- 3. На весь екран -->
		<button
			type="button"
			class="action-item"
			onclick={toggleFullscreen}
			aria-label={isFullscreen ? 'Вийти з повного екрану' : 'На весь екран'}
		>
			<span class="action-icon-box">
				<svg
					class="action-icon"
					viewBox={isFullscreen ? getIcon('fullscreen_exit').viewBox : getIcon('fullscreen').viewBox}
					fill="currentColor"
					aria-hidden="true"
				>
					{@html isFullscreen ? getIcon('fullscreen_exit').svg : getIcon('fullscreen').svg}
				</svg>
			</span>
			<span class="action-title">{isFullscreen ? 'Згорнути' : 'На весь екран'}</span>
		</button>

		<!-- 4. Замовити сайт -->
		<a
			href="https://alik532ua.github.io/DigitalWorkshop/"
			target="_blank"
			rel="noopener noreferrer"
			class="action-item"
			aria-label="Замовити сайт у DigitalWorkshop (відкривається в новому вікні)"
		>
			<span class="action-icon-box">
				<svg
					class="action-icon"
					viewBox={getIcon('order_site').viewBox}
					fill="currentColor"
					aria-hidden="true"
				>
					{@html getIcon('order_site').svg}
				</svg>
			</span>
			<span class="action-title">Замовити сайт</span>
		</a>

		<!-- 5. Стиль іконок (Готика / Класика) -->
		<button
			type="button"
			class="action-item style-toggle-item"
			onclick={() => iconStyleStore.toggle()}
			aria-label={style === 'gothic' ? 'Перемкнути на класичні іконки' : 'Перемкнути на готичні іконки'}
		>
			<span class="action-icon-box">
				<svg
					class="action-icon"
					viewBox={getIcon('style_toggle').viewBox}
					fill="currentColor"
					aria-hidden="true"
				>
					{@html getIcon('style_toggle').svg}
				</svg>
			</span>
			<span class="action-title">{style === 'gothic' ? 'Готика' : 'Класика'}</span>
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

	:global([data-theme="light"]) .action-item:hover {
		background: rgba(0, 0, 0, 0.05);
		border-color: rgba(0, 0, 0, 0.1);
		color: var(--text-primary, #111827);
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
			bottom: 1rem;
		}

		.hidden-panel-content {
			gap: 0.4rem;
			padding: 0.5rem 0.8rem;
			max-width: 95vw;
			overflow-x: auto;
		}

		.action-item {
			padding: 0.35rem 0.45rem;
			gap: 0.25rem;
		}

		.action-icon-box {
			width: 28px;
			height: 28px;
		}

		.action-icon {
			width: 19px;
			height: 19px;
		}

		.action-title {
			font-size: 0.65rem;
		}
	}
</style>
