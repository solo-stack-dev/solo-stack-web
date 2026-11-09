// Mobile perf run via raw CDP (no dependencies). Usage:
// node cdp-run.mjs <url> <outPrefix> [--cpu 6] [--trace] [--scroll] [--no-throttle-net] [--idle 8000] [--reduced]
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { createServer } from 'node:net';

const args = process.argv.slice(2);
const url = args[0];
const out = args[1];
const flag = (n) => args.includes(n);
const opt = (n, d) => (args.includes(n) ? args[args.indexOf(n) + 1] : d);
const CPU = Number(opt('--cpu', '6'));
const IDLE = Number(opt('--idle', '8000'));

const port = await new Promise((r) => {
	const s = createServer().listen(0, () => {
		const p = s.address().port;
		s.close(() => r(p));
	});
});
const profile = mkdtempSync(join(tmpdir(), 'perf-chrome-'));
const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', [
	'--headless=new',
	`--remote-debugging-port=${port}`,
	`--user-data-dir=${profile}`,
	'--no-first-run',
	'--no-default-browser-check',
	'--disable-extensions',
	'--window-size=412,823',
	'--autoplay-policy=user-gesture-required',
	'about:blank'
]);
let target;
for (let i = 0; i < 50; i++) {
	try {
		const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
		target = list.find((t) => t.type === 'page');
		if (target) break;
	} catch {}
	await sleep(200);
}
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r));
let id = 0;
const pending = new Map();
const listeners = [];
ws.addEventListener('message', (e) => {
	const msg = JSON.parse(e.data);
	if (msg.id && pending.has(msg.id)) {
		const { res, rej } = pending.get(msg.id);
		pending.delete(msg.id);
		if (msg.error) rej(new Error(JSON.stringify(msg.error)));
		else res(msg.result);
	} else if (msg.method) for (const l of listeners) l(msg);
});
const send = (method, params = {}) =>
	new Promise((res, rej) => {
		const i = ++id;
		pending.set(i, { res, rej });
		ws.send(JSON.stringify({ id: i, method, params }));
	});
const on = (fn) => listeners.push(fn);

// --- network log
const reqs = new Map();
on(({ method, params }) => {
	if (method === 'Network.requestWillBeSent') {
		const r = reqs.get(params.requestId) ?? {};
		Object.assign(r, {
			url: params.request.url,
			type: params.type,
			priority: params.request.initialPriority,
			start: params.timestamp,
			initiator: params.initiator?.type
		});
		reqs.set(params.requestId, r);
	} else if (method === 'Network.responseReceived') {
		const r = reqs.get(params.requestId);
		if (r)
			Object.assign(r, {
				status: params.response.status,
				mime: params.response.mimeType,
				proto: params.response.protocol,
				enc: params.response.headers['content-encoding'] ?? params.response.headers['Content-Encoding'],
				cc: params.response.headers['cache-control'] ?? params.response.headers['Cache-Control'],
				type: params.type
			});
	} else if (method === 'Network.loadingFinished') {
		const r = reqs.get(params.requestId);
		if (r) Object.assign(r, { bytes: params.encodedDataLength, end: params.timestamp });
	} else if (method === 'Network.loadingFailed') {
		const r = reqs.get(params.requestId);
		if (r) Object.assign(r, { failed: params.errorText, end: params.timestamp });
	} else if (method === 'Network.requestServedFromCache') {
	}
});

await send('Page.enable');
await send('Network.enable');
await send('Performance.enable', { timeDomain: 'timeTicks' });
await send('Network.setCacheDisabled', { cacheDisabled: true });
await send('Network.clearBrowserCache');
if (!flag('--no-throttle-net')) {
	// Lighthouse mobile "slow 4G": 150 ms RTT, 1.6 Mbps down, 750 kbps up
	await send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
}
await send('Emulation.setCPUThrottlingRate', { rate: CPU });
await send('Emulation.setDeviceMetricsOverride', { width: 412, height: 823, deviceScaleFactor: 2.625, mobile: true });
await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
await send('Emulation.setUserAgentOverride', {
	userAgent: 'Mozilla/5.0 (Linux; Android 11; moto g power (2022)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Mobile Safari/537.36',
	platform: 'Android'
});
if (flag('--reduced')) await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });

