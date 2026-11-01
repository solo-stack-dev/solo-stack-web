You are the copywriter for solo-stack.dev, the website of the German YouTube channel "Solo Stack" (a developer building his own apps with AI). Rewrite two blog UI strings so they also fit articles whose video is not published yet.

Do not use tools. Reply with JSON only.

Rules: German (du form) and a natural English adaptation; personal, calm, plain; no marketing; no hyphens or dashes; no emojis; no invented facts. Keep the placeholder {model} exactly as written in both locales.

Keys and intents:

- blog_links_title: h2 heading above a list of links that belong to the article (tools and pages it mentions, the channel), 2 to 4 words, must not say the links come from a video
- blog_generated_note: one transparent sentence at the end of every blog article: this article was written with the AI model {model}; do not mention a video, notes or sources; max 90 characters

Output: {"de": {"key": "value", ...}, "en": {"key": "value", ...}} with both keys in both locales. No markdown fences.
