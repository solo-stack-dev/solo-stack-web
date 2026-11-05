<!--
	@component
	22:00 Game: the three games as tabs. Each shows its painted poster (docs/art/site/round-2/poster-*.png) with the title and
	play button in the art's calm lower left; code loads on click (GameFrame). Only the selected tab's frame is mounted, so
	switching tabs stops the previous game.

	Layout on the page grid (gutter to gutter): wide screens put the frame on 8/12 and a game column on 4/12 (vertical tab list on the
	frame's top line, the selected game's line and local record under it); narrower screens stack tabs, frame, game line.
	The section rises into the 21:00 stage's lower edge (--game-overlap), so the two hours meet without an empty band.
-->
<script lang="ts">
	import { MediaQuery } from 'svelte/reactivity';
	import { m } from '#lib/paraglide/messages.js';
	import NightClock from '#lib/home/shared/NightClock.svelte';
	import PaperGrain from '#lib/home/shared/PaperGrain.svelte';
	import posterConstellations from './assets/poster-constellations.webp?w=1664;1280;960;640&enhanced';
	import posterMoonPlanet from './assets/poster-moon-planet.webp?w=1664;1280;960;640&enhanced';
	import posterStackToMoon from './assets/poster-stack-to-moon.webp?w=1664;1280;960;640&enhanced';
	import { CANDIDATE_IDS, GAME_CANDIDATES, HOMEPAGE_DEFAULT_GAME, type CandidateId } from './candidates.ts';
	import GameFrame from './shared/GameFrame.svelte';
	import { loadHighScore } from './shared/highscore.ts';

	/** Painted poster per game; `focus` is the subject's x (object-position) for the 4:5 phone crop. */
	const POSTERS: Record<CandidateId, { src: typeof posterMoonPlanet; focus: string }> = {
		'moon-planet': { src: posterMoonPlanet, focus: '78%' },
		'stack-to-moon': { src: posterStackToMoon, focus: '100%' },
		constellations: { src: posterConstellations, focus: '88%' }
	};

	/** What you do and how you play, under the tab list. */
	const INFO: Record<CandidateId, () => string> = {
		'moon-planet': m.home_game_moon_info,
		'stack-to-moon': m.home_game_stack_info,
		constellations: m.home_game_stars_info
	};

	let selected = $state<CandidateId>(HOMEPAGE_DEFAULT_GAME);
	const candidate = $derived(GAME_CANDIDATES[selected]);
	/** Same breakpoint as the CSS: the tab list stands vertically in the game column. */
	const columns = new MediaQuery('(min-width: 64rem)', true);

	/** The selected game's local record (shown once there is one); GameFrame reports new records while playing. */
	let record = $state(0);
	$effect(() => {
		record = loadHighScore(selected);
	});
	const pad = (value: number) => String(Math.floor(value)).padStart(6, '0');

	/** Arrow keys move between tabs (WAI-ARIA tabs pattern, automatic activation); both axes, the list turns vertical on wide screens. */
	function onTabKeydown(event: KeyboardEvent) {
		const step = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 0;
		const edge = event.key === 'Home' ? 0 : event.key === 'End' ? CANDIDATE_IDS.length - 1 : -1;
		if (!step && edge < 0) return;
		event.preventDefault();
		const index = CANDIDATE_IDS.indexOf(selected);
		selected = CANDIDATE_IDS[edge >= 0 ? edge : (index + step + CANDIDATE_IDS.length) % CANDIDATE_IDS.length]!;
		document.getElementById(`game-tab-${selected}`)?.focus();
	}

	function select(id: CandidateId) {
		selected = id;
		reveal(id);
	}

	/** Phones: which ends of the scrolling tab row still hide tabs (drives the edge fades where scroll timelines are missing). */
	function onTabsScroll(event: Event) {
		const row = event.currentTarget as HTMLElement;
		row.toggleAttribute('data-scrolled', row.scrollLeft > 2);
		row.toggleAttribute('data-at-end', row.scrollLeft + row.clientWidth >= row.scrollWidth - 2);
	}

	/** Phones: the tab row scrolls; keep the selected tab in view. */
	function reveal(id: CandidateId) {
		document.getElementById(`game-tab-${id}`)?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
	}
</script>

