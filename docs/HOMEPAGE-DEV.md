# Homepage development guide

Read this before touching `src/lib/home/`. It describes the Phase 0 foundation that every section agent builds on: who owns which folder, the contracts between sections and the page, the shared component APIs, message key rules, and asset conventions. The product brief is [HANDOFF-HOMEPAGE.md](HANDOFF-HOMEPAGE.md); stack-wide conventions are in [ARCHITECTURE.md](ARCHITECTURE.md) and [AGENTS.md](../AGENTS.md).

**Copy rule, again:** you never write visitor facing text. Every string a visitor can read or hear (headings, labels, `aria-label`, `alt`, button text, `<title>`, meta) is a Paraglide message whose value is `TODO(copy): <intent>`. Allowed literals: proper names (SOLO STACK, YouTube, GitHub, Svelte…), clock labels (`22:00`), and live data (video titles, commit messages, handles).

## 1. Map and ownership

```
src/routes/+page.svelte            composes <NightPage> + 7 sections (lead)
src/routes/+page.ts                prerender = true (lead)
src/routes/lab/games/              playtest lab, noindex (game shell owner / lead)
src/lib/home/
  night.ts                         NIGHT_HOURS: order, ids, clock times, sky colors (lead)
  NightPage.svelte                 sky, --night, stars, grain, nav, menu, hour rail (lead)
  shared/                          shared components and helpers (lead; see §6)
  data/                            socials.ts, youtube(.remote).ts, github(.remote).ts (lead)
  sections/
    hero/          20:00   Hero.svelte, MoonScene.svelte (Threlte), assets/          → hero agent
    making/        21:00   Making.svelte, assets/                                   → making agent
    game/          22:00   Game.svelte, candidates.ts, shared/, assets/             → game shell owner
      moon-planet/         candidate A                                             → candidate A agent
      stack-to-moon/       candidate B                                             → candidate B agent
      constellations/      candidate C                                             → candidate C agent
    night-shift/   01:00   NightShift.svelte, assets/                               → night shift agent
    radio/         02:00   Radio.svelte, assets/                                    → radio agent
    cinema/        04:00   Cinema.svelte, assets/                                   → cinema agent
    sunrise/       06:00   Sunrise.svelte, assets/                                  → sunrise agent
messages/de.json, messages/en.json  one contiguous key block per owner (§7)
```

Rules:

- Touch only your folder and your message block. Anything else (shared components, `night.ts`, `NightPage.svelte`, `layout.css`, `package.json`) is the lead's. If you truly need a shared change, keep it minimal and additive (a new optional prop, a new helper), and list it under "shared changes" in your final report.
- Inside your folder, import siblings relatively (`./MoonScene.svelte`). Everything else via `#lib/...` with the file extension (`#lib/home/shared/motion.svelte.ts`).
- New dependencies: ask first. Threlte (`@threlte/core` 8, `@threlte/extras` 9) and `three` 0.186 are installed.
- Candidate agents never edit `game/shared/` or `candidates.ts`; the contract in §5 is fixed.

## 2. Section anatomy

Every section component renders one root element with:

| Requirement                                  | Why                                                                                                  |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `id="<section id>"` from `NIGHT_HOURS`       | Menu and rail anchors (`#hero`, `#making`, `#game`, `#night-shift`, `#radio`, `#cinema`, `#sunrise`) |
| `data-night-hour="<time>"`                   | NightPage anchors the sky color stops to the section's real position                                 |
| `position: relative`                         | NightClock, SectionEdge, MockupRef are absolutely positioned inside it                               |
| `<NightClock time="…" />`                    | Same clock position in every section                                                                 |
| a heading with `aria-labelledby` on the root | Landmark and outline. Hero owns the only `<h1>` (the wordmark); others use `<h2>`                    |
| transparent background                       | The global sky shows through; paint your art on top of it                                            |

Placeholder heights from Phase 0 (`min-height: 100svh`; making is `550svh` with a sticky stage) are starting points. Change your own height freely: the sky stops re-measure on resize.

