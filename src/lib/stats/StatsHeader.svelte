<!--
	@component
	Page header: monospace eyebrow, display heading, intro, the mock data notice and the data date. A soft painted moon
	(CSS only) glows behind it: butter on the paper theme, a night moon in the dark theme.
-->
<script lang="ts">
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { m } from '#lib/paraglide/messages.js';
	import { formatLongDate } from './format.ts';
	import type { Stats } from './schema.ts';

	let { stats }: { stats: Stats } = $props();
</script>

<header class="relative isolate grid gap-6">
	<div class="moon pointer-events-none absolute -top-16 -right-24 -z-10 size-72 sm:-top-20 sm:right-0 sm:size-96" aria-hidden="true"></div>

	<p class="flex items-center gap-2.5 font-mono text-xs tracking-clock text-muted-foreground uppercase">
		<span class="size-2 rounded-full bg-(--chart-accent) shadow-[0_0_12px_var(--chart-wash)]" aria-hidden="true"></span>{m.stats_eyebrow()}
	</p>
	<h1 class="max-w-3xl font-display text-5xl leading-[0.95] font-black tracking-wordmark text-balance sm:text-7xl">{m.stats_title()}</h1>
	<p class="max-w-xl text-base text-pretty text-muted-foreground sm:text-lg">{m.stats_intro()}</p>

	<div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
		{#if stats.source === 'mock'}
			<p class="flex items-start gap-2.5 rounded-lg bg-butter/35 px-3 py-2 text-foreground ring-1 ring-ochre/40 sm:items-center dark:bg-butter/10 dark:ring-butter/25">
				<Badge class="shrink-0 rounded-md bg-night font-mono text-[0.65rem] tracking-wider text-cream uppercase dark:bg-butter dark:text-night"
					>{m.stats_mock_badge()}</Badge
				>
				<span>{m.stats_mock_note()}</span>
			</p>
		{/if}
		<p class="font-mono text-xs text-muted-foreground">
			<time datetime={stats.asOf}>{m.stats_as_of({ date: formatLongDate(new Date(stats.asOf)) })}</time>
		</p>
	</div>
</header>

<style>
	/* A watercolor moon: soft bleeding edge, a little granulation from layered gradients. No images, no JS. */
	.moon {
		border-radius: 50%;
		background:
			radial-gradient(circle at 38% 36%, rgb(255 250 230 / 0.9), transparent 42%), radial-gradient(circle at 60% 62%, rgb(226 169 59 / 0.28), transparent 55%),
			radial-gradient(circle at 50% 50%, rgb(252 215 114 / 0.75) 0 46%, rgb(252 215 114 / 0.25) 58%, transparent 70%);
		filter: blur(2px);
		opacity: 0.75;
	}

	:global(.dark) .moon {
		background:
			radial-gradient(circle at 42% 40%, rgb(255 250 232 / 0.32), transparent 34%),
			radial-gradient(circle at 50% 50%, rgb(252 215 114 / 0.2) 0 36%, rgb(252 215 114 / 0.07) 52%, transparent 68%);
		opacity: 1;
	}
</style>
