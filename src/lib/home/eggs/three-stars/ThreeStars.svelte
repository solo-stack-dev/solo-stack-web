<!--
	@component
	Egg: three stars (mockup 01-mascot-easter-eggs/10). Three bright stars drift out of the sky into one line, each
	draws a faint triangle below itself, the triangles stack, hold, and fade (~5.2 s). Reduced motion: no drift or drawing, a calm fade of the finished figure.
-->
<script lang="ts">
	import type { EggProps } from '../events.ts';
	import { calmFade } from '../fade.ts';

	let { reducedMotion, ondone }: EggProps = $props();

	const TOTAL = $derived(reducedMotion ? 3600 : 5200);
	const uid = $props.id();

	type Point = [number, number];
	const between = (min: number, max: number) => min + Math.random() * (max - min);
	const narrow = window.matchMedia('(max-width: 47.99rem), (max-aspect-ratio: 4/5)').matches;

	// Formation in a 1600×900 viewBox (sliced to the viewport), kept inside the visible middle on phones
	const origin: Point = narrow ? [between(700, 820), between(90, 150)] : [between(380, 1100), between(90, 150)];
	const step: Point = [between(-90, 90), between(130, 160)];
	const sizes = [between(90, 120), between(140, 180), between(80, 105)];
	const tilt = between(-0.35, 0.35);

	const stars = sizes.map((size, index) => {
		const apex: Point = [origin[0] + step[0] * index, origin[1] + step[1] * index];
		const a = tilt + (index % 2 ? 0.12 : -0.1);
		const left: Point = [apex[0] - size * 0.62 * Math.cos(a) - size * 0.2, apex[1] + size * 0.86 + size * 0.3 * Math.sin(a)];
		const right: Point = [apex[0] + size * 0.6 * Math.cos(a) + size * 0.25, apex[1] + size * 0.62 - size * 0.3 * Math.sin(a)];
		return {
			apex,
			corners: [left, right],
			triangle: `M ${apex.join(' ')} L ${right.join(' ')} L ${left.join(' ')} Z`,
			// Where the star comes from
			dx: between(-260, 260),
			dy: between(-60, 220),
			delay: index * 260
		};
	});

	const SPARKLE = 'M0 -14C1.4 -3 3 -1.4 14 0C3 1.4 1.4 3 0 14C-1.4 3 -3 1.4 -14 0C-3 -1.4 -1.4 -3 0 -14Z';

	$effect(() => {
		const timer = setTimeout(ondone, TOTAL + 100);
		return () => clearTimeout(timer);
	});
</script>

<div class="three-stars" class:still={reducedMotion} aria-hidden="true" {@attach reducedMotion && calmFade(TOTAL)} style:--total="{TOTAL}ms">
	<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
		<defs>
			<radialGradient id="{uid}-glow">
				<stop offset="0" stop-color="#fff6d8" stop-opacity="0.95" />
				<stop offset="0.25" stop-color="#fcd772" stop-opacity="0.55" />
				<stop offset="1" stop-color="#fcd772" stop-opacity="0" />
			</radialGradient>
		</defs>
		{#each stars as star, index (index)}
			<path class="edge" d={star.triangle} pathLength="1" style:--delay="{star.delay}ms" />
			{#each star.corners as corner, cornerIndex (cornerIndex)}
				<circle class="corner" cx={corner[0]} cy={corner[1]} r="2.2" style:--delay="{star.delay}ms" />
			{/each}
			<g class="star" style:--dx="{star.dx}px" style:--dy="{star.dy}px" style:--delay="{star.delay}ms">
				<g transform="translate({star.apex.join(' ')})">
					<circle r="34" fill="url(#{uid}-glow)" />
					<path class="sparkle" d={SPARKLE} />
				</g>
			</g>
		{/each}
	</svg>
</div>

<style>
	.three-stars {
		position: fixed;
		inset: 0;
		z-index: 2;
		pointer-events: none;
		animation: stars-fade var(--total) linear forwards;
	}

	svg {
		width: 100%;
		height: 100%;
	}

	.sparkle {
		fill: #fff3cf;
	}

	.star {
		opacity: 0;
		animation: stars-drift var(--total) var(--delay) cubic-bezier(0.45, 0, 0.2, 1) forwards;
	}

	.edge {
		fill: none;
		stroke: color-mix(in oklab, var(--color-butter) 70%, transparent);
		stroke-width: 1.4;
		stroke-dasharray: 1 1;
		stroke-dashoffset: 1;
		animation: stars-draw var(--total) var(--delay) ease-in-out forwards;
	}

	.corner {
		fill: var(--color-butter);
		opacity: 0;
		animation: stars-corner var(--total) var(--delay) ease-out forwards;
	}

	@keyframes stars-drift {
		0% {
			opacity: 0;
			translate: var(--dx) var(--dy);
		}
		8% {
			opacity: 0.7;
		}
		30% {
			opacity: 1;
			translate: 0 0;
		}
		100% {
			opacity: 1;
			translate: 0 0;
		}
	}

	@keyframes stars-draw {
		0%,
		30% {
			stroke-dashoffset: 1;
		}
		50%,
		100% {
			stroke-dashoffset: 0;
		}
	}

	@keyframes stars-corner {
		0%,
		42% {
			opacity: 0;
		}
		52%,
		100% {
			opacity: 0.8;
		}
	}

	@keyframes stars-fade {
		0%,
		76% {
			opacity: 1;
		}
		100% {
			opacity: 0;
		}
	}

	/* Reduced motion: the finished figure fades in and out (calmFade), nothing travels or draws */
	.still {
		animation: none;
	}

	.still .star,
	.still .corner {
		animation: none;
		opacity: 1;
	}

	.still .edge {
		animation: none;
		stroke-dashoffset: 0;
	}
</style>
