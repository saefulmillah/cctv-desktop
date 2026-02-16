const {
  app,
  BrowserWindow,
  dialog,
  globalShortcut,
  ipcMain,
} = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');
const cameraService = require('./services/cameraService');

let mainWindow;
let localServer;
const PORT = 3005;
const SRC_DIR = __dirname;
const CONFIG_FILE_NAME = 'app-config.json';
const { promises: fsPromises } = fs;

const MIME_TYPES = {
  '.css': 'text/css',
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

const getContentType = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || 'application/octet-stream';
};

const getConfigFilePath = () => path.join(app.getPath('userData'), CONFIG_FILE_NAME);

const readConfig = async () => {
  const configPath = getConfigFilePath();
  try {
    const raw = await fsPromises.readFile(configPath, 'utf8');
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      return {};
    }
    throw error;
  }
};

const writeConfig = async (config) => {
  const configPath = getConfigFilePath();
  const content = `${JSON.stringify(config, null, 2)}\n`;
  await fsPromises.writeFile(configPath, content, 'utf8');
};

const loadPersistedApiBaseUrl = async () => {
  const config = await readConfig();
  const persistedApiBaseUrl = config.API_BASE_URL;
  if (typeof persistedApiBaseUrl !== 'string' || !persistedApiBaseUrl.trim()) {
    return;
  }

  cameraService.setApiBaseUrl(persistedApiBaseUrl);
};

const persistApiBaseUrl = async (apiBaseUrl) => {
  const config = await readConfig();
  await writeConfig({
    ...config,
    API_BASE_URL: apiBaseUrl,
  });
};

const startLocalServer = () =>
  new Promise((resolve, reject) => {
    localServer = http.createServer((req, res) => {
      const requestPath = decodeURIComponent((req.url || '/').split('?')[0]);
      const safePath = path.normalize(requestPath).replace(/^(\.\.[\\/])+/, '');
      const relativePath = safePath === '/' ? '/index.html' : safePath;
      const filePath = path.join(SRC_DIR, relativePath);

      if (!filePath.startsWith(SRC_DIR)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('Forbidden');
        return;
      }

      fs.readFile(filePath, (error, data) => {
        if (error) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Not Found');
          return;
        }

        res.writeHead(200, { 'Content-Type': getContentType(filePath) });
        res.end(data);
      });
    });

    localServer.once('error', reject);
    localServer.listen(PORT, '127.0.0.1', () => {
      localServer.removeListener('error', reject);
      resolve();
    });
  });

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 600,
    height: 500,
    frame: true, // 👈 no title bar
    alwaysOnTop: false, // 👈 floating
    resizable: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadURL(`http://127.0.0.1:${PORT}/index.html`);
};

const registerCloseShortcut = () => {
  const registered = globalShortcut.register('Shift+X', async () => {
    const targetWindow = mainWindow && !mainWindow.isDestroyed() ? mainWindow : null;
    const response = await dialog.showMessageBox(targetWindow, {
      type: 'question',
      buttons: ['Cancel', 'Close App'],
      defaultId: 1,
      cancelId: 0,
      title: 'Close Application',
      message: 'Do you want to close this application?',
    });

    if (response.response === 1) {
      app.quit();
    }
  });

  if (!registered) {
    console.error('Failed to register shortcut Shift+X');
  }
};

const registerBranchListShortcut = () => {
  const registered = globalShortcut.register('Shift+L', () => {
    if (!mainWindow || mainWindow.isDestroyed()) {
      return;
    }

    mainWindow.webContents.send('shortcut:open-branch-picker');
  });

  if (!registered) {
    console.error('Failed to register shortcut Shift+L');
  }
};

const registerApiBaseUrlShortcut = () => {
  const registered = globalShortcut.register('Shift+K', () => {
    if (!mainWindow || mainWindow.isDestroyed()) {
      return;
    }

    mainWindow.webContents.send('shortcut:open-api-base-url-config');
  });

  if (!registered) {
    console.error('Failed to register shortcut Shift+K');
  }
};

const toIpcError = (error) => ({
  status: error.status || 500,
  message: error.message || 'Internal server error',
  data: (error.payload && error.payload.data) || [],
});

const registerServiceHandlers = () => {
  ipcMain.handle('camera-service:get-health', async () => {
    try {
      return await cameraService.getHealth();
    } catch (error) {
      return toIpcError(error);
    }
  });

  ipcMain.handle('camera-service:get-api-docs-url', () => cameraService.getApiDocsUrl());
  ipcMain.handle('camera-service:get-api-base-url', () => cameraService.getApiBaseUrl());
  ipcMain.handle('camera-service:set-api-base-url', async (_event, nextApiBaseUrl) => {
    const previousApiBaseUrl = cameraService.getApiBaseUrl();
    try {
      const updatedApiBaseUrl = cameraService.setApiBaseUrl(nextApiBaseUrl);
      await persistApiBaseUrl(updatedApiBaseUrl);
      return {
        status: 200,
        data: {
          apiBaseUrl: updatedApiBaseUrl,
        },
      };
    } catch (error) {
      try {
        cameraService.setApiBaseUrl(previousApiBaseUrl);
      } catch (_) {
        // Ignore rollback error and return the original failure.
      }
      return toIpcError(error);
    }
  });

  ipcMain.handle('camera-service:get-branches', async (_event, query) => {
    try {
      return await cameraService.getBranches(query);
    } catch (error) {
      return toIpcError(error);
    }
  });

  ipcMain.handle('camera-service:get-gates', async (_event, query) => {
    try {
      return await cameraService.getGates(query);
    } catch (error) {
      return toIpcError(error);
    }
  });

  ipcMain.handle('camera-service:get-branch-pages', async (_event, branchId) => {
    try {
      return await cameraService.getBranchPages(branchId);
    } catch (error) {
      return toIpcError(error);
    }
  });

  ipcMain.handle(
    'camera-service:get-cameras-by-branch',
    async (_event, branchId, page) => {
      try {
        return await cameraService.getCamerasByBranch(branchId, page);
      } catch (error) {
        return toIpcError(error);
      }
    }
  );

  ipcMain.handle('camera-service:get-cameras', async (_event, query) => {
    try {
      return await cameraService.getCameras(query);
    } catch (error) {
      return toIpcError(error);
    }
  });

  ipcMain.handle('camera-service:create-camera', async (_event, payload) => {
    try {
      return await cameraService.createCamera(payload);
    } catch (error) {
      return toIpcError(error);
    }
  });
};

app.whenReady().then(async () => {
  try {
    await startLocalServer();
    await loadPersistedApiBaseUrl();
    registerServiceHandlers();
    createWindow();
    registerCloseShortcut();
    registerBranchListShortcut();
    registerApiBaseUrlShortcut();
  } catch (error) {
    console.error(`Failed to start local server on port ${PORT}:`, error);
    app.quit();
  }
});

app.on('window-all-closed', () => {
  if (localServer) {
    localServer.close();
  }

  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
