import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import AppointmentBookingPage from './pages/AppointmentBookingPage';
import Layout from './components/Layout';

function App() {
  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<AppointmentBookingPage />} />
          <Route path="book" element={<AppointmentBookingPage />} />
        </Route>
      </Routes>
    </Box>
  );
}

export default App;


