const gridEl = document.getElementById('cameraGrid');
const toolbarEl = document.getElementById('toolbar');
const toolbarMenuBtn = document.getElementById('toolbarMenuBtn');
const toolbarMenuPanel = document.getElementById('toolbarMenuPanel');
const openBranchBtn = document.getElementById('openBranchBtn');
const quickSearchBtn = document.getElementById('quickSearchBtn');
const layoutConfigBtn = document.getElementById('layoutConfigBtn');
const focusModeBtn = document.getElementById('focusModeBtn');
const normalModeBtn = document.getElementById('normalModeBtn');
const menuApiConfigBtn = document.getElementById('menuApiConfigBtn');
const menuUpdateInfoBtn = document.getElementById('menuUpdateInfoBtn');
const menuHelpBtn = document.getElementById('menuHelpBtn');
const currentBranchEl = document.getElementById('currentBranch');
const installedVersionEl = document.getElementById('installedVersion');
const pagingControlEl = document.getElementById('pagingControl');
const prevPageBtn = document.getElementById('prevPageBtn');
const nextPageBtn = document.getElementById('nextPageBtn');
const pageInfoEl = document.getElementById('pageInfo');
const reloadStreamBtn = document.getElementById('reloadStreamBtn');
const modeBadgeEl = document.getElementById('modeBadge');
const activeRouteTitleEl = document.getElementById('activeRouteTitle');
const currentBranchMiniEl = document.getElementById('currentBranchMini');
const activityVersionEl = document.getElementById('activityVersion');
const apiBaseUrlLabelEl = document.getElementById('apiBaseUrlLabel');
const updateStatusBadgeEl = document.getElementById('updateStatusBadge');
const activityFeedEl = document.getElementById('activityFeed');
const onlineCountEl = document.getElementById('onlineCount');
const offlineCountEl = document.getElementById('offlineCount');
const selectedCountEl = document.getElementById('selectedCount');
const sidebarMapEl = document.getElementById('sidebarMap');
const sidebarMapEmptyEl = document.getElementById('sidebarMapEmpty');
const sidebarMapSummaryEl = document.getElementById('sidebarMapSummary');

const pickerEl = document.getElementById('branchPicker');
const branchListEl = document.getElementById('branchList');
const pickerStatusEl = document.getElementById('pickerStatus');
const closePickerBtn = document.getElementById('closePickerBtn');
const branchSearchInputEl = document.getElementById('branchSearchInput');

const searchModalEl = document.getElementById('searchModal');
const searchModalTitleEl = document.getElementById('searchModalTitle');
const quickSearchInputEl = document.getElementById('quickSearchInput');
const quickSearchResultsEl = document.getElementById('quickSearchResults');
const closeSearchBtn = document.getElementById('closeSearchBtn');

const checkUpdateBtn = document.getElementById('checkUpdateBtn');
const apiConfigModalEl = document.getElementById('apiConfigModal');
const closeApiConfigBtn = document.getElementById('closeApiConfigBtn');
const apiConfigFormEl = document.getElementById('apiConfigForm');
const apiBaseUrlInputEl = document.getElementById('apiBaseUrlInput');
const apiAuthTokenInputEl = document.getElementById('apiAuthTokenInput');
const apiTokenInfoEl = document.getElementById('apiTokenInfo');
const apiTokenUsernameEl = document.getElementById('apiTokenUsername');
const apiTokenRoleEl = document.getElementById('apiTokenRole');
const apiTokenStatusEl = document.getElementById('apiTokenStatus');
const apiTokenExpiryEl = document.getElementById('apiTokenExpiry');
const checkApiConfigBtn = document.getElementById('checkApiConfigBtn');
const apiCheckStatusEl = document.getElementById('apiCheckStatus');
const layoutConfigModalEl = document.getElementById('layoutConfigModal');
const closeLayoutConfigBtn = document.getElementById('closeLayoutConfigBtn');
const layoutConfigFormEl = document.getElementById('layoutConfigForm');
const layoutPresetSelectEl = document.getElementById('layoutPresetSelect');
const layoutMainCountInputEl = document.getElementById('layoutMainCountInput');
const layoutSideCountInputEl = document.getElementById('layoutSideCountInput');
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
const selectedCameraIds = new Set();
const selectedCameraMap = new Map();
const streamStateByCameraId = new Map();
const playerControllers = new Map();
const reconnectTimers = new Map();
const branchWideCameraCache = new Map();
const perfStats = {
  searchRequests: 0,
  reconnectSchedules: 0,
};
let availableBranches = [];
let activeBranch = null;
let activePage = 1;
let totalPages = 1;
let lastApiConfigOpenAt = 0;
let lastUpdateConfigOpenAt = 0;
let toolbarVisible = false;
let isCheckingUpdate = false;
let isRefreshingStreams = false;
let isCheckingApiConfig = false;
let toolbarPinnedByMouse = false;
let toolbarHideTimer = null;
let latestUpdatePayload = null;
let currentCameras = [];
let branchWideCameras = [];
let currentMode = 'normal';
let activityItems = [];
let quickSearchContext = {
  mode: 'select',
  slotIndex: null,
};
const slotOverrides = new Map();
let quickSearchRequestId = 0;
let quickSearchDebounceTimer = null;
let globalWatchdogTimer = null;
let perfObserverTimer = null;
let playerAttachSequence = 0;
let googleMapsLoaderPromise = null;
let sidebarMapInstance = null;
let sidebarMapInfoWindow = null;
let sidebarTrafficLayer = null;
let sidebarMapMarkers = [];
let sidebarMapRefreshTimer = null;
let sidebarMapShouldAutoFit = true;
let selectedMapCameraId = null;
let gridLayout = {
  type: '5x4',
  columns: 5,
  rows: 4,
  limit: 20,
  mainCount: 1,
  sideCount: 6,
};

const DEFAULT_GRID_COUNT = 20;
const ACTIVITY_LIMIT = 6;
const PERF_FLAGS = {
  ENABLE_PERF_OBSERVER: false,
  USE_CENTRAL_WATCHDOG: true,
  USE_RECONNECT_GUARDS: true,
  USE_DOM_PATCH_GUARDS: true,
};
const ACTIVE_UI_THEME = 'theme-dashboard-enterprise';
const GOOGLE_MAPS_API_KEY = 'AIzaSyAuNghu_4V4kxgcCa5UX0XBV_zPMZzV-Cg';
const WATCHDOG_INTERVAL_MS = 5000;
const WATCHDOG_FREEZE_THRESHOLD_MS = 15000;
const ONLINE_MARKER_URL = new URL('./assets/maps-marker_32x32.ico', window.location.href).toString();
const OFFLINE_MARKER_URL = new URL('./assets/maps-marker_32x32-offline.ico', window.location.href).toString();

const setTextIfChanged = (element, value) => {
  if (!element) {
    return;
  }
  const normalized = String(value ?? '');
  if (!PERF_FLAGS.USE_DOM_PATCH_GUARDS) {
    element.textContent = normalized;
    return;
  }
  if (element.textContent !== normalized) {
    element.textContent = normalized;
  }
};

const setClassNameIfChanged = (element, value) => {
  if (!element) {
    return;
  }
  if (!PERF_FLAGS.USE_DOM_PATCH_GUARDS) {
    element.className = value;
    return;
  }
  if (element.className !== value) {
    element.className = value;
  }
};

const getReconnectRegistrySize = () => reconnectTimers.size;

const logPerfSnapshot = () => {
  if (!PERF_FLAGS.ENABLE_PERF_OBSERVER) {
    return;
  }
  console.info('[perf]', {
    activePlayers: playerControllers.size,
    reconnectTimers: getReconnectRegistrySize(),
    watchdogActive: Boolean(globalWatchdogTimer),
    searchRequests: perfStats.searchRequests,
  });
};

const setApiBaseUrlText = (value) => {
  setTextIfChanged(apiBaseUrlLabelEl, `API: ${value || '-'}`);
};

const setInstalledVersionText = (value) => {
  const nextValue = `Version: ${value || '-'}`;
  setTextIfChanged(activityVersionEl, nextValue);
};

const getUpdateTone = (state) => {
  const normalized = String(state || '').toLowerCase();
  if (normalized === 'ready' || normalized === 'up_to_date' || normalized === 'downloaded') {
    return 'success';
  }
  if (normalized === 'checking' || normalized === 'downloading') {
    return 'warning';
  }
  if (normalized === 'error' || normalized === 'disabled') {
    return 'danger';
  }
  return 'neutral';
};

const setUpdateStatusText = (message, state) => {
  setTextIfChanged(updateInfoMessageEl, String(message || '-'));
  setClassNameIfChanged(updateStatusBadgeEl, `status-pill ${getUpdateTone(state)}`);
  setTextIfChanged(updateStatusBadgeEl, String(message || 'Updater idle'));
};

const setApiCheckStatus = (message, tone = 'neutral') => {
  setClassNameIfChanged(apiCheckStatusEl, `api-check-status ${tone}`);
  setTextIfChanged(apiCheckStatusEl, String(message || '-'));
};

const setApiCheckButtonState = (checking) => {
  isCheckingApiConfig = checking;
  checkApiConfigBtn.disabled = checking;
  checkApiConfigBtn.textContent = checking ? 'Checking...' : 'Check URL';
};

const decodeJwtPayload = (token) => {
  const rawToken = String(token || '').trim();
  if (!rawToken) {
    return null;
  }

  const jwt = rawToken.startsWith('Bearer ') ? rawToken.slice(7).trim() : rawToken;
  const parts = jwt.split('.');
  if (parts.length < 2) {
    return null;
  }

  try {
    const normalized = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
    const decoded = window.atob(padded);
    return JSON.parse(decoded);
  } catch (_) {
    return null;
  }
};

