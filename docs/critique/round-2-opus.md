# Critique round 2: Claude Opus 5.5 (high)

Screens: `docs/screens/critique/round-2/`. Critic captures (`mk3`, `post-end`, `post-tab2/3`, `m-menu-home`, `st90`, `k*` .png): `C:\Users\peter\AppData\Local\Temp\claude\7fd82884588d2ef0\533573c9-754a-4d2d-b80e-51353927520b\scratchpad\out\`.

| Area | R1 | R2 |
|---|---|---|
| Homepage | 8.3 | 8.6 |
| /blog | 7.6 | 8.8 |
| /blog/[slug] | 7.3 | 8.7 |
| /stats | 7.8 | 8.5 |
| /kontakt | 8.0 | 8.9 |
| Site shell | 7.2 | 8.2 |
| Overall | 7.8 | 8.6 |

## 1. Homepage 8.6

Verified fixed: painted 22:00 poster, tighter 21:00 without label box, autoplay, scroll cue, real commits on the monitor, no heading/nav collision (nav hides on scroll down), radio label on mobile, ink-printed owner photo, reduced-motion frames. Keep: hero, desk, radio, game poster, reduced-motion stills, 21:00 autoplay behaviour.

1. Sunrise seam is the weakest moment (`home-1440-05`, `seam-sunrise`, `home-390-06`): cinema landscape ends in a ruler-straight dark band (y≈400–450); below it a scalloped cloud edge repeating every ~230px (tiled look); then ~450px empty butter wash with 06:00 alone. Fix: dissolve the treeline with an irregular painted alpha mask; one wide non-repeating dawn-cloud painting; empty wash ≤200px; 06:00 beside the coffee cup.
2. 04:00 cinema least finished (`home-1440-04`, `seam-cinema`): only hour without a display headline, label stranded on the rock under the radio; empty screen mostly a dark rectangle, projection fills only the lower third, text small bottom-left; burning frame still the brightest light on the page. Fix: 04:00 headline like the other hours (gpt-6.1-sol), projection fills the whole screen, ~20px text on a soft radial ink scrim, outer flame bloom −40%.
3. Dead bands: 21:00→22:00 ~250px flat cloud strip (`home-1440-01`, `seam-game`); 01:00→02:00 desk ends on a hard horizontal edge then ~230px black (`home-1440-03`, `seam-radio`). Fix: overlap stages 120–160px, irregular painted mask on the desk bottom, pull 02:00 up.
4. 21:00 titles overlap in the crossfade ("EMIT AIE", `mk3.png`, `Making.svelte:831-858`). Fix: outgoing title fades ~120ms, incoming starts after a 120ms delay.
5. 22:00 frame (x 50–1085) ignores the grid, 350px empty sky right, corner crop-mark lines stick out; mobile tab "BIS ZUM MOND STAPELN" hard-cut at the edge (`home-390-02`). Fix: full content width, or 8/12 frame + game info 4/12; mask fade on the tab row.
6. Mobile desk hotspot rings overlap the 01:00 heading (`home-390-02` bottom, `home-390-03`). Fix: keep hotspots ≥96px from the heading box.
7. Hero tagline "SIDE PROJECTS" on bright cloud (`home-1440-00`). Fix: 1px ink halo + soft ink shadow, or move onto dark sky.

## 2. /blog 8.8

Verified fixed: first entry visible at 1440×900, filters hidden with one post, one-style meta, art tied to the container at 1920, firefly closing line, smaller warm hill core. Keep: reading hill both themes, torn-edge feature row.

1. "• VIDEO FOLGT" is a letter-spaced mono chip (badge); in light the torn image casts a grey drop shadow (sticker) (`blog-1440-light-00`). Fix: video status into the meta line; remove the shadow.
2. Mobile: ~110px dead space between "Blog" and the intro (`blog-390-*-00`); in light the hill touches the "g". Fix: intro 24px under the headline, hill 16px from the type.

## 3. /blog/[slug] 8.7

Verified fixed: ~66ch measure, one paragraph style, painted breaks + pull quotes, ending (two-column links, back link), 16:9 mobile facade with readable text, mobile TOC disclosure, tidy meta/tags, no summary eyebrow.

1. Pull quotes sit directly above the paragraph containing the same sentence → duplicate (`…-1440-dark-02/03`, `…-390-dark-03`). Fix: hang them in the ~200px gutter between body and TOC at `lg`, or ≥2 paragraphs away from the source.
2. TOC highlight goes stale (IntersectionObserver only fires on crossing; End/PageDown/flings skip; screens 06–09 keep an earlier section active; nothing active at the end; `+page.svelte:98-110`). Fix: rAF-throttled scroll listener calling `update()`, last section when scrolled to the bottom.
3. Light title gradient turns muddy olive on line 3 (`…-1440-light-00`). Fix: solid ink, or ink→#8a5a12.
4. Wrapped link arrow ↗ floats ~50px right of "Cloudflare Workers Dokumentation" (`…-1440-dark-09`). Fix: keep last word + icon together (nowrap, inline).

## 4. /stats 8.5

Verified fixed: constellation labels, ledger grid + tabular numbers, palette deltas, KPI markers on a glowing line, views chart height, solid ranks, light constellation on butter wash, glowing light tree. Keep: tree hero, curve as path to the tree, 90-day switch.

1. Root still fails (`stats-*-01..05`, `st90.png`): hair-thin wavy line at x≈1335, a crack in dark, a hanging rope in light; starts from the hill flank, not the tree's roots (x≈1100–1250). Fix: start at the root flare, taper 6→2px with granulation, 2–3 rootlets toward section headings, fade out well before the footer — or delete it; the page holds without it.
2. Light theme reads as three black stripes: ~160px black hill base with horizontal streaks, black torn KPI ribbon, footer band (`stats-1440-light-00..05`). Fix: fade the hill to paper over ~120px with a textured mask; in light, KPIs use the dark version's single line with ochre nodes.
3. End-date label "31. Okt." sits mid-curve under the mascot while the curve runs ~250px further (`st90.png`). Fix: label at the end dot along the normal; hide < 640px.
4. "› Daten als Tabelle" and the rotated "BEISPIELDATEN" stamp float in a ~230px gap (`stats-1440-dark-01`); the stamp is a badge and repeats the italic note. Fix: delete the stamp, attach the toggle 16px under the curve start.
5. Heading brush smear runs into the first words of the subtitle (`stats-1440-dark-02`). Fix: smear ~0.35em at the heading baseline, then 8px gap.
6. Mobile calendar still confetti (~5px dots, `stats-390-*-05/06`). Fix: 13 weeks below 640px with dots ≥8px, or horizontal scroll with fade.
7. Top videos "Aufrufe: 8.965" in mono reads like debug output. Fix: "8.965 Aufrufe" (existing words only), tabular, right-aligned.

## 5. /kontakt 8.9

Verified fixed: hand-ruled radio topics (2×2 / list), margin line + active line by the caret, sticky owl, one-line headline on mobile, reasonable bottom gap. Keep: owl, ruled pad, inked focus, mobile composition.

1. Labels are letter-spaced mono caps ("DEIN NAME", "WORUM GEHT ES?") = eyebrow style; ~45px above the rule with an invisible input box. Fix: 14px Geist Medium sentence case (existing strings, CSS case only), 6–8px above the writing line.
2. Send button is the last generic CTA (glossy butter pill, drop shadow, glow). Fix: wax-seal motif — butter seal disc stamped with the crescent, label beside it in ink.
3. Sent state not verified (Turnstile blocks headless). Someone must look at it.

## 6. Site shell 8.2

Verified fixed: one grid, shared nav type, ochre light crescent, 5+4 icons, painted night gradient, 404 header/license card/one-column routes, subpage mobile menu (excellent).

1. Regression: giant full-width "SOLO STACK" footer wordmark = most-copied 2024–25 template trope; repeats nav logo and homepage hero; clipped at the page edge (span ends at 905px in a 900px viewport; `SiteFooter.svelte:476-505`, `overflow: clip` + negative margin) (`post-end.png`). Fix: remove it; if a mark is wanted, small cream inside the ink ground; if kept, letters behind the ridge, never clipped.
2. Regression: light footer is a sandwich: paper → ridge → ~90px ink band → dry streaks → paper → fine print → black wordmark (`blog-1440-light-01`, `kontakt-1440-light-02`, `stats-390-light-06`). Fix: one ink ground to the bottom (textured, cream fine print), or no band at all with ink type on paper under the ridge.
3. Too many footer layers (horizon, band, ~100px gap, fine print, wordmark). Fix: horizon + one ground holding tagline, icons, fine print.
4. Keyboard focus is a boxy 2px butter rounded rectangle on nav links/logo (`post-tab2/3.png`) — the outline the owner rejected. Fix: focus drawn like the active state (3px butter swash under the link + soft glow, ≥3:1).
5. Homepage mobile menu overlay is translucent: hero wordmark/tagline show through; hamburger peeks beside the close X (`m-menu-home.png`). Fix: opaque ink ≥92% or blurred backdrop; hide the trigger while open.
6. Minor: "WEGE DURCH DIE NACHT" mono label on 404 is an eyebrow → sentence case.

## 7. Overall 8.6

Remaining blockers: shell regressions (giant cropped footer wordmark, light footer sandwich), two homepage moments (cinema→sunrise seam, unfinished cinema), leftover template pieces (mono caps labels, glossy pill CTA, boxy focus rings, stats stamp), small correctness glitches (stale TOC highlight, 21:00 title overlap, misplaced "31. Okt.", root that reads as a crack).
