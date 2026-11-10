# transitions generation prompts

Note: everything prefixed `_` referenced below (the `_source-*`, `_check-*` and `_rejected-*` images, `_wash-report.html`, the master finishing scripts `_process-mist.mjs` / `_process-washes.mjs` / `_check-washes.mjs` / `_validate-wash-spread.mjs`, the retired Python finishers and the `_*-validation.json` measurements) is not committed; it is archived outside the repo in `~/solo-stack-redesign/art-scratch/transitions/` (the scripts are also in git history before this note). The finishing scripts resolve the repo relative to their own folder, so copy them back next to this file together with their `_source-*` inputs to re-finish a master. Shipped runtime assets are rebuilt from the committed masters only, see [README.md](README.md).

## mist strips

Generated on 2026-11-03 with the built-in `image_gen` tool and inspected image references. Model identity is not exposed by this tool; there is no separate model, quality, or exact-size parameter. Every prompt requests highest available quality and fidelity. No API/CLI generation fallback or dependency installation was used. Post-processing used existing Pillow 12.3.0 and NumPy 2.5.3. No public text is present in these assets.

All seven requested references were opened and inspected:

1. `docs/art/hero/hero-sky.png`
2. `docs/art/hero/hero-clouds-1.png`
3. `docs/art/hero/hero-clouds-2.png`
4. `docs/art/making/making-plate.png`
5. `docs/art/radio/radio-landscape.png`
6. `docs/art/cinema/cinema-landscape.png`
7. `D:/repos/Solo Stack/branding/final-branding-assets/04-buttergelb-banner-nachtstudio-youtube-2560x1440.jpg`

Generation reference order in each successful call: catalog 2, 3, 4, 6, 7 (five is the tool maximum). Hero sky and radio landscape informed visual review but were not passed to generation. An initial seven-reference call failed validation before generating an image.

Prompt/documentation precedents inspected: `docs/art/shared/PROMPTS.md`, `docs/art/hero/PROMPTS.md`, `docs/art/sunrise/PROMPTS.md`.

All native sources reside under `~/.codex/generated_images/01a1a33d-71a7-7bd2-8754-c23dd1c14e0b/`. Final production outputs and check composites reside in this directory. The source PNGs are inputs to the documented finishing process, not approved production deliverables by themselves.

### mist-dusk.png

- Native: 2172×724 px, RGBA. Final: 2560×720 px, RGBA.
- `transparent_background`: true.
- Final generated source: `exec-2447f777-60d9-4267-b137-a81b4afaac32.png`.
- References: catalog 2, 3, 4, 6, 7, in that order.

Exact final prompt:

```text
Use case: stylized-concept. Highest available image quality and fidelity. Paint ONE original production atmospheric MIST layer for solo-stack.dev, requested PNG RGBA 2560x720 panoramic 32:9. This is drifting AIR to dissolve boundaries between paintings, never an object or brush stroke. References in order: 1 hero cloud bank, 2 hero wisps, 3 making night plate, 4 cinema landscape, 5 brand banner. References 1-2 are for pigment TEXTURE only: do not copy their dense opacity, hard silhouette or bright rims. Match their exact natural watercolor pigment granulation, paper tooth, soft anime-watercolor and ink atmosphere, wet-in-wet capillary blooms. Borrow only material and palette, no scenery. Much quieter and more diffuse than the reference clouds. Paint three very loosely overlapping veils of thin mist across the ENTIRE width, continuing off BOTH left and right edges. Watercolour is transparent atmospheric breathing space, not solid paint. CRITICAL: at least 30 percent of the CENTRAL painted region is open alpha gaps. All outer edges evaporate gradually with very low opacity, NOT a silhouetted closed contour. Absolutely no continuous lower edge; lower wisps end at widely differing heights. Do NOT wrap the vapour in an outline, rim, border or light-colored envelope. The background MUST show through nearly everywhere. Most of the mist is nearly invisible, dilute dark warm gray pigment with sparse restrained light. Broad low-frequency wisps fade through fine paper-granulated broken edges. Asymmetric spacious thinner gaps and transparent holes between overlapping veils. No central single cloud silhouette, no taper at horizontal ends, no side padding. Seamlessly tileable LEFT-to-RIGHT with matching edge shapes/colors/densities. Top 18 percent and bottom 18 percent absolutely empty transparent alpha. All painting confined between these margins with highly irregular soft diluted wet feathering into nothing; no straight top/bottom edge. In middle billows 25-65 percent alpha usually, a few denser pockets at most 85 percent; see-through layered water vapour, absolutely no opaque body. Fine pigment grain inside the broad shapes; small diffuse pigment islands at edges, not hard outlined flecks or aerosol. Real alpha, no backdrop, no painted checkerboard. RGB in transparent pixels should extend the local dark mist colors, no white/black matte. Palette only anthracite #18191B, night #1a1a1b, warm dusk #2A2723, deep night #0e0f10; light from muted cream #FBF3DD, butter #FCD772, ochre #E2A93B. No blue, green, olive, saturated colors, pure white or pure black. No moon, sun, stars, landscape, mountains, trees, objects, people, mascot, text, letters, logo, frame, borders. NO smoke plumes, fire smoke, rising curls, isolated cumulus, rolling storm, brush strokes, ribbons, stripe, solid band, digital airbrush blur or smooth gradient. Retain authentic hand-painted tactile pigment in thin airy layers. Variant DUSK, 20:00-22:00: warm dusky vapour mostly very translucent warm dusk #2A2723 and anthracite. A FEW subdued ochre/butter catch-lights on upper billows, as if lit by an off-screen moon. Light is sparse, softly lost inside the pigment, never a complete gold outline. Gentle wide low cloud-bank veil; warm charcoal shadows remain dominant.
```

Quality note: Warm charcoal veils with sparse ochre light on upper billows. The final light is deliberately much dimmer than the hero cloud reference. Fine pigment detail survives, with open, feathered edges and no pale paper envelope. Its two lit clusters remain readable even on the making plate.

### mist-night.png

- Native: 2172×724 px, RGBA. Final: 2560×720 px, RGBA.
- `transparent_background`: true.
- Final generated source: `exec-1084b6f6-e92d-433a-995a-a0d785d3bf43.png`.
- References: catalog 2, 3, 4, 6, 7, in that order.

Exact final prompt:

```text
Use case: stylized-concept. Highest available image quality and fidelity. Paint ONE original production atmospheric MIST layer for solo-stack.dev, requested PNG RGBA 2560x720 panoramic 32:9. This is drifting AIR to dissolve boundaries between paintings, never an object or brush stroke. References in order: 1 hero cloud bank, 2 hero wisps, 3 making night plate, 4 cinema landscape, 5 brand banner. References 1-2 are for pigment TEXTURE only: do not copy their dense opacity, hard silhouette or bright rims. Match their exact natural watercolor pigment granulation, paper tooth, soft anime-watercolor and ink atmosphere, wet-in-wet capillary blooms. Borrow only material and palette, no scenery. Much quieter and more diffuse than the reference clouds. Paint three very loosely overlapping veils of thin mist across the ENTIRE width, continuing off BOTH left and right edges. Watercolour is transparent atmospheric breathing space, not solid paint. CRITICAL: at least 30 percent of the CENTRAL painted region is open alpha gaps. All outer edges evaporate gradually with very low opacity, NOT a silhouetted closed contour. Absolutely no continuous lower edge; lower wisps end at widely differing heights. Do NOT wrap the vapour in an outline, rim, border or light-colored envelope. The background MUST show through nearly everywhere. Most of the mist is nearly invisible, dilute dark warm gray pigment with sparse restrained light. Broad low-frequency wisps fade through fine paper-granulated broken edges. Asymmetric spacious thinner gaps and transparent holes between overlapping veils. No central single cloud silhouette, no taper at horizontal ends, no side padding. Seamlessly tileable LEFT-to-RIGHT with matching edge shapes/colors/densities. Top 18 percent and bottom 18 percent absolutely empty transparent alpha. All painting confined between these margins with highly irregular soft diluted wet feathering into nothing; no straight top/bottom edge. In middle billows 25-65 percent alpha usually, a few denser pockets at most 85 percent; see-through layered water vapour, absolutely no opaque body. Fine pigment grain inside the broad shapes; small diffuse pigment islands at edges, not hard outlined flecks or aerosol. Real alpha, no backdrop, no painted checkerboard. RGB in transparent pixels should extend the local dark mist colors, no white/black matte. Palette only anthracite #18191B, night #1a1a1b, warm dusk #2A2723, deep night #0e0f10; light from muted cream #FBF3DD, butter #FCD772, ochre #E2A93B. No blue, green, olive, saturated colors, pure white or pure black. No moon, sun, stars, landscape, mountains, trees, objects, people, mascot, text, letters, logo, frame, borders. NO smoke plumes, fire smoke, rising curls, isolated cumulus, rolling storm, brush strokes, ribbons, stripe, solid band, digital airbrush blur or smooth gradient. Retain authentic hand-painted tactile pigment in thin airy layers. Variant NIGHT, 01:00-02:00: deepest night vapour, extremely low contrast anthracite and deep-night, calm and horizontal. Only a faint cool-NEUTRAL cream reflection on a FEW shallow billows; cool means neutral gray relative to dusk, absolutely NO blue pigment. No gold illumination. Most vapour is dark translucent charcoal, very quiet. Delicate broad overlapping veils with irregular openings; no bright continuous rim.
```

Quality note: The quietest asset: neutral charcoal vapour and a few subdued cream-gray reflections. No blue or olive tint. It intentionally nearly disappears on the darkest background; the highlights are faint, especially when downscaled. Lower-density pixels were raised gently to keep a majority of the central field in the requested working opacity range.

### mist-predawn.png

- Native: 2172×724 px, RGBA. Final: 2560×720 px, RGBA.
- `transparent_background`: true.
- Final generated source: `exec-16cf2382-2faf-4256-bef4-d695c27cbd67.png`.
- References: catalog 2, 3, 4, 6, 7, in that order.

Exact final prompt:

```text
Use case: stylized-concept. Highest available image quality and fidelity. Paint ONE original production atmospheric MIST layer for solo-stack.dev, requested PNG RGBA 2560x720 panoramic 32:9. This is drifting AIR to dissolve boundaries between paintings, never an object or brush stroke. References in order: 1 hero cloud bank, 2 hero wisps, 3 making night plate, 4 cinema landscape, 5 brand banner. References 1-2 are for pigment TEXTURE only: do not copy their dense opacity, hard silhouette or bright rims. Match their exact natural watercolor pigment granulation, paper tooth, soft anime-watercolor and ink atmosphere, wet-in-wet capillary blooms. Borrow only material and palette, no scenery. Much quieter and more diffuse than the reference clouds. Paint three very loosely overlapping veils of thin mist across the ENTIRE width, continuing off BOTH left and right edges. Watercolour is transparent atmospheric breathing space, not solid paint. CRITICAL: at least 30 percent of the CENTRAL painted region is open alpha gaps. All outer edges evaporate gradually with very low opacity, NOT a silhouetted closed contour. Absolutely no continuous lower edge; lower wisps end at widely differing heights. Do NOT wrap the vapour in an outline, rim, border or light-colored envelope. The background MUST show through nearly everywhere. Most of the mist is nearly invisible, dilute dark warm gray pigment with sparse restrained light. Broad low-frequency wisps fade through fine paper-granulated broken edges. Asymmetric spacious thinner gaps and transparent holes between overlapping veils. No central single cloud silhouette, no taper at horizontal ends, no side padding. Seamlessly tileable LEFT-to-RIGHT with matching edge shapes/colors/densities. Top 18 percent and bottom 18 percent absolutely empty transparent alpha. All painting confined between these margins with highly irregular soft diluted wet feathering into nothing; no straight top/bottom edge. In middle billows 25-65 percent alpha usually, a few denser pockets at most 85 percent; see-through layered water vapour, absolutely no opaque body. Fine pigment grain inside the broad shapes; small diffuse pigment islands at edges, not hard outlined flecks or aerosol. Real alpha, no backdrop, no painted checkerboard. RGB in transparent pixels should extend the local dark mist colors, no white/black matte. Palette only anthracite #18191B, night #1a1a1b, warm dusk #2A2723, deep night #0e0f10; light from muted cream #FBF3DD, butter #FCD772, ochre #E2A93B. No blue, green, olive, saturated colors, pure white or pure black. No moon, sun, stars, landscape, mountains, trees, objects, people, mascot, text, letters, logo, frame, borders. NO smoke plumes, fire smoke, rising curls, isolated cumulus, rolling storm, brush strokes, ribbons, stripe, solid band, digital airbrush blur or smooth gradient. Retain authentic hand-painted tactile pigment in thin airy layers. Variant PREDAWN, 02:00-04:00: warm dusk #2A2723 vapour dominant, with a FAINT restrained warm ochre glow bleeding softly through LOWER portions, suggesting the distant horizon begins to warm but without any horizon line or scene. Large airy shallow billows, broken and dissolving thin overlapping layers. Slightly warmer below, darker above. Never a glowing gold stripe, no sunrise disc.
```

Quality note: Warm dusk veil with broken ochre illumination along lower billows. Subtle and diffuse, without a continuous luminous horizon stripe. Texture is finer and softer than the bold plate pigment, fitting distant mist rather than copying the plates at identical contrast.

