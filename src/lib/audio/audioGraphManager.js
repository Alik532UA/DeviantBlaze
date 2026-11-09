/**
 * Web Audio Graph & Lifecycle Manager.
 * Prevents memory leaks by ensuring clean disconnection of audio nodes and proper AudioContext suspension/resumption.
 */
export class AudioGraphManager {
	constructor() {
		/** @type {AudioContext | null} */
		this.ctx = null;
		/** @type {AnalyserNode | null} */
		this.analyser = null;
		/** @type {GainNode | null} */
		this.masterGain = null;
		/** @type {MediaElementAudioSourceNode | null} */
		this.sourceNode = null;
		this.isUnlocked = false;
	}

	/**
	 * Initializes the audio context on first user interaction.
	 * @param {HTMLMediaElement} [mediaElement]
	 * @returns {AudioContext | null}
	 */
	init(mediaElement) {
		if (typeof window === 'undefined') return null;

		if (!this.ctx) {
			const AudioContextClass =
				window.AudioContext || /** @type {any} */ (window).webkitAudioContext;
			if (!AudioContextClass) return null;

			this.ctx = new AudioContextClass();
			this.analyser = this.ctx.createAnalyser();
			this.analyser.fftSize = 256;
			this.analyser.smoothingTimeConstant = 0.8;

			this.masterGain = this.ctx.createGain();
			this.masterGain.gain.value = 1.0;

			this.analyser.connect(this.masterGain);
			this.masterGain.connect(this.ctx.destination);
		}

		if (mediaElement && !this.sourceNode && this.ctx && this.analyser) {
			try {
				this.sourceNode = this.ctx.createMediaElementSource(mediaElement);
				this.sourceNode.connect(this.analyser);
			} catch {
				// Node may already be connected to mediaElement
			}
		}

		if (this.ctx && this.ctx.state === 'suspended') {
			this.ctx
				.resume()
				.then(() => {
					this.isUnlocked = true;
				})
				.catch(() => {});
		} else {
			this.isUnlocked = true;
		}

		return this.ctx;
	}

	/**
	 * Safely disconnects all nodes and closes the audio context to prevent resource leaks.
	 */
	destroy() {
		if (this.sourceNode) {
			try {
				this.sourceNode.disconnect();
			} catch {
				// safe ignore during teardown
			}
			this.sourceNode = null;
		}

		if (this.analyser) {
			try {
				this.analyser.disconnect();
			} catch {
				// safe ignore during teardown
			}
			this.analyser = null;
		}

		if (this.masterGain) {
			try {
				this.masterGain.disconnect();
			} catch {
				// safe ignore during teardown
			}
			this.masterGain = null;
		}

		if (this.ctx && this.ctx.state !== 'closed') {
			try {
				this.ctx.close();
			} catch {
				// safe ignore during teardown
			}
			this.ctx = null;
		}

		this.isUnlocked = false;
	}
}

export const audioGraph = new AudioGraphManager();
