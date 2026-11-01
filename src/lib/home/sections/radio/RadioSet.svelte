<!--
	@component
	The painted radio itself, one layout variant (`wide` or `tall`, geometry in layout.ts). Radio.svelte renders both
	variants and CSS shows the matching one (no layout shift at hydration); the hidden one is `display: none`, so it is
	out of the tab order and the accessibility tree, and its lazy images are never fetched.

	Layers, back to front: body (painted glass, strip window, key recess) → printed slide-rule scale + mini logos (SVG
	in body pixels) → needle (slides along the scale) → big station logo, name, handle and live content on the glass →
	dial slider (transparent range input over the glass) → display strip (snippet) → preset keys → knobs.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { m } from '#lib/paraglide/messages.js';
	import keyPressed from './assets/radio-key-pressed.webp?enhanced';
	import keyUp from './assets/radio-key.webp?enhanced';
	import knobImage from './assets/radio-knob.webp?enhanced';
	import needleImage from './assets/radio-needle.webp?enhanced';
	import BrandIcon from './BrandIcon.svelte';
	import StationContent from './StationContent.svelte';
	import { RADIO_LAYOUT, keySlots, toPercent, type Knob, type RadioLayout, type Rect } from './layout.ts';
	import { DIAL_MAX, type Station } from './stations.ts';

	interface Props {
		variant: 'wide' | 'tall';
		stations: readonly Station[];
		/** Dial value 0…DIAL_MAX. */
		dial: number;
		/** Station under the needle right now (live while dragging). */
		tuned: Station | null;
		/** Committed station (pressed key). */
		selected: Station | null;
		/** Needle follows the pointer without easing. */
		dragging: boolean;
		reduced: boolean;
		/** Music volume 0…1 (turns the left knob). */
		volume: number;
		onpreset: (station: Station) => void;
		ondialinput: (value: number) => void;
		ondialcommit: () => void;
		ondialkey: (event: KeyboardEvent) => void;
		strip: Snippet<['wide' | 'tall']>;
	}

	let { variant, stations, dial, tuned, selected, dragging, reduced, volume, onpreset, ondialinput, ondialcommit, ondialkey, strip }: Props = $props();

	const layout: RadioLayout = $derived(RADIO_LAYOUT[variant]);
	const slots = $derived(keySlots(layout, stations.length));
	const pct = (rect: Rect) => toPercent(layout, rect);

	const xAt = (position: number) => layout.needle.x0 + position * (layout.needle.x1 - layout.needle.x0);

	/** The needle box at dial 0; it slides by a transform (percent of its own width), never by layout. */
	const needleBox = $derived(pct({ x: layout.needle.x0 - layout.needle.w / 2, y: layout.needle.top, w: layout.needle.w, h: layout.needle.h }));
	const needleShift = $derived(((dial / DIAL_MAX) * (layout.needle.x1 - layout.needle.x0) * 100) / layout.needle.w);

	/** Printed rule with a minor tick every 2 % of the dial, a longer one every 10 %. */
	const scale = $derived.by(() => {
		const { rule, minorTick } = layout.scale;
		const ticks: string[] = [];
		for (let step = 0; step <= 50; step++) {
			const x = xAt(step / 50).toFixed(1);
			ticks.push(`M${x} ${rule - (step % 5 === 0 ? minorTick * 1.7 : minorTick)}V${rule}`);
		}
		return { ticks: ticks.join(''), rule: `M${layout.needle.x0 - 30} ${rule}H${layout.needle.x1 + 30}` };
	});

	const stationMarks = $derived(
		stations.map((station) => {
			const x = xAt(station.position);
			const { rule, markTop, logoY, logoSize } = layout.scale;
			return { station, tick: `M${x} ${markTop}V${rule + 8}`, logo: { x: x - logoSize / 2, y: logoY - logoSize / 2, size: logoSize } };
		})
	);

	const knobs = $derived([
		{ id: 'volume', knob: layout.knobs.volume, angle: volume * 300 - 150 },
		{ id: 'tuning', knob: layout.knobs.tuning, angle: (dial / DIAL_MAX) * 300 - 150 }
	]);
	const knobBox = (knob: Knob) => pct({ x: knob.cx - knob.r, y: knob.cy - knob.r, w: knob.r * 2, h: knob.r * 2 });
