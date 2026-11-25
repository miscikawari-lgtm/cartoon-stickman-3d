"""Synthesized music bed + SFX stems for the soldier short.
Writes music.wav and sfx.wav ONLY (mono, 48 kHz, full length). Levels vs the voice are set by mix.py."""
import numpy as np, subprocess, wave

SR = 48000
def _voice_dur(path="voice.mp3"):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path], capture_output=True, text=True).stdout
    return float(out)
FRAMES = round(_voice_dur() * 30)   # picture is exactly as long as the voice
DUR = FRAMES / 30
N = int(DUR * SR)
rng = np.random.default_rng(7)
t_all = np.arange(N) / SR

def load_voice():
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", "voice.mp3", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
    v = np.frombuffer(raw, np.float32).copy()
    out = np.zeros(N, np.float32); out[:min(N, len(v))] = v[:N]; return out

def env(n, a=0.005, r=0.2, sus=None):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / r)
    return e

def lp(x, k):  # one-pole low-pass, k in (0,1)
    y = np.empty_like(x); acc = 0.0
    for i in range(len(x)): acc += k * (x[i] - acc); y[i] = acc
    return y

def lp_fast(x, cutoff):
    # FFT brick-ish low-pass (fast, fine for beds)
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / (1 + (f / cutoff) ** 4); return np.fft.irfft(X, len(x)).astype(np.float32)

def hp_fast(x, cutoff):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 - 1 / (1 + (f / cutoff) ** 4); return np.fft.irfft(X, len(x)).astype(np.float32)

def place(buf, sig, t0, gain=1.0):
    i = int(t0 * SR); j = min(N, i + len(sig))
    if i < N and j > i: buf[i:j] += sig[: j - i] * gain

midi = lambda m: 440 * 2 ** ((m - 69) / 12)

def brass(fs, dur):
    n = int(dur * SR); t = np.arange(n) / SR; s = np.zeros(n)
    for f in fs:
        ph = 2 * np.pi * f * t + 0.003 * np.sin(2 * np.pi * 5 * t)
        s += sum(np.sin((k + 1) * ph) / (k + 1) ** 1.3 for k in range(8))
    a = np.minimum(1, t / 0.08) * np.minimum(1, (dur - t) / 0.15).clip(0)
    return lp_fast((s * a).astype(np.float32), 1800) / len(fs)

# ---------------- sfx ----------------
sfx = np.zeros(N, np.float32)
def noise(d): return rng.standard_normal(int(d * SR)).astype(np.float32)
def thunk(f0=90, d=0.3):
    n = int(d * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * f0 * t * (1 + 0.6 * np.exp(-t * 40))) * np.exp(-t * 14) + lp_fast(noise(d), 1200) * np.exp(-t * 30) * 0.5).astype(np.float32)
def rumble(d):
    n = int(d * SR); t = np.arange(n) / SR
    s = lp_fast(noise(d), 160) * 3 * np.minimum(1, t / 0.15) * np.exp(-t / (d * 0.45))
    return s.astype(np.float32)
def crash(d=1.2):
    n = int(d * SR); t = np.arange(n) / SR; s = np.zeros(n, np.float32)
    for k in range(14):
        tk = rng.uniform(0, d * 0.6); i = int(tk * SR); g = thunk(rng.uniform(60, 160), 0.35) * rng.uniform(0.3, 0.9)
        s[i:i + len(g)] += g[: n - i]
    s += lp_fast(noise(d), 2500) * np.exp(-t * 3) * 0.25
    return s
def cuckoo():
    out = []
    for f, d in [(740, 0.16), (587, 0.24)]:
        n = int(d * SR); t = np.arange(n) / SR
        out.append(np.sin(2 * np.pi * f * t) * np.minimum(1, t / 0.01) * np.exp(-t * 6)); out.append(np.zeros(int(0.06 * SR)))
    return np.concatenate(out).astype(np.float32)
def scrape(d=0.8):
    n = int(d * SR); t = np.arange(n) / SR
    s = noise(d) * (0.5 + 0.5 * np.sin(2 * np.pi * 13 * t)) * np.sin(np.pi * t / d)
    s = hp_fast(lp_fast(s, 5000), 1500)
    ring = np.sin(2 * np.pi * 1870 * t) * np.exp(-t * 3) * 0.2
    return (s * 0.6 + ring).astype(np.float32)
def ting():
    n = int(1.2 * SR); t = np.arange(n) / SR
    return (sum(np.sin(2 * np.pi * f * t) * np.exp(-t * k) for f, k in [(2093, 4), (3136, 6), (4186, 8)]) * 0.3).astype(np.float32)
