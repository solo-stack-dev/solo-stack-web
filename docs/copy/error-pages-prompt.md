You write microcopy for solo-stack.dev, the personal site of the German YouTube channel "Solo Stack" (a solo developer who codes at night, builds projects, tests AI tools). The site's theme is "a night in the studio", watercolor, moon, 03:00.

Voice rules: personal, direct, warm, playful, short. German is the main language (use "du"). Also give natural English (not a literal translation). NO hyphens or dashes of any kind in the text (no "-", "–", "—"), also not in compound words: write them together or rephrase. Do not invent facts, numbers or promises. Anime references should be recognizable to fans but still make sense to everyone.

Return ONLY a JSON object {"de": {...}, "en": {...}} with exactly these keys in both:

404 page. Scene: Hunter x Hunter homage. The page the visitor wanted went missing, like Ging, the father Gon spends the whole series searching for. Painted scene: an impossibly tall World Tree above a sea of clouds just before sunrise. A tall mysterious wanderer stands at the top with his back turned. The site mascot (a small cartoon version of the channel owner, with a yellow backpack) clings to the trunk halfway up. Clicking the tree makes the mascot climb; at the top they watch the sunrise together. There is also a small Hunter emblem (X with a red diamond) on the trunk that flips open a "Hunter License" card.

- "error_404_title": headline, max 7 words, the missing page is like Ging: hard to find, maybe somewhere at the top of the World Tree.
- "error_404_body": 1 to 2 short sentences: this page doesn't exist (or isn't here anymore); the way home is below. Light HxH flavor.
- "error_404_scene_alt": alt text describing the scene factually (World Tree, sea of clouds, dawn, wanderer at top seen from behind, mascot with yellow backpack climbing the trunk). Max 30 words.
- "error_404_climb_label": accessible button label for "make the mascot climb further up the tree", max 5 words.
- "error_404_climb_steps": three very short climbing grunts/thoughts as one string separated by " | " (exactly 3 parts, each max 5 words), increasingly exhausted/determined, shown as small speech bubbles.
- "error_404_wanderer_line": what the wanderer says when the mascot finally reaches the top, max 14 words. Ging style: laid back, a little cheeky, about the page not being up here either, then suggests watching the sunrise.
- "error_404_license_label": accessible label of the emblem button, max 5 words ("Show Hunter License" idea).
- "error_404_license_title": card title, max 3 words ("Hunter License" in the language).
- "error_404_license_class": a fake license class line naming the bearer a "Page Hunter" or similar, max 5 words.
- "error_404_license_note": one short line on the card: the license is valid, but even pro hunters don't find this page. Max 12 words.

500 page. Scene: Attack on Titan homage. A huge faceless ink giant peeks over a stone wall at a tiny lit studio; the mascot sits outside looking up. New interaction: clicking the wall knocks; the wall shakes and dust falls; after three knocks the giant opens one glowing eye.

- "error_500_knock_label": accessible button label for knocking on the wall, max 5 words.
- "error_500_eye_line": a tiny speech line by the mascot when the giant's eye opens, max 8 words, nervous and funny, recognizable as an AoT nod (the wall, the titan) without quoting the anime.

Console easter egg (DevTools, site wide). Solo Leveling homage: a blue "System" notification window, as in the manhwa, that appears to the "player" who opened DevTools. Parody of the famous daily quest.

- "egg_system_header": the notification header, max 4 words, like "[SYSTEM]" style but write it without brackets.
- "egg_system_notice": 1 sentence, the System announcing that the player has found a hidden area / the player has awakened. Max 16 words.
- "egg_system_quest_title": title of a parody daily quest for developers, max 6 words.
- "egg_system_quest_items": exactly 3 quest goals as one string separated by " | " with progress like "0/1" at the end of each, developer themed (commits, coffee, a video, deploying at night...). Each max 6 words. No invented facts about the owner.
- "egg_system_warning": the classic threat line parody: failing the daily quest results in an appropriate penalty, max 14 words.
- "egg_system_hint": tells the player to type arise() to summon shadows, max 10 words. Keep "arise()" literally.
- "egg_system_arise_elsewhere": reply when arise() is typed on a page other than the homepage: the shadows only rise in the night studio (homepage), max 12 words.
