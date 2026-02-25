export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

let unauthorizedHandler = null;

export const setUnauthorizedHandler = (handler) => {
  unauthorizedHandler = handler;
};

export const resolveApiUrl = (url) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith('/')) {
    return `${API_BASE_URL}${url}`;
  }
  return `${API_BASE_URL}/${url}`;
};

/** Liste d’URLs d’images d’un design : images[] ou fallback image_path / image_url */
export const getDesignImages = (design) => {
  if (!design) return [];
  const list = Array.isArray(design.images) && design.images.length > 0
    ? design.images
    : design.image_path || design.image_url
      ? [design.image_path || design.image_url]
      : [];
  return list.map((u) => (typeof u === 'string' && u.startsWith('http') ? u : resolveApiUrl(u)));
};

/** URL de l’image principale (première de la galerie ou image_path) */
export const getDesignMainImage = (design) => {
  const urls = getDesignImages(design);
  return urls[0] || design?.image || '';
};

const buildHeaders = (token) => {
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

const request = async (path, { method = 'GET', body, token } = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: buildHeaders(token),
    body: body ? JSON.stringify(body) : undefined
  });

  if (response.status === 401 && typeof unauthorizedHandler === 'function') {
    unauthorizedHandler();
  }

  if (!response.ok) {
    let message = 'Une erreur est survenue.';
    try {
      const errorBody = await response.json();
      message = errorBody?.detail || errorBody?.message || message;
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};

// Login OAuth2: le backend attend form-urlencoded avec username (email) + password
const loginRequest = async (email, password) => {
  const body = new URLSearchParams({ username: email, password });
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString()
  });
  if (response.status === 401 && typeof unauthorizedHandler === 'function') {
    unauthorizedHandler();
  }
  if (!response.ok) {
    let message = 'Email ou mot de passe invalide';
    try {
      const errorBody = await response.json();
      message = errorBody?.detail || errorBody?.message || message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }
  return response.json();
};

export const authAPI = {
  register: (payload) => request('/api/auth/register', { method: 'POST', body: payload }),
  login: ({ email, password }) => loginRequest(email, password),
  me: (token) => request('/api/auth/me', { token }),
  logout: (token) => request('/api/auth/logout', { method: 'POST', token })
};

export const designsAPI = {
  list: ({ filter = 'all', category = '', page = 1, limit = 12 } = {}) => {
    const params = new URLSearchParams();
    if (filter) params.set('filter', filter);
    if (category) params.set('category', category);
    params.set('page', String(page));
    params.set('limit', String(limit));
    return request(`/api/designs?${params.toString()}`).then((data) => {
      if (Array.isArray(data)) return { items: data, total: data.length, page: 1, limit: data.length, total_pages: 1 };
      if (data?.items != null) return { items: data.items, total: data.total ?? data.items.length, page: data.page ?? 1, limit: data.limit ?? limit, total_pages: data.total_pages ?? 1 };
      return { items: [], total: 0, page: 1, limit, total_pages: 1 };
    });
  },
  getById: (id) => request(`/api/designs/${id}`),
  create: (payload, token) => request('/api/designs', { method: 'POST', body: payload, token }),
  update: (id, payload, token) =>
    request(`/api/designs/${id}`, { method: 'PUT', body: payload, token }),
  remove: (id, token) => request(`/api/designs/${id}`, { method: 'DELETE', token }),
  download: (id) => request(`/api/designs/${id}/download`, { method: 'POST' }),
  /** Vérifie l'accès au téléchargement (pour design premium). Retourne { allowed, status } ; si status === 402, paiement requis. */
  checkDownloadAccess: (id, token) =>
    fetch(`${API_BASE_URL}/api/designs/${id}/download`, {
      method: 'POST',
      headers: buildHeaders(token)
    }).then(async (res) => {
      if (res.status === 401 && typeof unauthorizedHandler === 'function') unauthorizedHandler();
      let data = null;
      try {
        const text = await res.text();
        if (text) data = JSON.parse(text);
      } catch {
        // 402 ou autre peut ne pas être du JSON
      }
      const allowed = res.ok && res.status !== 402;
      return { allowed, status: res.status, data };
    })
};

export const categoriesAPI = {
  list: () => request('/api/categories')
};

export const filtersAPI = {
  list: () => request('/api/filters')
};

