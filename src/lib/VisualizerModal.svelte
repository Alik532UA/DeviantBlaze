<script>
	import { iconStyleStore } from './iconStyle.svelte.js';
	import { ICONS } from './icons.js';

	let { isOpen = $bindable(false) } = $props();

	let style = $derived(iconStyleStore.current);

	function getIcon(name) {
		const set = ICONS[style] || ICONS.gothic;
		return set[name] || ICONS.gothic[name];
	}

	let canvasEl = $state(null);
	let audioCtx = null;
	let analyser = null;
	let micStream = null;
	let animId = null;
	let testOsc = null;

	let micStatus = $state('idle'); // 'idle' | 'listening' | 'denied' | 'test'
	let micError = $state('');
	let visualizerMode = $state('bars'); // 'bars' | 'wave' | 'circle'
	let sensitivity = $state(1.4);
	let averageVolume = $state(0);

	// Max peaks tracker for classic falling peak caps
	let peakCaps = [];

	async function startMicrophone() {
		stopAudio();
		micError = '';
		try {
			if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
				throw new Error('Ваш браузер не підтримує аудіо-вхід.');
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
			analyser.fftSize = 1024;
			analyser.smoothingTimeConstant = 0.82;

			const source = audioCtx.createMediaStreamSource(stream);
			source.connect(analyser);

			micStatus = 'listening';
			startRenderLoop();
		} catch (err) {
			console.warn('Microphone error:', err);
			micStatus = 'denied';
			micError = err.name === 'NotAllowedError'
				? 'Доступ до мікрофону було заблоковано.'
				: (err.message || 'Помилка захоплення звуку.');
			// Fallback to test mode so visualizer is still visually engaging
			startTestMode();
		}
	}

	function startTestMode() {
		stopAudio();
		micStatus = 'test';
		micError = '';

		const AudioContextClass = window.AudioContext || /** @type {any} */ (window).webkitAudioContext;
		audioCtx = new AudioContextClass();
		analyser = audioCtx.createAnalyser();
		analyser.fftSize = 1024;
		analyser.smoothingTimeConstant = 0.85;

		// Create rhythmically pulsating test oscillators
		const osc = audioCtx.createOscillator();
		const osc2 = audioCtx.createOscillator();
		const gain = audioCtx.createGain();

		osc.type = 'sawtooth';
		osc.frequency.setValueAtTime(110, audioCtx.currentTime); // A2

		osc2.type = 'sine';
		osc2.frequency.setValueAtTime(220, audioCtx.currentTime);

		gain.gain.setValueAtTime(0.001, audioCtx.currentTime); // keep mute to master

		osc.connect(gain);
		osc2.connect(gain);
		gain.connect(analyser);
		// do not connect gain to audioCtx.destination so it stays silent to user's ears

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

			// If test mode, animate frequencies artificially
			if (micStatus === 'test' && testOsc) {
				const now = audioCtx ? audioCtx.currentTime : frame * 0.016;
				testOsc.osc.frequency.setValueAtTime(
					80 + Math.sin(now * 3) * 40 + Math.cos(now * 7) * 30,
					now
				);
				testOsc.osc2.frequency.setValueAtTime(
					180 + Math.sin(now * 2) * 80 + Math.sin(now * 5) * 50,
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

			// Calculate average volume from active spectrum bins
			let sum = 0;
			const activeBinsCount = Math.floor(bufferLength * 0.82);
			for (let i = 0; i < activeBinsCount; i++) {
				sum += freqData[i];
			}
			const avg = sum / activeBinsCount;
			averageVolume = avg / 255;

			if (visualizerMode === 'bars') {
				renderBars(ctx, width, height, freqData, bufferLength);
			} else if (visualizerMode === 'wave') {
				renderWave(ctx, width, height, timeData, bufferLength, freqData);
			} else {
				renderCircle(ctx, width, height, freqData, bufferLength);
			}
		}

		render();
	}

	function getSampledFreq(t, freqData, bufferLength, sens = 1.0) {
		const clampedT = Math.max(0, Math.min(1, t));
		const maxBin = Math.floor(bufferLength * 0.82);
		const minBin = 0;
		const p = Math.pow(clampedT, 2.35);
		const binFloat = minBin + p * (maxBin - minBin);

		const i0 = Math.floor(binFloat);
		const i1 = Math.min(maxBin, i0 + 1);
		const frac = binFloat - i0;

		const val0 = (i0 === 0) ? Math.min(freqData[0], freqData[1] * 1.1) : freqData[i0];
		const val1 = freqData[i1];
		const rawVal = val0 * (1 - frac) + val1 * frac;
		const trebleTilt = 1.0 + clampedT * 0.45;

		const bassEdgeRollOff = Math.min(1.0, Math.pow(clampedT / 0.07, 1.25));
		const trebleEdgeRollOff = Math.min(1.0, Math.pow((1.0 - clampedT) / 0.07, 1.25));
		const edgeEnvelope = bassEdgeRollOff * trebleEdgeRollOff;

		let val = rawVal * sens * trebleTilt * edgeEnvelope;

		return Math.min(255, val);
	}

	function renderBars(ctx, width, height, freqData, bufferLength) {
		const numBars = 76;
		const barWidth = (width / numBars) * 0.76;
		const gap = (width / numBars) * 0.24;

		const gradient = ctx.createLinearGradient(0, height, 0, 0);
		gradient.addColorStop(0, 'rgba(235, 30, 60, 0.95)');
		gradient.addColorStop(0.4, 'rgba(255, 95, 31, 0.95)');
		gradient.addColorStop(0.75, 'rgba(255, 204, 0, 0.95)');
		gradient.addColorStop(1, 'rgba(255, 255, 255, 0.95)');

		if (peakCaps.length !== numBars) {
			peakCaps = new Array(numBars).fill(0);
		}

		for (let i = 0; i < numBars; i++) {
			const t = i / (numBars - 1);
			const val = getSampledFreq(t, freqData, bufferLength, sensitivity);
			const barHeight = Math.max(3, (val / 255) * (height * 0.88));

			const x = i * (barWidth + gap);
			const y = height - barHeight;

			// Peak cap logic
			if (barHeight > peakCaps[i]) {
				peakCaps[i] = barHeight;
			} else {
				peakCaps[i] = Math.max(0, peakCaps[i] - 1.8);
			}

			// Main bar with rounded top
			ctx.fillStyle = gradient;
			ctx.beginPath();
			ctx.roundRect(x, y, barWidth, barHeight, [3, 3, 0, 0]);
			ctx.fill();

			// Peak cap line
			const capY = height - peakCaps[i] - 3;
			if (capY >= 0) {
				ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
				ctx.fillRect(x, capY, barWidth, 2);
			}
		}
	}

	function renderWave(ctx, width, height, timeData, bufferLength, freqData) {
		ctx.lineWidth = 3;
		ctx.strokeStyle = 'rgba(255, 95, 31, 0.9)';
		ctx.shadowColor = 'rgba(235, 30, 60, 0.7)';
		ctx.shadowBlur = 12;

		const pointsCount = 80;
		const sliceWidth = width / (pointsCount - 1);

		ctx.beginPath();
		let prevX = 0;
		const firstFreq = freqData ? getSampledFreq(0, freqData, bufferLength, 1.0) / 255 : 0.5;
		let prevY = (height / 2) + ((timeData[0] - 128) / 128.0) * (height * 0.35 * (0.4 + 0.8 * firstFreq));
		ctx.moveTo(prevX, prevY);

		for (let i = 1; i < pointsCount; i++) {
			const t = i / (pointsCount - 1);
			const freqVal = freqData ? getSampledFreq(t, freqData, bufferLength, 1.0) / 255 : 0.5;
			const timeIdx = Math.min(bufferLength - 1, Math.floor(t * (bufferLength - 1)));
			const v = (timeData[timeIdx] - 128) / 128.0;
			const localAmp = height * 0.35 * (0.4 + 0.8 * freqVal) * sensitivity;

			const curX = i * sliceWidth;
			const curY = (height / 2) + v * localAmp;
			const midX = (prevX + curX) / 2;
			const midY = (prevY + curY) / 2;

			ctx.quadraticCurveTo(prevX, prevY, midX, midY);
			prevX = curX;
			prevY = curY;
		}

		ctx.lineTo(width, prevY);
		ctx.stroke();
		ctx.shadowBlur = 0;
	}

	function renderCircle(ctx, width, height, freqData, bufferLength) {
		const centerX = width / 2;
		const centerY = height / 2;
		const baseRadius = Math.min(width, height) * 0.22;
		const totalRays = 96;

		ctx.save();
		ctx.translate(centerX, centerY);

		// Core pulsing ring
		ctx.beginPath();
		ctx.arc(0, 0, baseRadius + averageVolume * 25, 0, Math.PI * 2);
		ctx.strokeStyle = 'rgba(255, 95, 31, 0.6)';
		ctx.lineWidth = 2;
		ctx.stroke();

		// Radiating spike bars with expanded bass & active treble
		for (let i = 0; i < totalRays; i++) {
			const angle = (i / totalRays) * Math.PI * 2;
			const t = i < totalRays / 2 ? (i / (totalRays / 2)) : (1 - (i - totalRays / 2) / (totalRays / 2));
			const val = getSampledFreq(t, freqData, bufferLength, sensitivity);
			const barLength = (val / 255) * (Math.min(width, height) * 0.28);

			const cos = Math.cos(angle);
			const sin = Math.sin(angle);

			const x1 = cos * baseRadius;
			const y1 = sin * baseRadius;
			const x2 = cos * (baseRadius + barLength);
			const y2 = sin * (baseRadius + barLength);

			ctx.beginPath();
			ctx.moveTo(x1, y1);
			ctx.lineTo(x2, y2);
			ctx.strokeStyle = `hsl(${10 + t * 55}, 100%, 60%)`;
			ctx.lineWidth = 2.5;
			ctx.lineCap = 'round';
			ctx.stroke();
		}

		ctx.restore();
	}

	function resizeCanvas() {
		if (!canvasEl) return;
		const rect = canvasEl.getBoundingClientRect();
		const dpr = window.devicePixelRatio || 1;
		canvasEl.width = rect.width * dpr;
		canvasEl.height = rect.height * dpr;
		const ctx = canvasEl.getContext('2d');
		if (ctx) ctx.scale(dpr, dpr);
	}

	$effect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden';
			setTimeout(() => {
				resizeCanvas();
				startMicrophone();
			}, 60);

			function onResize() {
				resizeCanvas();
			}
			window.addEventListener('resize', onResize);

			return () => {
				window.removeEventListener('resize', onResize);
				stopAudio();
				document.body.style.overflow = '';
			};
		} else {
			stopAudio();
		}
	});

	function close() {
		isOpen = false;
	}
