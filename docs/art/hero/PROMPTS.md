# Hero generation prompts

Tool: built-in `image_gen.imagegen`. Date: 2026-11-01. One call per distinct asset; highest quality requested in prompt. The tool exposes no quality/model selector. Reference images were opened and inspected before generation. These prompts produce original assets and use the supplied images as style/composition references only. Public-facing copy was not generated.

Paths below are relative to the repository unless an external Windows path is shown. Reference order matches the tool call. `transparent_background` is true for cutouts and false for plates/albedo.

## hero-sky.png

- Native: 1672×941 px. Final: 2560×1440 px.
- `transparent_background`: false.
- Original generated file: `C:/Users/peter/.codex/generated_images/01a194d6-09b3-7350-aa22-04604a882ed4/exec-f145537e-fa8e-425e-b843-0032b5452e07.png`.

References, in order:

1. `docs/mockups/round-2/05-night-shift-radio/02-night-shift-bonsai-hover.png`
2. `docs/mockups/round-2/02-hero/05-painted-moon-desktop.png`
3. `docs/mockups/round-2/02-hero/06-painted-moon-mobile.png`
4. `docs/mockups/round-2/02-hero/07-painted-moon-phase-strip.png`
5. `D:/repos/Solo Stack/branding/final-branding-assets/04-buttergelb-banner-nachtstudio-youtube-2560x1440.jpg`

Exact prompt:

```text
Use case: stylized-concept. Produce one original PRODUCTION BACKGROUND LAYER, not a website mockup. Highest available image quality. Output PNG 2560x1440 landscape. Reference 1 is the watercolor material/style lock only; references 2–4 are hero composition and pigment mood only; reference 5 is original brand palette. Paint a continuous anthracite night sky (#18191B, deepest #0E0F10), rich real watercolor paper granulation and wet pigment blooms, very faint sparse warm stars. Painted cloud washes concentrated along the left edge and lower left, muted ochre #E2A93B and butter #FCD772 dusk bleeding softly along the bottom. Rightmost 45 percent stays very calm dark anthracite with subtle paper texture where a separate moon layer will be composited. No horizon objects. No moon, no disc, no figure, no mascot, no portrait, no text, letters, logos, symbols, UI, frame or watermark. No pure black or white. Warm cream highlights #FBF3DD used sparingly. Original art in the references' hand-painted watercolor and ink mood, not photorealistic, not smooth digital gradients. Full bleed opaque sky plate.
```

## hero-sky-mobile.png

- Native: 852×1846 px. Final: 1080×2340 px.
- `transparent_background`: false.
- Original generated file: `C:/Users/peter/.codex/generated_images/01a194d6-09b3-7350-aa22-04604a882ed4/exec-6b25bb84-7b76-4c27-974b-20755773e4f5.png`.

References, in order:

1. `docs/mockups/round-2/05-night-shift-radio/02-night-shift-bonsai-hover.png`
2. `D:/repos/Solo Stack/branding/final-branding-assets/04-buttergelb-banner-nachtstudio-youtube-2560x1440.jpg`
3. `docs/art/hero/hero-sky.png`
4. `docs/mockups/round-2/02-hero/06-painted-moon-mobile.png`

Exact prompt:

```text
Use case: stylized-concept. Highest available quality. Paint ONE original production night sky background, PNG portrait 1080x2340, aspect 6:13. Reference 1 locks watercolor grain and hand-painted finish; 2 brand pigment palette; 3 is the approved matching desktop sky; 4 mobile atmosphere only. Portrait companion of reference 3: anthracite #18191B night, deepest #0E0F10, natural paper grain, watercolor pigment blooms, sparse very faint butter-yellow stars. Muted ochre cloud washes bleed from left edge, become warm dusk along the bottom. Keep the TOP RIGHT especially calm, dark and empty for a separately composited moon. Most of the center stays calm dark night. Soft watercolor bleeding edges, rich granulation, warm palette #FCD772 #E2A93B #FBF3DD. Full bleed opaque background. NO moon, NO mascot or figures, NO objects, NO text, letters, symbols, logo, UI, frame or watermark. No pure black or white. Production layer only, not a mockup.
```

## hero-clouds-1.png

