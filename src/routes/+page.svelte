<script>
	import DeviantBlazeLogo from '#lib/DeviantBlazeLogo.svelte';
	import MusicLinks from '#lib/MusicLinks.svelte';
	import TopNav from '#lib/TopNav.svelte';
	import GalleryModal from '#lib/GalleryModal.svelte';
	import ContactsModal from '#lib/ContactsModal.svelte';

	let isGalleryOpen = $state(false);
	let isContactsOpen = $state(false);
</script>

<main class="page-container">
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
		}}
		onOpenMessage={() => {
			isGalleryOpen = false;
			isContactsOpen = true;
		}}
	/>

	<!-- Central Hero SVG Logo with dynamic cursor reactivity -->
	<section class="hero-center" aria-label="Deviant Blaze Art">
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
	}

	@media (max-width: 640px) {
		.hero-center {
			padding-bottom: 4.5rem;
		}
	}
</style>
