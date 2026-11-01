<!--
	@component
	The game frame of the 22:00 section.

	Poster state (your `poster` snippet + play button) → click loads the game chunk (dynamic import via `load`) →
	playing. The frame owns: pause (button, P/Escape, off screen, hidden tab), instant restart (remounts the game),
	score + local high score in mono (games that restart themselves call `onRestart`), keyboard focus on the game surface, and on-screen touch buttons.
	Games receive their default `tuning` values.

	```svelte
	<GameFrame gameId="stack-to-moon" load={() => import('../stack-to-moon/index.ts')} label="…">
		{#snippet poster()}<enhanced:img src={posterArt} alt="" />{/snippet}
	</GameFrame>
	```
-->
<script lang="ts">
	import { tick, type Snippet } from 'svelte';
	import { m } from '#lib/paraglide/messages.js';
	import { reducedMotion } from '#lib/home/shared/motion.svelte.ts';
	import { loadHighScore, saveHighScore } from './highscore.ts';
	import { GameInput, type GameButton } from './input.svelte.ts';
	import { PauseController } from './pause.svelte.ts';
	import TouchControls from './TouchControls.svelte';
	import { defaultTuning, type GameLoader, type GameModule } from './types.ts';

	interface Props {
		/** Stable id, used as the high score storage key. */
		gameId: string;
		load: GameLoader;
		/** Accessible name of the game surface (a message). */
		label: string;
		/** Painted poster shown before play (fills the frame). */
		poster?: Snippet;
		class?: string;
	}

	let { gameId, load, label, poster, class: className = '' }: Props = $props();

	type Status = 'poster' | 'loading' | 'playing' | 'error';

	let status = $state<Status>('poster');
	let module = $state.raw<GameModule | null>(null);
	let tuning = $state<Record<string, number>>({});
	let score = $state(0);
	let highScore = $state(0);
	let over = $state(false);
	let run = $state(0);
	let surface = $state<HTMLDivElement>();

	const input = new GameInput();
	const pause = new PauseController();
	const controls = $derived<GameButton[]>(module?.controls ?? ['left', 'right', 'action']);

	$effect(() => {
		highScore = loadHighScore(gameId);
	});

	async function play() {
		if (status === 'loading') return;
		status = 'loading';
		try {
			const loaded = module ?? (await load());
			if (!module) tuning = defaultTuning(loaded.tuning);
			module = loaded;
			status = 'playing';
			pause.user = false;
			await tick();
			surface?.focus();
		} catch {
			status = 'error';
		}
	}

	function restart() {
		score = 0;
		over = false;
		input.reset();
		pause.user = false;
		run += 1;
		void tick().then(() => surface?.focus());
	}

	function onScore(value: number) {
		score = value;
		if (value > highScore) highScore = saveHighScore(gameId, value);
	}

	function onGameOver(value: number) {
		onScore(value);
		over = true;
	}

	// The game started a new round on its own (tap/jump after game over): same frame state as a restart, no remount.
	function onRestart() {
		score = 0;
		over = false;
	}

	function onkeydown(event: KeyboardEvent) {
		if (status !== 'playing') return;
		if (event.code === 'KeyP' || event.code === 'Escape') {
			event.preventDefault();
			pause.toggle();
		} else if (event.code === 'KeyR' && !event.ctrlKey && !event.metaKey) {
			event.preventDefault();
			restart();
		}
	}

	const pad = (value: number) => String(Math.floor(value)).padStart(6, '0');
</script>

