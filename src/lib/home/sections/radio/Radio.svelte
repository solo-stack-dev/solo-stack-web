<!--
	@component
	02:00 Night radio. PLACEHOLDER from Phase 0, owned by the radio agent (docs/HANDOFF-HOMEPAGE.md §5.5).
	The plain social link list below is the required accessible fallback; the agent restyles it (e.g. as the radio's
	printed frequency chart) but must keep it. Audio: `audio.unlock()` from audio.svelte.ts inside the click handler.
-->
<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { linkedSocials } from '#lib/home/data/socials.ts';
	import MockupRef from '#lib/home/shared/MockupRef.svelte';
	import NightClock from '#lib/home/shared/NightClock.svelte';
	// TEMPORARY: round-2 mockup as in-place visual target (05-night-shift-radio/06-night-radio-desktop-idle.png). Remove with the real art.
	import mockup from './assets/radio-mockup-ref.webp';

	const socials = linkedSocials();
</script>

<section id="radio" data-night-hour="02:00" class="radio" aria-labelledby="home-radio-title">
	<MockupRef src={mockup} />
	<NightClock time="02:00" />
	<div class="content">
		<h2 id="home-radio-title" class="font-display text-3xl font-black tracking-wordmark md:text-5xl">{m.home_radio_title()}</h2>
		<ul class="socials font-mono text-sm" aria-label={m.home_radio_socials_label()}>
			{#each socials as social (social.id)}
				<li>
					<a href={social.url} rel="me noopener" target="_blank">
						<span>{social.name}</span>
						{#if social.handle}<span class="text-cream/60">{social.handle}</span>{/if}
					</a>
				</li>
			{/each}
		</ul>
	</div>
</section>

<style>
	.radio {
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
	}

	.socials {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem 1.5rem;
	}

	.socials a {
		display: inline-flex;
		gap: 0.5rem;
	}

	.socials a:hover {
		color: var(--color-butter);
	}
</style>
