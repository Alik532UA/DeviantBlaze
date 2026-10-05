<script>
	import { onMount } from 'svelte';
	import { themeStore } from './theme.svelte.js';
	import { iconStyleStore } from './iconStyle.svelte.js';
	import { ICONS } from './icons.js';

	let { onOpenGallery, onOpenMessage, onGalleryHover, onThemeHover } = $props();

	let isDark = $derived(themeStore.current === 'dark');
	let style = $derived(iconStyleStore.current);

	function getIcon(name) {
		const set = ICONS[style] || ICONS.gothic;
		return set[name] || ICONS.gothic[name];
	}

	let navEl = $state(null);
	let navOpacity = $state(0.1);

	let isMobile = $state(false);

	onMount(() => {
		const mql = window.matchMedia('(max-width: 768px), (pointer: coarse)');
		isMobile = mql.matches;

		const onMqlChange = (e) => {
			isMobile = e.matches;
			if (isMobile) navOpacity = 1;
		};
		mql.addEventListener('change', onMqlChange);

		if (isMobile) {
			navOpacity = 1;
			return () => {
				mql.removeEventListener('change', onMqlChange);
			};
		}

		const MAX_DIST = 320;

		function onPointerMove(e) {
			if (isMobile || !navEl) return;
			const r = navEl.getBoundingClientRect();
			const cx = r.left + r.width / 2;
			const cy = r.top + r.height / 2;
			const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
			if (dist >= MAX_DIST) {
				navOpacity = 0.1;
			} else {
				const t = 1 - dist / MAX_DIST;
				const ease = t * t * (3 - 2 * t);
				navOpacity = 0.1 + 0.9 * ease;
			}
		}

		function onPointerLeave() {
			if (!isMobile) navOpacity = 0.1;
		}

		window.addEventListener('pointermove', onPointerMove, { passive: true });
		window.addEventListener('pointerleave', onPointerLeave);

		return () => {
			mql.removeEventListener('change', onMqlChange);
			window.removeEventListener('pointermove', onPointerMove);
			window.removeEventListener('pointerleave', onPointerLeave);
		};
	});
</script>

<nav
	bind:this={navEl}
	class="top-center-nav"
	style="opacity: {navOpacity.toFixed(3)};"
	aria-label="Навігація сайту"
>
	<!-- 1. Gallery Button -->
	<button
		class="nav-btn"
		onclick={onOpenGallery}
		onmouseenter={() => onGalleryHover?.(true)}
		onmouseleave={() => onGalleryHover?.(false)}
		onfocus={() => onGalleryHover?.(true)}
		onblur={() => onGalleryHover?.(false)}
		aria-label="Галерея"
	>
		<svg viewBox={getIcon('gallery').viewBox} class="nav-svg" aria-hidden="true">
			{@html getIcon('gallery').svg}
		</svg>
		<span class="nav-tooltip">Галерея</span>
	</button>

	<!-- 2. Instagram Link -->
	<a
		href="https://www.instagram.com/deviant_blaze/"
		target="_blank"
		rel="noopener noreferrer"
		class="nav-btn instagram-btn"
		aria-label="Instagram Deviant Blaze"
	>
		<svg viewBox={getIcon('instagram').viewBox} class="nav-svg instagram-svg" aria-hidden="true">
			<defs>
				<linearGradient id="ig-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
					<stop offset="0%" stop-color="#f09433" />
					<stop offset="25%" stop-color="#e6683c" />
					<stop offset="50%" stop-color="#dc2743" />
					<stop offset="75%" stop-color="#cc2366" />
					<stop offset="100%" stop-color="#bc1888" />
				</linearGradient>
			</defs>
			{@html getIcon('instagram').svg}
		</svg>
		<span class="nav-tooltip">Instagram</span>
	</a>

	<!-- 3. Message / Write Button -->
	<button
		class="nav-btn"
		onclick={onOpenMessage}
		aria-label="Повідомлення / Написати"
	>
		<svg viewBox={getIcon('message').viewBox} class="nav-svg" aria-hidden="true">
			{@html getIcon('message').svg}
		</svg>
		<span class="nav-tooltip">Написати</span>
	</button>

	<!-- 4. Theme Toggle Button -->
	<button
		class="nav-btn theme-toggle-btn"
		onclick={() => themeStore.toggle()}
		onmouseenter={() => onThemeHover?.(true)}
		onmouseleave={() => onThemeHover?.(false)}
		onfocus={() => onThemeHover?.(true)}
		onblur={() => onThemeHover?.(false)}
		aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
	>
		<div class="theme-icon-wrap" class:is-light={!isDark}>
			<svg
				viewBox={getIcon(isDark ? 'theme_dark' : 'theme_light').viewBox}
				class="nav-svg"
				aria-hidden="true"
			>
				{@html getIcon(isDark ? 'theme_dark' : 'theme_light').svg}
			</svg>
		</div>
		<span class="nav-tooltip">{isDark ? 'Світла тема' : 'Темна тема'}</span>
	</button>

	<!-- 5. Icon Style Toggle Button (Gothic Rock / Classic) -->
	<button
		class="nav-btn style-toggle-btn"
		onclick={() => iconStyleStore.toggle()}
		aria-label={style === 'gothic' ? 'Перемкнути на класичний стиль' : 'Перемкнути на готичний стиль'}
	>
		<div class="style-icon-wrap" class:is-classic={style === 'classic'}>
			<svg
				viewBox={getIcon('style_toggle').viewBox}
				class="nav-svg"
				class:nav-svg--fill={getIcon('style_toggle').type === 'fill'}
				aria-hidden="true"
			>
				{@html getIcon('style_toggle').svg}
			</svg>
		</div>
		<span class="nav-tooltip">{style === 'gothic' ? 'Стиль: Готичний' : 'Стиль: Класичний'}</span>
	</button>
