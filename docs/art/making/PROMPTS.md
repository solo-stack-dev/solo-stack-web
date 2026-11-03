# Making generation prompts

Tool: built-in `image_gen.imagegen`. Date: 2026-11-01. One call per distinct asset; highest quality requested in prompt. The tool exposes no quality/model selector. Reference images were opened and inspected before generation. These prompts produce original assets and use the supplied images as style/composition references only. Public-facing copy was not generated.

Paths below are relative to the repository unless an external Windows path is shown. Reference order matches the tool call. `transparent_background` is true for cutouts and false for plates/albedo.

## making-plate.png

- Native: 1672×941 px. Final: 2560×1440 px.
- `transparent_background`: false.
- Original generated file: `C:/Users/peter/.codex/generated_images/01a194d6-09b3-7350-aa22-04604a882ed4/exec-b19ac1bf-5f70-4a93-963a-7638fc999aa7.png`.

References, in order:

1. `docs/mockups/round-2/05-night-shift-radio/02-night-shift-bonsai-hover.png`
2. `D:/repos/Solo Stack/branding/final-branding-assets/04-buttergelb-banner-nachtstudio-youtube-2560x1440.jpg`
3. `docs/mockups/round-2/03-what-i-make/01-ink-morph-desktop-context.png`
4. `docs/mockups/round-2/03-what-i-make/03-ink-morph-mobile.png`

Exact prompt:

```text
Use case: stylized-concept. Highest image quality. Original PRODUCTION BACKGROUND PLATE, PNG 2560x1440 landscape. Match references' hand-painted night watercolor and ink, granular paper, butterfly-edged pooled pigment, butter-yellow #FCD772, ochre #E2A93B, cream #FBF3DD, anthracite #18191B and deepest #0E0F10. Golden watercolor pigment clouds bleed in from TOP LEFT, occupy about upper-left 25 percent. Most of center and lower-left is calm DARK anthracite paper-textured night, sparse very faint stars. At far RIGHT edge in lower third, a dark ink-and-watercolor rocky cliff enters from right, with a SMALL open laptop resting on rim. Laptop screen is a simple warm blank luminous pane with NO marks, no symbols, no text. One small butter-yellow painted full moon floats just above and behind the laptop, centered around x87 percent y62 percent, diameter about 12 percent canvas width. Cliff/night motif from banner; calm premium cozy original artwork. Center 35–70 percent stays empty dark for separately composited animation. NO continuous ink line traversing scene, NO central icon or shape, NO figure or mascot, NO lettering, code, symbols, logo, UI, watermark, frame. No pure white/black. Full-bleed opaque plate only, not a website mockup. Reference 1 material style lock, 2 banner motif, 3–4 section placement mood only.
```

## making-plate-mobile.png

- Native: 852×1846 px. Final: 1080×2340 px.
- `transparent_background`: false.
- Original generated file: `C:/Users/peter/.codex/generated_images/01a194d6-09b3-7350-aa22-04604a882ed4/exec-9e86bea9-e705-4917-bcbd-65036765c735.png`.

References, in order:

1. `docs/mockups/round-2/05-night-shift-radio/02-night-shift-bonsai-hover.png`
2. `D:/repos/Solo Stack/branding/final-branding-assets/04-buttergelb-banner-nachtstudio-youtube-2560x1440.jpg`
3. `docs/art/making/making-plate.png`
4. `docs/mockups/round-2/03-what-i-make/03-ink-morph-mobile.png`

Exact prompt:

```text
Use case: stylized-concept. Highest quality original PRODUCTION BACKGROUND PLATE, portrait PNG 1080x2340, aspect 6:13. Match reference 3 approved desktop plate exactly in watercolor pigment character; references 1–2 style and banner motif; reference 4 mobile layout only. Dark anthracite #18191B paper-textured night, deepest #0E0F10. Butter-yellow #FCD772 and ochre #E2A93B pigment clouds bleed from top-left corner and fade down the left edge within upper 28 percent. Keep central 30–70 percent HEIGHT calm dark and empty for animation. At BOTTOM RIGHT, within lowest 25 percent of portrait, an ink-and-watercolor rocky cliff enters from right with a small open laptop on its rim, blank softly luminous cream #FBF3DD screen, NO marks or code. Small painted butter-yellow full moon hangs just behind/above laptop at about x80 percent y79 percent. Sparse faint warm stars. Natural paper granulation, wet pigment edges, cozy premium painted night. NO central shape, NO continuous ink path, NO text, letters, symbols, UI, logos, frame, human, mascot or watermark. No pure white/black. Full-bleed opaque plate, not a mockup.
```

