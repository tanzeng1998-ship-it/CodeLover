const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let win;
let diaryWin = null;
let chatWin = null;
let gameWin = null;
let settingsWin = null;
let isDragging = false;
let dragOffset = { x: 0, y: 0 };

// 禁用硬件加速，避免一些显示问题
app.disableHardwareAcceleration();

function createWindow() {
  win = new BrowserWindow({
    width: 320,
    height: 340,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    hasShadow: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // 初始位置 - 桌面右下角
  const { screen } = require('electron');
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;
  win.setPosition(width - 340, height - 380);

  win.loadFile('index.html');
}

function createDiaryWindow() {
  if (diaryWin && !diaryWin.isDestroyed()) {
    diaryWin.focus();
    return;
  }
  const { screen } = require('electron');
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  diaryWin = new BrowserWindow({
    width: 380,
    height: 560,
    frame: true,
    transparent: false,
    alwaysOnTop: false,
    resizable: true,
    title: '🐵 心情日记',
    x: Math.round((width - 380) / 2),
    y: Math.round((height - 560) / 2),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  diaryWin.setMenuBarVisibility(false);
  diaryWin.loadFile('diary.html');
  diaryWin.on('closed', () => { diaryWin = null; });
}

function createChatWindow() {
  if (chatWin && !chatWin.isDestroyed()) {
    chatWin.focus();
    return;
  }
  const { screen } = require('electron');
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  chatWin = new BrowserWindow({
    width: 660,
    height: 640,
    frame: true,
    transparent: false,
    alwaysOnTop: false,
    resizable: true,
    title: '🐵 AI 对话',
    x: Math.round((width - 560) / 2),
    y: Math.round((height - 640) / 2),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  chatWin.setMenuBarVisibility(false);
  chatWin.loadFile('chat.html');
  chatWin.on('closed', () => { chatWin = null; });
}

function createGameWindow() {
  if (gameWin && !gameWin.isDestroyed()) {
    gameWin.focus();
    return;
  }
  const { screen } = require('electron');
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  gameWin = new BrowserWindow({
    width: 800,
    height: 600,
    frame: true,
    transparent: false,
    alwaysOnTop: false,
    resizable: true,
    title: '🎮 小动物快跑',
    x: Math.round((width - 800) / 2),
    y: Math.round((height - 600) / 2),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  gameWin.setMenuBarVisibility(false);
  gameWin.loadFile('/Users/tanzeng/Desktop/game素材录制/小动物快跑.html');
  gameWin.on('closed', () => { gameWin = null; });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// 监听移动消息
ipcMain.on('move-pet', (event, x, y) => {
  if (isDragging) {
    win.setPosition(x, y);
  }
});

ipcMain.on('get-position', (event) => {
  const pos = win.getPosition();
  event.sender.send('position', pos[0], pos[1]);
});

ipcMain.on('start-drag', (event) => {
  isDragging = true;
});

ipcMain.on('end-drag', (event, x, y) => {
  isDragging = false;
  win.setPosition(x, y);
});

// 打开心情日记
ipcMain.on('open-diary', () => {
  createDiaryWindow();
});

// 打开对话框窗口
ipcMain.on('open-chat', () => {
  createChatWindow();
});

// 打开游戏窗口
ipcMain.on('open-game', () => {
  createGameWindow();
});

// 打开设置窗口
ipcMain.on('open-settings', () => {
  createSettingsWindow();
});

function createSettingsWindow() {
  if (settingsWin && !settingsWin.isDestroyed()) {
    settingsWin.focus();
    return;
  }
  const { screen } = require('electron');
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  settingsWin = new BrowserWindow({
    width: 360,
    height: 480,
    frame: true,
    transparent: false,
    alwaysOnTop: false,
    resizable: false,
    title: '⚙️ 个人设置',
    x: Math.round((width - 360) / 2),
    y: Math.round((height - 480) / 2),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  settingsWin.setMenuBarVisibility(false);
  settingsWin.loadFile('settings.html');
  settingsWin.on('closed', () => { settingsWin = null; });
}
