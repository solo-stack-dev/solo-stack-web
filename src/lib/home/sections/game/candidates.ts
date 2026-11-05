import { m } from '#lib/paraglide/messages.js';
import type { GameLoader } from './shared/types.ts';

/** The three games (docs/HANDOFF-HOMEPAGE.md §5.3), one folder each, lazy-loaded as separate chunks on play. */
export const GAME_CANDIDATES = {
	'moon-planet': { load: () => import('./moon-planet/index.ts'), title: m.home_game_moon_title },
	'stack-to-moon': { load: () => import('./stack-to-moon/index.ts'), title: m.home_game_stack_title },
	constellations: { load: () => import('./constellations/index.ts'), title: m.home_game_stars_title }
} as const satisfies Record<string, { load: GameLoader; title: () => string }>;

export type CandidateId = keyof typeof GAME_CANDIDATES;

export const CANDIDATE_IDS = Object.keys(GAME_CANDIDATES) as CandidateId[];

/** All three games ship on the homepage as tabs (owner decision after the playtest). This one is selected first. */
export const HOMEPAGE_DEFAULT_GAME: CandidateId = 'moon-planet';
