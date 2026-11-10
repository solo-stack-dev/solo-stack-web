# solo-stack-web

Source code of [solo-stack.dev](https://solo-stack.dev), the homepage and video blog of the [Solo Stack](https://www.youtube.com/@solostack_dev) YouTube channel.

The site has three parts: a playful, on-brand landing page, a business contact page, and a blog that turns every YouTube video into an article (summary, chapters, transcript).

## Stack

SvelteKit 3 + Svelte 5 (runes, experimental `async`, remote functions) on Cloudflare Workers, Tailwind CSS 4, mdsvex, Paraglide (i18n, `de` + `en`), valibot, super-sitemap.

## Getting started

Requires Node `>=24.18` and pnpm.

```sh
pnpm install
cp .env.example .env
pnpm dev
```

| Command                     | What it does                                         |
| --------------------------- | ---------------------------------------------------- |
| `pnpm dev`                  | Dev server                                           |
| `pnpm check`                | Type check (also regenerates Worker types)           |
| `pnpm lint` / `pnpm format` | oxlint / oxfmt                                       |
| `pnpm build`                | Production build                                     |
| `pnpm preview`              | Build and run the Worker locally with `wrangler dev` |

## Docs

- [docs/PROJECT.md](docs/PROJECT.md): goals, audience, brand, pages, open decisions
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): stack, conventions, environments, planned blog pipeline
- [docs/mockups/](docs/mockups/README.md): static design explorations (open `docs/mockups/index.html` in a browser, no build step)
- [AGENTS.md](AGENTS.md): rules for AI coding agents working in this repo

## License

The original **code and technical documentation** are released under MIT, subject to the exclusions in [LICENSE](LICENSE). That file contains the full scope and the MIT license text.

The **Solo Stack brand, artwork, photos, radio tracks, and editorial content** are excluded, including when embedded in code or documentation. Rights are reserved only where they exist; this notice does not create rights in otherwise unprotected material, including AI-generated material that does not qualify for protection. Statutory permissions and rights already granted under earlier licenses remain unaffected. Fork the code, bring your own brand and content.

**Third-party material** retains its own terms. The Geist fonts use the [SIL Open Font License 1.1](static/fonts/OFL-Geist.txt). The [Simple Icons](https://simpleicons.org) project uses CC0 1.0, but individual logos can have separate terms and trademark restrictions; see its [disclaimer](https://github.com/simple-icons/simple-icons/blob/develop/DISCLAIMER.md). See [LICENSE](LICENSE) for the full third-party notice.
