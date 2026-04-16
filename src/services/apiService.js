import axios from 'axios';
import { config } from '../config/env.config';

const API_BASE_URL = config.apiBaseUrl;

// Axios instance with interceptors
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = window.sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Handle 401 responses globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isLoginRequest = originalRequest?.url?.includes('/auth/login');
    const isRefreshRequest = originalRequest?.url?.includes('/auth/refresh');

    if (error.response?.status === 401 && !isLoginRequest && !isRefreshRequest && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await api.post('/auth/refresh');
        const newToken = data.token;
        window.sessionStorage.setItem('token', newToken);
        api.defaults.headers.common['Authorization'] = 'Bearer ' + newToken;
        originalRequest.headers['Authorization'] = 'Bearer ' + newToken;
        
        processQueue(null, newToken);
        isRefreshing = false;
        
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        isRefreshing = false;
        window.sessionStorage.removeItem('token');
        window.location.href = '/auth/login';
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

// ─── Normalizers (snake_case backend → camelCase frontend) ──

const normalizeMaterial = (m) => ({
  id: m.id,
  name: m.name,
  sku: m.sku || '',
  location: m.location || '',
  categoryId: m.category_id,
  categoryName: m.category?.name || '',
  zoneId: m.zone_id || null,
  zoneName: m.zone?.name || null,
  unit: m.unit,
  referencePrice: m.reference_price ?? 0,
  minStock: m.min_stock,
  currentStock: m.current_stock,
  active: m.active,
  imageUrl: m.image_url || null,
  createdAt: m.created_at,
  updatedAt: m.updated_at,
});

const normalizeCategory = (c) => ({
  id: c.id,
  name: c.name,
  description: c.description || '',
  createdAt: c.created_at,
  materialCount: c._count?.materials ?? 0,
});

const normalizeMovement = (m) => ({
  id: m.id,
  materialId: m.material_id,
  materialName: m.material?.name || '',
  type: m.type,
  quantity: m.quantity,
  unitCost: m.unit_cost ?? 0,
  totalCost: m.total_cost ?? 0,
  supplier: m.supplier,
  invoiceNumber: m.invoice_number,
  destination: m.destination,
  reason: m.reason,
  notes: m.notes,
  createdBy: m.user?.name || '',
  movementDate: m.movement_date || m.created_at,
});

const normalizeAlert = (m) => ({
  id: m.id,
  name: m.name,
  categoryName: m.category?.name || '',
  unit: m.unit,
  currentStock: m.current_stock,
  minStock: m.min_stock,
  deficit: m.deficit ?? (m.min_stock - m.current_stock),
});

const normalizeUnit = (u) => ({
  id: u.id,
  matricula: u.plate || '',
  marca: u.brand || '',
  modelo: u.model || '',
  year: u.year || '',
  type: u.type || '',
  axesNumber: u.axles || '',
  vin: u.vin || '',
  fuelEfficiency: u.fuel_efficiency_km_l || '',
  insuranceExpiration: u.insurance_expiry || '',
  lastMaintenance: u.last_maintenance_date || '',
  notes: u.notes || '',
  status: u.status || 'disponible',
  active: u.active ?? true,
  createdAt: u.created_at || u.createdAt,
});

// Convert camelCase form values to snake_case for backend
const toMaterialPayload = (values) => ({
  name: values.name,
  sku: values.sku || undefined,
  location: values.location || undefined,
  zone_id: values.zoneId || null,
  category_id: values.categoryId,
  unit: values.unit,
  reference_price: Number(values.referencePrice),
  min_stock: Number(values.minStock),
  image_url: values.imageUrl || undefined,
});

const toEntryPayload = (values) => ({
  material_id: values.materialId,
  quantity: Number(values.quantity),
  unit_cost: values.unitCost ? Number(values.unitCost) : undefined,
  supplier: values.supplier || undefined,
  invoice_number: values.invoiceNumber || undefined,
  notes: values.notes || undefined,
});

const toExitPayload = (values) => ({
  material_id: values.materialId,
  quantity: Number(values.quantity),
  destination: values.destination || undefined,
  reason: values.reason || undefined,
  notes: values.notes || undefined,
});

const toUnitPayload = (values) => ({
  plate: values.matricula,
  brand: values.marca || undefined,
  model: values.modelo || undefined,
  year: values.year ? Number(values.year) : undefined,
  type: values.type || undefined,
  axles: values.axesNumber ? Number(values.axesNumber) : undefined,
  vin: values.vin || undefined,
  fuel_efficiency_km_l: values.fuelEfficiency ? Number(values.fuelEfficiency) : undefined,
  insurance_expiry: values.insuranceExpiration || undefined,
  last_maintenance_date: values.lastMaintenance || undefined,
  notes: values.notes || undefined,
  status: values.status || undefined,
});

// ─── Auth ──────────────────────────────────────────────

export const authApi = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }).then((r) => r.data),

  getMe: () =>
    api.get('/auth/me').then((r) => r.data),

  changePassword: (currentPassword, newPassword) =>
    api.patch('/auth/change-password', { currentPassword, newPassword }).then((r) => r.data),

  forgotPassword: (email) =>
    api.post('/auth/forgot-password', { email }).then((r) => r.data),

  resetPassword: (token, newPassword) =>
    api.post('/auth/reset-password', { token, newPassword }).then((r) => r.data),

  logout: () =>
    api.post('/auth/logout').then((r) => r.data),
};

