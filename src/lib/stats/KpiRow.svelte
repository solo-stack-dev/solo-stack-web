<!--
	@component
	The four headline numbers for the period. The first (total reach) is the page's one hero figure.
-->
<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { changeOf, newOf, periodSlice, sumOf, totalFollowers } from './derive.ts';
	import Delta from './Delta.svelte';
	import { formatHours, formatNumber, formatSigned } from './format.ts';
	import type { Period, Stats } from './schema.ts';
	import Sparkline from './Sparkline.svelte';

	let { stats, period }: { stats: Stats; period: Period } = $props();

	const total = $derived(totalFollowers(stats));
	const reach = $derived(changeOf(total, period));
	const fresh = $derived(newOf(total, period));
	const views = $derived(sumOf(stats.youtube.views, period));
	const watch = $derived(sumOf(stats.youtube.watchMinutes, period));
	const note = $derived(m.stats_delta_previous({ days: period }));
</script>

<dl class="grid grid-cols-2 gap-3 lg:grid-cols-5">
	<div
		class="relative col-span-2 grid gap-4 overflow-hidden rounded-xl bg-[color-mix(in_oklab,var(--color-butter)_32%,var(--card))] p-5 ring-1 ring-ochre/30 sm:grid-cols-[auto_1fr] sm:items-end sm:gap-6 sm:p-6 dark:bg-[color-mix(in_oklab,var(--color-butter)_7%,var(--card))] dark:ring-butter/15"
	>
		<div class="grid gap-1">
			<dt class="text-xs font-medium">{m.stats_kpi_reach()}</dt>
			<dd class="text-5xl font-bold tracking-tight sm:text-6xl">{formatNumber(reach.value)}</dd>
			<dd class="text-xs text-muted-foreground">{m.stats_kpi_reach_hint({ count: stats.platforms.length })}</dd>
		</div>
		<dd class="grid gap-2">
			<Sparkline values={periodSlice(total, period)} label={m.stats_sparkline_label({ days: period })} class="h-14 sm:h-16" />
			<Delta ratio={reach.ratio} amount={formatSigned(reach.delta)} />
		</dd>
	</div>

	{@render tile(m.stats_kpi_new(), formatSigned(fresh.value), fresh.ratio)}
	{@render tile(m.stats_kpi_views(), formatNumber(views.value), views.ratio)}
	{@render tile(m.stats_kpi_watch_time(), m.stats_unit_hours({ value: formatHours(watch.value) }), watch.ratio, 'col-span-2 sm:col-span-1')}
</dl>

{#snippet tile(label: string, value: string, ratio: number, extra = '')}
	<div class="grid content-between gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10 sm:p-5 {extra}">
		<dt class="text-xs font-medium text-muted-foreground">{label}</dt>
		<div class="grid gap-2">
			<dd class="text-2xl font-semibold tracking-tight sm:text-3xl">{value}</dd>
			<dd><Delta {ratio} {note} class="[&>span:last-child]:basis-full" /></dd>
		</div>
	</div>
{/snippet}
