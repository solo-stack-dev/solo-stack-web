# Night shift production layers

Seven original painted PNG layers for solo-stack.dev, generated on 2026-11-01 with the built-in image-generation tool and registered for production. No mascot, visitor text, logos, coffee steam, or monitor content is painted into these assets. Exact prompts, references, rejected attempts, and export transforms are recorded in [PROMPTS.md](PROMPTS.md).

## Deliverables

- `nightshift-room.png`: 2560×1440; 9,226,441 bytes (8.80 MiB). Opaque fixed-camera room, moonless window, warm lamp, empty dark monitor, keyboard, notebook, coffee, blank-spined manga, plants, empty chair and floor dumbbells. No bonsai or handheld.
- `nightshift-window-sky.png`: 1100×1100; 2,793,668 bytes (2.66 MiB). Opaque overscan sky, painted moon, sparse stars and trees. Use the pane clips below.
- `nightshift-bonsai.png`: 2560×1440; 301,265 bytes (294.2 KiB). Genuine transparent full-canvas green bonsai and pot, anchored on the right pedestal book.
- `nightshift-bonsai-golden.png`: 2560×1440; 457,518 bytes (446.8 KiB). Genuine transparent full-canvas grown golden canopy and soft glow, at the same pot anchor. The pot pixels are identical to the normal layer.
- `nightshift-handheld.png`: 2560×1440; 145,626 bytes (142.2 KiB). Genuine transparent full-canvas original cream-and-butter asymmetric pebble console, one brass rotary dial and two oval buttons. No recognizable real-product controls, logo, text or screen content.
- `nightshift-foreground.png`: 2560×1440; 131,492 bytes (128.4 KiB). Genuine transparent full-canvas plant leaf edge at the lower left, for subtle additive parallax.
- `nightshift-room-mobile.png`: 1080×2340; 6,162,282 bytes (5.88 MiB). Dedicated portrait repaint of the same room, with empty chair/mascot space and empty monitor. No bonsai, handheld or moon is baked into this base.
- `README.md`: placement, layer ordering, coordinate contract, validation and limitations.
- `PROMPTS.md`: exact generation prompts and deterministic export steps.

The desktop scene uses ONE fixed camera and a common top-left origin. Room, bonsai, golden bonsai, handheld and foreground all export at exactly 2560×1440. Place those layers at (0,0) with identical displayed dimensions; do not independently use `object-fit: cover`. The sky is deliberately a separate oversized square.

## Stacking and motion

1. Opaque room plate.
2. Sky plate over the base window, clipped to the two upper glass panes below. The opaque room already provides a complete moonless static fallback. The sky must be ABOVE the opaque base and BELOW the other props; placing it behind the opaque room will hide it.
3. Separate mascot supplied by the mascot agent, positioned in the reserved seat area. The finished typing sprite needs to respect the painted monitor bezel, coffee and keyboard.
4. Handheld and either normal or golden bonsai. Crossfade the tree states; do not stack both fully opaque. Their pot region is byte-identical from y=1007 downward.
5. Foreground plant edge. The lamp and desk remain painted into the room plate, so they do not move independently.

All desktop layers register without any per-layer layout correction. Shared bonsai pot baseline is y=1090 (75.6944%); center is approximately x=2303 (89.9609%). Green nonzero-alpha bounds are (2060,734)–(2478,1090); golden bounds (2026,683)–(2520,1090). The grown state extends upward and sideways while retaining the same base.

Use only small parallax: sky drift ±8 desktop pixels, foreground ±6 pixels. Freeze transforms and use the normal scene under reduced motion. Do not independently parallax the bonsai away from its book. Coffee steam, screen content, hotspot labels and the typing mascot belong in code/separate assets.

## Coordinate convention

All percentages below are relative to the full artwork canvas, NOT the browser viewport. Origin is top left; x increases right and y increases down. Rectangles are `[left, top, width, height]`. Screen points are clockwise: top left, top right, bottom right, bottom left. Pixel screen coordinates are authoritative; the percentage values are rounded to four decimal places.

Hotspot rectangles are practical art bounds, not painted UI. Increase touch targets to at least 44 CSS pixels in implementation. The bonsai bounds include its grown state. The window button should use the same pane clip to avoid covering the monitor.

## Desktop coordinates — 2560×1440

Monitor inner screen quad, percentages:
`[(23.7891,39.0972), (45.6250,44.3750), (47.6563,65.9722), (25.8203,65.9028)]`.

Monitor inner screen quad, pixels:
`[(609,563), (1168,639), (1220,950), (661,949)]`.
This polygon was filled uniformly with #18191B. Inset live HTML content slightly inside this polygon to preserve the ink bezel.

Mascot seat reservation: `[45,17,36,57]` percent. Suggested head center `(62,34)`, hands/keyboard anchor `(54,72)`. This is a placement envelope for the separate typing illustration, not a solid rectangular mask: keep its head/torso away from the monitor and position its hands at the keyboard. The original chair and desk geometry remain intact.

Hotspot rectangles, percentages:

- Bonsai: `[79,47,20,29]`.
- Handheld: `[5,75,15,13]`.
- Dumbbells: `[72,84,17,13]`.
- Coffee: `[11.5,66,10,13]`.
- Manga shelf: `[76,14,24,22]`.
- Window: `[20.9375,0.7639,22.7344,40.9028]`; clip to the panes below.

