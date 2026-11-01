<!--
	@component
	YouTube views per day (LayerChart columns). Loaded lazily by YoutubeSection.
-->
<script lang="ts">
	import { BarChart } from 'layerchart';
	import * as Chart from '#lib/components/ui/chart/index.js';
	import { m } from '#lib/paraglide/messages.js';
	import { formatCompact, formatDay, formatNumber, formatWeekday } from './format.ts';
	import { dayTicks } from './ticks.ts';

	interface Props {
		rows: { date: Date; views: number }[];
	}

	let { rows }: Props = $props();

	const config = $derived<Chart.ChartConfig>({ views: { label: m.stats_youtube_views_series(), color: 'var(--chart-accent)' } });
	// Keep columns thin (about 24px at most) whatever the period: fewer days, more air between them.
	const padding = $derived(rows.length <= 7 ? 0.72 : rows.length <= 30 ? 0.36 : 0.22);
	let width = $state(0);
	const ticks = $derived(
		dayTicks(
			rows.map((row) => row.date),
			width - 60,
			80
		)
	);
</script>

<div class="h-full min-h-56 w-full" bind:clientWidth={width}>
	<Chart.Container {config} class="aspect-auto size-full min-h-56">
		<BarChart
			data={rows}
			x="date"
			bandPadding={padding}
			y="views"
			series={[{ key: 'views', label: m.stats_youtube_views_series(), color: 'var(--chart-accent)' }]}
			padding={{ left: 40, bottom: 24, top: 8, right: 20 }}
			props={{
				bars: { stroke: 'none', rounded: 'top', radius: 3 },
				highlight: { area: { class: 'fill-muted' } },
				xAxis: { format: (value: Date) => formatDay(value), ticks },
				yAxis: { format: (value: number) => formatCompact(value), tickSpacing: 48 },
				grid: { x: false, y: { class: 'stroke-border' } }
			}}
		>
			{#snippet tooltip()}
				<Chart.Tooltip labelFormatter={(value: Date) => formatWeekday(value)}>
					{#snippet formatter({ value, name, item })}
						<span class="size-2.5 shrink-0 rounded-[2px]" style:background={item.color}></span>
						<span class="flex-1 text-muted-foreground">{name}</span>
						<span class="ml-3 font-medium text-foreground tabular-nums">{formatNumber(Number(value))}</span>
					{/snippet}
				</Chart.Tooltip>
			{/snippet}
		</BarChart>
	</Chart.Container>
</div>
