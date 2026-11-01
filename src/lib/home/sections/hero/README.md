# Hero (20:00) layers

Final painted art. Masters live in `docs/art/hero/` and `docs/art/mascot/` (see their READMEs); `tools/build-assets.mjs` turns them into the optimized copies in `assets/` and writes the crop rects of every cutout to `art.ts`, so the layout keeps working in master coordinates. After changing a master, rerun the tool (stop `pnpm dev` first on Windows: Vite's image pipeline keeps the asset files open).

```sh
node src/lib/home/sections/hero/tools/build-assets.mjs                 # all jobs: plates clouds moon frame mascot
node src/lib/home/sections/hero/tools/build-assets.mjs clouds --preview C:/tmp/fringe   # one job + before/after crops
node src/lib/home/sections/hero/tools/build-assets.mjs portrait        # owner photo, source outside the repo
```

| File (`assets/`)                                 | Master                                     | Processing                                                                         | Slot in `Hero.svelte`                         |
| ------------------------------------------------ | ------------------------------------------ | ---------------------------------------------------------------------------------- | --------------------------------------------- |
| `hero-sky.webp`                                  | `hero-sky.png` 2560×1440                   | native generation size 1672×941 (the master is a bilinear upscale)                 | `.sky` desktop `<source>`                     |
| `hero-sky-mobile.webp`                           | `hero-sky-mobile.png` 1080×2340            | native 852×1846                                                                    | `.sky` phones / tall portrait                 |
| `hero-clouds-1.webp`, `-2`, `-3`                 | `hero-clouds-*.png` 2560×1024              | fringe clean-up, crop to alpha box, 0.8× (native 2048 canvas)                      | 1, 2 behind the moon; 3 in front (`.cloud-*`) |
| `hero-moon-disc.webp`                            | `hero-moon-disc.png` 2048²                 | crop to the halo (53, 53, 1942²), full resolution                                  | `.moon-img` (LCP, 2D fallback)                |
| `hero-moon-texture.webp`                         | `hero-moon-texture.png` 4096×2048          | 2048×1024 WebP, loaded as a URL by the lazy Threlte chunk                          | `MoonBody.svelte`                             |
| `hero-portrait-frame.webp`                       | `hero-portrait-frame.png` 900×1100         | crop to alpha box, 400 px wide; the transparent window is measured into `art.ts`   | `.portrait-frame`                             |
| `hero-portrait.png`                              | `profil-buttergelb.png` (outside the repo) | 640² copy                                                                          | `.portrait-photo` (fills the frame window)    |
| `mascot-hero-moonrim.webp`, `mascot-golden.webp` | `docs/art/mascot/…` 1024×1536              | one shared crop (93, 56, 840×1387) so the shiny swap stays registered, 640 px wide | `.mascot-normal`, `.mascot-golden`            |

## Geometry

- **Moon circle:** `--moon-r`, `--moon-cx`, `--moon-cy` on `.hero` (container units), per breakpoint. Everything that must line up with the moon reads them (rig, 3D canvas, wordmark clip); change them only there. Phase math lives in `moon.ts`.
- **Painted disc:** the master circle is center (1024, 1024), radius 928. The cropped image includes the painted halo, so it is larger than the moon box: `--disc-left/top/size` are computed from `art.ts`. The 3D sphere and the wordmark clip use the circle itself.
- **Mascot:** seat contact (740, 980) in master px (mascot README) → `--sit-x/--sit-y` of the cropped image; it sits on the rim at `--mascot-at`, `--mascot-w` wide, tilted by `--mascot-tilt`.
- **Portrait:** the photo fills the frame's measured window, grown by 2 % per side so it tucks under the paper.

## Behaviour notes

- **Mascot:** laptop light is a soft screen-blended glow that flickers (static under reduced motion); on a shooting star the whole figure leans back 5° around its seat. The blink of the placeholder rig was dropped: a convincing closed eye needs painted eyelid frames (`mascot-hero-moonrim-blink.png`, eye region only) from the art pipeline.
- **Shiny:** `.mascot` has `data-shiny-art`; under `[data-shiny]` the golden variant replaces the normal one (lazy + `display: none`, so nobody else downloads it).
- **Moon presence egg:** every 10th click on the full moon keeps it full (no phase change) and the `night:moon-full-clicks` count reaches a multiple of 10, so the egg appears over a full moon.
- **3D material:** the texture is flat albedo; `MoonBody.svelte` adds the painted disc's pale outer ring and keeps terminator effects off at full moon, so the 2D → 3D crossfade stays quiet.
- **Budgets:** each `?…&enhanced` import has an explicit width ladder that stops at the native detail, and an AVIF quality tuned for the ≤ 250 kB above-the-fold budget (handoff §6.4); the `sizes` table in the script mirrors the CSS widths.
