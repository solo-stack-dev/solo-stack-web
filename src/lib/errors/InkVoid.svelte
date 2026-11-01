<!--
	@component
	The 404 "domain expansion": an endless tunnel of torn paper rings and scraps around a glowing vanishing point,
	drawn on one canvas. It rushes for the first seconds (while the CSS collapse in `NotFound.svelte` swallows the
	page), then settles into a slow drift. Fades in on its first frame over the CSS fallback.

	Cheap by construction: all shapes are prebuilt `Path2D`s in unit space (`void.ts`), a frame is ~50 fills at
	30 fps, DPR capped at 1.5, paused off screen and in hidden tabs (`RafLoop`). Reduced motion: no rush, one
	static frame (redrawn on resize).

	The vanishing point comes from the CSS custom properties `--vp-x` / `--vp-y` (fractions) on the canvas, so the
	page CSS can move it per breakpoint and place the mascot on the same spot.
-->
<script lang="ts">
	import { RafLoop, reducedMotion } from '#lib/home/shared/motion.svelte.ts';
	import { advance, createRings, createShards, depth, paperColor, paperRgb, rgba, type Ring, type Shard } from './void.ts';

	interface Props {
		class?: string;
	}

	let { class: className = '' }: Props = $props();

	const INTRO_SECONDS = 2.2;
	const DRIFT = 0.085;

	let canvas: HTMLCanvasElement;
	let rings: Ring[] = [];
	let shards: Shard[] = [];
	let ready = $state(false);
	let width = 0;
	let height = 0;
	let vp = { x: 0.5, y: 0.5 };
	let intro = 0;

	const easeOut = (t: number) => 1 - (1 - t) ** 3;

	function measure() {
		const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
		const box = canvas.getBoundingClientRect();
		width = Math.max(1, Math.round(box.width * ratio));
		height = Math.max(1, Math.round(box.height * ratio));
		canvas.width = width;
		canvas.height = height;
		const style = getComputedStyle(canvas);
		vp = { x: parseFloat(style.getPropertyValue('--vp-x')) || 0.5, y: parseFloat(style.getPropertyValue('--vp-y')) || 0.5 };
	}

	function step(dt: number) {
		const rush = intro < 1 ? 1 + 10 * (1 - easeOut(intro)) : 1;
		const amount = DRIFT * rush * dt;
		for (const ring of rings) {
			ring.z = advance(ring.z, amount);
			ring.rotation += ring.spin * dt;
		}
		for (const shard of shards) {
			shard.z = advance(shard.z, amount * 1.6);
			shard.rotation += shard.spin * dt;
		}
	}

	function draw() {
		const context = canvas.getContext('2d');
		if (!context) return;
		const cx = vp.x * width;
		const cy = vp.y * height;
		const diagonal = Math.hypot(width, height);
		const base = diagonal * 0.034;

		context.setTransform(1, 0, 0, 1, 0, 0);
		context.globalAlpha = 1;

		// Ink with a faint warm bloom around the light
		const sky = context.createRadialGradient(cx, cy, 0, cx, cy, diagonal * 0.75);
		sky.addColorStop(0, '#3b2e17');
		sky.addColorStop(0.18, '#1f1b14');
		sky.addColorStop(0.55, '#121314');
		sky.addColorStop(1, '#0e0f10');
		context.fillStyle = sky;
		context.fillRect(0, 0, width, height);

		// Rings, far to near
		const ordered = rings.toSorted((a, b) => b.z - a.z);
		for (const ring of ordered) {
			const radius = base / ring.z;
			if (radius > diagonal * 1.3) continue;
			const d = depth(ring.z);
			// born out of the light at the far end, fading into the dark as it passes the viewer
			const alpha = Math.min(1, (1 - d) * 6) * (0.3 + 0.7 * Math.min(1, d / 0.4));
			const twist = ring.rotation + 0.55 * Math.log(ring.z);
			const cos = Math.cos(twist) * radius;
			const sin = Math.sin(twist) * radius;
			context.setTransform(cos, sin, -sin, cos, cx, cy);
			context.fillStyle = `rgb(251 243 221 / ${alpha * (0.25 + 0.55 * d)})`;
			context.fill(ring.fibre);
			// curled paper: shadow on the inner edge, light catching the torn outer edge
			const color = paperRgb(d, ring.tint);
			const curl = context.createRadialGradient(0, 0, ring.inner, 0, 0, 1.01);
			curl.addColorStop(0, rgba(color, alpha, 0.45));
			curl.addColorStop(0.45, rgba(color, alpha));
			curl.addColorStop(1, rgba(color, alpha, 1.08));
			context.fillStyle = curl;
			context.fill(ring.body);
		}

		// Scraps of paper rushing past
		for (const shard of shards) {
			const d = depth(shard.z);
			const reach = (base / shard.z) * shard.distance;
			const size = (base / shard.z) * shard.size * 0.32;
			if (reach - size > diagonal) continue;
			const x = cx + Math.cos(shard.theta) * reach;
			const y = cy + Math.sin(shard.theta) * reach;
			const cos = Math.cos(shard.rotation) * size;
			const sin = Math.sin(shard.rotation) * size;
			context.setTransform(cos, sin, -sin, cos, x, y);
			const alpha = Math.min(1, (1 - d) * 5);
			context.fillStyle = shard.cream ? `rgb(251 243 221 / ${alpha * (0.5 + 0.5 * d)})` : paperColor(d, alpha);
			context.fill(shard.shape);
			if (shard.lines) {
				context.strokeStyle = `rgb(14 15 16 / ${alpha * 0.55})`;
				context.lineWidth = 0.07;
				context.stroke(shard.lines);
			}
		}

		// The light at the end of the void (hides where rings are born)
		context.setTransform(1, 0, 0, 1, 0, 0);
		const glow = context.createRadialGradient(cx, cy, 0, cx, cy, base * 4.2);
		glow.addColorStop(0, 'rgb(252 215 114 / 1)');
		glow.addColorStop(0.24, 'rgb(252 215 114 / 0.95)');
		glow.addColorStop(0.3, 'rgb(226 169 59 / 0.45)');
		glow.addColorStop(1, 'rgb(226 169 59 / 0)');
		context.fillStyle = glow;
		context.fillRect(cx - base * 4.2, cy - base * 4.2, base * 8.4, base * 8.4);
		ready = true;
	}

	const loop = new RafLoop(
		(dt) => {
			if (intro < 1) intro = Math.min(1, intro + dt / INTRO_SECONDS);
			step(dt);
			draw();
		},
		{ fps: 30 }
	);

	$effect(() => {
		rings = createRings(22, 404);
		shards = createShards(26, 4040);
		measure();
		const observer = new ResizeObserver(() => {
			measure();
			if (!loop.running) draw();
		});
		observer.observe(canvas);
		return () => observer.disconnect();
	});

	$effect(() => {
		const still = reducedMotion.current;
		loop.paused = still;
		if (still) {
			// Static final composition: skip the collapse, show the settled tunnel.
			intro = 1;
			draw();
		}
	});
</script>

<canvas bind:this={canvas} {@attach loop.attach} class={['ink-void', ready && 'is-ready', className]} aria-hidden="true"></canvas>

<style>
	.ink-void {
		display: block;
		width: 100%;
		height: 100%;
		opacity: 0;
		transition: opacity 0.5s ease-out;
	}

	.is-ready {
		opacity: 1;
	}
</style>
