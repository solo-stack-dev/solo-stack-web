/* oxlint-disable no-console -- CLI tool that reports what it wrote */
// Turns the painted night shift masters (docs/art/night-shift/) into the optimized sources in ../assets/ that
// `@sveltejs/enhanced-img` encodes to AVIF/WebP at build time, and writes ../art.ts with the crop rects, so layout.ts
// can place every cropped layer on its scene canvas.
//
// - Scene plates (room with the mascot painted in): desktop downscaled to 1920 wide (the painting's native raster is
//   1672×941, more pixels add nothing), mobile 1080×2340, sky 1100×1100. High quality WebP sources (the build
//   re-encodes them).
// - Typing hands live IN the plate file: a band below the scene holds the three hand frames side by side. Each frame
//   is composited onto the full master scene, put through the same resize as the plate, and cut out around the pixels
//   that frames 2 and 3 change (plus a margin of unchanged plate pixels), with a bleed of the surrounding scene so
//   resampling at the cell edge sees the same neighbours as in the scene. The section shows the scene part as the
//   plate and one cell through a window at the hands rect, both from the SAME image: same file, same decode, same
//   srcset choice and scaling, so the cell registers exactly (a separately encoded patch drifted by ~0.5 CSS px in
//   Chrome on phones).
// - Transparent full-canvas props: cropped to their visible alpha bounding box; the offset goes to art.ts.
//
// Run: node src/lib/home/sections/night-shift/tools/optimize-art.mjs && pnpm exec oxfmt src/lib/home/sections/night-shift/art.ts
// (stop `pnpm dev` first on Windows, it keeps the asset files open). Uses `sharp` from pnpm's virtual store (it ships
// with @sveltejs/enhanced-img; no new dependency).
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../../../../../', import.meta.url));
const sharp = createRequire(`${root}node_modules/.pnpm/node_modules/`)('sharp');
const art = (path) => `${root}docs/art/night-shift/${path}`;
const out = (name) => fileURLToPath(new URL(`../assets/${name}`, import.meta.url));

/** Alpha at or below this counts as empty when cropping (invisible residue). */
const ALPHA_EMPTY = 6;
/** WebP quality of the sources (the build re-encodes; keep them close to lossless). */
const SOURCE_QUALITY = 92;
/** Unchanged plate pixels kept inside each hands cell around the changed pixels. */
const MARGIN = 8;
/** Scene pixels kept around each cell in the band, so downscaling (Lanczos) and bilinear drawing see real neighbours. */
const BLEED = 8;
/** A plate pixel counts as changed by a hand frame above this summed RGB difference (resampling noise stays below). */
const CHANGED = 3;

const webp = (image) => image.webp({ quality: SOURCE_QUALITY, effort: 6, smartSubsample: true });
const even = (value) => value - (value % 2);

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

