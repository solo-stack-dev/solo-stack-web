<!--
	@component
	The one filter of the page: 7, 30 or 90 days. Each option carries a moon phase that fills up with the period
	(crescent, half, full), and a butter disc slides to the chosen one. Native radio inputs, so arrow keys work.
-->
<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { cn } from '#lib/utils.js';
	import { PERIODS, type Period } from './schema.ts';

	let { value = $bindable(), class: className }: { value: Period; class?: string } = $props();

	/** Lit part of the moon per period, as a path in a 16×16 box (light from the right). */
	const PHASE: Record<Period, string> = {
		7: 'M8 1.4A6.6 6.6 0 0 1 8 14.6A3.6 6.6 0 0 0 8 1.4Z',
		30: 'M8 1.4A6.6 6.6 0 0 1 8 14.6Z',
		90: 'M8 1.4A6.6 6.6 0 0 1 8 14.6A6.6 6.6 0 0 1 8 1.4Z'
	};

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
				<circle cx="8" cy="8" r="6.6" fill="none" stroke="currentColor" stroke-opacity="0.4" stroke-width="1" />
				<path d={PHASE[days]} fill="currentColor" />
			</svg>
			{m.stats_period_days({ days })}
		</label>
	{/each}
</fieldset>