const formatTokenExpiry = (expValue) => {
  const expNumber = Number(expValue);
  if (!Number.isFinite(expNumber) || expNumber <= 0) {
    return {
      text: '-',
      expired: null,
    };
  }

  const expiryDate = new Date(expNumber * 1000);
  const expired = expiryDate.getTime() <= Date.now();
  return {
    text: `${expiryDate.toLocaleDateString('id-ID')} ${expiryDate.toLocaleTimeString('id-ID')}`,
    expired,
  };
};

const updateApiTokenInfo = (token) => {
  const payload = decodeJwtPayload(token);
  const hasToken = Boolean(String(token || '').trim());

  if (!hasToken) {
    apiTokenInfoEl.classList.add('hidden');
    setTextIfChanged(apiTokenUsernameEl, '-');
    setTextIfChanged(apiTokenRoleEl, '-');
    setTextIfChanged(apiTokenStatusEl, '-');
    setTextIfChanged(apiTokenExpiryEl, '-');
    return;
  }

  apiTokenInfoEl.classList.remove('hidden');

  if (!payload || typeof payload !== 'object') {
    setTextIfChanged(apiTokenUsernameEl, '-');
    setTextIfChanged(apiTokenRoleEl, '-');
    setTextIfChanged(apiTokenStatusEl, 'Invalid token');
    setTextIfChanged(apiTokenExpiryEl, '-');
    return;
  }

  const username =
    payload.username || payload.user_name || payload.name || payload.email || payload.sub || '-';
  const role = payload.role || payload.roles || payload.user_role || '-';
  const expiryInfo = formatTokenExpiry(payload.exp);

  setTextIfChanged(apiTokenUsernameEl, String(username));
  setTextIfChanged(
    apiTokenRoleEl,
    Array.isArray(role) ? role.map((item) => String(item)).join(', ') || '-' : String(role)
  );
  setTextIfChanged(
    apiTokenStatusEl,
    expiryInfo.expired === null ? 'No expiry info' : expiryInfo.expired ? 'Expired' : 'Active'
  );
  setTextIfChanged(apiTokenExpiryEl, expiryInfo.text);
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
  setUpdateStatusText(message, state);
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
    : '<span class="btn-icon" aria-hidden="true">&#x21bb;</span><span>Reload</span>';
};

const normalizeUpdateMessage = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return '-';
  }

  return payload.message || payload.state || '-';
};

const showModal = (modalEl) => {
  modalEl.classList.add('visible');
  modalEl.setAttribute('aria-hidden', 'false');
};

const hideModal = (modalEl) => {
  modalEl.classList.remove('visible');
  modalEl.setAttribute('aria-hidden', 'true');
};

const showHelp = () => showModal(helpModalEl);
const hideHelp = () => hideModal(helpModalEl);

const focusAndSelectInput = (inputEl) => {
  if (!inputEl) {
    return;
  }

  window.setTimeout(() => {
    inputEl.focus();
    if (typeof inputEl.select === 'function') {
      inputEl.select();
    }
  }, 30);
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
  }, 900);
};

const shouldShowToolbarByPointer = (clientX, clientY) => {
  const nearBottom = window.innerHeight - clientY <= 140;
  const centerRange = Math.max(240, Math.round(window.innerWidth * 0.24));
  return nearBottom && Math.abs(clientX - window.innerWidth / 2) <= centerRange;
};

const addActivity = (title, detail, tone = 'neutral') => {
  const normalizedTone = ['success', 'warning', 'danger'].includes(tone) ? tone : 'neutral';
  activityItems = [
    {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: String(title || 'Activity'),
      detail: String(detail || ''),
      tone: normalizedTone,
    },
    ...activityItems,
  ].slice(0, ACTIVITY_LIMIT);

  activityFeedEl.innerHTML = '';
  activityItems.forEach((item) => {
    const row = document.createElement('div');
    row.className = 'activity-item';
    row.innerHTML = `
      <span class="activity-dot ${item.tone}"></span>
      <div>
        <strong>${item.title}</strong>
        <p>${item.detail}</p>
      </div>
    `;
    activityFeedEl.appendChild(row);
  });
};

const getCameraCoordinates = (camera) => {
  if (!camera || typeof camera !== 'object') {
    return null;
  }

  const lat = Number(camera.cctv_lat);
  const lng = Number(camera.cctv_lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  return { lat, lng };
};

const getMapCameraCollection = () => (branchWideCameras.length ? branchWideCameras : currentCameras);

const getCameraOperationalState = (camera) => {
  return Number(camera && camera.is_active) === 1 ? 'online' : 'offline';
};

const getMapMarkerIconUrl = (camera) =>
  getCameraOperationalState(camera) === 'online' ? ONLINE_MARKER_URL : OFFLINE_MARKER_URL;

const getMapMarkerScaledSize = (camera) =>
  String(camera && camera.id) === String(selectedMapCameraId) ? 40 : 32;

const shortenMarkerLabel = (text, maxLength) => {
  const normalized = String(text || '').trim();
  if (!normalized) {
    return '';
  }
  if (normalized.length <= maxLength) {
    return normalized;
  }
  return `${normalized.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
};

const normalizeMarkerLabelSource = (camera) => {
  const rawName = String((camera && camera.cctv_name) || '').trim();
  if (!rawName) {
    return 'CCTV';
  }

  const parts = rawName.split(/\s+/).filter(Boolean);
  if (parts.length <= 1) {
    return rawName;
  }

  const trimmed = parts.slice(1).join(' ').trim();
  return trimmed || rawName;
};

const getMarkerLabelText = (camera, zoom) => {
  const isSelected = String(camera && camera.id) === String(selectedMapCameraId);
  const numericZoom = Number(zoom || 0);
  const baseLabel = normalizeMarkerLabelSource(camera);
  if (!camera) {
    return '';
  }
  if (isSelected) {
    return shortenMarkerLabel(baseLabel, numericZoom >= 15 ? 28 : 18);
  }
  if (numericZoom >= 16) {
    return shortenMarkerLabel(baseLabel, 18);
  }
  if (numericZoom >= 14) {
    return shortenMarkerLabel(baseLabel, 10);
  }
  return '';
};

const buildMarkerLabelConfig = (camera, zoom) => {
  const text = getMarkerLabelText(camera, zoom);
  if (!text) {
    return null;
  }
  const selected = String(camera && camera.id) === String(selectedMapCameraId);
  return {
    text,
    className: selected ? 'map-marker-label map-marker-label--selected' : 'map-marker-label',
  };
};

const applySidebarMarkerLabels = () => {
  if (!sidebarMapInstance || !sidebarMapMarkers.length) {
    return;
  }
  const zoom = Number(sidebarMapInstance.getZoom() || 0);
  sidebarMapMarkers.forEach((entry) => {
    if (!entry || !entry.marker) {
      return;
    }
    entry.marker.setLabel(buildMarkerLabelConfig(entry.camera, zoom));
    entry.marker.setZIndex(
      String(entry.camera && entry.camera.id) === String(selectedMapCameraId) ? 1000 : undefined
    );
  });
};

const scheduleSidebarMapRefresh = () => {
  if (sidebarMapRefreshTimer) {
    clearTimeout(sidebarMapRefreshTimer);
  }
  sidebarMapRefreshTimer = window.setTimeout(() => {
    sidebarMapRefreshTimer = null;
    void updateSidebarMap();
  }, 180);
};

const getBranchPageCameraMap = () => {
  const pageMap = new Map();
  getMapCameraCollection().forEach((camera) => {
    const pageNumber = Number(camera.__sourcePage || camera.page || 1);
    pageMap.set(String(camera.id), Number.isFinite(pageNumber) && pageNumber > 0 ? pageNumber : 1);
  });
  return pageMap;
};

const clearSidebarMapMarkers = () => {
  sidebarMapMarkers.forEach((entry) => {
    if (entry && entry.marker && typeof entry.marker.setMap === 'function') {
      entry.marker.setMap(null);
    }
  });
  sidebarMapMarkers = [];
};

const buildMapInfoWindowContent = (camera) =>
  `<div style="min-width:180px;"><strong>${camera.cctv_name || 'CCTV'}</strong></div>`;

const openMapInfoWindow = (map, marker, camera) => {
  if (!sidebarMapInfoWindow || !map || !marker || !camera) {
    return;
  }
  sidebarMapInfoWindow.setContent(buildMapInfoWindowContent(camera));
  sidebarMapInfoWindow.open({
    anchor: marker,
    map,
  });
};

const loadGoogleMapsApi = () => {
  if (window.google && window.google.maps) {
    return Promise.resolve(window.google.maps);
  }

  if (googleMapsLoaderPromise) {
    return googleMapsLoaderPromise;
  }

  googleMapsLoaderPromise = new Promise((resolve, reject) => {
    const callbackName = `initGoogleMaps${Date.now()}`;
    window[callbackName] = () => {
      delete window[callbackName];
      resolve(window.google.maps);
    };

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(GOOGLE_MAPS_API_KEY)}&callback=${callbackName}`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      delete window[callbackName];
      reject(new Error('Failed to load Google Maps.'));
    };
    document.head.appendChild(script);
  });

  return googleMapsLoaderPromise;
};

