# Making production layers

Production PNG masters for solo-stack.dev. These are independent compositing layers, not website mockups. Generated and inspected 2026-11-01.

## Production and export

All artwork was generated with the built-in image_gen tool using the supplied references. Highest quality was requested in every prompt; this tool exposes no selectable quality/model parameter. No API/CLI image model or dependency installation was used. The generated images were smaller than the requested master dimensions. Final master exports use alpha-aware bilinear resampling, so the larger files do not contain native 2K/4K generated detail. Native dimensions are recorded per layer below and in PROMPTS.md.

Technical export only: preserve generated pigment, add transparent breathing room to cutouts, retain fractional alpha, set fully transparent RGB to zero, replace visible exact #000000 with #0E0F10 and exact #FFFFFF with #FBF3DD, and attach an sRGB PNG chunk. Transparent black RGB is invisible storage, not painted black. All cutouts use real RGBA transparency; no green-screen fallback was needed. There is no baked text, mascot, or human figure in these assets.

## Layers

- **[making-plate.png](making-plate.png)** — 2560×1440 px; 4,172,851 bytes; z=0. RGB: fully opaque. Native generation 1672×941 px. Full-bleed desktop plate. Center stays dark for the morph. No baked moon or lunar sky halo. The original laptop near (89%,69%) and lower-right cliff remain registered; the blank warm laptop screen is the local light at the end of the animated ink line.
- **[making-plate-mobile.png](making-plate-mobile.png)** — 1080×2340 px; 3,127,246 bytes; z=0. RGB: fully opaque. Native generation 852×1846 px. Portrait alternative. Keep the morph in the dark middle. No baked moon or lunar sky halo. The original laptop near (84%,76%) and bottom/right cliff remain registered; the blank warm laptop screen is the local light at the end of the animated ink line.
- **[making-bloom-idea.png](making-bloom-idea.png)** — 1400×1400 px; 2,035,649 bytes; z=1. RGBA: transparent exterior and fractional-alpha edges. Native generation 1254×1254 px. Idea state fill: softly rounded irregular bloom, pale middle, ochre pooled lower left. Center inside the authored idea SVG mask.
- **[making-bloom-ai.png](making-bloom-ai.png)** — 1400×1400 px; 2,144,800 bytes; z=1. RGBA: transparent exterior and fractional-alpha edges. Native generation 1254×1254 px. AI state fill: merging lobes and stronger right-hand pigment pooling. Center inside the authored AI SVG mask.
- **[making-bloom-code.png](making-bloom-code.png)** — 1400×1400 px; 2,253,239 bytes; z=1. RGBA: transparent exterior and fractional-alpha edges. Native generation 1254×1254 px. Code state fill: ragged broad silhouette and richer central ochre. Center inside the authored code SVG mask.
- **[making-bloom-phone.png](making-bloom-phone.png)** — 1400×1400 px; 2,503,573 bytes; z=1. RGBA: transparent exterior and fractional-alpha edges. Native generation 1254×1254 px. Phone state fill: taller organic mass, creamy upper center, darker lower/right pigment. Center inside the authored phone SVG mask.
- **[making-bloom-chart.png](making-bloom-chart.png)** — 1400×1400 px; 2,441,452 bytes; z=1. RGBA: transparent exterior and fractional-alpha edges. Native generation 1254×1254 px. Chart state fill: diagonal spread with dense lower-left granulation. Center inside the authored chart SVG mask.
- **[making-bloom-moon.png](making-bloom-moon.png)** — 1400×1400 px; 2,304,775 bytes; z=1. RGBA: transparent exterior and fractional-alpha edges. Native generation 1254×1254 px. Moon state fill: softly rounded asymmetric wash with multiple ochre pools. Center inside the authored moon SVG mask; this is not a prepainted moon shape.

## Compositing and verification

Layer order is plate (z=0) → masked bloom (z=1) → separately authored SVG ink line (z=2) → live labels/navigation (z=3). Each bloom has the same 1400×1400 canvas and a broad filled center. Size it slightly beyond its SVG mask to avoid gaps at the shape boundary. Crossfade neighboring blooms as the line morphs; the PNGs do not encode lightbulbs, chat bubbles, code symbols, phones, charts, or crescent silhouettes.

The desktop and mobile plates are separately generated companion compositions, not literal crops: this preserves the empty animation area and relocates the cliff/laptop for the portrait layout. The laptop screen is intentionally blank. The cliff and laptop are baked into each plate and cannot be independently animated from these files. The baked moons were removed on 2026-11-03. The animated ink line ends at the laptop screen; a separately composited CSS screen glow can reinforce its light. No code or derivative files were changed by this art repair.

All eight images were visually inspected individually and together on #18191B. Dimension checks passed; all six bloom images have real transparent exteriors and fractional-alpha edges; every cutout outer border is transparent; visible pure-black/pure-white pixel counts are zero. No central symbol, continuous ink line, text, or mascot is baked into the plates.

## Moon removal — 2026-11-03

Both plates were repaired with built-in image_gen edits and composited back through feathered masks. The tool exposes neither its underlying model identifier nor model/quality selectors; highest quality was requested in each prompt. Desktop used a second generation to improve the coarse pigment-grain match. Only generated sky pixels were used; original laptop, blank screen, cliff silhouette and cliff-top paint were protected. Background pixels contaminated by the moon immediately beside the screen were included in the repair. The existing warm cliff rim and lower-left pigment washes remain as authored.

Final mask bounds are half-open pixel coordinates, (left, top)–(right, bottom): desktop **(1878, 573)–(2560, 1048)**; mobile **(578, 1403)–(1080, 1830)**. These are support bounds, including the feather; neither is a rectangular replacement. The exact grayscale audit masks are [desktop](moon-removal-masks/desktop.png) and [mobile](moon-removal-masks/mobile.png): zero preserves the original pixel, 255 uses the repair, intermediate values feather. These technical masks are not production artwork and intentionally use black/white.

Pixel-diff verification against the pre-edit originals found **zero changed pixels outside either mask**, including protected holes inside their bounding boxes. All 3,431,274 desktop and 2,356,843 mobile pixels outside mask support retain identical RGB bytes and matching SHA-256 digests. Independent checks found zero changes in the protected dark laptop frame, blank screen interior and cliff region. Final exports retain 2560×1440 and 1080×2340 dimensions, opaque 8-bit RGB, an sRGB chunk, and zero exact #000000/#FFFFFF pixels. Full plates and native-size/zoomed repair crops were inspected for seams, halo remnants and registration. See PROMPTS.md for exact prompts, source hashes and audit results.

## Integration limits

Keep these large masters outside the shipped bundle. Generate optimized responsive AVIF/WebP derivatives during implementation; the homepage handoff budgets are approximately 250 kB for initial hero images and 400 kB per subsequent section. No application files or optimized derivatives were changed here. All requested layers are present; the material limitation is that final target dimensions are resampled from smaller built-in generations.

Exact generation prompts and ordered input references: [PROMPTS.md](PROMPTS.md).
