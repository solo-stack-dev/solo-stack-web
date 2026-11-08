# Homepage development guide

Read this before touching `src/lib/home/`. It describes the Phase 0 foundation that every section agent builds on: who owns which folder, the contracts between sections and the page, the shared component APIs, message key rules, and asset conventions. The product brief is [HANDOFF-HOMEPAGE.md](HANDOFF-HOMEPAGE.md); stack-wide conventions are in [ARCHITECTURE.md](ARCHITECTURE.md) and [AGENTS.md](../AGENTS.md).

**Copy rule, again:** you never write visitor facing text. Every string a visitor can read or hear (headings, labels, `aria-label`, `alt`, button text, `<title>`, meta) is a Paraglide message whose value is `TODO(copy): <intent>`. Allowed literals: proper names (SOLO STACK, YouTube, GitHub, Svelte…), clock labels (`22:00`), and live data (video titles, commit messages, handles).

## 1. Map and ownership

```
src/routes/+page.svelte            composes <NightPage> + 7 sections (lead)
src/routes/+layout.ts              prerender = true for the whole site (lead)
src/lib/home/
  night.ts                         NIGHT_HOURS: order, ids, clock times, sky colors (lead)
  NightPage.svelte                 sky, --night, stars, grain, nav (SiteNav night variant), menu, hour rail (lead)
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
| `position: relative`                         | NightClock is absolutely positioned inside it                                                        |
| `<NightClock time="…" />`                    | Same clock position in every section                                                                 |
| a heading with `aria-labelledby` on the root | Landmark and outline. Hero owns the only `<h1>` (the wordmark); others use `<h2>`                    |
| transparent background                       | The global sky shows through; paint your art on top of it                                            |

Placeholder heights from Phase 0 (`min-height: 100svh`) are starting points; no section pins or scrubs by scroll (making rotates on its own inside one viewport). Change your own height freely: the sky stops re-measure on resize.

## 3. The `--night` contract

- `--night` is a registered `<number>` custom property (`@property` in `src/routes/layout.css`), set on NightPage's wrapper `[data-night-page]` and inherited by every section: **0 at the top of the hero (20:00), 1 at the bottom of the page (06:00)**. It is linear in page scroll position.
- Driver: a CSS scroll-driven animation (`animation-timeline: scroll(root block)`) where supported and motion is allowed; otherwise (no support, or `prefers-reduced-motion: reduce`) a passive, rAF-throttled scroll listener writes it inline. Both produce the same value; you never write `--night` yourself.
- The base sky is a fixed stack of color layers built from `NIGHT_HOURS[].sky`. Each hour's color is reached when that section's center meets the viewport center (stops re-measured on resize). Colors: `20:00 #2d2620` dusky warm → `21:00 #221f1d` → `22:00 #1a1a1b` → `01:00 #111213` → `02:00 #0e0f10` deepest → `04:00 #2a2723` still night, with a warming horizon (`horizon: #4a3826`, a bottom gradient) → `06:00 #fcd772` butter paper. The sunrise has `from: 'enter'`: its blend only starts when the sunrise section's top enters the viewport, so 04:00 stays night and butter arrives with the sunrise. Only the lead changes the curve (`night.ts`).
- `--dawn` (0…1): progress of that last blend (0 through the whole night, 1 at the page end).
- Global stars fade in after the hero and retreat with `--dawn`. Global shooting stars pause while the hero covers the top of the viewport (the hero has its own).
- Use it in CSS, never by polling it in JS:

```css
.glow {
	/* brighter in the deepest night */
	opacity: calc(0.4 + 0.6 * clamp(0, 1 - max(var(--night) - 0.6, 0.6 - var(--night)) * 4, 1));
}
```

- Readable ink on the sky: `var(--night-ink)` is cream at night and turns anthracite as `--dawn` completes. The nav and the rail do not use it: they track the real background under them (cream until the sunrise night edge has cleared them, then anthracite) and carry a soft opposite-ink halo for ragged edges.
- Page chrome: the nav wordmark and the hour rail are hidden while the hero covers the top 40 % of the viewport. The rail shows its clock labels only on hover/focus, and only its dots take pointer events (24 px each, right edge), so art underneath stays clickable.
- Overscroll: `html` is night; NightPage sets `html[data-night-end]` (butter) while the sunrise is on screen, so bottom overscroll shows paper.
- Sunrise hook: `data-night-edge` marks the element whose box ends where the retreating night's ink is gone (`data-edge-clear`: the fraction of its height where that happens, default 0.72). The sunrise puts it on `.night-clear`, a box from its top down to the dawn cloud bank's ragged underside (`shared/dawn.ts` `clear`, `data-edge-clear="1"`). Fallback without the attribute: `#sunrise .night`.
- For progress **within** your section (morphs, pinning, sunrise), use `ScrollProgress` (§6.8), not `--night`.

