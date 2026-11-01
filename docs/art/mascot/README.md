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

## Walk replacement package — 2026-11-01

This section supersedes the four-frame walk's readiness note **only for the new files below**. The original files remain unchanged. New paintings were made with the built-in image generation tool using model sheet v2, the style-lock scene and the old contact drawing as references. The final body explicitly places the laptop under the **left/far arm**, mostly hidden behind the right-facing torso; the near/right arm is empty and separate.

### A: registered four-part puppet

Every production layer uses a **1152 × 1600 RGBA canvas**. Stack at the same origin; do not trim transparent padding. Exact transform origins in source pixels:

- Near/right leg hip: **(570, 970)**.
- Far/left leg hip: **(535, 970)**.
- Near/right arm shoulder: **(477, 646)**.
- Rest ground line: **y = 1500**; overall placement anchor **(570, 1500)**.
- Back-to-front z order: **far leg → body → near leg → near arm**.

Files: [body](walk-puppet-body.png), [near leg](walk-puppet-leg-near.png), [far leg](walk-puppet-leg-far.png), [near arm](walk-puppet-arm-near.png). [Rest assembly](walk-puppet-rest.png) is a useful reduced-motion still. Leg tops retain generous painted cloth overlap with a soft 65px alpha ramp at the upper cut; shoulder cap is rounded and overlaps the body. [Joint check](walk-joint-check.png) checks hip and shoulder rotations at −30°, 0°, +30° over anthracite. This is an overlap stress test, not a recommended gait.

Straight rigid legs support the simplest CSS puppet. Keep their swing modest; they do not bend at the knee. **The smooth puppet GIF uses a continuous leg mesh**, not just four CSS rotation transforms. For that version, use [walk-rig.json](walk-rig.json) and the offline reference implementation in [build-walk.mjs](build-walk.mjs):

- Near mesh knee **(569, 1210)**, ankle **(570, 1420)**.
- Far mesh knee **(525, 1210)**, ankle **(535, 1420)**.
- Knee skin weights blend across 150px, centered on the knee; ankle weights across 70px, centered on the ankle. Source grid spacing is 10px. Rotations are clockwise-positive and hierarchical: hip → knee → ankle.
- Rounded split thigh/shin experiments exposed cut edges at deeper bends and were rejected. **No split-leg production PNGs are supplied.** The whole-leg textures stay connected under mesh deformation; there are no new painted pixels at the joints.
- The JSON records the exact eight near/far joint poses, body translations, arm angles, foot targets, clearance and pitch. The far leg is half a cycle out of phase. Interpolating these poses gives the continuous preview; its contact is approximate between sampled keyframes. A live implementation can solve foot IK continuously if stricter contact is needed.

### B: eight-frame sprite cycle

[walk-cycle-sheet.png](walk-cycle-sheet.png) is **9216 × 1600**, eight 1152px cells in one row. [mascot-walk8@1.png](mascot-walk8@1.png) through [mascot-walk8@8.png](mascot-walk8@8.png) are the identical-size exports. Frame origin is unchanged; ground is **y = 1500 in every frame** (lowest pixel with alpha >16).

Sequence: **near contact → down → passing → up → far contact → opposite down → opposite passing → opposite up → frame 1**. Frame 1 has the near leg forward; frame 5 has it behind. The maximum swing-foot clearance is 60px (about 5px when displayed 140px high). Body bob spans 35px. Foot pitch and inverse kinematics keep support feet on the baseline; the two contact frames have both feet at the ground. Head, face, torso and laptop share one unchanged source painting with vertical translation only. There is no independent head redraw/flicker.

**Provenance:** B is a deterministic animation bake of the generated puppet paintings, not eight independent generated illustrations. An attempted single generated eight-frame atlas repeated poses and moved the laptop and was rejected. Baking a continuous skin mesh gives a dependable alternate-leg loop without the cut-joint artifacts. The atlas was assembled from the full-resolution frame buffers; slicing its 1152px cells reproduces the frame pixels exactly.

[Eight-frame preview](walk-cycle-preview.gif): 288×400, 8 frames, 110ms each, 880ms loop. [Continuous puppet preview](walk-puppet-preview.gif): 288×400, 32 frames, 30ms each, 960ms loop. GIFs are review artifacts; use alpha-preserving PNG/WebP/AVIF for runtime. The palette/1-bit GIF transparency is not a production alpha reference.

### Inspection, recommendation and integration

Checked the generated originals, assembled figure, leg/foot details at **100%** in [walk-detail-check.png](walk-detail-check.png), the alternating poses in [walk-contact-sheet.png](walk-contact-sheet.png), and both looping previews. Numerically checked RGBA dimensions, all eight y=1500 baselines, frame/sheet pixel equality, timing, and unchanged older artwork. Warm watercolor texture and ink outlines are preserved, with no text, backdrop, halo or ground shadow baked into production layers. Four unmodified generation masters are retained as walk-source-*.png (each 1064×1478); registered output sizes do not claim newly generated detail at 1152×1600.

