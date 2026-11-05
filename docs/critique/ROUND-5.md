# Round 5 fix plan (last mile)

Round 4: Opus 9.3, gpt-6.1-sol 9.4 overall; gpt rates everything but the homepage 9.5, Opus /blog and /kontakt 9.5 (`round-4-opus.md`, `round-4-gpt.md`). Rules from `ROUND-2.md` apply; screens to `docs/screens/round-5/<area>/`. Change ONLY the items below; everything else is rated 9.5 by at least one critic and must not regress.

## Lead decisions

- **Cinema edge** (Opus: delete the crisp inner hairline; gpt: keep the thin inner edge, halve the outer band away from the beam, break its continuity): no crisp cream hairline rectangle; the aperture edge becomes a thin, uneven projected-light edge (varying width/opacity, slightly broken), the band outside it halved on the three sides away from the beam, strongest spill where the beam arrives.
- **Stats chart** (Opus: too loud; gpt: 9.5 as is): calm it moderately, keep its new character: bars ~75% ochre with a slightly brighter cap, gaps ~35–40%, ground one irregular 3px dry-brush ink stroke (no crumb tufts), max day marked by one small butter firefly dot.
- **Pull quotes** (Opus: wrong sections; gpt: fine): move each quote to the start of the section that follows its source (before that section's heading rule is fine), still never sharing a 1440×900 / 390×844 viewport with the source. No new text.
- **Cinema copy line** "Zum Kanal geht's unten.": drop the sentence (no new copy) unless the remaining block looks unbalanced; then regenerate a replacement with gpt-6.1-sol.

## Ownership

| Agent | Files | Items |
|---|---|---|
| Home | `src/lib/home/**`, `src/routes/+page.svelte`, `messages/*` (only home keys) | Opus home 1–6, gpt home 1–2 (monitor: also drop subjects with `round \d`, agent lanes like "Home A/B", "Shell", "R2"–"R5", and regenerate `fallback-log.ts`) |
| Blog | `src/routes/(site)/blog/**`, `src/lib/blog/**`, `src/content/blog/**` (structure only) | Opus post 1–4, Opus blog optional dot |
| Stats | `src/routes/(site)/stats/**`, `src/lib/stats/**` | Opus stats 1–3 per the decision |
| Shell | `src/lib/components/site/**`, `src/routes/layout.css`, `src/lib/errors/**`, `src/routes/+error.svelte` | Opus shell 1–5 |
