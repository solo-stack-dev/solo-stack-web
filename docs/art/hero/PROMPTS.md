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

## hero-portrait-frame.png (retired 2026-11-03, master removed)

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

## hero-cloud-seat.png and registration preview (2026-11-06)

Built-in `image_gen.imagegen`, with `transparent_background: true` for all four successful generations. Highest quality was requested in every prompt; the tool exposes no model, quality, or output-size selector. No API/CLI fallback or dependency installation was used. This task generated no public-facing copy.

### Inputs and candidate review

The tool accepts at most five input paths. The initial call with seven individual paths was rejected before generation. To include every requested reference, `hero-cloud-seat-references.png` was assembled at 2048×2048 from the five existing hero masters, with no source edits. It contains cloud-1, cloud-2, cloud-3 in the first three horizontal rows, moon lower left, sky lower right, composited over #18191B. The screenshot and mascot were separate inputs. All originals and the sheet were viewed before generation.

Candidates A, B and C used these ordered image inputs:

1. `C:/Users/peter/.t3/userdata/attachments/045fafa9-1c82-48b7-8a68-d1b81143f990-db7d217c-39e9-4b65-aaa9-2951af656e6c.png`
2. `D:/repos/solo-stack-web/docs/art/mascot/mascot-hero-moonrim.png`
3. `D:/repos/solo-stack-web/docs/art/hero/hero-cloud-seat-references.png`

All three returned 1774×887 RGBA. They were visually inspected and rejected as final assets because their substantial visible silhouettes were too long and shallow, about 4:1, despite matching the pigment palette. Candidate C had the strongest broken ochre/charcoal material and was used for the compactness refinement D. D was selected after viewing its isolated result and the actual-layer registration composite. It has a roughly 2.4:1 visible silhouette, short left wisps, a shallow seating hollow, a warm broken upper-right rim, and a substantial charcoal underside. No vector or sticker-style candidate was selected.

Generated source directory: `C:/Users/peter/.codex/generated_images/01a1ae81-511b-7793-9022-5f837c88cba8/`.

### Candidate A (rejected as final)

Source: `exec-e59654a6-17f7-4dad-a4ec-b82f97106df2.png`.

Exact prompt:

```text
Use case: stylized-concept. Highest available image quality, production watercolor cutout for solo-stack.dev. Create ONE isolated compact puffy cloud cushion, target native PNG 2560x1280, at least 2048 px wide if possible. TRUE RGBA TRANSPARENT background, soft fractional alpha pigment edges, absolutely no painted backdrop or checkerboard. Reference 1 is the screenshot showing the integration problem: the mascot floats on the moon rim; use it for context only, do not reproduce its text or scene. Reference 2 is the seated mascot cutout, for scale/seat ergonomics only; DO NOT include any figure or laptop in the output. Reference 3 is a contact sheet containing ALL FIVE supplied hero layers: cloud-1 top row, cloud-2 second row, cloud-3 third row, moon lower left, sky lower right. The three cloud rows are the strict watercolor material and palette lock: match their granular charcoal/ochre pigment, capillary blooms, dry-brush broken edges, paper tooth WITHIN paint, and wispy fading ends. The lower-left and lower-right panels of reference 3 show the butter moon and dark sky that this transparent asset will overlap; do not include either in the output. Shape: one asymmetrical cloud approximately 2.5 times as wide as tall (painted silhouette excluding transparent margins), with a compact substantial cushion body toward the center/right and loose delicate wisps trailing LEFT. A shallow flattened concave seat dent at about 60 percent of cloud width on its TOP contour, broad enough for the supplied mascot's hips, with small gently rising cloud shoulders beside it; no tall central peak. Light: warm butter #FCD772 / cream #FBF3DD along upper RIGHT puff and seat surface, restrained ochre #E2A93B transitions, cooler charcoal #18191B / dusk #2A2723 pigment underneath and in lower-right body so it stays legible over a bright yellow moon. Soft broken luminous edge visible against dark sky, not an outline or uniform halo. Dense enough body to support a seated figure visually, translucent peripheral wisps. Keep the entire cloud inside the canvas with clear transparent margins on all sides. HAND-PAINTED watercolor mass with irregular pigment blooms, not sculpted 3D cotton, not photoreal mist, not vector lobes, not a sticker or cartoon icon, no ink contour or white cutout border. No moon, sky, person, mascot, laptop, stars, objects, text, symbols, watermark, or paper rectangle. Preserve natural pigment and genuine transparency. Candidate A: understated ochre-charcoal cushion; low horizontal seat shelf with an especially gentle shallow dent, irregular three-puff silhouette and a wispy left tail.
```

