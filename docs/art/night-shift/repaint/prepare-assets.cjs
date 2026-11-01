// Reproducible asset-only processing; does not touch application files or git.
const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');
const ROOT = __dirname;
const specs = {
	desktop: {
		file: 'scene.png',
		size: [2560, 1440],
		quad: [
			[799, 525],
			[1400, 513],
			[1400, 797],
			[799, 855]
		],
		hands: [1018, 936, 402, 170],
		fingerPolygons: [
			[
				[1024, 1042],
				[1024, 1018],
				[1044, 1007],
				[1044, 992],
				[1055, 976],
				[1072, 975],
				[1074, 957],
				[1087, 951],
				[1103, 956],
				[1119, 966],
				[1130, 960],
				[1143, 964],
				[1164, 990],
				[1173, 1016],
				[1167, 1038],
				[1140, 1057],
				[1102, 1060],
				[1072, 1055],
				[1046, 1053]
			],
			[
				[1225, 1003],
				[1224, 978],
				[1236, 959],
				[1253, 944],
				[1270, 935],
				[1287, 936],
				[1305, 948],
				[1317, 963],
				[1318, 981],
				[1303, 999],
				[1284, 990],
				[1268, 983],
				[1255, 996],
				[1240, 1005]
			]
		],
		anchors: [
			[900, 1000, 95, 55],
			[1015, 926, 190, 17]
		]
	},
	mobile: {
		file: 'scene-mobile.png',
		size: [1080, 2340],
		quad: [
			[160, 945],
			[609, 928],
			[607, 1140],
			[160, 1184]
		],
		hands: [388, 1232, 216, 113],
		fingerPolygons: [
			[
				[390, 1303],
				[390, 1284],
				[400, 1278],
				[399, 1270],
				[408, 1259],
				[419, 1257],
				[421, 1251],
				[430, 1249],
				[440, 1260],
				[447, 1258],
				[457, 1262],
				[466, 1276],
				[465, 1298],
				[450, 1311],
				[432, 1316],
				[414, 1312],
				[400, 1308]
			],
			[
				[506, 1269],
				[507, 1257],
				[518, 1243],
				[530, 1233],
				[540, 1231],
				[551, 1236],
				[561, 1245],
				[565, 1259],
				[557, 1273],
				[543, 1265],
				[535, 1259],
				[527, 1267],
				[517, 1273]
			]
		],
		anchors: [
			[323, 1273, 53, 32],
			[450, 1236, 44, 10]
		]
	}
};
function inside(x, y, p) {
	let c = false;
	for (let i = 0, j = p.length - 1; i < p.length; j = i++)
		if (p[i][1] > y != p[j][1] > y && x < ((p[j][0] - p[i][0]) * (y - p[i][1])) / (p[j][1] - p[i][1]) + p[i][0]) c = !c;
	return c;
}
function fill(raw, p, rgb) {
	const w = raw.info.width;
	let count = 0;
	for (let y = Math.min(...p.map((v) => v[1])); y < Math.max(...p.map((v) => v[1])); y++) {
		let xs = [];
		for (let i = 0; i < p.length; i++) {
			let a = p[i],
				b = p[(i + 1) % p.length];
			if ((a[1] <= y && b[1] > y) || (b[1] <= y && a[1] > y)) xs.push(a[0] + ((y - a[1]) * (b[0] - a[0])) / (b[1] - a[1]));
		}
		xs.sort((a, b) => a - b);
		for (let j = 0; j < xs.length; j += 2)
			for (let x = Math.ceil(xs[j]); x <= Math.floor(xs[j + 1]); x++) {
				const k = (y * w + x) * 3;
				raw.data.set(rgb, k);
				count++;
			}
	}
	return count;
}
async function raw(file, size) {
	let p = sharp(path.join(ROOT, file));
	if (size) p = p.resize(...size, { fit: 'fill', kernel: 'lanczos3' });
	const result = await p.removeAlpha().raw().toBuffer({ resolveWithObject: true });
	for (let k = 0; k < result.data.length; k += 3) {
		if (result.data[k] === 0 && result.data[k + 1] === 0 && result.data[k + 2] === 0) result.data.set([12, 13, 15], k);
		else if (result.data[k] === 255 && result.data[k + 1] === 255 && result.data[k + 2] === 255) result.data.set([251, 243, 221], k);
	}
	return result;
}
function alignment(base, edit, s) {
	let best = { error: Infinity, dx: 0, dy: 0 };
	const w = s.size[0];
	for (let dy = -4; dy <= 4; dy++)
		for (let dx = -4; dx <= 4; dx++) {
			let error = 0,
				n = 0;
			for (const [rx, ry, rw, rh] of s.anchors)
				for (let y = ry; y < ry + rh; y += 2)
					for (let x = rx; x < rx + rw; x += 2) {
						const a = (y * w + x) * 3,
							b = ((y + dy) * w + x + dx) * 3;
						for (let c = 0; c < 3; c++) {
							error += Math.abs(base.data[a + c] - edit.data[b + c]);
							n++;
						}
					}
			error /= n;
			if (error < best.error) best = { error, dx, dy };
		}
	return best;
}
function skin(data, k) {
	const r = data[k],
		g = data[k + 1],
		b = data[k + 2];
	return r > 170 && g > 85 && g < 220 && b < 180 && r > g * 1.16 && g > b * 1.12;
}
async function processAssets() {
	const report = {};
	for (const [fmt, s] of Object.entries(specs)) {
		const base = await raw('sources/' + fmt + '-native.png', s.size);
		const filled = fill(base, s.quad, [24, 25, 27]);
		await sharp(base.data, { raw: base.info }).png().toFile(path.join(ROOT, s.file));
		report[fmt] = { size: s.size, filledPixels: filled, frames: [] };
		for (const beat of [2, 3]) {
			const edit = await raw('sources/' + fmt + '-hands-' + beat + '-native.png', s.size);
			const reg = alignment(base, edit, s),
				w = s.size[0],
				h = s.size[1];
			const seed = new Uint8Array(w * h),
				mask = new Uint8Array(w * h);
			const [rx, ry, rw, rh] = s.hands;
			for (let y = ry; y < ry + rh; y++)
				for (let x = rx; x < rx + rw; x++)
					if (s.fingerPolygons.some((p) => inside(x, y, p))) {
						const a = (y * w + x) * 3,
							b = ((y + reg.dy) * w + x + reg.dx) * 3;
						if (skin(base.data, a) || skin(edit.data, b)) seed[y * w + x] = 1;
					}
			// Include outlines and the small newly revealed key portions under moving fingers.
			// Restrict edits to these finger polygons; wrists, palms and keyboard elsewhere are original.
			for (let y = ry; y < ry + rh; y++)
				for (let x = rx; x < rx + rw; x++)
					if (s.fingerPolygons.some((p) => inside(x, y, p))) {
						let found = false;
						for (let dy = -2; dy <= 2 && !found; dy++)
							for (let dx = -2; dx <= 2; dx++)
								if (seed[(y + dy) * w + x + dx]) {
									found = true;
									break;
								}
						if (found) mask[y * w + x] = 255;
					}
			// Feather only inside the mask; no change outside it.
			const final = Buffer.from(base.data);
			let count = 0,
				minX = w,
				minY = h,
				maxX = 0,
				maxY = 0;
			for (let y = ry; y < ry + rh; y++)
				for (let x = rx; x < rx + rw; x++)
					if (mask[y * w + x]) {
						let distance = 3;
						for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) if (!mask[(y + dy) * w + x + dx]) distance = Math.min(distance, Math.hypot(dx, dy));
						const alpha = Math.min(1, distance / 2);
						const a = (y * w + x) * 3,
							b = ((y + reg.dy) * w + x + reg.dx) * 3;
						let changed = false;
						for (let c = 0; c < 3; c++) {
							final[a + c] = Math.round(base.data[a + c] * (1 - alpha) + edit.data[b + c] * alpha);
							if (final[a + c] !== base.data[a + c]) changed = true;
						}
						if (changed) {
							count++;
							minX = Math.min(minX, x);
							minY = Math.min(minY, y);
							maxX = Math.max(maxX, x);
							maxY = Math.max(maxY, y);
						}
					}
			const name = (fmt === 'desktop' ? 'scene' : 'scene-mobile') + '-hands@' + beat + '.png';
			await sharp(final, { raw: base.info }).png().toFile(path.join(ROOT, name));
			await sharp(Buffer.from(mask), { raw: { width: w, height: h, channels: 1 } })
				.png()
				.toFile(path.join(ROOT, 'sources/' + fmt + '-fingers-' + beat + '-mask.png'));
			report[fmt].frames.push({ file: name, registration: reg, changedPixels: count, changedBoundingRect: [minX, minY, maxX - minX + 1, maxY - minY + 1] });
		}
	}
	await fs.writeFile(path.join(ROOT, 'processing-report.json'), JSON.stringify(report, null, 2) + '\n');
	return report;
}
specs.desktop.fingerPolygons = [
	[
		[1018, 944],
		[1180, 944],
		[1182, 1026],
		[1159, 1061],
		[1100, 1069],
		[1040, 1057],
		[1018, 1037]
	],
	[
		[1218, 925],
		[1332, 925],
		[1355, 963],
		[1355, 1027],
		[1310, 1054],
		[1250, 1035],
		[1218, 1010]
	]
];
specs.mobile.fingerPolygons = [
	[
		[386, 1239],
		[468, 1239],
		[476, 1290],
		[456, 1317],
		[425, 1319],
		[386, 1310]
	],
	[
		[501, 1226],
		[570, 1226],
		[585, 1247],
		[583, 1284],
		[557, 1300],
		[524, 1290],
		[501, 1275]
	]
];
module.exports = { specs, inside, fill, raw, processAssets };
if (require.main === module)
	processAssets()
		.then(console.log)
		.catch((e) => {
			console.error(e);
			process.exitCode = 1;
		});
