<!--
	@component
	The 404 license seal, an original mark of this site: an ink disc with an ochre ring and twelve hour dots (the clock the
	night runs on), and the World Tree of the 404 scene drawn small inside it (three domed canopies on one trunk, a ground
	line), with a four point guiding star above its crown. `stamp` draws the same mark as a seal pressed into the painting:
	one pigment (`currentColor`), no disc, a broken outer rim and the uneven ink of a hand-pressed stamp. Purely decorative
	(aria-hidden); the caller labels it.
-->
<script lang="ts">
	interface Props {
		stamp?: boolean;
		class?: string;
	}

	let { stamp = false, class: className = '' }: Props = $props();
	// one filter per instance: a copy hidden with display: none (the 404 shows its seal in one of two places) would switch off
	// a shared one for every other copy
	const uid = $props.id();
	const pressId = `seal-press-${uid}`;

	// 100 × 100 box, center (50, 50). Hour dots on r = 38.5, every 30°.
	const dots = Array.from({ length: 12 }, (_, hour) => {
		const angle = (hour / 12) * Math.PI * 2;
		return { x: 50 + Math.sin(angle) * 38.5, y: 50 - Math.cos(angle) * 38.5, major: hour % 3 === 0 };
	});
	// Domed canopy tiers (flat underside, like the scene's platforms), widest at the bottom.
	const tiers = ['M27 66 C31 55.5 69 55.5 73 66 Z', 'M32.5 52 C36 43 64 43 67.5 52 Z', 'M38 38.5 C41 31 59 31 62 38.5 Z'];
	const star = 'M50 18 L51.4 22.6 L56 24 L51.4 25.4 L50 30 L48.6 25.4 L44 24 L48.6 22.6 Z';
</script>

{#if stamp}
	<svg class="hunter-emblem {className}" viewBox="0 0 100 100" aria-hidden="true">
		<!-- Pressed ink: the outline wanders a little, and the pigment skips in places, like a seal on rough paper -->
		<filter id={pressId} x="-6%" y="-6%" width="112%" height="112%">
			<feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed="4" result="wander" />
			<feDisplacementMap in="SourceGraphic" in2="wander" scale="1.8" xChannelSelector="R" yChannelSelector="G" result="inked" />
			<feTurbulence type="fractalNoise" baseFrequency="0.22" numOctaves="3" seed="11" result="paper" />
			<feColorMatrix in="paper" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -3.2 0 0 0 2.45" result="skips" />
			<feComposite in="inked" in2="skips" operator="in" />
		</filter>
		<g filter="url(#{pressId})">
			<circle cx="50" cy="50" r="45.5" fill="none" stroke="currentColor" stroke-width="3.4" />
			<circle cx="50" cy="50" r="34.5" fill="none" stroke="currentColor" stroke-width="1.5" />
			{#each dots as dot, index (index)}
				<circle cx={dot.x} cy={dot.y} r={dot.major ? 1.7 : 1} fill="currentColor" />
			{/each}
			<path d="M48.2 76 L48.9 36 H51.1 L51.8 76 Z" fill="currentColor" />
			<path d="M33 76.5 Q50 72.5 67 76.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
			{#each tiers as tier, index (index)}
				<path d={tier} fill="currentColor" />
			{/each}
			<path d={star} fill="currentColor" />
		</g>
	</svg>
{:else}
	<svg class="hunter-emblem {className}" viewBox="0 0 100 100" aria-hidden="true">
		<circle cx="50" cy="50" r="42" fill="#0e0f10" />
		<circle cx="50" cy="50" r="34.5" fill="none" stroke="#e2a93b" stroke-width="1.4" />
		{#each dots as dot, index (index)}
			<circle cx={dot.x} cy={dot.y} r={dot.major ? 1.5 : 0.9} fill={dot.major ? '#fcd772' : '#fbf3dd'} opacity={dot.major ? 1 : 0.55} />
		{/each}
		<!-- trunk, ground, canopies, star -->
		<path d="M48.2 76 L48.9 36 H51.1 L51.8 76 Z" fill="#e2a93b" />
		<path d="M33 76.5 Q50 72.5 67 76.5" fill="none" stroke="#e2a93b" stroke-width="1.6" stroke-linecap="round" />
		{#each tiers as tier, index (index)}
			<path d={tier} fill="#fcd772" />
		{/each}
		<path d={star} fill="#fff4d6" />
	</svg>
{/if}

<style>
	.hunter-emblem {
		display: block;
		overflow: visible;
	}
</style>
