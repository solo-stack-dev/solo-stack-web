<!--
	@component
	One cheap canvas star field with twinkle. Fills its positioned parent (`position: absolute; inset: 0`).
	The loop is capped at 20 fps, pauses off screen and in hidden tabs, and draws one static frame under reduced motion.
	Stars are deterministic per `seed`, so resizing does not reshuffle them.

	NightPage renders the global sky stars. Sections may add their own, e.g. denser stars behind the radio:

	```svelte
	<div class="relative h-svh">
		<StarField density={1.6} brightness={0.8} seed={42} />
	</div>
	```
-->
<script lang="ts">
	import { RafLoop, reducedMotion } from './motion.svelte.ts';

	interface Props {
		/** Multiplier on the base density (~1 star per 7000 px²). Default 1. */
		density?: number;
		/** Multiplier on star alpha, 0…1+. Default 1. */
		brightness?: number;
		/** PRNG seed. Different seeds give different skies. Default 7. */
		seed?: number;
		/** Animate twinkle (ignored under reduced motion). Default true. */
		twinkle?: boolean;
		class?: string;
	}

	let { density = 1, brightness = 1, seed = 7, twinkle = true, class: className = '' }: Props = $props();

	interface Star {
		x: number;
		y: number;
		r: number;
		alpha: number;
		warm: boolean;
		speed: number;
		phase: number;
		twinkles: boolean;
	}

	const MAX_STARS = 700;
	let canvas: HTMLCanvasElement;

	function mulberry32(value: number) {
		let a = value >>> 0;
		return () => {
			a = (a + 0x6d2b79f5) >>> 0;
			let t = a;
			t = Math.imul(t ^ (t >>> 15), t | 1);
			t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
			return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
		};
	}

	function createStars(seedValue: number): Star[] {
		const random = mulberry32(seedValue);
		return Array.from({ length: MAX_STARS }, () => {
			const size = random();
			return {
				x: random(),
				y: random(),
				// mostly tiny, a few bright ones
				r: size > 0.97 ? 1.6 + random() : size > 0.8 ? 1 + random() * 0.5 : 0.5 + random() * 0.4,
				alpha: 0.35 + random() * 0.65,
				warm: random() > 0.82,
				speed: 0.6 + random() * 1.8,
				phase: random() * Math.PI * 2,
				twinkles: random() > 0.55
			};
		});
	}

	const stars = $derived(createStars(seed));
	let visible: Star[] = [];
	let width = 0;
	let height = 0;
	let time = 0;
	let devicePixelRatioCapped = 1;

	function draw() {
		const context = canvas?.getContext('2d');
		if (!context) return;
		context.clearRect(0, 0, canvas.width, canvas.height);
		const animate = loop.running;
		for (const star of visible) {
			const flicker = animate && star.twinkles ? 0.6 + 0.4 * Math.sin(time * star.speed + star.phase) : 1;
			context.globalAlpha = Math.min(1, star.alpha * flicker * brightness);
			context.fillStyle = star.warm ? '#fcd772' : '#fbf3dd';
			const radius = star.r * devicePixelRatioCapped;
			const x = star.x * width;
			const y = star.y * height;
			if (radius < 1.2) context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
			else {
				context.beginPath();
				context.arc(x, y, radius, 0, Math.PI * 2);
				context.fill();
			}
		}
		context.globalAlpha = 1;
	}

	const loop = new RafLoop(
		(dt) => {
			time += dt;
			draw();
		},
		{ fps: 20 }
	);

	$effect(() => {
		loop.paused = reducedMotion.current || !twinkle;
		draw();
	});

	$effect(() => {
		const starList = stars;
		const area = density;
		const resize = () => {
			const rect = canvas.getBoundingClientRect();
			devicePixelRatioCapped = Math.min(window.devicePixelRatio || 1, 2);
			width = Math.round(rect.width * devicePixelRatioCapped);
			height = Math.round(rect.height * devicePixelRatioCapped);
			canvas.width = width;
			canvas.height = height;
			const count = Math.min(MAX_STARS, Math.round(((rect.width * rect.height) / 7000) * area));
			visible = starList.slice(0, count);
			draw();
		};
		const observer = new ResizeObserver(resize);
		observer.observe(canvas);
		resize();
		return () => observer.disconnect();
	});
</script>

<canvas bind:this={canvas} aria-hidden="true" class={['star-field', className]} {@attach loop.attach}></canvas>

<style>
	.star-field {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
	}
</style>
