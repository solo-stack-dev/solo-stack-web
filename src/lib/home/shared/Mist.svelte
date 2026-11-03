<!--
	@component
	A painted, partly transparent mist bank over the boundary between two sections, so feathered plates meet in air
	instead of at a line. Placed by the page between two sections (src/routes/+page.svelte), never inside a section.
	Zero height in the flow; the strip paints above both neighbors and takes no pointer events.

	Parallax: the strip drifts a little against the scroll (and sideways) with a CSS scroll-driven animation on its
	own view timeline (transform only, so it runs on the compositor). Static without support and under reduced motion.
	The image is lazy (enhanced-img, AVIF/WebP), so only strips near the viewport load.

	```svelte
	<Making />
	<Mist variant="dusk" height="clamp(10rem, 22vw, 20rem)" above={0.55} />
	<Game />
	```
-->
<script lang="ts" module>
	import mistDusk from './assets/transitions/mist-dusk.webp?w=1920;1280;720&enhanced';
	import mistNight from './assets/transitions/mist-night.webp?w=1920;1280;720&enhanced';
	import mistPredawn from './assets/transitions/mist-predawn.webp?w=1920;1280;720&enhanced';

	const MISTS = { dusk: mistDusk, night: mistNight, predawn: mistPredawn } as const;
	export type MistVariant = keyof typeof MISTS;
</script>

<script lang="ts">
	interface Props {
		/** Painted strip: `dusk` (20–22 h, warm catch-lights), `night` (01–02 h), `predawn` (02–04 h, warm glow below). */
		variant: MistVariant;
		/** Strip height (CSS length). Default `clamp(9rem, 22vw, 20rem)`. */
		height?: string;
		/** Share of the strip above the boundary, 0…1. Default 0.5. */
		above?: number;
		/** Overall opacity, 0…1. Default 0.7. */
		opacity?: number;
		/** Horizontal centers (in % of the width) of two soft gaps where the bank thins out, so it never reads as one
		 *  continuous stripe across the page. Default `[28, 74]`. */
		gaps?: [number, number];
		/** Mirror the strip horizontally, to vary a reused strip. */
		mirror?: boolean;
		/** Shift the (horizontally seamless) painting sideways by this share of its width, in %, wrapping around, so a
		 *  reused strip shows a different silhouette. Default 0. */
		offset?: number;
		/** Vertical parallax travel each way (CSS length). Default `2.5rem`. */
		drift?: string;
		class?: string;
	}

	let {
		variant,
		height = 'clamp(9rem, 22vw, 20rem)',
		above = 0.5,
		opacity = 0.7,
		gaps = [28, 74],
		mirror = false,
		offset = 0,
		drift = '2.5rem',
		class: className = ''
	}: Props = $props();
</script>

<div class={['mist', className]} aria-hidden="true">
	<div
		class="strip"
		style:--mist-height={height}
		style:--mist-above={above}
		style:--mist-drift={drift}
		style:--gap-a="{gaps[0]}%"
		style:--gap-b="{gaps[1]}%"
		style:--mist-offset="{offset}%"
		style:opacity
	>
		<div class="tiles">
			<enhanced:img src={MISTS[variant]} alt="" sizes="112vw" loading="lazy" decoding="async" class={[mirror && 'is-mirrored']} />
			{#if offset}
				<!-- the wrapped-around remainder of the shifted painting (same source, decoded once) -->
				<enhanced:img src={MISTS[variant]} alt="" sizes="112vw" loading="lazy" decoding="async" class={[mirror && 'is-mirrored']} />
			{/if}
		</div>
	</div>
</div>

<style>
	.mist {
		position: relative;
		z-index: 2;
		height: 0;
		pointer-events: none;
		view-timeline: --mist block;
	}

	.strip {
		position: absolute;
		left: -6%;
		width: 112%;
		top: calc(var(--mist-height) * var(--mist-above) * -1);
		height: var(--mist-height);
		/* two soft gaps (intersected), so the bank breaks up into drifting banks with air between them */
		mask-image:
			radial-gradient(ellipse 20% 95% at var(--gap-a) 50%, transparent 15%, #000 100%), radial-gradient(ellipse 16% 95% at var(--gap-b) 55%, transparent 10%, #000 100%);
		mask-composite: intersect;
		overflow: clip;
	}

	.tiles {
		display: flex;
		width: 100%;
		height: 100%;
		translate: calc(var(--mist-offset) * -1) 0;
	}

	.strip :global(img) {
		display: block;
		flex: none;
		width: 100%;
		height: 100%;
		/* the strips are horizontally seamless, so a squeezed aspect on narrow screens is fine */
		object-fit: fill;
		user-select: none;
	}

	.strip :global(img.is-mirrored) {
		scale: -1 1;
	}

	@media (prefers-reduced-motion: no-preference) {
		@supports (animation-timeline: view()) {
			.strip {
				animation: mist-drift linear both;
				animation-timeline: --mist;
				animation-range: cover;
			}
		}
	}

	/* Sinks slower than the page (it lags behind the plates) and slides a little sideways. */
	@keyframes mist-drift {
		from {
			transform: translate3d(-2.5%, calc(var(--mist-drift) * -1), 0);
		}
		to {
			transform: translate3d(2.5%, var(--mist-drift), 0);
		}
	}
</style>