`MockupRef` (the low-opacity round-2 mockup behind each section) is temporary. Keep it while you build, delete its usage and your `assets/*-mockup-ref.webp` once real art is in place. In dev, `?ref=0` hides all references and `?ref=1` shows them at 0.9 opacity for comparison.

## 3. The `--night` contract

- `--night` is a registered `<number>` custom property (`@property` in `src/routes/layout.css`), set on NightPage's wrapper `[data-night-page]` and inherited by every section: **0 at the top of the hero (20:00), 1 at the bottom of the page (06:00)**. It is linear in page scroll position.
- Driver: a CSS scroll-driven animation (`animation-timeline: scroll(root block)`) where supported and motion is allowed; otherwise (no support, or `prefers-reduced-motion: reduce`) a passive, rAF-throttled scroll listener writes it inline. Both produce the same value; you never write `--night` yourself.
- The base sky is a fixed stack of color layers built from `NIGHT_HOURS[].sky`. Each hour's color is reached when that section's center meets the viewport center (stops re-measured on resize). Colors: `20:00 #2d2620` dusky warm → `21:00 #221f1d` → `22:00 #1a1a1b` → `01:00 #111213` → `02:00 #0e0f10` deepest → `04:00 #2a2723` warming → `06:00 #fcd772` butter paper. Only the lead changes the curve (`night.ts`).
- Global stars fade in after the hero and retreat before sunrise (driven by `--night`).
- Use it in CSS, never by polling it in JS:

```css
.glow {
	/* brighter in the deepest night */
	opacity: calc(0.4 + 0.6 * clamp(0, 1 - max(var(--night) - 0.6, 0.6 - var(--night)) * 4, 1));
}
```

- Readable ink on the sky: `var(--night-ink)` is cream at night and turns anthracite once the paper is bright (used by the nav and rail).
- For progress **within** your section (morphs, pinning, sunrise), use `ScrollProgress` (§6.8), not `--night`.

## 4. Data

Remote functions, prerendered at build time (no request at runtime; results are inlined into the HTML):

| Import                                                    | Returns                                                                               | Fallback                               |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------- | -------------------------------------- |
| `getLatestVideo` from `#lib/home/data/youtube.remote.ts`  | `LatestVideo \| null`: `{ id, title, url, publishedAt, thumbnail }` (channel RSS)     | `null` → link to `YOUTUBE_CHANNEL_URL` |
| `getRecentCommits` from `#lib/home/data/github.remote.ts` | `Commit[]`: `{ hash (7), message (first line), repo, date, url }`, newest first, ≤ 12 | `[]` → empty state, never invented     |

Use them with top level `await` (Svelte experimental async):

```svelte
<script lang="ts">
	import { getRecentCommits } from '#lib/home/data/github.remote.ts';
	const commits = $derived(await getRecentCommits());
</script>
```

Socials: `SOCIALS` / `linkedSocials()` / `getSocial(id)` from `#lib/home/data/socials.ts` (`{ id, name, url, handle, icon }`, `icon` is the Simple Icons slug). Discord has `url: null` until the owner provides a permanent invite, so always render `linkedSocials()`.

## 5. Game contract (22:00 and `/lab/games`)

A candidate is a folder with `index.ts` exporting the `GameModule` shape from `game/shared/types.ts`:

```ts
// sections/game/stack-to-moon/index.ts
export { default } from './StackToMoon.svelte'; // Component<GameProps>
export const tuning: TuningDef[] = [{ key: 'gravity', min: 0.5, max: 6, step: 0.1, default: 2.4 }];
export const controls: GameButton[] = ['left', 'right', 'action']; // optional, on-screen touch buttons
```

```ts
interface GameProps {
	paused: boolean; // pause button, frame < 25 % on screen, or hidden tab: stop your loop
	tuning: Record<string, number>; // live slider values in the lab, defaults on the homepage
	input: GameInput; // keyboard + touch, already wired
	reducedMotion: boolean; // offer a calmer mode (less shake, no flashes)
	onScore?: (score: number) => void; // absolute score; the frame stores the local high score
	onGameOver?: (score: number) => void; // end of round; restart remounts your component
}
```

