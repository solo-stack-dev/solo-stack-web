<!--
	@component
	Phone menu of the site navbar (below `sm`), the subpage sibling of the homepage's night overlay: a native modal dialog over
	the whole screen, painted in the page's own ground (paper or night), the pages set large in the display face with the
	navbar's swash under the current one, and the footer's silhouette horizon as its floor (the laptop glowing). The close
	button sits exactly where the menu button was. Native `<dialog>`: Escape, focus trap and focus return for free, no
	library. Closes on navigation.
-->
<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { m } from '#lib/paraglide/messages.js';
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import horizon from './assets/footer-horizon.webp?w=1600;1080&enhanced';
	import ridgeMask from './assets/footer-horizon.webp?url';
	import { MENU_TRIGGER } from './lazy-menu.ts';
	import { SITE_LINKS, siteCurrent, siteHref } from './links.ts';
	import MenuGlyph from './MenuGlyph.svelte';

	let dialog: HTMLDialogElement;
	let open = $state(false);

	function show() {
		dialog.showModal();
		open = true;
	}

	const close = () => dialog?.close();

	afterNavigate(close);
</script>

<button type="button" class={[MENU_TRIGGER, 'sm:hidden']} aria-haspopup="dialog" aria-expanded={open} aria-label={m.site_nav_menu_open()} onclick={show}>
	<MenuGlyph />
</button>

