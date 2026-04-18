const {
  app,
  BrowserWindow,
  dialog,
  globalShortcut,
  ipcMain,
} = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const fs = require('fs');
const http = require('http');
const cameraService = require('./services/cameraService');

let mainWindow;
let localServer;
let autoUpdaterConfigured = false;
let autoUpdaterReadyToInstall = false;
let autoUpdaterChecking = false;
let updatePromptOpen = false;
const PORT = 3005;
const SRC_DIR = __dirname;
const CONFIG_FILE_NAME = 'app-config.json';
const WORKSPACE_STATE_KEY = 'WORKSPACE_STATE';
const APP_PACKAGE_JSON_PATH = path.resolve(__dirname, '..', 'package.json');
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

const loadPersistedApiAuthToken = async () => {
  const config = await readConfig();
  const persistedApiAuthToken = config.API_AUTH_TOKEN;
  if (typeof persistedApiAuthToken !== 'string') {
    return;
  }

  cameraService.setApiAuthToken(persistedApiAuthToken);
};

const persistApiBaseUrl = async (apiBaseUrl) => {
  const config = await readConfig();
  await writeConfig({
    ...config,
    API_BASE_URL: apiBaseUrl,
  });
};

const persistApiConfig = async ({ apiBaseUrl, apiAuthToken }) => {
  const config = await readConfig();
  await writeConfig({
    ...config,
    API_BASE_URL: apiBaseUrl,
    API_AUTH_TOKEN: String(apiAuthToken || ''),
  });
};

const getPersistedWorkspaceState = async () => {
  const config = await readConfig();
  const state = config[WORKSPACE_STATE_KEY];
  return state && typeof state === 'object' ? state : null;
};

const persistWorkspaceState = async (workspaceState) => {
  const config = await readConfig();
  await writeConfig({
    ...config,
    [WORKSPACE_STATE_KEY]: workspaceState,
  });
};

const clearPersistedWorkspaceState = async () => {
  const config = await readConfig();
  if (!(WORKSPACE_STATE_KEY in config)) {
    return;
  }
  const nextConfig = { ...config };
  delete nextConfig[WORKSPACE_STATE_KEY];
  await writeConfig(nextConfig);
};

