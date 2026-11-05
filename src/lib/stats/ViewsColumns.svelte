<!--
	@component
	Daily YouTube views as flat-topped ochre brush strokes standing on a shallow dry-brush baseline (a few sparse tufts, the
	hill's material). Every stroke is one deterministic path (square top with a hair of tilt, slight width jitter, the foot a
	touch wider where the brush lands); one static filter frays the edges and pulls vertical bristle streaks through the pigment.
	The y axis runs to the real maximum rounded up to a nice step (3.593 → 4.000), 12 px labels on hairline ticks.

	The reading pill appears only on hover/drag or keyboard focus: one tab stop, arrow keys move by day, Home/End jump to the
	ends; on focus it starts on the best day. Plain SVG (measured width).
-->
<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { formatCompact, formatDay, formatNumber } from './format.ts';

	let { rows, class: className = '' }: { rows: { date: Date; views: number }[]; class?: string } = $props();

	let width = $state(640);
	let height = $state(260);
	const id = $props.id();

	const PAD = { left: 46, right: 4, top: 14, bottom: 30 };

	/** Deterministic 0…1 noise per index and salt. */
	const hash = (index: number, salt: number) => {
		const value = Math.sin(index * 127.1 + salt * 311.7) * 43758.5453;
		return value - Math.floor(value);
	};
	const r = (value: number) => Math.round(value * 10) / 10;

	/** The smallest nice step (1, 2, 2.5, 5 × 10ⁿ) that covers the maximum in at most five guides; the top is the maximum rounded up to it. */
	function scale(max: number) {
		const magnitude = 10 ** Math.floor(Math.log10(max));
		for (const exponent of [magnitude / 10, magnitude])
			for (const nice of [1, 2, 2.5, 5]) {
				const step = nice * exponent;
				if (Math.ceil(max / step) <= 5) return { step, top: Math.ceil(max / step) * step };
			}
		return { step: magnitude * 10, top: magnitude * 10 };
	}

	const layout = $derived.by(() => {
		const w = Math.max(240, width);
		const h = Math.max(160, height);
		const max = Math.max(1, ...rows.map((row) => row.views));
		const { step, top } = scale(max);
		const plotW = w - PAD.left - PAD.right;
		const plotH = h - PAD.top - PAD.bottom;
		const base = PAD.top + plotH;
		const slot = plotW / rows.length;
		const bar = Math.max(2, Math.min(18, slot * 0.62));
		const best = rows.reduce((bestIndex, row, index) => (row.views > rows[bestIndex].views ? index : bestIndex), 0);
		return {
			w,
			h,
			slot,
			bar,
			best,
			base,
			guides: Array.from({ length: Math.round(top / step) }, (_, part) => {
				const value = step * (part + 1);
				return { value, y: r(base - (plotH * value) / top) };
			}),
			bars: rows.map((row, index) => {
				const y = base - Math.max(2, (row.views / top) * plotH);
				const center = PAD.left + slot * (index + 0.5) + (hash(index, 1) - 0.5) * bar * 0.08;
				return { center, y, d: stroke(index, center, y, base, bar) };
			}),
			ground: groundPath(w, base)
		};
	});

	/** One brush stroke: square top with a hair of tilt, slight width jitter, sides that waver, the foot a touch wider. */
	function stroke(index: number, center: number, top: number, base: number, bar: number) {
		const half = (bar * (0.88 + hash(index, 2) * 0.24)) / 2;
		const tilt = (hash(index, 3) - 0.5) * Math.min(1.4, bar * 0.12);
		const mid = top + (base - top) * (0.35 + hash(index, 4) * 0.3);
		const waver = (salt: number) => (hash(index, salt) - 0.5) * Math.min(0.9, bar * 0.08);
		const foot = Math.min(0.8, bar * 0.06);
		return [
			`M${r(center - half - foot)} ${r(base + 1)}`,
			`L${r(center - half + waver(5))} ${r(mid)}`,
			`L${r(center - half)} ${r(top - tilt)}`,
			`L${r(center + half)} ${r(top + tilt)}`,
			`L${r(center + half + waver(6))} ${r(mid)}`,
			`L${r(center + half + foot)} ${r(base + 1)}Z`
		].join('');
	}

	/** The ground: a shallow dry-brush stroke (2–4 px deep) broken by a few irregular gaps, with sparse tufts of grass. */
	function groundPath(w: number, base: number) {
		const end = w - PAD.right + 3;
		let d = '';
		let x = PAD.left - 8;
		for (let index = 0; x < end; index++) {
			const length = Math.min(end - x, 34 + hash(index, 7) * 120);
			const depth = 2 + hash(index, 8) * 2;
			const lift = (hash(index, 9) - 0.5) * 0.8;
			const sag = (hash(index, 10) - 0.5) * 0.9;
			// Thin entry, full body, dry tail
			d += `M${r(x)} ${r(base + 0.6 + lift)}`;
			d += `Q${r(x + length * 0.5)} ${r(base - 0.3 + sag)} ${r(x + length)} ${r(base + 0.4)}`;
			d += `L${r(x + length - 2)} ${r(base + depth * 0.55)}`;
			d += `Q${r(x + length * 0.5)} ${r(base + depth + sag)} ${r(x + 3)} ${r(base + depth * 0.8 + lift)}Z`;
			x += length + 2 + hash(index, 11) * 5;
		}
		// Sparse tufts: two or three short blades every 90–200 px
		for (let tuft = PAD.left + 20 + hash(0, 12) * 60, index = 0; tuft < end - 8; tuft += 90 + hash(index, 13) * 110, index++) {
			const blades = 2 + Math.round(hash(index, 14));
			for (let blade = 0; blade < blades; blade++) {
				const bx = tuft + blade * 2.4;
				const tall = 3.5 + hash(index * 3 + blade, 15) * 3.5;
				const lean = (hash(index * 3 + blade, 16) - 0.35) * 3;
				d += `M${r(bx - 0.9)} ${r(base + 1)}L${r(bx + lean)} ${r(base - tall)}L${r(bx + 0.9)} ${r(base + 1)}Z`;
			}
		}
		return d;
	}

	const labelEvery = $derived(Math.ceil(rows.length / Math.max(2, Math.floor(layout.w / 90))));

	/** The day being read (pointer or keyboard); null = no reading pill. */
	let active = $state<number | null>(null);
	let focused = $state(false);
	let keyed = $state<number | null>(null);

	function scrub(event: PointerEvent) {
		const box = (event.currentTarget as HTMLElement).getBoundingClientRect();
		const index = Math.floor((event.clientX - box.left - PAD.left) / layout.slot);
		active = index >= 0 && index < rows.length ? index : null;
	}

	function key(event: KeyboardEvent) {
		const from = keyed ?? layout.best;
		const next = { ArrowLeft: from - 1, ArrowDown: from - 1, ArrowRight: from + 1, ArrowUp: from + 1, Home: 0, End: rows.length - 1 }[event.key] ?? null;
		if (next === null) return;
		event.preventDefault();
		keyed = active = Math.max(0, Math.min(rows.length - 1, next));
	}

	const shown = $derived(active === null ? null : Math.min(active, rows.length - 1));
	const reading = (index: number) => `${formatNumber(rows[index].views)} · ${formatDay(rows[index].date)}`;
