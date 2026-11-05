<!--
	@component
	Egg: crescent slash (mockup 01-mascot-easter-eggs/04). An ink crescent sweeps across the viewport, holds, and fades.
	SVG geometry revealed by a mask stroke; only stroke-dashoffset, transform, opacity animate. Never mounted under
	reduced motion (Eggs.svelte).
-->
<script lang="ts">
	import type { EggProps } from '../events.ts';
	import { VIEW_H, VIEW_W, createSlash } from './slash.ts';

	let { ondone }: EggProps = $props();

	const SWEEP = 620;
	const TOTAL = 1800;
	const uid = $props.id();
	const slash = createSlash();
	// Mirror now and then so it does not always fly the same way
	const flip = Math.random() < 0.35;

	$effect(() => {
		const timer = setTimeout(ondone, TOTAL);
		return () => clearTimeout(timer);
	});
</script>

<div class="slash" aria-hidden="true" style:--sweep="{SWEEP}ms" style:--total="{TOTAL}ms">
	<svg viewBox="0 0 {VIEW_W} {VIEW_H}" preserveAspectRatio="xMidYMid slice" class:flip>
		<defs>
			<mask id="{uid}-reveal" maskUnits="userSpaceOnUse" x="-200" y="-200" width={VIEW_W + 400} height={VIEW_H + 400}>
				<path class="reveal" d={slash.spine} pathLength="1" fill="none" stroke="#fff" stroke-width="300" stroke-linecap="round" />
			</mask>
		</defs>
		<g mask="url(#{uid}-reveal)">
			{#each slash.rims as d, index (index)}
				<path class="rim" {d} />
			{/each}
			<path class="ink" d={slash.body} />
			{#each slash.strands as d, index (index)}
				<path class="ink strand" {d} />
			{/each}
		</g>
		{#each slash.drops as drop, index (index)}
			<circle class="drop" cx={drop.x} cy={drop.y} r={drop.r} style:--delay="{Math.round(drop.t * SWEEP * 0.9)}ms" />
		{/each}
	</svg>
</div>

<style>
	.slash {
		position: fixed;
		inset: 0;
		z-index: 2;
		pointer-events: none;
		animation: slash-fade var(--total) linear forwards;
	}

	svg {
		width: 100%;
		height: 100%;
		overflow: visible;
		/* Butter edge glow so the ink reads on the dark sky; own layer, so the filter is composited. */
		filter: drop-shadow(0 0 2px color-mix(in oklab, var(--color-butter) 75%, transparent)) drop-shadow(0 0 14px color-mix(in oklab, var(--color-butter) 40%, transparent));
		will-change: transform;
	}

	.flip {
		scale: -1 1;
	}

	.reveal {
		stroke-dasharray: 1 1;
		stroke-dashoffset: 1;
		animation: slash-sweep var(--sweep) cubic-bezier(0.6, 0.05, 0.3, 1) forwards;
	}

	.ink {
		fill: var(--color-ink);
	}

	.strand {
		opacity: 0.75;
	}

	.rim {
		fill: var(--color-butter);
		opacity: 0.8;
	}

	.drop {
		fill: var(--color-ink);
		transform-box: fill-box;
		transform-origin: center;
		scale: 0;
		animation: slash-drop 360ms var(--delay) cubic-bezier(0.2, 1.6, 0.4, 1) forwards;
	}

	@keyframes slash-sweep {
		to {
			stroke-dashoffset: 0;
		}
	}

	@keyframes slash-drop {
		to {
			scale: 1;
		}
	}

	@keyframes slash-fade {
		0%,
		58% {
			opacity: 1;
			translate: 0 0;
		}
		100% {
			opacity: 0;
			translate: 0 1.5vh;
		}
	}
</style>
