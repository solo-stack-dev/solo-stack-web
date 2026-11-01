/**
 * Night shift scene geometry, the single place to re-tune the composition.
 *
 * Source of truth: the measurements of the over-the-shoulder repaint in docs/art/night-shift/repaint/ (desktop scene
 * 2560×1440, mobile scene 1080×2340, all in art px) and the crop rects that tools/optimize-art.mjs wrote to ./art.ts. Everything here is
 * authored in art px and exported as percentages (0…100) of each variant's canvas, so the layers, the live monitor
 * and the hotspots stay pixel-registered at every size.
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
	/** Box around the painted mascot: the shiny egg's golden glow is a radial gradient inside it, its sparkle sits top right. */
	mascot: Rect;
	/** Upper window glass (both panes). */
	window: Rect;
	/** Sky plate (drifts with the scroll) and the two glass panes it shows through, as polygons in canvas percent. */
	sky: { rect: Rect; panes: Point[][] };
	/** Desk lamp bulb (flicker glow) and its light radius in percent of the canvas width. */
	lamp: Point & { radius: number };
	/** Steam over the mug: box the wisps rise in (they start at the bottom center). */
	steam: Rect;
	/** Bonsai pot (center of its baseline): transform origin for the golden canopy and particle source. */
	bonsai: Point;
	/** Cropped transparent props, placed on this canvas. */
	props: { bonsai: Rect; golden: Rect; handheld: Rect; foreground?: Rect };
	/** Plate image height in percent of the canvas: the file carries the hands band below the scene. */
	sheet: number;
	/**
	 * Typing hands: a window at `rect` (canvas percent) onto the same plate image, which is `image` (percent of the
	 * window) large and translated by `cells[frame - 1]` (percent of the image) to show that frame's cell.
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

/** Moves every corner `inset` px toward the quad's center, so the live text keeps clear of the painted bezel. */
function screen(canvas: Canvas, corners: [number, number][], inset: number): Quad {
	const cx = corners.reduce((sum, [x]) => sum + x, 0) / 4;
	const cy = corners.reduce((sum, [, y]) => sum + y, 0) / 4;
	return corners.map(([x, y]) => pointPct(canvas, [x + Math.sign(cx - x) * inset, y + Math.sign(cy - y) * inset])) as Quad;
}

/** Bonsai pot: center of its baseline on the desktop prop canvas (both tree states share the pot). */
const POT: [number, number] = [2303, 1090];
/** Handheld: the cropped prop's center on the desktop prop canvas. */
const CONSOLE: [number, number] = [313, 1175];

/** Maps a prop canvas point `from` to `to` on a scene canvas at `scale`. */
const anchor = (from: [number, number], to: [number, number], scale: number): Transform => ({ scale, x: to[0] - from[0] * scale, y: to[1] - from[1] * scale });

// ── Desktop 2560×1440: over-the-shoulder repaint (docs/art/night-shift/repaint/NOTES.md, measurements.json) ──────────
const D: Canvas = { width: 2560, height: 1440 };
/** The props were painted for the old, closer room: 0.8 matches the repaint's scale (mug rim 134 vs 171 px). */
const BONSAI_ON_DESKTOP = anchor(POT, [2420, 850], 0.8);
const HANDHELD_ON_DESKTOP = anchor(CONSOLE, [370, 1180], 0.8);

