# Handoff: homepage "Eine Nacht im Studio"

This document is the complete brief for building the solo-stack.dev homepage. It was written at the end of the design phase (2026-11-01) for the next lead agent. Read it fully before starting, then read [PROJECT.md](PROJECT.md), [ARCHITECTURE.md](ARCHITECTURE.md), and [AGENTS.md](../AGENTS.md).

**You are the lead.** You do not build all of this yourself. Build the foundation, then run several subagents in parallel (art production and one implementation agent per section), and integrate their work. A single agent doing everything sequentially takes too long, and the owner explicitly wants parallel subagents.

---

## 0. TL;DR

- One page, scrolled like one night: **20:00 hero → 21:00 what I make → 22:00 game (open: three playable prototypes, owner playtests and picks) → 01:00 night shift → 02:00 night radio → 04:00 latest video → 06:00 sunrise footer.**
- Art direction: **painted night**, i.e. watercolor pigment paper, ink linework, butter yellow light, anthracite night. Everything blends into one continuous landscape. The owner rejected clean but generic "AI design". **The art is the product.**
- Mockups are the visual target: [docs/mockups/round-2/index.html](mockups/round-2/index.html) (starred images are the chosen ones). Mockups are flat images, so production needs **separate painted layers**, produced by image generation agents.
- Tech: SvelteKit 3 + Svelte 5, Tailwind 4, prerendered. **Threlte (`@threlte/core`, `@threlte/extras`, `three`) is approved** for the hero moon. Everything else is SVG, CSS, Canvas 2D, and Web Audio. Ask the owner before adding any other notable dependency (e.g. GSAP).
- **No visitor facing text from Claude.** All copy is generated with `gpt-6.1-sol` (`codex exec -m gpt-6.1-sol "…"`). Until then, use Paraglide message keys whose value is `TODO(copy): <intent>`.
- Phases: **0** foundation (you) → **1** art production (parallel art agents) → **2** section implementation plus **three game prototypes** (parallel worktree agents) → **playtest gate** (owner plays all three and picks) → **3** integration, transitions, copy, QA (you) → **4** Easter eggs and error pages (parallel) → **5** final QA and owner review.

---

## 1. Non negotiables

