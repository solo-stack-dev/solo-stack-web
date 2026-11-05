<!--
	@component
	Turnstile in a form, script loaded on mount. `response-field: false`: remote form fields are namespaced per form, so the
	page writes the token into its `turnstile` field via `ontoken`. `interaction-only`: only suspected bots see a checkbox.
	Follows site theme (re-renders on switch) and page language. Call `reset()` after every submission that reached the
	server: tokens are single use.
-->
<script lang="ts">
	import { mode } from 'mode-watcher';
	import { getLocale } from '#lib/paraglide/runtime.js';
	import { loadTurnstile, TURNSTILE_ACTION, TURNSTILE_SITE_KEY } from './turnstile.ts';

	interface Props {
		/** The current token, `''` while there is none (not solved yet, expired, reset). */
		ontoken: (token: string) => void;
		/** `true` when the widget fails to load or the challenge fails, `false` once a token arrives. */
		onerror?: (failed: boolean) => void;
	}

	let { ontoken, onerror }: Props = $props();

	let widgetId: string | undefined;

	export function reset() {
		ontoken('');
		if (widgetId) window.turnstile?.reset(widgetId);
	}

	function widget(node: HTMLElement) {
		// Read synchronously so a theme switch re-runs the attachment
		const theme = mode.current === 'dark' ? 'dark' : 'light';
		let removed = false;

		if (!TURNSTILE_SITE_KEY) {
			// oxlint-disable-next-line no-console -- a deploy build without a site key, see turnstile.ts
			console.warn('Turnstile: no site key for this build (src/lib/contact/turnstile.ts)');
			return;
		}

		loadTurnstile()
			.then((turnstile) => {
				if (removed) return;
				widgetId = turnstile.render(node, {
					sitekey: TURNSTILE_SITE_KEY,
					action: TURNSTILE_ACTION,
					theme,
					size: 'flexible',
					appearance: 'interaction-only',
					language: getLocale(),
					'response-field': false,
					callback: (token) => {
						ontoken(token);
						onerror?.(false);
					},
					'error-callback': () => {
						ontoken('');
						onerror?.(true);
						// Handled: Turnstile retries itself; suppresses the default handler's console noise
						return true;
					},
					'expired-callback': () => reset()
				});
			})
			.catch((cause) => {
				// oxlint-disable-next-line no-console -- script blocked or offline; the form shows the challenge error
				console.error(cause);
				if (!removed) onerror?.(true);
			});

		return () => {
			removed = true;
			ontoken('');
			if (widgetId) window.turnstile?.remove(widgetId);
			widgetId = undefined;
		};
	}
</script>

<div class="turnstile empty:hidden" {@attach widget}></div>
