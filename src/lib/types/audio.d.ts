export interface TrackMetadata {
	id: string;
	title: string;
	artist: string;
	album: string;
	year: number;
	duration: number; // in seconds
	audioSrc: string;
	coverSrc?: string;
	waveformSrc?: string;
	bpm?: number;
	tags?: string[];
}

export interface AlbumMetadata {
	id: string;
	title: string;
	year: number;
	coverSrc: string;
	tracks: TrackMetadata[];
}

export interface AudioVisualizerParams {
	fftSize: number;
	smoothingTimeConstant: number;
	minDecibels: number;
	maxDecibels: number;
}

export interface PianoKeyNote {
	note: string;
	octave: number;
	frequency: number;
	isBlack: boolean;
	keyBinding: string;
}

export type VisualizerPresetId = 'neon-waveform' | 'cyber-bars' | 'circular-vortex' | 'spectrogram';
