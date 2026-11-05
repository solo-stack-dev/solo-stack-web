/**
 * Geometry of the growth hill (GrowthHill.svelte): the follower curve as the crest of an ink hill that climbs to the tree of
 * light. Everything is computed in a fixed virtual canvas per layout (the SVG viewBox), and the art is placed in percent of
 * that canvas, so the prerendered HTML is already exact at every viewport width (no hydration jump, no layout shift).
 *
 * The crest uses the same monotone cubic as d3's `curveMonotoneX` (Steffen tangents). Its Bézier control points are spaced
 * evenly in x, so x is linear in t and `crestAt(x)` is exact: the tree and the mascot stand precisely on the drawn line.
 */

/** Art anchors, measured on the alpha channel of the production WebPs (see docs/art/site/README.md). */
export const ART = {
	/** Trunk axis x; groundY: where the roots meet the painted flat mound strip; rootLeft/Right: ends of that strip. */
	tree: { width: 1190, height: 1322, trunkX: 573, groundY: 1300, rootLeft: 66, rootRight: 1124, canopyX: 600, canopyY: 470, topY: 117 },
	rays: { width: 1586, height: 992, originX: 816, originY: 221 },
	mascot: { width: 700, height: 700, centerX: 330, groundY: 663 }
} as const;

export interface LayoutSpec {
	/** Virtual canvas. */
	w: number;
	h: number;
	/** Tree width as a fraction of the canvas width. */
	tree: number;
	/** Trunk position: distance from the right edge in tree widths. */
	trunkFromRight: number;
	/** First data point x, as a fraction of the canvas width. */
	startX: number;
	/** Crest y of the period minimum and maximum, fractions of the canvas height. */
	low: number;
	high: number;
	/** Mascot width as a fraction of the tree width, and its distance left of the roots in mascot widths. */
	mascot: number;
	mascotGap: number;
	/** Where the land meets the right canvas edge, fraction of the height. */
	rightEdge: number;
	/**
	 * The painted foot (stats-hill-feather.webp): where its solid top attaches at the left and right canvas edge (fractions of
	 * the height; a gentle slope, so the ink under the low start of the path stays shallow), and its depth.
	 */
	foot: readonly [left: number, right: number];
	footDepth: number;
}

export const LAYOUTS = {
	/** Phones: the tree stands inside the canvas, below the period switch. */
	narrow: {
		w: 390,
		h: 470,
		tree: 0.6,
		trunkFromRight: 0.52,
		startX: 0.045,
		low: 0.8,
		high: 0.56,
		mascot: 0.27,
		mascotGap: 0.02,
		rightEdge: 0.66,
		foot: [0.8, 0.72],
		footDepth: 0.19
	},
	/** From 640 px: the canvas tucks under the big number, the tree rises beside it. */
	wide: {
		w: 1440,
		h: 480,
		tree: 0.35,
		trunkFromRight: 0.64,
		startX: 0.06,
		low: 0.8,
		high: 0.4,
		mascot: 0.19,
		mascotGap: 0.08,
		rightEdge: 0.5,
		foot: [0.76, 0.66],
		footDepth: 0.21
	}
} as const satisfies Record<string, LayoutSpec>;

export type LayoutName = keyof typeof LAYOUTS;

type Point = [number, number];
type Cubic = [Point, Point, Point, Point];

const sign = (value: number) => (value < 0 ? -1 : 1);

/** d3-shape monotoneX interior tangent. */
function slope3(p0: Point, p1: Point, p2: Point) {
	const h0 = p1[0] - p0[0];
	const h1 = p2[0] - p1[0];
	const s0 = (p1[1] - p0[1]) / (h0 || (h1 < 0 ? -0 : 0));
	const s1 = (p2[1] - p1[1]) / (h1 || (h0 < 0 ? -0 : 0));
	const p = (s0 * h1 + s1 * h0) / (h0 + h1);
	return (sign(s0) + sign(s1)) * Math.min(Math.abs(s0), Math.abs(s1), 0.5 * Math.abs(p)) || 0;
}

/** d3-shape monotoneX end tangent. */
function slope2(p0: Point, p1: Point, t: number) {
	const h = p1[0] - p0[0];
	return h ? ((3 * (p1[1] - p0[1])) / h - t) / 2 : t;
}

function tangents(points: Point[]) {
	const n = points.length;
	if (n < 2) return [0];
	if (n === 2) {
		const s = (points[1][1] - points[0][1]) / (points[1][0] - points[0][0] || 1);
		return [s, s];
	}
	const t = points.map((_, index) => (index > 0 && index < n - 1 ? slope3(points[index - 1], points[index], points[index + 1]) : 0));
	t[0] = slope2(points[0], points[1], t[1]);
	t[n - 1] = slope2(points[n - 2], points[n - 1], t[n - 2]);
	return t;
}

function bezier([p0, p1, p2, p3]: Cubic, t: number): Point {
	const u = 1 - t;
	const a = u * u * u;
	const b = 3 * u * u * t;
	const c = 3 * u * t * t;
	const d = t * t * t;
	return [a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0], a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]];
}

