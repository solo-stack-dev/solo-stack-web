<!--
	@component
	04:00 Open air cinema. PLACEHOLDER from Phase 0, owned by the cinema agent (docs/HANDOFF-HOMEPAGE.md §5.6).
	Demonstrates the prerendered latest video (`null` = feed empty or unreachable → link to the channel).
	No YouTube request before the click: the thumbnail is fine, the iframe (youtube-nocookie.com) only on click.
-->
<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { YOUTUBE_CHANNEL_URL } from '#lib/home/data/socials.ts';
	import { getLatestVideo } from '#lib/home/data/youtube.remote.ts';
	import MockupRef from '#lib/home/shared/MockupRef.svelte';
	import NightClock from '#lib/home/shared/NightClock.svelte';
	// TEMPORARY: round-2 mockup as in-place visual target (06-video-sunrise/01-video-cinema-desktop-facade.png). Remove with the real art.
	import mockup from './assets/cinema-mockup-ref.webp';

	const video = $derived(await getLatestVideo());
</script>

<section id="cinema" data-night-hour="04:00" class="cinema" aria-labelledby="home-cinema-title">
	<MockupRef src={mockup} />
	<NightClock time="04:00" />
	<div class="content">
		<h2 id="home-cinema-title" class="font-display text-3xl font-black tracking-wordmark md:text-5xl">{m.home_cinema_title()}</h2>
		{#if video}
			<p class="text-lg">{video.title}</p>
			<a class="font-mono text-xs tracking-clock text-butter" href={video.url}>{m.home_cinema_watch_link()}</a>
		{:else}
			<a class="font-mono text-xs tracking-clock text-butter" href={YOUTUBE_CHANNEL_URL}>{m.home_cinema_channel_link()}</a>
		{/if}
	</div>
</section>

<style>
	.cinema {
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
		gap: 1rem;
		justify-items: start;
	}
</style>
