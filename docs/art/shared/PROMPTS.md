# shared generation prompts

Generated on 2026-11-01 with the built-in image_gen tool and reference images. The tool exposes no separate model, quality, or exact-size argument; prompts requested highest available quality. No API/CLI fallback or new dependencies were used. Original production layers, no text or mascot.

All references were opened and inspected. Catalog numbers below are one-based; each prompt describes the order passed to its call.

1. `docs/mockups/round-2/05-night-shift-radio/02-night-shift-bonsai-hover.png`
2. `docs/mockups/round-2/06-video-sunrise/05-sunrise-footer-desktop.png`
3. `docs/mockups/round-2/06-video-sunrise/06-sunrise-footer-mobile.png`
4. `docs/mockups/round-2/06-video-sunrise/07-night-to-sunrise-mid-scroll.png`
5. `docs/mockups/round-2/07-full-page/01-painted-night-lightbox-desktop.png`
6. `D:/repos/Solo Stack/branding/final-branding-assets/04-buttergelb-banner-nachtstudio-youtube-2560x1440.jpg`

## paper-grain.png

References: catalog 1, catalog 6.

Final generated source: `exec-21c893d2-b680-49dc-ae00-c4a71b081bf9.png`.

```text
Use case: stylized-concept. Production MATERIAL TEXTURE only. Generate a 512x512 square SEAMLESSLY TILING subtle watercolor paper grain/noise texture, grayscale neutral middle gray, opaque. References show the watercolor paper surface to emulate ONLY, not their painted subjects or colors: 1 approved watercolor style, 2 original brand banner. Small fine natural cotton fibers and granular paper tooth, evenly distributed, gentle fine mottling. Flat diffuse illumination; absolutely no directional light, shadows, vignette, center feature, folds, scratches, large pigment blobs or illustrated objects. Low contrast neutral grayscale centered around RGB 128, fine variations roughly 112-144. Perfectly seamless on all four boundaries, periodic tile ready to repeat horizontally and vertically over an entire website at low opacity. No text, shapes, stars, symbols, gradients, borders, logos, mascot, humans or scenery. Highest available quality. The texture is to be downsampled and losslessly optimized into <=30kB, so keep tonal range subtle and not high-entropy speckle.
```

## edge-1.png

References: catalog 4, catalog 6.

Final generated source: `exec-bb79972c-90f0-41c8-8160-76309fab0a4d.png`.

```text
Production CSS ALPHA MASK, one isolated watercolor lower edge, requested very wide 2560x400 strip. Highest quality. References 1 and 2 demonstrate ragged pigment edges ONLY; do not depict their scenery or subjects. Visible region is solid WHITE across the ENTIRE TOP of the image and the upper 40%. Its lower boundary wanders gently between y=40% and y=75%: broad soft watercolor cauliflower blooms with fine feathered wet-in-wet bleeding, irregular tiny pigment islands and delicate partly transparent tendrils. Everything below the edge must be truly TRANSPARENT, bottom 15% completely empty alpha. Opaque white upper area, soft graduated alpha in the bleeding boundary, fully transparent lower area. White is only technical mask data (not visible site artwork). Keep all RGB white in visible areas, opacity carries the watercolor edge. Horizontal edge-to-edge coverage, no left/right padding or frame. No gray backdrop, no checkerboard in pixels, no shadows, no color, no text, no drawings, no stars, no people, no mascot. Natural original watercolor edge; edge character 1 is broad gentle wet blooms.
```

## edge-2.png

References: catalog 4, catalog 6.

Final generated source: `exec-99d6425e-a1ec-4700-9414-3aa626e20996.png`.

```text
Technical black/white LUMINANCE mask, panoramic 2560x400 ratio strip. Entire TOP HALF is PURE WHITE, entire BOTTOM QUARTER is PURE BLACK. There is only ONE boundary, between white top and black bottom, around y=55%. At that boundary create original very fine ragged DRY BRUSH watercolor pigment texture: short sharp broken fibers, speckled tiny black bites into white and white flecks into black, almost horizontal but with irregular 3%-10% high torn micro-ridges, NO large rounded lobes, NO bubbles or foam. Gray is allowed only for softly bleeding fine edges. No gradient anywhere else. The WHITE region must touch EVERY pixel across the top border uninterrupted; BLACK touches the whole bottom border uninterrupted. Think grayscale Photoshop mask for a paper section edge, not a painting of a strip floating on background. The references illustrate paper material only, do not copy compositions. No scenery, text, borders, frame, stars, figures, mascot, icons or checkerboard. High quality.
```

Earlier attempt, replaced after inspection (unwanted gap at top attachment boundary):

References: catalog 4, catalog 6.

