// src/lib/apiClient.js
const BASE = import.meta.env.VITE_API_BASE_URL || process.env.REACT_APP_API_BASE_URL || '';

function getAccessToken() {
  return localStorage.getItem('accessToken');
}

async function request(path, { method = 'GET', body = null, headers = {}, skipAuth = false } = {}) {
  const url = `${BASE}${path}`;
  const init = { method, headers: { ...headers } };

  if (!skipAuth) {
    const token = getAccessToken();
    if (token) init.headers['Authorization'] = `Bearer ${token}`;
  }

  if (body && !(body instanceof FormData)) {
    init.headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify(body);
  } else if (body instanceof FormData) {
    init.body = body; // browser sets headers
  }

  const res = await fetch(url, init);
  const contentType = res.headers.get('content-type') || '';
  let data;
  if (contentType.includes('application/json')) data = await res.json();
  else data = await res.text();
  if (!res.ok) {
    const err = new Error(data?.error || res.statusText || 'API Error');
    err.status = res.status;
    err.body = data;
    throw err;
  }
  return data;
}

export default {
  get: (p, opts) => request(p, { ...opts, method: 'GET' }),
  post: (p, b, opts) => request(p, { ...opts, method: 'POST', body: b }),
  put: (p, b, opts) => request(p, { ...opts, method: 'PUT', body: b }),
  del: (p, opts) => request(p, { ...opts, method: 'DELETE' }),
  rawRequest: request
};