const ensureSidebarMap = async () => {
  if (sidebarMapInstance) {
    return sidebarMapInstance;
  }

  const maps = await loadGoogleMapsApi();
  sidebarMapInstance = new maps.Map(sidebarMapEl, {
    center: { lat: -2.5489, lng: 118.0149 },
    zoom: 4,
    disableDefaultUI: true,
    zoomControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    styles: [
      { elementType: 'geometry', stylers: [{ color: '#1f4c85' }] },
      { elementType: 'labels.text.fill', stylers: [{ color: '#e7f6ff' }] },
      { elementType: 'labels.text.stroke', stylers: [{ color: '#1c3f6e' }] },
      { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#10396a' }] },
      { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#27558c' }] },
      { featureType: 'poi', stylers: [{ visibility: 'off' }] },
      { featureType: 'transit', stylers: [{ visibility: 'off' }] },
    ],
  });
  sidebarMapInfoWindow = new maps.InfoWindow();
  sidebarTrafficLayer = new maps.TrafficLayer();
  sidebarTrafficLayer.setMap(sidebarMapInstance);
  sidebarMapInstance.addListener('dragstart', () => {
    sidebarMapShouldAutoFit = false;
  });
  sidebarMapInstance.addListener('zoom_changed', () => {
    sidebarMapShouldAutoFit = false;
    applySidebarMarkerLabels();
  });
  return sidebarMapInstance;
};

const focusCameraFromMap = async (camera) => {
  if (!camera || !activeBranch || !activeBranch.id) {
    return;
  }

  const pageMap = getBranchPageCameraMap();
  const targetPage = pageMap.get(String(camera.id)) || 1;
  selectedMapCameraId = String(camera.id);
  sidebarMapShouldAutoFit = false;
  selectedCameraIds.add(String(camera.id));
  selectedCameraMap.set(String(camera.id), camera);

  if (activePage !== targetPage) {
    await loadBranchCameras(activeBranch, targetPage);
  } else {
    updateCardSelectionUi(camera.id);
    updateMiniPanel();
  }

  addActivity(
    'Camera focused from map',
    `${camera.cctv_name || 'Camera'} ditambahkan dari marker peta.`,
    'success'
  );
  enterFocusMode();
  scheduleSidebarMapRefresh();
};

const updateSidebarMap = async () => {
  if (currentMode !== 'focus') {
    clearSidebarMapMarkers();
    sidebarMapEl.classList.add('sidebar-section-hidden');
    sidebarMapEmptyEl.classList.remove('sidebar-section-hidden');
    setTextIfChanged(sidebarMapSummaryEl, 'Panel map aktif di Focus Mode');
    setTextIfChanged(sidebarMapEmptyEl, 'Masuk ke Focus Mode untuk melihat peta CCTV.');
    return;
  }

  const camerasWithCoordinates = getMapCameraCollection().filter((camera) => getCameraCoordinates(camera));
  setTextIfChanged(
    sidebarMapSummaryEl,
    camerasWithCoordinates.length
      ? `${camerasWithCoordinates.length} marker CCTV`
      : 'Belum ada marker'
  );

  if (!camerasWithCoordinates.length) {
    clearSidebarMapMarkers();
    sidebarMapEl.classList.add('sidebar-section-hidden');
    sidebarMapEmptyEl.classList.remove('sidebar-section-hidden');
    setTextIfChanged(
      sidebarMapEmptyEl,
      activeBranch
        ? 'Ruas ini belum memiliki koordinat CCTV yang valid.'
        : 'Pilih ruas untuk memuat marker CCTV berdasarkan koordinat kamera.'
    );
    return;
  }

  sidebarMapEmptyEl.classList.add('sidebar-section-hidden');
  sidebarMapEl.classList.remove('sidebar-section-hidden');

  try {
    const map = await ensureSidebarMap();
    clearSidebarMapMarkers();
    const bounds = new window.google.maps.LatLngBounds();

    camerasWithCoordinates.forEach((camera) => {
      const position = getCameraCoordinates(camera);
      if (!position) {
        return;
      }

      const marker = new window.google.maps.Marker({
        map,
        position,
        title: camera.cctv_name || 'CCTV',
        icon: {
          url: getMapMarkerIconUrl(camera),
          scaledSize: new window.google.maps.Size(
            getMapMarkerScaledSize(camera),
            getMapMarkerScaledSize(camera)
          ),
        },
        zIndex: String(camera && camera.id) === String(selectedMapCameraId) ? 1000 : undefined,
      });

      marker.addListener('click', () => {
        openMapInfoWindow(map, marker, camera);
        void focusCameraFromMap(camera);
      });

      sidebarMapMarkers.push({
        marker,
        camera,
      });
      bounds.extend(position);
    });

    applySidebarMarkerLabels();

    if (sidebarMapShouldAutoFit && camerasWithCoordinates.length === 1) {
      map.setCenter(getCameraCoordinates(camerasWithCoordinates[0]));
      map.setZoom(15);
    } else if (sidebarMapShouldAutoFit) {
      map.fitBounds(bounds, 48);
    }
  } catch (error) {
    clearSidebarMapMarkers();
    sidebarMapEl.classList.add('sidebar-section-hidden');
    sidebarMapEmptyEl.classList.remove('sidebar-section-hidden');
    setTextIfChanged(sidebarMapEmptyEl, error.message || 'Failed to load Google Maps.');
  }
};

const getRenderableCameras = () => {
  if (currentMode !== 'focus') {
    return currentCameras;
  }

  const focused = Array.from(selectedCameraIds)
    .map((cameraId) => selectedCameraMap.get(String(cameraId)))
    .filter(Boolean);
  return focused.length ? focused : currentCameras;
};

const getSlotOverrideKey = (slotIndex) => {
  const branchId = activeBranch && activeBranch.id ? activeBranch.id : 'no-branch';
  return `${branchId}:${activePage}:${slotIndex}`;
};

const getCameraBySlotIndex = (slotIndex) => {
  const overrideCamera = slotOverrides.get(getSlotOverrideKey(slotIndex));
  if (overrideCamera) {
    return overrideCamera;
  }
  return currentCameras[slotIndex] || null;
};

const getDisplayCamerasForGrid = () => {
  const limit = getLayoutCount();
  return Array.from({ length: limit }, (_unused, index) => getCameraBySlotIndex(index));
};

const getLayoutCount = () => {
  if (gridLayout.type === 'spotlight') {
    return Math.max(1, Number(gridLayout.mainCount || 1) + Number(gridLayout.sideCount || 0));
  }
  return Math.max(1, Number(gridLayout.limit || DEFAULT_GRID_COUNT));
};

const updateLayoutInputAvailability = () => {
  const spotlight = String(layoutPresetSelectEl.value || gridLayout.type) === 'spotlight';
  layoutMainCountInputEl.disabled = !spotlight;
  layoutSideCountInputEl.disabled = !spotlight;
};

const syncLayoutControls = () => {
  layoutPresetSelectEl.value = gridLayout.type;
  layoutMainCountInputEl.value = String(gridLayout.mainCount || 1);
  layoutSideCountInputEl.value = String(gridLayout.sideCount || 6);
  updateLayoutInputAvailability();
};

const setGridLayoutState = (nextLayout) => {
  gridLayout = nextLayout;
  syncLayoutControls();
};

const searchCameraCatalog = async (query) => {
  const response = await window.cameraService.searchCameras({
    q: String(query || '').trim(),
    page: 1,
    limit: 24,
    sort_by: 'relevance',
    sort_order: 'desc',
  });

  if (response.status >= 400) {
    throw new Error(response.message || 'Failed to search camera catalog.');
  }

  const payload = response.data && typeof response.data === 'object' ? response.data : {};
  return Array.isArray(payload.items) ? payload.items : [];
};

const updateMiniPanel = () => {
  const visibleCameras = getRenderableCameras();
  const onlineCount = visibleCameras.filter((camera) => streamStateByCameraId.get(camera.id) === 'online').length;
  const offlineCount = visibleCameras.filter((camera) => streamStateByCameraId.get(camera.id) !== 'online').length;
  setTextIfChanged(onlineCountEl, String(onlineCount));
  setTextIfChanged(offlineCountEl, String(offlineCount));
  setTextIfChanged(selectedCountEl, String(selectedCameraIds.size));
  setTextIfChanged(
    currentBranchMiniEl,
    activeBranch ? `Branch: ${activeBranch.branch_code} - ${activeBranch.branch_name}` : 'Branch: -'
  );
  setTextIfChanged(
    activeRouteTitleEl,
    activeBranch ? activeBranch.branch_name || activeBranch.branch_code || 'Ruas Aktif' : 'Ruas Belum Dipilih'
  );
  setTextIfChanged(
    modeBadgeEl,
    currentMode === 'focus' ? `Focus Mode (${visibleCameras.length} cams)` : 'Normal Mode'
  );
  focusModeBtn.disabled = selectedCameraIds.size === 0;
};

const updatePagingUi = () => {
  setTextIfChanged(pageInfoEl, `Page ${activePage} / ${totalPages}`);
  prevPageBtn.disabled = activePage <= 1;
  nextPageBtn.disabled = activePage >= totalPages;
};

const setPagingVisible = (visible) => {
  pagingControlEl.classList.toggle('hidden', !visible);
};

const updateCurrentBranchLabels = () => {
  setTextIfChanged(
    currentBranchEl,
    activeBranch
      ? `Active branch: ${activeBranch.branch_code} - ${activeBranch.branch_name} (Page ${activePage})`
      : 'Active branch: -'
  );
  updateMiniPanel();
  void updateSidebarMap();
};

const clearPlayers = () => {
  reconnectTimers.forEach((timerId) => clearTimeout(timerId));
  reconnectTimers.clear();
  playerControllers.forEach((controller) => {
    if (controller && typeof controller.destroy === 'function') {
      controller.destroy();
    }
  });
  playerControllers.clear();
  if (globalWatchdogTimer) {
    clearInterval(globalWatchdogTimer);
    globalWatchdogTimer = null;
  }

  while (hlsPlayers.length > 0) {
    const player = hlsPlayers.pop();
    if (player && typeof player.destroy === 'function') {
      player.destroy();
    }
  }
  logPerfSnapshot();
};

const createSkeletonCard = () => {
  const card = document.createElement('article');
  card.className = 'camera-card--skeleton';
  card.innerHTML = `
    <div class="skeleton-content">
      <div class="skeleton-chip"></div>
      <div class="skeleton-actions"></div>
      <div class="skeleton-line medium"></div>
      <div class="skeleton-line short"></div>
    </div>
  `;
  return card;
};

const applyGridMetrics = (columns, rows) => {
  gridEl.style.gridTemplateColumns = `repeat(${columns}, minmax(0, 1fr))`;
  gridEl.style.gridTemplateRows = `repeat(${rows}, minmax(0, 1fr))`;
};

const renderSkeletonCards = (count = DEFAULT_GRID_COUNT) => {
  clearPlayers();
  gridEl.classList.add('loading');
  gridEl.innerHTML = '';
  gridEl.classList.toggle('grid--spotlight', currentMode !== 'focus' && gridLayout.type === 'spotlight');
  if (currentMode === 'focus') {
    const columns = count <= 2 ? count : count <= 4 ? 2 : count <= 6 ? 3 : 4;
    const rows = Math.max(1, Math.ceil(count / Math.max(columns, 1)));
    applyGridMetrics(columns || 1, rows);
    for (let index = 0; index < Math.max(count, 1); index += 1) {
      gridEl.appendChild(createSkeletonCard());
    }
    return;
  }

  if (gridLayout.type === 'spotlight') {
    applyGridMetrics(4, Math.max(2, Math.ceil(count / 4)));
    for (let index = 0; index < Math.max(count, 1); index += 1) {
      const card = createSkeletonCard();
      if (index < Number(gridLayout.mainCount || 1)) {
        card.classList.add('camera-card--main');
      }
      gridEl.appendChild(card);
    }
    return;
  }

  applyGridMetrics(gridLayout.columns, gridLayout.rows);
  for (let index = 0; index < count; index += 1) {
    gridEl.appendChild(createSkeletonCard());
  }
};

const renderEmptyStateCard = (text) => {
  const card = document.createElement('div');
  card.className = 'camera-card--empty';
  card.textContent = text;
  return card;
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

const setStreamStatus = (statusEl, cameraId, state) => {
  const normalized = ['online', 'offline', 'reconnecting', 'connecting'].includes(state)
    ? state
    : 'offline';
  streamStateByCameraId.set(cameraId, normalized);
  setClassNameIfChanged(statusEl, `stream-status ${normalized}`);
  setTextIfChanged(
    statusEl,
    normalized === 'online'
      ? 'Online'
      : normalized === 'connecting'
        ? 'Connecting'
        : normalized === 'reconnecting'
          ? 'Reconnecting'
          : 'Offline'
  );
  updateMiniPanel();
  scheduleSidebarMapRefresh();
};

const startPerfObserver = () => {
  if (!PERF_FLAGS.ENABLE_PERF_OBSERVER || perfObserverTimer) {
    return;
  }
  perfObserverTimer = window.setInterval(logPerfSnapshot, 60000);
};

const stopPerfObserver = () => {
  if (!perfObserverTimer) {
    return;
  }
  clearInterval(perfObserverTimer);
  perfObserverTimer = null;
};

const ensureGlobalWatchdog = () => {
  if (!PERF_FLAGS.USE_CENTRAL_WATCHDOG || globalWatchdogTimer || playerControllers.size === 0) {
    return;
  }

  globalWatchdogTimer = window.setInterval(() => {
    playerControllers.forEach((controller) => {
      if (!controller || controller.destroyed || !controller.watchdogEligible) {
        return;
      }
      controller.checkPlaybackHealth();
    });
  }, WATCHDOG_INTERVAL_MS);
};

const syncGlobalWatchdogState = () => {
  if (!PERF_FLAGS.USE_CENTRAL_WATCHDOG) {
    return;
  }

  if (playerControllers.size === 0) {
    if (globalWatchdogTimer) {
      clearInterval(globalWatchdogTimer);
      globalWatchdogTimer = null;
    }
    return;
  }

  ensureGlobalWatchdog();
};

const clearReconnectTimer = (key) => {
  if (!reconnectTimers.has(key)) {
    return;
  }
  clearTimeout(reconnectTimers.get(key));
  reconnectTimers.delete(key);
};

const scheduleReconnectTimer = (key, callback, delayMs) => {
  if (!PERF_FLAGS.USE_RECONNECT_GUARDS) {
    window.setTimeout(callback, delayMs);
    return;
  }
  clearReconnectTimer(key);
  perfStats.reconnectSchedules += 1;
  const timerId = window.setTimeout(() => {
    reconnectTimers.delete(key);
    callback();
  }, delayMs);
  reconnectTimers.set(key, timerId);
};

const attachStreamWithRetry = (videoEl, streamUrl, statusEl, cameraId) => {
  const maxRetryDelayMs = 30000;
  let retryCount = 0;
  let lastPlaybackAt = Date.now();
  let lastCurrentTime = 0;
  let activeHls = null;
  let mediaRecoveryAttempts = 0;
  let reconnectInProgress = false;
  let destroyed = false;
  let localWatchdogTimer = null;
  const controllerKey = `${cameraId}:${(playerAttachSequence += 1)}`;

  const clearLocalWatchdog = () => {
    if (!localWatchdogTimer) {
      return;
    }
    clearInterval(localWatchdogTimer);
    localWatchdogTimer = null;
  };

  const checkPlaybackHealth = () => {
    if (destroyed || videoEl.paused || videoEl.ended || videoEl.readyState < 2) {
      return;
    }

    const currentTime = videoEl.currentTime || 0;
    if (currentTime > lastCurrentTime + 0.01) {
      lastCurrentTime = currentTime;
      lastPlaybackAt = Date.now();
      return;
    }

    if (Date.now() - lastPlaybackAt >= WATCHDOG_FREEZE_THRESHOLD_MS) {
      scheduleRetry();
    }
  };

  const scheduleRetry = () => {
    if (destroyed || reconnectInProgress) {
      return;
    }

    reconnectInProgress = true;
    setStreamStatus(statusEl, cameraId, 'reconnecting');
    clearReconnectTimer(controllerKey);

    if (activeHls) {
      activeHls.destroy();
      activeHls = null;
    }

    const baseDelayMs = Math.min(maxRetryDelayMs, 2000 * 2 ** Math.min(retryCount, 4));
    const delayMs = baseDelayMs + Math.floor(Math.random() * 1000);
    retryCount += 1;
    scheduleReconnectTimer(controllerKey, connect, delayMs);
  };

  const connect = () => {
    if (destroyed) {
      return;
    }
    reconnectInProgress = false;
    mediaRecoveryAttempts = 0;
    setStreamStatus(statusEl, cameraId, retryCount > 0 ? 'reconnecting' : 'connecting');
    videoEl.pause();
    videoEl.removeAttribute('src');
    videoEl.load();

    if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
      videoEl.src = withCacheBuster(streamUrl);
      videoEl.load();
      videoEl.play().catch(scheduleRetry);
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls({
        lowLatencyMode: false,
        backBufferLength: 10,
        maxBufferLength: 10,
        maxMaxBufferLength: 20,
        liveSyncDurationCount: 3,
        enableWorker: true,
      });

      activeHls = hls;
      hls.on(window.Hls.Events.MEDIA_ATTACHED, () => {
        if (destroyed || playerControllers.get(controllerKey) !== controller) {
          return;
        }
        hls.loadSource(withCacheBuster(streamUrl));
      });
      hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
        if (destroyed || playerControllers.get(controllerKey) !== controller) {
          return;
        }
        mediaRecoveryAttempts = 0;
        videoEl.play().catch(scheduleRetry);
      });
      hls.on(window.Hls.Events.ERROR, (_event, data) => {
        if (destroyed || playerControllers.get(controllerKey) !== controller) {
          return;
        }
        if (!data || !data.fatal) {
          return;
        }

        if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR && mediaRecoveryAttempts < 1) {
          mediaRecoveryAttempts += 1;
          hls.recoverMediaError();
          return;
        }

        hls.destroy();
        activeHls = null;
        scheduleRetry();
      });
      hls.attachMedia(videoEl);
      hlsPlayers.push(hls);
      return;
    }

    throw new Error('HLS is not supported in this runtime.');
  };

  const handlePlaying = () => {
    if (destroyed) {
      return;
    }
    retryCount = 0;
    clearReconnectTimer(controllerKey);
    clearLocalWatchdog();
    reconnectInProgress = false;
    mediaRecoveryAttempts = 0;
    lastPlaybackAt = Date.now();
    lastCurrentTime = videoEl.currentTime || 0;
    controller.watchdogEligible = true;
    if (!PERF_FLAGS.USE_CENTRAL_WATCHDOG) {
      localWatchdogTimer = window.setInterval(checkPlaybackHealth, WATCHDOG_INTERVAL_MS);
    }
    setStreamStatus(statusEl, cameraId, 'online');
  };

  const handleTimeUpdate = () => {
    if (destroyed) {
      return;
    }
    const currentTime = videoEl.currentTime || 0;
    if (currentTime > lastCurrentTime + 0.01) {
      lastCurrentTime = currentTime;
      lastPlaybackAt = Date.now();
    }
  };

  const handleError = () => {
    if (destroyed) {
      return;
    }
    controller.watchdogEligible = false;
    clearLocalWatchdog();
    setStreamStatus(statusEl, cameraId, 'offline');
    scheduleRetry();
  };

  const controller = {
    key: controllerKey,
    cameraId,
    videoEl,
    statusEl,
    watchdogEligible: false,
    destroyed: false,
    checkPlaybackHealth,
    destroy() {
      if (destroyed) {
        return;
      }
      destroyed = true;
      this.destroyed = true;
      this.watchdogEligible = false;
      clearReconnectTimer(controllerKey);
      clearLocalWatchdog();
      videoEl.removeEventListener('playing', handlePlaying);
      videoEl.removeEventListener('timeupdate', handleTimeUpdate);
      videoEl.removeEventListener('error', handleError);
      videoEl.removeEventListener('stalled', scheduleRetry);
      videoEl.removeEventListener('emptied', scheduleRetry);
      videoEl.pause();
      videoEl.removeAttribute('src');
      videoEl.load();
      if (activeHls) {
        activeHls.destroy();
        activeHls = null;
      }
      playerControllers.delete(controllerKey);
      syncGlobalWatchdogState();
    },
  };

  playerControllers.set(controllerKey, controller);

  videoEl.addEventListener('playing', handlePlaying);
  videoEl.addEventListener('timeupdate', handleTimeUpdate);
  videoEl.addEventListener('error', handleError);
  videoEl.addEventListener('stalled', scheduleRetry);
  videoEl.addEventListener('emptied', scheduleRetry);

  connect();
  syncGlobalWatchdogState();
  logPerfSnapshot();
  return controller;
};

