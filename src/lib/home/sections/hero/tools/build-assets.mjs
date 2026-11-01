/* oxlint-disable no-console -- CLI tool that reports what it wrote */
// Builds the hero's optimized layers from the painted masters in docs/art (see ../README.md):
//
// - plates (sky, sky-mobile): high quality WebP at their native generation size (1672×941, 852×1846; the 2560 and
//   1080 masters are bilinear upscales without extra detail). enhanced-img makes the responsive AVIF/WebP.
// - cutouts (clouds, moon disc, portrait frame, mascot + golden variant): cropped to their alpha bounding box,
//   downscaled to what the page needs, and their crop rect is written to ../art.ts so the layout can keep using
//   master coordinates (anchors, the moon circle, the portrait window)
// - clouds: chroma fringe clean-up (red/yellow keying leftovers on the silhouette), see `cleanFringe`
// - moon texture: 2048×1024 WebP for the Threlte sphere (loaded as a plain URL)
//
// - portrait: 640² copy of the owner photo (only when its source outside the repo exists; not part of the default run)
//
// Run: node src/lib/home/sections/hero/tools/build-assets.mjs [job ...]   (jobs: plates clouds moon frame mascot portrait)
// Preview of the cloud clean-up (before/after crops on dark and on butter): add `--preview <dir>`.
// Uses `sharp` from pnpm's virtual store (it ships with @sveltejs/enhanced-img; no new dependency).
import { createRequire } from 'node:module';
import { existsSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = fileURLToPath(new URL('../../../../../../', import.meta.url));
const sharp = createRequire(`${root}node_modules/.pnpm/node_modules/`)('sharp');
const master = (name) => `${root}docs/art/${name}`;
const out = (name) => fileURLToPath(new URL(`../assets/${name}`, import.meta.url));
const ART_TS = fileURLToPath(new URL('../art.ts', import.meta.url));
/** The owner's photo (outside the repo); `portrait` job only. */
const PORTRAIT_SOURCE = 'D:/repos/Solo Stack/branding/final-branding-assets/profil-buttergelb.png';

const args = process.argv.slice(2);
const previewIndex = args.indexOf('--preview');
const previewDir = previewIndex >= 0 ? args.splice(previewIndex, 2)[1] : null;

/** Lossy WebP intermediates: high enough that the second encode by enhanced-img adds no visible loss. */
const WEBP = { quality: 92, alphaQuality: 100, effort: 6, smartSubsample: true };

async function readRaw(file) {
	const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
	return { data, width: info.width, height: info.height };
}

/** Bounding box of pixels with alpha > `threshold`, padded and clamped to the canvas. */
function alphaBox({ data, width, height }, threshold = 2, pad = 4) {
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
	const left = Math.max(0, x0 - pad);
	const top = Math.max(0, y0 - pad);
	return { left, top, width: Math.min(width, x1 + pad + 1) - left, height: Math.min(height, y1 + pad + 1) - top };
}

const union = (a, b) => {
	const left = Math.min(a.left, b.left);
	const top = Math.min(a.top, b.top);
	return { left, top, width: Math.max(a.left + a.width, b.left + b.width) - left, height: Math.max(a.top + a.height, b.top + b.height) - top };
};

const smoothstep = (a, b, v) => {
	const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
	return t * t * (3 - 2 * t);
};

/**
 * Removes the red/yellow chroma fringe the keying left on the cloud silhouettes:
 * 1. erode alpha by 1 px (3×3 minimum), which drops the outermost, most contaminated ring;
 * 2. saturated warm pixels on the soft edge take the color of the opaque cloud right behind them (alpha weighted
 *    7×7 neighbourhood), or turn into a darker grey if there is no opaque neighbour;
 * 3. pure red specks in the faint halo (alpha < 40) are removed;
 * 4. a gentle desaturate + darken of the faintest edge, so nothing glows brighter than the cloud body.
 */
function cleanFringe({ data, width, height }) {
	const alpha = new Uint8Array(width * height);
	for (let i = 0; i < alpha.length; i++) alpha[i] = data[i * 4 + 3];
	const eroded = new Uint8Array(alpha.length);
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			let min = 255;
			for (let dy = -1; dy <= 1; dy++) {
				const yy = y + dy;
				if (yy < 0 || yy >= height) {
					min = 0;
					continue;
				}
				for (let dx = -1; dx <= 1; dx++) {
					const xx = x + dx;
					const a = xx < 0 || xx >= width ? 0 : alpha[yy * width + xx];
					if (a < min) min = a;
				}
			}
			eroded[y * width + x] = min;
		}
	}

	const result = Buffer.from(data);
	let recolored = 0;
	let removed = 0;
	const R = 3;
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const p = y * width + x;
			const i = p * 4;
			const a = eroded[p];
			result[i + 3] = a;
			if (a === 0) {
				result[i] = result[i + 1] = result[i + 2] = 0;
				continue;
			}
			if (a >= 200) continue;
			let r = data[i];
			let g = data[i + 1];
			let b = data[i + 2];
			const max = Math.max(r, g, b);
			const min = Math.min(r, g, b);
			const sat = max ? (max - min) / max : 0;

			// 3. red specks in the faint halo
			if (a < 40 && r > 130 && g < r * 0.62) {
				result[i] = result[i + 1] = result[i + 2] = result[i + 3] = 0;
				removed++;
				continue;
			}

			// 2. saturated warm fringe → color of the body behind it
			const warm = r >= g && g >= b * 0.9 && r - b > 60;
			const fringe = warm ? smoothstep(0.42, 0.7, sat) : 0;
			if (fringe > 0) {
				let wr = 0;
				let wg = 0;
				let wb = 0;
				let w = 0;
				for (let dy = -R; dy <= R; dy++) {
					const yy = y + dy;
					if (yy < 0 || yy >= height) continue;
					for (let dx = -R; dx <= R; dx++) {
						const xx = x + dx;
						if (xx < 0 || xx >= width) continue;
						const q = yy * width + xx;
						const aq = alpha[q];
						if (aq < 200) continue;
						wr += data[q * 4] * aq;
						wg += data[q * 4 + 1] * aq;
						wb += data[q * 4 + 2] * aq;
						w += aq;
					}
				}
				let tr;
				let tg;
				let tb;
				if (w > 0) {
					tr = wr / w;
					tg = wg / w;
					tb = wb / w;
				} else {
					const lum = (0.299 * r + 0.587 * g + 0.114 * b) * 0.82;
					tr = tg = tb = lum;
				}
				r += (tr - r) * fringe;
				g += (tg - g) * fringe;
				b += (tb - b) * fringe;
				recolored++;
			}

			// 4. faint edge: desaturate and darken a little
			const faint = 1 - a / 200;
			const lum = 0.299 * r + 0.587 * g + 0.114 * b;
			const desat = 0.35 * faint;
			const dark = 1 - 0.12 * faint;
			result[i] = Math.round((r + (lum - r) * desat) * dark);
			result[i + 1] = Math.round((g + (lum - g) * desat) * dark);
			result[i + 2] = Math.round((b + (lum - b) * desat) * dark);
		}
	}
	return { data: result, width, height, recolored, removed };
}

