import { Outlet, useLocation, Link } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
} from '@mui/material';
import { Home, Person, Dashboard, Tv, CalendarMonth } from '@mui/icons-material';

const Layout = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" elevation={2}>
        <Toolbar>
          <IconButton
            component={Link}
            to="/"
            edge="start"
            color="inherit"
            sx={{ mr: 2 }}
          >
            <Home />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Dentist Queue Management
          </Typography>
          <Button
            component={Link}
            to="/book"
            color="inherit"
            startIcon={<CalendarMonth />}
            sx={{
              backgroundColor: isActive('/book') ? 'rgba(255,255,255,0.1)' : 'transparent',
            }}
          >
            Book Appointment
          </Button>
          <Button
            component={Link}
            to="/check-in"
            color="inherit"
            startIcon={<Person />}
            sx={{
              ml: 1,
              backgroundColor: isActive('/check-in') ? 'rgba(255,255,255,0.1)' : 'transparent',
            }}
          >
            Check-In
          </Button>
          <Button
            component={Link}
            to="/reception"
            color="inherit"
            startIcon={<Dashboard />}
            sx={{
              ml: 1,
              backgroundColor: isActive('/reception') ? 'rgba(255,255,255,0.1)' : 'transparent',
            }}
          >
            Reception
          </Button>
          <Button
            component={Link}
            to="/dentist"
            color="inherit"
            startIcon={<Dashboard />}
            sx={{
              ml: 1,
              backgroundColor: isActive('/dentist') ? 'rgba(255,255,255,0.1)' : 'transparent',
            }}
          >
            Dentist
          </Button>
          <Button
            component={Link}
            to="/display"
            color="inherit"
            startIcon={<Tv />}
            sx={{
              ml: 1,
              backgroundColor: isActive('/display') ? 'rgba(255,255,255,0.1)' : 'transparent',
            }}
          >
            Display
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth={false} sx={{ flexGrow: 1, py: 4 }}>
        <Outlet />
      </Container>
    </Box>
  );
};

export default Layout;

