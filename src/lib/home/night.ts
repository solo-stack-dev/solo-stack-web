/**
 * The night as one scroll: the single source of truth for section order, clock times, anchor ids, and the base sky
 * color per hour. NightPage builds the sky, the menu, and the progress rail from this list.
 *
 * Sky curve: each hour's `sky` is reached when that section's center meets the viewport center, blended linearly from
 * the previous hour. Optional per hour:
 * - `horizon`: the sky becomes a vertical gradient `sky` → `horizon` (bottom of the viewport), e.g. a warming dawn line.
 * - `from: 'enter'`: the blend into this hour only starts when the section's top enters the viewport (instead of at
 *   the previous hour's stop). The sunrise uses it so butter paper arrives with the sunrise section, not during 04:00.
 *
 * Changing the sky curve: edit it here (integration, lead only). Section agents never edit this file.
 */
export interface NightHourDef {
	id: string;
	time: string;
	sky: string;
	horizon?: string;
	from?: 'enter';
}

export const NIGHT_HOURS = [
	// dusky warm, the last warmth of the evening
	{ id: 'hero', time: '20:00', sky: '#2d2620' },
	{ id: 'making', time: '21:00', sky: '#221f1d' },
	{ id: 'game', time: '22:00', sky: '#1a1a1b' },
	// deepest anthracite
	{ id: 'night-shift', time: '01:00', sky: '#111213' },
	{ id: 'radio', time: '02:00', sky: '#0e0f10' },
	// still night, the horizon starts to warm before dawn
	{ id: 'cinema', time: '04:00', sky: '#2a2723', horizon: '#4a3826' },
	// butter paper, where the banner begins; only once the sunrise section scrolls in
	{ id: 'sunrise', time: '06:00', sky: '#fcd772', from: 'enter' }
] as const satisfies readonly NightHourDef[];

export type NightHour = (typeof NIGHT_HOURS)[number];
export type SectionId = NightHour['id'];
export type ClockTime = NightHour['time'];

/** Attribute every section root carries so NightPage can anchor the sky stops to real section positions. */
export const NIGHT_HOUR_ATTR = 'data-night-hour';

/** CSS background of one hour's sky layer. */
export function skyBackground(hour: NightHourDef): string {
	return hour.horizon ? `linear-gradient(to bottom, ${hour.sky} 38%, ${hour.horizon})` : hour.sky;
}
