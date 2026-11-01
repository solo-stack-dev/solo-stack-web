<!--
	@component
	The homepage frame: one fixed painted sky whose color follows the night, paper grain, stars, shooting stars,
	the floating nav (wordmark + menu overlay), and the hour rail. Sections render as children, in NIGHT_HOURS order.

	The `--night` contract (docs/HOMEPAGE-DEV.md): page scroll progress 0…1 on this wrapper, inherited by every section.
	- Scroll-driven animation (`animation-timeline: scroll(root)`) where supported and motion is allowed.
	- Otherwise (no support, or reduced motion): a passive, rAF-throttled scroll listener writes it inline.
	The sky is a stack of full-viewport color layers; layer k fades in between its measured start and stop, so the
	visible color is an exact linear blend of neighboring hours. Stops are anchored to the real section positions
	(section center at viewport center; hours with `from: 'enter'` start blending when their section enters the
	viewport), re-measured on resize. `--dawn` (0…1) is the progress of the last blend (butter paper); `--sky-now` is the
	current flat sky color (used by the Seam bands between sections).

	Chrome that follows the art underneath:
	- The nav wordmark and the rail hide while the hero (with its giant wordmark and moon) covers the top of the viewport.
	- Global shooting stars pause while the opaque hero covers the sky (the hero has its own).
	- Nav and rail switch to dark ink only once the sunrise paper is really under them: the sunrise night edge
	  (`#sunrise [data-night-edge]`, falling back to `#sunrise .night`) is tracked while the sunrise is on screen.
	- `html[data-night-end]` while the sunrise is on screen: bottom overscroll shows butter paper, top overscroll night.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { on } from 'svelte/events';
	import { m } from '#lib/paraglide/messages.js';
	import Eggs from './eggs/Eggs.svelte';
	import { NIGHT_HOURS, NIGHT_HOUR_ATTR, skyBackground, type NightHourDef, type SectionId } from './night.ts';
	import PaperGrain from './shared/PaperGrain.svelte';
	import ShootingStars from './shared/ShootingStars.svelte';
	import StarField from './shared/StarField.svelte';
	import { reducedMotion } from './shared/motion.svelte.ts';

	interface Props {
		children: Snippet;
		/** Show the hour dots on the right edge (≥ md). Default true. */
		rail?: boolean;
	}

	let { children, rail = true }: Props = $props();

	/** Fraction of the sunrise night edge's height below which its ink is gone (alpha profile of sunrise-night-edge.png). */
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
	const last = NIGHT_HOURS.length - 1;

	let wrapper: HTMLDivElement;
	let header: HTMLElement;
	let menu: HTMLDialogElement;
	let menuOpen = $state(false);
	let active = $state<SectionId>('hero');
	// The page loads at the top: the hero covers the sky until the observer says otherwise.
	let heroCovers = $state(true);
	let navOnPaper = $state(false);
	let railOnPaper = $state(false);
	// Evenly spaced until measured on the client. stops[k]: hour k fully reached; starts[k]: its blend begins.
	let stops = $state<number[]>(NIGHT_HOURS.map((_, index) => index / last));
	let starts = $state<number[]>(NIGHT_HOURS.map((_, index) => Math.max(0, index - 1) / last));

	// The live flat sky color as one CSS value (same blend as the layer stack, without the horizon gradients), for
	// anything that has to match the sky exactly, e.g. the Seam bands between sections.
	const skyNow = $derived(
		hours
			.slice(1)
			.reduce(
				(color, hour, index) =>
					`color-mix(in srgb, ${color}, ${hour.sky} calc(clamp(0, (var(--night) - ${starts[index + 1]}) / ${Math.max(0.0001, stops[index + 1] - starts[index + 1])}, 1) * 100%))`,
				hours[0].sky as string
			)
	);

	const sections = () => Array.from(wrapper.querySelectorAll<HTMLElement>(`[${NIGHT_HOUR_ATTR}]`));
	const byId = (id: SectionId) => wrapper.querySelector<HTMLElement>(`#${id}[${NIGHT_HOUR_ATTR}]`);

	// Anchor the sky stops to the sections: stop = scroll progress at which the section's center meets the viewport center.
	function measureStops() {
		const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
		const elements = sections();
		if (elements.length !== NIGHT_HOURS.length) return;
		let previous = 0;
		const nextStarts = [0];
		stops = elements.map((element, index) => {
			if (index === 0) return 0;
			const top = element.getBoundingClientRect().top + window.scrollY;
			const center = top + element.offsetHeight / 2 - window.innerHeight / 2;
			const entered = (top - window.innerHeight) / maxScroll;
			const start = hours[index].from === 'enter' ? Math.max(previous, entered) : previous;
			previous = Math.max(previous, Math.min(1, center / maxScroll));
			nextStarts.push(Math.min(start, previous));
			return previous;
		});
		starts = nextStarts;
	}

	$effect(() => {
		const observer = new ResizeObserver(measureStops);
		observer.observe(wrapper);
		const offResize = on(window, 'resize', measureStops, { passive: true });
		measureStops();
		return () => {
			observer.disconnect();
			offResize();
		};
	});

	// Fallback driver for --night: unsupported scroll timelines, or reduced motion (the global guard would freeze the animation).
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

	// The hero covers the top 40 % of the viewport: hide the nav wordmark (the hero shows the giant one) and the rail,
	// and pause the global shooting stars (they would fly unseen behind the opaque hero, and their events would make
	// the hero mascot look up at nothing).
	$effect(() => {
		const hero = byId('hero');
		if (!hero) {
			heroCovers = false;
			return;
		}
		const observer = new IntersectionObserver(([entry]) => (heroCovers = entry.isIntersecting), { rootMargin: '0px 0px -60% 0px' });
		observer.observe(hero);
		return () => observer.disconnect();
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
			navOnPaper = paperTop < header.offsetHeight * 0.75;
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
	style:--dawn-from={starts[last]}
	style:--dawn-to={stops[last]}
	style:--sky-now={skyNow}
>
	<div class="sky" aria-hidden="true">
		<div class="sky-layer" style:background={skyBackground(hours[0])}></div>
		{#each hours.slice(1) as hour, index (hour.id)}
			<div class="sky-layer is-blend" style:background={skyBackground(hour)} style:--from={starts[index + 1]} style:--to={stops[index + 1]}></div>
		{/each}
		<div class="sky-stars">
			<StarField />
			<ShootingStars enabled={!heroCovers} />
		</div>
	</div>

	<a class="skip-link" href="#main">{m.home_nav_skip()}</a>

	<header bind:this={header} class="nav" data-tone={navOnPaper ? 'paper' : undefined}>
		<a class="wordmark font-display text-lg font-black tracking-wordmark uppercase md:text-xl" href="#hero">SOLO STACK</a>
		<button type="button" class="menu-button" aria-haspopup="dialog" aria-expanded={menuOpen} aria-label={m.home_nav_menu_open()} onclick={openMenu}>
			<span class="menu-icon" aria-hidden="true"></span>
		</button>
	</header>

	<dialog bind:this={menu} class="menu" aria-label={m.home_nav_menu_title()} onclose={() => (menuOpen = false)}>
		<div class="menu-inner">
			<button type="button" class="menu-close" aria-label={m.home_nav_menu_close()} onclick={closeMenu}>
				<span class="close-icon" aria-hidden="true"></span>
			</button>
			<nav aria-label={m.home_nav_menu_title()}>
				<ol class="menu-list">
					{#each NIGHT_HOURS as hour (hour.id)}
						<li>
							<a href="#{hour.id}" aria-current={active === hour.id ? 'location' : undefined} onclick={() => goToSection(hour.id)}>
								<span class="font-mono text-xs tracking-clock text-cream/60 tabular-nums">{hour.time}</span>
								<span class="font-display text-2xl font-black tracking-wordmark md:text-4xl">{labels[hour.id]()}</span>
							</a>
						</li>
					{/each}
				</ol>
			</nav>
		</div>
	</dialog>

	{#if rail}
		<nav class="rail" aria-label={m.home_nav_rail_label()} data-tone={railOnPaper ? 'paper' : undefined}>
			<ol>
				{#each NIGHT_HOURS as hour (hour.id)}
					<li>
						<a href="#{hour.id}" aria-label={labels[hour.id]()} aria-current={active === hour.id ? 'location' : undefined}>
							<span class="rail-time font-mono tabular-nums" aria-hidden="true">{hour.time}</span>
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
		/* Ink color that stays readable on the sky: cream at night, anthracite once the paper is bright (06:00) */
		--night-ink: color-mix(in oklab, var(--color-cream), var(--color-night) calc(clamp(0, (var(--dawn) - 0.6) * 2.5, 1) * 100%));
		color: var(--color-cream);
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

	.nav {
		position: fixed;
		z-index: 4;
		inset: 0 0 auto;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: clamp(1rem, 2.5vh, 1.75rem) clamp(1.25rem, 4vw, 3.5rem);
		pointer-events: none;
		color: var(--color-cream);
		/* A soft halo in the opposite ink keeps the nav readable where it crosses a ragged edge (e.g. the night edge) */
		--nav-halo: color-mix(in oklab, var(--color-ink) 55%, transparent);
		transition: color 300ms ease;
	}

	/* The sunrise paper is under the nav (tracked, see the script) */
	.nav[data-tone='paper'] {
		color: var(--color-night);
		--nav-halo: color-mix(in oklab, var(--color-butter) 70%, transparent);
	}

	.nav > * {
		pointer-events: auto;
		filter: drop-shadow(0 0 0.4rem var(--nav-halo));
	}

	.wordmark {
		line-height: 1;
		transition:
			opacity 350ms ease,
			translate 350ms ease,
			visibility 0s;
	}

	/* The hero shows the giant wordmark: the small one fades in once the hero has scrolled up */
	[data-hero-covers] .wordmark {
		opacity: 0;
		translate: 0 -0.5rem;
		visibility: hidden;
		transition:
			opacity 250ms ease,
			translate 250ms ease,
			visibility 0s 250ms;
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
		background: color-mix(in oklab, var(--color-ink) 94%, transparent);
		color: var(--color-cream);
	}

	.menu::backdrop {
		background: transparent;
	}

	.menu-inner {
		position: relative;
		display: grid;
		align-content: center;
		min-height: 100%;
		padding: 5rem clamp(1.25rem, 8vw, 8rem);
	}

	.menu-close {
		position: absolute;
		top: clamp(1rem, 2.5vh, 1.75rem);
		right: clamp(1.25rem, 4vw, 3.5rem);
	}

	.menu-list {
		display: grid;
		gap: clamp(0.75rem, 2.2vh, 1.5rem);
	}

	.menu-list a {
		display: flex;
		align-items: baseline;
		gap: 1.25rem;
	}

	.menu-list a:hover,
	.menu-list a[aria-current] {
		color: var(--color-butter);
	}

	@media (prefers-reduced-motion: no-preference) {
		.menu[open] {
			animation: menu-in 220ms ease-out;
		}
	}

	@keyframes menu-in {
		from {
			opacity: 0;
		}
	}

	/* Rail ----------------------------------------------------------------------------------------------------- */

	/*
	 * Quiet by design: small dots hugging the right edge, no labels (the time shows on hover/focus only), hidden over
	 * the hero, and only the dots take pointer events, so the art underneath (moon, hotspots) stays clickable.
	 */
	.rail {
		position: fixed;
		z-index: 4;
		top: 50%;
		right: clamp(0.25rem, 0.9vw, 0.9rem);
		translate: 0 -50%;
		display: none;
		color: var(--color-cream);
		pointer-events: none;
		transition:
			opacity 300ms ease,
			color 300ms ease,
			visibility 0s;
	}

	.rail[data-tone='paper'] {
		color: var(--color-night);
	}

	[data-hero-covers] .rail {
		opacity: 0;
		visibility: hidden;
		transition:
			opacity 250ms ease,
			visibility 0s 250ms;
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
			opacity 200ms,
			scale 200ms;
	}

	.rail-time {
		position: absolute;
		top: 50%;
		right: 100%;
		translate: 0 -50%;
		padding: 0.15rem 0.4rem;
		border-radius: 999px;
		background: color-mix(in oklab, var(--color-ink) 70%, transparent);
		color: var(--color-cream);
		font-size: 0.625rem;
		letter-spacing: var(--tracking-clock);
		white-space: nowrap;
		pointer-events: none;
		opacity: 0;
		transition: opacity 200ms;
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
