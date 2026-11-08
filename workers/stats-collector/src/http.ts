/** `fetch` for platform APIs: timeout, JSON, and errors that never contain the URL (API keys and tokens travel in it). */
export class HttpError extends Error {
	readonly status: number;

	constructor(label: string, status: number, body: string) {
		super(`${label}: HTTP ${status} ${body.slice(0, 300)}`);
		this.status = status;
	}
}

/** Identifies the collector to APIs that ask for a User-Agent (GitHub requires one). */
export const USER_AGENT = 'solo-stack-stats-collector (+https://solo-stack.dev)';

export async function fetchJson<T>(label: string, url: string | URL, init: RequestInit = {}): Promise<T> {
	const headers = new Headers(init.headers);
	headers.set('accept', 'application/json');
	headers.set('user-agent', USER_AGENT);
	const response = await fetch(url, { ...init, headers, signal: AbortSignal.timeout(20_000) });
	if (!response.ok) throw new HttpError(label, response.status, await response.text().catch(() => ''));
	return (await response.json()) as T;
}

/** A non-negative integer from an API field (YouTube sends counts as strings), or an error: never store a guessed number. */
export function count(label: string, value: unknown): number {
	const number = typeof value === 'string' && value.trim() !== '' ? Number(value) : value;
	if (typeof number !== 'number' || !Number.isSafeInteger(number) || number < 0) throw new Error(`${label}: not a count (${JSON.stringify(value)})`);
	return number;
}