const parseGitHubRepoFromPackageJson = () => {
  try {
    const raw = fs.readFileSync(APP_PACKAGE_JSON_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    const repository = parsed && parsed.repository ? parsed.repository : null;
    const repoValue =
      typeof repository === 'string'
        ? repository
        : repository && typeof repository.url === 'string'
          ? repository.url
          : '';
    if (!repoValue) {
      return null;
    }

    const cleaned = repoValue.split('?')[0].replace(/\/+$/, '');
    const match = cleaned.match(/github\.com[/:]([^/]+)\/([^/]+?)(?:\.git)?$/i);
    if (!match) {
      return null;
    }

    return {
      owner: match[1],
      repo: match[2],
    };
  } catch (_) {
    return null;
  }
};

const getPlatformArchTarget = () => `${process.platform}-${process.arch}`;

const parseBuilderPublishFromPackageJson = () => {
  try {
    const raw = fs.readFileSync(APP_PACKAGE_JSON_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    const publish = parsed && parsed.build ? parsed.build.publish : null;
    const list = Array.isArray(publish) ? publish : publish ? [publish] : [];
    const githubProvider = list.find(
      (item) =>
        item &&
        typeof item === 'object' &&
        String(item.provider || '').toLowerCase() === 'github'
    );

    if (!githubProvider) {
      return null;
    }

    const owner = String(githubProvider.owner || '').trim();
    const repo = String(githubProvider.repo || '').trim();
    if (!owner || !repo) {
      return null;
    }

    return { owner, repo };
  } catch (_) {
    return null;
  }
};

const sendUpdateStatus = (payload) => {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return;
  }

  mainWindow.webContents.send('app-update:status', payload);
};

const toUpdateError = (error, fallbackMessage) => ({
  status: (error && error.status) || 500,
  message: (error && error.message) || fallbackMessage,
});

const getAutoUpdateRepository = () =>
  parseBuilderPublishFromPackageJson() || parseGitHubRepoFromPackageJson();

const toGitHubLatestReleaseUrl = (owner, repo) =>
  `https://github.com/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/releases/latest`;

const setupAutoUpdater = async () => {
  autoUpdaterConfigured = false;

  if (!app.isPackaged) {
    sendUpdateStatus({
      state: 'disabled',
      message: 'Auto update only works in packaged app.',
    });
    return;
  }

  if (process.platform !== 'win32') {
    sendUpdateStatus({
      state: 'disabled',
      message: 'Auto update is currently configured for Windows.',
    });
    return;
  }

  const repository = getAutoUpdateRepository();
  if (!repository) {
    sendUpdateStatus({
      state: 'disabled',
      message: 'GitHub publish target is not configured in package.json build.publish.',
    });
    return;
  }

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = false;
  autoUpdaterConfigured = true;
  sendUpdateStatus({
    state: 'ready',
    message: 'Updater ready.',
  });
};

const getAutoUpdateConfig = async () => {
  const repository = getAutoUpdateRepository();
  const owner = repository && repository.owner ? repository.owner : '';
  const repo = repository && repository.repo ? repository.repo : '';
  const latestReleaseUrl = owner && repo ? toGitHubLatestReleaseUrl(owner, repo) : '';

  return {
    feedUrl: latestReleaseUrl,
    source: 'electron-updater-github',
    githubOwner: owner,
    githubRepo: repo,
    suggestedGitHubOwner: owner,
    suggestedGitHubRepo: repo,
    suggestedFeedUrl: latestReleaseUrl,
    platformArchTarget: getPlatformArchTarget(),
    appVersion: app.getVersion(),
    mode: 'electron-updater',
    message:
      'Feed URL is managed by electron-builder build.publish. Runtime custom feed override is disabled.',
  };
};

const persistAutoUpdateConfig = async (payload) => {
  void payload;
  const error = new Error(
    'Runtime update feed config is disabled in electron-updater mode. Update package.json build.publish instead.'
  );
  error.status = 400;
  throw error;
};

const promptInstallUpdate = async () => {
  if (updatePromptOpen) {
    return;
  }

  updatePromptOpen = true;
  try {
    const targetWindow = mainWindow && !mainWindow.isDestroyed() ? mainWindow : null;
    const response = await dialog.showMessageBox(targetWindow, {
      type: 'question',
      buttons: ['Later', 'Install now'],
      defaultId: 1,
      cancelId: 0,
      title: 'Update Ready',
      message: 'A new version has been downloaded.',
      detail: 'Do you want to close the app and install the update now?',
    });

    if (response.response === 1) {
      sendUpdateStatus({
        state: 'installing',
        message: 'Installing update...',
      });
      setImmediate(() => autoUpdater.quitAndInstall());
      return;
    }

    sendUpdateStatus({
      state: 'downloaded',
      message: 'Update downloaded. Install is postponed.',
    });
  } finally {
    updatePromptOpen = false;
  }
};

const registerAutoUpdaterHandlers = () => {
  autoUpdater.on('checking-for-update', () => {
    autoUpdaterChecking = true;
    sendUpdateStatus({
      state: 'checking',
      message: 'Checking for update...',
    });
  });

  autoUpdater.on('update-available', () => {
    autoUpdaterChecking = true;
    sendUpdateStatus({
      state: 'downloading',
      message: 'Update found. Downloading...',
      percent: 0,
    });
  });

  autoUpdater.on('download-progress', (progress) => {
    const percent = progress && Number.isFinite(progress.percent) ? progress.percent : 0;
    sendUpdateStatus({
      state: 'downloading',
      message: `Downloading update... ${percent.toFixed(1)}%`,
      percent,
    });
  });

  autoUpdater.on('update-not-available', () => {
    autoUpdaterChecking = false;
    sendUpdateStatus({
      state: 'up_to_date',
      message: 'No update available.',
    });
  });

  autoUpdater.on('error', (error) => {
    autoUpdaterChecking = false;
    sendUpdateStatus({
      state: 'error',
      message: (error && error.message) || 'Failed to run updater.',
    });
  });

  autoUpdater.on('update-downloaded', async () => {
    autoUpdaterChecking = false;
    autoUpdaterReadyToInstall = true;
    sendUpdateStatus({
      state: 'downloaded',
      message: 'Update downloaded. Waiting for confirmation.',
      percent: 100,
    });
    await promptInstallUpdate();
  });
};

const checkForAppUpdate = async () => {
  if (!autoUpdaterConfigured) {
    return {
      status: 400,
      message: 'Auto updater is not configured.',
    };
  }

  if (autoUpdaterChecking) {
    return {
      status: 409,
      message: 'Update check is already in progress.',
    };
  }

  try {
    await autoUpdater.checkForUpdates();
    return {
      status: 200,
      data: {
        checking: true,
      },
    };
  } catch (error) {
    return toUpdateError(error, 'Failed to check for app update.');
  }
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
    frame: true, // standard window frame
    alwaysOnTop: false,
    resizable: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      backgroundThrottling: false,
    },
  });

  mainWindow.loadURL(`http://127.0.0.1:${PORT}/index.html`);
  mainWindow.webContents.on('console-message', (_event, level, message, line, sourceId) => {
    const sourceLabel = sourceId ? `${sourceId}:${line}` : `renderer:${line}`;
    const levelLabel =
      level === 3 ? 'error' : level === 2 ? 'warn' : level === 1 ? 'info' : 'debug';
    try {
      console.log(`[renderer:${levelLabel}] ${sourceLabel} ${message}`);
    } catch (error) {
      if (!(error && error.code === 'EPIPE')) {
        throw error;
      }
    }
  });
  mainWindow.maximize();
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

