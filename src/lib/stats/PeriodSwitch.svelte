<!--
	@component
	The page's only filter: 7, 30 or 90 days, each drawn as a slice of the growth tree's trunk with one, two or three growth rings
	(rings are how a tree keeps time; the moon stays on the homepage); a butter disc slides to the chosen one.
	Native radio inputs, so arrow keys work.
-->
<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { cn } from '#lib/utils.js';
	import { PERIODS, type Period } from './schema.ts';

	let { value = $bindable(), class: className }: { value: Period; class?: string } = $props();

	/** Growth rings per period in a 16×16 box: slightly eccentric, like a real trunk slice (cx, cy, r). */
	const RINGS: [number, number, number][] = [
		[8.35, 8.3, 2.5],
		[8.15, 8.1, 4.5],
		[8, 8, 6.5]
	];
	const COUNT: Record<Period, number> = { 7: 1, 30: 2, 90: 3 };

	const index = $derived(PERIODS.indexOf(value));
	const name = $props.id();
</script>

<fieldset class={cn('relative grid grid-cols-3 rounded-full bg-foreground/[0.06] p-1 ring-1 ring-foreground/10 ring-inset', className)}>
	<legend class="sr-only">{m.stats_period_label()}</legend>
	<span
		class="pointer-events-none absolute inset-y-1 left-1 w-[calc((100%-0.5rem)/3)] rounded-full bg-butter shadow-[0_2px_16px_-2px_rgb(252_215_114/0.6)] transition-transform duration-500 ease-[cubic-bezier(.3,1.35,.5,1)] motion-reduce:transition-none"
		style:transform="translateX({index * 100}%)"
		aria-hidden="true"
	></span>
	{#each PERIODS as days (days)}
		<label
			class="relative z-10 flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full px-3.5 text-sm font-medium whitespace-nowrap tabular-nums transition-colors duration-300 has-checked:text-night has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ring sm:px-4"
		>
			<input type="radio" {name} value={days} bind:group={value} class="sr-only" />
			<svg viewBox="0 0 16 16" class="size-4 shrink-0" aria-hidden="true">
				<circle cx="8.45" cy="8.4" r="0.9" fill="currentColor" />
				{#each RINGS.slice(0, COUNT[days]) as [cx, cy, r], ring (ring)}
					<circle
						{cx}
						{cy}
						{r}
						fill="none"
						stroke="currentColor"
						stroke-width={ring === COUNT[days] - 1 ? 1.4 : 1}
						stroke-opacity={ring === COUNT[days] - 1 ? 1 : 0.55}
					/>
				{/each}
			</svg>
			{m.stats_period_days({ days })}
		</label>
	{/each}
</fieldset>