const setMode = (mode) => {
  currentMode = mode === 'focus' ? 'focus' : 'normal';
  document.body.classList.toggle('focus-mode', currentMode === 'focus');
  document.body.classList.toggle('normal-mode', currentMode !== 'focus');
  updateMiniPanel();
  renderCameras(currentCameras);
  scheduleSidebarMapRefresh();
};

const updateCardSelectionUi = (cameraId) => {
  const normalizedId = String(cameraId);
  const cardEl = gridEl.querySelector(`.camera-card[data-camera-id="${normalizedId}"]`);
  if (!cardEl) {
    return;
  }

  const selected = selectedCameraIds.has(normalizedId);
  cardEl.classList.toggle('is-selected', selected);
  const selectBtn = cardEl.querySelector('.camera-card__select');
  if (selectBtn) {
    selectBtn.textContent = selected ? 'Selected' : 'Select';
    selectBtn.classList.toggle('active', selected);
  }
};

const toggleSelectedCamera = (cameraId, cameraData) => {
  const normalizedId = String(cameraId);
  let removedLastSelectionFromFocus = false;
  if (selectedCameraIds.has(normalizedId)) {
    selectedCameraIds.delete(normalizedId);
    selectedCameraMap.delete(normalizedId);
    if (selectedMapCameraId === normalizedId) {
      selectedMapCameraId = selectedCameraIds.size ? Array.from(selectedCameraIds)[0] : null;
    }
    removedLastSelectionFromFocus = currentMode === 'focus' && selectedCameraIds.size === 0;
  } else {
    selectedCameraIds.add(normalizedId);
    selectedMapCameraId = normalizedId;
    if (cameraData) {
      selectedCameraMap.set(normalizedId, cameraData);
    }
  }

  if (removedLastSelectionFromFocus) {
    addActivity('Normal mode restored', 'Semua kamera focus sudah di-unselect.', 'neutral');
    setMode('normal');
    return;
  }

  updateCardSelectionUi(normalizedId);
  updateMiniPanel();
  scheduleSidebarMapRefresh();
  if (currentMode === 'focus') {
    renderCameras(currentCameras);
  }
};