const registerUpdateFeedConfigShortcut = () => {
  const registered = globalShortcut.register('Shift+U', () => {
    if (!mainWindow || mainWindow.isDestroyed()) {
      return;
    }

    mainWindow.webContents.send('shortcut:open-update-feed-config');
  });

  if (!registered) {
    console.error('Failed to register shortcut Shift+U');
  }
};

const registerHelpShortcut = () => {
  const registered = globalShortcut.register('Shift+H', () => {
    if (!mainWindow || mainWindow.isDestroyed()) {
      return;
    }

    mainWindow.webContents.send('shortcut:open-help');
  });

  if (!registered) {
    console.error('Failed to register shortcut Shift+H');
  }
};

const registerQuickSearchShortcut = () => {
  const registered = globalShortcut.register('Control+K', () => {
    if (!mainWindow || mainWindow.isDestroyed()) {
      return;
    }

    mainWindow.webContents.send('shortcut:open-camera-search');
  });

  if (!registered) {
    console.error('Failed to register shortcut Ctrl+K');
  }
};

const registerLayoutShortcut = () => {
  const registered = globalShortcut.register('Shift+G', () => {
    if (!mainWindow || mainWindow.isDestroyed()) {
      return;
    }

    mainWindow.webContents.send('shortcut:open-layout-config');
  });

  if (!registered) {
    console.error('Failed to register shortcut Shift+G');
  }
};

const registerFocusShortcut = () => {
  const registered = globalShortcut.register('Shift+F', () => {
    if (!mainWindow || mainWindow.isDestroyed()) {
      return;
    }

    mainWindow.webContents.send('shortcut:enter-focus-mode');
  });

  if (!registered) {
    console.error('Failed to register shortcut Shift+F');
  }
};

const registerNormalModeShortcut = () => {
  const registered = globalShortcut.register('Shift+N', () => {
    if (!mainWindow || mainWindow.isDestroyed()) {
      return;
    }

    mainWindow.webContents.send('shortcut:leave-focus-mode');
  });

  if (!registered) {
    console.error('Failed to register shortcut Shift+N');
  }
};

