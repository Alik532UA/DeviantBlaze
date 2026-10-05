<script>
	import DeviantBlazeLogo from '#lib/DeviantBlazeLogo.svelte';
	import MusicLinks from '#lib/MusicLinks.svelte';
	import TopNav from '#lib/TopNav.svelte';
	import GalleryModal from '#lib/GalleryModal.svelte';
	import ContactsModal from '#lib/ContactsModal.svelte';

	let isGalleryOpen = $state(false);
	let isContactsOpen = $state(false);
	let isGalleryHovered = $state(false);
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

	<!-- Ambient mouse-tracking light and vignette -->
	<div class="ambient-backdrop"></div>
	<div class="vignette"></div>

	<!-- Top Center Navigation: Gallery, Instagram, Message, Theme
	     (Proximity opacity: 10% to 100% based on cursor distance)
	-->
	<TopNav
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
	/>

	<!-- Central Hero SVG Logo with dynamic cursor reactivity -->
	<section
		class="hero-center"
		class:gallery-hovered={isGalleryHovered && !isGalleryOpen}
		aria-label="Deviant Blaze Art"
	>
		<DeviantBlazeLogo />
	</section>

	<!-- Bottom Center Music Platforms: YouTube Music, Spotify, Apple Music -->
	<MusicLinks />

	<!-- Modals -->
	<GalleryModal bind:isOpen={isGalleryOpen} />
	<ContactsModal bind:isOpen={isContactsOpen} />
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

	.hero-center {
		position: relative;
		z-index: 10;
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1.5rem;
		/* Optical centering taking into account top & bottom bars */
		padding-top: 2rem;
		padding-bottom: 3.5rem;
		transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
		will-change: transform;
	}

	.hero-center.gallery-hovered {
		transform: translateY(20%);
	}

	@media (max-width: 640px) {
		.hero-center {
			padding-bottom: 4.5rem;
		}
	}
</style>
