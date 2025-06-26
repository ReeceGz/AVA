// frontend/electron-app/main.js

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { init, handleVoice } = require('../../backend');

let win;
function createWindow() {
  win = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true
    }
  });
  win.loadFile(path.join(__dirname, 'index.html'));
}

app.whenReady().then(() => {
  createWindow();
  init(win);
});

// Text query handler
ipcMain.handle('ava:query', async (_, prompt) => {
  const { queryLLM } = require('../../backend/llm');
  const { speak }    = require('../../backend/tts');
  const { saveToMemory } = require('../../backend/memory/sqlite');
  const response = await queryLLM(prompt);
  speak(response);
  saveToMemory(prompt, response);
  return response;
});

// Voice handler
ipcMain.handle('ava:voice', async () => {
  await handleVoice();
});

// Play music handler
ipcMain.handle('ava:play-music', async (_, query) => {
  console.log('[Main] play-music handler called with:', query);
  const { playLocal, playYouTube } = require('../../backend/tools/playMusic');
  if (query && query.trim()) {
    playYouTube(query.trim());
  } else {
    playLocal();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
