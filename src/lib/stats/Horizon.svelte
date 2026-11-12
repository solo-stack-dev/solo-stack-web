<!--
	@component
	Page opener as one illustration: title, intro, the huge total follower count with its change and the period switch, set into
	the growth hill (GrowthHill.svelte): the follower curve as the glowing path up an ink hill to the tree of light; stars
	twinkle at night. Just under the hill's painted foot, at the curve's start, hangs the chart's caption: the data table in a
	disclosure (for screen readers and the curious) and the data date. The mock notice is the italic line under the intro.
-->
<script lang="ts">
	import { untrack } from 'svelte';
	import { cubicOut } from 'svelte/easing';
	import { Tween } from 'svelte/motion';
	import StarField from '#lib/home/shared/StarField.svelte';
	import { reducedMotion } from '#lib/home/shared/motion.svelte.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { LAST_DAY, changeOf, dateAt, periodSlice, totalFollowers } from './derive.ts';
	import Delta from './Delta.svelte';
	import { formatLongDate, formatNumber, formatSigned, formatWeekday } from './format.ts';
	import GrowthHill from './GrowthHill.svelte';
	import PeriodSwitch from './PeriodSwitch.svelte';
	import type { Period, Stats } from './schema.ts';

	let { stats, period = $bindable() }: { stats: Stats; period: Period } = $props();

	const total = $derived(totalFollowers(stats));
	const change = $derived(changeOf(total, period));
	const values = $derived(periodSlice(total, period));
	const dates = $derived(values.map((_, index) => dateAt(stats.asOf, LAST_DAY - period + index)));

	// On period change the number jumps to the period's start count and climbs to today while the ridge draws. SSR and first
	// render show today's count.
	const shown = new Tween(
		untrack(() => change.value),
		{ easing: cubicOut }
	);
	let replayed = false;
	$effect(() => {
		const target = change.value;
		const start = target - change.delta;
		if (!replayed) return void (replayed = true);
		if (reducedMotion.current) return void shown.set(target, { duration: 0 });
		void shown.set(start, { duration: 0 });
		void shown.set(target, { duration: 1400 });
	});
	const display = $derived(Math.round(shown.current));
</script>

<section class="relative isolate overflow-x-clip" aria-labelledby="stats-title">
	<!-- Night sky over the hero, only in the dark theme -->
	<div class="pointer-events-none absolute inset-x-0 top-0 -z-10 hidden h-[75%] mask-b-from-50% dark:block" aria-hidden="true">
		<StarField density={0.55} brightness={0.7} seed={31} />
	</div>

	<div class="pointer-events-none relative z-10 mx-auto grid max-w-6xl gap-8 px-4 pt-10 *:pointer-events-auto sm:px-6 sm:pt-16 lg:px-8">
		<div class="grid gap-5">
			<h1 id="stats-title" class="max-w-3xl font-display text-5xl leading-[0.92] font-black tracking-wordmark text-balance sm:text-7xl">{m.stats_title()}</h1>
			<p class="max-w-xl text-base text-pretty text-muted-foreground sm:text-lg">{m.stats_intro()}</p>
			{#if stats.source === 'mock'}<p class="max-w-xl text-sm text-pretty text-muted-foreground/90 italic">{m.stats_mock_note()}</p>{/if}
		</div>

		<div class="mt-2 grid justify-items-start gap-1">
			<p class="text-sm font-medium">{m.stats_kpi_reach()}</p>
			<p class="giant font-display leading-[0.8] font-black tracking-wordmark tabular-nums">{formatNumber(display)}</p>
			<div class="mt-3 grid justify-items-start gap-6">
				<Delta class="text-sm" ratio={change.ratio} amount={formatSigned(change.delta)} note={m.stats_delta_previous({ days: period })} />
				<PeriodSwitch bind:value={period} />
			</div>
		</div>
	</div>

	<GrowthHill {values} {dates} class="stats-hill mx-auto w-full" />

	<!-- The chart's caption, hung just under the painted foot at the curve's start: its data table and the data date -->
	<div class="caption relative mx-auto grid max-w-6xl justify-items-start px-4 sm:px-6 lg:px-8">
		<details class="group text-sm">
			<summary
				class="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-sm font-medium text-foreground outline-none marker:content-none hover:text-foreground/75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)"
			>
				<span class="chevron transition-transform group-open:rotate-90" aria-hidden="true">›</span>{m.stats_table_show()}
			</summary>
			<div class="ledger mt-1 mb-3 max-h-72 max-w-md overflow-auto text-muted-foreground">
				<table class="w-full text-left text-xs tabular-nums">
					<thead class="sticky top-0 bg-background">
						<tr class="border-b border-foreground/25"
							><th class="py-2 pr-4 font-medium">{m.stats_table_date()}</th><th class="py-2 text-right font-medium">{m.stats_kpi_reach()}</th></tr
						>
					</thead>
					<tbody>
						{#each values as value, index (index)}
							<tr class="border-b border-dashed border-foreground/12"
								><td class="py-1.5 pr-4">{formatWeekday(dates[index])}</td><td class="py-1.5 text-right font-mono text-foreground">{formatNumber(value)}</td></tr
							>
						{/each}
					</tbody>
				</table>
			</div>
		</details>
		<p class="-mt-2 pl-4 text-[0.8125rem] text-muted-foreground">
			<time datetime={stats.asOf}>{m.stats_as_of({ date: formatLongDate(new Date(stats.asOf)) })}</time>
		</p>
	</div>
</section>

<style>
	.chevron {
		display: inline-block;
		width: 0.5rem;
		color: #8a5a12;
		font-weight: 700;
	}

	:global(.dark) .chevron {
		color: var(--color-butter);
	}

	.giant {
		font-size: clamp(5rem, 17vw, 12.5rem);
		/* Ink on paper; at night the number catches the moonlight */
		background: linear-gradient(180deg, var(--foreground) 55%, color-mix(in oklab, var(--foreground) 70%, var(--color-ochre)));
		background-clip: text;
		color: transparent;
	}

	:global(.dark) .giant {
		background: linear-gradient(180deg, var(--color-cream) 40%, var(--color-butter));
		background-clip: text;
		text-shadow: 0 0 60px rgb(252 215 114 / 0.15);
	}

	/* The caption hangs ~16px under where the painted foot runs out at the curve's start. That point sits a fixed share of the
	   hill's height above its box (hill.ts: foot attach + depth), so the pull-up is a share of the width (margin % = width):
	   phones 0.035 × (470 / 390), wide 0.06 × (480 / 1440), capped with the 100rem hill. */
	.caption {
		margin-top: calc(-4.2% - 0.75rem);
	}

	/* From 640 px the hill tucks under the big number and the tree rises beside it. The tree grows with the width while the text
	   above it does not, so on wide screens (from ~1400 px) the pull-up eases off: the canopy top of a tree on the period maximum
	   (hill.ts wide: crest at 0.4 h, minus 1183 art px of tree at 0.35 w, = 0.2146 × the hill's width above its box) stays ~24 px
	   under the nav. 33.5rem: the text block's height (~562 px) minus those 24 px. */
	@media (min-width: 40rem) {
		:global(.stats-hill) {
			--hill-w: min(100vw, 100rem);
			max-width: 100rem;
			margin-top: max(calc(var(--hill-w) * -0.17), calc(var(--hill-w) * 0.2146 - 33.5rem));
		}

		.caption {
			margin-top: calc(max(-2%, -2rem) - 0.75rem);
		}
	}
</style>
