/**
 * Station songs (looping while tuned): files named after the station id (`SocialId`), e.g. `youtube.m4a`. No file = no
 * music.
 *
 * Generated locally with YuE2 (m-a-p/YuE2-3B) from gpt-6.1-sol lyrics/titles; prompts, seeds and takes in
 * docs/art/radio/SONGS.md (Discord: an instrumental from the owner's lofi set). Cut to the end of the chorus (whole lines, 17–20 s) by `../tools/trim-tracks.mjs`: AAC-LC
 * 80 kbps 44.1 kHz, 175–210 kB, -16 LUFS, faded at both ends (to silence) for a gentle, click-free loop.
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
	facebook: 'The Fold',
	discord: 'Spare Chair'
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
