/**
 * ARISE soldiers: ink cutouts (masters in docs/art/arise/), all on the same 2:3 canvas with smoke fading out at the
 * bottom, so they share one baseline and scale. `eyes`: point between the eyes (0…1 of the canvas) for the flare.
 */
import assassin from './assets/arise-assassin.webp';
import brute from './assets/arise-brute.webp';
import knight from './assets/arise-knight.webp';
import mascot from './assets/arise-mascot.webp';

export const CANVAS_ASPECT = 2 / 3;

type SoldierId = 'knight' | 'brute' | 'assassin' | 'mascot';

const SOLDIERS: Record<SoldierId, { src: string; eyes: { x: number; y: number } }> = {
	knight: { src: knight, eyes: { x: 0.425, y: 0.114 } },
	brute: { src: brute, eyes: { x: 0.513, y: 0.198 } },
	assassin: { src: assassin, eyes: { x: 0.455, y: 0.134 } },
	mascot: { src: mascot, eyes: { x: 0.487, y: 0.634 } }
};

export interface Soldier {
	src: string;
	eyes: { x: number; y: number };
	/** Horizontal center in % of the viewport width. */
	x: number;
	/** Canvas height in viewport heights. */
	height: number;
	/** Back rows are dimmer and rise later. */
	depth: 0 | 1 | 2;
	mirror: boolean;
	/** Rise delay in ms. */
	delay: number;
	/** Smoke puffs at the base: x and size in % of figure width, timing in ms. */
	puffs: { x: number; size: number; delay: number; duration: number; drift: number }[];
}

type Slot = { id: SoldierId; x: number; height: number; depth: 0 | 1 | 2; mirror: boolean };

/** Wide: right side, where the hero has open sky. Narrow: across the bottom. */
const WIDE: Slot[] = [
	{ id: 'brute', x: 64, height: 0.8, depth: 1, mirror: false },
	{ id: 'knight', x: 78, height: 0.92, depth: 2, mirror: false },
	{ id: 'assassin', x: 91, height: 0.78, depth: 1, mirror: true },
	{ id: 'mascot', x: 49, height: 0.82, depth: 0, mirror: false }
];

const NARROW: Slot[] = [
	{ id: 'brute', x: 18, height: 0.56, depth: 1, mirror: false },
	{ id: 'knight', x: 52, height: 0.66, depth: 2, mirror: false },
	{ id: 'assassin', x: 84, height: 0.54, depth: 1, mirror: true },
	{ id: 'mascot', x: 36, height: 0.58, depth: 0, mirror: false }
];

/** Rise order; the mascot last (punchline). */
const ORDER: SoldierId[] = ['knight', 'brute', 'assassin', 'mascot'];

export function createSoldiers(narrow: boolean): Soldier[] {
	const rand = Math.random;
	return (narrow ? NARROW : WIDE).map(({ id, ...slot }) => ({
		...SOLDIERS[id],
		...slot,
		delay: ORDER.indexOf(id) * 260 + Math.round(rand() * 80),
		puffs: Array.from({ length: 7 }, () => ({
			x: Math.round(15 + rand() * 70),
			size: Math.round(22 + rand() * 30),
			delay: Math.round(rand() * 1400),
			duration: Math.round(1600 + rand() * 1200),
			drift: Math.round((rand() - 0.5) * 40)
		}))
	}));
}

/** Decodes the cutouts (no pop-in mid-rise). Resolves after `timeout` ms at the latest. */
export function preloadSoldiers(timeout = 1500) {
	const decodes = Object.values(SOLDIERS).map(({ src }) => {
		const image = new Image();
		image.src = src;
		return image.decode().catch(() => {});
	});
	return Promise.race([Promise.all(decodes), new Promise((resolve) => setTimeout(resolve, timeout))]);
}
