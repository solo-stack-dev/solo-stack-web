<!--
	@component
	A station logo (24×24 path from icons.ts / stations.ts), single color via `currentColor`, decorative.
-->
<script lang="ts">
	import { ICON_VIEWBOX } from './icons.ts';

	interface Props {
		path: string;
		class?: string;
	}

	let { path, class: className = '' }: Props = $props();
</script>

<svg viewBox={ICON_VIEWBOX} class={className} aria-hidden="true" focusable="false"><path d={path} fill="currentColor" /></svg>
