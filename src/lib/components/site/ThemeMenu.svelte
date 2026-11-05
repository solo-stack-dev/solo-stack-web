<!--
	@component
	Light / dark / system (mode-watcher, mounted by the (site) layout). The trigger icon swaps via the `dark` class (CSS only),
	so server HTML and hydration agree. Heavy (bits-ui dropdown): never import statically; ThemeToggle loads it on first tap.

	Not a stock popover: a slip of the page's own paper (or night) with a hairline ink edge, square corners and no floating
	shadow. The rows are words in the nav's display type; the chosen one carries a hand-drawn ink tick, the highlighted one
	(keyboard or pointer) the shell's focus swash and soft light, like every other focus in the shell.
-->
<script lang="ts">
	import MoonIcon from '@lucide/svelte/icons/moon';
	import SunIcon from '@lucide/svelte/icons/sun';
	import { DropdownMenu } from 'bits-ui';
	import { setMode, userPrefersMode } from 'mode-watcher';
	import { m } from '#lib/paraglide/messages.js';
	import { MENU_TRIGGER } from './lazy-menu.ts';

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
		<DropdownMenu.Content align="end" sideOffset={6} class="theme-sheet">
			<DropdownMenu.RadioGroup value={userPrefersMode.current} onValueChange={(value) => setMode(value as Mode)}>
				{#each options as option (option.value)}
					<DropdownMenu.RadioItem value={option.value} closeOnSelect={false} class="theme-option">
						{#snippet children({ checked })}
							<span class="tick" data-checked={checked || undefined} aria-hidden="true"></span>
							<span class="word">{option.label()}</span>
						{/snippet}
					</DropdownMenu.RadioItem>
				{/each}
			</DropdownMenu.RadioGroup>
		</DropdownMenu.Content>
	</DropdownMenu.Portal>
</DropdownMenu.Root>

<style>
	/* Portalled to <body>, outside the layout: the theme tokens live on <html>, so paper and night still apply. */
	:global(.theme-sheet) {
		z-index: 50;
		min-width: 14rem;
		padding-block: 0.375rem;
		border: 1px solid color-mix(in oklab, var(--foreground) 22%, transparent);
		border-radius: 2px;
		/* the page's paper with its dusk wash, and the same pigment mottling */
		background:
			var(--surface-mottle-a) 0 0 / 704px 704px,
			linear-gradient(in oklab to bottom, var(--surface-dusk), var(--background));
		color: var(--foreground);
		outline: none;
		transform-origin: var(--bits-dropdown-menu-content-transform-origin);
	}

	@media (prefers-reduced-motion: no-preference) {
		:global(.theme-sheet[data-state='open']) {
			animation: theme-sheet-in var(--dur-hover) var(--ease-settle);
		}
	}

	@keyframes theme-sheet-in {
		from {
			opacity: 0;
			translate: 0 -0.25rem;
		}
	}

	:global(.theme-option) {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		min-height: 2.75rem;
		padding: 0 1.25rem 0 0.875rem;
		font-family: var(--font-display);
		font-size: 0.9375rem;
		font-weight: 600;
		cursor: default;
		outline: none;
		user-select: none;
		transition: color var(--dur-hover) ease;
	}

	:global(.theme-option[data-state='checked']) {
		color: var(--ink-lit);
	}

	/* Highlighted (arrow keys or pointer): the focus swash under the word and a soft light, the shared focus tokens */
	:global(.theme-option[data-highlighted]) {
		color: var(--ink-lit);
		filter: drop-shadow(0 0 0.4rem var(--focus-halo));
	}

	.word {
		position: relative;
	}

	.word::after {
		content: '';
		position: absolute;
		left: -0.05em;
		right: -0.1em;
		bottom: -0.3rem;
		height: 0.35rem;
		background: var(--focus-ring);
		mask: var(--ink-underline) center / 100% 100% no-repeat;
		scale: 0 1;
		transform-origin: left;
		transition: scale var(--dur-state) var(--ease-settle);
	}

	:global(.theme-option[data-highlighted]) .word::after {
		scale: 1 1;
	}

	/* The selection mark: one hand-drawn ink tick, in the current-page ink */
	.tick {
		flex: none;
		width: 1rem;
		height: 1rem;
		background: var(--ink-lit);
		mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3E%3Cpath d='M2.6 10.8c1.6.6 3.3 2.4 4.6 4.6C9.6 9.9 13.2 5.6 17.6 3.2' fill='none' stroke='%23000' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")
			center / contain no-repeat;
		opacity: 0;
		scale: 0.7;
		transition:
			opacity var(--dur-hover) ease,
			scale var(--dur-state) var(--ease-settle);
	}

	.tick[data-checked] {
		opacity: 1;
		scale: 1;
	}
</style>
