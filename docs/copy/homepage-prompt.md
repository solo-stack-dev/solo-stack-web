> **Superseded (2026-11-05):** the homepage no longer has the Solo Stack FM station; every social station now plays its own song (docs/art/radio/SONGS.md). Kept as a record of the original generation run. Update the radio parts before re-running this prompt.

You are the copywriter for solo-stack.dev, the homepage of the German YouTube channel "Solo Stack". Write the final visitor facing text for every message key below, in German (de) and English (en).

## Do not use tools

Do not run commands or read files. Everything you need is in this prompt. Reply with the JSON only.

## Facts you may use (and nothing else)

- Solo Stack is a German YouTube channel by a software developer who builds his own apps and projects with heavy AI use. The channel covers project progress, hands on AI model tests, AI news from a developer's perspective, and transparent insights into building a small business.
- Tagline in the banner: AI · CODE · SIDE PROJECTS · BUSINESS.
- Audience: German speaking developers and tech people who want to build their own apps or side projects with AI; people following solo development and the business side of indie software.
- The owner's tools: T3 Code (the coding agent app he works in), SvelteKit and Svelte, Drizzle ORM, Cloudflare, Postgres, AI models. Interests: anime and manga, games, strength training, coffee, music (mostly sad rap), podcasts.
- The homepage is "Eine Nacht im Studio": scrolling it is one night passing, each section is an hour: 20:00 moonrise hero, 21:00 what I make (an ink line drawing six stages), 22:00 a small playable game, 01:00 night shift at the desk with real git commits on the monitor, 02:00 night radio (social platforms are radio stations; an own lo fi track "Solo Stack FM" is coming later), 04:00 open air cinema with the latest video, 06:00 sunrise footer. Mood: calm, cozy, premium, a bit playful, painted watercolor night, butter yellow moonlight.
- The channel has not published its first video yet. Do not claim any number of videos, subscribers, dates, results, income or releases.

## Copy rules

- German is the main language. Address the visitor with "du" (informal, lowercase in running text). English is a natural adaptation, not a literal translation.
- Personal, direct and approachable, like the owner talking. Cozy late night tone. No marketing speak, no superlatives, no clickbait, no emojis.
- Natural phrasing WITHOUT hyphens or dashes in German and English (write "AI testen" not "AI-Tests", avoid compound hyphens, no en or em dashes). Proper names may keep their own spelling (T3 Code, SvelteKit, Solo Stack FM, SOLO STACK, YouTube).
- No invented facts, numbers, dates or promises.
- Respect every length limit and word count in the intents. Labels marked accessible label/name are for screen readers: clear and plain, not cute. Alt texts describe what is visible, concisely.
- Keep placeholders exactly as written, with curly braces, e.g. {phase}, {title}, {name}, {count}, {found}, {total}, {platform}, {status}. Every placeholder that appears in an intent must appear in both the de and en value. Do not add new placeholders.
- "shown uppercase" means CSS uppercases it; write it in normal case.
- egg_console_hint must contain the literal text arise().
- Key prefix lab_games_ is an internal test page: plain and short.

## Output

Return ONLY a JSON object of the form {"de": {"key": "value", ...}, "en": {"key": "value", ...}} containing every key below in both locales. No markdown fences, no comments.

## Keys and intents

