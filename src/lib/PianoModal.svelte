<script>
	import { iconStyleStore } from './iconStyle.svelte.js';
	import { ICONS } from './icons.js';

	let { isOpen = $bindable(false) } = $props();

	let style = $derived(iconStyleStore.current);

	function getIcon(name) {
		const set = ICONS[style] || ICONS.gothic;
		return set[name] || ICONS.gothic[name];
	}

	// --- CONFIGURATION ---
	const START_NOTE = "A3";
	const END_NOTE = "D5";
	const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
	const WHITE_KEY_CODES = ["KeyA", "KeyS", "KeyD", "KeyF", "KeyG", "KeyH", "KeyJ", "KeyK", "KeyL", "Semicolon", "Quote"];
	const BLACK_KEY_CODES = ["KeyW", "KeyE", "KeyR", "KeyT", "KeyY", "KeyU", "KeyI", "KeyO", "KeyP", "BracketLeft"];
	const HINTS_WHITE = ["A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "'"];
	const HINTS_BLACK = ["W", "E", "R", "T", "Y", "U", "I", "O", "P", "["];

	function getMidi(noteName) {
		const match = noteName.match(/^([A-G]#?)(\d)$/);
		if (!match) return 0;
		const name = match[1];
		const octave = parseInt(match[2], 10);
		return (octave + 1) * 12 + NOTE_NAMES.indexOf(name);
	}

	function midiToFreq(midi) {
		return 440 * Math.pow(2, (midi - 69) / 12);
	}

	function generateKeys() {
		const startMidi = getMidi(START_NOTE);
		const endMidi = getMidi(END_NOTE);
		const keys = [];
		let whiteIdx = 0;

		for (let midi = startMidi; midi <= endMidi; midi++) {
			const noteName = NOTE_NAMES[midi % 12];
			const octave = Math.floor(midi / 12) - 1;
			const isSharp = noteName.includes("#");

			if (!isSharp) {
				keys.push({
					midi,
					note: noteName,
					fullNote: `${noteName}${octave}`,
					code: WHITE_KEY_CODES[whiteIdx] || `White${whiteIdx}`,
					hint: HINTS_WHITE[whiteIdx] || '',
					sharp: false,
					whiteIndex: whiteIdx
				});
				whiteIdx++;
			} else {
				const prevWhiteIdx = whiteIdx - 1;
				keys.push({
					midi,
					note: noteName,
					fullNote: `${noteName}${octave}`,
					code: BLACK_KEY_CODES[prevWhiteIdx] || `Black${prevWhiteIdx}`,
					hint: HINTS_BLACK[prevWhiteIdx] || '',
					sharp: true,
					whiteIndex: prevWhiteIdx
				});
			}
		}
		return keys;
	}

	const keysData = generateKeys();
	const totalWhiteKeys = keysData.filter(k => !k.sharp).length;
	const whiteKeyWidth = 100 / totalWhiteKeys;
	const blackKeyWidth = whiteKeyWidth * 0.62;

	const chordsConfig = [
		{ name: "C",  type: "major", notes: ["C4", "E4", "G4"] },
		{ name: "G",  type: "major", notes: ["B3", "D4", "G4"] },
		{ name: "D",  type: "major", notes: ["D4", "F#4", "A4"] },
		{ name: "A",  type: "major", notes: ["A3", "C#4", "E4"] },
		{ name: "F",  type: "major", notes: ["F4", "A4", "C5"] },
		{ name: "Am", type: "minor", notes: ["A3", "C4", "E4"] },
		{ name: "Em", type: "minor", notes: ["E4", "G4", "B4"] },
		{ name: "Dm", type: "minor", notes: ["D4", "F4", "A4"] },
	];

	const chordsData = chordsConfig.map(chord => ({
		...chord,
		codes: chord.notes.map(note => keysData.find(k => k.fullNote === note)?.code).filter(Boolean)
	}));

	// --- STATE ---
	let nowPlaying = $state("");
	let activeCodes = $state(new Set());
	let activeChord = $state(null);
	let viewMode = $state('keyboard'); // 'keyboard' | 'chords'

	// Web Audio Synthesizer polyphony
	let audioCtx = null;
	const activeVoices = new Map();

	function getAudioContext() {
		if (typeof window === 'undefined') return null;
		if (!audioCtx) {
			const AudioContextClass = window.AudioContext || /** @type {any} */ (window).webkitAudioContext;
			audioCtx = new AudioContextClass();
		}
		if (audioCtx.state === 'suspended') {
			audioCtx.resume().catch(() => {});
		}
		return audioCtx;
	}

	function playVoice(freq) {
		const ctx = getAudioContext();
		if (!ctx) return null;

		const now = ctx.currentTime;

		// Master note gain
		const noteGain = ctx.createGain();
		noteGain.gain.setValueAtTime(0.0001, now);
		noteGain.gain.exponentialRampToValueAtTime(0.35, now + 0.015);
		noteGain.gain.exponentialRampToValueAtTime(0.12, now + 0.4);
		noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);

		// Fundamental oscillator
		const osc1 = ctx.createOscillator();
		osc1.type = 'triangle';
		osc1.frequency.setValueAtTime(freq, now);

		// Second harmonic for acoustic brightness
		const osc2 = ctx.createOscillator();
		osc2.type = 'sine';
		osc2.frequency.setValueAtTime(freq * 2, now);
		const gain2 = ctx.createGain();
		gain2.gain.setValueAtTime(0.25, now);
		osc2.connect(gain2);
		gain2.connect(noteGain);

		// Third harmonic
		const osc3 = ctx.createOscillator();
		osc3.type = 'sine';
		osc3.frequency.setValueAtTime(freq * 3, now);
		const gain3 = ctx.createGain();
		gain3.gain.setValueAtTime(0.08, now);
		osc3.connect(gain3);
		gain3.connect(noteGain);

		osc1.connect(noteGain);
		noteGain.connect(ctx.destination);

		osc1.start(now);
		osc2.start(now);
		osc3.start(now);

		return {
			stop: () => {
				const stopTime = ctx.currentTime;
				try {
					noteGain.gain.cancelScheduledValues(stopTime);
					noteGain.gain.setValueAtTime(noteGain.gain.value, stopTime);
					noteGain.gain.exponentialRampToValueAtTime(0.0001, stopTime + 0.35);
					setTimeout(() => {
						try {
							osc1.stop();
							osc2.stop();
							osc3.stop();
							osc1.disconnect();
							osc2.disconnect();
							osc3.disconnect();
							noteGain.disconnect();
						} catch {}
					}, 400);
				} catch {}
			}
		};
	}

	function startNote(code, isPartOfChord = false) {
		const keyInfo = keysData.find(k => k.code === code);
		if (!keyInfo) return;

		if (!isPartOfChord) {
			nowPlaying = keyInfo.fullNote;
		}

		if (activeVoices.has(code)) {
			const v = activeVoices.get(code);
			v.stop();
			activeVoices.delete(code);
		}

		const freq = midiToFreq(keyInfo.midi);
		const voice = playVoice(freq);
		if (voice) {
			activeVoices.set(code, voice);
		}

		activeCodes = new Set(activeCodes).add(code);
	}

	function stopNote(code) {
		if (activeVoices.has(code)) {
			const voice = activeVoices.get(code);
			voice.stop();
			activeVoices.delete(code);
		}
		const nextSet = new Set(activeCodes);
		nextSet.delete(code);
		activeCodes = nextSet;
	}

	function playChord(chord) {
		activeChord = chord.name;
		nowPlaying = `${chord.name} ${chord.type === 'minor' ? 'min' : 'maj'}`;

		chord.codes.forEach(code => {
			startNote(code, true);
		});

		setTimeout(() => {
			chord.codes.forEach(code => {
				stopNote(code);
			});
			if (activeChord === chord.name) {
				activeChord = null;
			}
		}, 750);
	}

	function handleKeyDown(e) {
		if (!isOpen) return;
		if (e.repeat) return;

		// Escape to close
		if (e.key === 'Escape') {
			close();
			return;
		}

		const keyInfo = keysData.find(k => k.code === e.code);
		if (keyInfo) {
			e.preventDefault();
			startNote(keyInfo.code);
		}
	}

	function handleKeyUp(e) {
		if (!isOpen) return;
		const keyInfo = keysData.find(k => k.code === e.code);
		if (keyInfo) {
			e.preventDefault();
			stopNote(keyInfo.code);
		}
	}

	$effect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden';
			window.addEventListener('keydown', handleKeyDown);
			window.addEventListener('keyup', handleKeyUp);

			return () => {
				window.removeEventListener('keydown', handleKeyDown);
				window.removeEventListener('keyup', handleKeyUp);
				document.body.style.overflow = '';
				activeVoices.forEach(v => v.stop());
				activeVoices.clear();
			};
		}
	});

	function close() {
		isOpen = false;
	}
