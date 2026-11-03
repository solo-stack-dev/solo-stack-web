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

- **sunrise-laptop.png**: closed generic anthracite/dusk laptop resting flat after the night shift, repainted against `sunrise-coffee.png`. Irregular sepia ink contour, granular watercolor, two stacked slabs with a darker seam and thicker base, visible rear hinge barrel and joints, subtle side port and small feet. Butter/cream light rakes from upper right into cool front/left shade. Dark occlusion and a short translucent shadow falling left ground it. No logo, text, ground patch, rock, cup or character. Place above the cliff path beside the existing coffee at the same pixel-to-scene scale.
- `sunrise-laptop.png`: 1200×600, RGBA, **590,095 bytes**; generated native 1774×887. Transparent margins cropped, then Lanczos3-resampled to 983×389 and transparently padded to delivery size; no subject cropping. PNG compression level 9, graded alpha preserved, alpha < 3 → 0, no exact black/white.
- Placement coordinates (zero-based from master top left): front-right corner ground-contact anchor **(766,500)** at the small rubber foot, visual horizontal center **x=599**. Body width **950 px**, versus the coffee mug's approximately 370 px including handle. The anchor excludes the feathered shadow, which extends to y=513.
- Code glint: sunlit right lid edge box **(781,235,285,215)** as (x,y,width,height) in master pixels. The diagonal highlight runs approximately from (1058,245) to (790,442); follow the edge within the box.
- QA: inspected on #FCD772 and #18191B, beside the coffee at equal 1:1 master scale, and on a cliff-path crop. Ink, pigment, scale and ground contact visually checked. Dimensions, transparent borders, graded alpha range 0–255 and absence of exact black/white verified. Original rejected for product-render contours, tablet-like form and weak grounding; repaint attempts rejected for regular contours and pale/gray shadow fringes. Final shadow correction removes the pale underlay. Temporary composites are outside the repository in `C:/Users/peter/AppData/Local/Temp/sunrise-laptop-repaint-y4y6oc/` (`laptop-butter.png`, `laptop-night.png`, `laptop-coffee-path.png`, `laptop-coffee-style.png`); numeric checks in `qa.json`. Full prompts and export details are in [PROMPTS.md](PROMPTS.md).
