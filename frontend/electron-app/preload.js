// frontend/electron-app/preload.js

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ava', {
  query: (text) => ipcRenderer.invoke('ava:query', text),
  voice: ()     => ipcRenderer.invoke('ava:voice'),
  onLog: (fn)   => ipcRenderer.on('log', (_, msg) => fn(msg)),
  // Play music
  playMusic: (query) => {
    console.log('[Preload] invoking playMusic with:', query);
    return ipcRenderer.invoke('ava:play-music', query);
  }
});
