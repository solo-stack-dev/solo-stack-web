/**
 * Night shift scene geometry, the single place to re-tune the composition.
 *
 * Source of truth: the coordinate contract in docs/art/night-shift/README.md (desktop art 2560×1440, mobile art
 * 1080×2340, all in art px) and the crop rects that tools/optimize-art.mjs wrote to ./art.ts. Everything here is
 * authored in art px and exported as percentages (0…100) of each variant's canvas, so the layers, the live monitor
 * and the hotspots stay pixel-registered at every size.
 */
import { PROPS, TYPING, type ArtRect } from './art.ts';

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
	/** Reserved mascot area from the art contract (reference for effects). */
	seat: Rect;
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
	/**
	 * Typing mascot: `rect` = the cropped body image on the canvas; `hands` = the hand patch (sprite cell) in percent
	 * of `rect`; `clip` = CSS polygon (percent of `rect`) that hides everything behind the desk except hands on the keys.
	 */
	mascot: { rect: Rect; hands: Rect; clip: string };
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

/** A cropped source rect drawn through `t`, as canvas percentages. */
const place = (canvas: Canvas, crop: ArtRect, t: Transform = IDENTITY) =>
	rectPct(canvas, t.x + crop.x * t.scale, t.y + crop.y * t.scale, crop.width * t.scale, crop.height * t.scale);

/** Moves every corner `inset` px toward the quad's center, so the live text keeps clear of the painted bezel. */
function screen(canvas: Canvas, corners: [number, number][], inset: number): Quad {
	const cx = corners.reduce((sum, [x]) => sum + x, 0) / 4;
	const cy = corners.reduce((sum, [, y]) => sum + y, 0) / 4;
	return corners.map(([x, y]) => pointPct(canvas, [x + Math.sign(cx - x) * inset, y + Math.sign(cy - y) * inset])) as Quad;
}

/**
 * Typing mascot placed with `t` (frame canvas → scene px). `visible` is the area NOT hidden by the desk, as a polygon
 * in scene px; it becomes a clip polygon relative to the body image.
 */
function mascot(canvas: Canvas, t: Transform, visible: [number, number][]): SceneLayout['mascot'] {
	const { body, hands } = TYPING;
	const left = t.x + body.x * t.scale;
	const top = t.y + body.y * t.scale;
	const width = body.width * t.scale;
	const height = body.height * t.scale;
	const clip = visible.map(([x, y]) => `${r4(((x - left) / width) * 100)}% ${r4(((y - top) / height) * 100)}%`).join(', ');
	return {
		rect: rectPct(canvas, left, top, width, height),
		hands: {
			x: r4(((hands.x - body.x) / body.width) * 100),
			y: r4(((hands.y - body.y) / body.height) * 100),
			w: r4((hands.width / body.width) * 100),
			h: r4((hands.height / body.height) * 100)
		},
		clip: `polygon(${clip})`
	};
}

// ── Desktop 2560×1440 ───────────────────────────────────────────────────────────────────────────────────────────
const D: Canvas = { width: 2560, height: 1440 };

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
	seat: { x: 45, y: 17, w: 36, h: 57 },
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
	lamp: { ...pointPct(D, [322, 636]), radius: 16 },
	// mug opening ≈ (410, 962); the wisps rise from the bottom center of this box
	steam: rectPct(D, 327, 624, 166, 338),
	bonsai: pointPct(D, [2303, 1090]),
	props: { bonsai: place(D, PROPS.bonsai), golden: place(D, PROPS.golden), handheld: place(D, PROPS.handheld), foreground: place(D, PROPS.foreground) },
	// Seated in the painted chair behind the desk: the desk's back edge hides the legs and the mascot's own chair seat;
	// the hands rest on the keyboard (x 1048…1650, top ≈ 1008).
	mascot: mascot(D, { scale: 1.16, x: 993, y: 118 }, [
		[0, 0],
		[2560, 0],
		[2560, 1056],
		[1600, 1050],
		[1480, 1048],
		[1480, 1080],
		[1130, 1080],
		[1130, 1036],
		[1000, 1032],
		[0, 1032]
	]),
	spots: [
		{
			id: 'window',
			// upper panes, stopping at the monitor's top edge (y 563)
			rect: rectPct(D, 536, 11, 582, 552),
			glow: rectPct(D, 535, 87, 520, 520),
			tip: { x: 45, y: 38 }
		},
		{ id: 'coffee', rect: { x: 11.5, y: 66, w: 10, h: 13 } },
		{ id: 'handheld', rect: { x: 5, y: 75, w: 15, h: 13 }, tip: { x: 30, y: 4 }, tipAlign: 'start' },
		{ id: 'manga', rect: { x: 76, y: 14, w: 24, h: 22 }, tip: { x: 45, y: 8 }, tipAlign: 'end' },
		{ id: 'bonsai', rect: { x: 79, y: 47, w: 20, h: 29 }, tip: { x: 50, y: 10 }, tipAlign: 'end' },
		{ id: 'dumbbells', rect: { x: 72, y: 84, w: 17, h: 13 } }
	]
};

// ── Mobile 1080×2340: dedicated portrait plate; the desktop props are reused with the README's affine maps ────────
const M: Canvas = { width: 1080, height: 2340 };
const BONSAI_TO_MOBILE: Transform = { scale: 0.6, x: -435, y: 855 };
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
	seat: { x: 47, y: 34, w: 46, h: 27 },
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
	// mug opening ≈ (166, 1374)
	steam: rectPct(M, 106, 1163, 119, 211),
	bonsai: pointPct(M, [2303 * BONSAI_TO_MOBILE.scale + BONSAI_TO_MOBILE.x, 1090 * BONSAI_TO_MOBILE.scale + BONSAI_TO_MOBILE.y]),
	props: { bonsai: place(M, PROPS.bonsai, BONSAI_TO_MOBILE), golden: place(M, PROPS.golden, BONSAI_TO_MOBILE), handheld: place(M, PROPS.handheld, HANDHELD_TO_MOBILE) },
	// keyboard x 415…815, top ≈ 1390; desk back edge ≈ 1400…1410
	mascot: mascot(M, { scale: 0.82, x: 330, y: 740 }, [
		[0, 0],
		[1080, 0],
		[1080, 1410],
		[760, 1406],
		[760, 1438],
		[420, 1438],
		[420, 1400],
		[0, 1400]
	]),
	spots: [
		{ id: 'window', rect: { x: 4.2593, y: 0, w: 40.1852, h: 29.9145 }, glow: rectPct(M, 10, 95, 380, 380), tip: { x: 45, y: 55 } },
		{ id: 'manga', rect: { x: 67, y: 18, w: 33, h: 11 }, tip: { x: 45, y: 10 }, tipAlign: 'end' },
		{ id: 'coffee', rect: { x: 5, y: 58.5, w: 18, h: 6.5 }, tipAlign: 'start' },
		{ id: 'handheld', rect: { x: 13, y: 64.5, w: 28, h: 7 } },
		{ id: 'bonsai', rect: { x: 72, y: 54, w: 28, h: 11 }, tip: { x: 45, y: 0 }, tipAlign: 'end', dot: { x: 56, y: 50 } },
		{ id: 'dumbbells', rect: { x: 56, y: 85.5, w: 44, h: 10.5 } }
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