// ─── Materials ─────────────────────────────────────────

export const materialsApi = {
  list: (params = {}) =>
    api.get('/materials', { params }).then((r) => ({
      items: r.data.items.map(normalizeMaterial),
      count: r.data.count,
      page: r.data.page,
      limit: r.data.limit,
    })),

  get: (id) =>
    api.get(`/materials/${id}`).then((r) => normalizeMaterial(r.data)),

  create: (values) =>
    api.post('/materials', toMaterialPayload(values)).then((r) => normalizeMaterial(r.data)),

  update: (id, values) =>
    api.put(`/materials/${id}`, toMaterialPayload(values)).then((r) => normalizeMaterial(r.data)),

  toggleActive: (id, active) =>
    api.put(`/materials/${id}`, { active }).then((r) => normalizeMaterial(r.data)),

  setZone: (id, zoneId) =>
    api.put(`/materials/${id}`, { zone_id: zoneId || null }).then((r) => normalizeMaterial(r.data)),

  delete: (id) =>
    api.delete(`/materials/${id}`).then((r) => r.data),
};

// ─── Units ─────────────────────────────────────────────

export const unitsApi = {
  list: (params = {}) =>
    api.get('/units', { params }).then((r) => ({
      items: r.data.items ? r.data.items.map(normalizeUnit) : r.data.map(normalizeUnit),
      count: r.data.count,
      page: r.data.page,
      limit: r.data.limit,
    })),

  get: (id) =>
    api.get(`/units/${id}`).then((r) => normalizeUnit(r.data)),

  create: (values) =>
    api.post('/units', toUnitPayload(values)).then((r) => normalizeUnit(r.data)),

  update: (id, values) =>
    api.put(`/units/${id}`, toUnitPayload(values)).then((r) => normalizeUnit(r.data)),

  updateStatus: (id, status) =>
    api.patch(`/units/${id}/status`, { status }).then((r) => normalizeUnit(r.data)),

  getAlertsInsurance: () =>
    api.get('/units/alerts/insurance').then((r) => r.data.map(normalizeUnit)),
};

// ─── Categories ────────────────────────────────────────

export const categoriesApi = {
  list: () =>
    api.get('/materials/categories').then((r) => r.data.map(normalizeCategory)),

  create: (data) =>
    api.post('/materials/categories', data).then((r) => normalizeCategory(r.data)),

  update: (id, data) =>
    api.put(`/materials/categories/${id}`, data).then((r) => normalizeCategory(r.data)),

  delete: (id) =>
    api.delete(`/materials/categories/${id}`).then((r) => r.data),
};

// ─── Dashboard ─────────────────────────────────────────

export const dashboardApi = {
  getStats: () =>
    api.get('/dashboard/stats').then((r) => r.data),
};

// ─── Inventory ─────────────────────────────────────────

export const inventoryApi = {
  registerEntry: (values) =>
    api.post('/inventory/entry', toEntryPayload(values)).then((r) => normalizeMovement(r.data)),

  registerExit: (values) =>
    api.post('/inventory/exit', toExitPayload(values)).then((r) => normalizeMovement(r.data)),

  listMovements: (params = {}) =>
    api.get('/inventory/movements', { params }).then((r) => ({
      items: r.data.items.map(normalizeMovement),
      count: r.data.count,
      page: r.data.page,
      limit: r.data.limit,
    })),

  getStock: (params = {}) =>
    api.get('/inventory/stock', { params }).then((r) => r.data.map(normalizeMaterial)),

  getAlerts: () =>
    api.get('/inventory/alerts').then((r) => r.data.map(normalizeAlert)),
};

// ─── Users ─────────────────────────────────────────────

const normalizeUser = (u) => ({
  id: u.id,
  email: u.email,
  name: u.name,
  role: u.role,
  active: u.active,
  createdAt: u.created_at,
});

