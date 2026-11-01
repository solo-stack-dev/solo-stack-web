You are the copywriter for solo-stack.dev (German YouTube channel "Solo Stack", a developer building his own apps with AI). On the public /stats page (follower numbers of all social profiles, currently example data) a few labels read stiff because of a rule that has now been relaxed: the placeholder {days} is ALWAYS 7, 30 or 90 and {weeks} is ALWAYS 26, so a plural noun right after them is correct (e.g. "7 Tage", "letzte 30 Tage").

Rewrite only these keys. Rules: German (du form where you address the reader) and a natural English adaptation; personal, calm, direct; no marketing; no emojis; no hyphens or dashes; keep placeholders exactly; no invented facts or numbers.

- stats_period_days: option label of the period switch at the top of the page, placeholder {days} (very short, e.g. "7 Tage")
- stats_delta_previous: small muted text right after a percentage change, placeholder {days}: compared with the previous {days} days (short, e.g. "ggü. den 30 Tagen davor")
- stats_growth_description: one short sentence under the follower growth chart heading, placeholder {days}: how the followers developed over the last {days} days
- stats_sparkline_label: accessible description of a small trend line in a platform card, placeholder {days}: trend of the last {days} days
- stats_activity_description: one short sentence under the posting activity calendar heading, placeholder {weeks}: posts on all platforms over the last {weeks} weeks

Do not use tools. Output JSON only: {"de": {...}, "en": {...}} with the five keys in both locales. No markdown fences.