### Candidate B (rejected as final)

Source: `exec-17fbe223-9259-474d-af3e-3ac0f2becd64.png`.

Exact prompt:

```text
Use case: stylized-concept. Highest available image quality, production watercolor cutout for solo-stack.dev. Create ONE isolated compact puffy cloud cushion, target native PNG 2560x1280, at least 2048 px wide if possible. TRUE RGBA TRANSPARENT background, soft fractional alpha pigment edges, absolutely no painted backdrop or checkerboard. Reference 1 is the screenshot showing the integration problem: the mascot floats on the moon rim; use it for context only, do not reproduce its text or scene. Reference 2 is the seated mascot cutout, for scale/seat ergonomics only; DO NOT include any figure or laptop in the output. Reference 3 is a contact sheet containing ALL FIVE supplied hero layers: cloud-1 top row, cloud-2 second row, cloud-3 third row, moon lower left, sky lower right. The three cloud rows are the strict watercolor material and palette lock: match their granular charcoal/ochre pigment, capillary blooms, dry-brush broken edges, paper tooth WITHIN paint, and wispy fading ends. The lower-left and lower-right panels of reference 3 show the butter moon and dark sky that this transparent asset will overlap; do not include either in the output. Shape: one asymmetrical cloud approximately 2.5 times as wide as tall (painted silhouette excluding transparent margins), with a compact substantial cushion body toward the center/right and loose delicate wisps trailing LEFT. A shallow flattened concave seat dent at about 60 percent of cloud width on its TOP contour, broad enough for the supplied mascot's hips, with small gently rising cloud shoulders beside it; no tall central peak. Light: warm butter #FCD772 / cream #FBF3DD along upper RIGHT puff and seat surface, restrained ochre #E2A93B transitions, cooler charcoal #18191B / dusk #2A2723 pigment underneath and in lower-right body so it stays legible over a bright yellow moon. Soft broken luminous edge visible against dark sky, not an outline or uniform halo. Dense enough body to support a seated figure visually, translucent peripheral wisps. Keep the entire cloud inside the canvas with clear transparent margins on all sides. HAND-PAINTED watercolor mass with irregular pigment blooms, not sculpted 3D cotton, not photoreal mist, not vector lobes, not a sticker or cartoon icon, no ink contour or white cutout border. No moon, sky, person, mascot, laptop, stars, objects, text, symbols, watermark, or paper rectangle. Preserve natural pigment and genuine transparency. Candidate B: softer cream-taupe upper cushion with a clearly readable shallow saddle dent and a substantial smoky charcoal underside; right shoulder softly catches warm moonlight. Keep the creamy area small and broken by granular grey pigment.
```

### Candidate C (rejected as final)

Source: `exec-d1122ed6-312b-4476-bba9-ad174c1b8b03.png`.

Exact prompt:

