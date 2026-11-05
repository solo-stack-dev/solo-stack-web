<!--
	@component
	01:00 Night shift (docs/HANDOFF-HOMEPAGE.md §5.4): one fixed, cover-cropped view of the studio (Scene). The monitor
	types the latest commits as `git log --oneline`; six objects are hotspots (bonsai = golden tree egg). Geometry: layout.ts.

	Motion (typing, hand frames, steam, lamp flicker, dust, pointer parallax) pauses off screen and in hidden tabs.
	Reduced motion: static scene, first page of commits fully typed, hotspots still work.
-->
<script lang="ts">
	import { MediaQuery } from 'svelte/reactivity';
	import { m } from '#lib/paraglide/messages.js';
	import { getRecentCommits } from '#lib/home/data/github.remote.ts';
	import NightClock from '#lib/home/shared/NightClock.svelte';
	import { InView, RafLoop, pageVisibility, reducedMotion } from '#lib/home/shared/motion.svelte.ts';
	import Scene from './Scene.svelte';
	import { COMMITS_PER_PAGE, desktop, mobile, type SpotId } from './layout.ts';
	import { Terminal } from './terminal.svelte.ts';

	const commits = $derived(await getRecentCommits());
	const terminal = $derived(new Terminal(commits, m.home_nightshift_monitor_empty(), COMMITS_PER_PAGE));
	const reduced = $derived(reducedMotion.current);

	const labels: Record<SpotId, string> = $derived({
		window: m.home_nightshift_spot_window(),
		coffee: m.home_nightshift_spot_coffee(),
		handheld: m.home_nightshift_spot_handheld(),
		manga: m.home_nightshift_spot_manga(),
		bonsai: m.home_nightshift_spot_bonsai(),
		dumbbells: m.home_nightshift_spot_dumbbells()
	});

	// ── Typing loop (only on screen, tab visible, motion allowed) ──────────────────────────────────────────
	const typing = new RafLoop((dt) => terminal.tick(dt), { paused: true });
	let typingStarted = false;
	$effect(() => {
		if (reduced) {
			typing.paused = true;
			terminal.finish();
			typingStarted = false;
			return;
		}
		if (!typingStarted) {
			terminal.reset();
			typingStarted = true;
		}
		typing.paused = false;
	});

	// ── Pointer parallax: eased --px/--py in -1…1; idle once settled ───────────────────────────────────────
	let root: HTMLElement | undefined = $state();
	const target = { x: 0, y: 0 };
	const current = { x: 0, y: 0 };
	const parallax = new RafLoop(
		(dt) => {
			const k = 1 - Math.exp(-dt * 5);
			current.x += (target.x - current.x) * k;
			current.y += (target.y - current.y) * k;
			root?.style.setProperty('--px', current.x.toFixed(4));
			root?.style.setProperty('--py', current.y.toFixed(4));
			if (Math.abs(target.x - current.x) < 0.001 && Math.abs(target.y - current.y) < 0.001) parallax.paused = true;
		},
		{ paused: true }
	);

	function onpointermove(event: PointerEvent) {
		if (event.pointerType !== 'mouse' || reduced || !root) return;
		const rect = root.getBoundingClientRect();
		target.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
		target.y = ((event.clientY - rect.top) / rect.height) * 2 - 1;
		parallax.paused = false;
	}

	function onpointerleave() {
		target.x = 0;
		target.y = 0;
		if (!reduced) parallax.paused = false;
	}

	$effect(() => {
		if (!reduced || !root) return;
		parallax.paused = true;
		current.x = current.y = target.x = target.y = 0;
		root.style.removeProperty('--px');
		root.style.removeProperty('--py');
	});

	// ── `live` pauses CSS loops off screen ──────────────────
	const seen = new InView({ rootMargin: '10% 0px' });
	const live = $derived(seen.current && pageVisibility.current);

	const coarse = new MediaQuery('(pointer: coarse)', false);
	let explored = $state(false);
	const onexplore = () => (explored = true);
</script>

<section
	id="night-shift"
	data-night-hour="01:00"
	class="night-shift"
	aria-labelledby="home-nightshift-title"
	data-live={live ? '' : undefined}
	bind:this={root}
	{onpointermove}
	{onpointerleave}
	{@attach typing.attach}
	{@attach parallax.attach}
	{@attach seen.attach}
>
	<NightClock time="01:00" />
	<h2 id="home-nightshift-title" class="title night-heading">{m.home_nightshift_title()}</h2>

	<div class="sr-only" role="region" aria-label={m.home_nightshift_monitor_label()}>
		{#if commits.length}
			<ol>
				{#each commits as commit (commit.hash + commit.repo)}
					<li>{commit.hash} {commit.message}</li>
				{/each}
			</ol>
		{:else}
			<p>{m.home_nightshift_monitor_empty()}</p>
		{/if}
	</div>

	<Scene
		variant="desktop"
		layout={desktop}
		{terminal}
		{reduced}
		markers={coarse.current}
		{labels}
		sceneAlt={m.home_nightshift_scene_alt()}
		spotsLabel={m.home_nightshift_spots_label()}
		{onexplore}
	/>
	<Scene
		variant="mobile"
		layout={mobile}
		{terminal}
		{reduced}
		markers
		{labels}
		sceneAlt={m.home_nightshift_scene_alt()}
		spotsLabel={m.home_nightshift_spots_label()}
		{onexplore}
	/>

	<p class={['tap-hint label-sm', explored && 'explored']} aria-hidden="true">{m.home_nightshift_tap_hint()}</p>
</section>

<style>
	/* Art's aspect ratio, capped at one screen; only wider screens crop (cover). */
	.night-shift {
		position: relative;
		width: 100%;
		aspect-ratio: 2560 / 1440;
		max-height: 100svh;
		min-height: 30rem;
		overflow: hidden;
	}

	.title {
		position: absolute;
		z-index: 6;
		top: var(--heading-top);
		left: var(--page-gutter);
		max-width: min(44rem, 70vw);
		pointer-events: none;
	}

	.night-shift :global(.night-clock) {
		z-index: 6;
	}

	/* Art direction: portrait art below 4:5, the 16:9 painting otherwise. */
	.night-shift :global(.scene[data-variant='mobile']) {
		display: none;
	}

	@media (max-aspect-ratio: 4/5) {
		.night-shift {
			aspect-ratio: 1080 / 2340;
		}

		.night-shift :global(.scene[data-variant='desktop']) {
			display: none;
		}

		.night-shift :global(.scene[data-variant='mobile']) {
			display: block;
		}

		.title {
			max-width: 70vw;
		}
	}

	.tap-hint {
		display: none;
		position: absolute;
		z-index: 6;
		left: 50%;
		bottom: var(--bottom-gutter);
		margin: 0;
		translate: -50% 0;
		color: var(--color-cream);
		text-shadow: var(--halo-ink);
		max-width: 80vw;
		width: max-content;
		line-height: 1.5;
		text-align: center;
		pointer-events: none;
		transition: opacity var(--dur-reveal) ease;
	}

	.tap-hint.explored {
		opacity: 0;
	}

	@media (pointer: coarse), (max-aspect-ratio: 4/5) {
		.tap-hint {
			display: block;
		}
	}

	/* CSS loops (steam, flicker, dust, cursor, rings) stop off screen or in hidden tabs. */
	.night-shift:not([data-live]) :global(*) {
		animation-play-state: paused !important;
	}
</style>
