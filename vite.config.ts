import { paraglideVitePlugin } from '@inlang/paraglide-js';
import { mdsvex } from 'mdsvex';
import { enhancedImages } from '@sveltejs/enhanced-img';
import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-cloudflare';
import { sveltekit } from '@sveltejs/kit/vite';
import { bundleAnalyzerPlugin } from 'rolldown/experimental';
import { defineConfig, type Plugin } from 'vite';
import { rehypeHeadingIds } from './src/lib/blog/outline.ts';

// Public origin per build mode (`vite build --mode <mode>`). SvelteKit uses it as `page.url.origin` while
// prerendering (absolute hreflang/canonical/OG URLs) and as the trusted origin for CSRF checks on forms and
// remote functions, so it must match where the build is served. `dev` and local `preview` leave it unset.
const origins: Record<string, string> = {
	staging: 'https://staging.solo-stack.dev',
	production: 'https://solo-stack.dev'
};

// enhanced-img encodes AVIF + WebP + a fallback, and the fallback is PNG for every image with alpha (JPEG otherwise):
// about 50 MB of files no browser fetches, since every supported browser takes WebP. Appending `format=avif;webp` to
// every enhanced import (an explicit `format` wins over the plugin's defaults) makes WebP the `<img>` fallback.
// `<enhanced:img src="…">` resolves its URL through Vite too, so this covers both forms. An import that sets its own
// `format` is left alone.
function enhancedImagesWithoutLegacyFallback(): Plugin {
	return {
		name: 'solo-stack:enhanced-img-webp-fallback',
		enforce: 'pre',
		resolveId(source, importer, options) {
			const query = source.split('?')[1];
			if (!query) return null;
			const params = new URLSearchParams(query);
			if (!params.has('enhanced') || params.has('format')) return null;
			return this.resolve(`${source}&format=avif;webp`, importer, { ...options, skipSelf: true });
		}
	};
}

export default defineConfig(({ mode }) => ({
	build: {
		rolldownOptions: {
			// `pnpm analyze` only: the report is emitted into the build output, so a deploy build must not contain it
			plugins: mode === 'analyze' ? [bundleAnalyzerPlugin({ format: 'md' /* or 'json' */ })] : []
		}
	},
	plugins: [
		enhancedImagesWithoutLegacyFallback(),
		enhancedImages(),
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				experimental: { async: true }
			},
			adapter: adapter(),
			preprocess: [mdsvex({ extensions: ['.svx', '.md'], rehypePlugins: [rehypeHeadingIds] })],
			extensions: ['.svelte', '.svx', '.md'],
			experimental: { remoteFunctions: true },
			paths: { origin: origins[mode] },
			inspector: true
		}),

		// Options (strategy, outdir, …) live in project.inlang/paraglide.config.ts, shared with the CLI
		paraglideVitePlugin({ project: './project.inlang' })
	]
}));
