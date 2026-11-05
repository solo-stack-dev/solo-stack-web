/**
 * Procedural watercolor paper: block textures (torn edges, blooms, granulation, creases, ink outline, label), moon,
 * clouds. All rendered once into offscreen canvases and reused.
 */
import type { Paper, Tone } from './engine.ts';
import { rng } from './rng.ts';

export const MONO = "ui-monospace, 'SF Mono', 'Cascadia Mono', 'JetBrains Mono', Menlo, Consolas, 'Liberation Mono', monospace";

export const INK = '#0e0f10';

interface ToneColors {
	base: string;
	light: string;
	dark: string;
	text: string;
}

export const TONES: Record<Tone, ToneColors> = {
	cream: { base: '#f3e5c2', light: '#fbf3dd', dark: '#cdb27a', text: '#2a2723' },
	butter: { base: '#f7d26c', light: '#fce4a2', dark: '#d4a443', text: '#2a2723' },
	ochre: { base: '#e2a93b', light: '#f0c46a', dark: '#b07a24', text: '#18191b' },
	charcoal: { base: '#2f2c28', light: '#4a443b', dark: '#1c1a18', text: '#fbf3dd' }
};

let grain: HTMLCanvasElement | null = null;

/** Small tile of monochrome noise, multiplied over paper for tooth. */
function grainTile(): HTMLCanvasElement {
	if (grain) return grain;
	grain = document.createElement('canvas');
	grain.width = grain.height = 96;
	const context = grain.getContext('2d')!;
	const image = context.createImageData(96, 96);
	const random = rng(11);
	for (let i = 0; i < image.data.length; i += 4) {
		const v = 150 + random() * 105;
		image.data[i] = v;
		image.data[i + 1] = v * 0.97;
		image.data[i + 2] = v * 0.9;
		image.data[i + 3] = 255;
	}
	context.putImageData(image, 0, 0);
	return grain;
}

export const PAD = 8;

