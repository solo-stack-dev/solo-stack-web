<!--
	@component
	22:00 Game. Section shell: a painted poster + play button; the chosen candidate loads only on click (GameFrame).
	The poster is built from the shared materials (sky, painted stars, moon glow, paper grain) until the playtest winner
	gets its own poster art.
-->
<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import NightClock from '#lib/home/shared/NightClock.svelte';
	import PaperGrain from '#lib/home/shared/PaperGrain.svelte';
	import StarField from '#lib/home/shared/StarField.svelte';
	import { GAME_CANDIDATES, HOMEPAGE_GAME } from './candidates.ts';
	import GameFrame from './shared/GameFrame.svelte';

	const candidate = GAME_CANDIDATES[HOMEPAGE_GAME];
</script>

<section id="game" data-night-hour="22:00" class="game-section" aria-labelledby="home-game-title">
	<NightClock time="22:00" />
	<div class="content">
		<h2 id="home-game-title" class="font-display text-3xl font-black tracking-wordmark md:text-5xl">{m.home_game_title()}</h2>
		<GameFrame gameId={HOMEPAGE_GAME} load={candidate.load} label={candidate.title()}>
			{#snippet poster()}
				<div class="poster" aria-hidden="true">
					<StarField density={1.6} brightness={0.95} seed={2200} />
					<div class="poster-moon"></div>
					<p class="poster-title font-display font-black tracking-wordmark uppercase">{candidate.title()}</p>
					<PaperGrain fixed={false} opacity={0.12} />
				</div>
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

	.poster {
		position: absolute;
		inset: 0;
		overflow: hidden;
		background:
			radial-gradient(ellipse 80% 60% at 78% 22%, color-mix(in oklab, var(--color-ochre) 22%, transparent), transparent 70%),
			linear-gradient(to bottom, #1d1c1d, var(--color-ink) 75%);
	}

	.poster-moon {
		position: absolute;
		top: 12%;
		right: 10%;
		width: clamp(4.5rem, 16%, 10rem);
		aspect-ratio: 1;
		border-radius: 50%;
		background: radial-gradient(circle at 38% 36%, #fff1c4, var(--color-butter) 45%, var(--color-ochre));
		box-shadow: 0 0 80px 10px color-mix(in oklab, var(--color-butter) 35%, transparent);
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
