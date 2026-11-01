# Night shift repaint handoff

Asset-only delivery for the lead to integrate. No application code, external documentation, or git state was changed; no commit or deployment was made. All task-authored output is under this directory. The built-in tool also retains its normal source copies in the user's Codex generated-image cache.

## Tool, model, and quality

- **Image tool:** built-in `image_gen.imagegen` (exposed here as `image_gen__imagegen`), used for every painted scene and every generated finger edit.
- **Model:** the tool did **not disclose a model identifier or version**. Its interface offers no model selector. I cannot truthfully label these images GPT Image 2 or another named model.
- **Quality:** service-selected built-in quality; **no quality parameter is exposed**. Prompts requested carefully drawn, finished, highest-detail art. There was no controllable stronger model or higher quality setting in this tool.
- No fallback model, CLI image generation, or API image generation was used.
- Deterministic processing: Sharp 0.35.5 / libvips 8.18.7, Lanczos3 resize, measured polygon screen fill, local finger-mask compositing, and removal of isolated pure black/white pixels. No application dependencies were installed.

## Final assets and native sizes

- `scene.png`: **2560 × 1440**, from desktop candidate 3, native **1672 × 941**.
- `scene-mobile.png`: **1080 × 2340**, from portrait candidate 3, native **852 × 1846**.
- `scene-hands@2.png`: **2560 × 1440**; generated edit native **1672 × 941**.
- `scene-hands@3.png`: **2560 × 1440**; generated edit native **1672 × 940**.
- `scene-mobile-hands@2.png` and `scene-mobile-hands@3.png`: **1080 × 2340**; each generated edit native **852 × 1846**.
- All resizing uses Lanczos3 to exact final dimensions. The portrait is separately painted and recomposed; it is not a crop of the desktop.
- Desktop candidate 1 and 2 are retained in `rejected/`. Their native size was 1672 × 941 each. Portrait candidate 1 and 2 are also in `rejected/`, native 830 × 1896 each.
- `sources/` contains only the selected generation sources and finger masks required to reproduce the delivered files.

## Generation lineage

The owner's live screenshot, both old plates, and the approved mascot model sheet were opened before painting. The old plates were used as visual style/object references; neither old room plate was locally edited.

1. Desktop candidate 1 was a fresh generation with no edit target. Rejected for the added desk plant, overly realistic anatomy, large screen and cropped dumbbell.
2. Desktop candidate 2 was another full generation. Rejected for screen size, partly cropped objects and less faithful mascot styling.
3. Desktop candidate 3 refined candidate 2 using the approved mascot sheet as an explicit identity/style reference. This is the selected new composition.
4. Portrait candidate 1 was a separate fresh generation. Rejected for the screen/hair overlap and cropped dumbbell.
5. Portrait candidate 2 refined that portrait using the selected desktop as a room/style reference. Both dumbbells fit, but placement and the book edge needed another pass.
6. Portrait candidate 3 refined the new portrait. This is the selected composition.
7. The four hand generations each used their respective **final, resized, screen-filled neutral scene** as the edit target. Beat 3 was generated from neutral, not from beat 2.

## Measurement conventions

Coordinates below are measured on the **actual final canvas**, not copied from the requested percentage guides. Points are `[x,y]`; rectangles are `[x,y,width,height]`; origin is top left. Screen quads are **TL, TR, BR, BL**, clockwise.

The screen perimeter was traced on pixel-scale crops and flattened after resizing. `validate-assets.cjs` finds the exact-color connected screen region and checks every interior screen pixel. Lamp centers are centroids of bright opening pixels in bounded lamp crops. Other object edges and window cutouts were traced on full-resolution crops and coordinate grids. Painted contours have roughly **2–5 px tracing tolerance**; these are useful integration coordinates, not claims of subpixel semantic segmentation.

Window `outer` polygons describe visible panes, already cut around monitor and mascot. Subtract `holes` for the lamp. Use an even-odd path for the contained hole, or explicitly subtract its mask. Exterior tree silhouettes are baked into the lower pane; these are not interior room objects. The additional `safeSkyPolygons` are conservative clear-sky regions for placing an additive moon without painting over those trees. Do not replace the entire pane with opaque sky if the painted trees should remain.

The complete machine-readable version is `measurements.json`.

## Desktop coordinates

