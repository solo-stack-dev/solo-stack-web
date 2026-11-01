<!--
	@component
	TEMPORARY. Shows a section's round-2 mockup as a low-opacity background so section agents build against the
	target in place. Delete the component usage and the `assets/*-mockup-ref.webp` file once the real art lands
	(Phase 3 removes this component entirely). Decorative: empty alt, `aria-hidden`.

	Toggle all references while comparing: add `?ref=0` (hide) or `?ref=1` (opacity 0.9) to the URL in dev.
-->
<script lang="ts">
	interface Props {
		src: string;
		/** 0…1. Default 0.3. */
		opacity?: number;
		/** `object-fit`. Default `cover`. */
		fit?: 'cover' | 'contain';
		class?: string;
	}

	let { src, opacity = 0.3, fit = 'cover', class: className = '' }: Props = $props();

	// Prerendered pages have no query string at build time, so only read it in the browser after hydration.
	let override = $state<string | null>(null);
	$effect(() => {
		override = new URLSearchParams(window.location.search).get('ref');
	});
	const effectiveOpacity = $derived(override === '0' ? 0 : override === '1' ? 0.9 : opacity);
</script>

<img
	{src}
	alt=""
	aria-hidden="true"
	width="1280"
	height="720"
	loading="lazy"
	decoding="async"
	data-mockup-ref
	class={['mockup-ref', className]}
	style:opacity={effectiveOpacity}
	style:object-fit={fit}
/>

<style>
	.mockup-ref {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		user-select: none;
	}
</style>