</nav>

<style>
	.top-center-nav {
		position: fixed;
		top: 1.75rem;
		left: 50%;
		transform: translateX(-50%);
		z-index: 100;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1.75rem;
		padding: 0.5rem 1rem;
		transition: opacity 0.15s ease-out;
	}

	.top-center-nav:hover {
		opacity: 1 !important;
	}

	.nav-btn {
		position: relative;
		background: none;
		border: none;
		padding: 6px;
		color: var(--fg-primary);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		text-decoration: none;
		outline: none;
		transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), color var(--transition-speed) var(--transition-easing);
	}

	.theme-icon-wrap {
		display: flex;
		align-items: center;
		justify-content: center;
		transition: transform var(--transition-speed) var(--transition-easing);
	}

	.theme-icon-wrap.is-light {
		transform: rotate(360deg);
	}

	.style-icon-wrap {
		display: flex;
		align-items: center;
		justify-content: center;
		transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.style-icon-wrap.is-classic {
		transform: rotate(180deg);
	}

	.nav-btn:hover .style-icon-wrap {
		transform: rotate(45deg) scale(1.15);
	}

	.nav-btn:hover .style-icon-wrap.is-classic {
		transform: rotate(225deg) scale(1.15);
	}

	.nav-svg {
		width: 28px;
		height: 28px;
		display: block;
		transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
		filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.25));
	}

	.nav-svg:not(.nav-svg--fill) {
		fill: none;
		stroke: currentColor;
	}

	.nav-svg--fill {
		fill: currentColor;
	}

	/* Instagram Brand Gradient Hover */
	.instagram-svg :global(*) {
		transition: stroke 0.28s cubic-bezier(0.16, 1, 0.3, 1),
		            fill 0.28s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.instagram-btn:hover .instagram-svg {
		filter: drop-shadow(0 0 14px rgba(220, 39, 67, 0.75)) drop-shadow(0 0 24px rgba(188, 24, 136, 0.45));
	}

	.instagram-btn:hover .instagram-svg :global([stroke="currentColor"]) {
		stroke: url(#ig-gradient);
	}

	.instagram-btn:hover .instagram-svg :global([fill="currentColor"]) {
		fill: url(#ig-gradient);
	}

	.nav-btn:hover {
		transform: translateY(-2px) scale(1.18);
		color: var(--fg-primary);
	}

	.nav-btn:active {
		transform: translateY(0) scale(0.96);
	}

	.nav-btn:focus-visible {
		outline: 2px solid var(--fg-primary);
		outline-offset: 4px;
		border-radius: 4px;
	}

	/* Minimalist Tooltip */
	.nav-tooltip {
		position: absolute;
		top: calc(100% + 10px);
		left: 50%;
		transform: translateX(-50%) translateY(-4px) scale(0.95);
		padding: 4px 10px;
		font-size: 0.75rem;
		font-weight: 500;
		letter-spacing: 0.04em;
		white-space: nowrap;
		background: var(--bg-secondary);
		color: var(--fg-primary);
		border: 1px solid var(--border);
		border-radius: 5px;
		pointer-events: none;
		opacity: 0;
		transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
		box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
		z-index: 10;
	}

	.nav-btn:hover .nav-tooltip {
		opacity: 1;
		transform: translateX(-50%) translateY(0) scale(1);
	}

	@media (max-width: 768px), (pointer: coarse) {
		.top-center-nav {
			opacity: 1 !important;
			top: 1.25rem;
			gap: 1.25rem;
			padding: 0.25rem 0.5rem;
		}

		.nav-btn {
			opacity: 1 !important;
		}

		.nav-svg {
			width: 26px;
			height: 26px;
			opacity: 1 !important;
		}

		.nav-tooltip {
			display: none;
		}
	}
</style>
