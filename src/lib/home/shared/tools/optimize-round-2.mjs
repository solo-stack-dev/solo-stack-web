#!/usr/bin/env node
/* oxlint-disable no-console -- CLI tool that reports what it wrote */
// Round-2 production art (docs/art/site/round-2/) → the owning assets/ folders, as WebP sources for enhanced-img:
//
//   node src/lib/home/shared/tools/optimize-round-2.mjs
//
// - Game posters (1664×936 RGB): sections/game/assets/poster-{moon-planet,stack-to-moon,constellations}.webp, full 16:9
//   (the lower-left third is the reserved calm area for the title and play button; never center-crop).
// - Cinema projection (1664×936 RGB): sections/cinema/assets/cinema-projection.webp.
// - Seam clouds (2560×600 RGBA, cloud body in rows ~70…530): shared/assets/transitions/seam-cloud-{a,b,c}.webp, trimmed to
//   2560×480 (rows 60…540) so the strip box hugs the painting, 1920 wide.
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

for (const name of ['moon-planet', 'stack-to-moon', 'constellations']) {
	const path = `sections/game/assets/poster-${name}.webp`;
	await sharp(master(`poster-${name}.png`))
		.webp(PLATE)
		.toFile(target(path));
	report(path);
}

{
	const path = 'sections/cinema/assets/cinema-projection.webp';
	await sharp(master('cinema-projection.png')).webp(PLATE).toFile(target(path));
	report(path);
}

for (const name of ['a', 'b', 'c']) {
	const path = `shared/assets/transitions/seam-cloud-${name}.webp`;
	await sharp(master(`seam-cloud-${name}.png`))
		.extract({ left: 0, top: 60, width: 2560, height: 480 })
		.resize(1920, 360, { kernel: 'lanczos3' })
		.webp({ quality: 80, alphaQuality: 85, effort: 6 })
		.toFile(target(path));
	report(path);
}
