# World Tree 404 production prompts

Generated 2026-11-01 with the built-in `image_gen.imagegen` tool. Highest available quality was requested in every prompt; the tool exposes no separate model or quality selector. No CLI/API fallback was used. These are original production raster layers, with no generated visitor copy. Only the five requested PNG masters, five WebP exports, and this document were created in the repository.

## Reference inputs

All seven references were opened before generation:

1. `docs/art/mascot/mascot-model-sheet-v2.png` — strict character identity and proportions.
2. `docs/art/mascot/mascot-404-lost.png` — mascot linework, clothing, and materials.
3. `docs/art/mascot/mascot-cinema-sitting.png` — rear-three-quarter mascot identity and paint treatment.
4. `docs/art/sunrise/sunrise-sky.png` — warm pigment, sky and cloud texture.
5. `docs/art/hero/hero-sky.png` — dark watercolor wash and sparse stars.
6. `~/.t3/userdata/attachments/a3c6430c-d895-4cda-bca6-99ebe6df63cf-59b5de79-1cec-4051-96b4-e4a279f488e8.png` — mood only: two rear-view figures above clouds. Inspected; not passed to generation.
7. `~/.t3/userdata/attachments/a3c6430c-d895-4cda-bca6-99ebe6df63cf-42c63f78-b039-4b37-914e-e068ccb9d472.png` — structural idea only: slender trunk and spaced canopy tiers.

The anime screenshots were inspiration only; no frame, character, costume, lettering, or UI was copied. The standing mascot was generated first; its approved backpack and identity were used for the climbing pose. The tree was also an input for the climbing bark.

## tree-sky

Inputs, in order:

1. `D:/repos/solo-stack-web/docs/art/sunrise/sunrise-sky.png`.
2. `D:/repos/solo-stack-web/docs/art/hero/hero-sky.png`.

Transparent background: false.

Generated source: `~/.codex/generated_images/01a1981a-5ca1-7631-b173-cd9ba6845b29/exec-4d101864-495f-4008-8e81-630aa3934c22.png`.

```text
Use case: illustration-story / style-transfer. Production painted background plate for solo-stack.dev. Use the highest available image-generation quality and finest coherent watercolor detail. Output landscape 2560x1440, 16:9, fully opaque, edge to edge. Reference image 1 supplies warm granulated watercolor clouds and pigment-paper texture; image 2 supplies the dark night wash and sparse tiny star treatment. Make an ORIGINAL new sky composition in this same painted family, no copying the reference layout. Scene: pre-dawn sky viewed from an impossibly high treetop altitude above an endless cloud sea. Clear horizontal horizon precisely around y=62% of canvas. Upper 62% is mostly open deep indigo/blue sky, fading into night anthracite #18191B at the very top, with only a few faint tiny natural star specks. Moving down, indigo washes warm softly into muted ochre #E2A93B and butter #FCD772 at the horizon. The sun is JUST ABOUT to rise: sun disk still concealed below clouds, a soft concentrated luminous butter/cream #FBF3DD glow at x=62%, y=62%, subtle lateral light through mist. Lower 38% is an endless sea of softly layered, rounded cloud tops viewed from above, blue-indigo shadow valleys and warm butter/ochre upper rims, painterly aerial depth; the distant clouds become tiny, a few softly billowing forms near bottom. Visible watercolor pigment granulation, paper tooth, soft wet edges, delicate thin ink accents in cloud shadow seams, calm quiet dawn. Keep the glow centered x=62% so a center 9:16 portrait crop retains the sunrise; visual interest must survive the center crop. No tree, trunk, foliage, people, silhouette, land, mountain, buildings, foreground objects, moon, lettering, numbers, symbols, UI, logos, border, watermark or signature. No pure black or pure white, no photorealism, no vector gradient, no anime cel shading. Full-bleed opaque painting.
```

## tree

Inputs, in order:

1. `D:/repos/solo-stack-web/docs/art/hero/hero-sky.png`.
2. `D:/repos/solo-stack-web/docs/art/mascot/mascot-model-sheet-v2.png`.
3. `~/.t3/userdata/attachments/a3c6430c-d895-4cda-bca6-99ebe6df63cf-42c63f78-b039-4b37-914e-e068ccb9d472.png`.

Transparent background: true.

Generated source: `~/.codex/generated_images/01a1981a-5ca1-7631-b173-cd9ba6845b29/exec-4455a369-5a66-409c-ad12-684e4e49869d.png`.

