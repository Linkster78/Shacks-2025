/// <reference types="@electron-forge/plugin-vite/forge-vite-env" />

export {};

declare global {
  interface Window {
    electronAPI: {
      minimize: () => void;
      maximize: () => void;
      close: () => void;
    };
  }
}