## making-bloom-idea.png

- Native: 1254×1254 px. Final: 1400×1400 px.
- `transparent_background`: true.
- Original generated file: `C:/Users/peter/.codex/generated_images/01a194d6-09b3-7350-aa22-04604a882ed4/exec-c92d90e5-9c10-49fb-8e77-35f184266531.png`.

References, in order:

1. `docs/mockups/round-2/05-night-shift-radio/02-night-shift-bonsai-hover.png`
2. `D:/repos/Solo Stack/branding/final-branding-assets/04-buttergelb-banner-nachtstudio-youtube-2560x1440.jpg`
3. `docs/mockups/round-2/03-what-i-make/02-storyboard-01-lightbulb.png`

Exact prompt:

```text
Use case: stylized-concept. Highest quality. ONE original production WATERCOLOR BLOOM FILL, square PNG about 1400x1400, TRUE transparent background. References lock watercolor pigment and palette only. This will be masked by an SVG in code: paint ONLY an abstract organic pigment puddle, NOT the icon or object shown in the reference. Broad rounded but asymmetric bloom, light butter-yellow body, pale cream center, ochre pooling near lower-left, cloudlike softly lobed perimeter. Roughly fills 85–90 percent square with narrow transparent breathing room on all sides. Warm butter-yellow #FCD772 and ochre #E2A93B, cream #FBF3DD accents, visible real paper granulation INSIDE pigment, wet-on-wet capillary blooms, soft bleeding edges, irregular concentrated pigment islands and fine dry-edge texture. Broad continuous rich filled body so clipping inside arbitrary shapes works; avoid holes in center. Flat pigment without lighting, shadow, glow halo or bevel. No paper sheet or background, no black ink, no figurative shape, NO lightbulb, chat bubble, code, phone, chart, moon, outline, mascot, human, text, letters, numbers, symbols, logo, UI or watermark. No pure white or black. True fractional alpha edge; no checkerboard. If alpha unsupported use flat pure #00FF00 exterior.
```

## making-bloom-ai.png

- Native: 1254×1254 px. Final: 1400×1400 px.
- `transparent_background`: true.
- Original generated file: `C:/Users/peter/.codex/generated_images/01a194d6-09b3-7350-aa22-04604a882ed4/exec-569a3bae-0e09-4b2b-8d35-a932e4cfc5b1.png`.

References, in order:

1. `docs/mockups/round-2/05-night-shift-radio/02-night-shift-bonsai-hover.png`
2. `D:/repos/Solo Stack/branding/final-branding-assets/04-buttergelb-banner-nachtstudio-youtube-2560x1440.jpg`
3. `docs/mockups/round-2/03-what-i-make/02-storyboard-02-chat-prompt.png`

Exact prompt:

```text
Use case: stylized-concept. Highest quality. ONE original production WATERCOLOR BLOOM FILL, square PNG about 1400x1400, TRUE transparent background. References lock watercolor pigment and palette only. This will be masked by an SVG in code: paint ONLY an abstract organic pigment puddle, NOT the icon or object shown in the reference. An irregular oblong organic puddle with two merging rounded lobes, medium butter-yellow center, branching pale dilute feathery edges, ochre tide marks concentrated toward the right. Roughly fills 85–90 percent square with narrow transparent breathing room on all sides. Warm butter-yellow #FCD772 and ochre #E2A93B, cream #FBF3DD accents, visible real paper granulation INSIDE pigment, wet-on-wet capillary blooms, soft bleeding edges, irregular concentrated pigment islands and fine dry-edge texture. Broad continuous rich filled body so clipping inside arbitrary shapes works; avoid holes in center. Flat pigment without lighting, shadow, glow halo or bevel. No paper sheet or background, no black ink, no figurative shape, NO lightbulb, chat bubble, code, phone, chart, moon, outline, mascot, human, text, letters, numbers, symbols, logo, UI or watermark. No pure white or black. True fractional alpha edge; no checkerboard. If alpha unsupported use flat pure #00FF00 exterior.
```

## making-bloom-code.png

- Native: 1254×1254 px. Final: 1400×1400 px.
- `transparent_background`: true.
- Original generated file: `C:/Users/peter/.codex/generated_images/01a194d6-09b3-7350-aa22-04604a882ed4/exec-a2a39623-d508-47f0-a4c7-3e5f3ad92532.png`.

References, in order:

1. `docs/mockups/round-2/05-night-shift-radio/02-night-shift-bonsai-hover.png`
2. `D:/repos/Solo Stack/branding/final-branding-assets/04-buttergelb-banner-nachtstudio-youtube-2560x1440.jpg`
3. `docs/mockups/round-2/03-what-i-make/02-storyboard-03-code.png`

