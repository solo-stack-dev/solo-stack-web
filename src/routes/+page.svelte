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
</script>

<svelte:head>
	<title>{m.home_meta_title()}</title>
	<meta name="description" content={m.home_meta_description()} />
</svelte:head>

<!-- One night, 20:00 → 06:00. Order must match NIGHT_HOURS in src/lib/home/night.ts. -->
<NightPage>
	<Hero />
	<Making />
	<Game />
	<NightShift />
	<Radio />
	<Cinema />
	<Sunrise />
</NightPage>
