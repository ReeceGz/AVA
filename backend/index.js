// backend/index.js

/**
 * Make sure you’ve installed:
 *   npm install loudness
 */

const path = require('path');
const fs   = require('fs');
const { spawn } = require('child_process');
const record = require('node-record-lpcm16');
const wav    = require('wav');
const { shell } = require('electron');
const { initWakeWord } = require('./wakeword');
const { queryLLM }     = require('./llm');
const { speak }        = require('./tts');
const { saveToMemory } = require('./memory/sqlite');
const { getVolume, setVolume } = require('loudness');

// === Configuration ===
const STT_DIR     = path.join(__dirname, 'stt');
// Whisper.cpp expects the model in the same folder as the binary
// The repository ships the model file directly under /backend/stt
// rather than inside a "models" subdirectory.
const MODEL_PATH  = path.join(STT_DIR, 'ggml-base.dll');
const WHISPER_CLI = path.join(STT_DIR, 'whisper.exe');

let mainWindow = null;
function setWindow(win) { mainWindow = win; }

// Volume helper
async function adjustVolume(delta) {
  try {
    let v = await getVolume();
    v = Math.max(0, Math.min(100, v + delta));
    await setVolume(v);
    mainWindow?.webContents.send('log', `[Volume] ${v}%`);
    await speak(`Volume set to ${v} percent`);
  } catch {
    mainWindow?.webContents.send('log', '[Volume] Control unavailable');
    await speak('Cannot adjust volume right now');
  }
}

// 1) Record audio to WAV
function recordAudio(durationMs = 5000, file = 'input.wav') {
  return new Promise((resolve) => {
    const outfile = path.join(STT_DIR, file);
    const writer = new wav.FileWriter(outfile, {
      sampleRate: 16000,
      channels: 1,
      bitDepth: 16
    });
    const mic = record.record({
      sampleRateHertz: 16000,
      threshold: 0,
      recordProgram: 'sox',
      verbose: false
    });
    mic.stream().pipe(writer);
    setTimeout(() => { mic.stop(); writer.end(); resolve(outfile); }, durationMs);
  });
}

// 2) Transcribe with Whisper
function transcribe(filePath) {
  return new Promise((resolve, reject) => {
    const fileName = path.basename(filePath);
    const args = ['-f', fileName, '-m', MODEL_PATH, '-l', 'en', '-otxt'];
    let stderr = '';
    const p = spawn(WHISPER_CLI, args, { cwd: STT_DIR });
    p.stderr.on('data', d => stderr += d.toString());
    p.on('exit', code => {
      if (code !== 0) return reject(new Error(`Whisper exited code ${code}\n${stderr}`));
      fs.readFile(path.join(STT_DIR, `${fileName}.txt`), 'utf8', (e, data) => {
        if (e) reject(e);
        else resolve(data.trim());
      });
    });
  });
}

