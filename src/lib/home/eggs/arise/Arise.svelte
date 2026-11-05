<!--
	@component
	Egg: ARISE (Solo Leveling homage, mockup 01-mascot-easter-eggs/06). Four shadow soldiers (knight, brute, assassin, tiny
	mascot as punchline) rise from a shadow pool, eyes ignite, smoke and sparks; then they burn away feet-up (~5.6 s).

	Over the content, under the paper grain. Cutouts decode before anything moves (no pop-in mid-rise). Only
	transform/opacity animate, except the dissolve (mask position). Reduced motion: finished scene fades in and out.
-->
<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import type { EggProps } from '../events.ts';
	import { calmFade } from '../fade.ts';
	import { CANVAS_ASPECT, createSoldiers, preloadSoldiers } from './figures.ts';

	let { reducedMotion, ondone }: EggProps = $props();

	const TOTAL = $derived(reducedMotion ? 3600 : 5600);
	const soldiers = createSoldiers(window.matchMedia('(max-width: 47.99rem), (max-aspect-ratio: 4/5)').matches);
	const KEYS = ['↑', '↑', '↓', '↓', '←', '→', '←', '→', 'B', 'A'];
	const letters = [...m.egg_arise_title()];
	const sparks = Array.from({ length: 22 }, () => ({
		x: Math.round(Math.random() * 100),
		size: Math.round(2 + Math.random() * 4),
		delay: Math.round(500 + Math.random() * 3000),
		duration: Math.round(1600 + Math.random() * 1400),
		rise: Math.round(25 + Math.random() * 45),
		drift: Math.round((Math.random() - 0.5) * 12)
	}));

	let ready = $state(false);

	$effect(() => {
		let timer: ReturnType<typeof setTimeout> | undefined;
		let cancelled = false;
		void preloadSoldiers().then(() => {
			if (cancelled) return;
			ready = true;
			timer = setTimeout(ondone, TOTAL + 400);
		});
		return () => {
			cancelled = true;
			clearTimeout(timer);
		};
	});
</script>