```text
Production CSS ALPHA MASK. One original wide watercolor/dry ink lower edge, target 2560x400 horizontal strip. Highest quality. References illustrate material of watercolor section boundaries only. Visible region WHITE with real alpha, upper 40% solid opaque white touching top and both side borders. Boundary between 42% and 72% height has a broken DRY-BRUSH character: irregular short angular bites, fibrous little serrations, small granular holes near the frontier, scattered tiny torn pigment flecks, fine feathery opacity. Mostly horizontal, no big symmetric waves. Bottom 15% entirely transparent. The ragged boundary must read as brush on rough watercolor paper, never digitally smooth. White is technical alpha mask payload: no color necessary, all opacity variation in alpha channel. No gray background, no painted checkerboard, no shadow, no frame or side margins, no object, mascot, sky, stars, text, letters or logos. This is edge variant 2, crisp broken dry-brush contrasted with soft bleeding fringe, not broad rounded lobes.
```

## edge-3.png

References: catalog 4, catalog 6.

Final generated source: `exec-d564a63f-e12b-46aa-be0c-229813bae255.png`.

```text
Use case: stylized-concept. TECHNICAL LUMINANCE MASK for CSS section boundary. Target 2560x400 panoramic strip. Only grayscale, white is visible region and black is hidden. The entire top boundary and upper 25% must be pure WHITE. Entire bottom 12% pure BLACK. Between them an expressive sloping watercolor bleed boundary descends from about 35% height on LEFT to 75% height on RIGHT, uneven and hand-painted: flowing asymmetrical long ink fingers, soft branching capillary feathering, ragged wet pigment pools, tiny specks, organic variation. White upper field, black lower field; gray only in translucent watercolor fringe. ONE continuous diagonal transition, no isolated floating strip. Do not create triangular straight diagonal or a digital gradient. References are for pigment edge texture only, not scenes. No shadows, frame, side padding, objects, stars, scenery, people, mascot, text, letters or watermark. Highest available quality, original art. Edge variant 3 is flowing diagonal ink bleed, distinct from broad rounded blooms and horizontal fine dry brush.
```

## star-1.png

References: catalog 1, catalog 6.

Final generated source: `exec-d71ad1d1-f92b-482f-ab7e-95325a948040.png`.

```text
Single isolated small painted STAR sprite production PNG, square intended to be downsampled to 128x128. Transparent background. Original warm cream #FBF3DD and butter #FCD772 watercolor star: a delicate slightly irregular four-point twinkle, longer vertical tips, small opaque creamy center with softly feathered pigment edges and faint warm halo. Visible paper granulation within the brush marks. Shape centered occupying 55% of canvas width and 65% height, generous transparent padding all sides. Reference 1 hand-painted material and tiny night stars; reference 2 original brand warmth. High quality, understated cozy illustrated night, no photoreal lens flare, no sharp vector symmetry, no hard outline, no black/white extremes, no scene, no text, no logo, no mascot, no frame, no painted checkerboard. Exactly one star. Variant 1: fine tall four-point twinkle.
```

## star-2.png

References: catalog 1, catalog 6.

Final generated source: `exec-93eb2791-5d51-4bdf-ad0d-e6bc32c75c8d.png`.

```text
Production tiny painted star sprite, square transparent PNG, final use 96x96 pixels. One irregular ROUND distant star, a small warm cream #FBF3DD opaque center dab surrounded by delicate butter #FCD772 watercolor bloom, slightly uneven handmade circular contour, minimal diffuse warm halo. NO pointed rays: this variant is a small circular pigment speck. Centered, occupies 35% of square width with ample transparent margins. Tactile paper grain inside paint, fine watery soft alpha edges. Reference 1 watercolor material and scattered little stars, reference 2 brand palette. Highest available quality original art, no scene, no black/white extremes, no background, checkerboard, text, logos, symbols, mascot or other objects. Just one tiny painted warm star dot on true transparency. Variant 2.
```

## star-3.png

References: catalog 1, catalog 6.

Final generated source: `exec-724aa1d4-fe66-448c-811d-2fb3822b6a00.png`.

```text
Original painted star sprite for an illustrated night sky. Single small asymmetric FIVE-POINT watercolor star with softly rounded tips, tilted slightly clockwise, tiny friendly imperfect brush shape. Cream #FBF3DD center, pale butter #FCD772 pigmentation, very subtle ochre at one edge. No smile or face. Highest available quality transparent square PNG to downsample to 96x96; star occupies about half the canvas with ample clear margin. Real watercolor granulation, soft partly transparent bleeding edge, understated light. References 1 material style lock and 2 banner palette only. No hard vector outline, no photoreal lens flare, no neon, no pure white/black, no backdrop or checkerboard, no scenery or other stars, no text, mascot, symbols or logos. Exactly one isolated small five-point star. Variant 3.
```

## star-4.png

References: catalog 1, catalog 6.

