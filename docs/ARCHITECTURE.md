# Architecture

Status: initial scaffold. This describes what is set up and the intended direction. Sections marked **Proposed** are not built yet.

## Stack

| Area       | Choice                                                                                                                                                                                              | Where                                       |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| Framework  | SvelteKit 3, Svelte 5 with runes and experimental `async` components                                                                                                                                | `vite.config.ts`                            |
| Data layer | SvelteKit **remote functions** (`experimental.remoteFunctions`)                                                                                                                                     | `*.remote.ts` files                         |
| Validation | valibot (schemas for remote functions and frontmatter)                                                                                                                                              |                                             |
| Hosting    | Cloudflare Workers via `@sveltejs/adapter-cloudflare`, static assets through the `ASSETS` binding                                                                                                   | `wrangler.jsonc`                            |
| Styling    | Tailwind CSS 4 (CSS first config)                                                                                                                                                                   | `src/routes/layout.css`                     |
| UI kit     | shadcn-svelte (style `nova`, bits-ui, lucide) for blog and stats pages; tokens mapped to the brand; light/dark via mode-watcher. Add components with `sfw pnpm dlx shadcn-svelte@latest add <name>` | `components.json`, `src/lib/components/ui/` |
| Content    | mdsvex: `.md` and `.svx` files are Svelte components with frontmatter                                                                                                                               | `vite.config.ts`                            |
| Images     | `@sveltejs/enhanced-img` for build time optimized images                                                                                                                                            |                                             |
| 3D         | Threlte (`@threlte/core` 8, `@threlte/extras` 9) + `three`, lazy chunks only (hero moon, maybe a game)                                                                                              |                                             |
| i18n       | Paraglide JS, locales `de` (base, unprefixed URLs) and `en` (`/en/…`), URL strategy                                                                                                                 | `project.inlang/`, `messages/`              |
| SEO        | super-sitemap for `sitemap.xml`                                                                                                                                                                     |                                             |
| Font       | Geist variable, self hosted and preloaded                                                                                                                                                           | `static/fonts/`, `src/app.html`             |
| Tooling    | pnpm, oxlint (`.oxlintrc.json`), oxfmt (`.oxfmtrc.jsonc`), svelte-check, rolldown bundle analyzer (`pnpm analyze`)                                                                                  |                                             |

Node `>=24.18`. `paths.origin` in `vite.config.ts` is set per build mode (`staging`, `production`); it is the origin used for absolute URLs while prerendering and the trusted origin for CSRF checks.

## Conventions

### Remote functions

All server data access goes through remote functions exported from `*.remote.ts` files and imported directly into components:

- `query` for reads (e.g. latest videos), `prerender` for data that only changes at build time (e.g. the blog index), `command` for mutations, `form` for progressive enhancement forms.
- Every argument is validated with a valibot schema.
- Because Svelte's experimental `async` is on, components can `await` remote queries directly in markup.

Avoid adding `+page.server.ts` load functions or `+server.ts` endpoints unless remote functions cannot do the job (e.g. `sitemap.xml`, RSS, webhooks).

### Imports

Use `#lib` / `#lib/*` (Node subpath imports in `package.json`) for `src/lib`.

### i18n

Paraglide compiles `messages/*.json` into `src/lib/paraglide/` (generated, git ignored). Compiler options live in `project.inlang/paraglide.config.ts`, shared by the Vite plugin and `pnpm paraglide:compile`. Message values are visitor facing text, so they are generated with `gpt-6.1-sol` like everything else.

- **The URL is the only locale source** (`strategy: ['url', 'baseLocale']`). German is the base locale at unprefixed URLs (`/`, `/blog/…`), English lives under `/en/…`. No cookie or `Accept-Language` detection and no automatic redirects, so crawlers, prerendering and the Workers cache (keyed by path) always see one language per URL.
- `src/hooks.ts` `reroute` strips the locale prefix, so one route file serves every locale. `src/hooks.server.ts` sets `lang`/`dir` and 308-redirects `/de/…` to the unprefixed canonical URL.
- The root layout emits `hreflang` alternates (absolute URLs, plus `x-default`). The prerender crawler follows them, so every locale variant of a prerendered page is built.
- Build internal links with `localizeHref()` so they stay in the current locale. A locale switcher links to `localizeHref(page.url.pathname, { locale })`.
- Blog posts that exist in only one language must not advertise an `hreflang` alternate for the missing language (filter `locales` per post once posts exist).

## Environments

| Env        | Command                                                             | Domain                   | Secrets           |
| ---------- | ------------------------------------------------------------------- | ------------------------ | ----------------- |
| Local      | `pnpm dev` (Vite) / `pnpm preview` (built Worker in `wrangler dev`) | localhost                | `.env`            |
| Staging    | `pnpm staging:deploy`                                               | `staging.solo-stack.dev` | `.env.staging`    |
| Production | `pnpm production:deploy`                                            | `solo-stack.dev`         | `.env.production` |

