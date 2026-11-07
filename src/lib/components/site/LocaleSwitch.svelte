<!--
	@component
	Language button of the navbar: the current locale's code. The dropdown itself (LocaleMenu, bits-ui) loads on the first tap
	via LazyMenu, so the homepage does not ship it.
-->
<script lang="ts">
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import { page } from '$app/state';
	import { m } from '#lib/paraglide/messages.js';
	import LazyMenu from './LazyMenu.svelte';
	import { LOCALE_TRIGGER, localeOf } from './locale-switch.ts';
</script>

<LazyMenu load={() => import('./LocaleMenu.svelte')} label={m.site_locale_label()} haspopup="menu" trigger={LOCALE_TRIGGER}>
	{localeOf(page.url)}<ChevronDownIcon class="chevron" aria-hidden="true" />
</LazyMenu>
