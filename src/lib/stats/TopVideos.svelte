<!--
	@component
	Most watched videos in the period, ranked like a chart show: big outlined rank numerals, the title, and a butter
	pigment stroke whose length is the views relative to first place. Real videos link to YouTube; mock entries
	(`mock-…` ids) are plain text.
-->
<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { formatDuration, formatNumber } from './format.ts';
	import type { Period, TopVideo } from './schema.ts';

	let { videos, period, limit = 5 }: { videos: TopVideo[]; period: Period; limit?: number } = $props();

	const ranked = $derived(videos.toSorted((a, b) => b.views[period] - a.views[period]).slice(0, limit));
	const max = $derived(Math.max(1, ...ranked.map((video) => video.views[period])));
</script>

<ol class="grid">
	{#each ranked as video, index (video.id)}
		{@const href = video.id.startsWith('mock-') ? null : `https://www.youtube.com/watch?v=${video.id}`}
		<li class="group relative grid grid-cols-[3.25rem_minmax(0,1fr)] items-center gap-x-3 border-b border-dashed border-foreground/15 py-3 last:border-b-0">
			<span class="rank font-display text-5xl leading-none font-black tabular-nums" data-first={index === 0 || undefined}>
				<span aria-hidden="true">{index + 1}</span>
				<span class="sr-only">{m.stats_youtube_top_rank({ rank: index + 1 })}</span>
			</span>
			<div class="grid min-w-0 gap-1.5">
				<p class="line-clamp-2 leading-snug font-semibold text-balance">
					{#if href}<a {href} target="_blank" rel="noopener" class="after:absolute after:inset-0 hover:underline">{video.title}</a>{:else}{video.title}{/if}
				</p>
				<div class="flex items-center gap-3">
					<span
						class="h-1.5 rounded-full bg-linear-to-r from-ochre to-butter transition-[width] duration-700 ease-out motion-reduce:transition-none dark:from-butter dark:to-butter/40"
						style:width="{(video.views[period] / max) * 70}%"
						aria-hidden="true"
					></span>
					<span class="shrink-0 font-mono text-[0.7rem] text-muted-foreground tabular-nums"
						>{m.stats_youtube_top_views({ count: formatNumber(video.views[period]) })}</span
					>
					<span class="ml-auto shrink-0 font-mono text-[0.7rem] text-muted-foreground">{formatDuration(video.durationSeconds)}</span>
				</div>
			</div>
		</li>
	{/each}
</ol>

<style>
	.rank {
		color: transparent;
		-webkit-text-stroke: 1.5px color-mix(in oklab, var(--foreground) 45%, transparent);
	}

	.rank[data-first] {
		color: var(--color-butter);
		-webkit-text-stroke: 1.5px var(--color-ochre);
	}

	:global(.dark) .rank[data-first] {
		-webkit-text-stroke: 0;
		text-shadow: 0 0 24px rgb(252 215 114 / 0.35);
	}
</style>
