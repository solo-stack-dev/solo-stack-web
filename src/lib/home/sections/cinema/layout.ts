/**
 * Every rect and anchor of the 04:00 cinema scene, so the painted layers, the video window, the beam, and the caption
 * stay aligned when the final art replaces the placeholders. Change numbers here, never in the component.
 *
 * Coordinates are percentages of the stage: `x`/`w` of its width, `y`/`h` of its height. Desktop stage = 16:9
 * (`cinema-landscape.png`, 2560×1440), mobile stage = 1080×2340 (`cinema-landscape-mobile.png`). Heights of image
 * layers are derived from the art's aspect ratio, so swapping art of the same aspect needs no change here.
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

export type Breakpoint = 'desktop' | 'mobile';

/** Below this width the mobile composition is used (frame on top, cliff below, vertical beam). Keep in sync with the CSS. */
export const MOBILE_MAX = '47.99rem';

/** Intrinsic sizes of the art (only the aspect ratios matter) and anchors inside the art, as fractions. */
export const ART = {
	stage: {
		desktop: { width: 2560, height: 1440 },
		mobile: { width: 1080, height: 2340 }
	},
	/** `cinema-frame.png`: painted glowing border; the transparent 16:9 window is where the thumbnail or iframe sits. */
	frame: { width: 1600, height: 1040, window: { x: 96, y: 120, width: 1408, height: 792 } },
	/** `cinema-cliff.png`: transparent cliff with the open laptop. `laptop` = where the light leaves the screen. */
	cliff: { width: 1204, height: 548, laptop: { x: 0.509, y: 0.126 } },
	/** `mascot-cinema-sitting.png` */
	mascot: { width: 260, height: 291 }
} as const;

interface Placement {
	/** Video window (16:9). `h` is derived. */
	window: Omit<Rect, 'h'>;
	/** Top of the caption (title + link) and its alignment. */
	caption: { y: number; align: 'start' | 'center' };
	cliff: Omit<Rect, 'h'>;
	mascot: Omit<Rect, 'h'>;
	/** The far side of the light cone (two points, hidden behind the frame). The apex is the laptop. */
	beamEnds: [Point, Point];
}

const PLACEMENT: Record<Breakpoint, Placement> = {
	desktop: {
		window: { x: 39.5, y: 10, w: 51 },
		caption: { y: 64, align: 'start' },
		cliff: { x: 0, y: 62, w: 47 },
		mascot: { x: 8.4, y: 51, w: 10.2 },
		beamEnds: [
			{ x: 47, y: 13 },
			{ x: 47, y: 58 }
		]
	},
	mobile: {
		window: { x: 4, y: 24, w: 92 },
		caption: { y: 49.5, align: 'center' },
		cliff: { x: -8, y: 74.5, w: 92 },
		mascot: { x: 6, y: 63.5, w: 26 },
		beamEnds: [
			{ x: 14, y: 45 },
			{ x: 86, y: 45 }
		]
	}
};

/** Stage width / height. */
const stageAspect = (bp: Breakpoint) => ART.stage[bp].width / ART.stage[bp].height;

/** Height (in % of stage height) of an image placed `w` % wide. */
const heightOf = (bp: Breakpoint, w: number, art: { width: number; height: number }) => w * (art.height / art.width) * stageAspect(bp);

const round = (value: number) => Math.round(value * 1000) / 1000;

export interface CinemaLayout {
	window: Rect;
	frame: Rect;
	caption: { x: number; y: number; w: number; align: 'start' | 'center' };
	cliff: Rect;
	mascot: Rect;
	beam: { apex: Point; ends: [Point, Point] };
	dust: (Point & { size: number; delay: number; duration: number; drift: Point })[];
}

function build(bp: Breakpoint): CinemaLayout {
	const place = PLACEMENT[bp];
	const { frame: frameArt, cliff: cliffArt, mascot: mascotArt } = ART;

	const window = { ...place.window, h: heightOf(bp, place.window.w, { width: 16, height: 9 }) };

	// The frame art is scaled so its transparent window matches `window` exactly.
	const scale = window.w / frameArt.window.width;
	const frameW = frameArt.width * scale;
	const frame = {
		x: window.x - frameArt.window.x * scale,
		y: window.y - (frameArt.window.y / frameArt.window.height) * window.h,
		w: frameW,
		h: heightOf(bp, frameW, frameArt)
	};

	const cliff = { ...place.cliff, h: heightOf(bp, place.cliff.w, cliffArt) };
	const mascot = { ...place.mascot, h: heightOf(bp, place.mascot.w, mascotArt) };
	const apex = { x: cliff.x + cliffArt.laptop.x * cliff.w, y: cliff.y + cliffArt.laptop.y * cliff.h };

	// A few dust motes spread through the cone (deterministic, so SSR and client agree).
	const [a, b] = place.beamEnds;
	const dust = [0.22, 0.3, 0.38, 0.45, 0.52, 0.6, 0.68, 0.76, 0.84].map((t, index) => {
		const side = (((index * 7) % 9) / 8) * 1.2 - 0.6; // -0.6…0.6 across the cone
		const far = { x: (a.x + b.x) / 2 + ((b.x - a.x) / 2) * side, y: (a.y + b.y) / 2 + ((b.y - a.y) / 2) * side };
		return {
			x: round(apex.x + (far.x - apex.x) * t),
			y: round(apex.y + (far.y - apex.y) * t),
			size: 2 + (index % 3),
			delay: -((index * 1.7) % 9),
			duration: 7 + ((index * 3) % 6),
			drift: { x: ((index % 4) - 1.5) * 10, y: -14 - (index % 3) * 8 }
		};
	});

	return {
		window,
		frame,
		caption: { x: window.x, y: place.caption.y, w: window.w, align: place.caption.align },
		cliff,
		mascot,
		beam: { apex, ends: place.beamEnds },
		dust
	};
}

export const CINEMA_LAYOUT: Record<Breakpoint, CinemaLayout> = { desktop: build('desktop'), mobile: build('mobile') };

const pct = (value: number) => `${round(value)}%`;

/** Inline CSS vars for an element placed on both stages: `--dx --dy --dw --dh` (desktop) and `--mx …` (mobile). */
export function placeVars(desktop: Partial<Rect> & Point, mobile: Partial<Rect> & Point): string {
	const vars: string[] = [];
	for (const [prefix, rect] of [
		['d', desktop],
		['m', mobile]
	] as const) {
		vars.push(`--${prefix}x: ${pct(rect.x)}`, `--${prefix}y: ${pct(rect.y)}`);
		if (rect.w !== undefined) vars.push(`--${prefix}w: ${pct(rect.w)}`);
		if (rect.h !== undefined) vars.push(`--${prefix}h: ${pct(rect.h)}`);
	}
	return vars.join('; ');
}

/** Soft-edged light cone as a CSS mask (SVG polygon in stage percentages, blurred). */
export function beamMask(bp: Breakpoint): string {
	const { apex, ends } = CINEMA_LAYOUT[bp].beam;
	const points = [apex, ends[0], ends[1]].map((p) => `${round(p.x)},${round(p.y)}`).join(' ');
	const svg =
		`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='none'>` +
		`<filter id='b' x='-20%' y='-20%' width='140%' height='140%'><feGaussianBlur stdDeviation='0.9'/></filter>` +
		`<polygon points='${points}' fill='white' filter='url(%23b)'/></svg>`;
	return `url("data:image/svg+xml,${svg.replaceAll('<', '%3C').replaceAll('>', '%3E')}")`;
}
