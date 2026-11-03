"""Edit + encode the radio station songs.

For each take: start at the bar of the first vocal note (one bar earlier if it enters on the downbeat), end one bar after the last, normalize to
-16 LUFS, limit peaks at -4 dBFS (ffmpeg alimiter, keeps the AAC true peak under 0), fade in 0.4 s and out 2.5 s so the loop restarts
gently, encode AAC <= 80 kbps 44.1 kHz stereo (.m4a, faststart). Also prints metrics used to pick the best take.

Usage: python edit.py metrics            -> metrics.json for all takes
       python edit.py encode <take> <out.m4a>
"""
import json, re, subprocess, sys
from fractions import Fraction
from pathlib import Path

import numpy as np
import pyloudnorm as pyln
import soundfile as sf

HERE = Path(__file__).parent
TAKES = HERE / "takes"
LUFS = -16.0


def score_info(take: Path):
    check = json.loads((take / "abc_check.json").read_text(encoding="utf-8"))["score"]
    bpm = float(check["bpm"])
    notes = check["voices"]["Vocal"]["notes"]
    first = float(Fraction(notes[0]["onset_quarters"]))
    last = max(float(Fraction(n["onset_quarters"]) + Fraction(n["duration_quarters"])) for n in notes)
    return bpm, first, last, len(notes)


def syllables(text: str) -> int:
    words = re.findall(r"[a-zA-Z']+", text)
    count = 0
    for w in words:
        w = w.lower().rstrip("e") or w
        count += max(1, len(re.findall(r"[aeiouy]+", w)))
    return count


def cut_points(take: Path, length: float):
    bpm, first, last, _ = score_info(take)
    bar = 240.0 / bpm
    # The bar of the first vocal note, or the bar before it if the voice enters on (or near) the downbeat
    start_bar = max(0, int(first // 4) - (0 if first % 4 >= 1 else 1))
    start = start_bar * bar
    end = min(length, last * 60.0 / bpm + bar)
    return start, end, bar


def metrics(take: Path):
    audio, rate = sf.read(take / "audio.flac", always_2d=True)
    length = len(audio) / rate
    start, end, bar = cut_points(take, length)
    seg = audio[int(start * rate) : int(end * rate)]
    mono = seg.mean(axis=1)
    win = int(rate * 0.05)
    frames = len(mono) // win
    rms_db = 20 * np.log10(np.sqrt(np.mean(mono[: frames * win].reshape(frames, win) ** 2, axis=1)) + 1e-12)
    silent = rms_db < -45
    longest = run = 0
    for s in silent:
        run = run + 1 if s else 0
        longest = max(longest, run)
    # Dropouts: 2 s blocks more than 10 dB under the median block
    block = int(rate * 2)
    blocks = np.array([20 * np.log10(np.sqrt(np.mean(mono[i : i + block] ** 2)) + 1e-12) for i in range(0, len(mono) - block, block)])
    request = json.loads((take / "request.json").read_text(encoding="utf-8"))
    bpm, first, last, vocal_notes = score_info(take)
    result = json.loads((take / "result.json").read_text(encoding="utf-8"))
    syl = syllables(re.sub(r"\[.*?\]", "", request["lyrics"]))
    return {
        "take": take.name,
        "bpm": bpm,
        "raw_seconds": round(length, 1),
        "cut": [round(start, 2), round(end, 2)],
        "seconds": round(end - start, 1),
        "truncated": result.get("truncated"),
        "vocal_notes": vocal_notes,
        "lyric_syllables": syl,
        "notes_per_syllable": round(vocal_notes / syl, 2),
        "peak_dbfs": round(float(20 * np.log10(np.max(np.abs(seg)) + 1e-12)), 2),
        "clipped": int(np.sum(np.abs(seg) >= 0.999)),
        "lufs": round(pyln.Meter(rate).integrated_loudness(seg), 1),
        "longest_silence_s": round(longest * 0.05, 2),
        "dropout_blocks": int(np.sum(blocks < np.median(blocks) - 10)),
    }


def encode(take: Path, out: Path):
    audio, rate = sf.read(take / "audio.flac", always_2d=True)
    start, end, _ = cut_points(take, len(audio) / rate)
    seg = audio[int(start * rate) : int(end * rate)].copy()
    gain = 10 ** ((LUFS - pyln.Meter(rate).integrated_loudness(seg)) / 20)
    seg *= gain
    n = len(seg)
    fade_in = int(0.4 * rate)
    fade_out = int(2.5 * rate)
    seg[:fade_in] *= np.linspace(0, 1, fade_in)[:, None] ** 2
    seg[n - fade_out :] *= np.linspace(1, 0, fade_out)[:, None] ** 2
    wav = out.with_suffix(".wav")
    sf.write(wav, seg, rate, subtype="FLOAT")
    # 80 kbps, lower for the longer songs so every file stays under ~480 kB
    kbps = min(80, int(480 * 8 / (n / rate)))
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav), "-af", "alimiter=limit=0.63:attack=5:release=60:level=false", "-ar", "44100", "-c:a", "aac", "-b:a", f"{kbps}k", "-movflags", "+faststart", "-map_metadata", "-1", str(out)], check=True)
    wav.unlink()
    print(json.dumps({"take": take.name, "out": str(out), "seconds": round(n / rate, 2), "bytes": out.stat().st_size, "gain_db": round(20 * np.log10(gain), 1), "kbps": kbps}))


if __name__ == "__main__":
    if sys.argv[1] == "metrics":
        rows = [metrics(t) for t in sorted(TAKES.iterdir()) if (t / "audio.flac").exists()]
        (HERE / "metrics.json").write_text(json.dumps(rows, indent=1), encoding="utf-8")
        for r in rows:
            print(json.dumps(r))
    else:
        encode(TAKES / sys.argv[2], Path(sys.argv[3]))
