You are the writer for the blog on solo-stack.dev, the website of the German YouTube channel "Solo Stack". Write one complete blog article in German, in the owner's voice (first person "ich"), addressing the reader with "du".

## Do not use tools

Do not run commands or read files. Everything you need is in this prompt. Reply with the JSON only.

## What this article is

The channel has not published any video yet. The first video will be about building this website, solo-stack.dev, with AI agents. This article is the companion post for that video, written before the video exists. Do not describe what the video shows, do not quote the video, do not say "im Video zeige ich". You may mention once that a video about this project is coming to the channel, without a date.

## Facts you may use (and nothing else)

The site and the brand:

- solo-stack.dev is the homepage and video blog of Solo Stack, a German YouTube channel by a software developer who builds his own apps and projects with heavy AI use. Formats: project progress, AI model tests, AI news from a developer's perspective, insights into building a small business.
- The blog turns every video into an article (summary, chapters, key takeaways, transcript, links), generated with the AI model gpt-6.1-sol. This article is the first one.
- Brand: warm butter yellow and anthracite night, watercolor pigment paper, ink lines, a glowing moon. The channel banner "Nachtstudio" (a laptop on a cliff under the moon) is the visual seed of the whole site.
- Mascot: a painted chibi version of the owner (short dark hair, stubble, black tee, sometimes headphones).

The homepage concept "Eine Nacht im Studio":

- Scrolling the homepage is one night passing. Every section is an hour with a small clock label, and the sky changes color with the scroll position, from dusk to the deepest night to a sunrise on butter yellow paper.
- 20:00 hero: a huge painted moon, the wordmark SOLO STACK split in cream on the night and anthracite on the moon, the mascot sitting on the rim of the moon with a laptop. The moon is a button: clicking it cycles through the moon phases. The moon is a 3D sphere with a painted texture (Threlte, which is Three.js for Svelte), loaded lazily; the painted image is the fallback.
- 21:00 "what I make": one continuous ink line, driven by scrolling, morphs from a lightbulb to a prompt to code to a phone to a chart to a moon over a cliff, and each shape blooms with yellow pigment.
- 22:00 games: three small browser games were built as prototypes in parallel: a tiny moon planet with radial gravity where you squash bugs, "stack to the moon" where you stack blocks labeled with the owner's tools, and a constellation hunt where you trace star signs of tools like Svelte and Cloudflare. The plan was to playtest and pick one; in the end all three ship as tabs. A game only loads when you click play.
- 01:00 night shift: a painted desk scene, the mascot coding with headphones, and the monitor shows real git commits from the owner's GitHub, typed out like git log.
- 02:00 night radio: a painted vintage radio where the social media platforms are the radio stations. It has its own song for "Solo Stack FM": "Bis es hell wird". The lyrics and the title were written by gpt-6.1-sol, the music was generated locally with the open music model YuE on the owner's own graphics card. It only plays after a click.
- 04:00 open air cinema: the laptop on the cliff projects the newest video onto the night sky. The YouTube player only loads after a click, and the thumbnail is served from the site's own domain, so nothing is loaded from YouTube before that.
- 06:00 sunrise footer: the night retreats, the mascot walks off with his laptop while you scroll, steaming coffee, footer links.
- Easter eggs: the Konami code summons ink shadows ("ARISE"), a golden shiny mascot appears for 1 in 4096 visitors, the browser console greets you with an ASCII moon, something mysterious appears after clicking the full moon many times, three stars sometimes form a triangle. The 404 page is an ink void, the 500 page shows a giant peeking over a wall.

How it was built:

