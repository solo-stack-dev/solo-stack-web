You are the songwriter for solo-stack.dev, the homepage of the YouTube channel "Solo Stack" (a developer who builds his own apps alone, late at night, with AI). The homepage is one night passing. At 02:00 there is a night radio: every preset key is one of the channel's social platforms, and each station plays its own very short original song (about 30 to 45 seconds, looping) while it is tuned.

Do not use tools. Reply with one JSON object only, no markdown fences, no commentary.

Write the title and lyrics for nine very short songs, one per station. Each song has a genre and a theme brief below. The brief only hints at the platform's feeling; the platform itself must never be named or obviously described.

Stations (key: genre; theme brief):

- youtube: sad rap, slow and melancholic, male vocal; talking alone into a camera at night, hoping someone out there is listening, the small red recording light.
- github: lo fi, soft sung male vocal, relaxed; small saves of work at night, little green squares filling up a calendar, branches that grow and come back together.
- instagram: lo fi, dreamy sung female vocal; pictures that look like golden hour while the real room is dark, keeping the pretty frame and the quiet truth side by side.
- tiktok: sad rap, a little faster, female rap vocal; short loops, the thumb that keeps scrolling at 2 am, wanting one moment that stays longer than a few seconds.
- x: sad rap, raspy male vocal, dark and minimal; short words thrown into the dark, an echo that may or may not answer.
- bluesky: lo fi, airy sung female vocal, light and open; a wide clear sky at night, starting fresh somewhere new, a butterfly drifting.
- threads: sad rap with a soft sung hook; conversations hanging by a thin thread, pulling one loose string and hoping it does not unravel.
- twitch: lo fi, jazzy and warm, mellow male vocal; being live late at night, a few quiet voices in the chat keeping you company, the screen glow.
- facebook: sad rap, warm and nostalgic, male vocal; old photos and old friends, a reminder of a birthday, people you used to know.

Rules for every song:

- Natural, simple, spoken English. Easy to rap and sing. Natural rhymes, nothing forced.
- No platform names, brand names, product or company names, programming language names, app names, logos or trademarks, and no real people. Do not use the words "post", "feed", "follower", "like button", "stream" (as in live streaming), "tweet", "reel", "story", "upload", "subscribe" or similar platform vocabulary; stay with feelings and small concrete images.
- No invented facts or claims (no numbers of followers, views, users, years, money, success stories). A time of night like "2 am" is fine.
- No hyphens or dashes anywhere, no emojis, no hashtags, no quotes inside the lyrics.
- Nothing about the song itself, the radio or the website.
- The nine songs must feel distinct from each other (images, words, rhyme sounds), but share the same night: alone, late, a little sad, a little hopeful.

Structure of every song (this is the input format of a lyrics to song model; use exactly these section tags in English, each on its own line, with a blank line between sections):

[Verse]
4 lines

[Chorus]
4 lines

Line length: 6 to 10 syllables per line, so each song stays short (about 30 to 45 seconds).

Title: a short English song title, one to four words, no quotes, no platform names, no hyphens or dashes.

Output format, exactly this JSON shape (lyrics as one string with \n line breaks, including the section tags):

{"songs":{"youtube":{"title":"…","lyrics":"[Verse]\n…\n\n[Chorus]\n…"},"github":{…},"instagram":{…},"tiktok":{…},"x":{…},"bluesky":{…},"threads":{…},"twitch":{…},"facebook":{…}}}
