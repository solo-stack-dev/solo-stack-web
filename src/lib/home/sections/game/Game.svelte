<!--
	@component
	Game: one large poster with the title and play button in its calm lower left; code loads on click (GameFrame). The posters are
	real frames of the games (tools/capture-posters.mjs plays them headlessly and crops the frame), not painted art: what you see
	is what you play. The three games are plain text tabs beside the heading, the selected one marked with the
	page's hand-drawn underline. Only the selected tab's frame is mounted, so switching tabs stops the previous game.

	Layout: one centered column as wide as the frame, which is capped so heading, frame and the game line fit one screen:
	heading left and tabs right on one line (stacked on narrow screens), the frame, then the selected game's line and local record.
-->
<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import DeferredArt from '#lib/home/shared/DeferredArt.svelte';
	import PaperGrain from '#lib/home/shared/PaperGrain.svelte';
	import posterConstellations from './assets/frame-constellations.webp?w=1664;1280;960;640&enhanced';
	import posterMoonPlanet from './assets/frame-moon-planet.webp?w=1664;1280;960;640&enhanced';
	import posterStackToMoon from './assets/frame-stack-to-moon.webp?w=1664;1280;960;640&enhanced';
	import { CANDIDATE_IDS, GAME_CANDIDATES, HOMEPAGE_DEFAULT_GAME, type CandidateId } from './candidates.ts';
	import GameFrame from './shared/GameFrame.svelte';
	import { loadHighScore } from './shared/highscore.ts';

	/** Poster per game (a captured frame of the game, tools/capture-posters.mjs); `focus` is the subject's x (object-position) for the 4:5 phone crop. */
	const POSTERS: Record<CandidateId, { src: typeof posterMoonPlanet; focus: string }> = {
		'moon-planet': { src: posterMoonPlanet, focus: '100%' },
		'stack-to-moon': { src: posterStackToMoon, focus: '88%' },
		constellations: { src: posterConstellations, focus: '95%' }
	};

	/** What you do and how you play, under the frame. */
	const INFO: Record<CandidateId, () => string> = {
		'moon-planet': m.home_game_moon_info,
		'stack-to-moon': m.home_game_stack_info,
		constellations: m.home_game_stars_info
	};

	let selected = $state<CandidateId>(HOMEPAGE_DEFAULT_GAME);
	const candidate = $derived(GAME_CANDIDATES[selected]);

	/** The selected game's local record (shown once there is one); GameFrame reports new records while playing. */
	let record = $state(0);
	$effect(() => {
		record = loadHighScore(selected);
	});
	const pad = (value: number) => String(Math.floor(value)).padStart(6, '0');

	/** Arrow keys move between tabs (WAI-ARIA tabs pattern, automatic activation). */
	function onTabKeydown(event: KeyboardEvent) {
		const step = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 0;
		const edge = event.key === 'Home' ? 0 : event.key === 'End' ? CANDIDATE_IDS.length - 1 : -1;
		if (!step && edge < 0) return;
		event.preventDefault();
		const index = CANDIDATE_IDS.indexOf(selected);
		selected = CANDIDATE_IDS[edge >= 0 ? edge : (index + step + CANDIDATE_IDS.length) % CANDIDATE_IDS.length]!;
		document.getElementById(`game-tab-${selected}`)?.focus();
	}
</script>

