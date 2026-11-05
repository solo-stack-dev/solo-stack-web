<!--
	@component
	STUB. Programmer-art game that satisfies the game contract: a block that moves (left/right) and jumps (action) with
	`tuning.gravity` / `tuning.speed`; jumps count as score. No candidate imports it any more; safe to delete.
-->
<script lang="ts">
	import { RafLoop } from '#lib/home/shared/motion.svelte.ts';
	import type { GameProps } from './types.ts';

	interface Props extends GameProps {
		variant: 'moon-planet' | 'stack-to-moon' | 'constellations';
	}

	let { paused, tuning, input, reducedMotion, onScore, variant }: Props = $props();

	const PALETTE = ['#fcd772', '#e2a93b', '#fbf3dd', '#18191b', '#0e0f10', '#2a2723'];
	let canvas: HTMLCanvasElement;
	let x = 0.5;
	let y = 0;
	let vy = 0;
	let jumps = 0;
	let squash = 1;

	const loop = new RafLoop((dt) => {
		const speed = tuning.speed ?? 0.5;
		const gravity = tuning.gravity ?? 2.4;
		x = Math.min(0.95, Math.max(0.05, x + input.axisX * speed * dt));
		if (input.consume('action') && y === 0) {
			vy = 1.1;
			squash = 0.7;
			jumps += 1;
			onScore?.(jumps);
		}
		vy -= gravity * dt;
		y = Math.max(0, y + vy * dt);
		if (y === 0) vy = 0;
		squash += (1 - squash) * Math.min(1, dt * (reducedMotion ? 30 : 10));
		draw();
	});

	$effect(() => {
		loop.paused = paused;
	});

	function draw() {
		const context = canvas?.getContext('2d');
		if (!context) return;
		const { width, height } = canvas;
		context.fillStyle = '#18191b';
		context.fillRect(0, 0, width, height);
		const swatch = width / PALETTE.length;
		PALETTE.forEach((color, index) => {
			context.fillStyle = color;
			context.fillRect(index * swatch, height - height * 0.04, swatch, height * 0.04);
		});
		const ground = height * 0.8;
		const size = height * 0.12;
		context.fillStyle = '#fcd772';
		if (variant === 'moon-planet') {
			context.beginPath();
			context.arc(width / 2, ground + height * 0.9, height, 0, Math.PI * 2);
			context.fillStyle = '#2a2723';
			context.fill();
		} else if (variant === 'stack-to-moon') {
			context.fillStyle = '#2a2723';
			for (let block = 0; block < 4; block++) context.fillRect(width * 0.35 + block * 6, ground - (block - 3) * size * 0.5, width * 0.3, size * 0.45);
		} else {
			context.fillStyle = '#fbf3dd';
			for (let star = 0; star < 9; star++) context.fillRect(((star * 97) % 100) * width * 0.01, ((star * 61) % 60) * height * 0.01, 3, 3);
		}
		const w = size / squash;
		const h = size * squash;
		context.fillStyle = '#fcd772';
		context.fillRect(x * width - w / 2, ground - h - y * height * 0.5, w, h);
	}

	$effect(() => {
		const resize = () => {
			const rect = canvas.getBoundingClientRect();
			const ratio = Math.min(window.devicePixelRatio || 1, 2);
			canvas.width = Math.round(rect.width * ratio);
			canvas.height = Math.round(rect.height * ratio);
			draw();
		};
		const observer = new ResizeObserver(resize);
		observer.observe(canvas);
		return () => observer.disconnect();
	});
</script>

<canvas bind:this={canvas} class="stub" data-variant={variant} {@attach loop.attach}></canvas>

<style>
	.stub {
		display: block;
		width: 100%;
		height: 100%;
	}
</style>
