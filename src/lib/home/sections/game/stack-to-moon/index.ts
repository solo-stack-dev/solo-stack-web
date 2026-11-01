import type { GameButton } from '../shared/input.svelte.ts';
import type { TuningDef } from '../shared/types.ts';

/**
 * Game candidate module (contract: GameModule in ../shared/types.ts). Loaded lazily by GameFrame.
 * STUB: the stack-to-moon agent replaces this folder. `gravity` and `speed` drive the placeholder; the other keys are
 * suggestions for the real prototype.
 */
export { default } from './StackToMoon.svelte';

export const tuning: TuningDef[] = [
	{ key: 'gravity', min: 0.5, max: 6, step: 0.1, default: 2.4 },
	{ key: 'speed', min: 0.1, max: 1.5, step: 0.05, default: 0.5 },
	{ key: 'swing', min: 0.2, max: 3, step: 0.1, default: 1 },
	{ key: 'sway', min: 0, max: 1, step: 0.05, default: 0.3 }
];

export const controls: GameButton[] = ['left', 'right', 'action'];
