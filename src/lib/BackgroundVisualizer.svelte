<script>
	import { onDestroy } from 'svelte';

	let {
		isActive = false,
		mode = 'bars', // 'bars' | 'wave' | 'radar'
		sensitivity = 1.5, // 0.5 - 3.5
		spectrumHeight = 1.0, // 0.2 - 1.0 (default 100%)
		palette = 'blaze', // 'blaze' | 'cyber' | 'gothic' | 'toxic' | 'purple'
		onStatusChange = () => {}
	} = $props();

	// Color Palettes
	const PALETTES = {
		blaze: {
			barsGradient: ['#eb1e3c', '#ff5f1f', '#ffcc00', '#ffffff'],
			peakColor: 'rgba(255, 255, 255, 0.95)',
			wavePrimary: 'rgba(255, 95, 31, 0.9)',
			waveSecondary: 'rgba(255, 204, 0, 0.65)',
			waveShadow: 'rgba(235, 30, 60, 0.8)',
			radarCenter: '#ff5f1f',
			radarShadow: '#eb1e3c',
			radarHsl: (t) => `hsl(${12 + t * 50}, 100%, 60%)`,
			auraRgb: '235, 30, 60',
			particleRgb: '255, 130, 40'
		},
		cyber: {
			barsGradient: ['#7928ca', '#d900ff', '#00f0ff', '#ffffff'],
			peakColor: 'rgba(0, 240, 255, 0.95)',
			wavePrimary: 'rgba(0, 240, 255, 0.9)',
			waveSecondary: 'rgba(217, 0, 255, 0.65)',
			waveShadow: 'rgba(0, 240, 255, 0.8)',
			radarCenter: '#00f0ff',
			radarShadow: '#d900ff',
			radarHsl: (t) => `hsl(${180 + t * 110}, 100%, 60%)`,
			auraRgb: '0, 240, 255',
			particleRgb: '0, 240, 255'
		},
		gothic: {
			barsGradient: ['#1e1b4b', '#4f46e5', '#93c5fd', '#ffffff'],
			peakColor: 'rgba(255, 255, 255, 0.95)',
			wavePrimary: 'rgba(147, 197, 253, 0.9)',
			waveSecondary: 'rgba(199, 210, 254, 0.65)',
			waveShadow: 'rgba(99, 102, 241, 0.8)',
			radarCenter: '#a5b4fc',
			radarShadow: '#4f46e5',
			radarHsl: (t) => `hsl(${220 + t * 40}, 90%, ${55 + t * 30}%)`,
			auraRgb: '79, 70, 229',
			particleRgb: '165, 180, 252'
		},
		toxic: {
			barsGradient: ['#047857', '#10b981', '#a3e635', '#ffffff'],
			peakColor: 'rgba(236, 252, 203, 0.95)',
			wavePrimary: 'rgba(16, 185, 129, 0.9)',
			waveSecondary: 'rgba(163, 230, 53, 0.65)',
			waveShadow: 'rgba(16, 185, 129, 0.8)',
			radarCenter: '#10b981',
			radarShadow: '#047857',
			radarHsl: (t) => `hsl(${115 + t * 45}, 100%, 55%)`,
			auraRgb: '16, 185, 129',
			particleRgb: '163, 230, 53'
		},
		purple: {
			barsGradient: ['#581c87', '#9333ea', '#ec4899', '#ffffff'],
			peakColor: 'rgba(253, 242, 248, 0.95)',
			wavePrimary: 'rgba(236, 72, 153, 0.9)',
			waveSecondary: 'rgba(168, 85, 247, 0.65)',
			waveShadow: 'rgba(236, 72, 153, 0.8)',
			radarCenter: '#ec4899',
			radarShadow: '#9333ea',
			radarHsl: (t) => `hsl(${280 + t * 50}, 100%, 65%)`,
			auraRgb: '147, 51, 234',
			particleRgb: '236, 72, 153'
		}
	};

	let currentTheme = $derived(PALETTES[palette] || PALETTES.blaze);

	let canvasEl = $state(null);
	let audioCtx = null;
	let analyser = null;
	let micStream = null;
	let animId = null;
	let testOsc = null;

	let micStatus = $state('idle'); // 'idle' | 'mic' | 'speakers' | 'test'
	let averageVolume = $state(0);
	let peakCaps = [];

	// Smoothed time domain buffer for buttery-smooth waveform
	let smoothedTimeData = null;

	// Floating particles for concert atmosphere
	let particles = [];
	let logicalWidth = 0;
	let logicalHeight = 0;

	function initParticles(width, height) {
		particles = [];
		for (let i = 0; i < 60; i++) {
			particles.push({
				x: Math.random() * width,
				y: Math.random() * height,
				radius: Math.random() * 2 + 1,
				speedX: (Math.random() - 0.5) * 0.8,
				speedY: -Math.random() * 1.5 - 0.5,
				opacity: Math.random() * 0.6 + 0.2
			});
		}
	}

	export async function startMic() {
		stopAudio();
		try {
			if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
				throw new Error('Мікрофон не підтримується');
			}
			const stream = await navigator.mediaDevices.getUserMedia({
				audio: {
					echoCancellation: false,
					noiseSuppression: false,
					autoGainControl: false
				}
			});
			micStream = stream;

			const AudioContextClass = window.AudioContext || /** @type {any} */ (window).webkitAudioContext;
			audioCtx = new AudioContextClass();
			analyser = audioCtx.createAnalyser();
			analyser.fftSize = 256;
			analyser.smoothingTimeConstant = 0.82;

			const source = audioCtx.createMediaStreamSource(stream);
			source.connect(analyser);

			micStatus = 'mic';
			onStatusChange('mic');
			startRenderLoop();
		} catch (err) {
			console.warn('Mic access failed, switching to test mode:', err);
			micStatus = 'test';
			onStatusChange('test');
			startTestMode();
		}
	}

	export async function startSpeakersAudio() {
		stopAudio();
		try {
			if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
				throw new Error('Захоплення аудіо з колонок не підтримується цим браузером.');
			}
			const displayMediaOptions = /** @type {any} */ ({
				video: true,
				audio: {
					suppressLocalAudioPlayback: false
				},
				systemAudio: 'include'
			});
			const stream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);

			// Discard video track immediately
			stream.getVideoTracks().forEach((t) => t.stop());

			const audioTracks = stream.getAudioTracks();
			if (!audioTracks || audioTracks.length === 0) {
				alert('Увага: у вікні вибору увімкніть галочку "Поділитися аудіо" (Share audio), щоб візуалізувати звук колонок. Повертаємося до мікрофона.');
				startMic();
				return;
			}

			micStream = stream;
			audioTracks[0].onended = () => {
				startMic();
			};

			const AudioContextClass = window.AudioContext || /** @type {any} */ (window).webkitAudioContext;
			audioCtx = new AudioContextClass();
			analyser = audioCtx.createAnalyser();
			analyser.fftSize = 256;
			analyser.smoothingTimeConstant = 0.82;

			const source = audioCtx.createMediaStreamSource(stream);
			source.connect(analyser);

			micStatus = 'speakers';
			onStatusChange('speakers');
			startRenderLoop();
		} catch (err) {
			console.warn('Speakers capture cancelled or failed:', err);
			startMic();
		}
	}

	export function startTestMode() {
		stopAudio();
		micStatus = 'test';
		onStatusChange('test');

		const AudioContextClass = window.AudioContext || /** @type {any} */ (window).webkitAudioContext;
		audioCtx = new AudioContextClass();
		analyser = audioCtx.createAnalyser();
		analyser.fftSize = 256;
		analyser.smoothingTimeConstant = 0.85;

		const osc = audioCtx.createOscillator();
		const osc2 = audioCtx.createOscillator();
		const gain = audioCtx.createGain();

		osc.type = 'sawtooth';
		osc.frequency.setValueAtTime(110, audioCtx.currentTime);

		osc2.type = 'sine';
		osc2.frequency.setValueAtTime(220, audioCtx.currentTime);

		gain.gain.setValueAtTime(0.001, audioCtx.currentTime);

		osc.connect(gain);
		osc2.connect(gain);
		gain.connect(analyser);

		osc.start();
		osc2.start();
		testOsc = { osc, osc2, gain };

		startRenderLoop();
	}

	function stopAudio() {
		if (animId) {
			cancelAnimationFrame(animId);
			animId = null;
		}
		if (micStream) {
			micStream.getTracks().forEach((t) => t.stop());
			micStream = null;
		}
		if (testOsc) {
			try {
				testOsc.osc.stop();
				testOsc.osc2.stop();
			} catch {}
			testOsc = null;
		}
		if (audioCtx && audioCtx.state !== 'closed') {
			audioCtx.close().catch(() => {});
			audioCtx = null;
		}
		analyser = null;
		peakCaps = [];
		averageVolume = 0;
		smoothedTimeData = null;
	}

	function startRenderLoop() {
		if (!canvasEl || !analyser) return;

		const bufferLength = analyser.frequencyBinCount;
		const freqData = new Uint8Array(bufferLength);
		const timeData = new Uint8Array(bufferLength);

		if (peakCaps.length !== bufferLength) {
			peakCaps = new Array(bufferLength).fill(0);
		}
		if (!smoothedTimeData || smoothedTimeData.length !== bufferLength) {
			smoothedTimeData = new Float32Array(bufferLength);
			for (let i = 0; i < bufferLength; i++) smoothedTimeData[i] = 128;
		}

		let frame = 0;

		function render() {
			animId = requestAnimationFrame(render);
			frame++;

			if (micStatus === 'test' && testOsc) {
				const now = audioCtx ? audioCtx.currentTime : frame * 0.016;
				testOsc.osc.frequency.setValueAtTime(
					80 + Math.sin(now * 3.2) * 55 + Math.cos(now * 6.5) * 35,
					now
				);
				testOsc.osc2.frequency.setValueAtTime(
					190 + Math.sin(now * 2.1) * 90 + Math.sin(now * 4.8) * 60,
					now
				);
			}

			analyser.getByteFrequencyData(freqData);
			analyser.getByteTimeDomainData(timeData);

			// Temporal LERP smoothing for waveform (buttery-smooth, no harsh spikes)
			for (let i = 0; i < bufferLength; i++) {
				smoothedTimeData[i] += (timeData[i] - smoothedTimeData[i]) * 0.22;
			}

			const ctx = canvasEl.getContext('2d');
			if (!ctx) return;

			const width = logicalWidth || window.innerWidth;
			const height = logicalHeight || window.innerHeight;
			const dpr = Math.min(window.devicePixelRatio || 1, 2);

			// Reset transform and apply DPR scaling cleanly
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			ctx.clearRect(0, 0, width, height);

			let sum = 0;
			for (let i = 0; i < bufferLength; i++) {
				sum += freqData[i];
			}
			const avg = sum / bufferLength;
			averageVolume = avg / 255;

			// Ambient bass glow in center
			renderBassAura(ctx, width, height, averageVolume);

			// Render active mode
			if (mode === 'bars') {
				renderBars(ctx, width, height, freqData, bufferLength);
			} else if (mode === 'wave') {
				renderWave(ctx, width, height, smoothedTimeData, bufferLength);
			} else if (mode === 'radar') {
				renderRadar(ctx, width, height, freqData, bufferLength);
			}

			// Render subtle floating concert sparks
			renderParticles(ctx, width, height, averageVolume);
		}

		render();
	}

	function renderBassAura(ctx, width, height, vol) {
		if (vol < 0.05) return;
		const centerX = width / 2;
		const centerY = height / 2;
		const radius = Math.min(width, height) * (0.35 + vol * 0.3 * sensitivity);

		const aura = ctx.createRadialGradient(
			centerX, centerY, 0,
			centerX, centerY, radius
		);
		aura.addColorStop(0, `rgba(${currentTheme.auraRgb}, ${vol * 0.35})`);
		aura.addColorStop(0.5, `rgba(${currentTheme.auraRgb}, ${vol * 0.15})`);
		aura.addColorStop(1, 'rgba(0, 0, 0, 0)');

		ctx.fillStyle = aura;
		ctx.fillRect(0, 0, width, height);
	}

	function renderBars(ctx, width, height, freqData, bufferLength) {
		const visibleBins = Math.floor(bufferLength * 0.72);
		const barWidth = (width / visibleBins) * 0.76;
		const gap = (width / visibleBins) * 0.24;

		// Gradient spans across the full height
		const maxBarH = height * spectrumHeight * 0.98;
		const gradient = ctx.createLinearGradient(0, height, 0, height - maxBarH);
		const stops = currentTheme.barsGradient;
		gradient.addColorStop(0, stops[0]);
		gradient.addColorStop(0.35, stops[1]);
		gradient.addColorStop(0.75, stops[2]);
		gradient.addColorStop(1, stops[3]);

		for (let i = 0; i < visibleBins; i++) {
			let val = freqData[i] * sensitivity;
			if (val > 255) val = 255;
			const barHeight = Math.max(4, (val / 255) * maxBarH);

			const x = i * (barWidth + gap);
			const y = height - barHeight;

			// Peak caps
			if (barHeight > peakCaps[i]) {
				peakCaps[i] = barHeight;
			} else {
				peakCaps[i] = Math.max(0, peakCaps[i] - 2.4);
			}

			// Main Bar with rounded top corners
			ctx.fillStyle = gradient;
			ctx.beginPath();
			ctx.roundRect(x, y, barWidth, barHeight, [4, 4, 0, 0]);
			ctx.fill();

			// Peak Falling Cap
			const capY = height - peakCaps[i] - 4;
			if (capY >= 0) {
				ctx.fillStyle = currentTheme.peakColor;
				ctx.fillRect(x, capY, barWidth, 2.5);
			}
		}
	}

	function renderWave(ctx, width, height, smoothData, bufferLength) {
		const centerY = height / 2;
		const amp = height * 0.42 * sensitivity;

		// 1. Primary Smooth Wave with Catmull-Rom / Quadratic Bezier smoothing
		ctx.lineWidth = 4;
		ctx.strokeStyle = currentTheme.wavePrimary;
		ctx.shadowColor = currentTheme.waveShadow;
		ctx.shadowBlur = 20;

		const sliceWidth = width / (bufferLength - 1);

		ctx.beginPath();
		let prevX = 0;
		let prevY = centerY + ((smoothData[0] - 128) / 128.0) * amp;
		ctx.moveTo(prevX, prevY);

		for (let i = 1; i < bufferLength; i++) {
			const v = (smoothData[i] - 128) / 128.0;
			const curX = i * sliceWidth;
			const curY = centerY + v * amp;
			const midX = (prevX + curX) / 2;
			const midY = (prevY + curY) / 2;

			ctx.quadraticCurveTo(prevX, prevY, midX, midY);
			prevX = curX;
			prevY = curY;
		}
		ctx.lineTo(width, prevY);
		ctx.stroke();
		ctx.shadowBlur = 0;

		// 2. Secondary Harmonic Wave (inverted & subtle for cinematic visualizer depth)
		ctx.lineWidth = 2.2;
		ctx.strokeStyle = currentTheme.waveSecondary;
		ctx.beginPath();
		prevX = 0;
		prevY = centerY - ((smoothData[0] - 128) / 128.0) * (amp * 0.6);
		ctx.moveTo(prevX, prevY);

		for (let i = 1; i < bufferLength; i++) {
			const v = (smoothData[i] - 128) / 128.0;
			const curX = i * sliceWidth;
			const curY = centerY - v * (amp * 0.6);
			const midX = (prevX + curX) / 2;
			const midY = (prevY + curY) / 2;

			ctx.quadraticCurveTo(prevX, prevY, midX, midY);
			prevX = curX;
			prevY = curY;
		}
		ctx.lineTo(width, prevY);
		ctx.stroke();
	}

	function renderRadar(ctx, width, height, freqData, bufferLength) {
		// EXACT Centering: dynamically aligns with the Deviant Blaze logo!
		let centerX = width / 2;
		let centerY = height / 2;

		if (typeof document !== 'undefined') {
			const logoEl = document.querySelector('.hero-center');
			if (logoEl) {
				const rect = logoEl.getBoundingClientRect();
				centerX = rect.left + rect.width / 2;
				centerY = rect.top + rect.height / 2;
			}
		}

		const baseRadius = Math.min(width, height) * 0.22;
		const visibleBins = Math.floor(bufferLength * 0.68);

		ctx.save();
		ctx.translate(centerX, centerY);

		// Central pulsing core ring
		ctx.beginPath();
		ctx.arc(0, 0, baseRadius + averageVolume * 35 * sensitivity, 0, Math.PI * 2);
		ctx.strokeStyle = currentTheme.radarCenter;
		ctx.lineWidth = 2.5;
		ctx.shadowColor = currentTheme.radarShadow;
		ctx.shadowBlur = 18;
		ctx.stroke();
		ctx.shadowBlur = 0;

		// 360 degree radial frequency rays emanating from center
		for (let i = 0; i < visibleBins; i++) {
			const angle = (i / visibleBins) * Math.PI * 2;
			let val = freqData[i] * sensitivity;
			if (val > 255) val = 255;
			const rayLength = (val / 255) * (Math.min(width, height) * 0.32);

			const cos = Math.cos(angle);
			const sin = Math.sin(angle);

			const x1 = cos * baseRadius;
			const y1 = sin * baseRadius;
			const x2 = cos * (baseRadius + rayLength);
			const y2 = sin * (baseRadius + rayLength);

			ctx.beginPath();
			ctx.moveTo(x1, y1);
			ctx.lineTo(x2, y2);
			ctx.strokeStyle = currentTheme.radarHsl(i / visibleBins);
			ctx.lineWidth = 2.8;
			ctx.lineCap = 'round';
			ctx.stroke();
		}

		ctx.restore();
	}

	function renderParticles(ctx, width, height, vol) {
		for (let p of particles) {
			p.y += p.speedY * (1 + vol * 2.5 * sensitivity);
			p.x += p.speedX;

			if (p.y < 0) {
				p.y = height;
				p.x = Math.random() * width;
			}
			if (p.x < 0) p.x = width;
			if (p.x > width) p.x = 0;

			ctx.fillStyle = `rgba(${currentTheme.particleRgb}, ${p.opacity * (0.4 + vol * 0.6)})`;
			ctx.beginPath();
			ctx.arc(p.x, p.y, p.radius * (1 + vol), 0, Math.PI * 2);
			ctx.fill();
		}
	}

	function resize() {
		if (!canvasEl) return;
		logicalWidth = window.innerWidth;
		logicalHeight = window.innerHeight;
		const dpr = Math.min(window.devicePixelRatio || 1, 2);

		canvasEl.width = Math.round(logicalWidth * dpr);
		canvasEl.height = Math.round(logicalHeight * dpr);

		initParticles(logicalWidth, logicalHeight);
	}

	$effect(() => {
		if (typeof window === 'undefined') return;

		if (isActive) {
			setTimeout(() => {
				resize();
				startMic();
			}, 30);

			function onWindowResize() {
				resize();
			}
			window.addEventListener('resize', onWindowResize);

			return () => {
				window.removeEventListener('resize', onWindowResize);
				stopAudio();
			};
		} else {
			stopAudio();
			if (canvasEl) {
				const ctx = canvasEl.getContext('2d');
				if (ctx) ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
			}
		}
	});

	onDestroy(() => {
		stopAudio();
	});
</script>

<canvas
	bind:this={canvasEl}
	class="vj-background-canvas"
	class:is-active={isActive}
	aria-hidden="true"
></canvas>

<style>
	.vj-background-canvas {
		position: fixed;
		inset: 0;
		width: 100vw;
		height: 100vh;
		height: 100dvh;
		z-index: 2;
		pointer-events: none;
		opacity: 0;
		transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.vj-background-canvas.is-active {
		opacity: 1;
	}
</style>
