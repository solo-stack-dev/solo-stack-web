<!--
	@component
	Posting activity: one cell per day (all platforms), weeks as columns, Monday on top. A one hue ramp from the
	surface to the accent pigment. Plain HTML/CSS with one shared hover tooltip, no chart library.
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
		const lead = ((cells[0]!.date.getUTCDay() + 6) % 7) as number;
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
			.map((part) => part.replace(/^[:\s]+|[:\s]+$/g, '')) as [string, string?];
	const totalLabel = $derived(around((count) => m.stats_activity_total({ count })));
	const streakLabel = $derived(around((days) => m.stats_activity_streak({ days })));

	/** Ramp step 0…4 (0 = no post). */
	const level = (count: number) => Math.min(4, count);
	const LEVEL_CLASS = [
		'bg-foreground/[0.07]',
		'bg-[color-mix(in_oklab,var(--chart-accent)_28%,var(--card))]',
		'bg-[color-mix(in_oklab,var(--chart-accent)_52%,var(--card))]',
		'bg-[color-mix(in_oklab,var(--chart-accent)_76%,var(--card))]',
		'bg-(--chart-accent)'
	];

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

	function show(event: PointerEvent | FocusEvent) {
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

<div class="grid gap-6 lg:grid-cols-[auto_1fr] lg:items-center lg:gap-10" style:--cell="clamp(0.5rem, calc((100vw - 7rem) / {weeks.length} - 3px), 1.125rem)">
	<div class="relative max-w-full min-w-0 overflow-x-auto pb-1 lg:overflow-visible">
		<div class="mb-1.5 ml-7 grid gap-[3px] text-[0.65rem] text-muted-foreground" style:grid-template-columns="repeat({weeks.length}, var(--cell))" aria-hidden="true">
			{#each monthLabels as label, index (index)}<span class="overflow-visible whitespace-nowrap">{label}</span>{/each}
		</div>
		<div class="flex gap-1.5">
			<div class="grid w-5.5 shrink-0 grid-rows-[repeat(7,var(--cell))] gap-[3px] text-[0.6rem] leading-none text-muted-foreground" aria-hidden="true">
				{#each weekdayDates as date, index (index)}<span class="flex items-center">{index % 2 === 0 ? formatWeekdayShort(date) : ''}</span>{/each}
			</div>
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="grid grid-flow-col grid-rows-7 gap-[3px]"
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
							<span class="size-(--cell) rounded-[3px] {LEVEL_CLASS[level(cell.count)]}" data-index="{w}:{d}"></span>
						{:else}
							<span class="size-(--cell)"></span>
						{/if}
					{/each}
				{/each}
			</div>
		</div>
		{#if tip}
			<div
				class="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-md bg-popover px-2 py-1 text-xs whitespace-nowrap text-popover-foreground shadow-lg ring-1 ring-foreground/10"
				style:left="{tip.x + 28}px"
				style:top="{tip.y + 16}px"
				aria-hidden="true"
			>
				{tip.text}
			</div>
		{/if}
		<div class="mt-3 ml-7 flex items-center gap-1.5 text-[0.65rem] text-muted-foreground" aria-hidden="true">
			<span>{m.stats_activity_less()}</span>
			{#each LEVEL_CLASS as cls (cls)}<span class="size-2.5 rounded-[2px] {cls}"></span>{/each}
			<span>{m.stats_activity_more()}</span>
		</div>
	</div>
	<dl class="grid grid-cols-2 gap-3 lg:max-w-md">
		<div class="rounded-lg bg-muted/50 p-3">
			<dt class="text-xs text-muted-foreground">{totalLabel.filter(Boolean).join(' ')}</dt>
			<dd class="text-2xl font-semibold tracking-tight">{formatNumber(total)}</dd>
		</div>
		<div class="rounded-lg bg-muted/50 p-3">
			<dt class="text-xs text-muted-foreground">{streakLabel.filter(Boolean).join(' ')}</dt>
			<dd class="text-2xl font-semibold tracking-tight">{formatNumber(streak)}</dd>
		</div>
	</dl>
</div>
