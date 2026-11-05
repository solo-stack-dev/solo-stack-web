/**
 * Shared painted materials (masters and notes in docs/art/shared/README.md), optimized by
 * `node src/lib/home/shared/tools/optimize-materials.mjs` into ./assets/. Import URLs from here, never the files.
 */
import paperGrain from './assets/paper-grain.webp';
import shootingStar from './assets/shooting-star.webp';
import star1 from './assets/star-1.webp';
import star2 from './assets/star-2.webp';
import star3 from './assets/star-3.webp';
import star4 from './assets/star-4.webp';

/** 256 px two-tone alpha grain tile (cream/ink), for `PaperGrain` with normal blending. */
export const PAPER_GRAIN = { src: paperGrain, size: 256 } as const;

/** Bright star sprites (48 px, warm pigment, transparent margins). */
export const STAR_SPRITES = [star1, star2, star3, star4] as const;

/** Shooting star streak, 480×48 (10:1), head on the right. */
export const SHOOTING_STAR_SPRITE = shootingStar;
