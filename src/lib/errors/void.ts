/**
 * Geometry for the 404 ink void (`InkVoid.svelte`). Everything here is built once, in unit space, as `Path2D`
 * objects; per frame the canvas only sets a transform and fills, which keeps the tunnel cheap.
 *
 * The collapse intro itself is CSS (`NotFound.svelte`), so it plays from the first paint, before hydration.
 *
 * Depth model: every ring and shard has a depth `z` in (Z_NEAR, 1]. Its on-screen radius is `base / z`, so equal
 * steps in `ln z` look like equal steps into the tunnel. Things drift towards the viewer (`z` shrinks) and wrap
 * back to the far end, hidden behind the glow at the vanishing point.
 */

export const Z_NEAR = 0.035;
export const LOG_RANGE = Math.log(1 / Z_NEAR);

export function mulberry32(seed: number) {
	let a = seed >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = a;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

type Random = () => number;

/** A wobbly radius function: a few low harmonics (brush wobble) plus per-vertex jitter (torn fibres). */
function raggedEdge(random: Random, wobble: number, fibres: number) {
	const harmonics = Array.from({ length: 4 }, (_, index) => ({
		frequency: 2 + index * 3 + Math.floor(random() * 3),
		amplitude: (wobble / (index + 1)) * (0.5 + random()),
		phase: random() * Math.PI * 2
	}));
	return (theta: number) => {
		let value = 1;
		for (const { frequency, amplitude, phase } of harmonics) value += amplitude * Math.sin(frequency * theta + phase);
		return value + (random() - 0.5) * fibres;
	};
}

export interface Ring {
	/** Torn paper band (unit outer radius ≈ 1). */
	body: Path2D;
	/** Approximate inner radius of the band (unit), for the curl shading gradient. */
	inner: number;
	/** -1 (more ochre) … 1 (more cream): pigment variation per ring. */
	tint: number;
	/** Slightly larger, cream fibre edge drawn under the body. */
	fibre: Path2D;
	z: number;
	rotation: number;
	spin: number;
}

/** One ring of torn paper arcs: 2–4 segments with gaps, ragged on both edges and at the ends. */
function createRing(random: Random, z: number): Ring {
	const body = new Path2D();
	const fibre = new Path2D();
	const thickness = 0.07 + random() * 0.08;
	const outer = raggedEdge(random, 0.025, 0.018);
	const inner = raggedEdge(random, 0.03, 0.022);
	const count = 2 + Math.floor(random() * 3);
	const slot = (Math.PI * 2) / count;
	for (let index = 0; index < count; index++) {
		const length = slot * (0.55 + random() * 0.35);
		const start = index * slot + random() * (slot - length);
		const steps = Math.max(8, Math.round(length * 26));
		const outerPoints: [number, number][] = [];
		const innerPoints: [number, number][] = [];
		for (let step = 0; step <= steps; step++) {
			const theta = start + (length * step) / steps;
			// taper the band at the torn ends
			const end = Math.min(step, steps - step) / steps;
			const taper = Math.min(1, end * 9);
			const r1 = outer(theta);
			const r0 = r1 - thickness * (0.35 + 0.65 * taper) * (inner(theta) / 1);
			outerPoints.push([Math.cos(theta) * r1, Math.sin(theta) * r1]);
			innerPoints.push([Math.cos(theta) * r0, Math.sin(theta) * r0]);
		}
		addBand(body, outerPoints, innerPoints, 1);
		addBand(fibre, outerPoints, innerPoints, 1.014);
	}
	return { body, fibre, inner: 1 - thickness * 1.1, tint: random() * 2 - 1, z, rotation: random() * Math.PI * 2, spin: (random() - 0.5) * 0.05 };
}

function addBand(path: Path2D, outer: [number, number][], inner: [number, number][], scale: number) {
	path.moveTo(outer[0][0] * scale, outer[0][1] * scale);
	for (const [x, y] of outer) path.lineTo(x * scale, y * scale);
	for (let index = inner.length - 1; index >= 0; index--) path.lineTo(inner[index][0] / scale, inner[index][1] / scale);
	path.closePath();
}

export function createRings(count: number, seed: number): Ring[] {
	const random = mulberry32(seed);
	// evenly spaced in ln z so the tunnel looks uniform
	return Array.from({ length: count }, (_, index) => createRing(random, Math.exp(-((index + random() * 0.4) / count) * LOG_RANGE)));
}

export interface Shard {
	shape: Path2D;
	lines: Path2D | null;
	z: number;
	theta: number;
	distance: number;
	size: number;
	rotation: number;
	spin: number;
	cream: boolean;
}

/** Torn scraps of paper (some with ink "text" lines, like pages ripped out of the site) flying past. */
export function createShards(count: number, seed: number): Shard[] {
	const random = mulberry32(seed);
	return Array.from({ length: count }, () => {
		const shape = new Path2D();
		const corners = 6 + Math.floor(random() * 3);
		const aspect = 0.45 + random() * 0.4;
		for (let index = 0; index < corners; index++) {
			const theta = (index / corners) * Math.PI * 2 + (random() - 0.5) * 0.5;
			const radius = 0.7 + random() * 0.35;
			const x = Math.cos(theta) * radius;
			const y = Math.sin(theta) * radius * aspect;
			if (index === 0) shape.moveTo(x, y);
			else shape.lineTo(x, y);
		}
		shape.closePath();
		let lines: Path2D | null = null;
		if (random() > 0.45) {
			lines = new Path2D();
			const rows = 1 + Math.floor(random() * 3);
			for (let row = 0; row < rows; row++) {
				const y = (row - (rows - 1) / 2) * 0.22 * aspect;
				lines.moveTo(-0.45, y);
				lines.lineTo(-0.45 + 0.4 + random() * 0.45, y);
			}
		}
		return {
			shape,
			lines,
			z: Math.exp(-random() * LOG_RANGE),
			theta: random() * Math.PI * 2,
			distance: 0.9 + random() * 1.4,
			size: 0.35 + random() * 0.5,
			rotation: random() * Math.PI * 2,
			spin: (random() - 0.5) * 0.8,
			cream: random() > 0.6
		};
	});
}

/** SVG path data of a blotchy ink circle (radius ≈ `radius`, centered at 0,0): the rim of the expanding void. */
export function blotPath(seed: number, radius: number): string {
	const random = mulberry32(seed);
	const edge = raggedEdge(random, 0.04, 0.035);
	const steps = 120;
	let d = '';
	for (let step = 0; step < steps; step++) {
		const theta = (step / steps) * Math.PI * 2;
		const r = edge(theta) * radius;
		d += `${step === 0 ? 'M' : 'L'}${(Math.cos(theta) * r).toFixed(1)} ${(Math.sin(theta) * r).toFixed(1)}`;
	}
	return d + 'Z';
}

/** Wrap a depth that came closer than Z_NEAR back to the far end of the tunnel. */
export function advance(z: number, amount: number): number {
	const next = z * Math.exp(-amount);
	return next < Z_NEAR ? next / Z_NEAR : next;
}

/** 0 at the near end of the tunnel, 1 at the far end. */
export function depth(z: number): number {
	return Math.min(1, Math.max(0, 1 + Math.log(z) / LOG_RANGE));
}

type Rgb = readonly [number, number, number];

const PALETTE = {
	near: [58, 45, 24],
	mid: [212, 154, 52],
	far: [252, 215, 114],
	ochre: [226, 169, 59],
	cream: [251, 243, 221]
} as const satisfies Record<string, Rgb>;

const lerp = (a: Rgb, b: Rgb, t: number): Rgb => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

/** Paper pigment by depth: dim umber near the viewer, butter towards the light at the vanishing point. */
export function paperRgb(d: number, tint = 0): Rgb {
	const base = d < 0.6 ? lerp(PALETTE.near, PALETTE.mid, (d / 0.6) ** 1.5) : lerp(PALETTE.mid, PALETTE.far, (d - 0.6) / 0.4);
	return tint < 0 ? lerp(base, lerp(PALETTE.ochre, PALETTE.near, 1 - d), -tint * 0.35) : lerp(base, PALETTE.cream, tint * 0.22 * d);
}

export function rgba([r, g, b]: Rgb, alpha = 1, scale = 1): string {
	return `rgb(${Math.round(r * scale)} ${Math.round(g * scale)} ${Math.round(b * scale)} / ${alpha})`;
}

export function paperColor(d: number, alpha = 1): string {
	return rgba(paperRgb(d), alpha);
}
