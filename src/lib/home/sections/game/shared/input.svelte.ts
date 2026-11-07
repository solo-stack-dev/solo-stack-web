import type { Attachment } from 'svelte/attachments';
import { on } from 'svelte/events';

export type GameButton = 'left' | 'right' | 'up' | 'down' | 'action';

/** Physical key positions (`KeyboardEvent.code`), so WASD also works on QWERTZ/AZERTY. */
export const KEY_MAP: Readonly<Record<string, GameButton>> = {
	ArrowLeft: 'left',
	KeyA: 'left',
	ArrowRight: 'right',
	KeyD: 'right',
	ArrowUp: 'up',
	KeyW: 'up',
	ArrowDown: 'down',
	KeyS: 'down',
	Space: 'action'
};

const BUTTONS: GameButton[] = ['left', 'right', 'up', 'down', 'action'];

/**
 * Unified keyboard + touch input. GameFrame creates one per run, attaches it to the game surface, and feeds the touch
 * buttons into it. Games poll it:
 *
 * ```ts
 * if (input.isDown('left')) x -= speed * dt;
 * if (input.consume('action')) jump(); // true once per press
 * ```
 */
export class GameInput {
	/** Held state per button (reactive, e.g. for pressed styling). */
	held = $state<Record<GameButton, boolean>>({ left: false, right: false, up: false, down: false, action: false });
	#pressed = new Set<GameButton>();

	isDown(button: GameButton): boolean {
		return this.held[button];
	}

	/** True once per press since the last call (edge-triggered). */
	consume(button: GameButton): boolean {
		return this.#pressed.delete(button);
	}

	/** Horizontal axis: -1 (left), 0, 1 (right). */
	get axisX(): number {
		return (this.held.right ? 1 : 0) - (this.held.left ? 1 : 0);
	}

	/** Vertical axis: -1 (up), 0, 1 (down). */
	get axisY(): number {
		return (this.held.down ? 1 : 0) - (this.held.up ? 1 : 0);
	}

	press(button: GameButton): void {
		if (!this.held[button]) this.#pressed.add(button);
		this.held[button] = true;
	}

	release(button: GameButton): void {
		this.held[button] = false;
	}

	/** Drops pending presses (e.g. made while paused) without touching held state. */
	flush(): void {
		this.#pressed.clear();
	}

	reset(): void {
		for (const button of BUTTONS) this.held[button] = false;
		this.#pressed.clear();
	}

	/** Keyboard on the (focusable) game surface. Handled keys don't scroll the page. Releases everything on blur. */
	attach: Attachment<HTMLElement> = (element) => {
		const offDown = on(element, 'keydown', (event) => {
			const button = KEY_MAP[event.code];
			if (!button || event.altKey || event.ctrlKey || event.metaKey) return;
			// Space on a button inside the surface (mode switch, cards, "again") activates the button, not the game.
			if (button === 'action' && event.target !== element && event.target instanceof HTMLButtonElement) return;
			event.preventDefault();
			if (!event.repeat) this.press(button);
		});
		const offUp = on(element, 'keyup', (event) => {
			const button = KEY_MAP[event.code];
			if (button) this.release(button);
		});
		const offBlur = on(element, 'blur', () => this.reset());
		return () => {
			offDown();
			offUp();
			offBlur();
			this.reset();
		};
	};
}