### Rejected attempt and finishing revisions

The first dusk attempt, `exec-d4f1d640-593f-4f26-bad9-f34aadba46d2.png`, was rejected: a nearly continuous lower contour made the cloud read as a solid band. It was regenerated with explicit open-alpha gaps, unconnected veils, diffuse outer edges, and instructions not to copy the dense silhouette of the hero clouds.

References: catalog 2, 3, 4, 6, 7.

Exact rejected prompt:

```text
Use case: stylized-concept. Highest available image quality and fidelity. Paint ONE original production atmospheric MIST layer for solo-stack.dev, requested PNG RGBA 2560x720 panoramic 32:9. This is drifting AIR to dissolve boundaries between paintings, never an object or brush stroke. References in order: 1 hero cloud bank, 2 hero wisps, 3 making night plate, 4 cinema landscape, 5 brand banner. Match their exact natural watercolor pigment granulation, paper tooth, soft anime-watercolor and ink atmosphere, wet-in-wet capillary blooms. Borrow only material and palette, no scenery. Much quieter and more diffuse than the reference clouds. Paint widely varying overlapping horizontal watery veils and broad soft shallow billows across the ENTIRE width, continuing off BOTH left and right edges. Asymmetric spacious thinner gaps and transparent holes between overlapping veils. No central single cloud silhouette, no taper at horizontal ends, no side padding. Seamlessly tileable LEFT-to-RIGHT with matching edge shapes/colors/densities. Top 18 percent and bottom 18 percent absolutely empty transparent alpha. All painting confined between these margins with highly irregular soft diluted wet feathering into nothing; no straight top/bottom edge. In middle billows 25-65 percent alpha usually, a few denser pockets at most 85 percent; see-through layered water vapour, absolutely no opaque body. Fine pigment grain inside the broad shapes; small diffuse pigment islands at edges, not hard outlined flecks or aerosol. Real alpha, no backdrop, no painted checkerboard. RGB in transparent pixels should extend the local dark mist colors, no white/black matte. Palette only anthracite #18191B, night #1a1a1b, warm dusk #2A2723, deep night #0e0f10; light from muted cream #FBF3DD, butter #FCD772, ochre #E2A93B. No blue, green, olive, saturated colors, pure white or pure black. No moon, sun, stars, landscape, mountains, trees, objects, people, mascot, text, letters, logo, frame, borders. NO smoke plumes, fire smoke, rising curls, isolated cumulus, rolling storm, brush strokes, ribbons, stripe, solid band, digital airbrush blur or smooth gradient. Retain authentic hand-painted tactile pigment in thin airy layers. Variant DUSK, 20:00-22:00: warm dusky vapour mostly very translucent warm dusk #2A2723 and anthracite. A FEW subdued ochre/butter catch-lights on upper billows, as if lit by an off-screen moon. Light is sparse, softly lost inside the pigment, never a complete gold outline. Gentle wide low cloud-bank veil; warm charcoal shadows remain dominant.
```

The accepted generated sources still had excessively pale RGB around their translucent pigment. They were not accepted unchanged. Palette remapping removed that carrier, retained the generated opacity/detail, and produced the dark atmospheric finals. This is not a claim that raw model output met the alpha/palette specification.

The first processed night version had only 38.35% of central pixels in the 25–65% alpha interval. Its generated opacity was gently remapped with `0.88 * alpha ** 0.65` before the shared 0.85 ceiling multiplier. The final central proportion is 51.61%; its peak remains lower than the other two, appropriate for deep night.

### Export processing

Reproducible implementation: `_process-mist.py`. Exact measured results: `_mist-validation.json`.

1. Resize each native RGBA source to 2560×720 using Pillow Lanczos, which resamples RGBA in premultiplied form.
2. Retain generated alpha and its fine pigment structure. Dusk/predawn density is multiplied by a luminance-derived factor in 0.72–1.00 to suppress pale carrier. Night uses the nonlinear density adjustment above. No opaque background or checkerboard is retained.
3. Remap dusk/predawn RGB to warm dusk #2A2723 and darker warm charcoal. Source red-minus-blue pigment variation drives sparse ochre reflection: upper weighting for dusk, lower weighting for predawn. Night uses neutral charcoal with faint muted cream-gray light. Preserve high-frequency source granulation as a small pigment-color residual. No artificial noise or blurred replacement clouds were synthesized.
4. Multiply alpha by 0.85 and by an irregular feather envelope. Broad periodic contour variation, different top/bottom phases and widths, cubic smoothstep falloff, and source-pigment displacement produce uneven wet boundaries; this is not a straight linear vertical gradient. Original generated opacity retains the holes and islands.
5. Cross-blend the outer 360 columns with a half-width-shifted copy using cubic smoothstep weights, in premultiplied RGB/alpha space. The shifted copy has continuous original interior pigment at the wrapping boundary. Match opposing final columns exactly in all four channels. Inspect the seam after a half-width offset.
6. Round alpha to 8-bit, clear values below 2, and explicitly clear top 130 and bottom 130 rows (18.056% each). All three peaks are below 217/255. Fade very low-alpha RGB toward the local base mist pigment; alpha-zero RGB is #2A2723 for dusk/predawn and #19191A for night. No black/white hidden matte.
7. Save optimized lossless PNG, compression level 9. No indexed-alpha conversion.
8. Composite each final on #1a1a1b, #2d2620, and a 2560×720 crop of making-plate.png at (0, 280)–(2560, 1000). Save the three full-size composites as stacked rows in `_check-mist-<name>.png` (2560×2160 RGB). The moon and objects in row 3 belong only to the reference plate, not to the mist assets. Inspect all three backgrounds and the half-offset seam for every strip.

### Numerical validation and review

Alpha is reported on the 0–255 scale. Mean is over the whole canvas, including the required empty margins; it is therefore lower than the working opacity of the painted middle.

- Dusk: 1,004,731 bytes; alpha min/max/mean 0 / 214 / 52.698947 (mean 20.6663%). Central working interval 25–65% covers 53.43% of rows 230–489.
- Night: 822,927 bytes; alpha min/max/mean 0 / 189 / 39.955665 (mean 15.6689%). Central working interval covers 51.61%.
- Predawn: 1,119,815 bytes; alpha min/max/mean 0 / 215 / 56.196308 (mean 22.0378%). Central working interval covers 58.32%.
- All three: actual 2560×720 RGBA; top/bottom 130-row alpha maximum 0; left/right RGBA maximum difference 0; alpha-zero RGB contains exactly one non-black, non-white mist color per file.
- Dusk check: 2560×2160 RGB, 2,870,048 bytes.
- Night check: 2560×2160 RGB, 2,524,394 bytes.
- Predawn check: 2560×2160 RGB, 2,981,809 bytes.
- Check images are opaque RGB (equivalent alpha min/max/mean 255 / 255 / 255 when converted to RGBA).

