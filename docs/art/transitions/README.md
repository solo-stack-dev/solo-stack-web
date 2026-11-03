# Section transition materials

Painted masters for the section transitions (docs/HOMEPAGE-DEV.md §6.5). Prompts, rejected attempts and processing: [PROMPTS.md](PROMPTS.md). Optimized runtime files: `node src/lib/home/shared/tools/optimize-transitions.mjs` → `src/lib/home/shared/assets/transitions/`.

| Master             | Size      | Kind                                  | Runtime                                             | Used by                                                           |
| ------------------ | --------- | ------------------------------------- | --------------------------------------------------- | ----------------------------------------------------------------- |
| `feather-soft.png` | 2560×512  | alpha mask, opaque top → clear bottom | `feather-down.webp`, `feather-up.webp` 1280×256     | `[data-feather]`, cinema backdrop/landscape, night-shift vignette |
| `wash-spread.png`  | 2048×2048 | alpha mask, wet blooms                | `wash-spread-up.webp`, `wash-spread-down.webp` 768² | hero → making wipe, sunrise night lobes                           |
| `wash-dry.png`     | 2048×2048 | alpha mask, drying tide lines         | `wash-dry.webp` 768²                                | sunrise night (04 → 06 wipe)                                      |
| `mist-dusk.png`    | 2560×720  | RGBA cloud bank, ochre catch-lights   | `mist-dusk.webp` 1920×540 → enhanced-img            | `<Mist variant="dusk">` (21 → 22)                                 |
| `mist-night.png`   | 2560×720  | RGBA cloud bank, cream rims           | `mist-night.webp`                                   | `<Mist variant="night">` (22 → 01, 01 → 02)                       |
| `mist-predawn.png` | 2560×720  | RGBA cloud bank, warm glow below      | `mist-predawn.webp`                                 | `<Mist variant="predawn">` (02 → 04)                              |

All masters are horizontally seamless; masks are white RGB with the shape in alpha. Mist strips are transparent in their top and bottom ~16 %.