Exact prompt:

```text
Use case: stylized-concept. Highest quality. ONE original production WATERCOLOR BLOOM FILL, square PNG about 1400x1400, TRUE transparent background. References lock watercolor pigment and palette only. This will be masked by an SVG in code: paint ONLY an abstract organic pigment puddle, NOT the icon or object shown in the reference. A broad angular-but-organic ragged puddle, slightly wider than tall, rich ochre pooling through its center and fine cracked granulation, pale butter wash at top left; irregular perimeter with short dry-brush notches. No literal angular symbol. Roughly fills 85–90 percent square with narrow transparent breathing room on all sides. Warm butter-yellow #FCD772 and ochre #E2A93B, cream #FBF3DD accents, visible real paper granulation INSIDE pigment, wet-on-wet capillary blooms, soft bleeding edges, irregular concentrated pigment islands and fine dry-edge texture. Broad continuous rich filled body so clipping inside arbitrary shapes works; avoid holes in center. Flat pigment without lighting, shadow, glow halo or bevel. No paper sheet or background, no black ink, no figurative shape, NO lightbulb, chat bubble, code, phone, chart, moon, outline, mascot, human, text, letters, numbers, symbols, logo, UI or watermark. No pure white or black. True fractional alpha edge; no checkerboard. If alpha unsupported use flat pure #00FF00 exterior.
```

## making-bloom-phone.png

- Native: 1254×1254 px. Final: 1400×1400 px.
- `transparent_background`: true.
- Original generated file: `C:/Users/peter/.codex/generated_images/01a194d6-09b3-7350-aa22-04604a882ed4/exec-09decb3a-5fc0-4c57-89bf-96a2258b468a.png`.

References, in order:

1. `docs/mockups/round-2/05-night-shift-radio/02-night-shift-bonsai-hover.png`
2. `D:/repos/Solo Stack/branding/final-branding-assets/04-buttergelb-banner-nachtstudio-youtube-2560x1440.jpg`
3. `docs/mockups/round-2/03-what-i-make/02-storyboard-04-phone.png`

Exact prompt:

```text
Use case: stylized-concept. Highest quality. ONE original production WATERCOLOR BLOOM FILL, square PNG about 1400x1400, TRUE transparent background. References lock watercolor pigment and palette only. This will be masked by an SVG in code: paint ONLY an abstract organic pigment puddle, NOT the icon or object shown in the reference. A softly vertical organic pigment mass within a square, broadly filled body with generous width, creamy upper center and deeper ochre pooling along bottom and right, irregular feathered capillary fingers. No rounded rectangular border or device silhouette. Roughly fills 85–90 percent square with narrow transparent breathing room on all sides. Warm butter-yellow #FCD772 and ochre #E2A93B, cream #FBF3DD accents, visible real paper granulation INSIDE pigment, wet-on-wet capillary blooms, soft bleeding edges, irregular concentrated pigment islands and fine dry-edge texture. Broad continuous rich filled body so clipping inside arbitrary shapes works; avoid holes in center. Flat pigment without lighting, shadow, glow halo or bevel. No paper sheet or background, no black ink, no figurative shape, NO lightbulb, chat bubble, code, phone, chart, moon, outline, mascot, human, text, letters, numbers, symbols, logo, UI or watermark. No pure white or black. True fractional alpha edge; no checkerboard. If alpha unsupported use flat pure #00FF00 exterior.
```

## making-bloom-chart.png

- Native: 1254×1254 px. Final: 1400×1400 px.
- `transparent_background`: true.
- Original generated file: `C:/Users/peter/.codex/generated_images/01a194d6-09b3-7350-aa22-04604a882ed4/exec-77ffbcea-cfeb-48e8-b91a-37b7eabdff0a.png`.

References, in order:

1. `docs/mockups/round-2/05-night-shift-radio/02-night-shift-bonsai-hover.png`
2. `D:/repos/Solo Stack/branding/final-branding-assets/04-buttergelb-banner-nachtstudio-youtube-2560x1440.jpg`
3. `docs/mockups/round-2/03-what-i-make/02-storyboard-05-chart.png`

Exact prompt:

```text
Use case: stylized-concept. Highest quality. ONE original production WATERCOLOR BLOOM FILL, square PNG about 1400x1400, TRUE transparent background. References lock watercolor pigment and palette only. This will be masked by an SVG in code: paint ONLY an abstract organic pigment puddle, NOT the icon or object shown in the reference. A diagonally spreading abstract organic bloom, dense muted ochre granulation in lower left drifting toward upper right, clear butter-yellow passages and small cream pigment islands, a broad continuous irregular puddle with scalloped bleeding edges. No axis or graph. Roughly fills 85–90 percent square with narrow transparent breathing room on all sides. Warm butter-yellow #FCD772 and ochre #E2A93B, cream #FBF3DD accents, visible real paper granulation INSIDE pigment, wet-on-wet capillary blooms, soft bleeding edges, irregular concentrated pigment islands and fine dry-edge texture. Broad continuous rich filled body so clipping inside arbitrary shapes works; avoid holes in center. Flat pigment without lighting, shadow, glow halo or bevel. No paper sheet or background, no black ink, no figurative shape, NO lightbulb, chat bubble, code, phone, chart, moon, outline, mascot, human, text, letters, numbers, symbols, logo, UI or watermark. No pure white or black. True fractional alpha edge; no checkerboard. If alpha unsupported use flat pure #00FF00 exterior.
```

## making-bloom-moon.png

- Native: 1254×1254 px. Final: 1400×1400 px.
- `transparent_background`: true.
- Original generated file: `C:/Users/peter/.codex/generated_images/01a194d6-09b3-7350-aa22-04604a882ed4/exec-aeb61d6c-e5c6-4334-87ce-eacb81869895.png`.

References, in order:

1. `docs/mockups/round-2/05-night-shift-radio/02-night-shift-bonsai-hover.png`
2. `D:/repos/Solo Stack/branding/final-branding-assets/04-buttergelb-banner-nachtstudio-youtube-2560x1440.jpg`
3. `docs/mockups/round-2/03-what-i-make/02-storyboard-06-moon.png`

Exact prompt:

```text
Use case: stylized-concept. Highest quality. ONE original production WATERCOLOR BLOOM FILL, square PNG about 1400x1400, TRUE transparent background. References lock watercolor pigment and palette only. This will be masked by an SVG in code: paint ONLY an abstract organic pigment puddle, NOT the icon or object shown in the reference. A broad softly rounded but visibly asymmetric organic bloom, pale butter and cream passages with several pooled ochre pigment islands around center-left and bottom, gentle cauliflower granulation, soft ragged margins. Not a geometric circle, no crescent, no lunar disc. Roughly fills 85–90 percent square with narrow transparent breathing room on all sides. Warm butter-yellow #FCD772 and ochre #E2A93B, cream #FBF3DD accents, visible real paper granulation INSIDE pigment, wet-on-wet capillary blooms, soft bleeding edges, irregular concentrated pigment islands and fine dry-edge texture. Broad continuous rich filled body so clipping inside arbitrary shapes works; avoid holes in center. Flat pigment without lighting, shadow, glow halo or bevel. No paper sheet or background, no black ink, no figurative shape, NO lightbulb, chat bubble, code, phone, chart, moon, outline, mascot, human, text, letters, numbers, symbols, logo, UI or watermark. No pure white or black. True fractional alpha edge; no checkerboard. If alpha unsupported use flat pure #00FF00 exterior.
```

## Export finishing

No artwork was painted procedurally. Generated raster pigment was exported to requested dimensions with alpha-aware bilinear resampling. Cloud masters use 2560×1024, preserving source aspect within a 40 px inset; bloom masters use 1400×1400 with a 40 px inset; the paper frame uses 900×1100 with a 20 px inset. Opaque plates and albedo fill their target dimensions. Invisible RGB is zeroed and visible exact black/white pixels are remapped to the specified ink/cream palette.

The six organic blooms remain independent fills for SVG masks. The final export was checked for pixel dimensions, transparent borders, fractional alpha, and visible palette extrema.

## Registered moon removal — 2026-11-03

Tool/model: built-in `image_gen.imagegen`; underlying model identifier is not exposed. This was the available built-in image editor; highest quality was requested in the prompts. No model or quality selector and no native mask argument are exposed. Image 2 supplied the grayscale mask as an edit guide; exact confinement was enforced afterward by deterministic pixel compositing, not entrusted to model registration. `transparent_background: false`.

### Inputs and selection

- Desktop measured lunar disc: center approximately (2255, 855), radius 158 px. Input 1: original desktop crop (1536, 416), size 1024×1024. Input 2: corresponding crop of the initial sky mask. Two 1254×1254 edits were generated; the first had finer grain and was rejected. Selected second output: `C:/Users/peter/.codex/generated_images/01a1a33d-bc33-7971-bf58-2b1242080372/exec-8225a66a-4499-47bd-b659-455d4fcce704.png`.
- Mobile measured lunar disc: center approximately (919, 1661), radius 125 px. Input 1: original mobile crop (0, 1260), size 1080×1080. Input 2: corresponding crop of the initial sky mask. Selected 1254×1254 output: `C:/Users/peter/.codex/generated_images/01a1a33d-bc33-7971-bf58-2b1242080372/exec-8437b4c9-e1d2-41d4-abdd-3590af457d30.png`.

