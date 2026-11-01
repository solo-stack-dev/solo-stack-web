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

## Coherent scene and localized typing revision — 2026-11-01

Built-in `image_gen.imagegen`, highest available quality requested. No explicit quality/model or mask parameter is exposed. No CLI/API fallback. All six generated images were inspected; the two scene edits and four hand variants were retained. No visitor copy was generated. The owner's live-result screenshot and all three previous mascot typing PNGs were inspected to diagnose the duplicated chair and misplaced hands, but were not used as composition targets.

### Desktop scene

Inputs in order: `nightshift-room.png`; `../mascot/mascot-model-sheet-v2.png`; `../../mockups/round-2/05-night-shift-radio/02-night-shift-bonsai-hover.png`.

Transparent background: false.

```text
Use case: precise-object-edit / identity-preserve. Highest available image quality. Edit image 1, the existing production ROOM PLATE, into a coherent painted scene. Output 2560x1440 landscape exactly, same camera, same framing. Image 2 is mascot identity model sheet v2. Image 3 is watercolor/ink style only; do NOT copy its text, bonsai, console or layout changes.
Preserve image 1's window, monitor and its entire screen quadrilateral, lamp, mug, shelf, trailing plant, framed art, notebook, far-right empty pedestal book and floor dumbbells at EXACT original coordinates, sizes and appearance. Only edit the chair/mascot area and keyboard/mouse area. Paint the mascot sitting IN the existing SINGLE upholstered office chair, facing diagonally LEFT toward the monitor: calm focused friendly face, short dark hair, light stubble, black sweater, dark over-ear headphones. Match model sheet facial identity and soft anime watercolor proportions, warm butter #FCD772 lamplight and anthracite #18191B. Torso and chair form one natural seated working pose behind the desk, backrest behind his back; no separate sprite chair, no doubled backrests, no second seat. Head approximately x59%, y36%; do not cover monitor screen or shelf.
Correct desk ergonomics: move the keyboard into the desk space directly in front of the monitor and between monitor and seated person, centered on their working axis, in correct perspective. Both forearms naturally extend forward and BOTH hands visibly rest with anatomically clear fingers ON keycaps, wrists relaxed, no floating hands or hands on the desk instead. Keys have no lettering. Remove original mouse at the keyboard's left. Paint ONE mouse to the keyboard's RIGHT from the seated user's perspective, oriented in the same direction as the keyboard toward the monitor; mouse buttons/front and cable lead TOWARD the monitor, away from user's palm. Only one keyboard, one mouse, one chair. Keep blank wood for the separate handheld at lower left and the bonsai pedestal book at far right. No bonsai, handheld, coffee steam, moon, text, letters, numerals, labels, logos, UI or watermark anywhere. Monitor inner screen remains entirely flat solid #18191B with no texture, reflection or content. Preserve ink outlines, paper grain, watercolor and lighting. This is final production illustration, not mockup.
```

### Mobile scene

Inputs in order: `nightshift-room-mobile.png`; generated desktop scene; `../mascot/mascot-model-sheet-v2.png`.

Transparent background: false.

```text
Use case: precise-object-edit / identity-preserve. Highest available quality production illustration. Image 1 is the MOBILE room plate to edit, preserve exactly its 1080x2340 portrait canvas, framing, tall composition and object positions. Image 2 is the approved new desktop scene, reference for the mascot and corrected single-chair typing workstation. Image 3 is mascot identity model sheet v2. Match the DESKTOP man's face, headphones, black sweater and calm expression. Paint this same short dark haired lightly stubbled anime watercolor mascot INTO image 1's existing single chair, behind the desk, turned toward the monitor at left. His head approximately x69%, y43%; the head is ABOVE the chair, torso in the chair, arms extend naturally to keys. Only ONE chair including its existing wheeled base, no extra backrest or duplicated furniture. BOTH hands visibly contact blank keyboard keycaps. Move keyboard so it is directly in front of the monitor between screen and person, correct desk perspective, centered on his working axis. Remove original left-side mouse and place one mouse to the right of the keyboard, front/buttons and cable pointing toward the MONITOR, away from the typist. Match desktop corrected arrangement. No floating fingers. Keep monitor inner quad fully clear, uniformly #18191B, zero content/texture/glare. Preserve its exact coordinates and all bezel/stand geometry. Preserve window and glass, lamp, mug, shelf, trailing plant, framed art, notebook, bonsai pedestal book at right, blank handheld space at lower left, desk legs, chair base, dumbbells at their exact positions in image 1. NO bonsai, handheld, steam, moon, text, lettering, numbers, logo, watermark, symbols. Warm butter #FCD772 lamp lighting, anthracite #18191B, original painted watercolor pigment with ink, preserve base room style. Change ONLY mascot/chair upper part, keyboard, mouse and immediate working surface. No reframe, no crop, no camera change. The portrait height must be retained.
```

