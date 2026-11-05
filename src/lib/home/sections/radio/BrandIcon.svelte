<!--
	@component
	Decorative station logo in `currentColor`. Uses the BrandIconSprite `<symbol>`, so each path ships once in the HTML.
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
