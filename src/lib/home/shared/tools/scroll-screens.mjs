#!/usr/bin/env node
/* oxlint-disable no-console -- CLI tool that reports what it wrote */
// Full-page scroll sequence of the homepage in headless Chrome (integration QA, docs/HOMEPAGE-DEV.md §9).
//
//   node src/lib/home/shared/tools/scroll-screens.mjs <url> <outDir> [--width 1440 --height 900] [--reduced] [--step 0.5] [--prefix name] [--sheet] [--seams] [--only-seams]
//
// Launches Chrome on a random free debugging port, scrolls the page in `step` viewport increments, saves one WebP per
// step, and reports console errors and uncaught exceptions (exit code 1 if there were any). `--sheet` additionally
// writes a downscaled contact sheet (`<prefix>-sheet.webp`) for quick review. `--seams` also captures every section
// boundary centered in the viewport (`<prefix>-seam-<id>.webp`, the section starting there); `--only-seams` skips the scroll sequence. Uses Node's built-in WebSocket and
// `sharp` from pnpm's virtual store (ships with @sveltejs/enhanced-img); no new dependency.
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';

const root = new URL('../../../../../', import.meta.url);
const sharp = createRequire(new URL('node_modules/.pnpm/node_modules/', root))('sharp');

const args = process.argv.slice(2);
const flag = (name, fallback) => {
	const index = args.indexOf(`--${name}`);
	return index === -1 ? fallback : args[index + 1];
};
const url = args[0];
const outDir = resolve(args[1] ?? 'docs/screens/integration');
if (!url || url.startsWith('--')) {
	console.error('usage: scroll-screens.mjs <url> <outDir> [--width 1440] [--height 900] [--reduced] [--step 0.5] [--prefix name] [--sheet]');
	process.exit(2);
}
const width = Number(flag('width', 1440));
const height = Number(flag('height', 900));
const reduced = args.includes('--reduced');
const step = Number(flag('step', 0.5));
const settle = Number(flag('settle', 700));
const prefix = flag('prefix', `${width}${reduced ? '-reduced' : ''}`);
const mobile = width < 768;

const CHROME_CANDIDATES = [
	process.env.CHROME_PATH,
	'C:/Program Files/Google/Chrome/Application/chrome.exe',
	'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
	'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
	'/usr/bin/google-chrome',
	'/usr/bin/chromium'
].filter(Boolean);
const chromePath = CHROME_CANDIDATES.find((candidate) => existsSync(candidate));
if (!chromePath) throw new Error('Chrome not found; set CHROME_PATH');

const freePort = () =>
	new Promise((done, fail) => {
		const server = createServer();
		server.unref();
		server.on('error', fail);
		server.listen(0, '127.0.0.1', () => {
			const { port } = server.address();
			server.close(() => done(port));
		});
	});

let port = await freePort();
while (port === 9333) port = await freePort();
const profile = mkdtempSync(join(tmpdir(), 'scroll-screens-'));
const chrome = spawn(chromePath, [
	'--headless=new',
	`--remote-debugging-port=${port}`,
	`--user-data-dir=${profile}`,
	'--no-first-run',
	'--no-default-browser-check',
	'--hide-scrollbars',
	'--mute-audio',
	'about:blank'
]);

async function json(path, method = 'GET') {
	for (let attempt = 0; attempt < 50; attempt++) {
		try {
			const response = await fetch(`http://127.0.0.1:${port}${path}`, { method });
			if (response.ok) return await response.json();
		} catch {
			// not up yet
		}
		await sleep(200);
	}
	throw new Error(`Chrome did not answer on port ${port}`);
}

const target = await json(`/json/new?about:blank`, 'PUT');
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((done) => socket.addEventListener('open', done, { once: true }));

let nextId = 1;
const pending = new Map();
const errors = [];
socket.addEventListener('message', (message) => {
	const data = JSON.parse(message.data);
	if (data.id && pending.has(data.id)) {
		const { done, fail } = pending.get(data.id);
		pending.delete(data.id);
		if (data.error) fail(new Error(data.error.message));
		else done(data.result);
	} else if (data.method === 'Runtime.exceptionThrown') {
		errors.push(`exception: ${data.params.exceptionDetails.exception?.description ?? data.params.exceptionDetails.text}`);
	} else if (data.method === 'Runtime.consoleAPICalled' && (data.params.type === 'error' || data.params.type === 'warning')) {
		errors.push(`console.${data.params.type}: ${data.params.args.map((arg) => arg.value ?? arg.description).join(' ')}`);
	} else if (data.method === 'Log.entryAdded' && data.params.entry.level === 'error') {
		errors.push(`log: ${data.params.entry.text} ${data.params.entry.url ?? ''}`);
	}
});
const send = (method, params = {}) =>
	new Promise((done, fail) => {
		const id = nextId++;
		pending.set(id, { done, fail });
		socket.send(JSON.stringify({ id, method, params }));
	});
