// Offline art assembly only. All painted pixels come from the four imagegen masters.
// Usage: node docs/art/mascot/build-walk.mjs [absolute path to an existing sharp module]
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const sharp = require(process.argv[2] || 'sharp');
const dir = fileURLToPath(new URL('.', import.meta.url));
const W = 1152,
	H = 1600,
	baseline = 1500;
const transparent = { r: 0, g: 0, b: 0, alpha: 0 };
const blank = (width = W, height = H) => sharp({ create: { width, height, channels: 4, background: transparent } });
const bounds = async (input) => {
	const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
	let left = info.width,
		top = info.height,
		right = 0,
		bottom = 0;
	for (let y = 0; y < info.height; y++)
		for (let x = 0; x < info.width; x++)
			if (data[(y * info.width + x) * 4 + 3] > 16) {
				left = Math.min(left, x);
				top = Math.min(top, y);
				right = Math.max(right, x);
				bottom = Math.max(bottom, y);
			}
	return { left, top, width: right - left + 1, height: bottom - top + 1 };
};
const placements = {
	body: { output: 'body', width: 480, height: 884, left: 300, top: 100 },
	near: { output: 'leg-near', width: 300, height: 600, left: 480, top: 900 },
	far: { output: 'leg-far', width: 280, height: 600, left: 450, top: 900, flop: true },
	arm: { output: 'arm-near', width: 180, height: 480, left: 408, top: 580 }
};
for (const [key, p] of Object.entries(placements)) {
	const source = dir + `walk-source-${key}.png`;
	const input = await sharp(source)
		.extract(await bounds(source))
		.flop(!!p.flop)
		.resize(p.width, p.height, { fit: 'fill' })
		.png()
		.toBuffer();
	const { data, info } = await blank()
		.composite([{ input, left: p.left, top: p.top }])
		.raw()
		.toBuffer({ resolveWithObject: true });
	if (key === 'near' || key === 'far') {
		// Feather away the generated upper cut line; preserve painted cloth throughout the joint.
		for (let y = 900; y < 980; y++)
			for (let x = 0; x < W; x++) {
				const i = (y * W + x) * 4;
				data[i + 3] = Math.round(data[i + 3] * Math.min(1, (y - 900) / 65));
			}
	}
	await sharp(data, { raw: info })
		.png()
		.toFile(dir + `walk-puppet-${p.output}.png`);
}
const rig = {
	canvas: [W, H],
	baseline,
	units: 'source pixels from top left',
	near: { hip: [570, 970], knee: [569, 1210], ankle: [570, 1420], kneeRadius: 56, ankleRadius: 42 },
	far: { hip: [535, 970], knee: [525, 1210], ankle: [535, 1420], kneeRadius: 52, ankleRadius: 42 },
	shoulder: [477, 646],
	order: ['leg-far', 'body', 'leg-near', 'arm-near'],
	meshBlend: { knee: 150, ankle: 70 },
	// One half-cycle offsets the far leg by four frames. Positive angles rotate clockwise.
	poses: [
		{ phase: 'contact', hip: -20, knee: 10, arm: 13 },
		{ phase: 'down', hip: -11, knee: 22, arm: 8 },
		{ phase: 'passing', hip: 2, knee: 14, arm: 0 },
		{ phase: 'up', hip: 14, knee: 6, arm: -8 },
		{ phase: 'opposite contact', hip: 20, knee: 7, arm: -13 },
		{ phase: 'opposite down', hip: 10, knee: 34, arm: -8 },
		{ phase: 'opposite passing', hip: -10, knee: 43, arm: 0 },
		{ phase: 'opposite up', hip: -21, knee: 25, arm: 8 }
	]
};
// Foot-only masks are temporary measurement buffers; production legs remain whole.
const names = ['body', 'arm-near', 'leg-near', 'leg-far'];
const uris = Object.fromEntries(
	await Promise.all(names.map(async (name) => [name, 'data:image/png;base64,' + (await fs.readFile(dir + `walk-puppet-${name}.png`)).toString('base64')]))
);
for (const side of ['near', 'far']) {
	const { data, info } = await sharp(dir + `walk-puppet-leg-${side}.png`)
		.raw()
		.toBuffer({ resolveWithObject: true });
	const cut = rig[side].ankle[1] - 42;
	data.fill(0, 0, cut * W * 4);
	uris[`foot-${side}`] = 'data:image/png;base64,' + (await sharp(data, { raw: info }).png().toBuffer()).toString('base64');
}
const img = (name) => `<image width="${W}" height="${H}" href="${uris[name]}"/>`;
const rotate = (angle, point, content) => `<g transform="rotate(${angle} ${point[0]} ${point[1]})">${content}</g>`;
const leg = (side, pose) => rotate(pose.hip, rig[side].hip, img(`leg-${side}`));
const svg = (content) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}">${content}</svg>`);
// A continuous skin mesh preserves the painted cloth through knee/ankle bends.
// Optional cut joints are useful for measuring pivots, but are not exported as production parts.
const legPixels = Object.fromEntries(
	await Promise.all(
		['near', 'far'].map(async (side) => [
			side,
			await sharp(dir + `walk-puppet-leg-${side}.png`)
				.raw()
				.toBuffer()
		])
	)
);
const turn = (p, angle, center) => {
	const a = (angle * Math.PI) / 180,
		c = Math.cos(a),
		s = Math.sin(a),
		x = p[0] - center[0],
		y = p[1] - center[1];
	return [center[0] + c * x - s * y, center[1] + s * x + c * y];
};
const mixPoint = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const smooth = (t) => {
	t = Math.max(0, Math.min(1, t));
	return t * t * (3 - 2 * t);
};
const meshLeg = async (side, pose) => {
	const pixels = legPixels[side],
		r = rig[side],
		output = Buffer.alloc(W * H * 4);
	const deform = (p) => {
		const upper = turn(p, pose.hip, r.hip);
		const lower = turn(turn(p, pose.knee, r.knee), pose.hip, r.hip);
		const foot = turn(turn(turn(p, pose.ankle, r.ankle), pose.knee, r.knee), pose.hip, r.hip);
		return mixPoint(mixPoint(upper, lower, smooth((p[1] - r.knee[1] + 75) / 150)), foot, smooth((p[1] - r.ankle[1] + 35) / 70));
	};
	const triangle = (src, dst) => {
		const [a, b, c] = dst,
			determinant = (b[1] - c[1]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[1] - c[1]);
		if (Math.abs(determinant) < 0.0001) return;
		const x0 = Math.max(0, Math.floor(Math.min(...dst.map((p) => p[0])))),
			x1 = Math.min(W - 1, Math.ceil(Math.max(...dst.map((p) => p[0]))));
		const y0 = Math.max(0, Math.floor(Math.min(...dst.map((p) => p[1])))),
			y1 = Math.min(H - 1, Math.ceil(Math.max(...dst.map((p) => p[1]))));
		for (let y = y0; y <= y1; y++)
			for (let x = x0; x <= x1; x++) {
				const u = ((b[1] - c[1]) * (x - c[0]) + (c[0] - b[0]) * (y - c[1])) / determinant;
				const v = ((c[1] - a[1]) * (x - c[0]) + (a[0] - c[0]) * (y - c[1])) / determinant;
				const w = 1 - u - v;
				if (u < -0.00001 || v < -0.00001 || w < -0.00001) continue;
				const sx = u * src[0][0] + v * src[1][0] + w * src[2][0],
					sy = u * src[0][1] + v * src[1][1] + w * src[2][1];
				const ix = Math.floor(sx),
					iy = Math.floor(sy),
					fx = sx - ix,
					fy = sy - iy;
				if (ix < 0 || iy < 0 || ix >= W - 1 || iy >= H - 1) continue;
				const weights = [(1 - fx) * (1 - fy), fx * (1 - fy), (1 - fx) * fy, fx * fy];
				const indexes = [(iy * W + ix) * 4, (iy * W + ix + 1) * 4, ((iy + 1) * W + ix) * 4, ((iy + 1) * W + ix + 1) * 4];
				let alpha = 0;
				for (let j = 0; j < 4; j++) alpha += weights[j] * pixels[indexes[j] + 3];
				const out = (y * W + x) * 4;
				if (alpha <= output[out + 3]) continue;
				output[out + 3] = Math.round(alpha);
				for (let channel = 0; channel < 3; channel++) {
					let sum = 0;
					for (let j = 0; j < 4; j++) sum += weights[j] * pixels[indexes[j] + channel] * pixels[indexes[j] + 3];
					output[out + channel] = Math.round(sum / alpha);
				}
			}
	};
	for (let y = 880; y < 1520; y += 10)
		for (let x = 420; x < 820; x += 10) {
			const a = [x, y],
				b = [x + 10, y],
				c = [x + 10, y + 10],
				d = [x, y + 10];
			const pa = deform(a),
				pb = deform(b),
				pc = deform(c),
				pd = deform(d);
			triangle([a, b, c], [pa, pb, pc]);
			triangle([a, c, d], [pa, pc, pd]);
		}
	const buffer = await sharp(output, { raw: { width: W, height: H, channels: 4 } })
		.png()
		.toBuffer();
	return `<image width="${W}" height="${H}" href="data:image/png;base64,${buffer.toString('base64')}"/>`;
};
const draw = async (near, far, split = true) => {
	const content = leg('far', far, split) + img('body') + leg('near', near, split) + rotate(near.arm, rig.shoulder, img('arm-near'));
	const unregistered = await sharp(svg(content)).png().toBuffer();
	const b = await bounds(unregistered);
	const dy = baseline - (b.top + b.height - 1);
	return {
		png: await sharp(svg(`<g transform="translate(0 ${dy})">${content}</g>`))
			.png()
			.toBuffer(),
		dy
	};
};
const frames = [];
const stepX = [140, 45, -65, -145, -200, -150, -40, 70];
const lift = [0, 0, 0, 0, 0, 55, 60, 35];
const pitch = [-8, 0, 0, 8, 8, 8, 0, -5];
const bob = [35, 45, 20, 10, 35, 45, 20, 10];
const rad = Math.PI / 180;
const inverseLeg = async (side, phase, bodyY) => {
	const r = rig[side],
		[hx, hy] = r.hip,
		[kx, ky] = r.knee,
		[ax, ay] = r.ankle;
	// Find the rotated sole's actual lowest opaque pixel, then put it on the ground or swing arc.
	const footBounds = await bounds(
		await sharp(svg(rotate(pitch[phase], r.ankle, img(`foot-${side}`))))
			.png()
			.toBuffer()
	);
	const targetX = hx + stepX[phase];
	const targetY = baseline - lift[phase] - (footBounds.top + footBounds.height - 1 - ay);
	const dx = targetX - hx,
		dy = targetY - (hy + bodyY);
	const a = Math.hypot(kx - hx, ky - hy),
		b = Math.hypot(ax - kx, ay - ky);
	const distance = Math.hypot(dx, dy);
	if (distance >= a + b) throw new Error(`Unreachable ${side} foot at phase ${phase}: ${distance}`);
	const alpha = Math.acos((a * a + distance * distance - b * b) / (2 * a * distance));
	const upper = Math.atan2(-dx, dy) - alpha;
	const bend = Math.acos((distance * distance - a * a - b * b) / (2 * a * b));
	const lower = upper + bend;
	const restUpper = Math.atan2(-(kx - hx), ky - hy),
		restLower = Math.atan2(-(ax - kx), ay - ky);
	const hip = (upper - restUpper) / rad;
	const knee = (lower - restLower) / rad - hip;
	const ankle = pitch[phase] - hip - knee;
	return { hip, knee, ankle, footTarget: [targetX, targetY], footLift: lift[phase], footPitch: pitch[phase] };
};
for (let i = 0; i < 8; i++) {
	const near = await inverseLeg('near', i, bob[i]),
		far = await inverseLeg('far', (i + 4) % 8, bob[i]);
	const content = (await meshLeg('far', far)) + img('body') + (await meshLeg('near', near)) + rotate(rig.poses[i].arm, rig.shoulder, img('arm-near'));
	const png = await sharp(svg(`<g transform="translate(0 ${bob[i]})">${content}</g>`))
		.png()
		.toBuffer();
	frames.push(png);
	rig.poses[i] = { phase: rig.poses[i].phase, arm: rig.poses[i].arm, translateY: bob[i], near, far };
	await fs.writeFile(dir + `mascot-walk8@${i + 1}.png`, png);
}
// Copy RGBA rows verbatim: compositing onto transparency can round fringe RGB.
const atlas = Buffer.alloc(W * 8 * H * 4);
for (let i = 0; i < 8; i++) {
	const pixels = await sharp(frames[i]).raw().toBuffer();
	for (let y = 0; y < H; y++) pixels.copy(atlas, (y * W * 8 + i * W) * 4, y * W * 4, (y + 1) * W * 4);
}
await sharp(atlas, { raw: { width: W * 8, height: H, channels: 4 } })
	.png()
	.toFile(dir + 'walk-cycle-sheet.png');
