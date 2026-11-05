<!--
	@component
	Every station as a real link: the radio's accessible, no-JS fallback. Visually hidden (the radio's keys and its lower display
	carry the links for sighted visitors; a printed list repeated the socials a third time on one screen). It shows itself as a quiet
	line of links under the radio while a link inside has keyboard focus, and always without scripts (the keys need JS).
-->
<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import type { Station } from './stations.ts';

	interface Props {
		stations: readonly Station[];
	}

	let { stations }: Props = $props();
</script>

<svelte:head>
	<noscript
		><style>
			[data-station-list] {
				position: relative !important;
				width: auto !important;
				height: auto !important;
				clip-path: none !important;
				overflow: visible !important;
				white-space: normal !important;
			}
		</style></noscript
	>
</svelte:head>

<ul class="stations" data-station-list aria-label={m.home_radio_socials_label()}>
	{#each stations as station (station.id)}
		<li>
			<a href={station.url} rel="me noopener" target="_blank">
				<span class="name">{station.name}</span>
				{#if station.handle}<span class="handle font-mono">{station.handle}</span>{/if}
				<span class="sr-only">{m.home_radio_opens_new_tab()}</span>
			</a>
		</li>
	{/each}
</ul>

<style>
	/* Visually hidden (sr-only), still in the a11y tree and the tab order */
	.stations {
		position: absolute;
		width: 1px;
		height: 1px;
		margin: 0;
		padding: 0;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
		list-style: none;
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.35rem 1.4rem;
		max-width: 52rem;
		color: var(--color-cream);
		text-shadow: var(--halo-ink);
	}

	/* Keyboard focus on a link: the line appears in place (like a skip link), no card */
	.stations:focus-within {
		position: relative;
		width: auto;
		height: auto;
		overflow: visible;
		clip-path: none;
		white-space: normal;
	}

	a {
		display: inline-flex;
		align-items: baseline;
		gap: 0.45rem;
		padding-block: 0.25rem;
		color: inherit;
		text-decoration: none;
	}

	.name {
		font-weight: 600;
		font-size: 0.95rem;
	}

	.handle {
		font-size: 0.75rem;
		color: color-mix(in oklab, var(--color-cream) 80%, transparent);
	}

	a:hover .name,
	a:focus-visible .name {
		text-decoration: underline;
		text-decoration-thickness: 1.5px;
		text-underline-offset: 0.2em;
	}

	a:focus-visible {
		outline: 2px solid var(--color-butter);
		outline-offset: 3px;
		border-radius: 2px;
	}
</style>
