function getApiBaseUrl() {
  const configuredUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/+$/, '');
  return configuredUrl.endsWith('/api') ? configuredUrl : `${configuredUrl}/api`;
}

const API_BASE_URL = getApiBaseUrl();

export async function apiRequest(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
  } catch (networkError) {
    console.error(`[API Network Error] ${path}:`, networkError);
    throw new Error(
      'Unable to connect to the cafeteria server. Please verify your connection or check if the server is running.',
      { cause: networkError }
    );
  }

  let body;
  try {
    body = await response.json();
  } catch {
    body = {};
  }

  if (!response.ok) {
    const errorMessage = body?.message || body?.error || `Request failed with status ${response.status}`;
    const error = new Error(errorMessage);
    error.status = response.status;
    error.details = body?.errors;
    throw error;
  }

  return body;
}

export function getApiToken() {
  return localStorage.getItem('srkr_api_token');
}

export function setApiToken(token) {
  localStorage.setItem('srkr_api_token', token);
}

export function clearApiToken() {
  localStorage.removeItem('srkr_api_token');
}

export function authHeaders() {
  const token = getApiToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
