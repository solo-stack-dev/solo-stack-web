<!--
	@component
	Follower growth over the selected period, total or per platform. The LayerChart chart loads lazily when the card
	comes near the viewport; until then (and without JS) a static SVG line of the same data holds the space.
-->
<script lang="ts">
	import * as Card from '#lib/components/ui/card/index.js';
	import * as ToggleGroup from '#lib/components/ui/toggle-group/index.js';
	import LazyMount from '#lib/home/shared/LazyMount.svelte';
	import { getSocial } from '#lib/home/data/socials.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { LAST_DAY, SERIES_COLOR, SERIES_KEYS, dateAt, seriesValues, totalFollowers, type GrowthRow, type SeriesKey } from './derive.ts';
	import { formatNumber, formatWeekday } from './format.ts';
	import type { Period, Stats } from './schema.ts';
	import Sparkline from './Sparkline.svelte';

	let { stats, period }: { stats: Stats; period: Period } = $props();

	let view = $state<'total' | 'platforms'>('total');

	const total = $derived(totalFollowers(stats));
	const rows = $derived<GrowthRow[]>(
		Array.from({ length: period + 1 }, (_, offset) => {
			const day = LAST_DAY - period + offset;
			return { date: dateAt(stats.asOf, day), total: total[day], ...seriesValues(stats, day) };
		})
	);

	const seriesLabel = (key: SeriesKey) => (key === 'other' ? m.stats_growth_other() : getSocial(key).name);
	const tableColumns = $derived<SeriesKey[]>(view === 'platforms' ? [...SERIES_KEYS] : []);
</script>

<Card.Root class="gap-0 py-0">
	<Card.Header class="flex flex-col gap-4 border-b border-border py-5 sm:flex-row sm:items-start sm:justify-between">
		<div class="grid gap-1">
			<Card.Title class="text-lg font-semibold tracking-tight">{m.stats_growth_title()}</Card.Title>
			<Card.Description>{m.stats_growth_description({ days: period })}</Card.Description>
		</div>
		<ToggleGroup.Root
			type="single"
			variant="outline"
			size="sm"
			spacing={0}
			value={view}
			onValueChange={(next) => {
				if (next === 'total' || next === 'platforms') view = next;
			}}
			aria-label={m.stats_growth_view_label()}
			class="shrink-0"
		>
			<ToggleGroup.Item value="total" class="relative px-3 after:absolute after:inset-x-0 after:-inset-y-2 data-[state=on]:bg-muted"
				>{m.stats_growth_view_total()}</ToggleGroup.Item
			>
			<ToggleGroup.Item value="platforms" class="relative px-3 after:absolute after:inset-x-0 after:-inset-y-2 data-[state=on]:bg-muted"
				>{m.stats_growth_view_platforms()}</ToggleGroup.Item
			>
		</ToggleGroup.Root>
	</Card.Header>

	<Card.Content class="px-2 pt-4 pb-2 sm:px-4">
		{#if view === 'platforms'}
			<ul class="mb-3 flex flex-wrap gap-x-4 gap-y-1.5 px-2 text-xs" aria-hidden="true">
				{#each SERIES_KEYS as key (key)}
					<li class="flex items-center gap-1.5 text-muted-foreground">
						<span class="size-2.5 rounded-[2px]" style:background={SERIES_COLOR[key]}></span>{seriesLabel(key)}
					</li>
				{/each}
			</ul>
		{/if}
		<LazyMount load={() => import('./GrowthChart.svelte')} props={{ rows, view }} class="h-64 w-full sm:h-80">
			{#snippet fallback()}
				<Sparkline values={rows.map((row) => row.total)} zero class="mt-2 ml-11 h-[calc(100%-2.5rem)] opacity-60" />
			{/snippet}
		</LazyMount>
	</Card.Content>

	<details class="group border-t border-border px-4 py-3 text-sm sm:px-6">
		<summary class="-my-3 cursor-pointer py-3 text-muted-foreground select-none hover:text-foreground">{m.stats_table_show()}</summary>
		<div class="mt-3 max-h-72 overflow-auto">
			<table class="w-full text-left text-xs tabular-nums">
				<thead class="sticky top-0 bg-card text-muted-foreground">
					<tr>
						<th scope="col" class="py-1.5 pr-4 font-medium">{m.stats_table_date()}</th>
						{#each tableColumns as key (key)}<th scope="col" class="py-1.5 pr-4 text-right font-medium">{seriesLabel(key)}</th>{/each}
						<th scope="col" class="py-1.5 text-right font-medium">{m.stats_growth_total_series()}</th>
					</tr>
				</thead>
				<tbody>
					{#each rows.toReversed() as row (row.date.getTime())}
						<tr class="border-t border-border/60">
							<th scope="row" class="py-1.5 pr-4 font-normal">{formatWeekday(row.date)}</th>
							{#each tableColumns as key (key)}<td class="py-1.5 pr-4 text-right">{formatNumber(row[key])}</td>{/each}
							<td class="py-1.5 text-right font-medium">{formatNumber(row.total)}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</details>
</Card.Root>
