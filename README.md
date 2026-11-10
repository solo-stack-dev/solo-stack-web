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

The **code** is released under the [MIT License](LICENSE).

The MIT license does **not** cover the Solo Stack brand, artwork, and content. All rights reserved for:

- the name, logo, wordmark, and mascot,
- all artwork and images: the painted scenes and their layers (image files in `docs/art/`, `docs/mockups/`, and the `assets/` folders under `src/lib/`), banner, thumbnails, and the icons in `static/`,
- photos of the owner (e.g. `docs/mockups/assets/profile.jpg`),
- the radio tracks (`src/lib/home/sections/radio/track/`),
- blog posts, transcripts, legal pages, page copy, and other written content (`src/content/`, `messages/`, `docs/copy/`).

Please don't reuse these in your own projects. Fork the code, bring your own brand.

Third-party material keeps its own terms:

- The Geist and Geist Mono fonts are licensed under the [SIL Open Font License 1.1](static/fonts/OFL-Geist.txt).
- The platform logos (from [Simple Icons](https://simpleicons.org)) are trademarks of their respective owners.
