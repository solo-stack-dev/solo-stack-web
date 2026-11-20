<!--
	@component
	Homepage frame: fixed sky that follows the night, paper grain, stars, shooting stars, nav + phone menu overlay.
	Sections render as children, in NIGHT_HOURS order.

	`--night` (docs/HOMEPAGE-DEV.md): page scroll progress 0…1 on this wrapper, inherited by every section. Driven by
	`animation-timeline: scroll(root)` where supported and motion is allowed, else by a rAF-throttled scroll listener.
	Sky: one full-viewport layer per hour, each fading in between its measured start and stop (exact linear blend; curve
	rules in night.ts), re-measured on resize. `--dawn` (0…1): progress of the last blend (butter paper).

	Also provides the transition masks of shared/transitions.ts as `url()` vars and the `[data-feather]` helper (below).

	Chrome that follows the art underneath:
	- The nav wordmark hides while the hero covers the top of the viewport.
	- Global shooting stars pause while the hero covers the sky (it has its own); the star field stops twinkling while the
	  hero fills the viewport (its 20 fps full-screen canvas would redraw unseen).
	- The nav switches to dark ink only once sunrise paper is under it, tracked via `#sunrise [data-night-edge]`
	  (fallback `#sunrise .night`).
	- `html[data-night-end]` while the sunrise is on screen: bottom overscroll shows butter paper, top overscroll night.
