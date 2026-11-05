<!--
	@component
	Geist Black over a slightly rotated butter-pigment wash (the homepage's painted bloom), like a highlighter on watercolor paper.
	One-line description below.
-->
<script lang="ts">
	import bloom from '#lib/home/sections/making/assets/making-bloom-chart.webp?w=480&format=webp&quality=40&enhanced';

	let { id, title, description, tilt = -2 }: { id: string; title: string; description?: string; tilt?: number } = $props();
</script>

<header class="grid gap-2">
	<div class="relative isolate w-fit">
		<span
			class="bloom pointer-events-none absolute top-[38%] -left-4 -z-10 block h-[105%] w-[72%] max-w-80 opacity-55 mix-blend-multiply dark:opacity-25 dark:mix-blend-normal"
			style:background-image="url({bloom.img.src})"
			style:transform="rotate({tilt}deg)"
			aria-hidden="true"
		></span>
		<h2 {id} class="font-display text-4xl leading-none font-black tracking-wordmark text-balance sm:text-5xl">{title}</h2>
	</div>
	{#if description}<p class="max-w-prose text-pretty text-muted-foreground sm:text-lg">{description}</p>{/if}
</header>

<style>
	.bloom {
		background-size: 100% 100%;
		background-repeat: no-repeat;
	}
</style>