for (let i = 0; i < 8; i++) {
	const slice = await sharp(dir + 'walk-cycle-sheet.png')
		.extract({ left: i * W, top: 0, width: W, height: H })
		.raw()
		.toBuffer();
	if (!slice.equals(await sharp(frames[i]).raw().toBuffer())) throw new Error(`Atlas slice ${i + 1} differs`);
}
await blank()
	.composite(['leg-far', 'body', 'leg-near', 'arm-near'].map((n) => ({ input: dir + `walk-puppet-${n}.png` })))
	.png()
	.toFile(dir + 'walk-puppet-rest.png');
const cells = await Promise.all(frames.map((input) => sharp(input).resize(288, 400).png().toBuffer()));
await sharp({ create: { width: 1152, height: 800, channels: 4, background: '#FCD772' } })
	.composite(cells.map((input, i) => ({ input, left: (i % 4) * 288, top: Math.floor(i / 4) * 400 })))
	.png()
	.toFile(dir + 'walk-contact-sheet.png');
const stress = [];
for (const angle of [-30, 0, 30]) {
	const { png } = await draw({ hip: angle, knee: 0, arm: angle }, { hip: -angle, knee: 0 }, false);
	stress.push(await sharp(png).resize(384, 533).png().toBuffer());
}
await sharp({ create: { width: 1152, height: 533, channels: 4, background: '#18191B' } })
	.composite(stress.map((input, i) => ({ input, left: i * 384, top: 0 })))
	.png()
	.toFile(dir + 'walk-joint-check.png');
