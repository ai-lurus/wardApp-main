import { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Box } from '@mui/material';
import { withAuthGuard } from 'src/hocs/with-auth-guard';
import { WardenProvider } from 'src/contexts/warden-context';
import { useWardenStream } from 'src/hooks/use-warden-stream';
import { useAuth } from 'src/hooks/use-auth';
import AiBar from 'src/sections/warden/ai-bar';
import WardenPanel from 'src/sections/warden/warden-panel';
import { SideNav } from './side-nav';
import { TopNav } from './top-nav';

const SIDE_NAV_WIDTH = 280;
const SIDE_NAV_COLLAPSED_WIDTH = 72;

function LayoutInner({ children, openNav, setOpenNav, collapsed, handleToggleCollapse, sideNavWidth }) {
  const { sendMessage, status } = useWardenStream();
  const { user } = useAuth();
  const pathname = usePathname();
  const isWardenPage = pathname === '/warden';
  const wardenActive = (user?.company?.active_modules ?? []).includes('warden');

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
        {wardenActive && !isWardenPage && <AiBar onSend={sendMessage} />}
        {children}
      </Box>
      {wardenActive && <WardenPanel onSend={sendMessage} streamStatus={status} />}
    </>
  );
}

export const Layout = withAuthGuard((props) => {
  const { children } = props;
  const pathname = usePathname();
  const [openNav, setOpenNav] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('sideNavCollapsed');
    if (saved === 'true') setCollapsed(true);
  }, []);

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
    <WardenProvider>
      <LayoutInner
        openNav={openNav}
        setOpenNav={setOpenNav}
        collapsed={collapsed}
        handleToggleCollapse={handleToggleCollapse}
        sideNavWidth={sideNavWidth}
      >
        {children}
      </LayoutInner>
    </WardenProvider>
  );
});
