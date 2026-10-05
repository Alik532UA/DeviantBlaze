<script>
	import DeviantBlazeLogo from '#lib/DeviantBlazeLogo.svelte';
	import MusicLinks from '#lib/MusicLinks.svelte';
	import TopNav from '#lib/TopNav.svelte';
	import GalleryModal from '#lib/GalleryModal.svelte';
	import ContactsModal from '#lib/ContactsModal.svelte';
	import VisualizerModal from '#lib/VisualizerModal.svelte';
	import PianoModal from '#lib/PianoModal.svelte';
	import HiddenPanel from '#lib/HiddenPanel.svelte';

	// Modals
	let isGalleryOpen = $state(false);
	let isContactsOpen = $state(false);
	let isVisualizerOpen = $state(false);
	let isPianoOpen = $state(false);

	let anyModalOpen = $derived(
		isGalleryOpen || isContactsOpen || isVisualizerOpen || isPianoOpen
	);

	// Hover effects
	let isGalleryHovered = $state(false);
	let isThemeHovered = $state(false);

	// 4 Scroll States:
	// 1: Top buttons expanded 2x, labels visible, center logo down
	// 2: Standard default (centered logo, normal buttons, labels only on hover)
	// 3: Bottom music buttons expanded 2x, labels visible, center logo up
	// 4: Standard icons, logo & music shifted UP to reveal hidden actions panel
	let scrollState = $state(2);

	let isScrollLocked = false;

	function stepScroll(direction) {
		if (anyModalOpen) return;
		if (isScrollLocked) return;

		isScrollLocked = true;
		setTimeout(() => {
			isScrollLocked = false;
		}, 420);

		if (direction > 0) {
			// Scroll Down: 1 -> 2 -> 3 -> 4 -> 1
			scrollState = scrollState === 4 ? 1 : scrollState + 1;
		} else {
			// Scroll Up: 4 -> 3 -> 2 -> 1 -> 4
			scrollState = scrollState === 1 ? 4 : scrollState - 1;
		}
	}

	function goToState(state) {
		if (anyModalOpen) return;
		scrollState = state;
	}

	// Wheel and Touch listeners
	$effect(() => {
		if (typeof window === 'undefined') return;

		function handleWheel(e) {
			if (anyModalOpen) return;

			// Prevent default browser page bouncing
			e.preventDefault();

			const threshold = 18;
			if (Math.abs(e.deltaY) >= threshold) {
				stepScroll(e.deltaY > 0 ? 1 : -1);
			}
		}

		let touchStartY = 0;
		function handleTouchStart(e) {
			if (e.touches && e.touches[0]) {
				touchStartY = e.touches[0].clientY;
			}
		}

		function handleTouchEnd(e) {
			if (anyModalOpen) return;
			if (e.changedTouches && e.changedTouches[0]) {
				const touchEndY = e.changedTouches[0].clientY;
				const deltaY = touchStartY - touchEndY;
				if (Math.abs(deltaY) > 42) {
					// Swiping UP pulls content down (direction 1), swiping DOWN pulls content up (direction -1)
					stepScroll(deltaY > 0 ? 1 : -1);
				}
			}
		}

		function handleKeyDown(e) {
			if (anyModalOpen) return;
			if (e.key === 'ArrowDown' || e.key === 'PageDown') {
				e.preventDefault();
				stepScroll(1);
			} else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
				e.preventDefault();
				stepScroll(-1);
			}
		}

		window.addEventListener('wheel', handleWheel, { passive: false });
		window.addEventListener('touchstart', handleTouchStart, { passive: true });
		window.addEventListener('touchend', handleTouchEnd, { passive: true });
		window.addEventListener('keydown', handleKeyDown);

		return () => {
			window.removeEventListener('wheel', handleWheel);
			window.removeEventListener('touchstart', handleTouchStart);
			window.removeEventListener('touchend', handleTouchEnd);
			window.removeEventListener('keydown', handleKeyDown);
		};
	});
</script>