- Monitor inner screen quad: `[[799,525],[1400,513],[1400,797],[799,855]]`.
- Connected flat-screen region: **184,815 pixels**; bounding rect `[799,513,602,342]`. Width is **23.5%** of canvas.
- Lamp shade-opening center: `[358,622]`.
- Mug rim: `[501,860,134,30]`; steam origin `[568,873]`.
- Clear handheld wood rectangle: `[128,1094,486,173]`.
- Pedestal book top quad: `[[2262,834],[2401,813],[2559,849],[2426,876]]`.
- Bonsai pot-bottom anchor: `[2420,850]`; safe bottom/contact rectangle `[2350,840,140,15]`. This is the pot's contact footprint, not the whole pot sprite bounds.
- Both-hands extraction rectangle for **each desktop animation frame**: `[1018,936,402,170]`.
- Actual changed-pixel bounding rectangle in each desktop frame: `[1018,936,337,133]`.
- Mascot head-to-hands/forearms bounding box, excluding chair: `[1018,230,1160,1082]`.
- Hotspot window: `[0,0,1788,952]`.
- Hotspot coffee: `[452,856,201,190]`.
- Hotspot handheld: `[128,1094,486,173]`.
- Hotspot manga shelf: `[2025,0,535,475]`.
- Hotspot bonsai: `[2250,413,310,510]` (includes pedestal plus 400 px above the top).
- Hotspot dumbbells: `[2270,1190,290,218]`.

## Portrait coordinates

- Monitor inner screen quad: `[[160,945],[609,928],[607,1140],[160,1184]]`.
- Connected flat-screen region: **101,115 pixels**; bounding rect `[160,928,450,256]`. Width is **41.7%** of canvas.
- Lamp shade-opening center: `[172,882]`.
- Mug rim: `[79,1212,68,22]`; steam origin `[112,1223]`.
- Clear handheld wood rectangle: `[54,1350,270,100]`.
- Pedestal book top quad: `[[901,1128],[980,1114],[1070,1142],[1000,1157]]`.
- Bonsai pot-bottom anchor: `[995,1141]`; safe contact rectangle `[960,1135,70,8]`.
- Both-hands extraction rectangle for **each portrait animation frame**: `[388,1232,216,113]`.
- Actual changed-pixel bounding rectangle in each portrait frame: `[388,1232,197,87]`.
- Mascot head-to-hands/forearms bounding box, excluding chair: `[388,895,614,572]`.
- Hotspot window: `[26,0,800,1168]`.
- Hotspot coffee: `[56,1208,105,118]`.
- Hotspot handheld: `[54,1350,270,100]`.
- Hotspot manga shelf: `[872,300,208,514]`.
- Hotspot bonsai: `[900,824,180,366]`.
- Hotspot dumbbells: `[670,2006,370,285]`.

## Window pane polygons

The exact desktop and portrait pane rings and their conservative clear-sky placement polygons follow below, copied from the measured JSON.

```json
{
	"desktop": {
		"glassPanes": [
			{
				"name": "left",
				"outer": [
					[72, 0],
					[1058, 0],
					[1058, 498],
					[769, 506],
					[768, 758],
					[91, 811],
					[72, 758]
				],
				"holes": [
					[
						[72, 573],
						[177, 496],
						[219, 480],
						[226, 457],
						[246, 429],
						[277, 420],
						[295, 430],
						[321, 482],
						[366, 487],
						[409, 507],
						[453, 543],
						[480, 572],
						[477, 596],
						[443, 622],
						[393, 649],
						[330, 680],
						[280, 697],
						[242, 687],
						[227, 657],
						[218, 611],
						[224, 567],
						[239, 528],
						[221, 532],
						[198, 545],
						[72, 630]
					]
				]
			},
			{
				"name": "right",
				"outer": [
					[1147, 0],
					[1664, 0],
					[1664, 231],
					[1645, 242],
					[1621, 265],
					[1606, 262],
					[1592, 287],
					[1577, 290],
					[1566, 316],
					[1542, 326],
					[1555, 337],
					[1530, 361],
					[1544, 366],
					[1520, 388],
					[1543, 388],
					[1513, 422],
					[1536, 420],
					[1526, 445],
					[1550, 442],
					[1552, 474],
					[1566, 492],
					[1569, 515],
					[1570, 530],
					[1575, 555],
					[1583, 566],
					[1589, 603],
					[1587, 626],
					[1583, 637],
					[1586, 649],
					[1595, 658],
					[1600, 675],
					[1612, 696],
					[1620, 707],
					[1419, 726],
					[1419, 496],
					[1147, 501]
				],
				"holes": []
			}
		],
		"safeSkyPolygons": [
			[
				[88, 10],
				[1045, 10],
				[1045, 180],
				[88, 180]
			],
			[
				[1160, 10],
				[1650, 10],
				[1650, 140],
				[1160, 140]
			]
		]
	},
	"mobile": {
		"glassPanes": [
			{
				"name": "left",
				"outer": [
					[60, 15],
					[357, 61],
					[357, 931],
					[150, 940],
					[150, 1047],
					[60, 1060]
				],
				"holes": [
					[
						[60, 840],
						[84, 816],
						[91, 796],
						[102, 788],
						[104, 762],
						[119, 741],
						[136, 741],
						[148, 760],
						[164, 793],
						[188, 800],
						[214, 820],
						[232, 842],
						[242, 865],
						[238, 877],
						[212, 892],
						[174, 905],
						[137, 914],
						[108, 913],
						[96, 898],
						[91, 867],
						[100, 835],
						[107, 821],
						[94, 826],
						[60, 861]
					]
				]
			},
			{
				"name": "right",
				"outer": [
					[411, 66],
					[722, 119],
					[722, 897],
					[706, 904],
					[690, 919],
					[672, 919],
					[653, 935],
					[642, 956],
					[633, 970],
					[637, 983],
					[626, 1002],
					[630, 1026],
					[612, 1032],
					[612, 923],
					[411, 932]
				],
				"holes": []
			}
		],
		"safeSkyPolygons": [
			[
				[72, 29],
				[346, 74],
				[346, 345],
				[72, 345]
			],
			[
				[424, 83],
				[710, 132],
				[710, 400],
				[424, 400]
			]
		]
	}
}
```

