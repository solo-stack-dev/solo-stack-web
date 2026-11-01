/**
 * The painted mascot for Canvas 2D games (docs/art/mascot/mascot-game-sprite-master.png, built by tools/build-sprite.mjs).
 * Shared by the candidates: stack-to-moon imports it from here, so keep it free of moon-planet specifics.
 *
 * The sheet starts loading when this module is first imported (the game chunk loads on the play click) and is drawn
 * only once decoded: until then `drawMascotSprite` returns false and the caller draws its vector placeholder.
 */
import sheetUrl from './assets/mascot-game-sheet.webp';
import { MASCOT_SHEET_ANCHOR, MASCOT_SHEET_LEVELS } from './sprite-sheet.ts';

/** Width / height of the figure (all levels share it). */
export const MASCOT_SPRITE_ASPECT = MASCOT_SHEET_LEVELS[0].w / MASCOT_SHEET_LEVELS[0].h;

let sheet: HTMLImageElement | null = null;
let ready = false;

function load() {
	if (sheet || typeof Image === 'undefined') return;
	sheet = new Image();
	sheet.decoding = 'async';
	sheet.src = sheetUrl;
	sheet.decode().then(
		() => (ready = true),
		() => (ready = false) // keep the vector placeholder
	);
}

load();

/** True once the sheet is decoded and drawable. */
export function mascotSpriteReady(): boolean {
	load();
	return ready;
}

/**
 * Draws the mascot facing +x with its feet (bottom center) at the current origin, `height` tall in current units.
 * Mirror, squash, or rotate with the context transform before calling. Picks the smallest mip level that still covers
 * the device pixels it lands on, so it stays crisp at any DPR and scale. Returns false while the sheet is not ready.
 */
export function drawMascotSprite(ctx: CanvasRenderingContext2D, height: number): boolean {
	if (!ready || !sheet) return false;
	const m = ctx.getTransform();
	const devicePx = height * Math.hypot(m.c, m.d);
	let level: (typeof MASCOT_SHEET_LEVELS)[number] = MASCOT_SHEET_LEVELS[0];
	for (const candidate of MASCOT_SHEET_LEVELS) if (candidate.h >= devicePx * 0.92) level = candidate;
	const width = height * MASCOT_SPRITE_ASPECT;
	const smoothing = ctx.imageSmoothingEnabled;
	const quality = ctx.imageSmoothingQuality;
	ctx.imageSmoothingEnabled = true;
	ctx.imageSmoothingQuality = 'high';
	ctx.drawImage(sheet, level.x, level.y, level.w, level.h, -width * MASCOT_SHEET_ANCHOR.x, -height * MASCOT_SHEET_ANCHOR.y, width, height);
	ctx.imageSmoothingEnabled = smoothing;
	ctx.imageSmoothingQuality = quality;
	return true;
}
