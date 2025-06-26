# A.V.A: Adaptive Virtual Assistant

This project provides a hybrid AI assistant using Electron for the UI and Node.js for the backend. Speech to text is powered by whisper.cpp, while LLM responses come from Together AI. Text‑to‑speech uses ElevenLabs.

## Prerequisites

- **Node.js** (version 18 or later is recommended)
- **whisper.cpp binary** – download `whisper.exe` from [ggerganov/whisper.cpp](https://github.com/ggerganov/whisper.cpp/releases) and place it in `backend/stt/`
- **yt-dlp** – the setup script grabs `yt-dlp.exe` automatically for music playback

## Environment Variables

Create a `.env` file or copy from `.env.example` and provide the following keys:

- `TOGETHER_API_KEY` – API key for Together AI
- `ELEVENLABS_API_KEY` – ElevenLabs API key for text‑to‑speech
- `ELEVENLABS_VOICE_ID` – ElevenLabs voice ID
- `PICOVOICE_ACCESS_KEY` – access key for Porcupine wake word detection

## Setup

Run the installer to install dependencies and create the `.env` file:

```bash
node setup.js
```

Add your API keys to `.env` and ensure `whisper.exe` exists in `backend/stt/`.

## Running the App

Start the Electron frontend together with the backend:

```bash
npm start
```

This launches the Electron interface and initializes the wake‑word listener and voice pipeline. During development you can run the backend by itself with:

```bash
npm run dev
```