## 3b. System tokens (lead)

Defined in `src/routes/layout.css`. Use them instead of local values so every section lines up.

| Token                                                                                            | Use                                                                                                                      |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| `--page-gutter`, `--bottom-gutter`                                                               | Left/right edge of all copy, chrome and controls; bottom line of in-section controls (on `[data-night-page]`)            |
| `--clock-top`, `--heading-top`                                                                   | NightClock top; the section heading sits at `--heading-top`, under the clock                                             |
| `--nav-pad-y`                                                                                    | Vertical padding of the nav bar (the menu close button sits on it too)                                                   |
| `--color-butter/ochre/cream/moonlight/night/ink/dusk`                                            | The only colors. Alpha via `color-mix(in oklab, var(--color-butter) 40%, transparent)`, never raw `rgb()`                |
| `--halo-ink`, `--halo-butter`                                                                    | Text halo for cream on pigment / anthracite on paper                                                                     |
| `--glow-sm/md/lg`                                                                                | Butter light (works as `text-shadow` and `box-shadow`)                                                                   |
| `--ink-underline`                                                                                | The selection/link mark: a hand-drawn stroke as a mask on an `::after` (`mask: var(--ink-underline) center / 100% 100%`) |
| `--ease-settle`, `--dur-hover/state/reveal/entrance`                                             | Motion (160 / 300 / 600 / 1100 ms)                                                                                       |
| utilities `label-sm` (clock, rail, hints), `label` (controls, tabs, links), `night-heading` (h2) | Mono label scale (Geist Mono, self-hosted) and the one section heading style                                             |

Interaction idioms, two only: the hand-drawn underline for every selection or navigation state (nav current page, making pillars, game tabs, links), and the solid butter disc/button for primary actions (play, follow). No pills or glass chips.

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