## Finger compositing and verification

The image editor changes pixels outside the requested region, so its full generated animation images are not used as final frames. Each edit was resized, registered against unchanged nearby keyboard pixels, then composited through a mask around the fingers. The masks include the newly exposed key pixels immediately beneath a moving finger. Feathering is confined inside each mask. Wrists, arms, the rest of the keyboard and all pixels outside those masks come directly from the final neutral scene. The local mask includes some knuckle/skin texture, so it is not a mathematically isolated single-index-finger deformation.

Desktop registration needed no translation. Portrait sampling used a 1 px horizontal and vertical correction. No full-scene transform was applied to the delivered scene or animation canvas.

`prepare-assets.cjs` reproduces the six final PNGs from `sources/`. `validate-assets.cjs` writes `validation.json` and checks:

- All six exact requested dimensions.
- Every measured screen-interior pixel equals **RGB(24,25,27)**.
- Exact-color screen region found by eight-connected flood fill.
- **Zero animation pixel changes outside each hands rectangle and outside its finger mask.**
- **Zero pure-black or pure-white pixels** in all six final images.

The original generated/upsampled images contained a few isolated pure black or white pixels. These were mapped to dark ink RGB(12,13,15) or cream RGB(251,243,221) before compositing. Bezel, color texture and screen fill remain intact.

## Visual self-check and remaining imperfections

All six final images were opened at original detail; hands and screen edges were also inspected in full-resolution crops.

- **Monitor direction:** pass. Both screens face the sitter and are clearly visible from the rear shoulder camera, in front of the window.
- **Keyboard:** pass visually. Directly below/in front of the monitor, between body and screen, with corresponding perspective and receding rows. This is painted perspective, not a calibrated 3D projection.
- **Anatomy and objects:** both hands contact the keys with plausible connected arms; the far forearm is partly hidden by the body/near arm. One office chair, no mouse. Both dumbbells remain visible.
- **Screen/content:** exact flat screen verified. No moon, readable text, lettering, logos, UI, signature or watermark found on visual inspection. Tiny pigment flecks remain on some portrait book spines; they do not form readable text.
- **Reserved areas:** the measured lower-left wood rectangles and both book tops are empty.
- **Style:** substantially closer to the soft anime watercolor mascot after refinement. The new figure is still a little more mature and the ink/pigment treatment crisper than the original model sheet.
- **Placement differences:** the desktop pedestal is higher than the suggested guide and its far-right edge reaches the canvas boundary. Its measured pot footprint is fully visible. The portrait desk sits roughly across the 51–66% vertical band, higher than the requested 55–72% guide; use its actual clear-wood rectangle. The portrait monitor lies about x=15–56%, y=40–51%.
- **Window:** the trees rise higher into the panes, and the star field is denser, than the requested low treetop band/few stars. The safe-sky polygons avoid the trees. Desktop heading space remains calm and dark.
- **Animation:** desktop finger travel is more pronounced than the requested few-pixel press/lift, and some neighboring knuckle texture changes inside the masks. Portrait motion is smaller. Registration and unchanged wrists/arms/background are exact. The native generations were not full requested resolution; their Lanczos-upscaled detail should not be mistaken for native 2560 px detail.

