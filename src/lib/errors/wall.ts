/** Geometry for the 500 scene (`GiantWall.svelte`). All layers share one 1000 × 800 viewBox so separately animated SVGs line up. */

/** Seeded PRNG: stones and dust match on server and client. */
export function mulberry32(seed: number) {
	let a = seed >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = a;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

export const SCENE = { width: 1000, height: 800 } as const;
export const WALL = { left: 300, right: 1000, top: 392, coping: 14, bottom: 800 } as const;

/** Irregular stone courses as three path strings (three shades), mortar lines between them. */
function stones(seed: number) {
	const random = mulberry32(seed);
	const shades = ['', '', ''];
	let y = WALL.top + WALL.coping;
	let row = 0;
	while (y < WALL.bottom) {
		const height = 22 + random() * 10;
		let x = WALL.left - (row % 2) * 24;
		while (x < WALL.right) {
			const width = 34 + random() * 40;
			const j = () => (random() - 0.5) * 3;
			const x0 = Math.max(WALL.left, x) + 1.5;
			const x1 = Math.min(WALL.right + 10, x + width) - 1.5;
			const y0 = y + 1.5;
			const y1 = y + height - 1.5;
			if (x1 - x0 > 6) {
				const d = `M${(x0 + j()).toFixed(1)} ${(y0 + j()).toFixed(1)}L${(x1 + j()).toFixed(1)} ${(y0 + j()).toFixed(1)}L${(x1 + j()).toFixed(1)} ${(y1 + j()).toFixed(1)}L${(x0 + j()).toFixed(1)} ${(y1 + j()).toFixed(1)}Z`;
				shades[Math.floor(random() * 3)] += d;
			}
			x += width;
		}
		y += height;
		row++;
	}
	return shades;
}

export const STONES = stones(500);

/** A finger hooked over the coping: knuckle above the top edge, bending down the wall face. `lean` tilts the tip sideways. */
function finger(x: number, width: number, length: number, lean: number, rise = 20) {
	const top = WALL.top;
	const knuckle = top - rise;
	const tip = top + length;
	const r = x + width;
	return (
		`M${x} ${top + 6}` +
		`C${x - 2} ${knuckle + 4} ${x + width * 0.2} ${knuckle} ${x + width * 0.5} ${knuckle}` +
		`C${x + width * 0.8} ${knuckle} ${r + 2} ${knuckle + 4} ${r} ${top + 6}` +
		`C${r - 1 + lean * 0.5} ${top + length * 0.5} ${r - 3 + lean} ${tip - 10} ${r - 5 + lean} ${tip - 4}` +
		`C${r - 8 + lean} ${tip + 4} ${x + 7 + lean} ${tip + 4} ${x + 4 + lean} ${tip - 4}` +
		`C${x + 2 + lean} ${tip - 10} ${x + 1 + lean * 0.5} ${top + length * 0.5} ${x} ${top + 6}Z`
	);
}

/** The back of the hand: a low mound behind the knuckles, above the wall. */
function palm(x0: number, x1: number, height: number) {
	const top = WALL.top;
	return `M${x0} ${top + 2}C${x0 + 6} ${top - height} ${x1 - 6} ${top - height * 1.15} ${x1} ${top + 2}Z`;
}

/** Separate paths per part: overlapping subpaths would cancel out under nonzero fill. `tapper` is the right hand's first finger. */
export const HANDS = {
	leftPalm: palm(598, 742, 34),
	left: [finger(600, 34, 46, -3, 18), finger(633, 36, 58, -1, 24), finger(668, 36, 54, 1, 23), finger(703, 32, 40, 3, 17)].join(''),
	leftThumb: 'M590 400C576 404 566 418 570 440C574 452 590 452 594 440C598 424 604 410 604 398Z',
	rightPalm: palm(842, 990, 36),
	right: [finger(878, 36, 56, -1, 24), finger(913, 36, 52, 1, 22), finger(948, 32, 40, 3, 16)].join(''),
	tapper: finger(844, 34, 44, -3, 18)
} as const;

/** The giant's single eye, on the part of the head that clears the wall. */
export const EYE = { x: 702, y: 300, rx: 25, ry: 10.5 } as const;

/** Cracks in the wall face, one per knock: from under the fingers down into the stones. */
export const CRACKS = [
	'M861 407 L866 428 L857 446 L868 470 L861 494 L872 520 M866 470 L888 482 L896 503',
	'M650 407 L644 430 L656 452 L641 478 L650 506 L636 538 M656 452 L678 466 L684 490',
	'M770 407 L762 436 L778 462 L760 494 L776 532 L758 576 L770 618 M778 462 L806 476 L812 506 M760 494 L734 510 L728 540'
] as const;

/** Dust specks shaken off the coping (positions in % of the scene width, fall and drift in container units). */
export const DUST = (() => {
	const random = mulberry32(7);
	return Array.from({ length: 16 }, () => ({
		x: Math.round(32 + random() * 66),
		fall: Math.round(14 + random() * 26),
		drift: Math.round((random() - 0.5) * 60) / 10,
		size: Math.round(2 + random() * 3),
		delay: Math.round(random() * 220)
	}));
})();
