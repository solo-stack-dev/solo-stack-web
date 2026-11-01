/**
 * Paints the PLACEHOLDER art layers of the night radio (until the painted masters land) and writes them with the
 * final file names into `../` (src/lib/home/sections/radio/assets/). Run from the repo root:
 *
 *     node src/lib/home/sections/radio/assets/placeholders/make-placeholders.ts
 *
 * - Radio layers: SVG with watercolor filters (turbulence blooms, edge darkening, granulation, wobbly ink line),
 *   rasterized by sharp. Geometry comes from `../../layout.ts`, so placeholders and code always agree.
 * - Landscapes: cropped and patched from the round-2 mockups (radio, text, and UI removed) as a stand-in plate.
 *
 * Uses the `sharp` that SvelteKit's enhanced-img already installs (no new dependency). Node ≥ 24 strips the types.
 */
import { readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LANDSCAPE, RADIO_LAYOUT, type RadioLayout, type Rect } from '../../layout.ts';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../../../../../../..');
const out = resolve(here, '..');
const mockups = join(root, 'docs/mockups/round-2/05-night-shift-radio');

const pnpmDir = join(root, 'node_modules/.pnpm');
const sharpDir = readdirSync(pnpmDir).find((name) => name.startsWith('sharp@'));
if (!sharpDir) throw new Error('sharp not found in node_modules/.pnpm (run pnpm install)');
const require = createRequire(import.meta.url);
// sharp is not a direct dependency, so there are no types to import; this script only needs a loose shape.
// oxlint-disable-next-line typescript/no-explicit-any
const sharp = require(join(pnpmDir, sharpDir, 'node_modules/sharp')) as (input?: unknown) => any;

const INK = '#1b1713';
const CREAM = '#f7ecc9';
const BUTTER = '#f1cf6e';
const OCHRE = '#d9a13a';

/** Shared watercolor filters. `seed` varies the blooms per layer. */
const defs = (seed: number) => `
	<filter id="wobble" x="-5%" y="-5%" width="110%" height="110%">
		<feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="${seed}" result="n"/>
		<feDisplacementMap in="SourceGraphic" in2="n" scale="3.2" xChannelSelector="R" yChannelSelector="G"/>
	</filter>
	<filter id="wash" color-interpolation-filters="sRGB" x="-2%" y="-2%" width="104%" height="104%">
		<feTurbulence type="fractalNoise" baseFrequency="0.011" numOctaves="4" seed="${seed + 1}" result="big"/>
		<feColorMatrix in="big" type="matrix" values="0 0 0 0 0.80  0 0 0 0 0.55  0 0 0 0 0.16  1.9 0 0 0 -0.92" result="blooms"/>
		<feComposite in="blooms" in2="SourceAlpha" operator="in" result="bloomsIn"/>
		<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="${seed + 2}" result="fine"/>
		<feColorMatrix in="fine" type="matrix" values="0 0 0 0 0.35  0 0 0 0 0.24  0 0 0 0 0.10  1.4 0 0 0 -0.62" result="grain"/>
		<feComposite in="grain" in2="SourceAlpha" operator="in" result="grainIn"/>
		<feGaussianBlur in="SourceAlpha" stdDeviation="7" result="blur"/>
		<feComposite in="SourceAlpha" in2="blur" operator="arithmetic" k2="1.6" k3="-1.6" result="rim"/>
		<feFlood flood-color="#9a6a22" flood-opacity="0.75"/>
		<feComposite in2="rim" operator="in" result="edge"/>
		<feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="bloomsIn"/><feMergeNode in="edge"/><feMergeNode in="grainIn"/></feMerge>
	</filter>
	<filter id="darkwash" color-interpolation-filters="sRGB" x="-2%" y="-2%" width="104%" height="104%">
		<feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" seed="${seed + 3}" result="big"/>
		<feColorMatrix in="big" type="matrix" values="0 0 0 0 0.2  0 0 0 0 0.19  0 0 0 0 0.17  0.8 0 0 0 -0.35" result="blooms"/>
		<feComposite in="blooms" in2="SourceAlpha" operator="in" result="bloomsIn"/>
		<feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="1" seed="${seed + 4}" result="fine"/>
		<feColorMatrix in="fine" type="matrix" values="0 0 0 0 0.9  0 0 0 0 0.8  0 0 0 0 0.6  0.6 0 0 0 -0.45" result="grain"/>
		<feComposite in="grain" in2="SourceAlpha" operator="in" result="grainIn"/>
		<feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="bloomsIn"/><feMergeNode in="grainIn"/></feMerge>
	</filter>
	<filter id="soft"><feGaussianBlur stdDeviation="6"/></filter>
	<radialGradient id="glass" cx="50%" cy="20%" r="85%">
		<stop offset="0" stop-color="#2a2b2c"/><stop offset="0.6" stop-color="#17181a"/><stop offset="1" stop-color="#0f1011"/>
	</radialGradient>
	<linearGradient id="body" x1="0" y1="0" x2="0" y2="1">
		<stop offset="0" stop-color="#f8e9bb"/><stop offset="0.55" stop-color="${BUTTER}"/><stop offset="1" stop-color="#e2b65a"/>
	</linearGradient>
	<linearGradient id="brass" x1="0" y1="0" x2="1" y2="1">
		<stop offset="0" stop-color="#f3d58a"/><stop offset="0.5" stop-color="${OCHRE}"/><stop offset="1" stop-color="#a8741f"/>
	</linearGradient>`;

