/* oxlint-disable no-console -- server logs end up in Workers Logs (observability), the only place to see form failures */
import { TURNSTILE_SECRET_KEY } from '$app/env/private';
import { TURNSTILE_ACTION, TURNSTILE_TESTING } from './turnstile.ts';

/** Official Turnstile test secret: accepts only the dummy token of the test site key. */
const TEST_SECRET_KEY = '1x0000000000000000000000000000000AA';

const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

interface SiteverifyResult {
	success: boolean;
	'error-codes'?: string[];
	hostname?: string;
	action?: string;
}

/** `TURNSTILE_SECRET_KEY` is a Worker secret (`.env.staging` / `.env.production`). */
function secretKey(): string | undefined {
	return TURNSTILE_SECRET_KEY || (TURNSTILE_TESTING ? TEST_SECRET_KEY : undefined);
}

export class TurnstileNotConfiguredError extends Error {
	constructor() {
		super('TURNSTILE_SECRET_KEY is not set');
	}
}

/**
 * Siteverify check; tokens are single use and expire after 5 min. A real secret also requires our `action` and the request's
 * host (the test secret returns dummy values, so skipped). False = rejected token. Throws `TurnstileNotConfiguredError`
 * without a secret, and on network errors, so the form says "could not send" instead of blaming the visitor.
 */
export async function verifyTurnstile(token: string, { ip, hostname }: { ip?: string; hostname: string }): Promise<boolean> {
	const secret = secretKey();
	if (!secret) throw new TurnstileNotConfiguredError();

	const response = await fetch(SITEVERIFY_URL, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ secret, response: token, remoteip: ip, idempotency_key: crypto.randomUUID() }),
		signal: AbortSignal.timeout(10_000)
	});
	if (!response.ok) throw new Error(`Turnstile siteverify answered ${response.status}`);

	const result = (await response.json()) as SiteverifyResult;
	if (!result.success) {
		console.warn('Turnstile rejected a contact form token', result['error-codes']);
		return false;
	}
	if (secret === TEST_SECRET_KEY) return true;
	if (result.action !== TURNSTILE_ACTION || result.hostname !== hostname) {
		console.warn('Turnstile token for another widget or host', { action: result.action, hostname: result.hostname });
		return false;
	}
	return true;
}
