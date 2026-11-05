<!--
	@component
	22:00 Game: the three games as tabs. Each shows its painted poster (docs/art/site/round-2/poster-*.png) with the title and
	play button in the art's calm lower left; code loads on click (GameFrame). Only the selected tab's frame is mounted, so
	switching tabs stops the previous game.
-->
<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import NightClock from '#lib/home/shared/NightClock.svelte';
	import PaperGrain from '#lib/home/shared/PaperGrain.svelte';
	import posterConstellations from './assets/poster-constellations.webp?w=1664;1280;960;640&enhanced';
	import posterMoonPlanet from './assets/poster-moon-planet.webp?w=1664;1280;960;640&enhanced';
	import posterStackToMoon from './assets/poster-stack-to-moon.webp?w=1664;1280;960;640&enhanced';
	import { CANDIDATE_IDS, GAME_CANDIDATES, HOMEPAGE_DEFAULT_GAME, type CandidateId } from './candidates.ts';
	import GameFrame from './shared/GameFrame.svelte';

	/** Painted poster per game; `focus` is the subject's x (object-position) for the 4:5 phone crop. */
	const POSTERS: Record<CandidateId, { src: typeof posterMoonPlanet; focus: string }> = {
		'moon-planet': { src: posterMoonPlanet, focus: '78%' },
		'stack-to-moon': { src: posterStackToMoon, focus: '100%' },
		constellations: { src: posterConstellations, focus: '88%' }
	};

	let selected = $state<CandidateId>(HOMEPAGE_DEFAULT_GAME);
	const candidate = $derived(GAME_CANDIDATES[selected]);

	/** Arrow keys move between tabs (WAI-ARIA tabs pattern, automatic activation). */
	function onTabKeydown(event: KeyboardEvent) {
		const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
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

	/** Phones: the tab row scrolls; keep the selected tab in view. */
	function reveal(id: CandidateId) {
		document.getElementById(`game-tab-${id}`)?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
	}
</script>

<section id="game" data-night-hour="22:00" class="game-section" aria-labelledby="home-game-title">
	<NightClock time="22:00" />
	<h2 id="home-game-title" class="night-heading">{m.home_game_title()}</h2>
	<div class="content">
		<!-- Tabs in the page-wide selection idiom (label + hand-drawn underline), on the gutter under the heading -->
		<div class="tabs label" role="tablist" aria-label={m.home_game_tabs_label()}>
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
				<GameFrame gameId={selected} load={candidate.load} label={candidate.title()} title={candidate.title()}>
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
	</div>
</section>

<style>
	/* Heading on the shared lines (clock, gutter); the play area below it is as large as one screen allows. Heading, tab row
	   and the frame's stage share one left edge: the page gutter. */
	.game-section {
		position: relative;
		min-height: 100svh;
		display: grid;
		align-content: start;
		gap: clamp(1.5rem, 4vh, 2.5rem);
		padding: var(--heading-top) var(--page-gutter) calc(var(--bottom-gutter) + 2rem);
	}

	.game-section > h2 {
		position: relative;
		z-index: 1;
		max-width: 60rem;
	}

	/* Tabs (2.75rem) + gap above the 16:9 stage: the whole frame fits under the heading on a laptop screen. */
	.content {
		position: relative;
		z-index: 1;
		display: grid;
		gap: 0.75rem;
		min-width: 0;
	}

	.panel {
		justify-self: start;
		width: min(100%, 72rem, calc((100svh - var(--heading-top) - 3.5rem - clamp(1.5rem, 4vh, 2.5rem) - 3.5rem - var(--bottom-gutter)) * 16 / 9));
	}

	@media (max-width: 40rem) {
		.panel {
			width: 100%;
		}
	}

	/* The tab text starts on the gutter (the padding hangs into it) */
	.tabs {
		display: flex;
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

	/* Phones: still one row, scrolling sideways under a soft fade at the open edge(s); the row runs to the screen edge. */
	@media (max-width: 40rem) {
		.tabs {
			--fade-start: 0rem;
			--fade-end: 3rem;
			margin-right: calc(var(--page-gutter) * -1);
			padding-right: var(--page-gutter);
			overflow-x: auto;
			overscroll-behavior-x: contain;
			scroll-padding-inline: 0.5rem 3rem;
			scrollbar-width: none;
			mask-image: linear-gradient(to right, transparent, #000 var(--fade-start), #000 calc(100% - var(--fade-end)), transparent);
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
		initial-value: 3rem;
	}

	/* The fade moves to the side that still has tabs to reveal */
	@keyframes tab-fades {
		0% {
			--fade-start: 0rem;
			--fade-end: 3rem;
		}
		12%,
		88% {
			--fade-start: 2rem;
			--fade-end: 3rem;
		}
		100% {
			--fade-start: 2rem;
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
