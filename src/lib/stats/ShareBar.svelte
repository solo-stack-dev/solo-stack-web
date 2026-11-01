<!--
	@component
	Tall segmented bar: each platform's share of the total reach today. Same entities and colors as the stacked growth
	chart. Shares print inside a block only when it is wide enough; every value is in the accessible list.
-->
<script lang="ts">
	import { getSocial } from '#lib/home/data/socials.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { LAST_DAY, SERIES_COLOR, SERIES_KEYS, seriesValues, type SeriesKey } from './derive.ts';
	import { formatNumber, formatShare } from './format.ts';
	import type { Stats } from './schema.ts';

	let { stats }: { stats: Stats } = $props();

	const parts = $derived.by(() => {
		const values = seriesValues(stats, LAST_DAY);
		const total = SERIES_KEYS.reduce((sum, key) => sum + values[key], 0) || 1;
		return SERIES_KEYS.map((key) => ({ key, value: values[key], share: values[key] / total }));
	});

	// Label ink inside a block, by the pigment's luminance (>= 4.5:1 in both themes): white on the dark blue and
	// violet of the paper theme, near black everywhere else.
	const INK: Record<SeriesKey, string> = {
		youtube: 'text-night',
		tiktok: 'text-white dark:text-night',
		instagram: 'text-night',
		x: 'text-white dark:text-night',
		other: 'text-night'
	};

	const label = (key: SeriesKey) => (key === 'other' ? m.stats_growth_other() : getSocial(key).name);
</script>

<figure class="grid gap-3">
	<figcaption class="text-xs font-medium text-muted-foreground">{m.stats_share_title()}</figcaption>
	<div class="flex h-7 gap-0.5" aria-hidden="true">
		{#each parts as part (part.key)}
			{#if part.value > 0}
				<div
					class="flex min-w-0 items-center rounded px-2 text-[0.7rem] font-semibold first:rounded-l-md last:rounded-r-md {INK[part.key]}"
					style:flex-grow={part.share}
					style:flex-basis="0"
					style:background={SERIES_COLOR[part.key]}
					title="{label(part.key)}: {formatShare(part.share)}"
				>
					{#if part.share >= 0.09}<span class="truncate tabular-nums">{formatShare(part.share)}</span>{/if}
				</div>
			{/if}
		{/each}
	</div>
	<ul class="flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
		{#each parts as part (part.key)}
			<li class="flex items-center gap-1.5">
				<span class="size-2.5 rounded-[2px]" style:background={SERIES_COLOR[part.key]} aria-hidden="true"></span>
				<span>{label(part.key)}</span>
				<span class="sr-only">{formatShare(part.share)} ({formatNumber(part.value)})</span>
			</li>
		{/each}
	</ul>
</figure>
