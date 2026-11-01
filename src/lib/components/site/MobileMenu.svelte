<!--
	@component
	Phone menu of the site navbar (below `sm`): a sheet from the right with the site links in large type.
	Closes on navigation. The vendored close button carries an English literal, so this renders its own.
-->
<script lang="ts">
	import MenuIcon from '@lucide/svelte/icons/menu';
	import XIcon from '@lucide/svelte/icons/x';
	import { page } from '$app/state';
	import * as Sheet from '#lib/components/ui/sheet/index.js';
	import { m } from '#lib/paraglide/messages.js';
	import { SITE_LINKS, siteCurrent, siteHref } from './links.ts';

	let open = $state(false);

	const iconButton =
		'inline-grid size-11 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground data-open:bg-muted data-open:text-foreground';
</script>

<Sheet.Root bind:open>
	<Sheet.Trigger class={['sm:hidden', iconButton]} aria-label={m.site_nav_menu_open()}>
		<MenuIcon class="size-5" aria-hidden="true" />
	</Sheet.Trigger>
	<Sheet.Content side="right" showCloseButton={false} class="w-4/5 gap-0 border-border bg-background p-0">
		<div class="flex h-15 items-center justify-between border-b border-border px-4">
			<Sheet.Title class="font-mono text-xs tracking-clock text-muted-foreground uppercase">{m.site_nav_menu_title()}</Sheet.Title>
			<Sheet.Close class={iconButton} aria-label={m.site_nav_menu_close()}>
				<XIcon class="size-5" aria-hidden="true" />
			</Sheet.Close>
		</div>
		<nav aria-label={m.site_nav_label()} class="px-2 py-4">
			<ul class="grid gap-1">
				{#each SITE_LINKS as link (link.id)}
					{@const current = siteCurrent(link, page.url.pathname)}
					<li>
						<a
							href={siteHref(link)}
							aria-current={current}
							onclick={() => (open = false)}
							class={[
								'flex min-h-14 items-center gap-3 rounded-xl px-4 font-display text-2xl font-extrabold tracking-tight transition-colors hover:bg-muted',
								current ? 'text-foreground' : 'text-muted-foreground'
							]}
						>
							<span class={['size-2 rounded-full', current ? 'bg-butter' : 'bg-transparent']} aria-hidden="true"></span>
							{link.label()}
						</a>
					</li>
				{/each}
			</ul>
		</nav>
	</Sheet.Content>
</Sheet.Root>
