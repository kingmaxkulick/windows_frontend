// Preload script for Electron
window.addEventListener('DOMContentLoaded', () => {
    // Expose Electron features to the renderer process if needed
    window.electron = {
      isElectron: true,
      platform: process.platform
    };
    
    console.log('Electron app is running in fullscreen mode');
  });