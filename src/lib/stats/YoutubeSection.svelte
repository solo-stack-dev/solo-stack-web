<!--
	@component
	YouTube detail. The four channel numbers stand like waymarks on one path: a single line with a node under every number, and
	below it a painted ink ground (stats-kpi-ground.webp, docs/art/site/round-3/ink-ground-a.png) holding label and change. At
	night the ground is solid ink and the path butter; on paper the same brush stroke is a pale sumi wash under an ochre line,
	so the strip never reads as a black band. The ground is one painting per row: every figure shows its slice of it (container
	units of the list), so the brush runs on unbroken across the figures. Subgrid rows give every number one shared baseline,
	however the labels wrap. Below: daily views (columns of light) beside the top videos, the chart as tall as the list.
-->
<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import ground from './assets/stats-kpi-ground.webp';
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

	/** The hours message split around its number, so the unit can be set small beside the big figure (copy stays generated). */
	const hours = $derived(m.stats_unit_hours({ value: '\u0000' }).split('\u0000') as [string, string]);

	const rows = $derived(
		Array.from({ length: period }, (_, offset) => LAST_DAY - period + 1 + offset).map((day) => ({ date: dateAt(stats.asOf, day), views: stats.youtube.views[day] }))
	);
</script>

<div class="grid gap-14">
	<div class="grid gap-4">
		<dl class="ridge grid grid-cols-2 lg:grid-cols-4" style:--ground="url({ground})">
			{#if subscribers}
				{@render figure(m.stats_youtube_subscribers(), formatNumber(subscribers.value), subscribers.ratio, formatSigned(subscribers.delta), 0)}
			{/if}
			{@render figure(m.stats_youtube_views(), formatNumber(views.value), views.ratio, undefined, 1)}
			{@render figure(m.stats_youtube_watch_time(), formatHours(watch.value), watch.ratio, undefined, 2, hours)}
			{@render figure(m.stats_youtube_avg_duration(), formatDuration(average.value), average.ratio, undefined, 3)}
		</dl>
		<p class="text-xs text-muted-foreground">{m.stats_delta_previous({ days: period })}</p>
	</div>

	<div class="grid gap-12 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-14">
		<figure class="grid grid-rows-[auto_minmax(16rem,1fr)] gap-4">
			<figcaption class="font-semibold">{m.stats_youtube_views_chart()}</figcaption>
			<ViewsColumns {rows} class="h-64 w-full sm:h-72 lg:h-full" />
		</figure>
		<div class="grid content-start gap-2">
			<h3 class="font-semibold">{m.stats_youtube_top_title()}</h3>
			<TopVideos videos={stats.youtube.topVideos} {period} />
		</div>
	</div>
</div>

{#snippet figure(label: string, value: string, ratio: number, amount: string | undefined, index: number, unit?: [string, string])}
	<div class="figure" data-index={index}>
		<div class="ground" aria-hidden="true"><span class="path"></span><span class="marker"></span></div>
		<dt class="caption text-xs text-pretty sm:text-sm">{label}</dt>
		<dd class="value font-display text-4xl leading-[0.85] font-black tracking-tight whitespace-nowrap text-foreground tabular-nums sm:text-5xl">
			{#if unit?.[0]}<span class="unit">{unit[0]}</span>{/if}{value}{#if unit?.[1]}<span class="unit">{unit[1]}</span>{/if}
		</dd>
		<dd class="change"><Delta {ratio} {amount} /></dd>
	</div>
{/snippet}

<style>
	/* Every figure spans three shared rows: the number on the path, label and change on the painted ground */
	.figure {
		position: relative;
		display: grid;
		grid-row: span 3;
		grid-template-rows: subgrid;
		--pad-left: 1.25rem;
		--pad-right: 0.5rem;
		padding-inline: var(--pad-left) var(--pad-right);
	}

	@media (min-width: 40rem) {
		.figure {
			--pad-left: 1.75rem;
			--pad-right: 1rem;
		}
	}

	/* The first figure of every row starts flush with the content column */
	.figure:is([data-index='0'], [data-index='2']) {
		--pad-left: 0rem;
	}

	@media (min-width: 64rem) {
		.figure[data-index='2'] {
			--pad-left: 1.75rem;
		}
	}

	.value {
		grid-row: 1;
		grid-column: 1;
		align-self: end;
		padding-bottom: 0.7rem;
	}

	/* Two rows of figures (below 1024 px): air between the first strip's foot and the second row of numbers */
	@media (max-width: 63.99rem) {
		.figure:is([data-index='2'], [data-index='3']) .value {
			padding-top: 1.75rem;
		}
	}

	.caption {
		position: relative;
		grid-row: 2;
		grid-column: 1;
		padding-top: 1.2rem;
		color: var(--foreground);
	}

	:global(.dark) .caption {
		color: color-mix(in oklab, var(--color-cream) 84%, transparent);
	}

	.change {
		position: relative;
		grid-row: 3;
		grid-column: 1;
		padding: 0.3rem 0 1.15rem;
	}

	/* The list is the painting's frame: figures place their slice of the row's ground in its container units */
	.ridge {
		container-type: inline-size;
		--cols: 2;
		/* How far the brush runs on past the content column at both ends of a row */
		--run: 1rem;
	}

	@media (min-width: 64rem) {
		.ridge {
			--cols: 4;
			--run: 2rem;
		}
	}

	.figure {
		--col: 0;
		--row: 0;
	}

	.figure[data-index='1'] {
		--col: 1;
	}

	.figure[data-index='2'] {
		--row: 1;
	}

	.figure[data-index='3'] {
		--col: 1;
		--row: 1;
	}

	@media (min-width: 64rem) {
		.figure[data-index='2'] {
			--col: 2;
			--row: 0;
		}

		.figure[data-index='3'] {
			--col: 3;
			--row: 0;
		}
	}

	.ground {
		position: relative;
		grid-row: 2 / span 2;
		grid-column: 1;
		/* Reach under the figure's padding and a hair into the neighbour, so a row is one strip; at the ends of a row the brush
		   runs on past the column and frays out there, clear of the text. The painted fringe hangs below the change. */
		margin-inline: calc(-1 * var(--pad-left) - var(--run-left, 0rem)) calc(-1 * var(--pad-right) - var(--run-right, 0rem));
		margin-bottom: -1.1rem;
		/* The row's painting: one stroke from -run to 100% + run. A second row uses the other half of a double-width stroke. */
		--paint-w: calc((100cqw + 2 * var(--run)) * (1 + var(--row)));
		--left: calc(var(--col) * 100cqw / var(--cols) - var(--pad-left) - var(--run-left, 0rem) + var(--run));
	}

	/* The painted stroke itself (a layer of its own, so the paper wash fades only the pigment, never the path and its nodes) */
	.ground::before {
		content: '';
		position: absolute;
		inset: 0;
		background: var(--wash);
		mask-image: var(--ground);
		mask-repeat: no-repeat;
		mask-size: var(--paint-w) 100%;
		mask-position: calc(-1 * var(--left) - var(--row) * (100cqw + 2 * var(--run))) 0;
		/* Neighbouring slices share one pixel-snapped edge: no overlap, so the paper wash never doubles at a join */
		--wash: #0b0b0c;
	}

	/* Paper: the same stroke as a pale warm sumi wash, multiplied into the grain */
	:global(:root:not(.dark)) .ground::before {
		--wash: color-mix(in oklab, var(--color-ink) 65%, #8a5a12);
		opacity: 0.09;
		mix-blend-mode: multiply;
	}

	/* The path: one line along the top of the ground, a node under every number. Night: butter with a breath of glow; paper:
	   deep ochre ink, no glow */
	.path {
		position: absolute;
		inset: 0 0 auto;
		height: 1.5px;
		background: var(--color-butter);
		opacity: 0.85;
		box-shadow: 0 0 6px rgb(252 215 114 / 0.3);
	}

	.marker {
		position: absolute;
		top: calc(-0.25rem + 0.75px);
		left: calc(var(--pad-left) + var(--run-left, 0rem));
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 50%;
		background: var(--color-moonlight);
		box-shadow:
			0 0 0 3px rgb(252 215 114 / 0.25),
			0 0 10px 2px rgb(252 215 114 / 0.55);
	}

	:global(:root:not(.dark)) .path {
		background: #a8721a;
		opacity: 1;
		box-shadow: none;
	}

	:global(:root:not(.dark)) .marker {
		background: var(--color-ochre);
		box-shadow: 0 0 0 1.5px #8a5a12;
	}

	/* Outer ends of a row fray out (outside the text) instead of stopping square */
	.figure:is([data-index='0'], [data-index='2']) .ground {
		--run-left: var(--run);
		mask-image: linear-gradient(90deg, transparent, #000 var(--run));
	}

	.figure:is([data-index='1'], [data-index='3']) .ground {
		--run-right: var(--run);
		mask-image: linear-gradient(270deg, transparent, #000 var(--run));
	}

	@media (min-width: 64rem) {
		.figure:is([data-index='1'], [data-index='2']) .ground {
			--run-left: 0rem;
			--run-right: 0rem;
			mask-image: none;
		}
	}

	.unit {
		font-size: 0.42em;
		font-weight: 700;
		letter-spacing: 0;
		color: var(--muted-foreground);
	}
</style>
