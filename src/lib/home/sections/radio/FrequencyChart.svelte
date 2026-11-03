<!--
	@component
	The radio's printed frequency chart: a paper card with every social link (logo, platform, handle, frequency).
	This is the plain, accessible fallback required by the brief: real links, visible without any interaction or
	JavaScript, in reduced motion too. The active station is marked with a pencil highlight.
-->
<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import BrandIcon from './BrandIcon.svelte';
	import type { Station, StationId } from './stations.ts';

	interface Props {
		stations: readonly Station[];
		active: StationId | null;
		class?: string;
	}

	let { stations, active, class: className = '' }: Props = $props();
</script>

<div class={['chart', className]}>
	<p class="chart-title font-mono" id="home-radio-chart-title">{m.home_radio_chart_title()}</p>
	<ul aria-label={m.home_radio_socials_label()}>
		{#each stations as station (station.id)}
			<li class:active={active === station.id}>
				<a href={station.url} rel="me noopener" target="_blank">
					<span class="freq font-mono" aria-hidden="true">{station.frequency}</span>
					<BrandIcon id={station.id} class="logo" />
					<span class="name">{station.name}</span>
					{#if station.handle}<span class="handle font-mono">{station.handle}</span>{/if}
					<span class="sr-only">{m.home_radio_opens_new_tab()}</span>
				</a>
			</li>
		{/each}
	</ul>
</div>

<style>
	.chart {
		--paper: #f3e6c1;
		--ink: #1b1713;
		position: relative;
		color: var(--ink);
		background:
			radial-gradient(120% 80% at 20% 0%, rgb(255 250 232 / 0.7), transparent 60%), radial-gradient(90% 70% at 100% 100%, rgb(214 168 82 / 0.35), transparent 70%),
			var(--paper);
		border-radius: 0.35rem 0.6rem 0.45rem 0.3rem;
		padding: 1.1rem 1.1rem 0.9rem;
		box-shadow:
			0 1px 0 rgb(255 255 255 / 0.4) inset,
			0 18px 40px -12px rgb(0 0 0 / 0.7),
			0 3px 8px rgb(0 0 0 / 0.35);
		rotate: -1.2deg;
	}

	/* Paper grain */
	.chart::before {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: inherit;
		pointer-events: none;
		opacity: 0.35;
		mix-blend-mode: multiply;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' seed='4'/%3E%3CfeColorMatrix values='0 0 0 0 0.45 0 0 0 0 0.35 0 0 0 0 0.2 0 0 0 0.55 0'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E");
	}

	.chart-title {
		position: relative;
		margin: 0 0 0.6rem;
		padding-bottom: 0.45rem;
		border-bottom: 1.5px solid var(--ink);
		font-size: 0.7rem;
		font-weight: 700;
		letter-spacing: 0.24em;
		text-transform: uppercase;
	}

	ul {
		position: relative;
		display: grid;
		gap: 0.1rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	a {
		display: grid;
		grid-template-columns: 2.6rem 1.15rem 1fr;
		grid-template-areas: 'freq logo name' 'freq logo handle';
		align-items: center;
		column-gap: 0.55rem;
		padding: 0.35rem 0.4rem;
		border-radius: 0.3rem;
		color: inherit;
		text-decoration: none;
		position: relative;
	}

	a:hover .name {
		text-decoration: underline;
		text-decoration-thickness: 1.5px;
		text-underline-offset: 0.18em;
	}

	a:focus-visible {
		outline-color: var(--ink);
	}

	.freq {
		grid-area: freq;
		font-size: 0.72rem;
		font-variant-numeric: tabular-nums;
		opacity: 0.7;
		border-right: 1px dotted rgb(27 23 19 / 0.5);
		padding-right: 0.4rem;
	}

	a :global(.logo) {
		grid-area: logo;
		width: 1.15rem;
		height: 1.15rem;
		opacity: 0.92;
	}

	.name {
		grid-area: name;
		font-weight: 700;
		font-size: 0.92rem;
		line-height: 1.15;
	}

	.handle {
		grid-area: handle;
		font-size: 0.7rem;
		line-height: 1.2;
		opacity: 0.75;
		overflow-wrap: anywhere;
	}

	a:not(:has(.handle)) {
		grid-template-areas: 'freq logo name';
	}

	/* Pencil highlight on the tuned station */
	li.active a {
		background: linear-gradient(100deg, transparent 2%, rgb(241 196 82 / 0.75) 6%, rgb(241 196 82 / 0.55) 92%, transparent 98%);
	}
</style>
