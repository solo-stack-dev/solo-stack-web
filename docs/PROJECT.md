# Project: solo-stack.dev

The website for **Solo Stack**, a German YouTube channel by a software developer who builds his own apps and projects with heavy AI use. The channel covers project progress, hands-on AI model tests, AI news from a developer's perspective, and transparent insights into building a small business.

It is the home of the owner's personal brand and the hub for all social channels. The site has three jobs:

1. **Homepage (top priority):** a unique, flashy, slightly over the top showpiece that is unmistakably on brand. It must never look like a generic AI or template design. The concept is decided: **"Eine Nacht im Studio"** (see below and [HANDOFF-HOMEPAGE.md](HANDOFF-HOMEPAGE.md)).
2. **Contact for business (later, simple):** a page with a form for sponsorships, product placements, collaborations, and other business requests.
3. **Blog (later, simple):** one article per YouTube video, generated automatically. Each post explains what happens in the video, summarizes it, and includes the transcript. The goal is discoverability (SEO) and a permanent, searchable home for the content.

**Performance stance:** important, but not at the cost of the experience. Pages are prerendered. The homepage may use rich SVG animation, painted raster art, audio, and individual Threlte (Three.js for Svelte) scenes, as long as heavy parts load lazily when they come into view, pause off screen, and every section has a beautiful static fallback for `prefers-reduced-motion`. Never a walkable 3D world as the whole site (e.g. a Three.js apartment you click through).

Domains: `solo-stack.dev` (production), `staging.solo-stack.dev` (staging).

## Audience

- **Primary:** German speaking developers and tech people who want to build their own apps or side projects with AI.
- **Secondary:** people following solo development and the business side of indie software, even without reading every line of code.
- **Also:** brands and companies looking for sponsorships or collaborations (served by the contact page). No sales funnel.

## Brand

Full source of truth lives in the channel workspace, outside this repo: `D:\repos\Solo Stack\branding\` (start with `BRANDING.md`, `DESIGN-UND-THUMBNAILS.md`, and `final-branding-assets/`). Summary:

- **Colors:** warm **butter yellow** with **anthracite**; warm off white paper as support. Starting tokens sampled from the banner: butter `#FCD772`, night `#18191B`. Define them once as Tailwind theme tokens (details in the handoff).
- **Material:** watercolor pigment paper, granulation, soft bleeding edges, ink linework. The "Nachtstudio" banner (yellow pigment paper fading into an anthracite night with a glowing moon, stars, and a laptop on a cliff) is the visual seed of the whole site.
- **Type:** bold geometric sans for the wordmark "SOLO STACK". The site uses **Geist** (variable, self hosted in `static/fonts/`); Geist Black for display, a monospace for clock labels and code.
- **Tagline in the banner:** "AI · CODE · SIDE PROJECTS · BUSINESS".
- **Reference feel:** the clarity of the "Doppelter Espresso mit Torben Platzer" podcast channel combined with Chris Raroque's build in public style, with a stronger developer angle.
- **Mood:** calm and premium at the core, cozier than the reference podcast. The homepage is allowed to be much flashier than the videos.
- **Person:** natural, professional expressions. No clickbait faces.
- **Mascot:** a painted chibi version of the owner (short dark hair, stubble, black tee, sometimes headphones). Approved style: the soft anime watercolor look of the "Nachtschicht" mockup, not the big head caricature of the first model sheet.

### Owner interests (for Easter eggs and brand texture)

Use as subtle nods with original artwork only, never copied characters, logos, or scenes.

- **Anime/manga:** Solo Leveling, Hunter x Hunter, Jujutsu Kaisen, Naruto Shippuden, Attack on Titan, One Punch Man, Bleach.
- **Games:** Elden Ring, Pokémon, Zelda, Monster Hunter, Black Myth: Wukong.
- **Other:** strength training, coffee, music (mostly sad rap) and podcasts.
- **Dev tools:** T3 Code, SvelteKit/Svelte, Drizzle ORM, Cloudflare, Postgres, AI models (a `/uses` page can grow from this).

### Voice and copy rules

All visitor facing text is generated with `gpt-6.1-sol` (see [AGENTS.md](../AGENTS.md)). This includes headlines like "Nachtschicht" or "Nachtradio" that appear in the mockups: they are placeholders until generated. Prompts should ask for:

- **German** as the main publishing language (the channel is German, `de` is the base locale at unprefixed URLs). English is optional and lives under `/en/…`.
- Personal, direct, and approachable: explain why a technical change matters before how. Opinions backed by observations. Transparent about setbacks.
- Natural phrasing **without hyphens or dashes** in public profile style texts (e.g. "AI testen" instead of "AI-Tests").
- No invented facts, numbers, release dates, or promises. Only state what the video or the owner actually says.

## Homepage: "Eine Nacht im Studio" (decided)

Scrolling the homepage is one night passing. Every section is an hour with a small monospace clock label, and the whole page is one continuous painted world: the sky darkens after the hero and brightens again toward the sunrise footer, which ends on the butter yellow paper where the banner begins. Full specs, assets, build approach, and the implementation plan are in [HANDOFF-HOMEPAGE.md](HANDOFF-HOMEPAGE.md). Mockups: [docs/mockups/round-2/index.html](mockups/round-2/index.html).

