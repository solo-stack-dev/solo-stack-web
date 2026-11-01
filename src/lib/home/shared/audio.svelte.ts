/**
 * One shared AudioContext for the whole page (radio, game sounds, eggs). It is created lazily, and only from a user
 * gesture: browsers block audio that was not started by one, and creating it early wastes resources.
 *
 * ```ts
 * import { audio } from '#lib/home/shared/audio.svelte.ts';
 *
 * function onclick() {
 *   const context = audio.unlock(); // synchronously inside the click handler
 *   const source = context.createBufferSource();
 *   source.connect(audio.output!);   // route through the shared master gain
 * }
 * ```
 */
class SharedAudio {
	/** `'idle'` until the first `unlock()`, then mirrors `AudioContext.state` (reactive). */
	state = $state<AudioContextState | 'idle'>('idle');
	/** Master volume 0…1 (reactive). */
	volume = $state(1);

	#context: AudioContext | null = null;
	#master: GainNode | null = null;

	/** The context, or `null` before the first `unlock()`. */
	get context(): AudioContext | null {
		return this.#context;
	}

	/** Master gain node, connect every source here. `null` before the first `unlock()`. */
	get output(): GainNode | null {
		return this.#master;
	}

	/**
	 * Create (first call) or resume the shared context. Call it synchronously inside a user gesture handler.
	 */
	unlock(): AudioContext {
		if (!this.#context) {
			const context = new AudioContext();
			const master = context.createGain();
			master.gain.value = this.volume;
			master.connect(context.destination);
			context.addEventListener('statechange', () => {
				this.state = context.state;
			});
			this.#context = context;
			this.#master = master;
			this.state = context.state;
		}
		if (this.#context.state === 'suspended') void this.#context.resume();
		return this.#context;
	}

	/** Set the master volume (0…1) with a short ramp to avoid clicks. */
	setVolume(value: number): void {
		this.volume = Math.min(1, Math.max(0, value));
		if (this.#context && this.#master) this.#master.gain.setTargetAtTime(this.volume, this.#context.currentTime, 0.02);
	}

	/** Suspend processing (e.g. when the radio leaves the viewport). No-op before `unlock()`. */
	async suspend(): Promise<void> {
		if (this.#context?.state === 'running') await this.#context.suspend();
	}

	/** Resume after `suspend()`. Prefer `unlock()` from a gesture handler; this works only if already allowed. */
	async resume(): Promise<void> {
		if (this.#context?.state === 'suspended') await this.#context.resume();
	}
}

export const audio = new SharedAudio();
