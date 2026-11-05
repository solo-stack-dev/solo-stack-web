/**
 * Visual pauses in a post body (docs/critique/ROUND-2.md, ROUND-3.md).
 *
 * - **Section break:** a pause between two sections, tied to the section it opens. In Markdown either a named break,
 *   `<hr data-art="radio" />` (blank lines around it; names: the keys of `BREAK_ART`), or a plain thematic break
 *   (`* * *`), which draws `DEFAULT_ORDER[(n - 1) % 3]` by its position among the body's breaks. 2–3 per post, and two
 *   breaks of one post differ in kind or at least in scale and place.
 * - **Pull quote:** `<aside class="pull-quote" aria-hidden="true">…</aside>` (blank lines around it). Its text must be a
 *   sentence that already stands in the post (it repeats it, hence hidden from assistive tech); never new text. Set it at
 *   least a section away from the sentence it quotes: the two must never share a 1440×900 or a 390×844 viewport, so it
 *   never reads as a duplicate of its neighbour.
 *
 * Two kinds of art:
 * - `scene`: a painted homepage plate, cropped wide and shallow, across the whole reading measure on a torn paper edge.
 *   Opens a section that walks through the homepage's night (`horizon`: the cinema valley, docs/art/cinema).
 * - `object`: a cut-out painting (cropped to its visible artwork plus 8px) at its own height and place in the column; on
 *   paper it stands on the page, at night a warm glow sits at its own light source. `radio` (docs/art/radio, the painted
 *   master with its six preset keys) opens the music section; `laptop`, `owl`, `fireflies` (docs/art/site/round-2) are
 *   the generic pauses.
 *
 * Breaks are drawn by CSS (an `<hr>` has no children) from one prerendered style sheet (`breakStyles()`): each break's
 * image is a 1x/2x `image-set` of an enhanced-img width ladder, set only once the break comes near the viewport
 * (`data-near`, set by the post page; without scripts right away).
 */
import fireflies from './assets/break-fireflies.webp?w=180;360&format=webp&quality=78&enhanced';
import horizon from './assets/break-horizon.webp?w=640;1280&format=webp&quality=74&enhanced';
import laptop from './assets/break-laptop.webp?w=290;569&format=webp&quality=78&enhanced';
import owl from './assets/break-owl.webp?w=200;400&format=webp&quality=78&enhanced';
import radio from './assets/break-radio.webp?w=240;480&format=webp&quality=78&enhanced';
import { DECKLE_MASK_WIDE } from './materials.ts';

type Enhanced = { sources: Record<string, string>; img: { src: string; w: number; h: number } };

type BreakArt =
	| {
			kind: 'scene';
			image: Enhanced;
			/** Center of the warm spill the plate throws on the night page, in % of the plate. */
			glow: string;
	  }
	| {
			kind: 'object';
			image: Enhanced;
			/** Rendered height of the painting from 40rem (phones: 85 %). */
			height: string;
			/** Horizontal placement of the painting's center in the column, 50% = centered; `right`: flush with its right edge. */
			x: string;
			/** Center of the night light on the painting (its own light source), in % of the painting box. */
			glow: string;
			/** An ink silhouette: at night it gets a thin moonlit rim, so the black reads on the dark page. */
			ink?: boolean;
	  };

export const BREAK_ART = {
	/** The night journey (20:00 to 06:00): the valley under the glowing horizon, a wide and shallow plate. */
	horizon: { kind: 'scene', image: horizon, glow: '62% 46%' },
	/** The night radio at 02:00, set small and to the right, as if it stood at the edge of the desk. */
	radio: { kind: 'object', image: radio, height: '6.75rem', x: 'right', glow: '64% 38%' },
	laptop: { kind: 'object', image: laptop, height: '7rem', x: '50%', glow: '28% 40%', ink: true },
	owl: { kind: 'object', image: owl, height: '8rem', x: '54%', glow: '45% 34%', ink: true },
	fireflies: { kind: 'object', image: fireflies, height: '8.5rem', x: '46%', glow: '66% 30%', ink: true }
} satisfies Record<string, BreakArt>;

export type BreakName = keyof typeof BREAK_ART;

/** Plain `* * *` breaks: the work, the night, the lift; two neighbouring ones never repeat. */
const DEFAULT_ORDER: BreakName[] = ['laptop', 'owl', 'fireflies'];

/** `a.webp 180w, b.webp 360w` → `image-set(url("a.webp") 1x, url("b.webp") 2x)` (the ladder is 1x/2x of the rendered size). */
function imageSet({ sources, img }: Enhanced) {
	const candidates = (sources.webp ?? `${img.src} ${img.w}w`).split(', ').map((candidate) => candidate.trim().split(' ')[0]);
	return `image-set(${candidates.map((url, index) => `url("${url}") ${index + 1}x`).join(', ')})`;
}

/** Mask layers that keep everything (a plain `none` layer would not combine). */
const OPAQUE = 'linear-gradient(#000, #000)';

/**
 * The custom properties the post page's break rules read: `--art`, `--ratio` (of the painting), `--h` / `--h-sm` (box
 * height from / below 40rem), `--box-ratio`, `--x` / `--right` / `--shift` (placement), `--glow`, `--edge` (the paper
 * edge mask), `--night-fade` (at night a plate's sky dissolves into the page), `--night-feather` (at night its sides fade
 * out over 3rem, so only the torn edge below remains), `--rim` (night filter).
 */
function properties(art: BreakArt) {
	const ratio = art.image.img.w / art.image.img.h;
	const shared = { '--art': imageSet(art.image), '--ratio': String(ratio), '--glow': art.glow };
	const placed =
		art.kind === 'scene'
			? {
					'--h': 'auto',
					'--h-sm': 'auto',
					'--box-ratio': String(ratio),
					'--x': '50%',
					'--edge': DECKLE_MASK_WIDE,
					'--night-fade': 'linear-gradient(transparent, #000 42%)',
					'--night-feather': 'linear-gradient(90deg, transparent, #000 3rem, #000 calc(100% - 3rem), transparent)',
					'--rim': 'none'
				}
			: {
					'--h': art.height,
					'--h-sm': `calc(${art.height} * 0.85)`,
					'--box-ratio': 'auto',
					...(art.x === 'right' ? { '--x': 'auto', '--right': '0', '--shift': '0' } : { '--x': art.x }),
					'--edge': OPAQUE,
					'--night-fade': OPAQUE,
					'--night-feather': OPAQUE,
					'--rim': art.ink ? 'drop-shadow(0 0 1px rgb(251 243 221 / 0.3)) drop-shadow(0 0 9px rgb(252 215 114 / 0.2))' : 'none'
				};
	return Object.entries({ ...shared, ...placed })
		.map(([name, value]) => `${name}:${value}`)
		.join(';');
}

/** One style sheet with the art of every break name and of the plain-break order (prerendered into the post's head). */
export function breakStyles() {
	const named = Object.entries(BREAK_ART).map(([name, art]) => `.prose-post>hr[data-art="${name}"]{${properties(art)}}`);
	const plain = DEFAULT_ORDER.map((name, index) => `.prose-post>hr:not([data-art]):nth-of-type(3n+${(index + 1) % 3}){${properties(BREAK_ART[name])}}`);
	return [...named, ...plain].join('\n');
}
