# Architecture

Status: initial scaffold. This describes what is set up and the intended direction. Sections marked **Proposed** are not built yet.

## Stack

| Area       | Choice                                                                                                                                                                                                                                                                          | Where                           |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| Framework  | SvelteKit 3, Svelte 5 with runes and experimental `async` components                                                                                                                                                                                                            | `vite.config.ts`                |
| Data layer | SvelteKit **remote functions** (`experimental.remoteFunctions`)                                                                                                                                                                                                                 | `*.remote.ts` files             |
| Validation | valibot (schemas for remote functions and frontmatter)                                                                                                                                                                                                                          |                                 |
| Hosting    | Cloudflare Workers via `@sveltejs/adapter-cloudflare`, static assets through the `ASSETS` binding                                                                                                                                                                               | `wrangler.jsonc`                |
| Database   | Cloudflare D1 via Drizzle ORM (`1.0.0-rc.5`), KV for caches and snapshots; see [Database](#database)                                                                                                                                                                            | `src/lib/db/`, `migrations/`    |
| Styling    | Tailwind CSS 4 (CSS first config)                                                                                                                                                                                                                                               | `src/routes/layout.css`         |
| UI kit     | No component kit: every page is hand-built (Tailwind, plain SVG). bits-ui only for the theme menu, lucide icons, light/dark via mode-watcher. `components.json` keeps the shadcn-svelte setup should a component ever be added (`sfw pnpm dlx shadcn-svelte@latest add <name>`) | `components.json`               |
| Content    | mdsvex: `.md` and `.svx` files are Svelte components with frontmatter                                                                                                                                                                                                           | `vite.config.ts`                |
| Images     | `@sveltejs/enhanced-img` for build time optimized images                                                                                                                                                                                                                        |                                 |
| 3D         | Threlte (`@threlte/core` 8, `@threlte/extras` 9) + `three`, lazy chunks only (hero moon, maybe a game)                                                                                                                                                                          |                                 |
| i18n       | Paraglide JS, locales `de` (base, unprefixed URLs) and `en` (`/en/…`), URL strategy                                                                                                                                                                                             | `project.inlang/`, `messages/`  |
| SEO        | super-sitemap for `sitemap.xml`                                                                                                                                                                                                                                                 |                                 |
| Font       | Geist variable, self hosted; the Latin subset is preloaded, the full file is a `unicode-range` fallback (see `layout.css`)                                                                                                                                                      | `static/fonts/`, `src/app.html` |
| Tooling    | pnpm, oxlint (`.oxlintrc.json`), oxfmt (`.oxfmtrc.jsonc`), svelte-check, rolldown bundle analyzer (`pnpm analyze`)                                                                                                                                                              |                                 |

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
- Build internal links with `localizeHref()` so they stay in the current locale.
- **Language switch:** a dropdown in `SiteNav` (`LocaleSwitch`, the bits-ui `LocaleMenu` loads on first tap like the theme menu; logic in `locale-switch.ts`). Each option is a plain link with `data-sveltekit-reload`; crawlers use the hreflang tags. Changing the locale is a full document load (as Paraglide's `setLocale` does), because the messages are not reactive and `/blog` and `/en/blog` are the same route component. On a post it links to the translation (own slug) or, without one, to that language's blog index. Every link that changes the locale needs `data-sveltekit-reload`.
- Blog posts: one file per language. A translation sets `translationOf: <original slug>` (validated at build time); post pages, the sitemap and the blog index (one version per video, in the visitor's language when it exists) derive the hreflang pairs from it. A post without translation advertises only its own language.

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

Every page except the homepage lives in the route group `src/routes/(site)/`. Its `+layout.svelte` is generic: `<ModeWatcher defaultMode="system">` (light/dark, choice in localStorage, head script against a theme flash), the sticky navbar, the footer, and the page surface (`.site-surface`, marked `data-site-surface`): painted night paper in `layout.css` (dusk/butter wash at the top, plain `--background` mid page, a lift towards the footer, two tiny SVG pigment tiles, all on one scrolling element, no JS or image requests) under the fixed paper grain. The footer (`SiteFooter.svelte`) is the floor of every subpage: the silhouette horizon `footer-horizon.webp` (never narrower than 76rem, cropped from the left on phones so the laptop cliff stays) over its ink ground (#131415 in both themes, cream/#b3ab98 text), with a CSS sky glow, laptop screen light and three fireflies that run only while on screen. Keyboard focus on these pages is one shared ring (`--focus-ring`, 2px, 3px off, `--focus-glow`); form fields draw focus in their material instead (the contact form's ruled lines, `--ink-*` tokens). New pages (stats, contact, legal) just drop into the group; `src/routes/+layout.ts` prerenders the whole site (SvelteKit reads page options only from `+page.ts`/`+layout.ts`, not from `.svelte` files).

- **Navbar:** one component, `src/lib/components/site/SiteNav.svelte`, links from `links.ts` (Start, Blog, Stats, Kontakt). `variant="site"` on the (site) pages (theme toggle and the phone sheet are passed in as `actions`, so the homepage never ships them); `variant="night"` floats over the homepage night, rendered by `NightPage` with its section menu button as the action: the links and the button sit in one smoked-glass "dock" capsule (current page as a lit butter pill) so they read over the art. On phones the dock holds only the menu button. Its overlay leads with the site pages (Blog, Stats, Kontakt; Start is left out on the homepage) set large like the subpage phone menu, with the night's hours as a compact timeline under them. The Stats link has `rel="external"` until `src/routes/(site)/stats/+page.svelte` exists (detected at build time), so the prerender crawler does not fail on it.
- **Theme scope:** `layout.css` switches `html` background and `color-scheme` to the theme only while `[data-site-surface]` is in the page; everywhere else (homepage, error pages) the night wins, also after a client side navigation from a light page.
- **Posts:** `src/content/blog/<slug>.md` (mdsvex), frontmatter validated by `src/lib/blog/schema.ts` (an invalid post fails the build). `src/lib/blog/posts.remote.ts` has the prerendered `getPosts` / `getPost` remote functions (reading time from the raw Markdown); `content.ts` loads the rendered body as one lazy chunk per post. Drafts (`draft: true`) are only listed and built in dev.
- **Pages:** `/blog` (newest first, client side format filter mirrored to `?format=`), `/blog/[slug]` (video facade, summary, chapters that seek the player, takeaways, body, collapsible transcript, links). Post links always point to the post's own language; the root layout skips its hreflang alternates on post pages, which emit their own canonical and hreflang.
- **Video facade** (`src/lib/blog/VideoFacade.svelte`): self-hosted thumbnail via the cinema's `VideoThumbnail` (prerendered `/media/video-thumbnail/[id]/[width].[format]`: sharp crops YouTube's thumbnail to 16:9 at build time and encodes 480/768/1280 px AVIF + WebP, plus the 1280 px JPEG for the `<img>` fallback and `og:image`), consent step on click (`src/lib/components/site/YouTubeConsent.svelte`, shared with the home cinema: names YouTube/Google, links `/datenschutz#youtube`, nothing stored), youtube-nocookie iframe only after its button, chapter seeks (before consent they open the consent step and start at that time) via the IFrame API `postMessage` protocol (no API script). Without `youtubeId` the format's backlit silhouette vignette (`FormatVignette`, also on post cards) with a "video follows" note is shown and no `VideoObject` is emitted.
- **SEO:** `BlogPosting` (+ `VideoObject` with clips and transcript when a video exists) as one JSON-LD `@graph`, canonical, Open Graph, Twitter card.
- **Sitemap and robots:** `src/routes/sitemap.xml/+server.ts` (super-sitemap, prerendered) lists every page route automatically; `processPaths` adds the `/en` variants with hreflang alternates, lists each post only under its own language, and the legal pages only in German. `src/routes/robots.txt/+server.ts` points to it (staging disallows everything). A new parameterized route fails the build until it gets `paramValues` there.
- **Legal pages:** `/impressum` and `/datenschutz` render `src/content/legal/*.md` through `LegalPage.svelte`. Privacy selects `datenschutz.md` or `datenschutz.en.md` using Paraglide's URL locale, with matching content language, self canonical, hreflang and sitemap entries. The imprint remains German only: `/en/impressum` shows German text with the German canonical and no hreflang. Both privacy versions retain `#youtube` for the video consent step and `#social-media` for links from professional profiles.
- **Analytics:** Cloudflare Web Analytics (RUM) with automatic injection for the `solo-stack.dev` hostname, set in the dashboard, not in code: the zone injects the beacon into HTML responses and it reports to `/cdn-cgi/rum` on the same origin. No cookies; SPA navigations are counted. Staging and local are not measured. Never send `Cache-Control: no-transform` on HTML, it stops the injection.
- **RSS feeds:** one RSS 2.0 feed per language, `/blog/rss.xml` (German) and `/en/blog/rss.xml` (English), from one prerendered route `src/routes/(site)/blog/rss.xml/+server.ts` (the Paraglide reroute strips `/en`, as for the pages). `src/lib/blog/feed.ts` writes the XML by hand from `published()`: only posts in the feed's language, no drafts, newest first; title, link, guid, pubDate and the post's `description`; channel title and description are `blog_meta_title` / `blog_meta_description`. Discovery: `<link rel="alternate" type="application/rss+xml">` in the head of the blog index (its locale) and of each post (the post's language); the crawler builds both feeds from there. super-sitemap lists only `+page` routes, so the feeds stay out of the sitemap. On Cloudflare they are static files, so their Content-Type is set in `_headers`.
- **Markdown for agents:** every post also exists as Markdown at its page URL plus `.md` (`/blog/<slug>.md`, `/en/blog/<slug>.md`), from the prerendered route `src/routes/(site)/blog/[slug].md/+server.ts` and `src/lib/blog/markdown.server.ts`: frontmatter rebuilt from the validated fields (the source's YAML comments stay internal), then summary, chapters, takeaways, body, transcript, links and the generated note in the page's order, with section titles from the existing messages, so no new copy. Root-relative links become absolute. Discovery: `<link rel="alternate" type="text/markdown">` in each post's head (the crawler builds the files from there) and `/llms.txt` (`src/routes/llms.txt/+server.ts`), which lists every post's Markdown URL. Separate URLs rather than `Accept: text/markdown` negotiation, because Workers Cache keys on the path only. `_headers` serves `*.md` as `text/markdown` with `X-Robots-Tag: noindex`, so search engines keep indexing the HTML page. Cloudflare's own Markdown for Agents needs the Pro plan.
- **security.txt:** `src/routes/.well-known/security.txt/+server.ts` (RFC 9116, prerendered): business inbox and contact page as contacts; `Expires` is the build date plus 360 days, so every deploy renews it. Keep the dashboard's security.txt feature off.

## Contact page (built)

`/kontakt` (`src/routes/(site)/kontakt/+page.svelte`, code in `src/lib/contact/`) for business requests, collaborations and feedback. Linked from the navbar and both footers.

- **Form:** `sendContact` in `contact.remote.ts` is a remote `form` validated with `ContactSchema` (`schema.ts`), the same schema runs as `preflight` in the browser. Issue messages are codes (`name`, `email`, …); the page shows the localized `contact_error_*` message per field, because the remote endpoint URL has no locale. Note that Kit 3 namespaces field names (`name/<form id>`), so every input must come from `fields.x.as(…)`.
- **Prerendered:** the page is static like the rest of the site; only the submission runs in the Worker (`/_app/remote/…`). That needs JavaScript, which Turnstile needs anyway (a `<noscript>` note says so).
- **Spam:** Cloudflare Turnstile (managed widget, `appearance: interaction-only`, explicit render, script loaded only on this page; `TurnstileWidget.svelte`, `turnstile.ts`) plus a honeypot field (`website`; a filled one gets a fake success). The token goes into the bound `turnstile` field and is checked by `turnstile.server.ts` against Siteverify, including `action` and `hostname`. Tokens are single use, so the widget resets after every submission.
- **Keys:** outside the `staging`/`production` build modes the official always-pass test keys are used, so `pnpm dev` and `pnpm preview` work without setup. For deploys: create a widget (hostnames `solo-stack.dev`, `staging.solo-stack.dev`), paste the public site key into `SITE_KEY` in `src/lib/contact/turnstile.ts`, and put `TURNSTILE_SECRET_KEY` into `.env.staging` / `.env.production` (declared in `src/env.ts`, read via `$app/env/private`). A deploy build without the secret answers 503 and the form says "could not send".
- **Delivery:** `deliver.server.ts` mails each message via Cloudflare Email Sending (onboarded for `solo-stack.dev`), `send_email` binding `CONTACT_EMAIL` in every environment of `wrangler.jsonc`, pinned to sender `contact@solo-stack.dev` (no mailbox or routing rule needed: Email Sending authorizes the whole onboarded domain) and recipient `business@solo-stack.dev`. Email Routing forwards `business@` to the owner's private inbox, so that address lives only in the Cloudflare dashboard, never in this public repo. `Reply-To` is the visitor. `pnpm dev` simulates the binding and only prints the mail. A failed send answers 503 and logs the full message, so nothing is lost.
- **Copy:** `contact_*` and `site_nav_contact` messages, generated with `gpt-6.1-sol` (`docs/copy/contact-*`).
- **Night owl messenger** (`OwlMessenger.svelte`): the header art. A silhouette owl on a branch flush with the right viewport edge (`--owl` square canvas, sized in the page so its head clears the title; below 48rem it perches above the title), backlit by `backlight-wash.webp`. It blinks every 4–9 s (closed frame clipped to the eye patches), its eyes light up while someone is at the form, and on a successful send it takes off with the letter into the distance behind the title, leaving the empty branch (`owl-branch.webp`, derived by `docs/art/site/contact/tools/derive_branch.py`). Flight and branch art load only once the form is touched. Reduced motion: still owl, no blink or flight.

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

`/stats` (`src/routes/(site)/stats/`, components in `src/lib/stats/`) shows the numbers of all social profiles: live numbers from the collector Worker, with the mock as fallback.

- **Data contract:** `src/lib/stats/schema.ts` (valibot `StatsSchema`): daily series of `HISTORY_DAYS` entries (two of the longest period plus today) for followers per platform, YouTube views and watch time, and posts; plus the top YouTube videos with views per period. The UI only reads a parsed `Stats` object. `youtube.watchMinutes` is `null` while watch time is unavailable (no YouTube Analytics yet); the page then leaves out watch time and average view duration. Platforms missing from `platforms` show as "later".
- **Site side:** `getStats()` (`stats.remote.ts`) is a `query`; `/stats` sets `prerender = false` and `cache-control: public, max-age=600, s-maxage=3600` (`+page.ts`), so Workers Cache serves most views. `loadStats()` (`source.server.ts`) reads the KV snapshot `stats:v1` with `cacheTtl: 3600` (edge cache: page views rarely hit KV and never D1) and validates it; without a valid snapshot (no run yet, KV error, outdated shape) it returns `createMockStats()` (`mock.ts`, `source: 'mock'`, the page shows its notice), so the page never breaks.
- **Storage:** D1 (`DB`, see [Database](#database)) is the source of truth: one row per platform, metric and UTC day (`daily_metrics`), plus `videos` and `video_daily_views` (`src/lib/db/schema.ts`). Rows never expire. KV (`KV`) holds the finished snapshot `stats:v1`, the rotating OAuth token `stats:twitch-token` and, for legacy Instagram Login only, `stats:instagram-token`.
- **Collector:** a separate Worker, `workers/stats-collector/` (own `wrangler.jsonc` with `staging`/`production` envs and the same D1 and KV ids as the site; `@sveltejs/adapter-cloudflare` only emits a `fetch` handler). Its Workflow `StatsCollector` (`workflow.ts`) runs on `schedules` once a day (`17 23 * * *`, UTC, late in the day its rows belong to): one `step.do` per platform (own retries) fetches and upserts today's rows in one `db.batch` (multi-row `onConflictDoUpdate`, chunked to D1's 100 parameters per statement); a failing platform is logged and keeps its last good rows. The last step reads the last `HISTORY_DAYS` days from D1, builds `Stats` (`series.ts`, `source: 'live'`) and replaces `stats:v1` only if it validates. It reuses `#lib/db/schema.ts` and `#lib/stats/schema.ts`. Budget per run on the free plan: about 25 external subrequests (limit 50), a few hundred D1 row writes, 1 to 3 KV writes.
- **Platforms (live):**
  - YouTube Data API v3 with `YOUTUBE_API_KEY` (no OAuth): subscribers, lifetime channel views and every upload (title, duration, lifetime views, publish time; up to 250 uploads). Daily channel views (`views`) and per-video daily views (`video_daily_views.views`) are deltas against the latest lifetime total stored before today (`total_views` metric and column). The first sighting has no baseline; a video published after the previous run starts at 0. About 10 quota units per run (limit 10,000 per day). Watch time needs YouTube Analytics (OAuth), not wired.
  - GitHub REST (`solo-stack-dev`, no token): followers.
  - Bluesky public AppView (`getProfile`, `getAuthorFeed` without replies and reposts): followers and posts.
  - Twitch Helix `channels/followers` (total) with a user token from `pnpm stats:twitch-login` (authorization-code flow on `http://localhost:3000`, writes `stats:twitch-token` to the chosen environment's KV). The collector validates the token every run, refreshes it when needed and writes the rotated pair back. The broadcaster id is looked up by login (`socials.ts`).
  - Instagram API with Unified Login (`INSTAGRAM_ACCESS_TOKEN`, system-user token, `instagram_basic`): `followers_count` and media timestamps from `graph.facebook.com/v27.0/{INSTAGRAM_ACCOUNT_ID}`. The account ID is set in the collector's `wrangler.jsonc` vars for local, staging and production. `/me` identifies the system user, not the Instagram profile; `/me/assigned_instagram_accounts` lists the available accounts. Requests use a bearer header. Unified Login uses the configured secret directly, without the legacy Instagram refresh endpoint or KV token. The current Meta configuration selects no token expiry; revocation or moving the account to a different business portfolio still requires reconnecting. For an older app using Instagram Login, set `INSTAGRAM_ACCOUNT_ID` to an empty string: the collector uses `graph.instagram.com/me`, caches the 60-day token in `stats:instagram-token` and refreshes it weekly (once it is at least 24 hours old).
  - **Posts** per day are counted from YouTube uploads, Instagram media and Bluesky posts; each run rewrites the window's `posts` rows of a platform (deleted posts drop out).
  - Threads, TikTok, X, Facebook: no credentials, not in live data. Notes for Threads (next) in `platforms/threads.ts`; a new platform is one collector returning a `Reading`, listed in `COLLECTORS`.
- **History:** most APIs only return "now", so history starts with the first run. Before a platform's first row its follower series repeats the first value; a day without a row repeats the previous one. Views and posts count 0 on days without rows.
- **Local:** `pnpm db:migrate`, then `pnpm stats:dev` (collector in `wrangler dev` on port 8788, secrets from `.env`, state in the root `.wrangler/state`, so `pnpm dev`/`pnpm preview` read its snapshot) and `pnpm stats:run` in a second terminal (starts a run and prints the instance id; `GET http://127.0.0.1:8788/run?id=<id>` shows its status and result). The schedule does not fire locally. `pnpm stats:twitch-login` seeds the local Twitch token. `pnpm test` runs the unit tests of the pure parts (`series.test.ts`, `node --test`).
- **Design ("Sternwarte"):** no card grid. `Horizon.svelte` sets the total followers huge and draws the period as a moonlit ridge that ends on a cliff, with the painted moon (`hero-moon-disc`) rising behind it (`Ridge.svelte`, plain SVG with one turbulence filter, draws itself on load and on period change). The period switch shows moon phases. `Constellation.svelte` shows the platforms as stars on a planisphere disc (size = share of all followers) next to a ruled ledger with the exact numbers; hovering one lights the other. `YoutubeSection.svelte` is a ruled scoreboard, columns of light (`ViewsColumns.svelte`) and a ranked list; `ActivityCalendar.svelte` draws posting days as stars. Section headings sit on a butter pigment bloom (`making-bloom-chart`). Everything is plain SVG/HTML/CSS, no chart library; animations stop under `prefers-reduced-motion`.
- **Copy:** `stats_*` messages, generated with `gpt-6.1-sol` (`docs/copy/stats-*`).
- **Open:** YouTube Analytics (OAuth: watch time, exact daily views, backfill), Threads API, Facebook (Meta Graph, page token), TikTok Display API, X API (paid tier for follower counts).

### Stats collector setup (owner, once per environment)

Secrets live in the repo-root `.env.staging` / `.env.production` (keys in `.env.example`); the collector deploy uploads that file as its secrets, like the site deploy does.

1. **YouTube key:** in Google Cloud > Credentials the key needs _Application restrictions: None_ (a Worker has no fixed IP or referrer; keys restricted to HTTP referrers fail with `API_KEY_HTTP_REFERRER_BLOCKED`) and _API restrictions: YouTube Data API v3_, with that API enabled for the project.
2. **Instagram token:** use the existing `solo-stack-studio` app > Instagram > **API setup with Unified login** > Generate token for `solostack.dev`. New apps no longer offer the older Instagram Login setup. An `EA…` token is valid for Unified Login; its prefix alone does not mean it was generated incorrectly. Put it in `INSTAGRAM_ACCESS_TOKEN` in the three env files and configure the Instagram account ID (`17841419275290834` for `solostack.dev`) in the collector's vars for each environment. Verify `GET https://graph.facebook.com/v27.0/{INSTAGRAM_ACCOUNT_ID}?fields=id,username,followers_count` and `/{INSTAGRAM_ACCOUNT_ID}/media?fields=timestamp` with `Authorization: Bearer <token>`. Do not send this token to `graph.instagram.com` or run `ig_refresh_token` on it. See [Meta's Unified Login authentication documentation](https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-unified-login/authentication). No new Meta app or replacement Threads token is needed for this setup.
3. **Migrations:** `pnpm db:migrate:staging` (adds the `total_views` metric and column).
4. **Deploy the collector:** `pnpm stats:deploy:staging` (creates the Workflow `solo-stack-stats-collector-staging` with its schedule and uploads the secrets).
5. **Twitch login:** `pnpm stats:twitch-login --env staging`, open the printed URL, log in as the channel owner. This writes `stats:twitch-token` to the staging KV. Log in once per environment: each login creates its own token pair, so the environments never rotate each other's refresh token.
6. **First run:** wait for the next schedule (minute 17 of every sixth hour, UTC) or start one with `pnpm exec wrangler workflows trigger solo-stack-stats-collector-staging`, and check it with `pnpm exec wrangler workflows instances describe solo-stack-stats-collector-staging latest`. Unified Login reads the configured Instagram secret directly. Then deploy the site (`pnpm staging:deploy`) and open `/stats`.
7. **Production:** the same with `pnpm db:migrate:production`, `pnpm stats:deploy:production`, `pnpm stats:twitch-login --env production`, the Workflow `solo-stack-stats-collector`, and `pnpm production:deploy`.

When a token dies: for Twitch run the login again; for Instagram reconnect/generate a new token, replace it in the matching env file and redeploy the collector. Unified Login token lifetime depends on the Meta configuration and tokens can be revoked. Only legacy Instagram Login tokens expire after 60 days without refresh; a changed legacy secret replaces the KV copy.
