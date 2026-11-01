/**
 * The night as one scroll: the single source of truth for section order, clock times, anchor ids, and the base sky
 * color per hour. NightPage builds the sky, the menu, and the progress rail from this list.
 *
 * Changing the sky curve: edit `sky` here (integration, lead only). Section agents never edit this file.
 */
export const NIGHT_HOURS = [
	// dusky warm, the last warmth of the evening
	{ id: 'hero', time: '20:00', sky: '#2d2620' },
	{ id: 'making', time: '21:00', sky: '#221f1d' },
	{ id: 'game', time: '22:00', sky: '#1a1a1b' },
	// deepest anthracite
	{ id: 'night-shift', time: '01:00', sky: '#111213' },
	{ id: 'radio', time: '02:00', sky: '#0e0f10' },
	// warming before dawn
	{ id: 'cinema', time: '04:00', sky: '#2a2723' },
	// butter paper, where the banner begins
	{ id: 'sunrise', time: '06:00', sky: '#fcd772' }
] as const;

export type NightHour = (typeof NIGHT_HOURS)[number];
export type SectionId = NightHour['id'];
export type ClockTime = NightHour['time'];

/** Attribute every section root carries so NightPage can anchor the sky stops to real section positions. */
export const NIGHT_HOUR_ATTR = 'data-night-hour';
