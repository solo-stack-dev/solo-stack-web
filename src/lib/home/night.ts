/**
 * Single source of truth for section order, clock times, anchor ids, and sky color per hour. NightPage builds the sky,
 * menu, and rail from it.
 *
 * Sky curve: each hour's `sky` is reached when its section's center meets the viewport center, blended linearly from
 * the previous hour. Optional:
 * - `horizon`: vertical gradient `sky` → `horizon` (viewport bottom), e.g. a warming dawn line.
 * - `from: 'enter'`: blend starts when the section's top enters the viewport, not at the previous stop. Sunrise uses it
 *   so butter paper arrives with the sunrise section, not during 04:00.
 *
 * Integration lead only; section agents never edit this file.
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
	// butter paper, where the banner begins
	{ id: 'sunrise', time: '06:00', sky: '#fcd772', from: 'enter' }
] as const satisfies readonly NightHourDef[];

export type NightHour = (typeof NIGHT_HOURS)[number];
export type SectionId = NightHour['id'];
export type ClockTime = NightHour['time'];

/** On every section root; NightPage anchors the sky stops to these elements. */
export const NIGHT_HOUR_ATTR = 'data-night-hour';

/** CSS background of one hour's sky layer. */
export function skyBackground(hour: NightHourDef): string {
	return hour.horizon ? `linear-gradient(to bottom, ${hour.sky} 38%, ${hour.horizon})` : hour.sky;
}
