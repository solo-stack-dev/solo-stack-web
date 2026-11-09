// Usage: node payload.mjs <outdir> <html...>
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
const [out, ...pages] = process.argv.slice(2);
const br = (b) => zlib.brotliCompressSync(b, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 11 } }).length;
const gz = (b) => zlib.gzipSync(b, { level: 9 }).length;
const kb = (n) => (n / 1024).toFixed(1);
for (const p of pages) {
	const html = fs.readFileSync(path.join(out, p), 'utf8');
	const dir = path.dirname(path.join(out, p));
	const res = (href) => (href.startsWith('/') ? path.join(out, href) : path.resolve(dir, href));
	const js = [...html.matchAll(/<link href="([^"]+\.js)" rel="modulepreload">/g)].map((m) => m[1]);
	// also inline import() in body bootstrap
	const css = [...html.matchAll(/<link href="([^"]+\.css)" rel="stylesheet">/g)].map((m) => m[1]);
	let jsRaw = 0,
		jsBr = 0,
		jsGz = 0,
		cssRaw = 0,
		cssBr = 0;
	const jsList = [];
	for (const h of js) {
		const b = fs.readFileSync(res(h));
		jsRaw += b.length;
		const x = br(b);
		jsBr += x;
		jsGz += gz(b);
		jsList.push([path.basename(h), b.length, x]);
	}
	const cssList = [];
	for (const h of css) {
		const b = fs.readFileSync(res(h));
		cssRaw += b.length;
		const x = br(b);
		cssBr += x;
		cssList.push([path.basename(h), b.length, x]);
	}
	const imgs = [...html.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
	const eagerImgs = imgs.filter((t) => !/loading="lazy"/.test(t));
	const hb = Buffer.from(html);
	console.log(
		`\n## ${p}  html raw ${kb(hb.length)}k br ${kb(br(hb))}k | JS ${js.length} files raw ${kb(jsRaw)}k br ${kb(jsBr)}k gz ${kb(jsGz)}k | CSS ${css.length} files raw ${kb(cssRaw)}k br ${kb(cssBr)}k | <img> ${imgs.length} (eager ${eagerImgs.length}) | inline <style> ${(html.match(/<style/g) || []).length} | inline svg ${(html.match(/<svg/g) || []).length}`
	);
	jsList
		.sort((a, b) => b[2] - a[2])
		.slice(0, 12)
		.forEach(([n, r, x]) => console.log(`  js  ${n.padEnd(40)} ${kb(r).padStart(7)}k  br ${kb(x)}k`));
	cssList.sort((a, b) => b[2] - a[2]).forEach(([n, r, x]) => console.log(`  css ${n.padEnd(40)} ${kb(r).padStart(7)}k  br ${kb(x)}k`));
}