// 3) Voice → Intent → LLM → TTS pipeline
async function handleVoice() {
  mainWindow?.webContents.send('log', '[Voice] Recording…');
  let file;
  try {
    file = await recordAudio();
  } catch (e) {
    return mainWindow?.webContents.send('log', `[Error] Recording failed: ${e}`);
  }

  mainWindow?.webContents.send('log', '[Voice] Transcribing…');
  let transcript;
  try {
    transcript = await transcribe(file);
  } catch (e) {
    return mainWindow?.webContents.send('log', `[Error] Transcribe failed: ${e}`);
  }

  // Normalize and strip trailing punctuation
  const raw   = transcript.trim();
  const clean = raw.replace(/[\.?!]+$/, '');
  mainWindow?.webContents.send('log', `[You]: ${clean}`);
  const lower = clean.toLowerCase();

  // --- Play music intent ---
  const playMatch = clean.match(/^(?:play|play music|play song|play track)\s*(.*)$/i);
  if (playMatch) {
    const query = playMatch[1].trim();
    mainWindow?.webContents.send('log', `[Music] Command: "${query || 'local'}"`);
    const { playLocal, playYouTube } = require('./tools/playMusic');
    return query ? playYouTube(query) : playLocal();
  }

  // --- Stop/Pause ---
  if (/^(?:stop(?: music)?|pause(?: music)?|stop playback|pause playback)$/i.test(lower)) {
    mainWindow?.webContents.send('log', '[Music] Stopping music');
    await speak('Music stopped');
    return;
  }

  // --- Volume controls ---
  if (/^(?:volume up|increase volume|turn up(?: the)? volume|louder)$/i.test(lower)) {
    return adjustVolume(50);
  }
  if (/^(?:volume down|decrease volume|turn down(?: the)? volume|quieter)$/i.test(lower)) {
    return adjustVolume(-50);
  }
  if (/^mute$/i.test(lower)) {
    try {
      await setVolume(0);
      mainWindow?.webContents.send('log', '[Volume] Muted');
      return speak('Muted');
    } catch {
      return speak('Cannot mute right now');
    }
  }
  if (/^unmute$/i.test(lower)) {
    try {
      await setVolume(50);
      mainWindow?.webContents.send('log', '[Volume] Unmuted');
      return speak('Unmuted');
    } catch {
      return speak('Cannot unmute right now');
    }
  }

  // --- Weather ---
  const weatherMatch = lower.match(/^(?:weather|what(?:'s| is)? the weather)(?: in)?\s*(.*)$/i);
  if (weatherMatch) {
    const city = weatherMatch[1].trim();
    const url = city
      ? `https://www.google.com/search?q=weather+${encodeURIComponent(city)}`
      : 'https://www.google.com/search?q=weather';
    mainWindow?.webContents.send('log', `[Weather] Opening ${city || 'current location'}`);
    shell.openExternal(url);
    return speak(`Here is the weather for ${city || 'your location'}`);
  }

  // --- Time & Date ---
  if (/^(?:what(?:'s| is)? the time|tell me the time)$/i.test(lower)) {
    const t = new Date().toLocaleTimeString();
    mainWindow?.webContents.send('log', `[Time] ${t}`);
    return speak(`The current time is ${t}`);
  }
  if (/^(?:what(?:'s| is)? the date|tell me the date)$/i.test(lower)) {
    const d = new Date().toLocaleDateString();
    mainWindow?.webContents.send('log', `[Date] ${d}`);
    return speak(`Today is ${d}`);
  }

  // --- Fallback ---
  saveToMemory(transcript, '');
  try {
    const reply = await queryLLM(transcript);
    mainWindow?.webContents.send('log', `[AVA]: ${reply}`);
    saveToMemory(transcript, reply);
    return speak(reply);
  } catch (e) {
    return mainWindow?.webContents.send('log', `[Error] LLM failed: ${e}`);
  }
}

// 4) Optional folder watcher
function watchFolder() {
  const folder = path.join(STT_DIR, 'incoming');
  if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
  fs.watch(folder, (evt, fname) =>
    evt === 'rename' && fname.endsWith('.mp3') && handleFile(path.join(folder, fname))
  );
}

async function handleFile(file) {
  mainWindow?.webContents.send('log', `[File] New audio: ${file}`);
  let txt;
  try {
    txt = await transcribe(file);
  } catch (err) {
    return mainWindow?.webContents.send('log', `[Error] File transcribe failed: ${err}`);
  }
  mainWindow?.webContents.send('log', `[Transcribed]: ${txt}`);
  const reply = await queryLLM(txt);
  mainWindow?.webContents.send('log', `[AVA]: ${reply}`);
  return speak(reply);
}

// 5) Initialization
function init(win) {
  setWindow(win);
  initWakeWord(handleVoice);
  watchFolder();
  mainWindow?.webContents.send('log', '[System] Voice pipeline initialized');
}

module.exports = { init, handleVoice };
