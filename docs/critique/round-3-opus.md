# Critique round 3: Claude Opus 5.5 (high)

Screens: `docs/screens/critique/round-3/`. Note: `home-1440-03` shows the hero instead of 02:00 (capture glitch). Agent state shots in `docs/screens/round-3/*` partly predate merges; judged against the live server.

| Area | R2 | R3 |
|---|---|---|
| Homepage | 8.6 | 9.2 |
| /blog | 8.8 | 9.4 |
| /blog/[slug] | 8.7 | 9.1 |
| /stats | 8.5 | 9.0 |
| /kontakt | 8.9 | 9.4 |
| Site shell | 8.2 | 8.9 |
| Overall | 8.6 | 9.1 |

## 1. Homepage 9.2 (to 9.5: fixes 1–3)

1. The same 9 social links appear 4× in one viewport stack (dial icons, preset keys, the "Senderverzeichnis" card, footer icons; `seam-cinema`, `home-390-04`). The Senderverzeichnis card is the most UI-like object on the page (tilted rounded cream card, drop shadow, letter-spaced mono header; on mobile a 350×440 list card). Fix: delete the visible card; show the tuned station's name + handle in the radio's lower display (`Sender gesucht` → `YouTube · @solostack_dev`); keep a visually hidden `<ul>` of links for screen readers / no-JS. If a printed list must stay: a small paper tuning chart taped to the radio's side, no rounded corners, no shadow, sentence-case title.
2. The 01:00 monitor shows raw agent-written commit subjects (e.g. "Critique round 1 (Opus 7.8, gpt…"; `seam-radio`, `reduced-03`): exposes internal critique scores, truncates mid-word. Fix: filter the source (drop `Merge`, `Critique`, `screenshots` commits and anything with parentheses/scores), truncate at a word boundary.
3. Mobile 01:00→02:00 (`home-390-03`): a hotspot ring sits on the end of "Tippe die Dinge an" → keep the hint ≥24px clear of every ring; ~200px flat black between hint and 02:00 → halve it; the radio horizon glow at y≈745 is a ruler-straight bright line → irregular mask or lower opacity.
4. Mobile 22:00 tab row still hard-cut at the right ("STAPELN", `home-390-01`). Fix: `mask-image: linear-gradient(90deg,#000 85%,transparent)` on the scroller, removed at scroll end.
5. Cinema link `ZUM YOUTUBE KANAL→` is letter-spaced mono caps, arrow touches the L → sentence-case Geist Medium 16px with a thin space before the arrow (like "Noch eine Nachricht schreiben"); top 40% of the screen empty → text block at ~38% of the screen height.
6. 22:00 frame = hairline gold border + outer glow, the last "card" look. Fix: torn-paper / ink-brushed edge like the blog feature image, no outer glow.

Keep: hero, ink-line bulb with watercolor fill, desk with (filtered) real commits, radio hardware + keys, projection cone on mobile cinema, dawn cloud bank, coffee/laptop sunrise, opaque home menu with the hour list.

## 2. /blog 9.4 (to 9.5: 1 + 2 + shell wordmark)

1. Mobile: "• Video folgt" wraps alone onto its own line (`blog-390-light-01`). Fix: `text-wrap: balance` on the meta line or status at the front.
2. Light "Blog" gradient turns olive-brown in the g descender. Fix: solid ink, or end the gradient at 85% before the descender.

Keep: reading-tree masthead both themes, torn feature image, open feature row, firefly closing line.

## 3. /blog/[slug] 9.1 (to 9.5: 1 + 2)