Final visual review: no straight strip boundary, white fringe, visible tile seam, fire-smoke plume, or baked background in the production strips. Granulation is intentionally finer and subtler than the bold underlying painted plates; it is not an exact pixel-scale match. Night is very restrained. These assets were reviewed as static composites; page parallax behavior was not changed or tested by this art task.

### Redo 2 — painted cloud banks (2026-11-03, current production files)

**The earlier mist prompts, acceptance notes, and metrics above are historical and REJECTED.** Their instruction to make the pigment nearly invisible produced thin digital-looking smoke, especially on #111213 and #2d2620. The old night strip had whole-canvas alpha mean 39.955665. Its tonal range and fine smooth texture did not match the bold plate clouds. The previous PNGs are preserved byte-for-byte as `_rejected-mist-dusk-1.png`, `_rejected-mist-night-1.png`, and `_rejected-mist-predawn-1.png`.

The redo uses the built-in `image_gen` tool. It exposes neither a model selector/model identity nor a quality setting; every prompt explicitly requests highest available quality and fidelity. No claim of a specific image-model version is made. All three native outputs are 2172×724 RGB on a flat magenta key, with `transparent_background: false` as requested for subsequent alpha extraction. Public text is absent.

These five style inputs were opened with `view_image` and passed in this exact order for every call:

1. `docs/art/hero/hero-clouds-1.png`
2. `docs/art/hero/hero-clouds-2.png`
3. `docs/art/hero/hero-clouds-3.png`
4. `docs/art/making/making-plate.png`
5. `docs/art/radio/radio-landscape.png`

The material target is broad wet-in-wet cauliflower blossoms, pooled dark pigment, visible grain/backruns, overlapping washes, and light on sculpted cloud rims. Reference objects, moons, stars, and landscapes are not part of the generated strips. Source masters are retained locally as `_source-mist-<name>.png`. Native tool output directory: `~/.codex/generated_images/01a1a351-7b70-7922-806b-f99de82a647f/`.

#### Redo dusk — exact prompt

Native source: `exec-5ab41cb5-3f00-4557-aba7-c8c45811fd44.png`. Local source: `_source-mist-dusk.png`.

```text
Use case: stylized-concept. Highest available quality and image fidelity. Create one production watercolor LOW-LYING CLOUD BANK for solo-stack.dev, landscape panoramic aspect 3:1 (finishing to 2560x720). The five images are STYLE REFERENCES: hero-clouds-1, hero-clouds-2, hero-clouds-3, making-plate, radio-landscape. Match their bold wet-in-wet cauliflower bloom edges, coarse visible pigment granulation, backruns and layered anthracite washes at exactly their visual texture scale. Do not copy objects or background scenery. Paint two or three overlapping horizontal layers of broad soft billows across the ENTIRE WIDTH, extending off both left and right edges with matching height and color for seamless tiling. Bank fills middle 64% of image; top and bottom 18% empty. Irregular deeply scalloped top edges; softer broken dissolving undersides; a few gaps between overlapping billows. Dense painted form, most interiors 45-80% pigment coverage, cores to 90%; not wispy smoke. Strong internal tonal variation: dark anthracite cores, clearly lighter warm gray lit rims. Medium scale watercolor cauliflower blossoms and drying tide marks, small granular pigment within them, not digital noise or airbrush. Flat UNTEXTURED SOLID saturated magenta #FF00FF backdrop for later alpha extraction. No magenta in paint; background is a technical key, not pink light. Keep key background uniform everywhere outside cloud. Do not surround cloud with white paper or pale halo. Let translucent dissolving edges mix naturally with the key color, but solid painted billows retain original neutral/warm pigments. No moon, stars, sky, objects, landscape, silhouettes, mountains, trees, text, letters, frame or border. No smoke plumes, rising curls, smooth gradients, long flat stripe or isolated single puff. Authentically hand-painted ink and watercolor cloud bank with unmistakable billow forms. Variant DUSK: warm dusk #2A2723 and anthracite billows. Several interrupted upper rims lit with ochre #E2A93B and butter #FCD772 by an unseen moon. Visible warm gray midtones, substantial dark warm shadows. Keep the broad tops illuminated in separated clusters, not a continuous outline. Calm low horizontal cloud bank.
```

Quality note: Warm ochre/butter upper rims, broad anthracite cores and coarse visible pigment. The darkest cores merge with the night backdrop but the rim geometry stays clear. Open holes are sparse; lower veils carry the softness.

#### Redo night — exact prompt

Native source: `exec-8a213038-6ce6-448e-8046-b85bba0a05e7.png`. Local source: `_source-mist-night.png`.

```text
Use case: stylized-concept. Highest available quality and image fidelity. Create one production watercolor LOW-LYING CLOUD BANK for solo-stack.dev, landscape panoramic aspect 3:1 (finishing to 2560x720). The five images are STYLE REFERENCES: hero-clouds-1, hero-clouds-2, hero-clouds-3, making-plate, radio-landscape. Match their bold wet-in-wet cauliflower bloom edges, coarse visible pigment granulation, backruns and layered anthracite washes at exactly their visual texture scale. Do not copy objects or background scenery. Paint two or three overlapping horizontal layers of broad soft billows across the ENTIRE WIDTH, extending off both left and right edges with matching height and color for seamless tiling. Bank fills middle 64% of image; top and bottom 18% empty. Irregular deeply scalloped top edges; softer broken dissolving undersides; a few gaps between overlapping billows. Dense painted form, most interiors 45-80% pigment coverage, cores to 90%; not wispy smoke. Strong internal tonal variation: dark anthracite cores, clearly lighter warm gray lit rims. Medium scale watercolor cauliflower blossoms and drying tide marks, small granular pigment within them, not digital noise or airbrush. Flat UNTEXTURED SOLID saturated magenta #FF00FF backdrop for later alpha extraction. No magenta in paint; background is a technical key, not pink light. Keep key background uniform everywhere outside cloud. Do not surround cloud with white paper or pale halo. Let translucent dissolving edges mix naturally with the key color, but solid painted billows retain original neutral/warm pigments. No moon, stars, sky, objects, landscape, silhouettes, mountains, trees, text, letters, frame or border. No smoke plumes, rising curls, smooth gradients, long flat stripe or isolated single puff. Authentically hand-painted ink and watercolor cloud bank with unmistakable billow forms. Variant NIGHT: three low overlapping layers, calm and horizontal. Anthracite #18191B and deep night shadow cores, warm-neutral charcoal midtones. Sparing but CLEARLY VISIBLE cool-neutral cream #FBF3DD highlights on several upper scalloped rims, gray-cream not blue, softer than dusk gold. Preserve dark cores and brighter rims with visible watercolor pigment and backruns. No yellow/gold illumination. Do not make a featureless black or gray bank.
```

