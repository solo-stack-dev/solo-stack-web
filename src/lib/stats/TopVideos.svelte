<!--
	@component
	Period's most watched videos, ranked like a chart show: solid rank numerals stepping down in light, title, and a butter stroke sized by views
	relative to first place. Real videos link to YouTube; mock entries (`mock-…` ids) are plain text.
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
		<li class="group relative grid grid-cols-[2.75rem_minmax(0,1fr)] items-baseline gap-x-3 border-b border-dashed border-foreground/15 py-3.5 last:border-b-0">
			<span class="rank font-display text-5xl leading-none font-black tabular-nums" style:--step={index}>
				<span aria-hidden="true">{index + 1}</span>
				<span class="sr-only">{m.stats_youtube_top_rank({ rank: index + 1 })}</span>
			</span>
			<div class="grid min-w-0 gap-2">
				<p class="line-clamp-2 leading-snug font-semibold text-balance">
					{#if href}<a
							{href}
							target="_blank"
							rel="noopener"
							class="rounded-sm outline-none after:absolute after:inset-0 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)"
							>{video.title}</a
						>{:else}{video.title}{/if}
				</p>
				<!-- Bar, views and length on one column grid: the numbers never wander with the bar end -->
				<div class="meta grid items-center gap-x-3">
					<span class="h-1.5 overflow-hidden rounded-full bg-foreground/[0.06]" aria-hidden="true">
						<span
							class="block h-full rounded-full bg-linear-to-r from-ochre to-butter transition-[width] duration-700 ease-out motion-reduce:transition-none dark:from-butter dark:to-butter/40"
							style:width="{(video.views[period] / max) * 100}%"
						></span>
					</span>
					<span class="text-right font-mono text-xs text-muted-foreground tabular-nums">{m.stats_youtube_top_views({ count: formatNumber(video.views[period]) })}</span>
					<span class="text-right font-mono text-xs text-muted-foreground tabular-nums">{formatDuration(video.durationSeconds)}</span>
				</div>
			</div>
		</li>
	{/each}
</ol>

<style>
	.meta {
		grid-template-columns: minmax(0, 1fr) 7.5rem 2.75rem;
	}

	/* One solid numeral for every place, the light stepping down with the rank */
	.rank {
		color: color-mix(in oklab, #8a5a12, var(--muted-foreground) calc(var(--step) * 25%));
		opacity: calc(1 - var(--step) * 0.08);
	}

	:global(.dark) .rank {
		color: var(--color-butter);
		text-shadow: 0 0 24px rgb(252 215 114 / calc(0.35 - var(--step) * 0.08));
		opacity: calc(1 - var(--step) * 0.12);
	}
</style>
