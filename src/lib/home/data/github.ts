import { GITHUB_OWNER } from './socials.ts';

/* Client-safe constants and types. The valibot schemas live in github.server.ts, so valibot stays out of the homepage bundle. */

export const GITHUB_API = 'https://api.github.com';
/** How many recently pushed public repos to read commits from. */
export const GITHUB_REPO_LIMIT = 3;
/** Commits returned in total (newest first). */
export const GITHUB_COMMIT_LIMIT = 12;

/** One commit on the night shift monitor (validated by `CommitSchema` in github.server.ts). */
export interface Commit {
	/** Short hash, 7 characters, `git log --oneline` style. */
	hash: string;
	/** First line of the commit message. Real data only, never invented. */
	message: string;
	/** Repository name without the owner. */
	repo: string;
	/** ISO timestamp. */
	date: string;
	url: string;
}

/** The monitor then shows its empty state (`home_nightshift_monitor_empty`). */
export const FALLBACK_COMMITS: Commit[] = [];

export const reposUrl = () => `${GITHUB_API}/users/${GITHUB_OWNER}/repos?sort=pushed&direction=desc&per_page=10&type=owner`;
export const commitsUrl = (repo: string) => `${GITHUB_API}/repos/${GITHUB_OWNER}/${repo}/commits?per_page=${GITHUB_COMMIT_LIMIT}`;
