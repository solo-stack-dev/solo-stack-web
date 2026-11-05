/**
 * Painted section transition masks (masters and prompts in docs/art/transitions/), built into ./assets/transitions/ by
 * `node src/lib/home/shared/tools/optimize-transitions.mjs`. Import URLs from here.
 *
 * NightPage sets them as `url(…)` custom properties on `[data-night-page]`, so sections use them in plain CSS:
 * - `--feather-up` / `--feather-down`: soft plate edge; `up` is transparent above / opaque below (a plate's top), `down`
 *   the flip. Use via `[data-feather]` (docs/HOMEPAGE-DEV.md §6.5).
 * - `--wash-spread-up`: wet spreading wash, transparent above / opaque below (hero → making wipe); `--wash-spread-down`:
 *   the flip (blooms in the retreating sunrise night).
 * - `--wash-dry`: drying wash, opaque above / transparent below (the retreating sunrise night).
 */
import featherDown from './assets/transitions/feather-down.webp';
import featherUp from './assets/transitions/feather-up.webp';
import washDry from './assets/transitions/wash-dry.webp';
import washSpreadDown from './assets/transitions/wash-spread-down.webp';
import washSpreadUp from './assets/transitions/wash-spread-up.webp';

export const TRANSITION_MASKS = {
	featherUp,
	featherDown,
	washSpreadUp,
	washSpreadDown,
	washDry
} as const;

/** Inline style string for NightPage's wrapper. */
export const transitionMaskVars = (): string =>
	[
		`--feather-up: url("${featherUp}")`,
		`--feather-down: url("${featherDown}")`,
		`--wash-spread-up: url("${washSpreadUp}")`,
		`--wash-spread-down: url("${washSpreadDown}")`,
		`--wash-dry: url("${washDry}")`
	].join('; ');
