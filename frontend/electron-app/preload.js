const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('AVA', {
  query: (text) => ipcRenderer.invoke('AVA:query', text)
});
