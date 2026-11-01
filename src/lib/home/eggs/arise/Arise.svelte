<!--
	@component
	Egg: ARISE (mockup 01-mascot-easter-eggs/06). Three ink shadow figures rise from the bottom of the viewport,
	stand for a moment, then dissolve into droplets that drift upwards (~4.8 s). They paint over the content (every
	section has opaque painted art, so behind it they would vanish) but under the paper grain. Reduced motion: the figures only fade in and out in place. Escape cancels (Eggs.svelte).
	Each figure is its own composited layer; the ragged ink filter is rasterized once, only transform/opacity animate.
-->
<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import type { EggProps } from '../events.ts';
	import { calmFade } from '../fade.ts';
	import { FIGURE_PATH, FIGURE_VIEWBOX, createFigures } from './figures.ts';

	let { reducedMotion, ondone }: EggProps = $props();

	const TOTAL = $derived(reducedMotion ? 3600 : 4800);
	const uid = $props.id();
	const figures = createFigures(window.matchMedia('(max-width: 47.99rem), (max-aspect-ratio: 4/5)').matches);
	const KEYS = ['↑', '↑', '↓', '↓', '←', '→', '←', '→', 'B', 'A'];

	$effect(() => {
		const timer = setTimeout(ondone, TOTAL + 400);
		return () => clearTimeout(timer);
	});
</script>

<div class="arise" class:still={reducedMotion} aria-hidden="true" {@attach reducedMotion && calmFade(TOTAL)} style:--total="{TOTAL}ms">
	<svg class="defs" width="0" height="0">
		<filter id="{uid}-ink" x="-0.1" y="-0.05" width="1.2" height="1.1">
			<feTurbulence type="fractalNoise" baseFrequency="0.03 0.018" numOctaves="3" seed="11" result="noise" />
			<feDisplacementMap in="SourceGraphic" in2="noise" scale="26" xChannelSelector="R" yChannelSelector="G" />
		</filter>
	</svg>

	{#each figures as figure, index (index)}
		<div class="figure" style:left="{figure.x}%" style:height="{figure.height * 100}vh" style:--lean="{figure.lean}deg" style:--delay="{figure.delay}ms">
			<svg viewBox={FIGURE_VIEWBOX} preserveAspectRatio="xMidYMax meet" class:mirror={figure.mirror}>
				<path d={FIGURE_PATH} filter="url(#{uid}-ink)" fill-opacity={figure.ink} />
				{#each figure.drops as drop, dropIndex (dropIndex)}
					<circle class="drop" cx={drop.x} cy={drop.y} r={drop.r} style:--dx="{drop.dx}px" style:--dy="{drop.dy}px" />
				{/each}
			</svg>
		</div>
	{/each}
</div>

<div class="title" class:still={reducedMotion} aria-hidden="true" {@attach reducedMotion && calmFade(TOTAL)} style:--total="{TOTAL}ms">
	<p class="word">{m.egg_arise_title()}</p>
	<p class="keys">
		{#each KEYS as key, index (index)}<span>{key}</span>{/each}
	</p>
</div>

<style>
	.arise {
		position: fixed;
		inset: 0;
		z-index: 2;
		overflow: hidden;
		pointer-events: none;
	}

	.defs {
		position: absolute;
	}

	.figure {
		position: absolute;
		bottom: -2vh;
		aspect-ratio: 240 / 640;
		translate: -50% 0;
		rotate: var(--lean);
		transform-origin: 50% 100%;
		opacity: 0;
		will-change: transform, opacity;
		animation: arise-figure var(--total) var(--delay) cubic-bezier(0.25, 0.8, 0.3, 1) forwards;
	}

	.figure svg {
		display: block;
		width: 100%;
		height: 100%;
		overflow: visible;
		fill: var(--color-ink);
		/* Butter rim so the ink still reads on the dark night sky */
		filter: drop-shadow(0 0 0.9rem color-mix(in oklab, var(--color-butter) 38%, transparent));
	}

	.mirror {
		scale: -1 1;
	}

	.drop {
		opacity: 0;
		animation: arise-drop var(--total) var(--delay) ease-out forwards;
	}

	.title {
		position: fixed;
		z-index: 2;
		left: clamp(1.25rem, 7vw, 7rem);
		top: 38vh;
		pointer-events: none;
		color: var(--color-cream);
		opacity: 0;
		animation: arise-title var(--total) ease-out forwards;
	}

	.word {
		margin: 0;
		font-family: var(--font-display);
		font-size: clamp(3.5rem, 13vw, 12rem);
		font-weight: 900;
		line-height: 0.9;
		letter-spacing: var(--tracking-wordmark);
		text-transform: uppercase;
		white-space: nowrap;
		text-shadow: 0 0.04em 0.3em color-mix(in oklab, var(--color-ink) 70%, transparent);
	}

	.keys {
		display: flex;
		gap: 0.7em;
		margin: 1.2rem 0 0 0.3rem;
		font-family: var(--font-mono);
		font-size: 0.8rem;
		letter-spacing: var(--tracking-clock);
		opacity: 0.75;
	}

	@keyframes arise-figure {
		0% {
			opacity: 0;
			transform: translateY(100%);
		}
		6% {
			opacity: 1;
		}
		30% {
			transform: translateY(0);
		}
		68% {
			opacity: 1;
			transform: translateY(-1%) scaleY(1.01);
		}
		100% {
			opacity: 0;
			transform: translateY(-6%) scaleY(1.05);
		}
	}

	@keyframes arise-drop {
		0%,
		64% {
			opacity: 0;
			translate: 0 0;
		}
		72% {
			opacity: 0.9;
		}
		100% {
			opacity: 0;
			translate: var(--dx) var(--dy);
		}
	}

	@keyframes arise-title {
		0%,
		6% {
			opacity: 0;
			transform: translateY(0.6rem);
		}
		22% {
			opacity: 1;
			transform: none;
		}
		72% {
			opacity: 1;
		}
		100% {
			opacity: 0;
		}
	}

	/* Reduced motion: no rising, no drifting; the finished scene fades in and out in place (calmFade on the roots) */
	.still .figure,
	.title.still {
		animation: none;
		opacity: 1;
	}

	.still .drop {
		animation: none;
		opacity: 0;
	}
</style>