### Initial prompt (selected mobile generation; rejected first desktop generation)

```text
Use case: precise-object-edit. Highest available image quality. Image 1 is the EXACT EDIT TARGET, a registered square crop from a watercolor night production plate. Image 2 is its edit-mask guide: white = repaint; black = strictly preserve; gray = feathered transition. Remove the entire large yellow moon disc AND ALL its surrounding yellow atmospheric halo in the white region, filling it with the same dark mottled anthracite night sky found above and to the left. Continue the existing organic ink/pigment variation, coarse paper grain, granulation scale and contrast exactly. This is seamless restoration, no redesign. No residual round shape, no dark circular silhouette, no halo ring, no smudge, no smooth flat fill, no new clouds. At most one tiny faint star in repaired sky, preferably none. Keep EVERY other object and its registration unchanged, especially the original laptop body, keyboard, dark screen outline, blank warm cream lit screen, cliff silhouette and cliff-top rim. The laptop screen is the sole small local light source at this spot; eliminate moon backlight from sky but keep the warm cliff-top rim itself as painted. Do not move, scale, sharpen, restyle or redraw the laptop or cliff. Preserve dark ink outline cleanly against the restored dark sky. No objects, moons, letters, UI, symbols, logos, watermark or text. Output only repaired image 1 in the same square framing; do not output the mask, a comparison or a collage. Opaque RGB, sRGB, no exact black or white.
```

The respective call appended exactly ` Target: mobile plate crop. Retain its individual paper texture.` or ` Target: desktop plate crop. Retain its individual paper texture.`

### Second desktop prompt (selected)

```text
Use case: precise-object-edit. Highest quality restoration. Image 1 is an exact original square watercolor night crop to edit; image 2 is white repaint/black protect mask. Remove the big yellow moon and its whole halo from white region; restore dark night behind it. CRITICAL MATERIAL MATCH: retain the original LARGE coarse interlocking irregular polygon/cellular watercolor paper granules, about 8 to 14 pixels across in the 1024px input, visibly angular curled pigment ridges. The repaired sky must have EXACTLY SAME coarse granulation size and contrast as original sky to the immediate LEFT of moon and directly ABOVE moon, not fine sand, not smooth noise, not fabric weave, not soft airbrush. Dark anthracite #18191b with natural uneven dark ink mottling and tonal grain. No circular shape or ring remains. Do not introduce bright clouds or glow. No new stars. Preserve all original laptop and cliff geometry exactly, keep screen warm cream blank and its original dark frame. Preserve cliff-top warm rim, all original stars and all sky outside mask. This is a registered repair, no repaint elsewhere. Output the repaired square composition only, not mask. No text, UI, logos, watermark, second moon, new objects. Opaque sRGB.
```

### Final masks and compositing

Exact masks: [desktop](moon-removal-masks/desktop.png), [mobile](moon-removal-masks/mobile.png). Each is full-size 8-bit grayscale, black = unchanged, white = replacement, gray = feather. Final support bounds use half-open (x0, y0, x1, y1): desktop **(1878, 573, 2560, 1048)**; mobile **(578, 1403, 1080, 1830)**.

Starting ellipses (cx, cy, rx, ry): desktop (2265, 870, 390, 300), mobile (935, 1690, 360, 290). Outer 27% uses smoothstep feathering. The masks are clipped above the traced cliff skyline, with protected laptop silhouettes. Final masks refine the original guides around the screen edges: exclude original foreground, remove bright lunar background beside the frame, and restore the narrow dark foreground antialias fringe. The stored masks are authoritative.

Generated crops were bilinearly mapped to their original crop dimensions. In a narrow band next to the foreground, replacement sky was blended with generated sky sampled 180 crop pixels above (smoothstep over 25 px, full at distance ≤5 px, zero at ≥30 px) to prevent any regenerated laptop/cliff pixels from entering the repair. RGB compositing was `round(original * (1 - mask/255) + generatedSky * mask/255)`. Original RGB bytes were copied directly wherever mask = 0; no whole-image resampling or color conversion was performed. No procedural texture was painted. Final output PNGs use RGB color type 2, 8 bits/channel and sRGB rendering intent 0.

### Verification

