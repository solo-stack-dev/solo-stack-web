# Night radio station songs

Every station of the 02:00 radio plays its own short looping song while it is tuned (`src/lib/home/sections/radio/track/<station>.m4a`, titles in `track/index.ts`). This file records how they were made.

## Lyrics and titles (gpt-6.1-sol)

Lyrics and titles are visitor facing text, so they come from OpenAI `gpt-6.1-sol` (AGENTS.md hard rule); the agent wrote only the prompt.

- Prompt: [`songs-prompt.md`](songs-prompt.md) (copy rules from docs/PROJECT.md: no brand or platform names, no invented facts, no hyphens or dashes; per station only a loose theme brief).
- Command: `codex exec -m gpt-6.1-sol --skip-git-repo-check -o docs/art/radio/songs-output.json "$(cat docs/art/radio/songs-prompt.md)"` (2026-11-03, one run, used unchanged).
- Raw output: [`songs-output.json`](songs-output.json).

## Music (YuE2)

Rendered locally with YuE2 (`m-a-p/YuE2-3B` + `YuE2-Vae`, local snapshots in `D:/repos/YuE/models`, yue2-infer 0.1.6, `cot="full"`, RX 7900 XTX via ROCm on Windows) through the yue2-music skill helper:

    python skills/yue2-music/scripts/run_yue2.py generate --request <request.json> --output <take> --model models/YuE2-3B --vae models/YuE2-Vae --offline

