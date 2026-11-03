/**
 * Stations of the night radio: one per linkable platform in `socials.ts` (same order, YouTube first). Each plays its
 * own short song while tuned (`track/`; a station without a song file plays no music). Positions are spread evenly
 * over the dial (0…1) and get an FM-style frequency label (88.0–108.0), which is decoration, not copy.
 */
import { linkedSocials, type SocialId } from '#lib/home/data/socials.ts';
import { trackFor, type Track } from './track/index.ts';

export type StationId = SocialId;

export interface Station {
	id: StationId;
	/** Platform name (proper name). */
	name: string;
	handle: string | null;
	/** Profile URL. */
	url: string;
	/** The station's song, `null` if it has none. */
	track: Track | null;
	/** Position on the dial, 0…1. */
	position: number;
	/** Frequency label, e.g. `92.4`. */
	frequency: string;
}

/** Margin at both ends of the dial, so the first and last station are not glued to the glass edge. */
const DIAL_MARGIN = 0.06;

const frequencyAt = (position: number) => (88 + position * 20).toFixed(1);

function build(): Station[] {
	const entries: Omit<Station, 'position' | 'frequency'>[] = linkedSocials().map((social) => ({
		id: social.id,
		name: social.name,
		handle: social.handle,
		url: social.url,
		track: trackFor(social.id)
	}));
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