const rr = (r: Rect, radius: number) => `x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="${radius}"`;

/** Arch path (flat bottom, round top) for the dial glass. */
function arch(r: Rect, corner = 18): string {
	const top = Math.min(r.w / 2, r.h * 0.62);
	return `M${r.x + corner} ${r.y + r.h} Q${r.x} ${r.y + r.h} ${r.x} ${r.y + r.h - corner} L${r.x} ${r.y + top} A${r.w / 2} ${top} 0 0 1 ${r.x + r.w} ${r.y + top} L${r.x + r.w} ${r.y + r.h - corner} Q${r.x + r.w} ${r.y + r.h} ${r.x + r.w - corner} ${r.y + r.h} Z`;
}

function grilleDots(r: Rect): string {
	let dots = '';
	for (let y = r.y + 14; y < r.y + r.h - 8; y += 11) {
		for (let x = r.x + 14 + ((y / 11) % 2) * 5; x < r.x + r.w - 8; x += 11) {
			dots += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.1"/>`;
		}
	}
	return dots;
}

function bodySvg(layout: RadioLayout, seed: number): string {
	const { w, h } = layout.size;
	const cab: Rect = { x: 22, y: 26, w: w - 44, h: h - 62 };
	const radius = Math.min(84, w * 0.09);
	const inner: Rect = { x: cab.x + 18, y: cab.y + 18, w: cab.w - 36, h: cab.h - 36 };
	const glass = layout.dialGlass;
	const strip = layout.displayStrip;
	const bank = layout.keyBank;
	const grille = layout.grille;
	const knob = layout.knob;
	const moonX = grille ? grille.x + grille.w / 2 : w / 2;
	const moonY = cab.y + 2;
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${w * 2}" height="${h * 2}" viewBox="0 0 ${w} ${h}">
	<defs>${defs(seed)}</defs>
	<!-- contact shadow -->
	<ellipse cx="${w / 2}" cy="${h - 22}" rx="${w * 0.46}" ry="14" fill="${INK}" opacity="0.55" filter="url(#soft)"/>
	<!-- feet -->
	<g filter="url(#wobble)" fill="#3a2f25" stroke="${INK}" stroke-width="3">
		<rect x="${cab.x + 70}" y="${cab.y + cab.h - 10}" width="70" height="30" rx="8"/>
		<rect x="${cab.x + cab.w - 140}" y="${cab.y + cab.h - 10}" width="70" height="30" rx="8"/>
	</g>
	<!-- cabinet wash -->
	<rect ${rr(cab, radius)} fill="url(#body)" filter="url(#wash)"/>
	<!-- top light and lower shade washes -->
	<rect x="${cab.x + 40}" y="${cab.y + 8}" width="${cab.w - 80}" height="16" rx="8" fill="${CREAM}" opacity="0.6" filter="url(#soft)"/>
	<rect x="${cab.x + 30}" y="${cab.y + cab.h - 40}" width="${cab.w - 60}" height="26" rx="12" fill="#a7742a" opacity="0.35" filter="url(#soft)"/>
	<!-- ink: cabinet and panel lines -->
	<g fill="none" stroke="${INK}" stroke-linecap="round" stroke-linejoin="round" filter="url(#wobble)">
		<rect ${rr(cab, radius)} stroke-width="4.5"/>
		<rect ${rr(inner, radius - 16)} stroke-width="1.6" opacity="0.45"/>
		<path d="M${cab.x + cab.w - 30} ${cab.y + 120} q 8 ${cab.h * 0.3} -4 ${cab.h * 0.62}" stroke-width="1.4" opacity="0.4"/>
		<path d="M${cab.x + 34} ${cab.y + 150} q -6 ${cab.h * 0.25} 2 ${cab.h * 0.5}" stroke-width="1.2" opacity="0.35"/>
	</g>
	<!-- moon emblem -->
	<g filter="url(#wobble)">
		<circle cx="${moonX}" cy="${moonY}" r="13" fill="${CREAM}" stroke="${INK}" stroke-width="2.5"/>
		<circle cx="${moonX + 6}" cy="${moonY - 4}" r="11" fill="${OCHRE}" opacity="0.7"/>
	</g>
	${
		grille
			? `<!-- speaker grille -->
	<rect ${rr(grille, 26)} fill="#26211c" filter="url(#darkwash)"/>
	<g fill="#d8b46a" opacity="0.32" filter="url(#wobble)">${grilleDots(grille)}</g>
	<rect ${rr(grille, 26)} fill="none" stroke="${INK}" stroke-width="3.5" filter="url(#wobble)"/>`
			: ''
	}
	<!-- display strip window -->
	<rect ${rr({ x: strip.x - 6, y: strip.y - 6, w: strip.w + 12, h: strip.h + 12 }, 18)} fill="url(#brass)" filter="url(#wash)"/>
	<rect ${rr(strip, 13)} fill="#141516" filter="url(#darkwash)"/>
	<rect ${rr(strip, 13)} fill="none" stroke="${INK}" stroke-width="3" filter="url(#wobble)"/>
	<!-- dial glass with brass rim -->
	<path d="${arch({ x: glass.x - 9, y: glass.y - 9, w: glass.w + 18, h: glass.h + 18 }, 24)}" fill="url(#brass)" filter="url(#wash)"/>
	<path d="${arch(glass)}" fill="url(#glass)" filter="url(#darkwash)"/>
	<path d="${arch(glass)}" fill="none" stroke="${INK}" stroke-width="3.5" filter="url(#wobble)"/>
	<path d="${arch({ x: glass.x - 9, y: glass.y - 9, w: glass.w + 18, h: glass.h + 18 }, 24)}" fill="none" stroke="${INK}" stroke-width="2.5" filter="url(#wobble)"/>
	<path d="M${glass.x + glass.w * 0.18} ${glass.y + glass.h * 0.42} Q${glass.x + glass.w * 0.3} ${glass.y + glass.h * 0.12} ${glass.x + glass.w * 0.6} ${glass.y + glass.h * 0.06}" stroke="${CREAM}" stroke-width="10" stroke-linecap="round" fill="none" opacity="0.07" filter="url(#soft)"/>
	<!-- key bank recess -->
	<rect ${rr(bank, 16)} fill="#2c251e" filter="url(#darkwash)"/>
	<rect x="${bank.x + 6}" y="${bank.y + 3}" width="${bank.w - 12}" height="10" rx="5" fill="#000" opacity="0.35" filter="url(#soft)"/>
	<rect ${rr(bank, 16)} fill="none" stroke="${INK}" stroke-width="3.5" filter="url(#wobble)"/>
	${
		knob
			? `<!-- knob seat -->
	<circle cx="${knob.cx}" cy="${knob.cy}" r="${knob.r + 9}" fill="#3a2f24" opacity="0.85" filter="url(#darkwash)"/>
	<circle cx="${knob.cx}" cy="${knob.cy}" r="${knob.r + 9}" fill="none" stroke="${INK}" stroke-width="2.5" filter="url(#wobble)"/>`
			: ''
	}
	<!-- loose hatching in the shade -->
	<g stroke="${INK}" stroke-width="1.3" opacity="0.28" stroke-linecap="round" filter="url(#wobble)">
		${Array.from({ length: 9 }, (_, i) => `<path d="M${cab.x + cab.w - 60 + i * 5} ${cab.y + cab.h - 34} l 16 -22"/>`).join('')}
		${Array.from({ length: 7 }, (_, i) => `<path d="M${cab.x + 40 + i * 6} ${cab.y + cab.h - 30} l 14 -20"/>`).join('')}
	</g>
</svg>`;
}

function needleSvg(layout: RadioLayout): string {
	// One needle image for both variants; drawn with the wide box (the tall box has nearly the same aspect).
	const { w, h } = layout.needle.box;
	const p = layout.needle.pivotFromBottom;
	const cx = w / 2;
	const py = h - p;
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${w * 4}" height="${h * 4}" viewBox="0 0 ${w} ${h}">
	<defs>${defs(41)}</defs>
	<g filter="url(#wobble)">
		<path d="M${cx - 2.6} ${py} L${cx - 0.9} 6 L${cx} 1 L${cx + 0.9} 6 L${cx + 2.6} ${py} Z" fill="#b8452c" stroke="${INK}" stroke-width="1.1" stroke-linejoin="round"/>
		<path d="M${cx} 4 L${cx} ${py - 30}" stroke="${CREAM}" stroke-width="0.6" opacity="0.6"/>
		<circle cx="${cx}" cy="${py}" r="${p - 1}" fill="url(#brass)" stroke="${INK}" stroke-width="1.6"/>
		<circle cx="${cx - 3}" cy="${py - 3}" r="3" fill="${CREAM}" opacity="0.6"/>
	</g>
</svg>`;
}

