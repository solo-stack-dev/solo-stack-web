/* oxlint-disable no-console -- CLI tool that reports what it wrote and the rects for layout.ts */
/**
 * Builds the optimized night radio layers in this folder from the painted masters in `docs/art/radio/`.
 * Run from the repo root (Node ≥ 24 strips the types):
 *
 *     node src/lib/home/sections/radio/assets/build-art.ts
 *
 * The painted body has six preset slots, the section has one key per station (9 now, 10 with Discord). The script
 * re-assembles the body from its own painted pixels (no new paint):
 *
 * - The six-slot plate between the knobs becomes one long dark window: the display strip (9-slice of the slot rims).
 * - A band is inserted under the knob row with one long key recess across the radio. The band is cloned from the
 *   body: side walls copied from the straight part of the sides (with a gentle bulge so the outline stays round),
 *   cream wash tiled from clean patches of the face, recess rims tiled from the six painted slot rims.
 * - Phones get a narrower radio: the speaker grille is cut out (seams cross-faded on plain cream) and the key recess
 *   holds two rows.
 *
 * Outputs (WebP; `@sveltejs/enhanced-img` derives AVIF/WebP sizes at build time):
 * landscapes (≤ 1920 / 1080 wide, the paintings' native size is smaller), bodies cropped to content and sized for
 * 2× of their largest CSS width, needle/key/knob as delivered. The script prints the measured rects for layout.ts.
 *
 * Uses the `sharp` that `@sveltejs/enhanced-img` already installs (no new dependency).
 */
import { readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../../../../../..');
const masters = join(root, 'docs/art/radio');
const out = here;

const pnpmDir = join(root, 'node_modules/.pnpm');
const sharpDir = readdirSync(pnpmDir).find((name) => name.startsWith('sharp@'));
if (!sharpDir) throw new Error('sharp not found in node_modules/.pnpm (run pnpm install)');
const require = createRequire(import.meta.url);
// sharp is not a direct dependency, so there are no types to import; this script only needs a loose shape.
// oxlint-disable-next-line typescript/no-explicit-any
const sharp = require(join(pnpmDir, sharpDir, 'node_modules/sharp')) as (input?: unknown, options?: unknown) => any;

// ---------------------------------------------------------------------------------------------------------------
// Tiny raster kit: premultiplied RGBA in Float32 (0…1)

interface Img {
	w: number;
	h: number;
	d: Float32Array;
}

const blank = (w: number, h: number): Img => ({ w, h, d: new Float32Array(w * h * 4) });

async function load(file: string): Promise<Img> {
	const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
	const img = blank(info.width, info.height);
	for (let i = 0; i < data.length; i += 4) {
		const a = data[i + 3] / 255;
		img.d[i] = (data[i] / 255) * a;
		img.d[i + 1] = (data[i + 1] / 255) * a;
		img.d[i + 2] = (data[i + 2] / 255) * a;
		img.d[i + 3] = a;
	}
	return img;
}

function toRaw(img: Img): Buffer {
	const buffer = Buffer.alloc(img.w * img.h * 4);
	for (let i = 0; i < buffer.length; i += 4) {
		const a = img.d[i + 3];
		const k = a > 0 ? 255 / a : 0;
		buffer[i] = Math.round(Math.min(255, img.d[i] * k));
		buffer[i + 1] = Math.round(Math.min(255, img.d[i + 1] * k));
		buffer[i + 2] = Math.round(Math.min(255, img.d[i + 2] * k));
		buffer[i + 3] = Math.round(a * 255);
	}
	return buffer;
}

const fromImg = (img: Img) => sharp(toRaw(img), { raw: { width: img.w, height: img.h, channels: 4 } });

function sub(img: Img, x: number, y: number, w: number, h: number): Img {
	const res = blank(w, h);
	for (let row = 0; row < h; row++) {
		const from = ((y + row) * img.w + x) * 4;
		res.d.set(img.d.subarray(from, from + w * 4), row * w * 4);
	}
	return res;
}

async function scale(img: Img, w: number, h: number): Promise<Img> {
	const { data } = await fromImg(img).resize(Math.round(w), Math.round(h), { fit: 'fill', kernel: 'lanczos3' }).raw().toBuffer({ resolveWithObject: true });
	const res = blank(Math.round(w), Math.round(h));
	for (let i = 0; i < data.length; i += 4) {
		const a = data[i + 3] / 255;
		res.d[i] = (data[i] / 255) * a;
		res.d[i + 1] = (data[i + 1] / 255) * a;
		res.d[i + 2] = (data[i + 2] / 255) * a;
		res.d[i + 3] = a;
	}
	return res;
}

function flipX(img: Img): Img {
	const res = blank(img.w, img.h);
	for (let y = 0; y < img.h; y++)
		for (let x = 0; x < img.w; x++) {
			const a = (y * img.w + x) * 4;
			const b = (y * img.w + (img.w - 1 - x)) * 4;
			res.d.set(img.d.subarray(a, a + 4), b);
		}
	return res;
}

const smooth = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));