```text
Use case: stylized-concept. Highest available image quality, production watercolor cutout for solo-stack.dev. Create ONE isolated compact puffy cloud cushion, target native PNG 2560x1280, at least 2048 px wide if possible. TRUE RGBA TRANSPARENT background, soft fractional alpha pigment edges, absolutely no painted backdrop or checkerboard. Reference 1 is the screenshot showing the integration problem: the mascot floats on the moon rim; use it for context only, do not reproduce its text or scene. Reference 2 is the seated mascot cutout, for scale/seat ergonomics only; DO NOT include any figure or laptop in the output. Reference 3 is a contact sheet containing ALL FIVE supplied hero layers: cloud-1 top row, cloud-2 second row, cloud-3 third row, moon lower left, sky lower right. The three cloud rows are the strict watercolor material and palette lock: match their granular charcoal/ochre pigment, capillary blooms, dry-brush broken edges, paper tooth WITHIN paint, and wispy fading ends. The lower-left and lower-right panels of reference 3 show the butter moon and dark sky that this transparent asset will overlap; do not include either in the output. Shape: one asymmetrical cloud approximately 2.5 times as wide as tall (painted silhouette excluding transparent margins), with a compact substantial cushion body toward the center/right and loose delicate wisps trailing LEFT. A shallow flattened concave seat dent at about 60 percent of cloud width on its TOP contour, broad enough for the supplied mascot's hips, with small gently rising cloud shoulders beside it; no tall central peak. Light: warm butter #FCD772 / cream #FBF3DD along upper RIGHT puff and seat surface, restrained ochre #E2A93B transitions, cooler charcoal #18191B / dusk #2A2723 pigment underneath and in lower-right body so it stays legible over a bright yellow moon. Soft broken luminous edge visible against dark sky, not an outline or uniform halo. Dense enough body to support a seated figure visually, translucent peripheral wisps. Keep the entire cloud inside the canvas with clear transparent margins on all sides. HAND-PAINTED watercolor mass with irregular pigment blooms, not sculpted 3D cotton, not photoreal mist, not vector lobes, not a sticker or cartoon icon, no ink contour or white cutout border. No moon, sky, person, mascot, laptop, stars, objects, text, symbols, watermark, or paper rectangle. Preserve natural pigment and genuine transparency. Candidate C: looser wet-on-wet ochre and dusk pigment with more torn drifting left filaments, a darker lower-right anchoring puff, and a quiet flattened seating hollow. Favor the texture of reference 3 over a neat rounded cloud icon.
```

### Candidate D (selected)

Source: `exec-c52b044a-8ac3-411f-82fe-03cb4bb76c81.png`. Ordered inputs:

1. `C:/Users/peter/.codex/generated_images/01a1ae81-511b-7793-9022-5f837c88cba8/exec-d1122ed6-312b-4476-bba9-ad174c1b8b03.png`
2. `D:/repos/solo-stack-web/docs/art/hero/hero-cloud-seat-references.png`

Exact prompt:

```text
Use case: precise-object-edit. Highest available quality. Reference 1 is the cloud to refine; reference 2 is the original hero material sheet with clouds in its first three rows, moon bottom left, sky bottom right. Produce ONE final transparent watercolor cloud cushion PNG, aim for 2560x1440 native pixels or largest possible native width at least 2048. Keep reference 1's exact hand-painted granular pigment style, ochre-charcoal palette, soft fractional RGBA alpha, shallow upper seat hollow, warm cream moonlit upper right and darker lower-right shading. CHANGE THE SILHOUETTE: it is currently an excessively long ribbon with a visible shape roughly 4:1. Make it much more compact and deeper, a true small puffy seat cushion. The entire VISIBLE painted silhouette, INCLUDING left wisps, must measure about 2.5:1 width to height, NOT 4:1. For a 2560x1440 canvas, confine all visible pigment approximately inside x=260..2300, y=320..1140, with ZERO alpha outside a soft small fringe. Puffy substantial lower body under the seat, rounded but irregular lumpy watercolor mass, asymmetric short thin wisps trailing LEFT taking only 15 percent of cloud width. Top contour is a gently flattened concave seat depression centered at 60 percent width, with low shoulders; it must support a seated mascot without looking like a chair. Dark charcoal underside makes the lower-right silhouette readable on the bright butter moon, broken soft cream/ochre upper-right edge makes it readable on dark sky. Watercolor pigment-on-paper grain INSIDE the cloud, not an opaque paper background. No broad rectangular haze or global glow. Real transparent exterior, soft feathered alpha wisps. No hard outline, sticker border, cartoon vector lobes, smooth digital cotton, 3D rendering, person, laptop, moon, sky, stars, typography or watermark. Preserve the palette and material; alter only the compactness and fullness of the cloud silhouette.
```

