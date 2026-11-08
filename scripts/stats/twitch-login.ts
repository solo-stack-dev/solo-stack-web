/* oxlint-disable no-console -- CLI tool that reports what it did */
/**
 * One-time Twitch login for the stats collector (docs/ARCHITECTURE.md#stats-page). Helix only returns follower totals to a user
 * access token, and a Worker cannot update its own secrets, so the token pair lives in KV (`stats:twitch-token`) and the
 * collector rotates it there.
 *
 *   pnpm stats:twitch-login                    local KV (.wrangler/state, used by `pnpm stats:dev` and `pnpm dev`)
 *   pnpm stats:twitch-login --env staging      staging KV (remote)
 *   pnpm stats:twitch-login --env production   production KV (remote)
 *
 * Reads TWITCH_CLIENT_ID/TWITCH_CLIENT_SECRET from the repo-root `.env`, serves the redirect on http://localhost:3000 (registered
 * in the Twitch app), and writes the token with `wrangler kv key put`. Log in once per environment: each login creates its own
 * token pair, so the environments never rotate each other's refresh token. Tokens are never printed.
 */
import { spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { TWITCH_LOGIN, tokenFromResponse, type TwitchTokenResponse } from '../../workers/stats-collector/src/platforms/twitch.ts';
import { TWITCH_TOKEN_KEY } from '../../workers/stats-collector/src/tokens.ts';

const { values } = parseArgs({ options: { env: { type: 'string', default: 'local' } } });
const target = values.env!;
if (!['local', 'staging', 'production'].includes(target)) throw new Error('--env must be local, staging or production');

process.loadEnvFile('.env');
const clientId = process.env.TWITCH_CLIENT_ID;
const clientSecret = process.env.TWITCH_CLIENT_SECRET;
if (!clientId || !clientSecret) throw new Error('TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET must be set in .env');

const PORT = 3000;
const REDIRECT_URI = `http://localhost:${PORT}`;
const state = randomBytes(16).toString('hex');

const authorize = new URL('https://id.twitch.tv/oauth2/authorize');
authorize.search = new URLSearchParams({
	response_type: 'code',
	client_id: clientId,
	redirect_uri: REDIRECT_URI,
	// Read-only; the follower total itself needs no scope, but a user token.
	scope: 'moderator:read:followers',
	state,
	force_verify: 'true'
}).toString();

async function twitch<T>(label: string, url: string, init?: RequestInit): Promise<T> {
	const response = await fetch(url, init);
	if (!response.ok) throw new Error(`${label}: HTTP ${response.status} ${(await response.text()).slice(0, 300)}`);
	return (await response.json()) as T;
}

async function exchange(code: string) {
	const body = new URLSearchParams({ client_id: clientId!, client_secret: clientSecret!, code, grant_type: 'authorization_code', redirect_uri: REDIRECT_URI });
	const token = tokenFromResponse(await twitch<TwitchTokenResponse>('token', 'https://id.twitch.tv/oauth2/token', { method: 'POST', body }));

	const me = await twitch<{ login: string; user_id: string }>('validate', 'https://id.twitch.tv/oauth2/validate', {
		headers: { authorization: `OAuth ${token.accessToken}` }
	});
	const users = await twitch<{ data: { id: string; login: string }[] }>('users', `https://api.twitch.tv/helix/users?login=${TWITCH_LOGIN}`, {
		headers: { authorization: `Bearer ${token.accessToken}`, 'client-id': clientId! }
	});
	const broadcaster = users.data[0];
	if (!broadcaster) throw new Error(`Twitch user ${TWITCH_LOGIN} not found`);
	console.log(`Logged in as ${me.login} (${me.user_id}); channel ${broadcaster.login} has broadcaster id ${broadcaster.id}.`);

	const dir = mkdtempSync(join(tmpdir(), 'twitch-token-'));
	const file = join(dir, 'token.json');
	try {
		writeFileSync(file, JSON.stringify(token), { mode: 0o600 });
		const where = target === 'local' ? ['--local'] : ['--remote', '--env', target];
		const put = spawnSync('pnpm', ['exec', 'wrangler', 'kv', 'key', 'put', TWITCH_TOKEN_KEY, '--path', file, '--binding', 'KV', '-c', 'wrangler.jsonc', ...where], {
			stdio: 'inherit',
			shell: process.platform === 'win32'
		});
		if (put.status !== 0) throw new Error('wrangler kv key put failed');
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
	console.log(`Stored ${TWITCH_TOKEN_KEY} in the ${target} KV namespace.`);
}

const server = createServer((request, response) => {
	const url = new URL(request.url ?? '/', REDIRECT_URI);
	const code = url.searchParams.get('code');
	if (url.searchParams.get('state') !== state || !code) {
		response.writeHead(400).end(url.searchParams.get('error_description') ?? 'Missing code or wrong state.');
		return;
	}
	exchange(code).then(
		() => {
			response.writeHead(200, { 'content-type': 'text/plain' }).end('Done, you can close this tab.');
			server.close();
		},
		(error: unknown) => {
			console.error(error instanceof Error ? error.message : error);
			response.writeHead(500, { 'content-type': 'text/plain' }).end('Failed, see the terminal.');
			server.close();
			process.exitCode = 1;
		}
	);
});

server.listen(PORT, 'localhost', () => {
	console.log(`Open this URL and log in as the channel owner (${TWITCH_LOGIN}):\n\n${authorize}\n`);
});
