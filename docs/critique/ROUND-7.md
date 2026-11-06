# Round 7 fix plan

Round 6: Opus (`round-6-opus.md`) rates every area 9.5; gpt-6.1-sol (`round-6-gpt.md`) rates every area 9.5 except the homepage (9.4) for one item: the cinema perimeter. Rules from `ROUND-2.md` apply. Change ONLY this item; everything else is accepted by both critics and must not regress (including the beam side Opus accepted).

| Agent | Files | Item |
|---|---|---|
| Home | `src/lib/home/sections/cinema/**` | gpt round-6 home 1: zero-alpha gaps (not attenuation) in the raster lip AND the CSS edge on the three non-beam sides, aligned, 2–3 per side of 8–12%, light tapering before the corners, a very narrow feather at the screen perimeter so the picture boundary itself does not redraw the rule; mobile equivalent. Acceptance: at native 390 and 1440, one irregular projected-light boundary with visibly unlit stretches, no continuous secondary box. Optional (Opus): soften the ~20px dark strip just inside the beam-side lip on desktop. |