/** Block texture in CSS px × dpr. The block fills `[PAD, PAD + w·scale]` × `[PAD, PAD + h·scale]`; the padding holds torn fibers and the outline. */
export function paperTexture(paper: Paper, blockH: number, scale: number, dpr: number): HTMLCanvasElement {
	const w = Math.max(4, paper.w * scale);
	const h = blockH * scale;
	const canvas = document.createElement('canvas');
	canvas.width = Math.ceil((w + PAD * 2) * dpr);
	canvas.height = Math.ceil((h + PAD * 2) * dpr);
	const context = canvas.getContext('2d')!;
	context.scale(dpr, dpr);
	context.translate(PAD, PAD);
	const random = rng(paper.seed);
	const colors = TONES[paper.tone];
	const unit = h / 50;

	// torn outline: jittered points along each edge, straighter on a fresh cut
	const path = new Path2D();
	const jag = (amount: number) => (random() - 0.5) * amount * unit;
	const stepX = Math.max(5, 7 * unit);
	const stepY = Math.max(5, 6 * unit);
	const fold = (4 + random() * 6) * unit;
	const foldCorner = Math.floor(random() * 4);
	path.moveTo(foldCorner === 0 ? fold : 0, jag(2));
	for (let x = stepX; x < w - stepX / 2; x += stepX) path.lineTo(x, jag(3.2));
	if (foldCorner === 1) {
		path.lineTo(w - fold, 0);
		path.lineTo(w, fold);
	} else path.lineTo(w + jag(1.5), jag(1.5));
	for (let y = stepY; y < h - stepY / 2; y += stepY) path.lineTo(w + (paper.cut === 1 ? jag(0.6) : jag(3.4)), y);
	if (foldCorner === 2) {
		path.lineTo(w, h - fold);
		path.lineTo(w - fold, h);
	} else path.lineTo(w + jag(1.5), h + jag(1.5));
	for (let x = w - stepX; x > stepX / 2; x -= stepX) path.lineTo(x, h + jag(3.2));
	if (foldCorner === 3) {
		path.lineTo(fold, h);
		path.lineTo(0, h - fold);
	} else path.lineTo(jag(1.5), h + jag(1.5));
	for (let y = h - stepY; y > stepY / 2; y -= stepY) path.lineTo(paper.cut === -1 ? jag(0.6) : jag(3.4), y);
	if (foldCorner === 0) path.lineTo(0, fold);
	path.closePath();

	// soft drop shadow under the paper
	context.save();
	context.shadowColor = 'rgba(8, 8, 10, 0.45)';
	context.shadowBlur = 6 * unit;
	context.shadowOffsetY = 2.5 * unit;
	context.fillStyle = colors.base;
	// oxlint-disable-next-line unicorn/no-array-fill-with-reference-type -- CanvasRenderingContext2D.fill(Path2D), not Array.fill
	context.fill(path);
	context.restore();

	context.save();
	context.clip(path);

	// face: lighter top fold, darker bottom
	const face = context.createLinearGradient(0, 0, 0, h);
	face.addColorStop(0, colors.light);
	face.addColorStop(0.24, colors.light);
	face.addColorStop(0.27, colors.base);
	face.addColorStop(0.82, colors.base);
	face.addColorStop(1, colors.dark);
	context.fillStyle = face;
	context.fillRect(-PAD, -PAD, w + PAD * 2, h + PAD * 2);

	// watercolor blooms
	const blooms = 5 + Math.floor((w / h) * 2);
	for (let i = 0; i < blooms; i++) {
		const x = random() * w;
		const y = random() * h;
		const r = (12 + random() * 26) * unit;
		const tone = random() < 0.55 ? colors.dark : colors.light;
		const gradient = context.createRadialGradient(x, y, 0, x, y, r);
		gradient.addColorStop(0, hexAlpha(tone, 0.28 + random() * 0.2));
		gradient.addColorStop(0.7, hexAlpha(tone, 0.12));
		gradient.addColorStop(1, hexAlpha(tone, 0));
		context.fillStyle = gradient;
		context.fillRect(x - r, y - r, r * 2, r * 2);
	}

	// fold crease between top strip and face
	context.strokeStyle = hexAlpha(colors.dark, 0.55);
	context.lineWidth = Math.max(1, 1.2 * unit);
	context.beginPath();
	context.moveTo(0, h * 0.26);
	for (let x = 0; x <= w; x += stepX) context.lineTo(x, h * 0.26 + jag(1.2));
	context.stroke();

	// creases
	const creases = 1 + Math.floor(random() * 3);
	for (let i = 0; i < creases; i++) {
		const x = random() * w;
		const tilt = (random() - 0.5) * h * 0.8;
		context.strokeStyle = hexAlpha(colors.light, 0.5);
		context.lineWidth = Math.max(0.8, unit);
		context.beginPath();
		context.moveTo(x, 0);
		context.lineTo(x + tilt, h);
		context.stroke();
		context.strokeStyle = hexAlpha(colors.dark, 0.3);
		context.beginPath();
		context.moveTo(x + 1.2, 0);
		context.lineTo(x + tilt + 1.2, h);
		context.stroke();
	}

	// granulation
	const specks = Math.floor((w * h) / 26);
	for (let i = 0; i < specks; i++) {
		context.fillStyle = hexAlpha(random() < 0.7 ? colors.dark : INK, 0.06 + random() * 0.16);
		const size = 0.6 + random() * 1.4;
		context.fillRect(random() * w, random() * h, size, size);
	}

	// paper tooth
	context.globalCompositeOperation = 'multiply';
	context.globalAlpha = paper.tone === 'charcoal' ? 0.35 : 0.22;
	const pattern = context.createPattern(grainTile(), 'repeat');
	if (pattern) {
		context.fillStyle = pattern;
		context.fillRect(-PAD, -PAD, w + PAD * 2, h + PAD * 2);
	}
	context.globalCompositeOperation = 'source-over';
	context.globalAlpha = 1;

	// pigment pooling at the edges
	context.strokeStyle = hexAlpha(colors.dark, 0.5);
	context.lineWidth = 5 * unit;
	context.stroke(path);

	// fresh cut edge
	if (paper.cut) {
		context.fillStyle = hexAlpha(colors.light, 0.85);
		context.fillRect(paper.cut === 1 ? w - 2.5 * unit : 0, 0, 2.5 * unit, h);
	}

	// label
	const label = paper.label;
	let size = h * 0.36;
	context.font = `700 ${size}px ${MONO}`;
	const max = w - 14 * unit;
	const measured = context.measureText(label).width;
	if (measured > max) {
		size = Math.max(h * 0.2, size * (max / measured));
		context.font = `700 ${size}px ${MONO}`;
	}
	context.save();
	context.translate(w / 2, h * 0.63);
	context.rotate((random() - 0.5) * 0.06);
	context.textAlign = 'center';
	context.textBaseline = 'middle';
	context.fillStyle = hexAlpha(colors.text, 0.18);
	context.fillText(label, 0.8, 1);
	context.fillStyle = colors.text;
	context.fillText(label, 0, 0);
	context.restore();
	context.restore();

	// ink outline, drawn twice for a hand-inked wobble
	context.lineJoin = 'round';
	context.strokeStyle = hexAlpha(INK, 0.85);
	context.lineWidth = Math.max(1.1, 1.5 * unit);
	context.stroke(path);
	context.translate(0.6 * unit, 0.4 * unit);
	context.strokeStyle = hexAlpha(INK, 0.25);
	context.lineWidth = Math.max(0.8, unit);
	context.stroke(path);
	return canvas;
}

