<!--
	@component
	04:00 Open air cinema (docs/HANDOFF-HOMEPAGE.md §5.6): the mascot's laptop on the cliff projects the latest video into a painted frame.

	- Facade: self-hosted thumbnail (./thumbnail.ts) + moon play button; no request to YouTube before the click.
	- Click: youtube-nocookie.com iframe with autoplay (the click is the user gesture); the beam brightens.
	- No video (empty feed or offline build): the painted projection fills the screen (docs/art/site/round-2/cinema-projection.png);
	  the message and the channel link sit centered on a soft ink scrim over its calm sky.
	- The frame's outer band is halved and broken on the three sides away from the beam and keeps its light where the beam
	  arrives (left edge on desktop, bottom edge on mobile); the aperture edge is uneven projected light, not a drawn line.
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
						<a class="link empty-link" href={YOUTUBE_CHANNEL_URL} target="_blank" rel="noopener">
							{m.home_cinema_channel_link()}<span class="arrow" aria-hidden="true">&thinsp;→</span><span class="sr-only"> ({m.home_cinema_new_tab()})</span>
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

	/* The video window: thumbnail facade, iframe, or the empty screen. Always exactly 16:9. The frame art's hole is a few px
	   larger than its recorded 16:9 aperture (x 114…1800, y 133…1091 vs 117…1797, 139…1084), which left a dark ruled gap
	   around the picture: the screen grows 1.7 % about its center, under the frame's inner edge, so the hole is always filled. */
	.screen {
		--grow: 0.017;
		left: calc(var(--dx) - var(--dw) * var(--grow) / 2);
		top: calc(var(--dy) - var(--dh) * var(--grow) / 2);
		width: calc(var(--dw) * (1 + var(--grow)));
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

	/* The text block's center sits at 38 % of the screen's height, over the calm sky, clear of the hills */
	.empty-copy {
		position: absolute;
		z-index: 2;
		left: 50%;
		top: 38%;
		width: 84%;
		translate: -50% -50%;
		display: grid;
		justify-items: center;
		text-align: center;
		gap: clamp(0.75rem, 1.4vw, 1.25rem);
	}

	/* Sentence case Geist Medium, like the other in-text actions ("Noch eine Nachricht schreiben"), not the mono label */
	.empty-link {
		font-family: var(--font-body);
		font-size: 1rem;
		font-weight: 500;
		line-height: 1.3;
		letter-spacing: normal;
		text-transform: none;
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

	/*
	 * The aperture edge is projected light, not a drawn rectangle: per side a 1px core and a 3px soft stroke whose brightness
	 * runs unevenly along the edge (so its width seems to vary) and drops out in a few short breaks, softened by a slight
	 * blur. The side where the beam arrives (left on desktop, bottom on mobile) is the brightest and gets an inner spill.
	 */
	.screen::after {
		--hi: color-mix(in oklab, var(--color-moonlight) 78%, transparent);
		--mid: color-mix(in oklab, var(--color-moonlight) 42%, transparent);
		--lo: color-mix(in oklab, var(--color-moonlight) 14%, transparent);
		--soft-hi: color-mix(in oklab, var(--color-butter) 38%, transparent);
		--soft-lo: color-mix(in oklab, var(--color-butter) 10%, transparent);
		--spill: color-mix(in oklab, var(--color-butter) 24%, transparent);
		--no: transparent;
		/* the beam side, full strength along its whole length */
		--beam-core: linear-gradient(var(--beam-dir), var(--mid), var(--hi) 12%, var(--hi) 46%, var(--mid) 58%, var(--hi) 70%, var(--hi) 92%, var(--mid));
		--beam-soft: linear-gradient(var(--beam-dir), var(--soft-lo), var(--soft-hi) 18%, var(--soft-hi) 64%, var(--soft-lo) 76%, var(--soft-hi) 88%, var(--soft-lo));
		/* the three sides away from the beam: dimmer, uneven, broken */
		--edge-a: linear-gradient(
			90deg,
			var(--lo),
			var(--mid) 7%,
			var(--lo) 15%,
			var(--no) 18%,
			var(--no) 21%,
			var(--mid) 27%,
			var(--lo) 38%,
			var(--mid) 51%,
			var(--mid) 57%,
			var(--lo) 63%,
			var(--no) 66%,
			var(--lo) 70%,
			var(--mid) 82%,
			var(--lo) 91%,
			var(--mid)
		);
		--soft-a: linear-gradient(
			90deg,
			var(--no),
			var(--soft-lo) 9%,
			var(--no) 16%,
			var(--no) 30%,
			var(--soft-lo) 44%,
			var(--soft-lo) 55%,
			var(--no) 62%,
			var(--no) 76%,
			var(--soft-lo) 86%,
			var(--no)
		);
		--edge-b: linear-gradient(
			180deg,
			var(--mid),
			var(--lo) 9%,
			var(--mid) 22%,
			var(--lo) 31%,
			var(--no) 35%,
			var(--no) 39%,
			var(--lo) 44%,
			var(--mid) 58%,
			var(--lo) 72%,
			var(--mid) 84%,
			var(--no) 92%,
			var(--lo)
		);
		--soft-b: linear-gradient(180deg, var(--soft-lo), var(--no) 12%, var(--no) 47%, var(--soft-lo) 58%, var(--no) 69%, var(--soft-lo) 82%, var(--no));
		--edge-c: linear-gradient(
			90deg,
			var(--mid),
			var(--lo) 11%,
			var(--no) 14%,
			var(--lo) 18%,
			var(--mid) 33%,
			var(--lo) 47%,
			var(--mid) 61%,
			var(--lo) 68%,
			var(--no) 74%,
			var(--no) 77%,
			var(--mid) 86%,
			var(--lo)
		);
		--soft-c: linear-gradient(90deg, var(--no), var(--soft-lo) 26%, var(--no) 40%, var(--soft-lo) 58%, var(--no) 70%, var(--soft-lo) 92%, var(--no));
		--beam-dir: 180deg;
		content: '';
		position: absolute;
		inset: 0;
		pointer-events: none;
		filter: blur(0.35px);
		background:
			/* left: the beam side */
			var(--beam-core) left / 1px 100% no-repeat,
			var(--beam-soft) left / 3px 100% no-repeat,
			linear-gradient(to right, var(--spill), transparent) left / 1.4rem 100% no-repeat,
			/* top, right, bottom */ var(--edge-a) top / 100% 1px no-repeat,
			var(--soft-a) top / 100% 3px no-repeat,
			var(--edge-b) right / 1px 100% no-repeat,
			var(--soft-b) right / 2px 100% no-repeat,
			var(--edge-c) bottom / 100% 1px no-repeat,
			var(--soft-c) bottom / 100% 3px no-repeat;
	}

	/*
	 * The frame's outer band: its bloom stays where the beam arrives (--band-l/r/t/b = 1 there: left on desktop, bottom on
	 * mobile) and is halved on the three sides away from it; two irregular washes (J, across x and y) break its continuity, so
	 * it never reads as a lit perimeter. A soft spot at --spill-at adds the projector's spill back. Layers: spill ∪ (H ∩ V ∩ Jx ∩ Jy).
	 * The aperture is x 6.08…93.35 %, y 11.26…87.84 % of the frame art (art.ts), so H and V are 1 across it.
	 */
	.frame {
		--band-l: 1;
		--band-r: 0.5;
		--band-t: 0.5;
		--band-b: 0.5;
		--spill-at: 0% 64%;
		--spill-size: 16% 48%;
		mask:
			radial-gradient(
				ellipse var(--spill-size) at var(--spill-at),
				color-mix(in oklab, #000 62%, transparent),
				color-mix(in oklab, #000 26%, transparent) 55%,
				transparent
			),
			linear-gradient(
				to right,
				color-mix(in oklab, #000 calc(8% * var(--band-l)), transparent),
				color-mix(in oklab, #000 calc(22% * var(--band-l)), transparent) 2.5%,
				color-mix(in oklab, #000 calc(62% * var(--band-l)), transparent) 4.6%,
				color-mix(in oklab, #000 calc(100% * var(--band-l)), transparent) 6%,
				#000 6.6%,
				#000 92.8%,
				color-mix(in oklab, #000 calc(100% * var(--band-r)), transparent) 93.4%,
				color-mix(in oklab, #000 calc(62% * var(--band-r)), transparent) 95.4%,
				color-mix(in oklab, #000 calc(22% * var(--band-r)), transparent) 97.5%,
				color-mix(in oklab, #000 calc(8% * var(--band-r)), transparent)
			),
			linear-gradient(
				to bottom,
				color-mix(in oklab, #000 calc(8% * var(--band-t)), transparent),
				color-mix(in oklab, #000 calc(22% * var(--band-t)), transparent) 4%,
				color-mix(in oklab, #000 calc(62% * var(--band-t)), transparent) 7.8%,
				color-mix(in oklab, #000 calc(100% * var(--band-t)), transparent) 10.6%,
				#000 11.6%,
				#000 87.4%,
				color-mix(in oklab, #000 calc(100% * var(--band-b)), transparent) 88.2%,
				color-mix(in oklab, #000 calc(62% * var(--band-b)), transparent) 91.6%,
				color-mix(in oklab, #000 calc(22% * var(--band-b)), transparent) 95.5%,
				color-mix(in oklab, #000 calc(8% * var(--band-b)), transparent)
			),
			linear-gradient(90deg, #000 0 7%, #0009 14%, #000 22%, #0006 31%, #000e 38%, #000 47%, #0007 55%, #000 63%, #000b 71%, #0005 79%, #000 86%, #000 93% 100%),
			linear-gradient(180deg, #000 0 12%, #000a 20%, #0006 29%, #000 37%, #000 45%, #0008 54%, #000d 62%, #0005 71%, #000 79%, #000 87% 100%);
		mask-composite: add, intersect, intersect, intersect;
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
			/* the radio ends on its rock now (no printed station card below it): rise further under the rock, no dead band */
			--cinema-overlap: 6.5rem;
			--stage-top: calc(100% - 100cqw * 2340 / 1080);
			--night-clock-top: calc(var(--stage-top) + 100cqw * 2340 / 1080 * var(--frame-top-m) - 7.25rem);
			--cliff-cut: var(--dawn-cliff-cut-m);
			--cliff-fade: var(--dawn-cliff-fade-m);
		}

		.heading {
			width: auto;
			right: var(--page-gutter);
		}

		/* the beam rises from the laptop below: the bottom edge keeps the light */
		.frame {
			--band-l: 0.5;
			--band-b: 1;
			--spill-at: 50% 100%;
			--spill-size: 46% 22%;
		}

		.screen::after {
			--beam-dir: 90deg;
			background:
				/* bottom: the beam side */
				var(--beam-core) bottom / 100% 1px no-repeat,
				var(--beam-soft) bottom / 100% 3px no-repeat,
				linear-gradient(to top, var(--spill), transparent) bottom / 100% 1.1rem no-repeat,
				/* top, right, left */ var(--edge-a) top / 100% 1px no-repeat,
				var(--soft-a) top / 100% 3px no-repeat,
				var(--edge-b) right / 1px 100% no-repeat,
				var(--soft-b) right / 2px 100% no-repeat,
				var(--edge-b) left / 1px 100% no-repeat,
				var(--soft-b) left / 2px 100% no-repeat;
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

		.screen {
			left: calc(var(--mx) - var(--mw) * var(--grow) / 2);
			top: calc(var(--my) - var(--mh) * var(--grow) / 2);
			width: calc(var(--mw) * (1 + var(--grow)));
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
