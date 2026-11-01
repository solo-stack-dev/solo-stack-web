/** Locale aware number and date formatting for the /stats page (locale from Paraglide, dates in UTC). */
import { getLocale } from '#lib/paraglide/runtime.js';

const cache = new Map<string, Intl.NumberFormat | Intl.DateTimeFormat>();

function numberFormat(options: Intl.NumberFormatOptions): Intl.NumberFormat {
	const key = `n:${getLocale()}:${JSON.stringify(options)}`;
	let format = cache.get(key) as Intl.NumberFormat | undefined;
	if (!format) cache.set(key, (format = new Intl.NumberFormat(getLocale(), options)));
	return format;
}

function dateFormat(options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
	const key = `d:${getLocale()}:${JSON.stringify(options)}`;
	let format = cache.get(key) as Intl.DateTimeFormat | undefined;
	if (!format) cache.set(key, (format = new Intl.DateTimeFormat(getLocale(), { timeZone: 'UTC', ...options })));
	return format;
}

/** 12.418 */
export const formatNumber = (value: number) => numberFormat({}).format(value);
/** 12,4K / 12.418 below 10.000 (axis ticks, tight spots). */
export const formatCompact = (value: number) =>
	Math.abs(value) < 10_000 ? formatNumber(value) : numberFormat({ notation: 'compact', maximumFractionDigits: 1 }).format(value);
/** +1.204 / −12 */
export const formatSigned = (value: number) => numberFormat({ signDisplay: 'exceptZero' }).format(value);
/** +3,2 % */
export const formatPercent = (ratio: number) => numberFormat({ style: 'percent', signDisplay: 'exceptZero', maximumFractionDigits: 1 }).format(ratio);
/** Share without sign: 34 % */
export const formatShare = (ratio: number) => numberFormat({ style: 'percent', maximumFractionDigits: 0 }).format(ratio);
/** Hours with one decimal below 100. */
export const formatHours = (minutes: number) => numberFormat({ maximumFractionDigits: minutes < 6000 ? 1 : 0 }).format(minutes / 60);
/** 4:12 (m:ss) or 1:02:03 */
export function formatDuration(seconds: number): string {
	const h = Math.floor(seconds / 3600);
	const m = Math.floor((seconds % 3600) / 60);
	const s = String(Math.round(seconds % 60)).padStart(2, '0');
	return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`;
}

/** 31. Okt. */
export const formatDay = (date: Date) => dateFormat({ day: 'numeric', month: 'short' }).format(date);
/** 31. Oktober 2026 */
export const formatLongDate = (date: Date) => dateFormat({ day: 'numeric', month: 'long', year: 'numeric' }).format(date);
/** Fr., 31. Okt. */
export const formatWeekday = (date: Date) => dateFormat({ weekday: 'short', day: 'numeric', month: 'short' }).format(date);
/** Okt. (month label of the activity calendar) */
export const formatMonth = (date: Date) => dateFormat({ month: 'short' }).format(date);
/** Mo (weekday label of the activity calendar) */
export const formatWeekdayShort = (date: Date) => dateFormat({ weekday: 'short' }).format(date);