export const featuresAPI = {
  /** Lecture seule (public) */
  list: () => request('/api/features'),
  /** Admin CRUD (token requis) */
  listAdmin: (token) => request('/api/admin/features', { token }),
  getById: (id, token) => request(`/api/admin/features/${id}`, { token }),
  create: (payload, token) =>
    request('/api/admin/features', { method: 'POST', body: payload, token }),
  update: (id, payload, token) =>
    request(`/api/admin/features/${id}`, { method: 'PUT', body: payload, token }),
  delete: (id, token) =>
    request(`/api/admin/features/${id}`, { method: 'DELETE', token })
};

export const packsAPI = {
  list: () =>
    request('/api/packs').then((data) => (Array.isArray(data) ? data : [])),
  get: () =>
    request('/api/packs').then((data) => {
      if (Array.isArray(data) && data.length > 0) return data[0];
      if (data && typeof data === 'object' && !Array.isArray(data)) return data;
      return null;
    }),
  getById: (id) => request(`/api/packs/${id}`),
  create: (payload) => {
    const o = payload || {};
    const params = new URLSearchParams();
    params.set('title', String(o.title ?? ''));
    if (o.subtitle != null && o.subtitle !== '') params.set('subtitle', String(o.subtitle));
    if (o.delivery != null && o.delivery !== '') params.set('delivery', String(o.delivery));
    if (o.price != null && o.price !== '') params.set('price', String(o.price));
    if (o.cta_label != null && o.cta_label !== '') params.set('cta_label', String(o.cta_label));
    if (o.cta_to != null && o.cta_to !== '') params.set('cta_to', String(o.cta_to));
    if (o.badges != null) {
      const b = o.badges;
      params.set('badges', Array.isArray(b) ? JSON.stringify(b) : String(b));
    }
    return fetch(`${API_BASE_URL}/api/packs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    }).then(async (res) => {
      if (res.status === 401 && typeof unauthorizedHandler === 'function') unauthorizedHandler();
      if (!res.ok) {
        let msg = 'Erreur création pack';
        try {
          const err = await res.json();
          msg = err?.detail || err?.message || msg;
        } catch { /* ignore */ }
        throw new Error(msg);
      }
      return res.json();
    });
  },
  update: (id, payload) =>
    request(`/api/packs/${id}`, { method: 'PUT', body: payload }),
  delete: (id) =>
    fetch(`${API_BASE_URL}/api/packs/${id}`, { method: 'DELETE' }).then(async (res) => {
      if (res.status === 401 && typeof unauthorizedHandler === 'function') unauthorizedHandler();
      if (res.status === 204) return;
      if (!res.ok) {
        let msg = 'Erreur suppression';
        try {
          const err = await res.json();
          msg = err?.detail || err?.message || msg;
        } catch { /* ignore */ }
        throw new Error(msg);
      }
    })
};

export const ordersAPI = {
  list: (token, { status, is_done, skip = 0, limit = 100 } = {}) => {
    const params = new URLSearchParams();
    if (status != null) params.set('status', String(status));
    if (is_done != null) params.set('is_done', String(is_done));
    params.set('skip', String(skip));
    params.set('limit', String(limit));
    return request(`/api/orders?${params.toString()}`, { token });
  },
  getById: (id, token) => request(`/api/orders/${id}`, { token }),
  create: (payload, token) =>
    request('/api/orders', { method: 'POST', body: payload, token }),
  update: (id, payload, token) =>
    request(`/api/orders/${id}`, { method: 'PUT', body: payload, token }),
  setDone: (id, isDone, token) =>
    request(`/api/orders/${id}/done?is_done=${isDone}`, { method: 'PATCH', token }),
  delete: (id, token) =>
    fetch(`${API_BASE_URL}/api/orders/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }).then(async (res) => {
      if (res.status === 401 && typeof unauthorizedHandler === 'function') unauthorizedHandler();
      if (res.status === 204) return;
      if (!res.ok) {
        let msg = 'Erreur suppression';
        try {
          const err = await res.json();
          msg = err?.detail || err?.message || msg;
        } catch { /* ignore */ }
        throw new Error(msg);
      }
    })
};

