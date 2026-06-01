````md
# 🎙️ Whisper MP4 Transkription

Dieses Projekt ermöglicht die automatische Transkription von MP4-Videodateien mithilfe von OpenAI Whisper und FFmpeg.

Die Anwendung extrahiert zunächst die Audiospur aus einer Videodatei und erstellt anschließend eine Textdatei mit Zeitstempeln.

---

# 📂 Projektaufbau

```txt
Transkription/
│
├── venv/                  # Python Virtual Environment
│   ├── Include/
│   ├── Lib/
│   ├── Scripts/
│   ├── share/
│   └── pyvenv.cfg
│
├── ffmpeg.exe             # FFmpeg zur Audioextraktion
├── transkription.py       # Hauptskript für Transkription
````

---

# ⚙️ Funktionen

* 🎬 Extraktion von Audio aus MP4-Dateien
* 🤖 Automatische Transkription mit Whisper AI
* 🕒 Ausgabe mit Zeitstempeln
* 🇩🇪 Optimiert für deutsche Sprache
* 🧹 Automatische Bereinigung temporärer Dateien
* ⚡ Einfache Nutzung über die Konsole

---

# 🚀 Installation

## 1. Virtuelle Umgebung erstellen

```bash
python -m venv venv
```

## 2. Virtuelle Umgebung aktivieren

### Windows

```bash
venv\Scripts\activate
```

---

## 3. Whisper installieren

```bash
pip install openai-whisper
```

---

# ▶️ Verwendung

```bash
python transkription.py video.mp4
```

## Beispiel

```bash
python transkription.py meeting.mp4
```

---

# 📝 Ausgabe

Nach erfolgreicher Verarbeitung wird automatisch eine Datei erstellt:

```txt
transkription.txt
```

## Beispielausgabe

```txt
[00:00:01] Hallo zusammen.
[00:00:05] Willkommen zum heutigen Meeting.
[00:00:12] Die Transkription wurde erfolgreich gestartet.
```

---

# 🔧 Voraussetzungen

* Python 3.9+
* FFmpeg (`ffmpeg.exe`)
* OpenAI Whisper

---

# 📄 Lizenz

MIT License

---

# 👨‍💻 Entwickler

Entwickelt von Ewgenij Jurenko

```
```
