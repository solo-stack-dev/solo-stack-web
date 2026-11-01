<!--
	@component
	The one filter of the page: picks the period (7, 30, 90 days) for every number and chart below it.
-->
<script lang="ts">
	import * as ToggleGroup from '#lib/components/ui/toggle-group/index.js';
	import { m } from '#lib/paraglide/messages.js';
	import { PERIODS, type Period } from './schema.ts';

	let { value = $bindable() }: { value: Period } = $props();
</script>

<ToggleGroup.Root
	type="single"
	variant="outline"
	spacing={0}
	value={String(value)}
	onValueChange={(next) => {
		if (next) value = Number(next) as Period;
	}}
	aria-label={m.stats_period_label()}
	class="rounded-lg bg-card"
>
	{#each PERIODS as days (days)}
		<ToggleGroup.Item value={String(days)} class="px-3 tabular-nums data-[state=on]:bg-foreground data-[state=on]:text-background"
			>{m.stats_period_days({ days })}</ToggleGroup.Item
		>
	{/each}
</ToggleGroup.Root>
