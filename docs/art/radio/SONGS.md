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
- Edit and encode: [`songs-edit.py`](songs-edit.py) (run with the YuE `.venv-tools` Python: numpy, soundfile, pyloudnorm, plus ffmpeg). Cut from the bar of the first sung note (one bar earlier if the voice enters on the downbeat) to one bar after the last one, normalize to -16 LUFS, limit at -4 dBFS, fade in 0.4 s and out 2.5 s (the loop restarts gently), AAC 77 to 80 kbps at 44.1 kHz.
- Take choice: by objective checks (nobody listened yet): sung notes per lyric syllable close to 1 (every word sung, no extra melisma), no level dropouts or long silences, least clipping. The other takes, the raw FLACs and a local A/B player of all 18 takes stay in the owner's YuE checkout: `D:/repos/YuE/output/solo-stack-radio/` (`takes/`, `metrics.json`, `comparison/index.html`). To swap a take: `python songs-edit.py encode <station>-<seed> src/lib/home/sections/radio/track/<station>.m4a`.

## Songs

### youtube: Small Red Light

- Genre: sad rap. Style brief: `English, sad rap, melancholic, intimate, deep male rap vocal, soft felt piano loop, muted 808 bass, sparse trap hi-hats, vinyl crackle, late night, slow tempo, 78 BPM`
- Chosen take: seed 202 (73 BPM as planned by YuE2), cut 13.15 to 53.0 s of 53.0 s, **39.8 s, 411 kB**

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
- Chosen take: seed 101 (85 BPM as planned by YuE2), cut 11.29 to 56.65 s of 56.7 s, **45.4 s, 467 kB**

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
- Chosen take: seed 202 (83 BPM as planned by YuE2), cut 23.13 to 72.65 s of 76.2 s, **49.5 s, 490 kB**

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
- Chosen take: seed 202 (93 BPM as planned by YuE2), cut 18.06 to 62.26 s of 63.7 s, **44.2 s, 454 kB**

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
- Chosen take: seed 202 (73 BPM as planned by YuE2), cut 23.01 to 55.89 s of 76.6 s, **32.9 s, 338 kB**

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
- Chosen take: seed 202 (84 BPM as planned by YuE2), cut 8.57 to 57.68 s of 69.3 s, **49.1 s, 491 kB**

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
- Chosen take: seed 101 (83 BPM as planned by YuE2), cut 8.67 to 49.16 s of 71.1 s, **40.5 s, 416 kB**

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
- Chosen take: seed 202 (84 BPM as planned by YuE2), cut 8.57 to 58.21 s of 68.6 s, **49.6 s, 491 kB**

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
- Chosen take: seed 101 (85 BPM as planned by YuE2), cut 22.59 to 65.12 s of 69.2 s, **42.5 s, 441 kB**

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
