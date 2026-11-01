const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');
const { specs, inside } = require('./prepare-assets.cjs');
async function pixels(file) {
	return sharp(path.join(__dirname, file)).removeAlpha().raw().toBuffer({ resolveWithObject: true });
}
async function validate() {
	const report = {};
	for (const [format, s] of Object.entries(specs)) {
		const base = await pixels(s.file),
			[w, h] = s.size;
		const files = [s.file, ...[2, 3].map((n) => (format === 'desktop' ? 'scene' : 'scene-mobile') + '-hands@' + n + '.png')];
		const items = [];
		for (const file of files) {
			const a = await pixels(file);
			let screenPixels = 0,
				screenErrors = 0,
				pureBlack = 0,
				pureWhite = 0,
				changed = 0,
				outsideHands = 0,
				outsideMask = 0;
			const beat = file.includes('@') ? Number(file.match(/@(\d)/)[1]) : null;
			const mask = beat
				? await sharp(path.join(__dirname, 'sources/' + format + '-fingers-' + beat + '-mask.png'))
						.raw()
						.toBuffer({ resolveWithObject: true })
				: null;
			let minX = w,
				minY = h,
				maxX = -1,
				maxY = -1;
			for (let y = 0; y < h; y++)
				for (let x = 0; x < w; x++) {
					const k = (y * w + x) * 3,
						r = a.data[k],
						g = a.data[k + 1],
						b = a.data[k + 2];
					if (r === 0 && g === 0 && b === 0) pureBlack++;
					if (r === 255 && g === 255 && b === 255) pureWhite++;
					if (inside(x, y, s.quad)) {
						screenPixels++;
						if (r !== 24 || g !== 25 || b !== 27) screenErrors++;
					}
					if (r !== base.data[k] || g !== base.data[k + 1] || b !== base.data[k + 2]) {
						changed++;
						minX = Math.min(minX, x);
						minY = Math.min(minY, y);
						maxX = Math.max(maxX, x);
						maxY = Math.max(maxY, y);
						const [rx, ry, rw, rh] = s.hands;
						if (x < rx || x >= rx + rw || y < ry || y >= ry + rh) outsideHands++;
						if (mask && !mask.data[(y * w + x) * mask.info.channels]) outsideMask++;
					}
				}
			items.push({
				file,
				size: [a.info.width, a.info.height],
				screenPixels,
				screenErrors,
				pureBlack,
				pureWhite,
				changedPixels: changed,
				outsideHands,
				outsideFingerMask: outsideMask,
				changedBounds: changed ? [minX, minY, maxX - minX + 1, maxY - minY + 1] : null
			});
			if (a.info.width !== w || a.info.height !== h || screenErrors || outsideHands || outsideMask || pureBlack || pureWhite) throw Error('Validation failed: ' + file);
		}
		// Find the connected exact-color screen region from the central screen pixel.
		const cx = Math.round(s.quad.reduce((n, p) => n + p[0], 0) / 4),
			cy = Math.round(s.quad.reduce((n, p) => n + p[1], 0) / 4);
		const seen = new Uint8Array(w * h),
			queue = new Int32Array(w * h);
		let head = 0,
			tail = 1,
			count = 0,
			minX = w,
			minY = h,
			maxX = 0,
			maxY = 0;
		queue[0] = cy * w + cx;
		seen[queue[0]] = 1;
		while (head < tail) {
			const v = queue[head++],
				x = v % w,
				y = Math.floor(v / w),
				k = v * 3;
			if (base.data[k] !== 24 || base.data[k + 1] !== 25 || base.data[k + 2] !== 27) continue;
			count++;
			minX = Math.min(minX, x);
			minY = Math.min(minY, y);
			maxX = Math.max(maxX, x);
			maxY = Math.max(maxY, y);
			for (const n of [
				x > 0 ? v - 1 : -1,
				x < w - 1 ? v + 1 : -1,
				y > 0 ? v - w : -1,
				y < h - 1 ? v + w : -1,
				x > 0 && y > 0 ? v - w - 1 : -1,
				x < w - 1 && y > 0 ? v - w + 1 : -1,
				x > 0 && y < h - 1 ? v + w - 1 : -1,
				x < w - 1 && y < h - 1 ? v + w + 1 : -1
			])
				if (n >= 0 && !seen[n]) {
					seen[n] = 1;
					queue[tail++] = n;
				}
		}
		report[format] = { files: items, flatScreenConnectedComponent: { pixels: count, bounds: [minX, minY, maxX - minX + 1, maxY - minY + 1] }, handsRect: s.hands };
	}
	await fs.writeFile(path.join(__dirname, 'validation.json'), JSON.stringify(report, null, 2) + '\n');
	return report;
}
module.exports = { validate };
if (require.main === module)
	validate()
		.then(console.log)
		.catch((e) => {
			console.error(e);
			process.exitCode = 1;
		});