await send('Page.addScriptToEvaluateOnNewDocument', {
	source: `(() => {
	const P = (window.__perf = { lcp: [], fcp: 0, cls: 0, longtasks: [], loaf: [], raf: 0, rafByOrigin: {} });
	const raf = window.requestAnimationFrame.bind(window);
	window.requestAnimationFrame = (cb) => raf((t) => { P.raf++; if (window.__rafBlocked) { P.blocked = (P.blocked || 0) + 1; return; } cb(t); });
	try { new PerformanceObserver((l) => { for (const e of l.getEntries()) P.lcp.push({ t: e.startTime, size: e.size, url: e.url, el: e.element ? (e.element.tagName + '.' + [...e.element.classList].join('.')).slice(0, 80) : '' }); }).observe({ type: 'largest-contentful-paint', buffered: true }); } catch {}
	try { new PerformanceObserver((l) => { for (const e of l.getEntries()) if (e.name === 'first-contentful-paint') P.fcp = e.startTime; }).observe({ type: 'paint', buffered: true }); } catch {}
	try { new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) P.cls += e.value; }).observe({ type: 'layout-shift', buffered: true }); } catch {}
	try { new PerformanceObserver((l) => { for (const e of l.getEntries()) P.longtasks.push({ t: e.startTime, d: e.duration }); }).observe({ type: 'longtask', buffered: true }); } catch {}
	try { new PerformanceObserver((l) => { for (const e of l.getEntries()) P.loaf.push({ t: e.startTime, d: e.duration, block: e.blockingDuration, render: e.renderStart ? e.startTime + e.duration - e.renderStart : 0, style: e.styleAndLayoutStart ? e.startTime + e.duration - e.styleAndLayoutStart : 0, scripts: e.scripts.map((s) => ({ d: Math.round(s.duration), inv: (s.invoker || '').slice(0, 60), src: (s.sourceURL || '').split('/').pop() + ':' + (s.sourceFunctionName || ''), type: s.invokerType, forced: Math.round(s.forcedStyleAndLayoutDuration || 0) })) }); }).observe({ type: 'long-animation-frame', buffered: true }); } catch {}
})();`
});

if (opt('--raf-throttle'))
	await send('Page.addScriptToEvaluateOnNewDocument', {
		source: `(() => { const r = window.requestAnimationFrame; window.requestAnimationFrame = (cb) => { setTimeout(() => r(cb), ${opt('--raf-throttle')}); return 1; }; })();`
	});
const metrics = async () => Object.fromEntries((await send('Performance.getMetrics')).metrics.map((m) => [m.name, m.value]));
const evaluate = async (expr) => (await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true })).result.value;

let traceChunks = [];
let traceDone;
if (flag('--trace')) {
	on(({ method, params }) => {
		if (method === 'Tracing.dataCollected') traceChunks.push(...params.value);
		if (method === 'Tracing.tracingComplete') traceDone?.();
	});
	await send('Tracing.start', {
		traceConfig: {
			includedCategories: [
				'devtools.timeline',
				'disabled-by-default-devtools.timeline',
				'v8.execute',
				'blink.user_timing',
				'loading',
				'cc',
				'gpu',
				'viz',
				'disabled-by-default-devtools.timeline.frame',
				'blink'
			],
			recordMode: 'recordContinuously'
		},
		transferMode: 'ReportEvents'
	});
}

const loaded = new Promise((r) => on(({ method }) => method === 'Page.loadEventFired' && r()));
const navStart = Date.now();
await send('Page.navigate', { url });
await Promise.race([loaded, sleep(60000)]);
const loadMs = Date.now() - navStart;
// wait for network quiet (2 s without new requests) up to 30 s
let lastCount = -1;
let quietSince = Date.now();
const settleStart = Date.now();
while (Date.now() - settleStart < 30000) {
	const inflight = [...reqs.values()].filter((r) => !r.end).length;
	if (reqs.size !== lastCount || inflight) {
		lastCount = reqs.size;
		quietSince = Date.now();
	}
	if (Date.now() - quietSince > 2500) break;
	await sleep(250);
}
const settledMs = Date.now() - navStart;
const mLoad = await metrics();
const perfLoad = await evaluate('JSON.stringify(window.__perf)');
const nav = await evaluate(
	`JSON.stringify((() => { const n = performance.getEntriesByType('navigation')[0]; return { ttfb: n.responseStart, dcl: n.domContentLoadedEventEnd, load: n.loadEventEnd, transfer: n.transferSize }; })())`
);
const dom = await evaluate(
	`JSON.stringify({ nodes: document.getElementsByTagName('*').length, imgs: document.images.length, canvases: document.querySelectorAll('canvas').length, svgs: document.querySelectorAll('svg').length, docH: document.documentElement.scrollHeight, imgDetail: [...document.images].map(i => ({ src: i.currentSrc.split('/').pop(), nw: i.naturalWidth, nh: i.naturalHeight, cw: Math.round(i.getBoundingClientRect().width), ch: Math.round(i.getBoundingClientRect().height), loading: i.loading, fp: i.fetchPriority, complete: i.complete && i.naturalWidth > 0, top: Math.round(i.getBoundingClientRect().top + scrollY) })) })`
);
if (opt('--eval')) console.log('EVAL:', await evaluate(opt('--eval')));
const reqsAtLoad = [...reqs.values()].map((r) => ({ ...r }));

