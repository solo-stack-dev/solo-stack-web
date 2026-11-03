#!/usr/bin/env node
/* oxlint-disable no-console -- CLI tool that reports what it wrote */
// Optimizes the painted section transition masters (docs/art/transitions/) into runtime assets under
// src/lib/home/shared/assets/transitions/. Re-run after the masters change:
//
//   node src/lib/home/shared/tools/optimize-transitions.mjs
//
// - feather-{down,up}.webp: the soft low-frequency plate edge (alpha; `down` opaque above / transparent below,
//   `up` its vertical flip), 1280×256, stretched to the plate edge by CSS.
// - wash-spread-up.webp / wash-spread-down.webp: the wet spreading wash ramp, flipped so the plate is opaque below the
//   front (hero → making wipe), and as painted (opaque above; adds blooms to the retreating sunrise night), 768×768.
// - wash-dry.webp: the drying, retreating wash ramp (sunrise night), opaque above the front, 768×768.
// - mist-{dusk,night,predawn}.webp: painted mist strips with alpha, 1920×540 masters for enhanced-img (Mist.svelte).
//
// Mask files are white + alpha: only their alpha matters (CSS `mask-mode: alpha`), so RGB is flattened to white,
// which compresses far better. Uses `sharp` from pnpm's virtual store (no new dependency).
import { existsSync, mkdirSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const root = new URL('../../../../../', import.meta.url);
const sharp = createRequire(new URL('node_modules/.pnpm/node_modules/', root))('sharp');
const source = (name) => fileURLToPath(new URL(`docs/art/transitions/${name}`, root));
const target = (name) => fileURLToPath(new URL(`src/lib/home/shared/assets/transitions/${name}`, root));
mkdirSync(fileURLToPath(new URL('src/lib/home/shared/assets/transitions/', root)), { recursive: true });

const report = (name) => console.log(`${name.padEnd(24)} ${(statSync(target(name)).size / 1024).toFixed(1)} kB`);

function master(name) {
	const path = source(name);
	if (!existsSync(path)) throw new Error(`missing master docs/art/transitions/${name}`);
	return path;
}

/** White RGB + the master's alpha, resized; returns a sharp pipeline. */
async function alphaMask(name, width, height) {
	const alpha = await sharp(master(name)).resize(width, height, { fit: 'fill', kernel: 'lanczos3' }).ensureAlpha().extractChannel(3).raw().toBuffer();
	const out = Buffer.alloc(width * height * 4, 255);
	for (let index = 0; index < width * height; index++) out[index * 4 + 3] = alpha[index];
	return sharp(out, { raw: { width, height, channels: 4 } });
}

const MASK_WEBP = { quality: 50, alphaQuality: 55, effort: 6 };

{
	const feather = await alphaMask('feather-soft.png', 1280, 256);
	await feather.clone().webp(MASK_WEBP).toFile(target('feather-down.webp'));
	await feather.clone().flip().webp(MASK_WEBP).toFile(target('feather-up.webp'));
	report('feather-down.webp');
	report('feather-up.webp');
}

{
	const spread = await alphaMask('wash-spread.png', 768, 768);
	await spread.clone().flip().webp(MASK_WEBP).toFile(target('wash-spread-up.webp'));
	await spread.clone().webp(MASK_WEBP).toFile(target('wash-spread-down.webp'));
	report('wash-spread-up.webp');
	report('wash-spread-down.webp');
}

{
	const dry = await alphaMask('wash-dry.png', 768, 768);
	await dry.webp(MASK_WEBP).toFile(target('wash-dry.webp'));
	report('wash-dry.webp');
}

for (const mist of ['dusk', 'night', 'predawn']) {
	await sharp(master(`mist-${mist}.png`))
		.resize(1920, 540, { fit: 'fill', kernel: 'lanczos3' })
		.webp({ quality: 74, alphaQuality: 70, effort: 6 })
		.toFile(target(`mist-${mist}.webp`));
	report(`mist-${mist}.webp`);
}
