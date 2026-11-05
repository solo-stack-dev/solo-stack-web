<!--
	@component
	The follower curve as one illustration: the area under the curve is an ink silhouette hill (dry brush edge, faint pigment
	mottling, a painted foot where the brush runs out at an uneven height), the curve is the glowing path along its crest, and it climbs to the tree of light, whose
	trunk stands exactly on today's value. God rays fan out behind the canopy, a few golden motes drift down, the mascot sits
	small at the tree's foot looking up. Light theme: ink on warm paper with a butter wash behind the tree; dark: backlit night.

	Geometry (hill.ts) lives in fixed virtual canvases (one per layout, switched at 640 px) and the art is placed in percent, so
	the prerendered page is exact at every width. Hover or drag to read a day. The first and last date sit in the ink under the
	path, turned with it (the end date only from 640 px, where it clears the mascot). Screen readers get the table in Horizon.
-->
<script lang="ts">
	import { MediaQuery } from 'svelte/reactivity';
	import wash from '#lib/components/site/assets/backlight-wash.webp?w=960;600&quality=40&enhanced';
	import { InView } from '#lib/home/shared/motion.svelte.ts';
	import mascot from './assets/stats-mascot-sitting.webp?w=280;180;120&quality=70&enhanced';
	import rays from './assets/stats-tree-rays.webp?w=1300;900;600&quality=42&enhanced';
	import tree from './assets/stats-growth-tree.webp?w=1190;900;640;440&quality=60&enhanced';
	import { formatDay, formatNumber } from './format.ts';
	import { LAYOUTS, hill, type HillGeometry, type LayoutName } from './hill.ts';

	interface Props {
		values: readonly number[];
		dates: readonly Date[];
		class?: string;
	}

	let { values, dates, class: className = '' }: Props = $props();

	const NAMES = Object.keys(LAYOUTS) as LayoutName[];
	const geometries = $derived(Object.fromEntries(NAMES.map((name) => [name, hill(values, name)])) as Record<LayoutName, HillGeometry>);

	/** Per layout placements as custom properties; CSS picks the set for the viewport. */
	const placement = $derived(
		NAMES.flatMap((name) => {
			const g = geometries[name];
			const box = (key: string, { left, top, width }: { left: number; top: number; width?: number }) =>
				[`--${name}-${key}-x:${left}%`, `--${name}-${key}-y:${top}%`, width === undefined ? '' : `--${name}-${key}-w:${width}%`].filter(Boolean);
			return [
				`--${name}-aspect:${g.spec.w} / ${g.spec.h}`,
				...box('tree', g.tree),
				...box('rays', g.rays),
				...box('mascot', g.mascot),
				...box('glow', g.glow),
				...box('start', g.startLabel),
				`--${name}-start-a:${g.startLabel.angle}deg`,
				...box('end', g.endLabel),
				`--${name}-end-a:${g.endLabel.angle}deg`
			];
		}).join(';')
	);

	// Pointer scrub (client only): the visible layout decides the geometry.
	const wide = new MediaQuery('(min-width: 40rem)', true);
	const active = $derived(geometries[wide.current ? 'wide' : 'narrow']);
	let index = $state<number | null>(null);

	function scrub(event: PointerEvent) {
		const box = (event.currentTarget as HTMLElement).getBoundingClientRect();
		const x = ((event.clientX - box.left) / box.width) * active.spec.w;
		const [first] = active.points;
		const [last] = active.end;
		const fraction = (x - first[0]) / (last - first[0]);
		if (fraction < -0.03 || fraction > 1.03) return void (index = null);
		index = Math.max(0, Math.min(values.length - 1, Math.round(fraction * (values.length - 1))));
	}

	const marker = $derived(index === null ? null : { value: values[index], date: dates[index] });

	// Motes drift only while the hill is on screen (and never for reduced motion, see CSS).
	const seen = new InView({ rootMargin: '10% 0px' });

	/** Falling motes in percent of the tree box: start x/y, drift, duration, delay, size. */
	const MOTES = [
		[30, 46, 4, 13, 0, 3],
		[62, 40, -5, 16, 3.5, 2.5],
		[45, 52, 6, 12, 7, 2],
		[74, 55, -3, 15, 1.8, 3],
		[22, 58, 5, 14, 9.5, 2],
		[55, 36, -6, 17, 5.5, 2.5],
		[84, 48, -4, 14, 11, 2]
	] as const;
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="hill relative {className}"
	style={placement}
	{@attach seen.attach}
	data-running={seen.current || undefined}
	onpointermove={scrub}
	onpointerdown={scrub}
	onpointerleave={() => (index = null)}
