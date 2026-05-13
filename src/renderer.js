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
const updateInfoBuildEl = document.getElementById('updateInfoBuild');
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
const rendererModules = window.HKTVRendererModules || {};
const services = rendererModules.createServiceAdapters
  ? rendererModules.createServiceAdapters(window)
  : {
      auth: window.auth,
      camera: window.cameraService,
      config: window.appConfig,
      info: window.appInfo,
      state: window.appState,
      updater: window.appUpdater,
    };
const authService = services.auth;
const appConfigService = services.config;
const appInfoService = services.info;
const appStateService = services.state;
const appUpdaterService = services.updater;

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
let quickSearchContext = {
  mode: 'select',
  slotIndex: null,
};
const slotOverrides = new Map();
let quickSearchRequestId = 0;
let quickSearchDebounceTimer = null;
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
let apiConfigBootstrapState = {
  apiBaseUrl: '',
  isPersisted: false,
  isUsingDefault: true,
};
let isApiConfigRequired = false;
let shouldReturnToAuthAfterApiConfig = false;
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

const logRendererEvent = (eventName, detail = {}) => {
  try {
    console.info('[renderer]', eventName, detail);
  } catch (_) {
    // Ignore logging failures.
  }
};

const setApiBaseUrlText = (value) => {
  setTextIfChanged(apiBaseUrlLabelEl, `API: ${value || '-'}`);
};

const normalizeAppInfo = (value) => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const version = String(value.version || '').trim();
    const releaseLabel = String(value.releaseLabel || '').trim();
    const displayVersion = String(
      value.displayVersion || (releaseLabel ? `${version} (${releaseLabel})` : version) || '-'
    ).trim();
    return {
      version: version || '-',
      releaseLabel,
      displayVersion: displayVersion || '-',
    };
  }

  const version = String(value || '').trim();
  return {
    version: version || '-',
    releaseLabel: '',
    displayVersion: version || '-',
  };
};

