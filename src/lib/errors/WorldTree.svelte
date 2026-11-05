<!--
	@component
	404 scene (Hunter x Hunter homage): the World Tree above a cloud sea before sunrise. A wanderer waits on the top platform, back
	turned; the mascot (yellow backpack) clings to the trunk below.

	Painted layers (assets/error-tree-*.webp, docs/art/errors-404/) composited with CSS. Figures are placed in the tree's own box
	(`tree.ts`) so they stay on the painting at every size. On load the camera pans up the trunk. The tree is a button: each click
	climbs one stop; the last reaches the platform, the wanderer speaks and the sun rises. Reduced motion: no pan or drift, steps kept.
-->
<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import sky from './assets/error-tree-sky.webp?enhanced';
	import tree from './assets/error-tree.webp?enhanced';
	import wanderer from './assets/error-wanderer.webp?enhanced';
	import climber from './assets/error-mascot-climb.webp?enhanced';
	import arrived from './assets/error-mascot-top.webp?enhanced';
	import { CLIMB_STOPS, FIGURE, TOP, TREE_ASPECT } from './tree.ts';

	const LAST = CLIMB_STOPS.length;

	/** 0 … LAST - 1: clinging to that stop; LAST: on the top platform. */
	let step = $state(0);
	/** Index of the climbing line on screen, or -1. */
	let said = $state(-1);
	let saidTimer: ReturnType<typeof setTimeout> | undefined;

	const lines = $derived(m.error_404_climb_steps().split(' | '));
	const atTop = $derived(step >= LAST);
	const stop = $derived.by(() => {
		if (!atTop) return CLIMB_STOPS[step];
		const top = { x: TOP.mascot, y: TOP.y - FIGURE.climber / 2 };
		return { ...top, xSm: top.x, ySm: top.y };
	});

	function climb() {
		if (atTop) return;
		step += 1;
		said = step - 1;
		clearTimeout(saidTimer);
		saidTimer = setTimeout(() => (said = -1), 2400);
	}
</script>

