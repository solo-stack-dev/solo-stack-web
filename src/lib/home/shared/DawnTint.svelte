<!--
	@component
	04:00 → 06:00 seam: keeps the retreating night's wash warm. Where the sunrise's ink wash thins over the butter paper, ink over
	butter mixes to olive grey; this layer recolors that zone (`mix-blend-mode: color`: hue and saturation from ochre, lightness
	from what is below), so the dawn passes ink → umber → ochre → butter and never through olive. Lightness is untouched: the
	ink stays dark, the paper stays light, no band appears.

	Placed in src/routes/+page.svelte between the cinema and the sunrise (zero height in the flow, no pointer events). Static: the
	wash moves under it with the sunrise's own scroll timeline, the layer only recolors whatever is there.

	```svelte
	<Cinema />
	<DawnTint />
	<Sunrise />
	```
-->
<script lang="ts">
	interface Props {
		/** Share of the tinted zone above the boundary (CSS length). Default `22svh`. */
		above?: string;
		/** Tinted zone height (CSS length). Default `110svh`. */
		height?: string;
		/** Strength, 0…1. Default 0.9. */
		strength?: number;
	}

	let { above = '22svh', height = '110svh', strength = 0.9 }: Props = $props();
</script>

<div class="dawn-tint" aria-hidden="true" style:--tint-above={above} style:--tint-height={height} style:--tint-strength={strength}>
	<div class="tint"></div>
</div>

<style>
	/* The blend sits on the root, which is the stacking context: it mixes with everything NightPage painted before it. */
	.dawn-tint {
		position: relative;
		z-index: 2;
		height: 0;
		pointer-events: none;
		mix-blend-mode: color;
	}

	/* Painted soft edges (shared/transitions.ts) top and bottom, so the recolored zone has no visible start or end. */
	.tint {
		position: absolute;
		inset-inline: 0;
		top: calc(var(--tint-above) * -1);
		height: var(--tint-height);
		background: var(--color-ochre);
		opacity: var(--tint-strength);
		mask:
			var(--feather-up) top / 100% 30% repeat-x,
			linear-gradient(transparent 29.5%, #000 29.5% 60.5%, transparent 60.5%),
			var(--feather-down) bottom / 100% 40% repeat-x;
	}
</style>
