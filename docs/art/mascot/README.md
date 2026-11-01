# Mascot model sheet v2 and pose layers

Generated with the built-in image generation tool on 2026-11-01. The approved night-shift reference style, owner portrait, banner and selected model sheet were supplied as image inputs; exact prompts and ordered paths are in [PROMPTS.md](PROMPTS.md). All artwork is original and contains no text. This folder contains production masters, the small game export, and integration notes only.

## Readiness and known limitation

The model sheet, hero, typing loop, cinema pose, 404 pose, golden variant and game sprite passed visual inspection. The typing frames have identical pixels outside the hand region.

**The four sunrise drawings are supplied, but the walk loop is NOT production-approved.** Multiple targeted regenerations improved the passing pose but did not reliably reverse the near/far leg overlap in frame 3; frame 4 also has a pronounced knee lift. These can produce a hitch or marching motion. They need an animator's leg-overlap/timing cleanup or a further generation pass before shipping as a seamless walk loop. Use frame 1 as a static fallback meanwhile. A later three-armed retry was rejected and is not included. No other layer is missing.

## Files

All byte counts are exact; dimensions describe the complete canvas, including transparent padding.

| File                                                               | Pixels      |   Bytes | Background        | Intended use                                                                                                                   |
| ------------------------------------------------------------------ | ----------- | ------: | ----------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| [`mascot-404-lost.png`](mascot-404-lost.png)                       | 1024 × 1536 | 2062494 | RGBA transparency | §5.8 — small confused figure for ink-void 404; bottom anchor approximately (535, 1489).                                        |
| [`mascot-cinema-sitting.png`](mascot-cinema-sitting.png)           | 1254 × 1254 | 1280056 | RGBA transparency | §5.6 — behind/three-quarter spectator, looking right/up. Seat anchor approximately (530, 1115); cliff and laptop are separate. |
| [`mascot-game-sprite-master.png`](mascot-game-sprite-master.png)   | 1254 × 1254 |  870272 | RGBA transparency | §5.3 — native generated master retained for future size exports; not a runtime import.                                         |
| [`mascot-game-sprite.png`](mascot-game-sprite.png)                 | 64 × 64     |    4634 | RGBA transparency | §5.3 — actual 64×64 prototype sprite; figure is 30×60 inside the canvas, bottom-center anchor (32, 62).                        |
| [`mascot-golden.png`](mascot-golden.png)                           | 1024 × 1536 | 2204507 | RGBA transparency | §5.8 / §5.1 — golden shiny hero replacement; same approximate seat anchor (740, 980). Includes small sparkle marks.            |
| [`mascot-hero-moonrim.png`](mascot-hero-moonrim.png)               | 1024 × 1536 | 2151110 | RGBA transparency | §5.1 — hero, sitting on an independently rendered moon. Seat anchor approximately (740, 980). No rim is painted.               |
| [`mascot-model-sheet-v2.png`](mascot-model-sheet-v2.png)           | 1536 × 1024 | 2852962 | Opaque paper      | §3.4 / §6.2 — identity and palette reference; opaque cream paper. Four turnarounds, six expressions and unlabeled swatches.    |
| [`mascot-nightshift-typing@1.png`](mascot-nightshift-typing@1.png) | 1024 × 1536 | 2084332 | RGBA transparency | §5.4 — typing base and reduced-motion still; figure and complete chair only.                                                   |
| [`mascot-nightshift-typing@2.png`](mascot-nightshift-typing@2.png) | 1024 × 1536 | 2604770 | RGBA transparency | §5.4 — second typing beat; generated hands assembled over frame 1.                                                             |
| [`mascot-nightshift-typing@3.png`](mascot-nightshift-typing@3.png) | 1024 × 1536 | 2613299 | RGBA transparency | §5.4 — third typing beat; generated hands assembled over frame 1.                                                              |
| [`mascot-sunrise-walk@1.png`](mascot-sunrise-walk@1.png)           | 1152 × 1600 | 2611263 | RGBA transparency | §5.7 — first contact drawing; animation cleanup still required for the complete loop.                                          |
| [`mascot-sunrise-walk@2.png`](mascot-sunrise-walk@2.png)           | 1152 × 1600 | 2496664 | RGBA transparency | §5.7 — revised passing drawing; animation cleanup still required for the complete loop.                                        |
| [`mascot-sunrise-walk@3.png`](mascot-sunrise-walk@3.png)           | 1152 × 1600 | 2558103 | RGBA transparency | §5.7 — opposite-step candidate; leg overlap is not sufficiently distinct from frame 1.                                         |
| [`mascot-sunrise-walk@4.png`](mascot-sunrise-walk@4.png)           | 1152 × 1600 | 2466100 | RGBA transparency | §5.7 — raised-knee passing candidate; knee lift is stronger than a relaxed walk.                                               |