```text
Use case: illustration-story. Production isolated World Tree layer for CSS compositing, highest available quality. Very tall portrait canvas 1200x3000, ratio 2:5. GENUINE alpha-transparent background. Reference 1 supplies watercolor granulation and dark pigment edges; reference 2 supplies thin ink contours and warm painted materials, NOT its characters or paper backdrop; reference 3 is ONLY an architectural/mood idea of an impossibly tall slim trunk with spaced horizontal foliage tiers, do not copy its frame, characters, sky or composition. Paint ONE original extremely tall slender ancient tree, slightly wavering central warm umber/brown trunk, thin flowing ink bark grooves, clear climbable long trunk intervals. FIVE widely spaced FLAT tiered canopy platforms: top at y=10%, other tiers roughly y=29%,49%,69%,87%. Platforms gradually wider downward: top spans x=35–65%, second x=27–72%, third x=20–80%, fourth x=12–89%, fifth x=5–95%. Tree is monumental in height but not thick or squat. Trunk follows roughly x=50%, slightly wavering x=47–53%, width only 5–7% of canvas, exits through the BOTTOM EDGE, no visible roots, pot, ground or stump termination. CRITICAL topmost canopy has a clearly FLAT continuous horizontal upper standing surface at y=10%, across x=36–64%, broad enough to place TWO small figures later. No central leader, twig, spike or foliage bump protrudes above that flat top. No people in this image. Low flat organic layered foliage slabs with thin irregular leaf edges and branch supports underneath; muted deep olive/teal greens, anthracite #18191B / ink #0E0F10 shadow accents; sunrise from RIGHT gives restrained strong butter #FCD772 / ochre #E2A93B rim light on right edges and flat tops, cream #FBF3DD small highlights. Match hand-painted watercolor on paper with visible pigment granulation INSIDE the tree and soft watercolor edges, thin ink contours, not glossy, not photographic, not flat vector. Entire tree remains within left/right edges. EVERYTHING outside the tree is fully alpha transparent, including between tiers. No clouds, sky, paper rectangle, floor, cast shadow, halo, checkerboard, figures, text, glyphs, logos, symbols, watermark or signature. No pure black or pure white.
```

## wanderer — first lighting pass (superseded)

Inputs, in order:

1. `D:/repos/solo-stack-web/docs/art/mascot/mascot-cinema-sitting.png`.
2. `D:/repos/solo-stack-web/docs/art/mascot/mascot-model-sheet-v2.png`.

Transparent background: true.

Generated source: `~/.codex/generated_images/01a1981a-5ca1-7631-b173-cd9ba6845b29/exec-92072c07-dc40-4dd2-9b4d-c9f6f6b79898.png`.

```text
Use case: illustration-story. Production transparent full-body wanderer layer, highest available quality, portrait approximately 800x1400. GENUINE alpha transparency. References supply ONLY watercolor/ink rendering and pigment quality, NOT character proportions or identity. Paint an ORIGINAL tall rugged adult wanderer seen strictly FROM BEHIND, standing relaxed with both hands in his trouser pockets, head looking ahead toward sunrise. Natural adult proportions, about seven heads tall, broad shoulders, lean sturdy build, NOT chibi. Untidy medium-short spiky ink-dark hair sticks above a simple unmarked weathered cloth head wrap/bandana in muted grey-ochre; no emblem. Sleeveless light cream/grey rugged top, loose dark charcoal trousers with a muted ochre sash at waist, worn understated dark shoes. A light weathered cream cloak fastened over shoulders drapes off one shoulder and flows to the LEFT in a breeze, revealing the back of the sleeveless shirt and both relaxed arms; asymmetrical original garment shapes, no resemblance to a specific costume. Warm sunrise strongly backlights him from RIGHT: mostly dark painted silhouette with clear thin butter #FCD772 / ochre #E2A93B rim light along right head, shoulder, arm, cape edge and trouser/shoe edges. Dim cream fabric highlights, no pure white. No visible face or frontal eyes, mysterious calm presence. Entire full body and flowing cape fit the canvas. Shoes stand on the same horizontal baseline at y=98%, with only 2% alpha padding under soles. Hand-painted watercolor and fine ink contours on paper; visible granulation within fabric and skin, soft edges, restrained detail in anthracite #18191B / ink #0E0F10 shadow, no pure black, no photorealism, no cel shading, no glossy digital look. Everything outside the person including between legs is true alpha transparency. No ground, platform, tree, sky, clouds, paper rectangle, checkerboard, cast shadow, sun, halo or background glow. No text, letters, glyphs, symbols, logos, headband emblem, UI, watermark or signature. This is an original wanderer, do not draw an existing anime character.
```

