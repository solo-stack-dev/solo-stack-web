# Cinema layers (04:00)

Optimized sources generated from the final painted masters in `docs/art/cinema/` and `docs/art/mascot/mascot-cinema-sitting.png` by `../tools/optimize-art.mjs` (sharp from pnpm's store, no extra dependency). Do not edit these files by hand: change the masters or the tool and re-run it. The build (`@sveltejs/enhanced-img`) encodes them to AVIF/WebP in the widths listed in `../Cinema.svelte`.

```sh
node src/lib/home/sections/cinema/tools/optimize-art.mjs && pnpm exec oxfmt src/lib/home/sections/cinema/art.ts
```

| File                           | Treatment                                                                                                                                 |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `cinema-landscape.webp`        | opaque 16:9 plate, 1920 wide (native painting is 1672×941); top edge fades into the sky                                                   |
| `cinema-landscape-mobile.webp` | opaque portrait plate 1080×2340                                                                                                           |
| `cinema-frame.webp`            | cropped to its alpha bounding box; the exact 16:9 aperture is recorded in `../art.ts`                                                     |
| `cinema-cliff.webp`            | cropped; laptop screen (beam apex) and sitting area recorded in `../art.ts`                                                               |
| `cinema-beam.webp`             | cropped; mapped onto the cone laptop → frame with an affine transform from `../layout.ts`                                                 |
| `mascot-cinema-sitting.webp`   | cropped; seat contact point recorded in `../art.ts`                                                                                       |
| `cinema-projection.webp`       | round-2 empty-screen projection (16:9, native 1664 px), from `docs/art/site/round-2/` by `src/lib/home/shared/tools/optimize-round-2.mjs` |

`../layout.ts` derives the frame from the video window (aperture = window, exactly), places the cliff and mascot from the composition suggested in `docs/art/cinema/README.md`, and computes the beam transform. Shiny egg: no golden sitting art exists, so the `.mascot` wrapper gets the shared golden filter fallback.
