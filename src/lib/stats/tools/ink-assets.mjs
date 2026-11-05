#!/usr/bin/env node
/* oxlint-disable no-console -- CLI tool that reports what it wrote */
// Runtime derivatives of the round-3 painted ink (docs/art/site/round-3/, see its README) for the stats page.
//
//   node src/lib/stats/tools/ink-assets.mjs
//
// stats-hill-feather.webp (GrowthHill): ink-feather.png as a pure alpha mask (white pigment, the master's own alpha), 1440 wide.
//   The SVG mask reads it by luminance, so white RGB keeps alpha = mask and compresses to almost nothing.
// stats-kpi-ground.webp (YoutubeSection): ink-ground-a.png (the calm strip meant for data). Its empty margins go, and only the
//   fully opaque interior (rows 128–208 of 360, solid pigment) is stretched to hold two lines of text, so both painted edges
//   keep their proportions; 1600 wide.
import { createRequire } from 'node:module';
import { statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = new URL('../../../../', import.meta.url);
const sharp = createRequire(new URL('node_modules/.pnpm/node_modules/', root))('sharp');
const path = (url) => fileURLToPath(url);

const SRC = new URL('docs/art/site/round-3/', root);
const OUT = new URL('src/lib/stats/assets/', root);

/** Feather: white pigment, master alpha. */
async function feather() {
	const out = new URL('stats-hill-feather.webp', OUT);
	const alpha = await sharp(path(new URL('ink-feather.png', SRC)))
		.resize({ width: 1440 })
		.extractChannel(3)
		.toBuffer();
	const { width, height } = await sharp(alpha).metadata();
	await sharp({ create: { width, height, channels: 3, background: '#ffffff' } })
		.joinChannel(alpha)
		.webp({ quality: 80, alphaQuality: 85, effort: 6 })
		.toFile(path(out));
	return out;
}

/** KPI ground: top edge, a stretched solid interior, bottom edge. */
async function ground() {
	const out = new URL('stats-kpi-ground.webp', OUT);
	const master = path(new URL('ink-ground-a.png', SRC));
	const { width } = await sharp(master).metadata();
	const TOP = [36, 128];
	const MID = [128, 208];
	const BOTTOM = [208, 336];
	const STRETCH = 260;
	const band = ([from, to]) =>
		sharp(master)
			.extract({ left: 0, top: from, width, height: to - from })
			.png()
			.toBuffer();
	const middle = await sharp(await band(MID))
		.resize({ width, height: STRETCH, fit: 'fill', kernel: 'cubic' })
		.png()
		.toBuffer();
	const height = TOP[1] - TOP[0] + STRETCH + BOTTOM[1] - BOTTOM[0];
	const stacked = await sharp({ create: { width, height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
		.composite([
			{ input: await band(TOP), top: 0, left: 0 },
			{ input: middle, top: TOP[1] - TOP[0], left: 0 },
			{ input: await band(BOTTOM), top: TOP[1] - TOP[0] + STRETCH, left: 0 }
		])
		.png()
		.toBuffer();
	await sharp(stacked).resize({ width: 1600 }).webp({ quality: 72, alphaQuality: 85, effort: 6 }).toFile(path(out));
	return out;
}

for (const out of await Promise.all([feather(), ground()])) {
	const { width, height } = await sharp(path(out)).metadata();
	console.log(`${path(out)}  ${width}×${height}  ${(statSync(out).size / 1024).toFixed(1)} KB`);
}
