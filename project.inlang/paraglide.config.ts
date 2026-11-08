import { defineConfig } from '@inlang/paraglide-js';

// Single source of compiler options for both the Vite plugin and `pnpm paraglide:compile`.
// `outputStructure` stays unset on purpose: Vite defaults to "virtual-modules" (only entry points on disk),
// the CLI to "message-modules". The CLI rejects "virtual-modules", so pinning it here would break `pnpm check`.
export default defineConfig({
	outdir: './src/lib/paraglide',
	emitTsDeclarations: true,
	// The locale comes from the URL only: `/…` is German (base locale), `/en/…` is English.
	// Crawlers, prerendering and the Workers cache all see exactly one language per URL.
	strategy: ['url', 'baseLocale'],
	// Same as SvelteKit's default, so localized links (`/en`, not `/en/`) never hit a redirect
	trailingSlash: 'never'
});
