<!--
	@component
	02:00 Night radio (docs/HANDOFF-HOMEPAGE.md §5.5): painted radio with one preset key per platform (real logos), a
	dial that snaps to stations, a display strip (handle + follow link, live content), a song per station (`track/`),
	and the printed frequency chart with every link (accessible, no-JS fallback).

	- Audio never autoplays. Tuning (key, dial release, keyboard step) is the gesture that calls `audio.unlock()` and
	  starts the song. `sound.ts` is a lazy chunk, prefetched near the viewport. One `<audio preload="none">` plays the
	  tuned station, so a song downloads only when tuned. Stations without a song are silent.
	- Leaving the viewport pauses; it never resumes on return (that would be autoplay). Leaving or changing the
	  station stops the song; the strip's play button pauses/resumes.
	- `--radio-pulse` (0…1, smoothed RMS) on the root drives the local stars. Never written when idle, paused or
	  under reduced motion.
	- Reduced motion: needle and knob jump, no pulse, static waveform frame, chart always visible.
	- Waveform RafLoop and local StarField run only while on screen and the tab is visible.
-->
<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { audio } from '#lib/home/shared/audio.svelte.ts';
	import { inView, reducedMotion } from '#lib/home/shared/motion.svelte.ts';
	import NightClock from '#lib/home/shared/NightClock.svelte';
	import StarField from '#lib/home/shared/StarField.svelte';
	import BrandIconSprite from './BrandIconSprite.svelte';
	import FrequencyChart from './FrequencyChart.svelte';
	import RadioSet from './RadioSet.svelte';
	import Waveform from './Waveform.svelte';
	import { LANDSCAPE, RADIO_LAYOUT, WAVEFORM_BAND } from './layout.ts';
	import { DIAL_IDLE, STATIONS, dialValue, nearestStation, stationAt, type Station } from './stations.ts';
	import type { PlayerGraph } from './sound.ts';

	let section: HTMLElement;
	let player = $state<HTMLAudioElement>();

	let dial = $state(DIAL_IDLE);
	let dragging = $state(false);
	/** Station whose key is down (committed by a key, a keyboard step, or releasing the dial). */
	let selected = $state.raw<Station | null>(null);
	const tuned = $derived(stationAt(dial));

	let playing = $state(false);
	let volume = $state(0.8);
	let graph = $state.raw<PlayerGraph | null>(null);
	const reduced = $derived(reducedMotion.current);

	// Lazy Web Audio module (static burst, player graph)
	let soundModule: Promise<typeof import('./sound.ts')> | null = null;
	const loadSound = () => (soundModule ??= import('./sound.ts'));

	/** Short static burst. `audio.unlock()` runs synchronously inside the gesture handler that calls this. */
	function crackle() {
		const context = audio.unlock();
		void loadSound().then(({ playStatic }) => {
			if (audio.output) playStatic(context, audio.output);
		});
	}

	/** Commit a station (inside a user gesture): its song starts, any other song stops. */
	function select(station: Station) {
		const changed = station.id !== selected?.id;
		selected = station;
		if (!player) return;
		if (changed) {
			player.pause();
			if (station.track) player.src = station.track.src;
			else {
				player.removeAttribute('src');
				player.load();
			}
		}
		if (station.track && (changed || player.paused)) void start();
	}

	/** Start the loaded song. `audio.unlock()` runs synchronously in the gesture that called this. */
	async function start() {
		if (!player?.getAttribute('src')) return;
		const context = audio.unlock();
		const { connectPlayer } = await loadSound();
		if (!audio.output) return;
		graph = connectPlayer(player, context, audio.output, volume);
		try {
			await player.play();
		} catch {
			playing = false;
		}
	}

	function onpreset(station: Station) {
		if (selected?.id !== station.id) crackle();
		dial = dialValue(station);
		select(station);
	}

	let lastLive: Station | null = null;
	function ondialinput(value: number) {
		dragging = true;
		dial = value;
		const live = stationAt(value);
		if (live && live.id !== lastLive?.id) crackle();
		// Off the committed station: its song stops like a real radio losing the signal
		if (live?.id !== selected?.id && playing) player?.pause();
		lastLive = live;
	}

	function ondialcommit() {
		dragging = false;
		const station = nearestStation(dial);
		if (station.id !== tuned?.id) crackle();
		dial = dialValue(station);
		lastLive = station;
		select(station);
	}

	/** Keyboard: arrows/Page keys step station by station, Home/End jump to the ends. */
	function ondialkey(event: KeyboardEvent) {
		const current = STATIONS.findIndex((station) => station.id === selected?.id);
		let next: number | null = null;
		if (event.key === 'ArrowRight' || event.key === 'ArrowUp' || event.key === 'PageUp') next = Math.min(STATIONS.length - 1, current + 1);
		else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown' || event.key === 'PageDown') next = Math.max(0, current < 0 ? 0 : current - 1);
		else if (event.key === 'Home') next = 0;
		else if (event.key === 'End') next = STATIONS.length - 1;
		if (next === null) return;
		event.preventDefault();
		onpreset(STATIONS[next]);
	}

	function togglePlay() {
		if (playing) player?.pause();
		else void start();
	}

	function setVolume(value: number) {
		volume = value;
		graph?.setVolume(value);
	}

	function setPulse(level: number) {
		section?.style.setProperty('--radio-pulse', level.toFixed(3));
	}

	const wide = RADIO_LAYOUT.wide;
	const tall = RADIO_LAYOUT.tall;