Quality note: Neutral cream-gray upper rims stay legible on both dark backgrounds. Three calm overlapping layers and pronounced dark cores. More restrained in color than dusk, but visibly painted rather than near-invisible smoke.

#### Redo predawn — exact prompt

Native source: `exec-cc238dd7-cf73-4f8a-af5f-f847f81bcc0c.png`. Local source: `_source-mist-predawn.png`.

```text
Use case: stylized-concept. Highest available quality and image fidelity. Create one production watercolor LOW-LYING CLOUD BANK for solo-stack.dev, landscape panoramic aspect 3:1 (finishing to 2560x720). The five images are STYLE REFERENCES: hero-clouds-1, hero-clouds-2, hero-clouds-3, making-plate, radio-landscape. Match their bold wet-in-wet cauliflower bloom edges, coarse visible pigment granulation, backruns and layered anthracite washes at exactly their visual texture scale. Do not copy objects or background scenery. Paint two or three overlapping horizontal layers of broad soft billows across the ENTIRE WIDTH, extending off both left and right edges with matching height and color for seamless tiling. Bank fills middle 64% of image; top and bottom 18% empty. Irregular deeply scalloped top edges; softer broken dissolving undersides; a few gaps between overlapping billows. Dense painted form, most interiors 45-80% pigment coverage, cores to 90%; not wispy smoke. Strong internal tonal variation: dark anthracite cores, clearly lighter warm gray lit rims. Medium scale watercolor cauliflower blossoms and drying tide marks, small granular pigment within them, not digital noise or airbrush. Flat UNTEXTURED SOLID saturated magenta #FF00FF backdrop for later alpha extraction. No magenta in paint; background is a technical key, not pink light. Keep key background uniform everywhere outside cloud. Do not surround cloud with white paper or pale halo. Let translucent dissolving edges mix naturally with the key color, but solid painted billows retain original neutral/warm pigments. No moon, stars, sky, objects, landscape, silhouettes, mountains, trees, text, letters, frame or border. No smoke plumes, rising curls, smooth gradients, long flat stripe or isolated single puff. Authentically hand-painted ink and watercolor cloud bank with unmistakable billow forms. Variant PREDAWN: three low overlapping layers of warm dusk #2A2723 and anthracite billows. Strong warm ochre #E2A93B glow bleeding through lower veils and illuminating UNDERSIDES of the billows, as if a horizon is warming far below the frame. Darker tops and shadow cores, warm-gray midtones, broken butter #FCD772 lower catchlights. Light appears in separated uneven pools under and between clouds, never a straight glowing horizon stripe. No sunrise, sun disc, landscape or horizon. Clear readable watercolor light and dark form.
```

Quality note: Ochre light pools under and between dark billows, with visibly darker tops. The lower glow is irregular rather than a straight stripe; some warm light also remains on upper scallops.

#### Redo finishing and rejected finishing passes

Current reproducible finisher: `_process-mist.mjs`, using existing Sharp 0.35.5. Run `node docs/art/transitions/_process-mist.mjs`. The former Python implementation is preserved as `_process-mist-rejected-1.py`; `_process-mist.py` now forwards to the current finisher so it cannot accidentally restore the rejected appearance. The session's shell process launch failed with access denied; the same exported JavaScript function was executed through Node REPL, one asset at a time. No dependencies were installed.

1. Extract coverage from magenta excess `max(0, min(R, B) - G)`. Unmix the magenta carrier from RGB, suppress residual key spill, and retain the original painted color contrast. This differs from the old script's severe dark-palette remapping.
2. Resize with alpha-aware Lanczos to 2560×500 and place centrally on a 2560×720 canvas. This deliberately flattens the native forms into a low cloud bank. A first 600-pixel-high fit flattened the tallest dusk billow against the margin feather and was rejected during composite inspection.
3. Set pigment density with `clamp(0.53 + 0.38 * (1 - luminance) ** 1.4, 0.45, 0.90)`. The initial density formula put too much of the bank above 80% alpha and was rejected. Current midtones sit mostly in the 45–80% interval; a minority of dark cores approach 90%.
4. Multiply coverage by an organic top/bottom feather envelope with periodic multi-frequency contour variation and pigment-driven displacement. Follow the source's actual lower silhouette (49-column smoothing) with an additional 60-pixel nonlinear fade, so the undersides evaporate before their closed painted outline. Generated billow shapes and grain remain the source of the visible art; no procedural clouds or texture noise were painted.
5. Make the horizontal wrap continuous by blending the outer 280 columns into a half-width-shifted copy in premultiplied RGB/alpha space. Average opposing terminal columns to identical RGBA values. Inspect the resulting seam at the center of the half-offset proof, not only at the outside edge.
6. Guarantee alpha zero in rows 0–115 and 604–719 (116 rows, 16.111% at each end). Clear tiny alpha values. Fade very low-alpha RGB to the mist base and fill fully transparent RGB with #2A2723 (dusk/predawn) or #18191B (night); there is no black, white, or magenta hidden matte.
7. Export lossless 2560×720 RGBA PNGs, compression level 9. Regenerate `_check-mist-<name>.png` as 2560×2160 RGB: top row #111213; middle row #2d2620; bottom row the making plate crop (0,280)–(2560,1000) after fitting its width to 2560. Plate objects appear only in the proof backgrounds.
8. Also export `_check-mist-<name>-seam.png`, 2560×1440 RGB, with the wrap centered over the two flat dark backgrounds.

All three final background checks and offset seam checks were visually inspected. The result reads as layered painted cloud forms, with ragged upper blooms and soft undersides; no visible magenta fringe, pale matte envelope, straight canvas cutoff, or abrupt wrap seam was found. These are deliberately substantial banks. The generated overlap is fairly continuous and open holes are sparse, especially in dusk; the translucent undersides provide most of the air. The style is materially much closer to the plate artwork, although vertical compression makes its grain slightly flatter. Static art checks do not establish how dense the banks will feel in scrolling/parallax integration.

#### Redo measured results

Values use the 0–255 alpha scale; whole-canvas mean includes transparent margins. The requested middle 60% means rows 144–575 inclusive, exactly 432×2560 pixels. Threshold is strictly alpha > 115. Full results: `_mist-validation.json`.

- `mist-dusk.png`: 2560×720 RGBA; 2,255,995 bytes; alpha min/max/mean 0 / 229 / 69.247936; middle-60% alpha > 115: 59.495895%.
- `mist-night.png`: 2560×720 RGBA; 1,827,734 bytes; alpha min/max/mean 0 / 229 / 65.047659; middle-60% alpha > 115: 55.167010%.
- `mist-predawn.png`: 2560×720 RGBA; 2,331,050 bytes; alpha min/max/mean 0 / 229 / 68.625023; middle-60% alpha > 115: 58.828939%.
- All three: top/bottom 116-row alpha max 0; left/right RGBA difference 0; alpha-zero RGB equals the corresponding mist base.

