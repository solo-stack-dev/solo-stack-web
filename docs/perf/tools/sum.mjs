import { readFileSync } from 'node:fs';
for (const f of process.argv.slice(2)) {
	const d = JSON.parse(readFileSync(f, 'utf8'));
	const s = d.requestsAtLoad[0].start;
	const rs = d.requestsAtLoad.filter((r) => r.url.startsWith('http'));
	const byType = {};
	for (const r of rs) byType[r.type] = Math.round(((byType[r.type] ?? 0) + (r.bytes ?? 0) / 1024) * 10) / 10;
	const lcp = d.perf.lcp.at(-1) ?? {};
	const m = d.metricsAtLoad;
	console.log(
		`\n### ${f}  load ${d.loadMs} settled ${d.settledMs} ttfb ${Math.round(d.nav.ttfb)} fcp ${Math.round(d.perf.fcp)} lcp ${Math.round(lcp.t)} (${(lcp.url || lcp.el || '').split('/').pop()}) cls ${d.perf.cls.toFixed(3)} | longtasks ${d.perf.longtasks.length} sum ${Math.round(d.perf.longtasks.reduce((a, b) => a + b.d, 0))} max ${Math.round(Math.max(0, ...d.perf.longtasks.map((x) => x.d)))} | main thread at settle: task ${m.TaskDuration.toFixed(2)}s script ${m.ScriptDuration.toFixed(2)}s style ${m.RecalcStyleDuration.toFixed(2)}s layout ${m.LayoutDuration.toFixed(2)}s | reqs ${rs.length} ${JSON.stringify(byType)} total ${Math.round(rs.reduce((a, r) => a + (r.bytes ?? 0), 0) / 1024)}kB | dom ${d.dom.nodes} nodes ${d.dom.canvases} canvases`
	);
	console.log(
		'idle',
		JSON.stringify({
			task: Math.round(d.idle.taskMsPerSec),
			style: Math.round(d.idle.styleMsPerSec),
			script: Math.round(d.idle.scriptMsPerSec),
			raf: Math.round(d.idle.rafPerSec)
		})
	);
	for (const e of d.experiments ?? []) if (!e.anims && !e.label.startsWith('ONLY')) console.log('  exp', e.label, e.taskMsPerSec, 'ms/s');
	const only = (d.experiments ?? [])
		.filter((e) => e.label?.startsWith('ONLY'))
		.sort((a, b) => b.taskMsPerSec - a.taskMsPerSec)
		.slice(0, 6);
	for (const e of only) console.log('  ', e.taskMsPerSec, e.label);
	for (const l of d.perf.loaf.sort((a, b) => b.d - a.d).slice(0, 3))
		console.log('  loaf', Math.round(l.t), Math.round(l.d), 'style', Math.round(l.style), JSON.stringify(l.scripts.slice(0, 3)));
	const big = rs
		.filter((r) => r.type === 'Image' || r.type === 'Script' || r.type === 'Font' || r.type === 'Other')
		.sort((a, b) => (b.bytes ?? 0) - (a.bytes ?? 0))
		.slice(0, 8);
	for (const r of big)
		console.log(
			`   ${((r.bytes ?? 0) / 1024).toFixed(1).padStart(6)}k ${r.type} ${r.priority} ${Math.round((r.start - s) * 1000)}-${Math.round((r.end - s) * 1000)} ${r.url.replace('https://solo-stack.dev', '').slice(0, 80)}`
		);
	if (d.scroll)
		console.log(
			'scroll',
			JSON.stringify({ ...d.scroll, loafTop: undefined }),
			'\n top loaf during scroll:',
			d.scroll.loafTop
				.slice(0, 6)
				.map((l) => `${Math.round(l.d)}ms style${Math.round(l.style)} ${l.scripts.map((x) => x.src + '/' + x.inv + ' ' + x.d).join(';')}`)
				.join('\n   ')
		);
}
