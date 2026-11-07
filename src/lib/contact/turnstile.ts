/**
 * Cloudflare Turnstile, browser side: site key and lazy script loader.
 * Outside `staging`/`production` builds the official test key is used (always passes, "testing only" widget); the matching
 * test secret is the server default there (`turnstile.server.ts`), so the form works locally without setup.
 */

// Widget for solo-stack.dev + staging.solo-stack.dev, mode Managed. Site keys are public. Secret: TURNSTILE_SECRET_KEY in `.env.<mode>`.
const SITE_KEY = '0x4AAAAAAFxPRdhFUZe1Puyr';

/** Official test site key: always passes, visible widget. */
const TEST_SITE_KEY = '1x00000000000000000000AA';

/** `vite build --mode <mode>`: only the deploy builds need the real key. */
export const TURNSTILE_TESTING = import.meta.env.MODE !== 'staging' && import.meta.env.MODE !== 'production';

/** The test key outside deploy builds: the real widget only accepts its own hostnames, and the test secret only test tokens. */
export const TURNSTILE_SITE_KEY = TURNSTILE_TESTING ? TEST_SITE_KEY : SITE_KEY;

/** Checked by the server, so a token from another site's form is rejected. */
export const TURNSTILE_ACTION = 'contact';

export interface TurnstileRenderOptions {
	sitekey: string;
	action?: string;
	theme?: 'auto' | 'light' | 'dark';
	size?: 'normal' | 'flexible' | 'compact';
	appearance?: 'always' | 'execute' | 'interaction-only';
	language?: string;
	'response-field'?: boolean;
	callback?: (token: string) => void;
	'error-callback'?: (code: string) => boolean | void;
	'expired-callback'?: () => void;
	'timeout-callback'?: () => void;
}

export interface TurnstileApi {
	render(container: HTMLElement | string, options: TurnstileRenderOptions): string | undefined;
	reset(widgetId?: string): void;
	remove(widgetId?: string): void;
	getResponse(widgetId?: string): string | undefined;
}

declare global {
	interface Window {
		turnstile?: TurnstileApi;
	}
}

const SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

let loading: Promise<TurnstileApi> | undefined;

/**
 * Loads the script once, on the contact page only. Must come from Cloudflare directly: a proxied or cached copy breaks
 * with their updates. A failed load can be retried.
 */
export function loadTurnstile(): Promise<TurnstileApi> {
	if (window.turnstile) return Promise.resolve(window.turnstile);
	loading ??= new Promise<TurnstileApi>((resolve, reject) => {
		const script = document.createElement('script');
		script.src = SCRIPT_URL;
		script.async = true;
		script.addEventListener('load', () => (window.turnstile ? resolve(window.turnstile) : reject(new Error('Turnstile did not initialize'))));
		script.addEventListener('error', () => {
			script.remove();
			loading = undefined;
			reject(new Error('Turnstile script failed to load'));
		});
		document.head.appendChild(script);
	});
	return loading;
}
