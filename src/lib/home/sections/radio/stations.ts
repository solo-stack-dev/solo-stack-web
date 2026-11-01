/**
 * Stations of the night radio: one per linkable platform in `socials.ts` (same order, YouTube first), then the music
 * station "Solo Stack FM" at the right end of the dial. Positions are spread evenly over the dial (0…1) and get an
 * FM-style frequency label (88.0–108.0), which is decoration, not copy.
 */
import { linkedSocials, type SocialId } from '#lib/home/data/socials.ts';
import { SOCIAL_ICONS } from './icons.ts';

export type StationId = SocialId | 'fm';

export interface Station {
	id: StationId;
	/** Proper name (platform name or "Solo Stack FM"). */
	name: string;
	handle: string | null;
	/** Profile URL; `null` for the music station. */
	url: string | null;
	/** 24×24 path data. */
	icon: string;
	kind: 'social' | 'music';
	/** Position on the dial, 0…1. */
	position: number;
	/** Frequency label, e.g. `92.4`. */
	frequency: string;
}

/** Original Solo Stack FM mark (crescent moon with a sound wave), 24×24. Not a third-party logo. */
const FM_ICON =
	'M14.5 2.2a10 10 0 1 0 7.3 13.9 8 8 0 0 1-7.3-13.9ZM12 9.2c.6 0 1 .4 1 1v3.6a1 1 0 1 1-2 0v-3.6c0-.6.4-1 1-1Zm3.4-1.6c.6 0 1 .4 1 1v6.8a1 1 0 1 1-2 0V8.6c0-.6.4-1 1-1Zm-6.8 2.8c.6 0 1 .4 1 1v1.2a1 1 0 1 1-2 0v-1.2c0-.6.4-1 1-1Z';

/** Margin at both ends of the dial, so the first and last station are not glued to the glass edge. */
const DIAL_MARGIN = 0.06;

const frequencyAt = (position: number) => (88 + position * 20).toFixed(1);

function build(): Station[] {
	const entries: Omit<Station, 'position' | 'frequency'>[] = [
		...linkedSocials().map((social) => ({
			id: social.id,
			name: social.name,
			handle: social.handle,
			url: social.url,
			icon: SOCIAL_ICONS[social.id],
			kind: 'social' as const
		})),
		{ id: 'fm', name: 'Solo Stack FM', handle: null, url: null, icon: FM_ICON, kind: 'music' }
	];
	const span = 1 - 2 * DIAL_MARGIN;
	return entries.map((entry, index) => {
		const position = DIAL_MARGIN + (entries.length === 1 ? span / 2 : (index / (entries.length - 1)) * span);
		return { ...entry, position, frequency: frequencyAt(position) };
	});
}

export const STATIONS: readonly Station[] = build();

/** Dial resolution: the slider runs 0…DIAL_MAX. */
export const DIAL_MAX = 1000;

/** Idle dial value before anything is tuned: left of the first station, between stations (static). */
export const DIAL_IDLE = 0;

/** Half the distance between two neighbors: inside it the dial "locks" onto a station while dragging. */
const SNAP_WINDOW = STATIONS.length > 1 ? (STATIONS[1].position - STATIONS[0].position) * 0.32 : 0.1;

export const dialValue = (station: Station) => Math.round(station.position * DIAL_MAX);

/** Station under the dial value, or `null` between stations (static). */
export function stationAt(value: number): Station | null {
	const position = value / DIAL_MAX;
	// TODO(egg): hidden station. Check a secret frequency here before the presets, e.g. exactly halfway between two
	// presets (`(STATIONS[3].position + STATIONS[4].position) / 2` ± a very narrow window), and return an egg station.
	// Only reachable with the slider (drag or fine keyboard steps), never with a preset key.
	let best: Station | null = null;
	let bestDistance = Infinity;
	for (const station of STATIONS) {
		const distance = Math.abs(station.position - position);
		if (distance < bestDistance) {
			best = station;
			bestDistance = distance;
		}
	}
	return bestDistance <= SNAP_WINDOW ? best : null;
}

/** Nearest station (always one): where the dial settles when released. */
export function nearestStation(value: number): Station {
	const position = value / DIAL_MAX;
	return STATIONS.reduce((best, station) => (Math.abs(station.position - position) < Math.abs(best.position - position) ? station : best));
}

export const stationById = (id: StationId) => STATIONS.find((station) => station.id === id) ?? null;
