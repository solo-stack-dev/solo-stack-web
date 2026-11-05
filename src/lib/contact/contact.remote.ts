/* oxlint-disable no-console -- server logs end up in Workers Logs (observability), the only place to see form failures */
import { error, invalid } from '@sveltejs/kit';
import { form, getRequestEvent } from '$app/server';
import { deliverContactMessage } from './deliver.server.ts';
import { ContactSchema } from './schema.ts';
import { TurnstileNotConfiguredError, verifyTurnstile } from './turnstile.server.ts';

/**
 * /kontakt form, runs in the Worker (`/_app/remote/…`); needs JS, as Turnstile does anyway. Issue codes as in `ContactSchema`
 * (`turnstile` = rejected token). A filled honeypot gets the normal success answer and the message is dropped.
 */
export const sendContact = form(ContactSchema, async ({ website, turnstile, ...message }, issue) => {
	if (website) return { sent: true } as const;

	const { url, getClientAddress } = getRequestEvent();
	let verified: boolean;
	try {
		verified = await verifyTurnstile(turnstile, { ip: getClientAddress(), hostname: url.hostname });
	} catch (cause) {
		console.error(cause instanceof TurnstileNotConfiguredError ? cause.message : 'Turnstile siteverify failed', cause);
		error(503, 'Contact form unavailable');
	}
	if (!verified) invalid(issue.turnstile('turnstile'));

	try {
		await deliverContactMessage(message);
	} catch (cause) {
		// Logged in full so a failed mail does not lose the message.
		console.error('Contact mail failed', { cause, topic: message.topic, name: message.name, email: message.email, message: message.message });
		error(503, 'Contact form unavailable');
	}
	return { sent: true } as const;
});
