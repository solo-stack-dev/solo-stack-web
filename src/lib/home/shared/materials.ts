/**
 * Shared painted materials (masters and notes in docs/art/shared/README.md), optimized by
 * `node src/lib/home/shared/tools/optimize-materials.mjs` into ./assets/. Import URLs from here, never the files.
 */
import edge1Up from './assets/edge-1-up.webp';
import edge1 from './assets/edge-1.webp';
import edge2Up from './assets/edge-2-up.webp';
import edge2 from './assets/edge-2.webp';
import edge3Up from './assets/edge-3-up.webp';
import edge3 from './assets/edge-3.webp';
import paperGrain from './assets/paper-grain.png';
import shootingStar from './assets/shooting-star.webp';
import star1 from './assets/star-1.webp';
import star2 from './assets/star-2.webp';
import star3 from './assets/star-3.webp';
import star4 from './assets/star-4.webp';

/** 256 px two-tone alpha grain tile (cream/ink), for `PaperGrain` with normal blending. */
export const PAPER_GRAIN = { src: paperGrain, size: 256 } as const;

/**
 * Painted watercolor edge masks (alpha, 1280×200, stretch to the strip): 1 broad wet blooms, 2 restrained dry brush,
 * 3 deep diagonal bleed. `down`: opaque above, transparent below (a surface ending downwards, e.g. a section bottom).
 * `up`: the vertical flip (a surface starting upwards, e.g. a section top).
 */
export const EDGE_MASKS = {
	1: { down: edge1, up: edge1Up },
	2: { down: edge2, up: edge2Up },
	3: { down: edge3, up: edge3Up }
} as const;

export type EdgeMask = keyof typeof EDGE_MASKS;

/** Bright star sprites (48 px, warm pigment, transparent margins). */
export const STAR_SPRITES = [star1, star2, star3, star4] as const;

/** Shooting star streak, 480×48 (10:1), head on the right. */
export const SHOOTING_STAR_SPRITE = shootingStar;
