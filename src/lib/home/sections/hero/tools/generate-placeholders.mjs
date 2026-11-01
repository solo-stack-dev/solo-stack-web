/* oxlint-disable no-console -- CLI tool that reports what it wrote */
// Generates the hero PLACEHOLDER layers procedurally (watercolor-ish moon texture + disc, sky plates, clouds,
// torn paper frame, a simple placeholder mascot) and an optimized copy of the owner portrait.
// The final painted layers from the art agent replace these files 1:1 (same names, see ../README.md).
//
// Run: node src/lib/home/sections/hero/tools/generate-placeholders.mjs [layer ...]
// Uses `sharp` from pnpm's virtual store (it ships with @sveltejs/enhanced-img; no new dependency).
import { createRequire } from 'node:module';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../../../../../', import.meta.url));
const sharp = createRequire(`${root}node_modules/.pnpm/node_modules/`)('sharp');
const out = (name) => fileURLToPath(new URL(`../assets/${name}`, import.meta.url));
const PORTRAIT_SOURCE = 'D:/repos/Solo Stack/branding/final-branding-assets/profil-buttergelb.png';

// ---------------------------------------------------------------------------------------------------------------
// Noise

function mulberry32(seed) {
	let a = seed >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = a;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

const PERM = new Uint8Array(512);
{
	const random = mulberry32(20);
	const p = Array.from({ length: 256 }, (_, i) => i);
	for (let i = 255; i > 0; i--) {
		const j = Math.floor(random() * (i + 1));
		[p[i], p[j]] = [p[j], p[i]];
	}
	for (let i = 0; i < 512; i++) PERM[i] = p[i & 255];
}
const VALUES = Float32Array.from({ length: 256 }, mulberry32(7));
const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (a, b, v) => {
	const t = clamp01((v - a) / (b - a));
	return t * t * (3 - 2 * t);
};

function noise3(x, y, z) {
	const xi = Math.floor(x);
	const yi = Math.floor(y);
	const zi = Math.floor(z);
	const xf = fade(x - xi);
	const yf = fade(y - yi);
	const zf = fade(z - zi);
	const X = xi & 255;
	const Y = yi & 255;
	const Z = zi & 255;
	const v = (a, b, c) => VALUES[PERM[PERM[PERM[(X + a) & 255] + ((Y + b) & 255)] + ((Z + c) & 255)]];
	return lerp(
		lerp(lerp(v(0, 0, 0), v(1, 0, 0), xf), lerp(v(0, 1, 0), v(1, 1, 0), xf), yf),
		lerp(lerp(v(0, 0, 1), v(1, 0, 1), xf), lerp(v(0, 1, 1), v(1, 1, 1), xf), yf),
		zf
	);
}

function fbm(x, y, z, octaves = 5) {
	let sum = 0;
	let amp = 0.5;
	let norm = 0;
	for (let o = 0; o < octaves; o++) {
		sum += noise3(x, y, z) * amp;
		norm += amp;
		x *= 2.03;
		y *= 2.03;
		z *= 2.03;
		amp *= 0.5;
	}
	return sum / norm;
}

// ---------------------------------------------------------------------------------------------------------------
// Palette (docs/HANDOFF-HOMEPAGE.md §3.1)

const BUTTER = [252, 215, 114];
const PALE = [253, 234, 170];
const OCHRE = [226, 169, 59];
const UMBER = [176, 122, 40];
const NIGHT = [24, 25, 27];
const INK = [14, 15, 16];
const DUSK = [42, 39, 35];

const mix = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

function toBuffer(width, height, pixel, channels = 3) {
	const data = Buffer.alloc(width * height * channels);
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const c = pixel(x, y);
			const i = (y * width + x) * channels;
			for (let k = 0; k < channels; k++) data[i + k] = Math.max(0, Math.min(255, Math.round(c[k] ?? 255)));
		}
	}
	return data;
}

async function save(name, data, width, height, channels, { palette = false } = {}) {
	await sharp(data, { raw: { width, height, channels } }).png({ compressionLevel: 9, palette, quality: 92, effort: 8 }).toFile(out(name));
	console.log('wrote', name);
}

