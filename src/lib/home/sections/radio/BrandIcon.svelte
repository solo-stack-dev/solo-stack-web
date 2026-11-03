<!--
	@component
	A station logo, single color via `currentColor`, decorative. Draws the `<symbol>` from BrandIconSprite (rendered once
	by Radio.svelte), so each path ships once in the HTML however often the logo appears.
-->
<script lang="ts">
	import { ICON_VIEWBOX, iconHref } from './icons.ts';
	import type { StationId } from './stations.ts';

	interface Props {
		id: StationId;
		class?: string;
	}

	let { id, class: className = '' }: Props = $props();
</script>

<svg viewBox={ICON_VIEWBOX} class={className} aria-hidden="true" focusable="false"><use href={iconHref(id)} /></svg>
