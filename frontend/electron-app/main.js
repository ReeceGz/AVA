const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { speak } = require('../../backend/tts');
const { queryLLM } = require('../../backend/llm');
const { saveToMemory } = require('../../backend/memory/sqlite');

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true
    }
  });

  win.loadFile('frontend/electron-app/index.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

ipcMain.handle('jarvis:query', async (_, prompt) => {
  const response = await queryLLM(prompt);
  speak(response);
  saveToMemory(prompt, response);
  return response;
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
