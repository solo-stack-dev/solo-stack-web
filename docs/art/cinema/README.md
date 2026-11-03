# Cinema production layers

Original watercolor and ink illustrations for the 04:00 scene. No moon, mascot, text, numbers, logos or screen content are baked into the landscape plates. Genuine alpha is present on the cliff, frame and beam; no green-screen fallback was needed. Source PNGs stay outside the application bundle. Generate optimized responsive derivatives during integration.

## Files

- `cinema-landscape.png`: **2560×1440 px**, 4,519,047 bytes; opaque RGB with an explicit sRGB chunk; no baked moon. Native generation: 1672×941 px.
- `cinema-landscape-mobile.png`: **1080×2340 px**, 3,405,977 bytes; opaque RGB with an explicit sRGB chunk; no baked moon. Native generation: 830×1896 px.
- `cinema-cliff.png`: **1600×1400 px**, 3,737,294 bytes; RGBA, genuine transparency. Native generation: 1341×1173 px.
- `cinema-frame.png`: **2000×1400 px**, 1,823,347 bytes; RGBA, genuine transparency. Native generation: 1586×992 px.
- `cinema-beam.png`: **1600×1200 px**, 2,029,585 bytes; RGBA, genuine transparency. Native generation: 1448×1086 px.

- `PROMPTS.md`: exact prompts, ordered references, generation iterations and technical export steps.
- `README.md`: this placement and integration contract.

## Exact frame aperture

Final frame canvas: **2000×1400 px**.

Inner video window: **(160, 224, 1680, 945)** in **(x, y, width, height)** format, top-left origin; right edge 1840 and bottom edge 1169 are exclusive. 1680/945 = **16/9 exactly**. Every pixel in this rect was verified to have **alpha 0** after export.

For a responsive frame wrapper with aspect-ratio 10/7, position the video at left **8%**, top **16%**, width **84%**, height **67.5%**. Keep the actual video at 16:9 and place it above the beam, beneath the painted border. Use overflow:hidden on the video viewport, not on the outer watercolor halo.

The generator repeatedly produced a wider aperture with faint alpha residue. The final selected watercolor border was resampled to correct proportions, then the exact inner rectangle was cleared to alpha=0. Outer watercolor grain and glow were preserved. This technical cleanup, including the alpha<=1/255 cleanup, is documented in PROMPTS.md.

## Cliff and beam anchors

All source rects are (x, y, width, height), in final PNG coordinates.

- Cliff source **1600×1400**. It is meant to meet the left and bottom scene edges, so those edges intentionally have no transparent margin.
- Empty mascot sitting area above the ledge: approximately **(380, 360, 450, 270)**. The ledge beneath it is around y=625. This is a placement zone, not a rectangular mask. No mascot was generated.
- Laptop screen center / beam origin: approximately **(1125, 550)**. The screen is blank and warm. Laptop base is near y=650.
- Beam source **1600×1200**. Narrow origin approximately **(172, 1158)**. Broad end runs roughly from **(1200, 100)** to **(1530, 700)**.
- Beam has real graded alpha, but is intentionally bright at full opacity. Start with **opacity 0.18–0.28** and **mix-blend-mode: screen**, then tune against the frame. Use pointer-events:none. Anchor transforms at source point (172,1158); rotate/scale from this origin toward the frame. Avoid treating the whole transparent canvas corner as the beam origin.

## Suggested scene placement and z order

These are starting composition coordinates for matching the references, independent of future live headings.

1. **z 0:** landscape at full canvas, desktop 2560×1440 or mobile 1080×2340. Unlit mottled sky at top left; village, lake and forest below. No baked moon or moon halo. No cliff, frame or beam is baked into either plate.
2. **z 1:** beam from the laptop toward the frame. Keep it behind the video and cliff. Desktop base is diagonal from lower-left toward upper-right. On mobile rotate the beam toward the upper screen while retaining the source origin anchor.
3. **z 2:** actual 16:9 video/thumbnail viewport.
4. **z 3:** painted frame. Desktop starting box **(880, 80, 1600, 1120)**, scale 0.8; corresponding video rect **(1008, 259.2, 1344, 756)**. Mobile box **(0, 440, 1080, 756)**, scale 0.54; corresponding video rect **(86.4, 560.96, 907.2, 510.3)**.
5. **z 4:** cliff/laptop. Desktop box **(0, 530, 1040, 910)**, scale 0.65, meeting scene bottom. Laptop beam origin in scene approximately **(731, 888)**. Mobile box **(0, 1540, 880, 770)**, scale 0.55, with bottom underlap/cropping as needed; laptop beam origin approximately **(619, 1843)**.
6. **z 5:** separately supplied mascot in the empty ledge area, then live title, play controls and focus indicators. No mascot file is included in this package.

