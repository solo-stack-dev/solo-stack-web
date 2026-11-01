import { onNavigate } from '$app/navigation';

/**
 * Subtle view transitions between the calm site pages (blog, posts, stats). Call once from the (site) layout.
 *
 * The site navbar carries `view-transition-name: site-nav`, so it leaves the root snapshot and holds still while
 * only the content underneath fades and rises (styles in src/routes/layout.css). The homepage is left out: its
 * night scene swaps the whole surface, a cross-fade to the paper would only smear.
 */

/** Only navigations that start and end inside this route group transition. */
const GROUP = '/(site)';

/**
 * Rendering is frozen until the update callback settles, and async pages also block their DOM commit on data. A
 * ceiling, not a cost: a page that commits sooner never waits. Past it the transition is skipped rather than
 * capturing a stale DOM.
 */
const DEADLINE_MS = 250;

function resetDirection() {
	delete document.documentElement.dataset.vtDir;
}

export function useViewTransitions() {
	onNavigate((navigation) => {
		if (navigation.shallow || !document.startViewTransition) return;
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		const { from, to } = navigation;
		if (!from?.route.id?.startsWith(GROUP) || !to?.route.id?.startsWith(GROUP)) return;
		// Search params or hash only: nothing to transition.
		if (from.url.pathname === to.url.pathname) return;

		const html = document.documentElement;
		html.dataset.vtDir = navigation.type === 'popstate' && (navigation.delta ?? 0) < 0 ? 'back' : 'forward';

		return new Promise<() => void>((resolve) => {
			// SvelteKit commits the new DOM after `resolve`, then calls the resolved function.
			let committed = false;

			const transition = document.startViewTransition(async () => {
				resolve(() => {
					committed = true;
				});
				await Promise.race([navigation.complete, new Promise((done) => setTimeout(done, DEADLINE_MS))]).catch(() => {});
				// An async page past its deadline has not committed yet: capturing now would snapshot the old DOM as
				// the new state and the real page would pop in afterwards. An instant swap degrades more cleanly.
				if (!committed) transition.skipTransition();
			});

			transition.finished.then(resetDirection, resetDirection);
		});
	});
}