<section id="game" data-night-hour class="game-section" aria-labelledby="home-game-title">
	<div class="content">
		<div class="head">
			<h2 id="home-game-title" class="night-heading">{m.home_game_title()}</h2>
			<!-- Plain text tabs: the game's title in the mono label face, the selected one in butter on the hand-drawn underline -->
			<div class="tabs" role="tablist" aria-label={m.home_game_tabs_label()}>
				{#each CANDIDATE_IDS as id (id)}
					<button
						type="button"
						role="tab"
						class="game-tab label"
						id="game-tab-{id}"
						aria-controls="game-panel"
						aria-selected={selected === id}
						tabindex={selected === id ? 0 : -1}
						onclick={() => (selected = id)}
						onkeydown={onTabKeydown}
					>
						{GAME_CANDIDATES[id].title()}
					</button>
				{/each}
			</div>
		</div>
		<div role="tabpanel" id="game-panel" class="panel" aria-labelledby="game-tab-{selected}">
			{#key selected}
				<GameFrame gameId={selected} load={candidate.load} label={candidate.title()} title={candidate.title()} onrecord={(value) => (record = value)}>
					{#snippet poster()}
						<div class="poster" aria-hidden="true" style:--poster-focus={POSTERS[selected].focus}>
							<DeferredArt rest>
								<enhanced:img
									src={POSTERS[selected].src}
									alt=""
									class="poster-art"
									sizes="(min-width: 80rem) 80rem, (min-width: 40rem) 92vw, 200vw"
									loading="lazy"
									decoding="async"
								/>
							</DeferredArt>
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
	/* The heading sits on the shared top line; heading, tabs, frame and game line share the frame's edges. */
	.game-section {
		position: relative;
		padding: var(--heading-top) var(--page-gutter) var(--bottom-gutter);
	}

	/* One column, as wide as the frame. From 40rem the frame (16:9) is capped so heading line, frame and game line fit one screen;
	   phones use the full width (4:5 stage). */
	.content {
		--row-gap: clamp(1rem, 2.5vh, 1.5rem);
		display: grid;
		gap: var(--row-gap);
		min-width: 0;
		margin-inline: auto;
	}

	@media (min-width: 40.01rem) {
		.content {
			/* heading over tabs ~5.5rem (one line on wide screens), game line ~3rem, two gaps */
			--frame-max: calc((100svh - var(--heading-top) - 8.5rem - 2 * var(--row-gap) - var(--bottom-gutter)) * 16 / 9);
			width: min(100%, max(var(--frame-max), 34rem));
		}
	}

	.panel {
		min-width: 0;
	}

	.head {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: space-between;
		gap: 0.5rem 2rem;
	}

	/* Chooser: the three titles as text, nothing around them. Outset by the tabs' own padding so the first and last letters
	   stand on the column's edges. */
	.tabs {
		display: flex;
		flex-wrap: wrap;
		gap: 0 clamp(0.5rem, 1.6vw, 1.25rem);
		margin-inline: -0.55rem;
	}

	.game-tab {
		position: relative;
		min-height: 2.75rem;
		padding: 0.6rem 0.55rem;
		white-space: nowrap;
		color: color-mix(in oklab, var(--color-cream) 78%, transparent);
		text-shadow: var(--halo-ink);
		cursor: pointer;
		transition: color var(--dur-hover);
	}

	/* the page's selection mark */
	.game-tab::after {
		content: '';
		position: absolute;
		left: 0.35rem;
		right: 0.35rem;
		bottom: 0.3rem;
		height: 0.4rem;
		background: var(--color-butter);
		mask: var(--ink-underline) center / 100% 100% no-repeat;
		scale: 0 1;
		transform-origin: left;
		transition: scale var(--dur-state) var(--ease-settle);
	}

	.game-tab:hover,
	.game-tab[aria-selected='true'] {
		color: var(--color-butter);
	}

	.game-tab[aria-selected='true']::after {
		scale: 1 1;
	}

	/* Keyboard focus in the page's idiom: the underline draws in and the label takes a soft light, no box */
	.game-tab:focus-visible {
		outline: none;
		color: var(--color-butter);
		filter: drop-shadow(0 0 0.45rem color-mix(in oklab, var(--color-butter) 55%, transparent));
	}

	.game-tab:focus-visible::after {
		scale: 1 1;
	}

	.info {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: space-between;
		gap: 0.5rem 2rem;
	}

	.info-line {
		margin: 0;
		max-width: 40rem;
		color: color-mix(in oklab, var(--color-cream) 82%, transparent);
		text-shadow: var(--halo-ink);
		line-height: 1.55;
		text-wrap: pretty;
	}

	.record {
		margin: 0;
		color: var(--color-cream);
	}

	/* Poster, full 16:9 (its lower-left third is calm for the title and play button). Phones crop it to the 4:5 stage around the
	   subject. */
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
