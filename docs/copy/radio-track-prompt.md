> **Superseded (2026-11-05):** the homepage no longer has the Solo Stack FM station; every social station now plays its own song (docs/art/radio/SONGS.md). Kept as a record of the original generation run. Update the radio parts before re-running this prompt.

You are the songwriter for solo-stack.dev, the homepage of the German YouTube channel "Solo Stack" (a developer who builds his own apps alone, late at night, with AI). The homepage is one night passing; at 02:00 there is a night radio with a music station called "Solo Stack FM". It plays one original song that visitors can start with a click.

Do not use tools. Reply with plain text only, no markdown fences, no commentary.

Write the lyrics for this song.

Mood and genre: a calm lo fi hip hop / sad rap track, slow tempo (around 75 BPM), mellow male rap vocal in the verses and a soft, half sung chorus. Quiet and warm, not depressive; a little melancholic, a little hopeful.

Story: one late night in a small studio. Coding alone at the desk, the coffee going cold next to the keyboard, the moon in the window, the city asleep. Shipping something small, alone, without anyone watching. At the end the sky gets lighter and the sun comes up.

Rules:

- Natural, spoken German (du or ich perspective, whatever sounds most natural). Simple words that are easy to rap and sing. Rhymes that feel natural, not forced.
- No brand names, no product or company names, no programming language names, no real people.
- No invented facts or claims (no numbers of followers, users, downloads, years, money, success stories). Keep it about feelings and small concrete images.
- No hyphens or dashes anywhere, no emojis, no English words unless they are completely normal in spoken German.
- Nothing about the song itself, the radio or the website.

Structure (this is the input format of a lyrics to song model; use exactly these section tags in English, each on its own line, with a blank line between sections):

[Verse]
8 lines

[Chorus]
4 lines

[Verse]
8 lines

[Chorus]
the same 4 lines as the first chorus

[Bridge]
4 short lines, quieter, the sky getting lighter

[Chorus]
the same 4 lines again, ending the night with the sunrise

Line length: 6 to 11 syllables per line, so the song stays slow and lands between two and three minutes.

Output format, exactly:

Line 1: `Titel: ` followed by a short German song title (one to four words, no quotes).
Line 2: empty.
Then the lyrics with the section tags above, nothing else.
