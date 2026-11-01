# Full homepage composites — round 2

Internal design studies for **one night in the studio**, 20:00 → 06:00. Created using the built-in image generation tool, with the brand banner and owner's profile as references. These are generated raster mockups, not HTML screenshots or implementation assets.

**Recommended: `01-painted-night-lightbox-desktop.png`.** Its illuminated paper arch makes the opening distinctive; the physical layers then dissolve into painted scenery, leaving room for the quieter coding and radio scenes before sunrise.

All visible TODO(copy) strings and abstract code/paragraph marks are placeholders. Existing brand words, time labels and iconography are illustrative. Visitor-facing copy must still come from gpt-6.1-sol; no new publishable prose was authored for these images.

## Final images

### 01-painted-night-lightbox-desktop.png — 724 × 2172
Option 1: painted night A with a paper-cut lightbox B hero, showing all seven scenes in one desktop page. Animate the moon and six to eight hero planes with tiny depth offsets; as the hero leaves view, let its cut edges merge into stationary watercolor masks, then use only subtle steam and radio-wave motion below. Build the hero as a lazy Threlte island with a static image fallback, and the remaining scenery with responsive image layers, SVG masks and CSS; rough art preparation plus frontend effort is **7–11 working days**.

### 02-paper-cut-lightbox-desktop.png — 724 × 2172
Option 2: paper-cut lightbox B throughout, with overlapping charcoal paper ridges, illuminated edges and a yellow paper dawn. Small relative shifts of adjacent silhouette planes can connect one scene to the next; pause all motion outside the viewport and never rotate the entire site as a 3D world. Build most depth with layered transparent artwork and CSS transforms/shadows, reserving Threlte for the hero or game scene; rough effort is **10–16 working days**, primarily because the artwork needs consistent separation into layers.

### 03-painted-night-ink-accents-desktop.png — 725 × 2170
Option 3: painted night A, with a brief ink sweep at the game, an ink clock tab at 01:00, and restrained stippling/linework at transitions. Reveal these ink gestures once using SVG stroke/mask animation, then return to quiet painted scenery rather than sustained flashing or speed effects. Build with responsive painted artwork, SVG overlays and CSS; rough effort is **6–10 working days**, with low runtime complexity relative to the other directions.

### 04-painted-night-lightbox-mobile-full.png — 793 × 5523
The full option 1 mobile composition, locally stitched from three separately generated slices with a 95-pixel smooth overlap at each quiet charcoal join; the third source was resized proportionally to the common width. Headings and tap controls lead the scenes, while moonrise, workbench, game, coding, radio, cinema and dawn form one long vertical landscape. Use responsive art direction in picture elements and the same SVG/CSS treatment as desktop, with the Threlte hero optional on small devices; allow **2–4 additional working days** beyond the desktop direction for mobile art crops, spacing and accessibility checks.

### 04-mobile-slice-1-moonrise-making.png — 793 × 1983
Mobile opening: illuminated paper arch, moonrise and the making workbench, with the paper layers dissolving into painted cliffs. Use small hero-plane offsets followed by static pigment overlaps and a single optional coffee-steam SVG; this slice belongs to the shared mobile adaptation estimate above.

### 04-mobile-slice-2-game-night-shift.png — 793 × 1983
Mobile middle: original chibi moon game followed by the most intimate coding scene, with dark valleys providing a pause between activities. A lightweight Canvas 2D game should load only after the play control is activated; otherwise this is static art with optional steam motion, and the game logic is additional to the design implementation estimate.

### 04-mobile-slice-3-radio-cinema-sunrise.png — 845 × 1862
Mobile ending: radio controls and painted hardware, a large outdoor projection screen, then butter-yellow sunrise paper. Animate a small SVG waveform only during intentional playback, load video on demand, and let the projector light and dawn overlap through static pigment masks; this slice belongs to the shared mobile adaptation estimate.

## Flow and transitions

- **20:00 → 21:00:** hero paper edges lose their cut precision and become pigment blooms; the cliff descends into the workbench ledge.
- **21:00 → 22:00:** the ledge breaks into small stepping stones that lead to the original moon island.
- **22:00 → 01:00:** the warm game surface recedes behind deeper charcoal cliffs, concentrating attention on the desk lamp.
- **01:00 → 02:00:** coffee steam becomes fine radio-wave linework and a winding light path.
- **02:00 → 04:00:** the path crosses the valley into the projector beam; the sky begins to lighten.
- **04:00 → 06:00:** projection light dissolves into mist, then butter pigment paper; dark footer typography restores the bright side of the brand.

Alternate the visual weight of text and objects on desktop; on mobile, prioritize readable headings and controls above each principal object. The charcoal joins in the mobile composite are intentional quiet pauses rather than new container backgrounds.

## Build boundaries and cost assumptions

Estimates are planning ranges for one experienced frontend developer with illustration preparation, not quotes or measured results. They include layer preparation, responsive layout, limited motion and a static reduced-motion treatment; exclude production copy, a fully implemented game, media licensing, backend integrations and deployment. Generation billing was not exposed by the built-in tool, so no monetary generation cost is claimed.

These PNGs describe art direction and flow. Reconstruct production scenes from properly separated, optimized artwork; do not ship the complete tall PNG as the homepage. Preserve semantic HTML text and usable buttons, sufficient contrast, keyboard access, and static fallbacks. Use one small reusable grain texture, stop offscreen animation, lazy-load below-the-fold artwork, and honor prefers-reduced-motion.

## Reproduction and checks

- Exact initial, correction and mobile prompts, with reference provenance: **PROMPTS.md**.
- Dependency-free local stitcher: **stitch-mobile.mjs**. Run `node stitch-mobile.mjs` from any directory to rebuild the full mobile PNG beside it.
- The stitcher uses only Node built-ins, reads noninterlaced RGB/RGBA PNGs, normalizes widths, blends joins and writes a PNG. No package was installed.
- All final images were inspected for scene order, seven clock times, palette, legible placeholder text, chibi consistency, obvious anatomy issues and transitions. The stitched image was inspected after compositing.
- The two initial material attempts are retained in **rejects/**: option 1 needed the 20:00 label and clearer paper depth; option 2 needed visible layered paper material.
- Native generation dimensions are reported above. The desktop images are full-page composition studies rather than 1440-pixel-wide production exports.
- All deliverable writes were confined to this assigned folder. The image tool's own source outputs remain in its default generated-images directory.
