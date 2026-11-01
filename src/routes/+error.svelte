<!--
	Error page for every route (also unmatched URLs, which SvelteKit renders at runtime with status 404).
	404 → the World Tree (Hunter x Hunter homage); everything else → the giant at the wall (Attack on Titan homage). The art lives in src/lib/errors/.
	The root layout only emits hreflang alternates for status 200, so error pages advertise none.
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
