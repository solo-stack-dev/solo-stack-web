// Markdown files rendered by mdsvex (vite.config.ts), e.g. the legal texts in src/content/legal/
declare module '*.md' {
	import type { Component } from 'svelte';
	const component: Component;
	export default component;
	export const metadata: Record<string, unknown> | undefined;
}
