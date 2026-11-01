/**
 * Section ids of a post body. The `##` headings get an `id` at compile time (`rehypeHeadingIds`, registered with
 * mdsvex in vite.config.ts) and the post page lists them in its table of contents (`outlineOf` over the raw Markdown).
 * Both sides use `headingId`, so the links always match. Dependency free on purpose: vite.config.ts imports this file.
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

/** Markdown inline syntax → plain text (links keep their label). */
const plain = (markdown: string) =>
	markdown
		.replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
		.replace(/[*_`~]/g, '')
		.trim();

/** The `##` sections of a Markdown source (frontmatter and fenced code skipped), in order. */
export function outlineOf(source: string): { id: string; title: string }[] {
	const body = source.replace(/^---[\s\S]*?\n---/, '').replace(/```[\s\S]*?```/g, '');
	return [...body.matchAll(/^##[ \t]+(.+?)[ \t#]*$/gm)].map(([, heading]) => {
		const title = plain(heading);
		return { id: headingId(title), title };
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
		const visit = (node: HastNode) => {
			if (node.type === 'element' && node.tagName === 'h2') {
				node.properties ??= {};
				node.properties.id ??= headingId(textOf(node).trim());
			}
			node.children?.forEach(visit);
		};
		visit(tree);
	};
}