</script>

{#if isOpen}
	<div
		class="piano-backdrop"
		role="dialog"
		aria-modal="true"
		aria-label="Музичне фортепіано"
	>
		<div class="piano-card">
			<!-- Header -->
			<header class="piano-header">
				<div class="piano-title-box">
					<div class="piano-top-row">
						<span class="piano-badge">Deviant Blaze Studio</span>
						{#if nowPlaying}
							<span class="current-note-pill">♪ {nowPlaying}</span>
						{/if}
					</div>
					<h2 class="piano-title">Акустичне Фортепіано</h2>
				</div>

				<div class="header-right">
					<div class="view-toggles">
						<button
							type="button"
							class="toggle-btn"
							class:active={viewMode === 'keyboard'}
							onclick={() => (viewMode = 'keyboard')}
						>
							Клавіатура
						</button>
						<button
							type="button"
							class="toggle-btn"
							class:active={viewMode === 'chords'}
							onclick={() => (viewMode = 'chords')}
						>
							Акорди
						</button>
					</div>

					<button
						type="button"
						class="piano-close-btn"
						onclick={close}
						aria-label="Закрити фортепіано"
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
				</div>
			</header>

			<!-- Content Area -->
			<div class="piano-stage">
				{#if viewMode === 'keyboard'}
					<div class="keyboard-container">
						<div class="keys-bed">
							{#each keysData as key}
								{#if !key.sharp}
									<!-- White Key -->
									<button
										type="button"
										class="key white-key"
										class:active={activeCodes.has(key.code)}
										style="left: {key.whiteIndex * whiteKeyWidth}%; width: {whiteKeyWidth}%;"
										onmousedown={() => startNote(key.code)}
										onmouseup={() => stopNote(key.code)}
										onmouseleave={() => stopNote(key.code)}
										ontouchstart={(e) => { e.preventDefault(); startNote(key.code); }}
										ontouchend={(e) => { e.preventDefault(); stopNote(key.code); }}
										aria-label="Клавіша {key.fullNote}"
									>
										<span class="key-label">{key.note}</span>
										{#if key.hint}
											<span class="key-hint">{key.hint}</span>
										{/if}
									</button>
								{:else}
									<!-- Black Key (Sharp) -->
									<button
										type="button"
										class="key black-key"
										class:active={activeCodes.has(key.code)}
										style="left: {(key.whiteIndex + 1) * whiteKeyWidth - (blackKeyWidth / 2)}%; width: {blackKeyWidth}%;"
										onmousedown={() => startNote(key.code)}
										onmouseup={() => stopNote(key.code)}
										onmouseleave={() => stopNote(key.code)}
										ontouchstart={(e) => { e.preventDefault(); startNote(key.code); }}
										ontouchend={(e) => { e.preventDefault(); stopNote(key.code); }}
										aria-label="Клавіша {key.fullNote}"
									>
										{#if key.hint}
											<span class="key-hint sharp">{key.hint}</span>
										{/if}
									</button>
								{/if}
							{/each}
						</div>
					</div>
					<div class="instructions-row">
						<span>🎹 Грайте клавішами комп'ютера <strong>A, S, D, F, G, H, J, K, L</strong> та <strong>W, E, R, T, Y, U, I, O, P</strong> або клікайте мишкою / тапайте на екрані</span>
					</div>
				{:else}
					<!-- Chords Grid -->
					<div class="chords-grid">
						{#each chordsData as chord}
							<button
								type="button"
								class="chord-card"
								class:minor={chord.type === 'minor'}
								class:playing={activeChord === chord.name}
								onclick={() => playChord(chord)}
							>
								<span class="chord-title">{chord.name}</span>
								<span class="chord-type">{chord.type === 'minor' ? 'мінор' : 'мажор'}</span>
								<span class="chord-notes">{chord.notes.join(' • ')}</span>
							</button>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.piano-backdrop {
		position: fixed;
		inset: 0;
		z-index: 1000;
		background: rgba(4, 4, 6, 0.85);
		backdrop-filter: blur(28px) saturate(180%);
		-webkit-backdrop-filter: blur(28px) saturate(180%);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1.5rem;
		animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	.piano-card {
		position: relative;
		width: 100%;
		max-width: 940px;
		background: rgba(18, 18, 22, 0.94);
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

	:global([data-theme="light"]) .piano-card {
		background: rgba(255, 255, 255, 0.95);
		border-color: rgba(0, 0, 0, 0.1);
		box-shadow: 0 30px 80px -20px rgba(0, 0, 0, 0.18),
		            0 0 40px rgba(255, 95, 31, 0.05);
	}

	.piano-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1.4rem 2rem 1.1rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);
		gap: 1rem;
		flex-wrap: wrap;
	}

	:global([data-theme="light"]) .piano-header {
		border-bottom-color: rgba(0, 0, 0, 0.06);
	}

	.piano-top-row {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		margin-bottom: 0.25rem;
	}

	.piano-badge {
		font-size: 0.72rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: #9da3af;
	}

	.current-note-pill {
		font-size: 0.75rem;
		font-weight: 700;
		padding: 0.15rem 0.6rem;
		border-radius: 9999px;
		background: rgba(235, 30, 60, 0.2);
		color: #ff5f1f;
		border: 1px solid rgba(235, 30, 60, 0.4);
	}

	.piano-title {
		font-size: 1.35rem;
		font-weight: 700;
		color: var(--text-primary, #ffffff);
		margin: 0;
	}

	.header-right {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.view-toggles {
		display: flex;
		gap: 0.35rem;
		background: rgba(255, 255, 255, 0.05);
		padding: 0.25rem;
		border-radius: 12px;
		border: 1px solid rgba(255, 255, 255, 0.08);
	}

	:global([data-theme="light"]) .view-toggles {
		background: rgba(0, 0, 0, 0.04);
		border-color: rgba(0, 0, 0, 0.06);
	}

	.toggle-btn {
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

	.toggle-btn:hover {
		color: #ffffff;
	}

	:global([data-theme="light"]) .toggle-btn:hover {
		color: #111827;
	}

	.toggle-btn.active {
		background: rgba(255, 255, 255, 0.15);
		color: #ffffff;
		font-weight: 600;
	}

	:global([data-theme="light"]) .toggle-btn.active {
		background: #ffffff;
		color: #111827;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
	}

	.piano-close-btn {
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

	.piano-close-btn:hover {
		color: #ffffff;
		background: rgba(255, 255, 255, 0.14);
		transform: scale(1.08);
	}

	:global([data-theme="light"]) .piano-close-btn {
		background: rgba(0, 0, 0, 0.04);
		border-color: rgba(0, 0, 0, 0.08);
		color: #4b5563;
	}

	:global([data-theme="light"]) .piano-close-btn:hover {
		color: #111827;
		background: rgba(0, 0, 0, 0.08);
	}

	.close-icon {
		width: 20px;
		height: 20px;
	}

	.piano-stage {
		padding: 2rem;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.keyboard-container {
		position: relative;
		width: 100%;
		max-width: 860px;
		height: 260px;
		background: #0a0a0d;
		border-radius: 16px;
		padding: 10px 10px 0;
		box-shadow: inset 0 8px 24px rgba(0, 0, 0, 0.8),
		            0 12px 30px rgba(0, 0, 0, 0.4);
		border: 2px solid #22222a;
	}

	.keys-bed {
		position: relative;
		width: 100%;
		height: 100%;
		user-select: none;
		-webkit-user-select: none;
	}

	.key {
		position: absolute;
		top: 0;
		border: none;
		cursor: pointer;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		align-items: center;
		padding-bottom: 12px;
		border-radius: 0 0 6px 6px;
		box-sizing: border-box;
		transition: background-color 0.1s, transform 0.08s, box-shadow 0.1s;
		user-select: none;
		-webkit-user-select: none;
	}

	.white-key {
		height: 100%;
		background: linear-gradient(to bottom, #f3f3f5 0%, #e2e2e6 90%, #ffffff 100%);
		border: 1px solid #b5b5bc;
		border-top: none;
		z-index: 1;
		box-shadow: inset 0 -4px 6px rgba(0, 0, 0, 0.15),
		            0 4px 6px rgba(0, 0, 0, 0.25);
		color: #2b2b36;
	}

	.white-key.active {
		background: linear-gradient(to bottom, #ff9955 0%, #ff5f1f 100%);
		color: #ffffff;
		transform: translateY(3px);
		box-shadow: 0 0 15px rgba(255, 95, 31, 0.6);
	}

	.black-key {
		height: 60%;
		background: linear-gradient(to bottom, #111116 0%, #202028 85%, #050508 100%);
		border: 1px solid #000000;
		border-top: none;
		z-index: 2;
		box-shadow: inset 0 -3px 4px rgba(255, 255, 255, 0.15),
		            0 6px 12px rgba(0, 0, 0, 0.6);
		color: #ffffff;
		padding-bottom: 8px;
	}

	.black-key.active {
		background: linear-gradient(to bottom, #eb1e3c 0%, #8e0018 100%);
		box-shadow: 0 0 16px rgba(235, 30, 60, 0.8);
		transform: translateY(3px);
	}

	.key-label {
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: -0.02em;
	}

	.key-hint {
		font-size: 0.65rem;
		font-weight: 600;
		opacity: 0.5;
		margin-top: 2px;
	}

	.key-hint.sharp {
		opacity: 0.75;
		color: #ff9955;
	}

	.instructions-row {
		margin-top: 1.2rem;
		font-size: 0.82rem;
		color: var(--text-secondary, #9da3af);
		text-align: center;
		max-width: 650px;
	}

	.instructions-row strong {
		color: var(--text-primary, #ffffff);
	}

	/* Chords Grid */
	.chords-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 1rem;
		width: 100%;
		max-width: 860px;
	}

	.chord-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 1.5rem 1rem;
		background: rgba(255, 255, 255, 0.04);
		border: 2px solid rgba(255, 255, 255, 0.12);
		border-radius: 18px;
		cursor: pointer;
		transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.chord-card:hover {
		background: rgba(255, 255, 255, 0.08);
		border-color: rgba(255, 95, 31, 0.5);
		transform: translateY(-3px);
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
	}

	.chord-card.minor {
		border-style: dashed;
	}

	.chord-card.playing {
		background: linear-gradient(135deg, #eb1e3c 0%, #ff5f1f 100%);
		border-color: #ffffff;
		transform: scale(0.96);
		box-shadow: 0 0 25px rgba(255, 95, 31, 0.6);
	}

	.chord-card.playing .chord-title,
	.chord-card.playing .chord-type,
	.chord-card.playing .chord-notes {
		color: #ffffff !important;
	}

	.chord-title {
		font-size: 2rem;
		font-weight: 800;
		color: var(--text-primary, #ffffff);
		line-height: 1;
	}

	.chord-type {
		font-size: 0.72rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--text-secondary, #9da3af);
		margin-top: 0.3rem;
	}

	.chord-notes {
		font-size: 0.75rem;
		color: #ff9955;
		margin-top: 0.5rem;
		font-weight: 500;
	}

	@media (max-width: 768px) {
		.piano-card {
			max-height: 95vh;
			overflow-y: auto;
		}
		.piano-header {
			padding: 1.1rem 1.4rem;
		}
		.piano-stage {
			padding: 1.2rem;
		}
		.keyboard-container {
			height: 190px;
		}
		.chords-grid {
			grid-template-columns: repeat(2, 1fr);
		}
		.key-hint {
			display: none;
		}
	}
</style>
