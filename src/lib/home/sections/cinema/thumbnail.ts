/**
 * Self-hosted video thumbnail. The facade must not contact YouTube before the visitor clicks play (no `i.ytimg.com`
 * request either: in the EU that already transfers the visitor's IP to Google). So the thumbnail is fetched once at
 * build time by the prerendered route `src/routes/media/video-thumbnail/[id].jpg/+server.ts` and served from our
 * own origin. The prerender crawler finds the route through the facade's `<img src>`, so every build ships the
 * thumbnail of the video it rendered.
 */
export const VIDEO_ID_PATTERN = /^[\w-]{11}$/;

/** Same-origin URL of the thumbnail of `id`. */
export const thumbnailPath = (id: string) => `/media/video-thumbnail/${id}.jpg`;

/** Thumbnail candidates, best first. `maxresdefault` (1280×720) does not exist for every video; `hqdefault` always does (4:3, letterboxed). */
export const THUMBNAIL_CANDIDATES = ['maxresdefault', 'sddefault', 'hqdefault'] as const;