## wash ramps

Generated on 2026-11-03 with the built-in `image_gen` tool. The tool exposes neither the underlying model identity nor separate quality/size controls; every call requested highest available quality. No CLI/API fallback or dependency installation. All four calls generated opaque grayscale luminance sources with `transparent_background: false`, as requested, followed by local conversion to white RGB plus alpha. No public copy is present.

### References and inspection

Opened and inspected before generation:

1. `docs/art/shared/edge-1.png`, `edge-2.png`, `edge-3.png` (also composited on anthracite to inspect their alpha).
2. `docs/art/shared/PROMPTS.md` and `README.md`.
3. `docs/art/sunrise/sunrise-night-edge.png` (negative example: dense hanging stain boundary; since removed, see git history).
4. `docs/art/hero/hero-sky.png`.
5. `docs/art/making/making-plate.png`.
6. `docs/art/sunrise/sunrise-sky.png`.
7. `D:/repos/Solo Stack/branding/final-branding-assets/04-buttergelb-banner-nachtstudio-youtube-2560x1440.jpg`.

These were visual references reviewed in the session. No `referenced_image_paths` or `num_last_images_to_include` arguments were passed to the new-image generation calls. Thus this is a visual material match, not a claim of explicitly attached reference conditioning. `docs/art/cinema/cinema-landscape.png` was additionally inspected for the comparison composites.

Sources were generated in `~/.codex/generated_images/01a1a33d-bd8a-7862-966a-4172baef5440/`. Selected sources are copied into this directory as `_source-*.png`; original generated files remain untouched.

### wash-spread.png

Final generated source: `exec-2ea8c584-2d04-4ae1-afb7-e51b1a4be016.png`, preserved as `_source-wash-spread.png`.
Native 1254×1254; final 2048×2048 RGBA. Requested 2048 does not imply native generated 2048 detail.

Exact final generation prompt:

```text
Use case: stylized-concept. Paint an original production GRAYSCALE LUMINANCE RAMP to drive a watercolor CSS alpha-mask wipe. Highest available generation quality, square 2048 x 2048 requested. This is opaque grayscale data: WHITE means visible, BLACK means hidden, gray means partial coverage. Do NOT output transparency.
A real watercolor wash SOAKING INTO WET COTTON PAPER, viewed flat. White top gradually flooding downward into a black lower field; the grayscale image is a negative of dark pigment on white paper. The entire top 14% is uninterrupted pure white edge to edge, entire bottom 14% uninterrupted pure black. Between 14% and 86% height, paint a LONG CONTINUOUS soft tonal ramp with many intermediate gray values, never a cutout silhouette. Broad irregular lobes and bays at very different heights, the middle-opacity front wandering from around y=30% to y=70% across the width. Three or four unequally sized asymmetric advancing regions, connected by long gentle inlets. Feathering each local transition over 25%-40% of image height. Layered wet-in-wet dilution, soft cauliflower backruns, fine pigment granulation, delicate paper tooth, a few broad soft pigment islands slightly ahead and pale holes within the wash behind. Real flat pigment diffusion, no volumetric light/shadow. Large-scale shape first; pigment detail second. Intermediate gray coverage should decline progressively in horizontal bands from top to bottom.
Match the material character of the previously inspected solo-stack watercolor banner and painted plates: tactile fluid pigment settling into warm cotton paper, only interpreted as neutral grayscale mask values. Full-bleed across both side edges, roughly matching gray profile at left and right for horizontal tiling. No side padding or vignette. No drips, splatter dots, vertical streaks, stain blots, clouds, smoke, fog, landscape, mountains, torn-paper edge, outlines, frame, checkerboard, text, symbols, objects or color. Paint the wash itself, no paper border or photographed sheet.
CRITICAL COMPOSITION CORRECTION: The previous study's 50%-gray boundary only varied through 26% of the image height and its rounded lobes repeated too evenly. Make this second study much more asymmetric: at x=15% the medium-gray crossover rises to y=30%, at x=50% it descends to y=70%, at x=80% it rises to y=38%, and at BOTH side borders it is near y=48%. Use sweeping broad unequal bays with wet pigment backruns and soft partial islands, not repeating scallops. Preserve a wide feathery tonal fade at EACH x position. The middle gray crossover must truly wander through about 40% of total canvas height, while top14% and bottom14% remain solid. Slightly calmer fine texture, expansive dilution. Real pooling watercolor, not smoky wisps.
```

Quality note: expressive broad wet bays, layered backruns and retained granular paper texture. Local opacity grading expands the half-alpha front to 31.40%–69.48% of the height (38.09% total excursion), close to the requested ~40%. Small islands/holes are soft tonal openings, not crisp detached specks. This is the busiest mask; its wide dilute front is visible over sunrise and more restrained over the two dark plates.

### wash-dry.png

Final generated source: `exec-78565bf3-fd5d-4deb-ae17-c8098e7c5a40.png`, preserved as `_source-wash-dry.png`.
Native 1254×1254; final 2048×2048 RGBA.

Exact final generation prompt:

```text
Use case: stylized-concept. Original production GRAYSCALE LUMINANCE RAMP, requested 2048 x 2048 square, highest available generation quality. Opaque grayscale technical mask only: WHITE means visible, BLACK hidden, medium gray partial coverage. Do NOT output transparency.
Paint a PALE WATERCOLOR WASH DRYING AND RETREATING upward through cotton paper, as the photographic negative of a dilute dark wash on white paper. Entire top 14% PURE WHITE, full width; entire bottom 14% PURE BLACK. Between y=14% and 86%, a very long diffuse soft graded wash from white to black, many intermediate grays throughout. Broad uneven gently retreating bays, markedly different heights across the width, but all dissolved into a gradual ramp. A few FAINT NESTED TIDE LINES: quiet irregular near-concentric mineral deposits tracking broad rounded bays, partial interrupted arcs and overlapping dilution levels. These are slightly LIGHTER grayscale rims (higher alpha / more pigment), not dark outlines; low contrast against adjacent gray wash. Delicate granular sediment and paper tooth, some tiny broken dry-brush fibers only within the already soft lower frontier. Broad soft gradation above and below the subtle sediment lines. Avoid evenly spaced contour-map lines. Quiet, premium real watercolor drying on flat paper.
Match tactile watercolor granulation and tide-line material of the previously inspected solo-stack banner and sunrise sky, grayscale technical values only. Full-width wash touches both sides, left/right profiles should match for horizontal repeat. No side padding or vignette. STRICTLY NO DRIPS, NO SPLATTER DOTS, NO VERTICAL STREAKS, NO STAIN BLOTS. No smoke, clouds, foam, landscape, mountains, terrain, objects, scene, torn edge, text, border, frame or checkerboard. Not a hard boundary: averaged coverage must descend progressively through the entire middle 72% of the image.
```

