# Critique round 1: gpt-6.1-sol (high)

Screens: `docs/screens/critique/round-1/`. Overall 7.9.

| Area | Score |
|---|---|
| Homepage (incl. 21:00) | 8.3 |
| /blog | 8.0 |
| /blog/[slug] | 7.7 |
| /stats | 7.6 |
| /kontakt | 7.8 |
| Site shell | 7.9 |
| Overall | 7.9 |

## 1. Homepage 8.3

1. Game resting state is a large, nearly empty rectangle (`home-1440-reduced-02`, `home-390-02`; `Game.svelte:172`, `GameFrame.svelte:264`). Dark overlay suppresses a sparse poster; title barely visible. Fix: a composed static gameplay preview per tab (existing renderer or artwork), prominent play button, lighter overlay, readable title (not 22% cream). Keep load-on-play.
2. Cinema empty state: incandescent frame overwhelms a tiny sentence in a black void (`home-1440-05`, `home-390-05`; `Cinema.svelte:143`). Fix: soften the outer yellow bloom, keep a sharper lit inner edge, put a quiet painted projection inside the empty screen, existing message at ~18–20px with a readable measure, channel link grouped with the screen.
3. Transitions read as horizontal smoke belts (`seam-radio`, `seam-cinema`, `seam-sunrise`). Fix: narrow/reduce the grey mist at desk→radio and radio→cinema, let foreground ink silhouettes overlap more decisively; at sunrise replace olive-grey haze with a cleaner ochre→butter wash. Keep irregular painted boundaries.
4. 21:00 controls too subordinate (`home-390-01`; `Making.svelte:693`, `:830`): dots, pause, pillar row and arrow form two unrelated small control systems; title glow makes it feel like UI not ink. Fix: dot hit width 24→32px, stronger solid core on the active dot, state title on hover/focus of a dot, much less title shadow, one deliberate bottom composition for all controls.
5. Radio glass information too faint (`home-390-04`, `seam-radio`; `RadioSet.svelte:241`). Fix: calmer dark material behind live text, ≥12px supporting glass labels, brighter inactive platform marks; yellow only for the tuned station.

Keep: moon + split wordmark, mobile hero, desk scene, radio body + logo keys, sunrise ending, the new 21:00 behaviour.

## 2. /blog 8.0

1. Opener delays the index: at 1440×900 the first article image starts at y≈899; on mobile almost the whole first viewport is intro/illustration/filters (`blog/+page.svelte:146`). Fix: desktop header ~480–520px (resize/reposition art without cutting mascot or crown); on 390 less art height and smaller gaps so the first entry's title shows much earlier.
2. Thumbnail hover animates but clicking it does nothing: the stretched link is constrained by the positioned `.body` (`PostCard.svelte:179`, `:205`). Fix: make `.entry` the containing block for the stretched link (remove positioning from `.body`); one link, one tab stop, whole-entry focus.
3. Mobile filters disappear past the edge with no cue (`blog/+page.svelte:86`). Fix: wrap onto two rows below 640px, ≥44px targets, room so focus outlines are not clipped.
4. Reading-hill dark backlight too broad and brown/khaki (`ReadingHill.svelte:80`). Fix: smaller warm core around laptop and lower canopy, more clean night between art and title. Keep the dry-brush ground edge.

Keep: tree + reading silhouette, open editorial entries, torn image edges, restrained arrow, light-theme ink on paper.

## 3. /blog/[slug] 7.7

1. Article loses art direction after the opener (`…-1440-dark-03..07`, `…-390-dark-03..12`; body styling `[slug]/+page.svelte:871`): repeated paragraphs, black headings, identical small brush strokes. Fix: two deliberate visual pauses with existing artwork (a wide crop near the night-journey section, a smaller desk/radio detail later), varied scale/placement, clear reading column, no decorative cards.
2. Mobile hides the contents nav entirely below `lg` (`:274`). Fix: compact disclosure with the same outline before the body; reuse labels, current-section state, anchor offsets.
3. Mobile opening: long title, date, five tags and a 5:4 placeholder take the whole viewport (`VideoFacade.svelte:103`). Fix: 16:9 on mobile (object-position keeps the laptop), tags below the summary, date + reading time under the title.
4. TOC can clip its own focus ring (`:789`). Fix: ~6px inner focus clearance, compensate position; same for the mobile version.

Keep: body size/leading, desktop measure, sticky desktop TOC, reading-progress hairline, silhouette facade, unboxed summary and link list; light version is very comfortable.

## 4. /stats 7.6