// ---------------------------------------------------------------------------------------------------------------
// Moon: equirectangular albedo texture, mapped like three's SphereGeometry (u = φ / 2π, row = θ / π)

const TEX_W = 4096;
const TEX_H = 2048;

function spherePoint(u, rowFraction) {
	const phi = u * Math.PI * 2;
	const theta = rowFraction * Math.PI;
	return [-Math.cos(phi) * Math.sin(theta), Math.cos(theta), Math.sin(phi) * Math.sin(theta)];
}

function moonTexture() {
	const width = TEX_W;
	const height = TEX_H;
	const color = new Float32Array(width * height * 3);
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const [px, py, pz] = spherePoint((x + 0.5) / width, (y + 0.5) / height);
			const wash = fbm(px * 1.4 + 3, py * 1.4, pz * 1.4, 4);
			let c = mix(BUTTER, PALE, smooth(0.35, 0.7, wash) * 0.75);
			// Maria: large pigment blooms with darker, granulated edges (watercolor edge darkening)
			const maria = fbm(px * 1.7 + 11, py * 1.7 + 5, pz * 1.7, 6);
			const inside = smooth(0.535, 0.55, maria);
			const edge = Math.exp(-(((maria - 0.545) / 0.012) ** 2));
			c = mix(c, OCHRE, inside * (0.42 + 0.25 * smooth(0.55, 0.7, maria)));
			c = mix(c, UMBER, edge * 0.32);
			// Smaller, lighter blooms
			const bloom = fbm(px * 4.2 - 7, py * 4.2, pz * 4.2 + 2, 4);
			c = mix(c, OCHRE, smooth(0.6, 0.63, bloom) * 0.28 + Math.exp(-(((bloom - 0.615) / 0.008) ** 2)) * 0.18);
			// Granulation and paper
			const grain = noise3(px * 140, py * 140, pz * 140);
			c = mix(c, UMBER, Math.max(0, grain - 0.62) * 0.35);
			const i = (y * width + x) * 3;
			color[i] = c[0];
			color[i + 1] = c[1];
			color[i + 2] = c[2];
		}
	}

	// Craters: soft wash inside, pigment ring at the rim, a pale lip outside.
	const random = mulberry32(42);
	for (let n = 0; n < 260; n++) {
		const u = random();
		const v = Math.acos(2 * random() - 1) / Math.PI;
		const center = spherePoint(u, v);
		const radius = 0.012 + random() ** 3 * 0.11;
		const strength = 0.55 + random() * 0.45;
		const rowRadius = Math.ceil(((radius * 1.35) / Math.PI) * height);
		const cy = Math.round(v * height);
		for (let y = Math.max(0, cy - rowRadius); y < Math.min(height, cy + rowRadius); y++) {
			const sinTheta = Math.max(0.05, Math.sin(((y + 0.5) / height) * Math.PI));
			const colRadius = Math.min(width / 2, Math.ceil(((radius * 1.35) / (Math.PI * 2 * sinTheta)) * width));
			const cx = Math.round(u * width);
			for (let dx = -colRadius; dx <= colRadius; dx++) {
				const x = (((cx + dx) % width) + width) % width;
				const p = spherePoint((x + 0.5) / width, (y + 0.5) / height);
				const d = Math.acos(Math.min(1, p[0] * center[0] + p[1] * center[1] + p[2] * center[2]));
				const wobble = (fbm(p[0] * 9 + n, p[1] * 9, p[2] * 9, 3) - 0.5) * 0.35;
				const t = d / radius + wobble;
				if (t > 1.3) continue;
				const i = (y * width + x) * 3;
				let c = [color[i], color[i + 1], color[i + 2]];
				c = mix(c, OCHRE, smooth(1.0, 0.6, t) * 0.3 * strength);
				c = mix(c, UMBER, Math.exp(-(((t - 0.9) / 0.09) ** 2)) * 0.5 * strength);
				c = mix(c, PALE, Math.exp(-(((t - 1.1) / 0.08) ** 2)) * 0.35 * strength);
				color[i] = c[0];
				color[i + 1] = c[1];
				color[i + 2] = c[2];
			}
		}
	}

	const data = Buffer.alloc(width * height * 3);
	for (let i = 0; i < data.length; i++) data[i] = Math.max(0, Math.min(255, Math.round(color[i])));
	return { data, width, height };
}

