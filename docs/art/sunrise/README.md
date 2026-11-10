# Sunrise production layers

Six original watercolor and ink PNG layers for the 06:00 footer. Generated with the built-in image tool using the approved references; exact prompts, rejected-attempt notes and export processing are in [PROMPTS.md](PROMPTS.md). No text, mascot or baked coffee steam. Transparent assets contain real alpha, not a matte or green screen.

## Layer use

- **sunrise-sky.png**: opaque desktop background. One low sun at roughly 79% width, 68% height; warm horizontal haze and pigment paper. Bottom band is exactly #FCD772 for a seamless CSS background endpoint.
- **sunrise-sky-mobile.png**: separately generated portrait composition, not a crop. Sun approximately 78% width, 50% height. Same exact butter endpoint.
- **sunrise-night-edge.png** (retired): the painted night edge was replaced by the CSS ink-wash wipe (docs/art/transitions); master and asset were removed, see git history.
- **sunrise-valley.png**: distant hills and pine forests, transparent above the skyline. Warm glow but no second sun disc. Lower alpha fades into butter paper. Place behind the path, aligned so the sky sun peeks above the right valley opening.
- **sunrise-cliff-path.png**: transparent foreground with a continuous left-to-right descending walking surface. Use as a separate foreground layer; adjust character foot positions to the visible path. No character is supplied here.
- **sunrise-coffee.png**: complete cream mug and small rock, no steam. Anchor the bottom of the rock to the left path. Animate steam separately in code.

## Assembly reference

A visually inspected 2560×1440 composition used these boxes (x, y, width, height), in painting order: sky (0,0,2560,1440), valley (0,600,2560,750), path (0,920,2560,400), coffee (95,860,220,220), night edge (0,0,2560,450). These are integration starting points, not a required fixed layout. The landscape intentionally overlaps, with cream/butter paper still visible below the foreground for footer links. Keep text live in HTML.

For mobile use the portrait sky and crop/reposition the landscape layers independently, retaining the right sun and the left coffee. The sun is baked into each requested sky plate; an independent sun animation would require a separate sun layer. Translating the sky slightly is possible with overscan. With reduced motion, hide the retreating night layer and use a static finished sunrise.

## Delivery sizes

- `sunrise-sky.png`: 2560×1440, RGB, **4,034,561 bytes**; generated native 1672×941.
- `sunrise-sky-mobile.png`: 1080×2340, RGB, **3,024,033 bytes**; generated native 853×1844.
- `sunrise-valley.png`: 2560×900, RGBA, **3,038,077 bytes**; generated native 2117×743.
- `sunrise-cliff-path.png`: 2560×600, RGBA, **1,607,413 bytes**; generated native 1983×793.
- `sunrise-coffee.png`: 600×600, RGBA, **393,325 bytes**; generated native 1254×1254.

Large delivery masters were Lanczos-resampled from the listed native generation sizes; requested pixel dimensions do not imply native generated detail. Thin strip canvases were cropped/resampled for their production aspect ratios. These PNGs are source masters outside the runtime bundle; generate responsive AVIF/WebP derivatives during implementation.

Quality checks: every image visually inspected, exact dimensions verified, alpha checked on light/dark backgrounds, no text/mascot, no dependency installation. All requested layers were produced cleanly; no missing assets.

## sunrise-laptop.png

Replaced on 2026-11-03. Closed warm silver-gray laptop, slightly askew on a low charcoal-gray rock, with a dark painted contact shadow, dry grass and butter/ochre sunlight from the right. Fine anthracite ink, granular watercolor and paper tooth are matched to the coffee mug. No logo, text, stickers or visible screen. The previously rejected laptop was not used as a reference.

- Delivery: **1400×700, 8-bit RGBA, 1,104,418 bytes**. Native generation: **1774×887**; the complete canvas was Lanczos3-downsampled without cropping or distortion.
- Coordinates use zero-based final-master pixels. Rock-bottom ground-contact anchor: **(450,625)**, including the lowest retained fractional-alpha fringe. Rock top surface: **y≈322** at its highest visible rear-left edge; the supporting surface immediately below the laptop front at x=700 is **y≈458**. The rock is a perspective plane, not a horizontal line.
- Laptop body bbox, manually measured including the ink perimeter and excluding rock/shadow: **(191,151,1047,334)** as (x,y,width,height); outer limits approximately x=191–1238, y=151–485.
- Mug-scale assumption: the existing 600×600 coffee master has a mug width of approximately **370 px including its handle**, excluding its rock. Target laptop body width is **2.2× the mug width**. For laptop master scale 1, use coffee master scale **1.28624** (or laptop scale **0.77746** with coffee scale 1). These are independent asset scales; equal canvas widths or equal pixel scales do not give the intended ratio.
- QA comparison uses laptop scale **0.55** and coffee scale **0.70743**: approximately **575.85 px** laptop body versus **261.75 px** mug. Both sit on a 1400×600 crop of sunrise-cliff-path.png in a 1400×900 butter-background composite. Thin ink contours and granular washes were visually compared at this scale.
- Pixel QA: transparent borders on all four sides; alpha bounds **(41,151)–(1362,625)** inclusive; **254 distinct alpha levels**, **447,944 fractional-alpha pixels**, 531,439 transparent and 617 fully opaque pixels. Alpha values 1 and 2 are absent. **Zero exact #000000/#FFFFFF RGB pixels**, including hidden RGB. **Zero blue pixels** using HSV hue 170–280° and saturation >8% among visible pixels. Body-mask saturation/alpha-weighted circular mean hue: **31.15°**, warm. The 128 residual blue numerical pixels were neutralized during export; no global color grading.
- Inspected on **#FCD772** and **#1C1D1D**: no painted checkerboard, matte or pale halo; complete subject retained. Generated contact shadow visibly joins laptop to rock. Final PNG pixels round-trip exactly through decoding.
- **Three new generation attempts.** Attempt 1 rejected for a champagne-gold body and overly uniform perimeter. Attempt 2 selected for warm silver-gray balance, lower camera angle, fine ink and contact shadow. Attempt 3 rejected for a more top-down lid view and tighter side margins, despite stronger stone contrast.
- QA files outside the repository: `~/AppData/Local/Temp/sunrise-laptop-warm-wHTTQ3/laptop-butter.png`, `~/AppData/Local/Temp/sunrise-laptop-warm-wHTTQ3/laptop-night.png`, `~/AppData/Local/Temp/sunrise-laptop-warm-wHTTQ3/laptop-coffee-path.png`, `~/AppData/Local/Temp/sunrise-laptop-warm-wHTTQ3/contact-detail.png`, and numeric checks in `~/AppData/Local/Temp/sunrise-laptop-warm-wHTTQ3/qa.json`. Exact prompts and export details: [PROMPTS.md](PROMPTS.md).
