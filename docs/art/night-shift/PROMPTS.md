# Night shift production prompts

Generated 2026-11-01 with the built-in `image_gen.imagegen` tool. Highest available quality was requested in each prompt; the tool exposes no separate model or quality selector. No CLI/API fallback was used. These are production raster assets, with no generated visitor copy.

## Reference inputs

1. `mockups/round-2/05-night-shift-radio/02-night-shift-bonsai-hover.png` (under docs/).
2. `mockups/round-2/05-night-shift-radio/01-night-shift-desktop.png` (under docs/).
3. `mockups/round-2/05-night-shift-radio/03-night-shift-console-hover.png` (under docs/).
4. `mockups/round-2/05-night-shift-radio/04-night-shift-mobile.png` (under docs/).
5. `mockups/round-2/01-mascot-easter-eggs/09-egg-golden-bonsai-desktop.png` (under docs/).

All five references were opened before generation. The room was made first. Subsequent assets used the approved room or its derived bonsai as their reference; the mobile repaint also used the supplied portrait reference.

## room

Inputs: all five references, in the above order.

Transparent background: false.

```text
Use case: precise-object-edit. Asset type: production painted background plate, NOT a website mockup. Highest available quality. Output exactly 2560x1440 pixels, landscape 16:9.
Inputs: image 1 is the watercolor/ink style lock; image 2 is the FIXED CAMERA and composition master; image 3 gives matching desk material; image 4 is mobile layout guidance only; image 5 gives pigment quality only. Do not copy UI, characters, or consoles from any reference.
Repaint the room from image 2 preserving its camera, perspective and normalized arrangement: tall night window in left-center (x18–47%); black angled desk lamp at far left; large monitor x23–48%, y38–68%; coffee at x12–21%, y66–78%; desk across lower quarter; keyboard x41–65%, y71–77%; blank notebook on right x65–85%; empty dark upholstered chair behind keyboard at x53–85%, y21–74%; manga shelf at upper right with muted cream/anthracite blank book spines and trailing houseplant; two dumbbells on floor at lower right. Cozy warm butter lamp lighting, beautifully crafted paper pigment granulation, visible ink outlines and soft watercolor edges. Dark wall replaces the removed head and torso; continue chair naturally behind the removed person.
CRITICAL REMOVE completely: ALL mascot/person/body/hands/head/headphones; ALL bonsai/tree/pot on right desk (leave its pedestal book and clear surface at x85–99%, y50–78%); ALL handheld console (leave clear wood x5–24%, y77–86%); ALL coffee steam; ALL moon from window (keep dark sky, few small stars and trees); ALL text, glyphs, lettering, numbers, labels, logos, UI, arrows, cursor, menu, borders, watermarks. Books and keys have no lettering. Monitor inner screen must be a perfectly uniform flat dark anthracite #18191B quadrilateral, zero texture/glare/content, surrounded by painted bezel and stand. No invented objects in the cleared chair/mascot area. Keep a comfortable clear typing seat matching reference 2.
Palette: butter #FCD772 warm light, cream #FBF3DD highlights, anthracite #18191B night, muted olive plants and warm ochre wood. No pure black or pure white. Edge-to-edge room artwork, no page chrome, no typography, no collage, no inset. Background opaque. Preserve all object coordinates and original perspective.
```

## bonsai

Inputs: nightshift-room.png (normalized approved master); reference 1.

Transparent background: true.

```text
Use case: compositing. PRODUCTION isolated layer, highest available quality, genuine transparent background. Full canvas exactly 2560x1440 landscape, same fixed camera as image 1 (the approved room master). Image 2 is watercolor/ink style reference only.
Paint ONLY a small bonsai in a low anthracite ceramic bowl at the far RIGHT of the desk, resting on the blank pedestal book visible in image 1. Position: complete tree and pot bounding box x=85% to 98%, y=49% to 76.5% of the full canvas; pot bottom anchored at (92%,76.5%). The bowl spans x88%–97%, y70%–76.5%. Bonsai has an elegant twisting brown trunk, asymmetrical mature branch structure and muted olive-green foliage with restrained butter lamplight edges. Warm light from upper left. Style matches painted watercolor granulation and ink of the room exactly. Preserve perspective and realistic tabletop contact shadow. Keep the tree fully within the image.
Everything except the bonsai, pot and tight transparent contact shadow is alpha-transparent. NO room, desk, book, wall, chair, person, mascot, labels, letters, UI, symbols, watermark, rectangular background or checkerboard painted into image. No glow yet; this is the normal quiet green state. No pure white or pure black. Do not move or enlarge the object to center; leave the left 83% and top 45% of the canvas completely transparent.
```

## bonsaiFix

Inputs: first bonsai attempt (included an unwanted book).

Transparent background: true.

