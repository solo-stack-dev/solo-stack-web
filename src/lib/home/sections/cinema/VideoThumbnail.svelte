<!--
	@component
	Self-hosted, 16:9 video thumbnail (see ./thumbnail.ts) as a responsive `<picture>`: AVIF and WebP in every prerendered
	width, the 1280 px JPEG as `<img>` fallback. Decorative (`alt=""`): the facades label their play button instead.
	`sizes` is required: it is the rendered width of the image. Every other attribute (class, loading, fetchpriority,
	onerror, …) goes to the `<img>`; style it from the parent with `:global(…)`. The `<picture>` is `display: contents`,
	so the `<img>` sizes and positions as if it were the parent's direct child.
-->
<script lang="ts">
	import type { HTMLImgAttributes } from 'svelte/elements';
	import { thumbnailPath, thumbnailSrcset } from './thumbnail.ts';

	interface Props extends Omit<HTMLImgAttributes, 'src' | 'srcset' | 'sizes' | 'alt' | 'width' | 'height'> {
		/** YouTube video id. */
		id: string;
		/** Rendered width of the image, as in `<img sizes>`. */
		sizes: string;
	}

	let { id, sizes, ...rest }: Props = $props();
</script>

<picture>
	<source type="image/avif" srcset={thumbnailSrcset(id, 'avif')} {sizes} />
	<source type="image/webp" srcset={thumbnailSrcset(id, 'webp')} {sizes} />
	<img src={thumbnailPath(id)} alt="" width="1280" height="720" decoding="async" {...rest} />
</picture>

<style>
	picture {
		display: contents;
	}
</style>