</script>

<div class={['set', `set-${variant}`]} style:aspect-ratio="{layout.size.w} / {layout.size.h}">
	<!-- Static sources so enhanced-img emits width candidates (sizes = 2× of the largest CSS width) -->
	{#if variant === 'wide'}
		<enhanced:img src="./assets/radio-body.webp?w=1800;1200;900" alt="" class="layer body" sizes="(min-width: 40rem) min(56rem, 88vw), 1px" loading="lazy" />
	{:else}
		<enhanced:img src="./assets/radio-body-mobile.webp?w=1200;800" alt="" class="layer body" sizes="(min-width: 40rem) 1px, min(25rem, 100vw)" loading="lazy" />
	{/if}

	<!-- Printed slide-rule scale on the glass -->
	<svg class="layer scale" viewBox="0 0 {layout.size.w} {layout.size.h}" aria-hidden="true">
		<path d={scale.rule} class="scale-rule" />
		<path d={scale.ticks} class="scale-ticks" />
		{#each stationMarks as mark (mark.station.id)}
			<g class={['mark', tuned?.id === mark.station.id && 'on', mark.station.kind === 'music' && 'music']}>
				<path d={mark.tick} class="mark-tick" />
				<svg x={mark.logo.x} y={mark.logo.y} width={mark.logo.size} height={mark.logo.size} viewBox="0 0 24 24"><path d={mark.station.icon} fill="currentColor" /></svg>
			</g>
		{/each}
	</svg>

	<!-- Needle -->
	<div
		class={['needle', (dragging || reduced) && 'instant']}
		style:left={needleBox.left}
		style:top={needleBox.top}
		style:width={needleBox.width}
		style:height={needleBox.height}
		style:translate="{needleShift}% 0"
	>
		<enhanced:img src={needleImage} alt="" class="fill" sizes="1rem" loading="lazy" />
	</div>

	<!-- Big station logo, name, handle, live content on the glass -->
	<div
		class="glass"
		style:left={pct(layout.glassContent).left}
		style:top={pct(layout.glassContent).top}
		style:width={pct(layout.glassContent).width}
		style:height={pct(layout.glassContent).height}
	>
		{#if tuned}
			{#key tuned.id}
				<div class="glass-station">
					<BrandIcon path={tuned.icon} class="glass-logo" />
					<div class="glass-text">
						<p class="glass-name">{tuned.name}</p>
						{#if tuned.handle}<p class="glass-handle font-mono">{tuned.handle}</p>{/if}
						{#if tuned.id === 'youtube' || tuned.id === 'github'}
							<p class="glass-content">
								<svelte:boundary>
									<StationContent kind={tuned.id} />
									{#snippet pending()}<span class="font-mono" aria-hidden="true">· · ·</span>{/snippet}
									{#snippet failed()}{/snippet}
								</svelte:boundary>
							</p>
						{/if}
					</div>
				</div>
			{/key}
		{:else}
			<p class="glass-idle font-mono">{m.home_radio_glass_idle()}</p>
		{/if}
	</div>

	<!-- Tuning dial: a real slider over the glass; its focus ring is drawn around the glass -->
	<input
		type="range"
		class="dial"
		min="0"
		max={DIAL_MAX}
		step="1"
		value={dial}
		aria-label={m.home_radio_dial_label()}
		aria-valuetext={tuned ? `${tuned.name} ${tuned.frequency}` : m.home_radio_dial_static()}
		style:left={pct(layout.dialGlass).left}
		style:top={pct(layout.dialGlass).top}
		style:width={pct(layout.dialGlass).width}
		style:height={pct(layout.dialGlass).height}
		oninput={(event) => ondialinput(event.currentTarget.valueAsNumber)}
		onchange={ondialcommit}
		onkeydown={ondialkey}
	/>
	<div
		class="glass-focus"
		style:left={pct(layout.dialGlass).left}
		style:top={pct(layout.dialGlass).top}
		style:width={pct(layout.dialGlass).width}
		style:height={pct(layout.dialGlass).height}
	></div>

	<!-- Display strip -->
	<div
		class="strip"
		style:left={pct(layout.displayStrip).left}
		style:top={pct(layout.displayStrip).top}
		style:width={pct(layout.displayStrip).width}
		style:height={pct(layout.displayStrip).height}
	>
		{@render strip(variant)}
	</div>

	<!-- Preset keys -->
	<div class="keys" role="group" aria-label={m.home_radio_presets_label()}>
		{#each stations as station, index (station.id)}
			{@const slot = pct(slots[index])}
			{@const down = selected?.id === station.id}
			<button
				type="button"
				class={['key', down && 'down', station.kind === 'music' && 'music']}
				style:left={slot.left}
				style:top={slot.top}
				style:width={slot.width}
				style:height={slot.height}
				aria-pressed={down}
				aria-label={m.home_radio_preset_label({ name: station.name })}
				onclick={() => onpreset(station)}
			>
				<enhanced:img src={down ? keyPressed : keyUp} alt="" class="fill" sizes="8rem" loading="lazy" />
				<span class="key-face">
					<BrandIcon path={station.icon} class="key-logo" />
					<span class="key-name" aria-hidden="true">{station.name}</span>
				</span>
			</button>
		{/each}
	</div>

	{#each knobs as { id, knob, angle } (id)}
		{@const box = knobBox(knob)}
		<div
			class={['knob', (dragging || reduced) && 'instant']}
			style:left={box.left}
			style:top={box.top}
			style:width={box.width}
			style:height={box.height}
			style:rotate="{angle}deg"
			aria-hidden="true"
		>
			<enhanced:img src={knobImage} alt="" class="fill" sizes="6rem" loading="lazy" />
		</div>
	{/each}
</div>

<style>
	.set {
		position: relative;
		width: 100%;
		container: radio / inline-size;
		/* Ink and light used on the art */
		--ink: #1b1713;
		--glow: var(--color-butter);
		/* Type on the glass, in radio widths (cqw): the tall radio is drawn ~2.3× smaller, so it gets larger factors */
		--logo: 8.4cqw;
		--name: max(0.85rem, 2.3cqw);
		--small: max(0.68rem, 1.35cqw);
	}

	.set-tall {
		--logo: 13cqw;
		--name: max(0.85rem, 4.4cqw);
		--small: max(0.62rem, 2.9cqw);
	}

	.layer,
	.set :global(.layer) {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
	}

	.set :global(.fill) {
		display: block;
		width: 100%;
		height: 100%;
		pointer-events: none;
		user-select: none;
	}

	/* Slide-rule scale printed on the glass */
	.scale {
		color: var(--color-cream);
	}

	.scale-rule,
	.scale-ticks,
	.mark-tick {
		fill: none;
		stroke: currentColor;
		stroke-linecap: round;
	}

	.scale-rule {
		stroke-width: 2;
		opacity: 0.4;
	}

	.scale-ticks {
		stroke-width: 1.6;
		opacity: 0.3;
	}

	.mark {
		opacity: 0.55;
		transition: opacity 0.3s;
	}

	.mark-tick {
		stroke-width: 3;
	}

	.mark.on {
		opacity: 1;
		color: var(--color-butter);
		filter: drop-shadow(0 0 4px rgb(252 215 114 / 0.9));
	}

	/* Needle: eased slide with a small overshoot, instant while dragging or under reduced motion */
	.needle {
		position: absolute;
		pointer-events: none;
		transition: translate 0.75s cubic-bezier(0.34, 1.45, 0.52, 1);
		filter: drop-shadow(0 0 4px rgb(252 215 114 / 0.55)) drop-shadow(2px 3px 2px rgb(0 0 0 / 0.5));
	}

	.knob {
		position: absolute;
		pointer-events: none;
		transition: rotate 0.75s cubic-bezier(0.34, 1.45, 0.52, 1);
	}

	.instant {
		transition: none;
	}

	/* Station on the glass: logo left, name / handle / live content right */
	.glass {
		position: absolute;
		display: grid;
		place-items: center;
		pointer-events: none;
		color: var(--color-cream);
	}

	.glass-station {
		display: flex;
		align-items: center;
		gap: calc(var(--logo) * 0.3);
		max-width: 100%;
		animation: tune-in 0.45s ease-out;
	}

	.glass :global(.glass-logo) {
		flex: none;
		width: var(--logo);
		height: var(--logo);
		color: #fff7e2;
		filter: drop-shadow(0 0 0.5cqw rgb(252 215 114 / 0.95)) drop-shadow(0 0 2cqw rgb(252 215 114 / 0.55));
	}

	.glass-text {
		display: grid;
		gap: 0.15em;
		min-width: 0;
	}

	.glass-name {
		margin: 0;
		font-weight: 800;
		font-size: var(--name);
		line-height: 1.1;
		text-shadow: 0 0 1.2cqw rgb(252 215 114 / 0.6);
	}

	.glass-handle {
		margin: 0;
		font-size: var(--small);
		color: color-mix(in oklab, var(--color-butter) 85%, white);
		opacity: 0.9;
	}

	/* Live content (StationContent: label + line). Links inside stay clickable over the dial. */
	.glass-content {
		display: flex;
		align-items: baseline;
		gap: 0.45rem;
		min-width: 0;
		margin: 0.2em 0 0;
		font-size: var(--small);
		color: color-mix(in oklab, var(--color-cream) 80%, transparent);
		pointer-events: auto;
	}

	.glass-idle {
		margin: 0;
		max-width: 80%;
		font-size: var(--small);
		letter-spacing: 0.12em;
		text-align: center;
		color: var(--color-cream);
		opacity: 0.6;
	}

	@keyframes tune-in {
		0% {
			opacity: 0;
		}
		35% {
			opacity: 0.6;
		}
		50% {
			opacity: 0.25;
		}
		100% {
			opacity: 1;
		}
	}

	/* The slider covers the glass; it is invisible but focusable. */
	.dial {
		position: absolute;
		margin: 0;
		appearance: none;
		background: transparent;
		opacity: 0;
		cursor: ew-resize;
		touch-action: pan-y;
	}

	.dial::-webkit-slider-thumb {
		appearance: none;
		width: 2rem;
		height: 100%;
	}

	.dial::-moz-range-thumb {
		width: 2rem;
		height: 100%;
		border: 0;
		background: transparent;
	}

	.glass-focus {
		position: absolute;
		pointer-events: none;
		border-radius: 1.6cqw;
	}

	.set:has(.dial:focus-visible) .glass-focus {
		outline: 2px solid var(--color-butter);
		outline-offset: 3px;
	}

	/* Display strip */
	.strip {
		position: absolute;
		display: grid;
		align-content: center;
		padding: 0 2.2cqw;
		color: var(--color-cream);
	}

	/* Preset keys */
	.key {
		position: absolute;
		padding: 0;
		border: 0;
		background: none;
		color: var(--ink);
		cursor: pointer;
		container: key / inline-size;
		transition: translate 0.12s ease-out;
		-webkit-tap-highlight-color: transparent;
	}

	.key:hover:not(.down) {
		translate: 0 -3%;
	}

	.key:active {
		translate: 0 3%;
	}

	.key:focus-visible {
		outline: 2px solid var(--color-butter);
		outline-offset: 2px;
		border-radius: 12%;
	}

	.key :global(.fill) {
		position: absolute;
		inset: 0;
	}

	/* The painted key face: x 14…118, y 6…90 of the 128 × 112 art (pressed: 10 % lower) */
	.key-face {
		position: absolute;
		inset: 6% 9% 21% 12%;
		display: grid;
		place-items: center;
		align-content: center;
		gap: 4%;
		transition: translate 0.12s ease-out;
	}

	.key.down .key-face {
		translate: 0 13%;
	}

	/* Printed ink logo: unmodified shape, one ink color, a touch of print texture through multiply */
	.key :global(.key-logo) {
		width: min(50cqw, 3.4rem);
		height: min(50cqw, 3.4rem);
		mix-blend-mode: multiply;
		opacity: 0.92;
	}

	.key-name {
		display: none;
		font-size: 0.62rem;
		font-weight: 700;
		letter-spacing: 0.02em;
		line-height: 1;
		white-space: nowrap;
		mix-blend-mode: multiply;
		opacity: 0.8;
	}

	@container key (min-width: 5.5rem) {
		.key :global(.key-logo) {
			width: 40cqw;
			height: 40cqw;
		}

		.key-name {
			display: block;
		}
	}

	.key.down :global(.key-logo) {
		opacity: 1;
	}
</style>
