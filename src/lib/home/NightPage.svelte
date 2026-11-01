<!--
	@component
	The homepage frame: one fixed painted sky whose color follows the night, paper grain, stars, shooting stars,
	the floating nav (wordmark + menu overlay), and the hour rail. Sections render as children, in NIGHT_HOURS order.

	The `--night` contract (docs/HOMEPAGE-DEV.md): page scroll progress 0…1 on this wrapper, inherited by every section.
	- Scroll-driven animation (`animation-timeline: scroll(root)`) where supported and motion is allowed.
	- Otherwise (no support, or reduced motion): a passive, rAF-throttled scroll listener writes it inline.
	The sky is a stack of full-viewport color layers; layer k fades in between the measured stops of hour k-1 and k,
	so the visible color is an exact linear blend of neighboring hours. Stops are anchored to the real section
	positions (section center at viewport center), re-measured on resize.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { on } from 'svelte/events';
	import { m } from '#lib/paraglide/messages.js';
	import { NIGHT_HOURS, NIGHT_HOUR_ATTR, type SectionId } from './night.ts';
	import PaperGrain from './shared/PaperGrain.svelte';
	import ShootingStars from './shared/ShootingStars.svelte';
	import StarField from './shared/StarField.svelte';
	import { reducedMotion } from './shared/motion.svelte.ts';

	interface Props {
		children: Snippet;
		/** Show the hour dots on the right edge (≥ md). Default true. Decide during integration. */
		rail?: boolean;
	}

	let { children, rail = true }: Props = $props();

	const labels: Record<SectionId, () => string> = {
		hero: m.home_nav_section_hero,
		making: m.home_nav_section_making,
		game: m.home_nav_section_game,
		'night-shift': m.home_nav_section_nightshift,
		radio: m.home_nav_section_radio,
		cinema: m.home_nav_section_cinema,
		sunrise: m.home_nav_section_sunrise
	};

	let wrapper: HTMLDivElement;
	let menu: HTMLDialogElement;
	let menuOpen = $state(false);
	let active = $state<SectionId>('hero');
	// Evenly spaced until measured on the client
	let stops = $state<number[]>(NIGHT_HOURS.map((_, index) => index / (NIGHT_HOURS.length - 1)));

	const sections = () => Array.from(wrapper.querySelectorAll<HTMLElement>(`[${NIGHT_HOUR_ATTR}]`));

	// Anchor the sky stops to the sections: stop = scroll progress at which the section's center meets the viewport center.
	function measureStops() {
		const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
		const elements = sections();
		if (elements.length !== NIGHT_HOURS.length) return;
		let previous = 0;
		stops = elements.map((element, index) => {
			if (index === 0) return 0;
			const top = element.getBoundingClientRect().top + window.scrollY;
			const center = top + element.offsetHeight / 2 - window.innerHeight / 2;
			previous = Math.max(previous, Math.min(1, center / maxScroll));
			return previous;
		});
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
</script>

<div bind:this={wrapper} class="night-page" data-night-page>
	<div class="sky" aria-hidden="true">
		<div class="sky-layer" style:background-color={NIGHT_HOURS[0].sky}></div>
		{#each NIGHT_HOURS.slice(1) as hour, index (hour.id)}
			<div class="sky-layer is-blend" style:background-color={hour.sky} style:--from={stops[index]} style:--to={stops[index + 1]}></div>
		{/each}
		<div class="sky-stars">
			<StarField />
			<ShootingStars />
		</div>
	</div>

	<a class="skip-link" href="#main">{m.home_nav_skip()}</a>

	<header class="nav">
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
							<a href="#{hour.id}" aria-current={active === hour.id ? 'location' : undefined} onclick={closeMenu}>
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
		<nav class="rail" aria-label={m.home_nav_rail_label()}>
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

	<PaperGrain />
</div>

<style>
	.night-page {
		position: relative;
		isolation: isolate;
		/* Ink color that stays readable on the sky: cream at night, anthracite once the paper is bright (06:00) */
		--night-ink: color-mix(in oklab, var(--color-cream), var(--color-night) calc(clamp(0, (var(--night) - 0.9) * 12, 1) * 100%));
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
		/* Stars fade in after the hero and retreat before sunrise */
		opacity: calc(min(1, 0.55 + var(--night) * 3) * (1 - clamp(0, (var(--night) - 0.82) / 0.14, 1)));
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
		color: var(--night-ink);
	}

	.nav > * {
		pointer-events: auto;
	}

	.wordmark {
		line-height: 1;
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

	.rail {
		position: fixed;
		z-index: 4;
		top: 50%;
		right: clamp(0.75rem, 2vw, 1.75rem);
		translate: 0 -50%;
		display: none;
		color: var(--night-ink);
	}

	@media (min-width: 48rem) {
		.rail {
			display: block;
		}
	}

	.rail ol {
		display: grid;
		gap: 0.9rem;
	}

	.rail a {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 0.6rem;
		padding: 0.2rem;
	}

	.rail-dot {
		width: 0.4rem;
		height: 0.4rem;
		border-radius: 999px;
		background: currentColor;
		opacity: 0.4;
		transition:
			opacity 200ms,
			scale 200ms;
	}

	.rail-time {
		font-size: 0.625rem;
		letter-spacing: var(--tracking-clock);
		opacity: 0;
		transition: opacity 200ms;
	}

	.rail a:hover .rail-time,
	.rail a:focus-visible .rail-time,
	.rail a[aria-current] .rail-time {
		opacity: 0.8;
	}

	.rail a[aria-current] .rail-dot {
		opacity: 1;
		scale: 1.5;
	}
</style>