def sting():
    n = int(2.0 * SR); t = np.arange(n) / SR
    low = np.sin(2 * np.pi * 41 * t) * np.exp(-t * 1.5) * 1.2
    hit = lp_fast(noise(2.0), 900) * np.exp(-t * 6) * 0.8
    stab = brass([midi(45), midi(48), midi(51)], 1.4); s = low + hit; s[: len(stab)] += stab * 2.2 * np.exp(-np.arange(len(stab)) / SR * 2)
    return s.astype(np.float32)
def creak(d=0.6, f0=140):
    n = int(d * SR); t = np.arange(n) / SR
    rate = f0 * (1 + 0.35 * np.sin(2 * np.pi * 1.3 * t / d))
    ph = np.cumsum(rate) / SR; pulses = (np.mod(ph, 1) < 0.08).astype(np.float32)
    s = lp_fast(pulses * (0.6 + 0.4 * rng.random(n).astype(np.float32)), 2200) * np.sin(np.pi * t / d)
    return hp_fast(s, 200) * 2.5
def snap():
    d = 0.5; n = int(d * SR); t = np.arange(n) / SR
    return (hp_fast(noise(d), 800) * np.exp(-t * 18) * 1.4 + np.pad(thunk(120, 0.4), (0, n - int(0.4 * SR))) * 0.6).astype(np.float32)
def splash(d=1.0):
    n = int(d * SR); t = np.arange(n) / SR
    s = lp_fast(noise(d), 4000) * (np.exp(-t * 4) * np.minimum(1, t / 0.01)) + lp_fast(noise(d), 400) * np.exp(-t * 7) * 1.5
    return s.astype(np.float32)
def whoosh(d=0.5):
    n = int(d * SR); t = np.arange(n) / SR
    return (lp_fast(noise(d), 1500) * np.sin(np.pi * t / d) ** 2 * 0.6).astype(np.float32)
def snore(d=1.1):
    n = int(d * SR); t = np.arange(n) / SR
    buzz = (np.mod(np.cumsum(60 + 25 * np.sin(np.pi * t / d)) / SR, 1) < 0.3).astype(np.float32)
    return (lp_fast(buzz * 0.5 + noise(d) * 0.15, 700) * np.sin(np.pi * t / d) ** 2).astype(np.float32)
def leaves(d):
    n = int(d * SR); t = np.arange(n) / SR
    return (hp_fast(lp_fast(noise(d), 6000), 2500) * (0.3 + 0.3 * np.sin(2 * np.pi * 0.7 * t) ** 2) * np.minimum(1, t / 0.4) * np.minimum(1, (d - t) / 0.4)).astype(np.float32)
def water(d):
    n = int(d * SR); t = np.arange(n) / SR
    return (lp_fast(noise(d), 900) * 0.5 + hp_fast(lp_fast(noise(d), 3000), 1200) * 0.15 * (0.6 + 0.4 * np.sin(2 * np.pi * 0.4 * t))).astype(np.float32)


# ---------------- music: a light, bouncy bed (pizzicato bass, plucked chords, soft shaker) ----------------
music = np.zeros(N, np.float32)
BPM = 112; beat = 60 / BPM
prog = [(48, [60, 64, 67]), (43, [59, 62, 67]), (45, [57, 60, 64]), (41, [57, 60, 65])]   # C G Am F
def pluck(f, dur=0.35, bright=0.5):
    n = int(dur * SR); t = np.arange(n) / SR
    s = sum((bright ** k) * np.sin(2 * np.pi * f * (k + 1) * t) / (k + 1) for k in range(6))
    return (s * env(n, 0.003, dur * 0.35)).astype(np.float32)
def shaker():
    n = int(0.07 * SR); t = np.arange(n) / SR
    return (hp_fast(noise(0.07), 5000) * np.exp(-t * 60) * 0.5).astype(np.float32)
def tick(): # clothes peg click
    n = int(0.05 * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * 1800 * t) * np.exp(-t * 90) + hp_fast(noise(0.05), 2500) * np.exp(-t * 70) * 0.5).astype(np.float32)
def gale(d, f_lo, f_hi, shape=1.0):
    n = int(d * SR); t = np.arange(n) / SR
    s = hp_fast(lp_fast(noise(d), f_hi), f_lo) * (np.sin(np.pi * t / d) ** shape)
    return (s * (0.7 + 0.3 * np.sin(2 * np.pi * 2.3 * t))).astype(np.float32)
def noise(d): return rng.standard_normal(int(d * SR)).astype(np.float32)

