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
        icon: (
          <SvgIcon fontSize="small">
            <DocumentChartBarIcon />
          </SvgIcon>
        ),
      },
      {
        title: 'Mapa de almacén',
        path: '/warehouse',
        icon: (
          <SvgIcon fontSize="small">
            <MapIcon />
          </SvgIcon>
        ),
      },
    ],
  },
  // --- Coming-soon modules ---
  {
    title: 'Operaciones',
    comingSoon: true,
    sectionDivider: true, // renders a divider before this item
    icon: (
      <SvgIcon fontSize="small">
        <TruckIcon />
      </SvgIcon>
    ),
  },
  {
    title: 'Flotas',
    comingSoon: true,
    icon: (
      <SvgIcon fontSize="small">
        <WrenchIcon />
      </SvgIcon>
    ),
  },
  {
    title: 'Clientes',
    comingSoon: true,
    icon: (
      <SvgIcon fontSize="small">
        <UserGroupIcon />
      </SvgIcon>
    ),
  },
  {
    title: 'Finanzas',
    comingSoon: true,
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
        icon: (
          <SvgIcon fontSize="small">
            <UsersIcon />
          </SvgIcon>
        ),
      },
    ],
  },
];
