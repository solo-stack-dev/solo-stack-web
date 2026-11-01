<!--
	@component
	Candidate A: moon planet. Canvas 2D prototype of a radial-gravity platformer: run around a tiny moon, stomp bugs,
	collect orbiting stars, beat the rare boss bug. Fixed 120 Hz simulation (sim.ts) with interpolated rendering
	(render.ts), DPR-aware and resize-safe. Contract: GameProps (../shared/types.ts).
-->
<script lang="ts">
	import { RafLoop } from '#lib/home/shared/motion.svelte.ts';
	import { loadHighScore } from '../shared/highscore.ts';
	import type { GameProps } from '../shared/types.ts';
	import { Renderer, type View } from './render.ts';
	import { createGame, pressJump, step, STEP, type Game } from './sim.ts';
	import { readTuning } from './tuning.ts';

	let { paused, tuning, input, reducedMotion, onScore, onGameOver }: GameProps = $props();

	const GAME_ID = 'moon-planet';
	const MAX_STEPS = 12;

	let canvas: HTMLCanvasElement;
	let context: CanvasRenderingContext2D | null = null;
	const renderer = new Renderer();
	const view: View = { w: 0, h: 0, dpr: 1, coarse: false, best: 0 };

	let game: Game = newGame();
	let accumulator = 0;
	let reportedScore = 0;
	let reportedOver = false;

	function newGame(): Game {
		return createGame(readTuning(tuning), reducedMotion);
	}

	function restart() {
		view.best = Math.max(view.best, game.score);
		game = newGame();
		accumulator = 0;
		reportedScore = 0;
		reportedOver = false;
		onScore?.(0);
	}

	function frame(dt: number) {
		const values = readTuning(tuning);
		game.calm = reducedMotion;
		const action = input.consume('action');
		const up = input.consume('up');
		const jump = action || up;
		const dive = input.consume('down');

		if (game.over !== 'none') {
			// Jump to play again once the result had a moment to land.
			if (jump && game.overT > 1.1) restart();
		} else if (jump) {
			pressJump(game);
		}

		accumulator += dt;
		let steps = 0;
		let diveQueued = dive;
		while (accumulator >= STEP && steps < MAX_STEPS) {
			step(game, values, { axis: input.axisX, held: input.isDown('action') || input.isDown('up'), dive: diveQueued });
			diveQueued = false;
			accumulator -= STEP;
			steps += 1;
		}
		if (steps === MAX_STEPS) accumulator = 0;

		if (game.score !== reportedScore) {
			reportedScore = game.score;
			onScore?.(game.score);
		}
		if (game.over !== 'none' && !reportedOver && game.overT > 0.6) {
			reportedOver = true;
			onGameOver?.(game.score);
		}
		draw(accumulator / STEP);
	}

	function draw(alpha = 1) {
		if (!context || !view.w || !view.h) return;
		renderer.render(context, game, view, alpha);
	}

	const loop = new RafLoop(frame);

	$effect(() => {
		loop.paused = paused;
		// Drop presses made while paused so resuming doesn't fire a stale jump.
		if (paused) {
			input.consume('action');
			input.consume('up');
			input.consume('down');
		}
	});

	$effect(() => {
		context = canvas.getContext('2d');
		view.best = loadHighScore(GAME_ID);
		view.coarse = window.matchMedia('(pointer: coarse)').matches;
		// Dev only: expose live state for playtest scripts (headless checks, balancing). Stripped from production builds.
		if (import.meta.env.DEV) Object.assign(canvas, { moonPlanet: { game: () => game, restart } });
		const resize = () => {
			const rect = canvas.getBoundingClientRect();
			view.dpr = Math.min(window.devicePixelRatio || 1, 2);
			view.w = rect.width;
			view.h = rect.height;
			canvas.width = Math.max(1, Math.round(rect.width * view.dpr));
			canvas.height = Math.max(1, Math.round(rect.height * view.dpr));
			draw();
		};
		resize();
		const observer = new ResizeObserver(resize);
		observer.observe(canvas);
		return () => observer.disconnect();
	});
</script>

<canvas bind:this={canvas} class="moon-planet" {@attach loop.attach}></canvas>

<style>
	.moon-planet {
		display: block;
		width: 100%;
		height: 100%;
		touch-action: none;
	}
</style>