const evaluate = async (expression) => (await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })).result.value;

try {
	await send('Runtime.enable');
	await send('Log.enable');
	await send('Page.enable');
	await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile });
	if (mobile) await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
	await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: reduced ? 'reduce' : 'no-preference' }] });
	await send('Page.navigate', { url });
	await evaluate(`new Promise((done) => document.readyState === 'complete' ? done() : addEventListener('load', done, { once: true }))`);
	await sleep(2500);

	// --eval <js>: print the result of an expression after load (debugging), then continue
	if (flag('eval')) console.log(JSON.stringify(await evaluate(flag('eval')), null, 1));

	mkdirSync(outDir, { recursive: true });
	const files = [];
	let index = 0;
	for (; !args.includes('--only-seams');) {
		const viewport = await evaluate('innerHeight');
		const max = await evaluate('document.documentElement.scrollHeight - innerHeight');
		const y = Math.min(max, Math.round(index * step * viewport));
		await evaluate(`scrollTo({ top: ${y}, behavior: 'instant' })`);
		await sleep(settle);
		const { data } = await send('Page.captureScreenshot', { format: 'webp', quality: 72 });
		const file = join(outDir, `${prefix}-${String(index).padStart(2, '0')}.webp`);
		writeFileSync(file, Buffer.from(data, 'base64'));
		files.push(file);
		if (y >= max) break;
		index++;
	}
	console.log(`${files.length} screenshots → ${outDir} (${prefix}-NN.webp)`);

	if (args.includes('--seams') || args.includes('--only-seams')) {
		const tops = await evaluate(`[...document.querySelectorAll('[data-night-hour]')].slice(1).map((el) => [el.id, el.getBoundingClientRect().top + scrollY])`);
		for (const [id, top] of tops) {
			// walk down to the boundary so lazy parts above it have mounted, then center it
			await evaluate(`scrollTo({ top: ${Math.max(0, top - height)}, behavior: 'instant' })`);
			await sleep(400);
			await evaluate(`scrollTo({ top: ${Math.max(0, top - height / 2)}, behavior: 'instant' })`);
			await sleep(settle + 300);
			const { data } = await send('Page.captureScreenshot', { format: 'webp', quality: 72 });
			writeFileSync(join(outDir, `${prefix}-seam-${id}.webp`), Buffer.from(data, 'base64'));
		}
		console.log(`${tops.length} seams → ${outDir} (${prefix}-seam-<id>.webp)`);
	}

	if (args.includes('--sheet') && files.length) {
		const columns = 6;
		const thumbWidth = mobile ? 195 : 360;
		const thumbHeight = Math.round((thumbWidth / width) * height);
		const rows = Math.ceil(files.length / columns);
		const tiles = await Promise.all(
			files.map(async (file, tileIndex) => ({
				input: await sharp(file).resize(thumbWidth, thumbHeight).toBuffer(),
				left: (tileIndex % columns) * (thumbWidth + 4),
				top: Math.floor(tileIndex / columns) * (thumbHeight + 4)
			}))
		);
		await sharp({ create: { width: columns * (thumbWidth + 4), height: rows * (thumbHeight + 4), channels: 3, background: '#ff00ff' } })
			.composite(tiles)
			.webp({ quality: 80 })
			.toFile(join(outDir, `${prefix}-sheet.webp`));
	}
} finally {
	socket.close();
	chrome.kill();
	await sleep(300);
	try {
		rmSync(profile, { recursive: true, force: true });
	} catch {
		// Chrome may still hold the profile on Windows
	}
}

if (errors.length) {
	console.log(`${errors.length} console errors/warnings:`);
	for (const error of errors) console.log(`  ${error}`);
	process.exitCode = 1;
} else {
	console.log('no console errors');
}
