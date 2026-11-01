#!/usr/bin/env node
/**
 * 21:00 "What I make": build time resampler for the ink morph (docs/HANDOFF-HOMEPAGE.md §5.2).
 *
 * Every state is authored below as ONE continuous SVG path (absolute M/L/C/Q only) in a local box centered on (0, 0),
 * roughly ±300 units. Each path starts on the shape's left side (where the line comes in) and ends on its right side
 * (where it leaves). Interior details are reached by retracing: a segment drawn twice reads as one stroke, so the
 * whole drawing stays one line. The script flattens each path and resamples it to SHAPE_POINTS points evenly spaced
 * by arc length, so all six states have the identical point structure and can be interpolated point by point.
 *
 * It also emits the bloom masks (closed regions or thick strokes in the same local box) that clip the watercolor.
 *
 * Usage: `node scripts/making-paths.mjs && pnpm exec oxfmt src/lib/home/sections/making/paths.ts` → regenerates
 * src/lib/home/sections/making/paths.ts. No dependencies.
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const SHAPE_POINTS = 360;
const OUT = fileURLToPath(new URL('../src/lib/home/sections/making/paths.ts', import.meta.url));

/** Points along a circular arc from angle `from` to `to` (radians, screen coordinates). */
const arc = (cx, cy, rad, from, to, steps = 90) =>
	Array.from({ length: steps + 1 }, (_, i) => [cx + rad * Math.cos(from + ((to - from) * i) / steps), cy + rad * Math.sin(from + ((to - from) * i) / steps)]);

/** Crescent moon: outer circle minus an offset inner circle, as a polyline (arcs are easier to generate than author). */
function crescent() {
	const R = 225;
	const [ix, iy, r] = [100, -55, 190];
	const TAU = 2 * Math.PI;
	// intersections of the two circles = the crescent's tips
	const d = Math.hypot(ix, iy);
	const a = (R * R - r * r + d * d) / (2 * d);
	const h = Math.sqrt(R * R - a * a);
	const [mx, my] = [(a * ix) / d, (a * iy) / d];
	const p1 = [mx + (h * iy) / d, my - (h * ix) / d];
	const p2 = [mx - (h * iy) / d, my + (h * ix) / d];
	const [bottom, top] = p1[1] > p2[1] ? [p1, p2] : [p2, p1];
	const mod = (v) => ((v % TAU) + TAU) % TAU;
	const start = (165 * Math.PI) / 180; // outer rim, left, slightly below center (screen coords: y down, 90° = bottom)
	const aBottom = mod(Math.atan2(bottom[1], bottom[0])); // ~50°, reached from 165° by decreasing the angle
	let aTop = mod(Math.atan2(top[1], top[0])); // ~280°, decreasing through the top and the left back to 165°
	if (aTop < start) aTop += TAU;
	const iBottom = mod(Math.atan2(bottom[1] - iy, bottom[0] - ix));
	let iTop = mod(Math.atan2(top[1] - iy, top[0] - ix));
	if (iTop < iBottom) iTop += TAU; // increasing through 180°: the inner circle's left side, inside the outer one
	const pts = [...arc(0, 0, R, start, aBottom), ...arc(ix, iy, r, iBottom, iTop).slice(1), ...arc(0, 0, R, aTop, start).slice(1)];
	// retrace the lower rim to the bottom tip (invisible), then leave to the right
	pts.push(...arc(0, 0, R, start, aBottom, 60).slice(1), [bottom[0] + 40, bottom[1] + 6]);
	const mask = `M ${f(top[0])} ${f(top[1])} A ${R} ${R} 0 1 0 ${f(bottom[0])} ${f(bottom[1])} A ${r} ${r} 0 0 1 ${f(top[0])} ${f(top[1])} Z`;
	return { pts, mask };
}

const moon = crescent();

