# Graph Report - wardApp-main  (2026-05-08)

## Corpus Check
- 161 files · ~275,231 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 882 nodes · 819 edges · 144 communities (115 shown, 29 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 15 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 65|Community 65]]
- [[_COMMUNITY_Community 66|Community 66]]
- [[_COMMUNITY_Community 67|Community 67]]
- [[_COMMUNITY_Community 68|Community 68]]
- [[_COMMUNITY_Community 69|Community 69]]
- [[_COMMUNITY_Community 70|Community 70]]
- [[_COMMUNITY_Community 71|Community 71]]
- [[_COMMUNITY_Community 72|Community 72]]
- [[_COMMUNITY_Community 73|Community 73]]
- [[_COMMUNITY_Community 75|Community 75]]
- [[_COMMUNITY_Community 76|Community 76]]
- [[_COMMUNITY_Community 77|Community 77]]
- [[_COMMUNITY_Community 79|Community 79]]
- [[_COMMUNITY_Community 83|Community 83]]

## God Nodes (most connected - your core abstractions)
1. `Ward app - Product Requirements Document (PRD)` - 13 edges
2. `Ward.io - Especificación Técnica: Módulo de Inventarios` - 13 edges
3. `Ward.io - Contexto para Claude` - 11 edges
4. `REGLAS CRÍTICAS — Léelas antes de tocar cualquier cosa` - 11 edges
5. `5. Requisitos Funcionales` - 10 edges
6. `RF-00: Panel de Administración Maestro (Super Admin)` - 9 edges
7. `6. Backend - API` - 9 edges
8. `useAuth()` - 8 edges
9. `Patrones Clave` - 8 edges
10. `RF-02: Gestión de Inventario` - 8 edges

## Surprising Connections (you probably didn't know these)
- `SubscriptionGuard()` --calls--> `useAuth()`  [INFERRED]
  src/guards/subscription-guard.js → src/hooks/use-auth.js
- `AccountPopover()` --calls--> `useAuth()`  [INFERRED]
  src/layouts/dashboard/account-popover.js → src/hooks/use-auth.js
- `Page()` --calls--> `useAuth()`  [INFERRED]
  src/pages/billing.js → src/hooks/use-auth.js
- `Page()` --calls--> `useAuth()`  [INFERRED]
  src/pages/users.js → src/hooks/use-auth.js
- `Page()` --calls--> `useAuth()`  [INFERRED]
  src/pages/auth/login.js → src/hooks/use-auth.js

## Communities (144 total, 29 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.03
Nodes (27): adminApi, api, authApi, billingApi, boundary, categoriesApi, dashboardApi, decoder (+19 more)

### Community 1 - "Community 1"
Cohesion: 0.05
Nodes (41): 1. Resumen Ejecutivo, 2. Visión y Objetivos, 3.0 Super Administrador (Ward.io), 3.1 Administrador del Sistema, 3.2 Gerente de Operaciones, 3.3 Contador / Gerente Financiero, 3.4 Jefe de Almacén / Encargado de Inventario, 3.5 Jefe de Flota (+33 more)

### Community 2 - "Community 2"
Cohesion: 0.05
Nodes (38): 0.1 - Inicializar proyecto backend, 0.2 - Schema de base de datos, 0.3 - Auth API, 1.1 - Backend: API de Materiales, 1.2 - Frontend: Refactorizar Auth, 1.3 - Frontend: Pagina de Materiales, 1. Backend - Crear desde cero, 2.1 - Backend: API de Movimientos (+30 more)

### Community 3 - "Community 3"
Cohesion: 0.08
Nodes (17): Page(), AccountPopover(), items, superAdminItems, Layout, SideNavItem(), SideNav(), TopNav() (+9 more)

