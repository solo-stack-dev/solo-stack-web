/* oxlint-disable no-console -- server logs end up in Workers Logs (observability), the only place to see form failures */
import type { ContactMessage } from './schema.ts';

/**
 * Hands a verified contact message to the owner.
 *
 * TODO(owner): no delivery channel yet. Until then the message only lands in Workers Logs (observability is on),
 * so nothing is lost but nobody is notified. The Cloudflare native option is Email Routing: enable it for the
 * solo-stack.dev zone, verify the destination address, add a `send_email` binding to every environment in
 * `wrangler.jsonc` (`{ "name": "CONTACT_EMAIL", "destination_address": "…" }`), run `pnpm gen`, and send the
 * message here via `getRequestEvent().platform.env.CONTACT_EMAIL.send(…)` with `Reply-To` set to `message.email`.
 * Throw on failure: the form then tells the visitor to try again later.
 */
export async function deliverContactMessage(message: ContactMessage): Promise<void> {
	console.log('Contact form message', { topic: message.topic, name: message.name, email: message.email, message: message.message });
}
