<!--
	@component
	One explorable object: a button over the art, in canvas percentages. The tooltip is the button's content, so it is
	also the accessible name. Hover, focus and tap show it.
-->
<script lang="ts">
	import type { Spot } from './layout.ts';

	interface Props {
		spot: Spot;
		label: string;
		shown: boolean;
		/** Show the small "tap to explore" ring (touch layouts). */
		marker: boolean;
		onpointerenter: (event: PointerEvent) => void;
		onpointerleave: (event: PointerEvent) => void;
		onfocus: () => void;
		onblur: () => void;
		onclick: () => void;
	}

	let { spot, label, shown, marker, onpointerenter, onpointerleave, onfocus, onblur, onclick }: Props = $props();

	const rect = $derived(spot.rect);
	const glow = $derived(spot.glow ?? spot.rect);
	const tip = $derived(spot.tip ?? { x: 50, y: 0 });
	const dot = $derived(spot.dot === undefined ? { x: 50, y: 50 } : spot.dot);
	const pct = (value: number) => `${value}%`;
</script>

<button
	type="button"
	class="spot"
	class:shown
	data-spot={spot.id}
	style:left={pct(rect.x)}
	style:top={pct(rect.y)}
	style:width={pct(rect.w)}
	style:height={pct(rect.h)}
	{onpointerenter}
	{onpointerleave}
	{onfocus}
	{onblur}
	{onclick}
>
	<span
		class="glow"
		aria-hidden="true"
		style:left={pct(((glow.x - rect.x) / rect.w) * 100)}
		style:top={pct(((glow.y - rect.y) / rect.h) * 100)}
		style:width={pct((glow.w / rect.w) * 100)}
		style:height={pct((glow.h / rect.h) * 100)}
	></span>
	{#if marker && dot}
		<span class="marker" aria-hidden="true" style:left={pct(dot.x)} style:top={pct(dot.y)}></span>
	{/if}
	<span class="tip font-mono" data-align={spot.tipAlign ?? 'center'} style:left={pct(tip.x)} style:top={pct(tip.y)}>{label}</span>
</button>

<style>
	.spot {
		position: absolute;
		z-index: 4;
		padding: 0;
		border: 0;
		background: none;
		cursor: pointer;
		touch-action: manipulation;
		-webkit-tap-highlight-color: transparent;
		border-radius: 1.25rem;
	}

	.spot:focus-visible {
		outline: none;
	}

	.glow {
		position: absolute;
		border-radius: 50%;
		pointer-events: none;
		opacity: 0;
		background: radial-gradient(
			closest-side,
			color-mix(in oklab, var(--color-butter) 34%, transparent),
			color-mix(in oklab, var(--color-butter) 12%, transparent) 55%,
			transparent
		);
		mix-blend-mode: screen;
		transition: opacity 260ms ease;
	}

	.shown .glow {
		opacity: 1;
	}

	/* Keyboard focus: a soft painted ring in addition to the glow, never only color. */
	.spot:focus-visible .glow {
		opacity: 1;
		box-shadow:
			0 0 0 2px color-mix(in oklab, var(--color-butter) 85%, transparent),
			0 0 18px 4px color-mix(in oklab, var(--color-butter) 35%, transparent);
	}

	/* Bonsai and handheld light up via their own layers (golden tree, contour); faint glow only. */
	.spot[data-spot='bonsai'] .glow,
	.spot[data-spot='handheld'] .glow {
		background: radial-gradient(closest-side, color-mix(in oklab, var(--color-butter) 12%, transparent), transparent);
	}

	.tip {
		position: absolute;
		z-index: 1;
		width: max-content;
		max-width: min(16rem, 60vw);
		padding: 0.3rem 0.6rem;
		border-radius: 0.45rem;
		background: var(--color-cream);
		color: var(--color-night);
		font-size: 0.75rem;
		line-height: 1.35;
		text-align: center;
		box-shadow: 0 6px 18px color-mix(in oklab, var(--color-ink) 45%, transparent);
		pointer-events: none;
		opacity: 0;
		translate: -50% calc(-100% - 0.6rem);
		scale: 0.94;
		transform-origin: 50% 100%;
		transition:
			opacity 180ms ease,
			scale 180ms ease;
	}

	.tip[data-align='start'] {
		translate: -1.2rem calc(-100% - 0.6rem);
		transform-origin: 1.2rem 100%;
	}

	.tip[data-align='end'] {
		translate: calc(-100% + 1.2rem) calc(-100% - 0.6rem);
		transform-origin: calc(100% - 1.2rem) 100%;
	}

	.tip::after {
		content: '';
		position: absolute;
		left: 50%;
		bottom: -0.3rem;
		width: 0.6rem;
		height: 0.6rem;
		background: inherit;
		translate: -50% 0;
		rotate: 45deg;
		border-radius: 0 0 0.12rem 0;
	}

	.tip[data-align='start']::after {
		left: 1.2rem;
	}

	.tip[data-align='end']::after {
		left: calc(100% - 1.2rem);
	}

	.shown .tip {
		opacity: 1;
		scale: 1;
	}

	.marker {
		position: absolute;
		width: 1.6rem;
		height: 1.6rem;
		border: 2px solid color-mix(in oklab, var(--color-cream) 85%, transparent);
		border-radius: 50%;
		translate: -50% -50%;
		box-shadow: 0 0 10px color-mix(in oklab, var(--color-butter) 50%, transparent);
		pointer-events: none;
		transition: opacity 200ms ease;
	}

	.shown .marker {
		opacity: 0;
	}

	@media (prefers-reduced-motion: no-preference) {
		.marker {
			animation: ring 2.8s ease-in-out infinite;
		}
	}

	@keyframes ring {
		0%,
		100% {
			scale: 1;
			opacity: 0.85;
		}
		50% {
			scale: 1.18;
			opacity: 0.5;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.glow,
		.tip,
		.marker {
			transition: none;
		}
	}
</style>
