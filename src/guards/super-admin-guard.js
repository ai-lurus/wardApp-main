import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import { useAuthContext } from 'src/contexts/auth-context';

export const SuperAdminGuard = (props) => {
  const { children } = props;
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAuthContext();
  const ignore = useRef(false);
  const [checked, setChecked] = useState(false);

  useEffect(
    () => {
      if (!router.isReady || isLoading) {
        return;
      }

      // Prevent from calling twice in development mode with React.StrictMode enabled
      if (ignore.current) {
        return;
      }

      ignore.current = true;

      if (!isAuthenticated) {
        console.log('Not authenticated in SuperAdminGuard, redirecting to login');
        router
          .replace({
            pathname: '/auth/login',
            query: router.asPath !== '/' ? { continueUrl: router.asPath } : undefined
          })
          .catch(console.error);
      } else if (user?.role !== 'super_admin') {
        console.log('User is not a super_admin, redirecting to home');
        router
          .replace('/')
          .catch(console.error);
      } else {
        setChecked(true);
      }
    },
    [router.isReady, isAuthenticated, user, isLoading, router]
  );

  if (!checked) {
    return null;
  }

  // If got here, it means that the redirect did not occur, and that tells us that the user is
  // authenticated / authorized.

  return children;
};

SuperAdminGuard.propTypes = {
  children: PropTypes.node
};