function keySvg(pressed: boolean): string {
	const w = 100;
	const h = 130;
	const face = pressed ? { y: 22, h: 100 } : { y: 6, h: 104 };
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${w * 2}" height="${h * 2}" viewBox="0 0 ${w} ${h}">
	<defs>${defs(pressed ? 61 : 51)}</defs>
	<!-- key skirt (side) -->
	<rect x="5" y="${face.y + 10}" width="${w - 10}" height="${h - face.y - 14}" rx="12" fill="#b88a3d" filter="url(#wash)"/>
	<rect x="5" y="${face.y + 10}" width="${w - 10}" height="${h - face.y - 14}" rx="12" fill="none" stroke="${INK}" stroke-width="2.6" filter="url(#wobble)"/>
	<!-- key face -->
	<rect x="5" y="${face.y}" width="${w - 10}" height="${face.h - 10}" rx="12" fill="${pressed ? '#efd795' : '#fbf0d0'}" filter="url(#wash)"/>
	${pressed ? `<rect x="9" y="${face.y + 4}" width="${w - 18}" height="${face.h - 18}" rx="10" fill="none" stroke="${BUTTER}" stroke-width="3" opacity="0.9" filter="url(#soft)"/>` : ''}
	<rect x="5" y="${face.y}" width="${w - 10}" height="${face.h - 10}" rx="12" fill="none" stroke="${INK}" stroke-width="2.8" filter="url(#wobble)"/>
	<path d="M14 ${face.y + 8} h ${w - 40}" stroke="#fff8e6" stroke-width="3" stroke-linecap="round" opacity="${pressed ? 0.2 : 0.55}" filter="url(#soft)"/>
</svg>`;
}

function knobSvg(): string {
	const s = 100;
	const c = s / 2;
	const ridges = Array.from({ length: 28 }, (_, i) => {
		const a = (i / 28) * Math.PI * 2;
		return `<path d="M${c + Math.cos(a) * 36} ${c + Math.sin(a) * 36} L${c + Math.cos(a) * 44} ${c + Math.sin(a) * 44}"/>`;
	}).join('');
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${s * 2}" height="${s * 2}" viewBox="0 0 ${s} ${s}">
	<defs>${defs(71)}</defs>
	<circle cx="${c}" cy="${c}" r="45" fill="url(#brass)" filter="url(#wash)"/>
	<g stroke="${INK}" stroke-width="1.4" opacity="0.6" filter="url(#wobble)">${ridges}</g>
	<circle cx="${c}" cy="${c}" r="32" fill="#f3e2b0" filter="url(#wash)"/>
	<g fill="none" stroke="${INK}" filter="url(#wobble)"><circle cx="${c}" cy="${c}" r="45" stroke-width="2.6"/><circle cx="${c}" cy="${c}" r="32" stroke-width="1.8"/></g>
	<path d="M${c} ${c - 30} L${c} ${c - 14}" stroke="${INK}" stroke-width="4" stroke-linecap="round" filter="url(#wobble)"/>
	<circle cx="${c - 10}" cy="${c - 12}" r="7" fill="#fffaf0" opacity="0.45" filter="url(#soft)"/>
</svg>`;
}

