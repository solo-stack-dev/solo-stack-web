<!--
	@component
	A rule drawn with one brush stroke: tapered ends, slightly uneven belly, dry-brush fray through one cheap turbulence filter.
	Horizontal by default; `vertical` for column dividers. Decorative (aria-hidden), stretches to its box.
-->
<script lang="ts">
	import { cn } from '#lib/utils.js';

	let { vertical = false, seed = 3, class: className }: { vertical?: boolean; seed?: number; class?: string } = $props();

	const id = $props.id();
	// Belly and lean vary per seed so neighbouring strokes never look stamped.
	const lean = $derived((((seed * 37) % 7) - 3) / 10);
	const d = $derived.by(() => {
		const turn = vertical;
		const p = (along: number, across: number) => (turn ? `${across} ${along}` : `${along} ${across}`);
		return `M${p(0, 5)}C${p(18, 3.4 + lean)} ${p(55, 2.8 - lean)} ${p(100, 4.4 + lean)}C${p(62, 6.6 - lean)} ${p(22, 6.8 + lean)} ${p(0, 5)}Z`;
	});
</script>

<svg
	viewBox={vertical ? '0 0 10 100' : '0 0 100 10'}
	preserveAspectRatio="none"
	class={cn('pointer-events-none block overflow-visible', vertical ? 'h-full w-2' : 'h-2 w-full', className)}
	aria-hidden="true"
>
	<defs>
		<filter id="fray-{id}" x="-30%" y="-30%" width="160%" height="160%">
			<feTurbulence type="fractalNoise" baseFrequency={vertical ? '0.3 0.9' : '0.9 0.3'} numOctaves="1" {seed} />
			<feDisplacementMap in="SourceGraphic" scale="1.4" />
		</filter>
	</defs>
	<path {d} fill="currentColor" filter="url(#fray-{id})" />
</svg>
