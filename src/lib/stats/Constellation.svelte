<!--
	@component
	Platforms as a star chart. Left: a planisphere disc (also on the paper theme), one star per platform, sized by follower share;
	faint lines draw the Solo Stack sign. Right: ruled ledger with exact numbers, profile links and trends. Hovering or focusing a
	row lights its star; hovering a star lights its row. Discord is an unlit star ("comes later").
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

	/** Star positions in a 0…100 sky, hand placed so the lines read as one sign. */
	const PLACE: Record<SocialId, [number, number]> = {
		github: [30, 24],
		youtube: [50, 36],
		twitch: [76, 27],
		discord: [64, 14],
		tiktok: [30, 52],
		instagram: [72, 52],
		threads: [47, 63],
		x: [65, 75],
		bluesky: [21, 72],
		facebook: [40, 84]
	};
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
			const share = change ? change.value / sum : 0;
			return { social, platform, change, share };
		})
	);
	const biggest = $derived(Math.max(...rows.map((row) => row.share)));

	let active = $state<SocialId | null>(null);
</script>

<div class="grid items-start gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14">
	<!-- The sky -->
	<figure class="relative mx-auto aspect-square w-full max-w-[30rem] lg:sticky lg:top-24">
		<svg viewBox="-6 -6 112 112" class="sky size-full overflow-visible" role="img" aria-label={m.stats_share_title()}>
			<defs>
				<radialGradient id="sky-fill" cx="50%" cy="42%" r="60%">
					<stop offset="0" stop-color="#2b2a2b" />
					<stop offset="0.7" stop-color="#1b1c1e" />
					<stop offset="1" stop-color="#121314" />
				</radialGradient>
				<radialGradient id="star-glow">
					<stop offset="0" stop-color="#fcd772" stop-opacity="0.75" />
					<stop offset="0.4" stop-color="#fcd772" stop-opacity="0.18" />
					<stop offset="1" stop-color="#fcd772" stop-opacity="0" />
				</radialGradient>
			</defs>

			<!-- Planisphere rim with hour ticks -->
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

			{#each DUST as dust, index (index)}
				<circle cx={dust.x} cy={dust.y} r={dust.r} fill="#fbf3dd" class="dust" style:animation-delay="{dust.delay}s" />
			{/each}

			{#each LINES as [from, to] (`${from}-${to}`)}
				{@const lit = active === from || active === to}
				<line
					x1={PLACE[from][0]}
					y1={PLACE[from][1]}
					x2={PLACE[to][0]}
					y2={PLACE[to][1]}
					stroke="#fcd772"
					stroke-opacity={lit ? 0.75 : 0.28}
					stroke-width={lit ? 0.45 : 0.3}
					stroke-dasharray={to === 'discord' ? '0.8 1.2' : undefined}
					class="transition-[stroke-opacity] duration-300"
				/>
			{/each}

			{#each rows as row (row.social.id)}
				{@const [x, y] = PLACE[row.social.id]}
				{@const r = row.platform ? 1.1 + Math.sqrt(row.share / biggest) * 3.4 : 1.1}
				{@const lit = active === row.social.id}
				{@const left = x > 62}
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<g class="star" data-lit={lit || undefined} onpointerenter={() => (active = row.social.id)} onpointerleave={() => (active = null)}>
					<circle cx={x} cy={y} r={Math.max(6, r + 3)} fill="transparent" />
					{#if row.platform}
						<circle cx={x} cy={y} r={r * (lit ? 4.4 : 3.4)} fill="url(#star-glow)" class="transition-[r] duration-300" />
						<path
							d="M{x} {y - r * 1.9}Q{x} {y} {x + r * 1.9} {y}Q{x} {y} {x} {y + r * 1.9}Q{x} {y} {x - r * 1.9} {y}Q{x} {y} {x} {y - r * 1.9}Z"
							fill="#fffaf0"
							opacity="0.85"
						/>
						<circle cx={x} cy={y} {r} fill="#fcd772" />
						<circle cx={x - r * 0.25} cy={y - r * 0.25} r={r * 0.45} fill="#fffaf0" opacity="0.9" />
					{:else}
						<circle cx={x} cy={y} {r} fill="none" stroke="#fcd772" stroke-opacity="0.6" stroke-width="0.3" stroke-dasharray="0.6 0.6" />
					{/if}
					<text x={left ? x - r - 2.2 : x + r + 2.2} y={y - 0.6} text-anchor={left ? 'end' : 'start'} class="label" fill="#fbf3dd" opacity={lit ? 1 : 0.85}>
						{row.social.name}
					</text>
					<text x={left ? x - r - 2.2 : x + r + 2.2} y={y + 3} text-anchor={left ? 'end' : 'start'} class="value" fill="#fcd772" opacity={lit ? 1 : 0.75}>
						{row.change ? formatCompact(row.change.value) : '·'}
					</text>
				</g>
			{/each}
		</svg>
	</figure>

	<!-- The ledger -->
	<ol class="grid">
		{#each rows as row (row.social.id)}
			{@const lit = active === row.social.id}
			<li
				class="group/row relative grid grid-cols-[2.25rem_minmax(0,1fr)_auto] items-center gap-x-3 border-b border-dashed border-foreground/15 py-3 first:border-t data-lit:z-10 sm:grid-cols-[2.25rem_minmax(0,1fr)_5.5rem_auto] sm:gap-x-4"
				data-lit={lit || undefined}
				onpointerenter={() => (active = row.social.id)}
				onpointerleave={() => (active = null)}
				onfocusin={() => (active = row.social.id)}
				onfocusout={() => (active = null)}
			>
				<span
					class="pointer-events-none absolute -inset-x-3 inset-y-1 -z-10 rounded-2xl bg-butter/0 transition-colors duration-300 group-data-lit/row:bg-butter/25 dark:group-data-lit/row:bg-butter/[0.07]"
					aria-hidden="true"
				></span>
				<span
					class="grid size-9 place-items-center rounded-full ring-1 ring-foreground/15 transition-colors group-data-lit/row:bg-night group-data-lit/row:text-butter dark:group-data-lit/row:bg-butter dark:group-data-lit/row:text-night"
				>
					<PlatformIcon id={row.social.id} class="size-4" />
				</span>
				<div class="min-w-0 leading-tight">
					<h3 class="font-semibold">
						{#if row.social.url}
							<a
								href={row.social.url}
								target="_blank"
								rel="noopener me"
								class="rounded-sm outline-none after:absolute after:inset-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
								aria-label={m.stats_profile_open({ platform: row.social.name })}>{row.social.name}</a
							>
						{:else}
							{row.social.name}
						{/if}
					</h3>
					{#if row.social.handle}<p class="truncate font-mono text-[0.7rem] text-muted-foreground">{row.social.handle}</p>{/if}
				</div>
				{#if row.platform && row.change}
					<Sparkline values={periodSlice(row.platform.followers, period)} label={m.stats_sparkline_label({ days: period })} class="hidden h-7 sm:block" />
					<div class="grid justify-items-end gap-0.5 text-right">
						<p class="flex items-baseline gap-2">
							<span class="font-mono text-[0.7rem] text-muted-foreground"
								><span class="sr-only">{m.stats_share_title()}:</span>
								{formatShare(row.share)}</span
							>
							<span class="font-display text-xl font-black tracking-tight tabular-nums sm:text-2xl">{formatNumber(row.change.value)}</span>
						</p>
						<Delta ratio={row.change.ratio} amount={formatSigned(row.change.delta)} />
					</div>
				{:else}
					<span class="hidden sm:block"></span>
					<p class="font-mono text-xs text-muted-foreground">{m.stats_platform_soon()}</p>
				{/if}
			</li>
		{/each}
	</ol>
</div>

<style>
	.sky {
		color: var(--foreground);
		filter: drop-shadow(0 18px 40px rgb(24 25 27 / 0.25));
	}

	:global(.dark) .sky {
		filter: drop-shadow(0 0 50px rgb(252 215 114 / 0.06));
	}

	.label {
		font: 600 3.1px var(--font-body);
		letter-spacing: 0.02em;
	}

	.value {
		font: 500 2.6px var(--font-mono);
	}

	.star {
		cursor: default;
	}

	.dust {
		animation: twinkle 5.4s ease-in-out infinite;
		opacity: 0.55;
	}

	@keyframes twinkle {
		50% {
			opacity: 0.12;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.dust {
			animation: none;
		}
	}
</style>
