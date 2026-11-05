/** Cheap painted textures, generated once on small offscreen canvases: star glow, pigment wash, dust tile, static night backdrop. */

export const COLORS = {
	butter: '#fcd772',
	ochre: '#e2a93b',
	cream: '#fbf3dd',
	night: '#18191b',
	ink: '#0e0f10',
	dusk: '#2a2723'
} as const;

/** Small deterministic PRNG (mulberry32). */
export function rng(seed: number): () => number {
	let state = seed | 0;
	return () => {
		state = (state + 0x6d2b79f5) | 0;
		let t = Math.imul(state ^ (state >>> 15), 1 | state);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

function canvas(width: number, height = width): [HTMLCanvasElement, CanvasRenderingContext2D] {
	const element = document.createElement('canvas');
	element.width = Math.max(1, Math.round(width));
	element.height = Math.max(1, Math.round(height));
	return [element, element.getContext('2d')!];
}

/** Soft round glow, butter halo around a cream core. Draw with `drawImage` at any size. */
export function glowSprite(): HTMLCanvasElement {
	const [element, context] = canvas(64);
	const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
	gradient.addColorStop(0, 'rgba(251, 243, 221, 1)');
	gradient.addColorStop(0.12, 'rgba(252, 215, 114, 0.75)');
	gradient.addColorStop(0.4, 'rgba(252, 215, 114, 0.18)');
	gradient.addColorStop(1, 'rgba(252, 215, 114, 0)');
	context.fillStyle = gradient;
	context.fillRect(0, 0, 64, 64);
	return element;
}

/** Watercolor wash: radial butter → ochre with blotches, granulation, a darker drying edge, and a soft falloff. */
export function pigmentSprite(seed: number): HTMLCanvasElement {
	const size = 256;
	const half = size / 2;
	const [element, context] = canvas(size);
	const random = rng(seed);

	const base = context.createRadialGradient(half, half, 0, half, half, half);
	base.addColorStop(0, 'rgba(252, 215, 114, 0.95)');
	base.addColorStop(0.45, 'rgba(244, 196, 92, 0.75)');
	base.addColorStop(0.78, 'rgba(226, 169, 59, 0.42)');
	base.addColorStop(1, 'rgba(226, 169, 59, 0)');
	context.fillStyle = base;
	context.fillRect(0, 0, size, size);

	const tints = ['226, 169, 59', '252, 215, 114', '251, 243, 221', '200, 140, 40'];
	for (let index = 0; index < 70; index++) {
		const angle = random() * Math.PI * 2;
		const distance = Math.sqrt(random()) * half * 0.85;
		const x = half + Math.cos(angle) * distance;
		const y = half + Math.sin(angle) * distance;
		const radius = 8 + random() * 34;
		const tint = tints[Math.floor(random() * tints.length)]!;
		const blob = context.createRadialGradient(x, y, 0, x, y, radius);
		blob.addColorStop(0, `rgba(${tint}, ${0.05 + random() * 0.14})`);
		blob.addColorStop(0.7, `rgba(${tint}, ${0.03 + random() * 0.06})`);
		blob.addColorStop(1, `rgba(${tint}, 0)`);
		context.fillStyle = blob;
		context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
	}

	// Pigment drying edge: a slightly darker ring where the wash pools.
	context.lineWidth = 10;
	context.strokeStyle = 'rgba(200, 140, 40, 0.16)';
	context.beginPath();
	for (let step = 0; step <= 48; step++) {
		const angle = (step / 48) * Math.PI * 2;
		const radius = half * (0.66 + (random() - 0.5) * 0.08);
		const x = half + Math.cos(angle) * radius;
		const y = half + Math.sin(angle) * radius;
		if (step === 0) context.moveTo(x, y);
		else context.lineTo(x, y);
	}
	context.stroke();

	// Granulation.
	for (let index = 0; index < 1600; index++) {
		const x = random() * size;
		const y = random() * size;
		context.fillStyle = random() < 0.6 ? `rgba(14, 15, 16, ${0.05 + random() * 0.12})` : `rgba(251, 243, 221, ${0.08 + random() * 0.2})`;
		context.fillRect(x, y, 1 + random(), 1 + random());
	}

	context.globalCompositeOperation = 'destination-in';
	const falloff = context.createRadialGradient(half, half, half * 0.35, half, half, half);
	falloff.addColorStop(0, 'rgba(0, 0, 0, 1)');
	falloff.addColorStop(0.75, 'rgba(0, 0, 0, 0.7)');
	falloff.addColorStop(1, 'rgba(0, 0, 0, 0)');
	context.fillStyle = falloff;
	context.fillRect(0, 0, size, size);
	return element;
}

/** Tileable faint dust (tiny non-interactive stars), rendered at device resolution. */
export function dustTile(tile: number, ratio: number, seed = 11): HTMLCanvasElement {
	const [element, context] = canvas(tile * ratio);
	context.scale(ratio, ratio);
	const random = rng(seed);
	for (let index = 0; index < 340; index++) {
		const size = 0.6 + random() * random() * 1.4;
		context.fillStyle = random() < 0.2 ? `rgba(252, 215, 114, ${0.12 + random() * 0.25})` : `rgba(251, 243, 221, ${0.08 + random() * 0.3})`;
		context.beginPath();
		context.arc(random() * tile, random() * tile, size, 0, Math.PI * 2);
		context.fill();
	}
	return element;
}

/** Static backdrop in CSS pixels: sky wash, milky band, horizon glow, two ridges, vignette. Returns the ridge height. */
export function paintBackdrop(context: CanvasRenderingContext2D, width: number, height: number): number {
	const random = rng(23);
	context.clearRect(0, 0, width, height);

	const sky = context.createLinearGradient(0, 0, 0, height);
	sky.addColorStop(0, '#111214');
	sky.addColorStop(0.55, COLORS.night);
	sky.addColorStop(1, '#1f1c18');
	context.fillStyle = sky;
	context.fillRect(0, 0, width, height);

	// Milky band: soft cream and dusk blotches along a diagonal.
	const span = Math.max(width, height);
	for (let index = 0; index < 46; index++) {
		const t = random();
		const x = t * width + (random() - 0.5) * width * 0.15;
		const y = height * (0.78 - t * 0.62) + (random() - 0.5) * height * 0.22;
		const radius = span * (0.05 + random() * 0.13);
		const tint = random() < 0.65 ? `251, 243, 221, ${0.012 + random() * 0.025}` : `42, 39, 35, ${0.25 + random() * 0.3}`;
		const blob = context.createRadialGradient(x, y, 0, x, y, radius);
		blob.addColorStop(0, `rgba(${tint})`);
		blob.addColorStop(1, 'rgba(42, 39, 35, 0)');
		context.fillStyle = blob;
		context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
	}

	const glow = context.createRadialGradient(width * 0.55, height * 1.08, 0, width * 0.55, height * 1.08, width * 0.65);
	glow.addColorStop(0, 'rgba(226, 169, 59, 0.22)');
	glow.addColorStop(0.5, 'rgba(226, 169, 59, 0.06)');
	glow.addColorStop(1, 'rgba(226, 169, 59, 0)');
	context.fillStyle = glow;
	context.fillRect(0, 0, width, height);

	const ridge = Math.min(height * 0.1, 90);
	const ridgeLine = (base: number, amplitude: number, seed: number) => {
		const noise = rng(seed);
		const points: [number, number][] = [];
		let y = 0;
		for (let x = 0; x <= width + 24; x += 24) {
			y = y * 0.7 + (noise() - 0.5) * 0.9;
			points.push([x, height - base + Math.sin(x / (width * 0.18) + seed) * amplitude + y * amplitude * 0.5]);
		}
		return points;
	};
	const far = ridgeLine(ridge * 0.95, ridge * 0.22, 3);
	context.beginPath();
	context.moveTo(0, height);
	for (const [x, y] of far) context.lineTo(x, y);
	context.lineTo(width, height);
	context.closePath();
	context.fillStyle = '#1c1b1a';
	context.fill();
	context.beginPath();
	for (const [index, [x, y]] of far.entries()) {
		if (index === 0) context.moveTo(x, y);
		else context.lineTo(x, y);
	}
	context.strokeStyle = 'rgba(226, 169, 59, 0.28)';
	context.lineWidth = 1.2;
	context.stroke();

	const near = ridgeLine(ridge * 0.55, ridge * 0.3, 9);
	context.beginPath();
	context.moveTo(0, height);
	for (const [x, y] of near) context.lineTo(x, y);
	context.lineTo(width, height);
	context.closePath();
	context.fillStyle = COLORS.ink;
	context.fill();

	const vignette = context.createRadialGradient(width / 2, height / 2, span * 0.3, width / 2, height / 2, span * 0.75);
	vignette.addColorStop(0, 'rgba(14, 15, 16, 0)');
	vignette.addColorStop(1, 'rgba(14, 15, 16, 0.6)');
	context.fillStyle = vignette;
	context.fillRect(0, 0, width, height);
	return ridge;
}