</script>

{#if isOpen}
	<div
		class="visualizer-backdrop"
		role="dialog"
		aria-modal="true"
		aria-label="Аудіовізуалізатор частот"
	>
		<div class="visualizer-card">
			<!-- Modal Header -->
			<header class="vis-header">
				<div class="vis-title-box">
					<span class="vis-badge">
						{#if micStatus === 'listening'}
							<span class="live-dot pulse"></span> Мікрофон онлайн
						{:else if micStatus === 'test'}
							<span class="live-dot test"></span> Тестовий сигнал
						{:else}
							<span class="live-dot"></span> Очікування
						{/if}
					</span>
					<h2 class="vis-title">Аудіовізуалізатор</h2>
					<p class="vis-desc">
						Аналіз спектру частот звуку в реальному часі
					</p>
				</div>

				<button
					type="button"
					class="vis-close-btn"
					onclick={close}
					aria-label="Закрити візуалізатор"
				>
					<svg
						class="close-icon"
						viewBox={getIcon('gallery_close').viewBox}
						fill="currentColor"
						aria-hidden="true"
					>
						{@html getIcon('gallery_close').svg}
					</svg>
				</button>
			</header>

			<!-- Canvas display -->
			<div class="canvas-wrapper">
				<canvas bind:this={canvasEl} class="vis-canvas"></canvas>

				{#if micError}
					<div class="error-pill">
						<span>{micError} (увімкнено симуляцію спектру)</span>
					</div>
				{/if}
			</div>

			<!-- Control bar -->
			<footer class="vis-controls">
				<div class="mode-toggles">
					<button
						type="button"
						class="mode-btn"
						class:active={visualizerMode === 'bars'}
						onclick={() => (visualizerMode = 'bars')}
					>
						Спектр
					</button>
					<button
						type="button"
						class="mode-btn"
						class:active={visualizerMode === 'wave'}
						onclick={() => (visualizerMode = 'wave')}
					>
						Хвиля
					</button>
					<button
						type="button"
						class="mode-btn"
						class:active={visualizerMode === 'circle'}
						onclick={() => (visualizerMode = 'circle')}
					>
						Радар
					</button>
				</div>

				<div class="vis-actions">
					{#if micStatus !== 'listening'}
						<button
							type="button"
							class="action-btn mic-btn"
							onclick={startMicrophone}
						>
							{#if getIcon('mic')}
								{@const icon = getIcon('mic')}
								<svg viewBox={icon.viewBox} class="inline-icon" aria-hidden="true">
									{@html icon.svg}
								</svg>
							{/if}
							<span>Увімкнути мікрофон</span>
						</button>
					{:else}
						<button
							type="button"
							class="action-btn test-btn"
							onclick={startTestMode}
						>
							<span>Тестовий звук</span>
						</button>
					{/if}
				</div>
			</footer>
		</div>
	</div>
{/if}

<style>
	.visualizer-backdrop {
		position: fixed;
		inset: 0;
		z-index: 1000;
		background: rgba(4, 4, 6, 0.82);
		backdrop-filter: blur(28px) saturate(180%);
		-webkit-backdrop-filter: blur(28px) saturate(180%);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1.5rem;
		animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.visualizer-card {
		position: relative;
		width: 100%;
		max-width: 860px;
		max-height: 90vh;
		background: rgba(18, 18, 22, 0.92);
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 28px;
		display: flex;
		flex-direction: column;
		box-shadow: 0 30px 80px -20px rgba(0, 0, 0, 0.8),
		            0 0 50px rgba(255, 95, 31, 0.08);
		overflow: hidden;
		animation: scaleIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
	}

	@keyframes scaleIn {
		from {
			transform: scale(0.94) translateY(12px);
			opacity: 0;
		}
		to {
			transform: scale(1) translateY(0);
			opacity: 1;
		}
	}

	:global([data-theme="light"]) .visualizer-card {
		background: rgba(255, 255, 255, 0.94);
		border-color: rgba(0, 0, 0, 0.1);
		box-shadow: 0 30px 80px -20px rgba(0, 0, 0, 0.18),
		            0 0 40px rgba(255, 95, 31, 0.05);
	}

	.vis-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		padding: 1.5rem 2rem 1rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);
	}

	:global([data-theme="light"]) .vis-header {
		border-bottom-color: rgba(0, 0, 0, 0.06);
	}

	.vis-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		font-size: 0.72rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: #9da3af;
		margin-bottom: 0.35rem;
	}

	.live-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: #6b7280;
	}

	.live-dot.pulse {
		background: #10b981;
		box-shadow: 0 0 10px #10b981;
		animation: livePulse 1.6s infinite;
	}

	.live-dot.test {
		background: #f59e0b;
		box-shadow: 0 0 10px #f59e0b;
	}

	@keyframes livePulse {
		0%, 100% {
			opacity: 1;
			transform: scale(1);
		}
		50% {
			opacity: 0.4;
			transform: scale(0.85);
		}
	}

	.vis-title {
		font-size: 1.4rem;
		font-weight: 700;
		color: var(--text-primary, #ffffff);
		margin: 0;
		letter-spacing: -0.01em;
	}

	.vis-desc {
		font-size: 0.85rem;
		color: var(--text-secondary, #9da3af);
		margin: 0.25rem 0 0;
	}

	.vis-close-btn {
		width: 42px;
		height: 42px;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.06);
		border: 1px solid rgba(255, 255, 255, 0.12);
		color: var(--text-secondary, #9da3af);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.vis-close-btn:hover {
		color: #ffffff;
		background: rgba(255, 255, 255, 0.14);
		transform: scale(1.08);
	}

	:global([data-theme="light"]) .vis-close-btn {
		background: rgba(0, 0, 0, 0.04);
		border-color: rgba(0, 0, 0, 0.08);
		color: #4b5563;
	}

	:global([data-theme="light"]) .vis-close-btn:hover {
		color: #111827;
		background: rgba(0, 0, 0, 0.08);
	}

	.close-icon {
		width: 20px;
		height: 20px;
	}

	.canvas-wrapper {
		position: relative;
		width: 100%;
		height: 380px;
		background: radial-gradient(circle at center, rgba(30, 20, 28, 0.4) 0%, rgba(10, 10, 14, 0.9) 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}

	:global([data-theme="light"]) .canvas-wrapper {
		background: radial-gradient(circle at center, rgba(245, 240, 235, 0.6) 0%, rgba(230, 230, 235, 0.95) 100%);
	}

	.vis-canvas {
		width: 100%;
		height: 100%;
		display: block;
	}

	.error-pill {
		position: absolute;
		bottom: 1rem;
		left: 50%;
		transform: translateX(-50%);
		background: rgba(239, 68, 68, 0.2);
		border: 1px solid rgba(239, 68, 68, 0.4);
		color: #fca5a5;
		padding: 0.35rem 0.9rem;
		border-radius: 9999px;
		font-size: 0.78rem;
		backdrop-filter: blur(10px);
	}

	.vis-controls {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1.1rem 2rem;
		background: rgba(14, 14, 18, 0.7);
		border-top: 1px solid rgba(255, 255, 255, 0.08);
		gap: 1rem;
		flex-wrap: wrap;
	}

	:global([data-theme="light"]) .vis-controls {
		background: rgba(245, 245, 248, 0.8);
		border-top-color: rgba(0, 0, 0, 0.06);
	}

	.mode-toggles {
		display: flex;
		gap: 0.4rem;
		background: rgba(255, 255, 255, 0.05);
		padding: 0.25rem;
		border-radius: 12px;
		border: 1px solid rgba(255, 255, 255, 0.08);
	}

	:global([data-theme="light"]) .mode-toggles {
		background: rgba(0, 0, 0, 0.04);
		border-color: rgba(0, 0, 0, 0.06);
	}

	.mode-btn {
		background: transparent;
		border: none;
		color: var(--text-secondary, #9da3af);
		padding: 0.45rem 1rem;
		border-radius: 8px;
		font-size: 0.82rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.mode-btn:hover {
		color: #ffffff;
	}

	:global([data-theme="light"]) .mode-btn:hover {
		color: #111827;
	}

	.mode-btn.active {
		background: rgba(255, 255, 255, 0.15);
		color: #ffffff;
		font-weight: 600;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
	}

	:global([data-theme="light"]) .mode-btn.active {
		background: #ffffff;
		color: #111827;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
	}

	.vis-actions {
		display: flex;
		gap: 0.75rem;
	}

	.action-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.55rem 1.2rem;
		border-radius: 9999px;
		font-size: 0.82rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		border: 1px solid transparent;
	}

	.inline-icon {
		width: 14px;
		height: 14px;
		display: inline-block;
		flex-shrink: 0;
	}

	.mic-btn {
		background: linear-gradient(135deg, #eb1e3c 0%, #ff5f1f 100%);
		color: #ffffff;
		box-shadow: 0 4px 14px rgba(235, 30, 60, 0.35);
	}

	.mic-btn:hover {
		transform: translateY(-1px);
		box-shadow: 0 6px 18px rgba(235, 30, 60, 0.5);
	}

	.test-btn {
		background: rgba(255, 255, 255, 0.08);
		border-color: rgba(255, 255, 255, 0.15);
		color: #ffffff;
	}

	:global([data-theme="light"]) .test-btn {
		background: rgba(0, 0, 0, 0.05);
		border-color: rgba(0, 0, 0, 0.1);
		color: #111827;
	}

	@media (max-width: 640px) {
		.vis-header {
			padding: 1.2rem 1.4rem 0.8rem;
		}
		.canvas-wrapper {
			height: 260px;
		}
		.vis-controls {
			padding: 0.9rem 1.2rem;
			justify-content: center;
		}
		.vis-title {
			font-size: 1.2rem;
		}
	}
</style>
