<!--
	@component
	The total follower curve of the period, painted as a landscape: the line is a hill ridge (ink on paper, moonlit rim
	at night) that ends on a cliff, like the laptop cliff of the Nachtstudio banner, and the painted moon rises beyond
	it. A faint second ridge behind adds depth. Hover or drag to read a day. Plain SVG, no chart library; the edges
	bleed through one cheap turbulence filter. Screen readers get the numbers from the table in Horizon.
-->
<script lang="ts">
	import { curveMonotoneX, line as d3line } from 'd3-shape';
	import moon from '#lib/home/sections/hero/assets/hero-moon-disc.webp?w=480;300&quality=42&enhanced';
	import { formatDay, formatNumber } from './format.ts';

	interface Props {
		values: readonly number[];
		dates: readonly Date[];
		class?: string;
	}

	let { values, dates, class: className = '' }: Props = $props();

	let width = $state(1200);
	let height = $state(340);

	const id = $props.id();

	const geometry = $derived.by(() => {
		const w = Math.max(320, width);
		const h = Math.max(160, height);
		const narrow = w < 640;
		const endX = w * (narrow ? 0.68 : 0.8);
		const min = Math.min(...values);
		const max = Math.max(...values);
		const span = max - min || 1;
		const top = h * 0.14;
		const bottom = h * 0.72;
		const last = values.length - 1 || 1;
		const points = values.map((value, index) => [(index / last) * endX, bottom - ((value - min) / span) * (bottom - top)] as [number, number]);
		// Let the ridge start just outside the left edge, so it reads as a landscape and not as a chart box.
		points[0] = [-4, points[0][1]];
		const ridge = d3line().curve(curveMonotoneX)(points) ?? '';
		const [ex, ey] = points[points.length - 1];
		// The cliff: a short flat ledge, then a steep, slightly undercut drop to the ground.
		const cliff = `L${ex + 10} ${ey + 1}C${ex + 20} ${ey + 4} ${ex + 14} ${ey + h * 0.2} ${ex + 26} ${ey + h * 0.32}S${ex + 30} ${h * 0.9} ${ex + 48} ${h + 2}`;
		const body = `${ridge}${cliff}L-4 ${h + 2}Z`;

		// A distant ridge behind: the same curve, flattened and lifted, running on past the cliff.
		const far = points.map(([x, y]) => [x * 1.12 - 30, top * 0.6 + (y - top) * 0.55] as [number, number]);
		far.push([w + 10, far[far.length - 1][1] + h * 0.18]);
		const farRidge = d3line().curve(curveMonotoneX)(far) ?? '';

		const moonSize = Math.round(Math.min(narrow ? 120 : 230, h * 0.62, (w - ex) * (narrow ? 0.95 : 0.9)));
		return {
			w,
			h,
			points,
			ridge,
			body,
			far: `${farRidge}L${w + 10} ${h + 2}L-30 ${h + 2}Z`,
			end: [ex, ey] as const,
			moon: { size: moonSize, x: Math.min(w - moonSize / 2 - 8, ex + moonSize * 0.62), y: Math.max(moonSize / 2 + 4, ey - moonSize * 0.42) }
		};
	});

	let active = $state<number | null>(null);

	function scrub(event: PointerEvent) {
		const box = (event.currentTarget as HTMLElement).getBoundingClientRect();
		const x = event.clientX - box.left;
		const fraction = x / geometry.end[0];
		if (fraction > 1.04) return void (active = null);
		active = Math.max(0, Math.min(values.length - 1, Math.round(fraction * (values.length - 1))));
	}

	const marker = $derived(active === null ? null : { x: geometry.points[active][0], y: geometry.points[active][1], value: values[active], date: dates[active] });
</script>

<div
	class="ridge relative {className}"
	bind:clientWidth={width}
	bind:clientHeight={height}
	onpointermove={scrub}
	onpointerdown={scrub}
	onpointerleave={() => (active = null)}
	aria-hidden="true"
