<!--
	@component
	Frame shared by every error page: wordmark (home), the 03:00 clock (the one hour the night on the homepage
	skips), the status in mono, heading, body, the way home, optional retry, and the homepage sections as plain
	links. The scene (`InkVoid`, `GiantWall`) renders behind via the `scene` snippet.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import NightClock from '#lib/home/shared/NightClock.svelte';
	import PaperGrain from '#lib/home/shared/PaperGrain.svelte';
	import { NIGHT_HOURS, type SectionId } from '#lib/home/night.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import grain from './assets/error-paper-grain.webp';

	interface Props {
		status: number;
		title: string;
		body: string;
		/** Show the reload button (server errors). */
		retry?: boolean;
		/** `void` (404) or `wall` (500 and everything else): layout and intro timing. */
		variant: 'void' | 'wall';
		scene: Snippet;
	}

	let { status, title, body, retry = false, variant, scene }: Props = $props();

	const sectionLabels: Record<SectionId, () => string> = {
		hero: m.home_nav_section_hero,
		making: m.home_nav_section_making,
		game: m.home_nav_section_game,
		'night-shift': m.home_nav_section_nightshift,
		radio: m.home_nav_section_radio,
		cinema: m.home_nav_section_cinema,
		sunrise: m.home_nav_section_sunrise
	};

	const home = $derived(localizeHref('/'));
</script>