- home_meta_title: page <title> of the homepage, brand name SOLO STACK plus a very short hint at what the channel is about
- home_meta_description: meta description of the homepage, max 155 characters, German YouTube channel about building own apps with AI, code, side projects, business
- home_nav_skip: skip link text for keyboard users, jumps to the main content
- home_nav_menu_open: accessible label of the menu button that opens the section overview
- home_nav_menu_close: accessible label of the button that closes the menu overlay
- home_nav_menu_title: accessible name of the menu overlay dialog listing the hours of the night
- home_nav_rail_label: accessible name of the small hour dots navigation on the right edge
- home_nav_section_hero: menu label for the 20:00 hero section, moonrise, who this is
- home_nav_section_making: menu label for the 21:00 section about what I make: AI, code, side projects, business
- home_nav_section_game: menu label for the 22:00 section with a small playable game
- home_nav_section_nightshift: menu label for the 01:00 night shift section, coding at the desk, latest commits
- home_nav_section_radio: menu label for the 02:00 night radio section, music and where to follow on social platforms
- home_nav_section_cinema: menu label for the 04:00 open air cinema section showing the latest video
- home_nav_section_sunrise: menu label for the 06:00 sunrise footer, contact and legal links
- home_hero_tagline: short line under the SOLO STACK wordmark, what the channel is about, in the spirit of AI · CODE · SIDE PROJECTS · BUSINESS
- home_hero_scroll_cue: tiny scroll cue at the bottom of the hero inviting to scroll into the night
- home_hero_moon_label: accessible label of the big moon button in the hero; says that pressing it changes the moon phase and names the current phase {phase}; short
- home_hero_moon_announce: very short screen reader announcement after the moon phase changed, names the new phase {phase}
- home_hero_moon_phase_full: name of the moon phase 'full moon', one or two words
- home_hero_moon_phase_waning_gibbous: name of the moon phase 'waning gibbous', one or two words
- home_hero_moon_phase_half: name of the moon phase 'half moon / last quarter', one or two words
- home_hero_moon_phase_crescent: name of the moon phase 'crescent', one or two words
- home_hero_moon_phase_new: name of the moon phase 'new moon', one or two words
- home_hero_portrait_alt: alt text for the owner's real portrait photo in the small torn paper frame at the bottom left of the hero
- home_making_title: headline of the what I make section, short, about the four pillars AI, code, side projects, business
- home_making_states_label: accessible name of the list of six drawing stages in the what I make section, a few words
- home_making_state_idea_title: big title under the ink drawing, stage 1 lightbulb: ideas, where every project starts; 1 to 2 words, shown uppercase
- home_making_state_ai_title: big title under the ink drawing, stage 2 chat bubble with a prompt: building with AI; 1 to 2 words, shown uppercase
- home_making_state_code_title: big title under the ink drawing, stage 3 code brackets: writing code; 1 to 2 words, shown uppercase
- home_making_state_phone_title: big title under the ink drawing, stage 4 phone with an app: side projects that ship; 1 to 3 words, shown uppercase
- home_making_state_chart_title: big title under the ink drawing, stage 5 rising chart: turning projects into a business (symbolic, no income claims); 1 to 2 words, shown uppercase
- home_making_state_moon_title: big title under the ink drawing, stage 6 crescent moon: the night goes on, leads into the next hour; 1 to 3 words, shown uppercase
- home_making_pillars_label: accessible name of the row of four buttons that jump to the AI, code, side projects and business drawings, a few words
- home_making_skip_label: accessible label of the down arrow that skips the drawing sequence and goes to the next section (the game), a few words
- home_game_title: headline of the 22:00 game section, short and playful, invites a quick round
- home_game_play: play button text on the game poster, one or two words
- home_game_pause: accessible label of the pause button in the game frame
- home_game_resume: accessible label of the resume button in the paused game frame
- home_game_restart: accessible label of the restart button in the game frame
- home_game_score: tiny mono label next to the current score
- home_game_highscore: tiny mono label next to the local high score
- home_game_loading: very short loading hint while the game code loads after pressing play
- home_game_load_error: short friendly message when the game could not be loaded, suggests trying again
- home_game_controls_label: accessible name of the on screen touch controls group
- home_game_touch_left: accessible label of the on screen left button
- home_game_touch_right: accessible label of the on screen right button
- home_game_touch_up: accessible label of the on screen up button
- home_game_touch_down: accessible label of the on screen down button
- home_game_touch_action: accessible label of the on screen action button (jump, drop, connect)
- home_game_moon_title: name of game candidate A: the mascot runs around a tiny moon and squashes bugs
- home_game_stack_title: name of game candidate B: stack paper blocks with tool names up to the moon
- home_game_stack_hint: short hint at the bottom of the game before the first drop: press Space or Enter, click or tap to drop the swinging block onto the tower
- home_game_stack_perfect: one or two words that pop up above the tower after a perfectly aligned drop, playful, display type
- home_game_stack_combo: tiny combo counter under the perfect popup, {count} is the number of perfect drops in a row, like a multiplier, a few characters
- home_game_stack_moon_reached: big celebratory headline when the tower reaches the moon, 1 to 3 words, display type
- home_game_stack_endless: one short line under the moon headline: keep stacking, the sky goes on past the moon
- home_game_stack_collapsed: short headline when the tower topples or a block misses, round over, friendly not punishing
- home_game_stack_retry: small hint under the round over headline: tap, click or press Space to stack again
- home_game_stars_title: name of game candidate C: find and trace constellations shaped like dev tools
- home_game_stars_mode_label: accessible name of the two-option switch between the timed trace mode and the free explore mode
- home_game_stars_mode_trace: one-word label of the timed mode where you trace one named constellation against the clock
- home_game_stars_mode_explore: one-word label of the relaxed mode where you roam the sky and find all constellations without a timer
- home_game_stars_find: tiny mono kicker above the constellation name in trace mode, asks the player to find and connect it, two or three words
- home_game_stars_round: tiny mono label before the round number in trace mode, one word
- home_game_stars_timer_label: accessible name of the shrinking time bar in trace mode
- home_game_stars_explore_hint: one short line shown when explore mode starts: drag the sky to look around, connect stars to reveal hidden tool constellations
- home_game_stars_wheel_label: accessible name of the zodiac wheel that tracks found constellations, says {found} of {total} are found
- home_game_stars_found_announce: screen reader announcement when a constellation is completed, names it: {name}
- home_game_stars_over: short headline when the trace timer runs out, playful, night sky mood
- home_game_stars_over_hint: one line under the time-up headline, invites another round
- home_game_stars_all_found: short celebratory headline when every constellation in explore mode is found
- home_game_stars_again: button text to start a new round of the constellation game, one or two words
- home_game_stars_next: button text on the note card in trace mode to continue with the next constellation, one or two words
- home_game_stars_close: accessible label of the button that closes a constellation note card
- home_game_stars_link: small link text on a constellation note card that leads to the tool or topic {name}, two to four words
- home_game_stars_sign_ai: name of the AI sparkle constellation, one short word or acronym
- home_game_stars_sign_coffee: name of the coffee cup constellation, one word
- home_game_stars_sign_gym: name of the dumbbell constellation (the owner lifts weights), one word
- home_game_stars_sign_moon: name of the crescent moon constellation, one word
- home_game_stars_note_svelte: one short line on a paper note card about Svelte, why the owner builds with it, warm and personal, max 90 characters
- home_game_stars_note_cloudflare: one short line on a paper note card about Cloudflare, where the owner's apps run, max 90 characters
- home_game_stars_note_drizzle: one short line on a paper note card about Drizzle ORM, how the owner talks to databases, max 90 characters
- home_game_stars_note_postgres: one short line on a paper note card about Postgres, the owner's default database, max 90 characters
- home_game_stars_note_t3code: one short line on a paper note card about T3 Code, the coding agent app the owner works in, max 90 characters
- home_game_stars_note_ai: one short line on a paper note card about building with AI and agents, max 90 characters
- home_game_stars_note_coffee: one short line on a paper note card about late night coffee while coding, max 90 characters
- home_game_stars_note_gym: one short line on a paper note card about lifting weights as the counterweight to the desk, max 90 characters
- home_game_stars_note_moon: one short line on a paper note card about working at night under the moon, max 90 characters
- home_nightshift_title: headline of the 01:00 night shift section, coding late at the desk
- home_nightshift_monitor_label: accessible name of the monitor that lists the latest real git commits
- home_nightshift_monitor_empty: one line shown on the monitor when no commits could be loaded, terminal style, no invented facts
- home_nightshift_scene_alt: alt text of the painted room: the mascot in headphones coding at his desk at 1 am, full moon in the window, coffee, bonsai, manga shelf
- home_nightshift_spots_label: accessible name of the group of explorable objects in the room, short
- home_nightshift_spot_window: tooltip for the window with the full moon over the trees, 1 to 5 words, playful, night owl vibe
- home_nightshift_spot_coffee: tooltip for the steaming coffee mug on the desk, 1 to 5 words, playful
- home_nightshift_spot_handheld: tooltip for the handheld game console on the desk (gaming break), 1 to 5 words, playful, no brand names
- home_nightshift_spot_manga: tooltip for the shelf full of manga volumes, 1 to 5 words, playful, no series names
- home_nightshift_spot_bonsai: tooltip for the small bonsai that turns golden when hovered (golden tree easter egg), 1 to 5 words, a little magical
- home_nightshift_spot_dumbbells: tooltip for the dumbbells on the floor under the desk (training between coding sessions), 1 to 5 words, playful
- home_nightshift_tap_hint: small hint on touch screens that objects in the room can be tapped, 2 to 4 words
- home_radio_title: headline for the night radio section, short, cozy, about music and where to follow
- home_radio_socials_label: accessible name of the plain list of all social platform links
- home_radio_chart_title: printed title on the paper frequency chart card next to the radio that lists all social links, 1–3 words, like a label on an old radio station chart
- home_radio_presets_label: accessible name of the group of preset keys on the radio (one key per social platform), short
- home_radio_preset_label: accessible label of one preset key that tunes the radio to the station of platform {name}, short, starts with a verb
- home_radio_dial_label: accessible name of the radio tuning dial slider, 1–3 words
- home_radio_dial_static: screen reader value text of the tuning dial when it is between stations (only static noise), 1–3 words
- home_radio_glass_idle: faint hint printed on the empty dial glass before any station is tuned, invites pressing a key, max 4 words, cozy late-night tone
- home_radio_strip_idle: tiny hint on the dark display strip before any station is tuned, max 4 words, monospace, radio vibe
- home_radio_follow_label: button text on the radio display strip that opens the profile on {platform} (follow), 1–3 words
- home_radio_opens_new_tab: screen reader only note that a link opens in a new tab, very short, in parentheses
- home_radio_latest_video: tiny uppercase label before the latest YouTube video title on the radio display strip, 1–2 words
- home_radio_latest_video_fallback: link text on the radio display strip when no video is available yet, points to the YouTube channel, max 5 words
- home_radio_latest_commit: tiny uppercase label before the latest GitHub commit (repo · message) on the radio display strip, 1–2 words
- home_radio_commits_empty: one short line on the radio display strip when no commits could be loaded, no invented facts, max 6 words
- home_radio_fm_coming_soon: placeholder line on the music station "Solo Stack FM" while the own lo-fi track is not released yet, coming soon, cozy, max 7 words
- home_radio_play: accessible label of the play button of the music station, 1–2 words
- home_radio_pause: accessible label of the pause button of the music station, 1–2 words
- home_radio_volume: accessible label of the volume slider of the music station, 1 word
- home_radio_tuned_status: screen reader status announced after tuning the radio to station {name}, short
- home_cinema_title: headline of the 04:00 open air cinema section with the latest video
- home_cinema_watch_link: small link text below the latest video to watch it on YouTube
- home_cinema_channel_link: link text shown instead of a video when the latest video is unavailable, leads to the YouTube channel
- home_cinema_play_label: accessible label of the moon-shaped play button on the latest video thumbnail; plays the video right here; must contain the video title {title}
- home_cinema_empty: one short line inside the empty projector screen when no video is available yet; calm and warm, the first video is on its way; points to the channel link below, max 8 words
- home_cinema_new_tab: short screen reader hint appended to links that open YouTube in a new tab, 2 to 4 words
- home_sunrise_title: closing line of the 06:00 sunrise footer, warm goodbye, morning after a night of building
- home_sunrise_footer_label: accessible name of the footer navigation with legal and social links
- home_sunrise_legal_imprint: footer link label for the legal notice page (German Impressum), one word
- home_sunrise_legal_privacy: footer link label for the privacy policy page (German Datenschutz), one word
- home_sunrise_legal_contact: footer link label for the contact page, one word
- home_sunrise_socials_label: accessible name of the row of social profile icon links in the footer
- home_sunrise_social_link: accessible label of a footer social icon link; {name} is the platform name like YouTube; opens the profile in a new tab
- lab_games_title: page title of the internal playtest page for the three game prototypes
- lab_games_tabs_label: accessible name of the tab list that switches between game prototypes
- lab_games_debug_title: tiny heading of the debug tuning slider panel
- lab_games_debug_reset: button text that resets all tuning sliders to their defaults
- lab_games_touch_toggle: tiny label of a checkbox that always shows the on screen touch buttons, for testing on desktop
- egg_arise_title: one huge word shown for a few seconds while ink shadow figures rise (Konami code easter egg); a summoning command in the spirit of ARISE, one word, uppercase works
- egg_console_title: short greeting printed next to SOLO STACK in the browser DevTools console for curious developers; a few words, playful, night themed
- egg_console_message: one or two sentences in the DevTools console under the ASCII moon: you found the backstage of the night studio, the site is built with SvelteKit, nod to fellow builders; casual, no marketing
- egg_console_hint: one short line in the DevTools console hinting that typing arise() summons something; must contain the literal arise()
- egg_console_arise_reply: very short reply printed in the DevTools console after the visitor calls arise(); a wink, two to five words
- error_page_title: browser tab title of an error page; must contain the status code {status} and the brand name SOLO STACK, very short
- error_404_title: h1 of the 404 page; playful, the visitor (and the little mascot) got lost in an endless ink void, at most 6 words
- error_404_body: one or two short sentences under the 404 heading; this page does not exist, calm and friendly, points to the way home below, no blame
- error_500_title: h1 of the 500 page; something huge is peeking over the wall and the server stumbled, playful but reassuring, at most 6 words
- error_500_body: one or two short sentences under the 500 heading; something broke on our side, it is not the visitor's fault, try again in a moment or go home
- error_other_title: h1 of a generic error page for any other status code (shown next to the number), something went wrong with this request, at most 6 words
- error_other_body: one short sentence under the generic error heading; suggest going back to the homepage
- error_home_link: text of the main link back to the homepage on error pages, 2 to 4 words
- error_retry: text of the button that reloads the page after a server error, 1 to 3 words
- error_sections_label: accessible name and tiny visible heading of the list of homepage sections offered as ways out on error pages, 2 to 4 words
- error_404_mascot_alt: alt text of the small lost mascot (a chibi of the channel owner scratching his head, confused) floating in the ink void on the 404 page
- error_500_scene_alt: alt text of the 500 illustration: a huge faceless ink giant peeks over a stone wall at a tiny lit studio while the mascot sits outside and looks up at it
