const gridEl = document.querySelector('.grid');
const pickerEl = document.getElementById('branchPicker');
const branchListEl = document.getElementById('branchList');
const pickerStatusEl = document.getElementById('pickerStatus');
const closePickerBtn = document.getElementById('closePickerBtn');
const toolbarEl = document.getElementById('toolbar');
const toolbarMenuBtn = document.getElementById('toolbarMenuBtn');
const toolbarMenuPanel = document.getElementById('toolbarMenuPanel');
const menuApiConfigBtn = document.getElementById('menuApiConfigBtn');
const menuUpdateInfoBtn = document.getElementById('menuUpdateInfoBtn');
const menuToggleDetailsBtn = document.getElementById('menuToggleDetailsBtn');
const menuHelpBtn = document.getElementById('menuHelpBtn');
const toolbarDetailsEl = document.getElementById('toolbarDetails');
const updateProgressWrapEl = document.getElementById('updateProgressWrap');
const updateProgressBarEl = document.getElementById('updateProgressBar');
const updateProgressTextEl = document.getElementById('updateProgressText');
const updateStatusBtn = document.getElementById('updateStatusBtn');
const currentBranchEl = document.getElementById('currentBranch');
const installedVersionEl = document.getElementById('installedVersion');
const pagingControlEl = document.getElementById('pagingControl');
const prevPageBtn = document.getElementById('prevPageBtn');
const nextPageBtn = document.getElementById('nextPageBtn');
const pageInfoEl = document.getElementById('pageInfo');
const apiBaseUrlEl = document.getElementById('apiBaseUrl');
const checkUpdateBtn = document.getElementById('checkUpdateBtn');
const reloadStreamBtn = document.getElementById('reloadStreamBtn');
const updateStatusEl = document.getElementById('updateStatus');
const apiConfigModalEl = document.getElementById('apiConfigModal');
const closeApiConfigBtn = document.getElementById('closeApiConfigBtn');
const apiConfigFormEl = document.getElementById('apiConfigForm');
const apiBaseUrlInputEl = document.getElementById('apiBaseUrlInput');
const updateConfigModalEl = document.getElementById('updateConfigModal');
const closeUpdateConfigBtn = document.getElementById('closeUpdateConfigBtn');
const updateConfigFormEl = document.getElementById('updateConfigForm');
const saveUpdateConfigBtn = document.getElementById('saveUpdateConfigBtn');
const updateFeedUrlInputEl = document.getElementById('updateFeedUrlInput');
const updateGithubOwnerInputEl = document.getElementById('updateGithubOwnerInput');
const updateGithubRepoInputEl = document.getElementById('updateGithubRepoInput');
const useGithubReleaseCheckboxEl = document.getElementById('useGithubReleaseCheckbox');
const updateInfoStateEl = document.getElementById('updateInfoState');
const updateInfoProgressEl = document.getElementById('updateInfoProgress');
const updateInfoSourceEl = document.getElementById('updateInfoSource');
const updateInfoMessageEl = document.getElementById('updateInfoMessage');
const helpModalEl = document.getElementById('helpModal');
const closeHelpBtn = document.getElementById('closeHelpBtn');

const hlsPlayers = [];
const retryTimers = [];
let activeBranch = null;
let activePage = 1;
let totalPages = 1;
let lastApiConfigOpenAt = 0;
let lastUpdateConfigOpenAt = 0;
let toolbarVisible = true;
let isCheckingUpdate = false;
let isRefreshingStreams = false;
let toolbarPinnedByMouse = false;
let toolbarHideTimer = null;
let toolbarDetailsVisible = false;
let latestUpdatePayload = null;

const setApiBaseUrlText = (value) => {
  apiBaseUrlEl.textContent = `API: ${value || '-'}`;
};

const setInstalledVersionText = (value) => {
  installedVersionEl.textContent = `Version: ${value || '-'}`;
};

const setUpdateStatusText = (message) => {
  updateStatusEl.textContent = `Update: ${message || '-'}`;
};

