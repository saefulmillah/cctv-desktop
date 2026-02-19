const {
  app,
  autoUpdater,
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
let autoUpdaterConfigured = false;
let autoUpdaterReadyToInstall = false;
let autoUpdaterChecking = false;
let updatePromptOpen = false;
const PORT = 3005;
const SRC_DIR = __dirname;
const CONFIG_FILE_NAME = 'app-config.json';
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

const persistApiBaseUrl = async (apiBaseUrl) => {
  const config = await readConfig();
  await writeConfig({
    ...config,
    API_BASE_URL: apiBaseUrl,
  });
};

const normalizeConfigString = (value) => (typeof value === 'string' ? value.trim() : '');

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

const buildGitHubReleasesFeedUrl = (owner, repo) => {
  const encodedOwner = encodeURIComponent(owner);
  const encodedRepo = encodeURIComponent(repo);
  const target = getPlatformArchTarget();
  const currentVersion = app.getVersion();
  return `https://update.electronjs.org/${encodedOwner}/${encodedRepo}/${target}/${currentVersion}`;
};

const resolveFeedFromConfig = (config) => {
  const directFeedUrl = normalizeConfigString(config.AUTO_UPDATE_FEED_URL);
  const configOwner = normalizeConfigString(config.AUTO_UPDATE_GITHUB_OWNER);
  const configRepo = normalizeConfigString(config.AUTO_UPDATE_GITHUB_REPO);
  const packageRepo = parseGitHubRepoFromPackageJson();

  if (configOwner && configRepo) {
    return {
      feedUrl: buildGitHubReleasesFeedUrl(configOwner, configRepo),
      source: 'github-release-config',
      githubOwner: configOwner,
      githubRepo: configRepo,
      suggestedGitHubOwner: packageRepo && packageRepo.owner ? packageRepo.owner : '',
      suggestedGitHubRepo: packageRepo && packageRepo.repo ? packageRepo.repo : '',
      suggestedFeedUrl:
        packageRepo && packageRepo.owner && packageRepo.repo
          ? buildGitHubReleasesFeedUrl(packageRepo.owner, packageRepo.repo)
          : '',
    };
  }

  if (directFeedUrl) {
    return {
      feedUrl: directFeedUrl,
      source: 'config',
      githubOwner: configOwner,
      githubRepo: configRepo,
      suggestedGitHubOwner: packageRepo && packageRepo.owner ? packageRepo.owner : '',
      suggestedGitHubRepo: packageRepo && packageRepo.repo ? packageRepo.repo : '',
      suggestedFeedUrl:
        packageRepo && packageRepo.owner && packageRepo.repo
          ? buildGitHubReleasesFeedUrl(packageRepo.owner, packageRepo.repo)
          : '',
    };
  }

  if (packageRepo && packageRepo.owner && packageRepo.repo) {
    return {
      feedUrl: buildGitHubReleasesFeedUrl(packageRepo.owner, packageRepo.repo),
      source: 'github-release-package',
      githubOwner: configOwner,
      githubRepo: configRepo,
      suggestedGitHubOwner: packageRepo && packageRepo.owner ? packageRepo.owner : '',
      suggestedGitHubRepo: packageRepo && packageRepo.repo ? packageRepo.repo : '',
      suggestedFeedUrl:
        packageRepo && packageRepo.owner && packageRepo.repo
          ? buildGitHubReleasesFeedUrl(packageRepo.owner, packageRepo.repo)
          : '',
    };
  }

  const envFeedUrl = normalizeConfigString(process.env.AUTO_UPDATE_FEED_URL);
  if (envFeedUrl) {
    return {
      feedUrl: envFeedUrl,
      source: 'env',
      githubOwner: configOwner,
      githubRepo: configRepo,
      suggestedGitHubOwner: packageRepo && packageRepo.owner ? packageRepo.owner : '',
      suggestedGitHubRepo: packageRepo && packageRepo.repo ? packageRepo.repo : '',
      suggestedFeedUrl:
        packageRepo && packageRepo.owner && packageRepo.repo
          ? buildGitHubReleasesFeedUrl(packageRepo.owner, packageRepo.repo)
          : '',
    };
  }

  return {
    feedUrl: '',
    source: '',
    githubOwner: configOwner,
    githubRepo: configRepo,
    suggestedGitHubOwner: packageRepo && packageRepo.owner ? packageRepo.owner : '',
    suggestedGitHubRepo: packageRepo && packageRepo.repo ? packageRepo.repo : '',
    suggestedFeedUrl:
      packageRepo && packageRepo.owner && packageRepo.repo
        ? buildGitHubReleasesFeedUrl(packageRepo.owner, packageRepo.repo)
        : '',
  };
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

const resolveAutoUpdateFeedUrl = async () => {
  const config = await readConfig();
  const resolved = resolveFeedFromConfig(config);
  return resolved.feedUrl;
};

const getSquirrelUpdateExePath = () =>
  path.resolve(path.dirname(process.execPath), '..', 'Update.exe');

const hasSquirrelRuntime = () => {
  if (process.platform !== 'win32') {
    return false;
  }

  return fs.existsSync(getSquirrelUpdateExePath());
};

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

  if (!hasSquirrelRuntime()) {
    sendUpdateStatus({
      state: 'disabled',
      message: 'Auto update requires Squirrel installation (run the Squirrel Setup.exe installer).',
    });
    return;
  }

  const feedUrl = await resolveAutoUpdateFeedUrl();
  if (!feedUrl) {
    sendUpdateStatus({
      state: 'disabled',
      message: 'AUTO_UPDATE_FEED_URL is not configured.',
    });
    return;
  }

  try {
    autoUpdater.setFeedURL({ url: feedUrl });
    autoUpdaterConfigured = true;
    sendUpdateStatus({
      state: 'ready',
      message: 'Updater ready.',
    });
  } catch (error) {
    autoUpdaterConfigured = false;
    sendUpdateStatus({
      state: 'error',
      message: (error && error.message) || 'Failed to configure updater.',
    });
  }
};

const getAutoUpdateConfig = async () => {
  const config = await readConfig();
  const resolved = resolveFeedFromConfig(config);

  return {
    feedUrl: resolved.feedUrl,
    source: resolved.source,
    githubOwner: resolved.githubOwner,
    githubRepo: resolved.githubRepo,
    suggestedGitHubOwner: resolved.suggestedGitHubOwner,
    suggestedGitHubRepo: resolved.suggestedGitHubRepo,
    suggestedFeedUrl: resolved.suggestedFeedUrl,
    platformArchTarget: getPlatformArchTarget(),
    appVersion: app.getVersion(),
  };
};

const validateUrl = (rawValue, fieldName) => {
  let parsed;
  try {
    parsed = new URL(rawValue);
  } catch (_) {
    const error = new Error(`${fieldName} must be a valid URL.`);
    error.status = 400;
    throw error;
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    const error = new Error(`${fieldName} must use http or https.`);
    error.status = 400;
    throw error;
  }
};

const persistAutoUpdateConfig = async (payload) => {
  const nextFeedUrl = normalizeConfigString(payload && payload.feedUrl);
  const nextGithubOwner = normalizeConfigString(payload && payload.githubOwner);
  const nextGithubRepo = normalizeConfigString(payload && payload.githubRepo);
  const useGitHubRelease = Boolean(payload && payload.useGitHubRelease);
  const config = await readConfig();

  let resolvedFeedUrl = nextFeedUrl;
  let resolvedOwner = nextGithubOwner;
  let resolvedRepo = nextGithubRepo;

  if (useGitHubRelease || resolvedOwner || resolvedRepo) {
    if (!resolvedOwner || !resolvedRepo) {
      const error = new Error('GitHub owner and repository are required.');
      error.status = 400;
      throw error;
    }

    resolvedFeedUrl = buildGitHubReleasesFeedUrl(resolvedOwner, resolvedRepo);
    validateUrl(resolvedFeedUrl, 'AUTO_UPDATE_FEED_URL');
  } else {
    if (!resolvedFeedUrl) {
      const error = new Error('AUTO_UPDATE_FEED_URL cannot be empty.');
      error.status = 400;
      throw error;
    }
    validateUrl(resolvedFeedUrl, 'AUTO_UPDATE_FEED_URL');
    resolvedOwner = '';
    resolvedRepo = '';
  }

  await writeConfig({
    ...config,
    AUTO_UPDATE_FEED_URL: resolvedFeedUrl,
    AUTO_UPDATE_GITHUB_OWNER: resolvedOwner,
    AUTO_UPDATE_GITHUB_REPO: resolvedRepo,
  });

  await setupAutoUpdater();
  return getAutoUpdateConfig();
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
    sendUpdateStatus({
      state: 'downloading',
      message: 'Update found. Downloading...',
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

const toIpcError = (error) => ({
  status: error.status || 500,
  message: error.message || 'Internal server error',
  data: (error.payload && error.payload.data) || [],
});

const registerServiceHandlers = () => {
  ipcMain.handle('app:get-version', () => app.getVersion());

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

    if (!hasSquirrelRuntime()) {
      return {
        status: 200,
        data: {
          state: 'disabled',
          message: 'Auto update requires Squirrel installation (run the Squirrel Setup.exe installer).',
        },
      };
    }

    if (!autoUpdaterConfigured) {
      const feedUrl = await resolveAutoUpdateFeedUrl();
      if (!feedUrl) {
        return {
          status: 200,
          data: {
            state: 'disabled',
            message: 'AUTO_UPDATE_FEED_URL is not configured.',
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
    registerServiceHandlers();
    registerAutoUpdaterHandlers();
    createWindow();
    registerCloseShortcut();
    registerBranchListShortcut();
    registerApiBaseUrlShortcut();
    registerUpdateFeedConfigShortcut();
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

