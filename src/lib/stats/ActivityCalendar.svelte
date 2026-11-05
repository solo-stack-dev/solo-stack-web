<!--
	@component
	Posting activity as a sky: one star per day (all platforms), weeks as columns, Monday on top. No post = faint speck; more posts =
	bigger, brighter star. The sky runs across the whole content column (cells grow up to 2.75 rem, never below 18 px). Phones
	scroll it sideways: it opens on the most recent weeks (once measured; it stays there through late layout shifts until the
	visitor scrolls, then their position is kept), the weekday labels stay put beside the scrolling weeks, and the side with more
	weeks fades out under a small chevron, both gone at the end. Below 640 px the stars are at least 10 px. The total and the
	longest streak sit under it beside the legend.

	A real grid for assistive tech and keyboards: one tab stop (roving focus), arrow keys move by day and week, Home/End jump to
	the ends of a row; the focused or hovered day shows its tooltip.
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

	const labelOf = (cell: Cell) => m.stats_activity_cell({ date: formatWeekday(cell.date), count: formatNumber(cell.count) });

	/** Roving focus: the one cell in the tab order (starts on the latest day). */
	let current = $state<[number, number] | null>(null);
	const latest = $derived.by((): [number, number] => {
		const w = weeks.length - 1;
		return [w, weeks[w].findLastIndex((cell) => cell !== null)];
	});
	const focusCell = $derived(current ?? latest);

	let grid = $state<HTMLElement>();

	/** Which sides of the sideways scrolling sky (phones) hide more weeks. */
	let more = $state({ left: false, right: false });
	function measure(scroller: HTMLElement) {
		const { scrollLeft, scrollWidth, clientWidth } = scroller;
		more = { left: scrollLeft > 2, right: scrollLeft + clientWidth < scrollWidth - 2 };
	}
	/** Phones: open on the latest weeks, after measurement; follow late layout shifts until the visitor scrolls themselves. */
	const overflow = (scroller: HTMLElement) => {
		let pinned = true;
		const release = () => (pinned = false);
		const events = ['pointerdown', 'wheel', 'touchstart', 'keydown'] as const;
		const observer = new ResizeObserver(() => {
			if (pinned) scroller.scrollLeft = scroller.scrollWidth - scroller.clientWidth;
			measure(scroller);
		});
		observer.observe(scroller);
		for (const child of scroller.children) observer.observe(child);
		for (const name of events) scroller.addEventListener(name, release, { passive: true, once: true });
		return () => {
			observer.disconnect();
			for (const name of events) scroller.removeEventListener(name, release);
		};
	};
	let tip = $state<{ text: string; x: number; y: number } | null>(null);

	function showAt(target: HTMLElement) {
		const [w, d] = (target.dataset.index ?? '').split(':').map(Number);
		const cell = weeks[w]?.[d];
		if (!cell || !grid) return void (tip = null);
		const box = target.getBoundingClientRect();
		const host = grid.parentElement!.getBoundingClientRect();
		tip = { text: labelOf(cell), x: box.left - host.left + box.width / 2 + grid.parentElement!.scrollLeft, y: box.top - host.top };
	}

	function hover(event: PointerEvent) {
		const target = (event.target as HTMLElement).closest<HTMLElement>('[data-index]');
		if (target) showAt(target);
		else if (!grid?.contains(document.activeElement)) tip = null;
	}

	function move(event: KeyboardEvent) {
		const [w, d] = focusCell;
		const steps: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
		let next: [number, number] | null = null;
		if (event.key in steps) {
			const [dw, dd] = steps[event.key];
			next = [w + dw, d + dd];
		} else if (event.key === 'Home') next = [weeks.findIndex((week) => week[d]), d];
		else if (event.key === 'End') next = [weeks.findLastIndex((week) => week[d]), d];
		if (!next) return;
		event.preventDefault();
		const [nw, nd] = next;
		if (!weeks[nw]?.[nd]) return;
		current = next;
		grid?.querySelector<HTMLElement>(`[data-index="${nw}:${nd}"]`)?.focus();
	}
</script>

