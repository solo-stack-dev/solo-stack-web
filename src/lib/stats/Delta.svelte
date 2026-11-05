<!--
	@component
	Signed period change in mono, like a margin note: arrow (direction is never color alone), optional absolute change, percentage,
	optional muted comparison. Up is good for every number here.
-->
<script lang="ts">
	import { cn } from '#lib/utils.js';
	import { formatPercent } from './format.ts';

	interface Props {
		ratio: number;
		/** Extra text after the percentage, e.g. the compared period. */
		note?: string;
		/** Absolute change shown before the percentage (already formatted, e.g. "+124"). */
		amount?: string;
		class?: string;
	}

	let { ratio, note, amount, class: className }: Props = $props();

	const direction = $derived(Math.abs(ratio) < 0.0005 ? 'flat' : ratio > 0 ? 'up' : 'down');
	const ARROW = { up: '↗', down: '↘', flat: '→' } as const;
</script>

<p class={cn('flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-xs', className)}>
	<span
		class={cn(
			'inline-flex items-baseline gap-1.5 font-mono font-medium whitespace-nowrap tabular-nums',
			direction === 'up' && 'text-emerald-800 dark:text-emerald-300',
			direction === 'down' && 'text-destructive',
			direction === 'flat' && 'text-muted-foreground'
		)}
	>
		<span aria-hidden="true">{ARROW[direction]}</span>
		{#if amount}<span>{amount}</span><span class="opacity-50" aria-hidden="true">/</span>{/if}
		<span>{formatPercent(ratio)}</span>
	</span>
	{#if note}<span class="text-muted-foreground">{note}</span>{/if}
</p>