<section id="game" data-night-hour="22:00" class="game-section" aria-labelledby="home-game-title">
	<NightClock time="22:00" />
	<h2 id="home-game-title" class="night-heading">{m.home_game_title()}</h2>
	<div class="content">
		<!-- Tabs in the page-wide selection idiom (label + hand-drawn underline): a row on the gutter under the heading, or a list in the
		     game column beside the frame -->
		<div class="tabs label" role="tablist" aria-label={m.home_game_tabs_label()} aria-orientation={columns.current ? 'vertical' : 'horizontal'} onscroll={onTabsScroll}>
			{#each CANDIDATE_IDS as id (id)}
				<button
					type="button"
					role="tab"
					id="game-tab-{id}"
					aria-controls="game-panel"
					aria-selected={selected === id}
					tabindex={selected === id ? 0 : -1}
					onclick={() => select(id)}
					onfocus={() => reveal(id)}
					onkeydown={onTabKeydown}
				>
					{GAME_CANDIDATES[id].title()}
				</button>
			{/each}
		</div>
		<div role="tabpanel" id="game-panel" class="panel" aria-labelledby="game-tab-{selected}">
			{#key selected}
				<GameFrame gameId={selected} load={candidate.load} label={candidate.title()} title={candidate.title()} onrecord={(value) => (record = value)}>
					{#snippet poster()}
						<div class="poster" aria-hidden="true" style:--poster-focus={POSTERS[selected].focus}>
							<enhanced:img
								src={POSTERS[selected].src}
								alt=""
								class="poster-art"
								sizes="(min-width: 72rem) 72rem, (min-width: 40rem) 92vw, 200vw"
								loading="lazy"
								decoding="async"
							/>
							<PaperGrain fixed={false} opacity={0.06} />
						</div>
					{/snippet}
				</GameFrame>
			{/key}
		</div>
		<div class="info">
			<p class="info-line">{INFO[selected]()}</p>
			{#if record > 0}
				<p class="record font-mono text-xs tracking-clock tabular-nums"><span class="text-cream/60">{m.home_game_highscore()}</span> {pad(record)}</p>
			{/if}
		</div>
	</div>
</section>

<style>
	/* Heading on the shared lines (clock, gutter); the play area below it is as large as one screen allows. Heading, tab row
	   and the frame's stage share one left edge: the page gutter. The section rises --game-overlap into the 21:00 stage's lower edge
	   (its rock and feather, under the 21:00 controls), and paints above the seam's mist (z 2, after it in the page): the 22:00 clock
	   and heading stand in the cloud instead of under an empty band. Only its own content takes pointer events in the overlap. */
	.game-section {
		--game-overlap: clamp(6rem, 16vh, 10rem);
		position: relative;
		z-index: 2;
		margin-top: calc(-1 * var(--game-overlap));
		display: grid;
		align-content: start;
		gap: clamp(1.5rem, 4vh, 2.5rem);
		/* ends on the frame (or the game line) plus the bottom gutter: no runway before 01:00, whose room fades in right under it */
		padding: var(--heading-top) var(--page-gutter) var(--bottom-gutter);
		pointer-events: none;
	}

	.game-section > :global(*) {
		pointer-events: auto;
	}

	.game-section > h2 {
		position: relative;
		z-index: 1;
		max-width: 60rem;
	}

	/* Narrow: tabs, frame, game line. Wide (≥ 64rem): frame on 8/12 of the page grid, the game column on 4/12 (tab list on the frame's
	   top line, the game line and record under it), gutter to gutter. The frame never grows taller than one screen allows under
	   the heading; a capped frame hands its width to the column. */
	.content {
		position: relative;
		z-index: 1;
		display: grid;
		grid-template-areas: 'tabs' 'panel' 'info';
		gap: 0.75rem;
		min-width: 0;
	}

	.tabs {
		grid-area: tabs;
	}

	.panel {
		grid-area: panel;
		min-width: 0;
	}

	.info {
		grid-area: info;
		display: grid;
		gap: 0.6rem;
		max-width: 34rem;
		margin-top: 1rem;
	}

	.info-line {
		margin: 0;
		color: color-mix(in oklab, var(--color-cream) 86%, transparent);
		text-shadow: var(--halo-ink);
		line-height: 1.55;
		text-wrap: pretty;
	}

	.record {
		margin: 0;
		color: var(--color-cream);
	}

	@media (min-width: 64rem) {
		.content {
			--col-gap: clamp(2rem, 3.2vw, 3.5rem);
			/* heading (≤ 2 lines at this width ~ 3.5rem), section gap, rule gap and the bottom gutter under the frame */
			--frame-max: calc((100svh - var(--heading-top) - 3.5rem - clamp(1.5rem, 4vh, 2.5rem) - var(--bottom-gutter) - 1rem) * 16 / 9);
			grid-template-columns: minmax(0, min(calc((100% - var(--col-gap)) * 2 / 3), var(--frame-max))) minmax(14rem, 1fr);
			grid-template-rows: auto 1fr;
			grid-template-areas: 'panel tabs' 'panel info';
			column-gap: var(--col-gap);
			row-gap: 0;
		}

		.info {
			align-self: start;
			margin-top: 1.75rem;
		}
	}

	/* The tab text starts on the gutter (the padding hangs into it) */
	.tabs {
		display: flex;
		align-items: flex-start;
		gap: 0 0.35rem;
		margin-left: -0.55rem;
	}

	.tabs [role='tab'] {
		position: relative;
		flex: none;
		min-height: 2.75rem;
		padding: 0.6rem 0.55rem;
		color: var(--color-cream);
		text-shadow: var(--halo-ink);
		white-space: nowrap;
		/* preflight resets buttons to none; the label style is uppercase */
		text-transform: inherit;
		cursor: pointer;
		transition: color var(--dur-hover);
	}

	.tabs [role='tab'] + [role='tab'] {
		margin-left: 0.85rem;
	}

	.tabs [role='tab'] + [role='tab']::before {
		content: '·';
		position: absolute;
		left: -0.75rem;
		color: color-mix(in oklab, var(--color-cream) 55%, transparent);
	}

	.tabs [role='tab']::after {
		content: '';
		position: absolute;
		left: 0.35rem;
		right: 0.35rem;
		bottom: 0.1rem;
		height: 0.45rem;
		background: var(--color-butter);
		mask: var(--ink-underline) center / 100% 100% no-repeat;
		scale: 0 1;
		transform-origin: left;
		transition: scale var(--dur-state) var(--ease-settle);
	}

	.tabs [role='tab']:hover,
	.tabs [aria-selected='true'] {
		color: var(--color-butter);
	}

	.tabs [aria-selected='true']::after {
		scale: 1 1;
	}

	.tabs [role='tab']:focus-visible {
		outline-offset: -2px;
	}

	/* Game column: the same labels as a list, top-aligned with the frame (the first label's cap line on the stage's top edge) */
	@media (min-width: 64rem) {
		.tabs {
			flex-direction: column;
			gap: 0.15rem;
			margin-top: -0.6rem;
		}

		.tabs [role='tab'] + [role='tab'] {
			margin-left: 0;
		}

		.tabs [role='tab'] + [role='tab']::before {
			content: none;
		}
	}

	/* Phones: still one row, scrolling sideways under a fade at the open edge(s); the row runs to the screen edge. The fade is a
	   wide ramp (about one tab word) that is fully clear a little before the edge, so a tab running off the edge visibly dissolves
	   instead of reading as cut; it lifts once the row is scrolled to its end. The scroll padding lets the last tab leave it. */
	@media (max-width: 40rem) {
		.tabs {
			--fade-start: 0rem;
			--fade-end: 7rem;
			margin-right: calc(var(--page-gutter) * -1);
			padding-right: calc(var(--page-gutter) + 3rem);
			overflow-x: auto;
			overscroll-behavior-x: contain;
			scroll-padding-inline: 3rem 7rem;
			scrollbar-width: none;
			mask-image: linear-gradient(
				to right,
				transparent,
				color-mix(in oklab, #000 45%, transparent) calc(var(--fade-start) * 0.45),
				#000 var(--fade-start),
				#000 calc(100% - var(--fade-end)),
				color-mix(in oklab, #000 50%, transparent) calc(100% - var(--fade-end) * 0.6),
				color-mix(in oklab, #000 12%, transparent) calc(100% - var(--fade-end) * 0.3),
				transparent calc(100% - var(--fade-end) * 0.12)
			);
			transition:
				--fade-start var(--dur-state) ease,
				--fade-end var(--dur-state) ease;
		}

		/* Without scroll timelines: the scroll handler's flags move the fades */
		.tabs:global([data-scrolled]) {
			--fade-start: 4rem;
		}

		.tabs:global([data-at-end]) {
			--fade-end: 0rem;
		}

		.tabs::-webkit-scrollbar {
			display: none;
		}

		@supports (animation-timeline: scroll(self inline)) {
			.tabs {
				animation: tab-fades linear both;
				animation-timeline: scroll(self inline);
			}
		}
	}

	@property --fade-start {
		syntax: '<length>';
		inherits: false;
		initial-value: 0rem;
	}

	@property --fade-end {
		syntax: '<length>';
		inherits: false;
		initial-value: 7rem;
	}

	/* The fade moves to the side that still has tabs to reveal */
	@keyframes tab-fades {
		0% {
			--fade-start: 0rem;
			--fade-end: 7rem;
		}
		15%,
		85% {
			--fade-start: 4rem;
			--fade-end: 7rem;
		}
		100% {
			--fade-start: 4rem;
			--fade-end: 0rem;
		}
	}

	/* Painted poster, full 16:9 (its lower-left third is left calm for the title and play button). Phones crop it to the 4:5
	   stage around the subject. */
	.poster {
		position: absolute;
		inset: 0;
		overflow: hidden;
		background: var(--color-ink);
	}

	.poster :global(.poster-art) {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: var(--poster-focus, 50%) 50%;
		user-select: none;
	}
</style>
