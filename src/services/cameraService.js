const DEFAULT_API_BASE_URL = 'http://localhost:3002';
let apiBaseUrl = process.env.API_BASE_URL || DEFAULT_API_BASE_URL;
let apiAuthToken = String(process.env.API_AUTH_TOKEN || '').trim();

const normalizeApiBaseUrl = (value) => {
  const rawValue = String(value || '').trim();
  if (!rawValue) {
    throw new Error('API base URL cannot be empty.');
  }

  let parsed;
  try {
    parsed = new URL(rawValue);
  } catch (_) {
    throw new Error('API base URL must be a valid absolute URL.');
  }

  if (!parsed.protocol || (parsed.protocol !== 'http:' && parsed.protocol !== 'https:')) {
    throw new Error('API base URL must use http:// or https://.');
  }

  return parsed.toString().replace(/\/$/, '');
};

apiBaseUrl = normalizeApiBaseUrl(apiBaseUrl);

const buildAuthHeaders = (headers = {}) => {
  const nextHeaders = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (apiAuthToken) {
    nextHeaders.Authorization = `Bearer ${apiAuthToken}`;
  }

  return nextHeaders;
};

const buildUrl = (pathname, query = {}) => {
  const url = new URL(pathname, apiBaseUrl);
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }
    url.searchParams.set(key, String(value));
  });
  return url.toString();
};

const toPathAndSearch = (urlString) => {
  const url = new URL(urlString);
  return `${url.pathname}${url.search}`;
};

const logApiError = ({ method, url, status, payload, rawBody, message }) => {
  const detail = {
    method,
    url,
    status,
    message,
  };

  if (payload !== null && payload !== undefined) {
    detail.payload = payload;
  } else if (rawBody) {
    detail.rawBody = rawBody;
  }

  console.error('[cameraService] API request failed', detail);
};

const toError = async (response, requestMeta = {}) => {
  let payload = null;
  let rawBody = '';
  try {
    payload = await response.json();
  } catch (_) {
    try {
      rawBody = await response.text();
    } catch (_) {
      rawBody = '';
    }
    payload = null;
  }

  const message =
    (payload && payload.message) || `Request failed with status ${response.status}`;
  logApiError({
    method: requestMeta.method || 'GET',
    url: requestMeta.url || 'unknown',
    status: response.status,
    payload,
    rawBody,
    message,
  });
  const error = new Error(message);
  error.status = response.status;
  error.payload = payload;
  error.rawBody = rawBody;
  throw error;
};

const requestJson = async (pathname, options = {}) => {
  const method = options.method || 'GET';
  const url = `${apiBaseUrl}${pathname}`;
  const response = await fetch(url, {
    ...options,
    headers: buildAuthHeaders(options.headers || {}),
  });

  if (!response.ok) {
    await toError(response, { method, url });
  }

  return response.json();
};

const encodePathSegment = (value) => encodeURIComponent(String(value || '').trim());

const getHealth = () => requestJson('/health');

const getApiDocsUrl = () => `${apiBaseUrl}/api-docs`;
const getApiBaseUrl = () => apiBaseUrl;
const getApiAuthToken = () => apiAuthToken;

const setApiBaseUrl = (nextApiBaseUrl) => {
  apiBaseUrl = normalizeApiBaseUrl(nextApiBaseUrl);
  return apiBaseUrl;
};

const setApiAuthToken = (nextApiAuthToken) => {
  apiAuthToken = String(nextApiAuthToken || '').trim();
  return apiAuthToken;
};

