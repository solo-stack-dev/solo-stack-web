<!--
	@component
	22:00 Game: the three games as tabs. Each shows its painted poster (docs/art/site/round-2/poster-*.png) with the title and
	play button in the art's calm lower left; code loads on click (GameFrame). Only the selected tab's frame is mounted, so
	switching tabs stops the previous game.

	The tabs are torn-off strips of the same posters (small `w=` ladder, lazy) with the title in the display face, so the three games
	read as three things to pick: the selected strip lies straight on a butter backing in full color with the hand-drawn underline,
	the others are dimmed and slightly askew until hover/focus.

	Layout on the page grid (gutter to gutter): wide screens put the frame on 8/12 and a game column on 4/12 (the strips stacked from
	the frame's top line, the selected game's line and local record under them); narrower screens stack a row of strips, frame,
	game line (phones: the row scrolls sideways).
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
	import stripConstellations from './assets/poster-constellations.webp?w=1120;720;400&enhanced';
	import stripMoonPlanet from './assets/poster-moon-planet.webp?w=1120;720;400&enhanced';
	import stripStackToMoon from './assets/poster-stack-to-moon.webp?w=1120;720;400&enhanced';
	import { CANDIDATE_IDS, GAME_CANDIDATES, HOMEPAGE_DEFAULT_GAME, type CandidateId } from './candidates.ts';
	import { DECKLE_STRIPS, DECKLE_STRIPS_BACK } from './shared/deckle.ts';
	import GameFrame from './shared/GameFrame.svelte';
	import { loadHighScore } from './shared/highscore.ts';

	/**
	 * Painted poster per game; `focus` is the subject's x (object-position) for the 4:5 phone crop. `strip` is the same painting at
	 * chooser size and `stripY` the subject's y for the wide strip crop (the strip shows the full width, its title on the calm left).
	 */
	const POSTERS: Record<CandidateId, { src: typeof posterMoonPlanet; focus: string; strip: typeof stripMoonPlanet; stripY: string }> = {
		'moon-planet': { src: posterMoonPlanet, focus: '78%', strip: stripMoonPlanet, stripY: '8%' },
		'stack-to-moon': { src: posterStackToMoon, focus: '100%', strip: stripStackToMoon, stripY: '6%' },
		constellations: { src: posterConstellations, focus: '88%', strip: stripConstellations, stripY: '30%' }
	};

	/** Each strip lies a little askew, as if torn off and put down by hand; the selected one straightens. */
	const TILTS = ['-0.7deg', '0.5deg', '-0.35deg'] as const;

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
		<!-- Each tab is a torn-off strip of its game's poster with the title in the display face over the art's calm left (the
		     selected one lit: butter edge, full color, the hand-drawn underline). A stack in the game column beside the frame, or a row
		     on the gutter under the heading. -->
		<div class="tabs" role="tablist" aria-label={m.home_game_tabs_label()} aria-orientation={columns.current ? 'vertical' : 'horizontal'} onscroll={onTabsScroll}>
			{#each CANDIDATE_IDS as id, index (id)}
				<button
					type="button"
					role="tab"
					class="game-tab"
					id="game-tab-{id}"
					aria-controls="game-panel"
					aria-selected={selected === id}
					tabindex={selected === id ? 0 : -1}
					style:--tilt={TILTS[index]}
					style:--strip-deckle={DECKLE_STRIPS[index]}
					style:--strip-deckle-back={DECKLE_STRIPS_BACK[index]}
					onclick={() => select(id)}
					onfocus={() => reveal(id)}
					onkeydown={onTabKeydown}
				>
					<span class="strip" aria-hidden="true">
						<enhanced:img
							src={POSTERS[id].strip}
							alt=""
							class="strip-art"
							style="object-position: 50% {POSTERS[id].stripY}"
							sizes="(min-width: 64rem) 34vw, (min-width: 40rem) 32vw, 16rem"
							loading="lazy"
							decoding="async"
						/>
					</span>
					<span class="strip-title font-display font-black tracking-wordmark uppercase">{GAME_CANDIDATES[id].title()}</span>
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

	/* Chooser: three torn-off strips of the games' posters (the frame's deckle technique at strip size), each title in the display
	   face over its art's calm left. Dimmed and a little askew at rest; hover/focus straightens and lights them halfway; the
	   selected one lies straight on a butter backing sheet in full color with the page's hand-drawn underline. Narrow screens: a
	   row of three under the heading; wide: a stack in the game column. */
	.tabs {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: clamp(0.9rem, 2vw, 1.4rem);
		padding-block: 0.4rem;
	}

	.game-tab {
		--strip-h: clamp(5.25rem, 11vw, 6.75rem);
		--title-size: clamp(1.05rem, 2.1vw, 1.45rem);
		--nudge: 0 -0.2rem;
		position: relative;
		display: grid;
		align-items: center;
		justify-items: start;
		min-height: var(--strip-h);
		padding: 0.85rem clamp(0.9rem, 2vw, 1.3rem) 1.05rem;
		text-align: start;
		text-transform: none;
		cursor: pointer;
		rotate: var(--tilt, 0deg);
		transition:
			rotate var(--dur-state) var(--ease-settle),
			translate var(--dur-state) var(--ease-settle);
	}

	/* the torn backing sheet: dim ochre paper at rest, butter when lit (its own tear, so the edge never runs parallel) */
	.game-tab::before {
		content: '';
		position: absolute;
		inset: -0.24rem -0.3rem;
		background: color-mix(in oklab, var(--color-ochre) 22%, var(--color-ink));
		mask: var(--strip-deckle-back) center / 100% 100% no-repeat;
		transition: background-color var(--dur-state) ease;
	}

	.strip {
		position: absolute;
		inset: 0;
		overflow: hidden;
		background: var(--color-ink);
		mask: var(--strip-deckle) center / 100% 100% no-repeat;
	}

	.strip :global(.strip-art) {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		filter: grayscale(0.4) brightness(0.62);
		user-select: none;
		transition: filter var(--dur-state) ease;
	}

	/* an ink pool on the calm left carries the cream title */
	.strip::after {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(
			to right,
			color-mix(in oklab, var(--color-ink) 72%, transparent),
			color-mix(in oklab, var(--color-ink) 30%, transparent) 45%,
			transparent 70%
		);
	}

	.strip-title {
		position: relative;
		max-width: 11ch;
		font-size: var(--title-size);
		line-height: 0.95;
		color: color-mix(in oklab, var(--color-cream) 68%, transparent);
		text-shadow: var(--halo-ink);
		text-wrap: balance;
		transition: color var(--dur-hover);
	}

	/* the page's selection mark */
	.strip-title::after {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		bottom: -0.55rem;
		height: 0.42rem;
		background: var(--color-butter);
		mask: var(--ink-underline) center / 100% 100% no-repeat;
		scale: 0 1;
		transform-origin: left;
		transition: scale var(--dur-state) var(--ease-settle);
	}

	.game-tab:is(:hover, :focus-visible):not([aria-selected='true']) {
		rotate: 0deg;
		translate: var(--nudge);
	}

	.game-tab:is(:hover, :focus-visible):not([aria-selected='true'])::before {
		background: color-mix(in oklab, var(--color-ochre) 55%, var(--color-ink));
	}

	.game-tab:is(:hover, :focus-visible):not([aria-selected='true']) .strip :global(.strip-art) {
		filter: grayscale(0.15) brightness(0.8);
	}

	.game-tab:is(:hover, :focus-visible) .strip-title {
		color: var(--color-cream);
	}

	.game-tab:is(:hover, :focus-visible):not([aria-selected='true']) .strip-title::after {
		scale: 0.3 1;
	}

	.game-tab[aria-selected='true'] {
		rotate: 0deg;
	}

	.game-tab[aria-selected='true']::before {
		background: color-mix(in oklab, var(--color-butter) 88%, var(--color-ochre));
	}

	.game-tab[aria-selected='true'] .strip :global(.strip-art) {
		filter: none;
	}

	.game-tab[aria-selected='true'] .strip-title {
		color: var(--color-cream);
	}

	.game-tab[aria-selected='true'] .strip-title::after {
		scale: 1 1;
	}

	/* Keyboard focus in the page's idiom, not a box around a torn sheet: the backing lights butter and glows, the swash draws in */
	.game-tab:focus-visible {
		outline: none;
		box-shadow: none;
		filter: drop-shadow(0 0 0.5rem color-mix(in oklab, var(--color-butter) 55%, transparent));
	}

	.game-tab:focus-visible::before {
		background: var(--color-butter);
	}

	.game-tab:focus-visible .strip-title::after {
		scale: 1 1;
	}

	@media (prefers-reduced-motion: reduce) {
		.game-tab {
			transition: none;
		}
	}

	/* Game column: the strips stacked, the first one's top on the frame's top line; they lean toward the frame on hover */
	@media (min-width: 64rem) {
		.tabs {
			grid-template-columns: minmax(0, 1fr);
			gap: clamp(1rem, 2.4vh, 1.5rem);
			padding-block: 0;
		}

		.game-tab {
			--strip-h: clamp(5.75rem, 14vh, 8.5rem);
			--title-size: clamp(1.4rem, 1.9vw, 2.1rem);
			--nudge: -0.3rem 0;
			padding-inline: clamp(1.1rem, 1.8vw, 1.6rem);
		}
	}

	/* Phones: the strips in one row scrolling sideways (about one and a half in view, so the next one peeks), under a fade at the
	   open edge(s); the row runs edge to edge. The fade is a wide ramp that is fully clear a little before the edge, so a strip
	   running off it visibly dissolves instead of reading as cut; it lifts once the row is scrolled to its end. */
	@media (max-width: 40rem) {
		.tabs {
			--fade-start: 0rem;
			--fade-end: 5rem;
			display: flex;
			gap: 1.1rem;
			margin-inline: calc(var(--page-gutter) * -1);
			padding: 0.5rem calc(var(--page-gutter) + 2rem) 0.6rem var(--page-gutter);
			overflow-x: auto;
			overscroll-behavior-x: contain;
			scroll-padding-inline: calc(var(--page-gutter) + 2rem) 5rem;
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

		.game-tab {
			--strip-h: 5.5rem;
			--title-size: 1.2rem;
			flex: none;
			width: min(15rem, 62vw);
		}

		/* Without scroll timelines: the scroll handler's flags move the fades */
		.tabs:global([data-scrolled]) {
			--fade-start: 3rem;
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
		initial-value: 5rem;
	}

	/* The fade moves to the side that still has tabs to reveal */
	@keyframes tab-fades {
		0% {
			--fade-start: 0rem;
			--fade-end: 5rem;
		}
		15%,
		85% {
			--fade-start: 3rem;
			--fade-end: 5rem;
		}
		100% {
			--fade-start: 3rem;
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
