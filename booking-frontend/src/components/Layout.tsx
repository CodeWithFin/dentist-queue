import { Outlet, Link } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Container,
} from '@mui/material';
import { LocalHospital } from '@mui/icons-material';

const Layout = () => {
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
            justifyContent: 'space-between',
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
            }}
          >
            <LocalHospital 
              sx={{ 
                fontSize: 18,
                color: '#f5f5f7',
              }} 
            />
          </Box>

          {/* Title - centered */}
          <Typography
            variant="body2"
            sx={{
              fontSize: '12px',
              fontWeight: 400,
              color: '#f5f5f7',
              letterSpacing: '-0.01em',
            }}
          >
            Book Your Appointment
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth={false} sx={{ flexGrow: 1, py: 0 }}>
        <Outlet />
      </Container>
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: '#f5f5f7',
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center" sx={{ color: '#86868b' }}>
            © 2025 Your Dental Clinic. All rights reserved.
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1, color: '#86868b' }}>
            📞 Contact us: +1 (555) 123-4567 | 📧 info@dentalclinic.com
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;


