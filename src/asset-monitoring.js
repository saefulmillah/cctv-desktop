(function () {
  const GOOGLE_MAPS_API_KEY = 'AIzaSyAuNghu_4V4kxgcCa5UX0XBV_zPMZzV-Cg';
  const GOOGLE_MAPS_MAP_ID = '260d3d632296bdc1173222f3';
  const SOS_STREAM_RETRY_MS = 4000;
  const SOS_TICKET_REFRESH_MS = 30000;
  const SOS_ALERT_SYNC_MS = 5000;
  const SOS_NOTIFICATION_LIMIT = 5;
  const TRANSIENT_NOTIFICATION_MS = 5000;
  const INCIDENT_LIST_ENTER_MS = 320;
  const INCIDENT_LIST_LEAVE_MS = 220;
  const NOTIFICATION_ENTER_MS = 420;
  const NOTIFICATION_LEAVE_MS = 240;
  const SOS_FOCUS_ANIMATION_MS = 520;
  const ALL_BRANCHES_OPTION = '__all__';
  const MAP_ZOOM_BRANCH = 11;
  const MAP_ZOOM_ALL_BRANCH = 6.5;
  const MAP_ZOOM_GATE = 11;
  const MAP_ZOOM_ASSET = 11;
  const MAP_ZOOM_SOS = 14;
  const MAP_ZOOM_VEHICLE_FOCUS = 17;
  const ALL_BRANCH_VEHICLE_MARKER_LIMIT_LOW_ZOOM = 24;
  const ALL_BRANCH_VEHICLE_MARKER_LIMIT_MID_ZOOM = 60;
  const ALL_BRANCH_VEHICLE_MARKER_LIMIT_HIGH_ZOOM = 120;
  const VEHICLE_CLUSTER_STAGE_ZOOMS = [8, 10, 12];
  const VEHICLE_CLUSTER_MAX_ZOOM = 11;
  const VEHICLE_LIST_RENDER_LIMIT_ALL_BRANCH = 120;
  const VEHICLE_UI_REFRESH_DEBOUNCE_MS = 180;
  const VEHICLE_UI_REFRESH_DEBOUNCE_ALL_BRANCH_MS = 500;
  const CCTV_MODAL_BACKDROP_GUARD_MS = 320;
  const DEFAULT_VEHICLE_TYPE_ICON_PATH = '/static/vehicle-types/default.svg';
  const VEHICLE_INTERPOLATION_DEFAULT_MS = 700;
  const VEHICLE_INTERPOLATION_SNAP_DISTANCE_METERS = 1200;
  const VEHICLE_PREDICTION_MIN_MS = 1600;
  const VEHICLE_PREDICTION_MAX_MS = 4200;
  const VEHICLE_PREDICTION_MAX_AGE_MS = 4200;
  const VEHICLE_PREDICTION_CORRECTION_MIN_MS = 520;
  const VEHICLE_PREDICTION_CORRECTION_MAX_MS = 1500;
  const VEHICLE_PREDICTION_CORRECTION_SNAP_METERS = 420;
  const VEHICLE_PREDICTION_MAX_SPEED_KMH = 180;
  const VEHICLE_PREDICTION_SPEED_FACTOR = 0.92;

  const $ = (id) => document.getElementById(id);
  const sosMonitorBtn = $('sosMonitorBtn');
  const sosDashboardEl = $('sosDashboard');
  const cameraGridEl = $('cameraGrid');
  const pagingControlEl = $('pagingControl');
  const sosRefreshBtn = $('sosRefreshBtn');
  const sosConnectionBadgeEl = $('sosConnectionBadge');
  const sosOpenCountBadgeEl = $('sosOpenCountBadge');
  const sosRouteTitleEl = $('sosRouteTitle');
  const assetMapSubtitleEl = $('assetMapSubtitle');
  const sosMapEl = $('sosMap');
  const sosMapLoadingEl = $('sosMapLoading');
  const sosMapEmptyEl = $('sosMapEmpty');
  const sosBranchControlBtn = $('sosBranchControlBtn');
  const sosBranchControlLabelEl = $('sosBranchControlLabel');
  const sosBranchControlPopup = $('sosBranchControlPopup');
  const sosBranchControlOptionsEl = $('sosBranchControlOptions');
  const sosMapNormalBtn = $('sosMapNormalBtn');
  const sosMapTiltBtn = $('sosMapTiltBtn');
  const sosMapRotateLeftBtn = $('sosMapRotateLeftBtn');
  const sosMapRotateRightBtn = $('sosMapRotateRightBtn');
  const sosMapResetCameraBtn = $('sosMapResetCameraBtn');
  const sosCctvToggleEl = $('sosCctvToggle');
  const sosVmsToggleEl = $('sosVmsToggle');
  const sosGateToggleEl = $('sosGateToggle');
  const sosNetworkToggleEl = $('sosNetworkToggle');
  const sosAnimatedNetworkToggleEl = $('sosAnimatedNetworkToggle');
  const sosWeatherToggleEl = $('sosWeatherToggle');
  const sosWeatherBubbleToggleEl = $('sosWeatherBubbleToggle');
  const sosMarkerNormalToggleEl = $('sosMarkerNormalToggle');
  const sosMarkerWarningToggleEl = $('sosMarkerWarningToggle');
  const sosMarkerErrorToggleEl = $('sosMarkerErrorToggle');
  const assetFilterBtn = $('assetFilterBtn');
  const assetFilterPopup = $('assetFilterPopup');
  const foControlBtn = $('foControlBtn');
  const foControlPopup = $('foControlPopup');
  const weatherControlBtn = $('weatherControlBtn');
  const weatherControlPopup = $('weatherControlPopup');
  const vehicleControlBtn = $('vehicleControlBtn');
  const vehicleControlPopup = $('vehicleControlPopup');
  const vehicleTypeToggleListEl = $('vehicleTypeToggleList');
  const toolbarMenuBtnEl = document.getElementById('toolbarMenuBtn');
  const toolbarMenuPanelEl = document.getElementById('toolbarMenuPanel');
  const mapCameraDebugEl = $('mapCameraDebug');
  const networkArcTooltipEl = $('networkArcTooltip');
  const sosNotificationPanelEl = $('sosNotificationPanel');
  const sosNotificationListEl = $('sosNotificationList');
  const sosIncidentFiltersEl = $('sosIncidentFilters');
  const sosIncidentListEl = $('sosIncidentList');
  const sosIncidentListLoadingEl = $('sosIncidentListLoading');
  const sosPanelEyebrowEl = $('sosPanelEyebrow');
  const sosPanelTitleEl = $('sosPanelTitle');
  const vehicleSummaryCardsEl = $('vehicleSummaryCards');
  const vehicleSummaryTotalBtn = $('vehicleSummaryTotalBtn');
  const vehicleSummaryMovingBtn = $('vehicleSummaryMovingBtn');
  const vehicleSummaryAnomalyBtn = $('vehicleSummaryAnomalyBtn');
  const vehicleSummaryTotalEl = $('vehicleSummaryTotal');
  const vehicleSummaryGpsEl = $('vehicleSummaryGps');
  const vehicleSummaryMovingEl = $('vehicleSummaryMoving');
  const vehicleSummaryMovementEl = $('vehicleSummaryMovement');
  const vehicleSummaryAnomaliesEl = $('vehicleSummaryAnomalies');
  const vehicleSummaryFreshnessEl = $('vehicleSummaryFreshness');
  const sosVehiclePanelEyebrowEl = $('sosVehiclePanelEyebrow');
  const sosVehiclePanelTitleEl = $('sosVehiclePanelTitle');
  const sosVehicleCountBadgeEl = $('sosVehicleCountBadge');
  const sosVehicleFiltersEl = $('sosVehicleFilters');
  const sosVehicleListEl = $('sosVehicleList');
  const sosVehicleListLoadingEl = $('sosVehicleListLoading');
  const sosDetailPanelEl = $('sosDetailPanel');
  const sosDetailTitleEl = $('sosDetailTitle');
  const sosDetailStatusEl = $('sosDetailStatus');
  const sosDetailMetaEl = $('sosDetailMeta');
  const sosDetailBodyEl = $('sosDetailBody');
  const sosSmartResponsePanelEl = $('sosSmartResponsePanel');
  const sosSmartResponseTitleEl = $('sosSmartResponseTitle');
  const sosSmartResponseStatusEl = $('sosSmartResponseStatus');
  const sosSmartResponseBodyEl = $('sosSmartResponseBody');
  const closeSosDetailBtn = $('closeSosDetailBtn');
  const sosContactReporterBtn = $('sosContactReporterBtn');
  const sosDispatchBtn = $('sosDispatchBtn');
  const sosCompleteBtn = $('sosCompleteBtn');
  const sosDispatchModalEl = $('sosDispatchModal');
  const sosCompleteModalEl = $('sosCompleteModal');
  const closeSosDispatchBtn = $('closeSosDispatchBtn');
  const closeSosCompleteBtn = $('closeSosCompleteBtn');
  const sosDispatchFormEl = $('sosDispatchForm');
  const sosCompleteFormEl = $('sosCompleteForm');
  const sosDispatchSosIdEl = $('sosDispatchSosId');
  const sosCompleteTicketNoEl = $('sosCompleteTicketNo');
  const sosIncidentTypeInputEl = $('sosIncidentTypeInput');
  const sosVehicleTypeInputEl = $('sosVehicleTypeInput');
  const sosChronologyInputEl = $('sosChronologyInput');
  const sosDispatchStatusEl = $('sosDispatchStatus');
  const sosCompletionNoteInputEl = $('sosCompletionNoteInput');
  const sosCompleteStatusEl = $('sosCompleteStatus');
  const sosCctvModalEl = $('sosCctvModal');
  const closeSosCctvModalBtn = $('closeSosCctvModalBtn');
  const sosCctvModalTitleEl = $('sosCctvModalTitle');
  const sosCctvModalBodyEl = $('sosCctvModalBody');
  const sosCctvModalVideoEl = $('sosCctvModalVideo');
  const sosCctvModalStreamEmptyEl = $('sosCctvModalStreamEmpty');
  const sosCctvModalMetaEl = $('sosCctvModalMeta');
  const disabledButtons = [
    $('openBranchBtn'),
    $('quickSearchBtn'),
    $('layoutConfigBtn'),
    $('focusModeBtn'),
    $('normalModeBtn'),
    $('reloadStreamBtn'),
  ];
  const capabilityApi = window.appCapability;
  const sessionStore = window.appSessionStore;

  if (!sosMonitorBtn || !sosDashboardEl || !sosMapEl || !window.cameraService) {
    return;
  }

  const getSessionSnapshot = () =>
    sessionStore && typeof sessionStore.getState === 'function'
      ? sessionStore.getState()
      : capabilityApi && typeof capabilityApi.createAnonymousSession === 'function'
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

  const canUseAssetMonitoring = () =>
    Boolean(capabilityApi && capabilityApi.canUseAssetMonitoring(getSessionSnapshot()));

  const canViewAllBranches = () =>
    Boolean(getSessionSnapshot() && getSessionSnapshot().canViewAllBranches);

  const canDispatchSos = () =>
    Boolean(capabilityApi && capabilityApi.canDispatchSos(getSessionSnapshot()));

  const canCompleteSos = () =>
    Boolean(capabilityApi && capabilityApi.canCompleteSos(getSessionSnapshot()));

  const canConfirmSosResponse = () =>
    Boolean(capabilityApi && capabilityApi.canConfirmSosResponse(getSessionSnapshot()));

  const filterAllowedBranches = (branches) =>
    capabilityApi && typeof capabilityApi.filterAllowedBranches === 'function'
      ? capabilityApi.filterAllowedBranches(getSessionSnapshot(), branches)
      : Array.isArray(branches)
        ? branches
        : [];

  const applySosActionButtonState = (alert) => {
    const canDispatch = canDispatchSos() && alert && Number(alert.status) === 0;
    const canComplete =
      canCompleteSos() &&
      alert &&
      alert.ticket &&
      alert.ticket.ticket_no &&
      Number(alert.status) === 1;
    const canContact = Boolean(
      alert &&
      alert.user &&
      getWhatsAppLink(alert.user.phone || '')
    );
    if (sosContactReporterBtn) {
      sosContactReporterBtn.disabled = !canContact;
    }
    sosDispatchBtn.disabled = !canDispatch;
    sosCompleteBtn.disabled = !canComplete;
  };

  const getGoogleMapsMapId = () => String(GOOGLE_MAPS_MAP_ID || '').trim();
  const hasGoogleMapsMapId = () => Boolean(getGoogleMapsMapId());

  const MAP_THEME_PRESETS = {
    default: null,
    'dark-ops': [
      { elementType: 'geometry', stylers: [{ color: '#1f4c85' }] },
      { elementType: 'labels.text.fill', stylers: [{ color: '#e7f6ff' }] },
      { elementType: 'labels.text.stroke', stylers: [{ color: '#1c3f6e' }] },
      { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#10396a' }] },
      { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#27558c' }] },
      { featureType: 'poi', stylers: [{ visibility: 'off' }] },
      { featureType: 'transit', stylers: [{ visibility: 'off' }] },
    ],
    'minimal-light': [
      { elementType: 'geometry', stylers: [{ color: '#eef3f7' }] },
      { elementType: 'labels.text.fill', stylers: [{ color: '#36566f' }] },
      { elementType: 'labels.text.stroke', stylers: [{ color: '#f7fbfe' }] },
      { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#bfd5ec' }] },
      { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
      { featureType: 'poi', stylers: [{ visibility: 'off' }] },
      { featureType: 'transit', stylers: [{ visibility: 'off' }] },
      { featureType: 'administrative.land_parcel', stylers: [{ visibility: 'off' }] },
    ],
  };

  const state = {
    isActive: false,
    mapContext: {
      selectedBranch: null,
      availableBranches: [],
      themePreset: 'dark-ops',
      cameraMode: 'tilt',
      cameraHeading: 0,
      streamStatus: 'idle',
    },
    gateAlerts: {
      items: new Map(),
      markers: new Map(),
      details: new Map(),
      selectedGateId: null,
      markerClass: null,
      clusterDistancePx: 44,
      visible: true,
    },
    standaloneAssets: {
      items: new Map(),
      details: new Map(),
      selectedAssetKey: null,
      selectedLabelLatLng: null,
      assetMarkers: new Map(),
      clusterMarkers: new Map(),
      selectedLabelOverlay: null,
      selectedLabelOverlayClass: null,
    },
    networkArcs: {
      items: [],
      cacheByBranch: new Map(),
      meta: null,
      visible: true,
      experimentalEnabled: false,
      selectedEdgeKey: null,
      hoveredEdgeKey: null,
      overlay: null,
      hasLoaded: false,
      errorMessage: '',
      animationFrame: 0,
      animationStartedAt: 0,
      currentTime: 0,
    },
    weather: {
      items: [],
      cacheByBranch: new Map(),
      meta: null,
      visible: true,
      expandAllBubbles: false,
      selectedWeatherId: null,
      hasLoaded: false,
      errorMessage: '',
      markers: new Map(),
      markerClass: null,
    },
    vehicles: {
      apiBaseUrl: '',
      items: new Map(),
      markers: new Map(),
      clusterMarkers: new Map(),
      clusterer: null,
      clusterSyncToken: 0,
      markerClass: null,
      summary: null,
      details: new Map(),
      selectedVehicleId: null,
      listFilter: 'all',
      hiddenTypeKeys: new Set(),
      animationFrame: 0,
      refreshTimer: null,
      refreshDetailPending: false,
      lastSnapshotAt: '',
      lastRefreshAt: '',
    },
    smartResponse: {
      summariesByTicketNo: new Map(),
      summariesBySosId: new Map(),
      selectedTicketNo: '',
      selectedResponse: null,
      selectedTimeline: [],
      activeTab: 'summary',
      expandedCandidateVehicleId: null,
      timelineExpanded: false,
      selectedResponseLoading: false,
      selectedTimelineLoading: false,
      selectedResponseError: '',
      selectedTimelineError: '',
      responseRequestKey: '',
      timelineRequestKey: '',
      confirmArrivalSubmittingVehicleId: null,
      confirmArrivalError: '',
      confirmArrivalSuccessMessage: '',
    },
    incidents: {
      alerts: new Map(),
      ticketsBySosId: new Map(),
      suppressedCompletedSosIds: new Set(),
      selectedSosId: null,
      notifications: [],
      animation: {
        previousVisibleItems: new Map(),
        enteringKeys: new Set(),
        leavingItems: new Map(),
        enterTimers: new Map(),
        leaveTimers: new Map(),
        pendingMode: 'silent',
      },
      filters: {
        sos: true,
        cctv: true,
        vms: true,
        gate: true,
        weather: true,
      },
    },
    ui: {
      topbarFloating: true,
      mapLoading: false,
      mapEmptyMessage: 'Hubungkan API lalu buka asset monitoring untuk memantau asset dan kejadian secara real-time.',
      selectedEntityType: '',
      selectedEntityId: null,
      lockedMarkerLabel: null,
      previewMarkerLabel: null,
      cctvClusterRenderTimeout: 0,
      mapInteractionActive: false,
      initialTiltSyncPending: true,
      mapCameraDebugVisible: false,
      sosFocusAnimationFrame: 0,
      cctvModalOpenedAt: 0,
    },
    markerStatusFilters: {
      normal: true,
      warning: true,
      error: true,
    },
    alerts: new Map(),
    ticketsBySosId: new Map(),
    selectedSosId: null,
    notifications: [],
    notificationEnteringIds: new Set(),
    notificationEnterTimers: new Map(),
    notificationTimers: new Map(),
    notificationLeavingIds: new Set(),
    notificationCounter: 0,
    mapsLoaderPromise: null,
    mapsCoreLibraryPromise: null,
    map: null,
    trafficLayer: null,
    gateProjectionOverlay: null,
    cctvMarkers: [],
    cctvCluster: null,
    cctvMapBranchId: null,
    cctvMapBranchLabel: '',
    cctvMapLayerKey: '',
    cctvViewportKey: '',
    cctvClusterOverlayKey: '',
    cctvVisible: true,
    vmsVisible: true,
    cctvCacheByBranch: new Map(),
    cctvMarkerLoadSeq: 0,
    markerClustererLoaderPromise: null,
    cctvProjectionOverlay: null,
    cctvProjectionReadyPromise: null,
    cctvSpiderfyLegs: [],
    cctvSpiderfyTempMarkers: [],
    cctvSpiderfiedCameraIds: new Set(),
    cctvSpiderfyClusterMarker: null,
    cctvSelectedCameraId: null,
    cctvSuppressMapClickUntil: 0,
    detailRenderKey: '',
    cctvModalController: null,
    onlyIconDataUris: {},
    onlyIconLoaderPromise: null,
    colorIconDataUris: {},
    colorIconLoaderPromise: null,
    markers: new Map(),
    markerClass: null,
    streamAbortController: null,
    streamRetryTimer: null,
    ticketRefreshTimer: null,
    alertRefreshTimer: null,
    vehicleFallbackTimer: null,
    isInitialSnapshotLoaded: false,
    activeWorkspaceBranch: null,
  };

  const debugLog = (eventName, detail = null) => {
    try {
      if (detail && typeof detail === 'object') {
        console.info('[asset-monitoring]', eventName, detail);
        return;
      }
      console.info('[asset-monitoring]', eventName, detail == null ? '' : detail);
    } catch (_) {
      // Ignore logging failures.
    }
  };

  const setText = (element, value) => {
    if (element) {
      element.textContent = String(value ?? '');
    }
  };

  const setClass = (element, value) => {
    if (element) {
      element.className = value;
    }
  };

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  const toSentenceCase = (value) => {
    const input = String(value ?? '');
    if (!input.trim()) {
      return '';
    }
    const normalized = input.trimStart();
    let shouldUppercaseNext = true;
    let result = '';
    for (let index = 0; index < normalized.length; index += 1) {
      const char = normalized[index];
      if (shouldUppercaseNext && /[A-Za-z]/.test(char)) {
        result += char.toUpperCase();
        shouldUppercaseNext = false;
        continue;
      }
      result += char;
      if (/[.!?]/.test(char)) {
        shouldUppercaseNext = true;
      }
    }
    return result;
  };

  const applySentenceCaseValue = (element) => {
    if (!(element && typeof element.value === 'string')) {
      return;
    }
    const nextValue = toSentenceCase(element.value);
    if (nextValue === element.value) {
      return;
    }
    element.value = nextValue;
  };

  const applyLiveSentenceCaseValue = (element) => {
    if (!(element && typeof element.value === 'string')) {
      return;
    }
    const currentValue = element.value;
    const selectionStart =
      typeof element.selectionStart === 'number' ? element.selectionStart : currentValue.length;
    const selectionEnd =
      typeof element.selectionEnd === 'number' ? element.selectionEnd : currentValue.length;
    const nextValue = toSentenceCase(currentValue);
    if (nextValue === currentValue) {
      return;
    }
    element.value = nextValue;
    if (typeof element.setSelectionRange === 'function') {
      element.setSelectionRange(selectionStart, selectionEnd);
    }
  };

  const bindSentenceCaseInput = (element) => {
    if (!element) {
      return;
    }
    element.addEventListener('input', () => {
      applyLiveSentenceCaseValue(element);
    });
    element.addEventListener('blur', () => {
      applySentenceCaseValue(element);
    });
  };

  const setMapLoadingVisible = (visible) => {
    state.ui.mapLoading = Boolean(visible);
    if (state.ui.mapLoading && sosMapEmptyEl) {
      sosMapEmptyEl.classList.add('hidden');
    }
    updateMapEmptyState();
  };

  const setIncidentListLoadingVisible = (visible) => {
    if (!sosIncidentListLoadingEl) {
      return;
    }
    sosIncidentListLoadingEl.classList.toggle('sidebar-section-hidden', !visible);
    if (sosIncidentListEl) {
      sosIncidentListEl.classList.toggle('sos-incident-list--loading', visible);
    }
  };
  const setVehicleListLoadingVisible = (visible) => {
    if (!sosVehicleListLoadingEl) {
      return;
    }
    sosVehicleListLoadingEl.classList.toggle('sidebar-section-hidden', !visible);
    if (sosVehicleListEl) {
      sosVehicleListEl.classList.toggle('sos-incident-list--loading', visible);
    }
  };

  const escapeHtml = (value) =>
    String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const showModal = (modalEl) => {
    modalEl.classList.add('visible');
    modalEl.setAttribute('aria-hidden', 'false');
  };

  const hideModal = (modalEl) => {
    modalEl.classList.remove('visible');
    modalEl.setAttribute('aria-hidden', 'true');
  };

  const toArray = (value) => (Array.isArray(value) ? value : value ? [value] : []);

  const unwrapCollection = (payload) => {
    if (Array.isArray(payload)) {
      return payload;
    }
    if (!payload || typeof payload !== 'object') {
      return [];
    }
    if (payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data)) {
      const nestedData = unwrapCollection(payload.data);
      if (nestedData.length) {
        return nestedData;
      }
    }
    if (Array.isArray(payload.data)) {
      return payload.data;
    }
    if (Array.isArray(payload.items)) {
      return payload.items;
    }
    if (Array.isArray(payload.rows)) {
      return payload.rows;
    }
    if (Array.isArray(payload.results)) {
      return payload.results;
    }
    return [];
  };

  const unwrapSingle = (payload) => {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      return payload;
    }
    if (payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data)) {
      return payload.data;
    }
    if (payload.item && typeof payload.item === 'object') {
      return payload.item;
    }
    return payload;
  };

  const unwrapStreamPayload = (payload) => {
    if (Array.isArray(payload)) {
      return payload;
    }
    if (!payload || typeof payload !== 'object') {
      return [];
    }
    const collections = ['items', 'data', 'alerts', 'rows', 'results'];
    for (const key of collections) {
      if (Array.isArray(payload[key])) {
        return payload[key];
      }
      if (payload[key] && typeof payload[key] === 'object') {
        const nested = unwrapCollection(payload[key]);
        if (nested.length) {
          return nested;
        }
      }
    }
    if (payload.item && typeof payload.item === 'object') {
      return [payload.item];
    }
    if (payload.alert && typeof payload.alert === 'object') {
      return [payload.alert];
    }
    if (payload.sos && typeof payload.sos === 'object') {
      return [payload];
    }
    const single = normalizeAlert(payload);
    return single ? [payload] : [];
  };

  const DATE_MONTH_NAMES = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];

  const formatFullDateTime = (value) => {
    if (!value) {
      return '-';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return String(value);
    }
    const day = String(date.getDate()).padStart(2, '0');
    const month = DATE_MONTH_NAMES[date.getMonth()] || '';
    const year = String(date.getFullYear());
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${day} ${month} ${year} \u2022 ${hours}:${minutes}:${seconds}`;
  };

  const toDateTime = (value) => formatFullDateTime(value);
  const toDateTimeWithSeconds = (value) => formatFullDateTime(value);

  const formatDispatchDateTime = (value) => formatFullDateTime(value);

  const formatTimeOnly = (value) => {
    if (!value) {
      return '-';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return String(value);
    }
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };


  const sortSmartResponseTimelineItems = (items) =>
    (Array.isArray(items) ? items.slice() : []).sort((left, right) => {
      const leftTime = new Date(left && left.event_at ? left.event_at : 0).getTime();
      const rightTime = new Date(right && right.event_at ? right.event_at : 0).getTime();
      if (leftTime !== rightTime) {
        return rightTime - leftTime;
      }
      const leftId = Number(left && left.id);
      const rightId = Number(right && right.id);
      if (Number.isFinite(leftId) && Number.isFinite(rightId) && leftId !== rightId) {
        return rightId - leftId;
      }
      return String(right && right.id || '').localeCompare(String(left && left.id || ''));
    });

  const formatWeatherObservedAt = (value) => {
    if (!value) {
      return '-';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return String(value);
    }
    const now = new Date();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    if (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate()
    ) {
      return `Hari ini, ${hours}:${minutes}`;
    }
    return toDateTime(value);
  };


  const formatGateIssueDuration = (value, now = Date.now()) => {
    if (!value) {
      return '';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '';
    }
    const diffMs = Math.max(0, now - date.getTime());
    const totalMinutes = Math.floor(diffMs / 60000);
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = totalMinutes % 60;
    const parts = [];
    if (days > 0) {
      parts.push(`${days} hari`);
    }
    if (hours > 0) {
      parts.push(`${hours} jam`);
    }
    if (minutes > 0 || !parts.length) {
      parts.push(`${minutes} menit`);
    }
    return parts.join(' ');
  };

  const normalizePhoneNumber = (value) => {
    let normalized = String(value || '').trim();
    if (!normalized) {
      return '';
    }
    normalized = normalized.replace(/\s+/g, '');
    normalized = normalized.replace(/^0\+/, '');
    normalized = normalized.replace(/^\+/, '');
    normalized = normalized.replace(/[^\d]/g, '');
    if (normalized.startsWith('0')) {
      normalized = `62${normalized.slice(1)}`;
    } else if (normalized.startsWith('8')) {
      normalized = `62${normalized}`;
    }
    return normalized;
  };

  const getDisplayPhoneNumber = (value) => {
    let normalized = String(value || '').trim();
    if (!normalized) {
      return '';
    }
    normalized = normalized.replace(/\s+/g, '');
    normalized = normalized.replace(/^0\+62/, '0');
    normalized = normalized.replace(/^\+62/, '0');
    normalized = normalized.replace(/^62/, '0');
    return normalized;
  };

  const getWhatsAppLink = (phoneNumber) => {
    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    return normalizedPhone ? `https://wa.me/${normalizedPhone}` : '';
  };

  const makeAssetKey = (assetType, id) => `${String(assetType || '').trim()}:${String(id || '').trim()}`;
  const makeNetworkEdgeKey = (edge) =>
    String((edge && (edge.edge_code || edge.edge_id)) || '')
      .trim()
      .toLowerCase();
  const GATE_ISSUE_STATUSES = new Set(['error', 'offline', 'warning']);
  const ASSET_ISSUE_STATUSES = new Set(['error', 'offline', 'warning']);
  const isGateIssueStatus = (status) => GATE_ISSUE_STATUSES.has(String(status || '').trim().toLowerCase());
  const isAssetIssueStatus = (status) => ASSET_ISSUE_STATUSES.has(String(status || '').trim().toLowerCase());
  const getGateIssueStatusTone = (status) => {
    const normalized = String(status || '').trim().toLowerCase();
    if (normalized === 'warning') {
      return 'warning';
    }
    if (normalized === 'error' || normalized === 'offline') {
      return 'danger';
    }
    return 'neutral';
  };
  const getSeverityTone = (severity) => {
    const normalized = String(severity || '').trim().toLowerCase();
    if (normalized === 'high') {
      return 'danger';
    }
    if (normalized === 'warning') {
      return 'warning';
    }
    return 'neutral';
  };
  const getAssetIssueTone = (status) => {
    const normalized = String(status || '').trim().toLowerCase();
    if (normalized === 'warning') {
      return 'warning';
    }
    if (normalized === 'error' || normalized === 'offline') {
      return 'danger';
    }
    return 'neutral';
  };
  const getMarkerFilterKeyFromTone = (tone) => {
    if (tone === 'danger') {
      return 'error';
    }
    if (tone === 'warning') {
      return 'warning';
    }
    return 'normal';
  };
  const isMarkerStatusFilterEnabled = (key) =>
    Boolean(state.markerStatusFilters[String(key || '').toLowerCase()]);
  const getNetworkStatusTone = (status) => {
    const normalized = String(status || '').trim().toLowerCase();
    if (normalized === 'warning') {
      return 'warning';
    }
    if (normalized === 'error') {
      return 'danger';
    }
    if (normalized === 'inactive') {
      return 'neutral';
    }
    return 'success';
  };
  const nextNotificationId = (prefix) => {
    state.notificationCounter += 1;
    return `${String(prefix || 'notif')}:${Date.now()}:${state.notificationCounter}`;
  };

  const parseCoordinate = (value) => {
    if (value === null || value === undefined) {
      return NaN;
    }
    if (typeof value === 'string' && !value.trim()) {
      return NaN;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : NaN;
  };

  const createVehicleFallbackIconDataUrl = () =>
    `data:image/svg+xml;utf8,${encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#0c3f73"/><path d="M18 36h4l3-11h14l7 11h4v8h-4a4 4 0 1 1-8 0H26a4 4 0 1 1-8 0h-4z" fill="#f4fbff"/><circle cx="24" cy="44" r="4" fill="#1ed8de"/><circle cx="40" cy="44" r="4" fill="#1ed8de"/></svg>'
    )}`;

  const resolveVehicleTypeIconUrl = (
    iconPath,
    apiBaseUrl = '',
    fallbackPath = DEFAULT_VEHICLE_TYPE_ICON_PATH
  ) => {
    const normalizedApiBaseUrl = String(apiBaseUrl || '').trim();
    const tryResolve = (value) => {
      const rawValue = String(value || '').trim();
      if (!rawValue) {
        return '';
      }
      try {
        return new URL(rawValue).toString();
      } catch (_) {
        if (!normalizedApiBaseUrl) {
          return '';
        }
        try {
          return new URL(rawValue, normalizedApiBaseUrl).toString();
        } catch (_) {
          return '';
        }
      }
    };
    return (
      tryResolve(iconPath) ||
      tryResolve(fallbackPath) ||
      createVehicleFallbackIconDataUrl()
    );
  };

  const normalizeVehicleTypeRef = (item, apiBaseUrl = '') => {
    if (!item || typeof item !== 'object') {
      return null;
    }
    const iconPath = String(item.icon_path || '').trim();
    return {
      id: Number.isFinite(Number(item.id)) ? Number(item.id) : null,
      type_code: String(item.type_code || '').trim() || null,
      type_name: String(item.type_name || '').trim() || null,
      icon_path: iconPath || DEFAULT_VEHICLE_TYPE_ICON_PATH,
      is_active: item.is_active === null || item.is_active === undefined ? null : Boolean(item.is_active),
      icon_url: resolveVehicleTypeIconUrl(iconPath, apiBaseUrl),
    };
  };

  const VEHICLE_TYPE_FILTER_OPTIONS = [
    { key: 'all', label: 'Semua Kendaraan' },
    { key: 'patroli', label: 'Patroli' },
    { key: 'derek', label: 'Derek' },
    { key: 'rescue', label: 'Rescue' },
    { key: 'ambulance', label: 'Ambulance' },
    { key: 'pjr', label: 'PJR' },
  ];

  const normalizeVehicleTypeKey = (value) => {
    const normalized = String(value || '').trim().toLowerCase();
    if (!normalized) {
      return 'unknown';
    }
    if (['patroli', 'patrol'].includes(normalized)) {
      return 'patroli';
    }
    if (['derek', 'towing', 'tow'].includes(normalized)) {
      return 'derek';
    }
    if (normalized === 'rescue') {
      return 'rescue';
    }
    if (['ambulance', 'ambulan'].includes(normalized)) {
      return 'ambulance';
    }
    if (['pjr', 'police', 'polisi'].includes(normalized)) {
      return 'pjr';
    }
    return 'unknown';
  };

  const getVehicleTypeKey = (vehicle) => {
    const typeRef = vehicle && vehicle.vehicle_type_ref ? vehicle.vehicle_type_ref : null;
    const keySource =
      (typeRef && (typeRef.type_code || typeRef.type_name || typeRef.id)) ||
      (vehicle && vehicle.vehicle_type) ||
      'unknown';
    return normalizeVehicleTypeKey(keySource);
  };

  const getVehicleTypeLabel = (vehicle) => {
    const key = getVehicleTypeKey(vehicle);
    const matched = VEHICLE_TYPE_FILTER_OPTIONS.find((item) => item.key === key);
    return matched ? matched.label : 'Lainnya';
  };

  const getVehiclePopupTypeLabel = (vehicle) => {
    const key = getVehicleTypeKey(vehicle);
    if (key === 'unknown') {
      return 'n.a';
    }
    return getVehicleTypeLabel(vehicle);
  };

  const areAllSpecificVehicleTypesVisible = () =>
    VEHICLE_TYPE_FILTER_OPTIONS.filter((item) => item.key !== 'all').every(
      (item) => !state.vehicles.hiddenTypeKeys.has(item.key)
    );

  const isVehicleTypeVisible = (vehicle) => {
    const vehicleTypeKey = getVehicleTypeKey(vehicle);
    if (vehicleTypeKey === 'unknown') {
      return areAllSpecificVehicleTypesVisible();
    }
    return !state.vehicles.hiddenTypeKeys.has(vehicleTypeKey);
  };

  const getVehicleGpsTone = (vehicle) => {
    const status = String(vehicle && vehicle.gps_status ? vehicle.gps_status : 'offline').toLowerCase();
    if (status === 'online') return 'success';
    if (status === 'delayed') return 'warning';
    if (status === 'stale') return 'danger';
    if (status === 'offline') return 'neutral';
    return 'neutral';
  };

  const getVehicleGpsLabel = (status) => {
    const normalized = String(status || '').trim().toLowerCase();
    if (normalized === 'online') return 'Aktif';
    if (normalized === 'delayed') return 'Terlambat';
    if (normalized === 'stale') return 'Lama';
    if (normalized === 'offline') return 'Offline';
    return 'Tidak Diketahui';
  };

  const getVehicleMovementLabel = (status) => {
    const normalized = String(status || '').trim().toLowerCase();
    if (normalized === 'moving') return 'Berjalan';
    if (normalized === 'stopped') return 'Berhenti';
    if (normalized === 'idle') return 'Diam';
    return 'Tidak Diketahui';
  };

  const formatSpeedKmh = (value) => {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? `${Math.round(numeric)} km/h` : '-';
  };

  const formatBearing = (value) => {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? `${Math.round(numeric)}\u00B0` : '-';
  };

  const haversineDistanceMeters = (fromLatLng, toLatLng) => {
    if (!(fromLatLng && toLatLng)) {
      return Infinity;
    }
    const toRad = (value) => (Number(value) * Math.PI) / 180;
    const earthRadius = 6371000;
    const dLat = toRad(Number(toLatLng.lat) - Number(fromLatLng.lat));
    const dLng = toRad(Number(toLatLng.lng) - Number(fromLatLng.lng));
    const lat1 = toRad(Number(fromLatLng.lat));
    const lat2 = toRad(Number(toLatLng.lat));
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const getVehicleSummaryButtonLabel = (filter) => {
    const normalized = String(filter || '').trim().toLowerCase();
    if (normalized === 'moving') {
      return 'Berjalan';
    }
    if (normalized === 'stopped') {
      return 'Berhenti';
    }
    return 'Semua';
  };

  const isVehiclePredictionEligible = (vehicle) => {
    if (!vehicle) {
      return false;
    }
    const gpsStatus = String(vehicle.gps_status || '').trim().toLowerCase();
    const movementStatus = String(vehicle.movement_status || '').trim().toLowerCase();
    const speed = Number(vehicle.speed);
    const bearing = Number(vehicle.bearing);
    if (gpsStatus === 'offline' || gpsStatus === 'stale') {
      return false;
    }
    if (movementStatus !== 'moving') {
      return false;
    }
    if (!Number.isFinite(speed) || speed <= 0 || speed > VEHICLE_PREDICTION_MAX_SPEED_KMH) {
      return false;
    }
    return Number.isFinite(bearing);
  };

  const normalizeLatLngLiteral = (latLng) => {
    if (!latLng) {
      return null;
    }
    const lat = typeof latLng.lat === 'function' ? latLng.lat() : latLng.lat;
    const lng = typeof latLng.lng === 'function' ? latLng.lng() : latLng.lng;
    return Number.isFinite(Number(lat)) && Number.isFinite(Number(lng))
      ? { lat: Number(lat), lng: Number(lng) }
      : null;
  };

  const blendLatLngLiteral = (fromLatLng, toLatLng, progress) => {
    const from = normalizeLatLngLiteral(fromLatLng);
    const to = normalizeLatLngLiteral(toLatLng);
    if (!(from && to)) {
      return to || from || null;
    }
    const clamped = Math.max(0, Math.min(1, Number(progress) || 0));
    return {
      lat: from.lat + (to.lat - from.lat) * clamped,
      lng: from.lng + (to.lng - from.lng) * clamped,
    };
  };

  const getVehiclePredictionHorizonMs = (entry) => {
    const lastBackendAt = Number(entry && entry.lastBackendAt);
    const previousBackendAt = Number(entry && entry.previousBackendAt);
    const backendDelta =
      Number.isFinite(lastBackendAt) && Number.isFinite(previousBackendAt) && lastBackendAt > previousBackendAt
        ? lastBackendAt - previousBackendAt
        : VEHICLE_INTERPOLATION_DEFAULT_MS * 2;
    const bufferedDelta = backendDelta * 1.15;
    return Math.max(
      VEHICLE_PREDICTION_MIN_MS,
      Math.min(VEHICLE_PREDICTION_MAX_MS, bufferedDelta)
    );
  };

  const projectLatLngByDistanceAndBearing = (latLng, bearingDeg, distanceMeters) => {
    if (!(latLng && Number.isFinite(Number(bearingDeg)) && Number.isFinite(Number(distanceMeters)))) {
      return latLng ? { lat: Number(latLng.lat), lng: Number(latLng.lng) } : null;
    }
    const earthRadius = 6371000;
    const angularDistance = Number(distanceMeters) / earthRadius;
    const bearingRad = (Number(bearingDeg) * Math.PI) / 180;
    const lat1 = (Number(latLng.lat) * Math.PI) / 180;
    const lng1 = (Number(latLng.lng) * Math.PI) / 180;
    const sinLat1 = Math.sin(lat1);
    const cosLat1 = Math.cos(lat1);
    const sinAngular = Math.sin(angularDistance);
    const cosAngular = Math.cos(angularDistance);
    const lat2 = Math.asin(
      sinLat1 * cosAngular + cosLat1 * sinAngular * Math.cos(bearingRad)
    );
    const lng2 =
      lng1 +
      Math.atan2(
        Math.sin(bearingRad) * sinAngular * cosLat1,
        cosAngular - sinLat1 * Math.sin(lat2)
      );
    return {
      lat: (lat2 * 180) / Math.PI,
      lng: ((((lng2 * 180) / Math.PI) + 540) % 360) - 180,
    };
  };

  const getVehiclePredictionSpeedMetersPerSecond = (entry) =>
    ((Number(entry && entry.lastKnownSpeed ? entry.lastKnownSpeed : 0) * VEHICLE_PREDICTION_SPEED_FACTOR) * 1000) /
    3600;

  const clearVehicleMotionCorrection = (entry) => {
    if (!entry) {
      return;
    }
    entry.correctionOriginLatLng = null;
    entry.correctionStartedAt = 0;
    entry.correctionUntil = 0;
  };

  const isVehicleMotionCorrectionActive = (entry, now = performance.now()) =>
    Boolean(
      entry &&
      entry.correctionOriginLatLng &&
      Number(entry.correctionUntil || 0) > Number(entry.correctionStartedAt || 0) &&
      now < Number(entry.correctionUntil || 0)
    );

  const getVehicleMotionBaseLatLng = (entry, vehicle, now = performance.now()) => {
    const anchorLatLng = normalizeLatLngLiteral(entry && entry.lastBackendLatLng);
    if (!anchorLatLng) {
      return normalizeLatLngLiteral(
        (entry && entry.currentLatLng) || (vehicle && (vehicle.renderLatLng || vehicle.latLng))
      );
    }
    if (!isVehiclePredictionEligible(vehicle)) {
      return anchorLatLng;
    }
    const anchorAt = Number(entry && entry.lastBackendPerfAt ? entry.lastBackendPerfAt : now);
    const horizonMs = Math.min(VEHICLE_PREDICTION_MAX_AGE_MS, getVehiclePredictionHorizonMs(entry));
    const clampedElapsedMs = Math.max(0, Math.min(now - anchorAt, horizonMs));
    const speedMetersPerSecond = getVehiclePredictionSpeedMetersPerSecond(entry);
    if (!(speedMetersPerSecond > 0)) {
      return anchorLatLng;
    }
    return projectLatLngByDistanceAndBearing(
      anchorLatLng,
      Number(entry && entry.lastKnownBearing ? entry.lastKnownBearing : 0),
      speedMetersPerSecond * (clampedElapsedMs / 1000)
    );
  };

  const getVehicleMotionDisplayLatLng = (entry, vehicle, now = performance.now()) => {
    if (!(entry && vehicle)) {
      return null;
    }
    const baseLatLng = getVehicleMotionBaseLatLng(entry, vehicle, now);
    if (!baseLatLng) {
      return null;
    }
    if (!isVehicleMotionCorrectionActive(entry, now)) {
      clearVehicleMotionCorrection(entry);
      return baseLatLng;
    }
    const durationMs = Math.max(1, Number(entry.correctionUntil) - Number(entry.correctionStartedAt));
    const progress = Math.max(0, Math.min(1, (now - Number(entry.correctionStartedAt)) / durationMs));
    if (progress >= 1) {
      clearVehicleMotionCorrection(entry);
      return baseLatLng;
    }
    return blendLatLngLiteral(entry.correctionOriginLatLng, baseLatLng, progress);
  };

  const getVehicleCorrectionDurationMs = (entry, correctionDistanceMeters) => {
    const lastBackendAt = Number(entry && entry.lastBackendAt);
    const previousBackendAt = Number(entry && entry.previousBackendAt);
    const backendDelta =
      Number.isFinite(lastBackendAt) && Number.isFinite(previousBackendAt) && lastBackendAt > previousBackendAt
        ? lastBackendAt - previousBackendAt
        : VEHICLE_INTERPOLATION_DEFAULT_MS;
    const speedMetersPerSecond = getVehiclePredictionSpeedMetersPerSecond(entry);
    const speedDurationMs =
      speedMetersPerSecond > 0 && Number.isFinite(Number(correctionDistanceMeters))
        ? (Number(correctionDistanceMeters) / speedMetersPerSecond) * 1000
        : backendDelta;
    return Math.max(
      VEHICLE_PREDICTION_CORRECTION_MIN_MS,
      Math.min(
        VEHICLE_PREDICTION_CORRECTION_MAX_MS,
        Math.max(backendDelta * 0.8, speedDurationMs)
      )
    );
  };

  const stopVehicleMotion = (entry) => {
    if (!entry) {
      return;
    }
    if (entry.animationFrame) {
      window.cancelAnimationFrame(entry.animationFrame);
      entry.animationFrame = null;
    }
    clearVehicleMotionCorrection(entry);
  };

  const scheduleVehicleMotionFrame = (entry, vehicle, frameFn) => {
    if (!(entry && vehicle && typeof frameFn === 'function')) {
      return;
    }
    if (entry.animationFrame) {
      window.cancelAnimationFrame(entry.animationFrame);
      entry.animationFrame = null;
    }
    entry.animationFrame = window.requestAnimationFrame((now) => {
      entry.animationFrame = null;
      frameFn(now);
    });
  };

  const updateVehicleMarkerVisualPosition = (entry, vehicle, latLng) => {
    if (!(entry && vehicle && latLng)) {
      return;
    }
    vehicle.renderLatLng = { lat: Number(latLng.lat), lng: Number(latLng.lng) };
    entry.currentLatLng = vehicle.renderLatLng;
    if (entry.marker) {
      entry.marker.setPosition(vehicle.renderLatLng);
    }
    if (Number(state.vehicles.selectedVehicleId) === Number(vehicle.vehicle_id)) {
      syncSelectedMarkerLabelOverlay();
    }
  };

  const ensureVehicleMotion = (entry, vehicle) => {
    if (!(entry && vehicle)) {
      return;
    }
    const step = (now) => {
      const nextLatLng = getVehicleMotionDisplayLatLng(entry, vehicle, now);
      if (nextLatLng) {
        updateVehicleMarkerVisualPosition(entry, vehicle, nextLatLng);
      }
      const anchorAt = Number(entry.lastBackendPerfAt || 0);
      const shouldContinueProjecting =
        isVehiclePredictionEligible(vehicle) &&
        Boolean(entry.lastBackendLatLng) &&
        now - anchorAt < Math.min(VEHICLE_PREDICTION_MAX_AGE_MS, getVehiclePredictionHorizonMs(entry));
      if (shouldContinueProjecting || isVehicleMotionCorrectionActive(entry, now)) {
        scheduleVehicleMotionFrame(entry, vehicle, step);
        return;
      }
      entry.animationFrame = null;
      clearVehicleMotionCorrection(entry);
    };
    if (entry.animationFrame) {
      return;
    }
    scheduleVehicleMotionFrame(entry, vehicle, step);
  };

  const normalizeMapBranch = (item) => {
    if (!item || typeof item !== 'object' || !item.id) {
      return null;
    }
    return {
      id: String(item.id),
      branch_code: String(item.branch_code || '').trim(),
      branch_name: String(item.branch_name || '').trim(),
      center_lat: Number(item.center_lat),
      center_lng: Number(item.center_lng),
    };
  };

  const normalizeGateAlert = (item) => {
    if (!item || typeof item !== 'object' || !item.gate_id) {
      return null;
    }
    const lat = Number(item.lat);
    const lng = Number(item.lng);
    return {
      ...item,
      gate_id: String(item.gate_id),
      branch_id: String(item.branch_id || ''),
      lat,
      lng,
      latLng: Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null,
      pulse: Boolean(item.pulse),
      status: String(item.status || 'normal').toLowerCase(),
      severity: String(item.severity || 'none').toLowerCase(),
      affected_devices: toArray(item.affected_devices),
    };
  };

  const NETWORK_STATUS_STYLE = {
    up: {
      key: 'up',
      color: [64, 238, 255],
      speed: 0.18,
      pulse: true,
    },
    degraded: {
      key: 'degraded',
      color: [255, 191, 71],
      speed: 0.1,
      pulse: true,
    },
    down: {
      key: 'down',
      color: [255, 90, 90],
      speed: 0,
      pulse: false,
    },
  };

  const resolveNetworkStatusStyle = (status, severity) => {
    const normalizedStatus = String(status || 'normal').trim().toLowerCase();
    const normalizedSeverity = String(severity || 'none').trim().toLowerCase();
    if (
      ['down', 'error', 'offline', 'critical'].includes(normalizedStatus) ||
      ['critical', 'high'].includes(normalizedSeverity)
    ) {
      return NETWORK_STATUS_STYLE.down;
    }
    if (
      ['degraded', 'warning', 'unstable'].includes(normalizedStatus) ||
      ['medium', 'warning', 'moderate'].includes(normalizedSeverity)
    ) {
      return NETWORK_STATUS_STYLE.degraded;
    }
    return NETWORK_STATUS_STYLE.up;
  };

  const normalizeNetworkArc = (item) => {
    if (!item || typeof item !== 'object' || !(item.edge_id || item.edge_code)) {
      return null;
    }
    const sourcePosition = Array.isArray(item.arc && item.arc.source_position)
      ? item.arc.source_position.map((value) => Number(value))
      : [];
    const targetPosition = Array.isArray(item.arc && item.arc.target_position)
      ? item.arc.target_position.map((value) => Number(value))
      : [];
    if (
      sourcePosition.length < 2 ||
      targetPosition.length < 2 ||
      !sourcePosition.every((value) => Number.isFinite(value)) ||
      !targetPosition.every((value) => Number.isFinite(value))
    ) {
      return null;
    }
    const arcColor = Array.isArray(item.arc && item.arc.color)
      ? item.arc.color.map((value) => Number(value)).filter((value) => Number.isFinite(value))
      : [];
    const sourceBranchId = String((item.source && item.source.branch_id) || '');
    const targetBranchId = String((item.target && item.target.branch_id) || '');
    const sourceLatLng = Number.isFinite(Number(item.source && item.source.lat)) &&
      Number.isFinite(Number(item.source && item.source.lng))
      ? { lat: Number(item.source.lat), lng: Number(item.source.lng) }
      : { lat: sourcePosition[1], lng: sourcePosition[0] };
    const targetLatLng = Number.isFinite(Number(item.target && item.target.lat)) &&
      Number.isFinite(Number(item.target && item.target.lng))
      ? { lat: Number(item.target.lat), lng: Number(item.target.lng) }
      : { lat: targetPosition[1], lng: targetPosition[0] };
    const statusStyle = resolveNetworkStatusStyle(item.status, item.severity);
    return {
      ...item,
      edge_id: String(item.edge_id || ''),
      edge_code: String(item.edge_code || '').trim(),
      edge_name: String(item.edge_name || item.edge_code || item.edge_id || 'Network Arc').trim(),
      connection_type: String(item.connection_type || 'fiber').trim().toLowerCase(),
      status: String(item.status || 'normal').trim().toLowerCase(),
      severity: String(item.severity || 'none').trim().toLowerCase(),
      bandwidth_label: String(item.bandwidth_label || '').trim(),
      distance_km: Number.isFinite(Number(item.distance_km)) ? Number(item.distance_km) : null,
      source: {
        ...(item.source || {}),
        branch_id: sourceBranchId,
        latLng: sourceLatLng,
      },
      target: {
        ...(item.target || {}),
        branch_id: targetBranchId,
        latLng: targetLatLng,
      },
      arc: {
        ...(item.arc || {}),
        source_position: sourcePosition,
        target_position: targetPosition,
        color: arcColor.length >= 3 ? arcColor.slice(0, 3) : statusStyle.color,
        width: Number.isFinite(Number(item.arc && item.arc.width)) ? Number(item.arc.width) : 1,
        height: Number.isFinite(Number(item.arc && item.arc.height)) ? Number(item.arc.height) : 0.35,
        pulse: statusStyle.pulse,
        status_style: statusStyle.key,
        animation_speed: statusStyle.speed,
        visual_color: statusStyle.color.slice(0, 3),
      },
      edgeKey: makeNetworkEdgeKey(item),
      isCrossBranch: Boolean(sourceBranchId && targetBranchId && sourceBranchId !== targetBranchId),
    };
  };

  const normalizeWeatherMarker = (item) => {
    if (!item || typeof item !== 'object' || !item.id) {
      return null;
    }
    const lat = Number(item.lat);
    const lng = Number(item.lng);
    const markerLat = Number(item.marker_lat);
    const markerLng = Number(item.marker_lng);
    const resolvedMarkerLat = Number.isFinite(markerLat) ? markerLat : lat;
    const resolvedMarkerLng = Number.isFinite(markerLng) ? markerLng : lng;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return null;
    }
    if (!Number.isFinite(resolvedMarkerLat) || !Number.isFinite(resolvedMarkerLng)) {
      return null;
    }
    return {
      ...item,
      id: String(item.id),
      branch_id: String(item.branch_id || ''),
      point_code: String(item.point_code || '').trim(),
      point_name: String(item.point_name || item.segment_name || item.corridor_name || `Weather ${item.id}`).trim(),
      corridor_name: String(item.corridor_name || '').trim(),
      segment_name: String(item.segment_name || '').trim(),
      condition_key: String(item.condition_key || '').trim().toUpperCase(),
      weather_label: String(item.weather_label || 'Cuaca').trim(),
      icon_url: String(item.icon_url || '').trim(),
      temperature_c: Number.isFinite(Number(item.temperature_c)) ? Number(item.temperature_c) : null,
      feels_like_c: Number.isFinite(Number(item.feels_like_c)) ? Number(item.feels_like_c) : null,
      humidity_pct: Number.isFinite(Number(item.humidity_pct)) ? Number(item.humidity_pct) : null,
      wind_kph: Number.isFinite(Number(item.wind_kph)) ? Number(item.wind_kph) : null,
      observed_at: String(item.observed_at || '').trim(),
      cached_at: String(item.cached_at || '').trim(),
      expires_at: String(item.expires_at || '').trim(),
      is_stale: Boolean(item.is_stale),
      lat,
      lng,
      marker_lat: resolvedMarkerLat,
      marker_lng: resolvedMarkerLng,
      latLng: { lat: resolvedMarkerLat, lng: resolvedMarkerLng },
    };
  };

  const normalizeVehicleLive = (item, apiBaseUrl = state.vehicles.apiBaseUrl) => {
    if (!item || typeof item !== 'object') {
      return null;
    }
    const vehicleId = Number(item.vehicle_id);
    if (!Number.isFinite(vehicleId)) {
      return null;
    }
    const latitude = parseCoordinate(item.latitude);
    const longitude = parseCoordinate(item.longitude);
    const vehicleTypeRef = normalizeVehicleTypeRef(item.vehicle_type_ref, apiBaseUrl);
    const latLng =
      Number.isFinite(latitude) && Number.isFinite(longitude)
        ? { lat: latitude, lng: longitude }
        : null;
    return {
      ...item,
      vehicle_id: vehicleId,
      branch_id: String(item.branch_id || '').trim(),
      branch_code: String(item.branch_code || '').trim(),
      branch_name: String(item.branch_name || '').trim(),
      label: String(item.label || item.vehicle_registration_plate || item.node || `Kendaraan ${vehicleId}`).trim(),
      node: String(item.node || '').trim(),
      gps_status: String(item.gps_status || 'offline').trim().toLowerCase(),
      movement_status: String(item.movement_status || 'unknown').trim().toLowerCase(),
      has_branch_anomaly: Boolean(item.has_branch_anomaly),
      gps_time: String(item.gps_time || '').trim(),
      received_at: String(item.received_at || '').trim(),
      speed: Number.isFinite(Number(item.speed)) ? Number(item.speed) : null,
      bearing: Number.isFinite(Number(item.bearing)) ? Number(item.bearing) : null,
      data_age_seconds: Number.isFinite(Number(item.data_age_seconds)) ? Number(item.data_age_seconds) : null,
      vehicle_type: String(item.vehicle_type || '').trim(),
      vehicle_type_ref: vehicleTypeRef,
      vehicle_type_icon_url: resolveVehicleTypeIconUrl(
        vehicleTypeRef && vehicleTypeRef.icon_path,
        apiBaseUrl
      ),
      latitude: Number.isFinite(latitude) ? latitude : null,
      longitude: Number.isFinite(longitude) ? longitude : null,
      latLng,
      renderLatLng: latLng ? { ...latLng } : null,
      lastPositionAt: Date.now(),
    };
  };

  const normalizeVehicleSummary = (summary) => {
    const source = summary && typeof summary === 'object' ? summary : {};
    const pick = (key) => (Number.isFinite(Number(source[key])) ? Number(source[key]) : 0);
    return {
      total: pick('total'),
      online: pick('online'),
      delayed: pick('delayed'),
      stale: pick('stale'),
      offline: pick('offline'),
      moving: pick('moving'),
      stopped: pick('stopped'),
      idle: pick('idle'),
      unknown: pick('unknown'),
      anomalies: pick('anomalies'),
    };
  };

  const deriveVehicleSummaryFromItems = () => {
    const summary = normalizeVehicleSummary({});
    Array.from(state.vehicles.items.values()).forEach((vehicle) => {
      if (!(vehicle && isEntityInSelectedBranch(vehicle.branch_id))) {
        return;
      }
      summary.total += 1;
      const gpsStatus = String(vehicle.gps_status || 'offline').toLowerCase();
      if (Object.prototype.hasOwnProperty.call(summary, gpsStatus)) {
        summary[gpsStatus] += 1;
      } else {
        summary.offline += 1;
      }
      const movementStatus = String(vehicle.movement_status || 'unknown').toLowerCase();
      if (Object.prototype.hasOwnProperty.call(summary, movementStatus)) {
        summary[movementStatus] += 1;
      } else {
        summary.unknown += 1;
      }
      if (vehicle.has_branch_anomaly) {
        summary.anomalies += 1;
      }
    });
    return summary;
  };

  const getGateLogEntries = (gate) => {
    const entries = [];
    const addEntry = (device, event) => {
      const source = event && typeof event === 'object' ? event : device;
      if (!source || typeof source !== 'object') {
        return;
      }
      const logDescription = String(source.log_description || '').trim();
      const status = String(source.status || (device && device.status) || '').trim().toLowerCase();
      if (!logDescription) {
        return;
      }
      if (!isGateIssueStatus(status)) {
        return;
      }
      const deviceName =
        String((device && (device.device_name || device.device_type)) || '').trim() ||
        String((source && (source.device_name || source.device_type)) || '').trim() ||
        'Device';
      entries.push({
        deviceName,
        logDescription,
        status,
        severity: String(source.severity || (device && device.severity) || '').trim(),
        lastUpdateAt: source.last_update_at || source.event_at || (device && device.last_update_at) || '',
      });
    };
    toArray(gate && gate.affected_devices).forEach((device) => addEntry(device));
    toArray(gate && gate.devices).forEach((device) => {
      addEntry(device);
      toArray(device && device.recent_events).forEach((event) => addEntry(device, event));
    });
    const seen = new Set();
    return entries.filter((entry) => {
      const key = `${entry.deviceName}:${entry.logDescription}:${entry.lastUpdateAt}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  };

  const getGateLogSummaryText = (gate, fallback = 'Perubahan status perangkat gerbang terdeteksi') => {
    const entries = getGateLogEntries(gate);
    if (!entries.length) {
      return fallback;
    }
    const firstEntries = entries
      .slice(0, 2)
      .map((entry) => `${entry.deviceName}: ${entry.logDescription}`);
    if (entries.length > 2) {
      firstEntries.push(`+${entries.length - 2} log lain`);
    }
    return firstEntries.join(' | ');
  };

  const renderGateLogList = (gate) => {
    const entries = getGateLogEntries(gate);
    if (!entries.length) {
      return '<div class="sos-gate-log-list__empty">Belum ada log device terbaru.</div>';
    }
    return entries
      .map((entry) => {
        const durationText = formatGateIssueDuration(entry.lastUpdateAt);
        return `
          <div class="sos-gate-log-list__item">
            <div class="sos-gate-log-list__head">
              <strong>${escapeHtml(entry.deviceName)}</strong>
              <span class="status-pill ${getGateIssueStatusTone(entry.status)}">${escapeHtml(String(entry.status || '-').toUpperCase())}</span>
            </div>
            <span>${escapeHtml(entry.logDescription)}</span>
            <small class="sos-gate-log-list__meta">${entry.severity ? `<span class="severity-pill ${getSeverityTone(entry.severity)}">${escapeHtml(String(entry.severity).toUpperCase())}</span>` : ''}${entry.lastUpdateAt ? `<span>${escapeHtml(toDateTime(entry.lastUpdateAt))}</span>` : ''}${durationText ? `<span class="sos-gate-log-list__duration">${escapeHtml(durationText)}</span>` : ''}</small>
          </div>
        `;
      })
      .join('');
  };
  const normalizeStandaloneAsset = (item) => {
    if (!item || typeof item !== 'object' || !(item.id || item.asset_id)) {
      return null;
    }
    const lat = Number(item.lat ?? item.cctv_lat ?? item.latitude);
    const lng = Number(item.lng ?? item.cctv_lon ?? item.longitude);
    const assetType = String(item.asset_type || '').trim().toLowerCase();
    const normalizedId = String(item.id || item.asset_id || '');
    return {
      ...item,
      id: normalizedId,
      asset_type: assetType,
      branch_id: String(item.branch_id || ''),
      gate_id: item.gate_id ? String(item.gate_id) : '',
      lat,
      lng,
      latLng: Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null,
      pulse: Boolean(item.pulse),
      status: String(item.status || 'normal').toLowerCase(),
      severity: String(item.severity || 'none').toLowerCase(),
      is_online: Boolean(item.is_online),
      has_live_stream: Boolean(item.has_live_stream),
      title:
        String(item.asset_name || '').trim() ||
        String(item.asset_code || '').trim() ||
        `${assetType.toUpperCase()} ${normalizedId}`,
    };
  };

  const ONLINE_MARKER_URL = new URL('./assets/marker-map-online.svg', window.location.href).toString();
  const OFFLINE_MARKER_URL = new URL('./assets/marker-map-offline.svg', window.location.href).toString();
  const ONLY_ICON_URLS = {
    cctv: new URL('./assets/MARKER/CLUSTER_CCTV.svg', window.location.href).toString(),
    gate: new URL('./assets/MARKER/CLUSTER_GATE.svg', window.location.href).toString(),
    mixed: new URL('./assets/ONLY3_MIXED.svg', window.location.href).toString(),
    vms: new URL('./assets/MARKER/CLUSTER_VMS.svg', window.location.href).toString(),
  };
  const COLOR_ICON_URLS = {
    cctv_online: new URL('./assets/MARKER/COLOR_CCTV_ONLINE.svg', window.location.href).toString(),
    cctv_offline: new URL('./assets/MARKER/COLOR_CCTV_OFFLINE.svg', window.location.href).toString(),
    vms_online: new URL('./assets/MARKER/COLOR_VMS_ONLINE.svg', window.location.href).toString(),
    vms_offline: new URL('./assets/MARKER/COLOR_VMS_OFFLINE.svg', window.location.href).toString(),
    gate_online: new URL('./assets/MARKER/COLOR_GATE_ONLINE.svg', window.location.href).toString(),
    gate_offline: new URL('./assets/MARKER/COLOR_GATE_OFFLINE.svg', window.location.href).toString(),
  };

  const getCameraCoordinates = (camera) => {
    if (!camera || typeof camera !== 'object') {
      return null;
    }
    const lat = Number(camera.lat ?? camera.cctv_lat ?? camera.latitude);
    const lng = Number(camera.lng ?? camera.cctv_lon ?? camera.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return null;
    }
    return { lat, lng };
  };

  const getCameraOperationalState = (camera) => {
    const status = String(camera && camera.status ? camera.status : '').toLowerCase();
    if (status === 'error' || status === 'offline') {
      return 'offline';
    }
    if (status === 'warning') {
      return 'warning';
    }
    if (typeof (camera && camera.is_online) === 'boolean') {
      return camera.is_online ? 'online' : 'offline';
    }
    return Number(camera && camera.is_active) === 1 ? 'online' : 'offline';
  };
  const getStandaloneAssetMarkerTone = (camera) => {
    const operationalState = getCameraOperationalState(camera);
    if (operationalState === 'offline') {
      return 'danger';
    }
    if (operationalState === 'warning') {
      return 'warning';
    }
    return 'success';
  };
  const shouldDisplayStandaloneAssetStatus = (camera) =>
    isMarkerStatusFilterEnabled(getMarkerFilterKeyFromTone(getStandaloneAssetMarkerTone(camera)));
  const shouldDisplayGateStatus = (gate) =>
    isMarkerStatusFilterEnabled(getMarkerFilterKeyFromTone(getGateMarkerTone(gate)));

  const getCctvMarkerIconUrl = (camera) => {
    const assetType = String(camera && camera.asset_type ? camera.asset_type : 'cctv').toLowerCase();
    const operationalState = getCameraOperationalState(camera);
    if (assetType === 'vms') {
      return operationalState === 'online' ? COLOR_ICON_URLS.vms_online : COLOR_ICON_URLS.vms_offline;
    }
    if (assetType === 'cctv') {
      return operationalState === 'online' ? COLOR_ICON_URLS.cctv_online : COLOR_ICON_URLS.cctv_offline;
    }
    return operationalState === 'online' ? ONLINE_MARKER_URL : OFFLINE_MARKER_URL;
  };

  const getCctvMarkerScaledSize = (camera) =>
    String(camera && camera.id) === String(state.cctvSelectedCameraId) ? 44 : 36;

  const svgTextToDataUri = (value) =>
    `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(String(value || '').trim())}`;
  const MARKER_ENTRANCE_DELAY_MS = 800;
  const MARKER_ENTRANCE_DURATION_MS = 420;
  let cctvClusterAnimationNonce = 0;

  const buildAnimatedMapMarkerIconDataUrl = (iconUrl, size) => {
    const safeUrl = escapeHtml(String(iconUrl || ''));
    const safeSize = Math.max(20, Number(size) || 36);
    const center = safeSize / 2;
    return svgTextToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="${safeSize}" height="${safeSize}" viewBox="0 0 ${safeSize} ${safeSize}">
        <image
          href="${safeUrl}"
          x="0"
          y="0"
          width="${safeSize}"
          height="${safeSize}"
          preserveAspectRatio="xMidYMid meet"
          transform-origin="${center} ${center}"
        >
          <animateTransform
            attributeName="transform"
            type="scale"
            begin="${MARKER_ENTRANCE_DELAY_MS}ms"
            dur="${MARKER_ENTRANCE_DURATION_MS}ms"
            calcMode="spline"
            keyTimes="0;0.68;1"
            keySplines="0.22 1 0.36 1;0.22 1 0.36 1"
            values="0.72 0.72;1.08 1.08;1 1"
            fill="freeze"
          />
        </image>
      </svg>
    `);
  };

  const WEATHER_FALLBACK_ICON_URL = svgTextToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
      <circle cx="17" cy="18" r="8" fill="#FFC83D" />
      <path d="M31 33H15c-4.418 0-8-3.134-8-7s3.582-7 8-7c.803 0 1.58.104 2.314.298C18.82 14.936 22.96 12 27.75 12 33.963 12 39 16.925 39 23c4.418 0 8 3.134 8 7s-3.582 7-8 7Z" fill="#ffffff"/>
    </svg>
  `);
  const WEATHER_METEOCON_FALLBACK_SLUG = 'cloudy';
  const WEATHER_METEOCON_STYLE_BASE_URLS = {
    flat: new URL('./assets/weather/meteocons/flat/', window.location.href).href,
    fill: new URL('./assets/weather/meteocons/fill/', window.location.href).href,
  };
  const DEFAULT_WEATHER_ICON_APPEARANCE = {
    weatherIconStyle: 'flat',
    weatherIconMonochromeColor: '#FFFFFF',
    weatherIconAnimated: true,
  };
  const weatherIconSvgTextCache = new Map();
  const weatherIconSourceCache = new Map();
  const weatherIconSourcePromiseCache = new Map();
  let weatherIconRefreshTimer = 0;

  const formatWeatherTemperature = (value) => {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? `${Math.round(numeric)}\u00B0` : '-';
  };

  const normalizeWeatherIconToken = (value) =>
    String(value || '')
      .trim()
      .toLowerCase()
      .replace(/[_/]+/g, '-')
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/-{2,}/g, '-')
      .replace(/^-+|-+$/g, '');

  const normalizeHexColor = (value, fallback = '#FFFFFF') => {
    const raw = String(value || '').trim();
    const normalized = raw.startsWith('#') ? raw.slice(1) : raw;
    return /^[0-9a-fA-F]{6}$/.test(normalized) ? `#${normalized.toUpperCase()}` : fallback;
  };

  const normalizeWeatherIconAppearance = (value) => {
    const source = value && typeof value === 'object' ? value : {};
    const requestedStyle = String(source.weatherIconStyle || DEFAULT_WEATHER_ICON_APPEARANCE.weatherIconStyle)
      .trim()
      .toLowerCase();
    return {
      weatherIconStyle: ['flat', 'fill', 'monochrome', 'monochrome-color'].includes(requestedStyle)
        ? requestedStyle
        : DEFAULT_WEATHER_ICON_APPEARANCE.weatherIconStyle,
      weatherIconMonochromeColor: normalizeHexColor(
        source.weatherIconMonochromeColor,
        DEFAULT_WEATHER_ICON_APPEARANCE.weatherIconMonochromeColor
      ),
      weatherIconAnimated:
        source.weatherIconAnimated === undefined
          ? DEFAULT_WEATHER_ICON_APPEARANCE.weatherIconAnimated
          : Boolean(source.weatherIconAnimated),
    };
  };

  const getWeatherIconAppearance = () =>
    normalizeWeatherIconAppearance(window.__APP_APPEARANCE || DEFAULT_WEATHER_ICON_APPEARANCE);

  const getWeatherSourceStyle = (appearance) => {
    const normalized = normalizeWeatherIconAppearance(appearance);
    return normalized.weatherIconStyle === 'fill' ? 'fill' : 'flat';
  };

  const buildWeatherMeteoconSourceUrl = (weather, appearance) =>
    `${WEATHER_METEOCON_STYLE_BASE_URLS[getWeatherSourceStyle(appearance)]}${resolveWeatherMeteoconSlug(weather)}.svg`;

  const stripWeatherSvgAnimation = (svgText) =>
    String(svgText || '')
      .replace(/<animateTransform[^>]*\/>/gi, '')
      .replace(/<animateTransform[\s\S]*?<\/animateTransform>/gi, '')
      .replace(/<animateMotion[^>]*\/>/gi, '')
      .replace(/<animateMotion[\s\S]*?<\/animateMotion>/gi, '')
      .replace(/<animate[^>]*\/>/gi, '')
      .replace(/<animate[\s\S]*?<\/animate>/gi, '')
      .replace(/<set[^>]*\/>/gi, '')
      .replace(/<set[\s\S]*?<\/set>/gi, '')
      .replace(/\s(begin|dur|repeatCount|keyTimes|keySplines|calcMode|values|keyPoints)="[^"]*"/gi, '');

  const recolorWeatherSvg = (svgText, color) => {
    const normalizedColor = normalizeHexColor(color, '#FFFFFF');
    return String(svgText || '')
      .replace(/fill="(?!none)[^"]*"/gi, `fill="${normalizedColor}"`)
      .replace(/stroke="(?!none)[^"]*"/gi, `stroke="${normalizedColor}"`);
  };

  const scheduleWeatherIconRefresh = () => {
    if (weatherIconRefreshTimer) {
      return;
    }
    weatherIconRefreshTimer = window.setTimeout(() => {
      weatherIconRefreshTimer = 0;
      if (!state.isActive) {
        return;
      }
      syncWeatherMarkers();
      renderIncidentList();
    }, 30);
  };

  const isNightWeatherCondition = (weather) => {
    const token = normalizeWeatherIconToken(
      `${weather && weather.condition_key ? weather.condition_key : ''} ${weather && weather.weather_label ? weather.weather_label : ''}`
    );
    return /(^|-)night($|-)|malam|dini|moon/.test(token);
  };

  const resolveWeatherMeteoconSlug = (weather) => {
    const rawToken = normalizeWeatherIconToken(
      `${weather && weather.condition_key ? weather.condition_key : ''} ${weather && weather.weather_label ? weather.weather_label : ''}`
    );
    if (!rawToken) {
      return WEATHER_METEOCON_FALLBACK_SLUG;
    }

    const isNight = isNightWeatherCondition(weather);
    const baseToken = rawToken
      .replace(/(^|-)weather($|-)/g, '$1')
      .replace(/(^|-)conditions?($|-)/g, '$1')
      .replace(/(^|-)condition($|-)/g, '$1')
      .replace(/-{2,}/g, '-')
      .replace(/^-+|-+$/g, '');
    const asDayNight = (daySlug, nightSlug = '') => (isNight ? nightSlug || daySlug : daySlug);

    if (/thunder|lightning|storm|badai|petir/.test(baseToken)) {
      if (/heavy|lebat|extreme|severe/.test(baseToken)) {
        if (/rain|shower|hujan/.test(baseToken)) {
          return asDayNight('extreme-thunderstorms-day-rain', 'extreme-thunderstorms-night-rain');
        }
        return asDayNight('extreme-thunderstorms-day', 'extreme-thunderstorms-night');
      }
      if (/rain|shower|hujan/.test(baseToken)) {
        return asDayNight('thunderstorms-day-rain', 'thunderstorms-night-rain');
      }
      return asDayNight('thunderstorms-day', 'thunderstorms-night');
    }

    if (/hurricane|typhoon|cyclone/.test(baseToken)) {
      return 'hurricane';
    }
    if (/tornado|puting-beliung/.test(baseToken)) {
      return 'tornado';
    }
    if (/hail|hujan-es/.test(baseToken)) {
      return /heavy|lebat|extreme|severe/.test(baseToken)
        ? asDayNight('extreme-day-hail', 'extreme-night-hail')
        : 'hail';
    }
    if (/sleet/.test(baseToken)) {
      return /heavy|lebat|extreme|severe/.test(baseToken)
        ? asDayNight('extreme-day-sleet', 'extreme-night-sleet')
        : 'sleet';
    }
    if (/snow|salju/.test(baseToken)) {
      return /heavy|lebat|extreme|severe/.test(baseToken)
        ? asDayNight('extreme-day-snow', 'extreme-night-snow')
        : 'snow';
    }
    if (/drizzle|gerimis/.test(baseToken)) {
      return /heavy|lebat|extreme|severe/.test(baseToken)
        ? asDayNight('extreme-day-drizzle', 'extreme-night-drizzle')
        : 'drizzle';
    }
    if (/rain|shower|hujan/.test(baseToken)) {
      return /heavy|lebat|extreme|severe/.test(baseToken)
        ? asDayNight('extreme-day-rain', 'extreme-night-rain')
        : 'rain';
    }
    if (/fog|mist|kabut/.test(baseToken)) {
      return /heavy|lebat|extreme|severe/.test(baseToken)
        ? asDayNight('extreme-day-fog', 'extreme-night-fog')
        : asDayNight('fog-day', 'fog-night');
    }
    if (/haze|berkabut/.test(baseToken)) {
      return /heavy|lebat|extreme|severe/.test(baseToken)
        ? asDayNight('extreme-day-haze', 'extreme-night-haze')
        : asDayNight('haze-day', 'haze-night');
    }
    if (/smoke|asap/.test(baseToken)) {
      return /heavy|lebat|extreme|severe/.test(baseToken)
        ? asDayNight('extreme-day-smoke', 'extreme-night-smoke')
        : 'smoke';
    }
    if (/dust|debu/.test(baseToken)) {
      return asDayNight('dust-day', 'dust-night');
    }
    if (/mostly-clear|cerah-berawan/.test(baseToken)) {
      return asDayNight('mostly-clear-day', 'mostly-clear-night');
    }
    if (/partly-cloudy|partly-cloud|sebagian-berawan/.test(baseToken)) {
      return asDayNight('partly-cloudy-day', 'partly-cloudy-night');
    }
    if (/overcast|mendung|mendung-tebal/.test(baseToken)) {
      return /day|night/.test(baseToken) ? asDayNight('overcast-day', 'overcast-night') : 'overcast';
    }
    if (/cloudy|berawan/.test(baseToken)) {
      return 'cloudy';
    }
    if (/clear|sunny|cerah/.test(baseToken)) {
      return asDayNight('clear-day', 'clear-night');
    }
    return WEATHER_METEOCON_FALLBACK_SLUG;
  };

  const getWeatherMeteoconIconUrl = (weather) => buildWeatherMeteoconSourceUrl(weather, getWeatherIconAppearance());

  const getWeatherMarkerIconUrl = (weather) => getWeatherMeteoconIconUrl(weather);

  const getWeatherMarkerIconFallbackUrl = (weather) =>
    String(weather && weather.icon_url ? weather.icon_url : '').trim() || WEATHER_FALLBACK_ICON_URL;

  const loadRawWeatherSvgText = async (weather, appearance) => {
    const sourceUrl = buildWeatherMeteoconSourceUrl(weather, appearance);
    if (weatherIconSvgTextCache.has(sourceUrl)) {
      return weatherIconSvgTextCache.get(sourceUrl);
    }
    const response = await window.fetch(sourceUrl);
    if (!response.ok) {
      throw new Error(`Failed to load weather icon: ${sourceUrl}`);
    }
    const svgText = await response.text();
    weatherIconSvgTextCache.set(sourceUrl, svgText);
    return svgText;
  };

  const buildWeatherSvgCacheKey = (weather, appearance) => {
    const normalizedAppearance = normalizeWeatherIconAppearance(appearance);
    return JSON.stringify({
      slug: resolveWeatherMeteoconSlug(weather),
      sourceStyle: getWeatherSourceStyle(normalizedAppearance),
      style: normalizedAppearance.weatherIconStyle,
      color: normalizedAppearance.weatherIconMonochromeColor,
      animated: normalizedAppearance.weatherIconAnimated,
    });
  };

  const buildWeatherIconSource = async (weather) => {
    const appearance = getWeatherIconAppearance();
    const cacheKey = buildWeatherSvgCacheKey(weather, appearance);
    if (weatherIconSourceCache.has(cacheKey)) {
      return weatherIconSourceCache.get(cacheKey);
    }
    if (
      (appearance.weatherIconStyle === 'flat' || appearance.weatherIconStyle === 'fill') &&
      appearance.weatherIconAnimated
    ) {
      const directSource = buildWeatherMeteoconSourceUrl(weather, appearance);
      weatherIconSourceCache.set(cacheKey, directSource);
      return directSource;
    }
    if (!weatherIconSourcePromiseCache.has(cacheKey)) {
      weatherIconSourcePromiseCache.set(
        cacheKey,
        (async () => {
          let svgText = await loadRawWeatherSvgText(weather, appearance);
          if (!appearance.weatherIconAnimated) {
            svgText = stripWeatherSvgAnimation(svgText);
          }
          if (
            appearance.weatherIconStyle === 'monochrome' ||
            appearance.weatherIconStyle === 'monochrome-color'
          ) {
            const monoColor =
              appearance.weatherIconStyle === 'monochrome-color'
                ? appearance.weatherIconMonochromeColor
                : '#FFFFFF';
            svgText = recolorWeatherSvg(svgText, monoColor);
          }
          const source = svgTextToDataUri(svgText);
          weatherIconSourceCache.set(cacheKey, source);
          weatherIconSourcePromiseCache.delete(cacheKey);
          scheduleWeatherIconRefresh();
          return source;
        })().catch((error) => {
          weatherIconSourcePromiseCache.delete(cacheKey);
          throw error;
        })
      );
    }
    return weatherIconSourcePromiseCache.get(cacheKey);
  };

  const getWeatherIconSourceSync = (weather) => {
    const appearance = getWeatherIconAppearance();
    if (
      (appearance.weatherIconStyle === 'flat' || appearance.weatherIconStyle === 'fill') &&
      appearance.weatherIconAnimated
    ) {
      return buildWeatherMeteoconSourceUrl(weather, appearance);
    }
    const cacheKey = buildWeatherSvgCacheKey(weather, appearance);
    if (!weatherIconSourceCache.has(cacheKey)) {
      void buildWeatherIconSource(weather).catch(() => {});
      return '';
    }
    return weatherIconSourceCache.get(cacheKey) || '';
  };

  const formatWeatherPercent = (value) => {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? `${Math.round(numeric)}%` : '-';
  };

  const formatWeatherWind = (value) => {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? `${Math.round(numeric)} km/j` : '-';
  };

  const getWeatherMetricIcon = (kind) => {
    if (kind === 'wind') {
      return `
        <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
          <path d="M2 6.25h7.2c1.2 0 1.95-.62 1.95-1.53 0-.88-.67-1.47-1.52-1.47-.82 0-1.38.42-1.64 1.18" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
          <path d="M2 9.1h9.55c1.35 0 2.2.72 2.2 1.78 0 1.03-.8 1.77-1.87 1.77-.93 0-1.58-.48-1.87-1.32" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
        </svg>
      `;
    }
    if (kind === 'humidity') {
      return `
        <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
          <path d="M8 2.05c1.38 2.1 3.7 4.66 3.7 7.13A3.7 3.7 0 0 1 8 12.88a3.7 3.7 0 0 1-3.7-3.7c0-2.47 2.32-5.03 3.7-7.13Z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>
        </svg>
      `;
    }
    return '';
  };

  const formatWeatherTemperatureDisplay = (value) => {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? `${Math.round(numeric)}\u00B0C` : '-';
  };

  const getWeatherContextLine = (weather) =>
    [weather && weather.segment_name ? weather.segment_name : '', weather && weather.corridor_name ? weather.corridor_name : '']
      .filter(Boolean)
      .join(' \u2022 ') || '-';

  const loadOnlyIconDataUris = () => {
    if (state.onlyIconLoaderPromise) {
      return state.onlyIconLoaderPromise;
    }
    state.onlyIconLoaderPromise = Promise.all(
      Object.entries(ONLY_ICON_URLS).map(async ([key, url]) => {
        try {
          const response = await fetch(url);
          if (!response || !response.ok) {
            return;
          }
          state.onlyIconDataUris[key] = svgTextToDataUri(await response.text());
        } catch (error) {
          debugLog('loadOnlyIconDataUris:error', {
            key,
            message: error && error.message ? error.message : String(error),
          });
        }
      })
    );
    return state.onlyIconLoaderPromise;
  };

  const getGateMarkerIconUrl = (gate) =>
    getGateMarkerTone(gate) === 'success' ? COLOR_ICON_URLS.gate_online : ONLY_ICON_URLS.gate;

  const getClusterTone = (onlineCount, offlineCount) => {
    const total = Math.max(1, Number(onlineCount || 0) + Number(offlineCount || 0));
    const onlineRatio = Number(onlineCount || 0) / total;
    const offlineRatio = Number(offlineCount || 0) / total;
    if (onlineRatio >= 0.7) {
      return {
        fill: '#2EC4B6',
        border: 'rgba(46,196,182,0.28)',
        glow: 'rgba(46,196,182,0.3)',
      };
    }
    if (offlineRatio >= 0.7) {
      return {
        fill: '#E63946',
        border: 'rgba(230,57,70,0.32)',
        glow: 'rgba(230,57,70,0.4)',
      };
    }
    return {
      fill: '#FFB703',
      border: 'rgba(255,183,3,0.3)',
      glow: 'rgba(255,183,3,0.3)',
    };
  };

  const buildSosClusterSvgDataUrl = (count, onlineCount, offlineCount) => {
    const size = count >= 100 ? 62 : count >= 10 ? 56 : 52;
    const tone = getClusterTone(onlineCount, offlineCount);
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <defs>
          <filter id="clusterGlow" x="-45%" y="-45%" width="190%" height="190%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
        </defs>
        <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 6}" fill="${tone.glow}" filter="url(#clusterGlow)" />
        <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 4}" fill="${tone.fill}" stroke="${tone.border}" stroke-width="4" />
        <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 10}" fill="rgba(255,255,255,0.08)" />
      </svg>
    `.trim();
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  };

  const getAssetClusterTypeMeta = (assetType) => {
    const normalized = String(assetType || '').toLowerCase();
    if (normalized === 'cctv') {
      return {
        label: 'CCTV',
        accent: '#56c1ff',
        iconKey: 'cctv',
        iconType: 'cctv-marker',
      };
    }
    if (normalized === 'vms') {
      return {
        label: 'VMS',
        accent: '#a9ff24',
        iconKey: 'vms',
        icon: `
          <g fill="none" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <rect x="16" y="12" width="20" height="13" rx="2.5" />
            <path d="M20 17h12M20 21h8M22 25v5M30 25v5M19 30h14" />
          </g>
        `,
      };
    }
    return {
      label: 'ASSET',
      accent: '#ffcf66',
      iconKey: 'mixed',
      icon: `
        <g fill="none" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M26 12l10 5.5v11L26 34l-10-5.5v-11z" />
          <path d="M26 12v11M16 17.5l10 5.5 10-5.5M26 23v11" />
        </g>
      `,
    };
  };

  const getActiveAppFontFamilyStack = () => {
    const fromWindow = String(window.__APP_FONT_FAMILY_STACK || '').trim();
    if (fromWindow) {
      return fromWindow;
    }
    const fromCss = String(
      window.getComputedStyle(document.documentElement).getPropertyValue('--font-family-base') || ''
    ).trim();
    if (fromCss) {
      return fromCss;
    }
    return "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
  };

  const buildClusterCountBadgeSvg = (count, size) => {
    const displayCount = String(Number(count || 0));
    const badgeWidth = Math.min(size - 2, Math.max(18, displayCount.length * 7 + 10));
    const badgeHeight = 18;
    const fontSize = displayCount.length >= 5 ? 7 : displayCount.length >= 4 ? 8 : displayCount.length >= 3 ? 9 : 10;
    const x = Math.max(1, size - badgeWidth - 1);
    const y = 1;
    return `
      <rect x="${x}" y="${y}" width="${badgeWidth}" height="${badgeHeight}" rx="${badgeHeight / 2}" fill="#E63946" />
      <text x="${x + badgeWidth / 2}" y="${y + 12.5}" text-anchor="middle" fill="#ffffff" font-family="${getActiveAppFontFamilyStack()}" font-size="${fontSize}" font-weight="800">${displayCount}</text>
    `;
  };

  const buildCctvClusterMarkerSvg = (size, gradientId = 'cctvMarkerGradient') => {
    const scale = size * 0.00084;
    const offset = (size / 2) - (364 * scale);
    return `
      <g transform="translate(${offset.toFixed(2)} ${offset.toFixed(2)}) scale(${scale.toFixed(5)})">
        <circle cx="364" cy="364" r="340" fill="url(#${gradientId})" stroke="#ffffff" stroke-width="38" />
        <path fill="#ffffff" d="M247.6 233.8 515.6 359.5 536.8 389.1 478.2 514.1 181.4 374.9z" />
        <path fill="#ffffff" d="M533 409.9 553.4 419.5 519.6 491.3 499.3 481.8z" />
        <path fill="#ffffff" d="M577.5 421.1 600.9 432.1 559.7 519.8 533.1 507.3 527.7 493.7 560.2 424.3z" />
        <path fill="#ffffff" d="M282.9 222.8 498 323.7 490.4 339.8 275.4 238.9z" />
        <path fill="#ffffff" d="M313.7 444.1 337.3 455.1 313.8 505.2 290.2 494.1z" />
        <path fill="#ffffff" d="M230.4 497.7 250 486.7 260.1 504.5 305.6 478.4 313.8 505.2 272.9 527.4 286 550.7 266.4 561.7z" />
      </g>
    `;
  };

  const buildOnlyIconClusterSvg = (typeMeta, size, gradientId) => {
    const dataUri = state.onlyIconDataUris[typeMeta.iconKey];
    if (!dataUri) {
      return typeMeta.iconType === 'cctv-marker' ? buildCctvClusterMarkerSvg(size, gradientId) : typeMeta.icon;
    }
    const imageRatio = typeMeta.iconKey === 'cctv' || typeMeta.iconKey === 'mixed' ? 0.54 : 0.64;
    const imageSize = Math.round(size * imageRatio);
    const imageOffset = Math.round((size - imageSize) / 2);
    return `<image href="${escapeHtml(dataUri)}" x="${imageOffset}" y="${imageOffset}" width="${imageSize}" height="${imageSize}" preserveAspectRatio="xMidYMid meet" />`;
  };

  const buildCenterCountClusterSvg = (count, size) => {
    const displayCount = String(Number(count || 0));
    const fontSize = 16;
    return `
      <text
        x="${size / 2}"
        y="${size / 2 + 5.5}"
        text-anchor="middle"
        fill="#ffffff"
        font-family="${getActiveAppFontFamilyStack()}"
        font-size="${fontSize}"
        font-weight="800"
      >${displayCount}</text>
    `;
  };

  const buildTypedAssetClusterSvgDataUrl = ({
    assetType,
    count,
    onlineCount,
    warningCount,
    offlineCount,
    animationKey = '',
  }) => {
    const size = count >= 100 ? 62 : count >= 10 ? 56 : 52;
    const typeMeta = getAssetClusterTypeMeta(assetType);
    const useCenterCountOnly = String(assetType || '').toLowerCase() === 'mixed';
    const svgToken = String(animationKey || `cluster-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
    const clusterGlowId = `clusterGlow-${svgToken}`;
    const cctvMarkerGradientId = `cctvMarkerGradient-${svgToken}`;
    const tone = {
      fill: '#41E75D',
      border: 'rgba(255,255,255,0.24)',
      glow: 'rgba(65,231,93,0.48)',
    };
    const centerGraphic = useCenterCountOnly
      ? buildCenterCountClusterSvg(count, size)
      : buildOnlyIconClusterSvg(typeMeta, size, cctvMarkerGradientId);
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <defs>
          <filter id="${clusterGlowId}" x="-65%" y="-65%" width="230%" height="230%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
          <linearGradient id="${cctvMarkerGradientId}" x1="0" y1="0" x2="728" y2="728" gradientUnits="userSpaceOnUse">
            <stop offset="0" stop-color="#ff3131" />
            <stop offset="1" stop-color="#ff914d" />
          </linearGradient>
        </defs>
        <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 6}" fill="${tone.glow}" filter="url(#${clusterGlowId})" />
        <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 4}" fill="${tone.fill}" stroke="${tone.border}" stroke-width="4" />
        <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 10}" fill="rgba(255,255,255,0.08)" />
        <g transform-origin="${size / 2} ${size / 2}">
          <animateTransform
            attributeName="transform"
            type="scale"
            begin="${MARKER_ENTRANCE_DELAY_MS}ms"
            dur="${MARKER_ENTRANCE_DURATION_MS}ms"
            calcMode="spline"
            keyTimes="0;0.68;1"
            keySplines="0.22 1 0.36 1;0.22 1 0.36 1"
            values="0.7 0.7;1.08 1.08;1 1"
            fill="freeze"
          />
          ${centerGraphic}
        </g>
      </svg>
    `.trim();
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  };

  const getClusterAssetType = (clusterMarkers) => {
    const typeCounts = {
      cctv: 0,
      vms: 0,
      other: 0,
    };
    (Array.isArray(clusterMarkers) ? clusterMarkers : []).forEach((clusterMarker) => {
      const entry = state.cctvMarkers.find((item) => item && item.marker === clusterMarker);
      const assetType = String(entry && entry.camera && entry.camera.asset_type ? entry.camera.asset_type : '').toLowerCase();
      if (assetType === 'cctv') {
        typeCounts.cctv += 1;
      } else if (assetType === 'vms') {
        typeCounts.vms += 1;
      } else {
        typeCounts.other += 1;
      }
    });
    const activeTypes = [typeCounts.cctv, typeCounts.vms, typeCounts.other].filter((value) => value > 0).length;
    if (activeTypes !== 1) {
      return 'mixed';
    }
    if (typeCounts.cctv > 0) {
      return 'cctv';
    }
    if (typeCounts.vms > 0) {
      return 'vms';
    }
    return 'mixed';
  };

  const getClusterAssetTypeFromEntries = (entries) => {
    const typeCounts = {
      cctv: 0,
      vms: 0,
      other: 0,
    };
    (Array.isArray(entries) ? entries : []).forEach((entry) => {
      const assetType = String(entry && entry.camera && entry.camera.asset_type ? entry.camera.asset_type : '').toLowerCase();
      if (assetType === 'cctv') {
        typeCounts.cctv += 1;
      } else if (assetType === 'vms') {
        typeCounts.vms += 1;
      } else {
        typeCounts.other += 1;
      }
    });
    const activeTypes = [typeCounts.cctv, typeCounts.vms, typeCounts.other].filter((value) => value > 0).length;
    if (activeTypes !== 1) {
      return 'mixed';
    }
    if (typeCounts.cctv > 0) {
      return 'cctv';
    }
    if (typeCounts.vms > 0) {
      return 'vms';
    }
    return 'mixed';
  };

  const getCctvClusterIconUrl = (assetType) => {
    const normalized = String(assetType || '').toLowerCase();
    if (normalized === 'vms') {
      return ONLY_ICON_URLS.vms;
    }
    if (normalized === 'cctv') {
      return ONLY_ICON_URLS.cctv;
    }
    return '';
  };

  const buildManualCctvClusters = (entries, projection, clusterRadius = 42) => {
    if (!projection || !Array.isArray(entries) || !entries.length) {
      return {
        singles: Array.isArray(entries) ? entries.slice() : [],
        clusters: [],
      };
    }
    const points = entries
      .map((entry) => {
        const latLng = entry && (entry.originalPosition || (entry.marker && entry.marker.getPosition && entry.marker.getPosition()));
        const pixel = latLng ? projection.fromLatLngToDivPixel(latLng) : null;
        return pixel ? { entry, pixel, latLng } : null;
      })
      .filter(Boolean);
    const visited = new Set();
    const singles = [];
    const clusters = [];
    const radiusSq = clusterRadius * clusterRadius;
    for (let index = 0; index < points.length; index += 1) {
      if (visited.has(index)) {
        continue;
      }
      visited.add(index);
      const queue = [index];
      const group = [];
      while (queue.length) {
        const currentIndex = queue.shift();
        const currentPoint = points[currentIndex];
        if (!currentPoint) {
          continue;
        }
        group.push(currentPoint);
        for (let nextIndex = 0; nextIndex < points.length; nextIndex += 1) {
          if (visited.has(nextIndex)) {
            continue;
          }
          const nextPoint = points[nextIndex];
          if (!nextPoint) {
            continue;
          }
          const dx = currentPoint.pixel.x - nextPoint.pixel.x;
          const dy = currentPoint.pixel.y - nextPoint.pixel.y;
          if (dx * dx + dy * dy <= radiusSq) {
            visited.add(nextIndex);
            queue.push(nextIndex);
          }
        }
      }
      if (group.length <= 1) {
        singles.push(group[0].entry);
        continue;
      }
      const avgX = group.reduce((sum, item) => sum + item.pixel.x, 0) / group.length;
      const avgY = group.reduce((sum, item) => sum + item.pixel.y, 0) / group.length;
      const centerLatLng =
        projection.fromDivPixelToLatLng(new window.google.maps.Point(avgX, avgY)) || group[0].latLng;
      const clusterEntries = group.map((item) => item.entry);
      const hasDanger = clusterEntries.some((item) => getStandaloneAssetMarkerTone(item && item.camera) === 'danger');
      const hasWarning = clusterEntries.some((item) => getStandaloneAssetMarkerTone(item && item.camera) === 'warning');
      clusters.push({
        key: clusterEntries
          .map((entry) => String(entry && entry.camera && entry.camera.id ? entry.camera.id : ''))
          .filter(Boolean)
          .sort()
          .join(','),
        count: clusterEntries.length,
        entries: clusterEntries,
        position: centerLatLng,
        assetType: getClusterAssetTypeFromEntries(clusterEntries),
        status: hasDanger ? 'error' : hasWarning ? 'warning' : 'normal',
      });
    }
    return { singles, clusters };
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

  const stopSosFocusAnimation = () => {
    if (state.ui.sosFocusAnimationFrame) {
      window.cancelAnimationFrame(state.ui.sosFocusAnimationFrame);
      state.ui.sosFocusAnimationFrame = 0;
    }
  };

  const animateSosFocusOnMap = (latLng, targetZoom) => {
    if (!state.map || !latLng) {
      return;
    }
    stopSosFocusAnimation();
    const map = state.map;
    const initialCenter = typeof map.getCenter === 'function' ? map.getCenter() : null;
    const startCenter = initialCenter
      ? { lat: Number(initialCenter.lat()), lng: Number(initialCenter.lng()) }
      : { lat: Number(latLng.lat), lng: Number(latLng.lng) };
    const endCenter = { lat: Number(latLng.lat), lng: Number(latLng.lng) };
    const startZoom = Number(map.getZoom() || targetZoom || MAP_ZOOM_SOS);
    const endZoom = Math.max(startZoom, Number(targetZoom || MAP_ZOOM_SOS));
    const startedAt = performance.now();
    const easeOut = (value) => 1 - Math.pow(1 - value, 3);

    const frame = (timestamp) => {
      const progress = Math.min(1, (timestamp - startedAt) / SOS_FOCUS_ANIMATION_MS);
      const eased = easeOut(progress);
      map.setCenter({
        lat: startCenter.lat + ((endCenter.lat - startCenter.lat) * eased),
        lng: startCenter.lng + ((endCenter.lng - startCenter.lng) * eased),
      });
      if (endZoom > startZoom) {
        map.setZoom(startZoom + ((endZoom - startZoom) * eased));
      }
      if (progress < 1) {
        state.ui.sosFocusAnimationFrame = window.requestAnimationFrame(frame);
        return;
      }
      map.setCenter(endCenter);
      if (endZoom > startZoom) {
        map.setZoom(endZoom);
      }
      state.ui.sosFocusAnimationFrame = 0;
    };

    state.ui.sosFocusAnimationFrame = window.requestAnimationFrame(frame);
  };

  const destroySosCctvModalStream = () => {
    if (state.cctvModalController && typeof state.cctvModalController.destroy === 'function') {
      state.cctvModalController.destroy();
    }
    state.cctvModalController = null;
  };

  const attachSosCctvModalStream = (camera) => {
    destroySosCctvModalStream();
    if (!sosCctvModalVideoEl || !sosCctvModalStreamEmptyEl) {
      return;
    }
    const streamUrl = String(camera && (camera.stream_play_url || camera.hls_url || camera.stream_url) || '').trim();
    if (!streamUrl) {
      sosCctvModalVideoEl.classList.add('hidden');
      sosCctvModalStreamEmptyEl.classList.remove('hidden');
      sosCctvModalStreamEmptyEl.textContent = 'Stream CCTV belum tersedia.';
      return;
    }

    sosCctvModalVideoEl.classList.remove('hidden');
    sosCctvModalStreamEmptyEl.classList.add('hidden');

    const videoEl = sosCctvModalVideoEl;
    let destroyed = false;
    let activeHls = null;
    const withCacheBuster = (value) => {
      try {
        const parsed = new URL(value, window.location.href);
        parsed.searchParams.set('_ts', String(Date.now()));
        return parsed.toString();
      } catch (_) {
        return value;
      }
    };

    const cleanup = () => {
      destroyed = true;
      videoEl.pause();
      videoEl.removeAttribute('src');
      videoEl.load();
      if (activeHls) {
        activeHls.destroy();
        activeHls = null;
      }
    };

    if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
      videoEl.src = withCacheBuster(streamUrl);
      videoEl.load();
      videoEl.play().catch(() => {
        if (!destroyed) {
          sosCctvModalStreamEmptyEl.classList.remove('hidden');
          sosCctvModalStreamEmptyEl.textContent = 'Stream CCTV gagal diputar.';
        }
      });
      state.cctvModalController = { destroy: cleanup };
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      activeHls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90,
      });
      activeHls.on(window.Hls.Events.MEDIA_ATTACHED, () => {
        if (destroyed) {
          return;
        }
        activeHls.loadSource(withCacheBuster(streamUrl));
      });
      activeHls.on(window.Hls.Events.MANIFEST_PARSED, () => {
        if (destroyed) {
          return;
        }
        videoEl.play().catch(() => {
          if (!destroyed) {
            sosCctvModalStreamEmptyEl.classList.remove('hidden');
            sosCctvModalStreamEmptyEl.textContent = 'Stream CCTV gagal diputar.';
          }
        });
      });
      activeHls.on(window.Hls.Events.ERROR, () => {
        if (destroyed) {
          return;
        }
        sosCctvModalStreamEmptyEl.classList.remove('hidden');
        sosCctvModalStreamEmptyEl.textContent = 'Stream CCTV gagal diputar.';
      });
      activeHls.attachMedia(videoEl);
      state.cctvModalController = { destroy: cleanup };
      return;
    }

    sosCctvModalVideoEl.classList.add('hidden');
    sosCctvModalStreamEmptyEl.classList.remove('hidden');
    sosCctvModalStreamEmptyEl.textContent = 'Browser player tidak mendukung stream CCTV ini.';
    state.cctvModalController = { destroy: cleanup };
  };

  const getStatusMeta = (status) => {
    const normalized = Number(status);
    if (normalized === 0) {
      return { tone: 'danger', label: 'SOS Baru', markerClass: 'is-critical' };
    }
    if (normalized === 1) {
      return { tone: 'warning', label: 'On Progress', markerClass: 'is-dispatched' };
    }
    return { tone: 'neutral', label: 'Completed', markerClass: 'is-completed' };
  };

  const getSmartResponseStatusMeta = (status) => {
    const normalized = String(status || '').trim().toUpperCase();
    if (normalized === 'TRACKING_STARTED') {
      return { tone: 'neutral', label: 'Tracking Dimulai' };
    }
    if (normalized === 'NEARBY_CANDIDATE') {
      return { tone: 'info', label: 'Kandidat Ditemukan' };
    }
    if (normalized === 'LIKELY_HEADING_TO_SOS') {
      return { tone: 'warning', label: 'Menuju SOS' };
    }
    if (normalized === 'ARRIVED_PENDING_CONFIRMATION') {
      return { tone: 'danger', label: 'Tiba, Menunggu Konfirmasi' };
    }
    if (normalized === 'ARRIVAL_CONFIRMED') {
      return { tone: 'success', label: 'Kedatangan Terkonfirmasi' };
    }
    if (normalized === 'TICKET_COMPLETED') {
      return { tone: 'success', label: 'Ticket Selesai' };
    }
    return { tone: 'neutral', label: 'Tracking' };
  };

  const formatDistanceMetersSmartResponse = (value) => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) {
      return '-';
    }
    if (numeric < 1000) {
      return `${Math.round(numeric)} m`;
    }
    return `${(numeric / 1000).toFixed(numeric >= 10000 ? 1 : 2)} km`;
  };

  const formatConfidenceScore = (value) => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) {
      return '-';
    }
    return `${Math.round(numeric)}%`;
  };

  const formatSmartResponseEventLabel = (eventType) => {
    const normalized = String(eventType || '').trim().toUpperCase();
    if (normalized === 'TRACKING_STARTED') return 'Tracking dimulai';
    if (normalized === 'VEHICLE_CANDIDATE_DETECTED') return 'Kandidat vehicle terdeteksi';
    if (normalized === 'VEHICLE_LIKELY_HEADING') return 'Vehicle kemungkinan menuju SOS';
    if (normalized === 'VEHICLE_ARRIVED_PENDING') return 'Vehicle tiba, menunggu konfirmasi';
    if (normalized === 'VEHICLE_ARRIVAL_CONFIRMED') return 'Kedatangan vehicle dikonfirmasi';
    if (normalized === 'TICKET_COMPLETED') return 'Ticket selesai';
    return normalized || '-';
  };

  const getAlertName = (alert) => {
    const user = alert && alert.user ? alert.user : {};
    const toTitleCase = (value) =>
      String(value || '')
        .trim()
        .toLowerCase()
        .replace(/\b([a-z])/g, (match) => match.toUpperCase());
    const name = `${toTitleCase(user.first_name)} ${toTitleCase(user.last_name)}`.trim();
    return name || `User ${alert.user_id || '-'}`;
  };

  const formatElapsedSince = (value) => {
    const timestamp = new Date(value || '').getTime();
    if (!Number.isFinite(timestamp)) {
      return '\u23F1 -';
    }
    const diffMs = Math.max(0, Date.now() - timestamp);
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) {
      return '\u23F1 Baru saja';
    }
    if (minutes < 60) {
      return `\u23F1 ${minutes} m yang lalu`;
    }
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `\u23F1 ${hours} j yang lalu`;
    }
    const days = Math.floor(hours / 24);
    return `\u23F1 ${days} h yang lalu`;
  };

  const getSosMarkerLabelPayload = (alert) => {
    if (!(alert && alert.latLng)) {
      return null;
    }
    const reporterName = String(getAlertName(alert) || `User ${alert.user_id || '-'}`).toUpperCase();
    const dispatched =
      Boolean(alert.ticket && (alert.ticket.dispatched_at || Number(alert.status) === 1));
    return {
      key: `sos:${alert.sos_id}`,
      latLng: alert.latLng,
      className: 'selected-map-label selected-map-label--sos',
      html:
        `<div class="selected-map-label__line">` +
        `<strong>${escapeHtml('SOS')}</strong>` +
        `<span class="selected-map-label__sep">&bull;</span>` +
        `<span>${escapeHtml(String(formatElapsedSince(alert.created_at)).toUpperCase())}</span>` +
        (dispatched
          ? `<span class="selected-map-label__sep">&bull;</span><span class="selected-map-label__status-inline">DISPATCHED</span>`
          : '') +
        `</div>` +
        `<div class="selected-map-label__line selected-map-label__line--sub">${escapeHtml(reporterName)}</div>`,
    };
  };

  const getGateMarkerLabelPayload = (gate) => {
    if (!(gate && gate.latLng && state.gateAlerts.visible && shouldDisplayGateStatus(gate))) {
      return null;
    }
    const gateLabel = `GT ${String(gate.gate_name || gate.gate_code || `Gate ${gate.gate_id}`).trim()}`.toUpperCase();
    return {
      key: `gate:${gate.gate_id}`,
      latLng: gate.latLng,
      label: gateLabel,
    };
  };

  const getAssetMarkerLabelPayload = (asset, latLngOverride = null) => {
    if (
      !(
        asset &&
        asset.latLng &&
        isStandaloneAssetTypeVisible(asset) &&
        shouldDisplayStandaloneAssetStatus(asset)
      )
    ) {
      return null;
    }
    return {
      key: `asset:${makeAssetKey(asset.asset_type, asset.id)}`,
      latLng: latLngOverride || asset.latLng,
      label: asset.title || asset.asset_name || asset.cctv_name || asset.asset_code || `Asset ${asset.id}`,
    };
  };

  const resolveMarkerLabelRef = (ref) => {
    if (!(ref && ref.kind && ref.id)) {
      return null;
    }
    if (ref.kind === 'sos') {
      return getSosMarkerLabelPayload(state.alerts.get(Number(ref.id)) || null);
    }
    if (ref.kind === 'gate') {
      return getGateMarkerLabelPayload(state.gateAlerts.items.get(String(ref.id)) || null);
    }
    if (ref.kind === 'asset') {
      return getAssetMarkerLabelPayload(
        state.standaloneAssets.items.get(String(ref.id)) || null,
        ref.latLng || null
      );
    }
    if (ref.kind === 'vehicle') {
      return getVehicleMarkerLabelPayload(state.vehicles.items.get(Number(ref.id)) || null);
    }
    return null;
  };

  const getSelectedEntityMarkerLabelPayload = () => {
    if (state.ui.selectedEntityType === 'sos' && state.selectedSosId) {
      return getSosMarkerLabelPayload(state.alerts.get(Number(state.selectedSosId)) || null);
    }
    if (state.ui.selectedEntityType === 'gate' && state.gateAlerts.selectedGateId) {
      return getGateMarkerLabelPayload(state.gateAlerts.items.get(String(state.gateAlerts.selectedGateId)) || null);
    }
    if (state.ui.selectedEntityType === 'asset' && state.standaloneAssets.selectedAssetKey) {
      return getAssetMarkerLabelPayload(
        state.standaloneAssets.items.get(String(state.standaloneAssets.selectedAssetKey)) || null,
        state.standaloneAssets.selectedLabelLatLng || null
      );
    }
    if (state.ui.selectedEntityType === 'vehicle' && state.vehicles.selectedVehicleId) {
      return getVehicleMarkerLabelPayload(state.vehicles.items.get(Number(state.vehicles.selectedVehicleId)) || null);
    }
    return null;
  };

  const ensureDefaultSosSelection = () => {
    if (state.selectedSosId) {
      return;
    }
    if (
      state.ui.selectedEntityType &&
      state.ui.selectedEntityType !== 'sos' &&
      state.ui.selectedEntityId
    ) {
      return;
    }
    const candidate = getVisibleAlerts()
      .filter((alert) => alert && alert.latLng)
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))[0];
    if (!candidate) {
      return;
    }
    selectAlert(candidate.sos_id, false, { removeNotification: false, forceFocus: false, lockLabel: false });
  };

  const getLatLng = (item) => {
    const lat = Number(item && item.latitude);
    const lng = Number(item && item.longitude);
    return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
  };

  const normalizeTicket = (ticket) => {
    if (!ticket || typeof ticket !== 'object') {
      return null;
    }
    const hasTicketFields =
      Object.prototype.hasOwnProperty.call(ticket, 'ticket_no') ||
      Object.prototype.hasOwnProperty.call(ticket, 'ticket_status') ||
      Object.prototype.hasOwnProperty.call(ticket, 'dispatched_at') ||
      Object.prototype.hasOwnProperty.call(ticket, 'completion_note') ||
      Object.prototype.hasOwnProperty.call(ticket, 'completed_at');
    if (!hasTicketFields) {
      return null;
    }
    const sosId = Number(ticket.sos_id || (ticket.sos && ticket.sos.sos_id));
    if (!Number.isFinite(sosId)) {
      return null;
    }
    return {
      ...ticket,
      sos_id: sosId,
      ticket_no: String(ticket.ticket_no || '').trim(),
      ticket_status: Number(ticket.ticket_status ?? ticket.status ?? 1),
      response_summary: normalizeSmartResponseSummary(ticket.response_summary || null, ticket),
    };
  };

  const normalizeSmartResponseSummary = (summary, fallback = null) => {
    const source = summary && typeof summary === 'object' ? summary : fallback && typeof fallback === 'object' ? fallback : null;
    if (!source) {
      return null;
    }
    const ticketNo = String(source.ticket_no || (fallback && fallback.ticket_no) || '').trim();
    const sosId = Number(source.sos_id || (fallback && fallback.sos_id));
    if (!ticketNo && !Number.isFinite(sosId)) {
      return null;
    }
    return {
      ticket_no: ticketNo,
      sos_id: Number.isFinite(sosId) ? sosId : null,
      branch_id: Number.isFinite(Number(source.branch_id)) ? Number(source.branch_id) : null,
      response_status: String(source.response_status || source.current_response_status || 'TRACKING_STARTED').trim(),
      primary_vehicle_id: Number.isFinite(Number(source.primary_vehicle_id)) ? Number(source.primary_vehicle_id) : null,
      primary_vehicle_label: String(source.primary_vehicle_label || '').trim() || null,
      confidence_score: Number.isFinite(Number(source.confidence_score)) ? Number(source.confidence_score) : null,
      distance_meters: Number.isFinite(Number(source.distance_meters)) ? Number(source.distance_meters) : null,
      first_candidate_detected_at: String(source.first_candidate_detected_at || '').trim() || null,
      arrival_confirmed_at: String(source.arrival_confirmed_at || '').trim() || null,
      updated_at: String(source.updated_at || '').trim() || null,
    };
  };

  const normalizeSmartResponseCandidate = (candidate) => {
    if (!candidate || typeof candidate !== 'object') {
      return null;
    }
    const vehicleId = Number(candidate.vehicle_id);
    if (!Number.isFinite(vehicleId)) {
      return null;
    }
    return {
      vehicle_id: vehicleId,
      vehicle_label: String(candidate.vehicle_label || `Vehicle ${vehicleId}`).trim(),
      branch_id: Number.isFinite(Number(candidate.branch_id)) ? Number(candidate.branch_id) : null,
      detection_status: String(candidate.detection_status || 'TRACKING_STARTED').trim(),
      confidence_score: Number.isFinite(Number(candidate.confidence_score)) ? Number(candidate.confidence_score) : null,
      distance_meters: Number.isFinite(Number(candidate.distance_meters)) ? Number(candidate.distance_meters) : null,
      previous_distance_meters:
        Number.isFinite(Number(candidate.previous_distance_meters)) ? Number(candidate.previous_distance_meters) : null,
      speed_kmh: Number.isFinite(Number(candidate.speed_kmh)) ? Number(candidate.speed_kmh) : null,
      movement_bearing: Number.isFinite(Number(candidate.movement_bearing)) ? Number(candidate.movement_bearing) : null,
      bearing_to_sos: Number.isFinite(Number(candidate.bearing_to_sos)) ? Number(candidate.bearing_to_sos) : null,
      angle_diff: Number.isFinite(Number(candidate.angle_diff)) ? Number(candidate.angle_diff) : null,
      detected_at: String(candidate.detected_at || '').trim() || null,
      last_evaluated_at: String(candidate.last_evaluated_at || '').trim() || null,
      arrived_pending_at: String(candidate.arrived_pending_at || '').trim() || null,
      arrival_confirmed_at: String(candidate.arrival_confirmed_at || '').trim() || null,
      is_primary: Boolean(candidate.is_primary),
    };
  };

  const normalizeSmartResponseTimelineItem = (item) => {
    if (!item || typeof item !== 'object') {
      return null;
    }
    const id = Number(item.id);
    if (!Number.isFinite(id)) {
      return null;
    }
    const metadata = item.metadata && typeof item.metadata === 'object' ? item.metadata : null;
    const metadataMetrics =
      metadata && metadata.metrics && typeof metadata.metrics === 'object'
        ? metadata.metrics
        : null;
    const readMetric = (key) => {
      if (Number.isFinite(Number(item[key]))) {
        return Number(item[key]);
      }
      if (metadataMetrics && Number.isFinite(Number(metadataMetrics[key]))) {
        return Number(metadataMetrics[key]);
      }
      if (metadata && Number.isFinite(Number(metadata[key]))) {
        return Number(metadata[key]);
      }
      return null;
    };
    return {
      id,
      ticket_no: String(item.ticket_no || (metadata && metadata.ticket_no) || '').trim(),
      sos_id:
        Number.isFinite(Number(item.sos_id))
          ? Number(item.sos_id)
          : Number.isFinite(Number(metadata && metadata.sos_id))
            ? Number(metadata.sos_id)
            : null,
      branch_id:
        Number.isFinite(Number(item.branch_id))
          ? Number(item.branch_id)
          : Number.isFinite(Number(metadata && metadata.branch_id))
            ? Number(metadata.branch_id)
            : null,
      event_type: String(item.event_type || '').trim(),
      event_at: String(item.event_at || '').trim() || null,
      actor_user_id: Number.isFinite(Number(item.actor_user_id)) ? Number(item.actor_user_id) : null,
      vehicle_id:
        Number.isFinite(Number(item.vehicle_id))
          ? Number(item.vehicle_id)
          : Number.isFinite(Number(metadata && metadata.vehicle_id))
            ? Number(metadata.vehicle_id)
            : null,
      vehicle_label: String(item.vehicle_label || (metadata && metadata.vehicle_label) || '').trim() || null,
      response_status: String(item.response_status || (metadata && metadata.response_status) || '').trim() || null,
      source: String(item.source || (metadata && metadata.source) || '').trim() || null,
      gps_time: String(item.gps_time || (metadata && metadata.gps_time) || '').trim() || null,
      distance_meters: readMetric('distance_meters'),
      previous_distance_meters: readMetric('previous_distance_meters'),
      speed_kmh: readMetric('speed_kmh'),
      movement_bearing: readMetric('movement_bearing'),
      bearing_to_sos: readMetric('bearing_to_sos'),
      angle_diff: readMetric('angle_diff'),
      confidence_score: readMetric('confidence_score'),
      extra: metadata && metadata.extra && typeof metadata.extra === 'object' ? metadata.extra : null,
      metadata,
    };
  };

  const normalizeSmartResponseDetail = (payload) => {
    const source =
      unwrapCollection(payload).find((item) => item && typeof item === 'object') ||
      unwrapSingle(payload);
    if (!source || typeof source !== 'object') {
      return null;
    }
    const ticket = normalizeTicket(source);
    const sos = normalizeAlert(source);
    const responseSummary = normalizeSmartResponseSummary(source.response_summary || null, source);
    const vehicleCandidates = toArray(source.vehicle_candidates)
      .map(normalizeSmartResponseCandidate)
      .filter(Boolean);
    return {
      ...source,
      ticket,
      sos,
      response_summary: responseSummary,
      vehicle_candidates: vehicleCandidates,
    };
  };

  const normalizeAlert = (item) => {
    const source = item && item.sos ? item.sos : item;
    if (!source || typeof source !== 'object') {
      return null;
    }
    const sosId = Number(source.sos_id || item.sos_id);
    if (!Number.isFinite(sosId)) {
      return null;
    }
    return {
      ...source,
      sos_id: sosId,
      status: Number(source.status ?? item.status ?? 0),
      user: source.user || item.user || null,
      nearest_cameras: toArray(source.nearest_cameras || item.nearest_cameras).slice(0, 3),
      latLng: getLatLng(source),
      ticket: normalizeTicket(item.ticket || null),
    };
  };

  const ensureMapsLoaded = () => {
    debugLog('ensureMapsLoaded:start', {
      hasGoogle: Boolean(window.google && window.google.maps),
    });
    if (window.google && window.google.maps) {
      return Promise.resolve(window.google.maps);
    }
    if (typeof window.__HKTV_LOAD_GOOGLE_MAPS__ === 'function') {
      debugLog('ensureMapsLoaded:shared-loader');
      return window.__HKTV_LOAD_GOOGLE_MAPS__();
    }
    if (state.mapsLoaderPromise) {
      return state.mapsLoaderPromise;
    }
    const existingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
    if (existingScript) {
      debugLog('ensureMapsLoaded:waiting-existing-script');
      state.mapsLoaderPromise = new Promise((resolve, reject) => {
        const startedAt = Date.now();
        const timer = window.setInterval(() => {
          if (window.google && window.google.maps) {
            clearInterval(timer);
            resolve(window.google.maps);
            return;
          }
          if (Date.now() - startedAt > 15000) {
            clearInterval(timer);
            reject(new Error('Google Maps sudah diminta tetapi belum siap.'));
          }
        }, 150);
      });
      return state.mapsLoaderPromise;
    }
    state.mapsLoaderPromise = new Promise((resolve, reject) => {
      const callbackName = `__sosMapReady${Date.now()}`;
      window[callbackName] = () => {
        delete window[callbackName];
        resolve(window.google.maps);
      };
      const script = document.createElement('script');
      const mapIdQuery = hasGoogleMapsMapId()
        ? `&map_ids=${encodeURIComponent(getGoogleMapsMapId())}`
        : '';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(GOOGLE_MAPS_API_KEY)}&loading=async&v=beta${mapIdQuery}&callback=${callbackName}`;
      script.async = true;
      script.onerror = () => {
        delete window[callbackName];
        debugLog('ensureMapsLoaded:error');
        reject(new Error('Google Maps gagal dimuat untuk mode SOS.'));
      };
      document.head.appendChild(script);
    });
    return state.mapsLoaderPromise;
  };

  const ensureMapsCoreLibraryLoaded = async () => {
    await ensureMapsLoaded();
    if (state.mapsCoreLibraryPromise) {
      return state.mapsCoreLibraryPromise;
    }
    if (!(window.google && window.google.maps && typeof window.google.maps.importLibrary === 'function')) {
      state.mapsCoreLibraryPromise = Promise.resolve(null);
      return state.mapsCoreLibraryPromise;
    }
    state.mapsCoreLibraryPromise = window.google.maps.importLibrary('core').catch(() => null);
    return state.mapsCoreLibraryPromise;
  };

  const loadMarkerClustererLibrary = () => {
    if (window.markerClusterer && window.markerClusterer.MarkerClusterer) {
      return Promise.resolve(window.markerClusterer);
    }
    if (typeof window.__HKTV_LOAD_MARKER_CLUSTERER__ === 'function') {
      return window.__HKTV_LOAD_MARKER_CLUSTERER__();
    }
    if (state.markerClustererLoaderPromise) {
      return state.markerClustererLoaderPromise;
    }
    state.markerClustererLoaderPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@googlemaps/markerclusterer/dist/index.min.js';
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
    return state.markerClustererLoaderPromise;
  };

  const getMarkerClass = () => {
    if (state.markerClass) {
      return state.markerClass;
    }
    state.markerClass = class SosPulseMarker extends window.google.maps.OverlayView {
      constructor({ map, alert, onSelect }) {
        super();
        this.map = map;
        this.alert = alert;
        this.onSelect = onSelect;
        this.element = null;
        this.setMap(map);
      }

      onAdd() {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'sos-map-marker';
        button.addEventListener('mouseenter', () => {
          setPreviewMarkerLabel(createMarkerLabelRef('sos', this.alert.sos_id));
        });
        button.addEventListener('mouseleave', () => {
          clearPreviewMarkerLabelIfUnlocked();
        });
        button.addEventListener('click', () => {
          state.cctvSuppressMapClickUntil = Date.now() + 250;
          this.onSelect(this.alert.sos_id);
        });
        this.element = button;
        this.getPanes().overlayMouseTarget.appendChild(button);
        this.draw();
      }

      draw() {
        if (!this.element || !this.alert.latLng) {
          return;
        }
        const pixel = this.getProjection().fromLatLngToDivPixel(
          new window.google.maps.LatLng(this.alert.latLng.lat, this.alert.latLng.lng)
        );
        if (!pixel) {
          return;
        }
        const statusMeta = getStatusMeta(this.alert.status);
        this.element.className = `sos-map-marker ${statusMeta.markerClass} ${
          this.alert.sos_id === state.selectedSosId ? 'is-selected' : ''
        }`;
        this.element.style.left = `${pixel.x}px`;
        this.element.style.top = `${pixel.y}px`;
        this.element.style.zIndex = String(
          getSosMarkerZIndex(this.alert.sos_id === state.selectedSosId ? 'selected' : 'default')
        );
        this.element.innerHTML =
          '<span class="sos-map-marker__pulse"></span><span class="sos-map-marker__dot"></span>';
      }

      onRemove() {
        if (this.element && this.element.parentNode) {
          this.element.parentNode.removeChild(this.element);
        }
        this.element = null;
      }

      update(alert) {
        this.alert = alert;
        this.draw();
      }
    };
    return state.markerClass;
  };

  const getGateMarkerTone = (gate) => {
    const status = String(gate && gate.status ? gate.status : 'normal').toLowerCase();
    if (status === 'error' || status === 'offline') {
      return 'danger';
    }
    if (status === 'warning') {
      return 'warning';
    }
    return 'success';
  };

  const getLayerStackZIndex = (stackOrder, options = {}) => {
    const networkVisible = Boolean(state.networkArcs && state.networkArcs.visible);
    const tiers = networkVisible
      ? { 1: 50, 2: 40, 3: 30, 4: 20, 5: 10, 6: 4 }
      : { 1: 1000, 2: 900, 3: 800, 4: 700, 5: 600, 6: 520 };
    const base = tiers[Number(stackOrder)] || (networkVisible ? 25 : 750);
    const selectedBoost = options.selected ? (networkVisible ? 4 : 20) : 0;
    const offset = Number.isFinite(Number(options.offset)) ? Number(options.offset) : 0;
    return base + selectedBoost + offset;
  };

  const getMapMarkerZIndex = (variant = 'default') => {
    if (variant === 'selected') return getLayerStackZIndex(3, { selected: true, offset: 2 });
    if (variant === 'cluster') return getLayerStackZIndex(3);
    if (variant === 'spiderfy') return getLayerStackZIndex(3, { selected: true, offset: 1 });
    if (variant === 'polyline') return Boolean(state.networkArcs && state.networkArcs.visible) ? 8 : 1;
    return getLayerStackZIndex(3, { offset: -5 });
  };
  const getSosMarkerZIndex = (variant = 'default') => {
    if (variant === 'selected') return getLayerStackZIndex(1, { selected: true, offset: 12 });
    return getLayerStackZIndex(1, { offset: 8 });
  };
  const getStandaloneAssetZIndex = (camera, isSelected = false) => {
    const tone = getStandaloneAssetMarkerTone(camera);
    const stackOrder = tone === 'danger' ? 4 : tone === 'warning' ? 5 : 6;
    return getLayerStackZIndex(stackOrder, { selected: isSelected, offset: isSelected ? 6 : 0 });
  };
  const getCctvClusterZIndex = (cluster) => {
    const tone = getAssetIssueTone(cluster && cluster.status ? cluster.status : 'normal');
    const stackOrder = tone === 'danger' ? 2 : tone === 'warning' ? 3 : 4;
    return getLayerStackZIndex(stackOrder, { offset: 1 });
  };

  const getGateMarkerZIndex = (gate, isSelected = false) => {
    const tone = getGateMarkerTone(gate);
    const stackOrder = tone === 'danger' ? 1 : tone === 'warning' ? 2 : 4;
    const offset = gate && gate.isCluster ? 0 : 2;
    return getLayerStackZIndex(stackOrder, { selected: isSelected, offset });
  };

  const getWeatherMarkerZIndex = (isExpanded = false) =>
    getLayerStackZIndex(5, { selected: isExpanded });
  const getVehicleMarkerZIndex = (isSelected = false) => {
    if (Boolean(state.networkArcs && state.networkArcs.visible)) {
      return isSelected ? 3 : 2;
    }
    return isSelected ? 488 : 476;
  };
  const isVehicleMarkerInteractive = () => true;

  const getVehicleMarkerClass = () => {
    if (state.vehicles.markerClass) {
      return state.vehicles.markerClass;
    }
    state.vehicles.markerClass = class VehicleMarker extends window.google.maps.OverlayView {
      constructor({ map, vehicle, onSelect }) {
        super();
        this.map = map;
        this.vehicle = vehicle;
        this.onSelect = onSelect;
        this.element = null;
        this.renderKey = '';
        this.position = vehicle && (vehicle.renderLatLng || vehicle.latLng) ? {
          lat: Number((vehicle.renderLatLng || vehicle.latLng).lat),
          lng: Number((vehicle.renderLatLng || vehicle.latLng).lng),
        } : null;
        this.zIndex = null;
        this.title = String(vehicle && vehicle.label ? vehicle.label : '').trim();
        this.isClickable = isVehicleMarkerInteractive(vehicle);
        this.setMap(map);
      }

      onAdd() {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'sos-map-marker vehicle-map-marker';
        button.addEventListener('mouseenter', () => {
          setPreviewMarkerLabel(
            createMarkerLabelRef('vehicle', this.vehicle.vehicle_id, {
              latLng: this.vehicle.renderLatLng || this.vehicle.latLng || null,
            })
          );
        });
        button.addEventListener('mouseleave', () => {
          clearPreviewMarkerLabelIfUnlocked();
        });
        button.addEventListener('click', () => {
          state.cctvSuppressMapClickUntil = Date.now() + 250;
          this.onSelect(this.vehicle.vehicle_id);
        });
        this.element = button;
        this.getPanes().overlayMouseTarget.appendChild(button);
        this.draw();
      }

      draw() {
        const position = this.position || (this.vehicle && (this.vehicle.renderLatLng || this.vehicle.latLng));
        if (!this.element || !position) {
          return;
        }
        const pixel = this.getProjection().fromLatLngToDivPixel(
          new window.google.maps.LatLng(Number(position.lat), Number(position.lng))
        );
        if (!pixel) {
          return;
        }
        const gpsStatus = String(this.vehicle.gps_status || 'offline').toLowerCase();
        const isSelected = Number(state.vehicles.selectedVehicleId) === Number(this.vehicle.vehicle_id);
        const isMoving = String(this.vehicle.movement_status || '').toLowerCase() === 'moving';
        const isInteractive = Boolean(this.isClickable);
        const iconUrl = this.vehicle.vehicle_type_icon_url || createVehicleFallbackIconDataUrl();
        const plateNumber =
          String(this.vehicle.vehicle_registration_plate || this.vehicle.license_plate || '').trim() || '-';
        this.element.className = `sos-map-marker vehicle-map-marker vehicle-map-marker--${gpsStatus} ${
          isMoving ? 'vehicle-map-marker--moving' : ''
        } ${isSelected ? 'is-selected' : ''}`;
        this.element.style.left = `${pixel.x}px`;
        this.element.style.top = `${pixel.y}px`;
        this.element.style.pointerEvents = 'none';
        this.element.style.cursor = 'default';
        this.element.style.zIndex = String(
          Number.isFinite(Number(this.zIndex)) ? Number(this.zIndex) : getVehicleMarkerZIndex(isSelected)
        );
        this.element.title = this.title || String(this.vehicle.label || `Kendaraan ${this.vehicle.vehicle_id}`).trim();
        const nextRenderKey = JSON.stringify({
          iconUrl,
          gpsStatus,
          isMoving,
          isSelected,
          isInteractive,
          plateNumber,
        });
        if (this.renderKey !== nextRenderKey) {
          this.renderKey = nextRenderKey;
          this.element.innerHTML = `
            <span class="sos-map-marker__pulse"></span>
            <span class="vehicle-map-marker__mini-popover" aria-hidden="true">
              <span class="vehicle-map-marker__mini-plate">${escapeHtml(plateNumber)}</span>
              <span class="vehicle-map-marker__mini-indicator ${escapeHtml(getVehicleGpsTone(this.vehicle))}"></span>
            </span>
            <span class="sos-map-marker__dot">
              <img class="vehicle-map-marker__icon" src="${escapeHtml(iconUrl)}" alt="" aria-hidden="true" />
            </span>
          `;
        }
      }

      onRemove() {
        if (this.element && this.element.parentNode) {
          this.element.parentNode.removeChild(this.element);
        }
        this.element = null;
      }

      update(vehicle) {
        this.vehicle = vehicle;
        this.position = vehicle && (vehicle.renderLatLng || vehicle.latLng) ? {
          lat: Number((vehicle.renderLatLng || vehicle.latLng).lat),
          lng: Number((vehicle.renderLatLng || vehicle.latLng).lng),
        } : this.position;
        this.isClickable = isVehicleMarkerInteractive(vehicle);
        this.title = String(vehicle && vehicle.label ? vehicle.label : this.title || '').trim();
        this.draw();
      }

      setPosition(latLng) {
        if (latLng && Number.isFinite(Number(latLng.lat)) && Number.isFinite(Number(latLng.lng))) {
          this.position = { lat: Number(latLng.lat), lng: Number(latLng.lng) };
          this.draw();
        }
      }

      setZIndex(zIndex) {
        this.zIndex = Number(zIndex);
        this.draw();
      }

      setTitle(title) {
        this.title = String(title || '').trim();
        this.draw();
      }

      setClickable(clickable) {
        this.isClickable = Boolean(clickable);
        this.draw();
      }

      setIcon(icon) {
        if (icon && icon.url) {
          this.vehicle = {
            ...(this.vehicle || {}),
            vehicle_type_icon_url: String(icon.url),
          };
          this.draw();
        }
      }
    };
    return state.vehicles.markerClass;
  };

  const getCctvClusterMarkerClass = () => {
    if (state.standaloneAssets.clusterMarkerClass) {
      return state.standaloneAssets.clusterMarkerClass;
    }
    state.standaloneAssets.clusterMarkerClass = class CctvClusterMarker extends window.google.maps.OverlayView {
      constructor({ map, cluster, onSelect }) {
        super();
        this.map = map;
        this.cluster = cluster;
        this.clusterKey = String(cluster && cluster.key ? cluster.key : '');
        this.onSelect = onSelect;
        this.element = null;
        this.isEntering = false;
        this.isDimmed = false;
        this.entranceTimer = 0;
        this.setMap(map);
      }

      onAdd() {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'sos-map-marker';
        button.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          this.onSelect(this.cluster, this);
        });
        this.element = button;
        const panes = this.getPanes();
        if (panes && panes.floatPane) {
          panes.floatPane.appendChild(button);
        } else if (panes && panes.overlayMouseTarget) {
          panes.overlayMouseTarget.appendChild(button);
        }
        this.isEntering = true;
        this.entranceTimer = window.setTimeout(() => {
          this.entranceTimer = 0;
          this.isEntering = false;
          this.draw();
        }, MARKER_ENTRANCE_DELAY_MS + MARKER_ENTRANCE_DURATION_MS + 180);
        this.draw();
      }

      draw() {
        if (!this.element || !this.cluster || !this.cluster.position) {
          return;
        }
        const pixel = this.getProjection().fromLatLngToDivPixel(this.cluster.position);
        if (!pixel) {
          return;
        }
        const assetType = String(this.cluster.assetType || 'mixed').toLowerCase();
        const tone = getAssetIssueTone(this.cluster && this.cluster.status ? this.cluster.status : 'normal');
        this.element.className = `sos-map-marker asset-map-marker asset-map-marker--${tone === 'danger' ? 'danger' : tone === 'warning' ? 'warning' : 'success'} asset-map-marker--cluster cctv-cluster-marker cctv-cluster-marker--${assetType} ${this.isEntering ? 'is-entering' : ''} ${this.isDimmed ? 'is-dimmed' : ''}`;
        this.element.style.left = `${pixel.x}px`;
        this.element.style.top = `${pixel.y}px`;
        this.element.style.pointerEvents = 'auto';
        this.element.style.cursor = 'pointer';
        this.element.style.zIndex = String(getCctvClusterZIndex(this.cluster));
        this.element.title = `${Number(this.cluster.count || 0)} asset`;
        this.element.innerHTML = assetType === 'mixed'
          ? `<span class="sos-map-marker__pulse"></span><span class="sos-map-marker__dot"><span class="asset-map-cluster__count">${escapeHtml(String(this.cluster.count || 0))}</span></span>`
          : `<span class="sos-map-marker__pulse"></span><span class="sos-map-marker__dot"><img src="${escapeHtml(getCctvClusterIconUrl(assetType))}" alt="" aria-hidden="true" /></span>`;
      }

      setDimmed(dimmed) {
        this.isDimmed = Boolean(dimmed);
        this.draw();
      }

      update(cluster, options = {}) {
        this.cluster = cluster;
        this.clusterKey = String(cluster && cluster.key ? cluster.key : '');
        if (options.animate) {
          this.isEntering = true;
          if (this.entranceTimer) {
            window.clearTimeout(this.entranceTimer);
          }
          this.entranceTimer = window.setTimeout(() => {
            this.entranceTimer = 0;
            this.isEntering = false;
            this.draw();
          }, MARKER_ENTRANCE_DELAY_MS + MARKER_ENTRANCE_DURATION_MS + 180);
        }
        this.draw();
      }

      onRemove() {
        if (this.entranceTimer) {
          window.clearTimeout(this.entranceTimer);
          this.entranceTimer = 0;
        }
        if (this.element && this.element.parentNode) {
          this.element.parentNode.removeChild(this.element);
        }
        this.element = null;
      }
    };
    return state.standaloneAssets.clusterMarkerClass;
  };
  const getGateMarkerClass = () => {
    if (state.gateAlerts.markerClass) {
      return state.gateAlerts.markerClass;
    }
    state.gateAlerts.markerClass = class GateAlertMarker extends window.google.maps.OverlayView {
      constructor({ map, gate, onSelect }) {
        super();
        this.map = map;
        this.gate = gate;
        this.onSelect = onSelect;
        this.element = null;
        this.isEntering = false;
        this.entranceTimer = 0;
        this.setMap(map);
      }

      onAdd() {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'sos-map-marker';
        button.addEventListener('mouseenter', () => {
          if (this.gate && !this.gate.isCluster) {
            setPreviewMarkerLabel(createMarkerLabelRef('gate', this.gate.gate_id));
          }
        });
        button.addEventListener('mouseleave', () => {
          clearPreviewMarkerLabelIfUnlocked();
        });
        button.addEventListener('click', () => {
          state.cctvSuppressMapClickUntil = Date.now() + 250;
          this.onSelect(this.gate);
        });
        this.element = button;
        this.getPanes().overlayMouseTarget.appendChild(button);
        this.isEntering = true;
        this.entranceTimer = window.setTimeout(() => {
          this.entranceTimer = 0;
          this.isEntering = false;
          this.draw();
        }, MARKER_ENTRANCE_DELAY_MS + MARKER_ENTRANCE_DURATION_MS + 180);
        this.draw();
      }

      draw() {
        if (!this.element || !this.gate || !this.gate.latLng) {
          return;
        }
        const pixel = this.getProjection().fromLatLngToDivPixel(
          new window.google.maps.LatLng(this.gate.latLng.lat, this.gate.latLng.lng)
        );
        if (!pixel) {
          return;
        }
        const tone = getGateMarkerTone(this.gate);
        const isNormalGate = tone === 'success';
        const isCluster = Boolean(this.gate.isCluster);
        const pulseEnabled = this.gate.pulse || tone !== 'success';
        this.element.className = `sos-map-marker asset-map-marker asset-map-marker--${tone} ${
          isNormalGate && !isCluster ? 'asset-map-marker--icon-only' : ''
        } ${
          pulseEnabled ? 'asset-map-marker--pulse' : ''
        } ${isCluster ? 'asset-map-marker--cluster' : ''} ${
          this.isEntering ? 'is-entering' : ''
        } ${
          String(state.gateAlerts.selectedGateId || '') === String(this.gate.gate_id) ? 'is-selected' : ''
        }`;
        this.element.style.left = `${pixel.x}px`;
        this.element.style.top = `${pixel.y}px`;
        this.element.style.zIndex = String(
          getGateMarkerZIndex(
            this.gate,
            String(state.gateAlerts.selectedGateId || '') === String(this.gate.gate_id)
          )
        );
        this.element.title = isCluster
          ? `${Number(this.gate.count || 0)} GATE ALERT`
          : `GT ${String(this.gate.gate_name || this.gate.gate_code || 'Gate Alert').trim()}`.toUpperCase();
        this.element.innerHTML = isCluster
          ? `<span class="sos-map-marker__pulse"></span><span class="sos-map-marker__dot"><span class="asset-map-cluster__count">${escapeHtml(String(this.gate.count || 0))}</span></span>`
          : isNormalGate
          ? `<img class="asset-map-marker__icon" src="${escapeHtml(getGateMarkerIconUrl(this.gate))}" alt="" aria-hidden="true" />`
          : `<span class="sos-map-marker__pulse"></span><span class="sos-map-marker__dot"><img src="${escapeHtml(getGateMarkerIconUrl(this.gate))}" alt="" aria-hidden="true" /></span>`;
      }

      onRemove() {
        if (this.entranceTimer) {
          window.clearTimeout(this.entranceTimer);
          this.entranceTimer = 0;
        }
        if (this.element && this.element.parentNode) {
          this.element.parentNode.removeChild(this.element);
        }
        this.element = null;
      }

      update(gate) {
        this.gate = gate;
        this.draw();
      }
    };
    return state.gateAlerts.markerClass;
  };

  const getWeatherMarkerClass = () => {
    if (state.weather.markerClass) {
      return state.weather.markerClass;
    }
    state.weather.markerClass = class WeatherMarker extends window.google.maps.OverlayView {
      constructor({ map, weather, onSelect }) {
        super();
        this.map = map;
        this.weather = weather;
        this.onSelect = onSelect;
        this.element = null;
        this.renderKey = '';
        this.isEntering = false;
        this.entranceTimer = 0;
        this.setMap(map);
      }

      onAdd() {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'weather-map-marker';
        button.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          this.onSelect(this.weather.id);
        });
        this.element = button;
        this.getPanes().overlayMouseTarget.appendChild(button);
        this.isEntering = true;
        this.entranceTimer = window.setTimeout(() => {
          this.entranceTimer = 0;
          this.isEntering = false;
          this.draw();
        }, MARKER_ENTRANCE_DELAY_MS + MARKER_ENTRANCE_DURATION_MS + 180);
        this.draw();
      }

      draw() {
        if (!this.element || !this.weather || !this.weather.latLng) {
          return;
        }
        const pixel = this.getProjection().fromLatLngToDivPixel(
          new window.google.maps.LatLng(this.weather.latLng.lat, this.weather.latLng.lng)
        );
        if (!pixel) {
          return;
        }
        const isExpanded = isWeatherMarkerExpanded(this.weather.id);
        const isStale = Boolean(this.weather.is_stale);
        this.element.className = `weather-map-marker ${this.isEntering ? 'is-entering' : ''} ${isExpanded ? 'is-expanded' : ''} ${isStale ? 'is-stale' : ''}`;
        this.element.style.left = `${pixel.x}px`;
        this.element.style.top = `${pixel.y}px`;
        this.element.style.zIndex = String(getWeatherMarkerZIndex(isExpanded));
        this.element.title = String(this.weather.point_name || this.weather.segment_name || 'Weather').toUpperCase();
        const weatherLabel = String(this.weather.weather_label || 'Cuaca').trim();
        const pointName = String(this.weather.point_name || this.weather.segment_name || this.weather.corridor_name || 'Lokasi').trim().toUpperCase();
        const iconSource = escapeHtml(getWeatherIconSourceSync(this.weather) || getWeatherMarkerIconUrl(this.weather));
        const fallbackIconUrl = escapeHtml(getWeatherMarkerIconFallbackUrl(this.weather));
        const staleBadge = isStale ? '<span class="weather-map-marker__badge">Data lama</span>' : '';
        const renderKey = JSON.stringify({
          isExpanded,
          isStale,
          weatherLabel,
          pointName,
          iconKey: iconSource,
          temperature: formatWeatherTemperatureDisplay(this.weather.temperature_c),
        });
        if (this.renderKey !== renderKey) {
          this.renderKey = renderKey;
          this.element.innerHTML = `
              <span class="weather-map-marker__pin" aria-hidden="true">
                <span class="weather-map-marker__icon-wrap">
                  <img class="weather-map-marker__icon" src="${iconSource}" alt="" aria-hidden="true" data-fallback-src="${fallbackIconUrl}" />
                </span>
              </span>
            <span class="weather-map-marker__bubble" aria-hidden="${isExpanded ? 'false' : 'true'}">
              <span class="weather-map-marker__summary">${escapeHtml(weatherLabel)} &bull; ${escapeHtml(formatWeatherTemperatureDisplay(this.weather.temperature_c))}</span>
              <strong class="weather-map-marker__location">${escapeHtml(pointName)}</strong>
              ${staleBadge}
            </span>
          `;
          const iconEl = this.element.querySelector('.weather-map-marker__icon');
          if (iconEl) {
            iconEl.addEventListener(
              'error',
              () => {
                iconEl.src = iconEl.getAttribute('data-fallback-src') || WEATHER_FALLBACK_ICON_URL;
              },
              { once: true }
            );
          }
        }
      }

      onRemove() {
        if (this.entranceTimer) {
          window.clearTimeout(this.entranceTimer);
          this.entranceTimer = 0;
        }
        if (this.element && this.element.parentNode) {
          this.element.parentNode.removeChild(this.element);
        }
        this.element = null;
      }

      update(weather) {
        this.weather = weather;
        this.draw();
      }
    };
    return state.weather.markerClass;
  };

  const applyMapTheme = (preset) => {
    const normalized = MAP_THEME_PRESETS[preset] !== undefined ? preset : 'dark-ops';
    state.mapContext.themePreset = normalized;
    if (state.map && isVectorRenderingActive() && window.google && window.google.maps && window.google.maps.ColorScheme) {
      const colorScheme =
        normalized === 'dark-ops'
          ? window.google.maps.ColorScheme.DARK
          : normalized === 'default'
            ? window.google.maps.ColorScheme.FOLLOW_SYSTEM
            : window.google.maps.ColorScheme.LIGHT;
      state.map.setOptions({ colorScheme });
      syncMapThemeControlState();
      renderMapCameraDebug();
      return;
    }
    if (state.map) {
      state.map.setOptions({ styles: MAP_THEME_PRESETS[normalized] });
    }
    renderMapCameraDebug();
  };

  const isVectorRenderingActive = () => {
    if (!(state.map && window.google && window.google.maps && window.google.maps.RenderingType)) {
      return false;
    }
    try {
      return (
        typeof state.map.getRenderingType === 'function' &&
        state.map.getRenderingType() === window.google.maps.RenderingType.VECTOR
      );
    } catch (_) {
      return false;
    }
  };

  const logMapRuntimeCapabilities = () => {
    if (!(state.map && window.google && window.google.maps)) {
      return;
    }
    let renderingType = 'unknown';
    try {
      renderingType =
        typeof state.map.getRenderingType === 'function'
          ? String(state.map.getRenderingType() || 'unknown')
          : 'unavailable';
    } catch (_) {
      renderingType = 'error';
    }
    console.info('[asset-monitoring] map-runtime', {
      hasMapId: hasGoogleMapsMapId(),
      mapId: hasGoogleMapsMapId() ? getGoogleMapsMapId() : '',
      renderingType,
      isVector: isVectorRenderingActive(),
      hasCameraControlOption: true,
      tiltInteractionEnabled: true,
      mapsVersion: window.google.maps.version || 'unknown',
    });
  };

  const syncMapThemeControlState = () => {
    // Theme selector removed for production build.
  };

  const syncWeatherToggleState = () => {
    if (!sosWeatherToggleEl) {
      return;
    }
    sosWeatherToggleEl.checked = state.weather.visible;
    sosWeatherToggleEl.indeterminate = false;
    sosWeatherToggleEl.disabled = false;
    if (sosWeatherBubbleToggleEl) {
      sosWeatherBubbleToggleEl.checked = Boolean(state.weather.expandAllBubbles);
      sosWeatherBubbleToggleEl.indeterminate = false;
      sosWeatherBubbleToggleEl.disabled = !state.weather.visible;
    }
  };

  const syncWeatherControlButtonState = () => {
    if (!weatherControlBtn) {
      return;
    }
    weatherControlBtn.classList.toggle('is-active', Boolean(state.weather.visible));
    weatherControlBtn.setAttribute(
      'aria-expanded',
      weatherControlPopup && !weatherControlPopup.classList.contains('hidden') ? 'true' : 'false'
    );
  };

  const syncBranchControlButtonState = () => {
    if (!sosBranchControlBtn) {
      return;
    }
    sosBranchControlBtn.setAttribute(
      'aria-expanded',
      sosBranchControlPopup && !sosBranchControlPopup.classList.contains('hidden') ? 'true' : 'false'
    );
  };

  const getActiveMarkerFilterCount = () =>
    ['normal', 'warning', 'error'].filter((key) => Boolean(state.markerStatusFilters[key])).length;

  const syncAssetFilterButtonState = () => {
    if (!assetFilterBtn) {
      return;
    }
    const activeCount = getActiveMarkerFilterCount();
    assetFilterBtn.textContent = activeCount === 3 ? 'Filter' : `Filter ${activeCount}/3`;
    assetFilterBtn.setAttribute('aria-expanded', assetFilterPopup && !assetFilterPopup.classList.contains('hidden') ? 'true' : 'false');
  };

  const syncFoControlButtonState = () => {
    if (!foControlBtn) {
      return;
    }
    foControlBtn.classList.toggle('is-active', Boolean(state.networkArcs.visible));
    foControlBtn.setAttribute(
      'aria-expanded',
      foControlPopup && !foControlPopup.classList.contains('hidden') ? 'true' : 'false'
    );
  };

  const setToolbarMenuPanelVisible = (visible) => {
    if (!toolbarMenuPanelEl) {
      return;
    }
    toolbarMenuPanelEl.classList.toggle('hidden', !visible);
    if (toolbarMenuBtnEl) {
      toolbarMenuBtnEl.setAttribute('aria-expanded', visible ? 'true' : 'false');
    }
  };

  const setAssetFilterPopupVisible = (visible) => {
    if (!assetFilterPopup) {
      return;
    }
    if (visible && typeof window.__HKTV_SET_PROFILE_MENU_VISIBLE__ === 'function') {
      window.__HKTV_SET_PROFILE_MENU_VISIBLE__(false);
    }
    assetFilterPopup.classList.toggle('hidden', !visible);
    syncAssetFilterButtonState();
  };

  const setFoControlPopupVisible = (visible) => {
    if (!foControlPopup) {
      return;
    }
    if (visible && typeof window.__HKTV_SET_PROFILE_MENU_VISIBLE__ === 'function') {
      window.__HKTV_SET_PROFILE_MENU_VISIBLE__(false);
    }
    foControlPopup.classList.toggle('hidden', !visible);
    syncFoControlButtonState();
  };

  const setWeatherControlPopupVisible = (visible) => {
    if (!weatherControlPopup) {
      return;
    }
    if (visible && typeof window.__HKTV_SET_PROFILE_MENU_VISIBLE__ === 'function') {
      window.__HKTV_SET_PROFILE_MENU_VISIBLE__(false);
    }
    weatherControlPopup.classList.toggle('hidden', !visible);
    syncWeatherControlButtonState();
  };

  const setBranchControlPopupVisible = (visible) => {
    if (!sosBranchControlPopup) {
      return;
    }
    if (visible && typeof window.__HKTV_SET_PROFILE_MENU_VISIBLE__ === 'function') {
      window.__HKTV_SET_PROFILE_MENU_VISIBLE__(false);
    }
    sosBranchControlPopup.classList.toggle('hidden', !visible);
    syncBranchControlButtonState();
  };

  const createMarkerLabelRef = (kind, id, options = {}) => ({
    kind: String(kind || ''),
    id: id == null ? null : String(id),
    latLng: options.latLng || null,
  });

  const setPreviewMarkerLabel = (ref) => {
    if (state.ui.lockedMarkerLabel) {
      return;
    }
    state.ui.previewMarkerLabel = ref || null;
    syncSelectedMarkerLabelOverlay();
  };

  const setLockedMarkerLabel = (ref) => {
    state.ui.lockedMarkerLabel = ref || null;
    state.ui.previewMarkerLabel = null;
    syncSelectedMarkerLabelOverlay();
  };

  const clearMarkerLabelState = (options = {}) => {
    const preserveSosLocked = options.preserveSosLocked !== false;
    if (preserveSosLocked && state.ui.selectedEntityType === 'sos' && state.selectedSosId) {
      state.ui.lockedMarkerLabel = createMarkerLabelRef('sos', state.selectedSosId);
      state.ui.previewMarkerLabel = null;
      syncSelectedMarkerLabelOverlay();
      return;
    }
    state.ui.lockedMarkerLabel = null;
    state.ui.previewMarkerLabel = null;
    syncSelectedMarkerLabelOverlay();
  };

  const clearPreviewMarkerLabelIfUnlocked = () => {
    if (state.ui.lockedMarkerLabel || !state.ui.previewMarkerLabel) {
      return;
    }
    state.ui.previewMarkerLabel = null;
    syncSelectedMarkerLabelOverlay();
  };

  const renderMapCameraModeControls = () => {
    if (sosMapNormalBtn) {
      sosMapNormalBtn.classList.toggle('is-active', state.mapContext.cameraMode !== 'tilt');
    }
    if (sosMapTiltBtn) {
      sosMapTiltBtn.classList.toggle('is-active', state.mapContext.cameraMode === 'tilt');
    }
  };

  const formatCameraNumber = (value) => {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? String(Math.round(numeric * 10) / 10) : '-';
  };

  const renderMapCameraDebug = () => {
    if (!mapCameraDebugEl) {
      return;
    }
    mapCameraDebugEl.classList.toggle('hidden', !state.ui.mapCameraDebugVisible);
    if (!state.ui.mapCameraDebugVisible) {
      mapCameraDebugEl.innerHTML = '';
      return;
    }
    const renderType =
      state.map && typeof state.map.getRenderingType === 'function'
        ? String(state.map.getRenderingType() || 'UNKNOWN')
        : 'UNKNOWN';
    const zoom =
      state.map && typeof state.map.getZoom === 'function'
        ? formatCameraNumber(state.map.getZoom())
        : '-';
    const tilt =
      state.map && typeof state.map.getTilt === 'function'
        ? formatCameraNumber(state.map.getTilt())
        : '-';
    const heading =
      state.map && typeof state.map.getHeading === 'function'
        ? formatCameraNumber(state.map.getHeading() || 0)
        : formatCameraNumber(state.mapContext.cameraHeading || 0);
    mapCameraDebugEl.innerHTML = [
      `<div class="map-camera-debug__row"><span>Zoom</span><strong>${escapeHtml(zoom)}</strong></div>`,
      `<div class="map-camera-debug__row"><span>Tilt</span><strong>${escapeHtml(tilt)}</strong></div>`,
      `<div class="map-camera-debug__row"><span>Heading</span><strong>${escapeHtml(heading)}</strong></div>`,
      `<div class="map-camera-debug__row"><span>Mode</span><strong>${escapeHtml(String(state.mapContext.cameraMode || '').toUpperCase())}</strong></div>`,
      `<div class="map-camera-debug__row"><span>Theme</span><strong>${escapeHtml(String(state.mapContext.themePreset || 'default'))}</strong></div>`,
      `<div class="map-camera-debug__row"><span>Render</span><strong>${escapeHtml(renderType)}</strong></div>`,
    ].join('');
  };

  const toggleMapCameraDebugVisibility = () => {
    state.ui.mapCameraDebugVisible = !state.ui.mapCameraDebugVisible;
    renderMapCameraDebug();
  };

  const getCurrentMapCamera = () => ({
    center: state.map && typeof state.map.getCenter === 'function' ? state.map.getCenter() : undefined,
    zoom: state.map && typeof state.map.getZoom === 'function' ? Number(state.map.getZoom() || MAP_ZOOM_BRANCH) : MAP_ZOOM_BRANCH,
    heading:
      state.map && typeof state.map.getHeading === 'function'
        ? Number(state.map.getHeading() || state.mapContext.cameraHeading || 0)
        : Number(state.mapContext.cameraHeading || 0),
  });

  const moveMapCamera = ({ center, zoom, tilt, heading }) => {
    if (!state.map) {
      return;
    }
    const current = getCurrentMapCamera();
    const nextCenter = center || current.center;
    const nextHeading = Number.isFinite(Number(heading)) ? Number(heading) : current.heading;
    state.mapContext.cameraHeading = ((nextHeading % 360) + 360) % 360;
    if (typeof state.map.setOptions === 'function') {
      state.map.setOptions({
        tiltInteractionEnabled: true,
        headingInteractionEnabled: true,
      });
    }
    if (typeof state.map.moveCamera === 'function') {
      state.map.moveCamera({
        center: nextCenter,
        zoom: Number.isFinite(Number(zoom)) ? Number(zoom) : current.zoom,
        tilt: Number.isFinite(Number(tilt)) ? Number(tilt) : state.mapContext.cameraMode === 'tilt' ? 55 : 0,
        heading: state.mapContext.cameraHeading,
      });
      renderMapCameraDebug();
      return;
    }
    if (nextCenter && typeof state.map.setCenter === 'function') {
      state.map.setCenter(nextCenter);
    }
    state.map.setZoom(Number.isFinite(Number(zoom)) ? Number(zoom) : current.zoom);
    if (typeof state.map.setTilt === 'function') {
      state.map.setTilt(Number.isFinite(Number(tilt)) ? Number(tilt) : state.mapContext.cameraMode === 'tilt' ? 45 : 0);
    }
    if (typeof state.map.setHeading === 'function') {
      state.map.setHeading(state.mapContext.cameraHeading);
    }
    renderMapCameraDebug();
  };

  const syncInitialMapTiltIfNeeded = () => {
    if (!state.map || !state.ui.initialTiltSyncPending) {
      return;
    }
    if (state.mapContext.cameraMode !== 'tilt' || !isVectorRenderingActive()) {
      state.ui.initialTiltSyncPending = false;
      return;
    }
    const current = getCurrentMapCamera();
    state.ui.initialTiltSyncPending = false;
    if (Number(current.tilt || 0) >= 30) {
      return;
    }
    moveMapCamera({
      center: current.center,
      zoom: current.zoom,
      tilt: 30,
      heading: Number(current.heading || 0),
    });
  };

  const applyMapCameraMode = (mode, options = {}) => {
    const normalized = String(mode || '').toLowerCase() === 'tilt' ? 'tilt' : 'normal';
    state.mapContext.cameraMode = normalized;
    renderMapCameraModeControls();
    if (!state.map) {
      return;
    }
    if (normalized === 'tilt' && !isVectorRenderingActive()) {
      setConnectionBadge('Tilt butuh vector map', 'warning');
      return;
    }
    const current = getCurrentMapCamera();
    const useAllBranchesTiltPreset = normalized === 'tilt' && isAllBranchesSelected();
    const targetZoom = normalized === 'tilt'
      ? useAllBranchesTiltPreset
        ? 7
        : Math.max(Number(current.zoom || 0), 11)
      : Number(current.zoom || MAP_ZOOM_BRANCH);
    const targetHeading = normalized === 'tilt' ? 0 : 0;
    moveMapCamera({
      zoom: targetZoom,
      tilt: normalized === 'tilt' ? 30 : 0,
      heading: targetHeading,
    });
    if (options.persist !== false) {
      void persistAssetMonitoringPrefs();
    }
    syncNetworkOverlay();
  };

  const rotateMapCamera = (step) => {
    if (!state.map || !isVectorRenderingActive()) {
      return;
    }
    const current = getCurrentMapCamera();
    const isTilt = state.mapContext.cameraMode === 'tilt';
    moveMapCamera({
      zoom: current.zoom,
      tilt: isTilt ? 45 : 0,
      heading: Number(current.heading || 0) + Number(step || 0),
    });
    void persistAssetMonitoringPrefs();
    syncNetworkOverlay();
  };

  const getAllBranchesBounds = () => {
    if (!window.google || !window.google.maps) {
      return null;
    }
    const bounds = new window.google.maps.LatLngBounds();
    let hasBounds = false;
    (Array.isArray(state.mapContext.availableBranches) ? state.mapContext.availableBranches : []).forEach((entry) => {
      const lat = Number(entry.center_lat);
      const lng = Number(entry.center_lng);
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        bounds.extend({ lat, lng });
        hasBounds = true;
      }
    });
    return hasBounds ? bounds : null;
  };

  const centerMapForCurrentSelection = () => {
    if (!state.map) {
      return;
    }
    state.mapContext.cameraMode = 'tilt';
    renderMapCameraModeControls();
    if (isAllBranchesSelected()) {
      const bounds = getAllBranchesBounds();
      const center = bounds && typeof bounds.getCenter === 'function' ? bounds.getCenter() : null;
      moveMapCamera({
        center,
        zoom: MAP_ZOOM_ALL_BRANCH,
        tilt: isVectorRenderingActive() ? 30 : 0,
        heading: 0,
      });
      void persistAssetMonitoringPrefs();
      syncNetworkOverlay();
      return;
    }
    const branch = getSelectedBranch();
    if (
      branch &&
      Number.isFinite(Number(branch.center_lat)) &&
      Number.isFinite(Number(branch.center_lng))
    ) {
      const current = getCurrentMapCamera();
      moveMapCamera({
        center: { lat: Number(branch.center_lat), lng: Number(branch.center_lng) },
        zoom: Math.max(Number(current.zoom || 0), MAP_ZOOM_BRANCH),
        tilt: state.mapContext.cameraMode === 'tilt' && isVectorRenderingActive() ? 30 : 0,
        heading: Number(current.heading || 0),
      });
      void persistAssetMonitoringPrefs();
      syncNetworkOverlay();
    }
  };

  const syncCameraModeForBranchSelection = () => {
    if (!state.map) {
      return;
    }
    applyMapCameraMode('tilt');
  };

  const isAllBranchesSelected = () => String((state.mapContext.selectedBranch && state.mapContext.selectedBranch.id) || '') === ALL_BRANCHES_OPTION;
  const isEntityInSelectedBranch = (branchId) => {
    const selectedBranch = getSelectedBranch();
    if (!selectedBranch || !selectedBranch.id || isAllBranchesSelected()) {
      return true;
    }
    return String(branchId || '') === String(selectedBranch.id);
  };

  const getVisibleAlerts = () =>
    Array.from(state.incidents.alerts.values())
      .filter(
        (alert) =>
          alert &&
          Number(alert.status) !== 2 &&
          !state.incidents.suppressedCompletedSosIds.has(Number(alert.sos_id)) &&
          isEntityInSelectedBranch(alert.branch_id)
      )
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

  const INCIDENT_FILTER_KEYS = ['sos', 'cctv', 'vms', 'gate', 'weather'];
  const INCIDENT_GROUP_ORDER = ['sos', 'gate', 'asset', 'weather'];

  const isIncidentFilterEnabled = (key) => state.incidents.filters[String(key || '').toLowerCase()] !== false;
  const getIncidentAnimationState = () => state.incidents.animation;
  const clearIncidentEnterTimer = (key) => {
    const normalizedKey = String(key || '');
    const timer = getIncidentAnimationState().enterTimers.get(normalizedKey);
    if (timer) {
      window.clearTimeout(timer);
      getIncidentAnimationState().enterTimers.delete(normalizedKey);
    }
  };
  const clearIncidentLeaveTimer = (key) => {
    const normalizedKey = String(key || '');
    const timer = getIncidentAnimationState().leaveTimers.get(normalizedKey);
    if (timer) {
      window.clearTimeout(timer);
      getIncidentAnimationState().leaveTimers.delete(normalizedKey);
    }
  };
  const requestIncidentListAnimation = (mode = 'data') => {
    getIncidentAnimationState().pendingMode = mode;
  };
  const resetIncidentListAnimationState = (options = {}) => {
    const animationState = getIncidentAnimationState();
    Array.from(animationState.enterTimers.keys()).forEach(clearIncidentEnterTimer);
    Array.from(animationState.leaveTimers.keys()).forEach(clearIncidentLeaveTimer);
    animationState.enteringKeys.clear();
    animationState.leavingItems.clear();
    if (options.clearPrevious !== false) {
      animationState.previousVisibleItems = new Map();
    }
    animationState.pendingMode = 'silent';
  };
  const getSelectedIncidentListKey = () => {
    if (state.ui.selectedEntityType === 'sos' && state.selectedSosId) {
      return `sos:${state.selectedSosId}`;
    }
    if (state.ui.selectedEntityType === 'gate' && state.gateAlerts.selectedGateId) {
      return `gate:${state.gateAlerts.selectedGateId}`;
    }
    if (state.ui.selectedEntityType === 'asset' && state.standaloneAssets.selectedAssetKey) {
      return `asset:${state.standaloneAssets.selectedAssetKey}`;
    }
    if (state.ui.selectedEntityType === 'weather' && state.weather.selectedWeatherId) {
      return `weather:${state.weather.selectedWeatherId}`;
    }
    return '';
  };
  const scheduleIncidentListRender = () => {
    if (state.isActive) {
      renderIncidentList();
    }
  };

  const clearIncidentEnteringClass = (key) => {
    const normalizedKey = String(key || '');
    if (!normalizedKey || !sosIncidentListEl) {
      return;
    }
    const entryEl = sosIncidentListEl.querySelector(`[data-incident-key="${CSS.escape(normalizedKey)}"]`);
    if (entryEl) {
      entryEl.classList.remove('is-entering');
    }
  };

  const queueIncidentEnteringAnimation = (key) => {
    const normalizedKey = String(key || '');
    if (!normalizedKey) {
      return;
    }
    const animationState = getIncidentAnimationState();
    animationState.enteringKeys.add(normalizedKey);
    clearIncidentEnterTimer(normalizedKey);
    animationState.enterTimers.set(
      normalizedKey,
      window.setTimeout(() => {
        animationState.enteringKeys.delete(normalizedKey);
        animationState.enterTimers.delete(normalizedKey);
        clearIncidentEnteringClass(normalizedKey);
      }, INCIDENT_LIST_ENTER_MS)
    );
  };
  const queueIncidentLeavingAnimation = (entry) => {
    if (!entry || !entry.key) {
      return;
    }
    const animationState = getIncidentAnimationState();
    const entryKey = String(entry.key);
    animationState.leavingItems.set(entryKey, entry);
    clearIncidentLeaveTimer(entryKey);
    animationState.leaveTimers.set(
      entryKey,
      window.setTimeout(() => {
        animationState.leaveTimers.delete(entryKey);
        animationState.leavingItems.delete(entryKey);
        scheduleIncidentListRender();
      }, INCIDENT_LIST_LEAVE_MS)
    );
    if (getSelectedIncidentListKey() === entryKey) {
      window.setTimeout(() => {
        if (getSelectedIncidentListKey() === entryKey) {
          clearSelectedAlert();
        }
      }, 0);
    }
  };

  const getIncidentFilterKeyForAssetType = (assetType) => {
    const normalized = String(assetType || '').trim().toLowerCase();
    if (normalized === 'cctv' || normalized === 'vms') {
      return normalized;
    }
    return '';
  };

  const isAssetVisibleInIncidentList = (asset) => {
    if (
      !asset ||
      asset.showInSummary === false ||
      !isAssetIssueStatus(asset.status) ||
      !isStandaloneAssetTypeVisible(asset)
    ) {
      return false;
    }
    const filterKey = getIncidentFilterKeyForAssetType(asset.asset_type);
    return Boolean(filterKey) && isIncidentFilterEnabled(filterKey);
  };

  const compareIncidentEntries = (a, b) => {
    if (!a || !b) {
      return 0;
    }
    if (a.group === 'sos' && b.group === 'sos') {
      return new Date(b.data && b.data.created_at ? b.data.created_at : 0) - new Date(a.data && a.data.created_at ? a.data.created_at : 0);
    }
    if (a.group === 'gate' && b.group === 'gate') {
      return String((a.data && (a.data.gate_name || a.data.gate_code)) || '').localeCompare(
        String((b.data && (b.data.gate_name || b.data.gate_code)) || '')
      );
    }
    if (a.group === 'asset' && b.group === 'asset') {
      return String((a.data && a.data.title) || '').localeCompare(String((b.data && b.data.title) || ''));
    }
    if (a.group === 'weather' && b.group === 'weather') {
      return String((a.data && (a.data.point_code || a.data.point_name)) || '').localeCompare(
        String((b.data && (b.data.point_code || b.data.point_name)) || '')
      );
    }
    return INCIDENT_GROUP_ORDER.indexOf(a.group) - INCIDENT_GROUP_ORDER.indexOf(b.group);
  };

  const buildSosIncidentEntry = (alert) => ({
    key: `sos:${alert.sos_id}`,
    group: 'sos',
    entityType: 'sos',
    data: alert,
  });

  const buildGateIncidentEntry = (gate) => ({
    key: `gate:${gate.gate_id}`,
    group: 'gate',
    entityType: 'gate',
    data: gate,
  });

  const buildAssetIncidentEntry = (asset) => ({
    key: `asset:${makeAssetKey(asset.asset_type, asset.id)}`,
    group: 'asset',
    entityType: 'asset',
    data: asset,
  });

  const buildWeatherIncidentEntry = (weather) => ({
    key: `weather:${weather.id}`,
    group: 'weather',
    entityType: 'weather',
    data: weather,
  });

  const getVisibleIncidentEntries = () => {
    const alerts = isIncidentFilterEnabled('sos') ? getVisibleAlerts() : [];
    const gateAlerts = Array.from(state.gateAlerts.items.values())
      .filter(
        (gate) =>
          isIncidentFilterEnabled('gate') &&
          gate &&
          gate.showInSummary !== false &&
          (gate.status === 'error' || gate.status === 'warning')
      )
      .sort((a, b) => String(a.gate_name || a.gate_code || '').localeCompare(String(b.gate_name || b.gate_code || '')));
    const issueAssets = Array.from(state.standaloneAssets.items.values())
      .filter((item) => isAssetVisibleInIncidentList(item))
      .sort((a, b) => String(a.title || '').localeCompare(String(b.title || '')));
    const weatherItems =
      isIncidentFilterEnabled('weather') && isWeatherLayerActive()
        ? state.weather.items
            .filter((item) => item && item.latLng)
            .sort((a, b) =>
              String(a.point_code || a.point_name || '').localeCompare(String(b.point_code || b.point_name || ''))
            )
        : [];
    return [
      ...alerts.map(buildSosIncidentEntry),
      ...gateAlerts.map(buildGateIncidentEntry),
      ...issueAssets.map(buildAssetIncidentEntry),
      ...weatherItems.map(buildWeatherIncidentEntry),
    ];
  };

  const reconcileIncidentListAnimations = (currentEntriesMap) => {
    const animationState = getIncidentAnimationState();
    const pendingMode = animationState.pendingMode;
    animationState.pendingMode = 'silent';

    currentEntriesMap.forEach((entry, key) => {
      if (animationState.leavingItems.has(key)) {
        clearIncidentLeaveTimer(key);
        animationState.leavingItems.delete(key);
      }
      if (pendingMode === 'data' && !animationState.previousVisibleItems.has(key)) {
        queueIncidentEnteringAnimation(key);
      }
    });

    if (pendingMode === 'data') {
      animationState.previousVisibleItems.forEach((entry, key) => {
        if (!currentEntriesMap.has(key)) {
          queueIncidentLeavingAnimation(entry);
        }
      });
    }

    animationState.previousVisibleItems = new Map(currentEntriesMap);
  };

  const renderIncidentEntry = (entry, options = {}) => {
    if (!entry || !entry.data) {
      return '';
    }
    const isLeaving = Boolean(options.isLeaving);
    const isEntering = Boolean(options.isEntering);
    const order = Number.isFinite(Number(options.order)) ? Number(options.order) : 0;
    const animationClasses = [isEntering ? 'is-entering' : '', isLeaving ? 'is-leaving' : ''].filter(Boolean).join(' ');
    const interactionAttrs = isLeaving
      ? 'tabindex="-1" aria-hidden="true" data-incident-disabled="true"'
      : 'tabindex="0" role="button"';
    const animationAttrs = `data-incident-key="${escapeHtml(entry.key)}" style="--stagger-index:${Math.min(Math.max(order, 0), 7)};"`;

    if (entry.entityType === 'sos') {
      const alert = entry.data;
      const statusMeta = getStatusMeta(alert.status);
      const responseSummary = getSmartResponseSummaryForAlert(alert);
      const responseMeta = responseSummary ? getSmartResponseStatusMeta(responseSummary.response_status) : null;
      const rawPhoneNumber = alert.user && alert.user.phone ? String(alert.user.phone) : '';
      const displayPhoneNumber = getDisplayPhoneNumber(rawPhoneNumber);
      const whatsAppLink = isLeaving ? '' : getWhatsAppLink(rawPhoneNumber);
      return `
        <article class="sos-incident-item ${alert.sos_id === state.selectedSosId && !isLeaving ? 'is-selected' : ''} ${animationClasses}" data-entity-type="sos" data-sos-id="${alert.sos_id}" ${animationAttrs} ${interactionAttrs} aria-label="Pilih kejadian SOS ${alert.sos_id}">
          <div class="sos-incident-item__head">
            <strong>${escapeHtml(alert.ticket && alert.ticket.ticket_no ? alert.ticket.ticket_no : `SOS-${alert.sos_id}`)}</strong>
            <span class="status-pill ${statusMeta.tone}">${statusMeta.label}</span>
          </div>
          <div class="sos-incident-item__meta">
            <div class="sos-incident-item__row">
              <span class="sos-incident-item__branch">${escapeHtml(alert.branch_name || '-')}</span>
              <span>${escapeHtml(toDateTime(alert.created_at))}</span>
            </div>
            <div>
              <span class="sos-incident-item__label">Nama</span>
              <div class="sos-incident-item__value">${escapeHtml(getAlertName(alert))}</div>
            </div>
            ${responseSummary ? `
              <div class="sos-incident-item__response-row">
                <span class="status-pill ${escapeHtml(responseMeta.tone)}">${escapeHtml(responseMeta.label)}</span>
                <span>${escapeHtml(responseSummary.primary_vehicle_label || 'Belum ada kandidat utama')}</span>
                <span>${escapeHtml(formatDistanceMetersSmartResponse(responseSummary.distance_meters))}</span>
              </div>
            ` : ''}
            <div class="sos-incident-item__row">
              <div>
                <span class="sos-incident-item__label">No Telepon</span>
                <div class="sos-incident-item__phone">${escapeHtml(displayPhoneNumber || '-')}</div>
              </div>
              <div class="sos-incident-item__actions">
                <button
                  class="sos-whatsapp-btn"
                  type="button"
                  data-wa-link="${escapeHtml(whatsAppLink)}"
                  ${whatsAppLink ? '' : 'disabled'}
                  aria-label="Buka WhatsApp"
                  title="Buka WhatsApp"
                >
                  <span class="sos-whatsapp-btn__icon" aria-hidden="true">&#128172;</span>
                </button>
              </div>
            </div>
          </div>
        </article>
      `;
    }

    if (entry.entityType === 'gate') {
      const gate = entry.data;
      const tone = getGateMarkerTone(gate);
      return `
        <article class="sos-incident-item sos-incident-item--summary ${state.ui.selectedEntityType === 'gate' && String(state.ui.selectedEntityId) === String(gate.gate_id) && !isLeaving ? 'is-selected' : ''} ${animationClasses}" data-entity-type="gate" data-gate-id="${gate.gate_id}" ${animationAttrs} ${interactionAttrs} aria-label="Pilih gate alert ${escapeHtml(gate.gate_name || gate.gate_code || gate.gate_id)}">
          <div class="sos-incident-item__head">
            <strong>${escapeHtml(gate.gate_name || gate.gate_code || `Gate ${gate.gate_id}`)}</strong>
            <span class="status-pill ${tone === 'danger' ? 'danger' : tone === 'warning' ? 'warning' : 'success'}">${escapeHtml(String(gate.status || 'normal').toUpperCase())}</span>
          </div>
          <div class="sos-incident-item__meta">
            <div>
              <span class="sos-incident-item__label">Issue</span>
              <div class="sos-incident-item__value">${escapeHtml(getGateLogSummaryText(gate, 'Perangkat bermasalah'))}</div>
            </div>
            <div class="sos-incident-item__row">
              <div>
                <span class="sos-incident-item__label">Affected</span>
                <div class="sos-incident-item__phone">${escapeHtml(`${(gate.device_summary && gate.device_summary.error) || 0} error / ${(gate.device_summary && gate.device_summary.warning) || 0} warning`)}</div>
              </div>
              <div>
                <span class="sos-incident-item__label">Update</span>
                <div class="sos-incident-item__phone">${escapeHtml(toDateTime(gate.last_event_at || '-'))}</div>
              </div>
            </div>
          </div>
        </article>
      `;
    }

    if (entry.entityType === 'weather') {
      const weather = entry.data;
      const iconUrl = escapeHtml(getWeatherIconSourceSync(weather) || getWeatherMarkerIconUrl(weather));
      const fallbackIconUrl = escapeHtml(getWeatherMarkerIconFallbackUrl(weather));
      const weatherLabel = escapeHtml(weather.weather_label || 'Cuaca');
      const pointName = escapeHtml(weather.point_name || '-');
      const contextLine = escapeHtml(getWeatherContextLine(weather));
      const observedAt = escapeHtml(formatWeatherObservedAt(weather.observed_at || '-'));
      return `
        <article class="sos-incident-item sos-incident-item--summary sos-incident-item--weather ${state.ui.selectedEntityType === 'weather' && String(state.ui.selectedEntityId) === String(weather.id) && !isLeaving ? 'is-selected' : ''} ${animationClasses}" data-entity-type="weather" data-weather-id="${weather.id}" ${animationAttrs} ${interactionAttrs} aria-label="Pilih weather point ${escapeHtml(weather.point_name || weather.point_code || weather.id)}">
          <div class="sos-weather-incident__top">
            <span class="sos-weather-incident__icon">
              <img class="sos-weather-incident__icon-img" src="${iconUrl}" alt="" aria-hidden="true" data-fallback-src="${fallbackIconUrl}" />
            </span>
            <div class="sos-weather-incident__body">
              <strong class="sos-weather-incident__label">${weatherLabel}</strong>
              <span class="sos-weather-incident__point">${pointName}</span>
              <span class="sos-weather-incident__location">${contextLine}</span>
            </div>
            <div class="sos-weather-incident__temp">${escapeHtml(formatWeatherTemperatureDisplay(weather.temperature_c))}</div>
          </div>
          <div class="sos-weather-incident__footer">
            <div class="sos-weather-incident__metric">
              <span class="sos-weather-incident__metric-label">Kecepatan Angin</span>
              <strong class="sos-weather-incident__metric-value">${getWeatherMetricIcon('wind')}<span>${escapeHtml(formatWeatherWind(weather.wind_kph))}</span></strong>
            </div>
            <div class="sos-weather-incident__metric">
              <span class="sos-weather-incident__metric-label">Kelembapan</span>
              <strong class="sos-weather-incident__metric-value">${getWeatherMetricIcon('humidity')}<span>${escapeHtml(formatWeatherPercent(weather.humidity_pct))}</span></strong>
            </div>
            <div class="sos-weather-incident__metric">
              <span class="sos-weather-incident__metric-label">Waktu Observasi</span>
              <strong class="sos-weather-incident__metric-value">${observedAt}</strong>
            </div>
          </div>
        </article>
      `;
    }

    const asset = entry.data;
    const assetKey = makeAssetKey(asset.asset_type, asset.id);
    return `
      <article class="sos-incident-item sos-incident-item--summary ${state.ui.selectedEntityType === 'asset' && String(state.ui.selectedEntityId) === assetKey && !isLeaving ? 'is-selected' : ''} ${animationClasses}" data-entity-type="asset" data-asset-type="${escapeHtml(asset.asset_type)}" data-asset-id="${escapeHtml(asset.id)}" ${animationAttrs} ${interactionAttrs} aria-label="Pilih asset ${escapeHtml(asset.title)}">
        <div class="sos-incident-item__head">
          <strong>${escapeHtml(asset.title)}</strong>
          <span class="status-pill ${getAssetIssueTone(asset.status)}">${escapeHtml(String(asset.status || 'offline').toUpperCase())}</span>
        </div>
        <div class="sos-incident-item__meta">
          <div class="sos-incident-item__row">
            <span class="sos-incident-item__branch">${escapeHtml((asset.asset_type || '-').toUpperCase())}</span>
            <span>${escapeHtml(toDateTime(asset.last_update_at || '-'))}</span>
          </div>
          <div>
            <span class="sos-incident-item__label">Stream</span>
            <div class="sos-incident-item__value">${escapeHtml(asset.has_live_stream ? 'Tersedia' : 'Tidak tersedia')}</div>
          </div>
        </div>
      </article>
    `;
  };

  const isSelectedEntityVisibleInIncidentList = () => {
    if (state.ui.selectedEntityType === 'sos') {
      const alert = getSelectedAlert();
      return Boolean(
        isIncidentFilterEnabled('sos') &&
          alert &&
          Number(alert.status) !== 2 &&
          isEntityInSelectedBranch(alert.branch_id)
      );
    }
    if (state.ui.selectedEntityType === 'gate') {
      if (!isIncidentFilterEnabled('gate') || !state.gateAlerts.selectedGateId) {
        return false;
      }
      const gate = state.gateAlerts.items.get(String(state.gateAlerts.selectedGateId));
      return Boolean(
        gate &&
        gate.showInSummary !== false &&
        (gate.status === 'error' || gate.status === 'warning')
      );
    }
    if (state.ui.selectedEntityType === 'asset') {
      if (!state.standaloneAssets.selectedAssetKey) {
        return false;
      }
      const asset = state.standaloneAssets.items.get(state.standaloneAssets.selectedAssetKey);
      return isAssetVisibleInIncidentList(asset);
    }
    if (state.ui.selectedEntityType === 'weather') {
      return (
        isIncidentFilterEnabled('weather') &&
        isWeatherLayerActive() &&
        Boolean(
          state.weather.selectedWeatherId &&
            state.weather.items.some((item) => String(item.id) === String(state.weather.selectedWeatherId))
        )
      );
    }
    return true;
  };

  const syncIncidentFilterControls = () => {
    if (!sosIncidentFiltersEl) {
      return;
    }
    sosIncidentFiltersEl.querySelectorAll('[data-incident-filter]').forEach((button) => {
      const key = button.getAttribute('data-incident-filter') || '';
      const isActive = isIncidentFilterEnabled(key);
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  };

  const reconcileIncidentSelectionWithFilters = () => {
    if (isSelectedEntityVisibleInIncidentList()) {
      return false;
    }
    if (state.ui.selectedEntityType === 'asset') {
      closeCctvModal();
    }
    clearSelectedAlert();
    return true;
  };

  const toggleIncidentFilter = (key) => {
    const normalized = String(key || '').trim().toLowerCase();
    if (!INCIDENT_FILTER_KEYS.includes(normalized)) {
      return;
    }
    state.incidents.filters[normalized] = !isIncidentFilterEnabled(normalized);
    syncIncidentFilterControls();
    resetIncidentListAnimationState({ clearPrevious: false });
    if (reconcileIncidentSelectionWithFilters()) {
      return;
    }
    renderIncidentList();
  };

  const getSelectedAlert = () => state.incidents.alerts.get(Number(state.selectedSosId)) || null;
  const getSelectedBranch = () => state.mapContext.selectedBranch || state.activeWorkspaceBranch || null;
  const getNetworkBranchKey = () =>
    isAllBranchesSelected() ? ALL_BRANCHES_OPTION : String((getSelectedBranch() && getSelectedBranch().id) || '');
  const getWeatherBranchKey = () =>
    isAllBranchesSelected() ? ALL_BRANCHES_OPTION : String((getSelectedBranch() && getSelectedBranch().id) || '');
  const isWeatherLayerActive = () => state.weather.visible;
  const isWeatherMarkerExpanded = (weatherId) =>
    isWeatherLayerActive() &&
    (Boolean(state.weather.expandAllBubbles) ||
      String(state.weather.selectedWeatherId || '') === String(weatherId || ''));
  const isViewportCullingActive = () => isAllBranchesSelected();
  const getViewportBoundsWithPadding = (paddingRatio = 0.08) => {
    if (!state.map || typeof state.map.getBounds !== 'function') {
      return null;
    }
    const bounds = state.map.getBounds();
    if (!bounds || typeof bounds.getNorthEast !== 'function' || typeof bounds.getSouthWest !== 'function') {
      return null;
    }
    const northEast = bounds.getNorthEast();
    const southWest = bounds.getSouthWest();
    if (!northEast || !southWest) {
      return null;
    }
    const north = Number(northEast.lat());
    const east = Number(northEast.lng());
    const south = Number(southWest.lat());
    const west = Number(southWest.lng());
    const latPad = Math.max(0.0015, Math.abs(north - south) * paddingRatio);
    const lngPad = Math.max(0.0015, Math.abs(east - west) * paddingRatio);
    return new window.google.maps.LatLngBounds(
      new window.google.maps.LatLng(south - latPad, west - lngPad),
      new window.google.maps.LatLng(north + latPad, east + lngPad)
    );
  };
  const isLatLngInViewport = (latLng, bounds = null) => {
    if (!latLng || !isViewportCullingActive()) {
      return true;
    }
    const viewportBounds = bounds || getViewportBoundsWithPadding();
    if (!viewportBounds || typeof viewportBounds.contains !== 'function') {
      return true;
    }
    const point =
      latLng instanceof window.google.maps.LatLng
        ? latLng
        : new window.google.maps.LatLng(Number(latLng.lat), Number(latLng.lng));
    return viewportBounds.contains(point);
  };
  const getViewportRenderKey = () => {
    if (!isViewportCullingActive()) {
      return '';
    }
    const bounds = getViewportBoundsWithPadding();
    if (!bounds) {
      return 'viewport:pending';
    }
    const northEast = bounds.getNorthEast();
    const southWest = bounds.getSouthWest();
    const zoom = Number(state.map && state.map.getZoom ? state.map.getZoom() : 0);
    return [
      zoom.toFixed(2),
      Number(southWest.lat()).toFixed(4),
      Number(southWest.lng()).toFixed(4),
      Number(northEast.lat()).toFixed(4),
      Number(northEast.lng()).toFixed(4),
    ].join(':');
  };
  const isStandaloneAssetTypeVisible = (asset) => {
    const assetType = String(asset && asset.asset_type ? asset.asset_type : 'cctv').toLowerCase();
    return assetType === 'vms' ? state.vmsVisible : state.cctvVisible;
  };
  const getStandaloneLayerKey = (branchKey) =>
    [
      branchKey,
      state.cctvVisible ? 'cctv' : '',
      state.vmsVisible ? 'vms' : '',
      state.markerStatusFilters.normal ? 'normal' : '',
      state.markerStatusFilters.warning ? 'warning' : '',
      state.markerStatusFilters.error ? 'error' : '',
    ].join(':');
  const getNetworkSummaryLabel = () => {
    const totals = state.networkArcs.meta && state.networkArcs.meta.totals ? state.networkArcs.meta.totals : null;
    const arcCount = totals && Number.isFinite(Number(totals.arcs))
      ? Number(totals.arcs)
      : Array.isArray(state.networkArcs.items)
        ? state.networkArcs.items.length
        : 0;
    const crossBranch = Boolean(state.networkArcs.meta && state.networkArcs.meta.contains_cross_branch_edges);
    if (!state.networkArcs.visible) {
      return 'Layer network disembunyikan';
    }
    return `${arcCount} arc${arcCount === 1 ? '' : 's'}${crossBranch ? ' \u2022 cross-branch' : ''}${state.networkArcs.experimentalEnabled ? ' \u2022 arc fx' : ''}`;
  };
  const getWeatherSummaryLabel = () => {
    if (!isWeatherLayerActive()) {
      return '';
    }
    const itemCount = Array.isArray(state.weather.items) ? state.weather.items.length : 0;
    if (!itemCount) {
      return '';
    }
    const hasStaleItems = Boolean(
      (state.weather.meta && state.weather.meta.has_stale_items) ||
      state.weather.items.some((item) => item && item.is_stale)
    );
    return `${itemCount} weather point${itemCount === 1 ? '' : 's'}${hasStaleItems ? ' \u2022 sebagian data lama' : ''}`;
  };

  const getDefaultMapEmptyMessage = () => {
    const hasGateMarkers = Array.from(state.gateAlerts.items.values()).some(
      (gate) => gate && gate.latLng && state.gateAlerts.visible && isEntityInSelectedBranch(gate.branch_id)
    );
    const hasAssets = Array.from(state.standaloneAssets.items.values()).some(
      (item) => item && item.latLng && isEntityInSelectedBranch(item.branch_id) && isStandaloneAssetTypeVisible(item)
    );
    const hasVehicles = Array.from(state.vehicles.items.values()).some(
      (item) => item && item.latLng && isEntityInSelectedBranch(item.branch_id) && isVehicleTypeVisible(item)
    );
    if (
      !getVisibleAlerts().length &&
      !hasGateMarkers &&
      !hasAssets &&
      !hasVehicles &&
      !(isWeatherLayerActive() && Array.isArray(state.weather.items) && state.weather.items.length > 0) &&
      state.networkArcs.visible &&
      state.networkArcs.hasLoaded &&
      !state.networkArcs.items.length &&
      !state.networkArcs.errorMessage
    ) {
      return 'Belum ada koneksi fiber untuk filter branch aktif.';
    }
    return 'Belum ada marker kejadian, kendaraan, CCTV, weather, atau koneksi fiber untuk ditampilkan.';
  };
  const hasRenderableMapData = () =>
    getVisibleAlerts().length > 0 ||
    Array.from(state.gateAlerts.items.values()).some(
      (gate) =>
        gate &&
        gate.latLng &&
        state.gateAlerts.visible &&
        isEntityInSelectedBranch(gate.branch_id)
    ) ||
    Array.from(state.standaloneAssets.items.values()).some(
      (item) =>
        item &&
        item.latLng &&
        isEntityInSelectedBranch(item.branch_id) &&
        isStandaloneAssetTypeVisible(item)
    ) ||
    Array.from(state.vehicles.items.values()).some(
      (item) => item && item.latLng && isEntityInSelectedBranch(item.branch_id) && isVehicleTypeVisible(item)
    ) ||
    (isWeatherLayerActive() && Array.isArray(state.weather.items) && state.weather.items.length > 0) ||
    (state.networkArcs.visible && Array.isArray(state.networkArcs.items) && state.networkArcs.items.length > 0);

  const setConnectionBadge = (label, tone = 'neutral') => {
    state.mapContext.streamStatus = tone;
    setClass(sosConnectionBadgeEl, `status-pill ${tone}`);
    setText(sosConnectionBadgeEl, label);
  };

  const renderNotifications = () => {
    if (!state.notifications.length) {
      sosNotificationPanelEl.classList.add('hidden');
      sosNotificationListEl.innerHTML = '';
      return;
    }
    sosNotificationPanelEl.classList.remove('hidden');
    sosNotificationListEl.innerHTML = state.notifications
      .map(
        (entry, index) => `
          <article class="sos-notification-card ${state.notificationEnteringIds.has(String(entry.id)) ? 'is-entering' : ''} ${state.notificationLeavingIds.has(String(entry.id)) ? 'is-leaving' : ''}" data-notification-id="${escapeHtml(entry.id)}" style="--stagger-index:${Math.min(index, 5)};">
            <div class="sos-incident-item__row">
              <strong>${escapeHtml(entry.title)}</strong>
              <button class="sos-notification-close-btn" type="button" data-notification-close="${escapeHtml(entry.id)}" aria-label="Tutup notifikasi" title="Tutup notifikasi">
                <span class="sos-notification-close-btn__icon" aria-hidden="true">&times;</span>
              </button>
            </div>
            <button class="sos-notification-card__open" type="button" data-notification-open="${escapeHtml(entry.id)}">
              <span>${escapeHtml(entry.subtitle)}</span>
            </button>
          </article>
        `
      )
      .join('');
  };

  const clearNotificationEnterTimer = (notificationId) => {
    const timer = state.notificationEnterTimers.get(String(notificationId));
    if (timer) {
      window.clearTimeout(timer);
      state.notificationEnterTimers.delete(String(notificationId));
    }
  };

  const clearNotificationEnteringClass = (notificationId) => {
    const normalizedId = String(notificationId || '').trim();
    if (!normalizedId || !sosNotificationListEl) {
      return;
    }
    const card = sosNotificationListEl.querySelector(`[data-notification-id="${CSS.escape(normalizedId)}"]`);
    if (card) {
      card.classList.remove('is-entering');
    }
  };

  const markNotificationLeaving = (notificationId) => {
    const normalizedId = String(notificationId || '').trim();
    if (!normalizedId || !sosNotificationListEl) {
      return;
    }
    const card = sosNotificationListEl.querySelector(`[data-notification-id="${CSS.escape(normalizedId)}"]`);
    if (card) {
      card.classList.add('is-leaving');
    }
  };

  const clearNotificationTimer = (notificationId) => {
    const timer = state.notificationTimers.get(String(notificationId));
    if (timer) {
      window.clearTimeout(timer);
      state.notificationTimers.delete(String(notificationId));
    }
  };

  const removeNotificationImmediately = (notificationId) => {
    const normalizedId = String(notificationId || '').trim();
    const existingCard =
      normalizedId && sosNotificationListEl
        ? sosNotificationListEl.querySelector(`[data-notification-id="${CSS.escape(normalizedId)}"]`)
        : null;
    clearNotificationEnterTimer(normalizedId);
    clearNotificationTimer(normalizedId);
    state.notificationEnteringIds.delete(normalizedId);
    state.notificationLeavingIds.delete(normalizedId);
    state.notifications = state.notifications.filter((entry) => String(entry.id) !== normalizedId);
    state.incidents.notifications = state.notifications;
    if (existingCard && existingCard.parentNode) {
      existingCard.parentNode.removeChild(existingCard);
      if (!state.notifications.length) {
        sosNotificationPanelEl.classList.add('hidden');
        sosNotificationListEl.innerHTML = '';
      }
      return;
    }
    renderNotifications();
  };

  const removeNotification = (notificationId) => {
    const normalizedId = String(notificationId || '').trim();
    if (!normalizedId) {
      return;
    }
    if (state.notificationLeavingIds.has(normalizedId)) {
      return;
    }
    const exists = state.notifications.some((entry) => String(entry.id) === normalizedId);
    if (!exists) {
      return;
    }
    clearNotificationTimer(normalizedId);
    state.notificationLeavingIds.add(normalizedId);
    markNotificationLeaving(normalizedId);
    window.setTimeout(() => {
      removeNotificationImmediately(normalizedId);
    }, NOTIFICATION_LEAVE_MS);
  };

  const removeNotificationsByTarget = (targetType, matcher) => {
    state.notifications
      .filter((entry) => entry && entry.target && entry.target.type === targetType && matcher(entry.target))
      .forEach((entry) => {
        clearNotificationEnterTimer(entry.id);
        clearNotificationTimer(entry.id);
        state.notificationEnteringIds.delete(String(entry.id));
        state.notificationLeavingIds.delete(String(entry.id));
      });
    state.notifications = state.notifications.filter(
      (entry) => !(entry && entry.target && entry.target.type === targetType && matcher(entry.target))
    );
    state.incidents.notifications = state.notifications;
    renderNotifications();
  };

  const scheduleNotificationRemoval = (notificationId, durationMs = TRANSIENT_NOTIFICATION_MS) => {
    const normalizedId = String(notificationId || '').trim();
    if (!normalizedId) {
      return;
    }
    clearNotificationTimer(normalizedId);
    const timer = window.setTimeout(() => {
      removeNotification(normalizedId);
    }, durationMs);
    state.notificationTimers.set(normalizedId, timer);
  };

  const pushNotificationEntry = (entry, options = {}) => {
    const normalized = entry && typeof entry === 'object' ? entry : null;
    if (!normalized) {
      return;
    }
    const notificationId = normalized.id || nextNotificationId(normalized.kind || 'notif');
    const payload = {
      ...normalized,
      id: notificationId,
    };
    const nextNotifications = [
      payload,
      ...state.notifications,
    ];
    const droppedNotifications = nextNotifications.slice(SOS_NOTIFICATION_LIMIT);
    droppedNotifications.forEach((item) => {
      clearNotificationEnterTimer(item.id);
      clearNotificationTimer(item.id);
      state.notificationEnteringIds.delete(String(item.id));
      state.notificationLeavingIds.delete(String(item.id));
    });
    state.notifications = nextNotifications.slice(0, SOS_NOTIFICATION_LIMIT);
    state.incidents.notifications = state.notifications;
    state.notificationEnteringIds.add(String(notificationId));
    renderNotifications();
    clearNotificationEnterTimer(notificationId);
    state.notificationEnterTimers.set(
      String(notificationId),
      window.setTimeout(() => {
        state.notificationEnteringIds.delete(String(notificationId));
        state.notificationEnterTimers.delete(String(notificationId));
        clearNotificationEnteringClass(notificationId);
      }, NOTIFICATION_ENTER_MS + 260)
    );
    if (options.autoDismiss !== false) {
      scheduleNotificationRemoval(notificationId, options.durationMs);
    }
  };

  const pushNotification = (alert, title) => {
    const branchName = String(alert && alert.branch_name ? alert.branch_name : '-').trim() || '-';
    const fullName = getAlertName(alert);
    pushNotificationEntry({
      kind: 'sos',
      title: title || `SOS dilaporkan oleh ${fullName} di ruas tol ${branchName}`,
      subtitle: `Waktu lapor ${toDateTime(alert.created_at)}`,
      target: { type: 'sos', sosId: alert.sos_id },
    });
  };

  const pushGateStatusNotification = (gate) => {
    if (!gate || !gate.gate_id) {
      return;
    }
    pushNotificationEntry({
      kind: 'gate',
      title: `${String(gate.gate_name || gate.gate_code || `Gate ${gate.gate_id}`)} ${String(gate.status || 'normal').toUpperCase()}`,
      subtitle: getGateLogSummaryText(gate),
      target: { type: 'gate', gateId: gate.gate_id },
    });
  };

  const pushAssetStatusNotification = (asset) => {
    if (!asset || !asset.asset_type || !asset.id) {
      return;
    }
    pushNotificationEntry({
      kind: 'asset',
      title: `${String(asset.title || asset.asset_name || 'Asset')} ${String(asset.status || '').toUpperCase()}`,
      subtitle: `${String(asset.asset_type || '-').toUpperCase()} ${toDateTime(asset.last_update_at || '-')}`,
      target: { type: 'asset', assetType: asset.asset_type, assetId: asset.id },
    });
  };

  const getVisibleVehicleItems = () => {
    const filter = String(state.vehicles.listFilter || 'all').toLowerCase();
    const rows = Array.from(state.vehicles.items.values()).filter(
      (vehicle) => vehicle && isEntityInSelectedBranch(vehicle.branch_id) && isVehicleTypeVisible(vehicle)
    );
    const filtered = rows.filter((vehicle) => {
      if (filter === 'moving') {
        return vehicle.movement_status === 'moving';
      }
      if (filter === 'stopped') {
        return vehicle.movement_status === 'stopped';
      }
      return true;
    });
    return filtered.sort((a, b) => String(a.label || '').localeCompare(String(b.label || '')));
  };

  const getVehiclePanelItems = (vehicles) => {
    if (!Array.isArray(vehicles) || !vehicles.length) {
      return [];
    }
    if (!isAllBranchesSelected() || vehicles.length <= VEHICLE_LIST_RENDER_LIMIT_ALL_BRANCH) {
      return vehicles;
    }
    return vehicles.slice(0, VEHICLE_LIST_RENDER_LIMIT_ALL_BRANCH);
  };

  const getVehicleMarkerRenderLimit = () => {
    if (!isAllBranchesSelected()) {
      return Number.POSITIVE_INFINITY;
    }
    const zoom =
      state.map && typeof state.map.getZoom === 'function'
        ? Number(state.map.getZoom() || MAP_ZOOM_ALL_BRANCH)
        : MAP_ZOOM_ALL_BRANCH;
    if (zoom < 7) {
      return ALL_BRANCH_VEHICLE_MARKER_LIMIT_LOW_ZOOM;
    }
    if (zoom < 9) {
      return ALL_BRANCH_VEHICLE_MARKER_LIMIT_MID_ZOOM;
    }
    return ALL_BRANCH_VEHICLE_MARKER_LIMIT_HIGH_ZOOM;
  };

  const getVehicleMarkerPriority = (vehicle) => {
    if (!vehicle) {
      return Number.NEGATIVE_INFINITY;
    }
    const isSelected = Number(state.vehicles.selectedVehicleId) === Number(vehicle.vehicle_id);
    const isMoving = String(vehicle.movement_status || '').toLowerCase() === 'moving';
    const gpsStatus = String(vehicle.gps_status || '').toLowerCase();
    const freshnessSource = vehicle.gps_time || vehicle.received_at || '';
    const freshnessAt = freshnessSource ? Date.parse(freshnessSource) : 0;
    return (
      (isSelected ? 1_000_000_000 : 0) +
      (isMoving ? 1_000_000 : 0) +
      (gpsStatus === 'online' ? 100_000 : gpsStatus === 'delayed' ? 10_000 : 0) +
      (Number.isFinite(freshnessAt) ? freshnessAt : 0)
    );
  };

  const shouldUseVehicleClusterMode = () =>
    isAllBranchesSelected() &&
    state.map &&
    Number(state.map.getZoom() || MAP_ZOOM_ALL_BRANCH) <= VEHICLE_CLUSTER_MAX_ZOOM;

  const clearVehicleOverlayMarkers = () => {
    Array.from(state.vehicles.markers.entries()).forEach(([vehicleId, entry]) => {
      stopVehicleMotion(entry);
      if (entry && entry.marker) {
        entry.marker.setMap(null);
      }
      state.vehicles.markers.delete(Number(vehicleId));
    });
  };

  const clearVehicleClusterMarkers = () => {
    state.vehicles.clusterSyncToken += 1;
    if (state.vehicles.clusterer) {
      if (typeof state.vehicles.clusterer.clearMarkers === 'function') {
        state.vehicles.clusterer.clearMarkers();
      }
      if (typeof state.vehicles.clusterer.setMap === 'function') {
        state.vehicles.clusterer.setMap(null);
      }
      state.vehicles.clusterer = null;
    }
    state.vehicles.clusterMarkers.forEach((marker) => {
      if (marker && typeof marker.setMap === 'function') {
        marker.setMap(null);
      }
    });
    state.vehicles.clusterMarkers.clear();
  };

  const getNextVehicleClusterZoom = (currentZoom) =>
    VEHICLE_CLUSTER_STAGE_ZOOMS.find((zoomLevel) => Number(currentZoom || 0) < zoomLevel - 0.25) ||
    VEHICLE_CLUSTER_STAGE_ZOOMS[VEHICLE_CLUSTER_STAGE_ZOOMS.length - 1];

  const syncVehicleClusterMarkers = async () => {
    if (!state.map || !window.google || !window.google.maps || !shouldUseVehicleClusterMode()) {
      return;
    }
    const syncToken = state.vehicles.clusterSyncToken + 1;
    state.vehicles.clusterSyncToken = syncToken;
    let markerClustererLib = null;
    try {
      markerClustererLib = await loadMarkerClustererLibrary();
    } catch (_) {
      return;
    }
    if (
      syncToken !== state.vehicles.clusterSyncToken ||
      !state.map ||
      !shouldUseVehicleClusterMode()
    ) {
      return;
    }
    const MarkerClustererCtor =
      markerClustererLib && markerClustererLib.MarkerClusterer ? markerClustererLib.MarkerClusterer : null;
    if (!MarkerClustererCtor) {
      return;
    }
    const SuperClusterAlgorithmCtor =
      markerClustererLib && markerClustererLib.SuperClusterAlgorithm
        ? markerClustererLib.SuperClusterAlgorithm
        : null;
    const activeIds = new Set();
    const createdMarkers = [];
    const visibleVehicles = getVisibleVehicleItems().filter((vehicle) => vehicle && vehicle.latLng);

    visibleVehicles.forEach((vehicle) => {
      const vehicleId = Number(vehicle.vehicle_id);
      if (!Number.isFinite(vehicleId)) {
        return;
      }
      activeIds.add(vehicleId);
      let marker = state.vehicles.clusterMarkers.get(vehicleId) || null;
      const iconUrl = vehicle.vehicle_type_icon_url || createVehicleFallbackIconDataUrl();
      if (!marker) {
        marker = new window.google.maps.Marker({
          position: vehicle.latLng,
          title: vehicle.label || `Kendaraan ${vehicleId}`,
          optimized: true,
          icon: {
            url: iconUrl,
            scaledSize: new window.google.maps.Size(28, 28),
            anchor: new window.google.maps.Point(14, 14),
          },
          zIndex: Number(state.vehicles.selectedVehicleId) === vehicleId ? 1200 : 400,
        });
        marker.__vehicleId = vehicleId;
        marker.addListener('mouseover', () => {
          setPreviewMarkerLabel(
            createMarkerLabelRef('vehicle', vehicleId, {
              latLng:
                (state.vehicles.items.get(vehicleId) &&
                  (state.vehicles.items.get(vehicleId).renderLatLng || state.vehicles.items.get(vehicleId).latLng)) ||
                vehicle.latLng ||
                null,
            })
          );
        });
        marker.addListener('mouseout', () => {
          clearPreviewMarkerLabelIfUnlocked();
        });
        marker.addListener('click', () => {
          state.cctvSuppressMapClickUntil = Date.now() + 250;
          selectVehicle(vehicleId, { focus: false });
          void loadVehicleDetail(vehicleId).then(() => renderDetailPanel()).catch(() => {});
        });
        state.vehicles.clusterMarkers.set(vehicleId, marker);
        createdMarkers.push(marker);
      }
      marker.setPosition(vehicle.latLng);
      marker.setTitle(vehicle.label || `Kendaraan ${vehicleId}`);
      marker.setIcon({
        url: iconUrl,
        scaledSize: new window.google.maps.Size(28, 28),
        anchor: new window.google.maps.Point(14, 14),
      });
      marker.setZIndex(Number(state.vehicles.selectedVehicleId) === vehicleId ? 1200 : 400);
    });

    const removedMarkers = [];
    Array.from(state.vehicles.clusterMarkers.entries()).forEach(([vehicleId, marker]) => {
      if (activeIds.has(Number(vehicleId))) {
        return;
      }
      removedMarkers.push(marker);
      if (marker && typeof marker.setMap === 'function') {
        marker.setMap(null);
      }
      state.vehicles.clusterMarkers.delete(Number(vehicleId));
    });

    if (!state.vehicles.clusterer) {
      state.vehicles.clusterer = new MarkerClustererCtor({
        map: state.map,
        markers: Array.from(state.vehicles.clusterMarkers.values()),
        algorithm: SuperClusterAlgorithmCtor
          ? new SuperClusterAlgorithmCtor({ radius: 150, maxZoom: VEHICLE_CLUSTER_MAX_ZOOM })
          : undefined,
        onClusterClick: (_, cluster) => {
          if (!state.map) {
            return;
          }
          state.cctvSuppressMapClickUntil = Date.now() + 250;
          const clusterCenter =
            (cluster && cluster.position) ||
            (cluster &&
            Array.isArray(cluster.markers) &&
            cluster.markers[0] &&
            typeof cluster.markers[0].getPosition === 'function'
              ? cluster.markers[0].getPosition()
              : null);
          const currentZoom = Number(state.map.getZoom() || MAP_ZOOM_ALL_BRANCH);
          const nextZoom = getNextVehicleClusterZoom(currentZoom);
          animateMapZoom(state.map, nextZoom, clusterCenter);
        },
      });
      return;
    }

    if (removedMarkers.length && typeof state.vehicles.clusterer.removeMarkers === 'function') {
      state.vehicles.clusterer.removeMarkers(removedMarkers, true);
    }
    if (createdMarkers.length && typeof state.vehicles.clusterer.addMarkers === 'function') {
      state.vehicles.clusterer.addMarkers(createdMarkers, true);
    }
    if (typeof state.vehicles.clusterer.render === 'function') {
      state.vehicles.clusterer.render();
    }
  };

  const reconcileSelectedVehicle = () => {
    if (!state.vehicles.selectedVehicleId) {
      return;
    }
    const selectedVehicle = state.vehicles.items.get(Number(state.vehicles.selectedVehicleId));
    const stillVisible = getVisibleVehicleItems().some(
      (vehicle) => Number(vehicle.vehicle_id) === Number(state.vehicles.selectedVehicleId)
    );
    if (!selectedVehicle || !stillVisible) {
      state.vehicles.selectedVehicleId = null;
      if (state.ui.selectedEntityType === 'vehicle') {
        state.ui.selectedEntityType = '';
        state.ui.selectedEntityId = null;
        state.detailRenderKey = '';
      }
      clearMarkerLabelState({ preserveSosLocked: false });
    }
  };

  const shouldAutoFocusLatestAlert = () =>
    !state.selectedSosId &&
    !state.incidents.selectedSosId &&
    !String(state.ui.selectedEntityType || '').trim() &&
    !state.ui.mapInteractionActive;

  const getVehicleMarkerLabelPayload = (vehicle) => {
    if (!(vehicle && (vehicle.renderLatLng || vehicle.latLng))) {
      return null;
    }
    const latLng = vehicle.renderLatLng || vehicle.latLng;
    const gpsTone = getVehicleGpsTone(vehicle);
    const plateNumber = String(vehicle.vehicle_registration_plate || vehicle.license_plate || '').trim() || '-';
    return {
      key: `vehicle:${vehicle.vehicle_id}`,
      latLng,
      className: 'selected-map-label selected-map-label--vehicle',
      html: `
        <div class="selected-map-label__vehicle-head">
          <div class="selected-map-label__vehicle-title">${escapeHtml(vehicle.label || `Kendaraan ${vehicle.vehicle_id}`)}</div>
          <span class="selected-map-label__vehicle-gps-indicator ${escapeHtml(gpsTone)}" aria-label="${escapeHtml(getVehicleGpsLabel(vehicle.gps_status))}"></span>
        </div>
        <div class="selected-map-label__vehicle-grid">
          <div><span>Node</span><strong>${escapeHtml(vehicle.node || '-')}</strong></div>
          <div><span>Plat</span><strong>${escapeHtml(plateNumber)}</strong></div>
          <div><span>Tipe</span><strong>${escapeHtml(getVehiclePopupTypeLabel(vehicle))}</strong></div>
          <div><span>Kecepatan</span><strong>${escapeHtml(formatSpeedKmh(vehicle.speed))}</strong></div>
          <div><span>Status</span><strong>${escapeHtml(getVehicleMovementLabel(vehicle.movement_status))}</strong></div>
          <div><span>GPS Time</span><strong>${escapeHtml(toDateTimeWithSeconds(vehicle.gps_time || vehicle.received_at || '-'))}</strong></div>
        </div>
      `,
    };
  };

  const getVehicleSummaryStats = () =>
    state.vehicles.items.size
      ? deriveVehicleSummaryFromItems()
      : normalizeVehicleSummary(state.vehicles.summary);

  const setVehicleListFilter = (filter) => {
    state.vehicles.listFilter = ['all', 'moving', 'stopped'].includes(String(filter || ''))
      ? String(filter)
      : 'all';
  };

  const getAvailableVehicleTypes = () => {
    const counts = new Map();
    VEHICLE_TYPE_FILTER_OPTIONS.filter((item) => item.key !== 'all').forEach((item) => {
      counts.set(item.key, { key: item.key, label: item.label, count: 0 });
    });
    Array.from(state.vehicles.items.values()).forEach((vehicle) => {
      if (!(vehicle && isEntityInSelectedBranch(vehicle.branch_id))) {
        return;
      }
      const key = getVehicleTypeKey(vehicle);
      if (!counts.has(key)) {
        return;
      }
      const current = counts.get(key);
      current.count += 1;
    });
    const totalCount = Array.from(state.vehicles.items.values()).filter(
      (vehicle) => vehicle && isEntityInSelectedBranch(vehicle.branch_id)
    ).length;
    return [
      { key: 'all', label: 'Semua Kendaraan', count: totalCount },
      ...VEHICLE_TYPE_FILTER_OPTIONS.filter((item) => item.key !== 'all').map(
        (item) => counts.get(item.key) || { key: item.key, label: item.label, count: 0 }
      ),
    ];
  };

  const syncVehicleControlButtonState = () => {
    if (!vehicleControlBtn) {
      return;
    }
    const availableTypes = getAvailableVehicleTypes();
    const specificTypes = availableTypes.filter((typeItem) => typeItem.key !== 'all');
    const visibleCount = specificTypes.filter((typeItem) => !state.vehicles.hiddenTypeKeys.has(typeItem.key)).length;
    vehicleControlBtn.textContent =
      !specificTypes.length || visibleCount === specificTypes.length
        ? 'Kendaraan'
        : `Kendaraan ${visibleCount}/${specificTypes.length}`;
    vehicleControlBtn.classList.toggle('is-active', visibleCount > 0);
    vehicleControlBtn.setAttribute(
      'aria-expanded',
      vehicleControlPopup && !vehicleControlPopup.classList.contains('hidden') ? 'true' : 'false'
    );
  };

  const renderVehicleTypeToggleControls = () => {
    if (!vehicleTypeToggleListEl) {
      return;
    }
    const vehicleTypes = getAvailableVehicleTypes();
    if (!vehicleTypes.length) {
      vehicleTypeToggleListEl.innerHTML =
        '<div class="asset-filter-option asset-filter-option--empty">Belum ada data kendaraan.</div>';
      syncVehicleControlButtonState();
      return;
    }
    const areAllSpecificTypesVisible = areAllSpecificVehicleTypesVisible();
    vehicleTypeToggleListEl.innerHTML = vehicleTypes
      .map(
        (typeItem) => `
          <label class="asset-filter-option" title="Tampilkan tipe kendaraan ${escapeHtml(typeItem.label)}">
            <input type="checkbox" data-vehicle-type-toggle="${escapeHtml(typeItem.key)}" ${
              typeItem.key === 'all'
                ? areAllSpecificTypesVisible
                  ? 'checked'
                  : ''
                : state.vehicles.hiddenTypeKeys.has(typeItem.key)
                  ? ''
                  : 'checked'
            } />
            <span>${escapeHtml(typeItem.label)} (${typeItem.count})</span>
          </label>
        `
      )
      .join('');
    syncVehicleControlButtonState();
  };

  const renderVehicleSummaryCards = () => {
    if (!vehicleSummaryCardsEl) {
      return;
    }
    const vehicleSummary = getVehicleSummaryStats();
    vehicleSummaryCardsEl.classList.add('hidden');
    [vehicleSummaryTotalBtn, vehicleSummaryMovingBtn, vehicleSummaryAnomalyBtn].forEach((button) => {
      if (!button) {
        return;
      }
      button.classList.toggle(
        'is-active',
        button.getAttribute('data-vehicle-summary-filter') === state.vehicles.listFilter
      );
    });
    setText(vehicleSummaryTotalEl, vehicleSummary.total);
    setText(vehicleSummaryGpsEl, `GPS aktif ${vehicleSummary.online}`);
    setText(vehicleSummaryMovingEl, vehicleSummary.moving);
    setText(vehicleSummaryMovementEl, `Berhenti ${vehicleSummary.stopped} \u2022 Diam ${vehicleSummary.idle}`);
    setText(vehicleSummaryAnomaliesEl, vehicleSummary.anomalies);
    setText(
      vehicleSummaryFreshnessEl,
      `Terlambat ${vehicleSummary.delayed} \u2022 Lama ${vehicleSummary.stale} \u2022 Offline ${vehicleSummary.offline}`
    );
  };

  const renderVehicleFilterControls = () => {
    if (!sosVehicleFiltersEl) {
      return;
    }
    const visibleTypeRows = Array.from(state.vehicles.items.values()).filter(
      (vehicle) => vehicle && isEntityInSelectedBranch(vehicle.branch_id) && isVehicleTypeVisible(vehicle)
    );
    const countsByFilter = {
      all: visibleTypeRows.length,
      moving: visibleTypeRows.filter((vehicle) => vehicle.movement_status === 'moving').length,
      stopped: visibleTypeRows.filter((vehicle) => vehicle.movement_status === 'stopped').length,
    };
    sosVehicleFiltersEl.innerHTML = ['all', 'moving', 'stopped']
      .map((filter) => {
        const isActive = state.vehicles.listFilter === filter;
        return `<button type="button" class="sos-incident-filter-chip ${isActive ? 'is-active' : ''}" data-vehicle-filter="${filter}" aria-pressed="${isActive ? 'true' : 'false'}">${escapeHtml(
          getVehicleSummaryButtonLabel(filter)
        )} (${countsByFilter[filter] || 0})</button>`;
      })
      .join('');
  };

  const renderVehiclePanel = () => {
    if (sosVehiclePanelEyebrowEl) {
      setText(sosVehiclePanelEyebrowEl, 'Kendaraan Live');
    }
    if (sosVehiclePanelTitleEl) {
      setText(sosVehiclePanelTitleEl, 'Daftar Kendaraan');
    }
    renderVehicleFilterControls();
    const visibleVehicles = getVisibleVehicleItems();
    if (sosVehicleCountBadgeEl) {
      setText(sosVehicleCountBadgeEl, `${visibleVehicles.length || 0} unit`);
    }
    if (!sosVehicleListEl) {
      return;
    }
    if (!visibleVehicles.length) {
      sosVehicleListEl.innerHTML =
        '<div class="vehicle-list-empty">Belum ada kendaraan untuk filter ini.</div>';
      return;
    }
    const panelVehicles = getVehiclePanelItems(visibleVehicles);
    const isTrimmed = panelVehicles.length < visibleVehicles.length;
    sosVehicleListEl.innerHTML = [
      isTrimmed
        ? `<div class="vehicle-list-empty">Menampilkan ${panelVehicles.length} dari ${visibleVehicles.length} kendaraan untuk menjaga performa pada mode Semua Branch.</div>`
        : '',
      ...panelVehicles
      .map((vehicle) => {
        const gpsTone = getVehicleGpsTone(vehicle);
        const isDisabled = !vehicle.latLng;
        return `
          <article class="vehicle-list-item ${
            Number(state.vehicles.selectedVehicleId) === Number(vehicle.vehicle_id) ? 'is-selected' : ''
          } ${isDisabled ? 'is-disabled' : ''}" data-entity-type="vehicle" data-vehicle-id="${vehicle.vehicle_id}" ${
            isDisabled ? 'data-incident-disabled="true"' : 'tabindex="0" role="button"'
          }>
            <div class="vehicle-list-item__top">
              <div class="vehicle-list-item__title" title="${escapeHtml(vehicle.label || `Kendaraan ${vehicle.vehicle_id}`)}">${escapeHtml(vehicle.label || `Kendaraan ${vehicle.vehicle_id}`)}</div>
              <span class="vehicle-list-item__gps-pill ${gpsTone}">${escapeHtml(getVehicleGpsLabel(vehicle.gps_status))}</span>
            </div>
            <div class="vehicle-list-item__divider"></div>
            <div class="vehicle-list-item__metrics">
              <div class="vehicle-list-item__metric">
                <div class="vehicle-list-item__metric-label">Status</div>
                <div class="vehicle-list-item__metric-value">${escapeHtml(getVehicleMovementLabel(vehicle.movement_status))}</div>
              </div>
              <div class="vehicle-list-item__metric">
                <div class="vehicle-list-item__metric-label">Kecepatan</div>
                <div class="vehicle-list-item__metric-value">${escapeHtml(formatSpeedKmh(vehicle.speed))}</div>
              </div>
              <div class="vehicle-list-item__metric">
                <div class="vehicle-list-item__metric-label">Node</div>
                <div class="vehicle-list-item__metric-value" title="${escapeHtml(vehicle.node || '-')}">${escapeHtml(vehicle.node || '-')}</div>
              </div>
            </div>
          </article>
        `;
      })
    ].join('');
  };

  const flushVehicleUiRefresh = () => {
    if (state.vehicles.refreshTimer) {
      clearTimeout(state.vehicles.refreshTimer);
      state.vehicles.refreshTimer = null;
    }
    renderAssetToolbar();
    renderVehicleTypeToggleControls();
    renderVehiclePanel();
    syncVehicleMarkers();
    syncSelectedMarkerLabelOverlay();
    if (state.vehicles.refreshDetailPending || state.ui.selectedEntityType === 'vehicle') {
      renderDetailPanel();
    }
    state.vehicles.refreshDetailPending = false;
  };

  const scheduleVehicleUiRefresh = (options = {}) => {
    state.vehicles.refreshDetailPending =
      state.vehicles.refreshDetailPending || options.includeDetail === true;
    if (state.vehicles.refreshTimer) {
      return;
    }
    const delay = isAllBranchesSelected()
      ? VEHICLE_UI_REFRESH_DEBOUNCE_ALL_BRANCH_MS
      : VEHICLE_UI_REFRESH_DEBOUNCE_MS;
    state.vehicles.refreshTimer = window.setTimeout(() => {
      flushVehicleUiRefresh();
    }, delay);
  };

  const selectVehicle = (vehicleId, options = {}) => {
    const vehicle = state.vehicles.items.get(Number(vehicleId));
    if (!vehicle) {
      return;
    }
    state.vehicles.selectedVehicleId = vehicle.vehicle_id;
    state.selectedSosId = null;
    state.incidents.selectedSosId = null;
    state.gateAlerts.selectedGateId = null;
    state.standaloneAssets.selectedAssetKey = null;
    state.cctvSelectedCameraId = '';
    state.weather.selectedWeatherId = null;
    state.networkArcs.selectedEdgeKey = null;
    state.ui.selectedEntityType = 'vehicle';
    state.ui.selectedEntityId = String(vehicle.vehicle_id);
    if (vehicle.renderLatLng || vehicle.latLng) {
      setLockedMarkerLabel(createMarkerLabelRef('vehicle', vehicle.vehicle_id, { latLng: vehicle.renderLatLng || vehicle.latLng }));
      if (options.focus !== false && vehicle.latLng) {
        focusEntityOnMap(vehicle.latLng, MAP_ZOOM_SOS);
      }
    } else {
      clearMarkerLabelState({ preserveSosLocked: false });
    }
    renderAll();
  };

  const focusVehicleSelection = async (vehicleId, options = {}) => {
    const normalizedVehicleId = Number(vehicleId);
    if (!Number.isFinite(normalizedVehicleId)) {
      return;
    }
    if (!state.vehicles.items.has(normalizedVehicleId)) {
      try {
        await loadVehicleDetail(normalizedVehicleId, { force: true });
      } catch (_) {
        return;
      }
    }
    const vehicle = state.vehicles.items.get(normalizedVehicleId) || null;
    if (!vehicle) {
      return;
    }
    state.vehicles.selectedVehicleId = normalizedVehicleId;
    const focusLatLng = vehicle.latLng || vehicle.renderLatLng || null;
    if (options.focus !== false && focusLatLng) {
      focusEntityOnMap(focusLatLng, MAP_ZOOM_VEHICLE_FOCUS);
    }
    renderAll();
    void loadVehicleDetail(normalizedVehicleId).then(() => renderDetailPanel()).catch(() => {});
  };
  const upsertVehicleLive = (vehicle, options = {}) => {
    const normalized =
      vehicle && typeof vehicle === 'object' && Number.isFinite(Number(vehicle.vehicle_id))
        ? normalizeVehicleLive(vehicle, state.vehicles.apiBaseUrl)
        : null;
    if (!normalized) {
      return null;
    }
    const existing = state.vehicles.items.get(normalized.vehicle_id) || null;
    const nextLatLng = normalized.latLng || (existing && existing.latLng) || null;
    const renderLatLng =
      options.preserveRenderLatLng === false
        ? nextLatLng
        : (existing && existing.renderLatLng) || nextLatLng;
    const merged = {
      ...(existing || {}),
      ...normalized,
      latLng: nextLatLng,
      renderLatLng: renderLatLng ? { ...renderLatLng } : null,
      lastPositionAt:
        normalized.latLng &&
        existing &&
        existing.latLng &&
        (Number(existing.latLng.lat) !== Number(normalized.latLng.lat) ||
          Number(existing.latLng.lng) !== Number(normalized.latLng.lng))
          ? Date.now()
          : (existing && existing.lastPositionAt) || Date.now(),
    };
    state.vehicles.items.set(merged.vehicle_id, merged);
    return merged;
  };

  const clearVehicleDetailCache = (vehicleId = null) => {
    if (vehicleId === null || vehicleId === undefined || vehicleId === '') {
      state.vehicles.details.clear();
      return;
    }
    state.vehicles.details.delete(Number(vehicleId));
  };

  const clearVehicleMarkers = () => {
    state.vehicles.markers.forEach((entry) => {
      if (entry && entry.animationFrame) {
        window.cancelAnimationFrame(entry.animationFrame);
      }
      if (entry && entry.marker) {
        entry.marker.setMap(null);
      }
    });
    state.vehicles.markers.clear();
  };

  const loadVehiclesLive = async () => {
    const response = await window.cameraService.getVehiclesLive();
    if (!response || response.status >= 400) {
      throw new Error((response && response.message) || 'Gagal memuat kendaraan live.');
    }
    const rows = unwrapCollection(response.data);
    const nextItems = new Map();
    rows.forEach((item) => {
      const normalized = normalizeVehicleLive(item, state.vehicles.apiBaseUrl);
      if (!normalized || !isEntityInSelectedBranch(normalized.branch_id)) {
        return;
      }
      const existing = state.vehicles.items.get(normalized.vehicle_id) || null;
      nextItems.set(normalized.vehicle_id, {
        ...(existing || {}),
        ...normalized,
        renderLatLng: (existing && existing.renderLatLng) || normalized.latLng,
      });
    });
    state.vehicles.items = nextItems;
    state.vehicles.lastRefreshAt = Date.now();
    reconcileSelectedVehicle();
    return Array.from(nextItems.values());
  };

  const loadVehiclesSummary = async () => {
    const response = await window.cameraService.getVehiclesSummary();
    if (!response || response.status >= 400) {
      throw new Error((response && response.message) || 'Gagal memuat ringkasan kendaraan.');
    }
    state.vehicles.summary = normalizeVehicleSummary(unwrapSingle(response.data));
    return state.vehicles.summary;
  };

  const loadVehicleDetail = async (vehicleId, options = {}) => {
    const normalizedVehicleId = Number(vehicleId);
    if (!Number.isFinite(normalizedVehicleId)) {
      return null;
    }
    if (!options.force && state.vehicles.details.has(normalizedVehicleId)) {
      return state.vehicles.details.get(normalizedVehicleId) || null;
    }
    const response = await window.cameraService.getVehicleDetail(normalizedVehicleId);
    if (!response || response.status >= 400) {
      throw new Error((response && response.message) || 'Gagal memuat detail kendaraan.');
    }
    const detail = normalizeVehicleLive(unwrapSingle(response.data), state.vehicles.apiBaseUrl);
    if (!detail) {
      return null;
    }
    state.vehicles.details.set(normalizedVehicleId, detail);
    upsertVehicleLive(detail);
    return detail;
  };

  const focusVehicleOnMap = (vehicle) => {
    if (!(vehicle && vehicle.latLng)) {
      return;
    }
    focusEntityOnMap(vehicle.latLng, MAP_ZOOM_SOS);
  };

  const startVehicleFallbackLoop = () => {
    if (state.vehicleFallbackTimer) {
      return;
    }
    state.vehicleFallbackTimer = window.setInterval(() => {
      if (!state.isActive) {
        return;
      }
      void Promise.allSettled([loadVehiclesLive(), loadVehiclesSummary()]).then(() => {
        renderAll();
      });
    }, SOS_TICKET_REFRESH_MS);
  };

  const stopVehicleFallbackLoop = () => {
    if (state.vehicleFallbackTimer) {
      clearInterval(state.vehicleFallbackTimer);
      state.vehicleFallbackTimer = null;
    }
  };

  const syncVehicleMarkers = () => {
    if (!state.map || !window.google || !window.google.maps) {
      return;
    }
    if (shouldUseVehicleClusterMode()) {
      clearVehicleOverlayMarkers();
      void syncVehicleClusterMarkers();
      return;
    }
    clearVehicleClusterMarkers();
    const VehicleMarkerCtor = getVehicleMarkerClass();
    const visibleVehicles = getVisibleVehicleItems();
    const bounds = state.map && typeof state.map.getBounds === 'function' ? state.map.getBounds() : null;
    const shouldCull = isAllBranchesSelected() || visibleVehicles.length > 60;
    const renderLimit = getVehicleMarkerRenderLimit();
    const candidateVehicles = [];

    visibleVehicles.forEach((vehicle) => {
      if (!(vehicle && vehicle.latLng)) {
        return;
      }
      if (
        shouldCull &&
        bounds &&
        typeof bounds.contains === 'function' &&
        !bounds.contains(new window.google.maps.LatLng(vehicle.latLng.lat, vehicle.latLng.lng))
      ) {
        return;
      }
      candidateVehicles.push(vehicle);
    });

    const prioritizedVehicles =
      Number.isFinite(renderLimit) && candidateVehicles.length > renderLimit
        ? candidateVehicles
            .slice()
            .sort((a, b) => getVehicleMarkerPriority(b) - getVehicleMarkerPriority(a))
            .slice(0, renderLimit)
        : candidateVehicles;
    const visibleIds = new Set(prioritizedVehicles.map((vehicle) => Number(vehicle.vehicle_id)));

    prioritizedVehicles.forEach((vehicle) => {
      let entry = state.vehicles.markers.get(vehicle.vehicle_id) || null;
      if (!entry) {
        const marker = new VehicleMarkerCtor({
          map: state.map,
          vehicle,
          onSelect: (vehicleId) => {
            selectVehicle(vehicleId, { focus: false });
            void loadVehicleDetail(vehicleId).then(() => renderDetailPanel()).catch(() => {});
          },
        });
        entry = {
          vehicle,
          marker,
          animationFrame: null,
          previousBackendAt: 0,
          lastBackendAt: Date.now(),
          lastBackendPerfAt: performance.now(),
          lastBackendLatLng: vehicle.latLng ? { ...vehicle.latLng } : null,
          correctionOriginLatLng: null,
          correctionStartedAt: 0,
          correctionUntil: 0,
          lastKnownSpeed: Number.isFinite(Number(vehicle.speed)) ? Number(vehicle.speed) : null,
          lastKnownBearing: Number.isFinite(Number(vehicle.bearing)) ? Number(vehicle.bearing) : null,
          iconUrl: '',
          currentLatLng: vehicle.renderLatLng || vehicle.latLng,
          targetKey: '',
        };
        state.vehicles.markers.set(vehicle.vehicle_id, entry);
      }

      const iconUrl = vehicle.vehicle_type_icon_url || createVehicleFallbackIconDataUrl();
      entry.vehicle = vehicle;
      if (entry.iconUrl !== iconUrl) {
        entry.iconUrl = iconUrl;
        entry.marker.setIcon({
          url: iconUrl,
          scaledSize: new window.google.maps.Size(40, 40),
        });
      }
      if (typeof entry.marker.update === 'function') {
        entry.marker.update(vehicle);
      }
      entry.marker.setTitle(vehicle.label || `Kendaraan ${vehicle.vehicle_id}`);
      if (typeof entry.marker.setClickable === 'function') {
        entry.marker.setClickable(isVehicleMarkerInteractive(vehicle));
      }
      entry.marker.setZIndex(
        getVehicleMarkerZIndex(
          Number(state.vehicles.selectedVehicleId) === Number(vehicle.vehicle_id)
        )
      );
      if (!entry.marker.getMap()) {
        entry.marker.setMap(state.map);
      }
      const nextLatLng = vehicle.latLng;
      const nextTargetKey = nextLatLng ? `${nextLatLng.lat}:${nextLatLng.lng}` : '';
      if (entry.targetKey === nextTargetKey) {
        entry.lastKnownSpeed = Number.isFinite(Number(vehicle.speed)) ? Number(vehicle.speed) : null;
        entry.lastKnownBearing = Number.isFinite(Number(vehicle.bearing)) ? Number(vehicle.bearing) : null;
        if (isAllBranchesSelected()) {
          stopVehicleMotion(entry);
          if (nextLatLng) {
            updateVehicleMarkerVisualPosition(entry, vehicle, nextLatLng);
          } else if (vehicle.renderLatLng) {
            updateVehicleMarkerVisualPosition(entry, vehicle, vehicle.renderLatLng);
          }
        } else if (isVehiclePredictionEligible(vehicle)) {
          ensureVehicleMotion(entry, vehicle);
        } else {
          stopVehicleMotion(entry);
          if (nextLatLng) {
            updateVehicleMarkerVisualPosition(entry, vehicle, nextLatLng);
          } else if (vehicle.renderLatLng) {
            updateVehicleMarkerVisualPosition(entry, vehicle, vehicle.renderLatLng);
          }
        }
        return;
      }
      const motionNow = performance.now();
      const displayLatLng =
        getVehicleMotionDisplayLatLng(entry, vehicle, motionNow) ||
        normalizeLatLngLiteral(vehicle.renderLatLng) ||
        normalizeLatLngLiteral(entry.currentLatLng) ||
        normalizeLatLngLiteral(nextLatLng);
      entry.previousBackendAt = Number(entry.lastBackendAt || 0);
      entry.lastBackendAt = Date.now();
      entry.lastBackendPerfAt = motionNow;
      entry.lastBackendLatLng = nextLatLng ? { ...nextLatLng } : null;
      entry.lastKnownSpeed = Number.isFinite(Number(vehicle.speed)) ? Number(vehicle.speed) : null;
      entry.lastKnownBearing = Number.isFinite(Number(vehicle.bearing)) ? Number(vehicle.bearing) : null;
      entry.targetKey = nextTargetKey;

      if (!displayLatLng || !nextLatLng) {
        stopVehicleMotion(entry);
        if (nextLatLng) {
          updateVehicleMarkerVisualPosition(entry, vehicle, nextLatLng);
          if (!isAllBranchesSelected() && isVehiclePredictionEligible(vehicle)) {
            ensureVehicleMotion(entry, vehicle);
          }
        }
        return;
      }
      const distance = haversineDistanceMeters(displayLatLng, nextLatLng);
      if (
        isAllBranchesSelected() ||
        !isVehiclePredictionEligible(vehicle) ||
        distance > VEHICLE_INTERPOLATION_SNAP_DISTANCE_METERS ||
        distance > VEHICLE_PREDICTION_CORRECTION_SNAP_METERS * 2
      ) {
        stopVehicleMotion(entry);
        updateVehicleMarkerVisualPosition(entry, vehicle, nextLatLng);
        if (!isAllBranchesSelected() && isVehiclePredictionEligible(vehicle)) {
          ensureVehicleMotion(entry, vehicle);
        }
        return;
      }
      entry.correctionOriginLatLng = displayLatLng;
      entry.correctionStartedAt = motionNow;
      entry.correctionUntil = motionNow + getVehicleCorrectionDurationMs(entry, distance);
      updateVehicleMarkerVisualPosition(entry, vehicle, displayLatLng);
      ensureVehicleMotion(entry, vehicle);
    });

    Array.from(state.vehicles.markers.entries()).forEach(([vehicleId, entry]) => {
      if (visibleIds.has(Number(vehicleId))) {
        return;
      }
      stopVehicleMotion(entry);
      if (entry && entry.marker) {
        entry.marker.setMap(null);
      }
      state.vehicles.markers.delete(Number(vehicleId));
    });
  };

  const applyVehiclePatch = async (payload) => {
    const normalized = normalizeVehicleLive(payload, state.vehicles.apiBaseUrl);
    if (!normalized) {
      return;
    }
    if (!isEntityInSelectedBranch(normalized.branch_id)) {
      state.vehicles.items.delete(normalized.vehicle_id);
      state.vehicles.details.delete(normalized.vehicle_id);
      scheduleVehicleUiRefresh({ includeDetail: Number(state.vehicles.selectedVehicleId) === Number(normalized.vehicle_id) });
      return;
    }
    upsertVehicleLive(normalized);
    state.vehicles.lastSnapshotAt = Date.now();
    if (Number(state.vehicles.selectedVehicleId) === Number(normalized.vehicle_id)) {
      state.vehicles.details.set(normalized.vehicle_id, {
        ...(state.vehicles.details.get(normalized.vehicle_id) || {}),
          ...normalized,
      });
      scheduleVehicleUiRefresh({ includeDetail: true });
      return;
    }
    scheduleVehicleUiRefresh();
  };

  const renderSummary = () => {
    if (sosPanelEyebrowEl) {
      setText(sosPanelEyebrowEl, 'Monitoring Aktif');
    }
    if (sosPanelTitleEl) {
      setText(sosPanelTitleEl, 'Daftar Kejadian');
    }
    const gateAlertCount = Array.from(state.gateAlerts.items.values()).filter(
      (gate) => gate && gate.showInSummary !== false && (gate.status === 'error' || gate.status === 'warning')
    ).length;
    const totalItems =
      getVisibleAlerts().length +
      gateAlertCount +
      Array.from(state.standaloneAssets.items.values()).filter(
        (item) =>
          item &&
          item.showInSummary !== false &&
          isAssetIssueStatus(item.status) &&
          isStandaloneAssetTypeVisible(item)
      ).length +
      (isWeatherLayerActive() && isIncidentFilterEnabled('weather') ? state.weather.items.length : 0);
    const arcCount =
      state.networkArcs.visible && Array.isArray(state.networkArcs.items)
        ? state.networkArcs.items.length
        : 0;
    setText(sosOpenCountBadgeEl, `${totalItems} item${arcCount ? ` \u2022 ${arcCount} arc` : ''}`);
  };

  const renderBranchOptions = () => {
    if (!sosBranchControlOptionsEl || !sosBranchControlLabelEl) {
      return;
    }
    const branches = Array.isArray(state.mapContext.availableBranches) ? state.mapContext.availableBranches : [];
    const includeAllBranches = canViewAllBranches();
    const selectedBranch = getSelectedBranch();
    const selectedId = selectedBranch && selectedBranch.id ? String(selectedBranch.id) : '';
    const selectedLabel = isAllBranchesSelected()
      ? 'Semua Branch'
      : selectedBranch
        ? selectedBranch.branch_name || selectedBranch.branch_code || selectedBranch.id
        : 'Pilih Branch';
    setText(sosBranchControlLabelEl, selectedLabel);
    sosBranchControlOptionsEl.innerHTML = [
      ...(includeAllBranches
        ? [
            `<button type="button" class="asset-filter-option asset-map-topbar__branch-option ${selectedId === ALL_BRANCHES_OPTION ? 'is-selected' : ''}" data-branch-option="${ALL_BRANCHES_OPTION}" role="menuitemradio" aria-checked="${selectedId === ALL_BRANCHES_OPTION ? 'true' : 'false'}"><span>Semua Branch</span></button>`,
          ]
        : []),
      ...branches.map((branch) => {
        const branchId = String(branch.id);
        const branchLabel = branch.branch_name || branch.branch_code || branch.id;
        return `<button type="button" class="asset-filter-option asset-map-topbar__branch-option ${branchId === selectedId ? 'is-selected' : ''}" data-branch-option="${escapeHtml(branchId)}" role="menuitemradio" aria-checked="${branchId === selectedId ? 'true' : 'false'}"><span>${escapeHtml(branchLabel)}</span></button>`;
      }),
    ].join('');
    syncBranchControlButtonState();
  };

  const applySelectedMonitoringBranch = (nextBranchId) => {
    if (nextBranchId === ALL_BRANCHES_OPTION && !canViewAllBranches()) {
      setConnectionBadge('Akun ini tidak memiliki akses semua branch.', 'warning');
      return;
    }
    debugLog('branchSelect:change', {
      previousBranchId:
        state.mapContext.selectedBranch && state.mapContext.selectedBranch.id
          ? String(state.mapContext.selectedBranch.id)
          : '',
      nextBranchId,
    });
    state.mapContext.selectedBranch =
      nextBranchId === ALL_BRANCHES_OPTION
        ? {
            id: ALL_BRANCHES_OPTION,
            branch_name: 'Semua Branch',
            branch_code: 'ALL',
          }
        : state.mapContext.availableBranches.find((branch) => String(branch.id) === nextBranchId) || null;
    if (nextBranchId === ALL_BRANCHES_OPTION) {
      state.weather.visible = false;
    }
    resetIncidentListAnimationState();
    resetStandaloneLayerState();
    resetNetworkLayerState();
    renderBranchOptions();
    void persistAssetMonitoringPrefs();
    void refreshDashboard().catch((error) => {
      setConnectionBadge(error.message || 'Gagal mengganti branch monitoring.', 'danger');
    });
  };

  const renderAssetToolbar = () => {
    if (!state.isActive) {
      return;
    }
    syncWeatherToggleState();
    syncAssetFilterButtonState();
    syncFoControlButtonState();
    syncWeatherControlButtonState();
    syncVehicleControlButtonState();
    syncBranchControlButtonState();
    const selectedBranch = getSelectedBranch();
    const branchLabel = isAllBranchesSelected()
      ? 'Semua Branch'
      : selectedBranch
        ? selectedBranch.branch_name || selectedBranch.branch_code || selectedBranch.id
        : 'Tanpa branch';
    const visibleVehicleCount = Array.from(state.vehicles.items.values()).filter(
      (vehicle) => vehicle && isEntityInSelectedBranch(vehicle.branch_id) && isVehicleTypeVisible(vehicle)
    ).length;
    const weatherSummary = getWeatherSummaryLabel();
    if (assetMapSubtitleEl) {
      setText(
        assetMapSubtitleEl,
        `Branch aktif: ${branchLabel} \u2022 ${visibleVehicleCount} kendaraan \u2022 ${getNetworkSummaryLabel()}${weatherSummary ? ` \u2022 ${weatherSummary}` : ''}`
      );
    }
  };

  const replayDetailPanelAnimation = () => {
    if (!sosDetailPanelEl) {
      return;
    }
    sosDetailPanelEl.classList.remove('is-revealing');
    void sosDetailPanelEl.offsetWidth;
    sosDetailPanelEl.classList.add('is-revealing');
  };

  const renderIncidentList = () => {
    syncIncidentFilterControls();
    const currentEntries = getVisibleIncidentEntries();
    const currentEntriesMap = new Map(currentEntries.map((entry) => [entry.key, entry]));
    reconcileIncidentListAnimations(currentEntriesMap);
    const animationState = getIncidentAnimationState();
    const combinedEntries = [
      ...currentEntries,
      ...Array.from(animationState.leavingItems.values()).filter((entry) => !currentEntriesMap.has(entry.key)),
    ].sort(compareIncidentEntries);

    if (!combinedEntries.length) {
      sosIncidentListEl.innerHTML =
        `<div class="sos-incident-item sos-incident-item--empty">${
          INCIDENT_FILTER_KEYS.some((key) => isIncidentFilterEnabled(key))
            ? 'Belum ada ringkasan monitoring untuk branch ini.'
            : 'Semua kategori filter sedang dimatikan.'
        }</div>`;
      return;
    }
    sosIncidentListEl.innerHTML = INCIDENT_GROUP_ORDER.map((group) => {
      const items = combinedEntries
        .filter((entry) => entry.group === group)
        .map((entry, index) =>
          renderIncidentEntry(entry, {
            isEntering: animationState.enteringKeys.has(entry.key),
            isLeaving: animationState.leavingItems.has(entry.key),
            order: index,
          })
        )
        .join('');
      if (!items) {
        return '';
      }
      const title =
        group === 'sos'
          ? 'SOS'
          : group === 'gate'
            ? 'Gate Alert Summary'
            : group === 'asset'
              ? 'Asset Offline Summary'
              : 'Weather';
      return `<section class="sos-incident-group"><div class="sos-incident-group__title">${title}</div>${items}</section>`;
    })
      .filter(Boolean)
      .join('');
    sosIncidentListEl.querySelectorAll('.sos-weather-incident__icon-img').forEach((img) => {
      img.addEventListener(
        'error',
        () => {
          const fallbackSrc = img.getAttribute('data-fallback-src') || WEATHER_FALLBACK_ICON_URL;
          img.src = fallbackSrc;
        },
        { once: true }
      );
    });
  };

  const renderDetailPanel = () => {
    if (state.ui.selectedEntityType !== 'gate' || !state.gateAlerts.selectedGateId) {
      stopGateDetailDurationTimer();
    }
    if (state.ui.selectedEntityType === 'vehicle' && state.vehicles.selectedVehicleId) {
      const baseVehicle =
        state.vehicles.details.get(Number(state.vehicles.selectedVehicleId)) ||
        state.vehicles.items.get(Number(state.vehicles.selectedVehicleId)) ||
        null;
      if (baseVehicle) {
        const detailKey = JSON.stringify({
          type: 'vehicle',
          vehicleId: baseVehicle.vehicle_id,
          gpsStatus: baseVehicle.gps_status,
          movementStatus: baseVehicle.movement_status,
          speed: baseVehicle.speed,
          bearing: baseVehicle.bearing,
          gpsTime: baseVehicle.gps_time,
          branchId: baseVehicle.branch_id,
          lat: baseVehicle.latitude,
          lng: baseVehicle.longitude,
        });
        if (state.detailRenderKey !== detailKey || sosDetailPanelEl.classList.contains('hidden')) {
          state.detailRenderKey = detailKey;
          setText(sosDetailTitleEl, baseVehicle.label || `Kendaraan ${baseVehicle.vehicle_id}`);
          setClass(sosDetailStatusEl, `status-pill ${getVehicleGpsTone(baseVehicle)}`);
          setText(sosDetailStatusEl, getVehicleGpsLabel(baseVehicle.gps_status));
          sosDetailMetaEl.classList.remove('hidden');
          sosDetailMetaEl.innerHTML = `
            <div class="sos-detail-hero">
              <div class="sos-detail-hero__name">${escapeHtml(baseVehicle.label || `Kendaraan ${baseVehicle.vehicle_id}`)}</div>
              <div class="sos-detail-hero__support">
                <span class="meta-pill">${escapeHtml(getVehicleMovementLabel(baseVehicle.movement_status).toUpperCase())}</span>
                <span class="meta-pill">${escapeHtml(getVehicleTypeLabel(baseVehicle).toUpperCase())}</span>
                ${baseVehicle.has_branch_anomaly ? '<span class="meta-pill">ANOMALI</span>' : ''}
              </div>
            </div>
          `;
          sosDetailBodyEl.innerHTML = `
            <div class="sos-detail-body__grid">
              <div><span class="sos-detail-label">Ruas</span><strong>${escapeHtml(baseVehicle.branch_name || baseVehicle.branch_code || '-')}</strong></div>
              <div><span class="sos-detail-label">Node</span><strong>${escapeHtml(baseVehicle.node || '-')}</strong></div>
              <div><span class="sos-detail-label">Status</span><strong>${escapeHtml(getVehicleMovementLabel(baseVehicle.movement_status))}</strong></div>
              <div><span class="sos-detail-label">Kecepatan</span><strong>${escapeHtml(formatSpeedKmh(baseVehicle.speed))}</strong></div>
              <div><span class="sos-detail-label">Arah</span><strong>${escapeHtml(formatBearing(baseVehicle.bearing))}</strong></div>
              <div><span class="sos-detail-label">Waktu GPS</span><strong>${escapeHtml(toDateTimeWithSeconds(baseVehicle.gps_time || baseVehicle.received_at || '-'))}</strong></div>
              <div><span class="sos-detail-label">Latitude</span><strong>${escapeHtml(baseVehicle.latitude !== null ? String(baseVehicle.latitude) : '-')}</strong></div>
              <div><span class="sos-detail-label">Longitude</span><strong>${escapeHtml(baseVehicle.longitude !== null ? String(baseVehicle.longitude) : '-')}</strong></div>
            </div>
          `;
          sosDetailPanelEl.classList.remove('hidden');
          sosDetailPanelEl.classList.add('is-visible');
          replayDetailPanelAnimation();
        }
        applySosActionButtonState(null);
      }
    }
    if (state.ui.selectedEntityType === 'gate' && state.gateAlerts.selectedGateId) {
      const gateDetail = state.gateAlerts.details.get(String(state.gateAlerts.selectedGateId));
      if (gateDetail) {
        applySosActionButtonState(null);
        return;
      }
    }
    if (state.ui.selectedEntityType === 'network' && state.networkArcs.selectedEdgeKey) {
      const networkEdge = state.networkArcs.items.find(
        (entry) => entry && entry.edgeKey === state.networkArcs.selectedEdgeKey
      );
      if (networkEdge) {
        const detailKey = JSON.stringify({
          type: 'network',
          edgeKey: networkEdge.edgeKey,
          status: networkEdge.status,
          sourceName: networkEdge.source && networkEdge.source.node_name,
          targetName: networkEdge.target && networkEdge.target.node_name,
        });
        if (state.detailRenderKey !== detailKey || sosDetailPanelEl.classList.contains('hidden')) {
          state.detailRenderKey = detailKey;
          setText(sosDetailTitleEl, networkEdge.edge_name || networkEdge.edge_code || 'Fiber Network');
          setClass(sosDetailStatusEl, `status-pill ${getNetworkStatusTone(networkEdge.status)}`);
          setText(sosDetailStatusEl, String(networkEdge.status || 'normal').toUpperCase());
          sosDetailMetaEl.classList.remove('hidden');
          sosDetailMetaEl.innerHTML = `
            <div class="sos-detail-hero">
              <div class="sos-detail-hero__name">${escapeHtml(
                `${(networkEdge.source && networkEdge.source.node_name) || 'Source'} \u2192 ${(networkEdge.target && networkEdge.target.node_name) || 'Target'}`
              )}</div>
              <div class="sos-detail-hero__support">
                <span class="meta-pill">${escapeHtml(String(networkEdge.connection_type || 'fiber').toUpperCase())}</span>
                ${networkEdge.isCrossBranch ? '<span class="meta-pill">CROSS BRANCH</span>' : ''}
                ${networkEdge.arc && networkEdge.arc.pulse ? '<span class="meta-pill">PULSE</span>' : ''}
              </div>
            </div>
          `;
          sosDetailBodyEl.innerHTML = `
            <div class="sos-detail-body__grid">
              <div><span class="sos-detail-label">Source</span><strong>${escapeHtml(
                (networkEdge.source && networkEdge.source.node_name) || '-'
              )}</strong></div>
              <div><span class="sos-detail-label">Target</span><strong>${escapeHtml(
                (networkEdge.target && networkEdge.target.node_name) || '-'
              )}</strong></div>
              <div><span class="sos-detail-label">Bandwidth</span><strong>${escapeHtml(networkEdge.bandwidth_label || '-')}</strong></div>
              <div><span class="sos-detail-label">Distance</span><strong>${escapeHtml(
                networkEdge.distance_km !== null ? `${networkEdge.distance_km} km` : '-'
              )}</strong></div>
              <div><span class="sos-detail-label">Source Branch</span><strong>${escapeHtml(
                String((networkEdge.source && networkEdge.source.branch_id) || '-')
              )}</strong></div>
              <div><span class="sos-detail-label">Target Branch</span><strong>${escapeHtml(
                String((networkEdge.target && networkEdge.target.branch_id) || '-')
              )}</strong></div>
            </div>
          `;
          sosDetailPanelEl.classList.remove('hidden');
          sosDetailPanelEl.classList.add('is-visible');
          replayDetailPanelAnimation();
        }
        applySosActionButtonState(null);
        return;
      }
    }
    const alert = getSelectedAlert();
    if (!alert) {
      state.detailRenderKey = '';
      sosDetailPanelEl.classList.remove('is-visible');
      sosDetailPanelEl.classList.add('hidden');
      return;
    }
    const detailKey = JSON.stringify({
      sosId: alert.sos_id,
      status: alert.status,
      ticketNo: alert.ticket && alert.ticket.ticket_no,
      dispatchedAt: alert.ticket && alert.ticket.dispatched_at,
      branch: alert.branch_name,
      createdAt: alert.created_at,
      phone: alert.user && alert.user.phone,
      address: alert.user && alert.user.address,
      primaryCandidate:
        state.smartResponse.selectedResponse &&
        getSmartResponsePrimaryCandidate(
          state.smartResponse.selectedResponse,
          getSmartResponseSummaryForAlert(alert)
        ) &&
        getSmartResponsePrimaryCandidate(
          state.smartResponse.selectedResponse,
          getSmartResponseSummaryForAlert(alert)
        ).vehicle_id,
      pendingArrival:
        state.smartResponse.selectedResponse &&
        getPendingArrivalCandidate(state.smartResponse.selectedResponse) &&
        getPendingArrivalCandidate(state.smartResponse.selectedResponse).vehicle_id,
    });
    if (state.detailRenderKey === detailKey && !sosDetailPanelEl.classList.contains('hidden')) {
      applySosActionButtonState(alert);
      return;
    }
    state.detailRenderKey = detailKey;
    const statusMeta = getStatusMeta(alert.status);
    const responseSummary = getSmartResponseSummaryForAlert(alert);
    const primaryCandidate = getSmartResponsePrimaryCandidate(state.smartResponse.selectedResponse, responseSummary);
    const pendingArrivalCandidate = getPendingArrivalCandidate(state.smartResponse.selectedResponse);
    const rawPhoneNumber = alert.user && alert.user.phone ? String(alert.user.phone) : '';
    const phoneNumber = getDisplayPhoneNumber(rawPhoneNumber) || '-';
    const whatsAppLink = getWhatsAppLink(rawPhoneNumber);
    const locationText = String(alert.user && alert.user.address ? alert.user.address : '-').trim() || '-';
    const dispatchTime =
      alert.ticket && alert.ticket.dispatched_at
        ? formatDispatchDateTime(alert.ticket.dispatched_at)
        : 'Belum dispatch';
    const coordinateText =
      Number.isFinite(Number(alert.latitude)) && Number.isFinite(Number(alert.longitude))
        ? `${String(alert.latitude).trim()} / ${String(alert.longitude).trim()}`
        : '-';
    setText(sosDetailTitleEl, '');
    setClass(sosDetailStatusEl, `status-pill ${statusMeta.tone}`);
    setText(sosDetailStatusEl, statusMeta.label);
    sosDetailMetaEl.classList.remove('hidden');
    sosDetailMetaEl.innerHTML = `
      <div class="sos-incident-summary">
        <div class="sos-incident-summary__ticket">${escapeHtml(
          alert.ticket && alert.ticket.ticket_no ? alert.ticket.ticket_no : `SOS-${alert.sos_id}`
        )}</div>
        <div class="sos-incident-summary__reporter">${escapeHtml(getAlertName(alert))}</div>
        <div class="sos-incident-summary__meta">
          <span class="sos-incident-summary__meta-item"><i class="bi bi-calendar3 sos-inline-icon" aria-hidden="true"></i>${escapeHtml(toDateTime(alert.created_at))}</span>
          <span class="sos-incident-summary__meta-item"><i class="bi bi-telephone sos-inline-icon" aria-hidden="true"></i>${escapeHtml(phoneNumber)}</span>
        </div>
      </div>
    `;
    sosDetailBodyEl.innerHTML = `
      <div class="sos-incident-body">
        <div class="sos-incident-location">
          <span class="sos-detail-label"><i class="bi bi-geo-alt sos-inline-icon" aria-hidden="true"></i>Alamat Pelapor</span>
          <strong>${escapeHtml(locationText)}</strong>
          <span class="sos-incident-location__coords">Koordinat: ${escapeHtml(coordinateText)}</span>
        </div>
        <div class="sos-incident-secondary">
          <div class="sos-incident-secondary__item">
            <span class="sos-detail-label"><i class="bi bi-clock-history sos-inline-icon" aria-hidden="true"></i>Dispatch Time</span>
            <strong>${escapeHtml(dispatchTime)}</strong>
          </div>
          ${
            primaryCandidate
              ? `
          <div class="sos-incident-secondary__item">
            <span class="sos-detail-label">Primary Unit</span>
            <strong>${escapeHtml(primaryCandidate.vehicle_label || '-')}</strong>
          </div>
          `
              : ''
          }
        </div>
        ${
          pendingArrivalCandidate
            ? `
        <div class="sos-incident-contextual-action">
          <div>
            <span class="sos-detail-label">Aksi Kontekstual</span>
            <strong>${escapeHtml((pendingArrivalCandidate.vehicle_label || 'Unit utama') + ' tiba dan menunggu validasi.')}</strong>
          </div>
          <button
            type="button"
            class="toolbar-btn toolbar-btn--accent"
            data-confirm-arrival="${escapeHtml(String(pendingArrivalCandidate.vehicle_id))}"
          >Confirm Arrival</button>
        </div>
        `
            : ''
        }
      </div>
    `;
    if (sosContactReporterBtn) {
      sosContactReporterBtn.dataset.waLink = whatsAppLink || '';
    }
    applySosActionButtonState(alert);
    sosDetailPanelEl.classList.remove('hidden');
    sosDetailPanelEl.classList.add('is-visible');
    replayDetailPanelAnimation();
  };

  const getSelectedSosTicketNo = () => {
    const alert = getSelectedAlert();
    if (!(alert && alert.ticket && alert.ticket.ticket_no)) {
      return '';
    }
    return String(alert.ticket.ticket_no).trim();
  };

  const getSmartResponsePrimaryCandidate = (detail, summary = null) => {
    const candidates = detail && Array.isArray(detail.vehicle_candidates) ? detail.vehicle_candidates : [];
    const byPrimaryFlag = candidates.find((candidate) => candidate && candidate.is_primary);
    if (byPrimaryFlag) {
      return byPrimaryFlag;
    }
    const primaryVehicleId = Number(summary && summary.primary_vehicle_id);
    if (Number.isFinite(primaryVehicleId)) {
      const bySummaryId = candidates.find((candidate) => Number(candidate && candidate.vehicle_id) === primaryVehicleId);
      if (bySummaryId) {
        return bySummaryId;
      }
    }
    return candidates[0] || null;
  };

  const getPendingArrivalCandidate = (detail) => {
    const candidates = detail && Array.isArray(detail.vehicle_candidates) ? detail.vehicle_candidates : [];
    return candidates.find((candidate) => String(candidate && candidate.detection_status || '') === 'ARRIVED_PENDING_CONFIRMATION') || null;
  };

  const setSmartResponseTab = (tabKey) => {
    const normalized = String(tabKey || '').trim().toLowerCase();
    const nextTab = ['summary', 'candidates', 'timeline'].includes(normalized) ? normalized : 'summary';
    if (state.smartResponse.activeTab === nextTab) {
      return;
    }
    state.smartResponse.activeTab = nextTab;
    if (nextTab !== 'timeline') {
      state.smartResponse.timelineExpanded = false;
    }
    renderSmartResponsePanel();
  };

  const toggleSmartResponseCandidate = (vehicleId) => {
    const normalizedVehicleId = Number(vehicleId);
    if (!Number.isFinite(normalizedVehicleId)) {
      return;
    }
    state.smartResponse.expandedCandidateVehicleId =
      Number(state.smartResponse.expandedCandidateVehicleId) === normalizedVehicleId
        ? null
        : normalizedVehicleId;
    renderSmartResponsePanel();
  };

  const loadSelectedSmartResponseDetail = async (ticketNo, options = {}) => {
    const normalizedTicketNo = String(ticketNo || '').trim();
    if (!normalizedTicketNo) {
      state.smartResponse.selectedResponse = null;
      state.smartResponse.selectedResponseLoading = false;
      state.smartResponse.selectedResponseError = '';
      return null;
    }
    const requestKey = `${normalizedTicketNo}:${Date.now()}`;
    state.smartResponse.responseRequestKey = requestKey;
    state.smartResponse.selectedResponseLoading = true;
    state.smartResponse.selectedResponseError = '';
    if (options.preserveSuccess !== true) {
      state.smartResponse.confirmArrivalSuccessMessage = '';
    }
    renderSmartResponsePanel();
    try {
      const response = await window.cameraService.getSosTicketResponse(normalizedTicketNo);
      if (!response || response.status >= 400) {
        throw new Error((response && response.message) || 'Gagal memuat smart response ticket.');
      }
      const detail = normalizeSmartResponseDetail(response.data);
      if (state.smartResponse.responseRequestKey !== requestKey) {
        return detail;
      }
      state.smartResponse.selectedResponse = detail;
      state.smartResponse.selectedResponseError = detail ? '' : 'Detail smart response tidak tersedia.';
      if (detail && detail.response_summary) {
        upsertSmartResponseSummary(detail.response_summary);
      }
      return detail;
    } catch (error) {
      if (state.smartResponse.responseRequestKey === requestKey) {
        state.smartResponse.selectedResponse = null;
        state.smartResponse.selectedResponseError = error && error.message ? error.message : 'Gagal memuat smart response ticket.';
      }
      return null;
    } finally {
      if (state.smartResponse.responseRequestKey === requestKey) {
        state.smartResponse.selectedResponseLoading = false;
        renderDetailPanel();
        renderSmartResponsePanel();
        renderIncidentList();
      }
    }
  };

  const loadSelectedSmartResponseTimeline = async (ticketNo) => {
    const normalizedTicketNo = String(ticketNo || '').trim();
    if (!normalizedTicketNo) {
      state.smartResponse.selectedTimeline = [];
      state.smartResponse.selectedTimelineLoading = false;
      state.smartResponse.selectedTimelineError = '';
      return [];
    }
    const requestKey = `${normalizedTicketNo}:${Date.now()}`;
    state.smartResponse.timelineRequestKey = requestKey;
    state.smartResponse.selectedTimelineLoading = true;
    state.smartResponse.selectedTimelineError = '';
    renderSmartResponsePanel();
    try {
      const response = await window.cameraService.getSosTicketTimeline(normalizedTicketNo);
      if (!response || response.status >= 400) {
        throw new Error((response && response.message) || 'Gagal memuat timeline smart response.');
      }
      const items = unwrapCollection(response.data)
        .map(normalizeSmartResponseTimelineItem)
        .filter(Boolean);
      if (state.smartResponse.timelineRequestKey !== requestKey) {
        return items;
      }
      state.smartResponse.selectedTimeline = items;
      state.smartResponse.selectedTimelineError = '';
      return items;
    } catch (error) {
      if (state.smartResponse.timelineRequestKey === requestKey) {
        state.smartResponse.selectedTimeline = [];
        state.smartResponse.selectedTimelineError = error && error.message ? error.message : 'Gagal memuat timeline smart response.';
      }
      return [];
    } finally {
      if (state.smartResponse.timelineRequestKey === requestKey) {
        state.smartResponse.selectedTimelineLoading = false;
        renderSmartResponsePanel();
      }
    }
  };

  const syncSelectedSmartResponseSelection = (options = {}) => {
    if (state.ui.selectedEntityType !== 'sos' || !state.selectedSosId) {
      resetSelectedSmartResponseState();
      return;
    }
    const nextTicketNo = getSelectedSosTicketNo();
    if (!nextTicketNo) {
      state.smartResponse.selectedTicketNo = '';
      state.smartResponse.selectedResponse = null;
      state.smartResponse.selectedTimeline = [];
      state.smartResponse.activeTab = 'summary';
      state.smartResponse.expandedCandidateVehicleId = null;
      state.smartResponse.timelineExpanded = false;
      state.smartResponse.selectedResponseLoading = false;
      state.smartResponse.selectedTimelineLoading = false;
      state.smartResponse.selectedResponseError = '';
      state.smartResponse.selectedTimelineError = '';
      state.smartResponse.confirmArrivalSubmittingVehicleId = null;
      state.smartResponse.confirmArrivalError = '';
      state.smartResponse.confirmArrivalSuccessMessage = '';
      return;
    }
    const shouldForce = Boolean(options.force);
    const ticketChanged = String(state.smartResponse.selectedTicketNo || '') !== nextTicketNo;
    state.smartResponse.selectedTicketNo = nextTicketNo;
    state.smartResponse.confirmArrivalError = '';
    if (ticketChanged) {
      state.smartResponse.selectedResponse = null;
      state.smartResponse.selectedTimeline = [];
      state.smartResponse.activeTab = 'summary';
      state.smartResponse.expandedCandidateVehicleId = null;
      state.smartResponse.timelineExpanded = false;
      state.smartResponse.selectedResponseError = '';
      state.smartResponse.selectedTimelineError = '';
      state.smartResponse.confirmArrivalSuccessMessage = '';
    }
    if (shouldForce || ticketChanged || !state.smartResponse.selectedResponse) {
      void loadSelectedSmartResponseDetail(nextTicketNo, { preserveSuccess: !ticketChanged && !shouldForce });
    }
    if (shouldForce || ticketChanged || !state.smartResponse.selectedTimeline.length) {
      void loadSelectedSmartResponseTimeline(nextTicketNo);
    }
  };

  const renderSmartResponsePanel = () => {
    if (!(sosSmartResponsePanelEl && sosSmartResponseBodyEl && sosSmartResponseStatusEl && sosSmartResponseTitleEl)) {
      return;
    }
    if (state.ui.selectedEntityType !== 'sos' || !state.selectedSosId) {
      sosSmartResponsePanelEl.classList.remove('is-visible');
      sosSmartResponsePanelEl.classList.add('hidden');
      sosSmartResponseBodyEl.innerHTML = '';
      return;
    }
    const alert = getSelectedAlert();
    const summary = getSmartResponseSummaryForAlert(alert);
    const statusMeta = getSmartResponseStatusMeta(summary && summary.response_status);
    const detail = state.smartResponse.selectedResponse;
    const candidates = detail && Array.isArray(detail.vehicle_candidates) ? detail.vehicle_candidates : [];
    const timelineItems = sortSmartResponseTimelineItems(state.smartResponse.selectedTimeline);
    const responseError = state.smartResponse.selectedResponseError;
    const timelineError = state.smartResponse.selectedTimelineError;
    const activeTab = state.smartResponse.activeTab || 'summary';
    const resolvedSummary = (detail && detail.response_summary) || summary;
    const primaryCandidate = getSmartResponsePrimaryCandidate(detail, resolvedSummary);
    const pendingArrivalCandidate = getPendingArrivalCandidate(detail);

    setText(sosSmartResponseTitleEl, 'Smart Response');
    setClass(sosSmartResponseStatusEl, `status-pill ${statusMeta.tone}`);
    setText(sosSmartResponseStatusEl, statusMeta.label);

    if (!getSelectedSosTicketNo()) {
      sosSmartResponseBodyEl.innerHTML = `
        <div class="sos-smart-response-empty">
          <strong>Smart Response belum aktif.</strong>
          <span>Dispatch ticket SOS terlebih dahulu agar kandidat responder dan timeline bisa dipantau.</span>
        </div>
      `;
      sosSmartResponsePanelEl.classList.remove('hidden');
      sosSmartResponsePanelEl.classList.add('is-visible');
      return;
    }

    if (state.smartResponse.selectedResponseLoading && !detail) {
      sosSmartResponseBodyEl.innerHTML = `
        <div class="sos-smart-response-empty">
          <strong>Memuat Smart Response...</strong>
          <span>Mengambil response summary dan kandidat vehicle terbaru.</span>
        </div>
      `;
      sosSmartResponsePanelEl.classList.remove('hidden');
      sosSmartResponsePanelEl.classList.add('is-visible');
      return;
    }

    if (responseError && !detail) {
      sosSmartResponseBodyEl.innerHTML = `
        <div class="sos-smart-response-empty">
          <strong>Smart Response tidak dapat dimuat.</strong>
          <span>${escapeHtml(responseError)}</span>
        </div>
      `;
      sosSmartResponsePanelEl.classList.remove('hidden');
      sosSmartResponsePanelEl.classList.add('is-visible');
      return;
    }

    const renderCandidateCompactRow = (candidate, options = {}) => {
      const candidateStatusMeta = getSmartResponseStatusMeta(candidate.detection_status);
      const isExpanded =
        Number(state.smartResponse.expandedCandidateVehicleId) === Number(candidate.vehicle_id);
      const isPendingConfirmation = candidate.detection_status === 'ARRIVED_PENDING_CONFIRMATION';
      const isSubmitting =
        Number(state.smartResponse.confirmArrivalSubmittingVehicleId) === Number(candidate.vehicle_id);
      const confirmDisabled = !isPendingConfirmation || !canConfirmSosResponse() || isSubmitting;
      return `
        <article class="sos-smart-response-candidate-row ${candidate.is_primary ? 'is-primary' : ''} ${isExpanded ? 'is-expanded' : ''}">
          <button
            type="button"
            class="sos-smart-response-candidate-row__summary"
            data-candidate-expand="${escapeHtml(String(candidate.vehicle_id))}"
            aria-expanded="${isExpanded ? 'true' : 'false'}"
          >
            <div class="sos-smart-response-candidate-row__identity">
              <strong>${escapeHtml(candidate.vehicle_label || `Vehicle ${candidate.vehicle_id}`)}</strong>
            </div>
            <div class="sos-smart-response-candidate-row__metrics">
              <span>${escapeHtml(formatConfidenceScore(candidate.confidence_score))}</span>
              <span>${escapeHtml(formatDistanceMetersSmartResponse(candidate.distance_meters))}</span>
              <span>${escapeHtml(formatSpeedKmh(candidate.speed_kmh))}</span>
            <span>${escapeHtml(formatTimeOnly(candidate.detected_at || '-'))}</span>
            </div>
            <span class="sos-smart-response-candidate-row__chevron" aria-hidden="true">
              <i class="bi ${isExpanded ? 'bi-chevron-up' : 'bi-chevron-right'}"></i>
            </span>
          </button>
          ${
            isExpanded
              ? `
          <div class="sos-smart-response-candidate-row__details">
            <div class="sos-smart-response-candidate-row__detail-grid">
              <div><span class="sos-detail-label">Status</span><strong>${escapeHtml(candidateStatusMeta.label)}</strong></div>
              <div><span class="sos-detail-label">Jarak Sebelumnya</span><strong>${escapeHtml(formatDistanceMetersSmartResponse(candidate.previous_distance_meters))}</strong></div>
              <div><span class="sos-detail-label">Sudut</span><strong>${Number.isFinite(Number(candidate.angle_diff)) ? `${Math.round(Number(candidate.angle_diff))}&deg;` : '-'}</strong></div>
              <div><span class="sos-detail-label">Evaluasi</span><strong>${escapeHtml(formatTimeOnly(candidate.last_evaluated_at || '-'))}</strong></div>
              <div><span class="sos-detail-label">Node / ID</span><strong>${escapeHtml(String(candidate.vehicle_id))}</strong></div>
              <div><span class="sos-detail-label">Arrival Confirmed</span><strong>${escapeHtml(formatTimeOnly(candidate.arrival_confirmed_at || '-'))}</strong></div>
            </div>
            ${
              isPendingConfirmation
                ? `
            <div class="sos-smart-response-candidate-row__actions">
              <button
                type="button"
                class="toolbar-btn toolbar-btn--accent"
                data-confirm-arrival="${escapeHtml(String(candidate.vehicle_id))}"
                ${confirmDisabled ? 'disabled' : ''}
              >${escapeHtml(isSubmitting ? 'Mengirim...' : 'Confirm Arrival')}</button>
            </div>
            `
                : ''
            }
          </div>
          `
              : ''
          }
        </article>
      `;
    };

    const compactCandidates = candidates
      .filter((candidate) => !primaryCandidate || Number(candidate.vehicle_id) !== Number(primaryCandidate.vehicle_id));
    const summaryCandidatesMarkup = compactCandidates.length
      ? compactCandidates.slice(0, 3).map((candidate) => renderCandidateCompactRow(candidate)).join('')
      : '<div class="sos-smart-response-empty sos-smart-response-empty--section"><strong>Belum ada kandidat lain.</strong><span>Primary unit akan muncul di sini saat evaluasi kandidat tersedia.</span></div>';
    const candidatesTabMarkup = candidates.length
      ? candidates.map((candidate) => renderCandidateCompactRow(candidate, { detailed: true })).join('')
      : '<div class="sos-smart-response-empty sos-smart-response-empty--section"><strong>Belum ada kandidat utama.</strong><span>Smart Response masih menunggu kandidat vehicle yang cukup kuat.</span></div>';

    const visibleTimelineItems = activeTab === 'timeline'
      ? (
        state.smartResponse.timelineExpanded
          ? timelineItems
          : timelineItems.slice(0, 5)
      )
      : timelineItems.slice(0, 3);
    const timelineMarkup = visibleTimelineItems.length
      ? visibleTimelineItems.map((item) => `
          <article class="sos-smart-response-timeline-item">
            <div class="sos-smart-response-timeline-item__dot"></div>
            <div class="sos-smart-response-timeline-item__content">
              <div class="sos-smart-response-timeline-item__head">
                <span class="sos-smart-response-timeline-item__label">${escapeHtml(formatSmartResponseEventLabel(item.event_type))}</span>
                <span>${escapeHtml(formatTimeOnly(item.event_at || '-'))}</span>
              </div>
              <div class="sos-smart-response-timeline-item__meta">
                <span>${escapeHtml(item.vehicle_label || (item.vehicle_id ? `Vehicle ${item.vehicle_id}` : '-'))}</span>
                <span>${escapeHtml(formatDistanceMetersSmartResponse(item.distance_meters))}</span>
              </div>
            </div>
          </article>
        `).join('')
      : '<div class="sos-smart-response-empty sos-smart-response-empty--section"><strong>Timeline belum tersedia.</strong><span>Belum ada event response yang tercatat untuk ticket ini.</span></div>';

    const summaryTabMarkup = primaryCandidate
      ? `
      <button
        type="button"
        class="sos-smart-response-hero sos-smart-response-hero--button"
        data-primary-vehicle-id="${escapeHtml(String(primaryCandidate.vehicle_id))}"
      >
        <div class="sos-smart-response-hero__top">
          <div class="sos-smart-response-hero__identity">
            <div class="sos-smart-response-hero__icon"><i class="bi bi-car-front-fill" aria-hidden="true"></i></div>
            <div class="sos-smart-response-hero__identity-copy">
              <span class="sos-smart-response-hero__label">Primary Unit</span>
              <h4>${escapeHtml(primaryCandidate.vehicle_label || '-')}</h4>
            </div>
          </div>
        </div>
        <div class="sos-smart-response-hero__metrics">
          <div><span class="sos-detail-label">Confidence</span><strong>${escapeHtml(formatConfidenceScore(primaryCandidate.confidence_score))}</strong></div>
          <div><span class="sos-detail-label">Jarak</span><strong>${escapeHtml(formatDistanceMetersSmartResponse(primaryCandidate.distance_meters))}</strong></div>
          <div><span class="sos-detail-label">Kecepatan</span><strong>${escapeHtml(formatSpeedKmh(primaryCandidate.speed_kmh))}</strong></div>
          <div><span class="sos-detail-label">Terdeteksi</span><strong>${escapeHtml(formatTimeOnly(primaryCandidate.detected_at || '-'))}</strong></div>
        </div>
        ${
          pendingArrivalCandidate && Number(pendingArrivalCandidate.vehicle_id) === Number(primaryCandidate.vehicle_id)
            ? `
        <div class="sos-smart-response-hero__action">
          <button
            type="button"
            class="toolbar-btn toolbar-btn--accent"
            data-confirm-arrival="${escapeHtml(String(primaryCandidate.vehicle_id))}"
            ${
              !canConfirmSosResponse() ||
              Number(state.smartResponse.confirmArrivalSubmittingVehicleId) === Number(primaryCandidate.vehicle_id)
                ? 'disabled'
                : ''
            }
          >${escapeHtml(
            Number(state.smartResponse.confirmArrivalSubmittingVehicleId) === Number(primaryCandidate.vehicle_id)
              ? 'Mengirim...'
              : 'Confirm Arrival'
          )}</button>
        </div>
        `
            : ''
        }
      </button>
      `
      : '<div class="sos-smart-response-empty"><strong>Belum ada kandidat utama.</strong><span>Smart Response masih memproses kendaraan terdekat yang paling relevan.</span></div>';

    const tabContent = activeTab === 'candidates'
      ? `
        <section class="sos-smart-response-section">
          <div class="sos-smart-response-list-head">
            <strong>Daftar Kandidat</strong>
            <span>${escapeHtml(`${candidates.length} unit`)}</span>
          </div>
          <div class="sos-smart-response-candidate-table">
            <div class="sos-smart-response-candidate-table__head">
              <span>Unit</span>
              <span>Confidence</span>
              <span>Jarak</span>
              <span>Kecepatan</span>
              <span>Deteksi</span>
            </div>
            ${candidatesTabMarkup}
          </div>
        </section>
      `
      : activeTab === 'timeline'
        ? `
        <section class="sos-smart-response-section">
          <div class="sos-smart-response-list-head">
            <strong>Timeline Response</strong>
            <span>${escapeHtml(`${timelineItems.length} event`)}</span>
          </div>
          ${timelineError ? `<div class="sos-smart-response-banner warning">${escapeHtml(timelineError)}</div>` : ''}
          <div class="sos-smart-response-timeline-list">${timelineMarkup}</div>
          ${
            timelineItems.length > 5
              ? `<button type="button" class="sos-smart-response-link-btn" data-toggle-timeline>${escapeHtml(
                state.smartResponse.timelineExpanded ? 'Ringkas Timeline' : 'Lihat Selengkapnya'
              )}</button>`
              : ''
          }
        </section>
        `
        : `
        <section class="sos-smart-response-section">
          ${summaryTabMarkup}
        </section>
        <section class="sos-smart-response-section">
          <div class="sos-smart-response-list-head">
            <div class="sos-smart-response-section-title">Unit Lain</div>
            <button type="button" class="sos-smart-response-link-btn" data-smart-tab="candidates">Buka Semua</button>
          </div>
          <div class="sos-smart-response-candidate-table">
            ${summaryCandidatesMarkup}
          </div>
        </section>
        `;

    sosSmartResponseBodyEl.innerHTML = `
      ${state.smartResponse.confirmArrivalError ? `<div class="sos-smart-response-banner danger">${escapeHtml(state.smartResponse.confirmArrivalError)}</div>` : ''}
      ${state.smartResponse.confirmArrivalSuccessMessage ? `<div class="sos-smart-response-banner success">${escapeHtml(state.smartResponse.confirmArrivalSuccessMessage)}</div>` : ''}
      ${responseError && detail ? `<div class="sos-smart-response-banner warning">${escapeHtml(responseError)}</div>` : ''}
      <div class="sos-smart-response-tabs" role="tablist" aria-label="Smart Response Tabs">
        <button type="button" class="sos-smart-response-tab ${activeTab === 'summary' ? 'is-active' : ''}" data-smart-tab="summary">Ringkasan</button>
        <button type="button" class="sos-smart-response-tab ${activeTab === 'candidates' ? 'is-active' : ''}" data-smart-tab="candidates">Kandidat</button>
        <button type="button" class="sos-smart-response-tab ${activeTab === 'timeline' ? 'is-active' : ''}" data-smart-tab="timeline">Timeline</button>
      </div>
      <div class="sos-smart-response-scroll">
        ${tabContent}
      </div>
    `;
    sosSmartResponsePanelEl.classList.remove('hidden');
    sosSmartResponsePanelEl.classList.add('is-visible');
  };

  const updateMapEmptyState = (message) => {
    if (typeof message === 'string' && message.trim()) {
      state.ui.mapEmptyMessage = message;
    } else if (!message) {
      state.ui.mapEmptyMessage = getDefaultMapEmptyMessage();
    }
    if (sosMapLoadingEl) {
      sosMapLoadingEl.classList.toggle('sidebar-section-hidden', !state.ui.mapLoading);
    }
    if (!sosMapEmptyEl) {
      return;
    }
    if (state.ui.mapLoading) {
      sosMapEmptyEl.classList.add('hidden');
    }
    const shouldShowEmpty = !hasRenderableMapData();
    if (shouldShowEmpty) {
      setText(
        sosMapEmptyEl,
        state.ui.mapEmptyMessage || getDefaultMapEmptyMessage()
      );
    }
  };

  const hideNetworkArcTooltip = () => {
    if (!networkArcTooltipEl) {
      return;
    }
    networkArcTooltipEl.classList.add('hidden');
    networkArcTooltipEl.innerHTML = '';
  };

  const showNetworkArcTooltip = (info) => {
    if (!networkArcTooltipEl || !info || !info.object || !state.networkArcs.visible) {
      hideNetworkArcTooltip();
      return;
    }
    const edge = info.object;
    const left = Number(info.x) || 0;
    const top = Number(info.y) || 0;
    networkArcTooltipEl.innerHTML = `
      <strong>${escapeHtml(edge.edge_name || edge.edge_code || 'Fiber Network')}</strong>
      <span>${escapeHtml(
        `${(edge.source && edge.source.node_name) || 'Source'} \u2192 ${(edge.target && edge.target.node_name) || 'Target'}`
      )}</span>
      <span>${escapeHtml(
        `${String(edge.status || 'normal').toUpperCase()} \u2022 ${String(edge.connection_type || 'fiber').toUpperCase()}${edge.bandwidth_label ? ` \u2022 ${edge.bandwidth_label}` : ''}${edge.distance_km !== null ? ` \u2022 ${edge.distance_km} km` : ''}`
      )}</span>
    `;
    networkArcTooltipEl.style.left = `${Math.max(12, left + 18)}px`;
    networkArcTooltipEl.style.top = `${Math.max(88, top + 24)}px`;
    networkArcTooltipEl.classList.remove('hidden');
  };

  const withAlpha = (color, alpha) => {
    const rgb = Array.isArray(color) ? color.slice(0, 3) : [34, 197, 94];
    return [...rgb.map((value) => Number(value) || 0), alpha];
  };
  const getNetworkArcBaseColor = (edge) => {
    const color = edge && edge.arc && Array.isArray(edge.arc.visual_color) ? edge.arc.visual_color : null;
    return Array.isArray(color) && color.length >= 3 ? color.slice(0, 3) : NETWORK_STATUS_STYLE.up.color;
  };

  const getNetworkArcColor = (edge, { selected = false, hovered = false, animated = false } = {}) => {
    const baseColor = getNetworkArcBaseColor(edge);
    const intensity = selected ? 34 : hovered ? 18 : animated ? 10 : 0;
    const alpha = selected ? 255 : hovered ? 246 : animated ? 228 : 208;
    return withAlpha(
      baseColor.map((channel) => clamp(Number(channel || 0) + intensity, 0, 255)),
      alpha
    );
  };

  const getNetworkArcWidth = (edge, { animated = false } = {}) => {
    const baseWidth = Number(edge && edge.arc && edge.arc.width) || 1;
    if (edge && edge.edgeKey === state.networkArcs.selectedEdgeKey) {
      return baseWidth + (animated ? 3.0 : 1.4);
    }
    if (edge && edge.edgeKey === state.networkArcs.hoveredEdgeKey) {
      return baseWidth + (animated ? 2.5 : 1.0);
    }
    return baseWidth + (animated ? 1.9 : 0.5);
  };

  const getNetworkArcHeight = (edge) => {
    const heightScale = state.mapContext.cameraMode === 'tilt' ? 2.2 : 1.15;
    return (Number(edge && edge.arc && edge.arc.height) || 0.35) * heightScale;
  };

  const getAnimatedArcLayerCtor = () => window.AnimatedArcLayer || null;
  const getStableAnimationOffset = (edge) => {
    const key = String((edge && (edge.edgeKey || edge.edge_id || edge.edge_code)) || '');
    if (!key) {
      return 0;
    }
    let hash = 0;
    for (let index = 0; index < key.length; index += 1) {
      hash = (hash * 31 + key.charCodeAt(index)) >>> 0;
    }
    return (hash % 1000) / 1000;
  };

  const hasAnimatedNetworkArcs = () =>
    Boolean(
      state.networkArcs.experimentalEnabled &&
      getAnimatedArcLayerCtor() &&
      state.networkArcs.visible &&
      Array.isArray(state.networkArcs.items) &&
      state.networkArcs.items.some((item) => item && item.arc && item.arc.pulse)
    );

  const stopNetworkArcAnimation = ({ resetTime = false } = {}) => {
    if (state.networkArcs.animationFrame) {
      window.cancelAnimationFrame(state.networkArcs.animationFrame);
      state.networkArcs.animationFrame = 0;
    }
    state.networkArcs.animationStartedAt = 0;
    if (resetTime) {
      state.networkArcs.currentTime = 0;
    }
  };

  const startNetworkArcAnimation = () => {
    if (!hasAnimatedNetworkArcs()) {
      stopNetworkArcAnimation({ resetTime: !state.networkArcs.experimentalEnabled });
      return;
    }
    if (state.networkArcs.animationFrame) {
      return;
    }
    const step = (timestamp) => {
      state.networkArcs.animationFrame = 0;
      if (!hasAnimatedNetworkArcs()) {
        stopNetworkArcAnimation();
        return;
      }
      if (!state.networkArcs.animationStartedAt) {
        state.networkArcs.animationStartedAt = timestamp - state.networkArcs.currentTime * 1000;
      }
      state.networkArcs.currentTime = (timestamp - state.networkArcs.animationStartedAt) / 1000;
      syncNetworkOverlay();
    };
    state.networkArcs.animationFrame = window.requestAnimationFrame(step);
  };

  const syncNetworkOverlay = () => {
    if (!state.networkArcs.overlay) {
      stopNetworkArcAnimation();
      return;
    }
    if (!state.networkArcs.visible || !Array.isArray(state.networkArcs.items) || !state.networkArcs.items.length) {
      state.networkArcs.overlay.setProps({ layers: [] });
      hideNetworkArcTooltip();
      stopNetworkArcAnimation({ resetTime: !state.networkArcs.experimentalEnabled });
      return;
    }
    const deckGlobal = window.deck || {};
    const ArcLayerCtor =
      deckGlobal.ArcLayer ||
      (deckGlobal.layers && deckGlobal.layers.ArcLayer) ||
      (window.deckLayers && window.deckLayers.ArcLayer);
    const AnimatedArcLayerCtor = getAnimatedArcLayerCtor();
    if (!ArcLayerCtor) {
      stopNetworkArcAnimation();
      return;
    }
    const animatedEnabled = Boolean(state.networkArcs.experimentalEnabled && AnimatedArcLayerCtor);
    const layers = [
      new ArcLayerCtor({
        id: 'fiber-network-arcs-base',
        data: state.networkArcs.items,
        pickable: true,
        autoHighlight: false,
        widthUnits: 'pixels',
        getSourcePosition: (d) => d.arc.source_position,
        getTargetPosition: (d) => d.arc.target_position,
        getSourceColor: (d) =>
          getNetworkArcColor(d, {
            selected: d.edgeKey === state.networkArcs.selectedEdgeKey,
            hovered: d.edgeKey === state.networkArcs.hoveredEdgeKey,
          }),
        getTargetColor: (d) =>
          getNetworkArcColor(d, {
            selected: d.edgeKey === state.networkArcs.selectedEdgeKey,
            hovered: d.edgeKey === state.networkArcs.hoveredEdgeKey,
          }),
        getWidth: (d) => getNetworkArcWidth(d),
        getHeight: (d) => getNetworkArcHeight(d),
        onHover: (info) => {
          const nextHoveredEdgeKey = info && info.object ? info.object.edgeKey : null;
          const hasChanged = state.networkArcs.hoveredEdgeKey !== nextHoveredEdgeKey;
          state.networkArcs.hoveredEdgeKey = nextHoveredEdgeKey;
          showNetworkArcTooltip(info);
          if (hasChanged) {
            syncNetworkOverlay();
          }
        },
        onClick: (info) => {
          if (!(info && info.object)) {
            return;
          }
          selectNetworkArc(info.object);
        },
        updateTriggers: {
          getSourceColor: [state.networkArcs.selectedEdgeKey, state.networkArcs.hoveredEdgeKey],
          getTargetColor: [state.networkArcs.selectedEdgeKey, state.networkArcs.hoveredEdgeKey],
          getWidth: [state.networkArcs.selectedEdgeKey, state.networkArcs.hoveredEdgeKey],
          getHeight: [state.mapContext.cameraMode],
        },
      }),
    ];
    const animatedUpItems = animatedEnabled
      ? state.networkArcs.items.filter((item) => item && item.arc && item.arc.pulse && item.arc.status_style === 'up')
      : [];
    const animatedDegradedItems = animatedEnabled
      ? state.networkArcs.items.filter(
          (item) => item && item.arc && item.arc.pulse && item.arc.status_style === 'degraded'
        )
      : [];
    if (animatedUpItems.length) {
      animatedUpItems.forEach((edge) => {
        layers.push(
          new AnimatedArcLayerCtor({
            id: `fiber-network-arcs-animated-up-${edge.edgeKey}`,
            data: [edge],
            pickable: false,
            widthUnits: 'pixels',
            currentTime: state.networkArcs.currentTime + getStableAnimationOffset(edge) / NETWORK_STATUS_STYLE.up.speed,
            speed: NETWORK_STATUS_STYLE.up.speed,
            headSize: 0.05,
            tailSize: 0.28,
            minAlpha: 0.2,
            getSourcePosition: (d) => d.arc.source_position,
            getTargetPosition: (d) => d.arc.target_position,
            getSourceColor: (d) => getNetworkArcColor(d, { animated: true }),
            getTargetColor: (d) => getNetworkArcColor(d, { animated: true }),
            getWidth: (d) => getNetworkArcWidth(d, { animated: true }),
            getHeight: (d) => getNetworkArcHeight(d),
            updateTriggers: {
              getSourceColor: [state.networkArcs.selectedEdgeKey, state.networkArcs.hoveredEdgeKey],
              getTargetColor: [state.networkArcs.selectedEdgeKey, state.networkArcs.hoveredEdgeKey],
              getWidth: [state.networkArcs.selectedEdgeKey, state.networkArcs.hoveredEdgeKey],
              getHeight: [state.mapContext.cameraMode],
              currentTime: [state.networkArcs.currentTime],
            },
          })
        );
      });
    }
    if (animatedDegradedItems.length) {
      animatedDegradedItems.forEach((edge) => {
        layers.push(
        new AnimatedArcLayerCtor({
          id: `fiber-network-arcs-animated-degraded-${edge.edgeKey}`,
          data: [edge],
          pickable: false,
          widthUnits: 'pixels',
          currentTime: state.networkArcs.currentTime + getStableAnimationOffset(edge) / NETWORK_STATUS_STYLE.degraded.speed,
          speed: NETWORK_STATUS_STYLE.degraded.speed,
          headSize: 0.042,
          tailSize: 0.24,
          minAlpha: 0.18,
          getSourcePosition: (d) => d.arc.source_position,
          getTargetPosition: (d) => d.arc.target_position,
          getSourceColor: (d) => getNetworkArcColor(d, { animated: true }),
          getTargetColor: (d) => getNetworkArcColor(d, { animated: true }),
          getWidth: (d) => getNetworkArcWidth(d, { animated: true }),
          getHeight: (d) => getNetworkArcHeight(d),
          updateTriggers: {
            getSourceColor: [state.networkArcs.selectedEdgeKey, state.networkArcs.hoveredEdgeKey],
            getTargetColor: [state.networkArcs.selectedEdgeKey, state.networkArcs.hoveredEdgeKey],
            getWidth: [state.networkArcs.selectedEdgeKey, state.networkArcs.hoveredEdgeKey],
            getHeight: [state.mapContext.cameraMode],
            currentTime: [state.networkArcs.currentTime],
          },
        })
      );
      });
    }
    state.networkArcs.overlay.setProps({
      layers,
    });
    if (animatedEnabled && (animatedUpItems.length || animatedDegradedItems.length)) {
      startNetworkArcAnimation();
      return;
    }
    stopNetworkArcAnimation({ resetTime: !state.networkArcs.experimentalEnabled });
  };

  const ensureNetworkOverlay = () => {
    const deckGlobal = window.deck || {};
    const GoogleMapsOverlayCtor =
      deckGlobal.GoogleMapsOverlay ||
      (window.deckGoogleMaps && window.deckGoogleMaps.GoogleMapsOverlay);
    const ArcLayerCtor =
      deckGlobal.ArcLayer ||
      (deckGlobal.layers && deckGlobal.layers.ArcLayer) ||
      (window.deckLayers && window.deckLayers.ArcLayer);
    if (!state.map || !GoogleMapsOverlayCtor || !ArcLayerCtor) {
      return null;
    }
    if (!state.networkArcs.overlay) {
      state.networkArcs.overlay = new GoogleMapsOverlayCtor({ layers: [] });
    }
    state.networkArcs.overlay.setMap(state.map);
    return state.networkArcs.overlay;
  };

  const clearNetworkOverlay = () => {
    hideNetworkArcTooltip();
    stopNetworkArcAnimation({ resetTime: true });
    if (state.networkArcs.overlay) {
      state.networkArcs.overlay.setProps({ layers: [] });
      state.networkArcs.overlay.setMap(null);
    }
  };

  const resetStandaloneLayerState = () => {
    state.cctvMapBranchId = null;
    state.cctvMapBranchLabel = '';
    state.cctvMapLayerKey = '';
    state.cctvViewportKey = '';
    state.cctvClusterOverlayKey = '';
    state.cctvMarkerLoadSeq += 1;
    if (state.standaloneAssets.selectedLabelOverlay) {
      state.standaloneAssets.selectedLabelOverlay.setMap(null);
      state.standaloneAssets.selectedLabelOverlay = null;
    }
    state.ui.previewMarkerLabel = null;
    if (state.ui.selectedEntityType !== 'sos') {
      state.ui.lockedMarkerLabel = null;
    }
    state.standaloneAssets.selectedLabelLatLng = null;
    clearCctvMarkers({ invalidate: false });
  };

  const requestCctvClusterRender = () => {
    if (state.ui.cctvClusterRenderTimeout) {
      window.clearTimeout(state.ui.cctvClusterRenderTimeout);
    }
    state.ui.cctvClusterRenderTimeout = window.setTimeout(() => {
      state.ui.cctvClusterRenderTimeout = 0;
      try {
        syncCctvClusterOverlays();
      } catch (_) {
        // Ignore cluster render errors and let native map repaint handle fallback.
      }
    }, state.ui.mapInteractionActive ? 120 : 32);
  };

  const resetNetworkLayerState = () => {
    state.networkArcs.items = [];
    state.networkArcs.meta = null;
    state.networkArcs.selectedEdgeKey = null;
    state.networkArcs.hoveredEdgeKey = null;
    state.networkArcs.errorMessage = '';
    state.networkArcs.hasLoaded = false;
    stopNetworkArcAnimation({ resetTime: true });
    hideNetworkArcTooltip();
    if (state.networkArcs.overlay) {
      state.networkArcs.overlay.setProps({ layers: [] });
    }
  };

  const resetWeatherLayerState = () => {
    state.weather.items = [];
    state.weather.meta = null;
    state.weather.selectedWeatherId = null;
    state.weather.errorMessage = '';
    state.weather.hasLoaded = false;
    clearWeatherMarkers();
  };

  const focusAlertOnMap = (alert, forceZoom = false) => {
    if (!state.map || !alert || !alert.latLng) {
      return;
    }
    state.mapContext.cameraMode = 'tilt';
    renderMapCameraModeControls();
    moveMapCamera({
      center: alert.latLng,
      zoom: MAP_ZOOM_SOS,
      tilt: isVectorRenderingActive() ? 30 : 0,
      heading: 0,
    });
    syncNetworkOverlay();
  };

  const focusEntityOnMap = (latLng, targetZoom) => {
    if (!state.map || !latLng) {
      return;
    }
    state.mapContext.cameraMode = 'tilt';
    renderMapCameraModeControls();
    moveMapCamera({
      center: latLng,
      zoom: Number(targetZoom) || MAP_ZOOM_SOS,
      tilt: isVectorRenderingActive() ? 30 : 0,
      heading: 0,
    });
    syncNetworkOverlay();
  };

  const getContextBranch = () => {
    if (state.mapContext.selectedBranch && state.mapContext.selectedBranch.id) {
      return state.mapContext.selectedBranch;
    }
    const selectedAlert = getSelectedAlert();
    if (selectedAlert && selectedAlert.branch_id) {
      return {
        id: selectedAlert.branch_id,
        branch_code: selectedAlert.branch_code || '',
        branch_name: selectedAlert.branch_name || '',
      };
    }
    const firstVisibleAlert = getVisibleAlerts()[0];
    if (firstVisibleAlert && firstVisibleAlert.branch_id) {
      return {
        id: firstVisibleAlert.branch_id,
        branch_code: firstVisibleAlert.branch_code || '',
        branch_name: firstVisibleAlert.branch_name || '',
      };
    }
    return state.activeWorkspaceBranch || null;
  };

  const collapseCctvSpiderfy = () => {
    state.cctvSpiderfyLegs.forEach((leg) => {
      if (leg && typeof leg.setMap === 'function') {
        leg.setMap(null);
      }
    });
    state.cctvSpiderfyLegs = [];
    state.cctvSpiderfyTempMarkers.forEach((marker) => {
      if (marker && typeof marker.setMap === 'function') {
        marker.setMap(null);
      }
    });
    state.cctvSpiderfyTempMarkers = [];
    if (state.cctvSpiderfyClusterMarker && typeof state.cctvSpiderfyClusterMarker.setOpacity === 'function') {
      state.cctvSpiderfyClusterMarker.setOpacity(1);
    }
    if (state.cctvSpiderfyClusterMarker && typeof state.cctvSpiderfyClusterMarker.setDimmed === 'function') {
      state.cctvSpiderfyClusterMarker.setDimmed(false);
    }
    state.cctvSpiderfyClusterMarker = null;
    state.cctvSpiderfiedCameraIds = new Set();
    state.cctvMarkers.forEach((entry) => {
      if (!entry || !entry.marker || !entry.originalPosition) {
        return;
      }
      entry.marker.setPosition(entry.originalPosition);
      entry.marker.setZIndex(
        getStandaloneAssetZIndex(
          entry.camera,
          String(entry.camera && entry.camera.id) === String(state.cctvSelectedCameraId)
        )
      );
    });
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

  const getNearbyCctvEntries = (sourceEntry, projection) => {
    if (!sourceEntry || !projection) {
      return [];
    }
    const sourcePixel = projection.fromLatLngToDivPixel(
      sourceEntry.originalPosition || sourceEntry.marker.getPosition()
    );
    if (!sourcePixel) {
      return [];
    }
    return state.cctvMarkers.filter((entry) => {
      if (!entry || !entry.marker) {
        return false;
      }
      const pixel = projection.fromLatLngToDivPixel(
        entry.originalPosition || entry.marker.getPosition()
      );
      if (!pixel) {
        return false;
      }
      return Math.abs(pixel.x - sourcePixel.x) <= 18 && Math.abs(pixel.y - sourcePixel.y) <= 18;
    });
  };

  const openCctvModal = async (camera) => {
    if (!camera) {
      return;
    }
    const assetType = String(camera.asset_type || 'cctv').toLowerCase();
    let detail = camera;
    try {
      const response = await window.cameraService.getMapAssetDetail(assetType, camera.id);
      if (response && response.status < 400) {
        detail = {
          ...camera,
          ...(unwrapSingle(response) || {}),
        };
      }
    } catch (_) {
      detail = camera;
    }
    state.standaloneAssets.selectedAssetKey = makeAssetKey(assetType, detail.id || camera.id);
    state.ui.selectedEntityType = 'asset';
    state.ui.selectedEntityId = state.standaloneAssets.selectedAssetKey;
    state.cctvSelectedCameraId = String(detail.id || camera.id || '');
    state.cctvMarkers.forEach((entry) => {
      if (!entry || !entry.marker || !entry.camera) {
        return;
      }
      entry.marker.setIcon({
        url: getCctvMarkerIconUrl(entry.camera),
        scaledSize: new window.google.maps.Size(
          getCctvMarkerScaledSize(entry.camera),
          getCctvMarkerScaledSize(entry.camera)
        ),
      });
      entry.marker.setZIndex(
        getStandaloneAssetZIndex(
          entry.camera,
          String(entry.camera && entry.camera.id) === String(state.cctvSelectedCameraId)
        )
      );
    });
    setText(
      sosCctvModalTitleEl,
      detail.asset_name || detail.cctv_name || detail.asset_code || `Asset ${detail.id || '-'}`
    );
    const metadataEntries = Object.entries(detail.metadata || {}).filter(
      ([, value]) => value !== null && value !== undefined && String(value).trim() !== ''
    );
    const activeAlarms = toArray(detail.active_alarms);
    if (assetType === 'cctv' && detail.stream_play_url) {
      sosCctvModalMetaEl.innerHTML = '';
      sosCctvModalMetaEl.classList.add('hidden');
      attachSosCctvModalStream(detail);
    } else {
      destroySosCctvModalStream();
      sosCctvModalVideoEl.classList.add('hidden');
      sosCctvModalStreamEmptyEl.classList.remove('hidden');
      sosCctvModalStreamEmptyEl.textContent =
        assetType === 'vms' ? 'VMS tidak memiliki live player pada tahap ini.' : 'Detail stream tidak tersedia.';
      sosCctvModalMetaEl.innerHTML = [
        `<div class="sos-cctv-modal-card"><span>Tipe Asset</span><strong>${escapeHtml(
          assetType.toUpperCase()
        )}</strong></div>`,
        `<div class="sos-cctv-modal-card"><span>Status</span><strong>${escapeHtml(
          String(detail.status || 'normal').toUpperCase()
        )}</strong></div>`,
        ...metadataEntries.map(
          ([key, value]) =>
            `<div class="sos-cctv-modal-card"><span>${escapeHtml(
              key.replace(/_/g, ' ')
            )}</span><strong>${escapeHtml(value)}</strong></div>`
        ),
        ...activeAlarms.map(
          (alarm) =>
            `<div class="sos-cctv-modal-card"><span>${escapeHtml(
              alarm.alarm_name || alarm.alarm_code || 'Alarm'
            )}</span><strong>${escapeHtml(alarm.opened_at || '-')}</strong></div>`
        ),
      ].join('');
      sosCctvModalMetaEl.classList.remove('hidden');
    }
    showModal(sosCctvModalEl);
    state.ui.cctvModalOpenedAt = Date.now();
  };

  const closeCctvModal = () => {
    state.ui.cctvModalOpenedAt = 0;
    state.cctvSelectedCameraId = null;
    destroySosCctvModalStream();
    sosCctvModalMetaEl.innerHTML = '';
    sosCctvModalMetaEl.classList.add('hidden');
    state.cctvMarkers.forEach((entry) => {
      if (!entry || !entry.marker || !entry.camera) {
        return;
      }
      entry.marker.setIcon({
        url: getCctvMarkerIconUrl(entry.camera),
        scaledSize: new window.google.maps.Size(
          getCctvMarkerScaledSize(entry.camera),
          getCctvMarkerScaledSize(entry.camera)
        ),
      });
      entry.marker.setZIndex(undefined);
    });
    hideModal(sosCctvModalEl);
  };

  const getSelectedMarkerLabelPayload = () => {
    if (!state.map || !state.isActive) {
      return null;
    }
    const lockedPayload = resolveMarkerLabelRef(state.ui.lockedMarkerLabel);
    if (lockedPayload) {
      return lockedPayload;
    }
    if (state.ui.lockedMarkerLabel) {
      state.ui.lockedMarkerLabel = null;
    }
    const previewPayload = resolveMarkerLabelRef(state.ui.previewMarkerLabel);
    if (previewPayload) {
      return previewPayload;
    }
    if (state.ui.previewMarkerLabel) {
      state.ui.previewMarkerLabel = null;
    }
    return getSelectedEntityMarkerLabelPayload();
  };

  const getSelectedLabelOverlayClass = () => {
    if (state.standaloneAssets.selectedLabelOverlayClass) {
      return state.standaloneAssets.selectedLabelOverlayClass;
    }
    state.standaloneAssets.selectedLabelOverlayClass = class SelectedMarkerLabelOverlay extends window.google.maps.OverlayView {
      constructor({ map }) {
        super();
        this.map = map;
        this.payload = null;
        this.element = null;
        this.setMap(map);
      }

      onAdd() {
        this.element = document.createElement('div');
        this.element.className = 'selected-map-label selected-map-label--neutral';
        const panes = this.getPanes();
        if (panes && panes.floatPane) {
          panes.floatPane.appendChild(this.element);
        }
      }

      draw() {
        if (!this.element || !this.payload) {
          return;
        }
        const projection = this.getProjection();
        const pixel = projection && this.payload.latLng
          ? projection.fromLatLngToDivPixel(
              this.payload.latLng instanceof window.google.maps.LatLng
                ? this.payload.latLng
                : new window.google.maps.LatLng(Number(this.payload.latLng.lat), Number(this.payload.latLng.lng))
            )
          : null;
        if (!pixel) {
          this.element.classList.add('hidden');
          return;
        }
        this.element.className = this.payload.className || 'selected-map-label';
        if (this.payload.html) {
          this.element.innerHTML = String(this.payload.html);
        } else {
          this.element.textContent = String(this.payload.label || '');
        }
        this.element.style.left = `${pixel.x}px`;
        this.element.style.top = `${pixel.y - 30}px`;
        this.element.style.zIndex = '5000';
      }

      onRemove() {
        if (this.element && this.element.parentNode) {
          this.element.parentNode.removeChild(this.element);
        }
        this.element = null;
      }

      update(payload) {
        this.payload = payload || null;
        if (!this.element) {
          return;
        }
        if (!payload) {
          this.element.classList.add('hidden');
          return;
        }
        this.element.classList.remove('hidden');
        this.draw();
      }
    };
    return state.standaloneAssets.selectedLabelOverlayClass;
  };

  const syncSelectedMarkerLabelOverlay = () => {
    const payload = getSelectedMarkerLabelPayload();
    if (!state.map || !payload) {
      if (state.standaloneAssets.selectedLabelOverlay) {
        state.standaloneAssets.selectedLabelOverlay.setMap(null);
        state.standaloneAssets.selectedLabelOverlay = null;
      }
      return;
    }
    if (!state.standaloneAssets.selectedLabelOverlay) {
      const OverlayCtor = getSelectedLabelOverlayClass();
      state.standaloneAssets.selectedLabelOverlay = new OverlayCtor({ map: state.map });
    }
    state.standaloneAssets.selectedLabelOverlay.update(payload);
  };

  const spiderfyCctvMarkerGroup = (sourceEntry, customEntries = null, customCenter = null) => {
    if (!state.map || !state.cctvProjectionOverlay || !sourceEntry) {
      return false;
    }
    const projection = state.cctvProjectionOverlay.getProjection();
    if (!projection) {
      return false;
    }
    const nearbyEntries =
      Array.isArray(customEntries) && customEntries.length
        ? customEntries
        : getNearbyCctvEntries(sourceEntry, projection);
    if (nearbyEntries.length <= 1) {
      collapseCctvSpiderfy();
      return false;
    }
    collapseCctvSpiderfy();
    const centerLatLng = customCenter || sourceEntry.originalPosition || sourceEntry.marker.getPosition();
    const centerPixel = projection.fromLatLngToDivPixel(centerLatLng);
    if (!centerPixel) {
      return false;
    }
    const spacing = Math.max(96, Math.min(128, 84 + nearbyEntries.length * 6));
    const baseYOffsets = [0, -26, 26, -42, 42, -58, 58, -72, 72];
    const middleIndex = (nearbyEntries.length - 1) / 2;
    nearbyEntries.forEach((entry, index) => {
      const xOffset = (index - middleIndex) * spacing;
      const yOffset =
        baseYOffsets[index] ??
        ((index % 2 === 0 ? 1 : -1) * (30 + Math.floor(index / 2) * 16));
      const targetPixel = new window.google.maps.Point(centerPixel.x + xOffset, centerPixel.y + yOffset);
      const targetLatLng = projection.fromDivPixelToLatLng(targetPixel);
      if (!targetLatLng) {
        return;
      }
      state.cctvSpiderfiedCameraIds.add(String(entry.camera.id));
      const spiderfyMarker = new window.google.maps.Marker({
        map: state.map,
        position: centerLatLng,
        title: entry.camera.cctv_name || 'CCTV',
        icon: {
          url: getCctvMarkerIconUrl(entry.camera),
          scaledSize: new window.google.maps.Size(
            getCctvMarkerScaledSize(entry.camera),
            getCctvMarkerScaledSize(entry.camera)
          ),
        },
        zIndex:
          getStandaloneAssetZIndex(
            entry.camera,
            String(entry.camera && entry.camera.id) === String(state.cctvSelectedCameraId)
          ) + 1,
      });
      spiderfyMarker.addListener('click', () => {
        state.cctvSuppressMapClickUntil = Date.now() + 250;
        selectStandaloneAssetOptimistic(entry.camera, { focus: false, labelLatLng: targetLatLng });
        openCctvModal(entry.camera);
      });
      spiderfyMarker.addListener('mouseover', () => {
        setPreviewMarkerLabel(
          createMarkerLabelRef('asset', makeAssetKey(entry.camera.asset_type, entry.camera.id), {
            latLng: targetLatLng,
          })
        );
      });
      spiderfyMarker.addListener('mouseout', () => {
        clearPreviewMarkerLabelIfUnlocked();
      });
      state.cctvSpiderfyTempMarkers.push(spiderfyMarker);
      const leg = new window.google.maps.Polyline({
        map: state.map,
        path: [centerLatLng, centerLatLng],
        strokeColor: '#ffffff',
        strokeOpacity: 0.85,
        strokeWeight: 1.5,
        clickable: false,
        zIndex: getMapMarkerZIndex('polyline'),
      });
      state.cctvSpiderfyLegs.push(leg);
      animateSpiderfyMarker(spiderfyMarker, centerLatLng, targetLatLng, leg, centerLatLng);
    });
    return true;
  };

  const createCctvAssetMarkerEntry = (camera) => {
    const marker = new window.google.maps.Marker({
      map: null,
      position: camera.position,
      title: camera.title || camera.cctv_name || 'Asset',
      icon: {
        url: getCctvMarkerIconUrl(camera),
        scaledSize: new window.google.maps.Size(
          getCctvMarkerScaledSize(camera),
          getCctvMarkerScaledSize(camera)
        ),
      },
      zIndex: getStandaloneAssetZIndex(
        camera,
        String(camera && camera.id) === String(state.cctvSelectedCameraId)
      ),
    });
    marker.addListener('click', () => {
      state.cctvSuppressMapClickUntil = Date.now() + 250;
      selectStandaloneAssetOptimistic(camera, { focus: false });
      void openCctvModal(camera);
    });
    marker.addListener('mouseover', () => {
      setPreviewMarkerLabel(
        createMarkerLabelRef('asset', makeAssetKey(camera.asset_type, camera.id), {
          latLng: camera.latLng || camera.position || null,
        })
      );
    });
    marker.addListener('mouseout', () => {
      clearPreviewMarkerLabelIfUnlocked();
    });
    return {
      marker,
      camera,
      originalPosition: camera.position,
      assetKey: makeAssetKey(camera.asset_type, camera.id),
    };
  };

  const updateCctvAssetMarkerEntry = (entry, camera) => {
    if (!entry || !entry.marker) {
      return createCctvAssetMarkerEntry(camera);
    }
    entry.camera = camera;
    entry.originalPosition = camera.position;
    entry.assetKey = makeAssetKey(camera.asset_type, camera.id);
    entry.marker.setPosition(camera.position);
    entry.marker.setTitle(camera.title || camera.cctv_name || 'Asset');
    entry.marker.setIcon({
      url: getCctvMarkerIconUrl(camera),
      scaledSize: new window.google.maps.Size(
        getCctvMarkerScaledSize(camera),
        getCctvMarkerScaledSize(camera)
      ),
    });
    entry.marker.setZIndex(
      getStandaloneAssetZIndex(
        camera,
        String(camera && camera.id) === String(state.cctvSelectedCameraId)
      )
    );
    return entry;
  };

  const handleCctvClusterSelect = (cluster, clusterOverlay = null) => {
    collapseCctvSpiderfy();
    const entries = Array.isArray(cluster && cluster.entries) ? cluster.entries.filter(Boolean) : [];
    if (entries.length <= 1) {
      const singleCamera = entries[0] && entries[0].camera;
      if (singleCamera) {
        void openCctvModal(singleCamera);
      }
      return;
    }
    const clusterCenter =
      (cluster && cluster.position) ||
      entries[0].originalPosition ||
      (entries[0].marker && entries[0].marker.getPosition && entries[0].marker.getPosition());
    if (clusterOverlay && typeof clusterOverlay.setDimmed === 'function') {
      clusterOverlay.setDimmed(true);
      state.cctvSpiderfyClusterMarker = clusterOverlay;
    } else {
      state.cctvSpiderfyClusterMarker = null;
    }
    spiderfyCctvMarkerGroup(entries[0], entries, clusterCenter);
  };

  const clearCctvClusterOverlays = () => {
    state.standaloneAssets.clusterMarkers.forEach((marker) => {
      if (marker && typeof marker.setMap === 'function') {
        marker.setMap(null);
      }
    });
    state.standaloneAssets.clusterMarkers.clear();
    state.cctvClusterOverlayKey = '';
    if (state.cctvSpiderfyClusterMarker && !state.standaloneAssets.clusterMarkers.has(state.cctvSpiderfyClusterMarker)) {
      state.cctvSpiderfyClusterMarker = null;
    }
  };

  const clearCctvAssetMarkerRegistry = () => {
    state.standaloneAssets.assetMarkers.forEach((entry) => {
      if (entry && entry.marker && typeof entry.marker.setMap === 'function') {
        entry.marker.setMap(null);
      }
    });
    state.standaloneAssets.assetMarkers.clear();
  };

  const syncCctvClusterOverlays = () => {
    const projection =
      state.cctvProjectionOverlay && typeof state.cctvProjectionOverlay.getProjection === 'function'
        ? state.cctvProjectionOverlay.getProjection()
        : null;
    if (!state.map || !projection) {
      clearCctvClusterOverlays();
      state.cctvMarkers.forEach((entry) => {
        if (entry && entry.marker && typeof entry.marker.setMap === 'function') {
          entry.marker.setMap(state.map || null);
        }
      });
      return;
    }
    const { singles, clusters } = buildManualCctvClusters(state.cctvMarkers, projection);
    const nextOverlayKey = [
      `s:${singles
        .map((entry) => String(entry && entry.camera && entry.camera.id ? entry.camera.id : ''))
        .filter(Boolean)
        .sort()
        .join('|')}`,
      ...clusters.map((cluster) =>
        `c:${cluster.entries
          .map((entry) => String(entry && entry.camera && entry.camera.id ? entry.camera.id : ''))
          .filter(Boolean)
          .sort()
          .join(',')}`
      ),
    ].join('::');
    if (state.cctvClusterOverlayKey === nextOverlayKey) {
      return;
    }
    state.cctvClusterOverlayKey = nextOverlayKey;
    const existingClusterMarkers = new Map(state.standaloneAssets.clusterMarkers);
    const singleEntrySet = new Set(singles);
    state.cctvMarkers.forEach((entry) => {
      if (!(entry && entry.marker && typeof entry.marker.setMap === 'function')) {
        return;
      }
      entry.marker.setMap(singleEntrySet.has(entry) ? state.map : null);
    });
    const ClusterMarkerCtor = getCctvClusterMarkerClass();
    clusters.forEach((cluster) => {
      const clusterKey = String(cluster && cluster.key ? cluster.key : '');
      const existing = existingClusterMarkers.get(clusterKey);
      if (existing && typeof existing.update === 'function') {
        existing.update(cluster, { animate: false });
        existingClusterMarkers.delete(clusterKey);
        return;
      }
      const overlay = new ClusterMarkerCtor({
        map: state.map,
        cluster,
        onSelect: handleCctvClusterSelect,
      });
      state.standaloneAssets.clusterMarkers.set(clusterKey, overlay);
    });
    existingClusterMarkers.forEach((marker) => {
      if (marker && typeof marker.setMap === 'function') {
        marker.setMap(null);
      }
      if (marker === state.cctvSpiderfyClusterMarker) {
        state.cctvSpiderfyClusterMarker = null;
      }
      if (marker && marker.clusterKey) {
        state.standaloneAssets.clusterMarkers.delete(String(marker.clusterKey));
      }
    });
  };

  const clearCctvMarkers = (options = {}) => {
    if (options.invalidate !== false) {
      state.cctvMarkerLoadSeq += 1;
    }
    closeCctvModal();
    collapseCctvSpiderfy();
    state.cctvSelectedCameraId = null;
    clearCctvClusterOverlays();
    clearCctvAssetMarkerRegistry();
    if (state.cctvCluster && typeof state.cctvCluster.clearMarkers === 'function') {
      state.cctvCluster.clearMarkers(true);
    }
    if (state.cctvCluster && typeof state.cctvCluster.setMap === 'function') {
      state.cctvCluster.setMap(null);
    }
    state.cctvCluster = null;
    state.cctvMarkers = [];
  };

  const clearGateMarkers = () => {
    state.gateAlerts.markers.forEach((marker) => {
      if (marker && typeof marker.setMap === 'function') {
        marker.setMap(null);
      }
    });
    state.gateAlerts.markers.clear();
  };

  const clearWeatherMarkers = () => {
    state.weather.markers.forEach((marker) => {
      if (marker && typeof marker.setMap === 'function') {
        marker.setMap(null);
      }
    });
    state.weather.markers.clear();
  };

  const getGateProjection = () =>
    state.gateProjectionOverlay && typeof state.gateProjectionOverlay.getProjection === 'function'
      ? state.gateProjectionOverlay.getProjection()
      : null;

  const buildGateAlertMarkerEntries = () => {
    const viewportBounds = isViewportCullingActive() ? getViewportBoundsWithPadding() : null;
    const gates = Array.from(state.gateAlerts.items.values()).filter(
      (gate) => gate && gate.latLng && shouldDisplayGateStatus(gate) && isLatLngInViewport(gate.latLng, viewportBounds)
    );
    const projection = getGateProjection();
    if (!projection) {
      return gates.map((gate) => ({ ...gate, markerKey: `gate:${gate.gate_id}` }));
    }
    const zoom = Number(state.map && state.map.getZoom ? state.map.getZoom() : 0);
    if (zoom >= 13) {
      return gates.map((gate) => ({ ...gate, markerKey: `gate:${gate.gate_id}` }));
    }
    const positioned = gates
      .map((gate) => {
        const pixel = projection.fromLatLngToDivPixel(
          new window.google.maps.LatLng(gate.latLng.lat, gate.latLng.lng)
        );
        return pixel ? { gate, pixel } : null;
      })
      .filter(Boolean);
    const visited = new Set();
    const clusteredEntries = [];
    positioned.forEach((entry, index) => {
      if (visited.has(index)) {
        return;
      }
      const clusterItems = [entry];
      visited.add(index);
      for (let i = index + 1; i < positioned.length; i += 1) {
        if (visited.has(i)) {
          continue;
        }
        const candidate = positioned[i];
        if (getGateMarkerTone(candidate.gate) !== getGateMarkerTone(entry.gate)) {
          continue;
        }
        const dx = Number(candidate.pixel.x) - Number(entry.pixel.x);
        const dy = Number(candidate.pixel.y) - Number(entry.pixel.y);
        if (Math.hypot(dx, dy) <= Number(state.gateAlerts.clusterDistancePx || 44)) {
          clusterItems.push(candidate);
          visited.add(i);
        }
      }
      if (clusterItems.length === 1) {
        clusteredEntries.push({
          ...entry.gate,
          markerKey: `gate:${entry.gate.gate_id}`,
        });
        return;
      }
      const gatesInCluster = clusterItems.map((item) => item.gate);
      const hasDanger = gatesInCluster.some((gate) => getGateMarkerTone(gate) === 'danger');
      const hasWarning = gatesInCluster.some((gate) => getGateMarkerTone(gate) === 'warning');
      const hasPulse = gatesInCluster.some((gate) => Boolean(gate.pulse));
      const avgLat =
        gatesInCluster.reduce((sum, gate) => sum + Number(gate.latLng && gate.latLng.lat ? gate.latLng.lat : 0), 0) /
        gatesInCluster.length;
      const avgLng =
        gatesInCluster.reduce((sum, gate) => sum + Number(gate.latLng && gate.latLng.lng ? gate.latLng.lng : 0), 0) /
        gatesInCluster.length;
      clusteredEntries.push({
        gate_id: `cluster:${gatesInCluster.map((gate) => gate.gate_id).join('|')}`,
        gate_name: `${gatesInCluster.length} gate alert`,
        gate_code: 'CLUSTER',
        latLng: { lat: avgLat, lng: avgLng },
        status: hasDanger ? 'error' : hasWarning ? 'warning' : 'normal',
        pulse: hasDanger || hasWarning,
        isCluster: true,
        count: gatesInCluster.length,
        gates: gatesInCluster,
        markerKey: `cluster:${gatesInCluster.map((gate) => gate.gate_id).join('|')}`,
      });
    });
    return clusteredEntries;
  };

  const syncGateAlertMarkers = () => {
    if (!state.map) {
      return;
    }
    if (!state.gateAlerts.visible) {
      clearGateMarkers();
      return;
    }
    const MarkerCtor = getGateMarkerClass();
    const activeIds = new Set();
    buildGateAlertMarkerEntries().forEach((gate) => {
      if (!gate || !gate.latLng) {
        return;
      }
      activeIds.add(String(gate.markerKey || gate.gate_id));
      const existing = state.gateAlerts.markers.get(String(gate.markerKey || gate.gate_id));
      if (existing) {
        existing.update(gate);
        return;
      }
      const marker = new MarkerCtor({
        map: state.map,
        gate,
        onSelect: (gateMeta) => {
          if (gateMeta && gateMeta.isCluster && Array.isArray(gateMeta.gates) && gateMeta.gates.length > 1) {
            const bounds = new window.google.maps.LatLngBounds();
            gateMeta.gates.forEach((entry) => {
              if (entry && entry.latLng) {
                bounds.extend(entry.latLng);
              }
            });
            if (!bounds.isEmpty()) {
              state.map.fitBounds(bounds, 80);
            }
            return;
          }
          selectGateAlertOptimistic(gateMeta && gateMeta.gate_id ? gateMeta.gate_id : gateMeta, { focus: false });
          void openGateAlertDetail(gateMeta && gateMeta.gate_id ? gateMeta.gate_id : gateMeta);
        },
      });
      state.gateAlerts.markers.set(String(gate.markerKey || gate.gate_id), marker);
    });
    Array.from(state.gateAlerts.markers.entries()).forEach(([gateId, marker]) => {
      if (activeIds.has(gateId)) {
        return;
      }
      marker.setMap(null);
      state.gateAlerts.markers.delete(gateId);
    });
  };

  const selectWeatherMarker = (weatherId) => {
    const nextId =
      String(state.weather.selectedWeatherId || '') === String(weatherId || '')
        ? null
        : String(weatherId || '');
    state.weather.selectedWeatherId = nextId;
    if (nextId) {
      if (state.ui.selectedEntityType === 'asset') {
        closeCctvModal();
      }
      state.selectedSosId = null;
      state.incidents.selectedSosId = null;
      state.gateAlerts.selectedGateId = null;
      state.standaloneAssets.selectedAssetKey = null;
      state.cctvSelectedCameraId = '';
      state.networkArcs.selectedEdgeKey = null;
      state.ui.selectedEntityType = 'weather';
      state.ui.selectedEntityId = nextId;
      state.detailRenderKey = '';
      clearMarkerLabelState({ preserveSosLocked: false });
    } else if (state.ui.selectedEntityType === 'weather') {
      state.ui.selectedEntityType = '';
      state.ui.selectedEntityId = null;
    }
    renderIncidentList();
    renderDetailPanel();
    syncWeatherMarkers();
  };

  const focusWeatherOnMap = (weatherId) => {
    if (!state.map) {
      return;
    }
    const weather = state.weather.items.find((entry) => String(entry && entry.id) === String(weatherId || ''));
    if (!(weather && weather.latLng)) {
      return;
    }
    moveMapCamera({
      center: { lat: Number(weather.latLng.lat), lng: Number(weather.latLng.lng) },
      zoom: 14,
      tilt: isVectorRenderingActive() ? 30 : 0,
      heading: 0,
    });
    state.mapContext.cameraMode = 'tilt';
    renderMapCameraModeControls();
    void persistAssetMonitoringPrefs();
  };

  const syncWeatherMarkers = () => {
    if (!state.map) {
      return;
    }
    if (!isWeatherLayerActive()) {
      clearWeatherMarkers();
      return;
    }
    const MarkerCtor = getWeatherMarkerClass();
    const activeIds = new Set();
    const viewportBounds = isViewportCullingActive() ? getViewportBoundsWithPadding() : null;
    state.weather.items.forEach((weather) => {
      if (!(weather && weather.latLng) || !isLatLngInViewport(weather.latLng, viewportBounds)) {
        return;
      }
      activeIds.add(String(weather.id));
      const existing = state.weather.markers.get(String(weather.id));
      if (existing) {
        existing.update(weather);
        return;
      }
      const marker = new MarkerCtor({
        map: state.map,
        weather,
        onSelect: selectWeatherMarker,
      });
      state.weather.markers.set(String(weather.id), marker);
    });
    Array.from(state.weather.markers.entries()).forEach(([weatherId, marker]) => {
      if (activeIds.has(weatherId)) {
        return;
      }
      marker.setMap(null);
      state.weather.markers.delete(weatherId);
    });
  };

  const loadWeatherMarkers = async () => {
    state.weather.errorMessage = '';
    state.weather.hasLoaded = false;
    const branch = getSelectedBranch();
    if (!(branch && branch.id) || !isWeatherLayerActive()) {
      state.weather.items = [];
      state.weather.meta = null;
      state.weather.selectedWeatherId = null;
      if (state.ui.selectedEntityType === 'weather') {
        state.ui.selectedEntityType = '';
        state.ui.selectedEntityId = null;
      }
      syncWeatherMarkers();
      renderSummary();
      renderIncidentList();
      return;
    }
    const branchKey = getWeatherBranchKey();
    const cached = state.weather.cacheByBranch.get(branchKey) || null;
    state.weather.items = cached && Array.isArray(cached.items) ? cached.items : [];
    state.weather.meta = cached && cached.meta ? cached.meta : null;
    syncWeatherMarkers();
    renderSummary();
    renderIncidentList();
    try {
      const response = await window.cameraService.getMapWeather(
        isAllBranchesSelected() ? {} : { branch_id: branch.id }
      );
      if (!response || response.status >= 400) {
        throw new Error((response && response.message) || 'Gagal memuat marker weather.');
      }
      const items = unwrapCollection(response).map(normalizeWeatherMarker).filter(Boolean);
      state.weather.items = items;
      state.weather.meta =
        response && response.meta && typeof response.meta === 'object'
          ? response.meta
          : response && response.data && response.data.meta && typeof response.data.meta === 'object'
            ? response.data.meta
            : null;
      state.weather.cacheByBranch.set(branchKey, {
        items,
        meta: state.weather.meta,
      });
      state.weather.hasLoaded = true;
      if (
        state.weather.selectedWeatherId &&
        !items.some((item) => String(item.id) === String(state.weather.selectedWeatherId))
      ) {
        state.weather.selectedWeatherId = null;
        if (state.ui.selectedEntityType === 'weather') {
          state.ui.selectedEntityType = '';
          state.ui.selectedEntityId = null;
        }
      }
      syncWeatherMarkers();
      renderSummary();
      renderIncidentList();
    } catch (error) {
      state.weather.errorMessage = error && error.message ? error.message : 'Gagal memuat marker weather.';
      state.weather.hasLoaded = true;
      state.weather.selectedWeatherId = null;
      if (state.ui.selectedEntityType === 'weather') {
        state.ui.selectedEntityType = '';
        state.ui.selectedEntityId = null;
      }
      syncWeatherMarkers();
      renderSummary();
      renderIncidentList();
    }
  };

  const loadMapBranches = async () => {
    const response = await window.cameraService.getMapBranches();
    if (!response || response.status >= 400) {
      throw new Error((response && response.message) || 'Gagal memuat branch peta.');
    }
    const rows = unwrapCollection(response);
    state.mapContext.availableBranches = filterAllowedBranches(rows.map(normalizeMapBranch).filter(Boolean));
    const preferredBranchId = String(
      (state.mapContext.selectedBranch && state.mapContext.selectedBranch.id) ||
        (state.activeWorkspaceBranch && state.activeWorkspaceBranch.id) ||
        ''
    );
    state.mapContext.selectedBranch =
      (preferredBranchId === ALL_BRANCHES_OPTION && canViewAllBranches()
        ? { id: ALL_BRANCHES_OPTION, branch_name: 'Semua Branch', branch_code: 'ALL' }
        : null) ||
      state.mapContext.availableBranches.find((branch) => String(branch.id) === preferredBranchId) ||
      state.mapContext.availableBranches[0] ||
      state.activeWorkspaceBranch ||
      null;
    renderBranchOptions();
  };

  const loadGateAlerts = async () => {
    const branch = getSelectedBranch();
    state.gateAlerts.items.clear();
    clearGateMarkers();
    if (!(branch && branch.id)) {
      state.gateAlerts.selectedGateId = null;
      return;
    }
    const response = await window.cameraService.getGateAlerts({
      include: 'affected_devices',
      ...(isAllBranchesSelected() ? {} : { branch_id: branch.id }),
    });
    if (!response || response.status >= 400) {
      throw new Error((response && response.message) || 'Gagal memuat gate alerts.');
    }
    unwrapCollection(response).forEach((item) => {
      const normalized = normalizeGateAlert(item);
      if (normalized) {
        state.gateAlerts.items.set(String(normalized.gate_id), {
          ...normalized,
          showInSummary: normalized.status === 'error' || normalized.status === 'warning',
        });
      }
    });
    if (
      state.gateAlerts.selectedGateId &&
      !state.gateAlerts.items.has(String(state.gateAlerts.selectedGateId))
    ) {
      state.gateAlerts.selectedGateId = null;
      if (state.ui.selectedEntityType === 'gate') {
        state.ui.selectedEntityType = '';
        state.ui.selectedEntityId = null;
        clearMarkerLabelState({ preserveSosLocked: false });
      }
    }
    syncGateAlertMarkers();
  };

  const loadNetworkArcs = async () => {
    state.networkArcs.errorMessage = '';
    state.networkArcs.hasLoaded = false;
    const branch = getSelectedBranch();
    if (!(branch && branch.id)) {
      state.networkArcs.items = [];
      state.networkArcs.meta = null;
      state.networkArcs.selectedEdgeKey = null;
      syncNetworkOverlay();
      return;
    }
    const branchKey = getNetworkBranchKey();
    const cached = state.networkArcs.cacheByBranch.get(branchKey) || null;
    debugLog('loadNetworkArcs:start', {
      branchKey,
      branchId: branch && branch.id ? String(branch.id) : '',
      usingCache: Boolean(cached),
      visible: state.networkArcs.visible,
    });
    state.networkArcs.items = cached && Array.isArray(cached.items) ? cached.items : [];
    state.networkArcs.meta = cached && cached.meta ? cached.meta : null;
    syncNetworkOverlay();
    try {
      const response = await window.cameraService.getMapNetworkArcs(
        isAllBranchesSelected() ? {} : { branch_id: branch.id }
      );
      if (!response || response.status >= 400) {
        throw new Error((response && response.message) || 'Gagal memuat koneksi fiber network.');
      }
      const items = unwrapCollection(response).map(normalizeNetworkArc).filter(Boolean);
      state.networkArcs.items = items;
      state.networkArcs.meta = response && response.meta && typeof response.meta === 'object'
        ? response.meta
        : response && response.data && response.data.meta && typeof response.data.meta === 'object'
          ? response.data.meta
          : null;
      state.networkArcs.cacheByBranch.set(branchKey, {
        items,
        meta: state.networkArcs.meta,
      });
      state.networkArcs.hasLoaded = true;
      debugLog('loadNetworkArcs:done', {
        branchKey,
        itemCount: items.length,
        metaTotals:
          state.networkArcs.meta && state.networkArcs.meta.totals
            ? state.networkArcs.meta.totals
            : null,
      });
      if (
        state.networkArcs.selectedEdgeKey &&
        !items.some((entry) => entry && entry.edgeKey === state.networkArcs.selectedEdgeKey)
      ) {
        state.networkArcs.selectedEdgeKey = null;
        if (state.ui.selectedEntityType === 'network') {
          state.ui.selectedEntityType = '';
          state.ui.selectedEntityId = null;
        }
      }
      syncNetworkOverlay();
    } catch (error) {
      state.networkArcs.items = [];
      state.networkArcs.meta = null;
      state.networkArcs.errorMessage = error && error.message ? error.message : 'Gagal memuat koneksi fiber network.';
      state.networkArcs.hasLoaded = true;
      if (state.ui.selectedEntityType === 'network') {
        state.networkArcs.selectedEdgeKey = null;
        state.ui.selectedEntityType = '';
        state.ui.selectedEntityId = null;
      }
      syncNetworkOverlay();
      updateMapEmptyState(state.networkArcs.errorMessage);
      debugLog('loadNetworkArcs:error', {
        message: state.networkArcs.errorMessage,
      });
    }
  };

  const renderGateDetailBody = (detail) => {
    const deviceSummary = detail && detail.device_summary ? detail.device_summary : {};
    const summaryLine = [
      `${Number(deviceSummary.total || 0)} total`,
      `${Number(deviceSummary.error || 0)} error`,
      `${Number(deviceSummary.warning || 0)} warning`,
      `${Number(deviceSummary.offline || 0)} offline`,
    ].join(' | ');
    const affectedDevices = (detail.affected_devices.length ? detail.affected_devices : detail.devices)
      .filter((device) => isGateIssueStatus(device && device.status))
      .map((device) => device.device_name || device.device_type || '-')
      .filter(Boolean)
      .join(', ');
    return `
      <div class="sos-detail-body__grid">
        <div><span class="sos-detail-label">Koordinat</span><strong>${escapeHtml(detail.lat || '-')} / ${escapeHtml(detail.lng || '-')}</strong></div>
        <div><span class="sos-detail-label">Ringkasan Device</span><strong>${escapeHtml(summaryLine)}</strong></div>
        <div><span class="sos-detail-label">Status Device</span><strong>${escapeHtml(String(detail.status || 'normal').toUpperCase())}</strong></div>
        <div><span class="sos-detail-label">Device Terdampak</span><strong>${escapeHtml(affectedDevices || '-')}</strong></div>
      </div>
      <div class="sos-gate-log-list">
        <span class="sos-detail-label">Log Device</span>
        ${renderGateLogList(detail)}
      </div>
    `;
  };

  const stopGateDetailDurationTimer = () => {
    if (state.ui.gateDetailDurationTimer) {
      window.clearInterval(state.ui.gateDetailDurationTimer);
      state.ui.gateDetailDurationTimer = 0;
    }
  };

  const refreshGateDetailDurationView = () => {
    if (
      !state.isActive ||
      state.ui.selectedEntityType !== 'gate' ||
      !state.gateAlerts.selectedGateId ||
      sosDetailPanelEl.classList.contains('hidden')
    ) {
      stopGateDetailDurationTimer();
      return;
    }
    const detail = state.gateAlerts.details.get(String(state.gateAlerts.selectedGateId));
    if (!detail) {
      stopGateDetailDurationTimer();
      return;
    }
    sosDetailBodyEl.innerHTML = renderGateDetailBody(detail);
  };

  const startGateDetailDurationTimer = () => {
    stopGateDetailDurationTimer();
    if (
      !state.isActive ||
      state.ui.selectedEntityType !== 'gate' ||
      !state.gateAlerts.selectedGateId ||
      sosDetailPanelEl.classList.contains('hidden')
    ) {
      return;
    }
    state.ui.gateDetailDurationTimer = window.setInterval(refreshGateDetailDurationView, 60000);
  };

  const openGateAlertDetail = async (gateId) => {
    const response = await window.cameraService.getGateAlertDetail(gateId);
    if (!response || response.status >= 400) {
      throw new Error((response && response.message) || 'Gagal memuat detail gate alert.');
    }
    const detail = normalizeGateAlert(unwrapSingle(response));
    if (!detail) {
      return;
    }
    const rawDetail = unwrapSingle(response);
    detail.devices = toArray((rawDetail && rawDetail.devices) || []);
    detail.affected_devices = toArray((rawDetail && rawDetail.affected_devices) || detail.affected_devices);
    state.gateAlerts.details.set(String(detail.gate_id), detail);
    state.gateAlerts.selectedGateId = String(detail.gate_id);
    state.ui.selectedEntityType = 'gate';
    state.ui.selectedEntityId = String(detail.gate_id);
    state.selectedSosId = null;
    Array.from(state.gateAlerts.markers.values()).forEach((marker) => {
      if (marker && typeof marker.update === 'function') {
        marker.update(marker.gate);
      }
    });
    applySosActionButtonState(null);
    setText(sosDetailTitleEl, detail.gate_name || detail.gate_code || `Gate ${detail.gate_id}`);
    setClass(sosDetailStatusEl, `status-pill ${getGateMarkerTone(detail) === 'danger' ? 'danger' : getGateMarkerTone(detail) === 'warning' ? 'warning' : 'success'}`);
    setText(sosDetailStatusEl, String(detail.status || 'normal').toUpperCase());
    sosDetailMetaEl.innerHTML = '';
    sosDetailMetaEl.classList.add('hidden');
    sosDetailBodyEl.innerHTML = renderGateDetailBody(detail);
    sosDetailPanelEl.classList.remove('hidden');
    sosDetailPanelEl.classList.add('is-visible');
    replayDetailPanelAnimation();
    startGateDetailDurationTimer();
  };

  const selectNetworkArc = (edge) => {
    if (!edge) {
      return;
    }
    state.selectedSosId = null;
    state.incidents.selectedSosId = null;
    state.gateAlerts.selectedGateId = null;
    state.standaloneAssets.selectedAssetKey = null;
    state.cctvSelectedCameraId = '';
    state.networkArcs.selectedEdgeKey = edge.edgeKey;
    state.ui.selectedEntityType = 'network';
    state.ui.selectedEntityId = edge.edgeKey;
    state.detailRenderKey = '';
    renderAll();
  };

  const updateDefaultCctvMarkers = async () => {
    const loadSeq = (state.cctvMarkerLoadSeq += 1);
    const isCurrentCctvLoad = () =>
      loadSeq === state.cctvMarkerLoadSeq && (state.cctvVisible || state.vmsVisible);
    const branch = getSelectedBranch();
    const branchKey = isAllBranchesSelected() ? ALL_BRANCHES_OPTION : String((branch && branch.id) || '');
    const layerKey = getStandaloneLayerKey(branchKey);
    const viewportKey = getViewportRenderKey();
    debugLog('updateDefaultCctvMarkers:start', {
      loadSeq,
      branchKey,
      layerKey,
      selectedBranchId: branch && branch.id ? String(branch.id) : '',
      hasMap: Boolean(state.map),
      hasCachedBranch: state.cctvCacheByBranch.has(branchKey),
      currentMarkerCount: state.cctvMarkers.length,
      currentMapBranchId: state.cctvMapBranchId,
      currentMapLayerKey: state.cctvMapLayerKey,
      viewportKey,
      currentViewportKey: state.cctvViewportKey,
      visibleFlags: {
        cctv: state.cctvVisible,
        vms: state.vmsVisible,
      },
    });
    if (!state.map) {
      return;
    }
    if (!state.cctvVisible && !state.vmsVisible) {
      clearCctvMarkers({ invalidate: false });
      state.cctvMapLayerKey = '';
      updateMapEmptyState(getVisibleAlerts().length ? '' : 'Marker CCTV dan VMS sedang disembunyikan.');
      return;
    }
    if (!branch || !branch.id) {
      clearCctvMarkers({ invalidate: false });
      state.cctvMapBranchId = null;
      state.cctvMapBranchLabel = '';
      updateMapEmptyState('Pilih ruas aktif operator untuk menampilkan cluster CCTV.');
      return;
    }
    if (
      String(state.cctvMapBranchId) === branchKey &&
      state.cctvMapLayerKey === layerKey &&
      (isViewportCullingActive() ? state.cctvViewportKey === viewportKey : state.cctvMarkers.length)
    ) {
      requestCctvClusterRender();
      updateMapEmptyState('');
      return;
    }
    const isBranchLayerChanged =
      String(state.cctvMapBranchId) !== branchKey || state.cctvMapLayerKey !== layerKey;
    if (isBranchLayerChanged) {
      clearCctvMarkers({ invalidate: false });
    } else {
      collapseCctvSpiderfy();
      state.cctvMarkers = [];
    }
    state.cctvMapBranchId = branchKey;
    state.cctvMapLayerKey = layerKey;
    state.cctvViewportKey = viewportKey;
    state.cctvMapBranchLabel = isAllBranchesSelected() ? 'Semua Branch' : branch.branch_name || branch.branch_code || '';
    try {
      let cameras = state.cctvCacheByBranch.get(branchKey);
      const usingCache = Boolean(cameras);
      if (!cameras) {
        const response = await window.cameraService.getMapAssets({
          type: 'cctv,vms',
          ...(isAllBranchesSelected() ? {} : { branch_id: branch.id }),
        });
        if (!response || response.status >= 400) {
          throw new Error((response && response.message) || 'Gagal memuat asset branch.');
        }
        cameras = unwrapCollection(response)
          .map(normalizeStandaloneAsset)
          .filter((camera) => camera && camera.latLng)
          .map((camera) => ({
            ...camera,
            position: camera.latLng,
            showInSummary: true,
          }));
        state.cctvCacheByBranch.set(branchKey, cameras);
        state.standaloneAssets.items.clear();
        cameras.forEach((camera) => {
          state.standaloneAssets.items.set(makeAssetKey(camera.asset_type, camera.id), camera);
        });
      }
      state.standaloneAssets.items.clear();
      cameras.forEach((camera) => {
        state.standaloneAssets.items.set(makeAssetKey(camera.asset_type, camera.id), camera);
      });
      if (!isCurrentCctvLoad()) {
        return;
      }
      const visibleCameras = cameras.filter(
        (camera) => isStandaloneAssetTypeVisible(camera) && shouldDisplayStandaloneAssetStatus(camera)
      );
      const viewportBounds = isViewportCullingActive() ? getViewportBoundsWithPadding() : null;
      const renderableCameras = viewportBounds
        ? visibleCameras.filter((camera) => isLatLngInViewport(camera.position, viewportBounds))
        : visibleCameras;
      debugLog('updateDefaultCctvMarkers:data', {
        branchKey,
        usingCache,
        totalCameras: cameras.length,
        visibleCameras: visibleCameras.length,
        renderableCameras: renderableCameras.length,
      });
      const nextVisibleKeys = new Set();
      state.cctvMarkers = renderableCameras.map((camera) => {
        const assetKey = makeAssetKey(camera.asset_type, camera.id);
        nextVisibleKeys.add(assetKey);
        const existing = state.standaloneAssets.assetMarkers.get(assetKey);
        const entry = existing
          ? updateCctvAssetMarkerEntry(existing, camera)
          : createCctvAssetMarkerEntry(camera);
        state.standaloneAssets.assetMarkers.set(assetKey, entry);
        return entry;
      });
      state.standaloneAssets.assetMarkers.forEach((entry, assetKey) => {
        if (!(entry && entry.marker && typeof entry.marker.setMap === 'function')) {
          return;
        }
        if (!nextVisibleKeys.has(assetKey)) {
          entry.marker.setMap(null);
        }
      });
      try {
        await loadOnlyIconDataUris();
      } catch (clusterError) {
        debugLog('updateDefaultCctvMarkers:cluster-library-error', {
          message:
            clusterError && clusterError.message ? clusterError.message : String(clusterError),
        });
      }
      if (!isCurrentCctvLoad()) {
        return;
      }
      debugLog('updateDefaultCctvMarkers:cluster-setup', {
        branchKey,
        hasMarkerClusterer: false,
        markerCount: state.cctvMarkers.length,
      });
      state.cctvCluster = { render: syncCctvClusterOverlays };
      requestCctvClusterRender();
      if (!isAllBranchesSelected() && !getVisibleAlerts().length && renderableCameras.length) {
        const bounds = new google.maps.LatLngBounds();
        renderableCameras.forEach((camera) => bounds.extend(camera.position));
        state.map.fitBounds(bounds, 56);
      }
      debugLog('updateDefaultCctvMarkers:done', {
        branchKey,
        markerCount: state.cctvMarkers.length,
        clusterRenderMarkers: state.standaloneAssets.clusterMarkers.size,
        hasClusterInstance: true,
      });
      updateMapEmptyState('');
    } catch (error) {
      debugLog('updateDefaultCctvMarkers:error', {
        message: error && error.message ? error.message : String(error),
      });
      clearCctvMarkers();
      updateMapEmptyState(error.message || 'Gagal memuat cluster CCTV.');
    }
  };

  const fitVisibleAlerts = () => {
    if (!state.map) {
      return;
    }
    const alerts = getVisibleAlerts().filter((alert) => alert.latLng);
    if (!alerts.length) {
      return;
    }
    if (alerts.length === 1) {
      focusAlertOnMap(alerts[0], true);
      return;
    }
    const bounds = new google.maps.LatLngBounds();
    alerts.forEach((alert) => bounds.extend(alert.latLng));
    state.map.fitBounds(bounds, 80);
  };

  const focusSelectedBranchOnMap = () => {
    if (!state.map) {
      return;
    }
    const branch = getSelectedBranch();
    if (isAllBranchesSelected()) {
      const bounds = getAllBranchesBounds();
      if (bounds) {
        state.map.fitBounds(bounds, 80);
      }
      return;
    }
    if (
      branch &&
      Number.isFinite(Number(branch.center_lat)) &&
      Number.isFinite(Number(branch.center_lng))
    ) {
      state.map.panTo({ lat: Number(branch.center_lat), lng: Number(branch.center_lng) });
      if (Number(state.map.getZoom() || 0) < MAP_ZOOM_BRANCH) {
        state.map.setZoom(MAP_ZOOM_BRANCH);
      }
    }
  };

  const syncMapMarkers = () => {
    if (!state.map) {
      debugLog('syncMapMarkers:skip-no-map');
      return;
    }
    debugLog('syncMapMarkers:start', {
      visibleAlerts: getVisibleAlerts().length,
      markerCount: state.markers.size,
    });
    const activeIds = new Set();
    getVisibleAlerts().forEach((alert) => {
      if (!alert.latLng) {
        return;
      }
      activeIds.add(alert.sos_id);
      const marker = state.markers.get(alert.sos_id);
      if (marker) {
        marker.update(alert);
        return;
      }
      state.markers.set(
        alert.sos_id,
        new (getMarkerClass())({
          map: state.map,
          alert,
          onSelect: (sosId) => selectAlert(sosId, false),
        })
      );
    });
    Array.from(state.markers.entries()).forEach(([sosId, marker]) => {
      if (activeIds.has(sosId)) {
        return;
      }
      marker.setMap(null);
      state.markers.delete(sosId);
    });
    debugLog('syncMapMarkers:done', {
      markerCount: state.markers.size,
      activeIds: Array.from(activeIds),
    });
    updateMapEmptyState(
      getVisibleAlerts().length
        ? ''
        : hasRenderableMapData()
          ? ''
          : getDefaultMapEmptyMessage()
    );
  };

  const renderAll = () => {
    reconcileSelectedVehicle();
    renderSummary();
    renderBranchOptions();
    renderAssetToolbar();
    renderIncidentList();
    renderVehicleTypeToggleControls();
    renderVehiclePanel();
    renderDetailPanel();
    renderSmartResponsePanel();
    renderNotifications();
    syncGateAlertMarkers();
    syncMapMarkers();
    syncVehicleMarkers();
    syncSelectedMarkerLabelOverlay();
    syncWeatherMarkers();
    syncNetworkOverlay();
  };

  const clearSmartResponseSummaryMaps = () => {
    state.smartResponse.summariesByTicketNo.clear();
    state.smartResponse.summariesBySosId.clear();
  };

  const getSmartResponseSummaryBySosId = (sosId) => {
    const numericSosId = Number(sosId);
    if (!Number.isFinite(numericSosId)) {
      return null;
    }
    return state.smartResponse.summariesBySosId.get(numericSosId) || null;
  };

  const getSmartResponseSummaryForAlert = (alert) => {
    if (!alert) {
      return null;
    }
    return (
      normalizeSmartResponseSummary(alert.ticket && alert.ticket.response_summary ? alert.ticket.response_summary : null, alert.ticket || alert) ||
      getSmartResponseSummaryBySosId(alert.sos_id)
    );
  };

  const upsertSmartResponseSummary = (summary, options = {}) => {
    const normalized = normalizeSmartResponseSummary(summary);
    if (!normalized) {
      return null;
    }
    if (normalized.ticket_no) {
      state.smartResponse.summariesByTicketNo.set(normalized.ticket_no, normalized);
    }
    if (Number.isFinite(Number(normalized.sos_id))) {
      state.smartResponse.summariesBySosId.set(Number(normalized.sos_id), normalized);
    }
    if (options.patchTicket !== false) {
      const ticket =
        (Number.isFinite(Number(normalized.sos_id)) && state.ticketsBySosId.get(Number(normalized.sos_id))) ||
        Array.from(state.ticketsBySosId.values()).find(
          (entry) => String(entry && entry.ticket_no ? entry.ticket_no : '') === String(normalized.ticket_no || '')
        ) ||
        null;
      if (ticket) {
        ticket.response_summary = normalized;
      }
    }
    return normalized;
  };

  const resetSelectedSmartResponseState = () => {
    state.smartResponse.selectedTicketNo = '';
    state.smartResponse.selectedResponse = null;
    state.smartResponse.selectedTimeline = [];
    state.smartResponse.activeTab = 'summary';
    state.smartResponse.expandedCandidateVehicleId = null;
    state.smartResponse.timelineExpanded = false;
    state.smartResponse.selectedResponseLoading = false;
    state.smartResponse.selectedTimelineLoading = false;
    state.smartResponse.selectedResponseError = '';
    state.smartResponse.selectedTimelineError = '';
    state.smartResponse.responseRequestKey = '';
    state.smartResponse.timelineRequestKey = '';
    state.smartResponse.confirmArrivalSubmittingVehicleId = null;
    state.smartResponse.confirmArrivalError = '';
    state.smartResponse.confirmArrivalSuccessMessage = '';
  };

  const mergeTicketToAlert = (alert) => {
    const ticket = state.ticketsBySosId.get(alert.sos_id);
    if (!ticket) {
      return alert;
    }
    alert.ticket = ticket;
    if (ticket.response_summary) {
      upsertSmartResponseSummary(ticket.response_summary, { patchTicket: false });
    }
    if (Number(alert.status) !== 2) {
      alert.status = ticket.ticket_status === 2 ? 2 : 1;
    }
    return alert;
  };

  const applyTicketPatch = (payload) => {
    const source =
      payload && typeof payload === 'object' && payload.ticket && typeof payload.ticket === 'object'
        ? payload.ticket
        : null;
    const normalized = normalizeTicket(source);
    if (!normalized) {
      return null;
    }
    if (normalized.ticket_status === 2) {
      state.ticketsBySosId.delete(normalized.sos_id);
    } else {
      state.ticketsBySosId.set(normalized.sos_id, normalized);
    }
    state.incidents.ticketsBySosId = state.ticketsBySosId;
    const alert = state.alerts.get(normalized.sos_id);
    if (!alert) {
      return null;
    }
    alert.ticket = {
      ...(alert.ticket || {}),
      ...normalized,
      ticket_status: normalized.ticket_status,
    };
    if (normalized.response_summary) {
      upsertSmartResponseSummary(normalized.response_summary, { patchTicket: false });
    }
    alert.status = normalized.ticket_status === 2 ? 2 : 1;
    return alert;
  };

  const removeSosAlertFromActiveView = (sosId, options = {}) => {
    const normalizedSosId = Number(sosId);
    if (!Number.isFinite(normalizedSosId)) {
      return;
    }
    state.incidents.suppressedCompletedSosIds.add(normalizedSosId);
    const incidentKey = `sos:${normalizedSosId}`;
    const animationState = getIncidentAnimationState();
    clearIncidentEnterTimer(incidentKey);
    clearIncidentLeaveTimer(incidentKey);
    animationState.enteringKeys.delete(incidentKey);
    animationState.leavingItems.delete(incidentKey);
    animationState.previousVisibleItems.delete(incidentKey);

    const marker = state.markers.get(normalizedSosId);
    if (marker) {
      marker.setMap(null);
      state.markers.delete(normalizedSosId);
    }

    if (
      state.ui.lockedMarkerLabel &&
      state.ui.lockedMarkerLabel.kind === 'sos' &&
      String(state.ui.lockedMarkerLabel.id || '') === String(normalizedSosId)
    ) {
      state.ui.lockedMarkerLabel = null;
    }
    if (
      state.ui.previewMarkerLabel &&
      state.ui.previewMarkerLabel.kind === 'sos' &&
      String(state.ui.previewMarkerLabel.id || '') === String(normalizedSosId)
    ) {
      state.ui.previewMarkerLabel = null;
    }

    removeNotificationsByTarget('sos', (target) => String(target.sosId) === String(normalizedSosId));

    if (state.selectedSosId === normalizedSosId || options.clearSelection) {
      clearSelectedAlert();
      return;
    }

    syncSelectedMarkerLabelOverlay();
  };

  const upsertAlert = (item, pushStatusNotification = true) => {
    const normalized = normalizeAlert(item);
    if (!normalized) {
      debugLog('upsertAlert:ignored', {
        keys: item && typeof item === 'object' ? Object.keys(item) : typeof item,
        payload: item,
      });
      return null;
    }
    if (state.incidents.suppressedCompletedSosIds.has(normalized.sos_id)) {
      const previousSuppressed = state.alerts.get(normalized.sos_id);
      if (previousSuppressed) {
        previousSuppressed.status = 2;
        if (previousSuppressed.ticket) {
          previousSuppressed.ticket = {
            ...previousSuppressed.ticket,
            ticket_status: 2,
          };
        }
      }
      return previousSuppressed || null;
    }
    const previous = state.alerts.get(normalized.sos_id);
    const merged = mergeTicketToAlert({
      ...(previous || {}),
      ...normalized,
      user: normalized.user || (previous && previous.user) || null,
      nearest_cameras:
        normalized.nearest_cameras.length ? normalized.nearest_cameras : (previous && previous.nearest_cameras) || [],
      latLng: normalized.latLng || (previous && previous.latLng) || null,
    });
    state.alerts.set(merged.sos_id, merged);
    state.incidents.alerts = state.alerts;
    if (!previous && Number(merged.status) !== 2 && state.isInitialSnapshotLoaded) {
      pushNotification(merged, 'Kejadian SOS baru masuk');
    } else if (
      previous &&
      Number(previous.status) !== Number(merged.status) &&
      pushStatusNotification
    ) {
      pushNotification(merged, `Status berubah: ${getStatusMeta(merged.status).label}`);
    }
    debugLog('upsertAlert:stored', {
      sosId: merged.sos_id,
      status: merged.status,
      hasLatLng: Boolean(merged.latLng),
      nearestCameraCount: merged.nearest_cameras.length,
      hasTicket: Boolean(merged.ticket),
    });
    return merged;
  };

  const selectAlert = (sosId, focusOnMap, options = {}) => {
    const shouldRemoveNotification = options.removeNotification !== false;
    state.selectedSosId = Number(sosId);
    state.incidents.selectedSosId = state.selectedSosId;
    state.ui.selectedEntityType = 'sos';
    state.ui.selectedEntityId = String(sosId);
    state.gateAlerts.selectedGateId = null;
    state.standaloneAssets.selectedAssetKey = null;
    state.networkArcs.selectedEdgeKey = null;
    state.weather.selectedWeatherId = null;
    if (options.lockLabel === false) {
      clearMarkerLabelState();
    } else {
      setLockedMarkerLabel(createMarkerLabelRef('sos', state.selectedSosId));
    }
    if (shouldRemoveNotification) {
      removeNotificationsByTarget('sos', (target) => String(target.sosId) === String(sosId));
    }
    syncSelectedSmartResponseSelection();
    renderAll();
    if (focusOnMap && options.forceFocus !== false) {
      focusAlertOnMap(getSelectedAlert(), true);
    }
  };

  const selectGateAlertOptimistic = (gateId, options = {}) => {
    state.selectedSosId = null;
    state.incidents.selectedSosId = null;
    state.gateAlerts.selectedGateId = String(gateId);
    state.ui.selectedEntityType = 'gate';
    state.ui.selectedEntityId = String(gateId);
    state.standaloneAssets.selectedAssetKey = null;
    state.networkArcs.selectedEdgeKey = null;
    state.weather.selectedWeatherId = null;
    state.detailRenderKey = '';
    resetSelectedSmartResponseState();
    if (options.lockLabel === false) {
      clearMarkerLabelState({ preserveSosLocked: false });
    } else {
      setLockedMarkerLabel(createMarkerLabelRef('gate', gateId));
    }
    renderIncidentList();
    syncGateAlertMarkers();
    const gate = state.gateAlerts.items.get(String(gateId));
    if (options.focus && gate && gate.latLng) {
      focusEntityOnMap(gate.latLng, MAP_ZOOM_SOS);
    }
  };

  const selectStandaloneAssetOptimistic = (asset, options = {}) => {
    if (!asset) {
      return;
    }
    const assetKey = makeAssetKey(asset.asset_type, asset.id);
    state.selectedSosId = null;
    state.incidents.selectedSosId = null;
    state.gateAlerts.selectedGateId = null;
    state.standaloneAssets.selectedAssetKey = assetKey;
    state.standaloneAssets.selectedLabelLatLng =
      options.labelLatLng || asset.latLng || asset.position || null;
    state.ui.selectedEntityType = 'asset';
    state.ui.selectedEntityId = assetKey;
    state.cctvSelectedCameraId = String(asset.id || '');
    state.networkArcs.selectedEdgeKey = null;
    state.weather.selectedWeatherId = null;
    state.detailRenderKey = '';
    resetSelectedSmartResponseState();
    if (options.lockLabel === false) {
      clearMarkerLabelState({ preserveSosLocked: false });
    } else {
      setLockedMarkerLabel(
        createMarkerLabelRef('asset', assetKey, { latLng: state.standaloneAssets.selectedLabelLatLng })
      );
    }
    renderIncidentList();
    if (options.focus && asset.latLng) {
      focusEntityOnMap(asset.latLng, MAP_ZOOM_SOS);
    }
  };

  const clearSelectedAlert = () => {
    stopGateDetailDurationTimer();
    if (state.ui.selectedEntityType === 'asset') {
      closeCctvModal();
    }
    state.selectedSosId = null;
    state.incidents.selectedSosId = null;
    state.gateAlerts.selectedGateId = null;
    state.standaloneAssets.selectedAssetKey = null;
    state.vehicles.selectedVehicleId = null;
    state.cctvSelectedCameraId = '';
    state.networkArcs.selectedEdgeKey = null;
    state.weather.selectedWeatherId = null;
    state.ui.selectedEntityType = '';
    state.ui.selectedEntityId = null;
    state.detailRenderKey = '';
    resetSelectedSmartResponseState();
    clearMarkerLabelState({ preserveSosLocked: false });
    renderAll();
  };

  const loadOpenTickets = async () => {
    const response = await window.cameraService.getOpenSosTickets();
    if (!response || response.status >= 400) {
      throw new Error((response && response.message) || 'Gagal memuat open ticket SOS.');
    }
    debugLog('loadOpenTickets:raw', {
      responseKeys: response && typeof response === 'object' ? Object.keys(response) : [],
      dataType: response && response.data ? typeof response.data : typeof response,
      dataKeys:
        response && response.data && typeof response.data === 'object' && !Array.isArray(response.data)
          ? Object.keys(response.data)
          : [],
    });
    state.ticketsBySosId.clear();
    state.incidents.ticketsBySosId = state.ticketsBySosId;
    clearSmartResponseSummaryMaps();
    unwrapCollection(response.data).forEach((ticket) => {
      const normalized = normalizeTicket(ticket);
      if (normalized) {
        state.ticketsBySosId.set(normalized.sos_id, normalized);
        if (normalized.response_summary) {
          upsertSmartResponseSummary(normalized.response_summary, { patchTicket: false });
        }
      }
    });
    debugLog('loadOpenTickets:parsed', {
      count: state.ticketsBySosId.size,
      sosIds: Array.from(state.ticketsBySosId.keys()),
    });
    Array.from(state.alerts.values()).forEach((alert) => {
      const hasOpenTicket = state.ticketsBySosId.has(alert.sos_id);
      const wasDispatched =
        Number(alert.status) === 1 ||
        Boolean(alert.ticket && alert.ticket.ticket_no);
      if (!hasOpenTicket && wasDispatched) {
        alert.status = 2;
        if (alert.ticket) {
          alert.ticket = {
            ...alert.ticket,
            ticket_status: 2,
          };
        }
        removeSosAlertFromActiveView(alert.sos_id);
        return;
      }
      mergeTicketToAlert(alert);
    });
    if (state.ui.selectedEntityType === 'sos' && state.selectedSosId) {
      syncSelectedSmartResponseSelection();
    }
  };

  const loadSnapshot = async () => {
    const response = await window.cameraService.getSosAlerts();
    if (!response || response.status >= 400) {
      throw new Error((response && response.message) || 'Gagal memuat snapshot SOS.');
    }
    debugLog('loadSnapshot:raw', {
      responseKeys: response && typeof response === 'object' ? Object.keys(response) : [],
      dataType: response && response.data ? typeof response.data : typeof response,
      dataKeys:
        response && response.data && typeof response.data === 'object' && !Array.isArray(response.data)
          ? Object.keys(response.data)
          : [],
    });
    const rows = unwrapCollection(response.data);
    debugLog('loadSnapshot:rows', {
      count: rows.length,
      firstKeys: rows[0] && typeof rows[0] === 'object' ? Object.keys(rows[0]) : [],
    });
    const newAlerts = [];
    rows.forEach((item) => {
      const normalized = normalizeAlert(item);
      const previous = normalized ? state.alerts.get(normalized.sos_id) : null;
      const updated = upsertAlert(item, false);
      if (!previous && updated && Number(updated.status) !== 2 && state.isInitialSnapshotLoaded) {
        newAlerts.push(updated);
      }
    });
    return newAlerts;
  };

  const refreshDashboard = async () => {
    resetIncidentListAnimationState();
    state.ui.mapEmptyMessage = getDefaultMapEmptyMessage();
    setMapLoadingVisible(true);
    setIncidentListLoadingVisible(true);
    setVehicleListLoadingVisible(true);
    setConnectionBadge('Loading...', 'warning');
    debugLog('refreshDashboard:start');
    try {
      await loadMapBranches();
      const apiBaseUrl = await window.cameraService.getApiBaseUrl().catch(() => '');
      state.vehicles.apiBaseUrl = String(apiBaseUrl || '').trim();
      const branch = getSelectedBranch();
      if (
        state.map &&
        branch &&
        Number.isFinite(Number(branch.center_lat)) &&
        Number.isFinite(Number(branch.center_lng))
      ) {
        state.map.setCenter({ lat: Number(branch.center_lat), lng: Number(branch.center_lng) });
        if (Number(state.map.getZoom() || 0) < 11) {
          state.map.setZoom(11);
        }
      }
      await Promise.all([
        loadGateAlerts(),
        updateDefaultCctvMarkers(),
        loadNetworkArcs(),
        loadWeatherMarkers(),
        loadVehiclesLive(),
        loadVehiclesSummary(),
        loadSnapshot(),
        loadOpenTickets(),
      ]);
      state.isInitialSnapshotLoaded = true;
      ensureDefaultSosSelection();
      renderAll();
      setText(sosRouteTitleEl, 'MOVISION');
      renderAll();
      focusSelectedBranchOnMap();
      syncCameraModeForBranchSelection();
      setConnectionBadge('Live', 'success');
      debugLog('refreshDashboard:done', {
        alertCount: state.alerts.size,
        visibleCount: getVisibleAlerts().length,
        selectedSosId: state.selectedSosId,
      });
    } finally {
      setMapLoadingVisible(false);
      setIncidentListLoadingVisible(false);
      setVehicleListLoadingVisible(false);
    }
  };

  const applyMapSnapshot = (payload) => {
    if (!payload || typeof payload !== 'object') {
      return;
    }
    const hasGateAlertsPayload = Object.prototype.hasOwnProperty.call(payload, 'gate_alerts');
    const hasAssetsPayload = Object.prototype.hasOwnProperty.call(payload, 'assets');
    const hasVehiclesPayload = Object.prototype.hasOwnProperty.call(payload, 'vehicles');
    const hasSosResponsesPayload = Object.prototype.hasOwnProperty.call(payload, 'sos_responses');
    const gateAlerts = toArray(payload.gate_alerts)
      .map(normalizeGateAlert)
      .filter((gate) => gate && isEntityInSelectedBranch(gate.branch_id));
    const assets = toArray(payload.assets)
      .map(normalizeStandaloneAsset)
      .filter((asset) => asset && isEntityInSelectedBranch(asset.branch_id))
      .map((asset) => ({ ...asset, showInSummary: true }));
    const vehicles = toArray(payload.vehicles)
      .map((item) => normalizeVehicleLive(item, state.vehicles.apiBaseUrl))
      .filter((vehicle) => vehicle && isEntityInSelectedBranch(vehicle.branch_id));
    const sosAlerts = toArray(payload.sos).filter(Boolean);
    const sosResponses = toArray(payload.sos_responses).map(normalizeSmartResponseSummary).filter(Boolean);
    const branchId = getSelectedBranch() && getSelectedBranch().id ? String(getSelectedBranch().id) : '';
    if (hasGateAlertsPayload) {
      state.gateAlerts.items.clear();
      gateAlerts.forEach((gate) => {
        state.gateAlerts.items.set(String(gate.gate_id), {
          ...gate,
          showInSummary: gate.status === 'error' || gate.status === 'warning',
        });
      });
    }
    if (hasAssetsPayload) {
      assets.forEach((asset) => {
        const assetKey = makeAssetKey(asset.asset_type, asset.id);
        const currentAsset = state.standaloneAssets.items.get(assetKey) || null;
        const resolvedLatLng = asset.latLng || (currentAsset && currentAsset.latLng) || null;
        state.standaloneAssets.items.set(assetKey, {
          ...(currentAsset || {}),
          ...asset,
          lat: resolvedLatLng ? resolvedLatLng.lat : (currentAsset && Number.isFinite(currentAsset.lat) ? currentAsset.lat : asset.lat),
          lng: resolvedLatLng ? resolvedLatLng.lng : (currentAsset && Number.isFinite(currentAsset.lng) ? currentAsset.lng : asset.lng),
          latLng: resolvedLatLng,
          position: resolvedLatLng,
          showInSummary: true,
        });
      });
      if (branchId || isAllBranchesSelected()) {
        const branchKey = isAllBranchesSelected() ? ALL_BRANCHES_OPTION : branchId;
        const mergedAssets = Array.from(state.standaloneAssets.items.values())
          .filter((asset) => asset && (isAllBranchesSelected() || String(asset.branch_id || '') === branchId))
          .map((asset) => ({ ...asset, position: asset.latLng || asset.position || null }));
        state.cctvCacheByBranch.set(branchKey, mergedAssets);
      }
      void updateDefaultCctvMarkers();
    }
    if (hasVehiclesPayload) {
      const nextVehicleItems = new Map();
      vehicles.forEach((vehicle) => {
        const existing = state.vehicles.items.get(vehicle.vehicle_id) || null;
        nextVehicleItems.set(vehicle.vehicle_id, {
          ...(existing || {}),
          ...vehicle,
          renderLatLng: (existing && existing.renderLatLng) || vehicle.latLng,
        });
      });
      state.vehicles.items = nextVehicleItems;
      state.vehicles.lastSnapshotAt = Date.now();
    }
    if (hasSosResponsesPayload) {
      clearSmartResponseSummaryMaps();
      sosResponses.forEach((summary) => {
        upsertSmartResponseSummary(summary);
      });
    }
    if (Object.prototype.hasOwnProperty.call(payload, 'sos')) {
      state.alerts.clear();
      state.incidents.alerts = state.alerts;
    }
    if (sosAlerts.length) {
      sosAlerts.forEach((item) => upsertAlert(item, false));
    }
  };

  const applyGateAlertPatch = (payload) => {
    const normalized = normalizeGateAlert(payload);
    if (!normalized) {
      return;
    }
    if (!isEntityInSelectedBranch(normalized.branch_id)) {
      return;
    }
    state.gateAlerts.items.set(String(normalized.gate_id), {
      ...normalized,
      showInSummary: normalized.status === 'error' || normalized.status === 'warning',
    });
    requestIncidentListAnimation('data');
    syncGateAlertMarkers();
    pushGateStatusNotification(normalized);
    renderAll();
  };

  const applyStandaloneAssetPatch = async (payload) => {
    let normalized = normalizeStandaloneAsset(payload);
    if (!normalized) {
      return;
    }
    const shouldFetchDetail =
      !normalized.branch_id ||
      !normalized.latLng ||
      !String(normalized.title || '').trim() ||
      String(normalized.title || '').trim() === `${String(normalized.asset_type || '').toUpperCase()} ${String(normalized.id || '').trim()}`;
    if (shouldFetchDetail && normalized.asset_type && normalized.id) {
      try {
        const response = await window.cameraService.getMapAssetDetail(normalized.asset_type, normalized.id);
        if (response && response.status < 400) {
          const detailed = normalizeStandaloneAsset(unwrapSingle(response));
          if (detailed) {
            normalized = {
              ...normalized,
              ...detailed,
              lat: Number.isFinite(detailed.lat) ? detailed.lat : normalized.lat,
              lng: Number.isFinite(detailed.lng) ? detailed.lng : normalized.lng,
              latLng: detailed.latLng || normalized.latLng,
              title: String(detailed.title || normalized.title || '').trim(),
            };
          }
        }
      } catch (_) {
        // Keep partial realtime payload as fallback.
      }
    }
    if (!isEntityInSelectedBranch(normalized.branch_id)) {
      return;
    }
    const assetKey = makeAssetKey(normalized.asset_type, normalized.id);
    const branchId = isAllBranchesSelected() ? ALL_BRANCHES_OPTION : String(normalized.branch_id || '');
    const branchCache = Array.isArray(state.cctvCacheByBranch.get(branchId))
      ? state.cctvCacheByBranch.get(branchId).slice()
      : [];
    const cacheIndex = branchCache.findIndex(
      (item) => makeAssetKey(item.asset_type, item.id) === assetKey
    );
    const currentAsset =
      state.standaloneAssets.items.get(assetKey) || (cacheIndex >= 0 ? branchCache[cacheIndex] : null);
    const resolvedLatLng = normalized.latLng || (currentAsset && currentAsset.latLng) || null;
    const nextAsset = {
      ...(currentAsset || {}),
      ...normalized,
      lat: resolvedLatLng ? resolvedLatLng.lat : (currentAsset && Number.isFinite(currentAsset.lat) ? currentAsset.lat : normalized.lat),
      lng: resolvedLatLng ? resolvedLatLng.lng : (currentAsset && Number.isFinite(currentAsset.lng) ? currentAsset.lng : normalized.lng),
      latLng: resolvedLatLng,
      position: resolvedLatLng,
      showInSummary: true,
    };
    state.standaloneAssets.items.set(assetKey, nextAsset);
    if (cacheIndex >= 0) {
      branchCache.splice(cacheIndex, 1, nextAsset);
    } else {
      branchCache.push(nextAsset);
    }
    if (branchId) {
      state.cctvCacheByBranch.set(branchId, branchCache);
    }
    state.cctvCacheByBranch.delete(String(normalized.branch_id || ''));
    state.cctvCacheByBranch.delete(ALL_BRANCHES_OPTION);
    state.cctvMapBranchId = null;
    requestIncidentListAnimation('data');
    pushAssetStatusNotification(nextAsset);
    void updateDefaultCctvMarkers();
    renderAll();
  };

  const parseSse = (buffer, onMessage) => {
    const events = buffer.split('\n\n');
    events.slice(0, -1).forEach((chunk) => {
      let eventName = 'message';
      const payloadLines = [];
      chunk.split('\n').forEach((line) => {
        if (line.startsWith('event:')) {
          eventName = line.slice(6).trim();
          return;
        }
        if (line.startsWith('data:')) {
          payloadLines.push(line.slice(5).trim());
        }
      });
      if (!payloadLines.length) {
        return;
      }
      try {
        onMessage(eventName, JSON.parse(payloadLines.join('\n')));
      } catch (_) {
        // Ignore invalid payload.
      }
    });
    return events[events.length - 1] || '';
  };

  const handleStreamMessage = (eventName, payload) => {
    debugLog('handleStreamMessage', {
      eventName,
      itemCount: Array.isArray(payload) ? payload.length : 1,
      payloadKeys:
        payload && !Array.isArray(payload) && typeof payload === 'object' ? Object.keys(payload) : [],
    });
    if (eventName === 'snapshot') {
      resetIncidentListAnimationState();
      applyMapSnapshot(payload);
      syncGateAlertMarkers();
      syncMapMarkers();
      syncVehicleMarkers();
      void updateDefaultCctvMarkers();
      renderAll();
      return;
    }
    if (eventName === 'connected' || eventName === 'heartbeat') {
      stopVehicleFallbackLoop();
      return;
    }
    if (eventName === 'gate_status_changed') {
      applyGateAlertPatch(payload);
      renderAll();
      return;
    }
    if (eventName === 'asset_status_changed') {
      void applyStandaloneAssetPatch(payload);
      return;
    }
    if (eventName === 'vehicle_position_updated') {
      void applyVehiclePatch(payload);
      return;
    }
    if (eventName === 'sos_response_updated') {
      const summary = upsertSmartResponseSummary(payload);
      if (summary) {
        if (String(state.smartResponse.selectedTicketNo || '') === String(summary.ticket_no || '')) {
          syncSelectedSmartResponseSelection({ force: true });
        }
        renderIncidentList();
        renderSmartResponsePanel();
      }
      return;
    }
    let latestAlert = null;
    const patchedAlert = applyTicketPatch(payload);
    if (patchedAlert) {
      if (Number(patchedAlert.status) === 2) {
        removeSosAlertFromActiveView(patchedAlert.sos_id);
      }
      latestAlert = patchedAlert;
    }
    unwrapStreamPayload(payload).forEach((item) => {
      const updated = upsertAlert(item, true);
      if (updated) {
        latestAlert = updated;
      }
    });
    requestIncidentListAnimation('data');
    if (!reconcileIncidentSelectionWithFilters()) {
      renderAll();
    }
    if (latestAlert && Number(latestAlert.status) !== 2 && shouldAutoFocusLatestAlert()) {
      selectAlert(latestAlert.sos_id, true, { removeNotification: false, forceFocus: true });
    }
    if ((eventName === 'complete' || eventName === 'sos_completed') && latestAlert) {
      pushNotification(latestAlert, 'Kejadian SOS selesai');
    }
  };

  const scheduleStreamReconnect = () => {
    if (!state.isActive || state.streamRetryTimer) {
      return;
    }
    startVehicleFallbackLoop();
    setConnectionBadge('Reconnecting...', 'warning');
    state.streamRetryTimer = window.setTimeout(() => {
      state.streamRetryTimer = null;
      void connectStream();
    }, SOS_STREAM_RETRY_MS);
  };

  const stopStream = () => {
    if (state.streamAbortController) {
      state.streamAbortController.abort();
      state.streamAbortController = null;
    }
    if (state.streamRetryTimer) {
      clearTimeout(state.streamRetryTimer);
      state.streamRetryTimer = null;
    }
  };

  const connectStream = async () => {
    if (!state.isActive) {
      return;
    }
    stopStream();
    state.streamAbortController = new AbortController();
    try {
      const [apiBaseUrl, apiAuthToken] = await Promise.all([
        window.cameraService.getApiBaseUrl(),
        window.cameraService.getApiAuthToken(),
      ]);
      state.vehicles.apiBaseUrl = String(apiBaseUrl || '').trim();
      debugLog('connectStream:start', {
        apiBaseUrl,
        hasToken: Boolean(apiAuthToken),
      });
      const headers = {};
      if (apiAuthToken) {
        headers.Authorization = `Bearer ${apiAuthToken}`;
      }
      const response = await fetch(`${apiBaseUrl}/api/map-events/stream`, {
        headers,
        signal: state.streamAbortController.signal,
      });
      if (!response.ok || !response.body) {
        if (response.status === 401 && window.auth && typeof window.auth.logout === 'function') {
          await window.auth.logout().catch(() => {});
        }
        throw new Error(`SSE asset monitoring gagal dengan status ${response.status}`);
      }
      debugLog('connectStream:connected', {
        status: response.status,
      });
      stopVehicleFallbackLoop();
      setConnectionBadge('Streaming', 'success');
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      while (state.isActive) {
        const chunk = await reader.read();
        if (chunk.done) {
          break;
        }
        buffer += decoder.decode(chunk.value, { stream: true });
        buffer = parseSse(buffer, handleStreamMessage);
      }
      scheduleStreamReconnect();
    } catch (error) {
      if (!state.isActive || (error && error.name === 'AbortError')) {
        return;
      }
      debugLog('connectStream:error', {
        message: error && error.message ? error.message : String(error),
      });
      setConnectionBadge('Stream Error', 'danger');
      startVehicleFallbackLoop();
      scheduleStreamReconnect();
    }
  };

  const ensureMap = async () => {
    await ensureMapsLoaded();
    await ensureMapsCoreLibraryLoaded();
    if (!state.map) {
      debugLog('ensureMap:create');
      const colorScheme =
        window.google && window.google.maps && window.google.maps.ColorScheme
          ? state.mapContext.themePreset === 'dark-ops'
            ? window.google.maps.ColorScheme.DARK
            : state.mapContext.themePreset === 'default'
              ? window.google.maps.ColorScheme.FOLLOW_SYSTEM
              : window.google.maps.ColorScheme.LIGHT
          : undefined;
      state.map = new google.maps.Map(sosMapEl, {
        center: { lat: -6.2, lng: 106.8 },
        zoom: 12,
        tilt: state.mapContext.cameraMode === 'tilt' ? 30 : 0,
        heading: Number(state.mapContext.cameraHeading || 0),
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        cameraControl: true,
        cameraControlOptions:
          window.google && window.google.maps && window.google.maps.ControlPosition
            ? {
                position:
                  window.google.maps.ControlPosition.RIGHT_BOTTOM ||
                  window.google.maps.ControlPosition.BOTTOM_RIGHT,
              }
            : undefined,
        mapId: hasGoogleMapsMapId() ? getGoogleMapsMapId() : undefined,
        renderingType:
          window.google &&
          window.google.maps &&
          window.google.maps.RenderingType &&
          window.google.maps.RenderingType.VECTOR
            ? window.google.maps.RenderingType.VECTOR
            : undefined,
        tiltInteractionEnabled: true,
        headingInteractionEnabled: true,
        colorScheme,
        styles: hasGoogleMapsMapId() ? undefined : MAP_THEME_PRESETS[state.mapContext.themePreset],
      });
      state.trafficLayer = new google.maps.TrafficLayer();
      state.trafficLayer.setMap(state.map);
      state.gateProjectionOverlay = new google.maps.OverlayView();
      state.gateProjectionOverlay.onAdd = () => {};
      state.gateProjectionOverlay.draw = () => {};
      state.gateProjectionOverlay.onRemove = () => {};
      state.gateProjectionOverlay.setMap(state.map);
      state.cctvProjectionOverlay = new google.maps.OverlayView();
      state.cctvProjectionOverlay.onAdd = () => {};
      state.cctvProjectionOverlay.draw = () => {};
      state.cctvProjectionOverlay.onRemove = () => {};
      state.cctvProjectionOverlay.setMap(state.map);
      state.map.addListener('dragstart', () => {
        state.ui.mapInteractionActive = true;
        collapseCctvSpiderfy();
      });
      state.map.addListener('zoom_changed', () => {
        state.ui.mapInteractionActive = true;
        collapseCctvSpiderfy();
        renderMapCameraDebug();
        if (!isViewportCullingActive()) {
          syncGateAlertMarkers();
          syncWeatherMarkers();
          syncVehicleMarkers();
        }
      });
      state.map.addListener('idle', () => {
        syncInitialMapTiltIfNeeded();
        state.ui.mapInteractionActive = false;
        syncGateAlertMarkers();
        syncWeatherMarkers();
        syncVehicleMarkers();
        if (isViewportCullingActive()) {
          void updateDefaultCctvMarkers();
          return;
        }
        requestCctvClusterRender();
      });
      state.map.addListener('heading_changed', () => {
        renderMapCameraDebug();
      });
      state.map.addListener('tilt_changed', () => {
        renderMapCameraDebug();
      });
      state.map.addListener('click', () => {
        if (Date.now() < state.cctvSuppressMapClickUntil) {
          return;
        }
        collapseCctvSpiderfy();
        clearMarkerLabelState();
        if (state.vehicles.selectedVehicleId && state.ui.selectedEntityType === 'vehicle') {
          state.vehicles.selectedVehicleId = null;
          state.ui.selectedEntityType = '';
          state.ui.selectedEntityId = null;
          state.detailRenderKey = '';
          renderAll();
        }
        if (state.weather.selectedWeatherId) {
          state.weather.selectedWeatherId = null;
          if (state.ui.selectedEntityType === 'weather') {
            state.ui.selectedEntityType = '';
            state.ui.selectedEntityId = null;
            renderIncidentList();
          }
          syncWeatherMarkers();
        }
      });
    }
    ensureNetworkOverlay();
    syncMapThemeControlState();
    applyMapTheme(state.mapContext.themePreset);
    applyMapCameraMode(state.mapContext.cameraMode, { persist: false });
    logMapRuntimeCapabilities();
    renderMapCameraDebug();
    return state.map;
  };

  const setToolbarState = () => {
    disabledButtons.forEach((button) => {
      if (button) {
        button.disabled = state.isActive;
      }
    });
    if (pagingControlEl) {
      pagingControlEl.classList.toggle('hidden', state.isActive);
    }
    sosMonitorBtn.classList.toggle('is-active', state.isActive);
    setText(sosMonitorBtn, state.isActive ? 'Back to CCTV' : 'Go to Map');
    sosMonitorBtn.setAttribute(
      'title',
      state.isActive ? 'Kembali ke tampilan CCTV utama' : 'Buka Asset Monitoring'
    );
    sosMonitorBtn.disabled = !canUseAssetMonitoring() && !state.isActive;
  };

  const startTicketRefreshLoop = () => {
    if (state.ticketRefreshTimer) {
      clearInterval(state.ticketRefreshTimer);
    }
    state.ticketRefreshTimer = window.setInterval(() => {
      void loadOpenTickets()
        .then(() => {
          if (!reconcileIncidentSelectionWithFilters()) {
            renderAll();
          }
        })
        .catch(() => {});
    }, SOS_TICKET_REFRESH_MS);
  };

  const stopTicketRefreshLoop = () => {
    if (state.ticketRefreshTimer) {
      clearInterval(state.ticketRefreshTimer);
      state.ticketRefreshTimer = null;
    }
  };

  const startAlertRefreshLoop = () => {
    if (state.alertRefreshTimer) {
      clearInterval(state.alertRefreshTimer);
    }
    state.alertRefreshTimer = window.setInterval(() => {
      if (!state.isActive) {
        return;
      }
      void loadSnapshot()
        .then((newAlerts) => {
          if (Array.isArray(newAlerts) && newAlerts.length) {
            requestIncidentListAnimation('data');
          }
          renderAll();
          const latestAlert = Array.isArray(newAlerts)
            ? newAlerts.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))[0]
            : null;
          if (latestAlert && shouldAutoFocusLatestAlert()) {
            selectAlert(latestAlert.sos_id, true, { removeNotification: false, forceFocus: true, lockLabel: false });
          }
        })
        .catch(() => {});
    }, SOS_ALERT_SYNC_MS);
  };

  const stopAlertRefreshLoop = () => {
    if (state.alertRefreshTimer) {
      clearInterval(state.alertRefreshTimer);
      state.alertRefreshTimer = null;
    }
  };

  const handleSosKeyboardGuards = (event) => {
    if (!state.isActive) {
      return;
    }
    const key = String(event.key || '').toLowerCase();
    const usesShiftAlt = event.shiftKey && event.altKey && !event.ctrlKey && !event.metaKey;

    if (key === 'escape') {
      if (sosDispatchModalEl.classList.contains('visible')) {
        event.preventDefault();
        event.stopImmediatePropagation();
        hideModal(sosDispatchModalEl);
        return;
      }
      if (sosCompleteModalEl.classList.contains('visible')) {
        event.preventDefault();
        event.stopImmediatePropagation();
        hideModal(sosCompleteModalEl);
        return;
      }
      if (sosCctvModalEl.classList.contains('visible')) {
        event.preventDefault();
        event.stopImmediatePropagation();
        closeCctvModal();
      }
      return;
    }

    if (!usesShiftAlt) {
      return;
    }

    if (key === 'h') {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (typeof window.showHelp === 'function') {
        window.showHelp();
      }
      return;
    }

    if (key === 'k') {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (typeof window.openApiBaseUrlConfig === 'function') {
        void window.openApiBaseUrlConfig();
      }
      return;
    }

    if (key === 'u') {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (typeof window.openUpdateFeedConfig === 'function') {
        void window.openUpdateFeedConfig();
      }
      return;
    }

    if (key === 'b') {
      event.preventDefault();
      event.stopImmediatePropagation();
      toggleMapCameraDebugVisibility();
    }
  };

  const loadWorkspaceBranchContext = async () => {
    if (!window.appState || typeof window.appState.getWorkspaceState !== 'function') {
      state.activeWorkspaceBranch = null;
      return;
    }
    try {
      const response = await window.appState.getWorkspaceState();
      if (!response || response.status >= 400) {
        return;
      }
      const workspaceState = response.data || null;
      state.activeWorkspaceBranch =
        workspaceState && workspaceState.activeBranch && workspaceState.activeBranch.id
          ? workspaceState.activeBranch
          : null;
      const assetMonitoringPrefs =
        workspaceState && workspaceState.assetMonitoring && typeof workspaceState.assetMonitoring === 'object'
          ? workspaceState.assetMonitoring
          : null;
      if (assetMonitoringPrefs && assetMonitoringPrefs.mapThemePreset) {
        state.mapContext.themePreset = String(assetMonitoringPrefs.mapThemePreset);
      }
      state.mapContext.cameraMode = 'tilt';
      if (assetMonitoringPrefs && Number.isFinite(Number(assetMonitoringPrefs.mapCameraHeading))) {
        state.mapContext.cameraHeading = Number(assetMonitoringPrefs.mapCameraHeading);
      }
      if (assetMonitoringPrefs && Object.prototype.hasOwnProperty.call(assetMonitoringPrefs, 'networkVisible')) {
        state.networkArcs.visible = Boolean(assetMonitoringPrefs.networkVisible);
      }
      if (assetMonitoringPrefs && Object.prototype.hasOwnProperty.call(assetMonitoringPrefs, 'animatedNetworkArcsEnabled')) {
        state.networkArcs.experimentalEnabled = Boolean(assetMonitoringPrefs.animatedNetworkArcsEnabled);
      }
      if (assetMonitoringPrefs && Object.prototype.hasOwnProperty.call(assetMonitoringPrefs, 'weatherVisible')) {
        state.weather.visible = Boolean(assetMonitoringPrefs.weatherVisible);
      }
      if (assetMonitoringPrefs && Object.prototype.hasOwnProperty.call(assetMonitoringPrefs, 'weatherExpandAllBubbles')) {
        state.weather.expandAllBubbles = Boolean(assetMonitoringPrefs.weatherExpandAllBubbles);
      }
      if (assetMonitoringPrefs && assetMonitoringPrefs.markerStatusFilters && typeof assetMonitoringPrefs.markerStatusFilters === 'object') {
        state.markerStatusFilters = {
          normal: assetMonitoringPrefs.markerStatusFilters.normal !== false,
          warning: assetMonitoringPrefs.markerStatusFilters.warning !== false,
          error: assetMonitoringPrefs.markerStatusFilters.error !== false,
        };
      }
      if (
        assetMonitoringPrefs &&
        String(assetMonitoringPrefs.selectedBranchId || '') === ALL_BRANCHES_OPTION
      ) {
        state.weather.visible = false;
      }
      if (assetMonitoringPrefs && assetMonitoringPrefs.selectedBranchId && !state.mapContext.selectedBranch) {
        state.mapContext.selectedBranch = {
          id: String(assetMonitoringPrefs.selectedBranchId),
          branch_code: '',
          branch_name: '',
        };
      }
      debugLog('loadWorkspaceBranchContext', {
        branchId: state.activeWorkspaceBranch && state.activeWorkspaceBranch.id,
      });
    } catch (_) {
      state.activeWorkspaceBranch = null;
    }
  };

  const persistAssetMonitoringPrefs = async () => {
    if (!window.appState || typeof window.appState.getWorkspaceState !== 'function' || typeof window.appState.saveWorkspaceState !== 'function') {
      return;
    }
    try {
      const current = await window.appState.getWorkspaceState();
      const workspaceState = (current && current.data) || {};
      const nextState = {
        ...workspaceState,
        viewMode: state.isActive ? 'asset-monitoring' : 'cctv',
        assetMonitoring: {
          ...(workspaceState.assetMonitoring || {}),
          selectedBranchId:
            state.mapContext.selectedBranch && state.mapContext.selectedBranch.id
              ? String(state.mapContext.selectedBranch.id)
              : '',
          mapThemePreset: state.mapContext.themePreset,
          mapCameraMode: state.mapContext.cameraMode,
          mapCameraHeading: Number(state.mapContext.cameraHeading || 0),
          networkVisible: state.networkArcs.visible,
          animatedNetworkArcsEnabled: state.networkArcs.experimentalEnabled,
          weatherVisible: state.weather.visible,
          weatherExpandAllBubbles: state.weather.expandAllBubbles,
          markerStatusFilters: {
            ...state.markerStatusFilters,
          },
        },
      };
      await window.appState.saveWorkspaceState(nextState);
    } catch (_) {
      // Ignore workspace persistence failure for monitoring preferences.
    }
  };

  const enterAssetMonitoringMode = async () => {
    if (state.isActive) {
      return;
    }
    if (!canUseAssetMonitoring()) {
      throw new Error('Akun ini tidak memiliki akses Asset Monitoring.');
    }
    debugLog('enterAssetMonitoringMode', {
      selectedBranchId: state.mapContext.selectedBranch && state.mapContext.selectedBranch.id,
      workspaceBranchId: state.activeWorkspaceBranch && state.activeWorkspaceBranch.id,
    });
    state.isActive = true;
    state.ui.initialTiltSyncPending = true;
    document.body.classList.add('sos-mode');
    sosDashboardEl.classList.remove('hidden');
    cameraGridEl.classList.add('hidden');
    if (typeof window.__HKTV_PAUSE_GRID_STREAMS__ === 'function') {
      window.__HKTV_PAUSE_GRID_STREAMS__();
    }
    try {
      state.notificationTimers.forEach((timer) => window.clearTimeout(timer));
      state.notificationTimers.clear();
      state.notificationLeavingIds.clear();
      state.notifications = [];
      state.incidents.notifications = state.notifications;
      state.selectedSosId = null;
      state.incidents.selectedSosId = null;
      state.isInitialSnapshotLoaded = false;
      state.cctvVisible = sosCctvToggleEl ? Boolean(sosCctvToggleEl.checked) : true;
      state.vmsVisible = sosVmsToggleEl ? Boolean(sosVmsToggleEl.checked) : true;
      state.gateAlerts.visible = sosGateToggleEl ? Boolean(sosGateToggleEl.checked) : true;
      resetStandaloneLayerState();
      resetNetworkLayerState();
      resetWeatherLayerState();
      renderNotifications();
      setToolbarState();
      state.ui.mapEmptyMessage = getDefaultMapEmptyMessage();
      setMapLoadingVisible(true);
      await loadWorkspaceBranchContext();
      syncMapThemeControlState();
      renderMapCameraModeControls();
      if (sosNetworkToggleEl) {
        sosNetworkToggleEl.checked = state.networkArcs.visible;
      }
      if (sosAnimatedNetworkToggleEl) {
        sosAnimatedNetworkToggleEl.checked = state.networkArcs.experimentalEnabled;
      }
      if (sosWeatherToggleEl) {
        syncWeatherToggleState();
      }
      if (sosMarkerNormalToggleEl) {
        sosMarkerNormalToggleEl.checked = state.markerStatusFilters.normal;
      }
      if (sosMarkerWarningToggleEl) {
        sosMarkerWarningToggleEl.checked = state.markerStatusFilters.warning;
      }
      if (sosMarkerErrorToggleEl) {
        sosMarkerErrorToggleEl.checked = state.markerStatusFilters.error;
      }
      await ensureMap();
      await refreshDashboard();
      void persistAssetMonitoringPrefs();
      startTicketRefreshLoop();
      void connectStream();
      debugLog('enterAssetMonitoringMode:ready', {
        selectedBranchId: state.mapContext.selectedBranch && state.mapContext.selectedBranch.id,
        incidents: state.incidents.alerts.size,
      });
    } catch (error) {
      // Roll back the UI immediately so a failed asset bootstrap does not leave the app on a blank background.
      debugLog('enterAssetMonitoringMode:failed', {
        message: error && error.message ? error.message : 'Unknown error',
      });
      leaveAssetMonitoringMode();
      throw error;
    }
  };

  const leaveAssetMonitoringMode = () => {
    debugLog('leaveAssetMonitoringMode', {
      selectedBranchId: state.mapContext.selectedBranch && state.mapContext.selectedBranch.id,
    });
    state.isActive = false;
    setAssetFilterPopupVisible(false);
    setFoControlPopupVisible(false);
    setWeatherControlPopupVisible(false);
    if (vehicleControlPopup) {
      vehicleControlPopup.classList.add('hidden');
    }
    setBranchControlPopupVisible(false);
    document.body.classList.remove('sos-mode');
    sosDashboardEl.classList.add('hidden');
    cameraGridEl.classList.remove('hidden');
    state.notificationLeavingIds.clear();
    hideModal(sosDispatchModalEl);
    hideModal(sosCompleteModalEl);
    closeCctvModal();
    stopGateDetailDurationTimer();
    state.gateAlerts.selectedGateId = null;
    state.vehicles.selectedVehicleId = null;
    state.ui.selectedEntityType = '';
    state.ui.selectedEntityId = null;
    clearGateMarkers();
    clearVehicleMarkers();
    clearVehicleDetailCache();
    resetStandaloneLayerState();
    resetNetworkLayerState();
    resetWeatherLayerState();
    stopStream();
    stopTicketRefreshLoop();
    stopVehicleFallbackLoop();
    setConnectionBadge('Idle', 'neutral');
    setToolbarState();
    void persistAssetMonitoringPrefs();
    if (typeof window.__HKTV_RESUME_GRID_STREAMS__ === 'function') {
      void window.__HKTV_RESUME_GRID_STREAMS__();
    }
  };

  const openDispatchModal = () => {
    if (!canDispatchSos()) {
      setConnectionBadge('Akun ini tidak memiliki izin dispatch SOS.', 'warning');
      return;
    }
    const alert = getSelectedAlert();
    if (!alert) {
      return;
    }
    sosDispatchSosIdEl.value = String(alert.sos_id);
    sosIncidentTypeInputEl.value = toSentenceCase(
      alert.ticket && alert.ticket.incident_type ? alert.ticket.incident_type : ''
    );
    sosVehicleTypeInputEl.value = toSentenceCase(
      alert.ticket && alert.ticket.vehicle_type ? alert.ticket.vehicle_type : ''
    );
    sosChronologyInputEl.value =
      toSentenceCase(alert.ticket && alert.ticket.initial_chronology ? alert.ticket.initial_chronology : '');
    setClass(sosDispatchStatusEl, 'api-check-status neutral');
    setText(sosDispatchStatusEl, 'Lengkapi dispatch untuk kejadian terpilih.');
    showModal(sosDispatchModalEl);
  };

  const openCompleteModal = () => {
    if (!canCompleteSos()) {
      setConnectionBadge('Akun ini tidak memiliki izin menyelesaikan ticket SOS.', 'warning');
      return;
    }
    const alert = getSelectedAlert();
    if (!(alert && alert.ticket && alert.ticket.ticket_no)) {
      return;
    }
    sosCompleteTicketNoEl.value = String(alert.ticket.ticket_no);
    sosCompletionNoteInputEl.value = '';
    setClass(sosCompleteStatusEl, 'api-check-status neutral');
    setText(sosCompleteStatusEl, 'Isi catatan penyelesaian untuk ticket terpilih.');
    showModal(sosCompleteModalEl);
  };

  const completeSelectedTicket = async () => {
    if (!canCompleteSos()) {
      throw new Error('Akun ini tidak memiliki izin menyelesaikan ticket SOS.');
    }
    const alert = getSelectedAlert();
    if (!(alert && alert.ticket && alert.ticket.ticket_no)) {
      return;
    }
    applySentenceCaseValue(sosCompletionNoteInputEl);
    const completionNote = toSentenceCase(sosCompletionNoteInputEl.value);
    if (!completionNote) {
      throw new Error('Catatan penyelesaian wajib diisi.');
    }
    const response = await window.cameraService.completeSosTicket(alert.ticket.ticket_no, {
      completion_note: completionNote,
    });
    if (!response || response.status >= 400) {
      throw new Error((response && response.message) || 'Gagal menyelesaikan ticket SOS.');
    }
    alert.status = 2;
    if (alert.ticket) {
      alert.ticket.ticket_status = 2;
    }
    state.ticketsBySosId.delete(alert.sos_id);
    state.incidents.ticketsBySosId = state.ticketsBySosId;
    pushNotification(alert, 'Ticket SOS diselesaikan');
    removeSosAlertFromActiveView(alert.sos_id, { clearSelection: true });
    hideModal(sosCompleteModalEl);
  };

  const confirmSelectedSmartResponseArrival = async (vehicleId) => {
    const ticketNo = String(state.smartResponse.selectedTicketNo || '').trim();
    const normalizedVehicleId = Number(vehicleId);
    if (!ticketNo || !Number.isFinite(normalizedVehicleId)) {
      return;
    }
    state.smartResponse.confirmArrivalError = '';
    state.smartResponse.confirmArrivalSuccessMessage = '';
    state.smartResponse.confirmArrivalSubmittingVehicleId = normalizedVehicleId;
    renderSmartResponsePanel();
    try {
      const response = await window.cameraService.confirmSosTicketArrival(ticketNo, {
        vehicle_id: normalizedVehicleId,
      });
      if (!response || response.status >= 400) {
        throw new Error((response && response.message) || 'Confirm arrival gagal.');
      }
      state.smartResponse.confirmArrivalSuccessMessage = 'Confirm arrival berhasil dikirim.';
      syncSelectedSmartResponseSelection({ force: true });
      await loadOpenTickets().catch(() => {});
      renderIncidentList();
      renderSmartResponsePanel();
    } catch (error) {
      state.smartResponse.confirmArrivalError = error && error.message ? error.message : 'Confirm arrival gagal.';
      renderDetailPanel();
      renderSmartResponsePanel();
    } finally {
      state.smartResponse.confirmArrivalSubmittingVehicleId = null;
      renderDetailPanel();
      renderSmartResponsePanel();
    }
  };

  sosMonitorBtn.addEventListener('click', () => {
    if (state.isActive) {
      leaveAssetMonitoringMode();
      return;
    }
    void enterAssetMonitoringMode().catch((error) => {
      setConnectionBadge(error.message || 'Gagal membuka asset monitoring.', 'danger');
    });
  });

  const restoreAssetMonitoringMode = async () => {
    if (window.__HKTV_AUTH_BOOTSTRAP_PROMISE__) {
      await window.__HKTV_AUTH_BOOTSTRAP_PROMISE__;
    }
    if (!canUseAssetMonitoring()) {
      setToolbarState();
      return;
    }
    if (!window.appState || typeof window.appState.getWorkspaceState !== 'function') {
      return;
    }
    const response = await window.appState.getWorkspaceState();
    if (!response || response.status >= 400) {
      return;
    }
    const workspaceState = response.data || null;
    if (!workspaceState || String(workspaceState.viewMode || '').toLowerCase() !== 'asset-monitoring') {
      return;
    }
    await enterAssetMonitoringMode();
  };

  sosRefreshBtn.addEventListener('click', () => {
    void refreshDashboard().catch((error) => {
      setConnectionBadge(error.message || 'Refresh asset monitoring gagal.', 'danger');
    });
  });

  if (sosMapNormalBtn) {
    sosMapNormalBtn.addEventListener('click', () => {
      applyMapCameraMode('normal');
    });
  }

  if (sosMapTiltBtn) {
    sosMapTiltBtn.addEventListener('click', () => {
      applyMapCameraMode('tilt');
    });
  }

  if (sosMapRotateLeftBtn) {
    sosMapRotateLeftBtn.addEventListener('click', () => {
      rotateMapCamera(-25);
    });
  }

  if (sosMapRotateRightBtn) {
    sosMapRotateRightBtn.addEventListener('click', () => {
      rotateMapCamera(25);
    });
  }

  if (sosMapResetCameraBtn) {
    sosMapResetCameraBtn.addEventListener('click', () => {
      centerMapForCurrentSelection();
    });
  }

  if (sosCctvToggleEl) {
    sosCctvToggleEl.addEventListener('change', () => {
      state.cctvVisible = Boolean(sosCctvToggleEl.checked);
      renderSummary();
      renderIncidentList();
      if (!state.cctvVisible && !state.vmsVisible) {
        closeCctvModal();
        clearCctvMarkers();
        updateMapEmptyState(getVisibleAlerts().length ? '' : 'Marker CCTV dan VMS sedang disembunyikan.');
        return;
      }
      void updateDefaultCctvMarkers();
    });
  }

  if (sosVmsToggleEl) {
    sosVmsToggleEl.addEventListener('change', () => {
      state.vmsVisible = Boolean(sosVmsToggleEl.checked);
      renderSummary();
      renderIncidentList();
      if (!state.cctvVisible && !state.vmsVisible) {
        closeCctvModal();
        clearCctvMarkers();
        updateMapEmptyState(getVisibleAlerts().length ? '' : 'Marker CCTV dan VMS sedang disembunyikan.');
        return;
      }
      void updateDefaultCctvMarkers();
    });
  }

  if (sosGateToggleEl) {
    sosGateToggleEl.addEventListener('change', () => {
      state.gateAlerts.visible = Boolean(sosGateToggleEl.checked);
      if (!state.gateAlerts.visible) {
        clearGateMarkers();
        updateMapEmptyState(getVisibleAlerts().length ? '' : 'Marker gerbang sedang disembunyikan.');
        return;
      }
      syncGateAlertMarkers();
      updateMapEmptyState('');
    });
  }

  if (sosIncidentFiltersEl) {
    sosIncidentFiltersEl.addEventListener('click', (event) => {
      const button =
        event.target instanceof HTMLElement ? event.target.closest('[data-incident-filter]') : null;
      if (!button) {
        return;
      }
      event.preventDefault();
      toggleIncidentFilter(button.getAttribute('data-incident-filter'));
    });
  }

  if (sosNetworkToggleEl) {
    sosNetworkToggleEl.addEventListener('change', () => {
      state.networkArcs.visible = Boolean(sosNetworkToggleEl.checked);
      if (!state.networkArcs.visible) {
        hideNetworkArcTooltip();
        if (state.ui.selectedEntityType === 'network') {
          state.networkArcs.selectedEdgeKey = null;
          state.ui.selectedEntityType = '';
          state.ui.selectedEntityId = null;
          state.detailRenderKey = '';
        }
      }
      void persistAssetMonitoringPrefs();
      syncFoControlButtonState();
      renderAll();
      updateMapEmptyState('');
    });
  }

  if (sosAnimatedNetworkToggleEl) {
    sosAnimatedNetworkToggleEl.addEventListener('change', () => {
      state.networkArcs.experimentalEnabled = Boolean(sosAnimatedNetworkToggleEl.checked);
      if (!state.networkArcs.experimentalEnabled) {
        stopNetworkArcAnimation({ resetTime: true });
      }
      void persistAssetMonitoringPrefs();
      syncFoControlButtonState();
      renderAssetToolbar();
      syncNetworkOverlay();
      updateMapEmptyState('');
    });
  }

  if (assetFilterBtn) {
    assetFilterBtn.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      setToolbarMenuPanelVisible(false);
      setFoControlPopupVisible(false);
      setWeatherControlPopupVisible(false);
      setAssetFilterPopupVisible(!(assetFilterPopup && !assetFilterPopup.classList.contains('hidden')));
    });
  }

  if (assetFilterPopup) {
    assetFilterPopup.addEventListener('click', (event) => {
      event.stopPropagation();
    });
  }

  if (foControlBtn) {
    foControlBtn.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      setToolbarMenuPanelVisible(false);
      setAssetFilterPopupVisible(false);
      setWeatherControlPopupVisible(false);
      setFoControlPopupVisible(!(foControlPopup && !foControlPopup.classList.contains('hidden')));
    });
  }

  if (foControlPopup) {
    foControlPopup.addEventListener('click', (event) => {
      event.stopPropagation();
    });
  }

  if (weatherControlBtn) {
    weatherControlBtn.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      setToolbarMenuPanelVisible(false);
      setAssetFilterPopupVisible(false);
      setFoControlPopupVisible(false);
      setWeatherControlPopupVisible(!(weatherControlPopup && !weatherControlPopup.classList.contains('hidden')));
    });
  }

  if (weatherControlPopup) {
    weatherControlPopup.addEventListener('click', (event) => {
      event.stopPropagation();
    });
  }

  if (sosBranchControlBtn) {
    sosBranchControlBtn.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      setToolbarMenuPanelVisible(false);
      setAssetFilterPopupVisible(false);
      setFoControlPopupVisible(false);
      setWeatherControlPopupVisible(false);
      setBranchControlPopupVisible(!(sosBranchControlPopup && !sosBranchControlPopup.classList.contains('hidden')));
    });
  }

  if (sosBranchControlPopup) {
    sosBranchControlPopup.addEventListener('click', (event) => {
      event.stopPropagation();
    });
  }

  if (sosBranchControlOptionsEl) {
    sosBranchControlOptionsEl.addEventListener('click', (event) => {
      const target = event.target instanceof HTMLElement ? event.target.closest('[data-branch-option]') : null;
      if (!target) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      const nextBranchId = String(target.getAttribute('data-branch-option') || '');
      setBranchControlPopupVisible(false);
      applySelectedMonitoringBranch(nextBranchId);
    });
  }

  const handleMarkerStatusFilterChange = () => {
    state.markerStatusFilters.normal = sosMarkerNormalToggleEl ? Boolean(sosMarkerNormalToggleEl.checked) : true;
    state.markerStatusFilters.warning = sosMarkerWarningToggleEl ? Boolean(sosMarkerWarningToggleEl.checked) : true;
    state.markerStatusFilters.error = sosMarkerErrorToggleEl ? Boolean(sosMarkerErrorToggleEl.checked) : true;
    const selectedGate = state.gateAlerts.selectedGateId
      ? state.gateAlerts.items.get(String(state.gateAlerts.selectedGateId))
      : null;
    if (selectedGate && !shouldDisplayGateStatus(selectedGate)) {
      state.gateAlerts.selectedGateId = null;
      if (state.ui.selectedEntityType === 'gate') {
        state.ui.selectedEntityType = '';
        state.ui.selectedEntityId = null;
        clearMarkerLabelState({ preserveSosLocked: false });
      }
    }
    const selectedAsset = state.standaloneAssets.selectedAssetKey
      ? state.standaloneAssets.items.get(String(state.standaloneAssets.selectedAssetKey))
      : null;
    if (selectedAsset && !shouldDisplayStandaloneAssetStatus(selectedAsset)) {
      state.standaloneAssets.selectedAssetKey = null;
      closeCctvModal();
      if (state.ui.selectedEntityType === 'asset') {
        state.ui.selectedEntityType = '';
        state.ui.selectedEntityId = null;
        clearMarkerLabelState({ preserveSosLocked: false });
      }
    }
    void persistAssetMonitoringPrefs();
    syncGateAlertMarkers();
    void updateDefaultCctvMarkers();
    renderAll();
    updateMapEmptyState('');
  };

  if (sosMarkerNormalToggleEl) {
    sosMarkerNormalToggleEl.addEventListener('change', handleMarkerStatusFilterChange);
  }

  if (sosMarkerWarningToggleEl) {
    sosMarkerWarningToggleEl.addEventListener('change', handleMarkerStatusFilterChange);
  }

  if (sosMarkerErrorToggleEl) {
    sosMarkerErrorToggleEl.addEventListener('change', handleMarkerStatusFilterChange);
  }

  document.addEventListener('click', (event) => {
    if (!assetFilterPopup || assetFilterPopup.classList.contains('hidden')) {
      return;
    }
    const target = event.target instanceof HTMLElement ? event.target : null;
    if (!target || (!assetFilterPopup.contains(target) && !(assetFilterBtn && assetFilterBtn.contains(target)))) {
      setAssetFilterPopupVisible(false);
    }
  });

  document.addEventListener('click', (event) => {
    if (!foControlPopup || foControlPopup.classList.contains('hidden')) {
      return;
    }
    const target = event.target instanceof HTMLElement ? event.target : null;
    if (!target || (!foControlPopup.contains(target) && !(foControlBtn && foControlBtn.contains(target)))) {
      setFoControlPopupVisible(false);
    }
  });

  document.addEventListener('click', (event) => {
    if (!weatherControlPopup || weatherControlPopup.classList.contains('hidden')) {
      return;
    }
    const target = event.target instanceof HTMLElement ? event.target : null;
    if (!target || (!weatherControlPopup.contains(target) && !(weatherControlBtn && weatherControlBtn.contains(target)))) {
      setWeatherControlPopupVisible(false);
    }
  });

  document.addEventListener('click', (event) => {
    if (!sosBranchControlPopup || sosBranchControlPopup.classList.contains('hidden')) {
      return;
    }
    const target = event.target instanceof HTMLElement ? event.target : null;
    if (!target || (!sosBranchControlPopup.contains(target) && !(sosBranchControlBtn && sosBranchControlBtn.contains(target)))) {
      setBranchControlPopupVisible(false);
    }
  });

  document.addEventListener('click', (event) => {
    if (Date.now() < state.cctvSuppressMapClickUntil) {
      return;
    }
    const target = event.target instanceof HTMLElement ? event.target : null;
    if (!target) {
      return;
    }
    if (toolbarMenuBtnEl && toolbarMenuBtnEl.contains(target)) {
      setAssetFilterPopupVisible(false);
      setFoControlPopupVisible(false);
      setWeatherControlPopupVisible(false);
      setBranchControlPopupVisible(false);
      return;
    }
    if (assetFilterBtn && assetFilterBtn.contains(target)) {
      setFoControlPopupVisible(false);
      setWeatherControlPopupVisible(false);
      setBranchControlPopupVisible(false);
      setToolbarMenuPanelVisible(false);
      return;
    }
    if (foControlBtn && foControlBtn.contains(target)) {
      setAssetFilterPopupVisible(false);
      setWeatherControlPopupVisible(false);
      setBranchControlPopupVisible(false);
      setToolbarMenuPanelVisible(false);
      return;
    }
    if (weatherControlBtn && weatherControlBtn.contains(target)) {
      setAssetFilterPopupVisible(false);
      setFoControlPopupVisible(false);
      setBranchControlPopupVisible(false);
      setToolbarMenuPanelVisible(false);
      return;
    }
    if (sosBranchControlBtn && sosBranchControlBtn.contains(target)) {
      setAssetFilterPopupVisible(false);
      setFoControlPopupVisible(false);
      setWeatherControlPopupVisible(false);
      setToolbarMenuPanelVisible(false);
    }
  });

  document.addEventListener('click', (event) => {
    const target = event.target instanceof HTMLElement ? event.target : null;
    if (!target) {
      return;
    }
    if (
      target.closest('.sos-map-marker') ||
      target.closest('[data-entity-type]') ||
      target.closest('[data-notification-open]') ||
      target.closest('.selected-map-label')
    ) {
      return;
    }
    clearMarkerLabelState();
  });

  if (sosWeatherToggleEl) {
    sosWeatherToggleEl.addEventListener('change', () => {
      state.weather.visible = Boolean(sosWeatherToggleEl.checked);
      if (!state.weather.visible) {
        state.weather.selectedWeatherId = null;
        if (state.ui.selectedEntityType === 'weather') {
          state.ui.selectedEntityType = '';
          state.ui.selectedEntityId = null;
        }
        clearWeatherMarkers();
        renderSummary();
        renderAssetToolbar();
        renderIncidentList();
        updateMapEmptyState('');
        void persistAssetMonitoringPrefs();
        return;
      }
      void loadWeatherMarkers()
        .then(() => {
          renderSummary();
          renderAssetToolbar();
          renderIncidentList();
          updateMapEmptyState('');
        })
        .catch((error) => {
          state.weather.errorMessage =
            error && error.message ? error.message : 'Gagal memuat marker weather.';
          clearWeatherMarkers();
          renderAssetToolbar();
          updateMapEmptyState('');
        });
      void persistAssetMonitoringPrefs();
    });
  }

  if (sosWeatherBubbleToggleEl) {
    sosWeatherBubbleToggleEl.addEventListener('change', () => {
      state.weather.expandAllBubbles = Boolean(sosWeatherBubbleToggleEl.checked);
      syncWeatherMarkers();
      renderAssetToolbar();
      void persistAssetMonitoringPrefs();
    });
  }

  window.addEventListener('app-appearance-change', () => {
    weatherIconSourceCache.clear();
    weatherIconSourcePromiseCache.clear();
    if (!state.isActive) {
      return;
    }
    syncWeatherMarkers();
    renderIncidentList();
  });

  sosNotificationListEl.addEventListener('click', (event) => {
    const closeButton =
      event.target instanceof HTMLElement ? event.target.closest('[data-notification-close]') : null;
    if (closeButton) {
      event.preventDefault();
      event.stopPropagation();
      removeNotification(closeButton.getAttribute('data-notification-close'));
      return;
    }
    const target =
      event.target instanceof HTMLElement ? event.target.closest('[data-notification-open]') : null;
    if (target) {
      const notificationId = target.getAttribute('data-notification-open') || '';
      const entry = state.notifications.find((item) => String(item.id) === String(notificationId));
      if (!entry || !entry.target) {
        return;
      }
      if (entry.target.type === 'sos') {
        selectAlert(entry.target.sosId, false, { lockLabel: false });
        return;
      }
      if (entry.target.type === 'gate') {
        selectGateAlertOptimistic(entry.target.gateId, { focus: false, lockLabel: false });
        void openGateAlertDetail(entry.target.gateId);
        return;
      }
      if (entry.target.type === 'asset') {
        const asset = state.standaloneAssets.items.get(makeAssetKey(entry.target.assetType, entry.target.assetId));
        selectStandaloneAssetOptimistic(asset || {
          asset_type: entry.target.assetType,
          id: entry.target.assetId,
        }, { focus: false, lockLabel: false });
        void openCctvModal(asset || {
          asset_type: entry.target.assetType,
          id: entry.target.assetId,
        });
      }
    }
  });

  if (sosDetailBodyEl) {
    sosDetailBodyEl.addEventListener('click', (event) => {
      const target =
        event.target instanceof HTMLElement ? event.target.closest('[data-confirm-arrival]') : null;
      if (!target) {
        return;
      }
      event.preventDefault();
      const vehicleId = Number(target.getAttribute('data-confirm-arrival'));
      if (!Number.isFinite(vehicleId)) {
        return;
      }
      void confirmSelectedSmartResponseArrival(vehicleId);
    });
  }

  if (sosSmartResponseBodyEl) {
    sosSmartResponseBodyEl.addEventListener('click', (event) => {
      const element = event.target instanceof HTMLElement ? event.target : null;
      if (!element) {
        return;
      }
      const tabTrigger = element.closest('[data-smart-tab]');
      if (tabTrigger) {
        event.preventDefault();
        setSmartResponseTab(tabTrigger.getAttribute('data-smart-tab') || 'summary');
        return;
      }
      const confirmArrivalTrigger = element.closest('[data-confirm-arrival]');
      if (confirmArrivalTrigger) {
        event.preventDefault();
        const vehicleId = Number(confirmArrivalTrigger.getAttribute('data-confirm-arrival'));
        if (!Number.isFinite(vehicleId)) {
          return;
        }
        void confirmSelectedSmartResponseArrival(vehicleId);
        return;
      }
      const candidateTrigger = element.closest('[data-candidate-expand]');
      if (candidateTrigger) {
        event.preventDefault();
        const vehicleId = Number(candidateTrigger.getAttribute('data-candidate-expand'));
        if (Number.isFinite(vehicleId)) {
          toggleSmartResponseCandidate(vehicleId);
          void focusVehicleSelection(vehicleId, { focus: true });
        }
        return;
      }
      const primaryVehicleTrigger = element.closest('[data-primary-vehicle-id]');
      if (primaryVehicleTrigger) {
        event.preventDefault();
        const vehicleId = Number(primaryVehicleTrigger.getAttribute('data-primary-vehicle-id'));
        if (Number.isFinite(vehicleId)) {
          void focusVehicleSelection(vehicleId, { focus: true });
        }
        return;
      }
      const timelineToggle = element.closest('[data-toggle-timeline]');
      if (timelineToggle) {
        event.preventDefault();
        state.smartResponse.timelineExpanded = !state.smartResponse.timelineExpanded;
        renderSmartResponsePanel();
        return;
      }
    });
  }

  if (sosContactReporterBtn) {
    sosContactReporterBtn.addEventListener('click', () => {
      const waLink = sosContactReporterBtn.dataset.waLink || '';
      if (waLink) {
        window.open(waLink, '_blank', 'noopener,noreferrer');
      }
    });
  }

  sosIncidentListEl.addEventListener('click', (event) => {
    if (event.target instanceof HTMLElement && event.target.closest('[data-incident-disabled="true"]')) {
      return;
    }
    const whatsappButton =
      event.target instanceof HTMLElement ? event.target.closest('[data-wa-link]') : null;
    if (whatsappButton) {
      event.preventDefault();
      event.stopPropagation();
      const waLink = whatsappButton.getAttribute('data-wa-link') || '';
      if (waLink) {
        window.open(waLink, '_blank', 'noopener,noreferrer');
      }
      return;
    }
    const target = event.target instanceof HTMLElement ? event.target.closest('[data-entity-type]') : null;
    if (!target) {
      return;
    }
    const entityType = target.getAttribute('data-entity-type') || '';
    if (entityType === 'sos' && target.dataset.sosId) {
      selectAlert(target.dataset.sosId, true, { forceFocus: true, lockLabel: false });
      return;
    }
    if (entityType === 'gate' && target.dataset.gateId) {
      selectGateAlertOptimistic(target.dataset.gateId, { focus: true, lockLabel: false });
      void openGateAlertDetail(target.dataset.gateId);
      return;
    }
    if (entityType === 'asset' && target.dataset.assetType && target.dataset.assetId) {
      const assetKey = makeAssetKey(target.dataset.assetType, target.dataset.assetId);
      const asset = state.standaloneAssets.items.get(assetKey);
      if (asset) {
        selectStandaloneAssetOptimistic(asset, { focus: true, lockLabel: false });
        void openCctvModal(asset);
      }
      return;
    }
    if (entityType === 'weather' && target.dataset.weatherId) {
      selectWeatherMarker(target.dataset.weatherId);
      focusWeatherOnMap(target.dataset.weatherId);
      return;
    }
  });

  sosIncidentListEl.addEventListener('keydown', (event) => {
    const target = event.target instanceof HTMLElement ? event.target.closest('[data-entity-type]') : null;
    if (!target || target.getAttribute('data-incident-disabled') === 'true') {
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      target.click();
    }
  });
  if (vehicleControlBtn) {
    vehicleControlBtn.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (vehicleControlPopup) {
        vehicleControlPopup.classList.toggle('hidden');
        syncVehicleControlButtonState();
      }
    });
  }

  if (vehicleTypeToggleListEl) {
    vehicleTypeToggleListEl.addEventListener('change', (event) => {
      const input =
        event.target instanceof HTMLInputElement ? event.target.closest('[data-vehicle-type-toggle]') : null;
      const toggleEl = input instanceof HTMLInputElement ? input : null;
      if (!toggleEl) {
        return;
      }
      const key = String(toggleEl.getAttribute('data-vehicle-type-toggle') || '');
      if (key === 'all') {
        if (toggleEl.checked) {
          state.vehicles.hiddenTypeKeys.clear();
        } else {
          VEHICLE_TYPE_FILTER_OPTIONS.filter((item) => item.key !== 'all').forEach((item) => {
            state.vehicles.hiddenTypeKeys.add(item.key);
          });
        }
      } else if (toggleEl.checked) {
        state.vehicles.hiddenTypeKeys.delete(key);
      } else {
        state.vehicles.hiddenTypeKeys.add(key);
      }
      reconcileSelectedVehicle();
      renderAll();
    });
  }

  if (sosVehicleFiltersEl) {
    sosVehicleFiltersEl.addEventListener('click', (event) => {
      const target =
        event.target instanceof HTMLElement ? event.target.closest('[data-vehicle-filter]') : null;
      if (!target) {
        return;
      }
      setVehicleListFilter(target.getAttribute('data-vehicle-filter') || 'all');
      renderAll();
    });
  }

  if (sosVehicleListEl) {
    sosVehicleListEl.addEventListener('click', (event) => {
      const target = event.target instanceof HTMLElement ? event.target.closest('[data-vehicle-id]') : null;
      if (!target || target.getAttribute('data-incident-disabled') === 'true') {
        return;
      }
      const vehicleId = Number(target.getAttribute('data-vehicle-id'));
      if (!Number.isFinite(vehicleId)) {
        return;
      }
      selectVehicle(vehicleId, { focus: true });
      void loadVehicleDetail(vehicleId).then(() => renderDetailPanel()).catch(() => {});
    });
    sosVehicleListEl.addEventListener('keydown', (event) => {
      const target = event.target instanceof HTMLElement ? event.target.closest('[data-vehicle-id]') : null;
      if (!target || target.getAttribute('data-incident-disabled') === 'true') {
        return;
      }
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        target.click();
      }
    });
  }

  [vehicleSummaryTotalBtn, vehicleSummaryMovingBtn, vehicleSummaryAnomalyBtn].forEach((button) => {
    if (!button) {
      return;
    }
    button.addEventListener('click', () => {
      setVehicleListFilter(button.getAttribute('data-vehicle-summary-filter') || 'all');
      renderAll();
    });
  });
  sosDispatchBtn.addEventListener('click', openDispatchModal);
  sosCompleteBtn.addEventListener('click', openCompleteModal);
  closeSosDetailBtn.addEventListener('click', clearSelectedAlert);
  closeSosDispatchBtn.addEventListener('click', () => hideModal(sosDispatchModalEl));
  closeSosCompleteBtn.addEventListener('click', () => hideModal(sosCompleteModalEl));
  closeSosCctvModalBtn.addEventListener('click', closeCctvModal);

  [
    sosIncidentTypeInputEl,
    sosVehicleTypeInputEl,
    sosChronologyInputEl,
    sosCompletionNoteInputEl,
  ].forEach(bindSentenceCaseInput);

  sosDispatchFormEl.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!canDispatchSos()) {
      setClass(sosDispatchStatusEl, 'api-check-status danger');
      setText(sosDispatchStatusEl, 'Akun ini tidak memiliki izin dispatch SOS.');
      return;
    }
    const payload = {
      sos_id: Number(sosDispatchSosIdEl.value),
      incident_type: toSentenceCase(sosIncidentTypeInputEl.value),
      vehicle_type: toSentenceCase(sosVehicleTypeInputEl.value),
      initial_chronology: toSentenceCase(sosChronologyInputEl.value),
    };
    setClass(sosDispatchStatusEl, 'api-check-status warning');
    setText(sosDispatchStatusEl, 'Mengirim dispatch...');
    try {
      const response = await window.cameraService.dispatchSosTicket(payload);
      if (!response || response.status >= 400) {
        throw new Error((response && response.message) || 'Dispatch SOS gagal.');
      }
      debugLog('dispatchSosTicket:raw', {
        responseKeys: response && typeof response === 'object' ? Object.keys(response) : [],
        dataKeys:
          response && response.data && typeof response.data === 'object' && !Array.isArray(response.data)
            ? Object.keys(response.data)
            : [],
      });
      const ticket = normalizeTicket(unwrapSingle(response.data));
      if (ticket) {
        state.ticketsBySosId.set(ticket.sos_id, ticket);
        const alert = state.alerts.get(ticket.sos_id);
        if (alert) {
          alert.ticket = ticket;
          alert.status = 1;
          pushNotification(alert, `Dispatch berhasil: ${ticket.ticket_no || 'ticket baru'}`);
        }
      }
      await loadOpenTickets();
      renderAll();
      hideModal(sosDispatchModalEl);
    } catch (error) {
      setClass(sosDispatchStatusEl, 'api-check-status danger');
      setText(sosDispatchStatusEl, error.message || 'Dispatch SOS gagal.');
    }
  });

  sosCompleteFormEl.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!canCompleteSos()) {
      setClass(sosCompleteStatusEl, 'api-check-status danger');
      setText(sosCompleteStatusEl, 'Akun ini tidak memiliki izin menyelesaikan ticket SOS.');
      return;
    }
    setClass(sosCompleteStatusEl, 'api-check-status warning');
    setText(sosCompleteStatusEl, 'Menyelesaikan ticket...');
    try {
      await completeSelectedTicket();
    } catch (error) {
      setClass(sosCompleteStatusEl, 'api-check-status danger');
      setText(sosCompleteStatusEl, error.message || 'Complete ticket gagal.');
    }
  });

  document.addEventListener('click', (event) => {
    if (
      vehicleControlPopup &&
      vehicleControlBtn &&
      !vehicleControlPopup.classList.contains('hidden') &&
      !(event.target instanceof HTMLElement && (event.target.closest('#vehicleControlPopup') || event.target.closest('#vehicleControlBtn')))
    ) {
      vehicleControlPopup.classList.add('hidden');
      syncVehicleControlButtonState();
    }
    if (event.target === sosDispatchModalEl) {
      hideModal(sosDispatchModalEl);
    }
    if (event.target === sosCompleteModalEl) {
      hideModal(sosCompleteModalEl);
    }
    if (event.target === sosCctvModalEl) {
      if (Date.now() - Number(state.ui.cctvModalOpenedAt || 0) < CCTV_MODAL_BACKDROP_GUARD_MS) {
        return;
      }
      closeCctvModal();
    }
  });
  document.addEventListener('keydown', handleSosKeyboardGuards, true);
  window.addEventListener('app-session-changed', () => {
    setToolbarState();
    renderBranchOptions();
    renderSummary();
    renderIncidentList();
    if (state.isActive && !canUseAssetMonitoring()) {
      leaveAssetMonitoringMode();
      setConnectionBadge('Session saat ini tidak memiliki akses Asset Monitoring.', 'warning');
    }
    applySosActionButtonState(getSelectedAlert());
  });

  setToolbarState();
  renderNotifications();
  renderSummary();
  void restoreAssetMonitoringMode().catch((error) => {
    setConnectionBadge(
      (error && error.message) || 'Gagal memulihkan asset monitoring.',
      'danger'
    );
  });
})();