Quality note: calm nested sediment/tide lines and granular dilution, distinct from the wet mask. The faint higher-opacity rims are clearest in the alpha preview; their visibility becomes subtle over a richly textured plate. Broken dry-brush fibers are restrained rather than a prominent bristled edge. No drips, isolated splatter dots, or vertical streaks. Its broad fade can briefly ghost objects already painted into the plates; object isolation belongs to integration, not the mask.

### feather-soft.png

Final generated source: `exec-4cf24e39-2fcf-4144-9f14-970f5b139134.png`, preserved as `_source-feather-soft.png`.
Native 2172×724; final 2560×512 RGBA, resampled to the requested strip aspect ratio.

Exact final generation prompt:

```text
Use case: stylized-concept. Original production GRAYSCALE LUMINANCE MASK for extremely calm watercolor plate feathering. Highest available generation quality. Very wide horizontal strip, requested 2560 x 512 (5:1); opaque grayscale, no transparency. White is visible and black is hidden. Entire TOP 20% is pure white edge to edge; entire BOTTOM 15% is pure black edge to edge. Middle 65% is a VERY SOFT LONG gradual falloff through many intermediate grays. Broad slow shallow undulations, a little cloudy watercolor dilution modulation, organic low-frequency pigment soak, almost as calm as a linear gradient. Two or three unequal very broad subdued soft variations, maximum around 8% image height; no busy texture, no fine detail, no hard contours, no outline, no strong cauliflower borders. Flat matte painted wash data, not a landscape or cloud illustration. Horizontally seamless matching left and right gray profiles, full-width coverage, no side padding or vignette. Material informed by the previously inspected solo-stack painted skies and banner; neutral grayscale values only. No drips, splatters, stains, streaks, smoke, stars, objects, text, color, frame, paper border or checkerboard. Soft diffusion and restraint are essential.
```

Quality note: intentionally almost calm enough to be a gradient, with slow shallow wandering and subdued watercolor modulation. No sharp contour or granular visual noise. It is suited to plate attachment, not the expressive full-height wipe. The 50%-alpha contour varies by about 8.79% of strip height.

### Rejected attempts and finishing revisions

First spread source `exec-757fca85-aa35-4c22-981a-22b068259a43.png` (saved as `_rejected-wash-spread-1.png`) was rejected as the production source: more evenly repeated lobes and only ~26% height variation in the unblurred middle-opacity crossing. It was regenerated with the explicit composition correction in the final prompt above.

Exact first prompt:

```text
Use case: stylized-concept. Paint an original production GRAYSCALE LUMINANCE RAMP to drive a watercolor CSS alpha-mask wipe. Highest available generation quality, square 2048 x 2048 requested. This is opaque grayscale data: WHITE means visible, BLACK means hidden, gray means partial coverage. Do NOT output transparency.
A real watercolor wash SOAKING INTO WET COTTON PAPER, viewed flat. White top gradually flooding downward into a black lower field; the grayscale image is a negative of dark pigment on white paper. The entire top 14% is uninterrupted pure white edge to edge, entire bottom 14% uninterrupted pure black. Between 14% and 86% height, paint a LONG CONTINUOUS soft tonal ramp with many intermediate gray values, never a cutout silhouette. Broad irregular lobes and bays at very different heights, the middle-opacity front wandering from around y=30% to y=70% across the width. Three or four unequally sized asymmetric advancing regions, connected by long gentle inlets. Feathering each local transition over 25%-40% of image height. Layered wet-in-wet dilution, soft cauliflower backruns, fine pigment granulation, delicate paper tooth, a few broad soft pigment islands slightly ahead and pale holes within the wash behind. Real flat pigment diffusion, no volumetric light/shadow. Large-scale shape first; pigment detail second. Intermediate gray coverage should decline progressively in horizontal bands from top to bottom.
Match the material character of the previously inspected solo-stack watercolor banner and painted plates: tactile fluid pigment settling into warm cotton paper, only interpreted as neutral grayscale mask values. Full-bleed across both side edges, roughly matching gray profile at left and right for horizontal tiling. No side padding or vignette. No drips, splatter dots, vertical streaks, stain blots, clouds, smoke, fog, landscape, mountains, torn-paper edge, outlines, frame, checkerboard, text, symbols, objects or color. Paint the wash itself, no paper border or photographed sheet.
```

The regenerated source also needed finishing to achieve the requested front excursion. An initial geometric column warp reached ~40% but was rejected on visual inspection because it stretched paper grain into directional fibers. Final processing uses smooth columnwise opacity grading instead: pigment coordinates stay intact. Intermediate defective exports from a grayscale-channel handling bug were detected by the band/contour checks and overwritten; none are delivered. Final decoded PNGs were independently checked, not merely assumed correct from the export buffers.

Dry and feather sources were accepted after tonal finishing; no regeneration was required. Their raw margins were not exact black/white, so raw generations are not deliverables.

### Export processing

Existing Node.js and the repository's Sharp 0.35.5 only. The shell process launcher failed before Python could be used; no new tooling was installed. Reproducible finishing: `_process-washes.mjs`; comparison generation: `_check-washes.mjs`. Import and call their exported `generate()` and `checks()` functions, respectively.

1. Convert to grayscale luminance; Lanczos3-resize to exact target dimensions. Feather receives a 3 px Gaussian low-pass at target resolution to remove fine noise. Normalize luminance by `clamp((L - 1) / 253)`.
2. Apply base gamma to opacity: spread 1.15, dry 2.05, feather 1.50. These shift the generated pale ramps toward a usable gradual middle range, not a binary threshold.
3. Cross-blend opposing outer 12% strips to their paired mean with a cubic smoothstep weight, strongest at the seam and zero at the interior end. Both final edge columns match exactly.
4. Spread only: locate the half-opacity front in a 22 px blurred analysis copy, periodically smooth the front profile with a Gaussian kernel of support 6% width, and map its low-frequency variation toward a 30%–70% height range. Sample the generated luminance at those desired heights to derive a smooth per-column gamma; smooth that gamma periodically with 2.5% width support. Apply it to original unwarped pigment pixels and reapply the seam blend. No procedural texture, noise, or replacement paint was added.
5. Smoothly attach to opaque/transparent margins using asymmetric cubic envelopes. The upper envelope spans top-fraction to top-fraction + 13% height; the lower spans 16% height before the transparent margin. Their transition widths wander gently via two periodic low-frequency terms (1.2% and 0.8% height) while the required solid boundaries remain fixed. Preserve the generated modulation inside the envelope.
6. Explicitly enforce the top/bottom 287 rows for both square ramps (at least 14%), and top 103 / bottom 77 rows for feather (at least 20% / 15%). Quantize once to 8-bit alpha, set **every RGB pixel to 255**, including fully transparent pixels.
7. Save lossless RGBA PNG with compression level 9. All left/right alpha differences are zero; RGB is constant white.
8. Independently decode the files and verify RGBA, every RGB value, entire margin bands, exact seam equality, and monotonically descending 20-band alpha means. Largest 5%-height mean-alpha drops are 31.15 / 33.47 / 35.11 respectively, not an abrupt 255-to-0 edge.

