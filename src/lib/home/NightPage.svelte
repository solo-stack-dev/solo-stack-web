<!--
	@component
	Homepage frame: fixed sky that follows the night, paper grain, stars, shooting stars, nav + menu overlay, hour rail.
	Sections render as children, in NIGHT_HOURS order.

	`--night` (docs/HOMEPAGE-DEV.md): page scroll progress 0…1 on this wrapper, inherited by every section. Driven by
	`animation-timeline: scroll(root)` where supported and motion is allowed, else by a rAF-throttled scroll listener.
	Sky: one full-viewport layer per hour, each fading in between its measured start and stop (exact linear blend; curve
	rules in night.ts), re-measured on resize. `--dawn` (0…1): progress of the last blend (butter paper).

	Also provides the transition masks of shared/transitions.ts as `url()` vars and the `[data-feather]` helper (below).

	Chrome that follows the art underneath:
	- Nav wordmark and rail hide while the hero covers the top of the viewport.
	- Global shooting stars pause while the hero covers the sky (it has its own); the star field stops twinkling while the
	  hero fills the viewport (its 20 fps full-screen canvas would redraw unseen).
	- Nav and rail switch to dark ink only once sunrise paper is under them, tracked via `#sunrise [data-night-edge]`
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
	import { NIGHT_HOURS, NIGHT_HOUR_ATTR, skyBackground, type NightHourDef, type SectionId } from './night.ts';
	import PaperGrain from './shared/PaperGrain.svelte';
	import ShootingStars from './shared/ShootingStars.svelte';
	import StarField from './shared/StarField.svelte';
	import { reducedMotion } from './shared/motion.svelte.ts';
	import { transitionMaskVars } from './shared/transitions.ts';

	interface Props {
		children: Snippet;
		/** Show the hour dots on the right edge (≥ md). Default true. */
		rail?: boolean;
	}

	let { children, rail = true }: Props = $props();

	/** Fallback when the sunrise night edge has no `data-edge-clear`: fraction of its height below which its ink is gone. */
	const SUNRISE_EDGE_CLEAR = 0.72;

	const labels: Record<SectionId, () => string> = {
		hero: m.home_nav_section_hero,
		making: m.home_nav_section_making,
		game: m.home_nav_section_game,
		'night-shift': m.home_nav_section_nightshift,
		radio: m.home_nav_section_radio,
		cinema: m.home_nav_section_cinema,
		sunrise: m.home_nav_section_sunrise
	};

	const hours: readonly NightHourDef[] = NIGHT_HOURS;
	/** Menu pages: all but Start (the homepage itself; its hours are listed under the pages). */
	const pages = SITE_LINKS.filter((link) => link.id !== 'home');
	/** Sections with their own progress dots: the rail hides while they are active (one indicator at a time). */
	const OWN_PROGRESS = new Set<SectionId>(['making']);
	const maskVars = transitionMaskVars();
	const last = NIGHT_HOURS.length - 1;

	let wrapper: HTMLDivElement;
	let header = $state<HTMLElement>();
	let menu: HTMLDialogElement;
	let menuOpen = $state(false);
	let active = $state<SectionId>('hero');
	// The page loads at the top, so the hero covers the sky (and fills the viewport) until the observers say otherwise.
	let heroCovers = $state(true);
	let heroFills = $state(true);
	let navOnPaper = $state(false);
	let railOnPaper = $state(false);
	// Evenly spaced until measured on the client. stops[k]: hour k fully reached; starts[k]: its blend begins.
	let stops = $state<number[]>(NIGHT_HOURS.map((_, index) => index / last));
	let starts = $state<number[]>(NIGHT_HOURS.map((_, index) => Math.max(0, index - 1) / last));

	const sections = () => Array.from(wrapper.querySelectorAll<HTMLElement>(`[${NIGHT_HOUR_ATTR}]`));
	const byId = (id: SectionId) => wrapper.querySelector<HTMLElement>(`#${id}[${NIGHT_HOUR_ATTR}]`);

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

	// Sunrise: overscroll color, and nav/rail ink that follows the paper under them (not the page progress).
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
			railOnPaper = paperTop < window.innerHeight / 2 - 80;
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
				railOnPaper = false;
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

	// Active hour for the rail and the menu (section crossing the viewport center).
	$effect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) active = entry.target.id as SectionId;
				}
			},
			{ rootMargin: '-50% 0px -50% 0px' }
		);
		for (const element of sections()) observer.observe(element);
		return () => observer.disconnect();
	});

	function openMenu() {
		menu.showModal();
		menuOpen = true;
	}

	function closeMenu() {
		menu.close();
	}

	/** Close the menu and move keyboard focus to the chosen section (the anchor's default action scrolls to it). */
	function goToSection(id: string) {
		closeMenu();
		requestAnimationFrame(() => {
			const section = document.getElementById(id);
			if (!section) return;
			if (!section.hasAttribute('tabindex')) section.setAttribute('tabindex', '-1');
			section.focus({ preventScroll: true });
		});
	}
