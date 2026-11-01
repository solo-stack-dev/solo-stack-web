/**
 * Self-hosted video thumbnail. The facade must not contact YouTube before the visitor clicks play (no `i.ytimg.com`
 * request either: in the EU that already transfers the visitor's IP to Google). So the thumbnail is fetched once at
 * build time by the prerendered route `src/routes/media/video-thumbnail/[id]/[width].[format]/+server.ts`, which
 * crops it to 16:9 and encodes it in every width × format below, and served from our own origin. The prerender
 * crawler finds the variants through `<VideoThumbnail>`'s `srcset`s and `<img src>` (and the post's `og:image`), so
 * every build ships the thumbnails of the videos it rendered.
 */
export const VIDEO_ID_PATTERN = /^[\w-]{11}$/;

/** Widths of the prerendered variants (px, all 16:9). The largest is the YouTube maximum (maxresdefault). */
export const THUMBNAIL_WIDTHS = [480, 768, 1280] as const;
export const THUMBNAIL_MAX_WIDTH = 1280;

/** Encodings the route serves. AVIF/WebP go into `<source srcset>`; JPEG is the `<img>` fallback and the og:image. */
export const THUMBNAIL_FORMATS = ['avif', 'webp', 'jpg'] as const;
export type ThumbnailFormat = (typeof THUMBNAIL_FORMATS)[number];

/** Same-origin URL of one variant of the thumbnail of `id`. Defaults to the 1280 px JPEG (og:image, `<img>` fallback). */
export const thumbnailPath = (id: string, width: number = THUMBNAIL_MAX_WIDTH, format: ThumbnailFormat = 'jpg') => `/media/video-thumbnail/${id}/${width}.${format}`;

/** `srcset` with every width of `format`. */
export const thumbnailSrcset = (id: string, format: ThumbnailFormat) => THUMBNAIL_WIDTHS.map((width) => `${thumbnailPath(id, width, format)} ${width}w`).join(', ');

/** Thumbnail candidates, best first. `maxresdefault` (1280×720) does not exist for every video; `hqdefault` always does (4:3, letterboxed). */
export const THUMBNAIL_CANDIDATES = ['maxresdefault', 'sddefault', 'hqdefault'] as const;
