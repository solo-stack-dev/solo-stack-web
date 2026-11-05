<!--
	@component
	Backlit silhouette vignette of a post format (docs/SITE-REDESIGN.md): the same night horizon, a different landmark on the
	cliff per format (laptop, firefly jar, radio mast, the little shop). Stands in for the video while it is not public (post
	cards, the post page facade, the empty filter state). Always night, also in light mode: a window into the night. The
	subject sits on the right, the dark sky top left and the hills bottom left carry text (`children`). Decorative.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { DECKLE_MASK } from './materials.ts';
	import type { PostFormat } from './schema.ts';
	import aiNews from './assets/video-ai-news.webp?w=1672;1280;960;640;420&quality=70&enhanced';
	import aiTest from './assets/video-ai-test.webp?w=1672;1280;960;640;420&quality=70&enhanced';
	import business from './assets/video-business.webp?w=1672;1280;960;640;420&quality=70&enhanced';
	import project from './assets/video-project.webp?w=1672;1280;960;640;420&quality=70&enhanced';

	interface Props {
		format: PostFormat;
		/** Rendered width, as in `<img sizes>`. */
		sizes: string;
		/** Above the fold: eager, high priority. Default lazy. */
		eager?: boolean;
		/** Torn paper edge (default). Off where a parent masks or clips. */
		deckle?: boolean;
		class?: string;
		children?: Snippet;
	}

	let { format, sizes, eager = false, deckle = true, class: className = '', children }: Props = $props();

	const ART = { project, 'ai-test': aiTest, 'ai-news': aiNews, business } satisfies Record<PostFormat, unknown>;
</script>

<div class={['vignette', className]} style:--deckle={deckle ? DECKLE_MASK : undefined}>
	<enhanced:img class="art" src={ART[format]} alt="" {sizes} loading={eager ? 'eager' : 'lazy'} fetchpriority={eager ? 'high' : undefined} decoding="async" />
	{#if children}
		<div class="content">{@render children()}</div>
	{/if}
</div>

<style>
	.vignette {
		position: relative;
		isolation: isolate;
		overflow: hidden;
		background: var(--color-ink);
		color: var(--color-cream);
		container-type: inline-size;
		mask: var(--deckle, none) center / 100% 100% no-repeat;
	}

	.art {
		position: absolute;
		inset: 0;
		z-index: -1;
		width: 100%;
		height: 100%;
		/* keep the horizon and the landmark when a box crops the 16:9 art */
		object-fit: cover;
		object-position: 72% 62%;
	}

	.content {
		position: relative;
		height: 100%;
	}
</style>