interface Feather {
	l?: number;
	r?: number;
	t?: number;
	b?: number;
}

/** Source-over with soft edges. `shift(row)` offsets a source row horizontally (used for the bulging side walls). */
function draw(dst: Img, src: Img, x0: number, y0: number, feather: Feather | number = 0, shift?: (row: number) => number) {
	const f = typeof feather === 'number' ? { l: feather, r: feather, t: feather, b: feather } : feather;
	for (let y = 0; y < src.h; y++) {
		const dy = y0 + y;
		if (dy < 0 || dy >= dst.h) continue;
		const my = Math.min(f.t ? smooth((y + 0.5) / f.t) : 1, f.b ? smooth((src.h - y - 0.5) / f.b) : 1);
		const dx0 = x0 + (shift ? shift(y) : 0);
		for (let x = 0; x < src.w; x++) {
			const dx = dx0 + x;
			if (dx < 0 || dx >= dst.w) continue;
			const m = my * Math.min(f.l ? smooth((x + 0.5) / f.l) : 1, f.r ? smooth((src.w - x - 0.5) / f.r) : 1);
			if (m <= 0) continue;
			const s = (y * src.w + x) * 4;
			const d = (dy * dst.w + dx) * 4;
			const k = 1 - src.d[s + 3] * m;
			for (let c = 0; c < 4; c++) dst.d[d + c] = src.d[s + c] * m + dst.d[d + c] * k;
		}
	}
}

/** Makes every covered pixel fully opaque (soft-edged tiles leave partial alpha where they overlap). */
function opaque(img: Img) {
	for (let i = 0; i < img.d.length; i += 4) {
		const a = img.d[i + 3];
		if (a < 0.02) continue;
		for (let c = 0; c < 4; c++) img.d[i + c] /= a;
	}
}

/** Alpha outline of a row: first/last column with alpha ≥ 0.5. */
function outline(img: Img, y: number): [number, number] {
	let l = 0;
	while (l < img.w && img.d[(y * img.w + l) * 4 + 3] < 0.5) l++;
	let r = img.w - 1;
	while (r > 0 && img.d[(y * img.w + r) * 4 + 3] < 0.5) r--;
	return [l, r];
}

