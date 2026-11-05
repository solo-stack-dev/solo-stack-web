/**
 * Ink morph runtime for 21:00 "What I make": layouts (plate coordinates), scroll timeline, and the one continuous line (entry → shape →
 * exit to the laptop screen) interpolated between the six shapes in paths.ts. Pure functions plus small caches; no DOM. HANDOFF-HOMEPAGE §5.2.
 */
import { SHAPES, SHAPE_MASKS, SHAPE_POINTS, STATE_IDS, type MakingStateId } from './paths.ts';

export { STATE_IDS, type MakingStateId };

export interface Point {
	x: number;
	y: number;
}

export type LayoutId = 'desktop' | 'mobile' | 'figure';

export interface MakingLayout {
	/** Plate size in plate pixels; also the SVG viewBox. */
	width: number;
	height: number;
	/** Where the shapes' local origin sits on the plate, and their scale (local units → plate px). */
	center: Point;
	scale: number;
	/** Start of the line (just off the plate edge) and the direction it travels from there. */
	entry: Point;
	entryDir: Point;
	/** Direction at the shape's first point; entry Bézier handle lengths (at entry, at shape) as fractions of the distance. */
	arriveDir: Point;
	entryHandles: [number, number];
	/** Bias added to the shape's own end tangent when the line leaves it (0,0 = follow the shape exactly). */
	leaveDir: Point;
	/** Exit curve handle lengths (at the shape, at the anchor) as fractions of the distance. */
	exitHandles: [number, number];
	/** End of the line and the direction it arrives in. */
	anchor: Point;
	anchorDir: Point;
	/** Stroke width in plate px. */
	stroke: number;
	/** Vertical position of the state title's top edge, plate px. */
	titleY: number;
	/** Screen of the painted laptop on the cliff (clockwise TL, TR, BR, BL, plate px): it lights up at the last state. */
	screen: readonly [Point, Point, Point, Point];
}

/** Blank laptop screen on the plates (docs/art/making): inner bezel edge in plate px, clockwise from top left, measured on zoomed master crops. */
export const LAPTOP_SCREEN = {
	desktop: [
		{ x: 2260, y: 938 },
		{ x: 2338, y: 939 },
		{ x: 2317, y: 1020 },
		{ x: 2238, y: 1017 }
	],
	mobile: [
		{ x: 898, y: 1728 },
		{ x: 972, y: 1730 },
		{ x: 952, y: 1800 },
		{ x: 875, y: 1792 }
	]
} as const satisfies Record<'desktop' | 'mobile', readonly [Point, Point, Point, Point]>;

/**
 * Line end: left edge of the laptop screen, slightly above its middle, so the line plugs into the screen instead of crossing it.
 * Desktop arrives from the shape on the left, portrait from the shape above.
 */
export const SCREEN_ANCHOR = {
	desktop: { x: 2247, y: 972 },
	mobile: { x: 885, y: 1758 }
} as const satisfies Record<'desktop' | 'mobile', Point>;

const norm = (x: number, y: number): Point => {
	const length = Math.hypot(x, y) || 1;
	return { x: x / length, y: y / length };
};

export const LAYOUTS: Record<LayoutId, MakingLayout> = {
	desktop: {
		width: 2560,
		height: 1440,
		center: { x: 1280, y: 630 },
		scale: 1.05,
		entry: { x: -40, y: 880 },
		entryDir: norm(1, -0.08),
		arriveDir: norm(1, -0.25),
		entryHandles: [0.5, 0.45],
		leaveDir: { x: 0, y: 0.08 },
		exitHandles: [0.45, 0.4],
		anchor: SCREEN_ANCHOR.desktop,
		// arrive pointing into the screen, so the line meets its edge head on
		anchorDir: norm(1, 0.12),
		stroke: 6.5,
		titleY: 975,
		screen: LAPTOP_SCREEN.desktop
	},
	mobile: {
		width: 1080,
		height: 2340,
		center: { x: 540, y: 950 },
		scale: 0.82,
		entry: { x: 820, y: -40 },
		entryDir: norm(-0.15, 1),
		arriveDir: norm(1, 0.15),
		entryHandles: [0.42, 0.22],
		leaveDir: { x: 0, y: 0.25 },
		exitHandles: [0.62, 0.38],
		anchor: SCREEN_ANCHOR.mobile,
		anchorDir: norm(0.8, 1),
		stroke: 8.5,
		titleY: 1240,
		screen: LAPTOP_SCREEN.mobile
	},
	// reduced motion: one static figure per state, short line in from the left and out to the right
	figure: {
		width: 900,
		height: 700,
		center: { x: 450, y: 340 },
		scale: 0.9,
		entry: { x: -10, y: 420 },
		entryDir: norm(1, 0),
		arriveDir: norm(1, -0.2),
		entryHandles: [0.5, 0.45],
		leaveDir: { x: 0, y: 0 },
		exitHandles: [0.45, 0.4],
		anchor: { x: 910, y: 430 },
		anchorDir: norm(1, 0),
		stroke: 6,
		titleY: 0,
		screen: [
			{ x: 0, y: 0 },
			{ x: 0, y: 0 },
			{ x: 0, y: 0 },
			{ x: 0, y: 0 }
		]
	}
};

