# Shared production materials

Ten original painted PNG materials. Exact prompts, reference paths, iteration notes and local export recipes are in [PROMPTS.md](PROMPTS.md). No text or mascot. All cutouts use real alpha. Edge-2 and edge-3 began as luminance images and were converted to white/alpha masks; no green-screen or black-background fallback remains.

## Use

- **paper-grain.png**: 256×256 neutral grayscale tile, 22,141 bytes. Repeat at native size with low opacity (start at 0.04–0.08) and soft-light/overlay blending as appropriate; pointer-events none. Both pairs of opposing edge pixels match exactly; inspected as a 3×3 tile.
- **edge-1.png**: broad gentle wet blooms, opaque above / transparent below.
- **edge-2.png**: restrained, almost horizontal broken dry-brush edge.
- **edge-3.png**: deeper diagonal watercolor bleed, descending from left to right.
- **star-1.png**: tall four-point twinkle, 128×128.
- **star-2.png**: round pigment star dot, 96×96.
- **star-3.png**: soft tilted five-point star, 96×96.
- **star-4.png**: thin eight-ray glint, 128×128.
- **shooting-star.png**: 800×80, head on the right, fading tail to the left. Move/rotate the whole sprite with CSS; disable travel for reduced motion.
- **torn-paper-edge.png**: 2560×160 cream paper attachment strip, paper at top and torn transparent lower boundary. Attach below a warm paper surface; natural pigment variation remains.

## CSS mask semantics

All three masks are white RGB with alpha from 0 to 255. Use mask-mode: alpha, mask-repeat: no-repeat, and mask-size: 100% 100% on a dedicated transition strip. Avoid stretching a 400px edge over an entire tall section. To mask a whole section, combine a solid opaque region with the edge in the last band. Flip vertically when the reveal direction requires it. The top attachment rows are completely opaque; bottom rows are completely transparent. Pure white in these files is technical mask data, not visible artwork.

Star sprites include transparent margins, so their visible centers are smaller than the PNG box. At 16 CSS pixels they retain distinct dots/glints; larger 24–48px rendering exposes the painted grain. Keep twinkle subtle and avoid sprite motion when reduced motion is requested.

## Delivery sizes

- `paper-grain.png`: 256×256, L, **22,141 bytes**; generated native 1254×1254.
- `edge-1.png`: 2560×400, RGBA, **143,870 bytes**; generated native 1983×793.
- `edge-2.png`: 2560×400, RGBA, **87,841 bytes**; generated native 1983×793.
- `edge-3.png`: 2560×400, RGBA, **205,475 bytes**; generated native 1983×793.
- `star-1.png`: 128×128, RGBA, **7,219 bytes**; generated native 1254×1254.
- `star-2.png`: 96×96, RGBA, **3,277 bytes**; generated native 1254×1254.
- `star-3.png`: 96×96, RGBA, **5,546 bytes**; generated native 1254×1254.
- `star-4.png`: 128×128, RGBA, **3,670 bytes**; generated native 1254×1254.
- `shooting-star.png`: 800×80, RGBA, **39,948 bytes**; generated native 2103×748.
- `torn-paper-edge.png`: 2560×160, RGBA, **491,036 bytes**; generated native 1983×793.

Large delivery masters were Lanczos-resampled from the listed native generation sizes; requested pixel dimensions do not imply native generated detail. Thin strip canvases were cropped/resampled for their production aspect ratios. These PNGs are source masters outside the runtime bundle; generate responsive AVIF/WebP derivatives during implementation.

Quality checks: every image visually inspected, exact dimensions verified, alpha checked on light/dark backgrounds, no text/mascot, no dependency installation. All requested layers were produced cleanly; no missing assets.
