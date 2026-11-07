<script lang="ts">
	import LegalPage from '#lib/components/site/LegalPage.svelte';
	import { m } from '#lib/paraglide/messages.js';
	import Text from '../../../content/legal/datenschutz.md';
</script>

<LegalPage title={m.site_footer_privacy()} path="/datenschutz">
	<Text />
</LegalPage>
