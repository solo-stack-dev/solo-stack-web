<!--
	@component
	Below-the-fold art that waits for the hero's LCP image (`belowFold`, deferred.svelte.ts). Until its tier opens the children
	are not in the DOM; without JS they render from a `<noscript>`. Keep `loading="lazy"` on the images inside as the backstop. The
	children must not affect layout (absolutely positioned or sized by their box), so nothing shifts when they appear.
	`rest`: art further down, which waits for the first tier (the art right below the first screen) to load.

	```svelte
	<DeferredArt><enhanced:img src={plate} alt="" loading="lazy" onload={belowFold.settle} /></DeferredArt>
	<DeferredArt rest><enhanced:img src={poster} alt="" loading="lazy" /></DeferredArt>
	```
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { belowFold } from './deferred.svelte.ts';

	let { children, rest = false }: { children: Snippet; rest?: boolean } = $props();
	$effect(() => belowFold.arm());
</script>

{#if rest ? belowFold.rest : belowFold.ready}
	{@render children()}
{:else}
	<noscript class="deferred-art">{@render children()}</noscript>
{/if}

<style>
	/* Without JS the <noscript> is a real box: keep it out of the layout, so its images sit in the parent as they do with JS */
	@media (scripting: none) {
		.deferred-art {
			display: contents;
		}
	}
</style>