### Community 4 - "Community 4"
Cohesion: 0.07
Nodes (27): ApexCharts en Next.js, API Endpoints del MVP, API Service, Auth Guard, Backend (/wardApp-backend — al mismo nivel que /wardApp-main), code:block1 (src/), code:javascript (const Page = () => { /* ... */ };), code:javascript (const Chart = dynamic(() => import('react-apexcharts'), { ss) (+19 more)

### Community 5 - "Community 5"
Cohesion: 0.13
Nodes (15): useNProgress(), App(), clientSideEmotionCache, error, indigo, info, neutral, success (+7 more)

### Community 6 - "Community 6"
Cohesion: 0.1
Nodes (21): 6. Requisitos No Funcionales, RNF-01.1: Autenticación y Autorización, RNF-01.2: Protección de Datos, RNF-01.3: Aislamiento de Tenants (Multi-tenancy Security), RNF-01.4: Auditoría, RNF-01: Seguridad, RNF-02.1: Tiempos de Respuesta, RNF-02.2: Escalabilidad (+13 more)

### Community 7 - "Community 7"
Cohesion: 0.1
Nodes (21): 8. Plan de Desarrollo, Fase 0: Infraestructura Multi-tenant (Semanas 1-2), Fase 1: MVP Core (Semanas 3-6), Fase 2: Operaciones (Semanas 7-10), Fase 3: Optimización y Reportes (Semanas 11-14), Fase 4: Experiencia y Escalabilidad (Semanas 15+), Semana 10: Testing Fase 2, Semana 11-12: Sistema de Reportes (+13 more)

### Community 8 - "Community 8"
Cohesion: 0.1
Nodes (20): 7. Arquitectura y Stack Tecnológico, Arquitectura Propuesta (SaaS Multitenant), Backend, Base de Datos, code:block1 (┌───────────────────────────────────────────────────────────), code:javascript (// Ejemplo de implementación), code:block3 (1. Usuario accede a: impala.ward.io), code:sql (-- 1. Crear entrada en platform_db) (+12 more)

### Community 9 - "Community 9"
Cohesion: 0.11
Nodes (4): categories, materials, movements, now

### Community 10 - "Community 10"
Cohesion: 0.16
Nodes (10): AXLE_OPTIONS, CostPreviewModal(), modalStyle, modalStyle, RouteDetails(), modalStyle, RouteModal(), RoutesSearch() (+2 more)

### Community 11 - "Community 11"
Cohesion: 0.16
Nodes (9): TripCloseModal(), steps, TripCreateModal(), statusMap, TripDetailDrawer(), TripsSearch(), TripsSummary(), statusMap (+1 more)

### Community 12 - "Community 12"
Cohesion: 0.12
Nodes (16): Ambientes Disponibles:, code:block1 (material-kit-react), Configuración de Ambientes, Contact Us, Demo, File Structure, Free Figma Community File, License (+8 more)

### Community 13 - "Community 13"
Cohesion: 0.12
Nodes (17): 10. Riesgos y Mitigaciones, Riesgos de Multi-tenancy, Riesgos de Negocio, Riesgos de Operación, Riesgos Técnicos, RM-01: Data Leakage entre Tenants, RM-02: Noisy Neighbor (Cliente abusa recursos), RM-03: Complejidad en Migraciones de Base de Datos (+9 more)

### Community 14 - "Community 14"
Cohesion: 0.12
Nodes (17): 6.1 Configuración de Environment (.env), 6.2 Database Connection Pool Manager, 6.3 Middleware de Tenant, 6.4 Middleware de Autenticación, 6.5 Routes - Authentication, 6.6 Routes - Materials, 6.7 Routes - Inventory Movements, 6.8 Server Entry Point (+9 more)

### Community 15 - "Community 15"
Cohesion: 0.12
Nodes (16): 10. Páginas que NO tocar (no son del MVP), 1. Pages Router ÚNICAMENTE — No usar App Router, 2. JavaScript — No TypeScript en el frontend, 3. Toda página nueva requiere el patrón `getLayout`, 4. ApexCharts siempre con dynamic import, 5. Componentes UI — solo MUI v5, 6. Formularios — Formik + Yup, 7. API calls — solo a través de `src/services/apiService.js` (+8 more)

### Community 16 - "Community 16"
Cohesion: 0.14
Nodes (9): AccountProfile(), getInitials(), roleLabel, AuthContext, HANDLERS, initialState, useAuthContext(), AuthGuard() (+1 more)

### Community 17 - "Community 17"
Cohesion: 0.13
Nodes (15): 9. Métricas de Éxito, Adopción, Adopción de Módulos, Calidad, Crecimiento, Crecimiento de Clientes, Métricas de Negocio, Métricas de Plataforma SaaS (+7 more)

### Community 18 - "Community 18"
Cohesion: 0.19
Nodes (11): useSelection(), data, now, Page(), useCustomerIds(), useCustomers(), data, now (+3 more)

### Community 19 - "Community 19"
Cohesion: 0.2
Nodes (5): modalStyle, ZONE_COLORS, ZoneCreateModal(), ZONE_COLORS, ZonePanel()

### Community 20 - "Community 20"
Cohesion: 0.18
Nodes (11): 7.1 Configuración Axios, 7.2 Auth Store (Zustand), 7.3 Página de Login, 7.4 Layout Principal, 7.5 Dashboard de Inventario, 7. Frontend - UI, code:typescript (import axios from 'axios';), code:typescript (import { create } from 'zustand';) (+3 more)

### Community 21 - "Community 21"
Cohesion: 0.2
Nodes (9): 1. Contexto General, 4. Estructura del Proyecto, 8. Funcionalidades del Módulo, Alcance de esta Fase, code:block7 (ward-io/), Monorepo Structure (Recomendado), 📋 Índice, ¿Qué es Ward.io? (+1 more)

### Community 22 - "Community 22"
Cohesion: 0.22
Nodes (5): cache, CustomDocument, emotionStyles, emotionStyleTags, { extractCriticalToChunks }

### Community 23 - "Community 23"
Cohesion: 0.31
Nodes (4): modalStyle, TollboothModal(), TollboothsSearch(), TollboothsTable()

### Community 24 - "Community 24"
Cohesion: 0.22
Nodes (9): RF-00.1: Gestión de Clientes/Tenants, RF-00.2: Gestión de Módulos por Cliente, RF-00.3: Configuración de Planes y Pricing, RF-00.4: Monitoreo de Uso y Métricas, RF-00.5: Onboarding de Nuevos Clientes, RF-00.6: Gestión de Facturación, RF-00.7: Soporte y Asistencia, RF-00.8: Configuración Global de Plataforma (+1 more)

### Community 25 - "Community 25"
Cohesion: 0.22
Nodes (9): 3. Stack Tecnológico, Backend, Base de Datos, code:yaml (Runtime: Node.js 20 LTS), code:yaml (Framework: React 18), code:yaml (Database: PostgreSQL 14+), code:yaml (Version Control: Git), DevOps (Básico para MVP) (+1 more)

### Community 26 - "Community 26"
Cohesion: 0.25
Nodes (6): MenuProps, names, operaciones, procesos, rolesArr, style

### Community 27 - "Community 27"
Cohesion: 0.25
Nodes (8): RF-02.1: Catálogo de Materiales, RF-02.2: Entradas de Inventario, RF-02.3: Salidas de Inventario, RF-02.4: Consulta de Stock, RF-02.5: Alertas de Stock Bajo, RF-02.6: Historial de Movimientos, RF-02.7: Generación de Orden de Compra, RF-02: Gestión de Inventario

### Community 28 - "Community 28"
Cohesion: 0.25
Nodes (8): 5.1 Platform DB (Metadata), 5.2 Tenant DB (Datos del Cliente), 5.3 Datos de Seed (Ejemplo), 5. Base de Datos, code:sql (-- ============================================), code:sql (-- Categorías), code:sql (-- Tabla de tenants), code:sql (INSERT INTO tenants (id, name, subdomain, database_name, pla)

### Community 29 - "Community 29"
Cohesion: 0.25
Nodes (8): ✅ 1. Autenticación, ✅ 2. Gestión de Materiales, ✅ 3. Entradas de Inventario, ✅ 4. Salidas de Inventario, ✅ 5. Consulta de Stock, ✅ 6. Historial de Movimientos, ✅ 7. Alertas, Funcionalidades Implementadas

### Community 30 - "Community 30"
Cohesion: 0.29
Nodes (3): HANDLERS, initialState, WardenContext

### Community 33 - "Community 33"
Cohesion: 0.29
Nodes (7): RF-05.1: Creación de Viajes, RF-05.2: Cálculo Automático de Costos, RF-05.3: Parametrización de Costos, RF-05.4: Seguimiento de Estado de Viaje, RF-05.5: Registro de Gastos Reales, RF-05.6: Análisis de Rentabilidad, RF-05: Control de Viajes y Gastos

### Community 34 - "Community 34"
Cohesion: 0.29
Nodes (7): RF-07.1: Reporte de Inventario, RF-07.2: Reporte de Costos Operativos, RF-07.3: Reporte de Viajes, RF-07.4: Análisis de Rentabilidad por Ruta, RF-07.5: Análisis de Desempeño de Operadores, RF-07.6: Dashboard Ejecutivo, RF-07: Reportes y Analytics

### Community 35 - "Community 35"
Cohesion: 0.29
Nodes (7): 9. Flujos de Usuario, code:block25 (1. Usuario navega a "Movimientos" > "Nueva Entrada"), code:block26 (1. Usuario navega a "Movimientos" > "Nueva Salida"), code:block27 (1. Usuario navega a "Stock"), Flujo 1: Registrar Entrada de Material, Flujo 2: Registrar Salida de Material, Flujo 3: Consultar Stock y Generar Alerta

### Community 36 - "Community 36"
Cohesion: 0.33
Nodes (4): ALL_MODULES, createSchema, editSchema, modalStyle

### Community 37 - "Community 37"
Cohesion: 0.33
Nodes (3): addUserSchema, modalStyle, roleLabel

### Community 38 - "Community 38"
Cohesion: 0.33
Nodes (6): RF-03.1: Registro de Unidades, RF-03.2: Estados de Unidad, RF-03.3: Historial de Mantenimientos, RF-03.4: Programación de Mantenimiento Preventivo, RF-03.5: Rastreo de Ubicación GPS, RF-03: Control de Unidades (Camiones)

### Community 39 - "Community 39"
Cohesion: 0.33
Nodes (6): RF-04.1: Registro de Operadores, RF-04.2: Control de Disponibilidad, RF-04.3: Asignación a Unidades, RF-04.4: Historial de Viajes, RF-04.5: Gestión de Documentación, RF-04: Gestión de Operadores

### Community 40 - "Community 40"
Cohesion: 0.33
Nodes (6): 5. Requisitos Funcionales, RF-08.1: Notificaciones en Plataforma, RF-08.2: Tipos de Notificaciones, RF-08.3: Notificaciones por Email, RF-08.4: Notificaciones SMS/WhatsApp, RF-08: Notificaciones

### Community 41 - "Community 41"
Cohesion: 0.33
Nodes (6): code:bash (# Backend), code:bash (# Crear tenant demo en platform_db), Comandos Útiles, 📝 Notas Finales para Claude Code, Orden de Implementación Sugerido, Testing

### Community 42 - "Community 42"
Cohesion: 0.4
Nodes (5): normalizeOperator(), normalizeRoute(), normalizeTrip(), normalizeTripCostDetail(), normalizeUnit()

### Community 43 - "Community 43"
Cohesion: 0.4
Nodes (5): RF-01.1: Registro y Autenticación, RF-01.2: Gestión de Roles, RF-01.3: Recuperación de Contraseña, RF-01.4: Perfil de Usuario, RF-01: Gestión de Usuarios

### Community 44 - "Community 44"
Cohesion: 0.4
Nodes (5): RF-06.1: Catálogo de Rutas, RF-06.2: Parametrización de Casetas, RF-06.3: Optimización de Rutas, RF-06.4: Rutas sin Básculas, RF-06: Sistema de Rutas

### Community 45 - "Community 45"
Cohesion: 0.4
Nodes (5): 2. Arquitectura del Sistema, Arquitectura Multitenant, code:block1 (┌──────────────────────────────────────────────────┐), code:block2 (1. Usuario accede a: demo.ward.io), Flujo de Request

### Community 46 - "Community 46"
Cohesion: 0.67
Nodes (3): getStockStatus(), statusColorMap, StockLevelBar()

### Community 48 - "Community 48"
Cohesion: 0.83
Nodes (3): Page(), useAlerts(), useOperators()

### Community 50 - "Community 50"
Cohesion: 0.67
Nodes (3): iconMap, OverviewTraffic(), useChartOptions()

### Community 55 - "Community 55"
Cohesion: 0.5
Nodes (4): 10. Criterios de Aceptación, Backend, Frontend, General

## Knowledge Gaps
- **362 isolated node(s):** `ApexChart`, `Chart`, `Scrollbar`, `SeverityPillRoot`, `statusColorMap` (+357 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **29 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Ward app - Product Requirements Document (PRD)` connect `Community 1` to `Community 6`, `Community 7`, `Community 40`, `Community 8`, `Community 13`, `Community 17`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **Why does `5. Requisitos Funcionales` connect `Community 40` to `Community 1`, `Community 33`, `Community 34`, `Community 38`, `Community 39`, `Community 43`, `Community 44`, `Community 24`, `Community 27`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Why does `6. Requisitos No Funcionales` connect `Community 6` to `Community 1`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **What connects `ApexChart`, `Chart`, `Scrollbar` to the rest of the system?**
  _362 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.03 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._