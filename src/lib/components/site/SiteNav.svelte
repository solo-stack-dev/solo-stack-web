<!--
	@component
	The site navbar: wordmark (home), top level links, `actions` snippet on the right.
	- `variant="site"`: sticky blurred bar. The (site) layout passes theme toggle and phone menu as `actions`; links move into it below `sm`.
	- `variant="night"` (homepage): fixed, no bar; cream ink with an opposite-ink halo to read over any art; current page gets
	  `--ink-underline`. Sits on `--page-gutter` / `--nav-pad-y`. NightPage passes its menu button as `actions` and lists the site
	  links in that overlay on phones, so the homepage has one header. `tone="paper"` = anthracite ink over the sunrise.
	Restores the eclipse moon egg (`eclipse-moon.ts`) on mount. Never import the dropdown/sheet here: the homepage must not ship them.
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

		<!-- Site look: `display: contents`. Night look: a row of the links and the menu button. -->
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

	/* The banner's butter crescent, CSS only */
	.moon {
		width: 0.85em;
		height: 0.85em;
		flex: none;
		border-radius: 999px;
		background: radial-gradient(circle at 70% 35%, transparent 0 46%, var(--color-butter) 48%);
		box-shadow: 0 0 0.9em color-mix(in oklab, var(--color-butter) 45%, transparent);
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
			color var(--dur-hover) ease,
			background-color var(--dur-hover) ease;
	}

	/* Current page underline (--ink-underline), drawn in from the left on hover */
	.links a::after {
		content: '';
		position: absolute;
		left: 0.8rem;
		right: 0.8rem;
		bottom: 0.4rem;
		height: 0.45rem;
		background: var(--color-butter);
		mask: var(--ink-underline) center / 100% 100% no-repeat;
		scale: 0 1;
		transform-origin: left;
		transition: scale var(--dur-state) var(--ease-settle);
	}

	.links a[aria-current]::after {
		scale: 1 1;
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
		/* Holds still during view transitions */
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
		/* Opposite-ink halo keeps it readable on any art */
		--nav-halo: color-mix(in oklab, var(--color-ink) 70%, transparent);
		transition: color var(--dur-state) ease;
	}

	.is-night[data-tone='paper'] {
		color: var(--color-night);
		--nav-halo: color-mix(in oklab, var(--color-butter) 80%, transparent);
	}

	.is-night .bar {
		padding: var(--nav-pad-y) var(--page-gutter);
	}

	.is-night .bar > * {
		pointer-events: auto;
		filter: drop-shadow(0 0 0.35rem var(--nav-halo)) drop-shadow(0 0 0.1rem var(--nav-halo));
	}

	.is-night .wordmark {
		font-size: 1.125rem;
		transition:
			opacity var(--dur-state) ease,
			translate var(--dur-state) var(--ease-settle),
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

	.is-night .dock {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	/* On phones the dock holds only the menu button; the overlay lists the site links */
	.is-night .links {
		display: none;
	}

	@media (min-width: 48rem) {
		.is-night .links {
			display: block;
		}
	}

	.is-night .links ul {
		gap: 0;
	}

	.is-night .links a {
		padding: 0 0.85rem;
		border-radius: 0;
		font-family: var(--font-display);
		font-size: 0.875rem;
		font-weight: 800;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.is-night .links a::after {
		left: 0.6rem;
		right: 0.6rem;
		bottom: 0.3rem;
	}

	.is-night .links a:hover {
		color: var(--color-butter);
	}

	.is-night[data-tone='paper'] .links a:hover {
		color: inherit;
	}

	.is-night[data-tone='paper'] .links a::after {
		background: var(--color-night);
	}

	/* Hover previews the mark, faint */
	.is-night .links a:not([aria-current]):hover::after {
		scale: 1 1;
		opacity: 0.45;
	}

	/* Icon flush with the gutter (mirroring the wordmark) while the button keeps its 44px target */
	.is-night .actions {
		display: flex;
		align-items: center;
		margin-right: -0.65rem;
	}
</style>
