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
const clamp = (v) => Math.max(0, Math.min(1, v));
const smooth = (v) => {
	v = clamp(v);
	return v * v * (3 - 2 * v);
};
const specs = [
	{ name: 'wash-spread', width: 2048, height: 2048, top: 0.14, bottom: 0.14, gamma: 1.15, gradeBlooms: true },
	{ name: 'wash-dry', width: 2048, height: 2048, top: 0.14, bottom: 0.14, gamma: 2.05 },
	{ name: 'feather-soft', width: 2560, height: 512, top: 0.2, bottom: 0.15, gamma: 1.5 }
];
function seam(a, w, h) {
	const bw = Math.round(w * 0.12);
	for (let y = 0; y < h; y++)
		for (let d = 0; d < bw; d++) {
			const l = y * w + d,
				r = y * w + w - 1 - d,
				mean = (a[l] + a[r]) / 2,
				t = 1 - smooth(d / (bw - 1));
			a[l] += (mean - a[l]) * t;
			a[r] += (mean - a[r]) * t;
		}
}
export async function generate(names = specs.map((s) => s.name)) {
	const report = [];
	for (const s of specs.filter((s) => names.includes(s.name))) {
		const { name, width: w, height: h } = s;
		const source = path.join(here, '_source-' + name + '.png');
		const native = await sharp(source).metadata();
		let pipeline = sharp(source).removeAlpha().greyscale().resize(w, h, { fit: 'fill', kernel: 'lanczos3' });
		if (name === 'feather-soft') pipeline = pipeline.blur(3);
		const raw = await pipeline.raw().toBuffer();
		let a = Float32Array.from(raw, (v) => Math.pow(clamp((v - 1) / 253), s.gamma));
		seam(a, w, h);
		if (s.gradeBlooms) {
			// Reinforce broad blooms in TWO dimensions. A per-column exponent projects
			// local front irregularities down the entire fade and produces curtains.
			const low = await sharp(Buffer.from(Uint8Array.from(a, (v) => Math.round(v * 255))), {
				raw: { width: w, height: h, channels: 1 }
			})
				.blur(80)
				.greyscale()
				.raw()
				.toBuffer();
			const rowMeans = new Float64Array(h);
			for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) rowMeans[y] += low[y * w + x] / (255 * w);
			for (let y = 0; y < h; y++)
				for (let x = 0; x < w; x++) {
					const i = y * w + x;
					a[i] = clamp(a[i] + low[i] / 255 - rowMeans[y]);
				}
			seam(a, w, h);
		}

		const nt = Math.ceil(h * s.top),
			nb = Math.ceil(h * s.bottom),
			rgba = Buffer.alloc(w * h * 4, 255);
		for (let y = 0; y < h; y++)
			for (let x = 0; x < w; x++) {
				const yy = y / (h - 1),
					p = x / (w - 1),
					variation = 0.012 * Math.sin(2 * Math.PI * p + 0.7) + 0.008 * Math.sin(4 * Math.PI * p + 1.8);
				const topEnd = s.top + 0.13 + variation,
					bottomStart = 1 - s.bottom - 0.16 + variation;
				let v = 1 - (1 - a[y * w + x]) * smooth((yy - s.top) / (topEnd - s.top));
				v *= 1 - smooth((yy - bottomStart) / (1 - s.bottom - bottomStart));
				if (y < nt) v = 1;
				if (y >= h - nb) v = 0;
				rgba[(y * w + x) * 4 + 3] = Math.round(255 * clamp(v));
			}
		const dest = path.join(here, name + '.png');
		await sharp(rgba, { raw: { width: w, height: h, channels: 4 } })
			.png({ compressionLevel: 9 })
			.toFile(dest);
		const bands = [];
		for (let i = 0; i < 20; i++) {
			const y0 = Math.floor((i * h) / 20),
				y1 = Math.floor(((i + 1) * h) / 20);
			let sum = 0;
			for (let y = y0; y < y1; y++) for (let x = 0; x < w; x++) sum += rgba[(y * w + x) * 4 + 3];
			bands.push(+(sum / ((y1 - y0) * w)).toFixed(2));
		}
		let seamMax = 0,
			topMin = 255,
			bottomMax = 0;
		for (let y = 0; y < h; y++) {
			seamMax = Math.max(seamMax, Math.abs(rgba[y * w * 4 + 3] - rgba[(y * w + w - 1) * 4 + 3]));
			for (let x = 0; x < w; x++) {
				const v = rgba[(y * w + x) * 4 + 3];
				if (y < nt) topMin = Math.min(topMin, v);
				if (y >= h - nb) bottomMax = Math.max(bottomMax, v);
			}
		}
		const blurred = await sharp(rgba, { raw: { width: w, height: h, channels: 4 } })
			.extractChannel(3)
			.blur(name === 'feather-soft' ? 5 : 22)
			.greyscale()
			.raw()
			.toBuffer();
		const crosses = [];
		for (let x = 0; x < w; x++) {
			for (let y = 0; y < h; y++) {
				if (blurred[y * w + x] < 128) {
					crosses.push(y / h);
					break;
				}
			}
		}
		report.push({
			name,
			width: w,
			height: h,
			bytes: (await fs.stat(dest)).size,
			sourceSize: [native.width, native.height],
			opaqueRows: nt,
			transparentRows: nb,
			topMin,
			bottomMax,
			seamMax,
			whiteRGB: true,
			bands,
			frontRange: [Math.min(...crosses), Math.max(...crosses)]
		});
	}
	const previous = JSON.parse(await fs.readFile(path.join(here, '_wash-validation.json'), 'utf8').catch(() => '[]'));
	const combined = specs.map((s) => report.find((r) => r.name === s.name) ?? previous.find((r) => r.name === s.name)).filter(Boolean);
	await fs.writeFile(path.join(here, '_wash-validation.json'), JSON.stringify(combined, null, 2) + '\n');
	return report;
}