const enterFocusMode = () => {
  if (selectedCameraIds.size === 0) {
    addActivity('Focus mode skipped', 'Select one or more cameras first.', 'warning');
    return;
  }

  addActivity(
    'Focus mode enabled',
    `${selectedCameraIds.size} camera card(s) moved into multi-focus layout.`,
    'success'
  );
  setMode('focus');
};

const leaveFocusMode = () => {
  if (currentMode !== 'focus') {
    return;
  }

  addActivity('Normal mode restored', 'Toolbar stays hidden until you hover near the bottom.', 'neutral');
  setMode('normal');
};

const createCameraCard = (camera, index, options = {}) => {
  const slotIndex = Number.isInteger(options.slotIndex) ? options.slotIndex : index;
  const replaceable = Boolean(options.replaceable);
  const article = document.createElement('article');
  const selected = selectedCameraIds.has(String(camera.id));
  article.className = 'camera-card';
  article.style.animationDelay = `${Math.min(index * 45, 320)}ms`;
  article.classList.toggle('is-selected', selected);
  article.dataset.cameraId = String(camera.id);
  article.dataset.slotIndex = String(slotIndex);

  const videoWrap = document.createElement('div');
  videoWrap.className = 'camera-card__video-wrap';

  const videoEl = document.createElement('video');
  videoEl.className = 'stream-video';
  videoEl.autoplay = true;
  videoEl.muted = true;
  videoEl.controls = false;
  videoEl.playsInline = true;
  videoWrap.appendChild(videoEl);

  const headerEl = document.createElement('div');
  headerEl.className = 'camera-card__header';

  const badgesEl = document.createElement('div');
  badgesEl.className = 'camera-card__badges';
  const statusEl = document.createElement('span');
  statusEl.className = 'stream-status connecting';
  statusEl.textContent = 'Connecting';
  badgesEl.appendChild(statusEl);
  if (camera.gate_name) {
    const gateEl = document.createElement('span');
    gateEl.className = 'camera-card__tag';
    gateEl.textContent = camera.gate_name;
    badgesEl.appendChild(gateEl);
  }

  const actionsEl = document.createElement('div');
  actionsEl.className = 'camera-card__actions';
  const selectBtn = document.createElement('button');
  selectBtn.type = 'button';
  selectBtn.className = 'camera-card__select';
  selectBtn.classList.toggle('active', selected);
  selectBtn.textContent = selected ? 'Selected' : 'Select';
  selectBtn.dataset.action = 'toggle-select';
  selectBtn.dataset.cameraId = String(camera.id);
  const fullscreenBtn = document.createElement('button');
  fullscreenBtn.type = 'button';
  fullscreenBtn.className = 'camera-card__action';
  fullscreenBtn.textContent = '\u26F6';
  fullscreenBtn.setAttribute('aria-label', 'Fullscreen');
  fullscreenBtn.title = 'Fullscreen';
  fullscreenBtn.dataset.action = 'fullscreen';
  fullscreenBtn.dataset.cameraId = String(camera.id);
  if (replaceable) {
    const replaceBtn = document.createElement('button');
    replaceBtn.type = 'button';
    replaceBtn.className = 'camera-card__action';
    replaceBtn.textContent = '\u21c4';
    replaceBtn.setAttribute('aria-label', 'Replace slot');
    replaceBtn.title = 'Replace slot';
    replaceBtn.dataset.action = 'replace-slot';
    replaceBtn.dataset.slotIndex = String(slotIndex);
    actionsEl.appendChild(replaceBtn);
  }
  actionsEl.appendChild(selectBtn);
  actionsEl.appendChild(fullscreenBtn);
  headerEl.appendChild(badgesEl);
  headerEl.appendChild(actionsEl);

  const footerEl = document.createElement('div');
  footerEl.className = 'camera-card__footer';
  const metaEl = document.createElement('div');
  metaEl.className = 'camera-card__meta';
  const titleEl = document.createElement('h3');
  titleEl.className = 'camera-card__title';
  titleEl.textContent = camera.cctv_name || `Camera ${index + 1}`;
  const subtitleEl = document.createElement('p');
  subtitleEl.className = 'camera-card__subtitle';
  const cameraBranchCode = String(camera.branch_code || '').trim();
  const cameraBranchName = String(camera.branch_name || '').trim();
  const activeBranchCode = String((activeBranch && activeBranch.branch_code) || '').trim();
  const activeBranchName = String((activeBranch && activeBranch.branch_name) || '').trim();

  if (cameraBranchCode || cameraBranchName) {
    subtitleEl.textContent = `${cameraBranchCode || '-'} | ${cameraBranchName || 'Ruas kamera'}`;
  } else if (activeBranchCode || activeBranchName) {
    subtitleEl.textContent = `${activeBranchCode || '-'} | ${activeBranchName || 'Ruas aktif'}`;
  } else {
    subtitleEl.textContent = 'Ruas belum dipilih';
  }
  metaEl.appendChild(titleEl);
  metaEl.appendChild(subtitleEl);
  footerEl.appendChild(metaEl);
  article.appendChild(videoWrap);
  article.appendChild(headerEl);
  article.appendChild(footerEl);

  const focusBarEl = document.createElement('div');
  focusBarEl.className = 'camera-card__focus-bar';
  article.appendChild(focusBarEl);

  if (!camera.stream_play_url) {
    article.appendChild(renderEmptyStateCard(`${camera.cctv_name || 'Camera'}: no stream URL`));
    setStreamStatus(statusEl, camera.id, 'offline');
    return article;
  }

  try {
    attachStreamWithRetry(videoEl, camera.stream_play_url, statusEl, camera.id);
  } catch (error) {
    article.appendChild(renderEmptyStateCard(error.message));
    setStreamStatus(statusEl, camera.id, 'offline');
  }

  return article;
};