- Deploy scripts pass `--env` explicitly and upload the matching file with `--secrets-file`. Uploads are additive: removing a key from the file does not delete the remote secret (`wrangler secret delete <KEY> --env <env>`). Non secret config goes into `vars` in `wrangler.jsonc` (not inherited, repeat it per environment).
- Do not put `CLOUDFLARE_ENV` into these files: every key in a secrets file becomes a Worker secret, and Wrangler loads `.env` into its own process for every command.
- `workers_dev` and `preview_urls` are `false` at the top level, so every environment (and an accidental deploy without `--env`) inherits them. Custom domains require the `solo-stack.dev` zone in the same Cloudflare account.
- Workers Cache is enabled. It only stores responses that send `Cache-Control`, keyed by path (not by host, cookies or language). Workers Logs (`observability`) are enabled. Source maps are uploaded on deploy, so stack traces in the logs are remapped.
- Staging is publicly reachable and would be indexed. Put it behind Cloudflare Access (Zero Trust, free tier); that also covers prerendered pages and static assets, which the Worker's hooks never see.
- Run `pnpm gen` after changing bindings in `wrangler.jsonc` to regenerate `worker-configuration.d.ts`. Keep `compatibility_date` at or below what the installed `workerd` supports, or `wrangler dev` refuses to start.

## Site pages and blog (built)

Every page except the homepage lives in the route group `src/routes/(site)/`. Its `+layout.svelte` is generic: `<ModeWatcher defaultMode="system">` (light/dark, choice in localStorage, head script against a theme flash), the sticky navbar, the footer, and the page surface (`bg-background`, marked `data-site-surface`). New pages (stats, contact, legal) just drop into the group; `src/routes/+layout.ts` prerenders the whole site (SvelteKit reads page options only from `+page.ts`/`+layout.ts`, not from `.svelte` files).

- **Navbar:** one component, `src/lib/components/site/SiteNav.svelte`, links from `links.ts` (Start, Blog, Stats). `variant="site"` on the (site) pages (theme toggle and the phone sheet are passed in as `actions`, so the homepage never ships them); `variant="night"` floats over the homepage night, rendered by `NightPage` with its section menu button as the action: the links and the button sit in one smoked-glass "dock" capsule (current page as a lit butter pill) so they read over the art. On phones the dock holds only the section menu button; the menu overlay lists the site links. The Stats link has `rel="external"` until `src/routes/(site)/stats/+page.svelte` exists (detected at build time), so the prerender crawler does not fail on it.
- **Theme scope:** `layout.css` switches `html` background and `color-scheme` to the theme only while `[data-site-surface]` is in the page; everywhere else (homepage, error pages) the night wins, also after a client side navigation from a light page.
- **Posts:** `src/content/blog/<slug>.md` (mdsvex), frontmatter validated by `src/lib/blog/schema.ts` (an invalid post fails the build). `src/lib/blog/posts.remote.ts` has the prerendered `getPosts` / `getPost` remote functions (reading time from the raw Markdown); `content.ts` loads the rendered body as one lazy chunk per post. Drafts (`draft: true`) are only listed and built in dev.
- **Pages:** `/blog` (newest first, client side format filter mirrored to `?format=`), `/blog/[slug]` (video facade, summary, chapters that seek the player, takeaways, body, collapsible transcript, links). Post links always point to the post's own language; the root layout skips its hreflang alternates on post pages, which emit their own canonical and hreflang.
- **Video facade** (`src/lib/blog/VideoFacade.svelte`): self-hosted thumbnail via the cinema's `VideoThumbnail` (prerendered `/media/video-thumbnail/[id]/[width].[format]`: sharp crops YouTube's thumbnail to 16:9 at build time and encodes 480/768/1280 px AVIF + WebP, plus the 1280 px JPEG for the `<img>` fallback and `og:image`), youtube-nocookie iframe on click, chapter seeks via the IFrame API `postMessage` protocol (no API script). Without `youtubeId` the painted night with a "video follows" note is shown and no `VideoObject` is emitted.
- **SEO:** `BlogPosting` (+ `VideoObject` with clips and transcript when a video exists) as one JSON-LD `@graph`, canonical, Open Graph, Twitter card.
- **TODO:** `sitemap.xml` (super-sitemap) and the RSS feed do not exist yet; add `/blog` and the posts there.

## Blog pipeline (Proposed)

Goal: every published YouTube video becomes a blog post without manual writing.

```
YouTube upload
  → fetch metadata (YouTube Data API: title, description, chapters, thumbnail, publish date)
  → fetch transcript (captions of the owner's own channel)
  → generate post with gpt-6.1-sol (summary, sections, takeaways, meta description, slug)
  → validate frontmatter with valibot
  → write src/content/blog/<slug>.md and open a PR / commit
  → build prerenders the post → deploy
```

