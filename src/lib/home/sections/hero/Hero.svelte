<!--
	@component
	20:00 Hero: moonrise. PLACEHOLDER from Phase 0, owned by the hero agent (docs/HANDOFF-HOMEPAGE.md §5.1).
	Shows the LazyMount pattern for the Threlte moon: only after idle, only with WebGL and motion allowed.
-->
<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import LazyMount from '#lib/home/shared/LazyMount.svelte';
	import MockupRef from '#lib/home/shared/MockupRef.svelte';
	import NightClock from '#lib/home/shared/NightClock.svelte';
	import { reducedMotion } from '#lib/home/shared/motion.svelte.ts';
	// TEMPORARY: round-2 mockup as in-place visual target (02-hero/05-painted-moon-desktop.png). Remove with the real art.
	import mockup from './assets/hero-mockup-ref.webp';

	let webgl = $state(false);
	$effect(() => {
		webgl = !!document.createElement('canvas').getContext('webgl2');
	});
</script>

<section id="hero" data-night-hour="20:00" class="hero" aria-labelledby="home-hero-title">
	<MockupRef src={mockup} />
	<NightClock time="20:00" />

	<LazyMount load={() => import('./MoonScene.svelte')} when={webgl && !reducedMotion.current} idle class="moon-slot" />

	<div class="content">
		<h1 id="home-hero-title" class="font-display text-6xl font-black tracking-wordmark uppercase md:text-9xl">SOLO STACK</h1>
		<p class="mt-4 max-w-xl text-lg text-cream/80">{m.home_hero_tagline()}</p>
	</div>

	<a class="scroll-cue font-mono text-xs tracking-clock" href="#making">{m.home_hero_scroll_cue()}</a>
</section>

<style>
	.hero {
		position: relative;
		min-height: 100svh;
		display: grid;
		align-items: center;
		padding: 8rem clamp(1.25rem, 6vw, 6rem) 6rem;
		overflow: hidden;
	}

	/* Same position as the moon in the mockup; the painted moon fallback must use the identical box (no layout shift). */
	.hero :global(.moon-slot) {
		position: absolute;
		top: 4%;
		right: -6%;
		width: min(62vw, 58rem);
		aspect-ratio: 1;
	}

	.content {
		position: relative;
		z-index: 1;
	}

	.scroll-cue {
		position: absolute;
		bottom: 2rem;
		left: 50%;
		translate: -50% 0;
		color: color-mix(in oklab, var(--color-cream) 70%, transparent);
	}
</style>
