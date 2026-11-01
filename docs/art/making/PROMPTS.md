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
