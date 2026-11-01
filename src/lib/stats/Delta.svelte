<!--
	@component
	Signed change of a period with an arrow icon (direction is never color alone) and an optional muted comparison
	text. Up is good for every number on this page.
-->
<script lang="ts">
	import ArrowDownRight from '@lucide/svelte/icons/arrow-down-right';
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import Minus from '@lucide/svelte/icons/minus';
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
</script>

<p class={cn('flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs', className)}>
	<span
		class={cn(
			'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-medium tabular-nums',
			direction === 'up' && 'bg-emerald-600/10 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-300',
			direction === 'down' && 'bg-destructive/10 text-destructive',
			direction === 'flat' && 'bg-muted text-muted-foreground'
		)}
	>
		{#if direction === 'up'}<ArrowUpRight class="size-3.5" aria-hidden="true" />{:else if direction === 'down'}<ArrowDownRight
				class="size-3.5"
				aria-hidden="true"
			/>{:else}<Minus class="size-3.5" aria-hidden="true" />{/if}
		{#if amount}<span>{amount}</span><span class="opacity-50" aria-hidden="true">·</span>{/if}
		<span>{formatPercent(ratio)}</span>
	</span>
	{#if note}<span class="text-muted-foreground">{note}</span>{/if}
</p>
