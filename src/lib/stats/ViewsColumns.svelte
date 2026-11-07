<!--
	@component
	Daily YouTube views as flat-topped ochre brush strokes (pigment at ~75 %, a slightly brighter cap where the loaded brush
	lands, ~38 % gaps) standing on one irregular ~3 px dry-brush ink stroke. Every stroke is one deterministic path (square top
	with a hair of tilt, slight width jitter, the foot a touch wider); one static filter frays the edges and pulls vertical
	bristle streaks through the pigment. The best day carries one small butter firefly. The y axis runs to the real maximum
	rounded up to a nice step (3.593 → 4.000), 12 px labels on hairline ticks.

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
		const bar = Math.max(2, Math.min(16, slot * 0.58));
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
				return { center, y, d: stroke(index, center, y, base, bar), cap: cap(index, center, y, bar) };
			}),
			ground: groundPath(w, base)
		};
	});

	/** One brush stroke: square top with a hair of tilt, slight width jitter, sides that waver, the foot a touch wider. */
	function stroke(index: number, center: number, top: number, base: number, bar: number) {
		const half = (bar * (0.94 + hash(index, 2) * 0.12)) / 2;
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

	/** The cap: the top 6–9 px of the same stroke (fading downward, see the gradient), where the loaded brush first touches the paper (same tilt and width). */
	function cap(index: number, center: number, top: number, bar: number) {
		const half = (bar * (0.94 + hash(index, 2) * 0.12)) / 2;
		const tilt = (hash(index, 3) - 0.5) * Math.min(1.4, bar * 0.12);
		const depth = 6 + hash(index, 17) * 3;
		return [
			`M${r(center - half)} ${r(top - tilt)}`,
			`L${r(center + half)} ${r(top + tilt)}`,
			`L${r(center + half)} ${r(top + tilt + depth)}`,
			`L${r(center - half)} ${r(top - tilt + depth * 0.8)}Z`
		].join('');
	}

	/** The ground: one irregular dry-brush stroke (~3 px, swelling 2–4 px, a slow waver), tapered where the brush lands and lifts. */
	function groundPath(w: number, base: number) {
		const from = PAD.left - 8;
		const to = w - PAD.right + 3;
		const steps = Math.max(8, Math.round((to - from) / 14));
		const upper: string[] = [];
		const lower: string[] = [];
		for (let step = 0; step <= steps; step++) {
			const t = step / steps;
			const x = from + (to - from) * t;
			const swell = 2.4 + hash(Math.floor(step / 4), 18) * 1.4 + hash(step, 19) * 0.5;
			const taper = Math.min(1, t / 0.05, (1 - t) / 0.09);
			const thick = swell * (0.3 + 0.7 * taper);
			const middle = base + 2 + Math.sin(t * 4.1 + 0.7) * 0.7 + Math.sin(t * 13 + 2) * 0.25 + (hash(step, 20) - 0.5) * 0.3;
			upper.push(`${r(x)} ${r(middle - thick * 0.45)}`);
			lower.push(`${r(x)} ${r(middle + thick * 0.55)}`);
		}
		return `M${upper.join('L')}L${lower.toReversed().join('L')}Z`;
	}

	const labelEvery = $derived(Math.ceil(rows.length / Math.max(2, Math.floor(layout.w / 90))));

	/** The day being read (pointer or keyboard); null = no reading pill. */
	let active = $state<number | null>(null);
	let focused = $state(false);
	let keyed = $state<number | null>(null);
	/** The keyboard position, clamped: switching to a shorter period keeps `keyed` from an earlier, longer one. */
	const position = $derived(Math.min(keyed ?? layout.best, rows.length - 1));

	function scrub(event: PointerEvent) {
		const box = (event.currentTarget as HTMLElement).getBoundingClientRect();
		const index = Math.floor((event.clientX - box.left - PAD.left) / layout.slot);
		active = index >= 0 && index < rows.length ? index : null;
	}

	function key(event: KeyboardEvent) {
		const from = position;
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
	aria-valuenow={position + 1}
	aria-valuetext={reading(position)}
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
			<!-- The ground: horizontal bristle streaks dragged through the stroke, a few thin breaks where the brush runs dry -->
			<filter id="dry-{id}" x="-2%" y="-200%" width="104%" height="500%" color-interpolation-filters="sRGB">
				<feTurbulence type="fractalNoise" baseFrequency="0.5 0.3" numOctaves="1" seed="5" result="fray" />
				<feDisplacementMap in="SourceGraphic" in2="fray" scale="1.4" xChannelSelector="R" yChannelSelector="G" result="shape" />
				<feTurbulence type="fractalNoise" baseFrequency="0.018 0.7" numOctaves="2" seed="13" result="bristle" />
				<feColorMatrix in="bristle" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -2.6 0 0 0 2.05" result="grain" />
				<feComposite in="shape" in2="grain" operator="in" />
			</filter>
			<!-- The cap: the brighter pigment where the loaded brush lands, running out into the stroke -->
			<linearGradient id="cap-{id}" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" style:stop-color="var(--cap)" style:stop-opacity="var(--cap-alpha)" />
				<stop offset="0.45" style:stop-color="var(--cap)" style:stop-opacity="var(--cap-alpha)" />
				<stop offset="1" stop-color="var(--cap)" stop-opacity="0" />
			</linearGradient>
			<!-- The firefly's light -->
			<radialGradient id="firefly-{id}">
				<stop offset="0" style:stop-color="var(--firefly-glow)" style:stop-opacity="var(--firefly-glow-alpha)" />
				<stop offset="0.4" style:stop-color="var(--firefly-glow)" style:stop-opacity="calc(var(--firefly-glow-alpha) * 0.35)" />
				<stop offset="1" stop-color="var(--firefly-glow)" stop-opacity="0" />
			</radialGradient>
		</defs>
		{#each layout.guides as guide (guide.value)}
			<line x1={PAD.left} x2={layout.w - PAD.right} y1={guide.y} y2={guide.y} class="guide" />
			<line x1={PAD.left - 5} x2={PAD.left} y1={guide.y} y2={guide.y} class="tick-mark" />
			<text x={PAD.left - 9} y={guide.y + 4} text-anchor="end" class="tick">{formatCompact(guide.value)}</text>
		{/each}
		<g filter="url(#brush-{id})">
			{#each layout.bars as bar, index (index)}
				<g opacity={shown === null || shown === index ? 1 : 0.45} class="transition-opacity duration-200">
					<path d={bar.d} class="stroke" />
					<path d={bar.cap} fill="url(#cap-{id})" />
				</g>
			{/each}
		</g>
		{#each layout.bars as bar, index (index)}
			{#if index % labelEvery === (rows.length - 1) % labelEvery}
				<text x={bar.center} y={layout.h - 6} text-anchor={index === rows.length - 1 ? 'end' : 'middle'} class="tick">{formatDay(rows[index].date)}</text>
			{/if}
		{/each}
		<path d={layout.ground} class="ground" filter="url(#dry-{id})" />
		<!-- The best day: one small firefly hovering over its stroke -->
		<circle cx={r(layout.bars[layout.best].center)} cy={r(layout.bars[layout.best].y - 11)} r="12" fill="url(#firefly-{id})" />
		<circle cx={r(layout.bars[layout.best].center)} cy={r(layout.bars[layout.best].y - 11)} r="2.8" class="firefly" />
	</svg>

	{#if shown !== null}
		<div
			class="pointer-events-none absolute -translate-x-1/2 -translate-y-[calc(100%+8px)] rounded-full bg-night px-2.5 py-0.5 text-xs whitespace-nowrap text-cream tabular-nums dark:bg-cream dark:text-night"
			style:left="{Math.min(Math.max(layout.bars[shown].center, 64), layout.w - 64)}px"
			style:top="{layout.bars[shown].y - (shown === layout.best ? 16 : 0)}px"
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
		/* Paper: deep ochre (the brand ochre with a breath of burnt umber) laid at ~75 %, the cap a touch brighter at full load */
		--pigment: color-mix(in oklab, var(--color-ochre) 82%, #8a5a12);
		--pigment-alpha: 0.75;
		--cap: var(--color-ochre);
		--cap-alpha: 0.95;
		/* The ground in the hill's warm sumi */
		--earth: #2a2418;
		--earth-alpha: 0.88;
		--firefly: var(--color-butter);
		--firefly-ring: color-mix(in oklab, #b9780f 55%, transparent);
		--firefly-glow: var(--color-ochre);
		--firefly-glow-alpha: 0.7;
	}

	:global(.dark) .columns {
		--pigment: var(--color-ochre);
		--cap: color-mix(in oklab, var(--color-ochre) 70%, var(--color-butter));
		--cap-alpha: 0.85;
		--earth: var(--color-cream);
		--earth-alpha: 0.62;
		--firefly-ring: var(--color-butter);
		--firefly-glow: var(--color-butter);
		--firefly-glow-alpha: 0.7;
	}

	.stroke {
		fill: var(--pigment);
		fill-opacity: var(--pigment-alpha);
	}

	.ground {
		fill: var(--earth);
		fill-opacity: var(--earth-alpha);
	}

	.firefly {
		fill: var(--firefly);
		stroke: var(--firefly-ring);
		stroke-width: 0.8;
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
