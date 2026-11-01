<!--
	@component
	Phone menu button of the site navbar (below `sm`). The sheet itself (MobileMenuSheet, bits-ui) loads on the first
	tap via LazyMenu.
-->
<script lang="ts">
	import MenuIcon from '@lucide/svelte/icons/menu';
	import { m } from '#lib/paraglide/messages.js';
	import LazyMenu from './LazyMenu.svelte';
</script>

<LazyMenu load={() => import('./MobileMenuSheet.svelte')} label={m.site_nav_menu_open()} haspopup="dialog" class="sm:hidden">
	<MenuIcon class="size-5" aria-hidden="true" />
</LazyMenu>