const setToolbarDetailsVisible = (visible) => {
  toolbarDetailsVisible = visible;
  toolbarDetailsEl.classList.toggle('hidden', !visible);
  menuToggleDetailsBtn.textContent = visible ? 'Hide Details' : 'Show Details';
};

const setUpdateProgressVisible = (visible) => {
  updateProgressWrapEl.classList.toggle('hidden', !visible);
};

const setUpdateProgress = (percent) => {
  const safePercent = Number.isFinite(percent) ? Math.max(0, Math.min(100, percent)) : 0;
  updateProgressBarEl.style.width = `${safePercent}%`;
  updateProgressTextEl.textContent = `${safePercent.toFixed(1)}%`;
};

const syncUpdateInfoCard = (payload, configData) => {
  const nextPayload = payload && typeof payload === 'object' ? payload : latestUpdatePayload;
  latestUpdatePayload = nextPayload || latestUpdatePayload;

  const state = latestUpdatePayload && latestUpdatePayload.state ? latestUpdatePayload.state : '-';
  const message =
    latestUpdatePayload && latestUpdatePayload.message ? latestUpdatePayload.message : '-';
  const percent =
    latestUpdatePayload && Number.isFinite(Number(latestUpdatePayload.percent))
      ? Number(latestUpdatePayload.percent)
      : 0;

  let source = '-';
  if (configData && typeof configData === 'object') {
    if (configData.githubOwner && configData.githubRepo) {
      source = `${configData.githubOwner}/${configData.githubRepo}`;
    } else if (configData.feedUrl) {
      source = configData.feedUrl;
    }
  }

  updateInfoStateEl.textContent = String(state);
  updateInfoProgressEl.textContent = `${percent.toFixed(1)}%`;
  updateInfoSourceEl.textContent = source;
  updateInfoMessageEl.textContent = String(message);
};

const setUpdateButtonState = (checking) => {
  isCheckingUpdate = checking;
  checkUpdateBtn.disabled = checking;
  checkUpdateBtn.textContent = checking ? 'Checking...' : 'Check Update';
};

const setReloadButtonState = (refreshing) => {
  isRefreshingStreams = refreshing;
  const hasActiveBranch = Boolean(activeBranch && activeBranch.id);
  reloadStreamBtn.disabled = refreshing || !hasActiveBranch;
  reloadStreamBtn.innerHTML = refreshing
    ? '<span class="btn-icon" aria-hidden="true">&#x21bb;</span><span>Refreshing...</span>'
    : '<span class="btn-icon" aria-hidden="true">&#x21bb;</span><span>Reload Stream</span>';
};

const normalizeUpdateMessage = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return '-';
  }

  return payload.message || payload.state || '-';
};

const setToolbarVisible = (visible) => {
  toolbarVisible = visible;
  toolbarEl.classList.toggle('collapsed', !visible);
};

const setToolbarMenuVisible = (visible) => {
  toolbarMenuPanel.classList.toggle('hidden', !visible);
};

const toggleToolbarMenu = () => {
  setToolbarMenuVisible(toolbarMenuPanel.classList.contains('hidden'));
};

const scheduleToolbarAutoHide = () => {
  if (toolbarHideTimer) {
    clearTimeout(toolbarHideTimer);
  }
  toolbarHideTimer = setTimeout(() => {
    if (toolbarPinnedByMouse || !toolbarMenuPanel.classList.contains('hidden')) {
      return;
    }
    setToolbarVisible(false);
  }, 650);
};

const shouldShowToolbarByPointer = (clientX, clientY) => {
  const nearBottom = window.innerHeight - clientY <= 130;
  const centerRange = Math.max(220, Math.round(window.innerWidth * 0.18));
  const nearCenterBottom = Math.abs(clientX - window.innerWidth / 2) <= centerRange;
  return nearBottom && nearCenterBottom;
};

const showHelp = () => {
  helpModalEl.classList.add('visible');
};

const hideHelp = () => {
  helpModalEl.classList.remove('visible');
};

const clearPlayers = () => {
  while (retryTimers.length > 0) {
    clearTimeout(retryTimers.pop());
  }

  while (hlsPlayers.length > 0) {
    const player = hlsPlayers.pop();
    if (player && typeof player.destroy === 'function') {
      player.destroy();
    }
  }
};

