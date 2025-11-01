import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import started from 'electron-squirrel-startup';

fs.mkdirSync('partials', { recursive: true });

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

let mainWindow: BrowserWindow | null = null;
let popupWindow: BrowserWindow | null = null;

// Path to the user data file
const dataPath = path.join(app.getPath('userData'), 'data.json');

function readLaunchData(): { launchCount: number } {
  try {
    const data = fs.readFileSync(dataPath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { launchCount: 0 };
  }
}

function saveLaunchData(data: { launchCount: number }) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

const createMainWindow = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    icon: path.join(__dirname, '../assets/icons/app.ico'),
    resizable: true,
    alwaysOnTop: true,
    fullscreen : true,
    titleBarStyle: 'hidden',
    titleBarOverlay: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      sandbox: false,
      additionalArguments: process.argv.slice(1)
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }
};

const createFirstTimeWindow = () => {
  popupWindow = new BrowserWindow({
    width: 690,
    height: 420,
    frame: false,
    resizable: false,
    minimizable: false,
    maximizable: false,
    alwaysOnTop: true,
    modal: true,
    parent: mainWindow ?? undefined,
    transparent: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      sandbox: false,
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    popupWindow.loadURL(`${MAIN_WINDOW_VITE_DEV_SERVER_URL}/firstTime.html`);
  } else {
    popupWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/firstTime.html`)
    );
  }
};

app.on('ready', () => {
  const data = readLaunchData();
  data.launchCount += 1;
  saveLaunchData(data);

  createMainWindow();

  if (data.launchCount <= 1) {
    createFirstTimeWindow();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
});

ipcMain.on('window-control', (event, action) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win) return;

  switch (action) {
    case 'minimize':
      win.minimize();
      break;
    case 'maximize':
      win.isMaximized() ? win.unmaximize() : win.maximize();
      break;
    case 'close':
      win.close();
      break;
  }
});
