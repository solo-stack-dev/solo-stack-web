<!--
	@component
	A ragged watercolor band over the boundary between two sections, so straight art edges dissolve into the sky and
	the page reads as one landscape. Placed by the page between two sections (src/routes/+page.svelte), never inside a
	section folder. Zero height in the flow; the band is painted above both neighbors and takes no pointer events.

	The band is filled with `var(--sky-now)` by default: the exact color the global sky has at the current scroll
	position (NightPage), so where the band covers open sky it is invisible and only hides edges of art. Its upper and
	lower borders are the shared painted edge masks (materials.ts).

	```svelte
	<Hero />
	<Seam height="10rem" above={0.3} top={3} bottom={1} />
	<Making />
	```
-->
<script lang="ts">
	import { EDGE_MASKS, type EdgeMask } from './materials.ts';

	interface Props {
		/** Band height (CSS length). Default `9rem`. */
		height?: string;
		/** Share of the band above the boundary, 0…1. Default 0.5 (centered). */
		above?: number;
		/** Painted edge of the band's upper border (1 wet blooms, 2 dry brush, 3 diagonal bleed). Default 1. */
		top?: EdgeMask;
		/** Painted edge of the band's lower border. Default 3. */
		bottom?: EdgeMask;
		/** Mirror the band horizontally, to vary reused edges. */
		mirror?: boolean;
		/** CSS background of the band. Default: the live sky color. */
		fill?: string;
		class?: string;
	}

	let { height = '9rem', above = 0.5, top = 1, bottom = 3, mirror = false, fill = 'var(--sky-now, var(--color-night))', class: className = '' }: Props = $props();

	// Upper half: transparent above → opaque (the flipped mask); lower half: opaque → transparent below. The halves
	// overlap by 2 % so their resampled opaque rows never leave a hairline at the center.
	const mask = $derived(`url("${EDGE_MASKS[top].up}") top / 100% 51% no-repeat, url("${EDGE_MASKS[bottom].down}") bottom / 100% 51% no-repeat`);
</script>

<div class={['seam', className]} aria-hidden="true">
	<div class={['band', mirror && 'is-mirrored']} style:--seam-height={height} style:--seam-above={above} style:--seam-mask={mask} style:background={fill}></div>
</div>

<style>
	.seam {
		position: relative;
		z-index: 2;
		height: 0;
		pointer-events: none;
	}

	.band {
		position: absolute;
		left: 0;
		right: 0;
		top: calc(var(--seam-height) * var(--seam-above) * -1);
		height: var(--seam-height);
		-webkit-mask: var(--seam-mask);
		mask: var(--seam-mask);
	}

	.is-mirrored {
		scale: -1 1;
	}
</style>