## wanderer — final lighting correction

Inputs, in order:

1. `~/.codex/generated_images/01a1981a-5ca1-7631-b173-cd9ba6845b29/exec-92072c07-dc40-4dd2-9b4d-c9f6f6b79898.png`.

Transparent background: true.

Generated source: `~/.codex/generated_images/01a1981a-5ca1-7631-b173-cd9ba6845b29/exec-3d0f4bd2-96b8-41bd-91fc-0a437cc02af2.png`.

```text
Use case: lighting-weather / identity-preserve. Edit the supplied transparent wanderer only. Highest available quality. Keep exactly his original shape, pose, adult proportions, hair, unmarked cloth headwrap, original cream cape flowing LEFT, sleeveless light top, ochre sash, hands in pockets, dark trousers and shoes, rear view, full-body framing and original aspect ratio. Change ONLY the lighting: this is PRE-DAWN seen from the shadow side, so the back-facing person must read mostly as a DARK, MYSTERIOUS painted silhouette. Reduce the broad fill light on cape, shirt, arms and hair drastically: shadow-side cream cloth is now dim desaturated blue-grey/anthracite with readable watercolor fold detail, skin muted dark umber, dark hair and trousers stay dark. Preserve a strong thin butter #FCD772 / ochre #E2A93B sunrise rim only on RIGHT-facing silhouette edges, and a few narrow backlit cape edges. Keep subtle cream #FBF3DD highlight only at sun-facing tips, not broad illuminated fabric. Preserve fine watercolor pigment granulation and ink contours. No face visible, no pure black or pure white. Maintain genuine alpha transparency outside the exact person, no backdrop, cloud, ground, halo or shadow. No text, symbols, logos, glyphs, UI, signature or watermark. The only change is convincing low-key dawn backlighting, not a different design.
```

## mascot-top

Inputs, in order:

1. `D:/repos/solo-stack-web/docs/art/mascot/mascot-model-sheet-v2.png`.
2. `D:/repos/solo-stack-web/docs/art/mascot/mascot-cinema-sitting.png`.
3. `D:/repos/solo-stack-web/docs/art/mascot/mascot-404-lost.png`.

Transparent background: true.

Generated source: `~/.codex/generated_images/01a1981a-5ca1-7631-b173-cd9ba6845b29/exec-ddd1397b-1172-4af6-a05c-6f227e8fdcfd.png`.

```text
Use case: identity-preserve / illustration-story. Create a new production mascot pose, highest available image quality, 800x1000 portrait, genuine alpha-transparent background. Image 1 is the STRICT character model sheet: preserve the young adult male chibi's exact compact proportions, recognizable short spiky BROWN hair with close-trimmed sides and tapered nape, head shape, ears, warm skin and short beard stubble. Image 2 supplies rear-three-quarter identity and painted style; image 3 supplies clothes, shoes and detail. Paint only ONE complete standing full-body mascot viewed from BEHIND, facing away toward a sunrise slightly to his right. Keep the same model-sheet proportions (approximately three heads tall), black/anthracite short-sleeve T-shirt, dark grey trousers, cream low-top sneakers. Add a SMALL simple butter-yellow #FCD772 backpack with warm ochre stitching/shadows, two shoulder straps and a plain front pocket, entirely unbranded, no symbol. One hand is raised to his forehead to shade his eyes, elbow naturally bent out to the right; other arm relaxed down. Head angles a tiny bit up/right but remains predominantly back view, only a hint of right cheek/ear/stubble, no frontal eye contact. Both feet planted, level at y=98%, approximately 2% transparent padding below soles, complete shoes visible. Body relaxed, quiet wonder and arrival. Sunrise backlighting from the RIGHT: warm butter/ochre rim on right hair, right shoulder, hand, backpack edge and sneakers; dark painted shadows retain watercolor detail. Same hand-painted watercolor + thin ink contours as the mascot references: visible fine pigment granulation, paper tooth WITHIN painted shapes, soft watercolor edges, no paper background. Match the face/hair/body identity exactly, do not turn him into an anime child or give new outfit. Transparent outside figure and between limbs; no ground, tree, canopy, cloud, halo, glow backdrop, cast shadow, checkerboard, rectangle or pedestal. Palette butter #FCD772, ochre #E2A93B, cream #FBF3DD, night #18191B, ink #0E0F10; no pure black or white. NO text, lettering, numbers, symbols, logos, labels, UI, watermark or signature.
```