const renderCellPlaceholder = (cell, text) => {
  cell.innerHTML = '';
  const label = document.createElement('span');
  label.className = 'cell-label';
  label.textContent = text;
  cell.appendChild(label);
};

const setStreamStatus = (statusEl, isOnline) => {
  statusEl.classList.toggle('online', isOnline);
  statusEl.classList.toggle('offline', !isOnline);
  statusEl.textContent = isOnline ? 'Online' : 'Offline';
};

const requestFullscreen = async (targetEl) => {
  if (document.fullscreenElement) {
    await document.exitFullscreen();
    return;
  }

  if (targetEl.requestFullscreen) {
    await targetEl.requestFullscreen();
    return;
  }

  if (targetEl.webkitRequestFullscreen) {
    await targetEl.webkitRequestFullscreen();
  }
};

const withCacheBuster = (url) => {
  try {
    const parsed = new URL(url);
    parsed.searchParams.set('_retry', Date.now().toString());
    return parsed.toString();
  } catch (_) {
    return `${url}${url.includes('?') ? '&' : '?'}_retry=${Date.now()}`;
  }
};

const attachStreamWithRetry = (videoEl, streamUrl, statusEl) => {
  const maxRetryDelayMs = 30000;
  let retryCount = 0;
  let retryTimer = null;

  const clearRetryTimer = () => {
    if (!retryTimer) {
      return;
    }
    clearTimeout(retryTimer);
    retryTimer = null;
  };

  const scheduleRetry = () => {
    setStreamStatus(statusEl, false);
    clearRetryTimer();

    const delayMs = Math.min(maxRetryDelayMs, 2000 * 2 ** Math.min(retryCount, 4));
    retryCount += 1;
    retryTimer = setTimeout(() => {
      connect();
    }, delayMs);
    retryTimers.push(retryTimer);
  };

  const connect = () => {
    videoEl.pause();
    videoEl.removeAttribute('src');
    videoEl.load();

    if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
      videoEl.src = withCacheBuster(streamUrl);
      videoEl.load();
      videoEl.play().catch(() => scheduleRetry());
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls({
        lowLatencyMode: true,
        backBufferLength: 30,
      });

      hls.on(window.Hls.Events.MEDIA_ATTACHED, () => {
        hls.loadSource(withCacheBuster(streamUrl));
      });

      hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
        videoEl.play().catch(() => scheduleRetry());
      });

      hls.on(window.Hls.Events.ERROR, (_event, data) => {
        if (data && data.fatal) {
          hls.destroy();
          scheduleRetry();
        }
      });

      hls.attachMedia(videoEl);
      hlsPlayers.push(hls);
      return;
    }

    throw new Error('HLS is not supported in this runtime.');
  };

  videoEl.addEventListener('playing', () => {
    retryCount = 0;
    clearRetryTimer();
    setStreamStatus(statusEl, true);
  });
  videoEl.addEventListener('error', scheduleRetry);
  videoEl.addEventListener('stalled', scheduleRetry);
  videoEl.addEventListener('emptied', scheduleRetry);

  connect();
};

