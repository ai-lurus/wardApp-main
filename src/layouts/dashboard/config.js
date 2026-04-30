import ArchiveBoxIcon from '@heroicons/react/24/solid/ArchiveBoxIcon';
import ArrowsRightLeftIcon from '@heroicons/react/24/solid/ArrowsRightLeftIcon';
import BanknotesIcon from '@heroicons/react/24/solid/BanknotesIcon';
import DocumentChartBarIcon from '@heroicons/react/24/solid/DocumentChartBarIcon';
import ExclamationTriangleIcon from '@heroicons/react/24/solid/ExclamationTriangleIcon';
import HomeIcon from '@heroicons/react/24/solid/HomeIcon';
import MapIcon from '@heroicons/react/24/solid/MapIcon';
import TagIcon from '@heroicons/react/24/solid/TagIcon';
import TruckIcon from '@heroicons/react/24/solid/TruckIcon';
import UserGroupIcon from '@heroicons/react/24/solid/UserGroupIcon';
import UsersIcon from '@heroicons/react/24/solid/UsersIcon';
import WrenchIcon from '@heroicons/react/24/solid/WrenchIcon';
import { SvgIcon } from '@mui/material';

import BuildingOfficeIcon from '@heroicons/react/24/solid/BuildingOfficeIcon';

export const superAdminItems = [
  {
    title: 'Tenants',
    path: '/tenants',
    icon: (
      <SvgIcon fontSize="small">
        <BuildingOfficeIcon />
      </SvgIcon>
    ),
  },
];

// allowedRoles: if set, only users with those roles can see the item.
// If omitted, the item is visible to all authenticated (non-super_admin) roles.
// adminOnly is kept as a shorthand for allowedRoles: ['admin'].

export const items = [
  {
    title: 'Inicio',
    path: '/',
    icon: (
      <SvgIcon fontSize="small">
        <HomeIcon />
      </SvgIcon>
    ),
  },
  {
    title: 'Inventario',
    icon: (
      <SvgIcon fontSize="small">
        <ArchiveBoxIcon />
      </SvgIcon>
    ),
    children: [
      {
        title: 'Materiales',
        path: '/materials',
        icon: (
          <SvgIcon fontSize="small">
            <ArchiveBoxIcon />
          </SvgIcon>
        ),
      },
      {
        title: 'Categorías',
        path: '/categories',
        allowedRoles: ['admin'],
        icon: (
          <SvgIcon fontSize="small">
            <TagIcon />
          </SvgIcon>
        ),
      },
      {
        title: 'Movimientos',
        path: '/movements',
        icon: (
          <SvgIcon fontSize="small">
            <ArrowsRightLeftIcon />
          </SvgIcon>
        ),
      },
      {
        title: 'Alertas',
        path: '/alerts',
        icon: (
          <SvgIcon fontSize="small">
            <ExclamationTriangleIcon />
          </SvgIcon>
        ),
      },
      {
        title: 'Reportes',
        path: '/reports',
        allowedRoles: ['admin'],
        icon: (
          <SvgIcon fontSize="small">
            <DocumentChartBarIcon />
          </SvgIcon>
        ),
      },
      {
        title: 'Mapa de almacén',
        path: '/warehouse',
        allowedRoles: ['admin'],
        icon: (
          <SvgIcon fontSize="small">
            <MapIcon />
          </SvgIcon>
        ),
      },
    ],
  },
  // --- Coming-soon modules (admin only) ---
  {
    title: 'Operaciones',
    allowedRoles: ['admin'],
    moduleId: 'operaciones',
    sectionDivider: true,
    icon: (
      <SvgIcon fontSize="small">
        <TruckIcon />
      </SvgIcon>
    ),
    children: [
      {
        title: 'Operadores',
        path: '/operators',
        icon: (
          <SvgIcon fontSize="small">
            <UserGroupIcon />
          </SvgIcon>
        ),
      },
      {
        title: 'Rutas y Casetas',
        path: '/routes',
        icon: (
          <SvgIcon fontSize="small">
            <MapIcon />
          </SvgIcon>
        ),
      },
      {
        title: 'Viajes',
        path: '/trips',
        icon: (
          <SvgIcon fontSize="small">
            <TruckIcon />
          </SvgIcon>
        ),
      },
    ],
  },
  {
    title: 'Flotas',
    path: '/units',
    allowedRoles: ['admin'],
    moduleId: 'flotas',
    icon: (
      <SvgIcon fontSize="small">
        <WrenchIcon />
      </SvgIcon>
    ),
  },
  {
    title: 'Clientes',
    comingSoon: true,
    allowedRoles: ['admin'],
    moduleId: 'clientes',
    icon: (
      <SvgIcon fontSize="small">
        <UserGroupIcon />
      </SvgIcon>
    ),
  },
  {
    title: 'Finanzas',
    comingSoon: true,
    allowedRoles: ['admin'],
    moduleId: 'finanzas',
    icon: (
      <SvgIcon fontSize="small">
        <BanknotesIcon />
      </SvgIcon>
    ),
  },
  // --- Admin ---
  {
    title: 'Administración',
    adminOnly: true,
    allowedRoles: ['admin'],
    icon: (
      <SvgIcon fontSize="small">
        <UsersIcon />
      </SvgIcon>
    ),
    children: [
      {
        title: 'Usuarios',
        path: '/users',
        adminOnly: true,
        allowedRoles: ['admin'],
        icon: (
          <SvgIcon fontSize="small">
            <UsersIcon />
          </SvgIcon>
        ),
      },
      {
        title: 'Suscripción',
        path: '/billing',
        adminOnly: true,
        allowedRoles: ['admin'],
        icon: (
          <SvgIcon fontSize="small">
            <BanknotesIcon />
          </SvgIcon>
        ),
      },
    ],
  },
];
