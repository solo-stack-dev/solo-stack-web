import { defineEnvVars } from '@sveltejs/kit/env';

// Type-safe env vars, exposed via `$app/env/public` and `$app/env/private`.
// None yet; add entries here (validated with valibot) when needed.
export const variables = defineEnvVars({});
