# Project: solo-stack.dev

The website for **Solo Stack**, a German YouTube channel by a software developer who builds his own apps and projects with heavy AI use. The channel covers project progress, hands-on AI model tests, AI news from a developer's perspective, and transparent insights into building a small business.

It is the home of the owner's personal brand and the hub for all social channels. The site has three jobs:

1. **Homepage:** a fun, memorable, unmistakably on-brand landing page for subscribers and potential future customers. It should feel like a small piece of craft, not a template: unique and playful, but still clean, readable, and fast.
2. **Contact for business:** a separate page with a form for brand deals, sponsorships and product placements, collaborations, and other business requests.
3. **Blog:** one article per YouTube video, generated automatically. Each post explains what happens in the video, summarizes it, and includes the transcript. The goal is discoverability (SEO) and a permanent, searchable home for the content.

**Performance boundary:** playful, never heavy. No full 3D scenes or WebGL worlds as the main experience (e.g. a walkable Three.js apartment). The site is a normal, well designed website first; every interactive extra is optional, lazy loaded, and small.

Domains: `solo-stack.dev` (production), `staging.solo-stack.dev` (staging).

## Audience

- **Primary:** German speaking developers and tech people who want to build their own apps or side projects with AI.
- **Secondary:** people following solo development and the business side of indie software, even without reading every line of code.
- **Later:** potential customers. Client work is unlikely right now, so no sales funnel yet.

## Brand

Full source of truth lives in the channel workspace, outside this repo: `D:\repos\Solo Stack\branding\` (start with `BRANDING.md`, `DESIGN-UND-THUMBNAILS.md`, and `final-branding-assets/`). Summary:

- **Colors:** warm **butter yellow** with **anthracite**; white and very light neutrals as support. No official hex values yet; derive them from the final assets and define them once as Tailwind theme tokens.
- **Material:** visible paper/pigment texture (watercolor like). The "Nachtstudio" banner shows yellow pigment paper on the left fading into an anthracite night with a glowing yellow moon, stars, and a laptop on a cliff.
- **Type:** bold, geometric sans serif for the wordmark "SOLO STACK". The site uses **Geist** (variable, self hosted in `static/fonts/`). Code in a readable monospace.
- **Tagline in the banner:** "AI · CODE · SIDE PROJECTS · BUSINESS".
- **Reference feel:** the clarity of the "Doppelter Espresso mit Torben Platzer" podcast channel combined with Chris Raroque's build in public style, with a stronger developer angle.
- **Person:** natural, professional expressions. No clickbait faces.

### Voice and copy rules

All visitor facing text is generated with `gpt-6.1-sol` (see [AGENTS.md](../AGENTS.md)). Prompts should ask for:

- **German** as the main publishing language (the channel is German, `de` is the base locale at unprefixed URLs). English is optional and lives under `/en/…`.
- Personal, direct, and approachable: explain why a technical change matters before how. Opinions backed by observations. Transparent about setbacks.
- Natural phrasing **without hyphens or dashes** in public profile style texts (e.g. "AI testen" instead of "AI-Tests").
- No invented facts, numbers, release dates, or promises. Only state what the video or the owner actually says.

## Links

- YouTube: https://www.youtube.com/@solostack_dev (main platform)
- GitHub: https://github.com/solo-stack-dev
- X: https://x.com/solostack_dev
- Instagram / Threads: `@solostack.dev`
- TikTok: `@solo_stack`
- Bluesky: https://bsky.app/profile/solo-stack.bsky.social
- Twitch: https://www.twitch.tv/solo_stack
- Discord: community server exists; the invite link may expire, so ask the owner before hardcoding one.

## Pages (planned)

- `/` Homepage: hero in the Nachtstudio style, latest videos, short about, links to socials, something playful (see ideas).
- `/kontakt` (name TBD) Business contact: form with request type (sponsoring/placement, collaboration, other), name, email, company, optional budget and timeframe, message. Submitted via a remote `form` function with valibot validation, spam protection (e.g. Cloudflare Turnstile), and delivery by email. No data stored longer than needed; covered in Datenschutz.
- `/blog` List of video posts, newest first, filterable by format (project progress, AI test, AI news, business).
- `/blog/[slug]` Video post: embedded video, summary, chapters, key takeaways, full transcript, links mentioned in the video.
- Legal pages required in Germany (Impressum, Datenschutz). Content comes from the owner, not from a model.
- `sitemap.xml`, `robots.txt`, RSS feed.

## Ideas (not decided)

These are suggestions to discuss, not tasks.

**Homepage**

- **Day to night scroll:** the page starts on bright pigment paper and scrolls into the anthracite night of the banner while the moon rises. Pure CSS scroll driven animations, no library.
- **Sun/moon theme toggle:** light mode is the yellow paper, dark mode is the Nachtstudio night. The moon itself is the switch.
- **Theme that follows the real sky (owner idea):** the homepage switches between paper day and Nachtstudio night on its own, based on the visitor's local time (or sunrise/sunset), with a striking transition. Risk: annoying if it overrides the visitor's choice. Possible middle ground: only the hero sky follows real time while the UI respects `prefers-color-scheme` and the manual toggle.
- **Tiny planet game (owner idea):** a small original 2D game in the night section, inspired by the feel of walking around tiny planets with radial gravity. A small avatar of the owner runs around the moon and hops on enemies (e.g. "bugs"). Canvas 2D, no 3D engine, loaded only on click, original characters and art.
- **Anime references (owner is a big anime fan):** subtle nods instead of fan art, e.g. videos as numbered "episodes", project series as "arcs", a "next episode" preview card, manga panel layouts, screentone or speed line textures, an opening style intro. Only original artwork, no copyrighted characters.
- **A tiny original game:** for example a physics free "stack the stack" toy where visitors drop blocks labeled with tools and languages to build their own tech stack, then share a screenshot of it. Load it only when the visitor interacts, render on a single canvas, keep it well under ~20 kB.
- **Paper grain everywhere:** one small tiled noise texture or an SVG `feTurbulence` filter instead of large images.
- **Live channel stats** (latest upload, video count) via a cached remote function.
- **Easter eggs:** Konami code, a terminal style `/uses` page, a console message for developers who open DevTools.
- **Page transitions** with the View Transitions API through SvelteKit's `onNavigate`, e.g. a video thumbnail morphing into the blog post header.

**Blog**

- Chapters with timestamp links that seek the embedded player.
- "Mentioned in this video" link list extracted from the transcript and description.
- Series pages that group videos about the same project, matching the channel idea that projects run across several videos.
- An English translation per post (also generated with `gpt-6.1-sol`) for reach beyond German speakers.

## Open decisions

- Exact color tokens and whether to use a display font besides Geist.
- Where generated posts live: committed Markdown files (recommended, see architecture) or a database.
- Whether a post is published automatically or after owner review.
- Which game or interactive element makes it onto the homepage.
- Whether light/dark switches automatically on the homepage, and how far the brand expands beyond yellow, anthracite, and the moon (e.g. stack motifs, anime references).
- Contact form: final route name, delivery channel (email provider), and which request types to offer.