const setInstalledVersionText = (value) => {
  const appInfo = normalizeAppInfo(value);
  const nextValue = `Version: ${appInfo.displayVersion}`;
  setTextIfChanged(activityVersionEl, nextValue);
  setTextIfChanged(assetMapVersionEyebrowEl, appInfo.displayVersion);
  setTextIfChanged(updateInfoBuildEl, appInfo.displayVersion);
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

const normalizeApiConfigState = (payload) => {
  const source = payload && typeof payload === 'object' ? payload : {};
  return {
    apiBaseUrl: String(source.apiBaseUrl || '').trim(),
    isPersisted: Boolean(source.isPersisted),
    isUsingDefault: source.isUsingDefault === undefined ? !source.isPersisted : Boolean(source.isUsingDefault),
  };
};

const applyApiConfigState = (payload) => {
  apiConfigBootstrapState = normalizeApiConfigState(payload);
  setApiBaseUrlText(apiConfigBootstrapState.apiBaseUrl || '-');
  return apiConfigBootstrapState;
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
  const activityItems = activityFeed.getItems();
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

const activityFeed = rendererModules.createActivityFeed
  ? rendererModules.createActivityFeed({
      container: activityFeedEl,
      limit: ACTIVITY_LIMIT,
      onRender: () => {
        if (healthMonitorPanelEl && !healthMonitorPanelEl.classList.contains('hidden')) {
          renderHealthMonitor();
        }
      },
    })
  : {
      add() {},
      getItems() {
        return [];
      },
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

const setApiConfigRequirementState = (required) => {
  isApiConfigRequired = Boolean(required);
  if (!closeApiConfigBtn) {
    return;
  }
  closeApiConfigBtn.disabled = isApiConfigRequired;
  closeApiConfigBtn.classList.toggle('hidden', isApiConfigRequired);
};

const focusPreferredAuthField = () => {
  if (authUsernameInputEl && !String(authUsernameInputEl.value || '').trim()) {
    focusAndSelectInput(authUsernameInputEl);
    return;
  }
  if (authPasswordInputEl) {
    focusAndSelectInput(authPasswordInputEl);
  }
};

const reopenAuthModalAfterApiConfig = () => {
  if (!shouldReturnToAuthAfterApiConfig) {
    return;
  }
  shouldReturnToAuthAfterApiConfig = false;
  setAuthStatus('Masukkan username dan password backend untuk memulai session.', 'neutral');
  setAuthModalVisible(true);
  focusPreferredAuthField();
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
  if (!isApiConfigRequired) {
    setAuthModalVisible(true);
  }
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
  activityFeed.add(title, detail, tone);
};

const getCameraOperationalState = (camera) => {
  return Number(camera && camera.is_active) === 1 ? 'online' : 'offline';
};
const isSosModeActive = () =>
  Boolean(document && document.body && document.body.classList.contains('sos-mode'));
let sidebarMapModule = null;

const loadGoogleMapsApi = () =>
  sidebarMapModule
    ? sidebarMapModule.loadGoogleMapsApi()
    : Promise.reject(new Error('Sidebar map module unavailable.'));

const loadMarkerClustererLibrary = () =>
  sidebarMapModule
    ? sidebarMapModule.loadMarkerClustererLibrary()
    : Promise.reject(new Error('Sidebar map module unavailable.'));

window.__HKTV_LOAD_GOOGLE_MAPS__ = loadGoogleMapsApi;
window.__HKTV_LOAD_MARKER_CLUSTERER__ = loadMarkerClustererLibrary;

const scheduleSidebarMapRefresh = () => {
  if (sidebarMapModule) {
    sidebarMapModule.scheduleSidebarMapRefresh();
  }
};

const clearSidebarMapMarkers = () => {
  if (sidebarMapModule) {
    sidebarMapModule.clearSidebarMapMarkers();
  }
};

const ensureSidebarMap = async () => (sidebarMapModule ? sidebarMapModule.ensureSidebarMap() : null);

const focusCameraFromMap = async (camera) => {
  if (sidebarMapModule) {
    await sidebarMapModule.focusCameraFromMap(camera);
  }
};

const updateSidebarMap = async () => {
  if (sidebarMapModule) {
    await sidebarMapModule.updateSidebarMap();
  }
};

const getSlotOverrideKey = (slotIndex) => {
  const branchId = activeBranch && activeBranch.id ? activeBranch.id : 'no-branch';
  return `${branchId}:${activePage}:${slotIndex}`;
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

const workspacePersistence = rendererModules.createWorkspacePersistence
  ? rendererModules.createWorkspacePersistence({
      delayMs: WORKSPACE_PERSIST_DELAY_MS,
      serializeWorkspaceState,
      saveWorkspaceState: (payload) => appStateService.saveWorkspaceState(payload),
      onPersistError: (error) => {
        addActivity('Workspace state failed', error.message || 'Failed to save workspace state.', 'warning');
      },
      shouldSkipPersist: () => workspaceRestoreInProgress,
    })
  : null;

const persistWorkspaceState = async () => {
  if (!workspacePersistence) {
    return;
  }
  await workspacePersistence.persist();
};

const scheduleWorkspacePersist = () => {
  if (!workspacePersistence) {
    return;
  }
  workspacePersistence.schedule();
};

const clearWorkspaceVisualState = () => {
  if (workspacePersistence) {
    workspacePersistence.cancel();
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
  const response = await appStateService.clearWorkspaceState();
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
  await appStateService.clearWorkspaceState().catch(() => {});
  addActivity(
    'Branch access updated',
    'Branch aktif sebelumnya tidak lagi tersedia untuk akun ini.',
    'warning'
  );
};

const handleSessionStateChange = async (session, options = {}) => {
  const suppressAuthModal = Boolean(options && options.suppressAuthModal);
  const normalizedSession =
    session && typeof session === 'object' ? session : { ...ANONYMOUS_SESSION };
  applySessionToUi(normalizedSession);

  if (!normalizedSession.isAuthenticated) {
    clearWorkspaceVisualState();
    setAuthStatus('Masukkan username dan password backend untuk memulai session.', 'neutral');
    if (suppressAuthModal || isApiConfigRequired) {
      setAuthModalVisible(false);
    } else {
      setAuthModalVisible(true);
    }
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
    logRendererEvent('workspace-restore-started');
    if (!canUseCctv()) {
      clearWorkspaceVisualState();
      renderWelcomeState();
      logRendererEvent('workspace-restore-skipped', { reason: 'cctv-access-disabled' });
      return;
    }
    const response = await appStateService.getWorkspaceState();
    if (response.status >= 400) {
      throw new Error(response.message || 'Failed to load workspace state.');
    }

    const state = response.data;
    if (!state || typeof state !== 'object') {
      renderWelcomeState();
      logRendererEvent('workspace-restore-skipped', { reason: 'empty-workspace-state' });
      return;
    }

    const persistedViewMode = String(state.viewMode || '').toLowerCase();
    if (persistedViewMode === 'asset-monitoring') {
      renderWelcomeState();
      logRendererEvent('workspace-restore-skipped', { reason: 'asset-monitoring-workspace' });
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
      logRendererEvent('workspace-restore-skipped', { reason: 'branch-unavailable' });
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
    logRendererEvent('workspace-restore-completed', {
      branchId: persistedBranch.id,
      page: restoredPage,
      selectedCount: selectedCameraIds.size,
      mode: currentMode,
    });
  } finally {
    workspaceRestoreInProgress = false;
  }
  scheduleWorkspacePersist();
};

let cameraGrid = null;

const getRenderableCameras = () => (cameraGrid ? cameraGrid.getRenderableCameras() : currentCameras);
const getCameraBySlotIndex = (slotIndex) => (cameraGrid ? cameraGrid.getCameraBySlotIndex(slotIndex) : null);
const getDisplayCamerasForGrid = () => (cameraGrid ? cameraGrid.getDisplayCamerasForGrid() : []);
const getLayoutCount = () =>
  cameraGrid ? cameraGrid.getLayoutCount() : Math.max(1, Number(gridLayout.limit || DEFAULT_GRID_COUNT));
const updateMiniPanel = () => {
  if (cameraGrid) {
    cameraGrid.updateMiniPanel();
  }
};

let branchFlow = null;
let playerRuntime = null;

const getReconnectRegistrySize = () => (playerRuntime ? playerRuntime.getReconnectRegistrySize() : reconnectTimers.size);

const logPerfSnapshot = () => {
  if (playerRuntime) {
    playerRuntime.logPerfSnapshot();
  }
};

const clearPlayers = () => {
  if (playerRuntime) {
    playerRuntime.clearPlayers();
  }
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
  if (cameraGrid) {
    cameraGrid.renderWelcomeState();
  }
};

const ensureGridHasVisibleContent = () => {
  if (cameraGrid) {
    cameraGrid.ensureGridHasVisibleContent();
  }
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
  if (playerRuntime) {
    playerRuntime.startPerfObserver();
  }
};

const stopPerfObserver = () => {
  if (playerRuntime) {
    playerRuntime.stopPerfObserver();
  }
};

const ensureGlobalWatchdog = () => {
  if (playerRuntime) {
    playerRuntime.ensureGlobalWatchdog();
  }
};

const syncGlobalWatchdogState = () => {
  if (playerRuntime) {
    playerRuntime.syncGlobalWatchdogState();
  }
};

const clearReconnectTimer = (key) => {
  if (playerRuntime) {
    playerRuntime.clearReconnectTimer(key);
  }
};

const scheduleReconnectTimer = (key, callback, delayMs) => {
  if (playerRuntime) {
    playerRuntime.scheduleReconnectTimer(key, callback, delayMs);
  }
};

const attachStreamWithRetry = (videoEl, streamUrl, statusEl, cameraId) =>
  playerRuntime ? playerRuntime.attachStreamWithRetry(videoEl, streamUrl, statusEl, cameraId) : null;

const setMode = (mode) => {
  currentMode = mode === 'focus' ? 'focus' : 'normal';
  document.body.classList.toggle('focus-mode', currentMode === 'focus');
  document.body.classList.toggle('normal-mode', currentMode !== 'focus');
  updateMiniPanel();
  renderCameras(currentCameras);
  scheduleSidebarMapRefresh();
  scheduleWorkspacePersist();
};

cameraGrid = rendererModules.createCameraGrid
  ? rendererModules.createCameraGrid({
      elements: {
        gridEl,
        currentBranchMiniEl,
        activeRouteTitleEl,
        modeBadgeEl,
        onlineCountEl,
        offlineCountEl,
        selectedCountEl,
        focusModeBtn,
      },
      constants: {
        DEFAULT_GRID_COUNT,
      },
      getState: () => ({
        activeBranch,
        activePage,
        branchWideCameras,
        currentCameras,
        currentMode,
        gridLayout,
        selectedCameraIds,
        selectedCameraMap,
        slotOverrides,
        selectedMapCameraId: () => selectedMapCameraId,
      }),
      callbacks: {
        addActivity,
        applyGridMetrics,
        attachStreamWithRetry,
        canUseCctv,
        clearPlayers,
        getCameraOperationalState,
        getSlotOverrideKey,
        hideModal,
        openBranchPicker: () => openBranchPicker(),
        openQuickSearch: (options) => openQuickSearch(options),
        renderEmptyStateCard,
        renderWelcomeStateFallback: () => renderWelcomeState(),
        requestFullscreen,
        resolveCameraById: (cameraId) => resolveCameraById(cameraId),
        scheduleSidebarMapRefresh,
        scheduleWorkspacePersist,
        setMode,
        setSelectedMapCameraId: (cameraId) => {
          selectedMapCameraId = cameraId;
        },
        setStreamStatus,
        setTextIfChanged,
        setInnerHtmlIfChanged,
        updateCardSelectionUiFallback: null,
      },
    })
  : null;

const updateCardSelectionUi = (cameraId) => {
  if (cameraGrid) {
    cameraGrid.updateCardSelectionUi(cameraId);
  }
};

const toggleSelectedCamera = (cameraId, cameraData) => {
  if (cameraGrid) {
    cameraGrid.toggleSelectedCamera(cameraId, cameraData);
  }
};

const enterFocusMode = () => {
  if (cameraGrid) {
    cameraGrid.enterFocusMode();
  }
};

const leaveFocusMode = () => {
  if (cameraGrid) {
    cameraGrid.leaveFocusMode();
  }
};

function renderCameras(_cameras = []) {
  if (cameraGrid) {
    cameraGrid.renderCameras();
  }
}

branchFlow = rendererModules.createBranchFlow
  ? rendererModules.createBranchFlow({
      elements: {
        pagingControlEl,
        pageInfoEl,
        prevPageBtn,
        nextPageBtn,
        pickerEl,
        searchModalEl,
        layoutConfigModalEl,
        pickerStatusEl,
        currentBranchEl,
      },
      services,
      getState: () => ({
        activeBranch,
        activePage,
        branchWideCameraCache,
        currentCameras,
        currentMode,
        gridLayout,
        isRefreshingStreams,
        selectedCameraIds,
        selectedCameraMap,
        sidebarMapShouldAutoFit,
        sidebarMapViewportLocked,
        totalPages,
      }),
      callbacks: {
        addActivity,
        ensureCctvAccess,
        getCameraOperationalState,
        getLayoutCount,
        hideModal,
        isBranchAllowed,
        renderCameras,
        renderSkeletonCards,
        scheduleSidebarMapRefresh,
        scheduleWorkspacePersist,
        setActiveBranch: (branch) => {
          activeBranch = branch;
        },
        setActivePage: (page) => {
          activePage = page;
        },
        setBranchWideCameras: (cameras) => {
          branchWideCameras = cameras;
        },
        setCurrentCameras: (cameras) => {
          currentCameras = cameras;
        },
        setReloadButtonState,
        setSidebarMapShouldAutoFit: (value) => {
          sidebarMapShouldAutoFit = value;
        },
        setSidebarMapViewportLocked: (value) => {
          sidebarMapViewportLocked = value;
        },
        setTextIfChanged,
        setTotalPages: (value) => {
          totalPages = value;
        },
        updateMiniPanel,
        updateSidebarMap,
      },
    })
  : null;

const updatePagingUi = () => {
  if (branchFlow) {
    branchFlow.updatePagingUi();
  }
};

const setPagingVisible = (visible) => {
  if (branchFlow) {
    branchFlow.setPagingVisible(visible);
  }
};

const updateCurrentBranchLabels = () => {
  if (branchFlow) {
    branchFlow.updateCurrentBranchLabels();
  }
};

const loadBranchPages = async (branchId) => {
  if (branchFlow) {
    await branchFlow.loadBranchPages(branchId);
  }
};

const loadAllBranchCamerasForMap = async (branch) => {
  if (branchFlow) {
    await branchFlow.loadAllBranchCamerasForMap(branch);
  }
};

const loadBranchCameras = async (branch, page = 1) => {
  if (branchFlow) {
    await branchFlow.loadBranchCameras(branch, page);
  }
};

const refreshCurrentStreams = async () => {
  if (branchFlow) {
    await branchFlow.refreshCurrentStreams();
  }
};

const branchPicker = rendererModules.createBranchPicker
  ? rendererModules.createBranchPicker({
      elements: {
        branchListEl,
        branchSearchInputEl,
        pickerEl,
        pickerStatusEl,
      },
      services,
      getAvailableBranches: () => availableBranches,
      setAvailableBranches: (branches) => {
        availableBranches = Array.isArray(branches) ? branches : [];
      },
      getAllowedBranches,
      renderEmptyStateCard,
      loadBranchPages,
      loadBranchCameras,
      setPagingVisible,
      getTotalPages: () => totalPages,
      addActivity,
      focusAndSelectInput,
      ensureCctvAccess,
      showModal,
      prepareForBranchSelection: () => {
        sidebarMapViewportLocked = false;
        sidebarMapShouldAutoFit = true;
      },
    })
  : null;

const ensureBranchList = async () =>
  branchPicker ? branchPicker.ensureBranchList() : availableBranches;

const renderBranchPickerResults = () => {
  if (branchPicker) {
    branchPicker.renderResults();
  }
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

const quickSearch = rendererModules.createQuickSearch
  ? rendererModules.createQuickSearch({
      elements: {
        quickSearchInputEl,
        quickSearchResultsEl,
        searchModalEl,
        searchModalTitleEl,
      },
      services,
      getState: () => ({
        currentMode,
        quickSearchContext,
        quickSearchDebounceTimer,
        quickSearchRequestId,
        selectedCameraIds,
        selectedCameraMap,
        slotOverrides,
      }),
      callbacks: {
        addActivity,
        bumpSearchRequests: () => {
          perfStats.searchRequests += 1;
        },
        ensureCctvAccess,
        focusAndSelectInput,
        getSlotOverrideKey,
        hideModal,
        renderCameras: () => renderCameras(currentCameras),
        renderEmptyStateCard,
        scheduleWorkspacePersist,
        setQuickSearchContext: (nextValue) => {
          quickSearchContext = nextValue;
        },
        setQuickSearchDebounceTimer: (nextValue) => {
          quickSearchDebounceTimer = nextValue;
        },
        setQuickSearchRequestId: (nextValue) => {
          quickSearchRequestId = nextValue;
        },
        showModal,
        updateMiniPanel,
      },
    })
  : null;

const renderQuickSearchResults = async () => {
  if (quickSearch) {
    await quickSearch.renderQuickSearchResults();
  }
};

const scheduleQuickSearch = () => {
  if (quickSearch) {
    quickSearch.scheduleQuickSearch();
  }
};

const openBranchPicker = async () => {
  if (!branchPicker) {
    return;
  }
  await branchPicker.open();
};

const openQuickSearch = async (options = {}) => {
  if (quickSearch) {
    await quickSearch.openQuickSearch(options);
  }
};

sidebarMapModule = rendererModules.createSidebarMap
  ? rendererModules.createSidebarMap({
      elements: {
        sidebarMapEl,
        sidebarMapEmptyEl,
        sidebarMapLoadingEl,
        sidebarMapTitleEl,
      },
      constants: {
        GOOGLE_MAPS_API_KEY,
        OFFLINE_MARKER_URL,
        ONLINE_MARKER_URL,
      },
      getState: () => ({
        activeBranch,
        activeClusterTooltipKey,
        activePage,
        branchWideCameras,
        currentCameras,
        currentMode,
        googleMapsLoaderPromise,
        markerClustererLoaderPromise,
        selectedCameraIds,
        selectedCameraMap,
        selectedMapCameraId,
        sidebarClusterHoverCloseTimer,
        sidebarClusterHoverOpenTimer,
        sidebarClusterTooltipEl,
        sidebarMapInstance,
        sidebarMapMarkers,
        sidebarMapProjectionOverlay,
        sidebarMapProjectionReadyPromise,
        sidebarMapRefreshTimer,
        sidebarMapShouldAutoFit,
        sidebarMapViewportLocked,
        sidebarMarkerCluster,
        spiderfiedMarkerIds,
        spiderfyClusterMarker,
        spiderfyLegs,
        spiderfySourceCameraId,
        spiderfyTempMarkers,
        suppressSidebarMapClickUntil,
      }),
      updateState: (patch) => {
        if (!patch || typeof patch !== 'object') {
          return;
        }
        if (Object.prototype.hasOwnProperty.call(patch, 'activeClusterTooltipKey')) activeClusterTooltipKey = patch.activeClusterTooltipKey;
        if (Object.prototype.hasOwnProperty.call(patch, 'branchWideCameras')) branchWideCameras = patch.branchWideCameras;
        if (Object.prototype.hasOwnProperty.call(patch, 'googleMapsLoaderPromise')) googleMapsLoaderPromise = patch.googleMapsLoaderPromise;
        if (Object.prototype.hasOwnProperty.call(patch, 'markerClustererLoaderPromise')) markerClustererLoaderPromise = patch.markerClustererLoaderPromise;
        if (Object.prototype.hasOwnProperty.call(patch, 'selectedMapCameraId')) selectedMapCameraId = patch.selectedMapCameraId;
        if (Object.prototype.hasOwnProperty.call(patch, 'sidebarClusterHoverCloseTimer')) sidebarClusterHoverCloseTimer = patch.sidebarClusterHoverCloseTimer;
        if (Object.prototype.hasOwnProperty.call(patch, 'sidebarClusterHoverOpenTimer')) sidebarClusterHoverOpenTimer = patch.sidebarClusterHoverOpenTimer;
        if (Object.prototype.hasOwnProperty.call(patch, 'sidebarClusterTooltipEl')) sidebarClusterTooltipEl = patch.sidebarClusterTooltipEl;
        if (Object.prototype.hasOwnProperty.call(patch, 'sidebarMapInstance')) sidebarMapInstance = patch.sidebarMapInstance;
        if (Object.prototype.hasOwnProperty.call(patch, 'sidebarMapMarkers')) sidebarMapMarkers = patch.sidebarMapMarkers;
        if (Object.prototype.hasOwnProperty.call(patch, 'sidebarMapProjectionOverlay')) sidebarMapProjectionOverlay = patch.sidebarMapProjectionOverlay;
        if (Object.prototype.hasOwnProperty.call(patch, 'sidebarMapProjectionReadyPromise')) sidebarMapProjectionReadyPromise = patch.sidebarMapProjectionReadyPromise;
        if (Object.prototype.hasOwnProperty.call(patch, 'sidebarMapRefreshTimer')) sidebarMapRefreshTimer = patch.sidebarMapRefreshTimer;
        if (Object.prototype.hasOwnProperty.call(patch, 'sidebarMapShouldAutoFit')) sidebarMapShouldAutoFit = patch.sidebarMapShouldAutoFit;
        if (Object.prototype.hasOwnProperty.call(patch, 'sidebarMapViewportLocked')) sidebarMapViewportLocked = patch.sidebarMapViewportLocked;
        if (Object.prototype.hasOwnProperty.call(patch, 'sidebarMarkerCluster')) sidebarMarkerCluster = patch.sidebarMarkerCluster;
        if (Object.prototype.hasOwnProperty.call(patch, 'spiderfiedMarkerIds')) spiderfiedMarkerIds = patch.spiderfiedMarkerIds;
        if (Object.prototype.hasOwnProperty.call(patch, 'spiderfyClusterMarker')) spiderfyClusterMarker = patch.spiderfyClusterMarker;
        if (Object.prototype.hasOwnProperty.call(patch, 'spiderfyLegs')) spiderfyLegs = patch.spiderfyLegs;
        if (Object.prototype.hasOwnProperty.call(patch, 'spiderfySourceCameraId')) spiderfySourceCameraId = patch.spiderfySourceCameraId;
        if (Object.prototype.hasOwnProperty.call(patch, 'spiderfyTempMarkers')) spiderfyTempMarkers = patch.spiderfyTempMarkers;
        if (Object.prototype.hasOwnProperty.call(patch, 'suppressSidebarMapClickUntil')) suppressSidebarMapClickUntil = patch.suppressSidebarMapClickUntil;
        if (Object.prototype.hasOwnProperty.call(patch, 'sidebarTrafficLayer')) sidebarTrafficLayer = patch.sidebarTrafficLayer;
      },
      callbacks: {
        addActivity,
        enterFocusMode,
        getCameraOperationalState,
        loadBranchCameras,
        scheduleWorkspacePersist,
        setSidebarMapLoadingVisible,
        setTextIfChanged,
        updateCardSelectionUi,
        updateMiniPanel,
      },
    })
  : null;

playerRuntime = rendererModules.createPlayerRuntime
  ? rendererModules.createPlayerRuntime({
      constants: {
        PERF_FLAGS,
        STREAM_RECOVERY_MAX_RETRIES,
        STREAM_SOURCE_COOLDOWN_DELAYS_MS,
        STREAM_SOURCE_FAST_RETRIES,
        WATCHDOG_CONSECUTIVE_STUCK_SAMPLES,
        WATCHDOG_FREEZE_THRESHOLD_MS,
        WATCHDOG_INTERVAL_MS,
        WATCHDOG_WARMUP_MS,
      },
      getState: () => ({
        globalWatchdogTimer,
        hlsPlayers,
        perfObserverTimer,
        perfStats,
        playerAttachSequence,
        playerControllers,
        reconnectTimers,
      }),
      updateState: (patch) => {
        if (!patch || typeof patch !== 'object') {
          return;
        }
        if (Object.prototype.hasOwnProperty.call(patch, 'globalWatchdogTimer')) {
          globalWatchdogTimer = patch.globalWatchdogTimer;
        }
        if (Object.prototype.hasOwnProperty.call(patch, 'perfObserverTimer')) {
          perfObserverTimer = patch.perfObserverTimer;
        }
        if (Object.prototype.hasOwnProperty.call(patch, 'playerAttachSequence')) {
          playerAttachSequence = patch.playerAttachSequence;
        }
      },
      callbacks: {
        addActivity,
        setStreamStatus,
        withCacheBuster,
      },
    })
  : null;

const modalActions = rendererModules.createModalActions
  ? rendererModules.createModalActions({
      elements: {
        apiConfigModalEl,
        apiBaseUrlInputEl,
        authModalEl,
        authPasswordInputEl,
        appearanceConfigModalEl,
        appearanceFontFamilySelectEl,
        appearanceWeatherIconStyleSelectEl,
        appearanceWeatherIconColorInputEl,
        appearanceWeatherIconAnimatedEl,
        layoutConfigModalEl,
        updateConfigModalEl,
        updateFeedUrlInputEl,
        updateGithubOwnerInputEl,
        updateGithubRepoInputEl,
        useGithubReleaseCheckboxEl,
        saveUpdateConfigBtn,
        pickerEl,
        searchModalEl,
        helpModalEl,
        pickerStatusEl,
        authFormEl,
        authUsernameInputEl,
        appearanceConfigFormEl,
        apiConfigFormEl,
        checkApiConfigBtn,
        updateConfigFormEl,
        layoutConfigFormEl,
        layoutPresetSelectEl,
        layoutMainCountInputEl,
        layoutSideCountInputEl,
      },
      services,
      defaults: {
        anonymousSession: ANONYMOUS_SESSION,
        defaultAppearanceConfig: DEFAULT_APPEARANCE_CONFIG,
      },
      getState: () => ({
        apiConfigBootstrapState,
        currentAppearanceConfig,
        isApiConfigRequired,
        isCheckingApiConfig,
        isSubmittingLogin,
        lastApiConfigOpenAt,
        lastAppearanceConfigOpenAt,
        lastUpdateConfigOpenAt,
        latestUpdatePayload,
        shouldReturnToAuthAfterApiConfig,
      }),
      updateState: (patch) => {
        if (!patch || typeof patch !== 'object') {
          return;
        }
        if (Object.prototype.hasOwnProperty.call(patch, 'lastApiConfigOpenAt')) {
          lastApiConfigOpenAt = patch.lastApiConfigOpenAt;
        }
        if (Object.prototype.hasOwnProperty.call(patch, 'lastAppearanceConfigOpenAt')) {
          lastAppearanceConfigOpenAt = patch.lastAppearanceConfigOpenAt;
        }
        if (Object.prototype.hasOwnProperty.call(patch, 'lastUpdateConfigOpenAt')) {
          lastUpdateConfigOpenAt = patch.lastUpdateConfigOpenAt;
        }
        if (Object.prototype.hasOwnProperty.call(patch, 'shouldReturnToAuthAfterApiConfig')) {
          shouldReturnToAuthAfterApiConfig = patch.shouldReturnToAuthAfterApiConfig;
        }
      },
      callbacks: {
        addActivity,
        applyApiConfigState,
        applyAppearanceConfig,
        canUseCctv,
        focusAndSelectInput,
        handleSessionStateChange,
        hideHelp,
        hideModal,
        normalizeAppearanceConfig,
        reopenAuthModalAfterApiConfig,
        renderCameras,
        restoreWorkspaceState,
        setApiCheckButtonState,
        setApiCheckStatus,
        setApiConfigRequirementState,
        setAuthModalVisible,
        setAuthStatus,
        setGridLayoutState,
        setLoginButtonState,
        setProfileMenuVisible,
        setToolbarMenuVisible,
        setUpdateStatusText,
        showModal,
        syncLayoutControls,
        syncSessionState,
        syncUpdateInfoCard,
        getCurrentCameras: () => currentCameras,
      },
    })
  : null;

const openApiBaseUrlConfig = async (options = {}) =>
  modalActions ? modalActions.openApiBaseUrlConfig(options) : undefined;
window.openApiBaseUrlConfig = openApiBaseUrlConfig;

const closeApiConfigFlow = ({ force = false } = {}) =>
  modalActions ? modalActions.closeApiConfigFlow({ force }) : undefined;

const redirectToApiConfigFlow = async (message, tone = 'warning') =>
  modalActions ? modalActions.redirectToApiConfigFlow(message, tone) : undefined;

const openAppearanceConfig = async () =>
  modalActions ? modalActions.openAppearanceConfig() : undefined;

const loadAppearanceConfig = async () =>
  modalActions ? modalActions.loadAppearanceConfig() : undefined;
window.openAppearanceConfig = openAppearanceConfig;

const openLayoutConfig = () => {
  if (modalActions) {
    modalActions.openLayoutConfig();
  }
};

const openUpdateFeedConfig = async () =>
  modalActions ? modalActions.openUpdateFeedConfig() : undefined;
window.openUpdateFeedConfig = openUpdateFeedConfig;

const closeAllTransientUi = () => {
  if (modalActions) {
    modalActions.closeAllTransientUi();
  }
};

const isTypingField = (target) =>
  target instanceof HTMLElement &&
  (target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.tagName === 'SELECT' ||
    target.isContentEditable);

const handleGridClick = async (event) => {
  if (cameraGrid) {
    await cameraGrid.handleGridClick(event);
  }
};

const handleGridDoubleClick = (event) => {
  if (cameraGrid) {
    cameraGrid.handleGridDoubleClick(event);
  }
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
    const response = await authService.logout();
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
closeApiConfigBtn.addEventListener('click', () => closeApiConfigFlow());
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
      if (modalEl === apiConfigModalEl && isApiConfigRequired) {
        return;
      }
      if (modalEl === apiConfigModalEl) {
        closeApiConfigFlow();
        return;
      }
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
if (modalActions) {
  modalActions.bindConfigForms();
}

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
    const response = await appUpdaterService.checkForUpdates();
    if (response.status >= 400) {
      throw new Error(response.message || 'Failed to check update.');
    }
  } catch (error) {
    setUpdateStatusText(error.message || 'Failed to check update.', 'error');
    setUpdateButtonState(false);
    addActivity('Update check failed', error.message || 'Failed to check for update.', 'danger');
  }
});

const appBootstrap = rendererModules.createAppBootstrap
  ? rendererModules.createAppBootstrap({
      services,
      addActivity,
      setInstalledVersionText,
      loadAppearanceConfig,
      setUpdateStatusText,
      syncUpdateInfoCard,
      normalizeUpdateMessage,
      getUpdateTone,
      setUpdateButtonState,
      syncSessionState,
      handleSessionStateChange,
      applyApiConfigState,
      openApiBaseUrlConfig,
      redirectToApiConfigFlow,
      restoreWorkspaceState,
      renderWelcomeState,
      canUseCctv,
      getIsApiConfigRequired: () => isApiConfigRequired,
      getLatestUpdatePayload: () => latestUpdatePayload,
      setLatestUpdatePayload: (payload) => {
        latestUpdatePayload = payload;
      },
      getActiveBranch: () => activeBranch,
      ensureGridHasVisibleContent,
      stopPerfObserver,
      clearPlayers,
      setAuthStatus,
      updatePagingUi,
      setPagingVisible,
      setReloadButtonState,
      setToolbarMenuVisible,
      setToolbarVisible,
      applyAppearanceConfig,
      defaultAppearanceConfig: DEFAULT_APPEARANCE_CONFIG,
      activeUiTheme: ACTIVE_UI_THEME,
      syncLayoutControls,
      applySessionToUi,
      anonymousSession: ANONYMOUS_SESSION,
      setAuthModalVisible,
      setApiConfigRequirementState,
      startPerfObserver,
      onOpenBranchPicker: () => {
        if (isSosModeActive()) {
          return;
        }
        openBranchPicker().catch((error) => {
          addActivity('Branch picker failed', error.message || 'Unable to open branch picker.', 'danger');
        });
      },
      onOpenApiBaseUrlConfig: () => {
        if (isSosModeActive()) {
          return;
        }
        openApiBaseUrlConfig();
      },
      onOpenUpdateFeedConfig: () => {
        if (isSosModeActive()) {
          return;
        }
        openUpdateFeedConfig();
      },
      onOpenHelp: () => {
        if (isSosModeActive()) {
          return;
        }
        showHelp();
      },
      onOpenCameraSearch: () => {
        if (isSosModeActive()) {
          return;
        }
        openQuickSearch().catch((error) => {
          addActivity('Quick search failed', error.message || 'Unable to open quick search.', 'danger');
        });
      },
      onOpenLayoutConfig: () => {
        if (isSosModeActive()) {
          return;
        }
        openLayoutConfig();
      },
      onEnterFocusMode: () => {
        if (isSosModeActive()) {
          return;
        }
        enterFocusMode();
      },
      onLeaveFocusMode: () => {
        if (isSosModeActive()) {
          return;
        }
        leaveFocusMode();
      },
      onReloadStreams: () => {
        if (isSosModeActive()) {
          return;
        }
        refreshCurrentStreams().catch((error) => {
          addActivity('Reload failed', error.message || 'Failed to reload streams.', 'danger');
        });
      },
      showHelp,
      openQuickSearch,
      openLayoutConfig,
      openUpdateFeedConfig,
      enterFocusMode,
      leaveFocusMode,
      refreshCurrentStreams,
      isSosModeActive,
      onBootstrapComplete: () => {
        authBootstrapCompleted = true;
      },
    })
  : null;

if (appBootstrap) {
  appBootstrap.initialize();
}



