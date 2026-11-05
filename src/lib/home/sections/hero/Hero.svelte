<!--
	@component
	20:00 Hero: moonrise (docs/HANDOFF-HOMEPAGE.md §5.1).

	Geometry: `--moon-r`, `--moon-cx`, `--moon-cy` on `.hero` (hero container units, per breakpoint) define the moon circle once. The moon
	rig (glow, painted/3D moon, mascot) and the anthracite wordmark copy use them. That copy sits in a moon-sized box clipped to the lit region
	(moon.ts), counter-positioned onto the cream wordmark, so the color split is pixel exact at every size and phase.

	Layers (bottom → top): sky, stars, back clouds (1, 2), moon rig, front cloud (3), cream wordmark, anthracite wordmark, clock, scroll cue.
	Masters live in docs/art; tools/build-assets.mjs writes cropped copies to ./assets and their crop rects to art.ts (README.md).

	Events (window): emits `night:moon-phase` { phase } per phase change and `night:moon-full-clicks` { count } per full-moon click (every
	10th keeps the moon full for the presence egg). Listens to `night:shooting-star` (mascot leans back, looks up).
-->
<script lang="ts">
	import { on } from 'svelte/events';
	import { MediaQuery } from 'svelte/reactivity';
	import { m } from '#lib/paraglide/messages.js';
	import LazyMount from '#lib/home/shared/LazyMount.svelte';
	import NightClock from '#lib/home/shared/NightClock.svelte';
	import ShootingStars, { SHOOTING_STAR_EVENT } from '#lib/home/shared/ShootingStars.svelte';
	import StarField from '#lib/home/shared/StarField.svelte';
	import { InView, RafLoop, reducedMotion } from '#lib/home/shared/motion.svelte.ts';
	import {
		MOON_FULL_CLICKS_EVENT,
		MOON_PHASE_EVENT,
		PHASE_ANGLE,
		circlePath,
		forwardAngle,
		litPath,
		nextPhase,
		type MoonFullClicksDetail,
		type MoonPhase,
		type MoonPhaseDetail
	} from './moon.ts';
	import { ART_CROPS } from './art.ts';
	// Width ladders (`…&enhanced`, imagetools.d.ts) stop at the native detail of the masters (they are upscales); AVIF quality fits the
	// above-the-fold budget (handoff §6.4). Clouds capped at 1280 px, quality 50 keeps their grain: ~55 kB less at 1440@2x.
	import sky from './assets/hero-sky.webp?w=1672;1280;960&quality=40&enhanced';
	import skyMobile from './assets/hero-sky-mobile.webp?w=852;640&quality=45&enhanced';
	import clouds1 from './assets/hero-clouds-1.webp?w=1280;960;640&quality=50&enhanced';
	import clouds2 from './assets/hero-clouds-2.webp?w=1280;960;640&quality=50&enhanced';
	import clouds3 from './assets/hero-clouds-3.webp?w=1280;960;640&quality=50&enhanced';
	import moonDisc from './assets/hero-moon-disc.webp?w=1942;1520;1200;900;640&quality=38&enhanced';
	import mascot from './assets/mascot-hero-moonrim.webp?w=640;420;280&quality=55&enhanced';
	import mascotGolden from './assets/mascot-golden.webp?w=640;420;280&quality=55&enhanced';

	const PHASE_NAMES: Record<MoonPhase, () => string> = {
		full: m.home_hero_moon_phase_full,
		'waning-gibbous': m.home_hero_moon_phase_waning_gibbous,
		half: m.home_hero_moon_phase_half,
		crescent: m.home_hero_moon_phase_crescent,
		new: m.home_hero_moon_phase_new
	};

	/** Phase change tween in ms (instant under reduced motion). */
	const PHASE_DURATION = 750;
	/** Every n-th click on the full moon keeps it full and summons the moon presence egg (eggs/, HOMEPAGE-DEV §11). */
	const PRESENCE_EVERY = 10;

	// --- Painted layer geometry (master px → layout), from the crop rects in art.ts -----------------------------

	/** The moon circle in the disc master (docs/art/hero/README.md): center (1024, 1024), radius 928 of 2048². */
	const DISC = { cx: 1024, cy: 1024, r: 928 };
	const discCrop = ART_CROPS['hero-moon-disc'].crop;
	/** The cropped disc image (it includes the painted halo) relative to the moon box (= the circle's square), in %. */
	const discBox = {
		left: (((discCrop.left - DISC.cx) / DISC.r + 1) / 2) * 100,
		top: (((discCrop.top - DISC.cy) / DISC.r + 1) / 2) * 100,
		size: (discCrop.width / DISC.r / 2) * 100
	};

	/** Seat contact in mascot master px (docs/art/mascot/README.md); mascotRig turns it into % of the cropped image. */
	const MASCOT_SEAT = { x: 740, y: 980 };
	const mascotCrop = ART_CROPS['mascot-hero-moonrim'].crop;
	const mascotRig = {
		aspect: mascotCrop.width / mascotCrop.height,
		sitX: ((MASCOT_SEAT.x - mascotCrop.left) / mascotCrop.width) * 100,
		sitY: ((MASCOT_SEAT.y - mascotCrop.top) / mascotCrop.height) * 100
	};

	const pct = (value: number) => `${value.toFixed(3)}%`;

	/** `sizes` per layer, mirroring the CSS below: phone/tall-portrait layout first, then desktop. */
	const phone = (length: string, desktop: string) => `(max-width: 47.99rem) ${length}, (max-aspect-ratio: 4/5) ${length}, ${desktop}`;
	const SIZES = {
		// moon box 2 × --moon-r, plus the painted halo around the circle (--disc-size)
		moon: phone(`${(2.5 * discBox.size).toFixed(0)}vw`, `min(${discBox.size.toFixed(0)}vw, ${(1.84 * discBox.size).toFixed(0)}vh)`),
		cloud1: phone('150vw', '74vw'),
		cloud2: phone('130vw', '58vw'),
		cloud3: phone('170vw', '64vw'),
		mascot: phone('28vw', 'clamp(7rem, 11vw, 13rem)')
	};

	// --- Moon phase ---------------------------------------------------------------------------------------------

	let phase = $state<MoonPhase>('full');
	/** Phase angle in degrees, animated (moon.ts). 0 = full. */
	let angle = $state(0);
	let announcement = $state('');
	let fullClicks = 0;
	let tween = 0;

	const normalized = $derived(((angle % 360) + 360) % 360);
	const isFull = $derived(Math.cos((normalized * Math.PI) / 180) > 0.9999);
	/** 0…1 lit fraction of the disc, drives the glow. */
	const litFraction = $derived((1 + Math.cos((normalized * Math.PI) / 180)) / 2);

	function cyclePhase() {
		if (phase === 'full') {
			fullClicks += 1;
			window.dispatchEvent(new CustomEvent<MoonFullClicksDetail>(MOON_FULL_CLICKS_EVENT, { detail: { count: fullClicks } }));
			// The presence egg appears over the moon: this click keeps it full instead of moving on to gibbous.
			if (fullClicks % PRESENCE_EVERY === 0) return;
		}
		const next = nextPhase(phase);
		phase = next;
		announcement = m.home_hero_moon_announce({ phase: PHASE_NAMES[next]() });
		window.dispatchEvent(new CustomEvent<MoonPhaseDetail>(MOON_PHASE_EVENT, { detail: { phase: next } }));
		animateAngle(forwardAngle(angle, next === 'full' ? 360 : PHASE_ANGLE[next]));
	}

	function animateAngle(target: number) {
		cancelAnimationFrame(tween);
		if (reducedMotion.current) {
			angle = target % 360;
			return;
		}
		const from = angle;
		const start = performance.now();
		const step = (now: number) => {
			const t = Math.min(1, (now - start) / PHASE_DURATION);
			const eased = t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
			angle = t < 1 ? from + (target - from) * eased : target % 360;
			if (t < 1) tween = requestAnimationFrame(step);
		};
		tween = requestAnimationFrame(step);
	}

	$effect(() => () => cancelAnimationFrame(tween));

	// Lit region in the units of the 2D shade overlay (viewBox -1 -1 2 2)
	const shadePath = $derived.by(() => {
		if (isFull) return null;
		return `${circlePath(1, 0, 0)} ${litPath(normalized, 1, 0, 0) ?? ''}`;
	});

	// Clip of the anthracite wordmark: the lit region in px of the moon box. Full moon uses the CSS default circle(50%).
	let nightBoxSize = $state(0);
	const nightClip = $derived.by(() => {
		if (isFull || !nightBoxSize) return undefined;
		const d = litPath(normalized, nightBoxSize / 2);
		return d ? `path('${d}')` : 'inset(50%)';
	});

	// --- 3D moon (lazy) -----------------------------------------------------------------------------------------

	const narrow = new MediaQuery('(max-width: 47.99rem)', false);
	let capable = $state(false);
	let threeFailed = $state(false);
	let threeReady = $state(false);

	$effect(() => {
		const nav = navigator as Navigator & { deviceMemory?: number };
		const lowEnd = (nav.hardwareConcurrency ?? 8) < 4 || (nav.deviceMemory ?? 8) < 4;
		let webgl = false;
		try {
			const context = document.createElement('canvas').getContext('webgl2');
			webgl = !!context;
			context?.getExtension('WEBGL_lose_context')?.loseContext();
		} catch {
			webgl = false;
		}
		capable = webgl && !lowEnd;
	});

	const use3D = $derived(capable && !threeFailed && !narrow.current && !reducedMotion.current);

	$effect(() => {
		if (!use3D) threeReady = false;
	});

	// --- Parallax (pointer + scroll) ----------------------------------------------------------------------------

	let hero: HTMLElement;
	const target = { x: 0, y: 0 };
	const current = { x: 0, y: 0, scroll: 0 };

	const parallax = new RafLoop(() => {
		current.x += (target.x - current.x) * 0.08;
		current.y += (target.y - current.y) * 0.08;
		const scroll = Math.min(window.scrollY, window.innerHeight);
		const changed = Math.abs(scroll - current.scroll) > 0.5 || Math.abs(target.x - current.x) > 0.001 || Math.abs(target.y - current.y) > 0.001;
		current.scroll = scroll;
		if (!changed) return;
		hero.style.setProperty('--px', current.x.toFixed(3));
		hero.style.setProperty('--py', current.y.toFixed(3));
		hero.style.setProperty('--sy', scroll.toFixed(1));
	});

	$effect(() => {
		parallax.paused = reducedMotion.current;
		if (reducedMotion.current) {
			for (const name of ['--px', '--py', '--sy']) hero.style.removeProperty(name);
			return;
		}
		if (!matchMedia('(pointer: fine)').matches) return;
		return on(
			window,
			'pointermove',
			(event) => {
				target.x = (event.clientX / window.innerWidth) * 2 - 1;
				target.y = (event.clientY / window.innerHeight) * 2 - 1;
			},
			{ passive: true }
		);
	});

	// --- Mascot: leans back and looks up when a shooting star passes --------------------------------------------

	const visible = new InView();
	let looking = $state(false);

	$effect(() => {
		let timer: ReturnType<typeof setTimeout>;
		const off = on(window, SHOOTING_STAR_EVENT, () => {
			if (!visible.current || reducedMotion.current) return;
			looking = true;
			clearTimeout(timer);
			timer = setTimeout(() => (looking = false), 1900);
		});
		return () => {
			off();
			clearTimeout(timer);
		};
	});
