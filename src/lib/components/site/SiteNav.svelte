<!--
	@component
	The one slim site navbar: SOLO STACK wordmark (home), the top level links (Start, Blog, Stats), and an `actions`
	snippet on the right. Two looks:

	- `variant="site"` (blog, stats, …): sticky bar on `bg-background` with a hairline border and a light blur. The
	  (site) layout passes the theme toggle and the phone menu as `actions`; links collapse into that menu below `sm`.
	- `variant="night"` (homepage): fixed and transparent over the painted night, cream ink with a soft halo, mono
	  links like the clock labels. NightPage passes its section menu button as `actions` and lists the site links in
	  that overlay on phones, so the homepage keeps a single header. `tone="paper"` switches to anthracite ink once the
	  sunrise paper is under the bar; `hideWordmark` hides the small wordmark while the hero shows the giant one.

	The heavy pieces (dropdown, sheet) are never imported here, so the homepage does not ship them.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import { m } from '#lib/paraglide/messages.js';
	import { localizeHref } from '#lib/paraglide/runtime.js';
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
</script>

<header bind:this={ref} class={['site-nav', `is-${variant}`]} data-tone={variant === 'night' ? tone : undefined}>
	<div class="bar">
		<a class={['wordmark', hideWordmark && 'is-hidden']} href={wordmarkHref ?? localizeHref('/')} aria-label={m.site_nav_wordmark_label()}>
			<span class="moon" aria-hidden="true"></span>
			<span class="font-display font-black tracking-wordmark uppercase">SOLO STACK</span>
		</a>

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

	.is-site {
		position: sticky;
		top: 0;
		border-bottom: 1px solid color-mix(in oklab, var(--border) 80%, transparent);
		background: color-mix(in oklab, var(--background) 82%, transparent);
		color: var(--foreground);
		backdrop-filter: blur(12px) saturate(1.2);
		-webkit-backdrop-filter: blur(12px) saturate(1.2);
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

	/* On phones the night bar keeps only the wordmark and the menu button; the overlay lists the site links */
	.is-night .links {
		display: none;
	}

	@media (min-width: 48rem) {
		.is-night .links {
			display: block;
		}
	}

	.is-night .links a {
		padding: 0 0.7rem;
		font-family: var(--font-mono);
		font-size: 0.75rem;
		letter-spacing: var(--tracking-clock);
		text-transform: uppercase;
		opacity: 0.78;
	}

	.is-night .links a:hover,
	.is-night .links a[aria-current] {
		opacity: 1;
	}

	.is-night .links a:hover {
		color: var(--color-butter);
	}

	.is-night[data-tone='paper'] .links a:hover {
		color: var(--color-ink);
	}

	.is-night .links a[aria-current]::before {
		content: '';
		position: absolute;
		left: 50%;
		bottom: 0.45rem;
		width: 0.3rem;
		height: 0.3rem;
		translate: -50% 0;
		border-radius: 999px;
		background: currentColor;
	}

	.is-night .actions {
		display: flex;
		align-items: center;
	}
</style>
