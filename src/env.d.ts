/// <reference types="vite/client" />

// Add video file extensions for TypeScript imports
declare module "*.mp4" {
    const src: string;
    export default src;
  }
  
  declare module "*.mov" {
    const src: string;
    export default src;
  }
  
  declare module "*.MOV" {
    const src: string;
    export default src;
  }