</script>

<section
	bind:this={section}
	id="radio"
	data-night-hour="02:00"
	data-feather
	class="radio"
	aria-labelledby="home-radio-title"
	style:--horizon-wide={LANDSCAPE.wide.horizonY}
	style:--horizon-tall={LANDSCAPE.tall.horizonY}
	style:--crop-wide={LANDSCAPE.wide.cropTop}
	style:--crop-tall={LANDSCAPE.tall.cropTop}
	style:--horizon-at-wide={wide.horizonAt}
	style:--horizon-at-tall={tall.horizonAt}
	style:--aspect-wide={wide.size.h / wide.size.w}
	style:--aspect-tall={tall.size.h / tall.size.w}
	style:--band-wide={WAVEFORM_BAND.wide}
	style:--band-tall={WAVEFORM_BAND.tall}
	{@attach inView((visible) => {
		if (!visible && playing) player?.pause();
	})}
	{@attach inView((near) => near && void loadSound(), { rootMargin: '50% 0px', once: true })}
>
	<BrandIconSprite stations={STATIONS} />
	<NightClock time="02:00" />

	<div class="head">
		<h2 id="home-radio-title" class="night-heading">{m.home_radio_title()}</h2>
	</div>

	<div class="scene">
		<!-- Plate horizon crosses the radio at layout.horizonAt -->
		<div class="stage" aria-hidden="true">
			<enhanced:img
				src="./assets/radio-landscape.webp?w=1920;1440;960"
				alt=""
				class="plate plate-wide"
				sizes="(min-width: 40rem) max(110vw, calc((100vh + 4rem) * 1.78)), 1px"
				loading="lazy"
			/>
			<enhanced:img
				src="./assets/radio-landscape-mobile.webp?w=1080;720"
				alt=""
				class="plate plate-tall"
				sizes="(min-width: 40rem) 1px, max(118vw, calc(100vh / 2.17))"
				loading="lazy"
			/>
			<div class="sky-stars">
				<StarField density={0.8} brightness={0.9} seed={202} />
			</div>
			<div class="horizon">
				<Waveform analyser={graph?.analyser ?? null} {playing} {reduced} onlevel={setPulse} />
			</div>
		</div>

		<div class="radio-wrap">
			<div class="variant variant-wide">
				<RadioSet
					variant="wide"
					stations={STATIONS}
					{dial}
					{tuned}
					{selected}
					{dragging}
					{reduced}
					{volume}
					{playing}
					{onpreset}
					{ondialinput}
					{ondialcommit}
					{ondialkey}
					strip={stripContent}
					song={songControls}
				/>
			</div>
			<div class="variant variant-tall">
				<RadioSet
					variant="tall"
					stations={STATIONS}
					{dial}
					{tuned}
					{selected}
					{dragging}
					{reduced}
					{volume}
					{playing}
					{onpreset}
					{ondialinput}
					{ondialcommit}
					{ondialkey}
					strip={stripContent}
					song={songControls}
				/>
			</div>
		</div>

		<FrequencyChart stations={STATIONS} active={selected?.id ?? null} class="chart" />
	</div>

	<p class="sr-only" role="status">{selected ? m.home_radio_tuned_status({ name: selected.name }) : ''}</p>

	<!-- `select()` sets src, so nothing downloads before a station with a song is tuned -->
	<audio
		bind:this={player}
		preload="none"
		loop
		crossorigin="anonymous"
		onplay={() => (playing = true)}
		onpause={() => (playing = false)}
		onended={() => (playing = false)}
	></audio>
</section>

