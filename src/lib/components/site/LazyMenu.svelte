<!--
	@component
	Navbar menu loaded on demand (bits-ui + floating-ui, ~35 kB gzip off every site page). A look-alike button stands in;
	hover, focus and pointerdown preload, the click mounts the real menu open.
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
		/** Trigger look of the placeholder; must match the real trigger's. Default: the 44px icon button. */
		trigger?: string;
		class?: ClassValue;
		/** Placeholder content; must match the real trigger's (the icon). */
		children: Snippet;
	}

	let { load, label, haspopup, trigger = MENU_TRIGGER, class: className, children }: Props = $props();

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
		class={[trigger, className]}
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
