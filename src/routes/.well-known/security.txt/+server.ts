import { baseLocale, localizeHref } from '#lib/paraglide/runtime.js';
import type { RequestHandler } from './$types';

/*
 * /.well-known/security.txt (RFC 9116): where to report a vulnerability. Contact is the business inbox (the same address
 * the contact form delivers to, src/lib/contact/deliver.server.ts) and the contact page.
 * `Expires` is required and should be under a year away: it is set at build time, so every deploy renews it. A site that
 * goes a year without a deploy ends up with an expired file, which is the intended signal.
 * Not the dashboard's security.txt feature (Security settings): keep that off so this file is the only one.
 */

export const prerender = true;

const VALID_DAYS = 360;

export const GET: RequestHandler = ({ url }) => {
	const expires = new Date(Date.now() + VALID_DAYS * 86_400_000).toISOString().replace(/\.\d{3}Z$/, 'Z');
	const body = [
		'Contact: mailto:business@solo-stack.dev',
		`Contact: ${url.origin}${localizeHref('/kontakt', { locale: baseLocale })}`,
		`Expires: ${expires}`,
		'Preferred-Languages: de, en',
		`Canonical: ${url.origin}/.well-known/security.txt`
	].join('\n');
	return new Response(`${body}\n`, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
};
