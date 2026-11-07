# Critique round 3: gpt-6.1-sol (high)

| Area         | R2  | R3  |
| ------------ | --- | --- |
| Homepage     | 8.8 | 9.4 |
| /blog        | 9.0 | 9.5 |
| /blog/[slug] | 8.6 | 9.5 |
| /stats       | 8.3 | 9.2 |
| /kontakt     | 9.0 | 9.5 |
| Site shell   | 9.0 | 9.3 |
| Overall      | 8.8 | 9.4 |

## 1. Homepage 9.4

1. Cinema's outer frame still draws attention before the projected picture (`home-1440-04`, `home-390-05`); the uninterrupted luminous perimeter feels like an applied effect. Fix: tighten the frame's alpha falloff and cut the remaining outer bloom by ~another third (`Cinema.svelte:590`); keep the thin aperture edge in `.screen::after`; strongest spill near the beam's arrival.

Verified: sunrise seam, dawn transition, 06:00 by the coffee, desk/radio overlap, game frame + info, mobile 21:00 group, sequenced titles. Keep: moon/wordmark, mascot scale, ink line, game posters, desk, radio, coffee/laptop sunrise, mobile hero. Keep current section spacing and dawn treatment.

## 2. /blog 9.5 — no deduction. Do not add ornament or restore filters.

## 3. /blog/[slug] 9.5 — no deduction. Keep measure, rhythm, grain, headings, lede rule, resources, outline, firefly ending; pull quotes have sufficient distance.

## 4. /stats 9.2

1. Bar-chart ground is procedural: dense triangular grass = sharp sawtooth baseline, esp. on paper (`stats-390-light-04`, `stats-1440-light-03`). Fix: replace the triangle loop in `ViewsColumns.svelte:50` with a shallow dry-brush baseline (2–4px depth, irregular gaps, sparse tufts); bars and geometry unchanged.
2. Mobile calendar opens on its oldest weeks (May–Sep; October hidden) (`stats-390-*-05`). Fix: initialize an overflowing mobile calendar at its rightmost position after measurement (`ActivityCalendar.svelte:79`), show the left continuation cue, preserve manual scroll position.

Keep: tree as the curve's destination, mascot, follower number, constellation/ledger, aligned KPIs, firefly calendar. No further landmark/background art needed.

## 5. /kontakt 9.5 — no deduction. Keep the form visually quiet; keep the crescent wax seal.

## 6. Site shell 9.3

1. Mobile 404: return action falls below the 390×844 fold (`docs/screens/round-3/shell/404-390.webp`). Fix: narrow-screen tree panel `padding-top` 58svh → ~38svh in `ErrorShell.svelte:331`, ink wash follows; full return action above the fold; keep the full tree and climbing interaction.

Verified: one continuous footer ink ground, wordmark behind the ridge (reads as a landmark — the lead's compromise succeeds), legal + icons on the ground, opaque home menu, swash focus, theme chooser, quieter article grain, 404 label. Keep all of it; no further shell redesign.

## 7. Overall 9.4

Remaining: stats chart sawtooth, mobile 404 recovery, cinema frame light, mobile calendar orientation.