const renderCameras = (cameras = []) => {
  clearPlayers();

  const cells = Array.from(gridEl.querySelectorAll('.cell'));
  cells.forEach((cell, index) => {
    const camera = cameras[index];
    if (!camera) {
      renderCellPlaceholder(cell, `Empty ${index + 1}`);
      return;
    }

    if (!camera.stream_play_url) {
      renderCellPlaceholder(cell, `${camera.cctv_name || 'Camera'}: no stream URL`);
      return;
    }

    cell.innerHTML = '';
    const videoEl = document.createElement('video');
    videoEl.className = 'stream-video';
    videoEl.autoplay = true;
    videoEl.muted = true;
    videoEl.controls = false;
    videoEl.playsInline = true;

    const metaEl = document.createElement('div');
    metaEl.className = 'stream-meta';

    const statusEl = document.createElement('span');
    statusEl.className = 'stream-status';

    const titleEl = document.createElement('span');
    titleEl.className = 'stream-title';
    titleEl.textContent = camera.cctv_name || `Camera ${index + 1}`;

    const fullscreenBtn = document.createElement('button');
    fullscreenBtn.type = 'button';
    fullscreenBtn.className = 'fullscreen-btn';
    fullscreenBtn.textContent = '\u26F6';
    fullscreenBtn.setAttribute('aria-label', 'Toggle fullscreen');
    fullscreenBtn.title = 'Fullscreen';
    fullscreenBtn.addEventListener('click', async () => {
      try {
        await requestFullscreen(cell);
      } catch (_) {
        // Ignore fullscreen errors from browser policy/runtime.
      }
    });

    setStreamStatus(statusEl, Number(camera.is_active) === 1);

    metaEl.appendChild(statusEl);
    metaEl.appendChild(titleEl);

    cell.appendChild(videoEl);
    cell.appendChild(metaEl);
    cell.appendChild(fullscreenBtn);

    try {
      attachStreamWithRetry(videoEl, camera.stream_play_url, statusEl);
    } catch (error) {
      renderCellPlaceholder(cell, error.message);
    }
  });
};

const hidePicker = () => {
  pickerEl.classList.remove('visible');
};

const showPicker = () => {
  pickerEl.classList.add('visible');
};

const hideApiConfigModal = () => {
  apiConfigModalEl.classList.remove('visible');
};

const showApiConfigModal = () => {
  apiConfigModalEl.classList.add('visible');
};

const hideUpdateConfigModal = () => {
  updateConfigModalEl.classList.remove('visible');
};

const showUpdateConfigModal = () => {
  updateConfigModalEl.classList.add('visible');
};

const updatePagingUi = () => {
  pageInfoEl.textContent = `Page ${activePage} / ${totalPages}`;
  prevPageBtn.disabled = activePage <= 1;
  nextPageBtn.disabled = activePage >= totalPages;
};

const setPagingVisible = (visible) => {
  pagingControlEl.classList.toggle('hidden', !visible);
};

const loadBranchPages = async (branchId) => {
  const pageResponse = await window.cameraService.getBranchPages(branchId);
  if (pageResponse.status >= 400) {
    throw new Error(pageResponse.message || 'Failed to load total pages.');
  }

  const payload = Array.isArray(pageResponse.data) ? pageResponse.data[0] : null;
  const parsedTotalPages = Number(payload && payload.total_pages ? payload.total_pages : 1);
  totalPages = Number.isFinite(parsedTotalPages) && parsedTotalPages > 0 ? parsedTotalPages : 1;
  updatePagingUi();
};

const loadBranchCameras = async (branch, page = 1) => {
  pickerStatusEl.textContent = `Loading cameras for ${branch.branch_name}...`;
  const response = await window.cameraService.getCamerasByBranch(branch.id, page);
  if (response.status >= 400) {
    throw new Error(response.message || 'Failed to load cameras.');
  }

  activeBranch = branch;
  activePage = page;
  renderCameras(Array.isArray(response.data) ? response.data : []);
  currentBranchEl.textContent = `Active branch: ${branch.branch_code} - ${branch.branch_name} (Page ${activePage})`;
  updatePagingUi();
  setReloadButtonState(false);
  hidePicker();
};

const refreshCurrentStreams = async () => {
  if (isRefreshingStreams) {
    return;
  }

  if (!activeBranch || !activeBranch.id) {
    pickerStatusEl.textContent = 'Select branch first before reloading streams.';
    return;
  }

  setReloadButtonState(true);
  try {
    await loadBranchCameras(activeBranch, activePage);
    pickerStatusEl.textContent = `Streams reloaded for ${activeBranch.branch_name} (Page ${activePage}).`;
  } catch (error) {
    pickerStatusEl.textContent = error.message || 'Failed to reload streams.';
  } finally {
    setReloadButtonState(false);
  }
};

