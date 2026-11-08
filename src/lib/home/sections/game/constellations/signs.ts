import { m } from '#lib/paraglide/messages.js';

/**
 * The tech zodiac: hand-authored constellations for the owner's tools and interests.
 *
 * Local 0…100 box, y down. Edges are star index pairs to trace, order-agnostic. Shapes are original: Svelte follows its
 * logo outline (fan use); every other brand is an allusion (cloud, droplet, elephant, letters), not a logo.
 *
 * Names: proper names are literal, everything else is a Paraglide message.
 */
export interface SignDef {
	id: SignId;
	/** Visible name (proper name literal or message). */
	name: () => string;
	/** One line on the paper note card (Paraglide message). */
	note: () => string;
	/** Link on the note card: the tool's site, or a homepage section for the personal signs. */
	href: string;
	points: readonly (readonly [number, number])[];
	edges: readonly (readonly [number, number])[];
	/** Optional closed outline (point indices) the watercolor fill is clipped to. */
	fill?: readonly number[];
	/** Explore mode: center in world units, scale (world units per 100 local units), rotation in degrees. */
	explore: { x: number; y: number; size: number; rotate: number };
}

export type SignId = 'svelte' | 'cloudflare' | 'drizzle' | 'postgres' | 't3code' | 'ai' | 'coffee' | 'gym' | 'moon';

/** Closed loop over `count` points starting at `from`. */
const loop = (count: number, from = 0): [number, number][] => Array.from({ length: count }, (_, index) => [from + index, from + ((index + 1) % count)]);
/** Indices `from`…`from + count - 1`. */
const range = (count: number, from = 0): number[] => Array.from({ length: count }, (_, index) => from + index);
/** Open chain over `count` points starting at `from`. */
const chain = (count: number, from = 0): [number, number][] => Array.from({ length: count - 1 }, (_, index) => [from + index, from + index + 1]);

/** Explore world size in units (the camera pans across it). */
export const EXPLORE_WORLD = { width: 330, height: 210 } as const;

