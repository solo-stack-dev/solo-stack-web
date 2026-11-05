<!--
	@component
	21:00 What I make (docs/HANDOFF-HOMEPAGE.md §5.2). One continuous ink line enters from the left, draws the current shape mid-stage and
	runs on to the laptop screen on the cliff, which lights up at the end. One viewport tall, scrolls like any section (no pinning). While
	the stage is on screen the line rotates on its own through six states (idea → AI → code → side projects → business → moon): morph,
	then a dwell while the bloom grows (the active dot's ring fills); from the moon the line pours into the laptop and the idea draws in anew.
	Pauses on hover over the drawing or the controls, keyboard focus in the controls, a hidden tab, off screen, and the pause button
	(WCAG 2.2.2). Pillars and dots jump to a state (arrow keys move along the row). The rAF loop runs only on screen.

	Geometry: all scene layers use plate px (2560×1440 desktop, 1080×2340 portrait) inside `.frame`, a plate-aspect box scaled by `--s` to
	cover the stage, so line, blooms and painted laptop stay aligned. Shapes: paths.ts (from scripts/making-paths.mjs); runtime: morph.ts.

	Reduced motion: no autoplay and no morph; the stage rests on one state (full bloom) and the pillars and dots switch it instantly. One
	still frame keeps the painted composition (the line running into the laptop) that a list of six separate figures lost.
-->
<script lang="ts">
	import type { Attachment } from 'svelte/attachments';
	import { on } from 'svelte/events';
	import { MediaQuery } from 'svelte/reactivity';
	import { m } from '#lib/paraglide/messages.js';
	import { NIGHT_HOURS } from '#lib/home/night.ts';
	import NightClock from '#lib/home/shared/NightClock.svelte';
	import { RafLoop, inView, pageVisibility, reducedMotion } from '#lib/home/shared/motion.svelte.ts';
	import { BLOOM_BOX, LAYOUTS, LINE_POINTS, PILLARS, STATE_IDS, bloomMask, composeLine, morphPoints, toPathData, type MakingStateId } from './morph.ts';
	// Bloom width ladder (rendered ~200–440 CSS px). `…&enhanced` types: sections/hero/imagetools.d.ts.
	import bloomIdea from './assets/making-bloom-idea.webp?w=900;640;450;300&quality=45&enhanced';
	import bloomAi from './assets/making-bloom-ai.webp?w=900;640;450;300&quality=45&enhanced';
	import bloomCode from './assets/making-bloom-code.webp?w=900;640;450;300&quality=45&enhanced';
	import bloomPhone from './assets/making-bloom-phone.webp?w=900;640;450;300&quality=45&enhanced';
	import bloomChart from './assets/making-bloom-chart.webp?w=900;640;450;300&quality=45&enhanced';
	import bloomMoon from './assets/making-bloom-moon.webp?w=900;640;450;300&quality=45&enhanced';

	const BLOOMS: Record<MakingStateId, typeof bloomIdea> = { idea: bloomIdea, ai: bloomAi, code: bloomCode, phone: bloomPhone, chart: bloomChart, moon: bloomMoon };
	const TITLES: Record<MakingStateId, () => string> = {
		idea: m.home_making_state_idea_title,
		ai: m.home_making_state_ai_title,
		code: m.home_making_state_code_title,
		phone: m.home_making_state_phone_title,
		chart: m.home_making_state_chart_title,
		moon: m.home_making_state_moon_title
	};
	// Bloom masks (SVG data URLs) are defined once as `--mask-<id>` on the section, so the HTML carries each URL once.
	const MASK_VARS = STATE_IDS.map((id) => `--mask-${id}: ${bloomMask(id)}`).join('; ');
	const MASKS = Object.fromEntries(STATE_IDS.map((id) => [id, `var(--mask-${id})`])) as Record<MakingStateId, string>;

	/** Seconds: morph to the next state; the moon → idea loop (retract into the laptop, draw in anew); rest per state (bloom, dot ring). */
	const MORPH = 1.4;
	const REDRAW = 2.6;
	const DWELL = 4;
	const LAST = STATE_IDS.length - 1;

	// Same breakpoint as the CSS below: portrait-ish viewports use the tall plate and the vertical line.
	const portrait = new MediaQuery('(max-aspect-ratio: 1/1)', false);
	const layoutId = $derived(portrait.current ? 'mobile' : 'desktop');
	const layout = $derived(LAYOUTS[layoutId]);
	const initialLine = $derived(toPathData(composeLine(layoutId, STATE_IDS[0])));
	// The laptop screen in percent of the plate: its clip polygon and center (for the halo).
	const screenClip = $derived(`polygon(${layout.screen.map((p) => `${(p.x / layout.width) * 100}% ${(p.y / layout.height) * 100}%`).join(', ')})`);
	const screenX = $derived(layout.screen.reduce((sum, p) => sum + p.x, 0) / 4);
	const screenY = $derived(layout.screen.reduce((sum, p) => sum + p.y, 0) / 4);

	/** The 21:00 sky color backs the plate in the wipe overlap (night.ts). */
	const SKY = NIGHT_HOURS.find((hour) => hour.id === 'making')!.sky;

	/** State named by title, pillars and dots (switches mid-morph, or at once on a click). */
	let active = $state(0);
	/** The line rests (no morph running): the active dot's dwell ring shows; `rests` restarts it. */
	let resting = $state(true);
	let rests = $state(0);
	let userPaused = $state(false);
	let hovered = $state(false);
	let keyboardFocus = $state(false);
	/** Enough of the stage on screen to play (`watchStage`); also enables the drawing's hover zone. */
	let onStage = $state(false);
	const playing = $derived(onStage && !userPaused && !hovered && !keyboardFocus && pageVisibility.current && !reducedMotion.current);

	let line: SVGPathElement;
	let ink: SVGSVGElement;
	let glow: HTMLElement;
	const blooms: HTMLDivElement[] = [];
	const dots: HTMLButtonElement[] = [];
	const pillarButtons: HTMLButtonElement[] = [];

	// Ink grain: a small noise tile generated once on the client, used as a stroke pattern over the solid line.
	let grain = $state('');
	$effect(() => {
		const size = 128;
		const canvas = document.createElement('canvas');
		canvas.width = canvas.height = size;
		const context = canvas.getContext('2d');
		if (!context) return;
		const image = context.createImageData(size, size);
		let seed = 21;
		const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
		for (let i = 0; i < size * size; i++) {
			const speck = random();
			// mostly clear, some soft dry-brush gaps, a few dark flecks
			const alpha = speck > 0.93 ? 200 : speck > 0.7 ? 70 * random() : 0;
			image.data.set([24, 25, 27, alpha], i * 4);
		}
		context.putImageData(image, 0, 0);
		grain = canvas.toDataURL();
	});

	/**
	 * Visibility gate: half the stage on screen, or three quarters while it still enters from below (the hero → 21:00 wipe is then still
	 * revealing the drawing). The hover zone lies over the hero's lower half during the wipe, so it waits for the same gate.
	 */
	const watchStage = inView(
		(_, entry) => {
			onStage = entry.intersectionRatio >= (entry.boundingClientRect.top > 0 ? 0.75 : 0.5) - 0.001;
			if (!onStage) hovered = false;
		},
		{ threshold: [0, 0.5, 0.75, 1] }
	);

	// Morph state (per frame, not reactive). `points` is the drawn line; every morph starts from a snapshot of it, so a click mid-morph
	// continues from where the line is.
	let from = 0;
	let to = 0;
	let t = 1;
	let kind: 'morph' | 'redraw' = 'morph';
	let dwell = 0;
	const points = new Float32Array(LINE_POINTS * 2);
	const fromPoints = new Float32Array(LINE_POINTS * 2);
	let drawnLayout = '';
	let redrawPhase = -1;
	let dirty = true;
	const levels = new Float32Array(STATE_IDS.length);
	const written = new Float32Array(STATE_IDS.length).fill(-1);
	let glowWritten = -1;
	let dashWritten = '';

	const smooth = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
	const target = () => composeLine(layoutId, STATE_IDS[to]);

	function begin(state: number, how: 'morph' | 'redraw') {
		fromPoints.set(points);
		from = to;
		to = state;
		t = 0;
		kind = how;
		dwell = 0;
		resting = false;
		redrawPhase = -1;
	}

	/** Jump to a state (pillar, dot, arrow key): morph there and restart the dwell. */
	function goTo(state: number) {
		active = state;
		dwell = 0;
		if (reducedMotion.current) return;
		if (t >= 1 && state === to) {
			rests++;
			return;
		}
		// During the moon → idea loop: retarget it (once it draws in, that draw starts over with the new shape).
		if (kind === 'redraw' && t < 1) {
			to = state;
			t = Math.min(t, 0.5);
			redrawPhase = -1;
			return;
		}
		begin(state, 'morph');
	}

	const loop = new RafLoop((dt) => {
		if (layoutId !== drawnLayout) {
			// First frame, or a switch across the portrait breakpoint: settle on the target in the new plate coordinates.
			points.set(target());
			fromPoints.set(points);
			if (t < 1) t = 0.9999;
			drawnLayout = layoutId;
			dirty = true;
		}

		let dash = '';
		if (t < 1) {
			t = Math.min(1, t + dt / (kind === 'morph' ? MORPH : REDRAW));
			if (kind === 'morph') {
				morphPoints(points, fromPoints, target(), t);
				dirty = true;
			} else {
				// Redraw: until 0.45 the line retracts into the laptop, then it is gone, from 0.55 the new shape draws in from the left edge.
				const phase = t < 0.5 ? 0 : 1;
				if (phase !== redrawPhase) {
					points.set(phase ? target() : fromPoints);
					redrawPhase = phase;
					dirty = true;
				}
				const offset = t < 0.45 ? -1.02 * smooth(t / 0.45) : t < 0.55 ? 1.02 : 1.02 * (1 - smooth((t - 0.55) / 0.45));
				if (t < 1) dash = String(Math.round(offset * 1000) / 1000);
			}
			if (t >= 0.5 && active !== to) active = to;
			if (t >= 1) {
				resting = true;
				rests++;
			}
		} else if (playing) {
			dwell += dt;
			if (dwell >= DWELL) begin(to === LAST ? 0 : to + 1, to === LAST ? 'redraw' : 'morph');
		}

		if (dirty) {
			line.setAttribute('d', toPathData(points));
			dirty = false;
		}
		if (dash !== dashWritten) {
			ink.style.strokeDasharray = dash ? '1 2' : '';
			ink.style.strokeDashoffset = dash;
			dashWritten = dash;
		}

		// Blooms grow once the line rests at a state, and fade as soon as it morphs on.
		for (let i = 0; i < levels.length; i++) {
			const rest = t >= 1 && i === to ? 1 : 0;
			levels[i] += (rest - levels[i]) * (1 - Math.exp(-dt * (rest ? 2.6 : 5)));
			if (Math.abs(rest - levels[i]) < 0.002) levels[i] = rest;
			const leaving = t < 1 && i === from ? Math.max(0, 1 - t / (kind === 'morph' ? 0.5 : 0.4)) : 1;
			const value = Math.round(levels[i] * leaving * 1000) / 1000;
			if (value !== written[i]) {
				blooms[i].style.opacity = String(value);
				blooms[i].style.transform = `scale(${0.82 + 0.18 * value})`;
				written[i] = value;
			}
		}

		// The laptop lights up as the line reaches the moon, and stays lit while the loop pours the line back into it.
		const lit =
			t >= 1
				? Number(to === LAST)
				: kind === 'morph'
					? (from === LAST ? 1 - smooth(t) : 0) + (to === LAST ? smooth(t) : 0)
					: (from === LAST ? 1 - smooth((t - 0.35) / 0.4) : 0) + (to === LAST ? smooth((t - 0.6) / 0.4) : 0);
		const screenGlow = Math.round(lit * 1000) / 1000;
		if (screenGlow !== glowWritten) {
			glow.style.opacity = String(screenGlow);
			glowWritten = screenGlow;
		}
	});

	$effect(() => {
		loop.paused = reducedMotion.current;
	});

	// Reduced motion: one still frame of the active state, redrawn when a control switches it.
	$effect(() => {
		if (!reducedMotion.current) return;
		to = active;
		t = 1;
		line.setAttribute('d', toPathData(composeLine(layoutId, STATE_IDS[active])));
		ink.style.strokeDasharray = '';
		blooms.forEach((bloom, i) => {
			bloom.style.opacity = String(Number(i === active));
			bloom.style.transform = 'none';
		});
		glow.style.opacity = String(Number(active === LAST));
		// if motion is allowed again, the loop redraws everything from here
		drawnLayout = '';
		dashWritten = '';
		levels.fill(0);
		written.fill(-1);
		glowWritten = -1;
	});

	/** Arrow keys (and Home/End) move along a control row: the dots step through the states, the pillars through the pillars. */
	function onRowKey(event: KeyboardEvent, row: 'dots' | 'pillars', index: number) {
		const count = row === 'dots' ? STATE_IDS.length : PILLARS.length;
		const step = ({ ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 } as Record<string, number>)[event.key];
		const next = event.key === 'Home' ? 0 : event.key === 'End' ? count - 1 : step === undefined ? -1 : (index + step + count) % count;
		if (next < 0) return;
		event.preventDefault();
		if (row === 'dots') {
			goTo(next);
			dots[next]?.focus();
		} else {
			goTo(PILLARS[next].target);
			pillarButtons[next]?.focus();
		}
	}

	// Keyboard focus in the controls pauses; a mouse click does not (hover covers that while the pointer stays there).
	function onFocusIn(event: FocusEvent) {
		keyboardFocus = (event.target as Element).matches(':focus-visible');
	}

	function onFocusOut(event: FocusEvent) {
		const next = event.relatedTarget as Node | null;
		if (!next || !(event.currentTarget as Element).contains(next)) keyboardFocus = false;
	}

	/** Hover pause (mouse only: a touch "hover" would stick after a tap). Only the controls and the hover zone take pointer events. */
	const hover = (over: boolean) => (event: PointerEvent) => {
		if (event.pointerType === 'mouse') hovered = over && onStage;
	};
	const watchHover: Attachment<HTMLElement> = (element) => {
		const offEnter = on(element, 'pointerenter', hover(true));
		const offLeave = on(element, 'pointerleave', hover(false));
		return () => {
			offEnter();
			offLeave();
		};
	};
</script>

<!-- Hero transition: ink-wash wipe on .track (CSS below, docs/HOMEPAGE-DEV.md §6.5). -->
<section id="making" data-night-hour="21:00" class="making" style={MASK_VARS} style:--making-sky={SKY} aria-labelledby="home-making-title">
	<div class="track">
		<div
			class="stage"
			data-playing={playing ? '' : undefined}
			data-on-stage={onStage ? '' : undefined}
			style:--pw={layout.width}
			style:--ph={layout.height}
			style:--cx={layout.center.x}
			style:--cy={layout.center.y}
			style:--k={layout.scale}
			style:--box={BLOOM_BOX}
			style:--title-y={layout.titleY}
			style:--screen-x={screenX}
			style:--screen-y={screenY}
			style:--screen-clip={screenClip}
			style:--dwell="{DWELL}s"
			{@attach watchStage}
			{@attach watchHover}
		>
			<!-- Painted scene in plate coordinates: decorative only, the meaning lives in the titles and the control row. -->
			<div class="scene" aria-hidden="true">
				<div class="frame" {@attach loop.attach}>
					<!-- string src: enhanced-img derives a full width ladder from `sizes` (the plate covers the stage) -->
					<enhanced:img class="plate plate-desktop" src="./assets/making-plate.webp" alt="" sizes="max(100vw, min(178vh, 107vw))" loading="lazy" />
					<enhanced:img class="plate plate-mobile" src="./assets/making-plate-mobile.webp" alt="" sizes="100vw" loading="lazy" />
					<div class="screen-glow" bind:this={glow}></div>

					{#each STATE_IDS as id, i (id)}
						<div class="bloom-mask" data-state={id} style:mask-image={MASKS[id]} style:-webkit-mask-image={MASKS[id]}>
							<div class="bloom" {@attach (element) => void (blooms[i] = element)}>
								<enhanced:img src={BLOOMS[id]} alt="" sizes="(max-aspect-ratio: 1/1) 54vw, 31vw" loading="lazy" />
							</div>
						</div>
					{/each}

					<svg class="ink" data-layout={layoutId} viewBox="0 0 {layout.width} {layout.height}" preserveAspectRatio="none" style:--stroke={layout.stroke} bind:this={ink}>
						<defs>
							<!-- pathLength 1: the moon → idea loop retracts and redraws the line with a dash offset in 0…1 -->
							<path id="making-line" pathLength="1" bind:this={line} d={initialLine} />
							<pattern id="making-grain" patternUnits="userSpaceOnUse" width="128" height="128">
								{#if grain}<image href={grain} width="128" height="128" />{/if}
							</pattern>
						</defs>
						<use href="#making-line" class="ink-glow" />
						<use href="#making-line" class="ink-core" />
						<use href="#making-line" class="ink-grain" />
					</svg>

					<!-- the drawing and its title: hovering it pauses the rotation -->
					<div class="hover-zone"></div>
				</div>
			</div>

			<NightClock time="21:00" />
			<!-- The pillar row below names the topics on screen (the hero tagline in the same style leads into it) -->
			<h2 id="home-making-title" class="sr-only">{m.home_making_title()}</h2>

			<!-- All six titles stay in the document as a list; no live region, so the rotation never talks over a screen reader. -->
			<ol class="titles" aria-label={m.home_making_states_label()}>
				{#each STATE_IDS as id, i (id)}
					<li class={['title font-display font-black tracking-wordmark uppercase', i === active && 'is-active']}>{TITLES[id]()}</li>
				{/each}
			</ol>

			<nav class="pillars label" aria-label={m.home_making_pillars_label()} onfocusin={onFocusIn} onfocusout={onFocusOut}>
				<ul>
					{#each PILLARS as pillar, p (pillar.label)}
						{@const current = (pillar.states as readonly number[]).includes(active)}
						<li>
							<button
								type="button"
								class="pillar"
								aria-current={current ? 'step' : undefined}
								onclick={() => goTo(pillar.target)}
								onkeydown={(event) => onRowKey(event, 'pillars', p)}
								{@attach (element) => void (pillarButtons[p] = element)}
							>
								{pillar.label}
								<svg class="underline" viewBox="0 0 100 8" preserveAspectRatio="none" aria-hidden="true">
									<path d="M2 5.2 C 22 2.6, 48 3.4, 70 3 S 94 3.8, 98 2.6" />
								</svg>
							</button>
						</li>
					{/each}
				</ul>
			</nav>

			<!-- Bottom right: pause, the six states (one tab stop, arrows step), skip cue. -->
			<div class="controls" onfocusin={onFocusIn} onfocusout={onFocusOut}>
				<button type="button" class="toggle" aria-label={userPaused ? m.home_making_play() : m.home_making_pause()} onclick={() => (userPaused = !userPaused)}>
					<svg viewBox="0 0 24 24" aria-hidden="true">
						{#if userPaused}
							<path d="M8.6 5.6 C 8.3 9.7, 8.4 14.4, 8.8 18.5 C 12.1 16.5, 15.2 14.3, 18.3 12 C 15.2 9.8, 12 7.6, 8.6 5.6 Z" />
						{:else}
							<path d="M8.9 5.8 C 8.6 9.8, 8.7 14.3, 9.1 18.3 M15.1 5.6 C 14.8 9.7, 14.9 14.2, 15.2 18.4" />
						{/if}
					</svg>
				</button>
				<div class="dots" role="group" aria-label={m.home_making_states_label()}>
					{#each STATE_IDS as id, i (id)}
						<button
							type="button"
							class="dot-hit"
							aria-label={TITLES[id]()}
							aria-current={i === active ? 'step' : undefined}
							tabindex={i === active ? 0 : -1}
							onclick={() => goTo(i)}
							onkeydown={(event) => onRowKey(event, 'dots', i)}
							{@attach (element) => void (dots[i] = element)}
						>
							<span class="dot">
								{#if i === active && resting}
									{#key rests}<span class="ring"></span>{/key}
								{/if}
							</span>
						</button>
					{/each}
				</div>
				<a class="cue" href="#game" aria-label={m.home_making_skip_label()}>
					<svg viewBox="0 0 24 40" aria-hidden="true"><path d="M12 2 V37 M3 28 L12 37 L21 28" /></svg>
				</a>
			</div>
		</div>
	</div>
</section>

<style>
	.making {
		position: relative;
		--ink-cream: var(--color-cream);
		/* Ink-wash wipe: the section overlaps (and paints over) the hero's bottom by --wipe-overlap; its plate floods up over the moon as a
		   wet wash front (.track mask). Only this section's controls take pointer events, so the hero's controls below stay usable. */
		--wipe-overlap: 45svh;
		margin-top: calc(-1 * var(--wipe-overlap));
		/* Where the stage starts in the track: below the whole static wash; with the wipe, at its tail (below) */
		--stage-offset: var(--wipe-overlap);
		/* `#making` links land on the stage, not on the wash above it */
		scroll-margin-top: calc(-1 * var(--stage-offset));
		view-timeline: --making-wipe block;
		pointer-events: none;
	}

	.making :is(a, button),
	.stage[data-on-stage] .hover-zone {
		pointer-events: auto;
	}

	/* Wipe progress 0…1. Initial value 1 is unused: without animation the static fallback below applies. */
	@property --wipe {
		syntax: '<number>';
		inherits: true;
		initial-value: 1;
	}

	.track {
		position: relative;
		/* The stage starts --stage-offset below the track top, so the wash front always has room for its lobes above it.
		   Static fallback (reduced motion, no scroll-driven animations): one soft hero → plate wash across the overlap, the stage below it.
		   --wipe-b: bottom of the wash ramp (solid plate below); --wipe-w: ramp height. The ramp's top fifth is transparent, so
		   --wipe-w ≤ 1.25 × --wipe-b hides the track's straight top edge while the hero is on screen.
		   Front = intersect of two painted-ramp copies at different widths/offsets: the shape changes as it moves, never visibly repeats, and
		   the ramp's faint even haze (a straight line over the bright moon) squares away, leaving the blooms. Both tile sideways near the
		   painted (square) aspect, not smeared into a line. The solid layer is added on top. */
		--wipe-b: var(--wipe-overlap);
		--wipe-w: min(28svh, var(--wipe-overlap) * 1.25);
		--wipe-x: 30%;
		/* Overlap backing (21:00 sky, fading out below; the layers overlap by 1px, no subpixel seam): the plate's soft top edge shows sky, not
		   the hero; only the wipe mask reveals the hero. */
		background:
			linear-gradient(var(--making-sky) 0 0) top / 100% var(--wipe-overlap) no-repeat,
			linear-gradient(var(--making-sky), transparent) left 0 top calc(var(--wipe-overlap) - 1px) / 100% 30svh no-repeat;
		/* the solid layer starts inside the ramps' fully opaque bottom (last ~15 %), so its straight top never shows */
		mask-image: linear-gradient(#000 0 0), var(--wash-spread-up), var(--wash-spread-up);
		mask-repeat: no-repeat, repeat-x, repeat-x;
		mask-size:
			100% 100%,
			calc(var(--wipe-w) * 1.8) var(--wipe-w),
			calc(var(--wipe-w) * 1.3) var(--wipe-w);
		mask-position:
			0 calc(var(--wipe-b) - var(--wipe-w) * 0.1),
			var(--wipe-x) calc(var(--wipe-b) - var(--wipe-w)),
			0 calc(var(--wipe-b) - var(--wipe-w));
		mask-composite: add, intersect, add;
		padding-top: var(--stage-offset);
	}

	/* The wipe runs from page top (the overlap's share of the entry range) until the section top is --wipe-tail above the viewport top,
	   which is where the stage starts: it is unveiled exactly when it fills the viewport. The track is solid at --wipe-front,
	   which starts at the hero's bottom edge (it must never show through the translucent ramp) and crosses the viewport linearly, reaching
	   its top as the wipe ends. As the track's straight top edge is off screen by then, the ramp keeps room for deep lobes through the
	   wordmark: up to 1.6 × 48svh tall (tiles at 1.6 × the painted aspect's height), tightening only to 1.1 × the front's distance from
	   that edge. At scroll 0 only its faint first blooms touch the hero's bottom; drawing and controls fade in later (.stage). */
	@media (prefers-reduced-motion: no-preference) {
		@supports (animation-timeline: view()) {
			.making {
				--stage-offset: 25svh;
			}

			.track {
				--wipe-tail: var(--stage-offset);
				--wipe-front: calc(var(--wipe-overlap) * (1 - var(--wipe)) + var(--wipe-tail) * var(--wipe));
				--wipe-w: min(calc((28svh + var(--wipe) * 20svh) * 1.6), calc(var(--wipe-front) * 1.1));
				--wipe-b: calc(var(--wipe-front) + var(--wipe-w) * 0.1);
				--wipe-x: calc(10% + var(--wipe) * 45%);
				mask-size:
					100% 100%,
					calc(var(--wipe-w) * 1.125) var(--wipe-w),
					calc(var(--wipe-w) * 0.8125) var(--wipe-w);
				animation: making-wipe linear both;
				animation-timeline: --making-wipe;
				animation-range: entry 45% contain 25svh;
			}
		}
	}

	@keyframes making-wipe {
		from {
			--wipe: 0;
		}
		to {
			--wipe: 1;
		}
	}

	.stage {
		position: relative;
		height: 100svh;
		overflow: hidden;
		container-type: size;
		/* Plate px → CSS px: cover the stage, but shrink on narrow landscape windows to keep the laptop in view (the plate letterboxes into
		   the sky via its faded edges). Resolved in descendants (cq units). */
		--s: max(100cqw / 2560, min(100cqh / 1440, 100cqw / 2400));
	}

	/* During the wipe only the plate floods in; drawing, clock, titles and controls follow once the front passes the middle (--wipe is 1
	   without the animation). */
	.stage > :global(:not(.scene)),
	.bloom-mask,
	.ink {
		opacity: clamp(0, (var(--wipe) - 0.35) / 0.3, 1);
	}

	/* ── scene ───────────────────────────────────────────────────────────── */

	.scene {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	.frame {
		position: absolute;
		left: 50%;
		top: 50%;
		width: calc(var(--pw) * var(--s));
		height: calc(var(--ph) * var(--s));
		translate: -50% -50%;
		/* Painted soft edges. Bottom: shared feather into the 22:00 mist. Top (meets the wipe sky): intersect of two
		   bloom-wash copies near their painted aspect, ≥ 18svh tall: never a cut, never the feather's streaks stretched over the bright cloud. */
		--feather-top: max(18svh, calc(var(--ph) * var(--s) * 0.08));
		--feather-bottom: calc(var(--ph) * var(--s) * 0.18);
		mask-image: linear-gradient(#000 0 0), var(--feather-down), var(--wash-spread-up), var(--wash-spread-up);
		mask-repeat: no-repeat, no-repeat, repeat-x, repeat-x;
		mask-size:
			100% calc(100% - var(--feather-top) - var(--feather-bottom) + 2px),
			100% var(--feather-bottom),
			calc(var(--feather-top) * 1.8) var(--feather-top),
			calc(var(--feather-top) * 1.3) var(--feather-top);
		mask-position:
			0 calc(var(--feather-top) - 1px),
			0 100%,
			37% 0,
			0 0;
		mask-composite: add, add, intersect, add;
	}

	.plate {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}

	.plate-mobile {
		display: none;
	}

	/* Laptop screen switches on at the last state: light wash clipped to the painted screen plus a warm spill. One layer blended as a whole
	   (static gradients, no animation). */
	.screen-glow {
		position: absolute;
		inset: 0;
		background: radial-gradient(
			calc(240 / var(--pw) * 100%) calc(190 / var(--ph) * 100%) at calc(var(--screen-x) / var(--pw) * 100%) calc(var(--screen-y) / var(--ph) * 100%),
			color-mix(in oklab, var(--color-butter) 34%, transparent),
			color-mix(in oklab, var(--color-butter) 10%, transparent) 45%,
			transparent
		);
		mix-blend-mode: screen;
		opacity: 0;
	}

	.screen-glow::before {
		content: '';
		position: absolute;
		inset: 0;
		clip-path: var(--screen-clip);
		background: color-mix(in oklab, var(--color-cream) 55%, transparent);
	}

	.bloom-mask {
		position: absolute;
		left: calc((var(--cx) - var(--box) / 2 * var(--k)) / var(--pw) * 100%);
		top: calc((var(--cy) - var(--box) / 2 * var(--k)) / var(--ph) * 100%);
		width: calc(var(--box) * var(--k) / var(--pw) * 100%);
		aspect-ratio: 1;
		mask-size: 100% 100%;
		-webkit-mask-size: 100% 100%;
	}

	.bloom {
		width: 100%;
		height: 100%;
		opacity: 0;
		transform: scale(0.82);
		will-change: opacity, transform;
	}

	.bloom :global(img) {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.ink {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		overflow: visible;
		fill: none;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	.ink-glow {
		stroke: var(--color-butter);
		stroke-width: calc(var(--stroke) * 3.2);
		opacity: 0.12;
	}

	.ink-core {
		stroke: var(--ink-cream);
		stroke-width: var(--stroke);
	}

	.ink-grain {
		stroke: url(#making-grain);
		stroke-width: calc(var(--stroke) * 1.05);
	}

	/* The drawing's bloom box down to below its title (plate px). Takes pointer events only once the stage is on screen (it covers the
	   hero's lower half during the wipe). */
	.hover-zone {
		position: absolute;
		left: calc((var(--cx) - var(--box) / 2 * var(--k)) / var(--pw) * 100%);
		top: calc((var(--cy) - var(--box) / 2 * var(--k)) / var(--ph) * 100%);
		width: calc(var(--box) * var(--k) / var(--pw) * 100%);
		height: calc((var(--title-y) + 180 - var(--cy) + var(--box) / 2 * var(--k)) / var(--ph) * 100%);
	}

	/* ── text and controls (stage coordinates) ──────────────────────────── */

	.titles {
		position: absolute;
		left: 50%;
		/* plate y → stage y through the same transform as .frame */
		top: calc(50% + (var(--title-y) - var(--ph) / 2) * var(--s));
		width: min(90vw, 44rem);
		translate: -50% 0;
		display: grid;
		text-align: center;
	}

	.title {
		grid-area: 1 / 1;
		font-size: clamp(1.75rem, 3.4vw, 3.25rem);
		line-height: 1;
		text-wrap: balance;
		/* final copy is 1–3 words; cap longer strings (e.g. TODO(copy) placeholders) so they never cover the controls */
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		overflow: hidden;
		color: var(--color-cream);
		text-shadow: var(--glow-md);
		opacity: 0;
		translate: 0 0.4em;
		filter: blur(6px);
		transition:
			opacity var(--dur-state) ease,
			translate var(--dur-reveal) var(--ease-settle),
			filter var(--dur-state) ease;
	}

	.title.is-active {
		opacity: 1;
		translate: 0 0;
		filter: none;
	}

	/* Bottom line of the stage; the first label's text (not its hit area) starts on the gutter */
	.pillars {
		position: absolute;
		z-index: 2;
		left: var(--page-gutter);
		bottom: var(--bottom-gutter);
	}

	.pillars ul {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		margin-left: -0.55rem;
	}

	.pillars li + li::before {
		content: '·';
		margin-right: 0.35rem;
		color: color-mix(in oklab, var(--color-cream) 55%, transparent);
	}

	.pillar {
		position: relative;
		white-space: nowrap;
		padding: 0.6rem 0.55rem;
		color: var(--color-cream);
		text-shadow: var(--halo-ink);
		cursor: pointer;
		transition: color var(--dur-hover);
	}

	.pillar:hover,
	.pillar[aria-current] {
		color: var(--color-butter);
	}

	.underline {
		position: absolute;
		left: 0.2rem;
		right: 0.2rem;
		bottom: 0.1rem;
		width: calc(100% - 0.4rem);
		height: 0.45rem;
		overflow: visible;
		fill: none;
		stroke: var(--color-butter);
		stroke-width: 2.6;
		stroke-linecap: round;
		vector-effect: non-scaling-stroke;
		scale: 0 1;
		transform-origin: left;
		transition: scale var(--dur-state) var(--ease-settle);
	}

	.pillar[aria-current] .underline {
		scale: 1 1;
	}

	/* Bottom right, on the pillars' text line: pause, the dots, the skip cue (its arrow on the right gutter). 44px targets; the dots are
	   24px wide each. */
	.controls {
		position: absolute;
		z-index: 2;
		right: calc(var(--page-gutter) - 0.925rem);
		bottom: var(--bottom-gutter);
		display: flex;
		align-items: center;
	}

	.toggle,
	.cue {
		display: grid;
		place-items: center;
		width: 2.75rem;
		height: 2.75rem;
		color: var(--color-cream);
		cursor: pointer;
		transition: color var(--dur-hover);
	}

	.toggle:hover,
	.cue:hover {
		color: var(--color-butter);
	}

	.toggle svg {
		width: 1.35rem;
		height: 1.35rem;
		fill: none;
		stroke: currentColor;
		stroke-width: 1.6;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	.cue svg {
		width: 0.9rem;
		height: 1.6rem;
		fill: none;
		stroke: currentColor;
		stroke-width: 1.6;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	.dots {
		display: flex;
	}

	.dot-hit {
		display: grid;
		place-items: center;
		width: 1.5rem;
		height: 2.75rem;
		cursor: pointer;
	}

	.dot {
		position: relative;
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 50%;
		border: 1px solid color-mix(in oklab, var(--color-cream) 80%, transparent);
		transition:
			background-color var(--dur-state),
			border-color var(--dur-hover),
			scale var(--dur-state);
	}

	.dot-hit:hover .dot {
		border-color: var(--color-butter);
	}

	.dot-hit[aria-current] .dot {
		background: var(--color-butter);
		border-color: var(--color-butter);
		scale: 1.25;
	}

	/* Dwell cue: a hairline ring around the active dot fills clockwise until the next state; it runs only while the rotation plays. */
	@property --dwell-fill {
		syntax: '<number>';
		inherits: false;
		initial-value: 0;
	}

	.ring {
		position: absolute;
		inset: -0.3rem;
		border-radius: 50%;
		background: conic-gradient(var(--color-butter) calc(var(--dwell-fill) * 1turn), color-mix(in oklab, var(--color-cream) 22%, transparent) 0);
		mask: radial-gradient(closest-side, transparent calc(100% - 1.5px), #000 calc(100% - 0.75px));
		animation: making-dwell var(--dwell) linear both paused;
	}

	[data-playing] .ring {
		animation-play-state: running;
	}

	@keyframes making-dwell {
		to {
			--dwell-fill: 1;
		}
	}

	/* ── portrait: tall plate, vertical line, compact indicator ─────────── */

	@media (max-aspect-ratio: 1/1) {
		.stage {
			--s: max(100cqw / 1080, min(100cqh / 2340, 100cqw / 1000));
		}

		.plate-desktop {
			display: none;
		}

		.plate-mobile {
			display: block;
		}

		/* SSR renders the desktop line; hide it on portrait screens until the client switches the layout */
		.ink:not([data-layout='mobile']) {
			visibility: hidden;
		}

		.title {
			font-size: clamp(1.4rem, 6.4vw, 2.25rem);
			padding-inline: 12vw;
		}

		/* The desktop row split in two lines, on the dark rock below the lit cliff top and laptop (plate bottom right): the pillars from the
		   left gutter (first letter on it), and under them, as on desktop, pause, dots and cue on the right gutter. */
		.stage {
			--chrome-bottom: clamp(0.5rem, 2vh, 1.25rem);
		}

		.pillars {
			bottom: calc(var(--chrome-bottom) + 2.75rem);
		}

		.pillars ul {
			flex-wrap: nowrap;
			gap: 0.15rem;
			margin-left: -0.4rem;
		}

		.pillars li + li::before {
			margin-right: 0.15rem;
		}

		.pillar {
			min-height: 2.75rem;
			padding-inline: 0.4rem;
			letter-spacing: 0.12em;
		}

		.underline {
			left: 0.15rem;
			width: calc(100% - 0.3rem);
		}

		.controls {
			bottom: var(--chrome-bottom);
		}
	}

	/* ── reduced motion: one still frame, the controls switch it ─────────── */

	@media (prefers-reduced-motion: reduce) {
		/* before hydration: the first state with its bloom (the component writes the active one inline from then on) */
		.bloom-mask[data-state='idea'] .bloom {
			opacity: 1;
			transform: none;
		}

		/* nothing moves, so nothing to pause */
		.toggle,
		.ring {
			display: none;
		}
	}
</style>
