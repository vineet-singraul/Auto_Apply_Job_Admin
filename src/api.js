// Admin API client. Tokens sessionStorage me (tab band = logout).
const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';
const S = sessionStorage;

export const getAuth = () => { try { return JSON.parse(S.getItem('adminAuth')); } catch { return null; } };
const setAuth = (a) => (a ? S.setItem('adminAuth', JSON.stringify(a)) : S.removeItem('adminAuth'));

async function raw(method, path, body, token) {
  let r;
  try {
    r = await fetch(BASE + path, {
      method,
      headers: { 'content-type': 'application/json', ...(token && { authorization: `Bearer ${token}` }) },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch { throw new Error('Server not reachable'); }
  return { status: r.status, data: await r.json().catch(() => ({})) };
}

export async function login(email, password) {
  let deviceId = localStorage.getItem('adminDeviceId');
  if (!deviceId) { deviceId = `admin-web-${crypto.randomUUID()}`; localStorage.setItem('adminDeviceId', deviceId); }
  const r = await raw('POST', '/auth/login', { email, password, deviceId });
  if (r.status >= 400) throw new Error(r.data.error || 'Login failed');
  if (r.data.user.role !== 'admin') {
    await raw('POST', '/auth/logout', { refreshToken: r.data.refreshToken });
    throw new Error('This account is not an admin');
  }
  setAuth(r.data);
  return r.data.user;
}

export async function logout() {
  const a = getAuth();
  if (a) await raw('POST', '/auth/logout', { refreshToken: a.refreshToken }).catch(() => {});
  setAuth(null);
  location.reload();
}

let refreshing = null;
export async function api(method, path, body) {
  let a = getAuth();
  if (!a) throw new Error('LOGIN_REQUIRED');
  let r = await raw(method, path, body, a.accessToken);
  if (r.status === 401) {
    refreshing ||= raw('POST', '/auth/refresh', { refreshToken: a.refreshToken }).finally(() => { refreshing = null; });
    const rr = await refreshing;
    if (rr.status !== 200) { setAuth(null); location.reload(); throw new Error('Session expired'); }
    a = { ...a, ...rr.data };
    setAuth(a);
    r = await raw(method, path, body, a.accessToken);
  }
  if (r.status >= 400) throw new Error(r.data.error || `Error ${r.status}`);
  return r.data;
}

export const get = (path) => api('GET', path);
export const qs = (o) => new URLSearchParams(Object.entries(o).filter(([, v]) => v !== '' && v != null)).toString();
