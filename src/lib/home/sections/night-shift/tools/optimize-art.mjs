/* oxlint-disable no-console -- CLI tool that reports what it wrote */
// Turns the painted night shift masters (docs/art/night-shift/, docs/art/mascot/) into the optimized sources in
// ../assets/ that `@sveltejs/enhanced-img` encodes to AVIF/WebP at build time, and writes ../art.ts with the crop
// rects, so layout.ts can place every cropped layer on the shared 2560×1440 canvas.
//
// - Plates: room downscaled to 1920 wide (the painting's native raster is 1672×941, more pixels add nothing),
//   mobile room 1080×2340, sky 1100×1100. High quality WebP sources (the build re-encodes them).
// - Transparent full-canvas props: cropped to their visible alpha bounding box; the offset goes to art.ts.
// - Mascot typing frames (1024×1536, identical outside the hand patch): ONE body image (frame 1 with the hand patch
//   cleared, cut below the desk line since the desk hides everything lower) plus ONE vertical sprite sheet with the
//   three hand patches. Swapping the patch reproduces frames 1…3 exactly.
//
// Run: node src/lib/home/sections/night-shift/tools/optimize-art.mjs && pnpm exec oxfmt src/lib/home/sections/night-shift/art.ts
// Uses `sharp` from pnpm's virtual store (it ships with @sveltejs/enhanced-img; no new dependency).
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../../../../../', import.meta.url));
const sharp = createRequire(`${root}node_modules/.pnpm/node_modules/`)('sharp');
const art = (path) => `${root}docs/art/${path}`;
const out = (name) => fileURLToPath(new URL(`../assets/${name}`, import.meta.url));

/** Alpha at or below this counts as empty when cropping (invisible residue). */
const ALPHA_EMPTY = 6;
/** WebP quality of the sources (the build re-encodes; keep them close to lossless). */
const SOURCE_QUALITY = 92;

/** Hand patch of the typing frames in mascot canvas px, padded by 4 px so it overlaps the body (no resampling seam). */
const HANDS = { x: 106, y: 701, width: 286, height: 155 };
/** The exact region that differs between the frames (cleared from the body image). */
const HANDS_CORE = { x: 110, y: 705, width: 278, height: 147 };
/** Lowest mascot canvas row that can be visible above the desk at the placements in layout.ts (desktop ≈ 829, mobile ≈ 851). */
const MASCOT_BOTTOM = 872;

const webp = (image) => image.webp({ quality: SOURCE_QUALITY, alphaQuality: 100, effort: 6, smartSubsample: true });

async function alphaBox(path) {
	const { data, info } = await sharp(path).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
	let [x0, y0, x1, y1] = [info.width, info.height, -1, -1];
	for (let y = 0; y < info.height; y++) {
		for (let x = 0; x < info.width; x++) {
			if (data[(y * info.width + x) * 4 + 3] <= ALPHA_EMPTY) continue;
			if (x < x0) x0 = x;
			if (x > x1) x1 = x;
			if (y < y0) y0 = y;
			if (y > y1) y1 = y;
		}
	}
	return { x: x0, y: y0, width: x1 + 1 - x0, height: y1 + 1 - y0 };
}

async function plate(source, name, width) {
	await webp(sharp(art(source)).resize({ width })).toFile(out(name));
	console.log(`${name}: ${width} wide`);
}

async function prop(source, name) {
	const box = await alphaBox(art(source));
	await webp(sharp(art(source)).extract({ left: box.x, top: box.y, width: box.width, height: box.height })).toFile(out(name));
	console.log(`${name}: crop`, box);
	return box;
}

async function mascot() {
	const frames = [1, 2, 3].map((n) => art(`mascot/mascot-nightshift-typing@${n}.png`));
	const full = await alphaBox(frames[0]);
	const body = { x: full.x, y: full.y, width: full.width, height: MASCOT_BOTTOM - full.y };

	// Body: frame 1 with the hand region cleared (alpha 0), cropped
	const { data, info } = await sharp(frames[0]).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
	for (let y = HANDS_CORE.y; y < HANDS_CORE.y + HANDS_CORE.height; y++) {
		for (let x = HANDS_CORE.x; x < HANDS_CORE.x + HANDS_CORE.width; x++) data[(y * info.width + x) * 4 + 3] = 0;
	}
	await webp(
		sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } }).extract({ left: body.x, top: body.y, width: body.width, height: body.height })
	).toFile(out('mascot-nightshift-typing.webp'));

	// Hand patches of the three frames, stacked vertically
	const patches = await Promise.all(
		frames.map((frame) => sharp(frame).extract({ left: HANDS.x, top: HANDS.y, width: HANDS.width, height: HANDS.height }).png().toBuffer())
	);
	await webp(
		sharp({ create: { width: HANDS.width, height: HANDS.height * 3, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).composite(
			patches.map((input, index) => ({ input, left: 0, top: index * HANDS.height }))
		)
	).toFile(out('mascot-nightshift-hands.webp'));
	console.log('mascot body', body, 'hands', HANDS);
	return { canvas: { width: 1024, height: 1536 }, body, hands: HANDS };
}

await plate('night-shift/nightshift-room.png', 'nightshift-room.webp', 1920);
await plate('night-shift/nightshift-room-mobile.png', 'nightshift-room-mobile.webp', 1080);
await plate('night-shift/nightshift-window-sky.png', 'nightshift-window-sky.webp', 1100);
const props = {
	bonsai: await prop('night-shift/nightshift-bonsai.png', 'nightshift-bonsai.webp'),
	golden: await prop('night-shift/nightshift-bonsai-golden.png', 'nightshift-bonsai-golden.webp'),
	handheld: await prop('night-shift/nightshift-handheld.png', 'nightshift-handheld.webp'),
	foreground: await prop('night-shift/nightshift-foreground.png', 'nightshift-foreground.webp')
};
const typing = await mascot();

const rect = ({ x, y, width, height }) => `{ x: ${x}, y: ${y}, width: ${width}, height: ${height} }`;
writeFileSync(
	fileURLToPath(new URL('../art.ts', import.meta.url)),
	`// Generated by tools/optimize-art.mjs from the masters in docs/art/. Do not edit; re-run the tool instead.

/** Pixel rect inside a source canvas. */
export interface ArtRect {
	x: number;
	y: number;
	width: number;
	height: number;
}

/** Visible crop of each transparent prop on the 2560×1440 desktop canvas. */
export const PROPS = {
${Object.entries(props)
	.map(([key, box]) => `\t${key}: ${rect(box)}`)
	.join(',\n')}
} satisfies Record<string, ArtRect>;

/** Typing mascot: body crop and hand patch (one sprite cell, three cells stacked) inside the 1024×1536 frame canvas. */
export const TYPING = {
	canvas: { width: ${typing.canvas.width}, height: ${typing.canvas.height} },
	body: ${rect(typing.body)},
	hands: ${rect(typing.hands)}
};
`
);
console.log('art.ts written');
