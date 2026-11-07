# AGENTS.md

**solo-stack.dev** is the personal homepage and video blog for the Solo Stack YouTube channel. It is a playful, branded landing page plus a blog that turns each YouTube video into an SEO-friendly article. Read [docs/PROJECT.md](docs/PROJECT.md) for the full picture and [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) before making structural changes. Homepage work follows [docs/HANDOFF-HOMEPAGE.md](docs/HANDOFF-HOMEPAGE.md); code in `src/lib/home/` follows [docs/HOMEPAGE-DEV.md](docs/HOMEPAGE-DEV.md) (folder ownership, shared APIs, message keys).

## Hard rule: public text comes from `gpt-6.1-sol`

Any text that ships to visitors must be generated with OpenAI **`gpt-6.1-sol`**. That covers page copy, blog posts, titles, meta descriptions, alt text, microcopy, and translations. Claude and other agents must not write it themselves, because their output may carry watermarks.

- Agents write code, prompts, structure, and docs. Where copy is needed, add a clearly marked placeholder (`TODO(copy): …`) or generate it with the model.
- Locally: `codex exec -m gpt-6.1-sol "<prompt>"`. Automated pipelines: OpenAI API with model `gpt-6.1-sol`.
- Prompts must follow the copy rules in [docs/PROJECT.md](docs/PROJECT.md#voice-and-copy-rules).

## Stack in one glance

SvelteKit 3 + Svelte 5 (runes, experimental `async`) on Cloudflare Workers, D1 via Drizzle ORM (schema `src/lib/db/schema.ts`, `pnpm db:generate`) plus KV, Tailwind CSS 4, mdsvex for `.md`/`.svx`, Paraglide for i18n, valibot for validation, super-sitemap. Details in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Conventions

- **Data loading and mutations use SvelteKit remote functions** (`query`, `prerender`, `command`, `form` in `*.remote.ts`), validated with valibot. Prefer them over `+page.server.ts` load functions and API routes.
- Import from `src/lib` via the `#lib/*` subpath import (see `package.json` `imports`).
- UI strings go through Paraglide messages in `messages/{locale}.json`; `src/lib/paraglide` is generated, never edit it.
- **Performance is a feature.** Animations and games must be lazy, cheap, and respect `prefers-reduced-motion`. Ask before adding a heavy dependency.
- pnpm only. New packages are subject to a 5 day minimum release age (`pnpm-workspace.yaml`).
- Install packages only via `sfw pnpm …` (e.g. `sfw pnpm add -D foo`).
- Format and lint with oxfmt/oxlint (tabs, single quotes, width 170).

## Blog posts

New post for a video, its translation, or a revision: follow the `blog-post` skill ([.claude/skills/blog-post/SKILL.md](.claude/skills/blog-post/SKILL.md)). A translation names its original in `translationOf`; that links the versions for hreflang, the sitemap and the blog index.

## Commands

- `pnpm dev`: dev server
- `pnpm check`: type check (also regenerates Worker types)
- `pnpm lint` / `pnpm format`
- `pnpm build`, `pnpm preview`: production build and local Worker preview
- Deploys (`staging:deploy`, `production:deploy`) are run by the owner only.