{#snippet stripContent(variant: 'wide' | 'tall')}
	<!-- Wide radio: one row in the long window. Tall radio: two short rows. -->
	<div class={['strip-body', `strip-${variant}`]}>
		{@render stripRows()}
	</div>
{/snippet}

{#snippet stripRows()}
	{@const station = tuned ?? selected}
	{#if !station}
		<div class="strip-row">
			<span class="strip-dash font-mono" aria-hidden="true">— — —</span>
		</div>
		<div class="strip-row strip-sub">
			<span class="strip-hint font-mono">{m.home_radio_strip_idle()}</span>
		</div>
	{:else}
		<div class="strip-row">
			<span class="strip-handle font-mono">{station.handle ?? station.name}</span>
			<span class="strip-freq font-mono" aria-hidden="true">{station.frequency}</span>
		</div>
		<div class="strip-row strip-sub">
			<a class="strip-button strip-follow" href={station.url} rel="me noopener" target="_blank">
				<span class="strip-button-text">{m.home_radio_follow_label({ platform: station.name })}</span>
				<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 6h10v10M18 6 6 18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" /></svg>
				<span class="sr-only">{m.home_radio_opens_new_tab()}</span>
			</a>
		</div>
	{/if}
{/snippet}

{#snippet songControls(station: Station)}
	<!-- Play/pause and volume on the glass, only for the committed station -->
	{#if station.id === selected?.id}
		<button type="button" class="song-button" onclick={togglePlay} aria-label={playing ? m.home_radio_pause() : m.home_radio_play()}>
			{#if playing}
				<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" fill="currentColor" /></svg>
			{:else}
				<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor" /></svg>
			{/if}
		</button>
		<label class="song-volume">
			<span class="sr-only">{m.home_radio_volume()}</span>
			<input type="range" min="0" max="1" step="0.05" value={volume} oninput={(event) => setVolume(event.currentTarget.valueAsNumber)} />
		</label>
	{/if}
{/snippet}

<style>
	/*
	 * The stage is placed relative to the scene's first row (the radio), so the painted horizon crosses the radio at
	 * `horizonAt` (layout.ts) on any viewport. The section clips the overflow.
	 *   --stage-w     landscape width (covers the section with slack); height = --stage-w × plate aspect
	 *   --crop        top fraction of the master cut from the plate files (moon sky); the stage keeps the master's box,
	 *                 the plate fills it from there down and fades in at its top
	 *   --radio-pulse 0…1, written by Waveform via setPulse
	 */
	.radio {
		--radio-pulse: 0;
		--plate-aspect: calc(1440 / 2560);
		--horizon: var(--horizon-wide);
		--crop: var(--crop-wide);
		--horizon-at: var(--horizon-at-wide);
		--radio-aspect: var(--aspect-wide);
		--band: var(--band-wide);
		--radio-w: min(56rem, 60cqw, calc((100svh - 22rem) / var(--aspect-wide)));
		--stage-w: max(110cqw, calc((100svh + 4rem) / var(--plate-aspect)));
		position: relative;
		isolation: isolate;
		container-type: inline-size;
		overflow: clip;
		min-height: 100svh;
		padding: var(--heading-top) var(--page-gutter) clamp(3rem, 8vh, 5rem);
		/* soft painted section edges so the clipped plate never ends in a straight line (NightPage [data-feather]) */
		--feather-top: clamp(4rem, 9vw, 8rem);
		--feather-bottom: clamp(4rem, 9vw, 8rem);
	}

	.head {
		position: relative;
		z-index: 1;
		max-width: 60rem;
	}

	.scene {
		position: relative;
		display: grid;
		justify-items: center;
		align-items: start;
		gap: 2.5rem;
		margin-top: clamp(1rem, 4vh, 2.5rem);
	}

	.radio-wrap {
		position: relative;
		width: var(--radio-w);
	}

	.stage {
		position: absolute;
		z-index: -1;
		left: 50%;
		width: var(--stage-w);
		aspect-ratio: 1 / var(--plate-aspect);
		top: calc(var(--horizon-at) * var(--radio-w) * var(--radio-aspect) - var(--horizon) * var(--stage-w) * var(--plate-aspect));
		translate: -50% 0;
		pointer-events: none;
		mask-image: linear-gradient(to bottom, transparent 0, #000 16%, #000 84%, transparent 100%);
	}

	.stage :global(.plate) {
		position: absolute;
		top: calc(var(--crop) * 100%);
		left: 0;
		width: 100%;
		height: calc((1 - var(--crop)) * 100%);
		object-fit: cover;
		mask-image: linear-gradient(to bottom, transparent 0, #000 22%);
	}

	.stage :global(.plate-tall) {
		display: none;
	}

	/* Local stars over the painted sky; they pulse with the music */
	.sky-stars {
		position: absolute;
		inset: 0 0 calc((1 - var(--horizon)) * 100% + 2%);
		opacity: calc(0.45 + var(--radio-pulse) * 0.55);
		filter: brightness(calc(1 + var(--radio-pulse) * 0.8));
	}

	.horizon {
		position: absolute;
		left: 0;
		right: 0;
		top: calc((var(--horizon) - var(--band) / 2) * 100%);
		height: calc(var(--band) * 100%);
	}

	.variant-tall {
		display: none;
	}

	/* Station strip contents: one row in the wide radio's long window, two rows in the tall radio's */
	.strip-body {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.9rem;
		min-width: 0;
	}

	/* The handle (or station name) keeps its width up to 55 %; the button or line takes the rest and truncates */
	.strip-wide > :first-child {
		flex: 0 0 auto;
		max-width: 55%;
	}

	.strip-wide > .strip-sub {
		flex: 1 1 auto;
	}

	.strip-tall {
		flex-direction: column;
		align-items: stretch;
		gap: 0.25rem;
	}

	.strip-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.6rem;
		min-width: 0;
	}

	.strip-sub {
		justify-content: flex-end;
		font-size: 0.78rem;
		color: color-mix(in oklab, var(--color-cream) 75%, transparent);
	}

	.strip-tall .strip-sub {
		justify-content: flex-start;
		font-size: 0.7rem;
	}

	.strip-tall .strip-handle {
		font-size: 0.85rem;
	}

	.strip-tall .strip-button {
		padding: 0.25rem 0.55rem;
		font-size: 0.68rem;
	}

	.strip-dash {
		color: var(--color-butter);
		opacity: 0.6;
	}

	.strip-hint {
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-size: 0.72rem;
		opacity: 0.7;
	}

	.strip-handle {
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-size: 1.05rem;
		font-weight: 700;
		color: var(--color-butter);
		text-shadow: var(--glow-sm);
	}

	.strip-freq {
		flex: none;
		font-size: 0.7rem;
		color: var(--color-butter);
		opacity: 0.7;
	}

	.strip-button-text {
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.strip-button {
		flex: 0 1 auto;
		min-width: 0;
		white-space: nowrap;
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.4rem 0.75rem;
		border: 0;
		border-radius: 999px;
		background: var(--color-butter);
		color: var(--color-night);
		font-weight: 800;
		font-size: 0.8rem;
		line-height: 1;
		text-decoration: none;
		box-shadow:
			0 0 0 1.5px var(--color-ink),
			var(--glow-sm);
		cursor: pointer;
	}

	.strip-button:hover {
		background: var(--color-cream);
	}

	.strip-button svg {
		width: 0.95rem;
		height: 0.95rem;
	}

	/* Song controls on the glass (snippet rendered by RadioSet) */
	.song-button {
		display: inline-grid;
		flex: none;
		place-items: center;
		width: 1.7em;
		height: 1.7em;
		padding: 0;
		border: 0;
		border-radius: 999px;
		background: var(--color-butter);
		color: var(--color-night);
		box-shadow:
			0 0 0 1.5px var(--color-ink),
			var(--glow-sm);
		cursor: pointer;
	}

	.song-button:hover {
		background: var(--color-cream);
	}

	.song-button svg {
		width: 60%;
		height: 60%;
	}

	.song-volume {
		display: flex;
		flex: none;
	}

	.song-volume input {
		width: 5rem;
		accent-color: var(--color-butter);
	}

	/* Desktop: chart beside the radio */
	@media (min-width: 80rem) {
		.scene {
			grid-template-columns: auto minmax(16rem, 19rem);
			justify-content: center;
			column-gap: clamp(2rem, 4vw, 4rem);
		}
	}

	@media (min-width: 40rem) and (max-width: 79.99rem) {
		.radio {
			--radio-w: min(56rem, 88cqw, calc((100svh - 18rem) / var(--aspect-wide)));
		}

		.scene :global(.chart) {
			width: min(100%, 34rem);
		}

		.scene :global(.chart ul) {
			grid-template-columns: 1fr 1fr;
			column-gap: 1rem;
		}
	}

	/* Phones: tall radio, tall plate, chart below */
	@media (max-width: 39.99rem) {
		.radio {
			--plate-aspect: calc(2340 / 1080);
			--horizon: var(--horizon-tall);
			--crop: var(--crop-tall);
			--horizon-at: var(--horizon-at-tall);
			--radio-aspect: var(--aspect-tall);
			--band: var(--band-tall);
			--radio-w: min(calc(100cqw - 0.5rem), 25rem);
			--stage-w: max(118cqw, calc(100svh / var(--plate-aspect)));
		}

		.head {
			min-height: 9.5rem;
		}

		.variant-wide {
			display: none;
		}

		.variant-tall {
			display: block;
		}

		.stage :global(.plate-wide) {
			display: none;
		}

		.stage :global(.plate-tall) {
			display: block;
		}

		.scene :global(.chart) {
			width: 100%;
			rotate: -0.6deg;
		}
	}
</style>