### Desktop hand beat 2

Inputs in order: final registered `nightshift-scene.png`.

Transparent background: false.

```text
Use case: precise-object-edit. Highest quality. This is a PRODUCTION animation-frame edit of the supplied 2560x1440 scene. Keep camera, whole canvas, lighting, colors and every object unchanged. Modify ONLY the finger/hand region inside pixel rectangle x=1080,y=935,width=440,height=130 of the supplied full canvas. Do not shift the wrists or arms. Produce typing animation beat 2: the farther hand (on the LEFT in the image) lightly depresses its index finger onto a key while its middle finger lifts just a few pixels; near/right hand's index lifts a little and middle finger touches its key. Both hands remain on keyboard, subtle plausible typing motion, five fingers anatomically correct. Keep the keyboard rows and key positions perfectly registered, no new or removed keys, no letters. ALL pixels outside this region should match the supplied source exactly. Do not change face, hair, headphones, body, chair, screen, mouse, desk, background, scale, grain, or exposure. No text or new objects. Same 2560x1440 landscape output. This will be cropped into a small patch, so edge registration and unchanged wrist position are essential.
```

### Desktop hand beat 3

Inputs in order: final registered `nightshift-scene.png`.

Transparent background: false.

```text
Use case: precise-object-edit. Highest quality. This is a PRODUCTION animation-frame edit of the supplied 2560x1440 scene. Keep camera, whole canvas, lighting, colors and every object unchanged. Modify ONLY the finger/hand region inside pixel rectangle x=1080,y=935,width=440,height=130 of the supplied full canvas. Do not shift the wrists or arms. Produce typing animation beat 3, opposite keystroke: the farther hand (LEFT in image) lifts its index fingertip 5 pixels while middle and ring fingers contact their keys; near/right hand gently depresses its index finger and lifts its ring finger 5 pixels. Keep the hands' overall shape and position fixed; only alternate the fingertips. Both hands remain on keyboard, subtle plausible typing motion, five fingers anatomically correct. Keep the keyboard rows and key positions perfectly registered, no new or removed keys, no letters. ALL pixels outside this region should match the supplied source exactly. Do not change face, hair, headphones, body, chair, screen, mouse, desk, background, scale, grain, or exposure. No text or new objects. Same 2560x1440 landscape output. This will be cropped into a small patch, so edge registration and unchanged wrist position are essential.
```

### Mobile hand beat 2

Inputs in order: final registered `nightshift-scene-mobile.png`.

Transparent background: false.

```text
Use case: precise-object-edit. Highest quality PRODUCTION animation-frame edit. Supplied image is the approved 1080x2340 portrait scene. Keep exactly the same full canvas, framing, camera, objects, lighting and pigment. Edit ONLY the fingers/hands in pixel rectangle x=420,y=1345,width=300,height=105 on the supplied canvas. Typing beat 2: the farther hand (LEFT in image) gently depresses its index fingertip onto its key and raises middle fingertip a tiny amount; the nearer/right hand raises index fingertip just 3 pixels while middle finger remains on its key. Both hands stay naturally on the keyboard. Only tiny finger motion, wrists and forearms do not move. Preserve exact keyboard/keycap registration, no letters. Everything outside this small hand rectangle must remain pixel-identical including head, sweater, chair, monitor, mouse, room and desk. No changed grain, exposure, zoom or position. No new objects or text. Output same 1080x2340 portrait. A small hand patch will be extracted; keep its edge pixels registered.
```

### Mobile hand beat 3

