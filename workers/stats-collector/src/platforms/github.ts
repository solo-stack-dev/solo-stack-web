/** GitHub REST, public and without a token (60 requests per hour per IP): followers of the account. */
import { GITHUB_OWNER } from '#lib/home/data/socials.ts';
import { count, fetchJson } from '../http.ts';
import type { Reading } from './types.ts';

export async function collectGithub(): Promise<Reading> {
	const user = await fetchJson<{ followers: number }>('github user', `https://api.github.com/users/${GITHUB_OWNER}`, {
		headers: { accept: 'application/vnd.github+json', 'x-github-api-version': '2022-11-28' }
	});
	return { platform: 'github', followers: count('github followers', user.followers) };
}
