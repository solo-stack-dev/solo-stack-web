You are the copywriter for solo-stack.dev, the website of the German YouTube channel "Solo Stack" (a developer building his own apps and side projects with heavy AI use; tagline AI · CODE · SIDE PROJECTS · BUSINESS). The channel is transparent about building in public, including the business side.

Write the UI copy for a new public page at /stats: a calm stats dashboard that shows the follower numbers of all Solo Stack social profiles (YouTube, GitHub, Instagram, TikTok, X, Bluesky, Threads, Twitch, Facebook; Discord follows later) in one place. Sections: a header, a row of four headline numbers, a follower growth chart, one card per platform, a bar that shows each platform's share of the total reach, a YouTube section (subscribers, views, watch time, average view duration, daily views chart, most watched videos) and a posting activity calendar. A switch at the top picks the period (7, 30 or 90 days) for all numbers and charts. For now the page shows example data (mock numbers) until the real platform APIs are connected; that must be stated honestly.

Do not use tools. Reply with JSON only.

Rules:

- German (du form where you address the reader) and a natural English adaptation.
- Personal, direct, calm, approachable. No marketing, no hype, no superlatives, no emojis.
- No hyphens or dashes anywhere (write "AI testen", not "AI-Tests"; no "–" or "—").
- No invented facts or numbers. Never put concrete numbers into the text; numbers only come from the placeholders.
- Keep the placeholders exactly as given (e.g. {days}, {count}). Any wording with a number placeholder must read correctly for every number including 1 (avoid plural nouns right after a number placeholder, e.g. prefer "Beiträge: {count}" over "{count} Beiträge").
- Labels are short (1 to 4 words, sentence case). Descriptions are one short sentence.

Keys and intents:

- stats_meta_title: HTML title of the page (include "Solo Stack", max 60 characters)
- stats_meta_description: meta description for search engines (max 155 characters): all Solo Stack social profiles and their numbers in one place
- stats_eyebrow: tiny monospace label above the main heading (1 to 2 words)
- stats_title: main heading of the page (2 to 5 words)
- stats_intro: one or two sentences under the heading: why the numbers are public (building in public, transparency)
- stats_mock_badge: tiny badge that marks the data as example data (1 to 2 words)
- stats_mock_note: one sentence: these are example numbers for now, the real numbers follow once the platforms are connected
- stats_as_of: data date, placeholder {date} (e.g. "Stand: {date}")
- stats_period_label: accessible name of the period switch
- stats_period_days: option of the period switch, placeholder {days} (always 7, 30 or 90)
- stats_kpi_reach: label of the headline number "total followers across all platforms"
- stats_kpi_reach_hint: small hint under it, placeholder {count} (number of platforms), e.g. "across {count} platforms" but must work for any number
- stats_kpi_new: label "new followers in the selected period"
- stats_kpi_views: label "YouTube views in the selected period"
- stats_kpi_watch_time: label "YouTube watch time in the selected period"
- stats_unit_hours: watch time value with unit, placeholder {value} (an already formatted number of hours, abbreviated unit)
- stats_delta_previous: small muted text after a percentage change, placeholder {days}: compared with the previous {days} days
- stats_growth_title: heading of the follower growth chart
- stats_growth_description: one sentence, placeholder {days}: how the followers developed over the last {days} days
- stats_growth_view_label: accessible name of the switch between total and per platform view
- stats_growth_view_total: switch option "total" (1 word)
- stats_growth_view_platforms: switch option "per platform" (1 to 2 words)
- stats_growth_other: legend label that groups the smaller platforms (1 word, like "Other")
- stats_growth_total_series: series name of the total followers line (1 to 2 words)
- stats_table_show: summary of a collapsible that shows the chart data as a table (2 to 4 words)
- stats_table_date: table column header "date"
- stats_platforms_title: heading of the platform cards section
- stats_platforms_description: one sentence about the cards (followers and change per platform)
- stats_share_title: label of the bar that shows each platform's share of the total reach
- stats_unit_followers: unit under a follower number (1 word)
- stats_unit_subscribers: unit under the YouTube subscriber number (1 word)
- stats_profile_open: accessible link label, placeholder {platform}: open the profile on that platform
- stats_sparkline_label: accessible description of a small trend line, placeholder {days}: trend of the last {days} days
- stats_platform_soon: short status on the Discord card: coming later (1 to 3 words)
- stats_youtube_title: heading of the YouTube section
- stats_youtube_description: one sentence: the channel in detail
- stats_youtube_subscribers: label "subscribers"
- stats_youtube_views: label "views"
- stats_youtube_watch_time: label "watch time"
- stats_youtube_avg_duration: label "average view duration"
- stats_youtube_views_chart: heading of the daily views bar chart
- stats_youtube_views_series: series name "views" in the chart tooltip (1 word)
- stats_youtube_top_title: heading of the list of most watched videos in the selected period
- stats_youtube_top_views: views of one video, placeholder {count}, must work for any number (e.g. "Aufrufe: {count}")
- stats_youtube_top_rank: accessible text for the rank in that list, placeholder {rank}
- stats_activity_title: heading of the posting activity calendar (one cell per day, all platforms together)
- stats_activity_description: one sentence, placeholder {weeks}: posts on all platforms over the last {weeks} weeks
- stats_activity_total: total posts in the calendar, placeholder {count}, must work for any number
- stats_activity_cell: tooltip of one calendar day, placeholders {date} and {count}, must work for any number
- stats_activity_streak: longest run of consecutive days with a post, placeholder {days}, must work for any number (e.g. "Längste Serie in Tagen: {days}")
- stats_activity_less: legend label at the low end of the color scale (1 word)
- stats_activity_more: legend label at the high end of the color scale (1 word)

Output: {"de": {"key": "value", ...}, "en": {"key": "value", ...}} with all keys above in both locales. No markdown fences.
