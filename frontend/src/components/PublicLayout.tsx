import { Outlet, Link } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
} from '@mui/material';
import { Home, CalendarMonth, LocalHospital } from '@mui/icons-material';

const PublicLayout = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" elevation={2}>
        <Toolbar>
          <LocalHospital sx={{ mr: 2, fontSize: 40 }} />
          <Typography variant="h5" component="div" sx={{ flexGrow: 1 }}>
            Your Dental Clinic
          </Typography>
          <Button
            component={Link}
            to="/book"
            color="inherit"
            startIcon={<CalendarMonth />}
            sx={{ ml: 1 }}
          >
            Book Appointment
          </Button>
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
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? theme.palette.grey[200]
              : theme.palette.grey[800],
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            © 2025 Your Dental Clinic. All rights reserved.
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
            📞 Contact us: +1 (555) 123-4567 | 📧 info@dentalclinic.com
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default PublicLayout;

