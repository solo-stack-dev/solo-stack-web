import type { Component } from 'svelte';
import type { GameButton, GameInput } from './input.svelte.ts';

/**
 * One debug-tunable number (gravity, speed, …). The lab shows a slider per def; the homepage uses `default`.
 * `key` is a code identifier, shown verbatim in the internal debug panel.
 */
export interface TuningDef {
	key: string;
	min: number;
	max: number;
	step: number;
	default: number;
}

/** Props every game component receives from GameFrame. */
export interface GameProps {
	/** True while the game must not advance: pause button, off screen, hidden tab. Stop your loop. */
	paused: boolean;
	/** Current tuning values keyed by `TuningDef.key`. Reactive: read it every frame, sliders change it live. */
	tuning: Record<string, number>;
	/** Keyboard + touch input, already wired to the frame. Poll it in your loop. */
	input: GameInput;
	/** `prefers-reduced-motion: reduce`. Play is still allowed (user initiated); offer a calmer mode (less shake, no flashes). */
	reducedMotion: boolean;
	/** Report the current score (absolute, not a delta). GameFrame shows it and updates the local high score. */
	onScore?: (score: number) => void;
	/** Report the end of a round. GameFrame highlights restart. Restart remounts the component (fresh state). */
	onGameOver?: (score: number) => void;
	/** The game restarted itself (e.g. jump/tap after game over), not via the frame's button. GameFrame clears the game-over highlight and shown score. */
	onRestart?: () => void;
}

/** Module contract of `<candidate>/index.ts`: `default` (component), `tuning` (debug defs), optional `controls` (touch buttons). */
export interface GameModule {
	default: Component<GameProps>;
	tuning: TuningDef[];
	/** On-screen touch buttons, in order. Default `['left', 'right', 'action']`. */
	controls?: GameButton[];
}

export type GameLoader = () => Promise<GameModule>;

export const defaultTuning = (defs: readonly TuningDef[]): Record<string, number> => Object.fromEntries(defs.map((def) => [def.key, def.default]));