<div class="world-tree" class:is-sunrise={atTop}>
	<!-- Sky plate, the sun behind the cloud sea, light, birds -->
	<div class="sky-layer" aria-hidden="true">
		<enhanced:img class="sky" src={sky} alt="" sizes="100vw" fetchpriority="high" />
		<div class="dawn"></div>
		<div class="rays"></div>
		<div class="horizon"><div class="sun"></div></div>
		<svg class="birds" viewBox="0 0 120 40">
			<g fill="none" stroke="#18191b" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
				<path d="M2 14 Q7 9 11 14 Q15 9 20 14" />
				<path d="M30 6 Q34 2 37 6 Q40 2 44 6" />
				<path d="M26 26 Q30 22 33 26 Q36 22 40 26" />
			</g>
		</svg>
	</div>

	<!-- The tree and everyone on it, in the tree's own box -->
	<div class="stage" style:--aspect={TREE_ASPECT} style:--top-y={TOP.y}>
		<enhanced:img class="tree" src={tree} alt={m.error_404_scene_alt()} sizes="(min-width: 64rem) 60svh, 90vw" />

		<enhanced:img
			class="wanderer"
			src={wanderer}
			alt=""
			sizes="12svh"
			style:left="{TOP.wanderer * 100}%"
			style:top="{TOP.y * 100}%"
			style:height="{FIGURE.wanderer * 100}%"
		/>
		<p class="bubble is-wanderer" class:is-shown={atTop} style:left="{TOP.wanderer * 100}%" style:top="{(TOP.y - FIGURE.wanderer * 0.95) * 100}%" aria-live="polite">
			{#if atTop}{m.error_404_wanderer_line()}{/if}
		</p>

		<enhanced:img
			class="arrived"
			class:is-shown={atTop}
			src={arrived}
			alt=""
			sizes="8svh"
			style:left="{TOP.mascot * 100}%"
			style:top="{TOP.y * 100}%"
			style:height="{FIGURE.mascot * 100}%"
		/>

		<div class="climber" class:is-gone={atTop} style:--x={stop.x} style:--y={stop.y} style:--x-sm={stop.xSm} style:--y-sm={stop.ySm} style:--fig={FIGURE.climber}>
			{#key step}
				<enhanced:img class="climber-img" src={climber} alt="" sizes="8svh" />
			{/key}
			<p class="bubble is-climber" class:is-shown={said >= 0} aria-live="polite">{said >= 0 ? (lines[said] ?? '') : ''}</p>
		</div>

		<button type="button" class="climb" aria-label={m.error_404_climb_label()} aria-disabled={atTop} onclick={climb}></button>
	</div>

	<!-- Cloud sea in front of the trunk -->
	<svg class="veil" viewBox="0 0 1600 300" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
		<defs>
			<filter id="wt-cloud" x="-10%" y="-40%" width="120%" height="180%">
				<feGaussianBlur stdDeviation="14" />
			</filter>
			<linearGradient id="wt-cloud-fill" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stop-color="#fcd772" stop-opacity="0.55" />
				<stop offset="0.45" stop-color="#8f8a7a" stop-opacity="0.7" />
				<stop offset="1" stop-color="#2a3150" />
			</linearGradient>
		</defs>
		<g class="veil-drift" filter="url(#wt-cloud)" fill="url(#wt-cloud-fill)">
			<ellipse cx="120" cy="250" rx="260" ry="70" />
			<ellipse cx="520" cy="270" rx="300" ry="80" />
			<ellipse cx="900" cy="240" rx="240" ry="66" />
			<ellipse cx="1300" cy="262" rx="320" ry="78" />
			<ellipse cx="1720" cy="250" rx="260" ry="70" />
			<ellipse cx="2100" cy="270" rx="300" ry="80" />
			<rect x="-200" y="280" width="2600" height="40" />
		</g>
	</svg>
</div>

<style>
	.world-tree {
		position: absolute;
		inset: 0;
		overflow: hidden;
		background: #141a33;
		/* sun and horizon on the sky plate: object-position keeps this point at the same viewport spot */
		--sun-x: 62%;
		--horizon: 62%;
	}

	/* Sky ------------------------------------------------------------------------------------------------------- */

	.sky-layer {
		position: absolute;
		inset: 0;
	}

	.sky {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: var(--sun-x) var(--horizon);
	}

	.dawn {
		position: absolute;
		inset: 0;
		background: radial-gradient(70% 60% at var(--sun-x) var(--horizon), rgb(252 215 114 / 0.55), rgb(226 169 59 / 0.18) 45%, transparent 75%);
		mix-blend-mode: screen;
		opacity: 0.35;
		transition: opacity 2.4s ease;
	}

	.rays {
		position: absolute;
		inset: -20%;
		background: repeating-conic-gradient(from 0deg at var(--sun-x) var(--horizon), rgb(252 215 114 / 0.22) 0deg 3deg, transparent 3deg 14deg);
		mask: radial-gradient(55% 55% at var(--sun-x) var(--horizon), #000 10%, transparent 70%);
		mix-blend-mode: screen;
		opacity: 0;
		transition: opacity 3s ease 0.6s;
	}

	/* The sun rises from behind the cloud sea: a box that ends at the horizon clips the disc */
	.horizon {
		position: absolute;
		left: 0;
		right: 0;
		top: 0;
		height: var(--horizon);
		overflow: hidden;
	}

	.sun {
		position: absolute;
		left: var(--sun-x);
		bottom: 0;
		width: clamp(4rem, 11vmin, 8rem);
		aspect-ratio: 1;
		border-radius: 50%;
		background: radial-gradient(circle at 50% 45%, #fffaf0, #fbf3dd 35%, #fcd772 70%, #e2a93b);
		box-shadow:
			0 0 2rem 0.6rem rgb(252 215 114 / 0.7),
			0 0 8rem 3rem rgb(226 169 59 / 0.35);
		translate: -50% 85%;
		transition: translate 3.2s cubic-bezier(0.25, 0.7, 0.2, 1);
	}

	.is-sunrise .dawn {
		opacity: 1;
	}

	.is-sunrise .rays {
		opacity: 1;
	}

	.is-sunrise .sun {
		translate: -50% 25%;
		transition-delay: 1.2s;
	}

	.birds {
		position: absolute;
		left: 0;
		top: 30%;
		width: clamp(3rem, 6vw, 5rem);
		opacity: 0.7;
		translate: -10vw 0;
	}

	/* Tree stage ------------------------------------------------------------------------------------------------- */

	/* The tree's own box. Desktop: right of the text, top platform at 20svh. Phones: centered-left, platform near the top. */
	.stage {
		--h: 130svh;
		--platform: 18svh;
		position: absolute;
		top: calc(var(--platform) - var(--top-y) * var(--h));
		right: 8vw;
		height: var(--h);
		aspect-ratio: var(--aspect);
		container-type: size;
	}

	@media (max-width: 63.99rem) {
		.stage {
			--h: 110svh;
			--platform: 15svh;
			right: auto;
			left: 38%;
			translate: -50% 0;
		}
	}

	.tree {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}

	/* Figures stand on the platform: anchored bottom center */
	.wanderer,
	.arrived {
		position: absolute;
		width: auto;
		translate: -50% -100%;
		filter: drop-shadow(0 0 0.6rem rgb(14 15 16 / 0.35));
		transition: filter 3s ease;
	}

	.arrived {
		opacity: 0;
		transition:
			opacity 400ms ease 1500ms,
			filter 3s ease;
	}

	.arrived.is-shown {
		opacity: 1;
	}

	.is-sunrise .wanderer,
	.is-sunrise .arrived {
		filter: drop-shadow(0 0 0.8rem rgb(252 215 114 / 0.45)) brightness(1.08);
	}

	.climber {
		position: absolute;
		left: 0;
		top: 0;
		height: calc(var(--fig) * 100%);
		translate: calc(var(--x) * 100cqw - 50%) calc(var(--y) * 100cqh - 50%);
		transition:
			translate 700ms cubic-bezier(0.5, 0, 0.3, 1),
			opacity 300ms ease 1500ms;
		pointer-events: none;
	}

	@media (max-width: 63.99rem) {
		.climber {
			translate: calc(var(--x-sm) * 100cqw - 50%) calc(var(--y-sm) * 100cqh - 50%);
		}
	}

	.climber.is-gone {
		opacity: 0;
	}

	.climber-img {
		display: block;
		width: auto;
		height: 100%;
	}

	/* the click target: trunk and canopy */
	.climb {
		position: absolute;
		left: 18%;
		right: 18%;
		top: calc(var(--top-y) * 100% - 6%);
		bottom: 30%;
		cursor: pointer;
		border-radius: 2rem;
		-webkit-tap-highlight-color: transparent;
	}

	.climb[aria-disabled='true'] {
		cursor: default;
	}

	.climb:focus-visible {
		outline: 2px dashed var(--color-butter);
		outline-offset: -0.5rem;
	}

	.bubble {
		position: absolute;
		z-index: 1;
		width: max-content;
		max-width: 15rem;
		padding: 0.5rem 0.75rem;
		border-radius: 0.9rem;
		background: var(--color-cream);
		color: var(--color-night);
		font-size: 0.85rem;
		font-weight: 600;
		line-height: 1.3;
		text-wrap: balance;
		box-shadow: 0 0.4rem 1.2rem rgb(14 15 16 / 0.4);
		opacity: 0;
		scale: 0.6;
		pointer-events: none;
		transition:
			opacity 220ms ease,
			scale 340ms cubic-bezier(0.3, 1.6, 0.5, 1);
	}

	.bubble.is-shown {
		opacity: 1;
		scale: 1;
	}

	.is-climber {
		left: 70%;
		bottom: 92%;
		border-bottom-left-radius: 0.2rem;
		transform-origin: 0 100%;
	}

	/* right of his head, so it never leaves the top of the screen */
	.is-wanderer {
		translate: 1.4rem 0;
		max-width: min(14rem, 42vw);
		border-top-left-radius: 0.2rem;
		transform-origin: 0 0;
	}

	.is-wanderer.is-shown {
		transition-delay: 2100ms;
	}

	/* Cloud sea ------------------------------------------------------------------------------------------------- */

	.veil {
		position: absolute;
		left: 0;
		right: 0;
		bottom: -2svh;
		width: 100%;
		height: 22svh;
		pointer-events: none;
		/* thins out towards the text on the left */
		mask: linear-gradient(to right, transparent, #000 45%);
	}

	@media (max-width: 63.99rem) {
		.veil {
			mask: none;
		}
	}

	/* Motion ---------------------------------------------------------------------------------------------------- */

	@media (prefers-reduced-motion: no-preference) {
		/* the camera pans up the trunk; the sky moves less (parallax) */
		.stage {
			animation: pan-tree 2.2s cubic-bezier(0.3, 0.6, 0.2, 1) both;
		}

		.sky-layer {
			animation: pan-sky 2.2s cubic-bezier(0.3, 0.6, 0.2, 1) both;
		}

		.veil {
			animation: pan-veil 2.2s cubic-bezier(0.3, 0.6, 0.2, 1) both;
		}

		.veil-drift {
			animation: drift 60s linear infinite;
		}

		.birds {
			animation: fly 26s linear 3s infinite;
		}

		.climber-img {
			animation: hop 520ms cubic-bezier(0.3, 0.7, 0.4, 1) both;
		}

		/* until the first click: a slow nudge that says "I can climb" */
		.climber:not(.is-gone) .climber-img {
			animation:
				hop 520ms cubic-bezier(0.3, 0.7, 0.4, 1) both,
				nudge 3.2s ease-in-out 2.6s infinite;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.sun,
		.dawn,
		.rays,
		.climber,
		.arrived,
		.bubble {
			transition: none;
		}

		.birds {
			display: none;
		}
	}

	@keyframes pan-tree {
		from {
			translate: 0 -55svh;
		}
	}

	@keyframes pan-sky {
		from {
			translate: 0 -12svh;
		}
	}

	@keyframes pan-veil {
		from {
			translate: 0 -70svh;
		}
	}

	@media (max-width: 63.99rem) {
		@keyframes pan-tree {
			from {
				translate: -50% -55svh;
			}
		}
	}

	@keyframes drift {
		to {
			translate: -38% 0;
		}
	}

	@keyframes fly {
		from {
			translate: -10vw 0;
		}
		to {
			translate: 110vw -6svh;
		}
	}

	@keyframes hop {
		0% {
			translate: 0 10%;
		}
		45% {
			translate: 0 -8%;
		}
	}

	@keyframes nudge {
		0%,
		80%,
		100% {
			translate: 0 0;
		}
		86% {
			translate: 0 -5%;
		}
		92% {
			translate: 0 0;
		}
	}
</style>