Inputs in order: final registered `nightshift-scene-mobile.png`.

Transparent background: false.

```text
Use case: precise-object-edit. Highest quality PRODUCTION animation-frame edit. Supplied image is the approved 1080x2340 portrait scene. Keep exactly the same full canvas, framing, camera, objects, lighting and pigment. Edit ONLY the fingers/hands in pixel rectangle x=420,y=1345,width=300,height=105 on the supplied canvas. Typing beat 3, opposite keystroke: farther hand (LEFT in image) raises its index fingertip 4 pixels while its middle and ring fingers contact keys; nearer/right hand presses its index fingertip onto its key while ring fingertip rises 4 pixels. Keep the overall palm silhouette unchanged. Both hands stay naturally on the keyboard. Only tiny finger motion, wrists and forearms do not move. Preserve exact keyboard/keycap registration, no letters. Everything outside this small hand rectangle must remain pixel-identical including head, sweater, chair, monitor, mouse, room and desk. No changed grain, exposure, zoom or position. No new objects or text. Output same 1080x2340 portrait. A small hand patch will be extracted; keep its edge pixels registered.
```

### Registration and localized export

Desktop native outputs were 1672×941; mobile outputs were 852×1846. Each was resized with Pillow Lanczos to the original plate dimensions (2560×1440 and 1080×2340). All original files were preserved.

The scene edit was composited over the original room using a polygon mask defined in native-generation coordinates, scaled to the final canvas with rounded integer vertices, then blurred with Gaussian radius 5 final pixels:

- Desktop polygon on 1672×941: `[(830,175),(1170,175),(1170,390),(1390,395),(1445,465),(1425,696),(1110,700),(1105,740),(480,740),(480,680),(600,650),(690,605),(805,605),(800,475),(830,460)]`.
- Mobile polygon on 852×1846: `[(435,680),(690,680),(720,820),(805,845),(850,900),(850,1130),(655,1130),(655,1180),(210,1180),(210,1115),(330,1085),(460,1065),(445,820)]`.

The first desktop assembly mask stopped too far to the right and retained part of the old bezel in front of the far hand. Its boundary was expanded to include `(690,605)` and `(805,605)`, then re-exported and inspected. The mobile lower-left mask boundary was also tightened to x=210 native pixels to retain the original coffee coaster completely. These were compositing-boundary corrections, not new generated poses. The final monitor quads from README.md were filled uniformly with RGB `(24,25,27)`, preserving their original geometry and eliminating generated glare/texture. All scene pixels outside the local blend remain original-room pixels.

Hand export:

- Desktop common crop `[x,y,w,h]=[1080,935,440,140]` (ten pixels taller than the initial prompt region to include a clean lower join).
- Mobile common crop `[420,1345,300,105]`.
- Frame 1 is an exact RGB crop from the final base scene.
- Frames 2/3: resize the generated full-frame variant to the final canvas, extract the same crop, then blend against frame 1. For patch pixel `(i,j)`, let `d=min(i,j,w-1-i,h-1-j)` and `alpha=round(255*clamp((d-4)/10,0,1))`. This gives an unchanged five-pixel rim followed by an inward ten-pixel ramp. Keep the original monitor aperture unchanged wherever its polygon intersects the crop. Export opaque RGB PNGs.
- The generated full-frame variants are discarded after extracting their hand patches. This guarantees zero animation changes outside the documented small rectangles even though the editor did not preserve other pixels exactly.
- Validation: correct dimensions; frame-1 decoded RGB exactly matches scene crop; unchanged border rims; changed bounds stay inside the hand rectangles; screen polygons uniformly #18191B; manual 100% hands/chair/mouse inspection; visual desktop/mobile composites with the existing prop mappings.

Temporary local export scripts and inspection composites were removed before commit. No new dependency, public text, source component, old artwork or deployment configuration was changed.

## Facing monitor revision — 2026-11-01

Built-in image_gen.imagegen, opaque outputs, highest quality requested; no CLI/API fallback, no installation, no public copy. Eight generation calls: four composition candidates and four local hand edits. The first desktop and mobile candidates were rejected because their monitors retained the original perspective facing away from the typist. Both had improved gaze, but that alone did not resolve the physical inconsistency. Candidate B in each format was selected for the left-facing profile, rotated chair, readable screen and coherent working axis. Rejected rasters are not committed.

