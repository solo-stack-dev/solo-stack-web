# Night shift layers (01:00)

Optimized sources generated from the final painted masters in `docs/art/night-shift/` (the "coherent scene revision": the mascot, one chair, keyboard and mouse are painted into the scene) by `../tools/optimize-art.mjs` (sharp from pnpm's store, no extra dependency). Do not edit these files by hand: change the masters or the tool and re-run it (stop `pnpm dev` first on Windows, it keeps the files open). The build (`@sveltejs/enhanced-img`) encodes them to AVIF/WebP in the widths listed in `../Scene.svelte`.

```sh
node src/lib/home/sections/night-shift/tools/optimize-art.mjs && pnpm exec oxfmt src/lib/home/sections/night-shift/art.ts
```

| File                            | Source                                                                      | Treatment                                                                  | Z order |
| ------------------------------- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ------- |
| `nightshift-scene.webp`         | `nightshift-scene.png` 2560×1440 + `nightshift-hands@1…3.png`               | scene 1920×1080 (native painting is 1672×941) plus the hands band below it | 1, 3    |
| `nightshift-scene-mobile.webp`  | `nightshift-scene-mobile.png` 1080×2340 + `nightshift-hands-mobile@1…3.png` | scene 1080×2340 plus the hands band below it                               | 1, 3    |
| `nightshift-window-sky.webp`    | `nightshift-window-sky.png` 1100×1100                                       | sky with moon, drawn ABOVE the scene, masked to the two upper glass panes  | 2       |
| `nightshift-bonsai.webp`        | `nightshift-bonsai.png`                                                     | cropped to its alpha bounding box                                          | 4       |
| `nightshift-bonsai-golden.webp` | `nightshift-bonsai-golden.png`                                              | cropped; loaded on first interest, crossfades with the green tree          | 4       |
| `nightshift-handheld.webp`      | `nightshift-handheld.png`                                                   | cropped                                                                    | 4       |
| `nightshift-foreground.webp`    | `nightshift-foreground.png`                                                 | cropped; desktop only                                                      | 5       |

**Typing hands.** Each scene file is taller than its scene: below it sits a band with the three hand frames side by side, each cut out around the pixels the frames change (plus an 8 px margin of unchanged scene and an 8 px bleed of the surrounding scene for resampling). The section shows the scene part as the plate (the band is clipped off) and a window at the hands rect onto the same image, translated to the current frame's cell. Plate and window use the same `src`, `srcset` and `sizes`, so the browser picks the same file and decodes it once, and the cell registers exactly with the plate at every size. A separately encoded patch drifted by about 0.5 CSS px in Chrome on phones. Keep the hands window's `<enhanced:img>` in sync with the plate's. Under reduced motion the window is not rendered: the plate's own hands at rest are frame 1.

Crop offsets, the hands rect and the cell positions land in `../art.ts`. `../layout.ts` places every layer from the coordinate contract in `docs/art/night-shift/README.md` (desktop 2560×1440, mobile 1080×2340). Mobile has no prop layers of its own: it reuses the desktop bonsai and handheld with the README's affine maps. The bonsai is nudged to stand on its book on the new plates (desktop 18 px down, mobile 24 px right and 6 px down, in art px).

Shiny egg: the mascot is part of the plate, so `.mascot` is an empty box around it (`data-shiny-art` opts out of the egg's filter fallback). Under `[data-shiny]` its `::before` lays a radial soft-light gold wash over the mascot; the egg's sparkle is its `::after`.