## Exact prompts

Each prompt below is the verbatim string sent to the image tool. All calls used `transparent_background:false`. Fresh generations omitted both image-reference arguments; the explicit edit references are identified in the lineage above. No hidden model or quality parameters were supplied.

### prompt-desktop.txt

```text
Use case: stylized-concept. Asset type: final painted background plate for a cozy night coding website section. Produce one extraordinarily carefully drawn, highest-detail finished raster painting, landscape 16:9, ideally 2560 x 1440 pixels.

Create a COMPLETELY NEW room composition from scratch. The earlier night-shift desktop/mobile images and mascot model sheet visible in this conversation are STYLE / OBJECT / CHARACTER references ONLY. Do NOT preserve their camera, desk geometry or monitor angle; those are wrong. Match their watercolor pigment granulation, soft ink outlines, warm butter #FCD772 lamp light, cream #FBF3DD highlights, blue-charcoal anthracite #18191B night, muted olive leaves, warm ochre wood, and soft anime watercolor mascot proportions.

CAMERA AND PHYSICS: a classic over-the-shoulder lofi desk shot. Camera slightly elevated BEHIND AND TO THE RIGHT of a man seated at a desk facing a large window. We look past his right shoulder along his viewing direction toward the monitor. The man occupies the right foreground, torso and back seen in three-quarter REAR view; mainly the back of his head with just a sliver of ear, cheek, nose tip and stubble. Short messy dark-brown hair, black t-shirt, dark over-ear headphones, calm and friendly. Exactly ONE dark upholstered office chair, behind his back in the right foreground. His chest faces away from us toward the monitor. Do not turn his chest or full face toward the camera.

The large wooden-framed window is center-left in the upper half, with 2 or 3 clear glass panes and a wooden mullion. Dark anthracite / blue-charcoal sky, just a few small stars and a low band of dark treetops at the bottom of the glass. NO MOON. Keep the top-left 30 percent of image width by 20 percent of image height calm and dark for a heading overlay, but paint NO text.

On the desk, IN FRONT OF and overlapping the lower portion of the window, stands a large widescreen monitor with a clearly visible bezel and stand. Inner display spans about 25 percent of image width, approximately x=32–58 percent, y=43–67 percent. Display faces the man and is seen mostly frontally from our over-shoulder camera, only a slight 10–20 degree perspective turn. The display is an EMPTY, PERFECTLY UNIFORM FLAT dark anthracite #18191B quadrilateral. No content, reflection, glare, gradients or paper texture inside the display; retain painted texture on the bezel.

A physical keyboard sits on the desk DIRECTLY IN FRONT OF and centered on the monitor, BETWEEN the man and the monitor, its long edges PARALLEL to the monitor bottom edge in the same slight perspective turn. The keys have no lettering. Rows recede away from camera and toward monitor. BOTH forearms visibly connect to his shoulders and extend forward toward the keyboard. BOTH hands rest naturally on the keys, anatomically correct distinct fingers; wrists on the near edge, fingertips pointing away toward the monitor. No floating or disconnected hands. Screen, keyboard and seated body must form a convincing single workstation.

OTHER OBJECTS, strict list:
- Angled black desk lamp at far left, warm glowing butter shade opening, mostly outside window glass.
- Cream coffee mug on a coaster LEFT of monitor, no steam.
- Lower-left desktop foreground, x=5–24%, y=76–88%, CLEAR EMPTY PLAIN WOOD, reserved for a handheld console composited later. Do not paint a console.
- One low CLOSED book at far RIGHT of desk, x=85–98%, clear empty visible horizontal top, reserved as a bonsai pedestal. Leave room above it. Do NOT paint any bonsai.
- Wall shelf in upper right with blank-spined books/manga and a trailing muted olive houseplant. No lettering or spine symbols.
- TWO separate dumbbells visible at lower right on floor or below desk edge.
- No other objects are necessary.

Fill the whole canvas as a beautiful coherent painting. Prioritize correct perspective, clear screen, connected arms and credible typing hands. The desk must reach across the lower foreground with the stated empty areas, while the camera remains behind the man, not in front of him. No mouse anywhere. No extra chair. No moon. No text, letters, numbers, logos, UI, watermark, signature, arrows, labels, or pure black or pure white.
```

### prompt-desktop-02.txt