async function png(svg: string, file: string) {
	await sharp(Buffer.from(svg)).png({ palette: true, quality: 90, effort: 10, compressionLevel: 9 }).toFile(join(out, file));
	process.stdout.write(`wrote ${file}\n`);
}

/** Desktop plate: the mockup with the radio, title, and UI patched out by mirrored neighbor regions. */
async function landscapeWide() {
	const src = join(mockups, '06-night-radio-desktop-idle.png');
	const H = 941;
	const TOP = 300;
	const cut = (input: Buffer, left: number, top: number, width: number, height: number, flop = false) =>
		sharp(input).extract({ left, top, width, height }).flop(flop).png().toBuffer();
	const original = await sharp(src).png().toBuffer();
	// 1. Clean the UI out of the side strips first: nav, menu icon, "TODO(COPY)" label.
	const rockPatch = await cut(original, 1380, 880, 140, 40);
	const starless = await cut(original, 1600, 90, 60, 40);
	const clean = await sharp(original)
		.composite([
			{ input: rockPatch, left: 1500, top: 878 },
			{ input: starless, left: 1572, top: 24 }
		])
		.png()
		.toBuffer();
	// 2. Sky above y=TOP from the clean upper middle (no moon, no title), mirrored across the left half.
	// The radio top starts at y≈270 in the mockup, so stretch the clean sky above it to TOP.
	const FEATHER = 70;
	const featherMask = Buffer.from(
		`<svg xmlns="http://www.w3.org/2000/svg" width="410" height="${TOP + FEATHER}"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="${(TOP - 20) / (TOP + FEATHER)}" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs><rect width="410" height="${TOP + FEATHER}" fill="url(#g)"/></svg>`
	);
	const sky = await sharp(clean)
		.extract({ left: 880, top: 0, width: 410, height: 262 })
		.resize(410, TOP + FEATHER, { fit: 'fill' })
		.ensureAlpha()
		.composite([{ input: featherMask, blend: 'dest-in' }])
		.png()
		.toBuffer();
	const skyFlop = await sharp(sky).flop().png().toBuffer();
	// 3. Landscape below TOP: left strip 0..325, right strip 1275..1672 (397). The radio sat between them.
	const leftFlop = await cut(clean, 0, TOP, 325, H - TOP, true);
	const rightFlop = await cut(clean, 1275, TOP, 397, H - TOP, true);
	const middle = await sharp(clean)
		.extract({ left: 1290, top: TOP, width: 220, height: H - TOP })
		.resize(228, H - TOP, { fit: 'fill' })
		.png()
		.toBuffer();
	const composite = await sharp(clean)
		.composite([
			{ input: leftFlop, left: 325, top: TOP },
			{ input: middle, left: 650, top: TOP },
			{ input: rightFlop, left: 878, top: TOP },
			{ input: skyFlop, left: 0, top: 0 },
			{ input: sky, left: 410, top: 0 },
			{ input: skyFlop, left: 640, top: 0 },
			{ input: sky, left: 870, top: 0 }
		])
		.png()
		.toBuffer();
	// Soften the patch seams, then upscale to the final plate size.
	await sharp(composite)
		.resize(LANDSCAPE.wide.w, LANDSCAPE.wide.h, { fit: 'fill', kernel: 'lanczos3' })
		.blur(1.2)
		.png({ palette: true, quality: 90, effort: 10, compressionLevel: 9 })
		.toFile(join(out, 'radio-landscape.png'));
	process.stdout.write('wrote radio-landscape.png\n');
	return composite;
}