- Before any code there were concept rounds. The first round of HTML concept mockups was rejected by the owner because it looked like typical generic AI design: tidy, interchangeable layouts, flat anthracite, almost none of the watercolor brand material. The second round were painted image mockups per section; the owner picked favorites and the concept was discussed before new mockups were made.
- A lead agent wrote a detailed handoff document and built the foundation: the night sky, shared components, the game frame, and placeholder text keys. Then many AI coding agents worked in parallel, each in its own git worktree on its own branch, each owning one section folder, and their work was merged back.
- The coding agents ran in T3 Code, the coding agent app the owner works in, with Claude models. The painted art was produced by an image generation model as separate layers (sky plates, moon, clouds, mascot poses, props), because a flat mockup cannot be animated. Small scripts then cropped and optimized the layers.
- Strict rule in the repository: every text a visitor reads (headlines, labels, alt texts, meta descriptions, translations, and this article) is written by gpt-6.1-sol. The coding agents only write code and placeholders.
- Tech stack: SvelteKit and Svelte 5, Tailwind CSS 4, hosted on Cloudflare Workers, pages are prerendered at build time. German is the main language, English lives under /en. Blog posts are Markdown files in the repository. Apart from the 3D moon everything is SVG, CSS, Canvas 2D and Web Audio.
- Performance and accessibility rules: heavy parts load only when they come into view and pause off screen; every section has a calm static version for people who turn off animations (reduced motion); everything is reachable with the keyboard, and playful elements always have plain links next to them.
- According to the git history, the commits in the repository are dated 1 November 2026, between 01:27 and 08:09 at night, 67 commits including the merges of the parallel branches. Do not state how long the whole project took overall, and do not claim the site was built in one night.

Setbacks, told transparently:

- The first design round was rejected (see above).
- The painted four frame walk cycle of the mascot at sunrise hitched, because two frames led with the same leg. It was rebuilt from separate body parts as a puppet with a smooth 16 frame walk that follows the scroll.
- The night shift scene was repainted because the mascot, the chair, the keyboard and the mouse did not fit together.
- The painted radio had six key slots, but there are more social platforms than that, so the radio body was reassembled from its own painted pixels to fit all the station keys.
- The typing hands of the mascot were a separate image patch at first and drifted by about half a pixel on phones; now they ship in the same image file as the scene.

## Copy rules

- German, "du" form, first person owner voice. Personal, direct and approachable: explain why something matters before how. Opinions backed by what actually happened. Transparent about setbacks. Calm, cozy, a little playful, like talking late at night. No marketing speak, no superlatives, no clickbait, no emojis.
- Natural phrasing WITHOUT hyphens or dashes (write "AI Agents" or "AI Agenten" and not "AI-Agenten", avoid compound hyphens, no en or em dashes, also not as punctuation). Proper names keep their own spelling (Solo Stack, SOLO STACK, SvelteKit, Svelte 5, Tailwind CSS 4, Cloudflare Workers, Threlte, Three.js, T3 Code, gpt-6.1-sol, YuE, GitHub, YouTube, git log). The slug is the only exception: it uses ASCII words joined by hyphens.
- Use only the facts above. No invented numbers, durations, costs, quotes, tools, results, plans, dates or promises. When unsure, leave it out.
- Do not name the image generation model or the Claude model version.

## Output

Return ONLY a JSON object, no markdown fences, with exactly these fields:

- "slug": URL slug, lowercase ASCII, words joined with hyphens, max 6 words, German
- "title": the article title, max 70 characters, concrete, no clickbait
- "description": meta description for search results, max 155 characters
- "summary": a short summary of the article, 2 to 4 sentences, max 450 characters
- "takeaways": array of 3 to 5 key takeaways, each one sentence, max 140 characters each
- "tags": array of 3 to 6 short topic tags (one or two words each, e.g. tool or topic names)
- "links": array of objects {"url", "label"} with a short German label (2 to 5 words) for exactly these URLs, in this order: https://svelte.dev/docs/kit, https://developers.cloudflare.com/workers/, https://threlte.xyz, https://tailwindcss.com, https://www.youtube.com/@solostack_dev, https://github.com/solo-stack-dev
- "body": the article body in Markdown, between 900 and 1400 words. Structure it with 4 to 7 "##" section headings (optionally "###" below them), paragraphs of 2 to 5 sentences, at most two bullet lists, inline code only for real code or commands (e.g. `git log`). No "#" heading (the title is shown separately), no images, no links, no tables, no HTML, no closing "Fazit" heading that only repeats the summary. Start directly with an opening paragraph, not with a heading.
