<!--
	@component
	Candidate C: constellation hunt (tech zodiac).
	- trace (timed): one named sign per round; connect its stars among decoys before time runs out.
	- explore (free): roam a larger sky; completed signs fill the zodiac wheel.
	engine.ts owns rules and Canvas 2D rendering; this component owns the DOM: HUD, mode switch, note card, wheel, end
	panels, screen reader announcements.
-->
<script lang="ts">
	import { untrack } from 'svelte';
	import { on } from 'svelte/events';
	import { m } from '#lib/paraglide/messages.js';
	import { RafLoop } from '#lib/home/shared/motion.svelte.ts';
	import type { GameButton } from '../shared/input.svelte.ts';
	import type { GameProps } from '../shared/types.ts';
	import { ConstellationEngine, type Box, type Mode, type Rect } from './engine.ts';
	import { SIGNS, signPath, type SignDef, type SignId } from './signs.ts';

	let { paused, tuning, input, reducedMotion, onScore, onGameOver, onRestart }: GameProps = $props();

	const modeOf = (value: number | undefined): Mode => ((value ?? 0) >= 0.5 ? 'explore' : 'trace');

	let mode = $state<Mode>(untrack(() => modeOf(tuning.mode)));
	let current = $state.raw<SignDef | null>(null);
	let round = $state(1);
	let hint = $state(1);
	let card = $state.raw<SignDef | null>(null);
	let found = $state<SignId[]>([]);
	let ended = $state<'over' | 'done' | null>(null);
	let announce = $state('');
	let wrongs = $state(0);
	let exploreHint = $state(false);
	let score = $state(0);

	let root = $state<HTMLDivElement>();
	let background = $state<HTMLCanvasElement>();
	let foreground = $state<HTMLCanvasElement>();
	let cardElement = $state<HTMLElement>();
	let timerElement = $state<HTMLElement>();
	let cardSize = { w: 0, h: 0 };
	let stage = { w: 0, h: 0 };

	const engine = new ConstellationEngine(
		{
			score: (value) => {
				score = value;
				onScore?.(value);
			},
			round: (sign, number, level) => {
				current = sign;
				round = number;
				hint = level;
			},
			complete: (sign) => {
				card = sign;
				if (!found.includes(sign.id)) found.push(sign.id);
				announce = m.home_game_stars_found_announce({ name: sign.name() });
			},
			cardClosed: () => {
				card = null;
				engine.cardHold = false;
			},
			over: (value) => {
				ended = 'over';
				onGameOver?.(value);
			},
			allFound: (value) => {
				ended = 'done';
				onGameOver?.(value);
			},
			restarted: () => {
				current = null;
				card = null;
				found = [];
				ended = null;
				exploreHint = engine.mode === 'explore';
				onRestart?.();
			},
			wrong: () => {
				wrongs += 1;
			},
			timer: (fraction) => timerElement?.style.setProperty('--time', fraction.toFixed(4)),
			placeCard
		},
		() => ({
			timer: tuning.timer ?? 30,
			decoys: tuning.decoys ?? 10,
			hint: tuning.hint ?? 0.6,
			snap: tuning.snap ?? 26,
			ramp: tuning.ramp ?? 0.35,
			penalty: tuning.penalty ?? 2,
			drift: tuning.drift ?? 0.6
		})
	);

	// Dev only: lets the headless playtest script find stars (stripped from production builds).
	if (import.meta.env.DEV) (globalThis as { constellationsDebug?: ConstellationEngine }).constellationsDebug = engine;

	const loop = new RafLoop((dt) => {
		pollKeys(dt);
		engine.tick(dt);
	});

	$effect(() => {
		loop.paused = paused;
	});

	$effect(() => {
		engine.reducedMotion = reducedMotion;
	});

	// The lab's `mode` slider switches modes live.
	let tuningMode = untrack(() => tuning.mode);
	$effect(() => {
		const value = tuning.mode;
		if (value === tuningMode) return;
		tuningMode = value;
		untrack(() => setMode(modeOf(value)));
	});

	function start(next: Mode) {
		mode = next;
		current = null;
		card = null;
		found = [];
		ended = null;
		engine.start(next);
		engine.render();
		exploreHint = next === 'explore';
	}

	function setMode(next: Mode) {
		start(next);
		surface()?.focus();
	}

	function again() {
		start(mode);
		surface()?.focus();
	}

	$effect(() => {
		if (!exploreHint) return;
		const timeout = setTimeout(() => (exploreHint = false), 5000);
		return () => clearTimeout(timeout);
	});

	const surface = () => root?.closest<HTMLElement>('[role="application"]') ?? null;

	// ------------------------------------------------------------------ keyboard

	const DIRECTIONS: [GameButton, number, number][] = [
		['left', -1, 0],
		['right', 1, 0],
		['up', 0, -1],
		['down', 0, 1]
	];
	const held: Partial<Record<GameButton, number>> = {};
	let enter = false;

	function pollKeys(dt: number) {
		const focused = document.activeElement === surface();
		for (const [button, dx, dy] of DIRECTIONS) {
			if (input.consume(button)) {
				held[button] = 0;
				if (focused) engine.moveCursor(dx, dy);
			} else if (input.isDown(button) && focused) {
				held[button] = (held[button] ?? 0) + dt;
				if (held[button]! > 0.4) {
					held[button] = 0.4 - 0.11;
					engine.moveCursor(dx, dy);
				}
			}
		}
		const action = input.consume('action');
		if ((action || enter) && focused) engine.action();
		enter = false;
	}

	// ------------------------------------------------------------------ card placement

	function placeCard(box: Box): Rect | null {
		const element = cardElement;
		if (!element || !cardSize.w) return null;
		const { w, h } = cardSize;
		const margin = 12;
		let x: number;
		let y: number;
		// Narrow stages center the card horizontally.
		if (stage.w < 560) x = (stage.w - w) / 2;
		else x = Math.min(Math.max((box.minX + box.maxX) / 2 - w / 2, margin), stage.w - w - margin);
		const below = box.maxY + 26;
		const above = box.minY - 26 - h;
		const right = box.maxX + 30;
		const left = box.minX - 30 - w;
		const side = Math.min(Math.max((box.minY + box.maxY) / 2 - h / 2, margin), stage.h - h - margin);
		// Order: below, beside (wide stages), above (may cover the trace HUD), else the bottom edge.
		if (below + h <= stage.h - margin) y = below;
		else if (stage.w >= 560 && right + w <= stage.w - margin) [x, y] = [right, side];
		else if (stage.w >= 560 && left >= margin) [x, y] = [left, side];
		else if (above >= margin) y = above;
		else y = Math.max(margin, stage.h - h - margin);
		element.style.translate = `${Math.round(x)}px ${Math.round(y)}px`;
		element.dataset.placed = y >= box.maxY ? 'below' : y + h <= box.minY ? 'above' : x >= box.maxX ? 'right' : x + w <= box.minX ? 'left' : 'over';
		return { x, y, w, h };
	}

	// ------------------------------------------------------------------ mount

	function setup(element: HTMLDivElement) {
		const back = background!;
		const front = foreground!;
		const backContext = back.getContext('2d');
		engine.attach(front);
		engine.reducedMotion = reducedMotion;

		const resize = () => {
			const rect = element.getBoundingClientRect();
			if (!rect.width || !rect.height) return;
			const ratio = Math.min(window.devicePixelRatio || 1, 2);
			stage = { w: rect.width, h: rect.height };
			for (const canvas of [back, front]) {
				canvas.width = Math.round(rect.width * ratio);
				canvas.height = Math.round(rect.height * ratio);
			}
			engine.resize(rect.width, rect.height, ratio, backContext);
			if (!started) {
				started = true;
				start(mode);
			}
			engine.render();
		};
		let started = false;
		const observer = new ResizeObserver(resize);
		observer.observe(element);

		const point = (event: PointerEvent): [number, number] => {
			const rect = front.getBoundingClientRect();
			return [event.clientX - rect.left, event.clientY - rect.top];
		};
		const offs = [
			on(front, 'pointerdown', (event) => {
				if (event.button > 0) return;
				front.setPointerCapture(event.pointerId);
				engine.pointerDown(...point(event), event.pointerId, event.pointerType !== 'mouse');
			}),
			on(front, 'pointermove', (event) => engine.pointerMove(...point(event), event.pointerId, event.pointerType !== 'mouse')),
			on(front, 'pointerup', (event) => engine.pointerUp(event.pointerId)),
			on(front, 'pointercancel', (event) => engine.pointerUp(event.pointerId)),
			on(front, 'pointerleave', () => engine.pointerLeave())
		];

		// Tab moves the star cursor (focus leaves at either end of the list); Enter connects like Space.
		const host = surface();
		if (host)
			offs.push(
				on(host, 'keydown', (event) => {
					if (event.target !== host || event.altKey || event.ctrlKey || event.metaKey) return;
					if (event.key === 'Tab' && engine.tabCursor(event.shiftKey)) event.preventDefault();
					else if (event.key === 'Enter' && !event.repeat) {
						event.preventDefault();
						enter = true;
					}
				})
			);

		return () => {
			observer.disconnect();
			for (const off of offs) off();
		};
	}

	function measureCard(element: HTMLElement) {
		const observer = new ResizeObserver(() => {
			cardSize = { w: element.offsetWidth, h: element.offsetHeight };
		});
		observer.observe(element);
		cardSize = { w: element.offsetWidth, h: element.offsetHeight };
		return () => {
			observer.disconnect();
			cardSize = { w: 0, h: 0 };
		};
	}

	// ------------------------------------------------------------------ view helpers

	/** Ragged paper edge, fixed per sign. */
	function ragged(seed: number): string {
		let state = seed * 9301 + 49297;
		const random = () => (state = (state * 9301 + 49297) % 233280) / 233280;
		const points: string[] = [];
		const steps = 14;
		for (let index = 0; index < steps; index++) points.push(`${((index / steps) * 100).toFixed(1)}% ${(random() * 2.2).toFixed(2)}%`);
		for (let index = 0; index < steps; index++) points.push(`${(100 - random() * 1.6).toFixed(2)}% ${((index / steps) * 100).toFixed(1)}%`);
		for (let index = 0; index < steps; index++) points.push(`${(100 - (index / steps) * 100).toFixed(1)}% ${(100 - random() * 2.2).toFixed(2)}%`);
		for (let index = 0; index < steps; index++) points.push(`${(random() * 1.6).toFixed(2)}% ${(100 - (index / steps) * 100).toFixed(1)}%`);
		return `polygon(${points.join(', ')})`;
	}

	const external = (href: string) => /^https?:/.test(href);
	const WHEEL_STEP = 360 / SIGNS.length;

	const polar = (radius: number, angle: number) => `${(60 + radius * Math.cos(angle)).toFixed(2)} ${(60 + radius * Math.sin(angle)).toFixed(2)}`;

	function sector(index: number): string {
		const from = ((index * WHEEL_STEP - 90 - WHEEL_STEP / 2) * Math.PI) / 180;
		const to = from + (WHEEL_STEP * Math.PI) / 180;
		const outer = 56;
		const inner = 30;
		return `M${polar(inner, from)}L${polar(outer, from)}A${outer} ${outer} 0 0 1 ${polar(outer, to)}L${polar(inner, to)}A${inner} ${inner} 0 0 0 ${polar(inner, from)}Z`;
	}

	function glyphAt(index: number): string {
		const angle = ((index * WHEEL_STEP - 90) * Math.PI) / 180;
		return `translate(${(60 + 43 * Math.cos(angle) - 8).toFixed(2)} ${(60 + 43 * Math.sin(angle) - 8).toFixed(2)}) scale(0.16)`;
	}
