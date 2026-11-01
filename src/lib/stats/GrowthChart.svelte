<!--
	@component
	Follower growth (LayerChart). Loaded lazily by GrowthCard, so LayerChart stays out of the page's initial chunk.
	`total`: one area for all platforms. `platforms`: stacked areas, one color per entity (SERIES_COLOR).
-->
<script lang="ts">
	import { scaleUtc } from 'd3-scale';
	import { curveMonotoneX } from 'd3-shape';
	import { AreaChart } from 'layerchart';
	import * as Chart from '#lib/components/ui/chart/index.js';
	import { m } from '#lib/paraglide/messages.js';
	import { getSocial } from '#lib/home/data/socials.ts';
	import { SERIES_COLOR, SERIES_KEYS, type GrowthRow, type SeriesKey } from './derive.ts';
	import { formatCompact, formatDay, formatNumber, formatWeekday } from './format.ts';
	import { dayTicks } from './ticks.ts';

	interface Props {
		rows: GrowthRow[];
		view: 'total' | 'platforms';
	}

	let { rows, view }: Props = $props();

	let width = $state(0);
	const ticks = $derived(
		dayTicks(
			rows.map((row) => row.date),
			width - 64
		)
	);

	const seriesLabel = (key: SeriesKey) => (key === 'other' ? m.stats_growth_other() : getSocial(key).name);

	const config = $derived<Chart.ChartConfig>({
		total: { label: m.stats_growth_total_series(), color: 'var(--chart-accent)' },
		...Object.fromEntries(SERIES_KEYS.map((key) => [key, { label: seriesLabel(key), color: SERIES_COLOR[key] }]))
	});

	// The single total line starts its axis below the data instead of at 0, so growth inside the period is visible.
	// The axis labels carry the scale; the stacked view keeps the 0 baseline (parts of a whole).
	const totalDomain = $derived.by((): [number, null] => {
		const values = rows.map((row) => row.total);
		const min = Math.min(...values);
		const max = Math.max(...values);
		return [Math.max(0, Math.floor(min - (max - min) * 0.5)), null];
	});

	const series = $derived(
		view === 'total'
			? [{ key: 'total', label: m.stats_growth_total_series(), color: 'var(--chart-accent)', props: { fill: 'url(#growth-wash)' } }]
			: // Stack bottom up: the biggest platform sits on the baseline.
				SERIES_KEYS.map((key) => ({ key, label: seriesLabel(key), color: SERIES_COLOR[key] }))
	);
</script>

<div class="h-64 w-full sm:h-80" bind:clientWidth={width}>
	<Chart.Container {config} class="aspect-auto size-full">
		<AreaChart
			data={rows}
			x="date"
			xScale={scaleUtc()}
			{series}
			seriesLayout={view === 'total' ? 'overlap' : 'stack'}
			yDomain={view === 'total' ? totalDomain : undefined}
			yBaseline={view === 'total' ? null : 0}
			padding={{ left: 44, bottom: 24, top: 8, right: 20 }}
			props={{
				area: {
					curve: curveMonotoneX,
					fillOpacity: view === 'total' ? 1 : 0.7,
					line: view === 'total' ? { class: 'stroke-2', stroke: 'var(--chart-accent)' } : { class: 'stroke-2', stroke: 'var(--card)' }
				},
				xAxis: { format: (value: Date) => formatDay(value), ticks },
				yAxis: { format: (value: number) => formatCompact(value), tickSpacing: 56 },
				grid: { x: false, y: { class: 'stroke-border' } },
				highlight: { points: { r: 4, class: 'stroke-card stroke-2' } }
			}}
		>
			{#snippet belowMarks()}
				<defs>
					<linearGradient id="growth-wash" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stop-color="var(--chart-wash)" stop-opacity="0.5" />
						<stop offset="1" stop-color="var(--chart-wash)" stop-opacity="0.02" />
					</linearGradient>
				</defs>
			{/snippet}
			{#snippet tooltip()}
				<Chart.Tooltip labelFormatter={(value: Date) => formatWeekday(value)} indicator="dot">
					{#snippet formatter({ value, name, item })}
						<span class="size-2.5 shrink-0 rounded-[2px]" style:background={item.color}></span>
						<span class="flex-1 text-muted-foreground">{name}</span>
						<span class="ml-3 font-medium text-foreground tabular-nums">{formatNumber(Number(value))}</span>
					{/snippet}
				</Chart.Tooltip>
			{/snippet}
		</AreaChart>
	</Chart.Container>
</div>
