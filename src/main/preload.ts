import { contextBridge, ipcRenderer } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  // Expose file system methods for accessing resources
  getAssetPath: (assetFileName: string): string => {
    // In development, assets are in different locations than in production
    if (process.env.NODE_ENV === 'development') {
      // For development - use the path relative to the project root
      return path.join(process.cwd(), 'src', 'assets', assetFileName);
    } else {
      // In production, the assets are typically in a resources directory
      return path.join(process.resourcesPath, 'assets', assetFileName);
    }
  },
  
  // Expose IPC communication
  ipcRenderer: {
    send: (channel: string, ...args: any[]): void => {
      ipcRenderer.send(channel, ...args);
    },
    on: (channel: string, listener: (...args: any[]) => void): void => {
      ipcRenderer.on(channel, (event, ...args) => listener(...args));
    },
    once: (channel: string, listener: (...args: any[]) => void): void => {
      ipcRenderer.once(channel, (event, ...args) => listener(...args));
    },
    removeListener: (channel: string, listener: (...args: any[]) => void): void => {
      ipcRenderer.removeListener(channel, listener);
    },
    invoke: (channel: string, ...args: any[]): Promise<any> => {
      return ipcRenderer.invoke(channel, ...args);
    }
  }
});