/* oxlint-disable no-console -- CLI tool that reports what it wrote */
// Cuts the station songs in ../track/ from the lossless YuE2 takes (docs/art/radio/SONGS.md) to a loop of at most 20 s.
//
// - Window per song (source seconds, below): the song's natural ending (end of the chorus, about one bar after the last
//   sung note) and as many whole lyric lines before it as fit into 20 s: the full chorus where it is short enough, else
//   its last three lines. The start sits on the take's beat grid (from its score, BPM in
//   the comments) at least 0.3 s before the first sung note, so the fade-in never touches the voice.
// - Fade in 0.3 s, fade out over the tail after the last note (≤ 2.5 s), both quadratic and to silence: the loop
//   restarts from zero without a click.
// - Normalized to -16 LUFS integrated (measured on the faded cut), peaks limited at -4 dBFS (keeps the AAC true peak
//   under 0), resampled to 44.1 kHz, AAC-LC 80 kbps stereo .m4a with faststart (plays everywhere, Safari included).
//
// Run: node src/lib/home/sections/radio/tools/trim-tracks.mjs [takes dir] [station …]
// The takes dir defaults to the owner's YuE checkout (D:/repos/YuE/output/solo-stack-radio/takes); needs ffmpeg on PATH.
import { spawnSync } from 'node:child_process';
import { statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const TAKES = process.argv[2] ?? 'D:/repos/YuE/output/solo-stack-radio/takes';
const ONLY = process.argv.slice(3);
const out = (station) => fileURLToPath(new URL(`../track/${station}.m4a`, import.meta.url));

const MAX_SECONDS = 20;
const LUFS = -16;
const FADE_IN = 0.3;
const BITRATE = '80k';

/** station → take folder (or a `source` file), cut in source seconds, fade-out length (the tail after the last sung note, ≤ 2.5 s). */
const SONGS = {
	// 73 BPM, 2/4: bar 20 (verse line 4 "I wish the dark…") to 2.3 s after the last note (50.55 s); full chorus
	youtube: { take: 'youtube-202', start: 32.877, end: 52.877, fadeOut: 2.3 },
	// 85 BPM: bar 14 (chorus line 2 "I set it down…") to one bar after the last note (53.82 s)
	github: { take: 'github-101', start: 39.529, end: 56.647, fadeOut: 2.5 },
	// 83 BPM: bar 19 (chorus line 2 "The quiet part…") to one bar after the last note (69.76 s)
	instagram: { take: 'instagram-202', start: 54.94, end: 72.651, fadeOut: 2.5 },
	// 93 BPM: beat 2 of bar 17, after chorus line 1 ends (chorus line 2 "And leave a little…", 44.84 s) to one bar after the last note (59.68 s)
	tiktok: { take: 'tiktok-202', start: 44.516, end: 62.258, fadeOut: 2.5 },
	// 73 BPM, 2/4: bar 21 (verse line 4 "I wonder what…") to 1.9 s after the last note (52.60 s); full chorus
	x: { take: 'x-202', start: 34.521, end: 54.521, fadeOut: 1.9 },
	// 84 BPM: bar 14 (chorus line 2 "There's room to change…") to one bar after the last note (54.82 s)
	bluesky: { take: 'bluesky-202', start: 40, end: 57.679, fadeOut: 2.5 },
	// 83 BPM, 2/4: bar 20 (verse line 4 "Some things are hard…") to 2.6 s after the last note (46.27 s); full chorus
	threads: { take: 'threads-101', start: 28.916, end: 48.916, fadeOut: 2.5 },
	// 84 BPM: half a beat before chorus line 2 ("There's something warm…", 38.57 s) to one bar after the last note (55.36 s)
	twitch: { take: 'twitch-202', start: 38.214, end: 58.214, fadeOut: 2.5 },
	// 85 BPM: bar 16 (chorus "I still remember…") to one bar after the last note (62.29 s); full chorus
	facebook: { take: 'facebook-101', start: 45.176, end: 65.118, fadeOut: 2.5 },
	// Instrumental (no lyrics), from the owner's lofi set (Solo Stack/videos/soundtracks, YuE2 b5-code-flow seed 8501, 48 kHz
	// WAV). 85 BPM, bars of 2.8235 s from 0: bars 25–31 (70.59 s), the louder second half, ending on its last phrase (90.35 s)
	discord: { source: 'D:/repos/Solo Stack/videos/soundtracks/05 Code Flow Zwei.wav', start: 70.588, end: 90.353, fadeOut: 2.5 }
};

/** Runs ffmpeg and returns its log (stderr: filter reports). */
function ffmpeg(args) {
	const run = spawnSync('ffmpeg', ['-hide_banner', '-nostats', ...args], { encoding: 'utf8' });
	if (run.status !== 0) throw new Error(run.stderr || String(run.error));
	return run.stderr;
}

/** ebur128 summary for a file, optionally after some filters: integrated loudness (LUFS) and true peak (dBFS). */
function measure(input, filters = []) {
	const log = ffmpeg(['-i', input, '-af', [...filters, 'ebur128=peak=true'].join(','), '-f', 'null', '-']);
	const summary = log.slice(log.lastIndexOf('Summary:'));
	return { lufs: Number(/I:\s+(-?[\d.]+) LUFS/.exec(summary)[1]), peak: Number(/Peak:\s+(-?[\d.]+) dBFS/.exec(summary)[1]) };
}

for (const [station, { take, source: file, start, end, fadeOut }] of Object.entries(SONGS)) {
	if (ONLY.length && !ONLY.includes(station)) continue;
	const source = file ?? `${TAKES}/${take}/audio.flac`;
	const length = end - start;
	if (length > MAX_SECONDS + 0.001) throw new Error(`${station}: ${length.toFixed(2)} s is over ${MAX_SECONDS} s`);
	const cut = [
		`atrim=start=${start}:end=${end}`,
		'asetpts=PTS-STARTPTS',
		`afade=t=in:d=${FADE_IN}:curve=qua`,
		`afade=t=out:st=${(length - fadeOut).toFixed(3)}:d=${fadeOut}:curve=qua`
	];
	const target = out(station);
	const encode = (gain) =>
		ffmpeg([
			'-loglevel',
			'error',
			'-y',
			'-i',
			source,
			'-af',
			[...cut, `volume=${gain.toFixed(2)}dB`, 'alimiter=limit=0.63:attack=5:release=60:level=false', 'aresample=44100:resampler=soxr:precision=28'].join(','),
			'-c:a',
			'aac',
			'-b:a',
			BITRATE,
			'-movflags',
			'+faststart',
			'-map_metadata',
			'-1',
			target
		]);
	// The limiter shaves a little loudness off dense songs: measure the encode and correct once if it is off by > 0.2 LU
	let gain = LUFS - measure(source, cut).lufs;
	encode(gain);
	let check = measure(target);
	if (Math.abs(check.lufs - LUFS) > 0.2) {
		gain += LUFS - check.lufs;
		encode(gain);
		check = measure(target);
	}
	console.log(
		`${station}: ${take ?? file} ${start}–${end} s → ${length.toFixed(2)} s, ${(statSync(target).size / 1000).toFixed(0)} kB, ${check.lufs} LUFS, true peak ${check.peak} dBFS (gain ${gain.toFixed(1)} dB)`
	);
}