<div class="grid gap-4">
	<div class="calendar relative" style:--weeks={weeks.length}>
		<div
			class="sky relative -mx-4 overflow-x-auto px-4 pt-9 pb-2 sm:mx-0 sm:overflow-visible sm:px-0"
			data-more-left={more.left || undefined}
			data-more-right={more.right || undefined}
			{@attach overflow}
			onscroll={(event) => measure(event.currentTarget)}
		>
			<div class="mb-2 grid font-mono text-xs text-muted-foreground" style:grid-template-columns="1.75rem repeat({weeks.length}, var(--cell))" aria-hidden="true">
				<span></span>
				{#each monthLabels as label, index (index)}<span class="overflow-visible whitespace-nowrap">{label}</span>{/each}
			</div>
			<div
				bind:this={grid}
				class="grid w-max"
				style:grid-template-columns="1.75rem repeat({weeks.length}, var(--cell))"
				role="grid"
				tabindex="-1"
				aria-label="{m.stats_activity_total({ count: formatNumber(total) })}. {m.stats_activity_streak({ days: formatNumber(streak) })}"
				onpointerover={hover}
				onpointerleave={() => !grid?.contains(document.activeElement) && (tip = null)}
				onkeydown={move}
				onfocusin={(event) => showAt(event.target as HTMLElement)}
				onfocusout={(event) => !grid?.contains(event.relatedTarget as Node) && (tip = null)}
			>
				{#each { length: 7 }, d (d)}
					<div role="row" class="contents">
						<span role="rowheader" class="flex h-(--cell) items-center font-mono text-xs leading-none text-muted-foreground">
							<span class={d % 2 === 0 ? 'max-sm:sr-only' : 'sr-only'}>{formatWeekdayShort(weekdayDates[d])}</span>
						</span>
						{#each weeks as week, w (w)}
							{@const cell = week[d]}
							{#if cell}
								<span
									role="gridcell"
									class="day grid size-(--cell) place-items-center rounded-full outline-none"
									data-index="{w}:{d}"
									tabindex={focusCell[0] === w && focusCell[1] === d ? 0 : -1}
									aria-label={labelOf(cell)}
									onfocus={() => (current = [w, d])}
								>
									<span class="star pointer-events-none" data-level={level(cell.count)}></span>
								</span>
							{:else}
								<span role="gridcell" class="size-(--cell)"></span>
							{/if}
						{/each}
					</div>
				{/each}
			</div>
			{#if tip}
				<div
					class="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-full bg-night px-2.5 py-0.5 font-mono text-xs whitespace-nowrap text-cream shadow-lg dark:bg-cream dark:text-night"
					style:left="clamp(7rem, {tip.x}px, 100% - 7rem)"
					style:top="{tip.y - 6}px"
					aria-hidden="true"
				>
					{tip.text}
				</div>
			{/if}
		</div>
		<!-- Phones: the weekday labels stand still beside the scrolling weeks (the grid's own row headers stay for assistive tech) -->
		<div class="pointer-events-none absolute top-0 left-0 grid pt-9 font-mono text-xs leading-none text-muted-foreground sm:hidden" aria-hidden="true">
			<span class="mb-2 leading-4">&nbsp;</span>
			{#each weekdayDates as date, d (d)}<span class="flex h-(--cell) items-center">{d % 2 === 0 ? formatWeekdayShort(date) : ''}</span>{/each}
		</div>
		{#if more.left}
			<svg class="cue pointer-events-none absolute bottom-2 -left-4 h-[calc(7*var(--cell))] w-4 -scale-x-100 sm:hidden" viewBox="0 0 16 16" aria-hidden="true">
				<path d="M5 3l5 5-5 5" />
			</svg>
		{/if}
		{#if more.right}
			<svg class="cue pointer-events-none absolute -right-1 bottom-2 h-[calc(7*var(--cell))] w-4 sm:hidden" viewBox="0 0 16 16" aria-hidden="true">
				<path d="M5 3l5 5-5 5" />
			</svg>
		{/if}
	</div>

	<div class="flex flex-wrap items-start justify-between gap-x-12 gap-y-8">
		<div class="flex items-center gap-2 font-mono text-xs text-muted-foreground sm:ml-7" aria-hidden="true">
			<span>{m.stats_activity_less()}</span>
			{#each LEVELS as value (value)}<span class="grid size-4 place-items-center max-sm:size-[1.125rem]"><span class="star" data-level={value}></span></span>{/each}
			<span>{m.stats_activity_more()}</span>
		</div>

		<dl class="flex flex-wrap gap-x-12 gap-y-6">
			<div class="flex flex-col-reverse gap-1.5">
				<dt class="text-sm text-muted-foreground">{totalLabel}</dt>
				<dd class="font-display text-5xl leading-none font-black tracking-tight tabular-nums sm:text-6xl">{formatNumber(total)}</dd>
			</div>
			<div class="flex flex-col-reverse gap-1.5">
				<dt class="text-sm text-muted-foreground">{streakLabel}</dt>
				<dd class="font-display text-5xl leading-none font-black tracking-tight tabular-nums sm:text-6xl">{formatNumber(streak)}</dd>
			</div>
		</dl>
	</div>
</div>

<style>
	/* The content column (the scroller's content box has the same width) sizes the cells */
	.calendar {
		container-type: inline-size;
		--cell: clamp(1.125rem, (100cqw - 1.75rem) / var(--weeks), 2.75rem);
	}

	.sky {
		--fade-left: 0rem;
		--fade-right: 0rem;
		/* Hidden under the still weekday labels (phones): the gutter and the label column */
		--under: 0rem;
		mask-image: linear-gradient(90deg, transparent var(--under), #000 calc(var(--under) + var(--fade-left)), #000 calc(100% - var(--fade-right)), transparent);
		scrollbar-width: thin;
	}

	@media (max-width: 39.99rem) {
		.sky {
			--under: 2.75rem;
		}
	}

	.sky[data-more-left] {
		--fade-left: 1.75rem;
	}

	.sky[data-more-right] {
		--fade-right: 3rem;
	}

	/* The chevrons beside the faded edges, over the seven rows of days */
	.cue {
		fill: none;
		stroke: var(--color-ochre);
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	:global(:root:not(.dark)) .cue {
		stroke: #8a5a12;
	}

	.day:focus-visible {
		outline: 2px solid var(--focus-ring);
		outline-offset: -1px;
	}

	.star {
		display: block;
		border-radius: 50%;
		background: var(--star);
		--star: var(--color-ochre);
		--speck: color-mix(in oklab, var(--foreground) 34%, transparent);
	}

	:global(.dark) .star {
		--star: var(--color-butter);
		--speck: color-mix(in oklab, var(--foreground) 24%, transparent);
	}

	.star[data-level='0'] {
		width: min(14%, 0.3rem);
		height: min(14%, 0.3rem);
		min-width: 2px;
		min-height: 2px;
		background: var(--speck);
	}

	.star[data-level='1'] {
		width: min(30%, 0.55rem);
		height: min(30%, 0.55rem);
		min-width: 4px;
		min-height: 4px;
		opacity: 0.75;
	}

	.star[data-level='2'] {
		width: min(42%, 0.8rem);
		height: min(42%, 0.8rem);
		opacity: 0.9;
	}

	.star[data-level='3'] {
		width: min(54%, 1.05rem);
		height: min(54%, 1.05rem);
	}

	.star[data-level='4'] {
		width: min(66%, 1.3rem);
		height: min(66%, 1.3rem);
		box-shadow: 0 0 0 2px color-mix(in oklab, var(--star) 25%, transparent);
	}

	/* Phones: stars at least 10 px in the 18 px cells, a slimmer ring on the brightest so neighbours never touch */
	@media (max-width: 39.99rem) {
		.star[data-level='0'] {
			width: 4px;
			height: 4px;
		}

		.star[data-level='1'] {
			width: 10px;
			height: 10px;
		}

		.star[data-level='2'] {
			width: 12px;
			height: 12px;
		}

		.star[data-level='3'] {
			width: 14px;
			height: 14px;
		}

		.star[data-level='4'] {
			width: 16px;
			height: 16px;
			box-shadow: 0 0 0 1px color-mix(in oklab, var(--star) 30%, transparent);
		}
	}

	/* Paper: the faint levels stay nearly solid ochre, so they hold their own on the light ground */
	:global(:root:not(.dark)) .star[data-level='1'] {
		opacity: 0.85;
	}

	:global(:root:not(.dark)) .star[data-level='2'] {
		opacity: 1;
	}

	:global(.dark) .star[data-level='1'] {
		opacity: 0.6;
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
