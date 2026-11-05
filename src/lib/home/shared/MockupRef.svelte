<!--
	@component
	TEMPORARY. A section's mockup as a low-opacity background to build against in place. Delete the usage and its
	`assets/*-mockup-ref.webp` once the real art lands (Phase 3 removes this component). Decorative.

	In dev, `?ref=0` hides all references, `?ref=1` shows them at 0.9.
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

	// Prerendered: no query string at build time, so read it after hydration.
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