## mascot-climb — first pass

Inputs, in order:

1. `D:/repos/solo-stack-web/docs/art/mascot/mascot-model-sheet-v2.png`.
2. `~/.codex/generated_images/01a1981a-5ca1-7631-b173-cd9ba6845b29/exec-ddd1397b-1172-4af6-a05c-6f227e8fdcfd.png`.
3. `~/.codex/generated_images/01a1981a-5ca1-7631-b173-cd9ba6845b29/exec-4455a369-5a66-409c-ad12-684e4e49869d.png`.
4. `D:/repos/solo-stack-web/docs/art/mascot/mascot-cinema-sitting.png`.

Transparent background: true.

Generated source: `~/.codex/generated_images/01a1981a-5ca1-7631-b173-cd9ba6845b29/exec-4202e82d-7d5e-40b0-8063-3c54bdbdae55.png`.

```text
Use case: identity-preserve / illustration-story. Highest available quality production animation layer for a painted website. Portrait 800x1000, genuine alpha transparency. Reference image 1 is the STRICT mascot character model sheet. Reference 2 is his approved standing rear-view pose and the exact butter-yellow backpack design; reference 3 is the matching World Tree bark/lighting; reference 4 is his rear-three-quarter identity and fine watercolor/ink style. Create ONE new full-body CLIMBING pose of the same chibi young adult man: exact same brown spiky short hair, tapered nape, ears, compact model-sheet proportions, short beard stubble, anthracite short-sleeve T-shirt, dark grey trousers and cream low-top sneakers. Same small butter-yellow backpack, plain rounded pocket, ochre shadows, two shoulder straps, absolutely unbranded. Seen from behind/three-quarter, he grips and HUGS a single thin vertical piece of tree trunk with BOTH arms and both hands. Trunk centered at x=50%, only about 14% canvas width, visible above his head and below his legs. His torso stays close against trunk, left knee lifted high with left sneaker pressing against left side of bark, right leg extends downward with right sneaker braced against right side. Anatomically coherent two hands, two arms, two legs. His head tips UP toward the summit, mostly back of head with hint of right profile/stubble, no viewer eye contact. Match mascot scale to reference 2: head about 27% of canvas height and standing-equivalent body about 90%; a bent climbing pose is naturally shorter, do not enlarge the head to fill the frame. Match warm brown/ochre bark, fine vertical ink grooves and warm right rim light from reference 3. Only the short straight trunk segment he grips is present: it FADEs softly into ALPHA at top 10% and bottom 10%, with no hard rectangular cut, roots or branches. Pale cream/butter #FCD772 and ochre #E2A93B sunrise light from RIGHT, dark anthracite #18191B / ink #0E0F10 painted shadows, fine visible pigment granulation, paper tooth WITHIN shapes, soft watercolor edges, thin hand-drawn ink lines. Keep face, hair, outfit and pack on-model. Everything outside mascot and narrow fading trunk is truly alpha-transparent, including between limbs. No leaves, canopy, ground, sky, clouds, backdrop glow, cast shadow, paper rectangle, checkerboard, text, numbers, glyphs, symbols, logo, UI, watermark or signature. No pure black or white, no cel-shading.
```

## mascot-climb — final alpha-fade correction

Inputs, in order:

1. `~/.codex/generated_images/01a1981a-5ca1-7631-b173-cd9ba6845b29/exec-4202e82d-7d5e-40b0-8063-3c54bdbdae55.png`.

Transparent background: true.

Generated source: `~/.codex/generated_images/01a1981a-5ca1-7631-b173-cd9ba6845b29/exec-ca79a84a-f4e3-4f91-b861-c0840a75bb8f.png`.

