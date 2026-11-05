/**
 * Deckled paper edge as a CSS mask (`mask: var(--deckle) center / 100% 100% no-repeat`): a rect whose border is displaced by
 * fractal noise, so painted art reads as a torn-out watercolor sheet instead of a rounded card. One inline SVG, rasterized
 * once per size; stretched to the element (the edge stays a few px wide on any 16:9…21:9 box).
 */
export const DECKLE_MASK =
	"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1600 900' preserveAspectRatio='none'%3E%3Cfilter id='d' x='-2%25' y='-2%25' width='104%25' height='104%25'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.045' numOctaves='3' seed='7'/%3E%3CfeDisplacementMap in='SourceGraphic' scale='16' xChannelSelector='R' yChannelSelector='G'/%3E%3C/filter%3E%3Crect x='10' y='10' width='1580' height='880' rx='4' filter='url(%23d)'/%3E%3C/svg%3E\")";

/** `DECKLE_MASK` for a wide, shallow sheet (about 4:1): the same torn edge, drawn in a viewBox of that shape so it keeps its width. */
export const DECKLE_MASK_WIDE =
	"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1600 400' preserveAspectRatio='none'%3E%3Cfilter id='d' x='-2%25' y='-5%25' width='104%25' height='110%25'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.045' numOctaves='3' seed='11'/%3E%3CfeDisplacementMap in='SourceGraphic' scale='14' xChannelSelector='R' yChannelSelector='G'/%3E%3C/filter%3E%3Crect x='9' y='9' width='1582' height='382' rx='3' filter='url(%23d)'/%3E%3C/svg%3E\")";

/**
 * Dry brush fade for the bottom of an ink silhouette (alpha mask, stretched to the element): a vertical gradient pushed
 * through fractal noise and a hard alpha curve, so the ink breaks up in ragged strokes over the lowest fifth instead of
 * fading to an airbrushed grey.
 */
export const DRY_BRUSH_FADE =
	"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1672 941' preserveAspectRatio='none'%3E%3ClinearGradient id='g' x1='0' y1='0' x2='0' y2='1'%3E%3Cstop offset='.8' stop-color='%23fff'/%3E%3Cstop offset='1' stop-color='%23000'/%3E%3C/linearGradient%3E%3Cfilter id='f' x='0' y='0' width='1' height='1' color-interpolation-filters='sRGB'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.032 .06' numOctaves='4' seed='5'/%3E%3CfeColorMatrix values='1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 0 1' result='n'/%3E%3CfeComposite in='SourceGraphic' in2='n' operator='arithmetic' k2='1' k3='.6' k4='-.3'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 6 0 0 0 -2.5'/%3E%3C/filter%3E%3Crect width='1672' height='941' fill='url(%23g)' filter='url(%23f)'/%3E%3C/svg%3E\")";

/** `DRY_BRUSH_FADE` turned sideways: the ink breaks up over the rightmost fifth (art that stops short of the viewport edge). */
export const DRY_BRUSH_FADE_RIGHT =
	"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1672 941' preserveAspectRatio='none'%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='0'%3E%3Cstop offset='.82' stop-color='%23fff'/%3E%3Cstop offset='1' stop-color='%23000'/%3E%3C/linearGradient%3E%3Cfilter id='f' x='0' y='0' width='1' height='1' color-interpolation-filters='sRGB'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.05 .03' numOctaves='4' seed='8'/%3E%3CfeColorMatrix values='1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 0 1' result='n'/%3E%3CfeComposite in='SourceGraphic' in2='n' operator='arithmetic' k2='1' k3='.6' k4='-.3'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 6 0 0 0 -2.5'/%3E%3C/filter%3E%3Crect width='1672' height='941' fill='url(%23g)' filter='url(%23f)'/%3E%3C/svg%3E\")";
