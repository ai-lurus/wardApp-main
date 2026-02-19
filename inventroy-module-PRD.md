# Ward.io - Especificación Técnica: Módulo de Inventarios

**Versión:** 1.0  
**Fecha:** Febrero 2026  
**Objetivo:** Desarrollo del módulo de inventarios como primera fase del MVP  
**Arquitectura:** SaaS Multitenant con Database-per-tenant

---

## 📋 Índice

1. [Contexto General](#contexto-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Stack Tecnológico](#stack-tecnológico)
4. [Estructura del Proyecto](#estructura-del-proyecto)
5. [Base de Datos](#base-de-datos)
6. [Backend - API](#backend-api)
7. [Frontend - UI](#frontend-ui)
8. [Funcionalidades del Módulo](#funcionalidades-del-módulo)
9. [Flujos de Usuario](#flujos-de-usuario)
10. [Criterios de Aceptación](#criterios-de-aceptación)

---

## 1. Contexto General

### ¿Qué es Ward.io?

Ward.io es una plataforma **SaaS multitenant** para gestión logística de empresas de transporte de carga. Cada cliente (empresa de transporte) tiene:
- Su propia base de datos PostgreSQL
- Acceso a través de subdomain: `{tenant}.ward.io`
- Módulos activables/desactivables por el Super Admin

### Alcance de esta Fase

**Desarrollar únicamente el módulo de Inventarios**, que incluye:
- ✅ Autenticación básica (login/logout)
- ✅ Gestión de materiales (catálogo)
- ✅ Entradas de inventario
- ✅ Salidas de inventario
- ✅ Consulta de stock actual
- ✅ Historial de movimientos
- ✅ Alertas de stock bajo

**NO incluir en esta fase:**
- ❌ Otros módulos (viajes, unidades, operadores, etc.)
- ❌ Panel de Super Admin
- ❌ Sistema de planes/pricing
- ❌ Notificaciones por email
- ❌ Reportes avanzados (solo vista básica de stock)

---

## 2. Arquitectura del Sistema

### Arquitectura Multitenant

```
┌──────────────────────────────────────────────────┐
│           FRONTEND (React SPA)                   │
│     https://{tenant}.ward.io                     │
│                                                   │
│  Componentes:                                    │
│  - Login                                         │
│  - Dashboard Inventario                          │
│  - Catálogo de Materiales                        │
│  - Entradas/Salidas                              │
│  - Historial                                     │
└────────────────┬─────────────────────────────────┘
                 │ REST API (HTTPS)
                 │
┌────────────────▼─────────────────────────────────┐
│         BACKEND (Node.js + Express)              │
│                                                   │
│  Middleware:                                     │
│  - Tenant Identification (subdomain)             │
│  - JWT Authentication                            │
│  - Database Connection Pool Manager              │
│                                                   │
│  Services:                                       │
│  - AuthService                                   │
│  - InventoryService                              │
│  - MaterialService                               │
└────────────────┬─────────────────────────────────┘
                 │
┌────────────────▼─────────────────────────────────┐
│         DATABASE LAYER (PostgreSQL)              │
│                                                   │
│  platform_db (metadata):                         │
│    - tenants                                     │
│    - tenant_modules                              │
│                                                   │
│  tenant_demo (ejemplo):                          │
│    - users                                       │
│    - materials                                   │
│    - inventory_movements                         │
│    - material_categories                         │
└──────────────────────────────────────────────────┘
```

### Flujo de Request

```
1. Usuario accede a: demo.ward.io
2. Frontend muestra login
3. Usuario se autentica → POST /api/auth/login
4. Backend:
   - Extrae subdomain: "demo"
   - Consulta platform_db → db_name: "tenant_demo"
   - Obtiene pool de conexión a tenant_demo
   - Valida credenciales en tenant_demo.users
   - Retorna JWT con tenant_id
5. Todas las requests subsecuentes:
   - Incluyen JWT en header: Authorization: Bearer {token}
   - Backend extrae tenant_id del token
   - Usa pool de tenant_demo para queries
```

---

## 3. Stack Tecnológico

### Backend
```yaml
Runtime: Node.js 20 LTS
Framework: Express.js
Language: TypeScript
Auth: JWT (jsonwebtoken)
ORM: Prisma
Validation: Zod
Password: bcrypt
Environment: dotenv
HTTP Client: axios (para llamadas externas futuras)
```

### Frontend
```yaml
Framework: React 18
Language: TypeScript
Build Tool: Vite
Routing: React Router v6
State: Zustand (simple y ligero)
UI: TailwindCSS
Forms: React Hook Form + Zod
HTTP: Axios
Icons: Lucide React
```

### Base de Datos
```yaml
Database: PostgreSQL 14+
Connection Pool: pg (node-postgres)
Migrations: Prisma Migrate
```

### DevOps (Básico para MVP)
```yaml
Version Control: Git
Package Manager: npm
Linting: ESLint + Prettier
Environment: .env files
```

---

## 4. Estructura del Proyecto

### Monorepo Structure (Recomendado)

```
ward-io/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts           # Pool manager
│   │   │   └── env.ts                # Variables de entorno
│   │   ├── middleware/
│   │   │   ├── auth.ts               # JWT validation
│   │   │   ├── tenant.ts             # Tenant identification
│   │   │   └── errorHandler.ts
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── inventory.service.ts
│   │   │   └── material.service.ts
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── inventory.routes.ts
│   │   │   └── material.routes.ts
│   │   ├── models/
│   │   │   └── types.ts              # TypeScript types
│   │   ├── utils/
│   │   │   ├── logger.ts
│   │   │   └── validators.ts
│   │   └── server.ts                 # Entry point
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── client.ts             # Axios instance
│   │   │   ├── auth.api.ts
│   │   │   ├── inventory.api.ts
│   │   │   └── material.api.ts
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── Layout.tsx
│   │   │   ├── inventory/
│   │   │   │   ├── MaterialList.tsx
│   │   │   │   ├── MaterialForm.tsx
│   │   │   │   ├── EntryForm.tsx
│   │   │   │   ├── ExitForm.tsx
│   │   │   │   ├── StockTable.tsx
│   │   │   │   └── MovementHistory.tsx
│   │   │   └── common/
│   │   │       ├── Button.tsx
│   │   │       ├── Input.tsx
│   │   │       ├── Modal.tsx
│   │   │       └── Table.tsx
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Materials.tsx
│   │   │   ├── StockView.tsx
│   │   │   └── MovementHistory.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useInventory.ts
│   │   │   └── useMaterials.ts
│   │   ├── store/
│   │   │   ├── authStore.ts
│   │   │   └── inventoryStore.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   ├── format.ts
│   │   │   └── validators.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── .env.example
│   ├── package.json
│   ├── tailwind.config.js
│   └── tsconfig.json
│
├── docs/
│   ├── API.md
│   └── SETUP.md
│
└── README.md
```

---

## 5. Base de Datos

### 5.1 Platform DB (Metadata)

**Database:** `platform_db`

```sql
-- Tabla de tenants
CREATE TABLE tenants (
    id VARCHAR(100) PRIMARY KEY,          -- ej: "demo", "impala"
    name VARCHAR(255) NOT NULL,            -- ej: "Transportes Demo"
    subdomain VARCHAR(100) UNIQUE NOT NULL, -- ej: "demo"
    database_name VARCHAR(100) NOT NULL,   -- ej: "tenant_demo"
    plan VARCHAR(50) DEFAULT 'basic',      -- basic, professional, enterprise
    status VARCHAR(20) DEFAULT 'active',   -- active, inactive, suspended
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de módulos activos por tenant
CREATE TABLE tenant_modules (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(100) REFERENCES tenants(id) ON DELETE CASCADE,
    module_name VARCHAR(50) NOT NULL,      -- 'inventory', 'fleet', 'trips', etc.
    active BOOLEAN DEFAULT true,
    activated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(tenant_id, module_name)
);

-- Índices
CREATE INDEX idx_tenants_subdomain ON tenants(subdomain);
CREATE INDEX idx_tenant_modules_tenant ON tenant_modules(tenant_id);
```

**Datos de ejemplo:**
```sql
INSERT INTO tenants (id, name, subdomain, database_name, plan, status)
VALUES ('demo', 'Empresa Demo', 'demo', 'tenant_demo', 'professional', 'active');

INSERT INTO tenant_modules (tenant_id, module_name, active)
VALUES 
    ('demo', 'inventory', true),
    ('demo', 'fleet', false),
    ('demo', 'trips', false);
```

---

### 5.2 Tenant DB (Datos del Cliente)

**Database:** `tenant_demo` (y cada cliente tendrá su propia BD)

```sql
-- ============================================
-- USUARIOS
-- ============================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,             -- 'admin', 'manager', 'warehouse'
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- CATEGORÍAS DE MATERIALES
-- ============================================
CREATE TABLE material_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,            -- 'Llantas', 'Filtros', 'Diesel', etc.
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- MATERIALES (Catálogo)
-- ============================================
CREATE TABLE materials (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES material_categories(id),
    name VARCHAR(255) NOT NULL,            -- 'Llanta Michelin 295/80R22.5'
    unit VARCHAR(50) NOT NULL,             -- 'unidad', 'litro', 'kg'
    reference_price DECIMAL(10, 2),        -- Precio de referencia
    min_stock INTEGER DEFAULT 0,           -- Stock mínimo para alertas
    current_stock INTEGER DEFAULT 0,       -- Stock actual (calculado)
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- MOVIMIENTOS DE INVENTARIO
-- ============================================
CREATE TABLE inventory_movements (
    id SERIAL PRIMARY KEY,
    material_id INTEGER NOT NULL REFERENCES materials(id),
    type VARCHAR(20) NOT NULL,             -- 'entry' o 'exit'
    quantity INTEGER NOT NULL,
    unit_cost DECIMAL(10, 2),              -- Solo para entradas
    total_cost DECIMAL(10, 2),             -- quantity * unit_cost
    
    -- Campos específicos de ENTRADAS
    supplier VARCHAR(255),                 -- Proveedor (solo entradas)
    invoice_number VARCHAR(100),           -- Número de factura
    
    -- Campos específicos de SALIDAS
    destination VARCHAR(255),              -- Destino: unidad, operador, etc.
    reason TEXT,                           -- Motivo de la salida
    
    -- Auditoría
    created_by INTEGER REFERENCES users(id),
    notes TEXT,
    movement_date TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- ÍNDICES
-- ============================================
CREATE INDEX idx_materials_category ON materials(category_id);
CREATE INDEX idx_materials_active ON materials(active);
CREATE INDEX idx_inventory_material ON inventory_movements(material_id);
CREATE INDEX idx_inventory_type ON inventory_movements(type);
CREATE INDEX idx_inventory_date ON inventory_movements(movement_date);

-- ============================================
-- TRIGGERS PARA ACTUALIZAR STOCK
-- ============================================
CREATE OR REPLACE FUNCTION update_material_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.type = 'entry' THEN
        UPDATE materials 
        SET current_stock = current_stock + NEW.quantity,
            updated_at = NOW()
        WHERE id = NEW.material_id;
    ELSIF NEW.type = 'exit' THEN
        UPDATE materials 
        SET current_stock = current_stock - NEW.quantity,
            updated_at = NOW()
        WHERE id = NEW.material_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_stock
AFTER INSERT ON inventory_movements
FOR EACH ROW
EXECUTE FUNCTION update_material_stock();
```

---

### 5.3 Datos de Seed (Ejemplo)

```sql
-- Categorías
INSERT INTO material_categories (name, description) VALUES
('Llantas', 'Neumáticos para camiones'),
('Filtros', 'Filtros de aire, aceite y combustible'),
('Balatas', 'Pastillas de freno'),
('Diesel', 'Combustible diésel'),
('Empaques', 'Bolsas y material de empaque');

-- Usuario demo
INSERT INTO users (email, password_hash, name, role)
VALUES (
    'admin@demo.com',
    '$2b$10$YourHashedPasswordHere',  -- Password: "demo123"
    'Administrador Demo',
    'admin'
);

-- Materiales de ejemplo
INSERT INTO materials (category_id, name, unit, reference_price, min_stock, current_stock)
VALUES
(1, 'Llanta Michelin 295/80R22.5', 'unidad', 5500.00, 8, 15),
(1, 'Llanta Bridgestone 11R22.5', 'unidad', 4800.00, 6, 10),
(2, 'Filtro de Aire K2540', 'unidad', 450.00, 10, 25),
(2, 'Filtro de Aceite LF3000', 'unidad', 280.00, 15, 30),
(3, 'Balatas Premium HD', 'juego', 1200.00, 4, 8),
(4, 'Diesel', 'litro', 26.80, 1000, 5000),
(5, 'Bolsa de Empaque Grande', 'paquete', 150.00, 20, 50);
```

---

## 6. Backend - API

### 6.1 Configuración de Environment (.env)

```env
# Server
NODE_ENV=development
PORT=3000

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# Platform Database (Metadata)
PLATFORM_DB_HOST=localhost
PLATFORM_DB_PORT=5432
PLATFORM_DB_NAME=platform_db
PLATFORM_DB_USER=postgres
PLATFORM_DB_PASSWORD=postgres

# CORS
ALLOWED_ORIGINS=http://localhost:5173,https://*.ward.io

# Logging
LOG_LEVEL=debug
```

---

### 6.2 Database Connection Pool Manager

**Archivo:** `backend/src/config/database.ts`

```typescript
import { Pool } from 'pg';

interface TenantConnection {
  pool: Pool;
  lastUsed: Date;
}

class DatabaseManager {
  private platformPool: Pool;
  private tenantPools: Map<string, TenantConnection> = new Map();
  
  constructor() {
    // Pool para platform_db (metadata)
    this.platformPool = new Pool({
      host: process.env.PLATFORM_DB_HOST,
      port: parseInt(process.env.PLATFORM_DB_PORT || '5432'),
      database: process.env.PLATFORM_DB_NAME,
      user: process.env.PLATFORM_DB_USER,
      password: process.env.PLATFORM_DB_PASSWORD,
      max: 20,
      idleTimeoutMillis: 30000,
    });
    
    // Limpiar pools inactivos cada hora
    setInterval(() => this.cleanupIdlePools(), 3600000);
  }
  
  // Obtener pool de platform_db
  getPlatformPool(): Pool {
    return this.platformPool;
  }
  
  // Obtener pool de tenant específico
  async getTenantPool(tenantId: string): Promise<Pool> {
    // Si ya existe, actualizar lastUsed y retornar
    if (this.tenantPools.has(tenantId)) {
      const conn = this.tenantPools.get(tenantId)!;
      conn.lastUsed = new Date();
      return conn.pool;
    }
    
    // Obtener info de BD del tenant desde platform_db
    const result = await this.platformPool.query(
      'SELECT database_name, status FROM tenants WHERE id = $1',
      [tenantId]
    );
    
    if (result.rows.length === 0) {
      throw new Error(`Tenant ${tenantId} not found`);
    }
    
    if (result.rows[0].status !== 'active') {
      throw new Error(`Tenant ${tenantId} is not active`);
    }
    
    const dbName = result.rows[0].database_name;
    
    // Crear nuevo pool para este tenant
    const pool = new Pool({
      host: process.env.PLATFORM_DB_HOST, // Mismo host por ahora
      port: parseInt(process.env.PLATFORM_DB_PORT || '5432'),
      database: dbName,
      user: process.env.PLATFORM_DB_USER,
      password: process.env.PLATFORM_DB_PASSWORD,
      max: 10, // Max 10 conexiones por tenant
      idleTimeoutMillis: 30000,
    });
    
    // Cachear pool
    this.tenantPools.set(tenantId, {
      pool,
      lastUsed: new Date(),
    });
    
    return pool;
  }
  
  // Limpiar pools que no se han usado en más de 1 hora
  private cleanupIdlePools() {
    const oneHourAgo = new Date(Date.now() - 3600000);
    
    for (const [tenantId, conn] of this.tenantPools.entries()) {
      if (conn.lastUsed < oneHourAgo) {
        conn.pool.end();
        this.tenantPools.delete(tenantId);
        console.log(`Cleaned up idle pool for tenant: ${tenantId}`);
      }
    }
  }
  
  // Cerrar todas las conexiones
  async closeAll() {
    await this.platformPool.end();
    
    for (const [tenantId, conn] of this.tenantPools.entries()) {
      await conn.pool.end();
    }
    
    this.tenantPools.clear();
  }
}

export const dbManager = new DatabaseManager();
```

---

### 6.3 Middleware de Tenant

**Archivo:** `backend/src/middleware/tenant.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { dbManager } from '../config/database';

export interface TenantRequest extends Request {
  tenantId?: string;
  tenantPool?: any;
}

export const identifyTenant = async (
  req: TenantRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1. Extraer subdomain del host
    const host = req.headers.host || '';
    const subdomain = host.split('.')[0];
    
    // 2. Si es localhost o ward (admin), usar "demo" por defecto
    let tenantId = subdomain;
    if (subdomain === 'localhost:3000' || subdomain === 'ward') {
      tenantId = 'demo';
    }
    
    // 3. Validar que el tenant existe
    const pool = await dbManager.getTenantPool(tenantId);
    
    // 4. Inyectar en request
    req.tenantId = tenantId;
    req.tenantPool = pool;
    
    next();
  } catch (error) {
    console.error('Tenant identification error:', error);
    return res.status(400).json({
      error: 'Invalid tenant',
      message: 'The requested tenant does not exist or is not active',
    });
  }
};
```

---

### 6.4 Middleware de Autenticación

**Archivo:** `backend/src/middleware/auth.ts`

```typescript
import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { TenantRequest } from './tenant';

interface JwtPayload {
  userId: number;
  tenantId: string;
  role: string;
}

export interface AuthRequest extends TenantRequest {
  user?: JwtPayload;
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1. Extraer token del header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.substring(7);
    
    // 2. Verificar token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as JwtPayload;
    
    // 3. Validar que el tenant del token coincide con el tenant de la request
    if (decoded.tenantId !== req.tenantId) {
      return res.status(403).json({ error: 'Tenant mismatch' });
    }
    
    // 4. Inyectar usuario en request
    req.user = decoded;
    
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Middleware para roles específicos
export const authorize = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
};
```

---

### 6.5 Routes - Authentication

**Archivo:** `backend/src/routes/auth.routes.ts`

```typescript
import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { TenantRequest } from '../middleware/tenant';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req: TenantRequest, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    // Buscar usuario en la BD del tenant
    const result = await req.tenantPool.query(
      'SELECT id, email, password_hash, name, role, active FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    
    if (!user.active) {
      return res.status(403).json({ error: 'User account is inactive' });
    }
    
    // Verificar contraseña
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generar JWT
    const token = jwt.sign(
      {
        userId: user.id,
        tenantId: req.tenantId,
        role: user.role,
      },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/auth/me
router.get('/me', async (req: TenantRequest, res) => {
  // Este endpoint requiere authentication middleware
  res.json({ message: 'Protected route' });
});

export default router;
```

---

### 6.6 Routes - Materials

**Archivo:** `backend/src/routes/material.routes.ts`

```typescript
import { Router } from 'express';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/materials - Listar materiales
router.get('/', async (req: AuthRequest, res) => {
  try {
    const { category_id, active } = req.query;
    
    let query = `
      SELECT 
        m.*,
        c.name as category_name
      FROM materials m
      LEFT JOIN material_categories c ON m.category_id = c.id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    
    if (category_id) {
      params.push(category_id);
      query += ` AND m.category_id = $${params.length}`;
    }
    
    if (active !== undefined) {
      params.push(active === 'true');
      query += ` AND m.active = $${params.length}`;
    }
    
    query += ' ORDER BY m.name ASC';
    
    const result = await req.tenantPool.query(query, params);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching materials:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/materials/:id - Obtener material específico
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    
    const result = await req.tenantPool.query(
      `SELECT 
        m.*,
        c.name as category_name
      FROM materials m
      LEFT JOIN material_categories c ON m.category_id = c.id
      WHERE m.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Material not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching material:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/materials - Crear material
router.post('/', async (req: AuthRequest, res) => {
  try {
    const {
      category_id,
      name,
      unit,
      reference_price,
      min_stock,
    } = req.body;
    
    // Validación básica
    if (!name || !unit) {
      return res.status(400).json({ error: 'Name and unit are required' });
    }
    
    const result = await req.tenantPool.query(
      `INSERT INTO materials (
        category_id, name, unit, reference_price, min_stock
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,
      [category_id, name, unit, reference_price || 0, min_stock || 0]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating material:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/materials/:id - Actualizar material
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const {
      category_id,
      name,
      unit,
      reference_price,
      min_stock,
      active,
    } = req.body;
    
    const result = await req.tenantPool.query(
      `UPDATE materials SET
        category_id = COALESCE($1, category_id),
        name = COALESCE($2, name),
        unit = COALESCE($3, unit),
        reference_price = COALESCE($4, reference_price),
        min_stock = COALESCE($5, min_stock),
        active = COALESCE($6, active),
        updated_at = NOW()
      WHERE id = $7
      RETURNING *`,
      [category_id, name, unit, reference_price, min_stock, active, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Material not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating material:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/materials/:id - Desactivar material
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    
    const result = await req.tenantPool.query(
      'UPDATE materials SET active = false WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Material not found' });
    }
    
    res.json({ message: 'Material deactivated successfully' });
  } catch (error) {
    console.error('Error deleting material:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/materials/categories - Listar categorías
router.get('/categories/list', async (req: AuthRequest, res) => {
  try {
    const result = await req.tenantPool.query(
      'SELECT * FROM material_categories ORDER BY name ASC'
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
```

---

### 6.7 Routes - Inventory Movements

**Archivo:** `backend/src/routes/inventory.routes.ts`

```typescript
import { Router } from 'express';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// POST /api/inventory/entry - Registrar entrada
router.post('/entry', async (req: AuthRequest, res) => {
  try {
    const {
      material_id,
      quantity,
      unit_cost,
      supplier,
      invoice_number,
      notes,
    } = req.body;
    
    // Validación
    if (!material_id || !quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Invalid data' });
    }
    
    const total_cost = (unit_cost || 0) * quantity;
    
    const result = await req.tenantPool.query(
      `INSERT INTO inventory_movements (
        material_id,
        type,
        quantity,
        unit_cost,
        total_cost,
        supplier,
        invoice_number,
        notes,
        created_by
      ) VALUES ($1, 'entry', $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        material_id,
        quantity,
        unit_cost,
        total_cost,
        supplier,
        invoice_number,
        notes,
        req.user!.userId,
      ]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating entry:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/inventory/exit - Registrar salida
router.post('/exit', async (req: AuthRequest, res) => {
  try {
    const {
      material_id,
      quantity,
      destination,
      reason,
      notes,
    } = req.body;
    
    // Validación
    if (!material_id || !quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Invalid data' });
    }
    
    // Verificar stock disponible
    const stockResult = await req.tenantPool.query(
      'SELECT current_stock FROM materials WHERE id = $1',
      [material_id]
    );
    
    if (stockResult.rows.length === 0) {
      return res.status(404).json({ error: 'Material not found' });
    }
    
    const currentStock = stockResult.rows[0].current_stock;
    if (currentStock < quantity) {
      return res.status(400).json({
        error: 'Insufficient stock',
        available: currentStock,
        requested: quantity,
      });
    }
    
    const result = await req.tenantPool.query(
      `INSERT INTO inventory_movements (
        material_id,
        type,
        quantity,
        destination,
        reason,
        notes,
        created_by
      ) VALUES ($1, 'exit', $2, $3, $4, $5, $6)
      RETURNING *`,
      [material_id, quantity, destination, reason, notes, req.user!.userId]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating exit:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/inventory/movements - Historial de movimientos
router.get('/movements', async (req: AuthRequest, res) => {
  try {
    const { material_id, type, limit = 50, offset = 0 } = req.query;
    
    let query = `
      SELECT 
        im.*,
        m.name as material_name,
        m.unit as material_unit,
        u.name as created_by_name
      FROM inventory_movements im
      JOIN materials m ON im.material_id = m.id
      JOIN users u ON im.created_by = u.id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    
    if (material_id) {
      params.push(material_id);
      query += ` AND im.material_id = $${params.length}`;
    }
    
    if (type) {
      params.push(type);
      query += ` AND im.type = $${params.length}`;
    }
    
    query += ` ORDER BY im.movement_date DESC`;
    
    params.push(limit, offset);
    query += ` LIMIT $${params.length - 1} OFFSET $${params.length}`;
    
    const result = await req.tenantPool.query(query, params);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching movements:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/inventory/stock - Vista de stock actual
router.get('/stock', async (req: AuthRequest, res) => {
  try {
    const { low_stock } = req.query;
    
    let query = `
      SELECT 
        m.*,
        c.name as category_name,
        CASE 
          WHEN m.current_stock <= m.min_stock THEN true
          ELSE false
        END as is_low_stock
      FROM materials m
      LEFT JOIN material_categories c ON m.category_id = c.id
      WHERE m.active = true
    `;
    
    if (low_stock === 'true') {
      query += ' AND m.current_stock <= m.min_stock';
    }
    
    query += ' ORDER BY m.current_stock ASC';
    
    const result = await req.tenantPool.query(query);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching stock:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/inventory/alerts - Materiales con stock bajo
router.get('/alerts', async (req: AuthRequest, res) => {
  try {
    const result = await req.tenantPool.query(`
      SELECT 
        m.*,
        c.name as category_name,
        (m.min_stock - m.current_stock) as units_needed
      FROM materials m
      LEFT JOIN material_categories c ON m.category_id = c.id
      WHERE m.active = true 
        AND m.current_stock <= m.min_stock
      ORDER BY units_needed DESC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
```

---

### 6.8 Server Entry Point

**Archivo:** `backend/src/server.ts`

```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { identifyTenant } from './middleware/tenant';
import { authenticate } from './middleware/auth';
import authRoutes from './routes/auth.routes';
import materialRoutes from './routes/material.routes';
import inventoryRoutes from './routes/inventory.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware global
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true,
}));
app.use(express.json());

// Health check (sin tenant)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Aplicar middleware de tenant a todas las rutas /api/*
app.use('/api', identifyTenant);

// Rutas públicas (no requieren auth)
app.use('/api/auth', authRoutes);

// Rutas protegidas (requieren auth)
app.use('/api/materials', authenticate, materialRoutes);
app.use('/api/inventory', authenticate, inventoryRoutes);

// Error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
});
```

---

## 7. Frontend - UI

### 7.1 Configuración Axios

**Archivo:** `frontend/src/api/client.ts`

```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token en todas las requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores de autenticación
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido o expirado
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

---

### 7.2 Auth Store (Zustand)

**Archivo:** `frontend/src/store/authStore.ts`

```typescript
import { create } from 'zustand';
import apiClient from '../api/client';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  
  login: async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password,
      });
      
      const { token, user } = response.data;
      
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },
  
  checkAuth: () => {
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      const user = JSON.parse(userStr);
      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      set({ isLoading: false });
    }
  },
}));
```

---

### 7.3 Página de Login

**Archivo:** `frontend/src/pages/Login.tsx`

```tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(
        err.response?.data?.error || 'Error al iniciar sesión'
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Ward.io</h1>
          <p className="text-gray-600 mt-2">
            Gestión Logística Inteligente
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="usuario@empresa.com"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:bg-gray-400"
          >
            {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Usuario demo: admin@demo.com</p>
          <p>Contraseña: demo123</p>
        </div>
      </div>
    </div>
  );
}
```

---

### 7.4 Layout Principal

**Archivo:** `frontend/src/components/layout/Layout.tsx`

```tsx
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { 
  Package, 
  ArrowLeftRight, 
  History, 
  LayoutDashboard,
  LogOut,
  AlertCircle,
} from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/materials', icon: Package, label: 'Materiales' },
    { to: '/stock', icon: ArrowLeftRight, label: 'Stock' },
    { to: '/movements', icon: History, label: 'Movimientos' },
    { to: '/alerts', icon: AlertCircle, label: 'Alertas' },
  ];
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900">Ward.io</h1>
          <p className="text-sm text-gray-600 mt-1">Inventarios</p>
        </div>
        
        <nav className="px-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="mb-3">
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-600">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="font-medium">Cerrar sesión</span>
          </button>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="ml-64 p-8">
        <Outlet />
      </main>
    </div>
  );
}
```

---

### 7.5 Dashboard de Inventario

**Archivo:** `frontend/src/pages/Dashboard.tsx`

```tsx
import { useEffect, useState } from 'react';
import apiClient from '../api/client';
import { Package, AlertTriangle, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalMaterials: 0,
    lowStock: 0,
    totalValue: 0,
    recentMovements: 0,
  });
  
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadStats();
  }, []);
  
  const loadStats = async () => {
    try {
      const [materials, alerts, movements] = await Promise.all([
        apiClient.get('/materials'),
        apiClient.get('/inventory/alerts'),
        apiClient.get('/inventory/movements?limit=10'),
      ]);
      
      const totalValue = materials.data.reduce(
        (sum: number, m: any) => sum + (m.current_stock * m.reference_price),
        0
      );
      
      setStats({
        totalMaterials: materials.data.length,
        lowStock: alerts.data.length,
        totalValue,
        recentMovements: movements.data.length,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const statCards = [
    {
      label: 'Total Materiales',
      value: stats.totalMaterials,
      icon: Package,
      color: 'blue',
    },
    {
      label: 'Stock Bajo',
      value: stats.lowStock,
      icon: AlertTriangle,
      color: 'red',
    },
    {
      label: 'Valor Inventario',
      value: `$${stats.totalValue.toLocaleString()}`,
      icon: ArrowUpCircle,
      color: 'green',
    },
    {
      label: 'Movimientos Hoy',
      value: stats.recentMovements,
      icon: ArrowDownCircle,
      color: 'purple',
    },
  ];
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }
  
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Dashboard de Inventario
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {card.value}
                </p>
              </div>
              <div className={`p-3 bg-${card.color}-100 rounded-lg`}>
                <card.icon className={`w-6 h-6 text-${card.color}-600`} />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Acciones Rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all">
            <Package className="w-8 h-8 text-blue-600 mb-2" />
            <p className="font-medium text-gray-900">Nuevo Material</p>
          </button>
          <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all">
            <ArrowUpCircle className="w-8 h-8 text-green-600 mb-2" />
            <p className="font-medium text-gray-900">Registrar Entrada</p>
          </button>
          <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition-all">
            <ArrowDownCircle className="w-8 h-8 text-red-600 mb-2" />
            <p className="font-medium text-gray-900">Registrar Salida</p>
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## 8. Funcionalidades del Módulo

### Funcionalidades Implementadas

#### ✅ 1. Autenticación
- Login con email/password
- JWT token con tenant_id
- Logout
- Protección de rutas

#### ✅ 2. Gestión de Materiales
- Listar materiales (con filtros por categoría, activos)
- Ver detalle de material
- Crear nuevo material
- Editar material existente
- Desactivar material

#### ✅ 3. Entradas de Inventario
- Registrar entrada con proveedor y factura
- Cálculo automático de costo total
- Actualización automática de stock (trigger)
- Asociación a usuario que registra

#### ✅ 4. Salidas de Inventario
- Registrar salida con destino y motivo
- Validación de stock disponible
- Actualización automática de stock (trigger)
- Asociación a usuario que registra

#### ✅ 5. Consulta de Stock
- Vista de stock actual por material
- Filtro de materiales con stock bajo
- Indicador visual de stock crítico

#### ✅ 6. Historial de Movimientos
- Lista de todas las entradas y salidas
- Filtros por material, tipo, fecha
- Paginación
- Detalles de usuario que registró

#### ✅ 7. Alertas
- Lista de materiales con stock ≤ stock mínimo
- Cálculo de unidades faltantes
- Ordenado por urgencia

---

## 9. Flujos de Usuario

### Flujo 1: Registrar Entrada de Material

```
1. Usuario navega a "Movimientos" > "Nueva Entrada"
2. Selecciona material del dropdown
3. Ingresa cantidad (ej: 10)
4. Ingresa costo unitario (ej: $5,500)
   - Sistema calcula total automáticamente: $55,000
5. Ingresa proveedor: "Llantas del Pacífico"
6. Ingresa número de factura (opcional): "F-12345"
7. Agrega notas (opcional): "Llantas para reposición"
8. Hace clic en "Registrar Entrada"
9. Sistema:
   - Valida datos
   - Crea registro en inventory_movements
   - Trigger actualiza materials.current_stock += 10
   - Muestra confirmación: "Entrada registrada correctamente"
10. Usuario ve el movimiento en el historial
```

### Flujo 2: Registrar Salida de Material

```
1. Usuario navega a "Movimientos" > "Nueva Salida"
2. Selecciona material: "Llanta Michelin 295/80R22.5"
   - Sistema muestra stock actual: 15 unidades
3. Ingresa cantidad: 4
4. Sistema valida: 15 >= 4 ✓
5. Selecciona destino: "Unidad-105"
6. Ingresa motivo: "Cambio de llantas programado"
7. Agrega notas (opcional)
8. Hace clic en "Registrar Salida"
9. Sistema:
   - Valida stock suficiente
   - Crea registro en inventory_movements
   - Trigger actualiza materials.current_stock -= 4
   - Nuevo stock: 11 unidades
   - Muestra confirmación
10. Si stock queda bajo mínimo, aparece en alertas
```

### Flujo 3: Consultar Stock y Generar Alerta

```
1. Usuario navega a "Stock"
2. Ve tabla con todos los materiales y su stock actual
3. Materiales con stock ≤ mínimo aparecen en rojo
4. Usuario navega a "Alertas"
5. Ve lista de materiales críticos:
   - Filtro de Aire K2540: Stock 5, Mínimo 10, Faltan 5
6. Usuario decide hacer pedido
7. [Futuro] Genera orden de compra automática
```

---

## 10. Criterios de Aceptación

### Backend

- [ ] **Database Connection Pool Manager funcional**
  - Crea pools por tenant dinámicamente
  - Limpia pools inactivos
  - Maneja errores de conexión

- [ ] **Middleware de Tenant funcional**
  - Identifica tenant por subdomain
  - Valida existencia en platform_db
  - Inyecta pool correcto en req

- [ ] **Autenticación JWT funcional**
  - Login retorna token válido
  - Middleware valida token correctamente
  - Token incluye tenant_id
  - Logout invalida token

- [ ] **API de Materiales funcional**
  - GET /api/materials retorna lista
  - GET /api/materials/:id retorna detalle
  - POST /api/materials crea material
  - PUT /api/materials/:id actualiza
  - DELETE /api/materials/:id desactiva

- [ ] **API de Inventario funcional**
  - POST /api/inventory/entry crea entrada
  - POST /api/inventory/exit crea salida
  - GET /api/inventory/movements retorna historial
  - GET /api/inventory/stock retorna vista de stock
  - GET /api/inventory/alerts retorna materiales críticos

- [ ] **Triggers de Stock funcionando**
  - Entrada incrementa stock automáticamente
  - Salida decrementa stock automáticamente
  - Stock nunca puede ser negativo

### Frontend

- [ ] **Login funcional**
  - Formulario valida campos
  - Muestra errores claros
  - Guarda token en localStorage
  - Redirige a dashboard tras login exitoso

- [ ] **Dashboard muestra métricas correctas**
  - Total de materiales
  - Materiales con stock bajo
  - Valor total de inventario
  - Movimientos recientes

- [ ] **Gestión de Materiales funcional**
  - Lista materiales con filtros
  - Formulario crear/editar material
  - Desactivar material
  - Ver categorías

- [ ] **Entradas de Inventario funcional**
  - Formulario completo
  - Cálculo automático de total
  - Validaciones de campos
  - Confirmación exitosa

- [ ] **Salidas de Inventario funcional**
  - Formulario completo
  - Validación de stock disponible
  - Mensaje de error si stock insuficiente
  - Confirmación exitosa

- [ ] **Vista de Stock funcional**
  - Tabla con todos los materiales
  - Indicador visual de stock bajo
  - Búsqueda y filtros

- [ ] **Historial de Movimientos funcional**
  - Lista paginada
  - Filtros por tipo, material, fecha
  - Detalles completos de cada movimiento

- [ ] **Alertas funcionales**
  - Lista de materiales críticos
  - Ordenado por urgencia
  - Cálculo de unidades faltantes

### General

- [ ] **Multi-tenancy funcional**
  - Tenant A no ve datos de Tenant B
  - Subdomain identifica tenant correctamente
  - Pool de conexiones aislado

- [ ] **Testing básico**
  - Al menos 1 tenant de prueba creado
  - Datos de seed cargados
  - Login funciona para usuario demo

- [ ] **Código limpio**
  - TypeScript sin errores
  - ESLint configurado
  - Código comentado en secciones críticas

---

## 📝 Notas Finales para Claude Code

### Orden de Implementación Sugerido

1. **Setup Inicial (2-3 horas)**
   - Crear estructura de carpetas
   - Configurar package.json (backend + frontend)
   - Configurar TypeScript, ESLint
   - Configurar .env files

2. **Base de Datos (2 horas)**
   - Crear platform_db
   - Crear tenant_demo
   - Ejecutar SQL de schemas
   - Insertar datos de seed

3. **Backend Core (4-5 horas)**
   - Database Connection Pool Manager
   - Middleware de Tenant
   - Middleware de Auth
   - Routes de Auth (login)

4. **Backend Inventory (4-5 horas)**
   - Routes de Materials
   - Routes de Inventory
   - Testing de endpoints con Postman/curl

5. **Frontend Core (3-4 horas)**
   - Setup React + Vite + TailwindCSS
   - Axios client
   - Auth store (Zustand)
   - Login page
   - Layout principal

6. **Frontend Inventory (6-8 horas)**
   - Dashboard
   - Materials CRUD
   - Entry/Exit forms
   - Stock view
   - Movement history
   - Alerts view

### Comandos Útiles

```bash
# Backend
cd backend
npm init -y
npm install express typescript ts-node @types/node @types/express
npm install pg @types/pg
npm install jsonwebtoken @types/jsonwebtoken bcrypt @types/bcrypt
npm install dotenv cors @types/cors
npm install -D nodemon

# Frontend
cd frontend
npm create vite@latest . -- --template react-ts
npm install
npm install react-router-dom
npm install axios
npm install zustand
npm install lucide-react
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Testing

```bash
# Crear tenant demo en platform_db
psql -U postgres -d platform_db -f scripts/create_platform.sql

# Crear base de datos para tenant demo
psql -U postgres -d tenant_demo -f scripts/create_tenant.sql

# Insertar datos de prueba
psql -U postgres -d tenant_demo -f scripts/seed_tenant.sql

# Probar login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@demo.com","password":"demo123"}'
```
