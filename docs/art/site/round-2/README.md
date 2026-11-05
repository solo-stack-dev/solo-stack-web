# Round 2 production art

Thirteen original PNG masters for solo-stack.dev, generated and inspected on 2026-11-05. All artwork, documentation and proofs for this round live here. No application code, visitor copy or deployment changed. No text, letters, logos or UI are baked into the masters.

## Master inventory

Sizes are exact bytes. **RGB** means fully opaque with no alpha channel. **RGBA** means real native transparency with fully transparent exterior pixels and graded brush edges, retained through export.

- [poster-moon-planet.png](poster-moon-planet.png) — **1664 × 936**, **2,211,007 bytes**, RGB. Running chibi mascot, round cratered moon and three bugs oriented around its rim.
- [poster-stack-to-moon.png](poster-stack-to-moon.png) — **1664 × 936**, **2,005,412 bytes**, RGB. Uneven paper blocks, one falling block, moon at upper right.
- [poster-constellations.png](poster-constellations.png) — **1664 × 936**, **2,102,765 bytes**, RGB. Cloud, droplet and branching network traced in warm stars; tool allusions without logos or lettering.
- [seam-cloud-a.png](seam-cloud-a.png) — **2560 × 600**, **538,523 bytes**, RGBA. Left-heavy bank with three unequal rising gestures.
- [seam-cloud-b.png](seam-cloud-b.png) — **2560 × 600**, **499,390 bytes**, RGBA. Rising right shoulder, two wisps and a low left tail.
- [seam-cloud-c.png](seam-cloud-c.png) — **2560 × 600**, **336,984 bytes**, RGBA. Shallow central crest with two left-leaning wisps.
- [cinema-projection.png](cinema-projection.png) — **1664 × 936**, **2,048,988 bytes**, RGB. Quiet projected laptop-on-cliff landscape, muted ochre horizon, grain and dark vignette.
- [root-top.png](root-top.png) — **700 × 1750**, **304,306 bytes**, RGBA. Thicker entrance from above, descending into the common root width.
- [root-mid.png](root-mid.png) — **700 × 1750**, **299,601 bytes**, RGBA. Exact 2:5 vertical repeat, no overall taper, thin gold vein.
- [root-end.png](root-end.png) — **700 × 1983**, **216,418 bytes**, RGBA. Matching upper attachment, fading vein, tapering fine rootlets and transparent bottom.
- [break-fireflies.png](break-fireflies.png) — **1200 × 400**, **99,684 bytes**, RGBA. Five fireflies above a small grass tuft.
- [break-laptop.png](break-laptop.png) — **1200 × 400**, **93,413 bytes**, RGBA. Small ink cliff and blank butter-lit laptop.
- [break-owl.png](break-owl.png) — **1200 × 400**, **81,310 bytes**, RGBA. Round-1 tawny owl identity, simplified on a small twig.

## Generation and size limits

Used the built-in OpenAI **image_gen** tool with native transparency for the nine cutouts and highest available quality requested in every prompt. The tool exposes **no underlying model name, quality selector, seed or exact-size setting**; no particular hidden model or quality setting can be certified. No CLI/API fallback or dependency installation was used.

The opaque plates retain native detail: the returned 1672 × 941 paintings were trimmed by eight horizontal and five vertical pixels to exact 16:9. Cloud sources were 2172 × 724; their 2560-pixel exports are resampled, not native 2560-pixel detail. The larger vignette sources were downsampled. Root finishing establishes their repeat/attachment contract without replacing the generated bark or vein with vector art.

All eighteen generation/edit prompts, including superseded versions and selected source identifiers, are in [PROMPTS.md](PROMPTS.md). [previews/generation-log.json](previews/generation-log.json) records the same lineage. Unselected originals remain in the generator output directory. The committed masters are self-contained.

## Placement contract

All three posters reserve the lower-left third for code-rendered titles and play controls. Keep the full 16:9 image where possible; an aggressive center crop would remove this space. They share anthracite night, butter/ochre light and watercolor paper grain. The constellation image intentionally avoids the game's letter-based signs and Svelte mark to honor the no-logos/no-letters requirement.

Clouds are dark foreground layers, intentionally much quieter than the old silver-rimmed mist. Each has transparent top and bottom, a dense dark center, a soft lower edge and a different silhouette. They span both side borders. Assign A/B/C to different section seams; offset or mirror if needed. Do not tint them with a gray/olive gradient. Proofs show each at full layer opacity over both existing hero and cinema night plates.