function renderCameras(cameras = []) {
  void cameras;
  clearPlayers();
  gridEl.classList.remove('loading');
  gridEl.innerHTML = '';
  gridEl.classList.toggle('grid--spotlight', currentMode !== 'focus' && gridLayout.type === 'spotlight');

  const visibleCameras = getRenderableCameras();
  if (!visibleCameras.length) {
    applyGridMetrics(1, 1);
    gridEl.appendChild(
      renderEmptyStateCard(
        currentMode === 'focus'
          ? 'No selected cameras available in this page.'
          : 'No camera data available for this page.'
      )
    );
    updateMiniPanel();
    return;
  }

  if (currentMode === 'focus') {
    const count = visibleCameras.length;
    const columns = count <= 2 ? count : count <= 4 ? 2 : count <= 6 ? 3 : count <= 9 ? 3 : 4;
    const rows = Math.max(1, Math.ceil(count / Math.max(columns, 1)));
    applyGridMetrics(columns || 1, rows);
    visibleCameras.forEach((camera, index) => {
      gridEl.appendChild(createCameraCard(camera, index, { replaceable: false }));
    });
    updateMiniPanel();
    return;
  }

  const limit = getLayoutCount();
  const normalVisible = getDisplayCamerasForGrid();

  if (gridLayout.type === 'spotlight') {
    applyGridMetrics(4, Math.max(2, Math.ceil(limit / 4)));
    for (let index = 0; index < limit; index += 1) {
      const camera = normalVisible[index];
      const node = camera
        ? createCameraCard(camera, index, { slotIndex: index, replaceable: true })
        : renderEmptyStateCard(`Slot ${index + 1} is empty`);
      if (camera && index < Number(gridLayout.mainCount || 1)) {
        node.classList.add('camera-card--main');
      }
      gridEl.appendChild(node);
    }
    updateMiniPanel();
    return;
  }

  applyGridMetrics(gridLayout.columns, gridLayout.rows);
  for (let index = 0; index < limit; index += 1) {
    const camera = normalVisible[index];
    gridEl.appendChild(
      camera
        ? createCameraCard(camera, index, { slotIndex: index, replaceable: true })
        : renderEmptyStateCard(`Slot ${index + 1} is empty`)
    );
  }
  updateMiniPanel();
}

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

const loadAllBranchCamerasForMap = async (branch) => {
  if (!branch || !branch.id) {
    branchWideCameras = [];
    sidebarMapShouldAutoFit = true;
    scheduleSidebarMapRefresh();
    return;
  }

  const cacheKey = `${branch.id}:${totalPages}`;
  if (branchWideCameraCache.has(cacheKey)) {
    branchWideCameras = branchWideCameraCache.get(cacheKey) || [];
    sidebarMapShouldAutoFit = true;
    scheduleSidebarMapRefresh();
    return;
  }

  const pagesToLoad = Math.max(1, totalPages);
  const pageRequests = Array.from({ length: pagesToLoad }, (_unused, index) => {
    const pageNumber = index + 1;
    return window.cameraService
      .getCamerasByBranch(branch.id, pageNumber)
      .then((response) => {
        if (response.status >= 400) {
          throw new Error(response.message || 'Failed to load branch map cameras.');
        }
        const pageItems = Array.isArray(response.data) ? response.data : [];
        return pageItems.map((camera) => ({
          ...camera,
          __sourcePage: pageNumber,
        }));
      });
  });

  try {
    const pageResults = await Promise.all(pageRequests);
    branchWideCameras = pageResults.flat();
    branchWideCameraCache.set(cacheKey, branchWideCameras);
    sidebarMapShouldAutoFit = true;
  } catch (error) {
    branchWideCameras = currentCameras.map((camera) => ({
      ...camera,
      __sourcePage: activePage,
    }));
    sidebarMapShouldAutoFit = true;
    addActivity('Map camera sync failed', error.message || 'Unable to load all map markers.', 'warning');
  }

  scheduleSidebarMapRefresh();
};

const loadBranchCameras = async (branch, page = 1) => {
  pickerStatusEl.textContent = `Loading cameras for ${branch.branch_name}...`;
  renderSkeletonCards(currentMode === 'focus' ? Math.max(selectedCameraIds.size, 1) : getLayoutCount());
  addActivity(
    'Loading branch cameras',
    `${branch.branch_code} - ${branch.branch_name} page ${page} is being prepared.`,
    'warning'
  );

  const response = await window.cameraService.getCamerasByBranch(branch.id, page);
  if (response.status >= 400) {
    throw new Error(response.message || 'Failed to load cameras.');
  }

  activeBranch = branch;
  activePage = page;
  currentCameras = (Array.isArray(response.data) ? response.data : []).map((camera) => ({
    ...camera,
    __sourcePage: page,
  }));
  currentCameras.forEach((camera) => {
    if (selectedCameraIds.has(String(camera.id))) {
      selectedCameraMap.set(String(camera.id), camera);
    }
  });
  renderCameras(currentCameras);
  updateCurrentBranchLabels();
  updatePagingUi();
  setReloadButtonState(false);
  hideModal(pickerEl);
  hideModal(searchModalEl);
  hideModal(layoutConfigModalEl);
  addActivity(
    'Camera grid ready',
    `${currentCameras.length} camera stream(s) loaded for ${branch.branch_name} page ${page}.`,
    'success'
  );
  void loadAllBranchCamerasForMap(branch);
};

const refreshCurrentStreams = async () => {
  if (isRefreshingStreams) {
    return;
  }

  if (!activeBranch || !activeBranch.id) {
    pickerStatusEl.textContent = 'Select branch first before reloading streams.';
    addActivity('Reload skipped', 'Choose a branch first.', 'warning');
    return;
  }

  Array.from(slotOverrides.keys()).forEach((key) => {
    if (key.startsWith(`${activeBranch.id}:${activePage}:`)) {
      slotOverrides.delete(key);
    }
  });
  Array.from(branchWideCameraCache.keys()).forEach((key) => {
    if (key.startsWith(`${activeBranch.id}:`)) {
      branchWideCameraCache.delete(key);
    }
  });

  setReloadButtonState(true);
  renderSkeletonCards(currentMode === 'focus' ? Math.max(selectedCameraIds.size, 1) : getLayoutCount());
  try {
    await loadBranchCameras(activeBranch, activePage);
    pickerStatusEl.textContent = `Streams reloaded for ${activeBranch.branch_name} (Page ${activePage}).`;
  } catch (error) {
    pickerStatusEl.textContent = error.message || 'Failed to reload streams.';
    addActivity('Reload failed', error.message || 'Failed to reload streams.', 'danger');
  } finally {
    setReloadButtonState(false);
  }
};

const createBranchButton = (branch, onSelect) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'branch-search-item';
  button.innerHTML = `<strong>${branch.branch_code || '-'}</strong><span>${branch.branch_name || '-'}</span>`;
  button.addEventListener('click', async () => {
    try {
      await loadBranchPages(branch.id);
      await loadBranchCameras(branch, 1);
      setPagingVisible(totalPages > 1);
      if (typeof onSelect === 'function') {
        onSelect();
      }
    } catch (error) {
      pickerStatusEl.textContent = error.message || 'Failed to load cameras.';
      addActivity('Branch load failed', error.message || 'Failed to load cameras.', 'danger');
      setPagingVisible(false);
    }
  });
  return button;
};

const filterBranches = (query) => {
  const normalized = String(query || '').trim().toLowerCase();
  if (!normalized) {
    return availableBranches;
  }

  return availableBranches.filter((branch) => {
    const code = String(branch.branch_code || '').toLowerCase();
    const name = String(branch.branch_name || '').toLowerCase();
    return code.includes(normalized) || name.includes(normalized);
  });
};

const renderBranchCollection = (containerEl, branches, emptyMessage, onSelect) => {
  containerEl.innerHTML = '';
  if (!branches.length) {
    containerEl.appendChild(renderEmptyStateCard(emptyMessage));
    return;
  }

  branches.forEach((branch) => containerEl.appendChild(createBranchButton(branch, onSelect)));
};

const ensureBranchList = async () => {
  if (availableBranches.length) {
    return availableBranches;
  }

  const response = await window.cameraService.getBranches();
  if (response.status >= 400) {
    throw new Error(response.message || 'Failed to load branches.');
  }

  availableBranches = Array.isArray(response.data) ? response.data : [];
  return availableBranches;
};

const renderBranchPickerResults = () => {
  const filteredBranches = filterBranches(branchSearchInputEl.value);
  pickerStatusEl.textContent = filteredBranches.length
    ? `Showing ${filteredBranches.length} branch result(s).`
    : 'No branch matched your search.';
  renderBranchCollection(
    branchListEl,
    filteredBranches,
    'No branch matched your search.',
    () => branchSearchInputEl.blur()
  );
};

const resolveCameraById = (cameraId) => {
  const normalizedId = String(cameraId);
  return (
    selectedCameraMap.get(normalizedId) ||
    currentCameras.find((camera) => String(camera.id) === normalizedId) ||
    Array.from(slotOverrides.values()).find((camera) => String(camera.id) === normalizedId) ||
    null
  );
};

const renderQuickSearchResults = async () => {
  const requestId = quickSearchRequestId + 1;
  quickSearchRequestId = requestId;
  quickSearchResultsEl.innerHTML = '';
  quickSearchResultsEl.appendChild(renderEmptyStateCard('Searching cameras...'));
  perfStats.searchRequests += 1;

  let filteredCameras = [];
  try {
    filteredCameras = await searchCameraCatalog(quickSearchInputEl.value);
  } catch (error) {
    if (quickSearchRequestId !== requestId) {
      return;
    }
    quickSearchResultsEl.innerHTML = '';
    quickSearchResultsEl.appendChild(
      renderEmptyStateCard(error.message || 'Failed to search camera catalog.')
    );
    return;
  }

  if (quickSearchRequestId !== requestId) {
    return;
  }

  quickSearchResultsEl.innerHTML = '';

  if (!filteredCameras.length) {
    quickSearchResultsEl.appendChild(renderEmptyStateCard('No camera matched your search.'));
    return;
  }

  filteredCameras.forEach((camera) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'branch-search-item';
    button.innerHTML = `
      <strong>${camera.cctv_name || `Camera ${camera.id || '-'}`}</strong>
      <span>${camera.gate_name || '-'} | ${camera.branch_code || '-'} | ${camera.branch_name || '-'}</span>
    `;
    button.addEventListener('click', () => {
      if (quickSearchContext.mode === 'replace-slot' && Number.isInteger(quickSearchContext.slotIndex)) {
        const slotIndex = quickSearchContext.slotIndex;
        slotOverrides.set(getSlotOverrideKey(slotIndex), camera);
        hideModal(searchModalEl);
        addActivity(
          'Camera slot updated',
          `${camera.cctv_name || 'Camera'} assigned to slot ${slotIndex + 1}.`,
          'success'
        );
        renderCameras(currentCameras);
        return;
      }

      selectedCameraIds.add(String(camera.id));
      selectedCameraMap.set(String(camera.id), camera);
      hideModal(searchModalEl);
      addActivity(
        'Camera selected',
        `${camera.cctv_name || 'Camera'} added to selection list.`,
        'success'
      );
      updateMiniPanel();
      if (currentMode === 'focus') {
        renderCameras(currentCameras);
      }
    });
    quickSearchResultsEl.appendChild(button);
  });
};

