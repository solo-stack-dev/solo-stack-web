import type { TuningDef } from '../shared/types.ts';

/**
 * Debug-tunable values (lab sliders). World units: the moon radius is 100, speeds are units per second along the
 * surface, gravity is units per second². `cameraMode`: 0 = camera rotates with the player, 1 = planet stays fixed.
 */
export const MOON_TUNING: TuningDef[] = [
	{ key: 'gravity', min: 600, max: 3200, step: 50, default: 1500 },
	{ key: 'jump', min: 250, max: 900, step: 10, default: 520 },
	{ key: 'runSpeed', min: 60, max: 400, step: 5, default: 170 },
	{ key: 'bugSpeed', min: 10, max: 160, step: 5, default: 38 },
	{ key: 'spawnRate', min: 0.2, max: 3, step: 0.1, default: 1 },
	{ key: 'bossThreshold', min: 2, max: 30, step: 1, default: 8 },
	{ key: 'roundTime', min: 30, max: 90, step: 5, default: 60 },
	{ key: 'cameraMode', min: 0, max: 1, step: 1, default: 0 },
	{ key: 'cameraSmooth', min: 1, max: 20, step: 0.5, default: 6 }
];

export type TuningKey = 'gravity' | 'jump' | 'runSpeed' | 'bugSpeed' | 'spawnRate' | 'bossThreshold' | 'roundTime' | 'cameraMode' | 'cameraSmooth';
export type Tuning = Record<TuningKey, number>;

/** Live slider values with defaults for anything missing or invalid. */
export function readTuning(values: Record<string, number>): Tuning {
	const out = {} as Tuning;
	for (const def of MOON_TUNING) {
		const value = Number(values[def.key]);
		out[def.key as TuningKey] = Number.isFinite(value) ? value : def.default;
	}
	return out;
}
