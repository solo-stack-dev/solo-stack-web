<!--
	@component
	Most watched videos in the period, ranked, with a thin bar relative to the first place. Real videos link to YouTube;
	mock entries (`mock-…` ids) are plain text.
-->
<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { formatDuration, formatNumber } from './format.ts';
	import type { Period, TopVideo } from './schema.ts';

	let { videos, period, limit = 5 }: { videos: TopVideo[]; period: Period; limit?: number } = $props();

	const ranked = $derived(videos.toSorted((a, b) => b.views[period] - a.views[period]).slice(0, limit));
	const max = $derived(Math.max(1, ...ranked.map((video) => video.views[period])));
</script>

<ol class="grid gap-1">
	{#each ranked as video, index (video.id)}
		{@const href = video.id.startsWith('mock-') ? null : `https://www.youtube.com/watch?v=${video.id}`}
		<li class="relative grid grid-cols-[2rem_1fr] gap-x-2 rounded-lg px-2 py-2.5 transition-colors hover:bg-muted/60">
			<!-- aria-label is ignored on a plain span: the rank is read from the sr-only text, the "01" is decoration -->
			<span class="pt-0.5 font-mono text-xs text-muted-foreground tabular-nums">
				<span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
				<span class="sr-only">{m.stats_youtube_top_rank({ rank: index + 1 })}</span>
			</span>
			<div class="grid min-w-0 gap-1.5">
				<p class="line-clamp-2 text-sm leading-snug font-medium text-balance">
					{#if href}<a {href} target="_blank" rel="noopener" class="after:absolute after:inset-0 hover:underline">{video.title}</a>{:else}{video.title}{/if}
				</p>
				<div class="h-1 overflow-hidden rounded-full bg-muted" aria-hidden="true">
					<div class="h-full rounded-full bg-(--chart-accent)" style:width="{(video.views[period] / max) * 100}%"></div>
				</div>
				<p class="flex justify-between gap-2 text-xs text-muted-foreground tabular-nums">
					<span>{m.stats_youtube_top_views({ count: formatNumber(video.views[period]) })}</span>
					<span class="font-mono">{formatDuration(video.durationSeconds)}</span>
				</p>
			</div>
		</li>
	{/each}
</ol>
