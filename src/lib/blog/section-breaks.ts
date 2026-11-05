/**
 * Visual pauses in a post body (docs/critique/ROUND-2.md).
 *
 * - **Section break:** a Markdown thematic break (`* * *` on its own line) between two sections. The post page draws the
 *   n-th break of a body with `BREAK_ART[n]` (cycling) when that slot holds a painted asset, otherwise with the interim
 *   sumi horizon mark (`assets/ink-horizon.svg`). 2–3 per post; never two in a row.
 * - **Pull quote:** `<aside class="pull-quote" aria-hidden="true">…</aside>` (blank lines around it). Its text must be a
 *   sentence that already stands in the post (it repeats it, hence hidden from assistive tech); never new text.
 *
 * Painted breaks: drop the silhouette strip (alpha, ~5:1, theme agnostic like every silhouette) into `./assets/`, import it
 * here as `?w=1400&format=webp&quality=72&enhanced` and put its `.img.src` into a slot. No markup change in the posts.
 */
export const BREAK_ART: (string | null)[] = [null, null, null];

/** CSS custom properties and the `data-break-art` value for the body wrapper: which slots are painted, and their images. */
export function breakArt() {
	const painted = BREAK_ART.flatMap((src, index) => (src ? [index + 1] : []));
	const style = BREAK_ART.map((src, index) => (src ? `--break-art-${index + 1}: url("${src}")` : ''))
		.filter(Boolean)
		.join('; ');
	return { style, slots: painted.join(' ') || undefined };
}