/** Utilisateurs (admin). Toutes les méthodes exigent un token. */
export const usersAPI = {
  list: (token) => request('/api/users', { token }),
  getById: (id, token) => request(`/api/users/${id}`, { token }),
  update: (id, payload, token) =>
    request(`/api/users/${id}`, { method: 'PUT', body: payload, token }),
  delete: (id, token) =>
    fetch(`${API_BASE_URL}/api/users/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }).then(async (res) => {
      if (res.status === 401 && typeof unauthorizedHandler === 'function') unauthorizedHandler();
      if (res.status === 204) return;
      if (!res.ok) {
        let msg = 'Erreur suppression';
        try {
          const err = await res.json();
          msg = err?.detail || err?.message || msg;
        } catch { /* ignore */ }
        throw new Error(msg);
      }
    })
};

/** Commandes pack. GET /api/pack-orders : client = ses commandes, admin = toutes (+ ?user_id=, ?is_done= pour filtrer). */
export const packOrdersAPI = {
  list: (token, { pack_id, user_id, is_done, skip = 0, limit = 100 } = {}) => {
    const params = new URLSearchParams();
    if (pack_id != null) params.set('pack_id', String(pack_id));
    if (user_id != null) params.set('user_id', String(user_id));
    if (is_done === true || is_done === 'true') params.set('is_done', 'true');
    if (is_done === false || is_done === 'false') params.set('is_done', 'false');
    params.set('skip', String(skip));
    params.set('limit', String(limit));
    return request(`/api/pack-orders?${params.toString()}`, { token });
  },
  getById: (id, token) => request(`/api/pack-orders/${id}`, { token }),
  create: (body, token) =>
    request('/api/pack-orders', { method: 'POST', body, token }),
  /** POST /api/pack-orders en multipart (pour envoyer une photo). formData doit contenir: pack_id, customer_name, customer_email, customer_phone, customer_address, items (chaîne JSON), notes, description, quantity, et éventuellement photo. */
  createWithFormData: (formData, token) =>
    fetch(`${API_BASE_URL}/api/pack-orders`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData
    }).then(async (res) => {
      if (res.status === 401 && typeof unauthorizedHandler === 'function') unauthorizedHandler();
      if (!res.ok) {
        let msg = 'Erreur lors de la création de la commande pack';
        try {
          const err = await res.json();
          msg = err?.detail || err?.message || msg;
        } catch { /* ignore */ }
        throw new Error(msg);
      }
      return res.json();
    }),
  update: (id, body, token) =>
    request(`/api/pack-orders/${id}`, { method: 'PUT', body, token }),
  delete: (id, token) =>
    request(`/api/pack-orders/${id}`, { method: 'DELETE', token })
};

/** Téléchargements (admin). GET /api/downloads avec token. */
export const downloadsAPI = {
  list: (token, { skip = 0, limit = 200 } = {}) => {
    const params = new URLSearchParams();
    params.set('skip', String(skip));
    params.set('limit', String(limit));
    return request(`/api/downloads?${params.toString()}`, { token }).then((data) => {
      if (Array.isArray(data)) return data;
      return data?.items ?? data?.downloads ?? [];
    });
  }
};

const getCartToken = () =>
  typeof window === 'undefined'
    ? ''
    : localStorage.getItem('access_token') ||
      localStorage.getItem('token') ||
      localStorage.getItem('accessToken') ||
      sessionStorage.getItem('access_token') ||
      sessionStorage.getItem('token') ||
      sessionStorage.getItem('accessToken') ||
      '';

/** Paiements PayTech. Auth requise (Bearer token). */
export const paymentsAPI = {
  create: (payload, token) =>
    request('/api/payments/create', { method: 'POST', body: payload, token }),
  getById: (paymentId, token) =>
    request(`/api/payments/${paymentId}`, { token })
};

/** Créer une commande à partir du panier (si le backend expose cet endpoint). Sinon, utilise ordersAPI.create. */
export const cartAPI = {
  get: () => request('/api/cart', { token: getCartToken() }),
  addItem: (body) =>
    request('/api/cart/items', { method: 'POST', body, token: getCartToken() }),
  updateItem: (itemId, quantity) =>
    request(`/api/cart/items/${itemId}`, {
      method: 'PATCH',
      body: { quantity },
      token: getCartToken()
    }),
  removeItem: (itemId) =>
    request(`/api/cart/items/${itemId}`, { method: 'DELETE', token: getCartToken() }),
  clear: () => request('/api/cart', { method: 'DELETE', token: getCartToken() }),
  /** Créer une commande à partir du panier. Retourne { order_id, ... }. Si le backend n'expose pas /api/cart/checkout, adapter. */
  checkout: (token) =>
    request('/api/cart/checkout', { method: 'POST', token })
};