<main class="page-container">
	<!-- Gallery Hover Background -->
	<div
		class="gallery-hover-bg"
		class:is-active={isGalleryHovered && !isGalleryOpen}
		aria-hidden="true"
	>
		<img
			src="/gallery-hover-bg.webp"
			alt=""
			class="gallery-hover-img"
		/>
		<div class="gallery-hover-overlay"></div>
	</div>

	<!-- Opposite Color Vignette on Theme Hover -->
	<div
		class="theme-contrast-vignette"
		class:is-active={isThemeHovered}
		aria-hidden="true"
	></div>

	<!-- Ambient mouse-tracking light and vignette -->
	<div class="ambient-backdrop"></div>
	<div class="vignette"></div>

	<!-- Top Center Navigation: Gallery, Instagram, Message, Theme -->
	<TopNav
		isExpanded={scrollState === 1}
		onOpenGallery={() => {
			isContactsOpen = false;
			isGalleryOpen = true;
			isGalleryHovered = false;
		}}
		onOpenMessage={() => {
			isGalleryOpen = false;
			isContactsOpen = true;
		}}
		onGalleryHover={(hovered) => {
			isGalleryHovered = hovered;
		}}
		onThemeHover={(hovered) => {
			isThemeHovered = hovered;
		}}
	/>

	<!-- Central Hero SVG Logo with dynamic cursor reactivity -->
	<section
		class="hero-center state-{scrollState}"
		class:gallery-hovered={isGalleryHovered && !isGalleryOpen}
		aria-label="Deviant Blaze Art"
	>
		<DeviantBlazeLogo />
	</section>

	<!-- Bottom Center Music Platforms: YouTube Music, Spotify, Apple Music -->
	<MusicLinks
		isExpanded={scrollState === 3}
		isShiftedUp={scrollState === 4}
	/>

	<!-- Hidden Actions Panel in State 4 -->
	<HiddenPanel
		isVisible={scrollState === 4}
		onOpenVisualizer={() => {
			isVisualizerOpen = true;
		}}
		onOpenPiano={() => {
			isPianoOpen = true;
		}}
	/>

	<!-- 4-State Cyclic Scroll Indicator on the side -->
	<aside class="scroll-indicator" aria-label="Індикатор стану скролу">
		<button
			type="button"
			class="state-dot"
			class:active={scrollState === 1}
			onclick={() => goToState(1)}
			aria-label="Стан 1: Верхнє меню розширене"
			title="Верхнє меню"
		>
			<span class="dot-inner"></span>
		</button>
		<button
			type="button"
			class="state-dot"
			class:active={scrollState === 2}
			onclick={() => goToState(2)}
			aria-label="Стан 2: Стандартний вигляд"
			title="Головна"
		>
			<span class="dot-inner"></span>
		</button>
		<button
			type="button"
			class="state-dot"
			class:active={scrollState === 3}
			onclick={() => goToState(3)}
			aria-label="Стан 3: Музичні платформи розширені"
			title="Музика"
		>
			<span class="dot-inner"></span>
		</button>
		<button
			type="button"
			class="state-dot"
			class:active={scrollState === 4}
			onclick={() => goToState(4)}
			aria-label="Стан 4: Додаткові інструменти"
			title="Інструменти"
		>
			<span class="dot-inner"></span>
		</button>
	</aside>

	<!-- Modals -->
	<GalleryModal bind:isOpen={isGalleryOpen} />
	<ContactsModal bind:isOpen={isContactsOpen} />
	<VisualizerModal bind:isOpen={isVisualizerOpen} />
	<PianoModal bind:isOpen={isPianoOpen} />
</main>