const small = await Promise.all(frames.map((input) => sharp(input).resize(288, 400).raw().toBuffer()));
await sharp(Buffer.concat(small), { raw: { width: 288, height: 400 * 8, channels: 4, pageHeight: 400 } })
	.gif({ loop: 0, delay: Array(8).fill(110), effort: 7, dither: 0 })
	.toFile(dir + 'walk-cycle-preview.gif');
const continuous = [];
const lerp = (a, b, t) => a + (b - a) * t;
for (let i = 0; i < 32; i++) {
	const phase = i / 4,
		index = Math.floor(phase),
		t = phase - index;
	const a = rig.poses[index],
		b = rig.poses[(index + 1) % 8];
	const interpolateLeg = (side) => Object.fromEntries(['hip', 'knee', 'ankle'].map((key) => [key, lerp(a[side][key], b[side][key], t)]));
	const content =
		(await meshLeg('far', interpolateLeg('far'))) +
		img('body') +
		(await meshLeg('near', interpolateLeg('near'))) +
		rotate(lerp(a.arm, b.arm, t), rig.shoulder, img('arm-near'));
	const rendered = await sharp(svg(`<g transform="translate(0 ${lerp(a.translateY, b.translateY, t)})">${content}</g>`))
		.png()
		.toBuffer();
	continuous.push(await sharp(rendered).resize(288, 400).raw().toBuffer());
}
await sharp(Buffer.concat(continuous), { raw: { width: 288, height: 400 * 32, channels: 4, pageHeight: 400 } })
	.gif({ loop: 0, delay: Array(32).fill(30), effort: 7, dither: 0 })
	.toFile(dir + 'walk-puppet-preview.gif');
