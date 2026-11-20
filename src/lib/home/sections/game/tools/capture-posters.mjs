#!/usr/bin/env node
/* oxlint-disable no-console -- CLI tool that reports what it wrote */
// The game posters are real frames of the three games, not painted art (owner decision, 2026-11-20: the painted posters read as
// AI art). This tool plays each game in headless Chrome through the games' dev hooks and writes clean frames of the stage: no
// frame HUD, no game text overlays, no torn mask, no paper grain (the poster adds its own).
//
//   1. pnpm dev, then:  node src/lib/home/sections/game/tools/capture-posters.mjs capture <dev url> <outDir> [--only <game id>]
//      → <outDir>/<game>-NN.png (candidates) and <outDir>/<game>-sheet.webp (numbered left to right, top to bottom, from 0)
//   2. pick one frame per game:  node …/capture-posters.mjs build <outDir>/<game>-NN.png <game id>
//      → ../assets/frame-<game id>.webp (cropped so the subject stands right of the title, see CROPS). On Windows a running dev
//      server keeps the image files it has served locked: stop it before rebuilding an existing poster.
//
// Uses Node's WebSocket and `sharp` from pnpm's virtual store (no new dependency).
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

const root = new URL('../../../../../../', import.meta.url);
const sharp = createRequire(new URL('node_modules/.pnpm/node_modules/', root))('sharp');
const ASSETS = fileURLToPath(new URL('../assets/', import.meta.url));

/** Crop of the captured 16:9 frame (fractions, 16:9 again): moves the subject right of the poster's title and drops the in-canvas HUD. */
const CROPS = {
	// the moon runs off the right edge, like the hero's
	'moon-planet': { x: 0, y: 0.32, w: 0.56, h: 0.56 },
	'stack-to-moon': { x: 0, y: 0.06, w: 0.88, h: 0.88 },
	constellations: { x: 0, y: 0, w: 1, h: 1 }
};
const POSTER_WIDTH = 2000;

const [command, ...args] = process.argv.slice(2);
const flag = (name, fallback) => {
	const index = args.indexOf(`--${name}`);
	return index === -1 ? fallback : args[index + 1];
};

if (command === 'build') {
	const [file, id] = args;
	const crop = CROPS[id];
	if (!file || !crop) {
		console.error(`usage: capture-posters.mjs build <frame.png> <${Object.keys(CROPS).join('|')}>`);
		process.exit(2);
	}
	const { width, height } = await sharp(file).metadata();
	const out = join(ASSETS, `frame-${id}.webp`);
	// encode first, then one plain write: sharp cannot open the file for writing while the dev server has it mapped (Windows)
	const poster = await sharp(file)
		.extract({ left: Math.round(crop.x * width), top: Math.round(crop.y * height), width: Math.round(crop.w * width), height: Math.round(crop.h * height) })
		.resize({ width: POSTER_WIDTH, withoutEnlargement: true })
		.webp({ quality: 90 })
		.toBuffer();
	writeFileSync(out, poster);
	console.log(`${out}`);
	process.exit(0);
}

const url = args[0];
const outDir = resolve(args[1] ?? '');
if (command !== 'capture' || !url || !args[1]) {
	console.error('usage: capture-posters.mjs capture <dev url> <outDir> [--only <game id>] | build <frame.png> <game id>');
	process.exit(2);
}
const only = flag('only', '');
// A tall window: the frame is capped by the viewport height, and the games draw at 2× at most
const VIEW = { width: 1920, height: 1200, scale: 2 };

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

const port = await freePort();
const profile = mkdtempSync(join(tmpdir(), 'capture-posters-'));
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
socket.addEventListener('message', (message) => {
	const data = JSON.parse(message.data);
	if (data.id && pending.has(data.id)) {
		const { done, fail } = pending.get(data.id);
		pending.delete(data.id);
		if (data.error) fail(new Error(data.error.message));
		else done(data.result);
	} else if (data.method === 'Runtime.exceptionThrown') {
		console.log(`exception: ${data.params.exceptionDetails.exception?.description ?? data.params.exceptionDetails.text}`);
	}
});
const send = (method, params = {}) =>
	new Promise((done, fail) => {
		const id = nextId++;
		pending.set(id, { done, fail });
		socket.send(JSON.stringify({ id, method, params }));
	});
