<!--
	@component
	Frame for every error page: the site navbar in its night look (crescent wordmark, the pages, and the 03:00 clock, the hour
	the homepage night skips, in place of the menu), mono status, copy, home link, optional retry, the homepage sections as one
	column of plain links. The `scene` snippet (`WorldTree`, `GiantWall`) renders behind; the optional `badge` sits on the
	scene, outside the text column (the 404's seal, stamped into the painting).
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import SiteNav from '#lib/components/site/SiteNav.svelte';
	import NightClock from '#lib/home/shared/NightClock.svelte';
	import PaperGrain from '#lib/home/shared/PaperGrain.svelte';
	import { NIGHT_HOURS, type SectionId } from '#lib/home/night.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import grain from './assets/error-paper-grain.webp';

	interface Props {
		status: number;
		title: string;
		body: string;
		/** Show the reload button (server errors). */
		retry?: boolean;
		/** `tree` (404) or `wall` (500 and everything else): layout and intro timing. */
		variant: 'tree' | 'wall';
		scene: Snippet;
		/** Something stamped onto the scene, outside the text column (the 404's license seal). */
		badge?: Snippet;
	}

	let { status, title, body, retry = false, variant, scene, badge }: Props = $props();

	const sectionLabels: Record<SectionId, () => string> = {
		hero: m.home_nav_section_hero,
		making: m.home_nav_section_making,
		game: m.home_nav_section_game,
		'night-shift': m.home_nav_section_nightshift,
		radio: m.home_nav_section_radio,
		cinema: m.home_nav_section_cinema,
		sunrise: m.home_nav_section_sunrise
	};

	const home = $derived(localizeHref('/'));
</script>

<div class="error-page is-{variant}">
	<div class="scene">{@render scene()}</div>

	<div class="chrome">
		<SiteNav variant="night">
			{#snippet actions()}
				<NightClock time="03:00" placement="inline" class="error-clock" />
			{/snippet}
		</SiteNav>
	</div>

	<main class="panel" aria-labelledby="error-title">
		<div class="status-row">
			<p class="status font-mono tabular-nums" aria-hidden="true" style:--grain="url({grain})">{status}</p>
		</div>
		<h1 id="error-title" class="title font-display font-black tracking-wordmark text-balance">
			<span class="sr-only">{status}</span>
			{title}
		</h1>
		<p class="body text-pretty">{body}</p>

		<div class="actions">
			<a class="action is-home" href={home}>{m.error_home_link()}</a>
			{#if retry}
				<button type="button" class="action is-retry" onclick={() => location.reload()}>{m.error_retry()}</button>
			{/if}
		</div>

		<nav class="sections" aria-labelledby="error-sections">
			<h2 id="error-sections">{m.error_sections_label()}</h2>
			<ul>
				{#each NIGHT_HOURS as hour (hour.id)}
					<li>
						<a class="swash-focus" href="{home}#{hour.id}">
							<span class="font-mono text-[0.7rem] tracking-clock tabular-nums" aria-hidden="true">{hour.time}</span>
							<span>{sectionLabels[hour.id]()}</span>
						</a>
					</li>
				{/each}
			</ul>
		</nav>
	</main>

	{#if badge}
		<div class="badge">{@render badge()}</div>
	{/if}

	<PaperGrain src={grain} size={256} opacity={0.16} blend="soft-light" />
</div>

<style>
	.error-page {
		/* the shell's focus swash (`swash-focus`): butter on the ink */
		--focus-ring: var(--color-butter);
		--focus-halo: color-mix(in oklab, var(--color-butter) 55%, transparent);
		position: relative;
		isolation: isolate;
		min-height: 100svh;
		display: grid;
		grid-template-rows: auto 1fr;
		color: var(--color-cream);
		background: var(--color-ink);
		overflow: clip;
	}

	.scene {
		position: fixed;
		inset: 0;
		z-index: 0;
	}

	.error-page > :global(.paper-grain) {
		z-index: 4;
	}

	/* Chrome --------------------------------------------------------------------------------------------------- */

	/* The navbar is fixed (as on the homepage); this row keeps its height in the grid. Same layout lines as the homepage. */
	.error-page {
		--page-gutter: clamp(1.25rem, 4vw, 3.5rem);
		--nav-pad-y: clamp(1rem, 2.5vh, 1.75rem);
	}

	.chrome {
		position: relative;
		z-index: 3;
		height: calc(2.75rem + 2 * var(--nav-pad-y));
	}

	/* The clock ends on the gutter (the actions slot is offset for a 44px icon button) */
	.chrome :global(.error-clock) {
		margin-right: 0.75rem;
		padding-inline: 0.25rem;
	}

	/* Panel ---------------------------------------------------------------------------------------------------- */

	/* The panel overlaps the scene (phones: top half transparent); only its children take clicks so the scene stays reachable. */
	.panel {
		pointer-events: none;
		position: relative;
		z-index: 2;
		align-self: center;
		display: grid;
		justify-items: start;
		gap: 0;
		width: min(100%, 36rem);
		padding: 2rem clamp(1.25rem, 6vw, 6rem) 3rem;
	}

	.panel > * {
		pointer-events: auto;
	}

	.status-row {
		position: relative;
	}

	.status {
		margin: 0 0 0.25rem -0.06em;
		font-size: clamp(5.5rem, 15vw, 11.5rem);
		font-weight: 800;
		line-height: 0.85;
		letter-spacing: -0.06em;
		/* painted paper digits: butter pigment, cream highlight, ochre blooms, paper grain */
		background:
			var(--grain) 0 0 / 200px,
			radial-gradient(45% 55% at 22% 28%, var(--color-cream), transparent 70%),
			radial-gradient(40% 60% at 82% 78%, var(--color-ochre), transparent 75%),
			radial-gradient(30% 40% at 55% 95%, var(--color-ochre), transparent 80%),
			var(--color-butter);
		background-blend-mode: soft-light, normal, normal, normal, normal;
		background-clip: text;
		color: transparent;
		filter: drop-shadow(0 0.08em 0.2em rgb(14 15 16 / 0.6));
	}

	.title {
		margin-top: 0.75rem;
		font-size: clamp(1.6rem, 3.2vw, 2.6rem);
		line-height: 1.05;
	}

	.body {
		margin-top: 0.9rem;
		max-width: 34ch;
		font-size: 1.05rem;
		line-height: 1.55;
		color: color-mix(in oklab, var(--color-cream) 82%, transparent);
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem 2rem;
		margin-top: 1.25rem;
	}

	/*
	 * The way home is a sentence-case link with the shell's ink swash under it (as on the contact page's thanks), not a
	 * button: cream on the night, the swash in butter. Hover and focus: butter, the swash darkens and settles, soft light.
	 * Retry (server errors) is the quieter second link: its swash only inks in on hover and focus.
	 */
	.action {
		position: relative;
		display: inline-flex;
		align-items: center;
		min-height: 2.75rem;
		color: var(--color-cream);
		font-size: 1.125rem;
		font-weight: 600;
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
		transition: color var(--dur-hover) ease;
	}

	.action::after {
		content: '';
		position: absolute;
		left: -0.05em;
		right: -0.1em;
		bottom: 0.2rem;
		height: 0.42rem;
		background: var(--color-butter);
		mask: var(--ink-underline) center / 100% 100% no-repeat;
		opacity: 0.75;
		transform-origin: left;
		pointer-events: none;
		transition:
			opacity var(--dur-hover) ease,
			translate var(--dur-hover) var(--ease-settle),
			scale var(--dur-state) var(--ease-settle);
	}

	.is-retry {
		color: color-mix(in oklab, var(--color-cream) 85%, transparent);
	}

	.is-retry::after {
		scale: 0 1;
	}

	.action:hover,
	.action:focus-visible {
		color: var(--color-butter);
	}

	.action:hover::after,
	.action:focus-visible::after {
		opacity: 1;
		scale: 1 1;
		translate: 0 2px;
	}

	.action:focus-visible {
		outline: none;
		filter: drop-shadow(0 0 0.4rem var(--focus-halo));
	}

	.sections {
		margin-top: 2.25rem;
	}

	/* A quiet heading in sentence case (as written), not a tracked caps eyebrow */
	.sections h2 {
		font-size: 0.875rem;
		font-weight: 600;
		color: color-mix(in oklab, var(--color-cream) 66%, transparent);
	}

	.sections ul {
		display: grid;
		justify-items: start;
		margin-top: 0.5rem;
	}

	.sections a {
		--swash-x: 0;
		--swash-y: 0.05rem;
		--swash-h: 0.3rem;
		display: inline-flex;
		align-items: baseline;
		gap: 0.75rem;
		padding-block: 0.3rem;
		color: color-mix(in oklab, var(--color-cream) 85%, transparent);
		text-decoration: underline;
		text-decoration-color: transparent;
		text-underline-offset: 0.25em;
		transition: color 160ms ease;
	}

	.sections a span:first-child {
		color: color-mix(in oklab, var(--color-butter) 70%, transparent);
	}

	.sections a:hover {
		color: var(--color-butter);
		text-decoration-color: currentColor;
	}

	.sections a:focus-visible {
		color: var(--color-butter);
	}

	/* The badge stands on the scene, above the text's ink wash, under the paper grain */
	.badge {
		position: absolute;
		inset: 0;
		z-index: 3;
		pointer-events: none;
	}

	.badge > :global(*) {
		pointer-events: auto;
	}

	/* Layout per scene ----------------------------------------------------------------------------------------- */

	/* Phones: scene on top, text below on an ink wash */
	@media (max-width: 63.99rem) {
		.panel {
			align-self: end;
			width: 100%;
			padding-top: 46svh;
			background: linear-gradient(to bottom, transparent 38svh, rgb(14 15 16 / 0.88) 47svh, var(--color-ink) 60svh);
		}

		/* 390 × 844: the whole way home (status to link) above the fold; the tree and its climb stay above the text */
		.is-tree .panel {
			padding-top: 42svh;
			background: linear-gradient(to bottom, transparent 36svh, rgb(14 15 16 / 0.82) 46svh, var(--color-ink) 60svh);
		}

		.is-wall .panel {
			padding-top: 54svh;
			background: linear-gradient(to bottom, transparent 50svh, rgb(14 15 16 / 0.86) 60svh, var(--color-ink) 76svh);
		}

		.status {
			font-size: clamp(4.5rem, 24vw, 7rem);
		}
	}

	/* Desktop: text left, on an ink pool so the scene can be busy */
	@media (min-width: 64rem) {
		.panel::before {
			content: '';
			position: absolute;
			z-index: -1;
			inset: -30% -40% -30% -40%;
			background: radial-gradient(closest-side, rgb(14 15 16 / 0.92) 40%, rgb(14 15 16 / 0.6) 70%, transparent);
			pointer-events: none;
		}

		.is-wall .panel::before {
			background: radial-gradient(closest-side, rgb(14 15 16 / 0.7) 35%, rgb(14 15 16 / 0.35) 70%, transparent);
		}
	}

	/* Entrance: text arrives after the scene has made its move */
	@media (prefers-reduced-motion: no-preference) {
		.panel > *,
		.chrome {
			animation: rise 700ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
			animation-delay: calc(var(--intro) + var(--i, 0) * 70ms);
		}

		/* fade only: a translate on the wrapper would make it the containing block of the fixed navbar */
		.chrome {
			animation-name: fade;
		}

		.panel::before {
			animation: fade 900ms ease-out both;
			animation-delay: calc(var(--intro) - 200ms);
		}

		.is-tree {
			--intro: 500ms;
		}

		.is-wall {
			--intro: 250ms;
		}

		.chrome {
			--i: 0;
		}

		.status-row {
			--i: 1;
		}

		.title {
			--i: 2;
		}

		.body {
			--i: 3;
		}

		.actions {
			--i: 4;
		}

		.sections {
			--i: 5;
		}
	}

	@keyframes fade {
		from {
			opacity: 0;
		}
	}

	@keyframes rise {
		from {
			opacity: 0;
			translate: 0 0.9rem;
		}
	}
</style>
