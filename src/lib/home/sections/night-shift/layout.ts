/**
 * Night shift scene geometry, the single place to re-tune the composition.
 *
 * Source of truth: the coordinate contract in docs/art/night-shift/README.md ("Coherent scene revision": desktop scene
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

// ── Desktop 2560×1440 ───────────────────────────────────────────────────────────────────────────────────────────
const D: Canvas = { width: 2560, height: 1440 };
/** The pot's feet would hover at the back edge of the pedestal book on the scene plate; 18 px lower they stand on it. */
const BONSAI_ON_DESKTOP: Transform = { scale: 1, x: 0, y: 18 };

export const desktop: SceneLayout = {
	canvas: D,
	focal: { x: 0.55, y: 0.6 },
	monitor: {
		quad: screen(
			D,
			[
				[609, 563],
				[1168, 639],
				[1220, 950],
				[661, 949]
			],
			8
		),
		box: { width: 480, height: 320 },
		fontSize: 18,
		padding: 26
	},
	// head, headphones, shoulders and arms down to the hands on the keys
	mascot: rectPct(D, 1080, 290, 900, 790),
	window: rectPct(D, 536, 11, 582, 589),
	sky: {
		rect: rectPct(D, 430, -100, 1100, 1100),
		panes: [
			[
				[538, 11],
				[943, 106],
				[942, 569],
				[536, 508]
			],
			[
				[969, 113],
				[1116, 153],
				[1118, 600],
				[968, 575]
			]
		].map((pane) => pane.map((point) => pointPct(D, point as [number, number])))
	},
	// center of the shade's lit opening
	lamp: { ...pointPct(D, [320, 628]), radius: 16 },
	// mug rim ≈ x 355…525 at y 960 (handle on the left); the wisps rise from the bottom center of this box
	steam: rectPct(D, 357, 622, 166, 338),
	bonsai: at(D, POT, BONSAI_ON_DESKTOP),
	props: {
		bonsai: place(D, PROPS.bonsai, BONSAI_ON_DESKTOP),
		golden: place(D, PROPS.golden, BONSAI_ON_DESKTOP),
		handheld: place(D, PROPS.handheld),
		foreground: place(D, PROPS.foreground)
	},
	sheet: sheetPct(SCENES.desktop),
	hands: hands(SCENES.desktop),
	spots: [
		{
			id: 'window',
			// upper panes, stopping at the monitor's top edge (y 563)
			rect: rectPct(D, 536, 11, 582, 552),
			glow: rectPct(D, 535, 87, 520, 520),
			tip: { x: 45, y: 38 }
		},
		// README "coherent scene revision" rects (art px); the bonsai's moves with its 18 px offset
		{ id: 'coffee', rect: rectPct(D, 294, 948, 255, 195) },
		{ id: 'handheld', rect: rectPct(D, 126, 1082, 375, 187), tip: { x: 30, y: 4 }, tipAlign: 'start' },
		{ id: 'manga', rect: rectPct(D, 1940, 200, 620, 355), tip: { x: 45, y: 8 }, tipAlign: 'end' },
		{ id: 'bonsai', rect: rectPct(D, 2020, 696, 506, 418), tip: { x: 50, y: 10 }, tipAlign: 'end' },
		{ id: 'dumbbells', rect: rectPct(D, 1858, 1212, 395, 182) }
	]
};

// ── Mobile 1080×2340: dedicated portrait scene; the desktop props are reused with the README's affine maps ────────
const M: Canvas = { width: 1080, height: 2340 };
/** README map (0.6, -435, 855), nudged 24 px right and 6 px down so both feet of the pot stand on the right-hand book. */
const BONSAI_TO_MOBILE: Transform = { scale: 0.6, x: -411, y: 861 };
const HANDHELD_TO_MOBILE: Transform = { scale: 0.8, x: 40, y: 650 };

export const mobile: SceneLayout = {
	canvas: M,
	focal: { x: 0.5, y: 0.45 },
	monitor: {
		quad: screen(
			M,
			[
				[96, 975],
				[548, 1052],
				[593, 1320],
				[138, 1318]
			],
			6
		),
		box: { width: 300, height: 216 },
		fontSize: 16,
		padding: 14
	},
	mascot: rectPct(M, 400, 850, 610, 600),
	window: rectPct(M, 46, 0, 434, 700),
	sky: {
		// README rest rect is (-65, 10); raised 50 px so the scroll drift never uncovers the panes' top edge
		rect: rectPct(M, -65, -40, 800, 800),
		panes: [
			[
				[46, 0],
				[76, 0],
				[349, 133],
				[349, 663],
				[46, 586]
			],
			[
				[371, 145],
				[480, 197],
				[480, 700],
				[371, 672]
			]
		].map((pane) => pane.map((point) => pointPct(M, point as [number, number])))
	},
	lamp: { ...pointPct(M, [199, 912]), radius: 30 },
	// mug rim ≈ x 105…220 at y 1378
	steam: rectPct(M, 104, 1167, 119, 211),
	bonsai: at(M, POT, BONSAI_TO_MOBILE),
	props: { bonsai: place(M, PROPS.bonsai, BONSAI_TO_MOBILE), golden: place(M, PROPS.golden, BONSAI_TO_MOBILE), handheld: place(M, PROPS.handheld, HANDHELD_TO_MOBILE) },
	sheet: sheetPct(SCENES.mobile),
	hands: hands(SCENES.mobile),
	spots: [
		{ id: 'window', rect: rectPct(M, 46, 0, 434, 700), glow: rectPct(M, 10, 95, 380, 380), tip: { x: 45, y: 55 } },
		{ id: 'manga', rect: rectPct(M, 760, 420, 320, 280), tip: { x: 45, y: 10 }, tipAlign: 'end' },
		{ id: 'coffee', rect: rectPct(M, 60, 1368, 186, 155), tipAlign: 'start' },
		{ id: 'handheld', rect: rectPct(M, 140, 1515, 301, 151) },
		// README rect moved with the bonsai's nudge (left edge kept clear of the golden canopy at x ≈ 805)
		{ id: 'bonsai', rect: rectPct(M, 790, 1266, 290, 255), tip: { x: 45, y: 0 }, tipAlign: 'end', dot: { x: 56, y: 50 } },
		{ id: 'dumbbells', rect: rectPct(M, 605, 2005, 475, 245) }
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