// Painted moon disc: the orthographic view of the texture at rotation 0, exactly what the 3D moon shows first.
function moonDisc(texture, size = 2048) {
	const { data: tex, width: tw, height: th } = texture;
	const sample = (u, row) => {
		const x = u * tw - 0.5;
		const y = Math.min(th - 1.001, Math.max(0, row * th - 0.5));
		const x0 = Math.floor(x);
		const y0 = Math.floor(y);
		const fx = x - x0;
		const fy = y - y0;
		const at = (xx, yy) => {
			const i = (yy * tw + (((xx % tw) + tw) % tw)) * 3;
			return [tex[i], tex[i + 1], tex[i + 2]];
		};
		return mix(mix(at(x0, y0), at(x0 + 1, y0), fx), mix(at(x0, y0 + 1), at(x0 + 1, y0 + 1), fx), fy);
	};
	return toBuffer(
		size,
		size,
		(px, py) => {
			const x = ((px + 0.5) / size) * 2 - 1;
			const y = 1 - ((py + 0.5) / size) * 2;
			const r = Math.hypot(x, y);
			// Slightly ragged watercolor edge, but within half a percent of the geometric circle
			const angle = Math.atan2(y, x);
			const ragged = 1 - 0.004 * fbm(Math.cos(angle) * 6, Math.sin(angle) * 6, 3, 3);
			const alpha = smooth(ragged, ragged - 2.5 / size, r);
			if (alpha <= 0) return [0, 0, 0, 0];
			const rr = Math.min(r, 0.99999);
			const z = Math.sqrt(1 - rr * rr);
			const theta = Math.acos(Math.max(-1, Math.min(1, y)));
			let phi = Math.atan2(z, -x);
			if (phi < 0) phi += Math.PI * 2;
			let c = sample(phi / (Math.PI * 2), theta / Math.PI);
			// Same limb treatment as the 3D shader: gentle falloff and a pigment rim
			c = mix(c, OCHRE, (1 - z) ** 3 * 0.45);
			c = mix(c, UMBER, smooth(0.9, 1, r) * 0.25);
			return [c[0], c[1], c[2], alpha * 255];
		},
		4
	);
}

// ---------------------------------------------------------------------------------------------------------------
// Sky plates: anthracite wash with warm bleeds at the bottom left (no moon, no stars, no text)

function sky(width, height, seed) {
	return toBuffer(width, height, (x, y) => {
		const s = Math.max(width, height);
		const nx = x / s;
		const ny = y / s;
		const wash = fbm(nx * 3 + seed, ny * 3, seed, 5);
		const blot = fbm(nx * 9, ny * 9 + seed, 1, 4);
		let c = mix(INK, NIGHT, smooth(0.3, 0.7, wash));
		c = mix(c, DUSK, smooth(0.55, 0.75, blot) * 0.6);
		// warm dusk bleeding in from the lower left
		const warm = clamp01(1 - Math.hypot(x / width, 1 - y / height) * 1.4);
		c = mix(c, [74, 52, 26], warm * smooth(0.35, 0.65, fbm(nx * 5, ny * 5, seed + 4, 4)) * 0.55);
		const fiber = noise3(x * 0.9, y * 0.9, seed) - 0.5;
		return [c[0] + fiber * 6, c[1] + fiber * 6, c[2] + fiber * 6];
	});
}

// ---------------------------------------------------------------------------------------------------------------
// Clouds: pigment clouds (ochre glow at the edges, dark smoky body), transparent

