import { defineEnvVars } from '@sveltejs/kit/env';

// Type-safe env vars for `$app/env/public` / `$app/env/private`, validated with valibot or a function.
export const variables = defineEnvVars({
	TURNSTILE_SECRET_KEY: {
		description:
			'Cloudflare Turnstile secret of the contact form widget (Worker secret via .env.staging / .env.production). Optional: unset in dev and preview, which use the always-pass test secret; a deploy build without it rejects contact messages.',
		schema: (value) => value || undefined
	}
});
