<!--
	@component
	Glowing horizon waveform (Canvas 2D), fills its positioned parent. Playing: AnalyserNode spectrum sets the envelope,
	time-domain signal the jag; `onlevel` gets smoothed RMS 0…1. Idle: slow quiet wave. Reduced motion: one static frame,
	level 0. RafLoop at 30 fps, only on screen with the tab visible.
-->
<script lang="ts">
	import { RafLoop } from '#lib/home/shared/motion.svelte.ts';

	interface Props {
		analyser: AnalyserNode | null;
		playing: boolean;
		reduced: boolean;
		/** Smoothed loudness 0…1 while playing (0 when idle). Called at most once per frame. */
		onlevel?: (level: number) => void;
	}

	let { analyser, playing, reduced, onlevel }: Props = $props();

	let canvas: HTMLCanvasElement;
	let context: CanvasRenderingContext2D | null = null;
	let width = 0;
	let height = 0;
	let time = 0;
	let level = 0;
	let frequency: Uint8Array<ArrayBuffer> | null = null;
	let wave: Uint8Array<ArrayBuffer> | null = null;

	const GLOW = 'rgba(252, 215, 114, 0.22)';
	const CORE = 'rgba(253, 232, 170, 0.92)';
	const IDLE = 'rgba(252, 215, 114, 0.55)';

	function resize() {
		const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
		const rect = canvas.getBoundingClientRect();
		width = rect.width;
		height = rect.height;
		canvas.width = Math.max(1, Math.round(width * ratio));
		canvas.height = Math.max(1, Math.round(height * ratio));
		context = canvas.getContext('2d');
		context?.setTransform(ratio, 0, 0, ratio, 0, 0);
	}

	function stroke(points: (x: number) => number, step: number) {
		if (!context) return;
		context.beginPath();
		for (let x = 0; x <= width + step; x += step) {
			const y = points(x);
			if (x === 0) context.moveTo(x, y);
			else context.lineTo(x, y);
		}
	}

	function drawIdle(t: number) {
		if (!context) return;
		const center = height / 2;
		context.clearRect(0, 0, width, height);
		const line = (x: number) => center + Math.sin(x * 0.011 + t * 0.55) * 2.6 + Math.sin(x * 0.029 - t * 0.8) * 1.2;
		context.lineJoin = 'round';
		stroke(line, 6);
		context.strokeStyle = GLOW;
		context.lineWidth = 7;
		context.stroke();
		context.strokeStyle = IDLE;
		context.lineWidth = 1.2;
		context.stroke();
	}

	function drawPlaying() {
		if (!context || !analyser) return;
		if (!frequency || frequency.length !== analyser.frequencyBinCount) {
			frequency = new Uint8Array(analyser.frequencyBinCount);
			wave = new Uint8Array(analyser.fftSize);
		}
		analyser.getByteFrequencyData(frequency);
		analyser.getByteTimeDomainData(wave!);

		// RMS of the time-domain signal → smoothed level for the star pulse
		let sum = 0;
		for (const sample of wave!) {
			const value = (sample - 128) / 128;
			sum += value * value;
		}
		const rms = Math.sqrt(sum / wave!.length);
		level += (Math.min(1, rms * 3) - level) * 0.25;
		onlevel?.(level);

		const center = height / 2;
		const half = width / 2;
		// Log frequency scale from the center outward (bass not hidden behind the radio); RMS as a floor.
		const minBin = 2;
		const maxBin = Math.floor(frequency.length * 0.6);
		const samples = wave!.length;
		context.clearRect(0, 0, width, height);
		const line = (x: number) => {
			const distance = Math.min(1, Math.abs(x - half) / half);
			const bin = Math.floor(minBin * Math.pow(maxBin / minBin, distance));
			const envelope = Math.max(frequency![bin] / 255, level * 0.7) * (1 - distance * 0.3);
			const jag = (wave![Math.floor((x / width) * samples * 8) % samples] - 128) / 128;
			return center - envelope * height * 0.46 * (0.35 + Math.abs(jag) * 4) * Math.sign(jag || 1);
		};
		context.lineJoin = 'round';
		stroke(line, 3);
		context.strokeStyle = GLOW;
		context.lineWidth = 8;
		context.stroke();
		context.strokeStyle = CORE;
		context.lineWidth = 1.8;
		context.stroke();
	}

	const loop = new RafLoop(
		(dt) => {
			time += dt;
			if (playing && analyser) drawPlaying();
			else {
				if (level !== 0) {
					level = 0;
					onlevel?.(0);
				}
				drawIdle(time);
			}
		},
		{ fps: 30 }
	);

	$effect(() => {
		resize();
		const observer = new ResizeObserver(() => {
			resize();
			if (reduced) drawIdle(0);
		});
		observer.observe(canvas);
		return () => observer.disconnect();
	});

	$effect(() => {
		loop.paused = reduced;
		if (reduced) {
			level = 0;
			onlevel?.(0);
			drawIdle(0);
		}
	});
</script>

<canvas bind:this={canvas} {@attach loop.attach} class="waveform" aria-hidden="true"></canvas>

<style>
	.waveform {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		mix-blend-mode: screen;
	}
</style>
