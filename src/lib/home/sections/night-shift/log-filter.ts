/**
 * Which commit subjects the 01:00 monitor may show. Shared by the build-time tool (`tools/commit-log.mjs`, run by Node with type
 * stripping) and the page (live feed + baked fallback), so both sources pass the same rules. Pure, no imports.
 *
 * Dropped: merges; review-process housekeeping (critique rounds, screenshots, review and polish passes, QA tooling); agent-lane
 * and batch prefixes (`Home A/B`, `Shell`, `R2`…, `art:`, `Docs:`, `Comments:`, `Format`), model names; and anything with
 * parentheses or score-like numbers (`7.8`, `9/10`). What is left is real development activity on the site.
 */
const HIDDEN = [
	/^merge\b/i,
	// review rounds and their tooling
	/critique/i,
	/screenshot/i,
	/\bscreens?\b/i,
	/\bround[\s-]*(?:\d+|one|two|three|four|five|six)\b/i,
	/\breview\b/i,
	/\bpolish\b/i,
	/\bart[\s-]director\b/i,
	/^qa\b/i,
	// agent lanes and housekeeping batches
	/\bHome [A-D]\b/,
	/^shell\b/i,
	/\bR\d\b/,
	/\blanes?\b/i,
	/\b(?:opus|gpt|claude|codex|agents?)\b/i,
	/^art\s*:/i,
	/^docs?\s*:/i,
	/^comments?\s*:/i,
	/^format\b/i,
	// scores and asides
	/[()[\]]/,
	/\b\d+[.,]\d+\b/,
	/\b\d+\s*\/\s*10\b/
];

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
