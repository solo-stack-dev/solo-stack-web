<!--
	@component
	22:00 Game. Section shell: painted poster + play button; the chosen candidate loads only on click (GameFrame).
	PLACEHOLDER from Phase 0: owner of the layout and poster art is the game integration step after the playtest.
-->
<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import MockupRef from '#lib/home/shared/MockupRef.svelte';
	import NightClock from '#lib/home/shared/NightClock.svelte';
	import { GAME_CANDIDATES, HOMEPAGE_GAME } from './candidates.ts';
	import GameFrame from './shared/GameFrame.svelte';
	// TEMPORARY: round-2 mockup as in-place visual target (04-game/05-stack-to-moon-idle-desktop.png). Remove with the real art.
	import mockup from './assets/game-mockup-ref.webp';

	const candidate = GAME_CANDIDATES[HOMEPAGE_GAME];
</script>

<section id="game" data-night-hour="22:00" class="game-section" aria-labelledby="home-game-title">
	<MockupRef src={mockup} opacity={0.18} />
	<NightClock time="22:00" />
	<div class="content">
		<h2 id="home-game-title" class="font-display text-3xl font-black tracking-wordmark md:text-5xl">{m.home_game_title()}</h2>
		<GameFrame gameId={HOMEPAGE_GAME} load={candidate.load} label={candidate.title()}>
			{#snippet poster()}
				<MockupRef src={mockup} opacity={0.75} />
			{/snippet}
		</GameFrame>
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
</style>
