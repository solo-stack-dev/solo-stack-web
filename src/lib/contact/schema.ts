import * as v from 'valibot';

/** What a message is about. Labels: `contact_topic_*` messages. */
export const CONTACT_TOPICS = ['business', 'collab', 'feedback', 'other'] as const;
export type ContactTopic = (typeof CONTACT_TOPICS)[number];

/** Limits shared by the inputs (`maxlength`) and the schema. */
export const CONTACT_LIMITS = { name: 120, email: 254, messageMin: 20, messageMax: 5000 } as const;

/**
 * The contact form, validated in the browser (`preflight`) and again on the server. Issue messages are not shown to
 * visitors: they are stable codes, the page shows the localized `contact_error_*` message of the field instead (the
 * remote endpoint has no locale in its URL, so the server could only answer in the base locale).
 *
 * `turnstile` is a hidden input holding the token of the Turnstile widget (`TurnstileWidget` `ontoken`). `website` is a
 * honeypot: hidden from people, bots fill it in.
 */
export const ContactSchema = v.object({
	topic: v.picklist(CONTACT_TOPICS, 'topic'),
	name: v.pipe(v.string('name'), v.trim(), v.nonEmpty('name'), v.maxLength(CONTACT_LIMITS.name, 'name')),
	email: v.pipe(v.string('email'), v.trim(), v.email('email'), v.maxLength(CONTACT_LIMITS.email, 'email')),
	message: v.pipe(v.string('message'), v.trim(), v.minLength(CONTACT_LIMITS.messageMin, 'message'), v.maxLength(CONTACT_LIMITS.messageMax, 'message')),
	website: v.optional(v.string(), ''),
	turnstile: v.pipe(v.string('turnstile'), v.nonEmpty('turnstile'))
});

export type ContactInput = v.InferOutput<typeof ContactSchema>;

/** A validated message, without the spam protection fields. */
export type ContactMessage = Omit<ContactInput, 'website' | 'turnstile'>;
