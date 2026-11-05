<!--
	@component
	On-screen buttons feeding a GameInput (pointer events, multi-touch safe), coarse pointers only. Not focusable:
	keyboard users use the keys on the game surface.
-->
<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import type { GameButton, GameInput } from './input.svelte.ts';

	interface Props {
		input: GameInput;
		buttons?: GameButton[];
	}

	let { input, buttons = ['left', 'right', 'action'] }: Props = $props();

	const labels: Record<GameButton, () => string> = {
		left: m.home_game_touch_left,
		right: m.home_game_touch_right,
		up: m.home_game_touch_up,
		down: m.home_game_touch_down,
		action: m.home_game_touch_action
	};

	const glyphs: Record<GameButton, string> = {
		left: 'M15 5 8 12l7 7',
		right: 'm9 5 7 7-7 7',
		up: 'm5 15 7-7 7 7',
		down: 'm5 9 7 7 7-7',
		action: 'M12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12Z'
	};

	function bind(button: GameButton) {
		return {
			onpointerdown: (event: PointerEvent) => {
				event.preventDefault();
				(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
				input.press(button);
			},
			onpointerup: () => input.release(button),
			onpointercancel: () => input.release(button),
			onlostpointercapture: () => input.release(button)
		};
	}
</script>

<div class="touch-controls" role="group" aria-label={m.home_game_controls_label()}>
	{#each buttons as button (button)}
		<button type="button" tabindex="-1" class={['touch-button', `is-${button}`, input.held[button] && 'is-held']} aria-label={labels[button]()} {...bind(button)}>
			<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
				<path d={glyphs[button]} fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
			</svg>
		</button>
	{/each}
</div>

<style>
	.touch-controls {
		position: absolute;
		inset: auto 0 0;
		display: none;
		justify-content: flex-start;
		gap: 0.75rem;
		padding: 0.75rem;
		pointer-events: none;
		user-select: none;
		-webkit-user-select: none;
		touch-action: none;
	}

	@media (pointer: coarse) {
		.touch-controls {
			display: flex;
		}
	}

	.touch-button {
		display: grid;
		place-items: center;
		width: 3.5rem;
		height: 3.5rem;
		border-radius: 999px;
		background: color-mix(in oklab, var(--color-ink) 55%, transparent);
		border: 1.5px solid color-mix(in oklab, var(--color-cream) 40%, transparent);
		color: var(--color-cream);
		pointer-events: auto;
		touch-action: none;
	}

	.is-action {
		margin-left: auto;
		width: 4.25rem;
		height: 4.25rem;
		color: var(--color-butter);
	}

	.is-held {
		background: color-mix(in oklab, var(--color-butter) 30%, transparent);
	}
</style>