export const SIGNS: readonly SignDef[] = [
	{
		id: 'svelte',
		name: () => 'Svelte',
		note: m.home_game_stars_note_svelte,
		href: 'https://svelte.dev',
		// Tilted double-band "S" of the Svelte mark: upper band curls left/down, a diagonal crosses, lower band curls back.
		points: [
			[76, 10],
			[52, 2],
			[28, 12],
			[16, 32],
			[26, 50],
			[50, 54],
			[74, 58],
			[86, 76],
			[76, 94],
			[50, 100],
			[26, 90],
			[64, 24],
			[36, 76]
		],
		edges: [...chain(11), [0, 11], [10, 12]],
		explore: { x: 165, y: 102, size: 52, rotate: -8 }
	},
	{
		id: 'cloudflare',
		name: () => 'Cloudflare',
		note: m.home_game_stars_note_cloudflare,
		href: 'https://www.cloudflare.com',
		// Puffy cloud with a flat base.
		points: [
			[8, 74],
			[4, 60],
			[14, 46],
			[30, 46],
			[36, 28],
			[54, 20],
			[70, 30],
			[74, 44],
			[88, 46],
			[98, 60],
			[92, 74],
			[50, 76]
		],
		edges: loop(12),
		fill: range(12),
		explore: { x: 62, y: 52, size: 46, rotate: 4 }
	},
	{
		id: 'drizzle',
		name: () => 'Drizzle',
		note: m.home_game_stars_note_drizzle,
		href: 'https://orm.drizzle.team',
		// Droplet with a small inner shine.
		points: [
			[50, 2],
			[38, 22],
			[26, 42],
			[22, 62],
			[30, 82],
			[50, 94],
			[70, 82],
			[78, 62],
			[74, 42],
			[62, 22],
			[34, 58],
			[38, 74]
		],
		edges: [...loop(10), [10, 11]],
		fill: range(10),
		explore: { x: 270, y: 50, size: 40, rotate: 10 }
	},
	{
		id: 'postgres',
		name: () => 'Postgres',
		note: m.home_game_stars_note_postgres,
		href: 'https://www.postgresql.org',
		// Elephant head in profile facing left: crown, trunk curling down, jaw, big ear.
		points: [
			[72, 12],
			[46, 8],
			[26, 20],
			[20, 40],
			[14, 62],
			[16, 82],
			[28, 86],
			[32, 60],
			[50, 64],
			[70, 66],
			[92, 56],
			[88, 26],
			[62, 24]
		],
		edges: loop(13),
		fill: range(13),
		explore: { x: 56, y: 160, size: 48, rotate: -4 }
	},
	{
		id: 't3code',
		name: () => 'T3 Code',
		note: m.home_game_stars_note_t3code,
		href: 'https://t3.codes',
		// The letters T and 3.
		points: [
			[6, 20],
			[26, 20],
			[46, 20],
			[26, 52],
			[26, 84],
			[58, 20],
			[88, 20],
			[70, 48],
			[90, 66],
			[80, 86],
			[56, 84]
		],
		edges: [[0, 1], [1, 2], [1, 3], [3, 4], ...chain(6, 5)],
		explore: { x: 270, y: 160, size: 42, rotate: -6 }
	},
	{
		id: 'ai',
		name: m.home_game_stars_sign_ai,
		note: m.home_game_stars_note_ai,
		href: '#making',
		// Four-point sparkle with a small companion sparkle.
		points: [
			[42, 6],
			[50, 40],
			[84, 50],
			[50, 58],
			[42, 94],
			[34, 58],
			[2, 50],
			[34, 40],
			[82, 4],
			[82, 26],
			[71, 15],
			[93, 15]
		],
		edges: [...loop(8), [8, 9], [10, 11]],
		fill: range(8),
		explore: { x: 165, y: 30, size: 38, rotate: 0 }
	},
	{
		id: 'coffee',
		name: m.home_game_stars_sign_coffee,
		note: m.home_game_stars_note_coffee,
		href: '#night-shift',
		// Cup with handle and a curl of steam.
		points: [
			[14, 32],
			[70, 32],
			[69, 42],
			[88, 44],
			[88, 62],
			[67, 64],
			[64, 78],
			[54, 88],
			[30, 88],
			[20, 78],
			[40, 4],
			[33, 14],
			[42, 24]
		],
		edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [2, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 0], ...chain(3, 10)],
		fill: [0, 1, 2, 5, 6, 7, 8, 9],
		explore: { x: 110, y: 176, size: 40, rotate: 6 }
	},
	{
		id: 'gym',
		name: m.home_game_stars_sign_gym,
		note: m.home_game_stars_note_gym,
		href: '#radio',
		// Dumbbell: two plates and a bar.
		points: [
			[8, 28],
			[24, 28],
			[24, 50],
			[24, 72],
			[8, 72],
			[76, 28],
			[92, 28],
			[92, 72],
			[76, 72],
			[76, 50],
			[50, 50]
		],
		edges: [...loop(5), [5, 6], [6, 7], [7, 8], [8, 9], [9, 5], [2, 10], [10, 9]],
		explore: { x: 220, y: 182, size: 42, rotate: -18 }
	},
	{
		id: 'moon',
		name: m.home_game_stars_sign_moon,
		note: m.home_game_stars_note_moon,
		href: '#hero',
		// Crescent: outer arc and inner arc meeting at the horns.
		points: [
			[60, 4],
			[34, 10],
			[16, 30],
			[12, 54],
			[22, 76],
			[44, 92],
			[70, 94],
			[50, 80],
			[38, 60],
			[38, 38],
			[46, 20]
		],
		edges: loop(11),
		fill: range(11),
		explore: { x: 300, y: 104, size: 36, rotate: 14 }
	}
];

/** Centroid of a sign in local coordinates (used for fills and card anchors). */
export function signCenter(sign: SignDef): [number, number] {
	let x = 0;
	let y = 0;
	for (const [px, py] of sign.points) {
		x += px;
		y += py;
	}
	return [x / sign.points.length, y / sign.points.length];
}

/** Mini SVG path of a sign (for the zodiac wheel and the round hint), in its 0…100 box. */
export function signPath(sign: SignDef): string {
	return sign.edges.map(([a, b]) => `M${sign.points[a]![0]} ${sign.points[a]![1]}L${sign.points[b]![0]} ${sign.points[b]![1]}`).join('');
}
