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
	One night, dusk → sunrise. Order must match NIGHT_HOURS in src/lib/home/night.ts.
	Transitions (docs/HOMEPAGE-DEV.md §6.5): hero → making is the ink-wash edge owned by Making, cinema → sunrise the dawn cloud
	bank. Every other boundary is a strip of plain starry sky (`--section-air`) with one faint painted mist in it: each scene
	gets room before the next one starts, and no boundary carries more than that one soft layer.
-->
<NightPage>
	<Hero />
	<Making />
	<Mist variant="dusk" air="var(--section-air)" height="clamp(8rem, 18vw, 17rem)" opacity={0.2} gaps={[18, 64]} />
	<NightShift />
	<Mist variant="night" air="var(--section-air)" height="clamp(8rem, 18vw, 17rem)" opacity={0.18} gaps={[40, 86]} mirror />
	<Radio />
	<Mist variant="night" air="var(--section-air)" height="clamp(8rem, 18vw, 17rem)" opacity={0.18} gaps={[30, 72]} offset={37} />
	<Game />
	<!-- the cinema brings its own open sky above its stage, so this boundary adds only a little -->
	<Mist variant="predawn" air="calc(var(--section-air) * 0.4)" height="clamp(8rem, 18vw, 17rem)" opacity={0.2} gaps={[24, 58]} mirror />
	<Cinema />
	<DawnBank />
	<Sunrise />
</NightPage>
