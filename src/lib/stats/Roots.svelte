<!--
	@component
	The growth tree's root, continuing below the hill: it leaves the ink under the trunk, bends into the right margin and runs
	down past every section toward the footer's ground. An irregular ink body (swelling, knotted, a wobbling frayed edge), a
	narrow, dim gold vein inside (like the veins in the painted trunk) and, at each section, a rootlet that branches off into
	the margin and runs out in a hair with the faintest light at its tip. Nothing of it ever enters the content column.

	Self-contained on purpose: it only needs a positioned parent whose `section`s it measures, so it can later be swapped for a
	painted root image without touching the page. Decorative and client only (absolutely positioned, no layout shift). From
	1280 px only, where the margin is wide enough to hold it clear of the content. Grows with the scroll through a CSS scroll-driven animation where supported; complete otherwise and for
	reduced motion.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { LAYOUTS } from './hill.ts';

	let host: HTMLDivElement;
	let size = $state<{ w: number; h: number; tops: number[] } | null>(null);

	onMount(() => {
		const parent = host.parentElement!;
		const measure = () => {
			const box = parent.getBoundingClientRect();
			const tops = [...parent.querySelectorAll('section')].map((section) => section.getBoundingClientRect().top - box.top);
			size = { w: box.width, h: box.height, tops };
		};
		const observer = new ResizeObserver(measure);
		observer.observe(parent);
		return () => observer.disconnect();
	});

	type Point = [number, number];
	const fmt = ([x, y]: Point) => `${x.toFixed(1)} ${y.toFixed(1)}`;
	const toLine = (points: Point[]) => `M${points.map(fmt).join('L')}`;
	const fract = (value: number) => value - Math.floor(value);
	const jitter = (index: number) => fract(Math.sin(index * 78.233) * 43758.5453) - 0.5;
	/** Smooth 1D value noise in -0.5…0.5. */
	const noise = (t: number, seed: number) => {
		const i = Math.floor(t);
		const f = t - i;
		const k = f * f * (3 - 2 * f);
		return jitter(i + seed * 101) * (1 - k) + jitter(i + 1 + seed * 101) * k;
	};

	/** Filled outline around a centerline, `width(t)` wide (t = 0…1 along the line): a tapering root, not a stroke. */
	function taper(line: Point[], width: (t: number) => number) {
		const left: string[] = [];
		const right: string[] = [];
		line.forEach(([x, y], index) => {
			const [px, py] = line[Math.max(0, index - 1)];
			const [nx, ny] = line[Math.min(line.length - 1, index + 1)];
			const length = Math.hypot(nx - px, ny - py) || 1;
			const half = width(index / (line.length - 1)) / 2;
			const ox = (-(ny - py) / length) * half;
			const oy = ((nx - px) / length) * half;
			left.push(fmt([x + ox, y + oy]));
			right.unshift(fmt([x - ox, y - oy]));
		});
		return `M${left.join('L')}L${right.join('L')}Z`;
	}

	/** Catmull-Rom through the points, sampled into a dense polyline. */
	const smooth = (points: Point[], steps = 12) => {
		const out: Point[] = [];
		for (let index = 0; index < points.length - 1; index++) {
			const p0 = points[Math.max(0, index - 1)];
			const p1 = points[index];
			const p2 = points[index + 1];
			const p3 = points[Math.min(points.length - 1, index + 2)];
			for (let step = 0; step < steps; step++) {
				const t = step / steps;
				const t2 = t * t;
				const t3 = t2 * t;
				const f = (a: number, b: number, c: number, d: number) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
				out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
			}
		}
		out.push(points[points.length - 1]);
		return out;
	};

	/** How far the root runs past the bottom of the page content, toward the footer's ground. */
	const RUN_OUT = 130;

	const root = $derived.by(() => {
		if (!size) return null;
		const { w, h, tops } = size;
		const canvas = Math.min(w, 1600);
		const spec = LAYOUTS.wide;
		const trunk = (w - canvas) / 2 + canvas * (1 - spec.tree * spec.trunkFromRight);
		const column = Math.min(w, 1152);
		// The content's right edge (max-w-6xl minus lg:px-8) plus a little air: the root and its rootlets stay right of it.
		const clear = (w - column) / 2 + column - 32 + 14;
		const margin = Math.max(0, w - 6 - clear);
		const gutter = clear + Math.max(4, margin * 0.4);
		const end = h + RUN_OUT;

		const spine: Point[] = [
			[trunk, -170],
			[trunk + (gutter - trunk) * 0.42, 20],
			[gutter - 4, 170]
		];
		for (let y = 320, index = 0; y < end - 120; y += 150 + jitter(index + 9) * 60, index++) {
			const sway = Math.min(margin * 0.3, 22);
			spine.push([Math.max(clear + 2, Math.min(w - 6, gutter + jitter(index) * sway * 2)), y]);
		}
		spine.push([gutter + 3, end]);
		const line = smooth(spine);

		// Body: thick under the trunk, then an uneven taper with swellings and two or three knots, a hair at the end.
		const knots = [0.31, 0.58, 0.83];
		const body = taper(line, (t) => {
			const base = t < 0.08 ? 16 - t * 75 : 10 * (1 - t) ** 0.85 + 0.6;
			const swell = 1 + noise(t * 8, 1) * 0.6 + noise(t * 27, 2) * 0.3;
			const knot = knots.reduce((sum, at) => sum + Math.max(0, 1 - Math.abs(t - at) * 45) * 0.55, 0);
			return Math.max(0.5, base * (swell + knot));
		});

		// Rootlets: branch off at each section into the margin (never left of `clear`), arc down and run out in a hair.
		const room = w - 6 - clear;
		const rootlets =
			room < 28
				? []
				: tops.slice(1).map((top, index) => {
						const y = top + 60;
						const startIndex = Math.max(
							0,
							line.findIndex(([, ly]) => ly >= y)
						);
						const [sx, sy] = line[startIndex];
						const out = index % 2 === 0 ? 1 : -1;
						const reach = Math.min(70 + (index % 2) * 30, out > 0 ? w - 8 - sx : sx - clear);
						const twig = smooth([
							[sx, sy],
							[sx + out * reach * 0.35, sy + 14],
							[sx + out * reach * 0.75, sy + 34 + jitter(index + 3) * 12],
							[sx + out * reach, sy + 64]
						]);
						return { path: taper(twig, (t) => 3.4 * (1 - t) ** 1.3 + 0.35), tip: twig[twig.length - 1] };
					});

		// Fine hairs along the root, alternating sides, shorter further down.
		const hairs: string[] = [];
		for (let index = 40, n = 0; index < line.length - 10; index += 14 + Math.round((jitter(n + 40) + 0.5) * 16), n++) {
			const [x, y] = line[index];
			const side = n % 2 ? 1 : -1;
			const length = Math.min((8 + (jitter(n + 70) + 0.5) * 16) * (1 - index / line.length / 1.4), side < 0 ? Math.max(0, x - clear) : 40);
			if (length < 4) continue;
			hairs.push(`M${fmt([x, y])}q${(side * length * 0.6).toFixed(1)} ${(length * 0.2).toFixed(1)} ${(side * length).toFixed(1)} ${(length * 0.8).toFixed(1)}`);
		}

		return {
			w,
			h,
			end,
			body,
			hairs: hairs.join(''),
			// The vein shows in the upper root only, as it thins it sinks into the ink
			vein: toLine(line.slice(4, Math.floor(line.length * 0.62))),
			rootlets
		};
	});
