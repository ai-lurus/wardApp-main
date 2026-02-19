import { subDays, subHours } from 'date-fns';

const now = new Date();

let nextMaterialId = 8;
let nextMovementId = 11;

let nextCategoryId = 6;

const categories = [
  { id: 'cat_1', name: 'Llantas', description: 'Llantas y neumáticos para unidades de transporte', createdAt: subDays(now, 90).toISOString() },
  { id: 'cat_2', name: 'Filtros', description: 'Filtros de aceite, aire y combustible', createdAt: subDays(now, 90).toISOString() },
  { id: 'cat_3', name: 'Balatas', description: 'Balatas y componentes de freno', createdAt: subDays(now, 85).toISOString() },
  { id: 'cat_4', name: 'Diesel', description: 'Combustible diesel para flota', createdAt: subDays(now, 80).toISOString() },
  { id: 'cat_5', name: 'Empaques', description: 'Empaques y juntas para motor', createdAt: subDays(now, 75).toISOString() },
];

const materials = [
  {
    id: 'mat_1',
    name: 'Llanta 295/80 R22.5',
    sku: 'LLN-295-001',
    location: 'Almacén A - Estante 1',
    categoryId: 'cat_1',
    categoryName: 'Llantas',
    unit: 'pieza',
    referencePrice: 8500,
    minStock: 10,
    currentStock: 4,
    active: true,
    createdAt: subDays(now, 60).toISOString(),
    updatedAt: subDays(now, 2).toISOString(),
  },
  {
    id: 'mat_2',
    name: 'Filtro de aceite LF9009',
    sku: 'FLT-ACE-009',
    location: 'Almacén A - Estante 3',
    categoryId: 'cat_2',
    categoryName: 'Filtros',
    unit: 'pieza',
    referencePrice: 320,
    minStock: 20,
    currentStock: 35,
    active: true,
    createdAt: subDays(now, 55).toISOString(),
    updatedAt: subDays(now, 5).toISOString(),
  },
  {
    id: 'mat_3',
    name: 'Filtro de aire AF25708',
    sku: 'FLT-AIR-008',
    location: 'Almacén A - Estante 3',
    categoryId: 'cat_2',
    categoryName: 'Filtros',
    unit: 'pieza',
    referencePrice: 480,
    minStock: 15,
    currentStock: 8,
    active: true,
    createdAt: subDays(now, 50).toISOString(),
    updatedAt: subDays(now, 1).toISOString(),
  },
  {
    id: 'mat_4',
    name: 'Balata delantera 4515',
    sku: 'BLT-DEL-015',
    location: 'Almacén B - Estante 2',
    categoryId: 'cat_3',
    categoryName: 'Balatas',
    unit: 'juego',
    referencePrice: 1200,
    minStock: 8,
    currentStock: 12,
    active: true,
    createdAt: subDays(now, 45).toISOString(),
    updatedAt: subDays(now, 3).toISOString(),
  },
  {
    id: 'mat_5',
    name: 'Diesel (litros)',
    sku: 'DSL-GNR-001',
    location: 'Patio Exterior',
    categoryId: 'cat_4',
    categoryName: 'Diesel',
    unit: 'litro',
    referencePrice: 22.5,
    minStock: 500,
    currentStock: 320,
    active: true,
    createdAt: subDays(now, 40).toISOString(),
    updatedAt: subHours(now, 12).toISOString(),
  },
  {
    id: 'mat_6',
    name: 'Empaque de motor C15',
    sku: 'EMP-MOT-015',
    location: 'Almacén B - Estante 1',
    categoryId: 'cat_5',
    categoryName: 'Empaques',
    unit: 'pieza',
    referencePrice: 2800,
    minStock: 3,
    currentStock: 2,
    active: true,
    createdAt: subDays(now, 30).toISOString(),
    updatedAt: subDays(now, 7).toISOString(),
  },
  {
    id: 'mat_7',
    name: 'Filtro de combustible FS1212',
    sku: 'FLT-CMB-012',
    location: 'Almacén A - Estante 3',
    categoryId: 'cat_2',
    categoryName: 'Filtros',
    unit: 'pieza',
    referencePrice: 280,
    minStock: 25,
    currentStock: 40,
    active: true,
    createdAt: subDays(now, 25).toISOString(),
    updatedAt: subDays(now, 4).toISOString(),
  },
];

