<script>
	let { isOpen = $bindable(false) } = $props();

	const images = [
		{
			src: '/gallery/img1.webp',
			title: 'Deviant Blaze Live on Stage',
			alt: 'Deviant Blaze Live on Stage'
		},
		{
			src: '/gallery/img2.webp',
			title: 'Vocals & Live Energy',
			alt: 'Vocals & Live Energy'
		},
		{
			src: '/gallery/img3.webp',
			title: 'Deviant Blaze Band',
			alt: 'Deviant Blaze Band Photoshoot'
		}
	];

	let index = $state(0);
	let thumbEls = $state([]);

	// Lock body scroll when open
	$effect(() => {
		if (typeof document === 'undefined') return;
		if (isOpen) {
			const originalOverflow = document.body.style.overflow;
			document.body.style.overflow = 'hidden';
			return () => {
				document.body.style.overflow = originalOverflow;
			};
		}
	});

	// Auto scroll active thumbnail into view
	$effect(() => {
		if (isOpen && thumbEls[index]) {
			thumbEls[index].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
		}
	});

	function prev() {
		if (images.length <= 1) return;
		index = (index - 1 + images.length) % images.length;
	}

	function next() {
		if (images.length <= 1) return;
		index = (index + 1) % images.length;
	}

	function handleKeydown(e) {
		if (!isOpen) return;
		if (e.key === 'Escape') {
			e.preventDefault();
			isOpen = false;
		} else if (e.key === 'ArrowLeft') {
			e.preventDefault();
			prev();
		} else if (e.key === 'ArrowRight') {
			e.preventDefault();
			next();
		}
	}

	// Touch swipe gestures
	let touchStartX = 0;
	let touchStartY = 0;

	function onTouchStart(e) {
		if (e.touches.length === 1) {
			touchStartX = e.touches[0].clientX;
			touchStartY = e.touches[0].clientY;
		}
	}

	function onTouchEnd(e) {
		if (e.changedTouches.length === 1) {
			const diffX = e.changedTouches[0].clientX - touchStartX;
			const diffY = e.changedTouches[0].clientY - touchStartY;
			if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
				if (diffX > 0) prev();
				else next();
			}
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen && images.length > 0}
	{@const currentImg = images[index] || images[0]}
	<div
		class="lightbox-backdrop"
		class:has-rail={images.length > 1}
		role="dialog"
		aria-modal="true"
		aria-label="Галерея фотографій"
		tabindex="-1"
		onclick={(e) => {
			if (e.target === e.currentTarget) isOpen = false;
		}}
		onkeydown={(e) => {
			if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) isOpen = false;
		}}
		ontouchstart={onTouchStart}
		ontouchend={onTouchEnd}
	>
		<!-- Close button (top right) -->
		<button
			type="button"
			class="lightbox-close"
			onclick={() => (isOpen = false)}
			aria-label="Закрити галерею"
		>
			<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<line x1="18" y1="6" x2="6" y2="18"></line>
				<line x1="6" y1="6" x2="18" y2="18"></line>
			</svg>
		</button>

		<!-- Left Vertical Thumbnail Rail (like in teatralo4ka) -->
		{#if images.length > 1}
			<div class="lightbox-rail" aria-label="Мініатюри галереї">
				{#each images as img, i (img.src)}
					<button
						type="button"
						class="lightbox-thumb"
						class:lightbox-thumb--active={i === index}
						bind:this={thumbEls[i]}
						onclick={() => (index = i)}
						aria-label={`Перейти до фото ${i + 1}`}
						aria-current={i === index ? 'true' : undefined}
					>
						<img src={img.src} alt="" loading="lazy" decoding="async" />
					</button>
				{/each}
			</div>
		{/if}

		<!-- Prev button (left) -->
		{#if images.length > 1}
			<button
				type="button"
				class="lightbox-nav lightbox-nav--prev"
				onclick={prev}
				aria-label="Попереднє фото"
			>
				<svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<polyline points="15 18 9 12 15 6"></polyline>
				</svg>
			</button>
		{/if}

		<!-- Main Image container -->
		<div class="lightbox-content">
			{#key index}
				<img
					src={currentImg.src}
					alt={currentImg.alt || currentImg.title || ''}
					class="lightbox-img"
				/>
			{/key}

			<!-- Caption and Counter -->
			<div class="lightbox-footer">
				{#if currentImg.title}
					<p class="lightbox-caption">{currentImg.title}</p>
				{/if}
				{#if images.length > 1}
					<span class="lightbox-counter">{index + 1} / {images.length}</span>
				{/if}
			</div>
		</div>

		<!-- Next button (right) -->
		{#if images.length > 1}
			<button
				type="button"
				class="lightbox-nav lightbox-nav--next"
				onclick={next}
				aria-label="Наступне фото"
			>
				<svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<polyline points="9 18 15 12 9 6"></polyline>
				</svg>
			</button>
		{/if}
	</div>
{/if}

<style>
	.lightbox-backdrop {
		--lightbox-rail: 0px;
		position: fixed;
		inset: 0;
		z-index: 99999;
		background: rgba(0, 0, 0, 0.92);
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
		display: flex;
		align-items: center;
		justify-content: center;
		padding-left: var(--lightbox-rail);
		animation: lightboxFadeIn 0.25s ease-out;
		user-select: none;
		-webkit-user-select: none;
	}

	.lightbox-backdrop.has-rail {
		--lightbox-rail: 104px;
	}

	@keyframes lightboxFadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	/* Close button */
	.lightbox-close {
		position: absolute;
		top: 1.5rem;
		right: 1.5rem;
		z-index: 100001;
		background: rgba(255, 255, 255, 0.15);
		border: 1px solid rgba(255, 255, 255, 0.2);
		color: #ffffff;
		width: 48px;
		height: 48px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		outline: none;
		transition: all 0.2s ease;
	}

	.lightbox-close:hover {
		background: rgba(255, 255, 255, 0.3);
		transform: scale(1.08);
	}

	/* Navigation arrows (prev & next) */
	.lightbox-nav {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		z-index: 100001;
		background: rgba(255, 255, 255, 0.15);
		border: 1px solid rgba(255, 255, 255, 0.2);
		color: #ffffff;
		width: 56px;
		height: 56px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		outline: none;
		transition: all 0.2s ease;
	}

	.lightbox-nav:hover {
		background: rgba(255, 255, 255, 0.3);
		transform: translateY(-50%) scale(1.1);
	}

	.lightbox-nav--prev {
		left: calc(var(--lightbox-rail) + 1.5rem);
	}

	.lightbox-nav--next {
		right: 1.5rem;
	}

	/* Left Vertical Thumb Rail */
	.lightbox-rail {
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		width: var(--lightbox-rail);
		overflow-y: auto;
		overscroll-behavior: contain;
		display: flex;
		flex-direction: column;
		justify-content: safe center;
		gap: 10px;
		padding: 1rem 0.75rem;
		z-index: 100001;
		scrollbar-width: thin;
		scrollbar-color: rgba(255, 255, 255, 0.35) transparent;
	}

	.lightbox-thumb {
		flex: none;
		width: 100%;
		aspect-ratio: 1 / 1;
		padding: 0;
		border: 2px solid transparent;
		border-radius: 10px;
		overflow: hidden;
		background: none;
		cursor: pointer;
		opacity: 0.55;
		transition: opacity 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
	}

	.lightbox-thumb img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.lightbox-thumb:hover,
	.lightbox-thumb:focus-visible {
		opacity: 1;
		transform: scale(1.04);
	}

	.lightbox-thumb--active {
		opacity: 1;
		border-color: #ffffff;
	}

	/* Center Content Area */
	.lightbox-content {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		max-width: calc(90vw - var(--lightbox-rail));
		max-height: 85dvh;
		position: relative;
		pointer-events: none;
	}

	.lightbox-img {
		max-width: 100%;
		max-height: 78dvh;
		object-fit: contain;
		border-radius: 12px;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
		pointer-events: auto;
		animation: imgZoomIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
	}

	@keyframes imgZoomIn {
		from {
			transform: scale(0.96);
			opacity: 0;
		}
		to {
			transform: scale(1);
			opacity: 1;
		}
	}

	.lightbox-footer {
		margin-top: 1rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.4rem;
		color: #ffffff;
		text-align: center;
		pointer-events: auto;
	}

	.lightbox-caption {
		font-size: 1rem;
		font-weight: 500;
		letter-spacing: 0.02em;
		margin: 0;
		color: #f5f5f7;
		text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
	}

	.lightbox-counter {
		font-size: 0.85rem;
		font-family: monospace;
		opacity: 0.85;
		background: rgba(255, 255, 255, 0.15);
		padding: 0.2rem 0.8rem;
		border-radius: 12px;
	}

	@media (max-width: 768px) {
		.lightbox-backdrop.has-rail {
			--lightbox-rail: 76px;
		}

		.lightbox-rail {
			gap: 8px;
			padding: 0.75rem 0.5rem;
		}

		.lightbox-close {
			top: 1rem;
			right: 1rem;
			width: 40px;
			height: 40px;
		}

		.lightbox-nav {
			width: 44px;
			height: 44px;
		}

		.lightbox-nav--prev {
			left: calc(var(--lightbox-rail) + 0.5rem);
		}

		.lightbox-nav--next {
			right: 0.5rem;
		}

		.lightbox-img {
			max-width: 100%;
			max-height: 70dvh;
		}
	}
</style>
