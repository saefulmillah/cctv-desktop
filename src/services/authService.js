const capabilityService = require('./capabilityService');

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

const buildHeaders = (token = '') => {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (String(token || '').trim()) {
    headers.Authorization = `Bearer ${String(token || '').trim()}`;
  }
  return headers;
};

const parseJsonResponse = async (response) => {
  try {
    return await response.json();
  } catch (_) {
    return null;
  }
};

const toError = (response, payload, fallbackMessage) => {
  const error = new Error(
    (payload && payload.message) || fallbackMessage || `Request failed with status ${response.status}`
  );
  error.status = response.status;
  error.payload = payload;
  return error;
};

const extractToken = (payload) => {
  const candidates = [
    payload && payload.data && Array.isArray(payload.data) ? payload.data[0] : null,
    payload && payload.data && typeof payload.data === 'object' ? payload.data : null,
    payload,
  ];

  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== 'object') {
      continue;
    }
    const rawToken = candidate.token || candidate.access_token || candidate.accessToken;
    const normalizedToken = String(rawToken || '').trim();
    if (normalizedToken) {
      return normalizedToken;
    }
  }

  return '';
};

const fetchCapability = async ({ apiBaseUrl, token }) => {
  const normalizedApiBaseUrl = normalizeApiBaseUrl(apiBaseUrl);
  const normalizedToken = String(token || '').trim();
  if (!normalizedToken) {
    throw new Error('Access token is required.');
  }

  const response = await fetch(`${normalizedApiBaseUrl}/api/auth/me`, {
    method: 'GET',
    headers: buildHeaders(normalizedToken),
  });
  const payload = await parseJsonResponse(response);
  if (!response.ok) {
    throw toError(response, payload, 'Failed to load current capability.');
  }

  return capabilityService.normalizeCapabilityPayload(payload, normalizedToken);
};

const login = async ({ apiBaseUrl, username, password }) => {
  const normalizedApiBaseUrl = normalizeApiBaseUrl(apiBaseUrl);
  const response = await fetch(`${normalizedApiBaseUrl}/api/auth/login`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify({
      username: String(username || '').trim(),
      password: String(password || ''),
    }),
  });
  const payload = await parseJsonResponse(response);
  if (!response.ok) {
    throw toError(response, payload, 'Login failed.');
  }

  const token = extractToken(payload);
  if (!token) {
    const error = new Error('Login succeeded but access token was not returned.');
    error.status = 500;
    error.payload = payload;
    throw error;
  }

  return fetchCapability({
    apiBaseUrl: normalizedApiBaseUrl,
    token,
  });
};

module.exports = {
  fetchCapability,
  login,
  normalizeApiBaseUrl,
};
