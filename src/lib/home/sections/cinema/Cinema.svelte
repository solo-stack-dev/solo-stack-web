<!--
	@component
	04:00 Open air cinema (docs/HANDOFF-HOMEPAGE.md §5.6). The mascot sits on the cliff next to his laptop, which projects
	the latest video into a painted frame in the sky.

	- Facade: self-hosted thumbnail (see ./thumbnail.ts) + moon-shaped play button. No request to YouTube before the click.
	- Click: the window swaps to a youtube-nocookie.com iframe with autoplay (the click is the user gesture); the beam brightens.
	- No video (empty feed or build without network): an empty, softly lit screen and a link to the channel.
	- Dust motes drift in the beam (CSS), paused off screen; reduced motion: no motes, no beam animation.
	- All rects live in ./layout.ts. Dev only: `?cinema=demo` shows a public demo video, `?cinema=empty` the empty state.
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
	import { CINEMA_LAYOUT, beamMask, placeVars } from './layout.ts';
	import VideoThumbnail from './VideoThumbnail.svelte';

	const latest = $derived(await getLatestVideo());

	// Dev-only preview switch (the feed may be empty while building the section). Tree-shaken from production builds.
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

	// The 04:00 sky color, held through the section (see the backdrop note in the styles).
	const SKY = NIGHT_HOURS.find((hour) => hour.id === 'cinema')!.sky;

	const embedUrl = (id: string) => `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1`;

	function play() {
		playing = true;
	}
</script>

<section
	id="cinema"
	data-night-hour="04:00"
	class={['cinema', playing && 'is-playing', near.current && 'is-near']}
	aria-labelledby="home-cinema-title"
	style:--cinema-sky={SKY}
>
	<div class="backdrop" aria-hidden="true">
		<StarField density={0.45} brightness={0.85} seed={404} />
	</div>
	<h2 id="home-cinema-title" class="sr-only">{m.home_cinema_title()}</h2>
	<NightClock time="04:00" />

	<div class="stage" {@attach near.attach}>
		<enhanced:img src="./assets/cinema-landscape.webp?w=1920;1536;1080" alt="" class="layer landscape is-desktop" sizes="100vw" loading="lazy" decoding="async" />
		<enhanced:img src="./assets/cinema-landscape-mobile.webp?w=1080;828;640" alt="" class="layer landscape is-mobile" sizes="100vw" loading="lazy" decoding="async" />
		<!-- Extra grain over the landscape's sky: the repainted sky (moon removed) is smoother than the original pigment. -->
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
		<!-- The shiny egg's golden filter fallback and sparkle apply to this .mascot wrapper (there is no golden sitting art). -->
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
		<div class="landscape-fade" aria-hidden="true"></div>

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
					<p class="empty-line font-mono text-xs tracking-wide md:text-sm">{m.home_cinema_empty()}</p>
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

		<div class={['placed caption font-mono', d.caption.align === 'center' && 'd-center', mo.caption.align === 'center' && 'm-center']} style={place.caption}>
			{#if video}
				<p class="title text-sm tracking-wide md:text-base">{video.title}</p>
				<a class="link label" href={video.url} target="_blank" rel="noopener">
					{m.home_cinema_watch_link()}<span class="arrow" aria-hidden="true"> →</span><span class="sr-only"> ({m.home_cinema_new_tab()})</span>
				</a>
			{:else}
				<a class="link label" href={YOUTUBE_CHANNEL_URL} target="_blank" rel="noopener">
					{m.home_cinema_channel_link()}<span class="arrow" aria-hidden="true"> →</span><span class="sr-only"> ({m.home_cinema_new_tab()})</span>
				</a>
			{/if}
		</div>
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
		--ink-fade: var(--color-night);
	}

	/*
	 * Own night backdrop in the 04:00 color (NIGHT_HOURS), faded in at the top so it meets the 02:00 sky without a seam.
	 * Without it the global sky is already blending toward butter here (its 06:00 stop is the page end), and the
	 * mockups keep 04:00 dark until the sunrise's night edge passes. The global stars fade out in this range too,
	 * so the backdrop carries a sparse local star field.
	 */
	.backdrop {
		position: absolute;
		inset: 0;
		background: var(--cinema-sky);
		/* painted soft edge (shared/transitions.ts): the top ~20 % feathers into the 02:00 sky under the mist bank */
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

	/* The landscape plate is opaque: its top melts into the section's own night backdrop above the stage. */
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

	/* The bottom melts into the solid night that opens the sunrise section (its ink-wash wipe): the product
	   (intersect) of two copies of the wet wash at different widths and offsets, tiled sideways near the painted
	   aspect, so the landscape ends in ink blooms instead of a straight horizontal fade (the wash's even haze squares
	   away). Opaque at the bottom line, where the sunrise night continues. */
	.landscape-fade {
		position: absolute;
		/* 2px past the stage bottom: no fractional last pixel row lets the cliff's lit bottom edge through */
		inset: auto 0 -2px;
		/* 26 % of the stage; --fade-tile: 1.6 × that height (the stage is 16:9 of the width, 1080:2340 on mobile) */
		height: 26%;
		--fade-tile: 23.4vw;
		background: var(--ink-fade);
		mask:
			var(--wash-spread-up) 41% 100% / var(--fade-tile) 100% repeat-x,
			var(--wash-spread-up) 0 100% / auto 100% repeat-x;
		mask-composite: intersect, add;
		pointer-events: none;
	}

	.cliff,
	.frame {
		height: auto;
		pointer-events: none;
		user-select: none;
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

	.empty {
		position: relative;
		display: grid;
		place-content: center;
		justify-items: center;
		gap: 1.25rem;
		padding: 1.5rem;
		text-align: center;
		color: color-mix(in oklab, var(--color-cream) 80%, transparent);
		background: radial-gradient(ellipse at 50% 45%, color-mix(in oklab, var(--color-butter) 16%, transparent), transparent 70%), var(--color-ink);
	}

	.caption {
		height: auto;
		display: grid;
		gap: 0.6rem;
		justify-items: start;
		color: var(--color-cream);
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
			/* a little sky above the portrait stage keeps the painted sky clear of the clock */
			min-height: max(100svh, calc(216.67vw + 3rem));
		}

		.stage {
			aspect-ratio: 1080 / 2340;
		}

		.landscape-fade {
			--fade-tile: 90vw;
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