### Offset composites and numerical report

Each `_check-<name>-1/2/3.png` is 1280×1440 RGB with two 1280×720 panels: **top** hero sky over making plate, **bottom** cinema landscape over sunrise sky. Thus all three masks were checked on both plate pairs at all three offsets, 18 comparisons total. The row-mean half-alpha front is positioned at 30%, 50%, 70% of panel height. Square wash maps fill the panel for this static test; the feather retains its 5:1 proportion (1280×256) and translates vertically. Out-of-range samples extend the solid opaque top / transparent bottom, not repeat vertically. Comparisons use the source plates unchanged except fit-to-panel resampling; their moons, sun, stars, and objects are not mask content.

`_check-washes-contact.png` places masks in rows (spread, dry, feather), offsets in columns (30%, 50%, 70%), with both plate pairs in every cell. All nine composites were reviewed in the contact sheet, and each midpoint proof was inspected larger. No hard rectangular attachment boundary, white fringe, drips or stain-cutout silhouette was observed. Runtime CSS, moving stacked-mask behavior and browser performance are outside this art-only task and were not changed or tested.

Exact final sizes and all twenty 5%-height band means are in `_wash-validation.json` and `_wash-report.html`. Check dimensions/byte sizes are in `_check-washes-manifest.json`. Only the three unprefixed mask PNGs are production assets; sources, checks, scripts and reports are review/reproduction material.

### Spread revision 2: remove vertical curtains (2026-11-03)

The previously described spread export was rejected after viewing its alpha alone: narrow dark columns near x ≈ 5%, 25%, and 92% continued down from the bloom front into the transparent region. Plate composites concealed them. The original production PNG is preserved byte-for-byte as `_rejected-wash-spread-2.png`. This revision supersedes the spread quality claim, columnwise grading in export step 4, and spread measurements above; mist, dry, and feather artwork are unchanged.

**Cause and source inspection.** `_source-wash-spread.png` is 1254×1254 RGB without an alpha channel. Its grayscale luminance was inspected directly: broad rounded blooms, cauliflower backruns and paper grain were present, but the narrow vertical curtains were absent. No regeneration or new image-model call was needed; the original built-in-image_gen source and its prompt above are retained. The old processor sampled luminance at a target contour height to calculate one gamma exponent per column, then applied that exponent to every row. Local pigment irregularities therefore became full-height density changes. Its narrow smoothing support did not prevent the curtains. Disabling that grading while retaining seam blending and margin envelopes reduced the column high-pass range from 20.174826 to 4.622747, isolating the grading as the cause. The seam blend alone is not the source of these curtains. No vertical coordinate smear is present in the retained source or the replacement processor.

**Replacement finishing.** `_process-washes.mjs` now reinforces the existing blooms with a two-dimensional tonal field:

1. Keep the original luminance normalization, 1.15 base gamma and 12% seam blend.
2. Compute an isotropic Gaussian low-pass (sigma 80 px) of the seamed opacity. This is an analysis field only; do not blur or geometrically stretch the original pigment pixels.
3. Subtract each row's mean from that low-pass to isolate the broad lateral bloom variation at that height. Add this residual to the original opacity with gain 1, clamp to [0,1], and reapply the seam blend. The correction changes in both x and y, follows rounded source blooms, and fades with their two-dimensional extent. There is no column exponent or column-wide offset, and no synthetic replacement texture.
4. Retain the smooth margin envelopes and exact 287-row opaque/transparent bands. Export 2048×2048 RGBA, every RGB component 255 including transparent pixels, and quantize alpha once.
5. Independently decode the output with `_validate-wash-spread.mjs`. Verify every RGB pixel, both complete margin bands, exact opposite-column equality, monotonically declining 5%-height band means, and a column high-pass range below 5 alpha levels. Save decoded alpha as `_check-wash-spread-alpha.png` and the half-width-offset alpha as `_check-wash-spread-seam.png`.
6. Regenerate `_check-wash-spread-1.png`, `-2.png`, and `-3.png` with the unchanged comparison script and refresh its contact sheet/manifest. Inspect all three two-panel composites plus the alpha-only and offset-seam proofs. Updated measurements are in `_wash-spread-validation.json` and `_wash-validation.json`.

**Metric definition and result.** At 2048×2048, average alpha separately for every column over rows [409, 1638), corresponding to floor-based 20%–80% boundaries. Subtract a centered 101-pixel moving average of those column means, with periodic horizontal indexing because the mask repeats. Report max minus min of that residual in 0–255 alpha units. Before: **20.174826** (min −8.535677, max +11.639150). After: **4.638739** (min −2.239146, max +2.399592), a **77.01% reduction**, or a residual span of 1.82% of full opacity. The remaining small extrema follow local organic pigment variation; the former curtain-scale peaks are gone. This metric complements the alpha-only visual review; it does not prove the absence of every possible directional feature by itself.

Final half-alpha contour, measured after 22 px analysis blur: **29.6875%–69.2871%**, a **39.5996%** height excursion. RGB violations: 0. Opaque/transparent band violations: 0. Maximum left/right alpha difference: 0. Largest adjacent 5%-height band-mean drop is 40.49 alpha levels. The old file remains intact, and the source was not modified.

**Quality note.** The alpha-only review shows rounded, interlocking blooms and soft cauliflower backruns with a long granular fade. No narrow vertical streaks, drips or curtains are visible, including at the centered wrapping seam. The tonal correction makes the broad white bays more open and the fade somewhat denser than the rejected version; it preserves the source character rather than reproducing every old tone. Source detail remains native 1254 px resampled to 2048. The three static offsets look organic on both plate pairs, although already-painted moons/sun can still ghost during a crossfade. Actual scroll-driven CSS motion was not tested in this art-only task.

Reproduce from the repository root with existing Node/Sharp (no installs):

```js
await (await import('./docs/art/transitions/_process-washes.mjs')).generate(['wash-spread']);
await (await import('./docs/art/transitions/_check-washes.mjs')).checks();
await (await import('./docs/art/transitions/_validate-wash-spread.mjs')).validate();
```