```text
Use case: stylized-concept. Asset type: final painted background plate for a cozy night coding website section. Produce one extraordinarily carefully drawn, highest-detail finished raster painting, landscape 16:9, ideally 2560 x 1440 pixels.

Create a COMPLETELY NEW room composition from scratch. The earlier night-shift desktop/mobile images and mascot model sheet visible in this conversation are STYLE / OBJECT / CHARACTER references ONLY. Do NOT preserve their camera, desk geometry or monitor angle; those are wrong. Match their watercolor pigment granulation, soft ink outlines, warm butter #FCD772 lamp light, cream #FBF3DD highlights, blue-charcoal anthracite #18191B night, muted olive leaves, warm ochre wood, and soft anime watercolor mascot proportions.

CAMERA AND PHYSICS: a classic over-the-shoulder lofi desk shot. Camera slightly elevated BEHIND AND TO THE RIGHT of a man seated at a desk facing a large window. We look past his right shoulder along his viewing direction toward the monitor. The man occupies the right foreground, torso and back seen in three-quarter REAR view; mainly the back of his head with just a sliver of ear, cheek, nose tip and stubble. Short messy dark-brown hair, black t-shirt, dark over-ear headphones, calm and friendly. Exactly ONE dark upholstered office chair, behind his back in the right foreground. His chest faces away from us toward the monitor. Do not turn his chest or full face toward the camera.

The large wooden-framed window is center-left in the upper half, with 2 or 3 clear glass panes and a wooden mullion. Dark anthracite / blue-charcoal sky, just a few small stars and a low band of dark treetops at the bottom of the glass. NO MOON. Keep the top-left 30 percent of image width by 20 percent of image height calm and dark for a heading overlay, but paint NO text.

On the desk, IN FRONT OF and overlapping the lower portion of the window, stands a large widescreen monitor with a clearly visible bezel and stand. Inner display spans about 25 percent of image width, approximately x=32–58 percent, y=43–67 percent. Display faces the man and is seen mostly frontally from our over-shoulder camera, only a slight 10–20 degree perspective turn. The display is an EMPTY, PERFECTLY UNIFORM FLAT dark anthracite #18191B quadrilateral. No content, reflection, glare, gradients or paper texture inside the display; retain painted texture on the bezel.

A physical keyboard sits on the desk DIRECTLY IN FRONT OF and centered on the monitor, BETWEEN the man and the monitor, its long edges PARALLEL to the monitor bottom edge in the same slight perspective turn. The keys have no lettering. Rows recede away from camera and toward monitor. BOTH forearms visibly connect to his shoulders and extend forward toward the keyboard. BOTH hands rest naturally on the keys, anatomically correct distinct fingers; wrists on the near edge, fingertips pointing away toward the monitor. No floating or disconnected hands. Screen, keyboard and seated body must form a convincing single workstation.

OTHER OBJECTS, strict list:
- Angled black desk lamp at far left, warm glowing butter shade opening, mostly outside window glass.
- Cream coffee mug on a coaster LEFT of monitor, no steam.
- Lower-left desktop foreground, x=5–24%, y=76–88%, CLEAR EMPTY PLAIN WOOD, reserved for a handheld console composited later. Do not paint a console.
- One low CLOSED book at far RIGHT of desk, x=85–98%, clear empty visible horizontal top, reserved as a bonsai pedestal. Leave room above it. Do NOT paint any bonsai.
- Wall shelf in upper right with blank-spined books/manga and a trailing muted olive houseplant. No lettering or spine symbols.
- TWO separate dumbbells visible at lower right on floor or below desk edge.
- No other objects are necessary.

Fill the whole canvas as a beautiful coherent painting. Prioritize correct perspective, clear screen, connected arms and credible typing hands. The desk must reach across the lower foreground with the stated empty areas, while the camera remains behind the man, not in front of him. No mouse anywhere. No extra chair. No moon. No text, letters, numbers, logos, UI, watermark, signature, arrows, labels, or pure black or pure white.

IMPORTANT refinements for this fresh painting: the mascot must be SOFT ANIME WATERCOLOR, like the model sheet: compact youthful adult proportions, rounded head, simplified soft friendly features, short spiky dark-brown hair, smooth forearms, light simplified stubble. NOT realistic detailed hairy hands or a realistic adult portrait. Absolutely no potted plant on desk; ONLY the trailing plant on the upper-right wall shelf. All books have PURELY BLANK spines without even faint label rectangles, lines or glyphs. The monitor's inner width is 25 percent of total image width, NOT 33 percent. Position it center-left without overlapping the man's head or shoulder. His head should be small enough and high/right enough that the entire clean screen and bezel remain exposed. His BOTH hands should be fully exposed and easily countable on a keyboard aimed toward the screen. Give the lamp a visible articulated arm and stable base at far left. Have the far-right pedestal book at about y=75% with empty wall behind it and its whole top visible. Keep both dumbbells fully inside the frame. Preserve the over-the-shoulder camera that makes the monitor face him correctly.
```

