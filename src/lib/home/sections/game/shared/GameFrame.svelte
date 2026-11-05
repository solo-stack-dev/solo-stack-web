<!--
	@component
	The game frame of the 22:00 section.

	Poster (`poster` snippet; `title` + play button set into its lower left, the whole poster clicks) → click imports the game chunk via `load` → playing. The frame owns pause
	(button, P/Escape, off screen, hidden tab), restart (remounts the game), score + local high score, focus on the game
	surface, and touch buttons. Games get their default `tuning` values.

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
		/** Game title shown on the poster beside the play button (a message). */
		title?: string;
		/** A new local high score was stored (the section shows it beside the frame). */
		onrecord?: (value: number) => void;
		class?: string;
	}

	let { gameId, load, label, poster, title, onrecord, class: className = '' }: Props = $props();

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
		if (value > highScore) {
			highScore = saveHighScore(gameId, value);
			onrecord?.(highScore);
		}
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
			<div class="scrim" aria-hidden="true"></div>
			<div class="overlay is-static">
				<!-- One button: disc + title + label; its ::after stretches over the whole poster -->
				<button type="button" class="play-cta" onclick={play} disabled={status === 'loading'}>
					<span class="play-button" aria-hidden="true">
						<svg viewBox="0 0 24 24" width="28" height="28"><path d="M8 5v14l11-7z" fill="currentColor" /></svg>
					</span>
					<span class="play-text">
						{#if title}<span class="play-title font-display font-black tracking-wordmark uppercase">{title}</span>{/if}
						<span class="play-label label">{m.home_game_play()}</span>
					</span>
				</button>
				{#if status === 'loading'}
					<p class="status font-mono text-xs tracking-clock" role="status">{m.home_game_loading()}</p>
				{:else if status === 'error'}
					<p class="status text-sm" role="alert">{m.home_game_load_error()}</p>
				{/if}
			</div>
		{/if}
	</div>
</div>

<style>
	.game-frame {
		position: relative;
		display: grid;
		gap: 1rem;
		width: 100%;
	}

	/* Ink-ruled mat: one closed cream hairline a little outside the stage, corners meeting (no crop marks sticking out). Outside the
	   clipping stage so the game never covers it. */
	.game-frame::before {
		content: '';
		position: absolute;
		inset: -0.45rem;
		border: 1px solid color-mix(in oklab, var(--color-cream) 26%, transparent);
		border-radius: 3px;
		pointer-events: none;
	}

	.stage {
		position: relative;
		overflow: hidden;
		aspect-ratio: var(--game-aspect, 16 / 9);
		border-radius: 2px;
		background: var(--color-ink);
		box-shadow: var(--glow-lg);
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

	/* Resting poster: no veil over the art. The title and play button sit in the poster's calm lower left (every poster keeps
	   that third quiet); a soft ink pool there carries the cream type. */
	.overlay.is-static {
		place-content: end start;
		justify-items: start;
		gap: 0.6rem;
		padding: clamp(1.25rem, 4.5%, 3rem);
		background: none;
		cursor: auto;
	}

	.scrim {
		position: absolute;
		inset: 0;
		pointer-events: none;
		background: radial-gradient(
			ellipse 62% 58% at 0% 100%,
			color-mix(in oklab, var(--color-ink) 72%, transparent),
			color-mix(in oklab, var(--color-ink) 38%, transparent) 55%,
			transparent
		);
	}

	.play-cta {
		display: flex;
		align-items: center;
		gap: clamp(0.9rem, 2vw, 1.4rem);
		text-align: start;
		cursor: pointer;
	}

	/* the whole poster is the play target */
	.play-cta::after {
		content: '';
		position: absolute;
		inset: 0;
	}

	.play-cta:focus-visible {
		outline-offset: 6px;
	}

	.play-cta:disabled {
		cursor: progress;
	}

	.play-cta:disabled .play-button {
		opacity: 0.7;
	}

	.play-text {
		display: grid;
		gap: 0.45rem;
	}

	.play-title {
		font-size: clamp(1.6rem, 3vw, 2.9rem);
		line-height: 0.92;
		color: var(--color-cream);
		text-shadow: var(--halo-ink);
		text-wrap: balance;
		/* two short lines rather than one long one into the art (every poster's subject starts right of the lower-left third) */
		max-width: 11ch;
	}

	.play-label {
		color: var(--color-butter);
		text-shadow: var(--halo-ink);
	}

	.status {
		color: var(--color-cream);
		text-shadow: var(--halo-ink);
	}

	.play-cta .play-button {
		flex: none;
		transition:
			scale var(--dur-hover) var(--ease-settle),
			box-shadow var(--dur-hover) ease;
	}

	.play-cta:hover .play-button,
	.play-cta:focus-visible .play-button {
		scale: 1.06;
		box-shadow: var(--glow-md), var(--glow-lg);
	}

	/* Phones (4:5 crop, the subject fills more of it): a painted ink feather from below instead of the corner pool. */
	@media (max-width: 40rem) {
		.scrim {
			background: color-mix(in oklab, var(--color-ink) 78%, transparent);
			mask: var(--feather-up) bottom / 100% 48% no-repeat;
		}

		.play-cta .play-button {
			width: 3.75rem;
			height: 3.75rem;
		}
	}

	.play-button {
		display: grid;
		place-items: center;
		width: 4.5rem;
		height: 4.5rem;
		border-radius: 999px;
		background: var(--color-butter);
		color: var(--color-night);
		box-shadow: var(--glow-md);
	}
</style>
