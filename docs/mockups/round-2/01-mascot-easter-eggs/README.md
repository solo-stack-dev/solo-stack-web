# Mascot and easter eggs — round 2

Twelve original generated PNG concepts, created 2026-11-01. Read [PROMPTS.md](PROMPTS.md) for every exact generation prompt and reference input. Only this assigned output folder was edited; no application code, dependencies, routes, or deployment were changed.

## Selected direction

**Style B: crisp ink with watercolor fills.** It keeps the owner's short side-swept dark hair, close-cut sides, thick eyebrows, small friendly smile and light stubble, while giving the face a clearly illustrated structure. The warm paper and pigment washes come from the supplied Nachtstudio branding. Style A is retained as the explicitly requested alternate exploration; its face is more portrait-like and less suitable for small game sprites.

The primary identity anchor is [02-style-b-crisp-ink.png](02-style-b-crisp-ink.png). The complete sheet is [03-mascot-complete-model-sheet.png](03-mascot-complete-model-sheet.png). Use the sheet to establish production proportions; the screenshot figures are composition studies and should not each become separate redraws of the mascot.

Favorite: [09-egg-golden-bonsai-desktop.png](09-egg-golden-bonsai-desktop.png). The visible little pot and enormous canopy make the surprise legible while preserving the quiet studio atmosphere.

## Image notes and implementation estimates

Estimates below are rough implementation effort for one experienced developer **after** final art layers have been prepared, plus indicative incremental compressed assets/code. They exclude illustration cleanup, copy generation, and shared homepage infrastructure. Byte estimates are targets, not measured build results; these full-resolution concept PNGs are approximately 2.3–3.4 MB each and are not intended to ship directly.

### 01 — [Soft watercolor exploration](01-style-a-soft-watercolor.png)

1536 × 1024. The gentler alternative shows a standing mascot, cliff coding, and coffee; the portrait-like rendering retains strong photo resemblance but is less readable as a tiny avatar. If developed, use an exported painted cutout with a slow CSS breathing transform and occasional eyelid swap; estimated 0.5–1 day, 50–120 KB art, less than 2 KB behavior.

### 02 — [Crisp ink exploration — selected](02-style-b-crisp-ink.png)

1536 × 1024. Stronger ink contours simplify the same face and outfit without losing the owner's likeness; this exact image was reused as the identity reference throughout. Prepare a reusable painted cutout and a few SVG masks for blink, gaze, and coffee steam, with CSS handling tiny movements; estimated 1–2 days, 60–150 KB art, 2–4 KB behavior.

### 03 — [Complete mascot model sheet](03-mascot-complete-model-sheet.png)

1086 × 1448, portrait 3:4. Read left to right: row 1 is front, side, back and three-quarter; row 2 is calm smile, focused coding, thinking, laughing, tired with coffee, and determined; row 3 is cliff laptop, run, jump, coffee, dumbbell, and headphones; row 4 is hoodie night and golden shiny. Build production exports as separate registered poses or a sprite atlas, with CSS for idle states and Canvas 2D for running/jumping; estimated 2–4 days for state integration after art preparation, 150–350 KB optimized atlas, 3–8 KB behavior excluding the game itself.

The sheet is **not** an animation-ready atlas: poses have different framing and would need isolated transparent exports and consistent anchors. Keep head shape, hair direction, stubble pattern, outfit and cream shoes fixed; the golden variant changes clothing/light palette, not identity. For the shiny secret, make one uniform 12-bit draw per defined visit and use one winning value out of 4096; cache that result for the visit/session so scrolling or component remounts never reroll it, and retain a forced-preview mode for QA.

### 04 — [Crescent energy slash](04-egg-crescent-slash-desktop.png)

1672 × 941, approximately 16:9. During the crescent phase, an intentional moon activation reveals one sweeping ink crescent across the sky, then it dissipates into a few painted droplets. Use one textured SVG mask revealed along a curved stroke plus CSS opacity, avoiding full-screen filter animation; estimated 0.5–1 day, 20–60 KB incremental art, 1–3 KB behavior.

### 05 — [Presence on the full moon](05-egg-moon-presence-desktop.png)

1672 × 941. Repeated full-moon activations gradually reveal an ambiguous silhouette within the lunar pigment, with the hoodie mascot looking up beside the studio. Clip a single low-opacity painted silhouette to the moon and fade it after a deliberate threshold such as 12 clicks or keyboard activations within 10 seconds, then reset; estimated 0.5 day, 15–40 KB art, less than 2 KB behavior.

The concept deliberately makes the figure visible enough to review. Production can reduce its contrast further so it is discoverable without being an obvious creature; keep it featureless and avoid detailed anatomy.

### 06 — [ARISE ink shadows](06-egg-arise-shadows-desktop.png)

1672 × 941. The Konami sequence reveals three original unfinished shadow figures rising from the cliff behind the mascot; the command is acknowledged with the supplied ARISE token and the key sequence. Use three masked painted cutouts, CSS translate/opacity and staggered timing rather than simulated fluid; estimated 1–2 days, 60–140 KB art, 2–5 KB behavior, with Escape and the visible close control restoring the normal scene.

Do not capture shortcuts while focus is in inputs, textareas or editable content. Expose the same effect through the console command and, if wanted, an accessible equivalent for visitors without a hardware keyboard.

### 07 — [404 infinite ink void](07-error-404-ink-void-desktop.png)