- `GameInput`: `isDown(button)`, `consume(button)` (true once per press), `axisX`, `axisY`, `held` (reactive). Buttons: `left` (←, A), `right` (→, D), `up` (↑, W), `down` (↓, S), `action` (Space). Uses `KeyboardEvent.code`, so WASD works on QWERTZ.
- `GameFrame` owns: poster + play button, lazy load on click, focus on the game surface, pause (button, P, Escape, off screen, hidden tab), restart (button or R, remounts the game), score and high score in mono, touch buttons (coarse pointers, or the lab's touch toggle), debug sliders (`debug` prop, lab only). High scores: `localStorage` key `solostack:game:<id>:highscore`.
- Fill your canvas/scene to the parent box. The stage is 16:9 (4:5 below 40 rem); override with `--game-aspect` / `--game-aspect-mobile` on the frame if your game needs it (tell the lead).
- Drive your loop with `RafLoop` and set `loop.paused = paused` in an `$effect`. Keep a round between 30 and 90 seconds, instant restart, no network.
- Each candidate folder currently holds a stub wrapping `game/shared/PlaceholderGame.svelte`. Replace your folder's files; do not edit the placeholder. The lead deletes it once all three are replaced.
- Message keys: `home_game_moon_*` (A), `home_game_stack_*` (B), `home_game_stars_*` (C). Each already has a `_title` key.
- `HOMEPAGE_GAME` in `candidates.ts` picks the game shown at 22:00 (placeholder: `stack-to-moon` until the playtest decision).
- `/lab/games` shows all three in tabs with debug sliders; `noindex, nofollow`, not linked. If a sitemap is added, exclude `^/lab/` (super-sitemap `excludeRoutePatterns`). Remove or protect before launch.

## 6. Shared components and helpers (`src/lib/home/shared/`)

### 6.1 `NightClock.svelte`

`<NightClock time="22:00" />`. Props: `time` (required), `placement` (`'section'` absolute top left, default; `'inline'`), `class`. Position via `--night-clock-top` / `--night-clock-left`, color via `--night-clock-color` (set it on light backgrounds, e.g. sunrise).

### 6.2 `PaperGrain.svelte`

Generated `feTurbulence` tile as a repeating background (rasterized once). NightPage already renders one fixed grain for the whole page. Props: `opacity` (0.07), `fixed` (true; `false` = absolute in a positioned parent), `src` (painted grain tile URL), `size` (220 px), `blend` (`'normal'`), `class`.

### 6.3 `StarField.svelte`

One canvas, fills its positioned parent, deterministic per seed, twinkle at ≤ 20 fps, paused off screen and in hidden tabs, static under reduced motion. Props: `density` (1 ≈ one star per 7000 px²), `brightness` (1), `seed` (7), `twinkle` (true), `class`. The global sky already has one; add your own only for a denser local sky.

### 6.4 `ShootingStars.svelte`

Random streaks every `minDelay`…`maxDelay` ms (8000…20000), in the top `maxY` (0.6) of the parent; off under reduced motion. Each streak dispatches a `window` event `SHOOTING_STAR_EVENT` (`'night:shooting-star'`, detail `{ x, y, angle, duration }`), e.g. for the hero mascot to look up:

```ts
import { SHOOTING_STAR_EVENT, type ShootingStarDetail } from '#lib/home/shared/ShootingStars.svelte';
$effect(() => on(window, SHOOTING_STAR_EVENT, (event) => lookAt((event as CustomEvent<ShootingStarDetail>).detail)));
```

### 6.5 `SectionEdge.svelte`

Ragged watercolor edge so sections bleed into each other. Place it inside your `position: relative` root.

```svelte
<SectionEdge position="top" fill="var(--color-ink)" height="7rem" seed={4} />
<SectionEdge position="bottom" mask={paintedEdge} height="10rem">{@render paintedTexture()}</SectionEdge>
```

Props: `position` (`'top'` sits above your top edge, `'bottom'` below your bottom edge), `fill` (CSS background, default `currentColor`), `height` (`6rem`), `overlap` (how far it reaches into your own section, `1px`), `seed` (1; use a unique one per edge), `roughness` (1), `mask` (URL of a final painted alpha mask, replaces the generated one), `children` (content inside the masked strip instead of `fill`), `class`. Sections that come later in the DOM paint above earlier ones, so a top edge overlaps the previous section.

### 6.6 `LazyMount.svelte`

Mounts a heavy component from a dynamic import when its box comes within `rootMargin` (one viewport) of the screen. The import becomes its own chunk.

```svelte
<LazyMount load={() => import('./MoonScene.svelte')} props={{ phase }} when={webgl && !reducedMotion.current} idle class="moon-slot">
	{#snippet fallback()}<enhanced:img src={moonDisc} alt="" />{/snippet}
	{#snippet failed()}<enhanced:img src={moonDisc} alt="" />{/snippet}
</LazyMount>
```

Props: `load` (required), `props`, `rootMargin` (`'100% 0px'`), `when` (true; extra condition), `idle` (false; also wait for `requestIdleCallback`), `fallback`, `failed` (snippet, gets the error), `onloaded`, `class`. The wrapper is a `div`: give it the final size via `class` so nothing shifts when the component replaces the fallback.

### 6.7 `MockupRef.svelte` (temporary)

`<MockupRef src={mockup} opacity={0.3} fit="cover" />`. Decorative reference image, see §2.

### 6.8 `motion.svelte.ts`

```ts
import { reducedMotion, pageVisibility, inView, InView, ScrollProgress, RafLoop } from '#lib/home/shared/motion.svelte.ts';
```

- `reducedMotion.current`: reactive `prefers-reduced-motion: reduce` (`false` during SSR).
- `pageVisibility.current`: reactive tab visibility.
- `inView(callback, { rootMargin, threshold, once })`: attachment, `callback(visible, entry)`. Usage: `<div {@attach inView((v) => (near = v))}>`.
- `new InView(options)`: reactive `.current`, attach with `{@attach seen.attach}`.
- `new ScrollProgress({ mode, cssVar })`: reactive `.current` 0…1, attach to the element. Modes: `through` (enter bottom → leave top), `pinned` (tall wrapper with a sticky child: 0 at wrapper top = viewport top, 1 at wrapper bottom = viewport bottom), `enter` (top at viewport bottom → top at viewport top). `cssVar: '--progress'` also writes the value to the element, which is cheaper than reactive markup for per-frame styling. Only measures while near the viewport.
- `new RafLoop(tick, { fps, paused })`: `tick(dtSeconds, time)`; runs only while attached element is on screen, tab visible, and `!paused`. `.paused` (get/set), `.running` (reactive). dt is clamped to 0.1 s.

```svelte
<script lang="ts">
	const loop = new RafLoop((dt) => step(dt), { fps: 30 });
	$effect(() => {
		loop.paused = reducedMotion.current;
		if (reducedMotion.current) drawStaticFrame();
	});
</script>

<canvas {@attach loop.attach}></canvas>
```

### 6.9 `audio.svelte.ts`

One shared `AudioContext`, created only on a user gesture.

```ts
import { audio } from '#lib/home/shared/audio.svelte.ts';

function onclick() {
	const context = audio.unlock(); // synchronously in the gesture handler; creates or resumes
	const source = context.createBufferSource();
	source.connect(audio.output!); // shared master gain
}
```

API: `audio.unlock(): AudioContext`, `audio.context`, `audio.output` (master `GainNode`), `audio.state` (reactive: `'idle'` before unlock, then the context state), `audio.volume` (reactive), `audio.setVolume(0…1)`, `audio.suspend()`, `audio.resume()`. Never autoplay; never create your own `AudioContext`.

## 7. Messages

- Files: `messages/de.json` (base locale) and `messages/en.json`. **Both files always get the same keys.** Values are `TODO(copy): <intent>` until the lead generates copy with `gpt-6.1-sol` in Phase 3. The intent is a brief for the copywriter model: what the text is, where it appears, length, tone hints. No draft copy.
- Prefixes (§4.4 of the handoff): `home_meta_*`, `home_nav_*` (lead), `home_hero_*`, `home_making_*`, `home_game_*` (shell), `home_game_moon_*`, `home_game_stack_*`, `home_game_stars_*` (candidates), `home_nightshift_*`, `home_radio_*`, `home_cinema_*`, `home_sunrise_*`, `lab_games_*` (lab), later `error_*`, `egg_*`.
- Naming: `<prefix>_<thing>[_<variant>]` in snake case, e.g. `home_radio_preset_label`, `home_cinema_play_label`. Parameters use Paraglide inputs: `"home_radio_station_label": "TODO(copy): … {name} …"` → `m.home_radio_station_label({ name })`.
- **Merge rule:** the files are ordered in one contiguous block per owner. Add your keys **inside your own block, right after its last existing key**, never at the end of the file and never inside another block. That keeps parallel branches from touching the same lines, so merges are conflict free.
- Use: `import { m } from '#lib/paraglide/messages.js';` then `{m.home_radio_title()}`. `src/lib/paraglide/` is generated (`pnpm check` or the Vite plugin recompiles); never edit it.

Phase 0 keys: `home_meta_title`, `home_meta_description`; `home_nav_skip`, `home_nav_menu_open`, `home_nav_menu_close`, `home_nav_menu_title`, `home_nav_rail_label`, `home_nav_section_{hero,making,game,nightshift,radio,cinema,sunrise}`; `home_hero_tagline`, `home_hero_scroll_cue`; `home_making_title`; `home_game_{title,play,pause,resume,restart,score,highscore,loading,load_error,controls_label}`, `home_game_touch_{left,right,up,down,action}`; `home_game_moon_title`, `home_game_stack_title`, `home_game_stars_title`; `home_nightshift_{title,monitor_label,monitor_empty}`; `home_radio_{title,socials_label}`; `home_cinema_{title,watch_link,channel_link}`; `home_sunrise_{title,footer_label}`; `lab_games_{title,tabs_label,debug_title,debug_reset,touch_toggle}`.

## 8. Assets (handoff §6.4, decided in Phase 0)

- **Masters** (full-size PNGs from the art agents) go to `docs/art/<section>/` with `PROMPTS.md` and `README.md` (layer list, intended position, size, z order). Never into `static/`.
- **Optimized imports** live in `src/lib/home/sections/<section>/assets/`, consumed with `@sveltejs/enhanced-img` (`<enhanced:img src={layer} alt="" sizes="…" />` or `import layer from './assets/x.png?enhanced'`), which emits AVIF/WebP in responsive sizes. Downscale before copying if the master is far larger than the largest rendered size (2× of the max CSS width).
- Naming: `<section>-<layer>[-mobile][@frame].png`, e.g. `hero-moon-disc.png`, `nightshift-mascot-typing@2.png`. Mascot frames: one sprite sheet per animation.
- Budgets: hero above the fold ≤ ~250 kB AVIF (desktop); each section's initial images ≤ ~400 kB; `loading="lazy"` below the fold, `fetchpriority="high"` only on the hero image; explicit sizes (no CLS).
- Decorative art: `alt=""`. Meaningful images get an `alt` message key.
- `*-mockup-ref.webp` files are temporary references (1280 px, ~100 kB each); delete them with `MockupRef`.

## 9. Before you commit

`pnpm check`, `pnpm lint`, `pnpm format`, `pnpm build` green; `pnpm dev` without console errors at `/` (and `/lab/games` for games); reduced motion checked (DevTools → Rendering → `prefers-reduced-motion`); heavy parts lazy (three only in a lazy chunk: the prerendered `index.html` must not modulepreload it). `docs/mockups/` is excluded from oxfmt and oxlint (design artifacts).

## 10. Open TODOs from Phase 0

- `TODO(copy)`: every message value.
- `TODO(owner)`: permanent Discord invite (`DISCORD_INVITE_URL` in `socials.ts`); optional `GITHUB_TOKEN` if CI builds hit the GitHub rate limit.
- `TODO(playtest)`: `HOMEPAGE_GAME` in `candidates.ts`.
- `TODO(launch)`: remove or protect `/lab/games`.
- `TODO(sunrise agent)`: legal links (Impressum, Datenschutz, Kontakt) once the pages exist.
- The YouTube feed is currently empty (no public video yet), so the cinema shows the channel fallback until the first upload and the next build.