Full-size and magnified views were inspected after iterative mask corrections. No visible lunar disc, circular halo or hard patch boundary remains. Original warm cliff-top paint and the lower-left pigment wash were deliberately retained; they are not newly painted screen illumination. Original masters already contain resampled rather than native-resolution generation detail.

The following records compare decoded RGB pixels against the pre-edit files. SHA-256 outside-mask digests concatenate untouched RGB triplets in raster order. Zero changes outside the mask also proves zero changes outside its bounding box.

```json
{
	"desktop": {
		"file": "making-plate.png",
		"dimensions": [2560, 1440],
		"channels": 3,
		"chunks": ["IHDR", "sRGB", "IDAT", "IEND"],
		"maskBBoxXYXYExclusive": [1878, 573, 2560, 1048],
		"changedBBoxXYXYExclusive": [1888, 585, 2560, 1047],
		"maskPixels": 255126,
		"changedPixels": 238277,
		"unchangedOutsideMask": 3431274,
		"changedOutsideMask": 0,
		"changedCliff": 0,
		"changedProtectedLaptop": 0,
		"pureBlack": 0,
		"pureWhite": 0,
		"originalSHA256": "45b85cb1573b45b258b1590005a88ce5622580d9b06f4877e834da69ed9c930d",
		"finalSHA256": "c950d5f9040e2d2eb2ded4bcf7698f8451a7a51ca866a3de439757fa85418b07",
		"outsideOriginalSHA256": "d511fa1f0d86d9178db56d219ff995138604191e9731ab7dc58ceb49bfca5df1",
		"outsideFinalSHA256": "d511fa1f0d86d9178db56d219ff995138604191e9731ab7dc58ceb49bfca5df1",
		"bytes": 4172851
	},
	"mobile": {
		"file": "making-plate-mobile.png",
		"dimensions": [1080, 2340],
		"channels": 3,
		"chunks": ["IHDR", "sRGB", "IDAT", "IEND"],
		"maskBBoxXYXYExclusive": [578, 1403, 1080, 1830],
		"changedBBoxXYXYExclusive": [588, 1411, 1080, 1829],
		"maskPixels": 170357,
		"changedPixels": 156306,
		"unchangedOutsideMask": 2356843,
		"changedOutsideMask": 0,
		"changedCliff": 0,
		"changedProtectedLaptop": 0,
		"pureBlack": 0,
		"pureWhite": 0,
		"originalSHA256": "f3c805b4e025cf44d11a760c633066a929d23f2ea44cd80b00c7734187f484cc",
		"finalSHA256": "92ddf1145d5f01f072367f8be7b20d6ec342b324c62c6fd21811b873280510cb",
		"outsideOriginalSHA256": "a513e815a55265ad192cfe7ba1b3e0f9172c537218d1d98aad70783a47ff259e",
		"outsideFinalSHA256": "a513e815a55265ad192cfe7ba1b3e0f9172c537218d1d98aad70783a47ff259e",
		"bytes": 3127246
	}
}
```

Blank screen interior was additionally checked independently: zero changed pixels in both plates. Saved final PNGs were read back and matched the recorded final SHA-256 values.


## Registered local cliff-light repair - 2026-11-03

Tool: built-in `image_gen.imagegen`, underlying model not exposed; highest quality requested, no selectable model/quality/native-mask option. `transparent_background: false`. Four generation calls: two per plate. Grayscale mask supplied as image 2 is a visual guide; exact pixel confinement comes from final compositing.

### Input crops and attempts

Originals were copied before edits to `C:/Users/peter/AppData/Local/Temp/making-cliff-light-20261103/desktop-original.png` and `mobile-original.png`.

- Desktop target: original crop (1560, 800, 2560, 1440), 1000x640. Both generated outputs: 1568x1003.
- Mobile target: original crop (280, 1600, 1080, 2240), 800x640. Both generated outputs: 1402x1122.
- Each call received `{desktop,mobile}-before.png` first and `{desktop,mobile}-mask-crop.png` second, in that order, from the temp directory above.
- First pair rejected: too strong a continuous cool-grey rim and hard geometric pigment. The first composites also retained excess gold just inside the protected silhouette because the initial inner feather was too broad.
- Second pair selected: softer irregular pigment and a localized laptop light pool. Subsequent deterministic mask corrections narrowed the inner feather, protected the vertical left cliff edge, and prevented the old bezel fringe being misidentified as a cliff silhouette. No additional generations were needed.

### Rejected first pair outputs

- desktop: `C:/Users/peter/.codex/generated_images/01a1a373-d58d-7fa1-8819-ab4337127dbd/exec-becffc26-c799-4870-aa13-6bfeb4649189.png`.
- mobile: `C:/Users/peter/.codex/generated_images/01a1a373-d58d-7fa1-8819-ab4337127dbd/exec-03a762ce-4a3c-45f8-b279-94fc25ac4430.png`.
### Selected second pair outputs

