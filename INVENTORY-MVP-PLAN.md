# Ward.io - Inventory Module MVP - Plan de Desarrollo

## Analisis del Estado Actual

### Tech Stack existente (mantener)
- **Frontend**: Next.js 13 + React 18 + JavaScript + MUI v5 + Formik/Yup + Axios + i18next
- **Backend**: No existe aun (solo un servidor en localhost:8080 con 2 endpoints de transports/destinies)
- **Auth**: Mock hardcodeado (demo@ward.io / Password123!)
- **Data**: Todo mock/hardcoded, sin base de datos real

### Discrepancia con el PRD
El PRD especifica React+Vite+Tailwind+Zustand+TypeScript. **Recomendacion**: NO reescribir. Mantener Next.js+MUI+JavaScript que ya esta funcionando. Migrar a TS puede hacerse incrementalmente despues del MVP.

### Problemas detectados en el codigo actual
1. **Mock data en todas partes** - store.js tiene 9 items identicos hardcodeados
2. **Componentes admin rotos** - producers.js usa la API de transports, users.js referencia variables undefined
3. **Monitoring desalineado** - columnas de tabla no coinciden con la API
4. **Auth sin backend** - credenciales hardcodeadas en el contexto
5. **apiService.js minimal** - solo 4 funciones (transports + destinies)
6. **Imports no usados** en multiples archivos
7. **Sin tests** configurados

### Lo que SI funciona bien
- Layout dashboard con sidebar/topnav
- Sistema de temas MUI
- Patron de auth guard + context
- Patron de tablas con paginacion
- i18n basico configurado
- Estructura de carpetas clara

---

## Decisiones Arquitectonicas

### 1. Backend - Crear desde cero
```
/backend
├── src/
│   ├── config/          # DB connections, env vars
│   ├── middleware/       # auth, tenant, validation
│   ├── routes/          # Express routers
│   ├── controllers/     # Request handlers
│   ├── services/        # Business logic
│   ├── models/          # Prisma schema
│   └── utils/           # Helpers
├── prisma/
│   └── schema.prisma
├── package.json
└── .env
```

### 2. Frontend - Adaptar existente
- Reutilizar layout, theme, auth patterns
- Reemplazar mock data con llamadas API reales
- Crear nuevas pages/sections para inventario
- Refactorizar apiService.js con interceptors y manejo de errores

### 3. Multitenancy - Simplificar para MVP
- MVP: single tenant (tenant_demo)
- Preparar estructura para multi-tenant pero no implementar subdomain routing aun
- JWT con tenant_id embebido para futuro

### 4. Base de datos
- PostgreSQL con Prisma ORM
- Trigger para auto-update de current_stock (como dice el PRD)

---

## Fases de Desarrollo

### FASE 0: Setup y Fundamentos (Backend)
**Objetivo**: Backend funcional con DB y auth

#### 0.1 - Inicializar proyecto backend
- [ ] Crear `/backend` con Node.js + Express + TypeScript
- [ ] Configurar Prisma con PostgreSQL
- [ ] Setup de variables de entorno (.env)
- [ ] Configurar ESLint + Prettier

#### 0.2 - Schema de base de datos
- [ ] Crear schema Prisma:
  - `users` (id, email, password_hash, name, role, tenant_id, active, timestamps)
  - `material_categories` (id, name, description, tenant_id, timestamps)
  - `materials` (id, name, description, sku, category_id, unit, current_stock, min_stock, reference_price, active, tenant_id, timestamps)
  - `inventory_movements` (id, type[entry/exit], material_id, quantity, unit_cost, total_cost, supplier, invoice_number, destination, reason, notes, user_id, tenant_id, timestamps)
- [ ] Crear migration inicial
- [ ] Seed con datos demo (categorias, materiales de ejemplo, usuario admin)
- [ ] Crear trigger PostgreSQL para auto-update current_stock

#### 0.3 - Auth API
- [ ] POST `/api/auth/login` - JWT login
- [ ] GET `/api/auth/me` - Validar token y retornar usuario
- [ ] Middleware de autenticacion JWT
- [ ] Middleware basico de tenant (hardcoded a demo por ahora)

---

### FASE 1: Materiales (CRUD completo)
**Objetivo**: Gestionar catalogo de materiales

#### 1.1 - Backend: API de Materiales
- [ ] GET `/api/materials` - Listar con filtros (category_id, active, search)
- [ ] GET `/api/materials/:id` - Detalle
- [ ] POST `/api/materials` - Crear material
- [ ] PUT `/api/materials/:id` - Actualizar
- [ ] DELETE `/api/materials/:id` - Soft delete (active=false)
- [ ] GET `/api/materials/categories` - Listar categorias
- [ ] POST `/api/materials/categories` - Crear categoria

#### 1.2 - Frontend: Refactorizar Auth
- [ ] Actualizar `auth-context.js` para usar API real (login + /me)
- [ ] Guardar JWT en sessionStorage
- [ ] Configurar Axios interceptor para enviar token en headers
- [ ] Manejar token expirado (redirect a login)

#### 1.3 - Frontend: Pagina de Materiales
- [ ] Crear `src/pages/materials/index.js` - Lista de materiales
  - Tabla con columnas: nombre, SKU, categoria, unidad, stock actual, stock minimo, precio ref, estado
  - Buscador por nombre/SKU
  - Filtro por categoria
  - Filtro por estado (activo/inactivo)
  - Paginacion