The cinema painting leaves its center and left calm for one cream sentence. Keep the projected image subdued; its laptop and horizon are secondary to the site's outer scene and live text.

Roots all share a **700px canvas width**, centerline near **x350**, and identical RGBA attachment rows. Stack top → any number of middle tiles → end at the same rendered width, without a gap. Repeat only the middle vertically; do not stretch it to an arbitrary height. The middle's body measures **58px median (8.3% of canvas)**; the median width is **58px in each quarter**. Its natural local bark variation is 52–66px between the 5th and 95th percentiles, not progressive taper. At a 70px rendered canvas width the main root is about 6px wide. Rootlets extend beyond the body within the transparent margins.

The section-break canvases are exactly 3:1. Their generous transparent margins preserve a small, quiet mark; size by the visible artwork when placing them in an article. Screen, eyes and fireflies are the only pronounced lights. Treat all assets as decorative with empty alt text during integration.

## Inspection and evidence

Every transparent master has full-resolution `*-night.png` and `*-paper.png` composites in [previews/](previews/), over **#18191b** and **#fdf9ee**, without added backlight. These and the enlarged edge proofs were inspected for matte fringes, unintended halos, background rectangles and broken cutouts. The small firefly halos are intentional painted light.

- [qa-plates.png](previews/qa-plates.png): the three posters and cinema plate, reading order.
- [qa-clouds.png](previews/qa-clouds.png): A/B/C on night and paper.
- [qa-clouds-on-plates.png](previews/qa-clouds-on-plates.png): A/B/C on existing hero and cinema paintings.
- [qa-breaks.png](previews/qa-breaks.png): fireflies/laptop/owl on both backgrounds.
- [qa-roots.png](previews/qa-roots.png): top/middle/end on both backgrounds.
- [qa-root-joins.png](previews/qa-root-joins.png): enlarged top→middle, middle→middle and middle→end joins.
- [root-assembly-night.png](previews/root-assembly-night.png) and [root-assembly-paper.png](previews/root-assembly-paper.png): top + three consecutive middle repeats + end.
- [qa-alpha-edges.png](previews/qa-alpha-edges.png): actual boundary pixels enlarged 3×; rows A/B/C, top/middle/end, fireflies/laptop/owl.

[alpha-report.json](previews/alpha-report.json) records dimensions, exact sizes, SHA-256 hashes and zero/partial/full-alpha counts. [validation.json](previews/validation.json) verifies thirteen masters, nine real-alpha files, four exact 16:9 opaque plates, cloud dimensions and clear top/bottom borders, a transparent root ending, and **zero RGBA difference** at every root attachment/repeat boundary. Visual inspection supplements these numeric checks; pixel equality alone does not prove a pleasing join.

The initial clouds were regenerated to remove pale rims. The initial top root was regenerated from the middle because it tapered too far. A first technical join pass was replaced with overlapping painted texture after the proof exposed smooth bands. Final proofs show the corrected exports.

## Reproducible export

[finish_art.py](previews/finish_art.py) reads selected generator originals at the paths in the log. [inspect_art.py](previews/inspect_art.py) regenerates proofs and validation from the committed masters. Both write only inside this round-2 directory.

- Alpha below 3/255 is cleared; above 248/255 becomes fully opaque. Fully transparent RGB is zeroed. PNGs include an sRGB chunk. Resampling uses premultiplied alpha.
- Clouds are exported at 2560 × 500 inside 2560 × 600 transparent canvases. A 9px two-dimensional lower-edge feather softens their bottoms; newly feathered pixels inherit dark pigment, never a white matte.
- Middle root overlaps 64px of generated top/bottom texture to form a cyclic tile, then fits 700 × 1750. The final boundary row matches the first. Top and end join through 64px texture blends, not repeated flat pixel rows.
- The top entrance is horizontally narrowed around its center from 60% scale to full scale over its first 600px to keep it slim. The end loses only empty side margins. Middle root thickness is not tapered or reshaped.
- Vignettes are uniformly downsampled from 2172 × 724 to 1200 × 400.

No site build was needed for this isolated art delivery. Runtime responsive derivatives and placement remain with the implementation task.