const checkApiBaseUrl = async (candidateApiBaseUrl, candidateApiAuthToken = '') => {
  const normalizedApiBaseUrl = normalizeApiBaseUrl(candidateApiBaseUrl);
  const normalizedApiAuthToken = String(candidateApiAuthToken || '').trim();
  const headers = buildAuthHeaders();
  if (normalizedApiAuthToken) {
    headers.Authorization = `Bearer ${normalizedApiAuthToken}`;
  }
  const response = await fetch(`${normalizedApiBaseUrl}/health`, {
    headers,
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch (_) {
    payload = null;
  }

  if (!response.ok) {
    logApiError({
      method: 'GET',
      url: `${normalizedApiBaseUrl}/health`,
      status: response.status,
      payload,
      rawBody: '',
      message:
        (payload && payload.message) || `Health check failed with status ${response.status}`,
    });
    const error = new Error(
      (payload && payload.message) || `Health check failed with status ${response.status}`
    );
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return {
    apiBaseUrl: normalizedApiBaseUrl,
    apiAuthToken: normalizedApiAuthToken,
    message: (payload && payload.message) || 'API health check succeeded.',
    health: payload,
  };
};

const getBranches = (query = {}) =>
  requestJson(toPathAndSearch(buildUrl('/api/cameras/branches', query)));

const getMapBranches = () => requestJson('/api/map/branches');

const getGates = (query = {}) =>
  requestJson(toPathAndSearch(buildUrl('/api/cameras/gates', query)));

const getGateAlerts = (query = {}) =>
  requestJson(toPathAndSearch(buildUrl('/api/map/gate-alerts', query)));

const getGateAlertDetail = (gateId) =>
  requestJson(`/api/map/gate-alerts/${encodePathSegment(gateId)}`);

const getMapNetworkArcs = (query = {}) =>
  requestJson(toPathAndSearch(buildUrl('/api/map/network-arcs', query)));

const getMapWeather = (query = {}) =>
  requestJson(toPathAndSearch(buildUrl('/api/map/weather', query)));

const getBranchPages = (branchId) => requestJson(`/api/cameras/branch/${branchId}/pages`);

const getCamerasByBranch = (branchId, page = 1) =>
  requestJson(`/api/cameras/branch/${branchId}?page=${encodeURIComponent(page)}`);

const getCameras = (query = {}) =>
  requestJson(toPathAndSearch(buildUrl('/api/cameras', query)));

const getMapAssets = (query = {}) =>
  requestJson(toPathAndSearch(buildUrl('/api/map-assets', query)));

const getMapAssetDetail = (assetType, id) =>
  requestJson(`/api/map-assets/${encodePathSegment(assetType)}/${encodePathSegment(id)}`);

const searchCameras = (query = {}) =>
  requestJson(toPathAndSearch(buildUrl('/api/cameras/search', query)));

const createCamera = (payload) =>
  requestJson('/api/cameras', {
    method: 'POST',
    body: JSON.stringify(payload || {}),
  });

const getSosAlerts = () => requestJson('/api/sos-alerts');

const getOpenSosTickets = () => requestJson('/api/sos-tickets/open');

const getSosTicketDetail = (ticketNo) =>
  requestJson(`/api/sos-tickets/${encodePathSegment(ticketNo)}`);

const dispatchSosTicket = (payload) =>
  requestJson('/api/sos-tickets/dispatch', {
    method: 'POST',
    body: JSON.stringify(payload || {}),
  });

const completeSosTicket = (ticketNo, payload) =>
  requestJson(`/api/sos-tickets/${encodePathSegment(ticketNo)}/complete`, {
    method: 'PATCH',
    body: JSON.stringify(payload || {}),
  });

module.exports = {
  getApiDocsUrl,
  getApiBaseUrl,
  getApiAuthToken,
  getBranches,
  getMapBranches,
  getBranchPages,
  getCameras,
  getMapAssets,
  getMapAssetDetail,
  searchCameras,
  getCamerasByBranch,
  getGates,
  getGateAlerts,
  getGateAlertDetail,
  getMapNetworkArcs,
  getMapWeather,
  getHealth,
  checkApiBaseUrl,
  setApiAuthToken,
  setApiBaseUrl,
  createCamera,
  getSosAlerts,
  getOpenSosTickets,
  getSosTicketDetail,
  dispatchSosTicket,
  completeSosTicket,
};