```text
Use case: precise-object-edit / background-extraction. Edit this transparent bonsai layer. Remove the BOOK completely, including its pages, cover and shadow. Keep ONLY the green bonsai and its dark ceramic bowl, no base or pedestal beneath it. Preserve the exact tree shape, foliage, trunk, bowl, watercolor pigment and warm left light. Preserve transparency. Output a close-fitting square transparent asset with generous clear padding on all four sides, tree centered, complete bowl and delicate leaves intact. No ground plane, no backdrop, no room, no book, no text, no symbols. Highest quality production cutout, genuinely transparent outside the tree/bowl. The bowl bottom is the asset baseline. This cutout will be registered onto the exact master canvas during export.
```

## golden

Inputs: clean green bonsai cutout; reference 1; reference 5.

Transparent background: true.

```text
Use case: precise-object-edit. Highest quality production transparent bonsai golden state. Edit image 1, the clean green bonsai cutout. Keep exactly its square canvas, pot shape, pot pixel position, pot size and bottom baseline. The pot must NOT move or change, and the main twisting trunk must keep its base position. Transform foliage into a luminous golden canopy that grows about 18% wider and 15% taller within the existing padding: warm butter #FCD772 with cream #FBF3DD flecks, rich ochre shadows, fine watercolor pigment blooms and ink branch contours. Add a delicate translucent golden radiance around leaves (soft alpha, no dark matte) and a few tiny golden motes close to the canopy. This is an original magical tree. Image 2 is the golden lighting/style reference only; image 3 is the larger glowing canopy inspiration only. NO mascot, person, book, desk, room, landscape, text, symbols, or labels. Preserve genuine transparency everywhere outside the tree, bowl, delicate halo and motes. No pure white or black. Avoid clipping any canopy or halo at edges. Crucial: exact same pot and root anchor as image 1, no camera change.
```

## goldenFix

Inputs: first golden cutout (clipped halo).

Transparent background: true.

```text
Use case: background-extraction / precise-object-edit. Highest quality transparent production asset. The current golden bonsai halo is clipped at the left edge. Fix ONLY framing: zoom the ENTIRE existing bonsai and pot OUT by 22%, keeping its proportions, trunk, branches, pot, materials and golden colors unchanged. Center the complete golden bonsai on a square transparent canvas with at least 12% completely TRANSPARENT margin on EACH of the four sides beyond all foliage and glow. Reconstruct the missing tiny left halo edge, let the very soft radiance fade fully to alpha zero well before any canvas edge. Do NOT enlarge the canopy further. No background, matte, book, desk, room, person, text, UI, logo. Keep the original tree and pot as closely as possible. Preserve the delicate watercolor granulation, ink linework and luminous butter-yellow leaves. Final exported asset will be registered by its pot anchor against the original green version.
```

## handheld

Inputs: nightshift-room.png; reference 3.

Transparent background: true.

```text
Use case: compositing. Highest quality production transparent prop. Image 1 is the approved room master: match its slightly elevated front-facing camera, warm lamp from upper left, watercolor paper pigment and ink lines. Image 2 is only the reference for scale and desk position of a handheld; DO NOT copy its console design.
Paint a completely ORIGINAL handheld game device lying flat on the desk, three-quarter view from above/front, long direction gently diagonal left-to-right consistent with the desk perspective. Invent a compact asymmetric smooth pebble/teardrop shape, cream #FBF3DD ceramic-like shell with butter #FCD772 ochre edges. One small dark rounded trapezoid screen on the wider left portion and ONE large recessed round brass rotary dial on the narrow right tip, plus two tiny oval inset buttons below the screen. No D-pad, no twin sticks, no detachable controllers, no familiar console silhouette. Must NOT resemble Nintendo Switch, Game Boy, Steam Deck, PSP, or any real product. Screen dark empty anthracite #18191B, no content.
Isolate just the device and its tight faint contact shadow on genuine transparency. No desk, no book, no surface plane, no room, no person, no plant, no UI, no logos, no letters, no symbols, no glyphs. Ink outline, painterly textured shell, cozy warm reflected light. Complete silhouette with clear padding all around, centered horizontal asset. It will be registered at desk coordinates x6–24%, y78–85% on the 2560x1440 master. No pure white/black. No checkerboard backdrop.
```

## sky

Inputs: nightshift-room.png; reference 1.

Transparent background: false.

```text
Use case: illustration-story. Highest quality square production sky plate, requested 1100x1100, opaque edge-to-edge. Input image 1 is the fixed room master: paint the outside night sky seen through its left window, with no window frame or interior at all. Image 2 is the reference moon pigment and butter lighting. Anthracite #18191B and subtly blue charcoal watercolor sky, soft layered cloud washes, sparse tiny muted cream stars, a textured glowing full butter-yellow moon around (43%,40%), diameter 31% of canvas. Dark soft silhouettes of distant treetops only across the bottom 20%, small edge branches. Keep the upper 75% mostly quiet sky. Rich watercolor granulation and original ink illustration, warm butter #FCD772 and cream #FBF3DD moon, no pure white/black. NO buildings, people, mascot, desk, furniture, window frame, bonsai, interface, text, numbers, lettering or logos. This square overscan layer will drift a few pixels behind the window opening; preserve the reference's mood.
```

## foreground

Inputs: nightshift-room.png; reference 1.

Transparent background: true.

