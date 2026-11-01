<!--
	@component
	The one slim site navbar: SOLO STACK wordmark (home), the top level links (Start, Blog, Stats), and an `actions`
	snippet on the right. Two looks:

	- `variant="site"` (blog, stats, …): sticky bar on `bg-background` with a hairline border and a light blur. The
	  (site) layout passes the theme toggle and the phone menu as `actions`; links collapse into that menu below `sm`.
	- `variant="night"` (homepage): fixed over the painted night, wordmark in cream ink with a soft halo; the links and
	  the actions sit in one smoked-glass "dock" capsule with the current page as a lit butter pill, so they read over
	  the moon and the stars. NightPage passes its section menu button as `actions` and lists the site links in that
	  overlay on phones (the dock then holds only the button), so the homepage keeps a single header. `tone="paper"`
	  switches to anthracite ink once the sunrise paper is under the bar; `hideWordmark` hides the small wordmark while
	  the hero shows the giant one.

	Easter egg: `eclipse-moon.ts` swaps the crescent (and the favicon) for the eclipse moon; restored here on mount.

	The heavy pieces (dropdown, sheet) are never imported here, so the homepage does not ship them.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
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

	$effect(restoreEclipseMoon);
</script>

<header bind:this={ref} class={['site-nav', `is-${variant}`]} data-tone={variant === 'night' ? tone : undefined}>
	<div class="bar">
		<a class={['wordmark', hideWordmark && 'is-hidden']} href={wordmarkHref ?? localizeHref('/')} aria-label={m.site_nav_wordmark_label()}>
			<span class="moon" aria-hidden="true"></span>
			<span class="font-display font-black tracking-wordmark uppercase">SOLO STACK</span>
		</a>

		<!-- Site look: `display: contents`. Night look: one floating capsule holding the links and the menu button. -->
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
	.site-nav {
		inset: 0 0 auto;
		z-index: 40;
	}

	.bar {
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
		font-size: 1.0625rem;
		line-height: 1;
	}

	/* A tiny butter crescent: the moon of the banner, drawn with two gradients (no image) */
	.moon {
		width: 0.85em;
		height: 0.85em;
		flex: none;
		border-radius: 999px;
		background: radial-gradient(circle at 70% 35%, transparent 0 46%, var(--color-butter) 48%);
		box-shadow: 0 0 0.9em color-mix(in oklab, var(--color-butter) 45%, transparent);
		rotate: -20deg;
	}

	/*
	 * Easter egg (eclipse-moon.ts): the eclipse moon. Its halo already fills the box, so it is drawn larger with a
	 * negative margin (the wordmark does not shift). On light paper it sits on a small night disc to stay visible.
	 */
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

	.links ul {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.links a {
		position: relative;
		display: inline-flex;
		align-items: center;
		min-height: 2.75rem;
		padding: 0 0.8rem;
		border-radius: 999px;
		transition:
			color 160ms ease,
			background-color 160ms ease;
	}

	/* Site look ---------------------------------------------------------------------------------------------- */

	.is-site .dock {
		display: contents;
	}

	.is-site {
		position: sticky;
		top: 0;
		border-bottom: 1px solid color-mix(in oklab, var(--border) 80%, transparent);
		background: color-mix(in oklab, var(--background) 82%, transparent);
		color: var(--foreground);
		backdrop-filter: blur(12px) saturate(1.2);
		-webkit-backdrop-filter: blur(12px) saturate(1.2);
		/* Holds still during page view transitions (view-transition.ts) */
		view-transition-name: site-nav;
	}

	.is-site .bar {
		max-width: 76rem;
		height: 3.75rem;
		margin: 0 auto;
		padding: 0 clamp(1rem, 4vw, 2rem);
	}

	.is-site .links {
		display: none;
	}

	@media (min-width: 40rem) {
		.is-site .links {
			display: block;
		}
	}

	.is-site .links a {
		color: var(--muted-foreground);
		font-size: 0.9375rem;
		font-weight: 500;
	}

	.is-site .links a:hover {
		color: var(--foreground);
		background: var(--muted);
	}

	.is-site .links a[aria-current] {
		color: var(--foreground);
	}

	/* A short butter stroke under the current page, like a pigment underline */
	.is-site .links a[aria-current]::after {
		content: '';
		position: absolute;
		left: 0.8rem;
		right: 0.8rem;
		bottom: 0.45rem;
		height: 3px;
		border-radius: 3px;
		background: var(--color-butter);
	}

	.is-site .actions {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	/* Night look (homepage) ---------------------------------------------------------------------------------- */

	.is-night {
		position: fixed;
		color: var(--color-cream);
		pointer-events: none;
		/* A soft halo in the opposite ink keeps the bar readable where it crosses a ragged edge (e.g. the night edge) */
		--nav-halo: color-mix(in oklab, var(--color-ink) 55%, transparent);
		transition: color 300ms ease;
	}

	.is-night[data-tone='paper'] {
		color: var(--color-night);
		--nav-halo: color-mix(in oklab, var(--color-butter) 70%, transparent);
	}

	.is-night .bar {
		padding: clamp(1rem, 2.5vh, 1.75rem) clamp(1.25rem, 4vw, 3.5rem);
	}

	.is-night .bar > * {
		pointer-events: auto;
		filter: drop-shadow(0 0 0.4rem var(--nav-halo));
	}

	.is-night .wordmark {
		font-size: 1.125rem;
		transition:
			opacity 350ms ease,
			translate 350ms ease,
			visibility 0s;
	}

	@media (min-width: 48rem) {
		.is-night .wordmark {
			font-size: 1.25rem;
		}
	}

	.is-night[data-tone='paper'] .moon {
		background: radial-gradient(circle at 70% 35%, transparent 0 46%, var(--color-night) 48%);
		box-shadow: none;
	}

	/* The hero shows the giant wordmark: the small one fades in once the hero has scrolled up */
	.is-night .wordmark.is-hidden {
		opacity: 0;
		translate: 0 -0.5rem;
		visibility: hidden;
		transition:
			opacity 250ms ease,
			translate 250ms ease,
			visibility 0s 250ms;
	}

	/*
	 * The dock: a smoked-glass capsule over the art, so the site links read on any background (moon, stars, paper).
	 * The current page is a lit butter pill with the moon's glow. Its own background replaces the halo filter
	 * (a filter would also break the backdrop blur).
	 */
	.is-night .bar > .dock {
		filter: none;
	}

	.is-night .dock {
		--dock-ink: var(--color-cream);
		--dock-glass: color-mix(in oklab, var(--color-ink) 58%, transparent);
		--dock-edge: color-mix(in oklab, var(--color-butter) 28%, transparent);
		--dock-hover: color-mix(in oklab, var(--color-cream) 12%, transparent);
		--dock-lit: var(--color-butter);
		--dock-lit-ink: var(--color-night);
		display: flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.25rem;
		border: 1px solid var(--dock-edge);
		border-radius: 999px;
		background: var(--dock-glass);
		color: var(--dock-ink);
		box-shadow:
			0 0.5rem 1.75rem -0.5rem color-mix(in oklab, var(--color-ink) 60%, transparent),
			inset 0 1px 0 color-mix(in oklab, var(--color-cream) 10%, transparent);
		backdrop-filter: blur(14px) saturate(1.3);
		-webkit-backdrop-filter: blur(14px) saturate(1.3);
		transition:
			background-color 300ms ease,
			border-color 300ms ease,
			color 300ms ease;
	}

	.is-night[data-tone='paper'] .dock {
		--dock-ink: var(--color-night);
		--dock-glass: color-mix(in oklab, var(--color-cream) 62%, transparent);
		--dock-edge: color-mix(in oklab, var(--color-night) 16%, transparent);
		--dock-hover: color-mix(in oklab, var(--color-night) 9%, transparent);
		--dock-lit: var(--color-night);
		--dock-lit-ink: var(--color-butter);
	}

	/* On phones the dock holds only the menu button; the overlay lists the site links */
	.is-night .links {
		display: none;
	}

	@media (min-width: 48rem) {
		.is-night .links {
			display: block;
		}

		/* A hairline between the pages and the section menu */
		.is-night .links + .actions {
			padding-left: 0.25rem;
			border-left: 1px solid var(--dock-edge);
		}
	}

	.is-night .links ul {
		gap: 0.125rem;
	}

	.is-night .links a {
		padding: 0 1.05rem;
		font-family: var(--font-display);
		font-size: 0.875rem;
		font-weight: 800;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		transition:
			color 160ms ease,
			background-color 160ms ease,
			box-shadow 160ms ease;
	}

	.is-night .links a:hover {
		background: var(--dock-hover);
	}

	.is-night .links a[aria-current] {
		background: var(--dock-lit);
		color: var(--dock-lit-ink);
		box-shadow: 0 0 1.1rem -0.1rem color-mix(in oklab, var(--color-butter) 55%, transparent);
	}

	.is-night[data-tone='paper'] .links a[aria-current] {
		box-shadow: none;
	}

	.is-night .actions {
		display: flex;
		align-items: center;
	}

	.is-night .actions :global(button:hover) {
		background: var(--dock-hover);
	}

	@media (prefers-reduced-transparency: reduce) {
		.is-night .dock {
			--dock-glass: color-mix(in oklab, var(--color-ink) 92%, transparent);
		}

		.is-night[data-tone='paper'] .dock {
			--dock-glass: var(--color-cream);
		}
	}
</style>
