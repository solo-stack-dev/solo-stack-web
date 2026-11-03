<!--
	@component
	One art-directed variant of the night shift room (desktop 16:9 or mobile portrait). A stage with the art's exact
	aspect ratio is cover-cropped into the section around `layout.focal`; every layer, the live monitor and the
	hotspots are positioned in canvas percentages inside it, so they stay registered at every size.
	NightShift renders both variants; CSS shows one, and lazy images inside the hidden one are never fetched.
-->
<script lang="ts">
	import type { Attachment } from 'svelte/attachments';
	import LazyMount from '#lib/home/shared/LazyMount.svelte';
	import Hotspot from './Hotspot.svelte';
	import Monitor from './Monitor.svelte';
	import { type Rect, type SceneLayout, type SpotId } from './layout.ts';
	import type { Terminal } from './terminal.svelte.ts';

	interface Props {
		variant: 'desktop' | 'mobile';
		layout: SceneLayout;
		terminal: Terminal;
		reduced: boolean;
		/** Show "tap to explore" rings on the hotspots. */
		markers: boolean;
		labels: Record<SpotId, string>;
		sceneAlt: string;
		spotsLabel: string;
		/** First time any hotspot opens (NightShift hides the tap hint). */
		onexplore: () => void;
	}

	let { variant, layout, terminal, reduced, markers, labels, sceneAlt, spotsLabel, onexplore }: Props = $props();

	const pct = (value: number) => `${value}%`;
	const box = (rect: Rect) => `left: ${rect.x}%; top: ${rect.y}%; width: ${rect.w}%; height: ${rect.h}%`;
	/** `sizes` for a layer `w` percent of the stage wide (the stage is ~103vw: cover crop plus parallax overscan). */
	const vw = (w: number) => `${Math.ceil(w * 1.03)}vw`;

	// ── Stage size for the monitor's matrix3d ───────────────────────────────────────────────────────────────
	let stage = $state({ width: 0, height: 0 });
	const measure: Attachment<HTMLElement> = (element) => {
		const observer = new ResizeObserver(([entry]) => {
			if (!entry) return;
			const { width, height } = entry.contentRect;
			if (width !== stage.width || height !== stage.height) stage = { width, height };
		});
		observer.observe(element);
		return () => observer.disconnect();
	};

	// ── Hotspot state: hover, focus and touch pin, dismissable with Escape ─────────────────────────────────
	let hovered = $state<SpotId | null>(null);
	let focused = $state<SpotId | null>(null);
	let pinned = $state<SpotId | null>(null);
	let escaped = $state(false);
	let lastPointer = 'mouse';
	const shown = $derived(escaped ? null : (hovered ?? focused ?? pinned));
	const golden = $derived(shown === 'bonsai');
	const handheldLit = $derived(shown === 'handheld');

	// The golden layer and particle chunk load on the first sign of interest, not with the scene.
	let goldenWanted = $state(false);
	let goldenEver = $state(false);

	$effect(() => {
		if (shown) onexplore();
		if (golden) goldenEver = true;
	});

	function want() {
		goldenWanted = true;
	}

	function onpointerdown(event: PointerEvent) {
		lastPointer = event.pointerType;
		want();
		if (!(event.target as Element).closest('[data-spot]')) pinned = null;
	}

	function onkeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && shown) {
			escaped = true;
			pinned = null;
		}
	}

	function spotHandlers(id: SpotId) {
		return {
			onpointerenter: (event: PointerEvent) => {
				if (event.pointerType !== 'mouse') return;
				escaped = false;
				hovered = id;
			},
			onpointerleave: (event: PointerEvent) => {
				if (event.pointerType === 'mouse' && hovered === id) hovered = null;
			},
			onfocus: () => {
				want();
				escaped = false;
				focused = id;
			},
			onblur: () => {
				if (focused === id) focused = null;
			},
			onclick: () => {
				escaped = false;
				if (lastPointer !== 'mouse') pinned = pinned === id ? null : id;
				lastPointer = 'mouse';
			}
		};
	}

	// The golden tree crossfades with the green one once its image has loaded (the pots are pixel-identical).
	let goldenReady = $state(false);
	const art = $derived(layout.props);
	const goldenOrigin = $derived(`${((layout.bonsai.x - art.golden.x) / art.golden.w) * 100}% ${((layout.bonsai.y - art.golden.y) / art.golden.h) * 100}%`);
	// Particle box around the bonsai, in canvas percentages
	const motesBox = $derived({ x: layout.bonsai.x - 14, y: layout.bonsai.y - 36, w: 24, h: 40 });
	const stageVars = $derived(`--cw: ${layout.canvas.width}; --ch: ${layout.canvas.height}; --fx: ${layout.focal.x}; --fy: ${layout.focal.y}`);
