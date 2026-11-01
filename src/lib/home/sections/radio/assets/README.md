# Night radio art layers

All files here are **placeholders** painted by `placeholders/make-placeholders.ts` (SVG watercolor filters for the radio parts, the round-2 mockup patched for the landscapes). The final paintings replace them **with the same file names**; then re-tune the numbers in [`../layout.ts`](../layout.ts) and nothing else.

| File                         | Size (px)   | What                                                                                                   | Rects in `layout.ts`                                       |
| ---------------------------- | ----------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| `radio-landscape.png`        | 2560 × 1440 | Desktop plate: sky, moon top right, hills, lake. **Empty horizon band** (the waveform draws the line). | `LANDSCAPE.wide.horizonY` (lake line, fraction of height)  |
| `radio-landscape-mobile.png` | 1080 × 2340 | Phone plate, moon closer to the horizon, bottom fades to `#0e0f10` (the link chart sits there).        | `LANDSCAPE.tall.horizonY`                                  |
| `radio-body.png`             | 2000 × 1240 | Wide radio, transparent. Empty dial glass (arch), empty display strip window, key recess, knob seat.   | `RADIO_LAYOUT.wide.*`                                      |
| `radio-body-mobile.png`      | 1200 × 1880 | Tall radio for phones (glass on top, strip, 2 rows of keys).                                           | `RADIO_LAYOUT.tall.*`                                      |
| `radio-needle.png`           | 120 × 1160  | Needle, transparent, pointing up; pivot cap centered `pivotFromBottom` above the bottom edge.          | `needle.box`, `needle.pivotFromBottom`                     |
| `radio-key.png`              | 200 × 260   | One blank preset key, up. Logos are drawn in code (ink, monochrome) on the upper ~75 %.                | key slots are computed from `keyBank`, `keyRows`, `keyGap` |
| `radio-key-pressed.png`      | 200 × 260   | Same key pressed down (face lower, warm glow).                                                         |                                                            |
| `radio-knob.png`             | 200 × 200   | Tuning knob, transparent, pointer mark at 12 o'clock (rotated in code with the dial).                  | `knob`                                                     |

Notes for the painter:

- Same watercolor + ink style as the rest of the page; **not photoreal** (owner feedback). Cream/butter body, ink outline.
- The radio body has **one long key recess**, not a fixed number of slots: there are currently 10 stations (9 linkable platforms + Solo Stack FM; Discord makes 11 once its invite exists). If you paint discrete slots, paint 10 (wide: one row; tall: 5 + 5) and replace `keySlots()` with explicit rects.
- Key art: keep the face plain (logos are printed in code). Keep the key aspect close to the slot aspect (wide ≈ 0.94:1, tall ≈ 0.78:1 width:height; the placeholder is 0.77:1) or the image stretches.
- Moon belongs to the landscape plate. No text anywhere in the art.

Regenerate the placeholders (only while no final art exists): `node src/lib/home/sections/radio/assets/placeholders/make-placeholders.ts`.