const renderBranches = (branches) => {
  branchListEl.innerHTML = '';
  if (!branches.length) {
    pickerStatusEl.textContent = 'No branch data available.';
    return;
  }

  pickerStatusEl.textContent = 'Select one branch to load cameras.';
  branches.forEach((branch) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'branch-item';
    button.textContent = `${branch.branch_code || '-'} - ${branch.branch_name || '-'}`;
    button.addEventListener('click', async () => {
      try {
        await loadBranchPages(branch.id);
        await loadBranchCameras(branch, 1);
        setPagingVisible(true);
      } catch (error) {
        pickerStatusEl.textContent = error.message || 'Failed to load cameras.';
        setPagingVisible(false);
      }
    });
    branchListEl.appendChild(button);
  });
};

const openBranchPicker = async () => {
  showPicker();
  pickerStatusEl.textContent = 'Loading branch list...';
  branchListEl.innerHTML = '';

  try {
    const response = await window.cameraService.getBranches();
    if (response.status >= 400) {
      throw new Error(response.message || 'Failed to load branches.');
    }

    const branches = Array.isArray(response.data) ? response.data : [];
    renderBranches(branches);
  } catch (error) {
    pickerStatusEl.textContent = error.message || 'Failed to load branches.';
  }
};

const openApiBaseUrlConfig = async () => {
  const now = Date.now();
  if (now - lastApiConfigOpenAt < 300) {
    return;
  }
  lastApiConfigOpenAt = now;

  const currentApiBaseUrl = await window.cameraService.getApiBaseUrl();
  apiBaseUrlInputEl.value = currentApiBaseUrl || '';
  showApiConfigModal();
  apiBaseUrlInputEl.focus();
  apiBaseUrlInputEl.select();
};

const openUpdateFeedConfig = async () => {
  const now = Date.now();
  if (now - lastUpdateConfigOpenAt < 300) {
    return;
  }
  lastUpdateConfigOpenAt = now;

  const response = await window.appUpdater.getConfig();
  if (response.status >= 400) {
    throw new Error(response.message || 'Failed to load update configuration.');
  }

  const data = response.data || {};
  const readOnlyMode = data.mode === 'electron-updater';
  updateFeedUrlInputEl.value = data.feedUrl || data.suggestedFeedUrl || '';
  updateGithubOwnerInputEl.value = data.githubOwner || data.suggestedGitHubOwner || '';
  updateGithubRepoInputEl.value = data.githubRepo || data.suggestedGitHubRepo || '';
  useGithubReleaseCheckboxEl.checked = Boolean(data.githubOwner && data.githubRepo);
  updateFeedUrlInputEl.disabled = readOnlyMode;
  updateGithubOwnerInputEl.disabled = readOnlyMode;
  updateGithubRepoInputEl.disabled = readOnlyMode;
  useGithubReleaseCheckboxEl.disabled = readOnlyMode;
  saveUpdateConfigBtn.disabled = readOnlyMode;
  if (readOnlyMode) {
    pickerStatusEl.textContent = data.message || 'Auto update feed is managed by build configuration.';
  }
  syncUpdateInfoCard(latestUpdatePayload, data);
  setToolbarDetailsVisible(true);
  showUpdateConfigModal();
  updateFeedUrlInputEl.focus();
  updateFeedUrlInputEl.select();
};

document.addEventListener('keydown', (event) => {
  if (event.repeat) {
    return;
  }

  const pressedShiftK =
    event.shiftKey &&
    !event.ctrlKey &&
    !event.altKey &&
    !event.metaKey &&
    String(event.key || '').toLowerCase() === 'k';

  const pressedShiftH =
    event.shiftKey &&
    !event.ctrlKey &&
    !event.altKey &&
    !event.metaKey &&
    String(event.key || '').toLowerCase() === 'h';
  const pressedShiftU =
    event.shiftKey &&
    !event.ctrlKey &&
    !event.altKey &&
    !event.metaKey &&
    String(event.key || '').toLowerCase() === 'u';

  if (pressedShiftH) {
    event.preventDefault();
    showHelp();
    return;
  }

  if (pressedShiftU) {
    event.preventDefault();
    openUpdateFeedConfig().catch(() => {
      pickerStatusEl.textContent = 'Failed to open auto update feed configuration.';
    });
    return;
  }

  if (!pressedShiftK) {
    return;
  }

  event.preventDefault();
  openApiBaseUrlConfig().catch(() => {
    pickerStatusEl.textContent = 'Failed to open API_BASE_URL configuration.';
  });
});

