<!--
	@component
	21:00 What I make. PLACEHOLDER from Phase 0, owned by the making agent (docs/HANDOFF-HOMEPAGE.md §5.2).
	Pinned pattern: a tall wrapper (~5.5 viewports) with a `position: sticky` stage. Scroll progress for the morph:
	`new ScrollProgress({ mode: 'pinned' })` from motion.svelte.ts on the wrapper. No scroll hijacking.
-->
<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import MockupRef from '#lib/home/shared/MockupRef.svelte';
	import NightClock from '#lib/home/shared/NightClock.svelte';
	// TEMPORARY: round-2 mockup as in-place visual target (03-what-i-make/01-ink-morph-desktop-context.png). Remove with the real art.
	import mockup from './assets/making-mockup-ref.webp';
</script>

<section id="making" data-night-hour="21:00" class="making" aria-labelledby="home-making-title">
	<div class="stage">
		<MockupRef src={mockup} />
		<NightClock time="21:00" />
		<h2 id="home-making-title" class="title font-display text-3xl font-black tracking-wordmark md:text-5xl">{m.home_making_title()}</h2>
	</div>
</section>

<style>
	.making {
		position: relative;
		height: 550svh;
	}

	.stage {
		position: sticky;
		top: 0;
		height: 100svh;
		overflow: hidden;
	}

	.title {
		position: absolute;
		left: 50%;
		bottom: 18%;
		translate: -50% 0;
		text-align: center;
		width: min(90%, 40rem);
	}

	@media (prefers-reduced-motion: reduce) {
		/* Spec: no pinning under reduced motion; the agent renders a static vertical sequence instead. */
		.making {
			height: auto;
		}

		.stage {
			position: relative;
		}
	}
</style>
