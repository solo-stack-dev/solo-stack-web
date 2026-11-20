#!/usr/bin/env node
/* oxlint-disable no-console -- CLI tool that reports what it wrote */
// Round-2 production art (docs/art/site/round-2/) → the owning assets/ folders, as WebP sources for enhanced-img:
//
//   node src/lib/home/shared/tools/optimize-round-2.mjs
//
// - Cinema projection (1664×936 RGB): sections/cinema/assets/cinema-projection.webp.
//
// Uses `sharp` from pnpm's virtual store (no new dependency).
import { mkdirSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = new URL('../../../../../', import.meta.url);
const sharp = createRequire(new URL('node_modules/.pnpm/node_modules/', root))('sharp');
const master = (name) => fileURLToPath(new URL(`docs/art/site/round-2/${name}`, root));
const target = (path) => {
	const file = fileURLToPath(new URL(`src/lib/home/${path}`, root));
	mkdirSync(dirname(file), { recursive: true });
	return file;
};
const report = (path) => console.log(`${path.padEnd(52)} ${(statSync(target(path)).size / 1024).toFixed(1)} kB`);

// Plates: native 1664 px, high quality (enhanced-img derives AVIF/WebP sizes from these).
const PLATE = { quality: 90, effort: 6, smartSubsample: true };

{
	const path = 'sections/cinema/assets/cinema-projection.webp';
	await sharp(master('cinema-projection.png')).webp(PLATE).toFile(target(path));
	report(path);
}
