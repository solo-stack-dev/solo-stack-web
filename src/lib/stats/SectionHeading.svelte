<!--
	@component
	Geist Black over a slightly rotated butter-pigment wash (the homepage's painted bloom), like a highlighter on watercolor paper.
	One-line description below.
-->
<script lang="ts">
	import { avifImageSet, webpUrl } from '#lib/image-set.ts';
	import bloom from '#lib/home/sections/making/assets/making-bloom-chart.webp?w=480&format=avif;webp&quality=40&enhanced';

	let { id, title, description, tilt = -2 }: { id: string; title: string; description?: string; tilt?: number } = $props();
</script>

<header class="grid gap-2">
	<h2 {id} class="heading relative isolate w-fit font-display text-4xl leading-none font-black tracking-wordmark text-balance sm:text-5xl">
		<span
			class="bloom pointer-events-none absolute -left-4 -z-10 block w-[72%] max-w-80 opacity-55 mix-blend-multiply dark:opacity-25 dark:mix-blend-normal"
			style="background-image: {webpUrl(bloom)}; background-image: {avifImageSet(bloom)}"
			style:transform="rotate({tilt}deg)"
			aria-hidden="true"
		></span>{title}
	</h2>
	{#if description}<p class="max-w-prose text-pretty text-muted-foreground sm:text-lg">{description}</p>{/if}
</header>

<style>
	/* The smear sits low on the letters and runs out ~0.35em under the baseline (≈0.78em); the heading box ends there, so the
	   header's 8px gap is measured from the paint, never from the type */
	.heading {
		padding-bottom: 0.15em;
	}

	.bloom {
		top: 0.4em;
		bottom: 0;
		background-size: 100% 100%;
		background-repeat: no-repeat;
	}
</style>
