<script>
	import { onMount } from 'svelte';
	import logoData from './logo-data.json';

	let svgElement = $state(null);
	let containerElement = $state(null);

	// Mouse state in window coordinates (-1 to 1 normalized)
	let normX = $state(0);
	let normY = $state(0);
	let rawSvgX = $state(540);
	let rawSvgY = $state(540);
	let isHovering = $state(false);

	// Smoothed values for global tilt
	let smoothTiltX = $state(0);
	let smoothTiltY = $state(0);

	// Per-element physics simulation
	let elements = $state(
		logoData.map((item, index) => ({
			...item,
			index,
			// Position in SVG
			currX: 0,
			currY: 0,
			currRot: 0,
			currScale: 1,
			targetX: 0,
			targetY: 0,
			targetRot: 0,
			targetScale: 1,
			phase: index * 0.55
		}))
	);

	// Specular highlight gradient coords
	let glowX = $state(50);
	let glowY = $state(50);

	onMount(() => {
		let animId;
		let lastTime = performance.now();

		function onPointerMove(e) {
			const winW = window.innerWidth;
			const winH = window.innerHeight;

			// Window normalized coordinates [-1..1]
			normX = (e.clientX / winW) * 2 - 1;
			normY = (e.clientY / winH) * 2 - 1;

			// CSS custom properties for ambient background glow
			document.documentElement.style.setProperty('--mouse-x', `${(e.clientX / winW) * 100}%`);
			document.documentElement.style.setProperty('--mouse-y', `${(e.clientY / winH) * 100}%`);

			// Project to SVG coordinate space
			if (svgElement) {
				const rect = svgElement.getBoundingClientRect();
				rawSvgX = ((e.clientX - rect.left) / rect.width) * 1080;
				rawSvgY = ((e.clientY - rect.top) / rect.height) * 1080;

				glowX = Math.max(0, Math.min(100, (rawSvgX / 1080) * 100));
				glowY = Math.max(0, Math.min(100, (rawSvgY / 1080) * 100));
			}

			isHovering = true;
		}

		function onPointerLeave() {
			isHovering = false;
		}

		window.addEventListener('pointermove', onPointerMove, { passive: true });
		window.addEventListener('pointerleave', onPointerLeave);

		// Animation loop
		function loop(time) {
			const dt = Math.min(time - lastTime, 50);
			lastTime = time;

			// Autonomous subtle drifting when idle or touch
			let targetNormX = normX;
			let targetNormY = normY;
			let activeSvgX = rawSvgX;
			let activeSvgY = rawSvgY;

			if (!isHovering) {
				const idleT = time * 0.001;
				targetNormX = Math.sin(idleT * 0.8) * 0.25;
				targetNormY = Math.cos(idleT * 0.6) * 0.2;
				activeSvgX = 540 + Math.sin(idleT * 0.9) * 220;
				activeSvgY = 540 + Math.cos(idleT * 0.7) * 160;
				glowX = (activeSvgX / 1080) * 100;
				glowY = (activeSvgY / 1080) * 100;
			}

			// Lerp global 3D tilt
			const targetTiltX = -targetNormY * 11;
			const targetTiltY = targetNormX * 11;
			smoothTiltX += (targetTiltX - smoothTiltX) * 0.08;
			smoothTiltY += (targetTiltY - smoothTiltY) * 0.08;

			// Update each element
			for (let i = 0; i < elements.length; i++) {
				const el = elements[i];
				const isWing = el.name.startsWith('wing');
				const radius = isWing ? 480 : 320;
				const maxDisplace = isWing ? 45 : 30;

				const dx = activeSvgX - el.cx;
				const dy = activeSvgY - el.cy;
				const dist = Math.sqrt(dx * dx + dy * dy);

				// Idle floating
				const idleWave = Math.sin(time * 0.002 + el.phase) * (isWing ? 4.5 : 3.0);
				const idleRot = Math.cos(time * 0.0016 + el.phase) * (isWing ? 1.4 : 0.8);

				if (dist < radius) {
					// Smoothstep proximity factor
					const t = 1 - dist / radius;
					const ease = t * t * (3 - 2 * t);

					// Dynamic repulsive/magnetic displacement vector
					const nx = dx / (dist || 1);
					const ny = dy / (dist || 1);

					// Letters gently disperse away from cursor, creating a liquid ripple
					el.targetX = -nx * ease * maxDisplace;
					el.targetY = -ny * ease * maxDisplace + idleWave;

					// Dynamic rotation based on cursor direction
					let rot = -nx * ease * (isWing ? 16 : 9) + idleRot;
					if (isWing) {
						// Wings flex/flare organically along the cursor's vertical position
						const flexAngle = ((activeSvgY - el.cy) / radius) * ease * 18;
						rot += el.name === 'wing_left' ? -flexAngle : flexAngle;
					}
					el.targetRot = rot;

					// Dynamic scale / elevation lift
					el.targetScale = 1 + ease * (isWing ? 0.12 : 0.08);
				} else {
					el.targetX = 0;
					el.targetY = idleWave;
					el.targetRot = idleRot;
					el.targetScale = 1;
				}

				// Smooth lerp physics
				const lerpSpeed = isWing ? 0.09 : 0.11;
				el.currX += (el.targetX - el.currX) * lerpSpeed;
				el.currY += (el.targetY - el.currY) * lerpSpeed;
				el.currRot += (el.targetRot - el.currRot) * lerpSpeed;
				el.currScale += (el.targetScale - el.currScale) * lerpSpeed;
			}

			animId = requestAnimationFrame(loop);
		}

		animId = requestAnimationFrame(loop);

		return () => {
			cancelAnimationFrame(animId);
			window.removeEventListener('pointermove', onPointerMove);
			window.removeEventListener('pointerleave', onPointerLeave);
		};
	});
