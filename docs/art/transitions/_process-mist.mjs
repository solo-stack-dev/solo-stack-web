// Generated watercolor finishing. Run: node docs/art/transitions/_process-mist.mjs
// Existing Sharp only. No synthesized cloud shapes or new dependencies.
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
const W = 2560,
	H = 720,
	MARGIN = 116;
const clamp = (v, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));
const smooth = (v) => {
	v = clamp(v);
	return v * v * (3 - 2 * v);
};
const wave = (x, frequency, phase = 0) => Math.sin(2 * Math.PI * x * frequency + phase);

export async function generate(names = ['dusk', 'night', 'predawn']) {
	const stats = {};
	const plate = await sharp(path.join(root, 'docs/art/making/making-plate.png'))
		.resize({ width: W })
		.extract({ left: 0, top: 280, width: W, height: H })
		.ensureAlpha()
		.raw()
		.toBuffer();
	for (const name of names) {
		const idx = ['dusk', 'night', 'predawn'].indexOf(name);
		const source = path.join(here, '_source-mist-' + name + '.png');
		const native = await sharp(source).removeAlpha().raw().toBuffer({ resolveWithObject: true });
		const { width: nw, height: nh } = native.info;
		const keyed = Buffer.alloc(nw * nh * 4);
		const base = name === 'night' ? [24, 25, 27] : [42, 39, 35];
		for (let p = 0; p < nw * nh; p++) {
			const [r, g, b] = native.data.subarray(p * 3, p * 3 + 3);
			// Magenta differs from permitted pigments in BOTH red and blue minus green.
			const spill = Math.max(0, Math.min(r, b) - g);
			const coverage = clamp(1 - spill / 255);
			const key = smooth((coverage - 0.025) / 0.955);
			const i = p * 4;
			let color = base;
			if (coverage > 0.04) {
				color = [(r - (1 - coverage) * 255) / coverage, g / coverage, (b - (1 - coverage) * 255) / coverage];
				// Remove residual key chroma, preserving ochre's real red-green/green-blue differences.
				color[2] = Math.min(color[2], color[1]);
				color[0] = Math.min(color[0], color[1] + Math.max(0, color[1] - color[2]) * 1.5 + 8);
			}
			for (let c = 0; c < 3; c++) keyed[i + c] = Math.round(clamp(color[c], 14, 252));
			keyed[i + 3] = Math.round(key * 255);
		}
		// Fit taller native billows to a shallow bank without clipping their scalloped silhouettes.
		// Resize straight RGBA through Sharp's alpha-aware pipeline before density finishing.
		const resized = await sharp(keyed, { raw: { width: nw, height: nh, channels: 4 } })
			.resize(W, 500, { fit: 'fill', kernel: 'lanczos3' })
			.extend({ top: 110, bottom: 110, left: 0, right: 0, background: { r: base[0], g: base[1], b: base[2], alpha: 0 } })
			.raw()
			.toBuffer();
		// Follow the generated lower silhouette so the underside evaporates before its contour.
		const lower = new Float32Array(W),
			lowerSmooth = new Float32Array(W);
		for (let x = 0; x < W; x++) for (let y = 0; y < H; y++) if (resized[(y * W + x) * 4 + 3] > 64) lower[x] = y;
		for (let x = 0; x < W; x++) {
			let total = 0;
			for (let dx = -24; dx <= 24; dx++) total += lower[Math.max(0, Math.min(W - 1, x + dx))];
			lowerSmooth[x] = total / 49;
		}
		const premult = new Float32Array(W * H * 4);
		for (let y = 0; y < H; y++)
			for (let x = 0; x < W; x++) {
				const i = (y * W + x) * 4,
					u = x / (W - 1),
					phase = idx * 0.81;
				const r = resized[i],
					g = resized[i + 1],
					b = resized[i + 2];
				const lum = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 255;
				// Preserve source color contrast: no remapping to a narrow dark palette.
				// Most body pigment 55–80%; tiny dense anthracite cores approach 90%.
				const density = clamp(0.53 + 0.38 * (1 - lum) ** 1.4, 0.45, 0.9);
				const top = 116 + 4 * (1 + wave(u, 3, phase)) + 3 * (1 + wave(u, 7, 0.7 + phase));
				const bottom = 601 - 10 * (1 + wave(u, 4, 1.3 + phase)) - 8 * (1 + wave(u, 9, phase));
				const topWidth = 12 + 4 * wave(u, 5, 1 + phase);
				const bottomWidth = 84 + 24 * wave(u, 6, 0.3 + phase);
				// Generated pigment drives the irregular fade; no artificial grain is added.
				const warp = (lum - 0.3) * 22;
				const envelope = smooth((y - top + warp) / topWidth) * smooth((bottom - y + warp) / bottomWidth);
				const underside = smooth((lowerSmooth[x] + 4 - y + (lum - 0.3) * 12) / 60);
				let a = (resized[i + 3] / 255) * density * envelope * underside;
				if (y < MARGIN || y >= H - MARGIN) a = 0;
				for (let c = 0; c < 3; c++) premult[i + c] = resized[i + c] * a;
				premult[i + 3] = a;
			}
		// Blend a continuous interior segment into the wrap, in premultiplied color.
		const rgba = Buffer.alloc(W * H * 4);
		for (let y = 0; y < H; y++)
			for (let x = 0; x < W; x++) {
				const i = (y * W + x) * 4,
					j = (y * W + ((x + W / 2) % W)) * 4;
				const weight = smooth(Math.min(x, W - 1 - x) / 280);
				const a = premult[i + 3] * weight + premult[j + 3] * (1 - weight);
				let byteAlpha = Math.round(a * 255);
				if (byteAlpha < 2) byteAlpha = 0;
				const edge = smooth(byteAlpha / 24);
				for (let c = 0; c < 3; c++) {
					const color = a > 1e-8 ? (premult[i + c] * weight + premult[j + c] * (1 - weight)) / a : base[c];
					rgba[i + c] = Math.round(clamp(base[c] + (color - base[c]) * edge, 14, 252));
				}
				rgba[i + 3] = byteAlpha;
			}
		for (let y = 0; y < H; y++) {
			const left = y * W * 4,
				right = ((y + 1) * W - 1) * 4;
			for (let c = 0; c < 4; c++) {
				const mean = Math.round((rgba[left + c] + rgba[right + c]) / 2);
				rgba[left + c] = rgba[right + c] = mean;
			}
		}
		const outputPath = path.join(here, 'mist-' + name + '.png');
		await sharp(rgba, { raw: { width: W, height: H, channels: 4 } })
			.png({ compressionLevel: 9 })
			.toFile(outputPath);
		// Exact sRGB composites: night / warm dusk / making plate crop. No captions in raster.
		const proof = Buffer.alloc(W * H * 3 * 3);
		for (let panel = 0; panel < 3; panel++)
			for (let p = 0; p < W * H; p++) {
				const i = p * 4,
					a = rgba[i + 3] / 255;
				for (let c = 0; c < 3; c++) {
					const bg = panel === 0 ? [17, 18, 19][c] : panel === 1 ? [45, 38, 32][c] : plate[i + c];
					proof[(panel * W * H + p) * 3 + c] = Math.round(rgba[i + c] * a + bg * (1 - a));
				}
			}
		const proofPath = path.join(here, '_check-mist-' + name + '.png');
		await sharp(proof, { raw: { width: W, height: H * 3, channels: 3 } })
			.png({ compressionLevel: 9 })
			.toFile(proofPath);
		// Offset wrap to the center, shown on both flat backgrounds for inspection.
		const seamProof = Buffer.alloc(W * H * 2 * 3);
		for (let panel = 0; panel < 2; panel++)
			for (let y = 0; y < H; y++)
				for (let x = 0; x < W; x++) {
					const src = (panel * W * H + y * W + ((x + W / 2) % W)) * 3;
					const dst = (panel * W * H + y * W + x) * 3;
					seamProof.set(proof.subarray(src, src + 3), dst);
				}
		await sharp(seamProof, { raw: { width: W, height: H * 2, channels: 3 } })
			.png({ compressionLevel: 9 })
			.toFile(path.join(here, '_check-mist-' + name + '-seam.png'));
		let min = 255,
			max = 0,
			sum = 0,
			middleCount = 0,
			middleAbove = 0,
			middleWorking = 0,
			nonzero = 0,
			marginsMax = 0,
			edgeDifference = 0;
		for (let y = 0; y < H; y++)
			for (let x = 0; x < W; x++) {
				const i = (y * W + x) * 4,
					a = rgba[i + 3];
				min = Math.min(min, a);
				max = Math.max(max, a);
				sum += a;
				if (a > 0) nonzero++;
				if (y >= 144 && y < 576) {
					middleCount++;
					if (a > 115) middleAbove++;
					if (a >= 115 && a <= 204) middleWorking++;
				}
				if (y < MARGIN || y >= H - MARGIN) marginsMax = Math.max(marginsMax, a);
				if (x === 0) for (let c = 0; c < 4; c++) edgeDifference = Math.max(edgeDifference, Math.abs(rgba[i + c] - rgba[i + (W - 1) * 4 + c]));
				if (!a && base.some((v, c) => rgba[i + c] !== v)) throw new Error('Hidden RGB is not mist colored');
			}
		stats[name] = {
			source: path.basename(source),
			source_dimensions: [nw, nh],
			dimensions: [W, H],
			mode: 'RGBA',
			bytes: (await fs.stat(outputPath)).size,
			alpha_min: min,
			alpha_max: max,
			alpha_mean: sum / (W * H),
			middle_rows: [144, 575],
			middle_alpha_above_115_percent: (middleAbove / middleCount) * 100,
			middle_alpha_45_to_80_percent: (middleWorking / middleCount) * 100,
			nonzero_alpha_mean: sum / nonzero,
			transparent_margin_rows: MARGIN,
			margin_alpha_max: marginsMax,
			left_right_max_rgba_difference: edgeDifference,
			transparent_rgb: base,
			proof_dimensions: [W, H * 3],
			proof_bytes: (await fs.stat(proofPath)).size
		};
		if (max > 230 || marginsMax !== 0 || edgeDifference !== 0 || middleAbove / middleCount < 0.5) throw new Error('Mist validation failed: ' + name);
	}
	const previous = JSON.parse(await fs.readFile(path.join(here, '_mist-validation.json'), 'utf8'));
	await fs.writeFile(path.join(here, '_mist-validation.json'), JSON.stringify({ ...previous, ...stats }, null, 2) + '\n');
	return stats;
}
if (typeof process !== 'undefined' && process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url))
	console.log(JSON.stringify(await generate(), null, 2));
