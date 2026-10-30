#!/usr/bin/env python3
"""Собирает ролик «Легенда о Генри и старом дубе».

Исходное видео (SRC) чередуется с мультяшными сценами (S01..S16).
Тайминг взят из расшифровки русской озвучки (см. PLAN.md).
Запуск: python3 build_video.py
"""
import os
import subprocess
import sys

ROOT = "/home/user/remotion-video/story"
IMG = f"{ROOT}/img"
SEG = f"{ROOT}/seg"
AUD = f"{ROOT}/audio"
OUT = f"{ROOT}/final"
FPS = 24
OV = 0.6          # длительность перекрёстного затухания, сек
T_END = 165.0     # общая длина ролика, сек
SRC = f"{ROOT}/source_lumberjack.mp4"
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

# (тип, имя, начало, параметры)
# для картинок: zoom 'in'/'out', pan (fx0, fx1, fy0, fy1) от 0 до 1
TIMELINE = [
    ("src", "SRC_A", 0.0, {"off": 0.0}),
    ("img", "S02", 7.5, {"zoom": "in", "pan": (0.3, 0.5, 0.5, 0.4)}),
    ("img", "S01", 15.6, {"zoom": "in", "pan": (0.1, 0.8, 0.5, 0.5)}),
    ("img", "S03", 21.0, {"zoom": "out", "pan": (0.5, 0.5, 0.2, 0.6)}),
    ("src", "SRC_B", 24.6, {"off": 1.0}),
    ("img", "S04", 27.6, {"zoom": "in", "pan": (0.1, 0.3, 0.6, 0.6)}),
    ("img", "S05", 32.3, {"zoom": "in", "pan": (0.6, 0.5, 0.5, 0.4)}),
    ("img", "S06", 39.5, {"zoom": "out", "pan": (0.4, 0.5, 0.5, 0.5)}),
    ("src", "SRC_C", 46.4, {"off": 0.0}),
    ("img", "S07", 53.2, {"zoom": "in", "pan": (0.2, 0.5, 0.6, 0.5)}),
    ("img", "S08", 57.4, {"zoom": "in", "pan": (0.7, 0.6, 0.5, 0.4)}),
    ("img", "S09", 62.3, {"zoom": "in", "pan": (0.5, 0.5, 0.9, 0.1)}),
    ("img", "S07", 67.5, {"zoom": "out", "pan": (0.5, 0.3, 0.5, 0.5), "tag": "b"}),
    ("img", "S10", 76.8, {"zoom": "in", "pan": (0.5, 0.5, 0.5, 0.5)}),
    ("img", "S11", 83.0, {"zoom": "in", "pan": (0.5, 0.5, 0.5, 0.4)}),
    ("img", "S12", 87.6, {"zoom": "in", "pan": (0.5, 0.45, 0.4, 0.4)}),
    ("src", "SRC_D", 95.2, {"off": 2.0}),
    ("img", "S13", 104.0, {"zoom": "in", "pan": (0.3, 0.7, 0.5, 0.5)}),
    ("img", "S14", 114.3, {"zoom": "in", "pan": (0.5, 0.5, 0.6, 0.4)}),
    ("img", "S15", 123.8, {"zoom": "in", "pan": (0.5, 0.5, 0.5, 0.5)}),
    ("src", "SRC_E", 138.4, {"off": 0.0}),
    ("img", "S16", 150.0, {"zoom": "in", "pan": (0.5, 0.5, 0.7, 0.4)}),
]

# Звук «тук»: (время, тип)
KNOCKS = [
    (36.85, "axe"), (37.73, "axe"), (38.61, "axe"),
    (59.9, "fist"), (60.7, "fist"), (61.5, "fist"),
    (72.85, "far"), (73.65, "far"), (74.45, "far"),
    (150.15, "deep"), (150.95, "deep"), (151.75, "deep"),
]
# Когда виден рассказчик у костра — подмешиваем треск костра
FIRE_WINDOWS = [(0.0, 7.9), (24.3, 27.9), (46.1, 53.5), (94.9, 104.3), (138.1, 150.3)]


def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print("ОШИБКА:", " ".join(cmd[:6]), "...\n", r.stderr[-1500:])
        sys.exit(1)


