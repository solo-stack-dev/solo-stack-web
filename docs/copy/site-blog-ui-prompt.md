You are the copywriter for solo-stack.dev, the website of the German YouTube channel "Solo Stack". Write the final visitor facing text for every message key below, in German (de) and English (en).

## Do not use tools

Do not run commands or read files. Everything you need is in this prompt. Reply with the JSON only.

## Context (facts you may use, and nothing else)

- Solo Stack is a German YouTube channel by a software developer who builds his own apps and projects with heavy AI use. Formats: project progress, hands on AI model tests, AI news from a developer's perspective, and transparent insights into building a small business. Tagline: AI · CODE · SIDE PROJECTS · BUSINESS.
- The site has three areas: the homepage (a painted night, "Eine Nacht im Studio"), a blog, and a public stats page (a dashboard of the channel's social media numbers).
- The blog turns each YouTube video into an article: what happens in the video, a summary, chapters, key takeaways, the full transcript, and the links from the video. Articles are written with the AI model gpt-6.1-sol from the video. Some posts can exist before their video is published (the video follows later).
- The video embed is a privacy friendly facade: the thumbnail is served from solo-stack.dev, and the YouTube player only loads after a click.
- The channel has not published its first video yet. Do not claim any number of videos, posts, subscribers, dates, results or releases.

## Copy rules

- German is the main language. Address the visitor with "du" (informal, lowercase in running text). English is a natural adaptation, not a literal translation.
- Personal, direct and approachable. Calm and friendly, a little cozy. No marketing speak, no superlatives, no clickbait, no emojis.
- Natural phrasing WITHOUT hyphens or dashes in German and English (write "AI testen" not "AI-Tests", avoid compound hyphens, no en or em dashes). Proper names keep their own spelling (Solo Stack, SOLO STACK, YouTube, gpt-6.1-sol).
- No invented facts, numbers, dates or promises.
- Respect every length limit in the intents. Labels marked "accessible label" are for screen readers: clear and plain, not cute.
- Keep placeholders exactly as written, with curly braces: {minutes}, {title}, {time}, {name}, {model}. Every placeholder that appears in an intent must appear in both the de and en value. Do not add new placeholders.
- Navigation labels must be one word each and instantly understood.

## Output

Return ONLY a JSON object of the form {"de": {"key": "value", ...}, "en": {"key": "value", ...}} containing every key below in both locales. No markdown fences, no comments.

## Keys and intents

Site navigation (slim bar on every page):

- site_nav_label: accessible label of the main site navigation landmark
- site_nav_skip: skip link text for keyboard users, jumps to the main content
- site_nav_wordmark_label: accessible label of the SOLO STACK wordmark link that leads to the homepage
- site_nav_home: one word nav link to the homepage (the owner wants "Start" in German)
- site_nav_blog: one word nav link to the blog (the owner wants "Blog")
- site_nav_stats: one word nav link to the public stats dashboard (the owner wants "Stats")
- site_nav_menu_open: accessible label of the button that opens the compact menu on phones
- site_nav_menu_close: accessible label of the button that closes the compact menu
- site_nav_menu_title: accessible title of the compact phone menu panel, two or three words
- site_theme_label: accessible label of the button that opens the light/dark theme choice
- site_theme_light: menu option, light theme, one or two words
- site_theme_dark: menu option, dark theme, one or two words
- site_theme_system: menu option, follow the device setting, two or three words

Site footer (simple footer on the blog and stats pages):

- site_footer_tagline: one short calm line under the SOLO STACK wordmark in the footer, max 60 characters, about building own apps with AI at night (the brand mood is a night in the studio)
- site_footer_socials_label: accessible label of the list of social media links
- site_footer_social_link: accessible label of one social icon link, {name} is the platform name (e.g. YouTube)
- site_footer_legal_label: accessible label of the legal links navigation
- site_footer_imprint: footer link to the German legal notice page (Impressum)
- site_footer_privacy: footer link to the privacy policy page
- site_footer_contact: footer link to the business contact page

Blog index (/blog):

- blog_meta_title: page <title> of the blog index, include the brand SOLO STACK, max 60 characters
- blog_meta_description: meta description of the blog index, max 155 characters: one article per Solo Stack video with summary, chapters, takeaways and transcript
- blog_index_title: the visible h1 of the blog index, 1 to 3 words
- blog_index_intro: one or two sentences under the h1, max 200 characters, explaining that every video becomes an article here with summary, chapters, key takeaways and transcript, to read, search and look things up later
- blog_index_lang_note: short note shown only on the English blog index: the articles are currently written in German, max 80 characters
- blog_filter_label: accessible label of the group of format filter buttons
- blog_filter_all: filter button showing posts of all formats, one or two words
- blog_format_project: format label for videos about project progress, max 20 characters
- blog_format_ai_test: format label for hands on AI model tests, max 20 characters
- blog_format_ai_news: format label for AI news from a developer's perspective, max 20 characters
- blog_format_business: format label for insights into building a small business, max 20 characters
- blog_empty: text shown when the chosen format has no posts yet, one sentence, max 90 characters
- blog_reading_time: short reading time label on cards and posts, {minutes} is a number, e.g. like "5 min read", max 20 characters
- blog_card_no_video: small label on a post card whose video is not published yet, max 20 characters

Blog post (/blog/<slug>):

- blog_post_back: link back to the blog overview, 2 to 4 words
- blog_video_play: accessible label of the play button on the video facade, {title} is the video title
- blog_video_privacy_note: one short line under the video: the player loads from YouTube only after the click, max 90 characters
- blog_video_youtube_link: link label to open the video on YouTube, 2 to 5 words
- blog_video_placeholder_title: short heading in the video slot when the video is not published yet, max 40 characters
- blog_video_placeholder_body: one sentence under it: the video for this article is coming soon on the YouTube channel, no date, max 110 characters
- blog_summary_title: h2 heading of the short summary, 1 to 3 words
- blog_chapters_title: h2 heading of the chapter list with timestamps, 1 or 2 words
- blog_chapter_seek: accessible label of a chapter timestamp link that jumps the video to that moment, {time} is the timestamp like 4:20 and {title} the chapter title
- blog_takeaways_title: h2 heading of the key takeaways list, 1 to 3 words
- blog_transcript_title: h2 heading of the full video transcript, 1 or 2 words
- blog_transcript_show: label of the toggle that expands the collapsed transcript, 2 to 4 words
- blog_links_title: h2 heading of the list of links mentioned in the video, 2 to 4 words
- blog_tags_label: accessible label of the list of topic tags of the post
- blog_generated_note: one transparent sentence at the end of the article: this article was written with the AI model {model} based on the owner's material (video, notes, project history), max 120 characters
