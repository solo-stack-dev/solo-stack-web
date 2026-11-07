<!--
	@component
	Candidate B: Stack to the moon. Paper blocks labeled with the owner's tools swing above the tower; Space, Enter,
	click or tap drops one. Overhangs are sliced off; perfect drops build a combo (and regrow the block a little);
	off-center stacks lean and sway until the tower topples. The moon unfolds a paper bridge, then play goes on (endless).
	Simulation: `engine.ts` (fixed 240 Hz). Drawing: `render.ts`.
-->
<script lang="ts">
	import { untrack } from 'svelte';
	import { on } from 'svelte/events';
	import { m } from '#lib/paraglide/messages.js';
	import { RafLoop } from '#lib/home/shared/motion.svelte.ts';
	import type { GameProps } from '../shared/types.ts';
	import { DEFAULT_TUNING, advance, createGame, drop, progress, type Game, type GameEvent, type Tuning } from './engine.ts';
	import { Renderer } from './render.ts';

	let { paused, tuning, input, reducedMotion, onScore, onGameOver, onRestart }: GameProps = $props();

	interface Toast {
		id: number;
		x: number;
		y: number;
		combo: number;
	}

	let canvas = $state<HTMLCanvasElement>();
	let started = $state(false);
	let over = $state(false);
	let moonBanner = $state(false);
	let toasts = $state<Toast[]>([]);
	let announcement = $state('');

	let game = createGame();
	let renderer: Renderer | null = null;
	let accumulator = 0;
	let queued = false;
	let overAt = 0;
	let toastId = 0;
	let bannerTimer: ReturnType<typeof setTimeout> | undefined;

	const currentTuning = (): Tuning => ({ ...DEFAULT_TUNING, ...tuning });

	function emit(event: GameEvent) {
		switch (event.type) {
			case 'land': {
				if (event.perfect && renderer) {
					const point = renderer.toScreen(game, event.x, event.y);
					const toast = { id: ++toastId, x: point.x, y: point.y, combo: event.combo };
					toasts = [...toasts.slice(-3), toast];
					setTimeout(() => (toasts = toasts.filter((item) => item.id !== toast.id)), 950);
				}
				break;
			}
			case 'score':
				onScore?.(event.score);
				break;
			case 'moon':
				moonBanner = true;
				announcement = m.home_game_stack_moon_reached();
				clearTimeout(bannerTimer);
				bannerTimer = setTimeout(() => (moonBanner = false), 3200);
				break;
			case 'over':
				over = true;
				overAt = game.time;
				moonBanner = false;
				announcement = m.home_game_stack_collapsed();
				onGameOver?.(event.score);
				break;
		}
	}

	function restart() {
		game = createGame();
		resize();
		accumulator = 0;
		over = false;
		started = false;
		moonBanner = false;
		toasts = [];
		announcement = '';
		onScore?.(0);
		onRestart?.();
	}

	function handleAction() {
		if (game.state === 'play') {
			if (drop(game)) started = true;
		} else if (game.time - overAt > 0.6) {
			restart();
		}
	}

	const loop = new RafLoop((dt) => {
		const pressed = input.consume('action');
		if (pressed || queued) handleAction();
		queued = false;
		const tune = currentTuning();
		accumulator = advance(game, accumulator + dt, { tuning: tune, calm: reducedMotion, emit });
		renderer?.draw(game, { calm: reducedMotion, progress: progress(game, tune), pendulum: tune.swingMode >= 0.5 });
	});

	$effect(() => {
		loop.paused = paused;
		// Drop presses on pause and on resume, so a key pressed while paused doesn't drop a block.
		queued = false;
		input.flush();
	});

	function resize() {
		if (!canvas || !renderer) return;
		const rect = canvas.getBoundingClientRect();
		const view = renderer.resize(rect.width, rect.height, Math.min(window.devicePixelRatio || 1, 2));
		game.viewW = view.viewW;
		game.viewH = view.viewH;
		renderer.draw(game, { calm: reducedMotion, progress: progress(game, currentTuning()), pendulum: currentTuning().swingMode >= 0.5 });
	}

	$effect(() => {
		if (!canvas) return;
		renderer = new Renderer(canvas);
		const observer = new ResizeObserver(() => resize());
		observer.observe(canvas);
		untrack(resize);
		game.camSnap = true;
		// dev only: lets the headless playtest script read the state (stripped from production builds)
		if (import.meta.env.DEV) (canvas as HTMLCanvasElement & { stackDebug?: () => Game }).stackDebug = () => game;
		// Enter also drops (Space comes through GameInput); keys arrive on the focused game surface
		const surface = canvas.parentElement?.parentElement ?? canvas;
		const offKey = on(surface, 'keydown', (event) => {
			if ((event.code === 'Enter' || event.code === 'NumpadEnter') && !event.repeat) {
				event.preventDefault();
				queued = true;
			}
		});
		return () => {
			observer.disconnect();
			offKey();
			clearTimeout(bannerTimer);
			renderer = null;
		};
	});

	function onpointerdown(event: PointerEvent) {
		if (event.button !== 0) return;
		queued = true;
	}
</script>

