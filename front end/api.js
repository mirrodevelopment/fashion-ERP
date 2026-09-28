/**
 * HAULO BOUTIQUE ERP — Shared API Client
 * api.js — All frontend modules import this to talk to the backend
 *
 * Usage:
 *   import api from '../api.js';  (or relative path)
 *   const customers = await api.customers.list({ search: 'Client', page: 0 });
 */

const getApiBase = () => {
  if (typeof window !== 'undefined' && window.location) {
    const p = window.location.port;
    if (p === '8080' || p === '' || p === '80' || p === '443') {
      return `${window.location.origin}/api/v1`;
    }
  }
  return 'http://localhost:8080/api/v1';
};

// ─── Auth Token Management ────────────────────────────────────
const Auth = {
  getToken: () => sessionStorage.getItem('erp_token') || localStorage.getItem('erp_token'),
  setToken: (token, remember = false) => {
    if (remember) { localStorage.setItem('erp_token', token); }
    else          { sessionStorage.setItem('erp_token', token); }
  },
  setUser: (user, remember = false) => {
    const s = JSON.stringify(user);
    sessionStorage.setItem('erp_user', s);
    if (remember || localStorage.getItem('erp_token')) {
      localStorage.setItem('erp_user', s);
    }
  },
  getUser: () => {
    const u = sessionStorage.getItem('erp_user') || localStorage.getItem('erp_user');
    return u ? JSON.parse(u) : null;
  },
  clear: () => {
    sessionStorage.removeItem('erp_token');
    sessionStorage.removeItem('erp_user');
    localStorage.removeItem('erp_token');
    localStorage.removeItem('erp_user');
  },
  isLoggedIn: () => {
    const t = Auth.getToken();
    if (!t) return false;
    try {
      const parts = t.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        if (payload.exp && (payload.exp * 1000) <= Date.now()) {
          Auth.clear();
          return false;
        }
      }
    } catch (_) {
      Auth.clear();
      return false;
    }
    return true;
  },
  requireLogin: () => {
    if (!Auth.isLoggedIn()) {
      window.location.href = '/front end/login/login.html';
      return false;
    }
    return true;
  }
};

// ─── Core fetch wrapper ────────────────────────────────────────
async function request(method, path, body = null, params = {}) {
  const base = getApiBase();
  const url = new URL(base + path);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== null && v !== undefined && v !== '') url.searchParams.set(k, v);
  });

  const headers = { 'Content-Type': 'application/json' };
  let token = Auth.getToken();
  if (token) {
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        if (payload.exp && (payload.exp * 1000) <= Date.now()) {
          Auth.clear();
          token = null;
        }
      } else {
        Auth.clear();
        token = null;
      }
    } catch (_) {
      Auth.clear();
      token = null;
    }
  }

  if (token) headers['Authorization'] = 'Bearer ' + token;

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  let res;
  try {
    res = await fetch(url.toString(), options);
  } catch (netErr) {
    if (!base.startsWith('http://localhost:8080')) {
      const fallbackUrl = new URL('http://localhost:8080/api/v1' + path);
      Object.entries(params).forEach(([k, v]) => {
        if (v !== null && v !== undefined && v !== '') fallbackUrl.searchParams.set(k, v);
      });
      res = await fetch(fallbackUrl.toString(), options);
    } else {
      throw netErr;
    }
  }

  // If unauthorized or forbidden, clear token and redirect to login
  if ((res.status === 401 || res.status === 403) && !path.startsWith('/auth/')) {
    Auth.clear();
    if (typeof window !== 'undefined' && window.location && !window.location.pathname.includes('login.html')) {
      const isFrontEnd = window.location.pathname.includes('/front end/');
      const loginUrl = isFrontEnd
        ? window.location.pathname.replace(/\/front end\/.*$/, '/front end/login/login.html')
        : '/front end/login/login.html';
      window.location.href = loginUrl;
    }
    return null;
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }

  if (res.status === 204) return null;
  return res.json();
}

const get    = (path, params = {})       => request('GET',    path, null, params);
const post   = (path, body = {})         => request('POST',   path, body);
const put    = (path, body = {})         => request('PUT',    path, body);
const patch  = (path, body = {})         => request('PATCH',  path, body);
const del    = (path)                    => request('DELETE', path);

