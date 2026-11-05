import * as v from 'valibot';
import { GITHUB_OWNER } from './socials.ts';

export const GITHUB_API = 'https://api.github.com';
/** How many recently pushed public repos to read commits from. */
export const GITHUB_REPO_LIMIT = 3;
/** Commits returned in total (newest first). */
export const GITHUB_COMMIT_LIMIT = 12;

export const CommitSchema = v.object({
	/** Short hash, 7 characters, `git log --oneline` style. */
	hash: v.pipe(v.string(), v.regex(/^[\da-f]{7}$/)),
	/** First line of the commit message. Real data only, never invented. */
	message: v.pipe(v.string(), v.trim(), v.nonEmpty()),
	/** Repository name without the owner. */
	repo: v.string(),
	date: v.pipe(v.string(), v.isoTimestamp()),
	url: v.pipe(v.string(), v.url())
});

export type Commit = v.InferOutput<typeof CommitSchema>;

/** The monitor then shows its empty state (`home_nightshift_monitor_empty`). */
export const FALLBACK_COMMITS: Commit[] = [];

export const RepoListSchema = v.array(v.object({ name: v.string(), fork: v.boolean(), private: v.boolean(), archived: v.boolean() }));

export const CommitListSchema = v.array(
	v.object({
		sha: v.string(),
		html_url: v.string(),
		commit: v.object({
			message: v.string(),
			author: v.nullable(v.object({ date: v.string() })),
			committer: v.nullable(v.object({ date: v.string() }))
		})
	})
);

export const reposUrl = () => `${GITHUB_API}/users/${GITHUB_OWNER}/repos?sort=pushed&direction=desc&per_page=10&type=owner`;
export const commitsUrl = (repo: string) => `${GITHUB_API}/repos/${GITHUB_OWNER}/${repo}/commits?per_page=${GITHUB_COMMIT_LIMIT}`;

export function toCommits(repo: string, list: v.InferOutput<typeof CommitListSchema>): Commit[] {
	return list.map((item) => ({
		hash: item.sha.slice(0, 7),
		message: item.commit.message.split('\n')[0]!.trim(),
		repo,
		date: item.commit.author?.date ?? item.commit.committer?.date ?? '',
		url: item.html_url
	}));
}
