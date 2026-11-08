import assert from 'node:assert/strict';
import { test } from 'node:test';
import { INSTAGRAM_TOKEN_KEY, sha256 } from '../tokens.ts';
import { collectInstagram } from './instagram.ts';

const ACCOUNT_ID = '17841419275290834';
const SINCE = '2026-11-01';

test('Unified Login reads the Instagram account with the secret, without legacy refresh or KV', async (t) => {
	const token = 'test-unified-token';
	const env = {
		INSTAGRAM_ACCOUNT_ID: ACCOUNT_ID,
		INSTAGRAM_ACCESS_TOKEN: token,
		KV: {
			get() {
				assert.fail('Unified Login must not read an old Instagram Login token from KV');
			},
			put() {
				assert.fail('Unified Login must not seed or refresh a legacy token');
			}
		}
	} as unknown as Env;
	let requests = 0;
	t.mock.method(globalThis, 'fetch', async (input: string | URL, init?: RequestInit) => {
		const url = new URL(input);
		assert.equal(url.origin, 'https://graph.facebook.com');
		assert.equal(new Headers(init?.headers).get('authorization'), `Bearer ${token}`);
		assert.equal(url.searchParams.has('access_token'), false);
		requests++;
		if (requests === 1) {
			assert.equal(url.pathname, `/v27.0/${ACCOUNT_ID}`);
			assert.equal(url.searchParams.get('fields'), 'followers_count');
			return Response.json({ followers_count: 19 });
		}
		assert.equal(url.pathname, `/v27.0/${ACCOUNT_ID}/media`);
		if (requests === 2) {
			assert.equal(url.searchParams.get('fields'), 'timestamp');
			return Response.json({
				data: [{ timestamp: '2026-11-08T12:00:00+0000' }],
				paging: { next: `https://graph.facebook.com/v27.0/${ACCOUNT_ID}/media?after=page2&access_token=${token}` }
			});
		}
		assert.equal(url.searchParams.get('after'), 'page2');
		return Response.json({
			data: [{ timestamp: '2026-11-02T18:00:00+0000' }, { timestamp: '2026-10-20T09:00:00+0000' }],
			paging: { next: `https://graph.facebook.com/v27.0/${ACCOUNT_ID}/media?after=outside-window` }
		});
	});

	assert.deepEqual(await collectInstagram({ env, since: SINCE }), {
		platform: 'instagram',
		followers: 19,
		posts: ['2026-11-08T12:00:00.000Z', '2026-11-02T18:00:00.000Z']
	});
	assert.equal(requests, 3);
});

test('Instagram pagination never forwards the bearer token to another host', async (t) => {
	const env = { INSTAGRAM_ACCOUNT_ID: ACCOUNT_ID, INSTAGRAM_ACCESS_TOKEN: 'test-unified-token' } as Env;
	let requests = 0;
	t.mock.method(globalThis, 'fetch', async (input: string | URL) => {
		assert.equal(new URL(input).origin, 'https://graph.facebook.com');
		requests++;
		return Response.json(
			requests === 1 ? { followers_count: 0 } : { data: [{ timestamp: '2026-11-08T12:00:00+0000' }], paging: { next: 'https://example.com/media?after=page2' } }
		);
	});
	await assert.rejects(collectInstagram({ env, since: SINCE }), /unexpected pagination host/);
	assert.equal(requests, 2);
});

test('legacy Instagram Login keeps using its refreshed KV token and Instagram host', async (t) => {
	const seed = 'test-legacy-seed';
	const token = 'test-legacy-refreshed-token';
	const stored = { token, seed: await sha256(seed), refreshedAt: new Date().toISOString(), expiresAt: null };
	const env = {
		INSTAGRAM_ACCOUNT_ID: '',
		INSTAGRAM_ACCESS_TOKEN: seed,
		KV: {
			async get(key: string) {
				assert.equal(key, INSTAGRAM_TOKEN_KEY);
				return stored;
			}
		}
	} as unknown as Env;
	const paths: string[] = [];
	t.mock.method(globalThis, 'fetch', async (input: string | URL, init?: RequestInit) => {
		const url = new URL(input);
		assert.equal(url.origin, 'https://graph.instagram.com');
		assert.equal(new Headers(init?.headers).get('authorization'), `Bearer ${token}`);
		assert.equal(url.searchParams.has('access_token'), false);
		paths.push(url.pathname);
		return Response.json(url.pathname === '/me' ? { followers_count: 7 } : { data: [] });
	});
	assert.deepEqual(await collectInstagram({ env, since: SINCE }), { platform: 'instagram', followers: 7, posts: [] });
	assert.deepEqual(paths, ['/me', '/me/media']);
});