</script>

{#snippet wordmarkText()}<span>SOLO</span> <span>STACK</span>{/snippet}

<section
	bind:this={hero}
	id="hero"
	data-night-hour="20:00"
	class="hero"
	aria-labelledby="home-hero-title"
	style:--lit={litFraction.toFixed(3)}
	style:--disc-left={pct(discBox.left)}
	style:--disc-top={pct(discBox.top)}
	style:--disc-size={pct(discBox.size)}
	{@attach visible.attach}
	{@attach parallax.attach}
>
	<div class="layer sky" aria-hidden="true">
		<picture>
			{#each Object.entries(skyMobile.sources) as [format, srcset] (format)}
				<source media="(max-width: 47.99rem)" type="image/{format}" {srcset} sizes="100vw" />
			{/each}
			{#each Object.entries(sky.sources) as [format, srcset] (format)}
				<source type="image/{format}" {srcset} sizes="100vw" />
			{/each}
			<img src={sky.img.src} width={sky.img.w} height={sky.img.h} alt="" decoding="async" />
		</picture>
	</div>

	<div class="layer stars" aria-hidden="true">
		<StarField density={1.15} brightness={1.1} seed={2000} />
	</div>
	<div class="layer shooting" aria-hidden="true">
		<ShootingStars maxY={0.5} />
	</div>

	<div class="layer clouds-back" aria-hidden="true">
		<enhanced:img class="cloud cloud-1" src={clouds1} alt="" sizes={SIZES.cloud1} fetchpriority="low" />
		<enhanced:img class="cloud cloud-2" src={clouds2} alt="" sizes={SIZES.cloud2} fetchpriority="low" />
	</div>

	<div class="moon-box moon-rig" class:is-3d={threeReady}>
		<div class="moon-glow" aria-hidden="true"></div>
		<button type="button" class="moon" data-egg-moon aria-label={m.home_hero_moon_label({ phase: PHASE_NAMES[phase]() })} onclick={cyclePhase}>
			<enhanced:img class="moon-img" src={moonDisc} alt="" sizes={SIZES.moon} fetchpriority="high" />
			{#if use3D}
				<LazyMount
					load={() => import('./MoonScene.svelte')}
					props={{ angle: normalized, onready: () => (threeReady = true), onlost: () => (threeFailed = true) }}
					idle
					class="moon-3d"
				/>
			{/if}
			{#if shadePath && !threeReady}
				<svg class="moon-shade" viewBox="-1 -1 2 2" aria-hidden="true">
					<defs>
						<clipPath id="hero-moon-circle"><circle r="1" /></clipPath>
						<filter id="hero-moon-soft" x="-0.1" y="-0.1" width="1.2" height="1.2">
							<feGaussianBlur stdDeviation="0.012" />
						</filter>
					</defs>
					<g clip-path="url(#hero-moon-circle)">
						<path d={shadePath} fill-rule="evenodd" filter="url(#hero-moon-soft)" />
					</g>
				</svg>
			{/if}
		</button>

		<div
			class="mascot"
			class:looking
			data-shiny-art
			aria-hidden="true"
			style:--mascot-aspect={mascotRig.aspect.toFixed(4)}
			style:--sit-x={pct(mascotRig.sitX)}
			style:--sit-y={pct(mascotRig.sitY)}
		>
			<div class="mascot-figure">
				<enhanced:img class="mascot-art mascot-normal" src={mascot} alt="" sizes={SIZES.mascot} />
				<!-- Shiny variant (1 in 4096): lazy and display:none, so the other visitors never download it -->
				<enhanced:img class="mascot-art mascot-golden" src={mascotGolden} alt="" sizes={SIZES.mascot} loading="lazy" />
				<span class="laptop-glow"></span>
			</div>
		</div>
	</div>

	<div class="layer clouds-front" aria-hidden="true">
		<enhanced:img class="cloud cloud-3" src={clouds3} alt="" sizes={SIZES.cloud3} fetchpriority="low" />
	</div>

	<div class="wordmark-layer">
		<h1 id="home-hero-title" class="wordmark is-cream settle">{@render wordmarkText()}</h1>
		<!-- The topics in the making pillars' style: the same row reappears as the 21:00 navigation -->
		<p class="tagline settle label">{m.home_hero_tagline()}</p>
	</div>

	<div class="moon-box night-copy" aria-hidden="true" bind:clientWidth={nightBoxSize} style:clip-path={nightClip}>
		<div class="night-copy-inner">
			<p class="wordmark is-night settle">{@render wordmarkText()}</p>
		</div>
	</div>

	<NightClock time="20:00" />

	<a class="scroll-cue label" href="#making">
		<span class="scroll-cue-label">{m.home_hero_scroll_cue()}</span>
		<svg width="14" height="18" viewBox="0 0 14 18" aria-hidden="true">
			<path d="M7 1v15M1.5 10.5 7 16l5.5-5.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
		</svg>
	</a>

	<p class="sr-only" aria-live="polite">{announcement}</p>
</section>

<style>
	/* Geometry ------------------------------------------------------------------------------------------------- */

	.hero {
		/* Shared moon geometry (container units of this section). Measured from 02-hero/05-painted-moon-desktop.png. */
		--moon-r: min(50cqw, 92cqh);
		--moon-cx: 86cqw;
		--moon-cy: 96cqh;
		/* Mascot sit point on the rim (angle from the moon center) */
		--mascot-at: -131deg;
		--mascot-w: clamp(7rem, 11cqw, 13rem);
		--mascot-tilt: 4deg;
		/* Wordmark */
		--wm-size: min(14.4cqw, 27cqh);
		--wm-x: 7.5cqw;
		--wm-y: calc(50cqh - var(--wm-size) * 0.42);
		/* Parallax (written by the RafLoop; 0 without JS and under reduced motion) */
		--moon-tx: calc(var(--px, 0) * 9px);
		--moon-ty: calc(var(--py, 0) * 6px + var(--sy, 0) * 0.16px);
		--wm-tx: calc(var(--px, 0) * -4px);
		--wm-ty: calc(var(--py, 0) * -3px);

		position: relative;
		height: 100svh;
		min-height: 36rem;
		container-type: size;
		overflow: hidden;
		isolation: isolate;
		background: var(--color-ink);
	}

	/* Phone layout (02-hero/06-painted-moon-mobile.png) and tall portrait screens */
	@media (max-width: 47.99rem), (max-aspect-ratio: 4/5) {
		.hero {
			--moon-r: 125cqw;
			--moon-cx: 148cqw;
			--moon-cy: 80cqh;
			--mascot-at: -158deg;
			--mascot-w: 28cqw;
			--mascot-tilt: 6deg;
			--wm-size: min(27cqw, 15cqh);
			/* the S's optical edge (and the tagline) on the page gutter, under the clock */
			--wm-x: calc(var(--page-gutter) - 0.06 * var(--wm-size));
			--wm-y: 19cqh;
		}
	}

	.layer {
		position: absolute;
		inset: 0;
	}

	.moon-box {
		position: absolute;
		left: calc(var(--moon-cx) - var(--moon-r));
		top: calc(var(--moon-cy) - var(--moon-r));
		width: calc(var(--moon-r) * 2);
		height: calc(var(--moon-r) * 2);
		translate: var(--moon-tx) var(--moon-ty);
	}

	/* Sky, stars, clouds --------------------------------------------------------------------------------------- */

	.sky {
		z-index: 0;
		inset: -3% -2%;
		translate: calc(var(--px, 0) * -3px) calc(var(--py, 0) * -2px + var(--sy, 0) * 0.35px);
	}

	.sky picture,
	.sky img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.stars {
		z-index: 1;
		translate: calc(var(--px, 0) * -5px) calc(var(--py, 0) * -3px + var(--sy, 0) * 0.3px);
		animation: fade-in 900ms 150ms ease-out backwards;
	}

	.shooting {
		z-index: 1;
		right: 35%;
	}

	.clouds-back {
		z-index: 2;
		translate: calc(var(--px, 0) * -7px) calc(var(--py, 0) * -4px + var(--sy, 0) * 0.22px);
	}

	.clouds-front {
		z-index: 4;
		pointer-events: none;
		translate: calc(var(--px, 0) * -12px) calc(var(--py, 0) * -6px + var(--sy, 0) * 0.05px);
	}

	.layer :global(.cloud) {
		position: absolute;
		height: auto;
		pointer-events: none;
	}

	/* Cropped to content (art.ts); widths must match SIZES. 1 warm low bank, 2 thin wisps (behind the moon); 3 dark bank over the lower rim. */
	.layer :global(.cloud-1) {
		left: -12cqw;
		bottom: 9cqh;
		width: 74cqw;
	}

	.layer :global(.cloud-2) {
		left: 6cqw;
		top: 11cqh;
		width: 58cqw;
		opacity: 0.55;
	}

	.layer :global(.cloud-3) {
		left: -14cqw;
		bottom: -7cqh;
		width: 64cqw;
	}

	@media (max-width: 47.99rem), (max-aspect-ratio: 4/5) {
		.layer :global(.cloud-1) {
			left: -70cqw;
			bottom: 12cqh;
			width: 150cqw;
		}

		.layer :global(.cloud-2) {
			left: -48cqw;
			top: 4cqh;
			width: 130cqw;
			opacity: 0.6;
		}

		.layer :global(.cloud-3) {
			left: -78cqw;
			bottom: -3cqh;
			width: 170cqw;
		}
	}

	/* Moon ----------------------------------------------------------------------------------------------------- */

	.moon-rig {
		z-index: 3;
		animation: moonrise var(--dur-entrance) var(--ease-settle) backwards;
	}

	.moon-glow {
		position: absolute;
		inset: -9%;
		border-radius: 50%;
		background: radial-gradient(
			closest-side,
			transparent 80%,
			color-mix(in oklab, var(--color-butter) 42%, transparent) 84.5%,
			color-mix(in oklab, var(--color-ochre) 14%, transparent) 91%,
			transparent 100%
		);
		opacity: calc(0.12 + 0.88 * var(--lit, 1));
		pointer-events: none;
		transition: opacity var(--dur-reveal) ease;
		animation: fade-in var(--dur-entrance) ease-out backwards;
	}

	.moon {
		position: absolute;
		inset: 0;
		display: block;
		padding: 0;
		border: 0;
		border-radius: 50%;
		background: none;
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
		animation: moonlight var(--dur-entrance) ease-out backwards;
	}

	.moon:focus-visible {
		outline: 3px solid var(--color-cream);
		outline-offset: 6px;
	}

	.moon :global(.moon-3d) {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}

	/* Flat butter disc until the painted image has loaded, so the anthracite wordmark always sits on light */
	.moon::before {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: 50%;
		background: radial-gradient(closest-side, var(--color-butter) 85%, var(--color-ochre));
	}

	/* The painted disc includes its halo: the image box is larger than the moon circle (geometry from art.ts) */
	.moon :global(.moon-img) {
		position: absolute;
		left: var(--disc-left);
		top: var(--disc-top);
		width: var(--disc-size);
		height: var(--disc-size);
		max-width: none;
		transition: opacity var(--dur-reveal) ease;
	}

	/* The painted image stays in the DOM (LCP element, instant fallback); it only fades out under the 3D moon */
	.is-3d :global(.moon-img),
	.is-3d .moon::before {
		opacity: 0;
	}

	.moon-shade {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		fill: color-mix(in oklab, var(--color-night) 92%, transparent);
		pointer-events: none;
	}

	/* Mascot (docs/art/mascot): seat point (--sit-x/y) on the rim, the pivot for the shooting-star lean; laptop glow flickers on face/hands. */

	.mascot {
		/* laptop light, fractions of the cropped image (between the lid, the hands and the face) */
		--glow-x: 40%;
		--glow-y: 45%;

		position: absolute;
		left: calc(50% + 50% * cos(var(--mascot-at)));
		top: calc(50% + 50% * sin(var(--mascot-at)));
		width: var(--mascot-w);
		aspect-ratio: var(--mascot-aspect);
		translate: calc(var(--sit-x) * -1) calc(var(--sit-y) * -1);
		rotate: var(--mascot-tilt);
		transform-origin: var(--sit-x) var(--sit-y);
		pointer-events: none;
	}

	.mascot-figure {
		position: absolute;
		inset: 0;
		transform-origin: var(--sit-x) var(--sit-y);
		transition: rotate 900ms cubic-bezier(0.3, 0.7, 0.3, 1);
	}

	.looking .mascot-figure {
		rotate: 5deg;
	}

	.mascot :global(.mascot-art) {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		filter: drop-shadow(0 0 0.35rem color-mix(in oklab, var(--color-butter) 22%, transparent));
	}

	.mascot :global(.mascot-golden) {
		display: none;
	}

	:global([data-shiny]) .mascot :global(.mascot-golden) {
		display: block;
	}

	:global([data-shiny]) .mascot :global(.mascot-normal) {
		display: none;
	}

	.laptop-glow {
		position: absolute;
		left: var(--glow-x);
		top: var(--glow-y);
		width: 62%;
		aspect-ratio: 1;
		translate: -50% -50%;
		border-radius: 50%;
		background: radial-gradient(
			closest-side,
			color-mix(in oklab, var(--color-butter) 42%, transparent),
			color-mix(in oklab, var(--color-butter) 12%, transparent) 55%,
			transparent
		);
		mix-blend-mode: screen;
		opacity: 0.75;
	}

	@media (prefers-reduced-motion: no-preference) {
		.laptop-glow {
			animation: flicker 4.1s infinite;
		}
	}

	/* Wordmark ------------------------------------------------------------------------------------------------- */

	.wordmark-layer {
		position: absolute;
		inset: 0;
		z-index: 5;
		translate: var(--wm-tx) var(--wm-ty);
		pointer-events: none;
	}

	.wordmark {
		position: absolute;
		left: var(--wm-x);
		top: var(--wm-y);
		margin: 0;
		font-family: var(--font-display);
		font-size: var(--wm-size);
		font-weight: 900;
		line-height: 0.84;
		letter-spacing: var(--tracking-wordmark);
		text-transform: uppercase;
		white-space: nowrap;
	}

	@media (max-width: 47.99rem), (max-aspect-ratio: 4/5) {
		.wordmark :global(span) {
			display: block;
		}
	}

	.is-cream {
		color: var(--color-cream);
		text-shadow: 0 0.02em 0.1em color-mix(in oklab, var(--color-ink) 45%, transparent);
	}

	.is-night {
		color: var(--color-night);
	}

	.night-copy {
		z-index: 6;
		pointer-events: none;
		clip-path: circle(50%);
		animation: moonrise var(--dur-entrance) var(--ease-settle) backwards;
	}

	/* Back to the hero's coordinate system: undo the moon box offset, its parallax, and its moonrise. */
	.night-copy-inner {
		position: absolute;
		left: calc(var(--moon-r) - var(--moon-cx));
		top: calc(var(--moon-r) - var(--moon-cy));
		width: 100cqw;
		height: 100cqh;
		translate: calc(var(--wm-tx) - var(--moon-tx)) calc(var(--wm-ty) - var(--moon-ty));
		animation: moonrise-counter var(--dur-entrance) var(--ease-settle) backwards;
	}

	.settle {
		animation: settle var(--dur-reveal) 550ms var(--ease-settle) backwards;
	}

	.tagline {
		position: absolute;
		left: calc(var(--wm-x) + 0.06 * var(--wm-size));
		top: calc(var(--wm-y) + var(--wm-size) * 0.98);
		max-width: min(40cqw, 36rem);
		margin: 0;
		line-height: 1.6;
		color: var(--color-cream);
		/* the line crosses the butter clouds, where cream alone has too little contrast */
		text-shadow: var(--halo-ink);
	}

	@media (max-width: 47.99rem), (max-aspect-ratio: 4/5) {
		/* Grows upwards from just above the stacked wordmark */
		.tagline {
			top: auto;
			bottom: calc(100cqh - var(--wm-y) + 0.75rem);
			max-width: calc(100cqw - 2 * var(--page-gutter));
			/* one line on a phone: five words get the narrow tracking (wide tracking is for three words or fewer) */
			letter-spacing: 0.1em;
		}
	}

	/* Fades out over the first 40 % of the making wipe (Making.svelte: wipe = first 55svh of scroll), clear of the 21:00 clock and heading
	   riding up with the wash. Listed before `settle`, which wins while it runs. */
	@media (prefers-reduced-motion: no-preference) {
		@supports (animation-timeline: scroll()) {
			.tagline {
				animation:
					scroll-out linear both,
					settle var(--dur-reveal) 550ms var(--ease-settle) backwards;
				animation-timeline: scroll(root block), auto;
				animation-range:
					0 22svh,
					normal;
			}
		}
	}

	@keyframes scroll-out {
		to {
			opacity: 0;
		}
	}

	/* The mascot is gone before the making wipe's ramp reaches it (phones: it sits low on the rim, the wash front would cut it). Desktop:
	   it is already leaving the viewport top by then. Static under reduced motion. */
	@media (prefers-reduced-motion: no-preference) {
		@supports (animation-timeline: scroll()) {
			.mascot {
				animation: scroll-out linear both;
				animation-timeline: scroll(root block);
				animation-range: 18svh 42svh;
			}
		}
	}

	/* Scroll cue --------------------------------------------------------------------------------------------- */

	/* No chip: quiet label with ink halo, butter on hover (page-wide link idiom) */
	.scroll-cue {
		position: absolute;
		z-index: 7;
		left: 50%;
		bottom: var(--bottom-gutter);
		translate: -50% 0;
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		min-height: 2.75rem;
		padding-inline: 0.5rem;
		color: var(--color-cream);
		text-shadow: var(--halo-ink);
		transition: color var(--dur-hover) ease;
	}

	.scroll-cue svg {
		filter: drop-shadow(0 0 2px var(--color-ink)) drop-shadow(0 0 5px var(--color-ink));
	}

	.scroll-cue:hover {
		color: var(--color-butter);
	}

	.scroll-cue-label {
		max-width: 40cqw;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	/* Phones: only the arrow is visible, the label stays the link's accessible name */
	@media (max-width: 47.99rem) {
		.scroll-cue {
			min-width: 2.75rem;
			justify-content: center;
		}

		.scroll-cue-label {
			position: absolute;
			width: 1px;
			height: 1px;
			clip-path: inset(50%);
		}
	}

	@media (prefers-reduced-motion: no-preference) {
		.scroll-cue svg {
			animation: nudge 2.4s 1.6s ease-in-out infinite;
		}
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}

	/* Motion --------------------------------------------------------------------------------------------------- */

	@keyframes moonrise {
		from {
			transform: translateY(calc(var(--moon-r) * 0.14));
		}
	}

	@keyframes moonrise-counter {
		from {
			transform: translateY(calc(var(--moon-r) * -0.14));
		}
	}

	@keyframes moonlight {
		from {
			filter: brightness(0.72) saturate(0.85);
		}
	}

	@keyframes fade-in {
		from {
			opacity: 0;
		}
	}

	/* Never from 0: the wordmark is an LCP candidate and must paint in the first frame */
	@keyframes settle {
		from {
			opacity: 0.3;
			transform: translateY(0.08em);
		}
	}

	@keyframes flicker {
		0%,
		100% {
			opacity: 0.75;
		}
		12% {
			opacity: 0.6;
		}
		14% {
			opacity: 0.85;
		}
		47% {
			opacity: 0.7;
		}
		52% {
			opacity: 0.9;
		}
		80% {
			opacity: 0.65;
		}
	}

	@keyframes nudge {
		0%,
		60%,
		100% {
			translate: 0 0;
		}
		30% {
			translate: 0 3px;
		}
	}
</style>
