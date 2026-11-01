/**
 * Geometry for the 404 scene (`WorldTree.svelte`), normalized to the tree cutout `assets/error-tree.webp`
 * (0 … 1 of its width and height). The figures and the climb stops are positioned in that box, so they stay glued to
 * the painted tree at every viewport size.
 */

/** Width / height of error-tree.webp. */
export const TREE_ASPECT = 701 / 1700;

/** Standing surface of the top platform: where the wanderer and (at the end) the mascot stand. */
export const TOP = { y: 0.014, wanderer: 0.6, mascot: 0.41 } as const;

/** Trunk center at a few heights, top to bottom; `trunkX` interpolates between them. */
const TRUNK: [y: number, x: number][] = [
	[0.08, 0.493],
	[0.3, 0.5],
	[0.5, 0.504],
	[0.7, 0.511]
];

export function trunkX(y: number) {
	for (let index = 1; index < TRUNK.length; index++) {
		const [y0, x0] = TRUNK[index - 1];
		const [y1, x1] = TRUNK[index];
		if (y <= y1) return x0 + ((x1 - x0) * Math.max(0, y - y0)) / (y1 - y0);
	}
	return TRUNK[TRUNK.length - 1][1];
}

/**
 * Where the mascot clings while climbing (his center), on bare trunk between the canopy tiers, lowest first. The last
 * click takes him onto the top platform. Phones (`sm`) show less of the tree above the text, so the stops sit higher.
 */
export const CLIMB_STOPS = (
	[
		[0.5, 0.34],
		[0.31, 0.27],
		[0.12, 0.12]
	] as const
).map(([y, ySm]) => ({ x: trunkX(y), y, xSm: trunkX(ySm), ySm }));

/** Height of the figures relative to the tree height. */
export const FIGURE = { wanderer: 0.08, mascot: 0.05, climber: 0.1 } as const;