## 5. Game contract (22:00)

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
	tuning: Record<string, number>; // the defaults of your tuning defs
	input: GameInput; // keyboard + touch, already wired
	reducedMotion: boolean; // offer a calmer mode (less shake, no flashes)
	onScore?: (score: number) => void; // absolute score; the frame stores the local high score
	onGameOver?: (score: number) => void; // end of round; restart remounts your component
	onRestart?: () => void; // you started a new round yourself (tap/jump after game over): the frame clears its game-over state
}
```

- `GameInput`: `isDown(button)`, `consume(button)` (true once per press), `axisX`, `axisY`, `held` (reactive). Buttons: `left` (←, A), `right` (→, D), `up` (↑, W), `down` (↓, S), `action` (Space). Uses `KeyboardEvent.code`, so WASD works on QWERTZ.
- Restart by the game itself: if your game restarts without the frame (e.g. jump or tap after game over), call `onRestart?.()` at that moment. GameFrame then resets the shown score and drops the restart highlight. The frame's own restart (button, R) remounts you and needs no call.
- `GameFrame` owns: poster + play button, lazy load on click, focus on the game surface, pause (button, P, Escape, off screen, hidden tab), restart (button or R, remounts the game), score and high score in mono, touch buttons (coarse pointers). High scores: `localStorage` key `solostack:game:<id>:highscore`.
- Fill your canvas/scene to the parent box. The stage is 16:9 (4:5 below 40 rem); override with `--game-aspect` / `--game-aspect-mobile` on the frame if your game needs it (tell the lead).
- Drive your loop with `RafLoop` and set `loop.paused = paused` in an `$effect`. Keep a round between 30 and 90 seconds, instant restart, no network.
- Each candidate folder holds its own game; the placeholder stub they started from is gone.
- Message keys: `home_game_moon_*` (A), `home_game_stack_*` (B), `home_game_stars_*` (C). Each already has a `_title` key.
- The 22:00 section shows all three games as tabs. `HOMEPAGE_DEFAULT_GAME` in `candidates.ts` picks the tab selected first (`moon-planet`). Only the selected tab's frame is mounted.

## 6. Shared components and helpers (`src/lib/home/shared/`)

### 6.1 `NightClock.svelte`

`<NightClock time="22:00" />`. Props: `time` (required), `placement` (`'section'` absolute top left, default; `'inline'`), `class`. Position via `--night-clock-top` / `--night-clock-left`, color via `--night-clock-color` (set it on light backgrounds, e.g. sunrise).

### 6.2 `PaperGrain.svelte`

Repeating grain tile (decoded once). Default: the painted grain from `docs/art/shared/` as a two-tone cream/ink alpha tile (`assets/paper-grain.webp`, 10 kB lossless, 256 px), so it works with `normal` blending on night and on paper. NightPage already renders one fixed grain for the whole page. Props: `opacity` (0.07), `fixed` (true; `false` = absolute in a positioned parent), `texture` (`'painted'` default, `'generated'` = the old SVG `feTurbulence` noise), `src` (any other tile URL), `size` (native tile size), `blend` (`'normal'`), `class`.

### 6.3 `StarField.svelte`

One canvas, fills its positioned parent, deterministic per seed, twinkle at ≤ 20 fps, paused off screen and in hidden tabs, static under reduced motion. The few bright stars (~3 %) are drawn with the painted star sprites once decoded. Props: `density` (1 ≈ one star per 7000 px²), `brightness` (1), `seed` (7), `twinkle` (true), `sprites` (true), `class`. The global sky already has one; add your own only for a denser local sky.

### 6.4 `ShootingStars.svelte`

Random streaks every `minDelay`…`maxDelay` ms (8000…20000), in the top `maxY` (0.6) of the parent, drawn with the painted streak sprite (`sprite={false}`: generated SVG streak); off under reduced motion and while `enabled` is false (no streaks, no events). Each streak dispatches a `window` event `SHOOTING_STAR_EVENT` (`'night:shooting-star'`, detail `{ x, y, angle, duration }`), e.g. for the hero mascot to look up:

```ts
import { SHOOTING_STAR_EVENT, type ShootingStarDetail } from '#lib/home/shared/ShootingStars.svelte';
$effect(() => on(window, SHOOTING_STAR_EVENT, (event) => lookAt((event as CustomEvent<ShootingStarDetail>).detail)));
```

### 6.5 Section transitions (lead)

No opaque bands between sections. Every boundary is air: each plate feathers its own edges with a painted soft edge, a partly transparent painted mist bank drifts across the boundary, the 20→21 boundary is a scroll-driven ink-wash wipe and 04→06 a painted dawn cloud bank. Masters and prompts: `docs/art/transitions/`; optimized files: `shared/assets/transitions/` (`node src/lib/home/shared/tools/optimize-transitions.mjs`); URLs: `shared/transitions.ts`.

**Masks as CSS variables.** NightPage puts the painted masks on `[data-night-page]` as `url()` custom properties, so section CSS uses them directly:

| Variable             | Alpha                                      | Use                                                          |
| -------------------- | ------------------------------------------ | ------------------------------------------------------------ |
| `--feather-up`       | transparent above → opaque below           | soft top edge of a plate (`mask: var(--feather-up) top / …`) |
| `--feather-down`     | opaque above → transparent below           | soft bottom edge                                             |
| `--wash-spread-up`   | transparent above → opaque below, wet      | the 20→21 wipe front                                         |
| `--wash-spread-down` | the same, opaque above → transparent below | unused since round 3 (was the 04→06 night)                   |
| `--wash-dry`         | opaque above → transparent below, drying   | unused since round 3 (was the 04→06 night)                   |

All five are horizontally seamless, so `repeat-x` and sideways offsets work. Use them instead of `linear-gradient` masks: a linear fade reads as a digital edge on painted art.

**`[data-feather]` helper.** Put `data-feather` on a plate (or its wrapper) and set `--feather-top` / `--feather-bottom` (lengths, not percentages; default 0) in your CSS. NightPage's rule owns the element's `mask`: painted soft edge over those heights, solid in between. Without the attribute, write the mask yourself (the cinema backdrop uses `var(--feather-up) top / 100% 20% no-repeat, linear-gradient(#000 0 0) bottom / 100% 80.5% no-repeat`).

**`Mist.svelte`** (placed in `src/routes/+page.svelte` between sections, never inside one): a zero-height boundary with a painted mist strip (`variant`: `dusk` 20–22 h, `night` 01–02 h, `predawn` 02–04 h), `height`, `above` (share above the boundary), `opacity`, `mirror`, `drift` (parallax travel). It paints above both neighbors, takes no pointer events, loads lazily (enhanced-img), and drifts with a transform-only scroll-driven animation on its own view timeline (static without support and under reduced motion). Round 2: the lit mist is the far layer (keep it narrow and light, ≤ 0.4 opacity) and `cloud` adds a dark foreground silhouette (`strip` `a`/`b`/`c` from `docs/art/site/round-2/seam-cloud-*.png`, `height`, `above`, `opacity`, `mirror`, `stretch`, `shift`) that overlaps the upper plate's lit edge and drifts against the mist. Every seam uses a different strip, mirror or shift. Optimized by `node src/lib/home/shared/tools/optimize-round-2.mjs` (also the game posters and the cinema projection).

**`DawnBank.svelte`** (between `<Cinema />` and `<Sunrise />`, round 3): one wide, non-repeating painted dawn cloud bank (`docs/art/site/round-3/dawn-cloud-bank*.png`; the portrait painting below 48rem, never a crop), zero height, z-index 2, rising a little on its own view timeline (static under reduced motion). Its opaque middle band hides the only lines of the 04→06 seam: the sunrise overlaps the cinema and feathers its top in inside that band, and the cinema cliff dissolves into it; cinema cliff, mascot, beam, screen and heading paint in front (z-index 3). All numbers live in `shared/dawn.ts` (`dawnVars()` on the cinema, the bank and the sunrise); change them together. Optimized by `node src/lib/home/shared/tools/optimize-round-3.mjs`. The cinema overlaps the radio by `--cinema-overlap` (negative margin, own links/buttons only take pointer events), so its painted sky meets the radio's rocks; the radio overlaps the night shift the same way (`--radio-overlap`, only its scene takes pointer events).

**Wipes.**

- 20→21, making: `#making` overlaps the hero by `--wipe-overlap` (45svh, negative margin; only its own `a`/`button` take pointer events there) and its `.track` is masked by two layers of `--wash-spread-up` plus a solid layer. The one-viewport stage starts `--stage-offset` below the section top (25svh with the wipe, the whole 45svh in the static fallback; `scroll-margin-top` makes `#making` links land on it). A registered `--wipe` (0…1) runs on the named view timeline `--making-wipe` (`animation-range: entry 45% contain 25svh`: from the page top until the section top is 25svh above the viewport top, i.e. the stage fills the viewport). The front starts at the viewport bottom and floods up over the moon ~1.25× faster than the page; the track's straight top is always transparent while the hero is on screen, and the ramp keeps room for its lobes because the stage sits below the track top. Static fallback (no support, reduced motion): the overlap is one soft wash from hero to plate. If you change the overlap, change the `entry 45%` start with it; if you change the stage offset, change the `contain 25svh` end with it.
- 04→06, sunrise: no wipe since round 3. The dawn cloud bank (`DawnBank.svelte`) covers the seam; under it the sunrise overlaps the cinema (`overlap`), feathers in with `--feather-up`, and its 16:9 stage rises 6vw above its top, so the far ridge is in view while the bank passes. `--sunrise` only drives the sky's sink, the sun glow and the laptop glint.

The night shift frames its room with a night-ink vignette inside the feathered art (`Scene.svelte` `.art::after`), so the interior sinks into the dark before it meets the sky.

### 6.5b `materials.ts` (lead)

`materials.ts` exports the optimized shared materials: `PAPER_GRAIN`, `STAR_SPRITES`, `SHOOTING_STAR_SPRITE`. Regenerate the files after the masters change: `node src/lib/home/shared/tools/optimize-materials.mjs` (uses `sharp` from pnpm's store, no new dependency).

QA screenshots: `node src/lib/home/shared/tools/scroll-screens.mjs <dev url> docs/screens/integration --prefix desktop-1440 [--width 390 --height 844] [--reduced] [--sheet] [--seams]` (headless Chrome on a random free port, one WebP per half viewport, reports console errors; `--seams` centers every section boundary).

### 6.6 `LazyMount.svelte`

Mounts a heavy component from a dynamic import when its box comes within `rootMargin` (one viewport) of the screen. The import becomes its own chunk.

```svelte
<LazyMount load={() => import('./MoonScene.svelte')} props={{ phase }} when={webgl && !reducedMotion.current} idle class="moon-slot">
	{#snippet fallback()}<enhanced:img src={moonDisc} alt="" />{/snippet}
	{#snippet failed()}<enhanced:img src={moonDisc} alt="" />{/snippet}
</LazyMount>
```

Props: `load` (required), `props`, `rootMargin` (`'100% 0px'`), `when` (true; extra condition), `idle` (false; also wait for `requestIdleCallback`), `fallback`, `failed` (snippet, gets the error), `onloaded`, `class`. The wrapper is a `div`: give it the final size via `class` so nothing shifts when the component replaces the fallback.

### 6.8 `motion.svelte.ts`

```ts
import { reducedMotion, pageVisibility, inView, InView, ScrollProgress, RafLoop } from '#lib/home/shared/motion.svelte.ts';
```

- `reducedMotion.current`: reactive `prefers-reduced-motion: reduce` (`false` during SSR).
- `pageVisibility.current`: reactive tab visibility.
- `inView(callback, { rootMargin, threshold, once })`: attachment, `callback(visible, entry)`. Usage: `<div {@attach inView((v) => (near = v))}>`.
- `new InView(options)`: reactive `.current`, attach with `{@attach seen.attach}`.
- `new ScrollProgress({ mode, cssVar })`: reactive `.current` 0…1, attach to the element. Modes: `through` (enter bottom → leave top), `enter` (top at viewport bottom → top at viewport top). `cssVar: '--progress'` also writes the value to the element, which is cheaper than reactive markup for per-frame styling. Only measures while near the viewport.
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
- Prefixes (§4.4 of the handoff): `home_meta_*`, `home_nav_*` (lead), `home_hero_*`, `home_making_*`, `home_game_*` (shell), `home_game_moon_*`, `home_game_stack_*`, `home_game_stars_*` (candidates), `home_nightshift_*`, `home_radio_*`, `home_cinema_*`, `home_sunrise_*`, later `error_*`, `egg_*`.
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

## 9. Before you commit

`pnpm check`, `pnpm lint`, `pnpm format`, `pnpm build` green; `pnpm dev` without console errors at `/`; reduced motion checked (DevTools → Rendering → `prefers-reduced-motion`); heavy parts lazy (three only in a lazy chunk: the prerendered `index.html` must not modulepreload it). `docs/mockups/` is excluded from oxfmt and oxlint (design artifacts).

## 10. Open TODOs from Phase 0

- The YouTube feed is currently empty (no public video yet), so the cinema shows the channel fallback until the first upload and the next build.

## 11. Easter eggs (`src/lib/home/eggs/`)

`NightPage` mounts `<Eggs />` once. `Eggs.svelte` is the only egg code in the initial bundle (a few window listeners and dice rolls); every effect is its own lazy chunk, loaded on its trigger, rendered as a fixed `pointer-events: none` overlay (z-index 2: over the content, under the paper grain and the nav), and unmounted when done. Escape removes running eggs. Copy keys: `egg_*`.

| Egg            | Trigger                                                                                                                  | Folder            |
| -------------- | ------------------------------------------------------------------------------------------------------------------------ | ----------------- |
| Crescent slash | hero `night:moon-phase` reaches `crescent`; at most once per 10 s; off under reduced motion                              | `crescent-slash/` |
| Moon presence  | hero `night:moon-full-clicks` count 10, 20, 30 …; positioned over `[data-egg-moon]`                                      | `moon-presence/`  |
| ARISE          | Konami code (ignored while typing in inputs, textareas, contenteditable), `arise()` in the console, `night:egg-arise`    | `arise/`          |
| Three stars    | 1 in 6 page views after 30–90 s without input while a dark section (21:00–04:00) is centered, or `night:egg-three-stars` | `three-stars/`    |
| Shiny mascot   | 1 in 4096 sessions (12-bit draw, cached in `sessionStorage`), `?shiny=1` forces it, `?shiny=0` forces it off             | `shiny/`          |
| Console        | idle after load (production too): ASCII moon + message once per session, defines `window.arise()`                        | `console/`        |

Reduced motion: eggs that would move render a calm opacity-only variant (`fade.ts`, Web Animations, because the global guard in `layout.css` collapses CSS animations); the crescent slash is skipped.

**Triggering from your section.** Import the event names from `#lib/home/eggs/events.ts` (tiny, no egg code):

```ts
import { THREE_STARS_EVENT } from '#lib/home/eggs/events.ts';
window.dispatchEvent(new CustomEvent(THREE_STARS_EVENT)); // e.g. a game milestone
```

**Shiny mascot.** While the visitor rolled shiny, `[data-night-page]` has `data-shiny`. Every element with class `mascot` then gets a fallback golden filter and a tiny sparkle (`::after`, so the `.mascot` element must be positioned and must not use `::after` itself). To show real golden art instead (model sheet v2 golden variant, `docs/art/mascot/mascot-golden.png`), render both variants and swap them in CSS, and put `data-shiny-art` on the `.mascot` element to opt out of the filter:

```svelte
<div class="mascot" data-shiny-art>
	<enhanced:img class="mascot-normal" src={mascot} alt="" />
	<enhanced:img class="mascot-golden" src={mascotGolden} alt="" loading="lazy" />
</div>

<style>
	.mascot-golden {
		display: none;
	}
	:global([data-shiny]) .mascot-golden {
		display: block;
	}
	:global([data-shiny]) .mascot-normal {
		display: none;
	}
</style>
```

`loading="lazy"` plus `display: none` keeps the golden image from downloading for the 4095 other visitors. Test with `?shiny=1`.
