/**
 * Painted section transition materials (masters and prompts in docs/art/transitions/), optimized by
 * `node src/lib/home/shared/tools/optimize-transitions.mjs` into ./assets/transitions/. Import URLs from here.
 *
 * NightPage exposes the masks as CSS custom properties on `[data-night-page]` (`url(…)` values), so sections use
 * them in plain CSS without importing anything:
 * - `--feather-up` / `--feather-down`: soft low-frequency plate edge (`up`: transparent above, opaque below, for a
 *   plate's top; `down`: the flip, for its bottom). Use through the `[data-feather]` helper (docs/HOMEPAGE-DEV.md §6.5).
 * - `--wash-spread-up`: wet spreading wash ramp, transparent above / opaque below (hero → making wipe);
 *   `--wash-spread-down`: the same ramp opaque above / transparent below (blooms in the retreating sunrise night).
 * - `--wash-dry`: drying wash ramp, opaque above / transparent below (the retreating sunrise night).
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

/** The mask URLs as `url("…")` CSS custom properties, for NightPage's wrapper. */
export const transitionMaskVars = (): string =>
	[
		`--feather-up: url("${featherUp}")`,
		`--feather-down: url("${featherDown}")`,
		`--wash-spread-up: url("${washSpreadUp}")`,
		`--wash-spread-down: url("${washSpreadDown}")`,
		`--wash-dry: url("${washDry}")`
	].join('; ');