def bed(t0, t1, gain=1.0):
    bar = 0; tt = t0
    while tt < t1:
        root, ch = prog[bar % 4]
        for b in range(4):
            tb = tt + b * beat
            if tb >= t1: break
            if b % 2 == 0: place(music, pluck(midi(root), 0.38, 0.45), tb, 0.45 * gain)
            place(music, shaker(), tb + beat / 2, 0.5 * gain)
            place(music, pluck(midi(ch[(b + bar) % 3]), 0.22, 0.6), tb + beat / 2, 0.16 * gain)
        bar += 1; tt += beat * 4
F = lambda f: f / 30
bed(0.0, F(459))                                  # bounces along until "You see,"
bed(F(767), DUR, 1.0)                              # the cheeky bed returns for "They tore the wall down"
# cut the first bed cleanly at the pivot, then a low tension drone under the wind
i0 = int(F(459) * SR); i1 = int(F(767) * SR)
music[i0:i1] = 0
dn = int((F(767) - F(459)) * SR); td = np.arange(dn) / SR
drone = (np.sin(2 * np.pi * 55 * td) + 0.5 * np.sin(2 * np.pi * 82.4 * td) + 0.3 * np.sin(2 * np.pi * 110.3 * td)) * np.minimum(1, td / 1.5) * np.minimum(1, (td[-1] - td) / 0.6)
place(music, lp_fast(drone.astype(np.float32), 600), F(459), 0.10)

# ---------------- sfx cue table (frames / 30) ----------------
sfx = np.zeros(N, np.float32)
place(sfx, gale(2.4, 200, 2500), 0.0, 0.18)                    # light wind under the hook
place(sfx, whoosh(0.5), F(60), 0.35)                           # camera pull-back
place(sfx, gale(2.0, 150, 3000, 0.8), F(76), 0.45)             # "took it personally": the gust hits the wall
place(sfx, thunk(70, 0.35), F(86), 0.7)
place(sfx, leaves(2.2), F(100), 0.30)
place(sfx, gale(4.8, 150, 2500), F(139), 0.35)                 # windy hill
place(sfx, whoosh(0.9), F(208), 0.55)                          # washing leaves the line
place(sfx, leaves(2.8), F(215), 0.4)
place(sfx, thunk(95, 0.3), F(330), 0.8)                        # the mayor points
place(sfx, scrape(0.6), F(334), 0.3)
for fr, g in [(372, 0.8), (400, 0.9), (440, 1.0)]: place(sfx, thunk(60, 0.4), F(fr), g)          # courses go up
place(sfx, rumble(2.2), F(403), 0.7)                           # "taller than the church"
place(sfx, crash(1.0), F(448), 0.35)
place(sfx, sting(), F(459), 0.45)                              # "You see,"
place(sfx, gale(8.5, 120, 3500, 0.7), F(476), 0.6)             # the wind arrives
place(sfx, whoosh(0.8), F(539), 0.6)                           # climbs over
place(sfx, whoosh(0.7), F(567), 0.6)                           # drops down
place(sfx, thunk(55, 0.5), F(611), 1.0)                        # harder than before
for k, fr in enumerate([653, 667, 681]):                        # three roofs
    place(sfx, creak(0.5, 120 + 20 * k), F(fr) - 0.2, 0.7); place(sfx, crash(0.9), F(fr), 0.55)
place(sfx, gale(1.2, 400, 4000, 0.6), F(735) - 0.2, 0.55)      # second gust
place(sfx, whoosh(0.7), F(738), 0.6)                           # hat sails off
place(sfx, rumble(2.4), F(767), 0.7)                           # the wall comes down
for fr in [775, 788, 800, 812]: place(sfx, thunk(65, 0.35), F(fr), 0.65)
place(sfx, crash(1.4), F(790), 0.45)
place(sfx, gale(2.0, 250, 2500, 0.6), F(830), 0.22)            # calm breeze
for k in range(14): place(sfx, tick(), F(835 + k * 41 / 13.0), 0.6)   # pegs
place(sfx, ting(), F(876), 0.6)                                # last peg, last word

def write_stem(name, x):
    x = np.asarray(x, np.float32).copy()
    fade = int(0.04 * SR); x[-fade:] *= np.linspace(1, 0, fade)
    pcm = (np.clip(x, -1, 1) * 32767).astype(np.int16)
    with wave.open(name, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())

# Stems are written at their natural level. No ducking, no compression, no mixing here:
# mix.py sets music and SFX to 50 % of the voice (gated RMS) and builds mix_raw.wav.
write_stem("music.wav", music)
write_stem("sfx.wav", sfx)
print("stems ok", round(DUR, 2), "s")
