import NextLink from 'next/link';
import PropTypes from 'prop-types';
import { Box, ButtonBase, Tooltip } from '@mui/material';

export const SideNavItem = (props) => {
  const {
    active = false,
    collapsed = false,
    comingSoon = false,
    disabled,
    external,
    icon,
    path,
    title,
  } = props;

  const linkProps =
    path && !comingSoon
      ? external
        ? { component: 'a', href: path, target: '_blank' }
        : { component: NextLink, href: path }
      : {};

  const button = (
    <ButtonBase
      sx={{
        alignItems: 'center',
        borderRadius: 1,
        display: 'flex',
        justifyContent: collapsed ? 'center' : 'flex-start',
        pl: collapsed ? 0 : '16px',
        pr: collapsed ? 0 : '16px',
        py: '6px',
        textAlign: 'left',
        width: '100%',
        minHeight: 40,
        opacity: comingSoon ? 0.45 : 1,
        cursor: comingSoon ? 'default' : 'pointer',
        ...(active && !comingSoon && { backgroundColor: 'rgba(255, 255, 255, 0.04)' }),
        '&:hover': comingSoon ? {} : { backgroundColor: 'rgba(255, 255, 255, 0.04)' },
      }}
      disableRipple={comingSoon}
      {...linkProps}
    >
      {icon && (
        <Box
          component="span"
          sx={{
            alignItems: 'center',
            color: 'neutral.400',
            display: 'inline-flex',
            justifyContent: 'center',
            mr: collapsed ? 0 : 2,
            ...(active && !comingSoon && { color: 'primary.main' }),
          }}
        >
          {icon}
        </Box>
      )}
      {!collapsed && (
        <Box
          component="span"
          sx={{
            color: 'neutral.400',
            flexGrow: 1,
            fontFamily: (theme) => theme.typography.fontFamily,
            fontSize: 14,
            fontWeight: 600,
            lineHeight: '24px',
            whiteSpace: 'nowrap',
            ...(active && !comingSoon && { color: 'common.white' }),
            ...(disabled && { color: 'neutral.500' }),
          }}
        >
          {title}
        </Box>
      )}
    </ButtonBase>
  );

  const tooltipTitle = comingSoon
    ? `${title} · Próximamente`
    : collapsed
    ? title
    : '';

  if (collapsed || comingSoon) {
    return (
      <li>
        <Tooltip title={tooltipTitle} placement="right">
          {/* span wrapper needed for Tooltip on disabled elements */}
          <span style={{ display: 'block' }}>{button}</span>
        </Tooltip>
      </li>
    );
  }

  return <li>{button}</li>;
};

SideNavItem.propTypes = {
  active: PropTypes.bool,
  collapsed: PropTypes.bool,
  comingSoon: PropTypes.bool,
  disabled: PropTypes.bool,
  external: PropTypes.bool,
  icon: PropTypes.node,
  path: PropTypes.string,
  title: PropTypes.string.isRequired,
};
