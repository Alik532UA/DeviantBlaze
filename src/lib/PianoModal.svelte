<script>
	import { iconStyleStore } from './iconStyle.svelte.js';
	import { langStore } from './lang.svelte.js';
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

		const noteGain = ctx.createGain();
		noteGain.gain.setValueAtTime(0.0001, now);
		noteGain.gain.exponentialRampToValueAtTime(0.38, now + 0.012);
		noteGain.gain.exponentialRampToValueAtTime(0.14, now + 0.45);
		noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);

		const osc1 = ctx.createOscillator();
		osc1.type = 'triangle';
		osc1.frequency.setValueAtTime(freq, now);

		const osc2 = ctx.createOscillator();
		osc2.type = 'sine';
		osc2.frequency.setValueAtTime(freq * 2, now);
		const gain2 = ctx.createGain();
		gain2.gain.setValueAtTime(0.28, now);
		osc2.connect(gain2);
		gain2.connect(noteGain);

		const osc3 = ctx.createOscillator();
		osc3.type = 'sine';
		osc3.frequency.setValueAtTime(freq * 3, now);
		const gain3 = ctx.createGain();
		gain3.gain.setValueAtTime(0.1, now);
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
		class="piano-fullscreen-modal"
		role="dialog"
		aria-modal="true"
		aria-label="Музичне фортепіано"
	>
		<!-- Close Button Top-Right (teatralo4ka style) -->
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

		<!-- Main Stage Container (no boxed card window, full stage span) -->
		<section id="wrap">
			<!-- Controls Header -->
			<header class="piano-header">
				<div class="controls-wrapper">
					<div class="view-toggle">
						<button
							type="button"
							class="toggle-btn"
							class:active={viewMode === 'keyboard'}
							onclick={() => (viewMode = 'keyboard')}
						>
							{langStore.t('piano_keyboard')}
						</button>
						<button
							type="button"
							class="toggle-btn"
							class:active={viewMode === 'chords'}
							onclick={() => (viewMode = 'chords')}
						>
							{langStore.t('piano_chords')}
						</button>
					</div>

					<div class="nowplaying-display" aria-live="polite">
						{#if nowPlaying}
							<span class="note-pill">♪ {nowPlaying}</span>
						{:else}
							<span class="note-hint">{langStore.t('piano_hint')}</span>
						{/if}
					</div>
				</div>
			</header>

			<!-- Main Instrument Section -->
			<section id="main">
				{#if viewMode === 'keyboard'}
					<div class="keys-wrapper">
						<div class="keys">
							{#each keysData as key}
								{#if !key.sharp}
									<!-- White Key -->
									<button
										type="button"
										class="key white"
										class:active={activeCodes.has(key.code)}
										style="left: {key.whiteIndex * whiteKeyWidth}%; width: {whiteKeyWidth}%;"
										onmousedown={() => startNote(key.code)}
										onmouseup={() => stopNote(key.code)}
										onmouseleave={() => stopNote(key.code)}
										ontouchstart={(e) => { e.preventDefault(); startNote(key.code); }}
										ontouchend={(e) => { e.preventDefault(); stopNote(key.code); }}
										aria-label="Клавіша {key.fullNote}"
									>
										<span class="hints">{key.hint}</span>
										<span class="note-title">{key.note}</span>
									</button>
								{:else}
									<!-- Black Key (Sharp) -->
									<button
										type="button"
										class="key sharp"
										class:active={activeCodes.has(key.code)}
										style="left: {(key.whiteIndex + 1) * whiteKeyWidth - (blackKeyWidth / 2)}%; width: {blackKeyWidth}%;"
										onmousedown={() => startNote(key.code)}
										onmouseup={() => stopNote(key.code)}
										onmouseleave={() => stopNote(key.code)}
										ontouchstart={(e) => { e.preventDefault(); startNote(key.code); }}
										ontouchend={(e) => { e.preventDefault(); stopNote(key.code); }}
										aria-label="Клавіша {key.fullNote}"
									>
										<span class="hints">{key.hint}</span>
									</button>
								{/if}
							{/each}
						</div>
					</div>

					<footer class="piano-footer">
						<span>{langStore.t('piano_keys_hint')}</span>
					</footer>
				{:else}
					<!-- Chords Grid -->
					<div class="chords-grid">
						{#each chordsData as chord}
							<button
								type="button"
								class="chord-btn"
								class:minor={chord.type === 'minor'}
								class:playing={activeChord === chord.name}
								onclick={() => playChord(chord)}
							>
								<span class="chord-name">{chord.name}</span>
								<span class="chord-sub">{chord.type === 'minor' ? langStore.t('chord_minor') : langStore.t('chord_major')}</span>
								<span class="chord-notes">{chord.notes.join(' • ')}</span>
							</button>
						{/each}
					</div>
				{/if}
			</section>
		</section>
	</div>
{/if}

<style>
	.piano-fullscreen-modal {
		position: fixed;
		inset: 0;
		z-index: 9999;
		background: rgba(0, 0, 0, 0.82);
		backdrop-filter: blur(28px) saturate(180%);
		-webkit-backdrop-filter: blur(28px) saturate(180%);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		text-align: center;
		animation: modalFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
	}

	:global([data-theme="light"]) .piano-fullscreen-modal {
		background: rgba(240, 240, 245, 0.88);
	}

	@keyframes modalFadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	.piano-close-btn {
		position: absolute;
		top: 24px;
		right: 32px;
		width: 48px;
		height: 48px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(255, 255, 255, 0.08);
		border: 1px solid rgba(255, 255, 255, 0.15);
		border-radius: 50%;
		color: #ffffff;
		cursor: pointer;
		z-index: 10001;
		transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.piano-close-btn:hover {
		background: rgba(255, 255, 255, 0.2);
		transform: scale(1.1);
	}

	:global([data-theme="light"]) .piano-close-btn {
		background: rgba(0, 0, 0, 0.06);
		border-color: rgba(0, 0, 0, 0.12);
		color: #111827;
	}

	:global([data-theme="light"]) .piano-close-btn:hover {
		background: rgba(0, 0, 0, 0.12);
	}

	.close-icon {
		width: 24px;
		height: 24px;
	}

	#wrap {
		position: relative;
		z-index: 1;
		width: 100%;
		max-width: 1240px;
		padding: 24px 32px;
		display: flex;
		flex-direction: column;
		animation: modalSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
	}

	@keyframes modalSlideIn {
		from {
			transform: scale(0.96) translateY(-16px);
			opacity: 0;
		}
		to {
			transform: scale(1) translateY(0);
			opacity: 1;
		}
	}

	.piano-header {
		margin-bottom: 28px;
	}

	.controls-wrapper {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 20px;
		flex-wrap: wrap;
	}

	.view-toggle {
		display: flex;
		background: rgba(255, 255, 255, 0.08);
		padding: 4px;
		border-radius: 9999px;
		border: 1px solid rgba(255, 255, 255, 0.12);
		gap: 4px;
	}

	:global([data-theme="light"]) .view-toggle {
		background: rgba(0, 0, 0, 0.05);
		border-color: rgba(0, 0, 0, 0.1);
	}

	.toggle-btn {
		padding: 8px 24px;
		border: none;
		border-radius: 9999px;
		background: transparent;
		color: rgba(255, 255, 255, 0.7);
		font-weight: 600;
		font-size: 0.9rem;
		cursor: pointer;
		transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.toggle-btn:hover {
		color: #ffffff;
	}

	:global([data-theme="light"]) .toggle-btn {
		color: #4b5563;
	}

	:global([data-theme="light"]) .toggle-btn:hover {
		color: #111827;
	}

	.toggle-btn.active {
		background: linear-gradient(135deg, #eb1e3c 0%, #ff5f1f 100%);
		color: #ffffff;
		box-shadow: 0 4px 14px rgba(235, 30, 60, 0.4);
	}

	.nowplaying-display {
		min-height: 40px;
		display: flex;
		align-items: center;
	}

	.note-pill {
		font-size: 1.4rem;
		font-weight: 800;
		color: #ff5f1f;
		background: rgba(235, 30, 60, 0.15);
		border: 1px solid rgba(255, 95, 31, 0.4);
		padding: 4px 20px;
		border-radius: 9999px;
		box-shadow: 0 0 20px rgba(255, 95, 31, 0.3);
		animation: pillPulse 0.4s ease-out;
	}

	@keyframes pillPulse {
		from { transform: scale(0.92); opacity: 0.8; }
		to { transform: scale(1); opacity: 1; }
	}

	.note-hint {
		font-size: 0.9rem;
		color: rgba(255, 255, 255, 0.45);
	}

	:global([data-theme="light"]) .note-hint {
		color: rgba(0, 0, 0, 0.45);
	}

	#main {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	/* Keys Bed */
	.keys-wrapper {
		width: 100%;
		padding: 12px;
		background: #08080a;
		border-radius: 20px;
		border: 3px solid #1f1f26;
		box-shadow: 0 24px 60px rgba(0, 0, 0, 0.8),
		            inset 0 6px 20px rgba(0, 0, 0, 0.9);
	}

	.keys {
		position: relative;
		width: 100%;
		height: 330px;
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
		padding-bottom: 16px;
		border-radius: 0 0 8px 8px;
		box-sizing: border-box;
		transition: background 0.1s, transform 0.08s, box-shadow 0.1s;
		user-select: none;
		-webkit-user-select: none;
	}

	.key.white {
		height: 100%;
		background: linear-gradient(to bottom, #ffffff 0%, #ebebef 88%, #d8d8de 100%);
		border: 1px solid #b8b8c2;
		border-top: none;
		z-index: 1;
		box-shadow: inset 0 -6px 8px rgba(0, 0, 0, 0.15),
		            0 4px 8px rgba(0, 0, 0, 0.25);
		color: #23232b;
	}

	.key.white.active {
		background: linear-gradient(to bottom, #ff9955 0%, #ff5f1f 100%);
		color: #ffffff;
		transform: translateY(4px);
		box-shadow: 0 0 20px rgba(255, 95, 31, 0.7);
	}

	.key.sharp {
		height: 60%;
		background: linear-gradient(to bottom, #111116 0%, #1e1e24 85%, #08080c 100%);
		border: 1px solid #000000;
		border-top: none;
		z-index: 2;
		box-shadow: inset 0 -3px 5px rgba(255, 255, 255, 0.2),
		            0 8px 16px rgba(0, 0, 0, 0.8);
		color: #ffffff;
		padding-bottom: 12px;
	}

	.key.sharp.active {
		background: linear-gradient(to bottom, #eb1e3c 0%, #8e0018 100%);
		box-shadow: 0 0 22px rgba(235, 30, 60, 0.9);
		transform: translateY(4px);
	}

	.hints {
		font-size: 0.8rem;
		font-weight: 700;
		opacity: 0.55;
		margin-bottom: 4px;
	}

	.key.sharp .hints {
		color: #ff9955;
		opacity: 0.85;
	}

	.note-title {
		font-size: 0.85rem;
		font-weight: 800;
	}

	.piano-footer {
		margin-top: 20px;
		font-size: 0.88rem;
		color: rgba(255, 255, 255, 0.6);
	}

	:global([data-theme="light"]) .piano-footer {
		color: rgba(0, 0, 0, 0.6);
	}



	/* Chords Grid (Matching teatralo4ka) */
	.chords-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 20px;
		width: 100%;
		max-width: 960px;
		margin: 20px auto 0;
	}

	.chord-btn {
		width: 100%;
		min-height: 120px;
		padding: 20px;
		background: rgba(255, 255, 255, 0.05);
		border: 3px solid rgba(255, 255, 255, 0.15);
		border-radius: 20px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
	}

	:global([data-theme="light"]) .chord-btn {
		background: rgba(255, 255, 255, 0.7);
		border-color: rgba(0, 0, 0, 0.12);
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
	}

	.chord-btn:hover {
		transform: translateY(-4px);
		border-color: #ff5f1f;
		background: rgba(255, 255, 255, 0.1);
	}

	.chord-btn.minor {
		border-style: dashed;
	}

	.chord-btn.playing {
		transform: scale(0.94);
		background: linear-gradient(135deg, #eb1e3c 0%, #ff5f1f 100%);
		border-color: #ffffff;
		box-shadow: 0 0 35px rgba(255, 95, 31, 0.7);
	}

	.chord-name {
		font-size: 2.4rem;
		font-weight: 900;
		color: #ffffff;
		line-height: 1;
	}

	:global([data-theme="light"]) .chord-name {
		color: #111827;
	}

	.chord-btn.playing .chord-name,
	.chord-btn.playing .chord-sub,
	.chord-btn.playing .chord-notes {
		color: #ffffff !important;
	}

	.chord-sub {
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: rgba(255, 255, 255, 0.6);
		margin-top: 6px;
	}

	:global([data-theme="light"]) .chord-sub {
		color: rgba(0, 0, 0, 0.6);
	}

	.chord-notes {
		font-size: 0.8rem;
		color: #ff9955;
		margin-top: 8px;
		font-weight: 600;
	}

	@media (max-width: 768px) {
		#wrap {
			padding: 16px;
		}
		.piano-close-btn {
			top: 14px;
			right: 18px;
			width: 40px;
			height: 40px;
		}
		.keys {
			height: 220px;
		}
		.chords-grid {
			grid-template-columns: repeat(2, 1fr);
			gap: 12px;
		}
		.chord-btn {
			min-height: 80px;
			padding: 12px;
		}
		.chord-name {
			font-size: 1.6rem;
		}
		.hints {
			display: none;
		}
	}
</style>
