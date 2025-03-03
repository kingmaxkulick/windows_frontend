import { app, BrowserWindow, protocol } from 'electron'
import * as path from 'path'
import * as fs from 'fs'

function createWindow() {
  // Register the file protocol handler to allow accessing local files
  protocol.registerFileProtocol('file', (request, callback) => {
    const pathname = decodeURI(request.url.replace('file:///', ''))
    callback(pathname)
  })

  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // Use the preload script
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false, // This is required to allow loading local video files
    }
  })

  // Create assets directory in production if it doesn't exist
  if (app.isPackaged) {
    const assetsDir = path.join(process.resourcesPath, 'assets')
    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true })
    }
  }

  // Load your React app
  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:5173')
    
    // Open DevTools in development
    win.webContents.openDevTools({ mode: 'detach' })
  } else {
    win.loadFile(path.join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error)
})