const scheduleQuickSearch = () => {
  if (quickSearchDebounceTimer) {
    clearTimeout(quickSearchDebounceTimer);
  }

  quickSearchDebounceTimer = window.setTimeout(() => {
    renderQuickSearchResults().catch((error) => {
      quickSearchResultsEl.innerHTML = '';
      quickSearchResultsEl.appendChild(
        renderEmptyStateCard(error.message || 'Failed to search camera catalog.')
      );
    });
  }, 280);
};

const openBranchPicker = async () => {
  showModal(pickerEl);
  pickerStatusEl.textContent = 'Loading branch list...';
  branchListEl.innerHTML = '';
  branchSearchInputEl.value = '';

  try {
    await ensureBranchList();
    renderBranchPickerResults();
    focusAndSelectInput(branchSearchInputEl);
    addActivity('Branch browser opened', 'Search or browse a branch to load camera cards.', 'neutral');
  } catch (error) {
    pickerStatusEl.textContent = error.message || 'Failed to load branches.';
    addActivity('Branch list unavailable', error.message || 'Failed to load branches.', 'danger');
  }
};

const openQuickSearch = async (options = {}) => {
  quickSearchContext = {
    mode: options.mode === 'replace-slot' ? 'replace-slot' : 'select',
    slotIndex: Number.isInteger(options.slotIndex) ? options.slotIndex : null,
  };

  showModal(searchModalEl);
  quickSearchInputEl.value = '';
  quickSearchResultsEl.innerHTML = '';
  searchModalTitleEl.textContent =
    quickSearchContext.mode === 'replace-slot' && Number.isInteger(quickSearchContext.slotIndex)
      ? `Replace Slot ${quickSearchContext.slotIndex + 1}`
      : 'Find Camera Item';
  quickSearchInputEl.placeholder =
    quickSearchContext.mode === 'replace-slot'
      ? 'Search camera to place into selected slot'
      : 'Search camera name, gate, branch, or code';

  try {
    await renderQuickSearchResults();
    focusAndSelectInput(quickSearchInputEl);
    addActivity(
      'Camera search opened',
      quickSearchContext.mode === 'replace-slot'
        ? `Choose a camera item for slot ${quickSearchContext.slotIndex + 1}.`
        : 'Search camera items and add them to selection.',
      'neutral'
    );
  } catch (error) {
    quickSearchResultsEl.appendChild(
      renderEmptyStateCard(error.message || 'Failed to load camera search catalog.')
    );
    addActivity('Camera search failed', error.message || 'Unable to load camera search.', 'danger');
  }
};

const openApiBaseUrlConfig = async () => {
  const now = Date.now();
  if (now - lastApiConfigOpenAt < 300) {
    return;
  }
  lastApiConfigOpenAt = now;

  const currentApiBaseUrl = await window.cameraService.getApiBaseUrl();
  const currentApiAuthToken = await window.cameraService.getApiAuthToken();
  apiBaseUrlInputEl.value = currentApiBaseUrl || '';
  apiAuthTokenInputEl.value = currentApiAuthToken || '';
  updateApiTokenInfo(currentApiAuthToken || '');
  setApiCheckStatus('Enter an API URL, then use Check URL to verify connectivity.', 'neutral');
  setApiCheckButtonState(false);
  showModal(apiConfigModalEl);
  focusAndSelectInput(apiBaseUrlInputEl);
};

const openLayoutConfig = () => {
  syncLayoutControls();
  showModal(layoutConfigModalEl);
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
  showModal(updateConfigModalEl);
  focusAndSelectInput(updateFeedUrlInputEl);
};

const closeAllTransientUi = () => {
  setToolbarMenuVisible(false);
  hideModal(pickerEl);
  hideModal(searchModalEl);
  hideModal(layoutConfigModalEl);
  hideModal(apiConfigModalEl);
  hideModal(updateConfigModalEl);
  hideHelp();
};

const isTypingField = (target) =>
  target instanceof HTMLElement &&
  (target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.tagName === 'SELECT' ||
    target.isContentEditable);

const handleGridClick = async (event) => {
  const actionButton = event.target instanceof HTMLElement ? event.target.closest('[data-action]') : null;
  if (!actionButton) {
    return;
  }

  event.stopPropagation();
  const action = actionButton.dataset.action;
  if (action === 'toggle-select') {
    const camera = resolveCameraById(actionButton.dataset.cameraId);
    if (camera) {
      toggleSelectedCamera(camera.id, camera);
    }
    return;
  }

  if (action === 'fullscreen') {
    const cardEl = actionButton.closest('.camera-card');
    if (!cardEl) {
      return;
    }
    try {
      await requestFullscreen(cardEl);
    } catch (_) {
      addActivity('Fullscreen blocked', 'Runtime denied the fullscreen request.', 'warning');
    }
    return;
  }

  if (action === 'replace-slot') {
    const slotIndex = Number.parseInt(actionButton.dataset.slotIndex || '-1', 10);
    if (!Number.isInteger(slotIndex) || slotIndex < 0) {
      return;
    }
    openQuickSearch({
      mode: 'replace-slot',
      slotIndex,
    }).catch((error) => {
      addActivity('Camera search failed', error.message || 'Unable to open camera search.', 'danger');
    });
  }
};

const handleGridDoubleClick = (event) => {
  const cardEl = event.target instanceof HTMLElement ? event.target.closest('.camera-card') : null;
  if (!cardEl || !cardEl.dataset.cameraId) {
    return;
  }
  const camera = resolveCameraById(cardEl.dataset.cameraId);
  if (!camera) {
    return;
  }
  if (!selectedCameraIds.has(String(camera.id))) {
    selectedCameraIds.add(String(camera.id));
    selectedCameraMap.set(String(camera.id), camera);
  }
  enterFocusMode();
};

let lastToolbarPointerCheckAt = 0;
const handleDocumentMouseMove = (event) => {
  const now = Date.now();
  if (now - lastToolbarPointerCheckAt < 90) {
    return;
  }
  lastToolbarPointerCheckAt = now;

  if (shouldShowToolbarByPointer(event.clientX, event.clientY)) {
    setToolbarVisible(true);
    scheduleToolbarAutoHide();
    return;
  }

  if (!toolbarPinnedByMouse && toolbarMenuPanel.classList.contains('hidden')) {
    scheduleToolbarAutoHide();
  }
};

