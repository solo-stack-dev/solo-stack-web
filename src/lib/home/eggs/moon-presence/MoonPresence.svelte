<!--
	@component
	Egg: presence on the moon (mockup 01-mascot-easter-eggs/05). A faint, featureless giant leans over the visible part
	of the hero moon for ~2.2 s. Anchored to the moon element (`[data-egg-moon]`) in page coordinates so it stays on
	the moon while scrolling, clipped to the moon's circle, multiplied into the pigment. Only opacity (and a tiny
	drift with motion) animates; the watery edge filter is rasterized once.
-->
<script lang="ts">
	import type { EggProps } from '../events.ts';
	import { calmFade } from '../fade.ts';

	let { target, reducedMotion, ondone }: EggProps = $props();

	const TOTAL = 2200;
	const uid = $props.id();

	let root: HTMLDivElement;
	let box = $state<{ left: number; top: number; size: number; x: number; y: number; figure: number } | null>(null);

	/** Moon rect in the coordinates of our offset parent, plus the centroid and size of the moon's on-screen part. */
	function measure(moon: Element) {
		const rect = moon.getBoundingClientRect();
		const parent = (root.offsetParent ?? document.documentElement).getBoundingClientRect();
		const radius = rect.width / 2;
		const cx = rect.left + radius;
		const cy = rect.top + radius;
		// Sample the visible part of the disc
		const steps = 28;
		let count = 0;
		let sumX = 0;
		let sumY = 0;
		const left = Math.max(rect.left, 0);
		const right = Math.min(rect.right, window.innerWidth);
		const top = Math.max(rect.top, 0);
		const bottom = Math.min(rect.bottom, window.innerHeight);
		if (right <= left || bottom <= top) return null;
		for (let i = 0; i < steps; i++) {
			for (let j = 0; j < steps; j++) {
				const x = left + ((i + 0.5) / steps) * (right - left);
				const y = top + ((j + 0.5) / steps) * (bottom - top);
				if ((x - cx) ** 2 + (y - cy) ** 2 > radius ** 2) continue;
				count++;
				sumX += x;
				sumY += y;
			}
		}
		if (!count) return null;
		const area = (count / steps ** 2) * (right - left) * (bottom - top);
		return {
			left: rect.left - parent.left,
			top: rect.top - parent.top,
			size: rect.width,
			x: sumX / count - rect.left,
			y: sumY / count - rect.top,
			figure: Math.min(Math.sqrt(area) * 0.95, radius * 1.2)
		};
	}

	$effect(() => {
		const measured = target ? measure(target) : null;
		box = measured;
		const timer = setTimeout(ondone, measured ? TOTAL : 0);
		return () => clearTimeout(timer);
	});
</script>

<div bind:this={root} class="presence" class:still={reducedMotion} aria-hidden="true" {@attach reducedMotion && calmFade(TOTAL, 0.3)}>
	{#if box}
		<div class="disc" style:left="{box.left}px" style:top="{box.top}px" style:width="{box.size}px" style:height="{box.size}px">
			<div class="figure" style:left="{box.x}px" style:top="{box.y}px" style:width="{box.figure}px" style:--total="{TOTAL}ms">
				<svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid meet">
					<defs>
						<linearGradient id="{uid}-fade" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0" stop-color="#3b2a12" stop-opacity="0.95" />
							<stop offset="0.55" stop-color="#4a3416" stop-opacity="0.7" />
							<stop offset="1" stop-color="#4a3416" stop-opacity="0" />
						</linearGradient>
						<filter id="{uid}-wash" x="-0.2" y="-0.2" width="1.4" height="1.4">
							<feGaussianBlur in="SourceGraphic" stdDeviation="7" result="soft" />
							<feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="7" result="noise" />
							<feDisplacementMap in="soft" in2="noise" scale="26" xChannelSelector="R" yChannelSelector="G" />
						</filter>
					</defs>
					<!-- Featureless giant leaning down towards the rim: head, a heavy shoulder, one hanging arm -->
					<g filter="url(#{uid}-wash)" fill="url(#{uid}-fade)">
						<path
							d="M214 52c38-6 72 24 74 70 2 34-14 58-30 70 50 12 92 40 106 92 12 46 6 130 18 216H40c8-60 14-118 30-168 12-38 46-82 98-106-10-20-16-44-12-72 6-54 30-96 58-102z"
						/>
						<path d="M92 270c-26 44-36 108-28 170 4 30 22 44 40 40-6-50-2-112 18-170z" opacity="0.8" />
					</g>
				</svg>
			</div>
		</div>
	{/if}
</div>

<style>
	.presence {
		position: absolute;
		inset: 0;
		z-index: 2;
		pointer-events: none;
	}

	.disc {
		position: absolute;
		clip-path: circle(50%);
		mix-blend-mode: multiply;
	}

	.figure {
		position: absolute;
		aspect-ratio: 4 / 5;
		translate: -46% -46%;
		opacity: 0;
		will-change: opacity, transform;
		animation: presence var(--total) ease-in-out forwards;
	}

	.figure svg {
		display: block;
		width: 100%;
		height: 100%;
	}

	/* Reduced motion: no drift, an opacity-only fade of the root (calmFade) */
	.still .figure {
		animation: none;
		opacity: 1;
	}

	@keyframes presence {
		0% {
			opacity: 0;
			transform: translateY(3%) scale(0.98);
		}
		35%,
		62% {
			opacity: 0.34;
		}
		100% {
			opacity: 0;
			transform: translateY(-1%) scale(1.01);
		}
	}
</style>
