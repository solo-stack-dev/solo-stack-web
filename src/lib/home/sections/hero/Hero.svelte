<!--
	@component
	20:00 Hero: moonrise (docs/HANDOFF-HOMEPAGE.md §5.1).

	Geometry: the moon circle is defined once by CSS custom properties on `.hero` (`--moon-r`, `--moon-cx`,
	`--moon-cy`, in container units of the hero) per breakpoint. Everything that has to line up with the moon uses
	them: the moon rig (glow, painted moon / 3D canvas, mascot) and the anthracite copy of the wordmark, which lives
	in a box of exactly the moon's size and is clipped to the moon's lit region (moon.ts). Its text is
	counter-positioned so it sits exactly on top of the cream wordmark, which makes the color split pixel exact at
	every size and in every phase.

	Layers (bottom → top): sky plate, stars, back clouds, moon rig, front clouds, cream wordmark, anthracite wordmark,
	portrait, clock, scroll cue. Final painted layers drop into ./assets with the same file names (README.md).

	Events (window): `night:moon-phase` { phase } on every phase change, `night:moon-full-clicks` { count } for
	every click on the full moon. Listens to `night:shooting-star` (mascot looks up).
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
	import sky from './assets/hero-sky.png?enhanced';
	import skyMobile from './assets/hero-sky-mobile.png?enhanced';
	import clouds1 from './assets/hero-clouds-1.png?enhanced';
	import clouds2 from './assets/hero-clouds-2.png?enhanced';
	import clouds3 from './assets/hero-clouds-3.png?enhanced';
	import moonDisc from './assets/hero-moon-disc.png?enhanced';
	import mascot from './assets/mascot-hero-moonrim.png?enhanced';
	import portrait from './assets/hero-portrait.png?enhanced';
	import portraitFrame from './assets/hero-portrait-frame.png?enhanced';

	const PHASE_NAMES: Record<MoonPhase, () => string> = {
		full: m.home_hero_moon_phase_full,
		'waning-gibbous': m.home_hero_moon_phase_waning_gibbous,
		half: m.home_hero_moon_phase_half,
		crescent: m.home_hero_moon_phase_crescent,
		new: m.home_hero_moon_phase_new
	};

	/** Phase change tween in ms (instant under reduced motion). */
	const PHASE_DURATION = 750;

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

	// --- Mascot: looks up when a shooting star passes -----------------------------------------------------------

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
		<enhanced:img class="cloud cloud-3" src={clouds3} alt="" sizes="40vw" fetchpriority="low" />
		<enhanced:img class="cloud cloud-1" src={clouds1} alt="" sizes="(max-width: 47.99rem) 110vw, 60vw" fetchpriority="low" />
	</div>

	<div class="moon-box moon-rig" class:is-3d={threeReady}>
		<div class="moon-glow" aria-hidden="true"></div>
		<button type="button" class="moon" aria-label={m.home_hero_moon_label({ phase: PHASE_NAMES[phase]() })} onclick={cyclePhase}>
			<enhanced:img class="moon-img" src={moonDisc} alt="" sizes="(max-width: 47.99rem) 250vw, 100vw" fetchpriority="high" />
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

		<div class="mascot" class:looking aria-hidden="true">
			<enhanced:img class="mascot-body" src={mascot} alt="" sizes="(max-width: 47.99rem) 34vw, 14vw" />
			<div class="mascot-head">
				<enhanced:img src={mascot} alt="" sizes="(max-width: 47.99rem) 34vw, 14vw" />
				<span class="lid lid-left"></span>
				<span class="lid lid-right"></span>
			</div>
			<span class="laptop-glow"></span>
		</div>
	</div>

	<div class="layer clouds-front" aria-hidden="true">
		<enhanced:img class="cloud cloud-2" src={clouds2} alt="" sizes="(max-width: 47.99rem) 120vw, 50vw" fetchpriority="low" />
	</div>

	<div class="wordmark-layer">
		<h1 id="home-hero-title" class="wordmark is-cream settle">{@render wordmarkText()}</h1>
		<p class="tagline settle">{m.home_hero_tagline()}</p>
	</div>

	<div class="moon-box night-copy" aria-hidden="true" bind:clientWidth={nightBoxSize} style:clip-path={nightClip}>
		<div class="night-copy-inner">
			<p class="wordmark is-night settle">{@render wordmarkText()}</p>
		</div>
	</div>

	<figure class="portrait">
		<enhanced:img class="portrait-photo" src={portrait} alt={m.home_hero_portrait_alt()} sizes="12rem" />
		<enhanced:img class="portrait-frame" src={portraitFrame} alt="" sizes="14rem" />
	</figure>

	<NightClock time="20:00" />

	<a class="scroll-cue font-mono" href="#making">
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
		--mascot-w: clamp(7.5rem, 12.5cqw, 15rem);
		--mascot-tilt: -6deg;
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
			--mascot-at: -149deg;
			--mascot-w: 34cqw;
			--mascot-tilt: -4deg;
			--wm-size: min(27cqw, 15cqh);
			--wm-x: 8cqw;
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

	.layer :global(.cloud-1) {
		left: -6cqw;
		bottom: -9cqh;
		width: 58cqw;
	}

	.layer :global(.cloud-2) {
		left: -8cqw;
		bottom: -14cqh;
		width: 46cqw;
	}

	.layer :global(.cloud-3) {
		left: -4cqw;
		top: 30cqh;
		width: 30cqw;
		opacity: 0.8;
	}

	@media (max-width: 47.99rem), (max-aspect-ratio: 4/5) {
		.layer :global(.cloud-1) {
			left: -35cqw;
			bottom: 4cqh;
			width: 120cqw;
		}

		.layer :global(.cloud-2) {
			left: -30cqw;
			bottom: -6cqh;
			width: 115cqw;
		}

		.layer :global(.cloud-3) {
			left: auto;
			right: -38cqw;
			top: 4cqh;
			width: 95cqw;
			scale: -1 1;
		}
	}

	/* Moon ----------------------------------------------------------------------------------------------------- */

	.moon-rig {
		z-index: 3;
		animation: moonrise 1100ms cubic-bezier(0.2, 0.7, 0.2, 1) backwards;
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
		transition: opacity 500ms ease;
		animation: fade-in 1100ms ease-out backwards;
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
		animation: moonlight 1100ms ease-out backwards;
	}

	.moon:focus-visible {
		outline: 3px solid var(--color-cream);
		outline-offset: 6px;
	}

	.moon :global(.moon-img),
	.moon :global(.moon-3d) {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}

	/* Flat butter disc until the painted image has loaded, so the anthracite wordmark always sits on light */
	.moon :global(.moon-img) {
		border-radius: 50%;
		background: radial-gradient(closest-side, var(--color-butter) 85%, var(--color-ochre));
		transition: opacity 600ms ease;
	}

	/* The painted image stays in the DOM (LCP element, instant fallback); it only fades out under the 3D moon */
	.is-3d :global(.moon-img) {
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

	/* Mascot (rig positions are fractions of the mascot image; adjust when the final art lands) ----------------- */

	.mascot {
		--sit-x: 53%;
		--sit-y: 67%;
		--head: 14% 32% 58% 35%;
		--head-pivot: 52% 41%;
		--eye-left-x: 47.2%;
		--eye-right-x: 57.2%;
		--eye-y: 29.2%;
		--lid-size: 3.2%;
		--lid-color: #f2c9a3;
		--glow-x: 41%;
		--glow-y: 57%;

		position: absolute;
		left: calc(50% + 50% * cos(var(--mascot-at)));
		top: calc(50% + 50% * sin(var(--mascot-at)));
		width: var(--mascot-w);
		aspect-ratio: 600 / 720;
		translate: calc(var(--sit-x) * -1) calc(var(--sit-y) * -1);
		rotate: var(--mascot-tilt);
		pointer-events: none;
	}

	.mascot :global(img) {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}

	.mascot :global(.mascot-body) {
		clip-path: polygon(0 0, 35% 0, 35% 42%, 68% 42%, 68% 0, 100% 0, 100% 100%, 0 100%);
	}

	.mascot-head {
		position: absolute;
		inset: 0;
		transform-origin: var(--head-pivot);
		transition: rotate 700ms cubic-bezier(0.3, 0.7, 0.3, 1);
	}

	.mascot-head :global(img) {
		clip-path: inset(var(--head));
	}

	.looking .mascot-head {
		rotate: -9deg;
	}

	.lid {
		position: absolute;
		width: var(--lid-size);
		height: calc(var(--lid-size) * 0.95);
		translate: -50% -50%;
		border-radius: 50%;
		background: var(--lid-color);
		scale: 1 0;
		transform-origin: 50% 0;
	}

	.lid-left {
		left: var(--eye-left-x);
		top: var(--eye-y);
	}

	.lid-right {
		left: var(--eye-right-x);
		top: var(--eye-y);
	}

	.laptop-glow {
		position: absolute;
		left: var(--glow-x);
		top: var(--glow-y);
		width: 70%;
		aspect-ratio: 1;
		translate: -50% -50%;
		border-radius: 50%;
		background: radial-gradient(closest-side, color-mix(in oklab, var(--color-butter) 55%, transparent), transparent);
		mix-blend-mode: screen;
		opacity: 0.75;
	}

	@media (prefers-reduced-motion: no-preference) {
		.lid {
			animation: blink 5.3s 2.4s infinite;
		}

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
		animation: moonrise 1100ms cubic-bezier(0.2, 0.7, 0.2, 1) backwards;
	}

	/* Back to the hero's coordinate system: undo the moon box offset, its parallax, and its moonrise. */
	.night-copy-inner {
		position: absolute;
		left: calc(var(--moon-r) - var(--moon-cx));
		top: calc(var(--moon-r) - var(--moon-cy));
		width: 100cqw;
		height: 100cqh;
		translate: calc(var(--wm-tx) - var(--moon-tx)) calc(var(--wm-ty) - var(--moon-ty));
		animation: moonrise-counter 1100ms cubic-bezier(0.2, 0.7, 0.2, 1) backwards;
	}

	.settle {
		animation: settle 650ms 550ms cubic-bezier(0.2, 0.7, 0.2, 1) backwards;
	}

	.tagline {
		position: absolute;
		left: calc(var(--wm-x) + 0.06 * var(--wm-size));
		top: calc(var(--wm-y) + var(--wm-size) * 0.98);
		max-width: min(26cqw, 24rem);
		margin: 0;
		font-size: clamp(0.95rem, 1.2cqw, 1.2rem);
		line-height: 1.45;
		color: color-mix(in oklab, var(--color-cream) 78%, transparent);
	}

	@media (max-width: 47.99rem), (max-aspect-ratio: 4/5) {
		/* Grows upwards from just above the stacked wordmark */
		.tagline {
			top: auto;
			bottom: calc(100cqh - var(--wm-y) + 0.75rem);
			max-width: 84cqw;
			font-size: 0.85rem;
			line-height: 1.35;
		}
	}

	/* Portrait, clock, scroll cue ------------------------------------------------------------------------------ */

	.portrait {
		position: absolute;
		z-index: 7;
		left: clamp(1rem, 3cqw, 3rem);
		bottom: clamp(1rem, 4cqh, 3rem);
		width: clamp(5.5rem, 10.5cqw, 11rem);
		aspect-ratio: 1;
		margin: 0;
		rotate: -4deg;
	}

	.portrait :global(img) {
		position: absolute;
		width: 100%;
		height: 100%;
	}

	.portrait :global(.portrait-photo) {
		inset: 12%;
		width: 76%;
		height: 76%;
		object-fit: cover;
		border-radius: 8%;
	}

	.portrait :global(.portrait-frame) {
		inset: 0;
		filter: drop-shadow(0 0.4rem 0.8rem color-mix(in oklab, var(--color-ink) 55%, transparent));
	}

	.scroll-cue {
		position: absolute;
		z-index: 7;
		left: 50%;
		bottom: clamp(1rem, 3.5cqh, 2.25rem);
		translate: -50% 0;
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.5rem 0.9rem 0.5rem 1rem;
		border-radius: 999px;
		background: color-mix(in oklab, var(--color-cream) 90%, transparent);
		color: var(--color-night);
		font-size: 0.7rem;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		box-shadow: 0 0.3rem 1rem color-mix(in oklab, var(--color-ink) 35%, transparent);
	}

	.scroll-cue:hover {
		background: var(--color-butter);
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
			padding: 0.7rem;
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

	@keyframes blink {
		0%,
		94%,
		100% {
			scale: 1 0;
		}
		96.5% {
			scale: 1 1;
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
