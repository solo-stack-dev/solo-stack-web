<!--
	@component
	06:00 Sunrise footer. PLACEHOLDER from Phase 0, owned by the sunrise agent (docs/HANDOFF-HOMEPAGE.md §5.7).
	The base sky is butter paper here (`--night` → 1), so text switches to anthracite.
	TODO(sunrise agent): legal links (Impressum, Datenschutz, Kontakt) once the pages exist; labels via messages.
-->
<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { linkedSocials } from '#lib/home/data/socials.ts';
	import MockupRef from '#lib/home/shared/MockupRef.svelte';
	import NightClock from '#lib/home/shared/NightClock.svelte';
	import SectionEdge from '#lib/home/shared/SectionEdge.svelte';
	// TEMPORARY: round-2 mockup as in-place visual target (06-video-sunrise/05-sunrise-footer-desktop.png). Remove with the real art.
	import mockup from './assets/sunrise-mockup-ref.webp';

	const socials = linkedSocials();
</script>

<footer id="sunrise" data-night-hour="06:00" class="sunrise" aria-labelledby="home-sunrise-title">
	<SectionEdge position="top" fill="color-mix(in oklab, var(--color-butter) 55%, transparent)" height="8rem" seed={6} />
	<MockupRef src={mockup} />
	<NightClock time="06:00" />
	<div class="content">
		<p id="home-sunrise-title" class="font-display text-3xl font-black tracking-wordmark md:text-5xl">{m.home_sunrise_title()}</p>
		<nav aria-label={m.home_sunrise_footer_label()}>
			<ul class="links font-mono text-xs">
				{#each socials as social (social.id)}
					<li><a href={social.url} rel="me noopener" target="_blank">{social.name}</a></li>
				{/each}
			</ul>
		</nav>
		<p class="wordmark font-display text-2xl font-black tracking-wordmark uppercase">SOLO STACK</p>
	</div>
</footer>

<style>
	.sunrise {
		position: relative;
		min-height: 100svh;
		display: grid;
		align-items: end;
		padding: 9rem clamp(1.25rem, 6vw, 6rem) 3rem;
		color: var(--color-night);
		--night-clock-color: color-mix(in oklab, var(--color-night) 80%, transparent);
	}

	.content {
		position: relative;
		z-index: 1;
		display: grid;
		gap: 2rem;
	}

	.links {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem 1.25rem;
	}

	.links a:hover {
		text-decoration: underline;
	}
</style>
