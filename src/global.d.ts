/// <reference types="electron" />

declare global {
  var mainWindow: BrowserWindow | null;
  interface Window {
    electron: {
      restoreVtt: (userInput: string) => Promise<string>;
      onLogMessage: (userInput: (message: string) => void) => void;
      sendLogToMain: (userInput: string) => Promise<string>;
    };
  }
}

export {};
