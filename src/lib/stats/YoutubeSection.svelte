<!--
	@component
	YouTube in detail: four channel numbers, views per day (lazy LayerChart) and the most watched videos.
-->
<script lang="ts">
	import * as Card from '#lib/components/ui/card/index.js';
	import LazyMount from '#lib/home/shared/LazyMount.svelte';
	import { m } from '#lib/paraglide/messages.js';
	import { LAST_DAY, changeOf, dateAt, sumOf } from './derive.ts';
	import Delta from './Delta.svelte';
	import { formatDuration, formatHours, formatNumber, formatSigned } from './format.ts';
	import type { Period, Stats } from './schema.ts';
	import Sparkline from './Sparkline.svelte';
	import TopVideos from './TopVideos.svelte';

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
	const note = $derived(m.stats_delta_previous({ days: period }));

	const rows = $derived(
		Array.from({ length: period }, (_, offset) => LAST_DAY - period + 1 + offset).map((day) => ({ date: dateAt(stats.asOf, day), views: stats.youtube.views[day] }))
	);
</script>

<div class="grid gap-4">
	<Card.Root class="py-0">
		<dl class="grid grid-cols-2 gap-px bg-border lg:grid-cols-4 [&>div]:bg-card">
			{#if subscribers}
				<div class="grid gap-1.5 p-4 sm:p-5">
					<dt class="text-xs font-medium text-muted-foreground">{m.stats_youtube_subscribers()}</dt>
					<dd class="text-2xl font-semibold tracking-tight sm:text-3xl">{formatNumber(subscribers.value)}</dd>
					<dd><Delta ratio={subscribers.ratio} amount={formatSigned(subscribers.delta)} /></dd>
				</div>
			{/if}
			<div class="grid gap-1.5 p-4 sm:p-5">
				<dt class="text-xs font-medium text-muted-foreground">{m.stats_youtube_views()}</dt>
				<dd class="text-2xl font-semibold tracking-tight sm:text-3xl">{formatNumber(views.value)}</dd>
				<dd><Delta ratio={views.ratio} /></dd>
			</div>
			<div class="grid gap-1.5 p-4 sm:p-5">
				<dt class="text-xs font-medium text-muted-foreground">{m.stats_youtube_watch_time()}</dt>
				<dd class="text-2xl font-semibold tracking-tight sm:text-3xl">{m.stats_unit_hours({ value: formatHours(watch.value) })}</dd>
				<dd><Delta ratio={watch.ratio} /></dd>
			</div>
			<div class="grid gap-1.5 p-4 sm:p-5">
				<dt class="text-xs font-medium text-muted-foreground">{m.stats_youtube_avg_duration()}</dt>
				<dd class="font-mono text-2xl font-semibold tracking-tight sm:text-3xl">{formatDuration(average.value)}</dd>
				<dd><Delta ratio={average.ratio} /></dd>
			</div>
		</dl>
		<p class="border-t border-border px-4 py-2 text-xs text-muted-foreground sm:px-5">{note}</p>
	</Card.Root>

	<div class="grid gap-4 lg:grid-cols-5">
		<Card.Root class="lg:col-span-3">
			<Card.Header>
				<Card.Title class="font-semibold">{m.stats_youtube_views_chart()}</Card.Title>
			</Card.Header>
			<Card.Content class="flex-1 px-2 sm:px-4">
				<LazyMount load={() => import('./ViewsChart.svelte')} props={{ rows }} class="h-56 w-full sm:h-64 lg:h-full lg:min-h-64">
					{#snippet fallback()}
						<Sparkline values={rows.map((row) => row.views)} zero class="mt-2 ml-10 h-[calc(100%-2.5rem)] opacity-60" />
					{/snippet}
				</LazyMount>
			</Card.Content>
		</Card.Root>
		<Card.Root class="lg:col-span-2">
			<Card.Header>
				<Card.Title class="font-semibold">{m.stats_youtube_top_title()}</Card.Title>
			</Card.Header>
			<Card.Content class="px-2 sm:px-3">
				<TopVideos videos={stats.youtube.topVideos} {period} />
			</Card.Content>
		</Card.Root>
	</div>
</div>
