import { useCallback, useEffect, useRef, useState } from 'react';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import PropTypes from 'prop-types';
import ArrowLeftOnRectangleIcon from '@heroicons/react/24/solid/ArrowLeftOnRectangleIcon';
import BellIcon from '@heroicons/react/24/solid/BellIcon';
import ChevronDownIcon from '@heroicons/react/24/solid/ChevronDownIcon';
import ChevronLeftIcon from '@heroicons/react/24/solid/ChevronLeftIcon';
import ChevronRightIcon from '@heroicons/react/24/solid/ChevronRightIcon';
import ExclamationTriangleIcon from '@heroicons/react/24/solid/ExclamationTriangleIcon';
import {
  Avatar,
  Badge,
  Box,
  ButtonBase,
  Chip,
  Collapse,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Popover,
  Stack,
  SvgIcon,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import NextLinkComp from 'next/link';
import { Logo } from 'src/components/logo';
import { Scrollbar } from 'src/components/scrollbar';
import { items } from './config';
import { SideNavItem } from './side-nav-item';
import { useAuth } from 'src/hooks/use-auth';
import { useTranslation } from 'react-i18next';
import { getInitials } from 'src/utils/get-initials';
import { inventoryApi } from 'src/services/apiService';

export const SideNav = (props) => {
  const { open, onClose, collapsed, onToggleCollapse } = props;
  const pathname = usePathname();
  const lgUp = useMediaQuery((theme) => theme.breakpoints.up('lg'));
  const { t } = useTranslation();
  const auth = useAuth();
  const router = useRouter();

  // Notifications
  const [alerts, setAlerts] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const bellRef = useRef(null);

  // Which module groups are expanded
  const [openGroups, setOpenGroups] = useState({});

  useEffect(() => {
    inventoryApi
      .getAlerts()
      .then(setAlerts)
      .catch(() => {});
  }, []);

  // Auto-open the group that contains the active route
  useEffect(() => {
    items.forEach((item) => {
      if (item.children) {
        const hasActive = item.children.some((child) => child.path === pathname);
        if (hasActive) {
          setOpenGroups((prev) => ({ ...prev, [item.title]: true }));
        }
      }
    });
  }, [pathname]);

  const toggleGroup = useCallback((title) => {
    setOpenGroups((prev) => ({ ...prev, [title]: !prev[title] }));
  }, []);

  const handleSignOut = useCallback(() => {
    auth.signOut();
    router.push('/auth/login');
  }, [auth, router]);

  // Renders the full navigation list
  const renderNavItems = () => {
    const visibleItems = items.filter(
      (item) => !item.adminOnly || auth.user?.role === 'admin'
    );

    return visibleItems.flatMap((item) => {
      // ── Section divider (e.g. before coming-soon modules) ──
      const divider = item.sectionDivider && !collapsed
        ? [
            <li key={`${item.title}__divider`} style={{ listStyle: 'none' }}>
              <Divider sx={{ borderColor: 'neutral.700', my: 1 }} />
            </li>,
          ]
        : item.sectionDivider && collapsed
        ? [
            <li key={`${item.title}__divider`} style={{ listStyle: 'none' }}>
              <Divider sx={{ borderColor: 'neutral.700', my: 1 }} />
            </li>,
          ]
        : [];

      // ── Standalone leaf item (Inicio) ──
      if (!item.children && !item.comingSoon) {
        const active = pathname === item.path;
        return [
          ...divider,
          <SideNavItem
            key={item.title}
            active={active}
            collapsed={collapsed}
            icon={item.icon}
            path={item.path}
            title={t(item.title)}
          />,
        ];
      }

      // ── Coming-soon item ──
      if (item.comingSoon) {
        if (collapsed) {
          return [
            ...divider,
            <SideNavItem
              key={item.title}
              collapsed
              comingSoon
              icon={item.icon}
              title={item.title}
            />,
          ];
        }
        return [
          ...divider,
          <li key={item.title} style={{ listStyle: 'none' }}>
            <Box
              sx={{
                alignItems: 'center',
                borderRadius: 1,
                display: 'flex',
                justifyContent: 'flex-start',
                pl: '16px',
                pr: '12px',
                py: '6px',
                minHeight: 40,
                opacity: 0.45,
              }}
            >
              <Box
                component="span"
                sx={{ color: 'neutral.400', display: 'inline-flex', mr: 2 }}
              >
                {item.icon}
              </Box>
              <Box
                component="span"
                sx={{
                  color: 'neutral.400',
                  flexGrow: 1,
                  fontSize: 14,
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}
              >
                {item.title}
              </Box>
              <Chip
                label="Próximamente"
                size="small"
                sx={{
                  height: 18,
                  fontSize: 10,
                  fontWeight: 600,
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  color: 'neutral.400',
                  '& .MuiChip-label': { px: '6px' },
                }}
              />
            </Box>
          </li>,
        ];
      }

      // ── Group item with children ──
      if (item.children) {
        const visibleChildren = item.children.filter(
          (child) => !child.adminOnly || auth.user?.role === 'admin'
        );

        // Collapsed: show children as individual icons
        if (collapsed) {
          return [
            ...divider,
            ...visibleChildren.map((child) => {
              const active = pathname === child.path;
              return (
                <SideNavItem
                  key={child.title}
                  active={active}
                  collapsed
                  icon={child.icon}
                  path={child.path}
                  title={t(child.title)}
                />
              );
            }),
          ];
        }

        // Expanded: collapsible group header + children
        const isOpen = openGroups[item.title] ?? false;

        return [
          ...divider,
          <li key={item.title} style={{ listStyle: 'none' }}>
            {/* Group header */}
            <ButtonBase
              onClick={() => toggleGroup(item.title)}
              sx={{
                alignItems: 'center',
                borderRadius: 1,
                display: 'flex',
                justifyContent: 'flex-start',
                pl: '16px',
                pr: '12px',
                py: '6px',
                textAlign: 'left',
                width: '100%',
                minHeight: 40,
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.04)' },
              }}
            >
              <Box
                component="span"
                sx={{ color: 'neutral.400', display: 'inline-flex', mr: 2 }}
              >
                {item.icon}
              </Box>
              <Box
                component="span"
                sx={{
                  color: 'neutral.400',
                  flexGrow: 1,
                  fontSize: 14,
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}
              >
                {t(item.title)}
              </Box>
              <SvgIcon
                fontSize="small"
                sx={{
                  color: 'neutral.500',
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 200ms ease',
                }}
              >
                <ChevronDownIcon />
              </SvgIcon>
            </ButtonBase>

            {/* Children */}
            <Collapse in={isOpen} timeout={200}>
              <Stack
                component="ul"
                spacing={0.5}
                sx={{
                  listStyle: 'none',
                  p: 0,
                  m: 0,
                  pl: 2,
                  mt: 0.5,
                  borderLeft: '1px solid',
                  borderColor: 'neutral.700',
                  ml: '27px',
                }}
              >
                {visibleChildren.map((child) => {
                  const active = pathname === child.path;
                  return (
                    <SideNavItem
                      key={child.title}
                      active={active}
                      collapsed={false}
                      icon={child.icon}
                      path={child.path}
                      title={t(child.title)}
                    />
                  );
                })}
              </Stack>
            </Collapse>
          </li>,
        ];
      }

      return divider;
    });
  };

  const content = (
    <Scrollbar
      sx={{
        height: '100%',
        '& .simplebar-content': { height: '100%' },
        '& .simplebar-scrollbar:before': { background: 'neutral.400' },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

        {/* Header: logo + toggle button */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            px: collapsed ? 1 : 3,
            py: 2.5,
            minHeight: 64,
          }}
        >
          {!collapsed && (
            <Box
              component={NextLink}
              href="/"
              sx={{ display: 'block', width: 120 }}
            >
              <Logo />
            </Box>
          )}
          <Tooltip title={collapsed ? 'Mostrar sidebar' : 'Ocultar sidebar'} placement="right">
            <IconButton
              onClick={onToggleCollapse}
              size="small"
              sx={{
                color: 'neutral.400',
                '&:hover': { color: 'common.white', backgroundColor: 'rgba(255,255,255,0.08)' },
              }}
            >
              <SvgIcon fontSize="small">
                {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
              </SvgIcon>
            </IconButton>
          </Tooltip>
        </Box>

        <Divider sx={{ borderColor: 'neutral.700' }} />

        {/* Navigation */}
        <Box component="nav" sx={{ flexGrow: 1, px: collapsed ? 1 : 2, py: 3 }}>
          <Stack
            component="ul"
            spacing={0.5}
            sx={{ listStyle: 'none', p: 0, m: 0 }}
          >
            {renderNavItems()}
          </Stack>
        </Box>

        <Divider sx={{ borderColor: 'neutral.700' }} />

        {/* Notifications row */}
        <Box sx={{ px: collapsed ? 1 : 2, py: 1.5 }}>
          <Tooltip title={collapsed ? `Notificaciones${alerts.length ? ` (${alerts.length})` : ''}` : ''} placement="right">
            <Stack
              direction="row"
              alignItems="center"
              spacing={collapsed ? 0 : 1.5}
              justifyContent={collapsed ? 'center' : 'flex-start'}
              onClick={() => setNotifOpen(true)}
              ref={bellRef}
              sx={{
                cursor: 'pointer',
                borderRadius: 1,
                px: collapsed ? 0 : 1,
                py: 0.75,
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.04)' },
              }}
            >
              <Badge badgeContent={alerts.length || 0} color="error" max={99}>
                <SvgIcon fontSize="small" sx={{ color: alerts.length ? 'warning.light' : 'neutral.400' }}>
                  <BellIcon />
                </SvgIcon>
              </Badge>
              {!collapsed && (
                <Typography variant="body2" sx={{ color: 'neutral.400', fontWeight: 600, fontSize: 14 }}>
                  Notificaciones
                </Typography>
              )}
            </Stack>
          </Tooltip>
        </Box>

        <Divider sx={{ borderColor: 'neutral.700' }} />

        {/* User info + logout */}
        <Box sx={{ px: collapsed ? 1 : 2, py: 2 }}>
          <Stack
            direction={collapsed ? 'column' : 'row'}
            alignItems="center"
            spacing={collapsed ? 1 : 1.5}
          >
            <Tooltip title={collapsed ? (auth.user?.name || 'Usuario') : ''} placement="right">
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: 'primary.main',
                  fontSize: 13,
                  flexShrink: 0,
                  cursor: 'default',
                }}
              >
                {getInitials(auth.user?.name || 'U')}
              </Avatar>
            </Tooltip>
            {!collapsed && (
              <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                <Typography variant="subtitle2" color="common.white" noWrap>
                  {auth.user?.name || 'Usuario'}
                </Typography>
                <Typography variant="caption" sx={{ color: 'neutral.400' }} noWrap display="block">
                  {auth.user?.email || ''}
                </Typography>
              </Box>
            )}
            <Tooltip title="Cerrar sesión" placement="right">
              <IconButton
                onClick={handleSignOut}
                size="small"
                sx={{ color: 'neutral.400', '&:hover': { color: 'common.white' }, flexShrink: 0 }}
              >
                <SvgIcon fontSize="small">
                  <ArrowLeftOnRectangleIcon />
                </SvgIcon>
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
      </Box>
    </Scrollbar>
  );

  const drawerWidth = collapsed ? 72 : 280;

  const drawerSx = {
    backgroundColor: 'neutral.800',
    color: 'common.white',
    width: drawerWidth,
    transition: 'width 200ms ease',
    overflowX: 'hidden',
  };

  return (
    <>
      {lgUp ? (
        <Drawer
          anchor="left"
          open
          PaperProps={{ sx: drawerSx }}
          variant="permanent"
        >
          {content}
        </Drawer>
      ) : (
        <Drawer
          anchor="left"
          onClose={onClose}
          open={open}
          PaperProps={{ sx: { backgroundColor: 'neutral.800', color: 'common.white', width: 280 } }}
          sx={{ zIndex: (theme) => theme.zIndex.appBar + 100 }}
          variant="temporary"
        >
          {content}
        </Drawer>
      )}

      {/* Notifications Popover */}
      <Popover
        open={notifOpen}
        anchorEl={bellRef.current}
        onClose={() => setNotifOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        PaperProps={{ sx: { width: 340, maxHeight: 480 } }}
      >
        <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="subtitle1">Notificaciones</Typography>
          {alerts.length > 0 && (
            <Chip label={`${alerts.length} alerta${alerts.length !== 1 ? 's' : ''}`} color="error" size="small" />
          )}
        </Box>
        <Divider />
        {alerts.length === 0 ? (
          <Box sx={{ px: 2, py: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Sin notificaciones pendientes
            </Typography>
          </Box>
        ) : (
          <>
            <List disablePadding sx={{ maxHeight: 340, overflowY: 'auto' }}>
              {alerts.map((alert) => (
                <ListItem key={alert.id} divider sx={{ py: 1.5, gap: 1.5 }}>
                  <SvgIcon fontSize="small" sx={{ color: 'warning.main', flexShrink: 0 }}>
                    <ExclamationTriangleIcon />
                  </SvgIcon>
                  <ListItemText
                    primary={
                      <Typography variant="body2" fontWeight={600} noWrap>
                        {alert.name}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        Stock actual: <strong>{alert.currentStock}</strong> / Mínimo: {alert.minStock}
                        {alert.categoryName && ` · ${alert.categoryName}`}
                      </Typography>
                    }
                  />
                  <Chip
                    label={`-${alert.deficit ?? (alert.minStock - alert.currentStock)}`}
                    color="error"
                    size="small"
                    variant="outlined"
                    sx={{ flexShrink: 0 }}
                  />
                </ListItem>
              ))}
            </List>
            <Divider />
            <Box sx={{ p: 1 }}>
              <Typography
                component={NextLinkComp}
                href="/alerts"
                onClick={() => setNotifOpen(false)}
                variant="body2"
                sx={{
                  display: 'block',
                  textAlign: 'center',
                  py: 0.75,
                  color: 'primary.main',
                  textDecoration: 'none',
                  borderRadius: 1,
                  '&:hover': { backgroundColor: 'action.hover' },
                }}
              >
                Ver todas las alertas →
              </Typography>
            </Box>
          </>
        )}
      </Popover>
    </>
  );
};

SideNav.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
  collapsed: PropTypes.bool,
  onToggleCollapse: PropTypes.func,
};
