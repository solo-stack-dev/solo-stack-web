/** Evenly spaced date ticks for a daily axis: about one label per `spacing` px, always including the last day. */
export function dayTicks(dates: readonly Date[], width: number | undefined, spacing = 90): Date[] {
	const count = Math.max(2, Math.min(dates.length, Math.floor((width || 600) / spacing)));
	const step = Math.max(1, Math.ceil((dates.length - 1) / (count - 1)));
	return dates.filter((_, index) => (dates.length - 1 - index) % step === 0);
}
