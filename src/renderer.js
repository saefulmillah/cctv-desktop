const gridEl = document.querySelector('.grid');
const pickerEl = document.getElementById('branchPicker');
const branchListEl = document.getElementById('branchList');
const pickerStatusEl = document.getElementById('pickerStatus');
const closePickerBtn = document.getElementById('closePickerBtn');
const currentBranchEl = document.getElementById('currentBranch');
const pagingControlEl = document.getElementById('pagingControl');
const prevPageBtn = document.getElementById('prevPageBtn');
const nextPageBtn = document.getElementById('nextPageBtn');
const pageInfoEl = document.getElementById('pageInfo');
const apiBaseUrlEl = document.getElementById('apiBaseUrl');
const openApiConfigBtn = document.getElementById('openApiConfigBtn');
const apiConfigModalEl = document.getElementById('apiConfigModal');
const closeApiConfigBtn = document.getElementById('closeApiConfigBtn');
const apiConfigFormEl = document.getElementById('apiConfigForm');
const apiBaseUrlInputEl = document.getElementById('apiBaseUrlInput');

const hlsPlayers = [];
const retryTimers = [];
let activeBranch = null;
let activePage = 1;
let totalPages = 1;
let lastApiConfigOpenAt = 0;

const setApiBaseUrlText = (value) => {
  apiBaseUrlEl.textContent = `API: ${value || '-'}`;
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
  hidePicker();
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

  if (!pressedShiftK) {
    return;
  }

  event.preventDefault();
  openApiBaseUrlConfig().catch(() => {
    pickerStatusEl.textContent = 'Failed to open API_BASE_URL configuration.';
  });
});

closePickerBtn.addEventListener('click', hidePicker);
openApiConfigBtn.addEventListener('click', () => {
  openApiBaseUrlConfig().catch(() => {
    pickerStatusEl.textContent = 'Failed to open API_BASE_URL configuration.';
  });
});
closeApiConfigBtn.addEventListener('click', hideApiConfigModal);
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
  pickerStatusEl.textContent = `API_BASE_URL updated to ${updatedApiBaseUrl}`;
  hideApiConfigModal();
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

updatePagingUi();
setPagingVisible(false);
window.cameraService
  .getApiBaseUrl()
  .then((apiBaseUrl) => setApiBaseUrlText(apiBaseUrl))
  .catch(() => setApiBaseUrlText('-'));
window.cameraService.onOpenBranchPicker(openBranchPicker);
window.cameraService.onOpenApiBaseUrlConfig(openApiBaseUrlConfig);
