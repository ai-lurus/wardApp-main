import PropTypes from 'prop-types';
import Bars3Icon from '@heroicons/react/24/solid/Bars3Icon';
import {
  Box,
  IconButton,
  Stack,
  SvgIcon,
  Typography,
  useMediaQuery
} from '@mui/material';

const SIDE_NAV_WIDTH = 280;

export const TopNav = (props) => {
  const { onNavOpen } = props;
  const lgUp = useMediaQuery((theme) => theme.breakpoints.up('lg'));

  // On desktop the sidebar is always visible — no topnav needed
  if (lgUp) return null;

  // On mobile: minimal bar with just the hamburger to open the sidebar
  return (
    <Box
      component="header"
      sx={{
        backgroundColor: 'neutral.800',
        position: 'sticky',
        top: 0,
        zIndex: (theme) => theme.zIndex.appBar,
      }}
    >
      <Stack
        alignItems="center"
        direction="row"
        spacing={1}
        sx={{ minHeight: 56, px: 2 }}
      >
        <IconButton onClick={onNavOpen} sx={{ color: 'common.white' }}>
          <SvgIcon fontSize="small">
            <Bars3Icon />
          </SvgIcon>
        </IconButton>
        <Typography color="common.white" variant="subtitle1">
          Ward
        </Typography>
      </Stack>
    </Box>
  );
};

TopNav.propTypes = {
  onNavOpen: PropTypes.func
};
