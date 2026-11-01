<!--
	@component
	The painted radio itself, one layout variant (`wide` or `tall`, geometry in layout.ts). Radio.svelte renders both
	variants and CSS shows the matching one (no layout shift at hydration); the hidden one is `display: none`, so it is
	out of the tab order and the accessibility tree, and its lazy images are never fetched.

	Layers, back to front: body (empty glass, strip window, key recess) → printed scale + mini logos (SVG in body
	units) → needle → big station logo / name / handle → dial slider (transparent range input over the glass) →
	display strip (snippet) → preset keys → knob.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { m } from '#lib/paraglide/messages.js';
	import bodyTall from './assets/radio-body-mobile.png?enhanced';
	import bodyWide from './assets/radio-body.png?enhanced';
	import keyPressed from './assets/radio-key-pressed.png?enhanced';
	import keyUp from './assets/radio-key.png?enhanced';
	import knobImage from './assets/radio-knob.png?enhanced';
	import needleImage from './assets/radio-needle.png?enhanced';
	import BrandIcon from './BrandIcon.svelte';
	import { RADIO_LAYOUT, keySlots, toPercent, type RadioLayout } from './layout.ts';
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
		onpreset: (station: Station) => void;
		ondialinput: (value: number) => void;
		ondialcommit: () => void;
		ondialkey: (event: KeyboardEvent) => void;
		strip: Snippet;
	}

	let { variant, stations, dial, tuned, selected, dragging, reduced, onpreset, ondialinput, ondialcommit, ondialkey, strip }: Props = $props();

	const layout: RadioLayout = $derived(RADIO_LAYOUT[variant]);
	const body = $derived(variant === 'wide' ? bodyWide : bodyTall);
	const slots = $derived(keySlots(layout, stations.length));
	const pct = (rect: { x: number; y: number; w: number; h: number }) => toPercent(layout, rect);

	const angleAt = (position: number) => -layout.needle.sweep + position * 2 * layout.needle.sweep;
	const needleAngle = $derived(angleAt(dial / DIAL_MAX));
	const polar = (angle: number, radius: number) => {
		const radians = ((angle - 90) * Math.PI) / 180;
		return { x: layout.needle.pivot.x + Math.cos(radians) * radius, y: layout.needle.pivot.y + Math.sin(radians) * radius };
	};

	const needleBox = $derived.by(() => {
		const { pivot, box, pivotFromBottom } = layout.needle;
		return {
			...pct({ x: pivot.x - box.w / 2, y: pivot.y - (box.h - pivotFromBottom), w: box.w, h: box.h }),
			origin: `50% ${((box.h - pivotFromBottom) / box.h) * 100}%`
		};
	});

	/** Minor ticks every 2° plus the scale arc. */
	const scale = $derived.by(() => {
		const { sweep } = layout.needle;
		const { tickRadius } = layout.scale;
		const ticks: string[] = [];
		for (let angle = -sweep; angle <= sweep + 0.01; angle += 2) {
			const a = polar(angle, tickRadius - 6);
			const b = polar(angle, tickRadius);
			ticks.push(`M${a.x.toFixed(1)} ${a.y.toFixed(1)}L${b.x.toFixed(1)} ${b.y.toFixed(1)}`);
		}
		const start = polar(-sweep, tickRadius);
		const end = polar(sweep, tickRadius);
		const arc = `M${start.x.toFixed(1)} ${start.y.toFixed(1)}A${tickRadius} ${tickRadius} 0 0 1 ${end.x.toFixed(1)} ${end.y.toFixed(1)}`;
		return { ticks: ticks.join(''), arc };
	});

	const stationMarks = $derived(
		stations.map((station) => {
			const angle = angleAt(station.position);
			const { tickRadius, logoRadius, logoSize } = layout.scale;
			const a = polar(angle, tickRadius - 14);
			const b = polar(angle, tickRadius + 4);
			const logo = polar(angle, logoRadius);
			return { station, tick: `M${a.x} ${a.y}L${b.x} ${b.y}`, logo: { x: logo.x - logoSize / 2, y: logo.y - logoSize / 2, size: logoSize } };
		})
	);

	const glassShown = $derived(tuned ?? null);
</script>

