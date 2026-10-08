<script>
	import { onMount, onDestroy } from 'svelte';
	import { asset } from '$app/paths';

	let { intensity = 1.0 } = $props();

	let currentX = $state(0);
	let currentY = $state(0);
	let targetX = 0;
	let targetY = 0;
	let rafId = null;
	let isRunning = false;
	let prefersReduced = false;

	function startLoop() {
		if (isRunning || prefersReduced) return;
		isRunning = true;
		rafId = requestAnimationFrame(updateParallax);
	}

	function updateParallax() {
		const dx = targetX - currentX;
		const dy = targetY - currentY;

		currentX += dx * 0.08;
		currentY += dy * 0.08;

		if (Math.abs(dx) < 0.0002 && Math.abs(dy) < 0.0002) {
			currentX = targetX;
			currentY = targetY;
			isRunning = false;
			return;
		}

		rafId = requestAnimationFrame(updateParallax);
	}

	onMount(() => {
		if (typeof window === 'undefined') return;

		const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
		prefersReduced = mediaQuery.matches;
		const onMotionChange = (e) => {
			prefersReduced = e.matches;
			if (prefersReduced) {
				targetX = 0;
				targetY = 0;
				currentX = 0;
				currentY = 0;
			}
		};
		mediaQuery.addEventListener('change', onMotionChange);

		const handleMouseMove = (e) => {
			if (prefersReduced) return;
			const halfW = window.innerWidth / 2;
			const halfH = window.innerHeight / 2;
			targetX = (e.clientX - halfW) / halfW;
			targetY = (e.clientY - halfH) / halfH;
			startLoop();
		};

		const handleMouseLeave = () => {
			targetX = 0;
			targetY = 0;
			startLoop();
		};

		const handleOrientation = (e) => {
			if (prefersReduced || e.gamma === null || e.beta === null) return;
			targetX = Math.max(-1, Math.min(1, e.gamma / 30));
			targetY = Math.max(-1, Math.min(1, (e.beta - 45) / 30));
			startLoop();
		};

		window.addEventListener('mousemove', handleMouseMove, { passive: true });
		document.addEventListener('mouseleave', handleMouseLeave);
		window.addEventListener('deviceorientation', handleOrientation, { passive: true });

		return () => {
			if (rafId) cancelAnimationFrame(rafId);
			mediaQuery.removeEventListener('change', onMotionChange);
			window.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseleave', handleMouseLeave);
			window.removeEventListener('deviceorientation', handleOrientation);
		};
	});

	onDestroy(() => {
		if (rafId) cancelAnimationFrame(rafId);
	});

	// Derived transform strings for 4 distinct depth planes
	// 1. Deepest Background (slight counter movement)
	let baseTransform = $derived(
		`translate3d(${-currentX * 4 * intensity}px, ${-currentY * 3 * intensity}px, 0) scale(1.05)`
	);

	// 2. Star Flare (deep distance, amplitude reduced 3x)
	let starTransform = $derived(
		`translate3d(${currentX * 3.3 * intensity}px, ${currentY * 2.7 * intensity}px, 0) rotateY(${currentX * 0.5 * intensity}deg) rotateX(${-currentY * 0.4 * intensity}deg) scale(1.05)`
	);

	// 3. Circle Ring (middle distance, amplitude reduced 2x)
	let circleTransform = $derived(
		`translate3d(${currentX * 8 * intensity}px, ${currentY * 6 * intensity}px, 0) rotateY(${currentX * 1.2 * intensity}deg) rotateX(${-currentY * 0.9 * intensity}deg) scale(1.05)`
	);

	// 4. Raven (close foreground focal point)
	let ravenTransform = $derived(
		`translate3d(${currentX * 26 * intensity}px, ${currentY * 20 * intensity}px, 0) rotateY(${currentX * 3.4 * intensity}deg) rotateX(${-currentY * 2.4 * intensity}deg) scale(1.05)`
	);
</script>

