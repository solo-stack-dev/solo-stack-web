<!--
	@component
	06:00 Sunrise footer (docs/HANDOFF-HOMEPAGE.md §5.7). The night retreats upward as a ragged watercolor edge and
	reveals butter paper, a misty valley with the rising sun, the mascot walking the cliff path with his laptop, and a
	steaming coffee. Wordmark, legal links, and social icons sit on the paper at the very end of the page.

	Scroll: `--sunrise` (0 → 1) is driven by a CSS scroll-driven animation (`view()` timeline of this footer, from its
	top entering the viewport to the page end). Fallback without `animation-timeline` support: ScrollProgress writes it.
	Reduced motion (or neither): the registered initial value 1 = the final sunrise, static.
	The mascot walks the painted cliff path as you scroll: a 16-frame cycle baked from the walk puppet, layered as legs
	atlas (far leg, body, near leg, arm, like the bake). ./walk.ts keys it to scroll distance, one frame per stride
	fraction so the planted foot never skates; at rest he settles on a contact pose and breathes. Skewed to the path
	slope (stays upright, both feet on the line). Reduced motion or no JS: the end pose (contact frame), static.
	All rects live in ./layout.ts; optimized assets come from tools/build-assets.mjs.
-->
<script lang="ts">
	import { MediaQuery } from 'svelte/reactivity';
	import { m } from '#lib/paraglide/messages.js';
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { linkedSocials } from '#lib/home/data/socials.ts';
	import { InView, ScrollProgress, reducedMotion } from '#lib/home/shared/motion.svelte.ts';
	import NightClock from '#lib/home/shared/NightClock.svelte';
	import { SOCIAL_ICON_PATHS } from './icons.ts';
	import { ART_BOXES } from './art.ts';
	import { LEGAL_LINKS, MASCOT_PARTS, SUNRISE_LAYOUT, WALK_FEET_START, mascotSizes, placeVars, rootVars } from './layout.ts';
	import { Walker } from './walk.ts';

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

	// The walk follows the scroll only while the section is on screen and motion is allowed.
	// Progress: 0 when his feet (at the end spot) come into view near the viewport bottom, 1 at the page end, linear
	// in scroll. Measured on the stage, which has no transform.
	const mobile = new MediaQuery('(max-width: 47.99rem)');
	let stage: HTMLElement;
	const walker = new Walker(() => {
		const rect = stage.getBoundingClientRect();
		const feet = rect.top + rect.height * (mobile.current ? mo.walkFeet : d.walkFeet);
		const left = Math.max(0, document.documentElement.scrollHeight - window.innerHeight - window.scrollY);
		// at least a quarter viewport of walking, even if the page end leaves his feet low in the viewport
		const from = Math.min(window.innerHeight * WALK_FEET_START, feet - left + window.innerHeight * 0.25);
		return (from - feet) / Math.max(1, from - feet + left);
	});
	$effect(() => {
		if (reducedMotion.current || !near.current) return;
		walker.start(mobile.current ? mo.walkFrames : d.walkFrames);
		return () => walker.stop();
	});
	const sizes = { legs: mascotSizes(ART_BOXES.walkLegs, 16), body: mascotSizes(ART_BOXES.walkBody), arm: mascotSizes(ART_BOXES.walkArm) };
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

	<div class="stage" aria-hidden="true" bind:this={stage}>
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
		<div class="placed mascot" style={place.mascot} {@attach walker.attach}>
			<div class="figure">
				<div class="leg" style={MASCOT_PARTS.legs}>
					<enhanced:img src="./assets/mascot-walk-legs.webp?w=4000;3120;2240&quality=42" alt="" sizes={sizes.legs} loading="lazy" decoding="async" />
				</div>
				<div class="torso">
					<enhanced:img src="./assets/mascot-walk-body.webp?w=248;200;140;100" alt="" style={MASCOT_PARTS.body} sizes={sizes.body} loading="lazy" decoding="async" />
				</div>
				<div class="leg near" style={MASCOT_PARTS.legs}>
					<enhanced:img src="./assets/mascot-walk-legs.webp?w=4000;3120;2240&quality=42" alt="" sizes={sizes.legs} loading="lazy" decoding="async" />
				</div>
				<div class="torso">
					<enhanced:img src="./assets/mascot-walk-arm.webp?w=98;80;56;40" alt="" class="arm" style={MASCOT_PARTS.arm} sizes={sizes.arm} loading="lazy" decoding="async" />
				</div>
			</div>
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
		--walk-x: var(--d-walk-x);
		--walk-y: var(--d-walk-y);
		--walk-skew: var(--d-walk-skew);
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

	/* Mascot: his full walk canvas at the end of the walk. ./walk.ts writes --walk-p (0 → 1 along the path), --f (atlas
	   column), --dir (facing), --bob and --arm; the defaults on the root are the end pose. Upright on the slope: skewY
	   around the feet keeps verticals vertical and puts both feet on the path line. */
	.mascot {
		translate: calc((1 - var(--walk-p)) * var(--walk-x)) calc((1 - var(--walk-p)) * var(--walk-y));
		transform-origin: var(--pivot);
		transform: skewY(var(--walk-skew)) scaleX(var(--dir));
	}

	.figure,
	.torso {
		position: absolute;
		inset: 0;
	}

	.figure {
		transform-origin: var(--pivot);
	}

	.figure :global(img) {
		position: absolute;
		display: block;
		max-width: none;
	}

	/* bob in master px (the canvas is 1600 px tall); the legs atlas has it baked in */
	.torso {
		translate: 0 calc(var(--bob) * 100% / 1600);
	}

	.torso :global(img.arm) {
		rotate: calc(var(--arm) * 1deg);
	}

	/* One atlas cell: row 0 the far leg (behind the body), row 1 the near leg; one column per frame. */
	.leg {
		position: absolute;
		overflow: hidden;
	}

	.leg :global(img) {
		left: 0;
		top: 0;
		width: 1600%;
		height: 200%;
		translate: calc(var(--f) * -6.25%) 0;
	}

	.leg.near :global(img) {
		translate: calc(var(--f) * -6.25%) -50%;
	}

	/* At rest: a slow breath from the feet (≈ 1–2 px at the head). */
	@media (prefers-reduced-motion: no-preference) {
		.mascot:global(.is-idle) .figure {
			animation: breathe 3.6s ease-in-out infinite;
		}

		.sunrise:not(.is-near) .figure {
			animation-play-state: paused;
		}
	}

	@keyframes breathe {
		50% {
			scale: 1 1.006;
		}
	}

	/* Shiny egg (docs/HOMEPAGE-DEV.md §11): no golden walk art exists, so the shared filter fallback applies. On butter
	   paper its butter glow and cream sparkle vanish, so this section deepens the gold and outlines the sparkle in ochre. */
	:global([data-shiny]) .sunrise .mascot {
		filter: sepia(0.85) saturate(2.4) hue-rotate(-14deg) brightness(1.1) drop-shadow(0 0 0.6rem rgb(226 169 59 / 0.85));
	}

	:global([data-shiny]) .sunrise .mascot::after {
		/* the walk canvas is wider than the figure: keep the sparkle by his head */
		top: 9%;
		right: 38%;
		filter: drop-shadow(0 0 0.12rem rgb(122 78 18 / 0.9)) drop-shadow(0 0 0.4rem rgb(226 169 59 / 0.9));
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
			--walk-skew: var(--m-walk-skew);
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
