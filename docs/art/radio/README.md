# Radio production layers

Original watercolor and ink illustrations for the 02:00 scene. No mascot, text, numbers or logos are baked in. All cutouts use genuine alpha; no green-screen fallback was needed. These are source PNGs outside the application bundle. Optimize responsive AVIF/WebP derivatives during implementation; do not serve these large PNGs directly.

## Files

- `radio-landscape.png`: **2560×1440 px**, 8,151,428 bytes; opaque RGB. Native generation: 1672×941 px.
- `radio-landscape-mobile.png`: **1080×2340 px**, 5,817,996 bytes; opaque RGB. Native generation: 852×1846 px.
- `radio-body.png`: **2000×1200 px**, 4,220,892 bytes; RGBA, genuine transparency. Native generation: 1619×971 px.
- `radio-needle.png`: **32×640 px**, 33,648 bytes; RGBA, genuine transparency. Native generation: 793×1983 px.
- `radio-key.png`: **128×112 px**, 32,013 bytes; RGBA, genuine transparency. Native generation: 1254×1254 px.
- `radio-knob.png`: **256×256 px**, 142,238 bytes; RGBA, genuine transparency. Native generation: 1254×1254 px.
- `radio-key-pressed.png`: **128×112 px**, 32,722 bytes; RGBA, genuine transparency. Native generation: 1254×1254 px.

- `PROMPTS.md`: exact generation and refinement prompts, ordered references, selected source IDs and export steps.
- `README.md`: this placement and integration contract.

## Coordinates and controls

All rects are **(x, y, width, height)** in the final PNG's pixel coordinates, top-left origin, right/bottom exclusive. Multiply every body-space coordinate by the same display scale. The body canvas is 2000×1200, including transparent margins.

- Dial glass interior bounds: **(650, 315, 1148, 380)**. The charcoal glass is painted into the body and is intentionally opaque; put live station content above it.
- Conservative dial HTML safe rect: **(720, 350, 1020, 300)**. This avoids the strongest painted edge reflections.
- Preset slot 1 dark interior: **(840, 802, 101, 90)**.
- Preset slot 2 dark interior: **(962, 802, 100, 90)**.
- Preset slot 3 dark interior: **(1086, 802, 104, 90)**.
- Preset slot 4 dark interior: **(1213, 802, 103, 90)**.
- Preset slot 5 dark interior: **(1341, 802, 104, 90)**.
- Preset slot 6 dark interior: **(1470, 802, 108, 90)**.
- Slots have subtly irregular hand-painted outlines. Above rects are measured interior placement boxes, not their outer cream bezels. Fit the whole 128×112 key PNG into each box. Both key states use identical canvas registration. The six-key assembly was visually checked.
- Key label safe rect in either 128×112 source: **(24, 31, 80, 45)**. Add logos and labels in code, within this shared area.
- Knob overlay boxes on body: left **(608, 750, 190, 190)**, right **(1638, 750, 190, 190)**. Use the complete 256×256 knob image, rotation origin 50% 50%. The body already contains blank knobs for a complete static state; overlays cover them.
- Needle: place its complete 32×640 image at height **330** and width **16.5**, top **342** in body space. Animate its center x between **740 and 1710**, clipping inside the glass. Keep active station copy out of its track.

## Scene positions and z order

Suggested starting placements, to be tuned with the live page copy. All screen-space coordinates refer to the matching landscape canvas. Scale the body and all controls together; never recrop the body independently from its overlays.

1. **z 0:** landscape, full 2560×1440 on desktop or 1080×2340 on mobile. Moon and stars are baked into each plate.
2. **z 1:** code-drawn waveform behind radio. Desktop empty mist safe band **(0, 700, 2560, 95)**, baseline y=748. Mobile mist safe band **(0, 880, 1080, 140)**, baseline y=950. The mobile generation placed this band somewhat above the exact midpoint; use the measured band instead of assuming 50%.
3. **z 2:** radio body. Desktop initial box **(480, 350, 1600, 960)**, scale 0.8. Mobile initial box **(0, 1220, 1080, 648)**, scale 0.54. Transparent lower padding means the visible feet end above the bottom of these boxes; both placements land them on the painted rock.
4. **z 3:** live dial content, needle, keys and two knob overlays in body coordinates.
5. **z 4:** live labels, focus indicators and accessible controls.

Mobile keys become visually small when the complete radio is scaled down. Keep keyboard controls and a plain station-link list in HTML; enlarge transparent interaction targets without changing painted geometry. Reduced motion uses a static needle and waveform, with no pulsing stars.

## Inspection and limitations

Every selected generation and final export was visually inspected, including all six keys composited into the final body. The radio is watercolor/ink with painted cream and ochre surfaces, not a photographic wooden radio. The desktop landscape was regenerated to remove tree tips that intruded into the full-width waveform band.

All seven requested layers were produced. The built-in generator returned smaller backgrounds/body than requested, so the delivery canvases are resampled rather than native-resolution 2560/2000px paintings. Exact native sizes appear above. The pressed key preserves registration but has a slightly different watercolor wash, appropriate to the changed shading. No application files or visitor-facing copy were changed.

Final palette audit: exact opaque/visible RGB black pixels were replaced with night #18191B, and exact RGB white pixels with cream #FBF3DD. The generated painting otherwise retains its palette; transparency was preserved.