<div class="parallax-viewport" aria-hidden="true">
	<!-- Dark Theme Layers -->
	<div class="theme-layer theme-dark">
		<!-- Layer 1: Pure Background Texture -->
		<img
			src={asset('layers/bg-dark-base.webp')}
			alt=""
			class="parallax-layer layer-base"
			style:transform={baseTransform}
			loading="eager"
			decoding="async"
		/>
		<!-- Layer 2: Star Flare -->
		<img
			src={asset('layers/star-dark.webp')}
			alt=""
			class="parallax-layer layer-star"
			style:transform={starTransform}
			loading="eager"
			decoding="async"
		/>
		<!-- Layer 3: Circle Ring -->
		<img
			src={asset('layers/circle-dark.webp')}
			alt=""
			class="parallax-layer layer-circle"
			style:transform={circleTransform}
			loading="eager"
			decoding="async"
		/>
		<!-- Layer 4: Raven -->
		<img
			src={asset('layers/raven-dark.webp')}
			alt=""
			class="parallax-layer layer-raven"
			style:transform={ravenTransform}
			loading="eager"
			decoding="async"
		/>
	</div>

	<!-- Light Theme Layers -->
	<div class="theme-layer theme-light">
		<!-- Layer 1: Pure Background Texture -->
		<img
			src={asset('layers/bg-light-base.webp')}
			alt=""
			class="parallax-layer layer-base"
			style:transform={baseTransform}
			loading="eager"
			decoding="async"
		/>
		<!-- Layer 2: Star Flare -->
		<img
			src={asset('layers/star-light.webp')}
			alt=""
			class="parallax-layer layer-star"
			style:transform={starTransform}
			loading="eager"
			decoding="async"
		/>
		<!-- Layer 3: Circle Ring -->
		<img
			src={asset('layers/circle-light.webp')}
			alt=""
			class="parallax-layer layer-circle"
			style:transform={circleTransform}
			loading="eager"
			decoding="async"
		/>
		<!-- Layer 4: Raven -->
		<img
			src={asset('layers/raven-light.webp')}
			alt=""
			class="parallax-layer layer-raven"
			style:transform={ravenTransform}
			loading="eager"
			decoding="async"
		/>
	</div>
</div>

<style>
	.parallax-viewport {
		position: fixed;
		inset: 0;
		z-index: 0;
		pointer-events: none;
		overflow: hidden;
		perspective: 1200px;
		user-select: none;
		-webkit-user-select: none;
	}

	.theme-layer {
		position: absolute;
		inset: 0;
		opacity: 0;
		transition: opacity var(--transition-speed, 0.4s) var(--transition-easing, ease);
		will-change: opacity;
		perspective: 1200px;
		transform-style: preserve-3d;
	}

	:root .theme-dark,
	:global([data-theme='dark']) .theme-dark {
		opacity: 1;
	}

	:global([data-theme='light']) .theme-dark {
		opacity: 0;
	}

	:global([data-theme='light']) .theme-light {
		opacity: 1;
	}

	.parallax-layer {
		position: absolute;
		inset: -2.5%;
		width: 105%;
		height: 105%;
		object-fit: cover;
		object-position: center;
		pointer-events: none;
		will-change: transform;
		backface-visibility: hidden;
	}

	.layer-base {
		z-index: 1;
		transition: transform 0.1s linear;
	}

	.layer-star {
		z-index: 2;
		transform-origin: 26% 29%;
		transition: transform 0.1s linear;
		filter: drop-shadow(0 0 12px rgba(235, 30, 60, 0.4));
	}

	.layer-circle {
		z-index: 3;
		transform-origin: 73% 65%;
		transition: transform 0.1s linear;
		filter: drop-shadow(0 0 8px rgba(235, 30, 60, 0.25));
	}

	.layer-raven {
		z-index: 4;
		transform-origin: 70% 60%;
		transition: transform 0.1s linear;
		filter: drop-shadow(0 14px 28px rgba(0, 0, 0, 0.4));
	}

	:global([data-theme='light']) .layer-star {
		filter: drop-shadow(0 0 6px rgba(180, 20, 40, 0.3));
	}

	:global([data-theme='light']) .layer-circle {
		filter: drop-shadow(0 0 4px rgba(180, 20, 40, 0.2));
	}

	:global([data-theme='light']) .layer-raven {
		filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.15));
	}
</style>
