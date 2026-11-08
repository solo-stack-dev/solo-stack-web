import { prerender } from '$app/server';
import * as v from 'valibot';
import {
	CommitListSchema,
	CommitSchema,
	FALLBACK_COMMITS,
	GITHUB_COMMIT_LIMIT,
	GITHUB_REPO_LIMIT,
	RepoListSchema,
	commitsUrl,
	reposUrl,
	toCommits,
	type Commit
} from './github.ts';

const headers = {
	accept: 'application/vnd.github+json',
	'x-github-api-version': '2022-11-28',
	'user-agent': 'solo-stack.dev'
};

async function getJson(url: string): Promise<unknown> {
	const response = await fetch(url, { headers, signal: AbortSignal.timeout(8000) });
	if (!response.ok) throw new Error(`GitHub ${response.status} for ${url}`);
	return response.json();
}

/**
 * Recent public commits for the night shift monitor, read from the most recently pushed repos (the Events API no longer
 * carries commit messages). Prerendered, unauthenticated: 1 + GITHUB_REPO_LIMIT requests per build (limit 60/h).
 * Any error returns `FALLBACK_COMMITS` (empty); messages are never invented.
 *
 * Builds run on the owner's PC, so the per-IP limit is plenty. If a build ever comes out with an empty monitor, add a read-only
 * GITHUB_TOKEN via src/env.ts.
 */
export const getRecentCommits = prerender(async (): Promise<Commit[]> => {
	try {
		const repos = v
			.parse(RepoListSchema, await getJson(reposUrl()))
			.filter((repo) => !repo.fork && !repo.private && !repo.archived)
			.slice(0, GITHUB_REPO_LIMIT);
		const perRepo = await Promise.all(
			repos.map(async (repo) => {
				try {
					return toCommits(repo.name, v.parse(CommitListSchema, await getJson(commitsUrl(repo.name))));
				} catch {
					return [];
				}
			})
		);
		return perRepo
			.flat()
			.filter((commit) => v.is(CommitSchema, commit))
			.toSorted((a, b) => b.date.localeCompare(a.date))
			.slice(0, GITHUB_COMMIT_LIMIT);
	} catch {
		return FALLBACK_COMMITS;
	}
});
