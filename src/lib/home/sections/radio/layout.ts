/**
 * Geometry of the night radio art, in one place so the painted layers can be re-tuned without touching components.
 *
 * Every rect is in **pixels of the body image** (`size` = the WebP's size, written by `assets/build-art.ts`, which
 * also prints the measured rects). The component converts everything to percentages of the rendered body.
 *
 * Two radio variants: `wide` (≥ 40rem, `radio-body.webp`: grille, glass, knobs, one row of keys) and `tall` (phones,
 * `radio-body-mobile.webp`: same radio without the grille, two rows of keys).
 *
 * The dial is a slide rule: the needle slides horizontally along the top of the glass (`needle.x0…x1` is the travel of
 * its center), the printed scale and the mini station logos sit in the same band, the tuned station shows below it.
 */

export interface Rect {
	x: number;
	y: number;
	w: number;
	h: number;
}

export interface Knob {
	cx: number;
	cy: number;
	r: number;
}

export interface RadioLayout {
	/** Pixel size of the body image. */
	size: { w: number; h: number };
	/** The painted dial glass (the slider covers it). */
	dialGlass: Rect;
	needle: {
		/** Travel of the needle's center line: dial 0 → x0, dial max → x1. */
		x0: number;
		x1: number;
		top: number;
		/** Box of `radio-needle.webp`. */
		w: number;
		h: number;
	};
	/** Printed scale: a rule at `rule`, minor ticks `minorTick` long, station ticks from `markTop`, logos centered on `logoY`. */
	scale: { rule: number; minorTick: number; markTop: number; logoY: number; logoSize: number };
	/** Area inside the glass for the big glowing station logo, name, handle, and live content. */
	glassContent: Rect;
	/** Dark display window between the knobs: @handle, follow link, music controls. */
	displayStrip: Rect;
	/** Interior of the long key recess. Keys are laid out evenly inside it (see `keySlots`). */
	keyBank: Rect;
	/** Rows of keys in the bank. Columns = ceil(count / rows). */
	keyRows: number;
	/** Gap between keys and the bank's inner padding. */
	keyGap: number;
	/** Painted knob seats (`radio-knob.webp` overlays): volume on the left, tuning on the right. */
	knobs: { volume: Knob; tuning: Knob };
	/** Where the landscape horizon crosses the radio, as a fraction of the radio height from its top (may be < 0). */
	horizonAt: number;
}

/** Aspect (width / height) of `radio-key.webp` and `radio-key-pressed.webp`. */
export const KEY_ASPECT = 128 / 112;

export const RADIO_LAYOUT: { wide: RadioLayout; tall: RadioLayout } = {
	wide: {
		size: { w: 1800, h: 1081 },
		dialGlass: { x: 564, y: 129, w: 1100, h: 364 },
		needle: { x0: 650, x1: 1580, top: 146, w: 12, h: 150 },
		scale: { rule: 262, minorTick: 12, markTop: 236, logoY: 196, logoSize: 46 },
		glassContent: { x: 610, y: 296, w: 1008, h: 186 },
		displayStrip: { x: 748, y: 596, w: 707, h: 86 },
		keyBank: { x: 149, y: 793, w: 1501, h: 130 },
		keyRows: 1,
		keyGap: 12,
		knobs: { volume: { cx: 614.4, cy: 637.4, r: 91 }, tuning: { cx: 1601.6, cy: 637.4, r: 91 } },
		horizonAt: 0.281
	},
	tall: {
		size: { w: 1200, h: 1187 },
		dialGlass: { x: 119, y: 112, w: 962, h: 318 },
		needle: { x0: 194, x1: 1007, top: 124, w: 11, h: 106 },
		scale: { rule: 214, minorTick: 10, markTop: 192, logoY: 156, logoSize: 42 },
		glassContent: { x: 150, y: 226, w: 900, h: 196 },
		displayStrip: { x: 280, y: 499, w: 618, h: 126 },
		keyBank: { x: 120, y: 697, w: 959, h: 347 },
		keyRows: 2,
		keyGap: 14,
		knobs: { volume: { cx: 163.4, cy: 556.4, r: 80 }, tuning: { cx: 1026.5, cy: 556.4, r: 80 } },
		horizonAt: -0.08
	}
};

/**
 * Landscape plates, measured on the full painted master (`w` × `h` = its aspect). `horizonY`: the painted mist band
 * (waveform baseline) as a fraction of the master height. `cropTop`: fraction of the master cut off at the top by
 * `assets/build-art.ts` (sky and moon); the WebP holds only the rest and is drawn at that offset inside the stage.
 */
export const LANDSCAPE = {
	wide: { w: 2560, h: 1440, horizonY: 748 / 1440, cropTop: 480 / 1440 },
	tall: { w: 1080, h: 2340, horizonY: 950 / 2340, cropTop: 585 / 2340 }
} as const;

/** Height of the waveform band around the horizon, as a fraction of the plate height. */
export const WAVEFORM_BAND = { wide: 0.16, tall: 0.09 } as const;

/** Breakpoint between the tall (phone) and the wide radio. Keep in sync with the media queries in Radio.svelte. */
export const WIDE_MEDIA = '(min-width: 40rem)';

/** Key slots inside the key bank, row by row, left to right, keeping the key art's aspect; a shorter last row is centered. */
export function keySlots(layout: RadioLayout, count: number): Rect[] {
	const { keyBank: bank, keyRows: rows, keyGap: gap } = layout;
	const columns = Math.max(1, Math.ceil(count / rows));
	const cellW = (bank.w - gap * (columns + 1)) / columns;
	const cellH = (bank.h - gap * (rows + 1)) / rows;
	const w = Math.min(cellW, cellH * KEY_ASPECT);
	const h = w / KEY_ASPECT;
	// Spread the leftover space evenly around the grid
	const spareX = bank.w - (columns * w + (columns - 1) * gap);
	const spareY = bank.h - (rows * h + (rows - 1) * gap);
	return Array.from({ length: count }, (_, index) => {
		const row = Math.floor(index / columns);
		const inRow = row === rows - 1 ? count - columns * (rows - 1) : columns;
		const column = index % columns;
		const offset = ((columns - inRow) * (w + gap)) / 2;
		return { x: bank.x + spareX / 2 + offset + column * (w + gap), y: bank.y + spareY / 2 + row * (h + gap), w, h };
	});
}

/** Rect → CSS percentages relative to the body. */
export function toPercent(layout: RadioLayout, rect: Rect): { left: string; top: string; width: string; height: string } {
	const { w, h } = layout.size;
	return {
		left: `${(rect.x / w) * 100}%`,
		top: `${(rect.y / h) * 100}%`,
		width: `${(rect.w / w) * 100}%`,
		height: `${(rect.h / h) * 100}%`
	};
}
