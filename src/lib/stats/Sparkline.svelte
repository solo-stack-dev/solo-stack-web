<!--
	@component
	Tiny trend line in plain SVG (no chart library): 2px line, a soft wash below, and an end dot with a surface ring.
	Stretches to its box; the stroke stays 2px through `vector-effect`. Pass `label` to expose it as an image.
-->
<script lang="ts">
	import { cn } from '#lib/utils.js';

	interface Props {
		values: readonly number[];
		label?: string;
		/** Start the value axis at 0 instead of the minimum (shows the real proportion, flatter line). */
		zero?: boolean;
		class?: string;
	}

	let { values, label, zero = false, class: className }: Props = $props();

	const geometry = $derived.by(() => {
		const min = zero ? 0 : Math.min(...values);
		const max = Math.max(...values);
		const span = max - min || 1;
		const last = values.length - 1 || 1;
		// Inset 3 units top and bottom of a 0…40 box so the line and the dot never touch the edge.
		const points = values.map((value, index) => [(index / last) * 100, 37 - ((value - min) / span) * 34] as const);
		const line = points.map(([x, y], index) => `${index ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)}`).join('');
		return { line, area: `${line}L100 40L0 40Z`, end: points[points.length - 1] };
	});

	const id = $props.id();
</script>

<div class={cn('relative', className)} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : 'true'}>
	<svg viewBox="0 0 100 40" preserveAspectRatio="none" class="absolute inset-0 size-full overflow-visible" aria-hidden="true">
		<defs>
			<linearGradient id="wash-{id}" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stop-color="var(--chart-wash)" stop-opacity="0.45" />
				<stop offset="1" stop-color="var(--chart-wash)" stop-opacity="0" />
			</linearGradient>
		</defs>
		<path d={geometry.area} fill="url(#wash-{id})" />
		<path d={geometry.line} fill="none" stroke="var(--chart-accent)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke" />
	</svg>
	<span
		class="absolute size-2 -translate-1/2 rounded-full bg-(--chart-accent) ring-2 ring-card"
		style:left="{geometry.end[0]}%"
		style:top="{(geometry.end[1] / 40) * 100}%"
	></span>
</div>