For reduced motion, freeze the beam and omit dust animation. The static layers already read as a complete night scene. The frame's exact aperture supports a real iframe without skewing the video.

## Inspection and limitations

All five selected layers and final exports were visually inspected on anthracite. Frame transparency was checked directly over all 1,587,600 aperture pixels: zero nontransparent pixels. Backgrounds contain no frame, beam, cliff or text. Cliff contains only rock, grass and a blank-screen laptop with room for the separately provided mascot.

All requested layers were produced. The frame needed deterministic aperture cleanup after generation; it is clean in the delivered PNG. Source generations were smaller than requested, so the specified final landscapes are resampled, not native 2560×1440 / 1080×2340 generations. Native sizes appear above. The beam needs the documented low opacity in composition. No application files or visitor-facing copy were changed.

Final palette audit: exact opaque/visible RGB black pixels were replaced with night #18191B, and exact RGB white pixels with cream #FBF3DD. Cliff, frame and beam retain their original palette and transparency. The landscape-only revision below applies a gentle shared grade.

## Moon removal and palette revision — 2026-11-03

Both landscape plates now contain **no baked moon or circular moon glow**. Local generated sky patches were matched to the original pigment grain and composited through feathered masks; cloud silhouettes and neighboring stars were protected. The full plates were never regenerated or geometrically transformed.

Final nonzero edit-mask bounds, (x,y,width,height): desktop **(47,53,561,534)**; mobile **(0,91,515,465)**. Before grading, a complete RGB comparison verified **zero changed pixels outside each mask** (3,454,082 desktop / 2,341,214 mobile protected pixels). All layout rects above remain valid.

The first grade changed channels by at most **3/255** and was judged too weak. A second, identical deterministic per-pixel grade was applied once to both CURRENT moon-free plates, retaining the first pass. It blends RGB bias **(14,0,-11)** toward **(8,6,-16)** over luma **100–160**, removes the bias's weighted-luma component, and adds a **2.2%** luma lift. Cubic smoothstep fades the full correction in over **40–75** and out over **210–250**; a smooth gamut shoulder prevents channel overflow. Pixels below luma 40 are byte-for-byte unchanged. Maximum actual channel change is now **17/255**, and maximum absolute relative luma change is **2.854%** after quantization. Exact formulas, export verification, and hashes are in the final stage-C entry of PROMPTS.md. This grade uses no spatial filtering, repainting, resampling, or coordinate-dependent operations.

Measured mean sRGB triples, before → after this second grade, with bands recomputed separately from each image using Y=0.2126R+0.7152G+0.0722B (dark <40, mid 40–120 exclusive, bright ≥120):

- Desktop dark: **(18.9,21.0,23.3) → (18.9,21.0,23.3)**; mid: **(78.3,66.8,55.3) → (85.6,66.0,48.1)**; bright: **(204.3,150.2,85.6) → (209.8,151.7,70.7)**.
- Mobile dark: **(15.3,17.2,19.4) → (15.3,17.2,19.4)**; mid: **(75.3,63.6,51.9) → (81.8,62.9,45.4)**; bright: **(197.6,142.1,79.7) → (203.8,143.7,64.1)**.

Cloud-bank and lake crops on both plates were compared before/after against hero-sky pigment at native resolution. The warmth is visible, with intact grain, cream light cores and neutral dark silhouettes; no new banding or abrupt hue transition was observed. Limitation: the approximate desktop target (87,71,48) implies about 6.2% more mean luma, so its green level was not forced at the expense of the ±3% per-pixel limit. Mobile started darker and retains that difference under the required shared mapping. Near-threshold pixels moving from mid to bright also affect recomputed means; fixed-input-band means are included in PROMPTS.md.

Exports are opaque 8-bit RGB, original dimensions, explicit sRGB chunk (intent 0), with no exact RGB black or white. Final whole plates, native-size and 200% edit crops, and grade comparisons against hero/making were inspected. No hard patch seam or circular glow was observed. The sky beneath the removed moons is reconstructed; its source grain was matched deterministically because raw generated grain was too fine.
