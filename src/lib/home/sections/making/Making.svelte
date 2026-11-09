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
	import { untrack } from 'svelte';
	import { on } from 'svelte/events';
	import { MediaQuery } from 'svelte/reactivity';
	import { m } from '#lib/paraglide/messages.js';
	import { NIGHT_HOURS } from '#lib/home/night.ts';
	import NightClock from '#lib/home/shared/NightClock.svelte';
	import DeferredArt from '#lib/home/shared/DeferredArt.svelte';
	import { belowFold } from '#lib/home/shared/deferred.svelte.ts';
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
	const PILLAR_LABELS: Record<(typeof PILLARS)[number]['id'], () => string> = {
		ai: m.home_making_pillar_ai,
		code: m.home_making_pillar_code,
		projects: m.home_making_pillar_projects,
		business: m.home_making_pillar_business
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
	let lineIn: SVGPathElement;
	let strandOut: SVGGElement;
	let strandIn: SVGGElement;
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
	 * Pigment blot: the mask that grows each bloom from the shape's center. A solid core with a wobbly edge that breaks into hard pigment
	 * granules (no blur anywhere), generated once on the client. The bloom scales its mask-size, so the edge stays sharp while it grows;
	 * the shape mask (crisp, morph.ts) cuts the final outline.
	 */
	let blot = $state('');
	/** Smooth value noise: bilinear (smoothstep-eased) lookup in a (cells + 1)² lattice of random values, x and y in 0…1. */
	function sample(grid: number[], cells: number, x: number, y: number) {
		const gx = x * cells;
		const gy = y * cells;
		const ix = Math.min(cells - 1, Math.floor(gx));
		const iy = Math.min(cells - 1, Math.floor(gy));
		const fx = smooth(gx - ix);
		const fy = smooth(gy - iy);
		const at = (cx: number, cy: number) => grid[cy * (cells + 1) + cx];
		const top = at(ix, iy) + (at(ix + 1, iy) - at(ix, iy)) * fx;
		const bottom = at(ix, iy + 1) + (at(ix + 1, iy + 1) - at(ix, iy + 1)) * fx;
		return top + (bottom - top) * fy;
	}
	$effect(() => {
		const size = 320;
		const canvas = document.createElement('canvas');
		canvas.width = canvas.height = size;
		const context = canvas.getContext('2d');
		if (!context) return;
		let seed = 2100;
		const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
		// two octaves of smooth value noise for the edge wobble
		const lattice = (cells: number) => Array.from({ length: (cells + 1) * (cells + 1) }, random);
		const fine = lattice(18);
		const coarse = lattice(6);
		const image = context.createImageData(size, size);
		for (let y = 0; y < size; y++) {
			for (let x = 0; x < size; x++) {
				const u = x / (size - 1);
				const v = y / (size - 1);
				const edge = Math.hypot(u * 2 - 1, v * 2 - 1) + 0.2 * (sample(coarse, 6, u, v) - 0.5) + 0.09 * (sample(fine, 18, u, v) - 0.5);
				// solid core; a band of granules thinning out; a few loose specks beyond
				const granule = random();
				const solid = edge < 0.72 || (edge < 0.9 && granule < ((0.9 - edge) / 0.18) ** 0.8) || (edge < 0.98 && granule > 0.985);
				image.data.set([255, 255, 255, solid ? 255 : 0], (y * size + x) * 4);
			}
		}
		context.putImageData(image, 0, 0);
		blot = `url(${canvas.toDataURL()})`;
	});

	/**
	 * Visibility gate: a third of the stage on screen while it enters from below (the stage starts at the hero's bottom edge, so after
	 * about a third of a screen of scroll); the first morph follows a dwell later, when the drawing is in view. Leaving at the top: half the
	 * stage. The hover zone lies over the hero's bottom edge before that, so it waits for the same gate.
	 */
	const ENTER_GATE = 0.33;
	const LEAVE_GATE = 0.5;
	const watchStage = inView(
		(_, entry) => {
			onStage = entry.intersectionRatio >= (entry.boundingClientRect.top > 0 ? ENTER_GATE : LEAVE_GATE) - 0.001;
			if (!onStage) hovered = false;
		},
		{ threshold: [0, ENTER_GATE, LEAVE_GATE, 1] }
	);

	// Morph state (per frame, not reactive). `points` is the drawn line; every morph starts from a snapshot of it, so a click mid-morph
	// continues from where the line is.
	let from = 0;
	let to = 0;
	let t = 1;
	let kind: 'morph' | 'redraw' = 'morph';
	let dwell = 0;
	const points = new Float32Array(LINE_POINTS * 2);
	const pointsIn = new Float32Array(LINE_POINTS * 2);
	const fromPoints = new Float32Array(LINE_POINTS * 2);
	let drawnLayout = '';
	let redrawPhase = -1;
	let dirty = true;
	const levels = new Float32Array(STATE_IDS.length);
	const written = new Float32Array(STATE_IDS.length).fill(-1);
	const grown = new Float32Array(STATE_IDS.length);
	const sized = new Float32Array(STATE_IDS.length).fill(-1);
	let glowWritten = -1;
	let dashWritten = '';
	let fadeWritten = -1;

	const smooth = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
	const target = () => composeLine(layoutId, STATE_IDS[to]);

	/**
	 * A morph is a crossfade of two strands, so the tangled middle of a point-by-point morph never shows: the old figure starts to flow
	 * toward the new one and dissolves (OUT_FADE) while the new figure condenses out of the last stretch of the same morph (IN_FADE).
	 * Fades are fractions of MORPH; REACH is how far along the morph each strand travels (the old one up to it, the new one from 1 - it).
	 */
	const REACH = 0.28;
	const OUT_FADE = [0.26, 0.54] as const;
	const IN_FADE = [0.44, 0.74] as const;
	const fade = (x: number, [a, b]: readonly [number, number]) => smooth((x - a) / (b - a));

	function begin(state: number, how: 'morph' | 'redraw') {
		// continue from whichever strand dominates right now
		fromPoints.set(kind === 'morph' && t < 1 && t >= 0.5 ? pointsIn : points);
		from = to;
		to = state;
		t = 0;
		kind = how;
		dwell = 0;
		resting = false;
		redrawPhase = -1;
	}

	/**
	 * Sleep: once nothing on screen changes (the line rests, every bloom and the glow have settled), the loop stops asking for frames
	 * instead of running empty ones; while the rotation plays, a timer wakes it a few frames before the dwell ends. Anything that would
	 * change the drawing on the next frame wakes it: a jump (`goTo`), `playing`, the layout. The skipped frames only counted the dwell
	 * up, so the first frame after a wake credits it with the time it would have counted (`sleptAt`, `pausedAt`) and ticks with the last
	 * frame's dt: morphs, dwell and state changes land on the same frames as with a loop that never sleeps.
	 */
	let asleep = false;
	let waking = false;
	/** rAF time of the last tick before the sleep, and whether the dwell was counting then. */
	let sleptAt = 0;
	let sleptPlaying = false;
	/** performance.now() when the rotation paused during a sleep (-1: it didn't), so the dwell is credited up to that moment. */
	let pausedAt = -1;
	/** A jump during the sleep restarted the dwell: nothing to credit. */
	let sleepReset = false;
	let wakeTimer: ReturnType<typeof setTimeout> | undefined;
	/** Last measured frame interval (s): the dt a never-sleeping loop would have had on the frame after a wake. */
	let frameDt = 1 / 60;
	/** Wake this long before the dwell ends; the last frames tick normally, so a late timer never moves the morph. */
	const WAKE_LEAD = 100;

	function sleep(time: number) {
		asleep = true;
		sleptAt = time;
		sleptPlaying = playing;
		pausedAt = -1;
		sleepReset = false;
		loop.paused = true;
		if (sleptPlaying) wakeTimer = setTimeout(wake, sleptAt + (DWELL - dwell) * 1000 - WAKE_LEAD - performance.now());
	}

	function wake() {
		if (!asleep) return;
		clearTimeout(wakeTimer);
		asleep = false;
		waking = true;
		loop.paused = reducedMotion.current;
	}

	/** Jump to a state (pillar, dot, arrow key): morph there and restart the dwell. */
	function goTo(state: number) {
		if (asleep) sleepReset = true;
		wake();
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

	const loop = new RafLoop((dt, time) => {
		if (waking) {
			// The first frame after a sleep (RafLoop restarts with dt 0): tick as the frame after the last one, and credit the dwell the
			// skipped frames would have counted (up to the frame before a pause, as the loop counts only while playing).
			waking = false;
			dt = frameDt;
			if (sleptPlaying && !sleepReset) {
				const until = pausedAt < 0 ? time - dt * 1000 : Math.min(time - dt * 1000, pausedAt);
				dwell += Math.max(0, until - sleptAt) / 1000;
			}
		} else if (dt > 0 && dt < 0.05) frameDt = dt;

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
				const next = target();
				if (t >= 1) points.set(next);
				else {
					morphPoints(points, fromPoints, next, REACH * smooth(t / OUT_FADE[1]));
					morphPoints(pointsIn, fromPoints, next, 1 - REACH + REACH * smooth((t - IN_FADE[0]) / (1 - IN_FADE[0])));
				}
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

		// mid morph both strands show; otherwise (rest, redraw) only the main one
		const crossing = kind === 'morph' && t < 1 ? t : -1;
		if (dirty) {
			line.setAttribute('d', toPathData(points));
			if (crossing >= 0) lineIn.setAttribute('d', toPathData(pointsIn));
			dirty = false;
		}
		const fadeKey = crossing < 0 ? -1 : Math.round(crossing * 1000);
		if (fadeKey !== fadeWritten) {
			strandOut.style.opacity = crossing < 0 ? '' : String(Math.round((1 - fade(crossing, OUT_FADE)) * 1000) / 1000);
			strandIn.style.opacity = crossing < 0 ? '0' : String(Math.round(fade(crossing, IN_FADE) * 1000) / 1000);
			fadeWritten = fadeKey;
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
			// The pigment spreads (mask growth) while the line rests; when it moves on, the bloom keeps its size and fades with the old strand.
			if (i === to && t >= 1) grown[i] = levels[i];
			const leaving = t < 1 && i === from ? 1 - (kind === 'morph' ? fade(t, [0.12, 0.48]) : smooth(t / 0.4)) : 1;
			const value = Math.round(Math.min(1, levels[i] * 4) * leaving * 1000) / 1000;
			const size = Math.round(grown[i] * 1000) / 1000;
			if (value !== written[i] || size !== sized[i]) {
				blooms[i].style.opacity = String(value);
				blooms[i].style.setProperty('--grow', String(size));
				written[i] = value;
				sized[i] = size;
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

		// Settled: the line rests and every bloom sits at its rest level, so the next frames would draw the same picture. While the
		// rotation plays, only the dwell counts on; sleep unless it ends within the wake lead.
		if (t < 1) return;
		for (let i = 0; i < levels.length; i++) if (levels[i] !== (i === to ? 1 : 0)) return;
		if (!playing || (DWELL - dwell) * 1000 > WAKE_LEAD + 3 * frameDt * 1000) sleep(time);
	});

	$effect(() => {
		const reduced = reducedMotion.current;
		// untracked: `sleep` pauses the loop too, which must not re-run this
		untrack(() => {
			clearTimeout(wakeTimer);
			asleep = false;
			waking = false;
			loop.paused = reduced;
		});
		return () => clearTimeout(wakeTimer);
	});

	// Whatever changes what the next frame draws wakes a sleeping loop (jumps call `wake` themselves).
	$effect(() => {
		void [playing, layoutId];
		untrack(() => {
			if (!asleep) return;
			if (!playing && sleptPlaying && pausedAt < 0) pausedAt = performance.now();
			wake();
		});
	});

	// Reduced motion: one still frame of the active state, redrawn when a control switches it.
	$effect(() => {
		if (!reducedMotion.current) return;
		to = active;
		t = 1;
		line.setAttribute('d', toPathData(composeLine(layoutId, STATE_IDS[active])));
		ink.style.strokeDasharray = '';
		strandOut.style.opacity = '';
		strandIn.style.opacity = '0';
		blooms.forEach((bloom, i) => {
			bloom.style.opacity = String(Number(i === active));
			bloom.style.setProperty('--grow', '1');
		});
		glow.style.opacity = String(Number(active === LAST));
		// if motion is allowed again, the loop redraws everything from here
		drawnLayout = '';
		dashWritten = '';
		fadeWritten = -1;
		levels.fill(0);
		written.fill(-1);
		sized.fill(-1);
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
			style:--blot={blot || undefined}
			{@attach watchStage}
			{@attach watchHover}
		>
			<!-- Painted scene in plate coordinates: decorative only, the meaning lives in the titles and the control row. -->
			<div class="scene" aria-hidden="true">
				<div class="frame" {@attach loop.attach}>
					<!-- string src: enhanced-img derives a full width ladder from `sizes` (the plate covers the stage) -->
					<!-- The plate and blooms load after the hero moon (DeferredArt): the stage starts below the first screen. The plate and the
					     first bloom come first; once the plate has loaded, the other blooms and the art further down follow. -->
					<DeferredArt>
						<enhanced:img
							class="plate plate-desktop"
							src="./assets/making-plate.webp"
							alt=""
							sizes="max(100vw, min(178vh, 107vw))"
							loading="lazy"
							onload={belowFold.settle}
							onerror={belowFold.settle}
						/>
						<enhanced:img
							class="plate plate-mobile"
							src="./assets/making-plate-mobile.webp"
							alt=""
							sizes="100vw"
							loading="lazy"
							onload={belowFold.settle}
							onerror={belowFold.settle}
						/>
					</DeferredArt>
					<div class="screen-glow" bind:this={glow}></div>

					{#each STATE_IDS as id, i (id)}
						<div class="bloom-mask" data-state={id} style:mask-image={MASKS[id]} style:-webkit-mask-image={MASKS[id]}>
							<div class="bloom" {@attach (element) => void (blooms[i] = element)}>
								<DeferredArt rest={i > 0}><enhanced:img src={BLOOMS[id]} alt="" sizes="(max-aspect-ratio: 1/1) 54vw, 31vw" loading="lazy" /></DeferredArt>
							</div>
						</div>
					{/each}

					<svg class="ink" data-layout={layoutId} viewBox="0 0 {layout.width} {layout.height}" preserveAspectRatio="none" style:--stroke={layout.stroke} bind:this={ink}>
						<defs>
							<!-- pathLength 1: the moon → idea loop retracts and redraws the line with a dash offset in 0…1 -->
							<path id="making-line" pathLength="1" bind:this={line} d={initialLine} />
							<!-- the incoming strand of a morph (crossfade, see REACH) -->
							<path id="making-line-in" pathLength="1" bind:this={lineIn} d={initialLine} />
							<pattern id="making-grain" patternUnits="userSpaceOnUse" width="128" height="128">
								{#if grain}<image href={grain} width="128" height="128" />{/if}
							</pattern>
						</defs>
						<g bind:this={strandOut}>
							<use href="#making-line" class="ink-glow" />
							<use href="#making-line" class="ink-core" />
							<use href="#making-line" class="ink-grain" />
						</g>
						<g bind:this={strandIn} opacity="0">
							<use href="#making-line-in" class="ink-glow" />
							<use href="#making-line-in" class="ink-core" />
							<use href="#making-line-in" class="ink-grain" />
						</g>
					</svg>

					<!-- the drawing and its title: hovering it pauses the rotation -->
					<div class="hover-zone"></div>
				</div>
			</div>

			<NightClock time="21:00" />
			<h2 id="home-making-title" class="sr-only">{m.home_making_title()}</h2>

			<!-- Caption under the drawing: the state title, then (one group, centered) the pillar row and the transport row. Phones: the title
			     stays under the drawing, the group sits on the rock at the bottom (display: contents). -->
			<div class="caption">
				<!-- All six titles stay in the document as a list; no live region, so the rotation never talks over a screen reader. -->
				<ol class="titles" aria-label={m.home_making_states_label()}>
					{#each STATE_IDS as id, i (id)}
						<li class={['title font-display font-black tracking-wordmark uppercase', i === active && 'is-active']}>{TITLES[id]()}</li>
					{/each}
				</ol>

				<div class="console" onfocusin={onFocusIn} onfocusout={onFocusOut}>
					<nav class="pillars label" aria-label={m.home_making_pillars_label()}>
						<ul>
							{#each PILLARS as pillar, p (pillar.id)}
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
										{PILLAR_LABELS[pillar.id]()}
										<svg class="underline" viewBox="0 0 100 8" preserveAspectRatio="none" aria-hidden="true">
											<path d="M2 5.2 C 22 2.6, 48 3.4, 70 3 S 94 3.8, 98 2.6" />
										</svg>
									</button>
								</li>
							{/each}
						</ul>
					</nav>

					<!-- pause, the six states (one tab stop, arrows step; the title shows on hover/focus), skip cue -->
					<div class="transport">
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
									<span class="tip label-sm" aria-hidden="true">{TITLES[id]()}</span>
								</button>
							{/each}
						</div>
						<a class="cue" href="#game" aria-label={m.home_making_skip_label()}>
							<svg viewBox="0 0 24 40" aria-hidden="true"><path d="M12 2 V37 M3 28 L12 37 L21 28" /></svg>
						</a>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	.making {
		position: relative;
		--ink-cream: var(--color-cream);
		/* Ink-wash seam: the section overlaps (and paints over) the hero's bottom by --wipe-overlap with one fixed painted wash (.track mask).
		   No scroll-driven wipe: the owner found the wash reshaping (and the hero clouds sliding through its holes) laggy, so it scrolls as
		   one plain painted edge. Only this section's controls take pointer events, so the hero's controls below stay usable. */
		--wipe-overlap: 45svh;
		margin-top: calc(-1 * var(--wipe-overlap));
		/* Where the stage starts in the track: below the whole wash */
		--stage-offset: var(--wipe-overlap);
		/* `#making` links land on the stage, not on the wash above it */
		scroll-margin-top: calc(-1 * var(--stage-offset));
		pointer-events: none;
	}

	.making :is(a, button),
	.stage[data-on-stage] .hover-zone {
		pointer-events: auto;
	}

	.track {
		position: relative;
		/* The stage starts --stage-offset below the track top, so the wash front always has room for its lobes above it.
		   One soft hero → plate wash across the overlap, the stage below it.
		   --wipe-b: bottom of the wash ramp (solid plate below); --wipe-w: ramp height. The ramp's top fifth is transparent, so
		   --wipe-w ≤ 1.25 × --wipe-b hides the track's straight top edge while the hero is on screen.
		   Front = intersect of two painted-ramp copies at different widths/offsets: the shape never visibly repeats, and
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
		/* The solid layer is a soft fill, not a block: the painted ramp has a flat floor (every column turns opaque between ~74 and 84 % of its
		   height), so the hero seen through its last holes ended on one straight row over the 21:00 sky. The fill closes those holes gradually
		   over --wipe-fill above that floor (eased: the ragged upper wash stays untouched) and is solid from the ramps' opaque bottom (last
		   ~10 %) on, so nothing straight ever shows. */
		--wipe-fill: calc(var(--wipe-w) * 0.5);
		mask-image:
			linear-gradient(
				#0000,
				#0000000a calc(var(--wipe-fill) * 0.25),
				#00000033 calc(var(--wipe-fill) * 0.5),
				#00000099 calc(var(--wipe-fill) * 0.75),
				#000000e0 calc(var(--wipe-fill) * 0.9),
				#000 var(--wipe-fill)
			),
			var(--wash-spread-up), var(--wash-spread-up);
		mask-repeat: no-repeat, repeat-x, repeat-x;
		mask-size:
			100% 100%,
			calc(var(--wipe-w) * 1.8) var(--wipe-w),
			calc(var(--wipe-w) * 1.3) var(--wipe-w);
		mask-position:
			0 calc(var(--wipe-b) - var(--wipe-w) * 0.1 - var(--wipe-fill)),
			var(--wipe-x) calc(var(--wipe-b) - var(--wipe-w)),
			0 calc(var(--wipe-b) - var(--wipe-w));
		mask-composite: add, intersect, add;
		padding-top: var(--stage-offset);
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
		/* The painted ramp is straight at both ends: a faint haze starts on one row (~20 %) across the whole width, and every column turns
		   opaque on one row (~80 %). Over the bright painted clouds on the dark sky backing either reads as a horizontal line. So the ramps
		   are intersected with an eased fade (0 until 20 %, which zeroes the haze onset) and the solid layer is an eased fill from 40 % that
		   closes the last holes gradually, solid from 90 % on. */
		mask-image:
			linear-gradient(
				#0000,
				#0000000a calc(var(--feather-top) * 0.125),
				#00000033 calc(var(--feather-top) * 0.25),
				#00000099 calc(var(--feather-top) * 0.375),
				#000000e0 calc(var(--feather-top) * 0.45),
				#000 calc(var(--feather-top) * 0.5)
			),
			var(--feather-down), linear-gradient(#0000 20%, #0000001a 35%, #00000066 50%, #000000cc 65%, #000 80%), var(--wash-spread-up), var(--wash-spread-up);
		mask-repeat: no-repeat, no-repeat, no-repeat, repeat-x, repeat-x;
		mask-size:
			100% calc(100% - var(--feather-top) * 0.4 - var(--feather-bottom) + 1px),
			100% var(--feather-bottom),
			100% var(--feather-top),
			calc(var(--feather-top) * 1.8) var(--feather-top),
			calc(var(--feather-top) * 1.3) var(--feather-top);
		mask-position:
			0 calc(var(--feather-top) * 0.4),
			0 100%,
			0 0,
			37% 0,
			0 0;
		mask-composite: add, add, intersect, intersect, add;
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

	/* The pigment spreads from the shape's center: a sharp granular blot (generated, `--blot`) grows via mask-size (`--grow` 0…1,
	   written by the loop); at 1 it covers the whole box and the crisp shape mask above cuts the outline. Without the blot (SSR, before
	   hydration) the bloom is unmasked. */
	.bloom {
		width: 100%;
		height: 100%;
		opacity: 0;
		mask: var(--blot, linear-gradient(#000 0 0)) center / calc(var(--grow, 1) * 190%) calc(var(--grow, 1) * 190%) no-repeat;
		will-change: opacity;
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

	/* The drawing's bloom box down to below its title (plate px). Takes pointer events only once the stage is on screen. */
	.hover-zone {
		position: absolute;
		left: calc((var(--cx) - var(--box) / 2 * var(--k)) / var(--pw) * 100%);
		top: calc((var(--cy) - var(--box) / 2 * var(--k)) / var(--ph) * 100%);
		width: calc(var(--box) * var(--k) / var(--pw) * 100%);
		height: calc((var(--title-y) + 180 - var(--cy) + var(--box) / 2 * var(--k)) / var(--ph) * 100%);
	}

	/* ── text and controls (stage coordinates) ──────────────────────────── */

	/* Caption: the state title at its plate position under the drawing (plate y → stage y through the same transform as .frame), and one
	   centered control group 3rem below it. */
	.caption {
		position: absolute;
		z-index: 2;
		left: 50%;
		top: calc(50% + (var(--title-y) - var(--ph) / 2) * var(--s));
		width: min(calc(100% - 2 * var(--page-gutter)), 44rem);
		translate: -50% 0;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.titles {
		position: relative;
		display: grid;
		width: 100%;
		text-align: center;
	}

	/* No box behind the label: one soft ink ellipse (radial, wider than the words) keeps it clean on the painted sky */
	.titles::before {
		content: '';
		position: absolute;
		inset: -60% -8%;
		z-index: -1;
		background: radial-gradient(
			closest-side,
			color-mix(in oklab, var(--color-ink) 55%, transparent),
			color-mix(in oklab, var(--color-ink) 22%, transparent) 55%,
			transparent
		);
		pointer-events: none;
	}

	.title {
		grid-area: 1 / 1;
		/* one-line titles sit on the cell's bottom, so the gap to the controls stays the same for every state */
		align-self: end;
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
		/* a tight ink edge for the grain, a faint warm breath: ink, not UI glow */
		text-shadow:
			0 0 1px var(--color-ink),
			0 0 0.4em color-mix(in oklab, var(--color-ink) 60%, transparent),
			0 0 1.6em color-mix(in oklab, var(--color-butter) 12%, transparent);
		opacity: 0;
		translate: 0 0.3em;
		/* Crossfade in sequence, never two titles at once: the outgoing one is gone in --title-out, the incoming one starts after it */
		--title-out: 120ms;
		transition:
			opacity var(--title-out) ease-in,
			translate var(--title-out) ease-in;
	}

	.title.is-active {
		opacity: 1;
		translate: 0 0;
		transition:
			opacity var(--dur-state) ease-out var(--title-out),
			translate var(--dur-reveal) var(--ease-settle) var(--title-out);
	}

	.console {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-top: 2.25rem;
	}

	/* Short landscape screens (phones turned sideways): title, then pillars and transport on one line, lifted so the group never
	   leaves the stage */
	@media (min-aspect-ratio: 1/1) and (max-height: 34rem) {
		.caption {
			top: min(calc(50% + (var(--title-y) - var(--ph) / 2) * var(--s)), calc(100% - 7rem));
		}

		.console {
			flex-direction: row;
			flex-wrap: wrap;
			justify-content: center;
			column-gap: 0.75rem;
			margin-top: 0.5rem;
		}
	}

	.pillars ul {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		align-items: center;
		gap: 0 0.35rem;
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
		text-transform: uppercase;
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

	/* Under the pillars: pause, the dots, the skip cue. 44px targets; the dots are 32px wide each. */
	.transport {
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
		position: relative;
		display: grid;
		place-items: center;
		width: 2rem;
		height: 2.75rem;
		cursor: pointer;
	}

	.dot {
		position: relative;
		width: 0.55rem;
		height: 0.55rem;
		border-radius: 50%;
		border: 1.5px solid color-mix(in oklab, var(--color-cream) 85%, transparent);
		box-shadow: 0 0 0 1px color-mix(in oklab, var(--color-ink) 50%, transparent);
		transition:
			background-color var(--dur-state),
			border-color var(--dur-hover),
			scale var(--dur-state);
	}

	.dot-hit:hover .dot {
		border-color: var(--color-butter);
	}

	/* Active: a solid butter core with an ink rim, clearly the one lit station */
	.dot-hit[aria-current] .dot {
		background: var(--color-butter);
		border-color: var(--color-butter);
		box-shadow:
			0 0 0 1.5px var(--color-ink),
			var(--glow-sm);
		scale: 1.45;
	}

	/* The state's title under its dot on hover or keyboard focus (phones: above, the row sits at the bottom) */
	.tip {
		position: absolute;
		left: 50%;
		top: calc(100% - 0.15rem);
		translate: -50% -0.25rem;
		white-space: nowrap;
		color: var(--color-cream);
		text-shadow: var(--halo-ink);
		text-transform: uppercase;
		opacity: 0;
		pointer-events: none;
		transition:
			opacity var(--dur-hover) ease,
			translate var(--dur-state) var(--ease-settle);
	}

	.dot-hit:hover .tip,
	.dot-hit:focus-visible .tip {
		opacity: 1;
		translate: -50% 0;
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

		/* Title, transport and pillars are one group under the drawing (transport first, its tips open upwards), the control row 32–48px
		   under the title. The line runs down the right margin around the group into the laptop (morph.ts `via`), so the cliff stays free. */
		.caption {
			width: calc(100% - 2 * var(--page-gutter) + 1rem);
		}

		.console {
			flex-direction: column-reverse;
			margin-top: 1.5rem;
		}

		/* two balanced pairs instead of a 3 + 1 wrap */
		.pillars ul {
			display: grid;
			grid-template-columns: auto auto;
			justify-items: center;
			gap: 0 1rem;
		}

		.pillars li + li::before {
			content: none;
		}

		.pillar {
			min-height: 2.75rem;
			padding-inline: 0.4rem;
			letter-spacing: 0.14em;
		}

		.underline {
			left: 0.15rem;
			width: calc(100% - 0.3rem);
		}

		.tip {
			top: auto;
			bottom: calc(100% - 0.35rem);
			translate: -50% 0.25rem;
		}
	}

	/* ── reduced motion: one still frame, the controls switch it ─────────── */

	@media (prefers-reduced-motion: reduce) {
		/* before hydration: the first state with its bloom (the component writes the active one inline from then on) */
		.bloom-mask[data-state='idea'] .bloom {
			opacity: 1;
		}

		/* nothing moves, so nothing to pause */
		.toggle,
		.ring {
			display: none;
		}
	}
</style>
