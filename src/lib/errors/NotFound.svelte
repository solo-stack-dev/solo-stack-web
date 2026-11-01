<!--
	@component
	404: the page collapses into an endless ink void, and the lost mascot drifts at its center on a scrap of rock.
	The vanishing point (`--vp-x`, `--vp-y`) is shared by the canvas and the mascot, set per breakpoint below.

	The collapse is pure CSS so it plays from the first paint, before hydration: warm paper, then the void grows out
	of the vanishing point (a circular clip on `.abyss`, synced with a ragged ink rim scaling over its edge).
	Under reduced motion the void is simply there.
-->
<script lang="ts">
	import PaperGrain from '#lib/home/shared/PaperGrain.svelte';
	import { m } from '#lib/paraglide/messages.js';
	import grain from './assets/error-paper-grain.webp';
	import ErrorShell from './ErrorShell.svelte';
	import InkVoid from './InkVoid.svelte';
	import mascot from './assets/error-mascot-lost.webp?enhanced';
	import { blotPath } from './void.ts';

	const rim = blotPath(7, 96);
</script>

<ErrorShell status={404} title={m.error_404_title()} body={m.error_404_body()} variant="void">
	{#snippet scene()}
		<div class="void">
			<div class="abyss">
				<InkVoid />
			</div>
			<svg class="rim" viewBox="-100 -100 200 200" aria-hidden="true">
				<path d={rim} fill="none" stroke="#0e0f10" stroke-width="5" stroke-linejoin="round" />
				<path d={rim} fill="none" stroke="#0e0f10" stroke-width="1.2" stroke-dasharray="1 7 3 11" transform="scale(1.035)" />
			</svg>
			<!-- watercolor tooth on paper and rings (multiply barely touches the ink) -->
			<PaperGrain fixed={false} src={grain} size={256} opacity={0.55} blend="multiply" />
			<div class="castaway">
				<div class="drift">
					<enhanced:img class="mascot" src={mascot} alt={m.error_404_mascot_alt()} sizes="(min-width: 64rem) 9rem, 7rem" />
					<svg class="rock" viewBox="0 0 200 110" aria-hidden="true">
						<defs>
							<linearGradient id="rock-top" x1="0" y1="0" x2="0" y2="1">
								<stop offset="0" stop-color="#8a6a2c" />
								<stop offset="1" stop-color="#2a2723" />
							</linearGradient>
							<filter id="rock-rough" x="-10%" y="-10%" width="120%" height="120%">
								<feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="2" seed="4" />
								<feDisplacementMap in="SourceGraphic" scale="6" />
							</filter>
						</defs>
						<g filter="url(#rock-rough)">
							<path d="M8 22 L40 12 L96 9 L150 12 L192 20 L176 44 L150 58 L128 86 L104 106 L86 80 L58 62 L30 46 Z" fill="#0e0f10" />
							<path d="M8 22 L40 12 L96 9 L150 12 L192 20 L184 28 L140 31 L96 33 L50 30 L18 29 Z" fill="url(#rock-top)" />
							<path d="M40 40 L72 56 M126 44 L112 70 M150 36 L164 46" stroke="#4a3a1e" stroke-width="2.5" fill="none" stroke-linecap="round" />
						</g>
					</svg>
				</div>
				<!-- pebbles that broke off -->
				<span class="pebble p1"></span>
				<span class="pebble p2"></span>
				<span class="pebble p3"></span>
			</div>
		</div>
	{/snippet}
</ErrorShell>

<style>
	.void {
		position: absolute;
		inset: 0;
		overflow: hidden;
		/* the page before the collapse: warm paper */
		background: var(--color-cream);
		--vp-x: 0.5;
		--vp-y: 0.3;
		--vp: calc(var(--vp-x) * 100%) calc(var(--vp-y) * 100%);
	}

	@media (min-width: 64rem) {
		.void {
			--vp-x: 0.66;
			--vp-y: 0.45;
		}
	}

	.abyss {
		position: absolute;
		inset: 0;
		/* before the canvas paints (and without JS): the void at rest */
		background: radial-gradient(circle at var(--vp), #fcd772 0 2.5vmax, #3b2e17 6vmax, #121314 45vmax, #0e0f10);
	}

	.abyss > :global(canvas) {
		position: absolute;
		inset: 0;
	}

	/* The ink rim riding the edge of the clip. Rim radius = 48 % of the box, so at scale 3.125 it matches the clip's
	   final 150vmax. A small box scaled up keeps the layer cheap; it moves too fast for the softness to show. */
	.rim {
		position: absolute;
		left: calc(var(--vp-x) * 100%);
		top: calc(var(--vp-y) * 100%);
		width: 100vmax;
		height: 100vmax;
		translate: -50% -50%;
		opacity: 0;
		pointer-events: none;
	}

	/* The mascot stands on the vanishing point; the light becomes its halo. */
	.castaway {
		position: absolute;
		left: calc(var(--vp-x) * 100%);
		top: calc(var(--vp-y) * 100%);
		width: clamp(6rem, 22vw, 7rem);
		translate: -50% -58%;
	}

	@media (min-width: 64rem) {
		.castaway {
			width: clamp(7rem, 10vw, 9rem);
		}
	}

	.drift {
		position: relative;
		display: grid;
		justify-items: center;
	}

	.mascot {
		position: relative;
		z-index: 1;
		display: block;
		width: 100%;
		height: auto;
		filter: drop-shadow(0 0 1.4rem rgb(252 215 114 / 0.35));
	}

	.rock {
		width: 150%;
		margin-top: -9%;
		height: auto;
	}

	.pebble {
		position: absolute;
		width: 0.7rem;
		aspect-ratio: 1;
		background: #0e0f10;
		border-top: 2px solid #8a6a2c;
		clip-path: polygon(50% 0, 100% 40%, 70% 100%, 10% 80%, 0 30%);
	}

	.p1 {
		left: -38%;
		top: 92%;
		rotate: 20deg;
	}

	.p2 {
		right: -46%;
		top: 84%;
		width: 0.5rem;
		rotate: -30deg;
	}

	.p3 {
		left: 18%;
		top: 128%;
		width: 0.4rem;
		rotate: 60deg;
	}

	@media (prefers-reduced-motion: no-preference) {
		.abyss {
			animation: collapse 1.6s cubic-bezier(0.55, 0, 0.25, 1) 0.15s both;
		}

		.rim {
			animation: rim 1.6s cubic-bezier(0.55, 0, 0.25, 1) 0.15s both;
		}

		/* arrives with the collapse, then floats */
		.castaway {
			animation: arrive 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) 0.5s both;
		}

		.drift {
			animation: drift 7s ease-in-out 1.8s infinite;
		}

		.pebble {
			animation: drift 5s ease-in-out infinite;
		}

		.p2 {
			animation-duration: 6.5s;
			animation-direction: reverse;
		}

		.p3 {
			animation-duration: 4.2s;
		}
	}

	@keyframes collapse {
		from {
			clip-path: circle(0 at var(--vp));
		}
		to {
			clip-path: circle(150vmax at var(--vp));
		}
	}

	@keyframes rim {
		from {
			scale: 0;
			opacity: 1;
		}
		92% {
			opacity: 1;
		}
		to {
			scale: 3.125;
			opacity: 0;
		}
	}

	@keyframes arrive {
		from {
			opacity: 0;
			scale: 0.35;
		}
	}

	@keyframes drift {
		0%,
		100% {
			translate: 0 0;
			rotate: 0deg;
		}
		35% {
			translate: 0.25rem -0.45rem;
			rotate: 1.5deg;
		}
		70% {
			translate: -0.2rem 0.2rem;
			rotate: -1deg;
		}
	}
</style>
