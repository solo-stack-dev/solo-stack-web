/**
 * Torn paper edge for the game frame, the house technique of the blog's feature art (`#lib/blog/materials.ts` DECKLE_MASK): a rect
 * whose border is displaced by fractal noise, used as a CSS mask (`mask: var(--deckle) center / 100% 100% no-repeat`) so the
 * poster and the game read as a torn-out watercolor sheet, not a ruled card. Own seeds and one viewBox per stage shape (16:9 and
 * the 4:5 phone stage) so the torn edge keeps the same width on both.
 */
const deckle = (width: number, height: number, inset: number, scale: number, seed: number) =>
	`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${width} ${height}' preserveAspectRatio='none'%3E%3Cfilter id='d' x='-2%25' y='-2%25' width='104%25' height='104%25'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.045' numOctaves='3' seed='${seed}'/%3E%3CfeDisplacementMap in='SourceGraphic' scale='${scale}' xChannelSelector='R' yChannelSelector='G'/%3E%3C/filter%3E%3Crect x='${inset}' y='${inset}' width='${width - inset * 2}' height='${height - inset * 2}' rx='3' filter='url(%23d)'/%3E%3C/svg%3E")`;

/** 16:9 stage (wide screens). */
export const DECKLE_WIDE = deckle(1600, 900, 11, 18, 23);
/** 4:5 stage (phones). */
export const DECKLE_TALL = deckle(800, 1000, 9, 16, 31);
/** The torn backing sheet under the stage (other seeds, so its edge never runs parallel to the poster's). */
export const DECKLE_WIDE_BACK = deckle(1600, 900, 6, 36, 41);
export const DECKLE_TALL_BACK = deckle(800, 1000, 5, 30, 47);
/** The game chooser's poster strips (about 3:1; one seed per strip so no two tears match), and their backing sheets. */
export const DECKLE_STRIPS = [deckle(720, 240, 7, 14, 53), deckle(720, 240, 7, 14, 59), deckle(720, 240, 7, 14, 61)] as const;
export const DECKLE_STRIPS_BACK = [deckle(720, 240, 4, 24, 67), deckle(720, 240, 4, 24, 71), deckle(720, 240, 4, 24, 73)] as const;