/** Moon disc with glow, rendered at a fixed resolution (radius `R` device pixels) and scaled by the renderer. */
export function moonTexture(R = 300): { canvas: HTMLCanvasElement; radius: number } {
	const glow = R * 0.75;
	const size = Math.ceil((R + glow) * 2);
	const canvas = document.createElement('canvas');
	canvas.width = canvas.height = size;
	const context = canvas.getContext('2d')!;
	const c = size / 2;
	const random = rng(42);

	const halo = context.createRadialGradient(c, c, R * 0.9, c, c, R + glow);
	halo.addColorStop(0, 'rgba(252, 215, 114, 0.38)');
	halo.addColorStop(0.35, 'rgba(252, 215, 114, 0.12)');
	halo.addColorStop(1, 'rgba(252, 215, 114, 0)');
	context.fillStyle = halo;
	context.fillRect(0, 0, size, size);

	context.save();
	context.beginPath();
	context.arc(c, c, R, 0, Math.PI * 2);
	context.clip();
	const disc = context.createRadialGradient(c - R * 0.3, c - R * 0.35, R * 0.1, c, c, R);
	disc.addColorStop(0, '#fdeaa6');
	disc.addColorStop(0.6, '#fcd772');
	disc.addColorStop(1, '#e8ae45');
	context.fillStyle = disc;
	context.fillRect(c - R, c - R, R * 2, R * 2);
	// maria
	for (let i = 0; i < 16; i++) {
		const x = c + (random() - 0.5) * R * 1.5;
		const y = c + (random() - 0.5) * R * 1.5;
		const r = R * (0.08 + random() * 0.22);
		const gradient = context.createRadialGradient(x, y, 0, x, y, r);
		gradient.addColorStop(0, 'rgba(214, 150, 50, 0.4)');
		gradient.addColorStop(1, 'rgba(214, 150, 50, 0)');
		context.fillStyle = gradient;
		context.fillRect(x - r, y - r, r * 2, r * 2);
	}
	// craters
	for (let i = 0; i < 14; i++) {
		const x = c + (random() - 0.5) * R * 1.6;
		const y = c + (random() - 0.5) * R * 1.6;
		const r = R * (0.03 + random() * 0.07);
		context.strokeStyle = 'rgba(176, 122, 36, 0.45)';
		context.lineWidth = R * 0.012;
		context.beginPath();
		context.arc(x, y, r, 0.3, Math.PI * 1.6);
		context.stroke();
		context.fillStyle = 'rgba(176, 122, 36, 0.14)';
		context.fill();
	}
	for (let i = 0; i < 2600; i++) {
		context.fillStyle = `rgba(${random() < 0.5 ? '176, 122, 36' : '253, 240, 200'}, ${0.08 + random() * 0.18})`;
		context.fillRect(c - R + random() * R * 2, c - R + random() * R * 2, 2, 2);
	}
	context.restore();
	context.strokeStyle = 'rgba(176, 122, 36, 0.5)';
	context.lineWidth = R * 0.012;
	context.beginPath();
	context.arc(c, c, R - R * 0.006, 0, Math.PI * 2);
	context.stroke();
	return { canvas, radius: R };
}

