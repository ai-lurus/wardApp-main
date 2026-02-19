import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Axios instance with interceptors
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = window.sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses globally (token expired/invalid)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.sessionStorage.removeItem('token');
      window.location.href = '/auth/login';
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

// ─── Auth ──────────────────────────────────────────────

export const authApi = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }).then((r) => r.data),

  getMe: () =>
    api.get('/auth/me').then((r) => r.data),
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

// ─── Legacy exports (admin/monitoring — not MVP) ──────

export const fetchTransportData = async () => [];
export const postTransport = async () => [];
export const fetchDestiniesData = async () => [];
export const postDestiny = async () => false;

export default api;
