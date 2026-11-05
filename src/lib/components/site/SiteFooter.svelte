<!--
	@component
	Footer of the non-home pages (the homepage has the sunrise): the floor of every subpage. A silhouette horizon (the owl's
	tree on the left, the cliff with the glowing laptop on the right, `assets/footer-horizon.webp`) rises out of the page, and
	the footer content sits on its ink ground, light on black in both themes. On narrow screens the strip keeps a minimum
	height and crops from the left, so the laptop cliff stays in view. The screen glow and three fireflies run only while the
	horizon is on screen; reduced motion gets them still. Social icons use the same Simple Icons paths as the sunrise.
-->
<script lang="ts">
	import { inView } from '#lib/home/shared/motion.svelte.ts';
	import { linkedSocials } from '#lib/home/data/socials.ts';
	import { SOCIAL_ICON_PATHS } from '#lib/home/sections/sunrise/icons.ts';
	import { LEGAL_LINKS } from '#lib/home/sections/sunrise/layout.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import horizon from './assets/footer-horizon.webp?w=2172;1600;1080&enhanced';

	const socials = linkedSocials();
	// TODO(owner): imprint and privacy pages do not exist yet (/kontakt does; same in the sunrise footer).
	// rel="external" keeps the prerender crawler from failing on them; drop it once they exist.
	const legalLabels = { imprint: m.site_footer_imprint, privacy: m.site_footer_privacy, contact: m.site_footer_contact };
	const year = new Date().getFullYear();

	let awake = $state(false);
</script>

<footer class="site-footer">
	<div class="horizon" data-awake={awake || undefined} aria-hidden="true" {@attach inView((visible) => (awake = visible), { rootMargin: '10% 0px' })}>
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
		<div class="mx-auto grid max-w-6xl gap-8 px-4 pt-6 pb-10 sm:px-8 md:grid-cols-2 md:items-end md:pt-4">
			<div class="grid justify-items-start gap-2">
				<a
					href={localizeHref('/')}
					class="inline-flex min-h-11 items-center font-display text-lg font-black tracking-wordmark text-cream uppercase"
					aria-label={m.site_nav_wordmark_label()}>SOLO STACK</a
				>
				<p class="text-quiet text-sm">{m.site_footer_tagline()}</p>
				<p class="text-quiet font-mono text-xs tracking-clock tabular-nums">© {year} SOLO STACK</p>
			</div>

			<div class="grid gap-4 md:justify-items-end">
				<nav aria-label={m.site_footer_socials_label()}>
					<ul class="-mx-2 flex flex-wrap gap-0.5 md:justify-end">
						{#each socials as social (social.id)}
							<li>
								<a
									href={social.url}
									target="_blank"
									rel="me noopener"
									title={social.name}
									aria-label={m.site_footer_social_link({ name: social.name })}
									class="social text-quiet grid size-11 place-items-center rounded-full"
								>
									<svg viewBox="0 0 24 24" class="size-4.5 fill-current" aria-hidden="true" focusable="false"><path d={SOCIAL_ICON_PATHS[social.icon]} /></svg>
								</a>
							</li>
						{/each}
					</ul>
				</nav>
				<nav aria-label={m.site_footer_legal_label()}>
					<ul class="flex flex-wrap gap-x-5 gap-y-1 text-sm">
						{#each LEGAL_LINKS as link (link.id)}
							<li>
								<a href={localizeHref(link.path)} rel={link.id === 'contact' ? undefined : 'external'} class="legal text-quiet inline-flex min-h-11 items-center"
									>{legalLabels[link.id]()}</a
								>
							</li>
						{/each}
					</ul>
				</nav>
			</div>
		</div>
	</div>
</footer>

<style>
	/*
	 * The ground is the ink of the painting (its bottom row, #131415), black in both themes; text on it is cream (≥ 15:1) or
	 * the quiet warm grey (#b3ab98, 7.9:1). Focus is the night ring in both themes.
	 */
	.site-footer {
		--ground: #131415;
		--quiet: #b3ab98;
		--focus-ring: var(--color-butter);
		--focus-glow: 0 0 1rem 0.1rem color-mix(in oklab, var(--color-butter) 30%, transparent);
		position: relative;
		isolation: isolate;
		margin-top: 2rem;
	}

	.text-quiet {
		color: var(--quiet);
	}

	.horizon {
		position: relative;
		overflow: hidden;
		pointer-events: none;
		/* the sky glow above the line: butter wash on paper, a low dusk light at night */
		background:
			radial-gradient(38% 78% at 86% 100%, color-mix(in oklab, var(--color-butter) 30%, transparent), transparent 72%),
			radial-gradient(22% 70% at 10% 100%, color-mix(in oklab, var(--color-butter) 16%, transparent), transparent 70%),
			linear-gradient(to top, color-mix(in oklab, var(--color-butter) 14%, transparent), transparent 55%);
	}

	/* At night the horizon is the lit part (the silhouette technique): a low ochre afterglow along the whole line */
	:global(.dark) .horizon {
		background:
			radial-gradient(34% 85% at 87% 100%, rgb(252 215 114 / 0.3), rgb(226 169 59 / 0.1) 55%, transparent 80%),
			radial-gradient(20% 75% at 10% 100%, rgb(252 215 114 / 0.2), transparent 75%),
			linear-gradient(to top, rgb(226 169 59 / 0.26), rgb(226 169 59 / 0.1) 35%, rgb(42 39 35 / 0.1) 60%, transparent 85%);
	}

	/*
	 * The strip at its own aspect (2172 × 299), never narrower than 76rem: on narrow screens it overflows to the left (anchored
	 * at 96 %), so the laptop cliff stays and the owl's tree gives way. Overlays are placed in the art's own percentages.
	 */
	.land {
		--land-w: max(100%, 76rem);
		--anchor: 0.96;
		position: relative;
		width: var(--land-w);
		margin-left: calc((100% - var(--land-w)) * var(--anchor));
		aspect-ratio: 2172 / 299;
		margin-bottom: -1px;
	}

	/* Wide screens: a little closer, so the tree and the laptop keep their presence (both stay in frame) */
	@media (min-width: 64rem) {
		.land {
			--land-w: 110%;
			--anchor: 0.45;
		}
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

	.ground {
		position: relative;
		background: var(--ground);
		color: var(--color-cream);
	}

	.social,
	.legal {
		transition:
			color var(--dur-hover) ease,
			background-color var(--dur-hover) ease;
	}

	.social:hover {
		color: var(--color-cream);
		background-color: rgb(251 243 221 / 0.08);
	}

	.legal:hover {
		color: var(--color-cream);
	}

	@media (prefers-reduced-motion: reduce) {
		.screen,
		.firefly {
			animation: none;
		}
	}
</style>