function clouds(width, height, seed, { ochre = 0.7, dark = 0.85, anchorX = 0, anchorY = 1, reach = 0.9 } = {}) {
	return toBuffer(
		width,
		height,
		(x, y) => {
			const nx = x / width;
			const ny = y / height;
			const s = width / height;
			const shape = fbm(nx * 4 * s + seed, ny * 4, seed, 6);
			const falloff = 1 - Math.hypot((nx - anchorX) / reach, (ny - anchorY) / (reach * 0.9));
			const density = shape * 0.85 + falloff * 0.6 - 0.45;
			const border = Math.min(nx, 1 - nx, ny, 1 - ny);
			const alpha = smooth(0.0, 0.08, density) * smooth(0, 0.14, border);
			if (alpha <= 0) return [0, 0, 0, 0];
			const edge = Math.exp(-(((density - 0.05) / 0.06) ** 2));
			const core = smooth(0.08, 0.3, density);
			let c = mix(OCHRE, [96, 72, 40], core * dark);
			c = mix(c, [40, 36, 32], smooth(0.22, 0.45, density) * dark);
			c = mix(c, BUTTER, edge * 0.35 * ochre);
			const grain = noise3(x * 0.6, y * 0.6, seed) - 0.5;
			return [c[0] + grain * 14, c[1] + grain * 12, c[2] + grain * 8, alpha * (0.75 + 0.25 * core) * 255];
		},
		4
	);
}

// ---------------------------------------------------------------------------------------------------------------
// Torn paper frame: butter pigment paper with a ragged outer edge and a ragged transparent window

function portraitFrame(size = 720) {
	return toBuffer(
		size,
		size,
		(x, y) => {
			const nx = x / size - 0.5;
			const ny = y / size - 0.5;
			const angle = Math.atan2(ny, nx);
			// rounded-square distance (superellipse) for both edges
			const d = (Math.abs(nx) ** 5 + Math.abs(ny) ** 5) ** (1 / 5);
			const outer = 0.47 - 0.03 * fbm(Math.cos(angle) * 5 + 2, Math.sin(angle) * 5, 1, 5);
			const inner = 0.385 - 0.03 * fbm(Math.cos(angle) * 6, Math.sin(angle) * 6 + 4, 9, 5);
			if (d > outer || d < inner) return [0, 0, 0, 0];
			const fibers = fbm(x / 18, y / 18, 3, 4);
			let c = mix(PALE, BUTTER, smooth(0.3, 0.7, fibers));
			// torn edges: white paper core and darker pigment near the tear
			const tearIn = smooth(inner + 0.012, inner, d);
			const tearOut = smooth(outer - 0.01, outer, d);
			c = mix(c, [251, 243, 221], Math.max(tearIn, tearOut) * 0.8);
			c = mix(c, OCHRE, smooth(0.6, 0.75, fbm(x / 40, y / 40, 6, 3)) * 0.35);
			return [c[0], c[1], c[2], 255];
		},
		4
	);
}

// ---------------------------------------------------------------------------------------------------------------
// Placeholder mascot: simple ink-outlined chibi sitting on the rim with a glowing laptop (SVG → PNG).
// Rig points used by Hero.svelte (fractions of the image): eyes ~ (0.47, 0.25) and (0.57, 0.25),
// head pivot ~ (0.52, 0.36), laptop screen ~ (0.36, 0.52). The final art can override them via CSS vars.

const MASCOT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="720" viewBox="0 0 600 720">
<defs>
	<radialGradient id="glow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#fcd772" stop-opacity="0.9"/><stop offset="1" stop-color="#fcd772" stop-opacity="0"/></radialGradient>
	<filter id="wc"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="3"/><feDisplacementMap in="SourceGraphic" scale="5"/></filter>
