<!--
	@component
	06:00 Sunrise footer (docs/HANDOFF-HOMEPAGE.md §5.7). The night retreats upward as a ragged watercolor edge and
	reveals butter paper, a misty valley with the rising sun, the mascot walking the cliff path with his laptop, and a
	steaming coffee. Wordmark, legal links, and social icons sit on the paper at the very end of the page.

	Scroll: `--sunrise` (0 → 1) is driven by a CSS scroll-driven animation (`view()` timeline of this footer, from its
	top entering the viewport to the page end). Fallback without `animation-timeline` support: ScrollProgress writes it.
	Reduced motion (or neither): the registered initial value 1 = the final sunrise, static.
	The mascot steps through a 4-frame walk cycle by scroll distance while the page is scrolling, and rests on frame 1.
	All rects live in ./layout.ts.
-->
<script lang="ts">
	import { on } from 'svelte/events';
	import { m } from '#lib/paraglide/messages.js';
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { linkedSocials } from '#lib/home/data/socials.ts';
	import { InView, ScrollProgress, reducedMotion } from '#lib/home/shared/motion.svelte.ts';
	import NightClock from '#lib/home/shared/NightClock.svelte';
	import walk1 from './assets/mascot-sunrise-walk@1.png?enhanced';
	import walk2 from './assets/mascot-sunrise-walk@2.png?enhanced';
	import walk3 from './assets/mascot-sunrise-walk@3.png?enhanced';
	import walk4 from './assets/mascot-sunrise-walk@4.png?enhanced';
	import cliffPath from './assets/sunrise-cliff-path.png?enhanced';
	import coffee from './assets/sunrise-coffee.png?enhanced';
	import nightEdge from './assets/sunrise-night-edge.png?enhanced';
	import skyMobile from './assets/sunrise-sky-mobile.png?enhanced';
	import sky from './assets/sunrise-sky.png?enhanced';
	import valley from './assets/sunrise-valley.png?enhanced';
	import { SOCIAL_ICON_PATHS } from './icons.ts';
	import { LEGAL_LINKS, SUNRISE_LAYOUT, WALK, nightEdgeVars, placeVars } from './layout.ts';

	const socials = linkedSocials();
	const walkFrames = [walk1, walk2, walk3, walk4];
	const legalLabels = {
		imprint: m.home_sunrise_legal_imprint,
		privacy: m.home_sunrise_legal_privacy,
		contact: m.home_sunrise_legal_contact
	};

	const { desktop: d, mobile: mo } = SUNRISE_LAYOUT;
	const place = {
		sun: placeVars(d.sun, mo.sun),
		valley: placeVars(d.valley, mo.valley),
		cliffPath: placeVars(d.cliffPath, mo.cliffPath),
		coffee: placeVars(d.coffee, mo.coffee),
		steam: placeVars(d.steam, mo.steam),
		mascot: placeVars(d.mascot, mo.mascot)
	};
	const rootVars = `--walk-start: ${WALK.start}; --walk-distance: ${WALK.distance}%; --walk-steps: ${WALK.steps}; ${nightEdgeVars()}`;

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

	// The walk cycle only steps while the page is scrolling; at rest the mascot stands on frame 1.
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
	style={rootVars}
	aria-labelledby="home-sunrise-title"
	{@attach through.attach}
	{@attach near.attach}
>
	<h2 id="home-sunrise-title" class="sr-only">{m.home_sunrise_title()}</h2>

	<div class="sky" aria-hidden="true">
		<enhanced:img src={sky} alt="" class="is-desktop" sizes="100vw" loading="lazy" decoding="async" />
		<enhanced:img src={skyMobile} alt="" class="is-mobile" sizes="100vw" loading="lazy" decoding="async" />
	</div>

	<div class="stage" aria-hidden="true">
		<div class="placed sun" style={place.sun}></div>
		<enhanced:img src={valley} alt="" class="placed art" style={place.valley} sizes="(min-width: 48rem) 100vw, 200vw" loading="lazy" decoding="async" />
		<enhanced:img src={cliffPath} alt="" class="placed art" style={place.cliffPath} sizes="(min-width: 48rem) 66vw, 140vw" loading="lazy" decoding="async" />
		<enhanced:img src={coffee} alt="" class="placed art" style={place.coffee} sizes="(min-width: 48rem) 9vw, 17vw" loading="lazy" decoding="async" />
		<svg class="placed steam" style={place.steam} viewBox="0 0 40 120" preserveAspectRatio="none">
			<path d="M15 118 C 7 100, 23 88, 15 70 S 7 40, 17 18" />
			<path d="M25 118 C 33 98, 17 84, 27 64 S 35 36, 25 10" />
			<path d="M20 118 C 14 104, 26 92, 20 78 S 14 56, 21 38" />
		</svg>
		<div class="placed mascot" style={place.mascot}>
			<div class="strip">
				{#each walkFrames as frame, index (index)}
					<enhanced:img src={frame} alt="" sizes="(min-width: 48rem) 11vw, 24vw" loading="lazy" decoding="async" />
				{/each}
			</div>
		</div>
	</div>

	<div class="night" aria-hidden="true">
		<enhanced:img src={nightEdge} alt="" sizes="(min-width: 48rem) 100vw, 260vw" loading="lazy" decoding="async" />
	</div>

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
		--ink-fade: #1c1d1d;
		--night-clock-color: color-mix(in oklab, var(--color-night) 85%, transparent);
		--night-clock-top: clamp(9rem, 30svh, 16rem);
		--walk-t: clamp(0, (var(--sunrise) - var(--walk-start)) / (1 - var(--walk-start)), 1);
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

	.sky {
		position: absolute;
		inset: 0;
		opacity: clamp(0, var(--sunrise) * 1.6, 1);
	}

	.sky :global(img) {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.is-mobile {
		display: none;
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
	}

	.art {
		height: auto;
	}

	/* The sun climbs a little behind the valley as the night retreats. */
	.sun {
		border-radius: 50%;
		background: radial-gradient(circle, #fff6d6 0 52%, rgb(255 241 196 / 0.75) 60%, rgb(255 236 170 / 0) 71%);
		box-shadow: 0 0 120px 50px rgb(255 238 180 / 0.35);
		translate: 0 calc((1 - var(--sunrise)) * 55%);
		opacity: calc(0.4 + 0.6 * var(--sunrise));
	}

	.stage > :global(img) {
		position: absolute;
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

	/* Mascot: walks `--walk-distance` of his width while --sunrise goes walk-start → 1. */
	.mascot {
		height: auto;
		aspect-ratio: 280 / 495;
		overflow: hidden;
		translate: calc((var(--walk-t) - 1) * var(--walk-distance)) 0;
	}

	.strip {
		display: flex;
		width: 400%;
		--frame: 0;
		translate: calc(var(--frame) * -25%) 0;
	}

	.is-walking .strip {
		/* frame-stepping by scroll distance: a new frame every 1 / walk-steps of the walk */
		--frame: mod(round(down, var(--walk-t) * var(--walk-steps), 1), 4);
	}

	/* enhanced:img renders <picture><img></picture>: the picture is the flex item */
	.strip > :global(picture) {
		flex: none;
		width: 25%;
	}

	.strip :global(img) {
		display: block;
		width: 100%;
		height: auto;
	}

	/* The night retreats upward: a ragged watercolor wash, solid ink above it. */
	.night {
		position: absolute;
		top: 0;
		left: var(--dx);
		width: var(--dw);
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
		}

		.is-desktop {
			display: none;
		}

		.is-mobile {
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
			left: var(--mx);
			width: var(--mw);
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
