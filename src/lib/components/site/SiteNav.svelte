<!--
	@component
	The site navbar, one language on every page: crescent wordmark (home), uppercase tracked display links with the hand-drawn
	`--ink-underline` swash under the current page, `actions` snippet on the right. No bar: a painted scrim of the ground under
	it (night ink, sunrise butter, or the subpage paper) dissolves into the page, eased so it has no edge.
	It slides away while you scroll down and comes back on the first scroll up (never while it holds keyboard focus), so
	headings and art below the fold are never covered.
	- `variant="site"`: sticky, aligned to the pages' content grid (`content-frame`). The scrim is the page's own paper or
	  night (`--background`) and appears once the page is scrolled. The (site) layout passes theme toggle and phone menu as
	  `actions`; the links move into the menu below `sm`.
	- `variant="night"` (homepage): fixed on `--page-gutter` / `--nav-pad-y`. Links and the menu button sit in one pill of
	  smoked night pigment with a moonlit rim, so they read over the brightest moon; the wordmark keeps an opposite-ink halo.
	  Scrim off while the hero shows the giant wordmark. NightPage passes its menu button as `actions` and lists the site
	  links in that overlay on phones (the pill then holds only the button). `tone="paper"` = anthracite ink on butter paper
	  over the sunrise.
	Restores the eclipse moon egg (`eclipse-moon.ts`) on mount. Never import the dropdown here: the homepage must not ship it.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { on } from 'svelte/events';
	import { page } from '$app/state';
	import { m } from '#lib/paraglide/messages.js';
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { restoreEclipseMoon } from './eclipse-moon.ts';
	import { SITE_LINKS, siteCurrent, siteHref } from './links.ts';

	interface Props {
		variant?: 'site' | 'night';
		/** Night variant only: ink for the background under the bar. */
		tone?: 'night' | 'paper';
		/** Night variant only: hide the wordmark (the hero shows the giant one). */
		hideWordmark?: boolean;
		/** Wordmark target. Default: the homepage in the current locale. */
		wordmarkHref?: string;
		/** Right side controls (theme toggle, menu buttons). */
		actions?: Snippet;
		/** The `<header>` element. */
		ref?: HTMLElement;
	}

	let { variant = 'site', tone = 'night', hideWordmark = false, wordmarkHref, actions, ref = $bindable() }: Props = $props();

	const pathname = $derived(page.url.pathname);

	/** Scrolled past the top: the site scrim fades in. */
	let scrolled = $state(false);
	/** Scrolling down: the bar steps out of the way. */
	let away = $state(false);

	/** Below this the bar always shows; a direction must hold for `TRAVEL` px before it switches (no flicker on trackpads). */
	const TOP = 96;
	const TRAVEL = 18;

	$effect(() => {
		let lastY = window.scrollY;
		let travel = 0;
		let frame = 0;
		const update = () => {
			frame = 0;
			const y = Math.max(0, window.scrollY);
			const delta = y - lastY;
			lastY = y;
			scrolled = y > 4;
			if (y < TOP) {
				away = false;
				travel = 0;
				return;
			}
			if (delta === 0) return;
			if (Math.sign(delta) !== Math.sign(travel)) travel = 0;
			travel += delta;
			if (travel > TRAVEL) away = true;
			else if (travel < -TRAVEL) away = false;
		};
		const schedule = () => {
			if (!frame) frame = requestAnimationFrame(update);
		};
		const off = on(window, 'scroll', schedule, { passive: true });
		update();
		return () => {
			off();
			cancelAnimationFrame(frame);
		};
	});

	$effect(restoreEclipseMoon);
</script>

<header
	bind:this={ref}
	class={['site-nav', `is-${variant}`, hideWordmark && 'is-bare']}
	data-tone={variant === 'night' ? tone : undefined}
	data-scrolled={scrolled || undefined}
	data-away={away || undefined}
