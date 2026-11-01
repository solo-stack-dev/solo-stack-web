<!--
	@component
	Egg: shiny mascot (1 in 4096 sessions, `?shiny=1`). Eggs.svelte sets `data-shiny` on `[data-night-page]` and
	loads this component, which only ships global CSS:

	- Fallback golden look for every `.mascot` (warm filter + glow) until a section swaps in real golden art. Sections
	  that render their own golden variant put `data-shiny-art` on their `.mascot` element to opt out of the filter.
	- A tiny sparkle on every `.mascot` (`::after`, so the element must be positioned). Static under reduced motion.

	How sections swap art: docs/HOMEPAGE-DEV.md §11.
-->
<style>
	:global([data-shiny] .mascot:not([data-shiny-art])) {
		filter: sepia(0.5) saturate(1.9) hue-rotate(-10deg) brightness(1.07) drop-shadow(0 0 0.7rem rgb(252 215 114 / 0.45));
	}

	:global([data-shiny] .mascot::after) {
		content: '';
		position: absolute;
		z-index: 1;
		top: 6%;
		right: 14%;
		width: clamp(0.7rem, 9%, 1.4rem);
		aspect-ratio: 1;
		background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='-14 -14 28 28'%3E%3Cpath d='M0-14C1.4-3 3-1.4 14 0 3 1.4 1.4 3 0 14-1.4 3-3 1.4-14 0-3-1.4-1.4-3 0-14Z' fill='%23fff3cf'/%3E%3C/svg%3E")
			center / contain no-repeat;
		filter: drop-shadow(0 0 0.3rem rgb(252 215 114 / 0.9));
		pointer-events: none;
	}

	@media (prefers-reduced-motion: no-preference) {
		:global([data-shiny] .mascot::after) {
			animation: shiny-twinkle 2.6s ease-in-out infinite;
		}
	}

	@keyframes -global-shiny-twinkle {
		0%,
		100% {
			opacity: 0.25;
			scale: 0.55;
			rotate: 0deg;
		}
		45% {
			opacity: 1;
			scale: 1;
			rotate: 45deg;
		}
	}
</style>
