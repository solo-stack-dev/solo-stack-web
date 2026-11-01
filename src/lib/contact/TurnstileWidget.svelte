<!--
	@component
	Cloudflare Turnstile inside a form: loads the script on mount (contact page only) and renders the widget
	explicitly. The widget does not add its own token input (`response-field: false`): remote form fields are
	namespaced per form, so the page puts the token into its bound `turnstile` field via `ontoken`. Appearance
	`interaction-only`: most visitors never see it, only a suspected bot gets the checkbox. Theme follows the site
	theme (the widget re-renders on a switch) and the language follows the page.

	Call `reset()` after every submission that reached the server: tokens are single use.
-->
<script lang="ts">
	import { mode } from 'mode-watcher';
	import { getLocale } from '#lib/paraglide/runtime.js';
	import { loadTurnstile, TURNSTILE_ACTION, TURNSTILE_SITE_KEY } from './turnstile.ts';

	interface Props {
		/** The current token, `''` while there is none (not solved yet, expired, reset). */
		ontoken: (token: string) => void;
		/** `true` when the widget cannot load or the challenge fails, `false` once a token arrives. */
		onerror?: (failed: boolean) => void;
	}

	let { ontoken, onerror }: Props = $props();

	let widgetId: string | undefined;

	export function reset() {
		ontoken('');
		if (widgetId) window.turnstile?.reset(widgetId);
	}

	function widget(node: HTMLElement) {
		// Read synchronously, so a theme switch re-runs the attachment
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
						// Handled: Turnstile retries on its own, no console noise from the default handler
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