<div class="error-page is-{variant}">
	<div class="scene">{@render scene()}</div>

	<header class="chrome">
		<a class="wordmark font-display text-lg font-black tracking-wordmark uppercase md:text-xl" href={home}>SOLO STACK</a>
		<NightClock time="03:00" placement="inline" />
	</header>

	<main class="panel" aria-labelledby="error-title">
		<p class="status font-mono tabular-nums" aria-hidden="true" style:--grain="url({grain})">{status}</p>
		<h1 id="error-title" class="title font-display font-black tracking-wordmark text-balance">
			<span class="sr-only">{status}</span>
			{title}
		</h1>
		<p class="body text-pretty">{body}</p>

		<div class="actions">
			<a class="action is-home" href={home}>
				<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11.2 12 4l8 7.2V20a1 1 0 0 1-1 1h-4.6v-5.6H9.6V21H5a1 1 0 0 1-1-1z" /></svg>
				<span>{m.error_home_link()}</span>
			</a>
			{#if retry}
				<button type="button" class="action is-retry" onclick={() => location.reload()}>
					<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12a7 7 0 1 1-2.05-4.95M19 4.5V8.2h-3.7" /></svg>
					<span>{m.error_retry()}</span>
				</button>
			{/if}
		</div>

		<nav class="sections" aria-labelledby="error-sections">
			<h2 id="error-sections" class="font-mono text-xs tracking-clock uppercase">{m.error_sections_label()}</h2>
			<ul>
				{#each NIGHT_HOURS as hour (hour.id)}
					<li>
						<a href="{home}#{hour.id}">
							<span class="font-mono text-[0.7rem] tracking-clock tabular-nums" aria-hidden="true">{hour.time}</span>
							<span>{sectionLabels[hour.id]()}</span>
						</a>
					</li>
				{/each}
			</ul>
		</nav>
	</main>

	<PaperGrain src={grain} size={256} opacity={0.16} blend="soft-light" />
</div>

<style>
	.error-page {
		position: relative;
		isolation: isolate;
		min-height: 100svh;
		display: grid;
		grid-template-rows: auto 1fr;
		color: var(--color-cream);
		background: var(--color-ink);
		overflow: clip;
	}

	.scene {
		position: fixed;
		inset: 0;
		z-index: 0;
	}

	.error-page > :global(.paper-grain) {
		z-index: 4;
	}

	/* Chrome --------------------------------------------------------------------------------------------------- */

	.chrome {
		position: relative;
		z-index: 3;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: clamp(1rem, 2.5vh, 1.75rem) clamp(1.25rem, 4vw, 3.5rem);
	}

	.wordmark {
		line-height: 1;
	}

	/* Panel ---------------------------------------------------------------------------------------------------- */

	.panel {
		position: relative;
		z-index: 2;
		align-self: center;
		display: grid;
		justify-items: start;
		gap: 0;
		width: min(100%, 36rem);
		padding: 2rem clamp(1.25rem, 6vw, 6rem) 3rem;
	}

	.status {
		margin: 0 0 0.25rem -0.06em;
		font-size: clamp(5.5rem, 15vw, 11.5rem);
		font-weight: 800;
		line-height: 0.85;
		letter-spacing: -0.06em;
		/* painted paper digits: butter pigment, cream highlight, ochre blooms, paper grain */
		background:
			var(--grain) 0 0 / 200px,
			radial-gradient(45% 55% at 22% 28%, var(--color-cream), transparent 70%),
			radial-gradient(40% 60% at 82% 78%, var(--color-ochre), transparent 75%),
			radial-gradient(30% 40% at 55% 95%, var(--color-ochre), transparent 80%),
			var(--color-butter);
		background-blend-mode: soft-light, normal, normal, normal, normal;
		background-clip: text;
		color: transparent;
		filter: drop-shadow(0 0.08em 0.2em rgb(14 15 16 / 0.6));
	}

	.title {
		margin-top: 0.75rem;
		font-size: clamp(1.6rem, 3.2vw, 2.6rem);
		line-height: 1.05;
	}

	.body {
		margin-top: 0.9rem;
		max-width: 34ch;
		font-size: 1.05rem;
		line-height: 1.55;
		color: color-mix(in oklab, var(--color-cream) 82%, transparent);
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin-top: 1.75rem;
	}

	.action {
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		min-height: 3rem;
		padding: 0 1.35rem 0 1.05rem;
		border: 2px solid var(--color-butter);
		border-radius: 999px;
		font-weight: 600;
		cursor: pointer;
		transition:
			background-color 160ms ease,
			color 160ms ease,
			translate 160ms ease;
	}

	.action svg {
		width: 1.25rem;
		height: 1.25rem;
		flex: none;
	}

	.is-home {
		background: var(--color-butter);
		color: var(--color-night);
	}

	.is-home svg {
		fill: currentColor;
	}

	.is-retry {
		color: var(--color-butter);
		background: rgb(14 15 16 / 0.55);
	}

	.is-retry svg {
		fill: none;
		stroke: currentColor;
		stroke-width: 2.2;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	.action:hover {
		translate: 0 -2px;
	}

	.is-home:hover {
		background: var(--color-cream);
		border-color: var(--color-cream);
	}

	.is-retry:hover {
		background: var(--color-butter);
		color: var(--color-night);
	}

	.sections {
		margin-top: 2.25rem;
	}

	.sections h2 {
		color: color-mix(in oklab, var(--color-cream) 55%, transparent);
	}

	.sections ul {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem 1.1rem;
		margin-top: 0.7rem;
	}

	.sections a {
		display: inline-flex;
		align-items: baseline;
		gap: 0.45rem;
		padding-block: 0.3rem;
		color: color-mix(in oklab, var(--color-cream) 85%, transparent);
		text-decoration: underline;
		text-decoration-color: transparent;
		text-underline-offset: 0.25em;
		transition: color 160ms ease;
	}

	.sections a span:first-child {
		color: color-mix(in oklab, var(--color-butter) 70%, transparent);
	}

	.sections a:hover {
		color: var(--color-butter);
		text-decoration-color: currentColor;
	}

	/* Layout per scene ----------------------------------------------------------------------------------------- */

	/* Phones: scene on top, text below on an ink wash */
	@media (max-width: 63.99rem) {
		.panel {
			align-self: end;
			width: 100%;
			padding-top: 46svh;
			background: linear-gradient(to bottom, transparent 38svh, rgb(14 15 16 / 0.88) 47svh, var(--color-ink) 60svh);
		}

		.is-wall .panel {
			padding-top: 54svh;
			background: linear-gradient(to bottom, transparent 50svh, rgb(14 15 16 / 0.86) 60svh, var(--color-ink) 76svh);
		}

		.status {
			font-size: clamp(4.5rem, 24vw, 7rem);
		}
	}

	/* Desktop: text left, on an ink pool so the scene can be busy */
	@media (min-width: 64rem) {
		.panel::before {
			content: '';
			position: absolute;
			z-index: -1;
			inset: -30% -40% -30% -40%;
			background: radial-gradient(closest-side, rgb(14 15 16 / 0.92) 40%, rgb(14 15 16 / 0.6) 70%, transparent);
			pointer-events: none;
		}

		.is-wall .panel::before {
			background: radial-gradient(closest-side, rgb(14 15 16 / 0.7) 35%, rgb(14 15 16 / 0.35) 70%, transparent);
		}
	}

	/* Entrance: text arrives after the scene has made its move */
	@media (prefers-reduced-motion: no-preference) {
		.panel > *,
		.chrome {
			animation: rise 700ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
			animation-delay: calc(var(--intro) + var(--i, 0) * 70ms);
		}

		.panel::before {
			animation: fade 900ms ease-out both;
			animation-delay: calc(var(--intro) - 200ms);
		}

		.is-void {
			--intro: 1100ms;
		}

		.is-wall {
			--intro: 250ms;
		}

		.chrome {
			--i: 0;
		}

		.status {
			--i: 1;
		}

		.title {
			--i: 2;
		}

		.body {
			--i: 3;
		}

		.actions {
			--i: 4;
		}

		.sections {
			--i: 5;
		}
	}

	@keyframes fade {
		from {
			opacity: 0;
		}
	}

	@keyframes rise {
		from {
			opacity: 0;
			translate: 0 0.9rem;
		}
	}
</style>
