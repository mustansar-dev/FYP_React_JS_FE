const API_BASE_URL = (process.env.PLAYSPOT_API_BASE_URL || '/api/v1').replace(/\/$/, '');
const REFRESH_KEY = 'playspot-web.refresh-token.v1';
const TIMEOUT_MS = 15000;

let accessToken = null;
let memoryRefreshToken = null;
let refreshInFlight = null;
let sessionExpiredHandler = () => {};

export class ApiError extends Error {
  constructor(message, { status = 0, code = 'NETWORK_ERROR', details = [] } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = Array.isArray(details) ? details : [];
  }
}

export function setSessionExpiredHandler(handler) {
  sessionExpiredHandler = typeof handler === 'function' ? handler : () => {};
}

export function setSession(tokens) {
  if (!tokens?.accessToken || !tokens?.refreshToken) {
    throw new ApiError('The server returned an incomplete sign-in session.', { code: 'INVALID_SESSION' });
  }
  accessToken = tokens.accessToken;
  memoryRefreshToken = tokens.refreshToken;
  try {
    window.sessionStorage.setItem(REFRESH_KEY, tokens.refreshToken);
    return null;
  } catch {
    return 'Your browser blocked tab storage. You may need to sign in again after reloading.';
  }
}

export function clearSession() {
  accessToken = null;
  memoryRefreshToken = null;
  try { window.sessionStorage.removeItem(REFRESH_KEY); } catch { /* Storage may be unavailable. */ }
}

function getRefreshToken() {
  try { return window.sessionStorage.getItem(REFRESH_KEY) || memoryRefreshToken; }
  catch { return memoryRefreshToken; }
}

async function readPayload(response) {
  let payload;
  try { payload = await response.json(); } catch { payload = null; }
  if (!response.ok || payload?.success === false) {
    const error = payload?.error || {};
    throw new ApiError(error.message || `The server returned ${response.status}.`, {
      status: response.status, code: error.code || 'REQUEST_FAILED', details: error.details,
    });
  }
  if (payload?.success !== true || !Object.hasOwn(payload, 'data')) {
    throw new ApiError('The server response was not in the expected format.', { status: response.status, code: 'INVALID_RESPONSE' });
  }
  return payload.data;
}

async function rawRequest(path, { method = 'GET', body, token, signal } = {}) {
  const controller = !signal && typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), TIMEOUT_MS) : null;
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      ...(signal ? { signal } : controller ? { signal: controller.signal } : {}),
    });
    return await readPayload(response);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const timedOut = error?.name === 'AbortError';
    throw new ApiError(timedOut
      ? 'The server took too long to respond. Check your connection and try again.'
      : 'Could not reach PlaySpot. Check that the backend is running and the API URL is correct.', {
      code: timedOut ? 'TIMEOUT' : 'NETWORK_ERROR',
    });
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function rotateRefreshToken() {
  if (!refreshInFlight) {
    const refreshToken = getRefreshToken();
    if (!refreshToken) throw new ApiError('Your session has expired. Please sign in again.', { status: 401, code: 'SESSION_EXPIRED' });
    refreshInFlight = rawRequest('/auth/refresh', { method: 'POST', body: { refreshToken } })
      .then(tokens => { setSession(tokens); return tokens; })
      .catch(error => {
        if (error.status === 401) { clearSession(); sessionExpiredHandler(); }
        throw error;
      })
      .finally(() => { refreshInFlight = null; });
  }
  return refreshInFlight;
}

export async function apiRequest(path, options = {}) {
  const { auth = true, retryAuth = true, ...requestOptions } = options;
  try {
    return await rawRequest(path, { ...requestOptions, ...(auth && accessToken ? { token: accessToken } : {}) });
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401 || !auth || !retryAuth || path === '/auth/refresh') throw error;
    try {
      const tokens = await rotateRefreshToken();
      return rawRequest(path, { ...requestOptions, token: tokens.accessToken });
    } catch (refreshError) {
      if (refreshError.status === 401) sessionExpiredHandler();
      throw refreshError;
    }
  }
}

export async function restoreSession() {
  if (!getRefreshToken()) return null;
  const tokens = await rotateRefreshToken();
  const user = await apiRequest('/auth/me');
  return { ...tokens, user };
}
