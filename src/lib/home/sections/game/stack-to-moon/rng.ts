/** Small deterministic helpers shared by the engine and the renderer. */

/** mulberry32: fast seeded PRNG, returns [0, 1). */
export function rng(seed: number): () => number {
	let a = seed >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = a;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/** Integer hash of two ints, e.g. a star tile coordinate. */
export function hash2(x: number, y: number): number {
	let h = Math.imul(x | 0, 0x27d4eb2d) ^ Math.imul(y | 0, 0x165667b1);
	h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);
	return (h ^ (h >>> 13)) >>> 0;
}

export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smoothstep = (t: number) => {
	const x = clamp(t, 0, 1);
	return x * x * (3 - 2 * x);
};
