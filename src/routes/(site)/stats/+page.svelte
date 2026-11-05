<script lang="ts">
	import { page } from '$app/state';
	import { m } from '#lib/paraglide/messages.js';
	import ActivityCalendar from '#lib/stats/ActivityCalendar.svelte';
	import Constellation from '#lib/stats/Constellation.svelte';
	import Horizon from '#lib/stats/Horizon.svelte';
	import Roots from '#lib/stats/Roots.svelte';
	import SectionHeading from '#lib/stats/SectionHeading.svelte';
	import YoutubeSection from '#lib/stats/YoutubeSection.svelte';
	import { getStats } from '#lib/stats/stats.remote.ts';
	import type { Period } from '#lib/stats/schema.ts';

	const stats = $derived(await getStats());

	let period = $state<Period>(30);

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

<div class="relative overflow-x-clip pb-8 text-foreground">
	<Horizon {stats} bind:period />

	<div class="relative mx-auto grid max-w-6xl gap-24 px-4 pt-14 sm:px-6 sm:pt-16 lg:gap-32 lg:px-8">
		<section class="grid gap-10" aria-labelledby="stats-platforms">
			<SectionHeading id="stats-platforms" title={m.stats_platforms_title()} description={m.stats_platforms_description()} />
			<Constellation {stats} {period} />
		</section>

		<section class="grid gap-10" aria-labelledby="stats-youtube">
			<SectionHeading id="stats-youtube" title={m.stats_youtube_title()} description={m.stats_youtube_description()} tilt={1.5} />
			<YoutubeSection {stats} {period} />
		</section>

		<section class="grid gap-10" aria-labelledby="stats-activity">
			<SectionHeading id="stats-activity" title={m.stats_activity_title()} description={m.stats_activity_description({ weeks })} tilt={-1} />
			<ActivityCalendar {stats} />
		</section>
	</div>

	<!-- The tree's painted root: from the hill down the right margin past every section into the footer horizon -->
	<Roots />
</div>
