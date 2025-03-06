const { app, BrowserWindow, screen, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const isDev = require('electron-is-dev');
const fs = require('fs');

// Keep a global reference of the window object to prevent garbage collection
let mainWindow;

function createWindow() {
  // Get the primary display dimensions
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  
  // Create the browser window
  mainWindow = new BrowserWindow({
    width,
    height,
    fullscreen: true,
    kiosk: true, // Runs the app in kiosk mode (true fullscreen)
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // Load the app
  mainWindow.loadURL(
    isDev
      ? 'http://localhost:5173' // Dev server URL (adjust if yours is different)
      : `file://${path.join(__dirname, 'dist/index.html')}` // Production build path
  );

  // Open DevTools in development mode
  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  // Handle window close
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Start the Python backend server
let pythonProcess = null;

function startPythonBackend() {
  // Path to the Python executable and script
  const pythonExecutable = isDev ? 'python' : path.join(process.resourcesPath, 'python', 'python.exe');
  const scriptPath = isDev 
    ? path.join(__dirname, 'serverdbc.py') 
    : path.join(process.resourcesPath, 'backend', 'serverdbc.py');
  
  // Check if the script exists
  if (!fs.existsSync(scriptPath)) {
    dialog.showErrorBox(
      'Backend Error',
      `Could not find the backend script at: ${scriptPath}`
    );
    return null;
  }
  
  console.log(`Starting Python backend: ${pythonExecutable} ${scriptPath}`);
  
  // Launch the Python process
  const process = spawn(pythonExecutable, [scriptPath], {
    stdio: 'pipe'
  });
  
  // Log stdout and stderr
  process.stdout.on('data', (data) => {
    console.log(`Python Backend: ${data}`);
  });
  
  process.stderr.on('data', (data) => {
    console.error(`Python Backend Error: ${data}`);
  });
  
  process.on('close', (code) => {
    console.log(`Python backend process exited with code ${code}`);
    pythonProcess = null;
  });
  
  return process;
}

// Create window when Electron is ready
app.whenReady().then(() => {
  // Start the Python backend first
  pythonProcess = startPythonBackend();
  
  // Wait a bit for the backend to initialize
  setTimeout(createWindow, 1000);
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Clean up the Python process when the app is quitting
app.on('quit', () => {
  if (pythonProcess) {
    console.log('Terminating Python backend process...');
    if (process.platform === 'win32') {
      // On Windows we need to kill the process group
      spawn('taskkill', ['/pid', pythonProcess.pid, '/f', '/t']);
    } else {
      // On Unix-like systems we can just kill the process
      pythonProcess.kill();
    }
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Exit kiosk mode with ESC key (for development and testing)
app.on('browser-window-created', (_, window) => {
  window.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'Escape') {
      if (window.isFullScreen()) {
        window.setFullScreen(false);
      } else if (window.isKiosk()) {
        window.setKiosk(false);
      }
    }
  });
});