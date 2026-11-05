<!--
	@component
	Painted mist bank over a section boundary, so feathered plates meet in air, not at a line. Placed between sections
	in src/routes/+page.svelte, never inside one. Zero height in the flow; paints above both neighbors, no pointer events.

	Parallax via its own view timeline, transform only (compositor). Static without support and under reduced motion.
	Lazy image, so only strips near the viewport load.

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
		/** Horizontal centers (% of width) of two soft gaps, so the bank never reads as one stripe. Default `[28, 74]`. */
		gaps?: [number, number];
		/** Mirror the strip horizontally, to vary a reused strip. */
		mirror?: boolean;
		/** Sideways shift of the seamless painting, % of width, wrapping (a reused strip shows a new silhouette). Default 0. */
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
				<!-- wrapped-around remainder (same source, decoded once) -->
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
		/* two soft gaps and a soft base (the painted strip's bottom is nearly flat), intersected */
		mask-image:
			radial-gradient(ellipse 20% 95% at var(--gap-a) 50%, transparent 15%, #000 100%), radial-gradient(ellipse 16% 95% at var(--gap-b) 55%, transparent 10%, #000 100%),
			linear-gradient(#000 50%, color-mix(in oklab, #000 45%, transparent) 72%, transparent 96%);
		mask-composite: intersect;
		overflow: clip;
	}

	.tiles {
		display: flex;
		width: 100%;
		height: 100%;
		translate: calc(var(--mist-offset) * -1) 0;
	}

	/* enhanced:img renders a <picture>: let its <img> be the flex item, or the tile shrinks to its intrinsic width */
	.tiles :global(picture) {
		display: contents;
	}

	.strip :global(img) {
		display: block;
		flex: none;
		width: 100%;
		height: 100%;
		/* horizontally seamless, so a squeezed aspect on narrow screens is fine */
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

	/* Lags behind the plates and slides a little sideways. */
	@keyframes mist-drift {
		from {
			transform: translate3d(-2.5%, calc(var(--mist-drift) * -1), 0);
		}
		to {
			transform: translate3d(2.5%, var(--mist-drift), 0);
		}
	}
</style>
