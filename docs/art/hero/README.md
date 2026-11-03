# Hero production layers

Production PNG masters for solo-stack.dev. These are independent compositing layers, not website mockups. Generated and inspected 2026-11-01.

## Production and export

All artwork was generated with the built-in image_gen tool using the supplied references. Highest quality was requested in every prompt; this tool exposes no selectable quality/model parameter. No API/CLI image model or dependency installation was used. The generated images were smaller than the requested master dimensions. Final master exports use alpha-aware bilinear resampling, so the larger files do not contain native 2K/4K generated detail. Native dimensions are recorded per layer below and in PROMPTS.md.

Technical export only: preserve generated pigment, add transparent breathing room to cutouts, retain fractional alpha, set fully transparent RGB to zero, replace visible exact #000000 with #0E0F10 and exact #FFFFFF with #FBF3DD, and attach an sRGB PNG chunk. Transparent black RGB is invisible storage, not painted black. All cutouts use real RGBA transparency; no green-screen fallback was needed. There is no baked text, mascot, or human figure in these assets.

## Layers

- **[hero-sky.png](hero-sky.png)** — 2560×1440 px; 4,731,880 bytes; z=0. RGB: fully opaque. Native generation 1672×941 px. Full-bleed desktop background; align center. Keep the quiet right 45% behind the moon.
- **[hero-sky-mobile.png](hero-sky-mobile.png)** — 1080×2340 px; 3,211,305 bytes; z=0. RGB: fully opaque. Native generation 852×1846 px. Portrait alternative to the desktop plate; align center. Upper right stays dark for the moon; warm dusk sits at the bottom.
- **[hero-clouds-1.png](hero-clouds-1.png)** — 2560×1024 px; 1,713,349 bytes; z=1. RGBA: transparent exterior and fractional-alpha edges. Native generation 2048×768 px. Distant warm low cloud bank; span the lower-left/lower-middle sky behind the moon. Suggested rendered width 70–100% of hero; keep motion within the transparent margin.
- **[hero-clouds-2.png](hero-clouds-2.png)** — 2560×1024 px; 1,278,562 bytes; z=2. RGBA: transparent exterior and fractional-alpha edges. Native generation 2048×768 px. Thin rising wisps; place across the left sky behind the moon. Suggested width 70–100%; lower opacity if needed for the wordmark.
- **[hero-clouds-3.png](hero-clouds-3.png)** — 2560×1024 px; 1,690,257 bytes; z=4. RGBA: transparent exterior and fractional-alpha edges. Native generation 1983×793 px. Dark foreground bank, heavier on the right; overlap the lower moon rim. Suggested width 80–110%; it may be cropped by the section, not by the PNG.
- **[hero-moon-disc.png](hero-moon-disc.png)** — 2048×2048 px; 4,842,903 bytes; z=3. RGBA: transparent exterior and fractional-alpha edges. Native generation 1254×1254 px. Static/reduced-motion moon, on the right and partly outside the desktop viewport; top right on mobile. Use the exact disc geometry below for the live wordmark clip.
- **[hero-moon-texture.png](hero-moon-texture.png)** — 4096×2048 px; 9,200,506 bytes; z=3, replacement for disc. RGB: fully opaque. Native generation 1774×887 px. Unlit color/albedo map for the lazy 3D sphere at the same position and diameter as the fallback disc. Repeat U; clamp V. Separate scene lighting controls phases.

## Moon geometry and texture

The disc canvas is 2048×2048. Its exact geometric center is **(1024, 1024)**, measured from the top-left canvas boundary. The nominal circle radius is **928 px**, diameter **1856 px**. This is the 50% alpha contour of the exported soft edge, not the glow bounding box. The nominal disc margin is 96 px on each side. At any square rendered width W, use center (W/2, W/2) and radius W×0.453125; the corresponding CSS circle is `circle(45.3125% at 50% 50%)`.

Export normalized the generated lunar pigment around source center (627,622), sampling its inner radius 545 px into the final radius 928 px. The alpha is mathematically radial: full within radius 925, 50% at 928, then a narrow exponential glow (10 px decay) fading completely by radius 992. Pixel centers are sampled at x+0.5,y+0.5; 8-bit alpha quantization applies. Use radius 928 for sphere geometry and wordmark clipping; do not size the sphere to the halo.

The texture is a **4096×2048 equirectangular flat color/albedo map**. It has pigment variation but no directional illumination or phase shadow. Its two horizontal edges were equalized with a 256 px smooth blend on each side; all RGB values in column 0 and column 4095 match exactly. A 64 px blend toward a constant pole row prevents a color discontinuity at either pole. Repeat horizontally, clamp vertically, and use sRGB color sampling. The moon-disc composition and the texture were independently generated in the same style; they are not pixel-identical hemispheres. Keep any transition between the 2D fallback and 3D material subtle.

## Compositing and verification

Layer order is sky → distant clouds → wisps → moon → foreground clouds. Live wordmark and navigation sit above the art; the wordmark uses the moon circle for its color split. A separate mascot asset belongs to another production task.

All eight images were visually inspected; the second cloud was regenerated because its initial silhouette was too similar to the first. The final cloud silhouettes are a low warm bank, thin rising wisps, and a darker right-heavy bank. The cutouts were inspected together on #18191B. Dimension checks passed; RGBA outer-border alpha is zero; visible pure-black/pure-white pixel counts are zero; the texture horizontal seam has maximum RGB difference zero.

## Integration limits

Keep these large masters outside the shipped bundle. Generate optimized responsive AVIF/WebP derivatives during implementation; the homepage handoff budgets are approximately 250 kB for initial hero images and 400 kB per subsequent section. No application files or optimized derivatives were changed here. All requested layers are present; the material limitation is that final target dimensions are resampled from smaller built-in generations.

Exact generation prompts and ordered input references: [PROMPTS.md](PROMPTS.md).

**2026-11-03:** `hero-portrait-frame.png` was retired (owner decision: no torn-paper polaroid in the hero; the photo moved to the 06:00 footer as an ink print, see `src/lib/home/sections/sunrise/tools/build-assets.mjs`). Its prompt stays in PROMPTS.md for the record.
