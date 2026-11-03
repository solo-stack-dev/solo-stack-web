<!--
	@component
	06:00 Sunrise footer (docs/HANDOFF-HOMEPAGE.md §5.7). The night retreats upward as a ragged watercolor edge and
	reveals butter paper, a misty valley with the rising sun, and a steaming coffee next to a closed laptop on the cliff
	path (the shift is over). The owner's photo is ink-printed onto the paper next to the wordmark; legal links and
	social icons sit on the paper at the very end of the page.

	Scroll: `--sunrise` (0 → 1) is driven by a CSS scroll-driven animation (`view()` timeline of this footer, from its
	top entering the viewport to the page end). Fallback without `animation-timeline` support: ScrollProgress writes it.
	Reduced motion (or neither): the registered initial value 1 = the final sunrise, static.
	All rects live in ./layout.ts; optimized assets come from tools/build-assets.mjs.
-->
<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { linkedSocials } from '#lib/home/data/socials.ts';
	import { InView, ScrollProgress, reducedMotion } from '#lib/home/shared/motion.svelte.ts';
	import NightClock from '#lib/home/shared/NightClock.svelte';
	import { SOCIAL_ICON_PATHS } from './icons.ts';
	import { LEGAL_LINKS, SUNRISE_LAYOUT, placeVars, rootVars } from './layout.ts';
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
	const rootStyle = rootVars();

	let root: HTMLElement;
	const near = new InView();

	// JS fallback for browsers without scroll-driven animations. `through` is 0 when the top enters and reaches
	// (vh + H) / H … at the page end, where the bottom of this last section meets the viewport bottom.
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
	style={rootStyle}
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
			sizes="(min-width: 48rem) 14vw, 36vw"
			loading="lazy"
			decoding="async"
		/>
		<div class="placed laptop-glint" style={place.laptopGlint}></div>
	</div>

	<div class="night" data-night-edge aria-hidden="true">
		<enhanced:img src="./assets/sunrise-night-edge.webp?w=1920;1440;1080;720" alt="" sizes="(min-width: 48rem) 100vw, 260vw" loading="lazy" decoding="async" />
	</div>

	<div class="seam" aria-hidden="true"></div>

	<NightClock time="06:00" />

	<div class="bar">
		<div class="brand">
			<enhanced:img class="portrait" src={portrait} alt={m.home_sunrise_portrait_alt()} sizes="7rem" loading="lazy" decoding="async" />
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
		min-height: 100svh;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		overflow: clip;
		color: var(--color-night);
		/* the bottom of the 04:00 cinema (its --ink-fade), continued above the painted night edge */
		--ink-fade: #1c1d1d;
		--night-clock-color: color-mix(in oklab, var(--color-night) 85%, transparent);
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

	/* Butter paper behind everything: matches the bottom band of the sky plates (#fcd772) and the banner. */
	.paper {
		position: absolute;
		inset: 0;
		background: var(--color-butter);
		opacity: clamp(0, var(--sunrise) * 1.6, 1);
	}

	/* The painted sky plate. Its top fades into the paper; it sinks a little as the night retreats, so the baked sun
	   rises behind the valley. */
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
		background: radial-gradient(circle, rgb(255 249 226 / 0.6) 0 18%, rgb(255 240 196 / 0.28) 38%, rgb(255 236 170 / 0) 70%);
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

	/* The valley's misty lower edge and the lowest rocks dissolve into the paper above the footer bar. */
	.valley {
		mask-image: linear-gradient(to bottom, black 62%, transparent 96%);
	}

	.path {
		mask-image: linear-gradient(to bottom, black 68%, transparent 100%);
	}

	.steam {
		fill: none;
		stroke: rgb(255 251 238 / 0.75);
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

	/* A faint warm glint where the low sun catches the closed lid; it grows with the sunrise and breathes slowly. */
	.laptop-glint {
		border-radius: 50%;
		background: radial-gradient(closest-side, rgb(255 244 205 / 0.55), rgb(252 215 114 / 0.18) 55%, rgb(252 215 114 / 0) 100%);
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

	/* The night retreats upward: a ragged watercolor wash, solid ink above it. */
	.night {
		position: absolute;
		top: 0;
		left: var(--d-night-x);
		width: var(--d-night-w);
		translate: 0 calc(var(--d-from) + (var(--d-to) - var(--d-from)) * var(--sunrise));
		pointer-events: none;
	}

	.night :global(img) {
		display: block;
		width: 100%;
		height: auto;
	}

	.night::before {
		content: '';
		position: absolute;
		inset: auto 0 calc(100% - 2px);
		height: 100svh;
		background: var(--ink-fade);
	}

	/* blends the painted wash (#151719 at its top) into the fill above, so no line shows at the section top */
	.night::after {
		content: '';
		position: absolute;
		inset: 0 0 auto;
		height: 14%;
		background: linear-gradient(to bottom, var(--ink-fade), transparent);
	}

	/* Softens the section's top edge into the flat bottom of the 04:00 section, so the painted night is never cut by a
	   straight line while it scrolls past. */
	.seam {
		position: absolute;
		inset: 0 0 auto;
		height: 10svh;
		background: linear-gradient(to bottom, var(--ink-fade), transparent);
		pointer-events: none;
	}

	.bar {
		position: relative;
		z-index: 1;
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		gap: 1.5rem clamp(2rem, 5vw, 5rem);
		padding: 2rem clamp(1.25rem, 5vw, 5rem) clamp(1.5rem, 3.5vw, 3rem);
	}

	/* The owner photo, ink-printed onto the paper: anthracite ink with alpha = density (tools/build-assets.mjs portrait),
	   multiplied onto the butter so the paper shows through the light tones. The ink ends on the wordmark's baseline. */
	.brand {
		--wordmark-size: clamp(2rem, 3.4vw, 3.25rem);

		display: flex;
		align-items: last baseline;
		gap: calc(var(--wordmark-size) * 0.3);
	}

	.portrait {
		flex: none;
		width: auto;
		height: calc(var(--wordmark-size) * 2.1);
		/* the shoulders are feathered into the paper: drop the faded tail below the baseline so the ink ends on it */
		margin-bottom: calc(var(--wordmark-size) * -0.3);
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
		display: inline-block;
		padding-block: 0.6rem;
	}

	.legal a:hover {
		text-decoration: underline;
		text-underline-offset: 0.3em;
	}

	.socials ul {
		gap: 0.25rem;
		justify-content: flex-end;
	}

	.socials a {
		display: grid;
		place-items: center;
		width: 2.75rem;
		height: 2.75rem;
		border-radius: 50%;
		color: var(--color-night);
		transition:
			background-color 200ms ease,
			color 200ms ease;
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

		.night {
			left: var(--m-night-x);
			width: var(--m-night-w);
			translate: 0 calc(var(--m-from) + (var(--m-to) - var(--m-from)) * var(--sunrise));
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

		.socials ul {
			justify-content: center;
		}
	}
</style>
