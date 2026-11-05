<!--
	@component
	06:00 Sunrise footer (docs/HANDOFF-HOMEPAGE.md §5.7). The night retreats upward and reveals butter paper, a misty valley with the
	rising sun, and coffee next to a closed laptop on the cliff path. The owner's duotone print (ochre and anthracite inks multiplied into the paper), legal links, and socials sit on the paper.

	`--sunrise` (0 → 1): CSS `view()` timeline from the footer's top entering to the page end; without `animation-timeline` support
	ScrollProgress writes it. Reduced motion: the registered initial value 1 (final state, static).
	Rects: ./layout.ts. Assets: tools/build-assets.mjs.
-->
<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { linkedSocials } from '#lib/home/data/socials.ts';
	import { InView, ScrollProgress, reducedMotion } from '#lib/home/shared/motion.svelte.ts';
	import NightClock from '#lib/home/shared/NightClock.svelte';
	import { SOCIAL_ICON_PATHS } from './icons.ts';
	import { LEGAL_LINKS, SUNRISE_LAYOUT, placeVars } from './layout.ts';
	import portrait from './assets/sunrise-portrait.webp?w=320;240;160&enhanced';

	const socials = linkedSocials();
	const legalLabels = {
		imprint: m.home_sunrise_legal_imprint,
		privacy: m.home_sunrise_legal_privacy,
		contact: m.home_sunrise_legal_contact
	};

	const { desktop: d, mobile: mo } = SUNRISE_LAYOUT;
	const place = {
		sky: placeVars(d.sky, mo.sky),
		sunGlow: placeVars(d.sunGlow, mo.sunGlow),
		valley: placeVars(d.valley, mo.valley),
		cliffPath: placeVars(d.cliffPath, mo.cliffPath),
		coffee: placeVars(d.coffee, mo.coffee),
		steam: placeVars(d.steam, mo.steam),
		laptop: placeVars(d.laptop, mo.laptop),
		laptopGlint: placeVars(d.laptopGlint, mo.laptopGlint)
	};

	let root: HTMLElement;
	const near = new InView();

	// JS fallback without scroll-driven animations. As the last section it can't scroll out: at the page end `through`
	// only reaches H / (vh + H), hence the rescale to 1.
	const through = new ScrollProgress();
	let fallback = $state(false);
	$effect(() => {
		fallback = !reducedMotion.current && !CSS.supports('animation-timeline: view()');
	});
	$effect(() => {
		if (!fallback) return;
		const height = Math.max(1, root.offsetHeight);
		const value = Math.min(1, (through.current * (window.innerHeight + height)) / height);
		root.style.setProperty('--sunrise', value.toFixed(4));
		return () => root.style.removeProperty('--sunrise');
	});
</script>

<footer
	bind:this={root}
	id="sunrise"
	data-night-hour="06:00"
	class={['sunrise', near.current && 'is-near']}
	aria-labelledby="home-sunrise-title"
	{@attach through.attach}
	{@attach near.attach}
