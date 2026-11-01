<!--
	@component
	01:00 Night shift. PLACEHOLDER from Phase 0, owned by the night shift agent (docs/HANDOFF-HOMEPAGE.md §5.4).
	Demonstrates the prerendered commits feed: real commit messages only, empty state when the API was unreachable.
-->
<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { getRecentCommits } from '#lib/home/data/github.remote.ts';
	import MockupRef from '#lib/home/shared/MockupRef.svelte';
	import NightClock from '#lib/home/shared/NightClock.svelte';
	// TEMPORARY: round-2 mockup as in-place visual target (05-night-shift-radio/01-night-shift-desktop.png). Remove with the real art.
	import mockup from './assets/nightshift-mockup-ref.webp';

	const commits = $derived(await getRecentCommits());
</script>

<section id="night-shift" data-night-hour="01:00" class="night-shift" aria-labelledby="home-nightshift-title">
	<MockupRef src={mockup} />
	<NightClock time="01:00" />
	<div class="content">
		<h2 id="home-nightshift-title" class="font-display text-3xl font-black tracking-wordmark md:text-5xl">{m.home_nightshift_title()}</h2>
		<div class="monitor font-mono text-xs" role="region" aria-label={m.home_nightshift_monitor_label()}>
			{#if commits.length}
				<ol>
					{#each commits as commit (commit.hash)}
						<li><span class="text-butter">{commit.hash}</span> {commit.message}</li>
					{/each}
				</ol>
			{:else}
				<p>{m.home_nightshift_monitor_empty()}</p>
			{/if}
		</div>
	</div>
</section>

<style>
	.night-shift {
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
		gap: 1.5rem;
		max-width: 40rem;
	}

	.monitor {
		padding: 1rem 1.25rem;
		border-radius: 0.5rem;
		background: color-mix(in oklab, var(--color-ink) 85%, transparent);
		line-height: 1.7;
	}
</style>
