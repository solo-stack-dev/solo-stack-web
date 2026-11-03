# Night radio art layers

Optimized from the painted masters in [`docs/art/radio/`](../../../../../../docs/art/radio/README.md) by [`build-art.ts`](build-art.ts) (uses the `sharp` that `@sveltejs/enhanced-img` installs). Re-run it after a master changes, then copy the rects it prints into [`../layout.ts`](../layout.ts):

    node src/lib/home/sections/radio/assets/build-art.ts

`<enhanced:img>` derives the responsive AVIF/WebP sizes from these files at build time. All layers are `loading="lazy"`.

| File                          | Size (px)   | What                                                                                                                                                                                                      |
| ----------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `radio-landscape.webp`        | 1920 × 720  | Desktop plate: master 2560 × 1440 (painted at ~1670 px) without its top 480 rows (sky, moon; `LANDSCAPE.wide.cropTop`). Mist band = waveform line at 748 / 1440 of the master (`LANDSCAPE.wide.horizonY`) |
| `radio-landscape-mobile.webp` | 1080 × 1755 | Phone plate: master 1080 × 2340 without its top 585 rows (`LANDSCAPE.tall.cropTop`). Mist band at 950 / 2340 of the master (`LANDSCAPE.tall.horizonY`)                                                    |
| `radio-body.webp`             | 1800 × 1081 | Wide radio, cropped to content: grille, glass, knobs + display strip window, one long key recess (`RADIO_LAYOUT.wide`)                                                                                    |
| `radio-body-mobile.webp`      | 1200 × 1187 | Phone radio: same body without the grille, taller strip window, key recess for two rows (`RADIO_LAYOUT.tall`)                                                                                             |
| `radio-needle.webp`           | 32 × 640    | Needle (as delivered), drawn short in the scale band of the glass                                                                                                                                         |
| `radio-key.webp`              | 128 × 112   | Blank preset key; logos are printed in code (ink, multiply)                                                                                                                                               |
| `radio-key-pressed.webp`      | 128 × 112   | Same key pressed (same registration, face ~10 % lower)                                                                                                                                                    |
| `radio-knob.webp`             | 256 × 256   | Knob overlay, pointer at 12 o'clock: left = volume, right = tuning                                                                                                                                        |

## Why the bodies are re-assembled

The painted body has six preset slots; the radio has one key per station (9 now, 10 once Discord has an invite). `build-art.ts` re-assembles the body from its own painted pixels, no new paint:

- The six-slot plate between the knobs becomes one long dark window, the display strip (9-slice of the painted slot rims, dial-glass wash inside).
- A band is inserted below the knob row with one long key recess across the radio: side walls copied from the straight part of the painted sides (outline kept round), cream wash tiled from clean patches of the face, recess rims tiled from the six painted slot rims, dial-glass wash inside.
- Phones: the speaker grille columns are cut out (seams cross-faded on plain cream), the strip window is taller, the key recess holds two rows.

`keySlots()` in `layout.ts` spreads any number of keys over the recess and keeps the key art's aspect, so a 10th station needs no art change.
