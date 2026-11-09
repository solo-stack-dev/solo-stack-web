<!--
	@component
	Turnstile in a form. The script loads on the first touch of the form (`focusin`, `pointerdown` or `input` inside it), not on
	mount: it keeps a phone's CPU busy for half a minute, and only people who write need it. Writing a message takes longer
	than the check, and a send that comes first waits for the token (`ready()`). `response-field: false`: remote form fields
	are namespaced per form, so the page writes the token into its `turnstile` field via `ontoken`. `interaction-only`: only
	suspected bots see a checkbox. Follows site theme (re-renders on switch) and page language. Call `reset()` after every
	submission that reached the server: tokens are single use.
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

	/** Events inside the form that start the script. */
	const TRIGGERS = ['focusin', 'pointerdown', 'input'] as const;

	/** How long a send waits for a token before it counts as unsolved (the page then shows the challenge message). */
	const TOKEN_WAIT_MS = 20_000;

	let requested = $state(false);
	let widgetId: string | undefined;
	let token = '';
	/** The script failed, the challenge failed (Turnstile retries itself) or a send waited in vain; or it waits for a click on its checkbox. */
	let failed = false;
	let interactive = false;
	let waiters: { resolve: () => void; reject: (error: Error) => void; timer: ReturnType<typeof setTimeout> }[] = [];

	function setToken(value: string) {
		token = value;
		ontoken(value);
	}

	function settle(error?: Error) {
		const list = waiters;
		waiters = [];
		for (const { resolve, reject, timer } of list) {
			clearTimeout(timer);
			if (error) reject(error);
			else resolve();
		}
	}

	/** Starts the script (once). Called by the form triggers and by `ready()`. */
	export function load() {
		requested = true;
	}

	/** No token yet, but one is on its way without anyone's help: not loaded yet, loading, or the invisible check runs. */
	export function pending() {
		return !token && !failed && !interactive && !!TURNSTILE_SITE_KEY;
	}

	/** Resolves once a token is in the form; rejects when none comes on its own (see `pending`) or after `TOKEN_WAIT_MS`. */
	export function ready(): Promise<void> {
		load();
		if (token) return Promise.resolve();
		if (!pending()) return Promise.reject(new Error('Turnstile: no token'));
		return new Promise((resolve, reject) => {
			// Counts as a failed challenge (message on the page) until a token still arrives
			const timer = setTimeout(() => {
				failed = true;
				onerror?.(true);
				settle(new Error('Turnstile: no token in time'));
			}, TOKEN_WAIT_MS);
			waiters.push({ resolve, reject, timer });
		});
	}

	export function reset() {
		setToken('');
		if (widgetId) window.turnstile?.reset(widgetId);
	}

	/** Starts the script on the first touch of the form; outside a form right away. */
	function trigger(node: HTMLElement) {
		const form = node.closest('form');
		if (!form) {
			load();
			return;
		}
		const start = () => {
			load();
			for (const type of TRIGGERS) form.removeEventListener(type, start, true);
		};
		for (const type of TRIGGERS) form.addEventListener(type, start, { capture: true, passive: true });
		return () => {
			for (const type of TRIGGERS) form.removeEventListener(type, start, true);
		};
	}

	function widget(node: HTMLElement) {
		// Read synchronously so a theme switch re-runs the attachment (and so does the first touch of the form)
		const theme = mode.current === 'dark' ? 'dark' : 'light';
		if (!requested) return;
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
					callback: (value) => {
						failed = false;
						interactive = false;
						setToken(value);
						onerror?.(false);
						settle();
					},
					'error-callback': (code) => {
						failed = true;
						setToken('');
						onerror?.(true);
						settle(new Error(`Turnstile error ${code}`));
						// Handled: Turnstile retries itself; suppresses the default handler's console noise
						return true;
					},
					'before-interactive-callback': () => {
						// The checkbox shows: a waiting send stops and asks for it, as a send without a token always did
						interactive = true;
						settle(new Error('Turnstile needs a click'));
					},
					'expired-callback': () => reset()
				});
			})
			.catch((cause) => {
				// oxlint-disable-next-line no-console -- script blocked or offline; the form shows the challenge error
				console.error(cause);
				if (removed) return;
				failed = true;
				onerror?.(true);
				settle(cause instanceof Error ? cause : new Error(String(cause)));
			});

		return () => {
			removed = true;
			setToken('');
			if (widgetId) window.turnstile?.remove(widgetId);
			widgetId = undefined;
		};
	}
</script>

<div class="turnstile empty:hidden" {@attach trigger} {@attach widget}></div>
