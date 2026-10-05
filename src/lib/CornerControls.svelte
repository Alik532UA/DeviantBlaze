<script>
	import { onMount } from 'svelte';
	import { themeStore } from './theme.svelte.js';

	let { onOpenGallery, onOpenMessage } = $props();

	let isDark = $derived(themeStore.current === 'dark');

	let galleryEl = $state(null);
	let themeEl = $state(null);
	let instagramEl = $state(null);
	let messageEl = $state(null);

	let galleryOpacity = $state(0.1);
	let themeOpacity = $state(0.1);
	let instagramOpacity = $state(0.1);
	let messageOpacity = $state(0.1);

	onMount(() => {
		const MAX_DIST = 340;

		function calcOpacity(el, mouseX, mouseY) {
			if (!el) return 0.1;
			const r = el.getBoundingClientRect();
			const cx = r.left + r.width / 2;
			const cy = r.top + r.height / 2;
			const dist = Math.hypot(mouseX - cx, mouseY - cy);
			if (dist >= MAX_DIST) return 0.1;
			const t = 1 - dist / MAX_DIST;
			const ease = t * t * (3 - 2 * t);
			return 0.1 + 0.9 * ease;
		}

		function onPointerMove(e) {
			galleryOpacity = calcOpacity(galleryEl, e.clientX, e.clientY);
			themeOpacity = calcOpacity(themeEl, e.clientX, e.clientY);
			instagramOpacity = calcOpacity(instagramEl, e.clientX, e.clientY);
			messageOpacity = calcOpacity(messageEl, e.clientX, e.clientY);
		}

		function onPointerLeave() {
			galleryOpacity = 0.1;
			themeOpacity = 0.1;
			instagramOpacity = 0.1;
			messageOpacity = 0.1;
		}

		window.addEventListener('pointermove', onPointerMove, { passive: true });
		window.addEventListener('pointerleave', onPointerLeave);

		return () => {
			window.removeEventListener('pointermove', onPointerMove);
			window.removeEventListener('pointerleave', onPointerLeave);
		};
	});
</script>

<!-- TOP LEFT: Gallery Button -->
<div class="corner-item top-left">
	<button
		bind:this={galleryEl}
		class="corner-btn"
		style="opacity: {galleryOpacity.toFixed(3)};"
		onclick={onOpenGallery}
		aria-label="Галерея"
	>
		<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
			<rect x="3" y="3" width="18" height="18" rx="3" ry="3"></rect>
			<circle cx="8.5" cy="8.5" r="1.5"></circle>
			<polyline points="21 15 16 10 5 21"></polyline>
		</svg>
		<span class="corner-tooltip tooltip-bottom">Галерея</span>
	</button>
</div>

<!-- TOP RIGHT: Theme Toggle -->
<div class="corner-item top-right">
	<button
		bind:this={themeEl}
		class="corner-btn"
		style="opacity: {themeOpacity.toFixed(3)};"
		onclick={() => themeStore.toggle()}
		aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
	>
		{#if isDark}
			<!-- Moon Icon -->
			<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
				<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
			</svg>
		{:else}
			<!-- Sun Icon -->
			<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
				<circle cx="12" cy="12" r="4"></circle>
				<line x1="12" y1="2" x2="12" y2="4"></line>
				<line x1="12" y1="20" x2="12" y2="22"></line>
				<line x1="4.93" y1="4.93" x2="6.34" y2="6.34"></line>
				<line x1="17.66" y1="17.66" x2="19.07" y2="19.07"></line>
				<line x1="2" y1="12" x2="4" y2="12"></line>
				<line x1="20" y1="12" x2="22" y2="12"></line>
				<line x1="4.93" y1="19.07" x2="6.34" y2="17.66"></line>
				<line x1="17.66" y1="6.34" x2="19.07" y2="4.93"></line>
			</svg>
		{/if}
		<span class="corner-tooltip tooltip-bottom">{isDark ? 'Світла тема' : 'Темна тема'}</span>
	</button>
</div>

<!-- BOTTOM LEFT: Instagram Link -->
<div class="corner-item bottom-left">
	<a
		bind:this={instagramEl}
		href="https://www.instagram.com/deviant_blaze/"
		target="_blank"
		rel="noopener noreferrer"
		class="corner-btn"
		style="opacity: {instagramOpacity.toFixed(3)};"
		aria-label="Instagram Deviant Blaze"
	>
		<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
			<rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
			<circle cx="12" cy="12" r="4.5"></circle>
			<circle cx="17.5" cy="6.5" r="1.1" fill="currentColor"></circle>
		</svg>
		<span class="corner-tooltip tooltip-top">Instagram</span>
	</a>
</div>

<!-- BOTTOM RIGHT: Message / Write Button -->
<div class="corner-item bottom-right">
	<button
		bind:this={messageEl}
		class="corner-btn"
		style="opacity: {messageOpacity.toFixed(3)};"
		onclick={onOpenMessage}
		aria-label="Повідомлення / Написати"
	>
		<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
			<!-- Minimalist Message Chat Bubble / Envelope Icon -->
			<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
		</svg>
		<span class="corner-tooltip tooltip-top">Написати</span>
	</button>
</div>

<style>
	.corner-item {
		position: fixed;
		z-index: 100;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.top-left {
		top: 1.75rem;
		left: 2rem;
	}

	.top-right {
		top: 1.75rem;
		right: 2rem;
	}

	.bottom-left {
		bottom: 2.75rem;
		left: 2.5rem;
	}

	.bottom-right {
		bottom: 2.75rem;
		right: 2.5rem;
	}

	/* Corner buttons: NO circle border, icon is the button */
	.corner-btn {
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
		transition: opacity 0.15s ease-out, transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), color 0.2s;
	}

	.corner-btn:hover {
		opacity: 1 !important;
		transform: scale(1.18);
		color: var(--fg-primary);
	}

	.corner-btn:active {
		transform: scale(0.96);
	}

	.corner-btn:focus-visible {
		outline: 2px solid var(--fg-primary);
		outline-offset: 4px;
		border-radius: 4px;
	}

	/* Minimalist Tooltip */
	.corner-tooltip {
		position: absolute;
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

	.tooltip-bottom {
		top: calc(100% + 8px);
		transform: translateY(-4px) scale(0.95);
	}

	.tooltip-top {
		bottom: calc(100% + 8px);
		transform: translateY(4px) scale(0.95);
	}

	.corner-btn:hover .corner-tooltip {
		opacity: 1;
		transform: translateY(0) scale(1);
	}

	@media (max-width: 640px) {
		.top-left {
			top: 1.25rem;
			left: 1.25rem;
		}

		.top-right {
			top: 1.25rem;
			right: 1.25rem;
		}

		.bottom-left {
			bottom: 1.75rem;
			left: 1.25rem;
		}

		.bottom-right {
			bottom: 1.75rem;
			right: 1.25rem;
		}

		.corner-tooltip {
			display: none;
		}
	}
</style>