const checks = [];
for (let i = 0; i < frames.length; i++) {
	const b = await bounds(frames[i]);
	const meta = await sharp(frames[i]).metadata();
	if (b.top + b.height - 1 !== baseline || meta.width !== W || meta.height !== H || !meta.hasAlpha) throw new Error(`Frame ${i + 1}: registration failed`);
	checks.push({ frame: i + 1, bounds: b, baseline, alpha: true });
}
await fs.writeFile(dir + 'walk-rig.json', JSON.stringify(rig, null, 2) + '\n');
await fs.writeFile(
	dir + 'walk-validation.json',
	JSON.stringify(
		{
			checks,
			source: 'imagegen painted parts; continuous skin mesh, foot IK, transforms and assembly',
			spriteSheet: [W * 8, H],
			sheetSlicesPixelIdentical: true,
			previewTiming: { sprite: { frames: 8, delayMs: 110 }, puppet: { frames: 32, delayMs: 30 } }
		},
		null,
		2
	) + '\n'
);
const detailCells = await Promise.all(frames.map((input) => sharp(input).extract({ left: 200, top: 900, width: 750, height: 620 }).png().toBuffer()));
await sharp({ create: { width: 3000, height: 1240, channels: 4, background: '#FCD772' } })
	.composite(detailCells.map((input, i) => ({ input, left: (i % 4) * 750, top: Math.floor(i / 4) * 620 })))
	.png()
	.toFile(dir + 'walk-detail-check.png');
console.log('Built registered puppet, mesh-baked 8-frame cycle, contact/joint sheets and animated GIFs. All 8 baseline checks passed.');
