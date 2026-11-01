/**
 * The Solo Stack FM track: "Bis es hell wird", generated locally with YuE2 (m-a-p/YuE2-3B, seed 7531) from lyrics and
 * title written by gpt-6.1-sol (docs/copy/radio-track-prompt.md → docs/copy/radio-track-lyrics.txt). AAC 128 kbps,
 * 2:27, about -14 LUFS, true peak -1 dBTP. The other candidates and the raw FLAC stay in the owner's YuE checkout
 * (`D:/repos/YuE/output/solo-stack/`).
 *
 * To replace the track:
 * 1. Put the file here, e.g. `track/solo-stack-fm.m4a` (AAC) or `.opus`/`.webm` (Opus), ≤ 4 MB, loudness ~-14 LUFS.
 * 2. Import it so Vite fingerprints it: `import file from './solo-stack-fm.m4a?url';` and set `src: file`.
 * 3. Set `title` to the track title (a proper name, the owner's own data) and `type` to its MIME type.
 *
 * While `src` is `null`, the station shows the "coming soon" placeholder and no audio element is rendered.
 * The audio is never preloaded (`preload="none"`) and only starts on a click.
 */
import file from './solo-stack-fm.m4a?url';

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
	src: file,
	type: 'audio/mp4',
	title: 'Bis es hell wird',
	loop: true
};
