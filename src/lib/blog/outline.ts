/**
 * Section ids of a post body: `rehypeHeadingIds` (mdsvex, vite.config.ts) sets them on `##` headings, `outlineOf` builds
 * the TOC from raw Markdown; both use `headingId`, so links match. Keep dependency free: vite.config.ts imports this file.
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

/** Hands out `id`, `id-2`, `id-3`, … so repeated headings stay unique; an empty slug becomes `section`. */
function uniqueIds() {
	const seen = new Map<string, number>();
	return (text: string) => {
		const id = headingId(text) || 'section';
		const count = (seen.get(id) ?? 0) + 1;
		seen.set(id, count);
		return count === 1 ? id : `${id}-${count}`;
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

interface HastNode {
	type: string;
	tagName?: string;
	value?: string;
	properties?: Record<string, unknown>;
	children?: HastNode[];
}

const textOf = (node: HastNode): string => (node.type === 'text' ? (node.value ?? '') : (node.children ?? []).map(textOf).join(''));

/** rehype plugin for mdsvex: an `id` on every `h2` that has none. */
export function rehypeHeadingIds() {
	return (tree: HastNode) => {
		const idOf = uniqueIds();
		const visit = (node: HastNode) => {
			if (node.type === 'element' && node.tagName === 'h2') {
				node.properties ??= {};
				node.properties.id ??= idOf(textOf(node).trim());
			}
			node.children?.forEach(visit);
		};
		visit(tree);
	};
}