/** y on the crest at x (clamped to the data range). */
function crestAt(points: Point[], slopes: number[], x: number) {
	if (x <= points[0][0]) return points[0][1];
	for (let index = 1; index < points.length; index++) {
		const [x1, y1] = points[index];
		if (x > x1) continue;
		const [x0, y0] = points[index - 1];
		const dx = x1 - x0;
		const t = (x - x0) / dx;
		const c0 = y0 + (dx * slopes[index - 1]) / 3;
		const c1 = y1 - (dx * slopes[index]) / 3;
		return bezier(
			[
				[0, y0],
				[0, c0],
				[0, c1],
				[0, y1]
			],
			t
		)[1];
	}
	return points[points.length - 1][1];
}

const r = (value: number) => Math.round(value * 10) / 10;
const pt = ([x, y]: Point) => `${r(x)} ${r(y)}`;
const pct = (value: number, of: number) => Math.round((value / of) * 10000) / 100;

export interface Placement {
	left: number;
	top: number;
	width: number;
}

export interface HillGeometry {
	spec: LayoutSpec;
	points: Point[];
	/** Crest path (the glowing line). */
	crest: string;
	/** Ink body: crest, the knoll the roots stand on, the slope to the right edge, closed along the bottom. */
	body: string;
	/** Faint far ridge for depth. */
	far: string;
	end: Point;
	/** Art placement in percent of the canvas (left/top of the image box, width). */
	tree: Placement;
	rays: Placement;
	mascot: Placement;
	/**
	 * Mask of the ink: `solid` is everything above the attach line; the painted feather hangs below it, sheared along the line
	 * by `transform` (x, y of the image box are -420, 0; width w + 840; height `depth`).
	 */
	foot: { solid: string; transform: string; depth: number };
	/** Points in percent of the canvas. */
	glow: { left: number; top: number };
	/** Date labels set into the ink just under the path, turned with it (angle in degrees). */
	startLabel: { left: number; top: number; angle: number };
	endLabel: { left: number; top: number; angle: number };
}

