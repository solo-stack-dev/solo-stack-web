<!--
	@component
	Monochrome platform logo (Simple Icons path, `currentColor`), decorative. Brand guidelines allow single color logos.
-->
<script lang="ts">
	import type { SocialId } from '#lib/home/data/socials.ts';
	import { ICON_VIEWBOX, SOCIAL_ICONS } from '#lib/home/sections/radio/icons.ts';

	let { id, class: className = 'size-4' }: { id: SocialId; class?: string } = $props();
</script>

<svg viewBox={ICON_VIEWBOX} class={className} aria-hidden="true" focusable="false"><path d={SOCIAL_ICONS[id]} fill="currentColor" /></svg>
