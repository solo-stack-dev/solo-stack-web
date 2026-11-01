/* oxlint-disable no-console -- CLI tool that reports what it wrote */
// Builds the optimized sunrise sources in ../assets/ from the painted masters in docs/art/ and writes ../art.ts
// (intrinsic sizes + crop boxes, read by ../layout.ts). `<enhanced:img>` then emits responsive AVIF/WebP from these.
//
// - Opaque plates (sky, sky-mobile) and wide layers are resized to at most MAX_WIDTH.
// - Transparent layers are cropped to their alpha bounding box (plus a small pad), so the browser decodes less;
//   art.ts records where the crop sits on the master canvas, layout.ts places everything in master coordinates.
// - Sources are high quality WebP (alpha kept); the lossy delivery encode happens in enhanced-img.
//
// Run: node src/lib/home/sections/sunrise/tools/build-assets.mjs
// Uses `sharp` from pnpm's virtual store (it ships with @sveltejs/enhanced-img; no new dependency).
import { createRequire } from 'node:module';
import { rmSync, writeFileSync } from 'node:fs';
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

/**
 * Layers: `scale` shrinks the cropped content (the masters are upsampled from smaller native renders, so a smaller
 * source loses nothing visible at the largest rendered size).
 */
const LAYERS = [
	{ key: 'sky', src: 'sunrise/sunrise-sky.png', out: 'sunrise-sky.webp', crop: false },
	{ key: 'skyMobile', src: 'sunrise/sunrise-sky-mobile.png', out: 'sunrise-sky-mobile.webp', crop: false },
	{ key: 'nightEdge', src: 'sunrise/sunrise-night-edge.png', out: 'sunrise-night-edge.webp', crop: true },
	{ key: 'valley', src: 'sunrise/sunrise-valley.png', out: 'sunrise-valley.webp', crop: true },
	{ key: 'cliffPath', src: 'sunrise/sunrise-cliff-path.png', out: 'sunrise-cliff-path.webp', crop: true },
	{ key: 'coffee', src: 'sunrise/sunrise-coffee.png', out: 'sunrise-coffee.webp', crop: true },
	// Walk frame 1 only: the four-frame loop is not clean (frames 1 and 3 share the leading leg), see ../README.md.
	{ key: 'mascot', src: 'mascot/mascot-sunrise-walk@1.png', out: 'mascot-sunrise-walk@1.webp', crop: true, scale: 0.64 }
];

/** Placeholder files this script replaces. */
const STALE = [
	'sunrise-sky.png',
	'sunrise-sky-mobile.png',
	'sunrise-night-edge.png',
	'sunrise-valley.png',
	'sunrise-cliff-path.png',
	'sunrise-coffee.png',
	'mascot-sunrise-walk@1.png',
	'mascot-sunrise-walk@2.png',
	'mascot-sunrise-walk@3.png',
	'mascot-sunrise-walk@4.png',
	'sunrise-mockup-ref.webp'
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
