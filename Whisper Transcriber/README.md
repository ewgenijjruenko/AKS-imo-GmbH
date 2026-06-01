````md
# 🎙️ MP4 Whisper Transcriber

Ein einfaches und robustes Python-Skript zur automatischen Transkription von MP4-Videos mit OpenAI Whisper und FFmpeg.

Das Tool extrahiert automatisch die Audiospur aus einer Videodatei und erstellt anschließend eine Transkription mit Zeitstempeln im TXT-Format.

---

## ✨ Features

- 🎬 Extraktion von Audio aus MP4-Dateien
- 🤖 Automatische Transkription mit OpenAI Whisper
- 🕒 Zeitstempel für jedes Segment
- 🇩🇪 Optimiert für deutsche Sprache
- ⚡ Einfache Nutzung über die Konsole
- 🧹 Automatisches Entfernen temporärer Dateien
- 🔧 Kein kompliziertes Setup notwendig

---

## 📦 Voraussetzungen

- Python 3.9+
- `ffmpeg.exe` im selben Ordner wie das Skript
- Whisper installiert

---

## 📥 Installation

```bash
pip install openai-whisper
````

Zusätzlich wird benötigt:

* FFmpeg für Windows
* `ffmpeg.exe` muss sich im gleichen Verzeichnis wie das Skript befinden

---

## 🚀 Verwendung

```bash
python transkription.py mein_video.mp4
```

Beispiel:

```bash
python transkription.py meeting.mp4
```

---

## 📝 Beispielausgabe

```txt
[00:00:02] Hallo zusammen und willkommen zum Meeting.
[00:00:08] Heute besprechen wir die nächsten Schritte.
[00:00:15] Die Aufgaben wurden bereits verteilt.
```

---

## 📂 Projektstruktur

```txt
/
├── transkription.py
├── ffmpeg.exe
├── meeting.mp4
└── transkription.txt
```

---

## ⚙️ Verwendete Technologien

* Python
* OpenAI Whisper
* FFmpeg

---

## 💡 Geplante Features

* Unterstützung weiterer Videoformate
* GUI/Desktop-Anwendung
* Export als SRT-Untertitel
* Mehrsprachige Transkription
* Automatische Sprechererkennung

---

## 📄 Lizenz

MIT License

---

## 👨‍💻 Autor

Entwickelt von Ewgenij Jurenko

```
```