</script>

<div
	class="columns relative rounded-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--focus-ring) {className}"
	bind:clientWidth={width}
	bind:clientHeight={height}
	onpointermove={scrub}
	onpointerdown={scrub}
	onpointerleave={() => (active = focused ? keyed : null)}
	onfocus={() => {
		focused = true;
		active = keyed ??= layout.best;
	}}
	onblur={() => {
		focused = false;
		active = null;
	}}
	onkeydown={key}
	tabindex="0"
	role="slider"
	aria-label="{m.stats_youtube_views_chart()}: {formatNumber(rows.reduce((sum, row) => sum + row.views, 0))}"
	aria-valuemin={1}
	aria-valuemax={rows.length}
	aria-valuenow={(keyed ?? layout.best) + 1}
	aria-valuetext={reading(Math.min(keyed ?? layout.best, rows.length - 1))}
>
	<svg viewBox="0 0 {layout.w} {layout.h}" width={layout.w} height={layout.h} class="absolute inset-0 size-full" aria-hidden="true">
		<defs>
			<!-- Dry brush: frayed edges, faint vertical bristle streaks thinning the pigment here and there -->
			<filter id="brush-{id}" x="-10%" y="-4%" width="120%" height="108%" color-interpolation-filters="sRGB">
				<feTurbulence type="fractalNoise" baseFrequency="0.6 0.45" numOctaves="1" seed="3" result="fray" />
				<feDisplacementMap in="SourceGraphic" in2="fray" scale="1.6" xChannelSelector="R" yChannelSelector="G" result="shape" />
				<feTurbulence type="fractalNoise" baseFrequency="0.32 0.007" numOctaves="2" seed="8" result="bristle" />
				<feColorMatrix in="bristle" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -0.55 0 0 0 1.2" result="grain" />
				<feComposite in="shape" in2="grain" operator="in" />
			</filter>
		</defs>
		{#each layout.guides as guide (guide.value)}
			<line x1={PAD.left} x2={layout.w - PAD.right} y1={guide.y} y2={guide.y} class="guide" />
			<line x1={PAD.left - 5} x2={PAD.left} y1={guide.y} y2={guide.y} class="tick-mark" />
			<text x={PAD.left - 9} y={guide.y + 4} text-anchor="end" class="tick">{formatCompact(guide.value)}</text>
		{/each}
		<g class="strokes" filter="url(#brush-{id})">
			{#each layout.bars as bar, index (index)}
				<path d={bar.d} opacity={shown === null || shown === index ? 1 : 0.42} class="transition-opacity duration-200" />
			{/each}
		</g>
		{#each layout.bars as bar, index (index)}
			{#if index % labelEvery === (rows.length - 1) % labelEvery}
				<text x={bar.center} y={layout.h - 6} text-anchor={index === rows.length - 1 ? 'end' : 'middle'} class="tick">{formatDay(rows[index].date)}</text>
			{/if}
		{/each}
		<path d={layout.ground} class="ground" />
	</svg>

	{#if shown !== null}
		<div
			class="pointer-events-none absolute -translate-x-1/2 -translate-y-[calc(100%+8px)] rounded-full bg-night px-2.5 py-0.5 text-xs whitespace-nowrap text-cream tabular-nums dark:bg-cream dark:text-night"
			style:left="{Math.min(Math.max(layout.bars[shown].center, 64), layout.w - 64)}px"
			style:top="{layout.bars[shown].y}px"
			aria-hidden="true"
		>
			<strong class="font-semibold">{formatNumber(rows[shown].views)}</strong> · {formatDay(rows[shown].date)}
		</div>
	{/if}
</div>

<style>
	.columns {
		touch-action: pan-y;
		color: var(--foreground);
		/* Deep ochre on paper (the brand ochre with a breath of burnt umber), brighter ochre at night */
		--pigment: color-mix(in oklab, var(--color-ochre) 80%, #8a5a12);
		--earth: var(--color-ink);
	}

	:global(.dark) .columns {
		--pigment: color-mix(in oklab, var(--color-ochre) 70%, var(--color-butter));
		--earth: color-mix(in oklab, var(--color-cream) 34%, transparent);
	}

	.strokes {
		fill: var(--pigment);
	}

	.ground {
		fill: var(--earth);
	}

	.guide {
		stroke: currentColor;
		stroke-opacity: 0.1;
		stroke-width: 1;
		shape-rendering: crispEdges;
	}

	.tick-mark {
		stroke: var(--muted-foreground);
		stroke-opacity: 0.7;
		stroke-width: 1;
		shape-rendering: crispEdges;
	}

	.tick {
		font: 12px var(--font-sans);
		font-variant-numeric: tabular-nums;
		fill: var(--muted-foreground);
	}
</style>
