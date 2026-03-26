import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { Box, Button, Container, Typography } from '@mui/material';
import { useAuth } from 'src/hooks/use-auth';

const ACTIVE_STATUSES = ['active', 'trialing'];

/**
 * Blocks access to a page if the user's company doesn't have an active subscription.
 * Shows a paywall screen and redirects to /billing.
 */
export const SubscriptionGuard = ({ children, moduleId = 'inventario' }) => {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const ignore = useRef(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!router.isReady || isLoading) return;
    if (ignore.current) return;
    ignore.current = true;

    const status = user?.company?.subscription_status;
    const modules = user?.company?.active_modules || [];
    const hasAccess = ACTIVE_STATUSES.includes(status) && modules.includes(moduleId);

    if (hasAccess) {
      setChecked(true);
    } else {
      router.replace('/billing').catch(console.error);
    }
  }, [router.isReady, isLoading]);

  if (!checked) return null;

  return children;
};