- Requests: [`songs-requests.py`](songs-requests.py) builds one request per station and seed from the lyrics above and the style briefs below (the style brief is a model input, not visitor text). Two seeds per station (101, 202): 18 takes, all complete, none truncated.
- First edit (2026-11-03): [`songs-edit.py`](songs-edit.py) (run with the YuE `.venv-tools` Python: numpy, soundfile, pyloudnorm, plus ffmpeg) cut each take to the whole song (first to last sung bar, 33 to 50 s, AAC 77 to 80 kbps, 340 to 490 kB).
- Shipped cut (2026-11-09, owner: files too big, at most 20 s per song): [`src/lib/home/sections/radio/tools/trim-tracks.mjs`](../../../src/lib/home/sections/radio/tools/trim-tracks.mjs) (Node + ffmpeg only) re-encodes from the same lossless takes (`takes/<take>/audio.flac`, 48 kHz), no AAC to AAC generation loss. Window per song: the song's natural ending (end of the chorus, about one bar after the last sung note) and as many whole lyric lines before it as fit into 20 s (the full chorus where it is short enough, else its last three lines), starting on the take's beat grid at least 0.3 s before the first sung note (bar grid from the take's `score.abc`/`abc_check.json`; it lines up with the audio: the verse downbeat is where the level jumps). Fade in 0.3 s and out over the tail after the last note (2 to 2.5 s), quadratic, to silence (first and last 20 ms below -58 dBFS, so the `loop` restart cannot click). Normalized to -16 LUFS on the faded cut (one correction pass when the limiter shaves it), limit -4 dBFS, soxr to 44.1 kHz, AAC-LC 80 kbps (ffmpeg native encoder; kept at the old rate because lower rates with this encoder are not transparent), `.m4a` faststart. Run: `node src/lib/home/sections/radio/tools/trim-tracks.mjs [takes dir] [station …]`; windows live in its `SONGS` table.
- Take choice: by objective checks (nobody listened yet): sung notes per lyric syllable close to 1 (every word sung, no extra melisma), no level dropouts or long silences, least clipping. The other takes, the raw FLACs and a local A/B player of all 18 takes stay in the owner's YuE checkout: `D:/repos/YuE/output/solo-stack-radio/` (`takes/`, `metrics.json`, `comparison/index.html`). To swap a take: pick its window from its score (see the comments in `trim-tracks.mjs`), edit `SONGS` there and rerun it for that station.

## Songs

### youtube: Small Red Light

- Genre: sad rap. Style brief: `English, sad rap, melancholic, intimate, deep male rap vocal, soft felt piano loop, muted 808 bass, sparse trap hi-hats, vinyl crackle, late night, slow tempo, 78 BPM`
- Chosen take: seed 202 (73 BPM as planned by YuE2), 32.88 to 52.88 s (bar 20: verse line 4 and the full chorus), **20.0 s, 208 kB** (first edit: 13.15 to 53.0 s, 39.8 s, 411 kB)

  [Verse]
  Small red light above your eye
  I take a breath and lose my place
  The window holds a slice of sky
  I wish the dark could show a face

  [Chorus]
  Is someone still awake out there
  With tired eyes and things to say
  I leave a little empty air
  In case your voice can find its way

### github: A Little Done

- Genre: lo-fi. Style brief: `English, lo-fi hip hop, chill, soft sung male vocal, warm Rhodes electric piano, dusty boom bap drums, mellow round bass, vinyl crackle, relaxed, 82 BPM`
- Chosen take: seed 101 (85 BPM as planned by YuE2), 39.53 to 56.65 s (bar 14: chorus lines 2 to 4), **17.1 s, 176 kB** (first edit: 11.29 to 56.65 s, 45.4 s, 467 kB)

  [Verse]
  I put the last small piece away
  A patch of green beside the date
  The branches bend, then meet again
  It's getting late, but this can wait

  [Chorus]
  A little done is still enough
  I set it down and loosen up
  There is no need to get it right
  I'll pick it up with morning light

### instagram: Both Can Stay

- Genre: lo-fi. Style brief: `English, lo-fi bedroom pop, dreamy, breathy sung female vocal, washed out chorus guitar chords, tape saturation, gentle drums, warm bass, hazy, 80 BPM`
- Chosen take: seed 202 (83 BPM as planned by YuE2), 54.94 to 72.65 s (bar 19: chorus lines 2 to 4), **17.7 s, 182 kB** (first edit: 23.13 to 72.65 s, 49.5 s, 490 kB)

  [Verse]
  The picture keeps a golden glow
  My room is blue behind the glass
  I turn the lamp down soft and low
  And let the brighter colors last

  [Chorus]
  The pretty part can still be true
  The quiet part can stay here too
  I don't have to hide the night
  To keep a little piece of light

### tiktok: Hold Me Still

- Genre: sad rap. Style brief: `English, sad rap, emo trap, melancholic female rap vocal, plucked acoustic guitar loop, punchy 808 bass, rolling hi-hats, 92 BPM`
- Chosen take: seed 202 (93 BPM as planned by YuE2), 44.52 to 62.26 s (beat 2 of bar 17: chorus lines 2 to 4), **17.7 s, 182 kB** (first edit: 18.06 to 62.26 s, 44.2 s, 454 kB)

  [Verse]
  My thumb moves faster than my eyes
  The clock says two, I blink again
  The ceiling hears my little sighs
  I swear I'm done, but here I am

  [Chorus]
  Can one small moment hold me still
  And leave a little warmth behind
  I keep on saying that it will
  Then let it slip right through my mind

### x: Past the Fence

- Genre: sad rap. Style brief: `English, dark sad rap, minimal, raspy male rap vocal, cold ambient synth pad, deep sub bass, slow sparse drums, echoing reverb, moody, 74 BPM`
- Chosen take: seed 202 (73 BPM as planned by YuE2), 34.52 to 54.52 s (bar 21: verse line 4 and the full chorus), **20.0 s, 206 kB** (first edit: 23.01 to 55.89 s, 32.9 s, 338 kB)

  [Verse]
  I throw a few words past the fence
  They drop where I can never see
  The dark is deep, the air is tense
  I wonder what comes back to me

  [Chorus]
  An echo or a passing car
  I turn my head toward the sound
  I can't tell if you're near or far
  I keep my feet here on the ground

### bluesky: Open Air

- Genre: lo-fi. Style brief: `English, lo-fi chillhop, light and open, airy sung female vocal, soft kalimba melody, mellow jazzy chords, brushed drums, warm bass, gentle, 84 BPM`
- Chosen take: seed 202 (84 BPM as planned by YuE2), 40.00 to 57.68 s (bar 14: chorus lines 2 to 4), **17.7 s, 182 kB** (first edit: 8.57 to 57.68 s, 49.1 s, 491 kB)

  [Verse]
  I set my old coat by the door
  The sky is clear enough to breathe
  A butterfly rests on the floor
  I open up and let it leave

  [Chorus]
  There's room to start with something small
  There's room to change the way I go
  I don't need answers to it all
  Just open air and room to grow

### threads: Loose End

- Genre: sad rap. Style brief: `English, melodic sad rap, male rap verse, soft sung chorus, fingerpicked acoustic guitar loop, mellow piano, soft trap drums, vinyl crackle, 80 BPM`
- Chosen take: seed 101 (83 BPM as planned by YuE2), 28.92 to 48.92 s (bar 20: verse line 4 and the full chorus), **20.0 s, 206 kB** (first edit: 8.67 to 49.16 s, 40.5 s, 416 kB)

  [Verse]
  Your sleeve has caught against the chair
  I find a loose end in my hand
  I pull, then stop and leave it there
  Some things are hard to understand

  [Chorus]
  You don't have to finish that thought
  I'm here with all the words you dropped
  We leave the little knot untied
  And sit a while on either side

### twitch: Half a Cup

- Genre: lo-fi. Style brief: `English, lo-fi jazz hop, cozy, warm mellow sung male vocal, muted trumpet, upright bass, jazzy piano chords, swung boom bap drums, 86 BPM`
- Chosen take: seed 202 (84 BPM as planned by YuE2), 38.21 to 58.21 s (half a beat before chorus line 2: chorus lines 2 to 4), **20.0 s, 205 kB** (first edit: 8.57 to 58.21 s, 49.6 s, 491 kB)

  [Verse]
  The cup is warm against my knee
  A little glow across the keys
  A quiet laugh comes through to me
  I let my shoulders fall with ease

  [Chorus]
  Pull up a chair and take your time
  There's something warm left in the pot
  You tell me yours, I'll tell you mine
  I thought I was alone, I'm not

### facebook: The Fold

- Genre: sad rap. Style brief: `English, nostalgic sad rap, bittersweet, warm male rap vocal, dusty soul piano and strings, boom bap drums, vinyl crackle, 82 BPM`
- Chosen take: seed 101 (85 BPM as planned by YuE2), 45.18 to 65.12 s (bar 16: the full chorus), **19.9 s, 206 kB** (first edit: 22.59 to 65.12 s, 42.5 s, 441 kB)

  [Verse]
  The picture's creased along the fold
  We're standing by your mother's gate
  Your birthday's circled on the page
  I hope my call won't come too late

  [Chorus]
  I still remember how you grin
  Your face all warm with candlelight
  I wonder how your days have been
  I might just call and say goodnight

### discord: Spare Chair

- Instrumental (no lyrics), added 2026-11-12 (owner: the Discord station had no song). Source: `D:/repos/Solo Stack/videos/soundtracks/05 Code Flow Zwei.wav` from the owner's lofi background set (YuE2, `D:/repos/YuE/output/solo-stack-lofi-bg/b5-code-flow/seed-8501`, 85 BPM, 48 kHz WAV), style brief: `Instrumental, downtempo lo-fi electronic, 84 BPM, soft analog synth pads, gentle plucked synth arpeggio, mellow filtered chords, dusty soft drums, deep warm bass, tape saturation, calm, focused, no vocals`
- Cut: 70.59 to 90.35 s (bars 25 to 31 of the louder second half, ending on its last phrase), **19.8 s, 204 kB**, same encode as the others (`trim-tracks.mjs`, `source` entry)
- Title from `gpt-6.1-sol`: prompt [`discord-title-prompt.md`](discord-title-prompt.md), output [`discord-title-output.json`](discord-title-output.json) (2026-11-12, one run, used unchanged; `codex exec` needs stdin closed, `< /dev/null`, or it waits forever)
