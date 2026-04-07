(function () {
  const GOOGLE_MAPS_API_KEY = 'AIzaSyAuNghu_4V4kxgcCa5UX0XBV_zPMZzV-Cg';
  const SOS_STREAM_RETRY_MS = 4000;
  const SOS_TICKET_REFRESH_MS = 30000;
  const SOS_ALERT_SYNC_MS = 5000;
  const SOS_NOTIFICATION_LIMIT = 5;

  const $ = (id) => document.getElementById(id);
  const sosMonitorBtn = $('sosMonitorBtn');
  const sosDashboardEl = $('sosDashboard');
  const cameraGridEl = $('cameraGrid');
  const pagingControlEl = $('pagingControl');
  const currentBranchEl = $('currentBranch');
  const sosRefreshBtn = $('sosRefreshBtn');
  const sosConnectionBadgeEl = $('sosConnectionBadge');
  const sosOpenCountBadgeEl = $('sosOpenCountBadge');
  const sosRouteTitleEl = $('sosRouteTitle');
  const sosMapEl = $('sosMap');
  const sosMapLoadingEl = $('sosMapLoading');
  const sosMapEmptyEl = $('sosMapEmpty');
  const sosCctvToggleEl = $('sosCctvToggle');
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

  const state = {
    isActive: false,
    alerts: new Map(),
    ticketsBySosId: new Map(),
    selectedSosId: null,
    notifications: [],
    mapsLoaderPromise: null,
    map: null,
    trafficLayer: null,
    cctvMarkers: [],
    cctvCluster: null,
    cctvClusterRenderMarkers: [],
    cctvMapBranchId: null,
    cctvMapBranchLabel: '',
    cctvVisible: true,
    cctvCacheByBranch: new Map(),
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
    markers: new Map(),
    markerClass: null,
    streamAbortController: null,
    streamRetryTimer: null,
    ticketRefreshTimer: null,
    alertRefreshTimer: null,
    previousBranchLabel: '',
    isInitialSnapshotLoaded: false,
    activeWorkspaceBranch: null,
  };

  const debugLog = (...args) => {
    console.info('[sos-monitoring]', ...args);
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
    if (!sosMapLoadingEl) {
      return;
    }
    sosMapLoadingEl.classList.toggle('sidebar-section-hidden', !visible);
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

  const ONLINE_MARKER_URL = new URL('./assets/marker-map-online.svg', window.location.href).toString();
  const OFFLINE_MARKER_URL = new URL('./assets/marker-map-offline.svg', window.location.href).toString();

  const getCameraCoordinates = (camera) => {
    if (!camera || typeof camera !== 'object') {
      return null;
    }
    const lat = Number(camera.cctv_lat || camera.latitude);
    const lng = Number(camera.cctv_lon || camera.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return null;
    }
    return { lat, lng };
  };

  const getCameraOperationalState = (camera) =>
    Number(camera && camera.is_active) === 1 ? 'online' : 'offline';

  const getCctvMarkerIconUrl = (camera) =>
    getCameraOperationalState(camera) === 'online' ? ONLINE_MARKER_URL : OFFLINE_MARKER_URL;

  const getCctvMarkerScaledSize = (camera) =>
    String(camera && camera.id) === String(state.cctvSelectedCameraId) ? 40 : 32;

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

  const getVisibleAlerts = () =>
    Array.from(state.alerts.values())
      .filter((alert) => alert && Number(alert.status) !== 2)
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

  const getSelectedAlert = () => state.alerts.get(Number(state.selectedSosId)) || null;

  const setConnectionBadge = (label, tone = 'neutral') => {
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
        (entry) => `
          <article class="sos-notification-card" data-sos-id="${entry.sosId}">
            <div class="sos-incident-item__row">
              <strong>${escapeHtml(entry.title)}</strong>
              <button class="sos-notification-close-btn" type="button" data-notification-close="${entry.sosId}" aria-label="Tutup notifikasi" title="Tutup notifikasi">
                <span class="sos-notification-close-btn__icon" aria-hidden="true">&times;</span>
              </button>
            </div>
            <button class="sos-notification-card__open" type="button" data-sos-id="${entry.sosId}">
              <span>${escapeHtml(entry.subtitle)}</span>
            </button>
          </article>
        `
      )
      .join('');
  };

  const removeNotification = (sosId) => {
    const normalizedId = Number(sosId);
    state.notifications = state.notifications.filter((entry) => Number(entry.sosId) !== normalizedId);
    renderNotifications();
  };

  const pushNotification = (alert, title) => {
    const branchName = String(alert && alert.branch_name ? alert.branch_name : '-').trim() || '-';
    const fullName = getAlertName(alert);
    state.notifications = [
      {
        sosId: alert.sos_id,
        title: title || `SOS dilaporkan oleh ${fullName} di ruas tol ${branchName}`,
        subtitle: `Waktu lapor ${toDateTime(alert.created_at)}`,
      },
      ...state.notifications.filter((entry) => entry.sosId !== alert.sos_id),
    ].slice(0, SOS_NOTIFICATION_LIMIT);
    renderNotifications();
  };

  const renderSummary = () => {
    setText(sosOpenCountBadgeEl, `${getVisibleAlerts().length} aktif`);
  };

  const renderIncidentList = () => {
    const alerts = getVisibleAlerts();
    if (!alerts.length) {
      sosIncidentListEl.innerHTML =
        '<div class="sos-incident-item sos-incident-item--empty">Belum ada kejadian SOS aktif.</div>';
      return;
    }
    sosIncidentListEl.innerHTML = alerts
      .map((alert) => {
        const statusMeta = getStatusMeta(alert.status);
        const rawPhoneNumber = alert.user && alert.user.phone ? String(alert.user.phone) : '';
        const displayPhoneNumber = getDisplayPhoneNumber(rawPhoneNumber);
        const whatsAppLink = getWhatsAppLink(rawPhoneNumber);
        return `
          <article class="sos-incident-item ${alert.sos_id === state.selectedSosId ? 'is-selected' : ''}" data-sos-id="${alert.sos_id}" tabindex="0" role="button" aria-label="Pilih kejadian SOS ${alert.sos_id}">
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
  };

  const renderDetailPanel = () => {
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
          <span class="meta-pill">${escapeHtml(alert.branch_name || '-')}</span>
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
  };

  const updateMapEmptyState = (message) => {
    const hasCctvMarkers = Array.isArray(state.cctvMarkers) && state.cctvMarkers.length > 0;
    const shouldHide = Boolean(state.map) && (getVisibleAlerts().length > 0 || hasCctvMarkers);
    sosMapEmptyEl.classList.toggle('hidden', shouldHide);
    if (message) {
      setText(sosMapEmptyEl, message);
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
        state.map.setZoom(Math.max(Number(state.map.getZoom()) || 12, 16));
      }, 180);
    }
  };

  const getContextBranch = () => {
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

  const openCctvModal = (camera) => {
    if (!camera) {
      return;
    }
    state.cctvSelectedCameraId = String(camera.id || '');
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
    setText(sosCctvModalTitleEl, camera.cctv_name || `Camera ${camera.id || '-'}`);
    sosCctvModalMetaEl.innerHTML = '';
    sosCctvModalMetaEl.classList.add('hidden');
    attachSosCctvModalStream(camera);
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

  const clearCctvMarkers = () => {
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
      state.cctvCluster.clearMarkers();
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

  const updateDefaultCctvMarkers = async () => {
    const branch = getContextBranch();
    if (!state.map) {
      return;
    }
    if (!state.cctvVisible) {
      clearCctvMarkers();
      updateMapEmptyState(getVisibleAlerts().length ? '' : 'Cluster CCTV sedang disembunyikan.');
      return;
    }
    if (!branch || !branch.id) {
      clearCctvMarkers();
      state.cctvMapBranchId = null;
      state.cctvMapBranchLabel = '';
      updateMapEmptyState('Pilih ruas aktif operator untuk menampilkan cluster CCTV.');
      return;
    }
    if (String(state.cctvMapBranchId) === String(branch.id) && state.cctvMarkers.length) {
      updateMapEmptyState('');
      return;
    }
    clearCctvMarkers();
    state.cctvMapBranchId = String(branch.id);
    state.cctvMapBranchLabel = branch.branch_name || branch.branch_code || '';
    try {
      state.cctvClusterRenderMarkers = [];
      let cameras = state.cctvCacheByBranch.get(String(branch.id));
      if (!cameras) {
        const response = await window.cameraService.getCameras({ branch_id: branch.id, limit: 500 });
        if (!response || response.status >= 400) {
          throw new Error((response && response.message) || 'Gagal memuat CCTV branch.');
        }
        cameras = (Array.isArray(response.data) ? response.data : [])
          .map((camera) => ({
            ...camera,
            position: getCameraCoordinates(camera),
          }))
          .filter((camera) => camera.position);
        state.cctvCacheByBranch.set(String(branch.id), cameras);
      }
      const markerClustererLib = await loadMarkerClustererLibrary();
      state.cctvMarkers = cameras.map((camera) => {
        const marker = new window.google.maps.Marker({
            map: state.map,
            position: camera.position,
            title: camera.cctv_name || 'CCTV',
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
          openCctvModal(camera);
        });
        return {
          marker,
          camera,
          originalPosition: camera.position,
        };
      });
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
              (Array.isArray(clusterMarkers) ? clusterMarkers : []).forEach((clusterMarker) => {
                const entry = state.cctvMarkers.find((item) => item && item.marker === clusterMarker);
                if (!entry || !entry.camera) {
                  return;
                }
                if (getCameraOperationalState(entry.camera) === 'online') {
                  summary.onlineCount += 1;
                  return;
                }
                summary.offlineCount += 1;
              });
              const size = count >= 100 ? 62 : count >= 10 ? 56 : 52;
              const marker = new window.google.maps.Marker({
                position,
                icon: {
                  url: buildSosClusterSvgDataUrl(count, summary.onlineCount, summary.offlineCount),
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
              marker.__clusterSummary = {
                count,
                onlineCount: summary.onlineCount,
                offlineCount: summary.offlineCount,
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
                openCctvModal(singleCamera);
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
      }
      if (!getVisibleAlerts().length && cameras.length) {
        const bounds = new google.maps.LatLngBounds();
        cameras.forEach((camera) => bounds.extend(camera.position));
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
    renderIncidentList();
    renderDetailPanel();
    renderNotifications();
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
    if (shouldRemoveNotification) {
      removeNotification(sosId);
    }
    renderAll();
    if (focusOnMap) {
      focusAlertOnMap(getSelectedAlert(), true);
    }
  };

  const clearSelectedAlert = () => {
    state.selectedSosId = null;
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
    setMapLoadingVisible(true);
    setIncidentListLoadingVisible(true);
    setConnectionBadge('Loading...', 'warning');
    debugLog('refreshDashboard:start');
    try {
      await Promise.all([loadSnapshot(), loadOpenTickets()]);
      state.isInitialSnapshotLoaded = true;
      renderAll();
      const visibleAlerts = getVisibleAlerts();
      setText(sosRouteTitleEl, 'TRAFFIC MONITORING');
      if (!state.selectedSosId && visibleAlerts.length) {
        state.selectedSosId = visibleAlerts[0].sos_id;
      }
      renderAll();
      fitVisibleAlerts();
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
    let latestAlert = null;
    unwrapStreamPayload(payload).forEach((item) => {
      const updated = upsertAlert(item, true);
      if (updated) {
        latestAlert = updated;
      }
    });
    renderAll();
    if (latestAlert && Number(latestAlert.status) !== 2) {
      selectAlert(latestAlert.sos_id, true, { removeNotification: false });
    }
    if (eventName === 'complete' && latestAlert) {
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
      const response = await fetch(`${apiBaseUrl}/api/sos-alerts/stream`, {
        headers,
        signal: state.streamAbortController.signal,
      });
      if (!response.ok || !response.body) {
        throw new Error(`SSE SOS gagal dengan status ${response.status}`);
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
    if (state.isActive) {
      state.previousBranchLabel = currentBranchEl ? currentBranchEl.textContent : state.previousBranchLabel;
      setText(currentBranchEl, 'Active mode: SOS Monitoring');
    } else if (state.previousBranchLabel) {
      setText(currentBranchEl, state.previousBranchLabel);
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
            selectAlert(latestAlert.sos_id, true, { removeNotification: false });
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
      debugLog('loadWorkspaceBranchContext', {
        branchId: state.activeWorkspaceBranch && state.activeWorkspaceBranch.id,
      });
    } catch (_) {
      state.activeWorkspaceBranch = null;
    }
  };

  const enterSosMode = async () => {
    if (state.isActive) {
      return;
    }
    debugLog('enterSosMode');
    state.isActive = true;
    document.body.classList.add('sos-mode');
    sosDashboardEl.classList.remove('hidden');
    cameraGridEl.classList.add('hidden');
    state.notifications = [];
    state.selectedSosId = null;
    state.isInitialSnapshotLoaded = false;
    state.cctvVisible = sosCctvToggleEl ? Boolean(sosCctvToggleEl.checked) : true;
    renderNotifications();
    setToolbarState();
    updateMapEmptyState('Memuat data SOS...');
    await loadWorkspaceBranchContext();
    await ensureMap();
    await refreshDashboard();
    startTicketRefreshLoop();
    startAlertRefreshLoop();
    void connectStream();
  };

  const leaveSosMode = () => {
    debugLog('leaveSosMode');
    state.isActive = false;
    document.body.classList.remove('sos-mode');
    sosDashboardEl.classList.add('hidden');
    cameraGridEl.classList.remove('hidden');
    hideModal(sosDispatchModalEl);
    hideModal(sosCompleteModalEl);
    closeCctvModal();
    clearCctvMarkers();
    stopStream();
    stopTicketRefreshLoop();
    stopAlertRefreshLoop();
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
      leaveSosMode();
      return;
    }
    void enterSosMode().catch((error) => {
      setConnectionBadge(error.message || 'Gagal membuka SOS monitor.', 'danger');
    });
  });

  sosRefreshBtn.addEventListener('click', () => {
    void refreshDashboard().catch((error) => {
      setConnectionBadge(error.message || 'Refresh SOS gagal.', 'danger');
    });
  });

  sosCctvToggleEl.addEventListener('change', () => {
    state.cctvVisible = Boolean(sosCctvToggleEl.checked);
    if (!state.cctvVisible) {
      closeCctvModal();
      clearCctvMarkers();
      updateMapEmptyState(getVisibleAlerts().length ? '' : 'Cluster CCTV sedang disembunyikan.');
      return;
    }
    void updateDefaultCctvMarkers();
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
    const target = event.target instanceof HTMLElement ? event.target.closest('[data-sos-id]') : null;
    if (target) {
      selectAlert(target.dataset.sosId, true);
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
    const target = event.target instanceof HTMLElement ? event.target.closest('[data-sos-id]') : null;
    if (target) {
      selectAlert(target.dataset.sosId, true);
    }
  });

  sosIncidentListEl.addEventListener('keydown', (event) => {
    const target = event.target instanceof HTMLElement ? event.target.closest('[data-sos-id]') : null;
    if (!target) {
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectAlert(target.dataset.sosId, true);
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