- desktop: `C:/Users/peter/.codex/generated_images/01a1a373-d58d-7fa1-8819-ab4337127dbd/exec-e96f9cb7-4c8c-426c-8a98-285e5fcbf5f1.png`.
- mobile: `C:/Users/peter/.codex/generated_images/01a1a373-d58d-7fa1-8819-ab4337127dbd/exec-32d785c5-a89c-487a-a672-adac1b8af43b.png`.

### First-generation exact desktop prompt

```text
Use case: lighting-weather. Highest available quality, precise registered watercolor-ink image repair. Image 1 is the edit target crop, image 2 is its grayscale edit guide: white=repaint, black=preserve, grey=feather. Repaint only the lit top edge of this dark rock cliff in the same watercolor-ink style: light comes from the small laptop screen only, a warm pool around the laptop fading out within ~1.5 laptop widths, with a few sparse ochre catch-lights on ledges further away; the rest of the cliff top stays dark anthracite with subtle cool-grey rim. Keep the laptop, the screen and the cliff silhouette pixel-identical. Remove the faint warm exterior fringe around the laptop bezel: background immediately beside it must match surrounding dark night. Preserve all actual laptop frame and body pixels, blank screen, and silhouette. Match the original coarse irregular watercolor pigment granulation and angular stone texture, no fine sand or smear. The current continuous full-width gold stripe must disappear except for the small localized pool of screen light. No bright outline across the whole cliff, no new sky glow. Maintain original framing and every rock feature. Output image 1 only, opaque RGB, no text or comparison. Target desktop.
```

The mobile call replaced only `Target desktop.` with `Target mobile crop.`.

### Second-generation exact desktop prompt

```text
Use case: lighting-weather. Highest available image quality. Image 1 is original edit target, image 2 white=repaint black=protect mask. Repaint only the lit top edge of this dark rock cliff in the same watercolor-ink style: light comes from the small laptop screen only, a warm pool around the laptop fading out within ~1.5 laptop widths, with a few sparse ochre catch-lights on ledges further away; the rest of the cliff top stays dark anthracite with subtle cool-grey rim. Keep the laptop, the screen and the cliff silhouette pixel-identical. VERY IMPORTANT: preserve irregular original large coarse watercolor granules and rock features. Do not sharpen into little geometric tiles. No continuous grey/blue border or thick dark band; cool rim must be very subtle, intermittent and dark, almost invisible. Maintain natural irregular transitions in the rock. Outside the small laptop light pool the gold stripe becomes very dark charcoal pigment, with only a few isolated tiny warm flecks. Do not relocate or recreate rock formations. The exterior bezel fringe is removed to dark night, but actual laptop body and blank cream screen are unchanged. Keep exact image framing. No new light, new objects, moon, typography, collage. Output only repaired image 1, opaque RGB. Target desktop.
```

The mobile call replaced only `Target desktop.` with `Target mobile crop.`.

### Masking, compositing and limits

Final masks are `cliff-light-masks/desktop.png` and `cliff-light-masks/mobile.png`, full-size 8-bit grayscale. Black copies original RGB bytes verbatim, white replaces with generated pixels, intermediate grey feathers. Support includes only the main top ledge, a small amount of its rock face, and thin exterior bezel background. Lower stepped ledges and broad existing golden washes were excluded. Mask bounds and counts below are authoritative.

The cliff skyline was traced near its visible warm transition, with the laptop and its surrounding 15-pixel neighborhood excluded from edge detection. A 5x5 dilation of the one-pixel trace protects two pixels on either side. The actual cliff remains unchanged above that trace as well; the left vertical silhouette is excluded by inward support clipping. The inner top feather reaches full weight over 1.5 pixels beyond the guard; bottom feather is 28 pixels; left feather is 14 pixels. The body/screen protection polygon includes its antialias boundary. On the bezel's right, detached warm background peaks were separated from the actual dark frame by the intervening dark trough; the trough and inner frame remain protected. Guard masks and fringe traces are saved in the temp directory for inspection. These detached background pixels are not part of the laptop frame.

Generated output was bilinearly mapped only to its input crop dimensions. For the exterior sky ring, generated dark sky sampled 120 crop pixels above was used to prevent a regenerated screen or frame from leaking into the repair. Compositing is `round(original * (1 - mask/255) + generated * mask/255)`. Exact black/white pixels introduced inside support were remapped to #0E0F10 / #FBF3DD; all pixels where mask=0 were then copied directly from the original. No original whole-plate resampling or color conversion was performed. Export is opaque 8-bit RGB, sRGB intent 0.

