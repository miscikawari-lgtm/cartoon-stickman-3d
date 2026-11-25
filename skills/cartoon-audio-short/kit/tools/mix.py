#!/usr/bin/env python3
"""Level-locked mix: voice stays untouched; music and SFX are set to 50 % of the voice level.

Usage:  python3 mix.py voice.mp3 music.wav sfx.wav [--out mix_raw.wav]

- Level = gated RMS (400 ms blocks, 100 ms hop, absolute gate -55 dBFS, relative gate -10 dB),
  so silence and pauses do not drag the reference down.
- music gain  : music gated RMS = 0.5 x voice gated RMS (-6.0 dB).
- sfx gain    : sfx gated RMS  <= 0.5 x voice gated RMS, AND sfx peak <= 0.7 x voice peak.
- No ducking, no compression. The only dynamics step is a final peak safety (scale, not clip) if the sum would exceed full scale.
- Output length = voice length (voice is never trimmed or re-timed; stems are padded/cut to fit).
Prints the measured levels in dB relative to the voice. Expect music -6.0 dB, sfx <= -6.0 dB.
"""
import sys, subprocess, wave, numpy as np

SR = 48000
args = [a for a in sys.argv[1:] if not a.startswith("--")]
out = "mix_raw.wav"
if "--out" in sys.argv: out = sys.argv[sys.argv.index("--out") + 1]; args = [a for a in args if a != out]
if len(args) != 3: sys.exit(__doc__)
voice_p, music_p, sfx_p = args

def load(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True).stdout
    return np.frombuffer(raw, np.float32).copy()

def fit(x, n):
    y = np.zeros(n, np.float32); y[:min(n, len(x))] = x[:n]; return y

def gated_rms(x, abs_db=-55.0):
    blk, hop = int(0.4 * SR), int(0.1 * SR)
    if len(x) < blk: return float(np.sqrt(np.mean(x ** 2)) + 1e-12)
    cs = np.concatenate([[0.0], np.cumsum(x.astype(np.float64) ** 2)])
    starts = np.arange(0, len(x) - blk + 1, hop)
    p = (cs[starts + blk] - cs[starts]) / blk
    keep = p > 10 ** (abs_db / 10)
    if not keep.any(): return 1e-9
    rel = p[keep].mean() * 10 ** (-10 / 10)
    keep &= p > rel
    return float(np.sqrt(p[keep].mean())) if keep.any() else 1e-9

db = lambda r: 20 * np.log10(max(r, 1e-9))

voice = load(voice_p); n = len(voice)
if n == 0: sys.exit(f"mix.py: could not read voice file {voice_p}")
_m, _s = load(music_p), load(sfx_p)
for name, x in (("music", _m), ("sfx", _s)):
    if len(x) == 0 or not np.abs(x).max() > 0:
        sys.exit(f"mix.py: {name} stem is missing or silent - run audio.py first")
music = fit(_m, n); sfx = fit(_s, n)
v_rms, v_peak = gated_rms(voice), float(np.abs(voice).max())

m_rms = gated_rms(music)
g_music = 0.5 * v_rms / m_rms if m_rms > 1e-8 else 0.0

s_rms = gated_rms(sfx); s_peak = float(np.abs(sfx).max())
g_sfx = 0.5 * v_rms / s_rms if s_rms > 1e-8 else 0.0
if s_peak > 0: g_sfx = min(g_sfx, 0.7 * v_peak / s_peak)

g_sfx *= 0.99                       # 0.09 dB margin so sfx always lands at or below -6.0 dB
music *= g_music; sfx *= g_sfx
mix = voice + music + sfx
peak = float(np.abs(mix).max())
if peak > 0.98: mix *= 0.98 / peak; scale = 0.98 / peak      # one linear scale, relative levels unchanged
else: scale = 1.0

pcm = (np.clip(mix, -1, 1) * 32767).astype(np.int16)
with wave.open(out, "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())

print(f"voice  gated RMS {db(v_rms):7.2f} dBFS   peak {db(v_peak):6.2f} dBFS")
print(f"music  gated RMS {db(gated_rms(music)*scale):7.2f} dBFS   = {db(gated_rms(music)) - db(v_rms):+.2f} dB vs voice (target -6.0)")
print(f"sfx    gated RMS {db(gated_rms(sfx)*scale):7.2f} dBFS   = {db(gated_rms(sfx)) - db(v_rms):+.2f} dB vs voice (target <= -6.0)   peak {db(float(np.abs(sfx).max())) - db(v_peak):+.2f} dB vs voice peak (cap -3.1)")
print(f"wrote {out}  {n / SR:.2f} s")
