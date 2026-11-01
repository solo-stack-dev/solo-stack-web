<!--
	@component
	One platform: logo, name, handle (links to the profile), followers, change in the period, trend line.
	Without `stats` the card shows the platform as "coming later" (Discord).
-->
<script lang="ts">
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import type { Social } from '#lib/home/data/socials.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { changeOf, periodSlice } from './derive.ts';
	import Delta from './Delta.svelte';
	import { formatNumber, formatSigned } from './format.ts';
	import PlatformIcon from './PlatformIcon.svelte';
	import type { Period, PlatformStats } from './schema.ts';
	import Sparkline from './Sparkline.svelte';

	let { social, stats, period }: { social: Social; stats?: PlatformStats; period: Period } = $props();

	const change = $derived(stats ? changeOf(stats.followers, period) : null);
</script>

<article
	class="group/platform data-[soon]:ring-dashed relative flex min-w-0 flex-col gap-3 rounded-xl bg-card p-3.5 text-card-foreground ring-1 ring-foreground/10 transition-shadow has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-ring has-[a:hover]:ring-foreground/25 data-[soon]:bg-transparent sm:p-4"
	data-soon={stats ? undefined : ''}
>
	<header class="flex items-center gap-2.5">
		<span class="grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-foreground"><PlatformIcon id={social.id} class="size-4" /></span>
		<div class="flex min-h-9 min-w-0 flex-1 flex-col justify-center leading-tight">
			<h3 class="text-sm font-semibold">
				{#if social.url}
					<!-- Stretched link: the whole card opens the profile. -->
					<a
						href={social.url}
						target="_blank"
						rel="noopener me"
						class="outline-none after:absolute after:inset-0 after:rounded-xl"
						aria-label={m.stats_profile_open({ platform: social.name })}>{social.name}</a
					>
				{:else}
					{social.name}
				{/if}
			</h3>
			{#if social.handle}<p class="truncate font-mono text-[0.7rem] text-muted-foreground">{social.handle}</p>{/if}
		</div>
		{#if social.url}<ArrowUpRight
				class="hidden size-4 shrink-0 text-muted-foreground transition-colors group-has-[a:hover]/platform:text-foreground sm:block"
				aria-hidden="true"
			/>{/if}
	</header>

	{#if stats && change}
		<div>
			<p class="text-2xl font-semibold tracking-tight">{formatNumber(change.value)}</p>
			<p class="text-xs text-muted-foreground">{social.id === 'youtube' ? m.stats_unit_subscribers() : m.stats_unit_followers()}</p>
		</div>
		<Sparkline values={periodSlice(stats.followers, period)} label={m.stats_sparkline_label({ days: period })} class="h-10" />
		<Delta ratio={change.ratio} amount={formatSigned(change.delta)} />
	{:else}
		<p class="mt-auto text-sm text-muted-foreground">{m.stats_platform_soon()}</p>
	{/if}
</article>
