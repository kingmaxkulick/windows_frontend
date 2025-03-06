const { contextBridge } = require('electron');

// Expose protected methods that allow the renderer process to use
// specific electron features without exposing the entire API
contextBridge.exposeInMainWorld('electron', {
  isElectron: true,
  platform: process.platform,
  // Add any other properties or methods you want to expose to your React app
});