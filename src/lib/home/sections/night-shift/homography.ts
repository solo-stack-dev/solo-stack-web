import type { Point, Quad } from './layout.ts';

const n = (value: number) => +value.toFixed(8);

/**
 * CSS `matrix3d()` that maps a `width`×`height` box (with `transform-origin: 0 0`) onto an arbitrary quad, so live
 * HTML sits on a painted screen in perspective. Projective square-to-quad mapping (Heckbert), scaled to the box.
 * `quad` is in the same px space as the box's offset parent: top left, top right, bottom right, bottom left.
 */
export function quadToMatrix3d(width: number, height: number, quad: Quad): string {
	const [p0, p1, p2, p3] = quad;
	const dx1 = p1.x - p2.x;
	const dx2 = p3.x - p2.x;
	const dx3 = p0.x - p1.x + p2.x - p3.x;
	const dy1 = p1.y - p2.y;
	const dy2 = p3.y - p2.y;
	const dy3 = p0.y - p1.y + p2.y - p3.y;

	let g = 0;
	let h = 0;
	if (dx3 !== 0 || dy3 !== 0) {
		const det = dx1 * dy2 - dx2 * dy1 || 1e-9;
		g = (dx3 * dy2 - dx2 * dy3) / det;
		h = (dx1 * dy3 - dx3 * dy1) / det;
	}
	const a = p1.x - p0.x + g * p1.x;
	const b = p3.x - p0.x + h * p3.x;
	const d = p1.y - p0.y + g * p1.y;
	const e = p3.y - p0.y + h * p3.y;

	// Row-major 3×3 for (X, Y, 1) in box px; matrix3d is column-major 4×4 with z passed through.
	const m = [a / width, b / height, p0.x, d / width, e / height, p0.y, g / width, h / height, 1];
	return `matrix3d(${n(m[0]!)},${n(m[3]!)},0,${n(m[6]!)},${n(m[1]!)},${n(m[4]!)},0,${n(m[7]!)},0,0,1,0,${n(m[2]!)},${n(m[5]!)},0,1)`;
}

/** Percent quad (0…100 of a canvas) → px quad for a stage of the given size. */
export function scaleQuad(quad: Quad, width: number, height: number): Quad {
	const s = (p: Point): Point => ({ x: (p.x / 100) * width, y: (p.y / 100) * height });
	return [s(quad[0]), s(quad[1]), s(quad[2]), s(quad[3])];
}
