/**
 * Original ink shadow figures for ARISE: one hand-drawn hunched silhouette (viewBox 0 0 240 640, the feet are
 * tendrils that run off the bottom edge), reused at different sizes, leans, and mirrors. The ragged ink edge comes
 * from a displacement filter in Arise.svelte.
 */

export const FIGURE_VIEWBOX = '0 0 240 640';

export const FIGURE_PATH =
	'M96 30C120 18 146 30 150 58C154 84 144 104 134 112C168 122 196 142 204 176C214 220 206 270 212 330C218 390 226 430 222 470C220 500 210 520 214 560' +
	'C216 590 206 610 200 640L178 640C182 600 176 560 170 520C166 490 160 470 158 440C154 480 150 540 156 640L120 640C118 590 112 540 104 500' +
	'C96 540 92 590 86 640L66 640C72 580 70 520 64 470C56 430 48 400 50 360C52 300 58 240 76 190C84 168 96 152 108 140C92 136 74 120 70 96C66 64 76 38 96 30Z';

export interface Figure {
	/** Horizontal center in % of the viewport width. */
	x: number;
	/** Height in viewport heights. */
	height: number;
	mirror: boolean;
	/** Lean in degrees (pivot at the feet). */
	lean: number;
	/** 0…1 ink density (far figures are paler). */
	ink: number;
	/** Rise delay in ms. */
	delay: number;
	drops: { x: number; y: number; r: number; dx: number; dy: number }[];
}

export function createFigures(narrow: boolean): Figure[] {
	const rand = Math.random;
	const layout = narrow
		? [
				{ x: 22, height: 0.5, mirror: false, lean: -4, ink: 0.7 },
				{ x: 60, height: 0.64, mirror: true, lean: 3, ink: 0.92 },
				{ x: 90, height: 0.46, mirror: true, lean: 6, ink: 0.6 }
			]
		: [
				{ x: 58, height: 0.78, mirror: false, lean: -6, ink: 0.97 },
				{ x: 76, height: 0.86, mirror: false, lean: 2, ink: 0.88 },
				{ x: 91, height: 0.66, mirror: true, lean: 5, ink: 0.72 }
			];
	return layout.map((figure, index) => ({
		...figure,
		delay: index * 230 + Math.round(rand() * 120),
		drops: Array.from({ length: 14 }, () => ({
			// In viewBox units around the silhouette; drift upwards while it dissolves
			x: Math.round(20 + rand() * 200),
			y: Math.round(40 + rand() * 520),
			r: Math.round((1.5 + rand() * (rand() < 0.2 ? 9 : 4)) * 10) / 10,
			dx: Math.round((rand() - 0.5) * 80),
			dy: -Math.round(60 + rand() * 180)
		}))
	}));
}