- Native: 2048×768 px. Final: 2560×1024 px.
- `transparent_background`: true.
- Original generated file: `C:/Users/peter/.codex/generated_images/01a194d6-09b3-7350-aa22-04604a882ed4/exec-dd8ef195-5896-4b44-bde4-5db96f6be763.png`.

References, in order:

1. `docs/mockups/round-2/05-night-shift-radio/02-night-shift-bonsai-hover.png`
2. `D:/repos/Solo Stack/branding/final-branding-assets/04-buttergelb-banner-nachtstudio-youtube-2560x1440.jpg`
3. `docs/art/hero/hero-sky.png`

Exact prompt:

```text
Use case: stylized-concept. Highest available quality. Single original PRODUCTION PARALLAX CLOUD CUTOUT, wide PNG about 2560x960. True transparent background with soft alpha, no opaque backdrop. Reference 1 locks hand-painted watercolor material only; reference 2 palette; reference 3 matching sky. Paint one distant low cloud bank stretched horizontally across most of the canvas with wide empty transparent margins top and bottom. Warm anthracite #18191B washes with subtle muted ochre #E2A93B and butter #FCD772 edge light, paper granulation within the pigment. Diffuse airy thin cloud wisps, low contrast, much darker and quieter than a luminous moon. Natural organic irregular feathered bleeding edge, taper left and right before canvas borders. No moon, stars, objects, people, mascot, text, letters, logos, UI, checkerboard or shadow rectangle. No pure black or white. Paint only cloud pigment, isolate against real alpha. If alpha is not supported use perfectly flat pure #00FF00 outside the cloud.
```

## hero-clouds-2.png

- Native: 2048×768 px. Final: 2560×1024 px.
- `transparent_background`: true.
- Original generated file: `C:/Users/peter/.codex/generated_images/01a194d6-09b3-7350-aa22-04604a882ed4/exec-b4884311-c530-491c-a520-e877e13c3738.png`.

References, in order:

1. `docs/mockups/round-2/05-night-shift-radio/02-night-shift-bonsai-hover.png`
2. `D:/repos/Solo Stack/branding/final-branding-assets/04-buttergelb-banner-nachtstudio-youtube-2560x1440.jpg`

Exact prompt:

```text
Use case: stylized-concept. Production illustration at highest quality. Create one isolated original wide watercolor CIRRUS CLOUD FILAMENT layer, PNG about 2560x960, transparent background. This must be a very different thin wispy cloud, NOT a puffy cumulus bank. Two to three delicate horizontal torn brushstrokes drifting slightly upward from lower left to upper right, like diluted warm anthracite ink pulled across rough watercolor paper with a dry brush, with spacious gaps BETWEEN strands. Cloud group occupies middle 25 percent of canvas height, side ends taper fully before canvas edges. Mostly translucent charcoal #18191B and warm taupe, with only extremely subdued ochre #E2A93B along wispy edges, nearly no bright yellow. NO luminous gold halo. References only for hand-painted paper pigment material and warm night palette; do not copy scenes or objects. Real transparent alpha outside wisps; keep soft diffuse semitransparent pigment and granular edges. No opaque rectangle, sky, stars, moon, person, mascot, objects, letters, text, symbols, UI, frame or watermark. No pure white or black in visible pigment. Original watercolor, not photorealistic clouds. If alpha unsupported use solid pure #00FF00 backdrop.
```

## hero-clouds-3.png

- Native: 1983×793 px. Final: 2560×1024 px.
- `transparent_background`: true.
- Original generated file: `C:/Users/peter/.codex/generated_images/01a194d6-09b3-7350-aa22-04604a882ed4/exec-b90ab74b-f321-4cbd-9efa-fb3d97110d4f.png`.

References, in order:

1. `docs/mockups/round-2/05-night-shift-radio/02-night-shift-bonsai-hover.png`
2. `D:/repos/Solo Stack/branding/final-branding-assets/04-buttergelb-banner-nachtstudio-youtube-2560x1440.jpg`

Exact prompt:

