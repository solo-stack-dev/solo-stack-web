/**
 * CSS backgrounds from enhanced-img imports. `background-image` cannot use the `<picture>` enhanced-img emits, so a CSS wash
 * imports one width with `format=avif;webp` and offers both: `image-set()` with AVIF first, WebP for browsers without it.
 * Browsers that do not know `image-set(… type())` drop that declaration, so pair it with `webpUrl` as the plain fallback:
 * two declarations in one inline `style`, or for a custom property a `@supports (background-image: image-set(url('') type('image/avif')))`
 * rule, since `var()` gives no such fallback.
 */

type EnhancedPicture = { sources: Record<string, string>; img: { src: string } };

/** The first URL of a `srcset`. */
function firstUrl(srcset: string) {
	return srcset.trim().split(/\s+/)[0];
}

/** `url("….webp")`: the `<img>` fallback of an enhanced import, which is WebP here (see `vite.config.ts`). */
export function webpUrl(picture: EnhancedPicture) {
	return `url("${picture.img.src}")`;
}

/** `image-set(url("….avif") type("image/avif"), url("….webp") type("image/webp"))`, same width for both. */
export function avifImageSet(picture: EnhancedPicture) {
	const { avif, webp } = picture.sources;
	return `image-set(url("${firstUrl(avif)}") type("image/avif"), url("${firstUrl(webp ?? picture.img.src)}") type("image/webp"))`;
}
