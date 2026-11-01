<!--
	@component
	A navbar menu whose heavy implementation (bits-ui dropdown/sheet + floating-ui) loads on demand: until the first
	tap a plain button with the same look stands in for the real trigger. Hover, focus and pointerdown start the
	download early; the click swaps in the real menu, mounted open. Keeps ~35 kB gzip off every blog and stats page.
-->
<script lang="ts">
	import type { Component, Snippet } from 'svelte';
	import type { ClassValue } from 'svelte/elements';
	import { MENU_TRIGGER } from './lazy-menu.ts';

	type Menu = Component<{ open?: boolean }>;

	interface Props {
		/** Dynamic import of the real menu component (`open` bindable, renders its own trigger). */
		load: () => Promise<{ default: Menu }>;
		/** Accessible name; must match the real trigger's. */
		label: string;
		haspopup: 'menu' | 'dialog';
		class?: ClassValue;
		/** Placeholder content; must match the real trigger's (the icon). */
		children: Snippet;
	}

	let { load, label, haspopup, class: className, children }: Props = $props();

	let Loaded = $state<Menu>();
	let open = $state(false);
	let loading: Promise<{ default: Menu }> | undefined;

	// One download per page; a failed one (offline) is retried on the next interaction
	const preload = () =>
		(loading ??= load().catch((error: unknown) => {
			loading = undefined;
			throw error;
		}));

	async function activate() {
		const { default: menu } = await preload();
		open = true;
		Loaded = menu;
	}
</script>

{#if Loaded}
	<Loaded bind:open />
{:else}
	<button
		type="button"
		class={[MENU_TRIGGER, className]}
		aria-label={label}
		aria-haspopup={haspopup}
		aria-expanded="false"
		onpointerenter={preload}
		onpointerdown={preload}
		onfocus={preload}
		onclick={activate}
	>
		{@render children()}
	</button>
{/if}