A thin warm hairline remains exactly where the requested two-pixel silhouette guard protects original pigment. It is not an unremoved broad surface stripe. Original warmth intrinsic to the preserved laptop frame also remains. Recoloring either protected feature would violate the pixel-identity requirement.

### Final verification

Audits compare decoded RGB against the pre-edit copies. Outside-mask SHA-256 values concatenate RGB triples in raster order. The silhouette count covers the traced main ledge and its guard; all remaining skyline lies entirely outside repair support and is therefore also byte-identical. Screen is checked independently of the larger laptop polygon. Both masters were inspected at full-plate scale, repair crops at native 100%, and bezel crops at 400%.

```json
{
  "desktop": {
    "file": "making-plate.png",
    "dimensions": [
      2560,
      1440
    ],
    "mode": "RGB",
    "opaque": true,
    "chunks": [
      "IHDR",
      "sRGB",
      "IDAT",
      "IEND"
    ],
    "maskBBoxXYXYExclusive": [
      1851,
      916,
      2560,
      1175
    ],
    "maskPixels": 67131,
    "changedPixels": 63093,
    "unchangedOutsideMask": 3619269,
    "changedOutsideMask": 0,
    "laptopProtectedPixels": 13254,
    "changedLaptop": 0,
    "screenProtectedPixels": 4989,
    "changedScreen": 0,
    "silhouetteProtectedPixels": 4982,
    "changedSilhouette": 0,
    "pureBlack": 0,
    "pureWhite": 0,
    "originalSHA256": "c950d5f9040e2d2eb2ded4bcf7698f8451a7a51ca866a3de439757fa85418b07",
    "finalSHA256": "1d54c5239c5d08de783f3ec474688ca300584c6ec7a7b11a7e36f6e51a03586b",
    "outsideOriginalSHA256": "a9e7bbc7cab5e206b7ab8896f3f6f91934dd7565ec8c303fedf1b32bcc2a4089",
    "outsideFinalSHA256": "a9e7bbc7cab5e206b7ab8896f3f6f91934dd7565ec8c303fedf1b32bcc2a4089",
    "bytes": 4115376
  },
  "mobile": {
    "file": "making-plate-mobile.png",
    "dimensions": [
      1080,
      2340
    ],
    "mode": "RGB",
    "opaque": true,
    "chunks": [
      "IHDR",
      "sRGB",
      "IDAT",
      "IEND"
    ],
    "maskBBoxXYXYExclusive": [
      601,
      1703,
      1080,
      1931
    ],
    "maskPixels": 49761,
    "changedPixels": 46533,
    "unchangedOutsideMask": 2477439,
    "changedOutsideMask": 0,
    "laptopProtectedPixels": 11690,
    "changedLaptop": 0,
    "screenProtectedPixels": 4062,
    "changedScreen": 0,
    "silhouetteProtectedPixels": 3005,
    "changedSilhouette": 0,
    "pureBlack": 0,
    "pureWhite": 0,
    "originalSHA256": "92ddf1145d5f01f072367f8be7b20d6ec342b324c62c6fd21811b873280510cb",
    "finalSHA256": "d6809d47c674415d2766033acbc2393435359c3adf3feb4c4e41bf042a90e788",
    "outsideOriginalSHA256": "60eabb670eaed91c44f79b82455fe598358e33a0eb27f350b788efbe9936c7fe",
    "outsideFinalSHA256": "60eabb670eaed91c44f79b82455fe598358e33a0eb27f350b788efbe9936c7fe",
    "bytes": 3076536
  }
}
```

Before/after inspection crops (outside repo):

- `C:/Users/peter/AppData/Local/Temp/making-cliff-light-20261103/desktop-before.png`
- `C:/Users/peter/AppData/Local/Temp/making-cliff-light-20261103/desktop-after.png`
- `C:/Users/peter/AppData/Local/Temp/making-cliff-light-20261103/mobile-before.png`
- `C:/Users/peter/AppData/Local/Temp/making-cliff-light-20261103/mobile-after.png`

The same directory contains `audit.json`, `spec.json`, `masks.py`, `refine.py`, `tighten.py`, `composite2.py`, and independent `{desktop,mobile}-{laptop,screen,silhouette}-protect.png` diagnostic masks (white marks protected pixels in these temporary diagnostics, unlike the production edit masks). PNG master hashes were checked again after saving. This appendix supersedes the earlier statement that original warm cliff-top paint was wholly retained; it was retained during moon removal, then selectively repaired here.
