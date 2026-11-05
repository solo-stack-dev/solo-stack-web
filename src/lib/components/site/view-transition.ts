import { onNavigate } from '$app/navigation';

/**
 * View transitions between the site pages (blog, posts, stats); call once from the (site) layout. Styles and the named
 * navbar: src/routes/layout.css. The homepage is excluded: its night scene swaps the whole surface, a cross-fade would smear.
 */

/** Only navigations that start and end inside this route group transition. */
const GROUP = '/(site)';

/**
 * Rendering is frozen until the update callback settles, and async pages block their commit on data. A ceiling, not a
 * cost: past it the transition is skipped rather than capturing a stale DOM.
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
				// Not committed yet: capturing now would snapshot the old DOM and the real page would pop in later.
				if (!committed) transition.skipTransition();
			});

			transition.finished.then(resetDirection, resetDirection);
		});
	});
}
