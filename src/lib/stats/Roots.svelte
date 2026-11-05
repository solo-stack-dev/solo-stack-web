<!--
	@component
	The growth tree's long root, a painting (docs/art/site/round-2/root-*.png, derivatives by `tools/root-tiles.mjs`): it
	continues the tree's rightmost painted root, sinks through the knoll's ink, comes out under the hill's painted foot and runs
	down the right margin past every section into the footer horizon, where its rootlets sink into the cliff beside the laptop.

	Built as top + N middle tiles + end at one rendered width. The page decides the length: N is the nearest whole number of
	tiles, and the tile height absorbs the rest (a few percent at most, never a visibly stretched tile), so both the start at
	the tree (`data-root-tip` in GrowthHill) and the end in the horizon stay exact. A dead straight root would read as a page
	border, so it sways slowly: every half tile is its own segment, sheared (skewX) from one point of a smooth curve to the
	next, so the painting stays continuous across every join and only bends by a degree or two there.

	Decorative and client only: absolutely positioned (no layout shift), static (identical for reduced motion), and only from
	1400 px, where the margin right of the content column is ≥ 150 px and the root sits in its middle, well clear of both the
	content and the viewport edge. Its images are only requested there. Needs a positioned parent spanning the hero and the
	sections.
-->
<script lang="ts">
	import { MediaQuery } from 'svelte/reactivity';
	import endTile from './assets/stats-root-end.webp';
	import midTile from './assets/stats-root-mid.webp';
	import topTile from './assets/stats-root-top.webp';

	/** Rendered canvas width (the bark body is ~8 px of it); piece heights follow the masters' proportions. */
	const WIDTH = 36;
	const TOP = WIDTH * 7;
	const MID = WIDTH * 7;
	const END = WIDTH * 7.9;
	/** Where the painted rootlets run out, from the end piece's top. */
	const END_TIP = WIDTH * 7;
	/** Clearance of the root's axis to the content column's right edge and to the viewport edge. */
	const CLEAR = 56;
	/**
	 * The footer horizon (SiteFooter, `footer-horizon.webp`), in fractions of its strip, measured on the art's alpha: the laptop
	 * spans x 0.868–0.904; the ridge lies at 0.765 of the height on the cliff (x ≥ 0.815), at 0.86 on the low land left of it.
	 * The rootlets run out just below the ridge, so the root sinks into the ground, never onto the laptop.
	 */
	const LAPTOP = [0.868, 0.904];
	const ridgeAt = (fraction: number) => (fraction >= 0.815 ? 0.765 : 0.86);
	const INTO_GROUND = 18;
	/** Distance kept to the laptop's edge, and how long the drift toward the landing point takes (px, ending at the tip). */
	const LAPTOP_CLEAR = 26;
	const DRIFT = 900;
	/** Closest the landing point may come to the viewport edge. */
	const LANDING_EDGE = 40;
	/** From the tree's root tip the axis eases this far right into the margin, over this many px of the descent. */
	const ENTRY_SHIFT = 32;
	const ENTRY = 340;
	/** Sway: amplitude and the two slow wavelengths, in px. */
	const SWAY = 13;
	const WAVES = [1500, 610];

	const wide = new MediaQuery('(min-width: 87.5rem)', false);

	interface Segment {
		src: string;
		top: number;
		height: number;
		left: number;
		skew: number;
		/** Background offset and height: the segment's slice of its piece. */
		offset: number;
		size: number;
		/** Still inside the hill's ink: no moonlit rim at night (the light would sit under the ground). */
		buried: boolean;
	}

	let host: HTMLDivElement;
	let segments = $state<Segment[]>([]);
	const layers = $derived([segments.filter((segment) => segment.buried), segments.filter((segment) => !segment.buried)]);

	$effect(() => {
		if (!wide.current) return void (segments = []);
		const parent = host.parentElement!;
		const tip = parent.querySelector<HTMLElement>('[data-root-tip]');
		const land = document.querySelector<HTMLElement>('main ~ footer img');
		if (!tip) return;

		const measure = () => {
			const box = parent.getBoundingClientRect();
			const at = tip.getBoundingClientRect();
			const w = box.width;
			const column = Math.min(w, 1152);
			const contentRight = (w - column) / 2 + column - 32;
			const clamp = (x: number) => Math.max(contentRight + CLEAR, Math.min(w - CLEAR, x));
			// It leaves the tree's root on the knoll and eases into its line in the margin while still in the ink.
			const tipX = at.left - box.left;
			const base = clamp(tipX + ENTRY_SHIFT);
			const start = at.top - box.top;
			// The hill's painted foot (GrowthHill: ~0.93 of its height; a little higher, where the brush still covers it)
			const hill = tip.parentElement!.getBoundingClientRect();
			const foot = hill.top - box.top + hill.height * 0.86;

			// Landing: into the horizon's ridge right under the root, or beside the laptop if the root would hang onto it.
			let landing = base;
			let end = box.height;
			if (land) {
				const strip = land.getBoundingClientRect();
				const fraction = (x: number) => (x - (strip.left - box.left)) / strip.width;
				const laptop = LAPTOP.map((f) => strip.left - box.left + f * strip.width);
				if (base > laptop[0] - LAPTOP_CLEAR && base < laptop[1] + LAPTOP_CLEAR) {
					// Preferably right of it, into the cliff (it may come closer to the edge there, it is going underground)
					const right = laptop[1] + LAPTOP_CLEAR;
					landing = right <= w - LANDING_EDGE ? right : Math.min(laptop[0] - LAPTOP_CLEAR, w - CLEAR);
				}
				end = strip.top - box.top + strip.height * ridgeAt(fraction(landing)) + INTO_GROUND;
			}
			const length = end - start - TOP - END_TIP;
			const count = Math.max(1, Math.round(length / MID));
			const tile = length / count;

			// The axis: a slow sway, rising from nothing at the tree so the root leaves it exactly at the anchor.
			const axis = (y: number) => {
				const t = y - start;
				const envelope = Math.min(1, t / 420);
				const entry = Math.min(1, t / ENTRY);
				const enter = (tipX - base) * (1 - entry * entry * (3 - 2 * entry));
				const sway =
					0.72 * Math.sin((t / WAVES[0]) * Math.PI * 2 + 0.4) + 0.28 * Math.sin((t / WAVES[1]) * Math.PI * 2 + 2.1) - 0.72 * Math.sin(0.4) - 0.28 * Math.sin(2.1);
				// Toward the end the sway gives way to a drift onto the landing point.
				const linear = Math.min(1, Math.max(0, (y - (end - DRIFT)) / DRIFT));
				const drift = linear * linear * (3 - 2 * linear);
				return base + enter + SWAY * envelope * (1 - drift) * sway + (landing - base) * drift;
			};
			const dpr = window.devicePixelRatio || 1;
			const snap = (value: number) => Math.round(value * dpr) / dpr;

			const pieces: [string, number][] = [[topTile, TOP], ...Array.from({ length: count }, () => [midTile, tile] as [string, number]), [endTile, END]];
			const next: Segment[] = [];
			let y = start;
			for (const [src, height] of pieces) {
				for (let half = 0; half < 2; half++) {
					const from = snap(y + (height * half) / 2);
					const to = snap(y + (height * (half + 1)) / 2);
					const x0 = axis(from);
					const x1 = axis(to);
					next.push({
						src,
						top: from,
						height: to - from,
						left: x0 - WIDTH / 2,
						skew: Math.atan2(x1 - x0, to - from),
						offset: from - y,
						size: height,
						buried: to <= foot
					});
				}
				y += height;
			}
			segments = next;
		};
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(parent);
		return () => observer.disconnect();
	});
