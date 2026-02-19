# Ward.io - Contexto para Claude

## Qué es Ward.io
SaaS multitenant para empresas de transporte de carga. El MVP es el **módulo de inventario** (gestión de materiales, entradas/salidas de stock, alertas de stock bajo).

## Tech Stack

### Frontend (/wardApp-main)
- **Next.js 13** con Pages Router (NO App Router)
- **React 18** con JavaScript (no TypeScript)
- **MUI v5** (Material-UI) para UI components
- **ApexCharts** (`react-apexcharts`) para gráficas — usar `dynamic(() => import(...), { ssr: false })` siempre
- **@mui/x-date-pickers v5** + **date-fns v2** para selectores de fecha
- **Formik + Yup** para formularios y validación
- **Axios** para HTTP requests
- **i18next** para internacionalización (español)
- **Heroicons** para iconos (via `@heroicons/react/24/solid`)
- **Emotion** para CSS-in-JS (parte de MUI)

### Backend (/wardApp-backend — al mismo nivel que /wardApp-main)
- **Node.js + Express + TypeScript**
- **Prisma** ORM con **PostgreSQL**
- **JWT** para autenticación
- **Zod** para validación de requests

## Estructura del Frontend

```
src/
├── pages/           # Next.js pages (getLayout pattern)
├── layouts/
│   └── dashboard/
│       ├── layout.js        # Layout principal (collapsed state, sin topnav en desktop)
│       ├── side-nav.js      # Sidebar colapsable + notificaciones + user info
│       ├── side-nav-item.js # Nav item con soporte collapsed (tooltip cuando colapsado)
│       ├── top-nav.js       # Solo visible en mobile (hamburger)
│       └── config.js        # Items de navegación
├── sections/        # Componentes específicos de cada página
├── components/      # Componentes reutilizables
│   └── logo.js      # Usa /assets/logos/ward-logo-white.png
├── contexts/        # AuthContext (React Context + useReducer)
├── hooks/           # useAuth, usePopover, useSelection, etc.
├── services/        # apiService.js (Axios calls)
├── guards/          # AuthGuard (redirect si no autenticado)
├── hocs/            # withAuthGuard HOC
├── theme/           # Configuración de tema MUI
└── utils/           # Helpers (pagination, initials, etc.)
```

## Patrones Clave

### Layout de páginas
```javascript
const Page = () => { /* ... */ };
Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
export default Page;
```

### Auth Guard
Todas las páginas protegidas usan `DashboardLayout` que aplica `withAuthGuard`. Login en `/auth/login`.

### API Service
`src/services/apiService.js` — centralizar llamadas API aquí. Base URL: `http://localhost:3001/api`.
Exports: `authApi`, `materialsApi`, `categoriesApi`, `inventoryApi`, `dashboardApi`.

### Tablas
Patrón común: componente de tabla en `sections/`, recibe `items`, `count`, `onPageChange`, `onRowsPerPageChange`, `page`, `rowsPerPage`. Usa MUI Table + Scrollbar wrapper.

### Modals
MUI Modal con estilo centrado (position absolute, 50%/50%, transform translate).

### Navegación
Definida en `src/layouts/dashboard/config.js` — array de items con title, path, icon.

### ApexCharts en Next.js
**Siempre** usar dynamic import para evitar errores SSR:
```javascript
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });
```
Evitar donut charts con series de ceros — causan errores internos en v3.37.

## Estado Actual

### Páginas implementadas y funcionales
| Ruta | Estado | Descripción |
|------|--------|-------------|
| `/` | ✅ | Saludo + KPIs + health banner + acciones rápidas |
| `/auth/login` | ✅ | Login conectado a API real |
| `/materials` | ✅ | CRUD completo: tabla, búsqueda, filtro, modal crear/editar |
| `/categories` | ✅ | CRUD completo: tabla, búsqueda, modal, confirmación de borrado |
| `/movements` | ✅ | Historial paginado + registrar entrada/salida con modal |
| `/alerts` | ✅ | Lista stock bajo + acción registrar entrada |
| `/reports` | ✅ | Tab movimientos (gráfica + tabla + export CSV) + tab stock por categoría |

### Layout
| Feature | Estado |
|---------|--------|
| Sidebar colapsable (280px ↔ 72px) | ✅ persiste en localStorage |
| Topnav eliminado en desktop | ✅ |
| Topnav minimal en mobile (hamburger) | ✅ |
| Notificaciones reales en sidebar | ✅ fetch desde `/api/inventory/alerts` |
| User info + logout en sidebar | ✅ |

### Pendiente (frontend)
- ❌ **Gestión de usuarios** (`/users`) — CRUD de usuarios, solo admin

### No usar / Ignorar
- `pages/companies.js`, `pages/customers.js` — no son del MVP
- `pages/monitoring/*` — módulo de operaciones, no MVP
- `pages/store.js` — reemplazado por `/` (Inicio)

## API Endpoints del MVP
```
Auth:
  POST /api/auth/login
  GET  /api/auth/me

Materials:
  GET    /api/materials          (params: search, categoryId, active, page, limit)
  GET    /api/materials/:id
  POST   /api/materials
  PUT    /api/materials/:id
  DELETE /api/materials/:id
  GET    /api/materials/categories
  POST   /api/materials/categories
  PUT    /api/materials/categories/:id
  DELETE /api/materials/categories/:id

Inventory:
  POST /api/inventory/entry
  POST /api/inventory/exit
  GET  /api/inventory/movements  (params: type, materialId, page, limit)
  GET  /api/inventory/stock
  GET  /api/inventory/alerts

Dashboard:
  GET /api/dashboard/stats
```

## Convenciones
- Idioma de UI: **Español**
- Idioma de código: **Inglés** (variables, funciones, componentes)
- Comentarios: en inglés
- Commits: en inglés
- Rama principal: **main** (nunca master)
- Credenciales demo: `admin@demo.com` / `demo123`