```text
Use case: compositing. Highest quality production transparent foreground layer, exactly 2560x1440 landscape. Use image 1 as the locked room composition and perspective. Paint ONLY a few large graceful out-of-focus houseplant leaves entering from the extreme LOWER LEFT corner, foreground parallax framing. Muted dark olive/anthracite leaves with subtle butter edge light, soft watercolor pigment and delicate ink edges matching image 1 and image 2. Keep all visible leaf material within x0–10% and y82–100% of the whole canvas; stems exit bottom and left. Do not cover coffee, handheld reserved area, monitor or chair. Everything else fully alpha transparent. No pot, no desk, no lamp, no room, no background, no book, no person, no text, no labels, no rectangular matte or checkerboard. Keep center, right and top empty transparent. Original painted foliage, no pure black or white. This is an additive foreground layer and does not repaint any base-room pixels.
```

## mobile

Inputs: nightshift-room.png; reference 4; reference 1.

Transparent background: false.

```text
Use case: compositing / illustration-story. Highest quality production background painting, NOT website mockup. Output exactly 1080x2340 portrait, ratio 6:13. Image 1 is approved desktop ROOM MASTER: preserve object identities, watercolor ink style, wood, lamp, empty monitor, chair, books, shelf and lighting. Image 2 is the approved MOBILE composition to follow. Image 3 is painterly style lock only.
Repaint portrait room composition centered on the desk and empty chair spot from image 2: tall window with dark sky, sparse stars and dark trees on left, trailing plant and blank-spined manga shelf high on right, angled black lamp mid-left, large monitor at left-middle x7–51% y43–59%, empty dark upholstered chair behind keyboard at x51–96% y45–64%, coffee x6–21% y61–67%, mouse and keyboard center, blank notebook and blank pedestal book on right, warm wooden desk across y63–77%, chair base and two dumbbells on floor near y88–95%. Window and dark wall occupy upper space with NO title or text. Keep the mascot placement area clear and compatible with reference 2 (head would occupy x48–83%, y35–52%, torso x42–82%, y51–65%). Remove the human completely and naturally continue chair and wall.
NO mascot, person, body parts, headphones. NO bonsai or bonsai pot (leave right pedestal book at x82–99%, y68–72% clear for separate overlay). NO handheld console (leave desk x8–40%, y69–74% clear). NO coffee steam. NO moon in base window. NO text, lettering, numerals, logos, glyphs, arrows, UI, labels, hotspot rings, cursor or watermarks, including no book-spine marks, no keyboard legends. Screen is uniform flat dark #18191B, no content, glare or texture, with painted bezel and stand. Original watercolor pigment and soft anime ink illustration. Butter #FCD772 lamplight, anthracite #18191B night, cream #FBF3DD paper; no pure white/black. Fill the whole portrait with the room. No borders, panel divisions or collage. Maintain practical clear desktop surfaces for separately composited props.
```

## Selection and export

The first bonsai attempt was rejected because it included a book and ignored the intended object scale. The clean cutout was retained and registered deterministically. The first golden attempt was rejected because its glow touched the canvas edge. Its revised version was retained. Rejected images are not included in this folder.

Native generated dimensions: room 1672×941; green and golden cutouts 1254×1254; handheld and foreground 1672×941; sky 1254×1254; mobile 852×1846. Final requested dimensions were produced with Windows System.Drawing high-quality bicubic resampling. This increases canvas dimensions, not native painted detail. No image dependency was installed.

Mechanical export steps (all coordinates in final desktop pixels unless stated):

- Room: resize to 2560×1440. Fill the measured inner screen quad with flat #18191B, retaining the painted bezel. The mobile repaint is resized to 1080×2340 with its own screen quad filled identically. Exact quads are in README.md.
- Green bonsai: place the complete 1254×1254 source in destination rectangle (2030,669,476.52,476.52) of a transparent 2560×1440 canvas.
- Golden bonsai: place the complete revised 1254×1254 source at (2005,624,537.4656,537.4656). Replace rows y=1007 through 1439 with the decoded green layer's identical RGBA pixels, locking the pot below its lip. Zero differing pixels were verified across those rows.
- Handheld: place complete 1672×941 source at (100,1050,420,236.3756) on the transparent full canvas. The original aspect ratio is preserved.
- Foreground: place complete 1672×941 source at (0,995.9,789.12,444.1) on the transparent full canvas, preserving its aspect ratio. The resulting visible leaf edge occupies the lower-left 10% of the master.
- Sky: resize to 1100×1100; placement and pane clipping are in README.md.
- Clear only alpha values below 4/255 to zero to remove nearly invisible export residue; preserve other soft alpha values. Set the two room plates and sky plate fully opaque. Change visible exact #000000 pixels to #0E0F10 and visible exact #FFFFFF pixels to #FBF3DD. No pure black/white remains in visible pixels. All cutouts retain genuine alpha; no green-screen fallback.

Each generated image was inspected, followed by the final PNGs and desktop normal/golden and mobile composites. Temporary composites and export/audit scripts were removed before committing; only the seven PNGs and two handoff documents are deliverables.