def durations():
    n = len(TIMELINE)
    ds = []
    for i, (_, _, t, _) in enumerate(TIMELINE):
        if i == 0:
            ds.append(TIMELINE[1][2] + OV / 2)
        elif i == n - 1:
            ds.append(T_END - t + OV / 2)
        else:
            ds.append(TIMELINE[i + 1][2] - t + OV)
    return ds


def make_segment(i, item, d):
    kind, name, _, p = item
    tag = p.get("tag", "")
    path = f"{SEG}/{i:02d}_{name}{tag}.mp4"
    if os.path.exists(path):
        return path
    frames = int(round(d * FPS))
    if kind == "src":
        cmd = ["ffmpeg", "-y", "-loglevel", "error", "-stream_loop", "-1", "-ss", str(p["off"]),
               "-i", SRC, "-t", f"{d:.3f}", "-an",
               "-vf", f"scale=1280:720,fps={FPS},setsar=1,format=yuv420p",
               "-c:v", "libx264", "-crf", "17", "-preset", "medium", path]
    else:
        fx0, fx1, fy0, fy1 = p["pan"]
        if p["zoom"] == "in":
            z = f"1+0.14*on/{frames}"
        else:
            z = f"1.14-0.14*on/{frames}"
        x = f"(iw-iw/zoom)*({fx0}+({fx1}-{fx0})*on/{frames})"
        y = f"(ih-ih/zoom)*({fy0}+({fy1}-{fy0})*on/{frames})"
        vf = (f"scale=3840:2160,zoompan=z='{z}':x='{x}':y='{y}':d={frames}:s=1280x720:fps={FPS},"
              f"setsar=1,format=yuv420p")
        cmd = ["ffmpeg", "-y", "-loglevel", "error", "-i", f"{IMG}/{name.lower()}.png",
               "-vf", vf, "-frames:v", str(frames),
               "-c:v", "libx264", "-crf", "17", "-preset", "medium", path]
    run(cmd)
    return path


def make_audio():
    out = f"{AUD}/final_mix.wav"
    if os.path.exists(out):
        return out
    os.makedirs(AUD, exist_ok=True)
    sr = 48000
    # звуки ударов
    knock = {
        "axe": "0.9*exp(-t*38)*sin(2*PI*150*t)+0.5*exp(-t*140)*(random(0)-0.5)",
        "fist": "0.7*exp(-t*55)*sin(2*PI*210*t)+0.4*exp(-t*170)*(random(0)-0.5)",
        "far": "0.7*exp(-t*38)*sin(2*PI*150*t)+0.5*exp(-t*140)*(random(0)-0.5)",
        "deep": "1.0*exp(-t*20)*sin(2*PI*85*t)+0.4*exp(-t*90)*(random(0)-0.5)",
    }
    for k, expr in knock.items():
        extra = ""
        if k == "far":
            extra = ",lowpass=f=700,aecho=0.7:0.6:180:0.35,volume=0.45"
        if k == "deep":
            extra = ",lowpass=f=400,volume=0.9"
        run(["ffmpeg", "-y", "-loglevel", "error", "-f", "lavfi", "-i",
             f"aevalsrc='{expr}':d=1.2:s={sr}", "-af", f"aformat=channel_layouts=stereo{extra}",
             f"{AUD}/knock_{k}.wav"])
    # ветер и тихий гул музыки
    run(["ffmpeg", "-y", "-loglevel", "error", "-f", "lavfi", "-i",
         f"anoisesrc=d={T_END}:c=brown:r={sr}:a=0.5",
         "-af", "lowpass=f=450,tremolo=f=0.12:d=0.5,aformat=channel_layouts=stereo", f"{AUD}/wind.wav"])
    run(["ffmpeg", "-y", "-loglevel", "error", "-f", "lavfi", "-i",
         "aevalsrc='0.5*sin(2*PI*55*t)+0.3*sin(2*PI*82.4*t)+0.25*sin(2*PI*110*t+0.6*sin(2*PI*0.1*t))"
         f"':d={T_END}:s={sr}",
         "-af", "tremolo=f=0.1:d=0.35,aformat=channel_layouts=stereo", f"{AUD}/drone.wav"])

    inputs = ["-i", f"{ROOT}/voice_ru_norm.wav", "-i", f"{ROOT}/../analysis/fire_ambience.wav",
              "-i", f"{AUD}/wind.wav", "-i", f"{AUD}/drone.wav"]
    for k in knock:
        inputs += ["-i", f"{AUD}/knock_{k}.wav"]
    kidx = {k: 4 + n for n, k in enumerate(knock)}

    fc = []
    fc.append("[0:a]aformat=sample_rates=48000:channel_layouts=stereo,volume=1.0[v]")
    mix = ["[v]"]
    for n, (a, b) in enumerate(FIRE_WINDOWS):
        fc.append(f"[1:a]atrim=start={n * 3}:duration={b - a:.2f},asetpts=PTS-STARTPTS,"
                  f"aformat=sample_rates=48000:channel_layouts=stereo,volume=0.55,"
                  f"afade=t=in:d=0.4,afade=t=out:st={b - a - 0.5:.2f}:d=0.5,"
                  f"adelay={int(a * 1000)}|{int(a * 1000)}[f{n}]")
        mix.append(f"[f{n}]")
    fc.append("[2:a]aformat=sample_rates=48000:channel_layouts=stereo,volume=0.35[w]")
    fc.append("[3:a]aformat=sample_rates=48000:channel_layouts=stereo,volume=0.05,"
              "afade=t=in:d=3,afade=t=out:st=161:d=4[m]")
    mix += ["[w]", "[m]"]
    for n, (t, kind) in enumerate(KNOCKS):
        ms = int(t * 1000)
        fc.append(f"[{kidx[kind]}:a]aformat=sample_rates=48000:channel_layouts=stereo,"
                  f"volume=0.9,adelay={ms}|{ms}[k{n}]")
        mix.append(f"[k{n}]")
    fc.append("".join(mix) + f"amix=inputs={len(mix)}:normalize=0:duration=longest,"
              f"atrim=0:{T_END},afade=t=out:st={T_END - 1.8}:d=1.8,"
              "loudnorm=I=-16:TP=-1.5:LRA=11[out]")
    run(["ffmpeg", "-y", "-loglevel", "error"] + inputs +
        ["-filter_complex", ";".join(fc), "-map", "[out]", "-ar", "48000", out])
    return out


