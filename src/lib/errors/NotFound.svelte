<!--
	@component
	404: the page went missing, like Ging. Scene: `WorldTree.svelte`. A license seal (an original World Tree seal,
	`HunterEmblem.svelte`) opens the license issued to the mascot, No. 404 (native popover: light dismiss and Escape for free).
	Desktop: the seal is pressed into the painting's dark lower corner like an artist's seal; phones: beside the 404 numerals,
	like a seal beside a signature (the sky above the text has no quiet corner). The license is an aged paper document:
	deckled edge, a printed rule, the mascot's photo printed on the paper, one ochre ink stamp as its only emblem.
-->
<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import photo from './assets/error-mascot-lost.webp?enhanced';
	import grain from './assets/error-paper-grain.webp';
	import ErrorShell from './ErrorShell.svelte';
	import HunterEmblem from './HunterEmblem.svelte';
	import WorldTree from './WorldTree.svelte';

	/** Pointer over the card, 0 … 1, drives the raking light and the tilt. */
	let glare = $state({ x: 0.5, y: 0.5 });

	function tilt(event: PointerEvent) {
		const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
		glare = { x: (event.clientX - rect.left) / rect.width, y: (event.clientY - rect.top) / rect.height };
	}
</script>

{#snippet seal(placement: 'scene' | 'inline')}
	<button type="button" class="seal is-{placement}" popovertarget="hunter-license" aria-label={m.error_404_license_label()}>
		<HunterEmblem stamp />
	</button>
{/snippet}

<ErrorShell status={404} title={m.error_404_title()} body={m.error_404_body()} variant="tree">
	{#snippet stamp()}
		{@render seal('inline')}
	{/snippet}

	{#snippet badge()}
		{@render seal('scene')}

		<div id="hunter-license" class="license-popover" popover>
			<!-- svelte-ignore a11y_no_static_element_interactions (decorative tilt only) -->
			<div
				class="license"
				style:--gx={glare.x}
				style:--gy={glare.y}
				style:--grain="url({grain})"
				onpointermove={tilt}
				onpointerleave={() => (glare = { x: 0.5, y: 0.5 })}
			>
				<div class="license-head">
					<p class="license-title font-display font-black tracking-wordmark uppercase">{m.error_404_license_title()}</p>
					<p class="license-class">{m.error_404_license_class()}</p>
				</div>
				<div class="license-body">
					<enhanced:img class="photo" src={photo} alt="" sizes="5rem" />
					<div class="license-id">
						<p class="font-mono text-xs tracking-clock" aria-hidden="true">No.</p>
						<p class="number font-mono font-bold tabular-nums">404</p>
						<p class="font-display font-black tracking-wordmark uppercase">SOLO STACK</p>
					</div>
				</div>
				<p class="license-note">{m.error_404_license_note()}</p>
				<HunterEmblem stamp class="ink-stamp" />
				<div class="light" aria-hidden="true"></div>
			</div>
		</div>
	{/snippet}

	{#snippet scene()}
		<WorldTree />
	{/snippet}
</ErrorShell>

<style>
	/*
	 * The seal ---------------------------------------------------------------------------------------------------
	 * One butter pigment, a little uneven, no outline, no shadow, no sticker. Desktop: pressed into the painting's dark lower
	 * right corner, on the cloud sea's shadow. Phones: pressed beside the 404 numerals, its foot on their baseline (the same
	 * button is hidden in the other place). Hover: the pigment lights up a little. At least a 44px target.
	 */
	.seal {
		width: clamp(3.25rem, 4.2vw, 4rem);
		padding: 0;
		rotate: -7deg;
		color: var(--color-butter);
		opacity: 0.8;
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
		transition:
			opacity var(--dur-hover) ease,
			rotate 220ms cubic-bezier(0.3, 1.5, 0.5, 1),
			filter var(--dur-hover) ease;
	}

	.seal:hover {
		opacity: 1;
		rotate: -3deg;
		filter: drop-shadow(0 0 0.6rem rgb(252 215 114 / 0.35));
	}

	.seal:focus-visible {
		opacity: 1;
		outline: 2px dashed var(--color-butter);
		outline-offset: 0.3rem;
		border-radius: 50%;
	}

	.is-scene {
		position: absolute;
		right: max(1.25rem, 3vw);
		bottom: max(1.5rem, 4svh);
	}

	.is-inline {
		position: absolute;
		left: 100%;
		bottom: 0.15rem;
		width: 3rem;
		margin-left: 0.6rem;
		rotate: -9deg;
		opacity: 0.72;
	}

	@media (max-width: 63.99rem) {
		.is-scene {
			display: none;
		}
	}

	@media (min-width: 64rem) {
		.is-inline {
			display: none;
		}
	}

	/* License: an aged paper document ------------------------------------------------------------------------------ */

	.license-popover {
		margin: auto;
		padding: 0;
		border: 0;
		background: transparent;
		overflow: visible;
		color: var(--license-ink);
		perspective: 900px;
		/* ink on the paper: ≥ 10:1 for the type, the quiet lines ≥ 5.5:1 */
		--license-ink: #1c1a16;
		--license-quiet: #4f473a;
	}

	.license-popover::backdrop {
		background: rgb(14 15 16 / 0.6);
		backdrop-filter: blur(3px);
	}

	/*
	 * Paper: a warm cream that yellowed towards its edges, foxing in two corners, the page's paper grain worked in (soft light). The
	 * edge is deckled (a displaced rectangle as the mask), the corners straight. No border, no shadow: the paper itself
	 * against the night.
	 */
	.license {
		--tilt-x: calc((var(--gy) - 0.5) * -8deg);
		--tilt-y: calc((var(--gx) - 0.5) * 12deg);
		--deckle: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 368 232' preserveAspectRatio='none'%3E%3Cfilter id='d' x='-4%25' y='-6%25' width='108%25' height='112%25'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.16 .19' numOctaves='3' seed='8'/%3E%3CfeDisplacementMap in='SourceGraphic' scale='6' xChannelSelector='R' yChannelSelector='G'/%3E%3C/filter%3E%3Crect x='3.5' y='3.5' width='361' height='225' fill='%23fff' filter='url(%23d)'/%3E%3C/svg%3E");
		position: relative;
		display: grid;
		gap: 0.85rem;
		width: min(23rem, 88vw);
		aspect-ratio: 1.586;
		padding: 1.25rem 1.4rem;
		background:
			var(--grain) 0 0 / 180px,
			radial-gradient(26% 34% at 94% 8%, rgb(176 120 40 / 0.16), transparent 70%),
			radial-gradient(22% 30% at 6% 94%, rgb(176 120 40 / 0.14), transparent 70%),
			radial-gradient(120% 115% at 48% 42%, transparent 52%, rgb(190 140 60 / 0.32) 100%),
			linear-gradient(168deg, #f4e9cb, #ecdcb4);
		background-blend-mode: soft-light, normal, normal, normal, normal;
		mask: var(--deckle) 0 0 / 100% 100% no-repeat;
		transform: rotateX(var(--tilt-x)) rotateY(var(--tilt-y));
		transition: transform 160ms ease-out;
	}

	/* the printed rule of an official form, inside the deckle */
	.license::before {
		content: '';
		position: absolute;
		inset: 0.55rem;
		border: 1px solid rgb(28 26 22 / 0.32);
		pointer-events: none;
	}

	.license-title {
		font-size: 1.2rem;
		line-height: 1;
		color: var(--license-ink);
	}

	.license-class {
		margin-top: 0.25rem;
		font-size: 0.85rem;
		color: var(--license-quiet);
	}

	.license-body {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	/* the photo printed on the paper: straight edges, a thin ink frame, the paper showing through */
	.photo {
		width: 4.75rem;
		height: 4.75rem;
		flex: none;
		object-fit: cover;
		object-position: 50% 12%;
		background: #e8cf95;
		border: 1px solid rgb(28 26 22 / 0.55);
		filter: sepia(0.3) saturate(0.85) contrast(1.05);
		mix-blend-mode: multiply;
	}

	.license-id p:first-child {
		color: var(--license-quiet);
	}

	.number {
		font-size: 2.2rem;
		line-height: 1;
		letter-spacing: -0.04em;
		color: var(--license-ink);
	}

	.license-note {
		font-size: 0.8rem;
		line-height: 1.4;
		color: var(--license-quiet);
	}

	/* the issuing office's ochre ink stamp, pressed off-square over the empty right of the body */
	.license :global(.ink-stamp) {
		position: absolute;
		right: 1.1rem;
		top: 38%;
		width: 5.6rem;
		color: #b07a1c;
		opacity: 0.62;
		rotate: -14deg;
		mix-blend-mode: multiply;
		pointer-events: none;
	}

	/* warm raking light following the pointer: the paper's tooth catches it */
	.light {
		position: absolute;
		inset: 0;
		background: radial-gradient(45% 60% at calc(var(--gx) * 100%) calc(var(--gy) * 100%), rgb(255 248 228 / 0.55), transparent 70%);
		mix-blend-mode: soft-light;
		pointer-events: none;
	}

	@media (prefers-reduced-motion: no-preference) {
		.license-popover {
			transition:
				opacity 260ms ease,
				translate 420ms cubic-bezier(0.2, 1.3, 0.4, 1),
				rotate 420ms cubic-bezier(0.2, 1.3, 0.4, 1),
				scale 420ms cubic-bezier(0.2, 1.3, 0.4, 1),
				overlay 420ms allow-discrete,
				display 420ms allow-discrete;
		}

		.license-popover:not(:popover-open) {
			opacity: 0;
			translate: 0 2rem;
			rotate: -8deg;
			scale: 0.85;
		}

		@starting-style {
			.license-popover:popover-open {
				opacity: 0;
				translate: -30vw -20svh;
				rotate: -40deg;
				scale: 0.3;
			}
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.license {
			transform: none;
		}
	}
</style>