### prompt-desktop-03.txt

```text
Use case: identity-preserve / precise-object-edit. Image 1 is the NEW over-the-shoulder desktop composition to refine (not the old failed room). Image 2 is the approved mascot MODEL SHEET, a character identity and illustration style reference. Make a finished 16:9 painted plate, target 2560x1440. Preserve image 1's physically correct over-the-right-shoulder camera, room and desk structure, clear empty lower-left wood, full unobstructed monitor facing the seated man, centered parallel keyboard and both hands on keys, lamp at left, mug to left of screen, one chair, blank manga shelf with trailing plant, and empty far-right pedestal book. Transfer the model-sheet mascot's SOFT ANIME WATERCOLOR identity to the seated figure: compact adult mascot body, a slightly proportionally larger rounded head, simplified inked features, short messy spiky dark brown hair, black tee, light simplified stubble, headphones, unhairy simplified forearms and natural distinct fingers. Keep his three-quarter REAR view and calm sliver of nose/cheek profile. Do not show his full face or chest to camera.
Three composition corrections: (1) inner screen should be only 25–26% of total image width, reduce the screen/monitor in width about 12% while keeping it centered on the keyboard, with its height reduced proportionally; keep all of its bezel visible and the inner display a uniform flat #18191B quadrilateral. (2) BOTH separate dumbbells must be wholly inside the lower-right floor area with a clear gap from the frame edges; shift them left as needed and allow floor space. (3) the pedestal book at far right must be wholly inside the frame and its top clear, with empty wall above for a future bonsai. Leave no printed labels, lettering or markings on any book or device. Warm butter light #FCD772, cream #FBF3DD, anthracite #18191B, warm ochre wood, muted olive; finely granulated watercolor paper and soft ink outlines matching reference 2 and existing solo-stack art. No extra objects, no mouse, no moon, no steam, no bonsai, no handheld console, no text/logos/signatures/watermark anywhere.
```

### prompt-mobile.txt

```text
Use case: stylized-concept. Paint a NEW true PORTRAIT 6:13 composition, ideally 1080x2340. This is a mobile companion to the just-approved new desktop over-the-shoulder scene. SAME room, SAME soft anime watercolor mascot with short messy dark-brown hair, light stubble, black t-shirt and dark over-ear headphones, SAME watercolor pigment granulation with ink outlines, warm butter #FCD772 lamplight, cream #FBF3DD, blue-charcoal anthracite #18191B night, ochre wood and olive plant. Recompose for tall portrait, do NOT crop the desktop or put a landscape painting inside a portrait border.

Camera slightly elevated behind and to the RIGHT of the seated man, looking forward past his right shoulder. Man sits in ONE dark upholstered office chair on right, back and back of head facing us; just a lost profile/sliver of nose, ear, cheek and stubble as he faces monitor. Compact soft anime mascot, slightly large rounded head, simplified young adult proportions, friendly focused; NOT photorealistic.

PORTRAIT LAYOUT:
A tall large wooden-framed window fills the TOP and center-left of image with two clear glass panes and a vertical mullion. Dark blue-charcoal night sky with a FEW small stars, treetops along bottom, NO MOON. Quiet dark breathing room near the very top.
A wide monitor stands ON the desk IN FRONT OF the lower part of the window. It faces the seated man and is mostly FRONTALLY VISIBLE from our over-shoulder camera, just a 10–20 degree turn. Monitor inner screen roughly x=8–58%, y=38–55%, at least 40% of total image width; large usable clear unobstructed quadrilateral. Entire clean bezel and stand visible. Inner screen PERFECTLY FLAT UNIFORM #18191B, no content/glare/reflections/texture.
Wooden DESK stretches across middle-lower area around y=55–72%. A physical keyboard directly in front of and CENTERED on the monitor, between man and monitor. Keyboard long edge parallel to monitor bottom edge; its rows recede toward monitor. BOTH forearms connect naturally back to his shoulders and BOTH hands on the keys, wrists toward body, fingertips toward monitor. Anatomically correct separate fingers; blank keycaps. Keep hands exposed, no floating hands.
Man on right around x=54–90%, head near y=40–49%; no head/shoulder covering monitor. Back of his single dark office chair in lower right; chair base with wheels visible on floor beneath desk, y=76–90%.
Black angled lamp at far LEFT with visible jointed arm/base, warm glowing butter shade, not blocking much window.
Cream coffee mug on coaster to LEFT of monitor, no steam.
Clear EMPTY PLAIN WOOD space in lower-left of desktop surface, about x=5–30%, y=65–71%, for a separately composited handheld. DO NOT paint handheld.
One LOW CLOSED BOOK at far RIGHT end of desk, x=85–98%, y≈62%, clear exposed empty top and room above for a future bonsai. DO NOT paint bonsai or any desk plant.
Upper-right wall shelf with completely BLANK book/manga spines, no label shapes or glyphs, and one trailing olive houseplant. Keep off window glass.
TWO separate dumbbells visible WHOLLY INSIDE frame on floor lower-right near y=92%, not cropped by canvas edge.
No other objects.

Most important: proper over-the-shoulder workstation geometry, screen and keyboard both facing man, BOTH hands typing. Large screen usable for live code overlay later. Draw no code or UI now. The portrait must show this same cozy room with compelling vertical composition, not stretch/crop desktop. Paint all the way to canvas edges. NO mouse, NO moon, NO steam, NO extra chair, NO text/letters/numbers/logos/watermarks/signatures/arrows/labels, no pure black or pure white.
```