export const desktop: SceneLayout = {
	canvas: D,
	focal: { x: 0.55, y: 0.6 },
	monitor: {
		// left edge is nearer the camera (the screen turns slightly toward the typist)
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
		// the screen's mid lines measure ≈ 601×307 art px; the box keeps that aspect and fits a page plus the prompt
		box: { width: 540, height: 276 },
		fontSize: 18,
		padding: 24
	},
	// head, headphones, back and both arms down to the hands on the keys (the chair excluded)
	mascot: rectPct(D, 1018, 230, 1160, 1082),
	window: rectPct(D, 420, 0, 1080, 480),
	sky: {
		// moon (at 33.2 %, 40.7 % of the sky plate) in the upper left pane, right of the heading and above the treetops
		rect: rectPct(D, 523, -211, 985, 985),
		panes: [
			[
				[72, 0],
				[1058, 0],
				[1058, 498],
				[769, 506],
				[768, 758],
				[91, 811],
				[72, 758]
			],
			[
				[1147, 0],
				[1664, 0],
				[1664, 231],
				[1550, 330],
				[1520, 500],
				[1419, 496],
				[1147, 501]
			]
		].map((pane) => pane.map((point) => pointPct(D, point as [number, number])))
	},
	// center of the shade's lit opening
	lamp: { ...pointPct(D, [358, 622]), radius: 14 },
	// mug rim [501, 860, 134, 30], steam origin (568, 873): the wisps rise from the bottom center of this box
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

// ── Mobile 1080×2340: dedicated portrait repaint; the desktop props are reused, anchored on its own measurements ───
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
		// the screen's mid lines measure ≈ 448×226 art px; 174 px tall fits a full page plus the prompt
		box: { width: 344, height: 174 },
		fontSize: 13,
		padding: 10
	},
	mascot: rectPct(M, 388, 895, 614, 572),
	window: rectPct(M, 60, 20, 662, 700),
	sky: {
		// moon in the upper right pane, above the treetops
		rect: rectPct(M, 289, -89, 833, 833),
		panes: [
			[
				[60, 15],
				[357, 61],
				[357, 931],
				[150, 940],
				[150, 1047],
				[60, 1060]
			],
			[
				[411, 66],
				[722, 119],
				[722, 897],
				[612, 923],
				[411, 932]
			]
		].map((pane) => pane.map((point) => pointPct(M, point as [number, number])))
	},
	lamp: { ...pointPct(M, [172, 882]), radius: 26 },
	// mug rim [79, 1212, 68, 22], steam origin (112, 1223)
	steam: rectPct(M, 80, 1103, 66, 120),
	bonsai: at(M, POT, BONSAI_TO_MOBILE),
	props: { bonsai: place(M, PROPS.bonsai, BONSAI_TO_MOBILE), golden: place(M, PROPS.golden, BONSAI_TO_MOBILE), handheld: place(M, PROPS.handheld, HANDHELD_TO_MOBILE) },
	sheet: sheetPct(SCENES.mobile),
	hands: hands(SCENES.mobile),
	spots: [
		{ id: 'window', rect: rectPct(M, 60, 20, 662, 700), tip: { x: 50, y: 50 } },
		{ id: 'manga', rect: rectPct(M, 872, 300, 208, 514), tip: { x: 45, y: 10 }, tipAlign: 'end' },
		{ id: 'coffee', rect: rectPct(M, 40, 1190, 140, 150), tipAlign: 'start' },
		{ id: 'handheld', rect: rectPct(M, 90, 1340, 200, 120), tipAlign: 'start' },
		{ id: 'bonsai', rect: rectPct(M, 900, 950, 180, 220), tip: { x: 45, y: 0 }, tipAlign: 'end' },
		{ id: 'dumbbells', rect: rectPct(M, 670, 2006, 370, 285), tipAlign: 'end' }
	]
};

/** How many commits one terminal "page" types before it clears and continues with the next ones. */
export const COMMITS_PER_PAGE = 6;

/** SVG mask (data URL) that shows only the given polygons (canvas percent): the sky inside the glass panes. */
export function polygonMask(polygons: Point[][]): string {
	const shapes = polygons.map((polygon) => `<polygon points='${polygon.map((p) => `${p.x},${p.y}`).join(' ')}' fill='white'/>`).join('');
	const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='none'>${shapes}</svg>`;
	return `url("data:image/svg+xml,${svg.replaceAll('<', '%3C').replaceAll('>', '%3E')}")`;
}
