<!--
	@component
	The night owl messenger of /kontakt (docs/SITE-REDESIGN.md): a silhouette owl on a gnarled branch with the sealed letter,
	backlit by the pigment wash. It blinks now and then (random 4–9 s, sometimes twice), its eyes light up while `watching`
	(someone writes the letter), and when `flown` turns true it takes off with the letter and the empty branch springs back. With a
	`landing` element it glides down to it and stays there as a small silhouette (the parent places it in the sky above the footer
	horizon, clear of the text); without one (phones) it climbs off into the sky and fades. Back to `flown = false`: it lands again.

	Size and position come from the parent: the root is `var(--owl)` square (the 1254 px master canvas), the branch runs off its
	right edge, so place it flush with the viewport edge. Every layer shares that canvas, so the frames stack pixel-exactly.
	Reduced motion: a still owl (no blink, no flight; sent shows the empty branch, and the small silhouette at the landing spot if
	there is one). Decorative, hidden from assistive tech.
-->
<script lang="ts">
	import { inView, pageVisibility, reducedMotion } from '#lib/home/shared/motion.svelte.ts';
	import wash from '#lib/components/site/assets/backlight-wash.webp?w=720&format=webp&quality=55&enhanced';
	import branch from './assets/owl-branch.webp?w=1254;840;560;360&enhanced';
	import owlClosed from './assets/owl-closed.webp?w=1254;840;560;360&enhanced';
	import owlFlying from './assets/owl-flying.webp?w=1513;1024;680&enhanced';
	import owlOpen from './assets/owl-open.webp?w=1254;840;560;360&enhanced';

	interface Props {
		/** The letter is on its way: fly off (once per change to true). */
		flown?: boolean;
		/** Someone is writing: the eyes light up. */
		watching?: boolean;
		/** `sizes` of the owl canvas (match `--owl`). */
		sizes?: string;
		/**
		 * Where the flight ends: the bird glides to this element's center and comes to rest there at its width (wingtip to
		 * wingtip). Unrendered (`display: none`) or absent: the bird flies off and fades instead.
		 */
		landing?: HTMLElement;
		class?: string;
	}

	let { flown = false, watching = false, sizes = '(min-width: 48rem) 34vw, 14rem', landing, class: className = '' }: Props = $props();

	let root = $state<HTMLElement>();
	/** The flight's end, from the bird's body on the perch to the landing spot (px), and its size there. */
	let to = $state<{ x: number; y: number; scale: number }>();

	/*
	 * The landing spot is measured once the letter is sent (the sent layout is in place by then) and again on resize. The bird's
	 * body is the flight frame's transform origin: 45 % / 45 % of the canvas; the frame is 135 % of the canvas wide and the
	 * wings span ≈ 86 % of it.
	 */
	$effect(() => {
		if (!flown || !landing || !root) {
			to = undefined;
			return;
		}
		const target = landing;
		const canvas = root;
		const measure = () => {
			const spot = target.getBoundingClientRect();
			if (!spot.width) {
				to = undefined;
				return;
			}
			const box = canvas.getBoundingClientRect();
			to = {
				x: spot.left + spot.width / 2 - (box.left + box.width * 0.45),
				y: spot.top + spot.height / 2 - (box.top + box.height * 0.45),
				scale: spot.width / (box.width * 1.35 * 0.86)
			};
		};
		measure();
		window.addEventListener('resize', measure);
		return () => window.removeEventListener('resize', measure);
	});

	let visible = $state(true);
	let blinking = $state(false);
	/** Landing again after a sent letter (plays the return once). */
	let returning = $state(false);
	/** Flight and branch art are only needed once someone writes; fetch them then, not on page load. */
	let armed = $state(false);

	$effect(() => {
		if (watching || flown) armed = true;
	});

	let wasFlown = false;
	$effect(() => {
		if (wasFlown && !flown) {
			returning = true;
			const timer = setTimeout(() => (returning = false), 900);
			wasFlown = flown;
			return () => clearTimeout(timer);
		}
		wasFlown = flown;
	});

	// Blink: random 4–9 s apart, a double blink about every fifth time; only while on screen, the tab is visible and perched
	$effect(() => {
		if (reducedMotion.current || !visible || !pageVisibility.current || flown) return;
		let timer: ReturnType<typeof setTimeout>;
		const blink = (then: () => void) => {
			blinking = true;
			timer = setTimeout(() => {
				blinking = false;
				timer = setTimeout(then, 90);
			}, 170);
		};
		const schedule = () => {
			timer = setTimeout(() => blink(() => (Math.random() < 0.2 ? blink(schedule) : schedule())), 4000 + Math.random() * 5000);
		};
		schedule();
		return () => {
			clearTimeout(timer);
			blinking = false;
		};
	});

	// A writer appears: the owl notices with one blink
	$effect(() => {
		if (!watching || reducedMotion.current || flown) return;
		const timer = setTimeout(() => {
			blinking = true;
			setTimeout(() => (blinking = false), 170);
		}, 260);
		return () => clearTimeout(timer);
	});