/** Points of the entry curve (before the shape) and exit curve (after it). */
const ENTRY_POINTS = 32;
const EXIT_POINTS = 40;
export const LINE_POINTS = ENTRY_POINTS + SHAPE_POINTS + EXIT_POINTS;

/** Cubic Bézier p0 → p3 resampled to `count` points evenly spaced by arc length; endpoints included on request. */
function cubicPoints(p0: Point, p1: Point, p2: Point, p3: Point, count: number, includeStart: boolean, includeEnd: boolean): number[] {
	const DENSE = 160;
	const dense: Point[] = [];
	const lengths = [0];
	for (let i = 0; i <= DENSE; i++) {
		const t = i / DENSE;
		const u = 1 - t;
		const point = {
			x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
			y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y
		};
		if (i > 0) lengths.push(lengths[i - 1] + Math.hypot(point.x - dense[i - 1].x, point.y - dense[i - 1].y));
		dense.push(point);
	}
	const total = lengths[DENSE];
	const out: number[] = [];
	// spread `count` samples over the open/closed interval so neighbouring segments never duplicate a point
	const steps = count - 1 + (includeStart ? 0 : 1) + (includeEnd ? 0 : 1);
	let j = 1;
	for (let k = 0; k < count; k++) {
		const target = (total * (k + (includeStart ? 0 : 1))) / steps;
		while (j < DENSE && lengths[j] < target) j++;
		const span = lengths[j] - lengths[j - 1] || 1;
		const t = Math.min(1, Math.max(0, (target - lengths[j - 1]) / span));
		out.push(dense[j - 1].x + (dense[j].x - dense[j - 1].x) * t, dense[j - 1].y + (dense[j].y - dense[j - 1].y) * t);
	}
	return out;
}

const cache = new Map<string, Float32Array>();

/** The full line for one state in one layout: entry curve, shape, exit curve to the anchor. Flat [x, y, …]. */
export function composeLine(layoutId: LayoutId, state: MakingStateId): Float32Array {
	const key = `${layoutId}:${state}`;
	const cached = cache.get(key);
	if (cached) return cached;

	const layout = LAYOUTS[layoutId];
	const shape = SHAPES[state];
	const { center, scale } = layout;
	const start = { x: center.x + shape[0] * scale, y: center.y + shape[1] * scale };
	const end = { x: center.x + shape[shape.length - 2] * scale, y: center.y + shape[shape.length - 1] * scale };

	const inLength = Math.hypot(start.x - layout.entry.x, start.y - layout.entry.y);
	const entry = cubicPoints(
		layout.entry,
		{ x: layout.entry.x + layout.entryDir.x * inLength * layout.entryHandles[0], y: layout.entry.y + layout.entryDir.y * inLength * layout.entryHandles[0] },
		{ x: start.x - layout.arriveDir.x * inLength * layout.entryHandles[1], y: start.y - layout.arriveDir.y * inLength * layout.entryHandles[1] },
		start,
		ENTRY_POINTS,
		true,
		false
	);
	const outLength = Math.hypot(layout.anchor.x - end.x, layout.anchor.y - end.y);
	// Leave along the shape's end tangent (over the last sample step, ~13 local units) so the line runs on without a kink.
	const n = shape.length;
	const leave = norm(shape[n - 2] - shape[n - 4] + layout.leaveDir.x, shape[n - 1] - shape[n - 3] + layout.leaveDir.y);
	const exit = cubicPoints(
		end,
		{ x: end.x + leave.x * outLength * layout.exitHandles[0], y: end.y + leave.y * outLength * layout.exitHandles[0] },
		{ x: layout.anchor.x - layout.anchorDir.x * outLength * layout.exitHandles[1], y: layout.anchor.y - layout.anchorDir.y * outLength * layout.exitHandles[1] },
		layout.anchor,
		EXIT_POINTS,
		false,
		true
	);

	const line = new Float32Array(LINE_POINTS * 2);
	line.set(entry, 0);
	for (let i = 0; i < SHAPE_POINTS; i++) {
		line[ENTRY_POINTS * 2 + i * 2] = center.x + shape[i * 2] * scale;
		line[ENTRY_POINTS * 2 + i * 2 + 1] = center.y + shape[i * 2 + 1] * scale;
	}
	line.set(exit, (ENTRY_POINTS + SHAPE_POINTS) * 2);
	cache.set(key, line);
	return line;
}

