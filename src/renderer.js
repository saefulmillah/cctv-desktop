const gridEl = document.getElementById('cameraGrid');
const toolbarEl = document.getElementById('toolbar');
const toolbarMenuBtn = document.getElementById('toolbarMenuBtn');
const toolbarMenuPanel = document.getElementById('toolbarMenuPanel');
const openBranchBtn = document.getElementById('openBranchBtn');
const quickSearchBtn = document.getElementById('quickSearchBtn');
const layoutConfigBtn = document.getElementById('layoutConfigBtn');
const focusModeBtn = document.getElementById('focusModeBtn');
const normalModeBtn = document.getElementById('normalModeBtn');
const menuAppearanceBtn = document.getElementById('menuAppearanceBtn');
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
const assetMapVersionEyebrowEl = document.getElementById('assetMapVersionEyebrow');
const apiBaseUrlLabelEl = document.getElementById('apiBaseUrlLabel');
const updateStatusBadgeEl = document.getElementById('updateStatusBadge');
const activityFeedEl = document.getElementById('activityFeed');
const onlineCountEl = document.getElementById('onlineCount');
const offlineCountEl = document.getElementById('offlineCount');
const selectedCountEl = document.getElementById('selectedCount');
const sidebarMapEl = document.getElementById('sidebarMap');
const sidebarMapLoadingEl = document.getElementById('sidebarMapLoading');
const sidebarMapEmptyEl = document.getElementById('sidebarMapEmpty');
const sidebarMapTitleEl = document.getElementById('sidebarMapTitle');
const resetWorkspaceBtn = document.getElementById('resetWorkspaceBtn');

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
const checkApiConfigBtn = document.getElementById('checkApiConfigBtn');
const apiCheckStatusEl = document.getElementById('apiCheckStatus');
const appearanceConfigModalEl = document.getElementById('appearanceConfigModal');
const closeAppearanceConfigBtn = document.getElementById('closeAppearanceConfigBtn');
const appearanceConfigFormEl = document.getElementById('appearanceConfigForm');
const appearanceFontFamilySelectEl = document.getElementById('appearanceFontFamilySelect');
const appearanceWeatherIconStyleSelectEl = document.getElementById('appearanceWeatherIconStyleSelect');
const appearanceWeatherIconColorInputEl = document.getElementById('appearanceWeatherIconColorInput');
const appearanceWeatherIconAnimatedEl = document.getElementById('appearanceWeatherIconAnimated');
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
const healthMonitorPanelEl = document.getElementById('healthMonitorPanel');
const healthMonitorGridEl = document.getElementById('healthMonitorGrid');
const closeHealthMonitorBtn = document.getElementById('closeHealthMonitorBtn');
const authModalEl = document.getElementById('authModal');
const authFormEl = document.getElementById('authForm');
const authStatusEl = document.getElementById('authStatus');
const authUsernameInputEl = document.getElementById('authUsernameInput');
const authPasswordInputEl = document.getElementById('authPasswordInput');
const authLoginBtn = document.getElementById('authLoginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const profileMenuBtn = document.getElementById('profileMenuBtn');
const profileMenuBtnLabel = document.getElementById('profileMenuBtnLabel');
const profileMenuPanel = document.getElementById('profileMenuPanel');
const profileDisplayNameEl = document.getElementById('profileDisplayName');
const profileRoleTextEl = document.getElementById('profileRoleText');
const profileEmailTextEl = document.getElementById('profileEmailText');
const capabilityApi = window.appCapability;
const sessionStore = window.appSessionStore;

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
let lastAppearanceConfigOpenAt = 0;
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
let workspacePersistTimer = null;
let workspaceRestoreInProgress = false;
let globalWatchdogTimer = null;
let perfObserverTimer = null;
let healthMonitorTimer = null;
let playerAttachSequence = 0;
let googleMapsLoaderPromise = null;
let markerClustererLoaderPromise = null;
let sidebarMapInstance = null;
let sidebarTrafficLayer = null;
let sidebarMapMarkers = [];
let sidebarMarkerCluster = null;
let sidebarClusterTooltipEl = null;
let sidebarClusterHoverCloseTimer = null;
let sidebarClusterHoverOpenTimer = null;
let activeClusterTooltipKey = null;
let sidebarMapRefreshTimer = null;
let sidebarMapShouldAutoFit = true;
let sidebarMapViewportLocked = false;
let sidebarMapProjectionOverlay = null;
let sidebarMapProjectionReadyPromise = null;
let spiderfyLegs = [];
let spiderfyTempMarkers = [];
let spiderfiedMarkerIds = new Set();
let spiderfySourceCameraId = null;
let spiderfyClusterMarker = null;
let selectedMapCameraId = null;
let suppressSidebarMapClickUntil = 0;
let authBootstrapCompleted = false;
let isSubmittingLogin = false;
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
const WORKSPACE_STATE_VERSION = 1;
const WORKSPACE_PERSIST_DELAY_MS = 1400;
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
const WATCHDOG_WARMUP_MS = 12000;
const WATCHDOG_CONSECUTIVE_STUCK_SAMPLES = 2;
const STREAM_RECOVERY_MAX_RETRIES = 6;
const STREAM_SOURCE_FAST_RETRIES = 3;
const STREAM_SOURCE_COOLDOWN_DELAYS_MS = [30000, 60000, 120000, 300000];
const ONLINE_MARKER_URL = new URL('./assets/marker-map-online.svg', window.location.href).toString();
const OFFLINE_MARKER_URL = new URL('./assets/marker-map-offline.svg', window.location.href).toString();
const ANONYMOUS_SESSION =
  capabilityApi && typeof capabilityApi.createAnonymousSession === 'function'
    ? capabilityApi.createAnonymousSession()
    : {
        isAuthenticated: false,
        token: '',
        user: null,
        roles: [],
        permissions: [],
        branchScopes: [],
        canViewAllBranches: false,
      };

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

const setInnerHtmlIfChanged = (element, value) => {
  if (!element) {
    return;
  }
  const normalized = String(value ?? '');
  if (!PERF_FLAGS.USE_DOM_PATCH_GUARDS) {
    element.innerHTML = normalized;
    return;
  }
  if (element.innerHTML !== normalized) {
    element.innerHTML = normalized;
  }
};

const getDefaultGridLayout = () => ({
  type: '5x4',
  columns: 5,
  rows: 4,
  limit: 20,
  mainCount: 1,
  sideCount: 6,
});

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
  setTextIfChanged(assetMapVersionEyebrowEl, value || '-');
};

const normalizeAppearanceConfig = (payload) => {
  const source = payload && typeof payload === 'object' ? payload : {};
  const requestedFontFamily = String(source.fontFamily || '').trim().toLowerCase();
  const requestedWeatherIconStyle = String(source.weatherIconStyle || '').trim().toLowerCase();
  const rawMonochromeColor = String(source.weatherIconMonochromeColor || '').trim();
  const normalizedColorValue = rawMonochromeColor.startsWith('#')
    ? rawMonochromeColor.slice(1)
    : rawMonochromeColor;
  return {
    fontFamily: APP_FONT_FAMILIES[requestedFontFamily] ? requestedFontFamily : DEFAULT_APPEARANCE_CONFIG.fontFamily,
    weatherIconStyle: WEATHER_ICON_STYLES.has(requestedWeatherIconStyle)
      ? requestedWeatherIconStyle
      : DEFAULT_APPEARANCE_CONFIG.weatherIconStyle,
    weatherIconMonochromeColor: /^[0-9a-fA-F]{6}$/.test(normalizedColorValue)
      ? `#${normalizedColorValue.toUpperCase()}`
      : DEFAULT_APPEARANCE_CONFIG.weatherIconMonochromeColor,
    weatherIconAnimated:
      source.weatherIconAnimated === undefined
        ? DEFAULT_APPEARANCE_CONFIG.weatherIconAnimated
        : Boolean(source.weatherIconAnimated),
  };
};

const getAppFontFamilyStack = (fontFamily) =>
  APP_FONT_FAMILIES[String(fontFamily || '').trim().toLowerCase()] ||
  APP_FONT_FAMILIES[DEFAULT_APPEARANCE_CONFIG.fontFamily];