## Transparency and inspection

Every pose and the game master/export contain real alpha transparency; no green-screen fallback or keying is needed. The model sheet intentionally has opaque warm paper. Alpha was decoded and checked numerically, including fully transparent exterior pixels; the hero and typing layers were composited over cream for inspection, and the walk set and 64px sprite were checked over anthracite. Preserve the soft alpha fringe during conversion. The PNGs can contain nonzero RGB beneath alpha-zero pixels; this is invisible when correctly composited and must not be flattened into a dark rectangle.

Every generated image was viewed, and changed output frames were checked again after registration/assembly. The first model sheet was rejected for long legs. Prompt history includes rejected and superseded attempts, but those image files are not included.

## Registration and animation

Coordinates are source pixels from top left. The visual seat/hand anchors below are approximate integration guides, not automatic collision geometry. Numerical foot baselines use the lowest pixel with alpha greater than 16.

- **Hero / golden:** same 1024×1536 canvas, approximate seat contact (740, 980), or 72.3% / 63.8%. Place this point on the moon upper rim; feet dangle below it. Hero native alpha bounds are (99,71) through (923,1435), so the visible figure is 1365px high on a 1536px canvas. The built-in returned this native size despite the approximately 1600px figure requested; it was not enlarged artificially. Golden has tiny extra sparkles and a few-pixel outline variation, so it is a placement-compatible variant, not a pixel-identical silhouette.
- **Typing:** all three canvases are 1024×1536. Keep the canvas fixed when switching frames. Chair-wheel baseline y=1472; chair center near x=650. Near typing fingers sit around (155,805), farther fingers around (285,775). Composite a separate keyboard/desk in front at those contact points; neither is painted into these layers. Frame 1 is the reduced-motion still. A restrained 1→2→1→3 sequence around 5–7 frame changes per second is a starting point for integration.
- **Cinema:** 1254×1254, seat near (530,1115), gaze up/right. The laptop belongs to a separate layer to the mascot's right. Do not align by the image bottom; preserve its transparent lower margin.
- **Sunrise:** all four are 1152×1600, unchanged native drawing scale, pivot approximately (590,1500), measured foot baseline exactly y=1500. Original 1024×1536 images were padded 64px on each side and translated vertically; no independent trim or resize was applied. Translation offsets for frames 1–4 are (64,45), (64,21), (64,45), (64,38). Their vertical pose positions vary slightly. See readiness limitation above before animating.
- **404:** bottom contact near (535,1489); intended display around 100–180px high. The image contains the figure only, so the ink void is a separate page background.
- **Game:** 64×64 RGBA export, 60px-tall figure at x=17..46 and y=2..61. Bottom-center origin (32,62). Checked at actual 64px canvas size. The 1254×1254 master is retained separately.

## Deterministic finishing

All painted content came from image generation. Local dependency-free PNG processing was used only for assembly, registration, resizing and inspection; no anatomy or painted content was drawn with code.

- Typing frames 2 and 3 retain frame 1 verbatim outside generated hand patches. Patches use source rectangles [110,745,254,852) and [231,705,388,806), with a 7px linear inward feather. The union lies inside x=110..387, y=705..851. Pixel comparison found **zero changed pixels outside that region** in both frames. Hair, face, body, clothing, chair and framing cannot flicker. The patches include the immediate wrist transition needed for a clean join.
- Walk registration uses the translations above, preserving original pixels. This fixes canvas and baseline consistency but does not fix the unresolved gait.
- The game sprite is an alpha-aware area-resampled export of source crop (363,73,536,1099), reduced to 30×60 and placed at (17,2) on a 64×64 transparent canvas. The master remains unchanged.

## Integration budget

Per handoff §6.4, keep these large PNG masters outside the runtime bundle. Export responsive alpha-preserving WebP/AVIF derivatives through the project image pipeline. Assemble the three typing frames into one optimized sprite sheet; do the same for walking only after animation cleanup. Preserve full frame canvases so anchors do not shift. Lazy-load below-fold art, pause animation off screen, and use the documented still frames for reduced motion. No source components, public copy, dependencies or deployment settings were changed.
