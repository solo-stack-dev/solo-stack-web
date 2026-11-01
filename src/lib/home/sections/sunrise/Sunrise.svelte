<!--
	@component
	06:00 Sunrise footer (docs/HANDOFF-HOMEPAGE.md §5.7). The night retreats upward as a ragged watercolor edge and
	reveals butter paper, a misty valley with the rising sun, the mascot walking the cliff path with his laptop, and a
	steaming coffee. Wordmark, legal links, and social icons sit on the paper at the very end of the page.

	Scroll: `--sunrise` (0 → 1) is driven by a CSS scroll-driven animation (`view()` timeline of this footer, from its
	top entering the viewport to the page end). Fallback without `animation-timeline` support: ScrollProgress writes it.
	Reduced motion (or neither): the registered initial value 1 = the final sunrise, static.
	The mascot walks the painted cliff path as you scroll: one clean frame (walk frame 1) translated along the path with a
	scroll-stepped bob and sway while the page is scrolling; at rest he stands still. The four painted walk frames are
	not used as a loop: frames 1 and 3 lead with the same leg, which reads as a hitch (docs/art/mascot/README.md).
	All rects live in ./layout.ts; optimized assets come from tools/build-assets.mjs.
-->
<script lang="ts">
	import { on } from 'svelte/events';
	import { m } from '#lib/paraglide/messages.js';
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { linkedSocials } from '#lib/home/data/socials.ts';
	import { InView, ScrollProgress, reducedMotion } from '#lib/home/shared/motion.svelte.ts';
	import NightClock from '#lib/home/shared/NightClock.svelte';
	import { SOCIAL_ICON_PATHS } from './icons.ts';
	import { LEGAL_LINKS, SUNRISE_LAYOUT, placeVars, rootVars } from './layout.ts';

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
		mascot: placeVars(d.mascot, mo.mascot)
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

	// The walk bob only plays while the page is scrolling; at rest the mascot stands still.
	let walking = $state(false);
	$effect(() => {
		if (reducedMotion.current || !near.current) return;
		let timer = 0;
		const off = on(
			window,
			'scroll',
			() => {
				walking = true;
				clearTimeout(timer);
				timer = window.setTimeout(() => (walking = false), 160);
			},
			{ passive: true }
		);
		return () => {
			off();
			clearTimeout(timer);
			walking = false;
		};
	});
</script>

<footer
	bind:this={root}
	id="sunrise"
	data-night-hour="06:00"
	class={['sunrise', near.current && 'is-near', walking && 'is-walking']}
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
		<div class="placed mascot" style={place.mascot}>
			<enhanced:img src="./assets/mascot-sunrise-walk@1.webp?w=547;400;280" alt="" sizes="(min-width: 48rem) 13vw, 30vw" loading="lazy" decoding="async" />
		</div>
	</div>

	<div class="night" data-night-edge aria-hidden="true">
		<enhanced:img src="./assets/sunrise-night-edge.webp?w=1920;1440;1080;720" alt="" sizes="(min-width: 48rem) 100vw, 260vw" loading="lazy" decoding="async" />
	</div>

	<div class="seam" aria-hidden="true"></div>

	<NightClock time="06:00" />

	<div class="bar">
		<p class="wordmark font-display font-black tracking-wordmark uppercase">SOLO STACK</p>
		<nav class="legal" aria-label={m.home_sunrise_footer_label()}>
			<ul>
				{#each LEGAL_LINKS as link (link.id)}
					<!-- TODO(lead): the legal routes do not exist yet. rel="external" keeps the prerender crawler from failing on them; drop it once the pages exist. -->
					<li><a href={localizeHref(link.path)} rel="external">{legalLabels[link.id]()}</a></li>
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
		--night-clock-top: clamp(9rem, 30svh, 16rem);
		--walk-t: clamp(0, (var(--sunrise) - var(--walk-start)) / (1 - var(--walk-start)), 1);
		--walk-x: var(--d-walk-x);
		--walk-y: var(--d-walk-y);
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

	/* Mascot: walks the path (translate along its slope) while --sunrise goes walk-start → 1. */
	.mascot {
		height: auto;
		translate: calc((1 - var(--walk-t)) * var(--walk-x)) calc((1 - var(--walk-t)) * var(--walk-y));
	}

	.mascot :global(img) {
		display: block;
		width: 100%;
		height: auto;
		/* the foot pivot of the frame */
		transform-origin: 49% 99%;
		--bob: 0;
		--sway: 0;
		translate: 0 calc(var(--bob) * -2.4%);
		rotate: calc(var(--sway) * 1.6deg);
		transition:
			translate 260ms ease-out,
			rotate 260ms ease-out;
	}

	/* Shiny egg (docs/HOMEPAGE-DEV.md §11): no golden walk art exists, so the shared filter fallback applies. On butter
	   paper its butter glow and cream sparkle vanish, so this section deepens the gold and outlines the sparkle in ochre. */
	:global([data-shiny]) .sunrise .mascot {
		filter: sepia(0.85) saturate(2.4) hue-rotate(-14deg) brightness(1.1) drop-shadow(0 0 0.6rem rgb(226 169 59 / 0.85));
	}

	:global([data-shiny]) .sunrise .mascot::after {
		filter: drop-shadow(0 0 0.12rem rgb(122 78 18 / 0.9)) drop-shadow(0 0 0.4rem rgb(226 169 59 / 0.9));
	}

	/* One bob per footfall, stepped by scroll distance; settles back onto the path when scrolling stops. */
	.is-walking .mascot :global(img) {
		--phase: calc(var(--walk-t) * var(--walk-steps) * 6.2832);
		--bob: calc((1 - cos(var(--phase))) / 2);
		--sway: sin(var(--phase));
		transition: none;
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

	.wordmark {
		font-size: clamp(2rem, 3.4vw, 3.25rem);
		line-height: 1;
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
		.sunrise {
			--night-clock-top: clamp(8rem, 22svh, 12rem);
			--walk-x: var(--m-walk-x);
			--walk-y: var(--m-walk-y);
		}

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

		.art,
		.mascot {
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

		.wordmark {
			font-size: clamp(2.5rem, 13vw, 3.5rem);
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
