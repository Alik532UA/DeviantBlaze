export interface FrequencyBands {
	subBass: number; // 20 - 60 Hz
	bass: number; // 60 - 250 Hz
	lowMid: number; // 250 - 500 Hz
	mid: number; // 500 - 2000 Hz
	upperMid: number; // 2000 - 4000 Hz
	high: number; // 4000 - 20000 Hz
	energy: number; // Normalized overall RMS [0..1]
}

export interface VisualizerRenderContext {
	ctx: CanvasRenderingContext2D;
	width: number;
	height: number;
	timeData: Uint8Array;
	freqData: Uint8Array;
	bands: FrequencyBands;
	timestamp: number;
}

export interface VisualizerRenderer {
	id: string;
	name: string;
	render: (context: VisualizerRenderContext) => void;
	init?: (canvas: HTMLCanvasElement) => void;
	destroy?: () => void;
}
