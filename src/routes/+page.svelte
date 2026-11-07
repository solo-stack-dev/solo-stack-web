<script lang="ts">
	import { page } from '$app/state';
	import { m } from '#lib/paraglide/messages.js';
	import NightPage from '#lib/home/NightPage.svelte';
	import Cinema from '#lib/home/sections/cinema/Cinema.svelte';
	import Game from '#lib/home/sections/game/Game.svelte';
	import Hero from '#lib/home/sections/hero/Hero.svelte';
	import Making from '#lib/home/sections/making/Making.svelte';
	import NightShift from '#lib/home/sections/night-shift/NightShift.svelte';
	import Radio from '#lib/home/sections/radio/Radio.svelte';
	import Sunrise from '#lib/home/sections/sunrise/Sunrise.svelte';
	import DawnBank from '#lib/home/shared/DawnBank.svelte';
	import Mist from '#lib/home/shared/Mist.svelte';

	const canonical = $derived(new URL(page.url.pathname, page.url.origin).href);
</script>

<svelte:head>
	<title>{m.home_meta_title()}</title>
	<meta name="description" content={m.home_meta_description()} />
	<link rel="canonical" href={canonical} />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="SOLO STACK" />
	<meta property="og:title" content={m.home_meta_title()} />
	<meta property="og:description" content={m.home_meta_description()} />
	<meta property="og:url" content={canonical} />
	<meta name="twitter:card" content="summary" />
</svelte:head>

<!--
	One night, 20:00 → 06:00. Order must match NIGHT_HOURS in src/lib/home/night.ts.
	Transitions (docs/HOMEPAGE-DEV.md §6.5): plates feather their own edges and a painted Mist bank covers each boundary,
	except 20→21 and 04→06, which are scroll-driven ink-wash wipes owned by the sections (no mist).
-->
<NightPage>
	<Hero />
	<Making />
	<Mist
		variant="dusk"
		height="clamp(5rem, 10vw, 9rem)"
		above={0.45}
		opacity={0.4}
		gaps={[18, 64]}
		cloud={{ strip: 'b', height: 'clamp(6rem, 16vw, 15rem)', above: 0.78, stretch: 1.3, shift: 8 }}
	/>
	<Game />
	<Mist
		variant="night"
		height="clamp(5rem, 11vw, 10rem)"
		above={0.55}
		opacity={0.35}
		gaps={[40, 86]}
		mirror
		cloud={{ strip: 'a', height: 'clamp(6rem, 16vw, 15rem)', above: 0.34, mirror: true, stretch: 1.25, shift: 4 }}
	/>
	<NightShift />
	<Mist
		variant="night"
		height="clamp(5rem, 10vw, 9rem)"
		above={1.05}
		opacity={0.3}
		gaps={[30, 72]}
		offset={37}
		cloud={{ strip: 'c', height: 'clamp(6rem, 14vw, 13rem)', above: 1.2, stretch: 1.3, shift: 10 }}
	/>
	<Radio />
	<Mist
		variant="predawn"
		height="clamp(5rem, 11vw, 10rem)"
		above={0.5}
		opacity={0.4}
		gaps={[24, 58]}
		mirror
		cloud={{ strip: 'a', height: 'clamp(6rem, 16vw, 15rem)', above: 0.82, stretch: 1.5, shift: -10 }}
	/>
	<Cinema />
	<DawnBank />
	<Sunrise />
</NightPage>
