/**
 * Geometry of the 04:00 → 06:00 seam (shared by Cinema, DawnBank and Sunrise), in vw, measured from the seam line: the cinema's
 * bottom, where `<DawnBank />` sits in the flow. Negative = above it. Breakpoint: 48rem (the cinema and sunrise switch there too).
 *
 * The cloud bank paintings (docs/art/site/round-3/dawn-cloud-bank*.png) are opaque across the full width only in a band
 * (desktop rows 520…690 of 900, mobile 580…790 of 1300). Everything that would show a straight line hides in that band:
 * the sunrise's top (it overlaps the cinema by `overlap` and feathers in over `fade`) and the end of the cinema cliff
 * (dissolved over `cliffFade`, gone `cliffCut` above the seam). Desktop: band ≈ −11.6…−5.0, mobile ≈ −30.7…−11.3, each
 * minus/plus `drift` (the bank's parallax travel each way).
 */
export interface DawnGeometry {
	/** Sunrise pulled up over the cinema (its top line). */
	overlap: number;
	/** Painted feather at the sunrise's top. */
	fade: number;
	/** Top of the cloud bank's image box. */
	top: number;
	/** Cinema cliff: fully transparent from here down (distance above the seam). */
	cliffCut: number;
	/** Cinema cliff: painted fade height above `cliffCut`. */
	cliffFade: number;
	/** Where the night's ink is gone (bank's ragged underside), from the sunrise's top: NightPage's nav ink switch. */
	clear: number;
	/** Vertical parallax travel each way. */
	drift: number;
}

export const DAWN: Record<'desktop' | 'mobile', DawnGeometry> = {
	// 2560×900 at full width: 35.16vw tall; row 600 (the band's middle) at −8.5
	desktop: { overlap: 11, fade: 5, top: -31.94, cliffCut: 7, cliffFade: 7, clear: 9.1, drift: 0.8 },
	// 1080×1300 at full width: 120.37vw tall; row 685 at −21
	mobile: { overlap: 25, fade: 8, top: -84.4, cliffCut: 15, cliffFade: 10, clear: 28.5, drift: 2 }
};

/** `--dawn-<key>` (desktop) and `--dawn-<key>-m` (mobile) as an inline style string. */
export const dawnVars = (): string =>
	(['desktop', 'mobile'] as const)
		.flatMap((bp) =>
			Object.entries(DAWN[bp]).map(([key, value]) => `--dawn-${key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}${bp === 'mobile' ? '-m' : ''}: ${value}vw`)
		)
		.join('; ');