- [ ] Crear `src/pages/materials/create.js` o modal de creacion
  - Form: nombre, descripcion, SKU, categoria (select), unidad, stock minimo, precio referencia
  - Validacion con Formik + Yup
- [ ] Crear modal/page de edicion (reutilizar form de creacion)
- [ ] Boton de desactivar/activar material
- [ ] Agregar "Materiales" al sidebar nav

---

### FASE 2: Movimientos de Inventario (Entradas y Salidas)
**Objetivo**: Registrar entradas y salidas de stock

#### 2.1 - Backend: API de Movimientos
- [ ] POST `/api/inventory/entry` - Registrar entrada
  - Validar: material_id, quantity > 0, unit_cost
  - Trigger actualiza current_stock automaticamente
- [ ] POST `/api/inventory/exit` - Registrar salida
  - Validar: material_id, quantity > 0, quantity <= current_stock
  - Trigger actualiza current_stock automaticamente
- [ ] GET `/api/inventory/movements` - Historial con filtros
  - Filtros: type (entry/exit), material_id, date_from, date_to
  - Paginacion: page, pageSize
  - Ordenado por fecha desc

#### 2.2 - Frontend: Formularios de Entrada/Salida
- [ ] Modal de Entrada de inventario
  - Select de material (con buscador)
  - Cantidad, costo unitario (calculo automatico de total)
  - Proveedor, numero de factura
  - Notas
- [ ] Modal de Salida de inventario
  - Select de material (muestra stock disponible)
  - Cantidad (validacion vs stock disponible)
  - Destino, razon
  - Notas

#### 2.3 - Frontend: Pagina de Movimientos
- [ ] Crear `src/pages/movements/index.js`
  - Tabla: fecha, tipo (badge entry/exit), material, cantidad, costo, usuario
  - Filtros: tipo, material, rango de fechas
  - Paginacion
- [ ] Agregar "Movimientos" al sidebar nav

---

### FASE 3: Stock y Alertas
**Objetivo**: Vista de stock actual y alertas de stock bajo

#### 3.1 - Backend: APIs de Stock
- [ ] GET `/api/inventory/stock` - Vista de stock actual
  - Filtro: low_stock (boolean), search, category_id
  - Retorna: material + current_stock + min_stock + status
- [ ] GET `/api/inventory/alerts` - Materiales con stock critico
  - Materiales donde current_stock <= min_stock
  - Ordenado por urgencia (diferencia stock actual vs minimo)

#### 3.2 - Frontend: Pagina de Stock
- [ ] Crear `src/pages/stock/index.js`
  - Tabla: material, categoria, stock actual, stock minimo, estado (badge)
  - Indicador visual: verde (OK), amarillo (cerca), rojo (critico)
  - Filtros: categoria, estado
  - Botones rapidos: "Registrar Entrada" / "Registrar Salida"
- [ ] Agregar "Stock" al sidebar nav

#### 3.3 - Frontend: Pagina de Alertas
- [ ] Crear `src/pages/alerts/index.js`
  - Lista de materiales criticos
  - Muestra: material, stock actual, stock minimo, unidades necesarias
  - Ordenado por prioridad
- [ ] Agregar "Alertas" al sidebar nav (con badge de conteo)

---

### FASE 4: Dashboard y Polish
**Objetivo**: Dashboard con KPIs reales y pulido general

#### 4.1 - Backend: API de Dashboard
- [ ] GET `/api/dashboard/stats` - KPIs
  - Total materiales activos
  - Materiales con stock bajo
  - Valor total de inventario
  - Movimientos del ultimo mes

#### 4.2 - Frontend: Dashboard de Inventario
- [ ] Refactorizar `src/pages/index.js`
  - Card: Total materiales
  - Card: Stock bajo (con link a alertas)
  - Card: Valor de inventario
  - Card: Movimientos recientes
  - Tabla: ultimos 5 movimientos
  - Botones de accion rapida: Nueva entrada, Nueva salida

#### 4.3 - Limpieza general
- [ ] Remover paginas no usadas del MVP (companies, customers, monitoring, etc.)
- [ ] Limpiar imports no usados
- [ ] Actualizar navegacion sidebar (solo modulos activos del MVP)
- [ ] Revisar responsive design
- [ ] Manejo de estados vacios (sin materiales, sin movimientos)
- [ ] Loading states y error handling consistente
- [ ] Mensajes de exito/error con Snackbar de MUI

---

## Navegacion Final del MVP

```
Sidebar:
├── Dashboard        (/)
├── Materiales       (/materials)
├── Stock            (/stock)
├── Movimientos      (/movements)
└── Alertas          (/alerts) [badge con conteo]
```

---

## Prioridades y Dependencias

```
FASE 0 (Setup + DB + Auth)
    ↓
FASE 1 (Materiales CRUD) ← Core, todo depende de esto
    ↓
FASE 2 (Movimientos) ← Depende de materiales existentes
    ↓
FASE 3 (Stock + Alertas) ← Depende de movimientos
    ↓
FASE 4 (Dashboard + Polish) ← Integra todo
```

---

## Notas para el Desarrollo

1. **Empezar siempre por el backend** de cada fase, luego frontend
2. **Usar datos seed** para poder desarrollar frontend sin esperar backend completo
3. **No sobre-engineerear el multi-tenant** para el MVP - single tenant funcional
4. **Cada fase debe ser deployable** - no dejar cosas a medias
5. **El PRD menciona roles (admin, manager, warehouse)** - para MVP solo implementar admin, los roles se agregan despues
