<!--
	@component
	500 and every status other than 404: the giant at the wall, with the actual status number in mono.
	Retry only makes sense for server errors (5xx).
-->
<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import ErrorShell from './ErrorShell.svelte';
	import GiantWall from './GiantWall.svelte';

	interface Props {
		status: number;
	}

	let { status }: Props = $props();

	const server = $derived(status >= 500);
</script>

<ErrorShell {status} title={server ? m.error_500_title() : m.error_other_title()} body={server ? m.error_500_body() : m.error_other_body()} retry={server} variant="wall">
	{#snippet scene()}
		<GiantWall />
	{/snippet}
</ErrorShell>
