# Sunrise production layers

Six original watercolor and ink PNG layers for the 06:00 footer. Generated with the built-in image tool using the approved references; exact prompts, rejected-attempt notes and export processing are in [PROMPTS.md](PROMPTS.md). No text, mascot or baked coffee steam. Transparent assets contain real alpha, not a matte or green screen.

## Layer use

- **sunrise-sky.png**: opaque desktop background. One low sun at roughly 79% width, 68% height; warm horizontal haze and pigment paper. Bottom band is exactly #FCD772 for a seamless CSS background endpoint.
- **sunrise-sky-mobile.png**: separately generated portrait composition, not a crop. Sun approximately 78% width, 50% height. Same exact butter endpoint.
- **sunrise-night-edge.png**: attach to the top, above all scenery; scroll upward to reveal the sky. Top is opaque, ragged lower pigment has graded alpha, bottom is empty. A few last stars are baked into the wash.
- **sunrise-valley.png**: distant hills and pine forests, transparent above the skyline. Warm glow but no second sun disc. Lower alpha fades into butter paper. Place behind the path, aligned so the sky sun peeks above the right valley opening.
- **sunrise-cliff-path.png**: transparent foreground with a continuous left-to-right descending walking surface. Use as a separate foreground layer; adjust character foot positions to the visible path. No character is supplied here.
- **sunrise-coffee.png**: complete cream mug and small rock, no steam. Anchor the bottom of the rock to the left path. Animate steam separately in code.

## Assembly reference

A visually inspected 2560×1440 composition used these boxes (x, y, width, height), in painting order: sky (0,0,2560,1440), valley (0,600,2560,750), path (0,920,2560,400), coffee (95,860,220,220), night edge (0,0,2560,450). These are integration starting points, not a required fixed layout. The landscape intentionally overlaps, with cream/butter paper still visible below the foreground for footer links. Keep text live in HTML.

For mobile use the portrait sky and crop/reposition the landscape layers independently, retaining the right sun and the left coffee. The sun is baked into each requested sky plate; an independent sun animation would require a separate sun layer. Translating the sky slightly is possible with overscan. With reduced motion, hide the retreating night layer and use a static finished sunrise.

## Delivery sizes

- `sunrise-sky.png`: 2560×1440, RGB, **4,034,561 bytes**; generated native 1672×941.
- `sunrise-sky-mobile.png`: 1080×2340, RGB, **3,024,033 bytes**; generated native 853×1844.
- `sunrise-night-edge.png`: 2560×1000, RGBA, **2,104,377 bytes**; generated native 2006×784.
- `sunrise-valley.png`: 2560×900, RGBA, **3,038,077 bytes**; generated native 2117×743.
- `sunrise-cliff-path.png`: 2560×600, RGBA, **1,607,413 bytes**; generated native 1983×793.
- `sunrise-coffee.png`: 600×600, RGBA, **393,325 bytes**; generated native 1254×1254.

Large delivery masters were Lanczos-resampled from the listed native generation sizes; requested pixel dimensions do not imply native generated detail. Thin strip canvases were cropped/resampled for their production aspect ratios. These PNGs are source masters outside the runtime bundle; generate responsive AVIF/WebP derivatives during implementation.

Quality checks: every image visually inspected, exact dimensions verified, alpha checked on light/dark backgrounds, no text/mascot, no dependency installation. All requested layers were produced cleanly; no missing assets.

## sunrise-laptop.png

- **sunrise-laptop.png**: closed generic anthracite/dusk aluminium laptop lying flat after the night shift, painted to match `sunrise-coffee.png`. Fine ink seam, mottled watercolor lid, butter/ochre sunlight from upper right, short translucent dark contact shadow falling left. No logo, text, ground patch, rock, cup or character. Place above the cliff path beside the existing coffee; keep the same pixel-to-scene scale for both masters.
- `sunrise-laptop.png`: 1200×600, RGBA, **433,487 bytes**; generated native 1774×887. Lanczos3-resampled to 1114×557, then transparently padded to the delivery size; no subject cropping. PNG compression level 9, graded alpha preserved, alpha < 3 → 0, no exact black/white.
- Placement coordinates (zero-based from the master top left): front-bottom ground-contact anchor **(882, 500)**, visual horizontal center **x=596**. The body is approximately 950 px wide, versus the coffee mug's approximately 370 px including handle. The anchor is the rounded front-right body contact, not the shadow's lowest pixel; the soft shadow extends to y=513.
- QA: inspected on #FCD772 and #18191B and beside the coffee at 1:1 master scale on a cliff-path crop. Dimensions, full transparent padding, alpha range 0–255 and absence of exact black/white verified. First attempt rejected for a tan ground halo on dark; corrected generation passes. Temporary composites are outside the repository in `C:/Users/peter/AppData/Local/Temp/sunrise-laptop-qa-X6xK4f/` (`laptop-butter.png`, `laptop-night.png`, `laptop-coffee-path.png`). Full prompts and export details are appended in [PROMPTS.md](PROMPTS.md).
