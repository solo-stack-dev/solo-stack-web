# Round 4 fix plan (final polish)

Round 3: Opus 9.1, gpt-6.1-sol 9.4 overall; gpt already gives /blog, the post and /kontakt 9.5 (`round-3-opus.md`, `round-3-gpt.md`). Rules from `ROUND-2.md` apply (no agent copy, no packages, verify, screenshots to `docs/screens/round-4/<area>/`, commit trailer, report). These are bounded refinements: do NOT redesign anything a critic lists under "keep" or rated 9.5; change only what the lists below name.

## Lead decisions

- **Pull quotes** (Opus: duplicate in the same viewport, read like headings; gpt: fine at 9.5): keep them hanging, but set them lighter (display face regular/medium, ~20–24px, ochre rule) so they never read as headings, and make sure no quote shares a 1440×900 or 390×844 viewport with its source sentence. No new text.
- **Footer wordmark** (gpt: succeeds as a landmark; Opus: 1920 "SOIO STACK" bug + muddy fill): keep the concept, fix the geometry at every width (1280/1440/1680/1920/2560/390), and replace the photo-like grey fill with pigment (cream granulating to butter at night, granulated sumi ink on paper).
- **Light stats hill** (Opus: heavy black mass; gpt: fine): soften moderately (crest ~85% ink fading toward the foot), the glowing curve must stay crisp; do not lose the silhouette.
- **Wax seal** (Opus: glossy coin; gpt: keep): a matte, irregular wax version from Astra is swapped in by the lead (same file names); the Contact agent does not touch the seal art.

## Ownership

| Agent   | Files                                                                                                                                      | Items                                                                            |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| Shell   | `src/lib/components/site/**`, `src/routes/(site)/+layout.svelte`, `src/routes/layout.css`, `src/lib/errors/**`, `src/routes/+error.svelte` | Opus shell 1–5, gpt shell 1                                                      |
| Home    | `src/lib/home/**`, `src/routes/+page.svelte`                                                                                               | Opus home 1–6, gpt home 1                                                        |
| Blog    | `src/routes/(site)/blog/**`, `src/lib/blog/**`, `src/content/blog/**` (structure only)                                                     | Opus blog 1–2, Opus post 1–3 (pull quotes per the decision)                      |
| Stats   | `src/routes/(site)/stats/**`, `src/lib/stats/**`                                                                                           | Opus stats 1–5, gpt stats 1–2                                                    |
| Contact | `src/routes/(site)/kontakt/**`, `src/lib/contact/**` except the seal images                                                                | Opus kontakt 2–3 (re-verify the sent state on the merged footer, thin sent page) |
