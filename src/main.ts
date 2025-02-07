import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { restoreVttFromParent } from './functions';

let win: BrowserWindow | null = null;

function createWindow(): void {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false, // Keep false for security
      contextIsolation: true,
    },
  });

  win.loadFile(path.join(__dirname, 'index.html'));

  console.log('✅ Main process started.');
  sendLogToRenderer('✅ Main process started.');

  ipcMain.handle('restore-vtt', async (_event, userInput: string) => {
    sendLogToRenderer('📩 Received restore-vtt request: ' + userInput);

    try {
      await restoreVttFromParent(userInput, sendLogToRenderer);
      sendLogToRenderer('✅ VTT restored successfully!');
      return 'VTT restored successfully';
    } catch (error) {
      sendLogToRenderer('❌ Error restoring VTT: ' + error);
      throw error;
    }
  });
}

// Function to send logs to the UI
function sendLogToRenderer(message: string) {
  console.log(message); // Logs to the main process console
  if (win) {
    win.webContents.send('log-message', message); // Sends log to renderer
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