/** The scene at the plate's width (raw RGB), optionally with a hands master composited in first. */
async function render(source, width, hands) {
	let image = sharp(art(source));
	if (hands)
		image = sharp(
			await image
				.composite([{ input: art(hands.file), left: hands.x, top: hands.y }])
				.png()
				.toBuffer()
		);
	return image.resize({ width }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
}

async function prop(source, name) {
	const box = await alphaBox(art(source));
	await webp(sharp(art(source)).extract({ left: box.x, top: box.y, width: box.width, height: box.height })).toFile(out(name));
	console.log(`${name}: crop`, box);
	return box;
}

/**
 * Scene plate `width` wide with the hands band appended. `frames` are the hands masters 1…3 with their position on the
 * master canvas. Returns the plate canvas, the hands rect on it, the sheet height and each cell's position in the sheet.
 */
async function plate(source, width, frames, name) {
	const base = await render(source, width);
	const { width: w, height: h } = base.info;
	const rendered = await Promise.all(frames.map((frame) => render(source, width, frame)));

	// Bounding box of every plate pixel a frame changes, grown by the margin and snapped to even px (4:2:0 chroma)
	let [x0, y0, x1, y1] = [w, h, -1, -1];
	for (const { data } of rendered) {
		for (let y = 0; y < h; y++) {
			for (let x = 0; x < w; x++) {
				const i = (y * w + x) * 3;
				if (Math.abs(data[i] - base.data[i]) + Math.abs(data[i + 1] - base.data[i + 1]) + Math.abs(data[i + 2] - base.data[i + 2]) <= CHANGED) continue;
				if (x < x0) x0 = x;
				if (x > x1) x1 = x;
				if (y < y0) y0 = y;
				if (y > y1) y1 = y;
			}
		}
	}
	const rect = { x: even(x0 - MARGIN), y: even(y0 - MARGIN) };
	rect.width = even(x1 + 2 + MARGIN - rect.x);
	rect.height = even(y1 + 2 + MARGIN - rect.y);
	const outer = { x: rect.x - BLEED, y: rect.y - BLEED, width: rect.width + 2 * BLEED, height: rect.height + 2 * BLEED };
	if (outer.x < 0 || outer.y < 0 || outer.x + outer.width > w || outer.y + outer.height > h || outer.width * frames.length > w)
		throw new Error('hands band does not fit');

	// Band below the scene: the scene's last row repeated (a seam guard for downscaling), then the cells side by side
	const band = Buffer.alloc(w * (outer.height + BLEED) * 3);
	for (let y = 0; y < outer.height + BLEED; y++) base.data.copy(band, y * w * 3, (h - 1) * w * 3, h * w * 3);
	rendered.forEach(({ data }, index) => {
		for (let y = 0; y < outer.height; y++) {
			const from = ((outer.y + y) * w + outer.x) * 3;
			data.copy(band, ((BLEED + y) * w + index * outer.width) * 3, from, from + outer.width * 3);
		}
	});
	const sheet = { width: w, height: h + BLEED + outer.height };
	await webp(
		sharp({ create: { ...sheet, channels: 3, background: '#000' } }).composite([
			{ input: base.data, raw: { width: w, height: h, channels: 3 }, left: 0, top: 0 },
			{ input: band, raw: { width: w, height: outer.height + BLEED, channels: 3 }, left: 0, top: h }
		])
	).toFile(out(name));
	const cells = frames.map((_, index) => ({ x: index * outer.width + BLEED, y: h + 2 * BLEED }));
	console.log(`${name}: ${w}×${h} scene + hands band, sheet ${sheet.width}×${sheet.height}, hands`, rect);
	return { canvas: { width: w, height: h }, sheet: sheet.height, rect, cells };
}

const scenes = {
	desktop: await plate(
		'nightshift-scene.png',
		1920,
		[1, 2, 3].map((n) => ({ file: `nightshift-hands@${n}.png`, x: 1080, y: 935 })),
		'nightshift-scene.webp'
	),
	mobile: await plate(
		'nightshift-scene-mobile.png',
		1080,
		[1, 2, 3].map((n) => ({ file: `nightshift-hands-mobile@${n}.png`, x: 420, y: 1345 })),
		'nightshift-scene-mobile.webp'
	)
};
await webp(sharp(art('nightshift-window-sky.png')).resize({ width: 1100 })).toFile(out('nightshift-window-sky.webp'));
const props = {
	bonsai: await prop('nightshift-bonsai.png', 'nightshift-bonsai.webp'),
	golden: await prop('nightshift-bonsai-golden.png', 'nightshift-bonsai-golden.webp'),
	handheld: await prop('nightshift-handheld.png', 'nightshift-handheld.webp'),
	foreground: await prop('nightshift-foreground.png', 'nightshift-foreground.webp')
};

const rect = ({ x, y, width, height }) => `{ x: ${x}, y: ${y}, width: ${width}, height: ${height} }`;
const scene = ({ canvas, sheet, rect: r, cells }) =>
	`{ canvas: { width: ${canvas.width}, height: ${canvas.height} }, sheet: ${sheet}, hands: ${rect(r)}, cells: [${cells.map(({ x, y }) => `{ x: ${x}, y: ${y} }`).join(', ')}] }`;
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

/**
 * Scene plate files in plate px: the scene (\`canvas\`) with the hands band below it (file height \`sheet\`). \`hands\` is
 * the typing hands rect on the scene; \`cells\` are the top left corners of frames 1…3 (each \`hands\`-sized) in the band.
 */
export const SCENES = {
	desktop: ${scene(scenes.desktop)},
	mobile: ${scene(scenes.mobile)}
};
`
);
console.log('art.ts written');