-->
<script lang="ts">
	import { untrack, type Snippet } from 'svelte';
	import { on } from 'svelte/events';
	import { page } from '$app/state';
	import SiteNav from '#lib/components/site/SiteNav.svelte';
	import { SITE_LINKS, siteCurrent, siteHref } from '#lib/components/site/links.ts';
	import { m } from '#lib/paraglide/messages.js';
	import Eggs from './eggs/Eggs.svelte';
	import { NIGHT_HOURS, NIGHT_HOUR_ATTR, skyBackground, type NightHourDef } from './night.ts';
	import PaperGrain from './shared/PaperGrain.svelte';
	import ShootingStars from './shared/ShootingStars.svelte';
	import StarField from './shared/StarField.svelte';
	import { reducedMotion } from './shared/motion.svelte.ts';
	import { belowFold } from './shared/deferred.svelte.ts';
	import { TRANSITION_MASKS, transitionMaskVars } from './shared/transitions.ts';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	/** Fallback when the sunrise night edge has no `data-edge-clear`: fraction of its height below which its ink is gone. */
	const SUNRISE_EDGE_CLEAR = 0.72;

	const hours: readonly NightHourDef[] = NIGHT_HOURS;
	/** Menu pages (phones; from 48rem they are inline in the bar): all but Start, the homepage itself. */
	const pages = SITE_LINKS.filter((link) => link.id !== 'home');
	const maskVars = transitionMaskVars({ deferred: true });
	// Only the night shift uses this mask: it loads after the hero moon (belowFold); without JS the <noscript> style sets it.
	const washSpreadDown = `url("${TRANSITION_MASKS.washSpreadDown}")`;
	$effect(() => belowFold.arm());
	const last = NIGHT_HOURS.length - 1;

	let wrapper: HTMLDivElement;
	let header = $state<HTMLElement>();
	let menu: HTMLDialogElement;
	let menuOpen = $state(false);
	// The page loads at the top, so the hero covers the sky (and fills the viewport) until the observers say otherwise.
	let heroCovers = $state(true);
	let heroFills = $state(true);
	let navOnPaper = $state(false);
	/** Butter paper has reached the middle of the viewport: the stars have faded out and stop twinkling. */
	let skyOnPaper = $state(false);
	// Evenly spaced until measured on the client. stops[k]: hour k fully reached; starts[k]: its blend begins.
	let stops = $state<number[]>(NIGHT_HOURS.map((_, index) => index / last));
	let starts = $state<number[]>(NIGHT_HOURS.map((_, index) => Math.max(0, index - 1) / last));

	const sections = () => Array.from(wrapper.querySelectorAll<HTMLElement>(`[${NIGHT_HOUR_ATTR}]`));
	const byId = (id: string) => wrapper.querySelector<HTMLElement>(`#${id}[${NIGHT_HOUR_ATTR}]`);

	// stop = scroll progress at which the section's center meets the viewport center.
	function measureStops() {
		const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
		const elements = sections();
		if (elements.length !== NIGHT_HOURS.length) return;
		let previous = 0;
		const nextStarts = [0];
		const nextStops = elements.map((element, index) => {
			if (index === 0) return 0;
			const top = element.getBoundingClientRect().top + window.scrollY;
			const center = top + element.offsetHeight / 2 - window.innerHeight / 2;
			const entered = (top - window.innerHeight) / maxScroll;
			const start = hours[index].from === 'enter' ? Math.max(previous, entered) : previous;
			previous = Math.max(previous, Math.min(1, center / maxScroll));
			nextStarts.push(Math.min(start, previous));
			return previous;
		});
		// New arrays re-render the sky layers and `--dawn-from/to`, which every element inherits: write only real changes.
		if (!sameValues(stops, nextStops)) stops = nextStops;
		if (!sameValues(starts, nextStarts)) starts = nextStarts;
	}

	const sameValues = (a: number[], b: number[]) => a.length === b.length && a.every((value, index) => value === b[index]);

	$effect(() => {
		// One measurement per frame: a window resize also fires the ResizeObserver.
		let frame = 0;
		const schedule = () => {
			if (!frame)
				frame = requestAnimationFrame(() => {
					frame = 0;
					measureStops();
				});
		};
		const observer = new ResizeObserver(schedule);
		observer.observe(wrapper);
		const offResize = on(window, 'resize', schedule, { passive: true });
		// untracked: `stops`/`starts` must not become dependencies
		untrack(measureStops);
		return () => {
			observer.disconnect();
			offResize();
			cancelAnimationFrame(frame);
		};
	});

	// Fallback --night driver: no scroll timelines, or reduced motion (the global guard would freeze the animation).
	$effect(() => {
		const cssDriven = CSS.supports('animation-timeline: scroll()') && !reducedMotion.current;
		if (cssDriven) {
			wrapper.style.removeProperty('--night');
			return;
		}
		let frame = 0;
		const update = () => {
			frame = 0;
			const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
			wrapper.style.setProperty('--night', Math.min(1, Math.max(0, window.scrollY / maxScroll)).toFixed(4));
		};
		const schedule = () => {
			if (!frame) frame = requestAnimationFrame(update);
		};
		const offScroll = on(window, 'scroll', schedule, { passive: true });
		const offResize = on(window, 'resize', schedule, { passive: true });
		update();
		return () => {
			offScroll();
			offResize();
			cancelAnimationFrame(frame);
		};
	});

	// heroCovers = hero in the top 40 % of the viewport. Also pauses global shooting stars: unseen behind the opaque hero,
	// their events would make the hero mascot look up at nothing.
	$effect(() => {
		const hero = byId('hero');
		if (!hero) {
			heroCovers = false;
			heroFills = false;
			return;
		}
		const observer = new IntersectionObserver(([entry]) => (heroCovers = entry.isIntersecting), { rootMargin: '0px 0px -60% 0px' });
		// The hero starts at the page top, so reaching the bottom 1 % of the viewport means it fills it.
		const fills = new IntersectionObserver(([entry]) => (heroFills = entry.isIntersecting), { rootMargin: '-99% 0px 0px 0px' });
		observer.observe(hero);
		fills.observe(hero);
		return () => {
			observer.disconnect();
			fills.disconnect();
		};
	});

	// Sunrise: overscroll color, and nav ink that follows the paper under it (not the page progress).
	$effect(() => {
		const sunrise = byId('sunrise');
		if (!sunrise) return;
		const root = document.documentElement;
		const edge = sunrise.querySelector<HTMLElement>('[data-night-edge]') ?? sunrise.querySelector<HTMLElement>('.night');
		const clear = Number(edge?.dataset.edgeClear) || SUNRISE_EDGE_CLEAR;
		let frame = 0;
		let stopTracking: (() => void) | undefined;

		const update = () => {
			frame = 0;
			const section = sunrise.getBoundingClientRect();
			const box = edge?.getBoundingClientRect();
			// The paper starts below the cleared part of the night edge (or at the section top without an edge).
			const paperTop = Math.max(section.top, box ? box.top + box.height * clear : section.top);
			navOnPaper = paperTop < (header?.offsetHeight ?? 0) * 0.75;
			skyOnPaper = paperTop < window.innerHeight / 2 - 80;
		};
		const schedule = () => {
			if (!frame) frame = requestAnimationFrame(update);
		};

		const observer = new IntersectionObserver(([entry]) => {
			stopTracking?.();
			stopTracking = undefined;
			if (entry.isIntersecting) {
				root.dataset.nightEnd = '';
				const offs = [on(window, 'scroll', schedule, { passive: true }), on(window, 'resize', schedule, { passive: true }), on(window, 'scrollend', schedule)];
				stopTracking = () => offs.forEach((off) => off());
				update();
			} else {
				delete root.dataset.nightEnd;
				navOnPaper = false;
				skyOnPaper = false;
			}
		});
		observer.observe(sunrise);
		return () => {
			observer.disconnect();
			stopTracking?.();
			cancelAnimationFrame(frame);
			delete root.dataset.nightEnd;
		};
	});

	function openMenu() {
		menu.showModal();
		menuOpen = true;
	}

	function closeMenu() {
		menu.close();
	}