const applyAppearanceConfig = (payload) => {
  currentAppearanceConfig = normalizeAppearanceConfig(payload);
  const fontStack = getAppFontFamilyStack(currentAppearanceConfig.fontFamily);
  document.documentElement.style.setProperty('--font-family-base', fontStack);
  window.__APP_FONT_FAMILY_STACK = fontStack;
  window.__APP_APPEARANCE = { ...currentAppearanceConfig };
  if (appearanceFontFamilySelectEl) {
    appearanceFontFamilySelectEl.value = currentAppearanceConfig.fontFamily;
  }
  if (appearanceWeatherIconStyleSelectEl) {
    appearanceWeatherIconStyleSelectEl.value = currentAppearanceConfig.weatherIconStyle;
  }
  if (appearanceWeatherIconColorInputEl) {
    appearanceWeatherIconColorInputEl.value = currentAppearanceConfig.weatherIconMonochromeColor;
    appearanceWeatherIconColorInputEl.disabled = currentAppearanceConfig.weatherIconStyle !== 'monochrome-color';
  }
  if (appearanceWeatherIconAnimatedEl) {
    appearanceWeatherIconAnimatedEl.checked = Boolean(currentAppearanceConfig.weatherIconAnimated);
  }
  window.dispatchEvent(
    new CustomEvent('app-appearance-change', {
      detail: { ...currentAppearanceConfig },
    })
  );
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

const setSidebarMapLoadingVisible = (visible) => {
  if (!sidebarMapLoadingEl) {
    return;
  }
  sidebarMapLoadingEl.classList.toggle('sidebar-section-hidden', !visible);
};

const setApiCheckStatus = (message, tone = 'neutral') => {
  setClassNameIfChanged(apiCheckStatusEl, `api-check-status ${tone}`);
  setTextIfChanged(apiCheckStatusEl, String(message || '-'));
};

const formatBytes = (bytes) => {
  const value = Number(bytes);
  if (!Number.isFinite(value) || value <= 0) {
    return '-';
  }
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = value;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  return `${size.toFixed(size >= 100 ? 0 : size >= 10 ? 1 : 2)} ${units[unitIndex]}`;
};

const getRendererHeapStats = () => {
  if (!window.performance || !window.performance.memory) {
    return {
      used: '-',
      total: '-',
      limit: '-',
    };
  }
  return {
    used: formatBytes(window.performance.memory.usedJSHeapSize),
    total: formatBytes(window.performance.memory.totalJSHeapSize),
    limit: formatBytes(window.performance.memory.jsHeapSizeLimit),
  };
};

const renderHealthMonitor = () => {
  if (!healthMonitorGridEl) {
    return;
  }
  const heapStats = getRendererHeapStats();
  const branchMapCameraCount = branchWideCameras.length || currentCameras.length;
  const cards = [
    ['Mode', currentMode === 'focus' ? 'Focus' : 'Normal'],
    ['Branch', activeBranch ? activeBranch.branch_code || activeBranch.branch_name || '-' : '-'],
    ['Active Page', String(activePage || 1)],
    ['Selected', String(selectedCameraIds.size)],
    ['Players', String(playerControllers.size)],
    ['Reconnect Timers', String(reconnectTimers.size)],
    ['Map Markers', String(sidebarMapMarkers.length)],
    ['Branch Cameras', String(branchMapCameraCount)],
    ['Map Cache', String(branchWideCameraCache.size)],
    ['Recovering Streams', String(Array.from(playerControllers.values()).filter((controller) => controller && controller.recovering).length)],
    ['Heap Used', heapStats.used],
    ['Heap Total', heapStats.total],
    ['Heap Limit', heapStats.limit],
    ['Last Activity', activityItems[0] ? activityItems[0].title : '-'],
  ];
  setInnerHtmlIfChanged(
    healthMonitorGridEl,
    cards
      .map(
        ([label, value]) => `
          <div class="health-monitor__card">
            <span class="health-monitor__label">${label}</span>
            <strong class="health-monitor__value">${value}</strong>
          </div>
        `
      )
      .join('')
  );
};

const setHealthMonitorVisible = (visible) => {
  if (!healthMonitorPanelEl) {
    return;
  }
  healthMonitorPanelEl.classList.toggle('hidden', !visible);
  healthMonitorPanelEl.setAttribute('aria-hidden', visible ? 'false' : 'true');
  if (visible) {
    renderHealthMonitor();
    if (!healthMonitorTimer) {
      healthMonitorTimer = window.setInterval(renderHealthMonitor, 3000);
    }
    return;
  }
  if (healthMonitorTimer) {
    clearInterval(healthMonitorTimer);
    healthMonitorTimer = null;
  }
};

const toggleHealthMonitor = () => {
  if (!healthMonitorPanelEl) {
    return;
  }
  setHealthMonitorVisible(healthMonitorPanelEl.classList.contains('hidden'));
};

const setApiCheckButtonState = (checking) => {
  isCheckingApiConfig = checking;
  checkApiConfigBtn.disabled = checking;
  checkApiConfigBtn.textContent = checking ? 'Checking...' : 'Check URL';
};

const getSessionSnapshot = () =>
  sessionStore && typeof sessionStore.getState === 'function'
    ? sessionStore.getState()
    : { ...ANONYMOUS_SESSION };

const hasPermission = (permissionCode) =>
  Boolean(capabilityApi && capabilityApi.hasPermission(getSessionSnapshot(), permissionCode));

const canUseCctv = () =>
  Boolean(capabilityApi && capabilityApi.canUseCctv(getSessionSnapshot()));

const canUseAssetMonitoring = () =>
  Boolean(capabilityApi && capabilityApi.canUseAssetMonitoring(getSessionSnapshot()));

const isBranchAllowed = (branchId) =>
  Boolean(capabilityApi && capabilityApi.canAccessBranch(getSessionSnapshot(), branchId));

const getAllowedBranches = (branches) =>
  capabilityApi && typeof capabilityApi.filterAllowedBranches === 'function'
    ? capabilityApi.filterAllowedBranches(getSessionSnapshot(), branches)
    : Array.isArray(branches)
      ? branches
      : [];

const applySessionToUi = (session) => {
  const normalizedSession =
    session && typeof session === 'object' ? session : { ...ANONYMOUS_SESSION };
  const displayName =
    normalizedSession.user &&
    (normalizedSession.user.display_name ||
      normalizedSession.user.username ||
      normalizedSession.user.email)
      ? normalizedSession.user.display_name ||
        normalizedSession.user.username ||
        normalizedSession.user.email
      : '-';
  const primaryRole =
    Array.isArray(normalizedSession.roles) && normalizedSession.roles.length
      ? normalizedSession.roles[0]
      : '-';
  const email =
    normalizedSession.user && normalizedSession.user.email
      ? normalizedSession.user.email
      : '-';
  const greetingName =
    normalizedSession.user &&
    (normalizedSession.user.username || normalizedSession.user.display_name || normalizedSession.user.email)
      ? normalizedSession.user.username ||
        normalizedSession.user.display_name ||
        normalizedSession.user.email
      : '-';

  setTextIfChanged(profileMenuBtnLabel, `Hi, ${greetingName}`);
  setTextIfChanged(profileDisplayNameEl, displayName);
  setTextIfChanged(profileRoleTextEl, `Role: ${primaryRole}`);
  setTextIfChanged(profileEmailTextEl, `Email: ${email}`);

  if (logoutBtn) {
    logoutBtn.disabled = !normalizedSession.isAuthenticated;
  }
  if (profileMenuBtn) {
    profileMenuBtn.disabled = !normalizedSession.isAuthenticated;
  }
  if (!normalizedSession.isAuthenticated) {
    setProfileMenuVisible(false);
  }
  if (openBranchBtn) {
    openBranchBtn.disabled = !normalizedSession.isAuthenticated || !canUseCctv();
  }
  if (quickSearchBtn) {
    quickSearchBtn.disabled = !normalizedSession.isAuthenticated || !canUseCctv();
  }
  if (layoutConfigBtn) {
    layoutConfigBtn.disabled = !normalizedSession.isAuthenticated || !canUseCctv();
  }
  if (focusModeBtn) {
    focusModeBtn.disabled = !normalizedSession.isAuthenticated || !canUseCctv() || selectedCameraIds.size === 0;
  }
  if (reloadStreamBtn) {
    reloadStreamBtn.disabled = !normalizedSession.isAuthenticated || !canUseCctv() || !activeBranch;
  }
  document.body.classList.toggle('auth-locked', !normalizedSession.isAuthenticated);
};

const setAuthStatus = (message, tone = 'neutral') => {
  if (!authStatusEl) {
    return;
  }
  setClassNameIfChanged(authStatusEl, `picker-status auth-status ${tone}`);
  setTextIfChanged(authStatusEl, String(message || '-'));
};

const setAuthModalVisible = (visible) => {
  if (!authModalEl) {
    return;
  }
  authModalEl.classList.toggle('visible', visible);
  authModalEl.classList.toggle('hidden', !visible);
  authModalEl.setAttribute('aria-hidden', visible ? 'false' : 'true');
  document.body.classList.toggle('auth-modal-open', visible);
  if (visible && authUsernameInputEl) {
    window.setTimeout(() => focusAndSelectInput(authUsernameInputEl), 20);
  }
};

const setLoginButtonState = (submitting) => {
  isSubmittingLogin = submitting;
  if (!authLoginBtn) {
    return;
  }
  authLoginBtn.disabled = submitting;
  authLoginBtn.textContent = submitting ? 'Logging in...' : 'Login';
};

const ensureAuthenticated = (message = 'Silakan login terlebih dahulu.') => {
  const session = getSessionSnapshot();
  if (session && session.isAuthenticated) {
    return session;
  }
  setAuthStatus(message, 'warning');
  setAuthModalVisible(true);
  throw new Error(message);
};

const ensureCctvAccess = () => {
  ensureAuthenticated();
  if (canUseCctv()) {
    return;
  }
  throw new Error('Akun ini tidak memiliki akses CCTV.');
};

const syncSessionState = (session) => {
  if (sessionStore && typeof sessionStore.set === 'function') {
    sessionStore.set(session || ANONYMOUS_SESSION);
  }
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
  reloadStreamBtn.disabled = refreshing || !hasActiveBranch || !canUseCctv();
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
window.showHelp = showHelp;
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
  toolbarMenuBtn.setAttribute('aria-expanded', visible ? 'true' : 'false');
};

const setProfileMenuVisible = (visible) => {
  if (!profileMenuBtn || !profileMenuPanel) {
    return;
  }
  profileMenuPanel.classList.toggle('hidden', !visible);
  profileMenuBtn.setAttribute('aria-expanded', visible ? 'true' : 'false');
};
window.__HKTV_SET_PROFILE_MENU_VISIBLE__ = setProfileMenuVisible;

const DEFAULT_APPEARANCE_CONFIG = {
  fontFamily: 'inter',
  weatherIconStyle: 'flat',
  weatherIconMonochromeColor: '#FFFFFF',
  weatherIconAnimated: true,
};

const APP_FONT_FAMILIES = {
  inter: "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  sora: "'Sora', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  nunito: "'Nunito', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  rajdhani: "'Rajdhani', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
};

const WEATHER_ICON_STYLES = new Set(['flat', 'fill', 'monochrome', 'monochrome-color']);

let currentAppearanceConfig = { ...DEFAULT_APPEARANCE_CONFIG };

const toggleToolbarMenu = () => {
  const nextVisible = toolbarMenuPanel.classList.contains('hidden');
  if (nextVisible) {
    setProfileMenuVisible(false);
    const assetFilterPopupEl = document.getElementById('assetFilterPopup');
    const assetFilterBtnEl = document.getElementById('assetFilterBtn');
    const foControlPopupEl = document.getElementById('foControlPopup');
    const foControlBtnEl = document.getElementById('foControlBtn');
    if (assetFilterPopupEl) {
      assetFilterPopupEl.classList.add('hidden');
    }
    if (assetFilterBtnEl) {
      assetFilterBtnEl.setAttribute('aria-expanded', 'false');
    }
    if (foControlPopupEl) {
      foControlPopupEl.classList.add('hidden');
    }
    if (foControlBtnEl) {
      foControlBtnEl.setAttribute('aria-expanded', 'false');
    }
  }
  setToolbarMenuVisible(nextVisible);
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
  if (healthMonitorPanelEl && !healthMonitorPanelEl.classList.contains('hidden')) {
    renderHealthMonitor();
  }
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

const getMapCameraCollection = () => {
  return branchWideCameras.length ? branchWideCameras : currentCameras;
};

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
  return `${normalized.slice(0, Math.max(0, maxLength - 3)).trimEnd()}...`;
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

const buildSpiderfyLabelConfig = (camera) => {
  if (!camera || !spiderfiedMarkerIds.has(String(camera.id))) {
    return null;
  }
  const selected = String(camera.id) === String(selectedMapCameraId);
  return {
    text: shortenMarkerLabel(normalizeMarkerLabelSource(camera), selected ? 18 : 12),
    className: selected ? 'map-marker-label map-marker-label--selected' : 'map-marker-label',
  };
};

const getSpiderfyLabelOrigin = (xOffset, yOffset) => {
  if (yOffset <= 0) {
    return new window.google.maps.Point(16, -14);
  }
  return new window.google.maps.Point(16, 42);
};

const applySpiderfyMarkerLabels = () => {
  sidebarMapMarkers.forEach((entry) => {
    if (!entry || !entry.marker || !entry.camera) {
      return;
    }
    entry.marker.setLabel(buildSpiderfyLabelConfig(entry.camera));
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
    const pageNumber = Number(camera.__sourcePage || camera.page || activePage || 1);
    pageMap.set(
      String(camera.id),
      Number.isFinite(pageNumber) && pageNumber > 0 ? pageNumber : Math.max(1, Number(activePage || 1))
    );
  });
  return pageMap;
};

const clearSidebarMapMarkers = () => {
  if (sidebarClusterHoverOpenTimer) {
    clearTimeout(sidebarClusterHoverOpenTimer);
    sidebarClusterHoverOpenTimer = null;
  }
  if (sidebarClusterHoverCloseTimer) {
    clearTimeout(sidebarClusterHoverCloseTimer);
    sidebarClusterHoverCloseTimer = null;
  }
  if (sidebarClusterTooltipEl) {
    sidebarClusterTooltipEl.classList.remove('is-visible');
  }
  activeClusterTooltipKey = null;
  if (sidebarMarkerCluster) {
    if (typeof sidebarMarkerCluster.clearMarkers === 'function') {
      sidebarMarkerCluster.clearMarkers();
    }
    if (typeof sidebarMarkerCluster.setMap === 'function') {
      sidebarMarkerCluster.setMap(null);
    }
    sidebarMarkerCluster = null;
  }

  spiderfyLegs.forEach((leg) => {
    if (leg && typeof leg.setMap === 'function') {
      leg.setMap(null);
    }
  });
  spiderfyLegs = [];
  spiderfyTempMarkers.forEach((marker) => {
    if (marker && typeof marker.setMap === 'function') {
      marker.setMap(null);
    }
  });
  spiderfyTempMarkers = [];
  spiderfiedMarkerIds = new Set();
  spiderfySourceCameraId = null;
  if (spiderfyClusterMarker && typeof spiderfyClusterMarker.setOpacity === 'function') {
    spiderfyClusterMarker.setOpacity(1);
  }
  spiderfyClusterMarker = null;
  sidebarMapMarkers.forEach((entry) => {
    if (entry && entry.marker && typeof entry.marker.setMap === 'function') {
      entry.marker.setMap(null);
    }
  });
  sidebarMapMarkers = [];
};

const collapseSpiderfy = () => {
  if (!spiderfiedMarkerIds.size) {
    return;
  }

  spiderfyLegs.forEach((leg) => {
    if (leg && typeof leg.setMap === 'function') {
      leg.setMap(null);
    }
  });
  spiderfyLegs = [];
  spiderfyTempMarkers.forEach((marker) => {
    if (marker && typeof marker.setMap === 'function') {
      marker.setMap(null);
    }
  });
  spiderfyTempMarkers = [];
  if (spiderfyClusterMarker && typeof spiderfyClusterMarker.setOpacity === 'function') {
    spiderfyClusterMarker.setOpacity(1);
  }
  spiderfyClusterMarker = null;

  sidebarMapMarkers.forEach((entry) => {
    if (!entry || !entry.marker || !entry.originalPosition) {
      return;
    }
    entry.marker.setPosition(entry.originalPosition);
  });

  spiderfiedMarkerIds = new Set();
  spiderfySourceCameraId = null;
  applySpiderfyMarkerLabels();
};

const interpolateLatLng = (fromLatLng, toLatLng, progress) => {
  if (!fromLatLng || !toLatLng) {
    return toLatLng || fromLatLng || null;
  }
  const startLat = typeof fromLatLng.lat === 'function' ? fromLatLng.lat() : fromLatLng.lat;
  const startLng = typeof fromLatLng.lng === 'function' ? fromLatLng.lng() : fromLatLng.lng;
  const endLat = typeof toLatLng.lat === 'function' ? toLatLng.lat() : toLatLng.lat;
  const endLng = typeof toLatLng.lng === 'function' ? toLatLng.lng() : toLatLng.lng;
  return new window.google.maps.LatLng(
    startLat + (endLat - startLat) * progress,
    startLng + (endLng - startLng) * progress
  );
};

const animateSpiderfyMarker = (marker, fromLatLng, toLatLng, leg, legAnchorLatLng, duration = 180) => {
  if (!marker || !fromLatLng || !toLatLng) {
    return;
  }

  const startAt = performance.now();
  const step = (now) => {
    const progress = Math.min(1, (now - startAt) / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    const nextLatLng = interpolateLatLng(fromLatLng, toLatLng, eased);
    if (nextLatLng) {
      marker.setPosition(nextLatLng);
      if (leg && typeof leg.setPath === 'function') {
        leg.setPath([legAnchorLatLng, nextLatLng]);
      }
    }
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };

  window.requestAnimationFrame(step);
};

const getNearbyMarkerEntries = (sourceEntry, projection) => {
  if (!sourceEntry || !projection) {
    return [];
  }

  const sourcePixel = projection.fromLatLngToDivPixel(sourceEntry.originalPosition || sourceEntry.marker.getPosition());
  if (!sourcePixel) {
    return [];
  }

  return sidebarMapMarkers.filter((entry) => {
    if (!entry || !entry.marker) {
      return false;
    }
    const pixel = projection.fromLatLngToDivPixel(entry.originalPosition || entry.marker.getPosition());
    if (!pixel) {
      return false;
    }
    return Math.abs(pixel.x - sourcePixel.x) <= 18 && Math.abs(pixel.y - sourcePixel.y) <= 18;
  });
};

const spiderfyMarkerGroup = (sourceEntry, customEntries = null, customCenter = null) => {
  if (!sidebarMapInstance || !sidebarMapProjectionOverlay || !sourceEntry) {
    return false;
  }

  const projection = sidebarMapProjectionOverlay.getProjection();
  if (!projection) {
    return false;
  }

  const nearbyEntries = Array.isArray(customEntries) && customEntries.length
    ? customEntries
    : getNearbyMarkerEntries(sourceEntry, projection);
  if (nearbyEntries.length <= 1) {
    collapseSpiderfy();
    return false;
  }

  collapseSpiderfy();
  const centerLatLng = customCenter || sourceEntry.originalPosition || sourceEntry.marker.getPosition();
  const centerPixel = projection.fromLatLngToDivPixel(centerLatLng);
  if (!centerPixel) {
    return false;
  }

  const spacing = Math.max(68, Math.min(90, 56 + nearbyEntries.length * 4));
  const baseYOffsets = [0, -16, 16, -28, 28, -38, 38, -48, 48];
  const middleIndex = (nearbyEntries.length - 1) / 2;

  nearbyEntries.forEach((entry, index) => {
    const xOffset = (index - middleIndex) * spacing;
    const yOffset = baseYOffsets[index] ?? ((index % 2 === 0 ? 1 : -1) * (18 + Math.floor(index / 2) * 12));
    const targetPixel = new window.google.maps.Point(
      centerPixel.x + xOffset,
      centerPixel.y + yOffset
    );
    const targetLatLng = projection.fromDivPixelToLatLng(targetPixel);
    if (!targetLatLng) {
      return;
    }

    spiderfiedMarkerIds.add(String(entry.camera.id));

    if (customEntries) {
      const scaledSize = getMapMarkerScaledSize(entry.camera);
      const spiderfyMarker = new window.google.maps.Marker({
        map: sidebarMapInstance,
        position: centerLatLng,
        title: entry.camera.cctv_name || 'CCTV',
        icon: {
          url: getMapMarkerIconUrl(entry.camera),
          scaledSize: new window.google.maps.Size(scaledSize, scaledSize),
          labelOrigin: getSpiderfyLabelOrigin(xOffset, yOffset),
        },
        label: buildSpiderfyLabelConfig(entry.camera),
        zIndex: String(entry.camera && entry.camera.id) === String(selectedMapCameraId) ? 1000 : 950,
      });

      spiderfyMarker.addListener('click', () => {
        suppressSidebarMapClickUntil = Date.now() + 250;
        void focusCameraFromMap(entry.camera);
      });

      spiderfyTempMarkers.push(spiderfyMarker);
      const leg = new window.google.maps.Polyline({
        map: sidebarMapInstance,
        path: [centerLatLng, centerLatLng],
        strokeColor: '#ffffff',
        strokeOpacity: 0.85,
        strokeWeight: 1.5,
        clickable: false,
        zIndex: 1,
      });
      spiderfyLegs.push(leg);
      animateSpiderfyMarker(spiderfyMarker, centerLatLng, targetLatLng, leg, centerLatLng);
      return;
    }

    entry.marker.setPosition(entry.originalPosition);
    const leg = new window.google.maps.Polyline({
      map: sidebarMapInstance,
      path: [entry.originalPosition, entry.originalPosition],
      strokeColor: '#ffffff',
      strokeOpacity: 0.85,
      strokeWeight: 1.5,
      clickable: false,
      zIndex: 1,
    });
    spiderfyLegs.push(leg);
    animateSpiderfyMarker(entry.marker, entry.originalPosition, targetLatLng, leg, entry.originalPosition);
  });

  spiderfySourceCameraId = String(sourceEntry.camera.id);
  applySpiderfyMarkerLabels();
  return true;
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
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(GOOGLE_MAPS_API_KEY)}&loading=async&callback=${callbackName}`;
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

const isSosModeActive = () =>
  Boolean(document && document.body && document.body.classList.contains('sos-mode'));

window.__HKTV_LOAD_GOOGLE_MAPS__ = loadGoogleMapsApi;

const loadMarkerClustererLibrary = () => {
  if (window.markerClusterer && window.markerClusterer.MarkerClusterer) {
    return Promise.resolve(window.markerClusterer);
  }

  if (markerClustererLoaderPromise) {
    return markerClustererLoaderPromise;
  }

  markerClustererLoaderPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src =
      'https://unpkg.com/@googlemaps/markerclusterer/dist/index.min.js';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.markerClusterer && window.markerClusterer.MarkerClusterer) {
        resolve(window.markerClusterer);
        return;
      }
      reject(new Error('Failed to initialize MarkerClusterer.'));
    };
    script.onerror = () => reject(new Error('Failed to load MarkerClusterer.'));
    document.head.appendChild(script);
  });

  return markerClustererLoaderPromise;
};

window.__HKTV_LOAD_MARKER_CLUSTERER__ = loadMarkerClustererLibrary;

const getClusterTone = (onlineCount, offlineCount) => {
  const total = Math.max(1, Number(onlineCount || 0) + Number(offlineCount || 0));
  const onlineRatio = Number(onlineCount || 0) / total;
  const offlineRatio = Number(offlineCount || 0) / total;
  if (onlineRatio >= 0.7) {
    return {
      fill: 'rgba(65, 231, 93, 0.82)',
      border: 'rgba(65, 231, 93, 0.22)',
    };
  }
  if (offlineRatio >= 0.7) {
    return {
      fill: 'rgba(255, 63, 77, 0.82)',
      border: 'rgba(255, 63, 77, 0.22)',
    };
  }
  return {
    fill: 'rgba(255, 156, 28, 0.82)',
    border: 'rgba(255, 156, 28, 0.22)',
  };
};

const describeClusterStatus = (markers) => {
  const summary = {
    onlineCount: 0,
    offlineCount: 0,
  };
  markers.forEach((marker) => {
    const entry = sidebarMapMarkers.find((item) => item && item.marker === marker);
    if (!entry || !entry.camera) {
      return;
    }
    if (getCameraOperationalState(entry.camera) === 'online') {
      summary.onlineCount += 1;
      return;
    }
    summary.offlineCount += 1;
  });
  return summary;
};

const buildClusterSvgDataUrl = (count, onlineCount, offlineCount) => {
  const size = count >= 100 ? 62 : count >= 10 ? 56 : 52;
  const tone = getClusterTone(onlineCount, offlineCount);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 4}" fill="${tone.fill}" stroke="${tone.border}" stroke-width="4" />
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 10}" fill="rgba(255,255,255,0.08)" />
    </svg>
  `.trim();
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const animateMapZoom = (map, targetZoom, center, stepDelay = 90) => {
  if (!map || !Number.isFinite(targetZoom)) {
    return;
  }

  const startZoom = Number(map.getZoom() || 0);
  if (center) {
    map.panTo(center);
  }
  if (startZoom >= targetZoom) {
    return;
  }

  let nextZoom = startZoom + 1;
  const tick = () => {
    if (nextZoom > targetZoom) {
      return;
    }
    map.setZoom(nextZoom);
    nextZoom += 1;
    if (nextZoom <= targetZoom) {
      window.setTimeout(tick, stepDelay);
    }
  };
  window.setTimeout(tick, stepDelay);
};

const ensureSidebarClusterTooltip = () => {
  if (sidebarClusterTooltipEl && sidebarClusterTooltipEl.isConnected) {
    return sidebarClusterTooltipEl;
  }
  if (sidebarClusterTooltipEl && !sidebarClusterTooltipEl.isConnected) {
    sidebarMapEl.appendChild(sidebarClusterTooltipEl);
    return sidebarClusterTooltipEl;
  }
  const tooltipEl = document.createElement('div');
  tooltipEl.className = 'sidebar-cluster-tooltip';
  sidebarMapEl.appendChild(tooltipEl);
  sidebarClusterTooltipEl = tooltipEl;
  return sidebarClusterTooltipEl;
};

const hideSidebarClusterTooltip = () => {
  if (sidebarClusterHoverOpenTimer) {
    clearTimeout(sidebarClusterHoverOpenTimer);
    sidebarClusterHoverOpenTimer = null;
  }
  if (sidebarClusterHoverCloseTimer) {
    clearTimeout(sidebarClusterHoverCloseTimer);
    sidebarClusterHoverCloseTimer = null;
  }
  if (sidebarClusterTooltipEl) {
    sidebarClusterTooltipEl.classList.remove('is-visible');
  }
  activeClusterTooltipKey = null;
};

const waitForSidebarMapProjectionReady = async () => {
  if (!sidebarMapProjectionOverlay) {
    return null;
  }

  const existingProjection = sidebarMapProjectionOverlay.getProjection();
  if (existingProjection) {
    return existingProjection;
  }

  if (!sidebarMapProjectionReadyPromise) {
    sidebarMapProjectionReadyPromise = new Promise((resolve) => {
      let attempts = 0;
      const poll = () => {
        const projection = sidebarMapProjectionOverlay && sidebarMapProjectionOverlay.getProjection
          ? sidebarMapProjectionOverlay.getProjection()
          : null;
        if (projection || attempts >= 30) {
          resolve(projection || null);
          return;
        }
        attempts += 1;
        window.setTimeout(poll, 50);
      };
      poll();
    }).finally(() => {
      sidebarMapProjectionReadyPromise = null;
    });
  }

  return sidebarMapProjectionReadyPromise;
};

const showSidebarClusterTooltip = async (marker, summary, tooltipKey) => {
  if (!sidebarMapProjectionOverlay || !sidebarMapInstance || !marker || !summary) {
    return;
  }
  const projection = await waitForSidebarMapProjectionReady();
  const position = marker.getPosition();
  if (!projection || !position) {
    return;
  }
  const pixel = projection.fromLatLngToContainerPixel(position);
  if (!pixel) {
    return;
  }
  if (tooltipKey && activeClusterTooltipKey === tooltipKey && sidebarClusterTooltipEl?.classList.contains('is-visible')) {
    return;
  }
  const tooltipEl = ensureSidebarClusterTooltip();
  tooltipEl.innerHTML = `
    <div class="sidebar-cluster-tooltip__title">${summary.count} camera</div>
    <div>${summary.onlineCount} online</div>
    <div>${summary.offlineCount} offline</div>
  `;
  const mapWidth = sidebarMapEl.clientWidth || 0;
  const mapHeight = sidebarMapEl.clientHeight || 0;
  const tooltipWidth = tooltipEl.offsetWidth || 120;
  const tooltipHeight = tooltipEl.offsetHeight || 72;
  const desiredLeft = pixel.x - 10;
  const desiredTop = pixel.y;
  const minLeft = tooltipWidth + 12;
  const maxLeft = Math.max(minLeft, mapWidth - 12);
  const minTop = tooltipHeight / 2 + 12;
  const maxTop = Math.max(minTop, mapHeight - tooltipHeight / 2 - 12);
  const clampedLeft = Math.min(Math.max(desiredLeft, minLeft), maxLeft);
  const clampedTop = Math.min(Math.max(desiredTop, minTop), maxTop);
  tooltipEl.style.left = `${clampedLeft}px`;
  tooltipEl.style.top = `${clampedTop}px`;
  tooltipEl.classList.add('is-visible');
  activeClusterTooltipKey = tooltipKey || null;
};

const createSidebarMarkerCluster = async (map, markers) => {
  if (!map || !markers.length) {
    return null;
  }

  const markerClustererLib = await loadMarkerClustererLibrary();
  const MarkerClustererCtor = markerClustererLib.MarkerClusterer;
  const SuperClusterAlgorithmCtor = markerClustererLib.SuperClusterAlgorithm;
  if (!MarkerClustererCtor) {
    throw new Error('MarkerClusterer constructor unavailable.');
  }

  const renderer = {
    render({ count, position, markers: clusterMarkers }) {
      const { onlineCount, offlineCount } = describeClusterStatus(
        Array.isArray(clusterMarkers) ? clusterMarkers : []
      );
      const iconUrl = buildClusterSvgDataUrl(count, onlineCount, offlineCount);
      const size = count >= 100 ? 62 : count >= 10 ? 56 : 52;
      const marker = new window.google.maps.Marker({
        position,
        icon: {
          url: iconUrl,
          scaledSize: new window.google.maps.Size(size, size),
        },
        label: {
          text: String(count),
          color: '#ffffff',
          fontSize: count >= 100 ? '13px' : '12px',
          fontWeight: '600',
        },
        zIndex: 900,
      });
      marker.__clusterSummary = { count, onlineCount, offlineCount };
      marker.__clusterTooltipKey = `${count}:${onlineCount}:${offlineCount}:${position && position.lat ? position.lat() : ''}:${position && position.lng ? position.lng() : ''}`;
      marker.addListener('mouseover', () => {
        if (sidebarClusterHoverCloseTimer) {
          clearTimeout(sidebarClusterHoverCloseTimer);
          sidebarClusterHoverCloseTimer = null;
        }
        const summary = marker.__clusterSummary || { count, onlineCount, offlineCount };
        if (sidebarClusterHoverOpenTimer) {
          clearTimeout(sidebarClusterHoverOpenTimer);
        }
        showSidebarClusterTooltip(marker, summary, marker.__clusterTooltipKey);
      });
      marker.addListener('mouseout', () => {
        if (sidebarClusterHoverOpenTimer) {
          clearTimeout(sidebarClusterHoverOpenTimer);
          sidebarClusterHoverOpenTimer = null;
        }
        if (sidebarClusterHoverCloseTimer) {
          clearTimeout(sidebarClusterHoverCloseTimer);
        }
        sidebarClusterHoverCloseTimer = window.setTimeout(() => {
          sidebarClusterHoverCloseTimer = null;
          hideSidebarClusterTooltip();
        }, 180);
      });
      return marker;
    },
  };

  return new MarkerClustererCtor({
    map,
    markers,
    algorithm: SuperClusterAlgorithmCtor
      ? new SuperClusterAlgorithmCtor({
          radius: 170,
          maxZoom: 22,
        })
      : undefined,
    renderer,
    onClusterClick: (_, cluster) => {
      collapseSpiderfy();
      hideSidebarClusterTooltip();
      sidebarMapShouldAutoFit = false;
      sidebarMapViewportLocked = true;
      suppressSidebarMapClickUntil = Date.now() + 250;
      const clusterMarkers = Array.isArray(cluster && cluster.markers) ? cluster.markers : [];
      const entries = clusterMarkers
        .map((marker) => sidebarMapMarkers.find((entry) => entry && entry.marker === marker))
        .filter(Boolean);

      if (entries.length <= 1) {
        const singleCamera = entries[0] && entries[0].camera;
        if (singleCamera) {
          void focusCameraFromMap(singleCamera);
        }
        return;
      }

      const clusterCenter =
        (cluster && cluster.position) ||
        entries[0].originalPosition ||
        (entries[0].marker && entries[0].marker.getPosition && entries[0].marker.getPosition());
      const currentZoom = Number(map.getZoom() || 4);
      if (entries.length > 4) {
        const zoomStep = entries.length >= 10 ? 1 : 2;
        const nextZoom = Math.min(currentZoom + zoomStep, 20);
        const shouldSpiderfyInstead = currentZoom >= 19 || nextZoom === currentZoom;
        if (!shouldSpiderfyInstead) {
          collapseSpiderfy();
          animateMapZoom(map, nextZoom, clusterCenter);
          return;
        }
      }

      const clusterMarker = cluster && (cluster.marker || cluster._marker || null);
      if (clusterMarker && typeof clusterMarker.setOpacity === 'function') {
        clusterMarker.setOpacity(entries.length === 2 ? 0.22 : 0.32);
        spiderfyClusterMarker = clusterMarker;
      }
      spiderfyMarkerGroup(entries[0], entries, clusterCenter);
    },
  });
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
  sidebarTrafficLayer = new maps.TrafficLayer();
  sidebarTrafficLayer.setMap(sidebarMapInstance);
  ensureSidebarClusterTooltip();
  sidebarMapProjectionOverlay = new maps.OverlayView();
  sidebarMapProjectionOverlay.onAdd = () => {};
  sidebarMapProjectionOverlay.draw = () => {};
  sidebarMapProjectionOverlay.onRemove = () => {};
  sidebarMapProjectionOverlay.setMap(sidebarMapInstance);
  void waitForSidebarMapProjectionReady();
  sidebarMapInstance.addListener('dragstart', () => {
    sidebarMapShouldAutoFit = false;
    sidebarMapViewportLocked = true;
    collapseSpiderfy();
    hideSidebarClusterTooltip();
  });
  sidebarMapInstance.addListener('zoom_changed', () => {
    sidebarMapShouldAutoFit = false;
    sidebarMapViewportLocked = true;
    collapseSpiderfy();
    hideSidebarClusterTooltip();
  });
  sidebarMapInstance.addListener('click', () => {
    if (Date.now() < suppressSidebarMapClickUntil) {
      return;
    }
    collapseSpiderfy();
    hideSidebarClusterTooltip();
  });
  sidebarMapInstance.addListener('idle', () => {
    if (!sidebarMapViewportLocked) {
      return;
    }
    scheduleWorkspacePersist();
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
  sidebarMapViewportLocked = true;
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
    setSidebarMapLoadingVisible(false);
    sidebarMapEl.classList.add('sidebar-section-hidden');
    sidebarMapEmptyEl.classList.remove('sidebar-section-hidden');
    setTextIfChanged(
      sidebarMapTitleEl,
      activeBranch ? `Peta ${activeBranch.branch_name || activeBranch.branch_code || 'CCTV'}` : 'Peta CCTV'
    );
    setTextIfChanged(sidebarMapEmptyEl, 'Masuk ke Focus Mode untuk melihat peta CCTV.');
    return;
  }

  const camerasWithCoordinates = getMapCameraCollection().filter((camera) => getCameraCoordinates(camera));
  const mapSource = getMapCameraCollection();
  setTextIfChanged(
    sidebarMapTitleEl,
    activeBranch ? `Peta ${activeBranch.branch_name || activeBranch.branch_code || 'CCTV'}` : 'Peta CCTV'
  );

  if (!camerasWithCoordinates.length) {
    clearSidebarMapMarkers();
    setSidebarMapLoadingVisible(false);
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
  setSidebarMapLoadingVisible(true);

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
        suppressSidebarMapClickUntil = Date.now() + 250;
        hideSidebarClusterTooltip();
        void focusCameraFromMap(camera);
      });

      sidebarMapMarkers.push({
        marker,
        camera,
        originalPosition: position,
      });
      bounds.extend(position);
    });

    try {
      sidebarMarkerCluster = await createSidebarMarkerCluster(
        map,
        sidebarMapMarkers.map((entry) => entry.marker)
      );
    } catch (clusterError) {
      console.warn('[sidebarMap] cluster fallback:', clusterError);
      sidebarMarkerCluster = null;
    }

    if (sidebarMapShouldAutoFit && camerasWithCoordinates.length === 1) {
      map.setCenter(getCameraCoordinates(camerasWithCoordinates[0]));
      map.setZoom(15);
    } else if (sidebarMapShouldAutoFit) {
      map.fitBounds(bounds, 48);
    }
    setSidebarMapLoadingVisible(false);
  } catch (error) {
    clearSidebarMapMarkers();
    setSidebarMapLoadingVisible(false);
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
  scheduleWorkspacePersist();
};

const serializeMapViewport = () => {
  if (!sidebarMapInstance || typeof sidebarMapInstance.getCenter !== 'function') {
    return null;
  }
  const center = sidebarMapInstance.getCenter();
  const zoom = Number(sidebarMapInstance.getZoom());
  if (!center || typeof center.lat !== 'function' || typeof center.lng !== 'function') {
    return null;
  }
  return {
    center: {
      lat: center.lat(),
      lng: center.lng(),
    },
    zoom: Number.isFinite(zoom) ? zoom : null,
  };
};

const restoreMapViewport = async (mapViewport) => {
  if (
    !mapViewport ||
    typeof mapViewport !== 'object' ||
    !mapViewport.center ||
    !Number.isFinite(Number(mapViewport.center.lat)) ||
    !Number.isFinite(Number(mapViewport.center.lng))
  ) {
    return;
  }

  const map = await ensureSidebarMap();
  sidebarMapViewportLocked = true;
  sidebarMapShouldAutoFit = false;
  map.setCenter({
    lat: Number(mapViewport.center.lat),
    lng: Number(mapViewport.center.lng),
  });
  const zoom = Number(mapViewport.zoom);
  if (Number.isFinite(zoom) && zoom > 0) {
    map.setZoom(zoom);
  }
};

const sanitizeCameraForPersistence = (camera) => {
  if (!camera || typeof camera !== 'object') {
    return null;
  }
  return {
    id: camera.id,
    cctv_name: camera.cctv_name || '',
    gate_name: camera.gate_name || '',
    branch_id: camera.branch_id || null,
    branch_code: camera.branch_code || '',
    branch_name: camera.branch_name || '',
    stream_play_url: camera.stream_play_url || '',
    cctv_lat: camera.cctv_lat ?? null,
    cctv_lon: camera.cctv_lon ?? null,
    is_active: camera.is_active ?? 0,
    __sourcePage: camera.__sourcePage || camera.page || null,
  };
};

const serializeWorkspaceState = () => ({
  version: WORKSPACE_STATE_VERSION,
  viewMode: isSosModeActive() ? 'asset-monitoring' : 'cctv',
  activeBranch: activeBranch
    ? {
        id: activeBranch.id,
        branch_code: activeBranch.branch_code || '',
        branch_name: activeBranch.branch_name || '',
      }
    : null,
  activePage,
  mode: currentMode === 'focus' ? 'focus' : 'normal',
  layout: {
    type: gridLayout.type,
    columns: Number(gridLayout.columns || 5),
    rows: Number(gridLayout.rows || 4),
    limit: Number(gridLayout.limit || DEFAULT_GRID_COUNT),
    mainCount: Number(gridLayout.mainCount || 1),
    sideCount: Number(gridLayout.sideCount || 6),
  },
  selectedMapCameraId: selectedMapCameraId || null,
  mapViewport: serializeMapViewport(),
  selectedCameraIds: Array.from(selectedCameraIds),
  selectedCameras: Array.from(selectedCameraMap.values())
    .map(sanitizeCameraForPersistence)
    .filter(Boolean),
  slotOverrides: Array.from(slotOverrides.entries())
    .map(([key, camera]) => ({
      key,
      camera: sanitizeCameraForPersistence(camera),
    }))
    .filter((item) => item.key && item.camera),
});

const persistWorkspaceState = async () => {
  if (workspaceRestoreInProgress) {
    return;
  }

  const response = await window.appState.saveWorkspaceState(serializeWorkspaceState());
  if (response.status >= 400) {
    throw new Error(response.message || 'Failed to save workspace state.');
  }
};

const scheduleWorkspacePersist = () => {
  if (workspaceRestoreInProgress) {
    return;
  }
  if (workspacePersistTimer) {
    clearTimeout(workspacePersistTimer);
  }
  workspacePersistTimer = window.setTimeout(() => {
    workspacePersistTimer = null;
    persistWorkspaceState().catch((error) => {
      addActivity('Workspace state failed', error.message || 'Failed to save workspace state.', 'warning');
    });
  }, WORKSPACE_PERSIST_DELAY_MS);
};

const clearWorkspaceVisualState = () => {
  if (workspacePersistTimer) {
    clearTimeout(workspacePersistTimer);
    workspacePersistTimer = null;
  }
  activeBranch = null;
  activePage = 1;
  totalPages = 1;
  currentCameras = [];
  branchWideCameras = [];
  branchWideCameraCache.clear();
  selectedCameraIds.clear();
  selectedCameraMap.clear();
  slotOverrides.clear();
  selectedMapCameraId = null;
  sidebarMapViewportLocked = false;
  sidebarMapShouldAutoFit = true;
  clearSidebarMapMarkers();
  setGridLayoutState(getDefaultGridLayout());
  setMode('normal');
  setPagingVisible(false);
  updatePagingUi();
  updateCurrentBranchLabels();
  renderWelcomeState();
};

const resetWorkspaceState = async () => {
  const response = await window.appState.clearWorkspaceState();
  if (response.status >= 400) {
    throw new Error(response.message || 'Failed to clear workspace state.');
  }
  workspaceRestoreInProgress = true;
  try {
    clearWorkspaceVisualState();
  } finally {
    workspaceRestoreInProgress = false;
  }
  addActivity('Workspace reset', 'Workspace preferences were cleared for this device.', 'success');
};

const validateActiveBranchAccess = async () => {
  if (!activeBranch || !activeBranch.id) {
    return;
  }
  if (isBranchAllowed(activeBranch.id)) {
    return;
  }
  clearWorkspaceVisualState();
  await window.appState.clearWorkspaceState().catch(() => {});
  addActivity(
    'Branch access updated',
    'Branch aktif sebelumnya tidak lagi tersedia untuk akun ini.',
    'warning'
  );
};

const handleSessionStateChange = async (session) => {
  const normalizedSession =
    session && typeof session === 'object' ? session : { ...ANONYMOUS_SESSION };
  applySessionToUi(normalizedSession);

  if (!normalizedSession.isAuthenticated) {
    clearWorkspaceVisualState();
    setAuthStatus('Masukkan username dan password backend untuk memulai session.', 'neutral');
    setAuthModalVisible(true);
    return;
  }

  setAuthStatus(
    normalizedSession.user && normalizedSession.user.username
      ? `Login sebagai ${normalizedSession.user.username}.`
      : 'Session aktif.',
    'success'
  );
  setAuthModalVisible(false);

  availableBranches = [];
  await validateActiveBranchAccess();

  if (!canUseCctv()) {
    clearWorkspaceVisualState();
    renderWelcomeState();
    if (canUseAssetMonitoring()) {
      addActivity('Capability loaded', 'Akses CCTV tidak tersedia untuk akun ini.', 'warning');
    }
  }
};

const restoreWorkspaceState = async () => {
  workspaceRestoreInProgress = true;
  try {
    if (!canUseCctv()) {
      clearWorkspaceVisualState();
      renderWelcomeState();
      return;
    }
    const response = await window.appState.getWorkspaceState();
    if (response.status >= 400) {
      throw new Error(response.message || 'Failed to load workspace state.');
    }

    const state = response.data;
    if (!state || typeof state !== 'object') {
      renderWelcomeState();
      return;
    }

    const persistedViewMode = String(state.viewMode || '').toLowerCase();
    if (persistedViewMode === 'asset-monitoring') {
      renderWelcomeState();
      return;
    }

    if (state.layout && typeof state.layout === 'object') {
      const layoutType = String(state.layout.type || '5x4');
      if (layoutType === '4x4') {
        setGridLayoutState({
          type: '4x4',
          columns: 4,
          rows: 4,
          limit: 16,
          mainCount: Number(state.layout.mainCount || 1),
          sideCount: Number(state.layout.sideCount || 6),
        });
      } else if (layoutType === '3x3') {
        setGridLayoutState({
          type: '3x3',
          columns: 3,
          rows: 3,
          limit: 9,
          mainCount: Number(state.layout.mainCount || 1),
          sideCount: Number(state.layout.sideCount || 6),
        });
      } else if (layoutType === 'spotlight') {
        const mainCount = Math.max(1, Number(state.layout.mainCount || 1));
        const sideCount = Math.max(1, Number(state.layout.sideCount || 6));
        setGridLayoutState({
          type: 'spotlight',
          columns: 4,
          rows: 4,
          limit: mainCount + sideCount,
          mainCount,
          sideCount,
        });
      } else {
        setGridLayoutState(getDefaultGridLayout());
      }
    }

    const persistedBranch = state.activeBranch;
    if (
      !persistedBranch ||
      typeof persistedBranch !== 'object' ||
      !persistedBranch.id ||
      !isBranchAllowed(persistedBranch.id)
    ) {
      renderWelcomeState();
      return;
    }

    await loadBranchPages(persistedBranch.id);
    const restoredPage = Math.min(
      Math.max(1, Number.parseInt(state.activePage, 10) || 1),
      totalPages
    );
    await loadBranchCameras(persistedBranch, restoredPage);
    setPagingVisible(totalPages > 1);

    selectedCameraIds.clear();
    selectedCameraMap.clear();
    slotOverrides.clear();

    if (Array.isArray(state.selectedCameras)) {
      state.selectedCameras.forEach((camera) => {
        const sanitized = sanitizeCameraForPersistence(camera);
        if (!sanitized || sanitized.id == null) {
          return;
        }
        selectedCameraMap.set(String(sanitized.id), sanitized);
      });
    }

    if (Array.isArray(state.selectedCameraIds)) {
      state.selectedCameraIds.forEach((cameraId) => {
        const normalizedId = String(cameraId);
        if (selectedCameraMap.has(normalizedId)) {
          selectedCameraIds.add(normalizedId);
        }
      });
    }

    currentCameras.forEach((camera) => {
      const normalizedId = String(camera.id);
      if (selectedCameraIds.has(normalizedId)) {
        selectedCameraMap.set(normalizedId, camera);
      }
    });

    if (Array.isArray(state.slotOverrides)) {
      state.slotOverrides.forEach((item) => {
        if (!item || typeof item !== 'object' || !item.key) {
          return;
        }
        const sanitized = sanitizeCameraForPersistence(item.camera);
        if (!sanitized) {
          return;
        }
        slotOverrides.set(String(item.key), sanitized);
      });
    }

    const persistedSelectedMapCameraId = state.selectedMapCameraId
      ? String(state.selectedMapCameraId)
      : null;
    if (persistedSelectedMapCameraId) {
      if (
        selectedCameraMap.has(persistedSelectedMapCameraId) ||
        currentCameras.some((camera) => String(camera.id) === persistedSelectedMapCameraId) ||
        branchWideCameras.some((camera) => String(camera.id) === persistedSelectedMapCameraId)
      ) {
        selectedMapCameraId = persistedSelectedMapCameraId;
      }
    }

    if (String(state.mode || '') === 'focus' && selectedCameraIds.size > 0) {
      setMode('focus');
    } else {
      setMode('normal');
    }

    if (currentMode === 'focus') {
      await updateSidebarMap();
      await restoreMapViewport(state.mapViewport);
      if (selectedMapCameraId) {
        scheduleSidebarMapRefresh();
      }
    }
  } finally {
    workspaceRestoreInProgress = false;
  }
  scheduleWorkspacePersist();
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
  const branchSummarySource = branchWideCameras.length ? branchWideCameras : currentCameras;
  const branchSummaryMap = new Map();
  visibleCameras
    .filter(Boolean)
    .forEach((camera) => {
      const branchId = String(camera.branch_id || camera.branch_code || camera.branch_name || '');
      if (!branchId) {
        return;
      }
      const existing = branchSummaryMap.get(branchId);
      if (existing) {
        existing.count += 1;
        return;
      }
      branchSummaryMap.set(branchId, {
        branchCode: camera.branch_code || '-',
        branchName: camera.branch_name || camera.branch_code || 'Ruas',
        count: 1,
      });
  });
  const uniqueBranches = Array.from(branchSummaryMap.values());
  const onlineCount = branchSummarySource.filter((camera) => getCameraOperationalState(camera) === 'online').length;
  const offlineCount = branchSummarySource.filter((camera) => getCameraOperationalState(camera) !== 'online').length;
  setTextIfChanged(onlineCountEl, String(onlineCount));
  setTextIfChanged(offlineCountEl, String(offlineCount));
  setTextIfChanged(selectedCountEl, String(selectedCameraIds.size));
  const branchPills =
    currentMode === 'focus'
      ? uniqueBranches.length
        ? uniqueBranches
            .slice(0, 4)
            .map(
              (item) =>
                `<span class="meta-pill route-chip">${item.branchCode || item.branchName}<strong class="route-chip__count">${item.count}</strong></span>`
            )
            .join('') +
          (uniqueBranches.length > 4
            ? `<span class="meta-pill route-chip">+${uniqueBranches.length - 4}</span>`
            : '')
        : '<span class="meta-pill route-chip">Ruas: -</span>'
      : activeBranch
        ? `<span class="meta-pill route-chip">${activeBranch.branch_name || activeBranch.branch_code || '-'}</span>`
        : '<span class="meta-pill route-chip">Branch: -</span>';
  setInnerHtmlIfChanged(currentBranchMiniEl, branchPills);
  setTextIfChanged(
    activeRouteTitleEl,
    currentMode === 'focus'
      ? 'FOCUS MODE'
      : activeBranch
        ? activeBranch.branch_name || activeBranch.branch_code || 'Ruas Aktif'
        : 'Ruas Belum Dipilih'
  );
  setTextIfChanged(
    modeBadgeEl,
    currentMode === 'focus' ? `Focus Mode (${visibleCameras.length} cams)` : 'Normal Mode'
  );
  focusModeBtn.disabled = selectedCameraIds.size === 0 || !canUseCctv();
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

const renderWelcomeState = () => {
  clearPlayers();
  gridEl.classList.remove('loading', 'grid--spotlight');
  gridEl.innerHTML = '';
  applyGridMetrics(1, 1);

  const panel = document.createElement('section');
  panel.className = 'welcome-state';
  panel.innerHTML = `
    <div class="welcome-state__inner">
      <p class="welcome-state__eyebrow">MOVISION</p>
      <h2 class="welcome-state__title">Pilih Ruas Untuk Memulai</h2>
      <p class="welcome-state__message">
        Pilih ruas terlebih dahulu untuk memuat grid CCTV. Setelah itu kamu bisa masuk ke focus mode,
        mencari kamera tertentu, dan menyesuaikan layout sesuai kebutuhan command center.
      </p>
      <div class="welcome-state__actions">
        <span class="welcome-state__chip">Shift+Alt+L Pilih Ruas</span>
        <span class="welcome-state__chip">Ctrl+K Cari Kamera</span>
        <span class="welcome-state__chip">Shift+Alt+H Buka Help</span>
      </div>
      <p class="welcome-state__hint">
        Gunakan menu Help untuk melihat shortcut lengkap dan panduan penggunaan.
      </p>
    </div>
  `;
  gridEl.appendChild(panel);
};

const ensureGridHasVisibleContent = () => {
  if (!gridEl || gridEl.children.length > 0) {
    return;
  }
  renderWelcomeState();
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
  let consecutiveStuckSamples = 0;
  let recoveryAttemptCount = 0;
  let lastRecoveryReason = '';
  let sourceUnavailableAttemptCount = 0;
  const controllerKey = `${cameraId}:${(playerAttachSequence += 1)}`;

  const normalizeRecoveryReason = (reason) => {
    if (!reason) {
      return 'retry';
    }
    if (typeof reason === 'string') {
      return reason;
    }
    if (reason instanceof Error) {
      return `${reason.name || 'Error'}: ${reason.message || 'Unknown error'}`;
    }
    if (typeof reason === 'object' && reason.message) {
      return String(reason.message);
    }
    return String(reason);
  };

  const isTransientSourceUnavailable = (reasonText) => {
    const normalized = String(reasonText || '').toLowerCase();
    return (
      normalized.includes('notsupportederror') ||
      normalized.includes('no supported source was found') ||
      normalized.includes('manifest load error') ||
      normalized.includes('level load error')
    );
  };

  const logStreamRecovery = (_eventName, _extra = {}) => {};

  const clearLocalWatchdog = () => {
    if (!localWatchdogTimer) {
      return;
    }
    clearInterval(localWatchdogTimer);
    localWatchdogTimer = null;
  };

  const checkPlaybackHealth = () => {
    if (
      destroyed ||
      videoEl.paused ||
      videoEl.ended ||
      videoEl.readyState < 2 ||
      reconnectInProgress ||
      Date.now() - controller.attachedAt < WATCHDOG_WARMUP_MS
    ) {
      return;
    }

    const currentTime = videoEl.currentTime || 0;
    if (currentTime > lastCurrentTime + 0.01) {
      lastCurrentTime = currentTime;
      lastPlaybackAt = Date.now();
      consecutiveStuckSamples = 0;
      return;
    }

    if (Date.now() - lastPlaybackAt >= WATCHDOG_FREEZE_THRESHOLD_MS) {
      consecutiveStuckSamples += 1;
      if (consecutiveStuckSamples >= WATCHDOG_CONSECUTIVE_STUCK_SAMPLES) {
        logStreamRecovery('stuck-detected', {
          consecutiveStuckSamples,
          stalledForMs: Date.now() - lastPlaybackAt,
        });
        scheduleRetry('watchdog');
      }
    }
  };

  const scheduleRetry = (reason = 'retry') => {
    if (destroyed || reconnectInProgress) {
      return;
    }

    const normalizedReason = normalizeRecoveryReason(reason);
    const transientSourceUnavailable = isTransientSourceUnavailable(normalizedReason);
    reconnectInProgress = true;
    controller.recovering = true;
    lastRecoveryReason = normalizedReason;
    consecutiveStuckSamples = 0;
    setStreamStatus(statusEl, cameraId, 'reconnecting');
    clearReconnectTimer(controllerKey);

    if (activeHls) {
      activeHls.destroy();
      activeHls = null;
    }

    recoveryAttemptCount += 1;
    if (!transientSourceUnavailable && recoveryAttemptCount > STREAM_RECOVERY_MAX_RETRIES) {
      reconnectInProgress = false;
      controller.recovering = false;
      controller.watchdogEligible = false;
      setStreamStatus(statusEl, cameraId, 'offline');
      addActivity(
        'Stream recovery stopped',
        `Camera ${cameraId} exceeded recovery limit after ${normalizedReason}.`,
        'warning'
      );
      return;
    }

    let delayMs;
    if (transientSourceUnavailable) {
      sourceUnavailableAttemptCount += 1;
      if (sourceUnavailableAttemptCount <= STREAM_SOURCE_FAST_RETRIES) {
        delayMs = [2000, 5000, 10000][sourceUnavailableAttemptCount - 1] || 10000;
      } else {
        const cooldownIndex = Math.min(
          sourceUnavailableAttemptCount - STREAM_SOURCE_FAST_RETRIES - 1,
          STREAM_SOURCE_COOLDOWN_DELAYS_MS.length - 1
        );
        delayMs = STREAM_SOURCE_COOLDOWN_DELAYS_MS[cooldownIndex];
      }
    } else {
      sourceUnavailableAttemptCount = 0;
      const baseDelayMs = Math.min(maxRetryDelayMs, 2000 * 2 ** Math.min(retryCount, 4));
      delayMs = baseDelayMs + Math.floor(Math.random() * 1000);
    }
    logStreamRecovery('recovery-scheduled', {
      delayMs,
      reason: normalizedReason,
      transientSourceUnavailable,
      sourceUnavailableAttemptCount,
    });
    retryCount += 1;
    scheduleReconnectTimer(controllerKey, connect, delayMs);
  };

  const connect = () => {
    if (destroyed) {
      return;
    }
    reconnectInProgress = false;
    controller.recovering = false;
    mediaRecoveryAttempts = 0;
    controller.attachedAt = Date.now();
    logStreamRecovery('rebind-started');
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
    const recoverySucceeded = recoveryAttemptCount > 0 || Boolean(lastRecoveryReason);
    recoveryAttemptCount = 0;
    sourceUnavailableAttemptCount = 0;
    lastRecoveryReason = '';
    consecutiveStuckSamples = 0;
    clearReconnectTimer(controllerKey);
    clearLocalWatchdog();
    reconnectInProgress = false;
    controller.recovering = false;
    mediaRecoveryAttempts = 0;
    lastPlaybackAt = Date.now();
    lastCurrentTime = videoEl.currentTime || 0;
    controller.watchdogEligible = true;
    if (!PERF_FLAGS.USE_CENTRAL_WATCHDOG) {
      localWatchdogTimer = window.setInterval(checkPlaybackHealth, WATCHDOG_INTERVAL_MS);
    }
    setStreamStatus(statusEl, cameraId, 'online');
    if (recoverySucceeded) {
      logStreamRecovery('recovery-succeeded');
    }
  };

  const handleTimeUpdate = () => {
    if (destroyed) {
      return;
    }
    const currentTime = videoEl.currentTime || 0;
    if (currentTime > lastCurrentTime + 0.01) {
      lastCurrentTime = currentTime;
      lastPlaybackAt = Date.now();
      consecutiveStuckSamples = 0;
    }
  };

  const handleError = () => {
    if (destroyed) {
      return;
    }
    controller.watchdogEligible = false;
    clearLocalWatchdog();
    setStreamStatus(statusEl, cameraId, 'offline');
    logStreamRecovery('media-error');
    scheduleRetry('media-error');
  };

  const controller = {
    key: controllerKey,
    cameraId,
    videoEl,
    statusEl,
    watchdogEligible: false,
    destroyed: false,
    recovering: false,
    attachedAt: Date.now(),
    checkPlaybackHealth,
    destroy() {
      if (destroyed) {
        return;
      }
      destroyed = true;
      this.destroyed = true;
      this.watchdogEligible = false;
      this.recovering = false;
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
  scheduleWorkspacePersist();
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
  scheduleWorkspacePersist();
  if (currentMode === 'focus') {
    renderCameras(currentCameras);
  }
};

const enterFocusMode = () => {
  if (!canUseCctv()) {
    addActivity('Focus mode blocked', 'Akun ini tidak memiliki akses CCTV.', 'warning');
    return;
  }
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
  const cameraBranchName = String(camera.branch_name || '').trim();
  const activeBranchName = String((activeBranch && activeBranch.branch_name) || '').trim();

  if (cameraBranchName) {
    subtitleEl.textContent = cameraBranchName || 'Ruas kamera';
  } else if (activeBranchName) {
    subtitleEl.textContent = activeBranchName || 'Ruas aktif';
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
  ensureCctvAccess();
  if (!isBranchAllowed(branchId)) {
    throw new Error('Branch ini tidak termasuk scope akses Anda.');
  }
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
    sidebarMapShouldAutoFit = !sidebarMapViewportLocked;
    scheduleSidebarMapRefresh();
    return;
  }

  ensureCctvAccess();
  if (!isBranchAllowed(branch.id)) {
    throw new Error('Branch map ini tidak termasuk scope akses Anda.');
  }

  const cacheKey = String(branch.id);
  if (branchWideCameraCache.has(cacheKey)) {
    branchWideCameras = branchWideCameraCache.get(cacheKey) || [];
    sidebarMapShouldAutoFit = !sidebarMapViewportLocked;
    updateMiniPanel();
    scheduleSidebarMapRefresh();
    return;
  }

  try {
    const response = await window.cameraService.getCameras({ branch_id: branch.id, limit: 500 });
    if (response.status >= 400) {
      throw new Error(response.message || 'Failed to load branch map cameras.');
    }
    branchWideCameras = (Array.isArray(response.data) ? response.data : []).map((camera) => ({
      ...camera,
      __sourcePage: camera.__sourcePage || camera.page || null,
    }));
    branchWideCameraCache.set(cacheKey, branchWideCameras);
    sidebarMapShouldAutoFit = !sidebarMapViewportLocked;
  } catch (error) {
    branchWideCameras = currentCameras.map((camera) => ({
      ...camera,
      __sourcePage: activePage,
    }));
    sidebarMapShouldAutoFit = !sidebarMapViewportLocked;
    addActivity('Map camera sync failed', error.message || 'Unable to load all map markers.', 'warning');
  }

  updateMiniPanel();
  scheduleSidebarMapRefresh();
};

const loadBranchCameras = async (branch, page = 1) => {
  ensureCctvAccess();
  if (!(branch && branch.id) || !isBranchAllowed(branch.id)) {
    throw new Error('Branch ini tidak termasuk scope akses Anda.');
  }
  pickerStatusEl.textContent = `Loading cameras for ${branch.branch_name}...`;
  branchWideCameras = [];
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
  scheduleWorkspacePersist();
};

const refreshCurrentStreams = async () => {
  if (isRefreshingStreams) {
    return;
  }

  ensureCctvAccess();

  if (!activeBranch || !activeBranch.id) {
    pickerStatusEl.textContent = 'Select branch first before reloading streams.';
    addActivity('Reload skipped', 'Choose a branch first.', 'warning');
    return;
  }

  branchWideCameraCache.delete(String(activeBranch.id));

  setReloadButtonState(true);
  renderSkeletonCards(currentMode === 'focus' ? Math.max(selectedCameraIds.size, 1) : getLayoutCount());
  try {
    sidebarMapViewportLocked = false;
    sidebarMapShouldAutoFit = true;
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
      sidebarMapViewportLocked = false;
      sidebarMapShouldAutoFit = true;
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

  availableBranches = getAllowedBranches(Array.isArray(response.data) ? response.data : []);
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
    branchWideCameras.find((camera) => String(camera.id) === normalizedId) ||
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
    const detailParts = [camera.gate_name, camera.branch_name]
      .map((value) => String(value || '').trim())
      .filter(Boolean);
    button.innerHTML = `
      <strong>${camera.cctv_name || `Camera ${camera.id || '-'}`}</strong>
      <span>${detailParts.join(' | ')}</span>
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
        scheduleWorkspacePersist();
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
      scheduleWorkspacePersist();
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
  ensureCctvAccess();
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
  ensureCctvAccess();
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
  apiBaseUrlInputEl.value = currentApiBaseUrl || '';
  setApiCheckStatus('Enter an API URL, then use Check URL to verify connectivity.', 'neutral');
  setApiCheckButtonState(false);
  showModal(apiConfigModalEl);
  focusAndSelectInput(apiBaseUrlInputEl);
};
window.openApiBaseUrlConfig = openApiBaseUrlConfig;

const openAppearanceConfig = async () => {
  const now = Date.now();
  if (now - lastAppearanceConfigOpenAt < 300) {
    return;
  }
  lastAppearanceConfigOpenAt = now;

  if (window.appConfig && typeof window.appConfig.getAppearance === 'function') {
    const response = await window.appConfig.getAppearance();
    if (response.status >= 400) {
      throw new Error(response.message || 'Failed to load appearance configuration.');
    }
    applyAppearanceConfig(response.data || DEFAULT_APPEARANCE_CONFIG);
  } else {
    applyAppearanceConfig(currentAppearanceConfig);
  }

  showModal(appearanceConfigModalEl);
  if (appearanceFontFamilySelectEl) {
    appearanceFontFamilySelectEl.focus();
  }
};

const loadAppearanceConfig = async () => {
  if (!window.appConfig || typeof window.appConfig.getAppearance !== 'function') {
    applyAppearanceConfig(DEFAULT_APPEARANCE_CONFIG);
    return;
  }
  const response = await window.appConfig.getAppearance();
  if (response.status >= 400) {
    throw new Error(response.message || 'Failed to load appearance configuration.');
  }
  applyAppearanceConfig(response.data || DEFAULT_APPEARANCE_CONFIG);
};
window.openAppearanceConfig = openAppearanceConfig;

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
window.openUpdateFeedConfig = openUpdateFeedConfig;

const closeAllTransientUi = () => {
  setToolbarMenuVisible(false);
  setProfileMenuVisible(false);
  hideModal(pickerEl);
  hideModal(searchModalEl);
  hideModal(appearanceConfigModalEl);
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
  if (currentMode === 'focus') {
    return;
  }
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
  const inSosMode = isSosModeActive();
  const pressedAltShift = event.shiftKey && event.altKey && !event.ctrlKey && !event.metaKey;
  const altShiftKey = pressedAltShift ? String(event.key || '').toLowerCase() : '';
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

  if (pressedQuickSearch && !typing) {
    event.preventDefault();
    openQuickSearch().catch(() => {
      addActivity('Quick search failed', 'Unable to open quick search.', 'danger');
    });
    return;
  }

  if (inSosMode) {
    return;
  }

  if (!pressedAltShift) {
    return;
  }

  if (altShiftKey === 'h') {
    event.preventDefault();
    showHelp();
    return;
  }

  if (altShiftKey === 'l' && !typing) {
    event.preventDefault();
    openBranchPicker().catch((error) => {
      pickerStatusEl.textContent = error.message || 'Failed to open branch picker.';
    });
    return;
  }

  if (altShiftKey === 'u') {
    event.preventDefault();
    openUpdateFeedConfig().catch(() => {
      pickerStatusEl.textContent = 'Failed to open auto update feed configuration.';
    });
    return;
  }

  if (altShiftKey === 'g') {
    event.preventDefault();
    openLayoutConfig();
    return;
  }

  if (altShiftKey === 'f') {
    event.preventDefault();
    enterFocusMode();
    return;
  }

  if (altShiftKey === 'n') {
    event.preventDefault();
    leaveFocusMode();
    return;
  }

  if (altShiftKey === 'r') {
    event.preventDefault();
    refreshCurrentStreams();
    return;
  }

  if (altShiftKey === 'm' && !typing) {
    event.preventDefault();
    toggleHealthMonitor();
    return;
  }

  if (altShiftKey === 'k') {
    event.preventDefault();
    openApiBaseUrlConfig().catch(() => {
      pickerStatusEl.textContent = 'Failed to open API_BASE_URL configuration.';
    });
    return;
  }

  if (altShiftKey === 'x') {
    event.preventDefault();
    window.close();
  }
});

closePickerBtn.addEventListener('click', () => hideModal(pickerEl));
closeSearchBtn.addEventListener('click', () => hideModal(searchModalEl));
closeAppearanceConfigBtn.addEventListener('click', () => hideModal(appearanceConfigModalEl));
closeLayoutConfigBtn.addEventListener('click', () => hideModal(layoutConfigModalEl));
toolbarMenuBtn.addEventListener('click', (event) => {
  event.stopPropagation();
  toggleToolbarMenu();
});
if (profileMenuBtn) {
  profileMenuBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    setToolbarMenuVisible(false);
    const nextVisible = profileMenuPanel.classList.contains('hidden');
    setProfileMenuVisible(nextVisible);
  });
}
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
menuAppearanceBtn.addEventListener('click', () => {
  setToolbarMenuVisible(false);
  openAppearanceConfig().catch(() => {
    pickerStatusEl.textContent = 'Failed to open appearance configuration.';
  });
});
menuApiConfigBtn.addEventListener('click', () => {
  setToolbarMenuVisible(false);
  openApiBaseUrlConfig().catch(() => {
    pickerStatusEl.textContent = 'Failed to open API_BASE_URL configuration.';
  });
});
logoutBtn.addEventListener('click', async () => {
  setToolbarMenuVisible(false);
  setProfileMenuVisible(false);
  try {
    const response = await window.auth.logout();
    if (response.status >= 400) {
      throw new Error(response.message || 'Logout gagal.');
    }
    syncSessionState(response.data || ANONYMOUS_SESSION);
    await handleSessionStateChange(response.data || ANONYMOUS_SESSION);
    addActivity('Session closed', 'Anda telah logout dari aplikasi.', 'success');
  } catch (error) {
    addActivity('Logout failed', error.message || 'Gagal mengakhiri session.', 'danger');
  }
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
resetWorkspaceBtn.addEventListener('click', () => {
  resetWorkspaceState().catch((error) => {
    addActivity('Workspace reset failed', error.message || 'Failed to reset workspace.', 'danger');
  });
});
closeApiConfigBtn.addEventListener('click', () => hideModal(apiConfigModalEl));
closeUpdateConfigBtn.addEventListener('click', () => hideModal(updateConfigModalEl));
closeHelpBtn.addEventListener('click', hideHelp);
closeHealthMonitorBtn.addEventListener('click', () => setHealthMonitorVisible(false));
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

  if (profileMenuPanel && !profileMenuPanel.classList.contains('hidden')) {
    const clickedInsideProfile =
      profileMenuPanel.contains(event.target) || (profileMenuBtn && profileMenuBtn.contains(event.target));
    if (!clickedInsideProfile) {
      setProfileMenuVisible(false);
    }
  }

  [pickerEl, searchModalEl, appearanceConfigModalEl, layoutConfigModalEl, apiConfigModalEl, updateConfigModalEl, helpModalEl].forEach((modalEl) => {
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

authFormEl.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (isSubmittingLogin) {
    return;
  }

  const username = String(authUsernameInputEl.value || '').trim();
  const password = String(authPasswordInputEl.value || '');
  if (!username || !password) {
    setAuthStatus('Username dan password wajib diisi.', 'warning');
    return;
  }

  setLoginButtonState(true);
  setAuthStatus('Memverifikasi login dan capability...', 'warning');
  try {
    const response = await window.auth.login(username, password);
    if (response.status >= 400) {
      throw new Error(response.message || 'Login gagal.');
    }
    syncSessionState(response.data || ANONYMOUS_SESSION);
    authPasswordInputEl.value = '';
    await handleSessionStateChange(response.data || ANONYMOUS_SESSION);
    if (canUseCctv()) {
      await restoreWorkspaceState();
    }
  } catch (error) {
    setAuthStatus(error.message || 'Login gagal.', 'danger');
  } finally {
    setLoginButtonState(false);
  }
});

appearanceConfigFormEl.addEventListener('submit', async (event) => {
  event.preventDefault();
  const nextAppearance = normalizeAppearanceConfig({
    fontFamily: appearanceFontFamilySelectEl.value,
    weatherIconStyle: appearanceWeatherIconStyleSelectEl ? appearanceWeatherIconStyleSelectEl.value : DEFAULT_APPEARANCE_CONFIG.weatherIconStyle,
    weatherIconMonochromeColor: appearanceWeatherIconColorInputEl ? appearanceWeatherIconColorInputEl.value : DEFAULT_APPEARANCE_CONFIG.weatherIconMonochromeColor,
    weatherIconAnimated: appearanceWeatherIconAnimatedEl ? appearanceWeatherIconAnimatedEl.checked : DEFAULT_APPEARANCE_CONFIG.weatherIconAnimated,
  });

  if (!window.appConfig || typeof window.appConfig.setAppearance !== 'function') {
    applyAppearanceConfig(nextAppearance);
    hideModal(appearanceConfigModalEl);
    addActivity('Appearance updated', `Font set to ${nextAppearance.fontFamily}.`, 'success');
    return;
  }

  const response = await window.appConfig.setAppearance(nextAppearance);
  if (response.status >= 400) {
    pickerStatusEl.textContent = response.message || 'Failed to save appearance configuration.';
    addActivity('Appearance update failed', response.message || 'Failed to save font setting.', 'danger');
    return;
  }

  applyAppearanceConfig(response.data || nextAppearance);
  hideModal(appearanceConfigModalEl);
  addActivity('Appearance updated', `Font set to ${String(nextAppearance.fontFamily || '').toUpperCase()}.`, 'success');
});

if (appearanceWeatherIconStyleSelectEl && appearanceWeatherIconColorInputEl) {
  appearanceWeatherIconStyleSelectEl.addEventListener('change', () => {
    const nextAppearance = normalizeAppearanceConfig({
      ...currentAppearanceConfig,
      weatherIconStyle: appearanceWeatherIconStyleSelectEl.value,
      weatherIconMonochromeColor: appearanceWeatherIconColorInputEl.value,
      weatherIconAnimated: appearanceWeatherIconAnimatedEl ? appearanceWeatherIconAnimatedEl.checked : currentAppearanceConfig.weatherIconAnimated,
    });
    applyAppearanceConfig(nextAppearance);
  });
}

if (appearanceWeatherIconColorInputEl) {
  const isValidAppearanceHexColor = (value) => {
    const raw = String(value || '').trim();
    const normalized = raw.startsWith('#') ? raw.slice(1) : raw;
    return /^[0-9a-fA-F]{6}$/.test(normalized);
  };

  appearanceWeatherIconColorInputEl.addEventListener('input', () => {
    if (!appearanceWeatherIconStyleSelectEl || appearanceWeatherIconStyleSelectEl.value !== 'monochrome-color') {
      return;
    }
    const typedValue = String(appearanceWeatherIconColorInputEl.value || '').trim();
    if (!isValidAppearanceHexColor(typedValue)) {
      return;
    }
    const nextAppearance = normalizeAppearanceConfig({
      ...currentAppearanceConfig,
      weatherIconStyle: appearanceWeatherIconStyleSelectEl.value,
      weatherIconMonochromeColor: typedValue,
      weatherIconAnimated: appearanceWeatherIconAnimatedEl ? appearanceWeatherIconAnimatedEl.checked : currentAppearanceConfig.weatherIconAnimated,
    });
    applyAppearanceConfig(nextAppearance);
  });

  appearanceWeatherIconColorInputEl.addEventListener('blur', () => {
    if (!appearanceWeatherIconStyleSelectEl || appearanceWeatherIconStyleSelectEl.value !== 'monochrome-color') {
      return;
    }
    const typedValue = String(appearanceWeatherIconColorInputEl.value || '').trim();
    const nextAppearance = normalizeAppearanceConfig({
      ...currentAppearanceConfig,
      weatherIconStyle: appearanceWeatherIconStyleSelectEl.value,
      weatherIconMonochromeColor: isValidAppearanceHexColor(typedValue)
        ? typedValue
        : currentAppearanceConfig.weatherIconMonochromeColor,
      weatherIconAnimated: appearanceWeatherIconAnimatedEl ? appearanceWeatherIconAnimatedEl.checked : currentAppearanceConfig.weatherIconAnimated,
    });
    applyAppearanceConfig(nextAppearance);
  });
}

if (appearanceWeatherIconAnimatedEl) {
  appearanceWeatherIconAnimatedEl.addEventListener('change', () => {
    const nextAppearance = normalizeAppearanceConfig({
      ...currentAppearanceConfig,
      weatherIconStyle: appearanceWeatherIconStyleSelectEl ? appearanceWeatherIconStyleSelectEl.value : currentAppearanceConfig.weatherIconStyle,
      weatherIconMonochromeColor: appearanceWeatherIconColorInputEl ? appearanceWeatherIconColorInputEl.value : currentAppearanceConfig.weatherIconMonochromeColor,
      weatherIconAnimated: appearanceWeatherIconAnimatedEl.checked,
    });
    applyAppearanceConfig(nextAppearance);
  });
}

apiConfigFormEl.addEventListener('submit', async (event) => {
  event.preventDefault();
  const nextApiBaseUrl = apiBaseUrlInputEl.value.trim();
  if (!nextApiBaseUrl) {
    pickerStatusEl.textContent = 'API_BASE_URL cannot be empty.';
    return;
  }

  const response = await window.cameraService.setApiConfig(nextApiBaseUrl);
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
  addActivity('API updated', `API base URL updated to ${updatedApiBaseUrl}.`, 'success');
});

checkApiConfigBtn.addEventListener('click', async () => {
  if (isCheckingApiConfig) {
    return;
  }

  const candidateApiBaseUrl = apiBaseUrlInputEl.value.trim();
  if (!candidateApiBaseUrl) {
    setApiCheckStatus('API_BASE_URL cannot be empty.', 'warning');
    return;
  }

  setApiCheckButtonState(true);
  setApiCheckStatus('Checking API health endpoint...', 'neutral');

  try {
    const response = await window.cameraService.checkApiBaseUrl(candidateApiBaseUrl);
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
    sidebarMapViewportLocked = false;
    sidebarMapShouldAutoFit = true;
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
    sidebarMapViewportLocked = false;
    sidebarMapShouldAutoFit = true;
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
applyAppearanceConfig(DEFAULT_APPEARANCE_CONFIG);
if (ACTIVE_UI_THEME) {
  document.body.classList.add(ACTIVE_UI_THEME);
}
syncLayoutControls();
renderWelcomeState();
setUpdateStatusText('Updater idle', 'ready');
addActivity('Dashboard ready', 'Waiting for branch selection or quick search.', 'neutral');
startPerfObserver();
applySessionToUi(ANONYMOUS_SESSION);
setAuthModalVisible(true);
setAuthStatus('Memuat session yang tersimpan...', 'neutral');
window.addEventListener('beforeunload', () => {
  stopPerfObserver();
  clearPlayers();
});

window.appInfo
  .getVersion()
  .then((version) => setInstalledVersionText(version))
  .catch(() => setInstalledVersionText('-'));

loadAppearanceConfig().catch((error) => {
  addActivity('Appearance restore failed', error.message || 'Failed to restore appearance setting.', 'warning');
});

window.setTimeout(ensureGridHasVisibleContent, 250);
window.setTimeout(ensureGridHasVisibleContent, 1000);

window.cameraService
  .getApiBaseUrl()
  .then((apiBaseUrl) => setApiBaseUrlText(apiBaseUrl))
  .catch(() => setApiBaseUrlText('-'));

window.auth.onSessionChanged((session) => {
  syncSessionState(session || ANONYMOUS_SESSION);
  void handleSessionStateChange(session || ANONYMOUS_SESSION);
});

const bootstrapAuthSession = async () => {
  try {
    const response = await window.auth.restoreSession();
    if (response.status >= 400) {
      throw new Error(response.message || 'Failed to restore session.');
    }
    const session = response.data || ANONYMOUS_SESSION;
    syncSessionState(session);
    await handleSessionStateChange(session);
    if (session.isAuthenticated && canUseCctv()) {
      await restoreWorkspaceState();
    } else {
      renderWelcomeState();
    }
  } catch (error) {
    addActivity('Session restore failed', error.message || 'Failed to restore session.', 'warning');
    syncSessionState(ANONYMOUS_SESSION);
    await handleSessionStateChange(ANONYMOUS_SESSION);
    renderWelcomeState();
  } finally {
    authBootstrapCompleted = true;
  }
};

window.__HKTV_AUTH_BOOTSTRAP_PROMISE__ = bootstrapAuthSession();

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

window.cameraService.onOpenBranchPicker(() => {
  if (isSosModeActive()) {
    return;
  }
  openBranchPicker().catch((error) => {
    addActivity('Branch picker failed', error.message || 'Unable to open branch picker.', 'danger');
  });
});
window.cameraService.onOpenApiBaseUrlConfig(() => {
  if (isSosModeActive()) {
    return;
  }
  openApiBaseUrlConfig();
});
window.cameraService.onOpenUpdateFeedConfig(() => {
  if (isSosModeActive()) {
    return;
  }
  openUpdateFeedConfig();
});
window.cameraService.onOpenHelp(() => {
  if (isSosModeActive()) {
    return;
  }
  showHelp();
});
window.cameraService.onOpenCameraSearch(() => {
  if (isSosModeActive()) {
    return;
  }
  openQuickSearch().catch((error) => {
    addActivity('Quick search failed', error.message || 'Unable to open quick search.', 'danger');
  });
});
window.cameraService.onOpenLayoutConfig(() => {
  if (isSosModeActive()) {
    return;
  }
  openLayoutConfig();
});
window.cameraService.onEnterFocusMode(() => {
  if (isSosModeActive()) {
    return;
  }
  enterFocusMode();
});
window.cameraService.onLeaveFocusMode(() => {
  if (isSosModeActive()) {
    return;
  }
  leaveFocusMode();
});
window.cameraService.onReloadStreams(() => {
  if (isSosModeActive()) {
    return;
  }
  refreshCurrentStreams().catch((error) => {
    addActivity('Reload failed', error.message || 'Failed to reload streams.', 'danger');
  });
});

window.__HKTV_PAUSE_GRID_STREAMS__ = () => {
  clearPlayers();
  addActivity('Grid streams paused', 'Streaming grid dihentikan sementara saat Asset Monitoring aktif.', 'warning');
};

window.__HKTV_RESUME_GRID_STREAMS__ = async () => {
  if (isSosModeActive()) {
    return;
  }
  if (!activeBranch || !activeBranch.id) {
    return;
  }
  await refreshCurrentStreams();
};



