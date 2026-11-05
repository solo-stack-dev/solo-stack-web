<!--
	@component
	Page opener as one composition: title, intro, rubber stamp (mock notice, data date), period switch, huge total follower count,
	and the follower curve as a moonlit ridge (Ridge.svelte); twinkling stars at night. The ridge's data table sits in a disclosure
	for screen readers and the curious.
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
	import PeriodSwitch from './PeriodSwitch.svelte';
	import Ridge from './Ridge.svelte';
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
	<div class="pointer-events-none absolute inset-x-0 top-0 -z-10 hidden h-[70%] mask-b-from-40% dark:block" aria-hidden="true">
		<StarField density={0.55} brightness={0.7} seed={31} />
	</div>

	<div class="mx-auto grid max-w-6xl gap-8 px-4 pt-10 sm:px-6 sm:pt-16 lg:px-8">
		<div class="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-start">
			<div class="grid gap-5">
				<h1 id="stats-title" class="max-w-3xl font-display text-5xl leading-[0.92] font-black tracking-wordmark text-balance sm:text-7xl">{m.stats_title()}</h1>
				<p class="max-w-xl text-base text-pretty text-muted-foreground sm:text-lg">{m.stats_intro()}</p>
			</div>

			<!-- A rubber stamp on the paper: mock notice and data date -->
			<p
				class="stamp grid w-fit gap-0.5 justify-self-start rounded-lg border-2 border-current px-3.5 py-2 font-mono text-[0.7rem] tracking-[0.18em] text-[#7d560a] uppercase lg:mt-3 lg:justify-self-end dark:text-butter/85"
			>
				{#if stats.source === 'mock'}<strong class="text-sm tracking-[0.24em]">{m.stats_mock_badge()}</strong>{/if}
				<time datetime={stats.asOf} class="tracking-normal normal-case">{m.stats_as_of({ date: formatLongDate(new Date(stats.asOf)) })}</time>
			</p>
		</div>

		{#if stats.source === 'mock'}<p class="-mt-3 max-w-xl text-sm text-pretty text-muted-foreground/90 italic">{m.stats_mock_note()}</p>{/if}

		<div class="relative z-10 mt-2 grid justify-items-start gap-1">
			<p class="text-sm font-medium">{m.stats_kpi_reach()}</p>
			<p class="giant font-display leading-[0.8] font-black tracking-wordmark tabular-nums">{formatNumber(display)}</p>
			<Delta class="mt-3 text-sm" ratio={change.ratio} amount={formatSigned(change.delta)} note={m.stats_delta_previous({ days: period })} />
			<PeriodSwitch bind:value={period} class="mt-6" />
		</div>
	</div>

	<div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
		<Ridge {values} {dates} class="mt-6 h-[clamp(12rem,27vw,22rem)] w-full sm:-mt-24" />
	</div>

	<div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
		<details class="group text-sm text-muted-foreground">
			<summary class="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full font-mono text-xs marker:content-none hover:text-foreground">
				<span class="transition-transform group-open:rotate-90" aria-hidden="true">›</span>{m.stats_table_show()}
			</summary>
			<div class="mt-2 max-h-72 overflow-auto rounded-2xl ring-1 ring-foreground/10">
				<table class="w-full text-left text-xs tabular-nums">
					<thead class="sticky top-0 bg-background">
						<tr><th class="px-4 py-2 font-medium">{m.stats_table_date()}</th><th class="px-4 py-2 text-right font-medium">{m.stats_kpi_reach()}</th></tr>
					</thead>
					<tbody>
						{#each values as value, index (index)}
							<tr class="border-t border-foreground/5"
								><td class="px-4 py-1.5">{formatWeekday(dates[index])}</td><td class="px-4 py-1.5 text-right">{formatNumber(value)}</td></tr
							>
						{/each}
					</tbody>
				</table>
			</div>
		</details>
	</div>
</section>

<style>
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

	.stamp {
		transform: rotate(-4deg);
		mask-image: radial-gradient(circle at 30% 40%, #000 60%, rgb(0 0 0 / 0.8) 85%);
		opacity: 0.9;
	}
</style>
