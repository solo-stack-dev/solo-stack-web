/* oxlint-disable no-console -- CLI tool that reports what it wrote */
// Builds the 21:00 section's optimized layers from the painted masters in docs/art/making:
//
// - plates (2560×1440 desktop, 1080×2340 portrait masters): high quality WebP at their native generation size
//   (1672×941, 852×1846; the masters are bilinear upscales without extra detail). enhanced-img makes the
//   responsive AVIF/WebP at build time. The scene keeps working in master plate pixels (morph.ts).
// - blooms (1400² masters): cropped to their alpha bounding box (offsets printed below; the crop only drops the
//   empty margin, every bloom keeps ≥ 97 % of its canvas) and downscaled to 900 px, which covers the largest
//   rendered bloom box (~430 CSS px desktop) at 2×. The crop makes the wash fill the mask box slightly fuller,
//   which the art notes ask for ("size it slightly beyond its SVG mask").
// - `--measure`: prints the painted moon circle on both plates (bright disc above the cliff), the numbers that
//   go into MOON_ANCHOR / LAYOUTS.*.moon in ../morph.ts.
//
// Run: node src/lib/home/sections/making/tools/build-assets.mjs [--measure]
// Uses `sharp` from pnpm's virtual store (it ships with @sveltejs/enhanced-img; no new dependency).
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

/**
 * The painted moon: the bright butter disc inside `window` (x0, y0, x1, y1 in plate px, above the laptop so the
 * screen glow and the lit cliff edge do not count; no stars inside). Top extreme + widest row give the circle.
 */
async function measureMoon(file, [x0, y0, x1, y1]) {
	const { data, info } = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true });
	const { width } = info;
	const bright = (x, y) => {
		const i = (y * width + x) * 3;
		return data[i] > 238 && data[i + 1] > 170 && data[i] - data[i + 2] > 50;
	};
	let best = { y: 0, left: 0, right: -1 };
	let top = -1;
	for (let y = y0; y < y1; y++) {
		let left = -1;
		let right = -1;
		for (let x = x0; x < x1; x++) {
			if (bright(x, y)) {
				if (left < 0) left = x;
				right = x;
			}
		}
		if (right - left > 12 && top < 0) top = y;
		if (left >= 0 && right - left > best.right - best.left) best = { y, left, right };
	}
	const r = (best.right - best.left) / 2;
	return { cx: Math.round((best.left + best.right) / 2), cy: Math.round(top + r), r: Math.round(r), widestRow: best.y, top };
}

if (process.argv.includes('--measure')) {
	console.log('desktop moon', await measureMoon(master('making-plate.png'), [2000, 560, 2560, 940]));
	console.log('mobile moon', await measureMoon(master('making-plate-mobile.png'), [700, 1400, 1080, 1760]));
} else {
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
}