### prompt-mobile-02.txt

```text
Use case: precise-object-edit. Image 1 is a NEW portrait painting of the correct room, to improve composition. Image 2 is the approved new desktop companion for consistent style/identity. Make a true 6:13 portrait finished plate, 1080x2340 if possible, without borders. Preserve this room, same compact soft anime watercolor mascot, same night palette, same warm watercolor paper/ink, and same elevated over-the-right-shoulder camera.
Correct these composition details:
- Move the man's head and chair slightly right and reduce the seated figure/large chair by about 10% so his hair and shoulder NEVER overlap the monitor bezel or display. Show a tiny nose/cheek/stubble profile; keep mainly rear view, no looking at camera. One chair only.
- Put the monitor display at x=8–58%, y=38–55% of the portrait. Entire unobstructed bezel visible, dark blank #18191B screen, screen width ≥40% of portrait width. Monitor faces man, nearly frontally visible to camera, slight perspective.
- Deepen the desktop toward the bottom so the DESKTOP SURFACE ends near y=70%, with a generous clear empty wood foreground at x=5–30%, y=64–70%. Keep the monitor and keyboard centered on each other. BOTH hands on blank keys, arms attached, rows receding toward monitor.
- Put a low CLOSED BOOK at the far-right desk edge x=85–98%, y=60–63%, with WHOLE TOP visible and empty. This requires a little right desk wing visible beside the seated man. Keep empty wall above the book for a later bonsai overlay.
- Fit BOTH dumbbells completely inside the lower-right floor, with margins at right and bottom. No cropping of any dumbbell. Chair base clearly visible below desktop.
- Keep cream mug/coaster at left and articulated black warm glowing lamp at far left. Keep tall window with two visible panes top/left and blank-spined manga/trailing plant shelf upper-right. All book spines completely blank, no label marks or lines or glyphs.
No new objects. No mouse. No moon. No steam, no handheld, no bonsai. No text, code, lettering, numbers, UI, watermark, signature or logos anywhere. The actual painting must occupy entire portrait canvas and be recomposed, not cropped or stretched. Preserve physical logic of the over-the-shoulder workstation: screen faces man, both forearms reach forward from his torso to the keyboard, keyboard parallel with monitor bottom edge.
```

### prompt-mobile-03.txt

```text
Use case: precise-object-edit. Refine this NEW portrait painting, keeping the same room, same mascot identity and accurate over-the-right-shoulder view, style, night colors and exactly one chair. Output a 6:13 portrait.
Make the scene objects a bit lower in the portrait: move monitor and desk workstation DOWN approximately 6% of total image height, retaining proportions. Move monitor LEFT by approximately 6% of total image width, so it spans about x=10–53%, y=41–54%. Keep keyboard directly centered on and parallel to monitor bottom, between man and monitor, and both anatomically correct hands reaching the keyboard. Both arms must connect to his shoulders. The desk surface's front edge at left should finish near y=70%, leaving plain empty wood at x=5–30%, y=64–69%. Adjust man's upper body and hands naturally to the slightly lowered desk; keep rear view, lost profile, black t-shirt, headphones, soft anime mascot.
The low CLOSED pedestal book must be fully INSIDE the canvas (currently its right edge is cropped). Move the book left enough to fit at x=85–98% and forward on the RIGHT desk wing so its top is visible around y=56–60%, beside the man, with open wall space above. The book has a clean empty top and NO plant. Keep the two separate dumbbells wholly in frame near the bottom, and keep chair base visible. Keep lamp and coffee on left.
Remove EVERY faint spine marking from shelf books. Spines must be simple solid watercolor areas, with no dashes, dots, letters, numbers, circles or labels. Keep the existing shelf plant. Keep upper glass panes clear of moon, monitor display uniform empty #18191B with no glare/texture/content, no mouse, no extra objects, no steam, no handheld, no bonsai, no text/logos/signatures/watermarks anywhere. Do not add borders.
```

