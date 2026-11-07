# Critique round 7: Claude Opus 5.5 (high)

| Area         | R6  | R7  |
| ------------ | --- | --- |
| Homepage     | 9.5 | 9.5 |
| /blog        | 9.5 | 9.5 |
| /blog/[slug] | 9.5 | 9.5 |
| /stats       | 9.5 | 9.5 |
| /kontakt     | 9.5 | 9.5 |
| Site shell   | 9.5 | 9.5 |
| Overall      | 9.5 | 9.5 |

Round 7 changed only the cinema perimeter: `git diff f61d5f9..HEAD -- src` touches only `src/lib/home/sections/cinema/Cinema.svelte` and `layout.ts`. I checked that item against `round-7/home/home-{1440,390}-cinema.webp`, `critique/round-7/home/home-{1440,390}-04.webp`, `home-1440-seam-cinema.webp` and `home-1440-reduced-04.webp`. I compared crops and per-pixel luminance profiles across all four edges with `round-6/home/home-*-cinema.webp`. I also spot-checked the unchanged areas in the round-7 set (blog 1440 light, stats 390 dark, kontakt 1920 dark, 404 1440) for capture or shell regressions and found none.

## 1. Homepage 9.5

Solved (gpt round-6 home item 1):

- **Desktop, top edge** (`home-1440-cinema`, edge row y≈236). Lit stretches read about 80 luminance, and the picture just inside reads about 53. There are two real gaps, at x≈760–850 and x≈1016–1096 (about 11% and 10% of the 766px side). In both, the edge row falls to 50–55, the same as the picture, so the gaps are zero light, not dimmed light. The glow just above the edge (y≈232) drops out at the same x ranges (≈25 vs ≈60), so the raster lip and the CSS stroke are aligned. The light fades out before the top-right corner (x≈1216–1328 at picture level), so the corner is dark.
- **Desktop, right edge.** Lit at y≈260–332, a gap at y≈340–388, lit again lower down. Below y≈530 the edge sits against the bright cloud bank, so the visible boundary there is the picture against the clouds, not a drawn rule. That is correct.
- **Desktop, bottom edge.** It meets the clouds directly and has no secondary light line.
- **Phone** (`home-390-cinema`, top edge y≈330). Lit stretches at x≈60–108, 156–212 and 268–308. There are gaps at x≈116–148 and 228–252 (about 9–10%), and both corners fade out. The left and right edges also break (left gap at y≈378–394; right gaps at y≈378–386 and y≈466–482). The beam-side bottom lip stays bright.
- **Feather.** In the gaps the picture's own boundary rises from the sky to picture level over about 3–4px. At native size it does not redraw a crisp rule.
- **Optional beam-side strip from my round 6 notes, also done.** At 1440 the profile inside the left lip now falls off smoothly (y=300: 72→52 over x≈568–600). In round 6 it dipped to 44 and then rose again. The door-jamb strip is gone, and the beam lands on the picture.

Result at native 1440 and 390: one broken edge of projected light, strongest where the beam arrives, with visibly unlit stretches and no continuous secondary box. The picture stays 16:9. Reduced motion and the cinema seam show the same edge. Nothing else on the homepage changed or regressed.

Optional, no deduction:

- At 2× zoom, the ends of the lit stretches on the desktop top edge are fairly crisp (the transition is about 8–16px). Up close the edge reads a little like a long dash. A longer taper at each stretch end (`layout.ts` `EDGE_LIGHT` stop spacing) would make it read more like light falling off. It is invisible at native size.

Keep: everything listed in round 6, plus the new broken edge (shared `EDGE_LIGHT` stretches for the frame mask and the CSS stroke, dark corners, the narrow non-beam feather) and the softened beam-side falloff.

## 2. /blog 9.5

No code change, no regression (`critique/round-7/blog/*`). Keep: the reading-hill hero, fireflies, deckled thumbnail, the unboxed article row and the ochre light status dot.

## 3. /blog/[slug] 9.5

No code change, no regression (`critique/round-7/blog-meine-website-mit-ai-agenten/*`). Keep: the lede bar, warmed title feet, sticky TOC, deckled panorama, hung quote bars and the AI note.

## 4. /stats 9.5

No code change, no regression (`critique/round-7/stats/*`). Keep: the tree of light on the follower-curve hill, the oversized total, the thin textured bars with the max-day firefly, the constellation/pigment wash and the contribution field.

## 5. /kontakt 9.5

No code change, no regression (`critique/round-7/kontakt/*`). The optional round-5 note still stands, with no deduction: a faint butter rim light on the owl in flight in the dark sent state. Keep: the owl and scroll, the ruled pad, the wax seal and the challenge-error layout.

## 6. Site shell 9.5

No code change, no regression (`critique/round-7/404/404-1440-00`, nav and footer across the subpage sets). Optional notes from round 6 still stand, with no deduction: the letter-spaced "N o ." on the licence, the stamp ring against "für Profis" at 390, and the corner seal medallion. Keep: the nav, theme toggle, horizon footer at every width, the left-aligned phone footer, the 404 world tree, climb, sunrise, paper note and paper licence.

## 7. Overall 9.5

The single remaining blocker, the cinema perimeter, is fixed to the round-6 acceptance at both native widths. My optional beam-side note was handled in the same pass, and nothing else changed. Every area is at 9.5. From my side the site is ready to ship. The optional notes above are polish and should not block anything.
