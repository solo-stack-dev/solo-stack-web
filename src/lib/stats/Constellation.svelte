<!--
	@component
	Platforms as a star chart. Left: the sky, one star per platform, sized by follower share; faint lines draw the Solo Stack sign.
	Night: a planisphere disc of night sky with butter stars. Paper: no disc, ink stars on a pale butter wash with a bled edge.
	Every label has its own anchor (side of its star), so names never run into each other; below 640 px the names grow to ~12 px
	and the numbers leave the diagram (the ledger has them). Right: the ledger on one column grid with tabular numbers.
	Hovering or focusing a row lights its star; hovering a star lights its row. Discord is an unlit star ("comes later").
-->
<script lang="ts">
	import { SOCIALS, type SocialId } from '#lib/home/data/socials.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { changeOf, periodSlice, totalFollowers, LAST_DAY } from './derive.ts';
	import Delta from './Delta.svelte';
	import { formatCompact, formatNumber, formatShare, formatSigned } from './format.ts';
	import PlatformIcon from './PlatformIcon.svelte';
	import type { Period, Stats } from './schema.ts';
	import Sparkline from './Sparkline.svelte';

	let { stats, period }: { stats: Stats; period: Period } = $props();

	type Side = 'left' | 'right' | 'above';
	/** Star positions in a 0…100 sky, hand placed so the lines read as one sign, and the side each label sits on. */
	const PLACE: Record<SocialId, { at: [number, number]; side: Side }> = {
		github: { at: [28, 25], side: 'left' },
		youtube: { at: [50, 37], side: 'right' },
		twitch: { at: [78, 29], side: 'above' },
		discord: { at: [61, 13], side: 'left' },
		tiktok: { at: [30, 52], side: 'left' },
		instagram: { at: [68, 51], side: 'right' },
		threads: { at: [47, 64], side: 'right' },
		x: { at: [66, 76], side: 'right' },
		bluesky: { at: [20, 70], side: 'right' },
		facebook: { at: [39, 85], side: 'right' }
	};

	/** Name and number anchors around a star of radius `r` (above a star the number sits between name and star). */
	function anchor(side: Side, [x, y]: [number, number], r: number) {
		const gap = r + 1.8;
		if (side === 'left') return { x: x - gap, y: y - 0.4, anchor: 'end', valueY: y + 3.4 } as const;
		if (side === 'right') return { x: x + gap, y: y - 0.4, anchor: 'start', valueY: y + 3.4 } as const;
		return { x, y: y - gap - 3.4, anchor: 'middle', valueY: y - gap - 0.2 } as const;
	}

	const LINES: [SocialId, SocialId][] = [
		['github', 'youtube'],
		['youtube', 'twitch'],
		['twitch', 'discord'],
		['youtube', 'tiktok'],
		['youtube', 'instagram'],
		['tiktok', 'bluesky'],
		['tiktok', 'threads'],
		['threads', 'x'],
		['x', 'instagram'],
		['threads', 'facebook']
	];

	/** Faint background stars, deterministic, inside the sky disc. */
	const fract = (value: number) => value - Math.floor(value);
	const DUST = Array.from({ length: 80 }, (_, index) => {
		const a = fract(Math.sin(index * 12.9898) * 43758.5453);
		const b = fract(Math.sin(index * 78.233) * 12345.6789);
		return { x: 4 + a * 92, y: 4 + b * 92, r: 0.15 + fract(a * 7.3) * 0.35, delay: (index % 9) * 0.6 };
	}).filter(({ x, y }) => (x - 50) ** 2 + (y - 50) ** 2 < 45 ** 2);

	const sum = $derived(totalFollowers(stats)[LAST_DAY]);
	const rows = $derived(
		SOCIALS.map((social) => {
			const platform = stats.platforms.find((entry) => entry.id === social.id);
			const change = platform ? changeOf(platform.followers, period) : null;
			// No followers anywhere yet (live data from a fresh start): every share is 0, never NaN.
			const share = change && sum > 0 ? change.value / sum : 0;
			return { social, platform, change, share };
		})
	);
	const biggest = $derived(Math.max(...rows.map((row) => row.share)));

	let active = $state<SocialId | null>(null);
