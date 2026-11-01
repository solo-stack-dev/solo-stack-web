#!/usr/bin/env node
/* oxlint-disable no-console -- CLI tool that reports what it wrote */
// Optimizes the shared painted materials (docs/art/shared/, masters) into runtime assets under
// src/lib/home/shared/assets/. Re-run after the masters change:
//
//   node src/lib/home/shared/tools/optimize-materials.mjs
//
// - paper-grain.png: the neutral grayscale tile turned into a two-tone alpha tile (cream where the paper is lighter
//   than its mean, ink where it is darker), so it reads as grain with plain `normal` blending (no blend-mode cost).
// - edge-{1,2,3}.webp / edge-{1,2,3}-up.webp: alpha masks (opaque above / transparent below) and their vertical flips
//   (transparent above / opaque below), downscaled to 1280×200 (they are stretched to the strip width anyway).
// - star-{1..4}.webp: 48 px sprites for the bright stars of StarField.
// - shooting-star.webp: 480×48 streak sprite for ShootingStars (head on the right).
//
// Uses `sharp` from pnpm's virtual store (it ships with @sveltejs/enhanced-img; no new dependency).
import { mkdirSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const root = new URL('../../../../../', import.meta.url);
const sharp = createRequire(new URL('node_modules/.pnpm/node_modules/', root))('sharp');
const source = (name) => fileURLToPath(new URL(`docs/art/shared/${name}`, root));
const target = (name) => fileURLToPath(new URL(`src/lib/home/shared/assets/${name}`, root));
mkdirSync(fileURLToPath(new URL('src/lib/home/shared/assets/', root)), { recursive: true });

const report = (name) => console.log(`${name.padEnd(22)} ${(statSync(target(name)).size / 1024).toFixed(1)} kB`);

// Paper grain: L (mean ~128) → RGBA, cream for positive deviation, ink for negative, alpha ∝ |deviation|.
{
	const { data, info } = await sharp(source('paper-grain.png')).greyscale().raw().toBuffer({ resolveWithObject: true });
	let sum = 0;
	for (const value of data) sum += value;
	const mean = sum / data.length;
	let deviation = 0;
	for (const value of data) deviation += (value - mean) ** 2;
	const sigma = Math.sqrt(deviation / data.length) || 1;
	const out = Buffer.alloc(info.width * info.height * 4);
	for (let index = 0; index < data.length; index++) {
		const z = (data[index] - mean) / sigma;
		const light = z > 0;
		out[index * 4] = light ? 251 : 14;
		out[index * 4 + 1] = light ? 243 : 15;
		out[index * 4 + 2] = light ? 221 : 16;
		// ±2.5σ → full alpha; the component's `opacity` scales it down
		out[index * 4 + 3] = Math.round(Math.min(1, Math.abs(z) / 2.5) * 255);
	}
	await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
		// Two colors × alpha levels: a 32-entry palette PNG is ~20 kB, lossy WebP of noise is > 45 kB.
		.png({ palette: true, colors: 32, effort: 10, compressionLevel: 9 })
		.toFile(target('paper-grain.png'));
	report('paper-grain.png');
}

for (const edge of [1, 2, 3]) {
	const base = sharp(source(`edge-${edge}.png`)).resize(1280, 200, { fit: 'fill', kernel: 'lanczos3' });
	await base
		.clone()
		.webp({ quality: 80, alphaQuality: 70, effort: 6 })
		.toFile(target(`edge-${edge}.webp`));
	await base
		.clone()
		.flip()
		.webp({ quality: 80, alphaQuality: 70, effort: 6 })
		.toFile(target(`edge-${edge}-up.webp`));
	report(`edge-${edge}.webp`);
	report(`edge-${edge}-up.webp`);
}

for (const star of [1, 2, 3, 4]) {
	await sharp(source(`star-${star}.png`))
		.resize(48, 48, { kernel: 'lanczos3' })
		.webp({ quality: 85, alphaQuality: 90, effort: 6 })
		.toFile(target(`star-${star}.webp`));
	report(`star-${star}.webp`);
}

await sharp(source('shooting-star.png'))
	.resize(480, 48, { fit: 'fill', kernel: 'lanczos3' })
	.webp({ quality: 82, alphaQuality: 90, effort: 6 })
	.toFile(target('shooting-star.webp'));
report('shooting-star.webp');