**Recommendation:** A with continuous mesh motion is the smoothest and most adjustable; B is the safest immediate integration if the developer wants a simple sprite animation. Four rigid CSS limbs alone are less natural than B because the knees stay straight. Do not ship the offline CPU mesh renderer as a per-frame main-thread workload. Bake more frames offline or implement a lightweight cached mesh if choosing continuous A. No extra npm packages were installed.

Drive phase from distance traveled along the path to avoid skating. The gait is in place; world translation and fitting to the sloping cliff belong to the section implementation. Pause while idle/offscreen and use the rest assembly or frame 1 for reduced motion. Export appropriately sized alpha assets before runtime use; the wide master sheet is not intended as a direct mobile download.

Rebuild with an already installed Sharp: `node docs/art/mascot/build-walk.mjs`. If this worktree has no node_modules, pass the existing module directory as the sole argument (this run used `D:/repos/solo-stack-web/node_modules/.pnpm/sharp@0.35.5/node_modules/sharp`). The script writes only this folder. [walk-validation.json](walk-validation.json) records checks. [walk-files.json](walk-files.json) records exact dimensions and byte sizes for all new art and supporting files (excluding itself and the two appended docs).

### New delivery inventory

- `build-walk.mjs`: 14,926 bytes.
- `mascot-walk8@1.png`: 1152×1600, 1,152,351 bytes.
- `mascot-walk8@2.png`: 1152×1600, 1,127,133 bytes.
- `mascot-walk8@3.png`: 1152×1600, 1,041,580 bytes.
- `mascot-walk8@4.png`: 1152×1600, 1,120,080 bytes.
- `mascot-walk8@5.png`: 1152×1600, 1,127,551 bytes.
- `mascot-walk8@6.png`: 1152×1600, 1,071,619 bytes.
- `mascot-walk8@7.png`: 1152×1600, 1,099,560 bytes.
- `mascot-walk8@8.png`: 1152×1600, 1,143,606 bytes.
- `walk-contact-sheet.png`: 1152×800, 586,153 bytes.
- `walk-cycle-preview.gif`: 288×400, 185,730 bytes.
- `walk-cycle-sheet.png`: 9216×1600, 6,453,605 bytes.
- `walk-detail-check.png`: 3000×1240, 3,139,323 bytes.
- `walk-joint-check.png`: 1152×533, 318,986 bytes.
- `walk-puppet-arm-near.png`: 1152×1600, 135,272 bytes.
- `walk-puppet-body.png`: 1152×1600, 736,196 bytes.
- `walk-puppet-leg-far.png`: 1152×1600, 235,883 bytes.
- `walk-puppet-leg-near.png`: 1152×1600, 253,125 bytes.
- `walk-puppet-preview.gif`: 288×400, 741,267 bytes.
- `walk-puppet-rest.png`: 1152×1600, 1,060,951 bytes.
- `walk-rig.json`: 5,223 bytes.
- `walk-source-arm.png`: 1064×1478, 576,743 bytes.
- `walk-source-body.png`: 1064×1478, 936,546 bytes.
- `walk-source-far.png`: 1064×1478, 701,029 bytes.
- `walk-source-near.png`: 1064×1478, 781,043 bytes.
- `walk-validation.json`: 1,850 bytes.

### C: sixteen-frame cycle for the sunrise footer (2026-11-01)

`node docs/art/mascot/build-walk.mjs <sharp module path> --frames=16` bakes a 16-frame cycle from the same puppet and leaves every file above untouched. Differences from B: the support foot moves back at a **constant** speed relative to the hip during stance (140 → −200 px over half a cycle; B's eight keys were uneven: 95/110/80/55 px), so a runtime that advances the figure by exactly `cycleLength / frames` = 42.5 px per frame keeps the planted foot fixed. Swing x is cosine-eased, lift is `62·sin(π·t^0.75)` (fits B's 0/55/60/35), pitch, bob and arm angle are periodic Catmull-Rom through B's eight keys.

Outputs: `mascot-walk16@1…16.png` (full frames, review only; not committed, the command regenerates them), `walk16-leg-far@1…16.png` and `walk16-leg-near@1…16.png` (each leg alone, bob baked in; the production source), `walk16-cycle.json` (step length 340 px, per-frame bob, arm angle, IK joint angles, bounds). Frames 1 and 9 are the contact poses. The sunrise section (`src/lib/home/sections/sunrise/tools/build-assets.mjs`) packs the legs into one atlas and layers it with the static body (translateY by bob) and near arm (rotated around the shoulder), which costs about half the bytes of a full-figure sheet.