### Desktop candidate A — rejected

Inputs: Original desktop scene. Transparent background: false.

```text
Use case: precise-object-edit. Edit the provided production watercolor room plate. Highest quality, output 2560x1440 landscape. Fix the coding pose convincingly: the man at right turns his entire chair, shoulders and head to the LEFT toward the monitor. Show his right side and some back, near strict left-facing profile: nose points LEFT, one visible eye looking LEFT into the center of the screen, no eye contact with viewer. Short dark hair, stubble, black short-sleeve tee, dark headphones, same soft anime watercolor identity. Turn monitor toward him at right: its right edge is closer to viewer and taller than left edge, top edge slopes upward toward right, bottom slopes downward toward right. Keep a LARGE wide unobstructed readable screen face occupying roughly x24–48%, y37–66%, uniform #18191B with clear ink bezel, no content. Keyboard directly between monitor and man on their diagonal working axis, both relaxed hands contacting keys, anatomically sound fingers. One coherent chair behind his right shoulder, one mouse beside keyboard. Preserve exact room framing and all non-workstation objects: window, lamp, coffee, shelf with blank book spines, plants, notebook, empty bonsai book at far right, empty handheld surface lower left, dumbbells. Preserve warm butter lamplight, charcoal wall, ink and watercolor paper grain. No bonsai or console painted in: existing separate overlays retained. No moon painted in: existing sky overlay retained. No steam, text, letters, glyphs, logos or UI anywhere. Change only man/chair/monitor/keyboard/mouse and immediate surface, keep room layout intact.
```

### Desktop candidate B — selected

Inputs: Original desktop scene. Transparent background: false.

```text
Use case: precise-object-edit. Edit the provided production watercolor room plate. Highest quality, output 2560x1440 landscape. Fix the coding pose convincingly: the man at right turns his entire chair, shoulders and head to the LEFT toward the monitor. Show his right side and some back, near strict left-facing profile: nose points LEFT, one visible eye looking LEFT into the center of the screen, no eye contact with viewer. Short dark hair, stubble, black short-sleeve tee, dark headphones, same soft anime watercolor identity. Turn monitor toward him at right: its right edge is closer to viewer and taller than left edge, top edge slopes upward toward right, bottom slopes downward toward right. Keep a LARGE wide unobstructed readable screen face occupying roughly x24–48%, y37–66%, uniform #18191B with clear ink bezel, no content. Keyboard directly between monitor and man on their diagonal working axis, both relaxed hands contacting keys, anatomically sound fingers. One coherent chair behind his right shoulder, one mouse beside keyboard. Preserve exact room framing and all non-workstation objects: window, lamp, coffee, shelf with blank book spines, plants, notebook, empty bonsai book at far right, empty handheld surface lower left, dumbbells. Preserve warm butter lamplight, charcoal wall, ink and watercolor paper grain. No bonsai or console painted in: existing separate overlays retained. No moon painted in: existing sky overlay retained. No steam, text, letters, glyphs, logos or UI anywhere. Change only man/chair/monitor/keyboard/mouse and immediate surface, keep room layout intact.
COMPOSITION B — CRITICAL monitor perspective correction: completely repaint the monitor; do not retain the original left-tall trapezoid. Inner screen corners on 2560x1440 MUST be approximately TL(600,640), TR(1170,550), BR(1170,940), BL(600,870). The RIGHT screen edge is nearer the man and is TALLER, so the visible screen actually faces him. This is essential. Keyboard is angled diagonally, long edge recedes toward upper-left, centered x1170,y1030. Left-facing profile head, eye aimed into screen; visible right shoulder/back. Retain wide visible screen and both hands.
```

### Mobile candidate A — rejected

Inputs: Original mobile scene; selected desktop candidate B. Transparent background: false.

