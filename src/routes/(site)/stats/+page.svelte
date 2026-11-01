<script lang="ts">
	import { page } from '$app/state';
	import { SOCIALS } from '#lib/home/data/socials.ts';
	import { m } from '#lib/paraglide/messages.js';
	import ActivityCalendar from '#lib/stats/ActivityCalendar.svelte';
	import GrowthCard from '#lib/stats/GrowthCard.svelte';
	import KpiRow from '#lib/stats/KpiRow.svelte';
	import PeriodSwitch from '#lib/stats/PeriodSwitch.svelte';
	import PlatformCard from '#lib/stats/PlatformCard.svelte';
	import PlatformIcon from '#lib/stats/PlatformIcon.svelte';
	import SectionHeading from '#lib/stats/SectionHeading.svelte';
	import ShareBar from '#lib/stats/ShareBar.svelte';
	import StatsHeader from '#lib/stats/StatsHeader.svelte';
	import YoutubeSection from '#lib/stats/YoutubeSection.svelte';
	import { getStats } from '#lib/stats/stats.remote.ts';
	import type { Period } from '#lib/stats/schema.ts';

	const stats = $derived(await getStats());

	let period = $state<Period>(30);

	const platformStats = (id: string) => stats.platforms.find((platform) => platform.id === id);
	const weeks = $derived(Math.round(stats.posts.length / 7));
	const canonical = $derived(new URL(page.url.pathname, page.url.origin).href);
</script>

<svelte:head>
	<title>{m.stats_meta_title()}</title>
	<meta name="description" content={m.stats_meta_description()} />
	<link rel="canonical" href={canonical} />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="SOLO STACK" />
	<meta property="og:title" content={m.stats_meta_title()} />
	<meta property="og:description" content={m.stats_meta_description()} />
	<meta property="og:url" content={canonical} />
	<meta name="twitter:card" content="summary" />
</svelte:head>

<!-- `bg-background` duplicates the (site) layout surface on purpose: the page also reads right on its own. -->
<div class="min-h-dvh overflow-x-clip bg-background text-foreground">
	<div class="mx-auto grid max-w-6xl gap-14 px-4 pt-10 pb-20 sm:px-6 sm:pt-14 lg:gap-16 lg:px-8">
		<StatsHeader {stats} />

		<section class="grid gap-4" aria-label={m.stats_period_label()}>
			<div class="flex flex-wrap items-center justify-between gap-3">
				<PeriodSwitch bind:value={period} />
			</div>
			<KpiRow {stats} {period} />
		</section>

		<section class="grid gap-5" aria-label={m.stats_growth_title()}>
			<GrowthCard {stats} {period} />
		</section>

		<section class="grid gap-6" aria-labelledby="stats-platforms">
			<SectionHeading id="stats-platforms" index="01" title={m.stats_platforms_title()} description={m.stats_platforms_description()} />
			<ShareBar {stats} />
			<div class="grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-3 lg:grid-cols-5">
				{#each SOCIALS as social (social.id)}
					<PlatformCard {social} stats={platformStats(social.id)} {period} />
				{/each}
			</div>
		</section>

		<section class="grid gap-6" aria-labelledby="stats-youtube">
			<SectionHeading id="stats-youtube" index="02" title={m.stats_youtube_title()} description={m.stats_youtube_description()}>
				{#snippet icon()}<PlatformIcon id="youtube" class="size-5" />{/snippet}
			</SectionHeading>
			<YoutubeSection {stats} {period} />
		</section>

		<section class="grid gap-6" aria-labelledby="stats-activity">
			<SectionHeading id="stats-activity" index="03" title={m.stats_activity_title()} description={m.stats_activity_description({ weeks })} />
			<div class="rounded-xl bg-card p-4 ring-1 ring-foreground/10 sm:p-6">
				<ActivityCalendar {stats} />
			</div>
		</section>
	</div>
</div>
