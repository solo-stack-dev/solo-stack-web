import type { GameButton } from '../shared/input.svelte.ts';
import { MOON_TUNING } from './tuning.ts';

/**
 * Candidate A: moon planet (docs/HANDOFF-HOMEPAGE.md §5.3). Contract: GameModule in ../shared/types.ts.
 * Canvas 2D prototype: radial gravity platformer around a tiny moon. Simulation in sim.ts, drawing in render.ts.
 */
export { default } from './MoonPlanet.svelte';

export const tuning = MOON_TUNING;

/** `down` is a dive (fast fall) for stomping; jump is `action` (Space) or `up` on the keyboard. */
export const controls: GameButton[] = ['left', 'right', 'down', 'action'];