<div class={['set', `set-${variant}`]} style:aspect-ratio="{layout.size.w} / {layout.size.h}">
	<enhanced:img src={body} alt="" class="layer body" sizes={variant === 'wide' ? '(min-width: 80rem) 56rem, 62vw' : '94vw'} loading="lazy" />

	<!-- Printed scale on the glass -->
	<svg class="layer scale" viewBox="0 0 {layout.size.w} {layout.size.h}" aria-hidden="true">
		<path d={scale.arc} class="scale-arc" />
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
		style:transform-origin={needleBox.origin}
		style:rotate="{needleAngle}deg"
	>
		<enhanced:img src={needleImage} alt="" class="fill" sizes="2rem" loading="lazy" />
	</div>

	<!-- Big station logo, name, handle on the glass -->
	<div
		class="glass"
		style:left={pct(layout.glassContent).left}
		style:top={pct(layout.glassContent).top}
		style:width={pct(layout.glassContent).width}
		style:height={pct(layout.glassContent).height}
	>
		{#if glassShown}
			{#key glassShown.id}
				<div class="glass-station">
					<BrandIcon path={glassShown.icon} class="glass-logo" />
					<p class="glass-name">{glassShown.name}</p>
					{#if glassShown.handle}<p class="glass-handle font-mono">{glassShown.handle}</p>{/if}
				</div>
			{/key}
		{:else}
			<p class="glass-idle font-mono">{m.home_radio_glass_idle()}</p>
		{/if}
	</div>

	<!-- Tuning dial: a real slider over the glass -->
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

	<!-- Display strip -->
	<div
		class="strip"
		style:left={pct(layout.displayStrip).left}
		style:top={pct(layout.displayStrip).top}
		style:width={pct(layout.displayStrip).width}
		style:height={pct(layout.displayStrip).height}
	>
		{@render strip()}
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
				<enhanced:img src={down ? keyPressed : keyUp} alt="" class="fill" sizes="6rem" loading="lazy" />
				<span class="key-face">
					<BrandIcon path={station.icon} class="key-logo" />
					<span class="key-name" aria-hidden="true">{station.name}</span>
				</span>
			</button>
		{/each}
	</div>

	{#if layout.knob}
		{@const knob = layout.knob}
		<div
			class={['knob', (dragging || reduced) && 'instant']}
			style:left="{((knob.cx - knob.r) / layout.size.w) * 100}%"
			style:top="{((knob.cy - knob.r) / layout.size.h) * 100}%"
			style:width="{((knob.r * 2) / layout.size.w) * 100}%"
			style:rotate="{(dial / DIAL_MAX) * 300 - 150}deg"
			aria-hidden="true"
		>
			<enhanced:img src={knobImage} alt="" class="fill" sizes="5rem" loading="lazy" />
		</div>
	{/if}
</div>

<style>
	.set {
		position: relative;
		width: 100%;
		container: radio / inline-size;
		/* Ink and light used on the art */
		--ink: #1b1713;
		--glow: var(--color-butter);
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

	/* Scale printed on the glass */
	.scale {
		color: var(--color-cream);
	}

	.scale-arc,
	.scale-ticks,
	.mark-tick {
		fill: none;
		stroke: currentColor;
		stroke-linecap: round;
	}

	.scale-arc {
		stroke-width: 1.2;
		opacity: 0.45;
	}

	.scale-ticks {
		stroke-width: 1;
		opacity: 0.35;
	}

	.mark {
		opacity: 0.5;
		transition: opacity 0.3s;
	}

	.mark-tick {
		stroke-width: 2;
	}

	.mark.on {
		opacity: 1;
		color: var(--color-butter);
		filter: drop-shadow(0 0 3px rgb(252 215 114 / 0.9));
	}

	/* Needle: eased sweep with a small overshoot, instant while dragging or under reduced motion */
	.needle {
		position: absolute;
		pointer-events: none;
		transition: rotate 0.75s cubic-bezier(0.34, 1.45, 0.52, 1);
		filter: drop-shadow(2px 3px 2px rgb(0 0 0 / 0.45));
	}

	.knob {
		position: absolute;
		aspect-ratio: 1;
		pointer-events: none;
		transition: rotate 0.75s cubic-bezier(0.34, 1.45, 0.52, 1);
		filter: drop-shadow(2px 3px 3px rgb(0 0 0 / 0.4));
	}

	.instant {
		transition: none;
	}

	/* Station on the glass */
	.glass {
		position: absolute;
		display: grid;
		place-items: center;
		pointer-events: none;
		text-align: center;
		color: var(--color-cream);
	}

	.glass-station {
		display: grid;
		justify-items: center;
		gap: 0.3cqw;
		animation: tune-in 0.45s ease-out;
	}

	.glass :global(.glass-logo) {
		width: 12cqw;
		height: 12cqw;
		color: #fff7e2;
		filter: drop-shadow(0 0 0.6cqw rgb(252 215 114 / 0.95)) drop-shadow(0 0 2.4cqw rgb(252 215 114 / 0.55));
	}

	.set-tall .glass :global(.glass-logo) {
		width: 17cqw;
		height: 17cqw;
	}

	.glass-name {
		margin: 0.8cqw 0 0;
		font-weight: 800;
		font-size: max(0.85rem, 2.6cqw);
		line-height: 1.1;
		text-shadow: 0 0 1.2cqw rgb(252 215 114 / 0.6);
	}

	.glass-handle {
		margin: 0;
		font-size: max(0.7rem, 1.7cqw);
		color: color-mix(in oklab, var(--color-butter) 85%, white);
		opacity: 0.85;
	}

	.glass-idle {
		margin: 0;
		max-width: 80%;
		font-size: max(0.7rem, 1.6cqw);
		letter-spacing: 0.12em;
		color: var(--color-cream);
		opacity: 0.55;
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

	/* The slider covers the glass; it is invisible but focusable, the focus ring is drawn around the glass. */
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

	.set:has(.dial:focus-visible) .glass::after {
		content: '';
		position: absolute;
		inset: -24% -12% -6%;
		border: 2px solid var(--color-butter);
		border-radius: 40% 40% 0.8rem 0.8rem;
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
		translate: 0 -2%;
	}

	.key:active {
		translate: 0 4%;
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

	.key-face {
		position: absolute;
		inset: 6% 6% 22%;
		display: grid;
		place-items: center;
		align-content: center;
		gap: 4%;
		transition: translate 0.12s ease-out;
	}

	.key.down .key-face {
		translate: 0 15%;
	}

	/* Printed ink logo: unmodified shape, one ink color, a touch of print texture through multiply */
	.key :global(.key-logo) {
		width: min(52cqw, 3rem);
		height: min(52cqw, 3rem);
		mix-blend-mode: multiply;
		opacity: 0.9;
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

	@container key (min-width: 4.4rem) {
		.key-name {
			display: block;
		}
	}

	.key.down :global(.key-logo) {
		opacity: 1;
	}
</style>
