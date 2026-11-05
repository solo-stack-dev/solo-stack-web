<!--
	@component
	Daily YouTube views as columns of light rising out of a strip of ink ground (silhouette grass, the hill's material), best day
	marked, dotted guides. Hover or drag to read a day. Plain SVG (measured width).
-->
<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { formatCompact, formatDay, formatNumber } from './format.ts';

	let { rows, class: className = '' }: { rows: { date: Date; views: number }[]; class?: string } = $props();

	let width = $state(640);
	let height = $state(260);
	const id = $props.id();

	const PAD = { left: 40, right: 4, top: 26, bottom: 30 };

	const fract = (value: number) => value - Math.floor(value);

	const layout = $derived.by(() => {
		const w = Math.max(240, width);
		const h = Math.max(160, height);
		const max = Math.max(1, ...rows.map((row) => row.views));
		const step = 10 ** Math.floor(Math.log10(max / 3));
		const top = Math.ceil(max / step / 3) * step * 3;
		const plotW = w - PAD.left - PAD.right;
		const plotH = h - PAD.top - PAD.bottom;
		const slot = plotW / rows.length;
		const bar = Math.max(2, Math.min(18, slot * 0.62));
		const best = rows.reduce((bestIndex, row, index) => (row.views > rows[bestIndex].views ? index : bestIndex), 0);
		return {
			w,
			h,
			slot,
			bar,
			best,
			guides: [1, 2, 3].map((part) => ({ value: (top / 3) * part, y: PAD.top + plotH - (plotH * part) / 3 })),
			bars: rows.map((row, index) => {
				const barH = Math.max(bar, (row.views / top) * plotH);
				return { x: PAD.left + slot * index + (slot - bar) / 2, y: PAD.top + plotH - barH, h: barH };
			}),
			base: PAD.top + plotH,
			ground: groundPath(w, PAD.top + plotH)
		};
	});

	/** Ink ground along the baseline: a low uneven strip with deterministic grass blades in front of the columns' feet. */
	function groundPath(w: number, base: number) {
		let d = `M${PAD.left - 6} ${base + 7}L${PAD.left - 6} ${base + 1}`;
		for (let x = PAD.left - 4, index = 0; x < w - PAD.right; x += 3 + fract(Math.sin(index * 91.7) * 4375.5) * 4, index++) {
			const a = fract(Math.sin(index * 12.9898) * 43758.5453);
			const tall = 2.5 + a * a * 9;
			const lean = (fract(a * 13.1) - 0.5) * 4;
			d += `L${(x - 1.1).toFixed(1)} ${base + 1}L${(x + lean).toFixed(1)} ${(base - tall).toFixed(1)}L${(x + 1.1).toFixed(1)} ${base + 1}`;
		}
		return `${d}L${w - PAD.right + 4} ${base + 1}L${w - PAD.right + 4} ${base + 7}Q${w / 2} ${base + 9} ${PAD.left - 6} ${base + 7}Z`;
	}

	const labelEvery = $derived(Math.ceil(rows.length / Math.max(2, Math.floor(layout.w / 90))));

	let active = $state<number | null>(null);
	function scrub(event: PointerEvent) {
		const box = (event.currentTarget as HTMLElement).getBoundingClientRect();
		const index = Math.floor((event.clientX - box.left - PAD.left) / layout.slot);
		active = index >= 0 && index < rows.length ? index : null;
	}
	const shown = $derived(active ?? layout.best);
</script>

<div
	class="columns relative {className}"
	bind:clientWidth={width}
	bind:clientHeight={height}
	onpointermove={scrub}
	onpointerdown={scrub}
	onpointerleave={() => (active = null)}
	role="img"
	aria-label="{m.stats_youtube_views_chart()}: {formatNumber(rows.reduce((sum, row) => sum + row.views, 0))}"
>
	<svg viewBox="0 0 {layout.w} {layout.h}" width={layout.w} height={layout.h} class="absolute inset-0 size-full" aria-hidden="true">
		<defs>
			<linearGradient id="col-{id}" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stop-color="var(--col-top)" />
				<stop offset="1" stop-color="var(--col-bottom)" stop-opacity="var(--col-bottom-alpha)" />
			</linearGradient>
		</defs>
		{#each layout.guides as guide (guide.value)}
			<line x1={PAD.left} x2={layout.w - PAD.right} y1={guide.y} y2={guide.y} stroke="currentColor" stroke-opacity="0.14" stroke-dasharray="1 5" stroke-linecap="round" />
			<text x={PAD.left - 8} y={guide.y + 3.5} text-anchor="end" class="tick">{formatCompact(guide.value)}</text>
		{/each}
		{#each layout.bars as bar, index (index)}
			<rect
				x={bar.x}
				y={bar.y}
				width={layout.bar}
				height={bar.h}
				rx={layout.bar / 2}
				fill="url(#col-{id})"
				opacity={active === null || active === index ? 1 : 0.45}
				class="transition-opacity duration-200"
			/>
			{#if index % labelEvery === (rows.length - 1) % labelEvery}
				<text x={bar.x + layout.bar / 2} y={layout.h - 6} text-anchor={index === rows.length - 1 ? 'end' : 'middle'} class="tick">{formatDay(rows[index].date)}</text>
			{/if}
		{/each}
		<path d={layout.ground} class="ground" />
	</svg>

	<div
		class="pointer-events-none absolute -translate-x-1/2 -translate-y-[calc(100%+6px)] rounded-full bg-night px-2.5 py-0.5 font-mono text-[0.7rem] whitespace-nowrap text-cream tabular-nums dark:bg-cream dark:text-night"
		style:left="{Math.min(Math.max(layout.bars[shown].x + layout.bar / 2, 64), layout.w - 64)}px"
		style:top="{layout.bars[shown].y}px"
		aria-hidden="true"
	>
		<strong>{formatNumber(rows[shown].views)}</strong> · {formatDay(rows[shown].date)}
	</div>
</div>

<style>
	.columns {
		touch-action: pan-y;
		color: var(--foreground);
		--col-top: var(--color-ochre);
		--col-bottom: var(--color-butter);
		--col-bottom-alpha: 0.35;
	}

	:global(.dark) .columns {
		--col-top: var(--color-butter);
		--col-bottom: var(--color-butter);
		--col-bottom-alpha: 0.08;
	}

	.ground {
		fill: var(--color-ink);
	}

	:global(.dark) .ground {
		fill: #0b0b0c;
	}

	.tick {
		font: 10px var(--font-mono);
		fill: var(--muted-foreground);
	}
</style>
