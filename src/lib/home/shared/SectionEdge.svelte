<!--
	@component
	Watercolor-ish ragged edge so a section bleeds into its neighbor instead of meeting at a straight line.
	Renders a strip filled with `fill` (any CSS background) and masks it with a generated ragged SVG edge (a seeded
	noise line, displaced and softened, plus a lighter pigment band). Place it inside a `position: relative` section.

	- `position="top"`: the strip sits above the section's top edge (overlapping the previous section by `height`,
	  minus `overlap` pulled inside), ragged side up. Paint it with this section's own base color.
	- `position="bottom"`: mirrored, below the section's bottom edge.
	- `edge`: one of the shared painted watercolor masks (1 wet blooms, 2 dry brush, 3 diagonal bleed; materials.ts),
	  oriented for `position` automatically. Without `edge`/`mask` the generated SVG edge is used (the fallback).
	- `mask`: URL of any other painted edge mask (PNG/WebP alpha, opaque = visible), used as is (no auto orientation).
	- `mirror`: flip the strip horizontally (also flips `children`), to vary a reused edge.
	- `children`: content rendered inside the masked strip instead of `fill` (e.g. a painted texture layer).

	```svelte
	<section class="relative">
		<SectionEdge position="top" fill="var(--color-ink)" height="7rem" seed={4} />
		<SectionEdge position="bottom" fill="var(--color-ink)" height="8rem" edge={3} mirror />
		…
	</section>
	```
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { EDGE_MASKS, type EdgeMask } from './materials.ts';

	interface Props {
		position?: 'top' | 'bottom';
		/** CSS background of the strip. Default `currentColor`. */
		fill?: string;
		/** Strip height (CSS length). Default `6rem`. */
		height?: string;
		/** How far the strip reaches into its own section (CSS length). Default `1px` to hide seams. */
		overlap?: string;
		/** Seed of the generated edge. Use a different one per section so edges never repeat. Default 1. */
		seed?: number;
		/** Amplitude multiplier of the ragged line, 0…2. Default 1. */
		roughness?: number;
		/** Shared painted edge mask (1…3), oriented for `position`. Replaces the generated mask. */
		edge?: EdgeMask;
		/** Custom painted mask image URL, used as is (replaces the generated mask). */
		mask?: string;
		/** Mirror the strip horizontally. */
		mirror?: boolean;
		children?: Snippet;
		class?: string;
	}

	let {
		position = 'top',
		fill = 'currentColor',
		height = '6rem',
		overlap = '1px',
		seed = 1,
		roughness = 1,
		edge,
		mask,
		mirror = false,
		children,
		class: className = ''
	}: Props = $props();

	const WIDTH = 1200;
	const HEIGHT = 120;

	function edgePath(seedValue: number, amplitude: number, offset: number, top: boolean): string {
		let a = (seedValue * 2654435761) >>> 0;
		const random = () => {
			a = (a + 0x6d2b79f5) >>> 0;
			let t = Math.imul(a ^ (a >>> 15), a | 1);
			t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
			return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
		};
		const phases = [random(), random(), random()].map((p) => p * Math.PI * 2);
		const points: string[] = [];
		const steps = 48;
		for (let index = 0; index <= steps; index++) {
			const x = (index / steps) * WIDTH;
			const u = index / steps;
			const wave = Math.sin(u * 5 + phases[0]) * 0.5 + Math.sin(u * 13 + phases[1]) * 0.3 + Math.sin(u * 29 + phases[2]) * 0.2;
			const jitter = (random() - 0.5) * 0.35;
			const y = HEIGHT * 0.5 + offset + (wave + jitter) * HEIGHT * 0.32 * amplitude;
			points.push(`${x.toFixed(1)},${(top ? y : HEIGHT - y).toFixed(1)}`);
		}
		const closing = top ? `L${WIDTH},${HEIGHT} L0,${HEIGHT} Z` : `L${WIDTH},0 L0,0 Z`;
		return `M${points.join(' L')} ${closing}`;
	}

	const generatedMask = $derived.by(() => {
		const top = position === 'top';
		const svg =
			`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${WIDTH} ${HEIGHT}' preserveAspectRatio='none'>` +
			`<filter id='w' x='-5%' y='-20%' width='110%' height='140%'>` +
			`<feTurbulence type='fractalNoise' baseFrequency='0.012 0.09' numOctaves='3' seed='${seed}'/>` +
			`<feDisplacementMap in='SourceGraphic' scale='22'/><feGaussianBlur stdDeviation='1.4'/></filter>` +
			`<g filter='url(#w)' fill='white'>` +
			`<path opacity='0.45' d='${edgePath(seed, roughness * 1.2, -HEIGHT * 0.12 * (top ? 1 : -1), top)}'/>` +
			`<path d='${edgePath(seed + 1, roughness, 0, top)}'/></g></svg>`;
		return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
	});

	// Painted masks are "opaque above"; a top strip needs the flipped one (opaque towards its own section, below).
	const painted = $derived(edge ? EDGE_MASKS[edge][position === 'top' ? 'up' : 'down'] : mask);
	const maskImage = $derived(painted ? `url("${painted}")` : generatedMask);
</script>

<div
	aria-hidden="true"
	class={['section-edge', position === 'top' ? 'is-top' : 'is-bottom', mirror && 'is-mirrored', className]}
	style:--edge-height={height}
	style:--edge-overlap={overlap}
	style:--edge-mask={maskImage}
	style:background={children ? undefined : fill}
>
	{@render children?.()}
</div>

<style>
	.section-edge {
		position: absolute;
		left: 0;
		right: 0;
		height: var(--edge-height);
		pointer-events: none;
		z-index: 1;
		-webkit-mask-image: var(--edge-mask);
		mask-image: var(--edge-mask);
		-webkit-mask-size: 100% 100%;
		mask-size: 100% 100%;
		-webkit-mask-repeat: no-repeat;
		mask-repeat: no-repeat;
	}

	.is-top {
		bottom: calc(100% - var(--edge-overlap));
	}

	.is-bottom {
		top: calc(100% - var(--edge-overlap));
	}

	.is-mirrored {
		scale: -1 1;
	}
</style>