const evaluate = async (expression) => (await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })).result.value;

const KEYS = {
	right: { key: 'ArrowRight', code: 'ArrowRight', vk: 39 },
	space: { key: ' ', code: 'Space', vk: 32 }
};
const keyDown = (name) => send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: KEYS[name].key, code: KEYS[name].code, windowsVirtualKeyCode: KEYS[name].vk });
const keyUp = (name) => send('Input.dispatchKeyEvent', { type: 'keyUp', key: KEYS[name].key, code: KEYS[name].code, windowsVirtualKeyCode: KEYS[name].vk });
async function tap(name, hold = 60) {
	await keyDown(name);
	await sleep(hold);
	await keyUp(name);
}
async function drag(x1, y1, x2, y2) {
	await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: x1, y: y1 });
	await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: x1, y: y1, button: 'left', clickCount: 1 });
	for (let i = 1; i <= 8; i++) {
		await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: x1 + ((x2 - x1) * i) / 8, y: y1 + ((y2 - y1) * i) / 8, button: 'left', buttons: 1 });
		await sleep(25);
	}
	await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: x2, y: y2, button: 'left', clickCount: 1 });
	await sleep(120);
}

/** Everything that is not the game's own drawing: the frame's HUD, the games' text overlays, the torn edge, grain, the nav. */
const CLEAN = `
#game .stage { mask: none !important; -webkit-mask: none !important; }
#game .game-frame::before { display: none !important; }
#game .hud, #game .hud-buttons, #game .touch-controls, #game .stack-game > .layer:not(canvas), #game .round, #game .modes, #game .wheel, #game .card,
#game .explore-hint, #game .ended, .paper-grain, .site-nav { display: none !important; }
#game .surface { outline: none !important; }
`;

const stageRect = () =>
	evaluate(`(() => { const r = document.querySelector('#game .stage').getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; })()`);

const frames = [];
async function capture(game) {
	const rect = await stageRect();
	const scrollY = await evaluate('scrollY');
	const { data } = await send('Page.captureScreenshot', { format: 'png', clip: { x: rect.x, y: rect.y + scrollY, width: rect.w, height: rect.h, scale: 1 } });
	const file = join(outDir, `${game}-${String(frames.length).padStart(2, '0')}.png`);
	writeFileSync(file, Buffer.from(data, 'base64'));
	frames.push(file);
}

/** Open the page, select the game's tab, center its stage, press play, then strip the chrome. */
async function open(id) {
	await send('Page.navigate', { url });
	await evaluate(`new Promise((done) => document.readyState === 'complete' ? done() : addEventListener('load', done, { once: true }))`);
	await sleep(2500);
	await evaluate(`document.querySelector('#game').scrollIntoView({ block: 'start', behavior: 'instant' })`);
	await sleep(800);
	await evaluate(`document.getElementById('game-tab-${id}').click()`);
	await sleep(600);
	await evaluate(
		`(() => { const r = document.querySelector('#game .stage').getBoundingClientRect(); scrollBy({ top: r.top - (innerHeight - r.height) / 2, behavior: 'instant' }); })()`
	);
	await sleep(600);
	await evaluate(`document.querySelector('#game .play-cta').click()`);
	await sleep(2000);
	await evaluate(`(() => { const style = document.createElement('style'); style.textContent = ${JSON.stringify(CLEAN)}; document.head.append(style); })()`);
	await sleep(500);
	frames.length = 0;
}