>
	<!-- The moon sits behind the landscape -->
	<div
		class="moon pointer-events-none absolute -translate-1/2"
		style:left="{geometry.moon.x}px"
		style:top="{geometry.moon.y}px"
		style:width="{geometry.moon.size}px"
		style:height="{geometry.moon.size}px"
	>
		<enhanced:img src={moon} alt="" sizes="(min-width: 640px) 230px, 120px" class="size-full" fetchpriority="high" />
	</div>

	<svg viewBox="0 0 {geometry.w} {geometry.h}" width={geometry.w} height={geometry.h} class="absolute inset-0 size-full overflow-visible">
		<defs>
			<filter id="bleed-{id}" x="-5%" y="-10%" width="110%" height="130%">
				<feTurbulence type="fractalNoise" baseFrequency="0.012 0.05" numOctaves="2" seed="4" />
				<feDisplacementMap in="SourceGraphic" scale="9" />
			</filter>
			<linearGradient id="body-{id}" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stop-color="var(--ridge-top)" stop-opacity="var(--ridge-top-alpha)" />
				<stop offset="0.55" stop-color="var(--ridge-mid)" stop-opacity="var(--ridge-mid-alpha)" />
				<stop offset="1" stop-color="var(--background)" stop-opacity="1" />
			</linearGradient>
			<linearGradient id="far-{id}" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stop-color="var(--ridge-far)" stop-opacity="var(--ridge-far-alpha)" />
				<stop offset="0.7" stop-color="var(--background)" stop-opacity="0" />
			</linearGradient>
		</defs>

		<path d={geometry.far} fill="url(#far-{id})" filter="url(#bleed-{id})" />
		<path d={geometry.body} fill="url(#body-{id})" filter="url(#bleed-{id})" />
		<!-- Rim light on the ridge (a soft wide stroke) and the ink line on top -->
		{#key values.length}
			<path d={geometry.ridge} fill="none" stroke="var(--ridge-rim)" stroke-width="10" stroke-opacity="var(--ridge-rim-alpha)" stroke-linecap="round" class="rim" />
			<path d={geometry.ridge} pathLength="1" fill="none" stroke="var(--ridge-line)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ink" />
		{/key}

		{#if marker}
			<line x1={marker.x} x2={marker.x} y1={marker.y} y2={geometry.h} stroke="var(--ridge-line)" stroke-opacity="0.5" stroke-dasharray="2 4" />
			<circle cx={marker.x} cy={marker.y} r="5" fill="var(--background)" stroke="var(--ridge-line)" stroke-width="2" />
		{/if}
		<!-- Today: a small light on the cliff edge -->
		<circle cx={geometry.end[0]} cy={geometry.end[1]} r="9" fill="var(--color-butter)" opacity="0.35" class="beacon" />
		<circle cx={geometry.end[0]} cy={geometry.end[1]} r="4.5" fill="var(--color-butter)" stroke="var(--ridge-line)" stroke-width="1.5" />
	</svg>

	<span class="absolute bottom-3 left-4 font-mono text-[0.7rem] text-muted-foreground sm:left-6 lg:left-8">{formatDay(dates[0])}</span>
	<span class="absolute bottom-3 font-mono text-[0.7rem] text-muted-foreground" style:left="{geometry.end[0] - 4}px" style:transform="translateX(-100%)"
		>{formatDay(dates[dates.length - 1])}</span
	>

	{#if marker}
		<div
			class="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[calc(100%+14px)] rounded-full bg-night px-3 py-1 font-mono text-xs whitespace-nowrap text-cream tabular-nums shadow-lg dark:bg-cream dark:text-night"
			style:left="{Math.min(Math.max(marker.x, 60), geometry.w - 60)}px"
			style:top="{marker.y}px"
		>
			<strong class="font-semibold">{formatNumber(marker.value)}</strong> · {formatDay(marker.date)}
		</div>
	{/if}
</div>

<style>
	.ridge {
		touch-action: pan-y;
		--ridge-top: var(--color-butter);
		--ridge-top-alpha: 0.85;
		--ridge-mid: var(--color-butter);
		--ridge-mid-alpha: 0.35;
		--ridge-far: var(--color-ochre);
		--ridge-far-alpha: 0.28;
		--ridge-rim: var(--color-butter);
		--ridge-rim-alpha: 0;
		--ridge-line: var(--color-night);
	}

	:global(.dark) .ridge {
		--ridge-top: var(--color-dusk);
		--ridge-top-alpha: 1;
		--ridge-mid: #1f1f20;
		--ridge-mid-alpha: 1;
		--ridge-far: #f6e7b8;
		--ridge-far-alpha: 0.07;
		--ridge-rim: var(--color-butter);
		--ridge-rim-alpha: 0.16;
		--ridge-line: var(--color-butter);
	}

	.moon {
		filter: drop-shadow(0 0 28px rgb(252 215 114 / 0.35));
	}

	:global(.dark) .moon {
		filter: drop-shadow(0 0 60px rgb(252 215 114 / 0.45));
	}

	.rim {
		filter: blur(4px);
		animation: fade-in 1.4s ease-out both;
	}

	/* The ink line draws itself from left to right (on load and on every period change) */
	.ink {
		stroke-dasharray: 1;
		animation: draw 1.4s cubic-bezier(0.33, 1, 0.68, 1) both;
	}

	@keyframes draw {
		from {
			stroke-dashoffset: 1;
		}
		to {
			stroke-dashoffset: 0;
		}
	}

	@keyframes fade-in {
		from {
			opacity: 0;
		}
	}

	.beacon {
		transform-box: fill-box;
		transform-origin: center;
		animation: beacon 2.8s ease-in-out infinite;
	}

	@keyframes beacon {
		50% {
			transform: scale(1.9);
			opacity: 0.08;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.beacon,
		.ink,
		.rim {
			animation: none;
		}
	}
</style>