| Time  | Section                    | Decided direction                                                                                                                                                                                  | Reference mockup                                                         |
| ----- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| 20:00 | Hero: moonrise             | Huge painted moon, wordmark split light on night / dark on moon, mascot sitting on the moon's rim with a laptop, real portrait in a torn paper frame, shooting stars, clickable moon phases.       | `round-2/02-hero/05-painted-moon-desktop.png`, `06-…-mobile`, `07-…strip` |
| 21:00 | What I make                | One continuous ink line, scrubbed by scroll, morphs lightbulb → prompt → `</>` → phone → chart → moon over the cliff; each shape blooms with yellow pigment; the four pillars as a nav row.        | `round-2/03-what-i-make/01-ink-morph-desktop-context.png`, `02-storyboard-*` |
| 22:00 | Game (open)                | Not decided. Three playable prototypes get built: A moon planet (radial gravity, squash bugs), B stack to the moon (stack tool blocks), C constellation hunt (trace tool star signs, Svelte as the signature). The owner playtests them at `/lab/games` and picks. | `round-2/04-game/*`, seed for C: `round-2/03-what-i-make/04-constellations-desktop.png` |
| 01:00 | Night shift                | Painted desk scene from one fixed view: mascot coding with headphones, real git commits on the monitor, coffee steam, dumbbells, manga shelf, original handheld console, golden bonsai egg.       | `round-2/05-night-shift-radio/01-…`, `02-night-shift-bonsai-hover.png`    |
| 02:00 | Night radio                | Painted (not photoreal) vintage radio; social platforms are the stations and must be much more visible (logo preset keys, logo on the dial glass); own track plays, horizon becomes the waveform. | `round-2/05-night-shift-radio/06-…` to `11-…`                             |
| 04:00 | Latest video               | Open air cinema: the laptop on the cliff projects the newest video onto the night sky; YouTube iframe loads on click.                                                                             | `round-2/06-video-sunrise/01-…`, `02-…`, `03-…`                          |
| 06:00 | Sunrise footer             | Night melts into butter yellow paper, mascot walks off with the laptop, steaming coffee, footer links.                                                                                           | `round-2/06-video-sunrise/05-…`, `06-…`, `07-…`                          |
| ⌁     | Whole page flow            | Painted night throughout, sections blend into each other like one landscape.                                                                                                                     | `round-2/07-full-page/01-painted-night-lightbox-desktop.png`             |

**Easter eggs (decided, build after the main sections):** moon phase crescent slash, a mysterious presence on the full moon, Konami code "ARISE" ink shadows, golden bonsai, three stars forming triangles, a 1 in 4096 shiny golden mascot, DevTools console message with an ASCII moon and `arise()`, 404 as an ink void "domain expansion", 500 with a giant peeking over a wall, and later a hidden radio station. Mockups in `round-2/01-mascot-easter-eggs/`.

**Star signs / zodiac:** the owner likes the idea of the tools as constellations (Svelte as the signature sign) and wants it somewhere on the site even if the constellation game does not win, e.g. hidden constellations in the night sky, a zodiac wheel on `/uses`, or a dev horoscope.

**Rejected or parked:** round 1 HTML concepts (too generic), paper cut lightbox hero and "moon tear" hero (parked; the moon tear could return as a transition), isometric room, anime "next episode" video card (parked), automatic site wide theme switching by time of day (dropped in favor of the fixed night journey).

## Pages (planned)

- `/` Homepage as above.
- `/kontakt` (name TBD, later) Business contact: form with request type (sponsoring/placement, collaboration, other), name, email, company, optional budget and timeframe, message. Remote `form` function with valibot validation, spam protection (e.g. Cloudflare Turnstile), delivery by email. Styled with the same paper and night materials, but simple.
- `/blog` (later) List of video posts, newest first, filterable by format (project progress, AI test, AI news, business).
- `/blog/[slug]` (later) Video post: embedded video, summary, chapters, key takeaways, full transcript, links mentioned in the video.
- Custom 404 and 500 pages (see Easter eggs).
- Legal pages required in Germany (Impressum, Datenschutz). Content comes from the owner, not from a model.
- `sitemap.xml`, `robots.txt`, RSS feed.

## Ideas for later

**Blog**

- Chapters with timestamp links that seek the embedded player.
- "Mentioned in this video" link list extracted from the transcript and description.
- Series pages that group videos about the same project.
- An English translation per post (also generated with `gpt-6.1-sol`).
- Page transitions with the View Transitions API, e.g. a video thumbnail morphing into the blog post header.

**Site**

- A `/uses` page with the owner's tools, maybe as a constellation map that reuses the 22:00 section.
- A "dev horoscope" for the tech constellations (pre generated with `gpt-6.1-sol`, never at request time).
- Merch, Discord emojis, and thumbnail stickers from the mascot model sheet.

## Open decisions

- Final color tokens (starting values in the handoff) and whether the wordmark gets its own SVG logo instead of Geist Black.
- Which game ships at 22:00 (decided after playtesting the three prototypes), and where the star signs appear on the site, with which tools besides Svelte and how strictly official logos may be used.
- The music track for the night radio (owner generates it with their AI music tool) and the hidden station Easter egg.
- YouTube channel ID for the latest video feed, and whether the latest video updates via rebuild or a cached remote query.
- Whether an animation library (e.g. GSAP) may be added; the default is CSS plus small custom code.
- Blog: committed Markdown files (recommended) or a database; automatic publishing or owner review.
- Contact form: route name, email provider, request types.