/** @type {Record<string, { d?: string, pts?: number[][], mask: { d: string, stroke?: number } }>} */
const SHAPES = {
	// lightbulb: glass from the left neck over the top to the right neck, collar, double loop filament, screw rows
	idea: {
		d: [
			'M -95 110',
			'C -95 60 -205 10 -205 -75',
			'C -205 -190 -112 -280 0 -280',
			'C 112 -280 205 -190 205 -75',
			'C 205 10 95 60 95 110',
			'L 32 110 L 32 -10',
			'C 32 -60 96 -72 86 -108',
			'C 76 -140 16 -122 0 -42',
			'C -16 -122 -76 -140 -86 -108',
			'C -96 -72 -32 -60 -32 -10',
			'L -32 110 L -90 110',
			'C -112 114 -112 146 -86 148',
			'L 86 148',
			'C 112 150 112 184 86 186',
			'L -80 186',
			'C -102 188 -98 220 -70 222',
			'L 64 222',
			'C 60 246 30 258 0 258',
			'C -26 258 -44 246 -46 232',
			'C -44 246 -26 258 0 258',
			'C 30 258 60 246 64 222',
			'L 112 222'
		].join(' '),
		mask: { d: 'M -95 115 C -95 60 -205 10 -205 -75 C -205 -190 -112 -280 0 -280 C 112 -280 205 -190 205 -75 C 205 10 95 60 95 115 Z' }
	},
	// chat bubble with a prompt: outline (tail bottom left), then `>` and a long `_` that runs out through the right wall
	ai: {
		d: [
			'M -250 -50',
			'L -250 -120 Q -250 -170 -200 -170',
			'L 200 -170 Q 250 -170 250 -120',
			'L 250 80 Q 250 130 200 130',
			'L -110 130 L -178 196 L -160 130',
			'L -200 130 Q -250 130 -250 80',
			'L -250 -50',
			'C -220 -50 -196 -62 -168 -62',
			'L -100 -14 L -168 34',
			'Q -160 52 -132 52',
			'L -30 52',
			'C 60 52 170 96 268 96'
		].join(' '),
		mask: {
			d: 'M -250 -120 Q -250 -170 -200 -170 L 200 -170 Q 250 -170 250 -120 L 250 80 Q 250 130 200 130 L -110 130 L -178 196 L -160 130 L -200 130 Q -250 130 -250 80 Z'
		}
	},
	// </> : left chevron (upper arm retraced), slash as a narrow loop, right chevron (upper arm retraced), exit at its tip
	code: {
		d: [
			'M -262 20',
			'L -112 -112 L -262 20',
			'L -112 152',
			'C -84 180 -38 190 -18 160',
			'L 68 -182',
			'C 82 -216 112 -204 102 -172',
			'L 12 166',
			'C 30 192 84 182 112 152',
			'L 262 20 L 112 -112 L 262 20'
		].join(' '),
		mask: { d: 'M -112 -112 L -262 20 L -112 152 M 112 -112 L 262 20 L 112 152 M -18 160 L 68 -182 L 102 -172 L 12 166', stroke: 92 }
	},
	// phone: outline with a speaker notch, a stem into the app tile, tile loop, retrace its top half, out through the right wall
	phone: {
		d: [
			'M -165 20',
			'L -165 -245 Q -165 -290 -120 -290',
			'L -48 -290 C -48 -266 -42 -262 -30 -262 L 30 -262 C 42 -262 48 -266 48 -290',
			'L 120 -290 Q 165 -290 165 -245',
			'L 165 245 Q 165 290 120 290',
			'L -120 290 Q -165 290 -165 245',
			'L -165 20',
			'L -80 20',
			'L -80 -30 Q -80 -60 -50 -60 L 50 -60 Q 80 -60 80 -30',
			'L 80 70 Q 80 100 50 100 L -50 100 Q -80 100 -80 70 L -80 20',
			'L -80 -30 Q -80 -60 -50 -60 L 50 -60 Q 80 -60 80 -30 L 80 20',
			'L 182 20'
		].join(' '),
		mask: { d: 'M -150 -232 Q -150 -275 -110 -275 L 110 -275 Q 150 -275 150 -232 L 150 232 Q 150 275 110 275 L -110 275 Q -150 275 -150 232 Z' }
	},
	// rising chart: y axis (top retraced), zigzag to the arrow, barbs, retrace the zigzag, x axis out to the right
	chart: {
		d: [
			'M -180 0',
			'L -180 -250 L -180 150',
			'L -62 32 L -10 84 L 80 -28 L 122 12 L 206 -150',
			'L 146 -114 L 206 -150 L 210 -80 L 206 -150',
			'L 122 12 L 80 -28 L -10 84 L -62 32 L -180 150',
			'L -180 172 Q -180 192 -160 192',
			'L 236 192'
		].join(' '),
		mask: { d: 'M -180 150 L -62 32 L -10 84 L 80 -28 L 122 12 L 206 -150 L 214 192 L -180 192 Z' }
	},
	// crescent moon over the cliff: leads into the next hour
	moon: {
		pts: moon.pts,
		mask: { d: moon.mask }
	}
};

function f(n) {
	return Math.round(n * 10) / 10;
}