1. **Copy rule** ([AGENTS.md](../AGENTS.md)): any text a visitor can read (headlines, labels, tooltips, alt text, aria labels, button text, meta tags) comes from `gpt-6.1-sol`. Agents write code and `TODO(copy): …` placeholders only. Exceptions: proper names (SOLO STACK, platform names like "YouTube", tool names like "Svelte"), clock labels (`20:00`), and data pulled live from the owner's own sources (video titles, commit messages).
2. **Original art only.** Anime and game references are nods (shape, color, situation), never copied characters, logos, or scenes. No Nintendo, Pokémon, Elden Ring, or anime IP assets. The handheld console in the night shift must be an original design (the mockup's looks too much like a Nintendo Switch).
3. **Reduced motion:** every section has a designed static state for `prefers-reduced-motion: reduce`. It must still look finished and beautiful, not broken.
4. **Accessibility:** all content and links are reachable without the gimmicks (keyboard, screen reader). Interactive art always has a plain fallback (e.g. a real list of social links next to the radio, real links next to every playful element).
5. **Performance stance:** relaxed compared to the original docs, but disciplined: heavy parts lazy load when near the viewport, pause off screen, and never block first paint. Budgets in §8.
6. **Tooling:** pnpm only (5 day minimum release age for new packages), oxfmt/oxlint (tabs, single quotes, width 170), `#lib/*` imports, remote functions for data, valibot for validation, Paraglide for strings. `src/lib/paraglide` is generated.
7. **Deploys are owner only.** Do not run `staging:deploy` or `production:deploy`.
8. **Git:** work on a feature branch (suggested `feat/homepage-night`), never directly on `main`. Worktree subagents start from the parent's committed state, so the foundation must be committed before Phase 2. Confirm with the owner once at kickoff that you may commit to the feature branch.

---

## 2. Current state of the repo

- Scaffold only: `src/routes/+page.svelte` is the SvelteKit welcome page; `+layout.svelte` handles hreflang; `layout.css` loads Geist (`static/fonts/Geist-wght.woff2`) and Tailwind. `messages/de.json` is empty. `src/lib/assets/favicon.svg` exists.
- Installed: SvelteKit 3, Svelte 5, Tailwind 4, `@sveltejs/enhanced-img`, mdsvex, Paraglide, valibot, super-sitemap, adapter-cloudflare. **Threlte and three are not installed yet.**
- Docs: [PROJECT.md](PROJECT.md) (decisions), [ARCHITECTURE.md](ARCHITECTURE.md) (stack, conventions), this file.
- Mockups: round 1 is rejected (HTML concepts in `docs/mockups/01-…` to `04-…`, gallery `docs/mockups/index.html`, screenshots in `docs/mockups/screenshots/`); `docs/mockups/round-2/` (image mockups; `BRIEF.md` is the art brief used to make them; each subfolder has `README.md` with build notes and `PROMPTS.md` with exact prompts).
- Brand assets (outside the repo): `D:\repos\Solo Stack\branding\final-branding-assets\` (banner, profile photo, thumbnails).

---

## 3. Design system

### 3.1 Color tokens (starting values, refine against the art)

Sampled from the banner. Define in `src/routes/layout.css` via Tailwind 4 `@theme`:

| Token            | Value (start) | Use                                                       |
| ---------------- | ------------- | --------------------------------------------------------- |
| `--color-butter` | `#FCD772`     | Moon, light, primary accent, paper                        |
| `--color-ochre`  | ~`#E2A93B`    | Pigment blooms, granulation, hover (verify against art)   |
| `--color-cream`  | ~`#FBF3DD`    | Light text on night, paper highlights, wordmark "SOLO"    |
| `--color-night`  | `#18191B`     | Anthracite night, dark text, wordmark "STACK" on the moon |
| `--color-ink`    | ~`#0E0F10`    | Deepest shadows, ink lines on paper                       |
| `--color-dusk`   | ~`#2A2723`    | Warm transition tone between night and paper              |

Yellow is warm light, never neon. No pure black, no pure white.

### 3.2 Type

- Display/wordmark: Geist at weight 900, tight tracking, uppercase. If the owner supplies an SVG wordmark, use that instead (open question).
- Body: Geist 400/500.
- Clock labels, small labels, code, commit messages: a monospace (Geist Mono if self hosted, otherwise a system monospace stack). Clock labels look like `22:00`, small and tracked out.

### 3.3 Materials and recurring elements

- **Paper grain** over everything: one small tiled noise texture (AVIF/PNG, ≤ 30 kB) or an SVG `feTurbulence` filter, at low opacity, `pointer-events: none`, fixed or per section.
- **Watercolor edges** between sections: a few painted edge masks (PNG/WebP with alpha, used with CSS `mask-image`) so sections bleed into each other instead of meeting at straight lines.
- **Stars:** one shared, cheap star field (SVG or a single canvas) with twinkle; density and brightness vary per section.
- **Shooting stars:** occasional, random interval (8–20 s), CSS animated SVG streaks. Disabled in reduced motion.
- **Clock label component:** `<NightClock time="22:00" />`, same position logic in every section (top left of the section content area, as in the mockups).
- **Progress rail (optional):** small dots on the right edge showing the hours (seen in several mockups). Decide during integration.
- **Navigation:** minimal: wordmark top left, menu button top right (opens an overlay with sections and pages). The nav floats over the art and does not obscure it.

### 3.4 Mascot

- Painted chibi of the owner: short dark hair, light stubble, black tee (dark hoodie variant at night), white sneakers, friendly calm expression.
- **Style lock:** use `round-2/05-night-shift-radio/02-night-shift-bonsai-hover.png` as the style reference: soft anime watercolor, warm lamp light, ink outlines. **Do not** use the big head caricature of `round-2/01-mascot-easter-eggs/03-mascot-complete-model-sheet.png`.
- Phase 1 produces **model sheet v2** in that style, and all later art uses it as a reference image so the mascot stays consistent.

---

## 4. Page architecture

### 4.1 File structure (target)

```
src/routes/+page.svelte                  composes the sections, nothing else
src/routes/+page.ts                      export const prerender = true
src/routes/+error.svelte                 404 / 500 (Phase 4)
src/lib/home/
  NightPage.svelte                       global sky, grain, stars, scroll progress, nav
  shared/
    NightClock.svelte
    PaperGrain.svelte
    StarField.svelte
    ShootingStars.svelte
    SectionEdge.svelte                   watercolor mask transitions
    LazyMount.svelte                     mounts children (dynamic import) when near the viewport
    motion.svelte.ts                     reducedMotion state, inView action/attachment, scroll progress helpers, rAF loop that pauses off screen
    audio.svelte.ts                      shared AudioContext, created only on user gesture
  sections/
    hero/            (20:00)  Hero.svelte, MoonScene.svelte (Threlte, lazy), assets/
    making/          (21:00)  Making.svelte, paths.ts (precomputed morph paths), assets/
    game/            (22:00)  Game.svelte (section shell: poster, play button, mounts the chosen game lazily)
      moon-planet/            candidate A (Threlte)
      stack-to-moon/          candidate B (Canvas 2D or Threlte)
      constellations/         candidate C (SVG/Canvas 2D)
      shared/                 input (keyboard/touch), score, pause/off screen handling, high score storage
    night-shift/     (01:00)  NightShift.svelte, assets/
    radio/           (02:00)  Radio.svelte, assets/, track/
    cinema/          (04:00)  Cinema.svelte, assets/
    sunrise/         (06:00)  Sunrise.svelte, assets/
  eggs/                                   Easter eggs (Phase 4), each self contained
  data/
    youtube.remote.ts                     latest video (prerender or query)
    github.remote.ts                      latest commits for the night shift monitor
    socials.ts                            platform list (name, url, handle, icon)
```

Each section is a self contained folder. Section agents own only their folder plus their message keys. That is what makes parallel work possible.

### 4.2 The night as one scroll

- `NightPage.svelte` exposes a page scroll progress (0 at the hero, 1 at the footer) through a CSS custom property `--night` on the root, updated by a scroll driven animation (`animation-timeline: scroll()`) where supported and a passive, rAF throttled scroll listener as fallback.
- The base sky color is a function of `--night`: dusky warm at 20:00, deepest anthracite around 01:00–02:00, warming at 04:00, butter paper at 06:00. Sections paint on top of that base, so there are no visible seams.
- Sections overlap slightly (negative margins plus watercolor `mask-image` edges) so the landscape flows. Reference for the flow: `round-2/07-full-page/01-painted-night-lightbox-desktop.png` and `round-2/06-video-sunrise/07-night-to-sunrise-mid-scroll.png`.
- Sections that need pinning (21:00) use `position: sticky` inside a taller wrapper, not scroll hijacking. Native scrolling always works.

### 4.3 Lazy loading rules

- Hero: the painted moon image and the wordmark render immediately (LCP). The Threlte moon replaces or enhances the painted image after hydration and idle (`requestIdleCallback`), only if WebGL is available and motion is allowed.
- Everything below the fold mounts its heavy parts through `LazyMount` (IntersectionObserver with roughly a one viewport `rootMargin`), using dynamic `import()` so Threlte, audio, and large logic are separate chunks.
- All loops (rAF, audio analysis, Threlte render) stop when the section leaves the viewport or the tab is hidden. With Threlte, use `renderMode: 'on-demand'` or stop the task scheduler when not visible.

### 4.4 Strings

- All text through Paraglide: `messages/de.json` (and `en.json` later). Key prefix per section: `home_hero_*`, `home_making_*`, `home_game_*` (candidates: `home_game_moon_*`, `home_game_stack_*`, `home_game_stars_*`), `home_nightshift_*`, `home_radio_*`, `home_cinema_*`, `home_sunrise_*`, `home_nav_*`, `error_*`, `egg_*`.
- Placeholder values: `"home_radio_title": "TODO(copy): headline for the night radio section, short, cozy, about music and where to follow"`. The intent text is a brief for `gpt-6.1-sol`, not copy.
- In Phase 3 the lead generates all copy in one batch with `gpt-6.1-sol`, following the copy rules in [PROJECT.md](PROJECT.md#voice-and-copy-rules), then reviews it with the owner.

### 4.5 Data

- **Latest video:** YouTube channel RSS (`https://www.youtube.com/feeds/videos.xml?channel_id=<ID>`, no API key) parsed in a remote function. Default: `prerender` (refreshed on each build, e.g. by a scheduled rebuild). Alternative: `query` with `Cache-Control` for freshness. Validate with valibot. Needs the channel ID from the owner. Fallback: a static entry in `socials.ts`.
- **Commits for the night shift monitor:** recent public commits of `github.com/solo-stack-dev` via the GitHub REST API (public events or the commits of selected repos), in a remote function with caching. Prerendered by default. Fallback: a few static lines. Only show real commit messages and never invent any.
- **Socials:** static list in `src/lib/home/data/socials.ts` (URLs in [PROJECT.md](PROJECT.md#links)). Discord invite: ask the owner.

---

## 5. Section specs

Every spec lists the reference mockups, behavior, build approach, required art layers, mobile behavior, reduced motion state, and acceptance criteria. Paths are relative to `docs/mockups/round-2/`.

### 5.1 20:00 Hero: moonrise

**References:** `02-hero/05-painted-moon-desktop.png` (main), `02-hero/06-painted-moon-mobile.png`, `02-hero/07-painted-moon-phase-strip.png`. Ignore the mockup's mascot style (style lock §3.4).

**Composition:** night sky on the left with painted clouds and stars; a huge painted moon on the right, partly off screen; the wordmark across the middle, **"SOLO" in cream over the night and "STACK" in night anthracite over the moon** (the letters change color exactly where they cross the moon's edge); the mascot sitting on the moon's upper rim with a glowing laptop; clock `20:00` top left; a scroll cue at the bottom.

**Behavior:**

- On load, a short moonrise: the moon eases up 5–10 % and brightens, stars fade in, then the wordmark settles. Under 1.5 s, never blocks reading.
- The moon slowly rotates (Threlte) with a soft rim glow. Subtle parallax on pointer move (a few px per layer) and on scroll.
- **Moon phases:** clicking the moon cycles full → waning gibbous → half → crescent → new → back. In 3D this is just the light direction, which is why Threlte is worth it here. The crescent triggers the "crescent slash" egg (Phase 4). The moon is a real `<button>` with an aria label.
- The mascot: idle loop (laptop glow flicker, occasional blink, maybe a small head turn when a shooting star passes).
- Shooting stars occasionally.

**Build:**

- Moon: Threlte `Canvas` with a sphere, a painted equirectangular moon texture (generated in Phase 1, watercolor craters as pigment blooms), and a custom or toon material that keeps the watercolor look. One directional light controls the phase. A soft glow sprite or post effect provides the halo. Fallback before hydration and for reduced motion or no WebGL: the painted moon image layer, which has the same position and size.
- Wordmark color split: render the wordmark twice, cream and night, and clip the night copy to the moon's circle (`clip-path: circle(...)`) whose geometry is shared with the moon layout. Keep the moon at a fixed layout position per breakpoint so the clip always matches.
- Layers: sky plate, cloud layers (2–3), star field (shared), painted moon fallback, moon texture for 3D, mascot on the rim (transparent).

**Mobile:** follow `06-painted-moon-mobile.png`: moon at the top right, wordmark stacked, mascot smaller. The 3D moon may be replaced by the painted image on low end devices (check `navigator.hardwareConcurrency` and `deviceMemory`, or simply use the image below a width threshold).

**Reduced motion:** static painted composition, no rotation or moonrise; phases still clickable but switch instantly.

**Acceptance:** LCP element is the wordmark or the painted moon image (not the canvas); no layout shift when the 3D moon takes over; wordmark split is pixel accurate at all breakpoints; Threlte chunk is not in the initial JS.

### 5.2 21:00 What I make

**References:** `03-what-i-make/01-ink-morph-desktop-context.png` (main), `02-storyboard-01-lightbulb.png` … `02-storyboard-06-moon.png`, `03-ink-morph-mobile.png`.

**Composition:** a dark painted sky with yellow pigment clouds bleeding in from the top left; **one continuous hand drawn ink line** (cream/butter stroke) that enters from the left edge, forms the current shape in the center, and leaves to the right, ending at the moon above the cliff with the laptop (the banner's motif); the shape's interior blooms with yellow watercolor; the current pillar title below the shape; a row `AI · CODE · SIDE PROJECTS · BUSINESS` at the bottom with the active one underlined; dots and a scroll cue at the bottom right.

**Behavior:** the section is pinned (`position: sticky`) for roughly 5–6 viewport heights. Scroll progress morphs the line through six states: lightbulb (idea) → chat bubble/prompt (AI) → `</>` (code) → phone with an app (side projects) → rising chart (business) → the moon over the cliff (leads into the next hour). Each state: the line morphs, then the watercolor fill blooms inside and the title changes. Clicking a pillar in the bottom row scrolls to that state.

**Build:**

- Draw the six shapes as SVG paths with **identical command structure** (same number of cubic segments). Either author them that way, or write a small build time script (Node, no new dependency) that resamples each path to N points (`getPointAtLength` equivalent via a path parsing helper, or author points directly) and stores them in `paths.ts`. Interpolate between neighboring states on scroll in a rAF loop. Do not animate the CSS `d` property (Safari).
- Line entry and exit segments are part of the same path, so it reads as one line.
- Ink texture on the stroke: an SVG filter (slight `feTurbulence` + `feDisplacementMap`) or a textured stroke image mask. Keep it subtle and cheap.
- Watercolor fills: one painted bloom texture per shape (Phase 1 art), masked by the shape path, fading and scaling in.
- Background: painted night plate with the pigment cloud and the cliff with laptop and moon (Phase 1 art), aligned with the line's end point.

**Mobile:** `03-ink-morph-mobile.png`: the line runs vertically, the shape is centered, the pillar row becomes a compact indicator.

**Reduced motion:** no pinning; show the four pillars (plus the start and end states) as a static vertical sequence of drawn shapes with fills.

**Acceptance:** smooth at 60 fps on a mid range laptop; scrolling back reverses cleanly; no scroll jacking; pillar row is real buttons and links.

### 5.3 22:00 Game (open: build three prototypes, the owner playtests and picks)

The game is **not decided**. A game has to be played to judge, so build **three playable prototypes**. The owner plays them, then picks one (or asks for changes). Only the winner gets final art and goes on the homepage. Static mockups exist for A and B. C uses the constellation mockup as its seed.

**Shared for all three:**

- The section shell `Game.svelte` shows a painted poster state with a play button. The game code loads only on click (dynamic import) and pauses off screen, in hidden tabs, and on a pause button.
- Controls: keyboard (arrows/A D, Space) and touch (on screen buttons or gestures). Each game is playable in 30–90 seconds per round and has an instant restart.
- Score and local high score in monospace (`localStorage`). No accounts, no network.
- The mascot as the player character where relevant (placeholder sprite until model sheet v2 art exists).
- Same night palette, paper grain, and ink line style as the rest of the page. In the prototype phase, programmer art in the palette is fine. **Game feel comes first**: responsive controls, juice (squash and stretch, particles, screen shake light), sound optional and off by default.
- Reduced motion: the poster stays, and play is still allowed on explicit click (motion is user initiated). Offer a calmer mode if a game is very shaky.
- Original mechanics and art only. Nothing may resemble an existing game's characters, levels, or assets.

**Playtest lab:** a route `/lab/games` (prerendered, `noindex`, not linked from the site, excluded from the sitemap) that shows all three games side by side or with tabs, each in the real section frame, plus small debug controls for tuning (gravity, speed, spawn rate, tower sway) so the owner can feel the variants. Remove or protect the route before launch.

#### Candidate A: Moon planet

**References:** `04-game/01-moon-planet-idle-desktop.png`, `02-…orbit-stomp…`, `03-…rare-boss…`, `04-…mobile-touch.png` (ignore the glossy 3D mascot style; use the painted mascot).

- The mascot runs around a small moon with **radial gravity**, always upright relative to the surface; jump pushes away from the center, gravity pulls back.
- **Bugs** (little beetles with glowing yellow eyes) crawl around the surface; land on them to squash them, touching them from the side costs a life.
- Stars float in orbit; collecting them "ships features" (score). A rare boss bug appears after N squashes.
- Build: Threlte with toon/watercolor shading (a painted 3D mini world) **or** Canvas 2D first if faster to prototype; the owner judges the feel, not the renderer. If it wins, the final version uses Threlte.

#### Candidate B: Stack to the moon

**References:** `04-game/05-stack-to-moon-idle-desktop.png`, `06-…midgame…`, `07-…near-collapse…`, `08-…reached-moon…`, `09-…mobile-touch.png`.

- Paper blocks labeled with the owner's tools (SvelteKit, Drizzle, Cloudflare, Postgres, T3 Code, AI, …) swing or slide in above the tower; tap or press to drop. Misaligned overhangs get cut off (the block gets narrower) or make the tower sway.
- The camera rises with the tower toward the moon. Reaching the moon unfolds a paper bridge and triggers a celebration; then an endless mode continues past the moon.
- Near collapse moments need visible wobble (light physics or a fake sway model).
- Build: Canvas 2D (or Threlte if it adds a lot). Keep blocks as tactile watercolor paper.

#### Candidate C: Constellation hunt (star signs / tech zodiac)

**Reference:** `03-what-i-make/04-constellations-desktop.png` (style seed). The owner likes the star sign / zodiac idea in general; even if it does not win as the game, it may appear elsewhere on the site (see below).

- The sky is full of faint stars. Hidden in it are **constellations shaped like the owner's tools and interests**: **Svelte as the signature sign**, plus candidates like Cloudflare (cloud), Drizzle (droplet), Postgres (elephant), T3 Code, an AI sparkle, a coffee cup, a dumbbell, the crescent moon.
- Make it a game, not just a toy: a round shows one constellation's name or silhouette hint, and the player traces it by connecting the right stars before a timer runs out (decoy stars, increasing difficulty), or a free exploration mode where finding signs fills a zodiac wheel. Prototype both modes quickly and let the owner choose.
- A completed sign lights up, fills with soft watercolor, and unfolds a paper note card (as in the mockup) with a short line and a link.
- Build: SVG or Canvas 2D. Star positions per sign are precomputed by sampling the tool's logo outline into 6–14 points (small build time script), hand tuned to read as constellations. Same ink stroke style as 21:00.
- Logos: the Svelte logo may be used as the shape reference (fan use, follow Svelte's guidance). Other brands as stylized allusions (a cloud, a droplet, an elephant) unless the owner decides otherwise.

**Star signs beyond the game:** independent of which game wins, the owner wants the star sign / zodiac idea to appear somewhere on the site. Options to propose at the playtest gate: a few faint tool constellations hidden in the shared star field across the whole night (discoverable, tie in with the "three stars" egg), a zodiac wheel on a future `/uses` page, or a pre generated "dev horoscope".

**After the pick:** the winner gets a final art pass (Phase 1 style art agent with model sheet v2), polish, and integration. The other prototypes stay in the lab branch (not shipped) in case the owner wants to switch later.

**Acceptance for the prototypes:** all three playable on desktop (keyboard and mouse) and on a phone (touch) at `/lab/games`; stable 60 fps on a mid range laptop; restart in one click; debug sliders for the main tuning values; no console errors.

### 5.4 01:00 Night shift

**References:** `05-night-shift-radio/01-night-shift-desktop.png`, `02-night-shift-bonsai-hover.png` (style reference for everything), `03-night-shift-console-hover.png`, `04-night-shift-mobile.png`.

**Composition:** one fixed view of a cozy room at night: window with the moon and trees, desk lamp, the mascot in a black sweater with headphones typing, a monitor with a terminal, coffee mug with steam, an original handheld console, notebook, dumbbells on the floor, a shelf with manga volumes (generic spines), plants, and a small bonsai.

**Behavior:**

- **Live monitor:** the terminal shows real recent commit messages (from `github.remote.ts`), typed out character by character in a loop (`git log --oneline` style, short hashes). The monitor content is live HTML positioned over the painted screen (with a slight perspective transform to match), not baked into the image.
- **Hotspots:** bonsai, handheld, dumbbells, coffee, manga shelf, window/moon. Hover or focus shows a small tooltip (copy via `gpt-6.1-sol`) and a subtle highlight (glow or outline). Bonsai hover is the **golden tree egg** (the canopy glows and grows, gold particles).
- **Life:** steam rising (looping SVG/CSS), lamp light flicker (very subtle), mascot typing (2–3 frame sprite or masked hand layers), occasional glance to the window, the moon slowly moving in the window as you scroll.
- Gentle pointer parallax across 3–4 depth layers.

**Build:** layered raster art (AVIF/WebP via `@sveltejs/enhanced-img`): background room plate, window plate, desk and props, mascot (separate, with frames for typing), foreground. Hotspots as absolutely positioned buttons in a container that keeps the art's aspect ratio (use `aspect-ratio` and percentage positions). No Threlte.

**Mobile:** `04-night-shift-mobile.png`: a portrait crop centered on the mascot and monitor; hotspots become tap targets with a small "tap to explore" hint; the monitor still types.

**Reduced motion:** static scene, monitor shows the final lines, hotspots still work without animation.

**Acceptance:** the art never distorts; hotspots line up at all breakpoints; real commits shown (or the static fallback); the handheld design is original.

### 5.5 02:00 Night radio (music + socials)

**References:** `05-night-shift-radio/06-night-radio-desktop-idle.png`, `07-night-radio-desktop-youtube.png`, `08-night-radio-desktop-playing.png`, mobile `09`–`11`.

**Owner feedback to fix:** the social platforms are **not present enough**, and the mockup radio is **too photorealistic**. It must be painted in the same watercolor style as the rest.

**Composition:** a painted vintage radio on the cliff at night, the moon top right, hills and lake behind; the horizon line behind the radio is where the waveform lives.

**Making the socials prominent (required):**

1. **Preset keys:** a row of big physical preset keys on the radio, one per platform, each carrying the platform's **real logo** (from Simple Icons, CC0 SVGs, respecting each platform's brand guidelines) printed like an old label. Pressing a key tunes to that station.
2. **Dial glass:** the active station's logo appears large and glowing on the dial glass, with the platform name and handle.
3. **Display strip:** shows `@handle` plus a clear follow/open button (real link).
4. **Station content:** each station can show something live or static: YouTube → latest video title, GitHub → latest repo/commit, Twitch → channel link, etc. Keep it simple at first.
5. A plain accessible list of all social links (visually integrated, e.g. as the radio's printed frequency chart) so the links work without the radio interaction.

**Music:**

- One station (e.g. "Solo Stack FM") plays the owner's own track (lo fi / sad rap, the owner generates it with their AI music tool and supplies the file). Placeholder until then: no audio, the station shows "coming soon" style placeholder copy.
- Audio never autoplays; it starts only on a click, with a clear pause control and volume. Load the audio file only after the first interaction (`preload="none"`, AAC/Opus, ≤ 4 MB).
- **Waveform horizon:** while playing, a Web Audio `AnalyserNode` drives a glowing waveform along the horizon (Canvas 2D or SVG path), and the stars pulse slightly with the beat (CSS variable from RMS). When idle, the horizon shows a slow, quiet wave.
- Tuning between stations plays a short burst of static generated with Web Audio (noise buffer), no extra file.

**Later (not now):** a hidden station between two presets (e.g. tuning the dial to a special frequency) as an Easter egg. Leave a `TODO(egg)` hook.

**Build:** radio as layered art (body, dial glass, needle, keys separately so they can move); needle and keys animated with CSS transforms; dial is a real slider (`input type=range` styled, or a custom ARIA slider) plus the preset buttons.

**Reduced motion:** no needle sweep or star pulse; waveform static; all links visible.

**Acceptance:** every platform is recognizable at a glance without interacting; keyboard operable; no audio without a click; audio pauses when the section leaves the viewport (or keeps playing with a mini player, decide during integration).

### 5.6 04:00 Latest video: open air cinema

**References:** `06-video-sunrise/01-video-cinema-desktop-facade.png` (main), `02-video-cinema-desktop-playing.png`, `03-video-cinema-mobile-facade.png`.

**Composition:** the cliff on the left, the mascot sitting next to the open laptop, a cone of warm projector light from the laptop to a big painted, glowing frame in the sky that shows the latest video; the moon top left; hills, forest, and a lake with village lights below.

**Behavior:**

- Facade: the latest video thumbnail inside the painted frame with a moon shaped play button; title (the real YouTube title) and a small link below.
- Click: the frame swaps to a `youtube-nocookie.com` iframe with autoplay (the click counts as a user gesture). The beam brightens slightly while playing.
- Dust particles drift in the beam (a few CSS or Canvas particles).

**Build:** layered art (sky, landscape, cliff, mascot, laptop), CSS beam (`conic-gradient` or a painted beam layer with `mix-blend-mode: screen`), the frame as a painted border image with the iframe or thumbnail inside at a fixed aspect ratio. Data from `youtube.remote.ts`.

**Mobile:** `03-video-cinema-mobile-facade.png`: the frame on top, the cliff with the mascot below, the beam vertical.

**Reduced motion:** no particles, no beam animation.

**Acceptance:** no YouTube request before the click; correct latest video after a rebuild; the iframe keeps a 16:9 aspect ratio and is responsive.

### 5.7 06:00 Sunrise footer

**References:** `06-video-sunrise/05-sunrise-footer-desktop.png`, `06-sunrise-footer-mobile.png`, `07-night-to-sunrise-mid-scroll.png`.

**Composition:** the night sky retreats upward as a ragged watercolor edge with the last stars, revealing butter yellow pigment paper; a misty valley with the rising sun; a steaming coffee cup on a rock with a closed laptop lying next to it (the shift is over; no mascot); the wordmark bottom left with the owner's real photo (from `profil-buttergelb.png`) next to it as an anthracite ink print on the butter paper; footer links (Impressum, Datenschutz, Kontakt) and social icons bottom right; clock `06:00`.

**Behavior:** the night to day transition is scroll driven (`07-night-to-sunrise-mid-scroll.png` is the midpoint): the watercolor edge moves up, the sky color shifts via `--night`, the sun rises a little.

**Build:** painted layers (night edge mask, paper sky, valley, cliff path, coffee, closed laptop), scroll driven CSS animations with JS fallback.

**Reduced motion:** final sunrise state, static.

**Acceptance:** all legal links present and plain; the page visibly ends where the banner starts (butter paper); no dead space below the footer.

### 5.8 Easter eggs and error pages (Phase 4)

References in `01-mascot-easter-eggs/` (mascot style there is outdated; use model sheet v2).

| Egg                  | Trigger                                               | Effect                                                                                          | Mockup                                      |
| -------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------- |
| Crescent slash       | Moon phase reaches the crescent (hero)                | A black ink crescent shaped slash sweeps across the sky with ink droplets                       | `04-egg-crescent-slash-desktop.png`         |
| Presence on the moon | Click the full moon ~10 times                         | A faint, ambiguous giant silhouette appears on the moon for a moment                            | `05-egg-moon-presence-desktop.png`          |
| ARISE                | Konami code anywhere                                  | Ink shadow figures rise from the cliff behind the mascot, then dissolve                         | `06-egg-arise-shadows-desktop.png`          |
| Golden tree          | Hover or focus the bonsai (01:00)                     | The bonsai glows gold and its canopy grows into a luminous tree                                 | `09-…`, `12-…`                              |
| Three stars          | Rare at random in the star field, or a game milestone | Three stars align into stacked triangles for a moment                                           | `10-egg-three-stars-desktop.png`            |
| Shiny mascot         | 1 in 4096 page loads                                  | The mascot appears in a golden variant everywhere on the page, with a tiny sparkle              | model sheet v2 (golden variant)             |
| Console              | Opening DevTools                                      | ASCII moon, a short message (copy via sol), and a hidden `arise()` function that triggers ARISE | `11-egg-devtools-arise-console-desktop.png` |
| 404                  | Unknown route                                         | Replaced 2026-11-01: Hunter x Hunter World Tree at sunrise (`src/lib/errors/WorldTree.svelte`)  | `07-error-404-ink-void-desktop.png`         |
| 500                  | Server error                                          | A huge faceless giant peeks over a wall at the studio                                           | `08-error-500-giant-at-wall-desktop.png`    |
| Hidden radio station | Later                                                 | Secret station on the dial                                                                      | to be designed                              |

All eggs are lazy (dynamic import on trigger), harmless, and disabled or reduced in reduced motion. Copy for eggs comes from `gpt-6.1-sol`.

---

## 6. Art production pipeline (Phase 1)

The mockups are single flat images with baked in placeholder text. Production needs **clean, separate layers** in one consistent style.

### 6.1 Who and how

- Art agents: **GPT‑6 Astra** (`codex` provider, model `gpt-6-astra`, `reasoningEffort: high`) through T3 `delegate_task`, using its built in image generation at the highest quality. This is how the round-2 mockups were made. Brief template in §10.2.
- Every art agent receives: the style lock references (§3.4, plus the chosen section mockup), model sheet v2 (once it exists), the color tokens, and its exact layer list.
- Images must not contain text (all text is live HTML). Ask for transparent backgrounds for cutouts where the tool supports it. Otherwise use a flat, contrasting background and cut out with a local, dependency free approach, or ask the owner before installing a background removal tool.

### 6.2 Order

1. **Mascot model sheet v2** first (blocks everything with the mascot): front, side, back, three quarter; expressions; poses needed by sections: sitting on the moon rim with laptop (hero), typing at the desk with headphones (night shift, 2–3 frames), sitting on the cliff next to the laptop (cinema), walking with the laptop (sunrise, 4 frame cycle), lost in the void (404), golden shiny variant, dark hoodie variant. Owner approves before continuing (show it in chat).
2. **Game art is deferred.** The three game prototypes (§5.3) use programmer art in the palette plus placeholder mascot sprites. Only the game the owner picks after playtesting gets a production art pass (after the playtest gate). Optional: one quick mockup of candidate C (constellation hunt) so it has a visual target like A and B.
3. **Section layers** (parallel, one art agent per section or per two sections), with the mascot taken from model sheet v2.

### 6.3 Layer lists per section

- **Hero:** sky plate without moon and text (2560×1440 plus a mobile 1080×2340 crop); 2–3 cloud layers (transparent); painted moon disc (transparent, square, 2048 px) as the fallback; moon equirectangular texture (4096×2048, seamless horizontally) for 3D; mascot on the moon rim (transparent).
- **Making:** night plate with the pigment cloud at the top left and the cliff + laptop + moon at the right edge (no line, no shape, no text); six watercolor bloom fills (transparent, roughly square), one per state.
- **Game (after the pick only):** A moon planet: painted moon texture or sprites, bug sprites (idle, walk, squashed), boss bug, star pickup, mascot run/jump/land frames. B stack to the moon: paper block textures (blank, labels in code), sky gradient plates for the climb, moon bridge, mascot cheer frames. C constellation hunt: deep night plate, paper note card texture, zodiac wheel ornament (stars and lines are code).
- **Night shift:** room background plate (no mascot, no screen content), window plate (sky, moon, trees) if separable, desk and props layer, mascot typing frames (transparent), bonsai normal and golden states, handheld (original design), foreground elements for parallax. Mobile crop variants.
- **Radio:** painted radio body (transparent) with an empty dial glass, needle (transparent), preset key (one blank key style; logos are added in code), landscape plate with an empty horizon band, moon.
- **Cinema:** night landscape plate (no frame, no beam), cliff with laptop (transparent), mascot sitting (transparent), painted screen frame border (transparent center), optional beam texture.
- **Sunrise:** paper sunrise sky plate, retreating night edge mask (alpha), valley plate, cliff path, coffee cup (transparent), closed laptop (transparent).
- **Shared:** paper grain tile, 2–3 watercolor edge masks, a few star sprites, shooting star streak, torn paper edge.
- **Eggs and errors:** per §5.8, with model sheet v2.

### 6.4 Asset conventions

- Masters (PNG) go to `docs/art/<section>/` or another folder outside the bundle (decide in Phase 0; large masters must not end up in `static/` unoptimized). Optimized imports live in `src/lib/home/sections/<section>/assets/` and are consumed via `@sveltejs/enhanced-img` (`<enhanced:img>` generates AVIF/WebP and responsive sizes).
- Naming: `<section>-<layer>[-mobile][@frame].png`, e.g. `hero-moon-disc.png`, `nightshift-mascot-typing@2.png`.
- Every art folder has `PROMPTS.md` (exact prompts plus reference images) and `README.md` (layer list, intended positions and sizes).
- Budget: hero above the fold ≤ ~250 kB of AVIF total for desktop; each section's initial images ≤ ~400 kB; mascot frames as one sprite sheet per animation.

---

## 7. Execution plan with subagents

### Phase 0: foundation (lead, sequential, roughly half a day of agent time)

1. Create the branch `feat/homepage-night` (confirm commits with the owner once).
2. Install Threlte and three (approved): `pnpm add -D @threlte/core @threlte/extras three @types/three` (check the 5 day release age policy; pin compatible versions with Svelte 5).
3. Design tokens and base styles in `layout.css` (§3), `+page.ts` with `prerender = true`.
4. `src/lib/home/` skeleton (§4.1): `NightPage`, `NightClock`, `PaperGrain`, `StarField`, `ShootingStars`, `SectionEdge`, `LazyMount`, `motion.svelte.ts`, `audio.svelte.ts`, `socials.ts`, and empty section components with placeholder heights, labels, and the correct `--night` progression, so the page already scrolls through the night as colored placeholders.
5. Data remote functions with static fallbacks (`youtube.remote.ts`, `github.remote.ts`).
6. Message key conventions plus a few placeholder keys in `messages/de.json`.
7. Put the round-2 mockups into the placeholders as temporary background images (optional but very useful: each section agent then works against its target in place).
8. `pnpm check`, `pnpm lint`, `pnpm build` green. Commit. This commit is the base for every worktree agent.

### Phase 1: art (parallel, art agents, starts right after Phase 0 step 1, it does not need the code)

- A1: mascot model sheet v2 → **owner approval gate**.
- A2 (optional): one mockup set for game candidate C (constellation hunt).
- A3–A6 (after A1 is approved): section layers, e.g. A3 hero + making, A4 night shift, A5 radio + cinema, A6 sunrise + shared materials (grain, edges, stars).
- A7 (later, can run during Phase 2): egg and error page art.

Collect results, check them yourself (open the images), reject anything off style, and show the owner the key images in chat.

### Phase 2: section implementation (parallel, worktree agents)

One implementation agent per section, each with `isolation: "worktree"` from the Phase 0 commit:

- I1 Hero (20:00), including the Threlte moon and phases.
- I2 Making (21:00), the path morph.
- I3a Game prototype A, moon planet (§5.3).
- I3b Game prototype B, stack to the moon (§5.3).
- I3c Game prototype C, constellation hunt (§5.3).
- I3d (small, can be done by any of the three or by the lead first): the shared game shell (`Game.svelte`, `game/shared/`) and the `/lab/games` playtest route. Do this before or alongside I3a–c so the three agents plug into one frame.

**Playtest gate:** when I3a–c are merged into the feature branch, run `pnpm dev` (or `pnpm preview`) and ask the owner to play all three at `/lab/games` on desktop and phone. Collect feedback, iterate if asked, and get a decision: which game ships (and whether star signs should appear elsewhere, §5.3). Then the winner gets its art pass and is integrated into the 22:00 section.

- I4 Night shift (01:00).
- I5 Radio (02:00), including Web Audio.
- I6 Cinema (04:00) + Sunrise (06:00).

Rules for implementation agents:

- Touch only `src/lib/home/sections/<own section>/`, its own `home_<section>_*` message keys, and, if necessary, a clearly separated addition to shared files (announce it in the final report; prefer asking the lead).
- Work against the mockup and the provided layers. If layers are not ready yet, build with the mockup image cut into rough placeholder layers and keep the layer slots so final art drops in.
- `pnpm check`, `pnpm lint`, `pnpm build` must pass in the worktree. Commit on their branch. Report: branch, what is done, screenshots (desktop 1440 px and mobile 390 px; reduced motion on and off), known issues.
- No copy. `TODO(copy): …` values only.

Model choice: implementation agents can be Claude (native) or Codex `gpt-6-astra`. Use `delegate_task` for worktree isolation. Call `orchestrator_capabilities` once first.

### Phase 3: integration (lead)

1. Merge section branches into `feat/homepage-night` one by one; resolve conflicts (mostly `messages/de.json`).
2. Tune the transitions between sections (overlaps, edge masks, `--night` curve) so it reads as one landscape. Compare with `07-full-page/01-…`.
3. Generate all copy in one batch with `gpt-6.1-sol` (`codex exec -m gpt-6.1-sol "<prompt>"`): give it the section intents, the copy rules, and the facts it may use. Paste the results into `messages/de.json`. Show the owner.
4. Performance pass (§8), accessibility pass (keyboard tour, screen reader labels, focus states, contrast on painted backgrounds), reduced motion tour.
5. Review: run a review subagent (fresh eyes, given the code, not your conclusions) on the integrated branch.

### Phase 4: Easter eggs and error pages (parallel)

Egg agents (worktrees), each egg self contained in `src/lib/home/eggs/<egg>/` plus `+error.svelte` for 404 and 500. Then integrate.

### Phase 5: final QA and owner review

`pnpm build` + `pnpm preview`, real devices if possible (an iPhone Safari check matters for Threlte, audio, and scroll driven animations), Lighthouse, a recorded scroll through video or screenshots for the owner. The owner deploys.

### Dependency graph

```
P0 foundation ─┬─────────────────────────────► P2 I1 I2 I4 I5 I6 ─┐
               │                                   ▲              ├─► P3 integration ─► P4 eggs ─► P5 QA
P1 A1 mascot ──┴─► (owner ok) ─► A3–A6 layers ─────┘              │
P0 ─► I3d shell + lab ─► I3a/I3b/I3c prototypes ─► (owner playtest + pick) ─► game art + polish ─┘
```

---

## 8. Performance and quality budgets

- LCP ≤ 2.5 s on a mid range phone (4G), CLS < 0.05, INP < 200 ms.
- Initial JS (gzip) for `/` ≤ ~120 kB; Threlte/three only in a lazy chunk; audio code lazy.
- No main thread task over 100 ms while scrolling. Animate only `transform`, `opacity`, `clip-path`/`mask` positions, and CSS variables.
- Images: AVIF/WebP via `enhanced-img`, explicit sizes, `loading="lazy"` below the fold, `fetchpriority="high"` on the hero image.
- Loops paused off screen and in hidden tabs. One `AudioContext`, created on gesture.
- `pnpm analyze` after Phase 2 and Phase 4; read `.svelte-kit/output/client/analyze-data.md`.
- Update the "Performance budget" in [ARCHITECTURE.md](ARCHITECTURE.md) if the real numbers justify a change.

---

## 9. Open questions for the owner (ask at the right gate, not all at once)

1. Kickoff: may the lead commit to `feat/homepage-night`?
2. After A1: model sheet v2 approved?
3. At the playtest gate: which game ships, what to change, and where the star signs / zodiac should appear on the site (and which tools as signs).
4. Before I5: the music track file (and the station name); Discord invite link.
5. Before Phase 3: YouTube channel ID (or permission to look it up from `@solostack_dev`).
6. Any time: may we add GSAP (or another animation library) if custom code gets messy? Default: no.
7. Wordmark: keep Geist Black or provide an SVG logo?

---

## 10. Templates

### 10.1 Implementation subagent brief (fill in per section)

```
You implement one section of the solo-stack.dev homepage in a SvelteKit 3 / Svelte 5 / Tailwind 4 project.
Read first: docs/HANDOFF-HOMEPAGE.md (§1 non negotiables, §3 design system, §4 architecture, §5.<n> your section spec, §8 budgets), AGENTS.md, docs/ARCHITECTURE.md.
Your section: <name> (<time>). Folder you own: src/lib/home/sections/<folder>/. Message key prefix: home_<prefix>_*.
Visual target: docs/mockups/round-2/<files>. Art layers: <path or "not ready; use placeholders cut from the mockup, keep layer slots">.
Shared components available: NightClock, PaperGrain, StarField, ShootingStars, SectionEdge, LazyMount, motion.svelte.ts, audio.svelte.ts.
Rules: no visitor facing copy (TODO(copy) values only), original art only, reduced motion state required, keyboard accessible, heavy parts lazy and paused off screen, no new dependencies without asking (Threlte/three are installed).
Done when: matches the mockup's composition and mood, spec behaviors work, pnpm check + lint + build pass, committed on your branch.
Report: branch and commit, summary, screenshots (1440 px and 390 px, reduced motion on/off), deviations from the spec, open issues.
```

### 10.2 Art subagent brief (fill in per job)

```
You are an illustrator producing PRODUCTION LAYERS (not mockups) for the solo-stack.dev homepage with the best image generation available to you (built in tool, highest quality). If none is available, stop and report.
Read first: docs/HANDOFF-HOMEPAGE.md §3 (design system, mascot style lock) and §6 (pipeline), docs/mockups/round-2/BRIEF.md (brand and art directions).
Style references (open them): docs/mockups/round-2/05-night-shift-radio/02-night-shift-bonsai-hover.png (style lock), <section mockup>, <model sheet v2 path>, D:\repos\Solo Stack\branding\final-branding-assets\04-buttergelb-banner-nachtstudio-youtube-2560x1440.jpg.
Your job: <layer list from §6.3 with sizes>.
Rules: painted watercolor and ink, butter yellow #FCD772 light, anthracite #18191B night, no text in images, transparent backgrounds for cutouts where supported, original art only (no copyrighted characters or logos), consistent mascot per model sheet v2. Check every image yourself and regenerate weak ones.
Output: <folder>, with PNG masters, PROMPTS.md (exact prompts and references), README.md (layer list, intended position, size, z order). Do not touch other folders.
Final message: file list, any layers you could not produce cleanly.
```

---

## 11. Mockup index (round 2)

- Gallery: [docs/mockups/round-2/index.html](mockups/round-2/index.html)
- Art brief used: [docs/mockups/round-2/BRIEF.md](mockups/round-2/BRIEF.md)
- Chosen: `02-hero/05-07` (painted moon), `03-what-i-make/01-03` (ink morph), `03-what-i-make/04-05` (constellations: seed for game candidate C and the star sign idea), `04-game/*` (games A and B, both to be prototyped and playtested), `05-night-shift-radio/01-04` (night shift), `05-night-shift-radio/06-11` (radio, to be reworked: painted style and stronger socials), `06-video-sunrise/01-03` (cinema), `06-video-sunrise/05-07` (sunrise), `07-full-page/01` and `04-…mobile-full` (overall flow), `01-mascot-easter-eggs/04-12` (eggs; mascot style outdated).
- Not chosen: `02-hero/01-04` (paper cut lightbox), `02-hero/08-11` (painted live), `02-hero/12-13` (moon tear, parked), `03-what-i-make/06-07` (paper folio), `05-night-shift-radio/05` (isometric room), `06-video-sunrise/04` (anime episode card, parked), `07-full-page/02-03`, `01-mascot-easter-eggs/01-03` (mascot caricature style rejected).
