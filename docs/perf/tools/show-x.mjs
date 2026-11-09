import { readFileSync } from 'node:fs';
const d = JSON.parse(readFileSync(process.argv[2], 'utf8'));
console.log('idle', JSON.stringify(d.idle));
for (const e of d.experiments ?? []) {
	if (!e.anims) {
		console.log(JSON.stringify(e));
		continue;
	}
	const a = JSON.parse(e.anims);
	const g = {};
	for (const x of a) {
		const k = `${x.name} | ${x.props} | ${x.timeline} | ${x.state} | vis=${x.vis} | ${x.tag}.${x.cls}`;
		g[k] = (g[k] ?? 0) + 1;
	}
	console.log('animations:', a.length);
	console.log(
		Object.entries(g)
			.sort((p, q) => q[1] - p[1])
			.map(([k, v]) => `  ${v}x ${k}`)
			.join('\n')
	);
}
