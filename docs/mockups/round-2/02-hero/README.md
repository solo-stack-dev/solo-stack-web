# 20:00 · Hero concepts

13 final PNG mockups, generated with the built-in imagegen tool and inspected individually. These are design studies, not production UI or extracted animation assets. Only the existing wordmark, requested clock, code icon, and internal diagram numerals appear; no new public copy has been authored.

## Recommendation

Favorite: **01-paper-lightbox-desktop.png**. It turns the existing banner into a distinctive tactile world while giving Threlte a clear eight-plane implementation path. **12-bonus-moon-tear-desktop.png** is the bolder alternative when the strongest possible opening gesture matters more than implementation simplicity.

## Delivery and estimates

Desktop hero files are 1672 × 941 (approximately 16:9). Mobile hero files are approximately 9:19.5: 853 × 1844 for the lightbox and 852 × 1846 for the other three; the generator's native dimensions are preserved without stretching. Interaction sheets use their own layouts. All files are lossless PNG; production exports should be separately compressed and sized.

Costs below are rough engineering/art-preparation estimates for an experienced implementer, not quotes or measured runtime figures. Incremental costs assume the corresponding desktop variant already exists; alternative variants are not intended to run together. Texture and draw-call numbers are targets to validate on real devices.

## Paper-cut lightbox · desktop

[01-paper-lightbox-desktop.png](./01-paper-lightbox-desktop.png)

Eight overlapping painted paper planes turn the banner into a luminous night theatre, with the owner and laptop on the right cliff. The moon rises slightly on entry, dust drifts sparingly, and one shooting star crosses after the scene settles.

**Build:** Threlte orthographic camera, eight alpha-masked planes, baked shadow sprites, one small instanced dust system; fixed HTML wordmark/nav above the canvas.

**Rough cost:** High: 4–6 implementation days including layer extraction and desktop art preparation; target 8–12 scene draw calls and 1–2 MB compressed textures.

## Paper-cut lightbox · mobile

[02-paper-lightbox-mobile.png](./02-paper-lightbox-mobile.png)

The wordmark moves above the central moon, while the cliff and owner anchor the lower half. A subtle one-time depth reveal replaces pointer tilt; no device-orientation permission is needed.

**Build:** Separate mobile framing/texture atlas; CSS layered-image fallback, or reuse Threlte planes with a narrow orthographic camera.

**Rough cost:** Medium incremental: 1–2 days beyond desktop; target 0.6–1.2 MB textures and capped DPR 1.5.

## Paper-cut lightbox · eight-plane construction

[03-paper-lightbox-exploded.png](./03-paper-lightbox-exploded.png)

The axonometric assembly separates the sky, moon, far mountains, middle hills, cliff, owner, grass, and branches. Technical numerals describe build order; the assembled inset checks visual alignment.

**Build:** Threlte reference only: 01 sky z=-7, 02 moon -6, 03 mountains -5, 04 hills -4, 05 cliff -3, 06 owner -2.9, 07 grass -1, 08 branches 0; these are relative illustrative units, not measured geometry.

**Rough cost:** Included in lightbox estimate; extraction into clean alpha textures is still required. This PNG is a diagram, not a layered source file.

## Paper-cut lightbox · pointer state

[04-paper-lightbox-mouse-tilt.png](./04-paper-lightbox-mouse-tilt.png)

The cursor at the right pulls foreground foliage and the cliff farther than the moon and sky. The wordmark remains fixed, with restrained displacement preserving the quiet mood.

**Build:** Threlte group rotation capped around ±3–4 degrees, damped pointer offsets per layer, ~12 px foreground travel; render on demand until damping settles.

**Rough cost:** Low incremental: 0.5–1 day; no new texture set, no full-scene real-time shadow pass.

## Painted 3D moon · desktop

[05-painted-moon-desktop.png](./05-painted-moon-desktop.png)

A monumental pigment-covered moon extends off-screen behind the wordmark, with the drawn owner on its rim and a painted portrait cameo. Very slow texture rotation and a rare shooting star give it life; clicking changes its illumination phase.

**Build:** Threlte low-segment sphere with painted albedo and roughness, soft analytic terminator shader; owner billboard/portrait remain screen-readable and HTML type stays fixed.

**Rough cost:** High: 3–5 days including painting a seamless spherical texture; target one sphere plus 2–4 quads, 1–1.8 MB textures.

## Painted 3D moon · mobile

[06-painted-moon-mobile.png](./06-painted-moon-mobile.png)

The moon becomes a huge cropped diagonal body below stacked typography, and the owner remains legible on its rim. A large accessible moon control cycles phases without relying on hover.

**Build:** Reuse moon shader and texture with mobile camera/framing; independent touch hit area, real HTML phase buttons, static poster first.

**Rough cost:** Medium incremental: 0.5–1 day; cap DPR and suspend rotation when offscreen.

## Painted 3D moon · four click states

[07-painted-moon-phase-strip.png](./07-painted-moon-phase-strip.png)

Four separate frames compare crescent, half-lit, gibbous, and full illumination. This is an artistic interaction sequence, not a claim about the current astronomical moon phase.

