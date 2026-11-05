<!--
	@component
	04:00 Open air cinema (docs/HANDOFF-HOMEPAGE.md §5.6): the mascot's laptop on the cliff projects the latest video into a painted frame.

	- Facade: self-hosted thumbnail (./thumbnail.ts) + moon play button; no request to YouTube before the click.
	- Click: youtube-nocookie.com iframe with autoplay (the click is the user gesture); the beam brightens.
	- No video (empty feed or offline build): the painted projection fills the screen (docs/art/site/round-2/cinema-projection.png);
	  the message and the channel link sit centered on a soft ink scrim over its calm sky.
	- The frame's outer bloom is halved in every state and the aperture has a thin bright inner edge: the screen, not the fire, leads.
	- Heading: left of the screen, level with its top, above the mascot (desktop); above the frame (mobile).
	- The 06:00 dawn cloud bank (shared/DawnBank.svelte) rolls over the landscape's bottom: the cliff dissolves into it; cliff,
	  mascot, beam, frame, screen and heading paint in front of it (z-index 3), the plate behind.
	- Dust motes (CSS) pause off screen; reduced motion: no motes, no beam animation.
	- Rects: ./layout.ts. Dev only: `?cinema=demo` (public demo video), `?cinema=empty`.
-->
<script lang="ts">
	import { dev } from '$app/env';
	import { m } from '#lib/paraglide/messages.js';
	import { YOUTUBE_CHANNEL_URL } from '#lib/home/data/socials.ts';
	import type { LatestVideo } from '#lib/home/data/youtube.ts';
	import { getLatestVideo } from '#lib/home/data/youtube.remote.ts';
	import { InView } from '#lib/home/shared/motion.svelte.ts';
	import { NIGHT_HOURS } from '#lib/home/night.ts';
	import NightClock from '#lib/home/shared/NightClock.svelte';
	import PaperGrain from '#lib/home/shared/PaperGrain.svelte';
	import StarField from '#lib/home/shared/StarField.svelte';
	import { dawnVars } from '#lib/home/shared/dawn.ts';
	import { CINEMA_LAYOUT, beamMask, placeVars } from './layout.ts';
	import VideoThumbnail from './VideoThumbnail.svelte';

	const latest = $derived(await getLatestVideo());

	// Dev-only `?cinema=` preview (the feed may be empty in dev); tree-shaken from production.
	let preview = $state<string | null>(null);
	$effect(() => {
		if (dev) preview = new URLSearchParams(window.location.search).get('cinema');
	});
	const DEV_DEMO: LatestVideo = {
		id: 'jNQXAC9IVRw',
		title: 'Me at the zoo',
		url: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
		publishedAt: '2005-04-24T03:31:52+00:00',
		thumbnail: 'https://i.ytimg.com/vi/jNQXAC9IVRw/hqdefault.jpg'
	};
	const video = $derived(dev && preview === 'demo' ? DEV_DEMO : dev && preview === 'empty' ? null : latest);

	let playing = $state(false);
	let thumbnailFailed = $state(false);
	const near = new InView({ rootMargin: '10% 0px' });

	const { desktop: d, mobile: mo } = CINEMA_LAYOUT;
	const place = {
		window: placeVars(d.window, mo.window),
		frame: placeVars(d.frame, mo.frame),
		caption: placeVars(d.caption, mo.caption),
		cliff: placeVars(d.cliff, mo.cliff),
		mascot: placeVars(d.mascot, mo.mascot)
	};
	const beamStyle = [
		`--d-mask: ${beamMask('desktop')}`,
		`--m-mask: ${beamMask('mobile')}`,
		`--d-apex: ${d.beam.apex.x}% ${d.beam.apex.y}%`,
		`--m-apex: ${mo.beam.apex.x}% ${mo.beam.apex.y}%`
	].join('; ');
	const beamArtStyle = [
		`--dw: ${d.beamTexture.w}%`,
		`--dh: ${d.beamTexture.h}%`,
		`--d-transform: ${d.beamTexture.transform}`,
		`--mw: ${mo.beamTexture.w}%`,
		`--mh: ${mo.beamTexture.h}%`,
		`--m-transform: ${mo.beamTexture.transform}`
	].join('; ');
	const dust = d.dust.map((mote, index) => {
		const mobile = mo.dust[index];
		return `${placeVars(mote, mobile)}; --size: ${mote.size}px; --delay: ${mote.delay}s; --duration: ${mote.duration}s; --drift-x: ${mote.drift.x}px; --drift-y: ${mote.drift.y}px`;
	});

	// Seam geometry (cloud bank) and the stage anchors of the heading.
	const sectionStyle = `${dawnVars()}; --window-top: ${d.window.y / 100}; --frame-left: ${d.frame.x / 100}; --frame-top-m: ${mo.frame.y / 100}`;

	// 04:00 sky color for .backdrop (see the note there).
	const SKY = NIGHT_HOURS.find((hour) => hour.id === 'cinema')!.sky;

	const embedUrl = (id: string) => `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1`;

	function play() {
		playing = true;
	}
