<script>
	import { onDestroy } from 'svelte';

	let {
		isActive = false,
		mode = 'bars', // 'bars' | 'wave' | 'radar'
		onStatusChange = () => {}
	} = $props();

	let canvasEl = $state(null);
	let audioCtx = null;
	let analyser = null;
	let micStream = null;
	let animId = null;
	let testOsc = null;

	let micStatus = $state('idle'); // 'idle' | 'listening' | 'denied' | 'test'
	let averageVolume = $state(0);
	let peakCaps = [];

	// Floating particles for concert atmosphere in radar/bars mode
	let particles = [];

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

			// Discard the video track immediately as we only analyze audio
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
	}

	function startRenderLoop() {
		if (!canvasEl || !analyser) return;

		const bufferLength = analyser.frequencyBinCount;
		const freqData = new Uint8Array(bufferLength);
		const timeData = new Uint8Array(bufferLength);

		if (peakCaps.length !== bufferLength) {
			peakCaps = new Array(bufferLength).fill(0);
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

			const ctx = canvasEl.getContext('2d');
			if (!ctx) return;

			const width = canvasEl.width;
			const height = canvasEl.height;

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
				renderWave(ctx, width, height, timeData, bufferLength);
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
		const radius = Math.min(width, height) * (0.35 + vol * 0.3);

		const aura = ctx.createRadialGradient(
			centerX, centerY, 0,
			centerX, centerY, radius
		);
		aura.addColorStop(0, `rgba(235, 30, 60, ${vol * 0.28})`);
		aura.addColorStop(0.5, `rgba(255, 95, 31, ${vol * 0.14})`);
		aura.addColorStop(1, 'rgba(0, 0, 0, 0)');

		ctx.fillStyle = aura;
		ctx.fillRect(0, 0, width, height);
	}

	function renderBars(ctx, width, height, freqData, bufferLength) {
		const visibleBins = Math.floor(bufferLength * 0.72);
		const barWidth = (width / visibleBins) * 0.72;
		const gap = (width / visibleBins) * 0.28;

		const gradient = ctx.createLinearGradient(0, height, 0, height * 0.3);
		gradient.addColorStop(0, 'rgba(235, 30, 60, 0.85)');
		gradient.addColorStop(0.4, 'rgba(255, 95, 31, 0.9)');
		gradient.addColorStop(0.8, 'rgba(255, 204, 0, 0.95)');
		gradient.addColorStop(1, 'rgba(255, 255, 255, 0.95)');

		for (let i = 0; i < visibleBins; i++) {
			let val = freqData[i] * 1.35;
			if (val > 255) val = 255;
			const barHeight = Math.max(4, (val / 255) * (height * 0.45));

			const x = i * (barWidth + gap);
			const y = height - barHeight;

			// Peak caps
			if (barHeight > peakCaps[i]) {
				peakCaps[i] = barHeight;
			} else {
				peakCaps[i] = Math.max(0, peakCaps[i] - 2.2);
			}

			// Bar
			ctx.fillStyle = gradient;
			ctx.beginPath();
			ctx.roundRect(x, y, barWidth, barHeight, [4, 4, 0, 0]);
			ctx.fill();

			// Cap
			const capY = height - peakCaps[i] - 4;
			if (capY >= 0) {
				ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
				ctx.fillRect(x, capY, barWidth, 2.5);
			}
		}
	}

	function renderWave(ctx, width, height, timeData, bufferLength) {
		const centerY = height / 2;
		ctx.lineWidth = 3.5;
		ctx.strokeStyle = 'rgba(255, 95, 31, 0.85)';
		ctx.shadowColor = 'rgba(235, 30, 60, 0.8)';
		ctx.shadowBlur = 18;

		ctx.beginPath();
		const sliceWidth = width / bufferLength;
		let x = 0;

		for (let i = 0; i < bufferLength; i++) {
			const v = (timeData[i] - 128) / 128.0;
			const y = centerY + v * (height * 0.35);

			if (i === 0) {
				ctx.moveTo(x, y);
			} else {
				ctx.lineTo(x, y);
			}
			x += sliceWidth;
		}

		ctx.stroke();
		ctx.shadowBlur = 0;

		// Secondary harmonic wave for depth
		ctx.lineWidth = 2;
		ctx.strokeStyle = 'rgba(255, 204, 0, 0.6)';
		ctx.beginPath();
		x = 0;
		for (let i = 0; i < bufferLength; i++) {
			const v = (timeData[i] - 128) / 128.0;
			const y = centerY - v * (height * 0.22);

			if (i === 0) {
				ctx.moveTo(x, y);
			} else {
				ctx.lineTo(x, y);
			}
			x += sliceWidth;
		}
		ctx.stroke();
	}

	function renderRadar(ctx, width, height, freqData, bufferLength) {
		const centerX = width / 2;
		const centerY = height / 2;
		const baseRadius = Math.min(width, height) * 0.22;
		const visibleBins = Math.floor(bufferLength * 0.68);

		ctx.save();
		ctx.translate(centerX, centerY);

		// Central pulsing core
		ctx.beginPath();
		ctx.arc(0, 0, baseRadius + averageVolume * 35, 0, Math.PI * 2);
		ctx.strokeStyle = `rgba(255, 95, 31, ${0.4 + averageVolume * 0.5})`;
		ctx.lineWidth = 2.5;
		ctx.shadowColor = '#eb1e3c';
		ctx.shadowBlur = 15;
		ctx.stroke();
		ctx.shadowBlur = 0;

		// 360 degree radial audio rays
		for (let i = 0; i < visibleBins; i++) {
			const angle = (i / visibleBins) * Math.PI * 2;
			let val = freqData[i] * 1.3;
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
			ctx.strokeStyle = `hsl(${12 + (i / visibleBins) * 50}, 100%, 60%)`;
			ctx.lineWidth = 2.8;
			ctx.lineCap = 'round';
			ctx.stroke();
		}

		ctx.restore();
	}

	function renderParticles(ctx, width, height, vol) {
		for (let p of particles) {
			p.y += p.speedY * (1 + vol * 2.5);
			p.x += p.speedX;

			if (p.y < 0) {
				p.y = height;
				p.x = Math.random() * width;
			}
			if (p.x < 0) p.x = width;
			if (p.x > width) p.x = 0;

			ctx.fillStyle = `rgba(255, 150, 50, ${p.opacity * (0.4 + vol * 0.6)})`;
			ctx.beginPath();
			ctx.arc(p.x, p.y, p.radius * (1 + vol), 0, Math.PI * 2);
			ctx.fill();
		}
	}

	function resize() {
		if (!canvasEl) return;
		const w = window.innerWidth;
		const h = window.innerHeight;
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		canvasEl.width = w * dpr;
		canvasEl.height = h * dpr;
		const ctx = canvasEl.getContext('2d');
		if (ctx) ctx.scale(dpr, dpr);
		initParticles(w, h);
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