</defs>
<g stroke="#0e0f10" stroke-width="5" stroke-linejoin="round" stroke-linecap="round" filter="url(#wc)">
	<!-- legs dangling over the rim to the lower left -->
	<path d="M300 470 C250 500 205 540 175 600 L215 620 C240 575 280 545 330 520 Z" fill="#202124"/>
	<path d="M330 480 C290 520 250 570 235 630 L275 640 C290 590 320 555 365 530 Z" fill="#26272a"/>
	<path d="M150 600 C140 615 150 640 175 640 L225 635 C228 620 222 608 210 604 Z" fill="#f4efe4"/>
	<path d="M210 630 C200 645 210 668 235 668 L285 662 C288 648 282 636 270 632 Z" fill="#f4efe4"/>
	<!-- torso, black tee -->
	<path d="M255 300 C225 330 225 420 245 480 L385 485 C400 420 395 335 365 300 C335 285 285 285 255 300 Z" fill="#1d1e21"/>
	<!-- arms to the laptop -->
	<path d="M262 330 C235 370 230 420 250 450 L285 440 C275 410 280 380 290 355 Z" fill="#1d1e21"/>
	<path d="M250 450 C245 462 252 474 266 472 L292 466 L285 440 Z" fill="#f2c9a3"/>
	<!-- laptop (screen faces the viewer's left, back to us) -->
	<path d="M175 455 L300 470 L285 482 L160 468 Z" fill="#cfc6b6"/>
	<path d="M178 455 L196 345 L310 360 L300 470 Z" fill="#d9d1c2"/>
	<!-- head -->
	<ellipse cx="312" cy="215" rx="78" ry="82" fill="#f2c9a3"/>
	<path d="M236 205 C230 140 290 115 330 125 C375 132 400 165 392 210 C380 185 360 172 335 170 C300 168 270 175 236 205 Z" fill="#26211d"/>
	<ellipse cx="236" cy="225" rx="12" ry="18" fill="#f2c9a3"/>
	<path d="M300 258 C312 266 330 266 342 256" fill="none" stroke-width="4"/>
	<path d="M262 236 C280 280 345 285 372 245" fill="none" stroke="#6b5b4d" stroke-width="3" stroke-dasharray="2 7" opacity="0.6"/>
</g>
<!-- eyes (kept outside the displacement so the blink lids line up) -->
<ellipse cx="283" cy="210" rx="7" ry="9" fill="#0e0f10"/>
<ellipse cx="343" cy="210" rx="7" ry="9" fill="#0e0f10"/>
<ellipse cx="270" cy="232" rx="12" ry="6" fill="#e9a07a" opacity="0.45"/>
<ellipse cx="358" cy="232" rx="12" ry="6" fill="#e9a07a" opacity="0.45"/>
<!-- laptop logo glow -->
<circle cx="246" cy="410" r="60" fill="url(#glow)"/>
<circle cx="246" cy="410" r="9" fill="#fcd772"/>
</svg>`;

// ---------------------------------------------------------------------------------------------------------------

const jobs = {
	async moon() {
		console.time('moon texture');
		const texture = moonTexture();
		console.timeEnd('moon texture');
		await save('hero-moon-texture.png', texture.data, texture.width, texture.height, 3, { palette: true });
		await save('hero-moon-disc.png', moonDisc(texture), 2048, 2048, 4, { palette: true });
	},
	async sky() {
		await save('hero-sky.png', sky(2560, 1440, 1), 2560, 1440, 3, { palette: true });
		await save('hero-sky-mobile.png', sky(1080, 2340, 2), 1080, 2340, 3, { palette: true });
	},
	async clouds() {
		await save('hero-clouds-1.png', clouds(1600, 900, 3, { anchorX: 0, anchorY: 1, reach: 0.75 }), 1600, 900, 4, { palette: true });
		await save('hero-clouds-2.png', clouds(1400, 800, 8, { anchorX: 0.1, anchorY: 1, reach: 0.65, dark: 1 }), 1400, 800, 4, { palette: true });
		await save('hero-clouds-3.png', clouds(1200, 700, 13, { anchorX: 0, anchorY: 0.55, reach: 0.5, ochre: 1, dark: 0.6 }), 1200, 700, 4, { palette: true });
	},
	async frame() {
		await save('hero-portrait-frame.png', portraitFrame(), 720, 720, 4, { palette: true });
	},
	async mascot() {
		await sharp(Buffer.from(MASCOT_SVG)).png({ compressionLevel: 9 }).toFile(out('mascot-hero-moonrim.png'));
		console.log('wrote mascot-hero-moonrim.png');
	},
	async portrait() {
		if (!existsSync(PORTRAIT_SOURCE)) {
			console.warn('portrait source not found, skipped:', PORTRAIT_SOURCE);
			return;
		}
		await sharp(PORTRAIT_SOURCE).resize(640, 640).png({ compressionLevel: 9 }).toFile(out('hero-portrait.png'));
		console.log('wrote hero-portrait.png');
	}
};

const selected = process.argv.slice(2);
for (const [name, job] of Object.entries(jobs)) {
	if (selected.length === 0 || selected.includes(name)) await job();
}