</script>

<div
	class={['owl', className]}
	data-flown={flown || undefined}
	data-watching={watching || undefined}
	data-blink={blinking || undefined}
	data-returning={returning || undefined}
	data-landing={to ? '' : undefined}
	style:--to-x={to && `${to.x.toFixed(1)}px`}
	style:--to-y={to && `${to.y.toFixed(1)}px`}
	style:--to-scale={to?.scale.toFixed(4)}
	aria-hidden="true"
	bind:this={root}
	{@attach inView((value) => (visible = value))}
>
	<div class="wash" style:--wash="url({wash.img.src})"></div>

	<div class="bough">
		{#if armed}
			<enhanced:img class="layer branch" src={branch} alt="" {sizes} decoding="async" />
		{/if}
		<div class="perched">
			<enhanced:img class="layer" src={owlOpen} alt="" {sizes} fetchpriority="high" />
			<enhanced:img class="layer closed" src={owlClosed} alt="" {sizes} fetchpriority="low" decoding="async" />
			<span class="eye eye-l"></span>
			<span class="eye eye-r"></span>
		</div>
	</div>

	{#if armed}
		<div class="flight">
			<div class="wings">
				<enhanced:img src={owlFlying} alt="" sizes="(min-width: 48rem) 47vw, 19rem" decoding="async" />
			</div>
		</div>
	{/if}
</div>

<style>
	.owl {
		position: relative;
		width: var(--owl);
		aspect-ratio: 1;
		pointer-events: none;
		user-select: none;
	}

	.owl :global(picture) {
		display: contents;
	}

	.owl :global(img) {
		display: block;
		width: 100%;
		height: auto;
		max-width: none;
	}

	.layer,
	.bough,
	.perched {
		position: absolute;
		inset: 0;
	}

	/*
	 * Pigment bloom behind the bird. Paper: the painted butter wash itself, multiplied in. Night: the wash's shape as a mask
	 * over pure light (no grey pigment fringe), brightest right behind the head: the backlight that makes the silhouette.
	 * Once the owl has gone it dims to an afterglow.
	 */
	.wash {
		position: absolute;
		left: -14%;
		top: 2%;
		width: 122%;
		aspect-ratio: 1604 / 980;
		background: var(--wash) center / 100% 100% no-repeat;
		opacity: 0.62;
		mix-blend-mode: multiply;
		rotate: -4deg;
		transition: opacity 2.4s ease 0.6s;
	}

	:global(.dark) .wash {
		background: radial-gradient(48% 62% at 44% 40%, rgb(255 240 190 / 0.62), rgb(252 215 114 / 0.36) 45%, rgb(226 169 59 / 0.2) 78%, rgb(226 169 59 / 0.12));
		mask: var(--wash) center / 100% 100% no-repeat;
		opacity: 0.85;
		mix-blend-mode: normal;
	}

	.owl[data-flown] .wash {
		opacity: 0.38;
	}

	:global(.dark) .owl[data-flown] .wash {
		opacity: 0.2;
		mix-blend-mode: screen;
	}

	/* The bird is ink on paper; at night a hairline of light runs along its back */
	.bough {
		filter: drop-shadow(0 0 0.5px rgb(252 215 114 / 0.18));
	}

	:global(.dark) .bough {
		filter: drop-shadow(0 -1px 1px rgb(252 215 114 / 0.28)) drop-shadow(0 0 18px rgb(252 215 114 / 0.1));
	}

	/* Blink: only the eye patches of the closed frame are drawn (the canvases are identical elsewhere) */
	.closed {
		clip-path: inset(20.6% 53.3% 68.9% 29.8%);
		opacity: 0;
		transition: opacity 110ms ease-out;
	}

	.owl[data-blink] .closed {
		opacity: 1;
		transition: opacity 50ms ease-in;
	}

	/* Eye light: a breath of glow on the painted irises (stronger at night and while someone writes) */
	.eye {
		position: absolute;
		width: 6%;
		aspect-ratio: 1;
		translate: -50% -50%;
		border-radius: 50%;
		background: radial-gradient(closest-side, rgb(255 228 140 / 0.85), rgb(252 215 114 / 0.35) 45%, transparent);
		mix-blend-mode: screen;
		opacity: 0;
		transition: opacity 600ms ease;
	}

	.eye-l {
		left: 33.96%;
		top: 26.19%;
	}

	.eye-r {
		left: 42.53%;
		top: 24.55%;
	}

	:global(.dark) .eye {
		opacity: 0.55;
	}

	.owl[data-watching] .eye {
		opacity: 0.75;
	}

	:global(.dark) .owl[data-watching] .eye {
		opacity: 1;
	}

	.owl[data-blink] .eye {
		opacity: 0;
		transition-duration: 50ms;
	}

	/*
	 * Flight: the flying frame starts on the perch (its body over the perched body), lifts, and heads up and left into the
	 * distance behind the title, a small owl with the letter gliding off and fading in the sky.
	 */
	.flight {
		position: absolute;
		left: -2.3%;
		top: -8.5%;
		width: 135%;
		aspect-ratio: 1513 / 1039;
		opacity: 0;
		transform-origin: 35% 58%;
	}

	/* positioned: paints over the halo */
	.wings {
		position: relative;
		transform-origin: 50% 55%;
	}

	.owl[data-flown] .perched {
		animation: leave 140ms ease-in 450ms both;
	}

	.owl[data-flown] .flight {
		animation: fly 7s linear 450ms both;
	}

	.owl[data-flown] .wings {
		animation: flap 380ms ease-in-out 450ms 6 alternate both;
	}

	.owl[data-flown][data-landing] .flight {
		animation: glide 6.5s linear 450ms both;
	}

	/* At night the distant bird keeps a breath of moonlight around it, so the small silhouette still reads on the dark sky */
	.flight::before {
		content: '';
		position: absolute;
		inset: 8% 14% 10% 10%;
		border-radius: 50%;
		background: radial-gradient(closest-side, rgb(252 215 114 / 0.3), rgb(252 215 114 / 0.1) 55%, transparent);
		opacity: 0;
	}

	:global(.dark) .owl[data-flown][data-landing] .flight::before {
		animation: halo 6.5s ease-in 450ms both;
	}

	.owl[data-flown] .bough {
		transform-origin: 100% 60%;
		animation: spring 1100ms ease-out 520ms both;
	}

	.owl[data-returning] .perched {
		animation: land 800ms var(--ease-settle) both;
	}

	@keyframes leave {
		to {
			opacity: 0;
		}
	}

	/*
	 * 0–34 %: take-off and the climb into the distance (≈ 2.4 s); then a slow glide away that fades out. The path stays low,
	 * level with the owl's head and behind the title, so the bird never rises into the nav above the canvas.
	 */
	@keyframes fly {
		0% {
			opacity: 0;
			transform: translate(0, 2%) scale(0.86) rotate(-5deg);
			animation-timing-function: ease-out;
		}
		1.5% {
			opacity: 1;
		}
		6% {
			transform: translate(-4%, -4%) scale(0.95) rotate(2deg);
			animation-timing-function: ease-in-out;
		}
		18% {
			transform: translate(-30%, -13%) scale(0.5) rotate(4deg);
			animation-timing-function: ease-out;
		}
		34% {
			opacity: 1;
			transform: translate(-62%, -19%) scale(0.14) rotate(1deg);
			animation-timing-function: linear;
		}
		100% {
			opacity: 0;
			transform: translate(-88%, -21%) scale(0.08) rotate(-1deg);
		}
	}

	/*
	 * With a landing spot: the same take-off, then a long descending glide down and left (under the title, never behind its
	 * letters) to the spot (`--to-x/y`, measured), banking into it, shrinking with the distance; it rests there, small.
	 */
	@keyframes glide {
		0% {
			opacity: 0;
			transform: translate(0, 2%) scale(0.86) rotate(-5deg);
			animation-timing-function: ease-out;
		}
		1.5% {
			opacity: 1;
		}
		7% {
			transform: translate(-4%, -4%) scale(0.95) rotate(2deg);
			animation-timing-function: ease-in;
		}
		22% {
			transform: translate(calc(var(--to-x) * 0.36), calc(var(--to-y) * 0.1)) scale(0.56) rotate(-6deg);
			animation-timing-function: linear;
		}
		42% {
			transform: translate(calc(var(--to-x) * 0.78), calc(var(--to-y) * 0.62)) scale(calc(var(--to-scale) * 1.9)) rotate(-14deg);
			animation-timing-function: cubic-bezier(0.2, 0.6, 0.3, 1);
		}
		100% {
			opacity: 1;
			transform: translate(var(--to-x), var(--to-y)) scale(var(--to-scale)) rotate(-10deg);
		}
	}

	@keyframes halo {
		0%,
		30% {
			opacity: 0;
		}
		100% {
			opacity: 1;
		}
	}

	@keyframes flap {
		to {
			scale: 1 0.9;
			translate: 0 1.5%;
		}
	}

	@keyframes spring {
		0% {
			rotate: 0deg;
		}
		22% {
			rotate: -1.6deg;
		}
		48% {
			rotate: 0.8deg;
		}
		72% {
			rotate: -0.35deg;
		}
		100% {
			rotate: 0deg;
		}
	}

	@keyframes land {
		from {
			opacity: 0;
			translate: 0 -6%;
		}
	}

	/* Phones: the owl perches beside the stacked title, so the twigs that hang below the branch fade out before the intro below */
	@media (max-width: 47.99rem) {
		.bough {
			mask: linear-gradient(to bottom, #000 72%, transparent 86%);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.owl[data-flown] .perched {
			animation: none;
			opacity: 0;
		}

		.owl[data-flown] .flight,
		.owl[data-flown] .wings,
		.owl[data-flown] .flight::before,
		.owl[data-flown] .bough,
		.owl[data-returning] .perched {
			animation: none;
		}

		.closed,
		.eye {
			transition: none;
		}

		/* The still equivalent of the landed flight: the small owl already at its spot */
		.owl[data-flown][data-landing] .flight {
			animation: none;
			opacity: 1;
			transform: translate(var(--to-x), var(--to-y)) scale(var(--to-scale)) rotate(-10deg);
		}

		:global(.dark) .owl[data-flown][data-landing] .flight::before {
			animation: none;
			opacity: 1;
		}
	}
</style>