document.addEventListener('keydown', (event) => {
  if (event.repeat) {
    return;
  }

  const typing = isTypingField(event.target);
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
  const pressedShiftG =
    event.shiftKey &&
    !event.ctrlKey &&
    !event.altKey &&
    !event.metaKey &&
    String(event.key || '').toLowerCase() === 'g';
  const pressedShiftF =
    event.shiftKey &&
    !event.ctrlKey &&
    !event.altKey &&
    !event.metaKey &&
    String(event.key || '').toLowerCase() === 'f';
  const pressedShiftN =
    event.shiftKey &&
    !event.ctrlKey &&
    !event.altKey &&
    !event.metaKey &&
    String(event.key || '').toLowerCase() === 'n';
  const pressedShiftR =
    event.shiftKey &&
    !event.ctrlKey &&
    !event.altKey &&
    !event.metaKey &&
    String(event.key || '').toLowerCase() === 'r';
  const pressedQuickSearch =
    !event.shiftKey &&
    !event.altKey &&
    !event.metaKey &&
    event.ctrlKey &&
    String(event.key || '').toLowerCase() === 'k';

  if (event.key === 'Escape') {
    closeAllTransientUi();
    leaveFocusMode();
    return;
  }

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

  if (pressedShiftG) {
    event.preventDefault();
    openLayoutConfig();
    return;
  }

  if (pressedShiftF) {
    event.preventDefault();
    enterFocusMode();
    return;
  }

  if (pressedShiftN) {
    event.preventDefault();
    leaveFocusMode();
    return;
  }

  if (pressedShiftR) {
    event.preventDefault();
    refreshCurrentStreams();
    return;
  }

  if (pressedQuickSearch && !typing) {
    event.preventDefault();
    openQuickSearch().catch(() => {
      addActivity('Quick search failed', 'Unable to open quick search.', 'danger');
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

closePickerBtn.addEventListener('click', () => hideModal(pickerEl));
closeSearchBtn.addEventListener('click', () => hideModal(searchModalEl));
closeLayoutConfigBtn.addEventListener('click', () => hideModal(layoutConfigModalEl));
toolbarMenuBtn.addEventListener('click', (event) => {
  event.stopPropagation();
  toggleToolbarMenu();
});
openBranchBtn.addEventListener('click', () => {
  openBranchPicker().catch((error) => {
    addActivity('Branch picker failed', error.message || 'Unable to open branch picker.', 'danger');
  });
});
quickSearchBtn.addEventListener('click', () => {
  openQuickSearch().catch((error) => {
    addActivity('Quick search failed', error.message || 'Unable to open quick search.', 'danger');
  });
});
layoutConfigBtn.addEventListener('click', openLayoutConfig);
focusModeBtn.addEventListener('click', enterFocusMode);
normalModeBtn.addEventListener('click', leaveFocusMode);
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
reloadStreamBtn.addEventListener('click', refreshCurrentStreams);
closeApiConfigBtn.addEventListener('click', () => hideModal(apiConfigModalEl));
closeUpdateConfigBtn.addEventListener('click', () => hideModal(updateConfigModalEl));
closeHelpBtn.addEventListener('click', hideHelp);
gridEl.addEventListener('click', (event) => {
  void handleGridClick(event);
});
gridEl.addEventListener('dblclick', handleGridDoubleClick);

document.addEventListener('click', (event) => {
  if (!toolbarMenuPanel.classList.contains('hidden')) {
    if (!toolbarMenuPanel.contains(event.target) && !toolbarMenuBtn.contains(event.target)) {
      setToolbarMenuVisible(false);
    }
  }

  [pickerEl, searchModalEl, layoutConfigModalEl, apiConfigModalEl, updateConfigModalEl, helpModalEl].forEach((modalEl) => {
    if (event.target === modalEl) {
      hideModal(modalEl);
    }
  });
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
  handleDocumentMouseMove(event);
});

branchSearchInputEl.addEventListener('input', renderBranchPickerResults);
quickSearchInputEl.addEventListener('input', () => {
  scheduleQuickSearch();
});
layoutPresetSelectEl.addEventListener('change', updateLayoutInputAvailability);
apiBaseUrlInputEl.addEventListener('input', () => {
  setApiCheckStatus('Click Check URL to validate the current API address.', 'neutral');
});
apiAuthTokenInputEl.addEventListener('input', () => {
  setApiCheckStatus('Click Check URL to validate the current API address.', 'neutral');
  updateApiTokenInfo(apiAuthTokenInputEl.value);
});

apiConfigFormEl.addEventListener('submit', async (event) => {
  event.preventDefault();
  const nextApiBaseUrl = apiBaseUrlInputEl.value.trim();
  const nextApiAuthToken = apiAuthTokenInputEl.value.trim();
  if (!nextApiBaseUrl) {
    pickerStatusEl.textContent = 'API_BASE_URL cannot be empty.';
    return;
  }

  const response = await window.cameraService.setApiConfig(nextApiBaseUrl, nextApiAuthToken);
  if (response.status >= 400) {
    pickerStatusEl.textContent = response.message || 'Failed to update API_BASE_URL.';
    addActivity('API update failed', response.message || 'Failed to update API base URL.', 'danger');
    return;
  }

  const updatedApiBaseUrl =
    response && response.data && response.data.apiBaseUrl ? response.data.apiBaseUrl : '';
  setApiBaseUrlText(updatedApiBaseUrl);
  pickerStatusEl.textContent = `API_BASE_URL updated to ${updatedApiBaseUrl}`;
  hideModal(apiConfigModalEl);
  addActivity(
    'API updated',
    nextApiAuthToken
      ? `API base URL and bearer token updated for ${updatedApiBaseUrl}.`
      : `API base URL updated to ${updatedApiBaseUrl}.`,
    'success'
  );
});

checkApiConfigBtn.addEventListener('click', async () => {
  if (isCheckingApiConfig) {
    return;
  }

  const candidateApiBaseUrl = apiBaseUrlInputEl.value.trim();
  const candidateApiAuthToken = apiAuthTokenInputEl.value.trim();
  if (!candidateApiBaseUrl) {
    setApiCheckStatus('API_BASE_URL cannot be empty.', 'warning');
    return;
  }

  setApiCheckButtonState(true);
  setApiCheckStatus('Checking API health endpoint...', 'neutral');

  try {
    const response = await window.cameraService.checkApiBaseUrl(
      candidateApiBaseUrl,
      candidateApiAuthToken
    );
    if (response.status >= 400) {
      throw new Error(response.message || 'Failed to verify API URL.');
    }

    const data = response.data || {};
    setApiCheckStatus(
      `${data.message || 'API health check succeeded.'} (${data.apiBaseUrl || candidateApiBaseUrl})`,
      'success'
    );
  } catch (error) {
    setApiCheckStatus(error.message || 'API URL check failed.', 'danger');
  } finally {
    setApiCheckButtonState(false);
  }
});

updateConfigFormEl.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (saveUpdateConfigBtn.disabled) {
    pickerStatusEl.textContent = 'Auto update feed is read-only in electron-updater mode.';
    hideModal(updateConfigModalEl);
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
    addActivity('Update config failed', response.message || 'Failed to update feed.', 'danger');
    return;
  }

  const data = response.data || {};
  setUpdateStatusText(`Feed configured (${data.source || 'config'}).`, 'ready');
  pickerStatusEl.textContent = `Update source configured to ${data.feedUrl || '-'}`;
  hideModal(updateConfigModalEl);
  addActivity('Updater configured', `Update source set to ${data.feedUrl || '-'}.`, 'success');
});

layoutConfigFormEl.addEventListener('submit', (event) => {
  event.preventDefault();
  const preset = String(layoutPresetSelectEl.value || '5x4');
  const mainCount = Math.max(1, Number.parseInt(layoutMainCountInputEl.value, 10) || 1);
  const sideCount = Math.max(1, Number.parseInt(layoutSideCountInputEl.value, 10) || 6);

  if (preset === '4x4') {
    setGridLayoutState({ type: '4x4', columns: 4, rows: 4, limit: 16, mainCount, sideCount });
  } else if (preset === '3x3') {
    setGridLayoutState({ type: '3x3', columns: 3, rows: 3, limit: 9, mainCount, sideCount });
  } else if (preset === 'spotlight') {
    setGridLayoutState({
      type: 'spotlight',
      columns: 4,
      rows: 4,
      limit: mainCount + sideCount,
      mainCount,
      sideCount,
    });
  } else {
    setGridLayoutState({ type: '5x4', columns: 5, rows: 4, limit: 20, mainCount, sideCount });
  }

  hideModal(layoutConfigModalEl);
  addActivity(
    'Grid layout updated',
    preset === 'spotlight'
      ? `Layout main ${mainCount} + side ${sideCount} applied.`
      : `Layout ${preset} applied.`,
    'success'
  );
  renderCameras(currentCameras);
});

prevPageBtn.addEventListener('click', async () => {
  if (!activeBranch || activePage <= 1) {
    return;
  }

  try {
    await loadBranchCameras(activeBranch, activePage - 1);
  } catch (error) {
    pickerStatusEl.textContent = error.message || 'Failed to load cameras.';
    addActivity('Page change failed', error.message || 'Failed to load cameras.', 'danger');
  }
});

nextPageBtn.addEventListener('click', async () => {
  if (!activeBranch || activePage >= totalPages) {
    return;
  }

  try {
    await loadBranchCameras(activeBranch, activePage + 1);
  } catch (error) {
    pickerStatusEl.textContent = error.message || 'Failed to load cameras.';
    addActivity('Page change failed', error.message || 'Failed to load cameras.', 'danger');
  }
});

checkUpdateBtn.addEventListener('click', async () => {
  if (isCheckingUpdate) {
    return;
  }

  setUpdateButtonState(true);
  setUpdateStatusText('Checking for update...', 'checking');
  addActivity('Updater running', 'Checking for a new desktop build.', 'warning');

  try {
    const response = await window.appUpdater.checkForUpdates();
    if (response.status >= 400) {
      throw new Error(response.message || 'Failed to check update.');
    }
  } catch (error) {
    setUpdateStatusText(error.message || 'Failed to check update.', 'error');
    setUpdateButtonState(false);
    addActivity('Update check failed', error.message || 'Failed to check for update.', 'danger');
  }
});

updatePagingUi();
setPagingVisible(false);
setReloadButtonState(false);
setToolbarMenuVisible(false);
setToolbarVisible(false);
if (ACTIVE_UI_THEME) {
  document.body.classList.add(ACTIVE_UI_THEME);
}
syncLayoutControls();
renderSkeletonCards(getLayoutCount());
setUpdateStatusText('Updater idle', 'ready');
addActivity('Dashboard ready', 'Waiting for branch selection or quick search.', 'neutral');
startPerfObserver();
window.addEventListener('beforeunload', () => {
  stopPerfObserver();
  clearPlayers();
});

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
    setUpdateStatusText(normalizeUpdateMessage(response.data), response.data && response.data.state);
  })
  .catch((error) => {
    setUpdateStatusText(error.message || 'Updater status unavailable.', 'error');
  });

window.appUpdater.onStatus((payload) => {
  const state = payload && payload.state ? String(payload.state) : '';
  latestUpdatePayload = payload || latestUpdatePayload;
  syncUpdateInfoCard(latestUpdatePayload);
  setUpdateStatusText(normalizeUpdateMessage(payload), state);

  if (state === 'checking' || state === 'downloading') {
    setUpdateButtonState(true);
    return;
  }

  if (state) {
    addActivity('Updater status changed', normalizeUpdateMessage(payload), getUpdateTone(state));
  }
  setUpdateButtonState(false);
});

window.cameraService.onOpenBranchPicker(openBranchPicker);
window.cameraService.onOpenApiBaseUrlConfig(openApiBaseUrlConfig);
window.cameraService.onOpenUpdateFeedConfig(openUpdateFeedConfig);
window.cameraService.onOpenHelp(showHelp);
window.cameraService.onOpenCameraSearch(() => {
  openQuickSearch().catch((error) => {
    addActivity('Quick search failed', error.message || 'Unable to open quick search.', 'danger');
  });
});
window.cameraService.onOpenLayoutConfig(openLayoutConfig);
window.cameraService.onEnterFocusMode(enterFocusMode);
window.cameraService.onLeaveFocusMode(leaveFocusMode);
window.cameraService.onReloadStreams(refreshCurrentStreams);