1. Constellation label collisions and undersized type (`stats-1440-dark-01`, `stats-390-light-01`; `Constellation.svelte:140`): "TIKTOK" + "INSTAGRAM" run together; mobile names ~10px, values ~8px. Fix: explicit per-platform label anchors (TikTok left, Instagram right); ~12px names at 390, drop secondary numbers from the diagram at that width if needed (ledger has them).
2. Light-theme tree looks faded, not luminous (`stats-1440-light-00`; `GrowthHill.svelte:338`). Fix: less wash right behind the canopy, stronger ochre branch/leaf detail locally, keep pale highlights; adjust the canopy, do not crush the trunk.
3. Hill dissolves into a conspicuous straight grey shadow (`stats-390-light-01`, `stats-1440-light-01`; `GrowthHill.svelte:126`). Fix: irregular painted feather with varying termination height, shorter grey transition, dry-brush marks to finish the ground.
4. Long root reads as a diagram connector/wiring (`stats-1440-dark-02`, `stats-1440-light-03`; `Roots.svelte:82`). Fix: stronger irregular dark root body, narrower dimmer gold vein, weaker terminal glows, branches emerge from the root mass, ends clear of the content column.
5. Activity calendar becomes confetti on mobile (`stats-390-*-05`; `ActivityCalendar.svelte:74`). Fix: ≥12px cells, 11–12px labels, explicit horizontal overflow if needed, stronger low levels on paper, keyboard access to the tooltip (one roving focus, arrow keys).

Keep: curve as the path to the roots, small mascot for scale, huge follower number, platform ledger, sparklines, view columns rising from ink.

## 5. /kontakt 7.8

1. Topic selector is still a generic tray of pills (`kontakt-390-light-00`, `kontakt-1440-dark-00`; `kontakt/+page.svelte:572`). Fix: no tray/shadows; open ruled choices with an ink mark for selection; four full-width ≥44px rows on mobile; native radios.
2. Validation leaves focus on the send button while the errors are above the viewport (`:133`). Fix: after failed preflight focus the first invalid control and scroll its wrapper below the sticky nav (topic → focus a radio); respect reduced motion.
3. Mobile branch too close to the headline (`kontakt-390-light-00`; `:295`): twigs and "Schreib" nearly merge. Fix: ≥24px between the lowest branch and the headline ink.
4. Unfocused field rules too weak; textarea focus remote from the caret (`kontakt-1440-light-00`; `:377`). Fix: field boundary rules ≥3:1 against their surface; keep the inked baseline, add a short active ink marker by the first writing line or label. No box.
5. Success state keeps the giant original heading above a second large success heading (`:106`, `sent` branch). Fix: recompose the hero in the sent state with the existing success title/body instead of two headline groups; keep empty branch and return action.

Keep: owl with sealed letter, branch from outside the viewport, ruled writing surface, inked focus + label dot, error messages, restrained blink, reduced-motion alternative.

## 6. Site shell 7.9

1. Dark background mottling too visible in long reading areas (article middle, `stats-1440-dark-02`; `layout.css:465`). Fix: halve the alpha variation of the two low-frequency mottle layers, keep fine grain and the dusk gradient, stronger pigment only around landmarks.
2. Light-theme state/focus colours too weak: butter on paper 1.32:1, ochre `--ring` 2.00:1; the deep focus token (5.70:1) is overridden by some utilities (`SiteNav.svelte:140`, `Constellation.svelte:179`). Fix: `--ink-lit` for the light active nav underline, `--focus-ring` consistently for keyboard outlines incl. platform links; butter focus only on the always-dark footer.
3. Navigation changes language between home and subpages (heavy uppercase vs light title case; mobile menu a conventional rounded-row sheet; `SiteNav.svelte:186`, `MobileMenuSheet.svelte:30`). Fix: share typography, underline, icon drawing, focus treatment; homepage keeps its transparent placement and hour list.
4. Footer 8+1 social widow at 390 (`SiteFooter.svelte:53`). Fix: intentional centered 5+4, 44px targets (reuse the sunrise footer's approach).
5. Bottom spacing stacks into an empty runway before the horizon (`SiteFooter.svelte:98`). Fix: one spacing budget from the last content/action to the first visible silhouette (~64–96px mobile), remove redundant bottom padding; measure the visible art boundary.

Keep: crescent mark, silhouette footer horizon with lit laptop, dark footer ground in both themes, deep light focus token, 44px targets. The 404 composition is excellent.

## 7. Overall 7.9

1. Uneven finish across states: hero and desk are showpieces; the game poster and empty cinema are visibly less resolved.
2. Atmosphere does too much work: broad halos, cloudy mottling and grey transition belts weaken strong silhouettes; reserve the strongest light for screens, eyes, the tree and the sunrise; give type cleaner surroundings.
3. Mobile is fitted rather than composed in several places (blog delay, constellation collisions, contact tray, footer widow).
