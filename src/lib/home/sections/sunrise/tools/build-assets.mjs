/* oxlint-disable no-console -- CLI tool that reports what it wrote */
// Builds the optimized sunrise sources in ../assets/ from the painted masters in docs/art/ and writes ../art.ts
// (intrinsic sizes + crop boxes, read by ../layout.ts). `<enhanced:img>` then emits responsive AVIF/WebP from these.
//
// - Opaque plates (sky, sky-mobile) and wide layers are resized to at most MAX_WIDTH.
// - Transparent layers are cropped to their alpha bounding box (plus a small pad), so the browser decodes less;
//   art.ts records where the crop sits on the master canvas, layout.ts places everything in master coordinates.
// - Sources are high quality WebP (alpha kept); the lossy delivery encode happens in enhanced-img.
//
// - `portrait` job (not part of the default run; its source is the owner photo outside the repo): the footer's
//   ink print. Crop to head and shoulders, key out the butter backdrop, turn luminance into ink density (anthracite
//   with alpha = density), feather the shoulders and sides into the paper, and break the ink a little with the shared
//   paper grain. Sunrise.svelte multiplies it onto the butter paper.
//
// Run: node src/lib/home/sections/sunrise/tools/build-assets.mjs [portrait]
// Uses `sharp` from pnpm's virtual store (it ships with @sveltejs/enhanced-img; no new dependency).
import { createRequire } from 'node:module';
import { existsSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../../../../../', import.meta.url));
const sharp = createRequire(`${root}node_modules/.pnpm/node_modules/`)('sharp');
const assets = (name) => fileURLToPath(new URL(`../assets/${name}`, import.meta.url));
const master = (path) => `${root}docs/art/${path}`;

/** The paintings were generated at ~1670–2120 px and upsampled to the masters; 1920 keeps all native detail. */
const MAX_WIDTH = 1920;
/** Alpha above this counts as content for the bounding box (keeps faint specks, drops encoder noise). */
const ALPHA_THRESHOLD = 6;
const PAD = 8;
const WEBP = { quality: 92, alphaQuality: 100, effort: 6, smartSubsample: true };
/** The owner's photo (outside the repo, 1254²); `portrait` job only. */
const PORTRAIT_SOURCE = 'D:/repos/Solo Stack/branding/final-branding-assets/profil-buttergelb.png';

/**
 * Layers: `scale` shrinks the cropped content (the masters are upsampled from smaller native renders, so a smaller
 * source loses nothing visible at the largest rendered size).
 */
const LAYERS = [
	{ key: 'sky', src: 'sunrise/sunrise-sky.png', out: 'sunrise-sky.webp', crop: false },
	{ key: 'skyMobile', src: 'sunrise/sunrise-sky-mobile.png', out: 'sunrise-sky-mobile.webp', crop: false },
	{ key: 'valley', src: 'sunrise/sunrise-valley.png', out: 'sunrise-valley.webp', crop: true },
	{ key: 'cliffPath', src: 'sunrise/sunrise-cliff-path.png', out: 'sunrise-cliff-path.webp', crop: true },
	{ key: 'coffee', src: 'sunrise/sunrise-coffee.png', out: 'sunrise-coffee.webp', crop: true },
	{ key: 'laptop', src: 'sunrise/sunrise-laptop.png', out: 'sunrise-laptop.webp', crop: true }
];

/** Placeholder files this script replaces. */
const STALE = [
	'sunrise-sky.png',
	'sunrise-sky-mobile.png',
	'sunrise-night-edge.png',
	'sunrise-night-edge.webp',
	'sunrise-valley.png',
	'sunrise-cliff-path.png',
	'sunrise-coffee.png',
	'mascot-sunrise-walk@1.png',
	'mascot-sunrise-walk@1.webp',
	'mascot-sunrise-walk@2.png',
	'mascot-sunrise-walk@3.png',
	'mascot-sunrise-walk@4.png',
	'sunrise-mockup-ref.webp',
	'mascot-walk-body.webp',
	'mascot-walk-arm.webp',
	'mascot-walk-legs.webp'
];

async function alphaBox(path) {
	const { data, info } = await sharp(path).ensureAlpha().extractChannel(3).raw().toBuffer({ resolveWithObject: true });
	let x0 = info.width;
	let y0 = info.height;
	let x1 = -1;
	let y1 = -1;
	for (let y = 0; y < info.height; y++) {
		const row = y * info.width;
		for (let x = 0; x < info.width; x++) {
			if (data[row + x] <= ALPHA_THRESHOLD) continue;
			if (x < x0) x0 = x;
			if (x > x1) x1 = x;
			if (y < y0) y0 = y;
			if (y > y1) y1 = y;
		}
	}
	const left = Math.max(0, x0 - PAD);
	const top = Math.max(0, y0 - PAD);
	return { left, top, width: Math.min(info.width, x1 + 1 + PAD) - left, height: Math.min(info.height, y1 + 1 + PAD) - top };
}

const PORTRAIT = {
	/** Head and shoulders in source px. */
	crop: { left: 200, top: 40, width: 854, height: 1110 },
	/** Output width: covers the largest render (~6.5rem wide) at 3×. */
	width: 320,
	/** Backdrop key on G − B (butter ≈ 70–110, skin ≈ −10–5, hair/shirt ≈ 0): fully paper above `to`. */
	key: { from: 22, to: 48 },
	/** Luminance → ink: L ≤ black is full ink, L ≥ paper is no ink; `gamma` > 1 keeps the skin tones light, like a print. */
	tone: { black: 30, paper: 214, gamma: 1.3 },
	/** Feather into the paper (fractions of the crop): bottom ramp, side ramps. */
	feather: { bottom: 0.28, side: 0.14 },
	/** How much the paper grain tile breaks up the ink (0…1). */
	grain: 0.32,
	ink: [24, 25, 27]
};

const smoothstep = (a, b, x) => {
	const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
	return t * t * (3 - 2 * t);
};

async function portrait() {
	if (!existsSync(PORTRAIT_SOURCE)) return console.warn('portrait source not found, skipped:', PORTRAIT_SOURCE);
	const { width, height } = { width: PORTRAIT.width, height: Math.round((PORTRAIT.crop.height * PORTRAIT.width) / PORTRAIT.crop.width) };
	const data = await sharp(PORTRAIT_SOURCE).removeAlpha().extract(PORTRAIT.crop).resize(width, height, { kernel: 'lanczos3' }).raw().toBuffer();
	const grainFile = fileURLToPath(new URL('../../../shared/assets/paper-grain.png', import.meta.url));
	const grainInfo = await sharp(grainFile).metadata();
	const grain = await sharp(grainFile).ensureAlpha().extractChannel(3).raw().toBuffer();
	const out = Buffer.alloc(width * height * 4);
	const { key, tone, feather } = PORTRAIT;
	for (let y = 0; y < height; y++) {
		const fy = y / (height - 1);
		const bottom = 1 - smoothstep(1 - feather.bottom, 1, fy);
		for (let x = 0; x < width; x++) {
			const fx = x / (width - 1);
			const side = smoothstep(0, feather.side, fx) * smoothstep(0, feather.side, 1 - fx);
			const i = (y * width + x) * 3;
			const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
			const backdrop = smoothstep(key.from, key.to, g - b);
			const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
			const ink = Math.pow(1 - smoothstep(tone.black, tone.paper, lum), tone.gamma);
			const paper = grain[(y % grainInfo.height) * grainInfo.width + (x % grainInfo.width)] / 255;
			const density = ink * (1 - backdrop) * bottom * side * (1 - PORTRAIT.grain * paper);
			const o = (y * width + x) * 4;
			out.set(PORTRAIT.ink, o);
			out[o + 3] = density < 3 / 255 ? 0 : Math.round(density * 255);
		}
	}
	const info = await sharp(out, { raw: { width, height, channels: 4 } })
		.webp(WEBP)
		.toFile(assets('sunrise-portrait.webp'));
	console.log(`${'sunrise-portrait.webp'.padEnd(28)} ${info.width}×${info.height}  ${(info.size / 1024).toFixed(0).padStart(5)} kB`);
}

if (process.argv.includes('portrait')) {
	await portrait();
	process.exit(0);
}

const art = {};
for (const layer of LAYERS) {
	const path = master(layer.src);
	const meta = await sharp(path).metadata();
	const box = layer.crop ? await alphaBox(path) : { left: 0, top: 0, width: meta.width, height: meta.height };
	const width = Math.min(MAX_WIDTH, Math.round(box.width * (layer.scale ?? 1)));
	let image = sharp(path);
	if (layer.crop) image = image.extract(box);
	const info = await image.resize({ width, kernel: 'lanczos3' }).webp(WEBP).toFile(assets(layer.out));
	art[layer.key] = { canvas: { width: meta.width, height: meta.height }, crop: { x: box.left, y: box.top, width: box.width, height: box.height } };
	console.log(
		`${layer.out.padEnd(28)} ${info.width}×${info.height}  ${(info.size / 1024).toFixed(0).padStart(5)} kB  crop ${box.left},${box.top} ${box.width}×${box.height}`
	);
}

for (const name of STALE) rmSync(assets(name), { force: true });

const body = Object.entries(art)
	.map(
		([key, value]) =>
			`\t${key}: { canvas: { width: ${value.canvas.width}, height: ${value.canvas.height} }, crop: ${JSON.stringify(value.crop).replace(/"/g, '').replace(/[:,]/g, '$& ').replace(/^\{/, '{ ').replace(/\}$/, ' }')} }`
	)
	.join(',\n');
writeFileSync(
	fileURLToPath(new URL('../art.ts', import.meta.url)),
	`// Generated by tools/build-assets.mjs. Do not edit; re-run the script after replacing a master in docs/art/.
// \`canvas\`: the master's full size; \`crop\`: the box (master pixels) that ./assets/ actually contains.

export interface ArtBox {
	canvas: { width: number; height: number };
	crop: { x: number; y: number; width: number; height: number };
}

export const ART_BOXES = {
${body}
} as const satisfies Record<string, ArtBox>;
`
);
console.log('wrote art.ts');
