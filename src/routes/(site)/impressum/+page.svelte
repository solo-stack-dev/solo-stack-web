<script lang="ts">
	import LegalPage from '#lib/components/site/LegalPage.svelte';
	import { m } from '#lib/paraglide/messages.js';
	import Text from '../../../content/legal/impressum.md';
</script>

<LegalPage title={m.site_footer_imprint()} path="/impressum">
	<Text />
</LegalPage>
