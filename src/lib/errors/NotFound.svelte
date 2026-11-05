<!--
	@component
	404: the page went missing, like Ging. Scene: `WorldTree.svelte`. A license seal (an original World Tree seal,
	`HunterEmblem.svelte`), pressed into the painting like an artist's seal, opens a holographic license card issued to the mascot, No. 404 (native popover: light dismiss and Escape for free).
-->
<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import photo from './assets/error-mascot-lost.webp?enhanced';
	import ErrorShell from './ErrorShell.svelte';
	import HunterEmblem from './HunterEmblem.svelte';
	import WorldTree from './WorldTree.svelte';

	/** Pointer over the card, 0 … 1, drives the holo sheen and the tilt. */
	let glare = $state({ x: 0.5, y: 0.5 });

	function tilt(event: PointerEvent) {
		const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
		glare = { x: (event.clientX - rect.left) / rect.width, y: (event.clientY - rect.top) / rect.height };
	}
</script>

<ErrorShell status={404} title={m.error_404_title()} body={m.error_404_body()} variant="tree">
	{#snippet badge()}
		<button type="button" class="seal" popovertarget="hunter-license" aria-label={m.error_404_license_label()}>
			<HunterEmblem stamp />
		</button>

		<div id="hunter-license" class="license-popover" popover>
			<!-- svelte-ignore a11y_no_static_element_interactions (decorative tilt only) -->
			<div class="license" style:--gx={glare.x} style:--gy={glare.y} onpointermove={tilt} onpointerleave={() => (glare = { x: 0.5, y: 0.5 })}>
				<HunterEmblem class="watermark" />
				<div class="license-head">
					<HunterEmblem class="emblem" />
					<div>
						<p class="license-title font-display font-black tracking-wordmark uppercase">{m.error_404_license_title()}</p>
						<p class="license-class">{m.error_404_license_class()}</p>
					</div>
				</div>
				<div class="license-body">
					<enhanced:img class="photo" src={photo} alt="" sizes="5rem" />
					<div class="license-id">
						<p class="font-mono text-xs tracking-clock opacity-70" aria-hidden="true">No.</p>
						<p class="number font-mono font-bold tabular-nums">404</p>
						<p class="font-display font-black tracking-wordmark uppercase">SOLO STACK</p>
					</div>
				</div>
				<p class="license-note">{m.error_404_license_note()}</p>
				<div class="holo" aria-hidden="true"></div>
			</div>
		</div>
	{/snippet}

	{#snippet scene()}
		<WorldTree />
	{/snippet}
</ErrorShell>

<style>
	/*
	 * The seal on the painting ----------------------------------------------------------------------------------
	 * Pressed into the scene like an artist's seal on a scroll: one butter pigment, a little uneven, set where the painting
	 * is dark (desktop: the lower right corner, on the cloud sea's shadow; phones: the open sky right of the tree, above the
	 * text). No outline, no shadow, no sticker. Hover: the pigment lights up a little. At least a 44px target.
	 */
	.seal {
		position: absolute;
		right: max(1.25rem, 3vw);
		bottom: max(1.5rem, 4svh);
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

	@media (max-width: 63.99rem) {
		.seal {
			top: calc(30svh - 4rem);
			bottom: auto;
			right: 1.25rem;
			width: 3.25rem;
		}
	}

	/* License card ---------------------------------------------------------------------------------------------- */

	.license-popover {
		margin: auto;
		padding: 0;
		border: 0;
		background: transparent;
		overflow: visible;
		color: var(--color-cream);
		perspective: 900px;
	}

	.license-popover::backdrop {
		background: rgb(14 15 16 / 0.6);
		backdrop-filter: blur(3px);
	}

	.license {
		--tilt-x: calc((var(--gy) - 0.5) * -10deg);
		--tilt-y: calc((var(--gx) - 0.5) * 14deg);
		position: relative;
		display: grid;
		gap: 0.9rem;
		width: min(23rem, 88vw);
		aspect-ratio: 1.586;
		padding: 1.1rem 1.25rem;
		border: 2px solid color-mix(in oklab, var(--color-butter) 70%, transparent);
		border-radius: 1rem;
		background: radial-gradient(120% 90% at 0% 0%, rgb(252 215 114 / 0.12), transparent 60%), linear-gradient(160deg, #24252a, #18191b 55%, #121316);
		box-shadow:
			0 1.5rem 3rem rgb(14 15 16 / 0.65),
			inset 0 0 0 1px rgb(251 243 221 / 0.06);
		overflow: hidden;
		transform: rotateX(var(--tilt-x)) rotateY(var(--tilt-y));
		transition: transform 160ms ease-out;
	}

	.license :global(.watermark) {
		position: absolute;
		right: -2.5rem;
		bottom: -2.2rem;
		width: 12rem;
		opacity: 0.07;
		filter: grayscale(1) brightness(3);
		pointer-events: none;
	}

	.license-head {
		display: flex;
		align-items: center;
		gap: 0.8rem;
	}

	.license-head :global(.emblem) {
		width: 3.4rem;
		flex: none;
		filter: drop-shadow(0 0 0.35rem rgb(252 215 114 / 0.35));
	}

	.license-title {
		font-size: 1.2rem;
		line-height: 1;
		color: var(--color-butter);
	}

	.license-class {
		margin-top: 0.25rem;
		font-size: 0.85rem;
		color: color-mix(in oklab, var(--color-cream) 80%, transparent);
	}

	.license-body {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.photo {
		width: 4.75rem;
		height: 4.75rem;
		flex: none;
		border-radius: 0.6rem;
		object-fit: cover;
		object-position: 50% 12%;
		background: radial-gradient(circle at 50% 30%, #fbf3dd, #e2a93b);
		border: 2px solid rgb(251 243 221 / 0.4);
	}

	.number {
		font-size: 2.2rem;
		line-height: 1;
		letter-spacing: -0.04em;
		color: var(--color-cream);
	}

	.license-note {
		font-size: 0.8rem;
		line-height: 1.4;
		color: color-mix(in oklab, var(--color-cream) 72%, transparent);
	}

	/* holographic foil following the pointer */
	.holo {
		position: absolute;
		inset: 0;
		background:
			radial-gradient(40% 50% at calc(var(--gx) * 100%) calc(var(--gy) * 100%), rgb(251 243 221 / 0.22), transparent 70%),
			linear-gradient(
				calc(110deg + var(--gx) * 40deg),
				transparent 20%,
				rgb(252 215 114 / 0.16) 35%,
				rgb(120 220 255 / 0.12) 45%,
				rgb(255 120 190 / 0.12) 55%,
				transparent 70%
			);
		background-size:
			100% 100%,
			220% 220%;
		background-position:
			0 0,
			calc(var(--gx) * 100%) calc(var(--gy) * 100%);
		mix-blend-mode: color-dodge;
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
