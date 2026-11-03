<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import NightPage from '#lib/home/NightPage.svelte';
	import Cinema from '#lib/home/sections/cinema/Cinema.svelte';
	import Game from '#lib/home/sections/game/Game.svelte';
	import Hero from '#lib/home/sections/hero/Hero.svelte';
	import Making from '#lib/home/sections/making/Making.svelte';
	import NightShift from '#lib/home/sections/night-shift/NightShift.svelte';
	import Radio from '#lib/home/sections/radio/Radio.svelte';
	import Sunrise from '#lib/home/sections/sunrise/Sunrise.svelte';
	import Mist from '#lib/home/shared/Mist.svelte';
</script>

<svelte:head>
	<title>{m.home_meta_title()}</title>
	<meta name="description" content={m.home_meta_description()} />
</svelte:head>

<!--
	One night, 20:00 → 06:00. Order must match NIGHT_HOURS in src/lib/home/night.ts.
	Transitions (docs/HOMEPAGE-DEV.md §6.5): every plate feathers its own edges with the painted soft edge, and a
	partly transparent painted mist bank (shared/Mist.svelte) drifts across the boundary. Two boundaries are
	scroll-driven ink-wash wipes owned by the sections themselves: 20→21 (the making plate floods up over the hero)
	and 04→06 (the sunrise night dries and pulls back), so they get no mist.
-->
<NightPage>
	<Hero />
	<Making />
	<Mist variant="dusk" height="clamp(7rem, 15vw, 14rem)" above={0.3} opacity={0.6} gaps={[18, 64]} />
	<Game />
	<Mist variant="night" height="clamp(8rem, 18vw, 16rem)" above={0.35} opacity={0.6} gaps={[40, 86]} mirror />
	<NightShift />
	<Mist variant="night" height="clamp(8rem, 17vw, 15rem)" above={0.5} opacity={0.55} gaps={[30, 72]} offset={37} />
	<Radio />
	<Mist variant="predawn" height="clamp(8rem, 18vw, 16rem)" above={0.45} opacity={0.65} gaps={[24, 58]} mirror />
	<Cinema />
	<Sunrise />
</NightPage>