</script>

<div bind:this={host} class="roots pointer-events-none absolute inset-0 hidden" aria-hidden="true">
	{#each layers as layer, buried (buried)}
		<div class="root" class:buried={buried === 0} style:--w="{WIDTH}px">
			{#each layer as segment (segment.top)}
				<div
					class:entrance={segment.top === segments[0].top}
					style:top="{segment.top}px"
					style:left="{segment.left}px"
					style:height="{segment.height}px"
					style:transform="skewX({segment.skew}rad)"
					style:background-image="url({segment.src})"
					style:background-position="0 {-segment.offset}px"
					style:background-size="100% {segment.size}px"
				></div>
			{/each}
		</div>
	{/each}
</div>

<style>
	/* Above the footer: the rootlets land on its near ridge (behind its far ridge, opaque at night, they would be cut off) */
	@media (min-width: 87.5rem) {
		.roots {
			display: block;
			z-index: 1;
		}
	}

	.root {
		position: absolute;
		inset: 0;
		animation: appear 0.8s ease-out both;
	}

	.root > div {
		position: absolute;
		width: var(--w);
		background-repeat: no-repeat;
		transform-origin: 0 0;
	}

	/* The thick entrance starts inside the knoll's ink and fades in there, so no cut edge ever shows */
	.entrance {
		mask-image: linear-gradient(transparent, #000 80%);
	}

	/* Ink on paper: the painted bark as it is, a touch quieter so it never outweighs the type */
	:global(:root:not(.dark)) .root {
		opacity: 0.9;
	}

	/* At night the root is ink like the hill it comes out of: a silhouette a shade darker than the sky, set off by a thin
	   moonlit rim and a faint halo (the horizon's silhouette technique); the gold vein sinks to a dim ochre thread inside */
	:global(.dark) .root {
		filter: brightness(0.7) contrast(1.35) drop-shadow(0 0 1px rgb(246 231 184 / 0.3)) drop-shadow(0 0 9px rgb(246 231 184 / 0.06));
	}

	:global(.dark) .root.buried {
		filter: brightness(0.7) contrast(1.35);
	}

	@keyframes appear {
		from {
			opacity: 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.root {
			animation: none;
		}
	}
</style>