/** Parse absolute M/L/C/Q commands into a dense polyline. */
function flatten(d) {
	const tokens = d.match(/[MLCQ]|-?\d*\.?\d+(?:e-?\d+)?/gi) ?? [];
	const pts = [];
	let i = 0;
	let cmd = '';
	let cur = [0, 0];
	const num = () => Number(tokens[i++]);
	const STEPS = 48;
	while (i < tokens.length) {
		if (/[A-Z]/i.test(tokens[i])) cmd = tokens[i++];
		if (cmd === 'M') {
			cur = [num(), num()];
			pts.push(cur);
			cmd = 'L';
		} else if (cmd === 'L') {
			const next = [num(), num()];
			const steps = Math.max(1, Math.ceil(Math.hypot(next[0] - cur[0], next[1] - cur[1]) / 6));
			for (let s = 1; s <= steps; s++) pts.push([cur[0] + ((next[0] - cur[0]) * s) / steps, cur[1] + ((next[1] - cur[1]) * s) / steps]);
			cur = next;
		} else if (cmd === 'C') {
			const [c1, c2, p] = [
				[num(), num()],
				[num(), num()],
				[num(), num()]
			];
			for (let s = 1; s <= STEPS; s++) {
				const t = s / STEPS;
				const u = 1 - t;
				pts.push([0, 1].map((k) => u * u * u * cur[k] + 3 * u * u * t * c1[k] + 3 * u * t * t * c2[k] + t * t * t * p[k]));
			}
			cur = p;
		} else if (cmd === 'Q') {
			const [c, p] = [
				[num(), num()],
				[num(), num()]
			];
			for (let s = 1; s <= STEPS; s++) {
				const t = s / STEPS;
				const u = 1 - t;
				pts.push([0, 1].map((k) => u * u * cur[k] + 2 * u * t * c[k] + t * t * p[k]));
			}
			cur = p;
		} else {
			throw new Error(`Unsupported command ${cmd} in ${d.slice(0, 40)}…`);
		}
	}
	return pts;
}

/** Resample a polyline to n points evenly spaced by arc length. */
function resample(pts, n) {
	const cum = [0];
	for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
	const total = cum.at(-1);
	const out = [];
	let j = 1;
	for (let k = 0; k < n; k++) {
		const target = (total * k) / (n - 1);
		while (j < pts.length - 1 && cum[j] < target) j++;
		const span = cum[j] - cum[j - 1] || 1;
		const t = Math.min(1, Math.max(0, (target - cum[j - 1]) / span));
		out.push(pts[j - 1][0] + (pts[j][0] - pts[j - 1][0]) * t, pts[j - 1][1] + (pts[j][1] - pts[j - 1][1]) * t);
	}
	return { out, total };
}

const lines = [];
const masks = [];
const lengths = [];
for (const [id, shape] of Object.entries(SHAPES)) {
	const { out, total } = resample(shape.pts ?? flatten(shape.d), SHAPE_POINTS);
	lines.push(`\t${id}: [${out.map((v) => Math.round(v)).join(',')}]`);
	masks.push(`\t${id}: { d: '${shape.mask.d}'${shape.mask.stroke ? `, stroke: ${shape.mask.stroke}` : ''} }`);
	lengths.push(`${id} ${Math.round(total)}`);
}

const source = `// GENERATED by scripts/making-paths.mjs. Do not edit by hand: change the authored paths there and rerun
// \`node scripts/making-paths.mjs\`. Shapes live in a local box centered on (0, 0), roughly ±300 units.

/** Points per shape. Every state has exactly this many, so states interpolate point by point. */
export const SHAPE_POINTS = ${SHAPE_POINTS};

export type MakingStateId = 'idea' | 'ai' | 'code' | 'phone' | 'chart' | 'moon';

/** State order on scroll. */
export const STATE_IDS: readonly MakingStateId[] = ['idea', 'ai', 'code', 'phone', 'chart', 'moon'];

/** Flat [x0, y0, x1, y1, …] per state, from the shape's entry point (left) to its exit point (right). */
export const SHAPES: Record<MakingStateId, readonly number[]> = {
${lines.join(',\n')}
};

/** Watercolor bloom mask per state, same local box: filled region, or a stroke of \`stroke\` width. */
export const SHAPE_MASKS: Record<MakingStateId, { d: string; stroke?: number }> = {
${masks.join(',\n')}
};
`;

writeFileSync(OUT, source);
process.stdout.write(`wrote ${OUT}\n${lengths.join(', ')}\n`);