>
	<div class={['bar', variant === 'site' && 'content-frame']}>
		<a class={['wordmark', hideWordmark && 'is-hidden']} href={wordmarkHref ?? localizeHref('/')} aria-label={m.site_nav_wordmark_label()}>
			<span class="moon" aria-hidden="true"></span>
			<span class="font-display font-black tracking-wordmark uppercase">SOLO STACK</span>
		</a>

		<div class="dock">
			<nav class="links" aria-label={m.site_nav_label()}>
				<ul>
					{#each SITE_LINKS as link (link.id)}
						<li><a href={siteHref(link)} aria-current={siteCurrent(link, pathname)}>{link.label()}</a></li>
					{/each}
				</ul>
			</nav>

			{#if actions}
				<div class="actions">{@render actions()}</div>
			{/if}
		</div>
	</div>
</header>

<style>
	/* Registered so the dock crossfades between night and paper */
	@property --dock-glass {
		syntax: '<color>';
		inherits: true;
		initial-value: transparent;
	}

	@property --dock-rim-top {
		syntax: '<color>';
		inherits: true;
		initial-value: transparent;
	}

	@property --dock-rim-bottom {
		syntax: '<color>';
		inherits: true;
		initial-value: transparent;
	}

	@property --dock-rule {
		syntax: '<color>';
		inherits: true;
		initial-value: transparent;
	}

	@property --dock-shade {
		syntax: '<color>';
		inherits: true;
		initial-value: transparent;
	}

	@property --dock-edge {
		syntax: '<color>';
		inherits: true;
		initial-value: transparent;
	}

	/*
	 * Tokens per ground. `--nav-mark`: current-page swash and hover ink. On light paper the butter would be 1.3:1, so it is the
	 * deep `--ink-lit` (5.7:1) there; the crescent is ochre ink (3.5:1). `--nav-scrim`: the ground the scrim is painted from.
	 */
	.site-nav {
		--nav-mark: var(--color-butter);
		--nav-focus: var(--color-butter);
		--nav-focus-halo: color-mix(in oklab, var(--color-butter) 55%, transparent);
		--nav-moon: var(--color-butter);
		--nav-moon-glow: color-mix(in oklab, var(--color-butter) 45%, transparent);
		inset: 0 0 auto;
		z-index: 40;
		transition:
			translate var(--dur-state) var(--ease-settle),
			opacity var(--dur-state) ease,
			color var(--dur-state) ease;
	}

	/* Scroll down: out of the way. Keyboard focus inside always brings it back. */
	.site-nav[data-away]:not(:focus-within) {
		translate: 0 -120%;
		opacity: 0;
		pointer-events: none;
	}

	.site-nav[data-away]:not(:focus-within) * {
		pointer-events: none;
	}

	.bar {
		position: relative;
		display: flex;
		align-items: center;
		gap: clamp(0.75rem, 2vw, 2rem);
	}

	.wordmark {
		display: inline-flex;
		align-items: center;
		gap: 0.55rem;
		min-height: 2.75rem;
		margin-right: auto;
		font-size: 1.125rem;
		line-height: 1;
		transition:
			opacity var(--dur-state) ease,
			translate var(--dur-state) var(--ease-settle),
			visibility 0s;
	}

	@media (min-width: 48rem) {
		.wordmark {
			font-size: 1.25rem;
		}
	}

	/* The banner's crescent, CSS only */
	.moon {
		width: 0.85em;
		height: 0.85em;
		flex: none;
		border-radius: 999px;
		background: radial-gradient(circle at 70% 35%, transparent 0 46%, var(--nav-moon) 48%);
		box-shadow: 0 0 0.9em var(--nav-moon-glow);
		rotate: -20deg;
	}

	/* Eclipse egg: its halo fills the box, so it is larger with a negative margin (no shift). On light paper it gets a night disc. */
	:global(html[data-eclipse-moon]) .site-nav .moon {
		width: 1.3em;
		height: 1.3em;
		margin: -0.225em;
		border-radius: 0;
		background: url('../../assets/moon-eclipse.svg') center / contain no-repeat;
		box-shadow: none;
		rotate: none;
	}

	:global(html[data-eclipse-moon]:not(.dark)) .is-site .moon,
	:global(html[data-eclipse-moon]) .is-night[data-tone='paper'] .moon {
		background:
			url('../../assets/moon-eclipse.svg') center / 92% no-repeat,
			radial-gradient(circle, var(--color-night) 0 64%, transparent 66%);
	}

	.dock {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.links {
		display: none;
	}

	.links ul {
		display: flex;
		align-items: center;
	}

	.links a {
		position: relative;
		display: inline-flex;
		align-items: center;
		min-height: 2.75rem;
		padding: 0 0.85rem;
		font-family: var(--font-display);
		font-size: 0.875rem;
		font-weight: 800;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		transition: color var(--dur-hover) ease;
	}

	/* Current page swash (--ink-underline), drawn in from the left */
	.links a::after {
		content: '';
		position: absolute;
		left: 0.6rem;
		right: 0.6rem;
		bottom: 0.3rem;
		height: 0.45rem;
		background: var(--nav-mark);
		mask: var(--ink-underline) center / 100% 100% no-repeat;
		scale: 0 1;
		transform-origin: left;
		transition:
			scale var(--dur-state) var(--ease-settle),
			opacity var(--dur-hover) ease;
	}

	.links a[aria-current]::after {
		scale: 1 1;
	}

	.links a:hover {
		color: var(--nav-mark);
	}

	/* Hover previews the mark, faint */
	.links a:not([aria-current]):hover::after {
		scale: 1 1;
		opacity: 0.45;
	}

	/*
	 * Keyboard focus is drawn like the current page, not as a box: the swash inks in at full strength in the focus ink, a
	 * little heavier than the current-page mark (so focus on the current link still shows), with a soft light around the
	 * word. Same for the wordmark, under its name.
	 */
	.links a:focus-visible,
	.wordmark:focus-visible {
		outline: none;
		box-shadow: none;
		animation: none;
		color: var(--nav-focus);
		filter: drop-shadow(0 0 0.45rem var(--nav-focus-halo));
	}

	.links a:focus-visible::after {
		scale: 1 1;
		opacity: 1;
		height: 0.55rem;
		bottom: 0.2rem;
		background: var(--nav-focus);
	}

	.wordmark {
		position: relative;
	}

	.wordmark::after {
		content: '';
		position: absolute;
		/* under the name, after the crescent */
		left: 1.25em;
		right: -0.1em;
		bottom: 0.05rem;
		height: 0.45rem;
		background: var(--nav-focus);
		mask: var(--ink-underline) center / 100% 100% no-repeat;
		scale: 0 1;
		transform-origin: left;
		pointer-events: none;
		transition: scale var(--dur-state) var(--ease-settle);
	}

	.wordmark:focus-visible::after {
		scale: 1 1;
	}

	/* Icon flush with the edge (mirroring the wordmark) while the button keeps its 44px target */
	.actions {
		display: flex;
		align-items: center;
		margin-right: -0.75rem;
	}

	/* The scrim: the ground under the bar, opaque through the bar's row, then dissolving with an eased tail. */
	.site-nav::before,
	.site-nav::after {
		content: '';
		position: absolute;
		inset: 0 0 auto;
		z-index: -1;
		height: var(--scrim-h);
		pointer-events: none;
		background: linear-gradient(
			var(--scrim) 0% var(--scrim-solid),
			color-mix(in oklab, var(--scrim) 78%, transparent) calc(var(--scrim-solid) + (100% - var(--scrim-solid)) * 0.3),
			color-mix(in oklab, var(--scrim) 42%, transparent) calc(var(--scrim-solid) + (100% - var(--scrim-solid)) * 0.58),
			color-mix(in oklab, var(--scrim) 14%, transparent) calc(var(--scrim-solid) + (100% - var(--scrim-solid)) * 0.82),
			transparent
		);
		transition: opacity var(--dur-state) ease;
	}

	/* Site look ---------------------------------------------------------------------------------------------- */

	.is-site {
		--nav-mark: var(--ink-lit);
		--nav-focus: var(--focus-ring);
		--nav-focus-halo: var(--focus-halo);
		--nav-moon: #b07a12;
		--nav-moon-glow: color-mix(in oklab, var(--color-butter) 70%, transparent);
		--scrim: var(--background);
		--scrim-h: 7.5rem;
		--scrim-solid: 52%;
		position: sticky;
		top: 0;
		color: var(--foreground);
		/* Holds still during view transitions */
		view-transition-name: site-nav;
	}

	:global(.dark) .is-site {
		--nav-mark: var(--color-butter);
		--nav-focus: var(--color-butter);
		--nav-moon: var(--color-butter);
		--nav-moon-glow: color-mix(in oklab, var(--color-butter) 45%, transparent);
	}

	/* Only one scrim layer here, and only once the page moves: at the top the hero's own painted sky shows through */
	.is-site::before {
		opacity: 0;
	}

	.is-site::after {
		display: none;
	}

	.is-site[data-scrolled]::before {
		opacity: 1;
	}

	.is-site .bar {
		height: 4.5rem;
	}

	@media (min-width: 40rem) {
		.is-site .links {
			display: block;
		}
	}

	/* Night look (homepage) ---------------------------------------------------------------------------------- */

	.is-night {
		position: fixed;
		color: var(--color-cream);
		pointer-events: none;
		/* Opposite-ink halo keeps it readable on any art */
		--nav-halo: color-mix(in oklab, var(--color-ink) 70%, transparent);
		/* the shell's focus swash (`swash-focus`) on the passed menu button */
		--focus-ring: var(--color-butter);
		--focus-halo: color-mix(in oklab, var(--color-butter) 55%, transparent);
		--scrim-h: 9rem;
		--scrim-solid: 55%;
	}

	.is-night[data-tone='paper'] {
		color: var(--color-night);
		--nav-mark: var(--color-night);
		--nav-focus: var(--color-night);
		--nav-focus-halo: color-mix(in oklab, var(--color-moonlight) 90%, transparent);
		--focus-ring: var(--color-night);
		--focus-halo: var(--nav-focus-halo);
		--nav-moon: var(--color-night);
		--nav-moon-glow: transparent;
		--nav-halo: color-mix(in oklab, var(--color-butter) 80%, transparent);
	}

	/* Two scrim layers crossfade with the tone: night ink, sunrise butter */
	.is-night::before {
		--scrim: color-mix(in oklab, var(--color-night) 90%, transparent);
	}

	.is-night::after {
		--scrim: color-mix(in oklab, var(--color-butter) 88%, transparent);
		opacity: 0;
	}

	.is-night[data-tone='paper']::before,
	.is-night.is-bare::after,
	.is-night.is-bare::before {
		opacity: 0;
	}

	.is-night[data-tone='paper']:not(.is-bare)::after {
		opacity: 1;
	}

	.is-night .bar {
		padding: var(--nav-pad-y) var(--page-gutter);
	}

	.is-night .bar > * {
		pointer-events: auto;
	}

	/* The wordmark floats free over the art: an opposite-ink halo keeps it readable (the links have the pill) */
	.is-night .wordmark {
		filter: drop-shadow(0 0 0.35rem var(--nav-halo)) drop-shadow(0 0 0.1rem var(--nav-halo));
	}

	/* Keeps the halo under the focus light */
	.is-night .wordmark:focus-visible {
		filter: drop-shadow(0 0 0.45rem var(--nav-focus-halo)) drop-shadow(0 0 0.1rem var(--nav-halo));
	}

	/*
	 * The dock pill: a smoked wash of night pigment over the art (the blurred moon glows through it as warm amber), a rim
	 * lit from above like the moon's edge, fading out toward the bottom, and an ink shadow that sets it off the butter moon.
	 * No filter on it: that would break the backdrop blur. Over the sunrise it turns to butter paper with an ink rim.
	 */
	.is-night .dock {
		/* night pigment with a trace of ochre, so it reads as ink wash, not grey glass */
		--dock-glass: color-mix(in oklab, color-mix(in oklab, var(--color-night) 92%, var(--color-ochre)) 76%, transparent);
		--dock-rim-top: color-mix(in oklab, var(--color-butter) 46%, transparent);
		--dock-rim-bottom: color-mix(in oklab, var(--color-butter) 6%, transparent);
		--dock-rule: color-mix(in oklab, var(--color-butter) 22%, transparent);
		--dock-shade: color-mix(in oklab, var(--color-ink) 55%, transparent);
		--dock-edge: color-mix(in oklab, var(--color-ink) 30%, transparent);
		position: relative;
		gap: 0.25rem;
		/* outset into the gutter so the menu icon keeps its place at the page edge */
		margin-right: -0.5rem;
		padding: 0.25rem 0.25rem 0.25rem 0.4rem;
		border-radius: 999px;
		background-color: var(--dock-glass);
		box-shadow:
			0 0 0 1px var(--dock-edge),
			0 0.7rem 1.6rem -0.7rem var(--dock-shade),
			0 0.2rem 0.6rem -0.2rem var(--dock-shade);
		backdrop-filter: blur(12px) saturate(1.25);
		-webkit-backdrop-filter: blur(12px) saturate(1.25);
		transition:
			--dock-glass var(--dur-state) ease,
			--dock-rim-top var(--dur-state) ease,
			--dock-rim-bottom var(--dur-state) ease,
			--dock-rule var(--dur-state) ease,
			--dock-shade var(--dur-state) ease,
			--dock-edge var(--dur-state) ease;
	}

	/* The rim: a 1px gradient ring (masked to the border) */
	.is-night .dock::before {
		content: '';
		position: absolute;
		inset: 0;
		padding: 1px;
		border-radius: inherit;
		background: linear-gradient(var(--dock-rim-top), var(--dock-rim-bottom) 70%);
		mask:
			linear-gradient(#000 0 0) content-box exclude,
			linear-gradient(#000 0 0);
		pointer-events: none;
	}

	.is-night[data-tone='paper'] .dock {
		--dock-glass: color-mix(in oklab, color-mix(in oklab, var(--color-cream) 55%, var(--color-butter)) 82%, transparent);
		--dock-rim-top: color-mix(in oklab, var(--color-cream) 90%, transparent);
		--dock-rim-bottom: color-mix(in oklab, var(--color-night) 14%, transparent);
		--dock-rule: color-mix(in oklab, var(--color-night) 18%, transparent);
		--dock-shade: color-mix(in oklab, color-mix(in oklab, var(--color-ochre) 60%, var(--color-night)) 30%, transparent);
		--dock-edge: color-mix(in oklab, var(--color-night) 12%, transparent);
	}

	/* Inside the pill the menu button sits on its padding, not flush with the page edge */
	.is-night .actions {
		margin-right: 0;
	}

	@media (prefers-reduced-transparency: reduce) {
		.is-night .dock {
			--dock-glass: color-mix(in oklab, var(--color-night) 96%, var(--color-ochre));
		}

		.is-night[data-tone='paper'] .dock {
			--dock-glass: color-mix(in oklab, var(--color-cream) 55%, var(--color-butter));
		}
	}

	/* Hidden while the hero shows the giant wordmark */
	.is-night .wordmark.is-hidden {
		opacity: 0;
		translate: 0 -0.5rem;
		visibility: hidden;
		transition:
			opacity var(--dur-state) ease,
			translate var(--dur-state) ease,
			visibility 0s var(--dur-state);
	}

	/* On phones the dock holds only the menu button; the overlay lists the site links */
	@media (min-width: 48rem) {
		.is-night .links {
			display: block;
		}

		/* A hairline between the pages and the section menu */
		.is-night .links + .actions {
			padding-left: 0.25rem;
			border-left: 1px solid var(--dock-rule);
		}
	}

	.is-night[data-tone='paper'] .links a:hover {
		color: inherit;
	}
</style>
