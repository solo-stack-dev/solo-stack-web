<!--
	@component
	Section heading with a small monospace index (like the clock labels on the homepage) and a one line description.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	let { id, index, title, description, icon }: { id: string; index: string; title: string; description?: string; icon?: Snippet } = $props();
</script>

<header class="grid gap-1.5">
	<p class="flex items-center gap-2 font-mono text-[0.7rem] tracking-clock text-muted-foreground" aria-hidden="true">
		<span class="text-foreground">{index}</span><span class="h-px w-8 bg-border"></span>
	</p>
	<h2 {id} class="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
		{#if icon}<span class="text-muted-foreground">{@render icon()}</span>{/if}{title}
	</h2>
	{#if description}<p class="max-w-prose text-sm text-muted-foreground sm:text-base">{description}</p>{/if}
</header>