export function hill(values: readonly number[], name: LayoutName): HillGeometry {
	const spec: LayoutSpec = LAYOUTS[name];
	const { w, h } = spec;
	const treeW = w * spec.tree;
	const scale = treeW / ART.tree.width;
	const treeH = ART.tree.height * scale;
	const endX = w - treeW * spec.trunkFromRight;
	const startX = w * spec.startX;

	const min = Math.min(...values);
	const max = Math.max(...values);
	const span = max - min || 1;
	const top = h * spec.high;
	const bottom = h * spec.low;
	const last = values.length - 1 || 1;
	const points = values.map((value, index) => [startX + (index / last) * (endX - startX), bottom - ((value - min) / span) * (bottom - top)] as Point);
	const slopes = tangents(points);

	/** The crest as Bézier segments, shifted up by `lift`. */
	const trace = (lift: number) => {
		let d = `M${pt([points[0][0], points[0][1] - lift])}`;
		for (let index = 1; index < points.length; index++) {
			const [x0, y0] = points[index - 1];
			const [x1, y1] = points[index];
			const dx = (x1 - x0) / 3;
			d += `C${pt([x0 + dx, y0 - lift + dx * slopes[index - 1]])} ${pt([x1 - dx, y1 - lift - dx * slopes[index]])} ${pt([x1, y1 - lift])}`;
		}
		return d;
	};
	const crest = trace(0);
	// The ink rises a little above the path, so the glowing line always runs on the ridge (never half on the paper).
	const lift = h * 0.014;

	// The tree's trunk stands on the end point. Its painted roots end in a flat strip; the knoll under it belongs to the ink
	// body, so the roots never float above a falling crest.
	const [ex, ey] = points[points.length - 1];
	// The knoll is a low dome under the painted root strip: shoulders slightly below the trunk base, crown just above it, so
	// the strip's faded edge always melts into ink and no straight line shows.
	const mound = ey + 8 * scale;
	const crown = ey - 16 * scale;
	const rootLeft = ex - (ART.tree.trunkX - ART.tree.rootLeft) * scale;
	const rootRight = ex + (ART.tree.rootRight - ART.tree.trunkX) * scale;
	const flank = treeW * 0.24;
	const footX = Math.max(startX, rootLeft - flank);
	const footY = crestAt(points, slopes, footX);
	const flankCurve: Cubic = [
		[footX, footY + 2],
		[footX + flank * 0.55, footY],
		[rootLeft - flank * 0.25, mound],
		[rootLeft + treeW * 0.06, mound]
	];
	const right = h * spec.rightEdge;
	const knoll =
		`M${pt(flankCurve[0])}C${flankCurve.slice(1).map(pt).join(' ')}` +
		`C${pt([ex - treeW * 0.22, crown])} ${pt([ex + treeW * 0.22, crown])} ${pt([rootRight - treeW * 0.06, mound])}` +
		`C${pt([rootRight + treeW * 0.08, mound + 3 * scale])} ${pt([w - treeW * 0.02, right - h * 0.03])} ${pt([w + 12, right])}` +
		`L${pt([w + 400, right + h * 0.04])}L${pt([w + 400, h * 1.4])}L${pt([footX, h * 1.4])}Z`;

	// Left of the data the land runs on gently past the canvas edge (the canvas is capped on very wide screens).
	const [sx, sy] = points[0];
	const lead = `M${pt([-400, sy + h * 0.04])}L${pt([-12, sy + h * 0.02])}C${pt([sx * 0.4, sy + h * 0.01])} ${pt([sx * 0.7, sy - lift])} ${pt([sx, sy - lift])}`;
	const body = `${lead}${trace(lift).replace(/^M[^C]+/, '')}L${pt([ex, h * 1.4])}L${pt([-400, h * 1.4])}Z${knoll}`;

	// Far ridge: the crest flattened and lifted, sinking away behind the tree.
	const every = Math.max(1, Math.round(points.length / 10));
	let far = `M${pt([-400, top + (bottom - top) * 0.45])}`;
	points.forEach(([x, y], index) => {
		if (index % every === 0) far += `L${pt([x * 0.9, top * 0.82 + (y - top) * 0.42])}`;
	});
	far += `L${pt([w * 0.86, top * 0.7])}L${pt([w + 400, top + h * 0.12])}L${pt([w + 400, h * 1.4])}L${pt([-400, h * 1.4])}Z`;

	// Highest ink at x (crest or knoll flank): where the mascot sits.
	const flankPoints = Array.from({ length: 33 }, (_, step) => bezier(flankCurve, step / 32));
	const surfaceAt = (x: number) => {
		let y = crestAt(points, slopes, x) - lift;
		if (x >= rootLeft) return Math.min(y, mound);
		for (let index = 1; index < flankPoints.length; index++) {
			const [x0, y0] = flankPoints[index - 1];
			const [x1, y1] = flankPoints[index];
			if (x >= x0 && x <= x1) y = Math.min(y, y0 + ((x - x0) / (x1 - x0 || 1)) * (y1 - y0));
		}
		return y;
	};

	const treeLeft = ex - ART.tree.trunkX * scale;
	const treeTop = ey - ART.tree.groundY * scale;
	const canopyX = treeLeft + ART.tree.canopyX * scale;
	const canopyY = treeTop + ART.tree.canopyY * scale;
	const raysW = treeW * 1.8;
	const raysScale = raysW / ART.rays.width;
	const raysOriginY = treeTop + ART.tree.topY * scale + treeH * 0.1;

	const mascotW = treeW * spec.mascot;
	const mascotScale = mascotW / ART.mascot.width;
	// The figure's right edge (its feet) ends `mascotGap` widths left of the roots.
	const mascotX = rootLeft - mascotW * (spec.mascotGap + (ART.mascot.width - 90 - ART.mascot.centerX) / ART.mascot.width);
	const mascotY = Math.max(surfaceAt(mascotX - mascotW * 0.25), surfaceAt(mascotX + mascotW * 0.2)) + mascotW * 0.03;

	// Date labels: offset along the path's normal into the ink, turned with the slope. The start label begins just after the
	// first point; the end label ends at the last one, under today's light (clear of its beacon).
	const along = (x: number, offset: number) => {
		const y = crestAt(points, slopes, x);
		const slope = (crestAt(points, slopes, x + 2) - crestAt(points, slopes, x - 2)) / 4;
		const angle = Math.atan(slope);
		return { left: pct(x - Math.sin(angle) * offset, w), top: pct(y + Math.cos(angle) * offset, h), angle: Math.round(((angle * 180) / Math.PI) * 10) / 10 };
	};
	const labelOffset = h * 0.028;
	const startLabel = along(sx + w * 0.012, labelOffset);
	const endLabel = along(ex - w * 0.004, h * 0.05);

	// The painted foot: the feather's solid top attaches along a gently sloped line, its brush runs out below it.
	const [footLeft, footRight] = spec.foot.map((fraction) => h * fraction);
	const footSlope = (footRight - footLeft) / w;
	const lineAt = (x: number) => footLeft + footSlope * x;
	// The solid part reaches 6 units into the feather's opaque top row, so the join never shows.
	const foot = {
		solid: `M-420 -400L${w + 420} -400L${w + 420} ${r(lineAt(w + 420) + 6)}L-420 ${r(lineAt(-420) + 6)}Z`,
		transform: `matrix(1 ${Math.round(footSlope * 100000) / 100000} 0 1 0 ${r(footLeft)})`,
		depth: r(h * spec.footDepth)
	};

	return {
		spec,
		points,
		crest,
		body,
		far,
		end: [ex, ey],
		tree: { left: pct(treeLeft, w), top: pct(treeTop, h), width: pct(treeW, w) },
		rays: { left: pct(canopyX - ART.rays.originX * raysScale, w), top: pct(raysOriginY - ART.rays.originY * raysScale, h), width: pct(raysW, w) },
		mascot: { left: pct(mascotX - ART.mascot.centerX * mascotScale, w), top: pct(mascotY - ART.mascot.groundY * mascotScale, h), width: pct(mascotW, w) },
		foot,
		glow: { left: pct(canopyX, w), top: pct(canopyY, h) },
		startLabel,
		endLabel
	};
}
