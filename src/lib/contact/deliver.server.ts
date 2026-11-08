/* oxlint-disable no-console -- server logs end up in Workers Logs (observability), the only place to see form failures */
import { env } from 'cloudflare:workers';
import type { ContactMessage } from './schema.ts';

/** Must be on a domain onboarded to Cloudflare Email Sending; pinned by `allowed_sender_addresses` of `CONTACT_EMAIL` (`wrangler.jsonc`). */
const FROM = { email: 'contact@solo-stack.dev', name: 'solo-stack.dev Kontakt' } as const;

/**
 * Public address; Email Routing (dashboard) forwards it to the owner's private inbox, which thus stays out of this public repo.
 * Must match the binding's `destination_address`.
 */
const TO = 'business@solo-stack.dev';

/**
 * Mails a verified message to the owner. The binding pins sender and recipient, so the Worker cannot mail anyone else;
 * `Reply-To` is the visitor. `pnpm dev`/`preview` only print the mail. Throws on failure (the form asks to retry later).
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
