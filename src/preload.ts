import rats from "./rats";
import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('rats', rats);

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send('window-control', 'minimize'),
  maximize: () => ipcRenderer.send('window-control', 'maximize'),
  close: () => ipcRenderer.send('window-control', 'close'),
})

