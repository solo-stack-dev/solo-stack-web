# Site redesign: "Silhouettennacht" (2026-11-05)

> **Cleanup (2026-11-10):** working images (previews, rejects, raw sources, superseded layers, QA screenshots) were removed from the tree to keep the repo small. They remain in git history at commit `dbb4371`.

Owner brief (2026-11-05): the design is not finished. The moon is used on every subpage and wears out (on /stats it looks out of place). Keep the homepage and the general ideas of every page, but push the craft until it never needs touching again. Functionality is done: **design only**, no feature or data changes. A critique loop (Claude Opus 5.5 high + gpt-6.1-sol) rates every page 1–10; the work is finished only at ≥ 9.5 from both.

References (in `docs/art/site/refs/`):

- `ref-glowing-tree.png`: a giant luminous golden tree raining light over a dark land (owner: "Elden Ring tree"). Use the _feeling_ only (a tree made of light, rays, drifting golden motes), never a recreation.
- `ref-silhouette-sunset.png`: the silhouette aesthetic (owner: "nothing to do with Donkey Kong"): foreground pure black silhouettes, only the background and a few things are lit. Use only the technique.
- `current-*.png`: the pages as the owner sees them today (blog, stats, contact, the contact focus ring, the 21:00 section).

## The idea

The **homepage keeps the moon**: it is the brand's hero and the night journey stays as built. The **subpages leave the moon behind** and each gets its own creature or landmark of the same night, painted in a **silhouette style**: black ink silhouettes (`--color-ink` #0e0f10, painterly watercolor edges, dry brush texture, never vector flat) against a lit background, with only a few things glowing in butter `#fcd772` / ochre `#e2a93b` / moonlight `#fff4d6` (a laptop screen, an owl's eyes, fireflies, a tree of light). It is the same Nachtstudio world, seen from different places in the same night.

| Page                                                              | Landmark                                                                                                                                                                                               | Story beat                                                         |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| `/`                                                               | the moon (unchanged)                                                                                                                                                                                   | the night journey                                                  |
| `/blog`                                                           | the reading hill: the mascot in silhouette under a crooked little tree, laptop glowing on his lap, fireflies rising                                                                                    | every video becomes something you can read by laptop light         |
| `/blog/[slug]` "video follows" frames, post cards without a video | backlit silhouette vignettes per format (laptop on the cliff, …) on a glowing horizon                                                                                                                  | a window into the night, no moon                                   |
| `/stats`                                                          | **the growth tree**: a giant tree made of golden light on a hill; the follower curve is the glowing path that climbs the silhouette hill up to its roots; the mascot sits small at its foot looking up | growth you can see from far away                                   |
| `/kontakt`                                                        | **the night owl messenger**: an owl in silhouette on a gnarled branch, glowing eyes, a rolled letter with a butter wax seal; it blinks, and flies off with the letter when a message is sent           | night owls are awake when the owner codes, and they carry the mail |
| every subpage footer                                              | a silhouette horizon strip (treeline, the cliff with the glowing laptop, the owl's tree, a few fireflies)                                                                                              | ties the subpages into one landscape                               |

The site nav logo (crescent) stays: it is the brand mark, not decoration.

### Both themes

The subpages have a light and a dark theme (mode-watcher). Silhouettes are theme agnostic: black ink on cream paper reads like a sumi painting, black ink against the lit night glow reads like the reference. So every silhouette asset ships **once, with alpha**, and the glow behind it is a CSS/pigment-wash layer that changes per theme (dark: butter/ochre backlight on night; light: butter wash on paper). The glowing parts (tree light, eyes, screen, fireflies) are painted into the asset or done in CSS so they work on both.

### Background of the subpages

Today: flat `--background` plus 5% paper grain and a star field in dark. Target: the same calm surface, but it should feel like _painted night paper_: a faint vertical night gradient (slightly lighter dusk at the top under the hero art, deepest at the middle), very low pigment mottling, the star field only behind hero areas, and the silhouette horizon footer as the floor. Light theme: warm paper with a barely visible butter wash under the hero art. No cards-on-a-grid feeling anywhere.

## Fixes the owner named

1. **21:00 "What I make" no longer locks the scroll.** The section becomes one normal viewport; the ink line rotates through the six states on its own while the section is on screen (pauses on hover, focus, hidden tab; the pillar row and the dots jump to a state; arrow keys work). Scroll passes straight through. Reduced motion: no autoplay, the states stay reachable by the controls (or the static sequence).
2. **Contact form focus state.** No boxy outline around the lined letter pad. Focus is drawn in the material: the ruled line inks in from the left in butter/ochre with a soft glow, the label lights up, the caret is butter. Keyboard focus must stay clearly visible (WCAG 2.2 focus appearance, ≥ 3:1).
3. **Moon overuse**: as above.

## Rules for everyone

- No visitor text written by agents (AGENTS.md). New strings: `TODO(copy)` or generate with `codex exec -m gpt-6.1-sol` (see the memory note in the brief). Decorative art has `alt=""`.
- Performance: art as responsive WebP/AVIF via `enhanced:img`, lazy below the fold, animations CSS first, paused off screen, `prefers-reduced-motion` gets a beautiful static frame.
- Avoid generic "AI design": no card grids with rounded borders, no eyebrow badges, no symmetrical template layouts. Every page should feel like a crafted illustration with type set into it.
- Art masters live in `docs/art/site/<page>/` with `PROMPTS.md`; production files in the owning `src/lib/**/assets/`.