function bounds(img: Img, threshold = 0.04) {
	let x0 = img.w,
		y0 = img.h,
		x1 = 0,
		y1 = 0;
	for (let y = 0; y < img.h; y++)
		for (let x = 0; x < img.w; x++)
			if (img.d[(y * img.w + x) * 4 + 3] > threshold) {
				x0 = Math.min(x0, x);
				x1 = Math.max(x1, x);
				y0 = Math.min(y0, y);
				y1 = Math.max(y1, y);
			}
	return { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
}

// ---------------------------------------------------------------------------------------------------------------
// Pieces of the painted body (pixel coordinates of docs/art/radio/radio-body.png, 2000 × 1200)

/** The six-slot plate between the knobs: outer outline 826…1596 × 784…906, slot interiors 842…1577 × 802…891. */
const PLATE = { x: 822, y: 780, w: 778, h: 130 };
/** 9-slice of one slot with its plate: corner size, edge pieces. */
const RIM = 30;
const CORNERS = { tl: [822, 780], tr: [1570, 780], bl: [822, 880], br: [1570, 880] } as const;
/** Straight top/bottom rim segments, one per painted slot (tiled in turn, so the rim never repeats visibly). */
const RIM_SEGMENTS = [860, 982, 1108, 1236, 1364, 1494];
const RIM_SEGMENT_W = 60;
/** Straight left/right rim pieces (rows 815…875). */
const SIDE_RIM = { y: 812, h: 66, left: 822, right: 1570 };
/** Dark wash inside the dial glass (no reflections), texture for the long recesses. */
const GLASS_WASH = { x: 860, y: 350, w: 880, h: 300 };
/** Clean cream patches of the face (no rims, knobs, glass). */
const CREAM_PATCHES = [
	[830, 914, 770, 34],
	[830, 716, 770, 30],
	[700, 244, 1000, 40]
] as const;
/** Where the band is inserted (below knobs and grille, above the bottom bevel). */
const INSERT_ROW = 950;
/** Straight part of the side walls, copied into the band. */
const SIDE_WALL = { left: { x: 0, w: 152, y: 440 }, right: { x: 1832, w: 168, y: 380 } };
/** Rows from which the side walls are redrawn (the body is widest here). */
const WALL_FROM = 800;
/** Source rows of the straight side walls (sampled back and forth). */
const WALL_ROWS = [420, 780] as const;

/**
 * Redraws a side wall over rows `from…to` of `dst`: columns of the master's straight wall, each row shifted so its
 * outline lands on `target(row)`. Soft towards the face and at both ends.
 */
function drawWall(dst: Img, master: Img, side: 'left' | 'right', from: number, to: number, target: (row: number) => number, dx: number) {
	const { x: sx, w } = SIDE_WALL[side];
	const span = WALL_ROWS[1] - WALL_ROWS[0];
	const fade = 28;
	const ends = 10;
	const source = (i: number) => {
		const phase = i % (2 * span);
		return WALL_ROWS[0] + (phase < span ? phase : 2 * span - phase);
	};
	// Per-row shift, low-passed so the painted bevel inside the wall does not jitter with the noisy alpha outline
	const raw = Array.from({ length: to - from }, (_, i) => {
		const [l, r] = outline(master, source(i));
		return target(from + i) - (side === 'left' ? l : r - dx) - dx;
	});
	const radius = 18;
	const shifts = raw.map((_, i) => {
		let sum = 0;
		let n = 0;
		for (let j = Math.max(0, i - radius); j <= Math.min(raw.length - 1, i + radius); j++, n++) sum += raw[j];
		return Math.round(sum / n);
	});
	for (let row = from; row < to; row++) {
		const i = row - from;
		const src = source(i);
		const shift = shifts[i];
		const my = Math.min(smooth((i + 0.5) / ends), smooth((to - row - 0.5) / ends));
		for (let x = 0; x < w; x++) {
			const dxp = sx + x + shift;
			if (dxp < 0 || dxp >= dst.w) continue;
			const inner = side === 'left' ? w - x - 0.5 : x + 0.5;
			const m = my * smooth(inner / fade);
			const s = (src * master.w + sx + x) * 4;
			const d = (row * dst.w + dxp) * 4;
			const k = 1 - master.d[s + 3] * m;
			for (let c = 0; c < 4; c++) dst.d[d + c] = master.d[s + c] * m + dst.d[d + c] * k;
		}
	}
}

/** Master rows cut off the top of the landscape plates (sky and moon). Keep in sync with LANDSCAPE.*.cropTop. */
const PLATE_CROP_TOP = { wide: 480, tall: 585 } as const;

/** Speaker grille columns removed for the phone radio, and the cut used above/below the grille rows. */
const GRILLE_CUT = { inner: 152, outer: 700, width: 446, top: 280, bottom: 948 };

async function longSlot(body: Img, w: number, h: number, s: number): Promise<Img> {
	// Pieces at scale s; the target box w × h includes the plate outline.
	const c = Math.round(RIM * s);
	const res = blank(w, h);
	// Dark interior: tiled slot interiors
	// Dark interior: the painted dial glass wash, scaled to the recess (one piece, so nothing repeats)
	const g = GLASS_WASH;
	const crop = sub(body, g.x, g.y, Math.min(g.w, Math.round(((w - 2 * c + 40) / (h - 2 * c + 40)) * g.h)), g.h);
	draw(res, await scale(crop, w - 2 * c + 40, h - 2 * c + 40), c - 20, c - 20, 10);
	// Top / bottom rims
	const top = await Promise.all(RIM_SEGMENTS.map((x) => scale(sub(body, x, PLATE.y, RIM_SEGMENT_W, RIM), RIM_SEGMENT_W * s, c)));
	const bottom = await Promise.all(RIM_SEGMENTS.map((x) => scale(sub(body, x, CORNERS.bl[1], RIM_SEGMENT_W, RIM), RIM_SEGMENT_W * s, c)));
	const step = Math.round((RIM_SEGMENT_W - 10) * s);
	for (let x = c - 6, i = 0; x < w - c + 6; x += step, i++) {
		draw(res, top[i % top.length], x, 0, { l: 6, r: 6 });
		draw(res, bottom[(i + 3) % bottom.length], x, h - c, { l: 6, r: 6 });
	}
	// Left / right rims, stretched along their length
	const side = (x: number) => scale(sub(body, x, SIDE_RIM.y, RIM, SIDE_RIM.h), c, h - 2 * c + 12);
	draw(res, await side(SIDE_RIM.left), 0, c - 6, { t: 6, b: 6 });
	draw(res, await side(SIDE_RIM.right), w - c, c - 6, { t: 6, b: 6 });
	// Corners
	const corner = (x: number, y: number) => scale(sub(body, x, y, RIM, RIM), c, c);
	draw(res, await corner(...CORNERS.tl), 0, 0);
	draw(res, await corner(...CORNERS.tr), w - c, 0);
	draw(res, await corner(...CORNERS.bl), 0, h - c);
	draw(res, await corner(...CORNERS.br), w - c, h - c);
	return res;
}

/** Inserts `band` rows at INSERT_ROW: cream wash, side walls (bulging slightly), the key recess. */
async function insertBand(body: Img, master: Img, band: number, recess: { x: number; w: number; top: number; h: number; s: number }) {
	const res = blank(body.w, body.h + band);
	res.d.set(body.d.subarray(0, INSERT_ROW * body.w * 4), 0);
	res.d.set(body.d.subarray(INSERT_ROW * body.w * 4), (INSERT_ROW + band) * body.w * 4);

	const [left, right] = outline(body, INSERT_ROW);

	// Cream wash
	const patches = CREAM_PATCHES.map(([x, y, w, h]) => sub(master, x, y, w, h));
	const variants = [...patches, ...patches.map(flipX)];
	const fill = blank(right - left - 40, band + 24);
	for (let y = -8, row = 0; y < fill.h; y += 22, row++)
		for (let x = -40 - ((row * 173) % 300), col = 0; x < fill.w; x += 720, col++) draw(fill, variants[(row + col * 2) % variants.length], x, y, 14);
	opaque(fill);
	draw(res, fill, left + 20, INSERT_ROW - 12, { t: 12, b: 12 });

	// Side walls, from WALL_FROM down through the band: the outline keeps the width it has at WALL_FROM (the body's
	// widest rows) and only rounds in again over the last rows of the band, following the painted bottom curve.
	// `dx`: the narrow body lost the grille columns, so its right wall sits further left than in the master.
	const dx = master.w - body.w;
	const curve = INSERT_ROW - WALL_FROM;
	for (const side of ['left', 'right'] as const) {
		const at = (row: number) => {
			const [l, r] = outline(master, row);
			return side === 'left' ? l : r - dx;
		};
		const target = (row: number) => {
			if (row < INSERT_ROW) return at(WALL_FROM);
			const u = row - INSERT_ROW;
			return band - u <= curve ? at(INSERT_ROW - (band - u)) : at(WALL_FROM);
		};
		drawWall(res, master, side, WALL_FROM, INSERT_ROW + band + 6, target, side === 'left' ? 0 : dx);
	}

	// Key recess
	const slot = await longSlot(master, recess.w, recess.h, recess.s);
	draw(res, slot, recess.x, INSERT_ROW + recess.top, 3);
	return res;
}

/** Removes the speaker grille columns (phone radio). Seams are cross-faded on plain cream. */
function cutGrille(body: Img): Img {
	const { inner, outer, width, top, bottom } = GRILLE_CUT;
	const res = blank(body.w - width, body.h);
	const fade = 14;
	for (let y = 0; y < body.h; y++) {
		// 0 = grille rows (cut at `inner`), 1 = above/below (cut at `outer`)
		const t = Math.max(smooth((top - y) / fade + 0.5), smooth((y - bottom) / fade + 0.5));
		for (let x = 0; x < res.w; x++) {
			const a = x < inner ? x : x + width;
			// Above/below the grille: cross-fade the cut over 120 px so the painted wash has no visible step
			const u = smooth((x - outer + 60) / 120);
			const d = (y * res.w + x) * 4;
			const da = (y * body.w + a) * 4;
			const b0 = (y * body.w + x) * 4;
			const b1 = (y * body.w + x + width) * 4;
			for (let c = 0; c < 4; c++) {
				const below = body.d[b0 + c] * (1 - u) + body.d[b1 + c] * u;
				res.d[d + c] = body.d[da + c] * (1 - t) + below * t;
			}
		}
	}
	return res;
}

// ---------------------------------------------------------------------------------------------------------------

async function save(img: Img, name: string, width: number, crop = true) {
	const box = crop ? bounds(img) : { x: 0, y: 0, w: img.w, h: img.h };
	const pad = crop ? 2 : 0;
	const x = Math.max(0, box.x - pad);
	const y = Math.max(0, box.y - pad);
	const w = Math.min(img.w - x, box.w + 2 * pad);
	const h = Math.min(img.h - y, box.h + 2 * pad);
	const k = Math.min(1, width / w);
	const file = join(out, name);
	const info = await fromImg(img)
		.extract({ left: x, top: y, width: w, height: h })
		.resize(Math.round(w * k))
		.webp({ quality: 90, alphaQuality: 95, effort: 6 })
		.toFile(file);
	console.log(`${name}: ${info.width}×${info.height}, ${(info.size / 1024).toFixed(0)} kB, crop (${x}, ${y}), scale ${k.toFixed(4)}`);
	return { x, y, k };
}

async function main() {
	const master = await load(join(masters, 'radio-body.png'));

	// Display strip window between the knobs (taller on phones, where the radio is drawn smaller)
	const withStrip = async (plate: typeof PLATE) => {
		const res = blank(master.w, master.h);
		res.d.set(master.d);
		draw(res, await longSlot(master, plate.w, plate.h, 1), plate.x, plate.y, 2);
		return res;
	};
	const tallPlate = { ...PLATE, y: 754, h: 190 };

	// Desktop: one row of keys across the radio
	const wideBand = 250;
	const wideRecess = { x: 186, w: 1628, top: 26, h: 198, s: 1.3 };
	const wide = await insertBand(await withStrip(PLATE), master, wideBand, wideRecess);
	const wideSave = await save(wide, 'radio-body.webp', 1800);

	// Phones: no grille, two rows of keys
	const narrow = cutGrille(await withStrip(tallPlate));
	const tallBand = 540;
	const tallRecess = { x: 168, w: 1218, top: 26, h: 488, s: 1.5 };
	const tall = await insertBand(narrow, master, tallBand, tallRecess);
	const tallSave = await save(tall, 'radio-body-mobile.webp', 1200);

	/** Prints the rects for layout.ts in the saved image's pixels. */
	const report = (label: string, saved: { x: number; y: number; k: number }, dx: number, plate: typeof PLATE, recess: typeof wideRecess) => {
		const px = (x: number) => +((x - dx - saved.x) * saved.k).toFixed(1);
		const py = (y: number) => +((y - saved.y) * saved.k).toFixed(1);
		const rect = (x0: number, y0: number, x1: number, y1: number) => ({ x: px(x0), y: py(y0), w: +(px(x1) - px(x0)).toFixed(1), h: +(py(y1) - py(y0)).toFixed(1) });
		const c = RIM * recess.s;
		console.log(
			label,
			JSON.stringify({
				dialGlass: rect(650, 315, 1798, 695),
				needleTravel: [px(740), px(1710)],
				displayStrip: rect(plate.x + 20, plate.y + 22, plate.x + plate.w - 20, plate.y + plate.h - 18),
				knobs: { left: [px(703), py(845)], right: [px(1733), py(845)], r: +(95 * saved.k).toFixed(1) },
				keyBank: rect(recess.x + c - 8 + dx, INSERT_ROW + recess.top + c - 8, recess.x + recess.w - c + 8 + dx, INSERT_ROW + recess.top + recess.h - c + 8),
				horizonRow497: py(497)
			})
		);
	};
	report('wide', wideSave, 0, PLATE, wideRecess);
	report('tall', tallSave, GRILLE_CUT.width, tallPlate, tallRecess);

	// Plates (masters are upscaled from ~1670 / ~850 px paintings; 1920 / 1080 keep all painted detail). The sky with
	// the moon is cut off at `cropTop` master rows: the section shows only mountains, mist, sea and forest, the page's
	// own night sky shows above (LANDSCAPE.*.cropTop in layout.ts places the cut plate at its original offset).
	for (const [name, width, cropTop] of [
		['radio-landscape', 1920, PLATE_CROP_TOP.wide],
		['radio-landscape-mobile', 1080, PLATE_CROP_TOP.tall]
	] as const) {
		const file = join(masters, `${name}.png`);
		const { width: w, height: h } = await sharp(file).metadata();
		const info = await sharp(file)
			.extract({ left: 0, top: cropTop, width: w, height: h - cropTop })
			.resize(width)
			.webp({ quality: 84, effort: 6 })
			.toFile(join(out, `${name}.webp`));
		console.log(`${name}.webp: ${info.width}×${info.height}, ${(info.size / 1024).toFixed(0)} kB`);
	}

	// Small cutouts as delivered (cropped to content already), lossless
	for (const name of ['radio-needle', 'radio-key', 'radio-key-pressed', 'radio-knob']) {
		const info = await sharp(join(masters, `${name}.png`))
			.webp({ lossless: true, effort: 6 })
			.toFile(join(out, `${name}.webp`));
		console.log(`${name}.webp: ${info.width}×${info.height}, ${(info.size / 1024).toFixed(0)} kB`);
	}
}

await main();