1672 × 941. The page appears to collapse into layered ink rings while the lost mascot stands on its last paper fragment; the error code and home control stay stable. Build a static painted error scene first, then optionally animate four SVG/CSS ring layers and a few paper fragments on entry only; estimated 1.5–2.5 days, 100–220 KB art, 3–6 KB behavior, no WebGL dependency required.

Keep the actual 404 heading, explanatory copy and recovery link as semantic DOM content above the artwork. The icon-only concept control needs a generated localized accessible label and visible production wording where appropriate.

### 08 — [500 giant at the wall](08-error-500-giant-at-wall-desktop.png)

1672 × 941. A featureless charcoal giant peeks over a huge wall above the warm studio while the mascot holds coffee in the doorway. Use a single giant cutout behind a wall mask, a short CSS vertical reveal and a lamp opacity layer; estimated 1–1.5 days, 80–180 KB art, 2–4 KB behavior.

The retry control remains stable and should retry the failed page operation or reload intentionally, with a real home escape path. Keep the 500 page usable with a static image and plain HTML even when normal page scripts or data loading have failed.

### 09 — [Golden bonsai world tree — desktop](09-egg-golden-bonsai-desktop.png)

1672 × 941. An intentional activation of the tiny bonsai grows a luminous canopy across the night sky, with gold leaves reflected in the landscape; the pot stays visible so the transformation reads immediately. Use a branch mask with CSS reveal and two or three painted canopy layers; estimated 1.5–3 days, 120–260 KB art, 3–6 KB behavior, with at most a small fixed pool of animated leaf sprites.

Optional depth could use 6–8 Threlte planes **only if an approved existing scene already provides that runtime**. The default is SVG/CSS; adding a heavy dependency would require the owner's approval.

### 10 — [Three-star triangle trails](10-egg-three-stars-desktop.png)

1672 × 940, approximately 16:9. Three moving stars briefly trace separated, uneven triangular paths during the 02:00 night-radio scene and then return to ordinary stars. Animate three SVG paths with stroke-dashoffset and opacity, using staggered open shapes rather than a solid emblem; estimated 0.5–1 day, under 10 KB vector art, 1–2 KB behavior.

The deliberately unequal, disconnected triangles avoid the familiar filled three-triangle logo. Use a one-shot opportunity after interaction or a rare idle interval; do not run continuous decorative loops.

### 11 — [DevTools ASCII moon and arise()](11-egg-devtools-arise-console-desktop.png)

1672 × 941. A docked console shows an ASCII crescent and the hidden `arise()` command; the painted page beside it shows the shadow effect beginning. Register a small browser-only `window.arise` handler that dispatches the same idempotent scene event as the Konami sequence, log the ASCII once per session, and clean up ownership on teardown; estimated 0.5 day, less than 2 KB behavior and no additional art beyond the existing ARISE scene.

This is a generated screenshot concept, not a screenshot of implemented DevTools behavior. The console UI includes standard browser labels; the product-specific message consists only of the supplied wordmark, ASCII and command tokens.

### 12 — [Golden bonsai — mobile](12-egg-golden-bonsai-mobile.png)

853 × 1844, approximately 9:19.5. A purpose-generated tall composition lifts the canopy above the mascot while retaining the small pot, laptop, coffee and reachable bottom control; it is not a crop of the desktop image. Use responsive art direction with a mobile source plus a separate hit target over the pot and inset controls; estimated 0.5–1 extra day, 80–160 KB mobile art, shared behavior from the desktop version.

## Shared production constraints

- These are visual key frames, not a working implementation or finished export library. All were generated through the built-in image tool and visually inspected; native output dimensions are retained without post-processing.
- The model sheet includes every requested pose/expression/variant. The eight desktop concepts cover all requested eggs and error states; the extra mobile image checks the most vertical transformation.
- PNG references are opaque flattened images. Separate character, effect, backdrop and UI layers must be prepared before animation. Reuse shared backgrounds and a small paper texture instead of downloading every concept as a scene.
- Load optional effect assets only near the relevant scene or on first interaction. Stop animation when the section leaves view or the tab is hidden; avoid per-frame layout reads and continuous particle systems.
- Respect `prefers-reduced-motion`: show a static revealed key frame or immediate state change, with no slash travel, ring tunnel, growing branches or parallax. Easter eggs must remain dismissible and must not block navigation or error recovery.
- Render controls, headings, clocks and labels as DOM elements in production. Generate all final visitor-facing copy, alt text and accessible labels with **gpt-6.1-sol**, then route localized UI strings through Paraglide. No new publication copy is approved by this concept package.
- Clock labels are narrative section hours, not promises of actual user-local time. Lunar eligibility, activation thresholds and cooldowns are proposals to tune during implementation.
- Original visual allusions only: no actual Pokémon, character costumes, franchise logos, copied titan anatomy, or recognizable three-triangle emblem.
- No runtime, accessibility, device or performance testing was performed because this assignment produces artwork only. The saved PNGs were checked for readability, requested coverage, coherent character identity, and valid dimensions.

## Files

- `01-style-a-soft-watercolor.png`
- `02-style-b-crisp-ink.png`
- `03-mascot-complete-model-sheet.png`
- `04-egg-crescent-slash-desktop.png`
- `05-egg-moon-presence-desktop.png`
- `06-egg-arise-shadows-desktop.png`
- `07-error-404-ink-void-desktop.png`
- `08-error-500-giant-at-wall-desktop.png`
- `09-egg-golden-bonsai-desktop.png`
- `10-egg-three-stars-desktop.png`
- `11-egg-devtools-arise-console-desktop.png`
- `12-egg-golden-bonsai-mobile.png`
- `PROMPTS.md`
- `README.md`