async function sheet(game) {
	if (!frames.length) return;
	const columns = 4;
	const width = 480;
	const meta = await sharp(frames[0]).metadata();
	const height = Math.round((width / meta.width) * meta.height);
	const tiles = await Promise.all(
		frames.map(async (file, index) => ({
			input: await sharp(file).resize(width, height).toBuffer(),
			left: (index % columns) * (width + 4),
			top: Math.floor(index / columns) * (height + 4)
		}))
	);
	await sharp({ create: { width: columns * (width + 4), height: Math.ceil(frames.length / columns) * (height + 4), channels: 3, background: '#ff00ff' } })
		.composite(tiles)
		.webp({ quality: 80 })
		.toFile(join(outDir, `${game}-sheet.webp`));
	console.log(`${game}: ${frames.length} frames`);
}

try {
	await send('Runtime.enable');
	await send('Page.enable');
	await send('Emulation.setDeviceMetricsOverride', { width: VIEW.width, height: VIEW.height, deviceScaleFactor: VIEW.scale, mobile: false });
	mkdirSync(outDir, { recursive: true });
	for (const stale of readdirSync(outDir))
		if (/^(moon-planet|stack-to-moon|constellations)-(\d+\.png|sheet\.webp)$/.test(stale) && (!only || stale.startsWith(only))) rmSync(join(outDir, stale));

	// Moon patrol: run right around the moon, jump now and then
	if (!only || only === 'moon-planet') {
		await open('moon-planet');
		await keyDown('right');
		for (let i = 0; i < 24; i++) {
			await sleep(260);
			if (i % 3 === 2) await tap('space', 140);
			await sleep(90);
			await capture('moon-planet');
		}
		await keyUp('right');
		await sheet('moon-planet');
	}

	// Stack to the moon: an auto-player on `canvas.stackDebug()` drops each block when it swings over the tower's top, with a
	// little slack on some blocks so the tower shows real offcuts. Frames from six blocks up.
	if (!only || only === 'stack-to-moon') {
		await open('stack-to-moon');
		await evaluate(`(() => {
			const canvas = document.querySelector('#game canvas');
			const tick = () => {
				const game = canvas.stackDebug();
				const active = game.active;
				if (game.state === 'play' && active && !active.falling && active.enter >= 0.5 && game.placed < 9) {
					const top = game.poses.at(-1);
					const x = top.x + Math.sin(top.lean) * 0.35;
					const slack = [0.05, 0.22, 0.08, 0.3, 0.05, 0.16, 0.26, 0.06, 0.2][game.placed % 9];
					if (Math.abs(active.x - x) < slack) canvas.dispatchEvent(new PointerEvent('pointerdown', { button: 0, bubbles: true }));
				}
				requestAnimationFrame(tick);
			};
			tick();
		})()`);
		for (let i = 0; i < 60 && frames.length < 20; i++) {
			await sleep(450);
			const state = await evaluate(`(() => { const game = document.querySelector('#game canvas').stackDebug(); return { placed: game.placed, state: game.state }; })()`);
			if (state.state !== 'play') break;
			if (state.placed >= 6) await capture('stack-to-moon');
		}
		await sheet('stack-to-moon');
	}

	// Constellations: trace the first sign edge by edge (`constellationsDebug.debugEdges()`); frames while tracing and once it lights up
	if (!only || only === 'constellations') {
		await open('constellations');
		await sleep(1500);
		const rect = await stageRect();
		const total = (await evaluate(`globalThis.constellationsDebug.debugEdges()`))?.length ?? 0;
		let previous = total + 1;
		// the stars drift: read the next undrawn edge fresh every time
		for (let guard = 0; guard < total + 8; guard++) {
			const edges = await evaluate(`globalThis.constellationsDebug.debugEdges()`);
			if (!edges?.length || edges.length > previous) break;
			previous = edges.length;
			const [x1, y1, x2, y2] = edges[0];
			await evaluate(`globalThis.constellationsDebug.debugClear()`);
			await drag(rect.x + x1, rect.y + y1, rect.x + x2, rect.y + y2);
			if (edges.length <= Math.ceil(total / 2)) await capture('constellations');
		}
		for (let i = 0; i < 6; i++) {
			await sleep(450);
			await capture('constellations');
		}
		await sheet('constellations');
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
console.log(`→ ${outDir}`);
