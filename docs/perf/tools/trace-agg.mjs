// node trace-agg.mjs <trace.json> [fromMs] [toMs]  — self-time-ish totals per thread and event name (complete events, top-level by nesting)
import { readFileSync } from 'node:fs';
const [file, fromArg, toArg] = process.argv.slice(2);
const { traceEvents: ev } = JSON.parse(readFileSync(file, 'utf8'));
const names = {};
for (const e of ev) if (e.ph === 'M' && e.name === 'thread_name') names[`${e.pid}:${e.tid}`] = e.args.name;
const nav = ev.find((e) => e.name === 'navigationStart' && e.args?.data?.isLoadingMainFrame) ?? ev.find((e) => e.name === 'TracingStartedInBrowser');
const base = nav?.ts ?? Math.min(...ev.filter((e) => e.ts).map((e) => e.ts));
const from = fromArg ? Number(fromArg) * 1000 + base : -Infinity;
const to = toArg ? Number(toArg) * 1000 + base : Infinity;
// build B/E into X
const stacks = {};
const xs = [];
for (const e of ev) {
	const k = `${e.pid}:${e.tid}`;
	if (e.ph === 'X') xs.push({ ...e, k });
	else if (e.ph === 'B') (stacks[k] ??= []).push(e);
	else if (e.ph === 'E') {
		const b = stacks[k]?.pop();
		if (b) xs.push({ ...b, ph: 'X', dur: e.ts - b.ts, k });
	}
}
const by = {};
// self time: per thread sort by ts, subtract children
const perThread = {};
for (const x of xs) if (x.dur && x.ts >= from && x.ts <= to) (perThread[x.k] ??= []).push(x);
for (const [k, list] of Object.entries(perThread)) {
	list.sort((a, b) => a.ts - b.ts || b.dur - a.dur);
	const stack = [];
	for (const x of list) {
		while (stack.length && stack.at(-1).ts + stack.at(-1).dur <= x.ts) stack.pop();
		x.self = x.dur;
		if (stack.length) stack.at(-1).self -= x.dur;
		stack.push(x);
	}
	for (const x of list) {
		const t = names[k] ?? k;
		const key = `${t} :: ${x.name}`;
		by[key] = (by[key] ?? 0) + Math.max(0, x.self);
	}
}
const rows = Object.entries(by)
	.filter(([k]) => /CrRendererMain|Compositor|Raster|GPU|VizCompositor|ImageDecode|CrGpuMain/.test(k))
	.sort((a, b) => b[1] - a[1])
	.slice(0, 45);
for (const [k, v] of rows) console.log((v / 1000).toFixed(0).padStart(8), 'ms', k);
const threads = {};
for (const [k, v] of Object.entries(by)) {
	const t = k.split(' :: ')[0];
	threads[t] = (threads[t] ?? 0) + v;
}
console.log(
	'\nper thread (ms):',
	Object.fromEntries(
		Object.entries(threads)
			.filter(([, v]) => v > 20000)
			.map(([k, v]) => [k, Math.round(v / 1000)])
	)
);
