# Night shift layers (01:00)

Optimized sources generated from the final painted masters in `docs/art/night-shift/` and `docs/art/mascot/` by `../tools/optimize-art.mjs` (sharp from pnpm's store, no extra dependency). Do not edit these files by hand: change the masters or the tool and re-run it. The build (`@sveltejs/enhanced-img`) encodes them to AVIF/WebP in the widths listed in `../Scene.svelte`.

```sh
node src/lib/home/sections/night-shift/tools/optimize-art.mjs && pnpm exec oxfmt src/lib/home/sections/night-shift/art.ts
```

| File                            | Source                                 | Treatment                                                                | Z order |
| ------------------------------- | -------------------------------------- | ------------------------------------------------------------------------ | ------- |
| `nightshift-room.webp`          | `nightshift-room.png` 2560×1440        | opaque plate, 1920 wide (native painting is 1672×941)                    | 1       |
| `nightshift-room-mobile.webp`   | `nightshift-room-mobile.png` 1080×2340 | opaque portrait plate                                                    | 1       |
| `nightshift-window-sky.webp`    | `nightshift-window-sky.png` 1100×1100  | sky with moon, drawn ABOVE the room, masked to the two upper glass panes | 2       |
| `mascot-nightshift-typing.webp` | `mascot-nightshift-typing@1.png`       | body crop, hand patch cleared, cut below the desk line                   | 3       |
| `mascot-nightshift-hands.webp`  | `mascot-nightshift-typing@1/@2/@3.png` | sprite sheet: the three hand patches stacked (frames differ only there)  | 3       |
| `nightshift-bonsai.webp`        | `nightshift-bonsai.png`                | cropped to its alpha bounding box                                        | 4       |
| `nightshift-bonsai-golden.webp` | `nightshift-bonsai-golden.png`         | cropped; loaded on first interest, crossfades with the green tree        | 4       |
| `nightshift-handheld.webp`      | `nightshift-handheld.png`              | cropped                                                                  | 4       |
| `nightshift-foreground.webp`    | `nightshift-foreground.png`            | cropped; desktop only                                                    | 5       |

Crop offsets and sizes land in `../art.ts`; `../layout.ts` places every layer from the coordinate contract in `docs/art/night-shift/README.md` (desktop 2560×1440, mobile 1080×2340). Mobile has no prop layers of its own: it reuses the desktop bonsai and handheld with the README's affine maps.

The mascot sits in the painted chair behind the desk (desktop scale 1.16 at (993, 118), mobile 0.82 at (330, 740), in art px). A clip polygon in `layout.ts` hides everything behind the desk's back edge except the hands on the keyboard. If you move the mascot lower, raise `MASCOT_BOTTOM` in the tool so the body crop still reaches the desk line.

Shiny egg: there is no golden typing art, so the `.mascot` element gets the shared golden filter fallback (docs/HOMEPAGE-DEV.md §11).
