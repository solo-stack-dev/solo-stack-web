/**
 * Night shift scene geometry: the one place to re-tune the composition.
 *
 * Sources: measurements of the repaint in docs/art/night-shift/repaint/ (desktop 2560×1440, mobile 1080×2340) and the
 * crop rects tools/optimize-art.mjs writes to ./art.ts. Authored in art px, exported as percentages (0…100) of each
 * variant's canvas, so layers, monitor and hotspots stay pixel-registered at every size.
 */
import { PROPS, SCENES, type ArtRect } from './art.ts';

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

/** Quad corners, clockwise from top left. */
export type Quad = [Point, Point, Point, Point];

export type SpotId = 'window' | 'coffee' | 'handheld' | 'manga' | 'bonsai' | 'dumbbells';

export interface Spot {
	id: SpotId;
	/** Hit area (the button). Keep at least 44 CSS px on phones. */
	rect: Rect;
	/** Area that lights up on hover/focus (defaults to `rect`). */
	glow?: Rect;
	/** Tooltip anchor in % of `rect`; the tooltip sits above it. Default: top center. */
	tip?: Point;
	/** Part of the tooltip on the anchor; `end` for right-edge spots so it opens leftwards. */
	tipAlign?: 'start' | 'center' | 'end';
	/** Tap marker ("tap to explore" ring) in % of `rect`, or `null` for none. Default: center. */
	dot?: Point | null;
}

export interface SceneLayout {
	/** Art canvas size in px (aspect ratio of every layer of this variant). */
	canvas: { width: number; height: number };
	/** Cover-crop focal point, 0…1. */
	focal: Point;
	/** Painted screen. The terminal is a `box`-sized HTML block mapped onto `quad` with a matrix3d. */
	monitor: { quad: Quad; box: { width: number; height: number }; fontSize: number; padding: number };
	/** Box around the painted mascot: holds the shiny egg's radial glow; its sparkle sits top right. */
	mascot: Rect;
	/** Upper window glass (both panes). */
	window: Rect;
	/** Lamp bulb (flicker glow); radius in % of canvas width. */
	lamp: Point & { radius: number };
	/** Box the steam wisps rise in, from its bottom center. */
	steam: Rect;
	/** Bonsai pot baseline center: golden canopy transform origin and particle source. */
	bonsai: Point;
	/** Cropped transparent props, placed on this canvas. */
	props: { bonsai: Rect; golden: Rect; handheld: Rect; foreground?: Rect };
	/** Plate image height in % of canvas (the file carries the hands band below the scene). */
	sheet: number;
	/**
	 * Typing hands: a window at `rect` (canvas %) onto the plate image, sized `image` (% of the window) and translated
	 * by `cells[frame - 1]` (% of the image).
	 */
	hands: { rect: Rect; image: { w: number; h: number }; cells: Point[] };
	/** Hotspots in tab order. */
	spots: Spot[];
}

interface Canvas {
	width: number;
	height: number;
}

/** Uniform scale + offset from a source canvas into the scene canvas (art px). */
interface Transform {
	scale: number;
	x: number;
	y: number;
}

const IDENTITY: Transform = { scale: 1, x: 0, y: 0 };

const r4 = (value: number) => Math.round(value * 10000) / 10000;

const rectPct = (canvas: Canvas, x: number, y: number, w: number, h: number): Rect => ({
	x: r4((x / canvas.width) * 100),
	y: r4((y / canvas.height) * 100),
	w: r4((w / canvas.width) * 100),
	h: r4((h / canvas.height) * 100)
});

const pointPct = (canvas: Canvas, [x, y]: [number, number]): Point => ({ x: r4((x / canvas.width) * 100), y: r4((y / canvas.height) * 100) });

/** A source point drawn through `t`, as canvas percentages. */
const at = (canvas: Canvas, [x, y]: [number, number], t: Transform = IDENTITY) => pointPct(canvas, [t.x + x * t.scale, t.y + y * t.scale]);

/** A cropped source rect drawn through `t`, as canvas percentages. */
const place = (canvas: Canvas, crop: ArtRect, t: Transform = IDENTITY) =>
	rectPct(canvas, t.x + crop.x * t.scale, t.y + crop.y * t.scale, crop.width * t.scale, crop.height * t.scale);

type Plate = (typeof SCENES)[keyof typeof SCENES];

/** The hands window and its cells from art.ts (plate px) as percentages. */
const hands = ({ canvas, sheet, hands: rect, cells }: Plate): SceneLayout['hands'] => ({
	rect: rectPct(canvas, rect.x, rect.y, rect.width, rect.height),
	image: { w: r4((canvas.width / rect.width) * 100), h: r4((sheet / rect.height) * 100) },
	cells: cells.map(({ x, y }) => ({ x: r4((-x / canvas.width) * 100), y: r4((-y / sheet) * 100) }))
});

const sheetPct = ({ canvas, sheet }: Plate) => r4((sheet / canvas.height) * 100);

/** Moves each corner `inset` px toward the center so the text clears the painted bezel. */
function screen(canvas: Canvas, corners: [number, number][], inset: number): Quad {
	const cx = corners.reduce((sum, [x]) => sum + x, 0) / 4;
	const cy = corners.reduce((sum, [, y]) => sum + y, 0) / 4;
	return corners.map(([x, y]) => pointPct(canvas, [x + Math.sign(cx - x) * inset, y + Math.sign(cy - y) * inset])) as Quad;
}

/** Bonsai pot baseline center on the prop canvas (both trees share the pot). */
const POT: [number, number] = [2303, 1090];
/** Handheld prop center on the prop canvas. */
const CONSOLE: [number, number] = [313, 1175];

