/**
 * Procedural ink crescent: one tapering brush stroke along a quadratic arc with ragged edges, dry-brush strands, butter
 * rim, and droplets. Geometry only (SVG paths, 1600×900 viewBox): nothing is filtered or rasterized per frame.
 */

export const VIEW_W = 1600;
export const VIEW_H = 900;

type Point = [number, number];

export interface Droplet {
	x: number;
	y: number;
	r: number;
	/** 0…1 along the stroke; times the droplet with the sweep. */
	t: number;
}

export interface Slash {
	/** Centerline, revealed with a dash animation (mask). */
	spine: string;
	/** Main body. */
	body: string;
	/** Thin dark strands around the body (dry brush). */
	strands: string[];
	/** Light strands on the outer rim. */
	rims: string[];
	drops: Droplet[];
}

/** Small seeded PRNG (mulberry32). */
function random(seed: number) {
	let a = seed >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = a;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

const r1 = (value: number) => Math.round(value * 10) / 10;

/** Belly of the crescent: hairline at the start, fullest around 60 %, sharp tip at the end. */
const width = (t: number) => 92 * Math.sin(Math.PI * t ** 0.8) ** 1.35;

export function createSlash(seed = Math.floor(Math.random() * 1e9)): Slash {
	const rand = random(seed);
	const between = (min: number, max: number) => min + rand() * (max - min);

	// Arc from the upper left over the sky down towards the right
	const p0: Point = [between(40, 120), between(300, 380)];
	const p1: Point = [between(600, 720), between(-80, 0)];
	const p2: Point = [between(1260, 1360), between(470, 560)];

	const at = (t: number): Point => {
		const u = 1 - t;
		return [u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0], u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1]];
	};
	const normal = (t: number): Point => {
		const dx = 2 * (1 - t) * (p1[0] - p0[0]) + 2 * t * (p2[0] - p1[0]);
		const dy = 2 * (1 - t) * (p1[1] - p0[1]) + 2 * t * (p2[1] - p1[1]);
		const length = Math.hypot(dx, dy) || 1;
		// Points to the outer (convex, upper) side of the arc
		return [dy / length, -dx / length];
	};

	const phases = [between(0, 6.3), between(0, 6.3), between(0, 6.3)];
	const ragged = (t: number, scale = 1) => 1 + scale * (0.1 * Math.sin(23 * t + phases[0]) + 0.06 * Math.sin(61 * t + phases[1]) + 0.035 * Math.sin(149 * t + phases[2]));

	/** Filled band between two offset curves along the arc. */
	function band(from: number, to: number, outer: (t: number) => number, inner: (t: number) => number, steps: number) {
		const top: string[] = [];
		const bottom: string[] = [];
		for (let index = 0; index <= steps; index++) {
			const t = from + ((to - from) * index) / steps;
			const [x, y] = at(t);
			const [nx, ny] = normal(t);
			const o = outer(t);
			const i = inner(t);
			top.push(`${r1(x + nx * o)} ${r1(y + ny * o)}`);
			bottom.push(`${r1(x + nx * i)} ${r1(y + ny * i)}`);
		}
		return `M ${top.join(' L ')} L ${bottom.toReversed().join(' L ')} Z`;
	}

	const steps = 140;
	const body = band(
		0,
		1,
		(t) => width(t) * ragged(t, 0.5),
		(t) => -width(t) * 0.3 * ragged(t + 0.37, 1.6),
		steps
	);

	const strands: string[] = [];
	for (let index = 0; index < 7; index++) {
		const from = between(0, 0.45);
		const to = Math.min(1, from + between(0.25, 0.55));
		const offset = between(-0.9, 1.35);
		const thickness = between(1.2, 3.6);
		strands.push(
			band(
				from,
				to,
				(t) => width(t) * offset + thickness * Math.sin(Math.PI * ((t - from) / (to - from))),
				(t) => width(t) * offset - thickness * 0.4,
				48
			)
		);
	}

	const rims: string[] = [];
	for (let index = 0; index < 3; index++) {
		const from = between(0.15, 0.4);
		const to = Math.min(0.96, from + between(0.3, 0.5));
		const offset = between(0.98, 1.08);
		const swell = between(3, 6);
		rims.push(
			band(
				from,
				to,
				(t) => width(t) * offset + swell * Math.sin(Math.PI * ((t - from) / (to - from))),
				(t) => width(t) * offset,
				40
			)
		);
	}

	const drops: Droplet[] = [];
	for (let index = 0; index < 46; index++) {
		// Flicked mostly off the start and the tip, a few from the belly
		const t = index < 18 ? between(0, 0.3) : index < 34 ? between(0.75, 1.04) : between(0.3, 0.75);
		const [x, y] = at(Math.min(t, 1.04));
		const [nx, ny] = normal(Math.min(t, 1));
		const side = rand() < 0.62 ? 1 : -1;
		const distance = width(Math.min(t, 1)) * (side > 0 ? 1 : 0.4) + between(6, 130) * (index < 18 ? 1.3 : 1);
		drops.push({ x: r1(x + nx * distance * side), y: r1(y + ny * distance * side), r: r1(between(1.4, index % 9 === 0 ? 11 : 6)), t: Math.min(1, Math.max(0, t)) });
	}

	const spine = `M ${r1(p0[0])} ${r1(p0[1])} Q ${r1(p1[0])} ${r1(p1[1])} ${r1(p2[0])} ${r1(p2[1])}`;
	return { spine, body, strands, rims, drops };
}