<div class="stack-game">
	<canvas bind:this={canvas} {onpointerdown} {@attach loop.attach}></canvas>

	<div class="layer" aria-hidden="true">
		<p class={['hint font-mono text-xs', started && 'is-hidden']}>{m.home_game_stack_hint()}</p>

		{#each toasts as toast (toast.id)}
			<p class={['toast', reducedMotion && 'is-calm']} style:left="{toast.x}px" style:top="{toast.y}px">
				<span class="font-display font-black tracking-wordmark uppercase">{m.home_game_stack_perfect()}</span>
				{#if toast.combo > 1}<span class="combo font-mono tabular-nums">{m.home_game_stack_combo({ count: toast.combo })}</span>{/if}
			</p>
		{/each}

		{#if moonBanner}
			<div class={['banner', reducedMotion && 'is-calm']}>
				<p class="banner-title font-display font-black tracking-wordmark uppercase">{m.home_game_stack_moon_reached()}</p>
				<p class="banner-sub font-mono text-xs tracking-clock">{m.home_game_stack_endless()}</p>
			</div>
		{/if}

		{#if over}
			<div class="over">
				<p class="over-title font-display font-black tracking-wordmark uppercase">{m.home_game_stack_collapsed()}</p>
				<p class="font-mono text-xs tracking-clock text-cream/70">{m.home_game_stack_retry()}</p>
			</div>
		{/if}
	</div>

	<p class="sr-only" role="status">{announcement}</p>
</div>

<style>
	.stack-game {
		position: absolute;
		inset: 0;
		overflow: hidden;
	}

	canvas {
		display: block;
		width: 100%;
		height: 100%;
		touch-action: manipulation;
		user-select: none;
		-webkit-user-select: none;
		-webkit-tap-highlight-color: transparent;
		cursor: pointer;
	}

	.layer {
		position: absolute;
		inset: 0;
		pointer-events: none;
		color: var(--color-cream);
	}

	.hint {
		position: absolute;
		left: 50%;
		bottom: 1.25rem;
		max-width: min(30rem, 70%);
		translate: -50% 0;
		padding: 0.45rem 0.9rem;
		border-radius: 999px;
		background: color-mix(in oklab, var(--color-ink) 60%, transparent);
		text-align: center;
		text-wrap: balance;
		transition: opacity 0.4s ease;
	}

	.hint.is-hidden {
		opacity: 0;
	}

	.toast {
		position: absolute;
		display: grid;
		justify-items: center;
		gap: 0.1rem;
		translate: -50% -100%;
		color: var(--color-butter);
		font-size: clamp(0.9rem, 2vw, 1.25rem);
		text-shadow: 0 2px 10px color-mix(in oklab, var(--color-ink) 80%, transparent);
		white-space: nowrap;
		animation: toast-rise 0.95s cubic-bezier(0.2, 0.9, 0.3, 1) forwards;
	}

	.toast.is-calm {
		animation-name: toast-fade;
	}

	.combo {
		font-size: 0.8em;
		color: var(--color-cream);
	}

	@keyframes toast-rise {
		0% {
			opacity: 0;
			transform: translateY(10px) scale(0.6);
		}
		18% {
			opacity: 1;
			transform: translateY(-6px) scale(1.12);
		}
		70% {
			opacity: 1;
		}
		100% {
			opacity: 0;
			transform: translateY(-38px) scale(1);
		}
	}

	@keyframes toast-fade {
		0%,
		100% {
			opacity: 0;
		}
		20%,
		70% {
			opacity: 1;
		}
	}

	.banner {
		position: absolute;
		left: clamp(1rem, 6%, 4rem);
		top: 22%;
		max-width: min(26rem, 55%);
		display: grid;
		gap: 0.75rem;
		animation: banner-in 3.2s ease forwards;
	}

	.banner.is-calm {
		animation-name: toast-fade;
		animation-duration: 3.2s;
	}

	.banner-title {
		font-size: clamp(1.5rem, 4.5vw, 3.5rem);
		line-height: 0.9;
		color: var(--color-cream);
		text-shadow: 0 4px 30px color-mix(in oklab, var(--color-ink) 70%, transparent);
	}

	.banner-sub {
		color: var(--color-butter);
	}

	@keyframes fade-in {
		from {
			opacity: 0;
		}
	}

	@keyframes banner-in {
		0% {
			opacity: 0;
			transform: translateY(16px) scale(0.92);
		}
		12% {
			opacity: 1;
			transform: none;
		}
		85% {
			opacity: 1;
		}
		100% {
			opacity: 0;
		}
	}

	.over {
		position: absolute;
		left: 50%;
		top: 38%;
		width: min(28rem, 80%);
		translate: -50% -50%;
		display: grid;
		justify-items: center;
		gap: 0.6rem;
		padding: 1.25rem 1.5rem;
		border-radius: 1rem;
		background: color-mix(in oklab, var(--color-ink) 72%, transparent);
		text-align: center;
		animation: fade-in 0.4s ease both;
	}

	.over-title {
		font-size: clamp(1.25rem, 3.5vw, 2rem);
		line-height: 1;
		color: var(--color-butter);
	}
</style>
