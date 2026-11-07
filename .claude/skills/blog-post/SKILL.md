---
name: blog-post
description: Turn a finished Solo Stack video into a blog post on solo-stack.dev, German original plus English translation, linked for SEO, checked and committed. Use when the owner says a video is done or published, asks for "the blog post" for a video, names a folder under D:\repos\solo stack\videos\, or wants an existing post revised.
---

# Video → blog post (German + English)

One video = one post per language: `src/content/blog/<slug>.md` (frontmatter schema: `src/lib/blog/schema.ts`, rendered by mdsvex). The owner deploys; you stop at the commit.

**Hard rule (AGENTS.md):** every visitor text (title, description, summary, takeaways, tags, link labels, body, chapter titles, translations) comes from `gpt-6.1-sol`. You collect facts, write the prompt, run the model, and paste its output into the files. You never write or "improve" that text yourself; for a fix, re-run the model with a corrected prompt. Exception: the transcript of the original is the video's own words.

## 1. Find the video and collect the facts

The owner names the video, or take the newest folder in `D:\repos\solo stack\videos\` (layout: `D:\repos\solo stack\produktion\VIDEOSCHNITT.md`, "Ablage pro Video"). Read everything in the folder that is not a media file: notes, script, brief, publish info (YouTube title, description, chapters, URL), the transcripts, `edit/project.md`. The folder layout is still evolving, so look around instead of expecting fixed names, and if a required fact is missing, ask the owner instead of guessing.

| Field             | Source                                                                     | Rule                                                                                                                                                                                                                                                                                       |
| ----------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `youtubeId`       | the YouTube URL in the publish info, or ask                                | 11 characters. Not public yet: `null` plus a `# TODO(owner): youtubeId` comment, and tell the owner                                                                                                                                                                                        |
| `publishedAt`     | YouTube publish date (else today)                                          | `'YYYY-MM-DD'`                                                                                                                                                                                                                                                                             |
| `durationSeconds` | `ffprobe -v error -show_entries format=duration -of csv=p=0 <final video>` | integer, from the **final** cut (`edit/final.mp4` or the upload file)                                                                                                                                                                                                                      |
| `chapters`        | the chapters in the YouTube description                                    | exactly the published ones (first at 0), as `{ start: seconds, title }`                                                                                                                                                                                                                    |
| `transcript`      | transcript of the **final** cut                                            | `{ start: seconds, text }`, one segment per sentence or two. Timestamps must match the published video. Raw take transcripts (`edit/transcripts/`, `takes_packed.md`) have raw timestamps: map them through `edit/edl.json`, or transcribe the final video. Never ship raw take timestamps |
| `format`          | content of the video                                                       | `project`, `ai-test`, `ai-news` or `business` (`D:\repos\solo stack\content\FORMATE.md`)                                                                                                                                                                                                   |
| `links`           | URLs that the video or its description really mention                      | plus the channel `https://www.youtube.com/@solostack_dev`                                                                                                                                                                                                                                  |
| facts             | transcript, script, notes                                                  | the model may only use what the owner actually says or did                                                                                                                                                                                                                                 |

The video's spoken language is the **original** (normally German, `lang: de`, unprefixed URL `/blog/<slug>`). The other language is the translation (`lang: en`, `/en/blog/<slug>`).

## 2. Generate the original with gpt-6.1-sol

1. Fill `prompts/article.md` (this folder): facts, transcript, chapters, and the list of existing posts in the original's language for internal links. Get that list from the frontmatter of `src/content/blog/*.md` (`slug`, `title`, `description`, `lang`, `draft`; skip drafts).
2. Run it outside the repo (inside, codex reads AGENTS.md and derails), prompt via stdin:
   `codex exec --skip-git-repo-check -m gpt-6.1-sol - < prompt.md > output.json` (in your scratchpad)
3. Check the JSON: valid, limits kept (title ≤ 70, description ≤ 155), no hyphenated compounds or dashes in the prose, internal links only to slugs from the list. Proper names sometimes lose their hyphen (`gpt-6.1-sol`): restore those. Anything else wrong: fix the prompt and re-run.
4. Write `src/content/blog/<slug>.md`: frontmatter from the facts + model output, `lang`, `generatedBy: gpt-6.1-sol`, then the body. Model the file on `src/content/blog/meine-website-mit-ai-agenten.md` (single quotes around text values).
5. Save the prompt and the raw output as `docs/copy/blog/<slug>-prompt.md` and `docs/copy/blog/<slug>-output.json`.

## 3. Generate the translation with gpt-6.1-sol

1. Fill `prompts/translate.md` with the finished original file and the list of existing posts in the **target** language.
2. Run it the same way. Write `src/content/blog/<english-slug>.md` with:
   - `lang: en` and **`translationOf: <slug of the original>`**: this one line links both versions everywhere (hreflang on both pages, sitemap alternates, the "Read in English" / "Auf Deutsch lesen" link under the title, one card per video on each blog index). Never put `translationOf` on the original.
   - the same `youtubeId`, `publishedAt`, `durationSeconds`, `format` and chapter `start` values as the original (the build fails if `youtubeId` differs).
   - translated chapter titles, takeaways, tags, link labels and transcript text from the model.
3. Save prompt and output as `docs/copy/blog/<english-slug>-prompt.md` / `-output.json`.

## 4. Check

- `pnpm check`, `pnpm lint`, then `pnpm build`. The build validates every post (frontmatter, slug = file name, `translationOf` target exists, has the other language, is not itself a translation, one translation per language).
- In `.svelte-kit/cloudflare/sitemap.xml` both URLs appear and point to each other with `xhtml:link` alternates.
- Both pages exist: `.svelte-kit/cloudflare/blog/<slug>.html` and `.svelte-kit/cloudflare/en/blog/<english-slug>.html`.

## 5. Commit

Commit both posts and the `docs/copy/blog/` files in one commit, e.g. `Blog: <German title> (de + en)`. No push, no deploy: the owner runs `production:deploy`. Report: the two URLs, anything still `TODO(owner)` (e.g. `youtubeId`), and any fact you had to leave out.

## Revising an existing post

- Content changed (text, chapters, transcript, links): set `updatedAt: 'YYYY-MM-DD'` (today) on every version whose content changed. It feeds `dateModified`, `article:modified_time` and the sitemap `lastmod`. Typo or formatting fixes: no `updatedAt`.
- New text again comes from gpt-6.1-sol. If the original changes in substance, re-run the translation for the changed parts too.
- Video goes public later: set `youtubeId` in **both** versions and remove the TODO comment.
- A new post that is a good link target for older posts: optional, ask the owner before editing older posts (that is a revision: `updatedAt`).
