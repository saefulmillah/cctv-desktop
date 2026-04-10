(function () {
  const GOOGLE_MAPS_API_KEY = 'AIzaSyAuNghu_4V4kxgcCa5UX0XBV_zPMZzV-Cg';
  const SOS_STREAM_RETRY_MS = 4000;
  const SOS_TICKET_REFRESH_MS = 30000;
  const SOS_ALERT_SYNC_MS = 5000;
  const SOS_NOTIFICATION_LIMIT = 5;
  const TRANSIENT_NOTIFICATION_MS = 5000;
  const ALL_BRANCHES_OPTION = '__all__';
  const MAP_ZOOM_BRANCH = 11;
  const MAP_ZOOM_GATE = 11;
  const MAP_ZOOM_ASSET = 11;
  const MAP_ZOOM_SOS = 14;

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
  const sosBranchSelectEl = $('sosBranchSelect');
  const sosMapThemeSelectEl = $('sosMapThemeSelect');
  const sosCctvToggleEl = $('sosCctvToggle');
  const sosVmsToggleEl = $('sosVmsToggle');
  const sosGateToggleEl = $('sosGateToggle');
  const sosNotificationPanelEl = $('sosNotificationPanel');
  const sosNotificationListEl = $('sosNotificationList');
  const sosIncidentListEl = $('sosIncidentList');
  const sosIncidentListLoadingEl = $('sosIncidentListLoading');
  const sosDetailPanelEl = $('sosDetailPanel');
  const sosDetailTitleEl = $('sosDetailTitle');
  const sosDetailStatusEl = $('sosDetailStatus');
  const sosDetailMetaEl = $('sosDetailMeta');
  const sosDetailBodyEl = $('sosDetailBody');
  const closeSosDetailBtn = $('closeSosDetailBtn');
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

  if (!sosMonitorBtn || !sosDashboardEl || !sosMapEl || !window.cameraService) {
    return;
  }

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
      streamStatus: 'idle',
    },
    gateAlerts: {
      items: new Map(),
      markers: new Map(),
      details: new Map(),
      selectedGateId: null,
      markerClass: null,
      visible: true,
    },
    standaloneAssets: {
      items: new Map(),
      details: new Map(),
      selectedAssetKey: null,
    },
    incidents: {
      alerts: new Map(),
      ticketsBySosId: new Map(),
      selectedSosId: null,
      notifications: [],
    },
    ui: {
      topbarFloating: true,
      mapLoading: false,
      mapEmptyMessage: 'Hubungkan API lalu buka asset monitoring untuk memantau asset dan kejadian secara real-time.',
      selectedEntityType: 'sos',
      selectedEntityId: null,
    },
    alerts: new Map(),
    ticketsBySosId: new Map(),
    selectedSosId: null,
    notifications: [],
    notificationTimers: new Map(),
    notificationLeavingIds: new Set(),
    notificationCounter: 0,
    mapsLoaderPromise: null,
    map: null,
    trafficLayer: null,
    gateProjectionOverlay: null,
    cctvMarkers: [],
    cctvCluster: null,
    cctvClusterRenderMarkers: [],
    cctvMapBranchId: null,
    cctvMapBranchLabel: '',
    cctvMapLayerKey: '',
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
    markers: new Map(),
    markerClass: null,
    streamAbortController: null,
    streamRetryTimer: null,
    ticketRefreshTimer: null,
    alertRefreshTimer: null,
    isInitialSnapshotLoaded: false,
    activeWorkspaceBranch: null,
  };

  const debugLog = (...args) => {
    console.info('[asset-monitoring]', ...args);
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

  const toDateTime = (value) => {
    if (!value) {
      return '-';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return String(value);
    }
    return `${date.toLocaleDateString('id-ID')} ${date.toLocaleTimeString('id-ID')}`;
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
  const GATE_ISSUE_STATUSES = new Set(['error', 'offline', 'warning']);
  const isGateIssueStatus = (status) => GATE_ISSUE_STATUSES.has(String(status || '').trim().toLowerCase());
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
  const nextNotificationId = (prefix) => {
    state.notificationCounter += 1;
    return `${String(prefix || 'notif')}:${Date.now()}:${state.notificationCounter}`;
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
      .map(
        (entry) => `
          <div class="sos-gate-log-list__item">
            <div class="sos-gate-log-list__head">
              <strong>${escapeHtml(entry.deviceName)}</strong>
              <span class="status-pill ${getGateIssueStatusTone(entry.status)}">${escapeHtml(String(entry.status || '-').toUpperCase())}</span>
            </div>
            <span>${escapeHtml(entry.logDescription)}</span>
            <small>${escapeHtml([entry.severity, entry.lastUpdateAt ? toDateTime(entry.lastUpdateAt) : ''].filter(Boolean).join(' | '))}</small>
          </div>
        `
      )
      .join('');
  };

  const normalizeStandaloneAsset = (item) => {
    if (!item || typeof item !== 'object' || !item.id) {
      return null;
    }
    const lat = Number(item.lat ?? item.cctv_lat ?? item.latitude);
    const lng = Number(item.lng ?? item.cctv_lon ?? item.longitude);
    const assetType = String(item.asset_type || '').trim().toLowerCase();
    return {
      ...item,
      id: String(item.id),
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
        `${assetType.toUpperCase()} ${item.id}`,
    };
  };

  const ONLINE_MARKER_URL = new URL('./assets/marker-map-online.svg', window.location.href).toString();
  const OFFLINE_MARKER_URL = new URL('./assets/marker-map-offline.svg', window.location.href).toString();
  const ONLY_ICON_URLS = {
    cctv: new URL('./assets/only2_CCTV.svg', window.location.href).toString(),
    gate: new URL('./assets/only2_GATE.svg', window.location.href).toString(),
    mixed: new URL('./assets/only2_MIXED.svg', window.location.href).toString(),
    vms: new URL('./assets/only2_VMS.svg', window.location.href).toString(),
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

  const getCctvMarkerIconUrl = (camera) => {
    const operationalState = getCameraOperationalState(camera);
    return operationalState === 'online' ? ONLINE_MARKER_URL : OFFLINE_MARKER_URL;
  };

  const getCctvMarkerScaledSize = (camera) =>
    String(camera && camera.id) === String(state.cctvSelectedCameraId) ? 40 : 32;

  const svgTextToDataUri = (value) =>
    `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(String(value || '').trim())}`;

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

  const buildSosClusterSvgDataUrl = (count, onlineCount, offlineCount) => {
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

  const buildClusterCountBadgeSvg = (count, size) => {
    const displayCount = Number(count || 0) > 99 ? '99+' : String(count || 0);
    const badgeWidth = displayCount.length >= 3 ? 28 : displayCount.length === 2 ? 22 : 18;
    const badgeHeight = 18;
    const x = size - badgeWidth - 1;
    const y = 1;
    return `
      <rect x="${x}" y="${y}" width="${badgeWidth}" height="${badgeHeight}" rx="${badgeHeight / 2}" fill="#ff3f4d" />
      <text x="${x + badgeWidth / 2}" y="${y + 12.5}" text-anchor="middle" fill="#ffffff" font-family="Segoe UI, Arial, sans-serif" font-size="${displayCount.length >= 3 ? 9 : 10}" font-weight="800">${displayCount}</text>
    `;
  };

  const buildCctvClusterMarkerSvg = (size) => {
    const scale = size * 0.00084;
    const offset = (size / 2) - (364 * scale);
    return `
      <g transform="translate(${offset.toFixed(2)} ${offset.toFixed(2)}) scale(${scale.toFixed(5)})">
        <circle cx="364" cy="364" r="340" fill="url(#cctvMarkerGradient)" stroke="#ffffff" stroke-width="38" />
        <path fill="#ffffff" d="M247.6 233.8 515.6 359.5 536.8 389.1 478.2 514.1 181.4 374.9z" />
        <path fill="#ffffff" d="M533 409.9 553.4 419.5 519.6 491.3 499.3 481.8z" />
        <path fill="#ffffff" d="M577.5 421.1 600.9 432.1 559.7 519.8 533.1 507.3 527.7 493.7 560.2 424.3z" />
        <path fill="#ffffff" d="M282.9 222.8 498 323.7 490.4 339.8 275.4 238.9z" />
        <path fill="#ffffff" d="M313.7 444.1 337.3 455.1 313.8 505.2 290.2 494.1z" />
        <path fill="#ffffff" d="M230.4 497.7 250 486.7 260.1 504.5 305.6 478.4 313.8 505.2 272.9 527.4 286 550.7 266.4 561.7z" />
      </g>
    `;
  };

  const buildOnlyIconClusterSvg = (typeMeta, size) => {
    const dataUri = state.onlyIconDataUris[typeMeta.iconKey];
    if (!dataUri) {
      return typeMeta.iconType === 'cctv-marker' ? buildCctvClusterMarkerSvg(size) : typeMeta.icon;
    }
    const imageSize = Math.round(size * 0.64);
    const imageOffset = Math.round((size - imageSize) / 2);
    return `<image href="${escapeHtml(dataUri)}" x="${imageOffset}" y="${imageOffset}" width="${imageSize}" height="${imageSize}" preserveAspectRatio="xMidYMid meet" />`;
  };

  const buildTypedAssetClusterSvgDataUrl = ({
    assetType,
    count,
    onlineCount,
    warningCount,
    offlineCount,
  }) => {
    const size = count >= 100 ? 62 : count >= 10 ? 56 : 52;
    const problemCount = Number(offlineCount || 0) + Number(warningCount || 0);
    const tone = getClusterTone(onlineCount, problemCount);
    const typeMeta = getAssetClusterTypeMeta(assetType);
    const normalizedAssetType = String(assetType || '').toLowerCase();
    const centerGraphic = buildOnlyIconClusterSvg(typeMeta, size);
    const typeLabel =
      normalizedAssetType === 'cctv'
        ? ''
        : `<text x="${size / 2}" y="${size - 6}" text-anchor="middle" fill="rgba(255,255,255,0.82)" font-family="Segoe UI, Arial, sans-serif" font-size="7" font-weight="700">${typeMeta.label}</text>`;
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <defs>
          <linearGradient id="cctvMarkerGradient" x1="0" y1="0" x2="728" y2="728" gradientUnits="userSpaceOnUse">
            <stop offset="0" stop-color="#ff3131" />
            <stop offset="1" stop-color="#ff914d" />
          </linearGradient>
        </defs>
        <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 4}" fill="${tone.fill}" stroke="${tone.border}" stroke-width="4" />
        <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 10}" fill="rgba(255,255,255,0.08)" />
        ${centerGraphic}
        ${typeLabel}
        ${buildClusterCountBadgeSvg(count, size)}
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

  const getLatLng = (item) => {
    const lat = Number(item && item.latitude);
    const lng = Number(item && item.longitude);
    return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
  };

  const normalizeTicket = (ticket) => {
    if (!ticket || typeof ticket !== 'object') {
      return null;
    }
    const sosId = Number(ticket.sos_id || (ticket.sos && ticket.sos.sos_id));
    if (!Number.isFinite(sosId)) {
      return null;
    }
    return {
      ...ticket,
      sos_id: sosId,
      ticket_status: Number(ticket.ticket_status ?? ticket.status ?? 1),
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
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(GOOGLE_MAPS_API_KEY)}&loading=async&callback=${callbackName}`;
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
        button.addEventListener('click', () => this.onSelect(this.alert.sos_id));
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
        this.setMap(map);
      }

      onAdd() {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'sos-map-marker';
        button.addEventListener('click', () => this.onSelect(this.gate.gate_id));
        this.element = button;
        this.getPanes().overlayMouseTarget.appendChild(button);
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
        this.element.className = `sos-map-marker asset-map-marker asset-map-marker--${tone} ${
          this.gate.pulse ? 'asset-map-marker--pulse' : ''
        } ${String(state.gateAlerts.selectedGateId || '') === String(this.gate.gate_id) ? 'is-selected' : ''}`;
        this.element.style.left = `${pixel.x}px`;
        this.element.style.top = `${pixel.y}px`;
        this.element.title = this.gate.gate_name || this.gate.gate_code || 'Gate Alert';
        this.element.innerHTML =
          `<span class="sos-map-marker__pulse"></span><span class="sos-map-marker__dot"><img src="${escapeHtml(ONLY_ICON_URLS.gate)}" alt="" aria-hidden="true" /></span>`;
      }

      onRemove() {
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

  const applyMapTheme = (preset) => {
    const normalized = MAP_THEME_PRESETS[preset] !== undefined ? preset : 'dark-ops';
    state.mapContext.themePreset = normalized;
    if (sosMapThemeSelectEl) {
      sosMapThemeSelectEl.value = normalized;
    }
    if (state.map) {
      state.map.setOptions({ styles: MAP_THEME_PRESETS[normalized] });
    }
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
      .filter((alert) => alert && Number(alert.status) !== 2 && isEntityInSelectedBranch(alert.branch_id))
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

  const getSelectedAlert = () => state.incidents.alerts.get(Number(state.selectedSosId)) || null;
  const getSelectedBranch = () => state.mapContext.selectedBranch || state.activeWorkspaceBranch || null;
  const isStandaloneAssetTypeVisible = (asset) => {
    const assetType = String(asset && asset.asset_type ? asset.asset_type : 'cctv').toLowerCase();
    return assetType === 'vms' ? state.vmsVisible : state.cctvVisible;
  };
  const getStandaloneLayerKey = (branchKey) =>
    `${branchKey}:${state.cctvVisible ? 'cctv' : ''}:${state.vmsVisible ? 'vms' : ''}`;
  const hasRenderableMapData = () =>
    getVisibleAlerts().length > 0 ||
    Array.from(state.gateAlerts.items.values()).some(
      (gate) => gate && (gate.status === 'error' || gate.status === 'warning')
    ) ||
    Array.from(state.standaloneAssets.items.values()).some(
      (item) => item && item.status === 'offline' && isStandaloneAssetTypeVisible(item)
    );

  const setConnectionBadge = (label, tone = 'neutral') => {
    state.mapContext.streamStatus = tone;
    setClass(sosConnectionBadgeEl, `status-pill ${tone}`);
    setText(sosConnectionBadgeEl, label);
  };

  const renderNotifications = () => {
    if (!state.notifications.length) {
      sosNotificationPanelEl.classList.add('hidden');
      sosNotificationListEl.innerHTML = '';
    }
    sosNotificationPanelEl.classList.remove('hidden');
    sosNotificationListEl.innerHTML = state.notifications
      .map(
        (entry) => `
          <article class="sos-notification-card ${state.notificationLeavingIds.has(String(entry.id)) ? 'is-leaving' : ''}" data-notification-id="${escapeHtml(entry.id)}">
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

  const clearNotificationTimer = (notificationId) => {
    const timer = state.notificationTimers.get(String(notificationId));
    if (timer) {
      window.clearTimeout(timer);
      state.notificationTimers.delete(String(notificationId));
    }
  };

  const removeNotificationImmediately = (notificationId) => {
    const normalizedId = String(notificationId || '').trim();
    clearNotificationTimer(normalizedId);
    state.notificationLeavingIds.delete(normalizedId);
    state.notifications = state.notifications.filter((entry) => String(entry.id) !== normalizedId);
    state.incidents.notifications = state.notifications;
    renderNotifications();
  };

  const removeNotification = (notificationId) => {
    const normalizedId = String(notificationId || '').trim();
    if (!normalizedId) {
    }
    if (state.notificationLeavingIds.has(normalizedId)) {
    }
    const exists = state.notifications.some((entry) => String(entry.id) === normalizedId);
    if (!exists) {
      return;
    }
    clearNotificationTimer(normalizedId);
    state.notificationLeavingIds.add(normalizedId);
    renderNotifications();
    window.setTimeout(() => {
      removeNotificationImmediately(normalizedId);
    }, 220);
  };

  const removeNotificationsByTarget = (targetType, matcher) => {
    state.notifications
      .filter((entry) => entry && entry.target && entry.target.type === targetType && matcher(entry.target))
      .forEach((entry) => {
        clearNotificationTimer(entry.id);
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
      clearNotificationTimer(item.id);
      state.notificationLeavingIds.delete(String(item.id));
    });
    state.notifications = nextNotifications.slice(0, SOS_NOTIFICATION_LIMIT);
    state.incidents.notifications = state.notifications;
    renderNotifications();
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

  const renderSummary = () => {
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
          item.status === 'offline' &&
          isStandaloneAssetTypeVisible(item)
      ).length;
    setText(sosOpenCountBadgeEl, `${totalItems} item`);
  };

  const renderBranchOptions = () => {
    if (!sosBranchSelectEl) {
      return;
    }
    const branches = Array.isArray(state.mapContext.availableBranches) ? state.mapContext.availableBranches : [];
    const selectedBranch = getSelectedBranch();
    const selectedId = selectedBranch && selectedBranch.id ? String(selectedBranch.id) : '';
    sosBranchSelectEl.innerHTML = [
      '<option value="">Pilih branch</option>',
      `<option value="${ALL_BRANCHES_OPTION}" ${selectedId === ALL_BRANCHES_OPTION ? 'selected' : ''}>Semua Branch</option>`,
      ...branches.map(
        (branch) =>
          `<option value="${escapeHtml(branch.id)}" ${
            String(branch.id) === selectedId ? 'selected' : ''
          }>${escapeHtml(branch.branch_name || branch.branch_code || branch.id)}</option>`
      ),
    ].join('');
  };

  const renderAssetToolbar = () => {
    if (!state.isActive) {
      return;
    }
    const selectedBranch = getSelectedBranch();
    const branchLabel = isAllBranchesSelected()
      ? 'Semua Branch'
      : selectedBranch
        ? selectedBranch.branch_name || selectedBranch.branch_code || selectedBranch.id
        : 'Tanpa branch';
    if (assetMapSubtitleEl) {
      setText(assetMapSubtitleEl, `Branch aktif: ${branchLabel}`);
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
    const alerts = getVisibleAlerts();
    const gateAlerts = Array.from(state.gateAlerts.items.values())
      .filter((gate) => gate && gate.showInSummary !== false && (gate.status === 'error' || gate.status === 'warning'))
      .sort((a, b) => String(a.gate_name || a.gate_code || '').localeCompare(String(b.gate_name || b.gate_code || '')));
    const offlineAssets = Array.from(state.standaloneAssets.items.values())
      .filter(
        (item) =>
          item &&
          item.showInSummary !== false &&
          item.status === 'offline' &&
          isStandaloneAssetTypeVisible(item)
      )
      .sort((a, b) => String(a.title || '').localeCompare(String(b.title || '')));

    if (!alerts.length && !gateAlerts.length && !offlineAssets.length) {
      sosIncidentListEl.innerHTML =
        '<div class="sos-incident-item sos-incident-item--empty">Belum ada ringkasan monitoring untuk branch ini.</div>';
      return;
    }
    const sosMarkup = alerts
      .map((alert) => {
        const statusMeta = getStatusMeta(alert.status);
        const rawPhoneNumber = alert.user && alert.user.phone ? String(alert.user.phone) : '';
        const displayPhoneNumber = getDisplayPhoneNumber(rawPhoneNumber);
        const whatsAppLink = getWhatsAppLink(rawPhoneNumber);
        return `
          <article class="sos-incident-item ${alert.sos_id === state.selectedSosId ? 'is-selected' : ''}" data-entity-type="sos" data-sos-id="${alert.sos_id}" tabindex="0" role="button" aria-label="Pilih kejadian SOS ${alert.sos_id}">
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
      })
      .join('');
    const gateMarkup = gateAlerts
      .map((gate) => {
        const tone = getGateMarkerTone(gate);
        return `
          <article class="sos-incident-item sos-incident-item--summary ${state.ui.selectedEntityType === 'gate' && String(state.ui.selectedEntityId) === String(gate.gate_id) ? 'is-selected' : ''}" data-entity-type="gate" data-gate-id="${gate.gate_id}" tabindex="0" role="button" aria-label="Pilih gate alert ${escapeHtml(gate.gate_name || gate.gate_code || gate.gate_id)}">
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
      })
      .join('');
    const assetMarkup = offlineAssets
      .map((asset) => {
        const assetKey = makeAssetKey(asset.asset_type, asset.id);
        return `
          <article class="sos-incident-item sos-incident-item--summary ${state.ui.selectedEntityType === 'asset' && String(state.ui.selectedEntityId) === assetKey ? 'is-selected' : ''}" data-entity-type="asset" data-asset-type="${escapeHtml(asset.asset_type)}" data-asset-id="${escapeHtml(asset.id)}" tabindex="0" role="button" aria-label="Pilih asset ${escapeHtml(asset.title)}">
            <div class="sos-incident-item__head">
              <strong>${escapeHtml(asset.title)}</strong>
              <span class="status-pill danger">${escapeHtml(String(asset.status || 'offline').toUpperCase())}</span>
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
      })
      .join('');

    sosIncidentListEl.innerHTML = `
      ${sosMarkup ? `<section class="sos-incident-group"><div class="sos-incident-group__title">SOS</div>${sosMarkup}</section>` : ''}
      ${gateMarkup ? `<section class="sos-incident-group"><div class="sos-incident-group__title">Gate Alert Summary</div>${gateMarkup}</section>` : ''}
      ${assetMarkup ? `<section class="sos-incident-group"><div class="sos-incident-group__title">Asset Offline Summary</div>${assetMarkup}</section>` : ''}
    `;
  };

  const renderDetailPanel = () => {
    if (state.ui.selectedEntityType === 'gate' && state.gateAlerts.selectedGateId) {
      const gateDetail = state.gateAlerts.details.get(String(state.gateAlerts.selectedGateId));
      if (gateDetail) {
        sosDispatchBtn.disabled = true;
        sosCompleteBtn.disabled = true;
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
      sex: alert.user && alert.user.sex,
    });
    if (state.detailRenderKey === detailKey && !sosDetailPanelEl.classList.contains('hidden')) {
      sosDispatchBtn.disabled = Number(alert.status) !== 0;
      sosCompleteBtn.disabled = !(alert.ticket && alert.ticket.ticket_no && Number(alert.status) === 1);
      return;
    }
    state.detailRenderKey = detailKey;
    const statusMeta = getStatusMeta(alert.status);
    setText(sosDetailTitleEl, alert.ticket && alert.ticket.ticket_no ? alert.ticket.ticket_no : `SOS-${alert.sos_id}`);
    setClass(sosDetailStatusEl, `status-pill ${statusMeta.tone}`);
    setText(sosDetailStatusEl, statusMeta.label);
    sosDetailMetaEl.classList.remove('hidden');
    const sexCode = String(alert.user && alert.user.sex ? alert.user.sex : '')
      .toUpperCase()
      .trim();
    const sexLabel =
      sexCode === 'P' || sexCode === 'F'
        ? 'Perempuan'
        : sexCode === 'L' || sexCode === 'M'
          ? 'Laki-laki'
          : '-';
    sosDetailMetaEl.innerHTML = `
      <div class="sos-detail-hero">
        <div class="sos-detail-hero__name">${escapeHtml(getAlertName(alert))}</div>
        <div class="sos-detail-hero__support">
          <span class="meta-pill">${escapeHtml(sexLabel)}</span>
          <span class="meta-pill">Waktu Lapor : ${escapeHtml(toDateTime(alert.created_at))}</span>
        </div>
      </div>
    `;
    sosDetailBodyEl.innerHTML = `
      <div class="sos-detail-body__grid">
        <div><span class="sos-detail-label">Koordinat</span><strong>${escapeHtml(alert.latitude || '-')} / ${escapeHtml(alert.longitude || '-')}</strong></div>
        <div><span class="sos-detail-label">Telepon</span><strong>${escapeHtml(getDisplayPhoneNumber(alert.user && alert.user.phone ? alert.user.phone : '') || '-')}</strong></div>
        <div><span class="sos-detail-label">Alamat</span><strong>${escapeHtml(alert.user && alert.user.address ? alert.user.address : '-')}</strong></div>
        <div><span class="sos-detail-label">Dispatch</span><strong>${escapeHtml(alert.ticket && alert.ticket.dispatched_at ? toDateTime(alert.ticket.dispatched_at) : 'Belum dispatch')}</strong></div>
      </div>
    `;
    sosDispatchBtn.disabled = Number(alert.status) !== 0;
    sosCompleteBtn.disabled = !(alert.ticket && alert.ticket.ticket_no && Number(alert.status) === 1);
    sosDetailPanelEl.classList.remove('hidden');
    sosDetailPanelEl.classList.add('is-visible');
    replayDetailPanelAnimation();
  };

  const updateMapEmptyState = (message) => {
    if (typeof message === 'string' && message.trim()) {
      state.ui.mapEmptyMessage = message;
    }
    if (sosMapLoadingEl) {
      sosMapLoadingEl.classList.toggle('sidebar-section-hidden', !state.ui.mapLoading);
    }
    if (!sosMapEmptyEl) {
      return;
    }
    if (state.ui.mapLoading) {
      sosMapEmptyEl.classList.add('hidden');
      return;
    }
    const shouldShowEmpty = !hasRenderableMapData();
    sosMapEmptyEl.classList.toggle('hidden', !shouldShowEmpty);
    if (shouldShowEmpty) {
      setText(
        sosMapEmptyEl,
        state.ui.mapEmptyMessage ||
          'Belum ada marker gate alert, asset offline, atau SOS aktif untuk ditampilkan.'
      );
    }
  };

  const focusAlertOnMap = (alert, forceZoom = false) => {
    if (!state.map || !alert || !alert.latLng) {
      return;
    }
    state.map.panTo(alert.latLng);
    if (forceZoom || Number(state.map.getZoom()) < 16) {
      window.setTimeout(() => {
        if (!state.map) {
          return;
        }
        state.map.setZoom(Math.max(Number(state.map.getZoom()) || 12, MAP_ZOOM_SOS));
      }, 180);
    }
  };

  const focusEntityOnMap = (latLng, targetZoom) => {
    if (!state.map || !latLng) {
      return;
    }
    animateMapZoom(state.map, Math.max(Number(targetZoom) || MAP_ZOOM_BRANCH, Number(state.map.getZoom()) || 0), latLng);
    if (Number(state.map.getZoom() || 0) >= Number(targetZoom || MAP_ZOOM_BRANCH)) {
      state.map.panTo(latLng);
    }
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
    state.cctvSpiderfyClusterMarker = null;
    state.cctvSpiderfiedCameraIds = new Set();
    state.cctvMarkers.forEach((entry) => {
      if (!entry || !entry.marker || !entry.originalPosition) {
        return;
      }
      entry.marker.setPosition(entry.originalPosition);
      entry.marker.setZIndex(
        String(entry.camera && entry.camera.id) === String(state.cctvSelectedCameraId) ? 1000 : undefined
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
    if (detail.latLng || camera.latLng) {
      focusEntityOnMap(detail.latLng || camera.latLng, MAP_ZOOM_ASSET);
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
        String(entry.camera && entry.camera.id) === String(state.cctvSelectedCameraId) ? 1000 : undefined
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
  };

  const closeCctvModal = () => {
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
    const spacing = Math.max(68, Math.min(90, 56 + nearbyEntries.length * 4));
    const baseYOffsets = [0, -16, 16, -28, 28, -38, 38, -48, 48];
    const middleIndex = (nearbyEntries.length - 1) / 2;
    nearbyEntries.forEach((entry, index) => {
      const xOffset = (index - middleIndex) * spacing;
      const yOffset =
        baseYOffsets[index] ??
        ((index % 2 === 0 ? 1 : -1) * (18 + Math.floor(index / 2) * 12));
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
        zIndex: String(entry.camera && entry.camera.id) === String(state.cctvSelectedCameraId) ? 1000 : 950,
      });
      spiderfyMarker.addListener('click', () => {
        state.cctvSuppressMapClickUntil = Date.now() + 250;
        openCctvModal(entry.camera);
      });
      state.cctvSpiderfyTempMarkers.push(spiderfyMarker);
      const leg = new window.google.maps.Polyline({
        map: state.map,
        path: [centerLatLng, centerLatLng],
        strokeColor: '#ffffff',
        strokeOpacity: 0.85,
        strokeWeight: 1.5,
        clickable: false,
        zIndex: 1,
      });
      state.cctvSpiderfyLegs.push(leg);
      animateSpiderfyMarker(spiderfyMarker, centerLatLng, targetLatLng, leg, centerLatLng);
    });
    return true;
  };

  const clearCctvMarkers = (options = {}) => {
    if (options.invalidate !== false) {
      state.cctvMarkerLoadSeq += 1;
    }
    closeCctvModal();
    collapseCctvSpiderfy();
    state.cctvSelectedCameraId = null;
    state.cctvClusterRenderMarkers.forEach((marker) => {
      if (marker && typeof marker.setMap === 'function') {
        marker.setMap(null);
      }
    });
    state.cctvClusterRenderMarkers = [];
    if (state.cctvCluster && typeof state.cctvCluster.clearMarkers === 'function') {
      state.cctvCluster.clearMarkers(true);
    }
    if (state.cctvCluster && typeof state.cctvCluster.setMap === 'function') {
      state.cctvCluster.setMap(null);
    }
    state.cctvCluster = null;
    state.cctvMarkers.forEach((entry) => {
      if (entry && entry.marker && typeof entry.marker.setMap === 'function') {
        entry.marker.setMap(null);
      }
    });
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
    Array.from(state.gateAlerts.items.values()).forEach((gate) => {
      if (!gate || !gate.latLng) {
        return;
      }
      activeIds.add(String(gate.gate_id));
      const existing = state.gateAlerts.markers.get(String(gate.gate_id));
      if (existing) {
        existing.update(gate);
        return;
      }
      const marker = new MarkerCtor({
        map: state.map,
        gate,
        onSelect: (gateId) => void openGateAlertDetail(gateId),
      });
      state.gateAlerts.markers.set(String(gate.gate_id), marker);
    });
    Array.from(state.gateAlerts.markers.entries()).forEach(([gateId, marker]) => {
      if (activeIds.has(gateId)) {
        return;
      }
      marker.setMap(null);
      state.gateAlerts.markers.delete(gateId);
    });
  };

  const loadMapBranches = async () => {
    const response = await window.cameraService.getMapBranches();
    if (!response || response.status >= 400) {
      throw new Error((response && response.message) || 'Gagal memuat branch peta.');
    }
    const rows = unwrapCollection(response);
    state.mapContext.availableBranches = rows.map(normalizeMapBranch).filter(Boolean);
    const preferredBranchId = String(
      (state.mapContext.selectedBranch && state.mapContext.selectedBranch.id) ||
        (state.activeWorkspaceBranch && state.activeWorkspaceBranch.id) ||
        ''
    );
    state.mapContext.selectedBranch =
      (preferredBranchId === ALL_BRANCHES_OPTION
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
      status: 'error,warning',
      include: 'affected_devices',
      ...(isAllBranchesSelected() ? {} : { branch_id: branch.id }),
    });
    if (!response || response.status >= 400) {
      throw new Error((response && response.message) || 'Gagal memuat gate alerts.');
    }
    unwrapCollection(response).forEach((item) => {
      const normalized = normalizeGateAlert(item);
      if (normalized) {
        state.gateAlerts.items.set(String(normalized.gate_id), { ...normalized, showInSummary: true });
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
      }
    }
    syncGateAlertMarkers();
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
    sosDispatchBtn.disabled = true;
    sosCompleteBtn.disabled = true;
    setText(sosDetailTitleEl, detail.gate_name || detail.gate_code || `Gate ${detail.gate_id}`);
    setClass(sosDetailStatusEl, `status-pill ${getGateMarkerTone(detail) === 'danger' ? 'danger' : getGateMarkerTone(detail) === 'warning' ? 'warning' : 'success'}`);
    setText(sosDetailStatusEl, String(detail.status || 'normal').toUpperCase());
    sosDetailMetaEl.innerHTML = '';
    sosDetailMetaEl.classList.add('hidden');
    const deviceSummary = detail.device_summary || {};
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
    sosDetailBodyEl.innerHTML = `
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
    sosDetailPanelEl.classList.remove('hidden');
    sosDetailPanelEl.classList.add('is-visible');
    replayDetailPanelAnimation();
    focusEntityOnMap(detail.latLng, MAP_ZOOM_GATE);
  };

  const updateDefaultCctvMarkers = async () => {
    const loadSeq = (state.cctvMarkerLoadSeq += 1);
    const isCurrentCctvLoad = () =>
      loadSeq === state.cctvMarkerLoadSeq && (state.cctvVisible || state.vmsVisible);
    const branch = getSelectedBranch();
    const branchKey = isAllBranchesSelected() ? ALL_BRANCHES_OPTION : String((branch && branch.id) || '');
    const layerKey = getStandaloneLayerKey(branchKey);
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
    if (String(state.cctvMapBranchId) === branchKey && state.cctvMapLayerKey === layerKey && state.cctvMarkers.length) {
      updateMapEmptyState('');
      return;
    }
    clearCctvMarkers({ invalidate: false });
    state.cctvMapBranchId = branchKey;
    state.cctvMapLayerKey = layerKey;
    state.cctvMapBranchLabel = isAllBranchesSelected() ? 'Semua Branch' : branch.branch_name || branch.branch_code || '';
    try {
      state.cctvClusterRenderMarkers = [];
      let cameras = state.cctvCacheByBranch.get(branchKey);
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
      const visibleCameras = cameras.filter(isStandaloneAssetTypeVisible);
      state.cctvMarkers = visibleCameras.map((camera) => {
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
            zIndex: String(camera && camera.id) === String(state.cctvSelectedCameraId) ? 1000 : undefined,
          });
        marker.addListener('click', () => {
          state.cctvSuppressMapClickUntil = Date.now() + 250;
          void openCctvModal(camera);
        });
        return {
          marker,
          camera,
          originalPosition: camera.position,
        };
      });
      let markerClustererLib = null;
      try {
        await loadOnlyIconDataUris();
        markerClustererLib = await loadMarkerClustererLibrary();
      } catch (clusterError) {
        debugLog('updateDefaultCctvMarkers:cluster-library-error', {
          message:
            clusterError && clusterError.message ? clusterError.message : String(clusterError),
        });
      }
      if (!isCurrentCctvLoad()) {
        return;
      }
      const MarkerClustererCtor = markerClustererLib && markerClustererLib.MarkerClusterer;
      const SuperClusterAlgorithmCtor =
        markerClustererLib && markerClustererLib.SuperClusterAlgorithm;
      if (MarkerClustererCtor) {
        state.cctvCluster = new MarkerClustererCtor({
          map: state.map,
          markers: state.cctvMarkers.map((entry) => entry.marker),
          algorithm: SuperClusterAlgorithmCtor
            ? new SuperClusterAlgorithmCtor({
                radius: 170,
                maxZoom: 22,
              })
            : undefined,
          renderer: {
            render({ count, position, markers: clusterMarkers }) {
              const summary = {
                onlineCount: 0,
                offlineCount: 0,
              };
              let warningCount = 0;
              (Array.isArray(clusterMarkers) ? clusterMarkers : []).forEach((clusterMarker) => {
                const entry = state.cctvMarkers.find((item) => item && item.marker === clusterMarker);
                if (!entry || !entry.camera) {
                  return;
                }
                const operationalState = getCameraOperationalState(entry.camera);
                if (operationalState === 'online') {
                  summary.onlineCount += 1;
                  return;
                }
                if (operationalState === 'warning') {
                  warningCount += 1;
                  return;
                }
                summary.offlineCount += 1;
              });
              const assetType = getClusterAssetType(clusterMarkers);
              const size = count >= 100 ? 62 : count >= 10 ? 56 : 52;
              const marker = new window.google.maps.Marker({
                position,
                icon: {
                  url: buildTypedAssetClusterSvgDataUrl({
                    assetType,
                    count,
                    onlineCount: summary.onlineCount,
                    warningCount,
                    offlineCount: summary.offlineCount,
                  }),
                  scaledSize: new window.google.maps.Size(size, size),
                },
                zIndex: 900,
              });
              marker.__clusterSummary = {
                count,
                onlineCount: summary.onlineCount,
                warningCount,
                offlineCount: summary.offlineCount,
                assetType,
              };
              state.cctvClusterRenderMarkers.push(marker);
              return marker;
            },
          },
          onClusterClick: (_, cluster) => {
            collapseCctvSpiderfy();
            const clusterMarkers = Array.isArray(cluster && cluster.markers) ? cluster.markers : [];
            const entries = clusterMarkers
              .map((marker) => state.cctvMarkers.find((entry) => entry && entry.marker === marker))
              .filter(Boolean);
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
            const currentZoom = Number(state.map.getZoom() || 4);
            if (entries.length > 4) {
              const zoomStep = entries.length >= 10 ? 1 : 2;
              const nextZoom = Math.min(currentZoom + zoomStep, 20);
              const shouldSpiderfyInstead = currentZoom >= 19 || nextZoom === currentZoom;
              if (!shouldSpiderfyInstead) {
                animateMapZoom(state.map, nextZoom, clusterCenter);
                return;
              }
            }
            const clusterMarker = cluster && (cluster.marker || cluster._marker || null);
            if (clusterMarker && typeof clusterMarker.setOpacity === 'function') {
              clusterMarker.setOpacity(entries.length === 2 ? 0.22 : 0.32);
              state.cctvSpiderfyClusterMarker = clusterMarker;
            }
            spiderfyCctvMarkerGroup(entries[0], entries, clusterCenter);
          },
        });
      } else {
        state.cctvMarkers.forEach((entry) => {
          if (entry && entry.marker && typeof entry.marker.setMap === 'function') {
            entry.marker.setMap(state.map);
          }
        });
      }
      if (!getVisibleAlerts().length && visibleCameras.length) {
        const bounds = new google.maps.LatLngBounds();
        visibleCameras.forEach((camera) => bounds.extend(camera.position));
        state.map.fitBounds(bounds, 56);
      }
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
      if (hasBounds) {
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
          onSelect: (sosId) => selectAlert(sosId, true),
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
    updateMapEmptyState(getVisibleAlerts().length ? '' : 'Belum ada marker SOS aktif.');
  };

  const renderAll = () => {
    renderSummary();
    renderBranchOptions();
    renderAssetToolbar();
    renderIncidentList();
    renderDetailPanel();
    renderNotifications();
    syncGateAlertMarkers();
    syncMapMarkers();
    void updateDefaultCctvMarkers();
  };

  const mergeTicketToAlert = (alert) => {
    const ticket = state.ticketsBySosId.get(alert.sos_id);
    if (!ticket) {
      return alert;
    }
    alert.ticket = ticket;
    if (Number(alert.status) !== 2) {
      alert.status = ticket.ticket_status === 2 ? 2 : 1;
    }
    return alert;
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
    if (shouldRemoveNotification) {
      removeNotificationsByTarget('sos', (target) => String(target.sosId) === String(sosId));
    }
    renderAll();
    if (focusOnMap && options.forceFocus !== false) {
      focusAlertOnMap(getSelectedAlert(), true);
    }
  };

  const selectGateAlertOptimistic = (gateId) => {
    state.selectedSosId = null;
    state.incidents.selectedSosId = null;
    state.gateAlerts.selectedGateId = String(gateId);
    state.ui.selectedEntityType = 'gate';
    state.ui.selectedEntityId = String(gateId);
    state.standaloneAssets.selectedAssetKey = null;
    state.detailRenderKey = '';
    renderIncidentList();
    syncGateAlertMarkers();
  };

  const selectStandaloneAssetOptimistic = (asset) => {
    if (!asset) {
      return;
    }
    const assetKey = makeAssetKey(asset.asset_type, asset.id);
    state.selectedSosId = null;
    state.incidents.selectedSosId = null;
    state.gateAlerts.selectedGateId = null;
    state.standaloneAssets.selectedAssetKey = assetKey;
    state.ui.selectedEntityType = 'asset';
    state.ui.selectedEntityId = assetKey;
    state.cctvSelectedCameraId = String(asset.id || '');
    state.detailRenderKey = '';
    renderIncidentList();
  };

  const clearSelectedAlert = () => {
    state.selectedSosId = null;
    state.incidents.selectedSosId = null;
    state.gateAlerts.selectedGateId = null;
    state.ui.selectedEntityType = '';
    state.ui.selectedEntityId = null;
    state.detailRenderKey = '';
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
    unwrapCollection(response.data).forEach((ticket) => {
      const normalized = normalizeTicket(ticket);
      if (normalized) {
        state.ticketsBySosId.set(normalized.sos_id, normalized);
      }
    });
    debugLog('loadOpenTickets:parsed', {
      count: state.ticketsBySosId.size,
      sosIds: Array.from(state.ticketsBySosId.keys()),
    });
    Array.from(state.alerts.values()).forEach((alert) => mergeTicketToAlert(alert));
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
    state.ui.mapEmptyMessage =
      'Belum ada marker gate alert, asset offline, atau SOS aktif untuk ditampilkan.';
    setMapLoadingVisible(true);
    setIncidentListLoadingVisible(true);
    setConnectionBadge('Loading...', 'warning');
    debugLog('refreshDashboard:start');
    try {
      await loadMapBranches();
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
      await Promise.all([loadGateAlerts(), updateDefaultCctvMarkers(), loadSnapshot(), loadOpenTickets()]);
      state.isInitialSnapshotLoaded = true;
      renderAll();
      setText(sosRouteTitleEl, 'ASSET MONITORING');
      renderAll();
      focusSelectedBranchOnMap();
      setConnectionBadge('Live', 'success');
      debugLog('refreshDashboard:done', {
        alertCount: state.alerts.size,
        visibleCount: getVisibleAlerts().length,
        selectedSosId: state.selectedSosId,
      });
    } finally {
      setMapLoadingVisible(false);
      setIncidentListLoadingVisible(false);
    }
  };

  const applyMapSnapshot = (payload) => {
    if (!payload || typeof payload !== 'object') {
      return;
    }
    const gateAlerts = toArray(payload.gate_alerts)
      .map(normalizeGateAlert)
      .filter(
        (gate) => gate && isEntityInSelectedBranch(gate.branch_id) && (gate.status === 'error' || gate.status === 'warning')
      );
    const assets = toArray(payload.assets)
      .map(normalizeStandaloneAsset)
      .filter((asset) => asset && isEntityInSelectedBranch(asset.branch_id))
      .map((asset) => ({ ...asset, showInSummary: true }));
    const sosAlerts = toArray(payload.sos).filter(Boolean);
    state.gateAlerts.items.clear();
    gateAlerts.forEach((gate) => {
      state.gateAlerts.items.set(String(gate.gate_id), { ...gate, showInSummary: true });
    });
    state.cctvCacheByBranch.clear();
    const branchId = getSelectedBranch() && getSelectedBranch().id ? String(getSelectedBranch().id) : '';
    state.standaloneAssets.items.clear();
    assets.forEach((asset) => {
      state.standaloneAssets.items.set(makeAssetKey(asset.asset_type, asset.id), asset);
    });
    if (branchId || isAllBranchesSelected()) {
      state.cctvCacheByBranch.set(
        isAllBranchesSelected() ? ALL_BRANCHES_OPTION : branchId,
        assets
          .filter((asset) => isAllBranchesSelected() || String(asset.branch_id || '') === branchId)
          .map((asset) => ({ ...asset, position: asset.latLng }))
      );
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
    if (normalized.status !== 'error' && normalized.status !== 'warning') {
      state.gateAlerts.items.delete(String(normalized.gate_id));
      if (String(state.gateAlerts.selectedGateId || '') === String(normalized.gate_id)) {
        state.gateAlerts.selectedGateId = null;
        if (state.ui.selectedEntityType === 'gate') {
          state.ui.selectedEntityType = '';
          state.ui.selectedEntityId = null;
          state.detailRenderKey = '';
          sosDetailPanelEl.classList.remove('is-visible');
          sosDetailPanelEl.classList.add('hidden');
        }
      }
      syncGateAlertMarkers();
      renderAll();
      pushGateStatusNotification(normalized);
      return;
    }
    state.gateAlerts.items.set(String(normalized.gate_id), { ...normalized, showInSummary: false });
    syncGateAlertMarkers();
    pushGateStatusNotification(normalized);
  };

  const applyStandaloneAssetPatch = (payload) => {
    const normalized = normalizeStandaloneAsset(payload);
    if (!normalized) {
      return;
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
    if (normalized.status !== 'offline') {
      state.standaloneAssets.items.delete(assetKey);
      if (cacheIndex >= 0) {
        branchCache.splice(cacheIndex, 1);
      }
    } else {
      const nextAsset = {
        ...normalized,
        position: normalized.latLng,
        showInSummary: false,
      };
      state.standaloneAssets.items.set(assetKey, nextAsset);
      if (cacheIndex >= 0) {
        branchCache.splice(cacheIndex, 1, nextAsset);
      } else {
        branchCache.push(nextAsset);
      }
    }
    if (branchId) {
      state.cctvCacheByBranch.set(branchId, branchCache);
    }
    state.cctvMapBranchId = null;
    pushAssetStatusNotification(normalized);
    void updateDefaultCctvMarkers();
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
      applyMapSnapshot(payload);
      renderAll();
      return;
    }
    if (eventName === 'connected' || eventName === 'heartbeat') {
      return;
    }
    if (eventName === 'gate_status_changed') {
      applyGateAlertPatch(payload);
      renderAll();
      return;
    }
    if (eventName === 'asset_status_changed') {
      applyStandaloneAssetPatch(payload);
      renderAll();
      return;
    }
    let latestAlert = null;
    unwrapStreamPayload(payload).forEach((item) => {
      const updated = upsertAlert(item, true);
      if (updated) {
        latestAlert = updated;
      }
    });
    renderAll();
    if (latestAlert && Number(latestAlert.status) !== 2) {
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
        throw new Error(`SSE asset monitoring gagal dengan status ${response.status}`);
      }
      debugLog('connectStream:connected', {
        status: response.status,
      });
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
      scheduleStreamReconnect();
    }
  };

  const ensureMap = async () => {
    await ensureMapsLoaded();
    if (!state.map) {
      debugLog('ensureMap:create');
      state.map = new google.maps.Map(sosMapEl, {
        center: { lat: -6.2, lng: 106.8 },
        zoom: 12,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: MAP_THEME_PRESETS[state.mapContext.themePreset],
      });
      state.trafficLayer = new google.maps.TrafficLayer();
      state.trafficLayer.setMap(state.map);
      state.cctvProjectionOverlay = new google.maps.OverlayView();
      state.cctvProjectionOverlay.onAdd = () => {};
      state.cctvProjectionOverlay.draw = () => {};
      state.cctvProjectionOverlay.onRemove = () => {};
      state.cctvProjectionOverlay.setMap(state.map);
      state.map.addListener('dragstart', () => {
        collapseCctvSpiderfy();
      });
      state.map.addListener('zoom_changed', () => {
        collapseCctvSpiderfy();
      });
      state.map.addListener('click', () => {
        if (Date.now() < state.cctvSuppressMapClickUntil) {
          return;
        }
        collapseCctvSpiderfy();
      });
    }
    applyMapTheme(state.mapContext.themePreset);
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
  };

  const startTicketRefreshLoop = () => {
    if (state.ticketRefreshTimer) {
      clearInterval(state.ticketRefreshTimer);
    }
    state.ticketRefreshTimer = window.setInterval(() => {
      void loadOpenTickets()
        .then(() => renderAll())
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
          renderAll();
          const latestAlert = Array.isArray(newAlerts)
            ? newAlerts.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))[0]
            : null;
          if (latestAlert) {
            selectAlert(latestAlert.sos_id, true, { removeNotification: false, forceFocus: true });
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
    const usesCtrl = event.ctrlKey || event.metaKey;
    const usesShift = event.shiftKey;
    const isBlockedShortcut =
      (usesCtrl && key === 'k') ||
      (usesShift && ['k', 'h', 'u', 'g', 'f', 'n', 'r', 'l', 'm'].includes(key));

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

    if (!isBlockedShortcut) {
      return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();
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
        assetMonitoring: {
          ...(workspaceState.assetMonitoring || {}),
          selectedBranchId:
            state.mapContext.selectedBranch && state.mapContext.selectedBranch.id
              ? String(state.mapContext.selectedBranch.id)
              : '',
          mapThemePreset: state.mapContext.themePreset,
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
    debugLog('enterAssetMonitoringMode');
    state.isActive = true;
    document.body.classList.add('sos-mode');
    sosDashboardEl.classList.remove('hidden');
    cameraGridEl.classList.add('hidden');
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
    if (sosMapThemeSelectEl) {
      sosMapThemeSelectEl.value = state.mapContext.themePreset;
    }
    renderNotifications();
    setToolbarState();
    state.ui.mapEmptyMessage =
      'Belum ada marker gate alert, asset offline, atau SOS aktif untuk ditampilkan.';
    setMapLoadingVisible(true);
    await loadWorkspaceBranchContext();
    await ensureMap();
    await refreshDashboard();
    startTicketRefreshLoop();
    void connectStream();
  };

  const leaveAssetMonitoringMode = () => {
    debugLog('leaveAssetMonitoringMode');
    state.isActive = false;
    document.body.classList.remove('sos-mode');
    sosDashboardEl.classList.add('hidden');
    cameraGridEl.classList.remove('hidden');
    state.notificationLeavingIds.clear();
    hideModal(sosDispatchModalEl);
    hideModal(sosCompleteModalEl);
    closeCctvModal();
    state.gateAlerts.selectedGateId = null;
    state.ui.selectedEntityType = '';
    state.ui.selectedEntityId = null;
    clearGateMarkers();
    clearCctvMarkers();
    stopStream();
    stopTicketRefreshLoop();
    setConnectionBadge('Idle', 'neutral');
    setToolbarState();
  };

  const openDispatchModal = () => {
    const alert = getSelectedAlert();
    if (!alert) {
      return;
    }
    sosDispatchSosIdEl.value = String(alert.sos_id);
    sosIncidentTypeInputEl.value = alert.ticket && alert.ticket.incident_type ? alert.ticket.incident_type : '';
    sosVehicleTypeInputEl.value = alert.ticket && alert.ticket.vehicle_type ? alert.ticket.vehicle_type : '';
    sosChronologyInputEl.value =
      alert.ticket && alert.ticket.initial_chronology ? alert.ticket.initial_chronology : '';
    setClass(sosDispatchStatusEl, 'api-check-status neutral');
    setText(sosDispatchStatusEl, 'Lengkapi dispatch untuk kejadian terpilih.');
    showModal(sosDispatchModalEl);
  };

  const openCompleteModal = () => {
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
    const alert = getSelectedAlert();
    if (!(alert && alert.ticket && alert.ticket.ticket_no)) {
      return;
    }
    const completionNote = sosCompletionNoteInputEl.value.trim();
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
    pushNotification(alert, 'Ticket SOS diselesaikan');
    renderAll();
    hideModal(sosCompleteModalEl);
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

  sosRefreshBtn.addEventListener('click', () => {
    void refreshDashboard().catch((error) => {
      setConnectionBadge(error.message || 'Refresh asset monitoring gagal.', 'danger');
    });
  });

  if (sosBranchSelectEl) {
    sosBranchSelectEl.addEventListener('change', () => {
      const nextBranchId = String(sosBranchSelectEl.value || '');
      state.mapContext.selectedBranch =
        nextBranchId === ALL_BRANCHES_OPTION
          ? {
              id: ALL_BRANCHES_OPTION,
              branch_name: 'Semua Branch',
              branch_code: 'ALL',
            }
          : state.mapContext.availableBranches.find((branch) => String(branch.id) === nextBranchId) || null;
      void persistAssetMonitoringPrefs();
      void refreshDashboard().catch((error) => {
        setConnectionBadge(error.message || 'Gagal mengganti branch monitoring.', 'danger');
      });
    });
  }

  if (sosMapThemeSelectEl) {
    sosMapThemeSelectEl.addEventListener('change', () => {
      applyMapTheme(String(sosMapThemeSelectEl.value || 'dark-ops'));
      void persistAssetMonitoringPrefs();
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
        selectAlert(entry.target.sosId, true);
        return;
      }
      if (entry.target.type === 'gate') {
        selectGateAlertOptimistic(entry.target.gateId);
        void openGateAlertDetail(entry.target.gateId);
        return;
      }
      if (entry.target.type === 'asset') {
        const asset = state.standaloneAssets.items.get(makeAssetKey(entry.target.assetType, entry.target.assetId));
        selectStandaloneAssetOptimistic(asset || {
          asset_type: entry.target.assetType,
          id: entry.target.assetId,
        });
        void openCctvModal(asset || {
          asset_type: entry.target.assetType,
          id: entry.target.assetId,
        });
        if (asset && asset.latLng) {
          focusEntityOnMap(asset.latLng, MAP_ZOOM_ASSET);
        }
      }
    }
  });

  sosIncidentListEl.addEventListener('click', (event) => {
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
      selectAlert(target.dataset.sosId, true, { forceFocus: true });
      return;
    }
    if (entityType === 'gate' && target.dataset.gateId) {
      selectGateAlertOptimistic(target.dataset.gateId);
      void openGateAlertDetail(target.dataset.gateId);
      return;
    }
    if (entityType === 'asset' && target.dataset.assetType && target.dataset.assetId) {
      const assetKey = makeAssetKey(target.dataset.assetType, target.dataset.assetId);
      const asset = state.standaloneAssets.items.get(assetKey);
      if (asset) {
        selectStandaloneAssetOptimistic(asset);
        focusEntityOnMap(asset.latLng, MAP_ZOOM_ASSET);
        void openCctvModal(asset);
      }
    }
  });

  sosIncidentListEl.addEventListener('keydown', (event) => {
    const target = event.target instanceof HTMLElement ? event.target.closest('[data-entity-type]') : null;
    if (!target) {
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      target.click();
    }
  });

  sosDispatchBtn.addEventListener('click', openDispatchModal);
  sosCompleteBtn.addEventListener('click', openCompleteModal);
  closeSosDetailBtn.addEventListener('click', clearSelectedAlert);
  closeSosDispatchBtn.addEventListener('click', () => hideModal(sosDispatchModalEl));
  closeSosCompleteBtn.addEventListener('click', () => hideModal(sosCompleteModalEl));
  closeSosCctvModalBtn.addEventListener('click', closeCctvModal);

  sosDispatchFormEl.addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = {
      sos_id: Number(sosDispatchSosIdEl.value),
      incident_type: sosIncidentTypeInputEl.value.trim(),
      vehicle_type: sosVehicleTypeInputEl.value.trim(),
      initial_chronology: sosChronologyInputEl.value.trim(),
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
    if (event.target === sosDispatchModalEl) {
      hideModal(sosDispatchModalEl);
    }
    if (event.target === sosCompleteModalEl) {
      hideModal(sosCompleteModalEl);
    }
    if (event.target === sosCctvModalEl) {
      closeCctvModal();
    }
  });
  document.addEventListener('keydown', handleSosKeyboardGuards, true);

  renderNotifications();
  renderSummary();
})();