<div class={['game-frame', className]} data-game={gameId} data-status={status} {@attach pause.attach}>
	<div class="stage">
		{#if status === 'playing' && module}
			<!-- The game surface must take focus and keys (arrows, A/D, Space, P, R); role="application" passes them through to it. -->
			<!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
			<div bind:this={surface} class="surface" tabindex="0" role="application" aria-label={label} {onkeydown} {@attach input.attach}>
				{#key run}
					<module.default paused={pause.paused} {tuning} {input} reducedMotion={reducedMotion.current} {onScore} {onGameOver} {onRestart} />
				{/key}
			</div>

			<div class="hud font-mono text-xs tracking-clock tabular-nums">
				<p><span class="text-cream/60">{m.home_game_score()}</span> {pad(score)}</p>
				<p><span class="text-cream/60">{m.home_game_highscore()}</span> {pad(highScore)}</p>
			</div>

			<div class="hud-buttons">
				<button
					type="button"
					class="icon-button"
					aria-label={pause.user ? m.home_game_resume() : m.home_game_pause()}
					aria-pressed={pause.user}
					onclick={() => pause.toggle()}
				>
					<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
						{#if pause.user}
							<path d="M8 5v14l11-7z" fill="currentColor" />
						{:else}
							<path d="M7 5h3v14H7zM14 5h3v14h-3z" fill="currentColor" />
						{/if}
					</svg>
				</button>
				<button type="button" class={['icon-button', over && 'is-highlight']} aria-label={m.home_game_restart()} onclick={restart}>
					<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
						<path d="M4 12a8 8 0 1 0 2.3-5.6M4 4v4h4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
					</svg>
				</button>
			</div>

			{#if pause.user}
				<button type="button" class="overlay" onclick={() => pause.toggle()}>
					<span class="play-button" aria-hidden="true">
						<svg viewBox="0 0 24 24" width="28" height="28"><path d="M8 5v14l11-7z" fill="currentColor" /></svg>
					</span>
					<span class="sr-only">{m.home_game_resume()}</span>
				</button>
			{/if}

			<TouchControls {input} buttons={controls} />
		{:else}
			<div class="poster">{@render poster?.()}</div>
			<div class="overlay is-static">
				<button type="button" class="play-cta font-display font-black tracking-wordmark uppercase" onclick={play} disabled={status === 'loading'}>
					<span class="play-button" aria-hidden="true">
						<svg viewBox="0 0 24 24" width="28" height="28"><path d="M8 5v14l11-7z" fill="currentColor" /></svg>
					</span>
					{m.home_game_play()}
				</button>
				{#if status === 'loading'}
					<p class="font-mono text-xs tracking-clock text-cream/70" role="status">{m.home_game_loading()}</p>
				{:else if status === 'error'}
					<p class="text-sm text-cream/80" role="alert">{m.home_game_load_error()}</p>
				{/if}
			</div>
		{/if}
	</div>
</div>

<style>
	.game-frame {
		display: grid;
		gap: 1rem;
		width: 100%;
	}

	.stage {
		position: relative;
		overflow: hidden;
		aspect-ratio: var(--game-aspect, 16 / 9);
		border-radius: 1.25rem;
		background: var(--color-ink);
		box-shadow:
			0 0 0 1px color-mix(in oklab, var(--color-cream) 14%, transparent),
			0 30px 80px -30px color-mix(in oklab, var(--color-butter) 25%, transparent);
	}

	@media (max-width: 40rem) {
		.stage {
			aspect-ratio: var(--game-aspect-mobile, 4 / 5);
		}
	}

	.surface,
	.poster {
		position: absolute;
		inset: 0;
	}

	.surface:focus-visible {
		outline-offset: -3px;
	}

	.hud {
		position: absolute;
		z-index: 2;
		top: 0.9rem;
		left: 1rem;
		display: grid;
		gap: 0.3rem;
		pointer-events: none;
	}

	.hud-buttons {
		position: absolute;
		z-index: 2;
		top: 0.6rem;
		right: 0.6rem;
		display: flex;
		gap: 0.4rem;
	}

	.icon-button {
		display: grid;
		place-items: center;
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 999px;
		background: color-mix(in oklab, var(--color-ink) 60%, transparent);
		color: var(--color-cream);
		cursor: pointer;
	}

	.icon-button.is-highlight {
		background: var(--color-butter);
		color: var(--color-night);
	}

	.overlay {
		position: absolute;
		inset: 0;
		display: grid;
		place-content: center;
		justify-items: center;
		gap: 1rem;
		background: color-mix(in oklab, var(--color-ink) 45%, transparent);
		cursor: pointer;
	}

	.overlay.is-static {
		cursor: auto;
	}

	.play-cta {
		display: grid;
		justify-items: center;
		gap: 0.75rem;
		font-size: clamp(1rem, 2.5vw, 1.5rem);
		cursor: pointer;
	}

	.play-cta:disabled {
		cursor: progress;
		opacity: 0.7;
	}

	.play-button {
		display: grid;
		place-items: center;
		width: 4.5rem;
		height: 4.5rem;
		border-radius: 999px;
		background: var(--color-butter);
		color: var(--color-night);
		box-shadow: 0 0 40px color-mix(in oklab, var(--color-butter) 55%, transparent);
	}
</style>