/** Phone plate: right part of the desktop plate (moon, lake) with the lake line at horizonY, fading into ink below. */
async function landscapeTall(wide: Buffer) {
	const { w, h, horizonY } = LANDSCAPE.tall;
	// Right 900 px of the 1672x941 composite (moon, lake); the lake line sits at ~0.57 of its height.
	const cropH = Math.round((941 / 900) * w);
	const crop = await sharp(wide).extract({ left: 772, top: 0, width: 900, height: 941 }).resize(w, cropH).png().toBuffer();
	const shift = Math.round(horizonY * h) - Math.round(0.57 * cropH);
	const skip = Math.max(0, -shift);
	const visibleH = Math.min(cropH - skip, h);
	const visible = await sharp(crop).extract({ left: 0, top: skip, width: w, height: visibleH }).png().toBuffer();
	const end = Math.max(0, shift) + visibleH;
	const fade = Buffer.from(
		`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
			<defs><linearGradient id="f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0e0f10" stop-opacity="0"/><stop offset="1" stop-color="#0e0f10"/></linearGradient></defs>
			<rect y="${end - 420}" width="${w}" height="420" fill="url(#f)"/>
			<rect y="${end - 1}" width="${w}" height="${h}" fill="#0e0f10"/>
		</svg>`
	);
	const flat = await sharp({ create: { width: w, height: h, channels: 3, background: '#0e0f10' } })
		.composite([
			{ input: visible, left: 0, top: Math.max(0, shift) },
			{ input: fade, left: 0, top: 0 }
		])
		.png()
		.toBuffer();
	await sharp(flat).blur(1.2).png({ palette: true, quality: 90, effort: 10, compressionLevel: 9 }).toFile(join(out, 'radio-landscape-mobile.png'));
	process.stdout.write('wrote radio-landscape-mobile.png\n');
}

await png(bodySvg(RADIO_LAYOUT.wide, 3), 'radio-body.png');
await png(bodySvg(RADIO_LAYOUT.tall, 13), 'radio-body-mobile.png');
await png(needleSvg(RADIO_LAYOUT.wide), 'radio-needle.png');
await png(keySvg(false), 'radio-key.png');
await png(keySvg(true), 'radio-key-pressed.png');
await png(knobSvg(), 'radio-knob.png');
await landscapeTall(await landscapeWide());
