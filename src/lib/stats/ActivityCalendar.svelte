<!--
	@component
	Posting activity as a sky: one star per day (all platforms), weeks as columns, Monday on top. No post = faint speck; more posts =
	bigger, brighter star. Total and longest streak set big beside it. Plain HTML/CSS, one shared hover tooltip.
-->
<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { dateAt, longestStreak } from './derive.ts';
	import { formatMonth, formatNumber, formatWeekday, formatWeekdayShort } from './format.ts';
	import type { Stats } from './schema.ts';

	let { stats }: { stats: Stats } = $props();

	interface Cell {
		date: Date;
		count: number;
	}

	const weeks = $derived.by(() => {
		const cells: (Cell | null)[] = stats.posts.map((count, index) => ({ date: dateAt(stats.asOf, index), count }));
		// Monday = 0. Pad the first week so every column starts on a Monday.
		const lead = (cells[0]!.date.getUTCDay() + 6) % 7;
		const padded = [...Array.from({ length: lead }, () => null), ...cells];
		const columns: (Cell | null)[][] = [];
		for (let index = 0; index < padded.length; index += 7) columns.push(padded.slice(index, index + 7));
		return columns;
	});

	const total = $derived(stats.posts.reduce((sum, count) => sum + count, 0));
	const streak = $derived(longestStreak(stats.posts));

	/** Split a message around its number placeholder, so the number can be set big while the words stay generated copy. */
	const around = (message: (marker: string) => string) =>
		message('\u0000')
			.split('\u0000')
			.map((part) => part.replace(/^[:\s]+|[:\s]+$/g, ''))
			.filter(Boolean)
			.join(' ');
	const totalLabel = $derived(around((count) => m.stats_activity_total({ count })));
	const streakLabel = $derived(around((days) => m.stats_activity_streak({ days })));

	/** Star level 0…4 (0 = no post). */
	const level = (count: number) => Math.min(4, count);
	const LEVELS = [0, 1, 2, 3, 4] as const;

	const monthLabels = $derived(
		weeks.map((week, index) => {
			const first = week.find((cell) => cell !== null)!;
			const previous = weeks[index - 1]?.find((cell) => cell !== null);
			return !previous || previous.date.getUTCMonth() !== first.date.getUTCMonth() ? formatMonth(first.date) : '';
		})
	);
	// Monday of the first full week, to label weekday rows.
	const weekdayDates = $derived((weeks.find((week) => week.every(Boolean)) ?? weeks[1]).map((cell) => cell!.date));

	let tip = $state<{ text: string; x: number; y: number } | null>(null);

	function show(event: PointerEvent) {
		const target = event.target as HTMLElement;
		const index = target.dataset.index;
		if (index === undefined) return void (tip = null);
		const [week, day] = index.split(':').map(Number);
		const cell = weeks[week][day]!;
		const box = target.getBoundingClientRect();
		const host = (event.currentTarget as HTMLElement).getBoundingClientRect();
		tip = {
			text: m.stats_activity_cell({ date: formatWeekday(cell.date), count: formatNumber(cell.count) }),
			x: box.left - host.left + box.width / 2,
			y: box.top - host.top
		};
	}
</script>

<div class="grid gap-10 lg:grid-cols-[auto_1fr] lg:items-center lg:gap-16" style:--cell="clamp(0.6rem, calc((100vw - 6rem) / {weeks.length}), 1.4rem)">
	<div class="relative max-w-full min-w-0 overflow-x-auto pb-1 lg:overflow-visible">
		<div class="mb-2 ml-7 grid font-mono text-[0.65rem] text-muted-foreground" style:grid-template-columns="repeat({weeks.length}, var(--cell))" aria-hidden="true">
			{#each monthLabels as label, index (index)}<span class="overflow-visible whitespace-nowrap">{label}</span>{/each}
		</div>
		<div class="flex gap-1.5">
			<div class="grid w-5.5 shrink-0 grid-rows-[repeat(7,var(--cell))] font-mono text-[0.6rem] leading-none text-muted-foreground" aria-hidden="true">
				{#each weekdayDates as date, index (index)}<span class="flex items-center">{index % 2 === 0 ? formatWeekdayShort(date) : ''}</span>{/each}
			</div>
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="grid grid-flow-col grid-rows-7"
				style:grid-template-columns="repeat({weeks.length}, var(--cell))"
				role="img"
				aria-label="{m.stats_activity_total({ count: formatNumber(total) })}. {m.stats_activity_streak({ days: formatNumber(streak) })}"
				onpointerover={show}
				onpointerleave={() => (tip = null)}
			>
				{#each weeks as week, w (w)}
					{#each { length: 7 }, d (d)}
						{@const cell = week[d]}
						{#if cell}
							<span class="grid size-(--cell) place-items-center" data-index="{w}:{d}">
								<span class="star pointer-events-none" data-level={level(cell.count)}></span>
							</span>
						{:else}
							<span class="size-(--cell)"></span>
						{/if}
					{/each}
				{/each}
			</div>
		</div>
		{#if tip}
			<div
				class="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-full bg-night px-2.5 py-0.5 font-mono text-[0.7rem] whitespace-nowrap text-cream shadow-lg dark:bg-cream dark:text-night"
				style:left="{tip.x}px"
				style:top="{tip.y - 4}px"
				aria-hidden="true"
			>
				{tip.text}
			</div>
		{/if}
		<div class="mt-3 ml-7 flex items-center gap-2 font-mono text-[0.65rem] text-muted-foreground" aria-hidden="true">
			<span>{m.stats_activity_less()}</span>
			{#each LEVELS as value (value)}<span class="grid size-3.5 place-items-center"><span class="star" data-level={value}></span></span>{/each}
			<span>{m.stats_activity_more()}</span>
		</div>
	</div>

	<dl class="grid grid-cols-2 gap-x-8 gap-y-6 lg:grid-cols-1">
		<div class="grid gap-1">
			<dt class="text-sm text-muted-foreground">{totalLabel}</dt>
			<dd class="font-display text-5xl leading-none font-black tracking-tight tabular-nums sm:text-6xl">{formatNumber(total)}</dd>
		</div>
		<div class="grid gap-1">
			<dt class="text-sm text-muted-foreground">{streakLabel}</dt>
			<dd class="font-display text-5xl leading-none font-black tracking-tight tabular-nums sm:text-6xl">{formatNumber(streak)}</dd>
		</div>
	</dl>
</div>

<style>
	.star {
		display: block;
		border-radius: 50%;
		background: var(--star);
		--star: var(--color-ochre);
	}

	:global(.dark) .star {
		--star: var(--color-butter);
	}

	.star[data-level='0'] {
		width: 18%;
		height: 18%;
		min-width: 2px;
		min-height: 2px;
		background: color-mix(in oklab, var(--foreground) 22%, transparent);
	}

	.star[data-level='1'] {
		width: 34%;
		height: 34%;
		opacity: 0.55;
	}

	.star[data-level='2'] {
		width: 48%;
		height: 48%;
		opacity: 0.75;
	}

	.star[data-level='3'] {
		width: 62%;
		height: 62%;
	}

	.star[data-level='4'] {
		width: 76%;
		height: 76%;
		box-shadow: 0 0 0 2px color-mix(in oklab, var(--star) 25%, transparent);
	}

	:global(.dark) .star[data-level='3'] {
		box-shadow: 0 0 6px rgb(252 215 114 / 0.45);
	}

	:global(.dark) .star[data-level='4'] {
		box-shadow:
			0 0 10px rgb(252 215 114 / 0.7),
			0 0 2px #fff8e0;
	}
</style>
