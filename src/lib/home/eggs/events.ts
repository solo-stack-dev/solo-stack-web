/**
 * Public egg contract. Tiny on purpose: this file is part of the initial bundle (imported by `Eggs.svelte`), the egg
 * effects themselves are lazy chunks.
 *
 * Other parts of the page trigger eggs with window events, e.g. a game milestone:
 *
 * ```ts
 * import { THREE_STARS_EVENT } from '#lib/home/eggs/events.ts';
 * window.dispatchEvent(new CustomEvent(THREE_STARS_EVENT));
 * ```
 */

/** Three stars align into stacked triangles. Dispatch it from a game milestone (no detail). */
export const THREE_STARS_EVENT = 'night:egg-three-stars';

/** Ink shadows rise (same as the Konami code and `arise()` in the console). No detail. */
export const ARISE_EVENT = 'night:egg-arise';

/** Attribute on `[data-night-page]` while the visitor rolled the shiny mascot (1 in 4096, or `?shiny=1`). */
export const SHINY_ATTR = 'data-shiny';

/** Attribute on the hero moon element; the moon presence egg is positioned over it. */
export const EGG_MOON_ATTR = 'data-egg-moon';

/** Props every lazy egg component receives from `Eggs.svelte`. */
export interface EggProps {
	/** `prefers-reduced-motion: reduce` at trigger time: render the calm variant. */
	reducedMotion: boolean;
	/** Element the egg anchors to (moon presence: the hero moon). */
	target?: Element | null;
	/** Call once the effect has finished; the egg is unmounted. Escape unmounts every running egg early. */
	ondone: () => void;
}
