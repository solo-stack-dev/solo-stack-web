<!--
	@component
	Painted air over a section boundary, so feathered plates meet in air, not at a line. Placed between sections in
	src/routes/+page.svelte, never inside one. Zero height in the flow; paints above both neighbors, no pointer events.

	Two optional layers, each its own painted strip:
	- `variant`: the lit mist bank (dusk / night / predawn), the far layer. Keep it narrow and light: a broad bank reads as a belt.
	- `cloud`: a dark foreground cloud silhouette (round-2 `seam-cloud-a/b/c`, irregular top with rising wisps) that overlaps the
	  plate edges. Give every seam a different strip, mirror and shift, so no two boundaries share a silhouette.

	Parallax via its own view timeline, transform only (compositor); the foreground travels further than the mist. Static
	without support and under reduced motion. Lazy images that start after the hero moon (`DeferredArt`).

	```svelte
	<Making />
	<Mist variant="dusk" height="clamp(7rem, 15vw, 14rem)" above={0.3} cloud={{ strip: 'b', height: 'clamp(6rem, 13vw, 12rem)', above: 0.6 }} />
	<Game />
	```
-->
<script lang="ts" module>
	import mistDusk from './assets/transitions/mist-dusk.webp?w=1920;1280;720&enhanced';
	import mistNight from './assets/transitions/mist-night.webp?w=1920;1280;720&enhanced';
	import mistPredawn from './assets/transitions/mist-predawn.webp?w=1920;1280;720&enhanced';
	import cloudA from './assets/transitions/seam-cloud-a.webp?w=1920;1280;720&enhanced';
	import cloudB from './assets/transitions/seam-cloud-b.webp?w=1920;1280;720&enhanced';
	import cloudC from './assets/transitions/seam-cloud-c.webp?w=1920;1280;720&enhanced';

	const MISTS = { dusk: mistDusk, night: mistNight, predawn: mistPredawn } as const;
	const CLOUDS = { a: cloudA, b: cloudB, c: cloudC } as const;
	export type MistVariant = keyof typeof MISTS;
	export type SeamCloud = keyof typeof CLOUDS;

	export interface CloudLayer {
		/** `a` left-heavy bank with three rising gestures, `b` right shoulder + two wisps, `c` shallow central crest. */
		strip: SeamCloud;
		/** Strip height (CSS length; the painting is 16:3 at full width). Default `clamp(6rem, 14vw, 13rem)`. */
		height?: string;
		/** Share of the strip above the boundary, 0…1. Default 0.55. */
		above?: number;
		/** Opacity, 0…1. Default 0.9. */
		opacity?: number;
		mirror?: boolean;
		/** Horizontal stretch (≥ 1): wider strip, part of it off screen; with `shift` picks which part shows. Default 1.15. */
		stretch?: number;
		/** Horizontal shift, % of the viewport width (positive moves right). Default 0. */
		shift?: number;
		/** Vertical parallax travel each way (CSS length). Default `4rem`. */
		drift?: string;
	}
</script>

<script lang="ts">
	import DeferredArt from './DeferredArt.svelte';

	interface Props {
		/** Lit mist bank: `dusk` (20–22 h, warm catch-lights), `night` (01–02 h), `predawn` (02–04 h, warm glow below). Omit for none. */
		variant?: MistVariant;
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
		/** Dark foreground cloud silhouette in front of the mist. */
		cloud?: CloudLayer;
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
		cloud,
		class: className = ''
	}: Props = $props();
</script>

<div class={['mist', className]} aria-hidden="true">
	{#if variant}
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
				<DeferredArt rest>
					<enhanced:img src={MISTS[variant]} alt="" sizes="112vw" loading="lazy" decoding="async" class={[mirror && 'is-mirrored']} />
					{#if offset}
						<!-- wrapped-around remainder (same source, decoded once) -->
						<enhanced:img src={MISTS[variant]} alt="" sizes="112vw" loading="lazy" decoding="async" class={[mirror && 'is-mirrored']} />
					{/if}
				</DeferredArt>
			</div>
		</div>
	{/if}
	{#if cloud}
		<div
			class="cloud"
			style:--cloud-height={cloud.height ?? 'clamp(6rem, 14vw, 13rem)'}
			style:--cloud-above={cloud.above ?? 0.55}
			style:--cloud-stretch={cloud.stretch ?? 1.15}
			style:--cloud-shift="{cloud.shift ?? 0}vw"
			style:--mist-drift={cloud.drift ?? '4rem'}
			style:opacity={cloud.opacity ?? 0.9}
		>
			<DeferredArt rest>
				<enhanced:img
					src={CLOUDS[cloud.strip]}
					alt=""
					sizes="{Math.round((cloud.stretch ?? 1.15) * 100)}vw"
					loading="lazy"
					decoding="async"
					class={[cloud.mirror && 'is-mirrored']}
				/>
			</DeferredArt>
		</div>
	{/if}
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

	:is(.strip, .cloud) :global(img.is-mirrored) {
		scale: -1 1;
	}

	/* Foreground silhouette: wider than the screen (the painting spans both side borders), centered plus `shift`. Clipped at
	   the page edges by NightPage. */
	.cloud {
		position: absolute;
		left: calc(50% - var(--cloud-stretch) * 50% + var(--cloud-shift));
		width: calc(var(--cloud-stretch) * 100%);
		top: calc(var(--cloud-height) * var(--cloud-above) * -1);
		height: var(--cloud-height);
		/* the painted soft base dissolves into the plate below in a ragged line, not a soft straight edge */
		mask:
			linear-gradient(#000 0 0) top / 100% 52% no-repeat,
			var(--feather-down) bottom / 100% 48.5% repeat-x;
	}

	.cloud :global(img) {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: fill;
		user-select: none;
	}

	@media (prefers-reduced-motion: no-preference) {
		@supports (animation-timeline: view()) {
			.strip,
			.cloud {
				animation: mist-drift linear both;
				animation-timeline: --mist;
				animation-range: cover;
			}

			.cloud {
				animation-name: cloud-drift;
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

	/* The foreground runs ahead of the page (opposite to the far mist): depth between the two layers. */
	@keyframes cloud-drift {
		from {
			transform: translate3d(2%, var(--mist-drift), 0);
		}
		to {
			transform: translate3d(-2%, calc(var(--mist-drift) * -1), 0);
		}
	}
</style>
