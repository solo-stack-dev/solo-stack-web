/**
 * Which commit subjects the 01:00 monitor may show. Shared by the build-time tool (`tools/commit-log.mjs`, run by Node with type
 * stripping) and the page (live feed + baked fallback), so both sources pass the same rules. Pure, no imports.
 *
 * Dropped: merges, critique / screenshot housekeeping, and anything with parentheses or score-like numbers (`7.8`, `9/10`).
 */
const HIDDEN = [/^merge\b/i, /critique/i, /screenshot/i, /[()[\]]/, /\b\d+[.,]\d+\b/, /\b\d+\s*\/\s*10\b/];

export function isPublicSubject(subject: string): boolean {
	const text = subject.trim();
	return text.length > 0 && !HIDDEN.some((pattern) => pattern.test(text));
}

/** Shortens to `max` characters at a word boundary (never mid-word), with an ellipsis. Short text is returned unchanged. */
export function clipWords(text: string, max: number): string {
	if (text.length <= max) return text;
	const room = text.slice(0, max); // keeps one char for the ellipsis after trimming the cut word
	const cut = room.lastIndexOf(' ');
	const head = (cut > max * 0.5 ? room.slice(0, cut) : room.slice(0, max - 1)).replace(/[\s,;:.\-–—]+$/u, '');
	return `${head}…`;
}
