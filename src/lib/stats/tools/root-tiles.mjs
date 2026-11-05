#!/usr/bin/env node
/* oxlint-disable no-console -- CLI tool that reports what it wrote */
// Runtime derivatives of the painted root (docs/art/site/round-2/root-{top,mid,end}.png) for Roots.svelte.
//
//   node src/lib/stats/tools/root-tiles.mjs
//
// The masters share a 700px canvas with the root's centerline at x350. All three are cropped to the same 250px band around it
// (x225–475, holds every rootlet), the end loses its empty bottom rows (1975 of 1983, art ends at 1777), and the stack
// top + mid + mid + mid + end is resampled once (scale 0.32, 2× the rendered 40px), so every join and the mid's repeat are
// resampled across real neighbours and stay seamless. Cut back apart: top and end as they are, the middle mid copy as the tile.
import { createRequire } from 'node:module';
import { statSync } from 'node:fs';

const root = new URL('../../../../', import.meta.url);
const sharp = createRequire(new URL('node_modules/.pnpm/node_modules/', root))('sharp');

const SRC = new URL('docs/art/site/round-2/', root);
const OUT = new URL('src/lib/stats/assets/', root);
const BAND = { left: 225, width: 250 };
const SCALE = 0.32;
const END_ROWS = 1975;

const crop = (name, height) =>
	sharp(new URL(`${name}.png`, SRC).pathname.slice(process.platform === 'win32' ? 1 : 0))
		.extract({ left: BAND.left, top: 0, width: BAND.width, height })
		.raw()
		.toBuffer({ resolveWithObject: true });

const [top, mid, end] = await Promise.all([crop('root-top', 1750), crop('root-mid', 1750), crop('root-end', END_ROWS)]);
const parts = [top, mid, mid, mid, end];
const height = parts.reduce((sum, part) => sum + part.info.height, 0);
const stack = Buffer.concat(parts.map((part) => part.data));

const width = Math.round(BAND.width * SCALE);
const scaled = Math.round(height * SCALE);
const resized = await sharp(stack, { raw: { width: BAND.width, height, channels: 4, premultiplied: false } })
	.resize(width, scaled, { kernel: 'lanczos3', fit: 'fill' })
	.raw()
	.toBuffer();

const tile = Math.round(1750 * SCALE);
const pieces = { top: [0, tile], mid: [tile * 2, tile], end: [tile * 4, scaled - tile * 4] };
for (const [name, [from, rows]] of Object.entries(pieces)) {
	const file = new URL(`stats-root-${name}.webp`, OUT);
	const path = file.pathname.slice(process.platform === 'win32' ? 1 : 0);
	await sharp(resized.subarray(from * width * 4, (from + rows) * width * 4), { raw: { width, height: rows, channels: 4 } })
		.webp({ quality: 82, alphaQuality: 90, effort: 6, smartSubsample: true })
		.toFile(path);
	console.log(`${name}: ${width}×${rows}, ${statSync(path).size} bytes`);
}
