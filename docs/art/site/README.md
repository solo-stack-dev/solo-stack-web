# Silhouettennacht production art

> **Cleanup (2026-11-10):** working images (previews, rejects, raw sources, superseded layers, QA screenshots) were removed from the tree to keep the repo small. They remain in git history at commit `dbb4371`.

Original watercolor/sumi artwork for the subpages of solo-stack.dev, generated and inspected on 2026-11-05. Thirteen PNG masters, nine with native alpha and four intentionally opaque. No moons, typography, logos or UI. No application files changed.

## Masters

Dimensions refer to the complete final canvas. All nine RGBA files have clean, graded alpha, fully transparent exterior pixels, and no visible white/gray matte or painted checkerboard in the inspected proofs. The light overlays intentionally have no fully opaque pixels.

- [blog/blog-reading-hill.png](blog/blog-reading-hill.png): **1672 × 941**, RGBA. Uniformly framed bottom/right; left 45.4% is entirely empty. Tree, seated mascot, laptop and fireflies form one layer.
- [blog/video-project.png](blog/video-project.png): **1672 × 941**, opaque RGB. Laptop on cliff.
- [blog/video-ai-test.png](blog/video-ai-test.png): **1672 × 941**, opaque RGB. Mascot studying a jar of fireflies.
- [blog/video-ai-news.png](blog/video-ai-news.png): **1672 × 941**, opaque RGB. Radio mast with soft signal arcs.
- [blog/video-business.png](blog/video-business.png): **1672 × 941**, opaque RGB. Forest stall with one warm window.
- [stats/stats-growth-tree.png](stats/stats-growth-tree.png): **1190 × 1322**, RGBA. Luminous branching and leaf clusters, dark trunk, flat mound attachment at the bottom edge. Maintain the canvas when aligning it to a hill.
- [stats/stats-tree-rays.png](stats/stats-tree-rays.png): **1586 × 992**, RGBA. Separate gold rays and haze, maximum alpha 132/255. Place behind the canopy/trunk; the painted emission origin is near upper center.
- [stats/stats-mascot-sitting.png](stats/stats-mascot-sitting.png): **700 × 700**, RGBA. Side/back view, gaze up/right. Ground contact is approximately y=663, including grass.
- [contact/owl-open.png](contact/owl-open.png): **1254 × 1254**, RGBA. Perched tawny owl with glowing eyes and rolled sealed letter; branch runs off right edge.
- [contact/owl-closed.png](contact/owl-closed.png): **1254 × 1254**, RGBA. Same canvas and pixels outside the two eye patches. Thin closed lids, no iris glow.
- [contact/owl-flying.png](contact/owl-flying.png): **1513 × 1039**, RGBA. Same messenger in flight toward upper left with the letter; complete wingspan contained with padding.
- [shared/footer-horizon.png](shared/footer-horizon.png): **2172 × 299**, RGBA. Approximately 7.27:1; upper 55.5% fully transparent, bottom row fully opaque. Ground runs off both sides and bottom. Tiny owl/tree left, laptop/cliff right.
- [shared/backlight-wash.png](shared/backlight-wash.png): **1604 × 980**, RGBA. Granulated butter/ochre pigment bloom, maximum alpha 204/255.

## Generation and limitations

The built-in OpenAI `image_gen` tool was used for every subject, paint texture and edited eyelid. It exposes native transparency but does **not** expose its underlying model name, a quality selector, an exact-size parameter or a seed. Prompts requested highest available quality. Exact model/quality settings therefore cannot be certified.

The generator returned roughly 1.6-megapixel native canvases, below several requested target sizes. These native dimensions were retained rather than enlarged without adding detail; the seated mascot was downsampled to 700 × 700. The footer required regeneration within a 3:1 source canvas followed by cropping empty sky to preserve the requested strip aspect. These are the delivery limitations; all requested subjects and states are included.

Complete exact prompts, ordered references, edits and source identifiers: [PROMPTS.md](PROMPTS.md). Machine-readable lineage: [generation-log.json](generation-log.json). Original/rejected generated files remain in the local generator output directory and are not part of this commit. The final PNGs are self-contained.

## Alpha inspection and proofs

Every transparent asset has two full-resolution opaque preview composites under [previews/](previews/), named `<asset-stem>-night.png` and `<asset-stem>-paper.png`:

- Night: `#18191b` with a soft butter glow behind the subject.
- Paper: `#fdf9ee`.

The three `qa-sheet-*.png` files combine those proofs for inspection. [qa-edges-black-paper.png](previews/qa-edges-black-paper.png) additionally shows selected actual boundary pixels over pure black and cream, enlarged without smoothing. All composites and edge proofs were visually inspected. The four opaque frames were inspected individually for series consistency, subject, composition and absence of moons/text.

Numeric alpha evidence is in [alpha-report.json](alpha-report.json). [validation.json](validation.json) records these passing assertions:

- Nine real RGBA masters and four opaque RGB masters.
- Owl blink: **0 changed pixels outside the eye patches**; alpha channels identical. There are 12,969 changed pixels within the patches.
- Reading hill: left 45% entirely transparent.
- Footer: upper 45% entirely transparent; entire bottom row opaque.

No site build or browser review was necessary: this is an isolated art delivery, without runtime integration or public copy.

## Deterministic finishing

[previews/finish_art.py](previews/finish_art.py) documents the complete finishing pipeline using existing Pillow and NumPy. No packages were installed. It accepts the directory containing the logged original `exec-*.png` files and regenerates the masters. [previews/inspect_art.py](previews/inspect_art.py) regenerates proofs and evidence directly from the committed masters.

- Native alpha below 3/255 was cleared to remove invisible background noise; values above 248/255 became opaque. Transparent RGB was zeroed. Graded brush/feather boundaries remain intact.
- Reading hill was uniformly reduced to 86%, anchored bottom/right in its unchanged canvas, reserving the headline area without distorting the mascot or tree.
- Tree source was cropped at y=1290 to establish the flat mound base, then uniformly fitted inside 1120 × 1250 and anchored bottom-center in its 1190 × 1322 canvas. Canopy and motes have breathing room.
- Flying owl was uniformly reduced to 94% inside its original canvas for clear feather-tip margins.
- Seated mascot was alpha-aware Lanczos downsampled to 700 × 700.
- Footer was regenerated with its landscape confined to the bottom of a 2172 × 724 canvas, then cropped to `(0,425,2172,724)`. The bottom row alpha was made fully opaque for page attachment.
- The wash and rays initially contained pale/white-matted fringes visible on night. White matte was removed mathematically: pigment coverage is derived from the blue channel relative to butter blue 114/255; RGB is unmatted and this coverage multiplies the original native alpha. Maximum opacity multipliers are 0.80 for the wash and 0.52 for the rays. Original painted grain and irregular boundaries remain; no procedural replacement art was drawn.
- Closed eyelids were generated by editing the open master. Only the two generated eye patches were assembled over the open master, with 10-pixel inward feathering: `(380,309,477,383)` and `(488,265,579,345)`, half-open source coordinates. No surrounding feather, branch or letter pixels can flicker. The assertion checks both outside-patch pixel equality and full alpha equality.

## Integration

Keep PNG masters in this documentation folder. Runtime derivatives can use the site's existing responsive image pipeline with alpha-preserving WebP/AVIF. Use the same canvas and placement for both perched owl frames. The separate wash and rays allow theme-specific strength without recoloring silhouettes. These illustrations are decorative (`alt=""` per the redesign brief); no new visitor text is included.
