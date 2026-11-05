<!--
	@component
	Hidden `<svg>` with one `<symbol>` per logo, used via `<use>` by BrandIcon and the dial marks. Rendered once by
	Radio.svelte. Not `display: none`, so every browser resolves the symbols.
-->
<script lang="ts">
	import { ICON_VIEWBOX, SOCIAL_ICONS, iconId } from './icons.ts';
	import type { Station } from './stations.ts';

	let { stations }: { stations: readonly Station[] } = $props();
</script>

<svg width="0" height="0" style="position: absolute; overflow: hidden" aria-hidden="true" focusable="false">
	{#each stations as station (station.id)}
		<symbol id={iconId(station.id)} viewBox={ICON_VIEWBOX}><path d={SOCIAL_ICONS[station.id]} fill="currentColor" /></symbol>
	{/each}
</svg>
