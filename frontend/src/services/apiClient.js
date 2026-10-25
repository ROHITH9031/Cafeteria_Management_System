const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  let body;
  try {
    body = await response.json();
  } catch {
    body = {};
  }

  if (!response.ok) {
    throw new Error(body?.message || `API request failed: ${response.status}`);
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
