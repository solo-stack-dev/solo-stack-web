# Critique round 5: Claude Opus 5.5 (high)

| Area | R4 | R5 |
|---|---|---|
| Homepage | 9.3 | 9.4 |
| /blog | 9.5 | 9.5 |
| /blog/[slug] | 9.3 | 9.5 |
| /stats | 9.2 | 9.5 |
| /kontakt | 9.5 | 9.5 |
| Site shell | 9.2 | 9.4 |
| Overall | 9.3 | 9.4 |

Sent state verified live through the honeypot discard path (no mail sent), on the merged footer at 1440/1920 dark and 390 dark/light: `docs/screens/critique/round-5/opus/kontakt-sent-*.webp`. "Danke dir" + link sit cleanly above the wordmark, the footer stays legible, mobile is compact. That closes the open R4 item.

Round-4 requests checked: 17 of 21 solved cleanly. Still open: cinema edge (still reads as a crisp rectangle), mobile radio song title (still clipped). New: one regression from the laptop fix (owl tree now sits inside the S at 1024–1280), and the desktop 404 note crowds the nav. Homepage mobile footer is still the centred stack the shell just dropped.

## 1. Homepage 9.4 (to 9.5: 1–3)

Solved: one station name (upper = glyph + player + track, lower = handle), soft horizon (no ruled line at 1440/1920, `seam-cinema`), "unten" line dropped, monitor shows real commits only (`seam-radio`), mobile hotspot pinned to the chair base, 06:00 label on the column.

1. **Cinema edge still reads as a drawn rectangle.** Zoomed (`round-5/home/home-1440-cinema` top-right and bottom edges; `home-390-cinema`, `critique/.../home-390-04`) the top/right/bottom edges are a continuous, ruler-straight 1px cream line. The breaks in `--edge-a/b/c` are 3–4% long and get lost under `filter: blur(0.35px)`. On mobile the full four-sided hairline box is plain to see. The lead decision asked for no crisp hairline rectangle. Fix (`Cinema.svelte` `.screen::after`): on the three sides away from the beam, drop the 1px core layer (`--edge-a/b/c … / 1px`). Keep only the soft stroke at `--soft-lo`, with 2–3 real gaps per side of 8–12% length. Keep the beam side as is. Check at native size that no side reads as a continuous line.
2. **Mobile radio song title clipped by the bezel** (`round-5/home/home-390-radio-tuned`): "♪ Open Air" is cut to "Open Aı" with no ellipsis. `.glass-song-title` can ellipsize, but the glass content box runs under the painted bezel. Fix (`RadioSet.svelte`): below 640px give `.glass` (or `.glass-station`) about 0.75rem inline-end padding. If that's still tight, shorten the volume slider so the full title fits or ellipsizes inside the glass.
3. **Homepage mobile footer is still a centred stack** (`critique/.../home-390-06`): portrait + wordmark, then centred Impressum/Datenschutz/Kontakt in a column, then icons 5 + 4 centred. The subpage footer is now left-aligned with 9 icons in one row (`blog-390-*-01`). Fix (`sunrise/Sunrise.svelte`, mobile `.bar`): `justify-items: start; text-align: start`. Legal links in one row (`.legal ul` row, wrap) aligned to the column, icons in one row at 36px. Keep the portrait + wordmark line.

Keep: hero, ink line, game frame, night-shift room and real `git log`, radio idle and tuned states, mist horizon, cinema composition and beam, dawn transition and sunrise footer art, reduced-motion stills.

## 2. /blog 9.5

Ochre "Video folgt" dot in light: done. Light wordmark is fixed (see shell). No changes.

## 3. /blog/[slug] 9.5

All four solved. The title warms only at the feet of the last line (`1440-dark-00`, `390-dark-00`). The date no longer breaks (`dark-04`, `390-dark-05`). The radio vignette is left-aligned with its heading (`dark-07`, `light-07`). The pull quotes open the sections after their sources ("Vom Mond…", "Musik und Kino…") and never share a viewport with the source. No changes.

Keep: lede bar, "Das Wichtigste" fireflies, heading strokes, sticky TOC, deckled panorama, hung quote bars, link list, AI note.

## 4. /stats 9.5

Solved. Bars are thinner with ~40% gaps and painted texture. One butter firefly marks the max day (`dark-03`). The ground is a single dry-brush stroke with no crumbs in either theme. The light hill is granulated warm ink (`light-00`). The mobile crest is organic and keeps the "31. Okt." label (`390-*-01`). No changes.

Keep: glowing tree + follower curve on the hill, constellation (dark) / pigment wash (light), platform rows with sparklines, YouTube band, contribution field.

## 5. /kontakt 9.5

Sent state verified (see top). Optional, no deduction: in the dark sent state the owl in flight is a dark-on-dark speck mid-sky (`opus/kontakt-sent-1440-dark-00`, x≈845 y≈540). A faint butter rim light on its silhouette would make the flight read.

## 6. Site shell 9.4 (to 9.5: 1–2)

Solved: the 404 licence is now aged paper with a deckle edge, straight corners and ink stamps, no rainbow (`404-1440-license`, `404-390-license`). The phone seal sits inline beside the 404 (`404-390`). The speech note is a torn paper scrap in ink type. The light wordmark is dark sumi and stands clear above the ridge (`blog-1440-light-01`, `footer-2560-light`). At 1280 the laptop is clear of the K. The mobile footer is left-aligned with one icon row.

1. **Regression: the owl's tree now stands inside the S at 1024–1280** (`round-5/shell/footer-1280-dark`, x≈100–170; `footer-1024-light`, x≈90–130). Its crown tangles into the S's lower bowl: the twin of the old laptop/K collision. At 1440+ it is clear. Cause: the wider `--land-w` that keeps the laptop off the K pulls the strip's left part into the column. Fix (`SiteFooter.svelte`, the 64rem block around `--laptop-x`/`--land-w`): anchor the tree too. Its crown should end at least 2% of the column left of the S. Where both can't fit, let the tree crop off the left screen edge rather than overlap the letter (e.g. shift the strip's left part with its own offset, or mask the tree below 1360px).
2. **Desktop 404 note crowds the scene** (`round-5/shell/404-1440-climbed`). The paper note's top sits about 30px under the nav row ("03:00"), and its left edge butts against the standing figure's head and shoulder (x≈1150, y≈80–100), so the speaker looks cut by his own line. Fix (`WorldTree.svelte` `.bubble.is-wanderer` / `.bubble.is-climber` desktop position): keep at least 16px clear of the figure and at least 48px clear of the nav. Place the note left of the treetop or lower beside the figure, angled toward the speaker. The phone placement is fine.

Optional (no deduction): the licence has two emblems (small top-left + large stamp) plus an inner hairline inside the deckle. Dropping the small emblem and the inner rule would make it calmer. The desktop seal is still a line medallion in the bottom-right corner (`404-1440`). Painting it into the trunk base would finish the R4 idea.

Keep: 404 world tree, climb, sunrise reveal, return link and the "Wege durch die Nacht" list, nav, theme toggle, horizon footer with tree/owl/laptop at 1440+, light and dark wordmark lettering.

## 7. Overall 9.4

The site is one step from ship. What's left is craft at the edges, with no concept issues: the cinema still has a visible hairline box, one clipped title on the mobile radio, the homepage mobile footer doesn't match the new shell footer, the footer tree collides with the S at 1024–1280, and the desktop 404 note is badly placed. Five small single-agent fixes.