def main():
    os.makedirs(SEG, exist_ok=True)
    os.makedirs(OUT, exist_ok=True)
    ds = durations()
    segs = []
    for i, (item, d) in enumerate(zip(TIMELINE, ds)):
        print(f"сегмент {i + 1}/{len(TIMELINE)}: {item[1]} {item[2]:.1f}с, {d:.1f}с", flush=True)
        segs.append(make_segment(i, item, d))

    # перекрёстные затухания
    inputs = []
    for s in segs:
        inputs += ["-i", s]
    fc = []
    prev = "[0:v]"
    for k in range(1, len(segs)):
        off = TIMELINE[k][2] - OV / 2
        tag = f"[x{k}]"
        fc.append(f"{prev}[{k}:v]xfade=transition=fade:duration={OV}:offset={off:.3f}{tag}")
        prev = tag
    cap = ("drawtext=fontfile={f}:text='Генри Уилсон, лесоруб. Умер в 1987 году у старого дуба':"
           "fontsize=31:fontcolor=white:box=1:boxcolor=black@0.55:boxborderw=16:"
           "x=(w-text_w)/2:y=h-110:enable='between(t,131.6,138.6)':"
           "alpha='min(1,(t-131.6)/0.6)'").format(f=FONT)
    fc.append(f"{prev}{cap},fade=t=out:st={T_END - 1.6}:d=1.6,format=yuv420p[vout]")
    video = f"{OUT}/video_only_v2.mp4"
    if not os.path.exists(video):
        print("склейка видео...", flush=True)
        run(["ffmpeg", "-y", "-loglevel", "error"] + inputs +
            ["-filter_complex", ";".join(fc), "-map", "[vout]", "-t", str(T_END),
             "-c:v", "libx264", "-crf", "18", "-preset", "medium", "-r", str(FPS), video])
    print("звук...", flush=True)
    audio = make_audio()
    final = f"{OUT}/Legenda_Genri_RU_v2.mp4"
    run(["ffmpeg", "-y", "-loglevel", "error", "-i", video, "-i", audio,
         "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
         "-shortest", "-movflags", "+faststart", final])
    print("ГОТОВО:", final)


if __name__ == "__main__":
    main()
