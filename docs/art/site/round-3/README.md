# Round 3 production art

> **Cleanup (2026-11-10):** working images (previews, rejects, raw sources, superseded layers, QA screenshots) were removed from the tree to keep the repo small. They remain in git history at commit `dbb4371`.

Seven painted PNG masters for solo-stack.dev, generated and inspected on 2026-11-05. This round addresses the repeated cinema-to-sunrise transition, synthetic stats ground and generic contact send button identified in both round-2 critiques. Everything delivered is under this folder. No runtime code, public copy or deployment changed.

## Masters

All seven are **8-bit RGBA with real native alpha**, transparent exterior, graded edges and opaque pigment interiors. No text, letters, logos or UI. The seal carries only the requested simple crescent.

- [dawn-cloud-bank.png](dawn-cloud-bank.png): **2560 × 900**, **2,590,538 bytes**. One non-repeating panorama, broad left mass, lower wind-combed center and rising right shoulder. Ink/umber folds, ochre and butter light, irregular wispy bottom.
- [dawn-cloud-bank-mobile.png](dawn-cloud-bank-mobile.png): **1080 × 1300**, **1,613,121 bytes**. Independently generated portrait composition with a taller left mass and rising opening toward the right; not a desktop crop.
- [ink-ground-a.png](ink-ground-a.png): **2560 × 360**, **640,270 bytes**. Calmer solid ink strip, irregular upper and lower dry-brush edges; intended for the KPI ground.
- [ink-ground-b.png](ink-ground-b.png): **2560 × 360**, **656,605 bytes**. More broken brush gestures, deeper lower skirt, scattered pigment islands and trailing right bristles; intended for the hill foot or a more expressive ground.
- [ink-feather.png](ink-feather.png): **2560 × 300**, **661,436 bytes**. Fully opaque top attachment row; charcoal pigment dissolves unevenly into transparent paper openings below.
- [wax-seal.png](wax-seal.png): **800 × 800**, **637,616 bytes**. Butter wax disc with a large simple crescent impression, soft irregular rim and restrained ochre shading.
- [wax-seal-pressed.png](wax-seal-pressed.png): **800 × 800**, **570,704 bytes**. Same seal and orientation, flatter relief and darker ochre wax.

## Placement contract

**Dawn:** use one full-width image, never repeat/tile it. Both side borders carry paint; top and bottom are transparent. Put the cloud bank above both the cinema and sunrise art and position their underlying join inside its dense middle. Do not place the plate termination under the thin outer wisps. Preserve full width on desktop; switch to the portrait asset on mobile rather than center-cropping the panorama. No extra glow, color filter or gray/olive wash is needed.

The [desktop composition](previews/dawn-on-cinema-sunrise-desktop.png) is 1440 × 1050. It uses the bottom 450px of the existing cinema painting at y=0, the existing sunrise sky at y=150, the cloud at `(0,150,1440,506)`, and the valley at y=640. The cinema plate ends at y=450, hidden inside opaque cloud pigment. The [mobile composition](previews/dawn-on-cinema-sunrise-mobile.png) is 390 × 844; its cinema crop ends at y=290 and the portrait cloud occupies `(0,20,390,469)`. The sunrise, valley, cliff, coffee and laptop below are the existing art. These are art placement proofs, not screenshots of an implemented page. The integration still needs to reduce the empty wash and position live content.

**Ground:** A is suitable behind data because its central full-width opaque band spans rows 115–217 inclusive. B has stronger edge variation and an extended bristle tail; prefer it for decorative hill/ground work, with content inside the central body and away from its right fringe. Both have clear top/bottom margins and flow off the side borders. Never tile, mirror-repeat, add a luminous crest or combine them with procedural serrations.

**Feather:** attach at the hill's lower edge, overlap its opaque top into the existing hill, and let the variable lower brush termination reveal the actual cream background. The top row is intentionally straight for attachment; hide it inside the hill. The visible bottom is irregular. Keep this at full opacity; its native alpha already supplies the dissolution. It can also supply the painted alpha for a hill mask.

**Seal:** both states share the 800px canvas. Their painted bounds are approximately x77–718 and y79–722, a roughly 80% occupied canvas. A 70px image box gives approximately 56px visible wax; a 56px image box still reads clearly with approximately 45px wax. Use identical dimensions/position for both states. The pressed state's lower bound differs by only one master pixel; there is no meaningful positional jump at button scale. Do not add an external glow or glossy pill behind it. Keep the accessible button semantics and live label in the implementation.

## Inspection

Every master has full-resolution `*-night.png` and `*-paper.png` proofs under [previews/](previews/), composited on **#18191b** and **#fdf9ee** with no added backlight. The final family sheets, enlarged alpha-edge samples, two dawn art compositions and small seals were visually inspected. No painted checkerboard, white matte, unintended glow fringe or repeated stamp pattern was visible.

- [qa-dawn.png](previews/qa-dawn.png): desktop / portrait, night left and paper right.
- [qa-ink.png](previews/qa-ink.png): A / B / feather, night left and paper right.
- [qa-seals.png](previews/qa-seals.png): normal / pressed, night left and paper right.
- [qa-seals-small.png](previews/qa-seals-small.png): normal / pressed pairs on each background; 56px image boxes above, 70px boxes below.
- [qa-alpha-edges.png](previews/qa-alpha-edges.png): actual edge pixels enlarged 4× without smoothing, in the master inventory order.

[alpha-report.json](previews/alpha-report.json) records exact dimensions, byte sizes, SHA-256 hashes, alpha counts, painted bounds and border properties. Each master has **248 distinct alpha levels** after export cleanup. [validation.json](previews/validation.json) passes every assertion: seven real-alpha files, exact delivery dimensions, clear lower borders, clear upper borders except the feather, and a fully opaque feather attachment row.

Three weak attempts were superseded: ribbon-like calm ground, gold-contaminated broken ground, and a gray-edged feather. The replacements are flat unlit charcoal pigment. The dawn banks and seals were accepted after light/dark and small-size inspection.

## Generation and export limits

Used the built-in OpenAI **image_gen** tool with native transparency, requesting highest available quality. It exposes **no underlying model name, quality selector, seed or exact-size control**, so a particular hidden model or quality setting cannot be certified. No API/CLI fallback and no package installation were used.

Native generated sizes: desktop dawn **2115 × 743**, portrait dawn **1143 × 1376**, each ink source **2172 × 724**, each seal **1254 × 1254**. Desktop dawn and ink exports are resampled to 2560px; they do not contain native 2560px generated detail. Portrait and seals are downsampled. Ink canvases lose empty space before export; their vertical proportions are adjusted for the shallow strip format, without clipping painted contours. Exact crop rectangles are in [export-log.json](previews/export-log.json).

All ten generation/edit prompts, references, selection decisions and source paths are in [PROMPTS.md](PROMPTS.md) and [generation-log.json](previews/generation-log.json). Selected final PNGs are self-contained. Original and superseded generations remain in the generator's own output directory.

[finish_and_inspect.py](previews/finish_and_inspect.py) reproduces masters and proofs from those local originals using the already available Pillow and NumPy. It writes only inside round-3. Resizing uses premultiplied alpha. Alpha below 3/255 becomes zero, above 248/255 becomes opaque, and fully transparent RGB becomes zero; graded edges remain. The feather's two residual fractional-alpha pixels on its top attachment row are made opaque. PNGs include an sRGB chunk. No brush shapes, texture or color variants were procedurally drawn.

No site build was needed for this isolated art delivery. Runtime responsive derivatives and page integration belong to the implementation task.