const movements = [
  {
    id: 'mov_1',
    materialId: 'mat_1',
    materialName: 'Llanta 295/80 R22.5',
    type: 'entry',
    quantity: 6,
    unitCost: 8200,
    totalCost: 49200,
    supplier: 'Llantas del Norte SA',
    invoiceNumber: 'FAC-2024-001',
    destination: null,
    reason: null,
    notes: 'Pedido mensual',
    createdBy: 'Carlos López',
    movementDate: subDays(now, 15).toISOString(),
  },
  {
    id: 'mov_2',
    materialId: 'mat_1',
    materialName: 'Llanta 295/80 R22.5',
    type: 'exit',
    quantity: 2,
    unitCost: 8500,
    totalCost: 17000,
    supplier: null,
    invoiceNumber: null,
    destination: 'Unidad TRK-042',
    reason: 'Cambio preventivo',
    notes: '',
    createdBy: 'Miguel Rodríguez',
    movementDate: subDays(now, 10).toISOString(),
  },
  {
    id: 'mov_3',
    materialId: 'mat_2',
    materialName: 'Filtro de aceite LF9009',
    type: 'entry',
    quantity: 30,
    unitCost: 300,
    totalCost: 9000,
    supplier: 'AutoPartes Express',
    invoiceNumber: 'FAC-2024-015',
    destination: null,
    reason: null,
    notes: '',
    createdBy: 'Carlos López',
    movementDate: subDays(now, 12).toISOString(),
  },
  {
    id: 'mov_4',
    materialId: 'mat_5',
    materialName: 'Diesel (litros)',
    type: 'entry',
    quantity: 1000,
    unitCost: 21.8,
    totalCost: 21800,
    supplier: 'Pemex Distribución',
    invoiceNumber: 'FAC-2024-022',
    destination: null,
    reason: null,
    notes: 'Carga semanal',
    createdBy: 'Carlos López',
    movementDate: subDays(now, 7).toISOString(),
  },
  {
    id: 'mov_5',
    materialId: 'mat_5',
    materialName: 'Diesel (litros)',
    type: 'exit',
    quantity: 680,
    unitCost: 22.5,
    totalCost: 15300,
    supplier: null,
    invoiceNumber: null,
    destination: 'Flota Norte',
    reason: 'Carga de unidades',
    notes: '4 unidades cargadas',
    createdBy: 'Miguel Rodríguez',
    movementDate: subDays(now, 5).toISOString(),
  },
  {
    id: 'mov_6',
    materialId: 'mat_3',
    materialName: 'Filtro de aire AF25708',
    type: 'exit',
    quantity: 3,
    unitCost: 480,
    totalCost: 1440,
    supplier: null,
    invoiceNumber: null,
    destination: 'Taller Central',
    reason: 'Mantenimiento preventivo',
    notes: '',
    createdBy: 'Ana García',
    movementDate: subDays(now, 4).toISOString(),
  },
  {
    id: 'mov_7',
    materialId: 'mat_4',
    materialName: 'Balata delantera 4515',
    type: 'entry',
    quantity: 8,
    unitCost: 1100,
    totalCost: 8800,
    supplier: 'Frenos y Partes MX',
    invoiceNumber: 'FAC-2024-031',
    destination: null,
    reason: null,
    notes: '',
    createdBy: 'Carlos López',
    movementDate: subDays(now, 3).toISOString(),
  },
  {
    id: 'mov_8',
    materialId: 'mat_6',
    materialName: 'Empaque de motor C15',
    type: 'exit',
    quantity: 1,
    unitCost: 2800,
    totalCost: 2800,
    supplier: null,
    invoiceNumber: null,
    destination: 'Taller Central',
    reason: 'Reparación motor unidad TRK-018',
    notes: 'Urgente',
    createdBy: 'Miguel Rodríguez',
    movementDate: subDays(now, 2).toISOString(),
  },
  {
    id: 'mov_9',
    materialId: 'mat_7',
    materialName: 'Filtro de combustible FS1212',
    type: 'entry',
    quantity: 20,
    unitCost: 260,
    totalCost: 5200,
    supplier: 'AutoPartes Express',
    invoiceNumber: 'FAC-2024-038',
    destination: null,
    reason: null,
    notes: '',
    createdBy: 'Carlos López',
    movementDate: subDays(now, 1).toISOString(),
  },
  {
    id: 'mov_10',
    materialId: 'mat_2',
    materialName: 'Filtro de aceite LF9009',
    type: 'exit',
    quantity: 5,
    unitCost: 320,
    totalCost: 1600,
    supplier: null,
    invoiceNumber: null,
    destination: 'Taller Central',
    reason: 'Servicio programado',
    notes: '5 unidades en servicio',
    createdBy: 'Ana García',
    movementDate: subHours(now, 6).toISOString(),
  },
];

