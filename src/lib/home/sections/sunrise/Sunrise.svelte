<!--
	@component
	06:00 Sunrise footer (docs/HANDOFF-HOMEPAGE.md §5.7). Under the dawn cloud bank (shared/DawnBank.svelte) the dawn sky opens on a
	misty valley with the rising sun, and coffee next to a closed laptop on the cliff path; 06:00 stands beside the cup. The owner's
	duotone print (ochre and anthracite inks multiplied into the paper), legal links, and socials sit on the paper.

	The footer overlaps the cinema (shared/dawn.ts `overlap`) and its top feathers in with a painted edge inside the cloud bank's
	opaque band, so the seam has no straight line and the far ridge is in view while the bank passes.

	`--sunrise` (0 → 1): CSS `view()` timeline while the footer enters; without `animation-timeline` support ScrollProgress writes
	it. Reduced motion: the registered initial value 1 (final state, static).
	Rects: ./layout.ts. Assets: tools/build-assets.mjs.
-->
<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { linkedSocials } from '#lib/home/data/socials.ts';
	import { InView, ScrollProgress, reducedMotion } from '#lib/home/shared/motion.svelte.ts';
	import NightClock from '#lib/home/shared/NightClock.svelte';
	import { dawnVars } from '#lib/home/shared/dawn.ts';
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

	// Seam geometry (shared/dawn.ts) and the cup the 06:00 clock stands beside (stage %).
	const cupVars = [dawnVars(), `--cup-y: ${(d.coffee.y + d.coffee.h * 0.05) / 100}`, `--cup-y-m: ${(mo.coffee.y + mo.coffee.h * 0.02) / 100}`].join('; ');

	let root: HTMLElement;
	const near = new InView();

	// JS fallback without scroll-driven animations, same range as the CSS one (`entry`: top at the viewport bottom → the
	// section fully in, or its top at the viewport top when it is taller than the viewport).
	const entering = new ScrollProgress({ mode: 'enter' });
	let fallback = $state(false);
	$effect(() => {
		fallback = !reducedMotion.current && !CSS.supports('animation-timeline: view()');
	});
	$effect(() => {
		if (!fallback) return;
		const viewport = window.innerHeight;
		const value = Math.min(1, (entering.current * viewport) / Math.max(1, Math.min(viewport, root.offsetHeight)));
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
	style={cupVars}
	{@attach entering.attach}
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

	<!-- The night ends in the dawn cloud bank's underside (shared/DawnBank.svelte); NightPage tracks this line for the nav ink. -->
	<span class="night-clear" data-night-edge data-edge-clear="1" aria-hidden="true"></span>

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
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		overflow: clip;
		color: var(--color-night);
		/*
		 * Overlaps the cinema (shared/dawn.ts): the top line sits inside the dawn cloud bank's opaque band and feathers in with the
		 * painted soft edge, so neither the line nor the cinema's bottom ever shows. The cliff, mascot and screen of the cinema
		 * paint above (z-index 3), the bank between.
		 */
		--overlap: var(--dawn-overlap);
		--fade: var(--dawn-fade);
		--clear: var(--dawn-clear);
		margin-top: calc(var(--overlap) * -1);
		/* the bottom-anchored 16:9 stage rises 6vw above the top (hidden under the bank): the far ridge sits right below it */
		min-height: calc(100vw * 9 / 16 - 6vw);
		mask:
			var(--feather-up) top / 100% var(--fade) repeat-x,
			linear-gradient(#000 0 0) bottom / 100% calc(100% - var(--fade) + 1px) no-repeat;
		/* 06:00 stands beside the coffee cup, on the paper sky: anthracite with a butter halo */
		--night-clock-color: color-mix(in oklab, var(--color-night) 85%, transparent);
		--night-clock-halo: 0 0 2px var(--color-butter), 0 0 8px color-mix(in oklab, var(--color-butter) 80%, transparent);
		--night-clock-top: calc(100% - 100cqw * 9 / 16 * (1 - var(--cup-y)) - 0.5rem);
	}

	@media (prefers-reduced-motion: no-preference) {
		@supports (animation-timeline: view()) {
			.sunrise {
				animation: sunrise-progress linear both;
				animation-timeline: view();
				animation-range: entry 0% entry 100%;
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

	/* Butter paper behind everything; matches the sky plates' bottom band and the banner. */
	.paper {
		position: absolute;
		inset: 0;
		background: var(--color-butter);
	}

	/* Sinks a little while the footer enters, so the baked sun rises behind the valley. Its top is under the cloud bank. */
	.sky {
		translate: 0 calc((1 - var(--sunrise)) * 6%);
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

	/* Down to the dawn bank's ragged underside (shared/dawn.ts `clear`); NightPage's nav/rail ink switch reads this box. */
	.night-clear {
		position: absolute;
		inset: 0 0 auto;
		height: var(--clear);
		pointer-events: none;
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

		.sunrise {
			--overlap: var(--dawn-overlap-m);
			--fade: var(--dawn-fade-m);
			--clear: var(--dawn-clear-m);
			min-height: 0;
			--stage-margin: 20cqw;
			/* 06:00 on the column like every other hour label (page gutter), in the dawn sky just above the cup and the hill line */
			--night-clock-top: calc(var(--stage-margin) + 100cqw * var(--cup-y-m) - 2rem);
		}

		/* In the flow: a short band of dawn sky under the cloud bank, then the square scene, then the footer bar. The far ridge
		   sits ~40vw under the bank's underside. */
		.stage {
			position: relative;
			bottom: auto;
			flex: none;
			aspect-ratio: 1;
			margin-top: var(--stage-margin);
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
