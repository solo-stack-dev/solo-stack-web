/**
 * Visual pauses in a post body (docs/critique/ROUND-2.md).
 *
 * - **Section break:** a Markdown thematic break (`* * *` on its own line) between two sections. The n-th break of a body
 *   draws `BREAK_ART[(n - 1) % 3]`: three different painted silhouettes in a fixed order, so two neighbouring breaks never
 *   repeat. A slot set to `null` falls back to the sumi horizon mark (`assets/ink-horizon.svg`). 2–3 per post.
 * - **Pull quote:** `<aside class="pull-quote" aria-hidden="true">…</aside>` (blank lines around it). Its text must be a
 *   sentence that already stands in the post (it repeats it, hence hidden from assistive tech); never new text.
 *
 * Painted breaks (docs/art/site/round-2/break-*.png) are cropped to their visible artwork plus 8px, so `height` is the
 * height of the painting itself. They are drawn by CSS (an `<hr>` from Markdown has no children), as a 1x/2x `image-set`
 * of an enhanced-img width ladder, and only once the break comes near the viewport (`data-near`, set by the post page).
 */
import fireflies from './assets/break-fireflies.webp?w=180;360&format=webp&quality=78&enhanced';
import laptop from './assets/break-laptop.webp?w=290;569&format=webp&quality=78&enhanced';
import owl from './assets/break-owl.webp?w=200;400&format=webp&quality=78&enhanced';

type Enhanced = { sources: Record<string, string>; img: { src: string; w: number; h: number } };

type BreakArt = {
	image: Enhanced;
	/** Rendered height of the painting at desktop size (mobile scales it to 85%). */
	height: string;
	/** Horizontal placement of the painting's center in the column, 50% = centered. */
	x: string;
	/** Center of the night backlight on the painting (its light source), in % of the painting box. */
	glow: string;
};

/** The order of the breaks: the work (laptop), the night (owl), the lift (fireflies). */
export const BREAK_ART: (BreakArt | null)[] = [
	{ image: laptop, height: '7rem', x: '50%', glow: '28% 40%' },
	{ image: owl, height: '8rem', x: '54%', glow: '45% 34%' },
	{ image: fireflies, height: '8.5rem', x: '46%', glow: '66% 30%' }
];

/** `a.webp 180w, b.webp 360w` → `image-set(url("a.webp") 1x, url("b.webp") 2x)` (the ladder is 1x/2x of the rendered size). */
function imageSet({ sources, img }: Enhanced) {
	const candidates = (sources.webp ?? `${img.src} ${img.w}w`).split(', ').map((candidate) => candidate.trim().split(' ')[0]);
	return `image-set(${candidates.map((url, index) => `url("${url}") ${index + 1}x`).join(', ')})`;
}

/** CSS custom properties and the `data-break-art` value for the body wrapper: which slots are painted, and how. */
export function breakArt() {
	const painted = BREAK_ART.flatMap((art, index) => (art ? [index + 1] : []));
	const style = BREAK_ART.flatMap((art, index) => {
		if (!art) return [];
		const slot = index + 1;
		return [
			`--break-art-${slot}: ${imageSet(art.image)}`,
			`--break-ratio-${slot}: ${art.image.img.w / art.image.img.h}`,
			`--break-h-${slot}: ${art.height}`,
			`--break-x-${slot}: ${art.x}`,
			`--break-glow-${slot}: ${art.glow}`
		];
	}).join('; ');
	return { style, slots: painted.join(' ') || undefined };
}
