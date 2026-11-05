# Critique round 1: Claude Opus 5.5 (high)

Screens: `docs/screens/critique/round-1/`. Overall 7.8.

| Area | Score |
|---|---|
| Homepage (incl. 21:00) | 8.3 |
| /blog index | 7.6 |
| /blog/[slug] | 7.3 |
| /stats | 7.8 |
| /kontakt | 8.0 |
| Site shell | 7.2 |
| Overall | 7.8 |

The painted art is award level. What holds the scores back is the craft between the paintings: grid alignment, empty bands, collisions, and template UI pieces (pill switches, dashboard row, footer).

## 1. Homepage 8.3

Keep: hero, 01:00 desk, radio, cinema, sunrise, reduced-motion snapshots, 21:00 ink line idea (autoplay works).

1. Section headings slide under the fixed nav and collide with the logo (`home-1440-03` "NOCH LICHT AM SCHREIBTISCH" behind SOLO STACK, `home-1440-02` game tabs, `home-1440-04` station list, `home-390-03/04`). Scrim in `SiteNav.svelte:221-237` is 7rem and only opaque for the top 40%. Fix: stronger/taller scrim (9rem, opaque to 55%), or hide logo/links on scroll down and show on scroll up, and/or `scroll-margin-top: 6rem` + keep display type out of the top 96px of each stage.
2. Dead dark bands: radio→cinema ~450px of muddy rock/black (`seam-cinema`, `home-1440-04`); cinema→sunrise dark slab with a straight bottom edge, then ~700px khaki/olive fog (`seam-sunrise`, `home-390-06`) from black mixing into butter. Fix: cut radio foreground ~150px under the radio feet; pull cinema up; replace the ink→butter gradient with a two-layer crossfade (ink opacity down, butter paper up) so it never passes through olive; put a warm horizon hint in the cinema's lower third.
3. The same cloud strip sits at every seam (game→night-shift, night-shift→radio, radio→cinema) with an identical silhouette and flat top edge. Fix: three different strips, mirrored/offset per seam, irregular alpha top edge with wisps rising 60–120px.
4. 22:00 poster is an empty ~1040×580 near-black rectangle, ghost title "MONDPATROUILLE" ~1.4:1 contrast; frame starts at x=192 while the tab row starts at x=56. Fix: real painted poster per game, title in full cream with the butter play button in the art, align frame/tab row/headline to one left edge.
5. 21:00 composition spread out: ~380px empty sky under the shape, pillar row + controls at the very bottom (`seam-game`); label "EINE IDEE" has a visible dark rectangle behind it; `</>` bloom uses `filter: blur(6px)` (`Making.svelte:708`) and looks out of focus; mid-morph frames are a loose tangle (~0.5 s, code→phone); the pillar row repeats the hero tagline word for word one screen apart. Fix: pull pillar row + controls up (~48px under the label, centered), soft radial text-shadow instead of a rectangle, no blur on the bloom (grow via mask-size/clip-path on a sharp pigment texture), midpoint keyframes or crossfade at 40–60% so the morph never self-intersects; differentiate hero tagline vs 21:00 pillars (copy via gpt-6.1-sol).
6. Hero scroll cue "WEITER IN DIE NACHT" dark grey on dark cloud (`home-1440-00`, y≈832). Fix: cream 80% with 2px ink halo, or move onto the moonlit area.
7. 01:00 monitor shows "Commits konnten nicht geladen werden." (`seam-night-shift`). Fix: static fallback log of real recent commit subjects baked at build time; never an error inside the painting.
8. Radio mobile: "Sender gesucht" clipped by the display bottom (`home-390-04`). Fix: line-height 1, vertically centered; check at 360px.
9. 22:00 mobile: game tabs stack into a 150px vertical list (`home-390-02`). Fix: one horizontally scrollable row with right fade mask, or a "1/3 ‹ ›" switcher.
10. Sunrise: owner photo reads as a pasted grey cut-out on butter (`home-1440-06`) → ink duotone (#0e0f10, multiply) ~1.3× size; legal links not on the wordmark baseline → align; 06:00 label floats alone in empty sky → drop it ~200px into the composition.

## 2. /blog index 7.6

Keep: reading hill (mascot, headphones, laptop glow, fireflies), its sumi look in light theme, torn-paper vignette.

1. Empty below one post: ~300–350px of nothing before the footer (`blog-1440-dark-01/02`); filters sit ~300px below the intro. Fix: filters ~48px under the intro (or hidden while < 4 posts); newest post as a full-width feature row (vignette 7/12, text 5/12, fireflies drifting into its top edge); end the list with a painted "more videos coming" line (TODO(copy)/gpt-6.1-sol) on the horizon.
2. Hill floats: bottom is a soft brown smudge in dark (`blog-1440-dark-00` y 640–720), a ragged island in light. Fix: run it off the right edge and down into the next band, or let the filter rule be its ground line.
3. Art drifts at 1920 (viewport-anchored, 300px gap from the type, `blog-1920-dark-00`). Fix: position relative to the content container, max-width ~52rem.
4. Category reads as an eyebrow badge ("— PROJEKTFORTSCHRITT" spaced mono) and sits on a different baseline from the date. Fix: one meta line in one style (`1. November 2026 · 6 Min. · Projektfortschritt`), format as a small painted glyph if anything.
5. Filter rule ends ~64px before the content's right edge. Fix: full container width.
6. Mobile: filter tabs clipped at the right with no cue → mask fade + scroll-padding; art below intro cropped awkwardly → art first at ~60vw overlapping the intro by 40px (or similar deliberate crop).

## 3. /blog/[slug] 7.3

Keep: big three-line title, sunset vignette, TOC active state.

1. Body is an unbroken wall of text, nine screens, lines 85–95 characters. Fix: `max-width: 66ch`; one painted section break per H2 (tiny silhouette vignette, ~120px); pull quotes (Geist Black ~28px, butter rule left, hanging into the gutter) — pull-quote content must come from the post itself.
2. Paragraph after the bullets ("Ich bin Softwareentwickler…") is 20px/35px and wider than the 18px paragraphs (`…-dark-02`, `…-390-dark-02`). Fix: one paragraph style; only the lede is larger.
3. Ending is a void: hairline link rows, AI-disclosure line, ~300px nothing. Fix: closing mark, then "back to the blog / next video" pair on the footer horizon; links as a two-column list, domain in mono under the title, no hairlines.
4. "Das Video folgt" text sits on bright orange sky, body line under 3:1 in both themes. Fix: ink scrim from the top-left (radial 70%→0) behind the text, or move the text below the vignette.
5. Meta row busy (mono eyebrow, sans date, five tags with slashes). Fix: date + read time line 1; tags line 2 at 14px separated by `·`; no category eyebrow.
6. TOC wraps unevenly in 15rem. Fix: `lg:grid-cols-[minmax(0,1fr)_17rem]` (`blog/[slug]/+page.svelte:180`), `text-wrap: balance`, 13px.
7. "KURZ ZUSAMMENGEFASST" is an eyebrow label with a swash. Fix: drop the eyebrow; mark the summary with a butter margin line or a painted ink stroke edge.

## 4. /stats 7.8

Keep: growth tree hero (strongest subpage hero), curve climbing to the roots, firefly activity calendar, brush smears under section titles in light theme.

1. Constellation labels collide: TikTok right, Instagram left (`left = x > 62`, `Constellation.svelte:124,140`) → "TIKTOKINSTAGRAM" (`stats-1440-dark-01`, light, mobile); "X" overlaps its star. Fix: per-platform `labelSide`/`dy` overrides in `PLACE` (TikTok left, Instagram right, X below); labels ~3.6px in the viewBox (mobile labels ~7px now).
2. Delta numbers in off-palette emerald (`Delta.svelte:29`). Fix: up = butter (dark) / ochre ink #8a5a12 (light), down = muted cream 60%; the arrow carries the meaning.
3. Platform list columns wander (share % and sparkline x shift with number width). Fix: CSS grid columns (`2rem 1fr 6rem 3rem 5rem`), tabular-nums, right-aligned number column.
4. KPI baselines misaligned ("Durchschnittliche Wiedergabedauer" wraps, 3:53 sits 20px lower, `stats-1440-dark-02`); still a generic four-up strip. Fix: subgrid so labels share a row height and numbers share a baseline; better, set the numbers as engraved markers along the hill/root line.
5. Root line is a flat vector hairline ending mid-air (~y=770) with a stray knot/node (`stats-1440-dark-01..04`), breaks "never vector flat". Fix: painted tapering root (3–6px, granulated, rootlets) running behind the sections and ending in the footer horizon ground; remove the isolated knot.
6. Empty half-columns: under the views chart (~250px next to the top-videos list), right of the 280/6 KPIs, ~250px before the footer. Fix: chart height matches the list (stretch); 280/6 as an inline pair under the calendar; bottom padding ~6rem.
7. Constellation is a black disc on cream in light theme (`stats-1440-light-01`), looks like a sticker. Fix: ink stars on paper with a pale butter wash, or a cut-out night window with a torn painted edge.
8. Top videos: "1" solid butter, 2–5 hollow → all solid with stepped opacity; "Aufrufe" label wanders with the bar end → right-aligned label column.
9. Hero leftovers: "BEISPIELDATEN" stamp and "31. OKT." / "1. OKT." labels float; on mobile "31. OKT." overlaps the mascot (`stats-390-dark-01`) → date labels on the curve offset along the normal, hide the end label < 640px; the hill is mid grey-brown, not ink → ink ~92% with glow only on the rim; "› Daten als Tabelle" floats alone 140px above "Die Plattformen" → attach it under the chart.

## 5. /kontakt 8.0

Keep: the owl, the ruled letter pad, the single-line field focus treatment (resolves the owner's complaint).

1. Textarea focus cue is far from the caret (only the bottom rule inks in, ~250px below the typed line). Fix: ink the first rule plus a 2px butter margin line down the left of the pad; light the rules (e.g. all at 40%) or the active line.
2. Topic chooser is a generic pill segmented control; wraps 2+1+1 in a rounded box on mobile (`kontakt-390-*-00`). Fix: four hand-written options on the ruled paper, each with a small ink circle that fills with butter; left-aligned wrap `gap: .5rem 1.5rem`; vertical list on mobile.
3. Right column empty from the form's first row to the footer. Fix: owl branch runs diagonally down the right edge toward the form, or the owl sits sticky (`top: 20vh`) in a right column ≥1024px beside the pad.
4. Name/email: label sits 63px above an invisible input. Fix: label ~8px above the rule, 48px field.
5. ~280px void between the send button and the horizon (`kontakt-1440-dark-01`). Fix: reduce `pb-24`, or let the owl's flight path / fireflies occupy it.
6. "Schreib mir" breaks as "Schreib / mir" on mobile. Fix: clamp so it stays on one line at 390 (e.g. `clamp(3rem, 15vw, 9rem)`), `text-wrap: balance`.
7. Datenschutzerklärung focus ring sits flush on the text. Fix: `outline-offset: 3px; border-radius: 4px`.

## 6. Site shell 7.2

1. Nav and content grids don't line up: nav `max-width: 76rem` (`SiteNav.svelte:170`) vs `max-w-6xl` pages/footer; logo 32px left of content, theme toggle 20px right. Fix: one `--content-max` token shared by nav, pages, footer.
2. Two different navs; the subpage one is the flat anthracite bar the owner rejected (title-case links, opaque bar, hairline) vs the homepage's uppercase tracked links. Fix: give subpages the homepage treatment (same type, no solid bar, painted night-sky scrim that fades out; same butter swash under the active link).
3. Footer is a template layout (wordmark, tagline, ©, icon row, link row); in light theme a flat black slab under the horizon (`blog-1440-light-01`). Fix: horizon ~2× taller, wordmark integrated into the ink ground as cream type, social icons as small ink glyphs along the ridge; light theme: only ~120px ink ground under the horizon.
4. Mobile footer icons wrap with Facebook orphaned (`blog-390-dark-02`, `stats-390-*`, `kontakt-390-*`). Fix: balanced rows (5+4) or a gap that fits 9 at 390.
5. Light-theme crescent logo is pale butter on cream, nearly invisible. Fix: ochre #b07a12, or ink with a butter inner glow.
6. Light theme /stats: grey band under the nav (`stats-1440-light-01`). Fix: build the light scrim from paper `--background`, not ink.
7. 404: "Wege durch die Nacht" list puts 20:00 and 21:00 on one line while the rest stack → one column; header has no crescent and matches neither nav; the red/black "X" Hunter License sticker is close to the real logo → redraw as a clearly original license card.
8. Subpage background: painted-night-paper intent only visible in the hero; below it is flat anthracite + grain. Fix: the planned vertical night gradient (dusk at top, deepest mid page, warming toward the horizon) with very low pigment mottling, on a fixed backdrop without banding.

## Overall 7.8

Three things lift every page: one grid (shared container + nav alignment, tabular columns, shared baselines); no empty bands (each page ends in content that meets the footer horizon); no template UI pieces (pill segmented controls, eyebrow labels, hairline list rows, four-up KPI strip, template footer) — redraw them in the ink-and-pigment material like the contact field focus. The art direction is right; do not redo it.
