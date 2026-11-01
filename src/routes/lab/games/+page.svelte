<!--
	Playtest lab for the three game prototypes. Each tab shows the candidate in the real GameFrame with the debug
	tuning panel. Hidden panels stay mounted (state survives tab switches) and pause automatically (off screen).
-->
<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { CANDIDATE_IDS, GAME_CANDIDATES, type CandidateId } from '#lib/home/sections/game/candidates.ts';
	import GameFrame from '#lib/home/sections/game/shared/GameFrame.svelte';
	import PaperGrain from '#lib/home/shared/PaperGrain.svelte';

	let selected = $state<CandidateId>(CANDIDATE_IDS[0]!);
	let touchAlways = $state(false);

	function onkeydown(event: KeyboardEvent) {
		const index = CANDIDATE_IDS.indexOf(selected);
		const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
		if (!step) return;
		event.preventDefault();
		selected = CANDIDATE_IDS[(index + step + CANDIDATE_IDS.length) % CANDIDATE_IDS.length]!;
		document.getElementById(`tab-${selected}`)?.focus();
	}
</script>

<svelte:head>
	<title>{m.lab_games_title()}</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="lab">
	<header class="lab-header">
		<p class="font-display text-xl font-black tracking-wordmark uppercase">SOLO STACK</p>
		<p class="font-mono text-xs tracking-clock text-cream/60">/lab/games</p>
	</header>

	<div class="tabs font-mono text-sm" role="tablist" aria-label={m.lab_games_tabs_label()} tabindex="-1" {onkeydown}>
		{#each CANDIDATE_IDS as id (id)}
			<button
				type="button"
				role="tab"
				id="tab-{id}"
				aria-controls="panel-{id}"
				aria-selected={selected === id}
				tabindex={selected === id ? 0 : -1}
				onclick={() => (selected = id)}
			>
				{id}
			</button>
		{/each}
		<label class="touch-toggle font-mono text-xs">
			<input type="checkbox" bind:checked={touchAlways} />
			<span>{m.lab_games_touch_toggle()}</span>
		</label>
	</div>

	{#each CANDIDATE_IDS as id (id)}
		<div role="tabpanel" id="panel-{id}" aria-labelledby="tab-{id}" hidden={selected !== id} class="panel">
			<GameFrame gameId={id} load={GAME_CANDIDATES[id].load} label={GAME_CANDIDATES[id].title()} debug {touchAlways} />
		</div>
	{/each}
</div>

<PaperGrain />

<style>
	.lab {
		display: grid;
		gap: 1.5rem;
		width: min(100% - 2rem, 80rem);
		margin-inline: auto;
		padding-block: 2rem 4rem;
	}

	.lab-header {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
	}

	.tabs {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
	}

	.tabs [role='tab'] {
		padding: 0.4rem 0.9rem;
		border-radius: 999px;
		border: 1px solid color-mix(in oklab, var(--color-cream) 25%, transparent);
		cursor: pointer;
	}

	.tabs [aria-selected='true'] {
		background: var(--color-butter);
		border-color: var(--color-butter);
		color: var(--color-night);
	}

	.touch-toggle {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		margin-left: auto;
		accent-color: var(--color-butter);
	}
</style>
