/**
 * Station songs (looping while tuned): files named after the station id (`SocialId`), e.g. `youtube.m4a`. No file = no
 * music; to add Discord, drop `discord.m4a` here and its title into `TITLES`.
 *
 * Generated locally with YuE2 (m-a-p/YuE2-3B) from gpt-6.1-sol lyrics/titles; prompts, seeds and takes in
 * docs/art/radio/SONGS.md. AAC 77–80 kbps, 33–50 s, < 500 kB, ≈ -16 LUFS, faded at both ends for a gentle loop.
 *
 * Only the fingerprinted URLs are bundled; audio loads when tuned (`preload="none"`).
 */
import type { SocialId } from '#lib/home/data/socials.ts';

export interface Track {
	/** URL of the audio file. */
	src: string;
	/** Song title (generated with gpt-6.1-sol), shown while tuned. */
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

const files = import.meta.glob<string>('./*.{m4a,mp3,opus,webm}', { query: '?url', import: 'default', eager: true });

const TRACKS = new Map<string, Track>(
	Object.entries(files).map(([path, src]) => {
		const [, id] = /^\.\/(.+)\.\w+$/.exec(path)!;
		return [id, { src, title: TITLES[id as SocialId] ?? null }];
	})
);

/** A station's song, or `null` (no music). */
export const trackFor = (id: SocialId): Track | null => TRACKS.get(id) ?? null;
