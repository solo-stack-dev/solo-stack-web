#!/usr/bin/env node
/* oxlint-disable no-console -- CLI tool that reports what it wrote */
// Round-3 production art (docs/art/site/round-3/) → the owning assets/ folders, as WebP sources for enhanced-img:
//
//   node src/lib/home/shared/tools/optimize-round-3.mjs
//
// - Dawn cloud bank (2560×900 RGBA, one non-repeating panorama; opaque across the full width in rows 520…690):
//   shared/assets/transitions/dawn-bank.webp, full canvas at 1920 wide (native detail is ~2115 px).
// - Portrait dawn cloud bank (1080×1300 RGBA, opaque across the full width in rows 580…790):
//   shared/assets/transitions/dawn-bank-mobile.webp, full canvas.
//
// Full canvases (no trim), so the opaque rows above stay valid for the placement in shared/dawn.ts. Uses `sharp` from
// pnpm's virtual store (no new dependency).
import { mkdirSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = new URL('../../../../../', import.meta.url);
const sharp = createRequire(new URL('node_modules/.pnpm/node_modules/', root))('sharp');
const master = (name) => fileURLToPath(new URL(`docs/art/site/round-3/${name}`, root));
const target = (path) => {
	const file = fileURLToPath(new URL(`src/lib/home/${path}`, root));
	mkdirSync(dirname(file), { recursive: true });
	return file;
};
const report = (path) => console.log(`${path.padEnd(52)} ${(statSync(target(path)).size / 1024).toFixed(1)} kB`);

const CLOUD = { quality: 88, alphaQuality: 90, effort: 6, smartSubsample: true };

{
	const path = 'shared/assets/transitions/dawn-bank.webp';
	await sharp(master('dawn-cloud-bank.png')).resize(1920, 675, { kernel: 'lanczos3' }).webp(CLOUD).toFile(target(path));
	report(path);
}

{
	const path = 'shared/assets/transitions/dawn-bank-mobile.webp';
	await sharp(master('dawn-cloud-bank-mobile.png')).webp(CLOUD).toFile(target(path));
	report(path);
}