export const usersApi = {
  list: () =>
    api.get('/users').then((r) => r.data.map(normalizeUser)),

  create: (data) =>
    api.post('/users', data).then((r) => normalizeUser(r.data)),

  update: (id, data) =>
    api.put(`/users/${id}`, data).then((r) => normalizeUser(r.data)),

  setStatus: (id, active) =>
    api.patch(`/users/${id}/status`, { active }).then((r) => normalizeUser(r.data)),
};

// ─── Warehouse ─────────────────────────────────────────

const normalizeZone = (z) => ({
  id: z.id,
  name: z.name,
  description: z.description || '',
  xPct: z.x_pct,
  yPct: z.y_pct,
  wPct: z.w_pct,
  hPct: z.h_pct,
  color: z.color,
  configId: z.config_id,
  materialCount: z._count?.materials ?? 0,
  materials: z.materials?.map((m) => ({
    id: m.id,
    name: m.name,
    sku: m.sku || '',
    currentStock: m.current_stock,
    minStock: m.min_stock,
    unit: m.unit,
  })) || [],
  createdAt: z.created_at,
  updatedAt: z.updated_at,
});

const normalizeConfig = (c) => ({
  id: c.id,
  widthM: c.width_m,
  heightM: c.height_m,
  updatedAt: c.updated_at,
});

const toZonePayload = (values) => ({
  name: values.name,
  description: values.description || undefined,
  x_pct: values.xPct,
  y_pct: values.yPct,
  w_pct: values.wPct,
  h_pct: values.hPct,
  color: values.color,
});

const toConfigPayload = (values) => ({
  width_m: values.widthM,
  height_m: values.heightM,
});

export const warehouseApi = {
  getConfig: () =>
    api.get('/warehouse/config').then((r) => normalizeConfig(r.data)),

  updateConfig: (data) =>
    api.put('/warehouse/config', toConfigPayload(data)).then((r) => normalizeConfig(r.data)),

  getZones: () =>
    api.get('/warehouse/zones').then((r) => r.data.map(normalizeZone)),

  createZone: (data) =>
    api.post('/warehouse/zones', toZonePayload(data)).then((r) => normalizeZone(r.data)),

  updateZone: (id, data) =>
    api.put(`/warehouse/zones/${id}`, toZonePayload(data)).then((r) => normalizeZone(r.data)),

  deleteZone: (id) =>
    api.delete(`/warehouse/zones/${id}`).then((r) => r.data),

  getMap: () =>
    api.get('/warehouse/map').then((r) => ({
      config: normalizeConfig(r.data.config),
      zones: r.data.zones.map(normalizeZone),
    })),
};

// ─── Admin (super_admin only) ───────────────────────────

const normalizeCompany = (c) => ({
  id: c.id,
  name: c.name,
  slug: c.slug,
  active: c.active,
  activeModules: (c.active_modules && c.active_modules.length > 0) ? c.active_modules : ['inventario'],
  subscriptionStatus: c.subscription_status,
  createdAt: c.created_at,
  userCount: c._count?.users ?? 0,
  users: c.users?.map(normalizeUser) ?? undefined,
});

export const adminApi = {
  listCompanies: () =>
    api.get('/admin/companies').then((r) => r.data.map(normalizeCompany)),

  getCompany: (id) =>
    api.get(`/admin/companies/${id}`).then((r) => normalizeCompany(r.data)),

  createCompany: (data) =>
    api.post('/admin/companies', data).then((r) => r.data),

  updateCompany: (id, data) =>
    api.patch(`/admin/companies/${id}`, data).then((r) => normalizeCompany(r.data)),

  listCompanyUsers: (companyId) =>
    api.get(`/admin/companies/${companyId}/users`).then((r) => r.data.map(normalizeUser)),

  createCompanyUser: (companyId, data) =>
    api.post(`/admin/companies/${companyId}/users`, data).then((r) => normalizeUser(r.data)),
};

// ─── Billing ───────────────────────────────────────────

export const billingApi = {
  createCheckoutSession: (modules, returnUrl) =>
    api.post('/billing/create-checkout-session', { modules, returnUrl }).then((r) => r.data),

  createPortalSession: (returnUrl) =>
    api.post('/billing/create-portal-session', { returnUrl }).then((r) => r.data),
};

// ─── Warden ────────────────────────────────────────────
//
// Thin fetch wrappers for every endpoint in
// specs/001-warden-foundations/contracts/warden-api.md, plus a
// `streamMessages()` helper for POST /api/warden/messages that returns an
// async iterator of parsed SSE events defined in warden-sse.md.
//
// The standard axios instance is used for plain JSON endpoints. The
// streaming endpoint bypasses axios entirely because axios in the browser
// does not expose a ReadableStream — we use native `fetch()` so we can
// read tokens as they arrive.

