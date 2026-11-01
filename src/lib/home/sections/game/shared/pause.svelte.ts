import type { Attachment } from 'svelte/attachments';
import { inView, pageVisibility } from '#lib/home/shared/motion.svelte.ts';

/**
 * Combined pause state of a game: user pause button OR frame off screen (< 25 % visible) OR hidden tab.
 *
 * ```svelte
 * <script>const pause = new PauseController();</script>
 * <div {@attach pause.attach}><MyGame paused={pause.paused} /></div>
 * ```
 */
export class PauseController {
	/** Pause button state (reactive). */
	user = $state(false);
	/** Whether the frame is sufficiently on screen (reactive). */
	onScreen = $state(false);

	get paused(): boolean {
		return this.user || !this.onScreen || !pageVisibility.current;
	}

	/** Paused for a reason other than the button (show a passive hint rather than the resume overlay). */
	get autoPaused(): boolean {
		return !this.user && this.paused;
	}

	toggle(): void {
		this.user = !this.user;
	}

	attach: Attachment<Element> = (element) =>
		inView(
			(visible) => {
				this.onScreen = visible;
			},
			{ threshold: 0.25 }
		)(element);
}
