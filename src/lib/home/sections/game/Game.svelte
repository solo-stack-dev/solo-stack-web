<!--
	@component
	22:00 Game. All three games as tabs; each shows a painted poster + play button and its code loads only on click
	(GameFrame). Only the selected tab's frame is mounted, so switching tabs stops the previous game. The poster is built
	from the shared materials (sky, painted stars, paper grain).
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
	<div class="content">
		<h2 id="home-game-title" class="font-display text-3xl font-black tracking-wordmark md:text-5xl">{m.home_game_title()}</h2>
		<div class="tabs font-mono text-xs tracking-clock uppercase" role="tablist" aria-label={m.home_game_tabs_label()}>
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
		<div role="tabpanel" id="game-panel" aria-labelledby="game-tab-{selected}">
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
	.game-section {
		position: relative;
		min-height: 100svh;
		display: grid;
		align-items: center;
		padding: 9rem clamp(1.25rem, 6vw, 6rem) 6rem;
	}

	.content {
		position: relative;
		z-index: 1;
		display: grid;
		gap: 2rem;
		width: min(100%, 72rem);
		margin-inline: auto;
	}

	.tabs {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-bottom: -1rem;
	}

	.tabs [role='tab'] {
		padding: 0.55rem 1rem;
		border-radius: 999px;
		border: 1px solid color-mix(in oklab, var(--color-cream) 28%, transparent);
		color: var(--color-cream);
		cursor: pointer;
		transition:
			background-color 0.2s,
			border-color 0.2s,
			color 0.2s;
	}

	.tabs [role='tab']:hover {
		border-color: var(--color-butter);
	}

	.tabs [aria-selected='true'] {
		background: var(--color-butter);
		border-color: var(--color-butter);
		color: var(--color-night);
	}

	.poster {
		position: absolute;
		inset: 0;
		overflow: hidden;
		background:
			radial-gradient(ellipse 80% 60% at 78% 22%, color-mix(in oklab, var(--color-ochre) 22%, transparent), transparent 70%),
			linear-gradient(to bottom, #1d1c1d, var(--color-ink) 75%);
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
