import type { Attachment } from 'svelte/attachments';

/**
 * Calm reduced-motion variant shared by the eggs: fade in, hold, fade out, opacity only. Uses the Web Animations API
 * because the global reduced-motion guard in layout.css collapses every CSS animation to 0.01 ms.
 *
 * `<div {@attach reducedMotion && calmFade(3600)}>`
 */
export function calmFade(duration: number, peak = 1): Attachment<HTMLElement> {
	return (element) => {
		const animation = element.animate([{ opacity: 0 }, { opacity: peak, offset: 0.2 }, { opacity: peak, offset: 0.75 }, { opacity: 0 }], {
			duration,
			easing: 'ease-in-out',
			fill: 'forwards'
		});
		return () => animation.cancel();
	};
}