>
	<!-- Backlight: butter pigment wash (multiplied into the paper / glowing in the night), god rays from the canopy -->
	<div class="art glow pointer-events-none" aria-hidden="true">
		<enhanced:img src={wash} alt="" sizes="(min-width: 40rem) min(70vw, 1120px), 120vw" class="size-full" fetchpriority="low" />
	</div>
	<div class="art rays pointer-events-none" aria-hidden="true">
		<enhanced:img src={rays} alt="" sizes="(min-width: 40rem) min(67vw, 1066px), 108vw" class="w-full" fetchpriority="low" />
	</div>

	<!-- The land: far ridge and the ink hill (static, filtered once) -->
	{#each NAMES as name (name)}
		{@const g = geometries[name]}
		<svg viewBox="0 0 {g.spec.w} {g.spec.h}" class="land land-{name} absolute inset-0 size-full overflow-visible" preserveAspectRatio="none" aria-hidden="true">
			<defs>
				<filter id="far-{name}" x="-30%" y="-30%" width="160%" height="160%">
					<feTurbulence type="fractalNoise" baseFrequency="0.01 0.04" numOctaves="2" seed="7" />
					<feDisplacementMap in="SourceGraphic" scale="8" />
					<feGaussianBlur stdDeviation="1.2" />
				</filter>
				<!-- Ink: wobbly bled edge, dry brush fray, faint warm pigment pooling inside -->
				<filter id="ink-{name}" x="-30%" y="-30%" width="160%" height="160%" color-interpolation-filters="sRGB">
					<feTurbulence type="fractalNoise" baseFrequency="0.009 0.04" numOctaves="2" seed="4" result="warp" />
					<feDisplacementMap in="SourceGraphic" in2="warp" scale={name === 'wide' ? 6 : 4} xChannelSelector="R" yChannelSelector="G" result="bled" />
					<feTurbulence type="fractalNoise" baseFrequency="0.35 0.6" numOctaves="1" seed="12" result="fray" />
					<feDisplacementMap in="bled" in2="fray" scale="2.6" xChannelSelector="R" yChannelSelector="G" result="shape" />
					<feTurbulence type="fractalNoise" baseFrequency="0.004 0.011" numOctaves="3" seed="21" result="mottle" />
					<feColorMatrix in="mottle" type="matrix" values="0 0 0 0 0.16  0 0 0 0 0.135  0 0 0 0 0.1  0 0 0 1.5 -0.82" result="pigment" />
					<feComposite in="pigment" in2="shape" operator="in" result="pooled" />
					<feMerge><feMergeNode in="shape" /><feMergeNode in="pooled" /></feMerge>
				</filter>
				<!-- The painted foot: dragged dry-brush streaks where the ink runs out, a hair of softness, no grey ramp -->
				<filter id="brush-{name}" x="-10%" y="-20%" width="120%" height="140%">
					<feTurbulence type="fractalNoise" baseFrequency="0.012 0.42" numOctaves="2" seed="17" result="streaks" />
					<feDisplacementMap in="SourceGraphic" in2="streaks" scale={name === 'wide' ? 22 : 16} xChannelSelector="R" yChannelSelector="G" result="ragged" />
					<feGaussianBlur in="ragged" stdDeviation="0.6" />
				</filter>
				<!-- Backlight behind the land: a dusk band along the horizon and a halo around the tree -->
				<linearGradient id="dusk-{name}" gradientUnits="userSpaceOnUse" x1="0" y1={g.spec.h * 0.15} x2="0" y2={g.spec.h * 0.95}>
					<stop offset="0" stop-color="var(--dusk)" stop-opacity="0" />
					<stop offset="0.75" stop-color="var(--dusk)" stop-opacity="var(--dusk-alpha)" />
					<stop offset="1" stop-color="var(--dusk)" stop-opacity="0" />
				</linearGradient>
				<radialGradient
					id="halo-{name}"
					gradientUnits="userSpaceOnUse"
					cx={g.end[0]}
					cy={g.end[1]}
					r={g.spec.w * (name === 'wide' ? 0.3 : 0.75)}
					gradientTransform="translate({g.end[0]} {g.end[1]}) scale(1 0.55) translate({-g.end[0]} {-g.end[1]})"
				>
					<stop offset="0" stop-color="var(--color-butter)" stop-opacity="var(--halo-alpha)" />
					<stop offset="1" stop-color="var(--color-butter)" stop-opacity="0" />
				</radialGradient>
				<mask id="dissolve-{name}" maskUnits="userSpaceOnUse" x="-420" y="-40" width={g.spec.w + 840} height={g.spec.h + 80}>
					<path d={g.foot} fill="#fff" filter="url(#brush-{name})" />
				</mask>
			</defs>
			<rect x="-400" y="0" width={g.spec.w + 800} height={g.spec.h} fill="url(#dusk-{name})" />
			<rect x="-400" y="-200" width={g.spec.w + 800} height={g.spec.h + 200} fill="url(#halo-{name})" />
			<path d={g.far} class="far" filter="url(#far-{name})" mask="url(#dissolve-{name})" />
			<g mask="url(#dissolve-{name})">
				<path d={g.body} class="ink" filter="url(#ink-{name})" />
			</g>
		</svg>
	{/each}

	<!-- The tree of light on the end point, the mascot at its foot, motes falling from the canopy -->
	<div class="art tree pointer-events-none" aria-hidden="true">
		<enhanced:img
			src={tree}
			alt=""
			sizes="(min-width: 100rem) 560px, (min-width: 40rem) 35vw, 60vw"
			class="w-full"
			fetchpriority="high"
			loading="eager"
			decoding="async"
		/>
		<div class="motes">
			{#each MOTES as [x, y, drift, duration, delay, size], mote (mote)}
				<span
					class="mote"
					style:left="{x}%"
					style:top="{y}%"
					style:--drift="{drift}cqw"
					style:--size="{size}px"
					style:animation-duration="{duration}s"
					style:animation-delay="-{delay}s"
				></span>
			{/each}
		</div>
	</div>
	<div class="art mascot pointer-events-none" aria-hidden="true">
		<enhanced:img src={mascot} alt="" sizes="(min-width: 90rem) 102px, (min-width: 40rem) 7vw, 16vw" class="w-full" />
	</div>

	<!-- The path: glowing crest line (its own layer, so the draw animation never repaints the filtered ink) -->
	{#each NAMES as name (name)}
		{@const g = geometries[name]}
		{#key values.length}
			<svg
				viewBox="0 0 {g.spec.w} {g.spec.h}"
				class="path land-{name} pointer-events-none absolute inset-0 size-full overflow-visible"
				preserveAspectRatio="none"
				aria-hidden="true"
			>
				<defs>
					<linearGradient id="start-{name}" gradientUnits="userSpaceOnUse" x1={g.points[0][0]} y1="0" x2={g.points[0][0] + g.spec.w * 0.08} y2="0">
						<stop offset="0" stop-color="var(--path)" stop-opacity="0" />
						<stop offset="1" stop-color="var(--path)" />
					</linearGradient>
				</defs>
				<path d={g.crest} class="halo" stroke="url(#start-{name})" />
				<path d={g.crest} class="line" stroke="url(#start-{name})" />
				{#if index !== null}
					{@const [mx, my] = g.points[index]}
					<line x1={mx} x2={mx} y1={my + 8} y2={g.spec.h * 0.96} class="drop" />
					<circle cx={mx} cy={my} r={name === 'wide' ? 6 : 5} class="dot" />
				{/if}
				<!-- Today: a small light where the path reaches the roots -->
				<circle cx={g.end[0]} cy={g.end[1]} r={name === 'wide' ? 16 : 11} class="beacon" />
				<circle cx={g.end[0]} cy={g.end[1]} r={name === 'wide' ? 4.5 : 3.5} class="today" />
			</svg>
		{/key}
	{/each}

	<span class="start date" aria-hidden="true">{formatDay(dates[0])}</span>
	<span class="end date" aria-hidden="true">{formatDay(dates[dates.length - 1])}</span>

	{#if marker && index !== null}
		{@const [mx, my] = active.points[index]}
		<div
			class="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-[calc(100%+16px)] rounded-full bg-night px-3 py-1 font-mono text-xs whitespace-nowrap text-cream tabular-nums shadow-lg ring-1 ring-butter/30"
			aria-hidden="true"
			style:left="clamp(4.5rem, {(mx / active.spec.w) * 100}%, calc(100% - 4.5rem))"
			style:top="{(my / active.spec.h) * 100}%"
		>
			<strong class="font-semibold text-butter">{formatNumber(marker.value)}</strong> · {formatDay(marker.date)}
		</div>
	{/if}
</div>

<style>
	.hill {
		touch-action: pan-y;
		aspect-ratio: var(--narrow-aspect);
		--ink: var(--color-ink);
		--far: var(--color-ochre);
		--far-alpha: 0.2;
		--path: var(--color-butter);
		--path-halo: var(--color-ochre);
		--path-halo-alpha: 0.55;
		--dusk: var(--color-butter);
		--dusk-alpha: 0;
		--halo-alpha: 0.18;
	}

	:global(.dark) .hill {
		--far: #f6e7b8;
		--far-alpha: 0.055;
		--path-halo: var(--color-butter);
		--path-halo-alpha: 0.45;
		--dusk: #f3c873;
		--dusk-alpha: 0.075;
		--halo-alpha: 0.2;
	}

	/* Layout switch: one set of geometry custom properties per canvas */
	.hill {
		--tree-x: var(--narrow-tree-x);
		--tree-y: var(--narrow-tree-y);
		--tree-w: var(--narrow-tree-w);
		--rays-x: var(--narrow-rays-x);
		--rays-y: var(--narrow-rays-y);
		--rays-w: var(--narrow-rays-w);
		--mascot-x: var(--narrow-mascot-x);
		--mascot-y: var(--narrow-mascot-y);
		--mascot-w: var(--narrow-mascot-w);
		--glow-x: var(--narrow-glow-x);
		--glow-y: var(--narrow-glow-y);
		--start-x: var(--narrow-start-x);
		--start-y: var(--narrow-start-y);
		--start-a: var(--narrow-start-a);
		--end-x: var(--narrow-end-x);
		--end-y: var(--narrow-end-y);
		--end-a: var(--narrow-end-a);
	}

	.land-wide {
		display: none;
	}

	@media (min-width: 40rem) {
		.hill {
			aspect-ratio: var(--wide-aspect);
			--tree-x: var(--wide-tree-x);
			--tree-y: var(--wide-tree-y);
			--tree-w: var(--wide-tree-w);
			--rays-x: var(--wide-rays-x);
			--rays-y: var(--wide-rays-y);
			--rays-w: var(--wide-rays-w);
			--mascot-x: var(--wide-mascot-x);
			--mascot-y: var(--wide-mascot-y);
			--mascot-w: var(--wide-mascot-w);
			--glow-x: var(--wide-glow-x);
			--glow-y: var(--wide-glow-y);
			--start-x: var(--wide-start-x);
			--start-y: var(--wide-start-y);
			--start-a: var(--wide-start-a);
			--end-x: var(--wide-end-x);
			--end-y: var(--wide-end-y);
			--end-a: var(--wide-end-a);
		}

		.land-narrow {
			display: none;
		}

		.hill .end {
			display: block;
		}

		.land-wide {
			display: block;
		}
	}

	.art {
		position: absolute;
		left: var(--x);
		top: var(--y);
		width: var(--w);
	}

	.art :global(img) {
		display: block;
		height: auto;
		max-width: none;
	}

	.tree {
		--x: var(--tree-x);
		--y: var(--tree-y);
		--w: var(--tree-w);
		container-type: inline-size;
		/* The painted mound strip dissolves into the knoll's ink */
		/* The painted mound strip dissolves into the knoll's ink; its flat outer ends fade first */
		mask-image: linear-gradient(180deg, #000 91%, transparent 97.5%), radial-gradient(40% 8% at 48.2% 97.6%, #000 50%, transparent 100%);
	}

	.rays {
		--x: var(--rays-x);
		--y: var(--rays-y);
		--w: var(--rays-w);
		/* Paper: a light touch of rays, so the canopy itself carries the light */
		opacity: 0.5;
		mix-blend-mode: multiply;
	}

	:global(.dark) .rays {
		opacity: 0.85;
		mix-blend-mode: screen;
	}

	/* The wash is wider than the canopy and centered on it */
	.glow {
		--x: var(--glow-x);
		--y: var(--glow-y);
		--w: calc(var(--tree-w) * 2);
		aspect-ratio: 1604 / 980;
		translate: -50% -50%;
		/* Paper: only a thin butter wash behind the canopy (a heavy one fades the tree) */
		opacity: 0.36;
		mix-blend-mode: multiply;
	}

	:global(.dark) .glow {
		opacity: 0.2;
		mix-blend-mode: screen;
	}

	/* Paper: the ochre leaves and veins a little deeper and richer, the pale highlights stay; at night the art is untouched */
	:global(:root:not(.dark)) .tree :global(img) {
		filter: saturate(1.25) contrast(1.08);
	}

	.mascot {
		--x: var(--mascot-x);
		--y: var(--mascot-y);
		--w: var(--mascot-w);
	}

	.far {
		fill: var(--far);
		fill-opacity: var(--far-alpha);
	}

	.ink {
		fill: var(--ink);
	}

	.halo {
		fill: none;
		stroke-width: 9;
		stroke-linecap: round;
		opacity: var(--path-halo-alpha);
		filter: blur(5px);
	}

	/* The path draws itself from left to right (on load and on every period change) */
	.path {
		animation: reveal 1.4s cubic-bezier(0.33, 1, 0.68, 1) both;
	}

	.line {
		fill: none;
		stroke-width: 2.4;
		stroke-linecap: round;
		stroke-linejoin: round;
		vector-effect: non-scaling-stroke;
	}

	.drop {
		stroke: var(--color-cream);
		stroke-opacity: 0.45;
		stroke-dasharray: 2 5;
		vector-effect: non-scaling-stroke;
	}

	.dot {
		fill: var(--color-ink);
		stroke: var(--color-butter);
		stroke-width: 2;
		vector-effect: non-scaling-stroke;
	}

	.today {
		fill: var(--color-moonlight);
		filter: drop-shadow(0 0 4px var(--color-butter));
	}

	.beacon {
		fill: var(--color-butter);
		opacity: 0.3;
		transform-box: fill-box;
		transform-origin: center;
		animation: beacon 3.2s ease-in-out infinite paused;
	}

	.hill[data-running] .beacon {
		animation-play-state: running;
	}

	.date {
		position: absolute;
		z-index: 1;
		font: 500 0.75rem/1 var(--font-mono);
		letter-spacing: 0.04em;
		color: color-mix(in oklab, var(--color-cream) 78%, transparent);
		white-space: nowrap;
	}

	/* Hung under the path from its own anchor, turned with the slope */
	.start {
		left: var(--start-x);
		top: var(--start-y);
		transform-origin: 0 0;
		rotate: var(--start-a);
	}

	.end {
		display: none;
		left: var(--end-x);
		top: var(--end-y);
		transform-origin: 100% 0;
		rotate: var(--end-a);
		translate: -100% 0;
	}

	.motes {
		position: absolute;
		inset: 0;
	}

	.mote {
		position: absolute;
		width: var(--size);
		height: var(--size);
		border-radius: 50%;
		background: var(--color-butter);
		box-shadow: 0 0 6px 1px rgb(252 215 114 / 0.65);
		opacity: 0;
		animation: fall linear infinite paused;
	}

	.hill[data-running] .mote {
		animation-play-state: running;
	}

	@keyframes fall {
		0% {
			opacity: 0;
			transform: translate(0, 0);
		}
		15% {
			opacity: 0.9;
		}
		70% {
			opacity: 0.7;
		}
		100% {
			opacity: 0;
			transform: translate(var(--drift), 46cqw);
		}
	}

	@keyframes reveal {
		from {
			clip-path: inset(-50% 100% -50% -5%);
		}
		to {
			clip-path: inset(-50% -5% -50% -5%);
		}
	}

	@keyframes beacon {
		50% {
			transform: scale(1.7);
			opacity: 0.08;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.beacon,
		.path {
			animation: none;
		}

		/* A still frame: a few motes hang in the air below the canopy */
		.mote {
			animation: none;
			opacity: 0.75;
		}

		.mote:nth-child(n + 5) {
			opacity: 0;
		}
	}
</style>
