import type { Attachment } from 'svelte/attachments';
import { on } from 'svelte/events';
import { MediaQuery, createSubscriber } from 'svelte/reactivity';

/**
 * Reactive `prefers-reduced-motion: reduce`. Read `reducedMotion.current` in markup, `$derived`, or `$effect`.
 * SSR renders as `false` (motion allowed); clients that prefer reduced motion switch on hydration, so every
 * section's static state must also be correct when rendered without JS.
 */
export const reducedMotion = new MediaQuery('(prefers-reduced-motion: reduce)', false);

const subscribeVisibility = createSubscriber((update) => on(document, 'visibilitychange', update));

/** Reactive page visibility (`document.visibilityState === 'visible'`). Always `true` during SSR. */
export const pageVisibility = {
	get current(): boolean {
		if (typeof document === 'undefined') return true;
		subscribeVisibility();
		return document.visibilityState === 'visible';
	}
};

export interface InViewOptions extends IntersectionObserverInit {
	/** Disconnect after the first time the element becomes visible. */
	once?: boolean;
}

/**
 * Attachment that reports viewport visibility.
 *
 * ```svelte
 * <div {@attach inView((visible) => (near = visible), { rootMargin: '100% 0px' })}></div>
 * ```
 */
export function inView(callback: (visible: boolean, entry: IntersectionObserverEntry) => void, options: InViewOptions = {}): Attachment<Element> {
	const { once = false, ...init } = options;
	return (element) => {
		const observer = new IntersectionObserver((entries) => {
			const entry = entries.at(-1);
			if (!entry) return;
			callback(entry.isIntersecting, entry);
			if (once && entry.isIntersecting) observer.disconnect();
		}, init);
		observer.observe(element);
		return () => observer.disconnect();
	};
}

/**
 * Reactive visibility of one element.
 *
 * ```svelte
 * <script>const seen = new InView({ rootMargin: '50% 0px' });</script>
 * <div {@attach seen.attach}>{seen.current}</div>
 * ```
 */
export class InView {
	current = $state(false);
	#options: InViewOptions;

	constructor(options: InViewOptions = {}) {
		this.#options = options;
	}

	attach: Attachment<Element> = (element) =>
		inView((visible) => {
			this.current = visible;
		}, this.#options)(element);
}

export type ScrollProgressMode = 'through' | 'pinned' | 'enter';

export interface ScrollProgressOptions {
	/**
	 * - `through` (default): 0 when the element's top reaches the viewport bottom, 1 when its bottom leaves the top.
	 * - `pinned`: for a tall wrapper with a `position: sticky` child. 0 when the wrapper's top hits the viewport top,
	 *   1 when its bottom hits the viewport bottom (the time the child is stuck).
	 * - `enter`: 0 when the top reaches the viewport bottom, 1 when the top reaches the viewport top.
	 */
	mode?: ScrollProgressMode;
	/** Also write the progress to this CSS custom property on the element (e.g. `--progress`). Cheaper than markup. */
	cssVar?: `--${string}`;
}

const clamp01 = (value: number) => (value < 0 ? 0 : value > 1 ? 1 : value);

/**
 * Scroll progress of an element through the viewport, 0…1, measured in a passive, rAF-throttled scroll listener
 * that only runs while the element is near the viewport.
 *
 * ```svelte
 * <script>const progress = new ScrollProgress({ mode: 'pinned', cssVar: '--progress' });</script>
 * <div class="h-[600svh]" {@attach progress.attach}><div class="sticky top-0 h-svh">{progress.current}</div></div>
 * ```
 */
export class ScrollProgress {
	current = $state(0);
	#mode: ScrollProgressMode;
	#cssVar: string | undefined;

	constructor({ mode = 'through', cssVar }: ScrollProgressOptions = {}) {
		this.#mode = mode;
		this.#cssVar = cssVar;
	}

