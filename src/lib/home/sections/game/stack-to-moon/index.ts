import type { GameButton } from '../shared/input.svelte.ts';
import type { TuningDef } from '../shared/types.ts';
import { DEFAULT_TUNING } from './engine.ts';

/**
 * Candidate B: Stack to the moon (contract: GameModule in ../shared/types.ts). Keys match `Tuning` in engine.ts.
 * `collapse`: toppling lean (radians). `moonHeight`: blocks. `perfect`: world units (a block is 3.2 × 0.7).
 */
export { default } from './StackToMoon.svelte';

export const tuning: TuningDef[] = [
	{ key: 'swingSpeed', min: 0.3, max: 3, step: 0.05, default: DEFAULT_TUNING.swingSpeed },
	{ key: 'swingMode', min: 0, max: 1, step: 1, default: DEFAULT_TUNING.swingMode },
	{ key: 'gravity', min: 5, max: 80, step: 1, default: DEFAULT_TUNING.gravity },
	{ key: 'swayStiffness', min: 2, max: 40, step: 0.5, default: DEFAULT_TUNING.swayStiffness },
	{ key: 'swayDamping', min: 0, max: 6, step: 0.1, default: DEFAULT_TUNING.swayDamping },
	{ key: 'swayKick', min: 0, max: 2, step: 0.05, default: DEFAULT_TUNING.swayKick },
	{ key: 'swayLean', min: 0, max: 8, step: 0.1, default: DEFAULT_TUNING.swayLean },
	{ key: 'collapse', min: 0.08, max: 0.5, step: 0.01, default: DEFAULT_TUNING.collapse },
	{ key: 'moonHeight', min: 5, max: 60, step: 1, default: DEFAULT_TUNING.moonHeight },
	{ key: 'perfect', min: 0.02, max: 0.3, step: 0.01, default: DEFAULT_TUNING.perfect }
];

export const controls: GameButton[] = ['action'];