### prompt-hands-desktop-02.txt

```text
Use case: precise-object-edit. This is final desktop scene.png, 2560x1440. Produce typing animation BEAT 2 as a LOCALIZED edit, output the same full canvas and composition, perfectly registered. Change ONLY fingertips in the tight hands rectangle x=1018,y=936,width=402,height=170 on the 2560x1440 canvas. The near hand (left on image) presses its index finger down onto a key while the other hand lifts its index fingertip slightly, only about 3–5 pixels at final size. All fingers remain natural and distinct, subtle typing, not pointing. Wrists, palms, forearms, shoulders, face, body, keyboard, keys, desk, light, window, books, coffee, chair, objects and every other pixel MUST stay identical. The uniform #18191B empty screen remains exactly blank. Keep the existing watercolor texture unchanged. No added marks/text. Do not move either hand as a whole. This is a tiny finger-motion animation edit, not a repaint.
```

### prompt-hands-desktop-03.txt

```text
Use case: precise-object-edit. This is final desktop scene.png, 2560x1440. Produce typing animation BEAT 3 as a LOCALIZED edit, output the same full canvas and composition, perfectly registered. Change ONLY fingertips in the tight hands rectangle x=1018,y=936,width=402,height=170 on the 2560x1440 canvas. The far hand (right on image) presses its index finger down onto a key while the near hand (left on image) lifts its index fingertip slightly, only about 3–5 pixels at final size. This is the OPPOSITE keystroke phase to beat 2; work from the supplied neutral original. All fingers remain natural and distinct, subtle typing, not pointing. Wrists, palms, forearms, shoulders, face, body, keyboard, keys, desk, light, window, books, coffee, chair, objects and every other pixel MUST stay identical. The uniform #18191B empty screen remains exactly blank. Keep the existing watercolor texture unchanged. No added marks/text. Do not move either hand as a whole. This is a tiny finger-motion animation edit, not a repaint.
```

### prompt-hands-mobile-02.txt

```text
Use case: precise-object-edit. This is final portrait scene-mobile.png, 1080x2340. Produce typing animation BEAT 2 as a LOCALIZED edit, output the same full portrait canvas and composition, perfectly registered. Change ONLY fingertips inside the tight hands rectangle x=388,y=1232,width=216,height=113 on the 1080x2340 canvas. The near hand (left on image) presses its index finger onto a key while the far hand (right on image) lifts its index fingertip only 2–4 pixels at final size. Subtle alternating typing, distinct natural fingers, not pointing. Wrists, palms, forearms, shoulders, head, body, keyboard, keys, desk, lamp, coffee, screen, window, books, chair, floor and every other pixel MUST remain identical. Uniform #18191B empty monitor remains blank. Keep existing watercolor grain unchanged. No added text, no objects. Do not translate the hands or move the wrists. Tiny finger animation only, not a repaint.
```

### prompt-hands-mobile-03.txt

```text
Use case: precise-object-edit. This is final portrait scene-mobile.png, 1080x2340. Produce typing animation BEAT 3 as a LOCALIZED edit, output the same full portrait canvas and composition, perfectly registered. Change ONLY fingertips inside the tight hands rectangle x=388,y=1232,width=216,height=113 on the 1080x2340 canvas. The far hand (right on image) presses its index finger onto a key while the near hand (left on image) lifts its index fingertip only 2–4 pixels at final size. This is the OPPOSITE phase from beat 2; use the supplied neutral original. Subtle alternating typing, distinct natural fingers, not pointing. Wrists, palms, forearms, shoulders, head, body, keyboard, keys, desk, lamp, coffee, screen, window, books, chair, floor and every other pixel MUST remain identical. Uniform #18191B empty monitor remains blank. Keep existing watercolor grain unchanged. No added text, no objects. Do not translate the hands or move the wrists. Tiny finger animation only, not a repaint.
```