const normalizeWardenConversationListItem = (c) => ({
  id: c.id,
  title: c.title,
  preview: c.preview ?? '',
  updatedAt: c.updatedAt
});

const normalizeWardenMessage = (m) => ({
  id: m.id,
  role: m.role,
  content: m.content,
  createdAt: m.createdAt,
  status: m.status,
  cards: Array.isArray(m.cards) ? m.cards : []
});

const normalizeWardenConversation = (c) => ({
  id: c.id,
  title: c.title,
  createdAt: c.createdAt,
  updatedAt: c.updatedAt,
  messages: Array.isArray(c.messages) ? c.messages.map(normalizeWardenMessage) : []
});

// Parse one SSE frame ("event: X\ndata: Y") into { event, data }. Skips
// keep-alive lines and comments. Returns null if the frame is malformed.
const parseSseFrame = (raw) => {
  const lines = raw.split('\n');
  let eventName = 'message';
  const dataLines = [];
  for (const line of lines) {
    if (!line || line.startsWith(':')) continue;
    if (line.startsWith('event:')) {
      eventName = line.slice(6).trim();
    } else if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).trim());
    }
  }
  if (dataLines.length === 0) return null;
  const dataRaw = dataLines.join('\n');
  try {
    return { event: eventName, data: JSON.parse(dataRaw) };
  } catch {
    return { event: eventName, data: dataRaw };
  }
};

// Stream `POST /api/warden/messages` as parsed SSE events.
//
// Usage:
//   for await (const ev of wardenApi.streamMessages({ text: '...' }, { signal })) {
//     switch (ev.event) { case 'token': ... }
//   }
//
// The caller owns abort via AbortController — passing its `signal` cancels
// the underlying fetch, the backend then finalizes the message as `partial`
// (warden-sse.md). The iterator terminates cleanly on abort or on the
// natural end of the stream.
async function* streamMessagesIterator(body, { signal } = {}) {
  const token = window.sessionStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/warden/messages`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(body),
    signal
  });

  if (!res.ok || !res.body) {
    // Non-SSE error — the server returned a JSON envelope per
    // warden-api.md §Errors. Surface it as a thrown error so the caller
    // can route it through the same error-handling code path.
    let payload;
    try {
      payload = await res.json();
    } catch {
      payload = { error: { code: 'WARDEN_INTERNAL', message: 'Error desconocido.' } };
    }
    const err = new Error(payload?.error?.message ?? 'Error desconocido.');
    err.code = payload?.error?.code ?? 'WARDEN_INTERNAL';
    err.status = res.status;
    throw err;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      // SSE frames are separated by a blank line ("\n\n").
      let boundary = buffer.indexOf('\n\n');
      while (boundary !== -1) {
        const rawFrame = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);
        const frame = parseSseFrame(rawFrame);
        if (frame) yield frame;
        boundary = buffer.indexOf('\n\n');
      }
    }
  } finally {
    try {
      reader.releaseLock();
    } catch {
      // Lock may already be released if the stream errored — safe to ignore.
    }
  }
}

export const wardenApi = {
  listConversations: (params = {}) =>
    api.get('/warden/conversations', { params }).then((r) => ({
      items: (r.data.items ?? []).map(normalizeWardenConversationListItem),
      nextCursor: r.data.nextCursor ?? null
    })),

  getConversation: (id) =>
    api.get(`/warden/conversations/${id}`).then((r) => normalizeWardenConversation(r.data)),

  createConversation: (title) =>
    api
      .post('/warden/conversations', { title })
      .then((r) => normalizeWardenConversation(r.data)),

  deleteConversation: (id) =>
    api.delete(`/warden/conversations/${id}`).then((r) => r.data),

  listTools: () =>
    api.get('/warden/tools').then((r) => ({
      tools: Array.isArray(r.data.tools) ? r.data.tools : []
    })),

  // Returns an async iterator of { event, data } frames. Caller must use
  // `for await` and should provide an AbortController signal for cancel.
  streamMessages: (body, options = {}) => streamMessagesIterator(body, options)
};

// ─── Legacy exports (admin/monitoring — not MVP) ──────

export const fetchTransportData = async () => [];
export const postTransport = async () => [];
export const fetchDestiniesData = async () => [];
export const postDestiny = async () => false;

// ─── Uploads ───────────────────────────────────────────

export const uploadApi = {
  getSignedUrl: (path) =>
    api.get('/upload/url', { params: { path } }).then((r) => r.data.url),
};

export default api;