{#if ready}
	<div class="arise" class:still={reducedMotion} aria-hidden="true" {@attach reducedMotion && calmFade(TOTAL)} style:--total="{TOTAL}ms">
		<div class="flash"></div>
		<div class="dusk"></div>
		<div class="pool"></div>

		{#each soldiers as soldier, index (index)}
			<div
				class="soldier depth-{soldier.depth}"
				style:left="{soldier.x}%"
				style:height="{soldier.height * 100}vh"
				style:aspect-ratio={CANVAS_ASPECT}
				style:--delay="{soldier.delay}ms"
			>
				<div class="body">
					<div class="art" class:mirror={soldier.mirror}>
						<img src={soldier.src} alt="" draggable="false" />
						<span class="eyes" style:left="{soldier.eyes.x * 100}%" style:top="{soldier.eyes.y * 100}%"></span>
					</div>
					{#each soldier.puffs as puff, puffIndex (puffIndex)}
						<span
							class="puff"
							style:left="{puff.x}%"
							style:width="{puff.size}%"
							style:--puff-delay="{puff.delay}ms"
							style:--puff-duration="{puff.duration}ms"
							style:--puff-drift="{puff.drift}%"
						></span>
					{/each}
				</div>
			</div>
		{/each}

		{#each sparks as spark, index (index)}
			<span
				class="spark"
				style:left="{spark.x}%"
				style:width="{spark.size}px"
				style:--spark-delay="{spark.delay}ms"
				style:--spark-duration="{spark.duration}ms"
				style:--spark-rise="-{spark.rise}vh"
				style:--spark-drift="{spark.drift}vw"
			></span>
		{/each}
	</div>

	<div class="title" class:still={reducedMotion} aria-hidden="true" {@attach reducedMotion && calmFade(TOTAL)} style:--total="{TOTAL}ms">
		<p class="word">
			{#each letters as letter, index (index)}<span style:--i={index}>{letter}</span>{/each}
		</p>
		<p class="keys">
			{#each KEYS as key, index (index)}<span>{key}</span>{/each}
		</p>
	</div>
{/if}

<style>
	.arise {
		--glow: #6f7dff;
		--glow-hot: #a9d9ff;
		position: fixed;
		inset: 0;
		z-index: 2;
		overflow: hidden;
		pointer-events: none;
	}

	/* Scene ----------------------------------------------------------------------------------------------------- */

	/* darkens from the ground up, so the ink figures have something to stand in */
	.dusk {
		position: absolute;
		inset: 0;
		background: linear-gradient(to top, rgb(9 10 18 / 0.9), rgb(14 15 26 / 0.45) 35%, transparent 75%), rgb(8 9 16 / 0.5);
		opacity: 0;
		animation: dusk var(--total) ease-in-out forwards;
	}

	/* phones: hero text sits where the title goes, so darker */
	@media (max-width: 47.99rem), (max-aspect-ratio: 4/5) {
		.dusk {
			background: linear-gradient(to top, rgb(9 10 18 / 0.9), rgb(14 15 26 / 0.5) 40%, transparent 80%), rgb(8 9 16 / 0.78);
		}

		.title {
			top: 9vh;
		}
	}

	/* ink ellipse with a cold rim */
	.pool {
		position: absolute;
		left: -10vw;
		right: -10vw;
		bottom: -14vh;
		height: 30vh;
		border-radius: 50%;
		background:
			radial-gradient(closest-side, #07070d 55%, rgb(7 7 13 / 0.85) 70%, transparent),
			radial-gradient(
				closest-side,
				transparent 64%,
				color-mix(in oklab, var(--glow-hot) 70%, transparent) 70%,
				color-mix(in oklab, var(--glow) 45%, transparent) 76%,
				transparent 86%
			);
		filter: blur(4px);
		transform-origin: 50% 100%;
		scale: 0 1;
		opacity: 0;
		animation: pool var(--total) cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
	}

	.flash {
		position: absolute;
		inset: 0;
		background: radial-gradient(80% 60% at 70% 100%, color-mix(in oklab, var(--glow) 40%, transparent), transparent 70%);
		mix-blend-mode: screen;
		opacity: 0;
		animation: flash var(--total) ease-out forwards;
	}

	/* Soldiers -------------------------------------------------------------------------------------------------- */

	.soldier {
		position: absolute;
		bottom: -4vh;
		translate: -50% 105%;
		will-change: translate;
		animation: rise 1700ms var(--delay) cubic-bezier(0.3, 0.7, 0.2, 1.04) forwards;
	}

	.depth-0 {
		z-index: 3;
	}

	.depth-1 {
		z-index: 2;
		--dim: 0.82;
	}

	.depth-2 {
		z-index: 1;
		--dim: 0.92;
	}

	.body {
		position: absolute;
		inset: 0;
		/* burns away feet-up: the gradient edge sweeps from below the figure to above it */
		mask-image: linear-gradient(to bottom, #000 0 45%, transparent 55% 100%);
		mask-size: 100% 220%;
		mask-position: 0 0;
		animation: dissolve 1400ms calc(var(--total) - 2000ms + var(--delay) * 0.6) cubic-bezier(0.45, 0, 0.6, 0.6) forwards;
	}

	.art {
		position: absolute;
		inset: 0;
		filter: brightness(var(--dim, 1)) drop-shadow(0 0 1.2rem color-mix(in oklab, var(--glow) 30%, transparent));
	}

	.art img {
		display: block;
		width: 100%;
		height: 100%;
		user-select: none;
	}

	.mirror {
		scale: -1 1;
	}

	/* eye ignition: a hot flare, then a steady pulse */
	.eyes {
		position: absolute;
		width: 17%;
		aspect-ratio: 2.6;
		translate: -50% -50%;
		border-radius: 50%;
		background: radial-gradient(closest-side, var(--glow-hot), color-mix(in oklab, var(--glow) 60%, transparent) 45%, transparent);
		mix-blend-mode: screen;
		opacity: 0;
		scale: 0.2;
		animation:
			ignite 700ms calc(var(--delay) + 1350ms) cubic-bezier(0.2, 1.6, 0.4, 1) forwards,
			glow 1.6s calc(var(--delay) + 2050ms) ease-in-out infinite;
	}

	.puff {
		position: absolute;
		bottom: 2%;
		aspect-ratio: 1;
		border-radius: 50%;
		background: radial-gradient(closest-side, rgb(8 8 16 / 0.85), rgb(8 8 16 / 0.4) 60%, transparent);
		translate: -50% 0;
		opacity: 0;
		animation: puff var(--puff-duration) calc(var(--delay) + 500ms + var(--puff-delay)) ease-out infinite;
	}

	.spark {
		position: absolute;
		bottom: 4vh;
		aspect-ratio: 1;
		border-radius: 50%;
		background: var(--glow-hot);
		box-shadow:
			0 0 6px 1px var(--glow),
			0 0 14px 2px color-mix(in oklab, var(--glow) 50%, transparent);
		opacity: 0;
		animation: spark var(--spark-duration) var(--spark-delay) ease-out forwards;
	}

	/* Title ----------------------------------------------------------------------------------------------------- */

	.title {
		position: fixed;
		z-index: 2;
		left: clamp(1.25rem, 7vw, 7rem);
		/* above the hero wordmark, in the open sky */
		top: 11vh;
		pointer-events: none;
		color: var(--color-cream);
		opacity: 0;
		animation: title var(--total) ease-out forwards;
	}

	.word {
		display: flex;
		margin: 0;
		font-family: var(--font-display);
		font-size: clamp(3.5rem, 13vw, 12rem);
		font-weight: 900;
		line-height: 0.9;
		letter-spacing: var(--tracking-wordmark);
		text-transform: uppercase;
		white-space: nowrap;
		text-shadow:
			0 0 0.08em #a9d9ff,
			0 0 0.35em rgb(111 125 255 / 0.65),
			0 0.04em 0.3em rgb(14 15 16 / 0.7);
	}

	.word span {
		display: inline-block;
		opacity: 0;
		translate: 0 0.35em;
		animation: letter 700ms calc(500ms + var(--i) * 70ms) cubic-bezier(0.2, 0.9, 0.3, 1.2) forwards;
	}

	.keys {
		display: flex;
		gap: 0.7em;
		margin: 1.2rem 0 0 0.3rem;
		font-family: var(--font-mono);
		font-size: 0.8rem;
		letter-spacing: var(--tracking-clock);
		color: #a9d9ff;
		opacity: 0.75;
	}

	/* Keyframes ------------------------------------------------------------------------------------------------- */

	@keyframes dusk {
		0% {
			opacity: 0;
		}
		10%,
		80% {
			opacity: 1;
		}
		100% {
			opacity: 0;
		}
	}

	@keyframes pool {
		0% {
			scale: 0 0.6;
			opacity: 0;
		}
		9% {
			scale: 1 1;
			opacity: 1;
		}
		80% {
			scale: 1 1;
			opacity: 1;
		}
		100% {
			scale: 0.3 0.5;
			opacity: 0;
		}
	}

	@keyframes flash {
		0%,
		22% {
			opacity: 0;
		}
		27% {
			opacity: 0.55;
		}
		45%,
		100% {
			opacity: 0;
		}
	}

	@keyframes rise {
		0% {
			translate: -50% 105%;
			scale: 0.94 0.86;
		}
		70% {
			scale: 1 1.03;
		}
		100% {
			translate: -50% 0;
			scale: 1 1;
		}
	}

	@keyframes dissolve {
		75% {
			opacity: 1;
		}
		to {
			mask-position: 0 100%;
			translate: 0 -5%;
			opacity: 0;
		}
	}

	@keyframes ignite {
		0% {
			opacity: 0;
			scale: 0.2;
		}
		35% {
			opacity: 1;
			scale: 1.7;
		}
		100% {
			opacity: 0.9;
			scale: 1;
		}
	}

	@keyframes glow {
		50% {
			opacity: 0.6;
		}
	}

	@keyframes puff {
		0% {
			opacity: 0;
			translate: -50% 0;
			scale: 0.5;
		}
		25% {
			opacity: 0.9;
		}
		100% {
			opacity: 0;
			translate: calc(-50% + var(--puff-drift)) -140%;
			scale: 1.6;
		}
	}

	@keyframes spark {
		0% {
			opacity: 0;
			translate: 0 0;
		}
		15% {
			opacity: 1;
		}
		100% {
			opacity: 0;
			translate: var(--spark-drift) var(--spark-rise);
		}
	}

	@keyframes title {
		0%,
		8% {
			opacity: 0;
		}
		14%,
		74% {
			opacity: 1;
		}
		100% {
			opacity: 0;
			transform: translateY(-0.6rem);
		}
	}

	@keyframes letter {
		to {
			opacity: 1;
			translate: 0 0;
		}
	}

	/* Reduced motion: static finished scene, no smoke or sparks (calmFade on the roots) */
	.still .dusk,
	.still .pool,
	.still .soldier,
	.still .body,
	.title.still,
	.title.still .word span {
		animation: none;
		opacity: 1;
		scale: none;
		translate: none;
	}

	.still .soldier {
		translate: -50% 0;
	}

	.still .eyes {
		animation: none;
		opacity: 0.9;
		scale: 1;
	}

	.still .flash,
	.still .puff,
	.still .spark {
		display: none;
	}
</style>