</script>

<svelte:window {onkeydown} />

<!-- Two stacks with identical stage geometry: the masked art below the section heading, the hotspots above it. -->
<div class="scene" data-variant={variant} {onpointerdown} onpointerenter={want} role="presentation" style={stageVars}>
	<div class="frame art" data-feather>
		<div class="stage" {@attach measure}>
			<!-- 1 · opaque scene plate with the mascot painted in (complete static fallback: moonless window, hands at rest). The
			     file also carries the typing hands band below the scene, clipped off here. -->
			<div class="plate" style:--sheet={pct(layout.sheet)}>
				{#if variant === 'desktop'}
					<enhanced:img src="./assets/nightshift-scene.webp?w=1920;1536;1080" alt={sceneAlt} loading="lazy" sizes="103vw" class="sheet" />
				{:else}
					<enhanced:img src="./assets/nightshift-scene-mobile.webp?w=1080;828;640" alt={sceneAlt} loading="lazy" sizes="103vw" class="sheet" />
				{/if}
			</div>

			<span class="lamp" aria-hidden="true" style:left={pct(layout.lamp.x)} style:top={pct(layout.lamp.y)} style:width={pct(layout.lamp.radius * 2)}></span>

			<!-- 3 · typing hands: a window onto the hands band of the SAME plate image (same srcset and sizes, so the same file
			     and decode), showing cell 1…3. Under reduced motion the plate's own hands at rest are frame 1. -->
			{#if !reduced}
				{@const cell = layout.hands.cells[terminal.frame - 1] ?? layout.hands.cells[0]}
				<div class="hands" data-frame={terminal.frame} aria-hidden="true" style={box(layout.hands.rect)}>
					<div class="cell" style:width={pct(layout.hands.image.w)} style:height={pct(layout.hands.image.h)} style:translate="{cell.x}% {cell.y}%">
						{#if variant === 'desktop'}
							<enhanced:img src="./assets/nightshift-scene.webp?w=1920;1536;1080" alt="" loading="lazy" sizes="103vw" class="fill" />
						{:else}
							<enhanced:img src="./assets/nightshift-scene-mobile.webp?w=1080;828;640" alt="" loading="lazy" sizes="103vw" class="fill" />
						{/if}
					</div>
				</div>
			{/if}

			<!-- shiny egg: a soft golden wash over the painted mascot; the egg's sparkle is this element's ::after -->
			<div class="mascot" data-shiny-art aria-hidden="true" style={box(layout.mascot)}></div>

			<Monitor monitor={layout.monitor} {terminal} {stage} blink={!reduced} />

			<!-- 4 · props: bonsai (crossfades to the golden tree), handheld -->
			<div class={['prop', 'bonsai', golden && goldenReady && 'out']} style={box(art.bonsai)}>
				<enhanced:img src="./assets/nightshift-bonsai.webp?w=419;300" alt="" loading="lazy" sizes={vw(art.bonsai.w)} class="fill" />
			</div>
			{#if goldenWanted}
				<div class={['prop', 'golden', golden && goldenReady && 'lit']} style="{box(art.golden)}; transform-origin: {goldenOrigin}">
					<enhanced:img src="./assets/nightshift-bonsai-golden.webp?w=492;350" alt="" sizes={vw(art.golden.w)} class="fill" onload={() => (goldenReady = true)} />
				</div>
			{/if}
			<div class={['prop', 'handheld', handheldLit && 'lit']} style={box(art.handheld)}>
				<enhanced:img src="./assets/nightshift-handheld.webp?w=361;250" alt="" loading="lazy" sizes={vw(art.handheld.w)} class="fill" />
			</div>

			<svg
				class="steam"
				aria-hidden="true"
				viewBox="0 0 60 160"
				preserveAspectRatio="xMidYMax meet"
				style:left={pct(layout.steam.x)}
				style:top={pct(layout.steam.y)}
				style:width={pct(layout.steam.w)}
				style:height={pct(layout.steam.h)}
			>
				<path class="wisp w1" d="M30 160 C 18 135, 42 120, 30 95 S 18 55, 32 30 S 38 8, 28 0" />
				<path class="wisp w2" d="M34 160 C 46 140, 22 118, 36 92 S 46 60, 30 36 S 22 10, 34 0" />
				<path class="wisp w3" d="M26 160 C 20 140, 36 126, 26 104 S 14 70, 28 48" />
			</svg>

			{#if goldenEver && !reduced}
				<div class="motes" style:left={pct(motesBox.x)} style:top={pct(motesBox.y)} style:width={pct(motesBox.w)} style:height={pct(motesBox.h)}>
					<LazyMount
						load={() => import('./GoldenParticles.svelte')}
						props={{ active: golden, origin: { x: ((layout.bonsai.x - motesBox.x) / motesBox.w) * 100, y: ((layout.bonsai.y - motesBox.y) / motesBox.h) * 100 } }}
						class="motes-slot"
						rootMargin="0px"
					/>
				</div>
			{/if}

			{#if art.foreground}
				<div class="prop foreground" style={box(art.foreground)}>
					<enhanced:img src="./assets/nightshift-foreground.webp?w=255" alt="" loading="lazy" sizes={vw(art.foreground.w)} class="fill" />
				</div>
			{/if}

			<div class="dust" aria-hidden="true" style:left={pct(layout.lamp.x - 4)} style:top={pct(layout.lamp.y - 6)}>
				{#each { length: 7 } as _, index (index)}
					<span style:--i={index}></span>
				{/each}
			</div>
		</div>
	</div>

	<div class="frame ui">
		<div class="stage">
			<div class="spots" role="group" aria-label={spotsLabel}>
				{#each layout.spots as spot (spot.id)}
					<Hotspot {spot} label={labels[spot.id]} shown={shown === spot.id} marker={markers} {...spotHandlers(spot.id)} />
				{/each}
			</div>
		</div>
	</div>
</div>

<style>
	/* No stacking context here, so the art (z 1) sits below and the hotspots (z 7) above the section heading (z 6). */
	.scene {
		position: absolute;
		inset: 0;
	}

	.frame {
		position: absolute;
		inset: 0;
		overflow: hidden;
		container-type: size;
	}

	.art {
		z-index: 1;
		/* painted soft edges into the night above and below (NightPage [data-feather]); ~14 % of the section height */
		--feather-top: min(14svh, 7.9vw);
		--feather-bottom: min(16svh, 9vw);
	}

	@media (max-aspect-ratio: 4/5) {
		.art {
			--feather-top: min(9svh, 19.5vw);
			--feather-bottom: min(10svh, 21.7vw);
		}
	}

	/* Framing: the lit room is seen out of the dark instead of floating in the open sky. A night-ink vignette (painted
	   soft edges top and bottom, a wide soft falloff at the sides) over the whole art, inside its feathered mask, so
	   the room sinks into darkness before it dissolves into the sky; the page's mist banks drift over the edges. */
	.art::after {
		content: '';
		position: absolute;
		z-index: 5;
		inset: 0;
		background: var(--color-ink);
		opacity: 0.9;
		pointer-events: none;
		mask:
			var(--feather-down) top / 100% 34% no-repeat,
			var(--feather-up) bottom / 100% 30% no-repeat,
			radial-gradient(ellipse 70% 90% at 50% 50%, transparent 55%, #000 100%);
	}

	.ui {
		z-index: 7;
		pointer-events: none;
	}

	.stage {
		--ar: calc(var(--cw) / var(--ch));
		/* overscan so the pointer parallax never reveals an edge */
		--w: calc(max(100cqw, 100cqh * var(--ar)) * 1.03);
		--h: calc(var(--w) / var(--ar));
		position: absolute;
		width: var(--w);
		height: var(--h);
		left: calc((100cqw - var(--w)) * var(--fx));
		top: calc((100cqh - var(--h)) * var(--fy));
		translate: calc(var(--px, 0) * -6px) calc(var(--py, 0) * -4px);
	}

	.plate {
		position: absolute;
		inset: 0;
		overflow: hidden;
	}

	.plate :global(.sheet) {
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: var(--sheet);
		max-width: none;
		pointer-events: none;
		user-select: none;
	}

	.stage :global(.fill) {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		max-width: none;
		pointer-events: none;
		user-select: none;
	}

	/* Cropped layers, placed in canvas percentages by layout.ts */
	.prop,
	.mascot {
		position: absolute;
		pointer-events: none;
	}

	/* ── lamp light: very subtle flicker ── */
	.lamp {
		position: absolute;
		aspect-ratio: 1;
		translate: -50% -50%;
		border-radius: 50%;
		background: radial-gradient(
			closest-side,
			color-mix(in oklab, var(--color-butter) 20%, transparent),
			color-mix(in oklab, var(--color-butter) 7%, transparent) 55%,
			transparent
		);
		mix-blend-mode: screen;
		pointer-events: none;
	}

	/* ── golden tree egg: crossfade to the grown golden canopy, which grows out of the (identical) pot ── */
	.bonsai {
		transition: opacity 600ms ease;
	}

	.bonsai.out {
		opacity: 0;
	}

	.golden {
		opacity: 0;
		scale: 0.94;
		transition:
			opacity 600ms ease,
			scale 1400ms cubic-bezier(0.2, 0.8, 0.2, 1);
	}

	.golden.lit {
		opacity: 1;
		scale: 1;
	}

	.motes {
		position: absolute;
		z-index: 3;
		pointer-events: none;
	}

	.motes :global(.motes-slot) {
		width: 100%;
		height: 100%;
	}

	/* ── typing hands: the window steps between the cells per frame (no transition) ── */
	.hands {
		position: absolute;
		overflow: hidden;
		pointer-events: none;
	}

	.cell {
		position: absolute;
		left: 0;
		top: 0;
	}

	/* ── shiny egg (docs/HOMEPAGE-DEV.md §11): the mascot is part of the plate, so instead of the egg's filter fallback a
	   radial gold wash warms just the area around the mascot. Soft light keeps the painting's values (a color blend
	   muddied the skin, screen looked hazy); the egg's sparkle is this element's ::after. ── */
	.mascot::before {
		content: '';
		display: none;
		position: absolute;
		inset: 0;
		background: radial-gradient(
			closest-side,
			color-mix(in oklab, var(--color-ochre) 85%, transparent),
			color-mix(in oklab, var(--color-ochre) 45%, transparent) 55%,
			transparent
		);
		mix-blend-mode: soft-light;
	}

	:global([data-shiny]) .mascot::before {
		display: block;
	}

	/* ── handheld contour on hover/focus ── */
	.handheld {
		transition: filter 240ms ease;
	}

	.handheld.lit {
		filter: drop-shadow(0 0 1.5px color-mix(in oklab, var(--color-butter) 95%, transparent))
			drop-shadow(0 0 10px color-mix(in oklab, var(--color-butter) 55%, transparent));
	}

	/* ── steam ── */
	.steam {
		position: absolute;
		z-index: 3;
		overflow: visible;
		pointer-events: none;
		filter: blur(2.5px);
	}

	.wisp {
		fill: none;
		stroke: color-mix(in oklab, var(--color-cream) 42%, transparent);
		stroke-width: 5;
		stroke-linecap: round;
		stroke-dasharray: 44 70;
		opacity: 0.5;
	}

	.w2 {
		stroke-width: 4;
		stroke-dasharray: 36 80;
		stroke-dashoffset: 40;
	}

	.w3 {
		stroke-width: 6;
		stroke-dasharray: 30 90;
		stroke-dashoffset: 70;
		opacity: 0.35;
	}

	/* ── 5 · foreground leaf and dust in the lamp light: strongest parallax (the art contract allows ±6 px for the leaf) ── */
	.foreground {
		z-index: 3;
		translate: calc(var(--px, 0) * -6px) calc(var(--py, 0) * -4px);
	}

	.dust {
		position: absolute;
		z-index: 3;
		width: 12%;
		aspect-ratio: 1;
		pointer-events: none;
		translate: calc(var(--px, 0) * -18px) calc(var(--py, 0) * -10px);
	}

	.dust span {
		position: absolute;
		left: calc(10% + var(--i) * 12%);
		top: calc(30% + mod(var(--i) * 37, 50) * 1%);
		width: 3px;
		height: 3px;
		border-radius: 50%;
		background: color-mix(in oklab, var(--color-butter) 55%, transparent);
		box-shadow: 0 0 6px color-mix(in oklab, var(--color-butter) 60%, transparent);
		opacity: 0.4;
	}

	.spots {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	.spots > :global(.spot) {
		pointer-events: auto;
	}

	/* ── autonomous motion: only with motion allowed; NightShift pauses it off screen ([data-live]) ── */
	@media (prefers-reduced-motion: no-preference) {
		.lamp {
			animation: flicker 7.3s linear infinite;
		}

		.wisp {
			animation: rise 5.2s linear infinite;
		}

		.w2 {
			animation-duration: 6.4s;
			animation-delay: -2.1s;
		}

		.w3 {
			animation-duration: 7.6s;
			animation-delay: -4.3s;
		}

		.steam {
			animation: sway 9s ease-in-out infinite alternate;
		}

		.dust span {
			animation: float calc(9s + var(--i) * 1.3s) ease-in-out calc(var(--i) * -2.1s) infinite alternate;
		}
	}

	@keyframes flicker {
		0%,
		100% {
			opacity: 1;
		}
		7% {
			opacity: 0.86;
		}
		8% {
			opacity: 0.97;
		}
		31% {
			opacity: 0.93;
		}
		47% {
			opacity: 1;
		}
		62% {
			opacity: 0.88;
		}
		63% {
			opacity: 0.99;
		}
		81% {
			opacity: 0.94;
		}
	}

	@keyframes rise {
		from {
			stroke-dashoffset: 0;
		}
		to {
			stroke-dashoffset: -228;
		}
	}

	@keyframes sway {
		from {
			transform: skewX(-4deg);
		}
		to {
			transform: skewX(5deg);
		}
	}

	@keyframes float {
		from {
			transform: translate(0, 0);
			opacity: 0.15;
		}
		50% {
			opacity: 0.6;
		}
		to {
			transform: translate(14px, -28px);
			opacity: 0.2;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.golden,
		.golden.lit {
			transition: none;
			scale: none;
		}

		.bonsai,
		.handheld {
			transition: none;
		}
	}
</style>
