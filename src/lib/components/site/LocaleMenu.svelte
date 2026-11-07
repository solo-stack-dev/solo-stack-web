<!--
	@component
	Language dropdown of the navbar: every locale by its own name, the current one ticked; each option is a link to this page
	in that language (`locale-switch.ts`). Heavy (bits-ui dropdown): never import statically; LocaleSwitch loads it on first
	tap. Same torn paper slip as the theme menu (`menu-sheet.css`).
-->
<script lang="ts">
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import { DropdownMenu } from 'bits-ui';
	import { page } from '$app/state';
	import { m } from '#lib/paraglide/messages.js';
	import { locales } from '#lib/paraglide/runtime.js';
	import { LOCALE_TRIGGER, POST_ROUTE, languageName, localeHref, localeOf, postVersions, type Version } from './locale-switch.ts';
	import './menu-sheet.css';

	let { open = $bindable(false) }: { open?: boolean } = $props();

	const current = $derived(localeOf(page.url));
	const slug = $derived(page.status === 200 && page.route.id === POST_ROUTE ? page.params.slug : undefined);

	// On a post the options wait for its translations (the index is prerendered and usually cached by the post page)
	let versions = $state<{ slug: string; list: Version[] }>();
	$effect(() => {
		const wanted = slug;
		if (!wanted) return;
		postVersions(wanted)
			.then((list) => (versions = { slug: wanted, list }))
			.catch(() => (versions = { slug: wanted, list: [] }));
	});

	const ready = $derived(!slug || versions?.slug === slug);
	const options = $derived(
		locales.map((locale) => ({ locale, href: localeHref(locale, page.url.pathname, slug ? versions?.list : undefined), name: languageName(locale) }))
	);
</script>

<DropdownMenu.Root bind:open>
	<DropdownMenu.Trigger class={LOCALE_TRIGGER} aria-label={m.site_locale_label()}>
		{current}<ChevronDownIcon class="chevron" aria-hidden="true" />
	</DropdownMenu.Trigger>
	<DropdownMenu.Portal>
		<DropdownMenu.Content align="end" sideOffset={6} class="menu-sheet">
			{#if ready}
				{#each options as option (option.locale)}
					<DropdownMenu.Item class="menu-option">
						{#snippet child({ props })}
							<a
								{...props}
								href={option.href}
								hreflang={option.locale}
								lang={option.locale}
								aria-current={option.locale === current ? 'true' : undefined}
								data-sveltekit-reload
							>
								<span class="menu-tick" data-checked={option.locale === current || undefined} aria-hidden="true"></span>
								<span class="menu-word">{option.name}</span>
							</a>
						{/snippet}
					</DropdownMenu.Item>
				{/each}
			{/if}
		</DropdownMenu.Content>
	</DropdownMenu.Portal>
</DropdownMenu.Root>
