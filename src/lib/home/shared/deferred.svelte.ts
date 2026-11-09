import type { Attachment } from 'svelte/attachments';
import { on } from 'svelte/events';

/** Fallback: the rest of the art follows this long after the first tier, even if the first tier never reports. */
const REST_FALLBACK = 4000;

/**
 * Gate for below-the-fold art (docs/perf/AUDIT-2026-11.md #7). On a slow link Chrome's lazy-load margin is so wide that the
 * homepage's lower images download in parallel with the hero moon (the LCP image) and slow it down. `DeferredArt` keeps them
 * out of the DOM until the gate opens, in two tiers so the nearest art is never queued behind the far art:
 * - `ready`: the art right below the first screen (the 21:00 plate and its first bloom). Opens when the moon's bytes have
 *   arrived (or it loaded or failed), on the first scroll, or at window `load`, whichever comes first.
 * - `rest`: everything further down. Opens once the first tier has loaded (`settle`), on the first scroll, or
 *   REST_FALLBACK after `ready`.
 *
 * ```svelte
 * <button {@attach lcpImage}><enhanced:img src={moon} alt="" fetchpriority="high" /></button>
 * <DeferredArt><enhanced:img src={plate} alt="" loading="lazy" onload={belowFold.settle} /></DeferredArt>
 * ```
 */
class BelowFold {
	#ready = $state(false);
	#rest = $state(false);
	#armed = false;
	#fallback: ReturnType<typeof setTimeout> | undefined;

	/** True once the first tier may load (reactive; always false during SSR and hydration). */
	get ready(): boolean {
		return this.#ready;
	}

	/** True once the rest may load (reactive; always false during SSR and hydration). */
	get rest(): boolean {
		return this.#rest;
	}

	open = () => {
		if (this.#ready) return;
		this.#ready = true;
		this.#fallback = setTimeout(this.settle, REST_FALLBACK);
	};

	/** The first tier has loaded (or failed): start the rest. */
	settle = () => {
		this.open();
		clearTimeout(this.#fallback);
		this.#rest = true;
	};

	/** Starts listening: the first scroll opens both tiers, window `load` the first (a fallback if the LCP image never reports). */
	arm() {
		if (this.#armed || typeof window === 'undefined') return;
		this.#armed = true;
		if (window.scrollY > 0) return this.settle();
		const offScroll = on(window, 'scroll', () => (offScroll(), this.settle()), { passive: true });
		if (document.readyState === 'complete') this.open();
		else on(window, 'load', this.open, { once: true });
	}
}

export const belowFold = new BelowFold();

/**
 * Attachment for the element holding the LCP `<img>` (the hero moon): opens the gate once that image's bytes have arrived
 * (resource timing, so the next downloads overlap its decode), or it loaded or failed.
 */
export const lcpImage: Attachment<HTMLElement> = (element) => {
	belowFold.arm();
	const img = element instanceof HTMLImageElement ? element : element.querySelector('img');
	if (!img || img.complete) return belowFold.open();
	const arrived = (entries: PerformanceEntryList) => entries.some((entry) => entry.name === img.currentSrc);
	let observer: PerformanceObserver | undefined;
	try {
		observer = new PerformanceObserver((list) => arrived(list.getEntries()) && belowFold.open());
		observer.observe({ type: 'resource', buffered: true });
	} catch {
		// no resource timing: the load event below
	}
	const offLoad = on(img, 'load', belowFold.open);
	const offError = on(img, 'error', belowFold.open);
	return () => {
		observer?.disconnect();
		offLoad();
		offError();
	};
};