const round1 = (v: number) => Math.round(v * 10) / 10;

/** Points as a smooth SVG path: quadratic segments through the midpoints (rounds corners by half a sample). */
export function toPathData(points: ArrayLike<number>): string {
	const count = points.length / 2;
	const r = round1;
	let d = `M${r(points[0])} ${r(points[1])}`;
	for (let i = 1; i < count - 1; i++) {
		const x = points[i * 2];
		const y = points[i * 2 + 1];
		d += `Q${r(x)} ${r(y)} ${r((x + points[i * 2 + 2]) / 2)} ${r((y + points[i * 2 + 3]) / 2)}`;
	}
	return `${d}L${r(points[count * 2 - 2])} ${r(points[count * 2 - 1])}`;
}

/** How much the morph sweeps along the line: the left end changes first, the right end last (0 = all at once). */
const SWEEP = 0.55;
const scratch = new Float32Array(LINE_POINTS * 2);

/** The line at a fractional state position `s` (0…5) as SVG path data. Deterministic in `s`, so it reverses exactly. */
export function lineAt(layoutId: LayoutId, s: number): string {
	const last = STATE_IDS.length - 1;
	const clamped = Math.min(last, Math.max(0, s));
	const from = Math.min(last - 1, Math.floor(clamped));
	const t = clamped - from;
	const a = composeLine(layoutId, STATE_IDS[from]);
	if (t <= 0) return toPathData(a);
	const b = composeLine(layoutId, STATE_IDS[from + 1]);
	if (t >= 1) return toPathData(b);
	for (let i = 0; i < LINE_POINTS; i++) {
		let k = t * (1 + SWEEP) - (SWEEP * i) / (LINE_POINTS - 1);
		k = k <= 0 ? 0 : k >= 1 ? 1 : k * k * (3 - 2 * k);
		scratch[i * 2] = a[i * 2] + (b[i * 2] - a[i * 2]) * k;
		scratch[i * 2 + 1] = a[i * 2 + 1] + (b[i * 2 + 1] - a[i * 2 + 1]) * k;
	}
	return toPathData(scratch);
}

/**
 * Pinned progress (0…1) of each state (motion spec: docs/mockups/round-2/03-what-i-make/README.md). Each is held for a window so the
 * shape rests and the bloom can grow.
 */
export const STATE_STOPS = [0, 0.18, 0.38, 0.58, 0.78, 1] as const;
const HOLD = 0.045;
const holdStart = (i: number) => (i === 0 ? 0 : STATE_STOPS[i] - HOLD);
const holdEnd = (i: number) => (i === STATE_STOPS.length - 1 ? 1 : i === 0 ? 0.06 : STATE_STOPS[i] + HOLD);

/** Progress (0…1) → state position (0…5, fractional while morphing, integer while held). */
export function stateAt(progress: number): number {
	for (let i = 0; i < STATE_STOPS.length; i++) {
		if (progress <= holdEnd(i)) {
			if (progress >= holdStart(i) || i === 0) return i;
			const span = holdStart(i) - holdEnd(i - 1);
			return i - 1 + (progress - holdEnd(i - 1)) / span;
		}
	}
	return STATE_STOPS.length - 1;
}

/** Progress to scroll to for a state: the middle of its hold window. */
export function progressFor(state: number): number {
	return (holdStart(state) + holdEnd(state)) / 2;
}

/** The four pillars of the bottom row (brand tagline terms, literal) and the states they cover. */
export const PILLARS = [
	{ label: 'AI', target: 1, states: [0, 1] },
	{ label: 'CODE', target: 2, states: [2] },
	{ label: 'SIDE PROJECTS', target: 3, states: [3] },
	{ label: 'BUSINESS', target: 4, states: [4, 5] }
] as const;

/** Local box of the bloom masks (shape units): the bloom image covers this square around the shape's origin. */
export const BLOOM_BOX = 700;

/** CSS `mask-image` for a state's bloom: the shape region as an SVG data URL with a soft edge. */
export function bloomMask(state: MakingStateId): string {
	const { d, stroke } = SHAPE_MASKS[state];
	const half = BLOOM_BOX / 2;
	const paint = stroke ? `fill='none' stroke='white' stroke-width='${stroke}' stroke-linecap='round' stroke-linejoin='round'` : `fill='white'`;
	const svg =
		`<svg xmlns='http://www.w3.org/2000/svg' viewBox='${-half} ${-half} ${BLOOM_BOX} ${BLOOM_BOX}'>` +
		`<filter id='s' x='-10%' y='-10%' width='120%' height='120%'><feGaussianBlur stdDeviation='5'/></filter>` +
		`<path d='${d}' ${paint} filter='url(%23s)'/></svg>`;
	return `url("data:image/svg+xml,${svg.replaceAll('<', '%3C').replaceAll('>', '%3E').replaceAll('"', "'")}")`;
}