```text
Use case: precise-object-edit. Edit ONLY the exposed ends of the narrow tree trunk in this production transparent PNG. Highest available quality. Preserve the mascot pixel placement, pose, scale, exact brown hair, stubble, shirt, trousers, cream shoes, yellow backpack, both gripping hands and all body anatomy unchanged. Preserve the bark and right-hand warm rim light. At the TOP, make the trunk smoothly fade to fully transparent alpha across the topmost 8% of the canvas, with alpha ZERO at the top edge. At the BOTTOM, smoothly fade ONLY the trunk to fully transparent alpha across the bottommost 10% of the canvas, ending in alpha ZERO at the bottom edge. Do not fade the mascot, his hair, hands or shoes. The soft fades must be real partial alpha, not beige paint or a blurred solid-color backdrop. No hard rectangular cutoff on either trunk end. Keep exactly the same 800:1000 aspect ratio, entire original framing, and genuine transparency everywhere outside character and trunk. No added objects, text, letters, symbols, paper, shadow, background, watermark or signature. This is solely an alpha-edge correction, keep the successful painted climbing character identical.
```

## Selection and normalization

The first wanderer had excessive fill light and was rejected; the final edit makes his back and cape dark blue-grey while retaining the warm right rim. The initial climbing trunk retained weak alpha at the canvas edges; the final edit introduced smooth alpha fades at both ends without changing the pose. Seven generation calls total. Discarded candidates remain only in the generator's output directory.

These PNG masters are normalized exports, not native full-resolution generations. Sharp was run from the repository root using the installed dependency; no package installation or source-code edit was needed. PNG output is lossless with compression level 9, using Lanczos3 for resizing.

On transparent sources, alpha values 0–8/255 were cleared to zero to remove negligible generator haze and permit tight transparent-margin trimming. Higher alpha values and soft painted boundaries were preserved. Pixels outside the cutouts are genuinely transparent. No checkerboard or paper rectangle was added.

- `tree-sky`: {"native":[1672,941],"resize":[2560,1440]}.
- `tree`: {"native":[793,1983],"cleanAlphaThreshold":8,"sourceBounds":{"left":14,"top":111,"width":772,"height":1872},"placement":{"left":43,"top":300,"width":1113,"height":2700}}.
- `wanderer`: {"native":[948,1659],"cleanAlphaThreshold":8,"sourceBounds":{"left":11,"top":7,"width":934,"height":1634},"placement":{"left":11,"top":12,"width":777,"height":1360,"baseline":1372}}.
- `mascot-climb`: {"native":[1122,1402],"cleanAlphaThreshold":8,"sourceBounds":{"left":284,"top":3,"width":553,"height":1374},"placement":{"shiftX":-67,"resize":[800,1000],"scale":0.7132667617689016}}.
- `mascot-top`: {"native":[1122,1402],"cleanAlphaThreshold":8,"sourceBounds":{"left":308,"top":31,"width":584,"height":1340},"placement":{"left":191,"top":24,"width":417,"height":956,"baseline":980,"scale":0.7132667617689016}}.

The tree's visible 1113×2700 drawing is placed at (43,300) on its 1200×3000 master, retaining the 10% top margin and cutting the trunk at the bottom canvas edge. The WebP removes this registration padding, so its normalized summit y differs from the master.

Both mascot masters use the same native-to-master scale, 1000/1402 = 0.713266762. The standing pose is centered and has its sole baseline at y=980/1000. The climbing pose is translated 67 master pixels left to center the gripped trunk approximately on x=400; no body pixels are clipped. The wanderer has a sole baseline at y=1372/1400. The remaining roughly 2% at the bottom of both standing figures is intentional alpha padding.

## Web exports

All WebPs use Sharp effort 6 and smartSubsample. Alpha quality is 100 except for the tree, which uses 80. Fully transparent margins are trimmed; the standing figures retain their original bottom baseline padding. The sky required quality 68 to remain below 250,000 bytes with its dense pigment texture. The tree uses quality 78 at 1700 pixels high, within the requested 2000-pixel maximum, to remain below 220,000 bytes. Larger 1800/1900-pixel tree candidates exceeded the target. A transient Windows file-replacement lock was resolved by overwriting the same output in place; no alternate repository file was created.

- `src/lib/errors/assets/error-tree-sky.webp`: 2560×1440, 244,540 bytes; quality 68, alpha quality 100. Master crop `[left,top,width,height]`: none.
- `src/lib/errors/assets/error-tree.webp`: 701×1700, 212,400 bytes; quality 78, alpha quality 80. Master crop `[left,top,width,height]`: [43,300,1113,2700].
- `src/lib/errors/assets/error-wanderer.webp`: 504×900, 77,214 bytes; quality 80, alpha quality 100. Master crop `[left,top,width,height]`: [11,12,777,1388].
- `src/lib/errors/assets/error-mascot-climb.webp`: 284×700, 52,784 bytes; quality 80, alpha quality 100. Master crop `[left,top,width,height]`: [134,2,398,981].
- `src/lib/errors/assets/error-mascot-top.webp`: 299×700, 65,208 bytes; quality 80, alpha quality 100. Master crop `[left,top,width,height]`: [191,24,417,976].

