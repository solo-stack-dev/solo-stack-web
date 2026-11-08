import type { PageLoad } from './$types';

// Live numbers from the KV snapshot (src/lib/stats/source.server.ts): rendered per request instead of at build time.
export const prerender = false;

// Workers Cache keeps the page for an hour (keyed by path, so per locale); the collector runs every 6 hours.
export const load: PageLoad = ({ setHeaders }) => {
	setHeaders({ 'cache-control': 'public, max-age=600, s-maxage=3600' });
};
