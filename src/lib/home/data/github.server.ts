import * as v from 'valibot';
import type { Commit } from './github.ts';

export const CommitSchema = v.object({
	hash: v.pipe(v.string(), v.regex(/^[\da-f]{7}$/)),
	message: v.pipe(v.string(), v.trim(), v.nonEmpty()),
	repo: v.string(),
	date: v.pipe(v.string(), v.isoTimestamp()),
	url: v.pipe(v.string(), v.url())
}) satisfies v.GenericSchema<unknown, Commit>;

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

export function toCommits(repo: string, list: v.InferOutput<typeof CommitListSchema>): Commit[] {
	return list.map((item) => ({
		hash: item.sha.slice(0, 7),
		message: item.commit.message.split('\n')[0]!.trim(),
		repo,
		date: item.commit.author?.date ?? item.commit.committer?.date ?? '',
		url: item.html_url
	}));
}