const registerReloadShortcut = () => {
  const registered = globalShortcut.register('Shift+R', () => {
    if (!mainWindow || mainWindow.isDestroyed()) {
      return;
    }

    mainWindow.webContents.send('shortcut:reload-streams');
  });

  if (!registered) {
    console.error('Failed to register shortcut Shift+R');
  }
};

const toIpcError = (error) => ({
  status: error.status || 500,
  message: error.message || 'Internal server error',
  data: (error.payload && error.payload.data) || [],
});

const registerServiceHandlers = () => {
  ipcMain.handle('app:get-version', () => app.getVersion());
  ipcMain.handle('app-state:get-workspace', async () => {
    try {
      return {
        status: 200,
        data: await getPersistedWorkspaceState(),
      };
    } catch (error) {
      return toIpcError(error);
    }
  });
  ipcMain.handle('app-state:save-workspace', async (_event, payload) => {
    try {
      await persistWorkspaceState(payload && typeof payload === 'object' ? payload : null);
      return {
        status: 200,
        data: payload || null,
      };
    } catch (error) {
      return toIpcError(error);
    }
  });
  ipcMain.handle('app-state:clear-workspace', async () => {
    try {
      await clearPersistedWorkspaceState();
      return {
        status: 200,
        data: null,
      };
    } catch (error) {
      return toIpcError(error);
    }
  });

  ipcMain.handle('camera-service:get-health', async () => {
    try {
      return await cameraService.getHealth();
    } catch (error) {
      return toIpcError(error);
    }
  });

  ipcMain.handle('camera-service:get-sos-alerts', async () => {
    try {
      return {
        status: 200,
        data: await cameraService.getSosAlerts(),
      };
    } catch (error) {
      return toIpcError(error);
    }
  });

  ipcMain.handle('camera-service:get-open-sos-tickets', async () => {
    try {
      return {
        status: 200,
        data: await cameraService.getOpenSosTickets(),
      };
    } catch (error) {
      return toIpcError(error);
    }
  });

  ipcMain.handle('camera-service:get-sos-ticket-detail', async (_event, ticketNo) => {
    try {
      return {
        status: 200,
        data: await cameraService.getSosTicketDetail(ticketNo),
      };
    } catch (error) {
      return toIpcError(error);
    }
  });

  ipcMain.handle('camera-service:dispatch-sos-ticket', async (_event, payload) => {
    try {
      return {
        status: 200,
        data: await cameraService.dispatchSosTicket(payload),
      };
    } catch (error) {
      return toIpcError(error);
    }
  });

  ipcMain.handle('camera-service:complete-sos-ticket', async (_event, ticketNo, payload) => {
    try {
      return {
        status: 200,
        data: await cameraService.completeSosTicket(ticketNo, payload),
      };
    } catch (error) {
      return toIpcError(error);
    }
  });

  ipcMain.handle('camera-service:get-api-docs-url', () => cameraService.getApiDocsUrl());
  ipcMain.handle('camera-service:get-api-base-url', () => cameraService.getApiBaseUrl());
  ipcMain.handle('camera-service:get-api-auth-token', () => cameraService.getApiAuthToken());
  ipcMain.handle(
    'camera-service:check-api-base-url',
    async (_event, candidateApiBaseUrl, candidateApiAuthToken) => {
    try {
      return {
        status: 200,
        data: await cameraService.checkApiBaseUrl(candidateApiBaseUrl, candidateApiAuthToken),
      };
    } catch (error) {
      return toIpcError(error);
    }
  });
  ipcMain.handle(
    'camera-service:set-api-config',
    async (_event, nextApiBaseUrl, nextApiAuthToken) => {
    const previousApiBaseUrl = cameraService.getApiBaseUrl();
    const previousApiAuthToken = cameraService.getApiAuthToken();
    try {
      const updatedApiBaseUrl = cameraService.setApiBaseUrl(nextApiBaseUrl);
      const updatedApiAuthToken = cameraService.setApiAuthToken(nextApiAuthToken);
      await persistApiConfig({
        apiBaseUrl: updatedApiBaseUrl,
        apiAuthToken: updatedApiAuthToken,
      });
      return {
        status: 200,
        data: {
          apiBaseUrl: updatedApiBaseUrl,
          apiAuthToken: updatedApiAuthToken,
        },
      };
    } catch (error) {
      try {
        cameraService.setApiBaseUrl(previousApiBaseUrl);
        cameraService.setApiAuthToken(previousApiAuthToken);
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

  ipcMain.handle('camera-service:get-map-branches', async () => {
    try {
      return await cameraService.getMapBranches();
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

  ipcMain.handle('camera-service:get-gate-alerts', async (_event, query) => {
    try {
      return await cameraService.getGateAlerts(query);
    } catch (error) {
      return toIpcError(error);
    }
  });

  ipcMain.handle('camera-service:get-gate-alert-detail', async (_event, gateId) => {
    try {
      return await cameraService.getGateAlertDetail(gateId);
    } catch (error) {
      return toIpcError(error);
    }
  });

  ipcMain.handle('camera-service:get-map-network-arcs', async (_event, query) => {
    try {
      return await cameraService.getMapNetworkArcs(query);
    } catch (error) {
      return toIpcError(error);
    }
  });

  ipcMain.handle('camera-service:get-map-weather', async (_event, query) => {
    try {
      return await cameraService.getMapWeather(query);
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

  ipcMain.handle('camera-service:get-map-assets', async (_event, query) => {
    try {
      return await cameraService.getMapAssets(query);
    } catch (error) {
      return toIpcError(error);
    }
  });

  ipcMain.handle('camera-service:get-map-asset-detail', async (_event, assetType, id) => {
    try {
      return await cameraService.getMapAssetDetail(assetType, id);
    } catch (error) {
      return toIpcError(error);
    }
  });
  ipcMain.handle('camera-service:search-cameras', async (_event, query) => {
    try {
      return await cameraService.searchCameras(query);
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

  ipcMain.handle('app-update:get-status', async () => {
    if (!app.isPackaged) {
      return {
        status: 200,
        data: {
          state: 'disabled',
          message: 'Auto update only works in packaged app.',
        },
      };
    }

    if (process.platform !== 'win32') {
      return {
        status: 200,
        data: {
          state: 'disabled',
          message: 'Auto update is currently configured for Windows.',
        },
      };
    }

    if (!autoUpdaterConfigured) {
      const repository = getAutoUpdateRepository();
      if (!repository) {
        return {
          status: 200,
          data: {
            state: 'disabled',
            message: 'GitHub publish target is not configured in package.json build.publish.',
          },
        };
      }
    }

    if (autoUpdaterReadyToInstall) {
      return {
        status: 200,
        data: {
          state: 'downloaded',
          message: 'Update downloaded. Waiting for installation confirmation.',
        },
      };
    }

    return {
      status: 200,
      data: {
        state: 'ready',
        message: 'Updater ready.',
      },
    };
  });

  ipcMain.handle('app-update:check', async () => checkForAppUpdate());
  ipcMain.handle('app-update:get-config', async () => {
    try {
      return {
        status: 200,
        data: await getAutoUpdateConfig(),
      };
    } catch (error) {
      return toUpdateError(error, 'Failed to read auto update configuration.');
    }
  });
  ipcMain.handle('app-update:set-config', async (_event, payload) => {
    try {
      return {
        status: 200,
        data: await persistAutoUpdateConfig(payload),
      };
    } catch (error) {
      return toUpdateError(error, 'Failed to save auto update configuration.');
    }
  });
};

app.whenReady().then(async () => {
  try {
    await startLocalServer();
    await loadPersistedApiBaseUrl();
    await loadPersistedApiAuthToken();
    registerServiceHandlers();
    registerAutoUpdaterHandlers();
    createWindow();
    await setupAutoUpdater();
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

