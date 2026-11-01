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
	import Seam from '#lib/home/shared/Seam.svelte';
</script>

<svelte:head>
	<title>{m.home_meta_title()}</title>
	<meta name="description" content={m.home_meta_description()} />
</svelte:head>

<!--
	One night, 20:00 → 06:00. Order must match NIGHT_HOURS in src/lib/home/night.ts.
	Seams: ragged sky-colored watercolor bands over the section boundaries (shared/Seam.svelte), tuned per boundary at
	1440 and 390 (docs/screens/integration/). 04→06 needs none: the sunrise brings its own painted night edge.
-->
<NightPage>
	<Hero />
	<Seam height="clamp(7rem, 12vw, 12rem)" above={0.3} top={3} bottom={1} fill="color-mix(in srgb, var(--sky-now) 40%, #171615)" />
	<Making />
	<Seam height="clamp(7rem, 12vw, 12rem)" top={3} bottom={1} />
	<Game />
	<Seam height="clamp(7rem, 13vw, 13rem)" top={1} bottom={3} mirror />
	<NightShift />
	<Seam height="clamp(7rem, 12vw, 12rem)" top={3} bottom={1} mirror />
	<Radio />
	<Seam height="clamp(7rem, 12vw, 12rem)" top={1} bottom={3} />
	<Cinema />
	<Sunrise />
</NightPage>
