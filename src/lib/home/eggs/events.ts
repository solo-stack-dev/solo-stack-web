/**
 * Public egg contract. Tiny on purpose: it is in the initial bundle (via `Eggs.svelte`); the eggs are lazy chunks.
 * Other parts of the page trigger eggs with window events:
 *
 * ```ts
 * import { THREE_STARS_EVENT } from '#lib/home/eggs/events.ts';
 * window.dispatchEvent(new CustomEvent(THREE_STARS_EVENT));
 * ```
 */

/** Three stars align into stacked triangles, e.g. on a game milestone. No detail. */
export const THREE_STARS_EVENT = 'night:egg-three-stars';

/** Ink shadows rise (same as the Konami code and `arise()` in the console). No detail. */
export const ARISE_EVENT = 'night:egg-arise';

/** Attribute on `[data-night-page]` while the visitor rolled the shiny mascot (1 in 4096, or `?shiny=1`). */
export const SHINY_ATTR = 'data-shiny';

/** Props every lazy egg component receives from `Eggs.svelte`. */
export interface EggProps {
	/** `prefers-reduced-motion: reduce` at trigger time: render the calm variant. */
	reducedMotion: boolean;
	/** Call when finished to unmount. Escape unmounts all eggs early. */
	ondone: () => void;
}