closePickerBtn.addEventListener('click', hidePicker);
toolbarMenuBtn.addEventListener('click', (event) => {
  event.stopPropagation();
  toggleToolbarMenu();
});
menuApiConfigBtn.addEventListener('click', () => {
  setToolbarMenuVisible(false);
  openApiBaseUrlConfig().catch(() => {
    pickerStatusEl.textContent = 'Failed to open API_BASE_URL configuration.';
  });
});
menuUpdateInfoBtn.addEventListener('click', () => {
  setToolbarMenuVisible(false);
  openUpdateFeedConfig().catch(() => {
    pickerStatusEl.textContent = 'Failed to open auto update feed configuration.';
  });
});
menuHelpBtn.addEventListener('click', () => {
  setToolbarMenuVisible(false);
  showHelp();
});
menuToggleDetailsBtn.addEventListener('click', () => {
  setToolbarMenuVisible(false);
  setToolbarDetailsVisible(!toolbarDetailsVisible);
});
reloadStreamBtn.addEventListener('click', () => {
  refreshCurrentStreams();
});
updateStatusBtn.addEventListener('click', () => {
  openUpdateFeedConfig().catch(() => {
    pickerStatusEl.textContent = 'Failed to open update information.';
  });
});
closeApiConfigBtn.addEventListener('click', hideApiConfigModal);
closeUpdateConfigBtn.addEventListener('click', hideUpdateConfigModal);
closeHelpBtn.addEventListener('click', hideHelp);

document.addEventListener('click', (event) => {
  if (toolbarMenuPanel.classList.contains('hidden')) {
    return;
  }
  if (toolbarMenuPanel.contains(event.target) || toolbarMenuBtn.contains(event.target)) {
    return;
  }
  setToolbarMenuVisible(false);
});

toolbarEl.addEventListener('mouseenter', () => {
  toolbarPinnedByMouse = true;
  if (toolbarHideTimer) {
    clearTimeout(toolbarHideTimer);
  }
});

toolbarEl.addEventListener('mouseleave', () => {
  toolbarPinnedByMouse = false;
  scheduleToolbarAutoHide();
});

document.addEventListener('mousemove', (event) => {
  if (shouldShowToolbarByPointer(event.clientX, event.clientY)) {
    setToolbarVisible(true);
    scheduleToolbarAutoHide();
    return;
  }

  if (!toolbarPinnedByMouse && toolbarMenuPanel.classList.contains('hidden')) {
    scheduleToolbarAutoHide();
  }
});
apiConfigFormEl.addEventListener('submit', async (event) => {
  event.preventDefault();
  const nextApiBaseUrl = apiBaseUrlInputEl.value.trim();
  if (!nextApiBaseUrl) {
    pickerStatusEl.textContent = 'API_BASE_URL cannot be empty.';
    return;
  }

  const response = await window.cameraService.setApiBaseUrl(nextApiBaseUrl);
  if (response.status >= 400) {
    pickerStatusEl.textContent = response.message || 'Failed to update API_BASE_URL.';
    return;
  }

  const updatedApiBaseUrl =
    response && response.data && response.data.apiBaseUrl ? response.data.apiBaseUrl : '';
  setApiBaseUrlText(updatedApiBaseUrl);
  setToolbarDetailsVisible(true);
  pickerStatusEl.textContent = `API_BASE_URL updated to ${updatedApiBaseUrl}`;
  hideApiConfigModal();
});
updateConfigFormEl.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (saveUpdateConfigBtn.disabled) {
    pickerStatusEl.textContent = 'Auto update feed is read-only in electron-updater mode.';
    hideUpdateConfigModal();
    return;
  }

  const feedUrl = updateFeedUrlInputEl.value.trim();
  const githubOwner = updateGithubOwnerInputEl.value.trim();
  const githubRepo = updateGithubRepoInputEl.value.trim();
  const useGitHubRelease = useGithubReleaseCheckboxEl.checked;

  const response = await window.appUpdater.setConfig({
    feedUrl,
    githubOwner,
    githubRepo,
    useGitHubRelease,
  });
  if (response.status >= 400) {
    pickerStatusEl.textContent = response.message || 'Failed to update auto update feed.';
    return;
  }

  const data = response.data || {};
  setUpdateStatusText(`Feed configured (${data.source || 'config'}).`);
  pickerStatusEl.textContent = `Update source configured to ${data.feedUrl || '-'}`;
  hideUpdateConfigModal();
});
prevPageBtn.addEventListener('click', async () => {
  if (!activeBranch || activePage <= 1) {
    return;
  }

  const targetPage = activePage - 1;
  try {
    await loadBranchCameras(activeBranch, targetPage);
  } catch (error) {
    pickerStatusEl.textContent = error.message || 'Failed to load cameras.';
  }
});