>
	<h2 id="home-sunrise-title" class="sr-only">{m.home_sunrise_title()}</h2>

	<div class="paper" aria-hidden="true"></div>

	<div class="stage" aria-hidden="true">
		<div class="placed sky" style={place.sky}>
			<enhanced:img src="./assets/sunrise-sky.webp?w=1920;1440;1080;720" alt="" class="is-desktop" sizes="100vw" loading="lazy" decoding="async" />
			<enhanced:img src="./assets/sunrise-sky-mobile.webp?w=1080;780;540" alt="" class="is-mobile" sizes="100vw" loading="lazy" decoding="async" />
			<div class="placed sun-glow" style={place.sunGlow}></div>
		</div>
		<enhanced:img
			src="./assets/sunrise-valley.webp?w=1920;1440;1080;720"
			alt=""
			class="placed art valley"
			style={place.valley}
			sizes="(min-width: 48rem) 100vw, 205vw"
			loading="lazy"
			decoding="async"
		/>
		<enhanced:img
			src="./assets/sunrise-cliff-path.webp?w=1920;1440;1080;720"
			alt=""
			class="placed art path"
			style={place.cliffPath}
			sizes="(min-width: 48rem) 108vw, 150vw"
			loading="lazy"
			decoding="async"
		/>
		<enhanced:img
			src="./assets/sunrise-coffee.webp?w=592;400;240"
			alt=""
			class="placed art"
			style={place.coffee}
			sizes="(min-width: 48rem) 9vw, 22vw"
			loading="lazy"
			decoding="async"
		/>
		<svg class="placed steam" style={place.steam} viewBox="0 0 40 120" preserveAspectRatio="none">
			<path d="M15 118 C 7 100, 23 88, 15 70 S 7 40, 17 18" />
			<path d="M25 118 C 33 98, 17 84, 27 64 S 35 36, 25 10" />
			<path d="M20 118 C 14 104, 26 92, 20 78 S 14 56, 21 38" />
		</svg>
		<enhanced:img
			src="./assets/sunrise-laptop.webp?w=980;720;480;320"
			alt=""
			class="placed art"
			style={place.laptop}
			sizes="(min-width: 48rem) 15vw, 32vw"
			loading="lazy"
			decoding="async"
		/>
		<div class="placed laptop-glint" style={place.laptopGlint}></div>
	</div>

	<!-- Retreating night (ink-wash wipe, CSS below). NightPage tracks the cleared line for the nav ink. -->
	<div class="night" aria-hidden="true">
		<span class="night-clear" data-night-edge data-edge-clear="1"></span>
	</div>

	<NightClock time="06:00" />

	<div class="bar">
		<div class="brand">
			<enhanced:img class="portrait" src={portrait} alt={m.home_sunrise_portrait_alt()} sizes="9rem" loading="lazy" decoding="async" />
			<p class="wordmark font-display font-black tracking-wordmark uppercase">SOLO STACK</p>
		</div>
		<nav class="legal" aria-label={m.home_sunrise_footer_label()}>
			<ul>
				{#each LEGAL_LINKS as link (link.id)}
					<!-- TODO(lead): imprint and privacy do not exist yet. rel="external" keeps the prerender crawler from failing on them; drop it once the pages exist (/kontakt exists). -->
					<li><a href={localizeHref(link.path)} rel={link.id === 'contact' ? undefined : 'external'}>{legalLabels[link.id]()}</a></li>
				{/each}
			</ul>
		</nav>
		<nav class="socials" aria-label={m.home_sunrise_socials_label()}>
			<ul>
				{#each socials as social (social.id)}
					<li>
						<a href={social.url} target="_blank" rel="me noopener" aria-label={m.home_sunrise_social_link({ name: social.name })} title={social.name}>
							<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d={SOCIAL_ICON_PATHS[social.icon]} /></svg>
						</a>
					</li>
				{/each}
			</ul>
		</nav>
	</div>
</footer>

<style>
	/* Section scroll progress 0…1. Initial value 1 = the final sunrise (reduced motion, no JS, no support). */
	@property --sunrise {
		syntax: '<number>';
		inherits: true;
		initial-value: 1;
	}

	.sunrise {
		position: relative;
		container-type: inline-size;
		min-height: 100svh;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		overflow: clip;
		color: var(--color-night);
		/* continues the cinema's --ink-fade */
		--ink-fade: var(--color-night);
		/*
		 * Clock: cream with an ink halo on the night, anthracite with a butter halo once the paper dominates behind it. The night's
		 * opaque part never reaches the clock line: the clock meets only its translucent ramp, darker than mid-tone (measured) only
		 * until --sunrise ≈ 0.4 on landscape screens, and never on portrait ones (taller section, clock deeper in the paper).
		 */
		--clock-switch: 0.36;
		--clock-paper: calc(clamp(0, (var(--sunrise) - var(--clock-switch)) / 0.08, 1) * 100%);
		--night-clock-color: color-mix(
			in oklab,
			color-mix(in oklab, var(--color-cream) 85%, transparent),
			color-mix(in oklab, var(--color-night) 85%, transparent) var(--clock-paper)
		);
		--night-clock-halo:
			0 0 2px color-mix(in oklab, var(--color-ink), var(--color-butter) var(--clock-paper)),
			0 0 8px color-mix(in oklab, color-mix(in oklab, var(--color-ink), var(--color-butter) var(--clock-paper)) 80%, transparent);
	}

	/* Landscape: 06:00 sits in the scene, just above the far ridge on the left (30 % down the bottom-anchored 16:9 stage), not alone
	   at the top of the sky. Lower on the paper, so its ink switches earlier. */
	@media (min-width: 48rem) {
		.sunrise {
			--night-clock-top: max(var(--clock-top), calc(100% - 100cqw * 9 / 16 * 0.7));
			--clock-switch: 0.2;
		}
	}

	@media (max-aspect-ratio: 1/1) {
		.sunrise {
			--clock-switch: 0.04;
		}
	}

	@media (prefers-reduced-motion: no-preference) {
		@supports (animation-timeline: view()) {
			.sunrise {
				animation: sunrise-progress linear both;
				animation-timeline: view();
				animation-range: entry 0% contain 100%;
			}
		}
	}

	@keyframes sunrise-progress {
		from {
			--sunrise: 0;
		}
		to {
			--sunrise: 1;
		}
	}

	/* Butter paper behind everything; matches the sky plates' bottom band and the banner. Opaque from the start: fading it in over the
	   dark sky mixed a khaki fog; the retreating night above it is the only crossfade, and that one is warm (below). */
	.paper {
		position: absolute;
		inset: 0;
		background: var(--color-butter);
	}

	/* Top fades into the paper; sinks as the night retreats so the baked sun rises behind the valley. */
	.sky {
		opacity: clamp(0, var(--sunrise) * 1.6, 1);
		translate: 0 calc((1 - var(--sunrise)) * 6%);
		mask-image: linear-gradient(to bottom, transparent, black 14%);
	}

	.sky :global(img) {
		display: block;
		width: 100%;
		height: 100%;
	}

	.sky :global(img.is-mobile) {
		display: none;
	}

	.sun-glow {
		border-radius: 50%;
		background: radial-gradient(
			circle,
			color-mix(in oklab, var(--color-moonlight) 60%, transparent) 0 18%,
			color-mix(in oklab, var(--color-moonlight) 28%, transparent) 38%,
			transparent 70%
		);
		opacity: calc(0.2 + 0.8 * var(--sunrise));
	}

	.stage {
		position: absolute;
		left: 0;
		bottom: 0;
		width: 100%;
		aspect-ratio: 2560 / 1440;
		pointer-events: none;
		user-select: none;
	}

	.placed {
		position: absolute;
		left: var(--dx);
		top: var(--dy);
		width: var(--dw);
		height: var(--dh);
		/* layers wider than the stage (Tailwind's preflight caps images at 100%) */
		max-width: none;
	}

	.art {
		height: auto;
	}

	.stage > :global(img) {
		position: absolute;
	}

	/* Valley mist and the lowest rocks dissolve into the paper above the bar. */
	.valley {
		mask-image: linear-gradient(to bottom, black 62%, transparent 96%);
	}

	.path {
		mask-image: linear-gradient(to bottom, black 68%, transparent 100%);
	}

	.steam {
		fill: none;
		stroke: color-mix(in oklab, var(--color-moonlight) 75%, transparent);
		stroke-width: 2.6;
		stroke-linecap: round;
		filter: blur(1.4px);
		mask-image: linear-gradient(to top, black 35%, transparent 95%);
		overflow: visible;
	}

	.steam path {
		opacity: 0.5;
	}

	@media (prefers-reduced-motion: no-preference) {
		.steam path {
			animation: steam-rise 4.8s ease-in-out infinite;
		}

		.steam path:nth-child(2) {
			animation-delay: -1.6s;
			animation-duration: 5.6s;
		}

		.steam path:nth-child(3) {
			animation-delay: -3.1s;
			animation-duration: 4.2s;
		}

		.sunrise:not(.is-near) .steam path {
			animation-play-state: paused;
		}
	}

	@keyframes steam-rise {
		0% {
			opacity: 0;
			transform: translateY(8px) scaleX(0.9);
		}
		40% {
			opacity: 0.75;
		}
		100% {
			opacity: 0;
			transform: translateY(-14px) scaleX(1.15);
		}
	}

	/* Warm glint where the low sun catches the lid; grows with --sunrise. */
	.laptop-glint {
		border-radius: 50%;
		background: radial-gradient(
			closest-side,
			color-mix(in oklab, var(--color-moonlight) 55%, transparent),
			color-mix(in oklab, var(--color-butter) 18%, transparent) 55%,
			transparent 100%
		);
		mix-blend-mode: screen;
		opacity: calc(var(--sunrise) * 0.8);
		pointer-events: none;
	}

	@media (prefers-reduced-motion: no-preference) {
		.laptop-glint {
			animation: glint 6.5s ease-in-out infinite;
		}

		.sunrise:not(.is-near) .laptop-glint {
			animation-play-state: paused;
		}
	}

	@keyframes glint {
		50% {
			scale: 1.12 0.9;
			filter: brightness(1.2);
		}
	}

	/*
	 * 04:00 → 06:00 ink-wash wipe: solid --ink-fade ending in the intersect of the drying wash and the wet bloom wash at another
	 * size and offset (shared/transitions.ts). The intersect gives crisp lobes and tide lines that change as the front moves and
	 * never visibly repeat, and squares away the washes' even haze (would read as fog). Both tile near their painted square aspect.
	 *
	 * Over --sunrise 0 → 1 it translates up by --night-travel (no layout; faster in the last fifth) and the ramp tightens
	 * 55svh → 16svh. Tuned so that: the wash starts right under the cinema's painted bottom (no flat ink block); the opaque top
	 * covers the section's top line while that line is > ~5svh below the viewport top (no straight seam on the paper); at the
	 * page end the ink is gone below ~6svh, clear of the 06:00 clock.
	 */
	.night {
		--night-ramp: calc(55svh - 39svh * var(--sunrise));
		--night-late: max(0, (var(--sunrise) - 0.8) * 5);
		--night-travel: calc(-31svh * var(--sunrise) - 9svh * var(--night-late) * var(--night-late));
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 48svh;
		translate: 0 var(--night-travel);
		/* Ink while opaque; through the drying ramp it warms to burnt ochre, so ink over butter passes through amber, never olive */
		background: linear-gradient(
			var(--ink-fade) calc(100% - var(--night-ramp)),
			color-mix(in oklab, var(--color-ochre) 38%, var(--ink-fade)) calc(100% - var(--night-ramp) * 0.55),
			color-mix(in oklab, var(--color-ochre) 78%, var(--ink-fade))
		);
		pointer-events: none;
		mask-image: linear-gradient(#000 0 0), var(--wash-dry), var(--wash-spread-down);
		mask-repeat: no-repeat, repeat-x, repeat-x;
		mask-size:
			100% calc(100% - var(--night-ramp) * 0.9),
			calc(var(--night-ramp) * 1.2) var(--night-ramp),
			calc(var(--night-ramp) * 1.5) calc(var(--night-ramp) * 1.1);
		mask-position:
			0 0,
			calc(var(--sunrise) * -18svh) 100%,
			calc(37% + var(--sunrise) * 24svh) calc(100% + var(--night-ramp) * 0.1);
		mask-composite: add, intersect, add;
	}

	/* Reduced motion: the dried final state at rest, above the clock line. The ink stays opaque on the section's top line (continuing the
	   cinema's ink, so no seam) and dissolves through a soft ramp unioned with two bloom-wash copies at unrelated widths. Both are lifted
	   so their flat opaque bands sit above the box: only the lobed parts show, and the intersect never shows a repeat. */
	@media (prefers-reduced-motion: reduce) {
		.night {
			--night-travel: 0px;
			height: calc(var(--clock-top) * 1.4);
			mask-image: linear-gradient(#000 20%, transparent 60%), var(--wash-spread-down), var(--wash-spread-down);
			mask-repeat: no-repeat, repeat-x, repeat-x;
			mask-size:
				100% 100%,
				38% 140%,
				57% 130%;
			mask-position:
				0 0,
				11% 100%,
				63% 100%;
			mask-composite: add, intersect;
		}

		.night-clear {
			height: 40%;
		}
	}

	/* The still-inked part of .night (down to ~50 % ramp alpha); NightPage's nav/rail ink switch reads this box (data-night-edge). */
	.night-clear {
		position: absolute;
		inset: 0 0 auto;
		height: calc(100% - var(--night-ramp) * 0.45);
	}

	.bar {
		position: relative;
		z-index: 1;
		display: grid;
		grid-template-columns: auto 1fr auto;
		/* links and icons sit on the wordmark's baseline, not centered on the taller portrait */
		align-items: last baseline;
		gap: 1.5rem clamp(2rem, 5vw, 5rem);
		padding: 2rem var(--page-gutter) var(--bottom-gutter);
	}

	/* Owner photo as a duotone print (ochre + anthracite, build-assets.mjs `portrait`), multiplied into the paper. */
	.brand {
		--wordmark-size: clamp(2rem, 3.4vw, 3.25rem);

		display: flex;
		align-items: last baseline;
		gap: calc(var(--wordmark-size) * 0.3);
	}

	/* Bottom-aligned, outside the baseline group: the brand's (and so the bar's) baseline is the wordmark's alone, which the legal
	   links share. The wash-edge tail of the bust hangs below the line, so the visible ink ends on that baseline. */
	.portrait {
		flex: none;
		align-self: flex-end;
		width: auto;
		height: calc(var(--wordmark-size) * 2.75);
		margin-bottom: calc(var(--wordmark-size) * -0.42);
		mix-blend-mode: multiply;
		user-select: none;
	}

	.wordmark {
		font-size: var(--wordmark-size);
		line-height: 1;
		white-space: nowrap;
	}

	.legal ul,
	.socials ul {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
	}

	.legal ul {
		gap: 0.5rem clamp(1.5rem, 3vw, 3rem);
		font-size: 0.95rem;
		font-weight: 500;
	}

	.legal a {
		position: relative;
		display: inline-block;
		padding-block: 0.6rem;
	}

	/* The page-wide link mark: the hand-drawn underline, in anthracite on the paper */
	.legal a::after {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0.15rem;
		height: 0.45rem;
		background: currentColor;
		mask: var(--ink-underline) center / 100% 100% no-repeat;
		scale: 0 1;
		transform-origin: left;
		transition: scale var(--dur-state) var(--ease-settle);
	}

	.legal a:hover::after {
		scale: 1 1;
	}

	/* 44px targets; the last icon (not its hit area) ends on the gutter */
	.socials ul {
		gap: 0.25rem;
		justify-content: flex-end;
		margin-right: -0.75rem;
	}

	.socials a {
		display: grid;
		place-items: center;
		width: 2.75rem;
		height: 2.75rem;
		border-radius: 50%;
		color: var(--color-night);
		transition:
			background-color var(--dur-hover) ease,
			color var(--dur-hover) ease;
	}

	.socials a:hover {
		background-color: var(--color-night);
		color: var(--color-butter);
	}

	.socials svg {
		width: 1.25rem;
		height: 1.25rem;
		fill: currentColor;
	}

	.sunrise :focus-visible {
		outline-color: var(--color-night);
	}

	@media (max-width: 47.99rem) {
		.sky :global(img.is-desktop) {
			display: none;
		}

		.sky :global(img.is-mobile) {
			display: block;
		}

		/* In the flow: open paper above, then the square scene band, then the footer bar */
		.stage {
			position: relative;
			bottom: auto;
			flex: none;
			aspect-ratio: 1;
			/* keeps the scene clear of the clock and the retreated night edge when the bar is tall */
			margin-top: clamp(9rem, 24svh, 14rem);
		}

		.placed {
			left: var(--mx);
			top: var(--my);
			width: var(--mw);
			height: var(--mh);
		}

		.art {
			height: auto;
		}

		.bar {
			grid-template-columns: 1fr;
			justify-items: center;
			text-align: center;
			gap: 1.75rem;
			padding-bottom: 2.5rem;
		}

		/* photo + wordmark on one line: ~78vw at the smallest phones */
		.brand {
			--wordmark-size: clamp(2rem, 10.5vw, 3.5rem);
		}

		.legal ul {
			flex-direction: column;
			gap: 0.25rem;
			font-size: 1.05rem;
		}

		/* 44px targets in a balanced 5 / 4 block (9 in one row would not fit) */
		.socials ul {
			justify-content: center;
			max-width: calc(5 * 2.75rem + 4 * 0.75rem);
			margin-right: 0;
			margin-inline: auto;
			gap: 0.25rem 0.75rem;
		}
	}
</style>