/**
 * Uploads a file using multipart/form-data. Bypasses the JSON request() helper.
 * @param {string} path  - API path (e.g. /orders/{id}/reference-images/1)
 * @param {File}   file  - Browser File object
 * @param {string} field - Form field name (default: 'file')
 */
async function uploadFile(path, file, field = 'file') {
  const base = getApiBase();
  let token = Auth.getToken();
  const headers = {};
  if (token) headers['Authorization'] = 'Bearer ' + token;
  const formData = new FormData();
  formData.append(field, file);
  const res = await fetch(base + path, { method: 'POST', headers, body: formData });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

// ─── API Namespaces ────────────────────────────────────────────
function unwrapList(res) {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.content)) return res.content;
  return [];
}

const api = {
  auth: {
    login: (username, password) => post('/auth/login', { username, password }),
  },

  dashboard: {
    kpis: () => get('/dashboard/kpis'),
  },

  customers: {
    list: async (params = {}) => unwrapList(await get('/customers', params)),
    page: (params = {}) => get('/customers', params),
    get: (mobile) => get(`/customers/${encodeURIComponent(mobile)}`),
    getByMobile: (mobile) => get(`/customers/${encodeURIComponent(mobile)}`),
    getByCode: (mobile) => get(`/customers/${encodeURIComponent(mobile)}`),
    create: (data) => post('/customers', data),
    update: (mobile, data) => put(`/customers/${encodeURIComponent(mobile)}`, data),
    uploadAvatar: (mobile, file) => uploadFile(`/customers/${encodeURIComponent(mobile)}/avatar`, file),
    delete: (mobile) => del(`/customers/${encodeURIComponent(mobile)}`),
    measurements: {
      list: (mobile) => get(`/customers/${encodeURIComponent(mobile)}/measurements`),
      getByGarment: (mobile, garment) => get(`/customers/${encodeURIComponent(mobile)}/measurements/${encodeURIComponent(garment)}`),
      save: (mobile, data) => post(`/customers/${encodeURIComponent(mobile)}/measurements`, data),
    },
    bodyMeasurements: {
      list: (mobile) => get(`/customers/${encodeURIComponent(mobile)}/body-measurements`),
      get: (mobile, garment) => garment ? get(`/customers/${encodeURIComponent(mobile)}/body-measurements/${encodeURIComponent(garment)}`) : get(`/customers/${encodeURIComponent(mobile)}/body-measurements`),
      getComparison: (mobile, garment) => get(`/customers/${encodeURIComponent(mobile)}/body-measurements/${encodeURIComponent(garment)}`),
      save: (mobile, data) => post(`/customers/${encodeURIComponent(mobile)}/body-measurements`, data),
      history: (mobile, garment) => get(`/customers/${encodeURIComponent(mobile)}/body-measurements/${encodeURIComponent(garment)}/history`),
    },
    notes: {
      list: (mobile) => get(`/customers/${encodeURIComponent(mobile)}/notes`),
      create: (mobile, data) => post(`/customers/${encodeURIComponent(mobile)}/notes`, data),
      delete: (mobile, noteId) => del(`/customers/${encodeURIComponent(mobile)}/notes/${encodeURIComponent(noteId)}`)
    }
  },

  orders: {
    list: async (params = {}) => unwrapList(await get('/orders', params)),
    page: (params = {}) => get('/orders', params),
    get: (id) => get(`/orders/${id}`),
    create: (data) => post('/orders', data),
    update: (id, data) => put(`/orders/${id}`, data),
    addProgress: (id, data) => patch(`/orders/${id}/progress`, data),
    kpis: () => get('/orders/kpis'),
    /**
     * Upload a reference image for a slot (1-5).
     * Stores the file as {orderCode}-ref{slot}.ext on the server.
     * @param {string|UUID} id   - Order UUID
     * @param {number}      slot - 1 to 5
     * @param {File}        file - Browser File object from <input type="file">
     * @returns {Promise<OrderDto.Response>} Updated order with new referenceImages list
     */
    uploadReferenceImage: (id, slot, file) => uploadFile(`/orders/${id}/reference-images/${slot}`, file),
    /**
     * Delete a reference image slot (1-5).
     */
    deleteReferenceImage: (id, slot) => del(`/orders/${id}/reference-images/${slot}`),
  },

  measurements: {
    listByCustomer: (mobile) => get('/measurements', { customerMobile: mobile }),
    get: (id) => get(`/measurements/${id}`),
    create: (data) => post('/measurements', data),
    update: (id, data) => put(`/measurements/${id}`, data),
    delete: (id) => del(`/measurements/${id}`),
    kpis: () => get('/measurements/kpis'),
  },

  inventory: {
    list: async (params = {}) => unwrapList(await get('/inventory', params)),
    page: (params = {}) => get('/inventory', params),
    get: (id) => get(`/inventory/${id}`),
    create: (data) => post('/inventory', data),
    update: (id, data) => put(`/inventory/${id}`, data),
    adjust: (id, quantity, reason, movedBy) =>
      patch(`/inventory/${id}/adjust`, { quantity, reason, movedBy }),
    delete: (id) => del(`/inventory/${id}`),
    kpis: () => get('/inventory/kpis'),
    /** Paginated list of all stock movements across all items */
    allMovements: (params = {}) => get('/inventory/movements', params),
    /** All movements for a specific inventory item (by UUID) */
    movements: (itemId) => get(`/inventory/${itemId}/movements`),
  },

  payments: {
    list: async (params = {}) => unwrapList(await get('/payments', params)),
    page: (params = {}) => get('/payments', params),
    get: (id) => get(`/payments/${id}`),
    getByOrderId: (orderId) => get(`/payments/order/${orderId}`),
    create: (data) => post('/payments', data),
    recordTransaction: (id, data) => post(`/payments/${id}/transactions`, data),
    backfill: () => post('/payments/backfill', {}),
    kpis: () => get('/payments/kpis'),
  },

  // NOTE: collections namespace is defined once below (merged from duplicate at original L265 and L419)

  appointments: {
    list: async (params = {}) => unwrapList(await get('/appointments', params)),
    page: (params = {}) => get('/appointments', params),
    today: async () => {
      const todayList = await get('/appointments/today').catch(() => []);
      if (Array.isArray(todayList) && todayList.length > 0) return todayList;
      return unwrapList(await get('/appointments', { size: 5 }).catch(() => []));
    },
    create: (data) => post('/appointments', data),
    updateStatus: (id, status) => patch(`/appointments/${id}/status?status=${status}`, {}),
    kpis: () => get('/appointments/kpis'),
  },

  employees: {
    list: async (params = {}) => unwrapList(await get('/employees', params)),
    page: (params = {}) => get('/employees', params),
    get: (id) => get(`/employees/${id}`),
    create: (data) => post('/employees', data),
    update: (id, data) => put(`/employees/${id}`, data),
    uploadAvatar: (id, file) => uploadFile(`/employees/${encodeURIComponent(id)}/avatar`, file),
    delete: (id) => del(`/employees/${id}`),
    kpis: () => get('/employees/kpis'),
  },

  enquiries: {
    list: async (params = {}) => unwrapList(await get('/enquiries', params)),
    page: (params = {}) => get('/enquiries', params),
    get: (id) => get(`/enquiries/${id}`),
    create: (data) => post('/enquiries', data),
    update: (id, data) => put(`/enquiries/${id}`, data),
    delete: (id) => del(`/enquiries/${id}`),
    kpis: () => get('/enquiries/kpis'),
  },

  designs: {
    list: async (params = {}) => unwrapList(await get('/designs', params)),
    page: (params = {}) => get('/designs', params),
    get: (id) => get(`/designs/${id}`),
    create: (data) => post('/designs', data),
    update: (id, data) => put(`/designs/${id}`, data),
    delete: (id) => del(`/designs/${id}`),
    kpis: () => get('/designs/kpis'),
  },

  purchases: {
    list: async (params = {}) => unwrapList(await get('/purchases', params)),
    page: (params = {}) => get('/purchases', params),
    get: (id) => get(`/purchases/${id}`),
    create: (data) => post('/purchases', data),
    update: (id, data) => put(`/purchases/${id}`, data),
    delete: (id) => del(`/purchases/${id}`),
    kpis: () => get('/purchases/kpis'),
  },

  suppliers: {
    list: async (params = {}) => unwrapList(await get('/suppliers', params)),
    page: (params = {}) => get('/suppliers', params),
    get: (id) => get(`/suppliers/${id}`),
    create: (data) => post('/suppliers', data),
    update: (id, data) => put(`/suppliers/${id}`, data),
  },

  production: {
    stages: (params = {}) => get('/production/stages', params),
    getByOrder: (orderId) => get(`/production/order/${orderId}`),
    updateStatus: (id, status) => patch(`/production/stages/${id}/status?status=${status}`, {}),
    assignEmployee: (stageId, employeeId) => {
      const qs = employeeId ? `?employeeId=${encodeURIComponent(employeeId)}` : '';
      return patch(`/production/stages/${stageId}/assign${qs}`, {});
    },
    transition: (orderId, targetStage, employeeId, notes) => {
      let qs = `orderId=${encodeURIComponent(orderId)}&targetStage=${encodeURIComponent(targetStage)}`;
      if (employeeId) qs += `&employeeId=${encodeURIComponent(employeeId)}`;
      if (notes) qs += `&notes=${encodeURIComponent(notes)}`;
      return post(`/production/transition?${qs}`, {});
    },
    getNextAfterQc: () => get('/production/qc/next-stage'),
    kpis: () => get('/production/kpis'),

    /** Stage Definitions — workflow blueprint CRUD */
    stageDefinitions: {
      /** List all stage definitions. Pass { activeOnly: true } to get only active ones. */
      list: (params = {}) => get('/production/stage-definitions', params),
      /** Get a single stage definition by ID */
      get: (id) => get(`/production/stage-definitions/${id}`),
      /** Create a new stage definition. Required: displayName */
      create: (data) => post('/production/stage-definitions', data),
      /** Update an existing stage definition */
      update: (id, data) => put(`/production/stage-definitions/${id}`, data),
      /** Toggle active/inactive (soft-delete or restore) */
      toggle: (id) => patch(`/production/stage-definitions/${id}/toggle`, {}),
      /** Hard-delete (only allowed if no production_stages rows reference this key) */
      delete: (id) => del(`/production/stage-definitions/${id}`),
      /** Reorder — pass ordered array of UUIDs */
      reorder: (ids) => patch('/production/stage-definitions/reorder', { ids }),
      /** Pin an employee to a stage definition */
      assignEmployee: (stageId, empId) => post(`/production/stage-definitions/${stageId}/employees/${empId}`, {}),
      /** Remove an employee pin from a stage definition */
      removeEmployee: (stageId, empId) => del(`/production/stage-definitions/${stageId}/employees/${empId}`),
      /** Upload artwork/photo for a stage definition */
      uploadImage: (id, file) => uploadFile(`/production/stage-definitions/${id}/image`, file),
      // presets() endpoint was removed from backend — do not call it
    },
  },


  qc: {
    checklists: (params = {}) => get('/qc/checklists', params),
    updateChecklist: (id, result, remarks) => {
      let qs = '';
      if (result) qs += `result=${encodeURIComponent(result)}&`;
      if (remarks) qs += `remarks=${encodeURIComponent(remarks)}&`;
      return patch(`/qc/checklists/${id}?${qs}`, {});
    },
    getNextAfterQc: () => get('/production/qc/next-stage'),
    pass: (orderId, notes) => {
      let qs = `orderId=${encodeURIComponent(orderId)}`;
      if (notes) qs += `&notes=${encodeURIComponent(notes)}`;
      return post(`/qc/pass?${qs}`, {});
    },
    rework: (orderId, targetStage, assigneeId, notes) => {
      let qs = `orderId=${encodeURIComponent(orderId)}&targetStage=${encodeURIComponent(targetStage)}`;
      if (assigneeId) qs += `&assigneeId=${encodeURIComponent(assigneeId)}`;
      if (notes) qs += `&notes=${encodeURIComponent(notes)}`;
      return post(`/qc/rework?${qs}`, {});
    },
    kpis: () => get('/qc/kpis'),
  },

  trials: {
    list: async (params = {}) => unwrapList(await get('/trials', params)),
    page: (params = {}) => get('/trials', params),
    get: (id) => get(`/trials/${id}`),
    create: (data) => post('/trials', data),
    createFromOrder: (orderId) => post(`/trials/from-order/${orderId}`, {}),
    update: (id, data) => put(`/trials/${id}`, data),
    updateFitStatus: (id, fitStatus) => patch(`/trials/${id}/fit-status?fitStatus=${encodeURIComponent(fitStatus)}`, {}),
    toggleAlteration: (trialId, altId, completed) => patch(`/trials/${trialId}/alterations/${altId}?completed=${completed != null ? completed : ''}`, {}),
    completeAndAdvance: (id) => post(`/trials/${id}/complete-and-advance`, {}),
    scheduleRetrial: (id, data) => post(`/trials/${id}/schedule-retrial`, data || {}),
    ordersForTrial: (params = {}) => get('/trials/orders-for-trial', params),
    kpis: () => get('/trials/kpis'),
  },

  collections: {
    /** Get paginated page of collections (Spring Page object) */
    page: (params = {}) => get('/collections', params),
    /** Get all collections as a flat array */
    list: async (params = {}) => {
      const res = await get('/collections', params);
      if (res && Array.isArray(res.content)) return res.content;
      if (Array.isArray(res)) return res;
      return [];
    },
    /** KPIs calculated from live database records */
    kpis: async () => {
      const res = await get('/collections/kpis');
      return res || {
        totalCollections: 0,
        activeCollections: 0,
        currentSeasonCount: 0,
        currentSeasonName: '—',
        totalGarments: 0,
        totalDesigns: 0,
        draftCollections: 0
      };
    },
    getById:    (id)       => get(`/collections/${id}`),
    getByName:  (name)     => get(`/collections/by-name/${encodeURIComponent(name)}`),
    create:     (data)     => post('/collections', data),
    update:     (id, data) => put(`/collections/${id}`, data),
    /** Toggle archive/unarchive */
    archive:       (id) => patch(`/collections/${id}/archive`, {}),
    toggleArchive: (id) => patch(`/collections/${id}/archive`, {}),
    delete:        (id) => del(`/collections/${id}`),
  },

  garments: {
    /**
     * Get paginated garments list with filters
     */
    list: async (params = {}) => {
      const res = await get('/garments', params);
      return res || { content: [], totalElements: 0, totalPages: 0, number: 0 };
    },

    /**
     * Get Garment KPIs & stage counts
     */
    kpis: async () => {
      const res = await get('/garments/kpis');
      // BUG-P0-04 FIX: No fabricated fallback — return zeroed defaults so UI shows error state, not fake data
      return res || {
        totalGarments: 0,
        totalGarmentsDelta: null,
        inProduction: 0,
        inProductionDelta: null,
        inTrial: 0,
        inTrialDelta: null,
        awaitingQc: 0,
        awaitingQcDelta: null,
        ready: 0,
        readyDelta: null,
        delivered: 0,
        deliveredDelta: null,
        allCount: 0,
        designingCount: 0,
        inProductionCount: 0,
        trialCount: 0,
        qcCount: 0,
        readyCount: 0,
        deliveredCount: 0,
        onHoldCount: 0
      };
    },

    /**
     * Get Garment details by ID
     */
    getById: async (id) => {
      return get(`/garments/${id}`);
    },

    /**
     * Create new Garment
     */
    create: async (data) => {
      return post('/garments', data);
    },

    /**
     * Update Garment
     */
    update: async (id, data) => {
      return put(`/garments/${id}`, data);
    },

    /**
     * Update Garment stage
     */
    updateStage: async (id, data) => {
      return patch(`/garments/${id}/stage`, data);
    }
  }
};

if (typeof window !== 'undefined') {
  window.api = api;
  window.Auth = Auth;
}

export { Auth };
export default api;
