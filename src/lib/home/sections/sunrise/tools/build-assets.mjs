/* oxlint-disable no-console -- CLI tool that reports what it wrote */
// Builds the optimized sunrise sources in ../assets/ from the painted masters in docs/art/ and writes ../art.ts
// (intrinsic sizes + crop boxes, read by ../layout.ts). `<enhanced:img>` then emits responsive AVIF/WebP from these.
//
// - Opaque plates (sky, sky-mobile) and wide layers are resized to at most MAX_WIDTH.
// - Transparent layers are cropped to their alpha bounding box (plus a small pad), so the browser decodes less;
//   art.ts records where the crop sits on the master canvas, layout.ts places everything in master coordinates.
// - Sources are high quality WebP (alpha kept); the lossy delivery encode happens in enhanced-img.
//
// - The walk: the 16-frame cycle baked by docs/art/mascot/build-walk.mjs --frames=16. Only the legs change shape
//   between frames (the body is only translated, the near arm only rotated), so the legs ship as one atlas (row 0 the
//   far leg, row 1 the near leg, one column per frame, every cell the union box of all leg frames) and body and arm as
//   two static cutouts; Sunrise.svelte layers them like the bake did. A full-figure sheet costs ~2× the bytes.
//
// Run: node src/lib/home/sections/sunrise/tools/build-assets.mjs
// Uses `sharp` from pnpm's virtual store (it ships with @sveltejs/enhanced-img; no new dependency).
import { createRequire } from 'node:module';
import { readFileSync, rmSync, writeFileSync } from 'node:fs';
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
/** Walk sources: master px → source px. 0.5 covers the largest render (desktop 1920 px at 2×, ~0.53). */
const WALK_SCALE = 0.5;
const WALK_FRAMES = 16;

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
	{ key: 'walkBody', src: 'mascot/walk-puppet-body.png', out: 'mascot-walk-body.webp', crop: true, scale: WALK_SCALE },
	{ key: 'walkArm', src: 'mascot/walk-puppet-arm-near.png', out: 'mascot-walk-arm.webp', crop: true, scale: WALK_SCALE }
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
	'mascot-sunrise-walk@1.webp',
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

// Walk legs atlas: 2 rows (far, near) × WALK_FRAMES columns, every cell the same master box.
const cycle = JSON.parse(readFileSync(master(`mascot/walk${WALK_FRAMES}-cycle.json`), 'utf8'));
const legFrames = ['far', 'near'].flatMap((side) => Array.from({ length: WALK_FRAMES }, (_, i) => master(`mascot/walk${WALK_FRAMES}-leg-${side}@${i + 1}.png`)));
const legBoxes = await Promise.all(legFrames.map(alphaBox));
const cellLeft = Math.min(...legBoxes.map((b) => b.left));
const cellTop = Math.min(...legBoxes.map((b) => b.top));
const cell = {
	left: cellLeft,
	top: cellTop,
	width: Math.max(...legBoxes.map((b) => b.left + b.width)) - cellLeft,
	height: Math.max(...legBoxes.map((b) => b.top + b.height)) - cellTop
};
const cellW = Math.round(cell.width * WALK_SCALE);
const cellH = Math.round(cell.height * WALK_SCALE);
const atlas = Buffer.alloc(cellW * WALK_FRAMES * cellH * 2 * 4);
for (const [index, path] of legFrames.entries()) {
	const row = Math.floor(index / WALK_FRAMES);
	const column = index % WALK_FRAMES;
	const pixels = await sharp(path).extract(cell).resize(cellW, cellH, { kernel: 'lanczos3' }).raw().toBuffer();
	for (let y = 0; y < cellH; y++) pixels.copy(atlas, ((row * cellH + y) * cellW * WALK_FRAMES + column * cellW) * 4, y * cellW * 4, (y + 1) * cellW * 4);
}
const atlasInfo = await sharp(atlas, { raw: { width: cellW * WALK_FRAMES, height: cellH * 2, channels: 4 } })
	.webp(WEBP)
	.toFile(assets('mascot-walk-legs.webp'));
art.walkLegs = { canvas: { width: cycle.canvas[0], height: cycle.canvas[1] }, crop: { x: cell.left, y: cell.top, width: cell.width, height: cell.height } };
console.log(
	`${'mascot-walk-legs.webp'.padEnd(28)} ${atlasInfo.width}×${atlasInfo.height}  ${(atlasInfo.size / 1024).toFixed(0).padStart(5)} kB  cell ${cell.left},${cell.top} ${cell.width}×${cell.height}`
);

const round = (value) => Math.round(value * 100) / 100;
const walk = {
	frames: WALK_FRAMES,
	stepLength: cycle.stepLength,
	advance: cycle.advancePerFrame,
	bob: cycle.poses.map((pose) => round(pose.translateY)),
	arm: cycle.poses.map((pose) => round(pose.arm))
};

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

/**
 * The baked walk cycle (docs/art/mascot/walk${WALK_FRAMES}-cycle.json), in master px. Frame 0 and frames / 2 are the
 * contact poses (both feet down). The planted foot moves back by \`advance\` per frame, so moving the figure forward by
 * exactly that much per frame keeps it in place; \`stepLength\` = frames / 2 × advance. Per frame: \`bob\` (body and legs
 * translateY, baked into the legs atlas) and \`arm\` (near arm rotation in degrees around the shoulder).
 */
export const WALK_CYCLE = {
	frames: ${walk.frames},
	stepLength: ${walk.stepLength},
	advance: ${walk.advance},
	bob: [${walk.bob.join(', ')}],
	arm: [${walk.arm.join(', ')}]
} as const;
`
);
console.log('wrote art.ts');