// idle phase at the top of the page
if (opt('--pause-anim'))
	console.log(
		'paused:',
		await evaluate(
			`document.getAnimations().filter((a) => ${JSON.stringify(opt('--pause-anim').split(','))}.some((n) => (a.animationName || '').includes(n))).map((a) => (a.pause(), a.animationName)).join()`
		)
	);
const rafBefore = await evaluate('window.__perf.raf');
if (flag('--profile')) {
	await send('Profiler.enable');
	await send('Profiler.setSamplingInterval', { interval: 200 });
	await send('Profiler.start');
}
const mIdle0 = await metrics();
await sleep(IDLE);
const mIdle1 = await metrics();
if (flag('--profile')) {
	const { profile } = await send('Profiler.stop');
	writeFileSync(`${out}.idle.cpuprofile`, JSON.stringify(profile));
}
const rafAfter = await evaluate('window.__perf.raf');
const idle = {
	ms: IDLE,
	taskMsPerSec: ((mIdle1.TaskDuration - mIdle0.TaskDuration) * 1000) / (IDLE / 1000),
	scriptMsPerSec: ((mIdle1.ScriptDuration - mIdle0.ScriptDuration) * 1000) / (IDLE / 1000),
	styleMsPerSec: ((mIdle1.RecalcStyleDuration - mIdle0.RecalcStyleDuration) * 1000) / (IDLE / 1000),
	layoutMsPerSec: ((mIdle1.LayoutDuration - mIdle0.LayoutDuration) * 1000) / (IDLE / 1000),
	rafPerSec: (rafAfter - rafBefore) / (IDLE / 1000)
};

let experiments = null;
if (flag('--experiments')) {
	const measure = async (label, ms = 5000) => {
		const a = await metrics();
		const ra = await evaluate('window.__perf.raf');
		await sleep(ms);
		const b = await metrics();
		const rb = await evaluate('window.__perf.raf');
		const r = (x, y) => Math.round(((y - x) * 1000) / (ms / 1000));
		return {
			label,
			taskMsPerSec: r(a.TaskDuration, b.TaskDuration),
			styleMsPerSec: r(a.RecalcStyleDuration, b.RecalcStyleDuration),
			layoutMsPerSec: r(a.LayoutDuration, b.LayoutDuration),
			scriptMsPerSec: r(a.ScriptDuration, b.ScriptDuration),
			rafPerSec: Math.round((rb - ra) / (ms / 1000))
		};
	};
	experiments = [];
	experiments.push(await measure('baseline'));
	experiments.push({
		anims: await evaluate(
			`JSON.stringify(document.getAnimations().map((a) => { const t = a.effect && a.effect.target; const cls = t ? String((t.className && t.className.baseVal !== undefined) ? t.className.baseVal : t.className).slice(0, 50) : ''; const kf = a.effect && a.effect.getKeyframes ? a.effect.getKeyframes() : []; const props = [...new Set(kf.flatMap((k) => Object.keys(k).filter((x) => !['offset', 'easing', 'composite', 'computedOffset'].includes(x))))].join(','); const vis = t && t.getBoundingClientRect ? (() => { const r = t.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight && r.width > 0; })() : null; return { name: a.animationName || a.constructor.name, cls, tag: t ? t.tagName : '', props, timeline: a.timeline ? a.timeline.constructor.name : 'none', state: a.playState, vis }; }))`
		)
	});
	const label = (i) =>
		evaluate(
			`(() => { const a = window.__run[${i}]; const t = a.effect && a.effect.target; return (a.animationName || a.constructor.name) + ' @ ' + (t ? t.tagName + '.' + String((t.className && t.className.baseVal !== undefined) ? t.className.baseVal : t.className).slice(0, 40) : ''); })()`
		);
	const n = await evaluate(`window.__run = document.getAnimations().filter((a) => a.playState === 'running'); window.__run.length`);
	await evaluate('window.__run.forEach((a) => a.pause())');
	await sleep(300);
	experiments.push(await measure('all running CSS animations paused (rAF loops still on)'));
	await evaluate('window.__run.forEach((a) => a.play())');
	await sleep(300);
	for (let i = 0; i < n; i++) {
		const l = await label(i);
		await evaluate(`window.__run.forEach((a, j) => j === ${i} ? a.play() : a.pause())`);
		await sleep(300);
		experiments.push(await measure('ONLY running: ' + l, 3000));
	}
	await evaluate('window.__run.forEach((a) => a.play())');
	await sleep(300);
	await evaluate('window.__rafBlocked = true');
	await sleep(300);
	experiments.push(await measure('rAF callbacks blocked (CSS on)'));
}

