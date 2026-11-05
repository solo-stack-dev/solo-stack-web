<!--
	@component
	22:00 Game: the three games as tabs. Each shows a poster (shared sky, painted stars, paper grain) + play button; code
	loads on click (GameFrame). Only the selected tab's frame is mounted, so switching tabs stops the previous game.
-->
<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import NightClock from '#lib/home/shared/NightClock.svelte';
	import PaperGrain from '#lib/home/shared/PaperGrain.svelte';
	import StarField from '#lib/home/shared/StarField.svelte';
	import { CANDIDATE_IDS, GAME_CANDIDATES, HOMEPAGE_DEFAULT_GAME, type CandidateId } from './candidates.ts';
	import GameFrame from './shared/GameFrame.svelte';

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
					onclick={() => (selected = id)}
					onkeydown={onTabKeydown}
				>
					{GAME_CANDIDATES[id].title()}
				</button>
			{/each}
		</div>
		<div role="tabpanel" id="game-panel" class="panel" aria-labelledby="game-tab-{selected}">
			{#key selected}
				<GameFrame gameId={selected} load={candidate.load} label={candidate.title()}>
					{#snippet poster()}
						<div class="poster" aria-hidden="true">
							<StarField density={1.6} brightness={0.95} seed={2200} />
							<p class="poster-title font-display font-black tracking-wordmark uppercase">{candidate.title()}</p>
							<PaperGrain fixed={false} opacity={0.12} />
						</div>
					{/snippet}
				</GameFrame>
			{/key}
		</div>
	</div>
</section>

<style>
	/* Heading on the shared lines (clock, gutter); the play area below it is as large as one screen allows. */
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

	/* Tabs on the gutter lines like the heading; the frame is the centered art object. Tabs (2.75rem) + gap above the 16:9 stage: the
	   whole frame fits under the heading on a laptop screen. */
	.content {
		position: relative;
		z-index: 1;
		display: grid;
		gap: 0.75rem;
	}

	.panel {
		justify-self: center;
		width: min(100%, 72rem, calc((100svh - var(--heading-top) - 3.5rem - clamp(1.5rem, 4vh, 2.5rem) - 3.5rem - var(--bottom-gutter)) * 16 / 9));
	}

	@media (max-width: 40rem) {
		.panel {
			width: 100%;
		}
	}

	.tabs {
		display: flex;
		flex-wrap: wrap;
		gap: 0 0.35rem;
		margin-left: -0.55rem;
	}

	.tabs [role='tab'] {
		position: relative;
		min-height: 2.75rem;
		padding: 0.6rem 0.55rem;
		color: var(--color-cream);
		text-shadow: var(--halo-ink);
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

	/* Phones: one tab per line (a wrapped row would start lines with a separator dot) */
	@media (max-width: 40rem) {
		.tabs {
			flex-direction: column;
			align-items: flex-start;
		}

		.tabs [role='tab'] + [role='tab'] {
			margin-left: 0;
		}

		.tabs [role='tab'] + [role='tab']::before {
			content: none;
		}
	}

	.poster {
		position: absolute;
		inset: 0;
		overflow: hidden;
		background:
			radial-gradient(ellipse 80% 60% at 78% 22%, color-mix(in oklab, var(--color-ochre) 22%, transparent), transparent 70%),
			linear-gradient(to bottom, var(--color-night), var(--color-ink) 75%);
	}

	.poster-title {
		position: absolute;
		left: 6%;
		bottom: 8%;
		max-width: 60%;
		font-size: clamp(1.5rem, 4vw, 3.5rem);
		line-height: 0.95;
		color: color-mix(in oklab, var(--color-cream) 22%, transparent);
	}
</style>
