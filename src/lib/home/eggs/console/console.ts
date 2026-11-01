/**
 * Egg: DevTools console (mockup 01-mascot-easter-eggs/11). Loaded lazily on idle by Eggs.svelte, in production too.
 * Prints an ASCII moon and a short message once per browser session, and defines `window.arise()`, which dispatches
 * ARISE_EVENT (the same effect as the Konami code).
 */
/* oxlint-disable no-console -- printing to the console is this egg */
import { m } from '#lib/paraglide/messages.js';
import { ARISE_EVENT } from '../events.ts';

declare global {
	interface Window {
		arise?: () => string;
	}
}

const SESSION_KEY = 'solostack:console';

// Original ASCII moon: a waning crescent, the hero's favourite phase.
const MOON = [
	"        _.--''~~",
	"      .'  .'",
	"     /  .'      *",
	'    |  |    .',
	'    |  |           +',
	"     \\  '.",
	"      '.  '.   .",
	"        ~'--..__"
].join('\n');

export function install() {
	window.arise = () => {
		window.dispatchEvent(new CustomEvent(ARISE_EVENT));
		return m.egg_console_arise_reply();
	};

	try {
		if (sessionStorage.getItem(SESSION_KEY)) return;
		sessionStorage.setItem(SESSION_KEY, '1');
	} catch {
		// Storage blocked: print anyway, once per page load.
	}

	const butter = 'color:#fcd772';
	const cream = 'color:#fbf3dd';
	console.log(
		`%c
${MOON}
`,
		`${butter};font-family:monospace;line-height:1.1`
	);
	console.log(`%cSOLO STACK%c  ${m.egg_console_title()}`, `${butter};font-weight:900;font-size:1.4em;letter-spacing:-0.02em`, `${cream};font-size:1.1em`);
	console.log(`%c${m.egg_console_message()}`, `${cream};line-height:1.5`);
	console.log(`%c${m.egg_console_hint()}`, `${butter};font-family:monospace`);
}