const raw = ({ data, width, height }) => sharp(data, { raw: { width, height, channels: 4 } });

async function previewCrops(name, before, after, crops) {
	for (const [k, [left, top, w, h]] of crops.entries()) {
		for (const [bg, label] of [
			['#18191B', 'dark'],
			['#FCD772', 'butter']
		]) {
			const tiles = await Promise.all(
				[before, after].map(async (image) => raw(image).extract({ left, top, width: w, height: h }).flatten({ background: bg }).png().toBuffer())
			);
			await sharp({ create: { width: w * 2 + 8, height: h, channels: 3, background: '#808080' } })
				.composite([
					{ input: tiles[0], left: 0, top: 0 },
					{ input: tiles[1], left: w + 8, top: 0 }
				])
				.png()
				.toFile(`${previewDir}/${name}-${k}-${label}.png`);
		}
	}
}

/** Crop rects in master pixels, written to ../art.ts. */
const crops = {};

async function cutout(name, file, { box, width, scale, clean, previewAt }) {
	let image = await readRaw(file);
	if (clean) {
		const cleaned = cleanFringe(image);
		console.log(`${name}: fringe clean-up recolored ${cleaned.recolored} px, removed ${cleaned.removed} red specks`);
		if (previewDir && previewAt) await previewCrops(name, image, cleaned, previewAt);
		image = cleaned;
	}
	const rect = box ?? alphaBox(image);
	const scaled = Math.min(rect.width, width ?? Math.round(rect.width * scale));
	await raw(image)
		.extract(rect)
		.resize({ width: scaled, kernel: 'lanczos3' })
		.webp(WEBP)
		.toFile(out(`${name}.webp`));
	crops[name] = { master: { width: image.width, height: image.height }, crop: rect, output: { width: scaled, height: Math.round((rect.height * scaled) / rect.width) } };
	console.log(`${name}.webp: crop ${rect.left},${rect.top} ${rect.width}×${rect.height} of ${image.width}×${image.height} → ${scaled} px wide`);
}