	attach: Attachment<HTMLElement> = (element) => {
		let frame = 0;
		let near = false;

		const measure = () => {
			frame = 0;
			const rect = element.getBoundingClientRect();
			const viewport = window.innerHeight;
			let value: number;
			if (this.#mode === 'pinned') value = -rect.top / Math.max(1, rect.height - viewport);
			else if (this.#mode === 'enter') value = (viewport - rect.top) / Math.max(1, viewport);
			else value = (viewport - rect.top) / Math.max(1, viewport + rect.height);
			value = clamp01(value);
			if (value === this.current) return;
			this.current = value;
			if (this.#cssVar) element.style.setProperty(this.#cssVar, String(value));
		};
		const schedule = () => {
			if (!frame) frame = requestAnimationFrame(measure);
		};

		// Measure on every visibility change too, so the value settles at exactly 0 or 1 when the element leaves.
		const observer = new IntersectionObserver(
			(entries) => {
				near = entries.at(-1)?.isIntersecting ?? false;
				schedule();
			},
			{ rootMargin: '25% 0px' }
		);
		observer.observe(element);
		const offScroll = on(window, 'scroll', () => near && schedule(), { passive: true });
		const offResize = on(window, 'resize', schedule, { passive: true });
		schedule();

		return () => {
			observer.disconnect();
			offScroll();
			offResize();
			cancelAnimationFrame(frame);
		};
	};
}

export interface RafLoopOptions {
	/** Cap the frame rate (e.g. 30 for ambient effects). Default: display rate. */
	fps?: number;
	/** Start manually paused. */
	paused?: boolean;
}

/**
 * A requestAnimationFrame loop that only runs while its element is in the viewport, the tab is visible, and it is
 * not paused. `tick(dt, time)` gets the delta in seconds (clamped to 0.1 s so a resumed loop never jumps).
 * Under reduced motion, set `paused = true` and draw one static frame yourself.
 *
 * ```svelte
 * <script>
 *   const loop = new RafLoop((dt) => draw(dt), { fps: 30 });
 *   $effect(() => { loop.paused = reducedMotion.current; });
 * </script>
 * <canvas {@attach loop.attach}></canvas>
 * ```
 */
export class RafLoop {
	/** Whether the loop is currently ticking (reactive). */
	running = $state(false);
	#paused = $state(false);
	#tick: (dt: number, time: number) => void;
	#interval: number;
	#attached = false;
	#inView = false;
	#frame = 0;
	#last = 0;

	constructor(tick: (dt: number, time: number) => void, { fps, paused = false }: RafLoopOptions = {}) {
		this.#tick = tick;
		this.#interval = fps ? 1000 / fps : 0;
		this.#paused = paused;
	}

	get paused(): boolean {
		return this.#paused;
	}

	set paused(value: boolean) {
		this.#paused = value;
		this.#update();
	}

	attach: Attachment<Element> = (element) => {
		this.#attached = true;
		const observer = new IntersectionObserver((entries) => {
			this.#inView = entries.at(-1)?.isIntersecting ?? false;
			this.#update();
		});
		observer.observe(element);
		const offVisibility = on(document, 'visibilitychange', () => this.#update());
		return () => {
			this.#attached = false;
			observer.disconnect();
			offVisibility();
			this.#update();
		};
	};

	#update() {
		if (typeof document === 'undefined') return;
		const shouldRun = this.#attached && this.#inView && !this.#paused && document.visibilityState === 'visible';
		if (shouldRun && !this.#frame) {
			this.#last = 0;
			this.#frame = requestAnimationFrame(this.#loop);
			this.running = true;
		} else if (!shouldRun && this.#frame) {
			cancelAnimationFrame(this.#frame);
			this.#frame = 0;
			this.running = false;
		}
	}

	#loop = (time: number) => {
		this.#frame = requestAnimationFrame(this.#loop);
		const elapsed = this.#last ? time - this.#last : 0;
		if (this.#last && elapsed < this.#interval - 1) return;
		this.#last = time;
		this.#tick(Math.min(elapsed, 100) / 1000, time);
	};
}