</script>

<div bind:this={root} class="stars" data-mode={mode} {@attach (element) => untrack(() => setup(element as HTMLDivElement))}>
	<canvas bind:this={background} class="layer" aria-hidden="true"></canvas>
	<canvas bind:this={foreground} class="layer is-input" aria-hidden="true" {@attach loop.attach}></canvas>

	{#if mode === 'trace' && current}
		<div class="round" aria-hidden={ended ? 'true' : undefined}>
			<p class="kicker font-mono tracking-clock uppercase">{m.home_game_stars_find()}</p>
			<p class="name font-display font-black uppercase">
				{#if hint > 0.08}
					<svg class="glyph" viewBox="-8 -8 116 116" aria-hidden="true" style:opacity={0.35 + 0.65 * Math.min(1, hint)}>
						<path d={signPath(current)} />
					</svg>
				{/if}
				<span>{current.name()}</span>
			</p>
			{#key wrongs}
				<div
					bind:this={timerElement}
					class={['timer', wrongs && 'is-hit']}
					role="progressbar"
					aria-label={m.home_game_stars_timer_label()}
					aria-valuemin={0}
					aria-valuemax={100}
				>
					<span></span>
				</div>
			{/key}
			<p class="round-number font-mono tracking-clock tabular-nums">
				<span class="text-cream/60 uppercase">{m.home_game_stars_round()}</span>
				{String(round).padStart(2, '0')}
			</p>
		</div>
	{/if}

	{#if exploreHint && mode === 'explore'}
		<p class="explore-hint font-mono" role="status">{m.home_game_stars_explore_hint()}</p>
	{/if}

	<div class="modes font-mono" role="group" aria-label={m.home_game_stars_mode_label()}>
		<button type="button" aria-pressed={mode === 'trace'} onclick={() => setMode('trace')}>{m.home_game_stars_mode_trace()}</button>
		<button type="button" aria-pressed={mode === 'explore'} onclick={() => setMode('explore')}>{m.home_game_stars_mode_explore()}</button>
	</div>

	<svg class="wheel" viewBox="0 0 120 120" role="img" aria-label={m.home_game_stars_wheel_label({ found: found.length, total: SIGNS.length })}>
		<defs>
			<radialGradient id="stars-wheel-wash" cx="50%" cy="50%" r="50%">
				<stop offset="0.45" stop-color="#fcd772" stop-opacity="0.15" />
				<stop offset="0.85" stop-color="#e2a93b" stop-opacity="0.55" />
				<stop offset="1" stop-color="#e2a93b" stop-opacity="0.2" />
			</radialGradient>
		</defs>
		<circle cx="60" cy="60" r="57" class="wheel-ring" />
		<circle cx="60" cy="60" r="29" class="wheel-ring" />
		{#each SIGNS as sign, index (sign.id)}
			{@const lit = found.includes(sign.id)}
			<path d={sector(index)} class={['wheel-sector', lit && 'is-lit']} />
			<g transform={glyphAt(index)} class={['wheel-glyph', lit && 'is-lit']}><path d={signPath(sign)} /></g>
		{/each}
		<text x="60" y="64" text-anchor="middle" class="wheel-count font-mono">{found.length}/{SIGNS.length}</text>
	</svg>

	{#if card}
		{@const sign = card}
		{@const seed = SIGNS.indexOf(sign) + 3}
		<article
			bind:this={cardElement}
			class="card"
			style:clip-path={ragged(seed)}
			style:rotate="{((seed % 5) - 2) * 0.6}deg"
			aria-labelledby="stars-card-title"
			{@attach measureCard}
			onpointerenter={() => (engine.cardHold = true)}
			onpointerleave={() => (engine.cardHold = false)}
			onfocusin={() => (engine.cardHold = true)}
			onfocusout={() => (engine.cardHold = false)}
		>
			<header>
				<svg class="card-glyph" viewBox="-8 -8 116 116" aria-hidden="true"><path d={signPath(sign)} /></svg>
				<h3 id="stars-card-title" class="font-display font-black uppercase">{sign.name()}</h3>
			</header>
			<p class="note">{sign.note()}</p>
			<footer>
				<a href={sign.href} target={external(sign.href) ? '_blank' : undefined} rel={external(sign.href) ? 'noopener noreferrer' : undefined} class="font-mono"
					>{m.home_game_stars_link({ name: sign.name() })} →</a
				>
				{#if mode === 'trace'}
					<button type="button" class="card-button font-mono" onclick={() => engine.next()}>{m.home_game_stars_next()}</button>
				{:else}
					<button type="button" class="card-close" aria-label={m.home_game_stars_close()} onclick={() => engine.closeCard()}>
						<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"
							><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" fill="none" /></svg
						>
					</button>
				{/if}
			</footer>
		</article>
	{/if}

	{#if ended}
		<div class="ended" role="alert">
			<p class="ended-title font-display font-black uppercase">{ended === 'over' ? m.home_game_stars_over() : m.home_game_stars_all_found()}</p>
			{#if ended === 'over'}<p class="ended-hint">{m.home_game_stars_over_hint()}</p>{/if}
			<p class="font-mono tracking-clock text-butter tabular-nums">{String(score).padStart(6, '0')}</p>
			<button type="button" class="ended-button font-mono" onclick={again}>{m.home_game_stars_again()}</button>
		</div>
	{/if}

	<p class="sr-only" aria-live="polite">{announce}</p>
</div>

<style>
	.stars {
		position: absolute;
		inset: 0;
		overflow: hidden;
		user-select: none;
		-webkit-user-select: none;
		color: var(--color-cream);
	}

	.layer {
		position: absolute;
		inset: 0;
		display: block;
		width: 100%;
		height: 100%;
	}

	.is-input {
		touch-action: none;
		cursor: crosshair;
	}

	/* Trace HUD: kicker, sign name with its silhouette, time bar, round. */
	.round {
		position: absolute;
		top: 0.9rem;
		left: 50%;
		translate: -50% 0;
		display: grid;
		justify-items: center;
		gap: 0.35rem;
		width: min(22rem, 100% - 15rem);
		pointer-events: none;
		text-align: center;
	}

	.kicker {
		font-size: 0.65rem;
		color: color-mix(in oklab, var(--color-cream) 65%, transparent);
	}

	.name {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: clamp(1.05rem, 2.6vw, 1.6rem);
		letter-spacing: 0.12em;
		text-shadow: 0 0 18px color-mix(in oklab, var(--color-butter) 45%, transparent);
	}

	.glyph,
	.card-glyph {
		width: 1.6em;
		height: 1.6em;
		fill: none;
		stroke: var(--color-butter);
		stroke-width: 6;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	.timer {
		--time: 1;
		width: 100%;
		height: 3px;
		border-radius: 3px;
		background: color-mix(in oklab, var(--color-cream) 14%, transparent);
		overflow: hidden;
	}

	.timer span {
		display: block;
		height: 100%;
		transform-origin: left;
		scale: var(--time) 1;
		background: linear-gradient(90deg, var(--color-ochre), var(--color-butter));
		box-shadow: 0 0 10px var(--color-butter);
	}

	.timer.is-hit {
		animation: hit 0.4s ease-out;
	}

	@keyframes hit {
		0%,
		100% {
			translate: 0 0;
		}
		25% {
			translate: -4px 0;
			background: color-mix(in oklab, var(--color-ochre) 60%, transparent);
		}
		60% {
			translate: 3px 0;
		}
	}

	.round-number {
		font-size: 0.65rem;
	}

	@media (max-width: 40rem) {
		.round {
			top: 3.4rem;
			width: calc(100% - 2rem);
		}
	}

	.explore-hint {
		position: absolute;
		top: 1rem;
		left: 50%;
		translate: -50% 0;
		width: min(26rem, 100% - 15rem);
		padding: 0.5rem 0.9rem;
		border-radius: 0.6rem;
		background: color-mix(in oklab, var(--color-ink) 70%, transparent);
		font-size: 0.7rem;
		text-align: center;
		pointer-events: none;
		animation: hint-out 5s ease-in forwards;
	}

	@keyframes hint-out {
		0%,
		80% {
			opacity: 1;
		}
		100% {
			opacity: 0;
		}
	}

	@media (max-width: 40rem) {
		.explore-hint {
			top: 3.4rem;
			width: calc(100% - 2rem);
		}
	}

	/* Mode switch. */
	.modes {
		position: absolute;
		left: 0.75rem;
		bottom: 0.75rem;
		display: flex;
		padding: 0.2rem;
		border-radius: 999px;
		background: color-mix(in oklab, var(--color-ink) 70%, transparent);
		box-shadow: 0 0 0 1px color-mix(in oklab, var(--color-cream) 18%, transparent);
		font-size: 0.68rem;
	}

	.modes button {
		padding: 0.35rem 0.75rem;
		border-radius: 999px;
		color: color-mix(in oklab, var(--color-cream) 70%, transparent);
		cursor: pointer;
		max-width: 9rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	@media (max-width: 40rem) {
		.modes button {
			max-width: 6.5rem;
			padding-inline: 0.6rem;
		}
	}

	.modes button[aria-pressed='true'] {
		background: var(--color-butter);
		color: var(--color-night);
	}

	/* Zodiac wheel. */
	.wheel {
		position: absolute;
		right: 0.75rem;
		bottom: 0.75rem;
		width: 5.75rem;
		height: 5.75rem;
		overflow: visible;
		pointer-events: none;
	}

	@media (max-width: 40rem) {
		.wheel {
			width: 4.5rem;
			height: 4.5rem;
		}
	}

	.wheel-ring {
		fill: color-mix(in oklab, var(--color-ink) 55%, transparent);
		stroke: color-mix(in oklab, var(--color-cream) 25%, transparent);
		stroke-width: 0.8;
	}

	.wheel-sector {
		fill: transparent;
		stroke: color-mix(in oklab, var(--color-cream) 14%, transparent);
		stroke-width: 0.6;
		transition: fill 0.8s ease;
	}

	.wheel-sector.is-lit {
		fill: url(#stars-wheel-wash);
	}

	.wheel-glyph path {
		fill: none;
		stroke: color-mix(in oklab, var(--color-cream) 30%, transparent);
		stroke-width: 7;
		stroke-linecap: round;
		stroke-linejoin: round;
		transition: stroke 0.8s ease;
	}

	.wheel-glyph.is-lit path {
		stroke: var(--color-cream);
	}

	.wheel-count {
		fill: var(--color-cream);
		font-size: 11px;
	}

	/* Paper note card. */
	.card {
		position: absolute;
		top: 0;
		left: 0;
		z-index: 3;
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 0.5rem;
		width: min(17.5rem, 100% - 1.5rem);
		padding: 0.95rem 1.05rem 0.85rem;
		background:
			radial-gradient(circle at 18% 22%, color-mix(in oklab, var(--color-butter) 55%, transparent), transparent 55%),
			radial-gradient(circle at 85% 80%, color-mix(in oklab, var(--color-ochre) 30%, transparent), transparent 60%), var(--color-cream);
		color: var(--color-night);
		filter: drop-shadow(0 12px 24px rgb(14 15 16 / 0.55));
		visibility: hidden;
	}

	.card:global([data-placed]) {
		visibility: visible;
		animation: unfold 0.55s cubic-bezier(0.2, 0.9, 0.25, 1.15) both;
	}

	.card:global([data-placed='above']) {
		transform-origin: 50% 100%;
	}

	.card:global([data-placed='below']) {
		transform-origin: 50% 0;
	}

	.card:global([data-placed='right']) {
		transform-origin: 0 50%;
	}

	.card:global([data-placed='left']) {
		transform-origin: 100% 50%;
	}

	@keyframes unfold {
		from {
			opacity: 0;
			transform: perspective(700px) rotateX(-75deg) scaleY(0.4);
		}
		to {
			opacity: 1;
			transform: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.card:global([data-placed]),
		.timer.is-hit,
		.explore-hint {
			animation: none;
		}
	}

	.card header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.card-glyph {
		stroke: var(--color-night);
		stroke-width: 5;
	}

	.card h3 {
		font-size: 1rem;
		letter-spacing: 0.1em;
	}

	.note {
		display: -webkit-box;
		-webkit-line-clamp: 4;
		line-clamp: 4;
		-webkit-box-orient: vertical;
		overflow: hidden;
		font-size: 0.8rem;
		line-height: 1.35;
	}

	.card footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		font-size: 0.7rem;
	}

	.card a {
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		text-decoration: underline;
		text-decoration-color: var(--color-ochre);
		text-underline-offset: 3px;
	}

	.card-button {
		flex: none;
		padding: 0.3rem 0.7rem;
		border-radius: 999px;
		background: var(--color-night);
		color: var(--color-butter);
		cursor: pointer;
		max-width: 8rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.card-close {
		flex: none;
		display: grid;
		place-items: center;
		width: 1.9rem;
		height: 1.9rem;
		border-radius: 999px;
		cursor: pointer;
	}

	.card-close:hover,
	.card-button:hover {
		filter: brightness(1.15);
	}

	/* End panels. */
	.ended {
		position: absolute;
		inset: 0;
		z-index: 4;
		display: grid;
		place-content: center;
		justify-items: center;
		gap: 0.6rem;
		padding: 1.5rem;
		text-align: center;
		background: radial-gradient(circle, color-mix(in oklab, var(--color-ink) 70%, transparent), color-mix(in oklab, var(--color-ink) 25%, transparent));
		animation: ended-in 0.5s 0.9s ease-out both;
	}

	@keyframes ended-in {
		from {
			opacity: 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.ended {
			animation-duration: 0.01s;
		}
	}

	.ended-title {
		max-width: 28rem;
		font-size: clamp(1.2rem, 3vw, 2rem);
		letter-spacing: 0.08em;
		text-shadow: 0 0 24px color-mix(in oklab, var(--color-butter) 50%, transparent);
	}

	.ended-hint {
		max-width: 26rem;
		font-size: 0.85rem;
		color: color-mix(in oklab, var(--color-cream) 75%, transparent);
	}

	.ended-button {
		margin-top: 0.4rem;
		padding: 0.55rem 1.2rem;
		border-radius: 999px;
		background: var(--color-butter);
		color: var(--color-night);
		box-shadow: 0 0 30px color-mix(in oklab, var(--color-butter) 45%, transparent);
		cursor: pointer;
	}
</style>