Window outer art rectangle, including frame/partially occluded lower panes: approximately `[18.4,0,29.4,58]` percent. The independently animated portion is the two upper glass panes, whose combined rectangle is `[536,11,582,589]` pixels. The 1100×1100 sky comfortably overscans this opening.

Sky placement at rest: `[430,-100,1100,1100]` desktop pixels, or `[16.7969,-6.9444,42.9688,76.3889]` percent of the room canvas. Translate the sky inside a stationary clip; do not move the clip/frame. Clip polygons in desktop pixels:

- Left pane: `[(538,11), (943,106), (942,569), (536,508)]`.
- Right pane: `[(969,113), (1116,153), (1118,600), (968,575)]`.

The same polygons in canvas percentages:

- Left: `[(21.0156,0.7639), (36.8359,7.3611), (36.7969,39.5139), (20.9375,35.2778)]`.
- Right: `[(37.8516,7.8472), (43.5938,10.6250), (43.6719,41.6667), (37.8125,39.9306)]`.

Keep lower glass/tree detail in the base untouched; it is partially occluded by the monitor and lamp. An SVG clipPath with two polygons, expressed in the scene's pixel viewBox, is sufficient.

## Mobile coordinates — 1080×2340

Monitor inner screen quad, percentages:
`[(8.8889,41.6667), (50.7407,44.9573), (54.9074,56.4103), (12.7778,56.3248)]`.

Monitor inner screen quad, pixels:
`[(96,975), (548,1052), (593,1320), (138,1318)]`.
This polygon is uniformly #18191B.

Mascot seat reservation: `[47,34,46,27]` percent. Suggested head center `(67,43)`, hands/keyboard anchor `(55,60.5)`. The monitor is left of the head and torso; the hand layer may reach toward the keyboard.

Reuse the desktop transparent props with these exact affine mappings from desktop pixels to mobile pixels; do not scale the whole desktop room:

- Bonsai and golden bonsai: `xMobile = 0.6*xDesktop - 435`, `yMobile = 0.6*yDesktop + 855`. Equivalently draw the full 2560×1440 PNG into mobile rectangle `[-435,855,1536,864]`. Both states use the SAME transform. Pot baseline becomes y=1509 (64.4872%).
- Handheld: `xMobile = 0.8*xDesktop + 40`, `yMobile = 0.8*yDesktop + 650`. Draw the full PNG into `[40,650,2048,1152]`.
- Foreground leaf edge is optional on mobile. If used, map with `xMobile = 0.8*xDesktop`, `yMobile = 0.8*yDesktop + 1188`, yielding a lower-left edge. Mobile review used no foreground overlay.
- Clip the composition to the 1080×2340 canvas.

Hotspot rectangles, percentages, after the above transforms:

- Bonsai: `[72,54,28,11]`.
- Handheld: `[13,64.5,28,7]`.
- Dumbbells: `[56,85.5,44,10.5]`.
- Coffee: `[5,58.5,18,6.5]`.
- Manga shelf: `[67,18,33,11]`.
- Window: `[4.2593,0,40.1852,29.9145]`; clip to the panes below.

Window outer art rectangle, including frame/lower occluded panes: approximately `[0,0,49,44]` percent. Upper glass combined rectangle: `[46,0,434,700]` pixels.

Sky placement at rest: draw the 1100×1100 source into `[-65,10,800,800]` mobile pixels, or `[-6.0185,0.4274,74.0741,34.1880]` percent. Mobile clip polygons in pixels:

- Left pane: `[(46,0), (76,0), (349,133), (349,663), (46,586)]`.
- Right pane: `[(371,145), (480,197), (480,700), (371,672)]`.

The same polygons in canvas percentages:

- Left: `[(4.2593,0), (7.0370,0), (32.3148,5.6838), (32.3148,28.3333), (4.2593,25.0427)]`.
- Right: `[(34.3519,6.1966), (44.4444,8.4188), (44.4444,29.9145), (34.3519,28.7179)]`.

## Validation and production notes

- Inspected every generated asset and the final individual exports, plus desktop normal/golden composites and the mobile composite with the documented sky/prop placements.
- All seven PNGs have the required final dimensions. All four object layers have real transparent pixels and preserved soft alpha. No #00FF00 fallback was necessary.
- Room, mobile and sky are fully opaque. Visible pixels contain no exact pure black or pure white after palette cleanup.
- Monitor interiors are flat #18191B; book spines, keyboard keys, screens and props have no text or letters. No mascot is present.
- Golden/normal pot comparison: zero differing RGBA pixels over all rows y=1007–1439. Canopy/branch pixels intentionally differ between states; this is a crossfade pair, not a frame-by-frame growth animation.
- Foreground visible bounds: (0,1245)–(255,1439). Handheld visible bounds: (132,1088)–(494,1262).
- The generator returned smaller native rasters despite requested output sizes. These are normalized PNG masters, not native 2560-pixel generation; source dimensions and export transforms are disclosed in PROMPTS.md.
- No requested layer remains missing or unusable. The sky requires the documented clip; the mobile props require the documented transforms. The room is intentionally a combined furniture/background plate, not independently movable lamp, chair, desk and book cutouts.
- These are large source masters outside the website bundle. Create optimized AVIF/WebP imports in the implementation task and respect the section download budget. No application code, dependencies, other art folders, deployment or push was changed by this task.