</script>

<svelte:head>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- build-time asset URL -->
	<noscript>{@html `<style>[data-night-page]{--wash-spread-down:${washSpreadDown} !important}</style>`}</noscript>
</svelte:head>

<div
	bind:this={wrapper}
	class="night-page"
	data-night-page
	data-hero-covers={heroCovers ? '' : undefined}
	style:--dawn-from={starts[last]}
	style:--dawn-to={stops[last]}
	style={maskVars}
	style:--wash-spread-down={belowFold.rest ? washSpreadDown : 'none'}
>
	<div class="sky" aria-hidden="true">
		<div class="sky-layer" style:background={skyBackground(hours[0])}></div>
		{#each hours.slice(1) as hour, index (hour.id)}
			<div class="sky-layer is-blend" style:background={skyBackground(hour)} style:--from={starts[index + 1]} style:--to={stops[index + 1]}></div>
		{/each}
		<div class="sky-stars">
			<StarField twinkle={!heroFills && !skyOnPaper} />
			<ShootingStars enabled={!heroCovers} />
		</div>
	</div>

	<a class="skip-link" href="#main">{m.home_nav_skip()}</a>

	<SiteNav variant="night" bind:ref={header} tone={navOnPaper ? 'paper' : 'night'} hideWordmark={heroCovers} wordmarkHref="#hero">
		{#snippet actions()}
			<button
				type="button"
				class={['menu-button swash-focus', menuOpen && 'is-open']}
				aria-haspopup="dialog"
				aria-expanded={menuOpen}
				aria-label={m.site_nav_menu_open()}
				onclick={openMenu}
			>
				<span class="menu-icon" aria-hidden="true"></span>
			</button>
		{/snippet}
	</SiteNav>

	<dialog bind:this={menu} class="menu" aria-label={m.site_nav_menu_title()} onclose={() => (menuOpen = false)}>
		<div class="menu-inner">
			<button type="button" class="menu-close swash-focus" aria-label={m.home_nav_menu_close()} onclick={closeMenu}>
				<span class="close-icon" aria-hidden="true"></span>
			</button>
			<div class="menu-body">
				<!-- The site pages, large like the subpage phone menu (MobileMenu). Start is left out: this is it. Phones only: from 48rem
				     the pages are inline in the bar and the menu button is hidden. -->
				<nav class="menu-pages" aria-label={m.site_nav_label()}>
					<ul>
						{#each pages as link, index (link.id)}
							<li style:--i={index}>
								<a href={siteHref(link)} aria-current={siteCurrent(link, page.url.pathname)} onclick={closeMenu}>{link.label()}</a>
							</li>
						{/each}
					</ul>
				</nav>
			</div>
		</div>
	</dialog>

	<main id="main" class="night-main">
		{@render children()}
	</main>

	<Eggs />

	<PaperGrain />
</div>

<style>
	.night-page {
		position: relative;
		isolation: isolate;
		/* Progress of the last sky blend (butter paper): 0 through the night, 1 at the page end */
		--dawn: clamp(0, (var(--night) - var(--dawn-from, 0.9)) / max(0.0001, var(--dawn-to, 1) - var(--dawn-from, 0.9)), 1);
		/* Ink readable on the sky: cream at night, anthracite once the paper is bright (06:00) */
		--night-ink: color-mix(in oklab, var(--color-cream), var(--color-night) calc(clamp(0, (var(--dawn) - 0.6) * 2.5, 1) * 100%));
		color: var(--color-cream);
	}

	/* Feathered plate edges (docs/HOMEPAGE-DEV.md §6.5): painted soft edge over the top `--feather-top` / bottom
	   `--feather-bottom` (lengths, default 0), solid between (1px overlap avoids a hairline). Owns the element's `mask`. */
	.night-page :global([data-feather]) {
		mask:
			var(--feather-up) top / 100% var(--feather-top, 0px) no-repeat,
			linear-gradient(#000 0 0) left 0 top calc(var(--feather-top, 0px) - 1px) / 100% calc(100% - var(--feather-top, 0px) - var(--feather-bottom, 0px) + 2px) no-repeat,
			var(--feather-down) bottom / 100% var(--feather-bottom, 0px) no-repeat;
	}

	@supports (animation-timeline: scroll()) {
		@media (prefers-reduced-motion: no-preference) {
			.night-page {
				animation: night-progress linear both;
				animation-timeline: scroll(root block);
			}
		}
	}

	@keyframes night-progress {
		from {
			--night: 0;
		}
		to {
			--night: 1;
		}
	}

	/* Sky ------------------------------------------------------------------------------------------------------ */

	.sky {
		position: fixed;
		inset: 0;
		z-index: 0;
		pointer-events: none;
	}

	.sky-layer {
		position: absolute;
		inset: 0;
	}

	.is-blend {
		opacity: clamp(0, (var(--night) - var(--from)) / max(0.0001, var(--to) - var(--from)), 1);
	}

	.sky-stars {
		position: absolute;
		inset: 0;
		/* Stars fade in after the hero and retreat as the butter paper arrives */
		opacity: calc(min(1, 0.55 + var(--night) * 3) * (1 - var(--dawn)));
	}

	.night-main {
		position: relative;
		z-index: 1;
		/* Mist strips are wider than the page; without this, phones zoom out to fit them. `clip`, not `hidden`: no scroll
		   container, so sticky stages keep working. */
		overflow-x: clip;
	}

	.night-page > :global(.paper-grain) {
		z-index: 3;
	}

	/* Nav ------------------------------------------------------------------------------------------------------ */

	.skip-link {
		position: fixed;
		z-index: 5;
		top: 0.75rem;
		left: 50%;
		translate: -50% -200%;
		padding: 0.5rem 1rem;
		border-radius: 999px;
		background: var(--color-butter);
		color: var(--color-night);
		font-weight: 600;
	}

	.skip-link:focus-visible {
		translate: -50% 0;
	}

	.menu-button,
	.menu-close {
		display: grid;
		place-items: center;
		width: 2.75rem;
		height: 2.75rem;
		border-radius: 999px;
		color: inherit;
		cursor: pointer;
	}

	.menu-button,
	.menu-close {
		transition: color var(--dur-hover) ease;
	}

	/* From 48rem the pages are inline in the bar, so the overlay (which only lists them) has no button */
	@media (min-width: 48rem) {
		.menu-button {
			display: none;
		}
	}

	.menu-button:hover,
	.menu-close:hover {
		color: var(--color-butter);
	}

	/* While the overlay is open its close button stands in this place: the trigger steps back (opacity, not visibility, so
	   the dialog can hand focus back to it on close) */
	.menu-button.is-open {
		opacity: 0;
	}

	:global(.site-nav[data-tone='paper']) .menu-button:hover {
		color: inherit;
		opacity: 0.7;
	}

	.menu-icon,
	.menu-icon::after {
		display: block;
		width: 1.4rem;
		height: 2px;
		border-radius: 2px;
		background: currentColor;
	}

	.menu-icon {
		position: relative;
		translate: 0 -4px;
	}

	.menu-icon::after {
		content: '';
		position: absolute;
		width: 0.95rem;
		right: 0;
		top: 8px;
	}

	.close-icon {
		position: relative;
		width: 1.4rem;
		height: 1.4rem;
	}

	.close-icon::before,
	.close-icon::after {
		content: '';
		position: absolute;
		top: 50%;
		left: 0;
		width: 100%;
		height: 2px;
		border-radius: 2px;
		background: currentColor;
		rotate: 45deg;
	}

	.close-icon::after {
		rotate: -45deg;
	}

	/* Menu overlay --------------------------------------------------------------------------------------------- */

	.menu {
		width: 100%;
		max-width: none;
		height: 100%;
		max-height: none;
		margin: 0;
		padding: 0;
		border: 0;
		/* Opaque night ink with a low dusk glow; the blur keeps any light that shows through from forming shapes */
		background:
			radial-gradient(110% 55% at 85% -10%, color-mix(in oklab, var(--color-dusk) 70%, transparent), transparent 70%),
			color-mix(in oklab, var(--color-ink) 97%, transparent);
		backdrop-filter: blur(1.25rem) saturate(0.7);
		color: var(--color-cream);
		--focus-ring: var(--color-butter);
		--focus-halo: color-mix(in oklab, var(--color-butter) 55%, transparent);
	}

	.menu::backdrop {
		background: transparent;
	}

	.menu-inner {
		position: relative;
		display: flex;
		flex-direction: column;
		min-height: 100%;
		/* clear of the close button's row on top */
		padding: calc(2 * var(--nav-pad-y) + 2.75rem) clamp(var(--page-gutter), 8vw, 8rem) clamp(1.25rem, 4vh, 3rem);
	}

	/* Centered in the room left; auto margins never go negative, so on short screens it starts at the top and scrolls */
	.menu-body {
		margin-block: auto;
	}

	/* Exactly where the menu button sits in the nav bar */
	.menu-close {
		position: absolute;
		top: var(--nav-pad-y);
		right: var(--page-gutter);
	}

	/* Pages: the primary navigation, set like MobileMenu's (display face, large, the bar's swash under the current one) */
	.menu-pages ul {
		display: grid;
		gap: clamp(0rem, 1vh, 0.75rem);
	}

	.menu-pages a {
		position: relative;
		display: inline-flex;
		align-items: center;
		min-height: 3.5rem;
		font-family: var(--font-display);
		font-size: clamp(2.75rem, min(14vw, 10vh), 5.5rem);
		font-weight: 900;
		line-height: 1;
		letter-spacing: var(--tracking-wordmark);
		transition: color var(--dur-hover) ease;
	}

	.menu-pages a::after {
		content: '';
		position: absolute;
		left: -0.05em;
		right: -0.1em;
		bottom: -0.1em;
		height: 0.2em;
		background: var(--color-butter);
		mask: var(--ink-underline) center / 100% 100% no-repeat;
		scale: 0 1;
		transform-origin: left;
		transition: scale var(--dur-state) var(--ease-settle);
	}

	.menu-pages a[aria-current]::after {
		scale: 1 1;
	}

	.menu-pages a:hover {
		color: var(--color-butter);
	}

	/* Keyboard focus: the swash at full strength, heavier than the current page's, and a soft light, not a box */
	.menu-pages a:focus-visible {
		outline: none;
		color: var(--color-butter);
		filter: drop-shadow(0 0 0.5rem var(--focus-halo));
	}

	.menu-pages a:focus-visible::after {
		scale: 1 1;
		height: 0.26em;
	}

	@media (prefers-reduced-motion: no-preference) {
		.menu[open] {
			animation: menu-in var(--dur-state) var(--ease-settle);
		}

		/* the pages rise in one after another (as in MobileMenu) */
		.menu[open] li {
			animation: menu-rise var(--dur-reveal) var(--ease-settle) both;
			animation-delay: calc(60ms + var(--i) * 35ms);
		}
	}

	@keyframes menu-in {
		from {
			opacity: 0;
		}
	}

	@keyframes menu-rise {
		from {
			opacity: 0;
			translate: 0 0.75rem;
		}
	}
</style>