</script>

<div
	bind:this={wrapper}
	class="night-page"
	data-night-page
	data-hero-covers={heroCovers ? '' : undefined}
	data-rail-away={OWN_PROGRESS.has(active) ? '' : undefined}
	style:--dawn-from={starts[last]}
	style:--dawn-to={stops[last]}
	style={maskVars}
>
	<div class="sky" aria-hidden="true">
		<div class="sky-layer" style:background={skyBackground(hours[0])}></div>
		{#each hours.slice(1) as hour, index (hour.id)}
			<div class="sky-layer is-blend" style:background={skyBackground(hour)} style:--from={starts[index + 1]} style:--to={stops[index + 1]}></div>
		{/each}
		<div class="sky-stars">
			<StarField twinkle={!heroFills && !railOnPaper} />
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
				<!-- The site pages first, large like the subpage phone menu (MobileMenu). Start is left out: this is it, and the hours below
				     are its map. From 48rem the pages are also inline in the bar. -->
				<nav class="menu-pages" aria-label={m.site_nav_label()}>
					<ul>
						{#each pages as link, index (link.id)}
							<li style:--i={index}>
								<a href={siteHref(link)} aria-current={siteCurrent(link, page.url.pathname)} onclick={closeMenu}>{link.label()}</a>
							</li>
						{/each}
					</ul>
				</nav>
				<!-- The night's hours as a compact timeline under them: mono time, the rail's dot on a hairline, the hour's title -->
				<nav class="menu-hours" aria-label={m.home_nav_menu_title()}>
					<ol>
						{#each NIGHT_HOURS as hour, index (hour.id)}
							<li style:--i={pages.length + index}>
								<a href="#{hour.id}" aria-current={active === hour.id ? 'location' : undefined} onclick={() => goToSection(hour.id)}>
									<span class="time label-sm">{hour.time}</span>
									<span class="tick" aria-hidden="true"></span>
									<span class="title">{labels[hour.id]()}</span>
								</a>
							</li>
						{/each}
					</ol>
				</nav>
			</div>
		</div>
	</dialog>

	{#if rail}
		<nav class="rail" aria-label={m.home_nav_rail_label()} data-tone={railOnPaper ? 'paper' : undefined}>
			<ol>
				{#each NIGHT_HOURS as hour (hour.id)}
					<li>
						<a href="#{hour.id}" aria-label={labels[hour.id]()} aria-current={active === hour.id ? 'location' : undefined}>
							<span class="rail-time label-sm" aria-hidden="true">{hour.time}</span>
							<span class="rail-dot" aria-hidden="true"></span>
						</a>
					</li>
				{/each}
			</ol>
		</nav>
	{/if}

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

	/* Hours: the secondary list, a compact timeline (mono time, the rail's dot on a hairline, the hour's title) */
	.menu-hours {
		margin-top: clamp(1.25rem, 4.5vh, 3rem);
	}

	.menu-hours a {
		display: grid;
		grid-template-columns: auto 0.75rem auto;
		align-items: center;
		column-gap: clamp(0.6rem, 2.5vw, 0.85rem);
		width: fit-content;
		min-height: clamp(2.25rem, 5.4vh, 2.75rem);
		transition: color var(--dur-hover) ease;
	}

	.time {
		color: color-mix(in oklab, var(--color-cream) 60%, transparent);
		transition: color var(--dur-hover) ease;
	}

	/* One cell per row, full height: their hairlines join into the night's line, from the first dot to the last */
	.tick {
		position: relative;
		align-self: stretch;
	}

	.tick::before {
		content: '';
		position: absolute;
		top: 0;
		bottom: 0;
		left: 50%;
		width: 1px;
		translate: -50% 0;
		background: color-mix(in oklab, var(--color-cream) 22%, transparent);
	}

	.menu-hours li:first-child .tick::before {
		top: 50%;
	}

	.menu-hours li:last-child .tick::before {
		bottom: 50%;
	}

	.tick::after {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		width: 0.35rem;
		height: 0.35rem;
		translate: -50% -50%;
		border-radius: 999px;
		background: currentColor;
		opacity: 0.55;
		transition:
			opacity var(--dur-hover),
			scale var(--dur-hover),
			background-color var(--dur-hover);
	}

	.title {
		position: relative;
		font-family: var(--font-display);
		/* every title on one line from 320px */
		font-size: clamp(0.9375rem, min(5vw, 0.95rem + 0.5vw), 1.5rem);
		font-weight: 800;
		line-height: 1.15;
		letter-spacing: -0.02em;
	}

	/* the swash, small: keyboard focus only (the current hour has its dot) */
	.title::after {
		content: '';
		position: absolute;
		left: -0.05em;
		right: -0.1em;
		bottom: -0.2em;
		height: 0.3rem;
		background: var(--focus-ring);
		mask: var(--ink-underline) center / 100% 100% no-repeat;
		scale: 0 1;
		transform-origin: left;
		transition: scale var(--dur-state) var(--ease-settle);
	}

	.menu-hours a:hover,
	.menu-hours a[aria-current],
	.menu-hours a:hover .time,
	.menu-hours a[aria-current] .time {
		color: var(--color-butter);
	}

	.menu-hours a:hover .tick::after {
		opacity: 1;
	}

	.menu-hours a[aria-current] .tick::after {
		opacity: 1;
		scale: 1.6;
		box-shadow: var(--glow-sm);
	}

	.menu-hours a:focus-visible {
		outline: none;
		color: var(--color-butter);
		filter: drop-shadow(0 0 0.45rem var(--focus-halo));
	}

	.menu-hours a:focus-visible .title::after {
		scale: 1 1;
	}

	/* Short landscape screens (phones turned sideways): pages and hours side by side, so the overlay still fits without scrolling */
	@media (orientation: landscape) and (max-height: 32rem) {
		.menu-body {
			display: grid;
			grid-template-columns: auto auto;
			justify-content: start;
			column-gap: clamp(2.5rem, 9vw, 7rem);
		}

		.menu-hours {
			margin-top: 0;
		}
	}

	@media (prefers-reduced-motion: no-preference) {
		.menu[open] {
			animation: menu-in var(--dur-state) var(--ease-settle);
		}

		/* the pages, then the hours, rise in one after another (as in MobileMenu) */
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

	/* Rail ----------------------------------------------------------------------------------------------------- */

	/* Quiet by design: time shows on hover/focus only; only the dots take pointer events, so the art underneath (moon,
	   hotspots) stays clickable. */
	.rail {
		position: fixed;
		z-index: 4;
		top: 50%;
		/* outside the gutter, which belongs to copy and controls */
		right: clamp(0.25rem, 0.9vw, 0.9rem);
		translate: 0 -50%;
		display: none;
		color: var(--color-cream);
		pointer-events: none;
		transition:
			opacity var(--dur-state) ease,
			color var(--dur-state) ease,
			visibility 0s;
	}

	.rail[data-tone='paper'] {
		color: var(--color-night);
	}

	.rail[data-tone='paper'] .rail-time {
		text-shadow: var(--halo-butter);
	}

	[data-hero-covers] .rail,
	[data-rail-away] .rail {
		opacity: 0;
		visibility: hidden;
		transition:
			opacity var(--dur-state) ease,
			visibility 0s var(--dur-state);
	}

	@media (min-width: 48rem) {
		.rail {
			display: block;
		}
	}

	.rail ol {
		display: grid;
		gap: 0.2rem;
	}

	.rail a {
		position: relative;
		display: grid;
		place-items: center;
		width: 1.5rem;
		height: 1.5rem;
		pointer-events: auto;
	}

	.rail-dot {
		width: 0.35rem;
		height: 0.35rem;
		border-radius: 999px;
		background: currentColor;
		/* a hairline of the opposite ink keeps the dot visible on bright art */
		box-shadow: 0 0 0 1px color-mix(in oklab, var(--color-ink) 35%, transparent);
		opacity: 0.45;
		transition:
			opacity var(--dur-hover),
			scale var(--dur-hover);
	}

	.rail-time {
		position: absolute;
		top: 50%;
		right: 100%;
		translate: 0 -50%;
		padding-right: 0.35rem;
		color: inherit;
		text-shadow: var(--halo-ink);
		white-space: nowrap;
		pointer-events: none;
		opacity: 0;
		transition: opacity var(--dur-hover);
	}

	.rail a:hover .rail-time,
	.rail a:focus-visible .rail-time {
		opacity: 1;
	}

	.rail a:hover .rail-dot,
	.rail a:focus-visible .rail-dot {
		opacity: 1;
	}

	.rail a[aria-current] .rail-dot {
		opacity: 1;
		scale: 1.6;
	}
</style>
