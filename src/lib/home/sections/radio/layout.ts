/**
 * Geometry of the night radio art, in one place so the painted layers can be re-tuned without touching components.
 *
 * Every rect is in **layout units** of the body art: `size` is the reference size (its aspect must match the PNG),
 * and the component converts everything to percentages of the rendered body. When the final paintings land, open
 * them at any resolution, measure the rects in the same units (or scale your pixel values by `size.w / png width`),
 * and edit the numbers below. Nothing else needs to change.
 *
 * Two radio variants: `wide` (≥ 40rem, `radio-body.png`) and `tall` (phones, `radio-body-mobile.png`).
 * The placeholder generator (`assets/placeholders/make-placeholders.ts`) paints the placeholders from these numbers.
 */

export interface Rect {
	x: number;
	y: number;
	w: number;
	h: number;
}

export interface Point {
	x: number;
	y: number;
}

export interface RadioLayout {
	/** Reference size of the body art in layout units. Aspect ratio = PNG aspect ratio. */
	size: { w: number; h: number };
	/** The empty dial glass window painted into the body (scale, needle, and station logo are drawn on top). */
	dialGlass: Rect;
	/** Area inside the glass for the big glowing station logo, name, and handle. */
	glassContent: Rect;
	needle: {
		/** Center of rotation. */
		pivot: Point;
		/** Box of `radio-needle.png` in layout units; the pivot sits `pivotFromBottom` above its bottom edge, centered. */
		box: { w: number; h: number };
		pivotFromBottom: number;
		/** Degrees left and right of vertical that the dial covers (first station at -sweep, last at +sweep). */
		sweep: number;
	};
	/** Printed scale on the glass: tick marks at `tickRadius`, mini station logos at `logoRadius` (from the pivot). */
	scale: { tickRadius: number; logoRadius: number; logoSize: number };
	/** Dark display strip: @handle, follow link, station content, music controls. */
	displayStrip: Rect;
	/** Recess for the preset keys. Keys are laid out evenly inside it (see `keySlots`). */
	keyBank: Rect;
	/** Rows of keys in the bank. Columns = ceil(count / rows). */
	keyRows: number;
	/** Gap between keys and the bank's inner padding, in layout units. */
	keyGap: number;
	/** Tuning knob (`radio-knob.png`) center and radius, or `null` if the variant has none. */
	knob: { cx: number; cy: number; r: number } | null;
	/** Painted speaker grille (decorative; only used by the placeholder painter). */
	grille: Rect | null;
	/** Where the landscape horizon crosses the radio, as a fraction of the radio height from its top (may be < 0). */
	horizonAt: number;
}

export const RADIO_LAYOUT: { wide: RadioLayout; tall: RadioLayout } = {
	wide: {
		size: { w: 1000, h: 620 },
		dialGlass: { x: 452, y: 72, w: 396, h: 368 },
		glassContent: { x: 530, y: 186, w: 240, h: 214 },
		needle: { pivot: { x: 650, y: 424 }, box: { w: 30, h: 290 }, pivotFromBottom: 14, sweep: 34 },
		scale: { tickRadius: 256, logoRadius: 290, logoSize: 25 },
		displayStrip: { x: 78, y: 344, w: 336, h: 96 },
		keyBank: { x: 72, y: 466, w: 856, h: 98 },
		keyRows: 1,
		keyGap: 8,
		knob: { cx: 908, cy: 258, r: 40 },
		grille: { x: 78, y: 72, w: 336, h: 252 },
		horizonAt: 0.42
	},
	tall: {
		size: { w: 600, h: 940 },
		dialGlass: { x: 50, y: 58, w: 500, h: 380 },
		glassContent: { x: 130, y: 176, w: 340, h: 224 },
		needle: { pivot: { x: 300, y: 424 }, box: { w: 30, h: 330 }, pivotFromBottom: 14, sweep: 30 },
		scale: { tickRadius: 296, logoRadius: 330, logoSize: 28 },
		displayStrip: { x: 50, y: 458, w: 500, h: 140 },
		keyBank: { x: 44, y: 620, w: 512, h: 262 },
		keyRows: 2,
		keyGap: 10,
		knob: null,
		grille: null,
		horizonAt: -0.06
	}
};

/** Landscape plates. `horizonY`: the empty horizon band (waveform line) as a fraction of the plate height. */
export const LANDSCAPE = {
	wide: { w: 2560, h: 1440, horizonY: 0.57 },
	tall: { w: 1080, h: 2340, horizonY: 0.28 }
} as const;

/** Height of the waveform band around the horizon, as a fraction of the plate height. */
export const WAVEFORM_BAND = { wide: 0.2, tall: 0.12 } as const;

/** Breakpoint between the tall (phone) and the wide radio. Keep in sync with the media queries in Radio.svelte. */
export const WIDE_MEDIA = '(min-width: 40rem)';

/** Evenly distributed key slots inside the key bank, row by row, left to right. */
export function keySlots(layout: RadioLayout, count: number): Rect[] {
	const { keyBank: bank, keyRows: rows, keyGap: gap } = layout;
	const columns = Math.max(1, Math.ceil(count / rows));
	const w = (bank.w - gap * (columns + 1)) / columns;
	const h = (bank.h - gap * (rows + 1)) / rows;
	return Array.from({ length: count }, (_, index) => {
		const row = Math.floor(index / columns);
		const inRow = row === rows - 1 ? count - columns * (rows - 1) : columns;
		const column = index % columns;
		// Center a shorter last row
		const offset = ((columns - inRow) * (w + gap)) / 2;
		return { x: bank.x + gap + offset + column * (w + gap), y: bank.y + gap + row * (h + gap), w, h };
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
