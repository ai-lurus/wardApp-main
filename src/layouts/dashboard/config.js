import ArchiveBoxIcon from '@heroicons/react/24/solid/ArchiveBoxIcon';
import ArrowsRightLeftIcon from '@heroicons/react/24/solid/ArrowsRightLeftIcon';
import BanknotesIcon from '@heroicons/react/24/solid/BanknotesIcon';
import DocumentChartBarIcon from '@heroicons/react/24/solid/DocumentChartBarIcon';
import ExclamationTriangleIcon from '@heroicons/react/24/solid/ExclamationTriangleIcon';
import HomeIcon from '@heroicons/react/24/solid/HomeIcon';
import MapIcon from '@heroicons/react/24/solid/MapIcon';
import BellAlertIcon from '@heroicons/react/24/solid/BellAlertIcon';
import ChartBarIcon from '@heroicons/react/24/solid/ChartBarIcon';
import CpuChipIcon from '@heroicons/react/24/solid/CpuChipIcon';
import MapPinIcon from '@heroicons/react/24/solid/MapPinIcon';
import SignalIcon from '@heroicons/react/24/solid/SignalIcon';
import ShieldCheckIcon from '@heroicons/react/24/solid/ShieldCheckIcon';
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
    title: 'Warden',
    path: '/warden',
    moduleId: 'warden',
    icon: (
      <SvgIcon fontSize="small">
        <ShieldCheckIcon />
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
  // GPS demo: runs on local mock data, no moduleId so it is visible without a subscription module.
  {
    title: 'GPS',
    icon: (
      <SvgIcon fontSize="small">
        <SignalIcon />
      </SvgIcon>
    ),
    children: [
      {
        title: 'Mapa de flota',
        path: '/gps',
        icon: (
          <SvgIcon fontSize="small">
            <MapPinIcon />
          </SvgIcon>
        ),
      },
      {
        title: 'Viajes en ruta',
        path: '/gps/trips',
        icon: (
          <SvgIcon fontSize="small">
            <TruckIcon />
          </SvgIcon>
        ),
      },
      {
        title: 'Centro de alertas',
        path: '/gps/alerts',
        // Shows the number of open alerts next to the item.
        badgeKey: 'gpsAlerts',
        icon: (
          <SvgIcon fontSize="small">
            <BellAlertIcon />
          </SvgIcon>
        ),
      },
      {
        title: 'Reportes GPS',
        path: '/gps/reports',
        icon: (
          <SvgIcon fontSize="small">
            <ChartBarIcon />
          </SvgIcon>
        ),
      },
      {
        title: 'Dispositivos',
        path: '/gps/devices',
        icon: (
          <SvgIcon fontSize="small">
            <CpuChipIcon />
          </SvgIcon>
        ),
      },
    ],
  },
  {
    title: 'Clientes',
    allowedRoles: ['admin'],
    moduleId: 'clientes',
    icon: (
      <SvgIcon fontSize="small">
        <UserGroupIcon />
      </SvgIcon>
    ),
    children: [
      {
        title: 'Directorio',
        path: '/customers',
        icon: (
          <SvgIcon fontSize="small">
            <UsersIcon />
          </SvgIcon>
        ),
      },
      {
        title: 'Reportes',
        path: '/customers/reports',
        icon: (
          <SvgIcon fontSize="small">
            <DocumentChartBarIcon />
          </SvgIcon>
        ),
      },
    ],
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
