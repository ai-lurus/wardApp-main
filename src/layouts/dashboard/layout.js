import { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Box } from '@mui/material';
import { withAuthGuard } from 'src/hocs/with-auth-guard';
import { SideNav } from './side-nav';
import { TopNav } from './top-nav';

const SIDE_NAV_WIDTH = 280;
const SIDE_NAV_COLLAPSED_WIDTH = 72;

export const Layout = withAuthGuard((props) => {
  const { children } = props;
  const pathname = usePathname();
  const [openNav, setOpenNav] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Restore collapsed state from localStorage (client-side only)
  useEffect(() => {
    const saved = localStorage.getItem('sideNavCollapsed');
    if (saved === 'true') setCollapsed(true);
  }, []);

  // Close mobile drawer on navigation
  useEffect(() => {
    if (openNav) setOpenNav(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const handleToggleCollapse = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('sideNavCollapsed', String(next));
      return next;
    });
  }, []);

  const sideNavWidth = collapsed ? SIDE_NAV_COLLAPSED_WIDTH : SIDE_NAV_WIDTH;

  return (
    <>
      <TopNav onNavOpen={() => setOpenNav(true)} />
      <SideNav
        onClose={() => setOpenNav(false)}
        open={openNav}
        collapsed={collapsed}
        onToggleCollapse={handleToggleCollapse}
      />
      <Box
        sx={{
          display: 'flex',
          flex: '1 1 auto',
          flexDirection: 'column',
          maxWidth: '100%',
          transition: 'padding-left 200ms ease',
          paddingLeft: { lg: `${sideNavWidth}px` },
        }}
      >
        {children}
      </Box>
    </>
  );
});