```text
Use case: stylized-concept. Highest quality. Paint ONE original wide isolated cloud layer for parallax, target PNG 2560x960. References are watercolor material and brand color only, do not copy their scenes. TRUE transparent background. A low sweeping foreground bank of dark anthracite watercolor clouds, with the highest mass at the RIGHT, low thin tendrils reaching left; asymmetric sparse shape occupying only the middle horizontal third of the image. Mostly dark #18191B and deepest #0E0F10 pigment, only tiny subdued ochre #E2A93B accents, very limited butter #FCD772 edge wash. This is a DARK FOREGROUND cloud with no bright golden halo. Real watercolor granulation, hand-painted ragged edge, translucent dry brush wisps and organic capillary bleeding, warm ink atmosphere. Wide clear alpha margins all sides; taper before left/right edges. No opaque backdrop, rectangular haze, sky, stars, moon, mascot, human, text, letters, symbols, UI, frame, watermark. No pure white or black visible pigment. If alpha unavailable, solid pure #00FF00 exterior.
```

## hero-moon-disc.png

- Native: 1254×1254 px. Final: 2048×2048 px.
- `transparent_background`: true.
- Original generated file: `C:/Users/peter/.codex/generated_images/01a194d6-09b3-7350-aa22-04604a882ed4/exec-eb087dd2-ffef-46b5-a7ce-fd07f1d45886.png`.

References, in order:

1. `docs/mockups/round-2/05-night-shift-radio/02-night-shift-bonsai-hover.png`
2. `D:/repos/Solo Stack/branding/final-branding-assets/04-buttergelb-banner-nachtstudio-youtube-2560x1440.jpg`
3. `docs/mockups/round-2/02-hero/05-painted-moon-desktop.png`
4. `docs/mockups/round-2/02-hero/07-painted-moon-phase-strip.png`

Exact prompt:

```text
Use case: stylized-concept. Highest image quality. ONE isolated original painted FULL MOON DISC production master, square PNG 2048x2048 with TRUE transparent background. References 1–2 watercolor material and palette, 3–4 the desired painted lunar pigment. Exact circular front-facing full disc, centered at pixel (1024,1024), desired circle radius 928 pixels, with a soft narrow warm glow fading to fully transparent inside remaining 96-pixel margin. Moon fully inside square, no cropping, circular not elliptical. Bright butter-yellow #FCD772 surface with cream #FBF3DD paper highlights and varied ochre #E2A93B watercolor craters rendered as pigment blooms, pooled rings, granulation and soft wet edges. Even full-moon illumination, no directional cast shadow or phase terminator. Disc edge geometrically round but delicately soft, luminous hand-painted paper material consistent with references. No sky/background, stars, clouds, mascot, figure, person, objects, text, letters, symbols, UI, watermark. No pure white or black. If transparency unsupported, pure flat #00FF00 exterior. This is a production isolated moon layer, not a composition or mockup.
```

## hero-moon-texture.png

- Native: 1774×887 px. Final: 4096×2048 px.
- `transparent_background`: false.
- Original generated file: `C:/Users/peter/.codex/generated_images/01a194d6-09b3-7350-aa22-04604a882ed4/exec-07a5b444-7821-420d-8da5-338a79628d9d.png`.

References, in order:

1. `docs/mockups/round-2/05-night-shift-radio/02-night-shift-bonsai-hover.png`
2. `D:/repos/Solo Stack/branding/final-branding-assets/04-buttergelb-banner-nachtstudio-youtube-2560x1440.jpg`
3. `docs/mockups/round-2/02-hero/05-painted-moon-desktop.png`

Exact prompt:

```text
Use case: stylized-concept. Highest available quality. Original PRODUCTION 3D TEXTURE, PNG 4096x2048, exact 2:1 aspect. Equirectangular flat albedo of an entire watercolor moon surface, NOT a picture of a moon, NOT a sphere or disc. Full rectangular edge-to-edge butter-yellow #FCD772 painted paper field with ochre #E2A93B pigment craters, soft diffuse cream #FBF3DD patches, wet-on-wet pigment blooms, granulation and pooled irregular crater rings matching the reference moon's watercolor material. Craters different sizes, naturally distributed across ALL the field including borders. Entire rectangle stays evenly exposed, no brighter center, no dark sides. STRICT flat unlit albedo: no baked lighting, shadow, ambient occlusion, gradients, specular, glow or vignette. Seamless left-right tile: pigment crossing right edge continues exactly on left; no visible seam when wrapped horizontally. Equirectangular pole regions should use stretched horizontal low-contrast pigment to avoid polar pinching. No night sky, no border, no disc outline, no transparent background, no figures, mascot, stars, objects, letters, text, symbols, watermark. No pure black or white. Reference 1 finish style, reference 2 palette, reference 3 lunar pigment only. Texture asset only.
```

