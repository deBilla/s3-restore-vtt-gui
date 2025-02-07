import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electron", {
  restoreVtt: (file: string) => ipcRenderer.invoke("restore-vtt", file),

  onLogMessage: (callback: (message: string) => void) => {
    ipcRenderer.on("log-message", (_event, message) => {
      callback(message);
    });
  },

  sendLogToMain: (message: string) => {
    ipcRenderer.send("renderer-log", message);
  }
});
