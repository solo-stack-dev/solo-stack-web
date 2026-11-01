<!--
	@component
	The Hunter emblem as a drawn SVG: a thick Λ crossed by a thin V, with the red diamond where they overlap, and serifs on
	every end. `sticker` adds the fat cream die-cut outline. Purely decorative (aria-hidden); the caller labels it.
-->
<script lang="ts">
	interface Props {
		sticker?: boolean;
		class?: string;
	}

	let { sticker = false, class: className = '' }: Props = $props();

	// 120 × 84 box. Λ legs from the apex (60, 8) to (24, 76) / (96, 76); V legs from (24, 8) / (96, 8) to (60, 76).
	const thick = 'M60 8 L24 76 M60 8 L96 76';
	const thin = 'M24 8 L60 76 M96 8 L60 76';
	const serifs = 'M12 8 H36 M48 8 H72 M84 8 H108 M12 76 H36 M48 76 H72 M84 76 H108';
	// Inside both: bounded by the Λ above y 42 and by the V below it (the legs cross at (42, 42) and (78, 42)).
	const diamond = 'M60 8 L42 42 L60 76 L78 42 Z';
</script>

<svg class="hunter-emblem {className}" viewBox="-6 -6 132 96" aria-hidden="true">
	{#if sticker}
		<g stroke="#fbf3dd" stroke-linecap="round" stroke-linejoin="round" fill="#fbf3dd">
			<path d={thick} stroke-width="24" />
			<path d={thin} stroke-width="18" />
			<path d={serifs} stroke-width="16" />
		</g>
	{/if}
	<path d={diamond} fill="#c8233a" />
	<g fill="none" stroke="#0e0f10" stroke-linecap="butt">
		<path d={thick} stroke-width="11" />
		<path d={thin} stroke-width="3.2" />
		<path d={serifs} stroke-width="3.6" />
	</g>
</svg>

<style>
	.hunter-emblem {
		display: block;
		overflow: visible;
	}
</style>