Recommended shape:

- **Posts are Markdown files in the repo** (`src/content/blog/*.md`, rendered by mdsvex). This keeps posts reviewable in Git, editable by hand, fully prerendered, and fast. No database needed.
- **Generation runs outside the Worker**, as a script (`scripts/`) triggered by a scheduled GitHub Action or locally via Codex. It uses the OpenAI API with model `gpt-6.1-sol`. The Worker never calls the model at request time.
- **Frontmatter schema** (implemented in `src/lib/blog/schema.ts`): `title`, `slug` (= file name), `description`, `summary`, `youtubeId` (`null` until public), `publishedAt`, `updatedAt`, `durationSeconds`, `format` (`project` | `ai-test` | `ai-news` | `business`), `chapters[]` (`{ start, title }`), `takeaways[]`, `links[]` (`{ url, label }`), `transcript[]` (`{ start, text }`), `tags[]`, `lang`, `generatedBy: gpt-6.1-sol`, `draft`.
- **Idempotent:** the YouTube video ID is the key; existing posts are never overwritten without an explicit flag, so manual edits survive.
- The owner's GitHub profile already lists videos via a daily GitHub Action; the same trigger pattern can be reused.

### SEO per post

- `BlogPosting` plus `VideoObject` JSON-LD (with transcript, thumbnail, upload date, duration).
- Canonical URL, Open Graph and Twitter cards using the YouTube thumbnail or a generated OG image.
- `hreflang` alternates if posts get translations.
- Entries in `sitemap.xml` (super-sitemap) and an RSS feed.
- **Facade embed:** show the thumbnail and load the YouTube iframe only on click. The iframe is the heaviest thing on the page otherwise.

## Performance budget (Proposed)

- Homepage: the owner accepts a richer homepage (painted art, Threlte hero, audio) in exchange for some speed. Targets: LCP ≤ 2.5 s on mobile, CLS < 0.05, INP < 200 ms, initial JS ≤ ~120 kB gzip with Threlte, audio, and games in lazy chunks. Details in [HANDOFF-HOMEPAGE.md](HANDOFF-HOMEPAGE.md#8-performance-and-quality-budgets). Other pages: Lighthouse 95+ on mobile.
- Prerender everything that does not need live data.
- Prefer CSS (scroll driven animations, View Transitions API, `@starting-style`) over JS animation libraries. If a library is added later, import it only in the component that needs it.
- Games and canvas experiments load on interaction or when scrolled into view, and pause when off screen.
- Every animation has a `prefers-reduced-motion` fallback.
- Run `pnpm analyze` after adding dependencies and read the bundle analyzer report (`.svelte-kit/output/client/analyze-data.md`). Deploy builds never include it.

## Homepage code

The homepage lives in `src/lib/home/` (one folder per section, shared components, data remote functions) and is composed by `src/routes/+page.svelte`. Folder ownership, the `--night` scroll contract, shared component APIs, the game module contract, message key rules, and asset conventions are in [HOMEPAGE-DEV.md](HOMEPAGE-DEV.md). `docs/mockups/` holds design artifacts and is excluded from oxfmt and oxlint.

## Stats page

`/stats` (`src/routes/(site)/stats/`, components in `src/lib/stats/`) shows the numbers of all social profiles. **It runs on mock data** until the platform APIs are connected.

- **Data contract:** `src/lib/stats/schema.ts` (valibot `StatsSchema`): daily series of `HISTORY_DAYS` entries (two of the longest period plus today) for followers per platform, YouTube views and watch time, and posts; plus the top YouTube videos with views per period. The UI only reads a parsed `Stats` object.
- **Source:** `getStats()` in `stats.remote.ts` is a `prerender` remote function that currently returns `createMockStats()` (`mock.ts`, seeded and deterministic). Replace it with real fetches and keep the `v.parse`. Switch to a cached `query` if the numbers should refresh without a rebuild.
- **Charts:** LayerChart via shadcn-svelte `chart`, loaded lazily with `LazyMount` (own chunk); sparklines, the share bar and the activity calendar are plain SVG/HTML. Colors come from `--chart-1` … `--chart-5` (fixed per entity, validated per theme), `--chart-accent` and `--chart-wash` in `src/routes/layout.css`.
- **Copy:** `stats_*` messages, generated with `gpt-6.1-sol` (`docs/copy/stats-*`).
- **Open (real data):** YouTube Data API v3 + YouTube Analytics API (subscribers, views, watch time, top videos; OAuth for analytics), GitHub REST (followers), Bluesky public API (`app.bsky.actor.getProfile`, no auth), Twitch Helix (followers, app token), Instagram/Threads/Facebook via Meta Graph APIs (business or creator account and app review), TikTok Display API, X API (paid tier for follower counts). Daily history needs a stored snapshot per day (e.g. a scheduled Worker writing to D1/KV), since most APIs only return the current count.
