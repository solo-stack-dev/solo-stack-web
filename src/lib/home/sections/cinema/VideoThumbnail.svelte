<!--
	@component
	Self-hosted 16:9 video thumbnail (./thumbnail.ts) as a `<picture>`: AVIF/WebP in every prerendered width, 1280 px JPEG
	fallback. Decorative (`alt=""`): facades label their play button. Other attributes go to the `<img>`; style it via
	`:global(…)`. The `<picture>` is `display: contents`, so the `<img>` lays out as the parent's direct child.
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
