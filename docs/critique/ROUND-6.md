# Round 6 fix plan

Round 5: Opus (`round-5-opus.md`) rates /blog, /blog/[slug], /stats, /kontakt 9.5, homepage and site shell 9.4; gpt-6.1-sol (`round-5-gpt.md`) rates everything 9.5 except the homepage (9.4, cinema edge only). Rules from `ROUND-2.md` apply (no agent-written visitor copy, no packages, verify with `pnpm check`/`pnpm lint`, screenshots to `docs/screens/round-6/<area>/`, commit trailer, report). Change ONLY the listed items; everything else is rated 9.5 and must not regress.

## Ownership

| Agent | Files | Items |
|---|---|---|
| Home | `src/lib/home/**`, `src/routes/+page.svelte` | Opus home 1–3 (cinema edge gaps, mobile radio title clipping, homepage mobile footer left-aligned like the shell footer) and gpt home 1 (the cinema frame ASSET's straight inner lip bridges the CSS gaps: mask/attenuate it too; acceptance: one uneven projected-light boundary at 390 and 1440, no second continuous rectangle, picture stays 16:9) |
| Shell | `src/lib/components/site/**`, `src/lib/errors/**`, `src/routes/+error.svelte` | Opus shell 4–5 (owl tree clear of the S at 1024–1280, desktop 404 note spacing); optional: drop the licence's small emblem or inner hairline if it calms the card |

## Lead decision

- **Pull quotes** (gpt notes they still sit under the destination headings, not before the heading rule; both critics rate the post 9.5): leave as is.
