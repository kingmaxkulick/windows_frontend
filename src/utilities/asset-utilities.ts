// Type definition for the electron API exposed by preload script
interface ElectronAPI {
    getAssetPath: (assetFileName: string) => string;
    ipcRenderer: {
      send: (channel: string, ...args: any[]) => void;
      on: (channel: string, listener: (...args: any[]) => void) => void;
      once: (channel: string, listener: (...args: any[]) => void) => void;
      removeListener: (channel: string, listener: (...args: any[]) => void) => void;
      invoke: (channel: string, ...args: any[]) => Promise<any>;
    };
  }
  
  // Declare the electron object on window
  declare global {
    interface Window {
      electron: ElectronAPI;
    }
  }
  
  /**
   * Gets the proper path to an asset file, whether in development or production
   * @param assetFileName The name of the asset file (e.g., "Comp 3.MOV")
   * @returns The full path to the asset
   */
  export function getAssetPath(assetFileName: string): string {
    // If running in Electron, use the Electron API
    if (window.electron?.getAssetPath) {
      return window.electron.getAssetPath(assetFileName);
    }
    
    // Fallback for development in browser (not Electron)
    return `/assets/${assetFileName}`;
  }
  
  /**
   * Gets the URL for a video asset
   * @param videoFileName The name of the video file (e.g., "Comp 3.MOV")
   * @returns The URL that can be used in a video element's src attribute
   */
  export function getVideoAssetUrl(videoFileName: string): string {
    // In Electron, we need file:// protocol for local files
    if (window.electron?.getAssetPath) {
      const filePath = window.electron.getAssetPath(videoFileName);
      // On Windows, we need to handle paths properly for the file:// protocol
      const fileUrl = `file://${filePath.replace(/\\/g, '/')}`;
      return fileUrl;
    }
    
    // For development in browser - try to find the asset in the public folder
    return `/assets/${videoFileName}`;
  }