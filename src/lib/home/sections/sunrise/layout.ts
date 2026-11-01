/**
 * Every rect, anchor, and scroll range of the 06:00 sunrise footer. Change numbers here, never in the component.
 *
 * Coordinates are percentages of the stage: `x`/`w` of its width, `y`/`h` of its height. Desktop stage = 16:9
 * (`sunrise-sky.png`, 2560×1440), anchored to the bottom of the section behind the footer bar. Mobile stage = a square
 * scene band in the flow, right above the footer bar. The paper sky (`sunrise-sky-mobile.png` on mobile) and the night
 * edge cover the whole section. Heights of image layers derive from the art's aspect ratio, so swapping art of the
 * same aspect needs no change here.
 *
 * Scroll: `--sunrise` goes 0 → 1 while the section scrolls in (top edge at the viewport bottom → the page end).
 */

export interface Rect {
	x: number;
	y: number;
	w: number;
	h: number;
}

export type Breakpoint = 'desktop' | 'mobile';

/** Intrinsic sizes of the art (only the aspect ratios matter). */
export const ART = {
	stage: {
		desktop: { width: 2560, height: 1440 },
		mobile: { width: 1080, height: 1080 }
	},
	nightEdge: { width: 2560, height: 1000 },
	valley: { width: 2560, height: 620 },
	cliffPath: { width: 1684, height: 476 },
	coffee: { width: 300, height: 206 },
	/** Each walk frame `mascot-sunrise-walk@1..@4.png`; @1 doubles as the resting pose. */
	mascot: { width: 280, height: 495 }
} as const;

interface Placement {
	/** The sun disc (CSS), `w` = diameter. */
	sun: Omit<Rect, 'h'>;
	valley: Omit<Rect, 'h'>;
	cliffPath: Omit<Rect, 'h'>;
	coffee: Omit<Rect, 'h'>;
	/** Steam above the cup (SVG box). */
	steam: Rect;
	/** Mascot at rest (the end of the walk). */
	mascot: Omit<Rect, 'h'>;
	/** Night edge: width/left in % of the section; vertical travel in % of its own height (from → to). */
	nightEdge: { x: number; w: number; from: number; to: number };
}

const PLACEMENT: Record<Breakpoint, Placement> = {
	desktop: {
		sun: { x: 77.4, y: 48.3, w: 12.6 },
		valley: { x: 0, y: 45, w: 100 },
		cliffPath: { x: 0, y: 55.3, w: 65.8 },
		coffee: { x: 9.3, y: 53.7, w: 9 },
		steam: { x: 11.4, y: 37, w: 4.6, h: 17.5 },
		mascot: { x: 33.5, y: 41.3, w: 11.1 },
		nightEdge: { x: 0, w: 100, from: 18, to: -46 }
	},
	mobile: {
		sun: { x: 72.2, y: 31.8, w: 21.7 },
		valley: { x: -70, y: 34.7, w: 200 },
		cliffPath: { x: -12, y: 54.2, w: 140 },
		coffee: { x: 6, y: 49, w: 17 },
		steam: { x: 9.5, y: 31.6, w: 8, h: 18.4 },
		mascot: { x: 33, y: 35.5, w: 24 },
		nightEdge: { x: -80, w: 260, from: 40, to: -36 }
	}
};

/** Mascot walk: starts at this `--sunrise` value, covers `distance` % of its own width, and steps `steps` frames. */
export const WALK = { start: 0.3, distance: 65, steps: 16 } as const;

const stageAspect = (bp: Breakpoint) => ART.stage[bp].width / ART.stage[bp].height;
const heightOf = (bp: Breakpoint, w: number, art: { width: number; height: number }) => w * (art.height / art.width) * stageAspect(bp);
const round = (value: number) => Math.round(value * 1000) / 1000;

export interface SunriseLayout {
	sun: Rect;
	valley: Rect;
	cliffPath: Rect;
	coffee: Rect;
	steam: Rect;
	mascot: Rect;
	nightEdge: Placement['nightEdge'];
}

function build(bp: Breakpoint): SunriseLayout {
	const place = PLACEMENT[bp];
	return {
		sun: { ...place.sun, h: place.sun.w * stageAspect(bp) },
		valley: { ...place.valley, h: heightOf(bp, place.valley.w, ART.valley) },
		cliffPath: { ...place.cliffPath, h: heightOf(bp, place.cliffPath.w, ART.cliffPath) },
		coffee: { ...place.coffee, h: heightOf(bp, place.coffee.w, ART.coffee) },
		steam: place.steam,
		mascot: { ...place.mascot, h: heightOf(bp, place.mascot.w, ART.mascot) },
		nightEdge: place.nightEdge
	};
}

export const SUNRISE_LAYOUT: Record<Breakpoint, SunriseLayout> = { desktop: build('desktop'), mobile: build('mobile') };

const pct = (value: number) => `${round(value)}%`;

/** Inline CSS vars for an element placed on both stages: `--dx --dy --dw --dh` (desktop) and `--mx …` (mobile). */
export function placeVars(desktop: Rect, mobile: Rect): string {
	return [
		`--dx: ${pct(desktop.x)}; --dy: ${pct(desktop.y)}; --dw: ${pct(desktop.w)}; --dh: ${pct(desktop.h)}`,
		`--mx: ${pct(mobile.x)}; --my: ${pct(mobile.y)}; --mw: ${pct(mobile.w)}; --mh: ${pct(mobile.h)}`
	].join('; ');
}

/** CSS vars of the night edge (section-relative width/left, travel in % of its own height). */
export function nightEdgeVars(): string {
	const { desktop: d, mobile: m } = SUNRISE_LAYOUT;
	return [
		`--dx: ${pct(d.nightEdge.x)}; --dw: ${pct(d.nightEdge.w)}; --d-from: ${pct(d.nightEdge.from)}; --d-to: ${pct(d.nightEdge.to)}`,
		`--mx: ${pct(m.nightEdge.x)}; --mw: ${pct(m.nightEdge.w)}; --m-from: ${pct(m.nightEdge.from)}; --m-to: ${pct(m.nightEdge.to)}`
	].join('; ');
}

/** Legal pages linked in the footer. TODO(lead): the routes do not exist yet (see Sunrise.svelte). */
export const LEGAL_LINKS = [
	{ id: 'imprint', path: '/impressum' },
	{ id: 'privacy', path: '/datenschutz' },
	{ id: 'contact', path: '/kontakt' }
] as const;
