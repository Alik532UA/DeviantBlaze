<script>
	import { onMount } from 'svelte';
	import { themeStore } from './theme.svelte.js';
	import { iconStyleStore } from './iconStyle.svelte.js';
	import { langStore } from './lang.svelte.js';
	import { ICONS } from './icons.js';

	let { onOpenGallery, onGalleryHover, onThemeHover, isExpanded = false } = $props();

	let isDark = $derived(themeStore.current === 'dark');
	let style = $derived(iconStyleStore.current);

	function getIcon(name) {
		const set = ICONS[style] || ICONS.gothic;
		return set[name] || ICONS.gothic[name];
	}

	let navEl = $state(null);
	let navOpacity = $state(0.1);
	let effectiveOpacity = $derived(isExpanded ? 1 : navOpacity);

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
	class:is-expanded={isExpanded}
	style="opacity: {effectiveOpacity.toFixed(3)};"
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
		aria-label={langStore.t('gallery')}
	>
		<svg viewBox={getIcon('gallery').viewBox} class="nav-svg" aria-hidden="true">
			{@html getIcon('gallery').svg}
		</svg>
		<span class="nav-sublabel">{langStore.t('gallery')}</span>
		<span class="nav-tooltip">{langStore.t('gallery')}</span>
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
		<span class="nav-sublabel">Instagram</span>
		<span class="nav-tooltip">Instagram</span>
	</a>

	<!-- 3. Message / Write Link -->
	<a
		href="https://t.me/Moyo_imya_polzovatelya"
		target="_blank"
		rel="noopener noreferrer"
		class="nav-btn"
		aria-label={langStore.t('contact')}
	>
		<svg viewBox={getIcon('message').viewBox} class="nav-svg" aria-hidden="true">
			{@html getIcon('message').svg}
		</svg>
		<span class="nav-sublabel">{langStore.t('contact')}</span>
		<span class="nav-tooltip">{langStore.t('contact')}</span>
	</a>

	<!-- 4. Theme Toggle Button -->
	<button
		class="nav-btn theme-toggle-btn"
		onclick={() => themeStore.toggle()}
		onmouseenter={() => onThemeHover?.(true)}
		onmouseleave={() => onThemeHover?.(false)}
		onfocus={() => onThemeHover?.(true)}
		onblur={() => onThemeHover?.(false)}
		aria-label={isDark ? langStore.t('theme_toggle_tip_dark') : langStore.t('theme_toggle_tip_light')}
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
		<span class="nav-sublabel">{isDark ? langStore.t('theme_dark') : langStore.t('theme_light')}</span>
		<span class="nav-tooltip">{isDark ? langStore.t('theme_toggle_tip_dark') : langStore.t('theme_toggle_tip_light')}</span>
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
		transition: opacity 0.25s ease-out, gap 0.55s cubic-bezier(0.16, 1, 0.3, 1), top 0.55s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.top-center-nav.is-expanded {
		top: 2.25rem;
		gap: 3.75rem;
		opacity: 1 !important;
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
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-decoration: none;
		outline: none;
		transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), color var(--transition-speed) var(--transition-easing);
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

	.nav-svg {
		width: 28px;
		height: 28px;
		display: block;
		transition: width 0.45s cubic-bezier(0.16, 1, 0.3, 1),
		            height 0.45s cubic-bezier(0.16, 1, 0.3, 1),
		            transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
		filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.25));
	}

	.is-expanded .nav-svg {
		width: 56px;
		height: 56px;
	}

	.nav-sublabel {
		display: block;
		margin-top: 8px;
		font-size: 0.88rem;
		font-weight: 600;
		letter-spacing: 0.04em;
		color: var(--fg-primary);
		opacity: 0;
		max-height: 0;
		overflow: hidden;
		transform: translateY(-6px);
		transition: opacity 0.4s ease, transform 0.4s ease, max-height 0.4s ease;
		pointer-events: none;
		white-space: nowrap;
		text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
	}

	.is-expanded .nav-sublabel {
		opacity: 1;
		max-height: 26px;
		transform: translateY(0);
	}

	.is-expanded .nav-tooltip {
		display: none;
	}

	.nav-svg {
		fill: none;
		stroke: currentColor;
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
			max-width: calc(100vw - 1rem);
			box-sizing: border-box;
		}

		.top-center-nav.is-expanded {
			top: 1.25rem;
			gap: 0.35rem 0.5rem;
			width: calc(100vw - 1rem);
			max-width: 380px;
			display: grid;
			grid-template-columns: repeat(4, minmax(0, 1fr));
			justify-items: center;
		}

		.top-center-nav.is-expanded .nav-btn {
			width: 100%;
			min-width: 0;
			padding: 4px 2px;
			box-sizing: border-box;
		}

		.top-center-nav.is-expanded .nav-svg {
			width: 36px;
			height: 36px;
		}

		.top-center-nav.is-expanded .nav-sublabel {
			font-size: 0.7rem;
			letter-spacing: 0.01em;
			margin-top: 4px;
			max-height: 22px;
			width: 100%;
			text-align: center;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
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

	@media (max-width: 330px) {
		.top-center-nav.is-expanded {
			grid-template-columns: repeat(2, minmax(0, 1fr));
			max-width: 210px;
			gap: 0.5rem 0.75rem;
		}
	}
</style>
