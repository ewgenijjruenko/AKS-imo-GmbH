import os
import sys
import subprocess
import whisper
import datetime

def format_time(seconds: float):
    """Formatiert Sekunden zu [HH:MM:SS]"""
    return str(datetime.timedelta(seconds=int(seconds)))

def extrahiere_audio(video_datei, audio_datei="temp_audio.wav"):
    ffmpeg_exe = os.path.join(os.getcwd(), "ffmpeg.exe")
    if not os.path.isfile(ffmpeg_exe):
        print("❌ Fehler: ffmpeg.exe wurde nicht im aktuellen Ordner gefunden.")
        return False

    try:
        print(f"🎬 Extrahiere Audio aus {video_datei} ...")

        command = [
            ffmpeg_exe,
            "-i", video_datei,
            "-ac", "1",           # mono
            "-ar", "16000",       # 16 kHz
            "-y",                 # überschreiben
            audio_datei
        ]

        subprocess.run(command, check=True)
        print(f"✅ Audio gespeichert als: {audio_datei}")
        return True

    except subprocess.CalledProcessError as e:
        print("❌ Fehler bei ffmpeg:", e)
        return False

def transkribiere_audio(audio_datei, ausgabe_datei="transkription.txt"):
    try:
        print("🤖 Lade Whisper Modell (base)...")
        modell = whisper.load_model("base")

        print("✍️ Transkribiere Audio mit Zeitstempeln...")
        ergebnis = modell.transcribe(audio_datei, fp16=False, verbose=False, language="de")

        with open(ausgabe_datei, "w", encoding="utf-8") as f:
            for segment in ergebnis["segments"]:
                start = format_time(segment["start"])
                text = segment["text"].strip()
                f.write(f"[{start}] {text}\n")

        print(f"✅ Transkription mit Zeitstempeln gespeichert unter: {ausgabe_datei}")
        os.remove(audio_datei)

    except Exception as e:
        print("❌ Fehler bei Transkription:", e)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("⚠️ Bitte gib eine MP4-Datei an. Beispiel:")
        print("python transkription.py mein_video.mp4")
    else:
        video_datei = sys.argv[1]

        if not os.path.isfile(video_datei):
            print(f"❌ Datei nicht gefunden: {video_datei}")
            sys.exit(1)

        audio_datei = "temp_audio.wav"

        if extrahiere_audio(video_datei, audio_datei):
            transkribiere_audio(audio_datei)
