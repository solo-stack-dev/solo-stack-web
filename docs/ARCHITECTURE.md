# Architecture

Status: initial scaffold. This describes what is set up and the intended direction. Sections marked **Proposed** are not built yet.

## Stack

| Area       | Choice                                                                                                                                                                                              | Where                                       |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| Framework  | SvelteKit 3, Svelte 5 with runes and experimental `async` components                                                                                                                                | `vite.config.ts`                            |
| Data layer | SvelteKit **remote functions** (`experimental.remoteFunctions`)                                                                                                                                     | `*.remote.ts` files                         |
| Validation | valibot (schemas for remote functions and frontmatter)                                                                                                                                              |                                             |
| Hosting    | Cloudflare Workers via `@sveltejs/adapter-cloudflare`, static assets through the `ASSETS` binding                                                                                                   | `wrangler.jsonc`                            |
| Database   | Cloudflare D1 via Drizzle ORM (`1.0.0-rc.5`), KV for caches and snapshots; see [Database](#database)                                                                                                | `src/lib/db/`, `migrations/`                |
| Styling    | Tailwind CSS 4 (CSS first config)                                                                                                                                                                   | `src/routes/layout.css`                     |
| UI kit     | shadcn-svelte (style `nova`, bits-ui, lucide) for blog and stats pages; tokens mapped to the brand; light/dark via mode-watcher. Add components with `sfw pnpm dlx shadcn-svelte@latest add <name>` | `components.json`, `src/lib/components/ui/` |
| Content    | mdsvex: `.md` and `.svx` files are Svelte components with frontmatter                                                                                                                               | `vite.config.ts`                            |
| Images     | `@sveltejs/enhanced-img` for build time optimized images                                                                                                                                            |                                             |
| 3D         | Threlte (`@threlte/core` 8, `@threlte/extras` 9) + `three`, lazy chunks only (hero moon, maybe a game)                                                                                              |                                             |
| i18n       | Paraglide JS, locales `de` (base, unprefixed URLs) and `en` (`/en/…`), URL strategy                                                                                                                 | `project.inlang/`, `messages/`              |
| SEO        | super-sitemap for `sitemap.xml`                                                                                                                                                                     |                                             |
| Font       | Geist variable, self hosted; the Latin subset is preloaded, the full file is a `unicode-range` fallback (see `layout.css`)                                                                          | `static/fonts/`, `src/app.html`             |
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
- Read bindings, secrets and `waitUntil` via `import { env, waitUntil } from 'cloudflare:workers'` in server code. SvelteKit 3 removed `event.platform` ([sveltejs/kit#16754](https://github.com/sveltejs/kit/pull/16754)); `request.cf` and the global `caches` replace `platform.cf`/`platform.caches`. In `pnpm dev` the adapter emulates the module; restart the dev server after editing `wrangler.jsonc`, it keeps the old bindings otherwise ([#17529](https://github.com/sveltejs/kit/issues/17529)).
- Run `pnpm gen` after changing bindings in `wrangler.jsonc` to regenerate `worker-configuration.d.ts`. Keep `compatibility_date` at or below what the installed `workerd` supports, or `wrangler dev` refuses to start.

## Database

D1 is the app's database, accessed through **Drizzle ORM** (`drizzle-orm`/`drizzle-kit` `1.0.0-rc.5`, pinned: v1 changed the migrations folder and the relational query API, so update both together and read the release notes). KV holds caches and snapshots.

| Binding | Local (`.wrangler/state`, dummy ids) | Staging                  | Production       |
| ------- | ------------------------------------ | ------------------------ | ---------------- |
| `DB`    | `solo-stack-web-local`               | `solo-stack-web-staging` | `solo-stack-web` |
| `KV`    | (simulated)                          | `solo-stack-web-staging` | `solo-stack-web` |

- One D1 database and one KV namespace **per app and environment**, named after the repository. Other projects on the account get their own (`solo-stack-<app>`), so keys never collide, staging can be wiped safely, and each Worker only sees its own data. Prefix KV keys by feature (`stats:v1`).
- **Schema:** `src/lib/db/schema.ts` is the single source of truth. Change it, run `pnpm db:generate` (drizzle-kit writes `migrations/<timestamp>_<name>/migration.sql` + `snapshot.json`), review the SQL, commit both files. Never edit `snapshot.json`; to redo a migration no database has run yet, delete its folder and generate again.
- **Apply:** Wrangler, not drizzle-kit: `pnpm db:migrate` (local), `pnpm db:migrate:staging`, `pnpm db:migrate:production`. `migrations_pattern` in `wrangler.jsonc` points Wrangler at Drizzle's folder layout; applied migrations are tracked in the `d1_migrations` table.
- **Queries:** `getDb()` from `#lib/db/client.server.ts` inside request code (remote functions), `getDb(env)` in a `scheduled` handler. Use Drizzle's query builder; `onConflictDoUpdate` for upserts, `db.batch([...])` for several writes in one round trip (D1 has no interactive transactions).
- D1 enforces foreign keys. SQLite `STRICT`/`WITHOUT ROWID` tables are not expressible in Drizzle; column types and `check()` constraints in the schema cover validation.

### Cloudflare setup (owner, once)

1. `pnpm exec wrangler login` (Wrangler is a project dependency, not installed globally, so always prefix `pnpm exec`) opens the browser for OAuth. The consent page shows the requested scopes and only offers Allow or Deny; the default set covers Workers, KV, D1, routes and more. To grant less, pass the scopes yourself (list: `pnpm exec wrangler login --scopes-list`), at least `account:read user:read workers:write workers_scripts:write workers_routes:write workers_kv:write d1:write zone:read`. `pnpm exec wrangler whoami` shows the account and granted scopes; `pnpm exec wrangler logout` revokes the token. For CI use an API token (`CLOUDFLARE_API_TOKEN`, dashboard > My Profile > API Tokens) with D1 Edit, Workers KV Storage Edit and Workers Scripts Edit for this account instead.
2. Create the resources and paste the printed ids into the `TODO(cloudflare)` spots in `wrangler.jsonc`:
   `pnpm exec wrangler d1 create solo-stack-web-staging`, `pnpm exec wrangler d1 create solo-stack-web` (add `--location weur` for Western Europe), `pnpm exec wrangler kv namespace create solo-stack-web-staging`, `pnpm exec wrangler kv namespace create solo-stack-web`.
3. `pnpm db:migrate:staging` and `pnpm db:migrate:production`.

## Site pages and blog (built)

Every page except the homepage lives in the route group `src/routes/(site)/`. Its `+layout.svelte` is generic: `<ModeWatcher defaultMode="system">` (light/dark, choice in localStorage, head script against a theme flash), the sticky navbar, the footer, and the page surface (`.site-surface`, marked `data-site-surface`): painted night paper in `layout.css` (dusk/butter wash at the top, plain `--background` mid page, a lift towards the footer, two tiny SVG pigment tiles, all on one scrolling element, no JS or image requests) under the fixed paper grain. Keyboard focus on these pages is one shared ring (`--focus-ring`, 2px, 3px off, `--focus-glow`); form fields draw focus in their material instead (the contact form's ruled lines, `--ink-*` tokens). New pages (stats, contact, legal) just drop into the group; `src/routes/+layout.ts` prerenders the whole site (SvelteKit reads page options only from `+page.ts`/`+layout.ts`, not from `.svelte` files).

- **Navbar:** one component, `src/lib/components/site/SiteNav.svelte`, links from `links.ts` (Start, Blog, Stats, Kontakt). `variant="site"` on the (site) pages (theme toggle and the phone sheet are passed in as `actions`, so the homepage never ships them); `variant="night"` floats over the homepage night, rendered by `NightPage` with its section menu button as the action: the links and the button sit in one smoked-glass "dock" capsule (current page as a lit butter pill) so they read over the art. On phones the dock holds only the section menu button; the menu overlay lists the site links. The Stats link has `rel="external"` until `src/routes/(site)/stats/+page.svelte` exists (detected at build time), so the prerender crawler does not fail on it.
- **Theme scope:** `layout.css` switches `html` background and `color-scheme` to the theme only while `[data-site-surface]` is in the page; everywhere else (homepage, error pages) the night wins, also after a client side navigation from a light page.
- **Posts:** `src/content/blog/<slug>.md` (mdsvex), frontmatter validated by `src/lib/blog/schema.ts` (an invalid post fails the build). `src/lib/blog/posts.remote.ts` has the prerendered `getPosts` / `getPost` remote functions (reading time from the raw Markdown); `content.ts` loads the rendered body as one lazy chunk per post. Drafts (`draft: true`) are only listed and built in dev.
- **Pages:** `/blog` (newest first, client side format filter mirrored to `?format=`), `/blog/[slug]` (video facade, summary, chapters that seek the player, takeaways, body, collapsible transcript, links). Post links always point to the post's own language; the root layout skips its hreflang alternates on post pages, which emit their own canonical and hreflang.
- **Video facade** (`src/lib/blog/VideoFacade.svelte`): self-hosted thumbnail via the cinema's `VideoThumbnail` (prerendered `/media/video-thumbnail/[id]/[width].[format]`: sharp crops YouTube's thumbnail to 16:9 at build time and encodes 480/768/1280 px AVIF + WebP, plus the 1280 px JPEG for the `<img>` fallback and `og:image`), youtube-nocookie iframe on click, chapter seeks via the IFrame API `postMessage` protocol (no API script). Without `youtubeId` the painted night with a "video follows" note is shown and no `VideoObject` is emitted.
- **SEO:** `BlogPosting` (+ `VideoObject` with clips and transcript when a video exists) as one JSON-LD `@graph`, canonical, Open Graph, Twitter card.
- **TODO:** `sitemap.xml` (super-sitemap) and the RSS feed do not exist yet; add `/blog` and the posts there.

## Contact page (built)

`/kontakt` (`src/routes/(site)/kontakt/+page.svelte`, code in `src/lib/contact/`) for business requests, collaborations and feedback. Linked from the navbar and both footers.

- **Form:** `sendContact` in `contact.remote.ts` is a remote `form` validated with `ContactSchema` (`schema.ts`), the same schema runs as `preflight` in the browser. Issue messages are codes (`name`, `email`, …); the page shows the localized `contact_error_*` message per field, because the remote endpoint URL has no locale. Note that Kit 3 namespaces field names (`name/<form id>`), so every input must come from `fields.x.as(…)`.
- **Prerendered:** the page is static like the rest of the site; only the submission runs in the Worker (`/_app/remote/…`). That needs JavaScript, which Turnstile needs anyway (a `<noscript>` note says so).
- **Spam:** Cloudflare Turnstile (managed widget, `appearance: interaction-only`, explicit render, script loaded only on this page; `TurnstileWidget.svelte`, `turnstile.ts`) plus a honeypot field (`website`; a filled one gets a fake success). The token goes into the bound `turnstile` field and is checked by `turnstile.server.ts` against Siteverify, including `action` and `hostname`. Tokens are single use, so the widget resets after every submission.
- **Keys:** outside the `staging`/`production` build modes the official always-pass test keys are used, so `pnpm dev` and `pnpm preview` work without setup. For deploys: create a widget (hostnames `solo-stack.dev`, `staging.solo-stack.dev`), paste the public site key into `SITE_KEY` in `src/lib/contact/turnstile.ts`, and put `TURNSTILE_SECRET_KEY` into `.env.staging` / `.env.production` (declared in `src/env.ts`, read via `$app/env/private`). A deploy build without the secret answers 503 and the form says "could not send".
- **Delivery:** `deliver.server.ts` mails each message via Cloudflare Email Sending (onboarded for `solo-stack.dev`), `send_email` binding `CONTACT_EMAIL` in every environment of `wrangler.jsonc`, pinned to sender `kontakt@solo-stack.dev` and recipient `business@solo-stack.dev`. Email Routing forwards `business@` to the owner's private inbox, so that address lives only in the Cloudflare dashboard, never in this public repo. `Reply-To` is the visitor. `pnpm dev` simulates the binding and only prints the mail. A failed send answers 503 and logs the full message, so nothing is lost.
- **Copy:** `contact_*` and `site_nav_contact` messages, generated with `gpt-6.1-sol` (`docs/copy/contact-*`).

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
- **Source and freshness:** `getStats()` in `stats.remote.ts` is a `prerender` remote function (the page is prerendered with the rest of the site, so numbers change on rebuild) that parses whatever `loadStats()` in `source.server.ts` returns. Today that is `createMockStats()` (`mock.ts`, seeded and deterministic).
- **Storage (configured, not wired yet):** D1 (`DB`, see [Database](#database)) is the source of truth for the history: one row per platform, metric and UTC day (`daily_metrics`), plus `videos` and `video_daily_views` for the top list (`src/lib/db/schema.ts`). Rows never expire, so the page can later offer longer periods and the history survives schema changes of `Stats`. KV (`KV`) holds the finished `Stats` snapshot (`stats:v1`, rebuilt from D1 after every collector run) so page views never query D1.
- **Planned live data:** a collector (Cron Trigger, daily, optionally every few hours) fetches the platform numbers, upserts today's rows into D1 (the last fetch of a day wins), builds the `Stats` object from the last `HISTORY_DAYS` days and writes it to KV. `getStats()` then becomes a `query`, `/stats` opts out of prerendering, and `loadStats()` reads KV with `cacheTtl: 3600`, so most page views are served from the edge cache (free plan: KV 100k reads and 1k writes per day, D1 5M row reads and 100k row writes per day). Fall back to the last good snapshot when a platform API fails. `@sveltejs/adapter-cloudflare` only emits a `fetch` handler, so the cron needs a small custom Worker entry that re-exports SvelteKit's `fetch` and adds `scheduled` (no `triggers` in `wrangler.jsonc` until that exists). Most APIs only return the current count, so their history starts the day the cron runs; YouTube Analytics can backfill views, watch time and subscriber changes per day.
- **Design ("Sternwarte"):** no card grid. `Horizon.svelte` sets the total followers huge and draws the period as a moonlit ridge that ends on a cliff, with the painted moon (`hero-moon-disc`) rising behind it (`Ridge.svelte`, plain SVG with one turbulence filter, draws itself on load and on period change). The period switch shows moon phases. `Constellation.svelte` shows the platforms as stars on a planisphere disc (size = share of all followers) next to a ruled ledger with the exact numbers; hovering one lights the other. `YoutubeSection.svelte` is a ruled scoreboard, columns of light (`ViewsColumns.svelte`) and a ranked list; `ActivityCalendar.svelte` draws posting days as stars. Section headings sit on a butter pigment bloom (`making-bloom-chart`). Everything is plain SVG/HTML/CSS, no chart library; animations stop under `prefers-reduced-motion`.
- **Copy:** `stats_*` messages, generated with `gpt-6.1-sol` (`docs/copy/stats-*`).
- **Open (real data):** YouTube Data API v3 + YouTube Analytics API (subscribers, views, watch time, top videos; OAuth for analytics), GitHub REST (followers), Bluesky public API (`app.bsky.actor.getProfile`, no auth), Twitch Helix (followers, app token), Instagram/Threads/Facebook via Meta Graph APIs (business or creator account and app review), TikTok Display API, X API (paid tier for follower counts). Daily history: see the storage plan above.
