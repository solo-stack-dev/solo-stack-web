// Round 4: node docs/art/errors-404/tools/regrade-sky.cjs docs/art/errors-404/tree-sky.png src/lib/errors/assets/error-tree-sky.webp [preview.png] 0.2
/* oxlint-disable no-console -- CLI tool that reports what it wrote */
// Regrade the 404 sky plate: blue night washes → warm night ink (a whisper of the original hue kept), butter dawn untouched.
const sharp = require(process.cwd() + '/node_modules/.pnpm/sharp@0.35.5_@types+node@24.19.2/node_modules/sharp');
const [src, out, preview, keep = '0.16'] = process.argv.slice(2);
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
const ramp = [
	[0, hex('#0e0f10')],
	[0.12, hex('#1a1a1a')],
	[0.3, hex('#35322d')],
	[0.55, hex('#76695a')],
	[0.8, hex('#c9b48c')],
	[1, hex('#f3e6c6')]
];
const at = (y) => {
	for (let i = 1; i < ramp.length; i++)
		if (y <= ramp[i][0]) {
			const [a, ca] = ramp[i - 1],
				[b, cb] = ramp[i];
			const t = (y - a) / (b - a);
			return ca.map((c, k) => c + (cb[k] - c) * t);
		}
	return ramp.at(-1)[1];
};
const smooth = (a, b, x) => {
	const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
	return t * t * (3 - 2 * t);
};
(async () => {
	const { data, info } = await sharp(src).removeAlpha().raw().toBuffer({ resolveWithObject: true });
	const k = Number(keep);
	for (let i = 0; i < data.length; i += 3) {
		const r = data[i] / 255,
			g = data[i + 1] / 255,
			b = data[i + 2] / 255;
		const y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
		const w = smooth(-0.02, 0.22, r - b); // warm = dawn light
		const ink = at(Math.min(1, y * 1.05));
		for (let c = 0; c < 3; c++) {
			const o = [r, g, b][c];
			const cool = ink[c] * (1 - k) + o * k;
			data[i + c] = Math.round(Math.min(1, cool * (1 - w) + o * w) * 255);
		}
	}
	const img = sharp(data, { raw: info });
	await img.clone().webp({ quality: 74, effort: 6 }).toFile(out);
	if (preview) await img.clone().resize(800).png().toFile(preview);
	console.log('done');
})();