let scroll = null;
if (flag('--scroll')) {
	const reqsBefore = reqs.size;
	const loafBefore = (await evaluate('window.__perf.loaf.length')) ?? 0;
	const m0 = await metrics();
	// frame timing probe
	await evaluate(
		`(() => { window.__frames = []; let last = performance.now(); const tick = (t) => { window.__frames.push(t - last); last = t; if (!window.__stopFrames) requestAnimationFrame(tick); }; requestAnimationFrame(tick); })()`
	);
	const sStart = Date.now();
	const docH = JSON.parse(dom).docH;
	let y = 0;
	let g = 0;
	const maxG = Number(opt('--gestures', '999'));
	while (y < docH - 823 && Date.now() - sStart < 90000 && g++ < maxG) {
		await send('Input.synthesizeScrollGesture', { x: 200, y: 600, yDistance: -700, speed: 1400, gestureSourceType: 'touch', repeatCount: 1 });
		await sleep(400);
		y = await evaluate('scrollY');
	}
	const sMs = Date.now() - sStart;
	await sleep(3000);
	await evaluate('window.__stopFrames = true');
	const frames = JSON.parse(await evaluate('JSON.stringify(window.__frames)'));
	const m1 = await metrics();
	const loaf = JSON.parse(await evaluate(`JSON.stringify(window.__perf.loaf.slice(${loafBefore}))`));
	const sorted = [...frames].sort((a, b) => a - b);
	scroll = {
		ms: sMs,
		frames: frames.length,
		p50: sorted[Math.floor(sorted.length * 0.5)],
		p90: sorted[Math.floor(sorted.length * 0.9)],
		p99: sorted[Math.floor(sorted.length * 0.99)],
		over50: frames.filter((f) => f > 50).length,
		over100: frames.filter((f) => f > 100).length,
		taskMs: (m1.TaskDuration - m0.TaskDuration) * 1000,
		scriptMs: (m1.ScriptDuration - m0.ScriptDuration) * 1000,
		styleMs: (m1.RecalcStyleDuration - m0.RecalcStyleDuration) * 1000,
		layoutMs: (m1.LayoutDuration - m0.LayoutDuration) * 1000,
		newRequests: reqs.size - reqsBefore,
		loafCount: loaf.length,
		loafTop: loaf.sort((a, b) => b.d - a.d).slice(0, 12)
	};
	// idle at the bottom
	const b0 = await metrics();
	const rb0 = await evaluate('window.__perf.raf');
	await sleep(5000);
	const b1 = await metrics();
	const rb1 = await evaluate('window.__perf.raf');
	scroll.bottomIdleTaskMsPerSec = ((b1.TaskDuration - b0.TaskDuration) * 1000) / 5;
	scroll.bottomRafPerSec = (rb1 - rb0) / 5;
}

if (flag('--trace')) {
	const done = new Promise((r) => (traceDone = r));
	await send('Tracing.end');
	await done;
	writeFileSync(`${out}.trace.json`, JSON.stringify({ traceEvents: traceChunks }));
}

const allReqs = [...reqs.values()];
writeFileSync(
	`${out}.json`,
	JSON.stringify(
		{
			url,
			cpu: CPU,
			loadMs,
			settledMs,
			nav: JSON.parse(nav),
			metricsAtLoad: mLoad,
			perf: JSON.parse(perfLoad),
			dom: JSON.parse(dom),
			idle,
			experiments,
			scroll,
			requestsAtLoad: reqsAtLoad,
			requestsAll: allReqs
		},
		null,
		1
	)
);
ws.close();
chrome.kill();
await sleep(500);
try {
	rmSync(profile, { recursive: true, force: true });
} catch {}
console.log('ok', out);
process.exit(0);
