You are the copywriter for solo-stack.dev, the homepage and video blog of the German YouTube channel "Solo Stack" (a developer building his own apps with AI; tagline AI · CODE · SIDE PROJECTS · BUSINESS). Write the UI text of the new contact page at /kontakt (English: /en/kontakt). It is a simple form for business requests, collaborations, feedback or anything else. It is styled like a letter written at night on watercolor paper; the giant page heading sits over a butter yellow pigment wash.

Do not use tools. Reply with JSON only.

Rules: German (du form) and a natural English adaptation; personal, calm, direct; no marketing; no emojis; no hyphens or dashes; no invented facts, numbers, response times or promises (do not promise when or whether I reply). Keep labels short.

Keys and intents:

- site_nav_contact: navbar link label to this page, one word
- contact_meta_title: HTML title, e.g. "Kontakt · SOLO STACK" style, keep the "· SOLO STACK" suffix
- contact_meta_description: meta description, one sentence, what you can write to me about
- contact_title: giant page heading, one or two short words
- contact_intro: one or two sentences under the heading: business requests, collaborations, feedback or just a hello are welcome here
- contact_topic_legend: legend of the topic choice (what is it about)
- contact_topic_business: topic option, business request
- contact_topic_collab: topic option, collaboration
- contact_topic_feedback: topic option, feedback on a video or the site
- contact_topic_other: topic option, something else
- contact_name_label: field label, your name
- contact_email_label: field label, your email address
- contact_email_hint: tiny hint under the email field: only used to reply
- contact_message_label: field label, your message
- contact_message_placeholder: placeholder inside the empty message textarea, a short inviting start
- contact_honeypot_label: label of a hidden spam trap field that only bots see, tell humans to leave it empty
- contact_submit: submit button
- contact_sending: submit button while sending
- contact_error_topic: inline error, choose a topic
- contact_error_name: inline error, name missing
- contact_error_email: inline error, email address invalid
- contact_error_message: inline error, message missing or too short (at least a few words)
- contact_error_turnstile: inline error, the Cloudflare human check did not work or was not finished, try again
- contact_error_failed: error after submitting, the message could not be sent, try again later
- contact_noscript: shown when JavaScript is off: the form needs JavaScript for the spam check
- contact_privacy_note: one short sentence before a link, where to read how the data is handled (the link text follows right after)
- contact_privacy_link: link text, privacy policy
- contact_success_title: heading after sending, short
- contact_success_body: one sentence after sending, the message arrived (no promise about a reply time)
- contact_success_again: button to write another message

Output: {"de": {"key": "value", ...}, "en": {"key": "value", ...}} with all keys in both locales. No markdown fences.
