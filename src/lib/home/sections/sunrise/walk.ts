/**
 * Scroll-keyed walk of the sunrise mascot over the baked 16-frame cycle (./art.ts `WALK_CYCLE`).
 *
 * Position is counted in frames: `k` runs 0 … `total` (steps × frames / 2) and the figure sits `k / total` of the way
 * along the walk. Each frame moves him by exactly the distance his planted foot slides back in the bake, so the foot
 * stays put on the path (no skating). Scroll sets a target; he walks there at his own cadence (faster when far
 * behind), so a flick reads as a brisk walk instead of a slideshow. When scrolling stops he finishes the current step
 * (the next contact pose, both feet down) and breathes (`.is-idle`). Scrolling back by more than a step turns him
 * around, only ever on a contact pose; smaller reversals leave him standing. Writes CSS custom properties on the attached element only:
 * `--walk-p` (0…1), `--f` (atlas column), `--dir` (±1), `--bob` (master px), `--arm` (deg).
 */
import type { Attachment } from 'svelte/attachments';
import { on } from 'svelte/events';
import { WALK_CYCLE } from './art.ts';

const FRAMES = WALK_CYCLE.frames;
const HALF = FRAMES / 2;
/** Cadence in frames per second: a calm walk at minimum, a brisk one when far behind the scroll. */
const SPEED = { min: 12, max: 26, gain: 4 };
/** Scroll silence (ms) after which he settles on a contact pose. */
const SETTLE_MS = 140;

const mod = (value: number, n: number) => ((value % n) + n) % n;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export class Walker {
	#element: HTMLElement | undefined;
	#progress: () => number;

	#total = 0;
	#k = 0;
	#dir = 1;
	#target = 0;
	#scrolling = false;
	#acc = 0;
	#last = 0;
	#frame = 0;
	#timer = 0;
	#cleanup: (() => void) | undefined;
	#written = '';

	/** @param progress scroll progress of the walk, 0…1 (read in a rAF tick, so a layout read is fine) */
	constructor(progress: () => number) {
		this.#progress = progress;
	}

	attach: Attachment<HTMLElement> = (element) => {
		this.#element = element;
		return () => {
			this.stop();
			this.#element = undefined;
		};
	};

	/** Follow the scroll over a walk of `total` frames. Starts on the contact pose nearest the current scroll. */
	start(total: number) {
		this.stop();
		this.#total = total;
		this.#measure();
		this.#k = this.#snap(this.#target);
		this.#dir = 1;
		this.#acc = 0;
		this.#render(true);
		const wake = () => {
			this.#scrolling = true;
			clearTimeout(this.#timer);
			this.#timer = window.setTimeout(() => {
				this.#scrolling = false;
				this.#wake();
			}, SETTLE_MS);
			this.#wake();
		};
		const offScroll = on(window, 'scroll', wake, { passive: true });
		const offResize = on(window, 'resize', () => this.#wake(), { passive: true });
		this.#cleanup = () => {
			offScroll();
			offResize();
		};
	}

	/** Stop following; the CSS defaults (the end pose) take over again. */
	stop() {
		this.#cleanup?.();
		this.#cleanup = undefined;
		cancelAnimationFrame(this.#frame);
		this.#frame = 0;
		clearTimeout(this.#timer);
		this.#scrolling = false;
		this.#written = '';
		const element = this.#element;
		if (!element) return;
		for (const name of ['--walk-p', '--f', '--dir', '--bob', '--arm']) element.style.removeProperty(name);
		element.classList.remove('is-idle');
	}

	#measure() {
		this.#target = clamp(this.#progress(), 0, 1) * this.#total;
	}

	/** The nearest contact position (both feet down); the walk's ends are contact positions too. */
	#snap(position: number) {
		return clamp(Math.round(position / HALF) * HALF, 0, this.#total);
	}

	/** Where to walk now. He never turns around for less than a step; at rest he finishes the step he is in. */
	#goal(k: number) {
		const diff = this.#target - k;
		const near = Math.abs(diff) <= HALF;
		if (this.#scrolling) return near && Math.sign(diff) !== this.#dir ? k : clamp(Math.round(this.#target), 0, this.#total);
		const snapped = this.#snap(this.#target);
		// settle on the contact pose nearest the target, unless that means turning back for less than a step
		if (!near || Math.sign(snapped - k) !== -this.#dir) return snapped;
		return this.#contact(k) ? k : clamp(k + this.#dir * (HALF - mod((k - this.#total) * this.#dir, HALF)), 0, this.#total);
	}

	#contact(k: number) {
		return mod(k - this.#total, HALF) === 0;
	}

	#wake() {
		if (this.#frame) return;
		this.#last = performance.now();
		this.#frame = requestAnimationFrame(this.#tick);
	}

	#tick = () => {
		this.#frame = 0;
		// one clock for dt (rAF timestamps can be a frame-start time that differs from performance.now())
		const now = performance.now();
		const dt = Math.min(0.1, (now - this.#last) / 1000);
		this.#last = now;
		this.#measure();
		const k = this.#k;
		const goal = this.#goal(k);
		const resting = k === goal && this.#contact(k);
		this.#element?.classList.toggle('is-idle', resting && !this.#scrolling);
		if (resting) return;
		// at the goal mid-step while the page still scrolls: wait; the settle timer wakes us again
		if (k === goal && this.#scrolling) return;

		let want = Math.sign(goal - k) || this.#dir;
		if (want !== this.#dir) {
			// turn only on a contact pose; otherwise finish the step first
			if (this.#contact(k)) this.#dir = want;
			else want = this.#dir;
		}
		const speed = clamp(Math.abs(goal - k) * SPEED.gain, SPEED.min, SPEED.max);
		this.#acc = Math.min(1, this.#acc + dt * speed);
		if (this.#acc >= 1) {
			this.#acc -= 1;
			this.#k = clamp(k + want, 0, this.#total);
		}
		this.#render();
		this.#frame = requestAnimationFrame(this.#tick);
	};

	#render(force = false) {
		const element = this.#element;
		if (!element) return;
		const k = this.#k;
		// facing right the cycle runs forward with k; facing left it runs forward as k falls. Column 0 at the walk's end.
		const column = this.#dir > 0 ? mod(k - this.#total, FRAMES) : mod(this.#total - k, FRAMES);
		const key = `${k}:${this.#dir}`;
		if (!force && key === this.#written) return;
		this.#written = key;
		element.style.setProperty('--walk-p', (this.#total ? k / this.#total : 1).toFixed(4));
		element.style.setProperty('--f', String(column));
		element.style.setProperty('--dir', String(this.#dir));
		element.style.setProperty('--bob', String(WALK_CYCLE.bob[column]));
		element.style.setProperty('--arm', String(WALK_CYCLE.arm[column]));
	}
}