## hero-portrait-frame.png

- Native: 1134×1387 px. Final: 900×1100 px.
- `transparent_background`: true.
- Original generated file: `C:/Users/peter/.codex/generated_images/01a194d6-09b3-7350-aa22-04604a882ed4/exec-3ff3b75f-0ea1-4f1e-939d-98ad1934d8a6.png`.

References, in order:

1. `docs/mockups/round-2/05-night-shift-radio/02-night-shift-bonsai-hover.png`
2. `D:/repos/Solo Stack/branding/final-branding-assets/04-buttergelb-banner-nachtstudio-youtube-2560x1440.jpg`
3. `docs/mockups/round-2/02-hero/05-painted-moon-desktop.png`

Exact prompt:

```text
Use case: stylized-concept. Highest quality original production CUTOUT. One empty portrait photo frame made from real hand-torn watercolor paper, PNG portrait approximately 900x1100 (9:11). True alpha outside frame AND in the central empty window. Warm cream #FBF3DD thick fibrous cotton watercolor paper with very subtle butter-yellow #FCD772 stains, tiny muted ochre #E2A93B pigment at some edges. Natural irregular torn outer perimeter and irregular torn inner opening. Almost straight rectangular portrait frame, viewed flat front-on, no perspective, no rotation, no cast shadow. Frame occupies 90 percent canvas with transparent margin all sides. Large portrait rectangular central window about 70 percent width and 72 percent height, completely EMPTY AND TRANSPARENT, no paper in window. Border about 10–14 percent of width, wider along bottom, naturally unequal tearing. Soft exposed paper fibers, painterly granular texture matching references, premium understated. References are material and torn-frame style only. NO photograph, person, mascot, moon, objects, text, symbols, UI, logos or watermark. No pure white or black pigment. Do not draw a checkerboard. If alpha unsupported make the exterior AND central window exactly solid #00FF00.
```

## Superseded cloud-2 attempt

Rejected after visual inspection: it repeated cloud-1's puffy silhouette too closely. The final thin-wisp prompt above replaced it. The rejected PNG is not included.

References, in order:

1. `docs/mockups/round-2/05-night-shift-radio/02-night-shift-bonsai-hover.png`
2. `D:/repos/Solo Stack/branding/final-branding-assets/04-buttergelb-banner-nachtstudio-youtube-2560x1440.jpg`
3. `docs/art/hero/hero-clouds-1.png`

Exact rejected prompt:

```text
Use case: stylized-concept. Highest quality original production watercolor CLOUD CUTOUT number 2 for parallax, PNG wide about 2560x960. References 1 and 2 lock hand-painted pigment/palette, reference 3 locks companion cloud material. TRUE TRANSPARENT BACKGROUND, preserve soft fractional alpha in feathered bleeding edges. One broken wispy horizontal cloud ribbon, thinner than reference 3, asymmetrical heavier on left third, delicate taper to right, centered with clear transparent margins on all sides. Dark warm charcoal anthracite #18191B, ochre #E2A93B gently caught along upper ragged cloud edges, restrained butter #FCD772 highlights. Natural wet-on-wet watercolor granulation, not photorealistic volume, no large glow halo. Entirely isolated cloud pigment on alpha. No sky backdrop, moon, stars, people, mascot, letters, text, symbols, frame, UI or watermark. No pure black or white in visible pigment. If alpha unsupported use perfectly flat pure #00FF00 exterior.
```

## Export finishing

No artwork was painted procedurally. Generated raster pigment was exported to requested dimensions with alpha-aware bilinear resampling. Cloud masters use 2560×1024, preserving source aspect within a 40 px inset; bloom masters use 1400×1400 with a 40 px inset; the paper frame uses 900×1100 with a 20 px inset. Opaque plates and albedo fill their target dimensions. Invisible RGB is zeroed and visible exact black/white pixels are remapped to the specified ink/cream palette.

Moon circle normalization, radial alpha geometry, and texture seam/pole finishing are specified in README.md. The final export was checked for pixel dimensions, alpha borders, portrait opening, visible palette extrema, and equality of the horizontal texture boundaries.
