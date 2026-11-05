/**
 * Radio Web Audio, a lazy chunk (not in the initial bundle). Uses the shared AudioContext from `audio.svelte.ts`,
 * unlocked in the gesture handler.
 */

let noise: AudioBuffer | null = null;

/** One second of white noise, generated once per context (no audio file). */
function noiseBuffer(context: AudioContext): AudioBuffer {
	if (noise && noise.sampleRate === context.sampleRate) return noise;
	const buffer = context.createBuffer(1, context.sampleRate, context.sampleRate);
	const data = buffer.getChannelData(0);
	for (let index = 0; index < data.length; index++) data[index] = Math.random() * 2 - 1;
	noise = buffer;
	return buffer;
}

/** Tuning static: band-passed noise, crackle envelope, falling sweep. Quiet on purpose (plays on every preset press). */
export function playStatic(context: AudioContext, output: AudioNode, { duration = 0.32, level = 0.16 } = {}): void {
	const now = context.currentTime;
	const source = context.createBufferSource();
	source.buffer = noiseBuffer(context);
	source.playbackRate.value = 0.85 + Math.random() * 0.3;

	const band = context.createBiquadFilter();
	band.type = 'bandpass';
	band.Q.value = 0.9;
	band.frequency.setValueAtTime(3200 + Math.random() * 1500, now);
	band.frequency.exponentialRampToValueAtTime(900, now + duration);

	const gain = context.createGain();
	gain.gain.setValueAtTime(0, now);
	gain.gain.linearRampToValueAtTime(level, now + 0.015);
	// Crackle: a few random dips
	for (let step = 0.04; step < duration - 0.05; step += 0.035 + Math.random() * 0.03) {
		gain.gain.setValueAtTime(level * (0.35 + Math.random() * 0.65), now + step);
	}
	gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

	source.connect(band).connect(gain).connect(output);
	source.start(now, Math.random() * 0.5, duration + 0.05);
	source.addEventListener('ended', () => {
		source.disconnect();
		band.disconnect();
		gain.disconnect();
	});
}

export interface PlayerGraph {
	analyser: AnalyserNode;
	setVolume(value: number): void;
}

const graphs = new WeakMap<HTMLMediaElement, PlayerGraph>();

/** element → gain → analyser → output. Cached: `createMediaElementSource` works only once per element. */
export function connectPlayer(element: HTMLMediaElement, context: AudioContext, output: AudioNode, volume: number): PlayerGraph {
	const existing = graphs.get(element);
	if (existing) return existing;
	const source = context.createMediaElementSource(element);
	const gain = context.createGain();
	gain.gain.value = volume;
	const analyser = context.createAnalyser();
	analyser.fftSize = 1024;
	analyser.smoothingTimeConstant = 0.82;
	source.connect(gain).connect(analyser).connect(output);
	const graph: PlayerGraph = {
		analyser,
		setVolume(value) {
			gain.gain.setTargetAtTime(Math.min(1, Math.max(0, value)), context.currentTime, 0.03);
		}
	};
	graphs.set(element, graph);
	return graph;
}
