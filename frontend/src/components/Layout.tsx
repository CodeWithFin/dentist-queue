import { Outlet, useLocation, Link } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Container,
} from '@mui/material';
import { LocalHospital } from '@mui/icons-material';

const Layout = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname.startsWith(path);

  const navLinks = [
    { path: '/check-in', label: 'Check-In' },
    { path: '/reception', label: 'Reception' },
    { path: '/dentist', label: 'Dentist' },
    { path: '/display', label: 'Display' },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar 
        position="static" 
        elevation={0}
        sx={{
          backgroundColor: '#1d1d1f',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Toolbar 
          sx={{ 
            minHeight: '44px !important',
            height: '44px',
            px: { xs: 2, sm: 4 },
            justifyContent: 'center',
          }}
        >
          {/* Logo on the left */}
          <Box
            component={Link}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: 'inherit',
              mr: 4,
            }}
          >
            <LocalHospital 
              sx={{ 
                fontSize: 18,
                color: '#f5f5f7',
              }} 
            />
          </Box>

          {/* Navigation links - centered */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              flexGrow: 1,
              justifyContent: 'center',
            }}
          >
            {navLinks.map((link) => (
              <Typography
                key={link.path}
                component={Link}
                to={link.path}
                sx={{
                  fontSize: '12px',
                  fontWeight: 400,
                  color: isActive(link.path) ? '#f5f5f7' : '#86868b',
                  textDecoration: 'none',
                  transition: 'color 0.2s ease',
                  '&:hover': {
                    color: '#f5f5f7',
                  },
                  letterSpacing: '-0.01em',
                }}
              >
                {link.label}
              </Typography>
            ))}
          </Box>
        </Toolbar>
      </AppBar>
      <Container maxWidth={false} sx={{ flexGrow: 1, py: 4 }}>
        <Outlet />
      </Container>
    </Box>
  );
};

export default Layout;

