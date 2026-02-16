const API_BASE_URL = 'http://localhost:3000';

const buildUrl = (pathname, query = {}) => {
  const url = new URL(pathname, API_BASE_URL);
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

const toError = async (response) => {
  let payload = null;
  try {
    payload = await response.json();
  } catch (_) {
    payload = null;
  }

  const message =
    (payload && payload.message) || `Request failed with status ${response.status}`;
  const error = new Error(message);
  error.status = response.status;
  error.payload = payload;
  throw error;
};

const requestJson = async (pathname, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${pathname}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    await toError(response);
  }

  return response.json();
};

const getHealth = () => requestJson('/health');

const getApiDocsUrl = () => `${API_BASE_URL}/api-docs`;

const getBranches = (query = {}) =>
  requestJson(toPathAndSearch(buildUrl('/api/cameras/branches', query)));

const getGates = (query = {}) =>
  requestJson(toPathAndSearch(buildUrl('/api/cameras/gates', query)));

const getBranchPages = (branchId) => requestJson(`/api/cameras/branch/${branchId}/pages`);

const getCamerasByBranch = (branchId, page = 1) =>
  requestJson(`/api/cameras/branch/${branchId}?page=${encodeURIComponent(page)}`);

const getCameras = (query = {}) =>
  requestJson(toPathAndSearch(buildUrl('/api/cameras', query)));

const createCamera = (payload) =>
  requestJson('/api/cameras', {
    method: 'POST',
    body: JSON.stringify(payload || {}),
  });

module.exports = {
  getApiDocsUrl,
  getBranches,
  getBranchPages,
  getCameras,
  getCamerasByBranch,
  getGates,
  getHealth,
  createCamera,
};