```text
Use case: precise-object-edit. Highest quality. Image 1 is the portrait room edit target, keep exactly its framing and 1080x2340 ratio. Image 2 is the accepted DESKTOP composition reference. Repaint only mobile workstation to match image 2: man in right-side/back three-quarter view, head strict left-facing profile with one visible eye looking LEFT into screen center, short dark hair, stubble, headphones, black tee. Chair turned left, one chair only. Large monitor face turned toward the man: RIGHT vertical edge taller and nearer him; top edge rises toward right, bottom edge descends toward right. Large unobscured uniformly #18191B screen, ink bezel, approximately x8–56%, y41–57%. Keyboard aligned on screen-to-man axis, both hands touching blank keys. Natural arms and seated anatomy. Keep EXACT portrait room and non-workstation locations: tall window, lamp, mug, shelf and trailing plant, book on right for separate bonsai, blank handheld space, desk legs, chair base, dumbbells. Match warm butter light, anthracite, ink/watercolor paper texture and mascot style. No text, letters, UI, logos, steam. No painted bonsai/console/moon, these retain separate registered layers. Do not crop or reframe. Same portrait proportions.
```

### Mobile candidate B — selected

Inputs: Original mobile scene; selected desktop candidate B. Transparent background: false.

```text
Use case: precise-object-edit. Highest quality. Image 1 is the portrait room edit target, keep exactly its framing and 1080x2340 ratio. Image 2 is the accepted DESKTOP composition reference. Repaint only mobile workstation to match image 2: man in right-side/back three-quarter view, head strict left-facing profile with one visible eye looking LEFT into screen center, short dark hair, stubble, headphones, black tee. Chair turned left, one chair only. Large monitor face turned toward the man: RIGHT vertical edge taller and nearer him; top edge rises toward right, bottom edge descends toward right. Large unobscured uniformly #18191B screen, ink bezel, approximately x8–56%, y41–57%. Keyboard aligned on screen-to-man axis, both hands touching blank keys. Natural arms and seated anatomy. Keep EXACT portrait room and non-workstation locations: tall window, lamp, mug, shelf and trailing plant, book on right for separate bonsai, blank handheld space, desk legs, chair base, dumbbells. Match warm butter light, anthracite, ink/watercolor paper texture and mascot style. No text, letters, UI, logos, steam. No painted bonsai/console/moon, these retain separate registered layers. Do not crop or reframe. Same portrait proportions.
MANDATORY screen perspective: discard original monitor silhouette. Inner screen on 1080x2340 must approximately be TL(90,1060), TR(550,970), BR(575,1320), BL(110,1280). RIGHT edge taller, TOP edge slopes UP toward right, opposite the original plate. Match image 2 monitor orientation exactly. Do not retain old screen angle. Keep screen wide, entire face visible. Preserve portrait canvas and original prop locations.
```

### Desktop hands beat 2

Inputs: Final registered desktop scene. Transparent background: false.

```text
Use case: precise-object-edit. Production typing animation beat 2. Edit supplied 2560x1440 scene ONLY inside hands rectangle [1040,925,440,140]. Keep palms, wrists, forearms, keyboard and all room pixels exactly registered. Near hand's index finger lifts a few pixels while middle finger presses a key; far hand index presses and middle lifts slightly. Tiny anatomically plausible fingertip motion only, both hands remain on keys. Five fingers, no extra digits. No changes to arms, pose, head, screen, lighting, texture or camera. No text. Output full identical landscape canvas; a small hand crop will be extracted.
```

### Desktop hands beat 3

Inputs: Final registered desktop scene. Transparent background: false.

```text
Use case: precise-object-edit. Production typing animation beat 3. Edit supplied 2560x1440 scene ONLY inside hands rectangle [1040,925,440,140]. Keep palms, wrists, forearms, keyboard and all room pixels exactly registered. Near hand index gently presses its key and ring fingertip lifts slightly; far index lifts a few pixels while middle finger presses. Opposite beat. Tiny anatomically plausible fingertip motion only, both hands remain on keys. Five fingers, no extra digits. No changes to arms, pose, head, screen, lighting, texture or camera. No text. Output full identical landscape canvas; a small hand crop will be extracted.
```

### Mobile hands beat 2

Inputs: Final registered mobile scene. Transparent background: false.

