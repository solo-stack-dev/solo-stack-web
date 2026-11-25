/**
 * Section ids of a post body: mdsvex (`heading_ids` with `sectionSlug`, vite.config.ts) sets them on `##` headings,
 * `outlineOf` builds the TOC from raw Markdown; both use `headingId` and number repeats alike, so links match.
 * Keep dependency free: vite.config.ts imports this file.
 */

/** A heading's plain text → a readable URL fragment (`Erst die Stimmung, dann der Code` → `erst-die-stimmung-dann-der-code`). */
export function headingId(text: string) {
	return text
		.toLowerCase()
		.replace(/ä/g, 'ae')
		.replace(/ö/g, 'oe')
		.replace(/ü/g, 'ue')
		.replace(/ß/g, 'ss')
		.normalize('NFKD')
		.replace(/[̀-ͯ]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

/** mdsvex slug: `##` headings only (an empty slug means no id); an empty heading becomes `section`. */
export const sectionSlug = (text: string, { depth }: { depth: number }) => (depth === 2 ? headingId(text) || 'section' : '');

/** Hands out `id`, `id-1`, `id-2`, … as mdsvex makes repeated ids unique (github-slugger style). */
function uniqueIds() {
	const seen = new Map<string, number>();
	return (text: string) => {
		const id = sectionSlug(text, { depth: 2 });
		const count = seen.get(id) ?? 0;
		seen.set(id, count + 1);
		return count === 0 ? id : `${id}-${count}`;
	};
}

/** Markdown inline syntax → plain text (links keep their label). */
const plain = (markdown: string) =>
	markdown
		.replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
		.replace(/[*_`~]/g, '')
		.trim();

/** The `##` sections of a Markdown source (frontmatter and fenced code skipped), in order. */
export function outlineOf(source: string): { id: string; title: string }[] {
	const body = source.replace(/^---[\s\S]*?\n---/, '').replace(/```[\s\S]*?```/g, '');
	const idOf = uniqueIds();
	return [...body.matchAll(/^##[ \t]+(.+?)[ \t#]*$/gm)].map(([, heading]) => {
		const title = plain(heading);
		return { id: idOf(title), title };
	});
}