**Build:** Animate the shader light direction/phase parameter over ~650 ms per click; do not rotate or move the owner with the surface, and keep UI stationary.

**Rough cost:** Medium incremental: 0.5–1 day; negligible extra texture memory because one sphere material handles all phases.

## Painted live · final cursor-trail state

[08-painted-live-desktop.png](./08-painted-live-desktop.png)

Butter paper bleeds into a finished ink-and-watercolor night with the owner working on the cliff. The cursor leaves a short, fading trail of ochre pigment blooms without obscuring the wordmark.

**Build:** SVG masks reveal prepainted washes; SVG path strokes draw cliff details; CSS translates the moon; optional small Canvas 2D trail overlay with a fixed particle cap.

**Rough cost:** Medium: 2–4 days including mask preparation; target 0.6–1.2 MB compressed art, no Three.js required.

## Painted live · mobile final state

[09-painted-live-mobile.png](./09-painted-live-mobile.png)

The light paper and wordmark occupy the top, while the painting resolves into a moonlit cliff below. A brief tap bloom can echo desktop pigment trails, with no continuous touch tracking or scroll interference.

**Build:** Mobile-specific SVG masks and static poster; optional isolated Canvas 2D tap feedback, pointer events left available for scrolling.

**Rough cost:** Low incremental: 0.5–1 day; omit tap feedback on low-power/reduced-motion configurations.

## Painted live · three desktop stages

[10-painted-live-storyboard-desktop.png](./10-painted-live-storyboard-desktop.png)

Read top to bottom: pigment and drawn contours, dark washes with the moon partly risen, then the finished moonlit scene. The wordmark and navigation remain available throughout; these are wide storyboard crops rather than three full-size screenshots.

**Build:** SVG mask keyframes and stroke-dashoffset; suggested stages ~0–450 ms blooms, ~450–1000 ms ink/wash, ~1000–1600 ms moonrise, with overlapping timing.

**Rough cost:** Included in painted-live estimate; prepainted masks avoid expensive live fluid simulation.

## Painted live · three mobile stages

[11-painted-live-storyboard-mobile.png](./11-painted-live-storyboard-mobile.png)

Read left to right: pale pigment and cliff outline, partial owner and darker wash, then the completed moonrise and tap-bloom state. The composition stays vertically anchored so the reveal does not shift content.

**Build:** Reuse the reveal timeline with mobile masks and fixed layout dimensions; keep poster immediately available while enhanced masks load.

**Rough cost:** Included in mobile adaptation estimate; no separate simulation or additional 3D runtime.

## Bonus · the night tears open · desktop

[12-bonus-moon-tear-desktop.png](./12-bonus-moon-tear-desktop.png)

A vast curled tear in butter-colored paper becomes the crescent moon itself, revealing the owner coding inside the night. On entry the paper edge opens just enough to expose warm light, then rests; the moon is a material gesture rather than a separate disk.

**Build:** Three to five alpha planes in Threlte, one low-poly curled-paper strip mesh, baked inner glow and shadows; CSS/SVG mask version is a viable cheaper interpretation.

**Rough cost:** High: 4–7 days for convincing curl geometry/material and art preparation; target 6–10 draw calls and 1–2 MB textures.

## Bonus · the night tears open · mobile

[13-bonus-moon-tear-mobile.png](./13-bonus-moon-tear-mobile.png)

The crescent tear runs vertically beneath the huge wordmark, keeping the little studio visible inside its arc. A small opening reveal leads downward into the next hour without a scroll trap.

**Build:** Dedicated vertical framing with CSS clipped layers as default; load the curled-paper mesh only where the performance budget permits.

**Rough cost:** Medium incremental: 1–2 days; static mobile poster should remain a first-class finish.

## Implementation guardrails

- Render a responsive static hero poster immediately; lazy-load the enhancement, not the hero's first meaningful image. Keep wordmark, clock, menu, play link, and phase controls in real accessible HTML.
- Respect prefers-reduced-motion with the completed static scene, no parallax, no cursor trails, and no automatic rotation. Offscreen or hidden tabs suspend rendering.
- Use narrow texture atlases, baked shadow/glow artwork, and limited alpha overdraw. Avoid full-screen bloom postprocessing and fluid simulation.
- User-visible control labels and alt text must be generated with gpt-6.1-sol before production. The icon-only concept screens need accessible labels in implementation.
- Mockup portraits are concept interpretations. The selected mascot should be normalized into one approved character sheet before assets for the full site are drawn.
- Navigation remains unobtrusive; clock is the section's narrative time, not the visitor's current clock. No invented metrics or real-time claims.
- Visual QA checked wordmark spelling, limb counts, drawn character treatment, brand palette, interaction-stage distinction, and responsive composition. Small material/character variations between directions remain intentional exploration.

## Provenance

PROMPTS.md contains exact prompts and reference paths per retained image. generation-log.json is the machine-readable record. The first desktop lightbox was corrected from photographic terrain/person to painted paper and a drawn mascot. A short mobile lightbox and failed single-scene phase strip were excluded from final delivery. No files outside this assigned folder were edited; generated originals remain in the image tool's managed output directory.
