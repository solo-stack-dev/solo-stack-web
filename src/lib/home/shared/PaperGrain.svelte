<!--
	@component
	Watercolor paper grain. A tiny SVG `feTurbulence` tile used as a repeating background, rasterized once by the
	browser, so it costs nothing while scrolling. `pointer-events: none`, `aria-hidden`.

	NightPage already renders one fixed grain over the whole page. Use extra instances only for local texture
	(e.g. a stronger grain on a paper card): `<PaperGrain fixed={false} opacity={0.12} />` inside a positioned parent.
	Swap in the painted grain tile from Phase 1 via `src`.
-->
<script lang="ts">
	interface Props {
		/** 0…1. Default 0.07. */
		opacity?: number;
		/** `position: fixed` over the viewport (default) or `absolute` over the positioned parent. */
		fixed?: boolean;
		/** Optional painted grain tile (imported asset URL). Replaces the generated noise. */
		src?: string;
		/** Tile size in px. Default 220. */
		size?: number;
		/** CSS `mix-blend-mode`. Default `normal` (cheapest). */
		blend?: 'normal' | 'soft-light' | 'overlay' | 'multiply' | 'screen';
		class?: string;
	}

	let { opacity = 0.07, fixed = true, src, size = 220, blend = 'normal', class: className = '' }: Props = $props();

	const noise =
		`<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'>` +
		`<filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/>` +
		`<feColorMatrix values='0 0 0 0 0.98 0 0 0 0 0.95 0 0 0 0 0.87 0 0 0 1.6 -0.55'/></filter>` +
		`<rect width='100%' height='100%' filter='url(#g)'/></svg>`;
	const generated = `url("data:image/svg+xml,${encodeURIComponent(noise)}")`;
</script>

<div
	aria-hidden="true"
	class={['paper-grain', fixed ? 'fixed' : 'absolute', className]}
	style:opacity
	style:mix-blend-mode={blend}
	style:background-image={src ? `url("${src}")` : generated}
	style:background-size="{size}px {size}px"
></div>

<style>
	.paper-grain {
		inset: 0;
		pointer-events: none;
		background-repeat: repeat;
	}
</style>
