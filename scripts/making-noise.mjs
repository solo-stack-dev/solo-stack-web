#!/usr/bin/env node
/* oxlint-disable no-console -- CLI tool that reports what it wrote */
/**
 * 21:00 "What I make": bakes the two deterministic noise tiles that Making.svelte used to generate on the client at mount
 * (docs/perf/AUDIT-2026-11.md #9): the ink grain (128 px stroke pattern) and the pigment blot (320 px bloom mask).
 *
 * The generators below are the component's original code, run in headless Chrome through the same canvas path
 * (putImageData → toDataURL), so the files hold exactly the pixels the browser produced at runtime, checked after encoding. The grain
 * stays PNG (recompressed): it has semi-transparent pixels, and Chrome's WebP decoder premultiplies them with different rounding
 * than its PNG decoder (a 1–5 level shift on the line). The blot (alpha 0 or 255 only) is lossless WebP with `exact`.
 *
 * Usage: `node scripts/making-noise.mjs` (Chrome and `sharp` from pnpm's store; no new dependency).
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as sleep } from 'node:timers/promises';

const root = new URL('../', import.meta.url);
const sharp = createRequire(new URL('node_modules/.pnpm/node_modules/', root))('sharp');
const OUT = fileURLToPath(new URL('src/lib/home/sections/making/assets/', root));

/** Runs in the page; returns both tiles as PNG data URLs. */
function generate() {
	// oxlint-disable-next-line unicorn/consistent-function-scoping -- runs in the page: everything it uses lives inside it
	const smooth = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
	/** Smooth value noise: bilinear (smoothstep-eased) lookup in a (cells + 1)² lattice of random values, x and y in 0…1. */
	function sample(grid, cells, x, y) {
		const gx = x * cells;
		const gy = y * cells;
		const ix = Math.min(cells - 1, Math.floor(gx));
		const iy = Math.min(cells - 1, Math.floor(gy));
		const fx = smooth(gx - ix);
		const fy = smooth(gy - iy);
		const at = (cx, cy) => grid[cy * (cells + 1) + cx];
		const top = at(ix, iy) + (at(ix + 1, iy) - at(ix, iy)) * fx;
		const bottom = at(ix, iy + 1) + (at(ix + 1, iy + 1) - at(ix, iy + 1)) * fx;
		return top + (bottom - top) * fy;
	}

	// Ink grain: mostly clear, some soft dry-brush gaps, a few dark flecks.
	const grainCanvas = document.createElement('canvas');
	grainCanvas.width = grainCanvas.height = 128;
	{
		const size = 128;
		const context = grainCanvas.getContext('2d');
		const image = context.createImageData(size, size);
		let seed = 21;
		const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
		for (let i = 0; i < size * size; i++) {
			const speck = random();
			const alpha = speck > 0.93 ? 200 : speck > 0.7 ? 70 * random() : 0;
			image.data.set([24, 25, 27, alpha], i * 4);
		}
		context.putImageData(image, 0, 0);
	}

	// Pigment blot: a solid core with a wobbly edge that breaks into hard pigment granules (no blur anywhere).
	const blotCanvas = document.createElement('canvas');
	blotCanvas.width = blotCanvas.height = 320;
	{
		const size = 320;
		const context = blotCanvas.getContext('2d');
		let seed = 2100;
		const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
		// two octaves of smooth value noise for the edge wobble
		const lattice = (cells) => Array.from({ length: (cells + 1) * (cells + 1) }, random);
		const fine = lattice(18);
		const coarse = lattice(6);
		const image = context.createImageData(size, size);
		for (let y = 0; y < size; y++) {
			for (let x = 0; x < size; x++) {
				const u = x / (size - 1);
				const v = y / (size - 1);
				const edge = Math.hypot(u * 2 - 1, v * 2 - 1) + 0.2 * (sample(coarse, 6, u, v) - 0.5) + 0.09 * (sample(fine, 18, u, v) - 0.5);
				// solid core; a band of granules thinning out; a few loose specks beyond
				const granule = random();
				const solid = edge < 0.72 || (edge < 0.9 && granule < ((0.9 - edge) / 0.18) ** 0.8) || (edge < 0.98 && granule > 0.985);
				image.data.set([255, 255, 255, solid ? 255 : 0], (y * size + x) * 4);
			}
		}
		context.putImageData(image, 0, 0);
	}
	return JSON.stringify({ 'making-grain': grainCanvas.toDataURL(), 'making-blot': blotCanvas.toDataURL() });
}

const chromePath = [
	process.env.CHROME_PATH,
	'C:/Program Files/Google/Chrome/Application/chrome.exe',
	'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
	'/usr/bin/google-chrome',
	'/usr/bin/chromium'
].find((candidate) => candidate && existsSync(candidate));
if (!chromePath) throw new Error('Chrome not found; set CHROME_PATH');
const port = await new Promise((done) => {
	const server = createServer().listen(0, '127.0.0.1', () => {
		const { port: free } = server.address();
		server.close(() => done(free));
	});
});
const profile = mkdtempSync(join(tmpdir(), 'making-noise-'));
const chrome = spawn(chromePath, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, '--no-first-run', 'about:blank']);
try {
	let target;
	for (let attempt = 0; attempt < 50 && !target; attempt++) {
		try {
			target = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find((entry) => entry.type === 'page');
		} catch {
			// not up yet
		}
		if (!target) await sleep(200);
	}
	const socket = new WebSocket(target.webSocketDebuggerUrl);
	await new Promise((done) => socket.addEventListener('open', done, { once: true }));
	const result = await new Promise((done) => {
		socket.addEventListener('message', (message) => done(JSON.parse(message.data).result.result.value));
		socket.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression: `(${generate})()`, returnByValue: true } }));
	});
	socket.close();
	for (const [name, url] of Object.entries(JSON.parse(result))) {
		const png = Buffer.from(url.split(',')[1], 'base64');
		const format = name === 'making-grain' ? 'png' : 'webp';
		const encoded = await (
			format === 'png' ? sharp(png).png({ compressionLevel: 9, effort: 10, palette: false }) : sharp(png).webp({ lossless: true, exact: true, effort: 6 })
		).toBuffer();
		const [a, b] = await Promise.all([png, encoded].map((buffer) => sharp(buffer).ensureAlpha().raw().toBuffer()));
		if (Buffer.compare(a, b) !== 0) throw new Error(`${name}: encoded pixels differ from the canvas`);
		writeFileSync(join(OUT, `${name}.${format}`), encoded);
		console.log(`${name}.${format} ${encoded.length} B (pixel-identical to the canvas)`);
	}
} finally {
	chrome.kill();
	await sleep(300);
	try {
		rmSync(profile, { recursive: true, force: true });
	} catch {
		// Chrome may still hold the profile on Windows
	}
}
