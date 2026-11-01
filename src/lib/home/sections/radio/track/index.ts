/**
 * The Solo Stack FM track. The owner generates it with their AI music tool and drops it into this folder.
 *
 * To ship the track:
 * 1. Put the file here, e.g. `track/solo-stack-fm.m4a` (AAC) or `.opus`/`.webm` (Opus), ≤ 4 MB, loudness ~-16 LUFS.
 * 2. Import it so Vite fingerprints it: `import file from './solo-stack-fm.m4a?url';` and set `src: file`.
 * 3. Set `title` to the track title (a proper name, the owner's own data) and `type` to its MIME type.
 *
 * While `src` is `null`, the station shows the "coming soon" placeholder and no audio element is rendered.
 * The audio is never preloaded (`preload="none"`) and only starts on a click.
 */
export interface Track {
	/** URL of the audio file, or `null` until the owner supplies it. */
	src: string | null;
	/** MIME type for the `<source>`, e.g. `audio/mp4` (AAC) or `audio/ogg; codecs=opus`. */
	type: string;
	/** Track title (proper name), shown on the display strip while the station is tuned. */
	title: string | null;
	/** Loop the track (a radio never stops). */
	loop: boolean;
}

export const TRACK: Track = {
	src: null,
	type: 'audio/mp4',
	title: null,
	loop: true
};