</script>

<section
	id="cinema"
	data-night-hour="04:00"
	class={['cinema', playing && 'is-playing', near.current && 'is-near', !video && 'is-empty']}
	aria-labelledby="home-cinema-title"
	style={sectionStyle}
	style:--cinema-sky={SKY}
>
	<div class="backdrop" aria-hidden="true">
		<StarField density={0.45} brightness={0.85} seed={404} />
	</div>
	<NightClock time="04:00" />
	<h2 id="home-cinema-title" class="heading night-heading">{m.home_cinema_title()}</h2>

	<div class="stage" {@attach near.attach}>
		<enhanced:img src="./assets/cinema-landscape.webp?w=1920;1536;1080" alt="" class="layer landscape is-desktop" sizes="100vw" loading="lazy" decoding="async" />
		<enhanced:img src="./assets/cinema-landscape-mobile.webp?w=1080;828;640" alt="" class="layer landscape is-mobile" sizes="100vw" loading="lazy" decoding="async" />
		<!-- Extra grain: the plate's repainted sky is smoother than its original pigment. -->
		<div class="sky-grain" aria-hidden="true"><PaperGrain fixed={false} opacity={0.08} /></div>
		<enhanced:img
			src="./assets/cinema-cliff.webp?w=1582;1200;1100;960;760"
			alt=""
			class="placed cliff"
			style={place.cliff}
			sizes="(min-width: 48rem) 41vw, 81vw"
			loading="lazy"
			decoding="async"
		/>
		<!-- Shiny egg: its golden filter fallback and sparkle target this wrapper (no golden sitting art). -->
		<div class="placed mascot" style={place.mascot}>
			<enhanced:img src="./assets/mascot-cinema-sitting.webp?w=480;300" alt="" class="mascot-art" sizes="(min-width: 48rem) 10vw, 19vw" loading="lazy" decoding="async" />
		</div>

		<div class="beam" style={beamStyle} aria-hidden="true">
			<div class="beam-light"></div>
			<div class="beam-art" style={beamArtStyle}>
				<enhanced:img src="./assets/cinema-beam.webp?w=700;450" alt="" class="beam-texture" sizes="40vw" loading="lazy" decoding="async" />
			</div>
			{#each dust as style, index (index)}
				<span class="dust" {style}></span>
			{/each}
		</div>

		<div class="placed screen" style={place.window}>
			{#if video && playing}
				<iframe
					class="player"
					src={embedUrl(video.id)}
					title={video.title}
					allow="autoplay; encrypted-media; fullscreen; picture-in-picture; web-share"
					referrerpolicy="strict-origin-when-cross-origin"
					{@attach (element) => element.focus()}
				></iframe>
			{:else if video}
				<button type="button" class="facade" aria-label={m.home_cinema_play_label({ title: video.title })} onclick={play}>
					{#if !thumbnailFailed}
						<!-- The window is 1344/2560 of the stage on desktop, 907/1080 on mobile (./layout.ts) -->
						<VideoThumbnail id={video.id} class="thumbnail" sizes="(min-width: 48rem) 53vw, 84vw" loading="lazy" onerror={() => (thumbnailFailed = true)} />
					{/if}
					<span class="moon" aria-hidden="true"><span class="moon-play"></span></span>
				</button>
			{:else}
				<div class="empty">
					<enhanced:img
						src="./assets/cinema-projection.webp?w=1664;1280;960;640"
						alt=""
						class="projection"
						sizes="(min-width: 48rem) 53vw, 84vw"
						loading="lazy"
						decoding="async"
					/>
					<div class="empty-copy">
						<p class="empty-line">{m.home_cinema_empty()}</p>
						<a class="link label" href={YOUTUBE_CHANNEL_URL} target="_blank" rel="noopener">
							{m.home_cinema_channel_link()}<span class="arrow" aria-hidden="true"> →</span><span class="sr-only"> ({m.home_cinema_new_tab()})</span>
						</a>
					</div>
				</div>
			{/if}
		</div>
		<enhanced:img
			src="./assets/cinema-frame.webp?w=1925;1400;1000;700"
			alt=""
			class="placed frame"
			style={place.frame}
			sizes="(min-width: 48rem) 61vw, 97vw"
			loading="lazy"
			decoding="async"
		/>

		{#if video}
			<div class={['placed caption font-mono', d.caption.align === 'center' && 'd-center', mo.caption.align === 'center' && 'm-center']} style={place.caption}>
				<p class="title text-sm tracking-wide md:text-base">{video.title}</p>
				<a class="link label" href={video.url} target="_blank" rel="noopener">
					{m.home_cinema_watch_link()}<span class="arrow" aria-hidden="true"> →</span><span class="sr-only"> ({m.home_cinema_new_tab()})</span>
				</a>
			</div>
		{/if}
	</div>
</section>

<style>
	.cinema {
		position: relative;
		/* The 16:9 stage fits the width; taller viewports get extra sky above it (the landscape's sky is transparent). */
		min-height: max(100svh, 56.25vw);
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		overflow-x: clip;
		/* Pulled up under the radio's rock foreground: the cinema's painted sky meets the rocks, no dead band between them (the
		   seam's mist and cloud sit on the overlap). Only its own links and buttons take pointer events there. */
		margin-top: calc(var(--cinema-overlap) * -1);
		--cinema-overlap: clamp(3rem, 11vw, 11rem);
		pointer-events: none;
		container-type: inline-size;
		/* The 16:9 stage is bottom-anchored: clock and heading sit left of the screen, the clock level with the window's top */
		--stage-top: calc(100% - 100cqw * 1440 / 2560);
		--night-clock-top: calc(var(--stage-top) + 100cqw * 1440 / 2560 * var(--window-top));
		/* the cliff dissolves into the dawn cloud bank (shared/dawn.ts) */
		--cliff-cut: var(--dawn-cliff-cut);
		--cliff-fade: var(--dawn-cliff-fade);
	}

	.heading {
		position: absolute;
		z-index: 3;
		top: calc(var(--night-clock-top) + 1.5rem);
		left: var(--page-gutter);
		/* left of the frame's painted edge */
		width: calc(100cqw * var(--frame-left) - var(--page-gutter) - 2rem);
	}

	.cinema :is(a, button, iframe) {
		pointer-events: auto;
	}

	/*
	 * Own 04:00 backdrop (NIGHT_HOURS color + sparse local stars): here the global sky already blends toward butter (its 06:00
	 * stop is the page end) and its stars fade out, but 04:00 must stay dark until the sunrise's night edge passes.
	 */
	.backdrop {
		position: absolute;
		inset: 0;
		background: var(--cinema-sky);
		/* painted soft edge (shared/transitions.ts): the top ~20 % feathers seamlessly into the 02:00 sky under the mist bank */
		mask:
			var(--feather-up) top / 100% 20% no-repeat,
			linear-gradient(#000 0 0) bottom / 100% 80.5% no-repeat;
		pointer-events: none;
	}

	.stage {
		position: relative;
		width: 100%;
		aspect-ratio: 2560 / 1440;
	}

	.layer {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		user-select: none;
	}

	/* Elements placed on the stage by layout.ts (desktop vars, mobile vars below) */
	.placed {
		position: absolute;
		left: var(--dx);
		top: var(--dy);
		width: var(--dw);
		height: var(--dh);
	}

	.is-mobile {
		display: none;
	}

	/* Opaque plate: its top melts into the backdrop above the stage. */
	.landscape {
		mask:
			var(--feather-up) top / 100% 12% no-repeat,
			linear-gradient(#000 0 0) bottom / 100% 88.5% no-repeat;
	}

	.sky-grain {
		position: absolute;
		inset: 0 0 55%;
		pointer-events: none;
		mask-image: linear-gradient(#000 70%, transparent);
	}

	/* In front of the dawn cloud bank (z-index 2, shared/DawnBank.svelte); the landscape plate stays behind it. */
	.cliff,
	.mascot,
	.beam,
	.screen,
	.frame,
	.caption {
		z-index: 3;
	}

	.cliff,
	.frame {
		height: auto;
		pointer-events: none;
		user-select: none;
	}

	/* The cliff's foot dissolves into the cloud bank in a painted edge and is gone inside its opaque band (shared/dawn.ts). */
	.cliff {
		mask:
			linear-gradient(#000 0 0) top / 100% calc(100% - var(--cliff-cut) - var(--cliff-fade) + 1px) no-repeat,
			var(--feather-down) left 0 bottom var(--cliff-cut) / 100% var(--cliff-fade) repeat-x;
	}

	.mascot {
		pointer-events: none;
	}

	.mascot-art {
		display: block;
		width: 100%;
		height: 100%;
		user-select: none;
	}

	/* Light cone from the laptop to the frame: a soft CSS glow plus the painted beam, both added with screen. */
	.beam {
		position: absolute;
		inset: 0;
		pointer-events: none;
		mix-blend-mode: screen;
		opacity: 0.62;
		transition:
			opacity 900ms ease,
			filter 900ms ease;
	}

	.beam-light {
		position: absolute;
		inset: 0;
		mask-image: var(--d-mask);
		mask-size: 100% 100%;
		mask-repeat: no-repeat;
		opacity: 0.55;
		background: radial-gradient(
			circle at var(--d-apex),
			color-mix(in oklab, var(--color-moonlight) 95%, transparent) 0,
			color-mix(in oklab, var(--color-butter) 75%, transparent) 12%,
			color-mix(in oklab, var(--color-ochre) 35%, transparent) 45%,
			color-mix(in oklab, var(--color-ochre) 18%, transparent) 70%
		);
	}

	/* The painted beam (cropped canvas at the stage origin), mapped onto the cone by layout.ts's affine transform */
	.beam-art {
		position: absolute;
		left: 0;
		top: 0;
		width: var(--dw);
		height: var(--dh);
		transform-origin: 0 0;
		transform: var(--d-transform);
		opacity: 0.75;
	}

	.beam-texture {
		display: block;
		width: 100%;
		height: 100%;
	}

	.cinema:has(.facade:hover, .facade:focus-visible) .beam {
		opacity: 0.75;
	}

	.is-playing .beam {
		opacity: 0.95;
		filter: brightness(1.12);
	}

	.dust {
		position: absolute;
		left: var(--dx);
		top: var(--dy);
		width: var(--size);
		height: var(--size);
		border-radius: 50%;
		background: var(--color-moonlight);
		box-shadow: 0 0 6px 1px color-mix(in oklab, var(--color-moonlight) 80%, transparent);
		opacity: 0;
	}

	@media (prefers-reduced-motion: no-preference) {
		.beam-light {
			animation: beam-breathe 7s ease-in-out infinite alternate;
		}

		.dust {
			animation: drift var(--duration) ease-in-out var(--delay) infinite alternate;
		}

		/* Paused while the section is off screen */
		.cinema:not(.is-near) :is(.beam-light, .dust) {
			animation-play-state: paused;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.dust {
			display: none;
		}
	}

	@keyframes beam-breathe {
		from {
			opacity: 0.85;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes drift {
		0% {
			transform: translate(0, 0);
			opacity: 0;
		}
		35% {
			opacity: 0.95;
		}
		100% {
			transform: translate(var(--drift-x), var(--drift-y));
			opacity: 0.15;
		}
	}

	/* The video window: thumbnail facade, iframe, or the empty screen. Always exactly 16:9. */
	.screen {
		height: auto;
		aspect-ratio: 16 / 9;
		background: var(--color-ink);
		overflow: hidden;
	}

	.player,
	.facade,
	.facade :global(.thumbnail),
	.empty {
		display: block;
		width: 100%;
		height: 100%;
		border: 0;
	}

	.facade {
		position: relative;
		padding: 0;
		background: var(--color-ink);
		cursor: pointer;
	}

	.facade:focus-visible {
		outline-offset: -6px;
	}

	.facade :global(.thumbnail) {
		/* The variants are already cropped to 16:9; cover only guards against rounding */
		object-fit: cover;
	}

	.moon {
		position: absolute;
		left: 50%;
		top: 50%;
		width: clamp(3.25rem, 12%, 6.5rem);
		aspect-ratio: 1;
		translate: -50% -50%;
		border-radius: 50%;
		background:
			radial-gradient(circle at 34% 30%, color-mix(in oklab, var(--color-moonlight) 90%, transparent) 0 12%, transparent 13%),
			radial-gradient(circle at 64% 62%, color-mix(in oklab, var(--color-ochre) 45%, transparent) 0 10%, transparent 11%),
			radial-gradient(circle at 30% 68%, color-mix(in oklab, var(--color-ochre) 35%, transparent) 0 7%, transparent 8%),
			radial-gradient(circle at 70% 30%, color-mix(in oklab, var(--color-ochre) 30%, transparent) 0 6%, transparent 7%),
			radial-gradient(circle at 40% 38%, var(--color-moonlight), var(--color-butter) 55%, var(--color-ochre));
		box-shadow:
			0 0 0 2px color-mix(in oklab, var(--color-moonlight) 35%, transparent),
			0 0 28px 8px color-mix(in oklab, var(--color-butter) 55%, transparent),
			0 0 70px 20px color-mix(in oklab, var(--color-butter) 25%, transparent);
		transition:
			scale var(--dur-state) var(--ease-settle),
			box-shadow var(--dur-state) ease;
	}

	.moon-play {
		position: absolute;
		inset: 30% 26% 30% 38%;
		background: var(--color-night);
		clip-path: polygon(0 0, 100% 50%, 0 100%);
		opacity: 0.88;
	}

	.facade:hover .moon,
	.facade:focus-visible .moon {
		scale: 1.08;
		box-shadow:
			0 0 0 2px color-mix(in oklab, var(--color-moonlight) 50%, transparent),
			0 0 36px 12px color-mix(in oklab, var(--color-butter) 70%, transparent),
			0 0 90px 30px color-mix(in oklab, var(--color-butter) 35%, transparent);
	}

	/* Empty screen: the projection is the whole picture (its hills scaled up from the bottom edge so they carry the screen, a
	   projector hotspot in the middle); the sentence and the channel link sit centered on a soft ink scrim over its calm sky. */
	.empty {
		position: relative;
		display: grid;
		place-content: center;
		justify-items: center;
		padding: 0 8% 14%;
		background: var(--color-ink);
	}

	/* enhanced:img's <picture> must not become a grid row */
	.empty :global(picture) {
		display: contents;
	}

	.empty :global(.projection) {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		scale: 1.32;
		transform-origin: 50% 100%;
		opacity: 0.92;
		user-select: none;
	}

	.empty::before {
		content: '';
		position: absolute;
		z-index: 1;
		inset: 0;
		background: radial-gradient(ellipse 60% 70% at 50% 42%, color-mix(in oklab, var(--color-butter) 16%, transparent), transparent 75%);
		mix-blend-mode: screen;
		pointer-events: none;
	}

	.empty-copy {
		position: relative;
		z-index: 2;
		display: grid;
		justify-items: center;
		text-align: center;
		gap: clamp(0.75rem, 1.4vw, 1.25rem);
	}

	/* Soft radial ink scrim behind the copy, no box */
	.empty-copy::before {
		content: '';
		position: absolute;
		inset: -45% -30%;
		z-index: -1;
		background: radial-gradient(
			closest-side,
			color-mix(in oklab, var(--color-ink) 72%, transparent),
			color-mix(in oklab, var(--color-ink) 45%, transparent) 55%,
			transparent
		);
		pointer-events: none;
	}

	.empty-line {
		max-width: 24ch;
		font-size: clamp(1.0625rem, 1.4vw, 1.3rem);
		line-height: 1.4;
		text-wrap: balance;
		color: var(--color-cream);
		text-shadow: var(--halo-ink);
	}

	/* A thin bright inner edge on the aperture (over the screen's content): the strongest light is where picture meets screen */
	.screen::after {
		content: '';
		position: absolute;
		inset: 0;
		pointer-events: none;
		box-shadow:
			inset 0 0 0 1px color-mix(in oklab, var(--color-moonlight) 80%, transparent),
			inset 0 0 0 2px color-mix(in oklab, var(--color-butter) 35%, transparent),
			inset 0 0 1.1rem color-mix(in oklab, var(--color-butter) 26%, transparent);
	}

	/* The frame's outer bloom at about half its painted strength: the halo beyond the burnt band fades out, the band itself is
	   a little darker; full light stays at the aperture rim. */
	.frame {
		mask:
			linear-gradient(
				to right,
				color-mix(in oklab, #000 12%, transparent),
				color-mix(in oklab, #000 45%, transparent) 3.5%,
				#000 6%,
				#000 94%,
				color-mix(in oklab, #000 45%, transparent) 96.5%,
				color-mix(in oklab, #000 12%, transparent)
			),
			linear-gradient(
				to bottom,
				color-mix(in oklab, #000 12%, transparent),
				color-mix(in oklab, #000 45%, transparent) 5.5%,
				#000 10%,
				#000 89%,
				color-mix(in oklab, #000 45%, transparent) 95%,
				color-mix(in oklab, #000 12%, transparent)
			);
		mask-composite: intersect;
		filter: saturate(0.88) brightness(0.8);
	}

	.caption {
		height: auto;
		display: grid;
		gap: 0.6rem;
		justify-items: start;
		color: var(--color-cream);
		text-shadow: var(--halo-ink);
	}

	/* Under the screen the caption meets the dawn bank's lit crown: a soft radial ink scrim keeps it readable, no box */
	.caption::before {
		content: '';
		position: absolute;
		inset: -1.5rem auto -1.5rem -3rem;
		width: min(100%, 34rem);
		z-index: -1;
		background: radial-gradient(
			closest-side,
			color-mix(in oklab, var(--color-ink) 70%, transparent),
			color-mix(in oklab, var(--color-ink) 40%, transparent) 60%,
			transparent
		);
		pointer-events: none;
	}

	.caption.d-center {
		justify-items: center;
		text-align: center;
	}

	.title {
		max-width: 100%;
		overflow-wrap: anywhere;
	}

	/* The page-wide link mark: the hand-drawn underline, always drawn on a standalone link */
	.link {
		position: relative;
		padding-block: 0.35rem 0.55rem;
		color: var(--color-butter);
		text-shadow: var(--halo-ink);
		transition: color var(--dur-hover) ease;
	}

	.link::after {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		height: 0.45rem;
		background: currentColor;
		mask: var(--ink-underline) center / 100% 100% no-repeat;
	}

	.link:hover {
		color: var(--color-cream);
	}

	/* Geist (its Latin file has the arrows): keeps the Geist Mono Latin subset enough for this line */
	.arrow {
		font-family: var(--font-body);
	}

	@media (max-width: 47.99rem) {
		.cinema {
			/* sky above the portrait stage: clock and heading sit in it, above the frame */
			min-height: max(100svh, calc(216.67vw + 6rem));
			--stage-top: calc(100% - 100cqw * 2340 / 1080);
			--night-clock-top: calc(var(--stage-top) + 100cqw * 2340 / 1080 * var(--frame-top-m) - 7.25rem);
			--cliff-cut: var(--dawn-cliff-cut-m);
			--cliff-fade: var(--dawn-cliff-fade-m);
		}

		.heading {
			width: auto;
			right: var(--page-gutter);
		}

		.stage {
			aspect-ratio: 1080 / 2340;
		}

		.is-desktop {
			display: none;
		}

		.is-mobile {
			display: block;
		}

		.placed {
			left: var(--mx);
			top: var(--my);
			width: var(--mw);
			height: var(--mh);
		}

		.cliff,
		.frame,
		.screen,
		.caption {
			height: auto;
		}

		.beam-art {
			width: var(--mw);
			height: var(--mh);
			transform: var(--m-transform);
		}

		.beam-light {
			mask-image: var(--m-mask);
		}

		.dust {
			left: var(--mx);
			top: var(--my);
		}

		.beam-light {
			background: radial-gradient(
				ellipse 70% 40% at var(--m-apex),
				color-mix(in oklab, var(--color-moonlight) 95%, transparent) 0,
				color-mix(in oklab, var(--color-butter) 70%, transparent) 20%,
				color-mix(in oklab, var(--color-ochre) 30%, transparent) 70%,
				color-mix(in oklab, var(--color-ochre) 18%, transparent) 100%
			);
		}

		.caption {
			justify-items: start;
			text-align: start;
		}

		.caption.m-center {
			justify-items: center;
			text-align: center;
		}
	}
</style>