<style>
	.page-container {
		position: relative;
		width: 100vw;
		height: 100vh;
		height: 100dvh;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		user-select: none;
	}

	/* Gallery Hover Background */
	.gallery-hover-bg {
		position: fixed;
		inset: 0;
		z-index: 0;
		pointer-events: none;
		opacity: 0;
		transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1);
		overflow: hidden;
	}

	.gallery-hover-bg.is-active {
		opacity: 1;
	}

	.gallery-hover-img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: center;
		transform: scale(1.04);
		transition: transform 1.2s cubic-bezier(0.16, 1, 0.3, 1), filter var(--transition-speed) var(--transition-easing);
		will-change: transform, filter;
	}

	.gallery-hover-bg.is-active .gallery-hover-img {
		transform: scale(1);
	}

	:global([data-theme="light"]) .gallery-hover-img {
		filter: invert(1);
	}

	.gallery-hover-overlay {
		position: absolute;
		inset: 0;
		background: radial-gradient(circle at center, rgba(7, 7, 9, 0.25) 0%, rgba(7, 7, 9, 0.65) 100%);
		transition: background var(--transition-speed) var(--transition-easing);
	}

	:global([data-theme="light"]) .gallery-hover-overlay {
		background: radial-gradient(circle at center, rgba(248, 248, 250, 0.25) 0%, rgba(248, 248, 250, 0.65) 100%);
	}

	/* Opposite Color Vignette on Theme Hover */
	.theme-contrast-vignette {
		position: fixed;
		inset: 0;
		z-index: 5;
		pointer-events: none;
		opacity: 0;
		transition: opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1),
		            box-shadow 0.65s cubic-bezier(0.16, 1, 0.3, 1),
		            background 0.65s cubic-bezier(0.16, 1, 0.3, 1);
		box-shadow: inset 0 0 140px 30px rgba(255, 255, 255, 0.28),
		            inset 0 0 60px 10px rgba(255, 255, 255, 0.45);
		background: radial-gradient(circle at center, transparent 40%, rgba(255, 255, 255, 0.06) 70%, rgba(255, 255, 255, 0.28) 100%);
	}

	.theme-contrast-vignette.is-active {
		opacity: 1;
	}

	:global([data-theme="light"]) .theme-contrast-vignette {
		box-shadow: inset 0 0 140px 30px rgba(0, 0, 0, 0.38),
		            inset 0 0 60px 10px rgba(0, 0, 0, 0.6);
		background: radial-gradient(circle at center, transparent 40%, rgba(0, 0, 0, 0.1) 70%, rgba(7, 7, 9, 0.38) 100%);
	}

	/* Central Hero Logo Position based on Scroll States */
	.hero-center {
		position: relative;
		z-index: 10;
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1.5rem;
		padding-top: 2rem;
		padding-bottom: 3.5rem;
		transition: transform 0.65s cubic-bezier(0.16, 1, 0.3, 1);
		will-change: transform;
	}

	/* State 1: Top expanded -> logo shifts slightly down */
	.hero-center.state-1 {
		transform: translateY(10vh);
	}

	/* State 2: Default standard position */
	.hero-center.state-2 {
		transform: translateY(0);
	}

	/* State 3: Bottom expanded -> logo shifts slightly up */
	.hero-center.state-3 {
		transform: translateY(-9vh);
	}

	/* State 4: Shifted up for hidden panel */
	.hero-center.state-4 {
		transform: translateY(-13vh);
	}

	/* Gallery button hover overrides if in standard */
	.hero-center.gallery-hovered {
		transform: translateY(20%) !important;
	}

	/* 4-State Scroll Indicator on Right Edge */
	.scroll-indicator {
		position: fixed;
		right: 1.5rem;
		top: 50%;
		transform: translateY(-50%);
		z-index: 60;
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
		padding: 0.6rem 0.4rem;
		background: rgba(14, 14, 18, 0.4);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		border-radius: 9999px;
		border: 1px solid rgba(255, 255, 255, 0.08);
	}

	:global([data-theme="light"]) .scroll-indicator {
		background: rgba(255, 255, 255, 0.5);
		border-color: rgba(0, 0, 0, 0.08);
	}

	.state-dot {
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: none;
		cursor: pointer;
		padding: 0;
	}

	.dot-inner {
		width: 7px;
		height: 7px;
		border-radius: 9999px;
		background: var(--text-secondary, #6b7280);
		opacity: 0.45;
		transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.state-dot:hover .dot-inner {
		opacity: 0.9;
		transform: scale(1.3);
	}

	.state-dot.active .dot-inner {
		width: 8px;
		height: 20px;
		opacity: 1;
		background: linear-gradient(180deg, #eb1e3c 0%, #ff5f1f 100%);
		box-shadow: 0 0 12px rgba(255, 95, 31, 0.8);
	}

	@media (max-width: 640px) {
		.hero-center {
			padding-bottom: 4.5rem;
		}

		.hero-center.state-1 {
			transform: translateY(7vh);
		}

		.hero-center.state-3 {
			transform: translateY(-7vh);
		}

		.hero-center.state-4 {
			transform: translateY(-11vh);
		}

		.scroll-indicator {
			right: 0.5rem;
			gap: 0.6rem;
		}

		.state-dot {
			width: 18px;
			height: 18px;
		}
	}
</style>
