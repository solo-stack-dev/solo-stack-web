/**
 * Single source of truth for section order, anchor ids, and sky color per section. NightPage builds the sky from it.
 * The page still runs from dusk to sunrise, but no clock times are shown anywhere (owner decision, 2026-11-20).
 *
 * Sky curve: each section's `sky` is reached when its center meets the viewport center, blended linearly from
 * the previous one. Optional:
 * - `horizon`: vertical gradient `sky` → `horizon` (viewport bottom), e.g. a warming dawn line.
 * - `from: 'enter'`: blend starts when the section's top enters the viewport, not at the previous stop. Sunrise uses it
 *   so butter paper arrives with the sunrise section, not during the cinema.
 *
 * Integration lead only; section agents never edit this file.
 */
export interface NightHourDef {
	id: string;
	sky: string;
	horizon?: string;
	from?: 'enter';
}

export const NIGHT_HOURS = [
	// dusky warm, the last warmth of the evening
	{ id: 'hero', sky: '#2d2620' },
	{ id: 'making', sky: '#221f1d' },
	// deepest anthracite
	{ id: 'night-shift', sky: '#111213' },
	{ id: 'radio', sky: '#0e0f10' },
	// the night lifts a little again
	{ id: 'game', sky: '#1a1a1b' },
	// still night, the horizon starts to warm before dawn
	{ id: 'cinema', sky: '#2a2723', horizon: '#4a3826' },
	// butter paper, where the banner begins
	{ id: 'sunrise', sky: '#fcd772', from: 'enter' }
] as const satisfies readonly NightHourDef[];

export type NightHour = (typeof NIGHT_HOURS)[number];
export type SectionId = NightHour['id'];

/** On every section root; NightPage anchors the sky stops to these elements. */
export const NIGHT_HOUR_ATTR = 'data-night-hour';

/** CSS background of one section's sky layer. */
export function skyBackground(hour: NightHourDef): string {
	return hour.horizon ? `linear-gradient(to bottom, ${hour.sky} 38%, ${hour.horizon})` : hour.sky;
}
