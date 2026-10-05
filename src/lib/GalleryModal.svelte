<script>
	import { fade, scale } from 'svelte/transition';

	let { isOpen = $bindable(false) } = $props();

	const photos = [
		{
			src: '/gallery/img1.webp',
			title: 'Deviant Blaze Live on Stage',
			subtitle: 'Main Stage Festival Performance'
		},
		{
			src: '/gallery/img2.webp',
			title: 'Vocals & Live Energy',
			subtitle: 'Stage Performance'
		},
		{
			src: '/gallery/img3.webp',
			title: 'Deviant Blaze Band',
			subtitle: 'Official Band Photoshoot'
		}
	];

	let currentIndex = $state(0);

	function next() {
		currentIndex = (currentIndex + 1) % photos.length;
	}

	function prev() {
		currentIndex = (currentIndex - 1 + photos.length) % photos.length;
	}

	function onKeyDown(e) {
		if (!isOpen) return;
		if (e.key === 'Escape') isOpen = false;
		if (e.key === 'ArrowRight') next();
		if (e.key === 'ArrowLeft') prev();
	}
</script>

<svelte:window onkeydown={onKeyDown} />

{#if isOpen}
	<div
		class="gallery-overlay"
		transition:fade={{ duration: 250 }}
		role="dialog"
		aria-modal="true"
		aria-label="Фотогалерея Deviant Blaze"
		tabindex="-1"
	>
		<!-- Backdrop click handler -->
		<button
			type="button"
			class="backdrop-dismiss"
			onclick={() => (isOpen = false)}
			aria-label="Закрити модальне вікно"
		></button>

		<div class="gallery-content" transition:scale={{ start: 0.95, duration: 250 }}>
			<!-- Close button -->
			<button class="close-btn" onclick={() => (isOpen = false)} aria-label="Закрити галерею">
				<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round">
					<line x1="18" y1="6" x2="6" y2="18"></line>
					<line x1="6" y1="6" x2="18" y2="18"></line>
				</svg>
			</button>

			<!-- Main Viewer -->
			<div class="image-stage">
				<img
					src={photos[currentIndex].src}
					alt={photos[currentIndex].title}
					class="main-image"
				/>

				<!-- Navigation arrows -->
				<button class="nav-arrow left" onclick={prev} aria-label="Попереднє фото">
					<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
						<polyline points="15 18 9 12 15 6"></polyline>
					</svg>
				</button>

				<button class="nav-arrow right" onclick={next} aria-label="Наступне фото">
					<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
						<polyline points="9 18 15 12 9 6"></polyline>
					</svg>
				</button>
			</div>

			<!-- Footer info & thumbnails -->
			<div class="gallery-footer">
				<div class="photo-info">
					<span class="counter">0{currentIndex + 1} / 0{photos.length}</span>
					<span class="photo-title">{photos[currentIndex].title}</span>
				</div>

				<div class="thumbnails">
					{#each photos as p, idx}
						<button
							class="thumb-btn"
							class:active={idx === currentIndex}
							onclick={() => (currentIndex = idx)}
							aria-label={`Переглянути фото ${idx + 1}`}
						>
							<img src={p.src} alt="" />
						</button>
					{/each}
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.gallery-overlay {
		position: fixed;
		inset: 0;
		z-index: 200;
		background: rgba(0, 0, 0, 0.88);
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
	}

	.backdrop-dismiss {
		position: absolute;
		inset: 0;
		background: transparent;
		border: none;
		cursor: default;
		z-index: 1;
	}

	.gallery-content {
		position: relative;
		z-index: 2;
		width: min(92vw, 1100px);
		max-height: 90vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.25rem;
	}

	.close-btn {
		position: absolute;
		top: -2.5rem;
		right: 0;
		background: none;
		border: none;
		color: #ffffff;
		cursor: pointer;
		opacity: 0.7;
		transition: opacity 0.2s, transform 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 4px;
	}

	.close-btn:hover {
		opacity: 1;
		transform: scale(1.1);
	}

	.image-stage {
		position: relative;
		width: 100%;
		height: 68vh;
		max-height: 700px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 8px;
		overflow: hidden;
		background: rgba(255, 255, 255, 0.02);
	}

	.main-image {
		max-width: 100%;
		max-height: 100%;
		object-fit: contain;
		border-radius: 6px;
		box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
		user-select: none;
	}

	.nav-arrow {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		background: rgba(0, 0, 0, 0.4);
		border: 1px solid rgba(255, 255, 255, 0.1);
		color: #ffffff;
		width: 48px;
		height: 48px;
		border-radius: 50%;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		backdrop-filter: blur(8px);
		opacity: 0.6;
		transition: all 0.2s;
	}

	.nav-arrow:hover {
		opacity: 1;
		transform: translateY(-50%) scale(1.1);
		background: rgba(0, 0, 0, 0.7);
	}

	.nav-arrow.left {
		left: 1rem;
	}

	.nav-arrow.right {
		right: 1rem;
	}

	.gallery-footer {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		color: #f5f5f7;
		padding: 0 0.5rem;
	}

	.photo-info {
		display: flex;
		align-items: center;
		gap: 1rem;
		font-size: 0.9rem;
	}

	.counter {
		opacity: 0.5;
		font-family: monospace;
		letter-spacing: 0.1em;
	}

	.photo-title {
		font-weight: 500;
		letter-spacing: 0.02em;
	}

	.thumbnails {
		display: flex;
		gap: 0.75rem;
	}

	.thumb-btn {
		width: 54px;
		height: 40px;
		border-radius: 4px;
		overflow: hidden;
		border: 1.5px solid rgba(255, 255, 255, 0.15);
		background: none;
		cursor: pointer;
		padding: 0;
		opacity: 0.4;
		transition: all 0.2s;
	}

	.thumb-btn.active,
	.thumb-btn:hover {
		opacity: 1;
		border-color: #ffffff;
		transform: scale(1.05);
	}

	.thumb-btn img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	@media (max-width: 640px) {
		.gallery-overlay {
			padding: 1rem;
		}

		.image-stage {
			height: 55vh;
		}

		.nav-arrow {
			width: 38px;
			height: 38px;
		}

		.gallery-footer {
			flex-direction: column;
			gap: 0.75rem;
			align-items: center;
		}
	}
</style>
