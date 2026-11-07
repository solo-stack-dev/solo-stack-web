<!--
	@component
	Light / dark / system (mode-watcher, mounted by the (site) layout). The trigger icon swaps via the `dark` class (CSS only),
	so server HTML and hydration agree. Heavy (bits-ui dropdown): never import statically; ThemeToggle loads it on first tap.
	The torn paper slip is shared with LocaleMenu (`menu-sheet.css`).
-->
<script lang="ts">
	import MoonIcon from '@lucide/svelte/icons/moon';
	import SunIcon from '@lucide/svelte/icons/sun';
	import { DropdownMenu } from 'bits-ui';
	import { setMode, userPrefersMode } from 'mode-watcher';
	import { m } from '#lib/paraglide/messages.js';
	import { MENU_TRIGGER } from './lazy-menu.ts';
	import './menu-sheet.css';

	let { open = $bindable(false) }: { open?: boolean } = $props();

	type Mode = 'light' | 'dark' | 'system';

	const options: { value: Mode; label: () => string }[] = [
		{ value: 'light', label: m.site_theme_light },
		{ value: 'dark', label: m.site_theme_dark },
		{ value: 'system', label: m.site_theme_system }
	];
</script>

<DropdownMenu.Root bind:open>
	<DropdownMenu.Trigger class={MENU_TRIGGER} aria-label={m.site_theme_label()}>
		<SunIcon class="size-5 dark:hidden" aria-hidden="true" />
		<MoonIcon class="hidden size-5 dark:block" aria-hidden="true" />
	</DropdownMenu.Trigger>
	<DropdownMenu.Portal>
		<DropdownMenu.Content align="end" sideOffset={6} class="menu-sheet">
			<DropdownMenu.RadioGroup value={userPrefersMode.current} onValueChange={(value) => setMode(value as Mode)}>
				{#each options as option (option.value)}
					<DropdownMenu.RadioItem value={option.value} closeOnSelect={false} class="menu-option">
						{#snippet children({ checked })}
							<span class="menu-tick" data-checked={checked || undefined} aria-hidden="true"></span>
							<span class="menu-word">{option.label()}</span>
						{/snippet}
					</DropdownMenu.RadioItem>
				{/each}
			</DropdownMenu.RadioGroup>
		</DropdownMenu.Content>
	</DropdownMenu.Portal>
</DropdownMenu.Root>