</script>

<div bind:this={host} class="roots pointer-events-none absolute inset-0 hidden xl:block" aria-hidden="true">
	{#if root}
		<svg viewBox="0 0 {root.w} {root.h}" width={root.w} height={root.h} class="absolute inset-0 overflow-visible">
			<defs>
				<!-- Ink: a slow wobble in the outline (never a ruled line) and a finely frayed, slightly bled edge -->
				<filter id="root-ink" x="-20%" y="-2%" width="140%" height="104%">
					<feTurbulence type="fractalNoise" baseFrequency="0.035 0.012" numOctaves="2" seed="5" result="wobble" />
					<feDisplacementMap in="SourceGraphic" in2="wobble" scale="5" xChannelSelector="R" yChannelSelector="G" result="shape" />
					<feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="1" seed="11" result="fray" />
					<feDisplacementMap in="shape" in2="fray" scale="1.6" xChannelSelector="R" yChannelSelector="G" />
				</filter>
				<linearGradient id="root-fade" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2={root.end}>
					<stop offset="0" stop-color="var(--root)" />
					<stop offset="0.86" stop-color="var(--root)" />
					<stop offset="1" stop-color="var(--root)" stop-opacity="0" />
				</linearGradient>
				<linearGradient id="root-vein" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2={root.end * 0.62}>
					<stop offset="0" stop-color="var(--vein)" />
					<stop offset="0.55" stop-color="var(--vein)" />
					<stop offset="1" stop-color="var(--vein)" stop-opacity="0" />
				</linearGradient>
				<radialGradient id="root-tip">
					<stop offset="0" stop-color="var(--color-butter)" stop-opacity="0.5" />
					<stop offset="1" stop-color="var(--color-butter)" stop-opacity="0" />
				</radialGradient>
			</defs>
			<g filter="url(#root-ink)" fill="url(#root-fade)">
				<path d={root.body} />
				{#each root.rootlets as rootlet, index (index)}<path d={rootlet.path} />{/each}
			</g>
			<path d={root.hairs} class="hairs" />
			<path d={root.vein} class="vein" />
			{#each root.rootlets as rootlet, index (index)}
				<circle cx={rootlet.tip[0]} cy={rootlet.tip[1]} r="5" fill="url(#root-tip)" class="tip" />
			{/each}
		</svg>
	{/if}
</div>

<style>
	.roots {
		--root: color-mix(in oklab, var(--color-ink) 90%, transparent);
		--vein: #b07a12;
		--vein-alpha: 0.55;
	}

	:global(.dark) .roots {
		--root: #070708;
		--vein: var(--color-butter);
		--vein-alpha: 0.42;
	}

	.hairs {
		fill: none;
		stroke: var(--root);
		stroke-width: 0.6;
		stroke-linecap: round;
		opacity: 0.5;
	}

	/* Narrow and dim, like the gold veins in the painted trunk; it fades as the root thins */
	.vein {
		fill: none;
		stroke: url(#root-vein);
		stroke-width: 0.7;
		stroke-linecap: round;
		opacity: var(--vein-alpha);
		filter: drop-shadow(0 0 1.5px rgb(252 215 114 / 0.35));
	}

	.tip {
		opacity: 0.35;
	}

	:global(:root:not(.dark)) .tip {
		display: none;
	}

	/* The root grows down with the scroll */
	@supports (animation-timeline: view()) {
		@media (prefers-reduced-motion: no-preference) {
			.roots svg {
				animation: grow linear both;
				animation-timeline: view();
				animation-range: cover 0% cover 55%;
			}
		}
	}

	@keyframes grow {
		from {
			clip-path: inset(-220px -60px 100% -60px);
		}
		to {
			clip-path: inset(-220px -60px -160px -60px);
		}
	}
</style>