</script>

<div
	class="logo-stage"
	bind:this={containerElement}
	style="transform: perspective(1200px) rotateX({smoothTiltX.toFixed(2)}deg) rotateY({smoothTiltY.toFixed(2)}deg);"
>
	<svg
		bind:this={svgElement}
		class="deviant-logo"
		viewBox="0 0 1080 1080"
		xmlns="http://www.w3.org/2000/svg"
		aria-label="Deviant Blaze Logo"
		role="img"
	>
		<defs>
			<!-- Dynamic specular highlight tracking cursor -->
			<radialGradient
				id="cursor-shimmer"
				cx="{glowX.toFixed(1)}%"
				cy="{glowY.toFixed(1)}%"
				r="45%"
				fx="{glowX.toFixed(1)}%"
				fy="{glowY.toFixed(1)}%"
			>
				<stop offset="0%" stop-color="var(--fg-primary)" stop-opacity="1" />
				<stop offset="50%" stop-color="var(--fg-primary)" stop-opacity="0.94" />
				<stop offset="100%" stop-color="var(--fg-primary)" stop-opacity="0.82" />
			</radialGradient>

			<!-- Filter for subtle luxury luminescence -->
			<filter id="subtle-glow" x="-20%" y="-20%" width="140%" height="140%">
				<feGaussianBlur in="SourceAlpha" stdDeviation="6" result="blur" />
				<feFlood flood-color="var(--fg-primary)" flood-opacity="0.16" result="glowColor" />
				<feComposite in="glowColor" in2="blur" operator="in" result="glow" />
				<feMerge>
					<feMergeNode in="glow" />
					<feMergeNode in="SourceGraphic" />
				</feMerge>
			</filter>
		</defs>

		<!-- All 14 interactive SVG letter and wing groups -->
		{#each elements as el (el.name)}
			<g
				id="group-{el.name}"
				class="logo-group group-{el.word}"
				style="transform: translate({el.currX.toFixed(2)}px, {el.currY.toFixed(2)}px) rotate({el.currRot.toFixed(2)}deg) scale({el.currScale.toFixed(3)}); transform-origin: {el.cx}px {el.cy}px;"
			>
				<!-- Foreground shapes filled with dynamic specular shimmer -->
				<g class="glyph-fg" fill="url(#cursor-shimmer)">
					{#each el.fg as d}
						<path {d} />
					{/each}
				</g>

				<!-- Negative space cutouts filled with the background color -->
				{#if el.cutouts.length > 0 || el.polygons.length > 0}
					<g class="glyph-cutout" fill="var(--cutout-fill)">
						{#each el.cutouts as d}
							<path {d} />
						{/each}
						{#each el.polygons as points}
							<polygon {points} />
						{/each}
					</g>
				{/if}
			</g>
		{/each}
	</svg>
</div>

<style>
	.logo-stage {
		position: relative;
		width: min(88vw, 680px);
		max-height: 80vh;
		aspect-ratio: 1 / 1;
		display: flex;
		align-items: center;
		justify-content: center;
		will-change: transform;
		transform-style: preserve-3d;
		transition: filter var(--transition-speed) var(--transition-easing);
	}

	.deviant-logo {
		width: 100%;
		height: 100%;
		overflow: visible;
		filter: var(--logo-glow);
		pointer-events: none;
		transition: filter var(--transition-speed) var(--transition-easing);
	}

	.logo-group {
		will-change: transform;
		transform-box: fill-box;
		transition: fill var(--transition-speed) var(--transition-easing);
	}

	.glyph-fg path {
		vector-effect: non-scaling-stroke;
	}

	.glyph-cutout {
		transition: fill var(--transition-speed) var(--transition-easing);
	}

	@media (max-width: 640px) {
		.logo-stage {
			width: 92vw;
		}
	}
</style>