1. Pull quotes still duplicate text in one viewport ("Bei den Bildern zeigte sich…" opens the section and returns 3 paragraphs later, `…-1440-dark-06`; "Daraus wurde eine Nacht…" repeats the intro's last sentence); bold display face at ~h2 size reads like headings. Fix: at ≥lg hang them in the gutter between body and TOC at 20–22px display, regular weight, ochre rule; in-flow on mobile ≥1 section away from the source. Or use sentences not in the body (gpt-6.1-sol).
2. Panorama break has hard vertical left/right edges (`dark-04`). Fix: mask with ~48px horizontal feathers plus the torn bottom.
3. Light title third line is a separate brown block (`light-00`). Fix: solid ink, or a gentle ink→#6b4a12 across the whole title.

Keep: title scale, lede rule, measure, hollow-dot bullets, sticky TOC, two-column links, AI disclosure, mobile TOC disclosure.

## 4. /stats 9.0 (to 9.5: 1–3)

1. Daily-views chart is the most generic object (`stats-1440-dark-02/03`): gradient pill bars, tooltip pinned open by default, 9px grey mono y labels, "4.500" floating ~150px above the tallest bar. Fix: flat-topped brush strokes (square caps, slight width jitter) in ochre on the ground; tooltip only on hover/focus; y labels 12px muted with hairline ticks; y-max = rounded-up real max (3.593 → 4.000).
2. Light KPI ground is a grey smudge (`stats-1440-light-02`, `390-light-03`). Fix: warm wash (butter ~18% with ochre granulation) or ink ≤10%.
3. Light hill = full-width black mass ~250px tall (`light-00/01`). Fix: in light render the hill as ink wash, 70–80% at the crest fading to ~35% at the foot, glowing curve still reads.
4. Mobile calendar dots still 5–9px (`stats-390-*-05/06`). Fix: ≥10px dots in 18px cells below 640px.
5. "› Daten als Tabelle   Stand: 31. Oktober 2026" reads like debug output. Fix: Geist 14px sentence case, date as a separate muted line.

Keep: tree + curve path, mascot, giant follower count, constellation both themes, ledger, deltas, top-video ranks.

## 5. /kontakt 9.4 (to 9.5: 1 + 2)

1. The seal reads as a glossy gold coin/emoji (perfect circle, gradient). Fix: irregular wax outline with a pressed rim, matte ochre-butter wax, slight drip, small ink shadow only; press = 2px depress.
2. Sent state not re-verified on the merged footer. Fix: force `sent = true` temporarily, capture 390/1440/1920, revert.
3. Sent page thin: ~250px empty paper between the link and the horizon. Fix: owl's flight path ends as a small silhouette near the horizon, or tighten the gap.

Keep: owl + sealed letter, sticky owl, ruled pad, hand-ruled topics, warm red errors, "Danke dir" with swash, owl take-off.

## 6. Site shell 8.9 (to 9.5: 1–3)

1. Regression: at 1920 the footer wordmark reads "SOIO STACK": the ridge covers the L's foot (~40% of the letters) (`post1920end.png`, `kontakt-1920-dark-01`, `post-1920-light-end`). Cause `SiteFooter.svelte:133-142`: baseline is a fraction (`--foot`) of the viewport-scaled strip height `--land-h` while `--mark-size` is capped by `--content-max`; above ~1700px the ridge outgrows the letters. Fix: derive the baseline from the mark (e.g. `--foot = (ridge line at the wordmark − 0.12 × --mark-h) / --land-h`) or cap `--land-h` at the content width; verify the L foot at 1280/1440/1680/1920/2560.
2. Wordmark fill is a grey cloud photo clipped into the letters (image-in-text trope), muddy greige in dark, dirty grey on light paper (`blog-1440-light-01`, `stats-1440-light-04`); mobile two-line block ~180px tall. Fix: dark = cream pigment (#efe5cc) granulating to butter at the feet; light = granulated sumi ink ~85%; < 640px one line at column width (~0.166 × column) instead of stacking.
3. 404 is the last off-system page (`404-1440-00`): glossy butter pill CTA with a home icon → sentence-case ink link with the swash, or the wax seal; round medallion sticker overlapping the "4" → delete or paint into the scene; saturated blue sky outside the palette → regrade toward night ink + butter dawn.
4. Theme chooser still a plain dropdown panel. Fix: torn/deckle top edge on the paper surface, ink-drawn tick.
5. Footer fine print is letter-spaced mono caps (`© 2026 SOLO STACK`, `IMPRESSUM…`). Fix: 13px Geist sentence case like the homepage footer links.

Keep: crescent, shared grid, nav hide + scrim on the way up, swash focus, typographic mobile menus with the horizon, one ink ground, owl tree + laptop horizon, 404 world tree + "Wege durch die Nacht".

## 7. Overall 9.1

Separating it from 9.5: (a) 1920 footer legibility bug + muddy wordmark material; (b) remaining template objects (404 pill + medallion, Senderverzeichnis card, gradient-pill bars with default tooltip, coin-like seal); (c) editorial duplication (pull quotes, 4× social links); (d) agent-written commit subjects on the 01:00 monitor. Fixing shell 1–3, home 1–2, post 1, stats 1–2, kontakt 1 should take every area to 9.5.
