/**
 * Stats collector Worker. The Workflow (`workflow.ts`) runs on its own schedule (`schedules` in wrangler.jsonc). The fetch
 * handler only exists for local runs (`pnpm stats:dev`): the deployed Worker has no route and no workers.dev URL, and the
 * handler also refuses anything but localhost.
 *
 * - `POST /run` starts a run and returns its instance id
 * - `GET /run?id=<id>` returns its status and result
 */
export { StatsCollector } from './workflow.ts';

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

export default {
	async fetch(request, env): Promise<Response> {
		const url = new URL(request.url);
		if (!LOCAL_HOSTS.has(url.hostname) || url.pathname !== '/run') return new Response('Not found', { status: 404 });

		if (request.method === 'POST') {
			const instance = await env.STATS_WORKFLOW.create({ id: `manual-${Date.now()}` });
			return Response.json({ id: instance.id, status: `${url.origin}/run?id=${instance.id}` });
		}
		const id = url.searchParams.get('id');
		if (request.method === 'GET' && id) return Response.json(await (await env.STATS_WORKFLOW.get(id)).status());
		return new Response('POST /run or GET /run?id=<instance id>', { status: 400 });
	}
} satisfies ExportedHandler<Env>;
