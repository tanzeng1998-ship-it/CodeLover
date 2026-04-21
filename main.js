const { app, BrowserWindow, ipcMain, getCurrentWindow } = require('electron');
const path = require('path');

let win;
let diaryWin = null;
let chatWin = null;
let gameWin = null;
let settingsWin = null;
let shopWin = null;
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
    width: 480,
    height: 640,
    frame: false,
    transparent: false,
    alwaysOnTop: false,
    resizable: true,
    title: '🐵 心情日记',
    x: Math.round((width - 480) / 2),
    y: Math.round((height - 640) / 2),
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
    if (win && !win.isDestroyed()) {
      win.hide();
    }
    return;
  }
  const { screen } = require('electron');
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  chatWin = new BrowserWindow({
    width: 900,
    height: 640,
    frame: false,
    transparent: false,
    alwaysOnTop: false,
    resizable: true,
    title: '🐵 AI 对话',
    x: Math.round((width - 900) / 2),
    y: Math.round((height - 640) / 2),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  chatWin.setMenuBarVisibility(false);
  chatWin.loadFile('chat.html');
  if (win && !win.isDestroyed()) {
    win.hide();
  }
  chatWin.on('closed', () => {
    chatWin = null;
    if (win && !win.isDestroyed()) {
      win.show();
    }
  });
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
    frame: false,
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
  gameWin.loadFile(path.join(__dirname, '小动物快跑.html'));
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

// 清除所有本地数据
ipcMain.on('clear-all-data', () => {
  if (win && !win.isDestroyed()) {
    win.webContents.executeJavaScript('localStorage.clear(); location.reload();');
  }
  if (chatWin && !chatWin.isDestroyed()) {
    chatWin.webContents.executeJavaScript('localStorage.clear(); location.reload();');
  }
  if (diaryWin && !diaryWin.isDestroyed()) {
    diaryWin.webContents.executeJavaScript('localStorage.clear(); location.reload();');
  }
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

// 打开商店窗口
ipcMain.on('open-shop', () => {
  createShopWindow();
});

// 游戏完成通知 - 转发给聊天窗口
ipcMain.on('game-complete', (event, gameData) => {
  if (chatWin && !chatWin.isDestroyed()) {
    chatWin.webContents.send('game-complete', gameData);
  }
});

// ===== BGM 背景音乐同步控制（主窗口持有音频，聊天页通过IPC控制） =====
ipcMain.on('bgm-toggle', (event) => {
  // 将切换命令转发给主窗口
  if (win && !win.isDestroyed()) {
    win.webContents.send('bgm-toggle');
  }
});

// 主窗口广播BGM状态变化给所有窗口
ipcMain.on('bgm-state-changed', (event, playing) => {
  if (chatWin && !chatWin.isDestroyed()) {
    chatWin.webContents.send('bgm-state-sync', playing);
  }
});

// 聊天页请求当前BGM状态
ipcMain.on('bgm-request-state', (event) => {
  if (win && !win.isDestroyed()) {
    win.webContents.send('bgm-request-state');
  }
});

// 聊天页请求关闭BGM（一起听歌时调用）
ipcMain.on('bgm-stop-for-music', (event) => {
  if (win && !win.isDestroyed()) {
    win.webContents.send('bgm-force-stop');
  }
});

// ===== 意图识别转发：主窗口发来的自然语言意图 =====
ipcMain.on('intent-music', (event, songName) => {
  // 主窗口检测到听歌意图，转发给聊天窗口自动播放
  if (chatWin && !chatWin.isDestroyed()) {
    chatWin.webContents.send('intent-music', songName);
  }
});

// 关闭子窗口
ipcMain.on('close-diary', () => {
  if (diaryWin && !diaryWin.isDestroyed()) diaryWin.close();
});
ipcMain.on('close-settings', () => {
  if (settingsWin && !settingsWin.isDestroyed()) settingsWin.close();
});
ipcMain.on('close-game', () => {
  if (gameWin && !gameWin.isDestroyed()) gameWin.close();
});

function createSettingsWindow() {
  if (settingsWin && !settingsWin.isDestroyed()) {
    settingsWin.focus();
    return;
  }
  const { screen } = require('electron');
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  settingsWin = new BrowserWindow({
    width: 480,
    height: 640,
    frame: false,
    transparent: false,
    alwaysOnTop: false,
    resizable: true,
    title: '⚙️ 个人设置',
    x: Math.round((width - 480) / 2),
    y: Math.round((height - 640) / 2),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  settingsWin.setMenuBarVisibility(false);
  settingsWin.loadFile('settings.html');
  settingsWin.on('closed', () => { settingsWin = null; });
}

function createShopWindow() {
  if (shopWin && !shopWin.isDestroyed()) {
    shopWin.focus();
    return;
  }
  const { screen } = require('electron');
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  shopWin = new BrowserWindow({
    width: 480,
    height: 640,
    frame: false,
    transparent: false,
    alwaysOnTop: false,
    resizable: true,
    title: '🛒 礼物商店',
    x: Math.round((width - 480) / 2),
    y: Math.round((height - 640) / 2),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  shopWin.setMenuBarVisibility(false);
  shopWin.loadFile('shop.html');
  shopWin.on('closed', () => { shopWin = null; });
}
