/**
 * Console egg, every page (root layout, on idle, also in production). Once per session: a gradient block-letter wordmark and
 * a Solo Leveling style System window. `window.arise()` dispatches ARISE_EVENT on the homepage (= Konami code), else declines.
 */
/* oxlint-disable no-console -- printing to the console is this egg */
import { ARISE_EVENT } from '#lib/home/eggs/events.ts';
import { m } from '#lib/paraglide/messages.js';

declare global {
	interface Window {
		arise?: () => string;
	}
}

const SESSION_KEY = 'solostack:console';

/** Block letters (6 rows each) for the wordmark; ' ' is a narrow gap. */
const GLYPHS: Record<string, string[]> = {
	S: ['███████╗', '██╔════╝', '███████╗', '╚════██║', '███████║', '╚══════╝'],
	O: [' ██████╗ ', '██╔═══██╗', '██║   ██║', '██║   ██║', '╚██████╔╝', ' ╚═════╝ '],
	L: ['██╗     ', '██║     ', '██║     ', '██║     ', '███████╗', '╚══════╝'],
	T: ['████████╗', '╚══██╔══╝', '   ██║   ', '   ██║   ', '   ██║   ', '   ╚═╝   '],
	A: [' █████╗ ', '██╔══██╗', '███████║', '██╔══██║', '██║  ██║', '╚═╝  ╚═╝'],
	C: [' ██████╗', '██╔════╝', '██║     ', '██║     ', '╚██████╗', ' ╚═════╝'],
	K: ['██╗  ██╗', '██║ ██╔╝', '█████╔╝ ', '██╔═██╗ ', '██║  ██╗', '╚═╝  ╚═╝'],
	' ': ['   ', '   ', '   ', '   ', '   ', '   ']
};

/** Top to bottom, like the painted 404 digits. */
const ROW_COLORS = ['#fbf3dd', '#fde49a', '#fcd772', '#f2c057', '#e2a93b', '#b9862a'];

const MONO = 'font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace';
const SYSTEM_BLUE = '#5cc8ff';

function wordmark(text: string) {
	return ROW_COLORS.map((_, row) => [...text].map((letter) => GLYPHS[letter]?.[row] ?? '').join(' '));
}

/** Equal widths so the background reads as one box. */
function box(lines: string[]) {
	const width = Math.max(...lines.map((line) => line.length));
	return lines.map((line) => ` ${line.padEnd(width)} `).join('\n');
}

function onHomepage() {
	return document.querySelector('[data-night-page]') !== null;
}

export function install() {
	window.arise = () => {
		if (!onHomepage()) return m.egg_system_arise_elsewhere();
		window.dispatchEvent(new CustomEvent(ARISE_EVENT));
		return m.egg_console_arise_reply();
	};

	try {
		if (sessionStorage.getItem(SESSION_KEY)) return;
		sessionStorage.setItem(SESSION_KEY, '1');
	} catch {
		// Storage blocked: print anyway, once per page load.
	}

	// One %c segment per row, each its own color
	const rows = wordmark('SOLO STACK');
	console.log(
		rows.map((row) => `%c${row}`).join('\n'),
		...ROW_COLORS.map((color) => `color:${color};${MONO};font-weight:700;line-height:1.05;text-shadow:0 0 6px rgb(252 215 114 / 0.35)`)
	);

	// System window. "Defeat a bug 0/1" → goal, progress (right-aligned column)
	const items = m
		.egg_system_quest_items()
		.split(' | ')
		.map((item) => item.match(/^(.*?)\s+(\d+\/\d+)$/)?.slice(1) ?? [item, '']);
	const goalWidth = Math.max(...items.map(([goal]) => goal.length));
	const systemWindow = box([
		'',
		`[ ! ]  ${m.egg_system_header().toUpperCase()}`,
		'',
		m.egg_system_notice(),
		'',
		`»  ${m.egg_system_quest_title()}`,
		...items.map(([goal, progress]) => `   ▸ ${goal.padEnd(goalWidth)}   ${progress ? `[${progress}]` : ''}`),
		'',
		`⚠  ${m.egg_system_warning()}`,
		''
	]);
	console.log(
		`%c${systemWindow}`,
		[
			`color:#d9f3ff;background:#08142a;${MONO};line-height:1.6`,
			`border:1px solid ${SYSTEM_BLUE};border-radius:4px;padding:2px 0`,
			`box-shadow:0 0 14px rgb(92 200 255 / 0.55), inset 0 0 18px rgb(92 200 255 / 0.18)`,
			`text-shadow:0 0 5px rgb(92 200 255 / 0.85)`
		].join(';')
	);
	console.log(`%c${m.egg_system_hint()}`, `color:${SYSTEM_BLUE};${MONO};font-weight:700;text-shadow:0 0 6px rgb(92 200 255 / 0.6)`);
}