const jobs = {
	async portrait() {
		if (!existsSync(PORTRAIT_SOURCE)) return console.warn('portrait source not found, skipped:', PORTRAIT_SOURCE);
		await sharp(PORTRAIT_SOURCE).resize(640, 640).png({ compressionLevel: 9 }).toFile(out('hero-portrait.png'));
		console.log('hero-portrait.png');
	},
	async plates() {
		await sharp(master('hero/hero-sky.png')).resize({ width: 1672, kernel: 'lanczos3' }).webp(WEBP).toFile(out('hero-sky.webp'));
		await sharp(master('hero/hero-sky-mobile.png')).resize({ width: 852, kernel: 'lanczos3' }).webp(WEBP).toFile(out('hero-sky-mobile.webp'));
		console.log('hero-sky.webp, hero-sky-mobile.webp');
	},
	async clouds() {
		// Masters are 2560 wide, upscaled from 2048 native generations: back to 0.8 × (native detail, a third fewer pixels)
		const previews = {
			'hero-clouds-1': [
				[600, 250, 500, 300],
				[100, 400, 400, 300]
			],
			'hero-clouds-2': [
				[300, 500, 400, 250],
				[2000, 200, 400, 250]
			],
			'hero-clouds-3': [
				[180, 440, 400, 220],
				[1900, 150, 400, 300],
				[1600, 650, 400, 300]
			]
		};
		for (const name of ['hero-clouds-1', 'hero-clouds-2', 'hero-clouds-3']) {
			const { width } = await sharp(master(`hero/${name}.png`)).metadata();
			await cutout(name, master(`hero/${name}.png`), { scale: 2048 / width, clean: true, previewAt: previews[name] });
		}
	},
	async moon() {
		// Disc: crop to the glow, keep master resolution (the native generation was 1254 px; the LCP image is
		// rendered up to ~1450 CSS px wide, so the 2× candidates need every pixel there is).
		await cutout('hero-moon-disc', master('hero/hero-moon-disc.png'), { width: 2048 });
		await sharp(master('hero/hero-moon-texture.png')).resize(2048, 1024, { kernel: 'lanczos3' }).webp({ quality: 88, effort: 6 }).toFile(out('hero-moon-texture.webp'));
		console.log('hero-moon-texture.webp: 2048×1024');
	},
	async frame() {
		// Rendered ≤ 11rem wide: 400 px covers 2×.
		const file = master('hero/hero-portrait-frame.png');
		await cutout('hero-portrait-frame', file, { width: 400 });
		crops['hero-portrait-frame'].window = portraitWindow(await readRaw(file));
	},
	async mascot() {
		// One crop for both variants so the golden swap stays registered. Rendered ≤ ~15rem wide: 640 px covers 2×+.
		const normal = await readRaw(master('mascot/mascot-hero-moonrim.png'));
		const golden = await readRaw(master('mascot/mascot-golden.png'));
		const box = union(alphaBox(normal, 8, 6), alphaBox(golden, 8, 6));
		await cutout('mascot-hero-moonrim', master('mascot/mascot-hero-moonrim.png'), { box, width: 640 });
		await cutout('mascot-golden', master('mascot/mascot-golden.png'), { box, width: 640 });
	}
};

/** The transparent window of the torn frame: scan out from the center until the paper starts (alpha > 128). */
function portraitWindow({ data, width, height }) {
	const cx = Math.round(width / 2);
	const cy = Math.round(height / 2);
	const opaque = (x, y) => data[(y * width + x) * 4 + 3] > 128;
	const scan = (x, y, dx, dy) => {
		while (x > 0 && y > 0 && x < width - 1 && y < height - 1 && !opaque(x, y)) {
			x += dx;
			y += dy;
		}
		return dx ? x : y;
	};
	// a few scan lines per side; the innermost paper edge wins so the photo always tucks under the paper
	const offsets = [-0.25, -0.1, 0, 0.1, 0.25];
	const left = Math.max(...offsets.map((o) => scan(cx, Math.round(cy + o * height), -1, 0)));
	const right = Math.min(...offsets.map((o) => scan(cx, Math.round(cy + o * height), 1, 0)));
	const top = Math.max(...offsets.map((o) => scan(Math.round(cx + o * width), cy, 0, -1)));
	const bottom = Math.min(...offsets.map((o) => scan(Math.round(cx + o * width), cy, 0, 1)));
	return { left, top, right, bottom };
}

const selected = args.length ? args : Object.keys(jobs).filter((job) => job !== 'portrait');
for (const name of selected) await jobs[name]();

// art.ts holds every crop, so a partial run must not drop the others: merge with the existing file (Node imports
// .ts directly by stripping the types), then write it and format it like the rest of the repo.
let previous = {};
if (existsSync(ART_TS)) previous = (await import(`${pathToFileURL(ART_TS).href}?t=${Date.now()}`)).ART_CROPS;
writeFileSync(
	ART_TS,
	`// GENERATED by tools/build-assets.mjs. Do not edit by hand: rerun the tool after changing a master in docs/art.
` +
		`// Crop rects of the hero cutouts in master pixels (the layout keeps working in master coordinates).

` +
		`export interface ArtCrop {
	master: { width: number; height: number };
	crop: { left: number; top: number; width: number; height: number };
` +
		`	output: { width: number; height: number };
	window?: { left: number; top: number; right: number; bottom: number };
}

` +
		`export const ART_CROPS: Record<string, ArtCrop> = ${JSON.stringify({ ...previous, ...crops }, null, '	')};
`
);
spawnSync(`pnpm exec oxfmt "${ART_TS}"`, { cwd: root, shell: true, stdio: 'inherit' });
console.log('wrote art.ts');
