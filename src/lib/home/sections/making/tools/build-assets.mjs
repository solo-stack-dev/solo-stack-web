/* oxlint-disable no-console -- CLI tool that reports what it wrote */
// Builds the 21:00 layers from the masters in docs/art/making:
// - plates (2560×1440 desktop, 1080×2340 portrait masters): WebP at native generation size (1672×941, 852×1846; the masters are bilinear
//   upscales). enhanced-img makes the responsive AVIF/WebP. The scene stays in master plate px (morph.ts).
// - blooms (1400² masters): cropped to the alpha box (only empty margin, each keeps ≥ 97 % of its canvas), downscaled to 900 px = the
//   largest bloom box (~430 CSS px desktop) at 2×. The crop fills the mask box slightly fuller, as the art notes ask.
//
// Run: node src/lib/home/sections/making/tools/build-assets.mjs
// `sharp` comes from pnpm's virtual store (ships with @sveltejs/enhanced-img; no new dependency).
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../../../../../', import.meta.url));
const sharp = createRequire(`${root}node_modules/.pnpm/node_modules/`)('sharp');
const master = (name) => `${root}docs/art/making/${name}`;
const out = (name) => fileURLToPath(new URL(`../assets/${name}`, import.meta.url));

const WEBP = { quality: 92, alphaQuality: 100, effort: 6, smartSubsample: true };
const BLOOMS = ['idea', 'ai', 'code', 'phone', 'chart', 'moon'];
const BLOOM_SIZE = 900;

function alphaBox(data, width, height, threshold = 2) {
	let x0 = width;
	let y0 = height;
	let x1 = -1;
	let y1 = -1;
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			if (data[(y * width + x) * 4 + 3] > threshold) {
				if (x < x0) x0 = x;
				if (x > x1) x1 = x;
				if (y < y0) y0 = y;
				if (y > y1) y1 = y;
			}
		}
	}
	return { left: x0, top: y0, width: x1 - x0 + 1, height: y1 - y0 + 1 };
}

await sharp(master('making-plate.png')).resize({ width: 1672, kernel: 'lanczos3' }).webp(WEBP).toFile(out('making-plate.webp'));
await sharp(master('making-plate-mobile.png')).resize({ width: 852, kernel: 'lanczos3' }).webp(WEBP).toFile(out('making-plate-mobile.webp'));
console.log('making-plate.webp, making-plate-mobile.webp');
for (const id of BLOOMS) {
	const file = master(`making-bloom-${id}.png`);
	const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
	const box = alphaBox(data, info.width, info.height);
	await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
		.extract(box)
		.resize(BLOOM_SIZE, BLOOM_SIZE, { fit: 'fill', kernel: 'lanczos3' })
		.webp(WEBP)
		.toFile(out(`making-bloom-${id}.webp`));
	console.log(`making-bloom-${id}.webp: crop ${box.left},${box.top} ${box.width}×${box.height} of ${info.width}×${info.height} → ${BLOOM_SIZE}²`);
}
