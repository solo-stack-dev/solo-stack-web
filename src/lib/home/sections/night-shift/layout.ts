/**
 * Night shift scene geometry, the single place to re-tune when the final art lands.
 *
 * All positions are percentages (0…100) of the art canvas of each variant, so they stay pixel-registered to the
 * painted layers at every size: desktop art is 2560×1440, mobile art 1080×2340. Current values are measured on the
 * round-2 mockups (`docs/mockups/round-2/05-night-shift-radio/01-…` and `04-…`), which the placeholder layers in
 * `./assets/` are cut from. To re-tune: open the art in an editor, read pixel coordinates, divide by the canvas size.
 */

export interface Point {
	x: number;
	y: number;
}

export interface Rect {
	x: number;
	y: number;
	w: number;
	h: number;
}

/** Corners of a quad, clockwise from top left: top left, top right, bottom right, bottom left. */
export type Quad = [Point, Point, Point, Point];

export type SpotId = 'window' | 'coffee' | 'handheld' | 'manga' | 'bonsai' | 'dumbbells';

export interface Spot {
	id: SpotId;
	/** Hit area (the button). Keep at least 44 CSS px on phones. */
	rect: Rect;
	/** Area that lights up on hover/focus (defaults to `rect`). */
	glow?: Rect;
	/** Tooltip anchor in percent of `rect` (the tooltip sits above it). Default: top center. */
	tip?: Point;
	/** Which part of the tooltip sits on the anchor: `end` for spots at the right edge so it opens leftwards. */
	tipAlign?: 'start' | 'center' | 'end';
	/** Tap marker position in percent of `rect` (mobile "tap to explore" rings). Default: center. */
	dot?: Point;
}

export interface SceneLayout {
	/** Art canvas size in px (aspect ratio of every layer of this variant). */
	canvas: { width: number; height: number };
	/** Cover-crop focal point, 0…1: which part of the art stays visible when the viewport's aspect differs. */
	focal: Point;
	/** Painted monitor screen. The live terminal is a `box`-sized HTML block mapped onto `quad` with a matrix3d. */
	monitor: { quad: Quad; box: { width: number; height: number }; fontSize: number; padding: number };
	/** Where the mascot sits (reserved for glance/light effects and a cropped mascot layer). */
	seat: Rect;
	/** Window aperture (the sky layer drifts behind it). */
	window: Rect;
	/** Sky layer placement (full canvas by default; a ~900² sky sits wherever its rect says). Omit if not layered. */
	sky?: Rect;
	/** Desk lamp bulb (flicker glow) and its light radius in percent of the canvas width. */
	lamp: Point & { radius: number };
	/** Steam over the mug: box the wisps rise in (they start at the bottom center). */
	steam: Rect;
	/** Bonsai pot center: transform origin for the golden canopy growth and particle source. */
	bonsai: Point;
	/** Painted layers this variant has (mobile ships a single flattened plate). */
	layers: { mascot: boolean; bonsai: boolean; handheld: boolean; foreground: boolean };
	/** Hotspots in tab order. */
	spots: Spot[];
}

const FULL: Rect = { x: 0, y: 0, w: 100, h: 100 };

export const desktop: SceneLayout = {
	canvas: { width: 2560, height: 1440 },
	focal: { x: 0.55, y: 0.6 },
	monitor: {
		quad: [
			{ x: 23.74, y: 38.79 },
			{ x: 45.57, y: 43.78 },
			{ x: 47.85, y: 66.31 },
			{ x: 25.72, y: 66.1 }
		],
		box: { width: 480, height: 320 },
		fontSize: 18,
		padding: 26
	},
	seat: { x: 44.86, y: 17, w: 33, h: 57.9 },
	window: { x: 21.05, y: 0.85, w: 22.61, h: 40.38 },
	sky: FULL,
	lamp: { x: 12.56, y: 44.63, radius: 16 },
	steam: { x: 13, y: 43, w: 6.5, h: 23.5 },
	bonsai: { x: 93, y: 71 },
	layers: { mascot: true, bonsai: true, handheld: true, foreground: true },
	spots: [
		{ id: 'window', rect: { x: 21.05, y: 0.85, w: 22.61, h: 37 }, glow: { x: 22.6, y: 16.9, w: 12.6, h: 21.4 }, tip: { x: 37, y: 42 } },
		{ id: 'coffee', rect: { x: 11.66, y: 65.36, w: 8.97, h: 11.69 } },
		{ id: 'handheld', rect: { x: 5.2, y: 75.6, w: 19.6, h: 10.2 }, tip: { x: 30, y: 0 }, tipAlign: 'start' },
		{ id: 'manga', rect: { x: 83.13, y: 13.8, w: 16.87, h: 19.6 }, tip: { x: 40, y: 4 }, tipAlign: 'end' },
		{ id: 'bonsai', rect: { x: 83.43, y: 48.88, w: 16.33, h: 27.84 }, tip: { x: 45, y: 8 }, tipAlign: 'end' },
		{ id: 'dumbbells', rect: { x: 72.49, y: 83.74, w: 15.43, h: 12.75 } }
	]
};

/** Mobile percentages: mockup px (858×1834) → 1080×2340 cover crop: x = (px·1.2759 − 7.35) / 10.8, y = px / 18.34. */
export const mobile: SceneLayout = {
	canvas: { width: 1080, height: 2340 },
	focal: { x: 0.5, y: 0.45 },
	monitor: {
		quad: [
			{ x: 7.83, y: 43.76 },
			{ x: 48.94, y: 46.89 },
			{ x: 51.3, y: 58.67 },
			{ x: 10.67, y: 58.34 }
		],
		box: { width: 300, height: 216 },
		fontSize: 16,
		padding: 14
	},
	seat: { x: 36, y: 34, w: 55, h: 30 },
	window: { x: 10.19, y: 17.99, w: 41.11, h: 18 },
	lamp: { x: 18.22, y: 40.62, radius: 30 },
	steam: { x: 6.5, y: 51.5, w: 11, h: 9 },
	bonsai: { x: 92.65, y: 66.25 },
	layers: { mascot: false, bonsai: false, handheld: false, foreground: false },
	spots: [
		{ id: 'window', rect: { x: 10.19, y: 17.99, w: 41.11, h: 18 }, glow: { x: 12.5, y: 20.6, w: 26, h: 11.6 }, tip: { x: 40, y: 30 } },
		{ id: 'manga', rect: { x: 80.5, y: 16.4, w: 19.5, h: 11.4 }, tip: { x: 40, y: 0 }, tipAlign: 'end' },
		{ id: 'coffee', rect: { x: 2.5, y: 59.6, w: 17.5, h: 7 }, tipAlign: 'start' },
		{ id: 'handheld', rect: { x: 11, y: 66.2, w: 42, h: 6.8 } },
		{ id: 'bonsai', rect: { x: 77, y: 54, w: 23, h: 14.4 }, tip: { x: 45, y: 0 }, tipAlign: 'end', dot: { x: 60, y: 82 } },
		{ id: 'dumbbells', rect: { x: 57.2, y: 86.7, w: 34.26, h: 9.27 } }
	]
};

/** How many commits one terminal "page" types before it clears and continues with the next ones. */
export const COMMITS_PER_PAGE = 6;