/** Maps a prop canvas point `from` to `to` on a scene canvas at `scale`. */
const anchor = (from: [number, number], to: [number, number], scale: number): Transform => ({ scale, x: to[0] - from[0] * scale, y: to[1] - from[1] * scale });

// ── Desktop 2560×1440: over-the-shoulder repaint (docs/art/night-shift/repaint/NOTES.md, measurements.json) ──────────
const D: Canvas = { width: 2560, height: 1440 };
/** Props were painted for a closer room; 0.8 matches the repaint (mug rim 134 vs 171 px). */
const BONSAI_ON_DESKTOP = anchor(POT, [2420, 850], 0.8);
const HANDHELD_ON_DESKTOP = anchor(CONSOLE, [370, 1180], 0.8);

export const desktop: SceneLayout = {
	canvas: D,
	focal: { x: 0.55, y: 0.6 },
	monitor: {
		// left edge is nearer the camera (screen turns toward the typist)
		quad: screen(
			D,
			[
				[799, 525],
				[1400, 513],
				[1400, 797],
				[799, 855]
			],
			10
		),
		// screen mid lines ≈ 601×307 art px; same aspect, fits a page plus the prompt
		box: { width: 540, height: 276 },
		fontSize: 18,
		padding: 24
	},
	// head, headphones, back, arms down to the hands; no chair
	mascot: rectPct(D, 1018, 230, 1160, 1082),
	window: rectPct(D, 420, 0, 1080, 480),
	// center of the shade's lit opening
	lamp: { ...pointPct(D, [358, 622]), radius: 14 },
	// mug rim [501, 860, 134, 30], steam origin (568, 873)
	steam: rectPct(D, 503, 609, 130, 264),
	bonsai: at(D, POT, BONSAI_ON_DESKTOP),
	props: {
		bonsai: place(D, PROPS.bonsai, BONSAI_ON_DESKTOP),
		golden: place(D, PROPS.golden, BONSAI_ON_DESKTOP),
		handheld: place(D, PROPS.handheld, HANDHELD_ON_DESKTOP)
	},
	sheet: sheetPct(SCENES.desktop),
	hands: hands(SCENES.desktop),
	spots: [
		// upper panes above the monitor, left of the head
		{ id: 'window', rect: rectPct(D, 420, 0, 1080, 480), tip: { x: 45, y: 60 } },
		{ id: 'coffee', rect: rectPct(D, 452, 856, 201, 190) },
		{ id: 'handheld', rect: rectPct(D, 210, 1095, 330, 170), tip: { x: 30, y: 4 }, tipAlign: 'start' },
		{ id: 'manga', rect: rectPct(D, 2025, 0, 535, 475), tip: { x: 45, y: 40 }, tipAlign: 'end' },
		// pedestal book plus the grown golden canopy
		{ id: 'bonsai', rect: rectPct(D, 2270, 500, 290, 400), tip: { x: 50, y: 10 }, tipAlign: 'end' },
		{ id: 'dumbbells', rect: rectPct(D, 2270, 1190, 290, 218), tipAlign: 'end' }
	]
};

// ── Mobile 1080×2340: portrait repaint; desktop props reused, anchored on its own measurements ──────────────────────
const M: Canvas = { width: 1080, height: 2340 };
const BONSAI_TO_MOBILE = anchor(POT, [995, 1141], 0.4);
const HANDHELD_TO_MOBILE = anchor(CONSOLE, [190, 1400], 0.4);

export const mobile: SceneLayout = {
	canvas: M,
	focal: { x: 0.5, y: 0.45 },
	monitor: {
		quad: screen(
			M,
			[
				[160, 945],
				[609, 928],
				[607, 1140],
				[160, 1184]
			],
			6
		),
		// screen mid lines ≈ 448×226 art px; 174 px tall fits a page plus the prompt
		box: { width: 344, height: 174 },
		fontSize: 13,
		padding: 10
	},
	mascot: rectPct(M, 388, 895, 614, 572),
	window: rectPct(M, 60, 20, 662, 700),
	lamp: { ...pointPct(M, [172, 882]), radius: 26 },
	// mug rim [79, 1212, 68, 22], steam origin (112, 1223)
	steam: rectPct(M, 80, 1103, 66, 120),
	bonsai: at(M, POT, BONSAI_TO_MOBILE),
	props: { bonsai: place(M, PROPS.bonsai, BONSAI_TO_MOBILE), golden: place(M, PROPS.golden, BONSAI_TO_MOBILE), handheld: place(M, PROPS.handheld, HANDHELD_TO_MOBILE) },
	sheet: sheetPct(SCENES.mobile),
	hands: hands(SCENES.mobile),
	// Tap rings stay ≥ 96 CSS px clear of the 01:00 heading box (top left, two lines): the window lies wholly under the heading, so it
	// keeps its hit area and tooltip (opened below the heading) but no ring; the manga ring sits at the shelf's foot.
	spots: [
		{ id: 'window', rect: rectPct(M, 60, 20, 662, 700), tip: { x: 50, y: 86 }, dot: null },
		{ id: 'manga', rect: rectPct(M, 872, 300, 208, 514), tip: { x: 45, y: 62 }, tipAlign: 'end', dot: { x: 50, y: 97 } },
		{ id: 'coffee', rect: rectPct(M, 40, 1190, 140, 150), tipAlign: 'start' },
		{ id: 'handheld', rect: rectPct(M, 90, 1340, 200, 120), tipAlign: 'start' },
		{ id: 'bonsai', rect: rectPct(M, 900, 950, 180, 220), tip: { x: 45, y: 0 }, tipAlign: 'end' },
		{ id: 'dumbbells', rect: rectPct(M, 670, 2006, 370, 285), tipAlign: 'end' }
	]
};

/** Commits per terminal "page" before it clears and continues. */
export const COMMITS_PER_PAGE = 6;