export const getCategories = () => [...categories];

export const addCategory = (data) => {
  const newCategory = {
    id: `cat_${nextCategoryId++}`,
    name: data.name,
    description: data.description || '',
    createdAt: new Date().toISOString(),
  };
  categories.push(newCategory);
  return newCategory;
};

export const updateCategory = (id, data) => {
  const index = categories.findIndex((c) => c.id === id);
  if (index === -1) return null;
  categories[index] = {
    ...categories[index],
    ...data,
  };
  return categories[index];
};

export const deleteCategory = (id) => {
  const index = categories.findIndex((c) => c.id === id);
  if (index === -1) return false;
  const hasMaterials = materials.some((m) => m.active && m.categoryId === id);
  if (hasMaterials) return { error: 'La categoría tiene materiales asociados' };
  categories.splice(index, 1);
  return true;
};

export const getLocations = () => {
  const locationSet = new Set(materials.filter((m) => m.location).map((m) => m.location));
  return [...locationSet].sort();
};

export const getMaterials = () => materials.filter((m) => m.active);

export const getAllMaterials = () => [...materials];

export const getMovements = () => [...movements].sort(
  (a, b) => new Date(b.movementDate) - new Date(a.movementDate)
);

export const getAlerts = () => {
  return materials
    .filter((m) => m.active && m.currentStock <= m.minStock)
    .map((m) => ({
      ...m,
      deficit: m.minStock - m.currentStock,
    }))
    .sort((a, b) => b.deficit - a.deficit);
};

export const getStats = () => {
  const activeMaterials = materials.filter((m) => m.active);
  const lowStock = activeMaterials.filter((m) => m.currentStock <= m.minStock);
  const totalValue = activeMaterials.reduce(
    (sum, m) => sum + m.currentStock * m.referencePrice,
    0
  );
  const recentMovements = movements.filter((m) => {
    const date = new Date(m.movementDate);
    return date >= subDays(now, 7);
  });

  return {
    totalMaterials: activeMaterials.length,
    lowStockCount: lowStock.length,
    totalValue,
    recentMovementsCount: recentMovements.length,
  };
};

export const addMaterial = (data) => {
  const category = categories.find((c) => c.id === data.categoryId);
  const newMaterial = {
    id: `mat_${nextMaterialId++}`,
    name: data.name,
    sku: data.sku || '',
    location: data.location || '',
    categoryId: data.categoryId,
    categoryName: category ? category.name : '',
    unit: data.unit,
    referencePrice: Number(data.referencePrice),
    minStock: Number(data.minStock),
    currentStock: 0,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  materials.push(newMaterial);
  return newMaterial;
};

export const updateMaterial = (id, data) => {
  const index = materials.findIndex((m) => m.id === id);
  if (index === -1) return null;

  const category = data.categoryId
    ? categories.find((c) => c.id === data.categoryId)
    : null;

  materials[index] = {
    ...materials[index],
    ...data,
    ...(category ? { categoryName: category.name } : {}),
    updatedAt: new Date().toISOString(),
  };
  return materials[index];
};

export const toggleMaterialActive = (id) => {
  const index = materials.findIndex((m) => m.id === id);
  if (index === -1) return null;
  materials[index].active = !materials[index].active;
  materials[index].updatedAt = new Date().toISOString();
  return materials[index];
};

export const addMovement = (data) => {
  const material = materials.find((m) => m.id === data.materialId);
  if (!material) return null;

  if (data.type === 'exit' && material.currentStock < data.quantity) {
    return { error: 'Stock insuficiente' };
  }

  const totalCost = Number(data.quantity) * Number(data.unitCost || 0);

  const newMovement = {
    id: `mov_${nextMovementId++}`,
    materialId: data.materialId,
    materialName: material.name,
    type: data.type,
    quantity: Number(data.quantity),
    unitCost: Number(data.unitCost || 0),
    totalCost,
    supplier: data.supplier || null,
    invoiceNumber: data.invoiceNumber || null,
    destination: data.destination || null,
    reason: data.reason || null,
    notes: data.notes || '',
    createdBy: 'Admin Demo',
    movementDate: new Date().toISOString(),
  };

  movements.push(newMovement);

  if (data.type === 'entry') {
    material.currentStock += Number(data.quantity);
  } else {
    material.currentStock -= Number(data.quantity);
  }
  material.updatedAt = new Date().toISOString();

  return newMovement;
};
