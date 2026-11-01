# Night shift layers (01:00)

**Current files are rough PLACEHOLDERS** cut from the round-2 mockups (`docs/mockups/round-2/05-night-shift-radio/01-…`, `02-…`, `04-…`) with `sharp`: baked mockup text inpainted, the monitor screen painted dark, the window panes punched out of the room, the mockup's handheld blurred away and replaced by an original SVG design. Final painted layers replace them **with the same file names**; nothing in the code changes, only `../layout.ts` if positions differ.

## Contract

| File                                   | Canvas       | Content                                                                    | Z order |
| -------------------------------------- | ------------ | -------------------------------------------------------------------------- | ------- |
| `nightshift-window-sky.png`            | 2560×1440 \* | sky with moon and trees, seen through the window; drifts behind it         | 1       |
| `nightshift-room.png`                  | 2560×1440    | room incl. desk and props, **transparent window panes**, empty dark screen | 2       |
| `nightshift-bonsai.png`                | 2560×1440    | bonsai, transparent elsewhere                                              | 3       |
| `nightshift-bonsai-golden.png`         | 2560×1440    | golden glowing bonsai (egg), loaded lazily on first interaction            | 3       |
| `mascot-nightshift-typing@1/@2/@3.png` | 2560×1440    | mascot typing frames: @1 rest, @2 left hand down, @3 right hand down       | 3       |
| `nightshift-handheld.png`              | 2560×1440    | original handheld console design                                           | 3       |
| `nightshift-foreground.png`            | 2560×1440    | out-of-focus foreground (strongest parallax)                               | 4       |
| `nightshift-room-mobile.png`           | 1080×2340    | flattened portrait plate (no separate layers on mobile)                    | 1       |

All desktop layers are pixel-registered on the same 2560×1440 canvas. \* If the sky is delivered smaller (e.g. ~900²), set `desktop.sky` in `layout.ts` to its rect on the canvas (percent). It needs ~5 % of extra sky around the window aperture so the scroll drift never shows its edge.

Live code on top (positions in `layout.ts`): the terminal (matrix3d onto `monitor.quad`), lamp flicker, steam, dust, gold particles, hotspot glows and tooltips.

## Re-tuning when the art lands

1. Drop the files in with the same names.
2. In `layout.ts`, update `monitor.quad` (screen corners, clockwise from top left), `window`, `lamp`, `steam`, `bonsai` (pot center), `seat` and each `spots[].rect` from the art's pixel coordinates divided by the canvas size.
3. Check with `pnpm dev` at 1440 px and 390 px; hover each hotspot.

Optional optimization: transparent layers can be cropped to their bounding box (smaller decode); position them by giving the layer a rect like `sky` (not wired for the other layers yet).
