<!--
	@component
	Blog header art, "the reading hill" (docs/SITE-REDESIGN.md): the mascot in ink silhouette under a crooked tree, laptop
	glowing on his lap, on a hill that runs off the right and bottom. Behind it a butter pigment bloom (dark: backlight on
	the night; light: a wash on the paper), in front a few CSS fireflies rising from the laptop. The left 45 % of the art is
	empty sky for the page title. Fireflies animate transform/opacity only, pause off screen and stand still under reduced
	motion. Decorative. Fills the box the parent gives it (aspect 1672 / 941). A parent may set `--fade-right` (e.g.
	`DRY_BRUSH_FADE_RIGHT`) where the art stops short of the viewport edge, so the hill breaks up there too.
-->
<script lang="ts">
	import wash from '#lib/components/site/assets/backlight-wash.webp?w=1200;800;480&quality=55&enhanced';
	import { DRY_BRUSH_FADE } from './materials.ts';
	import hill from './assets/blog-reading-hill.webp?w=1672;1280;960;640&quality=80&enhanced';

	interface Props {
		/** Rendered width of the art, as in `<img sizes>`. */
		sizes: string;
		class?: string;
	}

	let { sizes, class: className = '' }: Props = $props();

	/** Fireflies in % of the art box (the laptop screen is at 76 % / 63 %): x, y, drift x (rem), duration, delay (s), size (px). */
	const FIREFLIES = [
		[70.5, 57, -1.2, 7.5, 0, 4],
		[66, 51, 0.8, 9, -2.4, 3],
		[73, 45, -0.6, 8, -5.1, 3.5],
		[62.5, 60, 1.4, 10, -1.2, 3],
		[77.5, 37, 0.9, 8.5, -3.6, 2.5],
		[68.5, 35, -1.4, 11, -6.8, 3],
		[59.5, 46, 0.6, 9.5, -4.3, 2.5],
		[82, 30, -0.8, 12, -8.2, 2.5]
	] as const;

	/** Steady fireflies over the three painted into the art (74 / 50, 72 / 56, 69 / 63 %): they glow on paper too. */
	const PAINTED = [
		[74.2, 50.2, 0],
		[71.9, 56.1, -1.3],
		[68.8, 62.9, -2.6]
	] as const;

	// Pause the fireflies while the header is off screen (CSS alone cannot know)
	let idle = $state(false);
	function watch(element: HTMLElement) {
		const observer = new IntersectionObserver(([entry]) => (idle = !entry.isIntersecting));
		observer.observe(element);
		return () => observer.disconnect();
	}
</script>

<div class={['reading-hill', className]} data-idle={idle || undefined} style:--fade={DRY_BRUSH_FADE} aria-hidden="true" {@attach watch}>
	<enhanced:img class="wash" src={wash} alt="" sizes="(min-width: 48rem) 40rem, 90vw" loading="eager" decoding="async" />
	<span class="glow"></span>
	<enhanced:img class="hill" src={hill} alt="" {sizes} loading="eager" fetchpriority="high" decoding="async" />
	{#each FIREFLIES as [x, y, dx, duration, delay, size], index (index)}
		<span
			class="firefly"
			style:left="{x}%"
			style:top="{y}%"
			style:--dx="{dx}rem"
			style:--size="{size}px"
			style:animation-duration="{duration}s"
			style:animation-delay="{delay}s"
		></span>
	{/each}
	{#each PAINTED as [x, y, delay], index (index)}
		<span class="firefly is-steady" style:left="{x}%" style:top="{y}%" style:--size="6px" style:animation-delay="{delay}s"></span>
	{/each}
</div>

<style>
	.reading-hill {
		position: relative;
		isolation: isolate;
		aspect-ratio: 1672 / 941;
		/* optional: hill, glow and fireflies break up together at the right edge */
		mask: var(--fade-right, none) center / 100% 100% no-repeat;
		pointer-events: none;
		user-select: none;
	}

	/*
	 * The pigment bloom sits tight behind the crown and the laptop: backlight at night, a butter wash on paper. Kept small,
	 * so clean night (or paper) stays between the art and the title.
	 */
	.wash {
		position: absolute;
		left: 54%;
		top: 10%;
		z-index: -2;
		width: 46%;
		height: auto;
		opacity: 0.5;
		mix-blend-mode: multiply;
		rotate: -4deg;
	}

	/* Night: the pigment alone turns khaki on the dark, so it stays faint and the light comes from warm amber cores below */
	:global(.dark) .wash {
		opacity: 0.16;
		mix-blend-mode: screen;
		filter: hue-rotate(-28deg) saturate(1.8);
	}

	/* Laptop light and the horizon glow behind the hill crest */
	.glow {
		position: absolute;
		inset: 0;
		z-index: -1;
		background:
			radial-gradient(10% 14% at 73% 60%, rgb(252 215 114 / 0.6), transparent 70%), radial-gradient(26% 24% at 78% 58%, rgb(226 169 59 / 0.18), transparent 72%);
	}

	/* Night: a small moonlight core at the screen, a warm amber halo around the reader and the lower canopy, a low ember on the crest */
	:global(.dark) .glow {
		background:
			radial-gradient(7% 10% at 73% 61%, rgb(255 244 214 / 0.45), transparent 70%), radial-gradient(24% 28% at 75% 54%, rgb(236 146 48 / 0.36), transparent 72%),
			radial-gradient(34% 20% at 82% 68%, rgb(226 124 36 / 0.34), transparent 75%), radial-gradient(24% 20% at 78% 28%, rgb(236 156 56 / 0.16), transparent 75%);
	}

	.hill {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		/* the hill breaks up in dry brush strokes where it leaves the frame */
		mask: var(--fade) center / 100% 100% no-repeat;
	}

	.firefly {
		position: absolute;
		width: var(--size);
		height: var(--size);
		margin: calc(var(--size) / -2) 0 0 calc(var(--size) / -2);
		border-radius: 50%;
		background: var(--color-moonlight);
		box-shadow:
			0 0 3px 1px var(--color-butter),
			0 0 10px 3px rgb(252 215 114 / 0.55);
		opacity: 0;
		animation: rise linear infinite;
		will-change: transform, opacity;
	}

	/* On paper the moonlight core vanishes: an ochre core with the butter halo */
	:global(html:not(.dark)) .firefly {
		background: #f1b73e;
		box-shadow:
			0 0 3px 1px rgb(226 169 59 / 0.9),
			0 0 10px 3px rgb(252 215 114 / 0.7);
	}

	/* The painted ones only breathe */
	.firefly.is-steady {
		opacity: 1;
		animation: breathe 4s ease-in-out infinite;
	}

	@keyframes breathe {
		50% {
			opacity: 0.55;
		}
	}

	.reading-hill[data-idle] .firefly {
		animation-play-state: paused;
	}

	/* Rise from the laptop, wander, blink out; two flickers on the way */
	@keyframes rise {
		0% {
			opacity: 0;
			transform: translate(0, 0.6rem);
		}
		12% {
			opacity: 1;
		}
		30% {
			opacity: 0.35;
			transform: translate(calc(var(--dx) * 0.4), -0.9rem);
		}
		42% {
			opacity: 1;
		}
		70% {
			opacity: 0.8;
			transform: translate(var(--dx), -2.4rem);
		}
		100% {
			opacity: 0;
			transform: translate(calc(var(--dx) * 0.6), -3.6rem);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.firefly,
		.firefly.is-steady {
			animation: none;
			opacity: 0.85;
		}
	}
</style>