```text
Use case: precise-object-edit. Production typing animation beat 2. Edit supplied 1080x2340 scene ONLY inside hands rectangle [370,1330,300,105]. Keep palms, wrists, forearms, keyboard and all room pixels exactly registered. Near hand's index finger lifts a few pixels while middle finger presses a key; far hand index presses and middle lifts slightly. Tiny anatomically plausible fingertip motion only, both hands remain on keys. Five fingers, no extra digits. No changes to arms, pose, head, screen, lighting, texture or camera. No text. Output full identical portrait canvas; a small hand crop will be extracted.
```

### Mobile hands beat 3

Inputs: Final registered mobile scene. Transparent background: false.

```text
Use case: precise-object-edit. Production typing animation beat 3. Edit supplied 1080x2340 scene ONLY inside hands rectangle [370,1330,300,105]. Keep palms, wrists, forearms, keyboard and all room pixels exactly registered. Near hand index gently presses its key and ring fingertip lifts slightly; far index lifts a few pixels while middle finger presses. Opposite beat. Tiny anatomically plausible fingertip motion only, both hands remain on keys. Five fingers, no extra digits. No changes to arms, pose, head, screen, lighting, texture or camera. No text. Output full identical portrait canvas; a small hand crop will be extracted.
```

### Registration and export

Native outputs: desktop 1672×941; mobile 852×1846. Windows System.Drawing high-quality bicubic resize to 2560×1440 and 1080×2340. These are normalized masters, not native full-resolution generations. Original base pixels are retained outside workstation masks. Generated pixels blend inward over 12 final pixels, using distance to the nearest polygon segment. No anatomy was drawn with code.

Masks in native generated coordinates, scaled to final canvas with rounded vertices:

- Desktop: [[370,295],[850,295],[850,170],[1230,170],[1230,380],[1500,380],[1500,695],[1100,695],[1100,750],[500,750],[500,700],[360,700]].
- Mobile: [[48,750],[440,730],[440,665],[720,665],[730,780],[852,780],[852,1150],[690,1150],[690,1180],[190,1180],[190,1080],[65,1080]].

Initial hard-edged export was rejected for visible joins and a retained old chair edge. Added the 12-pixel inward feather and expanded desktop right-upper mask from y420 to y380. Mobile mask was expanded from y850 to y780 to remove an old floating headrest edge. These were export corrections, not additional image generations.

Fill measured monitor quads with RGB(24,25,27), as documented in README. Retain original transparent props and their affine placements. Desktop sky clip is shortened around the new monitor top; mobile clip stays unchanged. Do not bake sky or props into the scene.

Hand exports remain 440×140 desktop and 300×105 mobile. Frame 1 is an exact scene crop at the new rect. Resize each generated full-frame beat to master size and crop the same rect. Blend only the union of two ellipses in patch-local coordinates: desktop center/radii (125,83)/(105,48) and (263,52)/(93,42); mobile (80,59)/(68,39) and (173,34)/(62,29). Let r be the smaller normalized elliptical distance, alpha=clamp((1-r)*6,0,1). Multiply by clamp((d-4)/10,0,1), where d is distance to nearest patch edge. Round blended RGB values to nearest integer. This keeps wrists, most keycaps, surrounding texture and five-pixel patch rims stationary. Full generated variants are not runtime frames.

Review: final plates, native-size face/workstation crops, all hand frames, 640×360 desktop and 270×585 mobile composites with existing moon, bonsai, handheld and foreground. Hand motion is intentionally small, especially at mobile size; profile occludes some far fingers naturally. Palette and paper texture remain matched to the original room.

## Over-the-shoulder repaint — 2026-11-01

The facing monitor revision still showed the monitor and keyboard facing the viewer while the mascot faced left. The scene was repainted from scratch by GPT Astra (built-in `image_gen.imagegen`, highest quality available): camera behind the mascot's right shoulder, monitor in front of the window facing him, keyboard directly in front of the monitor, both hands on the keys, no mouse. Prompts, candidates, measurements and limitations are in [repaint/NOTES.md](repaint/NOTES.md) and `repaint/measurements.json`. `nightshift-scene.png` and `nightshift-scene-mobile.png` are copies of `repaint/scene.png` and `repaint/scene-mobile.png`. The `nightshift-hands@1…3.png` (crop at 1000, 920) and `nightshift-hands-mobile@1…3.png` (crop at 372, 1220) are cut from the repaint and its hand frames.
