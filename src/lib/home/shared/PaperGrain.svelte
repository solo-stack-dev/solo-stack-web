<!--
	@component
	Watercolor paper grain as a repeating background tile: decoded once, free while scrolling.

	Default: the painted grain (docs/art/shared/paper-grain.png → two-tone cream/ink alpha tile, 10 kB lossless WebP),
	which reads on night and on butter paper with `normal` blending. `texture="generated"`: SVG `feTurbulence` noise.

	NightPage renders one fixed grain over the page. Extra instances only for local texture, e.g.
	`<PaperGrain fixed={false} opacity={0.12} />` inside a positioned parent.
-->
<script lang="ts">
	import { PAPER_GRAIN } from './materials.ts';

	interface Props {
		/** 0…1. Default 0.07. */
		opacity?: number;
		/** `position: fixed` over the viewport (default) or `absolute` over the positioned parent. */
		fixed?: boolean;
		/** Built-in tile: the painted grain (default) or the generated SVG noise. Ignored when `src` is set. */
		texture?: 'painted' | 'generated';
		/** Custom grain tile (imported asset URL). */
		src?: string;
		/** Tile size in px. Default: the tile's native size (painted 256, generated 220). */
		size?: number;
		/** CSS `mix-blend-mode`. Default `normal` (cheapest). */
		blend?: 'normal' | 'soft-light' | 'overlay' | 'multiply' | 'screen';
		class?: string;
	}

	let { opacity = 0.07, fixed = true, texture = 'painted', src, size, blend = 'normal', class: className = '' }: Props = $props();

	const noise =
		`<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'>` +
		`<filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/>` +
		`<feColorMatrix values='0 0 0 0 0.98 0 0 0 0 0.95 0 0 0 0 0.87 0 0 0 1.6 -0.55'/></filter>` +
		`<rect width='100%' height='100%' filter='url(#g)'/></svg>`;
	const generated = `url("data:image/svg+xml,${encodeURIComponent(noise)}")`;

	const image = $derived(src ? `url("${src}")` : texture === 'painted' ? `url("${PAPER_GRAIN.src}")` : generated);
	const tile = $derived(size ?? (src ? 220 : texture === 'painted' ? PAPER_GRAIN.size : 220));
</script>

<div
	aria-hidden="true"
	class={['paper-grain', fixed ? 'fixed' : 'absolute', className]}
	style:opacity
	style:mix-blend-mode={blend}
	style:background-image={image}
	style:background-size="{tile}px {tile}px"
></div>

<style>
	.paper-grain {
		inset: 0;
		pointer-events: none;
		background-repeat: repeat;
	}
</style>