</script>

<div class="grid items-start gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14">
	<!-- The sky -->
	<figure class="relative mx-auto aspect-square w-full max-w-[30rem] lg:sticky lg:top-28">
		<svg viewBox="-6 -6 112 112" class="sky size-full overflow-visible" role="img" aria-label={m.stats_share_title()}>
			<defs>
				<radialGradient id="sky-fill" cx="50%" cy="42%" r="60%">
					<stop offset="0" style:stop-color="var(--sky-a)" style:stop-opacity="var(--sky-a-alpha)" />
					<stop offset="0.7" style:stop-color="var(--sky-b)" style:stop-opacity="var(--sky-b-alpha)" />
					<stop offset="1" style:stop-color="var(--sky-c)" style:stop-opacity="var(--sky-c-alpha)" />
				</radialGradient>
				<radialGradient id="star-glow">
					<stop offset="0" style:stop-color="var(--glow)" style:stop-opacity="var(--glow-alpha)" />
					<stop offset="0.4" style:stop-color="var(--glow)" style:stop-opacity="calc(var(--glow-alpha) * 0.24)" />
					<stop offset="1" style:stop-color="var(--glow)" stop-opacity="0" />
				</radialGradient>
				<!-- Paper: the wash bleeds out unevenly, like pigment on damp paper -->
				<filter id="sky-bleed" x="-15%" y="-15%" width="130%" height="130%">
					<feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="3" seed="9" />
					<feDisplacementMap in="SourceGraphic" scale="7" xChannelSelector="R" yChannelSelector="G" />
					<feGaussianBlur stdDeviation="0.5" />
				</filter>
			</defs>

			<!-- Night: planisphere rim with hour ticks around a disc of sky -->
			<g class="night-only">
				<circle cx="50" cy="50" r="52.5" fill="none" stroke="currentColor" stroke-opacity="0.18" stroke-width="0.3" />
				{#each { length: 72 }, tick (tick)}
					<line
						x1="50"
						y1={-2.5 + (tick % 6 === 0 ? 0 : 1.2)}
						x2="50"
						y2="1"
						stroke="currentColor"
						stroke-opacity={tick % 6 === 0 ? 0.45 : 0.2}
						stroke-width="0.3"
						transform="rotate({tick * 5} 50 50)"
					/>
				{/each}
				<circle cx="50" cy="50" r="48" fill="url(#sky-fill)" />
				<circle cx="50" cy="50" r="48" fill="none" stroke="#fcd772" stroke-opacity="0.18" stroke-width="0.25" />
			</g>
			<!-- Paper: a pale butter wash with a bled edge, no disc -->
			<circle cx="50" cy="50" r="47" fill="url(#sky-fill)" filter="url(#sky-bleed)" class="paper-only" />

			{#each DUST as dust, index (index)}
				<circle cx={dust.x} cy={dust.y} r={dust.r} class="dust" style:animation-delay="{dust.delay}s" />
			{/each}

			{#each LINES as [from, to] (`${from}-${to}`)}
				{@const lit = active === from || active === to}
				<line
					x1={PLACE[from].at[0]}
					y1={PLACE[from].at[1]}
					x2={PLACE[to].at[0]}
					y2={PLACE[to].at[1]}
					class="sign"
					stroke-opacity={lit ? 0.8 : 0.3}
					stroke-width={lit ? 0.45 : 0.3}
					stroke-dasharray={to === 'discord' ? '0.8 1.2' : undefined}
				/>
			{/each}

			{#each rows as row (row.social.id)}
				{@const [x, y] = PLACE[row.social.id].at}
				{@const r = row.platform ? 1.1 + Math.sqrt(biggest > 0 ? row.share / biggest : 0) * 3.4 : 1.1}
				{@const lit = active === row.social.id}
				{@const label = anchor(PLACE[row.social.id].side, [x, y], r)}
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<g class="star" data-lit={lit || undefined} onpointerenter={() => (active = row.social.id)} onpointerleave={() => (active = null)}>
					<circle cx={x} cy={y} r={Math.max(6, r + 3)} fill="transparent" />
					{#if row.platform}
						<circle cx={x} cy={y} r={r * (lit ? 4.4 : 3.4)} fill="url(#star-glow)" class="transition-[r] duration-300" />
						<path d="M{x} {y - r * 1.9}Q{x} {y} {x + r * 1.9} {y}Q{x} {y} {x} {y + r * 1.9}Q{x} {y} {x - r * 1.9} {y}Q{x} {y} {x} {y - r * 1.9}Z" class="spark" />
						<circle cx={x} cy={y} {r} class="core" />
						<circle cx={x - r * 0.25} cy={y - r * 0.25} r={r * 0.45} class="highlight" />
					{:else}
						<circle cx={x} cy={y} {r} class="unlit" stroke-width="0.3" stroke-dasharray="0.6 0.6" />
					{/if}
					<text x={label.x} y={label.y} text-anchor={label.anchor} class="star-name" opacity={lit ? 1 : 0.88}>{row.social.name}</text>
					<text x={label.x} y={label.valueY} text-anchor={label.anchor} class="star-value" opacity={lit ? 1 : 0.8}>
						{row.change ? formatCompact(row.change.value) : '·'}
					</text>
				</g>
			{/each}
		</svg>
	</figure>

	<!-- The ledger: one column grid for every row (icon, name, trend, share, followers), numbers tabular and right aligned -->
	<ol class="ledger grid">
		{#each rows as row (row.social.id)}
			{@const lit = active === row.social.id}
			<li
				class="group/row relative grid items-baseline gap-x-3 py-3.5 data-lit:z-10 sm:gap-x-5"
				data-lit={lit || undefined}
				onpointerenter={() => (active = row.social.id)}
				onpointerleave={() => (active = null)}
				onfocusin={() => (active = row.social.id)}
				onfocusout={() => (active = null)}
			>
				<span
					class="pointer-events-none absolute -inset-x-3 inset-y-0.5 -z-10 rounded-2xl bg-butter/0 transition-colors duration-300 group-data-lit/row:bg-butter/25 dark:group-data-lit/row:bg-butter/[0.07]"
					aria-hidden="true"
				></span>
				<span
					class="icon grid size-9 place-items-center self-center rounded-full text-foreground/70 transition-[color,background-color,box-shadow] duration-300 group-data-lit/row:bg-night group-data-lit/row:text-butter group-data-lit/row:shadow-[0_0_18px_rgb(252_215_114/0.45)] dark:group-data-lit/row:bg-butter dark:group-data-lit/row:text-night"
				>
					<PlatformIcon id={row.social.id} class="size-4" />
				</span>
				<h3 class="name min-w-0 truncate font-semibold">
					{#if row.social.url}
						<a
							href={row.social.url}
							target="_blank"
							rel="noopener me"
							class="rounded-sm outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)"
							aria-label={m.stats_profile_open({ platform: row.social.name })}>{row.social.name}</a
						>
					{:else}
						{row.social.name}
					{/if}
				</h3>
				{#if row.social.handle}<p class="handle min-w-0 truncate font-mono text-xs text-muted-foreground">{row.social.handle}</p>{/if}
				{#if row.platform && row.change}
					<Sparkline
						values={periodSlice(row.platform.followers, period)}
						label={m.stats_sparkline_label({ days: period })}
						class="trend hidden h-7 self-center sm:block"
					/>
					<p class="share font-mono text-xs text-muted-foreground tabular-nums">
						<span class="sr-only">{m.stats_share_title()}:</span>
						{formatShare(row.share)}
					</p>
					<p class="number font-display text-xl font-black tracking-tight tabular-nums sm:text-2xl">{formatNumber(row.change.value)}</p>
					<Delta class="delta justify-end" ratio={row.change.ratio} amount={formatSigned(row.change.delta)} />
				{:else}
					<p class="soon font-mono text-xs text-muted-foreground">{m.stats_platform_soon()}</p>
				{/if}
			</li>
		{/each}
	</ol>
</div>

<style>
	.sky {
		color: var(--foreground);
		--sky-a: #f9dc8c;
		--sky-a-alpha: 0.55;
		--sky-b: #fcd772;
		--sky-b-alpha: 0.3;
		--sky-c: #fcd772;
		--sky-c-alpha: 0.06;
		--glow: #e2a93b;
		--glow-alpha: 0.4;
		--spark: var(--color-ink);
		--core: var(--color-ink);
		--highlight: #e2a93b;
		--line: var(--color-ink);
		--label: var(--color-night);
		--value: #8a5a12;
		--dust: var(--color-ink);
		--dust-alpha: 0.3;
	}

	:global(.dark) .sky {
		filter: drop-shadow(0 0 50px rgb(252 215 114 / 0.06));
		--sky-a: #2b2a2b;
		--sky-a-alpha: 1;
		--sky-b: #1b1c1e;
		--sky-b-alpha: 1;
		--sky-c: #121314;
		--sky-c-alpha: 1;
		--glow: #fcd772;
		--glow-alpha: 0.75;
		--spark: #fffaf0;
		--core: #fcd772;
		--highlight: #fffaf0;
		--line: #fcd772;
		--label: #fbf3dd;
		--value: #fcd772;
		--dust: #fbf3dd;
		--dust-alpha: 0.55;
	}

	.night-only {
		display: none;
	}

	:global(.dark) .night-only {
		display: inline;
	}

	:global(.dark) .paper-only {
		display: none;
	}

	.sign {
		stroke: var(--line);
		transition: stroke-opacity 0.3s;
	}

	.spark {
		fill: var(--spark);
		opacity: 0.85;
	}

	.core {
		fill: var(--core);
	}

	.highlight {
		fill: var(--highlight);
		opacity: 0.9;
	}

	.unlit {
		fill: none;
		stroke: var(--line);
		stroke-opacity: 0.6;
	}

	.star-name {
		fill: var(--label);
		font: 600 3.3px var(--font-body);
		letter-spacing: 0.01em;
	}

	.star-value {
		fill: var(--value);
		font: 500 2.75px var(--font-mono);
		font-variant-numeric: tabular-nums;
	}

	/* Phones: ~12 px names, no numbers in the diagram (the ledger right below has them) */
	@media (max-width: 39.99rem) {
		.star-name {
			font-size: 3.9px;
		}

		.star-value {
			display: none;
		}
	}

	.star {
		cursor: default;
	}

	.dust {
		fill: var(--dust);
		opacity: var(--dust-alpha);
		animation: twinkle 5.4s ease-in-out infinite;
	}

	@keyframes twinkle {
		50% {
			opacity: 0.12;
		}
	}

	/* Ledger: the same columns in every row (icon, name, trend, share, followers), the change under the number */
	.ledger li {
		grid-template-columns: 2.25rem minmax(0, 1fr) 2.75rem 6.75rem;
		grid-template-areas:
			'icon name share number'
			'icon handle share delta';
		border-bottom: 1px dashed color-mix(in oklab, var(--foreground) 16%, transparent);
	}

	.ledger li:first-child {
		border-top: 1px dashed color-mix(in oklab, var(--foreground) 16%, transparent);
	}

	@media (min-width: 40rem) {
		.ledger li {
			grid-template-columns: 2.25rem minmax(0, 1fr) 5.5rem 2.75rem 7rem;
			grid-template-areas:
				'icon name trend share number'
				'icon handle trend share delta';
		}
	}

	.icon {
		grid-area: icon;
	}

	.name {
		grid-area: name;
	}

	.handle {
		grid-area: handle;
	}

	.ledger :global(.trend) {
		grid-area: trend;
	}

	.share {
		grid-area: name-start / share / name-end / share;
		text-align: right;
	}

	.number {
		grid-area: number;
		text-align: right;
		line-height: 1.1;
	}

	.ledger :global(.delta) {
		grid-area: delta;
	}

	.soon {
		grid-column: 3 / -1;
		grid-row: 1 / span 2;
		align-self: center;
		text-align: right;
	}

	@media (prefers-reduced-motion: reduce) {
		.dust {
			animation: none;
		}
	}
</style>
