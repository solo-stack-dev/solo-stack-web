<!--
	@component
	Candidate stub for moon-planet. Replace this file (and index.ts) with the real prototype; keep the GameProps contract.
-->
<script lang="ts">
	import PlaceholderGame from '../shared/PlaceholderGame.svelte';
	import type { GameProps } from '../shared/types.ts';

	let props: GameProps = $props();
</script>

<PlaceholderGame {...props} variant="moon-planet" />