nextPageBtn.addEventListener('click', async () => {
  if (!activeBranch || activePage >= totalPages) {
    return;
  }

  const targetPage = activePage + 1;
  try {
    await loadBranchCameras(activeBranch, targetPage);
  } catch (error) {
    pickerStatusEl.textContent = error.message || 'Failed to load cameras.';
  }
});

checkUpdateBtn.addEventListener('click', async () => {
  if (isCheckingUpdate) {
    return;
  }

  setToolbarDetailsVisible(true);
  setUpdateProgressVisible(false);
  setUpdateProgress(0);
  setUpdateButtonState(true);
  setUpdateStatusText('Checking for update...');

  try {
    const response = await window.appUpdater.checkForUpdates();
    if (response.status >= 400) {
      throw new Error(response.message || 'Failed to check update.');
    }
  } catch (error) {
    setUpdateStatusText(error.message || 'Failed to check update.');
    setUpdateButtonState(false);
  }
});

updatePagingUi();
setPagingVisible(false);
setReloadButtonState(false);
setToolbarDetailsVisible(false);
setUpdateProgressVisible(false);
setUpdateProgress(0);
setToolbarMenuVisible(false);
setToolbarVisible(false);
setUpdateStatusText('idle');
window.appInfo
  .getVersion()
  .then((version) => setInstalledVersionText(version))
  .catch(() => setInstalledVersionText('-'));
window.cameraService
  .getApiBaseUrl()
  .then((apiBaseUrl) => setApiBaseUrlText(apiBaseUrl))
  .catch(() => setApiBaseUrlText('-'));
window.appUpdater
  .getStatus()
  .then((response) => {
    if (response.status >= 400) {
      throw new Error(response.message || 'Failed to load updater status.');
    }
    latestUpdatePayload = response.data || null;
    syncUpdateInfoCard(latestUpdatePayload);
    setUpdateStatusText(normalizeUpdateMessage(response.data));
  })
  .catch((error) => {
    setUpdateStatusText(error.message || 'Updater status unavailable.');
  });
window.appUpdater.onStatus((payload) => {
  const state = payload && payload.state ? String(payload.state) : '';
  const progressPercent =
    payload && Number.isFinite(Number(payload.percent)) ? Number(payload.percent) : 0;
  latestUpdatePayload = payload || latestUpdatePayload;
  syncUpdateInfoCard(latestUpdatePayload);
  setUpdateStatusText(normalizeUpdateMessage(payload));
  if (state === 'checking' || state === 'downloading' || state === 'error') {
    setToolbarDetailsVisible(true);
  }

  if (state === 'downloading') {
    setUpdateProgressVisible(true);
    setUpdateProgress(progressPercent);
  } else {
    setUpdateProgressVisible(false);
    if (state === 'downloaded') {
      setUpdateProgress(100);
    } else {
      setUpdateProgress(0);
    }
  }

  if (state === 'checking' || state === 'downloading') {
    setUpdateButtonState(true);
    return;
  }

  setUpdateButtonState(false);
});
window.cameraService.onOpenBranchPicker(openBranchPicker);
window.cameraService.onOpenApiBaseUrlConfig(openApiBaseUrlConfig);
window.cameraService.onOpenUpdateFeedConfig(openUpdateFeedConfig);