/** Horizontally tileable watercolor cloud bank lit from above (butter tops, dusky bottoms). Size in device px; the renderer scales it to world units. */
export function cloudBank(seed: number, width = 1600, height = 420): HTMLCanvasElement {
	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	const context = canvas.getContext('2d')!;
	const random = rng(seed);
	const top = height * 0.3;
	const colors = ['#3a352e', '#544937', '#8a6a33', '#c48f35', '#e2a93b', '#f5cf6e'];
	// back to front, dark low puffs first, lit tops last
	for (let layer = 0; layer < colors.length; layer++) {
		const color = colors[layer]!;
		const count = 70;
		const lift = (layer / colors.length) * height * 0.22;
		for (let i = 0; i < count; i++) {
			const x = (i / count) * width + (random() - 0.5) * 40;
			const wave = Math.sin((x / width) * Math.PI * 2 * 3 + seed) * height * 0.06 + Math.sin((x / width) * Math.PI * 2 * 7 + seed * 2) * height * 0.03;
			const y = top + height * 0.38 - lift + wave + random() * height * 0.12;
			const r = 26 + random() * 46 - layer * 2.5;
			for (const dx of [0, -width, width]) {
				if (x + dx + r < 0 || x + dx - r > width) continue;
				const gradient = context.createRadialGradient(x + dx, y, r * 0.2, x + dx, y, r);
				gradient.addColorStop(0, hexAlpha(color, layer > 3 ? 0.75 : 0.9));
				gradient.addColorStop(0.75, hexAlpha(color, layer > 3 ? 0.45 : 0.75));
				gradient.addColorStop(1, hexAlpha(color, 0));
				context.fillStyle = gradient;
				context.beginPath();
				context.arc(x + dx, y, r, 0, Math.PI * 2);
				context.fill();
			}
		}
	}
	// fill below the cloud line so the bank is solid toward the bottom
	const floor = context.createLinearGradient(0, height * 0.7, 0, height);
	floor.addColorStop(0, 'rgba(58, 53, 46, 0)');
	floor.addColorStop(0.4, 'rgba(58, 53, 46, 0.95)');
	floor.addColorStop(1, '#2a2723');
	context.fillStyle = floor;
	context.fillRect(0, height * 0.7, width, height * 0.3);
	// granulation speckle
	for (let i = 0; i < 9000; i++) {
		context.fillStyle = `rgba(${random() < 0.5 ? '24, 25, 27' : '252, 215, 114'}, ${0.05 + random() * 0.12})`;
		context.fillRect(random() * width, top + random() * (height - top), 2, 2);
	}
	return canvas;
}

/** A single soft cloud puff (no hard edges), for clouds passing by at altitude. */
export function cloudPuff(seed: number, width = 640, height = 240): HTMLCanvasElement {
	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	const context = canvas.getContext('2d')!;
	const random = rng(seed);
	const colors = ['#3a352e', '#6b5838', '#b48430', '#e2a93b', '#f5cf6e'];
	for (let layer = 0; layer < colors.length; layer++) {
		for (let i = 0; i < 26; i++) {
			const t = random();
			const x = width * (0.15 + t * 0.7);
			// taller in the middle, lit tops drawn last and higher
			const dome = Math.sin(t * Math.PI);
			const y = height * (0.78 - dome * 0.32 - layer * 0.04) + (random() - 0.5) * height * 0.08;
			const r = height * (0.1 + random() * 0.14) * (0.6 + dome * 0.6);
			const gradient = context.createRadialGradient(x, y, r * 0.15, x, y, r);
			gradient.addColorStop(0, hexAlpha(colors[layer]!, 0.8));
			gradient.addColorStop(0.7, hexAlpha(colors[layer]!, 0.45));
			gradient.addColorStop(1, hexAlpha(colors[layer]!, 0));
			context.fillStyle = gradient;
			context.beginPath();
			context.arc(x, y, r, 0, Math.PI * 2);
			context.fill();
		}
	}
	context.globalCompositeOperation = 'source-atop';
	for (let i = 0; i < 2500; i++) {
		context.fillStyle = `rgba(${random() < 0.5 ? '24, 25, 27' : '252, 215, 114'}, ${0.06 + random() * 0.12})`;
		context.fillRect(random() * width, random() * height, 2, 2);
	}
	return canvas;
}

/** `#rrggbb` + alpha → `rgba()`. */
export function hexAlpha(hex: string, alpha: number): string {
	const value = Number.parseInt(hex.slice(1), 16);
	return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}, ${alpha})`;
}
