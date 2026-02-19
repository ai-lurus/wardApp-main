# Ward app - Product Requirements Document (PRD)

**Versión:** 1.0  
**Fecha:** Febrero 2026  
**Autor:** Equipo Ward App  
**Estado:** Draft

---

## 📋 Tabla de Contenidos

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Visión y Objetivos](#visión-y-objetivos)
3. [Usuarios y Stakeholders](#usuarios-y-stakeholders)
4. [Casos de Uso](#casos-de-uso)
5. [Requisitos Funcionales](#requisitos-funcionales)
6. [Requisitos No Funcionales](#requisitos-no-funcionales)
7. [Arquitectura y Stack Tecnológico](#arquitectura-y-stack-tecnológico)
8. [Plan de Desarrollo](#plan-de-desarrollo)
9. [Métricas de Éxito](#métricas-de-éxito)
10. [Riesgos y Mitigaciones](#riesgos-y-mitigaciones)

---

## 1. Resumen Ejecutivo

### Descripción del Producto

Ward.io es una plataforma **SaaS multitenant** de gestión logística integral diseñada específicamente para empresas de transporte de carga. El sistema centraliza y automatiza las operaciones críticas del negocio, incluyendo gestión de flotas, control de inventarios, administración de personal operativo y cálculo automático de costos de viaje.

**Modelo de negocio:** SaaS con arquitectura multitenant donde múltiples empresas de transporte comparten la misma infraestructura pero mantienen sus datos completamente aislados y seguros.

### Problema que Resuelve

Las empresas de transporte de carga enfrentan desafíos operativos significativos:

- **Falta de visibilidad:** No tienen claridad sobre costos reales por viaje
- **Gestión manual:** Procesos en papel o Excel propensos a errores
- **Inventario descontrolado:** Pérdida de materiales y falta de trazabilidad
- **Planificación ineficiente:** Asignación subóptima de unidades y operadores
- **Análisis limitado:** Incapacidad para identificar rutas o unidades no rentables

### Propuesta de Valor

Ward.io permite a las empresas de transporte:

✅ **Reducir costos operativos** mediante cálculo automático y análisis de rentabilidad por ruta  
✅ **Optimizar la flota** con asignación inteligente de unidades y operadores  
✅ **Controlar inventarios** con trazabilidad completa de entradas y salidas  
✅ **Tomar decisiones informadas** con reportes y analytics en tiempo real  
✅ **Digitalizar operaciones** eliminando procesos manuales y papel  

### Target Market

- **Primario:** Empresas de transporte de carga terrestre en México (3-50 unidades)
- **Secundario:** Operadores logísticos medianos y grandes
- **Potenciales clientes identificados:** Impala, Trafigura

---

## 2. Visión y Objetivos

### Visión del Producto

*"Ser la plataforma líder de gestión logística para empresas de transporte en América Latina, permitiendo la digitalización y optimización completa de sus operaciones."*

### Objetivos de Negocio

1. **Q2 2026:** Lanzar MVP funcional con primeros 3 clientes piloto
2. **Q3 2026:** Alcanzar 10 empresas activas en la plataforma
3. **Q4 2026:** Demostrar ROI promedio de 15% en reducción de costos operativos
4. **2027:** Expandir a 50+ empresas y añadir integraciones GPS

### Objetivos del Producto (MVP)

| Objetivo | Métrica | Meta |
|----------|---------|------|
| Reducir tiempo de planificación de viajes | Minutos por viaje | De 30 min a 5 min |
| Mejorar precisión de costos | Error en estimación | < 5% de variación |
| Automatizar cálculos | % cálculos manuales | 0% manual |
| Adopción del sistema | % usuarios activos semanales | > 80% |
| Satisfacción de usuario | NPS | > 40 |

---

## 3. Usuarios y Stakeholders

### Arquitectura Multitenant

Ward.io opera como un **SaaS multitenant** con dos niveles de administración:

1. **Nivel Plataforma (Ward.io):**
   - Super Administradores de Ward.io
   - Gestión de clientes (empresas de transporte)
   - Configuración global de la plataforma
   - Panel de administración maestro

2. **Nivel Cliente (Empresa de Transporte):**
   - Administradores de cada empresa
   - Usuarios operativos de cada empresa
   - Datos completamente aislados por tenant
   - Personalización por empresa

---

### Perfiles de Usuario - Nivel Plataforma

#### 3.0 Super Administrador (Ward.io)
- **Rol:** Control total de la plataforma SaaS
- **Necesidades:** Gestionar clientes, configurar módulos por cliente, monitorear uso, facturación
- **Acceso:** Panel de administración maestro
- **Frecuencia de uso:** Alta (diario)
- **Conocimientos técnicos:** Altos
- **Responsabilidades:**
  - Onboarding de nuevos clientes
  - Activar/desactivar módulos por cliente
  - Configuración de planes y pricing
  - Monitoreo de uso y performance
  - Soporte técnico nivel 3
  - Gestión de facturación
  - Análisis de métricas globales

---

### Perfiles de Usuario - Nivel Cliente

#### 3.1 Administrador del Sistema
- **Rol:** Control total de la plataforma
- **Necesidades:** Configurar empresa, gestionar usuarios, definir permisos
- **Frecuencia de uso:** Alta (diario)
- **Conocimientos técnicos:** Medios

#### 3.2 Gerente de Operaciones
- **Rol:** Planificación y supervisión de viajes
- **Necesidades:** Crear viajes, asignar recursos, ver costos, analizar rentabilidad
- **Frecuencia de uso:** Muy alta (múltiples veces al día)
- **Conocimientos técnicos:** Básicos-Medios

#### 3.3 Contador / Gerente Financiero
- **Rol:** Control de costos y análisis financiero
- **Necesidades:** Reportes de gastos, análisis de rentabilidad, exportación de datos
- **Frecuencia de uso:** Media (semanal)
- **Conocimientos técnicos:** Medios

#### 3.4 Jefe de Almacén / Encargado de Inventario
- **Rol:** Control de materiales y repuestos
- **Necesidades:** Registrar entradas/salidas, ver stock, alertas de inventario bajo
- **Frecuencia de uso:** Alta (diario)
- **Conocimientos técnicos:** Básicos

#### 3.5 Jefe de Flota
- **Rol:** Mantenimiento y control de unidades
- **Necesidades:** Estado de camiones, historial de mantenimientos, programación
- **Frecuencia de uso:** Alta (diario)
- **Conocimientos técnicos:** Básicos-Medios

#### 3.6 Operador / Conductor
- **Rol:** Conductor de camiones (acceso futuro)
- **Necesidades:** Ver viajes asignados, reportar incidencias
- **Frecuencia de uso:** Media
- **Conocimientos técnicos:** Básicos

### Matriz de Roles y Permisos

| Funcionalidad | Super Admin | Admin | Gerente Ops | Contador | Almacén | Flota | Operador |
|---------------|-------------|-------|-------------|----------|---------|-------|----------|
| **Panel Maestro** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Gestionar clientes | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Activar/desactivar módulos | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Ver métricas globales | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Nivel Cliente** | ✅ | ✅ | - | - | - | - | - |
| Gestión de usuarios | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Configurar empresa | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Crear/editar viajes | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Ver costos | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| Gestionar inventario | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Gestionar unidades | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| Ver reportes | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Exportar datos | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |

**Nota:** Super Admin tiene acceso completo a todos los clientes. Los demás roles operan solo dentro de su tenant/empresa.

---

## 4. Casos de Uso

### UC-00: Onboarding de Nuevo Cliente (Super Admin)

**Actor:** Super Administrador (Ward.io)  
**Precondición:** Super Admin autenticado en panel maestro  
**Flujo principal:**

1. Super Admin accede al "Panel de Administración Maestro"
2. Hace clic en "Nuevo Cliente"
3. Completa wizard de onboarding:
   - **Paso 1:** Datos de la empresa
     - Nombre: "Transportes Impala"
     - RFC: "TIM850215XX8"
     - Subdomain deseado: "impala"
   - **Paso 2:** Seleccionar plan
     - Selecciona: "Plan Profesional - $899/mes"
   - **Paso 3:** Activar módulos
     - ✅ Inventario
     - ✅ Unidades
     - ✅ Operadores
     - ✅ Viajes y Gastos
     - ✅ Rutas
     - ✅ Reportes Básicos
   - **Paso 4:** Crear primer admin
     - Nombre: "Carlos López"
     - Email: "carlos@impala.com"
     - Se genera contraseña temporal
4. Sistema ejecuta:
   - Crea tenant_id = "impala"
   - **Crea nueva base de datos "tenant_impala" en PostgreSQL**
   - Ejecuta migraciones completas en nueva BD (users, vehicles, trips, etc.)
   - Inserta módulos activos en tabla tenant_modules (en platform_db)
   - Crea usuario admin con rol "Administrador" (en tenant_impala)
   - Guarda info de conexión en platform_db.tenants
   - Inicializa pool de conexiones para tenant_impala
   - Envía email a carlos@impala.com con credenciales
5. Super Admin ve confirmación: "Cliente creado exitosamente"
6. Cliente "Transportes Impala" aparece en lista de clientes

**Postcondición:** Nuevo cliente puede acceder a `impala.ward.io` con sus credenciales  
**Valor:** Onboarding automatizado permite escalar rápidamente a nuevos clientes

---

### UC-01: Planificar y Crear Viaje

**Actor:** Gerente de Operaciones  
**Precondición:** Usuario autenticado, rutas y unidades configuradas  
**Flujo principal:**

1. Usuario accede al módulo "Viajes"
2. Hace clic en "Nuevo Viaje"
3. Selecciona ruta del dropdown (ej: "Manzanillo - Guadalajara")
   - Sistema muestra distancia: 310 km
4. Selecciona unidad disponible (ej: "Unidad-101 - Full, 3 ejes")
5. Selecciona operador disponible (ej: "Juan Pérez")
6. Sistema calcula automáticamente:
   - Casetas: $850 (según tipo unidad y ejes)
   - Combustible: 155 litros × $26.8 = $4,154
   - Seguro prorrateado: $400
   - **Total estimado: $5,404**
7. Usuario confirma el viaje
8. Sistema crea viaje y actualiza disponibilidad de unidad/operador

**Postcondición:** Viaje creado con costos calculados, unidad y operador asignados  
**Flujos alternativos:**
- 4a. No hay unidades disponibles → Sistema muestra mensaje de error
- 5a. No hay operadores disponibles → Sistema sugiere operadores en descanso próximos a estar disponibles

---

### UC-02: Controlar Inventario de Materiales

**Actor:** Jefe de Almacén  
**Precondición:** Usuario autenticado con permisos de inventario  
**Flujo principal:**

1. Usuario accede a "Inventario"
2. Hace clic en "Registrar Entrada"
3. Selecciona tipo de material: "Llantas"
4. Ingresa cantidad: 8 unidades
5. Ingresa costo unitario: $5,500
6. Ingresa proveedor: "Llantas del Pacífico"
7. Adjunta factura (opcional)
8. Sistema actualiza stock y registra movimiento con timestamp
9. Sistema genera entrada en historial

**Postcondición:** Stock actualizado, movimiento registrado  
**Flujos alternativos:**
- 8a. Stock alcanza nivel mínimo → Sistema genera alerta
- 3a. Usuario selecciona "Registrar Salida" → Asocia material a unidad o viaje específico

---

### UC-03: Analizar Rentabilidad por Ruta

**Actor:** Contador / Gerente Financiero  
**Precondición:** Existen viajes completados en el sistema  
**Flujo principal:**

1. Usuario accede a "Reportes" → "Análisis de Rutas"
2. Selecciona período: "Último mes"
3. Sistema muestra tabla con rutas:
   - Manzanillo - Guadalajara: 45 viajes, Costo promedio $5,200, Ingreso promedio $8,500
   - Guadalajara - San Marcos: 30 viajes, Costo promedio $3,800, Ingreso promedio $6,200
4. Usuario hace clic en "Manzanillo - Guadalajara"
5. Sistema muestra desglose detallado:
   - Casetas: 35%
   - Combustible: 52%
   - Seguro: 8%
   - Otros: 5%
6. Usuario exporta reporte a Excel

**Postcondición:** Reporte generado y descargado  
**Valor:** Identifica rutas más y menos rentables para toma de decisiones

---

### UC-04: Gestionar Mantenimiento de Flota

**Actor:** Jefe de Flota  
**Precondición:** Usuario autenticado, unidades registradas  
**Flujo principal:**

1. Usuario accede a "Unidades"
2. Filtra unidades por estado: "Requiere Mantenimiento"
3. Selecciona "Unidad-105"
4. Sistema muestra:
   - Último mantenimiento: Hace 45 días
   - Kilómetros desde último servicio: 8,500 km
   - Próximo servicio programado: En 15 días
5. Usuario hace clic en "Registrar Mantenimiento"
6. Selecciona tipo: "Cambio de aceite y filtros"
7. Ingresa costo: $3,200
8. Adjunta factura de taller
9. Sistema actualiza historial y cambia estado a "Disponible"

**Postcondición:** Mantenimiento registrado, unidad disponible  
**Flujos alternativos:**
- 4a. Kilómetros exceden límite → Sistema marca como "Mantenimiento Urgente"

---

### UC-05: Optimizar Asignación de Recursos

**Actor:** Gerente de Operaciones  
**Precondición:** Múltiples viajes por asignar  
**Flujo principal:**

1. Usuario accede a "Dashboard de Operaciones"
2. Ve lista de viajes pendientes de asignación (5 viajes)
3. Sistema muestra recomendaciones:
   - Viaje A (Manzanillo-GDL): Unidad-102 (Full, disponible, rendimiento óptimo)
   - Viaje B (GDL-San Marcos): Unidad-107 (Sencillo, en ruta cercana)
4. Usuario revisa disponibilidad de operadores
5. Sistema resalta operadores con mejor desempeño en cada ruta
6. Usuario asigna recursos según recomendaciones
7. Sistema optimiza secuencia de viajes

**Postcondición:** Viajes asignados optimizando utilización de flota  
**Valor:** Reduce tiempos muertos y maximiza eficiencia operativa

---

## 5. Requisitos Funcionales

### RF-00: Panel de Administración Maestro (Super Admin)

#### RF-00.1: Gestión de Clientes/Tenants
- **Prioridad:** Alta (MVP)
- **Descripción:** Super Admin puede administrar empresas de transporte en la plataforma
- **Criterios de aceptación:**
  - [ ] Super Admin puede crear nuevo cliente/tenant
  - [ ] Cada cliente tiene: nombre empresa, subdomain único, plan asignado, fecha de registro
  - [ ] Super Admin puede activar/desactivar clientes
  - [ ] **Sistema crea base de datos dedicada por tenant (ej: tenant_impala)**
  - [ ] Sistema ejecuta migraciones automáticamente en nueva BD
  - [ ] Vista de lista de todos los clientes con filtros y búsqueda
  - [ ] Super Admin puede ver detalles de cada cliente
  - [ ] Información de conexión a BD se guarda en platform_db
  - [ ] Pool de conexiones se crea automáticamente para nuevo tenant

#### RF-00.2: Gestión de Módulos por Cliente
- **Prioridad:** Alta (MVP)
- **Descripción:** Activar/desactivar módulos específicos para cada cliente
- **Módulos configurables:**
  - ✅ Gestión de Usuarios (siempre activo)
  - ⚙️ Gestión de Inventario
  - ⚙️ Control de Unidades
  - ⚙️ Gestión de Operadores
  - ⚙️ Control de Viajes y Gastos
  - ⚙️ Sistema de Rutas
  - ⚙️ Reportes y Analytics
  - ⚙️ Notificaciones

- **Criterios de aceptación:**
  - [ ] Super Admin ve tabla de clientes con módulos activos/inactivos
  - [ ] Super Admin puede activar/desactivar módulos con un clic
  - [ ] Cambios se reflejan inmediatamente en la interfaz del cliente
  - [ ] Cliente solo ve módulos activados en su menú
  - [ ] Sistema registra historial de cambios de módulos

#### RF-00.3: Configuración de Planes y Pricing
- **Prioridad:** Media
- **Descripción:** Gestionar planes de suscripción por cliente
- **Planes iniciales:**
  - **Básico:** Inventario + Unidades + Operadores
  - **Profesional:** Básico + Viajes + Rutas + Reportes Básicos
  - **Empresarial:** Todo incluido + Analytics Avanzado + Notificaciones

- **Criterios de aceptación:**
  - [ ] Super Admin puede asignar plan a cada cliente
  - [ ] Plan determina módulos disponibles automáticamente
  - [ ] Super Admin puede crear planes personalizados
  - [ ] Sistema muestra costo mensual por cliente
  - [ ] Clientes pueden ver su plan actual en configuración

#### RF-00.4: Monitoreo de Uso y Métricas
- **Prioridad:** Media
- **Descripción:** Dashboard de métricas globales de la plataforma
- **Métricas a mostrar:**
  - Total de clientes activos
  - Total de usuarios por cliente
  - Total de viajes gestionados (global)
  - Clientes más activos (por uso)
  - Módulos más utilizados
  - Tasa de retención de clientes
  - Ingresos mensuales recurrentes (MRR)

- **Criterios de aceptación:**
  - [ ] Dashboard muestra métricas en tiempo real
  - [ ] Super Admin puede filtrar por rango de fechas
  - [ ] Gráficos de tendencias de crecimiento
  - [ ] Exportación de reportes globales

#### RF-00.5: Onboarding de Nuevos Clientes
- **Prioridad:** Alta (MVP)
- **Descripción:** Proceso guiado para dar de alta nuevos clientes
- **Flujo de onboarding:**
  1. Crear cliente en panel maestro
  2. Asignar plan
  3. Activar módulos
  4. Crear primer usuario Admin del cliente
  5. Enviar credenciales de acceso
  6. Cliente completa configuración inicial

- **Criterios de aceptación:**
  - [ ] Wizard paso a paso para crear cliente
  - [ ] Validación de datos en cada paso
  - [ ] Email automático con credenciales al admin del cliente
  - [ ] Template de configuración inicial
  - [ ] Datos de ejemplo (opcional) para testing

#### RF-00.6: Gestión de Facturación
- **Prioridad:** Baja (Post-MVP)
- **Descripción:** Control de pagos y facturación por cliente
- **Criterios de aceptación:**
  - [ ] Super Admin ve estado de pago de cada cliente
  - [ ] Sistema genera facturas automáticas mensualmente
  - [ ] Integración con pasarela de pago (Stripe/PayPal)
  - [ ] Clientes morosos se marcan con alerta
  - [ ] Opción de suspender cliente por falta de pago

#### RF-00.7: Soporte y Asistencia
- **Prioridad:** Media
- **Descripción:** Sistema de tickets de soporte
- **Criterios de aceptación:**
  - [ ] Clientes pueden crear tickets desde su panel
  - [ ] Super Admin ve todos los tickets en panel maestro
  - [ ] Sistema de priorización (Baja, Media, Alta, Crítica)
  - [ ] Estados: Nuevo, En Proceso, Resuelto, Cerrado
  - [ ] Super Admin puede responder tickets
  - [ ] Historial de comunicación por ticket

#### RF-00.8: Configuración Global de Plataforma
- **Prioridad:** Media
- **Descripción:** Parámetros globales que afectan a todos los clientes
- **Configuraciones:**
  - Mantenimiento programado
  - Anuncios para todos los clientes
  - Features flags (activar/desactivar funcionalidades beta)
  - Configuración de SMTP para emails
  - Límites globales (max usuarios por cliente, max viajes, etc.)

- **Criterios de aceptación:**
  - [ ] Panel de configuración global
  - [ ] Cambios requieren confirmación
  - [ ] Notificación a clientes de cambios importantes
  - [ ] Historial de cambios de configuración

---

### RF-01: Gestión de Usuarios

#### RF-01.1: Registro y Autenticación
- **Prioridad:** Alta (MVP)
- **Descripción:** El sistema debe permitir registro de usuarios con email y contraseña
- **Criterios de aceptación:**
  - [ ] Usuario puede crear cuenta con email único
  - [ ] Contraseña debe tener mínimo 8 caracteres, 1 mayúscula, 1 número
  - [ ] Sistema envía email de verificación
  - [ ] Usuario puede iniciar sesión con credenciales válidas
  - [ ] Sistema mantiene sesión por 24 horas
  - [ ] Usuario puede cerrar sesión

#### RF-01.2: Gestión de Roles
- **Prioridad:** Alta (MVP)
- **Descripción:** El sistema debe implementar 6 roles con permisos diferenciados
- **Roles:** Admin, Gerente Operaciones, Contador, Encargado Almacén, Jefe Flota, Operador
- **Criterios de aceptación:**
  - [ ] Admin puede crear y asignar roles a usuarios
  - [ ] Sistema restringe acceso a módulos según rol
  - [ ] Usuario solo ve funcionalidades permitidas
  - [ ] Sistema registra cambios de rol en auditoría

#### RF-01.3: Recuperación de Contraseña
- **Prioridad:** Media
- **Descripción:** Usuario debe poder restablecer contraseña olvidada
- **Criterios de aceptación:**
  - [ ] Sistema envía link de recuperación a email
  - [ ] Link expira después de 1 hora
  - [ ] Usuario puede crear nueva contraseña

#### RF-01.4: Perfil de Usuario
- **Prioridad:** Media
- **Descripción:** Usuario puede editar su información personal
- **Criterios de aceptación:**
  - [ ] Usuario puede editar nombre, teléfono, foto
  - [ ] Cambios se reflejan inmediatamente
  - [ ] Email no es editable (requiere verificación)

---

### RF-02: Gestión de Inventario

#### RF-02.1: Catálogo de Materiales
- **Prioridad:** Alta (MVP)
- **Descripción:** Sistema debe mantener catálogo de materiales con categorías
- **Categorías:** Llantas, Bolsas/Empaques, Balatas, Filtros, Diesel, Otros
- **Criterios de aceptación:**
  - [ ] Admin puede crear nuevos tipos de materiales
  - [ ] Cada material tiene: nombre, categoría, unidad de medida, precio referencia
  - [ ] Sistema permite editar y desactivar materiales

#### RF-02.2: Entradas de Inventario
- **Prioridad:** Alta (MVP)
- **Descripción:** Registrar entradas de materiales al almacén
- **Criterios de aceptación:**
  - [ ] Usuario puede registrar entrada con: material, cantidad, costo, proveedor, fecha
  - [ ] Sistema actualiza stock automáticamente
  - [ ] Usuario puede adjuntar factura (PDF)
  - [ ] Sistema genera folio único de entrada
  - [ ] Entrada queda registrada en historial

#### RF-02.3: Salidas de Inventario
- **Prioridad:** Alta (MVP)
- **Descripción:** Registrar salidas de materiales del almacén
- **Criterios de aceptación:**
  - [ ] Usuario puede registrar salida con: material, cantidad, motivo, destino
  - [ ] Sistema valida que existe stock suficiente
  - [ ] Usuario asocia salida a unidad o viaje específico
  - [ ] Sistema genera folio único de salida
  - [ ] Stock se actualiza automáticamente

#### RF-02.4: Consulta de Stock
- **Prioridad:** Alta (MVP)
- **Descripción:** Ver existencias actuales de inventario
- **Criterios de aceptación:**
  - [ ] Usuario ve lista de materiales con stock actual
  - [ ] Sistema muestra valor total de inventario
  - [ ] Usuario puede filtrar por categoría
  - [ ] Sistema resalta materiales con stock bajo

#### RF-02.5: Alertas de Stock Bajo
- **Prioridad:** Media
- **Descripción:** Notificar cuando stock alcance nivel mínimo
- **Criterios de aceptación:**
  - [ ] Admin configura nivel mínimo por material
  - [ ] Sistema genera alerta cuando stock < nivel mínimo
  - [ ] Notificación aparece en dashboard y se envía por email
  - [ ] Usuario puede marcar alerta como "vista"

#### RF-02.6: Historial de Movimientos
- **Prioridad:** Alta (MVP)
- **Descripción:** Registro completo de entradas y salidas
- **Criterios de aceptación:**
  - [ ] Sistema muestra todos los movimientos con timestamp
  - [ ] Usuario puede filtrar por tipo (entrada/salida), fecha, material
  - [ ] Cada movimiento muestra: usuario responsable, cantidad, destino/origen
  - [ ] Historial es inmutable (no editable)

#### RF-02.7: Generación de Orden de Compra
- **Prioridad:** Baja (Post-MVP)
- **Descripción:** Crear órdenes de compra para proveedores
- **Criterios de aceptación:**
  - [ ] Usuario puede crear orden con materiales y cantidades
  - [ ] Sistema sugiere proveedores favoritos
  - [ ] Usuario puede establecer fecha de pago
  - [ ] Orden se puede exportar a PDF

---

### RF-03: Control de Unidades (Camiones)

#### RF-03.1: Registro de Unidades
- **Prioridad:** Alta (MVP)
- **Descripción:** Administrar catálogo de camiones de la flota
- **Criterios de aceptación:**
  - [ ] Admin puede registrar unidad con: placa, tipo (Full/Sencillo), número de ejes
  - [ ] Sistema asigna ID único a cada unidad
  - [ ] Unidad tiene atributos: año, modelo de motor, kilometraje actual
  - [ ] Sistema valida que placa sea única

#### RF-03.2: Estados de Unidad
- **Prioridad:** Alta (MVP)
- **Descripción:** Control de disponibilidad de camiones
- **Estados:** Disponible, En Viaje, Mantenimiento, Fuera de Servicio
- **Criterios de aceptación:**
  - [ ] Sistema actualiza estado automáticamente al asignar a viaje
  - [ ] Usuario puede cambiar estado manualmente (ej: enviar a mantenimiento)
  - [ ] Dashboard muestra distribución de unidades por estado
  - [ ] Solo unidades "Disponibles" se pueden asignar a nuevos viajes

#### RF-03.3: Historial de Mantenimientos
- **Prioridad:** Media
- **Descripción:** Registro de servicios y reparaciones por unidad
- **Criterios de aceptación:**
  - [ ] Usuario puede registrar mantenimiento con: tipo, costo, fecha, taller
  - [ ] Sistema muestra historial completo por unidad
  - [ ] Usuario puede adjuntar facturas
  - [ ] Sistema calcula días y km desde último servicio

#### RF-03.4: Programación de Mantenimiento Preventivo
- **Prioridad:** Baja (Post-MVP)
- **Descripción:** Alertas de mantenimiento programado
- **Criterios de aceptación:**
  - [ ] Admin configura intervalos por tipo de servicio (cada X km o Y días)
  - [ ] Sistema genera alerta cuando se acerca fecha de servicio
  - [ ] Dashboard muestra próximos mantenimientos programados

#### RF-03.5: Rastreo de Ubicación GPS
- **Prioridad:** Baja (Fase Futura)
- **Descripción:** Seguimiento en tiempo real de unidades
- **Criterios de aceptación:**
  - [ ] Sistema muestra ubicación actual en mapa
  - [ ] Usuario puede ver ruta recorrida
  - [ ] Sistema alerta si unidad se desvía de ruta

---

### RF-04: Gestión de Operadores

#### RF-04.1: Registro de Operadores
- **Prioridad:** Alta (MVP)
- **Descripción:** Administrar información de conductores
- **Criterios de aceptación:**
  - [ ] Admin puede registrar operador con: nombre, contacto, licencia
  - [ ] Sistema valida número de licencia único
  - [ ] Operador tiene: fecha de ingreso, experiencia, rutas autorizadas
  - [ ] Sistema almacena foto de licencia

#### RF-04.2: Control de Disponibilidad
- **Prioridad:** Alta (MVP)
- **Descripción:** Gestionar estado de operadores
- **Estados:** Disponible, En Viaje, Descanso, Castigado, Inactivo
- **Criterios de aceptación:**
  - [ ] Sistema actualiza estado automáticamente al asignar viaje
  - [ ] Operador en "Descanso" no se puede asignar
  - [ ] Sistema registra fecha de fin de descanso o castigo
  - [ ] Dashboard muestra operadores disponibles

#### RF-04.3: Asignación a Unidades
- **Prioridad:** Alta (MVP)
- **Descripción:** Vincular operador con camión
- **Criterios de aceptación:**
  - [ ] Sistema permite asignar operador a unidad para un viaje
  - [ ] Un operador solo puede estar asignado a una unidad a la vez
  - [ ] Sistema valida que operador esté autorizado para la ruta
  - [ ] Historial muestra todas las unidades manejadas por operador

#### RF-04.4: Historial de Viajes
- **Prioridad:** Media
- **Descripción:** Registro de viajes realizados por operador
- **Criterios de aceptación:**
  - [ ] Sistema muestra todos los viajes del operador
  - [ ] Usuario puede filtrar por ruta, fecha, unidad
  - [ ] Sistema calcula total de km recorridos
  - [ ] Reporte muestra desempeño (viajes a tiempo, incidencias)

#### RF-04.5: Gestión de Documentación
- **Prioridad:** Media
- **Descripción:** Control de vigencia de documentos
- **Criterios de aceptación:**
  - [ ] Sistema almacena: licencia, exámenes médicos, cursos
  - [ ] Sistema alerta cuando documento está próximo a vencer (30 días antes)
  - [ ] Operador con documentos vencidos no se puede asignar

---

### RF-05: Control de Viajes y Gastos

#### RF-05.1: Creación de Viajes
- **Prioridad:** Alta (MVP)
- **Descripción:** Registrar nuevo viaje con asignación de recursos
- **Criterios de aceptación:**
  - [ ] Usuario selecciona ruta (dropdown con rutas preconfiguradas)
  - [ ] Usuario selecciona unidad disponible
  - [ ] Usuario selecciona operador disponible
  - [ ] Usuario puede ingresar fecha/hora estimada de salida
  - [ ] Usuario puede agregar notas o instrucciones especiales
  - [ ] Sistema valida que recursos estén disponibles
  - [ ] Sistema crea viaje y actualiza estados

#### RF-05.2: Cálculo Automático de Costos
- **Prioridad:** Alta (MVP)
- **Descripción:** Sistema calcula automáticamente gastos del viaje
- **Componentes de costo:**
  1. **Casetas:** Según tipo de unidad y número de ejes
  2. **Combustible:** (Distancia / 100) × 50 litros × Precio/litro
  3. **Seguro:** 80,000 / Viajes anuales estimados
  4. **Otros:** Lavado, mantenimiento, gastos varios

- **Criterios de aceptación:**
  - [ ] Sistema calcula casetas según parametrización de ruta
  - [ ] Combustible usa rendimiento estándar de 50 L/100 km
  - [ ] Precio de diesel es actualizable (configuración global)
  - [ ] Seguro se prorratea automáticamente
  - [ ] Usuario puede agregar gastos adicionales manualmente
  - [ ] Sistema muestra desglose detallado de costos
  - [ ] Total de costo se actualiza automáticamente

#### RF-05.3: Parametrización de Costos
- **Prioridad:** Alta (MVP)
- **Descripción:** Admin puede configurar costos base
- **Criterios de aceptación:**
  - [ ] Admin configura precio de diesel por litro
  - [ ] Admin configura costo de seguro anual
  - [ ] Admin configura cantidad estimada de viajes anuales
  - [ ] Admin configura tarifa de casetas por ruta y tipo de unidad
  - [ ] Cambios en parámetros afectan solo viajes nuevos

#### RF-05.4: Seguimiento de Estado de Viaje
- **Prioridad:** Media
- **Descripción:** Actualizar status del viaje
- **Estados:** Programado, En Curso, Completado, Cancelado
- **Criterios de aceptación:**
  - [ ] Usuario puede cambiar estado del viaje
  - [ ] Sistema registra timestamp de cada cambio
  - [ ] Al completar viaje, usuario ingresa costos reales vs estimados
  - [ ] Sistema libera unidad y operador automáticamente

#### RF-05.5: Registro de Gastos Reales
- **Prioridad:** Media
- **Descripción:** Comparar gastos estimados vs reales
- **Criterios de aceptación:**
  - [ ] Usuario puede ingresar gastos reales al finalizar viaje
  - [ ] Sistema compara estimado vs real
  - [ ] Sistema muestra variación porcentual
  - [ ] Usuario puede adjuntar recibos/facturas

#### RF-05.6: Análisis de Rentabilidad
- **Prioridad:** Media
- **Descripción:** Calcular ganancia por viaje
- **Criterios de aceptación:**
  - [ ] Usuario ingresa ingreso obtenido por viaje
  - [ ] Sistema calcula: Utilidad = Ingreso - Costos
  - [ ] Sistema muestra margen de ganancia %
  - [ ] Reporte compara rentabilidad entre viajes

---

### RF-06: Sistema de Rutas

#### RF-06.1: Catálogo de Rutas
- **Prioridad:** Alta (MVP)
- **Descripción:** Gestionar rutas operativas principales
- **Rutas iniciales:**
  - Manzanillo - Guadalajara (310 km)
  - Guadalajara - San Marcos (150 km)
  - Manzanillo - Cd. Guzmán (250 km)

- **Criterios de aceptación:**
  - [ ] Admin puede crear nueva ruta con: nombre, origen, destino, distancia
  - [ ] Ruta tiene costos de casetas por tipo de unidad (Full 2/3/4 ejes, Sencillo 2/3 ejes)
  - [ ] Ruta tiene tiempo estimado de viaje
  - [ ] Sistema permite editar y desactivar rutas

#### RF-06.2: Parametrización de Casetas
- **Prioridad:** Alta (MVP)
- **Descripción:** Configurar tarifas de peaje por ruta
- **Criterios de aceptación:**
  - [ ] Admin ingresa costo de caseta por tipo de unidad
  - [ ] Sistema diferencia tarifas por número de ejes
  - [ ] Ejemplo: Ruta Manzanillo-GDL:
    - Full 2 ejes: $680
    - Full 3 ejes: $850
    - Full 4 ejes: $1,020
    - Sencillo 2 ejes: $450
    - Sencillo 3 ejes: $550
  - [ ] Tarifas son actualizables

#### RF-06.3: Optimización de Rutas
- **Prioridad:** Baja (Post-MVP)
- **Descripción:** Sugerir ruta más económica
- **Criterios de aceptación:**
  - [ ] Sistema compara múltiples rutas para mismo destino
  - [ ] Sistema considera: casetas, distancia, tiempo
  - [ ] Sistema recomienda ruta óptima según criterio (costo, tiempo)

#### RF-06.4: Rutas sin Básculas
- **Prioridad:** Baja (Fase Futura)
- **Descripción:** Identificar rutas alternativas que eviten básculas
- **Criterios de aceptación:**
  - [ ] Sistema marca rutas que evitan controles de peso
  - [ ] Usuario puede filtrar solo rutas sin básculas

---

### RF-07: Reportes y Analytics

#### RF-07.1: Reporte de Inventario
- **Prioridad:** Alta (MVP)
- **Descripción:** Estado actual y movimientos de inventario
- **Criterios de aceptación:**
  - [ ] Muestra stock actual por material
  - [ ] Muestra valor total de inventario
  - [ ] Filtra por categoría y rango de fechas
  - [ ] Muestra entradas y salidas en período
  - [ ] Exporta a Excel y PDF

#### RF-07.2: Reporte de Costos Operativos
- **Prioridad:** Alta (MVP)
- **Descripción:** Análisis detallado de gastos
- **Criterios de aceptación:**
  - [ ] Desglose de costos por categoría (casetas, combustible, seguro, etc.)
  - [ ] Filtra por rango de fechas
  - [ ] Compara período actual vs anterior
  - [ ] Muestra gráfico de distribución de gastos
  - [ ] Exporta a Excel y PDF

#### RF-07.3: Reporte de Viajes
- **Prioridad:** Alta (MVP)
- **Descripción:** Resumen de viajes realizados
- **Criterios de aceptación:**
  - [ ] Lista de todos los viajes con: ruta, unidad, operador, fecha, costo
  - [ ] Filtra por: ruta, operador, unidad, rango de fechas, estado
  - [ ] Muestra totales: cantidad de viajes, costos totales, ingresos totales
  - [ ] Exporta a Excel y PDF

#### RF-07.4: Análisis de Rentabilidad por Ruta
- **Prioridad:** Alta (MVP)
- **Descripción:** Comparación de rentabilidad entre rutas
- **Criterios de aceptación:**
  - [ ] Tabla con: ruta, # viajes, costo promedio, ingreso promedio, utilidad promedio
  - [ ] Gráfico comparativo de rentabilidad
  - [ ] Identifica ruta más y menos rentable
  - [ ] Muestra tendencia de rentabilidad en el tiempo

#### RF-07.5: Análisis de Desempeño de Operadores
- **Prioridad:** Media
- **Descripción:** Productividad y eficiencia de conductores
- **Criterios de aceptación:**
  - [ ] Tabla con: operador, # viajes, km recorridos, viajes a tiempo, incidencias
  - [ ] Ranking de operadores por desempeño
  - [ ] Filtra por período

#### RF-07.6: Dashboard Ejecutivo
- **Prioridad:** Media
- **Descripción:** Vista general de KPIs operativos
- **Criterios de aceptación:**
  - [ ] Muestra: total viajes del mes, costos totales, ingresos, utilidad
  - [ ] Estado de flota (disponibles, en viaje, mantenimiento)
  - [ ] Top 5 rutas más usadas
  - [ ] Alertas críticas (stock bajo, mantenimientos pendientes)
  - [ ] Gráficos de tendencias

---

### RF-08: Notificaciones

#### RF-08.1: Notificaciones en Plataforma
- **Prioridad:** Media
- **Descripción:** Sistema de alertas dentro de la aplicación
- **Criterios de aceptación:**
  - [ ] Usuario ve icono de notificaciones con contador
  - [ ] Al hacer clic, se despliega lista de notificaciones
  - [ ] Notificación muestra: título, mensaje, timestamp
  - [ ] Usuario puede marcar como leída
  - [ ] Notificaciones no leídas se destacan

#### RF-08.2: Tipos de Notificaciones
- **Prioridad:** Media
- **Descripción:** Eventos que generan notificaciones
- **Eventos:**
  - Stock de material alcanza nivel mínimo
  - Documento de operador próximo a vencer
  - Mantenimiento de unidad programado
  - Viaje asignado (para operador)
  - Viaje completado
  - Cambio en estado de viaje

- **Criterios de aceptación:**
  - [ ] Sistema genera notificación automáticamente al ocurrir evento
  - [ ] Notificación se envía solo a usuarios con permisos relevantes
  - [ ] Sistema registra todas las notificaciones enviadas

#### RF-08.3: Notificaciones por Email
- **Prioridad:** Baja (Post-MVP)
- **Descripción:** Envío de alertas críticas por correo
- **Criterios de aceptación:**
  - [ ] Usuario configura preferencias de notificaciones
  - [ ] Sistema envía email para alertas críticas
  - [ ] Email contiene link directo a la sección relevante

#### RF-08.4: Notificaciones SMS/WhatsApp
- **Prioridad:** Baja (Fase Futura)
- **Descripción:** Alertas urgentes por mensaje de texto
- **Criterios de aceptación:**
  - [ ] Sistema envía SMS para alertas urgentes
  - [ ] Integración con WhatsApp Business API

---

## 6. Requisitos No Funcionales

### RNF-01: Seguridad

#### RNF-01.1: Autenticación y Autorización
- Contraseñas deben ser hasheadas con bcrypt (salt rounds ≥ 10)
- Implementar JWT para manejo de sesiones
- Tokens expiran después de 24 horas de inactividad
- Implementar refresh tokens para renovación automática
- Rate limiting en endpoints de login (máx 5 intentos por minuto)

#### RNF-01.2: Protección de Datos
- Conexiones HTTPS obligatorias (TLS 1.2+)
- Encriptación de datos sensibles en BD (AES-256)
- Sanitización de inputs para prevenir SQL Injection y XSS
- CORS configurado para dominios específicos
- Headers de seguridad (CSP, X-Frame-Options, etc.)

#### RNF-01.3: Aislamiento de Tenants (Multi-tenancy Security)
- **CRÍTICO:** Validación de tenant_id en TODAS las conexiones a BD
- Uso de Connection Pool dedicado por tenant
- Prevención de tenant jumping (conexión a BD incorrecta)
- **Aislamiento físico total: cada tenant tiene su propia base de datos**
- Testing exhaustivo de aislamiento entre tenants
- Auditoría de accesos cross-tenant (debe ser 0)
- Rate limiting por tenant (prevenir abuso de recursos)
- Credenciales de BD únicas por tenant (opcional para mayor seguridad)

#### RNF-01.4: Auditoría
- Registro de todas las acciones críticas (log de auditoría)
- Logs incluyen: usuario, acción, timestamp, IP
- Logs son inmutables
- Retención de logs por mínimo 1 año

---

### RNF-02: Performance

#### RNF-02.1: Tiempos de Respuesta
- Páginas deben cargar en < 2 segundos (carga inicial)
- Operaciones CRUD en < 500 ms
- Reportes simples en < 3 segundos
- Reportes complejos en < 10 segundos

#### RNF-02.2: Escalabilidad
- Arquitectura preparada para soportar:
  - 100 usuarios concurrentes (MVP)
  - 500 usuarios concurrentes (Año 1)
  - 5,000 viajes por mes (MVP)
  - 50,000 viajes por mes (Año 1)
- Base de datos optimizada con índices en campos frecuentes
- Caché para consultas repetitivas (Redis recomendado)

#### RNF-02.3: Disponibilidad
- Uptime objetivo: 99.5% (máx 3.6 horas downtime/mes)
- Backups automáticos diarios
- Plan de recuperación ante desastres (RPO: 24h, RTO: 4h)

---

### RNF-03: Usabilidad

#### RNF-03.1: Interfaz de Usuario
- Diseño responsive (móvil, tablet, desktop)
- Navegación intuitiva con máximo 3 clics para cualquier función
- Mensajes de error claros y accionables
- Feedback visual en todas las acciones (spinners, confirmaciones)

#### RNF-03.2: Accesibilidad
- Cumplimiento WCAG 2.1 Nivel AA (objetivo)
- Soporte para lectores de pantalla
- Contraste de color adecuado (mínimo 4.5:1)
- Navegación por teclado

#### RNF-03.3: Experiencia de Usuario
- Onboarding para nuevos usuarios (tour guiado)
- Tooltips en campos complejos
- Confirmación antes de acciones destructivas (eliminar, cancelar viaje)
- Modo offline limitado (futuro)

---

### RNF-04: Compatibilidad

#### RNF-04.1: Navegadores
- Chrome (últimas 2 versiones)
- Firefox (últimas 2 versiones)
- Safari (últimas 2 versiones)
- Edge (últimas 2 versiones)

#### RNF-04.2: Dispositivos
- Escritorio: Windows 10+, macOS 10.15+
- Móvil: iOS 14+, Android 10+
- Tablet: iPad OS 14+, Android tablets

#### RNF-04.3: Resoluciones
- Desktop: 1280x720 mínimo
- Tablet: 768x1024
- Mobile: 375x667 mínimo

---

### RNF-05: Mantenibilidad

#### RNF-05.1: Código
- Código documentado (JSDoc, comentarios en lógica compleja)
- Arquitectura modular y desacoplada
- Cobertura de pruebas: mínimo 70%
- Linter configurado (ESLint, Prettier)

#### RNF-05.2: Despliegue
- CI/CD pipeline automatizado
- Ambientes separados: Desarrollo, Staging, Producción
- Rollback automático en caso de fallo
- Monitoreo de errores (Sentry o similar)

---

## 7. Arquitectura y Stack Tecnológico

### Arquitectura Propuesta (SaaS Multitenant)

```
┌─────────────────────────────────────────────────────────────────────┐
│                        NIVEL PLATAFORMA                             │
│                    PANEL SUPER ADMIN (Ward.io)                      │
│  - Gestión de Clientes/Tenants                                     │
│  - Activación de Módulos                                            │
│  - Métricas Globales                                                │
│  - Facturación                                                      │
└────────────────────────────┬────────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────────┐
│                      FRONTEND (SPA Multi-tenant)                    │
│       React 18 + TypeScript + TailwindCSS + Zustand                │
│                                                                      │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐ │
│  │ Cliente A        │  │ Cliente B        │  │ Cliente N        │ │
│  │ (tenant_id: 001) │  │ (tenant_id: 002) │  │ (tenant_id: NNN) │ │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘ │
└────────────────────────────┬────────────────────────────────────────┘
                             │ REST API (HTTPS)
┌────────────────────────────▼────────────────────────────────────────┐
│                   BACKEND (API Server - Multi-tenant)               │
│               Node.js + Express.js + TypeScript                     │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │            TENANT ISOLATION MIDDLEWARE                       │  │
│  │  - Identifica tenant por: subdomain / header / JWT          │  │
│  │  - Inyecta tenant_id en contexto de request                 │  │
│  │  - Selecciona conexión a BD correcta por tenant             │  │
│  │  - Valida permisos de módulos por tenant                    │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │            DATABASE CONNECTION POOL MANAGER                  │  │
│  │  - Pool de conexiones por tenant                            │  │
│  │  - Lazy loading de conexiones (solo si tenant activo)       │  │
│  │  - Cache de conexiones frecuentes                           │  │
│  │  - Cierre automático de conexiones inactivas                │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │ Auth Service │  │ User Service │  │ Trip Service │             │
│  │ (multi-tenant)│  │ (multi-tenant)│  │ (multi-tenant)│           │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │ Fleet Svc    │  │ Inventory Svc│  │ Report Svc   │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │            TENANT MODULE AUTHORIZATION                       │  │
│  │  - Verifica módulos activos para el tenant                  │  │
│  │  - Bloquea acceso a módulos desactivados                    │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────────┐
│                   DATABASE LAYER (Multi-tenant)                     │
│              PostgreSQL 14+ - Database per Tenant                   │
│                                                                      │
│  ESTRATEGIA: Database-per-tenant (Aislamiento TOTAL)               │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Database: platform_db (Metadata de plataforma)             │   │
│  │    - tenants (id, name, subdomain, db_name, plan, status)   │   │
│  │    - tenant_modules (tenant_id, module, active)             │   │
│  │    - platform_users (super_admins)                          │   │
│  │    - billing (tenant_id, amount, status)                    │   │
│  │    - db_connections (tenant_id, host, port, credentials)    │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Database: tenant_impala (Cliente A - Impala)               │   │
│  │    - users                                                   │   │
│  │    - inventory                                               │   │
│  │    - vehicles                                                │   │
│  │    - operators                                               │   │
│  │    - trips                                                   │   │
│  │    - routes                                                  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Database: tenant_trafigura (Cliente B - Trafigura)         │   │
│  │    - users                                                   │   │
│  │    - inventory                                               │   │
│  │    - (mismo esquema, BD completamente separada)             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Database: tenant_cliente_n (Cliente N)                     │   │
│  │    - (estructura replicada, datos aislados)                 │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  Redis (Cache): Cache por tenant (tenant_id:cache_key)             │
└─────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────┐
│                   FILE STORAGE (Multi-tenant)                       │
│             AWS S3 / Google Cloud Storage                           │
│                                                                      │
│  Estructura: /tenant_impala/invoices/...                           │
│              /tenant_trafigura/invoices/...                        │
│              /tenant_cliente_n/documents/...                       │
└─────────────────────────────────────────────────────────────────────┘
```

### Estrategia de Multi-tenancy

#### ✅ Opción Implementada: **Database-per-tenant** (RECOMENDADO)

**Ventajas:**
- ✅ **Máximo aislamiento:** Cada cliente tiene su propia base de datos física
- ✅ **Máxima seguridad:** Imposible que un tenant acceda a datos de otro
- ✅ **Performance independiente:** Un cliente no afecta el rendimiento de otros
- ✅ **Backup granular:** Backup/restore por cliente individual
- ✅ **Migración simple:** Mover cliente a otro servidor es trivial (dump/restore)
- ✅ **Cumplimiento normativo:** Ideal para GDPR, privacidad de datos
- ✅ **Escalabilidad horizontal:** Clientes grandes pueden tener servidor dedicado
- ✅ **Eliminación de datos:** Borrar un cliente = DROP DATABASE (simple)
- ✅ **Desarrollo/Testing:** Fácil clonar BD de producción para debugging

**Desventajas:**
- ⚠️ Costo de conexiones (pool por tenant)
- ⚠️ Mayor complejidad en migraciones (aplicar a N bases de datos)
- ⚠️ Necesita gestión de conexiones eficiente

**Por qué es mejor que schema-per-tenant:**
- Aislamiento TOTAL (no solo lógico sino físico)
- Mejor para empresas de transporte con datos sensibles
- Escalabilidad: cliente grande = servidor dedicado
- Sin riesgo de queries cross-tenant (diferentes BDs)

---

### Gestión de Conexiones (Critical para Database-per-tenant)

#### Connection Pool Manager

```javascript
// Ejemplo de implementación
class TenantDatabaseManager {
  private pools: Map<string, Pool> = new Map();
  
  async getConnection(tenantId: string): Promise<Pool> {
    // Si ya existe pool para este tenant, reutilizar
    if (this.pools.has(tenantId)) {
      return this.pools.get(tenantId)!;
    }
    
    // Obtener info de conexión desde platform_db
    const dbConfig = await this.getTenantDbConfig(tenantId);
    
    // Crear nuevo pool
    const pool = new Pool({
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database_name, // ej: tenant_impala
      user: dbConfig.user,
      password: dbConfig.password,
      max: 10, // Máximo 10 conexiones por tenant
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
    
    // Cachear pool
    this.pools.set(tenantId, pool);
    
    return pool;
  }
  
  // Limpiar pools inactivos cada hora
  cleanupIdlePools() {
    setInterval(() => {
      for (const [tenantId, pool] of this.pools.entries()) {
        if (pool.idleCount === pool.totalCount) {
          pool.end();
          this.pools.delete(tenantId);
        }
      }
    }, 3600000); // 1 hora
  }
}
```

---

### Identificación de Tenant

El sistema identifica el tenant del usuario mediante:

1. **Subdomain:** `impala.ward.io` → tenant_id = "impala"
2. **Header HTTP:** `X-Tenant-ID` en requests API
3. **JWT Token:** Incluye `tenant_id` en claims

**Flujo:**
```
1. Usuario accede a: impala.ward.io
2. Middleware extrae subdomain → tenant_id = "impala"
3. Backend consulta platform_db:
   SELECT database_name FROM tenants WHERE subdomain = 'impala'
   → database_name = 'tenant_impala'
4. Connection Pool Manager obtiene/crea conexión a 'tenant_impala'
5. Todas las queries se ejecutan en esa base de datos
6. Usuario solo ve datos de su BD
```

---

### Creación de Nuevo Tenant

**Script automatizado al onboardear cliente:**

```sql
-- 1. Crear entrada en platform_db
INSERT INTO tenants (id, name, subdomain, database_name, plan, status)
VALUES ('impala', 'Transportes Impala', 'impala', 'tenant_impala', 'professional', 'active');

-- 2. Crear nueva base de datos
CREATE DATABASE tenant_impala;

-- 3. Ejecutar migraciones en nueva BD
\connect tenant_impala;

-- Schema completo (users, vehicles, trips, etc.)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE vehicles (
  id SERIAL PRIMARY KEY,
  plate VARCHAR(50) UNIQUE NOT NULL,
  type VARCHAR(20), -- 'full' o 'sencillo'
  axles INTEGER,
  status VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ... resto de tablas

-- 4. Insertar módulos activos
INSERT INTO tenant_modules (tenant_id, module_name, active)
VALUES 
  ('impala', 'inventory', true),
  ('impala', 'fleet', true),
  ('impala', 'trips', true),
  ('impala', 'reports', true);

-- 5. Crear primer usuario admin
INSERT INTO tenant_impala.users (email, name, role)
VALUES ('carlos@impala.com', 'Carlos López', 'admin');
```

---

### Control de Módulos por Tenant

**Tabla: tenant_modules (en platform_db)**
```sql
tenant_id | module_name        | active | activated_at
----------|-------------------|--------|-------------
impala    | inventory         | true   | 2026-01-15
impala    | fleet_management  | true   | 2026-01-15
impala    | trips            | true   | 2026-01-15
impala    | reports          | false  | null
trafigura | inventory         | true   | 2026-02-01
trafigura | fleet_management  | true   | 2026-02-01
trafigura | reports          | true   | 2026-02-01
```

**Middleware de autorización:**
```javascript
async function checkModuleAccess(req, res, next) {
  const { tenant_id, module } = req;
  
  // Consultar en platform_db (no en tenant DB)
  const platformPool = getPlatformDbPool();
  const result = await platformPool.query(
    'SELECT active FROM tenant_modules WHERE tenant_id = $1 AND module_name = $2',
    [tenant_id, module]
  );
  
  if (!result.rows[0] || !result.rows[0].active) {
    return res.status(403).json({ 
      error: 'Módulo no disponible para tu plan' 
    });
  }
  
  next();
}
```

### Stack Tecnológico Detallado

#### Frontend
- **Framework:** React 18 con TypeScript
- **Routing:** React Router v6
- **State Management:** Zustand o Redux Toolkit
- **UI Components:** Componentes custom con TailwindCSS
- **Forms:** React Hook Form + Zod (validación)
- **Charts:** Recharts o Chart.js
- **HTTP Client:** Axios
- **Build Tool:** Vite

#### Backend
- **Runtime:** Node.js 20 LTS
- **Framework:** Express.js
- **Language:** TypeScript
- **Authentication:** Passport.js + JWT
- **ORM:** Prisma o TypeORM
- **Validation:** Zod o Joi
- **File Upload:** Multer
- **Email:** Nodemailer
- **Cron Jobs:** node-cron (para alertas programadas)

#### Base de Datos
- **Primary DB:** PostgreSQL 14+
  - Razón: Robustez, ACID compliance, excelente para datos relacionales
- **Cache:** Redis 7+
  - Para sesiones, caché de consultas frecuentes
- **File Storage:** AWS S3 o Google Cloud Storage
  - Para facturas, documentos, fotos

#### DevOps
- **Hosting:** AWS (EC2, RDS, S3) o Google Cloud Platform
- **CI/CD:** GitHub Actions o GitLab CI
- **Containerización:** Docker + Docker Compose
- **Reverse Proxy:** Nginx
- **Monitoring:** Sentry (errores) + CloudWatch/Datadog (métricas)
- **SSL:** Let's Encrypt

---

## 8. Plan de Desarrollo

### Fase 0: Infraestructura Multi-tenant (Semanas 1-2)

**Objetivo:** Establecer arquitectura SaaS multitenant antes de funcionalidades

#### Semana 1: Setup Multi-tenant
- [ ] Configurar repositorios (frontend + backend + panel-admin)
- [ ] Setup de base de datos PostgreSQL con estrategia **database-per-tenant**
- [ ] Crear platform_db (base de datos central de metadata)
- [ ] Implementar middleware de identificación de tenant
- [ ] Crear Database Connection Pool Manager
- [ ] Implementar sistema de creación automática de BDs por tenant
- [ ] Crear scripts de migración multi-database
- [ ] Setup de Redis con namespace por tenant

**Entregables:**
- Infraestructura multi-tenant funcional
- Script para crear nuevas BDs de tenant automáticamente
- Connection pool manager funcionando

#### Semana 2: Panel Super Admin
- [ ] Diseño e implementación del panel maestro
- [ ] CRUD de clientes/tenants
- [ ] Sistema de creación automática de BD al crear tenant
- [ ] Sistema de activación/desactivación de módulos
- [ ] Dashboard de métricas globales
- [ ] Wizard de onboarding de clientes
- [ ] Sistema de autenticación para Super Admin

**Entregables:**
- Panel de administración maestro funcional
- Super Admin puede crear clientes con BD dedicada
- Pool de conexiones se gestiona automáticamente

---

### Fase 1: MVP Core (Semanas 3-6)

**Objetivo:** Establecer funcionalidades base del sistema para clientes

#### Semana 3-4: Setup e Infraestructura por Tenant
- [ ] Sistema de autenticación por tenant
- [ ] Crear modelos de datos (schema de tablas)
- [ ] Script de auto-creación de BD al onboardear cliente
- [ ] Testing de aislamiento de datos entre BDs de tenants
- [ ] Validación de pools de conexión funcionando correctamente
- [ ] Testing de migraciones aplicadas a múltiples BDs

**Entregables:**
- Autenticación por tenant funcional
- BDs aisladas por cliente
- Testing de seguridad multi-tenant pasando

#### Semana 4-5: Gestión de Usuarios e Inventario
- [ ] CRUD de usuarios con roles (por tenant)
- [ ] Módulo de gestión de inventario completo
  - Catálogo de materiales
  - Entradas y salidas
  - Consulta de stock
- [ ] Control de unidades básico
  - Registro de camiones
  - Estados de unidad
- [ ] Sistema de verificación de módulos activos

**Entregables:**
- Panel de administración de usuarios por tenant
- Módulo de inventario funcional
- Control de acceso basado en módulos activados

#### Semana 5-6: Testing y Refinamiento Fase 1
- [ ] Pruebas de integración
- [ ] Corrección de bugs
- [ ] Documentación de APIs
- [ ] Deploy a staging

**Entregables:**
- MVP Fase 1 en staging para pruebas internas

---

### Fase 2: Operaciones (Semanas 7-10)

**Objetivo:** Implementar módulos operativos críticos

#### Semana 7-8: Gestión de Operadores y Rutas
- [ ] Módulo de operadores completo
  - Registro de conductores
  - Control de disponibilidad
  - Asignación a unidades
- [ ] Sistema de rutas
  - Catálogo de rutas
  - Parametrización de casetas
  - Cálculo de distancias

**Entregables:**
- Módulo de operadores funcional
- Sistema de rutas configurado

#### Semana 8-10: Control de Viajes y Cálculo de Costos
- [ ] Módulo de viajes
  - Creación de viajes
  - Asignación de recursos (ruta, unidad, operador)
- [ ] Motor de cálculo de costos
  - Casetas (según tipo unidad y ejes)
  - Combustible (fórmula: distancia/100 × 50 × precio)
  - Seguro prorrateado
  - Gastos adicionales
- [ ] Desglose de costos en UI
- [ ] Validación de módulos activos antes de permitir creación

**Entregables:**
- Sistema de viajes funcional
- Cálculo automático de costos operativo

#### Semana 10: Testing Fase 2
- [ ] Pruebas de cálculos de costos
- [ ] Testing de flujos completos (crear viaje end-to-end)
- [ ] Corrección de bugs

**Entregables:**
- MVP Fase 2 en staging

---

### Fase 3: Optimización y Reportes (Semanas 11-14)

**Objetivo:** Analytics y generación de valor

#### Semana 11-12: Sistema de Reportes
- [ ] Reporte de inventario
- [ ] Reporte de costos operativos
- [ ] Reporte de viajes
- [ ] Análisis de rentabilidad por ruta
- [ ] Dashboard ejecutivo

**Entregables:**
- Módulo de reportes completo
- Exportación a Excel y PDF

#### Semana 12-13: Analytics Avanzado
- [ ] Gráficos de tendencias
- [ ] Comparativas período actual vs anterior
- [ ] Análisis de desempeño de operadores
- [ ] Optimización de consultas (caché, índices)
- [ ] Métricas por tenant en panel maestro

**Entregables:**
- Sistema de analytics operativo
- Dashboard de métricas para Super Admin

#### Semana 13-14: Testing y Optimización
- [ ] Testing de performance
- [ ] Optimización de queries lentas
- [ ] Mejoras en UX basadas en feedback
- [ ] Documentación de usuario final

**Entregables:**
- MVP Fase 3 completo

---

### Fase 4: Experiencia y Escalabilidad (Semanas 15+)

**Objetivo:** Mejorar UX y preparar para producción

#### Semana 15-16: Notificaciones y Comunicaciones
- [ ] Sistema de notificaciones en plataforma
- [ ] Notificaciones por email
- [ ] Preferencias de notificación por usuario
- [ ] Alertas automáticas (stock bajo, mantenimientos)

**Entregables:**
- Sistema de notificaciones funcional

#### Semana 17-18: Mejoras en UX/UI
- [ ] Onboarding para nuevos usuarios por tenant
- [ ] Tour guiado
- [ ] Mejoras en diseño responsive
- [ ] Optimización de flujos complejos
- [ ] Branding personalizable por tenant (logo, colores)

**Entregables:**
- Experiencia de usuario pulida
- Sistema de white-labeling básico

#### Semana 19-20: Preparación para Producción
- [ ] Auditoría de seguridad multi-tenant
- [ ] Testing de carga (simular múltiples tenants simultáneos)
- [ ] Configuración de monitoreo por tenant
- [ ] Plan de backups por tenant
- [ ] Documentación completa
- [ ] Scripts de disaster recovery

**Entregables:**
- Sistema listo para producción

#### Semana 21-22: Lanzamiento y Soporte
- [ ] Deploy a producción
- [ ] Migración de datos de clientes piloto
- [ ] Capacitación a usuarios
- [ ] Soporte inicial intensivo

**Entregables:**
- Sistema en producción con clientes activos

---

## 9. Métricas de Éxito

### Métricas de Plataforma SaaS

#### Crecimiento de Clientes
- **Total de clientes activos Q2 2026:** 3 empresas piloto
- **Total de clientes activos Q3 2026:** 10 empresas
- **Total de clientes activos Q4 2026:** 25 empresas
- **Tasa de conversión piloto → pago:** > 80%
- **Churn rate mensual:** < 5%

#### Métricas Financieras
- **MRR (Monthly Recurring Revenue) Q3 2026:** $5,000 USD
- **MRR Q4 2026:** $15,000 USD
- **ARPU (Average Revenue Per User):** $500-800 USD/mes por empresa
- **Customer Acquisition Cost (CAC):** < $2,000 USD
- **Lifetime Value (LTV):** > $10,000 USD
- **LTV:CAC Ratio:** > 5:1

#### Adopción de Módulos
- **% clientes con módulo Viajes activo:** > 90%
- **% clientes con módulo Reportes activo:** > 70%
- **Promedio de módulos activos por cliente:** 5-6 módulos
- **Upgrade rate (Básico → Profesional):** > 30% en 3 meses

---

### Métricas de Producto (KPIs)

#### Adopción
- **Daily Active Users (DAU):** > 70% de usuarios registrados
- **Weekly Active Users (WAU):** > 85% de usuarios registrados
- **Tiempo promedio en plataforma:** > 45 min/día por gerente operativo

#### Uso de Funcionalidades
- **Viajes creados por semana:** Incremento del 20% mensual
- **Tasa de uso de cálculo automático:** > 95% de viajes usan cálculo automático
- **Reportes generados por mes:** > 50 reportes/mes por empresa

#### Satisfacción
- **Net Promoter Score (NPS):** > 40
- **Customer Satisfaction (CSAT):** > 4.2/5
- **Tasa de retención:** > 90% a 6 meses

### Métricas de Negocio

#### Reducción de Costos (para clientes)
- **Reducción en tiempo de planificación:** 80% (de 30 min a 5 min por viaje)
- **Reducción de errores en cálculos:** > 90%
- **Ahorro en costos operativos:** 10-15% vs proceso manual

#### Crecimiento
- **Clientes activos Q2 2026:** 3 empresas piloto
- **Clientes activos Q3 2026:** 10 empresas
- **Clientes activos Q4 2026:** 25 empresas
- **Viajes gestionados mensualmente (Q4 2026):** > 5,000

### Métricas Técnicas

#### Performance
- **Tiempo de carga inicial:** < 2 segundos (95th percentile)
- **Tiempo de respuesta API:** < 300ms (median)
- **Uptime:** > 99.5%

#### Calidad
- **Bugs críticos en producción:** 0 por mes
- **Bugs menores:** < 5 por mes
- **Cobertura de tests:** > 70%

---

## 10. Riesgos y Mitigaciones

### Riesgos de Multi-tenancy

#### RM-01: Data Leakage entre Tenants
- **Riesgo:** Bug en código permite a un tenant ver datos de otro
- **Probabilidad:** Baja
- **Impacto:** CRÍTICO
- **Mitigación:**
  - Testing exhaustivo de aislamiento de datos
  - Code review obligatorio para queries de BD
  - Implementar Row Level Security (RLS) en PostgreSQL
  - Auditoría automática que detecta accesos cross-tenant
  - Testing de penetración específico para multi-tenancy
  - Middleware que valida tenant_id en TODAS las requests

#### RM-02: Noisy Neighbor (Cliente abusa recursos)
- **Riesgo:** Un cliente consume recursos excesivos afectando a otros
- **Probabilidad:** Media
- **Impacto:** Alto
- **Mitigación:**
  - Rate limiting por tenant
  - Límites de queries por minuto/hora
  - Monitoreo de uso por tenant
  - Alertas cuando tenant excede umbrales
  - Planes con límites claros de uso
  - Posibilidad de throttling automático

#### RM-03: Complejidad en Migraciones de Base de Datos
- **Riesgo:** Aplicar cambios de schema a 50+ bases de datos es complejo y propenso a errores
- **Probabilidad:** Media
- **Impacto:** Alto
- **Mitigación:**
  - Scripts automatizados para aplicar migraciones a todas las BDs
  - Testing en ambiente de staging con múltiples BDs de prueba
  - Rollback automático si falla migración en alguna BD
  - Ventana de mantenimiento comunicada con anticipación
  - Migraciones graduales (BD por BD con validación)
  - Estrategia de zero-downtime migrations cuando sea posible
  - Lista de BDs en platform_db para iterar automáticamente

#### RM-04: Dificultad en Debugging
- **Riesgo:** Errores específicos de un tenant son difíciles de reproducir
- **Probabilidad:** Media
- **Impacto:** Medio
- **Mitigación:**
  - Logs incluyen siempre tenant_id
  - Herramienta para "impersonar" tenant en dev
  - Ambiente de staging con múltiples tenants de prueba
  - Monitoreo granular por tenant

---

### Riesgos Técnicos

#### RT-01: Escalabilidad de Base de Datos
- **Riesgo:** BD no escala con crecimiento de viajes
- **Probabilidad:** Media
- **Impacto:** Alto
- **Mitigación:**
  - Implementar particionamiento de tablas grandes (viajes, historial)
  - Caché agresivo con Redis
  - Índices optimizados
  - Plan de migración a sharding si es necesario

#### RT-02: Precisión de Cálculos de Costos
- **Riesgo:** Cálculos automáticos no reflejan costos reales
- **Probabilidad:** Media
- **Impacto:** Crítico
- **Mitigación:**
  - Validación exhaustiva con datos históricos de clientes piloto
  - Permitir ajustes manuales con justificación
  - Iteración constante de fórmulas basada en feedback
  - Comparación estimado vs real en cada viaje

#### RT-03: Integración con Sistemas Existentes
- **Riesgo:** Clientes tienen sistemas legacy difíciles de migrar
- **Probabilidad:** Alta
- **Impacto:** Medio
- **Mitigación:**
  - Importación manual de datos iniciales (CSV)
  - APIs para integración futura
  - Período de operación paralela (sistema nuevo + viejo)

### Riesgos de Negocio

#### RN-01: Adopción por Usuarios
- **Riesgo:** Usuarios rechazan cambio de procesos manuales
- **Probabilidad:** Media
- **Impacto:** Crítico
- **Mitigación:**
  - Diseño UX extremadamente intuitivo
  - Capacitación intensiva inicial
  - Soporte personalizado en primeros 3 meses
  - Quick wins tempranos (reportes que antes no tenían)

#### RN-02: Variabilidad en Modelos de Negocio
- **Riesgo:** Cada empresa tiene procesos muy diferentes
- **Probabilidad:** Alta
- **Impacto:** Alto
- **Mitigación:**
  - Sistema flexible y parametrizable
  - Configuraciones por empresa
  - Roadmap basado en necesidades comunes (80/20)

#### RN-03: Competencia
- **Riesgo:** Entrada de competidores o sistemas similares
- **Probabilidad:** Media
- **Impacto:** Alto
- **Mitigación:**
  - Lanzamiento rápido de MVP
  - Enfoque en nicho específico (transporte terrestre México)
  - Ventaja de datos (mejores cálculos con más viajes)
  - Relación cercana con clientes

### Riesgos de Operación

#### RO-01: Disponibilidad del Sistema
- **Riesgo:** Downtime en horas críticas de operación
- **Probabilidad:** Baja
- **Impacto:** Alto
- **Mitigación:**
  - Hosting en cloud con alta disponibilidad
  - Backups automáticos diarios
  - Plan de recuperación ante desastres
  - Monitoreo 24/7 con alertas

#### RO-02: Seguridad de Datos
- **Riesgo:** Brecha de seguridad o pérdida de datos
- **Probabilidad:** Baja
- **Impacto:** Crítico
- **Mitigación:**
  - Auditorías de seguridad periódicas
  - Encriptación en tránsito y en reposo
  - Backups con retención de 30 días
  - Compliance con mejores prácticas (OWASP)

---

## Apéndices

### Apéndice A: Glosario

- **Full:** Tipo de camión de gran capacidad (tractocamión completo)
- **Sencillo:** Tipo de camión de capacidad reducida (camión unitario)
- **Eje:** Conjunto de ruedas en el chasis del camión (2, 3 o 4 ejes)
- **Caseta:** Puesto de cobro de peaje en carretera
- **Operador:** Conductor de camión
- **Ruta:** Trayecto predefinido de origen a destino
- **Viaje:** Recorrido específico asignado a una unidad y operador
- **Stock:** Inventario disponible de materiales
- **Prorrateado:** Distribución proporcional de un costo total

### Apéndice B: Referencias

- Especificación original del MVP (documento fuente)
- Documentación de audio adicional (pendiente)
- Google Docs con requerimientos complementarios (pendiente)

### Apéndice C: Contactos del Proyecto

- **Product Owner:** [Nombre]
- **Tech Lead:** [Nombre]
- **Clientes Piloto:** Impala, Trafigura

### Apéndice D: Cronograma Visual

```
Semanas 1-2:   ████ Infraestructura Multi-tenant & Panel Super Admin
Semanas 3-6:   ████████ MVP Core (Auth, Usuarios, Inventario, Unidades)
Semanas 7-10:  ████████ Operaciones (Operadores, Rutas, Viajes, Costos)
Semanas 11-14: ████████ Optimización y Reportes (Analytics, Dashboards)
Semanas 15-18: ████████ Experiencia (Notificaciones, UX/UI, White-label)
Semanas 19-22: ████████ Producción (Testing, Security, Lanzamiento)
```

**Total: ~5.5 meses de desarrollo**

---

### Apéndice E: Modelo de Pricing Inicial

#### Plan Básico - $499 USD/mes
- ✅ Gestión de Usuarios
- ✅ Control de Inventario
- ✅ Control de Unidades (hasta 15 camiones)
- ✅ Gestión de Operadores
- ❌ Control de Viajes
- ❌ Reportes Avanzados
- ❌ Notificaciones

#### Plan Profesional - $899 USD/mes
- ✅ Todo lo de Básico
- ✅ Control de Viajes y Gastos
- ✅ Sistema de Rutas
- ✅ Reportes Básicos
- ✅ Control de Unidades (hasta 40 camiones)
- ❌ Analytics Avanzado
- ❌ Notificaciones Push

#### Plan Empresarial - $1,499 USD/mes
- ✅ Todo lo de Profesional
- ✅ Analytics Avanzado
- ✅ Notificaciones en tiempo real
- ✅ Control de Unidades (ilimitado)
- ✅ Soporte prioritario
- ✅ White-labeling (logo, colores)
- ✅ API Access

#### Plan Personalizado - Precio a cotizar
- ✅ Todo lo de Empresarial
- ✅ Integraciones custom
- ✅ Capacitación in-situ
- ✅ SLA garantizado 99.9%
- ✅ Dedicated support

---

**Fin del Documento**

*Este PRD es un documento vivo y debe actualizarse conforme evoluciona el producto.*
