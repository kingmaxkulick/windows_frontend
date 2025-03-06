const builder = require('electron-builder');
const fs = require('fs-extra');
const path = require('path');

// Copy Python backend files to build directory
async function copyBackendFiles() {
  const backendDir = path.join(__dirname, 'backend');
  const destDir = path.join(__dirname, 'build', 'backend');
  
  // Ensure destination directory exists
  await fs.ensureDir(destDir);
  
  // Copy Python files
  await fs.copy('serverdbc.py', path.join(destDir, 'serverdbc.py'));
  
  // Copy any DBC files or other required assets
  if (fs.existsSync('dbc_files')) {
    await fs.copy('dbc_files', path.join(destDir, 'dbc_files'));
  }
  
  console.log('Backend files copied successfully');
}

// Build the application
async function buildApp() {
  try {
    // First copy the backend files
    await copyBackendFiles();
    
    // Build with electron-builder
    await builder.build({
      config: {
        appId: 'com.yourcompany.dashboard',
        productName: 'Vehicle Dashboard',
        extraResources: [
          {
            from: 'build/backend',
            to: 'backend',
            filter: ['**/*']
          }
        ],
        win: {
          target: 'nsis',
          icon: 'assets/icon.ico'
        },
        nsis: {
          oneClick: false,
          allowToChangeInstallationDirectory: true,
          createDesktopShortcut: true,
          createStartMenuShortcut: true
        }
      }
    });
    
    console.log('Build completed successfully');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

buildApp();