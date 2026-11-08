<script lang="ts">
	import LegalPage from '#lib/components/site/LegalPage.svelte';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';
	import GermanText from '../../../content/legal/datenschutz.md';
	import EnglishText from '../../../content/legal/datenschutz.en.md';
</script>

<LegalPage title={m.site_footer_privacy()} path="/datenschutz" locale={getLocale()}>
	{#if getLocale() === 'en'}
		<EnglishText />
	{:else}
		<GermanText />
	{/if}
</LegalPage>
