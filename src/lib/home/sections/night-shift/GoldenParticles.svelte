<!--
	@component
	Golden tree egg: gold motes rising from the bonsai while it is lit. Lazy chunk (LazyMount), one small canvas,
	30 fps, runs only while particles are alive and the canvas is on screen.
-->
<script lang="ts">
	import { RafLoop } from '#lib/home/shared/motion.svelte.ts';

	interface Props {
		active: boolean;
		/** Emitter position in percent of the canvas box. */
		origin: { x: number; y: number };
	}

	let { active, origin }: Props = $props();

	interface Mote {
		x: number;
		y: number;
		vx: number;
		vy: number;
		life: number;
		max: number;
		size: number;
		phase: number;
	}

	let canvas: HTMLCanvasElement | undefined = $state();
	let motes: Mote[] = [];
	let spawn = 0;

	const loop = new RafLoop((dt, time) => step(dt, time), { fps: 30, paused: true });

	$effect(() => {
		if (active) loop.paused = false;
	});

	function step(dt: number, time: number) {
		const context = canvas?.getContext('2d');
		if (!canvas || !context) return;
		const ratio = Math.min(window.devicePixelRatio || 1, 2);
		const width = canvas.clientWidth;
		const height = canvas.clientHeight;
		if (canvas.width !== Math.round(width * ratio)) canvas.width = Math.round(width * ratio);
		if (canvas.height !== Math.round(height * ratio)) canvas.height = Math.round(height * ratio);

		if (active) {
			spawn += dt * 22;
			while (spawn >= 1 && motes.length < 70) {
				spawn -= 1;
				const ox = (origin.x / 100) * width;
				const oy = (origin.y / 100) * height;
				motes.push({
					x: ox + (Math.random() - 0.5) * width * 0.75,
					y: oy - Math.random() * height * 0.55,
					vx: (Math.random() - 0.5) * 10,
					vy: -8 - Math.random() * 22,
					life: 0,
					max: 1.6 + Math.random() * 2.2,
					size: 0.8 + Math.random() * 1.9,
					phase: Math.random() * Math.PI * 2
				});
			}
		}

		motes = motes.filter((mote) => (mote.life += dt) < mote.max);
		context.setTransform(ratio, 0, 0, ratio, 0, 0);
		context.clearRect(0, 0, width, height);
		context.globalCompositeOperation = 'lighter';
		for (const mote of motes) {
			mote.x += (mote.vx + Math.sin(time / 600 + mote.phase) * 6) * dt;
			mote.y += mote.vy * dt;
			const t = mote.life / mote.max;
			const alpha = Math.sin(Math.PI * t) * (0.55 + 0.45 * Math.sin(time / 140 + mote.phase));
			const radius = mote.size * 3.2;
			const gradient = context.createRadialGradient(mote.x, mote.y, 0, mote.x, mote.y, radius);
			gradient.addColorStop(0, `rgb(255 236 170 / ${alpha})`);
			gradient.addColorStop(0.35, `rgb(252 215 114 / ${alpha * 0.55})`);
			gradient.addColorStop(1, 'rgb(226 169 59 / 0)');
			context.fillStyle = gradient;
			context.beginPath();
			context.arc(mote.x, mote.y, radius, 0, Math.PI * 2);
			context.fill();
		}

		if (!active && !motes.length) {
			context.clearRect(0, 0, width, height);
			loop.paused = true;
		}
	}
</script>

<canvas bind:this={canvas} {@attach loop.attach} class="motes" aria-hidden="true"></canvas>

<style>
	.motes {
		display: block;
		width: 100%;
		height: 100%;
		pointer-events: none;
	}
</style>
