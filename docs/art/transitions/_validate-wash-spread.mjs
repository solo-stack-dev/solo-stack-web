// Run from the repo with Node; uses the existing Sharp package. No installs.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../..');
const req = createRequire(path.join(root, 'package.json'));
const packages = await fs.readdir(path.join(root, 'node_modules/.pnpm'));
const sharp = req(
	path.join(
		root,
		'node_modules/.pnpm',
		packages.find((p) => p.startsWith('sharp@')),
		'node_modules/sharp'
	)
);
// Decode final PNGs rather than trusting the processor's export buffers.
export function columnMetric(a, w = 2048, h = 2048) {
	const y0 = Math.floor(0.2 * h),
		y1 = Math.floor(0.8 * h);
	const means = new Float64Array(w),
		hp = new Float64Array(w);
	for (let y = y0; y < y1; y++) for (let x = 0; x < w; x++) means[x] += a[y * w + x] / (y1 - y0);
	for (let x = 0; x < w; x++) {
		let sum = 0;
		for (let d = -50; d <= 50; d++) sum += means[(x + d + w) % w];
		hp[x] = means[x] - sum / 101;
	}
	let adjacentMeanMax = 0;
	for (let x = 0; x < w; x++) adjacentMeanMax = Math.max(adjacentMeanMax, Math.abs(means[x] - means[(x + 1) % w]));
	return {
		adjacentMeanMax,
		range: Math.max(...hp) - Math.min(...hp),
		min: Math.min(...hp),
		max: Math.max(...hp),
		minX: hp.indexOf(Math.min(...hp)),
		maxX: hp.indexOf(Math.max(...hp))
	};
}
export async function front(a, w = 2048, h = 2048) {
	const b = await sharp(a, { raw: { width: w, height: h, channels: 1 } })
		.blur(22)
		.greyscale()
		.raw()
		.toBuffer();
	const crossings = [];
	for (let x = 0; x < w; x++)
		for (let y = 0; y < h; y++)
			if (b[y * w + x] < 128) {
				crossings.push(y / h);
				break;
			}
	return [Math.min(...crossings), Math.max(...crossings)];
}
export async function validate() {
	const w = 2048,
		h = 2048;
	const { data: rgba, info } = await sharp(path.join(here, 'wash-spread.png')).raw().toBuffer({ resolveWithObject: true });
	if (info.width !== w || info.height !== h || info.channels !== 4) throw Error('Unexpected dimensions or channels');
	const alpha = Buffer.alloc(w * h);
	let rgbErrors = 0,
		topErrors = 0,
		bottomErrors = 0,
		seamMax = 0;
	for (let y = 0; y < h; y++)
		for (let x = 0; x < w; x++) {
			const i = y * w + x,
				v = rgba[i * 4 + 3];
			alpha[i] = v;
			for (let c = 0; c < 3; c++) if (rgba[i * 4 + c] !== 255) rgbErrors++;
			if (y < 287 && v !== 255) topErrors++;
			if (y >= h - 287 && v !== 0) bottomErrors++;
		}
	for (let y = 0; y < h; y++) seamMax = Math.max(seamMax, Math.abs(alpha[y * w] - alpha[y * w + w - 1]));
	if (rgbErrors || topErrors || bottomErrors || seamMax) throw Error('Mask contract failed');
	const before = await sharp(path.join(here, '_rejected-wash-spread-2.png')).extractChannel(3).raw().toBuffer();
	const beforeMetric = columnMetric(before),
		afterMetric = columnMetric(alpha);
	if (afterMetric.range >= 5) throw Error('Column high-pass range must remain below 5 alpha levels');
	await sharp(alpha, { raw: { width: w, height: h, channels: 1 } })
		.png({ compressionLevel: 9 })
		.toFile(path.join(here, '_check-wash-spread-alpha.png'));
	const offset = Buffer.alloc(w * h);
	for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) offset[y * w + x] = alpha[y * w + ((x + w / 2) % w)];
	await sharp(offset, { raw: { width: w, height: h, channels: 1 } })
		.png({ compressionLevel: 9 })
		.toFile(path.join(here, '_check-wash-spread-seam.png'));
	const source = await sharp(path.join(here, '_source-wash-spread.png')).metadata();
	const bands = [];
	for (let b = 0; b < 20; b++) {
		const y0 = Math.floor((b * h) / 20),
			y1 = Math.floor(((b + 1) * h) / 20);
		let sum = 0;
		for (let y = y0; y < y1; y++) for (let x = 0; x < w; x++) sum += alpha[y * w + x];
		bands.push(sum / ((y1 - y0) * w));
	}
	if (bands.some((v, i) => i && v > bands[i - 1])) throw Error('Band means must decrease');
	const report = {
		width: w,
		height: h,
		source: { width: source.width, height: source.height, hasAlpha: source.hasAlpha },
		rgbErrors,
		topErrors,
		bottomErrors,
		opaqueRows: 287,
		transparentRows: 287,
		seamMax,
		metricDefinition:
			'Mean alpha in rows [409, 1638); centered 101-column box moving average, periodic horizontal boundaries; max minus min residual in 0-255 alpha levels.',
		before: beforeMetric,
		after: afterMetric,
		reductionPercent: 100 * (1 - afterMetric.range / beforeMetric.range),
		frontRange: await front(alpha),
		bands
	};
	await fs.writeFile(path.join(here, '_wash-spread-validation.json'), JSON.stringify(report, null, 2) + '\n');
	return report;
}
