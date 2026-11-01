<!--
	@component
	The blog header art, painted straight onto the page instead of framed in a card: the big painted moon of the
	homepage hero (the same disc as on /stats) and the sitting mascot looking up at it. Two images, no canvas; the
	moon breathes a little glow (off under reduced motion). Decorative.
-->
<script lang="ts">
	import moon from '#lib/home/sections/hero/assets/hero-moon-disc.webp?w=480;300&quality=42&enhanced';
	import mascot from './assets/blog-mascot-sitting.webp?w=363;240;160&enhanced';

	let { class: className = '' }: { class?: string } = $props();
</script>

<div class={['moon-watch', className]} aria-hidden="true">
	<div class="moon">
		<enhanced:img src={moon} alt="" sizes="(min-width: 48rem) 13rem, 8.5rem" class="size-full" fetchpriority="high" />
	</div>
	<enhanced:img src={mascot} alt="" sizes="(min-width: 48rem) 8.5rem, 5.5rem" class="mascot" />
</div>

<style>
	.moon-watch {
		position: relative;
		width: clamp(14rem, 30vw, 21rem);
		aspect-ratio: 21 / 15;
		pointer-events: none;
	}

	.moon {
		position: absolute;
		top: 0;
		right: 0;
		width: 62%;
		aspect-ratio: 1;
		filter: drop-shadow(0 0 28px rgb(252 215 114 / 0.35));
		animation: breathe 6s ease-in-out infinite;
	}

	:global(.dark) .moon {
		filter: drop-shadow(0 0 60px rgb(252 215 114 / 0.45));
	}

	.mascot {
		position: absolute;
		bottom: 0;
		left: 0;
		width: 40%;
		height: auto;
	}

	@keyframes breathe {
		50% {
			scale: 1.025;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.moon {
			animation: none;
		}
	}
</style>
