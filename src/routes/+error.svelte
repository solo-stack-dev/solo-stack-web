<!--
	All errors, incl. unmatched URLs (404 at runtime). 404 → World Tree (Hunter x Hunter); else → giant at the wall (Attack on
	Titan). Art: src/lib/errors/. No hreflang: the root layout emits alternates only for status 200.
-->
<script lang="ts">
	import { page } from '$app/state';
	import NotFound from '#lib/errors/NotFound.svelte';
	import ServerError from '#lib/errors/ServerError.svelte';
	import { m } from '#lib/paraglide/messages.js';

	const status = $derived(page.status);
</script>

<svelte:head>
	<title>{m.error_page_title({ status })}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

{#if status === 404}
	<NotFound />
{:else}
	<ServerError {status} />
{/if}