### Dimensions, transparency and anchors

- `hero-cloud-seat-native.png`: unmodified selected model output, **1672×941 RGBA**, 1,404,828 bytes. Native seat-dent anchor **(950, 355)** px. Raw alpha > 0 bounds **[0, 0, 1648, 941)** include near-invisible alpha=1 speckles across the canvas; alpha > 1 bounds **[122, 212, 1556, 810)**; alpha > 16 bounds **[124, 215, 1552, 804)**. The substantial silhouette aspect is 2.42:1.
- `hero-cloud-seat.png`: **2048×1152 RGBA**, 1,813,135 bytes. Final seat-dent anchor **(1164, 435)** px (56.83594%, 37.76042% of the complete canvas). Final alpha > 0 bounds **[149, 259, 1906, 992)**; alpha > 16 bounds **[152, 263, 1900, 984)**. Bounds are left/top inclusive, right/bottom exclusive. Alpha exterior is real transparency; all four outer edges are zero. 1,580,223 fully transparent pixels, 779,061 fractional-alpha pixels, 12 fully opaque pixels, all 256 alpha levels present. The soft generated paint itself is almost entirely fractionally transparent, including dense near-opaque interior pigment.
- `hero-cloud-seat-preview.png`: **1600×1200 RGB**, 2,615,338 bytes. Intentionally opaque registration proof, not a runtime asset. Uses the exact exported cloud and supplied mascot/moon/sky rasters; no regenerated anatomy or scene.

Native width >=2048 was requested but not returned. The final 2048×1152 export is modestly enlarged and does **not** contain native 2K generated detail. Technical finishing removed only alpha values <=1 (the near-invisible isolated speckles), preserved all other generated alpha, and used premultiplied-alpha Lanczos resampling before saving an sRGB-tagged PNG. No pigment was painted procedurally and no background was keyed out. The raw native file is retained for provenance.

### Preview assembly recipe (no generation prompt)

The requested test composite was assembled deterministically so anchor fit can be evaluated against the unchanged production cutout. Coordinates are source-canvas pixels from the top left. RGBA resizing used premultiplied alpha with Lanczos; layers were composited source-over in this order:

1. Sky: crop `hero-sky.png` to **[760, 0, 2360, 1200)**.
2. Moon: resize `hero-moon-disc.png` to **2428×2428**, place at **(276, 226)**. Its nominal radius is about 1100 px and its center is (1490, 1440), putting the upper-left rim behind the cloud.
3. Cloud: resize the final `hero-cloud-seat.png` to **758×426**, place at **(324, 459)**. Its dent lands at approximately **(755.32, 619.86)**.
4. Mascot: resize `docs/art/mascot/mascot-hero-moonrim.png` to **594×891**, place at **(326, 51)**. The documented mascot seat anchor (740, 980) lands at approximately **(755.26, 619.48)**, within half a pixel of the cloud dent. The whole mascot is above the cloud, preserving dangling legs in front.

The final composite was visually inspected at 1600×1200. The cloud supports the hips, crosses the moon's upper-left rim, remains distinguishable against both backgrounds and matches the existing pigment palette. The selected cloud and its composite contain no added text. Only files in `docs/art/hero/` were created or edited; no implementation, public assets, dependencies or commits were changed.

## Original 2026-11-01 export finishing

No artwork was painted procedurally. Generated raster pigment was exported to requested dimensions with alpha-aware bilinear resampling. Cloud masters use 2560×1024, preserving source aspect within a 40 px inset; bloom masters use 1400×1400 with a 40 px inset; the paper frame uses 900×1100 with a 20 px inset. Opaque plates and albedo fill their target dimensions. Invisible RGB is zeroed and visible exact black/white pixels are remapped to the specified ink/cream palette.

Moon circle normalization, radial alpha geometry, and texture seam/pole finishing are specified in README.md. The final export was checked for pixel dimensions, alpha borders, portrait opening, visible palette extrema, and equality of the horizontal texture boundaries.
