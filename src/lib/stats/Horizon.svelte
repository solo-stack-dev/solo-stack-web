<!--
	@component
	Page opener as one illustration: title, intro, the huge total follower count with its change and the period switch, set into
	the growth hill (GrowthHill.svelte): the follower curve as the glowing path up an ink hill to the tree of light. The rubber
	stamp (mock notice, data date) is pressed into the ink below the tree like a painter's seal; stars twinkle at night. The
	curve's data table sits in a disclosure for screen readers and the curious.
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

	<GrowthHill {values} {dates} class="stats-hill mx-auto w-full">
		{#snippet seal()}
			<!-- A rubber stamp pressed into the ink: mock notice and data date -->
			<p
				class="stamp grid w-fit gap-0.5 rounded-md border-[1.5px] border-current px-3 py-1.5 font-mono text-[0.65rem] tracking-[0.18em] whitespace-nowrap text-butter uppercase"
			>
				{#if stats.source === 'mock'}<strong class="text-xs tracking-[0.24em]">{m.stats_mock_badge()}</strong>{/if}
				<time datetime={stats.asOf} class="tracking-normal normal-case">{m.stats_as_of({ date: formatLongDate(new Date(stats.asOf)) })}</time>
			</p>
		{/snippet}
	</GrowthHill>

	<div class="relative mx-auto -mt-6 max-w-6xl px-4 sm:-mt-10 sm:px-6 lg:px-8">
		<details class="group text-sm text-muted-foreground">
			<summary class="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full font-mono text-xs marker:content-none hover:text-foreground">
				<span class="transition-transform group-open:rotate-90" aria-hidden="true">›</span>{m.stats_table_show()}
			</summary>
			<div class="ledger mt-2 max-h-72 max-w-md overflow-auto">
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
		transform: rotate(-3deg);
		/* Pressed unevenly, like ink on a rubber stamp */
		mask-image: radial-gradient(circle at 30% 40%, #000 55%, rgb(0 0 0 / 0.75) 90%);
		opacity: 0.88;
	}

	/* From 640 px the hill tucks under the big number and the tree rises beside it */
	@media (min-width: 40rem) {
		:global(.stats-hill) {
			max-width: 100rem;
			margin-top: calc(min(100vw, 100rem) * -0.17);
		}
	}
</style>
