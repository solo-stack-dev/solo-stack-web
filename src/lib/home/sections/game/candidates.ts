import { m } from '#lib/paraglide/messages.js';
import type { GameLoader } from './shared/types.ts';

/**
 * The three game prototypes (docs/HANDOFF-HOMEPAGE.md §5.3). Each lives in its own folder and is loaded lazily
 * (separate chunk) only after a click on play. Candidate agents own their folder; this registry stays as is.
 */
export const GAME_CANDIDATES = {
	'moon-planet': { load: () => import('./moon-planet/index.ts'), title: m.home_game_moon_title },
	'stack-to-moon': { load: () => import('./stack-to-moon/index.ts'), title: m.home_game_stack_title },
	constellations: { load: () => import('./constellations/index.ts'), title: m.home_game_stars_title }
} as const satisfies Record<string, { load: GameLoader; title: () => string }>;

export type CandidateId = keyof typeof GAME_CANDIDATES;

export const CANDIDATE_IDS = Object.keys(GAME_CANDIDATES) as CandidateId[];

/** TODO(playtest): the owner picks the shipped game at the playtest gate. Until then the homepage shows candidate B. */
export const HOMEPAGE_GAME: CandidateId = 'stack-to-moon';
