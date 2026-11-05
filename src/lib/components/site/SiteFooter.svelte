<!--
	@component
	Footer of the non-home pages (the homepage has the sunrise): the floor of every subpage, one painting in both themes.
	Back to front: the afterglow on the sky, a far ridge in diluted ink (the near art mirrored, as a mask), the giant
	wordmark standing in the landscape, and the near horizon (`assets/footer-horizon.webp`: the owl's tree on the left, the
	cliff with the glowing laptop on the right) whose ridge covers the wordmark's feet. On narrow screens the strip crops
	from the left, so the laptop cliff stays in view.

	The near ridge runs into one ink ground down to the page's bottom edge, in both themes (no paper band between ink
	layers): tagline and platforms (small glyphs, 44px targets, a balanced 5 + 4 block on phones), then © and the legal links.

	Spacing budget (docs/critique/ROUND-2.md): pages end without a bottom runway; the footer pulls its sky up so the top of
	the wordmark sits `--gap` under the page's last content (104px desktop, 72px phones). The screen glow and three fireflies
	run only while the horizon is on screen; reduced motion gets them still.
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
		<!-- The closing wordmark stands in the landscape: behind the near ridge, which covers its feet -->
		<div class="mark"><span class="font-display"><span>SOLO</span> <span>STACK</span></span></div>
		<!-- Brush edge for the wordmark: a slight displacement of its outline, so it reads painted, not typeset -->
		<svg class="brush" width="0" height="0">
			<filter id="footer-brush" x="-2%" y="-5%" width="104%" height="110%">
				<feTurbulence type="fractalNoise" baseFrequency="0.06 0.09" numOctaves="2" seed="4" />
				<feDisplacementMap in="SourceGraphic" scale="2.2" xChannelSelector="R" yChannelSelector="G" />
			</filter>
		</svg>
		<div class="land">
			<enhanced:img src={horizon} alt="" sizes="(min-width: 64rem) 110vw, (min-width: 40rem) 76rem, 200vw" loading="lazy" decoding="async" />
			<span class="screen"></span>
			<span class="lights"></span>
			<span class="firefly f1"></span>
			<span class="firefly f2"></span>
			<span class="firefly f3"></span>
		</div>
	</div>

	<!-- One ink ground from the ridge to the page's bottom edge, in both themes -->
	<div class="ground">
		<div class="ground-grid content-frame">
			<p class="tagline">{m.site_footer_tagline()}</p>
			<nav class="socials" aria-label={m.site_footer_socials_label()}>
				<ul>
					{#each socials as social (social.id)}
						<li>
							<a
								class="swash-focus"
								href={social.url}
								target="_blank"
								rel="me noopener"
								title={social.name}
								aria-label={m.site_footer_social_link({ name: social.name })}
							>
								<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d={SOCIAL_ICON_PATHS[social.icon]} /></svg>
							</a>
						</li>
					{/each}
				</ul>
			</nav>
			<p class="copy label-sm">© {year} SOLO STACK</p>
			<nav class="legal-nav" aria-label={m.site_footer_legal_label()}>
				<ul class="legal">
					{#each LEGAL_LINKS as link (link.id)}
						<li>
							<a class="swash-focus label" href={localizeHref(link.path)} rel={link.id === 'contact' ? undefined : 'external'}>{legalLabels[link.id]()}</a>
						</li>
					{/each}
				</ul>
			</nav>
		</div>
	</div>
</footer>

<style>
	/*
	 * Ink ground: the painting's bottom row (#131415), the same in both themes. On it: cream (≥ 15:1), quiet warm grey
	 * (#b3ab98, 7.9:1), butter focus (12:1).
	 */
	.site-footer {
		--ground: #131415;
		--quiet: #b3ab98;
		/* the near strip: phones show its right half (laptop cliff), tablets keep a minimum width, desktop is a little wider than the screen */
		--land-w: 200cqw;
		--anchor: 1;
		--gap: 4.5rem;
		position: relative;
		isolation: isolate;
		container-type: inline-size;
	}

	@media (min-width: 40rem) {
		.site-footer {
			--land-w: max(100cqw, 76rem);
			--anchor: 0.96;
		}
	}

	@media (min-width: 64rem) {
		.site-footer {
			--land-w: 110cqw;
			--anchor: 0.45;
			--gap: 6.5rem;
		}
	}

	/* Sky ---------------------------------------------------------------------------------------------------- */

	/*
	 * The strip's transparent sky reaches up over the page's tail: the horizon is pulled up so exactly `--gap` stays empty
	 * above the first visible shape, the top of the wordmark's capitals (`--mark-top`, measured from the horizon's top).
	 */
	.horizon {
		--far-rise: clamp(1.25rem, 3cqw, 3rem);
		--land-h: calc(var(--land-w) * 299 / 2172);
		--column: calc(min(100cqw, var(--content-max)) - 2 * var(--content-gutter));
		/* the wordmark's baseline, as a fraction of the strip's height from its bottom: just under the ridge line (~0.13-0.16) */
		--foot: 0.065;
		/* "SOLO STACK" at 900 / -0.045em inks 6.0 em wide: 16.6% of the column fills it; Geist caps are 0.71 em */
		--mark-size: calc(var(--column) * 0.166);
		--mark-h: calc(var(--mark-size) * 0.71);
		/* room above the strip for the capitals, and their top: the first visible shape of the footer */
		--sky: max(var(--far-rise), var(--mark-h) - var(--land-h) * (1 - var(--foot)) + 1rem);
		--mark-top: calc(var(--sky) + var(--land-h) * (1 - var(--foot)) - var(--mark-h));
		position: relative;
		overflow: hidden;
		pointer-events: none;
		margin-top: calc(var(--gap) - var(--mark-top));
		padding-top: var(--sky);
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
		/* a sumi wash: inkiest at the ridge line, thinning out towards the near ridge */
		background: linear-gradient(to bottom, color-mix(in oklab, #3b3226 30%, transparent) 64%, color-mix(in oklab, #3b3226 8%, transparent) 78%, transparent 92%);
		mask:
			var(--ridge) top / 100% calc(100% - var(--far-lift)) no-repeat,
			linear-gradient(#000 0 0) bottom / 100% calc(var(--far-lift) + 2px) no-repeat;
	}

	:global(.dark) .far {
		background: #2b2620;
	}

	/*
	 * The wordmark as a landmark of the same night, set on the content column (never wider, so never clipped) and standing
	 * between the far and the near ridge: the near ridge, the owl's tree and the laptop cliff stand in front of its feet.
	 * Cap height to baseline only, so `bottom` places the baseline. Paper: a diluted sumi wash, mottled like the paper, that
	 * thins into the butter glow at the horizon (lighter than the black ridge in front of it, darker than the far one: depth).
	 */
	.mark {
		/* pigment pooling: horizontal dry-brush streaks of ink, a little denser in places (one small turbulence tile) */
		--mark-pigment: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='416' height='416'%3E%3Cfilter id='w' x='0' y='0' width='1' height='1'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.011 0.045' numOctaves='4' seed='5' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.09 0 0 0 0 0.08 0 0 0 0 0.07 0 0 0 1.1 -0.42'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23w)'/%3E%3C/svg%3E");
		position: absolute;
		inset: auto 0 calc(var(--land-h) * var(--foot));
		width: 100%;
		max-width: var(--content-max);
		margin-inline: auto;
		padding-inline: var(--content-gutter);
		line-height: 0;
	}

	.mark > span {
		display: block;
		font-size: var(--mark-size);
		font-weight: 900;
		line-height: 1;
		letter-spacing: var(--tracking-wordmark);
		white-space: nowrap;
		text-box: trim-both cap alphabetic;
		/* trims the S's side bearing so it starts on the content edge */
		margin-left: -0.04em;
		background:
			var(--mark-pigment) 0 0 / 26rem 26rem,
			linear-gradient(
				to bottom,
				color-mix(in oklab, #2e271d 66%, var(--background)),
				color-mix(in oklab, #3b3226 54%, var(--background)) 60%,
				color-mix(in oklab, #3b3226 40%, var(--color-butter))
			);
		background-clip: text;
		color: transparent;
		filter: url(#footer-brush);
	}

	/* Phones: SOLO stacked on STACK, "STACK" (3.2 em inked) across the column, so it stays large without leaving it */
	@media (max-width: 39.99rem) {
		.horizon {
			--mark-size: calc(var(--column) / 3.2);
			--mark-h: calc(var(--mark-size) * (0.71 + 0.84));
		}

		/* one line every 0.84em: the wash repeats per line, so STACK gets the same shading as SOLO */
		.mark > span,
		:global(.dark) .mark > span {
			line-height: 0.84;
			background-size:
				26rem 26rem,
				100% 0.84em;
		}

		.mark span span {
			display: block;
		}
	}

	/* Without text-box trimming the line box keeps the descender space: drop it, so the baseline stays under the ridge */
	@supports not (text-box: trim-both cap alphabetic) {
		.mark > span {
			line-height: 0.71;
			translate: 0 0.12em;
		}
	}

	/* Night: moonlit, not lamp-lit; the far ridge shows faintly through the lower letters, the afterglow warms their feet */
	:global(.dark) .mark > span {
		background:
			var(--mark-pigment) 0 0 / 26rem 26rem,
			linear-gradient(
				to bottom,
				color-mix(in oklab, var(--color-moonlight) 72%, transparent),
				color-mix(in oklab, var(--color-cream) 58%, transparent) 34%,
				color-mix(in oklab, #d9b878 36%, transparent) 78%,
				color-mix(in oklab, var(--color-ochre) 30%, transparent)
			);
		background-clip: text;
	}

	.brush {
		position: absolute;
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

	/* The near ridge runs into this ink to the page's bottom edge; everything on it is cream and butter in both themes */
	.ground {
		--focus-ring: var(--color-butter);
		--focus-halo: color-mix(in oklab, var(--color-butter) 55%, transparent);
		position: relative;
		background: var(--ground);
		color: var(--color-cream);
		padding-bottom: clamp(1rem, 2.5cqw, 1.75rem);
	}

	.ground-grid {
		display: grid;
		justify-items: center;
		gap: 0.75rem;
		padding-top: 0.75rem;
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
		--swash-x: 0.8rem;
		--swash-y: 0.2rem;
		--swash-h: 0.32rem;
		display: grid;
		place-items: center;
		width: 2.75rem;
		height: 2.75rem;
		color: var(--quiet);
		transition: color var(--dur-hover) ease;
	}

	.socials svg {
		width: 1.125rem;
		height: 1.125rem;
		fill: currentColor;
	}

	.copy {
		margin-top: 0.75rem;
		color: var(--quiet);
	}

	.legal {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		column-gap: 1.5rem;
	}

	.legal a {
		--swash-x: -0.1rem;
		--swash-y: 0.45rem;
		--swash-h: 0.3rem;
		display: inline-flex;
		align-items: center;
		min-height: 2.75rem;
		color: var(--quiet);
		transition: color var(--dur-hover) ease;
	}

	.socials a:hover,
	.legal a:hover,
	.socials a:focus-visible,
	.legal a:focus-visible {
		color: var(--color-butter);
	}

	/* Two rows on one ground: tagline | platforms, then © | legal; the last glyph and the last link end on the content edge */
	@media (min-width: 48rem) {
		.ground-grid {
			grid-template-columns: 1fr auto;
			align-items: center;
			justify-items: start;
			gap: clamp(0.25rem, 1cqw, 0.75rem) 2rem;
			padding-top: 0.25rem;
			text-align: left;
		}

		.tagline {
			max-width: none;
		}

		.socials,
		.legal-nav {
			justify-self: end;
		}

		.socials ul {
			max-width: none;
			flex-wrap: nowrap;
			gap: 0.125rem;
			margin-right: -0.8125rem;
		}

		.copy {
			margin-top: 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.screen,
		.firefly {
			animation: none;
		}
	}
</style>
