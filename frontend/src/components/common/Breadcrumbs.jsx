import React from 'react';
import { Breadcrumbs as MuiBreadcrumbs, Link, Typography } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Capitalize word function
  const formatName = (name) => {
    return name
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <MuiBreadcrumbs 
      separator={<NavigateNextIcon fontSize="small" />} 
      aria-label="breadcrumb"
      sx={{ mb: 2 }}
    >
      <Link 
        component={RouterLink} 
        underline="hover" 
        color="inherit" 
        to="/"
        sx={{ display: 'flex', alignItems: 'center' }}
      >
        Dashboard
      </Link>
      {pathnames.map((value, index) => {
        const last = index === pathnames.length - 1;
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;

        // Don't show "dashboard" twice if it's the root path
        if (value.toLowerCase() === 'dashboard') return null;

        return last ? (
          <Typography color="text.primary" key={to}>
            {formatName(value)}
          </Typography>
        ) : (
          <Link 
            component={RouterLink} 
            underline="hover" 
            color="inherit" 
            to={to} 
            key={to}
          >
            {formatName(value)}
          </Link>
        );
      })}
    </MuiBreadcrumbs>
  );
};

export default Breadcrumbs;