Final generated source: `exec-e378e802-4058-49ed-9532-458791361c09.png`.

```text
Production isolated tiny watercolor STAR sprite, variant 4. One delicate asymmetrical EIGHT-RAY painted glint: small warm cream center, four thin main rays and four very short diagonal rays, each a light dry-brush stroke with soft butter #FCD772 edges, no hard vector geometry. Wider than tall, slightly tilted; fine paper grain, quiet warm light, sparse translucent pigment feathering. Centered on truly transparent square canvas, shape about 50% width, ample clear padding. Intended final 128x128 PNG then displayed around 8-16 CSS pixels on anthracite. Highest available quality original illustration. References 1 approved watercolor medium, 2 brand warmth. No scene, stars cluster, text, iconography, mascot, frame, backdrop, checkerboard, photographic flare, neon or pure white/black. Just one small soft cream/butter eight-ray brush glint.
```

## shooting-star.png

References: catalog 1, catalog 6.

Final generated source: `exec-fcafd9ad-fd49-472e-96b3-a2163edd75e5.png`.

```text
One isolated SHOOTING STAR streak, production transparent PNG intended final dimensions 800x80. Very wide horizontal 10:1 strip composition, no scene. A tiny bright warm cream #FBF3DD painted head on the RIGHT at x=92%, y=50%, and a long fine butter #FCD772 watercolor tail trailing to LEFT and fading smoothly into transparent alpha near x=5%. Head is one compact softly luminous brush dab with very short pointed rays; trail thin and almost straight, slightly irregular hand-painted ink-and-watercolor stroke, subtle ochre pigment granulation, tapered wispy edges. Maximum painted height about 35% of strip near head, tail much thinner, generous clear padding above/below and both ends. References for watercolor medium and brand color only. Highest quality, original art, no photographic flare, fireworks, comet body, planets, clouds, backgrounds, checkerboard, text, mascot, characters, icons, logos or extra stars. No pure white/black. Genuine transparency around entire streak.
```

## torn-paper-edge.png

References: catalog 1, catalog 6.

Final generated source: `exec-594f61e1-3b83-4b86-9291-0257c3341b1e.png`.

```text
One production TORN CREAM PAPER EDGE strip, transparent PNG requested 2560x160, very wide 16:1. Painted watercolor paper material, original art, highest quality. Warm cream #FBF3DD handmade cotton paper with subtle fine fibers and tiny butter #FCD772/ochre #E2A93B pigmentation, no pure white. Paper occupies upper half of strip and extends fully to left and right edges and entire top edge, then an organically hand-torn ragged lower edge with little fibrous tabs and rough natural paper tooth, torn fibers subtly translucent. Fully transparent below it, no dark cast shadow or colored background, no artificial checkerboard. The edge is mostly horizontal, modest unevenness, no large wavy scallops. This is a layer to attach below a cream paper element, not an entire sheet or frame. References for material only: approved watercolor style and banner paper. No objects, sky, scenery, mascot, humans, stars, text, letters, logos or decorative border. Thin strip, flat view, warm watercolor rendering rather than photoreal.
```

## Export processing

Existing Pillow and Python standard library only; no dependency installation. Native sizes are recorded in README.md.

- Masks: edge-1 retains generated alpha. Edge-2 and edge-3 were generated as black/white luminance sources; luminance was converted to alpha. Lanczos resize to 2560×400, values <5 become 0 and >248 become 255. Top 50 rows opaque, last 12 transparent; RGB is white throughout. Delivery files are actual alpha masks.
- Stars: Lanczos downsample full native square to 128×128 or 96×96. Preserve graded alpha; inspect on anthracite at full size and at 16 CSS pixels.
- Shooting star: crop native (0, 250, 2103, 490), then resize to 800×80.
- Torn paper: crop native (0, 235, 1983, 415), then resize to 2560×160, retaining the attachment band and entire torn silhouette.
- Cutout alpha below 3/255 becomes zero. Exact visible pure black/white becomes #18191B/#FBF3DD; technical masks are exempt.
- Grain: grayscale, resize to 256×256, subtract Gaussian blur (radius 12), scale residual by 1.3 and recenter at 128. Blend each axis with its half-tile offset using sin²(pi × coordinate / 256) weights, hiding the original seam. Correct opposing boundary samples to their mean with a 12-pixel smoothstep falloff. Quantize to even grayscale values in 112–144. Opposing edge pixels match exactly; a 3×3 visual repetition has no seam.
- Optimized PNG, compression level 9. Grain is neutral one-channel grayscale, 22,141 bytes, under 30,000 bytes.

Verified dimensions, real alpha, all-white mask RGB, opaque mask tops, transparent mask bottoms, grain byte budget and exact boundary equality. No green-screen fallback needed. Rejected attempts and temporary QA proofs are not committed.
