<!--
	@component
	04:00 → 06:00 seam: one wide, non-repeating dawn cloud bank (docs/art/site/round-3/dawn-cloud-bank*.png; the portrait
	painting below 48rem, never a crop of the panorama). Its opaque middle band covers the only lines of the seam: the
	sunrise's feathered top, which overlaps the cinema, and the end of the cinema's cliff. Above the band its lit crown rolls over
	the cinema landscape (cliff, mascot, beam and screen stay in front of it); below, its ragged underside hangs into the dawn sky.
	Geometry: ./dawn.ts (shared with the cinema and the sunrise).

	Placed in src/routes/+page.svelte between the cinema and the sunrise (zero height in the flow, no pointer events). Rises a
	little against the page on its own view timeline (transform only); static without support and under reduced motion.

	```svelte
	<Cinema />
	<DawnBank />
	<Sunrise />
	```
-->
<script lang="ts">
	import bank from './assets/transitions/dawn-bank.webp?w=1920;1440;1080;720&enhanced';
	import bankMobile from './assets/transitions/dawn-bank-mobile.webp?w=1080;780;540&enhanced';
	import { dawnVars } from './dawn.ts';

	const vars = dawnVars();
</script>

<div class="dawn-bank" aria-hidden="true" style={vars}>
	<div class="bank">
		<enhanced:img src={bank} alt="" class="is-desktop" sizes="100vw" loading="lazy" decoding="async" />
		<enhanced:img src={bankMobile} alt="" class="is-mobile" sizes="100vw" loading="lazy" decoding="async" />
	</div>
</div>

<style>
	.dawn-bank {
		position: relative;
		z-index: 2;
		height: 0;
		pointer-events: none;
		view-timeline: --dawn-bank block;
		--top: var(--dawn-top);
		--drift: var(--dawn-drift);
	}

	.bank {
		position: absolute;
		left: 0;
		top: var(--top);
		width: 100%;
	}

	.bank :global(img) {
		display: block;
		width: 100%;
		height: auto;
		user-select: none;
	}

	.bank :global(img.is-mobile) {
		display: none;
	}

	@media (max-width: 47.99rem) {
		.dawn-bank {
			--top: var(--dawn-top-m);
			--drift: var(--dawn-drift-m);
		}

		.bank :global(img.is-desktop) {
			display: none;
		}

		.bank :global(img.is-mobile) {
			display: block;
		}
	}

	/* The night lifts: the bank rises a little faster than the page. Small enough to keep the seam inside its opaque band. */
	@media (prefers-reduced-motion: no-preference) {
		@supports (animation-timeline: view()) {
			.bank {
				animation: bank-rise linear both;
				animation-timeline: --dawn-bank;
				animation-range: cover;
			}
		}
	}

	@keyframes bank-rise {
		from {
			transform: translate3d(0, var(--drift), 0);
		}
		to {
			transform: translate3d(0, calc(var(--drift) * -1), 0);
		}
	}
</style>
