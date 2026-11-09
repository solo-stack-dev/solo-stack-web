<!--
	All errors, incl. unmatched URLs (404 at runtime). 404 → World Tree (Hunter x Hunter); else → giant at the wall (Attack on
	Titan). Art: src/lib/errors/. No hreflang: the root layout emits alternates only for status 200.

	Kept tiny on purpose: Kit loads this root error node before it hydrates any page, so the art is a lazy chunk. It is awaited,
	so SSR renders it fully, and Kit links the CSS of dynamic imports used during SSR. A client-side error shows it after one
	small fetch.
-->
<script lang="ts">
	import { page } from '$app/state';
	import { m } from '#lib/paraglide/messages.js';

	const status = $derived(page.status);
</script>

<svelte:head>
	<title>{m.error_page_title({ status })}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

{#if status === 404}
	{@const NotFound = (await import('#lib/errors/NotFound.svelte')).default}
	<NotFound />
{:else}
	{@const ServerError = (await import('#lib/errors/ServerError.svelte')).default}
	<ServerError {status} />
{/if}
