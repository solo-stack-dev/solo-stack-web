/* oxlint-disable no-console -- server logs end up in Workers Logs (observability), the only place to see form failures */
import { env } from 'cloudflare:workers';
import type { ContactMessage } from './schema.ts';

/**
 * Sender of the notification mails. Must be on a domain onboarded to Cloudflare Email Sending (solo-stack.dev is) and
 * is pinned by `allowed_sender_addresses` of the `CONTACT_EMAIL` binding in `wrangler.jsonc`.
 */
const FROM = { email: 'kontakt@solo-stack.dev', name: 'solo-stack.dev Kontakt' } as const;

/**
 * Public business address. Email Routing forwards it to the owner's private inbox (dashboard > Email Service > Email
 * Routing), so the private address never appears in this public repo. Must match `destination_address` of the binding.
 */
const TO = 'business@solo-stack.dev';

/**
 * Hands a verified contact message to the owner by mail (Cloudflare Email Sending, `send_email` binding `CONTACT_EMAIL`).
 * The binding pins sender and recipient, so the Worker cannot be abused to mail anyone else.
 * `Reply-To` is the visitor, so answering the mail answers them.
 *
 * `pnpm dev` / `pnpm preview` simulate the binding: the mail is only printed to the console, nothing is sent.
 * Throws when sending fails; the form then tells the visitor to try again later.
 */
export async function deliverContactMessage(message: ContactMessage): Promise<void> {
	const { messageId } = await env.CONTACT_EMAIL.send({
		from: FROM,
		to: TO,
		replyTo: { email: message.email, name: message.name },
		subject: `[${message.topic}] ${message.name}`,
		text: [`Topic: ${message.topic}`, `Name: ${message.name}`, `Email: ${message.email}`, '', message.message].join('\n')
	});
	console.log('Contact form message sent', { messageId, topic: message.topic });
}
