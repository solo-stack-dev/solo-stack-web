<!--
	@component
	Footer of the non-home pages (the homepage has the sunrise): the floor of every subpage. Two silhouette ridges rise out
	of the page: a far one in diluted ink (the same art mirrored, as a mask) and the near horizon (`assets/footer-horizon.webp`:
	the owl's tree on the left, the cliff with the glowing laptop on the right). On narrow screens the strip keeps a minimum
	width and crops from the left, so the laptop cliff stays in view.

	The near ridge runs into its ink ground. The tagline and the platforms (small glyphs, 44px targets, a balanced 5 + 4
	block on phones) are set into that ground. Below it the giant wordmark stands on the bottom edge of the page with the
	fine print above it: cream on the ink at night; on paper the ground is one sumi stroke that runs dry after the glyphs,
	and the wordmark is ink on the paper, so the light theme never ends in a black slab.

	Spacing budget (docs/critique/ROUND-2.md): pages end without a bottom runway; the footer pulls its art up so the first
	visible silhouette sits ~112px under the page's last content on desktop and ~80px on phones (`--gap`). The screen glow
	and three fireflies run only while the horizon is on screen; reduced motion gets them still.
-->
<script lang="ts">
	import { inView } from '#lib/home/shared/motion.svelte.ts';
	import { linkedSocials } from '#lib/home/data/socials.ts';
	import { SOCIAL_ICON_PATHS } from '#lib/home/sections/sunrise/icons.ts';
	import { LEGAL_LINKS } from '#lib/home/sections/sunrise/layout.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import horizon from './assets/footer-horizon.webp?w=2172;1600;1080&enhanced';
	import ridgeMask from './assets/footer-horizon.webp?url';

	const socials = linkedSocials();
	// TODO(owner): imprint and privacy pages do not exist yet (/kontakt does; same in the sunrise footer).
	// rel="external" keeps the prerender crawler from failing on them; drop it once they exist.
	const legalLabels = { imprint: m.site_footer_imprint, privacy: m.site_footer_privacy, contact: m.site_footer_contact };
	const year = new Date().getFullYear();

	let awake = $state(false);
</script>

<footer class="site-footer" style:--ridge="url({ridgeMask})">
	<div class="horizon" data-awake={awake || undefined} aria-hidden="true" {@attach inView((visible) => (awake = visible), { rootMargin: '10% 0px' })}>
		<div class="far"></div>
		<div class="land">
			<enhanced:img src={horizon} alt="" sizes="(min-width: 64rem) 110vw, 76rem" loading="lazy" decoding="async" />
			<span class="screen"></span>
			<span class="lights"></span>
			<span class="firefly f1"></span>
			<span class="firefly f2"></span>
			<span class="firefly f3"></span>
		</div>
	</div>

	<div class="ground">
		<div class="band">
			<div class="band-row content-frame">
				<p class="tagline">{m.site_footer_tagline()}</p>
				<nav class="socials" aria-label={m.site_footer_socials_label()}>
					<ul>
						{#each socials as social (social.id)}
							<li>
								<a href={social.url} target="_blank" rel="me noopener" title={social.name} aria-label={m.site_footer_social_link({ name: social.name })}>
									<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d={SOCIAL_ICON_PATHS[social.icon]} /></svg>
								</a>
							</li>
						{/each}
					</ul>
				</nav>
			</div>
		</div>

		<div class="base content-frame">
			<div class="fine">
				<p class="copy label-sm">© {year} SOLO STACK</p>
				<nav aria-label={m.site_footer_legal_label()}>
					<ul class="legal">
						{#each LEGAL_LINKS as link (link.id)}
							<li>
								<a class="label" href={localizeHref(link.path)} rel={link.id === 'contact' ? undefined : 'external'}>{legalLabels[link.id]()}</a>
							</li>
						{/each}
					</ul>
				</nav>
			</div>

			<a class="giant font-display" href={localizeHref('/')} aria-label={m.site_nav_wordmark_label()}><span aria-hidden="true">SOLO STACK</span></a>
		</div>
	</div>
</footer>

<style>
	/*
	 * Ink ground: the painting's bottom row (#131415). On it: cream (≥ 15:1), quiet warm grey (#b3ab98, 7.9:1), butter focus.
	 * On paper (light theme, below the dry stroke): ink, `--muted-foreground` (5.3:1), the deep `--focus-ring`.
	 */
	.site-footer {
		--ground: #131415;
		--quiet: #b3ab98;
		/* the near strip: never narrower than 76rem (phones crop from the left), a little wider than the screen on desktop */
		--land-w: max(100cqw, 76rem);
		--anchor: 0.96;
		/* top of the first visible silhouette inside the strip (laptop cliff on phones, the owl's tree on desktop) */
		--art-top: 0.63;
		--gap: 3.5rem;
		position: relative;
		isolation: isolate;
		container-type: inline-size;
	}

	@media (min-width: 64rem) {
		.site-footer {
			--land-w: 110cqw;
			--anchor: 0.45;
			--art-top: 0.56;
			--gap: 5.5rem;
		}
	}

	/* Sky ---------------------------------------------------------------------------------------------------- */

	.horizon {
		position: relative;
		overflow: hidden;
		pointer-events: none;
		/* the transparent sky of the strip reaches up over the page's tail: pull it up so only `--gap` stays empty */
		margin-top: calc(var(--gap) - var(--land-w) * 299 / 2172 * var(--art-top) - var(--far-rise));
		padding-top: var(--far-rise);
		--far-rise: clamp(1.25rem, 3cqw, 3rem);
		/* the glow above the line: butter wash on paper */
		background:
			radial-gradient(38% 70% at 86% 100%, color-mix(in oklab, var(--color-butter) 34%, transparent), transparent 72%),
			radial-gradient(24% 60% at 10% 100%, color-mix(in oklab, var(--color-butter) 18%, transparent), transparent 70%),
			linear-gradient(to top, color-mix(in oklab, var(--color-butter) 18%, transparent), transparent 60%);
	}

	/* At night the horizon is the lit part (the silhouette technique): a low ochre afterglow along the whole line */
	:global(.dark) .horizon {
		background:
			radial-gradient(34% 80% at 87% 100%, rgb(252 215 114 / 0.3), rgb(226 169 59 / 0.1) 55%, transparent 80%),
			radial-gradient(22% 70% at 10% 100%, rgb(252 215 114 / 0.18), transparent 75%),
			linear-gradient(to top, rgb(226 169 59 / 0.3), rgb(226 169 59 / 0.12) 35%, rgb(42 39 35 / 0.1) 62%, transparent 88%);
	}

	/*
	 * The far ridge: the strip's own silhouette, mirrored and larger, as a mask over a flat diluted ink (lighter than the near
	 * ridge: atmospheric depth). Lifted by `--far-rise`, its ground hides behind the near strip.
	 */
	.far {
		position: absolute;
		left: 0;
		bottom: 0;
		--far-w: calc(var(--land-w) * 1.35);
		--far-lift: calc(var(--far-rise) + var(--land-w) * 0.012);
		width: var(--far-w);
		height: calc(var(--far-w) * 299 / 2172 + var(--far-lift));
		margin-left: calc((100cqw - var(--far-w)) * 0.5);
		scale: -1 1;
		/* a sumi wash: inkiest at the ridge line, thinning out into the paper below it */
		background: linear-gradient(to bottom, color-mix(in oklab, #3b3226 30%, transparent) 64%, color-mix(in oklab, #3b3226 8%, transparent) 78%, transparent 92%);
		mask:
			var(--ridge) top / 100% calc(100% - var(--far-lift)) no-repeat,
			linear-gradient(#000 0 0) bottom / 100% calc(var(--far-lift) + 2px) no-repeat;
	}

	:global(.dark) .far {
		background: #2b2620;
	}

	/* The near strip at its own aspect (2172 × 299); overlays are placed in the art's own percentages. */
	.land {
		position: relative;
		width: var(--land-w);
		margin-left: calc((100cqw - var(--land-w)) * var(--anchor));
		aspect-ratio: 2172 / 299;
		margin-bottom: -1px;
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

	/* Light of the laptop screen spilling onto the cliff and the sky */
	.screen {
		position: absolute;
		left: 87.9%;
		top: 74%;
		width: 9%;
		aspect-ratio: 1.6;
		translate: -50% -50%;
		border-radius: 50%;
		background: radial-gradient(closest-side, rgb(255 244 214 / 0.55), rgb(252 215 114 / 0.28) 40%, rgb(226 169 59 / 0.08) 70%, transparent);
		mix-blend-mode: screen;
		animation: screen 5.5s ease-in-out infinite alternate;
	}

	:global(html:not(.dark)) .screen {
		mix-blend-mode: normal;
		opacity: 0.7;
	}

	@keyframes screen {
		0%,
		60% {
			opacity: 0.85;
		}
		72% {
			opacity: 0.68;
		}
		100% {
			opacity: 1;
		}
	}

	/* The three fireflies painted into the art: lit on paper too (painted for the night, they would read as grey dots) */
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

	.firefly {
		position: absolute;
		width: 3px;
		height: 3px;
		border-radius: 50%;
		background: var(--color-moonlight);
		box-shadow:
			0 0 3px 1px rgb(252 215 114 / 0.9),
			0 0 10px 3px rgb(252 215 114 / 0.35);
		opacity: 0.85;
		animation:
			drift var(--dur) ease-in-out var(--delay) infinite alternate,
			glow calc(var(--dur) * 0.45) ease-in-out var(--delay) infinite alternate;
	}

	/* On paper a firefly is a warm drop of ochre light */
	:global(html:not(.dark)) .firefly {
		background: var(--color-butter);
		box-shadow:
			0 0 2px 1px rgb(226 169 59 / 0.95),
			0 0 9px 3px rgb(226 169 59 / 0.45);
	}

	.f1 {
		left: 80.5%;
		top: 60%;
		--dur: 7s;
		--delay: -2s;
		--dx: 14px;
		--dy: -18px;
	}

	.f2 {
		left: 83.6%;
		top: 47%;
		--dur: 9s;
		--delay: -5s;
		--dx: -12px;
		--dy: -10px;
	}

	.f3 {
		left: 74.6%;
		top: 66%;
		--dur: 8s;
		--delay: -1s;
		--dx: 10px;
		--dy: -22px;
	}

	@keyframes drift {
		50% {
			translate: calc(var(--dx) * 0.4) calc(var(--dy) * 0.8);
		}
		100% {
			translate: var(--dx) var(--dy);
		}
	}

	@keyframes glow {
		0%,
		35% {
			opacity: 0.15;
		}
		100% {
			opacity: 1;
		}
	}

	.horizon:not([data-awake]) * {
		animation-play-state: paused;
	}

	/* Ground ------------------------------------------------------------------------------------------------- */

	.ground {
		position: relative;
		color: var(--foreground);
	}

	:global(.dark) .ground {
		background: var(--ground);
	}

	/* The ink right under the ridge: always ink. On paper its lower edge is a dry brush running out (horizontal streaks). */
	.band {
		--focus-ring: var(--color-butter);
		--focus-glow: 0 0 1rem 0.1rem color-mix(in oklab, var(--color-butter) 30%, transparent);
		position: relative;
		background: var(--ground);
		color: var(--color-cream);
	}

	.band::after {
		content: '';
		position: absolute;
		inset: 100% 0 auto;
		height: clamp(4rem, 8cqw, 7rem);
		margin-top: -1px;
		background: var(--ground);
		mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1400 120' width='1400' height='120' preserveAspectRatio='none'%3E%3ClinearGradient id='g' x2='0' y2='1'%3E%3Cstop offset='0' stop-color='%23fff'/%3E%3Cstop offset='1' stop-color='%23000'/%3E%3C/linearGradient%3E%3Cfilter id='d' x='0' y='0' width='1' height='1' color-interpolation-filters='sRGB'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.0028 0.07' numOctaves='4' seed='7' result='n'/%3E%3CfeComposite in='SourceGraphic' in2='n' operator='arithmetic' k2='1.1' k3='1.2' k4='-0.72'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 7 0 0 0 -3.3'/%3E%3C/filter%3E%3Crect width='1400' height='120' fill='url(%23g)' filter='url(%23d)'/%3E%3C/svg%3E")
			0 0 / 100% 100% no-repeat;
		pointer-events: none;
	}

	:global(.dark) .band::after {
		display: none;
	}

	.band-row {
		display: grid;
		gap: 1rem;
		justify-items: center;
		padding-block: 0.75rem 0.5rem;
		text-align: center;
	}

	.tagline {
		max-width: 34ch;
		font-family: var(--font-display);
		font-size: 1rem;
		font-weight: 600;
		line-height: 1.4;
		color: color-mix(in oklab, var(--color-cream) 88%, var(--ground));
		text-wrap: balance;
	}

	/* 44px targets; a balanced 5 / 4 block on phones (9 in a row would not fit 390px) */
	.socials ul {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		max-width: calc(5 * 2.75rem + 4 * 0.75rem);
		gap: 0.25rem 0.75rem;
	}

	.socials a {
		display: grid;
		place-items: center;
		width: 2.75rem;
		height: 2.75rem;
		border-radius: 50%;
		color: var(--quiet);
		transition: color var(--dur-hover) ease;
	}

	.socials a:hover {
		color: var(--color-butter);
	}

	.socials svg {
		width: 1.125rem;
		height: 1.125rem;
		fill: currentColor;
	}

	@media (min-width: 48rem) {
		.band-row {
			grid-template-columns: 1fr auto;
			align-items: center;
			justify-items: start;
			text-align: left;
			padding-block: 0.25rem 0;
		}

		.tagline {
			max-width: none;
		}

		/* the last glyph (not its hit area) ends on the content edge */
		.socials ul {
			max-width: none;
			flex-wrap: nowrap;
			gap: 0.125rem;
			margin-right: -0.8125rem;
		}
	}

	/* The base: fine print, then the wordmark standing on the bottom edge */
	.base {
		position: relative;
		display: grid;
		padding-top: clamp(3.75rem, 7cqw, 6rem);
	}

	:global(.dark) .base {
		padding-top: clamp(2.5rem, 5cqw, 4.5rem);
		--focus-ring: var(--color-butter);
	}

	.fine {
		display: grid;
		justify-items: center;
		gap: 0.25rem;
		color: var(--muted-foreground);
	}

	:global(.dark) .fine {
		color: var(--quiet);
	}

	.copy {
		padding-block: 0.75rem;
	}

	.legal {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		column-gap: 1.5rem;
	}

	.legal a {
		display: inline-flex;
		align-items: center;
		min-height: 2.75rem;
		transition: color var(--dur-hover) ease;
	}

	.legal a:hover {
		color: var(--ink-lit);
	}

	@media (min-width: 48rem) {
		.fine {
			grid-template-columns: 1fr auto;
			align-items: center;
		}

		.fine .copy {
			justify-self: start;
		}

		.legal {
			margin-right: 0;
		}
	}

	/*
	 * The giant wordmark spans the content column exactly (container units), standing on the page's bottom edge: cap height
	 * only, no descenders, so it can sit on the edge. Ink on paper; cream at night, sinking into the ground towards its foot.
	 */
	.giant {
		display: block;
		overflow: clip;
		margin-top: clamp(0.5rem, 1.5cqw, 1.5rem);
		container-type: inline-size;
		line-height: 0;
		border-radius: 0.1em;
	}

	.giant span {
		display: block;
		/* "SOLO STACK" at 900 / -0.045em inks 6.0 em wide: this fills the column to the pixel */
		font-size: 16.6cqi;
		font-weight: 900;
		line-height: 1;
		letter-spacing: var(--tracking-wordmark);
		white-space: nowrap;
		/* cap height to baseline only (plus the round letters' overshoot), so it can stand on the edge */
		text-box: trim-both cap alphabetic;
		padding-block: 0.04em 0.03em;
		margin-bottom: -0.03em;
		/* trims the S's side bearing so it starts on the content edge */
		margin-left: -0.04em;
		background: linear-gradient(to bottom, var(--color-ink) 55%, color-mix(in oklab, var(--color-ink) 82%, var(--background)));
		background-clip: text;
		color: transparent;
		transition: opacity var(--dur-hover) ease;
	}

	:global(.dark) .giant span {
		background: linear-gradient(
			to bottom,
			var(--color-moonlight),
			var(--color-cream) 28%,
			color-mix(in oklab, var(--color-cream) 55%, var(--ground)) 82%,
			color-mix(in oklab, var(--color-cream) 40%, var(--ground))
		);
		background-clip: text;
	}

	.giant:hover span {
		opacity: 0.86;
	}

	@media (prefers-reduced-motion: reduce) {
		.screen,
		.firefly {
			animation: none;
		}
	}
</style>
