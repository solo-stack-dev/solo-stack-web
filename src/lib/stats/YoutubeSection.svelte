<!--
	@component
	YouTube detail: four channel numbers as a scoreboard between ink rules, then daily views (columns of light) beside top videos.
-->
<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { LAST_DAY, changeOf, dateAt, sumOf } from './derive.ts';
	import Delta from './Delta.svelte';
	import { formatDuration, formatHours, formatNumber, formatSigned } from './format.ts';
	import type { Period, Stats } from './schema.ts';
	import TopVideos from './TopVideos.svelte';
	import ViewsColumns from './ViewsColumns.svelte';

	let { stats, period }: { stats: Stats; period: Period } = $props();

	const youtube = $derived(stats.platforms.find((platform) => platform.id === 'youtube'));
	const subscribers = $derived(youtube ? changeOf(youtube.followers, period) : null);
	const views = $derived(sumOf(stats.youtube.views, period));
	const watch = $derived(sumOf(stats.youtube.watchMinutes, period));
	const average = $derived.by(() => {
		const current = views.value ? (watch.value * 60) / views.value : 0;
		const previous = views.previous ? (watch.previous * 60) / views.previous : 0;
		return { value: current, ratio: previous ? (current - previous) / previous : 0 };
	});

	const rows = $derived(
		Array.from({ length: period }, (_, offset) => LAST_DAY - period + 1 + offset).map((day) => ({ date: dateAt(stats.asOf, day), views: stats.youtube.views[day] }))
	);
</script>

<div class="grid gap-12">
	<div class="grid gap-3">
		<dl class="grid grid-cols-2 border-y border-foreground/15 lg:grid-cols-4">
			{#if subscribers}
				{@render figure(m.stats_youtube_subscribers(), formatNumber(subscribers.value), subscribers.ratio, formatSigned(subscribers.delta))}
			{/if}
			{@render figure(m.stats_youtube_views(), formatNumber(views.value), views.ratio)}
			{@render figure(m.stats_youtube_watch_time(), m.stats_unit_hours({ value: formatHours(watch.value) }), watch.ratio)}
			{@render figure(m.stats_youtube_avg_duration(), formatDuration(average.value), average.ratio)}
		</dl>
		<p class="text-xs text-muted-foreground">{m.stats_delta_previous({ days: period })}</p>
	</div>

	<div class="grid gap-12 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-14">
		<figure class="grid content-start gap-4">
			<figcaption class="font-semibold">{m.stats_youtube_views_chart()}</figcaption>
			<ViewsColumns {rows} class="h-64 w-full sm:h-72" />
		</figure>
		<div class="grid content-start gap-2">
			<h3 class="font-semibold">{m.stats_youtube_top_title()}</h3>
			<TopVideos videos={stats.youtube.topVideos} {period} />
		</div>
	</div>
</div>

{#snippet figure(label: string, value: string, ratio: number, amount?: string)}
	<div
		class="grid content-start gap-2 border-foreground/15 py-5 not-first:border-l max-lg:nth-3:border-l-0 max-lg:nth-[n+3]:border-t sm:py-6 [&:not(:first-child)]:pl-4 sm:[&:not(:first-child)]:pl-6 max-lg:[&:nth-child(3)]:pl-0 max-lg:sm:[&:nth-child(3)]:pl-0"
	>
		<dt class="text-xs text-muted-foreground sm:text-sm">{label}</dt>
		<dd class="font-display text-3xl leading-none font-black tracking-tight tabular-nums sm:text-5xl">{value}</dd>
		<dd><Delta {ratio} {amount} /></dd>
	</div>
{/snippet}
