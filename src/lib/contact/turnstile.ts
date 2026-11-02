/**
 * Cloudflare Turnstile, browser side: the public site key and a lazy loader for the widget script.
 *
 * Outside the `staging` and `production` builds (`pnpm dev`, `pnpm preview`) the official test key is used, which
 * always passes and shows a "testing only" widget. The matching test secret is the server default in those modes
 * (`turnstile.server.ts`), so the whole form works locally without any setup.
 */

// Site key of the Turnstile widget (hostnames solo-stack.dev and staging.solo-stack.dev, mode Managed). Site keys are
// public, committing it is fine. The secret goes into `.env.staging` / `.env.production` as TURNSTILE_SECRET_KEY.
const SITE_KEY = '0x4AAAAAAFxPRdhFUZe1Puyr';

/** Official Turnstile test site key: always passes, visible widget. */
const TEST_SITE_KEY = '1x00000000000000000000AA';

/** `vite build --mode <mode>`: only the deploy builds need the real key. */
export const TURNSTILE_TESTING = import.meta.env.MODE !== 'staging' && import.meta.env.MODE !== 'production';

/** Site key for the current build, empty when a deploy build has no key yet (the widget then stays empty). */
export const TURNSTILE_SITE_KEY = SITE_KEY || (TURNSTILE_TESTING ? TEST_SITE_KEY : '');

/** `action` of the widget, checked by the server so a token from another form on another site is rejected. */
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
 * Loads the Turnstile script once (only on the contact page, so no other page pays for it). Must be fetched from
 * Cloudflare directly: a proxied or cached copy breaks with their updates. A failed load can be retried.
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
