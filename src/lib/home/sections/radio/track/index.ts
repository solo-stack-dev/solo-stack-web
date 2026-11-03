/**
 * Station songs: every station plays its own short looping song while it is tuned. A song is a file in this folder
 * named after the station id (`SocialId` in `socials.ts`), e.g. `youtube.m4a`. A station without a file still works,
 * it just plays no music: to give Discord a song later, drop `discord.m4a` here (and its title into `TITLES`).
 *
 * The songs were generated locally with YuE2 (m-a-p/YuE2-3B) from lyrics and titles written by gpt-6.1-sol; prompts,
 * lyrics, styles, seeds and the chosen takes are in docs/art/radio/SONGS.md. AAC 77 to 80 kbps, 33 to 50 s, under
 * 500 kB each, about -16 LUFS, faded at both ends so the loop restarts gently.
 *
 * Only the file URLs are bundled (Vite fingerprints them); the audio itself loads when its station is tuned and the
 * song starts (`preload="none"`).
 */
import type { SocialId } from '#lib/home/data/socials.ts';

export interface Track {
	/** URL of the audio file. */
	src: string;
	/** MIME type for the `<audio>` source. */
	type: string;
	/** Song title (the owner's own data, generated with gpt-6.1-sol), shown while the station is tuned. */
	title: string | null;
}

/** Song titles by station (docs/art/radio/SONGS.md). */
const TITLES: Partial<Record<SocialId, string>> = {
	youtube: 'Small Red Light',
	github: 'A Little Done',
	instagram: 'Both Can Stay',
	tiktok: 'Hold Me Still',
	x: 'Past the Fence',
	bluesky: 'Open Air',
	threads: 'Loose End',
	twitch: 'Half a Cup',
	facebook: 'The Fold'
};

const MIME: Record<string, string> = { m4a: 'audio/mp4', mp3: 'audio/mpeg', opus: 'audio/ogg; codecs=opus', webm: 'audio/webm' };

const files = import.meta.glob<string>('./*.{m4a,mp3,opus,webm}', { query: '?url', import: 'default', eager: true });

const TRACKS = new Map<string, Track>(
	Object.entries(files).map(([path, src]) => {
		const [, id, extension] = /^\.\/(.+)\.(\w+)$/.exec(path)!;
		return [id, { src, type: MIME[extension], title: TITLES[id as SocialId] ?? null }];
	})
);

/** The song of a station, or `null` if it has none (the station then plays no music). */
export const trackFor = (id: SocialId): Track | null => TRACKS.get(id) ?? null;
