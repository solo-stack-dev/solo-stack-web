/**
 * Threads: the next platform to connect. Plan: Threads API with `threads_basic` + `threads_manage_insights`, a long-lived token
 * like Instagram's (refresh via `GET graph.threads.net/refresh_access_token?grant_type=th_refresh_token`, current token in KV as
 * `stats:threads-token`, seeded from a `THREADS_ACCESS_TOKEN` secret). Followers: `GET graph.threads.net/v1.0/me/threads_insights
 * ?metric=followers_count`; posts: `GET /v1.0/me/threads?fields=timestamp` (newest first, paged).
 *
 * To add it (or TikTok, X, Facebook once credentials exist): implement a collector returning a `Reading` (`types.ts`) like
 * `instagram.ts`, and list it in `COLLECTORS` (`workflow.ts`). Until a platform has rows in D1 the page shows it as "later".
 */
/** Planned KV key of the rotating Threads token. */
export const THREADS_TOKEN_KEY = 'stats:threads-token';