<dialog bind:this={dialog} class="site-menu" style:--ridge="url({ridgeMask})" aria-label={m.site_nav_menu_title()} onclose={() => (open = false)}>
	<div class="sheet">
		<div class="head content-frame">
			<a class="wordmark swash-focus" href={localizeHref('/')} aria-label={m.site_nav_wordmark_label()} onclick={close}>
				<span class="moon" aria-hidden="true"></span>
				<span class="font-display font-black tracking-wordmark uppercase">SOLO STACK</span>
			</a>
			<button type="button" class={MENU_TRIGGER} aria-label={m.site_nav_menu_close()} onclick={close}>
				<MenuGlyph close />
			</button>
		</div>

		<nav class="pages content-frame" aria-label={m.site_nav_label()}>
			<ul>
				{#each SITE_LINKS as link, index (link.id)}
					<li style:--i={index}>
						<a href={siteHref(link)} aria-current={siteCurrent(link, page.url.pathname)} onclick={close}>{link.label()}</a>
					</li>
				{/each}
			</ul>
		</nav>

		<div class="floor" aria-hidden="true">
			<div class="far"></div>
			<div class="land">
				<enhanced:img src={horizon} alt="" sizes="max(100vw, 70rem)" loading="lazy" decoding="async" />
				<span class="screen"></span>
				<span class="lights"></span>
			</div>
		</div>
	</div>
</dialog>

<style>
	:global(html:has(.site-menu[open])) {
		overflow: hidden;
	}

	.site-menu {
		width: 100%;
		max-width: none;
		height: 100dvh;
		max-height: none;
		margin: 0;
		padding: 0;
		border: 0;
		color: var(--foreground);
		/* the page's ground with its dusk at the top and the warm floor towards the horizon */
		background:
			radial-gradient(120% 22rem at 70% -4rem in oklab, var(--surface-dusk), transparent),
			linear-gradient(in oklab to top, color-mix(in oklab, var(--color-butter) 22%, var(--background)), var(--background) 45%);
		overflow: hidden;
	}

	:global(.dark) .site-menu {
		background:
			radial-gradient(120% 22rem at 70% -4rem in oklab, var(--surface-dusk), transparent), radial-gradient(70% 40% at 82% 100%, rgb(226 169 59 / 0.22), transparent 75%),
			linear-gradient(in oklab to top, #221e18, var(--background) 45%);
	}

	.site-menu::backdrop {
		background: transparent;
	}

	.sheet {
		display: grid;
		grid-template-rows: auto 1fr auto;
		height: 100%;
	}

	/* Same row as the navbar, so the close button replaces the menu button in place */
	.head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 4.5rem;
	}

	/* The navbar's wordmark, in place */
	.wordmark {
		--swash-x: 0;
		--swash-y: 0.2rem;
		display: inline-flex;
		align-items: center;
		gap: 0.55rem;
		min-height: 2.75rem;
		font-size: 1.125rem;
		line-height: 1;
	}

	.moon {
		width: 0.85em;
		height: 0.85em;
		border-radius: 999px;
		background: radial-gradient(circle at 70% 35%, transparent 0 46%, #b07a12 48%);
		box-shadow: 0 0 0.9em color-mix(in oklab, var(--color-butter) 70%, transparent);
		rotate: -20deg;
	}

	:global(.dark) .moon {
		background: radial-gradient(circle at 70% 35%, transparent 0 46%, var(--color-butter) 48%);
		box-shadow: 0 0 0.9em color-mix(in oklab, var(--color-butter) 45%, transparent);
	}

	.head button {
		margin-right: -0.75rem;
	}

	.pages {
		align-self: center;
		padding-bottom: 2rem;
	}

	.pages ul {
		display: grid;
		gap: clamp(0.25rem, 1.5vh, 0.75rem);
	}

	.pages a {
		position: relative;
		display: inline-flex;
		align-items: center;
		min-height: 3.5rem;
		font-family: var(--font-display);
		font-size: clamp(2.75rem, 14vw, 4.5rem);
		font-weight: 900;
		line-height: 1;
		letter-spacing: var(--tracking-wordmark);
		transition: color var(--dur-hover) ease;
	}

	/* The navbar's swash, at this size */
	.pages a::after {
		content: '';
		position: absolute;
		left: -0.05em;
		right: -0.1em;
		bottom: -0.1em;
		height: 0.2em;
		background: var(--ink-lit);
		mask: var(--ink-underline) center / 100% 100% no-repeat;
		scale: 0 1;
		transform-origin: left;
		transition: scale var(--dur-state) var(--ease-settle);
	}

	.pages a[aria-current]::after {
		scale: 1 1;
	}

	.pages a:hover {
		color: var(--ink-lit);
	}

	/* Keyboard focus: the swash at full strength in the focus ink, heavier than the current page's, and a soft light */
	.pages a:focus-visible {
		outline: none;
		box-shadow: none;
		animation: none;
		color: var(--ink-lit);
		filter: drop-shadow(0 0 0.5rem var(--focus-halo));
	}

	.pages a:focus-visible::after {
		scale: 1 1;
		height: 0.26em;
		background: var(--focus-ring);
	}

	/* The footer horizon as the floor: laptop cliff in view, the owl's tree gives way */
	.floor {
		position: relative;
		overflow: hidden;
		pointer-events: none;
	}

	/* wide enough that the cliff and its fireflies fill the phone's floor */
	.land {
		--land-w: max(100%, 70rem);
		position: relative;
		width: var(--land-w);
		margin-left: calc(100% - var(--land-w));
		aspect-ratio: 2172 / 299;
	}

	/* a far ridge in diluted ink behind it, like the footer's */
	.far {
		position: absolute;
		right: 0;
		bottom: 8%;
		width: max(130%, 90rem);
		aspect-ratio: 2172 / 299;
		scale: -1 1;
		/* inkiest at its ridge line, thinning out into the ground mist (no edge where the near ridge begins) */
		background: linear-gradient(to bottom, color-mix(in oklab, #3b3226 30%, transparent) 64%, transparent 97%);
		mask: var(--ridge) top / 100% 100% no-repeat;
	}

	:global(.dark) .far {
		background: linear-gradient(to bottom, #2b2620 64%, transparent 97%);
	}

	.land :global(picture) {
		display: contents;
	}

	.land :global(img) {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}

	.screen {
		position: absolute;
		left: 87.9%;
		top: 74%;
		width: 12%;
		aspect-ratio: 1.6;
		translate: -50% -50%;
		border-radius: 50%;
		background: radial-gradient(closest-side, rgb(255 244 214 / 0.55), rgb(252 215 114 / 0.28) 40%, rgb(226 169 59 / 0.08) 70%, transparent);
		mix-blend-mode: screen;
	}

	/* the three fireflies painted into the art, lit (on paper they would read as grey dots) */
	.lights {
		position: absolute;
		left: 75%;
		top: 68%;
		width: 4.5%;
		height: 18%;
		background:
			radial-gradient(circle at 33% 61%, rgb(252 215 114 / 0.95) 0 2px, rgb(226 169 59 / 0.35) 4px, transparent 9px),
			radial-gradient(circle at 56% 37%, rgb(252 215 114 / 0.95) 0 2px, rgb(226 169 59 / 0.35) 4px, transparent 9px),
			radial-gradient(circle at 69% 69%, rgb(252 215 114 / 0.95) 0 2px, rgb(226 169 59 / 0.35) 4px, transparent 9px);
	}

	:global(.dark) .lights {
		mix-blend-mode: screen;
		opacity: 0.6;
	}

	:global(html:not(.dark)) .screen {
		mix-blend-mode: normal;
		opacity: 0.7;
	}

	@media (prefers-reduced-motion: no-preference) {
		.site-menu[open] {
			animation: menu-in var(--dur-state) var(--ease-settle);
		}

		.site-menu[open] li {
			animation: menu-rise var(--dur-reveal) var(--ease-settle) both;
			animation-delay: calc(60ms + var(--i) * 45ms);
		}

		.site-menu[open] .floor {
			animation: menu-rise var(--dur-reveal) var(--ease-settle) 120ms both;
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