## Final PNG masters

- `docs/art/errors-404/tree-sky.png`: 2560×1440, 8,298,847 bytes; RGB, opaque.
- `docs/art/errors-404/tree.png`: 1200×3000, 3,501,863 bytes; RGBA, genuine transparency.
- `docs/art/errors-404/wanderer.png`: 800×1400, 1,404,797 bytes; RGBA, genuine transparency.
- `docs/art/errors-404/mascot-climb.png`: 800×1000, 679,900 bytes; RGBA, genuine transparency.
- `docs/art/errors-404/mascot-top.png`: 800×1000, 741,721 bytes; RGBA, genuine transparency.

## Registration for CSS

Coordinates use each delivered image's full intrinsic bounds: origin at its top left, x divided by width, y divided by height. The standing surface refers to the conservative, flat central section; foliage outside these endpoints slopes away. Organic leaf edges vary a few pixels around the nominal surface. Place shoe soles at the surface rather than using the image bottom without compensating for its baseline padding.

### `tree.png` — 1200×3000

- Top standing surface: pixel `(left=400, right=840, y=315)`; normalized **`left=0.3333, right=0.7000, y=0.1050`**.
- Trunk center at y=30%: approximately x=600; normalized **`(0.5000, 0.3000)`**.
- Trunk center at y=50%: approximately x=600; normalized **`(0.5000, 0.5000)`**.
- Trunk center at y=70%: approximately x=615; normalized **`(0.5125, 0.7000)`**.
- These master centerline points are visual botanical axes, interpolated where canopy foliage or branch junctions obscure the trunk. They are not the midpoint of the whole foliage silhouette.

### `error-tree.webp` — 701×1700

- Top standing surface: approximately pixel `(left=224.9, right=502.0, y=9.4)`; normalized **`left=0.3208, right=0.7161, y=0.0056`**.
- Trunk center at y=30%: pixel `(350.5,510)`; normalized **`(0.5000, 0.3000)`**.
- Trunk center at y=50%: pixel `(353.5,850)`; normalized **`(0.5043, 0.5000)`**.
- Trunk center at y=70%: pixel `(358,1190)`; normalized **`(0.5107, 0.7000)`**.
- These points were checked against the decoded final WebP. The y samples differ from the master's because its top padding was trimmed.

### Figure anchors

- `wanderer.png`: bottom sole baseline y=0.9800; `error-wanderer.webp`: y≈0.9798 (≈881.8/900). His feet are right of the canvas center because the cape flows left; the midpoint between the feet is approximately x=0.72 of the trimmed WebP.
- `mascot-top.png`: bottom sole baseline y=0.9800; `error-mascot-top.webp`: y≈0.9795 (≈685.7/700). Feet midpoint is approximately x=0.50 of the trimmed WebP.
- Both mascot WebPs are 700 pixels tall. Their source scale is shared; different amounts of transparent-margin trimming introduce only about a 0.5% relative scale difference. The climbing character is naturally shorter in his bent pose.
- `mascot-climb.png` has a gently wavering trunk near x=0.50 of its master. After tight web trimming, the bark is right of the cutout center; align the bark, not the sprite bounding-box midpoint. Its middle trunk anchor is approximately x=0.72 of `error-mascot-climb.webp`.

## Validation

Opened all five final PNGs and all five final WebPs. Reviewed mascot identity, both rear poses, yellow backpack continuity, watercolor granulation, right-hand rim light, the wanderer's adult proportions, the flat summit, and the absence of visible text, symbols, UI, logos or signatures. Pixel checks verified that the sky is opaque and every cutout has fully transparent exterior pixels and partially transparent painted edges. The climbing trunk has soft alpha fades at both ends.

An in-memory composite of the final sky, tree, mascot-top and wanderer confirmed the common lighting/style and that the figures stand on the summit without background boxes. This diagnostic composite was not saved as an extra project artifact. The horizon glow remains inside a center 9:16 crop. Palette intent is butter/ochre/cream, indigo/anthracite and muted olive/teal; tiny resampling/compression extrema are not separate black or white design colors.

No application code, translations, source references, other agents' assets, package files or deployment configuration were edited. No deployment was run.
