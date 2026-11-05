<!--
	@component
	The growth tree's root, continuing below the hill: it leaves the ink under the trunk, bends into the right margin and runs
	down past every section, a golden vein inside (like the veins in the painted trunk) and a small lit rootlet at each section,
	so the page reads as one landscape: platforms, videos and posts are what feeds the tree.

	Decorative and client only (it needs the measured section positions; absolutely positioned, so no layout shift). Large
	screens only. Grows with the scroll through a CSS scroll-driven animation where supported; static and complete otherwise and
	for reduced motion.
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

	const toLine = (points: [number, number][]) => `M${points.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L')}`;
	const fract = (value: number) => value - Math.floor(value);
	const jitter = (index: number) => fract(Math.sin(index * 78.233) * 43758.5453) - 0.5;

	/** Filled outline around a centerline, `width(t)` wide (t = 0…1 along the line): a tapering root, not a stroke. */
	function taper(line: [number, number][], width: (t: number) => number) {
		const left: string[] = [];
		const right: string[] = [];
		line.forEach(([x, y], index) => {
			const [px, py] = line[Math.max(0, index - 1)];
			const [nx, ny] = line[Math.min(line.length - 1, index + 1)];
			const length = Math.hypot(nx - px, ny - py) || 1;
			const half = width(index / (line.length - 1)) / 2;
			const ox = (-(ny - py) / length) * half;
			const oy = ((nx - px) / length) * half;
			left.push(`${(x + ox).toFixed(1)} ${(y + oy).toFixed(1)}`);
			right.unshift(`${(x - ox).toFixed(1)} ${(y - oy).toFixed(1)}`);
		});
		return `M${left.join('L')}L${right.join('L')}Z`;
	}

	const smooth = (points: [number, number][]) => {
		// Catmull-Rom sampled into a dense polyline
		const out: [number, number][] = [];
		for (let index = 0; index < points.length - 1; index++) {
			const p0 = points[Math.max(0, index - 1)];
			const p1 = points[index];
			const p2 = points[index + 1];
			const p3 = points[Math.min(points.length - 1, index + 2)];
			for (let step = 0; step < 12; step++) {
				const t = step / 12;
				const t2 = t * t;
				const t3 = t2 * t;
				const f = (a: number, b: number, c: number, d: number) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
				out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
			}
		}
		out.push(points[points.length - 1]);
		return out;
	};

	const root = $derived.by(() => {
		if (!size) return null;
		const { w, h, tops } = size;
		const canvas = Math.min(w, 1600);
		const spec = LAYOUTS.wide;
		const trunk = (w - canvas) / 2 + canvas * (1 - spec.tree * spec.trunkFromRight);
		const column = Math.min(w, 1152);
		const contentRight = (w - column) / 2 + column - 32;
		const gutter = Math.min(w - 14, contentRight + Math.max(16, (w - contentRight) * 0.45));
		const end = h - 40;

		const spine: [number, number][] = [
			[trunk, -70],
			[trunk + (gutter - trunk) * 0.35, 30],
			[gutter - 6, 150]
		];
		for (let y = 300, index = 0; y < end; y += 130 + jitter(index + 9) * 50, index++) spine.push([gutter + jitter(index) * 30, y]);
		spine.push([gutter + 4, end]);
		const line = smooth(spine);

		const rootlets = tops.slice(1).map((top, index) => {
			const y = top + 70;
			const startIndex = line.findIndex(([, ly]) => ly >= y);
			const [sx, sy] = line[Math.max(0, startIndex)];
			const reach = 70 + (index % 2) * 40;
			const twig = smooth([
				[sx, sy],
				[sx - reach * 0.4, sy + 18],
				[sx - reach * 0.8, sy + 22 + jitter(index + 3) * 16],
				[sx - reach, sy + 40]
			]);
			return { path: taper(twig, (t) => 2.2 * (1 - t) + 0.3), tip: twig[twig.length - 1], vein: twig };
		});

		// Fine hairs along the root, alternating sides, shorter further down
		const hairs: string[] = [];
		for (let index = 30, n = 0; index < line.length - 8; index += 9 + Math.round((jitter(n + 40) + 0.5) * 10), n++) {
			const [x, y] = line[index];
			const side = n % 2 ? 1 : -1;
			const length = (10 + (jitter(n + 70) + 0.5) * 18) * (1 - index / line.length / 1.5);
			hairs.push(
				`M${x.toFixed(1)} ${y.toFixed(1)}q${(side * length * 0.6).toFixed(1)} ${(length * 0.2).toFixed(1)} ${(side * length).toFixed(1)} ${(length * 0.75).toFixed(1)}`
			);
		}

		return {
			w,
			h,
			body: taper(line, (t) => (t < 0.05 ? 6.5 - t * 50 : 3.6 * (1 - t) + 0.7)),
			hairs: hairs.join(''),
			vein: toLine(line.slice(0, Math.floor(line.length * 0.92))),
			rootlets: rootlets.map((rootlet) => ({ ...rootlet, vein: toLine(rootlet.vein.slice(0, -3)) }))
		};
	});
</script>

<div bind:this={host} class="roots pointer-events-none absolute inset-0 hidden lg:block" aria-hidden="true">
	{#if root}
		<svg viewBox="0 0 {root.w} {root.h}" width={root.w} height={root.h} class="absolute inset-0 overflow-visible">
			<defs>
				<filter id="root-fray" x="-10%" y="-2%" width="120%" height="104%">
					<feTurbulence type="fractalNoise" baseFrequency="0.25 0.08" numOctaves="1" seed="5" />
					<feDisplacementMap in="SourceGraphic" scale="2.4" />
				</filter>
				<linearGradient id="root-fade" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2={root.h}>
					<stop offset="0" stop-color="var(--root)" />
					<stop offset="0.85" stop-color="var(--root)" />
					<stop offset="1" stop-color="var(--root)" stop-opacity="0" />
				</linearGradient>
			</defs>
			<g filter="url(#root-fray)" fill="url(#root-fade)">
				<path d={root.body} />
				{#each root.rootlets as rootlet, index (index)}<path d={rootlet.path} />{/each}
			</g>
			<path d={root.hairs} class="hairs" />
			<path d={root.vein} class="vein" />
			{#each root.rootlets as rootlet, index (index)}
				<path d={rootlet.vein} class="vein" />
				<circle cx={rootlet.tip[0]} cy={rootlet.tip[1]} r="7" class="node-glow" />
				<circle cx={rootlet.tip[0]} cy={rootlet.tip[1]} r="2.2" class="node" />
			{/each}
		</svg>
	{/if}
</div>

<style>
	.roots {
		--root: color-mix(in oklab, var(--color-ink) 82%, transparent);
		--vein: var(--color-ochre);
	}

	:global(.dark) .roots {
		--root: #0a0a0b;
		--vein: var(--color-butter);
	}

	.hairs {
		fill: none;
		stroke: var(--root);
		stroke-width: 0.7;
		stroke-linecap: round;
		opacity: 0.55;
	}

	.vein {
		fill: none;
		stroke: var(--vein);
		stroke-width: 0.9;
		stroke-linecap: round;
		opacity: 0.85;
		filter: drop-shadow(0 0 3px rgb(252 215 114 / 0.7));
	}

	.node {
		fill: var(--color-moonlight);
	}

	.node-glow {
		fill: var(--color-butter);
		opacity: 0.35;
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
			clip-path: inset(-100px -40px 100% -40px);
		}
		to {
			clip-path: inset(-100px -40px 0 -40px);
		}
	}
</style>
