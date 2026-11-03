"""Builds YuE2 requests for the solo-stack.dev night radio station songs.
Lyrics/titles come from gpt-6.1-sol (solo-stack-web docs/art/radio/songs-output.json); styles are the model brief."""
import json, sys
from pathlib import Path

songs = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))["songs"]
STYLES = {
    "youtube": "English, sad rap, melancholic, intimate, deep male rap vocal, soft felt piano loop, muted 808 bass, sparse trap hi-hats, vinyl crackle, late night, slow tempo, 78 BPM",
    "github": "English, lo-fi hip hop, chill, soft sung male vocal, warm Rhodes electric piano, dusty boom bap drums, mellow round bass, vinyl crackle, relaxed, 82 BPM",
    "instagram": "English, lo-fi bedroom pop, dreamy, breathy sung female vocal, washed out chorus guitar chords, tape saturation, gentle drums, warm bass, hazy, 80 BPM",
    "tiktok": "English, sad rap, emo trap, melancholic female rap vocal, plucked acoustic guitar loop, punchy 808 bass, rolling hi-hats, 92 BPM",
    "x": "English, dark sad rap, minimal, raspy male rap vocal, cold ambient synth pad, deep sub bass, slow sparse drums, echoing reverb, moody, 74 BPM",
    "bluesky": "English, lo-fi chillhop, light and open, airy sung female vocal, soft kalimba melody, mellow jazzy chords, brushed drums, warm bass, gentle, 84 BPM",
    "threads": "English, melodic sad rap, male rap verse, soft sung chorus, fingerpicked acoustic guitar loop, mellow piano, soft trap drums, vinyl crackle, 80 BPM",
    "twitch": "English, lo-fi jazz hop, cozy, warm mellow sung male vocal, muted trumpet, upright bass, jazzy piano chords, swung boom bap drums, 86 BPM",
    "facebook": "English, nostalgic sad rap, bittersweet, warm male rap vocal, dusty soul piano and strings, boom bap drums, vinyl crackle, 82 BPM",
}
seeds = [int(s) for s in sys.argv[2].split(",")]
for station, style in STYLES.items():
    for seed in seeds:
        req = {"id": f"{station}-{seed}", "style": style, "lyrics": songs[station]["lyrics"], "cot": "full", "seed": seed}
        Path(f"requests/{station}-{seed}.json").parent.mkdir(exist_ok=True)
        Path(f"requests/{station}-{seed}.json").write_text(json.dumps(req, indent=2, ensure_ascii=False), encoding="utf-8")
print("ok")
