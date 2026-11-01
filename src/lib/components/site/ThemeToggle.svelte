<!--
	@component
	Light / dark / system choice for the non-home pages (mode-watcher; the (site) layout mounts <ModeWatcher>).
	The choice is stored in localStorage by mode-watcher; "system" follows the device. The icon swaps via the `dark`
	class (CSS only), so server HTML and hydration always agree.
-->
<script lang="ts">
	import MonitorIcon from '@lucide/svelte/icons/monitor';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import SunIcon from '@lucide/svelte/icons/sun';
	import { setMode, userPrefersMode } from 'mode-watcher';
	import * as DropdownMenu from '#lib/components/ui/dropdown-menu/index.js';
	import { m } from '#lib/paraglide/messages.js';

	type Mode = 'light' | 'dark' | 'system';

	const options: { value: Mode; label: () => string; icon: typeof SunIcon }[] = [
		{ value: 'light', label: m.site_theme_light, icon: SunIcon },
		{ value: 'dark', label: m.site_theme_dark, icon: MoonIcon },
		{ value: 'system', label: m.site_theme_system, icon: MonitorIcon }
	];
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger
		class="inline-grid size-11 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground data-open:bg-muted data-open:text-foreground"
		aria-label={m.site_theme_label()}
	>
		<SunIcon class="size-5 dark:hidden" aria-hidden="true" />
		<MoonIcon class="hidden size-5 dark:block" aria-hidden="true" />
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="end" class="w-auto min-w-48">
		<DropdownMenu.RadioGroup value={userPrefersMode.current} onValueChange={(value) => setMode(value as Mode)}>
			{#each options as option (option.value)}
				<DropdownMenu.RadioItem value={option.value} class="min-h-10 gap-2.5 pr-9 text-sm">
					<option.icon class="text-muted-foreground" aria-hidden="true" />
					{option.label()}
				</DropdownMenu.RadioItem>
			{/each}
		</DropdownMenu.RadioGroup>
	</DropdownMenu.Content>
</DropdownMenu.Root>
