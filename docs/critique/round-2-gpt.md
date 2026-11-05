# Critique round 2: gpt-6.1-sol (high)

Screens: `docs/screens/critique/round-2/`.

| Area | R1 | R2 |
|---|---|---|
| Homepage | 8.3 | 8.8 |
| /blog | 8.0 | 9.0 |
| /blog/[slug] | 7.7 | 8.6 |
| /stats | 7.6 | 8.3 |
| /kontakt | 7.8 | 9.0 |
| Site shell | 7.9 | 9.0 |
| Overall | 7.9 | 8.8 |

## 1. Homepage 8.8

Confirmed: game poster resolved, tabs aligned, repeated cloud silhouettes replaced, cinema has a painted scene, monitor fallback, radio text fits, portrait belongs on the sunrise paper, nav hiding fixes collisions.

1. Cinema→sunrise still exposes the construction (`home-1440-seam-sunrise`: dead-straight horizontal change, then several hundred px of empty yellow wash; `home-390-06` same). Fix: overlap the sunrise landscape upward ~160px desktop / ~100px mobile; painted alpha boundary instead of a straight termination; reduce the mobile stage's top margin (`Sunrise.svelte:575`); bring the distant ridge into view during the transition; keep the coffee scene.
2. Mobile 21:00 split into two distant groups (`home-390-01`): drawing/title above, transport/pillars at the floor, big gap. Fix: remove the mobile console's bottom anchoring (`Making.svelte:1105`), place it 32–48px under the active title, reshape the laptop line around that group; transport and pillars together.
3. Cinema frame emits more energy than its contents (`home-390-05`, `home-1440-reduced-05`). Fix: halve the outer yellow bloom opacity/spread, keep a thin bright inner edge, strongest glow where projection meets the screen.

Keep: moon/wordmark, mobile hero, ink-line concept, the three game posters, desk, radio hardware + station keys, coffee/laptop sunrise, duotone portrait, ordinary scrolling through 21:00.

## 2. /blog 9.0

1. Mobile masthead still too tall: first title at y≈715 (`blog-390-*-00`). Fix: mobile `--art-w` 118vw → ~100vw with an explicit right anchor, shorter intro→rule→entry gaps; first title at ~y=600 at 390×844 (`blog/+page.svelte:151`).
2. Dark reading hill loses silhouette separation (`blog-1440-dark-00`): crown, reader, ground merge into the background. Fix: restrained, locally shaped warm backlight behind crown and shoulder; clean darkness between art and title; no broad brown halo (`ReadingHill.svelte:129`).

Keep: tree + headphone reader, sumi on paper, open feature row, torn edges, title weight, arrow, single meta line, whole-entry link + focus.

## 3. /blog/[slug] 8.6

1. Section-break illustrations decorate without changing rhythm (`…-1440-dark-04/07`, `…-390-light-06/10`): small centered laptop and owl are ornaments; the owl above the music/cinema section has no relationship to it. Fix: first break → a wide, shallow homepage scene crop (night journey); replace the owl with a desk or radio detail beside its relevant section; different scale and alignment for the two; keep the reading measure (`section-breaks.ts:35`).
2. Contents indicator unreliable after big jumps (stays on "Wo die gemalten Teile nicht passten"; nothing active with the final heading near the top). Fix: init after the body exists; rAF-throttled scroll + resize handler that picks the last heading above the threshold; don't rely only on an observation band (`+page.svelte:97`).
3. Mobile contents disclosure arrives ~1,800px down (`…-390-dark-00..02`). Fix: move it right below the metadata, above the video facade.

Keep: title, typography both themes, lede stroke, paragraphs, hanging pull quotes, unboxed resources, sticky desktop outline, mobile caption, horizon ending.

## 4. /stats 8.3

1. Replacement root reads as a hanging cord / page border (`stats-1440-light-01..05`, `stats-1920-dark-01..03`); connection to the tree obscure; 36px canvas with ~8px bark (`Roots.svelte:25`). Fix: broader branching entrance + 2–3 asymmetric tapered stretches ending behind section starts, never a constant-width strand down the page; clear of data.
2. KPI ground is conspicuously synthetic, especially in light (`stats-1440-light-02`, `stats-390-light-03`): straight black strip, glowing crest, uniformly jagged procedural lower edge (`YoutubeSection.svelte:47`). Fix: keep subgrid + aligned numbers; irregular painted alpha mask, varying depth, no glossy crest halo on paper.
3. Mobile calendar visually compressed (7 rows ≈ 85px, `stats-390-*-05`). Fix: 16px minimum cells < 640px, horizontal scroll with a visible continuation cue, 12px labels, keep roving focus (`ActivityCalendar.svelte:185`).
4. Light tree still faded (`stats-1440-light-00`). Fix: deepen only the canopy's ochre midtones, less wash behind the outer leaves; keep pale highlights and the dark trunk.

Keep: path into the tree, mascot for scale, follower number, dark canopy, ledger, deltas, aligned stats, activity as fireflies.

## 5. /kontakt 9.0

1. Corrected fields keep the error look: submit empty, then choose a topic → radio stays `aria-invalid="true"`, red, message still shown. Fix: after the first submit attempt, revalidate changed fields on change/blur and clear error styling + message when valid; keep first-error focus (`kontakt/+page.svelte:26`).
2. Mobile opening overcorrected: owl gets a large separate stage; first field barely starts at the viewport bottom (`kontakt-390-light-00`). Fix: mobile hero top padding −40–48px, intro→topics −16px, keep ≥24px between branch ink and headline (`:363`).

Keep: owl + sealed letter, sticky companion, ruled choices, unboxed letter surface, focus marks, warm red errors, single success headline, blink, reduced motion.

## 6. Site shell 9.0

1. Theme chooser is a stock component (`ThemeMenu.svelte:40`): rounded popover, floating shadow, rounded rows, generic icons. Fix: keep semantics + lazy loading; paper/ink surface, restrained square corners, no floating shadow, ink selection mark; shared focus token on portalled items.
2. Reading surfaces carry too much texture (article middle, `…-390-dark-04..12`). Fix: article-page grain 5% → ~2–3%, stronger texture only around hero and footer art; page-specific (`(site)/+layout.svelte:46`), not flattening the homepage.

Keep: crescent, shared grid, directional nav hiding with keyboard recovery, deep ochre light focus, full-screen typographic mobile menu, painted footer horizon, social targets, oversized closing wordmark, 404 world tree.

## 7. Overall 8.8

1. Continuous-world transitions uneven: sunrise seam, detached stats root.
2. Some fixes imitate materials: serrated KPI ribbon, stock theme popover.
3. Mobile hierarchy + interaction feedback: 21:00 controls, article nav position, calendar spacing, corrected form errors.
