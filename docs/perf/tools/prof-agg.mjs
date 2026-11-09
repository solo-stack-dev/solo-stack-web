// node prof-agg.mjs <cpuprofile>: self and total time by function, plus total time under each tick-ish function
import { readFileSync } from 'node:fs';
const p = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const byId = new Map(p.nodes.map((n) => [n.id, n]));
const parent = new Map();
for (const n of p.nodes) for (const c of n.children ?? []) parent.set(c, n.id);
const counts = new Map();
for (const s of p.samples) counts.set(s, (counts.get(s) ?? 0) + 1);
const dt = (p.endTime - p.startTime) / p.samples.length / 1000;
const key = (n) => `${n.callFrame.functionName || '(anon)'} ${n.callFrame.url.split('/').pop()}:${n.callFrame.lineNumber + 1}:${n.callFrame.columnNumber + 1}`;
const self = new Map(),
	total = new Map();
for (const [id, c] of counts) {
	const n = byId.get(id);
	self.set(key(n), (self.get(key(n)) ?? 0) + c);
	const seen = new Set();
	for (let cur = id; cur; cur = parent.get(cur)) {
		const k = key(byId.get(cur));
		if (seen.has(k)) continue;
		seen.add(k);
		total.set(k, (total.get(k) ?? 0) + c);
	}
}
const fmt = (m) =>
	[...m]
		.sort((a, b) => b[1] - a[1])
		.slice(0, 30)
		.map(([k, c]) => `${(c * dt).toFixed(0).padStart(6)} ms  ${k}`)
		.join('\n');
console.log('duration', ((p.endTime - p.startTime) / 1000).toFixed(0), 'ms\n--- self\n' + fmt(self) + '\n--- total\n' + fmt(total));
