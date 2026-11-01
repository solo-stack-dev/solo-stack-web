import type { GameButton } from '../shared/input.svelte.ts';
import type { TuningDef } from '../shared/types.ts';

/**
 * Candidate C: constellation hunt (tech zodiac). Loaded lazily by GameFrame (contract: GameModule in ../shared/types.ts).
 *
 * - `mode`: 0 = trace (timed rounds), 1 = explore (free sky, zodiac wheel). The in-game switch also toggles it.
 * - `timer`: seconds for the first trace round. `ramp` (0…1) shrinks it per round, adds decoys, and fades the hint.
 * - `decoys`: decoy stars per trace round (explore scatters 3.5× as many over its larger sky).
 * - `hint`: silhouette strength (0 = name only, 1 = ghost lines on the exact stars).
 * - `snap`: star hit radius in CSS px (touch adds 10).
 * - `penalty`: seconds lost per wrong link in trace.
 * - `drift`: gentle camera drift amount (off under reduced motion).
 */
export { default } from './Constellations.svelte';

export const tuning: TuningDef[] = [
	{ key: 'mode', min: 0, max: 1, step: 1, default: 0 },
	{ key: 'timer', min: 8, max: 60, step: 1, default: 30 },
	{ key: 'decoys', min: 0, max: 40, step: 1, default: 10 },
	{ key: 'hint', min: 0, max: 1, step: 0.05, default: 0.6 },
	{ key: 'snap', min: 12, max: 48, step: 1, default: 26 },
	{ key: 'ramp', min: 0, max: 1, step: 0.05, default: 0.35 },
	{ key: 'penalty', min: 0, max: 6, step: 0.5, default: 2 },
	{ key: 'drift', min: 0, max: 1, step: 0.05, default: 0.6 }
];

/** Direct touch on the stars; no on-screen buttons. */
export const controls: GameButton[] = [];
